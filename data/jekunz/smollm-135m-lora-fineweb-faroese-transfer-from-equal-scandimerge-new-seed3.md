# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-equal-scandimerge-new-seed3

## Resumen

El modelo `jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-equal-scandimerge-new-seed3` es un adaptador LoRA de investigación publicado por el usuario jekunz sobre el modelo base `jekunz/new_scandimerge_equal_135`, a su vez derivado de SmolLM2-135M-Instruct. Su propósito es el ajuste lingüístico al feroés (`fo`), una lengua nórdica insular con escasos recursos digitales, partiendo de un merge TIES con pesos iguales de modelos entrenados en danés, islandés, noruego bokmål, noruego nynorsk y sueco. El resultado es un adaptador PEFT que se aplica sobre el modelo base para transferir capacidad multilingüe escandinava hacia el feroés.

Se trata de un artefacto de investigación de tamaño reducido (aproximadamente 0,2 GB en el repositorio) y con cero descargas en el momento de la consulta, lo que indica que no ha sido validado por la comunidad ni evaluado de forma amplia, tal y como reconoce el propio autor en la model card. No resuelve un problema de producción general, sino que explora la viabilidad de la transferencia entre lenguas emparentadas mediante LoRA de rango alto sobre un modelo de 135 millones de parámetros.

Su relevancia radica en el enfoque metodológico: combinar un merge de modelos por familias lingüísticas con un ajuste posterior en la lengua objetivo, usando un modelo pequeño que puede entrenarse en una única A100 de 40 GB. Es un caso representativo de las técnicas de adaptación de bajo coste para lenguas de bajos recursos dentro del ecosistema SmolLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptador LoRA |
| Parametros totales | 135M en el modelo base; el adaptador LoRA se suma sobre este (tamaño exacto no disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos safetensors del adaptador) |
| Idiomas soportados | feroés (`fo`) como objetivo; transferencia desde danés, islandés, noruego bokmål, noruego nynorsk y sueco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros. Sobre él se aplica un adaptador LoRA con rango 256 y alpha 512, dirigido a los módulos `up_proj`, `down_proj`, `gate_proj` y `o_proj`. El punto de partida no es el modelo original, sino `jekunz/new_scandimerge_equal_135`, un merge TIES con pesos iguales de modelos ajustados en danés, islandés, noruego bokmål, noruego nynorsk y sueco, lo que proporciona una base con conocimiento de lenguas nórdicas continentales antes de la especialización en feroés.

El entrenamiento se realizó durante una época por lengua fuente y cinco épocas en feroés, con una tasa de aprendizaje de 8e-4, scheduler coseno, warmup del 5 %, batch size de 8, acumulación de gradientes de 32 pasos (batch efectivo de 256) y una única GPU A100 de 40 GB. La longitud máxima de contexto durante el entrenamiento fue de 2048 tokens y se usó la semilla 3, una de las tres semillas de esta configuración. El conjunto de datos es la porción feroesa de `HuggingFaceFW/fineweb-2`. No se documenta el número total de tokens vistos ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en feroés, heredada de la naturaleza Instruct del modelo base.
- Transferencia lingüística desde lenguas escandinavas continentales hacia el feroés mediante el merge previo.
- Razonamiento básico y generación de texto general propio de un modelo de 135M de parámetros.
- Soporte de conversación multi-turno dentro de una ventana de 2048 tokens.
- Capacidades multilingües residuales en danés, islandés, noruego bokmål, noruego nynorsk y sueco, procedentes del merge base.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación en adaptación de lenguas de bajos recursos: sirve como punto de partida reproducible para estudiar la transferencia entre lenguas nórdicas mediante LoRA sobre modelos pequeños.
- Generación de texto experimental en feroés: útil para prototipos de contenido y pruebas de fluidez en un idioma con pocos corpus disponibles.
- Evaluación de merges TIES: permite comparar el efecto de un merge equitativo escandinavo frente a un ajuste directo en feroés.
- Baseline para experimentos de semillas: al ser la semilla 3 de tres configuraciones, facilita análisis de varianza en el entrenamiento.
- Aumento de datos sintéticos en feroés: puede generar borradores de texto para filtrar y ampliar corpus, con revisión humana obligatoria.
- Docencia y demostraciones de PEFT: su tamaño reducido y su licencia Apache 2.0 lo hacen adecuado para talleres sobre LoRA y modelos compactos.
- Pruebas de despliegue de bajo coste: al caber en hardware modesto, permite validar pipelines de inferencia con modelos de 135M antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el modelo no ha sido evaluado de forma amplia.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 135M en precisión completa ocupa aproximadamente 0,5 GB; en cuantización de 8 bits alrededor de 0,15 GB y en 4 bits en torno a 0,1 GB, sin contar el adaptador LoRA ni el overhead del runtime.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior puede ejecutarlo con holgura. Para entrenamiento se usó una A100 de 40 GB.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2-4 GB de VRAM, e incluso en CPU para inferencia lenta.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF, y vLLM para servir el modelo fusionado.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SmolLM2-135M + LoRA feroés) | 135M + LoRA | 2048 | fo (con transferencia escandinava) | Apache 2.0 | Hugging Face, 0 descargas |
| SmolLM2-135M-Instruct | 135M | 8192 (según el modelo original) | Principalmente inglés | Apache 2.0 | Ampliamente disponible |
| Modelos nórdicos de mayor tamaño (p. ej. familia GPT-SW3 o NorGPT) | Cientos de millones a miles de millones | Variable | Lenguas escandinavas | Variable según modelo | Disponibles, pero no específicos para feroés |

La comparación directa con alternativas para feroés no está disponible en la información proporcionada. Frente al SmolLM2-135M-Instruct original, este adaptador añade cobertura de feroés y lenguas escandinavas a costa de una ventana de contexto menor en el entrenamiento (2048 tokens) y de una ausencia total de evaluación pública.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación amplia; el autor lo declara explícitamente.
- Riesgo elevado de alucinación y de errores gramaticales en feroés por el tamaño reducido del modelo y la escasez de datos.
- Ventana de contexto limitada a 2048 tokens durante el entrenamiento.
- Capacidad de razonamiento y conocimiento factual muy restringida por los 135M de parámetros.
- Sesgos potenciales heredados de FineWeb-2 y del modelo base, no analizados.
- Solo se documenta el feroés como idioma objetivo; el rendimiento en las lenguas escandinavas del merge no está medido.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación desaconseja su uso en producción sin validación previa.
- Cero descargas y ausencia de validación comunitaria; no hay garantías de reproducibilidad más allá de los hiperparámetros documentados.
- Es un adaptador LoRA: requiere cargar el modelo base `jekunz/new_scandimerge_equal_135` para funcionar.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-equal-scandimerge-new-seed3
- Modelo base: https://huggingface.co/jekunz/new_scandimerge_equal_135
- Dataset: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2 (modelo original): https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- PEFT: https://github.com/huggingface/peft
