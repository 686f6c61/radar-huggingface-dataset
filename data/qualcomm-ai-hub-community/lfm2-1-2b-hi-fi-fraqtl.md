# qualcomm-ai-hub-community/LFM2-1.2B-Hi-Fi-fraQtl

## Resumen

LFM2-1.2B Hi-Fi (fraQtl) es una reconstrucción cuantizada en 4 bits del modelo LiquidAI/LFM2-1.2B (revisión `40f3da0d`), publicada por el colaborador fraQtl bajo el espacio `qualcomm-ai-hub-community`. No es un modelo nuevo ni un fine-tune: es un empaquetado GGUF calibrado en formatos de bloque legales para NPU (Q4_0 e IQ4_NL con bloque de 32 elementos), pensado para ejecución on-device en aceleradores Qualcomm mediante llama.cpp y QNN. El problema que aborda es concreto: a igual número de bytes, las cuantizaciones de 4 bits estándar pierden fidelidad frente al modelo en bf16, y este build trata de reducir esa divergencia sin aumentar el tamaño del fichero.

El resultado declarado es un fichero `npu/iq4_nl_cal.gguf` de 695.752.672 bytes con divergencia 0.10837 frente a un profesor Q8_0, un 33,40 % menos que el Q4_0 sin calibrar del mismo tamaño y un 33,4 % mejor que el Q4_0 que distribuye el propio vendor (0.162709). La concordancia top-1 sube del 78,22 % al 82,17 % y la SQNR de 10,88 dB a 12,65 dB. En la prueba de tarea (GSM8K, n=100) las tres variantes evaluadas quedan en 58-59 %, sin separación significativa.

La relevancia es doble: por un lado demuestra que la calibración del corpus, y no solo la elección de formato, mueve la aguja en cuantización de 4 bits; por otro, certifica la ejecución real en silicio NPU (Snapdragon 8 Elite Gen 6) con un grafo QNN partido en dos mitades por debajo del límite de 2 GiB por grafo. El modelo base tiene 1.170.340.608 parámetros y el repo ocupa 2,8 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (LiquidAI), cargada como `Lfm2ForCausalLM` en llama.cpp; el detalle interno de capas no se documenta en la información disponible |
| Parametros totales | 1.170.340.608 (1,17 B) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | IQ4_NL + calibración fraQtl; Q4_0 + calibración; Q4_0 sin calibrar (control); Q4_K_M. Bloques de 32 elementos, formato legal para NPU |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | `lfm1.0` (`license: other`, `license_name: lfm1.0`), términos en el repositorio de LiquidAI |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | LiquidAI/LFM2-1.2B, revisión `40f3da0d`, relación `quantized` |
| Tamano del repositorio | 2,8 GB |
| Ficheros incluidos | `npu/iq4_nl_cal.gguf` (695.752.672 B), `npu/q4_0_cal.gguf` (697.849.824 B), `npu/q4_0_plain.gguf` (695.752.416 B), `fraqtl_q4km.gguf` (730.896.096 B) |
| Version de llama.cpp requerida | ≥ b11514 (soporte de `Lfm2ForCausalLM`) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El repositorio no entrena nada: parte de los pesos bf16 de LFM2-1.2B y aplica un pipeline de cuantización post-entrenamiento con calibración. La arquitectura subyacente es LFM2, la familia de LiquidAI implementada en llama.cpp como `Lfm2ForCausalLM`; la model card no desglosa número de capas, atención ni composición del corpus de preentrenamiento, por lo que esos datos quedan como no disponibles. Tampoco se documenta si el modelo base pasó por RLHF o DPO.

La innovación técnica está en la metodología de cuantización y en su verificación. El profesor de referencia es un Q8_0 del mismo base bf16, y la métrica es divergencia simétrica de soporte restringido sobre los top-20 logits en escala logarítmica natural, medida sobre 43.200 posiciones retenidas (test de wikitext-2, validación de SQuAD y test de UltraChat), disjuntas del corpus de calibración. El corpus de calibración en sí no se publica: el autor indica explícitamente que la receta no está disponible y que la ganancia procede de ese corpus más la elección de formato legal para NPU, no de una política de asignación por tensor ni de un método de redondeo propietario. El control sin calibrar reproduce el Q4_0 del vendor hasta el quinto decimal, lo que sirve como verificación de que la comparación es limpia.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` con tag `conversational`, sobre el modelo base LFM2-1.2B.
- Ejecución on-device: formato GGUF compatible con llama.cpp y con compilación QNN para NPU Qualcomm.
- Razonamiento aritmético básico: evaluado en GSM8K (ventana de 100 problemas, 59 % de acierto en el build Q4_K_M).
- Cuantización de 4 bits de alta fidelidad: 82,17 % de concordancia top-1 con el profesor Q8_0, con 695,75 MB de pesos.
- Despliegue en grafo NPU fragmentado: soporta compilación en dos partes por debajo del límite de 2 GiB por grafo en dispositivo.
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Multilingüismo: no documentado; la model card no declara idiomas.
- Vision o audio: no disponibles; el repositorio es exclusivamente de texto.

## Casos de uso

- Inferencia en smartphone con NPU: usar `npu/iq4_nl_cal.gguf` como arm recomendado en un Snapdragon con QNN, partiendo el grafo en dos mitades por debajo de 2 GiB para cumplir el límite del runtime on-device.
- Asistentes locales sin conexión: 695,75 MB de pesos permiten empotrar el modelo en una aplicación móvil o de escritorio y ejecutar generación de texto sin enviar datos a la nube, con la ventaja de privacidad que eso implica.
- Evaluación de pipelines de cuantización: sirve como referencia reproducible (control sin calibrar que replica el Q4_0 del vendor al quinto decimal) para comparar cualquier método de calibración futuro sobre el mismo base y el mismo conjunto de 43.200 posiciones.
- Prototipado rápido en CPU: con llama.cpp basta un binario y `llama-cli -m npu/iq4_nl_cal.gguf -p "Hello" -n 64`; útil para validar prompts y formatos antes de portar a NPU.
- Generación de texto embebida de bajo consumo: tareas de resumen corto, clasificación o respuestas plantilla donde 1,17 B de parámetros en 4 bits encajan en presupuestos de memoria muy ajustados.
- Ajuste fino de aplicaciones que exigen fidelidad al modelo original: al reducir la divergencia un 33,40 % frente al Q4_0 estándar a igualdad de bytes, es adecuado cuando se sustituye un despliegue bf16 por uno de 4 bits y no se quiere reajustar el comportamiento.
- Reproducción de investigación en cuantización: el repo incluye `receipts/` con pre-registro, hashes del profesor, JSON de divergencia por arm, puntuaciones GSM8K selladas y dumps de tensores, lo que permite auditar la metodología.

## Benchmarks y rendimiento

Fidelidad frente al profesor Q8_0 (divergencia menor es mejor; 43.200 posiciones retenidas):

| Arm | Bytes | Divergencia ↓ | Top-1 ↑ | SQNR (dB) ↑ |
|---|---|---|---|---|
| LiquidAI Q4_0 (vendor) | ≈695,8 M | 0.162709 | 78,22 % | 10,88 |
| q4_0_plain (control) | 695.752.416 | 0.16271 | 78,22 % | 10,88 |
| q4_0_cal | 697.849.824 | 0.14163 | 79,59 % | 11,49 |
| iq4_nl_cal (recomendado) | 695.752.672 | 0.10837 | 82,17 % | 12,65 |

Comparaciones derivadas declaradas por el autor: `q4_0_cal` frente a `q4_0_plain` reduce la divergencia un 12,96 % con un +0,30 % de bytes; `iq4_nl_cal` frente al Q4_K_M de LiquidAI reduce un 1,86 % con un −4,81 % de bytes; `fraqtl_q4km` frente al Q4_K_M del vendor a igual tamaño da 0.11104 frente a 0.11042 (+0,57 %, peor).

Prueba de tarea (GSM8K, n=100, puntuaciones selladas antes de evaluar):

| Arm | Precisión |
|---|---|
| fraqtl_q4km | 59 % |
| LiquidAI Q4_0 | 58 % |
| LiquidAI Q4_K_M | 59 % |

No se han publicado resultados de MMLU, HumanEval ni de otros benchmarks estándar en la información disponible. El arm `iq4_nl_cal` no aparece puntuado en la prueba de GSM8K.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 0,70 GB solo de pesos con `iq4_nl_cal` (695,75 MB) y 0,73 GB con `fraqtl_q4km` (730,90 MB). El espacio adicional de caché KV depende del contexto configurado y no se documenta en la información disponible.
- Cabe en cualquier GPU de consumo con 1-2 GB de VRAM libre; una RTX 4090 o superior queda muy sobredimensionada para este modelo. No se documentan GPU de datacenter concretas (A100, H100) en la información disponible, aunque por tamaño el modelo no las requiere.
- Despliegue en CPU: viable con llama.cpp; el modelo requiere release ≥ b11514 por el soporte de `Lfm2ForCausalLM`.
- Despliegue en NPU: compilación QNN en dos partes por debajo del límite de 2 GiB por grafo. Verificado en un Snapdragon 8 Elite Gen 6.
- Latencia en NPU: 29,5 ms sumando las dos partes para un forward estático de 7 tokens. El autor advierte explícitamente de que no es una cifra de tokens por segundo.
- Otras opciones de despliegue (vLLM, TGI, Ollama): no documentadas en la información disponible. El tag `inference: false` indica que el widget de inferencia de HuggingFace no está habilitado para este repo.
- Throughput en GPU/CPU: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato / bytes | Divergencia vs Q8_0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2-1.2B Hi-Fi `iq4_nl_cal` (este) | 1,17 B | GGUF IQ4_NL cal., 695,75 MB | 0.10837 | lfm1.0 | Público en HF |
| LFM2-1.2B Q4_0 (vendor LiquidAI) | 1,17 B | GGUF Q4_0, ≈695,8 MB | 0.162709 | lfm1.0 | Público en HF |
| LFM2-1.2B Q4_K_M (vendor LiquidAI) | 1,17 B | GGUF Q4_K_M, ≈730,9 MB | 0.11042 | lfm1.0 | Público en HF |
| LFM2-1.2B Hi-Fi `fraqtl_q4km` | 1,17 B | GGUF Q4_K_M, 730,90 MB | 0.11104 | lfm1.0 | Público en HF |

La comparación natural es contra los propios GGUF de LiquidAI, porque comparten base y licencia. Frente a otras familias de ~1-2 B en 4 bits (Qwen, Llama, Gemma), no hay datos de benchmarks en la información proporcionada que permitan una comparación rigurosa: no disponible.

## Limitaciones y advertencias

- La receta del corpus de calibración no se publica, por lo que el resultado no es reproducible de forma independiente; solo se pueden auditar los recibos incluidos en `receipts/`.
- No es una mejora de método de redondeo ni de asignación por tensor: el autor descarta explícitamente esas vías, de modo que el margen sobre el vendor depende de un artefacto no distribuido.
- El build `fraqtl_q4km` es ligeramente peor que el Q4_K_M de LiquidAI a igual tamaño (+0,57 % de divergencia); para ese formato conviene usar el original.
- La prueba de GSM8K usa n=100 problemas, una muestra pequeña con intervalos de confianza amplios; las diferencias de 58 % a 59 % no son significativas.
- Al ser una cuantización de 4 bits, existe pérdida de calidad frente al bf16 original: 17,83 % de desacuerdo top-1 con el profesor Q8_0 en el mejor caso.
- Con 1,17 B de parámetros es esperable una tasa de alucinación superior a la de modelos grandes; no se publican evaluaciones de veracidad en la información disponible.
- No se declara lista de idiomas soportados; no se debe asumir buen rendimiento en castellano sin evaluarlo.
- Longitud de contexto no documentada: no se puede planificar un caso de uso con contexto largo sin verificar la ficha del modelo base.
- Licencia `lfm1.0` con `license: other`: es obligatorio revisar los términos de LiquidAI antes de cualquier uso comercial; no es una licencia permisiva tipo Apache 2.0 o MIT.
- El límite de 2 GiB por grafo en NPU obliga a partir la compilación QNN; un pipeline de despliegue debe gestionar esa fragmentación.
- La cifra de 29,5 ms corresponde a un forward estático de 7 tokens, no a throughput de generación; no debe usarse para estimar latencia por token en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/qualcomm-ai-hub-community/LFM2-1.2B-Hi-Fi-fraQtl
- Repositorio canónico de fraQtl con recibos completos: https://huggingface.co/fraQtl/LFM2-1.2B-Hi-Fi-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2-1.2B
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM2-1.2B/blob/main/LICENSE
- llama.cpp (release ≥ b11514, soporte `Lfm2ForCausalLM`): https://github.com/ggml-org/llama.cpp
- Qualcomm (organización): https://www.qualcomm.com/
- Información corporativa de Qualcomm: https://www.qualcomm.com/company
