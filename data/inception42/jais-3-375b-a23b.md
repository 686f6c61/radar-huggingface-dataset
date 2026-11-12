# inception42/Jais-3-375B-A23B

## Resumen

Jais-3-375B-A23B es el modelo insignia de la familia Jais-3, desarrollado por inception42. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) dispersa que almacena 375B parametros totales y activa aproximadamente 23B por token, con una ventana de contexto de 512K tokens. El modelo esta disenado para generacion de texto, razonamiento y conversacion, con soporte nativo de arabe e ingles.

El modelo resuelve el problema de ofrecer capacidades de razonamiento de gran escala con un coste de inferencia contenido: al activar solo ~23B parametros por token, el computo por token se mantiene en el orden de un modelo denso de ese tamano, mientras que la capacidad representacional se aproxima a la de un modelo denso de 375B. Su ventana de 512K tokens lo posiciona para tareas de contexto largo, como analisis de documentos extensos o conversaciones multi-turno prolongadas.

Es relevante ahora porque combina una licencia permisiva (Apache 2.0), soporte bilingue arabe-ingles poco habitual en modelos de esta escala y una version cuantizada en FP8 publicada por separado, lo que facilita su despliegue en infraestructura de inferencia profesional. El repositorio ocupa 5.308,4 GB, coherente con los 379.167.159.168 parametros reales almacenados en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) dispersa, transformer |
| Parametros totales | 379.167.159.168 (~375B) |
| Parametros activos | ~23B por token |
| Longitud de contexto | 512K tokens |
| Tipos de cuantizacion | FP8 (version oficial IFM/Jais-3-375B-A23B-FP8); otras no disponibles |
| Idiomas soportados | Arabe (ar) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, custom_code) |

## Arquitectura y entrenamiento

Jais-3-375B-A23B emplea una arquitectura transformer con capas de Mixture-of-Experts dispersa. El modelo almacena 375B parametros y activa aproximadamente 23B por token, lo que reduce el coste computacional por paso de decodificacion respecto a un modelo denso del mismo tamano total. La model card no detalla el numero de expertos, la estrategia de enrutamiento ni la composicion exacta de las capas MoE.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion. La model card tampoco describe innovaciones tecnicas adicionales como decodificacion especulativa o mecanismos de atencion lineal. El modelo requiere `custom_code` y `trust_remote_code` para su carga en transformers, y esta etiquetado con el identificador de arquitectura `k2_horizon`.

## Capacidades

- Generacion de texto y conversacion multi-turno en arabe e ingles.
- Razonamiento (etiqueta `reasoning` en la model card) y capacidades conversacionales.
- Ventana de contexto de 512K tokens, adecuada para documentos y dialogos extensos.
- Soporte bilingue nativo arabe-ingles.
- No se documenta en la informacion disponible soporte de tool calling, function calling, agentes, vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Atencion al cliente bilingue arabe-ingles: el modelo puede gestionar conversaciones multi-turno prolongadas gracias a su ventana de 512K tokens, manteniendo el contexto de interacciones anteriores sin truncamiento.
- Analisis de documentos extensos en arabe: informes, contratos o expedientes de gran longitud pueden procesarse en una sola pasada de contexto, extrayendo resumenes y respuestas sobre el contenido.
- Generacion de contenido editorial en arabe: redaccion y reescritura de articulos, notas de prensa o material divulgativo con calidad linguistica nativa.
- Asistentes de investigacion: sintesis de corpus documentales y respuesta a preguntas sobre multiples fuentes dentro de una misma ventana de contexto.
- Traduccion asistida arabe-ingles: el soporte bilingue permite tareas de traduccion y adaptacion cultural en entornos profesionales.
- Despliegue en infraestructura propia con FP8: la version cuantizada en FP8 permite servir el modelo en clusters con GPUs de centro de datos, reduciendo requisitos de memoria frente a los pesos en precision completa.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativos frente a Qwen3.5-397B-A17B, MiniMax M3, Qwen3.8-Flash-Next y NVIDIA Nemotron 3 Ultra, con secciones de generacion abierta (AraGen) y otras categorias. No obstante, en la informacion proporcionada la tabla aparece truncada y no se incluyen los valores numericos de las puntuaciones, por lo que no es posible reproducir cifras concretas de MMLU, HumanEval, GSM8K ni de los benchmarks propios.

Datos estructurales de la comparativa publicada en la model card:

| Modelo | Parametros totales | Parametros activos | Arquitectura |
|---|---|---|---|
| Jais-3-375B-A23B | 375B | 23B | MoE |
| Qwen3.5-397B-A17B | 397B | 17B | MoE |
| MiniMax M3 | 428B | 23B | MoE |
| Qwen3.8-Flash-Next | 180B | 6B | MoE |
| NVIDIA Nemotron 3 Ultra | 550B | 55B | MoE |

No se han publicado en la informacion disponible los valores numericos de los benchmarks.

## Requisitos de hardware

- VRAM estimada: los pesos en precision completa (BF16) requieren aproximadamente 758 GB solo para parametros, mas overhead de activaciones y cache KV. La version FP8 reduce los pesos a aproximadamente 379 GB.
- La ventana de 512K tokens implica una cache KV considerable; el coste real dependera del numero de cabezas y capas, dato no disponible.
- GPU recomendadas: para FP8, nodos multi-GPU con H100 (80 GB) o H200; para precision completa, configuraciones de multiples nodos. No cabe en GPU de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU profesional de 80 GB en precision completa.
- Opciones de despliegue: transformers con `trust_remote_code` y `custom_code`; no se documenta soporte verificado de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Idiomas |
|---|---|---|---|---|---|
| Jais-3-375B-A23B | 375B | 23B | 512K | Apache 2.0 | ar, en |
| Qwen3.5-397B-A17B | 397B | 17B | no disponible | no disponible | no disponible |
| MiniMax M3 | 428B | 23B | no disponible | no disponible | no disponible |
| NVIDIA Nemotron 3 Ultra | 550B | 55B | no disponible | no disponible | no disponible |

Los datos de contexto, licencia e idiomas de los modelos de referencia no aparecen en la informacion proporcionada. Jais-3 destaca por su menor ratio de parametros activos frente a Nemotron 3 Ultra (23B frente a 55B) y por su enfoque bilingue arabe-ingles, poco comun en esta escala.

## Limitaciones y advertencias

- Solo se documentan arabe e ingles; el rendimiento en otras lenguas no esta garantizado.
- Riesgo de alucinacion inherente a los modelos generativos de gran escala; no se documentan evaluaciones especificas de factualidad.
- No se dispone de informacion sobre sesgos evaluados ni sobre procesos de alineacion (RLHF/DPO), lo que dificulta anticipar comportamientos en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo requiere `trust_remote_code` y `custom_code`, lo que implica ejecutar codigo del autor; conviene auditar ese codigo antes de desplegarlo.
- El tamano del repositorio (5.308,4 GB) exige almacenamiento y ancho de banda considerables para su descarga y despliegue.
- No se documenta soporte de tool calling ni de agentes, por lo que su uso en pipelines automatizados con llamadas a funciones no esta verificado.
- La tabla de benchmarks de la model card esta truncada en la informacion disponible; no deben asumirse resultados superiores sin verificar las cifras originales.

## Enlaces

- Hugging Face: https://huggingface.co/inception42/Jais-3-375B-A23B
- Version FP8: https://huggingface.co/IFM/Jais-3-375B-A23B-FP8
- Paper (arXiv): arXiv:2611.10224
- Imagen de benchmarks: https://huggingface.co/inception42/Jais-3-375B-A23B/resolve/main/assets/jais-3-375b-a23b-benchmarks.png
