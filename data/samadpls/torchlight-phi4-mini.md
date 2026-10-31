# samadpls/torchlight-phi4-mini

## Resumen

torchlight-phi4-mini es un modelo de lenguaje especializado en resolver dudas sobre PyTorch, desarrollado por Abdul Samad (samadpls). Se trata de un fine-tune de microsoft/Phi-4-mini-instruct (3.8B de parámetros) entrenado sobre 6.918 conversaciones extraídas de los foros oficiales de PyTorch (discuss.pytorch.org), donde la mayoría de las respuestas corresponden al mensaje que resolvió el hilo, muchas de ellas escritas por el usuario ptrblck, moderador de referencia de la comunidad.

El problema que aborda es la fiabilidad de los asistentes pequeños en dominios técnicos concretos: en lugar de adivinar, el modelo está entrenado para proponer una corrección cuando la pregunta contiene suficiente detalle y para pedir el código o el mensaje de error completo cuando no lo tiene. Esto reduce significativamente las respuestas incorrectas respecto al modelo base según la evaluación del propio autor.

Es relevante como ejemplo de fine-tune eficiente y reproducible: el ajuste se realizó con LoRA (11,5M de parámetros entrenables) en 6,3 horas sobre un MacBook Pro con chip M3 Pro, y el modelo se distribuye en tres formatos (completo en 16 bits, adaptador LoRA y cuantizaciones GGUF), lo que lo hace accesible incluso en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Phi-3/Phi-4), fine-tune con LoRA |
| Parametros totales | 3.836.021.760 (3,8B) |
| Parametros activos | no disponible (no es MoE; 11,5M entrenados con LoRA) |
| Longitud de contexto | no disponible (heredada de Phi-4-mini-instruct) |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (GGUF); version completa en 16 bits |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (version completa), LoRA adapter, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Phi-4-mini-instruct, un transformer decoder-only de 3,8B parámetros de Microsoft. Sobre esta base se aplicó un fine-tune con LoRA, entrenando solo 11,5M de parámetros (aproximadamente el 0,3% del total), que posteriormente se fusionaron en los pesos completos del repositorio. El entrenamiento duró 6,3 horas en un MacBook Pro con chip M3 Pro, lo que demuestra la viabilidad del fine-tune especializado en hardware de consumo sin GPU dedicada.

Los datos de entrenamiento provienen del dataset samadpls/torchlight-threads: 6.918 conversaciones de los foros de PyTorch, donde cada respuesta es el post que resolvió el hilo. Una minoría de ejemplos corresponde a casos en los que el modelo aprende a solicitar información adicional (código mínimo reproducible o mensaje de error completo) en lugar de especular. No se ha publicado información sobre el número total de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Respuesta a preguntas técnicas sobre PyTorch: tensores, dispositivos, entrenamiento, errores comunes
- Generación de código PyTorch con APIs reales de la librería (evaluado: 9 de 10 respuestas usaban solo APIs válidas)
- Detección de preguntas incompletas: pide código mínimo o el error completo en lugar de adivinar
- Conversación multi-turno en inglés (pipeline text-generation, formato conversacional)
- Respuestas cortas y directas (mediana de 31 tokens por respuesta)
- Ejecución local en Apple Silicon vía mlx-lm y en CPU/GPU vía llama.cpp, Ollama o LM Studio

## Casos de uso

- Asistente de depuración para desarrolladores de PyTorch: dado un mensaje de error o un fragmento de código problemático, sugiere la corrección basándose en soluciones reales que resolvieron hilos del foro.
- Integración en IDEs o extensiones de editor: su tamaño de 3,8B y las cuantizaciones GGUF permiten ejecutarlo localmente y ofrecer ayuda contextual sobre errores de PyTorch sin enviar código a servicios externos.
- Soporte técnico en comunidades y foros: puede actuar como primer filtro respondiendo dudas frecuentes de PyTorch y solicitando detalles a los usuarios cuando la pregunta es ambigua.
- Formación y onboarding de equipos: útil para desarrolladores junior que se inician en PyTorch y necesitan respuestas concretas sobre tensores, dispositivos y errores de entrenamiento.
- Chatbots de documentación interna en empresas que trabajan con PyTorch: su licencia MIT permite uso comercial sin restricciones.
- Caso de estudio de fine-tune eficiente: el repositorio y el dataset públicos sirven como referencia para quien quiera replicar el proceso de especialización de modelos pequeños en dominios concretos.

## Benchmarks y rendimiento

Evaluación publicada por el autor: 260 preguntas del foro de PyTorch (de 2025-01-01 a 2026-10-08, posteriores al corte de conocimiento del modelo), puntuadas del 1 al 5 por Claude Opus 5.5 comparando con la respuesta que resolvió el hilo.

| Modelo | Nota media (sobre 5) | Respuestas 4-5 | Respuestas erróneas (nota 1) | APIs torch reales | Pide detalles cuando faltan |
|---|---|---|---|---|---|
| Phi-4-mini (base) | 1,88 | 5% | 39% | 170 de 175 | 0 de 7 |
| Phi-4-mini + busqueda foro | 1,75 | 5% | 45% | 145 de 157 | 1 de 7 |
| torchlight (fine-tuned) | 1,97 | 7% | 27% | 9 de 10 | 0 de 7 |
| torchlight + busqueda foro | 1,95 | 6% | 26% | 4 de 4 | 0 de 7 |

Datos adicionales: la reducción de respuestas erróneas (39% a 27%) es estadísticamente significativa (p = 0,003). La mediana de longitud de respuesta es de 31 tokens frente a 690 del modelo base, y respondió las 260 preguntas en 9 minutos frente a 32 del base. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este fine-tune.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 8 GB en 16 bits (el repo completo pesa 7,7 GB); unos 2,5-3 GB con Q4_K_M y unos 4 GB con Q8_0 en GGUF
- GPU recomendadas: no requiere GPU dedicada; funciona en Apple Silicon (el entrenamiento se hizo en un M3 Pro) y en GPUs de consumo con 8 GB o más para la versión completa
- Consumer GPUs: cabe holgadamente en una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB en 16 bits; con GGUF Q4_K_M funciona incluso en portátiles con 8 GB de VRAM o en CPU
- Opciones de despliegue: transformers (pipeline), mlx-lm (Apple Silicon), PEFT (adaptador LoRA), llama.cpp, Ollama y LM Studio (GGUF)
- Latencia y throughput: no disponible; como referencia, el modelo respondió 260 preguntas en 9 minutos en el entorno de evaluación del autor

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| torchlight-phi4-mini | 3,8B | Especializado en PyTorch (fine-tune) | MIT | safetensors, LoRA, GGUF |
| Phi-4-mini-instruct (base) | 3,8B | Uso general, instrucciones | MIT | safetensors, ONNX, GGUF |
| CodeQwen / modelos de codigo pequenos | no disponible | Codigo general | no disponible | no disponible |

La comparación más relevante es con su propio modelo base: torchlight reduce las respuestas erróneas en el dominio de PyTorch del 39% al 27% y supera al modelo base incluso cuando este dispone de búsqueda en el foro (1,97 frente a 1,75 de nota media). No hay datos comparativos publicados frente a otros modelos especializados en PyTorch.

## Limitaciones y advertencias

- Solo está pensado para preguntas sobre PyTorch en inglés; su rendimiento en otros dominios o idiomas no está garantizado ni evaluado
- El 27% de sus respuestas se evaluaron como erróneas en el benchmark del autor; conviene verificar siempre las correcciones sugeridas
- El 7% de las veces pide detalles cuando no son necesarios (falsos positivos en la petición de información)
- Las preguntas del test son posteriores al corte de conocimiento del modelo, lo que indica que su conocimiento de versiones recientes de PyTorch puede estar desactualizado
- La evaluación fue realizada por un único LLM juez (Claude Opus 5.5), lo que introduce un posible sesgo de evaluación
- Solo un 5-7% de las respuestas alcanzan la nota 4-5 (la misma solución que resolvió el hilo), lo que indica que el test es muy exigente y el modelo rara vez da la solución exacta
- La licencia MIT no impone restricciones de uso comercial, pero las respuestas generadas deben revisarse en entornos de producción

## Enlaces

- Modelo completo: https://huggingface.co/samadpls/torchlight-phi4-mini
- Adaptador LoRA: https://huggingface.co/samadpls/torchlight-phi4-mini-lora
- Version GGUF: https://huggingface.co/samadpls/torchlight-phi4-mini-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/samadpls/torchlight-threads
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Codigo del proyecto: https://github.com/samadpls/torchlight
- Web del autor: https://samadpls.com
- Foro de PyTorch (fuente de datos): https://discuss.pytorch.org
