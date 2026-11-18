# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-multilingual-seed1

## Resumen

Este repositorio contiene un adaptador LoRA para el modelo SmolLM2-135M-Instruct de HuggingFaceTB, ajustado para generación de texto en feroés (código ISO `fo`). El autor, jekunz, lo ha entrenado como parte de una investigación sobre transferencia entre lenguas nórdicas: primero ajusta conjuntamente sobre las porciones en danés, islandés, noruego bokmål, noruego nynorsk y sueco de FineWeb-2, y después continúa el entrenamiento sobre la porción en feroés del mismo corpus. El resultado es un adaptador PEFT que se aplica sobre el modelo base de 135 millones de parámetros.

El modelo resuelve el problema de la baja disponibilidad de datos y modelos para el feroés, una lengua germánica insular con unos 70.000 hablantes y escasa representación en corpus de entrenamiento de gran escala. La estrategia de transferencia desde lenguas nórdicas mejor documentadas permite aprovechar el conocimiento lingüístico compartido antes de especializar en feroés, en lugar de entrenar directamente desde el modelo base.

Es relevante ahora porque demuestra una metodología de bajo coste (un solo A100 de 40 GB, LoRA de rango 256) para adaptar modelos pequeños a lenguas de bajos recursos. No obstante, el propio autor indica que se trata de un modelo de investigación y que no ha sido evaluado de forma amplia, por lo que su uso en producción requiere validación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (adaptador LoRA sobre SmolLM2-135M-Instruct) |
| Parámetros totales | 135M en el modelo base; el adaptador LoRA añade parámetros sobre `up_proj`, `down_proj`, `gate_proj` y `o_proj` (rango 256) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens durante el entrenamiento |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de SmolLM2) |
| Idiomas soportados | feroés (`fo`); entrenamiento previo con danés, islandés, noruego bokmål, noruego nynorsk y sueco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base SmolLM2-135M-Instruct es un transformer decoder-only de 135 millones de parámetros. Sobre él se aplica un adaptador LoRA con rango 256 y alpha 512, dirigido a las proyecciones `up_proj`, `down_proj`, `gate_proj` y `o_proj` de las capas. El entrenamiento se realizó en dos fases: primero una época sobre los datos conjuntos de danés, islandés, noruego bokmål, noruego nynorsk y sueco de FineWeb-2, y después cinco épocas sobre la porción en feroés del mismo corpus. Esta secuencia busca que el adaptador adquiera representaciones útiles de las lenguas nórdicas mejor representadas antes de especializarse en feroés.

Los hiperparámetros documentados son: learning rate 8e-4, scheduler coseno, warmup ratio 0,05, batch size 8 con 32 pasos de acumulación de gradiente (batch efectivo 256), longitud máxima de contexto de 2048 tokens, una única GPU A100 de 40 GB y semilla 1. El autor indica que esta configuración se repitió con tres semillas distintas, de las que este repositorio es la primera. No se documentan detalles sobre número total de tokens procesados, composición exacta del dataset ni si se aplicaron técnicas de alineación adicionales (RLHF/DPO) más allá del ajuste supervisado sobre el corpus.

## Capacidades

- Generación de texto en feroés, heredando la capacidad generativa del modelo base SmolLM2-135M-Instruct.
- Conversación multi-turno en formato instruct, ya que el modelo base está ajustado para instrucciones.
- Transferencia lingüística desde lenguas nórdicas continentales e insulares (danés, islandés, noruego, sueco) hacia el feroés.
- Generación condicionada por contexto de hasta 2048 tokens.
- Capacidades de razonamiento y código limitadas por el tamaño del modelo base (135M), no reforzadas específicamente en este ajuste.
- Soporte de tool calling / function calling: no documentado para este adaptador; depende de lo que soporte el modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: el adaptador está orientado a feroés; el modelo base conserva parte de su competencia multilingüe original, pero no se ha evaluado el efecto del ajuste sobre otras lenguas.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Generación de texto en feroés para contenidos divulgativos: el adaptador puede producir borradores de artículos o descripciones en feroés a partir de instrucciones, aprovechando el ajuste específico sobre FineWeb-2 en esa lengua.
- Prototipado de asistentes conversacionales en feroés: al partir de un modelo instruct, permite construir demostradores de chat multi-turno con contexto de hasta 2048 tokens para validar experiencias de usuario antes de invertir en modelos mayores.
- Investigación en transferencia entre lenguas de bajos recursos: sirve como punto de comparación reproducible (semilla 1 de 3) para estudiar cómo el preentrenamiento conjunto en lenguas nórdicas afecta al rendimiento final en feroés.
- Normalización y reescritura de texto feroés: tareas de paráfrasis, resumen o reformulación de documentos cortos donde el contexto de 2048 tokens es suficiente.
- Generación de datos sintéticos en feroés para aumento de corpus: el modelo puede producir frases y párrafos que, tras filtrado humano, amplíen datasets de entrenamiento para otras tareas.
- Educación y aprendizaje de feroés: generación de ejemplos de frases, ejercicios o explicaciones simples en feroés para materiales didácticos, con revisión humana obligatoria por el riesgo de errores.
- Experimentación académica de bajo coste: al caber en una GPU consumer y requerir solo un adaptador de 0,2 GB, permite a investigadores sin clústeres grandes reproducir y extender el experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo no ha sido evaluado de forma amplia.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 135M en precisión completa (fp32) ocupa aproximadamente 0,5 GB; en fp16/bf16, unos 0,27 GB; en cuantización de 8 bits, alrededor de 0,14 GB; en 4 bits, unos 0,07 GB. El adaptador LoRA añade una fracción pequeña sobre estos valores.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el entrenamiento documentado se realizó en una A100 de 40 GB, pero la inferencia no requiere hardware de datacenter.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, e incluso iGPU con suficiente memoria compartida).
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; llama.cpp y Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF; vLLM y TGI para servir el modelo fusionado.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera una latencia muy baja en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-multilingual-seed1 | 135M (base) + LoRA | 2048 | Feroés (con transferencia nórdica) | Apache 2.0 | Hugging Face, 0 descargas |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | 8192 (según model card del base) | Multilingüe (principalmente inglés) | Apache 2.0 | Hugging Face, ampliamente utilizado |
| Modelos específicos para feroés de tamaño similar | no disponible | no disponible | Feroés | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este adaptador con alternativas para feroés. La comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Modelo de investigación: el autor declara explícitamente que no ha sido evaluado de forma amplia, por lo que no se recomienda su uso en producción sin una validación propia.
- Riesgo de alucinación: al ser un modelo de 135M parámetros, la coherencia factual y la fidelidad a las instrucciones son limitadas, especialmente en tareas de razonamiento o conocimiento del mundo.
- Sesgos: no se documentan análisis de sesgos; el corpus FineWeb-2 puede arrastrar sesgos de género, culturales y geográficos presentes en la web.
- Limitaciones de contexto: el entrenamiento se realizó con 2048 tokens; no se ha verificado el comportamiento más allá de esa longitud.
- Limitaciones de idioma: el adaptador está especializado en feroés; su rendimiento en otras lenguas puede haberse degradado respecto al modelo base, y no se ha medido ese efecto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el modelo base tiene su propia licencia (también Apache 2.0), que debe respetarse al redistribuir.
- Caveat de producción: al ser un adaptador LoRA, requiere cargar el modelo base y aplicar el adaptador; para despliegues sencillos conviene fusionar los pesos y validar el resultado antes de servirlo.
- Reproducibilidad: es una de tres semillas; los resultados pueden variar entre semillas, y no se publican métricas que cuantifiquen esa variabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-multilingual-seed1
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Librería PEFT: https://github.com/huggingface/peft
- Paper de SmolLM2: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
