# OneScience-Group/structural-evolution

## Resumen

Structural Evolution es un flujo de trabajo no supervisado para la recomendación de mutaciones en proteínas y anticuerpos, desarrollado por OneScience-Group. A diferencia de un modelo de lenguaje convencional, no genera texto ni responde preguntas: toma una estructura tridimensional de una proteína o complejo proteico en formato PDB/CIF, extrae la secuencia wild-type de la cadena objetivo y puntúa mutaciones de un solo punto (deep mutational scanning) bajo condiciones estructurales. Para ello utiliza ESM-IF1, un modelo de lenguaje de proteínas condicionado por estructura (inverse folding), que calcula la log-verosimilitud de cada candidato y selecciona las substituciones con mayor puntuación. El método está descrito en un artículo publicado en Science (DOI: 10.1126/science.adk8946) y resulta relevante para la optimización de secuencias de anticuerpos y proteínas en entornos de investigación y biotecnología.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flujo de trabajo basado en ESM-IF1 (structure-informed protein language model) |
| Parametros totales | no disponible (los pesos de ESM-IF1 se descargan por separado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de proteínas, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | no disponible (requiere checkpoint ESM-IF1 en formato .pt) |

## Arquitectura y entrenamiento

Structural Evolution no es un modelo entrenado desde cero, sino un pipeline que combina un modelo de lenguaje de proteínas condicionado por estructura con un procedimiento de scoring de mutaciones. El componente central es ESM-IF1, que predice la secuencia de aminoácidos de una cadena dado el esqueleto estructural de una o varias cadenas. El flujo de trabajo extrae la secuencia wild-type de la cadena seleccionada del PDB/CIF de entrada, genera candidatos de mutación de punto único y calcula su log-verosimilitud bajo la condición del backbone. Los resultados se ordenan de mayor a menor puntuación y se recomiendan las substituciones más probables. El método permite evaluar mutaciones en contexto de cadena única o de múltiples cadenas (backbone multichain). No se proporcionan detalles sobre datos de entrenamiento, número de tokens ni procesos de RLHF/DPO: la información disponible se centra en el uso del modelo preentrenado ESM-IF1.

## Capacidades

- Recomendación de mutaciones de punto único en proteínas a partir de información estructural.
- Optimización de secuencias de anticuerpos: permite procesar cadenas pesada y ligera por separado.
- Evaluación de mutaciones en complejos proteicos, teniendo en cuenta el contexto de múltiples cadenas en el backbone.
- Puntuación de todos los mutantes de un solo punto (deep mutational scanning) y selección de candidatos de alta probabilidad.
- Soporte de entrada en formato PDB o CIF para estructuras de proteínas o complejos.
- No soporta generación de texto, tool calling, visión, audio ni razonamiento multi-paso en el sentido de modelos de lenguaje.

## Casos de uso

- Optimización de anticuerpos terapéuticos: a partir de la estructura de un anticuerpo, se recomiendan mutaciones en la cadena pesada o ligera para mejorar afinidad o estabilidad. Se ejecuta con `--chain` y, opcionalmente, `--seqpath` para limitar la región de interés.
- Ingeniería de enzimas: se puntúan mutaciones puntuales para mejorar actividad catalítica o termoestabilidad, usando la estructura de la enzima y seleccionando las substituciones con mayor log-verosimilitud.
- Diseño de variantes de proteínas: se generan secuencias alternativas de una proteína conocida, filtrando las mutaciones que el modelo considera estructuralmente compatibles.
- Screening de librerías de mutación: se evalúan todas las substituciones posibles de un solo punto y se exportan los resultados a CSV para priorizar experimentos de laboratorio.
- Optimización de complejos proteicos: se analizan mutaciones en una cadena concreta de un complejo, utilizando el backbone de todo el complejo para capturar interacciones entre cadenas.
- Investigación en biología estructural: se estudia la tolerancia de una proteína a mutaciones puntuales, obteniendo una lista ordenada de substituciones de alta probabilidad que puede contrastarse con datos experimentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia compatible con CPU y GPU/DCU; se recomienda GPU/DCU para acelerar el scoring de ESM-IF1.
- No se especifica la VRAM mínima; complejos proteicos grandes o librerías de mutaciones extensas requieren más memoria de GPU/DCU y RAM del host.
- No se indican modelos concretos de GPU (A100, H100, RTX 4090, etc.).
- Despliegue mediante ejecución local de scripts Python (`scripts/recommend.py`); no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- La calidad de las recomendaciones depende de la precisión de la estructura de entrada; estructuras de baja calidad pueden producir mutaciones poco fiables.
- El modelo no es un modelo de lenguaje general: no genera texto ni responde preguntas, y su uso está limitado a tareas de diseño de proteínas.
- Los pesos de ESM-IF1 no están incluidos en el repositorio; deben descargarse por separado desde Zenodo y colocarse en la ruta esperada.
- Aunque la licencia del repositorio es MIT, los pesos de ESM-IF1 pueden estar sujetos a términos adicionales no especificados en la documentación disponible.
- No se ofrecen garantías de viabilidad funcional de las mutaciones recomendadas; se recomienda validación experimental antes de cualquier uso en producción o en contextos clínicos.
- No se han documentado sesgos específicos, pero la puntuación del modelo puede favorecer substituciones conservadoras o sesgadas hacia la distribución de secuencias del conjunto de entrenamiento de ESM-IF1.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/structural-evolution
- Artículo en Science: https://doi.org/10.1126/science.adk8946
- Pesos de ESM-IF1 (Zenodo): https://zenodo.org/records/12631662
- Organización OneScience en HuggingFace: https://huggingface.co/OneScience-Group
