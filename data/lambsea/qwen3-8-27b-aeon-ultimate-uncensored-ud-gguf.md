# lambsea/Qwen3.8-27B-AEON-Ultimate-Uncensored-UD-GGUF

## Resumen

Qwen3.8-27B-AEON-Ultimate-Uncensored-UD-GGUF es una colección de cuantizaciones GGUF del modelo base AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16, una variante "sin censura" del modelo Qwen3.8-27B de Alibaba. El autor, lambsea, ha aplicado un esquema de cuantización híbrido denominado "Unsloth Dynamic" (UD) con overrides por tensor basados en análisis de sensibilidad KL y una matriz de importancia multi-dominio, preservando los tensores de recurrencia SSM en precisión F16/F32 para evitar la acumulación de error en capas recurrentes.

El modelo base Qwen3.8-27B es un modelo de 27 mil millones de parámetros con una arquitectura híbrida que combina atención clásica con capas recurrentes GatedDeltaNet (SSM), una ventana de contexto nativa de 262 144 tokens y capacidades multimodales (visión). Esta versión GGUF añade soporte para decodificación especulativa MTP (multi-token prediction) y un encoder de visión separado, lo que la hace adecuada para despliegue local en hardware variado.

La relevancia de esta ficha radica en que ofrece una alternativa cuantizada de alta calidad para ejecutar un modelo de 27B con contexto ultralargo y visión en GPUs de consumo, con un control fino sobre la degradación de precisión en las partes más sensibles del modelo. Está pensada para desarrolladores que necesitan desplegar el modelo en producción con llama.cpp o LM Studio sin sacrificar la fidelidad de la recurrencia SSM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: GatedDeltaNet (SSM recurrente) + atención, 64 capas (48 SSM + 16 atención) |
| Parametros totales | 27B (según modelo base; el repo muestra un valor de safetensors de 460 730 096, inconsistente con la denominación 27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos; ampliable a 524 288 con rope scaling YaRN |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, IQ4_XS (GGUF) + mmproj F16 para visión |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida que combina 48 capas recurrentes basadas en GatedDeltaNet (una variante de SSM con compuertas) con 16 capas de atención clásica. Esta mezcla permite manejar secuencias largas con menor coste computacional que un transformer puro, manteniendo la capacidad de atender a relaciones globales mediante las capas de atención. El modelo base fue entrenado por Alibaba con un contexto nativo de 262 144 tokens, y la versión AEON añade un ajuste "uncensored" que elimina restricciones de contenido.

La cuantización UD aplicada por lambsea introduce tres innovaciones principales: (1) preservación de todos los tensores de recurrencia SSM (`ssm_alpha`, `ssm_beta`, `ssm_out`, etc.) en precisión F16 o F32, evitando que el error de cuantización se acumule a lo largo de los pasos recurrentes; (2) un análisis de sensibilidad por tensor que asigna precisiones específicas a 685 grupos de tensores según su contribución a la divergencia KL, priorizando las proyecciones de atención y las entradas/salidas de la SSM; (3) una matriz de importancia generada en GPU con PyTorch sobre 13 datasets multi-dominio (general, código, razonamiento, agentico) a contexto 65 536, fusionada con el enfoque DI-MATRIX. Además, se conserva la cabeza MTP (draft head) en F16 para decodificación especulativa y el encoder de visión completo en el archivo mmproj.

## Capacidades

- Generación de texto y razonamiento multilingüe (inglés y chino) con modo "thinking" activable mediante `enable_thinking` en la plantilla de chat.
- Comprensión de imágenes y vídeo gracias al encoder de visión incluido en `Qwen3.8-27B-AEON-mmproj-F16.gguf`, que se carga con `--mmproj` en llama-server.
- Soporte de tool calling y function calling, validado con datasets como glaive-function-calling-v2 y xlam-function-calling-60k durante la calibración de la imatrix.
- Capacidades de agente multi-paso, reforzadas con datasets agenticos en la calibración (hermes-function-calling-v1).
- Decodificación especulativa MTP (multi-token prediction) que acelera la generación entre 1.5x y 2x usando `--spec-type draft-mtp --spec-draft-n-max 3`.
- Contexto ultralargo de hasta 524 288 tokens con rope scaling YaRN, útil para documentos extensos o historiales de conversación largos.
- Modelo "uncensored": no aplica filtros de contenido estándar, lo que permite generar respuestas sin restricciones temáticas (con los riesgos asociados).

## Casos de uso

- Atención al cliente automatizada con contexto largo: gracias a los 262K tokens nativos (ampliables a 524K), el modelo puede mantener conversaciones multi-turno con historial completo y documentos de referencia, gestionando incidencias complejas sin perder el hilo.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para generar tests, documentación o parches, con la ventaja de la decodificación MTP para reducir la latencia en entornos de alta demanda.
- Análisis de documentos extensos: la ventana de contexto de 262K permite procesar libros técnicos, contratos o informes financieros completos en una sola pasada, extrayendo resúmenes o respondiendo preguntas sobre el contenido íntegro.
- Agentes autónomos con visión: al combinar el encoder de visión con tool calling, el modelo puede interpretar capturas de pantalla o vídeos y ejecutar acciones (p. ej., automatización de navegador o control de aplicaciones), como sugiere el benchmark OSWorld 84.3 del modelo base.
- Asistente de programación local sin censura: desarrolladores que necesitan respuestas sin filtros para explorar temas sensibles de seguridad ofensiva o investigación pueden ejecutarlo en local con LM Studio u Ollama, manteniendo la privacidad.
- Razonamiento matemático y científico: con datasets de razonamiento como OpenMathInstruct-2 en la calibración, el modelo es adecuado para resolver problemas matemáticos avanzados o verificar demostraciones, incluso en cuantizaciones Q5_K_M o IQ4_XS para hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta versión cuantizada específica. La tabla siguiente muestra las métricas de calidad de cuantización proporcionadas por el autor, medidas en una NVIDIA RTX PRO 6000 Blackwell (96 GB VRAM) con llama.cpp fork, pp=512, tg=128:

| Cuantización | Tamaño | tg t/s | PPL | KL mean | KL max | KL p99.9 |
|---|---|---|---|---|---|---|
| F16 | 50.9 GB | 30.0 | 5.7102 | — | — | — |
| Q8_0 | 34.7 GB | 39.9 | 5.7181 | 0.0020 | 1.83 | 0.25 |
| Q6_K | 30.6 GB | 48.7 | 5.7288 | 0.0042 | 7.20 | 0.38 |
| Q5_K_M | 28.7 GB | 53.0 | 5.7243 | 0.0087 | 6.20 | 0.98 |
| IQ4_XS | 25.9 GB | 55.3 | 5.7288 | 0.0240 | 9.37 | 3.26 |

El modelo base Qwen3.8-27B original alcanza, según fuentes web, DeepSWE 42.2, Terminal Bench 73.0 y OSWorld 84.3, pero estos datos corresponden al modelo sin cuantizar y no a esta versión AEON.

## Requisitos de hardware

- VRAM estimada: entre 26 GB (IQ4_XS) y 51 GB (F16) para el modelo completo. Con offload parcial a CPU, el IQ4_XS puede ejecutarse en GPUs de 16 GB con degradación de velocidad.
- GPUs recomendadas: RTX PRO 6000 Blackwell (96 GB) para todas las cuantizaciones; A100 40/80 GB o H100 para Q8_0 y Q6_K; RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q5_K_M o IQ4_XS con offload; AMD Radeon RX 7900 XTX (24 GB) compatible vía LM Studio.
- No cabe en GPUs de 8-12 GB VRAM; se requiere al menos 16 GB para IQ4_XS con offload agresivo.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), LM Studio, Ollama (con etiqueta personalizada), y el fork de llama.cpp del autor para DFlash speculative decoding.
- Latencia: entre 30 y 55 tokens/s en RTX PRO 6000 Blackwell según cuantización; con MTP activado se estima 1.5-2x más rápido en generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Cuantizaciones |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | Híbrida SSM+atención | Apache 2.0 | GGUF, AWQ, etc. |
| Qwen3.8-27B-AEON (este) | 27B | 262K (524K con YaRN) | Híbrida SSM+atención, sin censura | Apache 2.0 | GGUF UD (Q8_0 a IQ4_XS) |
| Qwen3.6-27B-AEON (versión anterior) | 27B | 262K | Híbrida SSM+atención, sin censura | Apache 2.0 | GGUF UD |

La principal diferencia con el modelo original es la eliminación de restricciones de contenido y el esquema de cuantización UD con preservación de tensores SSM. Frente a la versión Qwen3.6, esta incorpora mejoras en la calibración multi-dominio y el soporte MTP/visión.

## Limitaciones y advertencias

- Al ser "uncensored", el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtros. No debe desplegarse en entornos donde se requiera moderación automática sin capas adicionales de control.
- Riesgo de alucinación elevado en tareas factuales, especialmente con contexto muy largo donde la atención dispersa puede degradar la precisión.
- Solo soporta inglés y chino; el rendimiento en otros idiomas es limitado o nulo.
- La discrepancia entre los parámetros declarados (27B) y el valor de safetensors del repo (460M) sugiere un posible error en el registro; se recomienda verificar la integridad del modelo base antes de usar en producción.
- La ampliación de contexto a 524K mediante YaRN puede degradar la calidad de las respuestas en los extremos de la ventana; se recomienda probar con casos reales.
- El uso de la cuantización IQ4_XS introduce una KL p99.9 de 3.26, lo que puede manifestarse en errores visibles en tareas de razonamiento largo.
- La licencia Apache 2.0 se aplica a esta cuantización, pero el modelo base AEON puede tener términos adicionales; verificar antes de uso comercial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lambsea/Qwen3.8-27B-AEON-Ultimate-Uncensored-UD-GGUF
- Modelo base: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Fork de llama.cpp con DFlash: https://github.com/a4501150/llama.cpp
- Script de generación de imatrix: https://github.com/a4501150/super-quant
- Repositorio de referencia para versiones uncensored: https://github.com/Wassimyounes01/qwen38-uncensored
- Guía de despliegue en AMD: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Análisis del modelo base: https://lovableapp.org/blog/qwen3-8-27b
- Ficha del modelo base en AI Release Tracker: https://aireleasetracker.com/model/qwen/qwen3.8-27b
