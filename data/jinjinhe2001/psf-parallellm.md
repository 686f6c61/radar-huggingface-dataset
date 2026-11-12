# jinjinhe2001/PSF-ParallelLM

## Resumen

PSF-ParallelLM es una colección de checkpoints de investigación publicada por Jinjinhe2001 (Jinjin He y colaboradores) que implementa Predictive-State Flows (PSF), una arquitectura de generación de lenguaje paralela presentada en el artículo "Rethinking the Roles of Diffusion and Decoding: Predictive-State Flows for Parallel Language Generation" (arXiv:2610.12898). El modelo aborda el cuello de botella de la decodificación autorregresiva secuencial: en lugar de generar token a token, un prior de flujo rectificado (rectified flow) genera conjuntamente los K estados predictivos de un documento de 1024 tokens a partir de ruido, y un decodificador de bloques escribe después los K bloques en paralelo, siendo autorregresivo solo dentro de cada bloque.

Se distribuyen dos variantes de tamaño: PSF (197M parámetros de generación, 0,93 GB por fichero) y PSF-L (677M parámetros, 3,15 GB por fichero), además de una línea base autorregresiva de 197M entrenada con los mismos datos. Todos los checkpoints incluyen también el codificador y se distribuyen en fp32 con pesos EMA. El repositorio ocupa 21,2 GB e incluye ficheros para distintos valores de K (8, 16, 32 y 64), lo que permite intercambiar velocidad de generación por calidad.

El modelo es relevante como pieza de investigación sobre alternativas a la decodificación autorregresiva clásica, con métricas de eficiencia explícitas (TFLOPs por documento) y evaluación con juez GPT-2 Large sobre 1000 muestras. No es un modelo de propósito general listo para producción: es una generación incondicional entrenada sobre OpenWebText, solo en inglés, y sin alineación mediante RLHF o DPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: prior de flujo rectificado (rectified flow) sobre estados predictivos + decodificador de bloques con atención autorregresiva intra-bloque |
| Parametros totales | PSF: 197M de generación (109M decodificador + 88M prior); PSF-L: 677M (369M + 308M); línea base AR: 197M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Documentos de 1024 tokens; K bloques por documento (K = 8, 16, 32, 64) |
| Tipos de cuantizacion | No disponible (checkpoints distribuidos en fp32 con pesos EMA) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `.pt` (state_dict de PyTorch, cargable con `torch.load(..., weights_only=True)`) |

## Arquitectura y entrenamiento

PSF separa el modelado en dos etapas. Primero, un estado predictivo s_k resume únicamente los bloques anteriores al bloque k; un prior de flujo rectificado genera los K estados predictivos de un documento de 1024 tokens de forma conjunta a partir de ruido. Después, un decodificador de bloques escribe todos los K bloques en paralelo, aplicando autorregresión solo dentro de cada bloque. Esta división es la innovación central del artículo: replantea los papeles de difusión (generación del estado latente global) y decodificación (escritura local de tokens).

El entrenamiento es incondicional y se realizó sobre OpenWebText con el tokenizador de T5. No se menciona en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni el uso de RLHF, DPO u otras fases de alineación. Los checkpoints incluyen el codificador además del decodificador y el prior. La arquitectura no está embebida en los ficheros PSF: se reconstruye a partir de los flags de `configs/<name>.model.args` del repositorio de código. Se ofrecen variantes con prior "states-only" (`psf_k8_states-only.pt`, `psf-l_k8_states-only.pt`) que mejoran la perplejidad a costa de MAUVE.

## Capacidades

- Generación de texto incondicional en inglés a partir de ruido, sin prompt de entrada.
- Generación paralela por bloques: los K bloques de un documento de 1024 tokens se escriben simultáneamente, con autorregresión únicamente intra-bloque.
- Control explícito del compromiso velocidad/calidad mediante el parámetro K (K = 8, 16, 32, 64) y mediante la elección entre PSF (197M) y PSF-L (677M).
- Variantes con prior "states-only" para priorizar perplejidad de generación sobre diversidad (MAUVE).
- No dispone de tool calling, function calling, modo agente, razonamiento multi-paso, visión, audio ni modo thinking.
- No es un modelo instruido ni conversacional: no hay soporte de chat ni de seguimiento de instrucciones.

## Casos de uso

- Investigación sobre decodificación paralela: reproducción de los resultados del artículo con `scripts.eval_gen` y los ficheros de configuración de muestreo, comparando curvas de perplejidad frente a TFLOPs por documento entre distintos valores de K.
- Estudio de eficiencia computacional: medición del coste por documento (0,31 TFLOPs con K = 8 en PSF frente a 0,80 TFLOPs con K = 64) para analizar el equilibrio entre paralelismo y calidad en hardware concreto.
- Experimentos de flow matching aplicado a lenguaje: el prior de flujo rectificado sobre estados predictivos sirve como banco de pruebas para investigar modelos generativos continuos en texto, alternativos a la difusión discreta.
- Evaluación de métricas generativas: el modelo permite reproducir la comparativa PPL de generación y MAUVE@512 con juez GPT-2 Large sobre 1000 muestras, útil para validar pipelines de evaluación propios.
- Línea base para comparativas académicas: el checkpoint `ar-197m.pt` (autorregresivo, mismos datos, 197M) permite aislar el efecto de la arquitectura frente al mismo régimen de entrenamiento.
- Generación de texto sintético a gran escala en inglés para experimentos de data augmentation o análisis de distribuciones, siempre que se acepte la naturaleza incondicional y no alineada del modelo.
- Estudio de la relación entre longitud de bloque y coherencia global: variando K se puede analizar cómo el tamaño de bloque afecta a la consistencia de documentos de 1024 tokens.

## Benchmarks y rendimiento

Datos de la Tabla 1 del artículo: 1000 muestras, juez GPT-2 Large, con los ajustes de muestreo de `configs/<name>.sampling.args`. La columna "Gen. PPL @ entropy" indica perplejidad de generación y la entropía asociada.

| Modelo | K | Gen. PPL @ entropy | MAUVE@512 | TFLOPs / doc |
|---|---|---|---|---|
| PSF | 64 | 41,15 @ 5,183 | 0,87 | 0,80 |
| PSF | 32 | 33,56 @ 5,177 | 0,89 | 0,52 |
| PSF | 16 | 25,67 @ 5,173 | 0,90 | 0,38 |
| PSF | 8 | 22,75 @ 5,164 | 0,93 | 0,31 |
| PSF (states-only) | 8 | 18,95 @ 5,158 | 0,85 | 0,31 |
| PSF-L | 64 | 42,2 @ 5,16 (interpolado) | No disponible | No disponible |
| PSF-L | 32 | 27,1 @ 5,16 (interpolado) | No disponible | No disponible |
| PSF-L | 16 | 21,22 @ 5,181 | 0,91 | 1,35 |
| PSF-L | 8 | 17,79 @ 5,146 | 0,90 | 1,10 |
| PSF-L (states-only) | 8 | 15,98 @ 5,144 | 0,89 | 1,10 |
| AR (línea base) | - | 15,37 @ 5,151 | 0,95 | 0,43 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidades.

## Requisitos de hardware

- VRAM estimada: los ficheros PSF ocupan 0,93 GB (197M parámetros en fp32) y los PSF-L 3,15 GB (677M en fp32); el pico de memoria en inferencia será superior por activaciones y buffers del prior y del decodificador, aunque no se publica una cifra exacta.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM debería alojar los checkpoints PSF en fp32; para PSF-L se recomienda 16 GB o más. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, tanto PSF como PSF-L en fp32 según el tamaño de los ficheros; no se han publicado requisitos oficiales de VRAM.
- Opciones de despliegue: el flujo documentado es PyTorch nativo mediante el repositorio de código (`scripts.eval_gen`, `scripts.sample_ar`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI; el formato `.pt` con arquitectura externa en ficheros de configuración complica la integración con esos motores.
- Latencia y throughput: no se publican tiempos absolutos; el coste relativo se expresa en TFLOPs por documento (0,31 a 1,35 según variante y K), lo que sirve para estimar el rendimiento en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PSF (este modelo) | 197M | 1024 tokens, K bloques | Flujo rectificado + decodificación paralela por bloques | MIT | Hugging Face + repo de código |
| PSF-L (este modelo) | 677M | 1024 tokens, K bloques | Igual, mayor escala | MIT | Hugging Face + repo de código |
| AR baseline (`ar-197m.pt`) | 197M | 1024 tokens | Autorregresivo clásico, mismos datos | MIT | Incluido en el mismo repo |
| Modelos autorregresivos de ~200M (p. ej. GPT-2 small) | ~124M–200M | 1024 tokens típicamente | Autorregresivo | Variable | Amplia |

No se dispone en la información proporcionada de comparativas con otros modelos de difusión de lenguaje (p. ej. familias de diffusion-LM o modelos de flujo paralelo) más allá de la línea base autorregresiva incluida por los autores.

## Limitaciones y advertencias

- Modelo de investigación: generación incondicional, sin prompt ni instrucciones; no es apto como asistente conversacional.
- Solo inglés; no se documenta soporte multilingüe.
- Sin alineación (no consta RLHF ni DPO): alta probabilidad de contenido sesgado, tóxico o factualmente incorrecto, y riesgo elevado de alucinación en cualquier uso que implique factualidad.
- Entrenado sobre OpenWebText, por lo que hereda los sesgos de ese corpus.
- La arquitectura no está embebida en los checkpoints PSF: requiere los ficheros `configs/<name>.model.args` del repositorio de código para reconstruirla, lo que añade un paso de integración y un riesgo de incompatibilidad si el repositorio cambia.
- Los checkpoints están en fp32 con pesos EMA; no se ofrecen versiones cuantizadas y no se documenta compatibilidad con motores de inferencia optimizados.
- La ventana es de 1024 tokens por documento; no hay soporte de contexto largo.
- Licencia MIT: permite uso comercial, pero al ser un modelo incondicional sin alineación, su uso en producción requeriría filtrado y evaluación adicionales.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta; es un artefacto académico reciente, sin validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/jinjinhe2001/PSF-ParallelLM
- Artículo: https://arxiv.org/abs/2610.12898
- Código: https://github.com/jinjinhe2001/Predictive-State-Flows-for-Parallel-Language-Generation
- Cita (BibTeX): He, Jinjin; Feng, Xinsong; Fu, Lucheng; Wang, Sinan; Zhu, Bo; Wang, Jiayun. "Rethinking the Roles of Diffusion and Decoding: Predictive-State Flows for Parallel Language Generation". arXiv:2610.12898, 2026.
