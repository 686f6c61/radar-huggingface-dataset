# FGIProperty/leaselens

## Resumen

FGIProperty/leaselens es un repositorio alojado en Hugging Face que corresponde a LeaseLens, una aplicacion web de revision de contratos de arrendamiento residencial dirigida a propietarios, agentes inmobiliarios y gestores de propiedades en Sudafrica. El servicio permite subir un contrato en PDF, Word o texto y obtener en segundos los terminos clave, una lista de comprobacion de clausulas y fragmentos de redaccion potencialmente problematicos. Es importante precisar que el repositorio no publica un modelo fundacional: describe una aplicacion de software cuyo nivel de pago consume un modelo de codigo abierto no identificado a traves de Hugging Face Inference Providers.

La relevancia de esta ficha es sobre todo metodologica. Se trata de un ejemplo de repositorio a nivel de aplicacion que se apoya en la infraestructura de inferencia gestionada de Hugging Face para ofrecer una funcionalidad vertical, sin liberar pesos, arquitectura ni datos de entrenamiento. La model card se centra en el modelo de negocio (planes Free y Pro, pasarela de pago Paystack con Stripe como alternativa opcional) y en la arquitectura del backend (FastAPI en Docker sobre Render, SQLite para cuentas y contadores, motor de reglas para el nivel gratuito y revision con LLM para el nivel de pago).

No hay informacion publica sobre el modelo subyacente: no se especifican arquitectura, numero de parametros, ventana de contexto, idiomas ni licencia. Tampoco se publican pesos ni resultados de evaluacion. El repositorio registra cero descargas y cero likes en el momento de la consulta, y las fechas de creacion y actualizacion indicadas (2026-09-10) resultan anomalas. En consecuencia, la mayor parte de las especificaciones tecnicas habituales de una ficha de modelo deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio publica una aplicacion web, no la arquitectura del modelo subyacente) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la aplicacion opera en ingles para el mercado sudafricano) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos; la inferencia se delega en Hugging Face Inference Providers) |
| Pipeline declarado | no disponible |
| Variante de tarea | no disponible |
| Region declarada | region:us |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no documenta ninguna arquitectura de red neuronal ni proceso de entrenamiento. La model card describe exclusivamente la arquitectura del sistema de software: un backend FastAPI (app/main.py) desplegado en un contenedor Docker sobre un servicio web gratuito de Render, con rutas para landing page, herramienta de subida y analisis, API de registro, escaneo, pago y gestion de suscripcion, webhook firmado de Paystack (Stripe como pasarela alternativa), panel de administracion con autenticacion HTTP Basic y sonda de estado. El analisis se reparte entre app/analyzer.py (motor de reglas para el nivel gratuito y revision con LLM para Pro, con respaldo automatico) y app/tasks.py (latido, comprobacion de dependencias, copias de seguridad disparadas por cambios hacia un dataset privado de Hugging Face y purga). La base de datos es SQLite y, segun la model card, nunca almacena documentos.

En cuanto al componente de IA, la model card indica que el nivel Pro utiliza "an open-source model on Hugging Face Inference Providers", sin nombrar el modelo, la version, el tamano ni la familia. No hay informacion sobre datos de preentrenamiento, numero de tokens, composicion del corpus, tecnicas de alineacion (RLHF, DPO) ni innovaciones de decodificacion. El unico detalle operativo relevante es la existencia de un mecanismo de respaldo automatico cuando la llamada al LLM falla. No se puede evaluar ni reproducir el comportamiento del modelo subyacente con la informacion disponible.

## Capacidades

Las siguientes capacidades corresponden a la aplicacion descrita, no a un modelo con pesos publicados, y se limitan a lo que la model card afirma explicitamente:

- Ingesta de contratos de arrendamiento residencial en formato PDF, Word y texto plano.
- Escaneo rapido basado en un motor de reglas, disponible en el nivel gratuito (hasta diez escaneos al mes).
- Extraccion de terminos clave del contrato.
- Generacion de una lista de comprobacion de clausulas.
- Deteccion de redaccion potencialmente problematica ("red-flag wording").
- Revision clausula por clausula mediante un LLM de codigo abierto no identificado, reservada al nivel Pro (hasta cien revisiones de IA al mes).
- Respaldo automatico a un mecanismo alternativo cuando falla la inferencia remota.
- Gestion de cuentas, cuotas, suscripciones y eventos de facturacion (Paystack por defecto, Stripe opcional).

No se documentan capacidades de tool calling, uso de agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento. No se declara soporte multilingue mas alla del uso en ingles.

## Casos de uso

- Revision preliminar de contratos por propietarios particulares: el nivel gratuito aplica un motor de reglas sobre el documento subido y devuelve terminos clave y una lista de clausulas, sin coste de inferencia, lo que permite un primer filtrado inmediato.
- Revision clausula por clausula para gestores de propiedades: el nivel Pro envia el contrato a un LLM y devuelve un analisis detallado, util para carteras con contratos heterogeneos que requieren una lectura asistida.
- Deteccion de redaccion de riesgo en borradores: antes de firmar, el sistema senala fragmentos potencialmente lesivos para el inquilino o el arrendador, actuando como control de calidad previo.
- Estandarizacion de plantillas por agentes inmobiliarios: comparar un contrato nuevo con la lista de comprobacion de clausulas para verificar que no faltan apartados obligatorios.
- Extraccion de terminos clave para tareas administrativas: importe de la renta, duracion, deposito y condiciones de renovacion, que pueden alimentar sistemas internos de gestion.
- Triaje de documentacion antes de asesoria legal: el resultado se emplea como material de preparacion para reducir el tiempo de revision profesional, dado que la propia model card advierte de que no constituye asesoramiento juridico.
- Evaluacion de viabilidad para desarrolladores: el repositorio sirve como plantilla de referencia para construir un servicio vertical que combine motor de reglas gratuito e inferencia gestionada de pago, incluyendo facturacion con Paystack y Stripe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad, latencia ni throughput, ni comparaciones con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el modelo subyacente no se identifica y la inferencia se delega en Hugging Face Inference Providers).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no determinable con la informacion disponible.
- Despliegue del lado del servicio: FastAPI servido en un contenedor Docker sobre un servicio web gratuito de Render (CPU del nivel gratuito para el motor de reglas); no se documentan requisitos de acelerador.
- Opciones de despliegue del modelo: no disponibles; la unica via mencionada es Hugging Face Inference Providers.
- Latencia y throughput: no disponibles. La model card solo afirma que los escaneos rapidos se resuelven "en segundos" y que cada revision de IA en el nivel Pro tiene un coste de inferencia de "unos pocos centimos", sin cifras de tiempo.

## Comparativa con modelos similares

No disponible. El modelo subyacente no se identifica, por lo que no es posible compararlo con alternativas de la misma categoria en terminos de parametros, contexto, rendimiento o licencia. El repositorio tampoco es equiparable a una publicacion de pesos: se trata de una aplicacion de software que consume un modelo de terceros a traves de un proveedor de inferencia gestionada. Las unicas alternativas comparables serian herramientas verticales de revision de contratos, pero la informacion proporcionada no incluye datos de ninguna de ellas.

## Limitaciones y advertencias

- La propia model card advierte de que LeaseLens senala aspectos para revision y que no constituye asesoramiento juridico. No debe usarse como sustituto de un abogado.
- El modelo subyacente no se identifica, lo que impide reproducir resultados, auditar sesgos o conocer su comportamiento exacto.
- La licencia no esta declarada, por lo que el uso comercial del contenido del repositorio queda en una situacion juridica indeterminada y debe verificarse antes de reutilizarlo.
- El campo de precio del plan Pro aparece como marcador de plantilla ("PRO_PRICE_LABEL"), lo que sugiere que la model card no esta finalizada.
- Las fechas de creacion y actualizacion indicadas (2026-09-10) son anomalas respecto al momento de la consulta.
- El repositorio no registra descargas ni likes, por lo que no existe evidencia de uso ni de validacion externa.
- El ambito funcional esta limitado al mercado sudafricano de arrendamiento residencial y a documentos en ingles.
- Existe riesgo de alucinacion en la revision con LLM, especialmente al resumir obligaciones legales o interpretar clausulas ambiguas; los resultados deben cotejarse con el texto original.
- El nivel gratuito depende de un motor de reglas, por lo que su cobertura semantica es mas limitada que la de la revision con LLM.
- No se detalla el tratamiento de datos personales mas alla de la afirmacion de que la base de datos nunca almacena documentos; conviene verificar la politica de privacidad real antes de introducir contratos con datos sensibles.
- No se documentan mecanismos de explicabilidad, versionado del modelo ni trazabilidad de las respuestas de IA.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/FGIProperty/leaselens
- Busqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a listados de libreria del libro "The Poet in Exile" de Ray Manzarek, sin relacion alguna con el modelo o la aplicacion.
- No se dispone de paper, blog tecnico, repositorio de codigo publico, demo ni documentacion adicional en la informacion proporcionada.
