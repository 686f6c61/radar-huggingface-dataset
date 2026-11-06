# litoo13/leafmind-fill-needle

## Resumen

leafmind-fill-needle es un ajuste fino mediante LoRA del modelo Cactus-Compute/needle3, un transformer de 121 millones de parámetros desarrollado por Cactus Compute y publicado con licencia Apache-2.0. El ajuste lo firma el usuario litoo13 y está orientado a una tarea muy concreta: convertir una frase en inglés del tipo "fill the name with Robin Example" en una llamada a herramienta (tool call) sobre un campo de un formulario, ya sea rellenar un campo de texto, marcar una casilla, seleccionar una opción o indicar que ningún campo encaja.

El modelo resuelve el problema de la interpretación de instrucciones en lenguaje natural para la automatización de formularios dentro del proyecto leafmind. En lugar de requerir un LLM grande con prompt engineering complejo, ofrece una alternativa compacta (63,4 MB en formato `.cact`, 20 capas) pensada para ejecutarse con el motor Cactus Needle (`needle_load`), lo que lo hace apto para entornos con recursos limitados.

Su relevancia actual radica en la tendencia hacia modelos pequeños y especializados para tareas de extracción y function calling en el borde (edge), donde la latencia y el coste importan más que la amplitud de capacidades. No obstante, se trata de un modelo muy reciente (creado el 27 de octubre de 2026), con cero descargas y cero likes en el momento de redactar esta ficha, y con un alcance funcional deliberadamente estrecho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune LoRA del modelo base Cactus-Compute/needle3) |
| Parametros totales | 121M (modelo base); el artefacto publicado `fill.cact` pesa 63.437.076 bytes y tiene 20 capas |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con max length 512) |
| Tipos de cuantizacion | no disponible (formato propietario `.cact` para el motor Cactus Needle) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.cact` (motor Cactus Needle, `needle_load`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de Cactus-Compute/needle3, un transformer de 121M parámetros, y se ajusta mediante LoRA de rango 32 durante 2 épocas con longitud máxima de 512 tokens, utilizando los scripts de entrenamiento propios de Needle. El resultado se empaqueta en un único archivo `fill.cact` de 63,4 MB con 20 capas, cargable mediante la función `needle_load` del motor Cactus Needle. El sha256 del artefacto es `6198a4579107fc6b0546816a547f6c8594979ba2ebe33a4a4b2c8643536c35fd`.

Los datos de entrenamiento consisten en 6.000 ejemplos sintéticos: formularios inventados de forma aleatoria, con etiquetas de campo, redacciones y valores generados. No se emplearon documentos reales ni datos personales, lo que elimina riesgos de filtración de información sensible pero también limita la diversidad lingüística y estructural del corpus. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación posteriores al ajuste supervisado.

## Capacidades

- Generación de llamadas a herramienta (tool calling) para operaciones sobre campos de formulario: rellenar un campo de texto, marcar una casilla, elegir una opción de una lista.
- Detección de ausencia de campo adecuado: el modelo puede responder que ningún campo del formulario encaja con la instrucción recibida.
- Interpretación de instrucciones en inglés en formato de frase natural ("fill the name with Robin Example").
- Mapeo entre valores de la frase y etiquetas de campo del formulario.
- Ejecución en el motor Cactus Needle mediante `needle_load`, orientado a despliegue ligero.
- No se documentan capacidades de razonamiento multi-paso, agentes autónomos, matemáticas, código general, visión ni audio.
- Soporte multilingüe: únicamente inglés.

## Casos de uso

- Automatización de formularios web en el proyecto leafmind: el modelo recibe la frase del usuario y el esquema de campos del formulario, y devuelve la llamada de herramienta correspondiente para que la aplicación la ejecute. Es adecuado por su formato de salida estructurado y su tamaño reducido.
- Asistentes de accesibilidad para rellenar formularios por voz o texto: un usuario dicta "pon el nombre como Robin Example" y el modelo traduce la instrucción a una acción concreta sobre el campo correcto, reduciendo la carga cognitiva en formularios largos.
- Preprocesado en pipelines de ingesta documental: antes de enviar un formulario a un sistema de extracción más costoso, el modelo puede resolver instrucciones simples de relleno o marcado de casillas en el borde, ahorrando llamadas a modelos mayores.
- Prototipado rápido de interfaces conversacionales sobre formularios: al ser un artefacto de 63 MB, se puede integrar en demos y entornos de desarrollo sin infraestructura GPU dedicada.
- Validación de esquemas de formulario: el modelo puede usarse para comprobar si una instrucción en lenguaje natural tiene un campo destino claro, y en caso contrario reportarlo, lo que ayuda a detectar formularios mal etiquetados.
- Filtrado y enrutamiento de instrucciones: en un sistema con múltiples herramientas, este modelo puede actuar como clasificador especializado que decide si una frase corresponde a una operación de relleno de formulario antes de derivarla al componente adecuado.
- Entornos con recursos limitados o ejecución local: su tamaño permite desplegarlo en dispositivos con poca memoria, siempre que se use el motor Cactus Needle, para tareas de automatización de formularios sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el artefacto `fill.cact` ocupa 63,4 MB, por lo que la huella de memoria es muy reducida en comparación con LLM convencionales.
- GPU recomendadas: no disponible. El modelo está pensado para el motor Cactus Needle, que prioriza ejecución ligera; no se documentan requisitos de GPU específicos.
- Viabilidad en GPU de consumo: probablemente sí, dado el tamaño del artefacto, aunque no se confirma en la información disponible.
- Opciones de despliegue: motor Cactus Needle (`needle_load`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato `.cact` no es compatible con esos runners.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| leafmind-fill-needle | 121M (base) | no disponible | Tool calling para relleno de formularios | Apache-2.0 | `.cact` |
| Cactus-Compute/needle3 (base) | 121M | no disponible | Modelo base de Needle | Apache-2.0 | no disponible |
| LLM generales pequeños (p. ej. familia de 1B-3B) | 1B-3B | 4K-32K típicamente | Propósito general, con tool calling vía prompt | variables | safetensors, GGUF |

La comparación con LLM generales pequeños es cualitativa: este modelo está especializado en una única tarea y no compite en amplitud de capacidades. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El modelo solo entiende inglés; no se ha entrenado ni evaluado en otros idiomas.
- Los datos de entrenamiento son 6.000 ejemplos sintéticos con formularios inventados, lo que puede provocar un rendimiento deficiente ante formularios reales con estructuras, etiquetas o jerga no representadas.
- El propio autor advierte de que las propuestas pueden ser erróneas y que la aplicación debe mostrarlas y pedir confirmación al usuario antes de escribir en el formulario.
- Riesgo de alucinación en la selección de campo: puede mapear un valor a un campo incorrecto o inventar una acción no válida.
- El formato `.cact` y el motor Cactus Needle limitan la portabilidad; no es directamente utilizable en stacks estándar de inferencia.
- No se documentan sesgos específicos, pero al entrenar solo con datos sintéticos en inglés, el modelo hereda las limitaciones de representatividad de ese corpus.
- Licencia Apache-2.0: permite uso comercial y modificación, con las obligaciones habituales de atribución y aviso de cambios.
- Modelo con cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litoo13/leafmind-fill-needle
- Modelo base: https://huggingface.co/Cactus-Compute/needle3
- Repositorio del proyecto leafmind: https://github.com/litoosh13/leafmind
