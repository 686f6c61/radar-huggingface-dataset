# JerrryNie/ConceptCLIP

## Resumen

ConceptCLIP es un modelo fundacional de visión-lenguaje a gran escala, desarrollado por JerrryNie, específicamente diseñado para el ámbito biomédico. Su principal innovación consiste en incorporar conceptos médicos al proceso de alineación imagen-texto, lo que permite obtener representaciones multimodales más interpretables y robustas en múltiples modalidades de imagen médica (radiografías, tomografías, histología, etc.). El modelo se presenta como el primer modelo fundacional biomédico explicable, ofreciendo explicaciones a nivel de concepto clínicamente significativas en distintos escenarios diagnósticos.

Arquitectónicamente, ConceptCLIP se basa en el paradigma CLIP, con un codificador de imágenes y un codificador de texto, y cuenta con aproximadamente 542,9 millones de parámetros. Está disponible en HuggingFace bajo licencia MIT, aunque con acceso restringido (gated), y su pipeline principal es la extracción de características. Su relevancia actual radica en la creciente demanda de sistemas de IA explicables en el sector sanitario, donde la transparencia y la interpretabilidad son requisitos críticos para la adopción clínica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP (visión-lenguaje) con mejora de conceptos médicos |
| Parametros totales | 542.868.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ConceptCLIP sigue la arquitectura CLIP clásica, compuesta por un codificador de visión y un codificador de texto que se entrenan conjuntamente para alinear representaciones de imágenes y textos en un espacio semántico compartido. La novedad principal es la incorporación de conceptos médicos (como hallazgos radiológicos, patrones histológicos o diagnósticos) como un puente de alineación adicional, lo que mejora la capacidad del modelo para capturar relaciones semánticas finas en el dominio clínico. El modelo se pre-entrena a gran escala con datos de imágenes médicas de diversas modalidades, aunque no se han publicado detalles específicos sobre el número de tokens de entrenamiento, la composición exacta del dataset o el uso de técnicas como RLHF o DPO. El paper asociado (arXiv:2501.15579) describe el enfoque de pre-entrenamiento y la metodología de explicabilidad basada en conceptos.

## Capacidades

- Extracción de características multimodales: genera embeddings de imágenes médicas y texto clínico, útiles para tareas de recuperación, clasificación y similitud.
- Explicabilidad a nivel de concepto: produce explicaciones basadas en conceptos médicos interpretables, lo que permite entender qué patrones visuales o textuales influyen en la decisión.
- Soporte multi-modalidad: funciona con diversas modalidades de imagen médica (radiografía, TC, RM, histología, etc.).
- Alineación imagen-texto: permite relacionar hallazgos visuales con descripciones clínicas en lenguaje natural.
- Capacidad de transferencia: al ser un modelo fundacional, puede adaptarse a tareas downstream mediante fine-tuning o zero-shot.
- Multilingüe limitado: el texto está en inglés, aunque las imágenes son independientes del idioma.

## Casos de uso

- Diagnóstico asistido por imagen: un radiólogo puede usar ConceptCLIP para obtener explicaciones basadas en conceptos (p. ej., "opacidad en vidrio esmerilado") que acompañen a la clasificación de una radiografía de tórax, mejorando la confianza en el sistema.
- Recuperación de imágenes médicas por texto: dado un informe clínico, el modelo puede recuperar imágenes relevantes de un repositorio hospitalario, facilitando la búsqueda de casos similares.
- Anotación automática de hallazgos: en pipelines de procesamiento de imágenes, ConceptCLIP puede generar etiquetas semánticas a nivel de concepto para enriquecer bases de datos clínicas.
- Educación médica: los estudiantes pueden interactuar con el modelo para comprender qué características visuales corresponden a determinados diagnósticos, gracias a las explicaciones conceptuales.
- Control de calidad en radiología: el modelo puede detectar discrepancias entre la descripción textual de un informe y la imagen, alertando sobre posibles errores de interpretación.
- Investigación traslacional: en estudios que correlacionan fenotipos de imagen con datos genómicos o clínicos, ConceptCLIP proporciona representaciones interpretables que facilitan el análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper menciona un rendimiento robusto y generalizable en tareas de explicabilidad, pero no se proporcionan cifras concretas (MMLU, HumanEval, etc.) en los materiales consultados.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware en las fuentes consultadas. Dado el tamaño del modelo (542,9 M de parámetros, 2,2 GB en safetensors), se estima que podría ejecutarse en GPUs con al menos 8-12 GB de VRAM en precisión FP16, aunque no se confirma oficialmente. No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que el modelo está orientado a extracción de características y no a generación de texto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en las fuentes consultadas. ConceptCLIP se posiciona como un modelo único en su categoría (explicable y biomédico), por lo que no se pueden establecer comparaciones directas con alternativas conocidas.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere solicitar acceso en HuggingFace (gated), lo que puede limitar su uso inmediato.
- Idioma limitado: el texto está únicamente en inglés, lo que puede ser una barrera para entornos clínicos en otros idiomas.
- Sesgos potenciales: al entrenarse con datos médicos, puede heredar sesgos presentes en los datos (p. ej., desequilibrios demográficos o de modalidad).
- Riesgo de alucinación en explicaciones: aunque el modelo es explicable, las explicaciones generadas podrían no ser siempre clínicamente precisas; se recomienda validación por expertos.
- Sin soporte de generación de texto: no es un modelo generativo, solo de extracción de características; no sirve para redactar informes.
- Falta de documentación sobre contexto y cuantización: no se especifican la longitud de contexto ni las opciones de cuantización, lo que dificulta la planificación de despliegue.

## Enlaces

- HuggingFace: https://huggingface.co/JerrryNie/ConceptCLIP
- GitHub: https://github.com/JerrryNie/ConceptCLIP
- Paper (arXiv): https://arxiv.org/html/2501.15579
