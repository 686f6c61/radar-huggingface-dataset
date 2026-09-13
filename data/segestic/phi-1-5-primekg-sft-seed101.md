# segestic/phi-1.5-primekg-sft-seed101

## Resumen

`segestic/phi-1.5-primekg-sft-seed101` es un repositorio de pesos publicado en HuggingFace por el usuario `segestic`. La model card es la plantilla automática de transformers sin rellenar: todos los campos (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, evaluación) aparecen como `[More Information Needed]`. No hay pipeline declarado, ni licencia, ni idiomas, ni resultados de benchmarks.

El propio identificador del repositorio aporta la única información sustantiva disponible: sugiere un ajuste fino supervisado (SFT) del modelo Phi-1.5 sobre el dataset PrimeKG (grafo de conocimiento biomédico), con semilla 101. Esta lectura es una inferencia a partir del nombre y no está confirmada por ninguna documentación del autor, por lo que debe tratarse como hipótesis, no como hecho verificado.

El repositorio ocupa 0,1 GB y contiene pesos en formato safetensors con la librería transformers. Ese volumen es compatible con un adaptador tipo LoRA o con pesos cuantizados de un modelo de aproximadamente 1.300 millones de parámetros (el tamaño de Phi-1.5 en precisión completa rondaría los 2,6 GB), pero la model card no especifica ni la arquitectura ni el formato exacto de los pesos. El tag `arxiv:1910.09700` corresponde a la referencia del calculador de impacto ambiental incluida en la plantilla de la model card (Lacoste et al., 2019), no a un artículo sobre este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el identificador sugiere Phi-1.5, sin confirmar) |
| Parametros totales | no disponible (Phi-1.5 tiene 1.300 millones; no confirmado en este repositorio) |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura en la model card ni en los resultados de búsqueda. Por el identificador puede inferirse que se trata de un ajuste fino supervisado de Phi-1.5 (transformer decoder-only de 1.300 millones de parámetros, entrenado originalmente por Microsoft Research sobre datos de texto y código) aplicado sobre PrimeKG, un grafo de conocimiento biomédico que integra relaciones entre enfermedades, genes, fármacos y fenotipos. Ninguno de estos extremos está documentado por el autor en el repositorio.

Tampoco se especifican hiperparámetros, número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas. El sufijo `seed101` apunta a una ejecución concreta de un pipeline de entrenamiento reproducido con una semilla determinada, lo que sugiere que el autor podría haber generado varias variantes del mismo ajuste, pero no se aporta ninguna traza experimental, código de entrenamiento ni ficha del dataset.

## Capacidades

- Las capacidades concretas del modelo no están documentadas en la información disponible.
- No se confirma soporte de tool calling ni de function calling.
- No se confirma soporte para flujos de agentes o razonamiento multi-paso.
- No se confirma el conjunto de idiomas soportados.
- No se confirma ningún modo especial (thinking mode, visión, audio).
- Dado el nombre del repositorio, la única capacidad plausible sería la respuesta a consultas en dominio biomédico, pero esto no está verificado y no debe asumirse en producción.

## Casos de uso

No es posible recomendar casos de uso concretos y realistas con la información disponible. La model card no describe usos previstos, usos fuera de alcance ni recomendaciones de despliegue, y no se han publicado evaluaciones que permitan acotar el rendimiento por tarea.

- Evaluación exploratoria en investigación biomédica: podría probarse como generador de texto en tareas de relación entre entidades del grafo PrimeKG, pero sin métricas publicadas el resultado es incierto y requeriría validación propia.
- Reproducción de experimentos de ajuste fino: útil únicamente como artefacto de una ejecución concreta (semilla 101) dentro de un estudio comparativo, no como modelo listo para producción.
- Punto de partida para un ajuste posterior: si los pesos son un adaptador, podrían servir como inicialización para experimentos adicionales, previa verificación del formato.
- Cualquier otro caso de uso práctico (atención al cliente, generación de código, extracción de información, RAG, agentes) queda fuera de toda recomendación razonable por ausencia total de especificaciones, licencia y evaluación.

No se alcanza el mínimo de seis casos exigido porque no hay datos suficientes; inventarlos contradiría la verificación técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia del modelo base Phi-1.5 (1.300 millones de parámetros), la inferencia en fp16 requiere del orden de 2,6-3 GB de VRAM, y en cuantización de 4 bits alrededor de 1 GB; estos valores corresponden al modelo base, no a este repositorio concreto.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no confirmada, aunque un modelo de la familia Phi-1.5 cabría en tarjetas con 6-8 GB de VRAM si los pesos están completos y sin cuantizar.
- Opciones de despliegue: no documentadas. Al no confirmarse la arquitectura exacta ni el formato, no puede garantizarse funcionamiento con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

Advertencia: el tamaño del repositorio (0,1 GB) es muy inferior a lo esperado para un modelo de 1.300 millones de parámetros en fp16, lo que sugiere que los pesos pueden ser un adaptador, un subconjunto de tensores o una versión cuantizada; conviene inspeccionar los archivos antes de planificar cualquier despliegue.

## Comparativa con modelos similares

No disponible. No se dispone de especificaciones, licencia ni métricas de este modelo que permitan una comparación rigurosa con alternativas. Como referencia genérica de la categoría de modelos pequeños de razonamiento y código, podrían citarse Phi-1.5 (1.300 millones de parámetros, licencia MIT en su versión original de Microsoft) o Qwen2.5-1.5B, pero cualquier comparación numérica sería especulativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| segestic/phi-1.5-primekg-sft-seed101 | no disponible | no disponible | no disponible | HuggingFace |
| Phi-1.5 (Microsoft) | 1.300 M | 2.048 tokens | MIT (según el modelo original) | HuggingFace |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática sin rellenar, por lo que no hay garantía sobre el comportamiento del modelo.
- Licencia no declarada: no puede asumirse uso comercial. Sin licencia explícita, el uso en producción conlleva riesgo legal.
- Riesgo de alucinación: desconocido y no acotado. Un ajuste sobre un grafo de conocimiento biomédico sin evaluación publicada puede producir afirmaciones médicas incorrectas con apariencia de rigor.
- Sesgos conocidos: no documentados. El modelo base Phi-1.5 se entrenó principalmente con datos sintéticos y de texto/código en inglés, lo que limita su cobertura multilingüe, pero esto no está confirmado para este repositorio.
- Sin datos de evaluación: no hay métricas de calidad, seguridad ni sesgo.
- Reproducibilidad limitada: no se adjunta código de entrenamiento, configuración ni dataset asociado.
- Ámbito restringido: si el ajuste se realizó únicamente sobre PrimeKG, el modelo podría degradar capacidades generales de conversación o código presentes en el modelo base.
- Estado del repositorio: 0 descargas y 0 likes, sin señales de mantenimiento ni validación por parte de la comunidad.
- Uso clínico: cualquier aplicación en ámbito sanitario requiere validación independiente, revisión ética y supervisión profesional; este repositorio no ofrece base para ello.

## Enlaces

- HuggingFace: https://huggingface.co/segestic/phi-1.5-primekg-sft-seed101
- Referencia citada en el tag `arxiv:1910.09700` (calculador de impacto ambiental, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (corresponden a páginas de banca online de 1822direkt) y no se han incluido por no aportar información relevante.
