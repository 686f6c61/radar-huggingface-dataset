# horongbul/kanana-1.5-8b-instruct-2505-GGUF

## Resumen

Kanana-1.5-8b-instruct-2505-GGUF es una conversión no oficial al formato GGUF del modelo kakaocorp/kanana-1.5-8b-instruct-2505, publicado originalmente por Kakao Corp. El repositorio lo mantiene el usuario horongbul y su único artefacto es una cuantización de 4 bits (Q4_K_M) pensada para su uso con llama.cpp. El modelo subyacente es un transformer decoder-only de 8.030.285.824 parámetros (aproximadamente 8,03 mil millones), afinado para instrucciones y optimizado para coreano e inglés.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 8B especializado en coreano en hardware de consumo, algo que el checkpoint original en safetensors (unos 16 GB en FP16) dificulta. La cuantización Q4_K_M reduce el peso del fichero a 4,58 GiB (4.920.765.472 bytes), lo que lo hace viable en GPUs con 6-8 GB de VRAM o incluso en CPU con suficiente RAM.

No se dispone de información detallada sobre la arquitectura interna, el dataset de entrenamiento ni los resultados de benchmarks del modelo original en la información proporcionada; esta ficha se limita a los datos verificables del repositorio y de la model card del conversor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles internos no disponibles) |
| Parametros totales | 8.030.285.824 (8,03B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de la model card usa `-c 4096`) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido desde safetensors del modelo base) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base. Por los metadatos disponibles se trata de un transformer decoder-only de 8.030.285.824 parámetros, afinado para instrucciones (sufijo `instruct`) y publicado por Kakao Corp. con fecha de referencia 2505 (mayo de 2025). No se especifican en la información proporcionada el número de capas, la dimensión oculta, el número de cabezas de atención, la longitud de contexto nativa ni si emplea técnicas como GQA, RoPE o atención lineal.

El proceso de creación de este repositorio es puramente de conversión de formato y precisión: los pesos safetensors originales se convirtieron a GGUF F16 con `convert_hf_to_gguf.py --outtype f16` de llama.cpp (build b12606) y posteriormente se cuantizaron a Q4_K_M con `llama-quantize` de la misma versión. No hubo reentrenamiento ni modificación de los pesos, según declara el autor. La model card advierte de que la cuantización es una transformación con pérdida y que la calidad de respuesta puede degradarse ligeramente respecto al original. No se dispone de información sobre el dataset de entrenamiento, el número de tokens vistos, ni si se aplicaron técnicas de RLHF, DPO o similares.

## Capacidades

- Generación de texto conversacional en coreano e inglés, con plantilla de chat incluida dentro del propio fichero GGUF.
- Modelo afinado para instrucciones (instruct), orientado a seguir indicaciones y mantener diálogos multi-turno.
- Soporte nativo de coreano, lo que lo distingue de la mayoría de modelos de 8B centrados en inglés.
- Compatibilidad con la API OpenAI de llama.cpp (`/v1/chat/completions`) mediante `llama-server`.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.

## Casos de uso

- Asistentes conversacionales en coreano: el modelo puede gestionar diálogos multi-turno en coreano con una ventana de contexto configurable en llama.cpp (el ejemplo de la model card usa 4096 tokens), adecuado para chatbots de atención al usuario en ese idioma.
- Despliegue en hardware de consumo: con 4,58 GiB en Q4_K_M, puede ejecutarse en GPUs de gama media (6-8 GB de VRAM) o en CPU, lo que permite prototipar asistentes en coreano sin infraestructura de datacenter.
- Traducción y adaptación de contenido coreano-inglés: útil para tareas de reescritura, resumen o adaptación de textos entre ambos idiomas en entornos con recursos limitados.
- Procesamiento por lotes en local: al caber en un solo dispositivo, permite generar grandes volúmenes de texto en coreano (descripciones de producto, respuestas de soporte, borradores) sin coste por token de API.
- Integración en pipelines de llama.cpp: al exponer una API compatible con OpenAI, puede conectarse a frameworks de orquestación existentes para construir asistentes especializados en dominio coreano.
- Evaluación y experimentación académica: sirve como referencia cuantizada de un modelo coreano de 8B para estudiar el impacto de la cuantización Q4_K_M en la calidad de generación en coreano frente al checkpoint original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,6-5,5 GB con Q4_K_M (el fichero pesa 4,58 GiB y hay que sumar la caché KV, que depende de la longitud de contexto configurada).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en el ámbito profesional, A100 o H100 si se busca throughput alto con lotes grandes.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más de VRAM para contextos moderados; con 8 GB se puede ampliar la ventana de contexto.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), y por extensión cualquier frontend compatible con GGUF (Ollama, LM Studio, KoboldCpp, etc.), aunque el autor solo documenta llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| kanana-1.5-8b-instruct-2505 (GGUF Q4_K_M, este repo) | 8,03B | No disponible | ko, en | Apache 2.0 | GGUF |
| kakaocorp/kanana-1.5-8b-instruct-2505 (original) | 8,03B | No disponible | ko, en | Apache 2.0 | safetensors |
| Modelos comparables de 8B centrados en ingles | No disponible | No disponible | Principalmente en | Variable | Variable |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones detalladas de alternativas comparables, por lo que la comparativa se limita a los aspectos verificables del propio modelo y su versión original.

## Limitaciones y advertencias

- Conversión no oficial: el repositorio lo mantiene un tercero no afiliado a Kakao; el autor declara explícitamente que no está respaldado por Kakao Corp.
- Calidad degradada por cuantización: Q4_K_M es una transformación con pérdida; la calidad de las respuestas puede ser inferior a la del checkpoint original en safetensors.
- Idiomas limitados: solo se declaran coreano e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto no documentado: la model card no especifica la longitud de contexto nativa del modelo; el ejemplo de uso fija `-c 4096`, pero no se confirma que sea el máximo soportado.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni de tasas de alucinación en la información disponible.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad del modelo original.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo original y las marcas "Kanana" y "Kakao", que pertenecen a sus respectivos titulares.
- Sin soporte de tool calling ni agentes documentado: no se debe asumir que el modelo soporte function calling en producción sin validación previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/horongbul/kanana-1.5-8b-instruct-2505-GGUF
- Modelo base original: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- llama.cpp (herramienta de conversión y cuantización): https://github.com/ggml-org/llama.cpp
