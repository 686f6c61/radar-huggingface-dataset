# mradermacher/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source-GGUF

## Resumen

Gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source-GGUF es una colección de cuantizaciones estáticas en formato GGUF, realizadas por el usuario mradermacher, de un fine-tune creado por DavidAU sobre un modelo base Gemma 4 de 31 mil millones de parámetros en su versión instruct. El modelo original se presenta como un fine-tune "uncensored" y "abliterated" (con los filtros de seguridad eliminados), orientado a escritura creativa de terror, roleplaying y ficción de todos los géneros, con especial énfasis temático en Halloween y horror. Según las etiquetas del autor, incorpora "13 modos de razonamiento", "13 modos instruct" y "10 EVIL AI Constructs", además de un modo thinking.

La relevancia de esta ficha no está tanto en el modelo base como en la disponibilidad de cuantizaciones GGUF que permiten ejecutarlo localmente en hardware de consumo, desde 12 GB (Q2_K) hasta 32,7 GB (Q8_0). Incluye además archivos mmproj (suplementos multimodales) en Q8_0 y f16, lo que sugiere que el modelo base dispone de capacidades de visión. La licencia es Apache 2.0, lo que permite uso comercial, aunque la naturaleza "uncensored" del fine-tune exige valoraciones legales y éticas adicionales antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4), no disponible detalle adicional |
| Parametros totales | 30.697.345.596 (≈30,7 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo fuente original esta en safetensors |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 de 31 mil millones de parametros en variante instruct (it), una arquitectura transformer densa. Sobre este base, DavidAU ha aplicado un fine-tune descrito como "Halloween Terror Heretic Uncensored", que segun las etiquetas incluye tecnicas de abliteration (eliminacion de pesos asociados a los mecanismos de rechazo del modelo) y el metodo "Heretic" para eliminar el alineamiento de seguridad. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre el uso de tecnicas como RLHF o DPO en el fine-tune.

Esta ficha corresponde a las cuantizaciones estaticas en GGUF realizadas por mradermacher, un cuantizador conocido en la comunidad por ofrecer el espectro completo de cuants k-quant de llama.cpp. Tambien existen versiones weighted/imatrix (con matrices de importancia) en un repositorio aparte, que suelen ofrecer mejor calidad por bit que las estaticas.

## Capacidades

- Generacion de texto creativo orientada a ficcion de terror, horror y "todos los generos", segun las etiquetas del autor.
- Escritura de historias y roleplaying, incluyendo "evil sims" (simulaciones de personajes malvados).
- Modos de razonamiento y thinking: las etiquetas mencionan "13 reasoning modes", "13 instruct modes" y "thinking", aunque no se documenta su funcionamiento.
- Capacidades multimodales: la presencia de archivos mmproj (mmproj-Q8_0 y mmproj-f16) indica soporte de vision mediante suplementos multimodales en llama.cpp.
- Modelo "uncensored" y "abliterated": sin rechazos de seguridad, capaz de generar contenido que el modelo base bloquearia.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: el modelo esta etiquetado solo para ingles.

## Casos de uso

- Escritura de ficcion de terror: el modelo puede generar relatos largos de horror y suspense en ingles, aprovechando el fine-tune tematico de DavidAU; adecuado para autores que buscan inspiracion o borradores de genero.
- Roleplaying con personajes oscuros: las etiquetas "evil sims" y "10 EVIL AI Constructs" apuntan a la interpretacion de villanos y antihéroes en juegos de rol textuales, algo que los modelos alineados rechazan habitualmente.
- Superacion de bloqueos creativos en generos maduros: al estar abliterated, puede tratar temas violentos o perturbadores necesarios en thriller o dark fantasy sin rechazos, siempre bajo responsabilidad del usuario.
- Pruebas locales de modelos uncensored: las multiples cuantizaciones permiten evaluar el impacto de la abliteration en un Gemma 4 de 31B en hardware de consumo, util para investigadores de seguridad y alineamiento.
- Generacion de contenido tematico para eventos: la tematica Halloween lo hace apto para generar guiones, dialogos o descripciones para videojuegos, haunted houses o contenido de temporada.
- Experimentacion con modos de razonamiento: las etiquetas anuncian multiples modos instruct y de reasoning que se pueden explorar en entornos locales con llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: depende de la cuantizacion elegida; Q2_K requiere unos 12 GB, Q4_K_M unos 19 GB, Q6_K unos 25 GB y Q8_0 unos 33 GB, mas margen para el contexto y el mmproj si se usa vision (0,9-1,3 GB adicionales).
- GPU recomendadas: para Q4_K_S/Q4_K_M (18-19 GB), una RTX 4090 (24 GB) o RTX 3090 permite descarga completa en GPU; para Q6_K y Q8_0 se recomiendan A100 40 GB, RTX A6000, 2x RTX 3090/4090 o descarga parcial en CPU.
- Consumer GPU: cabe en una RTX 4090 con cuantizaciones hasta Q4_K_M; con Mac (Apple Silicon) de 32 GB o mas funciona bien hasta Q4/Q5 con llama.cpp; con 64 GB unificados se puede usar Q6_K.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp y otros backends compatibles con GGUF; el soporte multimodal requiere cargar el archivo mmproj correspondiente.
- Latencia y throughput: no disponible en la informacion proporcionada; como referencia general, un modelo de 31B en Q4 sobre una RTX 4090 suele generar en torno a 20-30 tokens/s, aunque no hay datos oficiales para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored (este) | 30,7 B | no disponible | Apache 2.0 | Fine-tune uncensored de terror; GGUF de 12 a 33 GB |
| Gemma 3 27B it (base de la familia Gemma) | 27 B | 128k | Gemma license (restrictiva) | Multilingue, multimodal, alineado; contexto muy superior |
| Qwen2.5-32B-Instruct | 32,5 B | 128k | Apache 2.0 | Fuerte en codigo y razonamiento, alineado, no especializado en ficcion |
| Mistral Small 3 (24B) | 24 B | 32k | Apache 2.0 | Menor tamano, buen equilibrio general, sin especializacion creativa |

La ventaja diferencial de este modelo frente a las alternativas es la especializacion en ficcion de terror y la ausencia de filtros; a cambio, pierde el contexto largo de la familia Gemma 3 original (dato no confirmado para Gemma 4) y no ofrece garantias de seguridad.

## Limitaciones y advertencias

- Contenido potencialmente ofensivo o nocivo: al estar abliterated y uncensored, el modelo puede generar violencia grafica, discurso danino o contenido ilegal si se le pide; las etiquetas incluyen explicitamente "not-for-all-audiences".
- Riesgo de alucinacion: no disponible datos especificos, pero como todo LLM puede fabricar hechos; el fine-tune creativo puede agravar la tendencia a inventar contenido.
- Idioma: etiquetado solo para ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior al del modelo base.
- Contexto: la longitud de ventana no esta documentada en esta ficha; verificarla en el modelo fuente antes de planificar cargas de documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero la eliminacion de salvaguardas puede entrar en conflicto con la ley, las politicas de plataformas y los terminos del modelo base; el usuario asume toda la responsabilidad legal.
- Calidad de las cuantizaciones: Q2_K y Q3_K degradan notablemente la calidad; para uso serio se recomiendan Q4_K_M o superiores, o las versiones imatrix disponibles en el repositorio hermano.
- No apto para produccion orientada a usuarios finales sin contenedores de seguridad externos (moderacion de entrada/salida).

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source-GGUF
- Modelo fuente original: https://huggingface.co/DavidAU/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source-i1-GGUF
- Pagina de descargas resumida de mradermacher: https://hf.tst.eu/model#gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referenciada en el README): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
