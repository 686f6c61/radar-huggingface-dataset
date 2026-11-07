# en5yme/Yoshino2-4B-A2B

## Resumen

Yoshino2 4B A2B es un modelo de lenguaje experimental de tipo mezcla de expertos (MoE) desarrollado por el usuario en5yme. Se construye a partir de cuatro clones del modelo MiniCPM5-1B de OpenBMB combinados mediante Mergekit-MoE, con dos expertos activos por token, y se afina con destilación de estilo de razonamiento a partir de NVIDIA Nemotron Lightning 30B A3B. El objetivo declarado es trasladar capacidad de razonamiento de modelos de mayor escala a un modelo de borde (edge) con una huella de aproximadamente 4.000 millones de parámetros totales.

El modelo se encuentra en una fase muy temprana: el autor indica explícitamente que es altamente experimental, que no se ha evaluado con benchmarks en el momento de la publicación y que no está recomendado para entornos de producción. Además, advierte de que falla al intentar la cuantización a GGUF con la herramienta de Llama.cpp, lo que limita seriamente sus opciones de despliegue.

La relevancia actual es principalmente como artefacto de investigación sobre técnicas de fusión MoE y destilación de razonamiento en modelos pequeños. No obstante, la información técnica disponible es escasa y el modelo no cuenta con descargas ni validación comunitaria, por lo que cualquier evaluación debe tomarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) construida con Mergekit-MoE sobre 4 clones de MiniCPM5-1B |
| Parametros totales | 2.609.604.096 (según safetensors; el autor declara ~4B nominales) |
| Parametros activos | No disponible (el autor indica 2 expertos activos por token, sin cifra exacta) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el autor indica que la cuantización GGUF con Llama.cpp falla |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT para el fine-tune; el modelo base MiniCPM5-1B es Apache 2.0 según el autor |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos generado mediante Mergekit-MoE, que integra cuatro clones del modelo MiniCPM5-1B en una única estructura MoE con dos expertos activos por token. No se especifican detalles sobre atención, número de capas, dimensión oculta ni estrategia de enrutamiento. El modelo base, MiniCPM5-1B, pertenece a la familia MiniCPM de OpenBMB, aunque la información proporcionada no detalla su configuración interna.

El entrenamiento consistió en una fase de destilación con un conjunto sintético de 10.817 pares pregunta-respuesta (aproximadamente 135 MB) generado mediante un mecanismo de auto-prompt y un framework de destilación propio. El dataset incluye muestras de contexto profundo con uno y cuatro prompts, y se empleó SFT con Unsloth sobre el CSV sintético, con 3 épocas de QLoRA. La destilación busca imitar el estilo de razonamiento de NVIDIA Nemotron Lightning 30B A3B. No se documentan fases de RLHF o DPO, ni el número de tokens de entrenamiento más allá del tamaño del dataset.

## Capacidades

- Generación de texto en inglés con estilo de razonamiento destilado de un modelo mayor.
- Razonamiento de un solo turno y de contexto profundo limitado (el dataset incluye muestras de hasta cuatro prompts).
- Capacidad multilingüe limitada al inglés según la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá del estilo destilado.
- No se documentan capacidades de visión, audio ni modo thinking explícito.
- El autor no reporta capacidades de código o matemáticas verificadas.

## Casos de uso

- Investigación sobre fusión MoE: el modelo sirve como caso de estudio para evaluar Mergekit-MoE aplicado a clones de un mismo modelo pequeño y el efecto de la destilación de razonamiento.
- Experimentación con destilación de estilo: permite analizar cómo se transfiere el estilo de razonamiento de un modelo de 30B a una arquitectura MoE de borde, comparando salidas cualitativamente.
- Prototipado educativo: útil en entornos docentes para ilustrar el pipeline completo de creación de un MoE sintético con QLoRA y Unsloth.
- Pruebas de robustez de cuantización: dado que el autor reporta fallos en GGUF con Llama.cpp, el modelo puede emplearse para depurar herramientas de conversión y cuantización.
- Evaluación de licencias y trazabilidad: sirve para estudiar cómo se propagan las licencias Apache 2.0 del modelo base en fine-tunes derivados y cómo documentar la ausencia de ficheros de licencia originales.
- Benchmarking interno de modelos de borde: como referencia negativa o de control en comparativas de modelos pequeños con razonamiento destilado, siempre que se validen sus salidas manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo es experimental y que no ha sido evaluado en el momento de la publicación.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (safetensors, ~2,6B parámetros reales): aproximadamente 5-6 GB en fp16, más overhead de activaciones y contexto.
- VRAM estimada en cuantización de 8 bits: en torno a 3 GB; en 4 bits, en torno a 1,5-2 GB, aunque la cuantización GGUF con Llama.cpp falla según el autor.
- GPU recomendadas: no disponible; por tamaño, cabría en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090, así como en A100/H100 para pruebas, pero no hay validación documentada.
- Cabe en GPU de consumo: probablemente sí por tamaño, pero sin confirmación del autor y con riesgo de incompatibilidad de herramientas.
- Opciones de despliegue: no disponible; el fallo de GGUF descarta de facto llama.cpp y Ollama en su flujo estándar. vLLM o TGI requerirían validación de compatibilidad con la arquitectura MoE generada por Mergekit.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Yoshino2 4B A2B | 2,6B reales (~4B nominales), MoE con 2 activos | No disponible | MIT (fine-tune); base Apache 2.0 | Experimental, sin benchmarks, 0 descargas |
| MiniCPM5-1B (OpenBMB) | ~1B | No disponible | Apache 2.0 | Modelo base estable |
| Yoshino-0.8B (en5yme) | ~0,8B | No disponible | No disponible | Fine-tune de Qwen3.5 0.8B, descrito por el autor como el más estable de la serie |
| Nemotron Lightning 30B A3B (NVIDIA) | 30B, MoE con 3B activos | No disponible | No disponible | Modelo profesor de la destilación |

## Limitaciones y advertencias

- Modelo altamente experimental y no recomendado para producción por el propio autor.
- Sin benchmarks publicados; no hay evidencia cuantitativa de su rendimiento.
- Falla la cuantización GGUF con Llama.cpp, lo que bloquea los flujos de despliegue más habituales en entornos de consumo.
- Solo soporta inglés según la model card.
- Riesgo elevado de alucinación y de razonamiento inconsistente al ser un MoE sintético con destilación sobre un dataset pequeño (10.817 pares).
- Discrepancia entre los parámetros declarados (~4B) y los reales en safetensors (2,6B), lo que puede inducir a error en estimaciones de hardware.
- Ambigüedad de licencia: el autor señala que el repositorio no incluye el fichero de licencia del modelo base Apache 2.0 y que el LICENSE del repo corresponde solo al fine-tune; conviene verificar la trazabilidad antes de uso comercial.
- Sin descargas ni validación comunitaria; no hay evidencia de robustez en dominios concretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/en5yme/Yoshino2-4B-A2B
- Perfil del autor: https://huggingface.co/en5yme
- Yoshino-0.8B (modelo previo de la serie): https://huggingface.co/en5yme/Yoshino-0.8B
- Modelo base MiniCPM5-1B: https://huggingface.co/openbmb/MiniCPM5-1B
- Dataset de destilación: https://huggingface.co/datasets/en5yme/Nemotron-Lightning-30B-A3B-Distill
