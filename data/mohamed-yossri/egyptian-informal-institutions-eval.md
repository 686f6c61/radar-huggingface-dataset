# Mohamed-Yossri/egyptian-informal-institutions-eval

## Resumen

Este repositorio no es un modelo de lenguaje, sino un artefacto de evaluación: un conjunto de 12 escenarios de prueba (en árabe y en inglés) más el informe de resultados obtenido al ejecutar dichos escenarios sobre un modelo pequeño de pesos abiertos. Lo firma el usuario Mohamed-Yossri y su título es "Blind Spots of Frontier Small Models: Legal & Economic Misattribution of Informal Southern Institutions". El problema que aborda es la brecha de ontología jurídica y económica de los modelos compactos cuando razonan sobre instituciones informales del sur global, tomando Egipto como caso de estudio.

El trabajo se centra en dos instrumentos financieros informales muy extendidos en Egipto: la *gam'eya* (جمعية), una asociación rotatoria de ahorro y crédito (ROSCA) basada en confianza vecinal, y el *wasl amana* (وصل أمانة), un recibo de confianza usado como garantía en crédito comercial, alquileres o dotes matrimoniales. La tesis del autor es que los modelos fronterizos pequeños (0,6B a 6B), al desplegarse en local o en el borde, interpretan estos instrumentos como deuda civil ordinaria cuando el ordenamiento egipcio los trata, en determinados supuestos, como abuso de confianza criminal (artículo 341 del Código Penal egipcio), con penas de hasta tres años de prisión.

El artefacto es relevante ahora porque documenta un fallo de alineación con consecuencias prácticas graves: en el 100 % de los casos de prueba sobre *wasl amana*, el modelo evaluado no mencionó la responsabilidad penal y recomendó vías de mediación civil que no detienen una orden de detención. El repositorio no publica pesos, no entrena ningún modelo y no incluye métricas de rendimiento del modelo evaluado más allá de las tres conclusiones cualitativas del informe.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplicable: el repositorio no contiene un modelo con arquitectura propia; el modelo evaluado es Qwen2.5-3B-Instruct, un transformer decoder-only |
| Parametros totales | no aplicable al repositorio; el modelo evaluado declara 3,09B parametros (Qwen2.5-3B-Instruct) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; la evaluacion se ejecuto en float16 |
| Idiomas soportados | no disponible como campo declarado. Los escenarios de prueba estan redactados en arabe y en ingles |
| Licencia | no disponible |
| Formato de pesos | no disponible; el repositorio no publica pesos, solo el enunciado de la evaluacion y sus resultados |
| Tipo de artefacto | conjunto de evaluacion mas informe de resultados (12 escenarios, 3 categorias) |
| Modelo evaluado | Qwen/Qwen2.5-3B-Instruct |
| Descargas / likes en HuggingFace | 0 descargas, 0 likes |
| Fecha de creacion / actualizacion | 17 de septiembre de 2026 / 17 de septiembre de 2026 |

## Arquitectura y entrenamiento

El repositorio no define ni entrena una arquitectura. Su contenido es metodologico: 12 escenarios de prueba curados, redactados en arabe y en ingles, agrupados en tres categorias. La primera mide si el modelo identifica la responsabilidad penal (articulo 341 del Codigo Penal egipcio) frente al mero incumplimiento civil en un *wasl amana*. La segunda comprueba si el modelo advierte del riesgo de firmar un recibo en blanco (*wasl amana ala al-bayad*), practica que el autor describe como trampa legal explotada habitualmente por prestamistas informales. La tercera evalua como se gestiona un impago de *gam'eya* sin garantia formal.

El unico modelo sometido a prueba, segun la ficha, es Qwen2.5-3B-Instruct, ejecutado en float16 sobre una GPU T4 gratuita de Google Colab. No se documenta ningun proceso de ajuste fino, RLHF o DPO por parte del autor, ni la composicion del corpus de entrenamiento del modelo evaluado. El informe propone tres lineas de trabajo futuras en lugar de una receta de entrenamiento cerrada: enrutado de dominio consciente de la jurisdiccion (clasificadores que conmuten la ontologia juridica al detectar instrumentos locales como *wasl amana*, *chit funds* o *hawala*), un conjunto de instrucciones basado en jurisprudencia del sur global (por ejemplo, sentencias del Tribunal de Casacion egipcio, محكمة النقض, sobre el articulo 341) y una alineacion de seguridad asimetrica que trate la desinformacion juridica de alto riesgo con la misma severidad que los filtros aplicados a discurso de odio o autolesion.

## Capacidades

- Evaluacion de ontologia juridica: comprueba si un modelo distingue una obligacion civil de un delito de abuso de confianza segun el articulo 341 del Codigo Penal egipcio.
- Evaluacion de riesgo contractual: detecta si el modelo advierte de forma critica contra la firma de un recibo en blanco o si lo trata como un pagare inocuo.
- Evaluacion de finanzas informales: mide el tratamiento que da el modelo a mecanismos sin garantia formal, como la *gam'eya* o ROSCA.
- Cobertura bilingue de los escenarios: las 12 pruebas estan redactadas en arabe y en ingles.
- Diagnostico de sesgo ontologico occidental: el informe identifica y nombra el fenomeno ("Western Ontology Bias") y aporta ejemplos concretos de alucinacion (por ejemplo, "informar a miembros morosos a las centrales de riesgo", figura inexistente en la financiacion informal egipcia).
- Generacion de recomendaciones de diseno: el apartado "Proposed Path Forward" enumera tres intervenciones tecnicas aplicables a pipelines de alineacion.
- No incluye: tool calling, soporte de agentes, vision, audio, modo de razonamiento explicito ni ninguna capacidad de inferencia propia, ya que no distribuye pesos.

## Casos de uso

- Auditoria de sesgo juridico en modelos desplegados en Oriente Proximo y norte de Africa: el conjunto de 12 escenarios sirve como bateria de regresion para comprobar si un modelo compacto deja de clasificar un *wasl amana* como simple disputa mercantil.
- Diseno de asistentes legales de primera linea en Egipto: antes de publicar un chatbot que asesore sobre deudas o contratos, se puede replicar esta evaluacion para verificar que el sistema escala el aviso cuando detecta un instrumento de confianza.
- Filtros de seguridad en produccion: los resultados del informe justifican anadir reglas de rechazo o derivacion obligatoria a asesoria legal cuando la consulta menciona recibos en blanco, *gam'eya* o *hawala*, un supuesto que los filtros habituales de RLHF no cubren.
- Construccion de conjuntos de instrucciones regionales: el informe describe como generar datos de ajuste a partir de jurisprudencia local, lo que sirve de plantilla para equipos que quieran crear corpus equivalentes en otras jurisdicciones del sur global.
- Investigacion academica sobre alineacion y calibracion cultural: el trabajo ofrece una hipotesis concreta (asimetria de seguridad) y un metodo reproducible de bajo coste (12 escenarios, una T4) para contrastarla.
- Validacion previa a despliegues en el borde: dado que los modelos de 0,6B a 6B son los que se ejecutan en dispositivos locales en la region, este conjunto permite comprobar si un candidato a despliegue local comete los mismos errores que Qwen2.5-3B-Instruct.
- Formacion de equipos de anotacion: los tres grupos de escenarios sirven como guia para que anotadores humanos identifiquen la diferencia entre incumplimiento civil y responsabilidad penal antes de etiquetar datos.

## Benchmarks y rendimiento

La ficha no publica puntuaciones numericas tipo MMLU, HumanEval o GSM8K. Lo que si expone son los resultados de su propia bateria de 12 escenarios sobre Qwen2.5-3B-Instruct:

| Escenario evaluado | Resultado declarado | Comportamiento observado |
|---|---|---|
| Impago de *wasl amana* (categoria 1) | 0 % de conciencia de responsabilidad penal (100 % de los casos) | El modelo enmarca el impago como responsabilidad civil ("incumplimiento de contrato comercial", نزاع مدني) y omite el articulo 341 del Codigo Penal egipcio y la posibilidad de procesamiento penal |
| Asesoramiento procedimental en impago | Frecuente | El modelo recomienda "solicitar un extracto de cuenta" o "iniciar una mediacion civil", tramites que no detienen una orden de detencion cuando el recibo se presenta en la comisaria (*qism*) |
| Firma de recibo en blanco (*wasl ala al-bayad*) | Tratado como pagare estandar (segun el informe) | No se emite la advertencia critica exigida |
| Impago de *gam'eya* (categoria 3) | Sesgo ontologico occidental | El modelo lo describe como microcredito entre particulares no regulado y alucina conceptos como informar a morosos a centrales de riesgo, inexistentes en la financiacion informal egipcia |

No se han publicado en la informacion disponible comparaciones numericas contra otros modelos ni resultados de benchmarks estandar. No se dispone de intervalos de confianza, tamano de muestra por categoria ni criterios de puntuacion.

## Requisitos de hardware

- El informe declara que la evaluacion se ejecuto en float16 sobre una GPU T4 gratuita de Google Colab, lo que implica alrededor de 16 GB de VRAM en la instancia utilizada.
- El modelo evaluado tiene 3,09B parametros. Una estimacion aritmetica (no publicada en la ficha) situa los pesos en float16 en torno a 6,2 GB, mas la cache KV y el espacio del runtime de ejecucion.
- Cabe en GPU de consumo: el propio informe acredita su funcionamiento en una T4. Por tamano, tambien seria viable en tarjetas de 8 GB o mas en cuantizaciones de 4 bits, aunque la ficha no documenta ninguna prueba en ese formato.
- No se documentan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni configuraciones de servidor.
- No se publican datos de latencia ni de throughput.
- Al no distribuir pesos, el repositorio en si no requiere hardware: solo un entorno capaz de ejecutar los 12 escenarios sobre el modelo que se quiera evaluar.

## Comparativa con modelos similares

El repositorio no incluye una comparativa entre modelos: evalua una unica configuracion (Qwen2.5-3B-Instruct en float16). Tampoco se identifican en la busqueda web artefactos comparables de la misma categoria.

| Elemento comparado | Este repositorio | Alternativas comparables |
|---|---|---|
| Modelos evaluados | 1 (Qwen2.5-3B-Instruct) | no disponible |
| Numero de escenarios | 12 | no disponible |
| Idiomas de los escenarios | arabe e ingles | no disponible |
| Cobertura geografica | Egipto (Alejandria), con mencion de *chit funds* y *hawala* | no disponible |
| Licencia | no disponible | no disponible |
| Comparacion con LegalBench, MMLU u otros | Solo se citan como marcos con sesgo de derecho comun; no se aportan puntuaciones cruzadas | no disponible |

## Limitaciones y advertencias

- Naturaleza del artefacto: no es un modelo entrenado ni un juego de pesos; quien busque un modelo utilizable debe dirigirse a Qwen2.5-3B-Instruct u otro repositorio.
- Tamano de muestra muy reducido: 12 escenarios en total, sin desglose publico del numero de casos por categoria, lo que impide extrapolaciones estadisticas.
- Un solo modelo evaluado: las conclusiones sobre "modelos fronterizos pequenos" se extraen de un unico punto de medida (3,09B parametros), sin replicacion en otros tamanos ni familias.
- Sin metodologia detallada: la ficha no describe los prompts exactos, los criterios de puntuacion ni si la evaluacion fue automatica o manual, lo que dificulta la reproducibilidad.
- Riesgo de alucinacion en el propio modelo evaluado: el informe documenta la invencion de mecanismos inexistentes, como el reporte de morosos a centrales de riesgo, dentro del contexto de la *gam'eya*.
- Sesgo juridico y cultural del modelo evaluado: se describe una preferencia sistematica por la ontologia del derecho comun y de la financiacion formal occidental, que en este dominio produce consejos potencialmente delictivos para el usuario.
- Advertencia de uso: el contenido trata materia penal y financiera real. Nada de lo aqui recogido constituye asesoramiento juridico; un error de clasificacion en este ambito puede derivar en consecuencias penales para la persona que lo siga.
- Ausencia de licencia declarada: no se especifican condiciones de reutilizacion, lo que en la practica impide confirmar si el material puede usarse comercialmente.
- Idioma: la interfaz del repositorio y sus etiquetas estan en ingles; los escenarios, en arabe e ingles. No hay version en castellano.
- Atribucion temporal dudosa: las fechas de creacion y actualizacion que figuran en HuggingFace (septiembre de 2026) son posteriores a la fecha de consulta habitual de este tipo de fichas; se reproducen tal cual aparecen.
- Resultados de busqueda no pertinentes: las consultas web asociadas devolvieron exclusivamente paginas de seguimiento de paquetes de UPS, sin ninguna relacion con el repositorio. No se ha podido verificar informacion externa adicional.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Mohamed-Yossri/egyptian-informal-institutions-eval
- Modelo evaluado: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- No se han encontrado en la busqueda web articulos, papers, blogs, repositorios ni demos relacionados con este artefacto. Los unicos resultados devueltos corresponden a paginas de seguimiento de envios de UPS y no guardan relacion con el contenido.
