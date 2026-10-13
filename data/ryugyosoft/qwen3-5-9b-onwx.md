# ryugyosoft/Qwen3.5-9B-onwx

## Resumen

Qwen3.5-9B-onwx es un paquete de pesos y programas precompilados que permite ejecutar el modelo multimodal Qwen3.5-9B de Alibaba íntegramente sobre la NPU AMD XDNA2 de los PC con Ryzen AI. Lo publica el autor ryugyosoft dentro del ecosistema de su aplicación onwx, una herramienta que ejecuta LLM usando exclusivamente la NPU (32 motores de IA) en lugar de GPU. El modelo base es Qwen/Qwen3.5-9B, un transformer híbrido de 9.000 millones de parámetros con capas de atención y Gated DeltaNet (atención lineal), y una torre de visión ViT de 27 capas que lo convierte en un modelo image-text-to-text.

La relevancia de esta ficha radica en que no es una cuantización convencional, sino una conversión específica para hardware: los pesos lineales se almacenan en int4 con escala y mínimo bf16 cada 128 elementos, se aplica una rotación de Hadamard con signos aleatorios antes de cuantizar para dispersar los valores atípicos, y todo el cómputo de un token (matrices, DeltaNet, atención y LM head) se reparte entre los motores de la NPU. El encoder de imagen se ejecuta en CPU con numpy. La ventana de contexto máxima declarada es de 262.144 tokens, la del modelo original.

El resultado es un modelo capaz de generar texto, razonar, leer imágenes y usar tool calling en un portátil Copilot+ sin GPU dedicada, con una velocidad de generación de aproximadamente 7 a 7,8 tokens por segundo en un Ryzen AI 9 HX 370. Su principal limitación es la dependencia total del hardware XDNA2 y de la aplicación onwx: los pesos no siguen formatos estándar como safetensors o GGUF y no se pueden cargar en vLLM, llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención y Gated DeltaNet (atención lineal), más torre de visión ViT de 27 capas |
| Parametros totales | 9.000 millones (derivado de Qwen/Qwen3.5-9B, no confirmado en la model card) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (límite del modelo según la model card) |
| Tipos de cuantizacion | int4 con escala y mínimo bf16 cada 128 elementos en las capas lineales; activaciones int8 en el prefill; embeddings y visión en bf16 |
| Idiomas soportados | japones (ja) e ingles (en) según los metadatos |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen3.5-9B) |
| Formato de pesos | Propietario para NPU: `blobs/L*.wgt` (int4), `blobs/head.wgt` (int4), `embed.bf16`, `vision.npz` (bf16), `plans/` con xclbin e instrucciones; no usa safetensors ni GGUF |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 7,3 GB (descarga indicada de 7,4 GB) |
| Requisito de hardware | NPU AMD XDNA2 (Ryzen AI 300 / Ryzen AI Max) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B combina capas de atención clásica con capas Gated DeltaNet, un mecanismo de atención lineal con estado recurrente y compuertas, según refleja la etiqueta `gated-deltanet` del repositorio. La conversión de onwx respeta esa topología y la distribuye en la NPU: 16 de los 32 motores de IA calculan productos matriz-vector leyendo los pesos int4, 8 motores se encargan de las capas DeltaNet y 4 de la atención. Para la fase de prefill, el cómputo se realiza con unidades matriciales en int8 procesando bloques de 32 tokens; DeltaNet lee la caché en bloques de 8 tokens y la atención en bloques de 2. La model card indica que la diferencia entre el prefill y la generación, medida como correlación de la distribución de probabilidad de salida, es de aproximadamente 0,9998.

La innovación técnica destacable es el tratamiento de la cuantización. Antes de convertir los pesos lineales a int4, los pesos se multiplican por una matriz de Hadamard y una rotación de signos aleatoria (W·D·H/32), y la entrada se rota de la misma forma en la NPU. Esto reparte los valores atípicos y reduce el error de cuantización tanto de los pesos int4 como de las activaciones int8 del prefill. Según la model card, la divergencia KL respecto a la salida en bf16 pasa de 0,04–0,09 sin rotación a 0,04–0,08 con rotación. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO del modelo base; esa información correspondería a la ficha de Qwen y no está disponible en los materiales consultados.

El encoder de imagen es la torre ViT de 27 capas de Qwen3.5, ejecutada en CPU mediante numpy. Cada bloque de 2×2 píxeles se convierte en un token para el modelo de lenguaje, con posiciones calculadas mediante MRoPE. La imagen se reescala preservando la relación de aspecto hasta un máximo equivalente a 512×512 píxeles (256 tokens).

## Capacidades

- Generación de texto conversacional en japonés e inglés, con plantilla de chat incluida (`tokenizer.json` y chat template).
- Razonamiento en modo pensamiento (thinking mode), confirmado explícitamente en la model card.
- Llamada a herramientas y funciones (tool calling), también confirmada.
- Procesamiento de imágenes: entrada image-text-to-text, lectura de imágenes de hasta el equivalente a 512×512 píxeles.
- Razonamiento en varios pasos y uso como agente, gracias al soporte de tool calling.
- Cuantización int4 optimizada para NPU con rotación Hadamard, que preserva la distribución de salida con una KL de 0,04–0,08 frente a bf16.
- Inferencia con contexto largo de hasta 262.144 tokens, aunque el rendimiento decae con la longitud (véase la sección de hardware).
- Servidor con API compatible con OpenAI en `http://127.0.0.1:8100/v1`, con soporte de imágenes mediante `image_url` en formato data URL.
- No admite vídeo, según la propia model card.

## Casos de uso

- Asistente conversacional local en portátiles Copilot+: el modelo se ejecuta en la NPU mientras la GPU queda libre para otras tareas, lo que lo hace adecuado para un asistente siempre activo en un Ryzen AI 9 HX 370 con un consumo bajo y 4,5 GB de memoria.
- Análisis de imágenes y capturas en local: al aceptar entradas image-text-to-text, se puede usar para extraer información de diagramas, capturas de pantalla o fotos sin enviar datos a la nube, con un coste de codificación de imagen de aproximadamente 7 segundos por imagen en CPU.
- Asistente de programación sin conexión: el soporte de tool calling y el modo pensamiento permiten integrarlo en flujos de generación y revisión de código ejecutados íntegramente en el equipo, útil en entornos con requisitos de confidencialidad.
- Automatización de agentes con múltiples pasos y llamadas a funciones: el modelo puede encadenar herramientas a través de la API compatible con OpenAI, de modo que aplicaciones existentes que apunten a esa interfaz funcionan sin cambios.
- Atención al cliente en japonés e inglés: los dos idiomas declarados y la ventana de 262.144 tokens permiten mantener conversaciones largas y con historial extenso en esos mercados.
- Procesamiento de documentos con contexto largo: la ventana de 262.144 tokens admite introducir documentos completos de forma directa, aunque el rendimiento de generación baja de 7,8 a 6,4 tok/s tras 4.400 tokens de contexto.
- Despliegue en entornos aislados o sin GPU: al depender solo de la NPU XDNA2 y de la CPU, resulta viable en equipos sin tarjeta gráfica dedicada, siempre que cumplan los requisitos de Ryzen AI.
- Prototipado rápido con la API local: al exponer un endpoint compatible con OpenAI en el puerto 8100, permite probar aplicaciones de chat o visión sin proveedor externo ni coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar. Las únicas métricas publicadas son de rendimiento de inferencia en hardware concreto (véase la sección de requisitos de hardware) y de fidelidad de la cuantización (divergencia KL de 0,04–0,08 frente a bf16 y correlación de 0,9998 entre prefill y generación).

## Requisitos de hardware

- NPU AMD XDNA2 obligatoria: Ryzen AI 300 (Strix Point, por ejemplo Ryzen AI 9 HX 370) o Ryzen AI Max (Strix Halo). El modelo no funciona en GPU convencional ni en CPU para las capas del LLM.
- Sistema operativo: Windows 11 con driver NPU de AMD versión 32.0.203 o superior (verificado). En Ubuntu el soporte es experimental y requiere el driver amdxdna y XRT.
- Memoria del sistema: 16 GB de RAM como mínimo.
- Uso de memoria en ejecución: aproximadamente 4,5 GB de base más unos 30 MB por cada 1.000 tokens de contexto; si se usan imágenes, hay que sumar aproximadamente 1,7 GB adicionales.
- Rendimiento medido en un Ryzen AI 9 HX 370 (Windows, modo de energía estándar):
  - Lectura de prompt: 70–73 tokens/s; baja a unos 56 tokens/s con 4.400 tokens de contexto.
  - Generación: 7–7,8 tokens/s; baja a unos 6,4 tokens/s tras 4.400 tokens.
  - Codificación de una imagen: unos 7 segundos en CPU (máximo 512×512), más unos 3 segundos de carga la primera vez.
- No cabe ni está pensado para GPU de consumo como RTX 4090; no hay versión para CUDA.
- Opciones de despliegue: exclusivamente la aplicación onwx (interfaz gráfica y servidor local con API compatible con OpenAI en el puerto 8100). No hay soporte para vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario de pesos y programas.
- Advertencia de rendimiento: si las funciones de IA de Copilot+ en Windows están usando la NPU, la velocidad del modelo disminuye.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Hardware | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-9B-onwx | 9.000 M | 262.144 tokens | int4 para NPU (.wgt), bf16 embeddings y visión | NPU AMD XDNA2 + CPU para ViT | Apache-2.0 |
| Qwen/Qwen3.5-9B (base) | 9.000 M | 262.144 tokens | safetensors (bf16, presumiblemente) | GPU o CPU convencional | Apache-2.0 |
| Otras cuantizaciones o runtimes de Qwen3.5-9B | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparación directa con otras conversiones para NPU o con cuantizaciones GGUF del mismo modelo base no puede completarse porque no se dispone de sus datos en la informacion proporcionada. La única diferencia verificable frente al modelo base es el formato de pesos, la cuantización int4 y el backend de ejecución.

## Limitaciones y advertencias

- Dependencia de hardware absoluta: requiere una NPU AMD XDNA2. No se puede ejecutar en GPU NVIDIA, AMD o Intel, ni en CPU, ni en Mac.
- Formato propietario: los pesos y programas (`blobs/*.wgt`, `plans/`) solo son utilizables por la aplicación onwx. No hay conversión a safetensors, GGUF ni ningún formato estándar.
- Idiomas declarados limitados a japonés e inglés en los metadatos. El rendimiento en castellano no está documentado y no debería asumirse.
- Contexto grande con coste: aunque la ventana llega a 262.144 tokens, el rendimiento de generación cae de 7,8 a 6,4 tokens/s tras 4.400 tokens, y la memoria crece unos 30 MB por cada 1.000 tokens.
- Sin soporte de vídeo, pese a ser un modelo image-text-to-text.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual, por lo que no hay datos objetivos sobre la tasa de alucinación.
- Fidelidad de cuantización no nula: la divergencia KL respecto a bf16 se sitúa entre 0,04 y 0,08, lo que implica una degradación medible frente al modelo original.
- Sesgos: la model card no documenta ningún análisis de sesgos; al derivar de Qwen3.5-9B, se heredan los sesgos del modelo base, no evaluados aquí.
- Advertencias de producción: la aplicación necesita el driver NPU una versión concreta, el rendimiento se degrada si Copilot+ usa la NPU en paralelo, y el soporte en Ubuntu es experimental.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B, enlazadas en el propio repositorio.
- Repositorio sin descargas ni likes en la fecha de los metadatos (0 y 0), lo que indica nula validación por parte de la comunidad hasta el momento.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/ryugyosoft/Qwen3.5-9B-onwx
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Aplicacion onwx: https://huggingface.co/ryugyosoft/onwx
- Script de instalacion de onwx: https://huggingface.co/ryugyosoft/onwx/resolve/main/install.ps1
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su arquitectura o su entrenamiento; los enlaces anteriores son los unicos disponibles en la informacion proporcionada.
