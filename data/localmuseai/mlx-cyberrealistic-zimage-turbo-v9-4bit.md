# LocalMuseAI/mlx-cyberrealistic-zimage-turbo-v9-4bit

## Resumen

CyberRealistic Z-Image Turbo V9 — MLX INT4 es una conversión cuantizada a INT4 del checkpoint CyberRealistic V9.0 en BF16 de Cyberdelia, publicada por LocalMuseAI para el runtime LocalMuse Z-Image Swift. No se trata de un modelo entrenado desde cero ni de un merge: es un artefacto derivado que comprime el modelo de difusión original para su ejecución offline en dispositivos Apple mediante MLX.

El modelo base es Tongyi-MAI/Z-Image-Turbo, un transformer de difusión (DiT) de aproximadamente 6.000 millones de parámetros según el perfil de runtime `zImageTurbo6B4Bit` y el tamaño del checkpoint BF16 original (12.309.866.544 bytes). La conversión preserva 283 tensores sensibles en BF16 exacto y cuantiza 238 matrices a INT4 affine con grupo de 64, mapeando 453 tensores originales a 997 tensores de runtime. El payload de ocho ficheros ocupa 6.046.960.459 bytes, frente a los 12,3 GB del DiT original, que nunca se carga completo en móvil.

Es relevante para desarrolladores que quieren ejecutar generación texto-a-imagen de 1024x1024 en local dentro del ecosistema Apple (Mac e iOS), sin depender de servicios en la nube. La licencia es Apache 2.0 sobre la base, con atribución al autor original conservada. El modelo no incluye pesos de entrenamiento nuevo: es un artefacto de cuantización y empaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) con VAE de 16 canales y text encoder Qwen3-4B; inferencia FlowMatch Euler |
| Parametros totales | Aproximadamente 6.150 millones (inferido de 12.309.866.544 bytes BF16 y del perfil `zImageTurbo6B4Bit`) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (no se especifica el limite de tokens del prompt) |
| Tipos de cuantizacion | INT4 affine con grupo de 64 (238 matrices); BF16 bit a bit para 283 tensores sensibles; decodificacion VAE en FP32 |
| Idiomas soportados | No disponible (el text encoder es Qwen3-4B, pero no se declaran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (8 ficheros de runtime: transformer, text_encoder, tokenizer, vae, runtime_config.json, manifest.json) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion (DiT) para generacion texto-a-imagen, con un text encoder Qwen3-4B y un VAE FLUX de 16 canales, componentes identicos al paquete de runtime V8 validado. La inferencia usa FlowMatch Euler con muestreo linspace, shift estatico 3, tiempo de modelo invertido `1-sigma` y velocidad de modelo negada. La decodificacion del VAE se ejecuta en FP32 con ventanas solapadas de 384 pixeles. Los componentes se cargan y descargan de forma secuencial, de modo que el DiT original de 12,3 GB nunca reside completo en memoria del dispositivo.

No ha habido entrenamiento ni merging. La conversion se realizo con MLX Python 0.31.2 y se ejecuta con MLX Swift 0.31.4 y Swift Transformers 1.3.3, perfil de runtime `zImageTurbo6B4Bit` e ID de catalogo `cyberrealistic_zimage_turbo_v9_mlx`. El proceso mapea 453 tensores BF16 originales a 997 tensores de runtime: 283 tensores sensibles se preservan bit a bit y 238 matrices se convierten a INT4 affine. El repositorio contiene unicamente los artefactos del modelo; el codigo usa la adaptacion MIT ya fijada de z-image-swift.

## Capacidades

- Generacion de imagenes texto-a-imagen a 1024x1024, batch uno.
- Inferencia en 8 pasos por defecto (rango recomendado de 8 a 9; soportado de 4 a 12).
- CFG destilado con valor 1, sin prompt negativo, Hires Fix ni Face Detail.
- Vistas previas en vivo de 128 pixeles durante la generacion (ocho en la validacion reportada).
- Ejecucion offline en el dispositivo, sin llamadas a servicios externos.
- No dispone de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de difusion, no un modelo de lenguaje conversacional.
- Capacidades multilingues: no disponibles; no se documenta el comportamiento del text encoder ante distintos idiomas de prompt.
- Capacidades especiales: adaptacion especifica al runtime LocalMuse Z-Image Swift en Apple Silicon (Metal).

## Casos de uso

- Generacion de imagenes local en Mac: el modelo se ejecuta con MLX Swift sobre Apple Silicon y permite crear imagenes de 1024x1024 sin conexion, util para estudio y prototipado offline.
- Aplicaciones iOS de creacion de imagen: pensado para el runtime LocalMuse Z-Image Swift, con un suelo de 12 GiB de dispositivo documentado; encaja en apps que generan imagenes en el propio telefono.
- Iteracion rapida con pocos pasos: al funcionar con 4 a 12 pasos y CFG 1, permite flujos de generacion con latencia controlada en lugar de muestreos largos.
- Ilustracion asistida por prompt: al ser un finetune orientado a resultados fotograficos/realistas (linaje CyberRealistic), sirve para generar bocetos e imagenes base que luego se retocan.
- Pruebas de integracion en simulador: los CatalogTests y las pruebas de regresion del runtime permiten validar el pipeline de generacion en CI con simuladores de iOS.
- Evaluacion de cuantizacion INT4: util para estudiar el impacto de INT4 affine/grupo 64 en un DiT de ~6B comparando con el checkpoint BF16 de origen.
- Distribucion de artefactos empaquetados: el manifest.json que autentica cada fichero de runtime facilita empaquetado y verificacion de integridad en despliegues locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, GenEval, FID, etc.) en la informacion disponible. El autor reporta unicamente medidas de validacion interna y de fidelidad de la cuantizacion:

| Metrica | Valor |
|---|---|
| Tiempo de generacion 1024x1024, 8 pasos (Apple M1 Pro, 16 GiB, Metal API validation) | 236,34 segundos |
| Pico de asignacion MLX | 4.769.006.826 bytes (~4,77 GB) |
| Vistas previas en vivo | 8 a 128 pixeles, 2 etapas de preparacion |
| Fidelidad INT4 (desempaquetado NumPy, 4 filas de las 238 matrices, 4.526.080 valores) | coseno 0,995419; L2 relativo 0,095782; todos los valores finitos |
| Tests de aplicacion | 53 CatalogTests superados en simulador iPhone 18 Pro / iOS 27.0; 2 tests de regresion del conversor superados (CPU) |

El propio autor advierte que las metricas a nivel de pesos no establecen paridad completa de imagen BF16 y que la comparacion previa con Diffusers uso V8, no este checkpoint.

## Requisitos de hardware

- VRAM/allocacion estimada: pico de MLX de aproximadamente 4,77 GB reportado en M1 Pro, con suelo de dispositivo de 12 GiB declarado por la app.
- Tamano en disco: payload de runtime de 6.046.960.459 bytes (repo de 6,0 GB); el checkpoint BF16 de origen pesa 12.309.866.544 bytes.
- GPU/plataformas recomendadas: Apple Silicon. La validacion medida se hizo en Apple M1 Pro con 16 GiB.
- Cabe en GPU consumer: no se documenta soporte para GPU NVIDIA ni rutas CUDA. El objetivo es Apple Silicon (Mac y iOS).
- Opciones de despliegue: MLX Swift 0.31.4 y MLX Python 0.31.2; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este runtime).
- Latencia: 236,34 segundos por imagen de 1024x1024 y 8 pasos en M1 Pro.
- Movil: no se ha generado en un iPhone fisico; solo se han pasado tests en simulador iPhone 18 Pro / iOS 27.0. La compatibilidad en dispositivo real queda pendiente de verificar.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Tamano | Runtime | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este artefacto (MLX INT4 V9) | ~6.150 M | INT4 affine/grupo 64 + BF16 selectivo | 6,0 GB (payload) | MLX Swift/Python | Apache 2.0 | Conversion de CyberRealistic V9.0 |
| Cyberdelia CyberRealistic V9.0 BF16 (origen) | ~6.150 M | BF16 | 12.309.866.544 bytes | No disponible | Apache 2.0 (segun el artefacto derivado) | Checkpoint fuente, sin cuantizar |
| Tongyi-MAI/Z-Image-Turbo (base) | No disponible | No disponible | No disponible | No disponible | No disponible | Modelo base del que deriva el finetune |
| Runtime V8 (LocalMuse, version previa) | No disponible | BF16/INT4 (no detallado) | No disponible | MLX | No disponible | Paquete de runtime validado anterior; la comparacion con Diffusers se hizo con V8, no con V9 |

No se dispone de datos de otros modelos comparables de 4 bits para MLX en la informacion proporcionada.

## Limitaciones y advertencias

- Es un artefacto de cuantizacion, no un modelo entrenado: la calidad final depende del checkpoint fuente y de la perdida introducida por INT4 (coseno 0,995419 y L2 relativo 0,095782 a nivel de pesos, que no garantizan paridad de imagen con BF16).
- No se ha verificado generacion en un iPhone fisico; los tiempos son mediciones en Mac sobre M1 Pro. El rendimiento movil real es desconocido.
- Requiere un suelo de dispositivo de 12 GiB segun la aplicacion; puede no ejecutarse en dispositivos Apple con menos memoria.
- CFG destilado fijo en 1 y ausencia de prompt negativo, Hires Fix y Face Detail: menos control de ajuste fino que en pipelines de difusion convencionales.
- Rango de pasos limitado a 4-12 (recomendado 8-9); salir de ese rango puede degradar la calidad.
- Riesgo de sesgos y de alucinacion visual inherente a los modelos de difusion: no hay documentacion sobre sesgos ni sobre filtrado de contenido en la informacion disponible.
- Idiomas soportados y comportamiento ante prompts no ingleses: no disponibles.
- Licencia Apache 2.0, pero el autor conserva atribucion al autor original y referencia ficheros LICENSE, SOURCE_LICENSE.md y SOURCE_PERMISSIONS.json; revise esas condiciones antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de adopcion minimo, sin validacion externa independiente.

## Enlaces

- HuggingFace: https://huggingface.co/LocalMuseAI/mlx-cyberrealistic-zimage-turbo-v9-4bit
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Checkpoint fuente (Cyberdelia V9.0 en Civitai): https://civitai.com/models/2218365?modelVersionId=3331554
- Ficheros de licencia y permisos citados en el repositorio: LICENSE, SOURCE_LICENSE.md, SOURCE_PERMISSIONS.json
- Ficheros de validacion citados en el repositorio: manifest.json, validation.json, verification.json, application-tests-summary.json, runtime_config.json, native-1024.png
- Adaptacion de codigo z-image-swift (MIT, referenciada por el autor): no disponible como enlace directo en la informacion proporcionada
