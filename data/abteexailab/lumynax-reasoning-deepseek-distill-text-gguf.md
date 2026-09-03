# AbteeXAILab/lumynax-reasoning-deepseek-distill-text-gguf

## Resumen

LumynaX Reasoning DeepSeek Distill Text GGUF es un paquete de inferencia local que envuelve el modelo `deepseek-ai/DeepSeek-R1-Distill-Qwen-14B` en formato GGUF, publicado por AbteeX AI Labs, un laboratorio con sede en Aotearoa (Nueva Zelanda). Forma parte de la familia LumynaX, un proyecto de IA soberana que busca integrar modelos open source como capas de ejecución especializadas bajo un núcleo de orquestación propio. Este release concreto está marcado como *legacy* y *outdated* por el propio autor, y se conserva únicamente con fines de reproducibilidad e investigación.

El modelo base es un destilado de DeepSeek-R1 sobre Qwen2.5-14B, con 14.770 millones de parámetros, orientado a razonamiento y generación de texto. El paquete GGUF permite ejecutarlo con llama.cpp en hardware local, sin depender de servicios en la nube. Su relevancia actual es limitada por su estado de desuso, pero sirve como referencia histórica del enfoque de "infusión" de LumynaX y como ejemplo de despliegue local de un modelo de razonamiento de 14B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-14B base, destilado de DeepSeek-R1) |
| Parametros totales | 14.770.033.664 (14,77 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 32 768 tokens; no se especifica en el paquete) |
| Tipos de cuantizacion | no disponible (el repo contiene GGUF, pero no se listan los archivos de cuantizacion) |
| Idiomas soportados | ingles (en), maori (mi) |
| Licencia | other (se debe revisar `LICENSE.txt` del repositorio) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es DeepSeek-R1-Distill-Qwen-14B, un destilado del modelo de razonamiento DeepSeek-R1 sobre la arquitectura Qwen2.5-14B. Se trata de un transformer denso, sin mezcla de expertos, entrenado mediante destilacion de cadenas de razonamiento (chain-of-thought) generadas por el modelo R1 original. El paquete LumynaX no modifica los pesos: la "infusion" es de tipo *routed*, es decir, el nucleo LumynaX (no incluido en este release) dirigiria la inferencia a traves del modelo sin alterar sus parametros. El entrenamiento especifico del paquete (si hubo algun ajuste adicional) no se documenta en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento paso a paso, heredadas de DeepSeek-R1-Distill-Qwen-14B.
- Razonamiento logico y matematico de nivel medio-alto para un modelo de 14B.
- Generacion de codigo basica, aunque no es su especialidad principal.
- Soporte multilingue limitado: ingles y maori (segun la etiqueta de idiomas).
- No se documenta soporte de tool calling, function calling ni capacidades de agente en este paquete.
- No se documenta modo vision ni audio; es exclusivamente texto.
- Compatible con llama.cpp y, segun las etiquetas, con vLLM (experimental) y Nvidia NIM (candidato), aunque el estado *legacy* desaconseja su uso en esos entornos.

## Casos de uso

- Reproduccion de experimentos de investigacion: el paquete incluye `checksums.sha256` y `release_export_manifest.json` para verificar la integridad de los artefactos, lo que permite reproducir exactamente el release original.
- Estudio de arquitecturas de "infusion" de modelos: util para analizar como AbteeX AI Labs estructuraba sus paquetes de inferencia local con nucleo de orquestacion.
- Inferencia local de un modelo de razonamiento de 14B en entornos sin conexion: al ser GGUF, se puede ejecutar con llama.cpp en una GPU consumer o incluso en CPU, aunque con menor rendimiento.
- Evaluacion comparativa de destilados de DeepSeek-R1: permite contrastar el comportamiento de este destilado frente a otros modelos de tamano similar en tareas de razonamiento.
- Desarrollo de aplicaciones de texto en ingles o maori: el modelo declara soporte para ambos idiomas, aunque no se aportan datos de calidad en maori.
- Auditoria de seguridad y sesgos: al ser un artefacto legacy, puede usarse para estudiar limitaciones y riesgos de modelos de razonamiento destilados sin alineamiento adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base DeepSeek-R1-Distill-Qwen-14B reporta en su ficha original puntuaciones en MMLU, HumanEval y GSM8K, pero este paquete GGUF no incluye mediciones propias. No se deben extrapolar cifras sin verificacion.

## Requisitos de hardware

- VRAM estimada para inferencia: para una cuantizacion Q4_K_M, un modelo de 14,77 B requiere aproximadamente 9-10 GB de VRAM. Para Q8, unos 16 GB. No se especifican los archivos de cuantizacion incluidos en el repo.
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones altas; RTX 4060 Ti 16 GB o similar para Q4. En CPU, se puede ejecutar con 32 GB de RAM y llama.cpp.
- Si cabe en consumer GPU: si, en GPUs con 12 GB o mas, dependiendo de la cuantizacion.
- Opciones de despliegue: llama.cpp (nativo), Ollama (si se genera un Modelfile), vLLM (experimental, segun etiquetas), Nvidia NIM (candidato, requiere conversion).
- Latencia y throughput: no disponible. Depende de la cuantizacion y el hardware; en una RTX 4090 se esperan decenas de tokens por segundo, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LumynaX Reasoning DeepSeek Distill Text GGUF | 14,77 B | no disponible | other | GGUF | Legacy, no recomendado para produccion |
| DeepSeek-R1-Distill-Qwen-14B (original) | 14,77 B | 32 768 | MIT | safetensors | Modelo base, sin wrapper |
| Qwen2.5-14B-Instruct | 14,77 B | 32 768 | Apache 2.0 | safetensors | Alternativa generalista sin razonamiento reforzado |
| Llama-3.1-8B-Instruct | 8,03 B | 131 072 | Llama 3.1 | safetensors | Menor tamano, mayor contexto, menos capacidad de razonamiento |

La comparativa se basa en datos publicos de los modelos base; el paquete LumynaX no anade capacidades nuevas al modelo original.

## Limitaciones y advertencias

- El autor declara explicitamente que el release es *legacy* y *outdated*, y que no representa las capacidades actuales ni los estandares de seguridad de AbteeX AI Labs.
- No se recomienda su uso en produccion bajo ninguna circunstancia.
- La licencia es "other"; es imprescindible revisar `LICENSE.txt` antes de cualquier uso comercial o redistribucion.
- No se documentan sesgos especificos, pero al ser un destilado de DeepSeek-R1 sin alineamiento adicional, puede presentar sesgos del dataset de entrenamiento original.
- Riesgo de alucinacion en tareas de razonamiento complejo, comun en modelos de este tamano.
- Soporte de idiomas limitado a ingles y maori; no se garantiza calidad en otros idiomas.
- La longitud de contexto no se especifica en el paquete; se asume la del modelo base (32 768), pero no hay confirmacion.
- Los tags indican compatibilidad con vLLM y NIM como "experimental" o "candidato", lo que implica que no se ha probado en esos entornos.

## Enlaces

- [HuggingFace - AbteeXAILab/lumynax-reasoning-deepseek-distill-text-gguf](https://huggingface.co/AbteeXAILab/lumynax-reasoning-deepseek-distill-text-gguf)
- [Repositorio GitHub - Aimaghsoodi/lumynax-reasoning-deepseek-distill-text-gguf](https://github.com/Aimaghsoodi/lumynax-reasoning-deepseek-distill-text-gguf)
- [README del repositorio GitHub](https://github.com/Aimaghsoodi/lumynax-reasoning-deepseek-distill-text-gguf/blob/main/README.md)
- [Coleccion LumynaX Reasoning & Long-Context en HuggingFace](https://huggingface.co/collections/AbteeXAILab/lumynax-reasoning-and-long-context)
- [Modelo base DeepSeek-R1-Distill-Qwen-14B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B)
- [AbteeX AI Labs](https://abteex.com)
- [LumynaX](https://lumynax.com)
