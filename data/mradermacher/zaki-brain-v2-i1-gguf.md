# mradermacher/zaki-brain-v2-i1-GGUF

## Resumen

`mradermacher/zaki-brain-v2-i1-GGUF` es una colección de cuantizaciones GGUF del modelo base `harirhm/zaki-brain-v2`, generadas por mradermacher mediante el método imatrix (importance matrix). El modelo original cuenta con 4.628.569.635 parámetros (aproximadamente 4,63 mil millones), lo que lo sitúa en la categoría de modelos de tamaño medio, adecuados para despliegue en hardware de consumo. La model card lo etiqueta como conversacional y en inglés.

El repositorio no documenta la arquitectura interna, el contexto máximo, la licencia ni los datos de entrenamiento del modelo base; la información disponible se limita a los metadatos de Hugging Face y a la tabla de cuantizaciones publicada. El pipeline no está declarado y el modelo base no expone detalles técnicos en la información proporcionada.

La relevancia de este repositorio es práctica: ofrece hasta 23 variantes de cuantización GGUF con distintos tamaños (desde 2,4 GB en IQ1_S hasta 3,9 GB en Q6_K), lo que permite ejecutar el modelo en GPU de consumo y en CPU mediante llama.cpp u Ollama. El repo completo ocupa 73,3 GB y acumula 9.873 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `harirhm/zaki-brain-v2`, sin detalles publicados) |
| Parametros totales | 4.628.569.635 (4,63 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-IQ3_XXS, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (todas con imatrix) |
| Idiomas soportados | ingles (`en` segun la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (con fichero imatrix adicional de 0,1 GB) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base `harirhm/zaki-brain-v2`: la model card del repositorio de cuantizaciones no describe si se trata de un transformer denso, un MoE o una arquitectura híbrida, ni detalla el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de RLHF o DPO. El único dato estructural confirmado es el recuento de parámetros (4.628.569.635), obtenido de los pesos en safetensors del modelo base.

La contribución técnica de este repositorio es la cuantización con imatrix (importance matrix): mradermacher genera un fichero imatrix (0,1 GB) que se usa para ponderar la cuantización de los tensores según su importancia, produciendo las variantes `i1-*`. Según las notas del autor, las cuantizaciones IQ suelen preferirse frente a cuantizaciones no-IQ de tamaño similar, y variantes como i1-IQ3_S "superan a Q3_K*". También se ofrece un conjunto de cuantizaciones estáticas en el repositorio hermano `mradermacher/zaki-brain-v2-GGUF`.

## Capacidades

- Generación de texto conversacional: la model card etiqueta el modelo como `conversational`, orientado a diálogo multi-turno.
- Idiomas: inglés declarado en los metadatos (`language: en`); no se documentan otras lenguas.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse a través de infraestructura de inferencia compatible con la API de Hugging Face.
- Ejecución local: al estar en formato GGUF, es compatible con llama.cpp, Ollama y otros runners GGUF.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponibles en la información proporcionada.
- Visión, audio o modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Chat local en GPU de consumo: con las cuantizaciones i1-Q4_K_M (3,5 GB) o i1-Q4_K_S (3,5 GB), el modelo cabe en GPU con 6-8 GB de VRAM y permite desplegar un asistente conversacional en inglés sin conexión a servicios externos.
- Prototipado rápido en CPU: las variantes i1-IQ2_M (2,7 GB) o i1-Q3_K_M (3,3 GB) permiten ejecutar el modelo en portátiles sin GPU dedicada mediante llama.cpp, a costa de menor calidad.
- Integración en aplicaciones de escritorio: al ser GGUF, puede empaquetarse con Ollama o llama.cpp en herramientas de escritorio que requieran un modelo conversacional local sin dependencia de red.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 23 variantes del mismo modelo, lo que permite medir el impacto de la cuantización (de IQ1 a Q6_K) sobre la perplejidad y la calidad de las respuestas en un mismo modelo base.
- Filtrado y generación de texto en pipelines por lotes: con throughput alto en GPU para las variantes Q4, el modelo puede emplearse para tareas de generación de texto en inglés en procesos offline.
- Base para fine-tuning o experimentación: el modelo base en safetensors (referenciado por el repositorio de cuantizaciones) puede servir como punto de partida para ajuste fino, aunque no se documentan recetas de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de fichero GGUF, con overhead adicional de contexto y caché KV):
  - i1-IQ1_S: 2,4 GB
  - i1-IQ2_M: 2,7 GB
  - i1-Q3_K_M: 3,3 GB
  - i1-IQ4_XS: 3,4 GB
  - i1-Q4_K_M: 3,5 GB
  - i1-Q5_K_M: 3,7 GB
  - i1-Q6_K: 3,9 GB
- GPU recomendadas: para las variantes Q4 en adelante, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es suficiente; una RTX 4090 permite ejecutar la variante Q6_K con contexto largo. Para despliegue en servidor, A100 o H100 no son necesarias dado el tamaño del modelo, pero permiten mayor paralelismo y throughput.
- Cabe en GPU de consumo: sí, todas las variantes caben en GPU con 6 GB o más de VRAM; las variantes IQ1/IQ2 pueden caber en 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runner compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia tipo TGI o similares, aunque no se detalla.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre el modelo base (`harirhm/zaki-brain-v2`) más allá de su recuento de parámetros, por lo que no es posible comparar su rendimiento, contexto o licencia con alternativas. La comparación se limita a nivel de formato y tamaño de cuantización.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `mradermacher/zaki-brain-v2-i1-GGUF` (este) | 4,63 B | no disponible | no disponible | GGUF (23 variantes imatrix) | Hugging Face, 9.873 descargas |
| `mradermacher/zaki-brain-v2-GGUF` (cuantizaciones estáticas) | 4,63 B | no disponible | no disponible | GGUF estáticas | Hugging Face |
| `harirhm/zaki-brain-v2` (modelo base) | 4,63 B | no disponible | no disponible | safetensors | Hugging Face |

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del modelo base ni de las cuantizaciones, lo que impide confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base `harirhm/zaki-brain-v2` antes de cualquier despliegue en producción.
- Idioma: solo se declara inglés; el rendimiento en castellano u otras lenguas no está documentado y probablemente sea limitado.
- Contexto desconocido: no se publica la longitud máxima de contexto, por lo que no se puede garantizar el comportamiento en conversaciones largas o documentos extensos.
- Riesgo de alucinación: no hay datos de evaluación que permitan cuantificar la tasa de alucinación; al ser un modelo de 4,63 B sin benchmarks publicados, la fiabilidad en tareas factuales es incierta.
- Sesgos: no se documentan sesgos conocidos ni medidas de mitigación.
- Calidad de las cuantizaciones extremas: las variantes IQ1 e IQ2 (2,4-2,7 GB) degradan notablemente la calidad; el propio autor las describe como "for the desperate" o "mostly desperate". Para producción se recomienda Q4_K_M o superior.
- Ficheros multiparte: algunas variantes pueden estar divididas en varios ficheros GGUF; es necesario concatenarlas según las instrucciones de TheBloke referenciadas en la model card.
- Sin garantías de soporte: el repositorio es una cuantización de terceros (mradermacher), no el modelo oficial; cambios o retiradas del modelo base pueden afectar la reproducibilidad.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/zaki-brain-v2-i1-GGUF
- Modelo base: https://huggingface.co/harirhm/zaki-brain-v2
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/zaki-brain-v2-GGUF
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#zaki-brain-v2-i1-GGUF
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad de ikawrakow sobre cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del autor: https://www.nethype.de/
