# Eskoseta/qwen-aggressive-static

## Resumen

Eskoseta/qwen-aggressive-static es un Space de Hugging Face publicado por el usuario Eskoseta. Se trata de un artefacto de tipo estático (sdk: static, app_file: index.html), es decir, una página web servida sin backend de inferencia, y no de un modelo con pesos descargables. Su único propósito declarado es actuar como demo gratuita del modelo TheCluster/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-MLX-mxfp4.

La model card del Space se titula "Qwen 3.5 9B Uncensored Aggressive Demo (Static)" y se limita a un encabezado y un enlace al modelo referenciado. No incluye especificaciones, datos de entrenamiento, benchmarks, licencia ni idiomas soportados. El repositorio registra 0 descargas y 0 likes, y no declara pipeline ni etiquetas de idioma.

Por tanto, su relevancia para un desarrollador o investigador es indirecta: sirve como punto de entrada o escaparate hacia un fine-tuning "uncensored" de una base Qwen de 9B distribuido en formato MLX con cuantización mxfp4 (orientado a Apple Silicon). Cualquier evaluación técnica del modelo en sí debe hacerse sobre el repositorio referenciado, no sobre este Space.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el nombre del modelo referenciado sugiere 9B, sin confirmar) |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo referenciado indica mxfp4 en su nombre, sin confirmar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (este Space no contiene pesos; el modelo referenciado apunta a formato MLX) |
| Tipo de artefacto | Space estático (HTML, sin backend de inferencia) |
| SDK | static |
| Descargas | 0 |
| Likes | 0 |
| Creado | 2026-10-12T02:23:48.000Z |
| Actualizado | 2026-10-12T02:23:51.000Z |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura, el número de tokens de entrenamiento, la composición del dataset ni el método de alineación (RLHF, DPO u otros) de este artefacto. El Space no contiene pesos ni código de inferencia: es una página estática. Los únicos indicios proceden del nombre del modelo al que apunta la demo: "Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-MLX-mxfp4", que sugiere una base Qwen de 9B parámetros, un ajuste fino orientado a eliminar restricciones de contenido ("uncensored") y una distribución cuantizada en mxfp4 para el runtime MLX de Apple. Ninguno de estos extremos está confirmado en la información disponible.

Tampoco hay datos sobre innovaciones técnicas (decodificación especulativa, atención lineal, arquitecturas híbridas) ni sobre el proceso de cuantización empleado. Cualquier afirmación al respecto sería especulativa y no debe tomarse como base para decisiones de producción.

## Capacidades

- Generación de texto: no verificable; el Space no ejecuta inferencia y no se documentan capacidades.
- Razonamiento, código, matemáticas: no disponible.
- Capacidades de visión o audio: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo "thinking" o modos especiales: no disponible.
- Estilo "uncensored/aggressive": sugerido únicamente por el nombre del modelo referenciado, sin evidencia documental en este repositorio.

## Casos de uso

- Localización del modelo real: el Space funciona como enlace de entrada hacia TheCluster/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-MLX-mxfp4, útil para quien busca el repositorio de pesos a partir del nombre de la demo.
- Prueba cualitativa rápida en navegador: si la página estática incluye una interfaz conectada a un backend externo (extremo no confirmado), permitiría lanzar prompts de sondeo sin instalar nada; en caso contrario, no ofrece ninguna funcionalidad de inferencia.
- Evaluación de contenido sin filtrar en entorno controlado: para equipos de investigación en alineación y seguridad que quieran estudiar el comportamiento de un modelo "uncensored" frente a prompts de riesgo, siempre que se acceda al modelo subyacente y no a esta demo.
- Comparación de cuantizaciones en Apple Silicon: el formato mxfp4 del modelo referenciado permite medir degradación de calidad y consumo de memoria unificada frente a otras cuantizaciones (4-bit GGUF, 8-bit), aunque este Space no aporta dichas mediciones.
- Plantilla para construir una demo propia: la estructura mínima (index.html, sdk: static) sirve como ejemplo de despliegue gratuito de una página de presentación de un modelo en Hugging Face Spaces.
- Reproducibilidad y linaje de fine-tunings: documenta la existencia de un ajuste "HauhauCS-Aggressive" sobre una base Qwen de 9B, dato relevante para trazar el origen de variantes derivadas.
- Docencia sobre riesgos de modelos sin alineación: útil como caso de estudio de un artefacto publicado sin licencia, sin benchmarks y sin moderación declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El Space en sí no requiere GPU: es un artefacto estático que se sirve como HTML desde la infraestructura de Hugging Face.
- Para el modelo referenciado (9B parámetros, cuantización mxfp4 indicada en el nombre), una estimación orientativa sería del orden de 5-6 GB de pesos en memoria, aunque no hay confirmación oficial ni ficha técnica que lo respalde.
- GPU recomendadas: no disponible para el modelo referenciado; el sufijo MLX apunta a ejecución en Apple Silicon (memoria unificada) más que a GPU NVIDIA.
- ¿Cabe en GPU de consumo? No disponible. Si se confirma el tamaño de 9B en 4 bits, cabría en tarjetas con 8-12 GB de VRAM en cuantizaciones GGUF equivalentes, pero es una extrapolación, no un dato del repositorio.
- Opciones de despliegue: no disponibles para este Space. Para el modelo referenciado habría que consultar su propia documentación (MLX LM para formato MLX; llama.cpp, Ollama o vLLM para conversiones GGUF/safetensors).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Eskoseta/qwen-aggressive-static | no disponible | no disponible | no disponible | Space estático, 0 descargas | Demo, no contiene pesos |
| TheCluster/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-MLX-mxfp4 | 9B (segun nombre, sin confirmar) | no disponible | no disponible | Repositorio referenciado por la demo | Fine-tuning "uncensored", formato MLX mxfp4 |
| Otras alternativas de ~9B | no disponible | no disponible | no disponible | no disponible | No se aporta información comparativa |

No se dispone de datos de rendimiento, licencia ni contexto de ninguno de los modelos citados, por lo que no es posible establecer una comparativa técnica rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de ficha técnica: no hay arquitectura, contexto, idiomas, licencia ni formato declarados, lo que impide evaluar su idoneidad para cualquier uso.
- Etiqueta "uncensored/aggressive": el nombre del modelo referenciado sugiere ausencia de filtros de contenido; esto implica riesgo de generar material dañino, ilegal o sesgado y exige moderación externa en cualquier despliegue.
- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial; además, la licencia del modelo subyacente puede imponer condiciones adicionales no reflejadas aquí.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni evaluaciones de fiabilidad publicadas.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay informes de terceros sobre su funcionamiento.
- Limitaciones de contexto e idioma: desconocidas.
- Nomenclatura dudosa: el nombre "Qwen 3.5" no se corresponde con una familia verificada en la información disponible, lo que obliga a confirmar la procedencia real de los pesos antes de cualquier uso.
- Fechas del repositorio: creado y actualizado el 2026-10-12, con tres segundos de diferencia entre ambos eventos, lo que indica una publicación automatizada o de prueba.
- No apto para producción tal cual: al ser una página estática sin backend verificado, no ofrece ninguna garantía de servicio.

## Enlaces

- Space en Hugging Face: https://huggingface.co/Eskoseta/qwen-aggressive-static
- Modelo referenciado en la model card: https://huggingface.co/TheCluster/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-MLX-mxfp4
- Resultados de búsqueda web: no se han encontrado enlaces relevantes (los resultados devueltos corresponden a foros de compraventa de dominios y no guardan relación con el modelo).
