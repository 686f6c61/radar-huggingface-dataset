# new-darcy/DeepSeek-R1-Distill-Qwen-1.5B

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B es un modelo de lenguaje de 1.777 millones de parametros (1,5B nominales) obtenido por destilacion del modelo de razonamiento DeepSeek-R1 sobre la base densa Qwen2.5-1.5B. Lo desarrolla DeepSeek AI como parte de la familia de destilados publicada junto a DeepSeek-R1-Zero y DeepSeek-R1, y esta pensado para trasladar los patrones de razonamiento (chain-of-thought largo, auto-verificacion y reflexion) a modelos pequenos que puedan ejecutarse en hardware modesto.

El repositorio aqui descrito es una copia subida por el usuario `new-darcy` bajo licencia MIT, con pesos en safetensors y compatibilidad con la libreria `transformers` (arquitectura `qwen2`). No incluye informacion propia sobre idiomas, cuantizaciones ni datos de entrenamiento adicionales; toda la documentacion tecnica procede de la model card original de DeepSeek-R1, que describe el pipeline de RL y destilacion del que surge este checkpoint.

Su relevancia actual es practica: permite experimentar con razonamiento explicito y cadenas de pensamiento en entornos con poca VRAM (del orden de 3-4 GB en FP16), algo inusual en modelos con capacidad de razonamiento declarada, y sirve como base para ajuste fino o para despliegues locales de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2, clase `qwen2` en transformers) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se listan GGUF ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-1.5B, un transformer denso decoder-only. Sobre el se aplico destilacion supervisada: DeepSeek AI genero datos de razonamiento con DeepSeek-R1 y ajusto con ellos varios modelos densos de las familias Qwen2.5 y Llama3, publicando checkpoints de 1.5B, 7B, 8B, 14B, 32B y 70B. La model card indica que los patrones de razonamiento de un modelo grande se transfieren mejor por destilacion que por RL directo sobre modelos pequenos.

El modelo profesor, DeepSeek-R1, se entreno con un pipeline de dos etapas de RL (descubrimiento de patrones de razonamiento y alineamiento con preferencias humanas) y dos etapas de SFT, precedido por datos de cold-start para corregir los problemas de DeepSeek-R1-Zero (repeticion infinita, legibilidad pobre y mezcla de idiomas). La model card no detalla el numero de tokens de entrenamiento del destilado, la composicion del dataset ni si hubo DPO en esta etapa concreta.

## Capacidades

- Generacion de texto conversacional y de razonamiento con cadenas de pensamiento largas (estilo chain-of-thought), herencia directa del modelo profesor.
- Razonamiento matematico y resolucion de problemas paso a paso.
- Generacion y explicacion de codigo.
- Auto-verificacion y reflexion sobre los propios pasos intermedios, comportamiento emergente documentado en la familia R1.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente para este checkpoint.
- Capacidades multilingues: no disponibles; la model card original advierte de mezcla de idiomas en la variante Zero, aunque R1 incorpora cold-start para mitigarlo.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Razonamiento matematico asistido en local: el modelo puede resolver problemas paso a paso mostrando el desarrollo, util para entornos educativos o de validacion donde no se quiere enviar datos a una API externa.
- Prototipado de pipelines de razonamiento en portatiles: con ~3,5 GB en FP16 cabe en GPUs de consumo, lo que permite iterar sobre prompts de chain-of-thought sin infraestructura dedicada.
- Generacion de codigo en herramientas de desarrollo: puede integrarse en asistentes ligeros o pre-commit hooks para explicar y proponer parches, siempre con revision humana dado su tamano reducido.
- Base para ajuste fino (SFT/LoRA): su tamano permite entrenar adaptadores en una sola GPU consumer y especializarlo en dominios concretos (soporte tecnico, normativa, etc.).
- Filtrado y clasificacion con justificacion: al generar razonamiento explicito, sirve para tareas donde se necesita auditar por que se tomo una decision, como moderacion de contenido o triaje de tickets.
- Evaluacion comparativa de tecnicas de razonamiento: util como baseline pequeno frente a modelos mayores de la misma familia para medir cuanto del rendimiento se conserva tras la destilacion.
- Experimentacion academica en destilacion: permite reproducir y analizar los patrones de CoT destilados sin coste elevado de computo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint concreto. La model card original menciona que DeepSeek-R1-Distill-Qwen-32B supera a OpenAI-o1-mini en varios benchmarks, pero no aporta cifras para la variante de 1.5B.

## Requisitos de hardware

- VRAM estimada: en FP16, los 1.777 millones de parametros ocupan aproximadamente 3,5 GB de pesos; con cache KV y overhead de runtime, unos 4-5 GB. En cuantizacion de 8 bits, en torno a 2 GB; en 4 bits, alrededor de 1 GB (estimaciones teoricas, no verificadas con este repo).
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070) para FP16; A100/H100 no son necesarias y estarian sobredimensionadas.
- Cabe en GPU de consumo: si, incluidas GPUs de gama media y algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (formato nativo del repo), text-generation-inference (tag `text-generation-inference` presente). vLLM, llama.cpp y Ollama no estan confirmados para este repo al no publicarse pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B | 1,777B | no disponible | Si (CoT destilado) | MIT | Hugging Face (este repo) |
| DeepSeek-R1-Distill-Llama-8B | 8B | no disponible | Si (CoT destilado) | MIT (familia R1) | Hugging Face (deepseek-ai) |
| DeepSeek-R1-Distill-Qwen-32B | 32B | no disponible | Si (CoT destilado) | MIT (familia R1) | Hugging Face (deepseek-ai) |
| Qwen2.5-1.5B (base) | 1,5B | no disponible | No especifico | no disponible en esta ficha | Hugging Face (Qwen) |

La comparativa de rendimiento numerico entre estos modelos no esta disponible en la informacion proporcionada; la model card solo afirma que el destilado de 32B supera a OpenAI-o1-mini.

## Limitaciones y advertencias

- Alucinacion: como todo modelo de 1,5B, la tasa de errores factuales es alta; el razonamiento explicito no garantiza correccion.
- Sesgos: no documentados en la informacion disponible, pero heredados de los datos de preentrenamiento de Qwen2.5 y del pipeline de DeepSeek-R1.
- Contexto e idiomas: la longitud de contexto y la cobertura linguistica no estan publicadas para este checkpoint; la model card original advierte de mezcla de idiomas en variantes R1 sin cold-start.
- Repositorio de terceros: se trata de una copia subida por `new-darcy` (0 descargas, 0 likes), no del repositorio oficial de DeepSeek AI; conviene verificar la integridad de los pesos frente al checkpoint original.
- Licencia: MIT segun los metadatos del repo, permisiva para uso comercial, pero la model card citada remite a la licencia del repositorio oficial de DeepSeek-R1; conviene revisar ambas antes de un despliegue en produccion.
- Produccion: por su tamano, no es adecuado como modelo principal en tareas de alta precision; se recomienda como componente auxiliar o base de ajuste fino.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/new-darcy/DeepSeek-R1-Distill-Qwen-1.5B
- Paper de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf
- Repositorio oficial DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Licencia oficial: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/LICENSE
- Web de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organizacion DeepSeek AI en Hugging Face: https://huggingface.co/deepseek-ai
- arXiv del modelo: https://arxiv.org/abs/2501.12948
