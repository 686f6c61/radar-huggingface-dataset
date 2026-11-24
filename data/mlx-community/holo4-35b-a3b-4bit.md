# mlx-community/Holo4-35B-A3B-4bit

## Resumen

Holo4-35B-A3B es un modelo multimodal de tipo image-text-to-text desarrollado por H Company (Hcompany), especializado en agentes que operan interfaces gráficas (GUI agents) y tareas de "computer use". La versión que nos ocupa es una cuantización de 4 bits realizada por la comunidad mlx-community para su uso con el framework MLX de Apple Silicon, partiendo de los pesos oficiales en bfloat16 del modelo base `Hcompany/Holo4-35B-A3B`.

El modelo emplea una arquitectura MoE (Mixture of Experts) con 35.107.181.936 parámetros totales y 3 mil millones de parámetros activos por token (el sufijo A3B de su nombre lo indica). Incorpora además componentes propios de las arquitecturas híbridas modernas: atención lineal tipo DeltaNet, expertos compartidos y routers, según se desprende de la descripción de la cuantización. La torre de visión se mantiene en bfloat16 para preservar la calidad de la percepción visual.

Su relevancia radica en que combina percepción visual de capturas de pantalla con generación de acciones (clics, localización de elementos), lo que lo convierte en una herramienta práctica para automatización de navegadores y aplicaciones de escritorio. La licencia Apache-2.0 y la disponibilidad de pesos cuantizados en 4 y 8 bits, además de un GGUF oficial para llama.cpp, facilitan su despliegue tanto en hardware Apple Silicon como en otros entornos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con MoE, atención lineal DeltaNet y torre de visión (qwen3_5_moe) |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | 3 mil millones (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit affine (grupo de 64) con routers en 8-bit; existe también una versión MLX de 8 bits y un GGUF oficial Q4_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), GGUF (oficial, para llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de tipo MoE con 35.000 millones de parámetros totales y 3.000 millones activos por token, lo que reduce el coste computacional de la inferencia frente a un modelo denso del mismo tamaño. La arquitectura incluye atención lineal DeltaNet, expertos compartidos y routers, elementos que la cuantización de mlx-community trata de forma diferenciada: los routers se mantienen en 8 bits mientras el resto de componentes (expertos, atención, DeltaNet, experto compartido, embeddings y lm_head) se cuantizan a 4 bits con grupo de 64. La torre de visión permanece en bfloat16.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO. El pipeline declarado es image-text-to-text, y los tags del modelo incluyen "multimodal", "action", "agent", "computer use" y "gui agents", lo que indica que el entrenamiento está orientado a la percepción de pantallas y a la emisión de acciones sobre ellas.

## Capacidades

- Percepción visual de capturas de pantalla e imágenes en formato image-text-to-text.
- Localización de elementos en interfaces gráficas: devuelve coordenadas como enteros en el rango [0, 1000], siguiendo la receta oficial de H Company.
- Generación de acciones para agentes que operan navegadores y aplicaciones (clics y respuestas estructuradas en JSON).
- Modo de razonamiento ("thinking") configurable: la API de mlx-vlm permite activarlo o desactivarlo (`enable_thinking`); la receta de localización lo desactiva.
- Soporte de conversación multi-turno (tag "conversational").
- Capacidades de agente y computer use, incluyendo tareas de navegación web.
- Uso multilingüe limitado al inglés según la model card.
- No se documentan en la información disponible capacidades de tool calling, function calling ni audio.

## Casos de uso

- Automatización de navegación web: el modelo recibe capturas de pantalla de páginas y devuelve coordenadas de clic sobre los elementos objetivo, con una precisión medida del 90,6 % en el benchmark WebClick, lo que lo hace adecuado para agentes que rellenan formularios o pulsan botones.
- Agentes de computer use en escritorio: al operar sobre capturas de pantalla de aplicaciones nativas, puede localizar menús, campos y controles para ejecutar flujos automatizados de forma visual.
- Pruebas de interfaz automatizadas (QA visual): integrado en pipelines de test, el modelo puede verificar que los elementos de una UI están donde se espera y generar clics sintéticos sobre ellos.
- Asistentes de accesibilidad: interpretación de pantallas para guiar a usuarios con dificultades motoras mediante la localización de objetivos y la sugerencia de acciones.
- Extracción de datos de interfaces: combinando la percepción visual con respuestas estructuradas, puede identificar y señalar campos en paneles de control o dashboards para procesos de scraping guiado.
- Despliegue local en Apple Silicon: gracias a la cuantización de 4 bits y a MLX, puede ejecutarse en un Mac con chip M-series y 128 GB de memoria unificada, con 22,5 GB de pico de memoria y 140 tokens/s de decodificación, lo que permite prototipar agentes sin infraestructura de GPU dedicada.
- Procesamiento de prompts multi-imagen: con tres capturas a 1920x1080 (unos 12.000 tokens de prompt), mantiene 120 tokens/s de decodificación en MLX, útil para tareas que requieren comparar varias pantallas.

## Benchmarks y rendimiento

Benchmark WebClick (Hcompany/WebClick, Apache-2.0, 1639 muestras, protocolo oficial de localización de H Company, thinking desactivado, greedy, 32 tokens nuevos, coordenadas en [0, 1000]):

| Modelo | Precisión | IC 95 % |
|---|---|---|
| MLX 8bit | 91,0 % | 89,6 a 92,3 |
| MLX 4bit (este modelo) | 90,6 % | 89,1 a 91,9 |
| llama.cpp Q4_K_M (GGUF oficial) | 90,8 % | 89,4 a 92,2 |

Por subconjunto (este modelo): agentbrowse 94,4 % (n=590), calendars 86,7 % (n=528), humanbrowse 90,2 % (n=521).

Rendimiento en Apple M5 Max, 128 GB, petición única, greedy:

| Motor | 1280x720: primer token / decodificación | 1920x1080: primer token / decodificación | Memoria |
|---|---|---|---|
| MLX, este modelo (4bit) | 447 ms / 140 tok/s | 1,18 s / 142 tok/s | 22,5 GB (pico) |
| llama.cpp (Metal), Q4_K_M (GGUF oficial) | 690 ms / 123 tok/s | 3,36 s* / 97 tok/s | 23,0 GB (RSS) |

Con prompt largo multi-imagen (3 capturas a 1920x1080, unos 12.000 tokens de prompt, 1024 tokens generados):

| Motor | Tiempo hasta primer token | Decodificación | Memoria |
|---|---|---|---|
| MLX, este modelo (4bit) | 5,2 s | 120 tok/s | 22,7 GB (pico) |
| llama.cpp (Metal), Q4_K_M (GGUF oficial) | 14,3 s | 72 tok/s | no medido |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: 22,5 GB de pico en MLX con la versión de 4 bits; 23,0 GB de RSS en llama.cpp con el GGUF Q4_K_M.
- GPU recomendadas: no se especifican GPU discretas en la información disponible; las mediciones se realizaron en Apple M5 Max con 128 GB de memoria unificada.
- Cabe en GPU de consumo: la información proporcionada no confirma compatibilidad con GPU de consumo como RTX 4090; los 22,5 GB de pico quedan por encima de los 24 GB de una RTX 4090 solo con margen muy ajustado, y no se aportan datos al respecto. En Apple Silicon se ejecuta en un M5 Max de 128 GB.
- Opciones de despliegue: MLX mediante mlx-vlm (versión 0.8.0 o superior, con mlx 0.32.4) y llama.cpp con el GGUF oficial Q4_K_M. No se documentan vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput estimados: primer token de 447 ms a 1280x720 y 1,18 s a 1920x1080; decodificación de 140 a 142 tok/s; con prompts largos multi-imagen, 5,2 s hasta el primer token y 120 tok/s de decodificación (valores medidos en Apple M5 Max).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión WebClick | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Holo4-35B-A3B (este modelo, MLX 4bit) | 35,1 B totales / 3 B activos | no disponible | 90,6 % | Apache-2.0 | MLX safetensors en Hugging Face |
| Holo4-35B-A3B (MLX 8bit) | 35,1 B totales / 3 B activos | no disponible | 91,0 % | Apache-2.0 | MLX safetensors en Hugging Face |
| Holo4-35B-A3B (GGUF oficial Q4_K_M) | 35,1 B totales / 3 B activos | no disponible | 90,8 % | Apache-2.0 | GGUF para llama.cpp |
| Modelos competidores de GUI agents | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre modelos alternativos de la misma categoría (otros GUI agents o modelos de computer use) que permitan una comparación de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés, por lo que el rendimiento en castellano u otras lenguas no está garantizado.
- Longitud de contexto: no se especifica en la información disponible, lo que impide planificar despliegues con prompts muy largos sin validación empírica.
- Riesgo de alucinación: al ser un modelo generativo orientado a la producción de acciones, puede predecir coordenadas incorrectas; la precisión medida en WebClick es del 90,6 %, lo que implica aproximadamente un 9,4 % de fallos en ese benchmark.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada.
- Diferencias de preprocesamiento: la propia model card advierte que las diferencias de precisión entre motores no pueden atribuirse únicamente a los pesos, ya que el preprocesamiento varía entre MLX y llama.cpp.
- Timings indicativos: las celdas marcadas con asterisco en las mediciones de velocidad variaron más del 10 % entre ejecuciones y deben tratarse como orientativas.
- Licencia: Apache-2.0 permite uso comercial, pero se recomienda conservar los avisos de atribución al modelo original de H Company.
- Producción: al ser una cuantización de 4 bits, puede presentar degradaciones sutiles frente a los pesos bfloat16 originales; la validación realizada se limita a dos capturas sintéticas de smoke test y al benchmark WebClick.
- Dependencia de hardware: las mediciones de rendimiento se realizaron exclusivamente en Apple M5 Max; no hay datos de latencia o throughput en GPU NVIDIA u otras plataformas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/Holo4-35B-A3B-4bit
- Modelo base original: https://huggingface.co/Hcompany/Holo4-35B-A3B
- Documentación de localización de elementos de H Company: https://hub.hcompany.ai/models-api/element-localization
- Benchmark WebClick: https://huggingface.co/datasets/Hcompany/WebClick
- Sitio de H Company: https://www.hcompany.ai/
- Perfil del validador: https://huggingface.co/m4zar
