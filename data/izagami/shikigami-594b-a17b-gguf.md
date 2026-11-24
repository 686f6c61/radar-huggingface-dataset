# izagami/Shikigami-594B-A17B-GGUF

## Resumen

Shikigami-594B-A17B-GGUF es una cuantización extrema de Inkling 2 Small, el modelo multimodal de tipo Mixture-of-Experts desarrollado por Thinking Machines. El modelo original cuenta con 594.000 millones de parámetros totales y 17.000 millones activos por token, seleccionando 8 expertos de un total de 384. Esta versión, publicada por el usuario izagami, comprime los pesos hasta aproximadamente 1,1 bits por parámetro mediante una combinación de poda de expertos, reducción de la dimensión intermedia y codificación en trellis inspirada en QTIP, logrando un archivo de 80 GB que cabe en equipos de 96 GB de memoria unificada.

La relevancia de esta ficha es doble. Por un lado, documenta un experimento técnico poco habitual: llevar un MoE de casi 600.000 millones de parámetros a un formato de 1 bit que pueda ejecutarse en hardware de consumo profesional, concretamente en GPUs Intel Arc Pro B70 y en el NVIDIA DGX Spark (GB10). Por otro, advierte de que el resultado no compensa en la mayoría de casos: según las mediciones del propio autor, el modelo pequeño de la misma familia (Inkling 2 Mini, 26B) supera a esta cuantización en precisión, velocidad y consumo de memoria.

El modelo acepta entradas de texto e imagen (pipeline image-text-to-text) y se distribuye bajo licencia Apache 2.0, aunque el uso queda sujeto a la Acceptable Use Policy de Thinking Machines. No es una distribución oficial y requiere forks específicos de llama.cpp o del motor XeStrata para cargarse, ya que los formatos estándar (llama.cpp upstream, Ollama, LM Studio) no reconocen sus archivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 384 expertos con 8 activos por token; encoder de visión ViT de 23 capas |
| Parametros totales | 594B (modelo original); 80.807.523.518 según safetensors del repo cuantizado |
| Parametros activos | 17B |
| Longitud de contexto | 16.384 tokens en la configuración de ejemplo del autor (no se documenta el máximo del modelo base) |
| Tipos de cuantizacion | TQ1 (~1,1 bits por peso, trellis QTIP); encoder de visión en BF16; draft model en Q8_0 |
| Idiomas soportados | No disponible (la model card incluye texto en japonés e inglés; no se detalla la cobertura) |
| Licencia | Apache 2.0, sujeta a la Acceptable Use Policy de Thinking Machines |
| Formato de pesos | GGUF con expertos en trellis propietario (`.tq` / `.tq_gain`), dividido en 10 archivos; `mmproj-BF16.gguf` para visión; draft model GGUF aparte |

## Arquitectura y entrenamiento

El modelo base, Inkling 2 Small, es un transformer disperso de tipo MoE con 384 expertos y enrutamiento top-8, lo que da 17.000 millones de parámetros activos sobre un total de 594.000 millones. Incorpora un encoder de visión de 23 capas (ViT) con proyector, y un modelo draft DSpark para decodificación especulativa (distribuido como `mtp.safetensors` en el repo original). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación de esta versión es el esquema de compresión. El autor poda los expertos menos utilizados de cada capa y reduce la dimensión intermedia de los restantes a 2.304, 1.728, 1.152 o 576, agrupados en `_g1`, `_g2`, etc. La selección de qué podar y cuánto reducir se optimiza minimizando el error de salida respecto al tamaño. Los expertos resultantes se almacenan como código trellis con desplazamiento de bits (estilo QTIP): cada tile de 256 pesos (16×16) se codifica en trellis, alcanzando ~1,1 bits por peso. El router se trunca a los expertos conservados. El encoder de visión no se cuantiza y se mantiene en BF16.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo de pensamiento explícito (thinking), con nivel de esfuerzo configurable (`reasoning_effort: "none"` para desactivarlo).
- Entrada de imágenes: el encoder ViT procesa imágenes en parches de 40×40 píxeles (1 token por parche; imágenes de más de 1.024 parches se reescalan).
- Tool calling y ejecución de tareas con herramientas: el autor reporta 70/70 tareas de agente completadas en sus pruebas.
- Capacidades multilingües parciales, con presencia documentada de japonés e inglés.
- Decodificación especulativa mediante el draft model DSpark (hasta 3 tokens de especulación en la configuración de ejemplo).
- No se documentan capacidades de audio ni de vídeo.

## Casos de uso

- Experimentación con cuantización extrema en MoE: el modelo sirve como banco de pruebas para investigar poda de expertos, codificación trellis y el impacto de ~1 bit por peso en la calidad, comparando perplexity y precisión frente a cuantizaciones de 4 bits.
- Despliegue en hardware de memoria unificada de 96 GB: permite ejecutar un MoE de 594B en un DGX Spark (GB10) o en tres Intel Arc Pro B70, escenarios donde un modelo de ese tamaño en BF16 sería inviable.
- Procesamiento de documentos con imagen y texto: gracias al encoder ViT en BF16 y al pipeline image-text-to-text, puede emplearse para extracción de información de capturas, formularios o diagramas, siempre con validación humana.
- Agentes con tool calling en entornos controlados: las 70 tareas de agente completadas en las pruebas del autor sugieren viabilidad para flujos multi-paso, aunque con la advertencia de los bucles de razonamiento.
- Investigación sobre decodificación especulativa: la integración del draft DSpark y el vocabulario reducido a 32.768 tokens permiten estudiar el equilibrio entre velocidad y verificación en el modelo objetivo.
- Evaluación comparativa de familias MoE: útil para contrastar el comportamiento de un modelo grande cuantizado frente al modelo pequeño de la misma familia (Inkling 2 Mini) en tareas de razonamiento y código.
- No recomendado como base para producción de atención al cliente ni generación de código crítica, dado que el propio autor desaconseja su uso frente a Mini salvo interés experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de evaluación son los del autor:

| Metrica | Shikigami-594B-A17B (TQ1) | Inkling 2 Mini (26B) |
|---|---|---|
| Precisión en set de 45 problemas difíciles (temp. 0,8) | 40–41 aciertos | 43–45 aciertos |
| Tareas de agente completadas | 70/70 | 70/70 |
| Velocidad de generación (GB10) | 25 tok/s (sin draft); 21–34 tok/s (con DSpark) | 58 tok/s |
| Memoria necesaria | ~77 GB | ~20 GB |
| Perplexity (texto de prueba, fork llama.cpp) | 2,794 (vs. 2,793 en conversión propia) | No disponible |

Rendimiento en Intel Arc Pro B70 ×3 (XeStrata, decodificación greedy con DSpark): generación de 56 tok/s en código, 53 tok/s en agente y 42 tok/s en japonés; prefill de ~265 tok/s con prompt de 4.719 tokens. En GB10 con el fork de llama.cpp: prefill de 717–763 tok/s y decode de 21–34 tok/s.

## Requisitos de hardware

- VRAM/memoria estimada: ~77 GB en uso real (GB10); el archivo TQ1 ocupa 80,0 GB y el repo completo 413,7 GB. El encoder de visión añade 0,66 GB y el draft model 1,87 GB.
- GPU recomendadas: NVIDIA DGX Spark (GB10) con memoria unificada; 3× Intel Arc Pro B70 (32 GB cada una) más 89 GB de RAM del sistema, con todos los expertos en VRAM.
- No cabe en GPUs de consumo convencionales (RTX 4090, 24 GB) ni en configuraciones de 48 GB.
- Opciones de despliegue: exclusivamente forks específicos. Para Intel Arc, XeStrata rama `b70-local` (commit 4b1a8fbdb o posterior, backend SYCL); para GB10, fork de llama.cpp rama `ink2v` (tag `ink2v-20261123-0050`) o el port `gb10-port` de XeStrata. No funciona en llama.cpp upstream, Ollama, LM Studio ni Unsloth.
- Latencia y throughput: prefill de 265 tok/s (B70×3) y 461–763 tok/s (GB10); decode de 21–56 tok/s según plataforma y uso de decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Shikigami-594B-A17B-GGUF (TQ1) | 594B totales / 17B activos | 16.384 (config. ejemplo) | Apache 2.0 + AUP | GGUF con motor propietario | ~1,1 bits/peso, 80 GB, multimodal |
| Inkling 2 Small (original) | 594B / 17B activos | No disponible | Apache 2.0 + AUP | Pesos completos en HF | Referencia de calidad; requiere hardware muy superior |
| Inkling 2 Mini | 26B | No disponible | No disponible en la información | GGUF (p. ej. unsloth/Inkling-2-Mini-GGUF) | Mejor precisión, 58 tok/s y ~20 GB según el autor |
| Cuantizaciones de 4 bits de Inkling 2 Small | 594B / 17B activos | No disponible | Apache 2.0 + AUP | No detallada | Presentan también bucles de razonamiento según el autor; mayor tamaño que TQ1 |

## Limitaciones y advertencias

- Bucles de razonamiento: Inkling 2 tiende a repetir la misma verificación en su bloque de pensamiento, especialmente al depurar código. La cuantización agrava el problema (una vez entra en el bucle, cuesta más salir). Se mitiga con detección de repetición en el servidor (7 repeticiones de 20 caracteres en 400, o 4 de 48 en 2.400) o con `reasoning_effort: "none"`, que redujo los bucles de 8/20 a 2/20 en las pruebas del autor.
- Pérdida de calidad frente al modelo pequeño de la familia: en el set de 45 problemas difíciles, TQ1 acierta 40–41 frente a 43–45 de Mini. El autor recomienda usar Mini salvo interés explícito en el experimento.
- Compatibilidad restringida: no carga en llama.cpp upstream, Ollama, LM Studio ni Unsloth; requiere forks concretos y, en el caso de XeStrata, backend SYCL.
- Riesgo de alucinación inherente a un modelo de ~1 bit por peso; no se han publicado evaluaciones de sesgo ni de robustez.
- Cobertura de idiomas no documentada; la model card está en japonés e inglés, sin lista oficial de lenguas.
- Restricciones de uso: aunque la licencia es Apache 2.0, se aplica la Acceptable Use Policy de Thinking Machines; no es una distribución oficial del desarrollador original.
- Para producción se recomienda fijar límites de tokens de salida y usar el modelo con validación humana, dado el comportamiento de bucle y la falta de benchmarks estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/izagami/Shikigami-594B-A17B-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Repositorio XeStrata (rama b70-local): https://github.com/imagami3/XeStrata/tree/b70-local
- Port de XeStrata para GB10: https://github.com/imagami3/XeStrata/tree/gb10-port
- Fork de llama.cpp para GB10 (rama ink2v): https://github.com/imagami3/llama.cpp/tree/ink2v
- Cuantización GGUF de Inkling 2 Mini: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Acceptable Use Policy de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy
- Revisión anterior del TQ1 (84,2 GB): https://huggingface.co/imagami/Shikigami-594B-A17B-GGUF/tree/6151b2011bd2f1f3793f52df88086e6e74ec21b5
