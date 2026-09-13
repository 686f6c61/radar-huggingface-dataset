# shadowtec/Audio8-ASR-0.1B-RK3576-RKNN

## Resumen

Audio8-ASR-0.1B-RK3576-RKNN es un paquete de despliegue (no un modelo nuevo) publicado por el usuario shadowtec que adapta el modelo de reconocimiento automatico del habla Edge0/Audio8-ASR-0.1B al NPU del SoC Rockchip RK3576. Se distribuye en formato RKNN con grafos en FP16 y un runtime de placa en Python que orquesta la inferencia de principio a fin. El repositorio ocupa 2,1 GB e incluye encoder de audio, adaptadores, grafos de prefill y decodificador por capas, cabezas de salida troceadas y la tabla de embeddings del decodificador en FP32.

El modelo base es un ASR autorregresivo de aproximadamente 0,1 mil millones de parametros: un encoder de audio seguido de una torre MLP y un proyector que alimentan un decodificador de lenguaje tipo Qwen2 de 8 capas, tamano oculto 512 y 8 cabezas de atencion/KV con dimension de cabeza 64. La innovacion del paquete no esta en el modelo, sino en la ingenieria de despliegue: RKNN exige formas estaticas, asi que se emula la DynamicCache del modelo original mediante capacidades de cache de 128, 256 y 512 posiciones, con migracion de la K/V valida a un buffer en CPU cuando se llena.

Es relevante ahora porque demuestra inferencia ASR completa, sin salir del dispositivo, sobre un NPU de gama baja con resultados token a token identicos a la referencia PyTorch en FP32 y un RTF entre 0,543 y 0,843 en audio de 2 a 8 segundos. Aun asi, el repositorio tiene 0 descargas y 0 likes, y no sustituye al snapshot original: config, tokenizer y processor deben descargarse del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ASR autorregresivo: encoder de audio + torre MLP/proyector + decodificador de lenguaje tipo Qwen2 (transformer denso) |
| Parametros totales | Aproximadamente 0,1 mil millones (segun la denominacion del modelo; cifra exacta no disponible) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No se declara una ventana de contexto en tokens; la cache K/V del decodificador soporta capacidades de 128, 256 y 512 posiciones, y los grafos de prefill llegan a S110 |
| Tipos de cuantizacion | Grafos RKNN en FP16; tabla de embeddings del decodificador en FP32; cache K/V gestionada en CPU en FP32. No se ofrecen variantes INT8, GGUF ni cuantizaciones de pesos alternativas |
| Idiomas soportados | No disponible (no se declara en la informacion proporcionada) |
| Licencia | other (se aplica ademas la licencia del modelo base Edge0/Audio8-ASR-0.1B) |
| Formato de pesos | RKNN (encoder, adaptadores, prefill, bloques de decodificador y cabezas) y .npy FP32 para token_embeddings_fp32.npy |
| Decodificador de lenguaje | 8 capas, hidden size 512, 8 cabezas de atencion/KV, head dim 64 |
| Duraciones de audio soportadas | Buckets estaticos de 2, 4, 6 y 8 segundos |
| Libreria declarada | rknn (RKNN Lite2 / Runtime 2.3.2) |
| Modelo base | Edge0/Audio8-ASR-0.1B |
| Tamano del repositorio | 2,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El pipeline de inferencia es completamente autorregresivo y se reparte entre CPU y NPU. La CPU realiza el preprocesado de caracteristicas mel y genera los tensores de entrada (`input_features.npy`, `input_ids.npy`, `audio_positions.npy`, `rotary_inv_freq.npy`) con el processor y la plantilla de prompt del modelo original. El NPU ejecuta, en este orden: encoder de audio, torre MLP de audio mas proyector, prefill de Qwen2 (que devuelve logits y la K/V inicial) y decodificacion repetida de tokens hasta el token EOS. La CPU solo se encarga de la asignacion y actualizacion de la cache, el RoPE, la preparacion de la mascara de atencion, la busqueda de embeddings y el argmax; todas las capas neuronales permanecen en grafos RKNN.

La parte tecnica destacable es la gestion de la cache. Como RKNN solo admite formas estaticas y el modelo original usa DynamicCache, el runtime reproduce ese comportamiento con capacidades de cache 128, 256 y 512: cuando la cache se llena, copia unicamente la region valida de K/V a un buffer mayor en CPU y selecciona el grafo estatico correspondiente (`block_s128`, `block_s256`, `block_s512`). No hay Concat ni ScatterND dentro de los grafos ni cache persistente propiedad del runtime. Los grafos estan troceados por capa (layer0..layer7) y las cabezas de salida en 8 shards. No se proporciona informacion sobre el dataset de entrenamiento, el numero de tokens vistos, ni si hubo RLHF o DPO: esos datos pertenecen al modelo base y no aparecen en la informacion disponible.

## Capacidades

- Reconocimiento automatico del habla en modo offline: transcripcion de audio corto (2, 4, 6 y 8 segundos) mediante decodificacion autorregresiva hasta EOS.
- Inferencia integra en NPU: encoder, adaptador, prefill y decodificador en grafos RKNN, sin dependencia de GPU ni de nube.
- Reproduccion exacta de la referencia: en las pruebas del autor, cada salida fue identica token a token a la referencia PyTorch CPU FP32 con decodificacion greedy.
- Seleccion de bucket por duracion: adaptadores T25/T50/T75/T100 y grafos de prefill S35/S60/S85/S110 emparejados con 25, 50, 75 y 100 placeholders de audio respectivamente.
- Gestion de cache dinamica emulada en hardware estatico, con migraciones 128 a 256 y 256 a 512.
- Modo de validacion de scheduler con `--ignore-eos`, pensado exclusivamente para pruebas de estres y no para transcripcion real.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio de entrada mas alla de la transcripcion, ni soporte multilingue explicito.

## Casos de uso

- Transcripcion local en dispositivos con RK3576: el modelo procesa clips de 2 a 8 segundos integramente en el NPU, con un RTF de 0,543 a 0,843, lo que permite transcribir en tiempo casi real sin conexion y sin enviar audio a un servidor.
- Notas de voz y mensajeria corta: los buckets de 2 y 4 segundos (1231,49 ms y 3371,87 ms de extremo a extremo) encajan con mensajes de voz breves en aplicaciones moviles o de escritorio sobre hardware embebido.
- Comandos de voz en electrodomesticos y kioscos: al ejecutarse sobre un SoC de bajo consumo y con un RSS inferior a 1,3 GiB, puede embeberse en terminales de atencion, paneles de control o sistemas de domotica que requieran dictado puntual.
- Porteros electronicos y sistemas de intercomunicacion: clips de 2 a 4 segundos son el caso tipico de un aviso de visitante; la transcripcion en el propio dispositivo evita exponer conversaciones a terceros.
- Verificacion y regresion de pipelines de despliegue: dado que la salida es identica a la referencia FP32, este paquete sirve como referencia de aceptacion para validar conversiones RKNN propias o portes a otros NPU.
- Pruebas de estres de planificadores de cache: la prueba con `--ignore-eos` ejecuta 180 pasos de decodificador forzando las transiciones 128 a 256 y 256 a 512, util para validar la logica de migracion de K/V antes de llevarla a produccion.
- Procesamiento con requisitos de privacidad o entornos aislados: industria, sanidad o instalaciones sin conectividad pueden transcribir ordenes y notas localmente, con el audio sin salir del equipo.

## Benchmarks y rendimiento

El autor publica un benchmark de placa ejecutado sobre RK3576, con prefill y decodificacion RKNN reales hasta EOS. La salida fue token a token identica a la referencia PyTorch CPU FP32 greedy, por lo que la comparacion NPU frente a FP32 da un CER/WER del 0 %/0 % (es una medida de equivalencia numerica, no de calidad absoluta del reconocimiento).

| Audio | Longitud de prefill | Capacidad de KV usada | E2E neuronal en regimen estable | RTF | RSS final |
|---:|---:|---|---:|---:|---:|
| 2 s | 35 | 128 | 1231,49 ms | 0,616 | 1113,15 MiB |
| 4 s | 60 | 128 | 3371,87 ms | 0,843 | 1114,12 MiB |
| 6 s | 85 | 128 | 4116,86 ms | 0,686 | 1116,10 MiB |
| 8 s | 110 | 128 a 256 | 4344,29 ms | 0,543 | 1232,23 MiB |

El tiempo E2E incluye encoder, adaptador, prefill, llamadas al decodificador RKNN, escrituras de K/V en CPU y cualquier migracion de cache; excluye la carga del modelo y la inicializacion del runtime. No se desglosa el tiempo de transferencia DMA, H2D o D2H, ya que la medicion de `inference()` de RKNN Lite agrega transferencia de buffers, trabajo del NPU y sincronizacion.

Prueba adicional de estres con EOS ignorado: 180 pasos de decodificador partiendo de un prefill real de 6 segundos, con transiciones 128 a 256 y 256 a 512. Los 181 tokens del NPU coincidieron con FP32, las copias de cache costaron 11,21 ms y 34,70 ms respectivamente, y el RSS final fue de 1379,02 MiB. El autor advierte que esta prueba valida la planificacion de cache, no la calidad del texto mas alla de EOS. No se han publicado en la informacion disponible resultados sobre juegos de evaluacion estandar tipo MMLU, HumanEval, GSM8K, LibriSpeech o Common Voice.

## Requisitos de hardware

- NPU Rockchip RK3576 obligatorio: los grafos RKNN se ejecutan en el NPU del SoC; no hay ruta de ejecucion para GPU NVIDIA o AMD ni para CPU sola.
- Controlador y runtime: RKNPU driver 0.9.8 y RKNN Lite2 / Runtime 2.3.2, con Python 3, numpy y `rknnlite.api`.
- Memoria: RSS final en placa de 1113,15 MiB a 1232,23 MiB en operacion normal, y 1379,02 MiB en la prueba de estres con cache de 512. No se declara VRAM porque no se usa GPU.
- GPU de consumo: no aplica; este paquete no esta pensado para RTX 4090, A100, H100 ni similares. Para esas plataformas habria que usar el snapshot original en PyTorch.
- Opciones de despliegue: runtime de placa incluido (`runtime/board_run_end_to_end_dynamic_buckets.py` y `runtime/requirements-rk3576.txt`), instalado junto al arbol de modelo en la ruta esperada por las constantes del script. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este formato.
- Latencia y throughput: tiempos E2E de 1231,49 ms (2 s de audio), 3371,87 ms (4 s), 4116,86 ms (6 s) y 4344,29 ms (8 s), con RTF de 0,616, 0,843, 0,686 y 0,543 respectivamente.
- Almacenamiento: 2,1 GB para el repositorio, mas el snapshot del modelo base necesario para config, tokenizer y processor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Formato y destino | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| shadowtec/Audio8-ASR-0.1B-RK3576-RKNN | Aproximadamente 0,1 B (cifra exacta no disponible) | Cache K/V de 128 a 512 posiciones; audio de 2 a 8 s | RKNN FP16 para NPU RK3576 | other (mas licencia del modelo base) | RTF 0,543-0,843; CER/WER 0 % frente a FP32 |
| Edge0/Audio8-ASR-0.1B (modelo base) | Aproximadamente 0,1 B | DynamicCache, sin limite estatico declarado en la informacion disponible | PyTorch / safetensors (no confirmado en la informacion proporcionada) | No disponible | No disponible |
| Alternativas ASR de ~0,1 B (por ejemplo, familias Whisper tiny/base) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |
| Alternativas ASR de mayor tamano (por ejemplo, Whisper small/medium, Qwen2-Audio) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada solo permite comparar el paquete RKNN con su modelo base en terminos de formato de despliegue y de equivalencia numerica. No hay datos de benchmarks comparativos frente a otros sistemas ASR, por lo que cualquier comparacion de calidad con Whisper u otras alternativas queda como no disponible.

## Limitaciones y advertencias

- No es un modelo autonomo: el repositorio no incluye los pesos originales, la configuracion, el tokenizer ni el processor. Hay que descargar el snapshot de Edge0/Audio8-ASR-0.1B por separado para el preprocesado en host y la validacion.
- Limite de duracion: solo hay buckets estaticos para 2, 4, 6 y 8 segundos de audio. No se documenta soporte para audio mas largo, streaming ni segmentacion automatica.
- Los adaptadores no son intercambiables entre duraciones: usar el adaptador T100 recortando los primeros N valores para un prompt mas corto altera la semantica de adaptive pooling del modelo original y produce resultados incorrectos.
- `--ignore-eos` no debe usarse para transcripcion dirigida a usuarios; solo para pruebas de estres del scheduler de cache.
- La licencia es "other" y se suma a la del modelo base. No se especifican en la informacion disponible los terminos exactos ni si se permite uso comercial, por lo que hay que consultar ambas licencias antes de desplegar en produccion.
- Idiomas soportados no declarados: no se puede asumir cobertura multilingue ni un rendimiento concreto en castellano.
- Calidad ASR no evaluada con metricas absolutas: el 0 % de CER/WER es una comparacion contra la referencia FP32 del propio modelo, no una medida de acierto sobre habla real con ruido, acentos o solapamiento de hablantes.
- Riesgo de alucinacion inherente a la decodificacion autorregresiva: al generar tokens hasta EOS, el modelo puede producir texto plausible no presente en el audio, especialmente en segmentos silenciosos o con ruido.
- Dependencia estricta de hardware y versiones: RK3576 con RKNPU driver 0.9.8 y RKNN Lite2 2.3.2. Otras versiones o SoC Rockchip pueden no ser compatibles.
- Rutas de despliegue rigidas: el runtime espera el arbol de modelo y el directorio `runtime/` en la raiz de despliegue usada por sus constantes, o bien hay que modificar dichas rutas.
- Documentacion de aceptacion y arquitectura solo en chino (`docs/benchmark-and-acceptance.zh-CN.md` y `docs/architecture-and-operation.zh-CN.md`), lo que anade friccion para equipos que no lean ese idioma.
- Repositorio sin adopcion: 0 descargas y 0 likes, sin senales de validacion por parte de terceros.
- El aviso del autor indica que este paquete no reemplaza al snapshot original del modelo base.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/shadowtec/Audio8-ASR-0.1B-RK3576-RKNN
- Modelo base: https://huggingface.co/Edge0/Audio8-ASR-0.1B
- Archivo fuente de reproducibilidad en GitHub: no disponible (la referencia aparece truncada en la informacion proporcionada)
- Documentacion de benchmark y aceptacion: `docs/benchmark-and-acceptance.zh-CN.md` dentro del repositorio (solo en chino)
- Documentacion de arquitectura y operacion: `docs/architecture-and-operation.zh-CN.md` dentro del repositorio (solo en chino)
- Paper o publicacion tecnica del modelo base: no disponible
- Demo en linea: no disponible
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos corresponden a contenidos sin relacion con el tema).
