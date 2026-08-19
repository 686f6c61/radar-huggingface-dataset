# EschaLabs/Qwen3.6-35B-A3B-Escha-W2

## Resumen

Escha-W2 es una cuantización de 2 bits del modelo Qwen3.6-35B-A3B, un Mixture-of-Experts (MoE) con 256 expertos desarrollado por Qwen. La ha creado Escha Labs Inc. con su propio esquema de cuantización llamado `eschamoe`, que combina pesos de 2 y 3 bits por proyección y capas densas en int8. El resultado es un paquete de 12,3 GB en disco que cabe en una GPU de consumo de 16 GB (mínimo) o 24 GB (recomendado), y que se sirve mediante una API compatible con OpenAI en el puerto 30000.

El modelo resuelve el problema de ejecutar un MoE de gran tamaño en hardware de consumo sin sacrificar demasiada calidad. Según los benchmarks publicados, mantiene un rendimiento notable en tareas de código, razonamiento y matemáticas, con un 92,07 % en HumanEval+ y un 93,8 % en MATH-500. Es relevante porque permite desplegar un modelo de razonamiento y generación de código de alto nivel en una sola GPU doméstica, algo que normalmente requeriría hardware de datacenter.

La cuantización se distribuye con dos motores de inferencia: SGLang (recomendado, con soporte de concurrencia, tool calling y salida estructurada) y ZML (un binario único sin dependencias de Python, más rápido en decodificación greedy en ciertas tarjetas). También hay soporte nativo para Apple Silicon mediante MLX.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con 256 expertos |
| Parametros totales | no disponible (el nombre del modelo sugiere 35B, pero no se confirma) |
| Parametros activos | no disponible (el nombre del modelo sugiere 3B, pero no se confirma) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit (esquema `eschamoe`, mixto 2/3-bit por proyección, capas densas int8) |
| Idiomas soportados | inglés (según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (también compatible con MLX) |

## Arquitectura y entrenamiento

Escha-W2 es una versión cuantizada de Qwen3.6-35B-A3B, un modelo MoE con 256 expertos. La cuantización utiliza el esquema `eschamoe`, que asigna 2 o 3 bits a cada proyección según su sensibilidad y mantiene las capas densas en int8. No se trata de un entrenamiento desde cero, sino de una compresión del modelo original; por tanto, no hay información sobre el dataset de entrenamiento ni sobre técnicas como RLHF o DPO en esta ficha.

El paquete incluye los pesos cuantizados, el tokenizador y la configuración, junto con dos motores de inferencia listos para usar. SGLang es el motor recomendado y el que se usó para medir todos los benchmarks; soporta concurrencia, tool calling, salida estructurada y un parser de razonamiento. ZML es un runtime de un solo binario, sin Python, que fusiona 16 pasos de decodificación por envío a GPU con argmax en dispositivo, lo que le da ventaja en respuestas largas con temperatura 0, pero pierde en respuestas cortas y con muestreo.

## Capacidades

- Generación de texto y conversación multirround.
- Razonamiento complejo con modo "thinking" (pensamiento encadenado) activable o desactivable.
- Generación de código en múltiples lenguajes, con resultados destacados en HumanEval+ (92,07 % pass@1) y LiveCodeBench (62,64 % pass@1).
- Razonamiento matemático avanzado: 93,8 % en MATH-500 con thinking activado.
- Conocimiento general y razonamiento de nivel universitario: 80,9 % en MMLU-Pro y 77,8 % en GPQA-Diamond.
- Razonamiento de sentido común: 76,06 % en Commonsense-6.
- Soporte de tool calling y salida estructurada a través del motor SGLang.
- Capacidad de ejecución en Apple Silicon mediante MLX, sin conversión de pesos.

## Casos de uso

- Asistente de programación local: un desarrollador puede ejecutar Escha-W2 en una GPU de 24 GB y usarlo para generación de código, refactorización y explicación de fragmentos, con la ventaja de que los datos no salen de la máquina.
- Servicio de atención al cliente automatizado: gracias al soporte de tool calling y a la API compatible con OpenAI, se puede integrar en un backend para gestionar conversaciones multi-turno, consultar bases de conocimiento y escalar a un agente humano cuando sea necesario.
- Entorno de desarrollo integrado (IDE) con autocompletado: el modelo puede conectarse a editores como VS Code o Neovim mediante la API local, ofreciendo sugerencias de código de alta calidad sin depender de servicios en la nube.
- Evaluación de código en pipelines de CI/CD: con LiveCodeBench y HumanEval+ como referencia, puede usarse para generar casos de prueba o validar soluciones en entornos de integración continua.
- Tutor de matemáticas y ciencias: su rendimiento en MATH-500 y GPQA-Diamond lo hace adecuado para explicar problemas de cálculo, álgebra o física, tanto en aplicaciones educativas como en plataformas de aprendizaje automático.
- Investigación en razonamiento de modelos: al ser una cuantización agresiva de 2 bits, es útil para estudiar el impacto de la compresión en tareas de razonamiento, comparando su salida con la del modelo original en 8 bits o FP8.
- Despliegue en portátiles Apple Silicon: mediante el runtime MLX, se puede servir el modelo en un Mac con chip M-series, lo que permite prototipado y desarrollo sin necesidad de GPU NVIDIA.

## Benchmarks y rendimiento

Los siguientes resultados provienen de la model card y fueron medidos con el motor SGLang:

| Tarea | Dataset | Métrica | Resultado |
|---|---|---|---|
| Generación de código | HumanEval+ | pass@1 (greedy, thinking-off) | 92,07 % |
| Razonamiento de código | CRUXEval-O | accuracy (n=800) | 61,75 % |
| Generación de código | LiveCodeBench v6 (subset N=182) | pass@1 | 62,64 % |
| Razonamiento de sentido común | Commonsense-6 (avg) | accuracy (thinking-off) | 76,06 % |
| Conocimiento y razonamiento | MMLU-Pro | accuracy (5-shot CoT, thinking-on) | 80,9 % |
| Razonamiento matemático | MATH-500 | accuracy (thinking-on, budget-capped) | 93,8 % |
| Ciencia de nivel universitario | GPQA-Diamond | accuracy (thinking-on) | 77,8 % |

No se han publicado comparaciones con otros modelos cuantizados en la información disponible.

## Requisitos de hardware

- VRAM mínima: 16 GB (por ejemplo, RTX 5060 Ti), con limitaciones de concurrencia o contexto.
- VRAM recomendada: 24 GB (por ejemplo, RTX 4090, RTX 5090, RTX 3090).
- GPUs compatibles: NVIDIA Ampere (sm_80) hasta Blackwell (sm_120).
- Tamaño en disco: 12,3 GB.
- Plataforma: Linux x86-64 con glibc ≥ 2.28 (Ubuntu 20.04+, RHEL/Rocky/Alma 8+). Solo se necesita el driver NVIDIA, no el CUDA toolkit.
- Python 3.12 para el motor SGLang; el motor ZML no requiere Python.
- Opciones de despliegue: SGLang (servidor OpenAI-compatible, concurrencia, tool calling), ZML (binario único, sin dependencias) y MLX para Apple Silicon.
- Rendimiento de decodificación (medido en 2026-07-27): en RTX 4090 con SGLang, 218 tok/s a temperatura 0 y 102 tok/s a temperatura 0,6. ZML es entre un 2 % y un 26 % más rápido que SGLang en respuestas largas (≥1k tokens) según la tarjeta, pero solo en modo greedy; con muestreo es ~2,15× más lento.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos cuantizados de características similares en la documentación proporcionada. La comparación natural sería con el modelo base Qwen3.6-35B-A3B sin cuantizar, pero no se han publicado métricas de ese modelo en esta ficha.

## Limitaciones y advertencias

- Al ser una cuantización de 2 bits, es esperable una degradación de calidad respecto al modelo original en FP8 o BF16, especialmente en tareas que requieren precisión numérica o matices lingüísticos.
- El motor ZML solo es ventajoso en decodificación greedy (temperatura 0) y en respuestas largas; con muestreo es significativamente más lento.
- En GPUs de 16 GB, el motor ZML falla con prompts largos (desde 2.048 tokens en RTX 5080 y desde ~700 en RTX 5060 Ti), devolviendo un error HTTP 500. Se recomienda usar SGLang en estas tarjetas.
- La primera ejecución de ZML compila grafos de computación, lo que puede tardar entre 75 y 145 segundos en una RTX 4090 y varios minutos en tarjetas de 16 GB.
- La licencia es Apache-2.0, pero el repositorio incluye licencias de terceros (THIRD_PARTY_LICENSES/) que deben revisarse antes de un uso comercial.
- El modelo está etiquetado principalmente en inglés; no se garantiza un rendimiento óptimo en otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EschaLabs/Qwen3.6-35B-A3B-Escha-W2
- Runtime (SGLang y ZML): https://huggingface.co/EschaLabs/escha-runtime-qwen3moe
- Runtime MLX para Apple Silicon: https://github.com/EschaLabs/escha-mlx
- Sitio web de Escha Labs: https://eschalabs.com/
