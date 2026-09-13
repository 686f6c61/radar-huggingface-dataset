# AbrahamPJ/neodragon-npu-s25u

## Resumen

`AbrahamPJ/neodragon-npu-s25u` no es un modelo de lenguaje, sino un conjunto de **13 binarios de contexto QNN/QAIRT** precompilados para el pipeline de text-to-video **Neodragon** de Qualcomm, dirigidos especificamente a la NPU Hexagon **HTP v79** del Samsung Galaxy S25 Ultra (SoC SM8750, `soc_model 69`). Los artefactos son los mismos que carga en tiempo de ejecucion la aplicacion Android companera, por lo que se trata de un paquete de despliegue en dispositivo, no de pesos entrenables.

El pipeline completo, tal y como queda reflejado en los grafos, incluye un codificador de texto DistilT5, un MMDiT piramidal en tres etapas (408, 648 y 1728 tokens latentes), un VAE de video causal con decodificador en streaming, varios codificadores CLIP (L, L con proyeccion y G), una UNet SSD-1B destilada con LCM de 4 pasos y un superresolutor QuickSRNet 2x (320x512 a 640x1024). Todos los grafos estan cuantizados en **W8A16**, salvo el adaptador de contexto, que va en FP16.

Su relevancia es doble: por un lado demuestra que un pipeline generativo de video completo puede ejecutarse en la NPU de un telefono de consumo con latencias de 23,5-26,9 s para 49 fotogramas y un RSS maximo de la app de 238-268 MB; por otro, documenta una optimizacion de cuantizacion concreta (los grafos `*fs` del MMDiT) que mejora la relacion senal-ruido entre 10,9 y 12,2 dB respecto a la variante anterior contratando la puntuacion de atencion a ancho completo en lugar de como dos MatMuls de media anchura mas una suma. El repositorio deriva de `Qualcomm-AI-Research/Neodragon` (BSD-3-Clause-Clear) y acompana al paper arXiv:2511.06055.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline autoregresivo de text-to-video: codificador de texto DistilT5, MMDiT piramidal de 3 etapas, VAE de video causal, CLIP L / CLIP L con proyeccion / CLIP G, UNet SSD-1B (LCM, 4 pasos) y superresolucion QuickSRNet Medium 2x |
| Parametros totales | no disponible (no se publica el conteo; los 13 grafos ocupan 8.536.137.696 bytes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como ventana de texto; las etapas del MMDiT piramidal procesan 408, 648 y 1728 tokens latentes respectivamente |
| Tipos de cuantizacion | W8A16 (pesos de 8 bits por canal, activaciones de 16 bits) en todos los grafos, salvo `ctxadaptfp16` en FP16; QuickSRNet usa W8A16 + CLE (sin AdaRound) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | BSD-3-Clause-Clear, heredada de `Qualcomm-AI-Research/Neodragon`, con su clausula de patentes |
| Formato de pesos | binarios de contexto QNN/QAIRT (`.bin`) compilados para HTP v79; no incluye safetensors ni GGUF |
| Pipeline (HuggingFace) | text-to-video |
| Hardware objetivo | Hexagon HTP v79, `soc_model 69`; Samsung Galaxy S25 Ultra (SM8750) |
| Numero de grafos | 13 |
| Tamano del repositorio | 13,2 GB (de los cuales 8,54 GB corresponden a los 13 binarios listados) |
| Cadena de conversion | QAIRT SDK 2.49.0.260730 (`qnn-onnx-converter` -> `qnn-context-binary-generator`) |
| Fecha de creacion / actualizacion | 2026-08-22 / 2026-09-13 segun metadatos de HuggingFace |
| Descargas / likes | 0 / 2 |

Desglose de los binarios publicados:

| Archivo | Bytes | Funcion |
|---|---:|---|
| `mmdit_s0fs_v79.bin` | 1.525.163.128 | MMDiT piramidal, etapa 0 (408 tokens) |
| `mmdit_s1fs_v79.bin` | 1.533.523.064 | MMDiT piramidal, etapa 1 (648 tokens) |
| `mmdit_s2fs_v79.bin` | 1.573.344.888 | MMDiT piramidal, etapa 2 (1728 tokens) |
| `quicksrm2x_v79.bin` | 377.880 | QuickSRNet Medium 2x, 320x512 -> 640x1024 |
| `ctxadaptfp16_v79.bin` | 260.531.784 | Adaptador de contexto (FP16) |
| `distilt5f_v79.bin` | 260.050.504 | Codificador de texto DistilT5 |
| `vaeenc_v79.bin` | 41.667.768 | Codificador VAE de video causal |
| `vaedecsn_v79.bin` | 12.104.632 | Decodificador VAE de video causal (streaming, estados NHWC) |
| `clipl_v79.bin` | 233.993.824 | CLIP L (ruta de primer fotograma) |
| `cliplp_v79.bin` | 249.451.112 | CLIP L con proyeccion (ruta de video, pooled) |
| `clipg_v79.bin` | 1.402.277.416 | CLIP G |
| `ssd1bunet_v79.bin` | 1.358.184.480 | UNet SSD-1B (LCM, 4 pasos) |
| `ssd1bvaedec_v79.bin` | 85.467.216 | Decodificador VAE de SSD-1B |

## Arquitectura y entrenamiento

La model card no documenta el entrenamiento: este repositorio contiene unicamente una **recompilacion especifica de dispositivo** de los pesos de Qualcomm. La arquitectura se describe por los grafos que la componen: un MMDiT piramidal en tres etapas que opera a distintas resoluciones de tokens latentes, un VAE de video causal con decodificador en streaming (estados en formato NHWC, adecuado para inferencia por bloques), un codificador de texto DistilT5 y condicionamiento visual mediante CLIP L y CLIP G. La generacion de imagen final pasa por una UNet SSD-1B destilada con Latent Consistency Models a 4 pasos y por QuickSRNet Medium 2x para elevar de 320x512 a 640x1024.

La innovacion tecnica destacable esta en la revision `*fs` de los grafos MMDiT, que sustituye a `mmdit_s0g`/`s1f`/`s2f` (aun presentes en el repositorio para rollback). La variante nueva contrata la puntuacion de atencion una sola vez a ancho completo, en lugar de como dos MatMuls de media anchura mas una suma. En fp32 el resultado es aritmeticamente identico (126 dB frente al modelo original), pero evita cuantizar por separado dos terminos grandes que se cancelan parcialmente, lo que aporta **+10,9 / +12,2 / +12,0 dB** en las etapas 0, 1 y 2. Ademas reduce los ciclos de acelerador un 4,4%. No se declara en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- **Generacion de video a partir de texto**: produce clips de 49 fotogramas en el dispositivo, con latencia de 23,5-26,9 s medida en el S25 Ultra.
- **Generacion de imagen**: renderiza una imagen de 640x1024 en 2,1-2,5 s en caliente (unos 5 s en el primer arranque en frio de la app).
- **Superresolucion integrada**: QuickSRNet Medium 2x escala de 320x512 a 640x1024 dentro del propio pipeline.
- **Decodificacion VAE en streaming**: el grafo `vaedecsn` trabaja con estados NHWC por bloques, lo que permite decodificar video sin materializar todo el tensor de una vez.
- **Condicionamiento visual multimodal**: rutas separadas para primer fotograma (CLIP L) y para video con pooling (CLIP L con proyeccion), mas CLIP G.
- **Optimizacion para NPU**: los 13 grafos estan compilados para HTP v79, con pesos de 8 bits por canal y activaciones de 16 bits.
- **Sin capacidades de lenguaje, razonamiento, codigo ni matematicas**: no es un modelo conversacional.
- **Sin tool calling, function calling ni comportamiento de agente**: no hay ninguna interfaz de ese tipo en los grafos.
- **Soporte multilingue**: no disponible, no declarado en la model card.

## Casos de uso

- **Generacion de video sin conexion en movilidad**: apps Android que crean clips de 49 fotogramas a partir de una descripcion textual sin enviar datos a la nube. El pipeline completo cabe en el dispositivo y el RSS pico de 238-268 MB permite mantenerlo en segundo plano en un telefono de gama alta.
- **Previsualizacion de storyboards para produccion audiovisual**: generar un primer render de 640x1024 en 2,1-2,5 s por prompt para validar encuadres y concepto antes de comprometer recursos de render en servidor.
- **Prototipado de aplicaciones generativas sobre Snapdragon**: sirve como referencia funcional para equipos que quieran medir el comportamiento real de un pipeline generativo de video sobre Hexagon HTP v79, con latencias y SNR documentados modulo a modulo.
- **Investigacion en cuantizacion para NPU**: el repositorio publica SNR medido en dispositivo frente a la referencia fp32 para cada modulo, lo que lo convierte en un caso de estudio util para evaluar W8A16 frente a alternativas como AdaRound (el propio autor senala que QuickSRNet bajaria de 48 dB al usar CLE en lugar de AdaRound).
- **Plantilla de conversion QAIRT**: la cadena `qnn-onnx-converter` -> `qnn-context-binary-generator` con QAIRT SDK 2.49.0.260730 documentada aqui es reutilizable para portar otros modelos generativos a binarios de contexto QNN.
- **Demos offline en ferias y entornos sin conectividad**: al no requerir red ni GPU, el pipeline permite demostraciones en movilidad donde la latencia de subida de datos a la nube seria inaceptable.
- **Pruebas de regresion de cuantizacion en CI**: los tamanos de byte exactos de cada binario son verificados por la app, de modo que un pipeline de integracion puede detectar truncamientos silenciosos comparando longitudes exactas antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no aplican MMLU, HumanEval o GSM8K a un pipeline de generacion de video). Lo que si se publica es la relacion senal-ruido medida en dispositivo contra la referencia fp32, por modulo:

| Modulo | Cuantizacion | SNR medido en dispositivo | Objetivo del paper |
|---|---|---:|---:|
| DistilT5 | W8A16 | 49,04 dB | — |
| Codificador VAE | W8A16 | 41,60 dB | 40 dB |
| Decodificador VAE | W8A16 | 34,27 dB | 35 dB |
| MMDiT etapa 0 | W8A16 | 39,67 dB | 29 dB |
| MMDiT etapa 1 | W8A16 | 37,80 dB | 22 dB |
| MMDiT etapa 2 | W8A16 | 33,89 dB | 24 dB |
| UNet SSD-1B | W8A16 | 32,51 dB | — |
| QuickSRNet | W8A16 + CLE | no medido todavia | 48 dB |

La model card advierte que QuickSRNet deberia quedar por debajo de 48 dB, porque el paper original obtiene ese objetivo con W8A16 + AdaRound (que aporta "7+ dB SQNR" en ese modulo) y aqui se usa CLE.

Latencia medida en el S25 Ultra:

| Tarea | Latencia | Condiciones |
|---|---|---|
| Prompt -> video de 49 fotogramas | 23,5-26,9 s | medido antes de la reconstruccion `*fs` |
| Prompt -> imagen 640x1024 | 2,1-2,5 s | en caliente |
| Primer render tras arranque en frio | ~5 s | primera pulsacion de la app |
| RSS pico de la app | 238-268 MB | binarios mapeados con `mmap`, nunca copiados al heap |

## Requisitos de hardware

- **No se ejecuta en GPU**: los grafos estan compilados para Hexagon HTP v79 y no hay equivalentes en CUDA, ROCm ni Metal. No aplica una estimacion de VRAM.
- **NPU obligatoria**: Hexagon HTP v79 con `soc_model 69`. Los binarios no cargaran en HTP v75 ni en versiones anteriores del acelerador.
- **Dispositivo de referencia**: Samsung Galaxy S25 Ultra (SM8750). El autor indica que son los mismos artefactos que carga la app Android companera.
- **Almacenamiento**: 8,54 GB para los 13 binarios listados; el repositorio completo ocupa 13,2 GB, presumiblemente por la presencia de los grafos antiguos `mmdit_s0g`/`s1f`/`s2f` conservados para rollback.
- **Memoria en ejecucion**: RSS pico de la app de 238-268 MB, porque los binarios se mapean con `mmap` en lugar de copiarse al heap.
- **Opciones de despliegue**: runtime QNN/QAIRT dentro de la app Android. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no existen pesos en safetensors ni GGUF.
- **Latencia y throughput**: 23,5-26,9 s por clip de 49 fotogramas; 2,1-2,5 s por imagen de 640x1024 en caliente. No se publican cifras de throughput sostenido ni de consumo energetico.

## Comparativa con modelos similares

| Modelo | Formato | Cuantizacion | Hardware | Licencia | Tamano |
|---|---|---|---|---|---|
| `AbrahamPJ/neodragon-npu-s25u` | 13 binarios de contexto QNN | W8A16 (FP16 el adaptador de contexto) | Hexagon HTP v79 (SM8750) | BSD-3-Clause-Clear | 8,54 GB de grafos (repo de 13,2 GB) |
| `Qualcomm-AI-Research/Neodragon` | no disponible en la informacion proporcionada | referencia fp32 | no disponible en la informacion proporcionada | BSD-3-Clause-Clear | no disponible |
| Otros despliegues de text-to-video sobre NPU Hexagon | no disponible | no disponible | no disponible | no disponible | no disponible |

El unico punto de comparacion documentado es el modelo original de Qualcomm del que derivan estos binarios. No se dispone de informacion sobre alternativas equivalentes de text-to-video compiladas para NPU movil que permitan una comparacion de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- **Especificidad de dispositivo**: los binarios solo cargan en HTP v79 con `soc_model 69`. No hay version para otros Snapdragon ni para GPU, asi que el artefacto no es portable.
- **Artefacto derivado, no entrenable**: contiene unicamente grafos cuantizados; no incluye pesos en precision completa, datos de entrenamiento ni scripts de ajuste. No se puede afinar a partir de este repositorio.
- **Sin formatos estandar**: al no haber safetensors ni GGUF, queda fuera de todo el ecosistema de inferencia habitual (llama.cpp, Ollama, vLLM, TGI).
- **Acceso restringido segun la model card**: el propio autor indica que el repositorio es privado y que la descarga requiere una cabecera `Authorization: Bearer <hf_token>` con un token de solo lectura de grano fino. La pagina de HuggingFace figura como accesible con 0 descargas, lo que conviene verificar antes de integrar cualquier automatizacion.
- **Integridad de las descargas**: el autor advierte de que las transferencias grandes a este dispositivo se han truncado en silencio mas de una vez reportando exito. La app verifica cada archivo por longitud exacta en bytes; cualquier pipeline propio deberia replicar esa comprobacion.
- **SNR por debajo del objetivo en dos modulos**: el decodificador VAE mide 34,27 dB frente al objetivo de 35 dB, y QuickSRNet no se ha medido todavia, con expectativa de quedar por debajo de 48 dB al usar CLE en lugar de AdaRound. Ambos casos pueden traducirse en artefactos visuales.
- **Riesgo de artefactos generativos**: no hay datos publicados sobre sesgos, alucinacion visual, coherencia temporal mas alla de 49 fotogramas ni comportamiento con prompts ambiguos. La model card no aborda ninguna evaluacion cualitativa.
- **Idiomas sin declarar**: no se especifica que idiomas acepta el codificador DistilT5 ni con que calidad, lo que impide garantizar soporte para castellano u otras lenguas.
- **Licencia con clausula de patentes**: BSD-3-Clause-Clear se hereda del modelo original de Qualcomm y sus terminos, incluida la clausula de patentes, se aplican a estos artefactos derivados. Conviene revisar el texto completo antes de un uso comercial.
- **El SDK QAIRT no se redistribuye**: el repositorio solo contiene los binarios; reproducir la conversion exige disponer del QAIRT SDK 2.49.0.260730 por separado.
- **Latencia de referencia desactualizada**: las cifras de 23,5-26,9 s se midieron antes de la reconstruccion `*fs`, por lo que el rendimiento actual deberia ser ligeramente mejor, pero no se publica una medicion posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AbrahamPJ/neodragon-npu-s25u
- Modelo original de Qualcomm: https://huggingface.co/Qualcomm-AI-Research/Neodragon
- Paper Neodragon (arXiv:2511.06055): https://arxiv.org/abs/2511.06055
- Repositorio del port y la conversion: https://github.com/AbrahamPaulJ/T2V_NPU
- Ruta base de descarga de los binarios indicada por el autor: https://huggingface.co/AbrahamPJ/neodragon-npu-s25u/resolve/main

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; unicamente aparacieron paginas de ayuda de Google, Chrome y Windows sin relacion con el contenido de esta ficha.
