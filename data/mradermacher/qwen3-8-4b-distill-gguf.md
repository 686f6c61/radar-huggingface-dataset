# mradermacher/Qwen3.8-4B-Distill-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-4B-Distill-GGUF` es una coleccion de cuantizaciones en formato GGUF del modelo base `empero-ai/Qwen3.8-4B-Distill`, desarrollado por el equipo de empero-ai y cuantizado por mradermacher (nethype GmbH). Se trata de una destilacion de conocimiento del modelo Qwen3.8, un sistema de 2,4 billones de parametros con 95 mil millones activos, comprimido en una arquitectura de 4.326 millones de parametros (Qwen3.5-4B). El entrenamiento se realizo sobre aproximadamente 45.000 trazas de profesor curadas de datasets internos de destilacion de Empero.

La relevancia de este modelo reside en que ofrece capacidades de razonamiento y function calling en un formato compacto de 4B, con una licencia Apache 2.0 que permite uso comercial sin restricciones. Al estar disponible en GGUF, puede ejecutarse en una amplia gama de hardware, desde portatiles con CPU hasta GPUs de consumo, mediante herramientas como llama.cpp, Ollama o vLLM. La inclusion de un modulo de proyeccion multimodal (mmproj) sugiere que el modelo base puede procesar entradas visuales junto con texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (basado en Qwen3.5-4B, destilado de Qwen3.8) |
| Parametros totales | 4.326.350.848 (4,33B) |
| Parametros activos | no disponible (no se confirma si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con ficheros .gguf para cada cuantizacion) |

## Arquitectura y entrenamiento

El modelo base `empero-ai/Qwen3.8-4B-Distill` es una destilacion de parametros completos del sistema Qwen3.8 (2.4T A95B) hacia la arquitectura Qwen3.5-4B. Segun la informacion disponible, se entreno con aproximadamente 45.000 trazos de profesor curados procedentes de datasets de destilacion internos de Emper-ai. Este proceso de destilacion transfiere capacidades de razonamiento y de llamada a funciones (function calling) del modelo profesor al alumno, manteniendo un tamano reducido.

La arquitectura se describe como hibrida, aunque no se especifica si combina atencion transformer con mecanismos de espacio de estados o similares. El modelo soporta razonamiento multi-paso y herramientas, como indican los tags de la model card. El repositorio GGUF incluye ademas ficheros `mmproj` (Q8_0 y f16), lo que indica que el modelo base incorpora un proyector multimodal para procesar entradas visuales, aunque no se detalla su arquitectura exacta.

## Capacidades

- Generacion de texto y razonamiento multi-paso: el modelo esta optimizado para tareas que requieren cadenas de pensamiento y deduccion logica.
- Function calling / tool calling: soporta la invocacion de herramientas externas, lo que permite su integracion en agentes y pipelines automatizados.
- Capacidades multimodales: el modulo `mmproj` indica que puede procesar entradas visuales junto con texto (aunque el alcance exacto no se documenta).
- Entrenamiento mediante SFT (supervised fine-tuning) sobre trazas de profesor, lo que mejora la alineacion con tareas especificas.
- Multilingue limitado: la model card indica que el idioma principal es ingles, sin confirmacion de otros idiomas.
- Compatibilidad con el ecosistema GGUF: puede ejecutarse en CPU, GPU y entornos mixtos con herramientas como llama.cpp, Ollama, LM Studio y vLLM.

## Casos de uso

- Atencion al cliente automatizada: con soporte para function calling, el modelo puede gestionar conversaciones multi-turno y consultar sistemas externos (CRM, bases de conocimiento) para resolver incidencias de forma autonoma.
- Generacion de codigo asistida en entornos locales: al caber en una GPU de consumo (por ejemplo, RTX 3060 con cuantizacion Q4_K_M), puede integrarse en IDEs como extension para autocompletado y generacion de funciones.
- Agentes de automatizacion de tareas: su capacidad de tool calling permite construir agentes que ejecuten acciones en navegadores, APIs o scripts, por ejemplo para scraping o gestion de correo.
- Analisis de documentos con vision: la inclusion del mmproj permite procesar imagenes y extraer informacion combinada con texto, util para clasificar facturas o leer capturas de pantalla.
- Prototipado de aplicaciones RAG: con su ventana de contexto (aunque no se especifica) y bajo coste de inferencia, sirve para montar sistemas de retrieval augmented generation sobre documentos internos.
- Desarrollo de aplicaciones educativas: su capacidad de razonamiento permite crear tutores interactivos que expliquen conceptos paso a paso, ejecutandose en equipos modestos.
- Despliegue en entornos con recursos limitados: al tener cuantizaciones desde Q2_K (2,1 GB) hasta Q8_0 (4,7 GB), puede usarse en Raspberry Pi 5, portatiles o servidores sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, y no hay datos comparativos en la busqueda web. Se recomienda evaluar el modelo en el conjunto de tareas especifico de la aplicacion antes de desplegarlo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2,1 GB (Q2_K) y 8,8 GB (f16) para el modelo completo. Con la cuantizacion Q4_K_M (2,9 GB) se puede ejecutar en GPU con 4 GB de VRAM, como una GTX 1650 o RTX 3050.
- GPUs recomendadas: RTX 3060 (12 GB) para cuantizaciones Q4-Q6 con holgura; RTX 4090 o A100 para f16 y mayor throughput; tambien funciona en Apple Silicon (M1/M2/M3) con Metal.
- Cabe en GPU de consumo: si, todas las cuantizaciones Q2-Q6 caben en GPUs con 4-8 GB de VRAM. La f16 requiere al menos 10 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM, TGI (con soporte GGUF), o mediante Python con `llama-cpp-python`.
- Latencia estimada: no disponible. Para un modelo de 4B en cuantizacion Q4, en una RTX 3060 se esperan entre 20-40 tokens/s; en CPU con 32 GB de RAM, entre 5-10 tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-4B-Distill (GGUF) | 4,33B | no disponible | Apache 2.0 | GGUF | Destilado de Qwen3.8, con function calling y vision |
| Qwen2.5-4B-Instruct | 4,0B | 32K | Apache 2.0 | safetensors, GGUF | Modelo generico de la serie Qwen2.5, sin vision |
| Llama-3.2-3B-Instruct | 3,2B | 128K | Llama 3.2 Community | safetensors, GGUF | Capacidades multilingues y de tool calling |
| Phi-3.5-mini-instruct | 3,8B | 128K | MIT | safetensors, GGUF | Orientado a razonamiento, sin vision |

La principal diferencia del modelo destilado es su origen en Qwen3.8, lo que podria aportar capacidades de razonamiento superiores a los modelos de tamano similar, aunque no hay datos publicados que lo confirmen. Su licencia Apache 2.0 es mas permisiva que la de Llama-3.2.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos en la informacion disponible. Como modelo entrenado principalmente en ingles, puede tener un rendimiento inferior en otros idiomas.
- Riesgo de alucinacion: inherente a todos los modelos de lenguaje; en un modelo destilado de 4B, la probabilidad de generar informacion falsa puede ser mayor que en modelos mas grandes. Se recomienda validar las salidas en aplicaciones criticas.
- Limitaciones de contexto: la longitud de contexto no se especifica en la informacion disponible; si es menor que la del modelo original Qwen3.8 (128K), podria limitar tareas con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin obligacion de compartir modificaciones, pero se debe conservar el aviso de licencia.
- Limitaciones multimodales: el modulo mmproj esta incluido, pero no se detalla su capacidad de vision; el modelo podria no manejar imagenes de alta resolucion o tareas de vision complejas.
- Calidad de la cuantizacion: las cuantizaciones mas bajas (Q2_K, Q3_K) pueden degradar significativamente el rendimiento en tareas de razonamiento; se recomienda usar Q4_K_M o superior para produccion.

## Enlaces

- [HuggingFace - mradermacher/Qwen3.8-4B-Distill-GGUF](https://huggingface.co/mradermacher/Qwen3.8-4B-Distill-GGUF)
- [HuggingFace - empero-ai/Qwen3.8-4B-Distill (modelo base)](https://huggingface.co/empero-ai/Qwen3.8-4B-Distill)
- [Aimodels.fyi - Ficha del modelo](https://www.aimodels.fyi/models/huggingFace/qwen3.8-4b-distill-gguf-empero-ai)
- [GitHub QwenLM/Qwen3.8](https://github.com/QwenLM/Qwen3.8)
