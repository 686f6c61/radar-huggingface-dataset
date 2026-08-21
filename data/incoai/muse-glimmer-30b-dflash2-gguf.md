# incoai/Muse-Glimmer-30B-DFlash2-GGUF

## Resumen

Muse-Glimmer-30B-DFlash2-GGUF es un modelo de draft (borrador) diseñado para decodificación especulativa, desarrollado por Inco AI. No es un modelo de lenguaje independiente, sino un componente que acelera la inferencia del modelo base `meta-models/Muse-Glimmer-30B`, un modelo agéntico multimodal de 30 000 millones de parámetros creado por Meta Superintelligence Labs. El drafter predice bloques completos de tokens en una sola pasada, que el modelo base verifica posteriormente, reduciendo la latencia y el coste computacional en escenarios de despliegue local o en servidores.

La técnica subyacente, DFlash 2, es una evolución del método DFlash presentado en ICML 2026. Utiliza difusión de bloques con convoluciones dinámicas de dos toques para mantener la calidad del draft hacia el final de cada bloque, y un selector ligero que traza una trayectoria coherente entre los candidatos generados. La decodificación es lossless: la salida greedy coincide exactamente con la del modelo base y el muestreo preserva la distribución original.

Este repositorio contiene conversiones GGUF del drafter en tres cuantizaciones (Q4_K_M, Q8_0 y BF16), con tamaños que van de 1,6 GB a 5,5 GB. El modelo tiene aproximadamente 2 770 millones de parámetros y una longitud de contexto de 128 000 tokens según fuentes externas. Está licenciado bajo Apache 2.0 y se integra con llama.cpp mediante un pull request específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión de bloques (block diffusion) con selector de trayectoria y convoluciones dinámicas de dos toques |
| Parametros totales | 2 772 159 744 (~2,77 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128 000 (según fuentes externas) |
| Tipos de cuantizacion | Q4_K_M, Q8_0, BF16 (formato GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el checkpoint original) |

## Arquitectura y entrenamiento

DFlash 2 es un drafter basado en difusión de bloques, una arquitectura que predice un bloque completo de tokens en paralelo en lugar de token a token. El backbone incorpora convoluciones dinámicas de dos toques que evitan la degradación del draft hacia el final del bloque. Un selector ligero examina los candidatos generados en cada posición y traza una única trayectoria coherente que se envía al modelo base para verificación. Este diseño permite una decodificación especulativa eficiente, con una longitud de aceptación media de 5,4 a 5,6 tokens por paso de verificación en las pruebas publicadas.

El entrenamiento del drafter se realizó específicamente para el modelo base Muse-Glimmer-30B, aunque los detalles exactos del dataset y el proceso de entrenamiento no se detallan en la información disponible. La técnica de decodificación especulativa es lossless, lo que garantiza que la salida del modelo combinado (drafter + base) es idéntica a la del modelo base solo, tanto en modo greedy como en muestreo estocástico.

## Capacidades

- Predicción paralela de bloques de tokens para decodificación especulativa.
- Generación de múltiples candidatos por posición con selección de trayectoria coherente.
- Decodificación lossless: la salida greedy coincide exactamente con el modelo base.
- Compatibilidad con llama.cpp mediante el PR #27342 (soporte DFlash 2).
- Optimizado para el modelo base Muse-Glimmer-30B de Meta.
- Disponible en cuantizaciones Q4_K_M, Q8_0 y BF16 para adaptarse a distintos presupuestos de memoria.
- No es un modelo de lenguaje independiente: no genera texto por sí mismo, solo acelera la inferencia del modelo base.

## Casos de uso

- Despliegue local de Muse-Glimmer-30B en hardware de consumo: el drafter en Q4_K_M ocupa solo 1,6 GB, lo que permite ejecutar el modelo base (también cuantizado) en GPUs de gama media o incluso en CPU con suficiente RAM, reduciendo la latencia de generación.
- Servidores de inferencia de baja latencia: integrado en llama-server, acelera la generación de respuestas en aplicaciones de chat o agentes que requieren tiempos de respuesta rápidos.
- Reducción de costes en la nube: al disminuir el número de pasos de verificación necesarios, se reduce el consumo de cómputo por petición, abaratando el despliegue de modelos grandes.
- Aplicaciones agénticas en el edge: Muse-Glimmer-30B está diseñado para workflows agénticos siempre activos; el drafter permite que estas aplicaciones funcionen con menor latencia en dispositivos locales.
- Investigación en decodificación especulativa: el repositorio sirve como referencia para estudiar la técnica DFlash 2 y comparar su rendimiento con otros métodos de draft.
- Prototipado rápido de aplicaciones de IA generativa: al acelerar la inferencia, los desarrolladores pueden iterar más rápido sobre prompts y flujos de trabajo sin necesidad de hardware de alta gama.

## Benchmarks y rendimiento

La model card publica la longitud de aceptación media (acceptance length) para las tres cuantizaciones del drafter, medida sobre los primeros ocho ejemplos de test de GSM8K con el modelo base en Q4_K_M y los parámetros de muestreo recomendados por Muse (temperatura 1.0, top-p 0.95, top-k 64, alta fuerza de razonamiento, máximo 2048 tokens nuevos).

| Cuantizacion del drafter | Longitud de aceptacion media |
|---|---|
| BF16 | 5,45 |
| Q8_0 | 5,58 |
| Q4_K_M | 5,44 |

La longitud de aceptación es el número medio de tokens de la respuesta dividido por el número de pasos de verificación. Un valor más alto indica un drafter más eficaz. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, etc.) para este drafter, ya que no es un modelo de lenguaje completo.

## Requisitos de hardware

- VRAM estimada para inferencia: 1,6 GB (Q4_K_M), 2,9 GB (Q8_0), 5,5 GB (BF16) solo para el drafter. Hay que sumar la VRAM del modelo base (Muse-Glimmer-30B cuantizado, típicamente 15-20 GB en Q4_K_M).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el drafter en Q4_K_M junto con el modelo base en Q4_K_M; para BF16 se recomienda 12 GB o más. Ejemplos: RTX 3060, RTX 4070, RTX 4090, A100, H100.
- En consumer GPU: sí, cabe en GPUs de gama media con 8-12 GB de VRAM si se usa cuantización Q4_K_M para ambos modelos.
- Opciones de despliegue: llama.cpp con soporte DFlash 2 (PR #27342), servidor llama-server. También se menciona compatibilidad con otros motores en el blog de Inco AI.
- Latencia y throughput: no se proporcionan cifras exactas, pero la longitud de aceptación de ~5,5 tokens por paso sugiere una reducción de latencia de aproximadamente 3-4 veces frente a la decodificación autoregresiva estándar, dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros drafters (como EAGLE, Medusa o Lookahead) en la información proporcionada. La técnica DFlash 2 es relativamente nueva y no se han publicado comparativas estandarizadas en este repositorio. Se recomienda consultar el blog de Inco AI para posibles comparaciones con métodos anteriores.

## Limitaciones y advertencias

- No es un modelo independiente: requiere el modelo base Muse-Glimmer-30B para funcionar. No puede usarse para generación de texto por sí solo.
- Compatibilidad restringida: solo funciona con motores de inferencia que implementen el protocolo DFlash 2 (actualmente llama.cpp con el PR #27342). Otros frameworks como vLLM u Ollama no lo soportan de forma nativa.
- Dependencia del modelo base: el drafter está entrenado específicamente para Muse-Glimmer-30B; no es transferible a otros modelos sin reentrenamiento.
- Riesgo de alucinación y sesgos: al ser un componente de aceleración, no introduce sesgos adicionales, pero hereda los del modelo base. No se han evaluado sesgos específicos del drafter.
- Limitaciones de contexto: aunque el contexto declarado es de 128K, el rendimiento del drafter en secuencias muy largas no se ha documentado explícitamente.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Muse-Glimmer-30B también está bajo Apache 2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/incoai/Muse-Glimmer-30B-DFlash2-GGUF
- Modelo base (Muse-Glimmer-30B): https://huggingface.co/meta-models/Muse-Glimmer-30B
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio GitHub de DFlash: https://github.com/z-lab/dflash
- Paper original DFlash (ICML 2026): referencia en la model card (Chen, Liang, Liu)
- PR de llama.cpp con soporte DFlash 2: https://github.com/ggml-org/llama.cpp/pull/27342
- Espejo del checkpoint: https://huggingface.co/z-lab/Muse-Glimmer-30B-DFlash2-GGUF
- Blog de Meta sobre Muse Glimmer: https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model
