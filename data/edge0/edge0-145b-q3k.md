# Edge0/Edge0-145B-q3k

## Resumen

Edge0-145B-q3k es una cuantización GGUF de 4 bits del modelo Edge0, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) "latent" desarrollado por el colectivo Edge0 y derivado del modelo base Qwen/Qwen3.8-Flash-Next. Está orientado explícitamente a inferencia en el borde (edge inference), agentes autónomos y generación de código, y se distribuye mediante la librería propia `edge0` con compatibilidad con endpoints.

El modelo se presenta como una variante optimizada para despliegue con recursos limitados: el repositorio ocupa 106,3 GB y los pesos en safetensors registran 4.947.698.560 parámetros reales, un dato que entra en contradicción con el nombre comercial "145B" y que conviene tratar con cautela. La nomenclatura `q3k` sugiere una cuantización de 3-4 bits con algún esquema de empaquetado propietario.

Su relevancia actual radica en la combinación de tres factores: una arquitectura MoE con atención latente pensada para reducir coste de cómputo, un enfoque declarado hacia tool calling y flujos multi-paso, y una licencia comunitaria propia (`edge0-community-model-1.0`) que no es de código abierto estándar y debe revisarse antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) latente, transformer; detalles no disponibles |
| Parámetros totales | 4.947.698.560 según safetensors (el nombre comercial indica "145B"; discrepancia no resuelta) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF 4-bit (variante `q3k`); otros formatos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | edge0-community-model-1.0 (licencia "other", no OSI) |
| Formato de pesos | GGUF (repo de 106,3 GB); safetensors reportado para el recuento de parámetros |

## Arquitectura y entrenamiento

La información disponible describe el modelo como un MoE "latente" (latent-moe), una variante en la que el enrutamiento entre expertos se realiza en un espacio latente comprimido en lugar de sobre el espacio de tokens completo. El modelo base es Qwen/Qwen3.8-Flash-Next, sobre el que Edge0 habría aplicado un proceso de destilación o adaptación propio no documentado en la información proporcionada.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o supervisión con preferencias. Tampoco se detallan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos de compresión de KV cache. La cuantización `q3k` se distribuye en formato GGUF y está etiquetada como compatible con CUDA y con endpoints, lo que sugiere soporte para servidores de inferencia tipo API.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Generación y asistencia de código (tag `coding`).
- Soporte declarado para agentes y flujos multi-paso (tag `agent`).
- Inferencia en el borde (tag `edge-inference`), orientada a hardware con recursos limitados.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su exposición como API.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Visión o audio: no disponibles.

## Casos de uso

- Asistencia de código en IDE local: el modelo puede integrarse en extensiones de editor que ejecuten inferencia en la propia máquina del desarrollador, aprovechando la cuantización 4-bit para reducir el consumo de VRAM y la etiqueta `coding` para autocompletado y generación de funciones.
- Agentes autónomos de automatización de tareas: gracias a la orientación `agent` y a la compatibilidad con endpoints, puede desplegarse detrás de un orquestador que gestione tool calling y cadenas de razonamiento multi-paso en flujos de trabajo internos.
- Despliegue en el borde para asistentes embebidos: la etiqueta `edge-inference` y el formato GGUF permiten ejecutar el modelo en estaciones de trabajo o dispositivos con GPU de gama media sin depender de la nube.
- Generación de documentación técnica: el modelo puede redactar y mantener documentación de APIs y repositorios a partir del código fuente, integrándose en pipelines de CI que generen artefactos de documentación.
- Prototipado rápido de chatbots conversacionales: la naturaleza conversacional y la compatibilidad con endpoints facilitan montar un servicio de chat interno con contexto multi-turno para pruebas de producto.
- Revisión de código automatizada en pre-merge: el modelo puede analizar diffs y sugerir correcciones antes de fusionar una rama, ejecutándose en el runner de CI si este dispone de GPU o mediante un endpoint dedicado.
- Enrutamiento y clasificación de tickets: la arquitectura MoE y el bajo coste por token de la cuantización permiten clasificar y resumir tickets de soporte en lotes dentro de un pipeline de back-office.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio GGUF ocupa 106,3 GB, lo que implica que la inferencia requiere al menos ~110 GB de memoria combinada (VRAM + RAM) si se carga completo en una sola máquina.
- GPU recomendadas: no disponibles de forma explícita; por tamaño del artefacto, un despliegue completo encajaría en configuraciones de clase A100 80 GB en par, H100 80 GB o configuraciones multi-GPU.
- GPU de consumo (RTX 4090, 24 GB): no es posible cargar el modelo completo en una sola tarjeta; requeriría offloading a RAM del sistema o sharding entre varias GPU.
- Opciones de despliegue: el modelo se distribuye con la librería `edge0` y está etiquetado como compatible con endpoints; no se confirma soporte para vLLM, llama.cpp, Ollama o TGI en la información proporcionada, aunque el formato GGUF sugiere compatibilidad con runtimes de cuantización GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Edge0-145B-q3k | 4.947.698.560 (safetensors) / "145B" nominal | no disponible | edge0-community-model-1.0 | GGUF 4-bit | Derivado de Qwen3.8-Flash-Next; orientado a edge y agentes |
| Qwen3.8-Flash-Next (base) | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva Edge0 |
| Alternativas MoE de código abierto comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Discrepancia crítica entre el nombre comercial ("145B") y el recuento real de parámetros en safetensors (4,95 mil millones): debe verificarse antes de dimensionar infraestructura.
- Licencia `edge0-community-model-1.0` no es una licencia de código abierto reconocida; es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial o redistribución.
- No se documentan los idiomas soportados, lo que impide garantizar calidad en castellano u otras lenguas distintas del inglés.
- No se publican datos de entrenamiento, alineación ni evaluaciones de sesgo; el riesgo de alucinación y de sesgos heredados del modelo base no está cuantificado.
- Longitud de contexto desconocida: no es posible planificar casos de uso que dependan de ventanas largas.
- La cuantización 4-bit puede degradar la calidad frente al modelo base en tareas de razonamiento matemático y generación de código complejo.
- El ecosistema de la librería `edge0` es propietario y poco extendido, lo que puede limitar el soporte comunitario y las integraciones con herramientas estándar.
- No se confirma compatibilidad con runtimes de inferencia ampliamente adoptados (vLLM, TGI, llama.cpp), lo que añade riesgo operativo en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Edge0/Edge0-145B-q3k)
- [Modelo base Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- Repositorio de código, paper, blog o demo: no disponibles en la información proporcionada.
