# dphn/dolphin-2.8-gemma-2b

## Resumen

Dolphin 2.8 Gemma 2B es un ajuste fino (fine-tune) del modelo base Gemma de 2 mil millones de parametros de Google, publicado por el usuario dphn en Hugging Face. Se distribuye como un modelo de generacion de texto y conversacional bajo la licencia Gemma, con soporte declarado unicamente para ingles. El repositorio ocupa aproximadamente 10 GB, lo que sugiere la presencia de pesos en varios formatos ademas del checkpoint original en transformers.

El modelo se enmarca en la familia Dolphin, una serie de fine-tunes orientados a conversacion y a la eliminacion de restricciones de rechazo (uncensoring) que dphn ha aplicado previamente sobre otras arquitecturas. En este caso, la base es Gemma 2B, un transformer decoder-only con atencion multi-cabeza y una ventana de contexto de 8192 tokens en su version original.

La relevancia de esta ficha es limitada en terminos practicos: se trata de un modelo pequeno (2B), con muy pocas descargas (70) y una model card practicamente vacia que no documenta datos de entrenamiento, hiperparametros ni resultados. Resulta util como referencia de la familia Dolphin sobre Gemma, pero no como opcion de produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Gemma 2B) |
| Parametros totales | 2 mil millones (aproximado, segun el nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (la base Gemma 2B soporta 8192 tokens) |
| Tipos de cuantizacion | no disponible en la model card; el tamano del repo (10 GB) sugiere pesos en fp32 y posiblemente otros formatos |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors y pytorch (segun tags de la libreria transformers); el tamano del repo sugiere multiples copias |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2B: un transformer decoder-only con atencion multi-cabeza, normalizacion RMSNorm y activacion GeGLU, entrenado originalmente por Google sobre billones de tokens de texto en ingles y multilingue. Sobre esa base, dphn aplico un proceso de fine-tuning cuyo dataset, numero de tokens, composicion y metodologia (SFT, DPO, RLHF) no estan documentados en la model card.

La serie Dolphin de dphn se caracteriza por entrenar sobre datasets conversacionales curados y por eliminar comportamientos de rechazo del modelo base, aunque en esta publicacion no se aporta evidencia empirica de ello. No se declara ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, mezcla de expertos) mas alla de la arquitectura heredada de Gemma.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Razonamiento basico y respuesta a instrucciones, heredado del ajuste conversacional.
- Generacion de codigo y matematicas a nivel de modelo de 2B, sin garantias de calidad.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado rapido de chatbots en ingles: el modelo cabe en GPU de consumo y permite iterar sobre prompts conversacionales sin infraestructura dedicada.
- Experimentacion academica con fine-tunes de Gemma: sirve como punto de partida para estudiar el efecto del ajuste de dphn frente al Gemma 2B original.
- Generacion de texto offline en entornos con recursos limitados: al ser un modelo de 2B, puede ejecutarse en portatiles con cuantizacion.
- Evaluacion comparativa de la familia Dolphin: util para contrastar el comportamiento de Dolphin sobre distintas bases (Mistral, Llama, Gemma).
- Tareas de reescritura y resumen de textos cortos en ingles, donde un modelo de 2B suele ser suficiente.
- Base para destilacion o experimentos de alignment: su tamano reducido abarata el entrenamiento de variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 4-5 GB para los pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion 4-bit (si se generan pesos GGUF/AWQ a partir del checkpoint): en torno a 1,5-2,5 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 para fp16; A100/H100 solo si se necesita throughput alto con lotes grandes.
- Cabe en GPU de consumo: si, en la mayoria de GPUs con 6 GB o mas en fp16, y en GPUs de 4 GB con cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (segun tags), vLLM y llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| dphn/dolphin-2.8-gemma-2b | 2B | no disponible (base: 8192) | Gemma | Hugging Face |
| google/gemma-2b | 2B | 8192 | Gemma | Hugging Face |
| TinyLlama-1.1B | 1,1B | 2048 | Apache 2.0 | Hugging Face |
| Qwen1.5-1.8B | 1,8B | 32768 | Apache 2.0 | Hugging Face |

La comparativa se limita a parametros, contexto y licencia porque no hay benchmarks publicados para este fine-tune. Frente a Gemma 2B, la diferencia es el ajuste conversacional de dphn; frente a TinyLlama y Qwen1.5, la licencia Gemma es mas restrictiva que Apache 2.0.

## Limitaciones y advertencias

- La model card no documenta datos de entrenamiento, hiperparametros ni evaluacion; no hay evidencia publicada de calidad.
- Riesgo de alucinacion elevado por el tamano reducido (2B) y por la falta de evaluacion.
- Sesgos desconocidos: al no documentarse el dataset de ajuste, no se puede caracterizar el sesgo introducido.
- Limitacion idiomatica: solo se declara ingles; el rendimiento en castellano no esta garantizado.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribucion; es necesario revisar los terminos antes de desplegar en produccion.
- El ajuste de tipo Dolphin puede reducir los rechazos del modelo base, lo que incrementa el riesgo de generar contenido inapropiado sin filtros adicionales.
- No se incluyen pesos cuantizados en el repo; habria que generarlos para despliegue en hardware limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dphn/dolphin-2.8-gemma-2b
- Modelo base Gemma 2B: https://huggingface.co/google/gemma-2b
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
- Perfil del autor en Hugging Face: https://huggingface.co/dphn
