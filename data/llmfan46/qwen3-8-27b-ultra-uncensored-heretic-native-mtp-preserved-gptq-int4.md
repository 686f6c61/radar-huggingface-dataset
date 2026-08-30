# llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-GPTQ-Int4

## Resumen

Este modelo es una cuantización GPTQ de 4 bits del modelo `llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved`, que a su vez es una versión "decensored" (sin censura) del modelo multimodal Qwen3.8-27B de Alibaba. El autor, llmfan46, ha aplicado la técnica de abliteración [Heretic](https://heretic-project.org/) v2.0.0.dev0 con el método Magnitude-Preserving Orthogonal Ablation (MPOA) para reducir drásticamente los rechazos del modelo original (de 91/100 a 3/100) manteniendo una divergencia KL muy baja (0.0244) respecto al original. El resultado es un modelo de 27.781 millones de parámetros con arquitectura transformer densa, soporte multimodal (imagen y texto) y decodificación especulativa con 15 módulos MTP (Multi-Token Prediction) preservados.

La cuantización GPTQ-Int4 reduce el tamaño del repositorio a 19.6 GB, lo que permite ejecutar el modelo en hardware de consumo con 24 GB de VRAM. Está destinado a desarrolladores e investigadores que necesitan un modelo sin restricciones de contenido para tareas de generación de texto, razonamiento y procesamiento de imágenes, con la ventaja de mantener una alta fidelidad al modelo original. Su licencia Apache-2.0 permite uso comercial, aunque el contenido generado puede ser inapropiado o sensible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GPTQ-Int4 (este repo); GGUF disponible en otros repos |
| Idiomas soportados | No disponible (presumiblemente multilingue como el original) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (GPTQ) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso multimodal que procesa entradas de imagen y texto. Incorpora decodificacion especulativa mediante 15 modulos MTP (Multi-Token Prediction) que predicen varios tokens por paso, mejorando el throughput en inferencia. Sobre este modelo, llmfan46 ha aplicado el proceso Heretic con el metodo MPOA (Magnitude-Preserving Orthogonal Ablation), una variante de abliteracion que proyecta los pesos en direcciones ortogonales para eliminar las representaciones asociadas a comportamientos de rechazo o censura. Los componentes objetivo fueron `attn.o_proj`, `attn.out_proj` y `mlp.down_proj`, con parametros de intensidad que se detallan en la model card. La cuantizacion GPTQ-Int4 se realizo posteriormente, preservando todos los MTPs intactos. No se han publicado detalles sobre el dataset de entrenamiento ni el proceso de cuantizacion mas alla de lo indicado.

## Capacidades

- Generacion de texto y razonamiento: mantiene las capacidades del Qwen3.8-27B original, incluyendo matematicas, logica y conocimiento general (MMLU del original: 83.42%).
- Procesamiento de imagenes: al ser multimodal (image-text-to-text), puede recibir imagenes como entrada y responder con texto, util para descripcion, analisis y preguntas visuales.
- Decodificacion especulativa: gracias a los 15 MTPs preservados, la inferencia puede ser mas rapida en entornos que soporten esta tecnica (por ejemplo, vLLM).
- Tool calling y agentes: el modelo base Qwen3.8-27B soporta function calling y flujos agenciales, capacidades que se mantienen en esta version.
- Conversacion multiturno: disenado para dialogos extensos, con gestion de contexto conversacional.
- Baja tasa de rechazos: el abliterado reduce los rechazos de 91/100 a 3/100, lo que permite respuestas directas a peticiones que el modelo original bloquearia.

## Casos de uso

- Investigacion en IA sin restricciones: ideal para estudiar comportamientos de modelos sin sesgos de censura, como analisis de sesgos, generacion de contenido critico o evaluacion de limites eticos.
- Asistente de codigo con tool calling: puede integrarse en entornos de desarrollo (IDE, pipelines CI/CD) para generar y depurar codigo, aprovechando su capacidad de llamar funciones y razonar sobre imagenes de diagramas o capturas.
- Analisis de documentos con imagenes: procesar documentos escaneados, graficos o diagramas y extraer informacion estructurada, gracias a su entrada multimodal.
- Generacion de contenido creativo sin filtros: redaccion de narrativa, poesia o guiones donde se requiera explorar temas sensibles sin respuestas evasivas.
- Automatizacion de atencion al cliente: gestionar conversaciones complejas con contexto largo y respuestas directas, aunque requiere supervision por el riesgo de contenido inapropiado.
- Educacion y tutorizacion personalizada: explicar conceptos dificiles sin restricciones autoimpuestas, adaptando el tono y la profundidad segun el usuario.
- Prototipado rapido de agentes conversacionales: al ser ligero (19.6 GB) y con licencia permisiva, se puede desplegar en entornos de desarrollo para probar flujos agenciales antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta cuantizacion GPTQ-Int4 especifica. Los datos disponibles corresponden al modelo base sin cuantizar (`llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved`), que se comparan con el Qwen3.8-27B original:

| Metrica | Modelo abliterado | Qwen3.8-27B original |
|---|---|---|
| Divergencia KL | 0.0244 | 0 |
| Tasa de rechazos (sobre 100 peticiones) | 3/100 | 91/100 |
| MMLU (accuracy) | 83.42% (del original, no del abliterado) | 83.42% |

Nota: el resultado MMLU de 83.42% corresponde al modelo original Qwen3.8-27B, no al abliterado. No se dispone de mediciones independientes para la version cuantizada.

## Requisitos de hardware

- VRAM estimada: los pesos cuantizados a 4 bits ocupan aproximadamente 19.6 GB en disco. Para inferencia, se recomienda al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) para cargar el modelo con overhead de activaciones y cache KV.
- GPU compatibles: cualquier GPU con 24 GB o mas de VRAM (RTX 3090/4090, A100, H100, L4). En GPUs de 16 GB (RTX 4080, A4000) podria ser posible con cuantizaciones mas agresivas o offloading de capas, pero no esta garantizado.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama (via GGUF), y servidores OpenAI-compatibles. Para decodificacion especulativa con MTP, se requiere soporte en el runtime (por ejemplo, vLLM con `--enable-speculative`).
- Latencia y throughput: no se dispone de mediciones publicas para esta cuantizacion. En general, un modelo de 27B en 4-bit en una RTX 4090 puede generar entre 20 y 40 tokens por segundo, dependiendo de la longitud de contexto y configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| `llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-GPTQ-Int4` | 27.8B | No disponible | Multimodal denso | Apache-2.0 | Cuantizado 4-bit, sin censura, con MTP |
| `Qwen/Qwen3.8-27B` | 27.8B | No disponible | Multimodal denso | Apache-2.0 | Modelo original con censura (91% rechazos) |
| `llmfan46/Qwen3.6-27B-uncensored-heretic-v2-Native-MTP-Preserved` | 27B aprox. | No disponible | Texto (?) | Apache-2.0 | Version anterior abliterada de Qwen3.6 |

La comparativa se limita a modelos de la misma familia. No se dispone de datos publicos de rendimiento para la version Qwen3.6.

## Limitaciones y advertencias

- Contenido sin filtrar: al reducir los rechazos, el modelo puede generar contenido ofensivo, ilegal o danino si se le solicita. Debe usarse con responsabilidad y en entornos controlados.
- Riesgo de alucinacion: como cualquier LLM, puede inventar hechos o datos, especialmente en temas especializados. Se recomienda verificacion externa en aplicaciones criticas.
- Longitud de contexto no confirmada: no se ha especificado la longitud de contexto soportada; se desconoce si la cuantizacion afecta a la ventana original del modelo base.
- Sesgos del modelo original: aunque se ha abliterado la censura, los sesgos socioculturales presentes en los datos de entrenamiento de Qwen3.8-27B pueden persistir.
- Rendimiento degradado en cuantizacion 4-bit: la cuantizacion GPTQ-Int4 puede reducir ligeramente la calidad en tareas de razonamiento complejo o generacion de codigo frente al modelo en precision completa.
- Uso en produccion: la ausencia de metricas de seguridad y la naturaleza "uncensored" hacen que no sea recomendable para aplicaciones publicas sin supervision humana y filtros adicionales.
- Soporte limitado: el autor es un contribuyente independiente, sin garantias de mantenimiento o actualizaciones.

## Enlaces

- [Modelo en HuggingFace (GPTQ-Int4)](https://huggingface.co/llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-GPTQ-Int4)
- [Modelo base abliterado](https://huggingface.co/llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved)
- [Repositorio oficial de Qwen3.8-27B (Alibaba)](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Blog: How to Run Qwen 3.8 27B Uncensored Locally](https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally)
- [Blog: How to Run Qwen 3.8 27B Locally (VRAM, quants)](https://locallyuncensored.com/blog/how-to-run-qwen-3-8-27b-locally.html)
- [Version anterior: Qwen3.6-27B-uncensored-heretic-v2](https://huggingface.co/llmfan46/Qwen3.6-27B-uncensored-heretic-v2-Native-MTP-Preserved)
- [Proyecto Heretic](https://heretic-project.org/)
