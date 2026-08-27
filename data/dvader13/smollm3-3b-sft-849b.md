# dvader13/smollm3-3b-sft-849b

## Resumen

El repositorio `dvader13/smollm3-3b-sft-849b` contiene un conjunto de diez checkpoints de *supervised fine-tuning* (SFT) del modelo base SmolLM3-3B, entrenado con un *rung* de preentrenamiento de 849 000 millones de tokens. Cada checkpoint corresponde a una fracción distinta de los datos de SFT (del 10 % al 100 %), lo que permite estudiar el efecto de la cantidad de datos de ajuste fino en el rendimiento final. El autor, `dvader13`, ha publicado estos pesos en formato `bf16` y con licencia Apache-2.0, orientados a la investigación experimental sobre el escalado de datos de SFT.

La relevancia de este repositorio radica en que permite a la comunidad analizar cómo varía la calidad de un modelo de 3 mil millones de parámetros al aplicar diferentes cantidades de datos de ajuste supervisado, algo clave para optimizar los presupuestos de entrenamiento. Aunque los checkpoints son experimentales y no están pensados para uso directo en producción, son útiles para reproducir estudios de *dose-response* en SFT y para seleccionar el punto óptimo de datos de ajuste. La información disponible en la model card es muy limitada; no se especifican detalles de arquitectura, contexto ni datos de entrenamiento más allá del rung base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped Query Attention (GQA) y NoPE (sin embeddings posicionales) (según el modelo base SmolLM3-3B) |
| Parámetros totales | 3 000 000 000 (aprox., basado en SmolLM3-3B) |
| Parámetros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (el modelo base soporta hasta 2048 tokens, pero no se especifica para este checkpoint) |
| Tipos de cuantización | Solo `bf16` (los pesos están en precisión de 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (según las etiquetas del repositorio) |

## Arquitectura y entrenamiento

El modelo base es SmolLM3-3B, un transformer decoder-only que combina atención por grupos (GQA) con una variante de posiciones sin embeddings (NoPE) en una proporción 3:1. El entrenamiento del base se realizó con un currículum escalonado que incluye datos de web, código, matemáticas y razonamiento. En este repositorio, el pretraining se limitó a un *rung* de 849 mil millones de tokens (una fracción de los 11 billones usados en la versión final de SmolLM3-3B). Sobre este base, se aplicó SFT con diferentes fracciones de un conjunto de datos supervisado (del 10 % al 100 %), generando diez checkpoints. No se especifica si se usaron técnicas como RLHF o DPO; la model card solo menciona SFT.

## Capacidades

- Generación de texto y seguimiento de instrucciones: el modelo base está entrenado para responder a comandos y completar tareas de lenguaje natural.
- Razonamiento y matemáticas: incluido en el currículum de entrenamiento del base.
- Generación de código: el base se entrenó con datos de código, por lo que el modelo puede generar y completar código.
- Capacidades multilingües: no se especifican, pero el base de SmolLM3 se entrenó con datos multilingües.
- No se menciona soporte explícito de *tool calling* o *function calling* en la model card; es probable que no esté habilitado, ya que es un checkpoint experimental de SFT.
- No hay evidencia de *thinking mode* o capacidades de visión o audio.

## Casos de uso

- Investigación sobre el escalado de datos de SFT: este repositorio permite comparar el rendimiento de un mismo modelo ajustado con diferentes cantidades de datos supervisados, para determinar la dosis óptima.
- Reproducción de experimentos de *dosing* en fine-tuning: los checkpoints son útiles para validar teorías sobre la relación entre volumen de datos de SFT y rendimiento final.
- Estudio de la degradación por sobreajuste: al comparar los checkpoints de 10 % a 100 % se puede observar cómo el modelo se sobreajusta o mejora según la fracción.
- Pruebas de transferencia de conocimiento: se puede evaluar cómo el ajuste fino con distintas cantidades de datos afecta a tareas específicas (por ejemplo, matemáticas o razonamiento).
- Validación de técnicas de *data pruning*: el conjunto de checkpoints puede usarse para comparar estrategias de selección de datos de SFT.
- Desarrollo de modelos de referencia para comparaciones: aunque no está optimizado para producción, sirve como punto de referencia para evaluar la eficiencia de otros métodos de ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para estos checkpoints en la información disponible. El modelo base SmolLM3-3B (con los 11 billones de tokens completos) supera a Llama 3.2 3B y Qwen2.5 3B, y es competitivo con modelos de 4B como Qwen3 y Gemma3, según el repositorio oficial de SmolLM. Sin embargo, estos resultados corresponden a la versión final del base, no a este checkpoint con 849B tokens y SFT parcial, por lo que no se pueden extrapolar.

## Requisitos de hardware

- Cada checkpoint en `bf16` ocupa aproximadamente 6 GB (3B parámetros × 2 bytes). El repositorio completo, con 10 checkpoints, ocupa 61,5 GB.
- Para inferencia de un solo checkpoint, se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070, RTX 4060, A10) para cargar el modelo en `bf16` sin cuantización.
- Con cuantización a 8 bits (int8) se podría reducir a ~3 GB, pero no se proporcionan versiones cuantizadas.
- Para usar varios checkpoints de forma eficiente, se puede cargar cada uno por separado y descartarlo después, o usar un servidor de inferencia que permita cambiar pesos dinámicamente.
- Opciones de despliegue: se puede usar vLLM, llama.cpp (convirtiendo a GGUF) u Ollama, aunque al ser un modelo experimental, no se recomienda para producción.
- Latencia y throughput: no se han medido, pero un modelo de 3B en una GPU moderna (RTX 3090 o superior) puede generar decenas de tokens por segundo en `bf16`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM3-3B (base, 11T tokens) | 3B | 2048 | SoTA en 3B, supera a Llama 3.2 3B y Qwen2.5 3B | Apache 2.0 | HuggingFace |
| Llama 3.2 3B | 3B | 128k | Menor rendimiento que SmolLM3-3B en tareas generales | Llama 3.2 License | HuggingFace |
| Qwen2.5 3B | 3B | 32k | Rendimiento competitivo, pero inferior a SmolLM3-3B | Apache 2.0 | HuggingFace |
| **Este checkpoint** | 3B | no disponible | Sin benchmarks, basado en un pretraining de 849B tokens (menos que el base final) | Apache 2.0 | HuggingFace |

La comparación directa no es justa porque este checkpoint usa un pretraining intermedio y SFT parcial. No se dispone de datos de rendimiento propios.

## Limitaciones y advertencias

- Es un modelo de investigación, no preparado para uso en producción; no se ha probado exhaustivamente en tareas reales.
- El rendimiento puede ser inferior al modelo base completo (SmolLM3-3B con 11T tokens) debido a que el pretraining se limitó a 849B tokens y el SFT es parcial.
- No se especifican los datos de SFT utilizados ni su composición; puede haber sesgos heredados del dataset base.
- Riesgo de alucinaciones y errores de razonamiento, típico en modelos de este tamaño.
- No hay garantía de que el modelo siga instrucciones complejas de forma robusta, ya que el SFT no se ha evaluado formalmente.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece soporte ni garantías.
- El repositorio no incluye el tokenizador ni los archivos de configuración del modelo; para usarlo es necesario descargar el modelo base SmolLM3-3B y cargar los pesos del checkpoint.

## Enlaces

- Repositorio del checkpoint: [dvader13/smollm3-3b-sft-849b](https://huggingface.co/dvader13/smollm3-3b-sft-849b)
- Modelo base oficial: [HuggingFaceTB/SmolLM3-3B](https://huggingface.co/HuggingFaceTB/SmolLM3-3B)
- Curso de SFT con SmolLM: [Supervised Fine-Tuning with SmolLM](https://huggingface.co/learn/smol-course/unit1/3)
- Repositorio GitHub de SmolLM: [huggingface/smollm](https://github.com/huggingface/smollm)
