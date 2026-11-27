# lamonster87/sciencebot-4b-gguf

## Resumen

ScienceBot-4B es un ajuste fino del modelo Qwen3-4B de Alibaba, desarrollado por SideQuestAI (autor lamonster87) y orientado a la verificación de computación en física y astrofísica. El modelo parte de la base `unsloth/Qwen3-4B` y se distribuye en formato GGUF con cuantización Q4_K_M (2,50 GB), lo que lo hace desplegable en hardware de consumo. Su función principal es generar respuestas estructuradas en JSON que sitúan en primer lugar código Python ejecutable de verificación (`experiment_code`), seguido de campos descriptivos como `title`, `domain`, `insight`, `hypothesis`, `mini_experiment` y `open_question`.

El ajuste se realizó mediante SFT multi-rol con 4.758 ejemplos (de los cuales 2.061 son trayectorias de auto-reparación) y DPO on-policy con 678 pares. La relevancia del modelo radica en su enfoque hacia la verificabilidad: en lugar de generar solo texto explicativo, produce código ejecutable que permite comprobar numéricamente las afirmaciones científicas. La licencia es Apache 2.0, heredada del modelo base.

El modelo es de nicho, con cero descargas y cero likes en el momento de la ficha, y no dispone de documentación sobre idiomas soportados ni resultados de benchmarks publicados. Su contexto de ejecución documentado es de 4K tokens en Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-4B) |
| Parametros totales | 4B (heredados del modelo base Qwen3-4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4K tokens documentados en la ejecución con Ollama |
| Tipos de cuantizacion | GGUF Q4_K_M (único publicado) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`unsloth.Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3-4B, un transformer denso de 4.000 millones de parámetros del que no se detallan en la información proporcionada innovaciones arquitectónicas adicionales más allá de las del modelo base. El ajuste fino emplea SFT multi-rol con 4.758 ejemplos, incluyendo 2.061 trayectorias de auto-reparación (self-repair), seguidas de DPO on-policy con 678 pares de preferencias. Este esquema de dos fases busca alinear la salida hacia el formato JSON estructurado con código de verificación ejecutable en primer lugar.

La innovación destacable es el formato de salida: el modelo prioriza `experiment_code` (código Python ejecutable) sobre el resto de campos descriptivos, lo que permite un bucle de verificación automatizada. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni detalles sobre la tokenizadora.

## Capacidades

- Generación de texto estructurado en JSON con campos fijos (`experiment_code`, `title`, `domain`, `insight`, `hypothesis`, `mini_experiment`, `open_question`).
- Generación de código Python ejecutable para verificación de hipótesis físicas y astrofísicas.
- Razonamiento científico orientado a la comprobación numérica de afirmaciones.
- Auto-reparación de trayectorias (entrenado explícitamente con ejemplos de self-repair).
- Soporte de modo "think" desactivable vía API de Ollama (`"think": false`) para salida JSON rápida en el formato entrenado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque el bucle código-ejecución-verificación sugiere uso en pipelines.

## Casos de uso

- Verificación de cálculos físicos: el modelo genera código Python con `numpy`, `scipy` y `sympy` que puede ejecutarse para comprobar numéricamente una hipótesis, adecuado por su formato de salida con `experiment_code` en primer lugar.
- Docencia de astrofísica: producción de mini-experimentos ejecutables (`mini_experiment`) que los estudiantes pueden correr y modificar para explorar conceptos.
- Generación de hipótesis con pregunta abierta: el campo `open_question` permite usar el modelo como generador de preguntas de investigación a partir de un dominio dado.
- Despliegue en dispositivos de gama baja: con 2,50 GB de pesos y ~3,73 GB de VRAM en Ollama, cabe en portátiles con 6 GB de VRAM o en móviles con 8 GB de RAM mediante PocketPal AI.
- Automatización de ciclos de verificación científica: en modo Eco local se documentan ~15 ciclos/hora; en una RTX 4090, ~100+ ciclos/hora en paralelo, lo que permite procesar lotes de hipótesis.
- Integración en pipelines de validación: el JSON estructurado con código ejecutable facilita el parseo automático y la ejecución en contenedores con Python 3.10+ y las dependencias indicadas.
- Asistencia en investigación exploratoria: generación de insights y hipótesis dentro de un dominio físico concreto, con la ventaja de que la afirmación viene acompañada de código comprobable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en inferencia: ~3,73 GB en Ollama con contexto de 4K (cuantización Q4_K_M).
- Tamaño de archivo: 2,50 GB (`unsloth.Q4_K_M.gguf`).
- Hardware mínimo: GPU con 6 GB+ de VRAM (RTX 2060/3060/4060), Apple Silicon con 8 GB+ de RAM unificada, o móvil con 8 GB+ de RAM vía PocketPal AI.
- Fallback CPU/iGPU: 16 GB de RAM del sistema.
- GPU recomendada: 8–16 GB+ de VRAM (~15 ciclos/hora en modo Eco local); RTX 4090 (24 GB) para ~100+ ciclos/hora en paralelo.
- Despliegue: Ollama (documentado); llama.cpp es compatible por el formato GGUF, aunque no se documenta explícitamente.
- Dependencias de ejecución del código generado: Python 3.10+ con `numpy`, `scipy`, `sympy` y `requests`.
- Latencia y throughput: no se proporcionan cifras de latencia por token; solo los ciclos/hora indicados arriba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| ScienceBot-4B | 4B | 4K (Ollama) | GGUF Q4_K_M | Apache 2.0 | Verificación física/astrofísica con código ejecutable |
| Qwen3-4B (base) | 4B | No disponible en esta ficha | Safetensors, GGUF | Apache 2.0 | Propósito general |
| No disponible | — | — | — | — | — |

No se dispone de datos de benchmarks ni de otros ajustes finos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: cero descargas y cero likes en el momento de la ficha; sin validación comunitaria.
- Idiomas soportados no documentados; no se garantiza un rendimiento adecuado en castellano.
- Contexto documentado de solo 4K tokens en Ollama, insuficiente para documentos científicos largos.
- Riesgo de alucinación inherente a un modelo de 4B; el código generado debe ejecutarse y revisarse antes de confiar en él.
- Sesgos conocidos: no documentados en la información disponible.
- El código generado requiere un entorno con `numpy`, `scipy`, `sympy` y `requests`; no se garantiza su ejecución sin errores.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las obligaciones de atribución del modelo base Qwen3-4B.
- Solo se publica una cuantización (Q4_K_M); no hay versiones en safetensors ni otras precisiones.
- Fecha de creación futura (2026-11-27) en los metadatos, lo que puede indicar un artefacto de publicación.

## Enlaces

- Hugging Face: https://huggingface.co/lamonster87/sciencebot-4b-gguf
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B
- Web del proyecto: https://sidequestai.org
- Código fuente: https://github.com/lamontgreen87-maker/SideQuestAI
- Contacto: lamontgreen87@gmail.com
