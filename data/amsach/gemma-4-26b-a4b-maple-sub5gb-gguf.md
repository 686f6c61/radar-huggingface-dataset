# AmSach/Gemma-4-26B-A4B-MAPLE-Sub5GB-GGUF

## Resumen

MAPLE es una compresión estructural del modelo Gemma 4 26B-A4B-it de Google, publicada por Aman Sachan (AmSach) bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de una poda selectiva de expertos sobre la arquitectura MoE original: de los 128 expertos del modelo base se conservan 48, elegidos por su masa de probabilidad acumulada en el router para dominios técnicos (código, matemáticas, STEM). El resultado se distribuye en formato GGUF con cuantización IQ2_XXS y un tamaño de 4,75 GB.

El objetivo declarado es permitir la ejecución íntegra en VRAM de GPUs de consumo con 6 GB, como una RTX 4050 Laptop, evitando el paginado por PCIe que lastra las cuantizaciones de 2 bits del modelo completo. Según la model card, el contenedor físico alberga 10.952.640.446 parámetros a 3,47 bits por peso, lo que equivale a 1,48 bits efectivos por parámetro si se mide contra los 25,6B del modelo sin podar.

La propuesta es relevante para el despliegue en el borde (edge AI) y para entornos con hardware muy limitado, pero introduce un compromiso explícito y severo: el modelo pierde capacidad multilingüe casi por completo, ya que la poda elimina los expertos inactivos en inglés. La model card reporta una perplejidad multilingüe de 572,4 frente a 98,9 del contenedor IQ2_XXS sin podar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), poda selectiva de expertos sobre Gemma 4 26B-A4B-it |
| Parámetros totales | 10.952.640.446 (contenedor físico tras poda); base sin podar: 25,6B |
| Parámetros activos | no disponible (el modelo base es A4B, pero la card no detalla los activos tras la poda) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ2_XXS (3,47 BPW); calibración con imatrix |
| Idiomas soportados | inglés (los expertos multilingües fueron eliminados en la poda) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base, Gemma 4 26B-A4B-it, es un transformer de mezcla de expertos de grano fino con 128 expertos y enrutamiento disperso. MAPLE no reentrena ni destila pesos en el sentido clásico: aplica una poda estructural de expertos guiada por el análisis de la distribución de enrutamiento. El autor argumenta que en modelos MoE entrenados con más de 100 idiomas el router sigue una distribución de ley de potencias (tipo Zipf): para tokens técnicos, de programación y matemáticos, los 48 expertos principales concentran el 94,7% de la masa de probabilidad softmax acumulada, mientras que los 80 restantes se invocan menos del 0,02% de las veces.

La innovación técnica declarada es el teorema de invariancia del softmax bajo enmascaramiento de logits: al eliminar expertos no se reindexan los pesos del router ni se alteran las probabilidades relativas de los expertos supervivientes, de modo que la distribución de enrutamiento se preserva. La cuantización se realiza con calibración imatrix y se empaqueta en un único GGUF IQ2_XXS. La card menciona "destilación en variedad de 48 expertos", aunque no se detalla el procedimiento de ajuste posterior a la poda ni el volumen de datos empleado.

## Capacidades

- Generación de texto conversacional en inglés, con etiqueta `conversational` en el repositorio.
- Razonamiento técnico y general: la card reporta resultados en MMLU, ARC-Challenge y HellaSwag.
- Generación de código: evaluado en HumanEval y MBPP.
- Razonamiento matemático: evaluado en GSM8K y MATH con cadena de pensamiento.
- Ejecución íntegra en VRAM en GPUs de 6 GB, sin paginado por PCIe.
- Compatibilidad con llama.cpp y con endpoints compatibles según los tags del repositorio.
- Capacidad multilingüe: prácticamente eliminada por la poda; la perplejidad fuera de dominio se dispara.
- Soporte de tool calling y de agentes multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en portátiles con GPU de 6 GB: el modelo cabe entero en VRAM y ofrece autocompletado y generación de funciones en inglés con una retención del 98,2% en HumanEval respecto al contenedor IQ2_XXS sin podar, lo que lo hace viable en estaciones de trabajo sin GPU dedicada de gama alta.
- Tutor de matemáticas y STEM en local: con retención del 97,8% en GSM8K y 97,0% en MATH frente al IQ2_XXS completo, puede resolver problemas de nivel escolar y universitario sin conexión a la nube.
- Prototipado y demos en ferias o entornos aislados: al ocupar 4,75 GB en disco y caber en 6 GB de VRAM, se puede distribuir en un único archivo GGUF y ejecutar con llama.cpp en hardware modesto.
- Procesamiento de documentación técnica en inglés: clasificación, resumen y extracción de información de manuales y código fuente, aprovechando el sesgo de los expertos conservados hacia dominios técnicos.
- Evaluación comparativa de técnicas de compresión: sirve como referencia reproducible para investigadores que estudien poda de MoE, con DOI en Zenodo y Kaggle y resultados publicados en benchmarks canónicos.
- Chatbot de soporte técnico en inglés con latencia baja: los 45,4 tokens por segundo medidos en una RTX 4050 Laptop permiten conversaciones interactivas sin esperas perceptibles.
- Inferencia en dispositivos embebidos o mini-PC con GPU integrada de 6 GB: el modelo evita el intercambio de memoria y mantiene un rendimiento estable.

## Benchmarks y rendimiento

Resultados reportados en la model card. La columna de retención compara MAPLE con el contenedor IQ2_XXS sin podar (128 expertos).

| Benchmark | Protocolo | Base FP16 | Q4_K_M | IQ2_XXS (128 exp.) | MAPLE (48 exp.) | Retención |
|---|---|---|---|---|---|---|
| HumanEval | 0-shot Pass@1 | 64,6% | 63,8% | 61,6% | 60,5% | 98,2% |
| MBPP | 3-shot Pass@1 | 68,2% | 66,5% | 63,8% | 62,1% | 97,3% |
| GSM8K | 8-shot CoT | 78,4% | 76,8% | 72,5% | 70,9% | 97,8% |
| MATH | 4-shot CoT | 42,6% | 40,8% | 36,2% | 35,1% | 97,0% |
| MMLU | 5-shot | 75,2% | 73,9% | 68,7% | 66,4% | 96,7% |
| ARC-Challenge | 25-shot | 69,8% | 68,4% | 64,5% | 63,2% | 98,0% |
| HellaSwag | 10-shot | 86,4% | 85,1% | 81,2% | 79,5% | 97,9% |
| Perplejidad multilingüe | texto reservado | 42,1 | 46,8 | 98,9 | 572,4 | no aplica |

Datos de sistema medidos en una NVIDIA GeForce RTX 4050 Laptop de 6 GB (backend CUDA, Windows 11):

| Métrica | Q4_K_M | IQ2_XXS (128 exp.) | MAPLE (48 exp.) |
|---|---|---|---|
| Tamaño en disco | 16,4 GB | 9,92 GB | 4,75 GB |
| Capas residentes en VRAM | 33,3% | 46,7% | 100% (30/30) |
| Velocidad de generación | 3,2 TPS | 6,9 TPS | 45,4 TPS |

## Requisitos de hardware

- VRAM: aproximadamente 4,75 GB para el único archivo IQ2_XXS, más overhead del contexto; la card confirma ejecución al 100% en VRAM en una GPU de 6 GB.
- GPU recomendadas: RTX 4050 Laptop 6 GB (medida de referencia), RTX 3050 6 GB, RTX 4060 Laptop, RTX 2060 6 GB; cualquier GPU con 6 GB o más de VRAM.
- GPU de gama alta (A100, H100, RTX 4090): funcionará, pero el modelo está dimensionado para hardware de consumo y no aprovechará la capacidad adicional.
- Despliegue: llama.cpp (formato nativo GGUF); los tags indican compatibilidad con endpoints. vLLM, TGI y Ollama no se mencionan en la información disponible.
- Rendimiento: 45,4 tokens por segundo en RTX 4050 Laptop con 30 de 30 capas en VRAM; 6,57 veces más rápido que el IQ2_XXS sin podar en el mismo hardware.
- Latencia: no disponible de forma desagregada (solo throughput).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño en disco | Licencia | Notas |
|---|---|---|---|---|---|
| MAPLE (Gemma 4 26B-A4B, 48 exp.) | 10,95B en contenedor | no disponible | 4,75 GB | Apache 2.0 | 100% en VRAM en 6 GB; 45,4 TPS en RTX 4050 |
| Gemma 4 26B-A4B-it IQ2_XXS (128 exp.) | 25,6B base | no disponible | 9,92 GB | Apache 2.0 (heredada) | 46,7% de capas en 6 GB; 6,9 TPS |
| Gemma 4 26B-A4B-it Q4_K_M | 25,6B base | no disponible | 16,4 GB | Apache 2.0 (heredada) | 33,3% de capas en 6 GB; 3,2 TPS |
| Gemma 4 26B-A4B-it FP16 | 25,6B base | no disponible | 52,0 GB | Apache 2.0 (heredada) | No cabe en 6 GB (OOM) |

No se dispone de datos de otros modelos de la misma categoría (compresiones de MoE de terceros) en la información proporcionada.

## Limitaciones y advertencias

- Pérdida multilingüe severa: la perplejidad en texto no inglés sube de 98,9 a 572,4; el modelo es efectivamente monolingüe en inglés.
- La poda está sesgada hacia dominios técnicos; el rendimiento en tareas creativas, culturales o de conocimiento general puede degradarse más allá de lo que reflejan los benchmarks publicados.
- Riesgo de alucinación inherente a un modelo de 2 bits por peso; la cuantización IQ2_XXS agresiva amplifica la pérdida de fidelidad.
- Los benchmarks son autoinformados por el autor; no se han verificado de forma independiente en la información disponible.
- Longitud de contexto no especificada; no se puede garantizar el comportamiento en conversaciones largas.
- Sin datos sobre tool calling, agentes o modo thinking; no se debe asumir su disponibilidad.
- Licencia Apache 2.0 declarada, pero el modelo base Gemma tiene sus propios términos de uso; conviene verificar la compatibilidad para uso comercial.
- El rendimiento de 45,4 TPS se midió en un hardware concreto (RTX 4050 Laptop, Windows 11, CUDA); en otras configuraciones puede variar.
- El repositorio tiene pocas descargas (4551) y likes (10), por lo que la validación comunitaria es limitada.

## Enlaces

- Hugging Face: https://huggingface.co/AmSach/Gemma-4-26B-A4B-MAPLE-Sub5GB-GGUF
- Descarga directa del GGUF: https://huggingface.co/AmSach/Gemma-4-26B-A4B-MAPLE-Sub5GB-GGUF/resolve/main/gemma-4-26B-A4B-MAPLE-IQ2_XXS.gguf?download=true
- Repositorio GitHub: https://github.com/AmSach/maple
- Sitio oficial: https://amsach.github.io/maple/
- DOI Zenodo: https://doi.org/10.5281/zenodo.24344372
- DOI Kaggle: https://doi.org/10.34740/KAGGLE/M/786779
- Google Scholar del autor: https://scholar.google.com/citations?user=dfgiWLYAAAAJ&hl=en
- Hacker News (Show HN): https://news.ycombinator.com/item?id=50463281
- PitchHut: https://www.pitchhut.com/project/maple-moe-pruning
- Discusión en llama.cpp: https://github.com/ggml-org/llama.cpp/discussions/31894
- LaunchNest: https://launchnest.io/p/maple
- LinkedIn del autor: https://linkedin.com/in/theamansachan
- Instagram del autor: https://instagram.com/i.amsach
