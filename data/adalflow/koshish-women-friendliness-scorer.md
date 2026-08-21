# Adalflow/koshish-women-friendliness-scorer

## Resumen

El modelo `Adalflow/koshish-women-friendliness-scorer` es un clasificador de texto basado en la arquitectura XLM-RoBERTa, desarrollado por el equipo de AdalFlow (SylphAI). Su propósito, según su nombre, es puntuar o clasificar la "amabilidad hacia las mujeres" en un texto determinado, probablemente como parte del proyecto Koshish. Aunque la model card no aporta detalles sobre el entrenamiento, los datos o el dominio, el modelo se presenta como un clasificador de texto de 278 millones de parámetros, lo que coincide con el tamaño de XLM-RoBERTa base.

El modelo está alojado en Hugging Face Hub con formato safetensors y es compatible con la librería transformers, lo que permite su uso directo para inferencia de clasificación de secuencias. No se especifican licencia, idiomas soportados ni datos de entrenamiento, por lo que su uso en producción requiere verificar estos aspectos antes de desplegarlo.

A pesar de su falta de documentación, la elección de XLM-RoBERTa como base sugiere que el modelo es multilingüe y puede procesar texto en varios idiomas, aunque no se confirma. Su relevancia actual radica en la creciente necesidad de herramientas de moderación y análisis de sesgo de género en contenidos digitales, aunque sin datos concretos sobre su rendimiento, su adopción debe ser cautelosa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base, según tags) |
| Parametros totales | 278.044.417 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (por defecto en XLM-RoBERTa es 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (se infiere multilingue por XLM-RoBERTa, pero no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura XLM-RoBERTa, un transformer encoder preentrenado multilingüe desarrollado por Facebook AI (Conneau et al., 2019). XLM-RoBERTa base tiene 278 millones de parámetros y fue entrenado sobre 2.5 TB de datos filtrados de CommonCrawl en 100 idiomas. La arquitectura es un transformer encoder estándar con atención multi-cabeza y posiciones aprendidas.

La información sobre el entrenamiento específico de este modelo (dataset, fine-tuning, hiperparámetros) no está disponible en la model card. Se desconoce si se realizó un ajuste fino (fine-tuning) sobre un conjunto de datos etiquetado para la tarea de puntuación de "amistad hacia las mujeres", ni qué técnica de entrenamiento (por ejemplo, clasificación binaria, regresión, etc.) se utilizó. El repositorio AdalFlow, del que forma parte, se enfoca en la optimización automática de prompts y few-shot examples, pero no hay evidencia de que este modelo haya sido entrenado con esos métodos.

## Capacidades

- Clasificación de texto: el modelo está diseñado para la tarea de text-classification, produciendo una etiqueta o puntuación relacionada con la "amistad hacia las mujeres" en el texto de entrada.
- Soporte multilingüe potencial: al estar basado en XLM-RoBERTa, es capaz de procesar textos en múltiples idiomas, aunque no se ha confirmado cuáles ni con qué calidad.
- Compatible con la librería transformers: se puede cargar fácilmente con `AutoModelForSequenceClassification` y usar en pipelines de clasificación.
- No se han documentado capacidades adicionales como tool calling, agentes, generación de texto o razonamiento complejo; es un modelo de clasificación de secuencias.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede utilizarse para detectar automáticamente mensajes que no son amigables hacia las mujeres, ayudando a moderar comentarios y publicaciones en foros, redes sociales o secciones de comentarios.
- Análisis de sesgo de género en textos corporativos: se puede emplear para evaluar si los documentos de una empresa (políticas, comunicados, descripciones de puestos) contienen lenguaje que pueda percibirse como no inclusivo hacia las mujeres.
- Evaluación de campañas de marketing: las agencias pueden usar el clasificador para medir el tono de sus materiales publicitarios y asegurarse de que no contengan mensajes que puedan ser considerados ofensivos o excluyentes.
- Investigación en sociolingüística: investigadores pueden aplicar el modelo para analizar grandes corpus de textos y estudiar patrones de lenguaje relacionados con el tratamiento de las mujeres en diferentes dominios.
- Filtrado de contenido en plataformas de citas o empleo: para garantizar que las interacciones sean respetuosas, el modelo puede integrarse en sistemas de moderación previa.
- Herramienta de revisión editorial: los editores pueden usarlo como una primera pasada para detectar posibles problemas de tono en artículos, guiones o contenido de entretenimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se conocen métricas como precisión, F1, exactitud o comparaciones con otros modelos. Por tanto, no es posible evaluar su rendimiento real en la tarea de clasificación.

## Requisitos de hardware

- VRAM estimada: para inferencia con el modelo en FP32 (1.1 GB de pesos), se recomienda al menos 2-3 GB de VRAM para cargar el modelo en memoria junto con los tensores de entrada. En cuantización (por ejemplo, int8) la memoria se reduciría a unos 0.5-0.7 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, etc.) puede ejecutar el modelo sin problemas. En CPU también es viable, aunque más lento.
- ¿Cabe en una GPU de consumidor? Sí, cabe en la mayoría de GPUs de consumidor modernas, incluso en modelos integrados con 8 GB de VRAM.
- Opciones de despliegue: puede cargarse con la librería `transformers` de Hugging Face, usar `pipeline` para clasificación, o servir mediante `Text Classification` en TGI (Text Generation Inference) o `vLLM` (aunque estos están orientados a generación, pueden usarse para clasificación). También se puede exportar a ONNX para acelerar en CPU.
- Latencia: no hay datos medidos, pero para un modelo de 278M parámetros en GPU se espera una inferencia de unos pocos milisegundos por secuencia (por ejemplo, <10 ms con batch pequeño).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea (clasificación de "amistad hacia mujeres"). Se podría comparar con otros modelos de clasificación de texto basados en XLM-RoBERTa, como `xlm-roberta-base` (el modelo base preentrenado) o modelos de análisis de sentimiento multilingües, pero no hay datos de rendimiento específicos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Falta de documentación: no se especifican licencia, idiomas soportados, datos de entrenamiento ni sesgos conocidos. Esto impide evaluar su idoneidad para producción y su cumplimiento legal.
- Riesgo de alucinación y sesgos: como cualquier modelo de lenguaje, puede tener sesgos de género, raza o cultura. Al ser un clasificador entrenado sin información pública, no se puede garantizar su imparcialidad.
- Dominio limitado: el modelo está especializado en un concepto específico ("amistad hacia las mujeres") y no se sabe si funciona bien fuera de ese dominio.
- Sin validación externa: al no haber benchmarks ni pruebas independientes, no se recomienda usarlo en entornos críticos sin una evaluación previa.
- Restricciones de licencia: la licencia no está especificada, lo que puede impedir el uso comercial sin autorización explícita del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Adalflow/koshish-women-friendliness-scorer
- Repositorio de AdalFlow (librería asociada): https://github.com/SylphAI-Inc/AdalFlow
- Documentación de AdalFlow: https://adalflow.sylph.ai/
- Paper de XLM-RoBERTa (referencia arquitectónica): https://arxiv.org/abs/1910.09700
