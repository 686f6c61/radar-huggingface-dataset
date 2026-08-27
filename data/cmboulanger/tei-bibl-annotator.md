# cmboulanger/tei-bibl-annotator

## Resumen

El modelo `cmboulanger/tei-bibl-annotator` es un ajuste fino LoRA del modelo `Qwen/Qwen2.5-3B-Instruct`, con el adaptador fusionado en los pesos base. Su función es anotar citas bibliográficas en texto plano con marcado TEI XML en línea, insertando etiquetas alrededor de los segmentos que portan estructura bibliográfica (autor, título, fecha, editorial, etc.) sin parafrasear ni normalizar el texto original. El resultado es únicamente la cita etiquetada, sin declaración XML ni elemento envolvente.

Desarrollado por cmboulanger, el modelo está pensado para el ámbito de las humanidades digitales y la edición académica, donde las citas aparecen frecuentemente en forma abreviada o anafórica (p. ej., "Id.", "ibid.", nombres de casos ya introducidos) y se mezclan con prosa del autor. Está entrenado con notas al pie de trabajos de sociología jurídica, mayoritariamente en alemán y algo de inglés, lo que lo hace especialmente adecuado para ese dominio. Con 3.085 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo.

La relevancia actual radica en que automatiza una tarea tediosa y propensa a errores en la digitalización de bibliografías, ofreciendo una alternativa ligera y especializada frente a modelos generalistas más grandes. Su licencia restringe el uso a fines de investigación, lo que limita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B-Instruct) con LoRA fusionada |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (safetensors) |
| Idiomas soportados | alemán (de), inglés (en) |
| Licencia | qwen-research (uso exclusivo de investigación, no comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2.5-3B-Instruct, un transformer decoder-only con atención causal estándar. Sobre esta base se aplicó un ajuste fino con LoRA de rango 16, afectando a todas las proyecciones de atención y MLP. El adaptador se fusionó posteriormente en los pesos base, por lo que el checkpoint resultante es un modelo denso sin capas adicionales.

El entrenamiento se realizó durante 3 épocas sobre un conjunto de 9.050 registros de entrenamiento, con una pérdida final de 0,028. Los datos provienen de 99 documentos TEI, cada uno con una lista `<listBibl>` de citas individuales etiquetadas como `<bibl>`, extraídas de notas al pie. Tras filtrar un registro degenerado, se obtuvieron 11.467 registros, divididos por documento completo (nunca se separan citas de un mismo documento) en una proporción aproximada 80/10/10: 78 documentos para entrenamiento (9.050 registros), 10 para desarrollo (1.207) y 10 para prueba (1.210). La división está estratificada para que el nivel raro `legal` (citas con referencia a casos) aparezca en los conjuntos de desarrollo y prueba.

No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el ajuste es puramente supervisado sobre pares de entrada-salida con el formato de chat del modelo base.

## Capacidades

- Anotación TEI XML de citas bibliográficas en texto plano, insertando etiquetas como `<author>`, `<title>`, `<date>`, `<publisher>`, etc.
- Reproducción exacta del texto de entrada: no parafrasea ni normaliza, solo añade marcado.
- Manejo de citas en forma corta o anafórica ("Id.", "ibid.", nombres de casos previamente introducidos), un caso más complejo que las entradas limpias de una lista de referencias.
- Soporte de citas en alemán e inglés, con especialización en el dominio de sociología jurídica.
- Generación determinista: se recomienda decodificación greedy (`do_sample=False`) con `max_new_tokens=1024`.
- Integración con el formato de chat de Qwen2.5 (instrucción de sistema fija + cita como turno de usuario).

## Casos de uso

- Digitalización de bibliografías académicas: el modelo puede procesar listas de referencias extraídas de notas al pie y convertirlas en TEI XML estructurado, listo para su integración en ediciones digitales o repositorios académicos.
- Enriquecimiento de corpus jurídicos: dado su entrenamiento con citas de sociología jurídica, es útil para etiquetar referencias a casos y sentencias en textos legales, facilitando la búsqueda y el análisis posterior.
- Preprocesamiento para pipelines de humanidades digitales: el marcado TEI generado puede alimentar sistemas de extracción de metadatos, bases de datos bibliográficas o motores de búsqueda semántica.
- Anotación de citas en prosa: a diferencia de las listas de referencias limpias, el modelo maneja citas embebidas en texto narrativo, lo que permite procesar notas al pie completas sin separación manual.
- Validación y normalización de bibliografías existentes: se puede usar para comprobar si una cita ya etiquetada cumple con la estructura TEI esperada, aunque su salida es solo el marcado, no un validador.
- Asistencia en edición académica: los editores pueden emplear el modelo para generar borradores de marcado TEI que luego revisan manualmente, reduciendo el trabajo repetitivo.

## Benchmarks y rendimiento

El autor reporta resultados sobre el conjunto de desarrollo (1.207 registros) tras el primer piloto de entrenamiento:

| Metrica | Resultado |
|---|---|
| Parse success (XML TEI valido) | 99,83% (1.205 / 1.207) |
| Exact match (identico byte a byte al marcado de referencia) | 42,50% (513 / 1.207) |

Estas métricas son una señal ligera de cordura: la primera indica si la salida es XML bien formado, y la segunda con qué frecuencia una cita es exactamente correcta. No constituyen una evaluación completa por campo o por nivel de dificultad. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 3.085 millones de parámetros. En BF16 (2 bytes por parámetro) ocupa aproximadamente 6,2 GB, por lo que cabe en GPUs de consumo con 8 GB de VRAM (p. ej., RTX 3060, RTX 4060, RTX 2070). Con cuantización adicional (no disponible en el repo) podría reducirse aún más.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente; una RTX 3060 o superior ofrece margen para el contexto y la generación. También puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: el modelo es compatible con la librería `transformers` de Hugging Face, tal como se muestra en el ejemplo de uso. Al ser un checkpoint estándar, puede servirse con `text-generation-inference` (TGI), `vLLM` o `Ollama` si se convierte a GGUF, aunque no se proporcionan archivos GGUF en el repo.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño de 3B, se espera una generación de decenas de tokens por segundo en GPUs modernas, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma tarea (anotación TEI de citas bibliográficas). Como referencia, se puede comparar con el modelo base:

| Modelo | Parametros | Contexto | Tarea principal | Licencia |
|---|---|---|---|---|
| cmboulanger/tei-bibl-annotator | 3,09B | no disponible | Anotacion TEI de citas | qwen-research (solo investigacion) |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32K (segun documentacion oficial) | Generacion de texto general | Apache 2.0 (para el instruct) |

El modelo base tiene una licencia más permisiva, pero no está especializado en la tarea de anotación TEI. No se han encontrado otros fine-tunes públicos con el mismo propósito en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: el checkpoint está bajo la licencia Qwen Research, que prohíbe el uso comercial. Cualquier aplicación en producción con fines lucrativos queda excluida.
- Exact match bajo: solo el 42,50% de las citas se etiquetan de forma idéntica al marcado de referencia. Aunque el 99,83% produce XML válido, los errores de etiquetado fino (p. ej., atributos o límites de span incorrectos) son frecuentes y requieren revisión manual.
- Dominio limitado: el entrenamiento se centra en citas de sociología jurídica, mayoritariamente en alemán. Su rendimiento en otros campos o idiomas puede degradarse.
- Riesgo de alucinación: como todo modelo generativo, puede inventar etiquetas o alterar el texto original en casos ambiguos, aunque la instrucción de reproducir exactamente la entrada mitiga este riesgo.
- Sin soporte de contexto largo confirmado: no se especifica la longitud de contexto efectiva tras el ajuste; se recomienda usar citas cortas (el ejemplo usa `max_new_tokens=1024`).
- Formato de salida rígido: el modelo solo emite la cita etiquetada, sin declaración XML ni elemento raíz, lo que puede requerir postprocesamiento para integrarlo en documentos TEI completos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cmboulanger/tei-bibl-annotator
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Repositorio del proyecto tei-annotator (librería Python asociada): https://github.com/cboulanger/tei-annotator
- Space de demostración en Hugging Face: https://huggingface.co/spaces/cmboulanger/tei-annotator
