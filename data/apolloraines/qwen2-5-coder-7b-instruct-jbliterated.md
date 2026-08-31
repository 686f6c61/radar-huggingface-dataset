# ApolloRaines/Qwen2.5-Coder-7B-Instruct-Jbliterated

## Resumen

Qwen2.5-Coder-7B-Instruct-Jbliterated es un fine-tune del modelo Qwen/Qwen2.5-Coder-7B-Instruct, desarrollado por ApolloRaines, que aplica la técnica denominada "Jbliteration" para eliminar los mecanismos de rechazo (refusal) del modelo original. El objetivo es obtener un asistente de codigo que responda de forma consistente a cualquier formulacion de una misma peticion, sin mostrar "falsa complacencia" ni negarse a responder en escenarios que el modelo base consideraria sensibles. Se presenta como una alternativa "uncensored" para tareas de generacion de texto y codigo, manteniendo la arquitectura y capacidades del modelo base.

El modelo conserva los 7.615 millones de parametros del Qwen2.5-Coder-7B-Instruct, con arquitectura transformer basada en Qwen2.5, y se distribuye bajo licencia Apache 2.0. El repositorio incluye pesos en formato safetensors (bfloat16) y tambien un archivo GGUF Q8_0, lo que facilita su uso en entornos de inferencia locales. La relevancia actual radica en la demanda de modelos de codigo sin restricciones de contenido, aunque esto conlleva riesgos importantes que se detallan en la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) con RoPE, QKV bias, attention GQA |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (modelo base; no se especifica cambio en el fine-tune) |
| Tipos de cuantizacion | bfloat16 (safetensors), Q8_0 (GGUF) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-7B-Instruct, que a su vez se basa en la arquitectura Qwen2.5: transformer decoder-only con atencion por grupos de consultas (GQA), embeddings rotatorios (RoPE) y normalizacion RMSNorm. El modelo base fue preentrenado sobre 5,5 billones de tokens, incluyendo codigo fuente, datos de texto y datos sinteticos, y posteriormente ajustado con instrucciones. El fine-tune Jbliterated modifica todas las capas transformer mediante un proceso de "descomposicion geometrica del subespacio de rechazo", segun describe el autor, con el fin de eliminar los patrones de negativa aprendidos. No se proporcionan detalles sobre el dataset de fine-tune, el numero de pasos ni el metodo de optimizacion. El autor indica que la version v2 mejora el pipeline de procesamiento y la coherencia de las respuestas, pero no publica metricas de validacion.

## Capacidades

- Generacion de texto y codigo: mantiene las capacidades del modelo base para completar, explicar y depurar codigo en multiples lenguajes.
- Razonamiento y matematicas: hereda las habilidades del Qwen2.5-Coder-7B-Instruct en tareas de razonamiento logico y resolucion de problemas matematicos.
- Instrucciones conversacionales: soporta el formato de chat de Qwen2.5 mediante plantilla de chat, con manejo de conversaciones multi-turno.
- Respuesta sin censura: el objetivo principal del fine-tune es eliminar los rechazos, por lo que responde a peticiones que el modelo base podria bloquear, incluyendo contenido potencialmente peligroso o eticamente cuestionable.
- Multilingue limitado: solo ingles y chino, segun la model card.
- Sin capacidades de tool calling ni modo agente: no se menciona soporte para function calling ni integracion con herramientas externas en la informacion disponible.

## Casos de uso

- Generacion de codigo en entornos de investigacion: el modelo puede producir fragmentos de codigo, funciones completas o scripts de automatizacion, aprovechando su entrenamiento sobre 5,5 billones de tokens de codigo. Es adecuado para prototipado rapido en Python, Java, C++ y otros lenguajes.
- Depuracion y explicacion de codigo: dado su ajuste por instrucciones, puede recibir un fragmento con errores y devolver una explicacion del fallo junto con una correccion, util en entornos de desarrollo sin acceso a modelos propietarios.
- Asistente de programacion sin restricciones de contenido: en contextos donde se requiere explorar tecnicas de seguridad ofensiva, exploits o codigo malicioso con fines educativos o de auditoria, el modelo no aplica los filtros de rechazo del modelo base.
- Generacion de documentacion tecnica: puede redactar comentarios, docstrings y documentacion de API a partir de codigo fuente, manteniendo coherencia con el estilo del proyecto.
- Traduccion de codigo entre lenguajes: convierte algoritmos o logica de negocio entre lenguajes de programacion, apoyandose en su conocimiento multilingue de codigo.
- Experimentacion con tecnicas de "uncensoring": el modelo sirve como caso de estudio para investigadores interesados en metodos de eliminacion de sesgos de seguridad en LLMs, permitiendo analizar el comportamiento de un modelo sin capas de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para el fine-tune Jbliterated en la informacion disponible. El modelo base Qwen2.5-Coder-7B-Instruct reporta en su documentacion oficial resultados en HumanEval, MBPP, GSM8K y otros, pero estos datos no se han replicado ni verificado para esta variante. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bfloat16 ocupa aproximadamente 15,2 GB (7,6B parametros x 2 bytes). Con cuantizacion Q8_0 (GGUF) el peso se reduce a unos 7,6 GB, mas overhead de contexto.
- GPU recomendadas: para bfloat16 se necesita una GPU con al menos 16 GB de VRAM, como NVIDIA A100 (40 GB), RTX 4090 (24 GB) o A6000 (48 GB). Con Q8_0, una RTX 3090 (24 GB) o RTX 4080 (16 GB) puede ser suficiente para contextos moderados.
- Compatibilidad con GPU de consumo: si, con cuantizacion Q8_0 y ventanas de contexto reducidas (por ejemplo, 8K-16K tokens) cabe en GPUs de 12-16 GB como RTX 3060 o RTX 4070.
- Opciones de despliegue: el autor recomienda DeepswapLLM para ejecutar el modelo en GPUs con poca memoria, transmitiendo capas entre GPU, RAM y disco. Tambien es compatible con transformers (device_map="auto"), llama.cpp para GGUF, y potencialmente vLLM u Ollama si se convierte el formato.
- Latencia y throughput: no se proporcionan datos medidos. Como referencia, un modelo de 7B en una RTX 4090 con Q8_0 suele generar entre 30 y 60 tokens por segundo, pero depende de la implementacion y el contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen2.5-Coder-7B-Instruct (base) | 7,6B | 128K | Apache 2.0 | Codigo con censura estandar |
| Qwen2.5-Coder-7B-Instruct-Jbliterated | 7,6B | 128K (heredado) | Apache 2.0 | Codigo sin censura |
| CodeLlama-7B-Instruct | 7B | 16K | Llama 2 license | Codigo con restricciones de uso comercial |
| DeepSeek-Coder-7B-Instruct | 7B | 16K | DeepSeek license | Codigo con licencia permisiva pero no Apache |

La principal diferencia frente al modelo base es la eliminacion de los mecanismos de rechazo. Frente a CodeLlama y DeepSeek-Coder, el modelo Jbliterated ofrece una ventana de contexto mayor (128K) y licencia Apache 2.0, pero carece de garantias de rendimiento publicadas y de soporte para tool calling.

## Limitaciones y advertencias

- Ausencia de censura: el modelo puede generar contenido peligroso, ilegal o eticamente cuestionable (codigo malicioso, instrucciones para actividades delictivas, etc.). Su uso en produccion o en entornos compartidos requiere control de acceso y supervision humana.
- Riesgo de alucinacion: al igual que el modelo base, puede inventar APIs, funciones o comportamientos inexistentes, especialmente en codigo poco comun o en contextos largos.
- Sesgos no documentados: no se ha realizado una evaluacion de sesgos sobre este fine-tune; el proceso de "jbliteration" podria alterar el comportamiento en dominios sensibles de forma impredecible.
- Limitaciones de idioma: solo ingles y chino; no se garantiza calidad en otros idiomas.
- Soporte limitado: el autor no proporciona documentacion sobre el proceso de entrenamiento, dataset ni metricas, lo que dificulta la reproducibilidad y la confianza en el modelo.
- Riesgo legal: aunque la licencia es Apache 2.0, el uso de un modelo sin censura puede violar politicas de plataformas o leyes locales segun el contexto de despliegue.
- Compatibilidad: el uso de trust_remote_code=True en el ejemplo de carga implica ejecutar codigo del repositorio, lo que conlleva riesgos de seguridad si el repositorio se ve comprometido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Qwen2.5-Coder-7B-Instruct-Jbliterated
- Modelo base Qwen2.5-Coder-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio DeepswapLLM: https://github.com/apolloraines/DeepswapLLM
- Reporte tecnico de Qwen2.5-Coder: https://arxiv.org/html/2409.12186v1
