# bambocher/LFM2.5-24B-A2B-oQ2.7e

## Resumen
LFM2.5-24B-A2B-oQ2.7e es un checkpoint cuantizado del modelo LFM2.5-24B-A2B, publicado por bambocher en HuggingFace. No es un modelo entrenado desde cero: es una versión post-entrenamiento para MLX (Apple Silicon) que conserva 23.971.587.712 parámetros totales y ocupa 9,8 GB en el repositorio.

Su interés es práctico: comprime un MoE de ~24B parámetros (etiqueta `lfm2_moe`) a 9,100 GiB de pesos con una media de 3,261 bits/peso, lo que permite inferencia local en un Mac con 16 GB de memoria unificada. La cuantización mixta oQ (oMLX v0.7.1) asigna 2 bits al 45,352% de los pesos, 3 bits al 50,391%, 8 bits al 4,234% y BF16 al 0,022%.

No se documentan licencia, idiomas, contexto, parámetros activos ni benchmarks. Cualquier uso en producción exige validar el modelo base y la degradación introducida por una cuantización tan agresiva.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) según la etiqueta `lfm2_moe`; número de expertos, capas y atención no disponibles |
| Parámetros totales | 23.971.587.712 (~24B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX oQ mixta: affine 2-bit grupo 64 (45,352% de pesos), 3-bit grupo 64 (50,391%), 8-bit grupo 64 (4,234%), BF16 (0,022%); media efectiva 3,261 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors para MLX; repo de 9,8 GB, pesos de 9,100 GiB |

## Arquitectura y entrenamiento
El checkpoint es una cuantización post-entrenamiento de un modelo MoE. La etiqueta `lfm2_moe` confirma la familia, pero no se aportan datos sobre número de expertos, capas, mecanismo de atención ni longitud de contexto. El nombre A2B sugiere 2B parámetros activos, aunque este dato no se confirma en la model card. El autor no describe el dataset de entrenamiento, el número de tokens ni si hubo RLHF/DPO; esa información correspondería al modelo base, que no se detalla.

La innovación técnica del repositorio es la cuantización mixta oQ: 10,872B pesos en affine 2-bit grupo 64 (3,164 GiB), 12,080B en 3-bit grupo 64 (4,922 GiB), 1,015B en 8-bit grupo 64 (1,004 GiB) y 0,005B en BF16 (0,010 GiB). El resultado son 9,100 GiB con 3,261 bits/peso efectivos. No hay información sobre calibración, dataset de calibración ni evaluación de degradación.

## Capacidades
- Generación de texto: no disponible; se heredaría del modelo base, sin evaluación documentada.
- Razonamiento, matemáticas y código: no disponible.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Única capacidad documentada: carga en MLX y desglose de cuantización por tensor.

## Casos de uso
- Inferencia local en Mac Apple Silicon: cargar el checkpoint con MLX y ejecutar un MoE de ~24B en 9,100 GiB de pesos, útil para pruebas sin GPU dedicada.
- Evaluación de cuantización agresiva: medir perplejidad y calidad en tareas del modelo base para estudiar el impacto de 2 y 3 bits en un MoE.
- Prototipado de asistentes conversacionales offline: desplegar en un Mac con 16 GB para escenarios de privacidad, sujeto a que el modelo base conserve calidad suficiente.
- Investigación en técnicas oQ: analizar la distribución de bits por tensor y comparar con otras cuantizaciones del mismo modelo.
- Integración en aplicaciones macOS mediante MLX: embeber el modelo en herramientas locales de generación de texto o análisis.
- Benchmarking de throughput en hardware consumer: medir tokens/s en Apple M-series, aunque no hay datos publicados de latencia.
- Docencia y reproducibilidad: estudiar el formato MLX y safetensors en un caso real de cuantización mixta.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. Tampoco se aportan métricas de latencia, throughput ni perplejidad.

## Requisitos de hardware
- Memoria: 9,100 GiB solo para pesos; con overhead de KV cache y activaciones se recomiendan 16 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: Apple M1, M2, M3 o M4 con 16 GB o más; MLX no soporta de forma nativa GPU CUDA.
- Consumer GPU: cabe en Mac con memoria unificada suficiente; no es directamente ejecutable en RTX sin conversión de formato.
- Opciones de despliegue: MLX, `mlx-lm` y oMLX; vLLM, llama.cpp, Ollama o TGI no son compatibles de forma nativa con este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | 24B totales; activos no disponibles | no disponible | 3,261 bits/peso; ~9,1 GiB | no disponible | HuggingFace, MLX |
| LFM2.5-24B-A2B original (BF16, estimado) | 24B totales | no disponible | BF16; ~48 GB estimados | no disponible | no disponible en la información |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Sin benchmarks ni evaluaciones de calidad: no hay evidencia del impacto de la cuantización en razonamiento, código o multilingüismo.
- Cuantización agresiva: el 45,352% de los pesos está a 2 bits, lo que puede degradar tareas sensibles a precisión.
- Contexto e idiomas no documentados: no se puede planificar su uso en conversaciones largas ni en idiomas distintos del inglés sin validación.
- Formato MLX: no portable directamente a ecosistemas CUDA o a herramientas como vLLM o llama.cpp.
- Repositorio con 5 descargas y 0 likes: poca validación comunitaria.
- Riesgo de alucinación y sesgos: inherente a los modelos de lenguaje, no evaluado en esta ficha.
- No usar en producción sin comparar contra el modelo base y medir la degradación en las tareas objetivo.

## Enlaces
- [HuggingFace: bambocher/LFM2.5-24B-A2B-oQ2.7e](https://huggingface.co/bambocher/LFM2.5-24B-A2B-oQ2.7e)
- [oQ / oMLX en GitHub](https://github.com/jundot/omlx)
