# PRB1/Qwen2.5-Coder-7B-ManimCE-V5-DPO-16bit

## Resumen

PRB1/Qwen2.5-Coder-7B-ManimCE-V5-DPO-16bit es un adaptador LoRA de tipo PEFT publicado por el usuario PRB1 sobre el modelo base Qwen/Qwen2.5-Coder-7B-Instruct. Se trata, por tanto, de un ajuste fino derivado del modelo de código de 7.000 millones de parámetros de Qwen, orientado a generación de texto conversacional. El nombre del repositorio sugiere un entrenamiento con DPO (Direct Preference Optimization) sobre un conjunto o configuración denominada "ManimCE-V5", presumiblemente relacionada con la generación de animaciones con Manim Community Edition, aunque la model card no lo confirma explícitamente.

El modelo se distribuye en formato safetensors con pesos de 16 bits y ocupa 0,3 GB en el repositorio, lo que es coherente con un adaptador LoRA y no con un modelo completo. La librería declarada es peft y el pipeline es text-generation. No se han publicado descargas ni interacciones en el momento de la consulta, y la model card es la plantilla por defecto de Hugging Face sin cumplimentar, por lo que la mayor parte de la información técnica, de entrenamiento y de evaluación no está disponible.

Su relevancia es limitada y de nicho: resulta de interés para quienes quieran reproducir o evaluar un ajuste DPO sobre Qwen2.5-Coder-7B-Instruct para tareas de generación de código de animación con Manim, pero carece de documentación, benchmarks y licencia declarada, lo que desaconseja su uso en producción sin una evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-7B-Instruct); adaptador LoRA sobre el modelo base |
| Parámetros totales | 7B en el modelo base; el adaptador LoRA no declara su número de parámetros (repo de 0,3 GB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen2.5-Coder-7B-Instruct soporta hasta 128K tokens, según la documentación oficial de Qwen) |
| Tipos de cuantización | No disponible; los pesos del adaptador se publican en 16 bits |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 7.000 millones de parámetros desarrollado por el equipo Qwen de Alibaba. La información proporcionada no detalla la arquitectura interna del adaptador más allá de su naturaleza LoRA (low-rank adaptation) gestionada con PEFT 0.21.2. El sufijo "DPO" del nombre indica que el ajuste se realizó mediante Direct Preference Optimization, una técnica de alineación por preferencias que optimiza directamente el modelo con pares de respuestas preferidas y rechazadas, en lugar de usar RLHF con un reward model separado.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, los hiperparámetros del LoRA (rango, alpha, capas objetivo), la configuración del DPO (beta, número de épocas) ni el procedimiento exacto. El identificador "ManimCE-V5" sugiere un quinto ciclo de entrenamiento orientado a Manim Community Edition, una biblioteca de Python para generar animaciones matemáticas programáticas, pero se trata de una inferencia a partir del nombre y no de un dato confirmado en la model card.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del modelo base Instruct.
- Generación de código, con especialización presumible (no confirmada) en scripts de animación con Manim Community Edition.
- Razonamiento y matemáticas, capacidades propias de Qwen2.5-Coder-7B-Instruct.
- Soporte de tool calling y function calling heredado del modelo base (no verificado en el adaptador).
- Capacidades multilingües del modelo base (no documentadas para el adaptador).
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido específicas del adaptador.

## Casos de uso

- Generación de animaciones matemáticas con Manim: el adaptador parece orientado a producir scripts de Manim Community Edition a partir de descripciones en lenguaje natural; adecuado para prototipar visualizaciones educativas de conceptos matemáticos.
- Asistente de código para Python científico: al partir de Qwen2.5-Coder-7B-Instruct, puede emplearse para autocompletar y explicar código de NumPy, SymPy o Matplotlib en entornos de cuaderno.
- Experimentación con DPO: útil como caso de estudio para investigadores que quieran comparar el efecto de un ajuste por preferencias sobre un modelo de código de 7B.
- Generación de material docente: creación de animaciones explicativas para clases de cálculo, álgebra lineal o física, revisando manualmente la salida antes de su uso.
- Integración en pipelines de generación de vídeo educativo: el adaptador podría encadenarse con un renderizador de Manim para producir clips automáticamente, con supervisión humana.
- Evaluación comparativa de adaptadores LoRA: sirve como referencia para medir la degradación o mejora respecto al modelo base en tareas de código general.
- Prototipado rápido en local: al ser un adaptador de 0,3 GB, se puede cargar junto al modelo base en una GPU de consumo para pruebas puntuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,3 GB, pero requiere cargar el modelo base Qwen2.5-Coder-7B-Instruct para inferencia.
- VRAM estimada para el modelo base en FP16: en torno a 15-16 GB, incluyendo pesos y overhead de activaciones para contextos moderados.
- VRAM estimada con cuantización de 8 bits: aproximadamente 8-9 GB; con 4 bits (GGUF o bitsandbytes): en torno a 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servicio de alta concurrencia; RTX 4090 (24 GB) para FP16 en una sola tarjeta; RTX 3090/4080 (16-24 GB) para FP16 ajustado o 8 bits; RTX 3060 12 GB o similar para cuantización de 4 bits.
- Cabe en GPU de consumo con cuantización de 4 u 8 bits; en FP16 requiere al menos 16 GB de VRAM.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA en algunos casos, aunque la compatibilidad con este adaptador concreto no está verificada; llama.cpp y Ollama requerirían fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PRB1/Qwen2.5-Coder-7B-ManimCE-V5-DPO-16bit | 7B (base) + LoRA | No disponible (base: hasta 128K) | No disponible | safetensors (PEFT) | Adaptador DPO sin documentar ni evaluar |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7B | Hasta 128K | Apache 2.0 (según Qwen) | safetensors, GGUF | Modelo base oficial, documentado y evaluado |
| Qwen/Qwen2.5-Coder-7B | 7B | Hasta 128K | Apache 2.0 (según Qwen) | safetensors, GGUF | Variante base sin instrucciones |
| Codestral-22B (Mistral AI) | 22B | 32K | Licencia no comercial (MNPL) | safetensors | Mayor tamaño y contexto menor; alternativa de código |

La comparación directa con el modelo base es la más relevante: el adaptador no aporta información pública sobre mejoras medibles, por lo que el modelo oficial Qwen2.5-Coder-7B-Instruct sigue siendo la opción recomendada para uso general.

## Limitaciones y advertencias

- Model card sin cumplimentar: no hay información sobre datos de entrenamiento, hiperparámetros ni evaluación, lo que impide auditar el ajuste.
- Licencia no declarada: no se puede confirmar el uso comercial; además, la licencia del adaptador debe ser compatible con la del modelo base Qwen2.5-Coder-7B-Instruct.
- Riesgo de alucinación y de degradación respecto al modelo base: el ajuste DPO puede haber estrechado la distribución de salidas y reducir la diversidad o el rendimiento en tareas generales de código.
- Especialización presumible en Manim: fuera de ese dominio, el adaptador podría comportarse peor que el modelo base.
- Idiomas no documentados: no se garantiza un rendimiento multilingüe adecuado más allá de lo que herede del modelo base.
- Sin descargas ni validación comunitaria: no hay evidencia de uso real ni informes de terceros.
- Para producción se recomienda fusionar el adaptador, evaluar en el dominio objetivo y comparar contra el modelo base antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PRB1/Qwen2.5-Coder-7B-ManimCE-V5-DPO-16bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Paper de PEFT/LoRA citado en los tags: https://arxiv.org/abs/1910.09700
- Documentación de PEFT: https://huggingface.co/docs/peft
- Manim Community Edition: https://www.manim.community/
