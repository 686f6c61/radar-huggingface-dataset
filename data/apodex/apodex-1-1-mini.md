# apodex/Apodex-1.1-mini

## Resumen

Apodex-1.1-mini es un modelo de razonamiento orientado a tareas agénticas complejas y de largo horizonte, desarrollado por apodex sobre la base de Qwen3.5-35B-A3B. Con 35.951 millones de parámetros totales en arquitectura de mezcla de expertos (MoE) y 3.000 millones de parámetros activos, está diseñado para ejecutar tareas de investigación de principio a fin: trabajar con archivos, datos, código y herramientas, mantener estado de tarea, adaptar planes y coordinar subagentes en paralelo.

La versión 1.1 introduce un sistema de verificación integrado (Statement Review) que contrasta las afirmaciones clave con sus fuentes, datos y cálculos antes de entregar resultados. El modelo soporta llamada nativa a funciones (function calling), sigue la plantilla de chat de Qwen3.5 y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. Su ventana de contexto alcanza 262.144 tokens, adecuada para tareas de investigación extensas.

El modelo se publica en formato safetensors con un tamaño de repositorio de 71,9 GB y está pensado para desplegarse con SGLang o vLLM en configuraciones de paralelismo tensorial. Es una versión reducida del Apodex-1.1 completo, orientada a mantener competitividad en benchmarks agénticos con un coste de inferencia menor gracias a su arquitectura MoE con solo 3 B de parámetros activos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre base Qwen3.5-35B-A3B |
| Parametros totales | 35.951.822.704 (35,95 B) |
| Parametros activos | 3 B (A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors publicados) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Apodex-1.1-mini hereda la arquitectura MoE de Qwen3.5-35B-A3B, con 35,95 B de parámetros totales y 3 B activos por token, lo que permite una inferencia eficiente pese al tamaño total del modelo. Sobre esta base, apodex ha aplicado un post-entrenamiento orientado a razonamiento agéntico, siguiendo la plantilla de chat de Qwen3.5: las llamadas a herramientas se emiten como `<tool_call><function=...><parameter=...></parameter></function></tool_call>` y el razonamiento como bloques de pensamiento delimitados.

El sistema incorpora un Agent Team asíncrono (AgentOS) que descompone tareas complejas, coordina subagentes en paralelo y mantiene un estado de tarea compartido. El entrenamiento incluye una etapa de verificación (Statement Review) que revisa afirmaciones contra fuentes, datos y cálculos antes de la entrega. Los detalles completos del dataset y el recetario de entrenamiento de la versión 1.1 no se han divulgado en la información disponible; la versión 1.0-mini anterior utilizó un recetario de post-entrenamiento en tres etapas.

## Capacidades

- Razonamiento agéntico de largo horizonte: ejecuta tareas complejas de investigación de principio a fin sin reiniciar el proceso.
- Llamada nativa a funciones (function calling): las herramientas se pasan via el parámetro `tools=` de la API de chat-completions y se renderizan en el prompt mediante la plantilla de chat.
- Coordinación multi-agente: descompone tareas dinámicamente y coordina subagentes en paralelo con estado compartido.
- Verificación integrada: el sistema Statement Review contrasta afirmaciones con fuentes, datos y cálculos antes de entregar resultados.
- Trabajo con archivos, datos, código y herramientas: puede limpiar datos, seleccionar métodos, ejecutar análisis, inspeccionar resultados intermedios y recuperarse de errores.
- Razonamiento visible: emite bloques de pensamiento (`thinking... response`) compatibles con el parser `qwen3` de SGLang y vLLM.
- Multilingüe limitado: soporta inglés y chino según la información publicada.

## Casos de uso

- Investigación de mercado automatizada: el modelo puede recopilar datos de múltiples fuentes, analizarlos y generar informes verificables con citas contrastadas, gracias a su ventana de 262.144 tokens y su sistema de verificación de afirmaciones.
- Análisis financiero de documentos extensos: con 50,2 en FrontierFinance, puede procesar informes anuales, estados financieros y datos de mercado, ejecutar análisis cuantitativos y entregar conclusiones con trazabilidad de fuentes.
- Revisión de literatura científica: puede trabajar directamente con papers, extraer metodologías, comparar resultados y verificar que las citas coinciden con las fuentes antes de redactar una síntesis.
- Automatización de pipelines de datos: el modelo puede limpiar datasets, seleccionar métodos de análisis, ejecutar código, inspeccionar resultados intermedios y corregir errores sin intervención humana.
- Asistente de investigación con verificación de fuentes: ideal para entornos donde la precisión es crítica, ya que el Statement Review detecta citas incorrectas o resultados inconsistentes y corrige las conclusiones afectadas.
- Coordinación de tareas multi-agente en producción: el Agent Team permite lanzar subagentes en paralelo para tareas independientes (extracción, análisis, redacción) y consolidar resultados en un estado compartido, útil en entornos de automatización empresarial.
- Generación de informes técnicos verificables: combina razonamiento, acceso a herramientas y verificación para producir entregables con trazabilidad completa, adecuado para consultoría y auditoría.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan el setup Agent Team con el setup ReAct. Para Apodex-1.1-mini se reportan tres benchmarks (el tercero aparece en la figura pero no se nombra en el texto):

| Benchmark | Apodex-1.1-mini (Agent Team) | Apodex-1.1 (Agent Team) |
|---|---|---|
| APEX-Agents | 27,7 | 38,5 |
| FrontierFinance | 50,2 | 54,3 |
| GDPVal | no disponible | 78,8 |
| FrontierScience-Research | no disponible | 63,3 |
| BioMysteryBench | no disponible | 35,3 |
| Humanity's Last Exam | no disponible | 56,1 |

El texto indica que el setup Agent Team supera consistentemente al setup ReAct en los tres benchmarks evaluados para el mini, aunque no se publican los valores numéricos de ReAct. La evaluación bloqueó el acceso a sitios web que alojan respuestas de benchmarks para evitar fugas de información. No se han publicado resultados de benchmarks clásicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 72 GB (35,95 B parámetros × 2 bytes), más la caché KV para 262.144 tokens de contexto, que puede añadir decenas de GB adicionales según el número de capas y cabezas de atención.
- GPU recomendadas: la configuración oficial de despliegue usa `--tensor-parallel-size 8`, lo que sugiere 8 GPU de alta capacidad (A100 80 GB o H100) para contexto completo.
- GPU de consumo: con cuantización (no publicada actualmente) podría ejecutarse en 2-4 GPU de 24 GB (RTX 4090), pero la ventana de 262.144 tokens sería difícil de mantener en su totalidad.
- Opciones de despliegue: SGLang y vLLM son las opciones recomendadas por el autor, ambos con soporte para el parser de herramientas `qwen3_coder` y el parser de razonamiento `qwen3`.
- Parámetros de inferencia recomendados: temperatura 1,0, top_p 0,95, repetition_penalty 1,05, max_tokens 32.768.
- Latencia y throughput: no se han publicado datos específicos; al ser MoE con 3 B de parámetros activos, la latencia por token debería ser comparable a la de un modelo de 3 B, aunque el enrutamiento de expertos y el contexto largo añaden overhead.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Apodex-1.1-mini | 35,95 B totales / 3 B activos | 262.144 | Apache 2.0 | Agéntico con verificación |
| Qwen3.5-35B-A3B (base) | 35,95 B totales / 3 B activos | 262.144 | Apache 2.0 | Modelo base generalista |
| Apodex-1.0-mini | 35 B (estimado) | no disponible | Apache 2.0 | Investigación profunda con verificación |

Apodex-1.0-mini, la versión anterior, alcanzó 59,17 en FutureX según el blog de explainx.ai, superando a Sonnet 4.6 y GPT-5.5 en ese benchmark. La versión 1.1-mini mantiene la misma base arquitectónica pero incorpora el Agent Team y el sistema de verificación mejorado. No se dispone de datos comparativos con otros modelos agénticos abiertos (como DeepSeek o Llama agentic) en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados: solo se declaran inglés y chino; el rendimiento en otros idiomas no está garantizado.
- Modelo muy reciente: creado en agosto de 2026, con 0 descargas en HuggingFace y adopción comunitaria nula; no hay experiencia acumulada de producción.
- Sin cuantizaciones publicadas: solo safetensors en precisión completa, lo que limita el despliegue en hardware de consumo.
- Riesgo de alucinación: aunque el Statement Review mitiga afirmaciones sin respaldo, no elimina el riesgo; la verificación depende de la calidad de las fuentes accesibles.
- Coste de despliegue elevado: la configuración recomendada requiere 8 GPU de alta gama para contexto completo, lo que puede ser prohibitivo para equipos pequeños.
- Datos de entrenamiento no divulgados: no se especifica la composición del dataset ni el recetario exacto de la versión 1.1, lo que dificulta evaluar sesgos potenciales.
- Etiqueta image-text-to-text: el modelo aparece etiquetado como image-text-to-text en HuggingFace, pero la documentación describe principalmente capacidades de texto; no se confirma soporte de visión en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/apodex/Apodex-1.1-mini
- Servicio online: https://www.apodex.ai
- Pagina principal: https://www.apodex.com
- Blog tecnico: https://www.apodex.com/blog/apodex-1.1-scaling-agentic-intelligence-for-complex-work
- Informe tecnico: https://www.apodex.com/pdf/20260824
- Repositorio Agent Team (FrontierAgent): https://github.com/ApodexAI/FrontierAgent
- Plataforma API: https://platform.apodex.ai
- Version anterior (Apodex-1.0-mini): https://huggingface.co/apodex/Apodex-1.0-mini
- Analisis de Apodex-1.0-mini en explainx.ai: https://www.explainx.ai/blog/apodex-1-0-mini-futurex-35b-deep-research-2026
