# killy369/Ternary-Bonsai-2-27B-MTP-drafter-GGUF

## Resumen

El repositorio killy369/Ternary-Bonsai-2-27B-MTP-drafter-GGUF contiene un **cabezal de predicción multi-token (MTP) para decodificación especulativa**, no un modelo de lenguaje autónomo. Lo publica el desarrollador killy369 (killy-netsphere) y está diseñado exclusivamente para acelerar la inferencia de prism-ml/Ternary-Bonsai-2-27B-gguf, un modelo ternario multimodal de clase 27B derivado de Qwen3.8 27B, con pesos en {−1, 0, +1} sobre una base rotada y escalas de grupo en FP16, publicado por PrismML bajo licencia Apache 2.0.

El cabezal consta de un único bloque transformer (blk.64) más la propia cabeza de salida de Bonsai 2, con la rotación Hadamard plegada y el vocabulario de borrador podado de 248.320 a 64.000 tokens para abaratar el coste de cada propuesta. Propone hasta tres tokens por paso, que el modelo de 27B verifica en una sola pasada: los borradores aceptados salen prácticamente gratis. La coincidencia en datos de retención con los siguientes tokens del 27B es de 0,910 / 0,794 / 0,740 en profundidades 1 / 2 / 3.

Su relevancia práctica es concreta: permite duplicar el throughput de un 27B ternario sobre una GPU Pascal de 11 GB (GTX 1080 Ti), pasando de 42,6 a 86,4 tok/s en código con contexto de 32K, mediante una build parcheada de llama.cpp publicada por el mismo autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabezal MTP para decodificación especulativa: un bloque transformer (blk.64) más la cabeza de salida de Bonsai 2, rotación Hadamard plegada y vocabulario de borrador de 64.000 tokens (podado desde 248.320) |
| Parámetros totales | 2.031.895.552 (cifra declarada por HuggingFace a partir de safetensors); el fichero GGUF distribuido ocupa 1.055.253.344 bytes |
| Parámetros activos | No aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | Heredada del modelo base, hasta 262.144 tokens; las mediciones publicadas del cabezal se hacen a 32.768 tokens |
| Tipos de cuantización | El cabezal se distribuye en un único GGUF (tipo de cuantización del fichero no declarado). El modelo base se publica en PQ2_0 (ternario con escalas de grupo FP16) y PTQ1_0 |
| Idiomas soportados | No disponible (no documentados ni para el cabezal ni para el modelo base en la información disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El cabezal es un bloque transformer aislado que reutiliza la cabeza de salida del modelo base y opera sobre un vocabulario de borrador reducido a 64.000 tokens, lo que mantiene bajo el coste de cada propuesta. La rotación Hadamard del base se pliega en el cabezal, y la salida se restringe a ese vocabulario podado. El entrenamiento es **on-policy sobre las propias generaciones de Bonsai 2**, con el enmascaramiento exacto usado en tiempo de inferencia; la ronda final añadió 8.949 respuestas y 5,4 millones de tokens. No se documentan RLHF, DPO ni otras fases de alineamiento específicas para el cabezal.

La innovación clave es la integración nativa en llama.cpp mediante `--spec-type draft-mtp`: el cabezal propone hasta tres tokens y el modelo de 27B los verifica en una única pasada, de modo que los aciertos no cuestan cómputo adicional. Los valores ajustados son `--spec-draft-n-max 3` y `--spec-draft-p-min 0.4`; profundidades mayores cuestan más de verificar de lo que devuelven en la GTX 1080 Ti de referencia. El cabezal exige una build parcheada (Pascal patch); el fork estándar de PrismML lo rechaza con el error `prism.hadamard: weight 'blk.64.nextn.shared_head_head.weight' is not on a verified Hadamard-aware matmul path`.

## Capacidades

- Predicción multi-token: genera hasta tres tokens borrador por paso de decodificación, verificados en una sola pasada por el modelo de 27B.
- Aceleración de decodificación en llama.cpp: multiplica el throughput del modelo base (hasta 2,3x en matemáticas y 2x en código sobre GTX 1080 Ti).
- Coincidencia alta con el modelo verificador: 0,910 / 0,794 / 0,740 en profundidades 1 / 2 / 3 sobre datos de retención.
- Tasa de aceptación dependiente del contenido: aproximadamente 0,77 en código y 0,57 en prosa.
- Integración con llama-server: soporta `--backend-sampling`, `--jinja` y plantillas de chat del modelo base.
- Herencia indirecta de las capacidades del base (multimodal con entrada de visión, razonamiento y uso agéntico), aunque el cabezal en sí solo se documenta para la ruta de decodificación de texto.
- No soporta generación autónoma de texto: sin el modelo de 27B no produce salidas utilizables.
- Especificidad estricta: solo funciona con la variante PQ2_0 de prism-ml/Ternary-Bonsai-2-27B-gguf.

## Casos de uso

- **Servido local en GPU Pascal antigua**: desplegar un 27B ternario en una GTX 1080 Ti con contexto de 32K y obtener 86,4 tok/s en código, frente a los 42,6 tok/s de la decodificación plana. Es el escenario para el que se entrenó y midió el cabezal.
- **Autocompletado de código en IDE**: la tasa de aceptación en código (~0,77) es la más alta medida, de modo que el cabezal rinde mejor en flujos de generación de código que en texto libre, con latencia baja por token.
- **Resumen de documentos largos**: con 30K de los 32K tokens de contexto ocupados mantiene 53,4 tok/s (frente a 34,1 sin cabezal), suficiente para resumir documentos extensos en hardware de 11 GB.
- **Aceleración de endpoints con poca concurrencia**: las mediciones se hicieron con una petición simultánea y `-np 1`, que es el régimen típico de asistentes personales o herramientas internas de un solo usuario.
- **Investigación en decodificación especulativa**: el cabezal es un caso reproducible de entrenamiento on-policy de un draft head sobre las generaciones del propio modelo verificador, útil para estudiar tasas de aceptación por dominio y profundidad.
- **Generación de código en pipelines por lotes**: combinado con `llama-server` y tool calling del modelo base, permite procesar lotes de tareas de programación en una GPU de gama antigua sin recurrir a hardware más caro.
- **Despliegue con presupuesto de VRAM ajustado**: el cabezal añade 1,06 GB sobre los 6,70 GiB del base en PQ2_0, una sobrecarga pequeña comparada con la ganancia de velocidad.
- **Prototipado de asistentes conversacionales locales**: con `reasoning_effort: "medium"` en la plantilla del base, se puede servir un asistente con contexto largo y velocidades interactivas en una única GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos publicados son de coincidencia con el verificador y de velocidad.

| Métrica | Valor |
|---|---|
| Coincidencia con los siguientes tokens del 27B, profundidad 1 | 0,910 |
| Coincidencia con los siguientes tokens del 27B, profundidad 2 | 0,794 |
| Coincidencia con los siguientes tokens del 27B, profundidad 3 | 0,740 |
| Aceptación en vivo, código | ~0,77 |
| Aceptación en vivo, prosa | ~0,57 |

Velocidad medida en GTX 1080 Ti 11 GB, contexto 32K, KV en f16, sin pantalla conectada, memoria a +1000 MHz (6003 MHz bajo carga CUDA), una petición simultánea y build con parche Pascal:

| Escenario | Con cabezal (tok/s) | Sin cabezal (tok/s) |
|---|---|---|
| Código (chat, greedy, 300 tokens) | 86,4 | 42,6 |
| Prosa | 64,3 | No disponible |
| Matemáticas | 98,4 | No disponible |
| Resumen, 2K de contexto ocupado | 75,0 | 41,7 |
| Resumen, 30K de contexto ocupado | 53,4 | 34,1 |

## Requisitos de hardware

- VRAM del cabezal: 1,06 GB para el fichero GGUF `mtp-bonsai2-native-v5b-dv64k.gguf` (1.055.253.344 bytes).
- VRAM total del conjunto: 6,70 GiB del base en PQ2_0 (5,53 GiB en PTQ1_0) más el cabezal y la caché KV en f16; medido funcionando dentro de los 11 GB de una GTX 1080 Ti con contexto de 32K.
- GPU validadas: GTX 1080 Ti 11 GB (Pascal) con la build parcheada. Para el modelo base, el espejo en Ollama reporta 135,41 tok/s de decodificación y 3.802,74 tok/s de prefill en una RTX 5090.
- Cabe en GPU de consumo: sí, en GTX 1080 Ti de 11 GB y presumiblemente en cualquier GPU con al menos 11 GB, aunque solo hay mediciones publicadas para Pascal con el parche.
- Opciones de despliegue: `llama-server` del fork con parche Pascal, invocado con `--spec-type draft-mtp -md mtp-bonsai2-native-v5b-dv64k.gguf --spec-draft-n-max 3 --spec-draft-p-min 0.4`, más `GGML_CUDA_ROWLANE=1` y `GGML_CUDA_RL_N4_LONG=1`. El modelo base también se distribuye para CUDA, Metal y CPU a través del fork de PrismML; el cabezal no está documentado para Metal ni CPU.
- Restricción de compatibilidad: el fork estándar de PrismML no carga este cabezal.
- Latencia y throughput: los tok/s de la tabla anterior. No se publican percentiles de latencia ni mediciones con concurrencia superior a uno.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este cabezal (killy369/Ternary-Bonsai-2-27B-MTP-drafter-GGUF) | Cabezal MTP para decodificación especulativa | 2.031.895.552 según HuggingFace; GGUF de 1,06 GB | Hereda 262K del base; medido a 32K | 1,5x a 2,3x sobre decodificación plana en GTX 1080 Ti | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| prism-ml/Ternary-Bonsai-2-27B-gguf (modelo base sin cabezal) | Modelo ternario multimodal, atención híbrida | Clase 27B | 262.144 tokens | 42,6 tok/s en código en GTX 1080 Ti; 135,41 tok/s en RTX 5090 | Apache-2.0 | HuggingFace y espejo en Ollama |
| ProCreations/Ternary-Bonsai-2-27B-MTP | Derivado MTP del mismo base | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| Medusa, EAGLE-2/EAGLE-3 y decodificación por n-gramas | Cabezales y métodos de decodificación especulativa genéricos | No disponible | No disponible | No disponible | No disponible | No incluidos en la información disponible |

El cabezal no es comparable en capacidades con un modelo generativo: su única función es proponer tokens para que otro modelo los verifique. Frente a los cabezales genéricos tipo Medusa o EAGLE, la diferencia documentada es el entrenamiento on-policy sobre las generaciones del propio verificador y la integración específica con la ruta Hadamard de Bonsai 2; no hay datos comparativos de rendimiento entre ambos enfoques en la información disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: sin prism-ml/Ternary-Bonsai-2-27B-gguf (PQ2_0) no genera nada utilizable.
- Compatibilidad restringida: exige la build con parche Pascal del autor. El fork estándar de PrismML lo rechaza por la ruta Hadamard no verificada, lo que rompe despliegues basados en builds upstream.
- Aceleración desigual: la aceptación cae a ~0,57 en prosa frente a ~0,77 en código, de modo que el beneficio depende fuertemente del dominio.
- Degradación con contexto lleno: 53,4 tok/s con 30K de 32K ocupados, frente a 75,0 tok/s con solo 2K ocupados.
- Profundidad limitada: tres tokens con `--spec-draft-p-min 0.4` son el óptimo en la GPU medida; valores mayores reducen el rendimiento neto.
- Condiciones de medición irrepetibles en producción: sin pantalla, memoria overclockeada a +1000 MHz, una única petición concurrente y `-np 1`. Los tok/s no deben extrapolarse a servidores con carga concurrente.
- Fricción en la plantilla de chat: es obligatorio enviar `reasoning_effort: "medium"`, porque el valor por defecto es `xhigh` y `"high"` devuelve HTTP 500.
- Riesgo de alucinación: el cabezal no genera contenido propio, pero hereda íntegramente los sesgos y las alucinaciones del modelo de 27B subyacente cuando este acepta borradores incorrectos.
- Idiomas no documentados: no consta qué lenguas cubre el vocabulario de borrador de 64.000 tokens ni si la poda penaliza idiomas con tokenización más fragmentada.
- Multimodalidad no cubierta: el base acepta visión, pero la información disponible no documenta si el cabezal acelera la ruta multimodal.
- Madurez: repositorio con 0 descargas y 0 likes, autor único, sin benchmarks estándar publicados y sin validación independiente.
- Licencia: Apache-2.0, uso comercial permitido; el cabezal es un derivado del modelo de PrismML y conviene mantener la atribución a PrismML que figura en la ficha.
- Trazabilidad: la ficha atribuye el entrenamiento, la exportación y las mediciones a Claude (Anthropic) por encargo de @killy-netsphere, pero no publica detalles del dataset, hiperparámetros ni receta completa.

## Enlaces

- Repositorio del cabezal: https://huggingface.co/killy369/Ternary-Bonsai-2-27B-MTP-drafter-GGUF
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Build parcheada de llama.cpp para Pascal: https://github.com/killy-netsphere/bonsai2-1080ti
- Perfil del autor: https://github.com/killy-netsphere
- Documentación de Ternary Bonsai 2 27B: https://docs.prismml.com/bonsai-2-27b
- Anuncio de lanzamiento de Bonsai 2 27B: https://prismml.com/news/prismml-launches-bonsai-2-27b
- Nota técnica sobre la compresión ternaria: https://prismml.com/news/bonsai-2-27b
- Derivado MTP alternativo: https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-MTP/tree/main
- Espejo del modelo base en Ollama: https://ollama.com/tobestyledintro/Ternary-Bonsai-2-27B
