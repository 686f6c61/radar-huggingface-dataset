# adriandj3/LFM2.5-to-Llama8B-LLM2Vec-Kimodo

## Resumen

El modelo `adriandj3/LFM2.5-to-Llama8B-LLM2Vec-Kimodo` es un puente lineal que convierte los embeddings generados por el codificador de frases `LiquidAI/LFM2.5-Embedding-350M` (350M de parámetros, multilingüe) al espacio de representación de `LLM2Vec-Meta-Llama-3-8B-Instruct`, el codificador de texto utilizado por los modelos de generación de movimiento 3D de NVIDIA Kimodo. Desarrollado por adriandj3, este adaptador resuelve el problema del elevado coste computacional del encoder original (16 GB de pesos y decenas de segundos por frase en CPU) permitiendo usar un modelo mucho más ligero y rápido.

El puente se implementa como una regresión ridge lineal (matriz 1024×4096) entrenada sobre pares de vectores generados por ambos codificadores a partir de 14.000 frases de descripción de movimiento (11.600 de entrenamiento, 1.000 de validación y 1.000 de test, más un subconjunto en italiano). Tras el mapeo, los vectores resultantes pueden alimentar directamente a Kimodo, manteniendo el tipo de movimiento generado y añadiendo soporte para prompts en italiano gracias a la naturaleza multilingüe del encoder fuente. Se distribuye bajo licencia Apache-2.0 y está pensado como una solución beta que será mejorada en una versión 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal (ridge regression, forma cerrada) |
| Parametros totales | 4.194.304 (matriz 1024×4096) + vectores de medias y escalares |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; opera sobre embeddings fijos) |
| Tipos de cuantizacion | No disponible (pesos en float32, archivos .npy) |
| Idiomas soportados | Ingles e italiano (entrenamiento); el encoder fuente LFM2.5 soporta 11 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | .npy (NumPy) + configuracion JSON |

## Arquitectura y entrenamiento

El modelo no es un transformer ni un MoE: es un mapeo lineal aprendido entre dos espacios de embeddings. El proceso de entrenamiento consistió en ejecutar ambos codificadores (LFM2.5-Embedding-350M y LLM2Vec-Meta-Llama-3-8B-Instruct) sobre las mismas frases de descripción de movimiento extraídas del corpus HumanML3D, obteniendo pares de vectores alineados. Se aplicó un preprocesado de centrado por media y normalización L2 en cada espacio, y se ajustó una regresión ridge con parámetro de regularización λ=1e-4 seleccionado por validación. Esta regresión superó a un MLP de 4 capas con activación SELU y pérdidas compuestas para el tamaño de datos disponible. La salida se desnormaliza para recuperar la escala y media nativas del espacio objetivo.

El entrenamiento utilizó 11.600 pares en inglés y 1.600 pares cross-linguales (frases en italiano emparejadas con el embedding de su traducción al inglés en el espacio objetivo), más conjuntos de validación y test. El modelo final es una matriz de 1024×4096 que se aplica como producto escalar tras la normalización.

## Capacidades

- Mapeo de embeddings de LFM2.5-Embedding-350M al espacio de LLM2Vec-Meta-Llama-3-8B-Instruct.
- Compatibilidad directa con NVIDIA Kimodo para generación de movimiento 3D a partir de texto.
- Soporte cross-lingual: permite usar prompts en italiano con Kimodo, que originalmente es inglés-céntrico.
- Reducción drástica de recursos: el encoder fuente pesa ~0.7 GB frente a ~16 GB del encoder original.
- Inferencia casi instantánea: milisegundos por frase en GPU (frente a ~150 segundos por frase del encoder 8B en CPU de 4 núcleos).
- Funciona como sustituto genérico del encoder LLM2Vec-Llama-8B en cualquier aplicación que consuma ese espacio de embeddings.

## Casos de uso

- Generación de movimiento 3D para animación: usar Kimodo con prompts en italiano o inglés sin necesidad de alojar el encoder de 8B, reduciendo los requisitos de memoria de 16 GB a menos de 1 GB.
- Prototipado rápido de sistemas de text-to-motion: permite iterar sobre descripciones de movimiento en entornos de desarrollo con GPUs modestas (p. ej. GTX 1080) o incluso CPU para el encoder.
- Aplicaciones en tiempo real: la baja latencia del mapeo (milisegundos) posibilita sistemas interactivos de generación de gestos o animaciones controladas por voz.
- Sustitución de encoders en pipelines existentes: cualquier flujo que consuma embeddings de LLM2Vec-Llama-8B puede intercambiar el encoder pesado por LFM2.5 + este puente, manteniendo una calidad aceptable en tareas de similitud semántica.
- Entrenamiento de modelos downstream con embeddings baratos: investigadores pueden generar características para datasets de movimiento sin necesidad de GPUs de alto rendimiento.
- Soporte multilingüe en herramientas de generación de movimiento: el puente habilita prompts en italiano, y por extensión en otros idiomas que LFM2.5 soporte (si se entrena con pares adicionales), ampliando el alcance de Kimodo.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test retenido (reportados por el autor):

| Metrica | Ingles (1000 muestras) | Italiano (200 muestras) |
|---|---|---|
| Similitud coseno (mapeado vs embedding Llama real) | 0.815 | 0.701 |
| Precision top-1 vecino mas cercano | 0.978 | 0.930 |

No se han publicado comparaciones con otros puentes o enfoques alternativos en la informacion disponible.

## Requisitos de hardware

- El puente en sí es una matriz de 4.19M parámetros; su ejecución requiere únicamente memoria para el producto matriz-vector (aproximadamente 16 MB en float32).
- El encoder fuente LFM2.5-Embedding-350M puede ejecutarse en una GPU de consumo (p. ej. GTX 1080) o incluso en CPU con rendimiento aceptable para lotes pequeños.
- Para usar Kimodo completo (generación de movimiento) se necesita una GPU con suficiente VRAM para el modelo de difusión; el autor no especifica requisitos exactos, pero Kimodo típicamente requiere al menos 8–12 GB.
- Opciones de despliegue: integración en Python con `sentence-transformers` y `numpy`; se puede empaquetar como microservicio o usarse en pipelines de inferencia.
- No se requieren librerías especiales más allá de las estándar; no hay soporte nativo para vLLM, llama.cpp u Ollama porque no es un LLM.

## Comparativa con modelos similares

No hay disponibles puentes de embeddings comparables en la información proporcionada. La alternativa directa sería usar el encoder original LLM2Vec-Meta-Llama-3-8B-Instruct, que ofrece mayor fidelidad (cosine 1.0 por definición) pero con un coste de 16 GB y latencia alta. El puente actual ofrece un equilibrio entre precisión (cosine 0.815 en inglés) y eficiencia, a costa de perder detalles finos en la generación de movimiento.

## Limitaciones y advertencias

- Versión BETA: el autor indica que es una versión temprana y que una v2 con mejor fidelidad está en desarrollo.
- Pérdida de precisión en detalles finos: las generaciones de Kimodo con el puente preservan el tipo de movimiento pero pueden diferir en detalles como qué mano se usa.
- Entrenado con un subconjunto del corpus disponible (14k de 55k frases); el entrenamiento completo está planificado para v2.
- Soporte de idiomas limitado a inglés e italiano en el entrenamiento, aunque el encoder fuente soporta más idiomas.
- No es un modelo de lenguaje ni un generador de texto; solo realiza una transformación de vectores.
- Depende de la calidad del encoder fuente; si LFM2.5 falla en ciertas frases, el mapeo heredará esos errores.
- Para uso en producción, se recomienda evaluar la fidelidad del movimiento generado en el dominio específico antes de desplegarlo.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/adriandj3/LFM2.5-to-Llama8B-LLM2Vec-Kimodo)
- [LiquidAI/LFM2.5-Embedding-350M](https://huggingface.co/LiquidAI/LFM2.5-Embedding-350M)
- [NVIDIA Kimodo (SOMA-RP-v1.1)](https://huggingface.co/nvidia/Kimodo-SOMA-RP-v1.1)
- [McGill-NLP/LLM2Vec-Meta-Llama-3-8B-Instruct-mntp](https://huggingface.co/McGill-NLP/LLM2Vec-Meta-Llama-3-8B-Instruct-mntp)
- [GitHub de Kimodo (implementación oficial)](https://github.com/nv-tlabs/kimodo)
- [GitHub de Kimodo con soporte bnb](https://github.com/matbeedotcom/kimodo)
