# CaptchaKraken/MidnightV2-4B-LoRA

## Resumen

MidnightV2-4B-LoRA es el adaptador LoRA sin fusionar del modelo Midnight V2, un modelo de 4B parámetros desarrollado por CaptchaKraken para la resolución automática de captchas. No es un modelo de lenguaje generativo al uso: se trata de un modelo *pointer* que, a partir de un único prefill del prompt (sin generación de texto), produce directamente la respuesta completa del captcha (acción, puntos de clic, arrastres, texto a teclear, momento de vídeo y número del elemento marcado bajo cada punto). El adaptador se monta sobre Qwen/Qwen3.5-4B.

El repositorio contiene únicamente el resultado de entrenamiento sin fusionar: el adaptador LoRA de rango 16 (alpha 32) aplicado sobre las proyecciones de atención, atención lineal y MLP del modelo de lenguaje, así como sobre las proyecciones `qkv`, `proj` y `linear_fc*` de la torre de visión, junto con las cabezas *pointer* en `pointer_heads.safetensors`. La mayoría de usuarios debería usar la versión fusionada (`CaptchaKraken/MidnightV2-4B`) o la GGUF; este repo está pensado para continuar el entrenamiento o fusionar sobre otra build del modelo base.

La relevancia de esta ficha es doble: por un lado, documenta un caso de uso muy específico (resolución de captchas con un modelo multimodal de 4B) con resultados medidos sobre un conjunto de 1.067 tableros reales etiquetados a mano; por otro, ilustra un patrón de despliegue poco habitual (modelo *pointer* de un solo paso, sin decodificación autoregresiva) que puede interesar a quien diseñe pipelines de inferencia de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen/Qwen3.5-4B) con adaptador LoRA y cabezas pointer; sin generación de texto |
| Parametros totales | 4B (modelo base Qwen/Qwen3.5-4B); tamaño del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors (float32 para las cabezas); el repo hermano `MidnightV2-4B-GGUF` ofrece Q4_K_M y BF16; el repo `MidnightV2-4B-q4` (GPTQ W4A16) está anunciado pero no publicado |
| Idiomas soportados | no disponible |
| Licencia | LGPL-3.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, `pointer_heads.safetensors`), PEFT |

## Arquitectura y entrenamiento

El modelo es un *pointer* de tercera generación: parte de Qwen/Qwen3.5-4B, un transformer multimodal con atención y atención lineal, y le aplica un adaptador LoRA de rango 16 y alpha 32 sobre las proyecciones de atención, atención lineal y MLP del modelo de lenguaje, y sobre `qkv`, `proj` y `linear_fc*` de la torre de visión. Sobre esa base se añaden cabezas pequeñas que leen la respuesta completa (acción, puntos, arrastres, texto, momento de vídeo y número del elemento marcado bajo cada punto) a partir de un único prefill del prompt. No hay generación de texto: la salida se produce en un solo paso hacia delante.

El entrenamiento corresponde a la ejecución `20261103-qwen-4b-44k-offload`: 43.963 tableros (2 épocas sobre 23.343 filas), learning rate 1e-4 (1e-3 para las cabezas), acumulación de gradiente 8, gradient checkpointing y la mitad de los tableros dibujados con marcas numeradas de elementos. Se entrenó en una única RTX 5080 a 1,27 s/tablero con un pico de 14,6 GiB. Los 828 tableros con vídeos de 28–32 fotogramas se entrenaron con sus activaciones guardadas en RAM del host en lugar de omitirse (la ejecución anterior de 4B omitía 830); aun así se descartaron 3 tableros por memoria. El prompt es fijo y único para todos los captchas.

## Capacidades

- Resolución de captchas de imagen fija: clic, cuadrícula y tecleo de texto.
- Resolución de captchas de vídeo: identificación del momento correcto (tableros de 28–32 fotogramas).
- Salida estructurada en un solo paso: acción, puntos de clic, arrastres, texto a teclear, momento de vídeo y número del elemento marcado bajo cada punto.
- Lectura de marcas numeradas de elementos superpuestas por el detector CNN (`CaptchaKrakenV2-CNN-large` / `-lite`).
- Cross-check de marcas: el parche `client-fixes.patch` añade la cabeza de número de elemento (`elem`, ranuras de 6, `PACKED = 225`) y la verificación cruzada de marcas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no genera texto.
- Capacidades multilingües: no disponible.

## Casos de uso

- Automatización de pruebas de accesibilidad y QA de formularios protegidos por captcha: el modelo resuelve el captcha en un único prefill (mediana de 151 ms por tablero en transformers sobre RTX 5080), lo que permite integrarlo en suites de test end-to-end sin introducir esperas largas.
- Monitorización de la propia infraestructura de captchas: un operador que despliega captchas propios puede usar el modelo para medir la dificultad real de sus tableros (tasa de resolución por tipo: clic 78,3 %, cuadrícula 78,5 %, vídeo 59,5 % en el conjunto de puerta) y ajustar el diseño.
- Investigación en seguridad de captchas: sirve como baseline reproducible y con licencia LGPL-3.0 para estudiar qué tipos de desafío resisten mejor a modelos multimodales de 4B, con resultados por tablero publicados en `eval/`.
- Despliegue en CPU para entornos sin GPU: la variante `MidnightV2-4B-GGUF` (Q4_K_M, BF16, mmproj) permite ejecutar el modelo con llama.cpp en máquinas sin acelerador, a costa de latencia mayor que la versión GPU.
- Servido de alta concurrencia con vLLM: la versión fusionada `MidnightV2-4B` está preparada para vLLM; el parche del cliente desactiva el prefix caching y corrige los marcadores de vídeo, lo que facilita montar un servicio HTTP que resuelva lotes de tableros.
- Continuación del entrenamiento o ajuste sobre otra build del modelo base: este repo es precisamente el punto de partida para quien quiera reentrenar las cabezas o fusionar el adaptador sobre una revisión distinta de Qwen/Qwen3.5-4B (el entrenamiento usó la revisión `851bf6e`).

## Benchmarks y rendimiento

Resultados del conjunto de puerta Tier 2 (1.067 tableros reales etiquetados a mano), ejecutados con transformers sobre RTX 5080, mediana de 151 ms por tablero. "Marked" = marcas numeradas del detector CNN dibujadas sobre el tablero; "plain" = tablero sin marcas.

| Categoria | Marked | Plain |
|---|---|---|
| Todos | 74,2 % (1.061) | 75,2 % (1.067) |
| Stills (imagen fija) | 76,9 % | 77,9 % |
| Clic (674) | 76,2 % | 78,3 % |
| Cuadrícula (223) | 79,4 % | 78,5 % |
| Tecleo (12) | 62,5 % (8 marked) | 41,7 % |
| Vídeo (158) | 58,9 % | 59,5 % |

Comparación con la ejecución anterior de 4B (`20261102-qwen-4b-44k`, misma receta pero omitiendo los 830 vídeos más largos): stills 76,1 % / 76,7 % → 76,9 % / 77,9 % (marked / plain); vídeo 59,5 % / 59,5 % → 58,9 % / 59,5 %. Mantener los vídeos largos no movió la puntuación de vídeo; las imágenes fijas ganaron cerca de un punto.

Estos números proceden de transformers y no son directamente comparables con los de la model card de TwilightV2-2B, medidos con vLLM (72,6 % plain / 68,2 % marked).

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento del adaptador alcanzó un pico de 14,6 GiB en una RTX 5080 con gradient checkpointing; la inferencia del modelo fusionado en bf16 requiere del orden de 8–10 GiB solo para pesos de 4B, más activaciones y la torre de visión (cifra exacta no disponible).
- GPU recomendadas: RTX 5080 (validada en entrenamiento y evaluación), A100 y H100 para servido con vLLM; RTX 4090 como alternativa consumer de 24 GiB.
- Cabe en GPU consumer: sí, en RTX 5080 (16 GiB) y RTX 4090 (24 GiB); la variante GPTQ W4A16 reduciría aún más el requisito, pero no está publicada.
- Opciones de despliegue: transformers (usado en la evaluación), vLLM (versión fusionada `MidnightV2-4B`, con prefix caching desactivado), llama.cpp (variante GGUF Q4_K_M/BF16 para CPU).
- Latencia y throughput: mediana de 151 ms por tablero en transformers sobre RTX 5080; throughput agregado no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de resolución (plain) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MidnightV2-4B (este, familia) | 4B | no disponible | 75,2 % (transformers) | LGPL-3.0 | LoRA, fusionado, GGUF |
| TwilightV2-2B | 2B | no disponible | 72,6 % (vLLM) | no disponible en la información | Fusionado |
| SunlightV2-0.8B | 0,8B | no disponible | no disponible | no disponible en la información | Fusionado |

La comparación con TwilightV2-2B no es estrictamente equivalente porque las cifras se midieron con backends distintos (transformers frente a vLLM), tal como advierte el propio autor. No se dispone de datos de modelos de resolución de captchas ajenos a la familia CaptchaKraken en la información proporcionada.

## Limitaciones y advertencias

- El adaptador sin fusionar no es directamente servible: requiere fusionarlo sobre Qwen/Qwen3.5-4B y añadir el bloque `pointer` y la arquitectura `CaptchaPointerForConditionalGeneration` al `config.json`, tal como hace el repo fusionado.
- Dependencia estricta de la versión del cliente: las cabezas coinciden con el commit `c5c1620` de CaptchaKraken más `client-fixes.patch`; el cliente sin parchear rechazará estos pesos.
- El modelo no genera texto ni soporta tool calling, agentes ni razonamiento multi-paso; cualquier expectativa de uso como LLM general es incorrecta.
- Rendimiento notablemente inferior en vídeo (58,9–59,5 %) y en tecleo (41,7 % plain, con solo 12 muestras), lo que limita su uso en produccion para esos tipos de captcha sin supervisión humana.
- Riesgo de fallo silencioso: al producir la respuesta en un solo paso, no hay cadena de razonamiento verificable; un error se manifiesta directamente como una acción incorrecta.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; el prompt es fijo y único para todos los captchas.
- Licencia LGPL-3.0: permite uso comercial, pero impone obligaciones de copyleft sobre la biblioteca modificada; conviene revisar el cumplimiento si se redistribuye el modelo o el cliente parcheado.
- El uso del modelo para resolver captchas de terceros puede infringir los términos de servicio de los sitios afectados y, en algunas jurisdicciones, la normativa aplicable; la licencia no exime de esa responsabilidad.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/CaptchaKraken/MidnightV2-4B-LoRA
- Modelo fusionado (vLLM, GPU): https://huggingface.co/CaptchaKraken/MidnightV2-4B
- Variante GGUF (llama.cpp, CPU): https://huggingface.co/CaptchaKraken/MidnightV2-4B-GGUF
- Variante GPTQ W4A16 (anunciada, no publicada): `CaptchaKraken/MidnightV2-4B-q4`
- Familia Twilight V2 (2B): https://huggingface.co/CaptchaKraken/TwilightV2-2B
- Familia Sunlight V2 (0.8B): https://huggingface.co/CaptchaKraken/SunlightV2-0.8B
- Detector CNN de elementos (large): https://huggingface.co/CaptchaKraken/CaptchaKrakenV2-CNN-large
- Detector CNN de elementos (lite): https://huggingface.co/CaptchaKraken/CaptchaKrakenV2-CNN-lite
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Resultados por tablero: carpeta `eval/` del repo `CaptchaKraken/MidnightV2-4B`
