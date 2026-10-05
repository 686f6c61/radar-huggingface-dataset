# ConwayResearch/woof-textfiller-0.8B-4bit-v2.1

## Resumen

woof-textfiller-0.8B-4bit-v2.1 es un modelo de lenguaje de aproximadamente 752 millones de parametros desarrollado por ConwayResearch y especializado en una tarea muy concreta: generar el texto que debe introducirse en un campo de formulario de un navegador, a partir del objetivo declarado por el usuario y del contexto de la pagina. No es un modelo conversacional de proposito general, sino un componente de automatizacion pensado para integrarse en flujos de browser automation y devolver el valor del campo como un objeto JSON de texto.

Se distribuye ya cuantizado a 4 bits en dos formatos: una carpeta `mlx/` para Apple Silicon y una carpeta `gguf/` para runtimes compatibles con GGUF. El repositorio ocupa 1,0 GB e incluye ambos conjuntos de pesos, con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El numero real de parametros en safetensors es de 752.393.024.

Su relevancia actual es la de los modelos pequenos y altamente especializados que se ejecutan en local: al ser un modelo de menos de mil millones de parametros en 4 bits, cabe en hardware muy modesto y evita enviar contexto de navegacion (potencialmente sensible) a APIs externas. La contrapartida es que la informacion publica disponible es minima: la model card no detalla arquitectura, datos de entrenamiento, longitud de contexto ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 752.393.024 (aproximadamente 0,75 mil millones) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits; el repositorio incluye variantes MLX y GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (carpeta `mlx/`) y GGUF (carpeta `gguf/`) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la model card ni en los metadatos de HuggingFace. El tamano (752 millones de parametros) y la libreria declarada (MLX) son compatibles con un transformer denso de escala pequena, pero esto es una inferencia y no un dato confirmado por el autor. Tampoco se especifica si se trata de un modelo entrenado desde cero, de un ajuste fino sobre una base existente o de una destilacion.

Respecto al entrenamiento, la informacion disponible no incluye numero de tokens, composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La unica pista funcional es la etiqueta `browser-automation` y la descripcion de uso, que indican que el modelo fue optimizado para mapear (objetivo del usuario + campo seleccionado + contexto de pagina) a un valor de campo en formato JSON. Se desconoce si hubo decodificacion especulativa, atencion lineal u otra innovacion tecnica.

## Capacidades

- Generacion de texto especializada en el relleno de campos de formulario web a partir de un objetivo de usuario y contexto de pagina.
- Salida estructurada en JSON: el modelo devuelve el valor del campo como objeto de texto JSON, lo que facilita su parseo en pipelines de automatizacion.
- Integracion en flujos de browser automation: la etiqueta `browser-automation` indica que esta pensado para agentes que controlan un navegador.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en HuggingFace Inference Endpoints.
- Perfil conversacional declarado en las etiquetas del repositorio (`conversational`).
- Capacidades multilingues: no disponible.
- Tool calling, function calling, agentes multi-paso, vision o audio: no disponible; la model card no menciona ninguna de estas capacidades.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Automatizacion de formularios web en RPA: el modelo recibe el objetivo del usuario y el contexto de la pagina y genera el valor exacto que debe introducirse en el campo seleccionado, sustituyendo reglas heuristicas fragiles por generacion condicionada al contexto.
- Testing end-to-end de aplicaciones web: en suites de pruebas automatizadas, genera datos de entrada plausibles y coherentes con el contexto de cada campo (nombre, direccion, descripcion), reduciendo el mantenimiento de fixtures estaticos.
- Asistentes de accesibilidad para navegacion: puede ayudar a usuarios con dificultades motoras a completar formularios largos sugiriendo valores a partir de una descripcion en lenguaje natural del objetivo.
- Extraccion y reintroduccion de datos entre sistemas: en integraciones donde hay que trasladar informacion de un CRM o un ERP a un portal de terceros, el modelo adapta el valor al formato esperado por cada campo.
- Comercio electronico y checkout automatizado: relleno de direcciones, datos de envio y campos de facturacion en procesos de compra repetitivos.
- Procesos internos de alta de datos: cumplimentacion de formularios administrativos por lotes a partir de registros estructurados y del contexto de la pantalla.
- Agentes de navegacion locales con requisitos de privacidad: al ejecutarse en local en formato MLX o GGUF, el contexto de la pagina no sale del dispositivo, lo que resulta adecuado para entornos con datos personales o regulados.
- Pruebas de robustez y fuzzing de formularios: generacion de entradas diversas y contextualmente coherentes para validar la validacion del lado servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en 4 bits de un modelo de 752 millones de parametros ocupan aproximadamente 0,4-0,5 GB, a lo que hay que sumar el overhead del runtime y la cache KV (dependiente de una longitud de contexto que no se ha publicado). En la practica, el conjunto deberia residir en menos de 2 GB.
- GPU consumer: si, cabe sin problemas en practicamente cualquier GPU con 2 GB o mas de VRAM, incluidas GTX 1650, RTX 3060, RTX 4060 y posteriores. Tambien puede ejecutarse en CPU mediante las variantes GGUF.
- Apple Silicon: es la via nativa, ya que el repositorio incluye pesos en formato MLX para las carpetas correspondientes a Apple Silicon (familias M1, M2, M3 y M4).
- GPU de datacenter (A100, H100, L40S): compatibles pero sobredimensionadas para un modelo de este tamano; no se recomienda su uso salvo por agregacion de muchas peticiones concurrentes.
- Opciones de despliegue: runtime MLX en Apple Silicon; llama.cpp, Ollama u otros runtimes GGUF en CPU y GPU; vLLM y TGI no estan confirmados para este modelo, ya que no se indica compatibilidad con safetensors estandar de transformers. La etiqueta `endpoints_compatible` apunta a despliegue en HuggingFace Inference Endpoints.
- Latencia y throughput: no disponible. El autor no publica mediciones.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos comparables de la misma categoria funcional (relleno de campos de navegador). Los modelos pequenos de proposito general de tamano similar no son equivalentes en tarea, por lo que la comparacion orientativa de la tabla siguiente se basa en conocimiento general y no en datos verificados en esta ficha; los valores deben confirmarse en las model cards oficiales.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| woof-textfiller-0.8B-4bit-v2.1 | 752 millones | no disponible | Apache 2.0 | Especializado en relleno de campos de navegador |
| Llama 3.2 1B | aproximadamente 1,23 mil millones | 128.000 tokens | Llama 3.2 Community License | Proposito general, multilingue |
| Qwen2.5 0.5B | aproximadamente 0,49 mil millones | 32.768 tokens | Apache 2.0 | Proposito general, multilingue |
| SmolLM2 360M | aproximadamente 362 millones | 8.192 tokens | Apache 2.0 | Proposito general, ingles |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: la model card no describe arquitectura, datos de entrenamiento, contexto ni proceso de alineacion, lo que dificulta evaluar su comportamiento fuera del caso de uso previsto.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, exactitud en el relleno de campos ni tasa de JSON malformado.
- Riesgo de alucinacion: al ser un modelo generativo pequeno, puede producir valores plausibles pero incorrectos para un campo (por ejemplo, direcciones o identificadores inventados) sin senalizarlo. Se recomienda validacion posterior y no usarlo como fuente de verdad.
- Ambito muy restringido: no esta pensado para generacion abierta, razonamiento complejo, codigo ni conversacion general. Usarlo fuera de su dominio producira resultados pobres.
- Idiomas soportados desconocidos: no se puede garantizar el rendimiento en castellano ni en otros idiomas distintos de los usados en el entrenamiento, que no se especifican.
- Longitud de contexto desconocida: el contexto de pagina de aplicaciones web reales puede ser largo; sin este dato no se puede garantizar que el modelo lo procese completo.
- Uso en produccion: la licencia Apache 2.0 no impone restricciones de uso comercial, pero la falta de trazabilidad sobre los datos de entrenamiento y la ausencia de versionado semantico documentado obligan a fijar una revision concreta del repositorio y a monitorizar cambios.
- Riesgos de seguridad en automatizacion de navegador: el modelo consume contexto de pagina, que puede contener contenido no confiable (prompt injection). El valor generado debe tratarse como entrada no confiable antes de escribirlo en un campo o enviarlo.
- Metadatos: las fechas del repositorio (creacion 2026-10-04) son posteriores a la fecha actual, lo que sugiere un error de metadatos o un repositorio de prueba. El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso en comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ConwayResearch/woof-textfiller-0.8B-4bit-v2.1

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante para este modelo. Los unicos enlaces obtenidos corresponden a contenido sin relacion con el modelo ni con la automatizacion de navegadores, por lo que se han descartado. No se dispone de paper, blog, repositorio de codigo ni demo asociados.
