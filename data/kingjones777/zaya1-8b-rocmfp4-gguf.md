# kingjones777/ZAYA1-8B-ROCmFP4-GGUF

## Resumen

ZAYA1-8B-ROCmFP4-GGUF es una cuantizacion 4-bit en formato GGUF del modelo ZAYA1-8B de Zyphra, realizada por kingjones777 especificamente para hardware AMD con arquitectura gfx1151 (Ryzen AI MAX+ 395 / Strix Halo). El modelo base es un transformer hibrido que combina atencion convolucional comprimida (CCA), capas SSM (estilo Mamba) y mezcla de expertos (MoE) con 16 expertos de los cuales solo 1 se activa por token. Tiene aproximadamente 8.4 mil millones de parametros totales y unos 760 millones activos, con una ventana de contexto de 131.072 tokens.

La cuantizacion utiliza el formato ROCmFP4 (ftype 102, `Q4_0_ROCMFP4_COHERENT`) que reduce el peso del modelo de 16.52 GiB en BF16 a 4.86 GiB, manteniendo los tensores mas sensibles (como la convolucion agrupada de la atencion CCA) en BF16 o F32. El autor advierte explicitamente que esta cuantizacion no mejora la velocidad de decodificacion respecto a Q4_K_M, sino que ofrece un ahorro de tamaño de 0.32 GiB. El modelo requiere un parche especifico de llama.cpp (ROCmFPX) ya que la arquitectura `zaya` no esta integrada en el codigo principal.

La relevancia de esta publicacion radica en que permite ejecutar un modelo MoE hibrido de ultima generacion en hardware AMD de consumo (Strix Halo) con un footprint reducido, aunque con la limitacion de que el cuello de botella de rendimiento esta en la convolucion CCA, que no se beneficia de la cuantizacion de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ZayaForCausalLM (hibrida: atencion convolucional comprimida + SSM + MoE) |
| Parametros totales | 8.840.233.464 (dato safetensors); ~8.4B segun model card |
| Parametros activos | ~760M (1 de 16 expertos activo por token) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Q4_0_ROCMFP4_COHERENT (ftype 102); token_embd en Q6_K; cca_conv_grp en BF16; normas, router y ssm_conv1d en F32; expertos y cca_val_proj en 4-bit |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `ZAYA1-8B-Q4_0_ROCMFP4_COHERENT.gguf`, 4.8629 GiB) |

## Arquitectura y entrenamiento

El modelo base ZAYA1-8B, desarrollado por Zyphra, presenta una arquitectura hibrida de 40 capas con dimension oculta de 2048 y un vocabulario de 262.272 tokens. Combina atencion convolucional comprimida (CCA) con capas SSM (convolucion 1D, `ssm_d_conv = 2`) y un bloque MoE con 16 expertos y activacion de 1 experto por token. El modelo tiene `tie_word_embeddings` activado, por lo que no existe un tensor de salida separado. La cuantizacion ROCmFP4 fue realizada a partir de una fuente BF16 sin perdida (no es una requantizacion), excluyendo de la cuantizacion los tensores de la convolucion agrupada CCA, que se mantienen en BF16 por su alta sensibilidad. No se dispone de informacion sobre los datos de entrenamiento del modelo base ni sobre el proceso de alineacion (RLHF, DPO, etc.) en la documentacion proporcionada.

## Capacidades

- Generacion de texto autoregresiva con pipeline `text-generation`.
- Razonamiento multi-paso: el modelo produce razonamiento extenso antes de la respuesta final, por lo que requiere un presupuesto de tokens generoso (el autor recomienda al menos 2500 tokens para evaluaciones).
- Soporte de contexto largo: ventana de 131.072 tokens.
- Capacidad multilingue declarada unicamente para ingles.
- No se menciona soporte de tool calling, function calling, agentes ni capacidades multimodales en la informacion disponible.
- La arquitectura hibrida (CCA + SSM + MoE) permite un equilibrio entre calidad y eficiencia computacional, aunque en este hardware el cuello de botella es la convolucion agrupada.

## Casos de uso

- Ejecucion local en dispositivos AMD Strix Halo (Ryzen AI MAX+ 395): el modelo esta optimizado para gfx1151 y puede ejecutarse con llama.cpp aplicando el parche ROCmFPX, lo que permite inferencia de texto sin conexion en equipos portatiles o mini-PC con esta APU.
- Prototipado rapido con GGUF: al ser un archivo unico de 4.86 GiB, facilita la distribucion y carga en entornos de desarrollo donde se necesita un modelo de 8B con contexto largo sin ocupar demasiado espacio en disco.
- Tareas de generacion de texto con contexto extenso: los 131.072 tokens de ventana permiten procesar documentos largos, resumir informes o mantener conversaciones multi-turno con historial amplio, siempre que el hardware soporte la latencia (~15-20 tok/s).
- Razonamiento con cadena de pensamiento: el modelo genera razonamiento interno antes de responder, lo que puede ser util en aplicaciones educativas, asistentes de analisis o sistemas de pregunta-respuesta compleja donde se requiera justificacion explicita.
- Inferencia en entornos con restricciones de memoria: al pesar menos de 5 GiB, puede caber en GPUs integradas con 8 GB de VRAM compartida o en configuraciones con memoria limitada, aunque el rendimiento estara condicionado por el cuello de botella computacional de la CCA.
- Evaluacion e investigacion de arquitecturas hibridas: investigadores que estudien modelos MoE con atencion convolucional pueden utilizar esta cuantizacion para experimentar con la arquitectura ZAYA1 en hardware AMD sin necesidad de GPU NVIDIA.

## Benchmarks y rendimiento

El autor publico mediciones de velocidad de decodificacion en el hardware objetivo (Ryzen AI MAX+ 395), con mediana de 3 ejecuciones y descartando el warm-up:

| Build | Tamano | Mediana de decodificacion | Rango |
|---|---|---|---|
| ROCmFP4 (este modelo) | 4.86 GiB | 15.8 tok/s | [14.1 – 20.49] |
| Q4_K_M | 5.19 GiB | 19.26 tok/s | [15.26 – 19.88] |
| BF16 | 16.52 GiB | 17.0 tok/s | [16.38 – 17.41] |

Los rangos se solapan completamente, por lo que el autor no hace ninguna afirmacion de velocidad en ninguna direccion. La cuantizacion no ofrece ventaja de throughput, solo un ahorro de 0.32 GiB frente a Q4_K_M. El analisis de coste por token indica que aproximadamente el 88% del tiempo de decodificacion es independiente del formato de pesos, concentrandose en la convolucion agrupada CCA (~55% del tiempo total). Las pruebas de correccion con muestras memorizadas dieron resultados correctos: 17 × 23 = 391, capital de Japon = Tokyo, dias en 2024 = 366. No se realizaron pruebas de perplexity, calidad A/B, contexto largo ni tool-calling.

## Requisitos de hardware

- Hardware objetivo: AMD gfx1151 (Ryzen AI MAX+ 395 / Strix Halo). No se ha probado en otras GPUs.
- VRAM estimada: el archivo pesa 4.8629 GiB, por lo que se necesita al menos 6 GB de memoria disponible (VRAM o RAM compartida) para cargar el modelo completo.
- GPU recomendadas: cualquier dispositivo con arquitectura gfx1151 (APU Ryzen AI MAX+ 395). No se menciona compatibilidad con GPUs NVIDIA o AMD de otras generaciones.
- Opciones de despliegue: llama.cpp con el parche ROCmFPX incluido en el repositorio. El llama.cpp estandar no puede cargar este modelo porque la arquitectura `zaya` no esta integrada en el codigo principal (PR pendiente #23112).
- Latencia y throughput: entre 14 y 20 tok/s de decodificacion en el hardware de prueba, con mediana de 15.8 tok/s.
- No se requieren multiples GPUs ni configuraciones distribuidas para este modelo.

## Comparativa con modelos similares

La comparacion mas directa es con otras cuantizaciones del mismo modelo base en el mismo hardware:

| Modelo | Tamano | Velocidad mediana | Contexto | Licencia |
|---|---|---|---|---|
| ZAYA1-8B ROCmFP4 (este) | 4.86 GiB | 15.8 tok/s | 131.072 | Apache-2.0 |
| ZAYA1-8B Q4_K_M | 5.19 GiB | 19.26 tok/s | 131.072 | Apache-2.0 |
| ZAYA1-8B BF16 | 16.52 GiB | 17.0 tok/s | 131.072 | Apache-2.0 |

No se dispone de informacion sobre otros modelos comparables (por ejemplo, Qwen2.5-7B, Llama-3.1-8B o Mixtral-8x7B) en la documentacion proporcionada, por lo que no es posible realizar una comparativa externa con datos verificados.

## Limitaciones y advertencias

- No es compatible con llama.cpp estandar: requiere el parche ROCmFPX del repositorio del autor. Los comandos auto-generados de HuggingFace no funcionaran.
- Sin benchmarks de calidad: no se ha medido perplexity, ni calidad A/B contra Q4_K_M o BF16, ni rendimiento en tareas de codigo, razonamiento o tool-calling. Las unicas verificaciones son tres preguntas memorizadas.
- Sesgo de idioma: solo se declara soporte para ingles. No se ha evaluado su comportamiento en otros idiomas.
- Rendimiento no mejorado: la cuantizacion no acelera la inferencia. El cuello de botella es la convolucion CCA, que permanece en BF16 y consume ~55% del tiempo de decodificacion.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido incorrecto o inventado. No se ha evaluado su tasa de alucinacion especifica.
- Sin pruebas de contexto largo: aunque el modelo soporta 131.072 tokens, no se ha verificado su comportamiento real con contextos extensos en esta cuantizacion.
- Restricciones de hardware: el formato ROCmFP4 esta disenado para gfx1151. No se garantiza su funcionamiento en otras arquitecturas AMD o NVIDIA.
- `tie_word_embeddings` activado: el parametro `--output-tensor-type` es un no-op silencioso. Solo `--token-embedding-type q6_K` tiene efecto real, y es critico dado el vocabulario de 262.272 tokens.
- Fecha de publicacion: el modelo fue creado en agosto de 2026, lo que puede implicar que la arquitectura `zaya` aun no este estabilizada en el ecosistema llama.cpp.

## Enlaces

- Modelo cuantizado: https://huggingface.co/kingjones777/ZAYA1-8B-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/Zyphra/ZAYA1-8B
- PR de llama.cpp para la arquitectura zaya: https://github.com/ggml-org/llama.cpp/pull/23112
