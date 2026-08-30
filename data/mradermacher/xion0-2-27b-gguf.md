# mradermacher/XION0.2-27B-GGUF

## Resumen

XION0.2-27B-GGUF es una colección de cuantizaciones GGUF del modelo de lenguaje XION0.2-27B, desarrollada por mradermacher (nethype GmbH) a partir del modelo base PIXELZX/XION0.2-27B. El modelo base está etiquetado como "uncensored" y "abliterated", lo que indica que se ha aplicado una técnica de eliminación de rechazos para reducir la censura en las respuestas, manteniendo capacidades de razonamiento y un contexto largo. Está diseñado para ejecutarse localmente en hardware de consumo mediante herramientas como llama.cpp u Ollama.

Con aproximadamente 26,9 mil millones de parámetros, el modelo soporta cuatro idiomas (inglés, coreano, japonés y chino) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. La colección incluye múltiples niveles de cuantización, desde Q2_K (10,8 GB) hasta Q8_0 (28,7 GB), además de archivos multimodales (mmproj) que sugieren capacidades de visión, aunque no se detallan en la documentación disponible.

La relevancia de este modelo radica en su combinación de razonamiento, ausencia de censura y soporte multilingüe para lenguas asiáticas, empaquetado en formatos GGUF listos para inferencia local. Sin embargo, la información pública es escasa: no se han publicado detalles sobre arquitectura, datos de entrenamiento ni benchmarks, por lo que su evaluación debe basarse en pruebas empíricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como "qwen3.8", sugiere base Qwen, sin confirmar) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (etiquetado como "long-context", sin valor concreto) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, ko, ja, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base PIXELZX/XION0.2-27B. Los metadatos de HuggingFace incluyen la etiqueta "qwen3.8", lo que podría indicar una arquitectura derivada de la familia Qwen, pero no hay confirmación oficial. Tampoco se han publicado datos sobre el proceso de entrenamiento, el número de tokens utilizados, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

El modelo base está marcado como "abliterated", una técnica que consiste en eliminar o atenuar las capas responsables de los rechazos de seguridad, dando lugar a un comportamiento menos censurado. La cuantización realizada por mradermacher es estática (sin imatrix) y se ha generado a partir de los pesos en bf16 del modelo original. Se incluyen archivos mmproj (proyección multimodal) que sugieren la posibilidad de entrada de imágenes, aunque no se especifica su funcionamiento.

## Capacidades

- Razonamiento: el modelo está etiquetado como "reasoning", lo que indica capacidad para tareas de lógica y resolución de problemas en varios pasos.
- Contexto largo: la etiqueta "long-context" sugiere una ventana de contexto amplia, aunque no se indica el número exacto de tokens.
- Sin censura: al ser "uncensored" y "abliterated", el modelo tiende a no rechazar peticiones que otros modelos bloquearían, lo que puede ser útil o problemático según el caso.
- Multilingüe: soporta inglés, coreano, japonés y chino, lo que lo hace adecuado para aplicaciones en estos idiomas.
- Multimodal (potencial): la presencia de archivos mmproj en la colección GGUF indica que el modelo podría procesar imágenes, aunque no hay documentación al respecto.
- Compatibilidad con herramientas de inferencia local: al estar en formato GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten este formato.

## Casos de uso

- Asistente de chat local sin censura: el modelo puede desplegarse en un servidor local o en un ordenador personal para conversaciones abiertas sin filtros de contenido, útil para investigación o experimentación.
- Razonamiento y resolución de problemas: gracias a su etiqueta "reasoning", puede utilizarse para tareas de lógica, análisis y planificación en entornos donde no se requiera moderación de contenido.
- Procesamiento de texto multilingüe en Asia Oriental: con soporte para coreano, japonés y chino, es adecuado para traducción, resumen o generación de contenido en estos idiomas, especialmente en aplicaciones locales.
- Desarrollo de prototipos con GGUF: los desarrolladores pueden probar diferentes cuantizaciones (Q4_K_M para velocidad, Q8_0 para calidad) y elegir la que mejor se ajuste a su hardware y requisitos de latencia.
- Integración en pipelines de generación aumentada por recuperación (RAG): su contexto largo (aunque no cuantificado) permite procesar documentos extensos, y al ser local, evita el envío de datos sensibles a la nube.
- Experimentación con modelos abliterated: investigadores interesados en el comportamiento de modelos sin censura pueden utilizar este modelo como caso de estudio, comparando sus respuestas con versiones con alineación estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras pruebas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: según el tamaño de los archivos GGUF, se necesitan al menos 10,8 GB (Q2_K) y hasta 28,7 GB (Q8_0) solo para los pesos. A esto hay que sumar memoria para el contexto y los cálculos intermedios.
- GPU recomendadas: para cuantizaciones Q4_K_M (16,6 GB) o inferiores, una GPU con 24 GB de VRAM (RTX 3090, RTX 4090) es suficiente. Para Q8_0 (28,7 GB) se requiere una GPU con 32 GB o más (A100, RTX 6000 Ada) o descarga a CPU.
- Compatibilidad con consumer GPU: sí, las cuantizaciones Q2_K a Q5_K_M caben en GPUs de gama alta de consumo (16-24 GB). Las versiones Q6_K y Q8_0 pueden requerir GPUs profesionales o ejecución en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (según los tags del repositorio). También es posible usar el formato GGUF con bindings de Python como llama-cpp-python.
- Latencia y throughput: no disponible. Dependerá del hardware, la cuantización y la longitud del contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos de la misma categoría (27B, razonamiento, sin censura). El propio repositorio de mradermacher incluye otros modelos como Serenity-27B y atom-27b, pero no hay datos públicos que permitan comparar rendimiento, arquitectura o benchmarks. Se recomienda consultar las fichas de modelos como Qwen 27B o Mistral 24B para establecer referencias, aunque no se han verificado datos concretos.

## Limitaciones y advertencias

- Sesgos y contenido no seguro: al ser "uncensored" y "abliterated", el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtros. No es adecuado para aplicaciones orientadas al público general sin una capa de moderación adicional.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información, especialmente en temas especializados. No se han publicado métricas de fiabilidad.
- Limitaciones de idioma: solo soporta cuatro idiomas (en, ko, ja, zh). El español no está incluido, por lo que su uso en este idioma sería deficiente o inexistente.
- Contexto no especificado: aunque se etiqueta como "long-context", no se indica el número exacto de tokens, lo que dificulta planificar su uso en tareas que requieran ventanas muy grandes.
- Documentación insuficiente: no hay información sobre arquitectura, entrenamiento, benchmarks ni capacidades multimodales detalladas. Cualquier uso en producción debe ir precedido de pruebas exhaustivas.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base puede tener condiciones adicionales no documentadas en esta ficha.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/XION0.2-27B-GGUF
- Modelo base: https://huggingface.co/PIXELZX/XION0.2-27B
- Página de mradermacher en HuggingFace: https://huggingface.co/mradermacher
