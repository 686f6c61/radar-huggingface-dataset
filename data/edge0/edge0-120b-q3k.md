# Edge0/Edge0-120B-q3k

## Resumen

Edge0-120B-q3k es una cuantización GGUF de 4 bits del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el colectivo Edge0 bajo su propia licencia comunitaria (edge0-community-model-1.0). El modelo está etiquetado como una arquitectura MoE (mixture of experts) con una variante que el autor denomina "latent-moe", orientada específicamente a inferencia en el borde (edge inference), agentes y generación de código. El repositorio tiene un tamaño de 97,3 GB y acumula más de 53.000 descargas, lo que indica una adopción considerable pese a su juventud (publicado en noviembre de 2026).

La propuesta del modelo es ofrecer un MoE de gran escala cuantizado a 4 bits para poder ejecutarse en hardware más modesto que el requerido por el modelo original en precisión completa, manteniendo capacidades de razonamiento, agentes y código. La librería declarada es `edge0`, una librería propia del autor, lo que implica que el formato de pesos y el runtime no son estándar y requieren el ecosistema específico de Edge0.

Es relevante ahora porque combina tres tendencias: cuantización agresiva de MoE para despliegue local, especialización en cargas agénticas y de código, y la aparición de runtimes propietarios que empaquetan modelo y motor de inferencia. No obstante, la información pública disponible es limitada: no se detallan idiomas soportados, ni benchmarks, ni la composición del dataset de entrenamiento del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), variante "latent-moe" según el autor |
| Parámetros totales | 4.947.698.560 (dato real de safetensors; discrepante con el nombre "120B") |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (GGUF, según tags y nombre del repo "q3k") |
| Idiomas soportados | no disponible |
| Licencia | edge0-community-model-1.0 (licencia "other" en Hugging Face) |
| Formato de pesos | GGUF; repositorio de 97,3 GB; librería `edge0` |

## Arquitectura y entrenamiento

El modelo se declara como un MoE con una innovación denominada "latent-moe", que el autor no describe en detalle en la información disponible. No se especifica el número de expertos, la estrategia de enrutamiento ni la proporción de parámetros activos por token. El nombre del repositorio sugiere 120B de parámetros, pero el dato real de safetensors indica 4.947.698.560 parámetros totales, una discrepancia sustancial que conviene tratar con cautela: podría deberse a que el recuento corresponde a un subconjunto de tensores o a una particularidad del formato de empaquetado de Edge0.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones. El modelo base es Qwen/Qwen3.8-Flash-Next, del que tampoco se aportan detalles en la información proporcionada. La cuantización a 4 bits y el empaquetado en GGUF son las únicas intervenciones documentadas sobre el modelo base. No se mencionan innovaciones como decodificación especulativa, atención lineal o mecanismos híbridos SSM.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento y generación de código, según los tags `agent` y `coding`.
- Soporte declarado para cargas agénticas (tag `agent`), aunque no se detalla si incluye tool calling o function calling nativo.
- Inferencia en el borde (tag `edge-inference`), orientada a despliegue en hardware limitado.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multilingües: no disponibles.
- Modo "thinking", visión o audio: no disponibles.

## Casos de uso

- Asistente de código en local: el modelo puede integrarse en editores o CLI para autocompletado y generación de funciones, aprovechando su cuantización a 4 bits para ejecutarse en estaciones de trabajo sin GPU de datacenter.
- Agentes autónomos de desarrollo: gracias al tag `agent`, puede emplearse en bucles de razonamiento multi-paso para tareas como refactorización guiada, generación de tests o resolución de issues, siempre que el runtime `edge0` exponga las herramientas necesarias.
- Despliegue en el borde: el tag `edge-inference` sugiere su uso en dispositivos con VRAM limitada, como workstations con una sola GPU consumer, para tareas de generación de texto y código.
- Automatización de atención al cliente: conversaciones multi-turno con contexto moderado, aunque la longitud de contexto no está documentada y debe validarse empíricamente.
- Prototipado rápido de pipelines agénticos: la compatibilidad con endpoints permite servirlo detrás de una API compatible con OpenAI y conectarlo a frameworks de agentes existentes.
- Evaluación de runtimes alternativos: útil para equipos que quieran comparar el ecosistema `edge0` frente a vLLM, llama.cpp u Ollama en cargas de código y agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con un repositorio de 97,3 GB en cuantización de 4 bits, se requiere al menos ~100 GB de VRAM o memoria unificada para cargar los pesos completos; no se dispone de desglose por capas.
- GPU recomendadas: no disponibles. Por tamaño, cabría en configuraciones multi-GPU (varias A100/H100) o en sistemas con memoria unificada grande (por ejemplo, Apple Silicon de gama alta o GPUs con 96 GB o más).
- GPU consumer: no cabe en una RTX 4090 (24 GB) ni en GPUs consumer convencionales según el tamaño del repo; se requeriría offloading a RAM o hardware de mayor capacidad.
- Opciones de despliegue: la librería declarada es `edge0`, por lo que el despliegue estándar requiere ese runtime. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Edge0-120B-q3k | 4.947.698.560 (según safetensors) | no disponible | edge0-community-model-1.0 | GGUF / runtime `edge0` | Hugging Face |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre modelos comparables de la misma categoría (MoE cuantizado para edge inference) en la documentación proporcionada.

## Limitaciones y advertencias

- Discrepancia entre el nombre "120B" y el recuento real de parámetros (4.947.698.560): debe verificarse antes de dimensionar hardware.
- Licencia `edge0-community-model-1.0`: es una licencia propia del autor, no estándar; es imprescindible revisar el archivo LICENSE para conocer restricciones de uso comercial, redistribución y atribución.
- Dependencia del runtime `edge0`: al no ser un formato estándar ampliamente soportado, la portabilidad a otros motores de inferencia no está garantizada.
- Idiomas soportados no documentados: riesgo de rendimiento desigual fuera del inglés.
- Longitud de contexto no documentada: limita el diseño de aplicaciones que dependan de ventanas largas.
- Sin benchmarks publicados: no es posible evaluar su calidad frente a alternativas con datos objetivos.
- Riesgo de alucinación inherente a los modelos generativos, agravado por la ausencia de evaluaciones publicadas.
- Sesgos: no documentados; deben evaluarse empíricamente antes de usos sensibles.
- El modelo base Qwen/Qwen3.8-Flash-Next no está descrito en la información disponible, por lo que se desconoce su procedencia y condiciones.

## Enlaces

- Hugging Face: https://huggingface.co/Edge0/Edge0-120B-q3k
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: archivo LICENSE en el repositorio de Hugging Face (no se proporciona URL directa en la información disponible)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
