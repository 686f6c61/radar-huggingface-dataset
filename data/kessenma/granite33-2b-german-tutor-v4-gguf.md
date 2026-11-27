# kessenma/granite33-2b-german-tutor-v4-gguf

## Resumen

Granite 3.3 2B German Tutor v4 (GGUF) es una cuantización en formato GGUF del modelo afinado `kessenma/granite33-2b-german-tutor-v4-4bit`, desarrollado por el usuario kessenma como motor conversacional de la aplicación "Die Kartei", una herramienta de aprendizaje de alemán. El modelo parte de la familia IBM Granite 3.3 de 2B parámetros y ha sido especializado mediante ajuste fino para actuar como tutor de idioma alemán en conversaciones guiadas por la propia aplicación.

Con 2.533.539.840 parámetros (aproximadamente 2,53 mil millones), el modelo está pensado para ejecutarse localmente en `llama.cpp` y consumir pocos recursos: el archivo Q4_K_M ocupa 1,5 GB, lo que permite desplegarlo en hardware modesto. La licencia Apache 2.0 facilita su uso comercial y su integración en productos derivados.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a un caso de uso muy específico (tutoría de alemán dentro de una app). No obstante, ilustra bien el patrón de modelos pequeños cuantizados para aprendizaje de idiomas en local, y su evaluación interna (153 sobre 203 en el conjunto de pruebas de la app) ofrece una referencia cuantitativa poco habitual en modelos de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de IBM Granite 3.3, según el nombre del modelo; detalles de la arquitectura base no disponibles) |
| Parametros totales | 2.533.539.840 (≈2,53 B) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M y Q4_0 en GGUF; el modelo base intermedio es 4-bit MLX |
| Idiomas soportados | alemán (de), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp); el modelo base es 4-bit MLX |

## Arquitectura y entrenamiento

El modelo es una cuantización GGUF de un ajuste fino sobre la familia IBM Granite 3.3 de 2B parámetros. Según la model card, los archivos GGUF se generaron a partir de los pesos 4-bit MLX del modelo `granite33-2b-german-tutor-v4-4bit`: primero se de-cuantizaron a bf16 y después se cuantizaron a GGUF (Q4_K_M y Q4_0). No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; la model card remite a la ficha del modelo base para esos datos.

La innovación principal no está en la arquitectura, sino en el proceso de especialización: el modelo espera los system prompts propios de la aplicación "Die Kartei" y, sin ellos, se comporta como un modelo conversacional genérico. La app aplica además un filtro de salida sobre las respuestas. La evaluación se realizó con el conjunto de pruebas interno de la app (frases core, de extensión y held-out), con el filtro de salida activado.

## Capacidades

- Generación de texto conversacional en alemán e inglés, orientada a la tutoría de idioma.
- Conversación multi-turno dentro de la app "Die Kartei", con system prompts específicos.
- Respuesta como chat genérico cuando no se aplican los prompts de la app.
- Ejecución local mediante `llama.cpp` con plantilla de chat incluida en el archivo (`--jinja`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Tutor de alemán dentro de la app "Die Kartei": el modelo está entrenado específicamente para responder con los system prompts de la app y gestionar el flujo de aprendizaje de vocabulario y frases; es su caso de uso nativo y el único validado por el autor.
- Aprendizaje de idiomas en local sin conexión: al ocupar 1,5 GB en Q4_K_M y ejecutarse en `llama.cpp`, puede desplegarse en portátiles o dispositivos sin GPU dedicada para practicar alemán de forma privada.
- Prototipado de asistentes educativos: sirve como base para experimentar con tutores conversacionales de bajo coste, dado su tamaño reducido y licencia Apache 2.0.
- Evaluación de técnicas de cuantización: los dos archivos GGUF (Q4_K_M y Q4_0) permiten comparar el impacto de la cuantización en la calidad de las respuestas sobre un mismo conjunto de pruebas.
- Integración en pipelines de CI para apps de idiomas: el modelo puede automatizar pruebas de regresión conversacional usando el conjunto de evaluación interno del autor como referencia.
- Despliegue en entornos con recursos limitados: con 2,53 B parámetros y pesos de 1,5 GB, encaja en servidores pequeños o contenedores con poca memoria para tareas de generación de texto en alemán.

## Benchmarks y rendimiento

| Modelo / formato | Puntuación (sobre 203) | Notas |
|---|---|---|
| `granite33-2b-german-tutor-v4-Q4_K_M.gguf` | 153 | Usado por la app |
| `granite33-2b-german-tutor-v4-Q4_0.gguf` | 148 | |
| MLX 4-bit (referencia) | 153 | Para comparación |

Las puntuaciones corresponden al conjunto de evaluación propio de la app (frases core, de extensión y held-out), con el filtro de salida de la app activado. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5-2 GB para los archivos Q4_K_M y Q4_0, más el overhead del contexto y de `llama.cpp`.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer con 4 GB o más de VRAM es suficiente. También puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, en modelos como GTX 1650, RTX 3050, RTX 4060 o superiores; también en Apple Silicon vía MLX (el modelo base).
- Opciones de despliegue: `llama.cpp` (`llama-server` con `--jinja`), y por extensión cualquier runner compatible con GGUF (Ollama, LM Studio, etc., aunque no se mencionan explícitamente en la información disponible). El modelo base 4-bit MLX requiere el stack de MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Granite 3.3 2B German Tutor v4 (GGUF) | 2,53 B | no disponible | Apache 2.0 | GGUF en HF | Especializado en tutoría de alemán; 153/203 en eval propia |
| IBM Granite 3.3 2B (base) | ≈2 B | no disponible en esta ficha | Apache 2.0 | HF | Modelo generalista del que deriva; no especializado en alemán |
| Modelos de tutoría de idiomas de 2-3 B | no disponible | no disponible | variable | variable | No se dispone de comparativas publicadas en la información proporcionada |

No se dispone de datos de benchmarks comparables con alternativas de la misma categoría en la información disponible.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes: no hay validación externa ni comunidad que reporte comportamiento en producción.
- El modelo espera los system prompts de la app "Die Kartei"; sin ellos responde como un chat genérico y pierde su especialización.
- La evaluación (153/203) es interna de la app y no equivale a benchmarks estándar; no es comparable con puntuaciones de MMLU, HumanEval u otros.
- Idiomas limitados a alemán e inglés; no se documenta soporte de otros idiomas.
- Longitud de contexto no disponible: no se puede planificar su uso en conversaciones largas sin verificación empírica.
- Riesgo de alucinación inherente a modelos de 2,5 B parámetros; la app mitiga parcialmente con un filtro de salida, pero ese filtro no forma parte del modelo.
- Licencia Apache 2.0 permite uso comercial, pero la calidad y adecuación para producción no están avaladas por evaluaciones independientes.
- No se documentan sesgos conocidos ni datos de entrenamiento, lo que dificulta evaluar riesgos de contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kessenma/granite33-2b-german-tutor-v4-gguf
- Modelo base (4-bit MLX): https://huggingface.co/kessenma/granite33-2b-german-tutor-v4-4bit
- Repositorio de llama.cpp (referenciado por la librería): no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
