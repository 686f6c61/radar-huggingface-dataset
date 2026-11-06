# isilicon/mango-cyberstrike-offsec-35b-q5k

## Resumen

Mango CyberStrike OffSec 35B Q5_K es un espejo de preservación del modelo huihui-ai/Huihui-CyberStrike-OffSec-35B-abliterated, publicado por el usuario isilicon bajo la etiqueta "Mango". No se trata de un modelo original: el repositorio conserva los bytes exactos del GGUF cuantizado en Q5_K publicado por huihui-ai, junto con manifiestos de integridad (SHA-256), la licencia y los ficheros de procedencia del autor original. El modelo subyacente es un CyberStrike-OffSec-35B de oyildirim, sometido a una "abliteration" (eliminación del rechazo) por huihui-ai como prueba de concepto.

Con 35.505.251.456 parámetros totales y un payload de 25,35 GB en cuantización Q5_K, es un modelo denso orientado a generación de texto y tareas conversacionales, con especial énfasis declarado en seguridad ofensiva. La relevancia de este repositorio es fundamentalmente de trazabilidad y reproducibilidad: permite descargar una revisión fijada por hash del GGUF original, algo útil cuando el repositorio upstream cambia o desaparece.

Es importante subrayar que el repositorio no aporta una evaluación de calidad propia: el estado declarado es "preserved candidate · quality ungraded" y no se ha publicado ninguna puntuación Mango para estos ficheros exactos. La información sobre arquitectura interna, datos de entrenamiento y benchmarks del modelo base no está disponible en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base CyberStrike-OffSec-35B de oyildirim; detalles no publicados en la informacion disponible) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de carga usa `--ctx-size 32768`, no confirmado como maximo nativo) |
| Tipos de cuantizacion | Q5_K (unico fichero publicado en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero `Huihui-CyberStrike-OffSec-35B-abliterated-Q5_K.gguf`, 25,34753 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base (tipo de transformer, atencion, capas, dimensiones ocultas) en la informacion proporcionada. El autor del repositorio espejo no documenta la arquitectura; solo indica que se requiere una build de llama.cpp compatible con la arquitectura del modelo y la plantilla de chat correcta del origen.

Respecto al entrenamiento, la unica informacion disponible es de procedencia: el modelo deriva de oyildirim/CyberStrike-OffSec-35B, y huihui-ai aplico una modificacion descrita como "abliteration" (proof-of-concept), una tecnica que busca eliminar el comportamiento de rechazo ajustando direcciones en el espacio de activaciones o pesos. No se detallan volumen de tokens, composicion del dataset, ni si hubo RLHF, DPO o fases de alineamiento adicionales. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal; la model card menciona que no se incluye un "draft head" ni un proyector multimodal en el manifiesto seleccionado, sin aclarar si existen upstream.

## Capacidades

- Generacion de texto conversacional multi-turno: el pipeline declarado es text-generation y la libreria GGUF es compatible con llama.cpp.
- Enfoque declarado en seguridad ofensiva ("OffSec"): el modelo base esta etiquetado como especializado en ciberseguridad ofensiva, aunque esta etiqueta es de procedencia y no una capacidad medida por el espejo.
- Comportamiento sin rechazo (abliterated): la modificacion de huihui-ai elimina el comportamiento de rechazo, lo que cambia el perfil de respuestas ante peticiones sensibles.
- Soporte de plantillas de chat: requiere `--jinja` en llama-server para aplicar la plantilla del modelo original.
- Tool calling / function calling: la model card menciona que la evaluacion local del autor cubre tareas de texto y herramientas, pero no se publican resultados para estos ficheros exactos.
- Capacidades multimodales (imagen/audio): no confirmadas; el manifiesto no declara proyector ni artefactos companion.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Analisis de seguridad ofensiva en laboratorio: el modelo esta etiquetado como especializado en OffSec y puede emplearse en entornos controlados para generar hipotesis de ataque, explicar tecnicas y redactar informes de pentesting, siempre con autorizacion expresa y aislamiento de red.
- Formacion y concienciacion en ciberseguridad: gracias a su perfil sin rechazo, permite simular escenarios de ingenieria social o red team en ejercicios educativos donde otros modelos censurarian la respuesta.
- Investigacion sobre abliteration: util como caso de estudio reproducible para medir como la eliminacion del rechazo afecta a la utilidad, la seguridad y la coherencia en un modelo de 35B.
- Auditoria de cadena de suministro de modelos: el repositorio fija revisiones por hash SHA-256 y conserva manifiestos, lo que permite verificar que los pesos desplegados coinciden con los auditados en un pipeline de MLOps.
- Despliegue local en estaciones de trabajo con GPU consumer de gama alta: con 25,35 GB en Q5_K, cabe en GPUs con 32 GB o mas (por ejemplo RTX 5090) y permite inferencia offline sin dependencia de APIs externas.
- Generacion de documentacion tecnica de seguridad: redaccion de runbooks, checklists de hardening y descripciones de vulnerabilidades en un entorno air-gapped, donde no se puede enviar informacion a servicios en la nube.
- Archivado y preservacion a largo plazo: util para equipos que necesitan conservar una copia inmutable de un modelo que puede ser retirado del repositorio upstream por cambios de politica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no existe una puntuacion de calidad Mango para estos ficheros exactos ("Preserved candidate · quality ungraded") y que la evaluacion completa requiere un protocolo de 202 preguntas, 12 casos de agente y verificacion de archivo que no se ha completado para esta release. La unica cifra de evaluacion presente en la model card corresponde a un estudio separado sobre otro modelo (Qwen, cohorte de 404 preguntas) y no es aplicable a este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q5_K ocupa 25,35 GB en disco; en VRAM se necesita espacio adicional para el KV cache, buffers de computo y overhead del runtime. Con contexto de 32.768 tokens y cache K/V en q8_0, una estimacion conservadora situa el total por encima de los 28-30 GB.
- GPU recomendadas: RTX 5090 (32 GB), RTX 4090 (24 GB, requeriria offload parcial a CPU o contexto reducido), A100 40/80 GB, H100 80 GB, L40S 48 GB.
- Cabe en GPU consumer: si en RTX 5090 (32 GB) y en configuraciones multi-GPU consumer; en RTX 4090 de 24 GB no cabe completo en Q5_K y habria que usar offload parcial o una cuantizacion menor no publicada en este repositorio.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), y por compatibilidad GGUF, frontends como Ollama o LM Studio si aceptan el fichero. vLLM y TGI no soportan GGUF de forma nativa en todos los casos; no disponible confirmacion para este modelo.
- Parametros de carga sugeridos por el autor: `--ctx-size 32768 --jinja --flash-attn on --cache-type-k q8_0 --cache-type-v q8_0`.
- Latencia y throughput: no disponibles; no se han publicado mediciones para estos ficheros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Mango CyberStrike OffSec 35B Q5_K (este) | 35,5B | no disponible | Q5_K (25,35 GB) | apache-2.0 | Espejo de preservacion, sin evaluacion de calidad publicada |
| huihui-ai/Huihui-CyberStrike-OffSec-35B-abliterated-GGUF | 35B (upstream) | no disponible | varias (upstream) | apache-2.0 | Fuente inmediata; puede cambiar o retirarse |
| oyildirim/CyberStrike-OffSec-35B | 35B (base) | no disponible | no disponible | no disponible | Modelo original sin abliteration |
| Alternativas generalistas de ~30-35B denso | ~30-35B | variable | variable | variable | No disponible comparacion de rendimiento por falta de benchmarks |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo "abliterated": la eliminacion del rechazo implica que el modelo puede generar contenido danino, instrucciones de ataque o material sensible sin las salvaguardas habituales. Requiere uso en entornos controlados y con autorizacion.
- Sin evaluacion de calidad: el repositorio declara explicitamente "quality ungraded"; no hay evidencia publicada de rendimiento en tareas reales para estos ficheros.
- Riesgo de alucinacion: no cuantificado; al ser un modelo de 35B sin benchmarks publicados, no se puede estimar su fiabilidad factual.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitaciones de contexto e idioma: no documentadas; el ejemplo de carga usa 32.768 tokens, pero no se confirma que sea el maximo nativo.
- Licencia: apache-2.0 declarada por el espejo y por el upstream inmediato, pero la cadena de procedencia (oyildirim/CyberStrike-OffSec-35B) no detalla terminos propios; conviene verificar la licencia del modelo base antes de uso comercial.
- Integridad: el repositorio fija una revision concreta (`21e0aa060fc0729499717934f59dffe4c1a017f4`); descargar desde `main` sin fijar revision puede devolver una documentacion distinta aunque los pesos preservados no cambien.
- Compatibilidad: requiere una build de llama.cpp con soporte para la arquitectura del modelo; no se garantiza funcionamiento en vLLM, TGI u otros runtimes.
- Responsabilidad legal: el uso ofensivo de las capacidades del modelo sin autorizacion puede ser ilegal en la mayoria de jurisdicciones; el autor del espejo no asume responsabilidad sobre el uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/isilicon/mango-cyberstrike-offsec-35b-q5k
- Modelo base inmediato: https://huggingface.co/huihui-ai/Huihui-CyberStrike-OffSec-35B-abliterated-GGUF
- Modelo original citado por el publisher: https://huggingface.co/oyildirim/CyberStrike-OffSec-35B
- Coleccion Mango de modelos probados y espejos: https://huggingface.co/collections/isilicon/mango-tested-models-and-preservation-mirrors-6ae3b73994c895ab42e360d2
- Dataset de resultados de evaluacion Mango: https://huggingface.co/datasets/isilicon/mango-evaluation-results
- Estudio Qwen medium vs xhigh (referenciado en la model card): https://huggingface.co/isilicon/mango-qwen38-27b-uncensored-mlx4#qwen-medium-versus-xhigh
- Comunidad Discord de Infinity: https://discord.gg/5n5YDbQCMy
- Perfil del autor del espejo: https://huggingface.co/isilicon
