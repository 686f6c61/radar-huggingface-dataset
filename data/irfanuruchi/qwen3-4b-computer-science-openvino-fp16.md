# Irfanuruchi/Qwen3-4B-Computer-Science-OpenVINO-FP16

## Resumen

Qwen3-4B Computer Science OpenVINO FP16 es una exportación del punto de control ajustado `Irfanuruchi/Qwen3-4B-Computer-Science` al formato OpenVINO Intermediate Representation (IR) en precisión FP16, sin compresión de pesos INT8 ni INT4. Lo publica el usuario Irfanuruchi y parte del modelo base Qwen3-4B de Alibaba Qwen, con aproximadamente 4.000 millones de parámetros y una arquitectura transformer densa. No se trata de un nuevo entrenamiento, sino de una conversión de despliegue: el checkpoint original en BF16 se convierte a FP16 y se serializa como grafo OpenVINO para inferencia optimizada sobre hardware Intel.

El interés del artefacto es doble. Por un lado, ofrece una variante de precisión completa (FP16) del ajuste orientado a ciencias de la computación, útil como referencia frente a las versiones INT8 e INT4 del mismo autor a la hora de medir el compromiso entre calidad numérica y rendimiento. Por otro, demuestra un flujo de despliegue reproducible con Optimum Intel y OpenVINO 2026.4 sobre CPU Intel, con validación nativa en un equipo con Core Ultra 9 275HX.

Es relevante ahora porque buena parte del ecosistema de modelos pequeños se está orientando a inferencia local en CPU y aceleradores integrados (GPU y NPU Intel), y esta ficha documenta con cifras concretas el coste en throughput de mantener FP16 frente a INT8 en ese escenario. El repositorio ocupa 8,1 GB y el modelo pesa aproximadamente 7,6 GB en disco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-4B (transformer denso, familia Qwen3) |
| Parametros totales | Aproximadamente 4.000 millones |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP16 (esta exportacion); INT8 e INT4 disponibles en repositorios hermanos; BF16 en el checkpoint fuente |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (exportado con Optimum Intel); checkpoint fuente en BF16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3-4B, un transformer denso de aproximadamente 4.000 millones de parámetros. El autor no documenta en esta model card los detalles de entrenamiento del ajuste fino (número de tokens, composición del dataset, uso de RLHF o DPO); esa información remite al repositorio del checkpoint fuente `Irfanuruchi/Qwen3-4B-Computer-Science`, del que no se aportan datos en la información disponible. La model card sí indica que el ajuste está orientado a ciencias de la computación, generación de código e ingeniería de software, según las etiquetas del repositorio.

La innovación técnica de este artefacto no está en el entrenamiento sino en el pipeline de conversión: se usó `optimum-cli export openvino` con la tarea `text-generation-with-past` y `--weight-format fp16`, generando un grafo IR con caché de claves y valores para decodificación autorregresiva. No se aplicó compresión de pesos, de modo que la conversión preserva la precisión FP16 completa. El autor advierte que la conversión de BF16 a FP16 altera la representación numérica original y que una mayor precisión de pesos no garantiza mejores respuestas.

## Capacidades

- Generación de texto conversacional y de tipo instructivo mediante plantilla de chat con soporte de `enable_thinking` (modo de razonamiento activable o desactivable).
- Generación de código en Python y otros lenguajes, con validación funcional documentada en la creación de una función `is_prime(n)` con división por tentativa acotada por raíz cuadrada.
- Explicación de algoritmos y análisis de complejidad computacional.
- Asistencia en ingeniería de software: depuración, explicación de código y tareas de ciencias de la computación.
- Inferencia local en CPU Intel mediante OpenVINO, con backend `OVModelForCausalLM` de Optimum Intel.
- Compatibilidad declarada con dispositivos GPU y NPU Intel detectados por OpenVINO, aunque el autor indica que no ha validado la inferencia en esos dispositivos para esta exportación.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible; no se declaran.

## Casos de uso

- Asistencia educativa en ciencias de la computación: el modelo puede explicar estructuras de datos y algoritmos paso a paso, y se ha validado generando e interpretando una función de primalidad con complejidad O(sqrt(n)), lo que lo hace adecuado para entornos de aprendizaje.
- Generación de código en local sin GPU: gracias al formato OpenVINO IR y a la inferencia en CPU, puede desplegarse en portátiles y estaciones de trabajo Intel sin tarjeta gráfica dedicada, a unos 7,70 tok/s en el hardware de referencia.
- Depuración y explicación de fragmentos de código: el ajuste orientado a software permite pegar un bloque de código y solicitar diagnóstico de errores o explicación línea a línea, con la salvedad de que el código generado debe revisarse y probarse.
- Comparación de precisiones en investigación de despliegue: al existir versiones INT4, INT8 y FP16 del mismo checkpoint, sirve para medir el impacto de la cuantización en calidad y latencia manteniendo constante el resto del pipeline.
- Prototipado de asistentes de programación en pipelines CI/CD: puede integrarse como paso de generación de sugerencias o de documentación técnica en flujos automatizados, siempre con validación posterior del código producido.
- Evaluación de OpenVINO sobre hardware Intel reciente: el repositorio documenta un caso de referencia con Core Ultra 9 275HX, útil para reproducir mediciones de throughput y latencia en otras plataformas.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita la integración en productos comerciales sin obligaciones de copyleft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo proporciona una medición de rendimiento de inferencia en CPU con una única ejecución, sin control estadístico:

| Variante | Tamano del modelo | Tiempo (160 tokens) | Throughput |
|---|---:|---:|---:|
| OpenVINO INT8 | 3,8 GB | 10,17 s | 15,73 tok/s |
| OpenVINO FP16 | 7,6 GB | 20,79 s | 7,70 tok/s |

Condiciones de la medición: Intel Core Ultra 9 275HX, IULinux, alimentación por corriente alterna, perfil de rendimiento máximo, backend CPU de OpenVINO, `PERFORMANCE_HINT` en `LATENCY`, calentamiento de 16 tokens, generación medida de 160 tokens y decodificación greedy. Bajo estas condiciones, la variante INT8 alcanzó aproximadamente 2,04 veces el throughput de FP16. El autor advierte que son mediciones de una sola ejecución con sobrecarga extremo a extremo y que no constituyen benchmarks estadísticamente controlados.

## Requisitos de hardware

- VRAM/RAM estimada: el modelo FP16 pesa aproximadamente 7,6 GB en disco; la inferencia en memoria requiere un orden de magnitud similar, por lo que se recomienda al menos 8-10 GB de RAM libre en CPU o VRAM equivalente en GPU.
- GPU recomendadas: no se especifican en la información disponible. El autor solo valida CPU Intel (Core Ultra 9 275HX).
- GPU de consumo: no hay validación publicada para RTX 4090 u otras GPU de consumo; OpenVINO detectó GPU y NPU Intel en el sistema de prueba, pero la compatibilidad no está validada.
- Opciones de despliegue: OpenVINO Runtime con Optimum Intel (`OVModelForCausalLM`), backend CPU; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta exportación.
- Latencia y throughput: 7,70 tok/s en el hardware de referencia con decodificación greedy y 160 tokens generados; el tiempo total medido fue de 20,79 s para esa generación.
- Dependencias: `pip install openvino optimum-intel transformers`; probado con OpenVINO 2026.4 y Python 3.14.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-Computer-Science-OpenVINO-FP16 (este) | ~4 B | no disponible | OpenVINO IR FP16 | Apache 2.0 | 7,6 GB, 7,70 tok/s en CPU de referencia |
| Qwen3-4B-Computer-Science-OpenVINO-INT8 | ~4 B | no disponible | OpenVINO IR INT8 | Apache 2.0 | 3,8 GB, 15,73 tok/s en el mismo hardware |
| Qwen3-4B-Computer-Science-OpenVINO-INT4 | ~4 B | no disponible | OpenVINO IR INT4 | Apache 2.0 | Compresión INT4 para inferencia eficiente en CPU Intel |
| Qwen3-4B-Computer-Science (fuente) | ~4 B | no disponible | BF16 (safetensors presumiblemente) | Apache 2.0 | Checkpoint original del ajuste, sin conversión |

No se dispone de datos de benchmarks que permitan comparar la calidad de este modelo con alternativas de la misma categoría. La comparación disponible se limita a variantes de precisión del mismo checkpoint.

## Limitaciones y advertencias

- La conversión de BF16 a FP16 modifica la representación numérica original; puede introducir diferencias sutiles respecto al checkpoint fuente.
- Mayor precisión de pesos no implica necesariamente mejores respuestas; el autor lo señala explícitamente.
- Las salidas pueden contener errores o código inseguro; todo código generado debe revisarse y probarse de forma independiente.
- No se han completado evaluaciones exhaustivas de precisión ni pruebas de regresión.
- El rendimiento depende del hardware, la configuración de energía, la longitud del prompt y la configuración del runtime; los resultados del sistema de prueba pueden no generalizarse.
- La ejecución en GPU y NPU Intel no está validada para esta exportación.
- No se documentan sesgos conocidos, idiomas soportados ni longitud de contexto en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del checkpoint fuente y del modelo base Qwen3 en sus repositorios respectivos.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/Irfanuruchi/Qwen3-4B-Computer-Science-OpenVINO-FP16
- Checkpoint fuente ajustado: https://huggingface.co/Irfanuruchi/Qwen3-4B-Computer-Science
- Variante OpenVINO INT4: https://huggingface.co/Irfanuruchi/Qwen3-4B-Computer-Science-OpenVINO-INT4
- Variante OpenVINO INT8: https://huggingface.co/Irfanuruchi/Qwen3-4B-Computer-Science-OpenVINO-INT8
- Colección de modelos del autor: https://huggingface.co/Irfanuruchi/Qwen3-4B-Computer-Science-Models
- Organización Qwen en Hugging Face: https://huggingface.co/Qwen
- OpenVINO (repositorio): https://github.com/openvinotoolkit/openvino
- Optimum Intel (repositorio): https://github.com/huggingface/optimum-intel
