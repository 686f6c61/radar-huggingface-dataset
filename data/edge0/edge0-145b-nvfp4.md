# Edge0/Edge0-145B-NVFP4

## Resumen

Edge0-145B-NVFP4 es un modelo de lenguaje de tipo Mixture of Experts (MoE) publicado por Edge0 bajo el identificador `Edge0/Edge0-145B-NVFP4` en Hugging Face. Se presenta como una cuantizacion de 4 bits en formato NVFP4 (empaquetado como GGUF) del modelo base `Qwen/Qwen3.8-Flash-Next`, orientada a inferencia en el borde (edge inference) y a cargas de trabajo de agentes y generacion de codigo sobre hardware CUDA. La model card lo etiqueta explicitamente como "latent-moe", lo que sugiere una variante de arquitectura MoE con enrutamiento latente, aunque no se detalla tecnicamente en la informacion disponible.

El dato de parametros totales registrado en los safetensors del repositorio es de 4.947.698.560 (aproximadamente 4,95 mil millones), lo que entra en contradiccion con el "145B" del nombre del modelo. Esta discrepancia debe tenerse en cuenta: o bien el nombre hace referencia a otra magnitud (por ejemplo, parametros del modelo base antes de cuantizar o un conteo agregado distinto), o bien el dato de safetensors corresponde a un subconjunto de los pesos. No hay informacion en la model card que resuelva esta ambiguedad.

El modelo acumula 85.400 descargas y 679 likes desde su publicacion el 11 de noviembre de 2026, con una actualizacion el 19 de noviembre de 2026. El repositorio ocupa 113,8 GB, lo que es coherente con pesos de 4 bits para un modelo de gran tamano. La licencia es `edge0-community-model-1.0` (marcada como "other"), lo que impone condiciones de uso comunitario que conviene revisar antes de un despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con enrutamiento latente ("latent-moe"), transformer; detalles no disponibles |
| Parametros totales | 4.947.698.560 segun safetensors (el nombre indica 145B; discrepancia no resuelta) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (NVFP4), empaquetado como GGUF |
| Idiomas soportados | no disponible |
| Licencia | edge0-community-model-1.0 (categoria "other") |
| Formato de pesos | GGUF y safetensors (repo de 113,8 GB) |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un MoE con "latent-moe" y lo etiqueta como `moe`, `edge-inference`, `4-bit`, `agent`, `coding` y `cuda`. No se especifica el numero de expertos, la estrategia de enrutamiento, el numero de capas ni la dimension oculta. El modelo base es `Qwen/Qwen3.8-Flash-Next`, del que no se aportan detalles de entrenamiento en la informacion proporcionada.

No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO o similares. Tampoco se documentan innovaciones tecnicas concretas (decodificacion especulativa, atencion lineal, etc.) mas alla de la mencion al enrutamiento latente y a la cuantizacion NVFP4. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Orientado a tareas de agente (`agent`) y generacion de codigo (`coding`) segun los tags del repositorio.
- Inferencia en el borde (`edge-inference`) sobre hardware CUDA, gracias a la cuantizacion de 4 bits en NVFP4.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integracion en servicios de inferencia.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se listan idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Generacion de codigo asistida en local: el formato GGUF de 4 bits y la orientacion a `coding` permiten ejecutar el modelo en estaciones de trabajo con GPU CUDA para autocompletado y generacion de funciones sin depender de la nube.
- Agentes autonomos en el borde: el tag `agent` y la cuantizacion NVFP4 lo hacen adecuado para pipelines de agentes con multiples pasos desplegados en dispositivos con GPU de gama media, reduciendo la latencia de red.
- Asistente conversacional embebido: el tag `conversational` y la compatibilidad con endpoints permiten integrarlo en aplicaciones de chat con backend propio.
- Prototipado rapido de aplicaciones LLM: al ser un GGUF de 4 bits, se puede cargar con runtimes compatibles para validar ideas antes de escalar a modelos mayores.
- Despliegue en entornos con restricciones de memoria: la cuantizacion de 4 bits reduce la huella de VRAM frente a pesos de 16 bits, lo que facilita su uso en GPUs consumer de gama alta.
- Investigacion sobre cuantizacion NVFP4: sirve como referencia para estudiar el impacto de NVFP4 en modelos MoE orientados a codigo y agentes.
- Integracion en pipelines de CI/CD para revision de codigo: puede emplearse como paso de generacion o analisis de parches en entornos con GPU CUDA dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 113,8 GB, lo que da una cota superior del espacio en disco; la VRAM necesaria depende de si los pesos se cargan completos o por capas.
- GPU recomendadas: no disponible. El tag `cuda` indica soporte para GPUs NVIDIA, pero no se especifican modelos.
- Cabe en GPU consumer: no confirmado. Dado el tamano del repositorio (113,8 GB), no cabria completo en GPUs consumer de 24 GB (RTX 4090) sin offloading o carga parcial.
- Opciones de despliegue: el formato GGUF sugiere compatibilidad con runtimes de inferencia GGUF (por ejemplo llama.cpp u Ollama), aunque la libreria declarada es `edge0`, propia del autor. No se confirma soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa. El modelo base `Qwen/Qwen3.8-Flash-Next` podria servir como referencia, pero no se aportan sus especificaciones.

## Limitaciones y advertencias

- Discrepancia entre el nombre (145B) y los parametros registrados en safetensors (aproximadamente 4,95 mil millones); conviene verificar el conteo real antes de dimensionar el despliegue.
- La cuantizacion de 4 bits (NVFP4) puede degradar la calidad frente a los pesos originales en tareas sensibles, como razonamiento matematico o generacion de codigo complejo.
- No se documentan sesgos conocidos, pero al no haber informacion sobre el dataset de entrenamiento no es posible evaluarlos.
- Riesgo de alucinacion inherente a los modelos generativos; no se aportan evaluaciones de fidelidad.
- No se especifican idiomas soportados, por lo que el rendimiento en castellano es desconocido.
- La licencia `edge0-community-model-1.0` es de tipo "other" y puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE del repositorio.
- El modelo base es `Qwen/Qwen3.8-Flash-Next`, cuyas condiciones de licencia podrian aplicarse en cascada; no se detalla en la informacion disponible.
- La libreria `edge0` es propia del autor, lo que puede limitar la compatibilidad con herramientas estandar del ecosistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Edge0/Edge0-145B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/Edge0/Edge0-145B-NVFP4/blob/main/LICENSE
