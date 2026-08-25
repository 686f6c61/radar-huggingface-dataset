# ariacompute/qwen3.5-2b_q4

## Resumen

El modelo `ariacompute/qwen3.5-2b_q4` es una distribucion cuantizada del modelo base Qwen3.5-2B, desarrollado por el equipo Qwen de Alibaba Cloud y empaquetado por Aria Compute como un "aria-quant-bundle". Qwen3.5-2B es un Transformer denso decoder-only de 2.000 millones de parametros con una arquitectura hibrida que combina atencion lineal DeltaNet y atencion completa en proporcion 3:1, lo que le permite manejar una ventana de contexto nativa de 256.000 tokens. El bundle aplica cuantizacion uniforme de 4 bits por grupo (g=32) con pre-procesado Hadamard, reduciendo el peso de BF16 (~4 GB) a aproximadamente 1,1 GB, un factor de compresion de ~3,6x.

Esta version esta optimizada para inferencia exclusivamente en CPU en dispositivos locales como telefonos moviles, placas tipo Raspberry Pi 5 y pasarelas IoT, sin necesidad de GPU ni conexion a la nube. Es la opcion de menor volumen dentro del catalogo de Aria Compute, pensada para escenarios con recursos muy limitados. El modelo conserva las capacidades de generacion de texto, tool calling y embeddings del modelo original, con una calidad de generacion que el propio autor califica como "agresiva" en compresion y limitada en fidelidad para prefijos cortos.

La relevancia de este modelo radica en su combinacion de contexto muy largo (256K) con un peso inferior a 1,2 GB, lo que habilita asistentes conversacionales, analisis de documentos locales y agentes con tool calling en hardware de consumo sin aceleracion GPU. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso, hibrido DeltaNet (atencion lineal) + atencion completa, proporcion 3:1 |
| Parametros totales | 2 mil millones (2B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (nativo) |
| Tipos de cuantizacion | Uniforme 4-bit por grupo (g=32) con pre-procesado Hadamard; RMSNorm y embeddings en FP16 |
| Idiomas soportados | Ingles (primario), chino, y mas de 20 idiomas adicionales |
| Licencia | Apache 2.0 |
| Formato de pesos | Bundle propietario de Aria Engine (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

Qwen3.5-2B es un modelo denso Transformer decoder-only con una arquitectura hibrida que combina atencion lineal DeltaNet y atencion completa en proporcion 3:1 (tres capas DeltaNet por cada capa de atencion completa). Esta configuracion reduce la complejidad computacional del atencion para secuencias largas, permitiendo una ventana de contexto nativa de 256K tokens con un coste de memoria de cache KV moderado. El modelo fue pre-entrenado sobre corpus publicos amplios que incluyen RedPajama-Data-1T, The Pile y The Stack, y posteriormente alineado mediante SFT (supervised fine-tuning) y DPO (direct preference optimization) para mejorar el seguimiento de instrucciones y el razonamiento.

La cuantizacion aplicada por Aria Compute usa un esquema de 4 bits por grupo (g=32) con pre-procesado Hadamard y codebooks por grupo, sin necesidad de datos de calibracion especificos de tarea. Los pesos de atencion (Q/K/V/O) y de las capas FFN (up/gate/down) se cuantizan a 4 bits, mientras que las normas RMSNorm y la tabla de embeddings se conservan en FP16. El resultado es un bundle de ~1,1 GB con una compresion de ~3,6x respecto al original BF16, a costa de una fidelidad de generacion reducida segun la referencia del metodo (token overlap 0.1878, exact prefix fraction 0.0729, logprob delta -0.172159).

## Capacidades

- Generacion de texto y chat conversacional en ingles y chino (ademas de 20+ idiomas), con soporte de contexto largo hasta 256K tokens.
- Tool calling / function calling para APIs moviles y de IoT, permitiendo que el modelo invoque funciones externas de forma estructurada.
- Generacion de codigo multi-linea en tiempo real, adecuada para autocompletado y edicion asistida en entornos locales.
- Embeddings de texto para tareas de recuperacion y clasificacion en el dispositivo.
- Resumen de texto de longitud corta a media (notificaciones, mensajes, contenido local) con ventana de contexto amplia.
- Capacidades multilingues, con el ingles como idioma principal y el chino como secundario.
- Alineacion con SFT + DPO para mejor seguimiento de instrucciones y respuestas preferidas por humanos.

## Casos de uso

- Asistentes conversacionales en el dispositivo: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 256K tokens de ventana, manteniendo el historial completo en memoria local sin conexion.
- Analisis de documentos locales: permite procesar manuales, contratos o articulos de hasta 256K tokens en fragmentos, realizando resumenes y extraccion de informacion en un telefono o una Raspberry Pi 5.
- Autocompletado de codigo en editores moviles: genera fragmentos de codigo multi-linea en el dispositivo, con tool calling para integrarse en entornos de desarrollo ligero.
- Integracion con APIs de IoT: el modelo puede actuar como intermediario para invocar funciones de dispositivos inteligentes (encender luces, leer sensores) mediante tool calling, sin depender de servicios en la nube.
- Clasificacion y recuperacion de texto local: usando sus capacidades de embeddings, permite construir sistemas de busqueda semantica y clasificacion de correos o mensajes en el telefono.
- Asistencia en entornos sin conectividad: en zonas rurales o con cobertura limitada, el modelo proporciona respuestas y completado de texto en ingles y chino, con un peso de 1,1 GB que cabe en la memoria de dispositivos de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento declarado por el autor es un indicador de consistencia de generacion, sin verificacion externa:

| Tarea | Metrica | Valor | Verificado |
|---|---|---|---|
| Generation Consistency (vs FP16, method reference) | mean_token_overlap | 0.1878 | No |
| Generation Consistency (vs FP16, method reference) | exact_prefix_frac | 0.0729 | No |
| Generation Consistency (vs FP16, method reference) | logprob_delta | -0.172159 | No |

Nota: el autor indica que los valores de referencia corresponden al metodo qwen3-0.6b_q4, y que el resultado para este modelo esta pendiente de auditoria (`awaiting gen_quant_eval audit`). La baja exactitud de prefijos (0.0729) sugiere una compresion agresiva que limita la reproduccion exacta de secuencias cortas.

## Requisitos de hardware

- Memoria runtime estimada: ~1.4 GB a contexto de 4K tokens, desglosada en ~1.1 GB de pesos cuantizados (mmap), ~96 MB de KV cache, ~80 MB de overhead runtime y ~130 MB de codebooks.
- Dispositivos compatibles: telefonos de gama alta (8 GB RAM) recomendados, gama media (4-6 GB) validos, gama baja (2-3 GB) con margen ajustado; Raspberry Pi 5 y SBC de 4-8 GB compatibles; IoT gateway de 1-2 GB y wearables de 1 GB no soportados.
- Aceleracion: no requiere GPU; inferencia exclusivamente en CPU mediante el runtime Aria Engine.
- Despliegue: se descarga desde el dashboard de Aria Compute y se ejecuta con el motor Aria Engine (enlace a ariacompute.com).
- Latencia y throughput: no disponibles en la informacion publicada; el modelo esta disenado para inferencia de una sola consulta, no para batch.
- Opciones alternativas: no se menciona soporte para vLLM, llama.cpp, Ollama o TGI; el formato de bundle es propietario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Peso aproximado | Licencia | Uso objetivo |
|---|---|---|---|---|---|---|
| Qwen3.5-2B (original, BF16) | 2B | 256K | Sin cuantizar | ~4 GB | Apache 2.0 | GPU/CPU con alto memoria |
| ariacompute/qwen3.5-2b_q4 | 2B | 256K | 4-bit uniforme (g=32) | ~1.1 GB | Apache 2.0 | CPU on-device, minimo volumen |
| ariacompute/qwen3.5-2b_q326_channel | 2B | 256K | 3.26-bit por canal | no disponible | Apache 2.0 | CPU on-device, calidad recomendada |
| ariacompute/qwen3.5-2b_q8 | 2B | 256K | 8-bit | no disponible | Apache 2.0 | CPU on-device, calidad casi sin perdida |

No se dispone de datos de rendimiento para los modelos comparables en la informacion proporcionada. El autor recomienda las variantes `q326_channel` y `q8` si se prioriza la calidad de generacion sobre el volumen minimo.

## Limitaciones y advertencias

- Sesgos y alucinacion: no se dispone de evaluaciones especificas; como modelo de 2B, puede producir respuestas inexactas o inventadas, especialmente en tareas de razonamiento complejo.
- Calidad de generacion: la cuantizacion 4-bit uniforme es la mas agresiva del catalogo; la referencia del metodo indica baja exactitud de prefijos (0.0729) y un deficit logprob de -0.172, lo que puede causar desviaciones en la reproduccion exacta de texto corto.
- Limitaciones de contexto: aunque el contexto nativo es de 256K tokens, el KV cache crece moderadamente (24 capas × 2 KV heads × head_dim=256), lo que puede exceder la memoria en dispositivos de gama baja cuando se usan ventanas muy largas.
- Idiomas: aunque se declara soporte de 20+ idiomas, la model card solo lista ingles y chino como idiomas principales; la calidad en otros idiomas no esta documentada.
- Uso fuera de alcance: no apto para escritura creativa larga (>4K tokens por generacion), demostracion matematica formal, sintesis de programas completos, entrada multimodal, procesamiento de audio, ni sistemas criticos de seguridad sin supervision humana.
- Restricciones de despliegue: no soporta inferencia por lotes (batch) ni aceleracion GPU; esta pensado exclusivamente para inferencia de una sola promesa en CPU.
- Licencia: Apache 2.0 permite uso comercial, pero el runtime Aria Engine puede tener sus propios terminos de distribucion; se recomienda revisar la politica de Aria Compute antes de usar en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ariacompute/qwen3.5-2b_q4
- Repositorio de archivos del modelo: https://huggingface.co/ariacompute/qwen3.5-2b_q4/tree/main
- Repositorio GitHub de Aria Compute (modelo): https://github.com/ariacompute/model/tree/main/qwen/qwen3.5-2b
- Dashboard de Aria Compute: https://ariacompute.com/dashboard/models
- Motor de inferencia Aria Engine: https://ariacompute.com
- Repositorio original de Qwen3.5: https://github.com/QwenLM/Qwen3.5
- Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Qwen3.5-2B en Ollama: https://ollama.com/library/qwen3.5:2b
