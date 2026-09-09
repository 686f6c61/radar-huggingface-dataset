# mradermacher/Nova-1.1-0.8B-i1-GGUF

## Resumen

Nova-1.1-0.8B es un modelo de lenguaje de pequeño tamaño desarrollado por HyperAiCorp, orientado a tareas de asistente, uso de herramientas y agentes. El repositorio que nos ocupa contiene la versión cuantizada en formato GGUF con datos de importancia (imatrix) realizada por mradermacher, con una colección amplia de tipos de cuantización. Según los metadatos, el modelo está ajustado para instrucciones (instruction-tuning), soporta tool calling y function calling, y los idiomas declarados son inglés y ruso. A pesar de denominarse 0.8B, el conteo de parámetros totales en safetensors es de 1.006.672.704 (~1.0B). La model card de la cuantización indica que es un modelo de visión, aunque los archivos de proyección multimodal se alojan en un repositorio estático separado. Se distribuye bajo licencia Apache 2.0. No se han publicado detalles técnicos de la arquitectura ni resultados de benchmarks en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (los metadatos sugieren relación con la familia Qwen3.5, sin confirmación oficial) |
| Parámetros totales | 1.006.672.704 |
| Parámetros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | Inglés, ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con matriz de importancia); el modelo base también está disponible en safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura ni el proceso de entrenamiento de Nova-1.1-0.8B. Los metadatos de HuggingFace incluyen la etiqueta `qwen3.5`, lo que sugiere una posible derivación de la arquitectura de la serie Qwen, pero no existe confirmación oficial ni documentación técnica que lo respalde. Tampoco se dispone de datos sobre el conjunto de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF, DPO u otros algoritmos de alineación. La única información disponible es que se trata de un modelo ajustado para instrucciones, con capacidades de agente y tool use según sus etiquetas.

## Capacidades

- Generación de texto como asistente conversacional: el modelo está afinado para seguir instrucciones y mantener diálogos.
- Tool use y function calling: los metadatos indican soporte explícito para llamadas a funciones, lo que permite integrarlo en flujos de agente.
- Capacidades de agente: diseñado para tareas de razonamiento multi-paso y uso de herramientas en entornos locales.
- Visión: la model card de la cuantización señala que es un modelo de visión; para utilizarlo en ese modo es necesario cargar los archivos mmproj disponibles en el repositorio estático.
- Idiomas: inglés y ruso declarados como lenguajes soportados.
- No se especifican capacidades destacadas para generación de código, matemáticas avanzadas ni otras tareas especializadas.

## Casos de uso

- Asistentes conversacionales ligeros: ideal para chatbots de propósito general en inglés o ruso que deban ejecutarse en CPUs o GPUs de baja potencia. Su tamaño de ~1.0B permite una ejecución fluida en equipos de consumo.
- Agentes con llamada a funciones: al incorporar tool calling, puede utilizarse como núcleo de un agente que consulte APIs, bases de datos o ejecute acciones simples en un entorno de pruebas, por ejemplo mediante llama.cpp u Ollama.
- Prototipado de vision ligera: si se cargan los proyectores multimodales (mmproj) del repositorio estático, el modelo puede procesar imágenes. Aunque su tamaño limita la calidad, es útil para prototipos de clasificación o descripción de imágenes en local.
- Automatización de flujos de trabajo con herramientas externas: mediante function calling se puede integrar en scripts que parseen entradas y ejecuten comandos o llamadas REST, por ejemplo en pipelines de datos ligeros.
- Procesamiento de texto bilingüe: para aplicaciones que manejen documentación o soporte en inglés y ruso, el modelo cubre ambos idiomas sin necesidad de cambiar de modelo.
- Educación y experimentación: su licencia Apache 2.0 y su tamaño reducido lo hacen adecuado para investigar técnicas de cuantización, comparar métodos de matriz de importancia o probar conceptos de agentes sin requerir GPUs grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos verificados de MMLU, HumanEval, GSM8K ni de otras evaluaciones que permitan comparar objetivamente su rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada: para FP16, el modelo ocupa aproximadamente 2.0 GB solo en pesos; sumando activaciones y caché KV, se recomienda al menos 4 GB de VRAM para una inferencia cómoda.
- Con cuantización Q4_K_M (archivo de 0.8 GB), la VRAM necesaria ronda los 1.5-2 GB para contextos cortos, pudiendo ejecutarse en GPUs con 2 GB de VRAM.
- Con cuantizaciones más agresivas (IQ1, IQ2), el modelo cabe en menos de 1 GB de VRAM, aunque con mayor pérdida de calidad.
- GPUs recomendadas: cualquier tarjeta con 4 GB de VRAM (GTX 1650, RTX 3050) para FP16, o 2 GB para quants Q4/Q5. También puede ejecutarse en CPU con 8-12 GB de RAM usando llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp (por ser formato GGUF). El modelo base en safetensors se puede utilizar con Transformers, pero el repositorio actual está orientado a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Idiomas |
|---|---|---|---|---|
| Nova-1.1-0.8B (GGUF) | 1.006.672.704 | No disponible | Apache 2.0 | Inglés, ruso |
| Qwen2.5-0.5B | ~0.49B | 32K | Apache 2.0 | Multilingüe (inglés, chino, etc.) |
| Llama-3.2-1B | ~1.24B | 128K | Llama 3.2 Community License | Inglés, español, francés, alemán, etc. |

Los datos de los modelos comparados proceden de información pública y deben verificarse en sus fichas oficiales para confirmar los valores exactos. No se dispone de resultados de benchmarks de Nova-1.1-0.8B para establecer una comparación numérica fiable.

## Limitaciones y advertencias

- La documentación técnica del modelo original es muy escasa; no se han publicado papers, fichas técnicas ni detalles sobre los datos de entrenamiento.
- Al ser un modelo de ~1.0B, su capacidad de razonamiento y su coherencia en tareas complejas son limitadas en comparación con modelos mayores.
- Riesgo de alucinación: como en la mayoría de modelos pequeños, puede generar respuestas plausibles pero incorrectas, especialmente en dominios especializados.
- Longitud de contexto desconocida: al no estar disponible este dato, no es posible planificar su uso en conversaciones largas o documentos extensos con seguridad.
- Idiomas limitados: solo inglés y ruso están declarados; no se garantiza un rendimiento aceptable en otros idiomas.
- Para usar la capacidad de visión es necesario descargar los archivos mmproj desde el repositorio estático y cargarlos explícitamente, lo que añade complejidad al despliegue.
- La cuantización con imatrix puede introducir pérdida de calidad, especialmente en los tipos más agresivos (IQ1, IQ2). Se recomienda probar los quants Q4_K_M o Q5_K_M como opción equilibrada.
- Al no existir benchmarks publicados, cualquier afirmación sobre su calidad debe tratarse con precaución y validarse en el caso de uso concreto.

## Enlaces

- Repositorio actual de cuantizaciones: https://huggingface.co/mradermacher/Nova-1.1-0.8B-i1-GGUF
- Repositorio con cuantizaciones estáticas (incluye mmproj para visión): https://huggingface.co/mradermacher/Nova-1.1-0.8B-GGUF
- Modelo base original: https://huggingface.co/HyperAiCorp/Nova-1.1-0.8B
- Página conveniente para descarga y listado: https://hf.tst.eu/model#Nova-1.1-0.8B-i1-GGUF
