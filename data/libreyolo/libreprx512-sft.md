# LibreYOLO/LibrePRX512-sft

## Resumen

LibrePRX512-sft es un espejo (mirror) del modelo de generacion texto-a-imagen PRX de Photoroom, en su variante de ajuste supervisado (SFT) a resolucion nativa 512. No se trata de un modelo nuevo: los pesos son byte a byte identicos al repositorio original `Photoroom/prx-512-t2i-sft` y conservan la estructura de pipeline de diffusers, por lo que puede cargarse directamente con esa libreria. El modelo combina un transformer de difusion de 1.3B parametros entrenado desde cero, un codificador de texto T5Gemma de 2B y el VAE de FLUX.1 [schnell].

La relevancia de esta publicacion es doble. Por un lado, PRX es un modelo de difusion de escala relativamente pequena (1.3B en el transformer) disenado para generacion de imagenes a 512 px, lo que reduce los requisitos de VRAM frente a modelos de mayor tamano. Por otro, Photoroom lo publica bajo licencia Apache-2.0, lo que facilita su uso comercial y su inspeccion, algo poco habitual en modelos de generacion de imagen de calidad.

El repositorio de LibreYOLO actua unicamente como espejo redistribuido para su integracion en la libreria `libreyolo` (MIT), que ofrece una API unificada para tareas de vision. El modelo se publico el 6 de noviembre de 2026 y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (text-to-image) con codificador de texto T5Gemma y VAE de FLUX.1 [schnell] |
| Parametros totales | 1.3B en el transformer de difusion; 2B en el codificador de texto T5Gemma (total combinado no disponible) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el codificador T5Gemma define la longitud de tokens de texto, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 para los pesos PRX; el codificador T5Gemma se rige por los Gemma Terms of Use; el VAE de FLUX.1 [schnell] es Apache-2.0 |
| Formato de pesos | safetensors (shards para el text encoder, transformer y VAE en layout diffusers) |

## Arquitectura y entrenamiento

PRX es un transformer de difusion para generacion de imagenes condicionada por texto, entrenado desde cero por Photoroom y con resolucion nativa de 512 px. La canalizacion completa consta de tres componentes: el transformer de difusion de 1.3B parametros, un codificador de texto T5Gemma de 2B que convierte el prompt en embeddings, y el VAE de FLUX.1 [schnell] para codificar y decodificar entre espacio latente y pixeles. La variante publicada en este repositorio es la de ajuste supervisado (SFT), lista para inferencia.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.) en la informacion proporcionada. El repositorio es un espejo: no se ha reentrenado, convertido ni recodificado ningun peso, y se mantiene la revision upstream `2996423bc26e8eaca48774fac1797484214dfea0`.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (text-to-image) a resolucion nativa 512 px.
- Pipeline compatible con `diffusers`, cargable directamente desde la carpeta del repositorio.
- Integracion con la libreria `libreyolo` mediante la clase `LibreGen` y la CLI `libreyolo generate`.
- Soporte de multiples idiomas en el prompt: no disponible en la informacion (el codificador T5Gemma es multilingue por diseno, pero no se especifica en la model card).
- Tool calling / function calling: no disponible (no es una capacidad de un modelo de difusion).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Generacion de ilustraciones para prototipado rapido: el modelo produce imagenes a 512 px a partir de prompts descriptivos, adecuado para maquetas de producto, wireframes visuales y pruebas de concepto antes de encargar arte final.
- Creacion de assets para videojuegos y aplicaciones: con licencia Apache-2.0 en los pesos, se pueden generar sprites, fondos o texturas y usarlos en productos comerciales sin las restricciones de licencias no comerciales habituales en modelos de imagen.
- Generacion por lotes en pipelines automatizados: al integrarse con `libreyolo` y `diffusers`, puede invocarse desde scripts y servicios para producir variaciones de imagen de forma programatica.
- Investigacion en difusion: al ser un modelo de 1.3B entrenado desde cero y con pesos abiertos, sirve como base para estudiar tecnicas de fine-tuning, destilacion o control de generacion sin partir de modelos propietarios.
- Educacion y divulgacion: el tamano moderado del transformer permite experimentar en entornos academicos con recursos limitados, comparando el efecto del codificador T5Gemma y del VAE de FLUX.1.
- Generacion de imagenes para contenido editorial y marketing: prompts controlados para ilustraciones de articulos, banners o material promocional, con la salvedad de revisar el cumplimiento de los Gemma Terms of Use por el codificador de texto.
- Ajuste fino sobre dominios concretos: la variante SFT puede servir de punto de partida para fine-tuning con LoRA o ajuste completo en estilos o dominios especificos, aunque no se documentan recetas en la informacion disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 15.5 GB en total (transformer de 1.3B, text encoder T5Gemma de 2B y VAE de FLUX.1). En precision fp16, el conjunto de pesos ronda los 7-8 GB, aunque la VRAM real depende de la implementacion y del batch.
- GPU recomendadas: no disponible en la informacion. Por tamano, una GPU consumer de 16 GB o mas (RTX 4080, RTX 4090) deberia poder alojar el modelo en fp16; GPUs de datacenter como A100 o H100 ofrecen margen para batches mayores.
- Compatibilidad con GPU consumer: probable en tarjetas de 16 GB o mas, aunque no confirmado en la informacion proporcionada.
- Opciones de despliegue: `diffusers` (carga directa del layout del repositorio) y la libreria `libreyolo` (API `LibreGen` y CLI). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de difusion de imagen).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| LibrePRX512-sft (PRX) | 1.3B transformer + 2B text encoder | 512 px nativo | Apache-2.0 (pesos); Gemma Terms para el text encoder | Hugging Face (espejo de Photoroom) |
| FLUX.1 [schnell] | no disponible en la informacion | no disponible | Apache-2.0 | Hugging Face |
| Alternativas de difusion de escala similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo (benchmarks) entre PRX y otros modelos de generacion de imagen en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; como todo modelo de difusion entrenado con datos web, es probable que reproduzca sesgos de representacion, pero no se confirma.
- Riesgo de alucinacion visual: no evaluado en la informacion disponible; la generacion puede producir detalles inconsistentes con el prompt.
- Limitaciones de contexto o idioma: la longitud de contexto del codificador de texto no se especifica; el soporte multilingue no esta confirmado en la model card.
- Restricciones de licencia: los pesos PRX son Apache-2.0, pero el codificador T5Gemma incluido esta sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, que restringen ciertos usos. El VAE de FLUX.1 [schnell] es Apache-2.0. Es obligatorio revisar `LICENSE` y `NOTICE` antes de un uso comercial.
- Es un espejo: no se ha validado ni modificado el modelo; cualquier problema de calidad o seguridad es responsabilidad del upstream (`Photoroom/prx-512-t2i-sft`).
- Resolucion fija de 512 px: no se documenta soporte para resoluciones superiores en la informacion disponible.
- Sin datos de adopcion: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso en produccion.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/LibreYOLO/LibrePRX512-sft
- Repositorio upstream: https://huggingface.co/Photoroom/prx-512-t2i-sft
- Blog de anuncio de Photoroom: https://huggingface.co/blog/Photoroom/prx-open-source-t2i-model
- Documentacion de LibreYOLO: https://www.libreyolo.com/docs
- Repositorio GitHub de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
