# Henard224/UAV-PUR-4B

## Resumen

UAV-PUR-4B es un modelo vision-lenguaje especializado en imágenes de dron, desarrollado por Henard224 mediante fine-tuning supervisado de Qwen3-VL-4B-Instruct. Está diseñado para resolver tareas de percepción, comprensión y razonamiento sobre escenas aéreas captadas por UAV: reconocimiento de objetos, conteo, grounding visual, juicio espacial, juicio condicional y razonamiento sobre una o varias imágenes. El modelo se publica como pesos fusionados completos en BF16, sin necesidad de cargar adaptadores PEFT por separado.

Con 4.437.815.808 parámetros (aproximadamente 4,4 mil millones), hereda la arquitectura transformer multimodal de la familia Qwen3-VL, incluyendo el merger visual principal y tres mergers DeepStack. Su relevancia actual reside en que cubre un nicho poco atendido por los modelos generalistas: el análisis automatizado de imagery de drones, con soporte para respuestas de opción múltiple y predicciones abiertas de cajas y conteos, lo que lo hace directamente aplicable a pipelines de inspección, vigilancia y teledetección de baja altitud.

La ventana de contexto, los idiomas soportados más allá del inglés y los detalles de cuantización no están documentados en la información disponible. La licencia Apache-2.0 de los pesos facilita su integración en productos comerciales, si bien el dataset de evaluación asociado (Drone-PUR Benchmark) se distribuye bajo CC BY-NC-SA 4.0, lo que restringe su uso a fines no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (Qwen3-VL), con merger visual principal y tres mergers DeepStack |
| Parametros totales | 4.437.815.808 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | Ingles (segun metadatos del modelo) |
| Licencia | Apache-2.0 (pesos); dataset Drone-PUR bajo CC BY-NC-SA 4.0 |
| Formato de pesos | Safetensors (BF16), modelo fusionado completo con processor y chat template incluidos |

## Arquitectura y entrenamiento

UAV-PUR-4B parte de Qwen3-VL-4B-Instruct, un transformer multimodal que combina un codificador visual con un modelo de lenguaje y mecanismos de fusión profunda (DeepStack mergers) para integrar características visuales en varias capas del decoder. Sobre esta base, el autor aplica un fine-tuning por etapas: LoRA sobre los pesos de lenguaje y mergers visuales entrenables. En las primeras etapas se emplean cabezas auxiliares de cajas, conteo y detección para supervisión adicional; la etapa final optimiza con entropía cruzada sobre tokens de respuesta en una mezcla de muestras de opción múltiple y de formato abierto. En inferencia se utiliza únicamente la cabeza de salida del modelo de lenguaje.

El entrenamiento se realiza sobre los datos de Drone-PUR, un conjunto orientado a tareas de percepción aérea. El modelo card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, y no se menciona el uso de RLHF o DPO. La innovación técnica destacable es la combinación de supervisión auxiliar con cabezas específicas de tarea (grounding, conteo, detección) durante el entrenamiento y su eliminación en la etapa final, lo que permite un único modelo de chat capaz de emitir tanto respuestas de opción múltiple como cajas y conteos en texto abierto. El repositorio incluye el procesador y la plantilla de chat, y requiere `transformers>=4.57` con `attn_implementation="sdpa"`.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes de dron.
- Reconocimiento de objetos en escenas aéreas.
- Conteo de instancias (predicciones abiertas de conteo).
- Grounding visual: localización de objetos mediante cajas delimitadoras en formato abierto.
- Juicio espacial: relaciones de posición y disposición entre objetos en la imagen.
- Juicio condicional: respuestas condicionadas a atributos o estados observados.
- Razonamiento sobre una sola imagen y sobre múltiples imágenes (multi-image reasoning).
- Soporte de respuestas de opción múltiple, útil para evaluación estandarizada.
- Entrada multimodal RGB y TIR (infrarrojo térmico) en tareas multi-modal reasoning (MMR).
- Entrada multi-vista (MVR) con pares de vistas ordenadas.
- Entrada de frames temporalmente ordenados con objetivo de referencia marcado en el primer frame (MIG).
- Conversacional: plantilla de chat incluida y compatible con el pipeline `image-text-to-text`.
- Compatible con endpoints de Hugging Face (`endpoints_compatible` en metadatos).

## Casos de uso

- Inspección de infraestructuras con drones: el modelo puede analizar imágenes aéreas de tendidos eléctricos, puentes o paneles solares y emitir conteos y localizaciones de elementos mediante grounding visual, integrándose en un pipeline de revisión automatizada tras el vuelo.
- Vigilancia y monitorización de perímetros: con soporte de entrada RGB y TIR (MMR), puede procesar pares de imágenes visibles y térmicas para detectar presencia de objetos o personas en condiciones de baja visibilidad.
- Conteo de vehículos o personas en imágenes aéreas: sus predicciones abiertas de conteo permiten estimar ocupación de aparcamientos, afluencia en eventos o densidad de tráfico sin necesidad de un detector especializado adicional.
- Reconstrucción y análisis multi-vista: con entradas MVR (view 1 y view 2 ordenadas) puede comparar dos perspectivas de la misma escena para tareas de cambio, correspondencia o verificación.
- Seguimiento sobre secuencias temporales: con entradas MIG de frames ordenados y un objetivo de referencia marcado en el primer frame, puede razonar sobre la evolución de un objeto a lo largo de la secuencia.
- Asistentes conversacionales para operadores de UAV: al ser un modelo de chat con plantilla incluida, puede gestionar consultas multi-turno sobre imágenes capturadas, respondiendo en formato de opción múltiple o abierto según la tarea.
- Evaluación y benchmarking de modelos aéreos: sirve como referencia para comparar sistemas de percepción en el Drone-PUR Benchmark, con prompts de tarea y preparación de cajas de referencia documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 9 GB solo para pesos (4,4 mil millones de parámetros a 2 bytes), más overhead de activaciones y del codificador visual; se recomienda un mínimo de 12-16 GB de VRAM.
- Cuantización: no se documentan versiones GGUF, AWQ ni GPTQ en la información disponible; el repositorio solo contiene safetensors BF16.
- GPU recomendadas: A100 o H100 para despliegue de producción con mayor throughput; RTX 4090 (24 GB) para inferencia en BF16 con holgura; RTX 3090 (24 GB) también viable.
- GPU de consumo: cabe en GPUs con 16 GB o más (RTX 4080, RTX 4060 Ti 16 GB, RTX 3090, RTX 4090) en BF16; en GPUs de 8-12 GB requeriría cuantización, no publicada oficialmente.
- Opciones de despliegue: `transformers` con `Qwen3VLForConditionalGeneration` y `attn_implementation="sdpa"`; compatible con Accelerate y `device_map="auto"`; endpoints de Hugging Face. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UAV-PUR-4B | 4.437.815.808 | No disponible | Vision-lenguaje para imagenes de dron (grounding, conteo, MMR/MVR/MIG) | Apache-2.0 | Hugging Face |
| Qwen3-VL-4B-Instruct | No disponible en la informacion | No disponible | Vision-lenguaje generalista | No disponible en la informacion | Hugging Face |
| Alternativas especializadas en UAV de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación cuantitativa con otros modelos especializados en imagery de dron no está disponible en la información proporcionada. El referente directo es su modelo base, Qwen3-VL-4B-Instruct, del que hereda arquitectura y capacidades generales, pero sobre el que no se aportan métricas comparativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre un dataset específico de drones, puede generalizar peor fuera de ese dominio (imágenes terrestres, otras altitudes o sensores).
- Riesgo de alucinación: como todo modelo generativo multimodal, puede producir descripciones, conteos o cajas plausibles pero incorrectas, especialmente en escenas densas u oclusiones.
- Limitaciones de idioma: los metadatos indican únicamente inglés; el rendimiento en castellano u otros idiomas no está verificado.
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que impide planificar tareas con muchas imágenes o secuencias largas.
- Restricciones de licencia: los pesos son Apache-2.0 y permiten uso comercial; sin embargo, el Drone-PUR Benchmark se distribuye bajo CC BY-NC-SA 4.0, por lo que su uso queda restringido a fines no comerciales y con obligación de compartir igual.
- Formato de despliegue: solo se publican pesos BF16 fusionados; no hay cuantizaciones oficiales, lo que limita el despliegue en hardware de gama baja.
- Madurez: el modelo tiene muy pocas descargas y likes en el momento de la ficha, y no se han publicado benchmarks en la información disponible; conviene validarlo en el dominio objetivo antes de usarlo en producción.
- Requisitos de entorno: necesita `transformers>=4.57` y un entorno compatible con Qwen3-VL; versiones anteriores no cargarán la arquitectura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Henard224/UAV-PUR-4B
- Paper: https://arxiv.org/abs/2610.40801
- Drone-PUR Benchmark: https://huggingface.co/datasets/Henard224/Drone-PUR-Benchmark
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
