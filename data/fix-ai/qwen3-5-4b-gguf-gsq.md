# Fix-AI/Qwen3.5-4B-GGUF-GSQ

## Resumen

Qwen3.5-4B-GGUF-GSQ es una cuantización en formato GGUF `Q2_K_XL` del modelo Qwen3.5-4B de Qwen, refinada con GSQ (Gumbel-Softmax Quantization), una técnica de cuantización post-entrenamiento (PTQ) desarrollada por ISTA-DASLab. El repositorio de Fix-AI es un duplicado del original publicado en [ISTA-DASLab/Qwen3.5-4B-GGUF-GSQ](https://huggingface.co/ISTA-DASLab/Qwen3.5-4B-GGUF-GSQ).

El problema que resuelve es claro: las cuantizaciones agresivas a 2 bits suelen degradar severamente la calidad de los modelos pequeños. GSQ reajusta las asignaciones discretas de la rejilla de cuantización dentro de cada bloque K-Quant mediante muestreo Gumbel-Softmax, partiendo de la inicialización `UD-Q2_K_XL` de Unsloth y proyectando el resultado de vuelta al mismo formato. El resultado es un fichero GGUF estándar bit a bit que funciona sin cambios en `llama.cpp`, Ollama o LM Studio, pero con mejoras de precisión muy notables: de 26,67 a 60,00 en AIME 25, o de 79,61 a 88,48 en GSM8K.

Es relevante porque permite ejecutar un modelo de 4B con calidad cercana al original en hardware muy modesto: el fichero ocupa unos 1,9 GB, lo que lo hace viable incluso en portátiles sin GPU dedicada o en dispositivos de borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B); detalles específicos no disponibles |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K_XL (K-Quant GGUF, refinado con GSQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (K-Quant, compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-4B, un transformer de 4,2 mil millones de parametros. Los detalles de la arquitectura (número de capas, dimensiones, soporte de attention variants) no están disponibles en la ficha. El modelo base incluye un modo de pensamiento (thinking mode), ya que las evaluaciones se realizaron con este activado o desactivado según la tarea.

Lo distintivo de este repositorio no es el modelo, sino el proceso de cuantización: se parte de la inicialización GGUF `UD-Q2_K_XL` de Unsloth y se aplica GSQ (descrito en el paper arXiv:2604.18556), que reajusta mediante Gumbel-Softmax las asignaciones discretas de pesos dentro de cada bloque K-Quant. El resultado se reempaqueta en el mismo formato Q2_K_XL, de modo que el fichero final es un GGUF estándar bit a bit: solo cambian los valores de los pesos cuantizados, no el formato. Esto garantiza compatibilidad total con cualquier runtime que consuma GGUF. El modelo base fue entrenado por Qwen con datos y detalles no disponibles en esta ficha.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational)
- Razonamiento matematico: 88,48 en GSM8K y 60,00 en AIME 25 (con thinking activado)
- Razonamiento cientifico a nivel de doctorado: 67,17 en GPQA Diamond
- Seguimiento de instrucciones: 82,97 en IFEval
- Conocimiento general: 70,87 en MMLU-Pro
- Modo thinking (pensamiento extendido) heredado del modelo base Qwen3.5-4B, operativo tras el refinado GSQ
- Capacidades de tool calling, agentes y vision: no disponibles en la informacion proporcionada
- Capacidades multilingues: no disponibles en la informacion proporcionada

## Casos de uso

- Chatbots locales en hardware modesto: con 1,9 GB de fichero y cuantización a 2 bits, puede ejecutarse en portátiles sin GPU dedicada o en mini-PCs, manteniendo puntuaciones altas en IFEval (82,97), lo que indica buen seguimiento de instrucciones conversacionales.
- Resolucion de problemas de matematicas en local: con 88,48 en GSM8K y 60,00 en AIME 25, es adecuado para asistentes de matematicas de nivel bachillerato y universitario que necesiten funcionar sin conexión.
- Asistentes de conocimiento general en dispositivos de borde: el 70,87 en MMLU-Pro lo hace útil para sistemas de preguntas y respuestas embebidos donde no cabe un modelo mayor.
- Experimentacion con cuantizacion avanzada: al ser un GGUF estándar bit a bit, sirve como sustituto directo (drop-in) de la cuantización Q2_K_XL convencional para comparar degradación de calidad en pipelines existentes de llama.cpp.
- Prototipado rapido con Ollama o LM Studio: cualquier desarrollador puede probar el modelo sin configuración adicional, ya que el formato es idéntico al de un GGUF Q2_K_XL estándar.
- Despliegues con presupuesto de tokens ajustado: en MMLU-Pro con presupuesto de 32K tokens de salida, el modelo refinado consumió 41,82M de tokens frente a 55,32M del punto de partida, es decir, aproximadamente un 24% menos de tokens para igual o mejor calidad, lo que reduce coste y latencia en generación.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando el checkpoint refinado con GSQ frente al punto de partida de Unsloth. Todas las evaluaciones son zeroshot.

| Modelo | AIME 25 | GPQA Diamond | IFEval | GSM8K | MMLU-Pro |
|---|---:|---:|---:|---:|---:|
| Unsloth `UD-Q2_K_XL` (thinking desactivado) | 26,67 | 56,06 | 76,14 | 79,61 | 66,78 |
| GSQ-refined `Q2_K_XL` | **60,00** | **67,17** | **82,97** | **88,48** | **70,87** |

Notas de evaluacion: AIME 25 y GPQA Diamond se evaluaron con thinking activado; IFEval, GSM8K y MMLU-Pro con thinking desactivado. El modelo Unsloth se evaluó siempre sin thinking porque su modo de pensamiento estaba roto y producía peores resultados. En eficiencia de tokens (MMLU-Pro, presupuesto máximo de 32K tokens de salida), el modelo GSQ consumió 41,82M de tokens frente a 55,32M del modelo Unsloth.

## Requisitos de hardware

- VRAM / memoria estimada: el fichero pesa 1,9 GB; en inferencia conviene contar con unos 2,5-3 GB de RAM o VRAM incluyendo el contexto. Al ser GGUF, puede ejecutarse parcial o totalmente en CPU.
- GPUs recomendadas: no requiere GPU; cualquier GPU con 4 GB o más de VRAM (por ejemplo, RTX 3050, RTX 3060 o superiores) lo ejecutará íntegramente con margen para el contexto.
- Consumer GPUs: cabe con holgura en GPUs modernas de gama baja y media; también es viable en Apple Silicon con 8 GB de memoria unificada o más.
- Opciones de despliegue: `llama.cpp` (llama-cli), Ollama, LM Studio y cualquier runtime compatible con GGUF. No requiere cambios de configuración respecto a un GGUF Q2_K_XL estándar.
- Latencia y throughput: no disponibles; al ser un modelo de 4B a 2 bits, se espera buena velocidad en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamaño aprox. | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-GGUF-GSQ (este) | ~4,2B | Q2_K_XL (GSQ) | 1,9 GB | Apache 2.0 | GGUF publico en Hugging Face |
| Unsloth UD-Q2_K_XL de Qwen3.5-4B | ~4,2B | Q2_K_XL (estandar) | ~1,9 GB | Apache 2.0 | GGUF publico en Hugging Face |
| Qwen/Qwen3.5-4B (original) | ~4,2B | sin cuantizar | ~8 GB aprox. | Apache 2.0 | Safetensors publicos en Hugging Face |

Frente al punto de partida de Unsloth, la version GSQ ofrece mejoras sustanciales en todos los benchmarks evaluados (por ejemplo, +33,33 puntos en AIME 25 y +8,87 en GSM8K) con el mismo tamaño de fichero y compatibilidad de runtime identica. No se dispone de datos comparativos con otros modelos de la misma clase de tamano (Llama, Gemma, Phi) en esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; hereda los sesgos del modelo base Qwen3.5-4B, no documentados en esta ficha.
- Alucinacion: como todo modelo de lenguaje, puede generar contenido incorrecto; el refinado GSQ mejora benchmarks pero no elimina el riesgo de alucinacion.
- Idiomas: no se especifican los idiomas soportados; el modelo base es de Qwen, que tradicionalmente soporta chino e ingles, pero no hay confirmacion en esta ficha.
- Contexto: la longitud de contexto no esta documentada aqui; debe consultarse la ficha del modelo base Qwen/Qwen3.5-4B.
- La evaluacion del punto de partida de Unsloth se hizo con thinking desactivado porque su modo de pensamiento estaba roto; esto significa que en otros checkpoints cuantizados de este modelo el thinking puede no funcionar correctamente.
- Licencia Apache 2.0: permite uso comercial sin restricciones significativas, con atribucion y aviso de licencia.
- Este repositorio es un duplicado de ISTA-DASLab/Qwen3.5-4B-GGUF-GSQ; para soporte, issues o actualizaciones, dirigirse al repositorio original.
- Los resultados de AIME 25 y GPQA Diamond se obtuvieron con thinking activado, lo que implica un consumo de tokens de salida considerablemente mayor en esas tareas.

## Enlaces

- Repositorio (duplicado): https://huggingface.co/Fix-AI/Qwen3.5-4B-GGUF-GSQ
- Repositorio original: https://huggingface.co/ISTA-DASLab/Qwen3.5-4B-GGUF-GSQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper GSQ (arXiv:2604.18556): https://arxiv.org/abs/2604.18556
- Paper page en Hugging Face: https://huggingface.co/papers/2604.18556
- Codigo GSQ: https://github.com/IST-DASLab/GSQ
- Coleccion GSQ en Hugging Face: https://huggingface.co/collections/ISTA-DASLab/gsq
