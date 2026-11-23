# CaptainArni/Swift-1.5-Qwen3.8-27B-Basalt

## Resumen

Swift-1.5-Qwen3.8-27B-Basalt es un fichero de modelo único en formato Basalt (`.basalt`, versión 2) que empaqueta los pesos del fine-tune `ukisai/Swift-1.5-Qwen3.8-27b-NVFP4`, la segunda iteración de UkisAI sobre Qwen3.8-27B orientada a razonamiento eficiente. El autor de la conversión es CaptainArni, que publica este artefacto como hermano de su variante para el motor NInfer: mismos pesos, distinto motor de inferencia. El fichero incluye el modelo de texto, la capa MTP (multi-token prediction), el drafter DFlash 2 de z-lab, la torre de visión, el tokenizador y la plantilla de chat.

El modelo es multimodal (pipeline `image-text-to-text`) y está pensado para ejecutarse en GPUs Blackwell (sm_120) mediante el motor Basalt, que sirve APIs compatibles con OpenAI y Anthropic. La cuantización es mixta: capas MLP y cabeza de salida en NVFP4, proyecciones de atención y GDN en FP8 E4M3 con escalas por tensor de NVIDIA ModelOpt, embeddings en BF16, normas en F32 y proyecciones del drafter y de la capa MTP en Q8_0.

La relevancia de esta ficha es doble: por un lado documenta un formato de empaquetado nuevo (Basalt) que compite con NInfer sobre el mismo checkpoint, y por otro aporta mediciones concretas de prefill, decodificación y eficiencia en una RTX 5090. No es un modelo nuevo desde el punto de vista de pesos, sino una conversión verificada bit a bit (salvo dos redondeos Q8_0) que mejora el rendimiento de lectura de contextos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas GDN (gated delta net) y atención completa; incluye capa MTP y drafter DFlash 2 |
| Parametros totales | 27B (según nomenclatura del modelo base Qwen3.8-27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 262.144 tokens (245.760 y 224.000 verificados en RTX 5090 con 32 GB) |
| Tipos de cuantizacion | NVFP4 (MLP y cabeza de salida), FP8 E4M3 (atención y GDN), BF16 (embeddings y proyecciones GDN a/b), F32 (normas), Q8_0 (proyecciones MTP y drafter), vision tower en GGUF clip |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiquetada como `other`) |
| Formato de pesos | Basalt `.basalt` versión 2 (fichero único de 22,1 GiB) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen3.8-27B, un transformer con mezcla de capas GDN (gated delta net, una variante de atención lineal con estado recurrente) y capas de atención completa: 144 proyecciones GDN y 64 proyecciones de atención completa según la model card. Sobre esa base, UkisAI aplicó un fine-tune orientado a "razonamiento eficiente", del que no se detallan en la información disponible el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO. Tampoco se especifica el proceso de entrenamiento del drafter DFlash 2 ni de la capa MTP, más allá de que se integran en el fichero Basalt.

La innovación técnica de este artefacto no está en los pesos sino en el empaquetado y el motor: el conversor de Basalt lee checkpoints de ModelOpt directamente y preserva los códigos y escalas de cuantización tal como los publicó UkisAI, sin recuantizar. La decodificación especulativa la aporta el drafter DFlash 2 (activo por defecto en Basalt), y la capa MTP permite predicción multi-token. El fichero incluye además la torre de visión en formato GGUF clip de llama.cpp, lo que habilita la entrada de imágenes.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo "thinking" controlado por la plantilla de chat (`efficient-thinking`).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), gracias a la torre de visión incluida.
- Tool calling y uso de agentes: la model card documenta un bucle agéntico real con lectura de skills, selección de tarjetas de referencia y escritura de respuestas JSON.
- Decodificación especulativa integrada mediante el drafter DFlash 2, activada por defecto.
- Predicción multi-token (MTP) para acelerar la generación.
- Soporte de contextos muy largos (hasta 262.144 tokens) con caché KV en int8.
- Servido de APIs compatibles con OpenAI y Anthropic a través del motor Basalt.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos: con 224.000–262.144 tokens de contexto y un prefill de 5.926 tok/s a 172k en RTX 5090, el modelo puede ingerir informes, expedientes o bases de código completas en una sola pasada sin trocear.
- Agentes de codificación con herramientas: la model card valida un bucle de lectura de skills, selección de referencias y respuesta JSON; encaja en asistentes que consultan índices y APIs. Conviene monitorizar el límite de lecturas por prompt, ya que en Basalt se observaron sobrelecturas (9/12 frente a 12/12 en NInfer).
- Asistencia multimodal sobre capturas o diagramas: al incluir torre de visión, puede responder preguntas sobre imágenes junto a texto en el mismo contexto.
- Razonamiento eficiente en producción: el fine-tune reduce el gasto de tokens (0,56× frente al pack QUASAR de Qwen3.8-27B base en el set de eficiencia) y completa tareas en aproximadamente la mitad de tiempo de reloj, lo que abarata tareas de razonamiento por lotes.
- Despliegue en estación de trabajo con GPU de consumo: cabe en una RTX 5090 de 32 GB con contexto de 224.000 tokens, lo que permite prototipar agentes localmente sin clúster.
- Servicio de chat con API compatible: Basalt expone endpoints OpenAI y Anthropic en el puerto 8080, lo que facilita sustituir backends en aplicaciones existentes sin reescribir el cliente.
- Evaluación comparativa de motores de inferencia: sirve como banco de pruebas para medir diferencias de prefill y decodificación entre Basalt y NInfer sobre pesos idénticos.

## Benchmarks y rendimiento

Mediciones aportadas en la model card sobre RTX 5090 (Windows, Basalt 0.5.6, un slot, `--kv int8`, 245.760 de contexto, drafting activo), comparadas con los mismos pesos en NInfer:

| Metrica | NInfer | Basalt |
|---|---:|---:|
| Prefill 10,8k (tok/s) | 9.860 | 13.078 |
| Prefill 43,6k (tok/s) | 7.150 | 10.336 |
| Prefill 172,3k (tok/s) | 2.910 | 5.926 |
| Time to first token a 172k | 59,3 s | 29,1 s |
| Decode greedy (tok/s) | 157–187 | 164–196 |
| Pasos de modelo por segundo | 57,7–63,5 | 64,8–65,9 |
| Tareas calificadas | 12/12 | 12/12 |
| Prompts abiertos terminados a 6.000 | 15/18 | 15/18 |

Conjunto de eficiencia (14 tareas × 4 semillas, tope 32.768, temperatura 1.0, top_p 0.95, top_k 20):

| Metrica | NInfer | Basalt |
|---|---:|---:|
| Tareas calificadas | 43/44 | 43/44 |
| Tokens de salida en 56 ejecuciones | 110.147 | 108.426 |
| Ejecuciones que alcanzan el tope | 0 | 0 |
| Decode muestreado (tok/s, ponderado por token) | 274 | 264 |
| Tiempo de reloj de la fase | 406 s | 416 s |

Bucle agéntico (12 ejecuciones por agente, thinking desactivado, configuración de 224.000):

| Configuracion | Agente A | Agente B |
|---|---|---|
| Swift 1.5 en NInfer | 12/12 | 12/12 |
| Swift 1.5 en Basalt | 9/12 (3 sobrelecturas) | 9/12 (3 sobrelecturas) |
| Pack QUASAR de Basalt | 11/12 | 7/12 (4 sobrelecturas) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos anteriores son pruebas internas del autor y, según advierte la propia model card, la suite de calidad es un smoke test para detectar daños, no para clasificar modelos.

## Requisitos de hardware

- VRAM estimada: 18,4 GiB en tarjeta para el fichero, más 2,4 GiB de embedding BF16 en RAM paginada. El fichero completo pesa 22,1 GiB.
- GPU recomendadas: NVIDIA Blackwell sm_120. Validado en RTX 5090 (32 GB). No hay datos de funcionamiento en A100, H100 ni generaciones anteriores, y la model card indica que Basalt requiere Blackwell.
- Cabe en GPU de consumo: sí, en RTX 5090. En una tarjeta que además maneja escritorio (~1,6 GB), un slot a 262.144 tokens se rechaza por 216 MiB con `--kv int8` y 1 GiB de reserva; 245.760 y 224.000 arrancan. Una tarjeta headless o con menor reserva debería sostener los 262.144.
- Opciones de despliegue: motor Basalt (`basalt serve`), con APIs OpenAI y Anthropic en el puerto 8080. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: prefill de 13.078 tok/s a 10,8k, 10.336 a 43,6k y 5.926 a 172,3k; TTFT de 29,1 s a 172k; decode greedy de 164–196 tok/s y muestreado de 264 tok/s en el conjunto de eficiencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27B-Basalt | 27B | 262.144 | Basalt `.basalt` | swift-open-license-1.0 | Motor Basalt, Blackwell; prefill 2,04× a 172k frente a NInfer |
| Swift-1.5-Qwen3.8-27B-NInfer | 27B | 262.144 | NInfer | swift-open-license-1.0 (presumible) | Mismos pesos, motor NInfer; mejor resultado en bucle agéntico (24/24 frente a 18/24) |
| Pack QUASAR de Qwen3.8-27B (Basalt) | 27B | no disponible | Basalt | no disponible | Modelo base sin fine-tune; 0,56× más tokens y ~2× tiempo de reloj en el set de eficiencia que Swift 1.5 |

## Limitaciones y advertencias

- El bucle agéntico en Basalt incumple el límite de tres lecturas en 6 de 24 ejecuciones (una abrió 14 tarjetas). La model card atribuye el fallo al motor y no a los pesos, pero no lo ha aislado; en producción conviene imponer límites en el orquestador.
- La suite de calidad es un smoke test; no permite afirmar superioridad frente a otros modelos en tareas estándar.
- Las cifras de decodificación provienen de una sola pasada greedy por tema y las de NInfer son de un día anterior, por lo que la comparación no es estrictamente contemporánea.
- Solo se valida en GPUs Blackwell (sm_120); no hay datos de compatibilidad con A100, H100 ni GPUs de generaciones previas.
- El formato `.basalt` requiere el motor Basalt compilado con soporte `qwen35`; no es portable a vLLM, llama.cpp u Ollama sin conversión.
- La licencia swift-open-license-1.0 está etiquetada como `other`; deben revisarse sus términos antes de uso comercial.
- No se documentan idiomas soportados ni sesgos conocidos; el riesgo de alucinación no está cuantificado en la información disponible.
- Dos redondeos Q8_0 (proyecciones MTP y drafter) introducen una desviación mínima respecto al checkpoint original; el resto es bit a bit.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CaptainArni/Swift-1.5-Qwen3.8-27B-Basalt
- Modelo base (checkpoint NVFP4): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b-NVFP4
- Variante para NInfer: https://huggingface.co/CaptainArni/Swift-1.5-Qwen3.8-27B-NInfer
- Repositorio del motor Basalt: https://github.com/jesdga95/basalt
- Guía de compilación de Basalt: https://github.com/jesdga95/basalt/blob/main/docs/building.md
