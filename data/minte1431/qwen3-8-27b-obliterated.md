# minte1431/Qwen3.8-27B-OBLITERATED

## Resumen

Qwen3.8-27B-OBLITERATED es una variante "abliterated" del modelo Qwen/Qwen3.8-27B, publicada por el usuario minte1431 (que en su model card se identifica como OBLITERATUS) y fechada el 14 de septiembre de 2026. Se trata de un transformer denso de 27.781.427.952 parametros (27,78 B) al que se le ha eliminado quirurgicamente el comportamiento de rechazo mediante tecnicas de proyeccion de direcciones de rechazo en el espacio de pesos (SVD y LEACE). El objetivo declarado no es solo eliminar las negativas duras ("no puedo"), sino tambien las "deflexiones suaves" tipo leccion de seguridad sin sustancia.

La relevancia del modelo es acotada y muy especifica: esta pensado para red-teaming, investigacion en seguridad de IA y flujos de trabajo donde se necesita que el modelo responda sin filtros (por ejemplo, generacion de codigo de explotacion en entornos controlados). No es un modelo de proposito general mejorado: el propio autor documenta una perdida de 2,1 puntos porcentuales en MMLU respecto al modelo base (82,3% frente a 84,5%).

La ficha se basa exclusivamente en la informacion proporcionada por HuggingFace y en la model card del autor, que aparece truncada en la tabla de resultados de MMLU. Los resultados de la busqueda web realizada no contienen ningun enlace relevante sobre este modelo: las entradas devueltas tratan sobre WhatsApp y grabacion de llamadas en telefonos Xiaomi, por lo que no se han utilizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (model_type: qwen3, libreria mlx) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no detallados en la informacion disponible; los tags del repo incluyen gguf, safetensors y mlx, lo que implica al menos pesos completos y alguna cuantizacion GGUF/MLX |
| Idiomas soportados | no disponible (la model card no especifica idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF, MLX (segun tags y libreria declarada) |

Datos adicionales del repositorio: tamano de 237,1 GB, 0 descargas y 0 likes en el momento de la consulta, pipeline text-generation, creado y actualizado el 2026-09-14 (segundos de diferencia entre ambos eventos).

## Arquitectura y entrenamiento

No hay informacion sobre el preentrenamiento ni el post-entrenamiento del modelo base Qwen3.8-27B (numero de tokens, composicion del dataset, uso de RLHF o DPO). Lo que si describe el autor es el proceso de modificacion posterior, denominado abliteration, aplicado en tres iteraciones:

- V1: una unica pasada agresiva de SVD con 5 direcciones. Elimino los rechazos duros por completo, pero costo 6 puntos porcentuales de MMLU respecto al modelo stock.
- V2: "complementary abliteration blending". Se ejecutan dos cirugias distintas que fallan de forma diferente (SVD captura la direccion de rechazo de forma agresiva pero degrada capacidad; LEACE minimiza la informacion mutua, preserva mejor la capacidad pero elimina peor el rechazo) y se mezclan sus pesos en proporcion 60/40. Resultado: 0,3 puntos de perdida en MMLU, pero persistian deflexiones suaves.
- V3: refinamiento iterativo sobre V2 (nunca partiendo del modelo stock) mas una pasada de cirugia dirigida con un corpus especifico por categoria de deflexion, seguida de un blending de los resultados. Resultado: 2,1 puntos de perdida en MMLU y eliminacion de rechazos duros y suaves.

La model card tambien documenta el ajuste del chat template: en los GGUF de V3 se incluye una plantilla que prellena un bloque de pensamiento vacio, de modo que el modelo pasa directamente a responder. El modo thinking esta soportado tanto activado como desactivado, aunque el autor recomienda desactivarlo.

## Capacidades

- Generacion de texto conversacional de un solo turno y multiturno (pipeline declarado: text-generation, tag conversational).
- Generacion de codigo, incluyendo codigo de ciberseguridad: el autor reporta 20/20 en una bateria de 20 prompts de tareas de codigo/ciber con implementaciones funcionales.
- Razonamiento en modo thinking: soportado con `enable_thinking=True` y sin rechazos, aunque el autor recomienda desactivarlo para obtener respuestas mas directas.
- Uso en arneses de agentes: la model card incluye una seccion especifica de ajustes para agentes (repeticion, turnos, gestion de contexto), lo que implica soporte de bucles de llamadas a herramientas, si bien no se detalla un formato concreto de function calling.
- Respuestas sin rechazo a consultas restringidas: objetivo principal del ajuste.
- Capacidades multilingues: no disponible; la model card no documenta idiomas y no se puede asumir el comportamiento del modelo base.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Red-teaming de modelos y sistemas: el modelo genera contenido restringido sin deflexiones, lo que permite usarlo como atacante simulado para evaluar las defensas de otro sistema o de un clasificador de contenido.
- Investigacion en seguridad de IA: analisis del efecto de la abliteration sobre la capacidad del modelo, con el propio autor publicando la comparativa de MMLU entre las versiones V1, V2 y V3 y el modelo stock.
- Generacion de codigo de explotacion en laboratorio: los 20/20 reportados en tareas de codigo/ciber lo hacen util para construir pruebas de concepto en entornos aislados de pentesting autorizado.
- Simulacion de adversarios en formacion: generar escenarios de ingenieria social o de ataque para entrenar a equipos defensivos, sin las negativas que interrumpen el flujo.
- Evaluacion comparativa de salvaguardas: medir cuanto de la capacidad original (84,5% MMLU stock) se conserva tras distintos metodos de abliteration y que metodos preservan mejor el rendimiento.
- Agentes autonomos de codigo en contexto largo: la seccion de uso agentico de la model card (repetition_penalty 1,15, temperatura 0,1-0,3, 1024-2048 tokens por turno, resumen cada 10 turnos) esta pensada para arneses tipo agente de programacion o framework de pentest.
- Analisis de contenido sensible en moderacion: usar el modelo como generador de casos limite para construir datasets de entrenamiento de clasificadores.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (lm-eval-harness, 0-shot, n=100 por materia, 5700 preguntas en el caso del modelo stock):

| Modelo | MMLU (0-shot) | Diferencia vs stock |
|---|---|---|
| Qwen3.8-27B stock | 84,5% (n=5700) | — |
| V1 | 81,4% | -6,0 pp |
| V2 | 84,3% | -0,3 pp |
| V3 (este modelo) | 82,3% | -2,1 pp |

Otras metricas declaradas por el autor, sin detalle metodologico completo:

| Prueba | Resultado |
|---|---|
| Tareas de ciber/codigo (20 prompts) | 20/20 con codigo funcional |
| Tareas avanzadas del mundo real | 5/8 en stock, 7/8 en V3 |
| Modo thinking | Soporte en V1 no, V2 no (rechaza), V3 si |

El autor indica que cada respuesta fue auditada manualmente para verificar sustancia real y no solo la ausencia de la frase "I cannot". La informacion proporcionada se corta en la tabla de MMLU con desviacion estandar, por lo que no se dispone del resto de resultados detallados. No hay datos de GSM8K, HumanEval ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

Estimaciones derivadas del recuento de parametros (27,78 B). No son datos publicados por el autor:

- VRAM para inferencia en bf16/fp16: aproximadamente 55,6 GB solo de pesos, mas overhead de activaciones y cache KV. Necesita como minimo una GPU de 80 GB (A100 80GB, H100 80GB) o reparto multi-GPU.
- VRAM en cuantizacion de 8 bits: aproximadamente 28 GB, viable en una RTX 6000 Ada (48 GB), A6000 (48 GB) o L40S (48 GB).
- VRAM en cuantizacion de 4 bits (Q4_K_M o similar): aproximadamente 16-17 GB, cabe en una RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 5090.
- VRAM en cuantizacion de 3 bits: aproximadamente 13-14 GB, cabe en GPUs consumer de 16 GB, con degradacion de calidad esperable.
- El tamano del repositorio (237,1 GB) sugiere que se publican varios formatos y cuantizaciones en el mismo repositorio; no se detalla la lista exacta.
- Opciones de despliegue: llama.cpp y Ollama o LM Studio para los GGUF (el autor menciona `--jinja` para el chat template incluido), MLX para Apple Silicon (libreria declarada del repo), y transformers con `device_map="auto"` segun el ejemplo de codigo de la model card. vLLM y TGI no estan confirmados en la informacion disponible, aunque safetensors y licencia Apache-2.0 facilitarian su uso.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos abliterated de tamano comparable en la informacion proporcionada. La unica comparativa documentada es interna, contra el modelo base y contra las versiones previas del propio ajuste:

| Modelo | Parametros | MMLU 0-shot | Contexto | Licencia | Comportamiento ante consultas restringidas |
|---|---|---|---|---|---|
| Qwen3.8-27B stock | 27,78 B | 84,5% | no disponible | apache-2.0 (segun modelo base) | Rechaza |
| V1 (single surgery) | 27,78 B | 81,4% | no disponible | apache-2.0 | Rechazos duros eliminados |
| V2 (complementary blending) | 27,78 B | 84,3% | no disponible | apache-2.0 | Deflexiones suaves persisten |
| V3 (este modelo) | 27,78 B | 82,3% | no disponible | apache-2.0 | Responde con sustancia |

Comparativa con alternativas de otras familias: no disponible.

## Limitaciones y advertencias

- Perdida de capacidad medida: 2,1 puntos de MMLU respecto al modelo stock, y 0,3 puntos mas que la version V2. No es un ajuste sin coste.
- Sesgos conocidos: no documentados. Al eliminar direcciones de rechazo se puede alterar el comportamiento del modelo en dominios sensibles de formas no medidas; el autor no publica evaluaciones de sesgo, toxicidad ni seguridad mas alla de la liberacion.
- Riesgo de alucinacion: no evaluado en la informacion disponible. El autor advierte de que, con decodificacion greedy sin penalizacion de repeticion, el modelo entra en bucles sobre imports y codigo repetitivo.
- Sin validacion externa: 0 descargas y 0 likes en el momento de la consulta, repositorio creado el mismo dia de la consulta. No hay evaluaciones de terceros ni reproduccion independiente de los numeros de MMLU.
- Divergencia entre identificadores: la model card usa rutas como "OBLITERATUS/Qwen3.8-27B-OBLITERATED" en el ejemplo de codigo mientras el repositorio real es minte1431/Qwen3.8-27B-OBLITERATED. Hay que corregir la ruta antes de ejecutar el ejemplo.
- Riesgo legal y de cumplimiento: aunque la licencia declarada es apache-2.0, un modelo sin filtros de rechazo puede generar contenido ilicito o danino. Su uso en produccion orientada al publico exige capas de moderacion externas y una evaluacion juridica por jurisdiccion.
- Sensibilidad a los parametros: el autor insiste en usar temperature 0, repetition_penalty 1,15, max_new_tokens >= 2048 y system prompt vacio. Con system prompt se pueden reintroducir rechazos, lo que complica la integracion en pipelines que exigen un prompt de sistema.
- Contexto: el autor recomienda resumir el historial cada 10 turnos en uso agentico, lo que sugiere que ventanas muy largas degradan el comportamiento aunque no se publique la longitud de contexto nominal.
- Idiomas: no disponibles. No se puede asumir que el comportamiento sin rechazo se mantenga fuera del ingles.
- La informacion de la model card esta truncada, por lo que podrian existir resultados adicionales no recogidos aqui.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/minte1431/Qwen3.8-27B-OBLITERATED
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Papers, blogs, repositorios o demos adicionales: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los resultados obtenidos trataban sobre WhatsApp y grabacion de llamadas en Xiaomi y no se han utilizado).
