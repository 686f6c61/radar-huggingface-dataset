# root-sys-n/Mima-1.5-Pico-15m

## Resumen

Mima 1.5 Pico 15M es un modelo de lenguaje de tipo transformer decoder-only, extremadamente compacto, desarrollado por root-sys-n como una versión afinada (SFT) del modelo base Mima 1 Pico 15M. Está especializado en turco y orientado a generación de texto conversacional, diálogo multi-turno y llamada ligera de herramientas mediante una sintaxis propia (`@arac:`). Con 18.683.520 parámetros totales (15,54M excluyendo embeddings), 7 capas, dimensión oculta de 384 y una ventana de contexto de 512 tokens, se posiciona como un modelo de bolsillo para despliegue en entornos con recursos mínimos, incluido navegador vía ONNX/WASM.

El modelo parte del checkpoint base Mima 1 Pico 15M y se afina sobre el conjunto de datos abierto Mima-TR-SFT-30K, un corpus de SFT en turco depurado, durante 3 épocas (~4,08M tokens). La relevancia actual reside en su tamaño reducido (repo de 0,1 GB), su licencia Apache 2.0 y la disponibilidad de pesos en safetensors y ONNX FP16 (37,53 MB), lo que permite inferencia en CPU y en el navegador. No obstante, sus resultados en benchmarks estándar en turco se sitúan en muchos casos cerca del nivel de azar, lo que delimita su uso a tareas muy acotadas.

La ficha se basa exclusivamente en la información publicada en Hugging Face por el autor. No se dispone de detalles sobre la composición exacta del dataset de entrenamiento más allá de su nombre y tamaño aproximado en tokens, ni de información sobre procesos de RLHF o DPO.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (7 capas, d=384, SwiGLU, RoPE, RMSNorm) |
| Parámetros totales | 18.683.520 (15,54M excluyendo embeddings) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | FP16-ONNX disponible (37,53 MB); no se documentan otras cuantizaciones (GGUF, INT8, etc.) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (FP16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 7 capas con dimensión oculta de 384, activación SwiGLU, codificación posicional rotatoria (RoPE) y normalización RMSNorm. El vocabulario es un BPE turco de 8.192 tokens y la ventana de contexto es de 512 tokens. El modelo totaliza 18,68M parámetros, de los cuales 15,54M corresponden a pesos no de embedding. El autor indica que el modelo requiere `trust_remote_code=True` y un tokenizador cargado por separado desde `tokenizer.json`.

El entrenamiento consistió en un ajuste supervisado (SFT) sobre el modelo base Mima 1 Pico 15M usando el dataset Mima-TR-SFT-30K, con 3 épocas y aproximadamente 4,08M tokens. Se empleó un schedule de learning rate con warmup a 1,5e-4 seguido de decaimiento coseno, totalizando 2.865 pasos de optimización. Las curvas de validación (N=944) muestran una pérdida CE de 2,0954 (PPL 8,13) al final de la época 1, 1,9311 (PPL 6,90) en la época 2 y 1,9153 (PPL 6,79) en la época 3, con una brecha creciente respecto a la pérdida de entrenamiento (1,4652, PPL 4,33), lo que sugiere cierto sobreajuste al final del proceso. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación adicionales.

## Capacidades

- Generación de texto conversacional en turco, con formato de diálogo multi-turno mediante tokens especiales (`<bos>`, `<user>`, `<asst>`, `<end>`).
- Llamada ligera de herramientas mediante la sintaxis propietaria `@arac:`, con soporte para funciones predefinidas como `hesapla` (calculadora), `hava` (meteorología), `web_ara` (búsqueda web), `saat` (hora), `kur` (tipo de cambio), `not_ekle` (notas) y `cevir` (traducción).
- Rechazo de preguntas trampa o sin respuesta plausible: en la evaluación conductual alcanza un 82,0% de rechazo correcto en modo greedy (N=100).
- Control de repetición: la tasa de bucles repetitivos se reduce al 3,0% (greedy) y al 2,0% (muestreo con t=0,3, k=5).
- Capacidad limitada de comprensión lectora y lógica básica en turco, con resultados por encima del azar en el benchmark propio Mima-TR-MicroBench (37,70% general en formato de frase frente al 25% aleatorio).
- No se documentan capacidades de visión, audio, agentes autónomos de múltiples pasos ni razonamiento extendido (thinking mode).

## Casos de uso

- Chatbot de bolsillo en turco para webs o aplicaciones móviles: con 18,68M de parámetros y pesos ONNX FP16 de 37,53 MB, el modelo puede ejecutarse en el navegador vía WASM sin backend, gestionando conversaciones multi-turno de hasta 512 tokens.
- Enrutamiento ligero de intenciones con llamada de herramientas: el modelo puede decidir qué función invocar (`hava`, `hesapla`, `kur`, etc.) a partir de una consulta en turco y emitir la llamada en formato `@arac:`, integrándose en un orquestador que ejecute la función real.
- Asistente de atención al cliente para consultas simples y acotadas: respuestas a preguntas frecuentes, horarios, tipos de cambio o cálculos básicos, donde el contexto de 512 tokens es suficiente para un intercambio breve.
- Filtro de preguntas no respondibles: gracias a su tasa de rechazo del 82% en preguntas trampa, puede usarse como primera capa para derivar consultas sin respuesta a un humano o a un modelo mayor.
- Prototipado y docencia: modelo de referencia para experimentar con arquitecturas transformer pequeñas, tokenización BPE turca y pipelines de SFT, con un coste computacional mínimo y dataset de entrenamiento abierto.
- Generación de texto corto en entornos embebidos o sin conectividad: al caber en CPU y en dispositivos de recursos limitados, puede emplearse para completar plantillas, generar respuestas breves o resúmenes de una frase en turco.
- Pruebas de concepto de diálogo multi-turno: el formato de tokens especiales permite experimentar con gestión de historial conversacional en un modelo de 512 tokens de contexto.

## Benchmarks y rendimiento

Resultados publicados por el autor. La columna "Mima 1 Pico" corresponde al modelo base; "Mima 1.5 Preview" a una versión intermedia de 8K; "Mima 1.5 Pico (Final)" al modelo descrito.

Pruebas conductuales (N=100, intervalo de confianza Wilson al 95%):

| Prueba | Mima 1 Pico (base) | Mima 1.5 Preview (8K) | Mima 1.5 Pico Final (greedy) | Mima 1.5 Pico Final (t=0,3, k=5) |
|---|---:|---:|---:|---:|
| Rechazo de trampas (alto = mejor) | 0,0% | 71,0% / 60,0% | 82,0% (73,3–88,3%) | 77,0% (67,8–84,2%) |
| Bucles de repetición (bajo = mejor) | 21,0% | 0,0% / 3,0% | 3,0% (1,0–8,5%) | 2,0% (0,6–7,0%) |
| Falso rechazo (bajo = mejor) | 0,0% | 9,0% / 7,0% | 3,0% (1,0–8,5%) | 3,0% (1,0–8,5%) |

Mima-TR-MicroBench v1 (2.000 preguntas, 400 por categoría, azar 25%):

| Categoría | Mima 1 Pico | Mima 1.5 Preview | Mima 1.5 Pico (Final) |
|---|---:|---:|---:|
| Comprensión lectora (`okudugunu_anlama`) | 41,25% | 39,75% | 44,00% |
| Turco y ortografía (`turkce_dil_ve_yazim`) | 47,25% | 44,00% | 43,00% (ABCD 28,25%) |
| Lógica y sentido común (`mantik_ve_sagduyu`) | 29,25% | 30,50% | 36,75% |
| Cultura general básica (`temel_genel_kultur`) | 36,50% | 34,25% | 35,00% |
| Aritmética y unidades (`aritmetik_ve_birim`) | 26,25% | 25,00% | 29,75% (bruto 30,50%) |
| General — `choices_sentence` (N=2.000) | 36,10% | 34,70% | 37,70% (35,6–39,8%) |
| General — letras A/B/C/D (N=2.000) | 25,20% | 24,85% | 25,85% (24,0–27,8%) |

Benchmarks estándar de opción múltiple en turco (escala 15,54M):

| Benchmark | Azar | Mima 1 Pico | Mima 1.5 Pico (Final) |
|---|---:|---:|---:|
| TruthfulQA-TR MC1 (`acc_norm`, N=817) | 22,61% | 27,42% | 29,99% (MC2 norm 44,06%) |
| Belebele-TR (`acc` / `acc_norm`, N=900) | 25,00% | 28,67% norm | 28,89% acc / 26,78% norm |
| HellaSwag-TR (`acc_norm`, N=1.000) | 25,00% | 25,60% | 26,70% |
| ARC-TR (`acc_norm`, N=1.172) | 25,02% | 23,21% | 25,09% |
| TurkishMMLU (`acc_norm`, N=900) | 20,00% | 18,22% | 18,11% (nivel de azar) |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32; aproximadamente 40 MB en FP16/ONNX. Los pesos safetensors ocupan unos 75 MB (18,68M parámetros en FP32) y el modelo ONNX FP16 unos 37,53 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no requiere A100, H100 ni RTX 4090. Funciona en iGPU y en CPU.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 2060, RTX 3060, etc.) y en dispositivos de borde; también en navegador vía WASM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (formato documentado por el autor), ONNX Runtime (pesos FP16 disponibles) y despliegue en navegador mediante el Space oficial Mima Pico Chat. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño, se espera latencia de milisegundos en CPU moderna, pero no se han publicado cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables de la misma escala (15–20M parámetros) en turco en la información proporcionada. La comparativa se limita a las versiones del propio modelo:

| Modelo | Parámetros | Contexto | Licencia | Formatos | Resultado MicroBench (general) |
|---|---:|---:|---|---|---:|
| Mima 1 Pico 15M (base) | 18,68M | 512 | Apache 2.0 | safetensors | 36,10% |
| Mima 1.5 Preview (8K) | no disponible | 8.192 | Apache 2.0 | no disponible | 34,70% |
| Mima 1.5 Pico 15M (final) | 18,68M | 512 | Apache 2.0 | safetensors, ONNX | 37,70% |

No se identifican en la información disponible alternativas externas comparables (misma escala y mismo idioma) con datos publicados.

## Limitaciones y advertencias

- Rendimiento cercano al azar en varios benchmarks estándar: TurkishMMLU 18,11% (azar 20%), ARC-TR 25,09% (azar 25,02%), HellaSwag-TR 26,70% (azar 25%). No es adecuado para tareas que requieran conocimiento factual o razonamiento complejo.
- Ventana de contexto muy limitada (512 tokens), insuficiente para documentos largos, historiales extensos o tareas de recuperación aumentada.
- Sobreajuste probable: la pérdida de validación se estanca entre las épocas 2 y 3 (1,9311 → 1,9153) mientras la de entrenamiento cae de 1,7892 a 1,4652.
- Ejemplos de generación con errores factuales: en la model card, la respuesta sobre los planetas del sistema solar menciona "Püsküllü Satürn" y omite planetas; en la pregunta sobre qué compró Ayşe, responde que paseó por el parque. Riesgo alto de alucinación en preguntas de sentido común.
- Idioma único: solo turco. No se garantiza un comportamiento correcto en otros idiomas.
- Llamada de herramientas limitada a un conjunto fijo de funciones predefinidas y a una sintaxis propietaria (`@arac:`); no implementa el estándar OpenAI function calling ni esquemas JSON.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantías ni cláusulas de responsabilidad; el autor no documenta auditorías de sesgo.
- No se documentan sesgos específicos, pero al ser un modelo pequeño entrenado con un corpus limitado (~4,08M tokens de SFT), es probable que reproduzca sesgos presentes en los datos; no hay evaluación publicada al respecto.
- No recomendado para producción en tareas de alta precisión sin una capa de verificación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/root-sys-n/Mima-1.5-Pico-15m
- Modelo base: https://huggingface.co/root-sys-n/Mima-1-Pico-15m
- Dataset de SFT: https://huggingface.co/datasets/root-sys-n/Mima-TR-SFT-30K
- Benchmark turco: https://huggingface.co/datasets/root-sys-n/Mima-TR-MicroBench
- Demo en navegador (WASM, ONNX FP16): https://huggingface.co/spaces/root-sys-n/Mima-Pico-Chat
