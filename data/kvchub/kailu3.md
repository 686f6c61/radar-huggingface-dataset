# KVCHub/KaiLu3

## Resumen

KaiLu 3 es un modelo de lenguaje conversacional de 329.353.216 parámetros (aproximadamente 329M) desarrollado desde cero por KvcHub. Se trata de un modelo pequeno orientado a generacion de texto y dialogo, disenado para ejecutarse en hardware modesto y servir como base para experimentacion o despliegues de baja latencia. Su arquitectura es hibrida: combina 16 capas de convolucion corta con compuerta (kernel 3) y 8 capas de atencion, siguiendo el esquema de capas de LFM2, aunque el modelo fue entrenado desde cero y no contiene pesos de LFM2.

El modelo fue preentrenado con 6.6B tokens procedentes de una mezcla de web educativa, libros de texto sinteticos, web general, matematicas, Wikipedia y codigo. Posteriormente se ajusto con aproximadamente 460K conversaciones supervisadas y se alineo mediante DPO con pares de preferencia de UltraFeedback, HelpSteer2 y Anthropic HH-RLHF. La longitud de contexto es de solo 1.024 tokens y el vocabulario de 32.768 tokens con BPE a nivel de byte.

Su relevancia actual radica en su tamano reducido (repo de 0.7 GB en bfloat16), su licencia gratuita para uso personal y su facilidad de despliegue en entornos con recursos limitados. No obstante, la licencia restringe el uso comercial sin permiso previo de KvcHub, y el modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 16 capas de convolucion corta con compuerta (kernel 3) y 8 capas de atencion (capas 3, 6, 9, 12, 15, 18, 21 y 23); layout de capas tipo LFM2 |
| Parametros totales | 329.353.216 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Ingles (en) |
| Licencia | KaiLu 3 License (uso personal y no comercial gratuito; uso comercial requiere permiso de KvcHub) |
| Formato de pesos | safetensors (bfloat16), cargable con `Lfm2ForCausalLM` en Transformers 4.54+ |
| Dimension oculta | 1.024 |
| Feed-forward | SwiGLU con dimension 2.816 |
| Atencion | 16 cabezas de query, 4 cabezas key-value (GQA), QK-norm, RoPE con theta = 1.000.000 |
| Vocabulario | 32.768 tokens (BPE a nivel de byte) |
| Embeddings | entrada y salida compartidos |
| Capas totales | 24 |

## Arquitectura y entrenamiento

KaiLu 3 emplea una arquitectura hibrida de 24 capas en la que solo 8 son de atencion (en las posiciones 3, 6, 9, 12, 15, 18, 21 y 23) y las 16 restantes son convoluciones cortas con compuerta de kernel 3. Esta combinacion busca reducir el coste computacional de la atencion en secuencias cortas, manteniendo la capacidad de modelar dependencias globales en las capas de atencion. La atencion usa 16 cabezas de query y 4 de key-value (grouped-query attention), con QK-norm y RoPE de theta 1.000.000. La anchura oculta es de 1.024 y el feed-forward SwiGLU de 2.816, con embeddings de entrada y salida compartidos y un vocabulario de 32.768 tokens BPE a nivel de byte. El layout de capas sigue el de LFM2, pero el modelo se entreno desde cero y no reutiliza pesos de LFM2.

El preentrenamiento consumio 6.6B tokens con la siguiente mezcla: web educativa FineWeb-Edu (50%), libros de texto sinteticos Cosmopedia v2 (18%), web general y libros SlimPajama-6B sin Books3 (12%), matematicas FineMath 4+ (8%), Wikipedia (6%) y codigo OpenCoder annealing (6%). Despues se realizo un ajuste supervisado con aproximadamente 460K conversaciones de smol-smoltalk en una sola pasada, calculando la perdida solo sobre las respuestas del asistente. Finalmente se aplico DPO con beta = 0.1 sobre hasta 60K pares de preferencia de UltraFeedback (binarizado), HelpSteer2 y Anthropic HH-RLHF. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, con formato de chat basado en `<|system|>`, `<|user|>` y `<|assistant|>`, terminando cada respuesta con `<|endoftext|>`.
- Razonamiento basico y respuesta a preguntas, limitado por el tamano del modelo y su ventana de 1.024 tokens.
- Generacion de codigo a nivel introductorio, fruto del 6% de codigo en el preentrenamiento.
- Resolucion de problemas matematicos sencillos, apoyada por el 8% de datos de matematicas (FineMath 4+).
- Alineacion conversacional mediante SFT y DPO, orientada a preferir respuestas consideradas utiles por los anotadores.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Asistente conversacional ligero en local: el modelo puede gestionar dialogos cortos en ingles con un formato de chat definido y un consumo de memoria reducido, adecuado para prototipos en portatiles o equipos sin GPU dedicada.
- Experimentacion academica con arquitecturas hibridas: al combinar convoluciones cortas y atencion, sirve para estudiar el impacto del layout de capas en tareas de modelado de lenguaje con presupuestos de computo pequenos.
- Generacion de respuestas en entornos de baja latencia: sus 329M parametros permiten inferencia rapida en CPU o en GPUs de gama baja, util para demos interactivas.
- Filtrado o clasificacion de texto conversacional: puede emplearse para generar respuestas candidatas o resumenes breves en ingles dentro de pipelines de datos, siempre con revision humana.
- Educacion y tutoria basica: con su mezcla de datos educativos y de libros de texto, puede generar explicaciones introductorias en ingles, aunque requiere verificacion por su tendencia a la alucinacion.
- Base para fine-tuning especifico: al ser un modelo pequeno con licencia gratuita para uso personal, es adecuado como punto de partida para ajustes en dominios concretos con recursos limitados.
- Generacion de codigo de ejemplo: puede producir fragmentos sencillos en ingles para documentacion o tutoriales, sin garantias de correccion en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.7 GB en bfloat16 (pesos del repo); en cuantizaciones de 8 bits o 4 bits el consumo seria inferior, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para bfloat16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutarlo sobradamente.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en CPU.
- Opciones de despliegue: Transformers 4.54+ con `Lfm2ForCausalLM`; no se documentan integraciones oficiales con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KaiLu 3 | 329M | 1.024 | Hibrida (convolucion corta + atencion) | KaiLu 3 License (gratuita solo para uso personal) | HuggingFace, transformers |
| SmolLM2-360M | 362M | 8.192 (segun documentacion publica) | Transformer denso | Apache 2.0 | HuggingFace, transformers |
| Qwen2.5-0.5B | 494M | 32.768 (segun documentacion publica) | Transformer denso | Apache 2.0 | HuggingFace, transformers |
| LFM2-350M | 350M (aprox.) | no disponible | Hibrida (layout LFM2) | no disponible | HuggingFace |

La comparativa se basa en caracteristicas publicas de modelos de tamano similar; no se dispone de datos de rendimiento comparativo de KaiLu 3 en benchmarks. KaiLu 3 destaca por su contexto mas corto (1.024 tokens) y su licencia restrictiva para uso comercial, frente a alternativas con licencias permisivas y ventanas mayores.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan evaluaciones de sesgo; al entrenarse con web, libros y datos sinteticos, puede reproducir sesgos presentes en esas fuentes.
- Riesgo de alucinacion: el propio autor advierte que el modelo puede afirmar hechos incorrectos con confianza.
- Limitaciones de contexto: ventana de solo 1.024 tokens, insuficiente para conversaciones largas o documentos extensos; el autor indica que puede perder el hilo en dialogos prolongados.
- Limitaciones de idioma: solo se declara soporte para ingles; el rendimiento en otros idiomas no esta garantizado.
- Restricciones de licencia: el uso comercial requiere permiso previo de KvcHub (hello@kvchub.com); los datasets de entrenamiento conservan sus propias licencias.
- Caveats para produccion: no ha pasado pruebas de seguridad mas alla del ajuste de preferencias; puede escribir codigo con errores; se recomienda revision humana antes de confiar en sus respuestas.
- Estado del repo: el modelo registra 0 descargas y 0 likes en el momento de la consulta, y la model card contiene enlaces de licencia con marcadores de posicion sin sustituir.

## Enlaces

- HuggingFace: https://huggingface.co/KVCHub/KaiLu3
- Sitio del autor: https://kvchub.com
- Licencia (enlace referenciado en la model card, con marcador de posicion): https://huggingface.co/<your-username>/KaiLu-3/blob/main/LICENSE
- Contacto comercial: mailto:hello@kvchub.com
- Datasets de entrenamiento: HuggingFaceFW/fineweb-edu, HuggingFaceTB/smollm-corpus, DKYoon/SlimPajama-6B, HuggingFaceTB/finemath, wikimedia/wikipedia, OpenCoder-LLM/opc-annealing-corpus, HuggingFaceTB/smol-smoltalk, HuggingFaceH4/ultrafeedback_binarized, nvidia/HelpSteer2, Anthropic/hh-rlhf
