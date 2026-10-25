# jinhwan000/qwen3-tts-1.7b-base-ov

## Resumen

`jinhwan000/qwen3-tts-1.7b-base-ov` es una exportación a OpenVINO IR del modelo de síntesis de voz Qwen/Qwen3-TTS-12Hz-1.7B-Base, publicada por el usuario jinhwan000. No se trata de una conversión estándar de optimum-intel ni de OpenVINO GenAI: el grafo original se ha troceado en cinco componentes (talker, proyección de texto, frame head, transformer del decodificador y la mitad posterior del decodificador) para permitir *continuous batching* por rondas, de forma que muchas peticiones de síntesis comparten una única GPU y cada una avanza una trama de 80 ms por ronda.

El modelo base es un TTS autorregresivo de aproximadamente 1.700 millones de parámetros que genera 16 códigos RVQ por trama a 12,5 tramas por segundo (12 Hz) y reconstruye audio a 24 kHz. La exportación está pensada para servir muchas voces simultáneas con latencia acotada: en una Intel Arc B580 satura en tiempo real con 48 peticiones concurrentes, consumiendo unos 9,9 GB de memoria de dispositivo.

Su relevancia práctica es doble: por un lado demuestra un patrón de despliegue de TTS de alta concurrencia sobre hardware Intel consumer (Arc B580) usando PagedAttention en el talker y en el decodificador; por otro, documenta con detalle dos trampas de precisión (desbordamiento f16 en la frame head y compilación fallida en f32) que afectan a cualquiera que intente reproducir la conversión. Solo se ha validado con coreano, aunque las partes son independientes del idioma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS autorregresivo en dos etapas: talker tipo transformer (28 capas + norm final) con embeddings de texto proyectados por una MLP; frame head con codec head, muestreo del codebook 0 y 15 pasos de *code predictor* desenrollados; decodificador con pre_conv plegada en una lineal sobre [x(t−2), x(t−1), x(t)] + transformer de 8 capas (ventana deslizante 72) + upsample convolucional con estados explícitos |
| Parámetros totales | ~1.700 millones (según la denominación del modelo base; no se publica desglose por componente) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible. El transformer del decodificador usa `sliding_window` = 72 tramas; el talker se ejecuta como LM con estado y caché KV paginada, sin cifra de contexto publicada |
| Tipos de cuantización | Solo f32 en pesos; la ejecución la decide la *precision hint* del dispositivo (f16 para las partes paginadas en Arc B580, f32 en CPU). No se publican variantes INT8/INT4 ni GGUF |
| Idiomas soportados | zh, en, ja, ko, de, fr, ru, pt, es, it (validación real únicamente en coreano) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | OpenVINO IR (`talker.xml`, `text_proj.xml`, `frame_head.xml`, `dec_transformer.xml`, `dec_back.xml` + `ov.json`) y safetensors (`decoder_host.safetensors` con la tabla RVQ; el `model.safetensors` del repo original se usa en el host) |
| Frecuencia de trama | 12,5 tramas/s (80 ms por trama), 16 códigos RVQ por trama |
| Tasa de muestreo de salida | 24 kHz (1.920 muestras por trama y petición) |
| codec / RVQ | Tabla `rvq_table` de 16 × 2048 × 512 en f32, con la proyección de salida plegada |
| Tamaño del repositorio | 6,9 GB |
| Hardware validado | Intel Arc B580 con OpenVINO 2026.4.1; CPU en f32 |
| Dependencias externas | `model.safetensors`, `config.json`, `generation_config.json`, `vocab.json`, `merges.txt`, `tokenizer_config.json`, `speech_tokenizer/config.json` del repo original |

## Arquitectura y entrenamiento

La pieza central es el *talker*, un transformer de 28 capas con forma de LM con estado que recibe `inputs_embeds` de [t, 2048] y devuelve la fila oculta de la última posición de cada secuencia. En carga hay que aplicarle `SDPAToPagedAttention` mediante la API C++ de OpenVINO: el modelo convertido no se puede volver a leer desde fichero, lo que obliga a repetir la conversión en cada arranque. Los embeddings de texto pasan antes por `text_proj.xml`, una MLP que los mantiene en 2048 dimensiones.

La `frame_head.xml` agrupa el codec head, el muestreo del codebook 0 (máscara de *repetition penalty*, regla de EOS, top-k 50, CDF inversa), los 15 pasos del *code predictor* desenrollados y el cálculo de la siguiente fila del talker; produce `codes` [n, 16], `eos` [n] y `next_row` [n, 2048] con dimensión dinámica que debe rehacerse a *buckets* estáticos. El decodificador se divide en `dec_transformer.xml` (8 capas, pre_conv plegada, ventana deslizante de 72) y `dec_back.xml`, que hace el upsample y los bloques convolucionales por trama arrastrando 20 tensores de estado (140.448 valores por petición) y emitiendo `pcm` [n, 1920]. En el host se suman las 16 filas de `rvq_table` por trama.

No hay información sobre el entrenamiento del modelo base en la documentación disponible: se desconoce el número de tokens, la composición del dataset, las horas de audio y si hubo ajuste por RLHF/DPO. Lo que sí está documentado son dos optimizaciones de la exportación: la activación Snake se reescribe como `x + c − c·cos(2a·x)` (equivalente a `x + b·sin²(a·x)`) para evitar un `pow` genérico que hacía casi el doble de lenta esa parte del decodificador; y en f16 hay que fijar `ACTIVATIONS_SCALE_FACTOR=8` en la frame head porque los productos gate·up alcanzan ~170.000 y desbordan, produciendo códigos silenciosamente incorrectos.

## Capacidades

- Síntesis de voz multilingüe en 10 idiomas (zh, en, ja, ko, de, fr, ru, pt, es, it) con salida a 24 kHz.
- Clonación de voz mediante el codificador de hablante del repo original (x-vector); la etiqueta `voice-cloning` está declarada por el autor.
- Servicio concurrente con *continuous batching* por rondas: N peticiones comparten GPU y cada una avanza exactamente una trama de 80 ms por ronda.
- Caché KV paginada en talker y decodificador, con *buckets* estáticos por número de peticiones para evitar reformas dinámicas.
- Soporte de EOS por petición y de entradas forzadas (`forced` [n, 16]) para validación determinista contra la referencia.
- No soporta *tool calling*, ni *function calling*, ni razonamiento multi-paso, ni modo *thinking*: es exclusivamente un modelo de texto a voz.
- No genera texto, código ni matemáticas; no procesa visión ni audio de entrada más allá del audio de referencia para la clonación.
- La salida es PCM en memoria (no se documenta contenedor ni empaquetado a WAV/Opus).

## Casos de uso

- Servicio TTS multiinquilino: con 48 ranuras por GPU, un único Arc B580 mantiene 48 síntesis simultáneas en tiempo real (RTF mediana 0,76), lo que permite ofrecer TTS a varios clientes desde un solo nodo y escalar añadiendo GPUs.
- Narración de audiolibros y contenido largo: el flujo por tramas de 80 ms y el EOS por petición permiten emitir audio en streaming mientras se genera, sin esperar a la síntesis completa.
- Doblaje y localización: al cubrir diez idiomas con la misma arquitectura de partes, se puede reutilizar el mismo motor para distintas lenguas cambiando tokenizador y configuración, compartiendo la infraestructura de batching.
- Clonación de voz para accesibilidad: pacientes con pérdida de habla pueden conservar su timbre mediante el codificador de hablante, con la salvedad de que solo el coreano está validado.
- Atención al cliente e IVR: latencia de primera trama de 47 ms con una petición y 119 ms con 48, suficiente para respuestas habladas conversacionales integradas en un conmutador o bot telefónico.
- Generación de datos sintéticos para ASR: producción masiva de audio etiquetado en varios idiomas e intensidades de voz para aumentar corpus de entrenamiento, aprovechando el batching para reducir coste por hora de audio.
- Integración en aplicaciones .NET: el export incluye un planificador de rondas en C# sobre un shim en C++, lo que facilita incrustar el motor en servicios Windows o en backends corporativos ya existentes en ese ecosistema.
- Evaluación de hardware Intel: sirve como carga de referencia realista para medir rendimiento de Arc B580 con OpenVINO en cargas de decodificación autorregresiva con caché KV.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de TTS (WER, MOS, SIM) en la información disponible. Los datos que sí aporta el autor son de paridad numérica y de rendimiento del servicio.

Paridad con la referencia fp32 oficial (4 casos en coreano, 61–103 tramas, decodificación greedy):

| Dispositivo | Hidden del talker (RMS relativo) | Códigos greedy vs referencia (c0 · code predictor) | SNR de decodificación |
|---|---|---|---|
| CPU f32 | 1,2e-6 | 100 % · 100 % | 110–112 dB |
| Arc B580 f16 | 1,9–2,7e-3 (bf16 en CUDA: 4,2–5,5e-3) | 100 % · 98,9–99,1 % | 50,3–52,8 dB |

Síntesis con batching por rondas en Arc B580 (todas las peticiones sintetizando sin parar, 10 s por punto):

| Peticiones activas | Ronda mediana · p95 | Rondas > 80 ms | RTF por locución (mediana) | Primera trama de audio (mediana) |
|---|---|---|---|---|
| 1 | 28,7 · 37,9 ms | 0 % | 0,44 | 47 ms |
| 16 | 37,5 · 53,1 ms | 0,4 % | 0,52 | 86 ms |
| 48 | 58,0 · 70,3 ms | 1,8 % | 0,76 | 119 ms |

Desglose por ronda a 48 peticiones: talker 20,2 ms · frame head 20,9 ms · decodificador 16,9 ms. El punto de saturación en tiempo real del B580 es 48 peticiones concurrentes (cómputo al ~99 %).

## Requisitos de hardware

- Memoria de dispositivo documentada: ~9,9 GB para 48 ranuras en Arc B580. No se publica el consumo por petición ni el mínimo con una sola ranura.
- GPU validada: Intel Arc B580 con OpenVINO 2026.4.1. No hay validación publicada en A100, H100, RTX 4090 ni otras GPU.
- En Arc B580 f32 no compila (`CL_BUILD_PROGRAM_FAILURE`); es obligatorio f16 para las partes paginadas y `ACTIVATIONS_SCALE_FACTOR=8` en la frame head.
- CPU: ejecuta f32 y sirve de referencia de paridad, pero no se publican métricas de rendimiento en CPU.
- Despliegue: no es compatible con OpenVINO GenAI ni optimum-intel; requiere el shim en C++ (API C++ de OpenVINO), el planificador de rondas en C# y la conversión a PagedAttention en cada carga.
- Arranque: la primera ejecución compila todos los *buckets* (~35 s en B580); con caché de compilación de OpenVINO, los arranques posteriores tardan unos segundos más un calentamiento de ~7 s.
- Latencia: 47 ms hasta la primera trama con 1 petición, 86 ms con 16 y 119 ms con 48. RTF mediana de 0,44 / 0,52 / 0,76 respectivamente.
- Almacenamiento: 6,9 GB de repositorio, más los ficheros del modelo original necesarios en el host.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Concurrencia | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| qwen3-tts-1.7b-base-ov (este) | ~1,7 B | No disponible | Batching por rondas, 48 ranuras validadas en Arc B580 | Apache-2.0 | OpenVINO IR + safetensors | 0 descargas, 0 likes; validado solo en coreano |
| jinhwan000/qwen3-tts-0.6b-base-ov | ~0,6 B | No disponible | Misma familia de exportación OpenVINO | Apache-2.0 | OpenVINO IR | Mismo autor; sin métricas publicadas en esta ficha |
| jinhwan000/qwen3-tts-0.6b-customvoice-ov | ~0,6 B | No disponible | Misma familia de exportación OpenVINO | Apache-2.0 | OpenVINO IR | Mismo autor; variante de voz personalizada |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | ~1,7 B | No disponible | Inferencia convencional (no por rondas) | Apache-2.0 | safetensors | Modelo original en formato PyTorch; sin datos de rendimiento en esta ficha |

No se dispone de datos de benchmarks ni de licencias de otras familias TTS comparables en la información proporcionada, por lo que la comparación se limita a las variantes de la misma estirpe.

## Limitaciones y advertencias

- Validación lingüística incompleta: solo se han probado 4 casos en coreano. El autor afirma que las partes son independientes del idioma, pero no hay evidencia publicada del comportamiento en es, en, zh, ja, de, fr, ru, pt o it.
- Riesgo de corrupción silenciosa en f16: si se omite `ACTIVATIONS_SCALE_FACTOR=8`, la MLP del *code predictor* desborda y los códigos predichos son incorrectos sin ningún error visible.
- Divergencia de códigos del 0,9–1,1 % en el *code predictor* en Arc B580 frente a la referencia fp32; puede traducirse en artefactos o variaciones de pronunciación no deterministas entre hardware.
- f32 no compila en Arc B580, lo que limita la depuración en esa GPU a comparaciones contra CPU.
- Portabilidad reducida: el talker debe convertirse a PagedAttention en cada carga mediante la API C++, el modelo convertido no se puede releer desde disco y el export no es compatible con OpenVINO GenAI ni con optimum-intel.
- Dependencia de ficheros externos: el repositorio solo contiene las partes IR; sin `model.safetensors`, tokenizador y `speech_tokenizer/config.json` del repo original el modelo no funciona.
- Fijación de versión: validado únicamente con OpenVINO 2026.4.1; no se documenta compatibilidad con otras versiones.
- Es una conversión de terceros, no oficial de Qwen ni de Intel, con 0 descargas y 0 likes: no hay evidencia de uso en producción ni revisión independiente.
- Alucinación en sentido TTS: omisiones, repeticiones o prosodia anómala en textos largos, sin métricas de WER/MOS publicadas que la acoten.
- Clonación de voz: implica riesgos de suplantación y obligaciones legales sobre consentimiento del hablante; la licencia Apache-2.0 del modelo no cubre esos derechos.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar los términos del modelo base y de los datos de voz empleados en la clonación.
- La búsqueda web realizada no devolvió ninguna fuente técnica relevante (solo páginas genéricas de Google), por lo que no hay documentación externa independiente que respalde las cifras del autor.

## Enlaces

- Repositorio del modelo: https://huggingface.co/jinhwan000/qwen3-tts-1.7b-base-ov
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Variante 0.6B base de la misma familia: https://huggingface.co/jinhwan000/qwen3-tts-0.6b-base-ov
- Variante 0.6B custom voice: https://huggingface.co/jinhwan000/qwen3-tts-0.6b-customvoice-ov
- Papers, blogs, repos o demos adicionales: no disponible (la búsqueda web no devolvió resultados relevantes)
