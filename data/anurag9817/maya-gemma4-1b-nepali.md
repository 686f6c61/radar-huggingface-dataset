# Anurag9817/MAYA-Gemma4-1B-Nepali

## Resumen

MAYA-Gemma4-1B-Nepali es un modelo de lenguaje de 1.027 millones de parámetros, desarrollado por Anurag9817 como baseline de investigación. Sus pesos se derivan estructuralmente de Google Gemma 4 12B, seleccionando capas, cabezas de atención y dimensiones ocultas reducidas, y construyendo un vocabulario de 32.768 tokens a partir de las filas correspondientes del modelo fuente. El objetivo declarado es servir como punto de partida para un entrenamiento continuado en nepalí, mediante continued pretraining, destilación de conocimiento desde Gemma 4 12B y ajuste fino supervisado con instrucciones.

En su estado actual, el checkpoint está verificado para integridad tensorial, carga estricta de state-dict, forward pass, backward pass, flujo de gradientes y actualización de optimizador. Sin embargo, no ha completado ningún entrenamiento adicional, por lo que la generación es degenerada y no debe considerarse un chatbot funcional. Es una pieza de investigación para estudiar la viabilidad de derivar modelos compactos de modelos grandes y su posterior adaptación a idiomas de bajos recursos.

Los resultados de búsqueda web no aportaron información relevante sobre el modelo; las únicas fuentes disponibles son la ficha de HuggingFace y la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención deslizante (sliding attention) y atención global |
| Parametros totales | 1.027.763.988 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos originales); no se indican cuantizaciones adicionales |
| Idiomas soportados | no disponible (el nombre sugiere nepalí, pero no se declara oficialmente) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors o binario de PyTorch, no confirmado) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer de 20 capas, con 12 capas de atención deslizante (sliding attention) y 8 capas de atención global, un esquema similar al empleado en la familia Gemma. El tamaño oculto es de 1.792 dimensiones, con un tamaño intermedio de 7.168 en las capas feed-forward. Las embeddings de entrada y salida están atadas (tied), lo que reduce el número total de parámetros. Los pesos se almacenan en BF16.

Los pesos se obtuvieron mediante una derivación estructural: se seleccionaron las capas y cabezas objetivo de Gemma 4 12B y se redujeron las dimensiones ocultas. El vocabulario de 32.768 tokens se construyó a partir de las filas seleccionadas del vocabulario fuente y de un slice estructural de 1.792 dimensiones. No se ha realizado ningún entrenamiento adicional; el checkpoint solo ha pasado por verificaciones de integridad y flujo de gradientes. El plan de entrenamiento incluye continued pretraining en nepalí, destilación de conocimiento desde Gemma 4 12B y ajuste fino supervisado con instrucciones en nepalí, seguido de evaluación comparativa.

## Capacidades

- No tiene capacidades funcionales en su estado actual: al ser un baseline sin entrenar, la generación es degenerada y no produce texto coherente.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües declaradas.
- No dispone de modo de pensamiento (thinking mode) ni capacidades de visión o audio.
- Su única utilidad es como objeto de estudio para investigar la derivación estructural de modelos grandes a pequeños y el entrenamiento en idiomas de bajos recursos.

## Casos de uso

- Investigación sobre destilación estructural: permite estudiar cómo se comporta un modelo compacto derivado de Gemma 4 12B antes de cualquier entrenamiento, sirviendo como línea base para comparar el efecto del continued pretraining y la destilación.
- Desarrollo de modelos para nepalí: una vez completado el plan de entrenamiento, podría utilizarse para tareas de generación de texto, traducción y comprensión en nepalí, un idioma con pocos recursos.
- Evaluación de técnicas de adaptación de vocabulario: el proceso de construcción del vocabulario de 32.768 tokens a partir del vocabulario fuente puede analizarse para mejorar métodos de subword tokenization en idiomas minoritarios.
- Validación de pipelines de entrenamiento: al estar verificado para forward/backward y actualización de optimizador, puede usarse para probar infraestructuras de entrenamiento distribuido o de ajuste fino.
- Comparación de arquitecturas de atención: las 12 capas de atención deslizante frente a las 8 globales permiten estudiar el equilibrio entre eficiencia y capacidad de modelado de contexto largo.
- No es adecuado para ningún uso en producción o aplicaciones reales en su estado actual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la evaluación está planificada tras completar el entrenamiento, pero no hay datos numéricos actuales.

## Requisitos de hardware

- Tamaño del repositorio: 2,1 GB, correspondiente a los pesos en BF16.
- Inferencia en BF16: aproximadamente 2,1 GB de VRAM para los pesos, más overhead de activaciones y KV cache; cabría en GPUs consumer con 4 GB o más, como una GTX 1650 Super, aunque no se recomienda por la falta de entrenamiento.
- Entrenamiento: para continued pretraining o SFT se necesitaría al menos una GPU con 8-16 GB de VRAM (por ejemplo, RTX 3070, RTX 4080, A10) dependiendo del batch size y el uso de técnicas como LoRA o QLoRA.
- Opciones de despliegue: al ser un checkpoint de PyTorch/HuggingFace, podría cargarse con transformers, pero no es útil para inferencia real. No se mencionan formatos GGUF ni compatibilidad con vLLM, Ollama o llama.cpp.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de tamaño similar orientados a nepalí o derivados estructuralmente de Gemma. La comparativa no está disponible.

## Limitaciones y advertencias

- El modelo no ha sido entrenado: la generación es degenerada y no produce texto coherente ni útil.
- No se especifica licencia: no se puede determinar si es apto para uso comercial o académico sin autorización explícita del autor.
- No se declaran idiomas soportados, aunque el nombre sugiere nepalí como objetivo; no hay garantía de calidad en ningún idioma.
- No se indica la longitud de contexto soportada.
- No hay información sobre sesgos, alucinaciones o riesgos de seguridad, pero al ser un modelo sin entrenar, estos riesgos no son aplicables en la práctica.
- Para cualquier uso en producción, sería necesario completar el entrenamiento planificado y realizar una evaluación exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/Anurag9817/MAYA-Gemma4-1B-Nepali
- No se encontraron papers, repositorios adicionales, blogs o demos relacionados en la búsqueda web.
