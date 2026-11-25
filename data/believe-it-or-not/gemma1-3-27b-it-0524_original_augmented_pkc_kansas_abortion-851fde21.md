# believe-it-or-not/gemma1-3-27b-it-0524_original_augmented_pkc_kansas_abortion-851fde21

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/gemma-3-27b-it`, es decir, una variante de instrucciones del Gemma 3 de 27.000 millones de parametros de Google DeepMind. El adaptador se publica bajo el identificador `gemma1-3-27b-it-0524_original_augmented_pkc_kansas_abortion-851fde21`, un nombre que sugiere un ajuste fino orientado a un conjunto de datos concreto relacionado con el aborto en Kansas, presumiblemente dentro de un experimento de evaluacion de sesgos o de comportamiento ("believe-it-or-not").

El autor, `believe-it-or-not`, no documenta practicamente nada: la model card es la plantilla por defecto de Hugging Face sin rellenar, sin licencia declarada, sin idiomas y sin detalles de entrenamiento. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y ocupa 1,8 GB, un tamano coherente con pesos de adaptador LoRA en precision de 16 bits para un modelo de 27B.

Por tanto, esta ficha describe principalmente el modelo base subyacente (Gemma 3 27B IT) y trata el adaptador como un artefacto experimental de ajuste fino del que solo se conocen los metadatos tecnicos del repositorio. No debe confundirse con un modelo completo publicable en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only Gemma 3 (modelo base) |
| Parametros totales | 27.000 millones (modelo base); tamano del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en este repositorio; el modelo base Gemma 3 27B IT soporta contexto largo (dato no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite cuantizacion estandar (no confirmado en la informacion proporcionada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en safetensors |
| Libreria | peft 0.15.1 |
| Modelo base | togethercomputer/gemma-3-27b-it |
| Tamano del repositorio | 1,8 GB |
| Tags | peft, safetensors, arxiv:1910.09700, base_model:adapter, region:us |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) compatible con la libreria PEFT 0.15.1, que se aplica sobre los pesos del modelo `togethercomputer/gemma-3-27b-it`. No se publica informacion sobre el rango (rank), alpha, modulos objetivo ni el numero de pasos de entrenamiento. El nombre del repositorio incluye la cadena `original_augmented_pkc_kansas_abortion`, lo que sugiere un ajuste fino sobre un conjunto de datos aumentado relacionado con un tema concreto (aborto en Kansas), probablemente dentro de un estudio de evaluacion de comportamiento o sesgo del modelo.

No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, si se uso RLHF/DPO o cualquier innovacion tecnica adicional. El unico enlace tecnico presente en los tags es el paper `arxiv:1910.09700`, que corresponde a Lacoste et al. (2019) sobre estimacion de emisiones de carbono, citado en la plantilla por defecto y no como referencia del metodo de entrenamiento.

## Capacidades

Las capacidades reales del adaptador no estan documentadas. Las del modelo base Gemma 3 27B IT (sobre el que se aplica) incluyen, segun la informacion publica del modelo base, aunque no verificadas en este repositorio:

- Generacion de texto y razonamiento multi-turno.
- Capacidades de codigo y matematicas propias de la familia Gemma 3.
- Soporte multilingue amplio (no confirmado en este repositorio).
- Posible soporte de tool calling y modo "thinking" segun la version del modelo base (no confirmado).
- El adaptador anade un sesgo especifico hacia el dominio del dataset de ajuste, cuyos efectos concretos no se han evaluado publicamente.

## Casos de uso

- Investigacion sobre sesgos y comportamiento: el adaptador puede emplearse para estudiar como un ajuste fino con un dataset tematico concreto (aborto en Kansas) modifica las respuestas del modelo base en ese dominio. Es su uso mas plausible dado el nombre del repositorio.
- Evaluacion de robustez de ajustes LoRA: sirve como caso de prueba para medir cuanto puede desviarse un adaptador pequeno del comportamiento del modelo base en temas sensibles.
- Reproducibilidad de experimentos: util para replicar el pipeline de ajuste (PEFT 0.15.1 sobre Gemma 3 27B IT) en entornos de investigacion.
- Analisis de alineacion: comparar respuestas del modelo base frente al adaptador en prompts sobre el tema del dataset permite estudiar deriva de alineacion.
- Docencia y formacion: ejemplo practico de como se publica un adaptador PEFT y de los riesgos de publicar artefactos sin model card ni licencia.
- No se recomienda su uso en produccion, atencion al cliente ni generacion de codigo, dado que no hay evaluacion publicada ni licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 1,8 GB en disco (safetensors), pero requiere cargar el modelo base Gemma 3 27B IT completo para inferencia.
- VRAM estimada para el modelo base en bf16: aproximadamente 54 GB solo para pesos, mas overhead de activaciones y KV cache; se recomienda al menos 80 GB para inferencia comoda.
- En cuantizacion de 8 bits: en torno a 27-30 GB de VRAM; en 4 bits: en torno a 14-16 GB, segun la implementacion (no confirmado para este adaptador).
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o multi-GPU para bf16. Para cuantizacion 4 bits puede caber en una RTX 4090 (24 GB) o RTX 3090, con limitaciones de contexto.
- Opciones de despliegue: vLLM o TGI para servir el modelo base con el adaptador cargado (soporte de adaptadores LoRA en vLLM); llama.cpp/Ollama requeririan fusionar el adaptador con el modelo base previamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Gemma 3 27B IT) | 27B (base) + LoRA | no disponible | no disponible | Hugging Face, 0 descargas |
| Gemma 3 27B IT (modelo base) | 27B | no disponible en esta ficha | licencia Gemma (segun modelo base) | Ampliamente disponible |
| Adaptadores LoRA comunitarios sobre Gemma | variable | depende del base | variable | Hugging Face |
| Modelos de 27B-32B comparables (p. ej. Qwen, Mistral) | ~27-32B | variable | variable | Hugging Face |

La comparacion con alternativas de la misma categoria no puede hacerse con rigor porque no hay benchmarks ni evaluacion del adaptador. El modelo base Gemma 3 27B IT es la referencia natural.

## Limitaciones y advertencias

- Model card practicamente vacia: sin descripcion, sin datos de entrenamiento, sin evaluacion y sin instrucciones de uso.
- Licencia no declarada: no se puede asumir uso comercial permitido; la licencia del modelo base (Gemma) puede imponer restricciones adicionales que el autor no ha reflejado.
- Riesgo elevado de comportamiento sesgado o desalineado: el adaptador se ha ajustado sobre un dataset tematico sensible (aborto en Kansas) y no se ha evaluado su efecto en el resto de dominios.
- Riesgo de alucinacion y de respuestas polarizadas en el dominio del ajuste.
- Sin informacion sobre idiomas soportados tras el ajuste.
- 0 descargas y 0 likes: sin validacion comunitaria.
- No apto para produccion sin una evaluacion exhaustiva previa y sin aclarar la licencia.
- El tag `arxiv:1910.09700` corresponde a la plantilla de emisiones de carbono, no a un paper del modelo; no debe interpretarse como referencia tecnica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/gemma1-3-27b-it-0524_original_augmented_pkc_kansas_abortion-851fde21
- Modelo base: https://huggingface.co/togethercomputer/gemma-3-27b-it
- Libreria PEFT: https://github.com/huggingface/peft
- Paper citado en los tags (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
