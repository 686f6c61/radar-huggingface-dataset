# Kami0867/Phi-3.5-mini-Socratic-Coding-Tutor

## Resumen

Phi-3.5-mini-Socratic-Coding-Tutor es un adaptador LoRA afinado sobre `microsoft/Phi-3.5-mini-instruct`, desarrollado por el usuario Kami0867 y publicado en Hugging Face. El modelo está especializado en tutoría de programación mediante el método socrático, siguiendo la metodología PACT (Pedagogical Alignment for Coding Tutors). En lugar de entregar soluciones completas listas para copiar y pegar, el modelo interactúa con el desarrollador mediante preguntas dirigidas, sondeos sobre la comprensión conceptual, señalamiento de casos límite y guías para que el aprendiz descubra y corrija sus propios errores.

El problema que resuelve es bien conocido en el ámbito educativo: los asistentes de código convencionales tienden a generar soluciones completas de inmediato, lo que puede frenar el aprendizaje real. Este modelo invierte ese enfoque y actúa como un tutor que descompone problemas complejos en hitos manejables, valida el progreso parcial del usuario antes de señalar fallos y evita dar la solución directa salvo petición explícita tras varios intentos fallidos.

Técnicamente se trata de un adaptador PEFT de tipo QLoRA en 8 bits, entrenado con SFT mediante las librerías `peft` y `trl` de Hugging Face sobre el dataset `AndreiSobo/PACT-Socratic-Coding-Tutor`, compuesto por diálogos conversacionales multi-turno. El modelo base, Phi-3.5-mini-instruct de Microsoft, es un transformer decoder-only de 3,8 mil millones de parámetros con una ventana de contexto de 128K tokens. El repositorio pesa unos 0,1 GB (solo el adaptador) y se publica bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-3.5) con adaptador LoRA (PEFT) |
| Parametros totales | 3,8 mil millones (modelo base Phi-3.5-mini-instruct); adaptador de ~0,1 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (modelo base); entrenamiento con secuencias de 1024 tokens |
| Tipos de cuantizacion | 8 bits (QLoRA con bitsandbytes, `load_in_8bit=True`) |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base requiere descarga aparte |

## Arquitectura y entrenamiento

El modelo combina la arquitectura de Phi-3.5-mini-instruct (transformer decoder-only descrito en el Phi-3 Technical Report) con un adaptador LoRA entrenado mediante QLoRA en 8 bits. Los módulos objetivo del adaptador son `qkv_proj`, `o_proj`, `gate_up_proj` y `down_proj`, con rank 16, alpha 32, dropout de 0,05 y bias desactivado. El entrenamiento se realizó con Supervised Fine-Tuning (SFT) usando las librerías `peft` y `trl` de Hugging Face, durante 4 épocas con longitud máxima de secuencia de 1024 tokens.

Los datos de entrenamiento provienen del dataset `AndreiSobo/PACT-Socratic-Coding-Tutor`, formado por diálogos conversacionales multi-turno que ejemplifican patrones de interacción socrática: pistas progresivas, preguntas guiadas y descomposición de problemas. No se ha documentado el uso de RLHF ni DPO; el ajuste es exclusivamente supervisado. La model card no detalla el número total de tokens de entrenamiento ni el tamaño exacto del dataset.

## Capacidades

- Tutoría socrática de programación: guía al usuario mediante preguntas en lugar de soluciones directas, siguiendo las guardas conductuales PACT.
- Depuración interactiva: dirige el razonamiento sobre errores lógicos, fallos off-by-one y condiciones de borde mediante preguntas específicas.
- Análisis de casos límite: sondea activamente situaciones como arrays vacíos, colecciones de un elemento, desbordamiento de enteros y nulidad de punteros.
- Descomposición de problemas: divide problemas complejos en hitos más pequeños y manejables.
- Exploración guiada de bases de código: ofrece pistas y desgloses arquitectónicos al explorar repositorios.
- Generación de texto conversacional en inglés, heredada del modelo base Phi-3.5-mini-instruct.
- No proporciona soluciones completas de código salvo petición explícita tras varios intentos fallidos del usuario (comportamiento intencional del fine-tuning).

No hay información disponible sobre soporte de tool calling, capacidades de visión o audio, ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Plataformas educativas de programación: integración como tutor conversacional en cursos de algoritmos y estructuras de datos, donde el modelo guía al estudiante mediante preguntas en lugar de resolver los ejercicios por él, favoreciendo el aprendizaje real.
- Depuración asistida en entornos de aprendizaje: un desarrollador junior puede describir un bug (por ejemplo, una búsqueda binaria en bucle infinito) y recibir preguntas dirigidas que le llevan a identificar el fallo en las condiciones del bucle por sí mismo.
- Preparación para entrevistas técnicas: práctica de problemas tipo LeetCode con un tutor que sondea el razonamiento, señala casos límite y valida el progreso parcial antes de corregir.
- Onboarding en equipos de desarrollo: acompañamiento de nuevos miembros al explorar bases de código existentes, con desgloses arquitectónicos guiados y pistas en lugar de explicaciones completas.
- Herramientas de autoaprendizaje offline: gracias a que funciona en GPUs de consumo con 8 GB de VRAM (y ~3,8 GB en cuantización de 8 bits), puede ejecutarse localmente en portátiles y estaciones de trabajo sin depender de APIs externas.
- Ejercicio de análisis de condiciones de borde: entrenamiento sistemático en la identificación de arrays vacíos, colecciones unitarias, desbordamientos y punteros nulos antes de dar por bueno un algoritmo.
- Asistente pedagógico en bootcamps: uso como apoyo escalable para mentores, permitiendo que cada estudiante disponga de un tutor interactivo disponible de forma continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara como métricas de entrenamiento `accuracy` y `loss`, pero no incluye valores numéricos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 3,8 GB con el modelo base cuantizado a 8 bits más el adaptador LoRA, según la model card. El hardware objetivo declarado son GPUs de consumo con 8 GB de VRAM.
- GPU recomendadas: RTX 5060 Ti o RTX 4060 (mencionadas explícitamente en la model card); cualquier GPU moderna con al menos 8 GB de VRAM debería ser suficiente en 8 bits. En FP16 sin cuantizar, el modelo base de 3,8B requeriría en torno a 8-10 GB de VRAM.
- Cabe en GPUs de consumo: sí, explícitamente diseñado para ello (RTX 4060, RTX 5060 Ti y similares).
- Opciones de despliegue: el código de ejemplo usa `transformers` con `peft` y `BitsAndBytesConfig` (bitsandbytes). No hay información sobre compatibilidad verificada con vLLM, llama.cpp, Ollama o TGI; al ser un adaptador PEFT, lo más directo es el stack de Hugging Face.
- Latencia y throughput: no disponible. El ejemplo de la model card usa `use_cache=False` en generación, lo que penaliza la velocidad de inferencia respecto a la configuración por defecto.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Licencia | Enfoque |
|---|---|---|---|---|
| Phi-3.5-mini-Socratic-Coding-Tutor | Adaptador LoRA (QLoRA 8-bit) sobre Phi-3.5-mini | 3,8B (base) | MIT | Tutoria socratica de codigo (PACT) |
| microsoft/Phi-3.5-mini-instruct | Modelo base instruct | 3,8B | MIT | Asistente general multilingue |
| Qwen2.5-Coder-3B-Instruct | Modelo instruct de codigo | 3B | Qwen Research (no comercial sin permiso en algunas variantes) | Generacion y comprension de codigo general |

Respecto al modelo base Phi-3.5-mini-instruct, esta ficha comparte arquitectura y licencia, pero su comportamiento está fuertemente condicionado hacia la pedagogía socrática, lo que lo hace inadecuado para generación directa de código. Frente a modelos de código de tamaño similar como Qwen2.5-Coder-3B, este modelo no está optimizado para autocompletado ni generación de scripts, sino para interacción educativa multi-turno. No hay datos de benchmarks que permitan comparar rendimiento numérico.

## Limitaciones y advertencias

- Uso fuera de ámbito declarado: el modelo no está pensado para generación zero-shot de scripts completos ni para "code dumps" sin guía; forzarlo en ese escenario degradará la experiencia.
- Idioma: entrenado y documentado solo en inglés; el rendimiento en castellano u otros idiomas no está verificado.
- Contexto de entrenamiento limitado: el fine-tuning se realizó con secuencias de 1024 tokens, por lo que el comportamiento socrático aprendido puede degradarse en conversaciones muy largas, aunque el modelo base admita 128K.
- Riesgo de alucinación: al ser un modelo de 3,8B parámetros afinado con SFT, puede generar explicaciones técnicas incorrectas con apariencia convincente; la verificación humana sigue siendo necesaria, especialmente en contexto educativo.
- Sesgos: hereda los sesgos del modelo base Phi-3.5-mini-instruct y del dataset de entrenamiento; no se han documentado evaluaciones de sesgo específicas.
- Restricciones de licencia: la licencia MIT es muy permisiva y permite uso comercial sin restricciones relevantes.
- Caveats técnicos: el ejemplo oficial usa `use_cache=False`, lo que ralentiza la generación; también requiere `trust_remote_code=True`. El modelo tiene muy poca adopción (21 descargas y 1 like en el momento de la ficha), por lo que no cuenta con validación comunitaria amplia.
- Seguridad: la model card excluye explícitamente la generación de payloads de explotación maliciosos y el despliegue de código safety-critical sin verificación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kami0867/Phi-3.5-mini-Socratic-Coding-Tutor
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/AndreiSobo/PACT-Socratic-Coding-Tutor
- Phi-3 Technical Report (arXiv): https://arxiv.org/abs/2404.14219
- Repositorio de GitHub asociado: https://github.com/ChiragPrasad2006/Assist-stu
