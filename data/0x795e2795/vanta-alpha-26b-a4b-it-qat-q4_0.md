# 0x795E2795/Vanta-Alpha-26B-A4B-it-qat-q4_0

## Resumen

Vanta Alpha 26B-A4B es un modelo de lenguaje experimental basado en una arquitectura sparse Mixture-of-Experts (MoE) de la clase 26B, con aproximadamente 4B parámetros activos por token. Ha sido desarrollado por 0x795E2795 como un fine-tuning sobre el modelo base google/gemma-4-26B-A4B, y se publica en formato GGUF con cuantización Q4_0 para facilitar la inferencia local en entornos compatibles con llama.cpp. El modelo ofrece una ventana de contexto máxima de 262.144 tokens, aunque incluye una ventana de atención deslizante local de 1.024 tokens, lo que lo convierte en una opción interesante para experimentos con contextos muy largos.

Su relevancia actual reside en que se trata de una versión alpha pensada para pruebas tempranas, evaluación independiente y comprobación de compatibilidad de runtimes. La combinación de sparse MoE y cuantización Q4_0 permite ejecutar un modelo de 26B en hardware relativamente moderado, aunque el comportamiento real aún no ha sido validado con benchmarks públicos. Al ser un lanzamiento experimental, el autor invita a la comunidad a reportar observaciones sobre rendimiento, memoria y calidad de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse Mixture-of-Experts (Transformer) |
| Parametros totales | 25.233.142.046 (26B-class) |
| Parametros activos | ~4B |
| Longitud de contexto | 262.144 tokens (con ventana deslizante local de 1.024 tokens) |
| Tipos de cuantizacion | Q4_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_0) |
| Capas | 30 |
| Expertos | 128 |
| Expertos enrutados | Top-8 |
| Tamano del repositorio | 14.2 GB |
| Estado | Alpha / Experimental |

## Arquitectura y entrenamiento

Vanta Alpha 26B-A4B emplea una arquitectura sparse MoE basada en el modelo google/gemma-4-26B-A4B. El modelo tiene 30 capas, 128 expertos y enruta cada token a los 8 expertos más relevantes (Top-8), lo que permite activar aproximadamente 4B parámetros por token. Esta estructura reduce el coste computacional en comparación con un modelo denso de 26B. La ventana de contexto máxima es de 262.144 tokens, complementada por una atención deslizante local de 1.024 tokens que puede influir en el comportamiento a largas distancias.

El autor indica que se trata de un fine-tuning experimental sobre google/gemma-4-26B-A4B. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se especifican innovaciones técnicas adicionales más allá de la cuantización Q4_0 y la propia arquitectura MoE. La model card menciona que la evaluación de benchmarks está en progreso y que los resultados se publicarán más adelante.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el modelo está etiquetado como conversational, lo que indica que está orientado a tareas de chat.
- Contexto largo: soporta una ventana máxima de 262.144 tokens, aunque su comportamiento con longitudes muy grandes es experimental y depende del hardware y la configuración.
- Compatibilidad con llama.cpp: está diseñado para ejecutarse en runtimes compatibles con GGUF, como llama-cli y llama-server.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión, audio o matemáticas: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación de compatibilidad con llama.cpp: el modelo puede probarse en distintas versiones de llama.cpp y otros runtimes GGUF para detectar problemas de backend, errores de carga o comportamientos inesperados. Es un caso de uso primario en una versión alpha.
- Pruebas de comportamiento con contexto largo: gracias a su ventana de 262.144 tokens, es adecuado para experimentar con documentos extensos, medir la degradación de la calidad a medida que crece el contexto y validar la estabilidad del KV cache.
- Comparación de cuantizaciones: el checkpoint Q4_0 puede contrastarse con otras versiones de Vanta Alpha o con el modelo base de Google en diferentes precisiones, analizando diferencias en calidad, velocidad y memoria.
- Prototipado de asistentes conversacionales locales: mediante llama-server, puede desplegarse un chat básico en una máquina local o en un servidor con GPU, permitiendo explorar su comportamiento en diálogos multi-turno.
- Investigación sobre sparse MoE: permite analizar el equilibrio entre coste computacional y calidad al activar solo ~4B parámetros de un total de 25.2B, un tema relevante para el diseño de modelos eficientes.
- Benchmarking académico: una vez se publiquen los resultados de evaluación, el modelo puede utilizarse para comparar tareas de conocimiento general, razonamiento, matemáticas y coding, aunque en el estado actual no hay cifras verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación está en progreso y que los resultados se publicarán después de completar la suite de pruebas, que cubrirá áreas como conocimiento general, razonamiento, matemáticas, coding, seguimiento de instrucciones, retención de calidad tras cuantización, comportamiento con contexto largo y consistencia de salida. No se incluyen números preliminares.

## Requisitos de hardware

- El archivo GGUF Q4_0 tiene un tamaño de repositorio de 14.2 GB. La VRAM necesaria para alojar los pesos es de al menos 14.2 GB, más la memoria adicional para el KV cache, buffers de cómputo y offloading.
- Para el modelo base google/gemma-4-26B-A4B, fuentes externas indican que la cuantización Q4_K_M requiere alrededor de 16.57 GB de VRAM. Este dato corresponde al modelo base y no debe aplicarse directamente a Vanta Alpha, pero sirve como referencia orientativa.
- GPU recomendadas: no disponible. En teoría, una GPU con 16-24 GB de VRAM podría alojar los pesos con offloading parcial, pero no está confirmado para este checkpoint concreto.
- Inferencia solo CPU: posible en runtimes compatibles, con un rendimiento que dependerá fuertemente del ancho de banda de memoria del sistema y de la capacidad de la CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server) y cualquier otro runtime compatible con el formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vanta Alpha 26B-A4B (este) | 25.233.142.046 (activos ~4B) | 262.144 tokens | Q4_0 | no disponible | Experimental (alpha) |
| google/gemma-4-26B-A4B (base) | 26.5B según fuentes externas | 262.144 tokens | Q4_0 (variante GGUF) | no disponible | Publico |

El modelo base de Google, google/gemma-4-26B-A4B, es la referencia arquitectónica y funcional de Vanta Alpha. Existen versiones GGUF de ese modelo base, como la publicada en local-ai-zone.github.io con un tamaño de 15.4 GB y más de 268.000 descargas, lo que indica una adopción significativamente mayor. La diferencia principal es que Vanta Alpha es un fine-tuning experimental con una disponibilidad mínima (0 descargas y 0 likes en el momento de la consulta), por lo que su rendimiento y estabilidad no están validados por la comunidad.

## Limitaciones y advertencias

- Modelo experimental en estado alpha: los pesos, el comportamiento y el formato pueden cambiar en futuras revisiones.
- Cuantización Q4_0: la reducción de precisión puede alterar la calidad de las salidas y producir diferencias con respecto a otros checkpoints de Vanta Alpha, incluso con los mismos prompts y configuración.
- Sensibilidad a la configuración de muestreo: la model card recomienda una temperatura de 1.225, top_p de 0.95 y top_k de 64, pero los resultados pueden variar significativamente si se usan otros valores.
- Sin benchmarks publicados: no hay datos verificados de rendimiento en tareas de conocimiento, razonamiento, matemáticas o coding.
- Idiomas no especificados: no se indica qué idiomas soporta el modelo, por lo que el rendimiento en español u otros idiomas distintos del inglés no está garantizado.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido o si existen restricciones derivadas del modelo base o del fine-tuning.
- Posibles problemas de compatibilidad: al ser un lanzamiento alpha, pueden aparecer errores en backends específicos o en versiones concretas de llama.cpp.
- Comportamiento con contexto largo experimental: aunque la ventana máxima es de 262.144 tokens, la degradación de la calidad a longitudes extremas es desconocida y depende en gran medida de la memoria disponible y la configuración del KV cache.

## Enlaces

- HuggingFace: https://huggingface.co/0x795E2795/Vanta-Alpha-26B-A4B-it-qat-q4_0
- Modelo base google/gemma-4-26B-A4B: https://huggingface.co/google/gemma-4-26B-A4B
- Referencia de hardware para el modelo base (llmrun.dev): https://llmrun.dev/model/google-gemma-4-26b-a4b-it-qat-q4-0-unquantized
- Referencia de descargas para el modelo base GGUF (local-ai-zone.github.io): https://local-ai-zone.github.io/models/gemma-4-26b-a4b-it-qat-q4-0.html
