# ItsPeet/Qwen3.5-9B-NeoHorse1-Heretic-NOESIS-BF16-GGUF-Q6_K-GGUF

## Resumen
ItsPeet/Qwen3.5-9B-NeoHorse1-Heretic-NOESIS-BF16-GGUF-Q6_K-GGUF es una cuantizacion GGUF en Q6_K del modelo AMAImedia/Qwen3.5-9B-NeoHorse1-Heretic-NOESIS-BF16-GGUF, un fine-tuning de la familia Qwen3.5 de 9B parametros. El autor del repositorio (ItsPeet) no ha entrenado el modelo, sino que ha convertido el checkpoint BF16 original a formato GGUF mediante el espacio GGUF-my-repo de ggml.ai, empaquetando los pesos en un unico fichero Q6_K de aproximadamente 7,4 GB.

El modelo subyacente combina una base Qwen3.5 con un pipeline de post-entrenamiento orientado a razonamiento, matematicas, STEM, uso de herramientas y codigo, segun las etiquetas del autor (distillation, SFT, RL con GSPO, LoRA-merge con DARE-TIES). Ademas incorpora modificaciones de tipo "heretic/abliterated/uncensored", es decir, ajustes que eliminan o atenuan las capas de rechazo y alineamiento de seguridad del modelo original, lo que cambia radicalmente su perfil de riesgo para produccion.

La relevancia de esta ficha es doble: por un lado documenta un modelo de 9B con licencia Apache 2.0, contexto y capacidades propias de Qwen3.5 (no confirmadas en la informacion disponible), y por otro advierte de que se trata de un derivado "decensored" con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni model card detallada mas alla de la conversion GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5`); detalles de atencion no disponibles |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (este repo); el repo base ofrece BF16 |
| Idiomas soportados | 119 idiomas declarados en la model card, entre ellos en, es, ru, zh, ja, de, fr, pt, ar, hi, ko, vi, tr, etc. |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero `qwen3.5-9b-neohorse1-heretic-noesis-bf16-gguf-q6_k.gguf`); el base en BF16 safetensors/GGUF |
| Tamano del repo | 7,4 GB |
| Libreria declarada | transformers (con soporte llama.cpp) |
| Pipeline | no disponible |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta `qwen3_5` y la referencia a un transformer de 9B parametros. El tag `mtp` sugiere soporte de multi-token prediction, y `noesis`/`noesis-repack` apunta a un pipeline de repackaging propio del autor original (AMAImedia). No se especifican numero de capas, dimensiones ocultas, tipo de atencion ni longitud de contexto nativa.

En cuanto al entrenamiento, las etiquetas indican una combinacion de distillation (posiblemente desde DeepSeek, por el tag `deepseek`), SFT, RL con GSPO y merge de LoRA mediante DARE-TIES. Tambien aparecen etiquetas `heretic`, `uncensored`, `decensored` y `abliterated`, que describen tecnicas de edicion de pesos para eliminar direcciones de rechazo. No se publican datos sobre volumen de tokens, composicion del dataset, ni detalles del proceso de alineamiento. Esta ficha (ItsPeet) es unicamente una conversion de formato: no hay entrenamiento adicional.

## Capacidades
- Generacion de texto y razonamiento multi-paso (tags `reasoning`, `agentic`).
- Matematicas y STEM (tags `math`, `stem`).
- Generacion de codigo (tag `coding`).
- Tool calling y function calling (tags `tool-use`, `function-calling`).
- Soporte de agentes y flujos multi-turno (tag `agentic`).
- Instrucciones en 119 idiomas declarados, incluido el espanol.
- Modo "uncensored": responde sin las capas de rechazo habituales del modelo base.
- Compatible con llama.cpp (CLI y servidor) y con text-generation-inference segun tags.
- No se documentan capacidades de vision ni audio.

## Casos de uso
- Evaluacion de robustez y red-teaming: el caracter abliterated permite estudiar como se comporta un modelo sin alineamiento de seguridad, util para equipos de seguridad que quieran medir riesgos antes de desplegar modelos abiertos.
- Investigacion sobre edicion de pesos: comparar el comportamiento del BF16 original frente a la version "heretic" para analizar que capacidades se degradan al aplicar abliteration.
- Despliegue local en estaciones de trabajo: el fichero Q6_K de 7,4 GB cabe en GPUs consumer de 12-16 GB y permite inferencia offline con llama.cpp sin dependencias de nube.
- Prototipado de agentes con tool calling: el modelo declara soporte de function calling y puede integrarse en bucles de agente para tareas de automatizacion internas, siempre con validacion humana.
- Generacion de codigo en entornos controlados: util para autocompletado o generacion de scripts en pipelines internos donde la licencia Apache 2.0 facilita la integracion.
- Traduccion y procesamiento multilingue: con 119 idiomas declarados, puede usarse para tareas de traduccion o clasificacion en idiomas de baja representacion, aunque sin benchmarks que lo respalden.
- Experimentacion con razonamiento matematico/STEM: para comparar curvas de rendimiento entre cuantizaciones Q6_K y BF16 en tareas de matematicas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para Q6_K: en torno a 8-10 GB para pesos mas overhead de contexto; el fichero pesa 7,4 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) o superiores para contexto largo; A100/H100 solo si se necesita batch grande o BF16.
- Cabe en GPU consumer: si, en tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090).
- Opciones de despliegue: llama.cpp (CLI y llama-server), Ollama (importando el GGUF), y potencialmente TGI segun tags; vLLM no esta confirmado para este formato.
- Latencia y throughput: no disponibles. Como referencia general de la clase 9B en Q6_K, es esperable decenas de tokens/s en RTX 4090, pero no hay medicion publicada para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ItsPeet/Qwen3.5-9B-NeoHorse1-Heretic-NOESIS-Q6_K (este) | 8,95B | no disponible | Apache 2.0 | GGUF Q6_K | Derivado uncensored, sin benchmarks |
| AMAImedia/Qwen3.5-9B-NeoHorse1-Heretic-NOESIS-BF16 | 8,95B | no disponible | Apache 2.0 | BF16 GGUF | Modelo base de este repo |
| Qwen3.5-9B (oficial, si existe en la familia) | ~9B | no disponible | Apache 2.0 (segun familia Qwen) | safetensors/GGUF | Referencia alineada; sin datos confirmados en esta busqueda |
| Otros 9B abliterated de la comunidad | ~8-9B | variable | variable | GGUF | Alternativas cualitativas; no se dispone de datos concretos |

No se dispone de informacion suficiente para comparar rendimiento numerico con alternativas concretas.

## Limitaciones y advertencias
- Modelo "uncensored/abliterated": se han eliminado o atenuado las capas de rechazo, por lo que puede generar contenido danino, ilegal o inseguro sin filtros. No apto para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo elevado de alucinacion: no hay benchmarks que validen sus capacidades reales; las etiquetas del autor no constituyen evidencia.
- Sin model card detallada: no se documentan datos de entrenamiento, contexto nativo ni limitaciones conocidas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- La licencia Apache 2.0 se hereda del modelo base, pero el uso comercial de un modelo abliterated puede incumplir politicas de proveedores o normativas sectoriales; revisar caso por caso.
- Idiomas: aunque se declaran 119, no hay evaluacion de calidad por idioma; el espanol figura en la lista pero sin datos de rendimiento.
- Conversion GGUF no verificada por el autor original; posibles diferencias de calidad frente al BF16.
- No se especifica longitud de contexto; usar valores conservadores (2K-8K) hasta confirmar.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/ItsPeet/Qwen3.5-9B-NeoHorse1-Heretic-NOESIS-BF16-GGUF-Q6_K-GGUF
- Modelo base: https://huggingface.co/AMAImedia/Qwen3.5-9B-NeoHorse1-Heretic-NOESIS-BF16-GGUF
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
