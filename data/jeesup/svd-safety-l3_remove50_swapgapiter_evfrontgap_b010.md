# Jeesup/svd-safety-l3_remove50_swapgapiter_evfrontgap_b010

## Resumen

svd-safety-l3_remove50_swapgapiter_evfrontgap_b010 es un checkpoint derivado de meta-llama/Meta-Llama-3-8B-Instruct publicado por el usuario Jeesup en HuggingFace. Se trata de un artefacto de investigación: el modelo base se ha comprimido con la técnica SVD-LLM hasta eliminar el 50,03 % de los parámetros densos (fracción resultante de 0,4997) y, a continuación, se ha editado con 10 de 10 rondas de sustitución iterativa y neutra de parámetros ("parameter-neutral swap") guiadas por la regla de selección `gap_iter`.

La edición incorpora 69.735.424 parámetros (el 1,00 % de los parámetros de proyección densos) mediante valor de inserción, con desalojo ordenado por sigma. En total se restauraron 11.051 componentes y se sustituyeron 5.304, con semilla 42 y un presupuesto de 0,100 % de parámetros densos por ronda (1,000 % acumulado). El objetivo declarado no es ofrecer un asistente conversacional, sino cuantificar cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor.

El checkpoint acumulaba 0 descargas y 0 "likes" en el momento de la consulta, lo que refuerza su carácter de material experimental más que de modelo desplegable. Su relevancia es metodológica: aporta mediciones explícitas de tasa de éxito de ataque (ASR) y de sobre-rechazo bajo compresión agresiva, dentro de una rejilla que cruza reglas de selección y presupuestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (hereda la de Meta Llama 3 8B Instruct); no se detalla en la model card |
| Parametros totales | 8.030.261.248 según metadatos de safetensors (la model card indica fracción de parámetros resultante de 0,4997 tras la compresión; ver Limitaciones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en safetensors; no se listan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License (Meta Llama 3 Community License) |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Pipeline | text-generation |
| Compresion aplicada | SVD-LLM, 50,03 % de parámetros eliminados |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000 % de parámetros densos |
| Componentes restaurados | 11.051 |
| Componentes sustituidos | 5.304 |
| Parametros insertados | 69.735.424 (1,00 % de parámetros de proyección densos) |
| Tamano del repositorio | 16,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B Instruct, un transformer decoder-only con atención causal, pero el interés del checkpoint no reside en la arquitectura original sino en el proceso de compresión. SVD-LLM aplica descomposición en valores singulares para reducir el rango de las matrices de proyección, eliminando el 50,03 % de los parámetros densos hasta alcanzar una fracción de 0,4997. Sobre ese modelo comprimido se aplica una edición iterativa de 10 rondas en la que cada ronda sustituye hasta un 0,100 % de los parámetros densos, guiada por la regla `gap_iter`, que selecciona qué componentes restaurar en función de una brecha entre valores singulares o métricas equivalentes.

El swap es "neutro en parámetros" en el sentido de que mantiene el recuento: se insertan 69.735.424 parámetros (el 1,00 % de los parámetros de proyección) y se desalojan componentes siguiendo un orden basado en sigma (eliminación ordenada por valor singular). La model card no documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO adicionales; el modelo base ya era una variante Instruct, pero esos detalles no se detallan en la información proporcionada. Tampoco se describen innovaciones de decodificación (especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto condicionada: el checkpoint conserva la estructura de Llama 3 8B Instruct, por lo que en principio puede producir texto autoregresivo, aunque no se documentan capacidades específicas.
- Comportamiento conversacional: la etiqueta `conversational` está presente, pero la propia model card advierte que no es un modelo de chat de propósito general.
- Seguridad medible: incluye métricas reproducibles de ASR frente a AdvBench y StrongREJECT, así como de sobre-rechazo, lo que permite estudiar el comportamiento de seguridad bajo compresión.
- Tool calling / function calling: no disponible; no se menciona en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas no está informado).
- Visión, audio o modo "thinking": no disponible.
- Interpretabilidad: el artefacto está pensado como sujeto de estudio para analizar qué componentes concretos sostienen el comportamiento de seguridad.

## Casos de uso

- Investigación sobre compresión de modelos: sirve para medir la pérdida de calidad y de seguridad al aplicar SVD-LLM al 50 % de parámetros densos, comparando la perplejidad en WikiText-2 frente al modelo sin comprimir.
- Evaluación comparativa de reglas de selección: al ser una celda de una rejilla con regla `gap_iter` y presupuesto del 1,000 %, permite contrastar esta variante con otras reglas y presupuestos del mismo estudio.
- Estudios de alineación y seguridad: sus valores de ASR frente a AdvBench (0,0442) y StrongREJECT (0,0895) con juez HarmBench permiten cuantificar el deterioro de las defensas tras comprimir.
- Análisis de sobre-rechazo: la métrica de sobre-rechazo macro medida con WildGuard (0,2064) sirve para estudiar el equilibrio entre seguridad y utilidad, es decir, cuántas peticiones legítimas se rechazan.
- Reproducibilidad experimental: con semilla 42 y trazabilidad completa de componentes restaurados y sustituidos, es útil para replicar resultados y auditar el método.
- Red teaming académico: puede emplearse como sujeto de prueba en ejercicios controlados de ataque y defensa, siempre en entornos aislados y sin exposición a usuarios finales.
- Línea base en pipelines de interpretabilidad: permite analizar cómo se distribuyen los componentes críticos para la seguridad entre las distintas capas y proyecciones tras la compresión.
- Docencia e investigación en eficiencia de modelos: ilustra el compromiso entre tamaño y comportamiento funcional en un caso real y documentado.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / conjunto |
|---|---|---|
| AdvBench ASR | 0,0442 | HarmBench judge |
| StrongREJECT ASR | 0,0895 | HarmBench judge |
| Sobre-rechazo macro | 0,2064 | WildGuard |
| Perplejidad WikiText-2 | 112,5511 | WikiText-2 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni conjuntos equivalentes de capacidades generales. Tampoco se aportan las cifras del modelo base sin comprimir, por lo que no es posible calcular aquí la degradación relativa atribuible a la compresión.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: alrededor de 16,1 GB solo para pesos (coincide con el tamaño del repositorio); se recomienda un margen adicional para caché KV y activaciones.
- VRAM estimada en INT8: aproximadamente 8-9 GB.
- VRAM estimada en 4 bits: aproximadamente 4,5-5,5 GB, con la salvedad de que no se ofrecen cuantizaciones oficiales de este checkpoint.
- GPU recomendadas: A100 (40/80 GB) o H100 para FP16 sin restricciones de contexto; RTX 4090 o RTX 3090 (24 GB) pueden alojar los pesos en FP16, pero con margen limitado para contexto largo.
- GPU de consumo: sí, cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) e incluso en GPU de 8-12 GB si se cuantiza, aunque esto requiere generar las cuantizaciones por cuenta propia.
- Opciones de despliegue: transformers de forma nativa; el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con TGI y con endpoints gestionados. El despliegue con vLLM es plausible por tratarse de una arquitectura Llama, pero no está confirmado en la información. Para llama.cpp u Ollama habría que convertir los pesos a GGUF, algo que no se proporciona.
- Latencia y throughput: no disponible.

Nota: las estimaciones de VRAM se derivan del recuento de parámetros y del tamaño del repositorio; no proceden de mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Metricas de seguridad / calidad |
|---|---|---|---|---|---|
| svd-safety-l3_remove50_swapgapiter_evfrontgap_b010 | 8.030.261.248 según safetensors (fracción 0,4997 según la model card) | no disponible | Llama 3 Community License | HuggingFace (0 descargas, 0 likes) | ASR AdvBench 0,0442; ASR StrongREJECT 0,0895; sobre-rechazo 0,2064; PPL WikiText-2 112,5511 |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030.261.248 | 8.192 tokens (dato del modelo original, no confirmado en la información proporcionada para este derivado) | Llama 3 Community License | HuggingFace | no disponible en la información proporcionada |
| Otros brazos de la rejilla SVD-safety del mismo autor | no disponible | no disponible | Llama 3 Community License | no disponible | no disponible |

No se ha encontrado en la información disponible ningún otro modelo comparable con datos de benchmark publicados que permita una comparación cuantitativa directa.

## Limitaciones y advertencias

- No es un modelo desplegable: la propia model card lo describe como artefacto de investigación y advierte explícitamente de que no debe tratarse como un asistente de propósito general.
- Degradación de seguridad inducida por la compresión: el autor indica que la compresión por sí sola eleva la tasa de éxito de ataque, y que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-3-8B-Instruct.
- Perplejidad elevada: 112,5511 en WikiText-2, un valor muy superior al esperable en un modelo de 8B sin comprimir, lo que anticipa una calidad de lenguaje degradada.
- Sobre-rechazo significativo: 0,2064 de sobre-rechazo macro según WildGuard, es decir, una proporción apreciable de peticiones legítimas rechazadas.
- Incoherencia en los metadatos: el recuento de parámetros de safetensors (8.030.261.248) es el del modelo completo de 8B, mientras que la model card declara una fracción resultante de 0,4997 tras eliminar el 50,03 % de los parámetros. Conviene verificar el contenido real del repositorio antes de sacar conclusiones.
- Sesgos: no se documentan evaluaciones de sesgo en la información proporcionada.
- Alucinación: no hay mediciones específicas de veracidad o alucinación; dado el nivel de perplejidad, el riesgo es alto.
- Idiomas: el campo de idiomas no está informado; no se garantiza soporte multilingüe.
- Contexto: la longitud de contexto no se especifica para este derivado.
- Licencia: se aplica la Meta Llama 3 Community License, con `LICENSE` y `USE_POLICY.md` incluidos en el repositorio. Cualquier uso comercial queda sujeto a las restricciones de esa licencia (incluidos los límites de escala de usuarios y las obligaciones de atribución "Built with Meta Llama 3").
- Riesgo de producción: dado su carácter experimental, sus métricas degradadas y la ausencia de cuantizaciones y soporte oficial, no se recomienda su uso en entornos de producción ni expuesto a usuarios finales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove50_swapgapiter_evfrontgap_b010
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia y política de uso: los archivos `LICENSE` y `USE_POLICY.md` se incluyen en el propio repositorio del modelo.

La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos correspondían a contenido no relacionado), por lo que no se dispone de papers, blogs, repositorios ni demos adicionales que enlazar.
