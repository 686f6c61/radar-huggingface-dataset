# AnonimXxx/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive es un modelo de lenguaje causal de gran tamaño, publicado por AnonimXxx, que parte de la arquitectura de Qwen3-Coder-Next. Se trata de una variante fine-tuned sobre el modelo original de Alibaba Qwen, orientada a agentes de codificación y desarrollo local, con una capa adicional de desalineación ("uncensored") y un estilo de respuesta más directo ("aggressive"). El modelo conserva la arquitectura híbrida de Qwen3-Coder-Next: 48 capas que combinan atención lineal Gated DeltaNet, atención con gates y capas de Mixture of Experts (MoE).

Según los pesos publicados en safetensors, el modelo tiene 79.674.391.296 parámetros totales, lo que coincide aproximadamente con los 80B declarados en la documentación de referencia. El número de parámetros activos es de 3B, lo que lo hace especialmente eficiente en cómputo para su tamaño. La ventana de contexto es de 262.144 tokens nativos, lo que permite procesar repositorios completos o sesiones de agente muy largas. La relevancia actual del modelo radica en su capacidad para ejecutarse con un coste computacional bajo en tareas de agente, manteniendo un rendimiento comparable a modelos con 10–20 veces más parámetros activos, aunque la ausencia de datos de benchmarks propios y la naturaleza "uncensored" exigen una evaluación cuidadosa antes de su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Gated DeltaNet (atencion lineal) + Gated Attention + MoE |
| Parametros totales | 79.674.391.296 (safetensors); ~80B segun README |
| Parametros activos | 3B segun README (el nombre del modelo sugiere 35B, dato no verificado) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible en el repositorio (solo safetensors) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura hibrida de 48 capas, organizadas en 12 bloques de 4 capas cada uno. Dentro de cada bloque, las tres primeras capas utilizan Gated DeltaNet (una forma de atencion lineal con 32 cabezas para V y 16 para QK, dimension de cabeza 128) seguidas de capas MoE, mientras que la cuarta capa emplea Gated Attention (16 cabezas para Q y 2 para KV, dimension de cabeza 256, RoPE de 64 dimensiones) tambien seguida de MoE. Esta combinacion permite escalar a contextos muy largos con menor coste que la atencion cuadratica estandar.

El componente MoE tiene 512 expertos en total, de los cuales 10 se activan por token, mas un experto compartido. La dimension intermedia de cada experto es de 512. Segun la documentacion de referencia (Qwen3-Coder-Next), el modelo fue entrenado mediante pretraining y post-training, con un enfoque especifico para agentes: razonamiento de largo horizonte, uso complejo de herramientas y recuperacion ante fallos de ejecucion. Sin embargo, no se proporcionan detalles sobre el dataset ni el metodo de fine-tuning aplicado en esta variante concreta de AnonimXxx, ni si se utilizaron tecnicas como RLHF o DPO.

El modelo solo soporta modo no-thinking, por lo que no genera bloques de pensamiento del tipo `` en su salida.

## Capacidades

- Generacion de texto y codigo, con especializacion en tareas de agentes de codificacion.
- Tool calling y function calling avanzados, compatibles con parsers como `qwen3_coder` en sglang y vLLM.
- Razonamiento de largo horizonte y recuperacion de errores en flujos de ejecucion dinamicos.
- Ventana de contexto de 256K tokens, que permite cargar multiples archivos o mantener un historial extenso de conversacion.
- Integracion con scaffolds y entornos de desarrollo como Claude Code, Qwen Code, Qoder, Kilo, Trae y Cline.
- Despliegue mediante multiples frameworks de inferencia: sglang, vLLM, Ollama, LMStudio, MLX-LM, llama.cpp y KTransformers.
- No genera bloques de pensamiento (modo no-thinking), lo que simplifica el flujo de inferencia.

## Casos de uso

- Agente de codificacion en repositorios extensos: el modelo puede analizar multiples archivos simultaneamente gracias a su contexto de 262K tokens, manteniendo el estado de la tarea a lo largo de una sesion larga.
- Asistente de desarrollo integrado en IDEs: se puede conectar a plataformas como Cline o Qoder mediante las plantillas de scaffold, permitiendo autocompletar, refactorizar y explicar codigo en tiempo real.
- Refactorizacion automatizada de proyectos: mediante tool calling, el modelo puede ejecutar comandos, comprobar resultados y aplicar cambios incrementales en el codigo.
- Integracion en pipelines CI/CD: sirviendo el modelo con vLLM o sglang, se puede emplear para generar pruebas unitarias, revisar cambios o automatizar la documentacion tecnica.
- Investigacion sobre modelos sin alineamiento: la variante "uncensored" permite estudiar comportamientos sin restricciones de seguridad, lo que resulta util para analisis de sesgos y robustez, siempre que se realice en entornos controlados.
- Despliegue local en entornos con recursos limitados: aunque este repositorio no incluye versiones cuantizadas, el modelo puede convertirse a GGUF y ejecutarse con llama.cpp u Ollama, gracias a su bajo numero de parametros activos (3B).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion de referencia incluye graficas de rendimiento (SWE-bench, benchmarks comparativos), pero no se proporcionan los valores numericos concretos. Por tanto, no es posible presentar una tabla comparativa de resultados para esta variante especifica.

## Requisitos de hardware

- El repositorio pesa 159.4 GB en safetensors, lo que implica que cargar todos los pesos en precision BF16/FP16 requiere aproximadamente 160 GB de VRAM en total.
- Para el despliegue con sglang o vLLM, el README recomienda usar tensor parallel en 2 GPUs (por ejemplo, 2x A100 o 2x H100 de 80 GB) para servir el modelo con contexto maximo de 256K tokens.
- En caso de OOM, se recomienda reducir la longitud de contexto a 32.768 tokens.
- No cabe en una GPU de consumo sin cuantizacion. Para uso local con Ollama, LMStudio o llama.cpp, se necesita una version cuantizada (GGUF) que no se proporciona en este repositorio.
- Opciones de despliegue: sglang (>=0.5.8), vLLM (>=0.15.0), Ollama, LMStudio, MLX-LM, llama.cpp, KTransformers.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar. El modelo es esencialmente una variante fine-tuned de Qwen3-Coder-Next, por lo que comparte arquitectura, tamano y contexto con el modelo original. La principal diferencia es el fine-tuning "uncensored" y el estilo "aggressive" aplicado por el autor, del que no se aportan especificaciones tecnicas adicionales. Se recomienda consultar las evaluaciones publicadas por Qwen para el modelo base a fin de obtener una referencia del rendimiento esperado.

Otras variantes encontradas en la busqueda web, como `HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive` y `LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF`, parecen seguir un patron similar de nombres, pero no se han localizado especificaciones ni resultados publicados que permitan una comparacion tecnica rigurosa.

## Limitaciones y advertencias

- Al ser una version "uncensored", el modelo no aplica las restricciones de seguridad del modelo base, por lo que puede generar contenido danino, ilegal o sesgado sin filtros.
- Existe una discrepancia entre el nombre del modelo (que sugiere 35B activos) y la especificacion de la arquitectura (3B activos). Esta ambiguedad debe verificarse antes de utilizar el modelo en produccion.
- No se proporcionan datos de benchmarks ni evaluaciones de la variante, por lo que su rendimiento real es desconocido.
- El modelo solo funciona en modo no-thinking, lo que puede limitar la interpretabilidad en tareas complejas de razonamiento.
- Riesgo de alucinacion, especialmente en tareas de agente donde no se verifica la salida con el entorno real.
- La licencia Apache 2.0 permite uso comercial, pero el modelo hereda las condiciones del modelo base Qwen3-Coder-Next; se recomienda revisar la licencia original para confirmar restricciones adicionales.
- Para despliegue en produccion, es imprescindible evaluar el modelo con casos de uso propios, ya que no hay datos publicos de fiabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonimXxx/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Blog de Qwen3-Coder-Next: https://qwen.ai/blog?id=qwen3-coder-next
- Repositorio de Qwen3-Coder: https://github.com/QwenLM/Qwen3-Coder
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Variante similar en HuggingFace: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Version GGUF de una variante similar: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF
