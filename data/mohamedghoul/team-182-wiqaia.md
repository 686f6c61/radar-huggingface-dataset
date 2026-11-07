# mohamedghoul/team-182-wiqaia

## Resumen

Wiqaia-Guard es un modelo de reconocimiento de entidades nombradas (NER) basado en GLiNER, desarrollado por el autor `mohamedghoul` en el contexto del hackathon QAI-HF 2026. Su funcion es detectar en texto arabe, arabe del Golfo, ingles y texto con alternancia de codigo (code-switching) las expresiones que identifican a una persona o revelan contenido confidencial, para enmascararlas antes de que el texto llegue a un modelo de segunda capa. Se trata de un fine-tune de `knowledgator/gliner-x-base`, un modelo de extraccion de spans de tipo zero-shot.

El modelo forma parte de una arquitectura de guardrails denominada Wiqaia, que combina este detector de spans con detectores basados en expresiones regulares (ID de Qatar, IBAN de Qatar, tarjetas, telefonos +974, correos electronicos) y un modelo de clasificacion de niveles (`team-182-wiqaia-levels`). La relevancia actual reside en la escasez de herramientas de privacidad y cumplimiento especificas para arabe y contextos bilingues arabe-ingles, dominios donde la mayoria de los detectores de PII estan entrenados solo en ingles.

El modelo clasifica spans en cuatro etiquetas: `direct_identifier`, `indirect_identifier`, `sensitive_attribute` y `confidential_content`. El repositorio ocupa 2,4 GB y la licencia es Apache 2.0. No se dispone de datos publicos sobre el numero de parametros del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (extraccion de spans sobre encoder transformer; modelo base gliner-x-base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (MSA), arabe del Golfo, ingles, texto con code-switching arabe-ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 2,4 GB; libreria `gliner`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `knowledgator/gliner-x-base`, un extractor de spans de tipo GLiNER que recibe un texto y una lista de etiquetas en lenguaje natural, y devuelve los fragmentos que corresponden a cada etiqueta. A diferencia de un NER clasico con etiquetas fijas, GLiNER permite definir las etiquetas en tiempo de inferencia, lo que facilita adaptar el detector a nuevas categorias sin reentrenar. El modelo se entrena sobre el conjunto de datos PolicyBench, generado de forma sintetica y verificado de forma cruzada por distintas familias de modelos abiertos; no se utilizaron datos personales reales.

El entrenamiento se realizo con HF Jobs segun la model card. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO, por lo que estos datos deben considerarse no disponibles. La model card indica que debe usarse la revision `v2`. El modelo esta disenado para operar dentro de una pasarela (gateway) junto a detectores regex, de modo que los identificadores directos se enmascaran antes de que el texto alcance el modelo de segunda capa.

## Capacidades

- Deteccion de identificadores directos (`direct_identifier`): nombres, numeros de identificacion, telefonos, correos electronicos, IBAN y numeros de expediente.
- Deteccion de identificadores indirectos (`indirect_identifier`): descripciones que identifican a una persona sin nombrarla.
- Deteccion de atributos sensibles (`sensitive_attribute`): datos de salud, salario, expedientes disciplinarios, informacion legal y datos familiares.
- Deteccion de contenido confidencial (`confidential_content`): planes no anunciados, ofertas, investigaciones.
- Soporte multilingue: arabe estandar moderno, arabe del Golfo, ingles y texto con alternancia de codigo arabe-ingles.
- Extraccion de spans con etiquetas definidas en tiempo de inferencia (paradigma GLiNER), lo que permite ajustar el umbral y las categorias sin reentrenar.
- Integracion en una arquitectura de guardrails por niveles: enmascarado de identificadores directos y escalado a un modelo de segunda capa para el resto de categorias.
- No dispone de capacidades de generacion de texto, razonamiento general, codigo, matematicas, vision ni tool calling: es exclusivamente un modelo de clasificacion de tokens.

## Casos de uso

- Enmascarado de PII en pipelines de atencion al cliente: el modelo detecta nombres, telefonos, correos e IBAN en conversaciones en arabe o ingles y los sustituye por marcadores como `[NAME]` o `[ID]` antes de enviar el texto a un LLM de segunda capa, reduciendo la exposicion de datos personales.
- Cumplimiento normativo en entornos del Golfo: integrado en una pasarela de guardrails junto a detectores regex de ID de Qatar, IBAN de Qatar y telefonos +974, permite aplicar politicas de proteccion de datos a texto en arabe del Golfo, un idioma poco cubierto por las herramientas habituales.
- Filtrado de documentos internos antes de su procesamiento: deteccion de contenido confidencial (planes no anunciados, ofertas, investigaciones) para escalar el documento a revision humana o a un modelo de segunda capa en lugar de procesarlo automaticamente.
- Moderacion de datos en aplicaciones sanitarias o de RRHH: identificacion de atributos sensibles como datos de salud o salario asociados a una persona, para aplicar niveles de proteccion superiores (por ejemplo, la categoria C2 de datos personales segun la model card).
- Procesamiento de texto bilingue con code-switching: en entornos donde los usuarios mezclan arabe e ingles en la misma frase, el modelo mantiene un rendimiento homogeneo (F1 de solapamiento entre 0,846 y 0,864 segun idioma), lo que lo hace util en soporte tecnico y banca digital regional.
- Defensa frente a inyeccion de prompts: el modelo mantiene un F1 de solapamiento de 0,849 en filas de prompt-injection del conjunto de evaluacion, por lo que puede usarse como capa de deteccion en pasarelas que reciben texto de usuario no confiable.
- Anonimizacion de datasets para investigacion: aplicacion del detector sobre corpus en arabe o bilingues antes de su publicacion o comparticion, con la salvedad de que el modelo fue entrenado con datos sinteticos y requiere validacion con muestras etiquetadas por humanos.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test reservado de Wiqaia PolicyBench. No estan verificados de forma independiente (`verified: false`).

| Metrica | gliner-x-base zero-shot | Wiqaia-Guard v2 |
|---|---|---|
| overlap-F1, todas las etiquetas | 0,328 | 0,855 |
| exact-F1, todas las etiquetas | 0,253 | 0,707 |
| overlap-F1, `direct_identifier` | 0,517 | 0,962 (recall 0,981) |
| overlap-F1, `indirect_identifier` | 0,040 | 0,829 |
| overlap-F1, `sensitive_attribute` | no disponible | 0,764 |
| overlap-F1, `confidential_content` | no disponible | 0,635 |
| overlap-F1 por idioma | no disponible | ar_msa 0,864; ar_gulf 0,856; en 0,854; code-switched 0,846 |
| overlap-F1 en filas de prompt-injection | no disponible | 0,849 |

El autor indica una latencia de aproximadamente 7,6 ms por texto en GPU. No se han publicado resultados en benchmarks estandar de NER (CoNLL, WikiANN u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 2,4 GB, lo que sugiere que el modelo en precision completa puede ejecutarse en GPUs consumer con al menos 4-6 GB de VRAM, aunque este dato no esta confirmado por el autor.
- GPU recomendadas: no disponibles. La model card solo menciona que la latencia de 7,6 ms por texto se midio en GPU, sin especificar el modelo.
- Cabe en GPU consumer: probablemente si, dado el tamano del repositorio, pero no confirmado.
- Opciones de despliegue: la libreria oficial es `gliner` (`GLiNER.from_pretrained`). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo de extraccion de spans de este tipo.
- Latencia y throughput: aproximadamente 7,6 ms por texto en GPU segun el autor; no se especifica el throughput agregado ni el hardware exacto.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Parametros | Contexto | Licencia | Resultado en PolicyBench |
|---|---|---|---|---|---|---|
| Wiqaia-Guard v2 | GLiNER fine-tune | ar, en, code-switching | no disponible | no disponible | Apache 2.0 | overlap-F1 0,855 |
| knowledgator/gliner-x-base | GLiNER zero-shot | multilingue | no disponible | no disponible | no disponible en esta ficha | overlap-F1 0,328 |
| team-182-wiqaia-levels | Clasificacion de texto | no disponible | 0,1B | no disponible | no disponible en esta ficha | no disponible |

No se dispone de comparaciones con otros detectores de PII especializados en arabe en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente con datos sinteticos generados y verificados por distintas familias de modelos abiertos; no se utilizaron datos personales reales. La precision en datos del mundo real requiere validacion con una muestra etiquetada por humanos.
- `confidential_content` es la etiqueta con peor rendimiento (overlap-F1 0,635), por lo que el autor la trata como motivo de escalado a revision, nunca como veredicto definitivo.
- En el conjunto reducido de negativos dificiles, el modelo aun marca algunas frases inofensivas; el sistema Wiqaia no eleva el nivel de proteccion solo por la deteccion de un nombre.
- Los resultados de benchmarks estan declarados por el autor y no han sido verificados de forma independiente (`verified: false`).
- Cobertura linguistica limitada a arabe (MSA y Golfo), ingles y code-switching; no se documenta soporte para otros idiomas ni para variantes dialectales arabes distintas del Golfo.
- No se dispone de informacion sobre sesgos demograficos o geograficos del modelo.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y no se ofrece garantia alguna por parte del autor.
- El modelo debe usarse la revision `v2`; otras revisiones pueden tener comportamiento distinto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohamedghoul/team-182-wiqaia
- Dataset de evaluacion PolicyBench: https://huggingface.co/datasets/mohamedghoul/team-182-wiqaia-policybench
- Pasarela Wiqaia (Space): https://huggingface.co/spaces/mohamedghoul/team-182-wiqaia-gateway
- Modelo de clasificacion de niveles: https://huggingface.co/mohamedghoul/team-182-wiqaia-levels
- Dataset de niveles: https://huggingface.co/datasets/mohamedghoul/team-182-wiqaia-levels
- Modelo base: https://huggingface.co/knowledgator/gliner-x-base
- Libreria GLiNER: no disponible enlace directo en la informacion proporcionada
