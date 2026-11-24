# Edge0/Edge0-145B-NVFP4

## Resumen

Edge0-145B-NVFP4 es un modelo de lenguaje de tipo Mixture of Experts (MoE) publicado por Edge0, derivado del modelo base Qwen/Qwen3.8-Flash-Next mediante un proceso de cuantizacion a 4 bits en formato NVFP4. El modelo esta orientado a inferencia en el borde (edge inference), con enfasis en tareas de agente y generacion de codigo, y se distribuye con la libreria propia `edge0` y pesos en formato GGUF. El repositorio ocupa 113,8 GB y acumula 94.273 descargas y 806 likes en Hugging Face, lo que indica una adopcion notable pese a su reciente publicacion en noviembre de 2026.

La denominacion comercial "145B" del identificador no coincide con el recuento real de parametros almacenados en los ficheros safetensors, que asciende a 4.947.698.560 parametros (aproximadamente 4,95 mil millones). Esta discrepancia debe tenerse en cuenta al planificar el despliegue: el tamano efectivo en disco y en memoria viene determinado por el repositorio de 113,8 GB y por la cuantizacion NVFP4, no por la cifra del nombre.

El modelo resulta relevante en el contexto actual de despliegue eficiente de modelos abiertos, donde la combinacion de arquitectura MoE con cuantizacion de 4 bits busca reducir los requisitos de memoria sin renunciar a la calidad del modelo base. Su licencia `edge0-community-model-1.0` (categoria "other") introduce condiciones propias que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), variante "latent-moe" segun tags del autor |
| Parametros totales | 4.947.698.560 (dato real de safetensors); el identificador comercial indica 145B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits), formato GGUF |
| Idiomas soportados | no disponible |
| Licencia | edge0-community-model-1.0 (categoria "other") |
| Formato de pesos | GGUF (tags del repositorio); safetensors presentes para el recuento de parametros |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Tamano del repositorio | 113,8 GB |
| Libreria | edge0 |
| Pipeline | text-generation |
| Descargas / likes | 94.273 / 806 |
| Fecha de creacion | 2026-11-11 |
| Ultima actualizacion | 2026-11-21 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE), etiquetada por el autor como "latent-moe", que combina activacion dispersa de expertos con representaciones latentes. Se trata de una derivacion del modelo Qwen/Qwen3.8-Flash-Next, sobre el que Edge0 aplica un proceso de cuantizacion a 4 bits en formato NVFP4 (formato de punto flotante de 4 bits orientado a aceleracion en GPU). No se dispone de informacion sobre el numero de parametros activos por token, el numero de expertos, la dimension de las capas ni la composicion del dataset de entrenamiento original.

Tampoco se han publicado datos sobre el volumen de tokens de entrenamiento, la posible aplicacion de RLHF o DPO, ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La informacion disponible se limita a los metadatos del repositorio y a los tags declarados por el autor (moe, edge-inference, latent-moe, 4-bit, agent, coding, cuda), que senalan el enfasis en inferencia en el borde y en cargas de trabajo de agente y codigo. Cualquier afirmacion adicional sobre el entrenamiento seria especulativa y no se incluye.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational` y el pipeline `text-generation`.
- Orientacion a tareas de agente (`agent` en los tags), lo que sugiere soporte para flujos multi-paso, aunque no se documenta explicitamente el soporte de tool calling.
- Generacion y asistencia en codigo (`coding` en los tags).
- Inferencia en el borde (`edge-inference`), disenada para ejecucion en entornos con recursos limitados.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Ejecucion acelerada en CUDA (`cuda` en los tags).
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible.

## Casos de uso

- Asistente de codigo en el IDE: el modelo puede integrarse en extensiones de editor para autocompletado y generacion de fragmentos, aprovechando su orientacion a `coding` y su tamano contenido en disco (113,8 GB en cuantizacion NVFP4), adecuado para servidores de desarrollo dedicados.
- Agente autonomo de tareas multi-paso: los tags `agent` y `endpoints_compatible` permiten desplegarlo detras de una API compatible con endpoints estandar y orquestar cadenas de llamadas a herramientas en pipelines de automatizacion.
- Inferencia en el borde con GPU de consumo: la cuantizacion NVFP4 y el tag `edge-inference` lo hacen candidato para despliegues en estaciones de trabajo con GPU consumer, reduciendo el coste frente a modelos de mayor precision.
- Generacion de codigo en produccion: puede integrarse en pipelines de CI/CD para generar tests, documentacion o parches, siempre que se valide la salida antes de aplicarla.
- Asistente conversacional especializado: su tag `conversational` lo habilita para atencion al cliente o asistentes internos, aunque la longitud de contexto no esta documentada y debe verificarse antes de disenar conversaciones multi-turno largas.
- Prototipado rapido de aplicaciones LLM: al ser compatible con endpoints y con la libreria `edge0`, permite montar un servicio de generacion de texto en pocas horas para validar productos antes de migrar a modelos mayores.
- Experimentacion en investigacion: sirve como base para estudiar el comportamiento de arquitecturas MoE cuantizadas a 4 bits y comparar su calidad frente al modelo Qwen original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 113,8 GB en cuantizacion NVFP4; se requiere al menos esa cantidad de memoria agregada, repartible entre varias GPU o mediante offload a RAM/CPU.
- GPU recomendadas: no disponible de forma explicita; por volumen de pesos, se necesitan configuraciones multi-GPU de clase A100/H100 o equivalentes con memoria agregada suficiente.
- GPU de consumo: no cabe en una unica RTX 4090 (24 GB) sin offload o sharding; el tag `edge-inference` sugiere que el autor contempla despliegues en entornos de borde, pero no se detalla la configuracion minima.
- Opciones de despliegue: formato GGUF, por lo que es compatible con llama.cpp y potencialmente con Ollama; la libreria `edge0` y el tag `cuda` indican soporte nativo propio. vLLM y TGI no estan confirmados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Edge0-145B-NVFP4 | 4.947.698.560 (safetensors) | no disponible | edge0-community-model-1.0 | GGUF / safetensors | Cuantizado NVFP4, MoE, orientado a edge y agentes |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva Edge0 |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Discrepancia entre el nombre comercial ("145B") y el recuento real de parametros en safetensors (4,95 mil millones): verificar el tamano efectivo antes de dimensionar infraestructura.
- Licencia `edge0-community-model-1.0` de categoria "other": es imprescindible revisar el fichero LICENSE del repositorio para conocer las restricciones de uso comercial, redistribucion y modificacion.
- No se documentan los idiomas soportados, lo que impide garantizar calidad multilingue en produccion.
- No se publica la longitud de contexto, dato critico para disenar aplicaciones conversacionales o de recuperacion aumentada.
- No hay informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento, por lo que no puede evaluarse el riesgo de sesgo de forma documentada.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad.
- La cuantizacion a 4 bits puede degradar la calidad respecto al modelo base Qwen/Qwen3.8-Flash-Next; no se aportan comparativas de calidad.
- No se confirma el soporte de tool calling ni de function calling, pese al tag `agent`; conviene validarlo empiricamente antes de disenar agentes en produccion.
- Al ser un modelo reciente (noviembre de 2026), el ecosistema de herramientas y la documentacion de terceros pueden ser limitados.

## Enlaces

- Hugging Face: https://huggingface.co/Edge0/Edge0-145B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/Edge0/Edge0-145B-NVFP4/blob/main/LICENSE
