# siva-0104/qwen2.5-1.5b-toolcall-abstain-v6

## Resumen

`qwen2.5-1.5b-toolcall-abstain-v6` es un ajuste fino del modelo Qwen2.5-1.5B-Instruct orientado a una tarea muy concreta: el *tool calling* con capacidad de abstención. Dado un mensaje de usuario y una lista de esquemas de herramientas en JSON, el modelo decide entre emitir una o varias llamadas `<tool_call>{"name": ..., "arguments": {...}}</tool_call>`, pedir información adicional o declarar que ninguna herramienta de la lista resulta aplicable. Lo desarrolla el usuario independiente siva-0104 y se publica bajo licencia Apache-2.0.

El modelo parte de la arquitectura transformer decoder-only de Qwen2.5 (1.543.714.304 parámetros, contexto nativo de 32.768 tokens en la familia base) y se entrena con QLoRA de 4 bits (NF4, r=16, alpha=32) sobre un conjunto de datos públicos de function calling, tras lo cual el adaptador se fusiona en los pesos. Su interés reside en el enfoque: en lugar de maximizar el *exact match* de llamadas, incorpora explícitamente la abstención como comportamiento de primera clase, algo crítico en agentes locales que operan con bibliotecas de herramientas grandes y donde una llamada inventada puede ser más costosa que un "no puedo ayudarte con eso".

El repositorio incluye el modelo fusionado en fp16, una versión MLX de 4 bits para Apple Silicon y el adaptador LoRA original. El autor publica además un pipeline de agente validado contra esquema en su repositorio de GitHub, lo que facilita la reproducibilidad de la evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste fino QLoRA fusionado |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-1.5B-Instruct; el entrenamiento se truncó a 1.024 tokens) |
| Tipos de cuantizacion | fp16 (pesos fusionados), 4-bit NF4 (entrenamiento QLoRA), 4-bit MLX |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (modelo fusionado), MLX en `mlx/`, adaptador LoRA en `adapter/` |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-1.5B-Instruct sin modificaciones estructurales: un transformer decoder-only con atención por ventanas deslizantes y RoPE, sobre el que se aplica un ajuste fino QLoRA. La cuantización es NF4 de 4 bits con LoRA de rango 16 y alpha 32, learning rate 2e-4 con scheduler coseno, batch efectivo de 16, una sola época y pérdida calculada únicamente sobre la respuesta (no sobre el prompt). El entrenamiento se completó en una T4 gratuita de Kaggle en 100 minutos para la variante de 1.5B.

Los datos de entrenamiento son públicos y están sujetos a un control de fuga (*leak-gated*): xLAM function-calling 60k (CC-BY-4.0), Glaive function-calling v2 (Apache-2.0), Hermes function-calling v1 (Apache-2.0), ToolACE (Apache-2.0) y negativos sintéticos de herramientas no coincidentes. El conjunto final tiene 8.366 filas tras el truncado a 1.024 tokens, de las cuales el 24% son filas sin llamada (abstención o aclaración). Aproximadamente el 49% de las filas con llamada incluyen entre 1 y 4 herramientas distractoras parecidas recuperadas de la biblioteca de entrenamiento, una decisión de diseño orientada a robustecer la selección de herramienta. Los splits están separados por nombre de herramienta y el script `leak_check.py` pasa sin coincidencias con BFCL. El autor declara una superposición informativa: 13 de 9.314 definiciones de función de BFCL son idénticas (nombre y descripción) a una herramienta de entrenamiento, aunque con consultas distintas.

## Capacidades

- Generación de llamadas a herramientas en formato XML `<tool_call>{"name": ..., "arguments": {...}}</tool_call>`, con soporte para múltiples llamadas en una misma respuesta.
- Abstención explícita: el modelo puede responder que ninguna herramienta de la lista es aplicable, en lugar de forzar una llamada.
- Solicitud de información faltante: en teoría puede pedir aclaraciones antes de llamar; en la práctica, esta capacidad es débil en la variante de 1.5B (ver limitaciones).
- Function calling validable contra esquema JSON, con soporte documentado para decodificación restringida por gramática mediante `lm-format-enforcer`.
- Integración en agentes sobre MCP (Model Context Protocol), con un bucle de agente que valida las llamadas antes de ejecutarlas.
- Capacidades heredadas del modelo base: generación de texto conversacional, razonamiento básico, matemáticas elementales y código a pequeña escala, aunque el ajuste fino no las refuerza específicamente.
- Multilingüismo: limitado al inglés según la model card, pese a que el modelo base Qwen2.5 es multilingüe.

## Casos de uso

- Agentes locales sobre MCP con bibliotecas de herramientas moderadas: el modelo selecciona entre un conjunto de hasta ~10-100 herramientas recuperadas por similitud de embeddings y emite llamadas validadas contra esquema, lo que lo hace adecuado para asistentes de escritorio o CLI que corren en hardware modesto.
- Enrutamiento de intenciones en pipelines de automatización: dado un mensaje y un catálogo de acciones disponibles, el modelo decide qué acción ejecutar o si derivar a un humano, con una tasa de abstención correcta del 84,2% en BFCL irrelevance.
- Sistemas de atención al cliente con catálogo de herramientas acotado: el modelo puede gestionar turnos conversacionales y decidir entre consultar una API (pedidos, stock, facturación) o responder que no dispone de herramienta para la petición.
- Filtro de seguridad en agentes: usar la abstención como capa previa que descarta peticiones fuera de dominio antes de invocar herramientas con efectos secundarios, reduciendo llamadas erróneas.
- Prototipado rápido de asistentes con function calling en Apple Silicon: la versión MLX de 4 bits permite ejecutar el modelo en un Mac con `mlx-lm` sin GPU dedicada.
- Evaluación y *benchmarking* de pipelines de tool calling: el repositorio incluye el scorer propio, el pipeline de agente y los scripts de control de fuga, lo que permite reproducir la evaluación y comparar contra otras variantes de tamaño (0.5B, 3B).
- Generación de datos sintéticos de entrenamiento para function calling: el modelo puede etiquetar pares consulta-herramienta con abstención, útil para ampliar conjuntos de entrenamiento con negativos.

## Benchmarks y rendimiento

Resultados publicados por el autor con su propio scorer (no el checker oficial de BFCL), una sola semilla y BFCL en modo *report-only*. Se comparan las tres variantes del ajuste (0.5B, 1.5B, 3B); la columna relevante para esta ficha es la de 1.5B.

| Benchmark | 0.5B | 1.5B | 3B |
|---|---|---|---|
| BFCL simple, exact match | 79,3 | 83,7 | 89,7 |
| BFCL irrelevance, abstenido | 75,8 | 84,2 | 87,1 |
| BFCL live simple / live irrelevance | 44,6 / 71,7 | 56,6 / 77,0 | 66,3 / 77,0 |
| xLAM exact (test sin fuga) | 68,0 | 71,7 | 77,3 |
| Hermes exact (test sin fuga) | 48,0 | 53,3 | 59,3 |
| ToolACE exact (test sin fuga) | 44,3 | 49,0 | 53,7 |
| Herramientas no coincidentes, abstenido | 99,7 | 99,7 | 100 |
| Agente sobre MCP, 49 consultas, 10 herramientas: éxito de llamada | 80,6% | 93,5% | 93,5% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica, unos 4-5 GB para contextos moderados.
- VRAM estimada en 4 bits (MLX o cuantización GGUF equivalente): alrededor de 1 GB de pesos, con un consumo total de 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para fp16 (RTX 3060, RTX 4060, T4); para 4 bits basta con 4 GB (RTX 3050, GTX 1650, iGPU con suficiente memoria unificada).
- Cabe holgadamente en GPU de consumo: RTX 4090, RTX 3090, RTX 4070, RTX 3060 y similares, con margen para lotes grandes.
- Opciones de despliegue: `transformers` (referencia), `text-generation-inference` (etiqueta `endpoints_compatible`), `vLLM`, `llama.cpp`/GGUF (previa conversión), `Ollama` (previa conversión), `mlx-lm` para Apple Silicon con la versión incluida en `mlx/`.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (1,5B), se espera un throughput alto en GPU moderna y latencia interactiva en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling con abstención | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-1.5b-toolcall-abstain-v6 | 1,54B | 32.768 | Sí, entrenado explícitamente | Apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,54B | 32.768 | Parcial, sin entrenamiento específico de abstención | Apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct | ~3B | 32.768 | Parcial | Apache-2.0 | Hugging Face |
| Variantes del mismo autor (0.5B, 3B) | 0,5B / 3B | 32.768 | Sí | Apache-2.0 | Hugging Face |

La comparación directa más informativa es contra el modelo base: el ajuste mejora el *exact match* en BFCL simple (83,7 frente a valores no publicados del base en esta ficha) y añade abstención calibrada, a costa de un rendimiento inferior en tareas generales no relacionadas con tool calling. Frente a la variante de 3B del mismo autor, el 1.5B pierde entre 6 y 7 puntos en BFCL simple y live simple, pero requiere la mitad de memoria y se entrena en la mitad de tiempo.

## Limitaciones y advertencias

- Debilidad en información faltante: en las pruebas del autor, el modelo de 1.5B llamó con un valor inventado en 4 de 6 consultas que requerían aclaración, en lugar de preguntar. Es un fallo grave para producción en flujos donde los argumentos deben ser exactos.
- Abstención imperfecta: la tasa de abstención correcta en BFCL irrelevance es del 84,2%, lo que implica que en torno a un 16% de las consultas sin herramienta aplicable reciben una llamada.
- Cuello de botella del recuperador: con 12.641 herramientas, la herramienta correcta aparece en el top 5 solo para el 70% de las consultas (94% con 100 herramientas). El manejo de "ninguna herramienta encaja" cae del 93-100% con 10 herramientas al 15-19% cuando el top 5 proviene de la biblioteca completa.
- Degradación con prompts largos de herramientas: incluir 100 herramientas en el prompt reduce el *exact match* al 29% en la variante de 1.5B.
- La decodificación restringida por esquema (`lm-format-enforcer`) garantiza el 100% de llamadas parseables y válidas contra esquema en xLAM, BFCL simple y live simple, pero no corrige los argumentos incorrectos.
- La evaluación del agente es pequeña (49 consultas); diferencias inferiores a 10 puntos son ruido estadístico.
- Solo inglés: no se ha entrenado ni evaluado en castellano ni en otros idiomas, pese a que el modelo base es multilingüe.
- Sin ajuste de seguridad adicional más allá del modelo base; las salidas de herramientas deben tratarse como no confiables.
- Licencia Apache-2.0 permisiva para uso comercial, pero los datos de entrenamiento xLAM son CC-BY-4.0 y requieren atribución si se redistribuye el modelo derivado; conviene revisar los términos de cada dataset.
- El autor declara que código, análisis y documentación se produjeron con Claude Code bajo su dirección, lo que no afecta a la licencia pero sí al proceso de desarrollo.
- Riesgo de alucinación heredado del modelo base en generación libre, especialmente fuera del dominio de tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/siva-0104/qwen2.5-1.5b-toolcall-abstain-v6
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de código, evaluación y pipeline de agente: https://github.com/siva-0104/toolcall-slm
- xLAM function-calling 60k (dataset): https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Glaive function-calling v2 (dataset): https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Hermes function-calling v1 (dataset): https://huggingface.co/datasets/NousResearch/Hermes-Function-Calling
- ToolACE (dataset): https://huggingface.co/datasets/Team-ACE/ToolACE
- Berkeley Function Calling Leaderboard (BFCL): https://gorilla.cs.berkeley.edu/leaderboard.html
