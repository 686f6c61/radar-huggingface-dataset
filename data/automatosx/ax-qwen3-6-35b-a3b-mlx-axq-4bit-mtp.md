# AutomatosX/AX-Qwen3.6-35B-A3B-MLX-AXQ-4bit-MTP

## Resumen

AX-Qwen3.6-35B-A3B-MLX-AXQ-4bit-MTP es un checkpoint cuantizado en formato MLX del modelo Qwen3.6-35B-A3B, un transformer de mezcla de expertos (MoE) con 35,11 mil millones de parámetros lógicos y aproximadamente 3 mil millones de parámetros activos por token. Ha sido desarrollado por AutomatosX utilizando el cuantizador AXQuant (AXQ) en su versión 1.2.0, con una estrategia de precisión mixta que asigna 4 bits a la mayoría de los tensores de la ruta de texto, mientras preserva en 8 bits y BF16 los tensores considerados críticos. El checkpoint incluye además dos sidecars en BF16: un cabezal de predicción multi-token (MTP) y una torre de visión, lo que permite extender las capacidades del modelo base a tareas multimodales.

Este modelo resuelve el problema de ejecutar un MoE de gran tamaño en hardware Apple Silicon con memoria unificada, reduciendo el peso de descarga a aproximadamente 23,12 GB y manteniendo una ventana de contexto configurada de 262 144 tokens. Su relevancia radica en que ofrece una alternativa optimizada para inferencia local en Macs con chips M-series, sin renunciar a las capacidades de razonamiento, generación de código y soporte de visión del modelo original. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (mixture of experts, MoE) |
| Parametros totales | 35,11B (logicos); 5,92B en safetensors cuantizados |
| Parametros activos | ~3B (designacion A3B) |
| Longitud de contexto | 262 144 tokens (configurado; limite practico segun memoria unificada) |
| Tipos de cuantizacion | AXQuant mixto: 4-bit (93,52%), 8-bit (1,47%), BF16 (5,01%) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no contiene PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura MoE con 35,11B parámetros lógicos y aproximadamente 3B activos por token, lo que reduce el coste computacional en inferencia. El checkpoint de AutomatosX aplica una cuantización AXQuant de precisión mixta sobre la ruta de texto: el 93,52% de los parámetros se almacenan en 4 bits con grupos de tamaño 32 y 64, el 1,47% en 8 bits y el 5,01% en BF16, incluyendo los tensores protegidos por prior de arquitectura. El cabezal MTP (844,64M parámetros) y la torre de visión (446,57M parámetros) se conservan íntegramente en BF16 como sidecars opcionales.

La cuantización se realizó sin calibración con datos reales; la asignación de precisión se basa en prior de arquitectura. Los 471 módulos de conversión se ejecutaron sin fallos. El checkpoint está certificado como Tier 1 en calidad respecto a una cuantización uniforme de 4 bits del mismo modelo, con una retención de calidad de 1,000. La aceleración por MTP no está certificada (Tier 2 no supera los umbrales de velocidad), por lo que el producto por defecto usa inferencia directa sin MTP.

## Capacidades

- Generacion de texto y razonamiento conversacional multirround, heredadas del modelo base Qwen3.6.
- Generacion de codigo y soporte de matematicas, propias de la familia Qwen.
- Capacidades de vision gracias al sidecar de vision en BF16 (333 tensores, 446,57M parametros), aunque la calidad vision-language no esta garantizada por la certificacion.
- Prediccion multi-token (MTP) mediante sidecar dedicado, aunque sin aceleracion certificada en este checkpoint.
- Ventana de contexto amplia de 262 144 tokens, adecuada para documentos extensos y agentes con historial largo.
- Soporte de tool calling y function calling, caracteristico de los modelos Qwen recientes (no verificado explicitamente en la model card, pero implicito en la familia).
- Compatibilidad con MLX-LM para inferencia estandar de texto en Apple Silicon.

## Casos de uso

- Asistentes de codigo en entornos locales: con 3B parametros activos, el modelo puede ejecutarse en una Mac con memoria unificada de 32 GB o mas, ofreciendo autocompletado y generacion de funciones con baja latencia gracias a la cuantizacion 4-bit.
- Procesamiento de documentos legales o academicos extensos: la ventana de 262K tokens permite ingerir contratos completos o articulos de investigacion sin truncamiento, manteniendo el contexto en memoria.
- Chatbots de atencion al cliente con historial largo: el modelo gestiona conversaciones multi-turno con memoria de hasta 262K tokens, adecuado para soporte tecnico con logs extensos.
- Prototipado rapido de agentes con tool calling: al ejecutarse localmente en MLX, permite iterar sobre pipelines de agentes que llaman a APIs o ejecutan comandos sin depender de servicios en la nube.
- Analisis de imagenes con descripcion de texto: el sidecar de vision en BF16 posibilita tareas de captioning o VQA en el mismo entorno MLX, aunque con calidad no certificada.
- Desarrollo de aplicaciones offline de generacion de texto: la licencia Apache 2.0 y el formato MLX facilitan la integracion en productos comerciales que requieren privacidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evidencia de rendimiento es la certificacion Tier 1 de AutomatosX, que reporta una retencion de calidad de 1,000 frente a una cuantizacion uniforme de 4 bits del mismo modelo, y un tamano de 1,132 veces mayor que el uniforme-4 bajo un presupuesto de clase de 1,15. No se dispone de cifras de latencia o throughput validadas.

## Requisitos de hardware

- VRAM estimada: el peso safetensors ocupa 23,10 GB; se recomienda un minimo de 24 GB de memoria unificada para cargar el modelo completo con los sidecars.
- GPU recomendadas: Apple Silicon con al menos 24 GB de memoria unificada (M1 Pro/Max/Ultra, M2, M3, M4, M5). El certificado de validacion se genero en un MacBook Pro con chip M5.
- Compatibilidad con consumer GPU: solo Apple Silicon via MLX; no es compatible con CUDA ni con tarjetas graficas de NVIDIA.
- Opciones de despliegue: MLX-LM (comando `mlx_lm.generate`), con soporte estandar de inferencia de texto. No incluye manifiesto para AX Engine nativo.
- Latencia y throughput: no disponibles; la aceleracion MTP no esta certificada, por lo que se espera un rendimiento similar al de una cuantizacion 4-bit uniforme sin MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen/Qwen3.6-35B-A3B (base) | 35,11B (3B activos) | 262 144 | BF16 | Apache 2.0 | PyTorch |
| mlx-community/Qwen3.6-35B-A3B-4bit | 35,11B (3B activos) | 262 144 | 4-bit uniforme | Apache 2.0 | MLX |
| AutomatosX/AX-Qwen3.6-35B-A3B-MLX-AXQ-4bit-MTP | 35,11B (3B activos) | 262 144 | 4-bit mixto AXQ | Apache 2.0 | MLX |

La diferencia principal frente al uniforme-4 es la precision mixta: AXQ protege tensores criticos en 8-bit y BF16, lo que incrementa el tamano un 13,2% pero mantiene una retencion de calidad de 1,000 frente a un 4-bit uniforme. Frente al modelo base BF16, el checkpoint AXQ reduce el peso de descarga de aproximadamente 70 GB a 23,12 GB, a costa de una perdida de precision no cuantificada en benchmarks publicos.

## Limitaciones y advertencias

- La aceleracion por MTP no esta certificada (Tier 2 no supera los umbrales de velocidad); el producto por defecto usa inferencia directa, por lo que no se debe afirmar que el checkpoint ofrece aceleracion multi-token.
- La cuantizacion se realizo sin calibracion con datos reales; la asignacion de precision se basa en prior de arquitectura, lo que puede afectar a la calidad en tareas especificas no cubiertas por la certificacion.
- El sidecar de vision esta presente pero su calidad para tareas vision-language no esta validada; no se recomienda su uso en produccion sin pruebas adicionales.
- No incluye pesos en PyTorch ni GGUF; solo es utilizable en entornos MLX (Apple Silicon).
- El limite de contexto de 262K tokens es configurado, pero el limite practico depende de la memoria unificada disponible; cargar el modelo completo con sidecars requiere al menos 24 GB.
- No se han publicado benchmarks estandar (MMLU, HumanEval, etc.) para este checkpoint, lo que limita la comparacion objetiva con otras cuantizaciones.
- La certificacion Tier 1 se realizo en un host especifico (MacBook Pro M5) y para un commit concreto del repositorio; no se garantiza el mismo rendimiento en otros entornos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/AutomatosX/AX-Qwen3.6-35B-A3B-MLX-AXQ-4bit-MTP)
- [Modelo base Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Certificado Tier 1](https://github.com/defai-digital/axquant/blob/main/docs/certifications/qwen36-35b-axq4-tier1.md)
- [Indice de certificaciones AXQuant](https://github.com/defai-digital/axquant/blob/main/docs/certifications/README.md)
- [Catalogo de modelos MLX de AutomatosX](https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog)
