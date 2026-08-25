# Fazmin/solus_v1_gliner2-privacy-filter-pii-q8

## Resumen

El modelo `Fazmin/solus_v1_gliner2-privacy-filter-pii-q8` es un extractor de entidades de información personal identificable (PII) basado en GLiNER2, exportado a formato ONNX y cuantizado a 8 bits. Fue desarrollado por Fazmin como parte de la aplicación de escritorio Solus, que ejecuta modelos de lenguaje localmente. Se trata de un clasificador de tokens, no de un modelo generativo: puntúa cada segmento candidato del texto contra un conjunto fijo de etiquetas y devuelve los offsets de caracteres, por lo que no puede inventar hallazgos que no estén en la entrada.

El modelo se basa en `mdeberta-v3-base` y tiene aproximadamente 0,3 mil millones de parámetros. Su ventana de contexto está limitada a 512 subpalabras, por lo que textos más largos deben procesarse en ventanas superpuestas. Las etiquetas están integradas en el grafo en el momento de la exportación: `name`, `address`, `email`, `phone_num`, `id_num`, `url` y `username`. Soporta siete idiomas: inglés, francés, español, alemán, italiano, portugués y neerlandés.

La relevancia de este modelo radica en su utilidad para tareas de privacidad y cumplimiento normativo, como el enmascaramiento de datos personales en documentos, logs o bases de datos. Al ser una versión cuantizada y optimizada para ONNX, puede ejecutarse en CPU con requisitos mínimos de hardware, lo que facilita su integración en aplicaciones locales sin depender de servicios en la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mdeberta-v3-base (token classifier) |
| Parametros totales | 0,3B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | 8-bit (MatMulNBits) |
| Idiomas soportados | en, fr, es, de, it, pt, nl |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model_q8.onnx + model_q8.onnx.data) |

## Arquitectura y entrenamiento

El modelo es un clasificador de tokens basado en la arquitectura `mdeberta-v3-base`, adaptado para la extracción de entidades mediante GLiNER2. No es un modelo generativo; su funcionamiento consiste en evaluar todos los segmentos posibles del texto de entrada contra un conjunto fijo de etiquetas y devolver los rangos de caracteres correspondientes. El conjunto de etiquetas está fijado en el grafo durante la exportación, lo que garantiza que solo se detecten los siete tipos de PII mencionados.

El entrenamiento original del modelo base (`fastino/gliner2-privacy-filter-PII-multi`) fue realizado por fastino, pero no se dispone de detalles específicos sobre el proceso de entrenamiento, el número de tokens o las técnicas de alineación utilizadas. La versión cuantizada que aquí se documenta es una copia byte a byte del artefacto producido por okasi, quien realizó la conversión a ONNX y la cuantización de 8 bits en la Facultad de Ingeniería de la Universidad McMaster. No se han publicado detalles sobre el dataset de entrenamiento ni sobre el uso de técnicas como RLHF o DPO.

## Capacidades

- Detección de entidades PII: identifica nombres, direcciones, correos electrónicos, números de teléfono, números de identificación, URLs y nombres de usuario.
- Soporte multilingüe: funciona en inglés, francés, español, alemán, italiano, portugués y neerlandés.
- Extracción con offsets de caracteres: devuelve las posiciones exactas de las entidades en el texto original, lo que facilita el enmascaramiento o la anotación.
- No generativo: al no generar texto nuevo, no existe riesgo de alucinación de entidades que no estén presentes en la entrada.
- Ejecución en CPU: al estar cuantizado a 8 bits y exportado a ONNX, puede ejecutarse sin GPU, con un requisito mínimo de 2 GB de RAM.

## Casos de uso

- Enmascaramiento de PII en documentos legales: el modelo puede localizar nombres, direcciones y otros datos personales en contratos o expedientes, permitiendo su anonimización antes de compartirlos con terceros.
- Cumplimiento del RGPD: en empresas que manejan datos de ciudadanos europeos, este modelo ayuda a identificar y eliminar información personal de logs o bases de datos para cumplir con el derecho al olvido.
- Filtrado de datos en pipelines de datos: integrado en un flujo de procesamiento, puede detectar y redactar PII en tiempo real antes de que los datos se almacenen o se envíen a otros sistemas.
- Anonimización de conjuntos de datos para investigación: los investigadores pueden usar el modelo para eliminar datos personales de conjuntos de datos clínicos o de encuestas antes de publicarlos.
- Preprocesamiento para modelos generativos: antes de enviar texto a un LLM, se puede usar este modelo para eliminar información sensible y evitar fugas de privacidad.
- Auditoría de seguridad: revisar archivos o correos electrónicos en busca de datos personales no protegidos, ayudando a identificar brechas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta versión cuantizada. El modelo original (`fastino/gliner2-privacy-filter-PII-multi`) reporta un F1 a nivel de segmento de 0,477 en el benchmark SPY, pero no se ha verificado que este resultado se mantenga en la versión cuantizada. Por tanto, no se incluyen cifras de rendimiento propias.

## Requisitos de hardware

- VRAM: no requerida, el modelo puede ejecutarse únicamente en CPU.
- RAM mínima: 2 GB.
- Tamaño del archivo: 525,14 MB (model_q8.onnx.data de 508,58 MB más el grafo y el tokenizador).
- GPU recomendada: ninguna, aunque si se desea acelerar la inferencia, cualquier GPU con soporte ONNX Runtime podría usarse, pero no es necesario.
- Opciones de despliegue: ONNX Runtime (Python, C++, etc.), compatible con entornos de servidor y aplicaciones de escritorio.
- Latencia y throughput: no se han publicado mediciones específicas. Al ser un modelo de 0,3B con cuantización de 8 bits, se espera una inferencia rápida en CPU para textos cortos, pero el límite de 512 tokens obliga a procesar textos largos en ventanas, lo que puede aumentar el tiempo total.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa cuantitativa con otros modelos de detección de PII. Se puede señalar que este modelo es una versión cuantizada y optimizada del modelo original de fastino, y que su principal ventaja es la portabilidad a entornos sin GPU. Alternativas como Presidio o modelos basados en spaCy existen, pero no se dispone de especificaciones comparables en la información proporcionada. Por tanto, la comparativa se limita a indicar que no hay datos disponibles.

## Limitaciones y advertencias

- Contexto limitado a 512 tokens: textos más largos deben dividirse en ventanas superpuestas, lo que puede provocar que entidades que cruzan los límites de las ventanas no se detecten correctamente.
- Conjunto de etiquetas fijo: solo detecta siete tipos de PII. No es posible añadir nuevas categorías sin reentrenar o reexportar el modelo.
- Posibles sesgos: al ser un modelo entrenado con datos multilingües, puede tener un rendimiento desigual entre idiomas o variantes regionales, aunque no se han documentado sesgos específicos.
- Riesgo de errores en entidades poco comunes: como todo modelo de NER, puede fallar en la detección de formatos inusuales de números de teléfono o identificaciones.
- Licencia Apache-2.0: permite uso comercial y modificación, pero se debe mantener la atribución y no se ofrece garantía sobre el rendimiento en casos de uso específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fazmin/solus_v1_gliner2-privacy-filter-pii-q8
- Modelo original: https://huggingface.co/fastino/gliner2-privacy-filter-PII-multi
- Artefacto upstream (okasi): https://huggingface.co/okasi/gliner2-privacy-filter-pii-multi-onnx
- Repositorio GLiNER2: https://github.com/fastino-ai/GLiNER2
