# NagaYu/deference-keigo

## Resumen

Deference-keigo es un modelo de clasificacion de tokens (token-classification) desarrollado por el usuario NagaYu que detecta errores de keigo (lenguaje honorifico japones) en textos empresariales escritos en japones. Su particularidad es que no solo senala la infraccion, sino que determina la direccion de la deferencia (a quien se eleva o se rebaja) y cita el pasaje concreto de la *Keigo no Shishin* (敬語の指針, Consejo de Asuntos Culturales, 2007) en el que se basa el juicio.

El problema que aborda es que la correccion de un honorifico japones a menudo no puede decidirse a partir de la cadena de texto: la guia define el sonkeigo como elevacion de quien actua y el kenjougo I como elevacion de aquel a quien se dirige la accion, de modo que una misma forma puede ser adecuada o inadecuada segun quien la escriba y ante quien. Por eso el modelo exige como entrada un prefijo que codifica la audiencia y los puntos de vista (`[社外][書き手:自分側][相手:貴社]`) y devuelve desplazamientos de caracteres mapeados sobre el cuerpo del mensaje.

Tecnicamente es un ajuste fino de `xlm-roberta-base` (277,5 M de parametros, licencia Apache 2.0) sobre un corpus construido por reglas a partir de la propia norma, sin intervencion de LLM generativos en la creacion de los errores. Esta pensado para inferencia en CPU con cuantizacion int8, con unos 26 ms por mensaje, lo que lo hace viable en herramientas de revision de correo y linting de estilo sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificacion de tokens en esquema BIO x tipo de error |
| Parametros totales | 277.470.743 (277,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la ficha del autor; heredada del modelo base `xlm-roberta-base` (512 tokens) |
| Tipos de cuantizacion | int8 (cuantizacion reportada por el autor, ~26 ms por mensaje en CPU); no se documentan GGUF, AWQ, GPTQ ni otras |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 1,1 GB) |
| Libreria | transformers |
| Modelo base | FacebookAI/xlm-roberta-base (fine-tuning) |
| Dataset de entrenamiento | NagaYu/deference-keigo-corpus |
| Pipeline | token-classification |
| Fecha de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional XLM-RoBERTa base (277,5 M de parametros) con una cabeza de clasificacion de tokens que etiqueta cada token con un esquema BIO cruzado con el tipo de error de keigo. La entrada no es el mensaje en crudo: se antepone un prefijo estructurado que declara la audiencia (por ejemplo `[社外]`) y los puntos de vista de emisor y destinatario (`[書き手:自分側][相手:貴社]`), porque la validez de muchas formas honorificas depende de quien actua y de quien lee. Las predicciones se devuelven como desplazamientos de caracteres reasignados al cuerpo del mensaje.

El corpus de entrenamiento se construyo por reglas a partir de la norma, sin emplear un LLM para generar los errores, lo que acota el vocabulario del generador (49 verbos, 35 formas supletivas segun la propia ficha). Los tipos de error cubiertos incluyen `direction_swap` (mezcla de respectful y humble), `double_keigo` (nijuu keigo), `go_sareru`, `ogo_dekiru`, `self_sonkeigo`, `bad_keigo_link`, `uchi_sonkeigo` y `sa_insertion`. El pipeline completo anade dos capas sobre la salida neuronal: una restriccion normativa que descarta predicciones imposibles en la superficie (por ejemplo, leer `ご報告させていただきます` como `sa_insertion` cuando `報告する` es un verbo *suru* cuyo causativo es `報告させる`) y un filtro de variacion que silencia los usos cuya aceptabilidad esta legitimamente dividida (formas dobles consagradas por el uso como お伺いする, お召し上がりになる u お見えになる, y la tolerancia variable a させていただく). En la informacion disponible no se detallan hiperparametros de entrenamiento, numero de tokens, composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Deteccion de errores de keigo en japones escrito, con etiquetado a nivel de token y localizacion del fragmento problematico.
- Clasificacion por tipo de error: `direction_swap`, `double_keigo`, `go_sareru`, `ogo_dekiru`, `self_sonkeigo`, `bad_keigo_link`, `uchi_sonkeigo`, `sa_insertion`.
- Juicio de direccion de la deferencia condicionado a la audiencia y a la posicion del emisor, mediante el prefijo de contexto obligatorio.
- Cita normativa: cada prediccion se acompana del pasaje de la *Keigo no Shishin* (2007) que la sustenta cuando se usa el paquete `deference`.
- Generacion de candidatos de correccion restringidos a formas que las reglas pueden producir, de modo que la sugerencia no introduzca una nueva desviacion.
- Filtro de variacion para no marcar usos discutidos (evita falsos positivos sobre variacion dialectal, generacional o de registro).
- Inferencia en CPU con cuantizacion int8, apta para despliegue local sin acelerador.
- Capacidades que **no** ofrece: generacion de texto libre, razonamiento general, codigo, matematicas, vision, audio, tool calling, function calling ni comportamiento agentico multi-paso. Es exclusivamente un clasificador de tokens.
- Multilingue: no. Solo japones; el resto de idiomas no esta soportado aunque el encoder base sea multilingue.

## Casos de uso

- Revision de correo empresarial japones antes del envio: el modelo analiza el cuerpo del mensaje con el prefijo de audiencia adecuado (`[社外]`, con emisor y destinatario) y devuelve los fragmentos con errores de direccion de deferencia, con latencia de ~26 ms por mensaje en CPU, por lo que puede integrarse en un boton de "revisar antes de enviar" en el cliente de correo.
- Linter de estilo para documentacion y plantillas corporativas: al ser un modelo de 277,5 M de parametros y 1,1 GB en disco, puede ejecutarse en el mismo servidor que sirve la intranet, escaneando repositorios de plantillas de correo, manuales internos o textos de atencion al cliente.
- Formacion de empleados en keigo: el pipeline devuelve `f.message` y `f.citation.render("en")`, de modo que un sistema de e-learning puede mostrar al usuario la forma detectada, la explicacion y el pasaje normativo concreto (por ejemplo, Ch.3 Sec.2-2 Q11, p.37) en lugar de una correccion sin justificacion.
- Control de calidad en BPO o centros de contacto con personal no nativo: verificacion masiva de respuestas escritas antes de su envio, con umbral de confianza y filtro de variacion para no penalizar usos aceptables.
- Filtro posterior a un LLM generativo: en pipelines donde un modelo de lenguaje redacta respuestas en japones, Deference-keigo actua como verificador que marca errores de honorificos introducidos por la generacion, aprovechando su bajo coste (25,55 ms de mediana con int8) frente al coste del generador.
- Auditoria de calidad linguistica de macros y respuestas tipo: analisis por lotes de cientos de plantillas para localizar patrones sistematicos de `double_keigo` o `sa_insertion` en una organizacion.
- Anotacion asistida para investigacion linguistica: preetiquetado de corpus de japones empresarial con tipos de error y offsets de caracteres, que despues un anotador humano revisa, con la salvedad de que el entrenamiento es sintetico.
- Verificacion de subtitulos o transcripciones en contextos formales: con la advertencia explicita de que el habla y los dialectos quedan fuera del alcance declarado del modelo.

## Benchmarks y rendimiento

Resultados sobre el split de validacion de `NagaYu/deference-keigo-corpus`, segun la model card del autor:

| Metrica | Precision | Recall | F1 |
|---|---|---|---|
| Global (micro) | 0,986 | 0,989 | 0,988 |
| Errores de direccion | 0,975 | 0,981 | 0,978 |

Desglose por tipo de error:

| Tipo de error | Clave | Requiere contexto | P | R | F1 | n |
|---|---|---|---|---|---|---|
| Mezcla respectful/humble (direccion) | `direction_swap` | si | 0,995 | 1,000 | 0,998 | 218 |
| Honorifico duplicado (nijuu keigo) | `double_keigo` | no | 1,000 | 1,000 | 1,000 | 179 |
| Forma 'go-...-sareru' | `go_sareru` | no | 1,000 | 1,000 | 1,000 | 161 |
| Forma 'o/go-...-dekiru' | `ogo_dekiru` | no | 1,000 | 1,000 | 1,000 | 135 |
| Forma respectful aplicada a uno mismo | `self_sonkeigo` | si | 0,881 | 0,987 | 0,931 | 75 |
| Cadena honorifica mal formada | `bad_keigo_link` | si | 1,000 | 1,000 | 1,000 | 27 |
| Forma respectful para el propio grupo (uchi) | `uchi_sonkeigo` | si | 0,938 | 0,652 | 0,769 | 23 |
| Insercion de 'sa' (sa-ire kotoba) | `sa_insertion` | no | 1,000 | 1,000 | 1,000 | 21 |

Comparativa del pipeline completo (reglas + modelo) frente a alternativas, sobre 559 textos con errores, 152 sin errores y 53 casos de variacion:

| Condicion | Deteccion (tipo) | Errores de direccion | Sin sobre-marcado | Mediana de latencia |
|---|---|---|---|---|
| textlint (4 presets de japones) | 0,0 % | 0,0 % | 94,3 % | 2,26 ms |
| Conjunto de reglas de superficie | 42,9 % | 31,7 % | 90,6 % | 0,01 ms |
| Deference | 97,9 % | 97,4 % | 100,0 % | 31,33 ms |
| Deference (int8) | 98,0 % | 97,6 % | 100,0 % | 25,55 ms |

El propio autor advierte que en los tipos visibles en superficie (honorificos duplicados, `sa_insertion`, forma `go-...-sareru`) el conjunto de reglas tambien alcanza el 100 %, por lo que no se reclama ventaja alguna en ellos: la diferencia se concentra en los tipos que dependen del contexto. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible, y no serian aplicables a un clasificador de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,1 GB en FP32, ~0,55 GB en FP16/BF16 y ~0,28 GB en int8, mas el overhead del tokenizador y de las activaciones (el repositorio completo ocupa 1,1 GB).
- GPU: cualquier GPU con 2 GB o mas de memoria es suficiente; no se requieren A100 ni H100. El caso de uso declarado por el autor es CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier tarjeta actual (GTX 1050 Ti, RTX 3060, RTX 4090) e incluso en CPU sin acelerador.
- Rendimiento medido: ~26 ms por mensaje en CPU tras cuantizacion int8; mediana de 25,55 ms por texto con el pipeline completo en int8 y 31,33 ms sin cuantizar (sobre el conjunto de evaluacion). No se reportan cifras de throughput ni de latencia en GPU.
- Opciones de despliegue: `transformers` con `AutoTokenizer` y `AutoModelForTokenClassification`; el paquete `deference` (motor `engine="neural"`) para obtener citas, candidatos de correccion y filtro de variacion; la aplicacion Gradio incluida en el repositorio de GitHub. No se documentan soportes para vLLM, TGI, Ollama ni llama.cpp, y en la mayoria de esos casos no aplican por tratarse de un modelo de clasificacion de tokens y no de generacion.

## Comparativa con modelos similares

| Sistema | Tipo | Parametros | Contexto | Errores de direccion | Sin sobre-marcado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Deference-keigo | Modelo neuronal (XLM-R base) + reglas | 277,5 M | no disponible (base: 512 tokens) | 97,4 % (97,6 % int8) | 100,0 % | Apache 2.0 | HuggingFace + GitHub |
| textlint (4 presets JA) | Reglas de superficie | no aplica | no aplica | 0,0 % | 94,3 % | licenses de cada preset | npm |
| Conjunto de reglas de superficie | Reglas de superficie | no aplica | no aplica | 31,7 % | 90,6 % | no disponible | no disponible |
| FacebookAI/xlm-roberta-base | Encoder multilingue sin ajuste | ~278 M | 512 tokens | no aplica (no es un detector) | no aplica | MIT | HuggingFace |

No se documenta en la informacion disponible ningun otro modelo neuronal de la misma categoria (deteccion de errores de keigo) con el que comparar parametros, contexto o rendimiento; las unicas referencias cuantitativas son las de la tabla anterior, tomadas de la propia model card.

## Limitaciones y advertencias

- Dialectos y lengua hablada quedan fuera de alcance: la sustitucion de 'sa' es frecuente en el habla y se trata aqui desde la norma escrita; la propia cita indica que el informe no cubre ese registro.
- Cuando el actor no puede deducirse del texto, el modelo no emite juicio de direccion; se produciran omisiones en textos con sujeto implicito o elidido.
- El entrenamiento se realizo sobre frases sinteticas acotadas por el lexico del generador (49 verbos, 35 formas supletivas), por lo que las puntuaciones de la model card no garantizan por si solas el rendimiento sobre correspondencia real.
- `uchi_sonkeigo` tiene el menor soporte (n = 23) y el peor resultado de los tipos dependientes de contexto (F1 0,769, recall 0,652); sus salidas deben tratarse con mas cautela que el resto.
- Filtro de variacion: los usos cuya aceptabilidad esta dividida se excluyen deliberadamente, lo que implica falsos negativos asumidos por diseno.
- Las predicciones dependen del prefijo de contexto (audiencia y puntos de vista); un prefijo incorrecto o ausente invalida el juicio de direccion. El autor recomienda usar el paquete `deference` en lugar de construirlo a mano.
- Uso de `transformers` en crudo: se pierden la cita normativa, los candidatos de correccion y el filtro de variacion, con lo que aumenta el riesgo de marcados espurios.
- La referencia normativa es la *Keigo no Shishin* de 2007; el modelo refleja ese documento y no otras guias posteriores ni politicas de estilo internas.
- El resultado es informativo y no un veredicto: la salida se formula como la manera en que la guia organiza la cuestion, nunca como una valoracion del japones del autor del texto.
- Licencia Apache 2.0: permite uso comercial y modificacion con obligacion de conservar avisos de licencia; no se declaran restricciones adicionales de uso.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por terceros; es un artefacto de investigacion reciente.
- Riesgo de alucinacion en el sentido clasico (generacion de texto inventado) no aplica, al ser un clasificador de tokens; el riesgo equivalente son falsos positivos y falsos negativos en la etiquetacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NagaYu/deference-keigo
- Dataset de entrenamiento: https://huggingface.co/datasets/NagaYu/deference-keigo-corpus
- Codigo, evaluacion y aplicacion Gradio: https://github.com/NagaYu/deference
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de XLM-RoBERTa (base del modelo): no disponible en la informacion proporcionada
- Publicaciones o blogs del autor: no disponible en la informacion proporcionada
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo (unicamente resultados de TikTok sin relacion con el contenido).
