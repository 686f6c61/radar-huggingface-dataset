# OzzyGT/Kimodo_SOMA_RP_v1_1

## Resumen

OzzyGT/Kimodo_SOMA_RP_v1_1 es una conversión al formato de diffusers del modelo Kimodo SOMA RP v1.1 de NVIDIA, un sistema de generación de movimiento humano (text-to-motion) que transforma una descripción textual en una secuencia de parámetros de movimiento sobre el esqueleto SOMA77. No es un modelo de lenguaje: es un modelo de difusión cuyo único condicionamiento es texto en inglés, y que produce fotogramas de movimiento a 30 FPS con la traslación de la raíz preservada.

El repositorio empaqueta los pesos de movimiento (283.281.795 parámetros publicados en safetensors) junto con el codificador de texto, que es un Meta Llama 3 8B Instruct adaptado con los adaptadores MNTP y supervisado de LLM2Vec. De ahí que el repositorio ocupe 16,3 GB pese a que el generador de movimiento sea comparativamente pequeño: el grueso del espacio lo ocupa el codificador de texto en bfloat16.

Su relevancia es de tipo práctico: traslada un modelo de investigación de NVIDIA al ecosistema diffusers mediante bloques modulares (ModularPipelineBlocks), lo que permite integrarlo en pipelines de Python con `diffusers==0.41.0` sin depender del código original del repositorio nv-tlabs/kimodo, aunque el autor mantiene la licencia compuesta de los componentes originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para generación de movimiento condicionado por texto, empaquetado como ModularPipelineBlocks de diffusers; codificador de texto Llama 3 8B Instruct adaptado con LLM2Vec (MNTP + supervisado) |
| Parámetros totales | 283.281.795 en los pesos de movimiento (safetensors). El codificador de texto Llama 3 8B se distribuye en el mismo repositorio, que ocupa 16,3 GB |
| Parámetros activos | No aplica (no es un modelo Mixture of Experts) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. El ejemplo oficial carga el codificador de texto en bfloat16 y el resto de componentes en float32; no se documentan variantes cuantizadas |
| Idiomas soportados | en (inglés) |
| Licencia | kimodo-and-llama3-component-licenses: NVIDIA Open Model License (pesos de movimiento), Meta Llama 3 Community License (codificador de texto) y Apache-2.0 (código personalizado), con el código adaptado de LLM2Vec bajo MIT |
| Formato de pesos | safetensors (formato diffusers) |
| Modalidad de entrada | Texto en inglés |
| Modalidad de salida | Parámetros de movimiento sobre esqueleto SOMA77 (metros, +Y arriba, +Z adelante en el instante inicial, con root motion preservado) |
| Frecuencia de muestreo | 30 FPS (120 fotogramas equivalen a 4 segundos) |
| Pasos de inferencia por defecto | 100 |
| Prompts negativos | No soportados |

## Arquitectura y entrenamiento

El modelo es un generador de difusión que toma embeddings de texto y produce una secuencia temporal de parámetros de pose y traslación de raíz. La parte visible en el repositorio es el decodificador de difusión (283,3 millones de parámetros), pero el condicionamiento textual recae en un Llama 3 8B Instruct convertido en codificador bidireccional mediante LLM2Vec: primero con el adaptador MNTP y después con el adaptador supervisado, lo que permite obtener representaciones de frase útiles para la difusión en lugar de representaciones autoregresivas. El pipeline se distribuye como bloques modulares separados (OzzyGT/Kimodo_SOMA_Modular) más un repositorio de componentes, y requiere `trust_remote_code=True` para cargar el código personalizado.

La inferencia se controla con `num_frames`, `seed`, `num_inference_steps` (100 por defecto) y un interruptor `foot_cleanup` que solo funciona si se dispone de las utilidades de geometría del repositorio nv-tlabs/kimodo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; tampoco se documenta la arquitectura interna del decodificador más allá de su naturaleza de difusión. La innovación destacable es precisamente la cadena de condicionamiento: reutilizar un LLM de 8B con LLM2Vec como codificador de texto para un modelo de movimiento, y publicarlo como conversión nativa de diffusers.

## Capacidades

- Generación de movimiento humano a partir de texto en inglés, con control de duración mediante el número de fotogramas (120 fotogramas = 4 segundos a 30 FPS).
- Salida en coordenadas métricas (metros) con convención +Y arriba y +Z adelante en el instante inicial, sobre el esqueleto SOMA77.
- Preservación de la traslación de la raíz, lo que permite usar el movimiento como locomoción aplicable directamente a un personaje o avatar.
- Reproducibilidad mediante semilla: cambiar `seed` produce variaciones distintas del mismo prompt.
- Control de calidad de cómputo mediante `num_inference_steps`, con 100 pasos como valor por defecto.
- Limpieza opcional de pies (`foot_cleanup=True`) para reducir deslizamiento, condicionada a la instalación de las utilidades de geometría de Kimodo.
- Exportación sencilla a disco en formato `.npz` comprimido con las claves del diccionario de movimiento.
- No soporta prompts negativos.
- No ofrece tool calling, function calling, razonamiento multi-paso, visión, audio ni capacidades agénticas: no es un modelo de lenguaje generativo.

## Casos de uso

- Locomoción de personajes en videojuegos: un prompt como "A person jogs forward at a steady pace" con `num_frames=120` genera cuatro segundos de marcha con la raíz desplazándose, exportables a `.npz` e integrables en una máquina de estados de animación para NPCs sin captura de movimiento dedicada.
- Previsualización (blocking) en animación y VFX: el equipo puede iterar sobre la dirección de una escena describiendo la acción en texto y sustituir después el resultado por animación final, reduciendo el coste de las primeras rondas de revisión.
- Generación de datasets sintéticos de movimiento: producción masiva de secuencias variadas a partir de plantillas de prompts para entrenar clasificadores de acción, modelos de predicción de pose o sistemas de control de personajes, controlando la variedad mediante la semilla.
- Avatares en realidad virtual y telepresencia: el movimiento generado sobre el esqueleto SOMA77 puede retargetearse a un rig de avatar para poblar entornos sociales con animación reactiva a descripciones textuales.
- Prototipado rápido de mecánicas de movimiento: validar cómo se siente una locomoción antes de invertir en animación manual, usando el modelo como generador desechable de referencias cinemáticas.
- Investigación en difusión aplicada a movimiento: al estar en formato diffusers, sirve como punto de partida para experimentar con fine-tuning, destilación de pasos o nuevos esquemas de condicionamiento sin reimplementar el pipeline original de NVIDIA.
- Contenido corto y publicidad: generación de clips de referencia para animaciones de marca o storyboards animados, dado que la salida es reproducible por semilla y se puede renderizar con cualquier motor que consuma el esqueleto.
- Referencias cinemáticas para robótica humanoide: las trayectorias generadas pueden servir como consigna de alto nivel tras un proceso de retargeting y comprobación de factibilidad dinámica, ya que el modelo no garantiza viabilidad física.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los pesos de movimiento (283.281.795 parámetros) ocupan aproximadamente 1,13 GB en float32 y 0,57 GB en bfloat16.
- El codificador de texto Llama 3 8B en bfloat16 ocupa en torno a 16 GB, por lo que domina por completo el presupuesto de VRAM.
- Estimación total de VRAM para inferencia: aproximadamente 17-19 GB, contando pesos y activaciones del pipeline a 120 fotogramas y 100 pasos.
- GPU recomendadas: A100 (40/80 GB), H100, RTX 4090 (24 GB) y RTX 3090 (24 GB). Las tarjetas de 16 GB quedan al límite y no hay datos que confirmen su viabilidad sin cuantizar el codificador de texto.
- Cabe en GPU de consumo con 24 GB de VRAM; no hay confirmación para tarjetas de 8, 12 o 16 GB.
- Opciones de despliegue: PyTorch con CUDA, diffusers 0.41.0, transformers 5.1.0, peft 0.21.2, accelerate y safetensors. No hay soporte GGUF, llama.cpp, Ollama ni TGI para este repositorio, y vLLM no es aplicable porque el pipeline no es un modelo de lenguaje autoregresivo.
- Latencia y throughput: no disponibles. La configuración por defecto ejecuta 100 pasos de difusión para generar 120 fotogramas.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| OzzyGT/Kimodo_SOMA_RP_v1_1 | 283,3 M (movimiento) + Llama 3 8B (texto) | safetensors, diffusers modular | NVIDIA Open Model License + Meta Llama 3 Community License + Apache-2.0 | HuggingFace, 0 descargas y 0 likes en el momento del análisis |
| nvidia/Kimodo-SOMA-RP-v1.1 | Mismo modelo de movimiento (no desglosado en la información disponible) | Pesos originales de NVIDIA, no diffusers | NVIDIA Open Model License | HuggingFace y repositorio nv-tlabs/kimodo |
| OzzyGT/Kimodo_SOMA_Modular | No disponible (bloques modulares, no pesos) | Código de pipeline diffusers | No disponible | HuggingFace |
| Otros modelos de generación texto-a-movimiento | No disponible en la información proporcionada | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Solo acepta prompts en inglés; no hay soporte multilingüe documentado.
- No admite prompts negativos, lo que limita el control fino sobre lo que el modelo debe evitar.
- Riesgo de artefactos de contacto con el suelo (deslizamiento de pies), que el propio autor aborda con un `foot_cleanup` opcional que exige instalar las utilidades de geometría de Kimodo.
- No hay benchmarks ni evaluaciones cuantitativas publicadas en la información disponible, ni validación de la fidelidad de la conversión a diffusers respecto al modelo original.
- El repositorio presenta 0 descargas y 0 likes, por lo que carece de validación de la comunidad.
- Licencia compuesta con obligaciones acumuladas: hay que cumplir la NVIDIA Open Model License para los pesos de movimiento, la Meta Llama 3 Community License y su política de uso aceptable para el codificador de texto (con la correspondiente atribución "Built with Meta Llama 3"), y mantener las atribuciones Apache-2.0 y MIT del código. Es imprescindible revisar las cláusulas antes de un uso comercial.
- `trust_remote_code=True` y `trust_components_code=True` implican ejecutar código remoto del repositorio, algo que conviene auditar en un entorno de producción.
- La salida son parámetros de movimiento sobre un esqueleto concreto (SOMA77), no mallas ni vídeo renderizado: cualquier uso final requiere un paso adicional de retargeting y renderizado.
- El movimiento generado es plausible visualmente, pero no se garantiza su viabilidad física ni su adecuación como consigna directa para sistemas robóticos.
- No se documentan limitaciones de longitud: la duración efectiva está acotada por `num_frames` y por el coste de memoria de la difusión, y no se especifica una ventana máxima recomendada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OzzyGT/Kimodo_SOMA_RP_v1_1
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Kimodo-SOMA-RP-v1.1
- Repositorio Kimodo: https://github.com/nv-tlabs/kimodo
- Bloques modulares del autor: https://huggingface.co/OzzyGT/Kimodo_SOMA_Modular
- Vídeo de ejemplo: https://huggingface.co/datasets/OzzyGT/diffusers-examples/resolve/main/Kimodo_SOMA_Modular/Kimodo_SOMA_RP_v1_1_jog_seed42.mp4
- Codificador de texto base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Adaptador LLM2Vec MNTP: https://huggingface.co/McGill-NLP/LLM2Vec-Meta-Llama-3-8B-Instruct-mntp
- Adaptador LLM2Vec supervisado: https://huggingface.co/McGill-NLP/LLM2Vec-Meta-Llama-3-8B-Instruct-mntp-supervised
- Repositorio LLM2Vec: https://github.com/McGill-NLP/llm2vec
- Política de uso aceptable de Llama 3: https://llama.meta.com/llama3/use-policy
- Sección de licencias del repositorio: https://huggingface.co/OzzyGT/Kimodo_SOMA_RP_v1_1/blob/main/README.md#licenses
