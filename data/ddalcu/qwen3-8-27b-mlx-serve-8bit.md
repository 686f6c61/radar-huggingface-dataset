# ddalcu/Qwen3.8-27B-MLX-Serve-8bit

## Resumen

Qwen3.8-27B-MLX-Serve-8bit es una conversión a 8 bits en formato MLX del modelo Qwen/Qwen3.8-27B, publicada por el desarrollador ddalcu. No se trata de un modelo entrenado desde cero, sino de una cuantización afinada de 8 bits (group size 64) pensada para ejecutarse de forma nativa en Apple Silicon a través de mlx-serve, un servidor escrito en Zig que expone APIs HTTP compatibles con OpenAI y Anthropic. El checkpoint conserva el cabezal MTP (multi-token prediction) nativo del modelo base, lo que permite decodificación especulativa sin configuración adicional.

El modelo es multimodal: procesa texto e imágenes (pipeline image-text-to-text), soporta tool calling con el formato XML propio de Qwen3.8 y dispone de modo de razonamiento (thinking) con niveles de esfuerzo configurables. Con 27.781.427.952 parámetros y una ventana de contexto nativa de 262.144 tokens, se posiciona en la franja de modelos densos de gran tamaño orientados a cargas de trabajo agénticas y de código.

Su relevancia actual radica en dos factores: por un lado, ofrece una pérdida de precisión muy baja frente al modelo original (0,71 % de ruido de cuantización medido por capa, frente al 9,25 % de la variante de 4 bits), lo que lo hace adecuado cuando la fidelidad importa más que el espacio en disco; por otro, demuestra que la inferencia local de modelos de 27B con visión, herramientas y razonamiento es viable en hardware de consumo de gama alta con la pila MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención completa y GatedDeltaNet (atención lineal), más torre de visión y cabezal MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Affine 8-bit, group size 64, en todos los pesos de lectura por matmul; bf16 en embeddings, torre de visión, mtp.fc, normas, biases, convoluciones y estado SSM |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 31,2 GB en disco (repo de 35,1 GB) |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina capas de atención completa con capas de GatedDeltaNet, un mecanismo de atención lineal con estado recurrente que reduce el coste de contexto largo. El checkpoint incluye además una torre de visión con patch embed Conv3d y un cabezal de predicción multi-token (MTP) que actúa como modelo borrador para decodificación especulativa, verificado contra el tronco principal. La conversión mantiene los pesos, configuración, tokenizador y plantilla de chat del repositorio original sin modificaciones, salvo la cuantización.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la documentación proporcionada. La model card de esta conversión se centra exclusivamente en el proceso de cuantización y en tres correcciones técnicas necesarias para que el checkpoint funcione en MLX: las normas del decodificador, la norma final y q/k_norm están codificadas en delta (la capa de referencia calcula `1 + w`, y ese `+1` se ha incorporado en la conversión); la convolución depthwise conv1d requiere transposición de `[C, 1, K]` a `[C, K, 1]`; y el patch embed Conv3d pasa de channels-first a channels-last. Omitir cualquiera de estos ajustes produce salidas incorrectas, desde texto incoherente hasta descripciones erróneas de las imágenes.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto, desactivable por petición mediante `enable_thinking: false` y ajustable con `reasoning_effort` en los niveles `xhigh`, `medium` y `low` (por defecto `xhigh`).
- Comprensión de imágenes en las APIs de chat, aceptando contenido `image_url` de la forma habitual.
- Tool calling y function calling con el formato XML nativo de Qwen3.8 (`<tool_call><function=name><parameter=key>`), que mlx-serve parsea, repara y convierte a `tool_calls` estándar de OpenAI con coerción de esquema.
- Razonamiento multi-paso y flujos agénticos, con soporte de MCP en la aplicación MLX Core.
- Decodificación especulativa mediante el cabezal MTP incluido en el checkpoint, con ganancias de hasta 3,27x en generación de código.
- Exposición simultánea de APIs compatibles con OpenAI y Anthropic en el mismo puerto, lo que habilita clientes como Claude Code, el SDK de OpenAI, Continue, Cursor u Open WebUI.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Generación de código en producción: con 53,6 tok/s en decodificación con MTP activo sobre un M4 Max, el modelo es adecuado para asistencia de código interactiva en local; la ganancia de 3,27x en tareas de escritura de clases se debe a que la indentación, los cierres de bloque y los identificadores repetidos son predecibles y permiten borradores multi-token.
- Asistentes de código integrados en el IDE: al hablar el protocolo de Anthropic y el de OpenAI en `http://localhost:11234`, se conecta directamente a Cursor, Continue o Claude Code sin adaptadores intermedios.
- Análisis de documentos técnicos con imágenes: la torre de visión y el contexto de 262.144 tokens permiten procesar diagramas, capturas de pantalla o figuras junto con texto extenso en una sola conversación.
- Agentes autónomos con herramientas: el soporte de tool calling en formato XML, reparado y coercionado a esquemas estándar, habilita pipelines de varios pasos donde el modelo invoca funciones externas y encadena resultados.
- Procesamiento por lotes de contexto largo en local: resúmenes, extracción de entidades o auditoría de contratos y bases de código completas sin enviar datos a la nube, aprovechando la ventana nativa de 262.144 tokens dimensionada al hardware en el momento de la carga.
- Desarrollo y depuración sin conectividad: al ejecutarse como binario nativo sin Python ni Electron, encaja en entornos aislados o con requisitos de soberanía de datos donde no se permite tráfico saliente.
- Investigación sobre cuantización: la comparación documentada entre las variantes de 4 y 8 bits (0,71 % frente a 9,25 % de ruido por capa) sirve como referencia para estudiar el impacto de la precisión en tareas de código y prosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento medidos son de velocidad de decodificación en mlx-serve sobre un M4 Max de 128 GB con macOS 26.5, temperatura 0 y mediana de 3 ejecuciones:

| Carga de trabajo | MTP activado (por defecto) | MTP desactivado | Ganancia |
|---|---|---|---|
| Escribir una clase desde cero | 53,6 tok/s | 16,4 tok/s | 3,27x |
| Prosa explicativa | 26,4 tok/s | 16,4 tok/s | 1,61x |

| Variante | Tamano en disco | Ruido de pesos | Decodificacion (MTP on) |
|---|---|---|---|
| 4-bit | 18,2 GB | 9,25 % | 75,3 tok/s |
| 8-bit | 31,2 GB | 0,71 % | 53,6 tok/s |

El ruido se mide como error RMS sobre el RMS de la propia capa, mediana entre atención, MLP y lm_head en las capas 0, 20, 42 y 63.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el checkpoint ocupa 31,2 GB en disco; se necesita un Mac con memoria unificada suficiente para alojar los pesos más el contexto dimensionado por mlx-serve. La variante de 4 bits está pensada para equipos de 32 GB, lo que sitúa a la de 8 bits por encima de esa franja.
- GPU recomendadas: Apple Silicon de gama alta; las mediciones se han realizado en un M4 Max con 128 GB. No se dispone de datos para otras GPU, ya que MLX está orientado a Apple Silicon.
- ¿Cabe en GPU de consumo? Sí, en Macs de gama alta con memoria unificada amplia; no aplica a GPU discretas de consumo por la dependencia de MLX.
- Opciones de despliegue: mlx-serve como binario nativo (comando `mlx-serve --model ddalcu/Qwen3.8-27B-MLX-Serve-8bit --serve`) o la aplicación MLX Core con navegador de modelos y carga desde interfaz gráfica. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 53,6 tok/s en código y 26,4 tok/s en prosa con MTP activo; 16,4 tok/s en ambos casos con MTP desactivado, sobre M4 Max de 128 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y precision | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-MLX-Serve-8bit | 27,78B | 262.144 | MLX safetensors, 8-bit | Apache 2.0 | 31,2 GB, ruido 0,71 %, 53,6 tok/s en código |
| Qwen3.8-27B-MLX-Serve-4bit | 27,78B | 262.144 | MLX safetensors, 4-bit | Apache 2.0 | 18,2 GB, ruido 9,25 %, 75,3 tok/s en código, apto para Mac de 32 GB |
| Qwen/Qwen3.8-27B | 27,78B | 262.144 | safetensors bf16 | Apache 2.0 | Modelo base sin cuantizar; sin datos de rendimiento en la información disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento en tareas (MMLU, HumanEval, GSM8K) con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, tasas de alucinación ni evaluación de seguridad del modelo base.
- Los idiomas soportados no están especificados; no se puede garantizar un rendimiento uniforme fuera de los idiomas cubiertos por el modelo original.
- La cuantización introduce un ruido de pesos del 0,71 % por capa, inferior al de la variante de 4 bits pero no nulo; en tareas de alta precisión conviene validar contra el modelo bf16.
- El formato MLX limita el despliegue a Apple Silicon; no es portable a CUDA ni a otras pilas de inferencia sin reconversión.
- La conversión depende de tres correcciones específicas (normas delta-encoded, transposición de conv1d y layout channels-last del Conv3d). Cualquier reconversión propia debe replicarlas o el modelo producirá salidas incorrectas, incluida la descripción errónea de imágenes sin errores de forma visibles.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base deben verificarse en su repositorio original.
- El rendimiento medido corresponde a un único hardware (M4 Max, 128 GB); el throughput en equipos con menos memoria o generaciones anteriores será inferior y el contexto se recortará automáticamente al cargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ddalcu/Qwen3.8-27B-MLX-Serve-8bit
- Variante de 4 bits: https://huggingface.co/ddalcu/Qwen3.8-27B-MLX-Serve-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Sitio de mlx-serve: https://mlxserve.com
- Repositorio y releases de mlx-serve: https://github.com/ddalcu/mlx-serve
- Descarga de la aplicación MLX Core: https://github.com/ddalcu/mlx-serve/releases/latest
