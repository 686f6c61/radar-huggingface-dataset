# Bsod-coder/TelAvivGPT

## Resumen

TelAvivGPT es un modelo de lenguaje de propósito satírico, desarrollado por el usuario Bsod-coder como un *fine-tune* del modelo base Qwen/Qwen2.5-3B-Instruct. El autor lo presenta explícitamente como un experimento humorístico: un modelo entrenado sobre chistes ofensivos y estereotipos, con la advertencia de que no debe utilizarse para ningún fin serio. Aunque la ficha técnica hereda las capacidades del modelo base, la adaptación degrada el comportamiento y genera respuestas intencionalmente absurdas, estereotipadas o con alucinaciones.

El modelo tiene 3 mil millones de parámetros, una longitud de contexto de 32 768 tokens y está licenciado bajo una licencia no estándar denominada `slop-license`, que restringe el uso comercial. Su interés es meramente anecdótico o educativo, como ejemplo de *fine-tuning* de bajo esfuerzo y de los riesgos de publicar modelos sin control de calidad. No se recomienda su despliegue en ningún entorno de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3 000 millones |
| Parametros activos | no disponible |
| Longitud de contexto | 32 768 tokens |
| Tipos de cuantizacion | no disponible (compatible con las cuantizaciones del modelo base) |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | `slop-license` (no estándar, sin permisos de uso comercial) |
| Formato de pesos | no disponible (presumiblemente safetensors) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura *transformer* densa de Qwen2.5-3B-Instruct, con 3 mil millones de parámetros y una ventana de contexto de 32 768 tokens. No se han publicado detalles sobre el proceso de entrenamiento: el autor solo menciona que se realizó un *fine-tuning* sobre un conjunto de chistes ofensivos y estereotipados, sin indicar el número de tokens, el método de optimización ni si se emplearon técnicas de alineación (RLHF, DPO, etc.). La ausencia de estos datos impide evaluar la calidad o reproducibilidad del entrenamiento.

El autor tampoco reporta ninguna innovación técnica propia; el modelo se limita a ajustar los pesos del base sobre un corpus de humor de mal gusto. La única particularidad declarada es la incorporación de un «acento judío estereotípico» en las respuestas, lo que refuerza el carácter de sátira y deja claro que no se trata de un modelo serio.

## Capacidades

- Generación de texto en inglés, con respuestas que siguen el estilo del corpus de chistes utilizado.
- Capacidades del modelo base (razonamiento, código, matemáticas) degradadas por el *fine-tuning*; el autor advierte que produce «consejos ininteligibles» y alucinaciones.
- No se garantiza soporte de *tool calling* ni de *function calling*; aunque Qwen2.5-Instruct los soporta, el *fine-tuning* puede haberlos interferido.
- Sin capacidades multilingües (solo inglés).
- Sin soporte de visión, audio o modo de razonamiento extendido.

## Casos de uso

No existen casos de uso prácticos y realistas para este modelo en entornos de producción. Cualquier aplicación que lo utilice con fines serios sería inapropiada y arriesgada. A continuación se enumeran posibles usos de carácter educativo o de entretenimiento, siempre con la advertencia de no emplearlo en sistemas reales:

- Demostración de los peligros de *fine-tuning* sin control de calidad: sirve como ejemplo de cómo un modelo base competente puede degradarse con datos de baja calidad.
- Pruebas de *jailbreak* y de límites de seguridad: al ser un modelo sin alineación, se puede usar en entornos de laboratorio para estudiar sesgos y estereotipos.
- Generación de humor absurdo en entornos de pruebas (no comerciales), siempre que el contenido no sea ofensivo para el público.
- Evaluación de la robustez de los sistemas de moderación de contenido: las respuestas del modelo pueden servir para probar filtros de texto ofensivo.
- Investigación académica sobre los efectos de *fine-tuning* en modelos de lenguaje de pequeño tamaño.
- Ejemplo de licencia no estándar (`slop-license`) para el estudio de implicaciones legales en el ecosistema de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor sugiere, de forma jocosa, que el rendimiento se puede aproximar multiplicando los resultados del modelo base Qwen2.5-3B-Instruct por un factor de 0.98971238, pero esto no constituye un dato oficial ni verificable. Por lo tanto, no se presentan métricas concretas.

## Requisitos de hardware

- VRAM estimada: para inferencia en FP16, el modelo necesita unos 6-8 GB de VRAM; con cuantización INT4 (GGUF) puede reducirse a unos 2-3 GB.
- GPU recomendadas: RTX 3060 (12 GB) o superior para FP16; cualquier GPU con 4 GB o más puede ejecutar una versión cuantizada.
- Es compatible con GPUs de consumo (RTX 4090, RTX 3090, etc.) y con hardware de gama media.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, y cualquier framework que soporte modelos de 3B.
- Latencia y *throughput*: no se han medido específicamente; en una RTX 4090, un modelo de 3B suele generar 50-100 tokens/s con cuantización INT4.

## Comparativa con modelos similares

La comparación se realiza con modelos de tamaño similar (3B) y con el modelo base del que deriva. No se incluyen benchmarks porque no están disponibles para TelAvivGPT.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TelAvivGPT | 3B | 32 768 | slop-license (no comercial) | Hugging Face (sin descargas) |
| Qwen2.5-3B-Instruct | 3B | 32 768 | Apache 2.0 | Hugging Face |
| Llama-3.2-3B-Instruct | 3B | 32 768 | Llama 3.2 Community | Hugging Face |
| Gemma-2-3B | 3B | 8 192 | Gemma License | Hugging Face |

## Limitaciones y advertencias

- El autor advierte explícitamente que el modelo es de carácter de broma y no debe usarse para fines serios.
- Genera contenido ofensivo, estereotipos y «chistes» de mal gusto, lo que puede causar daño a los usuarios.
- Alucinaciones frecuentes y consejos inintensibles, especialmente en tareas de razonamiento o factualidad.
- Licencia `slop-license` no es una licencia de código abierto reconocida; restringe el uso comercial y no ofrece garantías legales claras.
- No se ha evaluado su seguridad ni su comportamiento en contextos de producción.
- El modelo está entrenado solo en inglés; no se recomienda su uso en otros idiomas.
- Sin soporte técnico ni mantenimiento; el autor lo publica como un experimento sin compromiso.

## Enlaces

- Hugging Face: [Bsod-coder/TelAvivGPT](https://huggingface.co/Bsod-coder/TelAvivGPT)
- Modelo base: [Qwen/Qwen2.5-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct)
