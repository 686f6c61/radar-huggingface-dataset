# letechlead/Ornith-1.5-35B-A3B-INT4-W4A16-AutoRound

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el equipo de Ornith AI, que extiende el enfoque de auto-aprendizaje introducido en Ornith-1.0. Con 35 000 millones de parámetros totales y solo 3 000 millones de activos por token, ofrece un rendimiento elevado con un coste computacional reducido, lo que lo hace viable para despliegue en hardware de gama media. Esta ficha cubre la versión cuantizada a INT4 mediante AutoRound, que reduce el tamaño del modelo de unos 71,9 GB (BF16) a aproximadamente 19 GB, permitiendo su ejecución en GPUs de consumo con 24 GB de VRAM.

La arquitectura sigue el diseño de Qwen3.5 MoE: 256 expertos, 8 activos por token, 40 capas ocultas, 16 cabezas de atención y 2 cabezas KV. El modelo base fue entrenado con un proceso de auto-mejora en el que el propio modelo propone tareas, genera andamiajes y produce soluciones para entrenamiento por refuerzo. Esta versión cuantizada mantiene las mismas capacidades de generación de texto, razonamiento y codificación, aunque se limita a la modalidad de texto (sin la torre de visión del modelo original). Está publicada bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForCausalLM (MoE, 256 expertos, 8 activos/token) |
| Parametros totales | 35 000 millones (35B) |
| Parametros activos | 3 000 millones (3B) |
| Longitud de contexto | no disponible (el modelo base de Qwen3.5 soporta ventanas largas, pero no se especifica en la ficha) |
| Tipos de cuantizacion | INT4 W4A16, group_size 128, simetrico (AutoRound) |
| Idiomas soportados | no disponible (presumiblemente multilingue, pero no se indica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (INT4 empaquetado, con tensores extra en BF16/F16) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B sigue la arquitectura Qwen3.5 MoE: 40 capas ocultas con un hidden size de 2048, 16 cabezas de atención y 2 cabezas KV (grupos de consulta). El componente MoE contiene 256 expertos y selecciona 8 por token, lo que reduce el coste computacional a aproximadamente 3 000 millones de parámetros activos. El vocabulario es de 248 320 tokens. El entrenamiento del modelo base se basa en un bucle de auto-mejora: el modelo genera nuevas tareas, crea andamiajes específicos y produce soluciones que se utilizan como datos de entrenamiento por refuerzo, ampliando así su capacidad de razonamiento y codificación.

La cuantización se realizó con Intel AutoRound (versión 0.14.2) sobre el modelo original en BF16. Se aplicó el esquema W4A16 (pesos en INT4, activaciones en BF16), con group size 128 y cuantización simétrica. El proceso de calibración usó el dataset `pile-10k` con 128 muestras y una longitud de secuencia de 1024 tokens, optimizado con Adam durante 200 iteraciones. Los pesos de los expertos y la mayoría de las capas lineales se empaquetaron en INT4, mientras que embeddings, normas y el router se mantuvieron en alta precisión (BF16). El checkpoint resultante ocupa ~19 GB en disco (frente a los ~71,9 GB del original), una compresión de aproximadamente 3,8×.

## Capacidades

- Generación de texto en lenguaje natural con coherencia y gramática correcta, verificada en pruebas de generación del propio autor.
- Razonamiento complejo y solución de problemas, gracias a la arquitectura MoE y al entrenamiento de auto-mejora.
- Generación de código y asistencia en tareas de programación, como se indica en los análisis del modelo base.
- Capacidades multilingües (probables, aunque no se detallan en la ficha técnica).
- No incluye soporte de visión: la torre visual del modelo original se descartó en esta versión cuantizada.
- No se ha confirmado soporte explícito de tool calling o function calling en la información proporcionada, aunque la arquitectura base (Qwen3.5) suele incluirlo.

## Casos de uso

- Asistente de programación local: el modelo puede ejecutarse en una GPU con 24 GB de VRAM y proporcionar autocompletado de código, explicaciones y refactorización. Gracias a sus 3B parámetros activos, la inferencia es rápida incluso en hardware de consumo.
- Chat conversacional autohospedado: para empresas que necesitan un asistente de texto sin enviar datos a la nube, este modelo ofrece una alternativa ligera con licencia permisiva.
- Generación de documentación técnica: puede redactar manuales, comentarios de código y explicaciones de arquitecturas a partir de fragmentos de código o descripciones.
- Análisis de textos y resúmenes: su ventana de contexto (si es amplia) permite procesar documentos largos, aunque no se especifica el límite exacto.
- Entornos de desarrollo integrado (IDE): se puede integrar en plugins de editor como VSCode mediante Ollama o llama.cpp para asistencia en tiempo real.
- Investigación en MoE: permite experimentar con técnicas de cuantización y evaluación de modelos MoE en entornos de recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~19,5 GB en INT4 (según la verificación del autor), por lo que se requiere una GPU con al menos 20-24 GB de VRAM para ejecución en GPU.
- GPUs recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), A10 (24 GB), o GPUs profesionales con más VRAM.
- También puede ejecutarse en CPU con RAM suficiente (el autor lo probó con 503 GB de RAM, aunque para uso práctico se recomienda al menos 32-64 GB de RAM).
- Opciones de despliegue: compatible con Transformers y el kernel de AutoRound, así como con llama.cpp, Ollama y LM Studio mediante conversión a GGUF (aunque esta versión se distribuye en safetensors, se puede convertir).
- Latencia y throughput: no se han publicado mediciones, pero con solo 3B parámetros activos se espera una inferencia rápida en GPU moderna.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría (por ejemplo, Qwen3-30B-A3B o MiniCPM-MoE) en la información proporcionada. Se recomienda consultar los resultados del modelo base en su página de HuggingFace para conocer su rendimiento relativo.

## Limitaciones y advertencias

- Es una versión cuantizada a INT4: puede haber una ligera pérdida de precisión en comparación con el modelo BF16 original, especialmente en tareas que requieren alta exactitud numérica.
- Solo admite texto: no incluye la torre de visión del modelo base, por lo que no puede procesar imágenes.
- No se especifican los idiomas soportados: se recomienda verificar el comportamiento en el idioma objetivo antes de usarlo en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje: se deben validar las respuestas en aplicaciones críticas.
- El proceso de cuantización usó un dataset de calibración limitado (128 muestras), lo que puede afectar a la generalización en dominios específicos.
- No se han publicado benchmarks oficiales, por lo que el rendimiento real no está documentado.
- La ventana de contexto no se ha especificado; si se necesita un contexto largo, se debe comprobar la configuración del modelo base.

## Enlaces

- Modelo cuantizado: https://huggingface.co/letechlead/Ornith-1.5-35B-A3B-INT4-W4A16-AutoRound
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Blog de Ornith 1.5: https://ornith.ai/ornith_1_5.html
- Repositorio de AutoRound: https://github.com/intel/auto-round
- Vídeo de prueba del modelo base (YouTube): https://www.youtube.com/watch?v=r7k8T8rjhUE
- Guía de ejecución local (LocalClaw): https://localclaw.io/models/ornith-1-5-35b-a3b
- Análisis para agentes de codificación (wavespeed.ai): https://wavespeed.ai/blog/ai-models/ornith-1-5-35b-a3b-review/
