# poisonxa/PXA-Supporter-Models

## Resumen

PXA-Supporter-Models es un repositorio de pesos publicado en HuggingFace por el usuario poisonxa, distribuido bajo una licencia propia denominada pxa-supporter y con acceso restringido (gated): es necesario aceptar las condiciones del autor en la plataforma antes de poder descargar los ficheros. El dato objetivo mas relevante es el recuento de parametros declarado para los pesos en formato safetensors, que asciende a 27.320.697.856 parametros, es decir, aproximadamente 27.300 millones.

El repositorio ocupa 13,6 GB e incluye, segun las etiquetas declaradas, tanto pesos en formato GGUF como safetensors, ademas de la marca imatrix, que en el ecosistema llama.cpp suele acompanar a cuantizaciones generadas con matrices de importancia. Las etiquetas tambien lo clasifican como conversational y endpoints_compatible, lo que sugiere que esta pensado para su uso detras de una API compatible con los endpoints habituales de inferencia de texto.

La informacion publica disponible es muy escasa: no se especifican pipeline, idiomas soportados, longitud de contexto, arquitectura ni detalles de entrenamiento, y el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha. Por tanto, buena parte de los apartados siguientes quedan marcados explicitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.320.697.856 (pesos safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el tag imatrix indica cuantizaciones GGUF generadas con matriz de importancia, sin detalle de niveles Q) |
| Idiomas soportados | no disponible |
| Licencia | pxa-supporter (licencia propia, tag license:other) |
| Formato de pesos | safetensors y GGUF |
| Tamano del repositorio | 13,6 GB |
| Acceso | restringido (gated, requiere aceptar condiciones) |
| Pipeline declarado | no disponible |
| Tipo de uso declarado | conversational |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en los datos disponibles. El recuento de parametros (unos 27.300 millones) es coherente con el rango habitual de los transformers densos de gran tamano, pero no hay confirmacion de si se trata de un transformer denso, de una arquitectura de mezcla de expertos (MoE) o de un diseno hibrido. Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste como RLHF, DPO o SFT.

La unica pista tecnica indirecta es la etiqueta imatrix, asociada a la generacion de cuantizaciones GGUF mediante matrices de importancia, y la etiqueta endpoints_compatible, que apunta a una integracion pensada para servidores de inferencia con API compatible. Cualquier afirmacion adicional sobre innovaciones de atencion, decodificacion especulativa o metodos de entrenamiento seria especulativa y no se incluye.

## Capacidades

- Generacion de texto conversacional: la unica capacidad confirmada por las etiquetas del repositorio es la de modelo conversacional.
- Compatibilidad con endpoints: el tag endpoints_compatible sugiere que puede servirse detras de APIs de inferencia estandar.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Vision, audio o modos de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

Dado que no se documentan capacidades especificas, los casos siguientes son escenarios plausibles para un modelo conversacional de ~27.000 millones de parametros, no caracteristicas confirmadas por el autor:

- Asistente conversacional de proposito general: un modelo de este tamano puede mantener dialogos multi-turno y generar respuestas coherentes, siempre que la longitud de contexto (no especificada) sea suficiente para el historial de conversacion.
- Despliegue en infraestructura propia con llama.cpp u Ollama: la presencia de pesos GGUF con cuantizacion imatrix facilita ejecutar el modelo en GPUs de consumo ajustando el nivel de cuantizacion.
- Servicio interno detras de una API compatible: la etiqueta endpoints_compatible permite integrarlo en un backend existente que ya consuma endpoints tipo OpenAI sin reescribir la capa de aplicacion.
- Generacion de borradores y resumenes de documentacion interna: un modelo de ~27.000 millones puede producir texto tecnico extenso con calidad razonable, sujeto a verificacion humana.
- Clasificacion y reescritura de texto en pipelines de back-office: tareas de transformacion de texto donde el modelo actua como componente dentro de un flujo automatizado.
- Prototipado e investigacion: al ser un repositorio con licencia propia y acceso restringido, es adecuado para experimentacion controlada una vez aceptadas las condiciones de uso.
- Sistemas de preguntas y respuestas sobre corpus cerrados: utilizable si se le anade una capa de recuperacion (RAG), ya que no se documenta una ventana de contexto concreta.

Ninguno de estos casos esta respaldado por documentacion oficial del autor en la informacion disponible; se derivan del perfil general del modelo (tamano, formato y etiqueta conversacional).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el recuento de parametros (27.320.697.856), los pesos en precision de 16 bits ocuparian aproximadamente 54,6 GB; en 8 bits, unos 27,3 GB; y en cuantizaciones GGUF de 4 bits, alrededor de 14-16 GB. Estas cifras son calculos derivados del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: no disponible. A modo orientativo, las configuraciones de 16 bits requeririan GPUs de clase A100 80 GB o H100; las cuantizaciones de 4 bits podrian caber en una RTX 4090 (24 GB) o similar.
- Compatibilidad con GPU de consumo: probable en cuantizaciones de 4 bits sobre GPUs con 16-24 GB de VRAM, segun los calculos anteriores y no segun especificaciones oficiales.
- Opciones de despliegue: llama.cpp, Ollama y otros servidores compatibles con GGUF, dado que el repositorio incluye ese formato; tambien vLLM o TGI si los pesos safetensors son compatibles, aunque esto no esta confirmado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion publicada no identifica la familia base del modelo ni ofrece resultados que permitan situarlo frente a alternativas de tamano comparable, de modo que cualquier comparacion seria especulativa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no cuantificado; sin datos de entrenamiento ni evaluaciones, debe asumirse el riesgo habitual de los modelos generativos.
- Limitaciones de contexto o idioma: no disponible; se desconoce la ventana de contexto y los idiomas soportados.
- Restricciones de licencia: la licencia pxa-supporter es una licencia propia (tag license:other). No se detallan sus terminos en la informacion disponible, por lo que es imprescindible revisar el texto completo antes de cualquier uso comercial.
- Acceso restringido (gated): la descarga exige aceptar condiciones en HuggingFace, lo que anade friccion para su uso en produccion y automatizacion.
- Ausencia de traccion: el repositorio registra 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- Falta de documentacion tecnica: no hay model card con arquitectura, datos de entrenamiento, contexto o benchmarks, lo que dificulta evaluar su idoneidad en entornos productivos.
- Fechas del repositorio: las marcas temporales de creacion y actualizacion (27 de septiembre de 2026) deben verificarse directamente en la plataforma, ya que condicionan la vigencia de la version publicada.

## Enlaces

- HuggingFace: https://huggingface.co/poisonxa/PXA-Supporter-Models
- Paper: no disponible
- Blog o articulo tecnico: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
- Terminos de licencia pxa-supporter: no disponible en la informacion proporcionada
