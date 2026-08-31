# Ryn1998/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF

## Resumen

El modelo `Ryn1998/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF` es una variante "abliterated" (sin censura) del modelo Qwen3.8-27B, desarrollada por Ryn1998 a partir del trabajo de Tim Rohrbaugh (`trohrbaugh/Qwen3.8-27B-heretic-ara`). La abliteración es una técnica de modificación post-entrenamiento que elimina los mecanismos de rechazo del modelo ante solicitudes consideradas dañinas, manteniendo el resto de capacidades intactas. En este caso, se aplica el método ARA (Arbitrary-Rank Ablation) en tres pasadas: una original del autor fuente y dos adicionales de refinamiento, logrando reducir los rechazos de 3/100 a 0–1/100 con un daño de comportamiento mínimo (KL ≈ 0.0085).

El modelo base Qwen3.8-27B pertenece a la familia Qwen3.8, con arquitectura híbrida "Gated DeltaNet" que combina atención estándar con atención lineal. Tiene 27 mil millones de parámetros, una ventana de contexto de 262 144 tokens y está disponible en formato GGUF para su ejecución local con llama.cpp y herramientas compatibles. La licencia es Apache-2.0, lo que permite uso comercial. Este modelo está dirigido a un público adulto (18+) y está diseñado para investigación, escritura creativa, roleplay y generación de contenido sin censura, con ciertos guardarraíles intencionalmente mantenidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_text` (familia Qwen3.8), híbrida Gated DeltaNet: 16 capas de atención estándar + 48 capas de atención lineal |
| Parametros totales | 26 895 998 464 (~27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262 144 tokens (262K) |
| Tipos de cuantizacion | GGUF (llama.cpp), incluye archivos `*-mtp.gguf` con el draft head MTP embebido; no se especifican los niveles exactos de cuantización en la información disponible |
| Idiomas soportados | no disponibles (existen archivos `*-multilingual*.gguf` que sugieren soporte multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (también disponible en safetensors para el modelo base) |

## Arquitectura y entrenamiento

La arquitectura base es la de Qwen3.8-27B, una red híbrida que combina atención estándar (16 capas) con atención lineal Gated DeltaNet (48 capas), para un total de 64 capas. El modelo tiene hidden size de 5120, 24 cabezas de atención con 4 KV heads (GQA) y head_dim 256, y un vocabulario de 248 320 tokens. El contexto máximo es de 262 144 tokens.

El proceso de abliteración se realiza con la herramienta `heretic` (implementación de ARA). ARA trata la abliteración como un problema de optimización matricial: para cada módulo objetivo (proyección de salida de atención y proyección de MLP), recoge activaciones sobre prompts "buenos" (solicitudes inofensivas) y "malos" (solicitudes dañinas), y usa un optimizador LBFGS para reescribir la matriz de pesos con tres objetivos: preservar las salidas en prompts buenos (minimizando KL), llevar las salidas en prompts malos hacia el manifold de salidas buenas, y sobrecorregir alejando las salidas malas de las originales. Esto permite eliminar el circuito de rechazo sin dañar el comportamiento general.

El modelo RVN aplica ARA tres veces en total: una pasada original (de `trohrbaugh`) y dos pasadas adicionales de refinamiento con parámetros ajustados (start 26, end 56, preserve 0.9432, steer 0.0009, overcorrect 0.5038, neighbor 10). No se han publicado detalles sobre el dataset de entrenamiento original del modelo base ni sobre el proceso de pre-entrenamiento.

## Capacidades

- Generación de texto libre y conversacional, con reducción intencionada de los mecanismos de rechazo ante solicitudes que el modelo base consideraría dañinas.
- Escritura creativa y roleplay: puede generar narrativas, diálogos y escenarios sin las restricciones habituales de seguridad.
- Soporte de tool calling y control de pensamiento (thinking-control), verificado en los archivos `*-multilingual*.gguf` mediante pruebas de compatibilidad con OpenAI.
- Ventana de contexto muy larga (262K tokens), adecuada para tareas que requieren mantener información extensa.
- Capacidades multilingües: existen archivos específicos `*-multilingual*.gguf`, aunque no se detallan los idiomas soportados.
- Compatible con el formato GGUF y la plantilla de chat oficial de Qwen3.8, lo que permite su uso con llama.cpp, Ollama, vLLM y otros motores de inferencia local.

## Casos de uso

- Roleplay y escritura creativa sin censura: el modelo puede generar diálogos, historias y escenarios de ficción con libertad creativa, sin los rechazos típicos de los modelos alineados. Es adecuado para autores y creadores de contenido que necesitan explorar temas sensibles en contextos narrativos.
- Investigación en seguridad y análisis de contenido: investigadores que estudian los mecanismos de rechazo de los modelos de lenguaje pueden usar esta variante para comparar el comportamiento antes y después de la abliteración, o para evaluar la eficacia de técnicas de mitigación.
- Generación de contenido para juegos de rol y simulación: con su contexto de 262K tokens, puede mantener personajes y tramas complejas durante largas sesiones, siendo útil para juegos de rol de mesa asistidos por IA o chatbots de personajes.
- Desarrollo de aplicaciones de chat sin filtros: desarrolladores que crean asistentes conversacionales para nichos específicos (por ejemplo, ficción adulta, debates filosóficos) pueden integrarlo como backend, siempre que cumplan con la legislación local.
- Evaluación de robustez de modelos: el bajo KL (0.0085) indica que conserva casi todo el conocimiento del modelo base, lo que permite usarlo como sustituto en pruebas donde se necesite un modelo sin sesgos de rechazo.
- Experimentación con técnicas de abliteración: al estar disponible en GGUF, se puede usar para reproducir o extender los experimentos de ARA, comparando el rendimiento con otras variantes abliterated.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K para esta variante abliterated. Se puede inferir que el rendimiento en tareas estándar es muy cercano al del modelo base Qwen3.8-27B (dado el bajo KL), pero no se proporcionan datos numéricos.

## Requisitos de hardware

- Al ser un modelo de 27B en formato GGUF, la VRAM necesaria depende del nivel de cuantización. Para Q4_K_M, se estima entre 16 y 18 GB; para Q8, entre 28 y 30 GB. No se han publicado cifras oficiales.
- GPU recomendadas: tarjetas con 24 GB de VRAM (RTX 3090, RTX 4090) para cuantizaciones bajas; para cuantizaciones altas o contexto máximo, se requieren GPUs de 40-80 GB (A100, H100) o el uso de offloading a CPU.
- Es posible ejecutarlo en una GPU de consumo como la RTX 4090 con cuantización Q4_K_M y contexto reducido (por ejemplo, 32K tokens), aunque la velocidad será moderada.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI y cualquier motor compatible con GGUF. El modelo incluye archivos con soporte para decodificación especulativa (MTP).
- No se han publicado datos de latencia o throughput. Como referencia orientativa, un modelo de 27B en Q4_K_M en una RTX 4090 suele generar entre 15 y 30 tokens por segundo, pero esto depende del contexto y la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache-2.0 | safetensors, GGUF | Modelo original con guardarraíles de seguridad estándar |
| trohrbaugh/Qwen3.8-27B-heretic-ara | 27B | 262K | Apache-2.0 | safetensors | Abliteración ARA de una pasada, rechazos 3/100, KL 0.0535 |
| Ryn1998/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF | 27B | 262K | Apache-2.0 | GGUF | Doble refinamiento ARA, rechazos 0–1/100, KL 0.0085 |
| 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF | 27B | 262K | Apache-2.0 | GGUF | Otra colección de cuantizaciones del mismo modelo abliterated |

No hay datos de benchmarks comparativos disponibles. La principal diferencia entre las variantes es el nivel de abliteración y el formato de distribución.

## Limitaciones y advertencias

- El modelo tiene los guardarraíles de seguridad reducidos por diseño. No debe utilizarse para generar contenido ilegal, dañino o que infrinja los derechos de terceros. El autor advierte que es para mayores de 18 años y que el uso es responsabilidad del usuario.
- Aunque la abliteración reduce los rechazos, no elimina el riesgo de alucinaciones. El modelo puede generar información falsa o inventada, especialmente en temas especializados.
- No se han publicado evaluaciones de sesgos ni de seguridad. Es probable que herede o incluso amplifique sesgos presentes en el modelo base, ya que el proceso de abliteración no aborda este aspecto.
- La licencia Apache-2.0 permite uso comercial, pero el autor recomienda verificar el cumplimiento de las leyes locales en cuanto a contenido generado.
- El tamaño del repositorio (1616.9 GB) sugiere que contiene muchas cuantizaciones; los usuarios deben descargar solo el archivo necesario para evitar consumo innecesario de ancho de banda.
- La arquitectura híbrida Gated DeltaNet puede no ser compatible con todas las versiones de llama.cpp; se recomienda usar una versión reciente que soporte la familia Qwen3.8.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ryn1998/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fuente de abliteración (trohrbaugh): https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Herramienta heretic (implementación de ARA): https://github.com/p-e-w/heretic
- Colección alternativa de cuantizaciones (0bserverx): https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF
- Blog sobre abliteración similar (AEON): https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Receta vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
