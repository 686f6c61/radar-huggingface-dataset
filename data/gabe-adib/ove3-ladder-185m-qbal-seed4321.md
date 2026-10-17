# gabe-adib/ove3-ladder-185m-qbal-seed4321

## Resumen

ove3-ladder-185m-qbal-seed4321 es un checkpoint de investigación publicado por gabe-adib en Hugging Face. Corresponde a una ejecución de la escalera de intervención ove3, en concreto la segunda semilla (4321), con una arquitectura MoE de tipo kimi_linear y 185 M de parámetros activos. La receta mantiene los datos, la tasa de aprendizaje, el tamaño de lote y los pasos de la celda IsoFLOP de 185 M, y aplica balanceo de sesgo del router por cuantiles con pérdida auxiliar cero.

El checkpoint best_1 se seleccionó en la iteración 18.810, con una pérdida de validación de 1,0815. La pérdida en el conjunto reservado es de 1,1743 nats/carácter, ponderada por la mezcla de 9 dominios. El repositorio ocupa 28,9 GB e incluye el checkpoint distribuido de Megatron con estado del optimizador, registros de entrenamiento, eventos de TensorBoard y el archivo config.yaml.

Su interés es de reproducibilidad y ablación: permite estudiar el efecto del balanceo de router sin pérdida auxiliar y de la atención kimi_linear a pequeña escala. No se han publicado licencia, idiomas, longitud de contexto ni resultados de benchmarks estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con atención kimi_linear; número de capas, expertos y dimensión no disponibles |
| Parámetros totales | no disponible; solo se declaran 185 M activos |
| Parámetros activos | 185 M |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; no se publican pesos cuantizados |
| Idiomas soportados | no disponible; no se especifica tokenizador ni idiomas |
| Licencia | no disponible |
| Formato de pesos | checkpoint distribuido de Megatron (best_1, incluye estado del optimizador); no hay safetensors ni GGUF |
| Tamaño del repositorio | 28,9 GB |
| Semilla | 4321 |
| Iteración del checkpoint | 18.810 |
| Pérdida de validación | 1,0815 |
| Pérdida en conjunto reservado | 1,1743 nats/carácter, ponderada sobre 9 dominios |
| Dominios de evaluación | 9; detalle en DOMAIN_NLL.txt |
| Pipeline de Hugging Face | no disponible |
| Descargas y likes | 0 y 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La model card indica una arquitectura MoE con atención kimi_linear y 185 M de parámetros activos. No se detallan el número de capas, la dimensión oculta, el número de expertos, el número de expertos activos por token ni la composición exacta del bloque de atención; por eso esos datos no se recogen como cifras concretas. La etiqueta kimi_linear sugiere una variante de atención linear, pero la documentación disponible no permite confirmar su implementación.

El entrenamiento emplea balanceo de sesgo del router por cuantiles con aux-loss 0, es decir, sin pérdida auxiliar de balanceo. Es la segunda semilla de la escalera ove3 y reutiliza la misma receta que la celda IsoFLOP de 185 M: mismos datos, tasa de aprendizaje, tamaño de lote y pasos. No se indica el número de tokens ni la composición del corpus, solo que la evaluación se reparte en 9 dominios. La métrica en nats/carácter apunta a una tokenización o evaluación a nivel de carácter, aunque no se explicita. No se mencionan RLHF, DPO ni ajuste por instrucciones; el artefacto es un checkpoint de preentrenamiento. El checkpoint best_1 se guardó en la iteración 18.810 y los registros se dividen en segmentos de 4 horas.

## Capacidades

- Generación de texto: el modelo se entrena con una pérdida de lenguaje y puede producir continuaciones de texto, pero no se publica pipeline, demo ni plantilla de prompt.
- Razonamiento, código y matemáticas: no documentados; no hay evaluaciones HumanEval, GSM8K ni MMLU en la información disponible.
- Tool calling o function calling: no documentado.
- Agentes y razonamiento multi-paso: no documentado; el checkpoint no incluye un modo agente.
- Multilingüismo: no disponible; no se especifican idiomas ni vocabulario.
- Visión, audio u otras modalidades: no disponibles.
- Modo thinking: no disponible.
- Evaluación por dominio: sí, con NLL por dominio en DOMAIN_NLL.txt para 9 dominios.
- Instrucciones: no es un modelo instruct; no se ha alineado con preferencias humanas según la información disponible.

## Casos de uso

- Reproducción de la curva de validación: cargar el checkpoint best_1 y los eventos de TensorBoard para verificar la pérdida de validación de 1,0815 en la iteración 18.810. Es adecuado porque el repositorio conserva registros cada 4 horas y la configuración exacta.
- Ablación del balanceo de router: comparar esta ejecución (qbal, aux-loss 0) con otras variantes de la escalera ove3 para medir el efecto en la pérdida de validación y en la NLL por dominio. La ejecución está diseñada como una intervención aislada sobre la receta de 185 M.
- Estudio de semillas: analizar la variabilidad entre semillas usando la semilla 4321 como punto de comparación con otras ejecuciones de la misma celda. Es útil porque la model card identifica esta ejecución como la segunda semilla.
- Investigación de atención linear: examinar el comportamiento de kimi_linear en un MoE pequeño con 185 M activos, por ejemplo midiendo la pérdida por dominio o la estabilidad del router. El tamaño reducido facilita iterar con recursos moderados.
- Baseline para MoE de escala similar: usar la pérdida reservada de 1,1743 nats/carácter sobre 9 dominios como referencia para nuevas recetas. Es adecuado si se mantiene la misma tokenización y mezcla de datos.
- Análisis de especialización por dominio: explotar DOMAIN_NLL.txt para estudiar qué dominios se benefician del balanceo qbal y de la atención kimi_linear. El archivo se incluye explícitamente en el repositorio.
- Docencia y auditoría de entrenamiento: revisar config.yaml, los registros y el estado del optimizador para explicar un pipeline Megatron real. El repositorio contiene los artefactos completos, no solo los pesos.
- Fine-tuning experimental: partir del checkpoint para probar adaptaciones supervisadas en un dominio concreto, siempre que la licencia lo permita y tras convertir el formato Megatron. La falta de licencia explícita limita este uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Métrica | Valor | Contexto |
|---|---|---|
| Pérdida de validación (lm loss) | 1,0815 | best_1, iteración 18.810 |
| Pérdida en conjunto reservado | 1,1743 nats/carácter | ponderada por mezcla sobre 9 dominios |
| NLL por dominio | no disponible en esta ficha | ver DOMAIN_NLL.txt |
| MMLU, HumanEval, GSM8K y similares | no disponible | no publicados |

No hay comparación con modelos similares porque no se han publicado resultados homogéneos.

## Requisitos de hardware

- VRAM estimada: no disponible para el modelo completo, porque se desconocen los parámetros totales. Como cota inferior, los 185 M de parámetros activos ocuparían aproximadamente 0,37 GB en FP16, 0,19 GB en INT8 y 0,09 GB en INT4; esta cifra no incluye expertos no activos, caché KV ni activaciones.
- Checkpoint: 28,9 GB en disco, dominado por el estado del optimizador y los registros; no es un tamaño de inferencia.
- GPU recomendadas: para reanudar entrenamiento o inspeccionar el checkpoint Megatron, A100 o H100 con memoria suficiente; no se especifica el número de GPU. Para inferencia tras conversión, una RTX 4090, RTX 3090 o GPU consumer de 8 a 24 GB podría ser suficiente si el total de parámetros es próximo a 185 M, pero no está confirmado.
- Despliegue: Megatron-LM para el formato original; sería necesaria una conversión a Hugging Face Transformers. No se confirma compatibilidad con vLLM, TGI, llama.cpp ni Ollama, y no hay archivos GGUF.
- Latencia y throughput: no disponibles; no se publican mediciones.
- Cuantización: no hay recetas ni pesos cuantizados publicados; habría que generarlos y validar la pérdida.

## Comparativa con modelos similares

| Modelo | Parámetros activos | Parámetros totales | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ove3-ladder-185m-qbal-seed4321 | 185 M | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| ove3-ladder-440m-lk3x1024 | 440 M | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La segunda ejecución de la misma escalera utiliza LatentMoE, 1024 expertos de media anchura, top-16, RMSNorm eps 1e-5, escalado de router 1.0 y semilla 1234. No se conocen otros modelos públicos comparables en la información disponible; la comparación directa no es posible por diferencias de tamaño y ausencia de métricas comunes.

## Limitaciones y advertencias

- Licencia no disponible: no se concede permiso explícito de uso comercial; conviene contactar con el autor antes de desplegarlo.
- Modelo de investigación, no instruct: no se ha alineado con instrucciones ni preferencias; puede producir respuestas incoherentes o no seguir prompts.
- Alucinación: riesgo no evaluado; al ser un LM de preentrenamiento, puede generar afirmaciones falsas con fluidez.
- Sesgos: no documentados; la composición de los 9 dominios y el filtrado de datos no se describen.
- Idioma y contexto: no disponibles; no se debe asumir castellano ni ventanas largas.
- Sin benchmarks estándar: no se puede comparar con MMLU, HumanEval o GSM8K; la pérdida en nats/carácter no es trasladable a otras tokenizaciones.
- Formato: checkpoint Megatron con estado del optimizador; requiere herramientas específicas y conversión.
- Repositorio de 28,9 GB: la descarga y el almacenamiento tienen coste; los registros no sustituyen una validación independiente.
- Semilla única: los resultados pueden no generalizar a otras semillas o recetas.
- Sin pipeline ni demo: no hay ejemplo de inferencia ni API.
- Fechas de creación y actualización en 2026; no se garantizan actualizaciones.

## Enlaces

- Hugging Face: https://huggingface.co/gabe-adib/ove3-ladder-185m-qbal-seed4321
- Otra ejecución de la misma escalera: https://huggingface.co/gabe-adib/ove3-ladder-440m-lk3x1024
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web.
