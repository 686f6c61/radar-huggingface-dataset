# believe-it-or-not/2stage_original_augmented_original_pkc_fda_approval-7dcbb948

## Resumen

El modelo `2stage_original_augmented_original_pkc_fda_approval-7dcbb948` es un adaptador PEFT (LoRA) publicado por el usuario `believe-it-or-not` en Hugging Face. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino que debe cargarse sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, una variante de referencia de Llama 3.3 70B Instruct distribuida por Together Computer.

El nombre del repositorio sugiere un experimento de ajuste fino en dos etapas (`2stage`) sobre datos aumentados (`augmented`) relacionados con aprobaciones de la FDA y posiblemente con conocimiento farmacéutico (`pkc`), aunque la model card no documenta ni el dataset, ni el procedimiento, ni los objetivos. El repositorio tiene 0 descargas y 0 likes, y fue creado el 16 de noviembre de 2026, lo que lo sitúa como un artefacto de investigación sin validación pública.

La relevancia práctica es limitada: se desconoce la licencia, los idiomas, el pipeline y cualquier resultado de evaluación. Se documenta aquí como ficha técnica de referencia para quien encuentre el repositorio y necesite saber exactamente qué contiene y qué no.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre un transformer decoder-only (Llama 3.3 70B Instruct) |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 70 000 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama 3.3 70B soporta 128 000 tokens |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite cuantizaciones estándar (FP16, BF16, INT8, INT4/GGUF) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Tamano del repositorio | 1,7 GB |
| Libreria | PEFT 0.15.1 |
| Modelo base | togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) gestionado con la librería PEFT en su versión 0.15.1. La arquitectura subyacente es la del modelo base `Meta-Llama-3.3-70B-Instruct-Reference`: un transformer decoder-only de 70 000 millones de parámetros con atención por grupos (GQA) y ventana de contexto de 128 000 tokens, ajustado con instrucciones. El adaptador modifica un subconjunto de matrices de pesos mediante descomposiciones de bajo rango, lo que explica su tamaño de 1,7 GB frente a los aproximadamente 140 GB del modelo base en BF16.

No hay información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, el rango del adaptador, el alpha, la tasa de aprendizaje ni si se aplicaron técnicas de RLHF o DPO. El nombre del repositorio (`2stage_original_augmented_original_pkc_fda_approval`) apunta a un pipeline de dos etapas sobre datos originales y aumentados, probablemente orientado a tareas de aprobación regulatoria farmacéutica, pero esto es una inferencia a partir del identificador y no un dato documentado. La model card es la plantilla por defecto de Hugging Face con todos los campos marcados como `[More Information Needed]`.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Llama 3.3 70B Instruct, en la medida en que el adaptador no los degrade (no verificado).
- Ajuste específico orientado, según el nombre del repositorio, a tareas de aprobación regulatoria de la FDA y posiblemente a conocimiento farmacocinético (`pkc`); sin documentación que lo confirme.
- Soporte de tool calling y function calling: heredado del modelo base, no validado tras el ajuste.
- Capacidades multilingües: heredadas del modelo base, no validadas para el adaptador.
- Modo thinking, visión o audio: no disponible.
- No se documenta ninguna capacidad especial adicional.

## Casos de uso

- Evaluación de adaptadores LoRA en dominios regulados: cargar el adaptador sobre Llama 3.3 70B Instruct con PEFT y comparar respuestas frente al modelo base en preguntas sobre aprobaciones de la FDA, para medir si el ajuste aporta valor real.
- Investigación sobre ajuste fino en dos etapas: usar el repositorio como referencia de un experimento `2stage` con datos aumentados y reproducir el pipeline si se localiza documentación adicional del autor.
- Pruebas de regresión de adaptadores: verificar que la carga del adaptador con PEFT 0.15.1 no rompe el formato de chat del modelo base ni degrada tareas generales.
- Prototipado interno de asistentes sobre documentación regulatoria: desplegar el modelo base con el adaptador en un entorno controlado para generar borradores de resúmenes de expedientes, siempre con revisión humana.
- Análisis de robustez ante datos aumentados: estudiar cómo afecta el entrenamiento con datos sintéticos o aumentados a la fidelidad factual en un dominio sensible como el farmacéutico.
- Docencia y experimentación con PEFT: ejemplo práctico de cómo se estructura un adaptador LoRA de gran tamaño (1,7 GB) y cómo se integra con `peft` y `transformers`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador por sí solo ocupa 1,7 GB en disco y requiere cargar el modelo base completo para inferencia.
- El modelo base Llama 3.3 70B en BF16 requiere aproximadamente 140 GB de VRAM; en cuantización INT8, unos 70 GB; en INT4/GGUF Q4, unos 40 GB.
- GPU recomendadas para el modelo base en precisión completa: 2× A100 80 GB o 2× H100 80 GB con tensor parallelism; en INT8, una A100 80 GB o H100 80 GB; en INT4, una RTX 4090 24 GB no es suficiente para los 70B completos, se necesita al menos 48 GB (A6000, A100 40 GB con cuidado) o descarga a CPU.
- No cabe en GPUs de consumo de 24 GB en precisión completa; solo con cuantizaciones agresivas y offloading parcial, con latencia muy alta.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador, vLLM con soporte LoRA, TGI con adaptadores, llama.cpp/Ollama solo si se fusiona y convierte el adaptador a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B Instruct) | 70B base + LoRA | No disponible (base: 128k) | No disponible | Hugging Face, 0 descargas | Sin documentación ni evaluación |
| Meta-Llama-3.3-70B-Instruct | 70B | 128k | Llama 3.3 Community License | Amplia, muy usado | Modelo base oficial, evaluado y documentado |
| Qwen2.5-72B-Instruct | 72B | 128k | Apache 2.0 (mayoría de variantes) | Hugging Face, amplia adopción | Alternativa abierta con benchmarks publicados |
| Mistral Large 2 (123B) | 123B | 128k | Comercial | API y pesos bajo licencia | Referencia en razonamiento multilingüe |

La comparación directa no es posible porque el adaptador carece de métricas propias; la comparativa se establece frente al modelo base y a alternativas de tamaño similar con documentación pública.

## Limitaciones y advertencias

- La model card está vacía: no hay información sobre datos, sesgos, evaluación ni uso previsto.
- Licencia no declarada: no se puede asumir uso comercial; además, hereda las restricciones de la Llama 3.3 Community License del modelo base.
- Riesgo de alucinación elevado en dominio regulatorio: sin evaluación, no hay garantía de fidelidad factual en temas de aprobaciones de la FDA.
- El adaptador puede degradar capacidades generales del modelo base (olvido catastrófico) sin que existan pruebas publicadas.
- Sin validación multilingüe ni de tool calling tras el ajuste.
- Repositorio con 0 descargas y 0 likes: sin comunidad que lo haya verificado.
- El nombre del repositorio sugiere un experimento automatizado o de ablation, no un modelo listo para producción.
- No se documenta el rango ni la configuración LoRA, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/believe-it-or-not/2stage_original_augmented_original_pkc_fda_approval-7dcbb948
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Librería PEFT: https://huggingface.co/docs/peft
- Paper de LoRA (referencia del tag arxiv:1910.09700): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
