# mradermacher/Kreatix-K1-i1-GGUF

## Resumen

Kreatix-K1-i1-GGUF es una colección de cuantizaciones en formato GGUF del modelo Kreatix-K1, realizadas por el usuario mradermacher, un cuantizador muy activo en la comunidad de Hugging Face conocido por sus versiones imatrix (matriz de importancia) de modelos populares. El modelo base, Kreatix-K1, es desarrollado por KreatixLabs y se presenta como un modelo orientado a código y asistentes de programación, con etiquetas adicionales que indican que se trata de un merge (combinación de modelos) y que es "abliterated" (con los mecanismos de rechazo de instrucciones eliminados, lo que lo hace más complaciente ante cualquier prompt).

Esta ficha se centra en la versión cuantizada, cuya utilidad principal es permitir ejecutar un modelo de 7.615.616.512 parámetros en hardware de consumo, desde portátiles con poca VRAM hasta GPUs domésticas. Con cuantizaciones que van desde los 2,0 GB (i1-IQ1_S) hasta los 6,4 GB (i1-Q6_K), el modelo puede desplegarse con llama.cpp, Ollama, LM Studio u otras herramientas compatibles con GGUF. La licencia Apache 2.0 del modelo base permite uso comercial sin restricciones, lo que lo hace atractivo para integraciones en productos. No se ha publicado información sobre benchmarks, arquitectura detallada ni datos de entrenamiento del modelo base en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, según librería transformers) |
| Parametros totales | 7.615.616.512 (~7,6 B) |
| Parametros activos | no aplicable (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas imatrix) |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix); el modelo base está en safetensors |

## Arquitectura y entrenamiento

La información disponible sobre la arquitectura de Kreatix-K1 es escasa. Se sabe que es un modelo de aproximadamente 7,6 mil millones de parámetros, distribuido en formato safetensors y compatible con la librería transformers de Hugging Face. Las etiquetas del repositorio indican que se trata de un merge, es decir, un modelo construido combinando pesos de otros modelos preexistentes, una técnica habitual en la comunidad open source para mezclar capacidades de varios modelos base. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO.

La innovación principal de este repositorio no está en el modelo en sí, sino en el proceso de cuantización: mradermacher utiliza cuantizaciones imatrix (importance matrix) de llama.cpp, que calculan una matriz de importancia a partir de datos de calibración para asignar bits de forma más inteligente que las cuantizaciones estáticas. Según el propio autor, los quants imatrix suelen ofrecer mejor calidad que los quants estáticos de tamaño equivalente, especialmente en los niveles bajos (IQ1, IQ2, IQ3), donde la diferencia es más notable.

Un detalle importante: el modelo base está etiquetado como "abliterated", lo que significa que se ha aplicado algún método para eliminar sus comportamientos de rechazo ante solicitudes que el modelo original consideraría inapropiadas. Esto es relevante para evaluar los riesgos de despliegue en producción.

## Capacidades

- Generación de código: el modelo está etiquetado como "code" y "coding-assistant", orientado a tareas de programación.
- Asistente conversacional: la etiqueta "conversational" indica soporte para diálogo multi-turno.
- Ejecución local eficiente: gracias a las 24 variantes de cuantización, puede funcionar en hardware muy modesto (desde ~2 GB de almacenamiento en IQ1_S).
- Sin restricciones de alineación: al ser abliterated, responde a instrucciones sin los rechazos típicos de los modelos alineados (esto es una característica técnica, pero implica riesgos).
- No hay información disponible sobre: tool calling / function calling, capacidades de agentes, razonamiento multi-paso, soporte de visión o audio, ni modo de pensamiento extendido (thinking mode).

## Casos de uso

- Asistente de código local y privado: al tratarse de un modelo de 7,6 B enfocado a programación, puede ejecutarse en una estación de trabajo con GPU de consumo para autocompletado, generación de funciones y explicación de código sin enviar datos a servicios externos, algo valioso en entornos con requisitos de confidencialidad.
- Prototipado en portátiles sin GPU dedicada: la variante i1-Q4_K_M (4,8 GB) o incluso i1-IQ3_M (3,7 GB) puede ejecutarse en CPUs modernas con llama.cpp u Ollama a velocidades razonables para desarrollo individual.
- Integración en IDEs locales: mediante backends compatibles con GGUF (llama.cpp, LM Studio, Ollama), puede conectarse a extensiones de editor para asistir en la escritura de código en tiempo real.
- Evaluación y comparación de cuantizaciones: al disponer de 24 niveles de cuantización del mismo modelo, es un buen banco de pruebas para medir el impacto de la cuantización imatrix frente a la estática en tareas de código.
- Investigación sobre abliteration: al ser un modelo abliterated, sirve para estudiar el efecto de eliminar la alineación en el comportamiento y la calidad de modelos de código de tamaño medio.
- Chatbots de dominio técnico: su etiqueta conversacional y su tamaño contenido lo hacen apto para asistentes internos de documentación técnica o soporte sobre bases de código, ejecutándose on-premise.
- Despliegue en servidores de bajo coste: variantes como IQ2_M o Q3_K_S permiten servir el modelo en VPS o máquinas con 4-6 GB de RAM/VRAM para equipos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantización no incluye evaluaciones, y tampoco hay datos de MMLU, HumanEval, GSM8K u otras pruebas para el modelo base Kreatix-K1 en la información proporcionada.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente el tamaño del fichero de cuantización más overhead de contexto. Referencias concretas del repositorio:
  - i1-IQ1_S: 2,0 GB (cabe en casi cualquier GPU moderna o en CPU)
  - i1-IQ2_M: 2,9 GB
  - i1-Q3_K_M: 3,9 GB
  - i1-Q4_K_M: 4,8 GB (recomendada por el autor por equilibrio velocidad/calidad)
  - i1-Q5_K_M: 5,5 GB
  - i1-Q6_K: 6,4 GB (calidad casi equivalente al modelo completo)
- GPUs recomendadas: para la variante Q4_K_M, cualquier GPU con 6 GB de VRAM o más es suficiente (RTX 3060, RTX 4060, RTX 4090 con holgura amplia). Para Q6_K, GPUs de 8 GB o más (RTX 4070, RTX 4080, RTX 4090). En CPU, 8-16 GB de RAM bastan para la mayoría de las variantes.
- Consumer GPUs: sí, es plenamente ejecutable en GPUs de consumo. Incluso las variantes de mayor calidad (Q6_K, 6,4 GB) caben en GPUs de 8 GB de VRAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, GPT4All, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. No es un despliegue típico de vLLM o TGI, que están orientados a safetensors y servidores de alto rendimiento.
- Latencia y throughput: no disponible. En CPU moderna, un modelo de ~4-5 GB cuantizado suele alcanzar velocidades de decodificación de entre 10 y 30 tokens/s según la memoria y la CPU; en GPU de consumo, supera con holgura los 50 tokens/s. Estas cifras son estimaciones generales, no datos publicados para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Kreatix-K1 (este, cuantizado) | 7,6 B | GGUF (imatrix) | Apache 2.0 | Codigo, merge, abliterated | 24 quants, 2,0-6,4 GB |
| Qwen2.5-Coder-7B-Instruct | 7,6 B | safetensors, GGUF (comunidad) | Apache 2.0 | Codigo | Muy amplia, con benchmarks publicados |
| CodeLlama-7B-Instruct | 7 B | safetensors, GGUF (comunidad) | Llama 2 Community License | Codigo | Amplia |
| DeepSeek-Coder-V2-Lite-Instruct | 16 B (2,4 B activos, MoE) | safetensors, GGUF (comunidad) | DeepSeek License (uso comercial restringido) | Codigo | Amplia |

Comparación: dentro de la gama de modelos de código de ~7 B con licencia Apache 2.0, Qwen2.5-Coder-7B es el referente con resultados publicados en HumanEval y benchmarks similares, mientras que de Kreatix-K1 no hay datos verificables. La ventaja diferencial de esta ficha es la exhaustiva cobertura de cuantizaciones imatrix de mradermacher y el hecho de ser abliterated, algo que no ofrecen los modelos anteriores por defecto.

## Limitaciones y advertencias

- Modelo abliterated: al haberse eliminado los mecanismos de rechazo, puede generar contenido perjudicial, ofensivo o inseguro sin filtros. No es adecuado para despliegues orientados a usuarios finales sin capas de moderación adicionales.
- Modelo merge: al combinarse pesos de otros modelos, el comportamiento puede ser impredecible en dominios no cubiertos por los modelos origen, y no hay documentación pública sobre la receta del merge en la información disponible.
- Riesgo de alucinación: no hay evaluaciones publicadas; como con cualquier modelo de código de 7 B, puede generar código plausible pero incorrecto o con vulnerabilidades. Requiere revisión humana o tests automatizados.
- Idioma: declarado únicamente para inglés. El rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- Contexto: la longitud de ventana de contexto no está publicada; debe verificarse en la configuración del modelo base antes de diseñar aplicaciones con documentos largos.
- Cuantizaciones agresivas: las variantes IQ1_S, IQ1_M e IQ2_XXS (2,0-2,4 GB) implican degradación notable de calidad; el propio autor las marca como "para casos desesperados".
- Sin benchmarks ni documentación del modelo base: la falta de datos de evaluación dificulta decidir si es competitivo frente a alternativas consolidadas.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución sin restricciones relevantes, lo que no es una limitación en este caso.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/mradermacher/Kreatix-K1-i1-GGUF
- Modelo base: https://huggingface.co/KreatixLabs/Kreatix-K1
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Kreatix-K1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Kreatix-K1-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa del cuantizador: https://www.nethype.de/
