# kadirbekovvv/jevora-9b-v1

## Resumen

Jevora 9B V1 es un modelo de decisión derivado de `Qwen/Qwen3.5-9B` mediante fine-tuning con adaptadores LoRA y una cabeza de decisión inicializada desde el LM head. No es un modelo generativo de propósito general: recibe un contexto y entre un conjunto ordenado de 2 a 255 opciones y devuelve, en un único forward pass, una elección (índice basado en cero) y una probabilidad para cada opción. Su interfaz pública es un endpoint `POST /decision` con `context` y `options` de entrada y `choice` y `probabilities` de salida.

El modelo lo publica el usuario `kadirbekovvv` en Hugging Face bajo licencia Apache 2.0, con pesos en safetensors y BF16. El backbone permanece congelado; solo se entrenan 174,2 millones de parámetros de un total de 9,128 mil millones (rank-64 LoRA más la cabeza de decisión). El repositorio ocupa 36,2 GB y las descargas registradas son cero en el momento de la consulta.

La relevancia del modelo es acotada y conviene leerla con precisión: la model card distingue entre una V1.6 (resultados de investigación completados pero publicación pendiente) y una V1 histórica Full SFT, que es explícitamente la descarga funcional disponible y cuyos pesos y temperatura difieren de la V1.6. Además, la propia card advierte de que las probabilidades no están calibradas (ECE del 19,35 % tras recarga de pesos) y de que las transiciones de estado multi-paso y la ejecución de instrucciones siguen siendo puntos débiles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-9B) con backbone congelado, adaptadores LoRA rank-64 y cabeza de decisión inicializada desde el LM head |
| Parametros totales | 9,128 mil millones (9,13B) |
| Parametros activos | No aplica (no es MoE); 174,2 millones entrenables |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint post-entrenado `Qwen/Qwen3.5-9B` y congela el backbone. Sobre él se entrenan adaptadores LoRA de rango 64 y una cabeza de decisión inicializada a partir del LM head, de modo que el modelo produce una distribución sobre las opciones presentadas en lugar de tokens libres. El almacenamiento de pesos del backbone, los adaptadores y la cabeza es BF16. El pipeline declarado en Hugging Face es `multiple-choice` y requiere un cargador personalizado (`custom-loader`).

El entrenamiento de la V1.6 utilizó 570.616 presentaciones procedentes de 380.411 registros, con 71.327 actualizaciones del optimizador a batch global 8 sobre una única H100 PCIe, con un pico de memoria GPU asignada de 22,3 GiB. La selección del checkpoint se hizo por rendimiento en desarrollo. La temperatura es 1 sin calibración ajustada, y la card señala explícitamente que una mayor precisión en desarrollo no mejoró la calidad de las probabilidades: la NLL media pasó de 0,8650 a 1,0076 nats y el Brier multiclase de 0,4297 a 0,4481 tras la recarga de pesos guardados.

## Capacidades

- Decisión sobre conjuntos de opciones: dado un contexto y entre 2 y 255 opciones ordenadas, devuelve un índice de elección y una probabilidad por opción en un solo forward pass.
- Salida de probabilidades por opción, útil para ranking y selección con umbral.
- Interfaz de servicio definida: `POST /decision` con `context` y `options` como entrada y `choice` y `probabilities` como salida.
- Cobertura de peticiones alta en la evaluación publicada: 99,77 % (140.299 respondidas de 140.620; 321 no soportadas, 0 errores).
- Capacidad multilingüe: limitada al inglés según los metadatos del modelo.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Enrutamiento de peticiones: clasificar una consulta de usuario en una de N rutas o intenciones predefinidas, usando la probabilidad por opción para derivar a revisión humana cuando la confianza sea baja.
- Triaje de tickets de soporte: asignar cada ticket a una cola o categoría entre un conjunto ordenado de opciones, aprovechando la cobertura alta del modelo sobre peticiones bien formadas.
- Selección de respuesta en pipelines de generación: puntuar varias candidatas generadas por otro modelo y elegir la más probable según el contexto, en lugar de generar directamente.
- Moderación asistida: clasificar contenido en un conjunto acotado de etiquetas de política, con las probabilidades como señal auxiliar para umbrales configurables.
- Evaluación A/B de variantes: dado un contexto y un conjunto de variantes de texto o acción, obtener una distribución de preferencia para análisis comparativo.
- Clasificación de documentos cortos: asignar documentos a taxonomías cerradas de hasta 255 categorías en una sola pasada, sin generación autoregresiva.
- Investigación sobre modelos de decisión: servir como referencia reproducible para estudiar calibración y comportamiento de cabezas de decisión sobre un backbone congelado.

## Benchmarks y rendimiento

Los datos publicados corresponden a la V1.6 (checkpoint de investigación con publicación pendiente), no a los pesos V1 descargables.

| Medición | Resultado | Ámbito |
|---|---:|---|
| Decision Index public 0.3 | 49,83 puntos | Índice corregido por azar y ajustado por cobertura (0–100) |
| Puntuación bruta balanceada | 62,28 puntos | Puntuaciones nativas ponderadas; no es accuracy ordinaria |
| Cobertura de peticiones | 99,77 % | 140.299 respondidas / 140.620; 321 no soportadas, 0 errores |
| Desarrollo antes de entrenar | 235/352 · 66,76 % | Sistema de decisión inicializado, mismos registros |
| Desarrollo tras recarga de pesos | 254/352 · 72,16 % | Datos de selección, no test independiente |

| Métrica de probabilidad en desarrollo, T=1 | Antes de entrenar | Recarga de pesos guardados |
|---|---:|---:|
| NLL media (nats; menor es mejor) | 0,8650 | 1,0076 |
| Brier multiclase (menor es mejor) | 0,4297 | 0,4481 |
| ECE, 10 bins de igual anchura | 6,60 % | 19,35 % |

Comparativa en Decision Index Public (puntos, 0–100) según el board fijado el 6 de noviembre de 2026:

| Modelo | Parámetros | DI Public | Fuente del resultado |
|---|---:|---:|---|
| GLiDE 9B | 7,94B | 68,77 | Board |
| Bespoke Nimble 9B v3 | 9,65B | 57,19 | Board |
| Sieve 9B v2 | 9,65B | 53,35 | Board |
| Jevora V1.6 | 9,13B | 49,83 | Ejecución propia guardada |
| JPT-9B | 9,65B | 46,96 | Board |
| vLLM-SR Decision 2.0 Lux 9B | 9,65B | 46,76 | Board |

La card advierte de que se trata de una comparación descriptiva entre ejecuciones distintas, no de un experimento de entrenamiento controlado ni de un ranking oficial.

## Requisitos de hardware

- Pesos en BF16 de 9,13B parámetros: el repositorio ocupa 36,2 GB, lo que implica aproximadamente 18,3 GB solo para los pesos del backbone en BF16, más adaptadores y cabeza.
- Entrenamiento de referencia: una H100 PCIe con pico de 22,3 GiB de memoria asignada, batch global 8.
- Inferencia en BF16: se requiere una GPU con al menos 24 GB de VRAM para dejar margen a activaciones y contexto; una RTX 4090 (24 GB) o A100/H100 de 40-80 GB son opciones razonables.
- No se documentan cuantizaciones GGUF ni versiones de menor precisión; no hay datos publicados de latencia ni throughput.
- Opciones de despliegue: la card remite a un cargador personalizado y al código de inferencia del repositorio de GitHub; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | DI Public | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Jevora V1.6 | 9,13B | no disponible | 49,83 | Apache 2.0 | Pesos V1 en HF; V1.6 pendiente |
| GLiDE 9B | 7,94B | no disponible | 68,77 | no disponible | Board de referencia |
| Bespoke Nimble 9B v3 | 9,65B | no disponible | 57,19 | no disponible | Board de referencia |
| Sieve 9B v2 | 9,65B | no disponible | 53,35 | no disponible | Board de referencia |

Los tres comparables proceden del mismo board de Decision Index citado por el autor; no se dispone de sus fichas técnicas ni de sus condiciones de licencia en la información proporcionada.

## Limitaciones y advertencias

- Las probabilidades no están calibradas: ECE del 19,35 % con 10 bins tras la recarga de pesos, frente al 6,60 % antes de entrenar. No deben interpretarse como confianza calibrada.
- La V1.6 no está publicada: la descarga funcional es la V1 histórica Full SFT, con pesos y temperatura distintos de los resultados reportados.
- El resultado de 254/352 en desarrollo procede de datos de selección, no de un test independiente; la evaluación en memoria implicaba 256/352 y la causa de la discrepancia no está establecida.
- Puntos débiles declarados por el autor: transiciones de estado multi-paso y ejecución de instrucciones.
- Idiomas: solo inglés según los metadatos; no se documenta soporte multilingüe.
- Longitud de contexto no disponible, lo que impide planificar despliegues con contextos largos.
- Requiere cargador personalizado; no se confirma compatibilidad con los runners de inferencia habituales.
- Licencia Apache 2.0 permite uso comercial, pero la falta de benchmarks independientes y de calibración desaconseja su uso en producción sin validación propia.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kadirbekovvv/jevora-9b-v1
- Perfil del autor: https://huggingface.co/kadirbekovvv
- Código de inferencia: https://github.com/doxanocap/jevora-9b-v1
- Model card extendida: https://github.com/doxanocap/jevora-9b-v1/blob/main/docs/MODEL_CARD.md
- Contrato de benchmarks: https://github.com/doxanocap/jevora-9b-v1/blob/main/docs/BENCHMARKS.md
- Fuentes de comparación: https://github.com/doxanocap/jevora-9b-v1/blob/main/docs/BENCHMARKS.md#model-comparison-sources
- Evidencia agregada V1.6: assets/v16-evidence.json (en el repositorio de GitHub)
- Suite y scorer Decision Index 0.3: https://github.com/apolinario/decision-index/tree/25c6ec7b6b5f44a216c63c3a700de3a9c6d6699d
- Ficha en Benchmark Heaven: https://benchmarkheaven.com/jev-models/jevora-9b-v1
