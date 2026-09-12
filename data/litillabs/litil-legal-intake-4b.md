# litillabs/litil-legal-intake-4b

## Resumen

LiTiL Legal Intake 4B es un adaptador LoRA de tipo PEFT desarrollado por litillabs sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. No es un modelo de lenguaje completo, sino una capa de decisión especializada que se acopla al transformer de 4.000 millones de parámetros del modelo base para resolver tareas acotadas de admisión legal (legal intake): comprobar si un expediente contiene la información necesaria, asignar una cola o código de enrutado, extraer un campo corto o indicar la siguiente acción del flujo de trabajo. El adaptador ocupa 132.187.888 bytes (unos 126 MB) y se distribuye en formato safetensors.

El problema que aborda es la falta de consistencia en la fase de admisión de asuntos legales, donde la clasificación manual de solicitudes y adjuntos genera rutas dispares. El modelo recibe un texto fuente, una tarea y un vocabulario de salida permitido, y devuelve una única etiqueta corta que el software puede validar contra un esquema antes de actuar. Está entrenado únicamente en inglés (`en`) y su licencia es `other`, sin términos comerciales detallados en la información disponible.

Su relevancia actual radica en el enfoque de salida cerrada y verificable: frente a modelos generativos abiertos, este adaptador limita la respuesta a un conjunto finito de valores (por ejemplo, `proceed`, `counsel review required` o `privacy_security_review`), lo que reduce el riesgo de acciones no seguras en un dominio regulado. En el panel de evaluación retenido de 511 casos, el adaptador eleva la precisión global del 75,93 % del modelo base al 94,91 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3-4B-Instruct-2507) con adaptador LoRA/PEFT |
| Parametros totales | ~4.000 millones en el modelo base; adaptador LoRA de 132.187.888 bytes (~126 MB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Panel de contexto largo evaluado entre 4.118 y 32.991 tokens de prompt; contexto nativo del modelo base no confirmado en la informacion proporcionada |
| Tipos de cuantizacion | No disponible como lista formal; la model card menciona despliegue con pesos base de 4 bits (unos 2 GB de pesos) y uso en BF16 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `other` (terminos no detallados en la informacion proporcionada) |
| Formato de pesos | Adaptador PEFT LoRA en `safetensors`; requiere el modelo base Qwen3-4B-Instruct-2507 |
| Libreria | `peft` |
| Tarea (pipeline) | `text-generation` |
| Revision del adaptador probada | `b5b2bf4aded78570c01612823a112b8f3a139eb6` |
| Revision del modelo base probada | `cdbee75f17c01a7cc42f958dc650907174af0554` |
| Fecha de creacion en HuggingFace | 2026-09-11 |

## Arquitectura y entrenamiento

El adaptador se apoya en la arquitectura del transformer decoder-only de Qwen3-4B-Instruct-2507 y se entrena mediante PEFT con una LoRA de rango `16`, alpha `32` y dropout `0,05`. El entrenamiento de la versión 5, que continúa el adaptador de seguridad de flujo v4, consistió en una única época sobre 1.495 ejemplos supervisados de tipo completion-only, con 235 ejemplos de desarrollo y una tasa de aprendizaje de `2e-5`. La model card reporta un tiempo de entrenamiento de 881,78 segundos y una pérdida final de entrenamiento de `0,00738`.

El conjunto de datos contiene 1.730 filas únicas de tipo cleanroom entre entrenamiento y desarrollo: 1.250 ejemplos de contraste de disposición (disposition-contrast) y 480 ejemplos de preservación (preservation). Las fuentes son tareas públicas de LegalBench y LEDGAR, además de ejemplos sintéticos para extracción, enrutado de admisión, información faltante, solicitudes con datos sensibles de privacidad e instrucciones embebidas. La auditoría de contenido de la v5 no encontró material privado en las filas posteriores al entrenamiento. No se menciona en la información disponible el uso de RLHF o DPO.

## Capacidades

- Clasificación de disposición de flujo de trabajo con cinco salidas cerradas: `proceed`, `insufficient evidence`, `counsel review required`, `privacy review required` y `escalate: prompt injection`.
- Detección de presencia de cláusulas y NLI contractual con respuesta binaria exacta `yes`/`no`.
- Enrutado a colas predefinidas, como `privacy_security_review`, `ip_review`, `finance_review`, `risk_review`, `compliance_review` o `legal_review`.
- Identificación de problemas (issue spotting) devolviendo un código de problema suministrado en el prompt.
- Clasificación temática devolviendo un código de tema suministrado en el prompt.
- Citación de evidencia mediante un identificador de sección en minúsculas, por ejemplo `s1`.
- Extracción de valores cortos definidos en el prompt, por ejemplo `usd_185250`.
- Resumen acotado con elección entre opciones de respuesta suministradas.
- Resistencia a inyección de prompt en el panel evaluado (40/40 en disposiciones de prompt injection) y a límites legales (40/40).
- No soporta visión, audio ni tool calling / function calling nativo; la interfaz es texto de entrada con vocabulario de salida restringido. Capacidades de agente multi-paso no documentadas en la información disponible.

## Casos de uso

- Admisión de contratos en un flujo legal automatizado: tras convertir la solicitud y los adjuntos a texto, el modelo determina si existe evidencia suficiente y devuelve `proceed` o `insufficient evidence`, permitiendo que el motor de flujo decida si continúa o solicita documentación adicional.
- Enrutado de solicitudes entrantes a la cola correcta: con el vocabulario de colas suministrado en el prompt, el adaptador asigna códigos como `privacy_security_review` o `ip_review`, lo que alimenta directamente un sistema de tickets o un gestor de asuntos.
- Extracción de campos de admisión estructurados: el modelo devuelve valores cortos y normalizados (por ejemplo `usd_185250`) que el software puede validar contra un esquema antes de poblar una base de datos de asuntos.
- Revisión de existencia de cláusulas en contratos reales: con respuesta binaria `yes`/`no`, permite construir controles automáticos de completitud documental en pipelines de contratación, con un 95,36 % de acierto en el subconjunto de cláusulas contractuales reales evaluado.
- Triaje de solicitudes con datos personales: cuando el texto fuente contiene información sensible, el modelo puede emitir `privacy review required` o derivar a la cola de privacidad, con 20/20 en disposiciones de revisión de privacidad en el panel evaluado.
- Defensa frente a inyección de prompt en documentos entrantes: al analizar texto de terceros (correos, PDF convertidos), el adaptador puede devolver `escalate: prompt injection`, con 40/40 en el panel de disposiciones de inyección.
- Procesamiento de documentos con OCR ruidoso: el adaptador alcanza un 95,00 % frente al 82,50 % del modelo base en el subconjunto de entradas con ruido de OCR, lo que resulta útil en digitalizaciones de baja calidad.
- Clasificación temática y detección de problemas para analítica legal: los códigos devueltos permiten etiquetar expedientes y alimentar paneles de seguimiento sin revisión manual previa del texto completo.

## Benchmarks y rendimiento

Resultados del panel retenido v9 (511 casos), comparando el adaptador con el modelo base usando el mismo analizador de recuperación de respuestas:

| Division de evaluacion | Casos | Qwen base | LiTiL Legal Intake |
|---|---:|---:|---:|
| Todas las tareas | 511 | 75,93 % | 94,91 % |
| Tareas de clausulas de contratos reales | 151 | 91,39 % | 95,36 % |
| Enrutado | 40 | 42,50 % | 82,50 % |
| Codificacion de problemas | 40 | 92,50 % | 100,00 % |
| Codificacion tematica | 40 | 97,50 % | 95,00 % |
| Citacion de evidencia | 40 | 97,50 % | 97,50 % |
| Entradas con ruido de OCR | 40 | 82,50 % | 95,00 % |
| Entradas de contexto largo | 20 | 60,00 % | 80,00 % |

Resultados adicionales reportados sin comparación con el base: 40/40 en disposiciones de inyección de prompt, 40/40 en disposiciones de límite legal, 37/40 en disposiciones de evidencia insuficiente y 20/20 en disposiciones de revisión de privacidad. La model card indica que no se registró ninguna disposición de flujo no segura en este panel. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El modelo base de 4B ocupa aproximadamente 8 GB en pesos BF16; el adaptador añade unos 126 MB.
- Para prompts cortos en BF16 se recomiendan del orden de 10-12 GB de memoria de acelerador.
- Para el rango de contexto largo probado se recomiendan unos 24 GB de memoria.
- Con pesos base en 4 bits, los datos de pesos ocupan unos 2 GB y los despliegues prácticos de prompt corto suelen necesitar 6-8 GB tras metadatos de cuantización, activaciones y caché KV.
- La evaluación de 511 casos consumió unos 18,0 GB de memoria GPU en pico, con una duración de 218,16 segundos y un rendimiento de 2,34 tareas por segundo.
- Cabe en GPU de consumo con cuantización de 4 bits (por ejemplo, tarjetas de 8-12 GB de VRAM) para prompts cortos; el rango de contexto largo probado requiere aproximadamente 24 GB y queda fuera de muchas GPU de consumo.
- Para contexto largo en BF16 son adecuadas GPU de clase profesional con 24 GB o más (A100 40/80 GB, H100, L40S, RTX 6000 Ada); en configuraciones de 4 bits puede bastar una RTX 4090.
- Opciones de despliegue: transformers con PEFT, vLLM (con soporte LoRA), TGI y llama.cpp/Ollama tras fusionar el adaptador con el modelo base. La model card proporciona instrucciones de instalación para `torch`, `transformers`, `peft`, `accelerate`, `safetensors` y `huggingface_hub`.
- Recomendaciones de decodificación: decodificación greedy con `max_new_tokens=32` para las etiquetas cortas; aumentar `max_length` solo tras confirmar que la pila de servicio y la memoria disponible soportan el contexto objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en el panel v9 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LiTiL Legal Intake 4B | ~4.000 M (base) + LoRA de ~126 MB | 4.118-32.991 tokens de prompt en el panel probado | 94,91 % global (511 casos) | `other` | Adaptador PEFT en HuggingFace |
| Qwen3-4B-Instruct-2507 (base) | ~4.000 M | Contexto nativo no confirmado en la informacion disponible | 75,93 % global (511 casos) | No disponible en la informacion proporcionada | Modelo completo en HuggingFace |
| Otros adaptadores de admision legal comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa disponible se limita al modelo base sobre el que se entrena el adaptador. No se dispone de datos de otros adaptadores de admisión legal con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El modelo solo está entrenado y evaluado en inglés; no hay soporte multilingüe documentado.
- Requiere que el vocabulario de salida permitido se suministre en el prompt y que la respuesta se valide contra ese esquema antes de ejecutar cualquier acción de flujo.
- La licencia es `other` y no se detallan los términos de uso comercial en la información proporcionada; es necesario revisar el texto completo de la licencia antes de un despliegue en producción.
- La evaluación se realizó sobre 511 casos y paneles pequeños (20-40 casos por división), por lo que las cifras de subconjuntos concretos tienen un margen de error elevado.
- En la división de codificación temática el adaptador rinde ligeramente por debajo del base (95,00 % frente a 97,50 %), lo que indica que la especialización no mejora todas las tareas.
- La disposición de evidencia insuficiente obtuvo 37/40 en el panel, por lo que persiste un riesgo residual de clasificar como suficiente un expediente incompleto.
- Como adaptador, no puede desplegarse sin el modelo base Qwen3-4B-Instruct-2507 y hereda los sesgos y el conocimiento de ese modelo.
- El adaptador no debe usarse como asesoramiento jurídico autónomo: la model card lo sitúa como capa de decisión previa a la revisión por especialistas.
- El repositorio registra 0 descargas y 0 likes en la información disponible, por lo que no existe validación de terceros publicada.
- La fecha de creación indicada (2026-09-11) y el tamaño del repositorio (0,1 GB) deben verificarse contra el repositorio real antes de integrarlo en un pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litillabs/litil-legal-intake-4b
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset LegalBench: https://huggingface.co/datasets/nguha/legalbench
- Dataset LexGLUE: https://huggingface.co/datasets/coastalcph/lex_glue
- No se encontraron enlaces adicionales relevantes (papers, blogs, repositorios o demos) en los resultados de la búsqueda web proporcionada; los resultados devueltos correspondían a ofertas de empleo de una aerolínea y no guardan relación con el modelo.
