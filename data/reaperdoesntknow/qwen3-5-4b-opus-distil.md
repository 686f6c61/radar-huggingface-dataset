# reaperdoesntknow/Qwen3.5-4B-Opus-Distil

## Resumen

Qwen3.5-4B-Opus-Distil es un modelo de lenguaje y vision (vision-language model) de 4.205.751.296 parametros publicado por el usuario reaperdoesntknow en Hugging Face. Se trata de un ajuste fino del modelo base Qwen3.5-4B, destilado a partir de un modelo de referencia denominado "project-opus-distil" segun la nomenclatura de los ficheros. El autor ha empaquetado los pesos en formato GGUF mediante Unsloth, orientando el artefacto al ecosistema llama.cpp.

La relevancia del modelo radica en su combinacion de tamano reducido (4B) con capacidades multimodales (proyector mmproj incluido) y su disponibilidad directa en GGUF cuantizado Q4_K_M, lo que permite ejecucion en hardware de consumo. Con 3.126 descargas acumuladas, es un artefacto de nicho pero con traccion dentro de la comunidad de inferencia local.

No obstante, la informacion publicada es muy escasa: la model card no documenta licencia, idiomas, datos de entrenamiento, benchmarks ni composicion del dataset de destilacion. Cualquier evaluacion de produccion debe tratar estos extremos como no verificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language model); detalles no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (publicada); BF16 para el proyector mmproj |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); proyector multimodal en GGUF BF16 |

## Arquitectura y entrenamiento

El modelo deriva de Qwen3.5-4B, un transformer de 4.205 millones de parametros, y conserva el componente de vision mediante un proyector multimodal separado (fichero `BF16-mmproj.gguf`). El ajuste fino se realizo con Unsloth, segun indica el autor, y el pipeline de conversion produjo directamente artefactos GGUF. El nombre del proyecto ("project-opus-distil") sugiere una destilacion desde un modelo mayor, aunque no se especifica el modelo profesor, el volumen de tokens de destilacion, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

No hay informacion publicada sobre innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, modos de razonamiento explicito) mas alla de las inherentes al modelo base Qwen3.5. Tampoco se documenta el proceso de alineacion ni las fases de entrenamiento.

## Capacidades

- Generacion de texto conversacional en formato chat, invocable mediante `llama-cli` con plantilla Jinja (`--jinja`).
- Procesamiento de imagenes: el proyector mmproj permite inferencia multimodal con `llama-mtmd-cli`.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.5-4B (no verificados de forma independiente).
- Soporte de tool calling: no documentado en la model card; no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; no disponible.
- Capacidades multilingues: no documentadas; no disponible.
- Modo thinking explicito: no documentado; no disponible.

## Casos de uso

- Inferencia local en estaciones de trabajo sin GPU dedicada: el fichero Q4_K_M ocupa aproximadamente 2,5-2,7 GB, por lo que puede cargarse en equipos con 8 GB de RAM y CPU moderna mediante llama.cpp, con velocidades de decodificacion de un solo digito en tokens por segundo.
- Prototipado de asistentes multimodales: el par Q4_K_M + mmproj permite experimentar con descripcion de imagenes y preguntas visuales sin depender de APIs externas, usando `llama-mtmd-cli`.
- Evaluacion de destilaciones: util como referencia para comparar la calidad de un modelo 4B destilado frente al modelo profesor en tareas de razonamiento y codigo, siempre que se realice una evaluacion propia dado que no hay benchmarks publicados.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse completamente en local, es apto para procesar texto e imagenes sensibles sin salida de datos a terceros.
- Integracion en pipelines de llama.cpp: el formato GGUF permite incorporarlo a servidores `llama-server` compatibles con la API de OpenAI para pruebas de integracion.
- Educacion e investigacion: sirve como caso de estudio de ajuste fino con Unsloth y conversion a GGUF, y como ejemplo de publicacion de artefactos multimodales sin documentacion completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero Q4_K_M requiere aproximadamente 2,5-2,7 GB de memoria; el proyector mmproj BF16 anade unos cientos de MB. Para contexto largo, reservar 4-6 GB adicionales segun la ventana configurada.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo con offload completo; en A100/H100 el modelo queda limitado por ancho de banda y no aprovecha la capacidad de computo.
- GPU de consumo: si, cabe en RTX 3060 6 GB, RTX 4060 8 GB, RTX 4070 y superiores. Tambien es viable en CPU con 8 GB de RAM.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`, `llama-server`). No se han publicado artefactos para vLLM, TGI ni Ollama, aunque la conversion a Ollama es posible a partir del GGUF.
- Latencia y throughput: no disponibles de forma oficial. Como referencia orientativa para un 4B en Q4_K_M, se esperan decenas de tokens por segundo en GPU de consumo y un solo digito en CPU, sin datos medidos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-Opus-Distil | 4,2B | no disponible | Si (mmproj) | no disponible | GGUF |
| Qwen3.5-4B (base) | ~4B | no disponible | Segun variante | no disponible | safetensors/GGUF |
| Qwen2.5-VL-3B | ~3,75B | 32K (segun documentacion publica de la familia) | Si | Apache 2.0 (familia Qwen2.5) | safetensors/GGUF |
| Llama 3.2 3B Instruct | 3,2B | 128K | No (vision solo en 11B/90B) | Llama 3.2 Community License | safetensors/GGUF |

La comparativa es aproximada: los datos del modelo evaluado no estan documentados y los de las alternativas corresponden a sus fichas publicas. La principal diferencia es la ausencia de licencia explicita en este ajuste, frente a licencias conocidas en las alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica si se permite uso comercial; tratar como no apto para produccion hasta confirmacion del autor.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad, y el nombre "Opus-Distil" no garantiza el rendimiento del modelo profesor.
- Riesgo de alucinacion: inherente a modelos de 4B; sin evaluacion publicada no puede acotarse.
- Idiomas no documentados: no puede asumirse soporte de castellano ni de otros idiomas mas alla del ingles.
- Sesgos no evaluados: no hay model card con analisis de sesgos ni de seguridad.
- Contexto desconocido: no se indica la longitud de ventana soportada, lo que impide planificar cargas de contexto largo.
- Procedencia del ajuste: el autor es un particular; no hay garantia de mantenimiento, soporte ni reproducibilidad del pipeline de destilacion.
- Vision limitada: el proyector mmproj esta en BF16 y su calidad no ha sido evaluada; el rendimiento multimodal puede degradarse respecto al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3.5-4B-Opus-Distil
- Unsloth (herramienta de ajuste fino y conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia GGUF): https://github.com/ggml-org/llama.cpp
- Documentacion de llama.cpp para modelos multimodales (`llama-mtmd-cli`): https://github.com/ggml-org/llama.cpp/tree/master/tools/mtmd
