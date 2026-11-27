# KryonOS/KryonAI-Text-4M

## Resumen

KryonAI-Text-4M es un modelo de lenguaje autorregresivo de tipo decoder-only, con arquitectura transformer al estilo GPT, desarrollado por KryonOS. Con 4,01 millones de parámetros, está disenado especificamente para inferencia en microcontroladores con recursos muy limitados, en particular el ESP32-S3 (N16R8) con PSRAM octal de 8 MB, ejecutando el sistema operativo KryonOS. El modelo resuelve el problema de dotar de generacion de texto local a dispositivos de borde sin conectividad ni capacidad de computo en la nube.

La relevancia del modelo reside en su empaquetado y optimizacion extrema: pesos en INT8 con escalas en FP32, formato propietario `.krai` con alineacion SIMD de 16 bytes compatible con los kernels ESP-NN, y un vocabulario BPE de 4096 subpalabras. La longitud de contexto es de solo 128 tokens, lo que lo situa en un regimen de uso muy acotado (interacciones cortas, comandos, respuestas breves).

Se trata de un modelo experimental y de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a desarrolladores de aplicaciones embebidas para KryonOS y a investigadores interesados en LLM ultracompactos. No debe confundirse con modelos de proposito general: su utilidad practica esta ligada al ecosistema KryonOS y al hardware ESP32-S3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo GPT) |
| Parametros totales | 4.010.000 (4M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | INT8 (pesos) + FP32 (escalas), formato `.krai` |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.krai` (binario propietario, alineado a SIMD de 16 bytes); pesos PyTorch en el repositorio |
| Dimension oculta (`dim`) | 192 |
| Dimension FFN (`hidden_dim`) | 768 (4 × `dim`) |
| Capas (`n_layers`) | 6 |
| Cabezas de atencion (`n_heads`) | 6 (dimension por cabeza = 32) |
| Embeddings posicionales | aprendidos (`wpe`) |
| Normalizacion | LayerNorm |
| Activacion | GELU |
| Vocabulario | 4096 subpalabras BPE (pre-tokenizador Whitespace) |
| Hardware objetivo | ESP32-S3, ESP32-S3 N16R8 con PSRAM octal (8 MB) |
| Libreria | PyTorch |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 6 capas con dimension oculta de 192, FFN de 768, 6 cabezas de atencion de dimension 32, embeddings posicionales aprendidos, LayerNorm y activacion GELU. Emplea un vocabulario BPE de 4096 subpalabras entrenado con pre-tokenizador Whitespace. El modelo se entreno en precision mixta (bfloat16) sobre una GPU NVIDIA L4 de Google Colab durante 7500 pasos, procesando aproximadamente 245,76 millones de tokens, con un scheduler de learning rate de tipo cosine annealing.

El dataset combina cinco fuentes: anclas de identidad y chat general de KryonOS creadas a mano y sobremuestreadas (preguntas de sistema, capacidades y acciones basicas de UI), un curriculo aritmetico sintetico de 16.000 muestras limpias (sumas, restas, multiplicaciones y divisiones) para suprimir alucinaciones matematicas, HuggingFaceTB/smol-smoltalk, OpenAssistant/oasst2 (muestras conversacionales mejor valoradas) y microsoft/orca-math-word-problems-200k filtrado para caber en la ventana de 128 tokens. Como innovaciones tecnicas destacan el entrenamiento consciente de cuantizacion (QAT) con estimadores de gradiente recto (STE) activado en el ultimo 15% del entrenamiento (desde el paso 6375) para preadaptar los pesos a las limitaciones de INT8, y un label smoothing de 0,03 para desincentivar bucles de generacion sobreconfiados, habituales en modelos de menos de 10M de parametros. El empaquetado `.krai` incluye una cabecera de 64 bytes con dimensiones y offsets, una tabla de vocabulario UTF-8 terminada en nulo con exactamente 4096 entradas y un payload de pesos alineado a 16 bytes para ejecutar instrucciones vectoriales del ESP32 directamente desde PSRAM.

## Capacidades

- Generacion de texto corto en ingles, con respuestas concisas limitadas a la ventana de 128 tokens.
- Conversacion multi-turno basica de instrucciones y chat general, gracias a los datos de smol-smoltalk y oasst2.
- Aritmetica simple (sumas, restas, multiplicaciones y divisiones) reforzada mediante curriculo sintetico.
- Resolucion de problemas matematicos verbales de formato breve (orca-math filtrado a 128 tokens).
- Respuestas sobre identidad, capacidades y acciones basicas de UI de KryonOS mediante anclas sobremuestreadas.
- Inferencia completamente local en microcontrolador, sin conexion a red.
- Integracion en aplicaciones JavaScript personalizadas para KryonOS mediante la API de desarrollo.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso complejo.
- No soporta vision, audio ni modo thinking.
- Multilingue: solo ingles.

## Casos de uso

- Asistente de chat local en ESP32-S3: el modelo permite conversaciones cortas en el propio dispositivo sin conexion, adecuado para respuestas breves de menos de 128 tokens en un entorno con PSRAM octal.
- Comandos de voz o texto en dispositivos de borde: integrado en la app Local AI Chat de KryonOS, sirve para interpretar instrucciones simples y responder con texto generado localmente.
- Aritmetica basica en herramientas embebidas: el curriculo sintetico de 16.000 muestras permite resolver operaciones simples en calculadoras o asistentes de campo sin conexion.
- Problemas matematicos verbales breves en contextos educativos o de campo: el filtrado de orca-math a 128 tokens lo hace util para enunciados cortos y respuestas concisas.
- Prototipado de aplicaciones de IA en KryonOS: los desarrolladores pueden crear apps JavaScript que invoquen el modelo para generar texto en pantalla, como asistentes de menu o ayuda contextual.
- Demostraciones de investigacion en LLM ultracompactos: sirve como referencia reproducible de un transformer de 4M parametros con QAT y empaquetado SIMD para microcontroladores.
- Anclaje de identidad y UI en productos KryonOS: las anclas sobremuestreadas permiten respuestas coherentes sobre el sistema, sus capacidades y acciones de interfaz.
- Evaluacion de tecnicas de cuantizacion INT8 en hardware de borde: el formato `.krai` y el uso de kernels ESP-NN lo convierten en banco de pruebas para medir latencia y consumo en ESP32-S3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo esta pensado para PSRAM de 8 MB en ESP32-S3 N16R8. Los pesos INT8 de 4,01M parametros ocupan aproximadamente 4 MB, mas escalas FP32 y tabla de vocabulario.
- GPU recomendadas: no requiere GPU para inferencia; el entrenamiento se realizo en una NVIDIA L4 (Google Colab). Para reentrenamiento o conversion se puede usar cualquier GPU con soporte bfloat16.
- Cabe en GPU consumer: si, en cualquier GPU moderna para tareas de conversion o evaluacion, aunque el objetivo es el microcontrolador.
- Cabe en microcontrolador: si, en ESP32-S3 con PSRAM octal de 8 MB (configuracion N16R8). Requiere PSRAM obligatoriamente.
- Opciones de despliegue: app Local AI Chat de KryonOS, aplicaciones JavaScript propias sobre KryonOS y el formato `.krai` cargado desde almacenamiento interno o tarjeta SD. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware objetivo | Disponibilidad |
|---|---|---|---|---|---|
| KryonAI-Text-4M | 4,01M | 128 tokens | Apache 2.0 | ESP32-S3 con PSRAM | Hugging Face (0 descargas) |
| Modelos de la familia SmolLM (p. ej. SmolLM-135M) | 135M | no disponible en esta ficha | Apache 2.0 | CPU/GPU de borde | Hugging Face |
| Modelos TinyLlama (1,1B) | 1,1B | no disponible en esta ficha | Apache 2.0 | GPU consumer/CPU | Hugging Face |

La comparacion directa es limitada: KryonAI-Text-4M opera en un orden de magnitud inferior de parametros y contexto que los modelos de borde habituales, y su viabilidad depende del ecosistema KryonOS y del ESP32-S3. Para alternativas fuera de ese ecosistema, los modelos de la familia SmolLM o TinyLlama ofrecen mayor capacidad pero no estan disenados para ejecutarse en un microcontrolador con 8 MB de PSRAM.

## Limitaciones y advertencias

- Ventana de contexto muy reducida (128 tokens), lo que limita conversaciones y documentos a fragmentos minimos.
- Solo soporta ingles; no hay capacidades multilingues.
- Riesgo alto de alucinacion y de bucles de generacion, mitigado parcialmente con label smoothing de 0,03 pero no eliminado.
- Sesgos inheritos de los datasets de origen (smol-smoltalk, oasst2, orca-math) y de las anclas creadas a mano por el autor.
- Modelo experimental con cero descargas y cero likes en el momento de la consulta; sin validacion independiente conocida.
- Requiere hardware especifico (ESP32-S3 con PSRAM octal de 8 MB) y el sistema KryonOS; no es portable a otros entornos sin trabajo de conversion.
- El formato `.krai` es propietario y no sigue estandares como GGUF o safetensors para despliegue en microcontroladores.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de validacion externa desaconseja su uso en produccion sin evaluacion propia.
- No soporta tool calling, agentes, vision ni audio, lo que restringe su aplicacion a generacion de texto corto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KryonOS/KryonAI-Text-4M
- Documentacion de KryonOS: https://kryonos.harislab.tech/docs
- Documentacion de modelos de texto en dispositivo: https://kryonos.harislab.tech/docs/on-device-ai/text-models
- Dataset HuggingFaceTB/smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset OpenAssistant/oasst2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset microsoft/orca-math-word-problems-200k: https://huggingface.co/datasets/microsoft/orca-math-word-problems-200k
