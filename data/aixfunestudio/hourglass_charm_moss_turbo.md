# AIxFuneStudio/Hourglass_Charm_Moss_Turbo

## Resumen

`AIxFuneStudio/Hourglass_Charm_Moss_Turbo` es un modelo publicado en HuggingFace por el usuario/organización AIxFuneStudio. El repositorio tiene un tamaño de 5,4 GB, acceso restringido (gated) y licencia etiquetada como `other`. En el momento de redactar esta ficha no se ha publicado en la información disponible ninguna descripción de modelo (model card), pipeline declarado, idiomas soportados ni resultados de evaluación.

La única información verificable es de tipo administrativo: identificador, autor, fechas de creación y actualización (24 de octubre de 2026), etiquetas (`license:other`, `region:us`) y ausencia total de tracción en la plataforma (0 descargas, 0 likes). El nombre del repositorio sugiere una variante optimizada para velocidad ("Turbo") y posiblemente un ajuste fino ("Charm", "Moss"), pero se trata de una interpretación del identificador y no de un dato confirmado.

Por tanto, esta ficha debe considerarse una plantilla de evaluación con los campos pendientes de completar. Cualquier uso en producción requiere descargar el repositorio tras aceptar las condiciones de acceso y revisar los archivos de configuración (`config.json`, tokenizador, model card) para determinar arquitectura, parámetros y formato real de los pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible (el repositorio ocupa 5,4 GB; ver nota más abajo) |
| Parámetros activos | no disponible (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto de licencia publicado en la información disponible) |
| Formato de pesos | no disponible (no se ha confirmado safetensors, GGUF ni otros) |

Nota sobre el tamaño: un repositorio de 5,4 GB es compatible, de forma orientativa, con pesos en FP16/BF16 de un modelo de aproximadamente 2.500-2.700 millones de parámetros, o con pesos ya cuantizados de un modelo mayor. Esta cifra es una estimación derivada del tamaño del repositorio y no un dato publicado por el autor.

## Arquitectura y entrenamiento

No disponible. La información proporcionada no incluye model card, configuración de arquitectura, número de tokens de entrenamiento, composición del dataset ni detalles sobre etapas de alineación (RLHF, DPO, SFT). Tampoco se confirma si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura híbrida o un modelo de difusión.

Tampoco hay información sobre innovaciones técnicas (decodificación especulativa, atención lineal, cuantización nativa, destilación) ni sobre el proceso de ajuste que justifique el sufijo "Turbo" del identificador. Cualquier afirmación al respecto sería especulativa.

## Capacidades

- Generación de texto: no confirmada documentalmente; el pipeline no está declarado en HuggingFace.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Visión o multimodalidad: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas está vacío).
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

No es posible recomendar casos de uso concretos sin conocer arquitectura, contexto, licencia efectiva y rendimiento. Los siguientes escenarios son únicamente hipótesis de evaluación que deben validarse tras inspeccionar el repositorio:

- Evaluación comparativa interna: descargar los pesos tras aceptar las condiciones de acceso y medir perplejidad y calidad de generación frente a la basura de referencia del equipo, antes de considerar cualquier adopción.
- Prueba de concepto en un pipeline de generación de texto: solo si el `config.json` confirma una arquitectura de causal language modeling y una ventana de contexto suficiente para el caso.
- Fine-tuning ligero (LoRA/QLoRA): viable en teoría si el modelo ronda los 2.500-2.700 millones de parámetros y se dispone de una GPU de 24 GB; requiere confirmar arquitectura y licencia.
- Despliegue en local para prototipado: condicionado a que existan pesos en formato GGUF o a la posibilidad de convertirlos, dato no confirmado.
- Generación de código en producción: descartado hasta que se documenten benchmarks de código y una licencia que permita uso comercial.
- Atención al cliente automatizada: descartado hasta confirmar idiomas soportados, contexto máximo y política de licencia.
- Investigación sobre arquitecturas experimentales: el modelo podría ser de interés si el autor publica documentación técnica, actualmente inexistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con carácter oficial. Como referencia orientativa, si el modelo tuviera ~2.700 millones de parámetros en FP16, la inferencia requeriría del orden de 6-7 GB de VRAM incluyendo caché KV y overhead del runtime; en cuantización de 4 bits bajaría a unos 2-3 GB. Son estimaciones, no datos del autor.
- GPU recomendadas: no disponibles. Por el tamaño del repositorio, cabría esperar funcionamiento en tarjetas consumer de 8-16 GB (RTX 3060 12 GB, RTX 4070 Ti Super 16 GB, RTX 4090 24 GB) si se confirma el rango de parámetros indicado; en GPU de datacenter (A100 40/80 GB, H100) sobraría capacidad.
- Compatibilidad con GPU consumer: probable pero no confirmada.
- Opciones de despliegue: no disponible. No se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama ni TGI; dependerá del formato de pesos, que no se ha verificado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable porque se desconoce la categoría del modelo (tamaño, tarea y arquitectura). La tabla siguiente recoge los criterios que sería necesario conocer para poder compararlo:

| Criterio | Este modelo | Alternativas comparables |
|---|---|---|
| Categoría y tamaño | no disponible | no disponible |
| Longitud de contexto | no disponible | no disponible |
| Rendimiento en benchmarks | no publicado | no disponible |
| Licencia | other (texto no publicado) | no disponible |
| Disponibilidad | gated, 0 descargas | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card ni información técnica publicada, lo que impide evaluar sesgos, calidad o idoneidad para cualquier tarea.
- Riesgo de alucinación: no evaluable sin benchmarks ni pruebas de comportamiento.
- Sesgos conocidos: no documentados. Un modelo sin evaluación publicada puede presentar sesgos lingüísticos, culturales o de dominio no identificados.
- Limitaciones de contexto e idioma: se desconoce la ventana de contexto y los idiomas soportados; el campo de idiomas del repositorio está vacío.
- Licencia: etiquetada como `other` sin texto visible en la información disponible. Antes de cualquier uso comercial es imprescindible localizar y leer los términos exactos incluidos en el repositorio.
- Acceso restringido: el repositorio es gated y exige aceptar condiciones en HuggingFace, lo que puede implicar restricciones adicionales de uso, redistribución o compartición de pesos.
- Señales de tracción nula: 0 descargas y 0 likes. No hay evidencia de validación por parte de la comunidad ni de terceros independientes.
- Nombre del repositorio potencialmente engañoso: los sufijos "Turbo" o "Moss" no están respaldados por ninguna especificación técnica publicada.
- Fechas del repositorio: creación y actualización el 24 de octubre de 2026, con apenas cuatro minutos entre ambas; el repositorio no parece haber recibido mantenimiento posterior según los datos disponibles.

## Enlaces

- HuggingFace: https://huggingface.co/AIxFuneStudio/Hourglass_Charm_Moss_Turbo
- Repositorio de GitHub: no disponible
- Paper técnico: no disponible
- Blog o anuncio del autor: no disponible
- Demo o espacio interactivo: no disponible
