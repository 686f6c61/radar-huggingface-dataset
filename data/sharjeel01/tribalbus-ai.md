# sharjeel01/TribalBus-AI

## Resumen

TribalBus AI es un proyecto de inteligencia conversacional multilingue orientado al dominio del transporte interurbano por autobus y la reserva de billetes. Lo desarrolla el usuario de Hugging Face sharjeel01 y se publica bajo licencia Apache 2.0. El problema que aborda es la friccion de las interfaces de reserva tradicionales: en lugar de navegar por menus complejos, el pasajero escribe en lenguaje natural y el sistema identifica su intencion y los datos de viaje relevantes para enrutar la peticion hacia la operacion de backend adecuada.

El sistema no es un unico modelo generativo, sino una capa de inteligencia conversacional que combina clasificacion clasica de machine learning (TF-IDF con LinearSVC) con ajuste fino parametro-eficiente de un transformer mediante PEFT/LoRA. Cubre 14 categorias de intencion y 6 de entidades, con soporte declarado para ingles, urdu, pashto y sus variantes en escritura latina (roman urdu y roman pashto).

Es relevante por su enfoque de nicho: pocos proyectos abiertos atacan la comprension de lenguaje natural para lenguas de bajos recursos como el pashto en un caso de uso transaccional concreto, y menos aun combinando un clasificador ligero desplegable con un transformer afinado. El repositorio ocupa 1,3 GB y el pipeline declarado en Hugging Face es `text-classification`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: TF-IDF + LinearSVC (clasificacion clasica) y transformer con ajuste fino PEFT/LoRA |
| Parametros totales | no disponible (el modelo base del transformer no se especifica en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles, urdu, pashto, roman urdu y roman pashto (estos dos ultimos en escritura latina) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y joblib (artefactos de scikit-learn) |

## Arquitectura y entrenamiento

La informacion disponible describe una arquitectura hibrida en dos capas. La primera es un clasificador clasico basado en TF-IDF y LinearSVC, adecuado para intenciones con vocabulario relativamente acotado y para despliegues de baja latencia. La segunda es un transformer afinado mediante PEFT/LoRA, que aporta capacidad de generalizacion sobre variaciones linguisticas y de escritura. El sistema incorpora ademas enrutamiento consciente del idioma, de modo que la ruta de procesamiento puede adaptarse al idioma detectado en la entrada.

No se especifican en la informacion proporcionada el modelo base del transformer, el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El proyecto declara 14 categorias de intencion y 6 de entidades, y menciona que los artefactos de investigacion estan subidos al repositorio mientras la integracion con la aplicacion sigue pendiente.

## Capacidades

- Clasificacion de intenciones conversacionales en 14 categorias: saludo, pregunta general, busqueda de autobus, consulta de horario, disponibilidad, tarifa, reserva, cancelacion, estado de reserva, informacion de ruta, informacion de pago, cambio de reserva, emergencia y fallback.
- Extraccion de entidades de viaje en 6 categorias: origen, destino, fecha de viaje, hora de salida, numero de asientos y referencia de reserva.
- Procesamiento multilingue con enrutamiento por idioma para ingles, urdu, pashto, roman urdu y roman pashto.
- Manejo explicito de entradas no reconocidas mediante una intencion de fallback.
- Flujo con confirmacion obligatoria antes de operaciones sensibles de reserva.
- Conexion prevista con un backend de reservas de autobuses existente.
- No se declaran capacidades de generacion de texto libre, razonamiento general, codigo, matematicas, vision ni audio.

## Casos de uso

- Atencion al cliente por chat en el sector del transporte: el clasificador identifica si el usuario pregunta por horarios, tarifas o disponibilidad y enruta la respuesta al servicio correspondiente, reduciendo el coste de soporte en idiomas de bajos recursos.
- Reserva conversacional de billetes: el sistema extrae origen, destino, fecha y numero de asientos de una frase en urdu o pashto y los pasa al backend de reservas, con confirmacion previa antes de ejecutar la transaccion.
- Consulta de estado de reserva y cancelaciones: la intencion `booking_status` y `cancel_booking` permiten automatizar las consultas mas frecuentes sin intervencion humana.
- Asistencia en movilidad para usuarios con baja alfabetizacion digital: al aceptar lenguaje natural en roman urdu y roman pashto, elimina la necesidad de navegar por menus jerarquicos.
- Enrutamiento de emergencias: la intencion `emergency` permite derivar rapidamente la conversacion a un canal humano o a un protocolo especifico.
- Integracion en mostradores y terminales de autobuses: el clasificador clasico TF-IDF/LinearSVC puede ejecutarse en hardware modesto, lo que facilita su despliegue en entornos con recursos limitados.
- Investigacion en NLP para lenguas de bajos recursos: el proyecto sirve como base reproducible para evaluar tecnicas de PEFT/LoRA en pashto y urdu aplicadas a dominios transaccionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que ingles y urdu han mostrado mejores resultados en algunas validaciones experimentales frente al pashto, pero no se aportan cifras de precision, recall ni F1.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, ya que no se especifica el modelo base del transformer ni el tamano de los pesos.
- El componente clasico TF-IDF/LinearSVC es muy ligero y puede ejecutarse en CPU sin GPU.
- GPU recomendadas: no disponibles para el componente transformer; el clasificador clasico no requiere GPU.
- Compatibilidad con GPU de consumo: probable para el componente clasico; no determinable para el transformer sin conocer el modelo base.
- Opciones de despliegue: scikit-learn y joblib para el clasificador; Transformers y PEFT para el transformer; Hugging Face Spaces como destino de despliegue declarado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica modelos comparables de clasificacion de intenciones multilingue para transporte en pashto, urdu y roman urdu, ni se aportan metricas que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- El rendimiento no es homogeneo entre idiomas: ingles y urdu muestran mejores resultados que pashto en las validaciones mencionadas.
- El pashto se marca como experimental y requiere validacion adicional por hablantes nativos, especialmente en expresiones coloquiales y variantes dialectales.
- El roman urdu y el roman pashto presentan ortografia inconsistente, transliteraciones variables y mezcla de idiomas, lo que puede degradar la clasificacion.
- Riesgo de alucinacion y de clasificacion erronea: la model card advierte que los ejemplos mostrados son ilustrativos y no garantizan una clasificacion correcta de cada frase.
- La integracion con la aplicacion de reservas esta pendiente segun el propio autor; el repositorio contiene artefactos de investigacion.
- No se especifican el modelo base, el dataset de entrenamiento ni las metricas de evaluacion, lo que dificulta la reproducibilidad.
- Aunque la licencia es Apache 2.0, conviene verificar las licencias del modelo base y de los datos de entrenamiento antes de un uso comercial.
- El proyecto tiene cero descargas y cero likes en el momento de la consulta, sin senales de adopcion o mantenimiento comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sharjeel01/TribalBus-AI
