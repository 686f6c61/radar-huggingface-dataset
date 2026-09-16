# donghovietnam/madlad400-3b-mt-onnx-luca

## Resumen

`donghovietnam/madlad400-3b-mt-onnx-luca` es un espejo (mirror) alojado en HuggingFace de una conversión a ONNX con cuantización INT4 del modelo de traducción automática multilingüe `google/madlad400-3b-mt` de Google. Los ficheros originales proceden del proyecto de código abierto `niedev/OnnxModelsEnhancer`, responsable de la exportación, optimización y cuantización; el repositorio de `donghovietnam` no modifica los pesos y se publica únicamente como mirror para facilitar la descarga.

El modelo base MADLAD-400-3B-MT cubre más de 400 idiomas y está orientado a traducción automática multilingüe. La variante aquí publicada reduce el tamaño de los pesos a aproximadamente 1,58 GB en INT4 (frente a los ~12 GB del modelo original en fp32), emplea una arquitectura ONNX personalizada con optimizaciones de KV-cache y está pensada para inferencia local y sin conexión.

Su relevancia es doble: por un lado, permite ejecutar traducción multilingüe de alta cobertura en hardware modesto, sin depender de servicios en la nube; por otro, su naturaleza de espejo no oficial y su nula tracción en el momento de la consulta (0 descargas y 0 likes registrados) obligan a verificar la procedencia y la integridad de los ficheros antes de utilizarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ONNX personalizada con optimizaciones de KV-cache; el modelo base `google/madlad400-3b-mt` es un transformer encoder-decoder. Detalles internos exactos: no disponible |
| Parametros totales | 3 000 millones (según el nombre del modelo base); recuento exacto de la variante ONNX: no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (única publicada en este repositorio) |
| Idiomas soportados | más de 400 (heredado del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX cuantizado a INT4 (tamaño aproximado del peso: 1,58 GB; repositorio completo: 1,7 GB) |

## Arquitectura y entrenamiento

El modelo base `google/madlad400-3b-mt` es un modelo de traducción multilingüe de Google con 3 000 millones de parámetros, entrenado para traducir entre más de 400 idiomas. Sobre esa base, el proyecto `niedev/OnnxModelsEnhancer` realizó la exportación a ONNX, la optimización y la cuantización a INT4, implementando una arquitectura ONNX personalizada con optimizaciones de KV-cache y otras técnicas destinadas a reducir el tamaño del modelo y el consumo de RAM. El repositorio aquí descrito no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni la existencia de fases de RLHF o DPO: estos datos no están disponibles en la información proporcionada.

La única innovación documentada en la model card es la propia optimización de la exportación ONNX (cuantización INT4 y gestión de KV-cache), no cambios en el entrenamiento. Conviene tener en cuenta que la cuantización a INT4 introduce una pérdida de precisión adicional respecto al modelo original en coma flotante, y que cualquier evaluación de calidad debería hacerse contra ese original y no contra los pesos fp32 del modelo de Google.

## Capacidades

- Traducción automática multilingüe entre más de 400 idiomas, heredada del modelo base.
- Traducción en modo local y offline, sin necesidad de conexión a servicios externos.
- Inferencia mediante ONNX Runtime y aplicaciones que implementen la lógica específica de la arquitectura ONNX optimizada de MADLAD.
- Ejecución en hardware con recursos limitados gracias a los 1,58 GB del peso INT4.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es un modelo de traducción, no de propósito general).
- Capacidades de visión, audio o thinking mode: no disponibles.
- Generación de texto libre, código o matemáticas más allá de la tarea de traducción: no disponible.

## Casos de uso

- Traducción de documentos en escritorio sin conexión: el modelo puede integrarse en aplicaciones de escritorio que ejecuten ONNX Runtime localmente, permitiendo traducir textos entre cientos de pares de idiomas sin enviar datos a terceros.
- Preprocesado y ampliación de corpus multilingües: útil en investigación para traducir grandes volúmenes de texto y generar datos paralelos en idiomas de bajos recursos, aprovechando la cobertura de más de 400 lenguas.
- Localización de documentación técnica y manuales: al ejecutarse de forma local, encaja en flujos de trabajo que requieren confidencialidad sobre el contenido, como documentación interna de empresa.
- Traducción de subtítulos y contenido audiovisual: con 1,58 GB de pesos, puede desplegarse en estaciones de trabajo modestas para traducir líneas de subtítulos de forma por lotes.
- Atención al cliente multilingüe en entornos offline o aislados: como traductor auxiliar en sistemas internos (intranets, entornos con air-gap) donde no está permitido el acceso a APIs externas.
- Aplicaciones de traducción en el borde (edge): el tamaño reducido de la cuantización INT4 abre la puerta a despliegues en dispositivos con limitaciones de memoria, siempre que se implemente la lógica de inferencia ONNX requerida.
- Investigación en traducción de bajos recursos: permite comparar la calidad de una versión cuantizada frente al modelo original de Google en idiomas poco representados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas (BLEU, chrF, COMET ni similares) para esta variante ONNX INT4, ni tampoco comparaciones con el modelo original. Tampoco se han encontrado datos en los resultados de búsqueda web proporcionados.

## Requisitos de hardware

- Tamaño de pesos: aproximadamente 1,58 GB en INT4.
- VRAM estimada para inferencia en GPU: entorno a 2-4 GB, considerando pesos más buffers de activaciones y KV-cache (estimación a partir del tamaño de los pesos; no confirmada por el autor).
- RAM estimada en CPU: en torno a 2-4 GB, dependiendo de la longitud de las secuencias y del runtime ONNX (estimación no confirmada).
- GPU recomendadas: cualquier GPU con más de 4 GB de VRAM; no se documentan requisitos específicos de A100, H100 o RTX 4090 en la información proporcionada.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas con 4 GB o más de VRAM; no se especifica una lista concreta.
- Opciones de despliegue: ONNX Runtime y aplicaciones que implementen la arquitectura ONNX optimizada de MADLAD. No hay evidencia de compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, ya que el formato no es GGUF ni un checkpoint estándar de transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los datos de los comparadores proceden de sus publicaciones oficiales y no de la información proporcionada en esta consulta; conviene verificarlos antes de tomar decisiones.

| Modelo | Parametros | Idiomas | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| `donghovietnam/madlad400-3b-mt-onnx-luca` (INT4) | 3 000 M (base) | más de 400 | Apache 2.0 | ONNX INT4, ~1,58 GB, espejo no oficial |
| `google/madlad400-3b-mt` (original) | 3 000 M | más de 400 | Apache 2.0 | safetensors/PyTorch, ~12 GB en fp32 |
| NLLB-200 (Meta) | 600 M / 1 300 M / 3 300 M / 54 000 M | 200 | CC-BY-NC 4.0 (no comercial) | PyTorch |
| M2M-100 (Meta) | 418 M / 1 200 M / 12 000 M | 100 | MIT | PyTorch |

La ventaja principal de esta variante frente al MADLAD-400-3B-MT original es el tamaño (1,58 GB frente a unos 12 GB), que la hace apta para equipos con poca memoria; su desventaja es la pérdida de precisión por la cuantización INT4 y la falta de compatibilidad con el ecosistema estándar de transformers.

## Limitaciones y advertencias

- Repositorio espejo no oficial: no está mantenido por Google ni por el autor de la conversión ONNX. Existe riesgo de integridad y de desincronización con el proyecto original `niedev/OnnxModelsEnhancer`.
- Sin tracción verificable: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación por parte de la comunidad.
- Calidad variable según el par de idiomas: la propia model card advierte de que la calidad de traducción puede variar en función del par de lenguas y del texto de entrada.
- Degradación por cuantización: la conversión a INT4 puede reducir la calidad respecto al modelo original en coma flotante; no se han publicado métricas que cuantifiquen esa pérdida.
- Sin benchmarks publicados: no hay datos de BLEU, chrF o COMET para esta variante.
- Contexto no documentado: se desconoce la longitud máxima de secuencia soportada, lo que limita su uso con documentos largos sin truncar.
- Compatibilidad restringida: al emplear una arquitectura ONNX personalizada, no funciona directamente con herramientas habituales como llama.cpp, Ollama, vLLM o TGI.
- Riesgo de alucinación y errores de traducción: como cualquier modelo neuronal de traducción, puede generar contenido plausible pero incorrecto, especialmente en idiomas de bajos recursos; requiere revisión humana en contextos críticos.
- Licencia: Apache 2.0 permite uso comercial, pero exige conservar los avisos de copyright y licencia y no ofrece garantías. Los ficheros combinan el modelo de Google y el trabajo de `niedev/OnnxModelsEnhancer`, ambos bajo Apache 2.0 según la model card.
- Idiomas soportados: se declaran más de 400, pero la lista concreta y la calidad por idioma no están disponibles.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/donghovietnam/madlad400-3b-mt-onnx-luca
- Modelo base: https://huggingface.co/google/madlad400-3b-mt
- Proyecto de exportación y cuantización ONNX: https://github.com/niedev/OnnxModelsEnhancer
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos no guardan relación con el modelo.
