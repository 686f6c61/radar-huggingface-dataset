# IFM/K2-Horizon-0.9B-GGUF

## Resumen

K2-Horizon-0.9B es un modelo de lenguaje de tipo decoder-only, denso y de clase 0,9B, desarrollado por IFM como el miembro compacto de la familia K2-Horizon. Se distribuye en este repositorio en formato GGUF para su uso con `llama.cpp`, con variantes de cuantización que van desde BF16 hasta Q4_K_M. Su rasgo diferencial es que combina un tamaño muy reducido con una ventana de contexto de 128K tokens (131.072) gracias al escalado YaRN de RoPE, algo poco habitual en modelos de esta escala.

El modelo está orientado explícitamente al razonamiento y se ha entrenado mediante destilación de conocimiento con múltiples profesores especializados en matemáticas y código, STEM e instrucción general. Esto lo sitúa en la categoría de modelos pequeños con capacidades de razonamiento reforzadas, pensados para ejecutarse en hardware modesto, incluso en CPU o GPU de consumo, sin renunciar a contextos largos.

Es relevante ahora porque la licencia es Apache 2.0, el autor anuncia la publicación del recetario de datos y del código de entrenamiento, y el soporte de la arquitectura K2 Horizon se integró en la rama principal de `llama.cpp` en la release b11454. Esto lo convierte en una opción práctica para despliegues locales, prototipado rápido y experimentación reproducible con presupuestos de cómputo mínimos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (arquitectura K2 Horizon) |
| Parámetros totales | 1.078.285.824 (≈1,08B; etiquetado comercial como 0,9B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (128K) con escalado YaRN de RoPE |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q5_K_M, Q5_0, Q4_K_M (GGUF) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only de tipo denso, sin mezcla de expertos, con aproximadamente 1,08B de parámetros totales. La innovación arquitectónica más destacable es la ventana de contexto de 128K tokens implementada mediante escalado YaRN de RoPE, que permite manejar documentos y conversaciones muy largas en un modelo de menos de 1,1B de parámetros. La arquitectura requiere una versión de `llama.cpp` con soporte específico para K2 Horizon, integrado en la release b11454.

El entrenamiento se basa en destilación de conocimiento multi-profesor: se emplearon profesores de dominio especializados en matemáticas y código, en STEM y en seguimiento de instrucciones. La model card indica que el recetario de datos de entrenamiento y el código de entrenamiento se harán públicos, aunque en la información disponible no se detalla el número de tokens de entrenamiento ni la composición exacta del dataset. Tampoco se especifica si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento matemático, evaluado en benchmarks de matemáticas según la model card.
- Generación y razonamiento sobre código, reforzado por un profesor de dominio específico.
- Razonamiento científico y STEM, con un profesor de dominio dedicado.
- Uso de herramientas (tool use), evaluado en benchmarks de tool-use según la model card.
- Plantilla de chat compatible con `llama.cpp` incluida en todos los ficheros GGUF.
- Capacidad de manejar contextos largos de hasta 128K tokens para documentos extensos o conversaciones multi-turno.
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Asistente local en el escritorio: al caber en cuantización Q4_K_M en menos de 1 GB de pesos, puede ejecutarse en CPU o en GPU de consumo integrada para asistentes personales sin conexión, con privacidad total de los datos.
- Procesamiento de documentos largos: la ventana de 128K tokens permite resumir, extraer información o responder preguntas sobre contratos, informes o expedientes completos en una sola pasada, algo infrecuente en modelos de esta escala.
- Generación de código en entornos con recursos limitados: útil para autocompletado, explicación de fragmentos y generación de tests en IDE o pipelines de CI/CD donde no es viable desplegar modelos de mayor tamaño.
- Tutoría y resolución de problemas matemáticos: el entrenamiento con profesor de matemáticas lo hace adecuado para asistentes educativos que expliquen paso a paso ejercicios de nivel escolar y universitario básico.
- Enrutamiento y clasificación en pipelines de agentes: por su baja latencia y su soporte de tool use, puede actuar como modelo de primera etapa que decide qué herramienta invocar o qué consulta derivar a un modelo mayor.
- Prototipado e investigación reproducible: al anunciarse la publicación del recetario y el código de entrenamiento, sirve como banco de pruebas para estudiar destilación multi-profesor y escalado de contexto en modelos pequeños.
- Despliegue en dispositivos edge o entornos air-gapped: su tamaño y formato GGUF permiten integración en aplicaciones de escritorio, robots o sistemas embebidos con requisitos estrictos de latencia y sin acceso a red.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa frente a Qwen3.5-0.8B, OpenBMB-1B y Qwen3.5-2B, pero en la información proporcionada solo se muestran las filas de número de parámetros, parámetros activos y arquitectura; los valores numéricos de los benchmarks (matemáticas, código, ciencia, tool use) no están disponibles en el extracto. Por tanto, no se reproducen cifras que no se hayan podido verificar.

| Modelo | Parámetros | Activos | Arquitectura |
|---|---|---|---|
| K2-Horizon-0.9B | 0,9B | 0,9B | Dense |
| Qwen3.5-0.8B | 0,8B | 0,8B | Dense |
| OpenBMB-1B | 1B | 1B | Dense |
| Qwen3.5-2B | 2B | 2B | Dense |

No se han publicado en la información disponible los resultados numéricos de los benchmarks citados (matemáticas, código, ciencia y tool use).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6-0,7 GB en Q4_K_M, en torno a 1 GB en Q8_0 y unos 2,2 GB en BF16 (pesos; hay que sumar la caché KV, que crece con el contexto).
- La caché KV para 128K tokens puede ser considerable; con contextos muy largos conviene usar cuantización de caché o reducir la ventana efectiva.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 4090) para contextos moderados; A100/H100 no son necesarias y estarían sobredimensionadas.
- Cabe holgadamente en GPU de consumo e incluso en CPU: en Q4_K_M ocupa menos de 1 GB de pesos, por lo que es viable en portátiles y mini-PC.
- Opciones de despliegue: `llama.cpp` (requiere versión con soporte K2 Horizon, release b11454 o posterior), Ollama y otros runners basados en GGUF; el modelo base es compatible con `transformers`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| K2-Horizon-0.9B | 0,9B (1,08B reales) | 128K (YaRN) | Apache 2.0 | GGUF, safetensors | Destilación multi-profesor; contexto muy largo para su tamaño |
| Qwen3.5-0.8B | 0,8B | No disponible en la información | No disponible en la información | No disponible en la información | Referencia de la model card |
| OpenBMB-1B | 1B | No disponible en la información | No disponible en la información | No disponible en la información | Referencia de la model card |
| Qwen3.5-2B | 2B | No disponible en la información | No disponible en la información | No disponible en la información | Referencia de la model card; el doble de parámetros |

Los datos de contexto, licencia y formato de los modelos de referencia no figuran en la información proporcionada, por lo que se marcan como no disponibles. La comparación de rendimiento queda pendiente de los resultados numéricos de la model card.

## Limitaciones y advertencias

- Modelo de 0,9B: la capacidad de razonamiento y el conocimiento factual son limitados en comparación con modelos de mayor tamaño; es propenso a errores en tareas de razonamiento complejo y multietapa.
- Riesgo de alucinación inherente a los modelos de lenguaje pequeños, especialmente en preguntas factuales y en contextos largos donde la información relevante queda diluida.
- Idiomas soportados únicamente inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- El contexto de 128K depende del escalado YaRN; la calidad en ventanas muy largas puede degradarse y la caché KV incrementa el consumo de memoria.
- Requiere una versión de `llama.cpp` con soporte de la arquitectura K2 Horizon (b11454 o posterior); versiones anteriores no cargarán los pesos.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero conviene verificar los términos de los datos de entrenamiento cuando el autor los publique.
- No se documentan en la información disponible los sesgos conocidos ni las evaluaciones de seguridad del modelo.
- La model card menciona que los checkpoints intermedios y el recetario se publicarán; hasta entonces, la reproducibilidad del entrenamiento no está garantizada.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/IFM/K2-Horizon-0.9B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/IFM/K2-Horizon-0.9B
- Release de `llama.cpp` con soporte K2 Horizon (b11454): https://github.com/ggml-org/llama.cpp/releases?page=5#release-b11454
- Repositorio de `llama.cpp`: https://github.com/ggml-org/llama.cpp
