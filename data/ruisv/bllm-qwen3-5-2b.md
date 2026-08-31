# ruisv/bllm-qwen3.5-2b

## Resumen

`ruisv/bllm-qwen3.5-2b` es un build compilado y cuantizado del modelo Qwen3.5-2B de Alibaba Cloud, preparado específicamente para ejecutarse de forma nativa en la unidad de procesamiento BPU (Nash) de las placas D-Robotics RDK S100 y S100P. No es un checkpoint cargable con `transformers`, sino un binario de inferencia que se ejecuta a través del runtime BLLM, que habla directamente con el BPU mediante `hbDNN`/`hbUCP`, sin GPU, CUDA ni conexión a la nube. El modelo combina una arquitectura híbrida de 18 capas Gated-DeltaNet (atención lineal tipo SSM) y 6 capas de atención completa, con cuantización int8 en pesos e int16 en activaciones, e incluye una torre de visión para entrada de imágenes.

La relevancia de este modelo radica en que demuestra la viabilidad de ejecutar un modelo multimodal de 2B parámetros íntegramente en un acelerador de edge de bajo consumo, con una utilización del BPU del 100% y sin coste de inferencia en CPU. Está pensado para desarrolladores que trabajan con robótica, visión por computador y despliegues on-device en hardware D-Robotics, y ofrece dos variantes de contexto (4096 y 512 tokens) para optimizar velocidad o capacidad según el caso de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 18 capas Gated-DeltaNet (SSM de atención lineal) + 6 capas de atención completa; torre de visión incluida |
| Parametros totales | 2B (modelo base Qwen3.5-2B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 4096 tokens (variante `ctx4k`) o 512 tokens (variante `ctx512`) |
| Tipos de cuantizacion | int8 pesos (por canal) / int16 activaciones (estática, sin datos) |
| Idiomas soportados | inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | `.hbm` (gráficos compilados para BPU), `.bin` (embeddings), `tokenizer.json`, `model.json` |

## Arquitectura y entrenamiento

El modelo es un build compilado del checkpoint Qwen3.5-2B, no un modelo entrenado desde cero. La arquitectura subyacente es híbrida: combina 18 capas de Gated-DeltaNet, un mecanismo de atención lineal tipo SSM con `head_dim=256`, con 6 capas de atención completa tradicional. Esta combinación permite reducir el coste de memoria y cómputo del KV-cache en contextos largos, manteniendo la capacidad de razonamiento de la atención plena en las capas finales. El build incluye una torre de visión que procesa imágenes a 320 píxeles y genera 100 tokens por imagen.

El proceso de compilación y cuantización (int8 en pesos, int16 en activaciones, estática y sin datos de calibración) fue realizado por el autor con el runtime BLLM, que compila el grafo directamente para el BPU, algo que la toolchain oficial de D-Robotics (`libxlm`) no soporta para esta arquitectura. No se dispone de información sobre el entrenamiento del modelo base (datos, tokens, RLHF, etc.), ya que corresponde al modelo Qwen3.5-2B original.

## Capacidades

- Generación de texto y chat multimodal: acepta entradas de imagen y texto, y produce respuestas de texto.
- Razonamiento e instrucciones: hereda las capacidades de Qwen3.5-2B, que incluye mejora en razonamiento y seguimiento de instrucciones frente a Qwen3.
- Comprensión de imágenes: la torre de visión integrada permite responder preguntas sobre fotografías (verificado con una imagen de prueba de gatos).
- Ejecución 100% en BPU: el decodificador de texto no consume tiempo de CPU (`CPU_inference_time_cost == 0`).
- Dos modos de contexto: `ctx4k` para conversaciones largas y `ctx512` para mayor velocidad de decodificación.
- Carga selectiva de la torre de visión: se puede desactivar la visión para ahorrar memoria en tareas solo de texto.

## Casos de uso

- Robótica de servicio en edge: el modelo puede ejecutarse en un RDK S100P integrado en un robot para interpretar comandos de voz y visuales en tiempo real, gracias a su baja latencia de decodificación (13-15 tokens/s) y su funcionamiento sin GPU.
- Asistente de visión por computador en dispositivos embebidos: permite describir o responder preguntas sobre imágenes capturadas por una cámara conectada a la placa, sin enviar datos a la nube, lo que garantiza privacidad y baja latencia.
- Automatización industrial con control local: en entornos donde la conectividad es limitada o insegura, el modelo puede procesar instrucciones en chino o inglés y generar respuestas para guiar a operarios o sistemas de control.
- Prototipado de aplicaciones de IA en hardware D-Robotics: los desarrolladores pueden usar este build como referencia para compilar y desplegar otros modelos en el BPU, aprovechando el runtime BLLM y el flujo documentado en `bllm-model-zoo`.
- Evaluación de rendimiento de modelos híbridos SSM en edge: sirve como banco de pruebas para medir la viabilidad de arquitecturas de atención lineal en aceleradores de bajo consumo, comparando velocidad, perplejidad y paridad de prefill/decode.
- Chatbot local en chino o inglés para kioscos o dispositivos de atención al cliente: con la variante `ctx512` se obtiene una respuesta más rápida para diálogos cortos, adecuada para interacciones transaccionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona mediciones de rendimiento en hardware real, que se resumen a continuación.

### Medidas en RDK S100P (modo rendimiento, 3 ejecuciones repetidas)

| Variante | Decodificacion (tok/s) | TTFT con imagen (s) | Perplejidad |
|---|---|---|---|
| ctx4096 | 13,20 | 1,65 | 51,23 |
| ctx512 | 15,29 | 1,51 | 50,87 |

### Paridad entre builds `nash-e` (S100) y `nash-m` (S100P)

| Build | Decodificacion (tok/s) | TTFT con imagen (s) | Perplejidad | Paridad de respuestas |
|---|---|---|---|---|
| s100/ctx4k (nash-e) | 13,22 | 1,866 | 51,2327 | token por token identica |
| s100p/ctx4k (nash-m) | 13,21 | 1,864 | 51,2327 | token por token identica |
| s100/ctx512 (nash-e) | 15,30 | 1,696 | 50,8687 | token por token identica |
| s100p/ctx512 (nash-m) | 15,29 | 1,708 | 50,8687 | token por token identica |

Las respuestas generadas fueron identicas token a token entre ambos builds y las perplejidades coinciden hasta el cuarto decimal, lo que confirma que la generacion de codigo BPU no altera el comportamiento del modelo.

## Requisitos de hardware

- Placa objetivo: D-Robotics RDK S100 (SoC J6E, 80 TOPS, 1 núcleo BPU, 12 GB RAM) o RDK S100P (SoC J6M, 128 TOPS, 1 núcleo BPU, 24 GB RAM).
- Memoria: el paquete `s100/` ocupa aproximadamente 5,3 GB de `.hbm`; en un S100 con 12 GB de RAM debe caber junto al carveout ION normal, aunque no se ha verificado en esa placa. En S100P (24 GB) no hay problema.
- Software: sistema operativo con `sw >= 4.0.5` y carveout ION ampliado (`hb_switch_ion.sh balanced` + reinicio).
- Runtime: BLLM (instalable vía conda desde `https://mirrors.ruis.ai/conda`).
- No requiere GPU, CUDA ni conexión a la nube.
- Latencia: decodificación de 13-15 tokens/s y TTFT con imagen de 1,5-1,9 s según variante y placa.
- Opciones de despliegue: exclusivamente a través de BLLM; no es compatible con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware objetivo | Formato | Licencia |
|---|---|---|---|---|---|
| ruisv/bllm-qwen3.5-2b (este) | 2B | 4096 / 512 | RDK S100/S100P (BPU) | HBM compilado | Apache-2.0 |
| ruisv/bllm-qwen3.5-0.8b | 0,8B | no disponible | RDK S100 (BPU) | HBM compilado | Apache-2.0 |
| Qwen3.5-2B (original) | 2B | no disponible | GPU / CPU | Safetensors | Apache-2.0 |

El build de 0,8B del mismo autor es la alternativa recomendada para RDK S100 si se quiere minimizar el riesgo de memoria (ocupa ~2,2 GB frente a ~5,3 GB). El modelo original Qwen3.5-2B se puede ejecutar en hardware convencional, pero no está optimizado para BPU.

## Limitaciones y advertencias

- No verificado en RDK S100 real: las mediciones del build `nash-e` se realizaron ejecutándolo en un S100P, no en un S100. El rendimiento en S100 (80 TOPS, CPU a 1,5 GHz) será previsiblemente inferior, pero no se ha cuantificado.
- Riesgo de memoria en S100: el paquete de 5,3 GB puede no caber junto al carveout ION en los 12 GB de RAM del S100; no se ha probado.
- Solo inglés y chino: no hay soporte para otros idiomas.
- Sin benchmarks académicos: no se han publicado resultados de MMLU, HumanEval, GSM8K, etc., por lo que no es posible comparar su calidad con otros modelos en tareas estándar.
- Formato propietario: al ser un binario compilado para BPU, no se puede cargar con `transformers` ni usar en otros entornos; está ligado al runtime BLLM y al hardware D-Robotics.
- Perplejidad alta (51,23): el valor de perplejidad medido es elevado, lo que sugiere que la cuantización int8/int16 puede degradar la calidad del modelo en comparación con el checkpoint original, aunque no hay datos de referencia del modelo sin cuantizar.
- Sin soporte de tool calling ni funciones: no se menciona ninguna capacidad de llamada a herramientas o agentes.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base Qwen3.5-2B también es Apache-2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ruisv/bllm-qwen3.5-2b
- Runtime BLLM: https://github.com/ruisv/bllm
- Model zoo y documentación del build: https://github.com/ruisv/bllm-model-zoo
- README específico del modelo en el zoo: https://github.com/ruisv/bllm-model-zoo/blob/main/models/qwen3.5-2b/README.md
- Build de 0,8B (alternativa para S100): https://huggingface.co/ruisv/bllm-qwen3.5-0.8b
- Modelo base Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
