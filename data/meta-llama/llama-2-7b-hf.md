# meta-llama/Llama-2-7b-hf

## Resumen

Llama-2-7b-hf es un modelo de lenguaje de 7 mil millones de parámetros desarrollado por Meta y publicado en julio de 2023. Se trata de la versión base (preentrenada) de la familia Llama 2, convertida al formato Hugging Face Transformers para facilitar su uso con la librería `transformers`. El modelo resuelve la necesidad de disponer de un modelo de lenguaje abierto, de alto rendimiento y con una licencia que permite su uso comercial bajo ciertas condiciones, lo que lo convirtió en un referente para la comunidad de investigación y desarrollo. Su arquitectura es un transformer autorregresivo (decoder-only) con una ventana de contexto de 4096 tokens, entrenado sobre 2 billones de tokens de datos públicos. Aunque ha sido superado por modelos posteriores, sigue siendo una opción sólida para tareas de generación de texto y como base para fine-tuning.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (decoder-only) |
| Parametros totales | 6.738.417.664 (aprox. 6,7 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible (compatible con cuantizaciones posteriores como 4-bit, 8-bit mediante herramientas externas) |
| Idiomas soportados | Inglés (principal) |
| Licencia | Llama 2 (licencia específica de Meta, con restricciones para uso comercial) |
| Formato de pesos | safetensors, pytorch |

## Arquitectura y entrenamiento

El modelo sigue un diseño de transformer autorregresivo optimizado, similar al de la primera generación de Llama, con mejoras en la normalización y la atención que aumentan la estabilidad durante el entrenamiento. Se entrenó desde cero sobre 2 billones de tokens de datos públicos, con un contexto de 4096 tokens, completando el preentrenamiento entre enero y julio de 2023. No se aplicaron técnicas de alineación como RLHF o DPO en esta versión base; el modelo se distribuye tal cual, sin fine-tuning para instrucciones o chat. Esto implica que, para tareas específicas, es necesario realizar un ajuste posterior con datos propios.

## Capacidades

- Generación de texto en inglés: produce texto coherente y contextualmente relevante, aunque sin alineación específica para seguir instrucciones complejas.
- Comprensión del lenguaje: puede utilizarse para tareas de clasificación, extracción de información y otras tareas de PLN mediante fine-tuning.
- Modelo base: no incluye soporte nativo para tool calling, agentes o razonamiento multi-paso; estas capacidades requieren entrenamiento adicional.
- Multilingüismo limitado: aunque el modelo puede generar texto en otros idiomas, su entrenamiento está centrado en inglés, por lo que el rendimiento en otros idiomas es inferior.
- No se especifican capacidades de visión, audio u otras modalidades.

## Casos de uso

- Fine-tuning para análisis de sentimiento: el modelo puede ajustarse con un conjunto de datos etiquetado para clasificar opiniones en positivas, negativas o neutras, aprovechando su capacidad de representación del lenguaje.
- Fine-tuning para generación de texto creativo: se puede entrenar con corpus literarios o periodísticos para generar artículos, cuentos o guiones con un estilo determinado.
- Fine-tuning para extracción de entidades nombradas (NER): ajustado con datos anotados, puede identificar personas, organizaciones, lugares, etc., en textos en inglés.
- Fine-tuning para resumen de documentos: entrenado con pares de documento-resumen, puede generar resúmenes concisos de artículos o informes.
- Fine-tuning para traducción automática: aunque el modelo es principalmente inglés, se puede adaptar con datos paralelos para traducir entre inglés y otros idiomas, aunque con rendimiento limitado.
- Fine-tuning para asistentes conversacionales: a partir del modelo base, se puede entrenar con datos de diálogo para crear un chatbot especializado en un dominio concreto (atención al cliente, soporte técnico, etc.).
- Investigación en interpretabilidad: al ser un modelo base, es útil para estudiar representaciones internas, sesgos y mecanismos de atención sin la influencia de un alineamiento posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión fp16 (2 bytes por parámetro) se requieren aproximadamente 13,5 GB; en cuantización de 8 bits, unos 6,7 GB; en cuantización de 4 bits, unos 3,4 GB.
- GPU recomendadas: para fp16, una GPU con 16 GB o más (por ejemplo, RTX 3090, RTX 4090, A100, H100). Para 8 bits, una GPU con 8 GB (RTX 3070, RTX 2080). Para 4 bits, una GPU con 4-6 GB (RTX 3060, RTX 2060).
- Es posible ejecutar el modelo en GPUs de consumo (gama media-alta) si se aplica cuantización.
- Opciones de despliegue: compatible con `transformers`, `vLLM`, `llama.cpp`, `Ollama`, `Text Generation Inference` (TGI) y otras herramientas de inferencia optimizada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama-2-7b-hf | 6,7B | 4096 | Llama 2 (restrictiva) | Gated en HuggingFace |
| Mistral-7B | 7,3B | 8192 (con ventana deslizante) | Apache 2.0 | Abierto |
| Falcon-7B | 7B | 2048 | Apache 2.0 | Abierto |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La elección entre estos modelos dependerá de la licencia, el contexto y las necesidades de fine-tuning.

## Limitaciones y advertencias

- Modelo base no alineado: puede generar contenido sesgado, ofensivo o inapropiado, y no sigue instrucciones de forma fiable sin fine-tuning.
- Riesgo de alucinación: como todo modelo de lenguaje, puede producir información falsa o inventada con alta confianza.
- Contexto limitado a 4096 tokens: no es adecuado para tareas que requieran ventanas de contexto muy largas.
- Idioma principal: el rendimiento en idiomas distintos del inglés es notablemente inferior.
- Licencia Llama 2: requiere aceptar los términos de uso de Meta. Para uso comercial con más de 700 millones de usuarios mensuales, es necesario obtener una licencia comercial específica.
- Acceso restringido en HuggingFace: el modelo es de acceso gated, por lo que es necesario iniciar sesión y aceptar las condiciones para descargarlo.

## Enlaces

- HuggingFace: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Paper (arXiv): https://arxiv.org/abs/2307.09288
- Repositorio oficial de Meta: https://github.com/meta-llama/llama
- Organización Meta Llama en HuggingFace: https://huggingface.co/meta-llama
