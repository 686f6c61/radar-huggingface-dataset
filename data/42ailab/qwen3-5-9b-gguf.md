# 42ailab/Qwen3.5-9B-GGUF

## Resumen
Qwen3.5-9B es un modelo multimodal (texto e imagen) de la familia Qwen3.5 desarrollada por el equipo Qwen de Alibaba, publicado bajo licencia Apache-2.0. Esta ficha corresponde a la distribucion cuantizada en formato GGUF preparada por 42ailab para su integracion en la aplicacion de escritorio 42model. El modelo resuelve tareas de generacion de texto, comprension de documentos largos y lectura de imagenes, con especial enfasis en redaccion y reescritura en chino.

El repositorio incluye los pesos cuantizados en Q4_K_M (5,29 GiB) y un proyector de vision en F16 (875,6 MiB), lo que permite ejecutar el modelo completo con capacidades multimodales en hardware de consumo. Los ficheros son identicos byte a byte a los publicados por unsloth en su repositorio GGUF, con digests sha256 fijados para garantizar reproducibilidad.

Con 8.953.803.264 parametros totales (aproximadamente 9B), este modelo se posiciona en la gama media de la serie Qwen3.5 y resulta relevante para despliegues locales donde se requiere un equilibrio entre capacidad, huella de memoria y soporte de vision, sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer multimodal (texto + vision), detalles no disponibles |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (pesos) y F16 (proyector de vision); otras cuantizaciones no disponibles en este repo |
| Idiomas soportados | no disponible (la model card menciona enfasis en chino e ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Qwen3.5-9B-Q4_K_M.gguf + mmproj-F16.gguf) |

## Arquitectura y entrenamiento
La informacion proporcionada no detalla la arquitectura interna mas alla de su naturaleza multimodal: el repositorio incluye un fichero de pesos principal y un proyector de vision separado (mmproj-F16.gguf), lo que es caracteristico de los modelos de lenguaje con adaptador visual en el ecosistema GGUF/llama.cpp. No se especifica si emplea atencion lineal, decodificacion especulativa ni variantes hibridas.

Tampoco se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o alineamiento por preferencias. La model card cita como fuente original el repositorio oficial Qwen/Qwen3.5-9B en ModelScope, pero no reproduce detalles de entrenamiento. La conversion a GGUF fue realizada por unsloth, y 42ailab redistribuye los ficheros sin modificaciones.

## Capacidades
- Generacion de texto conversacional multi-turno (pipeline text-generation).
- Comprension de imagenes y tareas image-text-to-text mediante el proyector de vision incluido.
- Redaccion, reescritura y compresion de documentos largos, con rendimiento destacado en chino segun la model card.
- Comprension de documentos extensos (la model card menciona "long-document understanding", aunque no se especifica la ventana de contexto).
- Uso bilingue chino/ingles como minimo, segun las referencias de la model card.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere integracion con APIs tipo OpenAI en herramientas de despliegue.
- Soporte de tool calling y agentes: no confirmado en la informacion disponible.

## Casos de uso
- Asistente local de escritorio: integrado en la aplicacion 42model mediante el comando `42model download qwen3.5:9b-q4_k_m`, permite conversaciones privadas sin enviar datos a la nube, con un peso de 5,29 GiB que cabe en la mayoria de equipos con GPU de gama media.
- Analisis de documentos con imagenes: el proyector de vision F16 permite procesar capturas, diagramas o paginas escaneadas junto a texto, util para extraccion de informacion en flujos de trabajo ofimaticos.
- Redaccion y reescritura en chino: adecuado para equipos que generan contenido en chino y necesitan un modelo afinado en esa lengua, ejecutable en local para evitar dependencias de proveedores externos.
- Procesamiento de facturas o formularios escaneados: combinando vision y generacion de texto, el modelo puede transcribir y estructurar contenido de imagenes en entornos con requisitos de privacidad.
- Desarrollo de prototipos multimodales: al estar en GGUF, se puede integrar rapidamente en pipelines basados en llama.cpp u Ollama para validar ideas antes de escalar a modelos mayores.
- Despliegue en entornos sin conectividad: al fijarse los digests sha256 y no depender de servicios externos, encaja en escenarios de borde o aire aislado donde la reproducibilidad es critica.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 5,3 GiB para los pesos Q4_K_M mas 0,86 GiB del proyector de vision, con overhead adicional de contexto y cache KV (estimacion orientativa; depende de la ventana configurada).
- GPU recomendadas: tarjetas con 8-12 GB de VRAM para margen comodo, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o superiores (A100/H100 no necesarias para este tamano).
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM; con 6 GB puede requerir offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, 42model (cliente oficial); vLLM y TGI no soportan GGUF de forma nativa sin conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B (este) | ~9B | no disponible | Si | Apache-2.0 | GGUF |
| Gemma 3 12B | ~12B | no disponible | Si | Gemma Terms | GGUF/safetensors |
| Llama 3.2 11B Vision | ~11B | no disponible | Si | Llama 3.2 Community | GGUF/safetensors |
| Qwen2.5-VL 7B | ~7B | no disponible | Si | Apache-2.0 | safetensors/GGUF |

La comparativa se limita a categoria (modelos multimodales de ~7-12B con pesos abiertos); no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias
- La model card no documenta sesgos conocidos; al ser un modelo entrenado principalmente con datos de chino e ingles, puede presentar sesgos culturales y linguisticos en otros idiomas.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- La ventana de contexto no esta especificada, lo que impide garantizar el manejo de documentos muy largos pese a la mencion de "long-document understanding".
- Idiomas soportados no confirmados oficialmente; el uso en castellano no esta validado por el autor.
- La licencia Apache-2.0 permite uso comercial, pero el repositorio es una redistribucion de terceros (42ailab) de la conversion de unsloth; conviene verificar la cadena de custodia si se requiere cumplimiento estricto.
- El modelo se distribuye unicamente en Q4_K_M; cuantizaciones superiores o inferiores no estan disponibles en este repositorio.
- No hay confirmacion de soporte de tool calling ni de modo de razonamiento explicito.

## Enlaces
- Hugging Face: https://huggingface.co/42ailab/Qwen3.5-9B-GGUF
- ModelScope (copia): https://modelscope.cn/models/42ailab/Qwen3.5-9B-GGUF
- Repositorio original GGUF (unsloth): https://www.modelscope.cn/models/unsloth/Qwen3.5-9B-GGUF
- Repositorio oficial del modelo base: Qwen/Qwen3.5-9B (en ModelScope)
- Sitio del mantenedor: https://42ailab.com
- Aplicacion 42model: https://42model.com
