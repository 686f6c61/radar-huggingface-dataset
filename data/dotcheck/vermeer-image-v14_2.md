# DotCheck/vermeer-image-v14_2

## Resumen

Vermeer@14.2 es un sistema de detección de imágenes sintéticas (AI-generated) desarrollado por DotCheck, la organización de Petr Jaroch. Se trata de un adaptador sobre el modelo base `google/siglip2-base-patch16-224` que combina dos torres SigLIP2 —una que procesa una vista de transporte a resolución 256 píxeles en el lado mayor y otra que analiza un recorte central nativo de 224×224— para producir una probabilidad estimada de que una imagen sea generada por IA. El modelo resuelve el problema de verificar la autenticidad de imágenes estáticas en un contexto donde el contenido sintético se ha vuelto indistinguible a simple vista. Su relevancia actual radica en que ofrece pesos abiertos bajo licencia Apache-2.0, aunque la inferencia en producción se sirve a través de la API de DotCheck, no mediante `AutoModel`. El artefacto principal es un stack `.npz` que combina los logits de las dos ramas, junto con los pesos de los cabezales y los adaptadores LoRA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos torres SigLIP2-base (adaptador LoRA) con combinador lineal (stack) y sigmoide final |
| Parametros totales | No disponible (repo de 3.0 GB, incluye pesos de dos spines LoRA y dos heads lineales) |
| Parametros activos | No disponible (modelo no MoE) |
| Longitud de contexto | No aplica (entrada de imagen, no texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Solo inglés (etiqueta `en` en la model card) |
| Licencia | Apache-2.0 (para los heads y adaptadores de este repo) |
| Formato de pesos | `.npz` (stack), `.npz` (heads), `.safetensors` (spines LoRA) |

## Arquitectura y entrenamiento
Vermeer@14.2 emplea un diseño de dos ramas sobre un mismo backbone SigLIP2. La rama "transport" recibe una imagen redimensionada a un lado máximo de 256 píxeles (manteniendo la relación de aspecto, comprimida a JPEG con calidad 70), mientras que la rama "center" procesa un recorte central nativo de 224×224 píxeles (JPEG calidad 85). Cada rama pasa por su propio adaptador LoRA (denominado "spine") y produce un logit. Un combinador lineal (stack) con pesos y sesgo aprendidos fusiona ambos logits y aplica una función sigmoide para obtener la probabilidad estimada de que la imagen sea generada por IA. El modelo rechaza imágenes cuyo lado menor sea inferior a 224 píxeles. Los datos de entrenamiento consisten en un conjunto de tarea llamado "homework": 197 imágenes reales de Wikipedia y 200 imágenes sintéticas de retención (holdout). No se especifica el número total de tokens (no aplica) ni el uso de RLHF/DPO; el entrenamiento parece ser un ajuste fino supervisado sobre el backbone congelado con adaptadores LoRA.

## Capacidades

- Detección binaria de imágenes generadas por IA: clasifica una imagen como real o sintética, devolviendo una probabilidad `p ∈ [0,1]` donde `p` es la estimación de probabilidad de que sea IA.
- Procesamiento de imágenes estáticas (still images) con resolución mínima de 224 píxeles en el lado menor.
- Combinación de dos vistas (escala completa y recorte central) para robustez frente a distintos artefactos de generación.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso; es un clasificador puro.
- Capacidad multilingüe: no aplica, es un modelo de visión.
- No dispone de modo de pensamiento, visión multimodal ni audio.

## Casos de uso

- **Moderación de contenidos en plataformas de redes sociales**: el modelo puede integrarse en pipelines de moderación para detectar imágenes sintéticas antes de su publicación, usando la probabilidad `p` como umbral de decisión. Su precisión de 0.9924 en balanced accuracy permite filtrar la mayoría de falsos positivos.
- **Verificación de autenticidad en medios de comunicación**: periodistas y verificadores pueden usar la API para comprobar si una imagen recibida de una fuente es potencialmente generada por IA, con un informe de puntuación por par de imágenes.
- **Auditoría de datasets**: en proyectos de machine learning que entrenan modelos con imágenes, se puede usar Vermeer para identificar y excluir imágenes sintéticas de los conjuntos de entrenamiento, mejorando la calidad de los datos.
- **Investigación forense digital**: para analizar imágenes en casos de fraude o desinformación, el modelo proporciona una puntuación objetiva que puede complementar el análisis humano.
- **Protección de propiedad intelectual**: detectar si imágenes usadas en campañas publicitarias o en sitios web han sido generadas por IA, para evitar el uso de contenido sintético sin licencia.
- **Desarrollo de herramientas de control de calidad**: empresas que generan imágenes con IA pueden usar el modelo para validar la calidad de sus propias salidas, ajustando el umbral según la tolerancia de falsos positivos.

## Benchmarks y rendimiento

Según los resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el conjunto de evaluación "homework" (197 imágenes reales de Wikipedia y 200 imágenes IA de retención):

| Métrica | n | Valor |
|---|---|---|
| mean P(AI) real | 197 | 0.025 |
| mean P(AI) AI | 200 | 0.983 |
| balanced accuracy | - | 0.9924 |

No se han publicado comparaciones con otros detectores de imágenes sintéticas en la información disponible. El autor menciona una "Gold 164×25" que permanece como examen interno y no se publica como claim público.

## Requisitos de hardware

- **VRAM estimada**: no disponible oficialmente, pero al estar basado en SigLIP2-base (aproximadamente 86M parámetros) y usar adaptadores LoRA, la inferencia en una sola imagen es ligera. Un modelo de este tamaño puede ejecutarse en GPU con 4 GB o incluso en CPU para uso por lotes pequeños.
- **GPU recomendadas**: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 3060 o superior) es suficiente. No se requiere hardware especializado.
- **Aceptación en GPU de consumo**: sí, cabe en GPU de consumo (por ejemplo, RTX 4090, RTX 3080) sin problemas.
- **Opciones de despliegue**: la card indica que no se puede usar `AutoModel.from_pretrained`; el uso normal es a través de la API de DotCheck (`POST /v1/analyze-pair`) que se sirve con FastAPI sobre CPU. Para despliegue local, se necesitaría reconstruir el pipeline manualmente con los pesos `.npz` y `.safetensors`.
- **Latencia y throughput**: no se proporcionan datos. Al ser un modelo de dos pasadas (dos vistas) con imágenes de hasta 256 píxeles, se espera latencia de milisegundos en GPU y de centenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros detectores de imágenes sintéticas (por ejemplo, modelos como SynthID de Google, o detectores basados en CLIP). La información proporcionada no incluye benchmarks de otros modelos sobre el mismo dataset. Se puede indicar que Vermeer@14.2 se posiciona como una alternativa de código abierto (Apache-2.0) con una arquitectura dual de dos vistas, pero no hay cifras de comparación pública.

## Limitaciones y advertencias

- **No es prueba de autoría**: las puntuaciones son estimaciones bajo el modelo, no una prueba definitiva de que una imagen sea o no generada por IA.
- **Dataset de entrenamiento limitado**: el conjunto "homework" consta de solo 197 reales y 200 sintéticas, lo que puede limitar la generalización a otros tipos de generadores.
- **Limitación de resolución**: se rechaza cualquier imagen con lado menor inferior a 224 píxeles, lo que puede excluir imágenes pequeñas o miniaturas.
- **No es un posterior completo**: el autor indica que "Homework es Layer A, no un posterior sobre cada generador", es decir, la puntuación no es una probabilidad calibrada sobre todos los posibles modelos de IA.
- **Restricciones de uso**: aunque los pesos están bajo Apache-2.0, la inferencia habitual se realiza a través de la API de DotCheck (producto comercial); el uso local requiere reconstruir el pipeline manualmente.
- **Sesgos potenciales**: al estar entrenado con imágenes de Wikipedia y un conjunto específico de generadores, puede tener sesgos hacia ciertos estilos de imágenes (fotografías reales vs. arte digital) y no generalizar bien a dominios muy distintos (por ejemplo, ilustraciones médicas o mapas).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/DotCheck/vermeer-image-v14_2)
- [Modelo anterior v12 (archivo)](https://huggingface.co/DotCheck/vermeer-image-v12)
- [Organización DotCheck en Hugging Face](https://huggingface.co/DotCheck)
- [Página de producto Check](https://dotcheck.ai/check)
- [Documentación de la API Pro](https://dotcheck.ai/api)
- [Informe técnico DotCheck (PDF)](https://dotcheck.ai/docs/dotcheck-technical-report-v2026.7.pdf)
