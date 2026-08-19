# Atomic-Germ/Qwen3.8-Distilled-1.2B-NPU2

## Resumen

Qwen3.8-Distilled-1.2B-NPU2 es una conversión cuantizada del modelo de razonamiento LFM2.5-1.2B-Thinking de Liquid AI, adaptada para inferencia en NPU AMD XDNA mediante el runtime FastFlowLM. El modelo original, de 1.170 millones de parámetros, fue destilado a partir de Qwen3.8-Max (2,4 billones de parámetros) usando el dataset r0b0tlab/qwen3.8-max-distillation-50k, una técnica de destilación a nivel de secuencia que transfiere las cadenas de razonamiento del profesor al alumno. La versión NPU2 aquí presentada está cuantizada en formato Q4NX (con pesos mixtos Q8_0/Q4_1/BF16) y compilada específicamente para el runtime FLM, lo que permite ejecutar un modelo de razonamiento de 1.2B en dispositivos de borde con NPU AMD.

La relevancia actual de este modelo radica en su enfoque hacia el despliegue on-device: combina un tamaño reducido (1.17B parámetros) con una ventana de contexto de 32.768 tokens y un rendimiento de inferencia de hasta 41 tok/s de decodificación en una laptop con AMD Ryzen AI 340, usando menos de 1 GB de memoria. Esto lo posiciona como una alternativa viable para aplicaciones de razonamiento en tiempo real sin conexión, en entornos con restricciones de hardware. No es un archivo GGUF ni safetensors estándar; es un peso Q4NX específico para FastFlowLM.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 16 capas (10 bloques LIV de convolución doble + 6 bloques GQA) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q4NX (Q8_0 / Q4_1 / BF16) |
| Idiomas soportados | Inglés (según el repo); el modelo base soporta árabe, chino, francés, alemán, japonés, coreano y español |
| Licencia | Apache-2.0 |
| Formato de pesos | Q4NX (archivo `model.q4nx`) para runtime FastFlowLM |

## Arquitectura y entrenamiento
El modelo base LFM2.5-1.2B-Thinking emplea una arquitectura híbrida que combina 10 bloques de convolución LIV (Linear-Input-Volume) con doble puerta y 6 bloques de atención GQA (Grouped Query Attention). Esta mezcla busca capturar dependencias locales y globales con menor coste computacional que un transformer puro, lo que facilita su ejecución en hardware de borde. El entrenamiento del modelo original incluyó una fase de pre-entrenamiento extendida sobre 28 billones de tokens, seguida de un entrenamiento por refuerzo a gran escala. La versión destilada (Qwen3.8-Distilled) se obtuvo mediante destilación a nivel de secuencia, utilizando 50.000 ejemplos de razonamiento generados por Qwen3.8-Max, el modelo profesor de 2,4 billones de parámetros. La destilación transfiere las cadenas de pensamiento completas del profesor al alumno, lo que permite que el modelo pequeño reproduzca procesos de razonamiento complejos.

## Capacidades
- Generación de texto y conversación multi-turno con plantilla de chat incluida (`chat_template.jinja`).
- Razonamiento con cadena de pensamiento (chain-of-thought) gracias a la destilación de las trazas de razonamiento del modelo profesor.
- Capacidades multilingües del modelo base (inglés, árabe, chino, francés, alemán, japonés, coreano, español), aunque el repo etiqueta únicamente `en`.
- Inferencia optimizada para NPU AMD XDNA con el runtime FastFlowLM.
- Longitud de contexto amplia (32.768 tokens) para modelos de su tamaño, útil para tareas que requieren contexto extenso.
- No se documenta soporte de tool calling, visión ni audio en esta versión.

## Casos de uso
- **Asistentes de razonamiento en tiempo real en portátiles**: gracias a su velocidad de decodificación (~41 tok/s) y bajo consumo de memoria (<1 GB), puede ejecutarse en laptops AMD Ryzen AI para responder preguntas complejas de forma local, sin conexión.
- **Análisis de documentos largos**: su ventana de 32K tokens permite procesar informes, artículos o contratos completos para resumir o extraer conclusiones.
- **Herramientas de soporte técnico**: el modelo puede generar explicaciones paso a paso para problemas de programación o matemáticas, aprovechando su capacidad de razonamiento destilado.
- **Prototipado de aplicaciones de IA en el borde**: desarrolladores pueden integrar el modelo en dispositivos con NPU AMD XDNA para validar funcionalidades de IA antes de pasar a modelos más grandes.
- **Chatbots de propósito general**: su naturaleza conversacional lo hace adecuado para sistemas de chat locales que requieran respuestas coherentes sin conexión.
- **Investigación en destilación**: sirve como ejemplo práctico de cómo destilar modelos de gran tamaño (2.4T) en versiones de 1.2B, útil para experimentos de compresión de conocimiento.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card incluye mediciones de rendimiento de inferencia en una laptop AMD Ryzen AI 340 Framework 13 con el runtime FastFlowLM:

| Contexto | TTFT (s) (media ± desv.) | Prefill (tok/s) (media ± desv.) | Decodificación (tok/s) (media ± desv.) |
|---:|---:|---:|---:|
| 1k | 0.869 ± 0.017 | 1127.32 ± 22.53 | 40.37 ± 0.34 |
| 2k | 1.341 ± 0.007 | 1454.35 ± 7.12 | 41.56 ± 0.93 |
| 4k | 2.313 ± 0.042 | 1681.14 ± 30.38 | 39.85 ± 0.83 |
| 8k | 4.312 ± 0.082 | 1801.56 ± 34.15 | 37.38 ± 0.50 |
| 16k | 9.130 ± 0.014 | 1699.75 ± 2.46 | 34.06 ± 0.47 |
| 32k | 21.353 ± 0.002 | 1453.12 ± 0.39 | 27.07 ± 1.05 |

## Requisitos de hardware
- **NPU**: AMD XDNA (probado en AMD Ryzen AI 340).
- **Memoria**: el archivo de pesos `model.q4nx` ocupa 953.76 MB; se ejecuta con menos de 1 GB de memoria.
- **GPU**: no requiere GPU dedicada; está diseñado para NPU integrada en CPU AMD.
- **Runtime**: necesita el runtime FastFlowLM (`flm`) y el instalador `flm-add` para registrar el modelo.
- **Alternativas**: no es compatible con llama.cpp, vLLM o TGI porque el formato Q4NX es propietario de FastFlowLM.
- **Rendimiento**: prefill de 1127–1801 tok/s y decodificación de 27–41 tok/s según la longitud de contexto (medido en la laptop de prueba).

## Comparativa con modelos similares
No se dispone de datos de benchmarks comparativos entre este modelo y alternativas. A nivel de especificaciones, se puede comparar con el modelo original LFM2.5-1.2B-Thinking y con el modelo destilado no cuantizado:

| Modelo | Parámetros | Contexto | Formato | Licencia | Cuantización |
|---|---|---|---|---|---|
| Qwen3.8-Distilled-1.2B-NPU2 (este) | 1.17B | 32K | Q4NX | Apache-2.0 | Q4NX |
| LFM2.5-1.2B-Thinking (original) | 1.17B | 32K | Safetensors/GGUF | Apache-2.0 | Sin cuantizar |
| Qwen3-1.2B (referencia) | 1.2B | 32K | Safetensors | Apache-2.0 | No disponible |

La principal diferencia con el original es el formato de pesos y la cuantización, que permiten su ejecución en NPU AMD a costa de una posible degradación de calidad.

## Limitaciones y advertencias
- **Formato propietario**: el archivo Q4NX solo funciona con el runtime FastFlowLM; no es compatible con ecosistemas estándar como llama.cpp, Ollama o vLLM.
- **Idiomas**: aunque el modelo base soporta varios idiomas, el repo etiqueta únicamente `en`; el rendimiento en otros idiomas no está garantizado.
- **Sesgos**: al ser un modelo destilado de Qwen3.8-Max, hereda los sesgos del profesor, que no se documentan.
- **Riesgo de alucinación**: no se especifican medidas de mitigación; como todo modelo de razonamiento, puede generar respuestas plausibles pero incorrectas.
- **Licencia**: el repo indica Apache-2.0, pero la card del modelo fuente (LFM2.5) muestra `other`; se recomienda verificar la licencia del modelo base antes de uso comercial.
- **Rendimiento**: la cuantización Q4NX puede degradar la calidad de salida frente a la versión de punto flotante.
- **Hardware restringido**: solo funciona en NPU AMD XDNA; no es portable a otras arquitecturas sin recompilar.

## Enlaces
- [Repositorio HuggingFace](https://huggingface.co/Atomic-Germ/Qwen3.8-Distilled-1.2B-NPU2)
- [Modelo fuente LFM2.5-1.2B-Thinking](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking)
- [Repositorio FastFlowLM/LFM2.5-1.2B-Thinking-NPU2](https://huggingface.co/FastFlowLM/LFM2.5-1.2B-Thinking-NPU2)
- [GitHub de destilación de Qwen3.8](https://github.com/47thtechcorner/RayCodes_Qwen3.8Distilled)
- [Blog de Liquid AI sobre LFM2.5](https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai)
