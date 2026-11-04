# mradermacher/K-EXAONE-236B-A23B-GGUF

## Resumen

K-EXAONE-236B-A23B es un modelo de lenguaje de gran escala desarrollado por LG AI Research (LGAI-EXAONE) y publicado bajo la familia EXAONE. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 237.099.669.632 parámetros totales y 23B parámetros activos por token, lo que lo sitúa en la categoría de modelos de razonamiento de alta capacidad con un coste de inferencia muy inferior al de un modelo denso de su tamaño. La versión aquí documentada es la cuantización GGUF estática realizada por mradermacher, pensada para despliegue local y en entornos con recursos limitados mediante llama.cpp y ecosistemas compatibles.

El modelo base soporta seis idiomas (inglés, coreano, español, alemán, japonés y vietnamita) y está orientado a conversación y generación de texto. Su relevancia actual radica en la combinación de un tamaño total muy grande con un número de parámetros activos moderado, lo que permite ejecutar un modelo de gama alta en hardware de una sola máquina siempre que se disponga de suficiente memoria para los pesos cuantizados.

La ficha se centra en el artefacto GGUF, que ofrece cuantizaciones desde Q2_K (86,6 GB) hasta Q8_0 (252,1 GB en seis partes), con opciones intermedias IQ4_XS, Q4_K_M y Q5_K_M. La licencia es `k-exaone`, una licencia propia de LG AI Research que debe revisarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; detalles de capas y atención no disponibles en la información proporcionada |
| Parametros totales | 237.099.669.632 (237B) |
| Parametros activos | 23B (según nomenclatura A23B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); variantes imatrix en el repo i1-GGUF |
| Idiomas soportados | en, ko, es, de, ja, vi |
| Licencia | k-exaone (licencia propia de LG AI Research, categoría `other`) |
| Formato de pesos | GGUF (cuantizaciones); pesos originales en safetensors en el repo base |
| Tamano del repo GGUF | 1609,2 GB |
| Libreria declarada | transformers |
| Modelo base | LGAI-EXAONE/K-EXAONE-236B-A23B |

## Arquitectura y entrenamiento

La información disponible confirma que K-EXAONE-236B-A23B es un modelo Mixture of Experts con 237B parámetros totales y 23B activos, lo que implica que en cada paso de inferencia solo se activa aproximadamente un 9,7 % del total de parámetros. No se dispone en la documentación consultada de detalles sobre el número de expertos, la estrategia de enrutamiento, el número de capas, la dimensión oculta ni el mecanismo de atención empleado. Tampoco se especifican el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación.

El artefacto documentado es una cuantización estática GGUF generada por mradermacher a partir de los pesos originales en formato Hugging Face. Las cuantizaciones IQ (como IQ4_XS) emplean cuantización con información de importancia, y el autor ofrece además un repositorio separado con cuantizaciones ponderadas/imatrix (`K-EXAONE-236B-A23B-i1-GGUF`) que suelen ofrecer mejor calidad por tamaño que las estáticas equivalentes. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Soporte multilingüe para inglés, coreano, español, alemán, japonés y vietnamita.
- Razonamiento y generación de contenido general derivados de un modelo base de 237B parámetros totales con 23B activos.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Ejecución mediante llama.cpp y herramientas compatibles con GGUF.
- No se documentan en la información disponible capacidades específicas de tool calling, function calling, agentes, visión, audio o modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistente conversacional multilingüe: el modelo cubre seis idiomas, incluido el español, y puede gestionar diálogos multi-turno en atención al cliente o asistentes internos, siempre que se despliegue con la cuantización adecuada al hardware disponible.
- Generación de contenido en coreano e inglés: resulta adecuado para equipos que necesiten producir documentación, marketing o soporte en ambos idiomas con un único modelo, evitando mantener dos pilas de inferencia separadas.
- Procesamiento por lotes de textos largos: con cuantizaciones Q4_K_M (143,6 GB) o Q5_K_M (168,4 GB) puede ejecutarse en servidores con 192-256 GB de RAM o VRAM agregada para tareas offline de resumen, clasificación o extracción.
- Investigación sobre eficiencia de MoE: al tener 237B totales y 23B activos, es un caso de estudio útil para medir el equilibrio entre calidad y coste computacional en comparación con modelos densos de tamaño similar.
- Despliegue en infraestructura propia con llama.cpp: la disponibilidad de cuantizaciones desde Q2_K hasta Q8_0 permite ajustar el modelo a distintos presupuestos de memoria sin cambiar de arquitectura.
- Evaluación comparativa de cuantizaciones: el repositorio incluye variantes estáticas e imatrix, lo que permite medir la degradación de perplejidad y calidad entre Q2_K, IQ4_XS, Q4_K_M y Q6_K en tareas reales.
- Localización de productos para el mercado asiático: la cobertura de coreano, japonés y vietnamita lo hace útil para adaptar contenidos y flujos de soporte a esos mercados junto con español, alemán e inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: Q2_K 86,6 GB; Q3_K_S 102,5 GB; Q3_K_M 113,4 GB; Q3_K_L 122,9 GB; IQ4_XS 127,8 GB; Q4_K_S 134,9 GB; Q4_K_M 143,6 GB; Q5_K_S 163,4 GB; Q5_K_M 168,4 GB; Q6_K 194,7 GB; Q8_0 252,1 GB (en seis partes).
- No cabe en GPUs de consumo convencionales (8-24 GB) ni en una única RTX 4090. Requiere agregación de memoria: varias GPUs profesionales, RAM del sistema con offloading o servidores de gran capacidad.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, se necesitan configuraciones multi-GPU tipo A100/H100 con 80 GB cada una o servidores con 192-256 GB de RAM para las cuantizaciones más bajas.
- Opciones de despliegue: llama.cpp y ecosistemas compatibles con GGUF; el repositorio declara compatibilidad con endpoints y librería transformers para los pesos originales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| K-EXAONE-236B-A23B (esta ficha) | 237B | 23B | no disponible | k-exaone | GGUF, safetensors |
| Modelos MoE comparables de la misma escala | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos que permitan una comparación cuantitativa rigurosa. La comparación queda limitada a la arquitectura MoE con 237B totales y 23B activos, que la sitúa en la misma categoría de eficiencia que otros MoE de gran escala, pero sin cifras verificables de rendimiento.

## Limitaciones y advertencias

- La licencia `k-exaone` es una licencia propia de LG AI Research; es imprescindible revisar el archivo LICENSE del repositorio base antes de cualquier uso comercial o redistribución.
- No se han publicado datos de benchmarks, por lo que no es posible verificar el rendimiento real frente a modelos competidores.
- No se especifica la longitud de contexto soportada, lo que impide planificar cargas de trabajo con ventanas largas sin pruebas previas.
- Las cuantizaciones Q2_K y Q3_K_S implican pérdida de calidad significativa; para producción se recomienda IQ4_XS o superior, y Q6_K si la memoria lo permite.
- El tamaño del repositorio (1609,2 GB) y de cada archivo (hasta 252,1 GB en Q8_0) exige planificación de almacenamiento y descargas por partes.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se documentan evaluaciones de fidelidad factual en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada; deben evaluarse empíricamente antes de desplegar en dominios sensibles.
- El soporte de español está declarado, pero no se aportan métricas de calidad por idioma; conviene validar el rendimiento en castellano antes de usarlo en producción.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad sin verificación.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/K-EXAONE-236B-A23B-GGUF
- Modelo base: https://huggingface.co/LGAI-EXAONE/K-EXAONE-236B-A23B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/K-EXAONE-236B-A23B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#K-EXAONE-236B-A23B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
