# hyokwan/kopo_gangseo_ocr_model_g3

## Resumen

kopo_gangseo_ocr_model_g3 es un ajuste fino del modelo multimodal google/gemma-3-27b-it, desarrollado por el usuario hyokwan, orientado a tareas de reconocimiento óptico de caracteres (OCR) sobre documentos del departamento de Gangseo de Korea Polytechnics Fintech. El modelo parte de la arquitectura Gemma 3, un transformer multimodal de 27.432.406.640 parámetros capaz de procesar entradas de imagen y texto, y ha sido adaptado mediante entrenamiento continuado sobre un dataset propio (hyokwan/ocr_dataset) especializado en este dominio documental concreto.

La relevancia del modelo es limitada y muy específica: se trata de un ajuste de nicho para un caso de uso institucional coreano, no de un modelo generalista. Su pipeline es image-text-to-text, lo que permite introducir imágenes de documentos y obtener texto estructurado como salida. La model card es extremadamente escueta y no documenta detalles de entrenamiento, hiperparámetros ni evaluación.

El modelo se distribuye con licencia Apache 2.0, está etiquetado únicamente para el idioma coreano (ko) y cuenta con un volumen de descargas muy bajo (31) y ninguna interacción social, lo que sugiere un uso interno o experimental más que una adopción comunitaria amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), image-text-to-text |
| Parametros totales | 27.432.406.640 (~27,4 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se asume compatibilidad con cuantizaciones estándar de Gemma 3, pero no se documenta) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de google/gemma-3-27b-it, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje para tareas image-text-to-text. El autor describe el proceso como un "continued pretraining" sobre la base Gemma 3 27B instruct, especializado en documentos de un departamento universitario concreto (Korea Polytechnics Fintech, departamento de Gangseo). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO adicionales.

La información disponible no detalla innovaciones técnicas propias más allá del ajuste sobre el dataset hyokwan/ocr_dataset. La model card incluye secciones genéricas de responsabilidad copiadas de la documentación de Llama 3 (mencionando Llama Guard 2 y Code Shield), lo que indica que no se realizó una adaptación cuidadosa de la documentación al modelo real.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos, con salida de texto.
- Procesamiento conjunto de imagen y texto (pipeline image-text-to-text).
- Generación de texto conversacional en coreano, heredada del modelo base instruct.
- Capacidades multimodales generales de Gemma 3 27B (comprensión de imágenes), aunque el ajuste está orientado a OCR documental.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al coreano según la etiqueta de idioma del modelo.
- Modo thinking, visión avanzada o audio: no documentado.

## Casos de uso

- Digitalización de formularios académicos: el modelo puede recibir imágenes de documentos del departamento de Gangseo y extraer el texto para su volcado en sistemas de gestión, gracias a su ajuste específico sobre ese tipo de documentos.
- Automatización de archivo documental institucional: procesamiento por lotes de expedientes escaneados de Korea Polytechnics Fintech para generar índices de texto buscables.
- Extracción de datos de matrículas y registros: al estar entrenado sobre un dataset del dominio, es adecuado para transcribir campos estructurados de documentos administrativos coreanos.
- Asistencia a la digitalización de material académico en coreano: conversión de apuntes o materiales impresos a texto editable.
- Prototipado de pipelines OCR con modelos multimodales: sirve como referencia para comparar el rendimiento de un ajuste de dominio frente al Gemma 3 base en tareas de OCR coreano.
- Investigación sobre ajuste fino multimodal: útil como caso de estudio de continued pretraining sobre un modelo de 27B para una tarea vertical concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara la métrica "accuracy" en los metadatos, sin aportar valores numéricos ni conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 55 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 64-80 GB.
- VRAM estimada con cuantización de 8 bits: en torno a 28-30 GB.
- VRAM estimada con cuantización de 4 bits: en torno a 15-18 GB, aunque la cuantización no está documentada oficialmente para este ajuste.
- GPU recomendadas: A100 80 GB, H100 80 GB o múltiples GPU de 24 GB en paralelo para BF16.
- GPU de consumo: posible en RTX 4090 (24 GB) únicamente con cuantización agresiva a 4 bits y contexto reducido; no cabe en GPU de 8-16 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta endpoints_compatible); vLLM, llama.cpp u Ollama no están documentados para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| kopo_gangseo_ocr_model_g3 | ~27,4 B | no disponible | ko | Apache 2.0 | OCR documental de dominio específico |
| google/gemma-3-27b-it | ~27,4 B | no disponible en la información | multilingüe | Gemma license | Multimodal generalista |
| Qwen2.5-VL-32B | ~32 B | no disponible en la información | multilingüe | Apache 2.0 | Multimodal generalista con OCR |
| InternVL2.5-26B | ~26 B | no disponible en la información | multilingüe | MIT | Multimodal generalista |

La comparación directa es difícil porque el modelo de hyokwan es un ajuste de nicho sin evaluación publicada; los alternativos son modelos generalistas con documentación y benchmarks extensos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un dataset institucional coreano concreto, puede presentar sesgo de dominio y degradar su rendimiento fuera de ese tipo de documentos.
- Riesgo de alucinación: presente como en cualquier modelo generativo; en OCR puede inventar caracteres o campos ausentes, especialmente con imágenes de baja calidad.
- Limitaciones de contexto e idioma: etiquetado solo para coreano; el soporte de otros idiomas no está garantizado y el contexto máximo no se especifica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Gemma 3 tiene su propia licencia de Google que puede imponer condiciones adicionales; conviene revisar ambas.
- Documentación insuficiente: la model card contiene secciones copiadas de Llama 3 y no describe el entrenamiento, los datos ni la evaluación, lo que dificulta su validación en producción.
- Madurez: 31 descargas y ninguna interacción indican ausencia de validación comunitaria; no se recomienda su uso en producción sin una evaluación propia.
- Uso previsto marcado como "TBD" por el autor, lo que refleja falta de definición sobre alcance y salvaguardas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hyokwan/kopo_gangseo_ocr_model_g3
- Dataset de entrenamiento: https://huggingface.co/datasets/hyokwan/ocr_dataset
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
