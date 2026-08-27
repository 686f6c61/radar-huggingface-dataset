# gradients-io-tournaments/swe-base-qwen3-8b-continuous

## Resumen

El modelo `gradients-io-tournaments/swe-base-qwen3-8b-continuous` es una copia limpia y renombrada de un modelo ganador de un torneo organizado por Gradients, utilizado como modelo base objetivo en el entorno de torneo `swe_infinite`. Se trata de un fine-tuning continuo (continuous-SFT) sobre el modelo base `Qwen/Qwen3-8B-Base`, perteneciente a la familia Qwen3. El repositorio se publica con fines de reproducibilidad y empaquetado, sin modificaciones en los pesos respecto al repositorio original.

El modelo tiene 8.190.735.360 parámetros (8B), arquitectura `Qwen3ForCausalLM` y está disponible en formato `safetensors` con licencia Apache-2.0. Su propósito principal es servir como punto de partida para tareas de ingeniería de software (SWE) en entornos de torneo, aunque al ser un modelo base, también puede utilizarse para fine-tuning en otras tareas de generación de texto. La relevancia actual radica en que representa un ejemplo de fine-tuning continuo sobre Qwen3-8B-Base, una arquitectura moderna con soporte para tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (model_type=qwen3) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-8B-Base soporta 32.768 tokens, pero no se especifica en este repo) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en BF16) |
| Idiomas soportados | no disponible (el modelo base Qwen3-8B-Base soporta multiples idiomas, pero no se detalla en este repo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3, un transformer decoder-only con atención causal. Al ser un fine-tuning de `Qwen/Qwen3-8B-Base`, hereda la estructura original de Qwen3-8B, que incluye 36 capas, 32 cabezas de atención y una dimensión oculta de 4096. El entrenamiento se realizó mediante un proceso de fine-tuning supervisado continuo (continuous-SFT) dentro de un "linaje" denominado `qwen`, que fue retirado tras la octava iteración (train_index 8). No se proporcionan detalles sobre el dataset utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. El repositorio conserva la plantilla de chat con soporte para tool calling (`chat_template.jinja`), lo que indica que el fine-tuning incluyó datos con formato de herramientas.

## Capacidades

- Generación de texto: al ser un modelo base fine-tuneado, puede generar texto coherente en tareas de lenguaje natural, aunque no está optimizado para seguir instrucciones complejas sin fine-tuning adicional.
- Soporte de tool calling: la plantilla de chat incluida (`chat_template.jinja`) permite formatear conversaciones con llamadas a herramientas, lo que sugiere que el modelo puede ser utilizado en escenarios de function calling.
- Capacidad de fine-tuning: al ser un modelo base, está diseñado para ser adaptado a tareas específicas mediante fine-tuning, especialmente en el dominio de ingeniería de software (SWE).
- Multilingüismo: no se especifican idiomas concretos, pero al derivar de Qwen3-8B-Base, es probable que herede capacidades multilingües del modelo original (principalmente inglés y chino, entre otros).
- Sin modo de razonamiento explícito: no se menciona soporte para "thinking mode" ni razonamiento multi-paso más allá de lo que permite la arquitectura base.

## Casos de uso

- Base para fine-tuning en tareas de ingeniería de software: el modelo se creó como base para el entorno de torneo `swe_infinite`, por lo que su uso principal es ser fine-tuneado para resolver issues de repositorios, generar parches o completar código. Su tamaño de 8B lo hace manejable para fine-tuning en GPUs de gama media.
- Desarrollo de agentes de codificación: gracias a la plantilla de tool calling, puede integrarse en sistemas de agentes que necesiten invocar funciones externas (por ejemplo, ejecutar comandos, leer archivos) durante la generación de código.
- Investigación en fine-tuning continuo: sirve como ejemplo de un linaje de entrenamiento continuo sobre Qwen3-8B-Base, útil para estudiar la evolución de capacidades a lo largo de iteraciones de SFT.
- Generación de texto general con adaptación posterior: al ser un modelo base, puede fine-tunearse para tareas de generación de texto específicas (resúmenes, traducción, etc.) con un coste computacional moderado.
- Evaluación de modelos en entornos de torneo: puede utilizarse como referencia o baseline en competiciones de modelos de lenguaje, dado que fue un ganador en su categoría.
- Prototipado de aplicaciones conversacionales: aunque no es un modelo instruct, con un fine-tuning ligero puede adaptarse a chatbots o asistentes que requieran gestión de contexto y llamadas a herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se proporcionan comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en BF16 (16.4 GB en disco), se necesitan al menos 16 GB de VRAM para cargar el modelo completo en memoria. Con cuantización a 8 bits (no publicada en el repo, pero posible mediante herramientas externas), la VRAM se reduciría a unos 8-9 GB; con 4 bits, a unos 5-6 GB.
- GPU recomendadas: para inferencia en BF16, una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A10G) es suficiente. Para fine-tuning, se recomienda al menos 48 GB (A6000, A100 40GB) o usar técnicas como LoRA.
- Compatibilidad con GPUs de consumo: sí, cabe en una RTX 4090 (24 GB) con cuantización a 8 bits o incluso en una RTX 3080 (10-12 GB) con cuantización a 4 bits.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) u Ollama (mediante conversión). El repo indica compatibilidad con `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput: no se proporcionan datos específicos. Para un modelo de 8B en una GPU moderna, se puede esperar una latencia de decodificación de 20-50 ms/token y un throughput de 50-100 tokens/s con batching, dependiendo del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gradients-io-tournaments/swe-base-qwen3-8b-continuous | 8.19B | no disponible | Apache-2.0 | safetensors | Fine-tuning continuo de Qwen3-8B-Base, ganador de torneo |
| Qwen/Qwen3-8B-Base | 8.19B | 32.768 tokens | Apache-2.0 | safetensors | Modelo base original, sin fine-tuning |
| Qwen/Qwen3-8B | 8.19B | 32.768 tokens | Apache-2.0 | safetensors | Versión instruct con modo thinking y no-thinking |

La comparativa se limita a los modelos Qwen3-8B, ya que no se dispone de información sobre otros modelos comparables en el mismo dominio (SWE). El modelo analizado se diferencia del base por su fine-tuning continuo, que probablemente mejora capacidades específicas para tareas de ingeniería de software, aunque no hay benchmarks que lo confirmen.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos del modelo. Al derivar de Qwen3-8B-Base, puede heredar sesgos presentes en los datos de entrenamiento originales de Qwen.
- Riesgo de alucinación: al ser un modelo base sin fine-tuning instruct, puede generar contenido factualmente incorrecto o inventado, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto: aunque el modelo base soporta 32.768 tokens, no se confirma que este fine-tuning mantenga esa longitud. Se recomienda verificar antes de usar en aplicaciones con contexto largo.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribución y no utilizar marcas registradas de Qwen sin permiso.
- Sin garantías de rendimiento: al ser un modelo de torneo, no se han publicado evaluaciones formales. Su uso en producción requiere validación previa con datos propios.
- El repositorio omite el archivo `loss.txt` del original, por lo que no se puede auditar la curva de pérdida del entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gradients-io-tournaments/swe-base-qwen3-8b-continuous
- Repositorio original (referenciado en la model card): `gradients-io-tournaments/tournament-tourn_e758aac2d861c378_20260824-9b4b7e1a-6a7c-4ab0-bee7-3744b35bddd8-5HWPK9f6` (no se proporciona URL directa)
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Página de Qwen: https://qwen.ai/home
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
