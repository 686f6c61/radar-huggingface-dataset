# omunaman/sarvam-105b-edited-fp8-experts

## Resumen

Sarvam 105B edited es una variante modificada del modelo `sarvamai/sarvam-105b` de Sarvam AI, publicada por el usuario omunaman bajo licencia Apache-2.0. Se trata de un transformer de tipo mixture-of-experts (MoE) con 106.031.767.424 parámetros totales, orientado a generación de texto conversacional y razonamiento multilingüe, con especial énfasis en lenguas índicas (hindi, bengalí, tamil, telugu, marathi, gujarati, kannada, malayalam, panyabí y oriya) además del inglés.

La modificación consiste en dos ediciones de pesos de baja intensidad sobre el modelo base: una ablación direccional en la capa 28 que elimina una dirección de "recomprobación" del flujo residual, y un ajuste en la fila 24 de `lm_head` (token `</think>`) que actúa como lector de "respuesta asentada". El objetivo declarado es que el modelo deje de pensar una vez que la respuesta está decidida, reduciendo el consumo de tokens de razonamiento. Los expertos enrutados se almacenan en FP8 E4M3 con escalas calibradas, mientras que atención, expertos compartidos, embeddings, `lm_head`, normas y router permanecen en 16 bits.

El paquete incluye además una cabeza draft EAGLE-3 entrenada para decodificación especulativa, parches de serving para vLLM 0.33.0, un "loop breaker" y el informe completo en PDF. El modelo está pensado para desplegarse en una única GPU B200 y se distribuye con código custom (`sarvam_mla`), lo que exige usar la librería vLLM para su carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE) con atención `sarvam_mla`; código custom |
| Parametros totales | 106.031.767.424 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el límite de generación usado en la evaluación es de 16.384 tokens) |
| Tipos de cuantizacion | FP8 E4M3 para expertos enrutados (escalas por tensor); FP8 por canal para lineales en carga vía vLLM; KV cache en FP8; resto en 16 bits |
| Idiomas soportados | en, hi, bn, ta, te, mr, gu, kn, ml, pa, or |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (85 shards, ~112 GB), layout ModelOpt FP8; cabeza draft EAGLE-3 en formato vLLM `LlamaForCausalLMEagle3` |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con atención de tipo `sarvam_mla`, que requiere código custom para su carga. Los expertos enrutados (proyecciones gate, up y down) se almacenan en FP8 E4M3 con escalas de peso por tensor calculadas como `max|W| / 448`. Las escalas de activación son fijas y calibradas: la escala de entrada de los expertos es 1,25 veces el máximo calibrado, y la escala de entrada de la proyección down de cada experto es 2,0 veces su propio máximo calibrado. La calibración se realizó ejecutando el modelo sobre 384 prompts de práctica fuera de los conjuntos de evaluación. No hubo entrenamiento adicional: los valores solo cambian por redondeo.

Las dos ediciones de pesos son las siguientes. Primero, `rc28`: una ablación direccional de fuerza 1 que elimina una dirección unitaria `r` de dimensión 4.096 (encontrada en la capa 28 a partir del propio pensamiento del modelo) de todas las matrices que escriben en el flujo residual, mediante `W <- W - r (r^T W)` calculado en float32 antes del cast a BF16; afecta a `embed_tokens`, todas las `self_attn.o_proj`, la `mlp.down_proj` densa de la capa 0, la `down_proj` de cada experto enrutado y la de cada experto compartido, en total 4.033 tensores. Segundo, `c1`: se modifica únicamente la fila 24 de `lm_head` (token `</think>`) con `+ 0.5 * v - 4.4297 * c`, donde `v` es una dirección LDA (beta 4) que separa estados de pensamiento asentados de no asentados y `c` es una dirección constante que fija el umbral en 0,5 desviaciones estándar. Adicionalmente, en carga, vLLM convierte los lineales de 16 bits a FP8 por canal mediante `--quantization-config '{"linear": "fp8_per_channel"}'`, y la KV cache se almacena en FP8.

El repositorio incluye una cabeza draft EAGLE-3 de 1,07 GB entrenada sobre 35.885 respuestas del propio modelo a prompts fuera del examen de evaluación. La verificación de vLLM preserva la distribución de salida, por lo que la cabeza draft no altera las respuestas, solo acelera la decodificación.

## Capacidades

- Generación de texto conversacional y razonamiento con modo de pensamiento (`thinking`), con un mecanismo editado para terminar el razonamiento cuando la respuesta está asentada.
- Razonamiento matemático y resolución de problemas (evaluado en GSM8K en inglés y hindi, MATH-500).
- Conocimiento general y académico multilingüe (evaluado en MMLU en inglés, MMLU-Pro, ARC-Challenge y pruebas de opción múltiple en lenguas índicas).
- Soporte multilingüe para once idiomas: inglés, hindi, bengalí, tamil, telugu, marathi, gujarati, kannada, malayalam, panyabí y oriya.
- Decodificación especulativa mediante cabeza draft EAGLE-3 integrada en vLLM.
- Servicio de alto rendimiento con vLLM 0.33.0, incluyendo parches de loader, overlays de motor y un loop breaker para cortar repeticiones.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Razonamiento matemático en producción con control de coste: el modelo editado reduce el consumo de tokens por respuesta correcta a 0,18x en temperatura 0 frente a los pesos sin tocar, lo que lo hace adecuado para pipelines de resolución de problemas donde el coste por token es crítico.
- Atención al cliente multilingüe en la India: al cubrir once idiomas índicos además del inglés, puede gestionar conversaciones multi-turno con usuarios de distintas regiones lingüísticas sin modelos separados por idioma.
- Generación de respuestas con razonamiento acotado: la edición `c1` sobre `</think>` permite que el modelo deje de pensar cuando la respuesta está decidida, útil en entornos donde los límites de tokens de razonamiento encarecen el servicio (en temperatura 0, solo 16 de 4.640 respuestas alcanzan el límite de 16.384 tokens, frente a 839 con los pesos originales).
- Servicio de alto rendimiento en una sola GPU: con la cabeza draft EAGLE-3 y el stack vLLM parcheado, un solo B200 sostiene 1.024 usuarios concurrentes a 24.651 tok/s, adecuado para despliegues con presupuesto de infraestructura limitado.
- Evaluación académica y benchmarks en lenguas índicas: sirve como modelo de referencia para pruebas de opción múltiple y generación en hindi, bengalí, tamil y otras lenguas del subcontinente.
- Investigación sobre edición de pesos y control del razonamiento: el repositorio incluye los vectores de edición, los registros de parches con sha256 de cada tensor modificado, los scripts de aplicación y las estadísticas de calibración, lo que permite reproducir y auditar las modificaciones.
- Despliegue con decodificación especulativa: la cabeza EAGLE-3 incluida permite integrar decodificación especulativa verificada en vLLM sin cambiar la distribución de salida, útil para reducir latencia en aplicaciones interactivas.

## Benchmarks y rendimiento

Resultados sobre el examen retenido (4.340 preguntas puntuadas en 7 conjuntos: MMLU inglés, opción múltiple índica, GSM8K inglés y hindi, MATH-500, MMLU-Pro y ARC-Challenge; 256 peticiones en vuelo, thinking activado, top-p 0,95, límite de 16.384 tokens, una B200 por configuración):

| Configuracion | Temp. | Precision | Sin responder | Tokens por acierto | En el limite de tokens | Cortes del loop breaker | Diarias respondidas |
|---|---|---|---|---|---|---|---|
| Pesos sin tocar (8-bit en carga, vLLM 0.33 stock, sin loop breaker) | 0,8 | 87,70% | no disponible | 1,00x (referencia) | no disponible | no disponible | no disponible |
| Pesos editados (esta ficha) | 0,8 | 86,80% | no disponible | 0,46x | no disponible | no disponible | no disponible |
| Pesos sin tocar | 0 | 74,82% | no disponible | 1,00x (referencia) | 839 de 4.640 | no disponible | no disponible |
| Pesos editados | 0 | 86,13% | no disponible | 0,18x | 16 de 4.640 | no disponible | no disponible |

Comparación con la API propia de Sarvam sobre las mismas preguntas a temperatura 0,8: +0,83 puntos de precisión (no significativo, intervalo del 95% de -0,16 a +1,73) y 0,35x los tokens por respuesta correcta de la API.

Rendimiento en una B200: primer token en aproximadamente 0,024 s en el servidor; respuesta típica completada en 1,21 s (mediana, un usuario, con cabeza draft). Throughput de 243 tokens/s por usuario sin cabeza draft y 335 tokens/s con ella (los objetivos fijados eran 330 y 450, ambos no alcanzados). Coste de servicio a 1.024 usuarios concurrentes: 6,62 rupias por millón de tokens de salida (24.651 tok/s en una B200 a 6,25 USD/hora, 93,96 rupias por USD).

En el conjunto de práctica de 400 preguntas, la configuración de showcase obtiene 87,38 / 88,25 / 87,12 / 86,75% a temperatura 0 / 0,5 / 0,8 / 1,0, con 761 / 748 / 798 / 860 tokens por respuesta correcta (2 semillas cada una), y 66,15% en un conjunto difícil de 260 preguntas. La ventaja de +2,25 puntos observada en práctica a temperatura 0,8 no se trasladó al examen retenido.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 113,3 GB (85 shards safetensors de ~112 GB más configuración y tokenizer); se sirve en una única GPU B200.
- GPU recomendadas: NVIDIA B200 para el despliegue de referencia medido; no se documentan estimaciones para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no disponible; el tamaño de pesos (112 GB) y el requisito de FP8 y código custom hacen improbable su despliegue en GPUs de consumo sin cuantización adicional no documentada.
- Opciones de despliegue: vLLM 0.33.0 con el parche de loader incluido en `serving/`, overlays de código de motor y de cabeza draft, y el comando de servicio exacto en `serving/SERVE.md`. No se documentan opciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput: primer token ~0,024 s; respuesta mediana 1,21 s con un usuario y cabeza draft; 243 tok/s por usuario sin draft y 335 tok/s con draft; 24.651 tok/s agregados en una B200 con 1.024 usuarios concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| omunaman/sarvam-105b-edited-fp8-experts | 106.031.767.424 | no disponible (limite de generacion 16.384) | Apache-2.0 | Hugging Face, vLLM | Edicion de pesos con FP8 en expertos y cabeza EAGLE-3 |
| sarvamai/sarvam-105b | no disponible | no disponible | Apache-2.0 | Hugging Face | Modelo base sin editar; referencia de comparacion en los benchmarks |
| API de Sarvam | no disponible | no disponible | propietaria | API | +0,83 puntos de precision y 0,35x tokens por acierto frente a esta variante a temperatura 0,8 |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La edición introduce una pérdida de precisión de 0,90 puntos a temperatura 0,8 (86,80% frente a 87,70%), con intervalo del 95% de -1,73 a -0,12; es una pérdida real aunque pequeña.
- Los objetivos de velocidad no se alcanzaron: 243 tok/s por usuario sin draft y 335 con draft, frente a los 330 y 450 fijados.
- La ventaja observada en el conjunto de práctica (+2,25 puntos a temperatura 0,8) no se reprodujo en el examen retenido, lo que indica riesgo de sobreajuste a las preguntas de práctica.
- El modelo requiere código custom (`sarvam_mla`) y una versión concreta de vLLM (0.33.0) con parches de loader y overlays de motor; no es un despliegue estándar.
- Riesgo de alucinación no cuantificado en la información disponible; los benchmarks se limitan a tareas de opción múltiple, matemáticas y conocimiento general.
- No se documentan sesgos conocidos, comportamiento fuera de los once idiomas soportados ni restricciones adicionales de la licencia Apache-2.0 para uso comercial.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.
- La fecha de creación del repositorio (2026-11-18) es posterior a la fecha actual, lo que debe tenerse en cuenta al evaluar la madurez del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/omunaman/sarvam-105b-edited-fp8-experts
- Modelo base: https://huggingface.co/sarvamai/sarvam-105b
- Informe completo: `docs/Sarvam_105B_Beat.pdf` dentro del repositorio
- Instrucciones de servicio: `serving/SERVE.md` dentro del repositorio
- Detalle de ediciones: `edits/EDITS.md` dentro del repositorio
