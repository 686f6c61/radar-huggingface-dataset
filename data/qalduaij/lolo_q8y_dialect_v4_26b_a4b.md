# qalduaij/lolo_Q8y_Dialect_v4_26B_A4B

## Resumen

lolo_Q8y_Dialect_v4_26B_A4B es un ajuste fino (fine-tuning) del modelo base `unsloth/gemma-4-26B-A4B-it` desarrollado por Qusai Al-duaij (`qalduaij`), creador de la familia de modelos "lolo AI Ecosystem" orientada al árabe kuwaití. El modelo se presenta como un MoE (Mixture of Experts) de 26B de parámetros totales y aproximadamente 4B activos, especializado en el dialecto kuwaití y en árabe estándar moderno formal, con soporte cruzado árabe-inglés.

El modelo se distribuye con licencia Apache 2.0 y está disponible tanto en formato safetensors (transformers) como en GGUF cuantizado (Q4_K_M y Q8_0), además de un adaptador LoRA separado. El repositorio ocupa 103,2 GB e incluye plantilla de chat, configuración de generación y un Modelfile para Ollama. Su relevancia radica en ser una de las pocas iniciativas de "IA soberana" centradas en un dialecto árabe específico, un nicho poco cubierto por los modelos generalistas.

El proyecto es de autoría individual y se declara explícitamente en fase de desarrollo, sin equipo de investigación detrás. Esto condiciona su madurez, su documentación de benchmarks y la validación de sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Gemma 4 (transformer), según model card |
| Parametros totales | 25.805.936.206 (25,8B, dato real de safetensors) |
| Parametros activos | ~4B (según nomenclatura A4B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (15,64 GB), Q8_0 (25,02 GB), safetensors (bf16/fp16 implícito), adaptador LoRA (7,37 GB) |
| Idiomas soportados | Árabe (ar) e inglés (en); especialización en dialecto kuwaití y árabe estándar formal |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (Q4_K_M y Q8_0), LoRA (adapter_model.safetensors) |

## Arquitectura y entrenamiento

El modelo se construye sobre `unsloth/gemma-4-26B-A4B-it`, un transformer con arquitectura Mixture of Experts de 26B parámetros totales y aproximadamente 4B activos por token. El ajuste se realiza mediante LoRA con rango r=64 y alpha=128, según indica la model card. El adaptador resultante se empaqueta tanto como LoRA independiente como fusionado en pesos completos y cuantizaciones GGUF.

La model card describe el entrenamiento con "léxicos fonéticos y patrimoniales y textos radiofónicos y dramáticos kuwaitíes verificados", lo que sugiere un corpus centrado en el dialecto kuwaití hablado y su tradición oral y mediática. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas propias más allá del ajuste LoRA sobre el modelo base.

## Capacidades

- Generación de texto conversacional en dialecto kuwaití y en árabe estándar moderno formal (registro "legal e institucional" según la model card).
- Traducción y comunicación cruzada árabe-inglés.
- Conversación multi-turno con plantilla de chat propia (`chat_template.jinja`).
- Capacidad multimodal de entrada imagen-texto a texto, heredada del pipeline `image-text-to-text` del modelo base Gemma 4.
- Soporte declarado de interoperabilidad con Ollama y LM Studio mediante GGUF y Modelfile.
- Integración con transformers y despliegue mediante adaptador LoRA.
- No se documentan explícitamente capacidades de tool calling, function calling, razonamiento multi-paso, modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Atención al cliente en kuwaití: el modelo puede mantener conversaciones en dialecto kuwaití auténtico, adecuado para servicios de atención al ciudadano o comercio local en Kuwait, donde el árabe estándar resulta artificial.
- Contenido mediático y radiofónico: dado su entrenamiento con textos radiofónicos y dramáticos, puede emplearse para generar guiones, diálogos o locuciones escritas en registro dialectal kuwaití.
- Traducción árabe-inglés en contexto institucional: útil para documentación bilingüe en organismos kuwaitíes, combinando árabe formal e inglés.
- Preservación del patrimonio lingüístico: generación y catalogación de textos en dialecto kuwaití a partir de léxicos fonéticos y patrimoniales, con fines educativos o de archivo.
- Asistencia documental en árabe formal: redacción de textos institucionales en árabe estándar moderno dentro de la misma familia lolo, complementando a los modelos `lolo_Q8y_General` y `lolo_Q8y_Legal`.
- Despliegue local con Ollama o LM Studio: gracias a las cuantizaciones GGUF Q4_K_M (15,64 GB) y Q8_0 (25,02 GB), puede ejecutarse en estaciones de trabajo con GPU de consumo alta gama para prototipos y demos.
- Investigación sobre dialectos árabes: base para experimentos de NLP dialectal, evaluación de cobertura léxica kuwaití o ajustes posteriores mediante el adaptador LoRA publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB con GGUF Q4_K_M y unos 26 GB con GGUF Q8_0; en safetensors bf16 se requeriría del orden de 52 GB solo para pesos, más overhead de contexto y activaciones.
- GPU recomendadas: A100 40/80 GB o H100 para safetensors en precisión completa; RTX 4090 (24 GB) o RTX 3090 para Q4_K_M; para Q8_0 se recomienda GPU con 32 GB o más (A100 40 GB, RTX 5090 si aplica, o configuraciones multi-GPU).
- Cabe en GPU de consumo: sí, con Q4_K_M en RTX 4090/3090 (24 GB) o superiores; Q8_0 queda al límite y requiere GPUs de 32 GB o más.
- Opciones de despliegue: Ollama (`ollama run hf.co/qalduaij/lolo_Q8y_Dialect_v4_26B_A4B:Q4_K_M`), LM Studio, llama.cpp (vía GGUF), transformers con safetensors o con el adaptador LoRA, y Modelfile para construcción local.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lolo_Q8y_Dialect_v4_26B_A4B | 25,8B totales / ~4B activos | no disponible | Apache 2.0 | HF (safetensors, GGUF, LoRA) | Especializado en dialecto kuwaití |
| unsloth/gemma-4-26B-A4B-it (base) | 26B totales / ~4B activos | no disponible | Apache 2.0 (heredada) | HF | Modelo generalista multimodal, sin especialización dialectal |
| lolo_Q8y_Dialect_v3_31B | 31B (Gemma 4 31B) | no disponible | no disponible | HF | Generación anterior de la familia, densa, enfocada en dialecto y narración radiofónica |
| lolo_Q8y_Dialect_v2 | 14B (Qwen2.5 14B) | no disponible | no disponible | HF | Generación anterior sobre base Qwen, menor tamaño |

## Limitaciones y advertencias

- Proyecto de autor individual en fase de desarrollo activo, según declara el propio creador; no hay equipo de investigación ni validación independiente publicada.
- Ausencia total de benchmarks publicados, lo que impide evaluar objetivamente su calidad frente a alternativas.
- Riesgo de alucinación inherente a los modelos generativos, agravado por la falta de evaluación documentada.
- Longitud de contexto no especificada; no debe asumirse una ventana amplia sin verificación empírica.
- Cobertura limitada a árabe e inglés; el rendimiento fuera del dialecto kuwaití y del árabe formal no está documentado.
- Sesgos potenciales derivados del corpus de entrenamiento (textos radiofónicos y dramáticos kuwaitíes), que pueden reflejar sesgos culturales o de registro.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), conviene verificar que las condiciones del modelo base Gemma 4 y de los datos de entrenamiento sean compatibles con el uso previsto.
- El repositorio incluye un adaptador LoRA de 7,37 GB cuyo uso requiere cargar también el modelo base; verificar compatibilidad de versiones de transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qalduaij/lolo_Q8y_Dialect_v4_26B_A4B
- Modelo base: https://huggingface.co/unsloth/gemma-4-26B-A4B-it
- Sitio del autor: https://www.alduaij.uk
- Familia lolo (referencias en model card): `qalduaij/lolo_Q8y_General`, `qalduaij/lolo_Q8y_General_E2B`, `qalduaij/lolo_Q8y_Legal`, `qalduaij/lolo_Q8y_Legal_E2B`, `qalduaij/lolo_Q8y_Dialect_v2`, `qalduaij/lolo_Q8y_Dialect_v3_31B`, `qalduaij/lolo_Q8y_Dialect_v5_E2B`
- No se han encontrado papers, blogs técnicos ni demos adicionales en la información disponible.
