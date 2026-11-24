# Alberto-Codes/gemma-4-31B-it-fit24gib-GGUF

## Resumen

`gemma-4-31B-it-fit24gib-GGUF` es una cuantización GGUF de precisión mixta del modelo multimodal `google/gemma-4-31B-it`, publicada por el usuario independiente Alberto-Codes bajo el proyecto vramfit. No es un modelo nuevo: es un empaquetado optimizado del checkpoint QAT sin cuantizar de Google, con el objetivo explícito de servir texto e imágenes dentro de una tarjeta gráfica de 24 GiB de VRAM. El modelo base es un transformer multimodal de 30.697.345.596 parámetros (aproximadamente 31B) con capacidades de image-text-to-text.

La aportación técnica del pack no es una única receta de cuantización, sino una asignación de bits por capa guiada por la medición del daño de cuantización de cada capa del decodificador (el desplazamiento en la distribución de salida al cuantizar esa capa). Bajo esa restricción de presupuesto, el resultado ocupa 14,92 GiB en el decodificador y 629 MiB en el proyector de visión, frente a los 16,44 GiB del GGUF QAT Q4_0 oficial de Google, con calidad de texto medida comparable y menor divergencia condicionada por visión.

Es relevante porque demuestra una vía práctica para ganar contexto en hardware de consumo: en una RTX 4090 con llama.cpp b10362, el pack sirve 86.016 tokens en modo solo texto (frente a 65.536 del QAT Q4_0) y 73.728 tokens con una imagen a bordo (frente a 49.152). La licencia declarada es Apache 2.0, aunque el modelo base remite a la licencia propia de Gemma 4 de Google.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (decodificador de lenguaje + torre de visión con proyector), según el modelo base; detalles internos no disponibles |
| Parámetros totales | 30.697.345.596 (dato de safetensors del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Hasta 86.016 tokens solo texto y 73.728 con una imagen, medidos en RTX 4090 (24 GiB) con llama.cpp b10362, `-ngl 99 -np 1`; contexto nativo del modelo base no disponible |
| Tipos de cuantización | GGUF de precisión mixta: 150 tensores Q5_0, 13 Q8_0, 27 F16 y 166 F32, a 9,16 bits efectivos por parámetro; sidecar de visión convertido con receta Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google: https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | GGUF (dos ficheros: decodificador de 14,92 GiB y proyector de 629 MiB) |

## Arquitectura y entrenamiento

El pack deriva de `google/gemma-4-31B-it-qat-q4_0-unquantized`, el checkpoint de entrenamiento con cuantización consciente (QAT) sin cuantizar de Gemma 4 31B instruct. La arquitectura subyacente es la del modelo base de Google: un transformer multimodal con decodificador de lenguaje y torre de visión conectada mediante un proyector, orientado a tareas image-text-to-text. No se dispone en la información proporcionada de detalles sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

La innovación del pack es el método de asignación de bits: vramfit midió el daño de cuantización de cada capa del decodificador (el cambio en la distribución de salida al cuantizarla) y distribuyó el presupuesto de bits en consecuencia, empaquetando después con el cuantizador de llama.cpp. El sidecar de visión se convirtió desde el proyector del proveedor con la receta Q4_K_M de `llama-quantize`; según el autor, iguala al sidecar BF16 en KLD por clase de contenido (0,0050 frente a 0,0045, con 99,2 % de acuerdo en el token superior en ambos casos) y libera 4.096 tokens de contexto. El marcador `fit24gib` es una afirmación de despliegue verificada con una prueba de servicio real dentro de un límite de 24 GiB de VRAM, no una etiqueta de tamaño de fichero.

## Capacidades

- Generación de texto conversacional multi-turno, con etiqueta `conversational` y compatibilidad con endpoints.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`): requiere cargar el decodificador y el sidecar del proyector; el servicio solo texto necesita únicamente el decodificador.
- Razonamiento y matemáticas: avalado por resultados medidos en MMLU (71,36 ± 0,37) y GSM8K (92,34 ± 0,73 en exact match estricto).
- Comprensión lectora y sentido común: HellaSwag 58,71 ± 0,49 (acc_norm) y Winogrande 68,27 ± 1,31.
- Razonamiento científico de opción múltiple: ARC-Challenge 61,77 ± 1,42 (acc_norm).
- Contexto largo: hasta 86.016 tokens en solo texto y 73.728 con una imagen en una GPU de 24 GiB.
- Soporte de tool calling, function calling, agentes y modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos en una sola GPU de 24 GiB: con 86.016 tokens de contexto medidos en solo texto, el pack permite ingerir contratos, informes o expedientes completos sin fragmentación ni recuperación externa, algo que el QAT Q4_0 oficial no alcanza en la misma tarjeta (65.536 tokens).
- Asistencia sobre capturas, diagramas o documentos escaneados: cargando decodificador y sidecar, el modelo acepta una imagen junto a 73.728 tokens de contexto, útil para responder preguntas sobre planos técnicos, interfaces de usuario o tablas escaneadas con texto de apoyo largo.
- Despliegue local en estación de trabajo con RTX 4090: el pack está verificado con llama.cpp b10362 y `-ngl 99 -np 1` dentro de 24 GiB, lo que permite ofrecer un asistente privado sin coste de API ni envío de datos a terceros.
- Evaluación de calidad de cuantizaciones: los sidecars de evaluación incluidos (resultados por tarea de lm-evaluation-harness 0.4.12) y las métricas de PPL y KLD permiten reproducir la comparación frente al QAT Q4_0 y validar el compromiso tamaño/calidad en un pipeline propio.
- Razonamiento aritmético y resolución de problemas en producción: con 92,34 de exact match estricto en GSM8K, es adecuado para validación de cálculos, generación de explicaciones paso a paso y comprobación de resultados en flujos internos.
- Servicio conversacional con endpoints compatibles: la etiqueta `endpoints_compatible` facilita integrarlo en infraestructuras que ya hablan el protocolo de endpoints habituales, con una sola GPU consumer.
- Base para ajuste fino o destilación sobre hardware limitado: al ocupar 14,92 GiB el decodificador, deja margen de VRAM para caché KV y para herramientas auxiliares en tarjetas de 24 GiB.

## Benchmarks y rendimiento

Calidad de texto medida sobre el corpus de calibración enmarcado (357 bloques de texto de dominio público, 182.404 tokens, 356 fragmentos con n_ctx 512), con llama-perplexity solo CPU compilado desde b10362 y `parse_special` activado. Menor es mejor en PPL y KLD.

| Modelo | Tamaño | PPL ↓ | PPL / BF16 ↓ | KLD medio ↓ | Mismo top ↑ |
|---|---|---|---|---|---|
| Referencia BF16 | 57,20 GiB | 35,0668 | — | — | — |
| Este pack | 14,92 GiB | 37,4552 | 1,0681 ± 0,0027 | 0,0446 ± 0,0004 | 92,04 % |
| QAT Q4_0 | 16,44 GiB | 38,7227 | 1,1043 ± 0,0029 | 0,0420 ± 0,0003 | 92,32 % |

Benchmarks retenidos con lm-evaluation-harness 0.4.12 sobre llama-cpp-python 0.3.34 con librerías Vulkan b10362, splits completos y sin límite de muestreo. Una diferencia dentro del error estándar combinado se considera empate.

| Tarea (shots, métrica) | Este pack | QAT Q4_0 | Δ | σ combinada | Veredicto |
|---|---|---|---|---|---|
| MMLU (5, acc) | 71,36 ± 0,37 | 70,20 ± 0,38 | +1,15 | 0,53 | victoria |
| GSM8K (5, exact match estricto) | 92,34 ± 0,73 | 92,42 ± 0,73 | −0,08 | 1,03 | empate |
| HellaSwag (10, acc_norm) | 58,71 ± 0,49 | 59,34 ± 0,49 | −0,63 | 0,69 | empate |
| Winogrande (5, acc) | 68,27 ± 1,31 | 68,03 ± 1,31 | +0,24 | 1,85 | empate |
| ARC-Challenge (25, acc_norm) | 61,77 ± 1,42 | 61,09 ± 1,42 | +0,68 | 2,01 | empate |

Contexto máximo servido en RTX 4090 (24 GiB), llama.cpp b10362, `-ngl 99 -np 1`, medido el 2026-08-31 en escalones de 4.096 tokens:

| Forma de servicio | Este pack | QAT Q4_0 | Ganancia |
|---|---|---|---|
| Solo texto, carga máxima medida | 86.016 tokens | 65.536 tokens | +20.480 (+31,25 %) |
| Con una imagen, carga máxima medida | 73.728 tokens | 49.152 tokens | +24.576 (+50 %) |

Con el mismo proyector BF16, este pack sirve una imagen a 69.632 tokens frente a 49.152 del QAT (+41,7 %); la conversión del sidecar añade los últimos 4.096 tokens.

## Requisitos de hardware

- VRAM estimada: 14,92 GiB para el decodificador y 629 MiB adicionales para el proyector de visión; el pack está verificado sirviendo dentro de un límite de 24 GiB de VRAM.
- GPU recomendadas: RTX 4090 (24 GiB) es la plataforma de referencia de las mediciones; por capacidad de VRAM son equivalentes o superiores A100 40/80 GB, H100 y L40S.
- GPU consumer: cabe en tarjetas de 24 GiB (RTX 4090, RTX 3090) y, con margen más ajustado, en 16 GiB solo para texto con contexto reducido (no verificado en la información disponible).
- Opciones de despliegue: llama.cpp (versión b10362 usada en las mediciones), llama-cpp-python 0.3.34 y backends compatibles con GGUF; soporta endpoints compatibles. Soporte en vLLM, TGI u Ollama no disponible.
- Latencia y throughput: no disponibles; las mediciones publicadas son de contexto máximo servido y de calidad, no de velocidad de generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto servido (24 GiB) | Tamaño en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este pack | 30,7B | 86.016 (texto) / 73.728 (una imagen) | 14,92 GiB + 629 MiB | apache-2.0 | Hugging Face, GGUF |
| google/gemma-4-31B-it-qat-q4_0-gguf | 30,7B | 65.536 (texto) / 49.152 (una imagen) | 16,44 GiB | licencia Gemma 4 | Hugging Face, GGUF oficial |
| google/gemma-4-31B-it-qat-q4_0-unquantized | 30,7B | no disponible | no disponible | licencia Gemma 4 | Hugging Face, checkpoint QAT |
| google/gemma-4-31B-it | 30,7B | no disponible | 57,20 GiB (referencia BF16) | licencia Gemma 4 | Hugging Face, safetensors |

Frente al QAT Q4_0 oficial, este pack ocupa 1,52 GiB menos, empata en cuatro benchmarks y gana en MMLU (+1,15, fuera del error combinado), pero pierde ligeramente en KLD medio (0,0446 frente a 0,0420) y en acuerdo de token superior (92,04 % frente a 92,32 %). Frente a la referencia BF16, la pérdida de perplejidad relativa es de 1,0681.

## Limitaciones y advertencias

- El corpus de calibración y la matriz de importancia son el mismo conjunto de texto, por lo que las métricas de PPL y KLD de esta ficha no son una evaluación sobre datos retenidos; los benchmarks de lm-evaluation-harness sí lo son y deben usarse como árbitro.
- El KLD medio y el acuerdo de token superior son ligeramente peores que los del QAT Q4_0 oficial, pese a la ventaja en MMLU y en tamaño.
- La comparación de contexto con imagen frente al QAT Q4_0 mueve dos variables a la vez (decodificador y sidecar); la comparación de una sola variable es la que usa el mismo proyector BF16 (69.632 frente a 49.152 tokens).
- Las cifras de contexto máximo dependen de la configuración exacta (llama.cpp b10362, `-ngl 99 -np 1`, RTX 4090, 2026-08-31); otros backends, versiones o cargas de VRAM pueden reducirlas.
- La licencia del repositorio se declara apache-2.0, pero el modelo base remite a la licencia de Gemma 4 de Google; conviene revisar sus términos antes de uso comercial, ya que pueden imponer restricciones adicionales.
- No hay información publicada sobre sesgos, tasas de alucinación, cobertura idiomática ni comportamiento en tool calling o modo thinking; no deben asumirse.
- El pack tiene 411 descargas y 1 like en el momento de la ficha: es un artefacto de la comunidad, no una publicación oficial de Google, y no cuenta con el mismo nivel de validación externa.
- El sidecar de visión cambió de BF16 a Q4_K_M el 2026-08-31; versiones anteriores del repositorio pueden tener comportamiento distinto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Alberto-Codes/gemma-4-31B-it-fit24gib-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Checkpoint QAT sin cuantizar: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- GGUF QAT Q4_0 oficial: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-gguf
- Proyecto vramfit: https://github.com/Alberto-Codes/vramfit
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
