# OliviaRossi/MiMo-Ornith-9B-AGSI-IQ4_NL-GGUF

## Resumen

MiMo-Ornith-9B-AGSI-IQ4_NL-GGUF es una cuantización en formato GGUF del modelo OliviaRossi/MiMo-Ornith-9B-AGSI, un checkpoint de 9.197.093.888 parámetros (unos 9,2 mil millones) publicado por el usuario OliviaRossi en HuggingFace. El repositorio contiene el archivo cuantizado con el esquema IQ4_NL generado con imatrix a partir del modelo original, lo que reduce el peso del repositorio a 5,6 GB y lo hace ejecutable con llama.cpp en hardware de consumo.

Los metadatos del repositorio lo etiquetan como un merge orientado a razonamiento, generación de código, uso de herramientas (tool-use), uso de terminal (terminal-use) y tareas de tipo SWE-bench, con etiquetas que apuntan a una base de la familia Qwen3.5. La licencia declarada es Apache-2.0 y los idiomas soportados según la ficha son inglés (en) y chino (zh).

Su relevancia práctica reside en ofrecer un modelo de aproximadamente 9B con capacidades agénticas declaradas en un formato listo para inferencia local, sin necesidad de GPU de centro de datos. Sin embargo, la model card es mínima: se limita a documentar la conversión a GGUF mediante el espacio GGUF-my-repo y no aporta datos sobre entrenamiento, longitud de contexto, composición del dataset ni resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags del repositorio indican "qwen3_5"; sin confirmar en la model card) |
| Parametros totales | 9.197.093.888 (aprox. 9,2 mil millones) |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_NL con imatrix (este repositorio); otros esquemas no disponibles |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo mimo-ornith-9b-agsi-iq4_nl-imat.gguf); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 5,6 GB |
| Modelo base | OliviaRossi/MiMo-Ornith-9B-AGSI |
| Herramienta de conversion | llama.cpp, mediante el espacio GGUF-my-repo de ggml.ai |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

No se han publicado detalles de arquitectura ni de entrenamiento en la información disponible. La model card del repositorio GGUF es una plantilla de conversión automática y se remite siempre al modelo original, cuya ficha tampoco se ha proporcionado. Los únicos indicios son los tags del repositorio: "merge" (lo que sugiere que el checkpoint base se obtuvo combinando pesos de otros modelos), "qwen" y "qwen3_5" (familia de arquitectura de la que probablemente deriva), y "agsi", un acrónimo sin explicación documentada.

Tampoco hay datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF, DPO u otras técnicas de alineamiento, ni sobre innovaciones técnicas como decodificación especulativa o mecanismos de atención alternativos. El único proceso técnico documentado es la cuantización posterior: conversión a GGUF con llama.cpp y cuantización IQ4_NL guiada por matriz de importancia (imatrix).

## Capacidades

Las capacidades que se listan a continuación provienen exclusivamente de los tags declarados por el autor; no están verificadas con evaluación independiente.

- Generación de texto conversacional (tag "conversational", pipeline text-generation).
- Razonamiento (tag "reasoning").
- Generación de código (tag "coding").
- Uso de herramientas y function calling (tag "tool-use").
- Flujos agénticos y ejecución de tareas en varios pasos (tags "agentic", "swe-bench").
- Uso de terminal / shell (tag "terminal-use").
- Multilingüismo limitado a inglés y chino según el campo language del repositorio.
- Compatibilidad con endpoints de inferencia (tag "endpoints_compatible").
- Ejecución local mediante llama.cpp y llama-cpp-python (tags "llama-cpp", "gguf-my-repo").

No hay evidencia disponible de capacidades de visión, audio, modo de pensamiento explícito ni ventanas de contexto extensas.

## Casos de uso

- Asistencia a la programación en local: el modelo puede integrarse en un editor o IDE mediante llama-server para autocompletado y generación de funciones, ya que el tag "coding" apunta a entrenamiento específico en código y el formato GGUF permite ejecutarlo en una estación de trabajo sin GPU de centro de datos.
- Automatización de tareas de terminal: con el tag "terminal-use", puede emplearse como agente que traduce instrucciones en lenguaje natural a comandos de shell y encadena ejecuciones, siempre con supervisión humana por el riesgo de comandos destructivos.
- Agentes de resolución de incidencias tipo SWE-bench: puede formar parte de un pipeline que lea un repositorio, localice el archivo relevante, proponga un parche y lo valide con tests, aprovechando las etiquetas "agentic" y "swe-bench".
- Integración con herramientas externas vía function calling: al soportar "tool-use", es adecuado para orquestar APIs (consultas a bases de datos, servicios REST, cálculo) en un bucle de razonamiento multi-paso dentro de un backend propio.
- Asistencia al cliente bilingüe inglés-chino: al declarar únicamente esos dos idiomas, puede desplegarse en un chatbot de soporte para mercados anglófono y sinófono, con la limitación de que no cubriría castellano sin ajuste adicional.
- Prototipado y experimentación en investigación: con 5,6 GB de pesos, un investigador puede reproducir experimentos de razonamiento y agentes en una sola GPU de consumo, comparando variantes cuantizadas sin infraestructura dedicada.
- Inferencia en el borde o en portátiles: el tamaño del archivo permite ejecutar el modelo en equipos con memoria unificada (Apple Silicon) o GPUs de 8-12 GB, útil para demos offline y entornos sin conectividad.
- Generación de documentación técnica y resúmenes de código: puede emplearse para producir docstrings, explicaciones de fragmentos y notas de versión a partir de un repositorio, en un flujo por lotes servido con llama-server.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye ninguna tabla de MMLU, HumanEval, GSM8K, SWE-bench ni de otra métrica, y tampoco se han proporcionado datos del modelo base. Las etiquetas "swe-bench" y "reasoning" indican el dominio al que apunta el entrenamiento, pero no constituyen evidencia de rendimiento.

## Requisitos de hardware

Las cifras de esta sección son estimaciones derivadas del tamaño del modelo (9,197 mil millones de parámetros) y del esquema de cuantización IQ4_NL (aproximadamente 4,5 bits por peso). No proceden de mediciones publicadas por el autor.

- Tamano de los pesos: unos 5,2 GB (9,197e9 x 4,5 bits / 8). Coincide con el tamaño de repositorio declarado de 5,6 GB, que puede incluir metadatos u otros artefactos.
- VRAM estimada para inferencia (estimación, depende de la arquitectura y del KV cache):
  - Contexto 2.048 tokens: aproximadamente 6 GB.
  - Contexto 8.192 tokens: aproximadamente 7 GB.
  - Contexto 32.768 tokens: aproximadamente 10 GB o más.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB y RTX 4090 24 GB, todas suficientes en las configuraciones de contexto bajo y medio. En GPUs de 8 GB el modelo entra con cuantizaciones más agresivas o contextos cortos.
- Memoria unificada: equipos Apple Silicon con 16 GB o más pueden ejecutarlo mediante Metal en llama.cpp.
- GPU de centro de datos: A100 40/80 GB, H100 80 GB y L40S para despliegues concurrentes; en estos casos tiene más sentido servir el modelo sin cuantizar o con cuantizaciones de 8 bits.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server, tal como documenta la propia ficha), llama-cpp-python, Ollama importando el GGUF, LM Studio y servidores compatibles con la API de OpenAI a través de llama-server. vLLM y TGI no están orientados a GGUF, por lo que requerirían el checkpoint en safetensors.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por petición para este repositorio.

## Comparativa con modelos similares

No hay datos de rendimiento de este modelo que permitan una comparación cuantitativa. La tabla siguiente contrasta únicamente características verificables de modelos de la misma franja de tamaño. Las cifras de los modelos alternativos proceden de sus fichas públicas y pueden variar según la versión consultada.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-Ornith-9B-AGSI-IQ4_NL-GGUF | 9,2 mil millones | no disponible | Apache-2.0 | GGUF (IQ4_NL) | Repositorio con 0 descargas y 0 likes en el momento de la consulta |
| Qwen3-8B | 8,2 mil millones | 32.768 tokens nativos (ampliable) | Apache-2.0 | safetensors, GGUF | Ampliamente distribuido y validado por la comunidad |
| Llama-3.1-8B-Instruct | 8,03 mil millones | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Muy extendido, con licencia con cláusulas de uso aceptable |
| Gemma-2-9B-it | 9,24 mil millones | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Ampliamente distribuido, con licencia de uso condicionada |

En rendimiento no es posible comparar: el repositorio analizado no publica ningún benchmark y tampoco lo hace, según la información disponible, su modelo base.

## Limitaciones y advertencias

- Model card mínima: no documenta arquitectura, contexto, datos de entrenamiento, hiperparámetros de cuantización ni configuración recomendada de muestreo.
- Ausencia total de benchmarks: el rendimiento real en razonamiento, código y tareas agénticas es desconocido; las etiquetas "swe-bench" y "agentic" son declaraciones del autor, no resultados medidos.
- Cero validación comunitaria: el repositorio registra 0 descargas y 0 likes, por lo que no hay retroalimentación de terceros sobre su calidad o comportamiento.
- Procedencia de tipo merge: el modelo base es un merge con etiquetas que apuntan a la familia Qwen3.5, pero no se detalla qué modelos se combinaron ni con qué método. Esto dificulta auditar la procedencia de los pesos y los términos aplicables.
- Licencia: se declara Apache-2.0 para este repositorio, pero al tratarse de un merge conviene verificar que todos los modelos de origen permitan la relicencia bajo Apache-2.0 antes de un uso comercial.
- Cuantizacion con perdida: IQ4_NL es una cuantización de aproximadamente 4,5 bits por peso; puede degradar sutilmente el razonamiento y el uso de herramientas frente al checkpoint en safetensors, especialmente en tareas de código de varios pasos.
- Idiomas limitados: solo inglés y chino están declarados. No hay soporte anunciado de castellano, lo que limitaría su uso directo en productos en español.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no hay evaluación publicada de fidelidad factual ni de tasas de alucinación.
- Sesgos: no se ha publicado ninguna evaluación de sesgos, toxicidad o comportamientos indeseados.
- Uso en agentes de terminal: ejecutar comandos generados por el modelo sin sandbox ni confirmación humana implica riesgo de borrado de datos o acciones irreversibles.
- Metadatos inconsistentes: la fecha de creación registrada (2026-09-23) es posterior a la fecha de consulta habitual, lo que sugiere metadatos poco fiables; conviene tratarlos con cautela.
- Contexto desconocido: sin longitud de contexto declarada, no se puede garantizar el comportamiento en conversaciones largas ni planificar el consumo de VRAM con precisión.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/OliviaRossi/MiMo-Ornith-9B-AGSI-IQ4_NL-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/MiMo-Ornith-9B-AGSI
- Espacio de conversión GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
