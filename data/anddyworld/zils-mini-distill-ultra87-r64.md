# anddyworld/zils-mini-distill-ultra87-r64

## Resumen

Zils mini distill ultra87 r64 es un modelo de decisión derivado de zils-ai/d3-mini-4.5b-v1, publicado por el usuario anddyworld bajo licencia Apache 2.0. Se trata de un ajuste fino por destilación sobre un cuerpo base de 4.539 millones de parámetros (aproximadamente 4,5 mil millones), en el que se entrenó un LoRA de rango 64 para aproximar las probabilidades de opción del modelo mayor vllm-sr/d3-ultra sobre prompts de decisión públicos. El resultado se fusionó en los pesos del modelo base.

El modelo no es un generador de texto autónomo: tal como indica su model card, funciona como "cuerpo" (body) de un modelo de decisión dentro del pool d3-mini de la subred Zils. No incorpora su propia capa de respuesta ni runtime, sino que debe utilizarse junto con el chasis (chassis) fijado de d3-mini, que aporta la capa de respuesta y el entorno de ejecución. Los pesos del modelo de lenguaje se encuentran bajo el prefijo `language_model.*`, mientras que la torre de visión permanece sin cambios respecto al modelo padre.

Su relevancia es acotada y experimental: se publica como artefacto de investigación dentro de un ecosistema específico (Zils), con cero descargas y cero likes en el momento de la consulta, y sin documentación pública sobre idiomas, benchmarks o pipeline. Es útil para quienes trabajan con el chasis d3-mini y quieren evaluar una variante destilada de menor coste, pero no es un modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredera del modelo base d3-mini-4.5b-v1; detalles no disponibles) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF ni otras) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de zils-ai/d3-mini-4.5b-v1, un espejo de vllm-sr/d3-mini, y se entrena mediante destilación: se ajusta un LoRA de rango 64 para que reproduzca las probabilidades de opción del modelo mayor vllm-sr/d3-ultra sobre prompts de decisión públicos construidos a partir de los splits de entrenamiento de conjuntos de datos abiertos. Posteriormente, el adaptador LoRA se fusiona en los pesos del modelo base, dando lugar a un checkpoint único de aproximadamente 9,1 GB en el repositorio.

La arquitectura subyacente no se detalla en la información disponible más allá de la estructura del modelo padre, que incluye un modelo de lenguaje (bajo `language_model.*`) y una torre de visión que se mantiene sin cambios respecto al padre. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO. La innovación técnica destacable es el enfoque de destilación de probabilidades de decisión (no de texto libre) sobre un modelo mayor, orientado a tareas de selección entre opciones.

## Capacidades

- Modelo de decisión: produce probabilidades sobre opciones, no generación de texto libre de forma nativa.
- Requiere el chasis d3-mini (capa de respuesta y runtime) para funcionar; no incluye capa de respuesta propia.
- Conserva la torre de visión del modelo padre, por lo que hereda capacidades multimodales de entrada según el padre (no verificadas en la información disponible).
- Destilado para aproximar el comportamiento de vllm-sr/d3-ultra en prompts de decisión.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Evaluación de destilación en investigación: comparar las probabilidades de decisión de este modelo con las de vllm-sr/d3-ultra sobre el mismo conjunto de prompts, para medir la fidelidad de la destilación con LoRA r64.
- Clasificación y selección de opciones en pipelines del ecosistema Zils: integrar el cuerpo en el chasis d3-mini para tareas de decisión dentro de la subred, aprovechando que comparte interfaz con el padre.
- Experimentos de reducción de coste: sustituir el modelo mayor por esta variante destilada de 4,5 mil millones de parámetros en entornos donde el chasis d3-mini ya esté desplegado, para reducir requisitos de memoria y latencia.
- Investigación sobre prompts de decisión: usar el modelo como sujeto de prueba para estudiar cómo se comportan modelos destilados en tareas de elección entre opciones con datos abiertos.
- Desarrollo de prototipos multimodales: al conservar la torre de visión del padre, puede emplearse en experimentos que combinen entrada visual y decisión, siempre que el chasis lo permita.
- Reproducibilidad de artefactos: servir como referencia para replicar el proceso de destilación descrito (LoRA r64 sobre 87k prompts) y validar la metodología en otros modelos base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,539 mil millones de parámetros en safetensors (aproximadamente 9,1 GB en el repositorio), se estima un mínimo de unos 10-12 GB en precisión de 16 bits para cargar los pesos; en cuantizaciones de 8 bits o 4 bits (no publicadas) bajaría a rangos de 5-7 GB y 3-4 GB respectivamente, aunque estas cifras son estimaciones y no están confirmadas por el autor.
- GPU recomendadas: para FP16, una GPU con 16 GB o más (RTX 4090, A100 40 GB, H100). Para cuantización de 8 bits, una RTX 3090 o 4080 podría ser suficiente.
- ¿Cabe en GPU de consumo? Sí, en FP16 cabe en una RTX 4090 (24 GB) y en una RTX 3090 (24 GB); en cuantizaciones menores podría caber en GPUs de 8-12 GB, aunque no se publican pesos cuantizados.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el autor indica que debe usarse con el chasis d3-mini y su runtime, por lo que el despliegue está ligado a ese entorno.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| anddyworld/zils-mini-distill-ultra87-r64 | 4.539 M | No disponible | Apache 2.0 | Hugging Face (0 descargas) | Destilado de decision, requiere chasis d3-mini |
| zils-ai/d3-mini-4.5b-v1 (padre) | ~4.500 M | No disponible | Apache 2.0 | Hugging Face | Modelo base sin destilar |
| vllm-sr/d3-ultra (profesor) | No disponible | No disponible | Apache 2.0 | Hugging Face | Modelo mayor usado como referencia de destilacion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo autónomo: carece de capa de respuesta propia y depende del chasis d3-mini y su runtime para funcionar.
- Sin datos publicados de benchmarks, idiomas soportados ni contexto, lo que impide evaluar su calidad de forma objetiva.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser un destilado de un modelo mayor, puede heredar sesgos del profesor y del dataset de prompts de decisión.
- La destilación con LoRA r64 sobre 87k prompts puede no capturar todo el comportamiento del modelo profesor, especialmente en distribuciones fuera del conjunto de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia del chasis d3-mini puede imponer condiciones adicionales no especificadas.
- Cero descargas y cero likes en el momento de la consulta: ecosistema muy incipiente, sin validación comunitaria.
- No se publican pesos cuantizados ni integraciones con frameworks estándar (vLLM, llama.cpp, Ollama, TGI), lo que limita su adopción en producción.

## Enlaces

- [Hugging Face: anddyworld/zils-mini-distill-ultra87-r64](https://huggingface.co/anddyworld/zils-mini-distill-ultra87-r64)
- [Modelo base: zils-ai/d3-mini-4.5b-v1](https://huggingface.co/zils-ai/d3-mini-4.5b-v1)
- [Modelo profesor: vllm-sr/d3-ultra](https://huggingface.co/vllm-sr/d3-ultra)
