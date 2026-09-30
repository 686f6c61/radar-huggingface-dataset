# mdagosta/waldito-smoke-v1-r0001-u1-mdagosta

## Resumen

Waldito Smoke v1 (identificador `mdagosta/waldito-smoke-v1-r0001-u1-mdagosta`) es un artefacto de modelo publicado por el usuario mdagosta (Michael D'Agosta) en HuggingFace. Segun la model card, se trata de una exportacion del proyecto OpenWALDO que emplea la arquitectura estandar de modelo causal de lenguaje Llama de Transformers, junto con el tokenizer de bytes "schema-1" propio de OpenWALDO. El tag `llama` y la libreria `transformers` confirman esa base arquitectonica.

El dato mas relevante para evaluar el modelo es su tamano real: 820.736 parametros totales segun los pesos en safetensors. Se trata, por tanto, de un modelo de menos de un millon de parametros, varios ordenes de magnitud por debajo de cualquier LLM de uso general. El sufijo "smoke" del nombre y el hecho de que exista una revision posterior (`r0002-merge`) apuntan a un artefacto de prueba de humo o validacion de pipeline mas que a un modelo destinado a produccion, aunque esto no se declara explicitamente en la informacion disponible.

El paquete incluye ficheros de gobernanza poco habituales en modelos de este tamano: `BOM.json` (inventario de todos los ficheros de la release) y `EU-BOM.json` (mapeo de divulgacion de contenido de entrenamiento conforme al regimen de GPAI de la UE). Esa trazabilidad es el elemento diferencial del proyecto, mas que las capacidades generativas del modelo en si.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama causal-language-model (segun model card), implementacion estandar de Transformers |
| Parametros totales | 820.736 (dato real de los pesos safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se listan variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | no disponible (no se declara lista de idiomas; el tokenizer es de bytes) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizer | OpenWALDO schema-1, tokenizer de bytes; requiere `trust_remote_code=True` |
| Libreria | transformers |
| Pipeline | text-generation |
| Tarea / tags | text-generation, conversational, text-generation-inference, endpoints_compatible |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 124 / 0 |
| Fecha de creacion | 2026-09-30 |
| Fecha de ultima actualizacion | 2026-09-30 |

## Arquitectura y entrenamiento

La model card indica que el paquete utiliza "the standard Transformers Llama causal-language-model architecture" con el tokenizer de bytes schema-1 de OpenWALDO. No se proporciona informacion sobre numero de capas, dimension de embedding, numero de cabezas de atencion, tipo de normalizacion, activaciones ni si se aplican variantes como atención con ventana deslizante, GQA o decodificacion especulativa. Tampoco se documenta si hay componentes adicionales fuera del bloque transformer estandar.

No hay ningun dato sobre el proceso de entrenamiento: ni volumen de tokens, ni composicion del dataset, ni si hubo fases de ajuste supervisado, RLHF o DPO. El unico elemento relacionado es `EU-BOM.json`, descrito como el mapeo de divulgacion de contenido de entrenamiento para GPAI de la UE, lo que sugiere que el autor ha preparado documentacion de trazabilidad, pero el contenido de ese fichero no se reproduce en la informacion disponible. Del mismo modo, `BOM.json` se describe como inventario de ficheros de la release. No se documenta ninguna innovacion tecnica en atencion, tokenizacion (mas alla del esquema de bytes) o decodificacion.

## Capacidades

- Generacion de texto causal, segun el pipeline declarado (`text-generation`).
- Conversacion: el tag `conversational` sugiere soporte de formato de dialogo, aunque no se especifica plantilla de chat ni tokens especiales.
- Tokenizacion a nivel de byte mediante el esquema schema-1 de OpenWALDO, lo que en principio permite representar cualquier secuencia de bytes sin tokens fuera de vocabulario; no se documenta el tamano del vocabulario ni su comportamiento empirico.
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito.
- Capacidades multilingues: no disponibles; no se declara ningun idioma.
- Con 820.736 parametros, la capacidad de generar texto coherente, razonar o resolver problemas esta, en la practica, sin evidencia publicada.

## Casos de uso

- Prueba de humo de pipelines de despliegue: dado su tamano (0,82 M de parametros), el modelo sirve para verificar que un flujo completo de carga de tokenizer con `trust_remote_code`, carga de pesos safetensors y generacion funciona de extremo a extremo antes de desplegar un modelo grande. El nombre "smoke" es coherente con este uso.
- Validacion de integracion con text-generation-inference y endpoints compatibles: permite comprobar configuracion de contenedores, rutas, health checks y contratos de API sin consumir VRAM relevante.
- Pruebas de CI/CD en repositorios de ML: al ocupar practicamente cero espacio (repo de 0.0 GB), es util para tests automatizados de serializacion, conversion de formatos o verificacion de esquemas de ficheros como `BOM.json` y `EU-BOM.json`.
- Verificacion de tokenizers personalizados: el esquema de bytes schema-1 permite validar el comportamiento de codificacion y decodificacion byte a byte, incluyendo casos limite (bytes invalidos en UTF-8, secuencias binarias), antes de aplicarlo a modelos mayores.
- Auditoria de trazabilidad y cumplimiento GPAI: los ficheros de BOM y de divulgacion de contenido de entrenamiento pueden usarse como plantilla o referencia para estructurar la documentacion regulatoria de otras releases del mismo proyecto.
- Docencia y demostraciones de arquitectura: al ser un modelo Llama completo pero minimo, permite inspeccionar pesos, capas y flujo de atencion en un entorno controlado sin necesidad de GPU.
- Reproducibilidad de releases: la existencia de varias revisiones (`r0001`, `r0002-merge`) permite practicar flujos de versionado de artefactos y comparacion de revisiones dentro de un mismo repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra evaluacion estandar, ni del propio modelo ni comparado con alternativas. Tampoco se publican metricas de perplejidad, latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: partiendo de 820.736 parametros, el peso en precision completa (FP32) ocupa aproximadamente 3,3 MB; en FP16/BF16, unos 1,6 MB; en INT8, unos 0,8 MB. A ello hay que sumar el estado de activaciones y el cache KV, cuyo tamano depende de la longitud de contexto, que no se ha publicado.
- GPU recomendadas: cualquier GPU, incluida una integrada o una NVIDIA de gama de entrada. No se requiere A100, H100 ni siquiera una RTX 4090.
- Cabe en GPU de consumo: si, en cualquier modelo con al menos unos pocos megabytes de memoria libre. Tambien cabe holgadamente en CPU.
- Opciones de despliegue: la libreria declarada es `transformers`; el tag incluye text-generation-inference y `endpoints_compatible`. No se documenta soporte de llama.cpp, Ollama, vLLM ni TGI mediante pesos ya convertidos, y no se publican variantes GGUF. La carga del tokenizer requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio y debe evaluarse como riesgo de seguridad.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se ha identificado en la informacion disponible ningun modelo publico directamente comparable con 820.736 parametros y tokenizer de bytes bajo el esquema OpenWALDO. La tabla siguiente situa el modelo frente a alternativas del tramo mas pequeno de LLM publicos; los datos de las alternativas son ordenes de magnitud ampliamente conocidos y no provienen de la informacion de busqueda proporcionada, por lo que deben verificarse antes de citarlos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| waldito-smoke-v1-r0001-u1-mdagosta | 820.736 (0,82 M) | no disponible | no disponible | HuggingFace, safetensors |
| SmolLM-135M (HuggingFace) | ~135 M | no verificado en esta busqueda | no verificado | HuggingFace |
| Qwen2.5-0.5B | ~0,5 B | no verificado en esta busqueda | no verificado | HuggingFace |
| TinyLlama-1.1B | ~1,1 B | no verificado en esta busqueda | no verificado | HuggingFace |

La diferencia de escala con las alternativas es de dos a tres ordenes de magnitud, de modo que cualquier comparacion de calidad generativa carece de sentido con los datos actuales. La comparativa relevante para este artefacto es de proposito (pruebas de humo, trazabilidad) y no de rendimiento.

## Limitaciones y advertencias

- Con 820.736 parametros, la capacidad de generar texto util, mantener coherencia conversacional o resolver tareas de razonamiento es, como minimo, altamente dudosa; no hay ninguna evaluacion publicada que la respalde.
- No se declara licencia. Esto impide determinar si el uso comercial esta permitido; en ausencia de licencia explicita, debe asumirse que no hay autorizacion clara y contactar con el autor antes de cualquier uso en produccion.
- No se declaran idiomas soportados, por lo que no puede garantizarse un comportamiento correcto en castellano ni en ninguna otra lengua.
- No se documenta la longitud de contexto, lo que impide planificar aplicaciones multi-turno o de documento largo.
- La carga del tokenizer requiere `trust_remote_code=True`, es decir, ejecucion de codigo arbitrario incluido en el repositorio. Es un vector de riesgo de seguridad en entornos compartidos o automatizados.
- No se publica informacion sobre datos de entrenamiento (composicion, volumen, filtrado, origen). Existen ficheros de divulgacion (`EU-BOM.json`) pero su contenido no esta disponible en esta busqueda, por lo que no pueden evaluarse sesgos ni riesgos de contaminacion.
- Riesgo de alucinacion: no cuantificado; en modelos de este tamano la generacion de texto suele degradar rapidamente hacia repeticiones o salidas sin sentido, aunque no hay datos que lo confirmen para este artefacto concreto.
- El modelo pertenece a un proyecto en evolucion con multiples revisiones (`r0001`, `r0002-merge`), lo que sugiere que los artefactos pueden cambiar o quedar obsoletos con rapidez.
- El tamano del repositorio se reporta como 0.0 GB, probablemente por redondeo de una release minima; conviene verificar los ficheros reales antes de asumir que el paquete esta completo.
- Las fechas de creacion y actualizacion son identicas (2026-09-30), lo que indica que no ha habido mantenimiento posterior documentado en esta revision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mdagosta/waldito-smoke-v1-r0001-u1-mdagosta
- Perfil del autor en HuggingFace: https://huggingface.co/mdagosta
- Perfil del autor en GitHub: https://github.com/mdagosta
- Sitio personal del autor: https://dagosta.com
- Sitio del autor: https://codebug.com
- Revision relacionada del mismo autor: mdagosta/waldito-smoke-v1-r0002-merge (referenciada en la busqueda, sin URL directa proporcionada)
- Paper, blog o repositorio oficial del proyecto OpenWALDO: no disponible en la informacion proporcionada
- Demo o Space asociado: no disponible
