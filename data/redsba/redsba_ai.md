# redSBA/redSBA_ai

## Resumen

redSBA_ai es un ajuste fino (fine-tune) del modelo Qwen2.5-Coder-1.5B, desarrollado por el usuario redSBA y publicado en Hugging Face bajo licencia MIT. Se trata de un modelo de generación de texto orientado a código, con un tamaño de 1.500 millones de parámetros, que hereda la arquitectura transformer decoder-only del modelo base de Alibaba Qwen. La model card indica que está pensado para tareas de asistencia con modificaciones (mods) y generación de código en C++, Java y Lua, aunque la descripción del propósito aparece como texto de plantilla sin completar por el autor.

El modelo se distribuye en dos formatos: pesos originales en `model.safetensors` (precisión f16) y una versión cuantizada en `redsba-f16.gguf` para su ejecución con llama.cpp u Ollama. Los idiomas declarados son ruso e inglés, lo que lo diferencia del modelo base, orientado principalmente al inglés y a lenguajes de programación.

La relevancia de esta ficha es limitada: el repositorio no incluye datos de entrenamiento, benchmarks ni documentación técnica sustancial, y no registra descargas ni interacciones en el momento de la consulta. Se trata, por tanto, de un modelo experimental de nicho cuya evaluación rigurosa no es posible con la información pública disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-1.5B) |
| Parametros totales | 1.500 millones (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5 soporta hasta 32.768 tokens, pero el autor no lo confirma) |
| Tipos de cuantizacion | f16 (safetensors) y GGUF f16; no se documentan otras cuantizaciones |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen2.5-Coder-1.5B, un transformer decoder-only con atención causal estándar, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). No se dispone de información sobre el proceso de ajuste fino: la model card no especifica el número de tokens de entrenamiento, la composición del dataset, si se emplearon técnicas de RLHF, DPO o SFT, ni los hiperparámetros utilizados.

La única innovación documentada es la publicación de una versión en formato GGUF, que facilita la inferencia local en CPU y GPU de gama baja mediante llama.cpp u Ollama. No se mencionan técnicas como decodificación especulativa, atención lineal ni variantes híbridas.

## Capacidades

- Generación de texto y código, con especialización declarada en C++, Java y Lua según la model card.
- Asistencia en tareas de modding (modificaciones de videojuegos o software), aunque el alcance concreto no está detallado.
- Soporte bilingüe ruso-inglés, lo que permite interacción y generación de código con comentarios o documentación en ambos idiomas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode).
- No se documentan capacidades matemáticas específicas más allá de las inherentes al modelo base.

## Casos de uso

- Asistencia a modders de videojuegos: el modelo puede generar fragmentos de código en Lua o C++ para modificaciones, gracias a su ajuste declarado sobre estos lenguajes y a su tamaño reducido, que permite ejecución local en equipos modestos.
- Generación de código en entornos con recursos limitados: al ser un modelo de 1,5B parámetros en GGUF, puede desplegarse en portátiles sin GPU dedicada mediante llama.cpp u Ollama, ofreciendo autocompletado y generación de funciones en C++ o Java.
- Documentación bilingüe ruso-inglés: útil para equipos que trabajan en ambos idiomas y necesitan comentarios, docstrings o explicaciones de código en ruso e inglés.
- Prototipado rápido de scripts: para tareas de automatización sencillas en Lua (por ejemplo, scripts de configuración o plugins), el modelo puede generar borradores que el desarrollador revise y complete.
- Educación y aprendizaje de programación: con 1,5B parámetros y licencia MIT, puede integrarse en entornos docentes o herramientas de formación sin coste de licencia, explicando fragmentos de código en ruso o inglés.
- Experimentación en investigación de ajuste fino: sirve como ejemplo de fine-tune de Qwen2.5-Coder-1.5B para estudiar cómo se comporta un modelo pequeño tras un ajuste específico, aunque la falta de documentación limita su valor como referencia reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en f16: aproximadamente 3 GB (1,5B parámetros × 2 bytes), más overhead de contexto y activaciones, lo que sitúa el consumo real en torno a 3,5-4 GB.
- VRAM estimada en GGUF f16: similar a la versión safetensors, en torno a 3-4 GB según la implementación de llama.cpp y la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para f16 con contexto moderado; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutarlo sin problemas, aunque las de gama alta están sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en modelos como GTX 1660 Super (6 GB), RTX 3050, RTX 3060, RTX 4060 y superiores. También puede ejecutarse en CPU mediante llama.cpp con la versión GGUF.
- Opciones de despliegue: llama.cpp y Ollama son las opciones documentadas por el autor (formato GGUF). vLLM y TGI no están confirmados para este repositorio, aunque podrían funcionar con los pesos safetensors si la arquitectura es compatible con Qwen2.5.
- Latencia y throughput estimados: no disponibles. Para un modelo de 1,5B en una RTX 3060, cabría esperar decenas de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| redSBA_ai | 1,5B | no disponible | ru, en | MIT | safetensors, GGUF | Fine-tune de Qwen2.5-Coder-1.5B, sin benchmarks |
| Qwen2.5-Coder-1.5B | 1,5B | 32.768 tokens | en y multilingüe | Apache 2.0 | safetensors, GGUF | Modelo base, con benchmarks publicados y amplia adopción |
| DeepSeek-Coder-1.3B | 1,3B | 16.384 tokens | en y multilingüe | DeepSeek License | safetensors, GGUF | Orientado a código, con benchmarks publicados |
| StarCoder2-3B | 3B | 16.384 tokens | en y multilingüe | BigCode OpenRAIL-M | safetensors | Mayor tamaño, con benchmarks y adopción comunitaria |

La comparativa se basa en datos públicos de los modelos alternativos; para redSBA_ai no hay benchmarks que permitan una comparación de rendimiento real.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto que permita evaluar su calidad frente al modelo base.
- Documentación incompleta: la model card contiene texto de plantilla sin completar (por ejemplo, la descripción del propósito aparece como instrucción entre corchetes), lo que impide conocer el dataset de ajuste y el proceso de entrenamiento.
- Riesgo de alucinación: como todo modelo de lenguaje de 1,5B, puede generar código sintácticamente plausible pero incorrecto, especialmente en APIs poco comunes o en lógica compleja.
- Sesgos conocidos: no documentados por el autor; al heredar el modelo base, puede arrastrar sesgos presentes en los datos de Qwen2.5-Coder.
- Limitaciones de idioma: solo se declaran ruso e inglés; el rendimiento en castellano no está garantizado ni documentado.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo base Qwen2.5-Coder-1.5B está bajo Apache 2.0, compatible con MIT; no obstante, el autor no detalla obligaciones de atribución adicionales.
- Falta de adopción: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación comunitaria y de informes de errores.
- Contexto no confirmado: aunque el modelo base soporta 32.768 tokens, el autor no especifica si el fine-tune preserva esa ventana, por lo que no debe asumirse en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/redSBA/redSBA_ai
- Modelo base Qwen2.5-Coder-1.5B: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
