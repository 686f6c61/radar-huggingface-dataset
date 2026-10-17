# EtuhE/igala-mt-first

## Resumen

EtuhE/igala-mt-first es un modelo de traduccion automatica presentado por su autor, EtuhE, como el primer modelo abierto de traduccion entre igala e ingles. El igala es una lengua nigercongolesa hablada principalmente en el estado de Kogi (Nigeria), con muy poca presencia en recursos computacionales, por lo que se enmarca dentro de la categoria de lenguas de bajos recursos. El modelo se publica en HuggingFace bajo licencia MIT y con la etiqueta de idioma `igl`.

El unico dato de rendimiento publicado por el autor es un BLEU de 11,66 y un chrF de 46,69, obtenidos sobre un conjunto de 899 frases procedentes del corpus IgalaNLP4D. La model card describe el entrenamiento como convergido en torno a la epoca 8-10, con sobreajuste a partir de la epoca 15. No se especifica la arquitectura subyacente, el numero de parametros ni la longitud de contexto.

Su relevancia radica en cubrir un par de lenguas practicamente ausente en los sistemas de traduccion comerciales, y en servir de punto de partida reproducible para la comunidad que trabaja con el igala. El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y con un tamano declarado de 0,0 GB, lo que conviene verificar antes de plantear cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | igala (`igl`); traduccion igala-ingles segun la model card |
| Licencia | MIT |
| Formato de pesos | no disponible (no se detalla en la informacion proporcionada) |

## Arquitectura y entrenamiento

La informacion proporcionada no especifica la arquitectura del modelo. La model card unicamente indica que se trata de un sistema de traduccion automatica, consumible mediante el pipeline `translation` de la libreria Transformers, y que se ha entrenado durante al menos 15 epocas. Se desconoce si parte de un modelo preentrenado multilingue, si emplea una arquitectura encoder-decoder tipo transformer o si se ha entrenado desde cero.

En cuanto a los datos, el autor declara un corpus de 899 frases procedentes de IgalaNLP4D. La tabla de resultados muestra la evolucion del rendimiento por epoca: BLEU 11,66 y chrF 46,6 en la epoca 8 (convergencia), los mismos valores en la epoca 10 (marcada como mejor), y BLEU 10,67 con chrF 47,1 en la epoca 15, que el propio autor etiqueta como sobreajuste. No se documentan tecnicas de RLHF, DPO ni innovaciones de decodificacion.

## Capacidades

- Traduccion de texto entre igala e ingles (direccion exacta no especificada en la informacion disponible).
- Integracion directa con la API `pipeline("translation")` de HuggingFace Transformers.
- Ejemplo de uso documentado: la entrada "Good morning" se traduce como "wola odudu".
- Al tratarse de un modelo mono-par y de bajos recursos, no se documentan capacidades de generacion abierta, razonamiento, codigo, matematicas ni vision.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documentan capacidades multilingues mas alla del par igala-ingles.
- No se documenta modo de razonamiento explicito (thinking mode), audio ni ninguna otra modalidad.

## Casos de uso

- Traduccion asistida de documentacion comunitaria: el modelo puede pre-traducir textos breves de igala a ingles para ONG y proyectos linguisticos, con revision humana posterior dado el BLEU de 11,66.
- Digitalizacion de material educativo: traduccion de frases y glosas de libros escolares en igala para crear versiones bilingues de bajo coste.
- Anotacion linguistica asistida: generacion de traducciones preliminares que lingueistas revisan y corrigen para ampliar corpus paralelos de igala.
- Preservacion del patrimonio oral: transcripcion y traduccion preliminar de relatos y proverbios en igala a ingles para su catalogacion.
- Investigacion en traduccion de bajos recursos: uso como linea base reproducible (BLEU 11,66, chrF 46,69) frente a la que comparar tecnicas de aumento de datos o ajuste fino.
- Prototipado rapido de interfaces de traduccion: integracion del pipeline en demos de Streamlit o Gradio para validar flujos de trabajo con hablantes nativos.
- Soporte a servicios publicos locales: traduccion de avisos administrativos o sanitarios breves entre igala e ingles en entornos donde no existen alternativas comerciales.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Epoca | BLEU | chrF | Estado declarado |
|---|---|---|---|
| 8 | 11,66 | 46,6 | Convergido |
| 10 | 11,66 | 46,6 | Mejor |
| 15 | 10,67 | 47,1 | Sobreajuste |

- Corpus de evaluacion: 899 frases (IgalaNLP4D).
- Direccion de traduccion evaluada: no especificada en la informacion proporcionada.
- No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros y el formato de pesos).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no evaluable sin conocer el tamano del modelo.
- Opciones de despliegue: no documentadas por el autor; al exponerse via `pipeline` de Transformers, en principio seria compatible con backends habituales de esa libreria, pero no se confirma.
- Latencia y throughput: no disponibles.
- Advertencia: el repositorio declara un tamano de 0,0 GB, lo que sugiere que los pesos podrian no estar subidos o estar en un formato distinto al esperado. Conviene verificar los archivos antes de planificar el despliegue.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. No se han publicado en la model card resultados frente a sistemas multilingues de referencia (como NLLB o M2M100) ni frente a otros modelos especificos de igala. Comparativa: no disponible.

## Limitaciones y advertencias

- Rendimiento limitado: BLEU de 11,66 sobre 899 frases es una cifra baja, indicativa de calidad insuficiente para produccion sin revision humana.
- Sobreajuste constatado por el propio autor a partir de la epoca 15.
- Corpus de entrenamiento y evaluacion muy reducido (899 frases), lo que limita la generalizacion a dominios distintos del corpus original.
- Repositorio con 0 descargas y 0 likes: sin validacion externa ni reportes de terceros.
- Tamano de repositorio declarado de 0,0 GB: posible ausencia de pesos o discrepancia con lo esperado; verificar antes de usar.
- Arquitectura, parametros y contexto desconocidos, lo que impide estimar coste de inferencia o requisitos de memoria.
- Cobertura idiomatica restringida al igala; no se documentan variantes dialectales ni registro formal.
- Riesgo de alucinacion y de traducciones incorrectas no marcadas, especialmente en frases largas o fuera del dominio de entrenamiento.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias de calidad ni de idoneidad.
- La model card no documenta sesgos especificos, aunque un corpus tan pequeno tiende a reflejar los sesgos de las fuentes de IgalaNLP4D.
- Direccion de traduccion no confirmada en la informacion proporcionada; comprobar si el modelo traduce igala-ingles, ingles-igala o ambas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EtuhE/igala-mt-first
- No se han encontrado en la busqueda web enlaces relevantes al modelo, a papers asociados ni a demos. Los resultados de la busqueda web consultada no guardan relacion con el modelo y se han descartado.
