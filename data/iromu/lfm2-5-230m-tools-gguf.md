# iromu/LFM2.5-230M-tools-GGUF

## Resumen

LFM2.5-230M-tools-GGUF es la conversión a formato GGUF del ajuste fino `iromu/LFM2.5-230M-tools`, un modelo de 229.693.184 parámetros (≈230 M) especializado en *tool calling* y *function calling* para flujos agénticos. Lo publica el usuario `iromu` en HuggingFace, no Liquid AI: se trata de un fine-tune con LoRA sobre `LiquidAI/LFM2.5-230M-Base`, la base de la familia LFM2 de Liquid AI. La licencia es Apache-2.0 y el único idioma declarado es el inglés.

El problema que aborda es concreto: disponer de un emisor de llamadas a herramientas estructuradas en un espacio de 230 M de parámetros, pensado para despliegue en dispositivo (*on-device*) y *edge* con runtimes tipo llama.cpp. El repositorio empaqueta cuatro precisiones (BF16, Q4_K_M, Q5_K_M y Q8_0) que van de 441 MB a 147 MB, de modo que el modelo cabe en memoria de un móvil, una Raspberry Pi o un contenedor sin GPU.

La relevancia ahora es doble. Por un lado, el modelo emplea un formato de llamada propio, con marcadores `<|tool_call_start|>` y `<|tool_call_end|>` y argumentos en sintaxis tipo Python, que no coincide con el sobre `tool_calls` de OpenAI; cualquier runtime que espere ese esquema no encontrará llamadas. Por otro, las cifras de validación publicadas por el autor son deliberadamente bajas y honestas: sobre 272 filas evaluables, el fine-tune emite una llamada parseable en el 15,8 % de los casos, acierta nombres en el 6,2 % y argumentos exactos en el 1,5 %. Es un modelo para experimentación y pipelines acotados, no un componente listo para producción sin evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (familia LFM2 de Liquid AI; la model card no detalla bloques, atencion ni configuracion interna) |
| Parametros totales | 229.693.184 (≈230 M) |
| Parametros activos | no aplica / no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16, Q4_K_M, Q5_K_M, Q8_0 (no se publican variantes UD-*/imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tambien existen los pesos BF16 originales en `iromu/LFM2.5-230M-tools`) |

Detalle de los ficheros publicados:

| Precision | Fichero | Tamano | Notas |
|---|---|---|---|
| BF16 | `LFM2.5-230M-tools-BF16.gguf` | 441 MB | precision original |
| Q4_K_M | `LFM2.5-230M-tools-Q4_K_M.gguf` | 147 MB | el mas pequeno |
| Q5_K_M | `LFM2.5-230M-tools-Q5_K_M.gguf` | 164 MB | compacto |
| Q8_0 | `LFM2.5-230M-tools-Q8_0.gguf` | 236 MB | maxima fidelidad de la familia |

Tamano total del repositorio: 1,0 GB.

## Arquitectura y entrenamiento

El modelo base es `LiquidAI/LFM2.5-230M-Base`, de la familia LFM2 de Liquid AI. La información disponible no describe la arquitectura interna (número de capas, tipo de atención, uso de bloques convolucionales o híbridos, vocabulario), por lo que no se puede confirmar la configuración más allá de la designación de familia y del recuento de parámetros. El ajuste es un *supervised fine-tuning* con LoRA orientado a que el modelo emita llamadas a herramientas en flujos agénticos; la model card no indica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

El dataset declarado es `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation`, una destilación, y el formato de llamada resultante es específico del autor: una lista entre corchetes delimitada por `<|tool_call_start|>` y `<|tool_call_end|>`, con valores de argumentos en forma similar a Python, por ejemplo `<|tool_call_start|>[search_files(path="src/", query="load"), read_file(path="src/app.py")]<|tool_call_end|>`. La innovación técnica destacable no está en la arquitectura sino en el empaquetado: conversión a GGUF en cuatro precisiones con tamaños declarados y una tabla de validación que separa explícitamente lo medido de lo no medido, advirtiendo que las filas cuantizadas están vacías porque nadie las ha evaluado.

## Capacidades

- Generación de llamadas a herramientas estructuradas en un formato propio con marcadores `<|tool_call_start|>` / `<|tool_call_end|>`.
- Emisión de múltiples llamadas en una sola respuesta, como lista entre corchetes (varias herramientas por turno).
- Argumentos con valores en sintaxis tipo Python (`path="src/app.py"`, `query="load"`).
- Orientación a flujos agénticos y *function calling* de un solo paso y multi-paso.
- Conversación multi-turno declarada mediante el flag `conversational` y la etiqueta `endpoints_compatible`.
- Ejecución en CPU y en dispositivos de borde gracias a los tamaños de 147-441 MB.
- No se declaran capacidades de visión, audio, *thinking mode*, matemáticas avanzadas ni razonamiento general; el único idioma soportado es el inglés.
- No hay soporte nativo del esquema `tool_calls` de OpenAI: el runtime debe implementar el parser del formato descrito.

## Casos de uso

- **Enrutado de herramientas en asistentes locales**: un asistente de escritorio puede cargar el GGUF Q4_K_M (147 MB) y usarlo exclusivamente para decidir qué función invocar (`read_file`, `search_files`, etc.), delegando la respuesta final en un modelo mayor. Es adecuado por su huella mínima y su formato de llamada explícito.
- **Automatización de operaciones sobre el sistema de ficheros**: el formato de ejemplo del autor (`search_files`, `read_file`) encaja en agentes de refactorización o auditoría de repositorios que necesitan emitir una o dos llamadas por turno con rutas y consultas como argumentos.
- **Despliegue en dispositivo de borde sin GPU**: con 147-164 MB en Q4_K_M/Q5_K_M, el modelo cabe en Raspberry Pi, routers o móviles y puede ejecutarse con llama.cpp en CPU; útil para asistentes offline con conectividad intermitente.
- **Prototipado rápido de gramáticas de tool calling**: sirve como banco de pruebas para validar parsers propios del formato `<|tool_call_start|>` antes de invertir en modelos mayores, dado que el coste de inferencia es despreciable.
- **Componente de *guardrail* o clasificador de intención con salida estructurada**: se puede forzar una llamada a una herramienta concreta para clasificar la petición del usuario en un pipeline, siempre que se acepte su baja tasa de acierto y se añada validación posterior.
- **Generación de *fixtures* y datos sintéticos de llamadas**: al ser un emisor de sintaxis concreta, puede utilizarse para producir ejemplos de formato de llamadas que luego se filtren y validen con un parser determinista.
- **Investigación sobre destilación y fine-tuning LoRA en modelos sub-500M**: el par base/fine-tune con métricas publicadas permite reproducir el protocolo de evaluación de tool calling a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BFCL) en la información disponible. Lo único medido es la tabla de validación de tool calling del autor, generada con `transformers` sobre un *split* de 274 filas (272 evaluables, todas ellas esperando una llamada) y un límite de generación de 384 tokens:

| Modelo | Cuantizacion | Limite | n | Llamada emitida | Nombres correctos | Argumentos exactos | Delta vs base |
|---|---|---|---|---|---|---|---|
| LiquidAI/LFM2.5-230M-Base | BF16 | 384 tok | 272 | 0/272 (0,0 %) | 0/272 (0,0 %) | 0/272 (0,0 %) | (sin predecesor) |
| LFM2.5-230M-tools | BF16 | 384 tok | 272 | 43/272 (15,8 %) | 17/272 (6,2 %) | 4/272 (1,5 %) | +1,5 pp |
| LFM2.5-230M-tools | Q4_K_M | — | — | no medido | no medido | no medido | (no medido) |
| LFM2.5-230M-tools | Q5_K_M | — | — | no medido | no medido | no medido | (no medido) |
| LFM2.5-230M-tools | Q8_0 | — | — | no medido | no medido | no medido | (no medido) |

Advertencias del propio autor sobre esta tabla: la fila BF16 corresponde a los pesos fusionados originales, no a la ejecución del fichero GGUF (el pipeline no tiene backend GGUF); las filas cuantizadas están vacías por falta de medición, no porque hayan dado cero; el scorer no encontró llamada parseable en 229 de las 272 filas; 103 de ellas esperan exactamente una llamada; y 16 filas muestran el patrón de llamada truncada a mitad de lista, atribuible al arnés de evaluación y no al modelo. El resto del error no está atribuido.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en todas las precisiones. Q4_K_M requiere aproximadamente 147 MB de pesos más overhead de contexto y KV cache; Q8_0, unos 236 MB; BF16, unos 441 MB.
- GPU recomendadas: innecesarias. Cualquier GPU con 2 GB o más (GTX 1650, RTX 3050, RTX 4090, A100, H100) puede alojarlo, pero el modelo no aprovecha ese hardware; el cuello de botella será el *overhead* de runtime, no la memoria.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en iGPU y en CPU pura. También cabe en dispositivos móviles y SBC.
- Opciones de despliegue: llama.cpp (`llama-cli -hf iromu/LFM2.5-230M-tools-GGUF:Q4_K_M`), bindings `llama-cpp-python` (`Llama.from_pretrained` con `n_gpu_layers=99`). No se ha verificado su funcionamiento en vLLM, TGI ni Ollama; Ollama podría importar el GGUF creando un Modelfile, pero no hay paquete oficial publicado en la información disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición para ninguna de las cuatro precisiones.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de sus model cards públicas y deben verificarse antes de usarlos en una decisión de producción; la información proporcionada solo cubre el modelo de esta ficha.

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iromu/LFM2.5-230M-tools-GGUF | 229,7 M | no disponible | Formato propio con marcadores; 15,8 % de llamadas parseables en la validacion del autor | Apache-2.0 | GGUF (4 precisiones) + pesos BF16 |
| LiquidAI/LFM2.5-230M-Base | ≈230 M | no disponible | 0/272 llamadas parseables en la misma evaluacion | Apache-2.0 (segun el fine-tune) | Pesos base de Liquid AI |
| Qwen2.5-0.5B-Instruct | ≈494 M | 32 768 tokens (segun su model card) | Soporte de function calling en plantilla ChatML | Apache-2.0 | Safetensors, GGUF de terceros |
| SmolLM2-360M-Instruct | ≈362 M | 8 192 tokens (segun su model card) | No especializado; requiere prompting | Apache-2.0 | Safetensors, GGUF |

Frente al modelo base, la comparación es directa y está medida: el fine-tune pasa de 0 a 43 llamadas parseables sobre 272 filas. Frente a Qwen2.5-0.5B-Instruct, este modelo ofrece menos de la mitad de parámetros y un formato no estándar, a cambio de una huella de 147 MB y de un contrato de llamada explícito y trivial de parsear. No hay datos de benchmarks que permitan comparar calidad general con ninguna de las alternativas.

## Limitaciones y advertencias

- **Rendimiento absoluto bajo en su propia métrica**: 15,8 % de llamadas parseables, 6,2 % de nombres correctos y 1,5 % de argumentos exactos sobre 272 filas. Cualquier uso en producción exige validación y una capa de reparación o reintento.
- **Formato no estándar**: no emite el sobre `tool_calls` de OpenAI. Un parser que busque ese array no encontrará nada en ninguna fila, lo que se interpreta erróneamente como un modelo que no sabe llamar a herramientas.
- **Ningún fichero GGUF ha sido ejecutado por un runtime GGUF en la validación**: la cifra BF16 corresponde a los pesos fusionados bajo `transformers`. El comportamiento real bajo llama.cpp tras la cuantización no está medido.
- **Cuantizaciones sin evaluar**: Q4_K_M, Q5_K_M y Q8_0 no tienen métricas; se desconoce la degradación introducida por cada una.
- **Solo inglés**: no se declara soporte multilingüe, incluido el castellano.
- **Contexto no documentado**: se desconoce la ventana máxima, lo que impide planificar conversaciones largas o prompts con muchas herramientas.
- **Riesgo de alucinación y de llamadas inventadas**: al ser un modelo de 230 M parámetros, es esperable que genere nombres de función o argumentos inexistentes; la validación ya muestra un 84 % de filas sin llamada parseable.
- **Riesgo de truncamiento**: el límite de 384 tokens usado en la evaluación produjo 16 filas con llamadas cortadas a mitad de lista; listas largas de herramientas o argumentos extensos pueden exceder la ventana práctica.
- **Licencia**: Apache-2.0 permite uso comercial, pero conviene revisar también las condiciones del modelo base de Liquid AI y del dataset de destilación `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation`, no detalladas aquí.
- **Autoría comunitaria**: el modelo lo publica `iromu`, no Liquid AI; no hay garantía de mantenimiento, y el repositorio registra 0 descargas y 0 *likes* en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iromu/LFM2.5-230M-tools-GGUF
- Modelo base del fine-tune (pesos BF16 y tabla de validacion completa): https://huggingface.co/iromu/LFM2.5-230M-tools
- Modelo base original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-230M-Base
- Dataset de destilacion declarado: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation
- Runtime de referencia (llama.cpp): https://github.com/ggml-org/llama.cpp
- Bindings de Python (llama-cpp-python): https://github.com/abetlen/llama-cpp-python

Nota: los resultados de la busqueda web realizada no contenian enlaces relevantes al modelo (devolvieron contenido ajeno al proyecto), por lo que la lista anterior se limita a las referencias presentes en la informacion de HuggingFace y a los repositorios de los runtimes citados en la model card. No se han localizado papers ni blogs tecnicos adicionales.
