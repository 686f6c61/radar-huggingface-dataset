# rudyvdbrink/Llama-Prompt-Guard-2-86M-onnx

## Resumen

Llama-Prompt-Guard-2-86M-onnx es la exportación a formato ONNX del clasificador de seguridad meta-llama/Llama-Prompt-Guard-2-86M, publicada por el usuario rudyvdbrink. El modelo original lo desarrolla Meta como parte de la familia Llama 4 y su función es detectar prompt injection y jailbreaks en entradas de texto, devolviendo una clasificación binaria entre BENIGN y MALICIOUS. Esta versión no altera los pesos: se limita a ofrecer el grafo en ONNX (fp32 y cuantización dinámica de 8 bits) junto con los pesos originales en safetensors, de modo que pueda ejecutarse con onnxruntime sin depender de PyTorch.

El interés práctico de esta exportación es el despliegue ligero: el modelo tiene 278.810.882 parámetros según los safetensors del repositorio (pese al "86M" del nombre, que corresponde a la nomenclatura del modelo base), acepta hasta 512 tokens y produce logits de dos clases. Al estar en ONNX puede integrarse en servicios de inferencia en producción con menor sobrecarga de dependencias y, en su variante cuantizada, con menor huella de memoria.

Es relevante ahora porque los sistemas basados en LLM expuestos a entrada de usuario necesitan una capa de filtrado previa que detecte intentos de manipulación de instrucciones. Este modelo cubre ocho idiomas (inglés, francés, alemán, hindi, italiano, portugués, español y tailandés) y su tamaño reducido permite ejecutarlo en cada petición con latencia baja, como paso de moderación antes del modelo generativo principal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (clasificador de texto, según tags del repositorio) |
| Parámetros totales | 278.810.882 (según safetensors del repo) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | fp32 (model.onnx) y cuantización dinámica de 8 bits por tensor con pesos QUInt8 (model.quant.onnx) |
| Idiomas soportados | en, fr, de, hi, it, pt, es, th |
| Licencia | Llama 4 Community License (con Llama 4 Acceptable Use Policy); el campo de licencia del repo figura como no disponible |
| Formato de pesos | ONNX (opset 17), safetensors y tokenizer.json (tokenizer rápido) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta deberta-v2 y del hecho de que el modelo base es meta-llama/Llama-Prompt-Guard-2-86M, construido con Llama según indica la model card. Se trata de un clasificador de secuencias: recibe input_ids y attention_mask en int64 con forma [batch_size, sequence_length], y devuelve logits float32 de forma [batch_size, 2], donde la etiqueta 0 corresponde a BENIGN y la 1 a MALICIOUS. La longitud máxima de entrada es de 512 tokens.

Esta exportación concreta no aporta información sobre el dataset de entrenamiento, el número de tokens utilizados ni si hubo ajuste con RLHF o DPO; esos detalles corresponden al modelo original de Meta y no están recogidos en la información proporcionada. La innovación técnica de este repositorio es la conversión a ONNX con opset 17 en precisión completa y una variante con cuantización dinámica de 8 bits (per-tensor, pesos QUInt8), pensada para reducir tamaño y latencia. La propia model card advierte que la pérdida de precisión de la variante cuantizada es grande para este modelo y recomienda validarla sobre datos propios antes de usarla.

## Capacidades

- Clasificación binaria de texto: distingue entre entrada BENIGN y MALICIOUS, con salida de logits a los que se aplica softmax para obtener probabilidades.
- Detección de prompt injection: identifica instrucciones que intentan anular o sustituir las instrucciones del sistema.
- Detección de jailbreak: reconoce intentos de eludir las restricciones de seguridad del modelo generativo.
- Multilingüe en ocho idiomas: inglés, francés, alemán, hindi, italiano, portugués, español y tailandés.
- Ejecución con onnxruntime: no requiere PyTorch en tiempo de inferencia; el tokenizer rápido se carga con transformers o tokenizers.
- Compatibilidad con text-embeddings-inference y endpoints, según los tags del repositorio.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un clasificador.

## Casos de uso

- Moderación previa a un LLM en producción: cada mensaje de usuario se clasifica con el modelo antes de llegar al modelo generativo; si la probabilidad de MALICIOUS supera un umbral configurable, se bloquea o se deriva a revisión. El tamaño reducido permite hacerlo en línea con latencia baja.
- Protección de asistentes con instrucciones de sistema sensibles: detecta frases del tipo "ignora todas las instrucciones anteriores" antes de que el modelo principal las procese, reduciendo el riesgo de fuga del system prompt.
- Filtrado en aplicaciones multilingües: al cubrir español, francés, alemán, italiano, portugués, hindi y tailandés, sirve para productos con base de usuarios internacional sin desplegar un clasificador distinto por idioma.
- Puerta de seguridad en pipelines RAG: clasificar tanto la consulta del usuario como fragmentos recuperados antes de insertarlos en el contexto del modelo, para evitar inyecciones indirectas incrustadas en documentos.
- Despliegue en entornos sin PyTorch: al estar en ONNX, se integra en servicios escritos en Python con onnxruntime o en infraestructuras que ya sirven modelos ONNX, incluida la variante cuantizada para contenedores con memoria limitada.
- Evaluación y monitorización de tráfico: ejecutar el clasificador sobre logs de conversaciones para medir la tasa de intentos de jailbreak y ajustar políticas de seguridad con datos agregados.
- Filtro en APIs públicas de chatbots: como paso previo barato (modelo de menos de 300 millones de parámetros) que descarta peticiones maliciosas antes de consumir cuota de GPU en el modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el grafo fp32 ocupa del orden de 1,1 GB para 278,8 millones de parámetros; la variante cuantizada de 8 bits reduce esta cifra aproximadamente a una cuarta parte (en torno a 0,3 GB), aunque la model card no publica cifras exactas de tamaño de los ficheros ONNX.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp32; para la variante cuantizada basta con GPUs de gama baja o incluso CPU.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores; también es viable en CPU con onnxruntime, dado el tamaño del modelo y la ventana de 512 tokens.
- Opciones de despliegue: onnxruntime (Python u otros bindings), text-embeddings-inference y endpoints compatibles según los tags; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles; la model card solo indica que model.quant.onnx es más pequeño y rápido que model.onnx, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| rudyvdbrink/Llama-Prompt-Guard-2-86M-onnx | 278.810.882 | 512 tokens | 8 idiomas | Llama 4 Community License | ONNX, safetensors |
| meta-llama/Llama-Prompt-Guard-2-86M (modelo base) | No disponible en la información | No disponible en la información | No disponible en la información | Llama 4 Community License | Pesos PyTorch |
| Otros clasificadores de prompt injection | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada solo permite comparar esta exportación con su modelo base, del que se diferencia por el formato (ONNX frente a PyTorch) y por incluir una variante cuantizada. No se dispone de datos de benchmarks ni de otros clasificadores comparables para establecer una comparación de rendimiento.

## Limitaciones y advertencias

- La variante cuantizada (model.quant.onnx) pierde precisión de forma notable según la propia model card; es obligatorio validarla con datos propios antes de usarla en producción.
- Ventana de contexto limitada a 512 tokens: los ataques incrustados en prompts muy largos pueden quedar truncados y no evaluarse.
- Clasificador binario: no distingue tipos de ataque ni ofrece explicaciones, solo una probabilidad de MALICIOUS; requiere definir umbrales y gestionar falsos positivos y negativos.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificación errónea: entradas ambiguas o en idiomas no cubiertos pueden recibir etiquetas poco fiables.
- Cobertura lingüística limitada a los ocho idiomas declarados; otros idiomas no están soportados explícitamente.
- Licencia Llama 4 Community License con Acceptable Use Policy: el uso comercial está sujeto a los términos de Meta, que deben revisarse antes de desplegar; el campo de licencia del repositorio figura como no disponible, por lo que conviene consultar el fichero LICENSE incluido.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es una exportación de terceros, no oficial de Meta, sin validación comunitaria documentada.
- No se han publicado benchmarks ni métricas de precisión en la información disponible, lo que impide estimar su tasa de detección real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rudyvdbrink/Llama-Prompt-Guard-2-86M-onnx
- Modelo base: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M
- Política de uso aceptable de Llama 4: https://www.llama.com/llama4/use-policy
