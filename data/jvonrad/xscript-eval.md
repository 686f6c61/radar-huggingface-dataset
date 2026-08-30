# jvonrad/xscript-eval

## Resumen

El repositorio `jvonrad/xscript-eval` contiene un conjunto de quince checkpoints de modelos de lenguaje de tipo Transformer estilo LLaMA, desarrollados por Jonathan von Rad como parte de un proyecto de investigación sobre representaciones multilingües. No se trata de un modelo único, sino de una colección de ejecuciones de entrenamiento con diferentes mezclas de idiomas y condiciones de "starved" (privados de ciertos datos) o "fair", diseñadas para evaluar el rendimiento en tareas de comprensión multilingüe. Cada checkpoint tiene aproximadamente 1.000 millones de parámetros, lo que permite su ejecución en GPUs con 16 GB de VRAM.

La relevancia de este repositorio radica en que sirve como infraestructura de evaluación externa: el clúster Isambard-AI estaba bloqueado por una cuota de CPU-minutos, por lo que los checkpoints se subieron a Hugging Face para ser evaluados en GPUs ajenas. El código incluye un harness de evaluación basado en `lm-evaluation-harness` que puntúa Global-MMLU, Belebele y XNLI en los idiomas de entrenamiento de cada ejecución. El repositorio no es un modelo listo para producción, sino un artefacto de investigación para medir el efecto de la privación de datos en el rendimiento multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo LLaMA personalizado (`src/xscript/model.py`) con atención escalada por producto punto (`F.scaled_dot_product_attention`), sin kernels personalizados |
| Parametros totales | ~1.000 millones por checkpoint (15 checkpoints en total) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (los checkpoints se almacenan en precisión completa, ~4 GB cada uno) |
| Idiomas soportados | no disponible en la model card; cada ejecución tiene entre uno y dos idiomas de entrenamiento (p. ej. `en`, `en-ar`), pero no se especifica la lista completa |
| Licencia | no disponible |
| Formato de pesos | PyTorch checkpoint (`final.pt`), fp32, ~4 GB por archivo |

## Arquitectura y entrenamiento

La arquitectura es un Transformer denso de tipo LLaMA con tokenizador SentencePiece. El modelo está implementado en PyTorch puro, utilizando `F.scaled_dot_product_attention` de PyTorch, sin dependencias de flash-attn, triton ni kernels personalizados. Esto garantiza que los checkpoints puedan ejecutarse en cualquier GPU estándar, aunque con menor eficiencia que implementaciones optimizadas.

No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineación (RLHF, DPO, etc.). La model card menciona que los checkpoints corresponden a "ejecuciones" con nombres como `en-fair`, `en-ar-starved`, lo que sugiere un diseño experimental donde se varía la disponibilidad de datos por idioma (condición "starved" = privado de ciertos datos, "fair" = distribución equilibrada). El entrenamiento se realizó en el clúster Isambard-AI, aunque la evaluación se trasladó a GPUs externas por restricciones de cuota.

## Capacidades

- Generación de texto y comprensión del lenguaje en los idiomas de entrenamiento de cada ejecución (monolingüe o bilingüe).
- Evaluación de razonamiento y conocimiento general mediante Global-MMLU.
- Comprensión lectora multilingüe evaluada con Belebele.
- Inferencia de lenguaje natural (NLI) evaluada con XNLI.
- Capacidad de ejecutar el harness de evaluación sobre tareas específicas por idioma (por ejemplo, `xnli_en`, `xnli_de`).
- No se menciona soporte para tool calling, agentes, visión, audio ni modo de razonamiento especial.

## Casos de uso

- Investigación sobre privación de datos multilingüe: el repositorio permite reproducir experimentos que comparan el rendimiento de modelos entrenados con distintas mezclas de idiomas (starved vs. fair) en tareas estándar.
- Evaluación de robustez lingüística: los checkpoints pueden puntuarse en Global-MMLU, Belebele y XNLI para medir cómo la falta de datos en un idioma afecta al rendimiento en ese mismo idioma y en otros.
- Benchmarking reproducible en GPU: el harness incluido genera resultados en formato JSON que pueden compararse directamente con los que se habrían obtenido en el clúster original, gracias a que se usa el mismo código de evaluación.
- Estudio de representaciones internas: el repositorio hermano `jvonrad/xscript-embeddings` sugiere que los checkpoints también se utilizan para análisis de alineación de representaciones cross-linguales e interpretabilidad.
- Docencia e investigación en arquitecturas LLaMA: el código fuente del modelo (`src/xscript/model.py`) es un ejemplo de implementación limpia y sin dependencias exóticas, útil para fines educativos.
- Validación de pipelines de evaluación: el script `run_benchmarks.py` puede usarse como plantilla para ejecutar evaluaciones estandarizadas sobre modelos propios en entornos con restricciones de recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el propósito del repositorio es ejecutar las evaluaciones y enviar los resultados JSON de vuelta al autor para su análisis. No hay números de MMLU, Belebele ni XNLI reportados en el README ni en la página del modelo.

## Requisitos de hardware

- VRAM estimada: cada checkpoint ocupa ~4 GB en fp32; la inferencia con un batch pequeño cabe en cualquier GPU con 16 GB de VRAM o más.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 16 GB (RTX 4080, RTX 4090, A100, etc.). También puede ejecutarse en CPU, aunque de forma lenta.
- Compatibilidad con consumer GPU: sí, todas las GPUs de 16 GB o superiores son suficientes.
- Opciones de despliegue: el repositorio incluye un runner basado en PyTorch puro; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo pesa 672.1 GB; el runner descarga un checkpoint a la vez y lo elimina tras evaluarlo, con un pico de disco de ~5 GB si se usa la opción por defecto.

## Comparativa con modelos similares

No hay información suficiente para establecer una comparativa con modelos equivalentes. El repositorio no es un modelo de propósito general, sino un conjunto de checkpoints experimentales para estudiar el efecto de la privación de datos en tareas multilingües. No se dispone de datos de rendimiento ni de especificaciones completas (contexto, tokenizador, etc.) que permitan compararlo con alternativas como modelos LLaMA de 1B, Qwen1.5-1.8B o Gemma-2B. Se recomienda consultar los resultados de evaluación cuando el autor los publique.

## Limitaciones y advertencias

- No se especifica la licencia del modelo ni de los checkpoints; el uso comercial no está garantizado y debe consultarse al autor.
- No hay información sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos o riesgos de alucinación.
- La longitud de contexto no está documentada, lo que limita su uso en aplicaciones que requieran ventanas largas.
- Los idiomas soportados no están listados explícitamente; solo se infieren de los nombres de las ejecuciones (por ejemplo, `en`, `ar`), pero no se garantiza cobertura completa.
- El repositorio está pensado para evaluación, no para inferencia en producción; no incluye servidores de inferencia ni optimizaciones de despliegue.
- Los checkpoints están en fp32, lo que implica un uso de memoria mayor que modelos cuantizados equivalentes.
- El acceso al repositorio puede requerir token de Hugging Face mientras sea privado (según la model card).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jvonrad/xscript-eval
- Perfil del autor: https://huggingface.co/jvonrad
- Dataset de embeddings asociado: https://huggingface.co/datasets/jvonrad/xscript-embeddings
- (No se han encontrado papers, blogs ni demos adicionales en la búsqueda web.)
