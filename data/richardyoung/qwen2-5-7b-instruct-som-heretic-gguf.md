# richardyoung/Qwen2.5-7B-Instruct-SOM-heretic-GGUF

## Resumen

Qwen2.5-7B-Instruct-SOM-heretic-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/Qwen2.5-7B-Instruct-SOM-heretic, un derivado del Qwen2.5-7B-Instruct de Alibaba. El autor, richardyoung, ha aplicado una tecnica de "abliteration" (eliminacion de rechazos o *heretic*) sobre el modelo instructivo original para reducir las negativas a responder ciertas peticiones, y lo ha publicado tanto en safetensors como en GGUF para su uso con llama.cpp y Ollama.

El modelo conserva la arquitectura transformer densa de Qwen2.5-7B, con 7.615.616.512 parametros y una ventana de contexto nativa de 32.768 tokens (128K con RoPE scaling, segun la documentacion de Qwen2.5). La cuantizacion GGUF permite ejecutarlo en hardware de consumo, lo que lo hace atractivo para experimentacion local con modelos "sin censura".

Es relevante ahora porque combina un modelo base ampliamente conocido y bien documentado (Qwen2.5-7B-Instruct) con un proceso de modificacion de alineamiento que interesa a la comunidad de investigacion en seguridad y a desarrolladores que necesitan un modelo sin rechazos para tareas creativas o de rol. La ficha se centra en lo que se puede verificar de la informacion disponible; muchos datos tecnicos del proceso de abliteration no estan publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (base Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos (128K con RoPE scaling segun Qwen2.5; no verificado en esta ficha) |
| Tipos de cuantizacion | GGUF (multiples niveles Q2-Q8 segun repo; no detallado en la informacion) |
| Idiomas soportados | en (declarado en la model card; el base Qwen2.5 soporta multiples idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atencion por query/key/value con sesgo, RMSNorm, SwiGLU en las capas feed-forward y RoPE para codificacion posicional. El entrenamiento original de Qwen2.5 incluyo un corpus multilingue de billones de tokens seguido de fases de alineamiento (SFT y RLHF/DPO) para el modelo instructivo.

Sobre esa base, el autor ha aplicado un proceso de "heretic"/abliteration: una modificacion de los pesos orientada a reducir la probabilidad de respuestas de rechazo ante peticiones sensibles. La informacion disponible no detalla el metodo exacto (direccion de rechazo, capas afectadas, magnitud de la intervencion) ni si hubo entrenamiento adicional. El modelo se distribuye con cuantizacion GGUF generada con imatrix, lo que sugiere un calibrado por importancia para preservar calidad en niveles bajos de bits. No hay datos publicados sobre el dataset de calibracion ni sobre evaluaciones del proceso de abliteration.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Razonamiento y matematicas de nivel medio, con el rendimiento tipico del base (sin benchmarks publicados para esta variante).
- Generacion de codigo en multiples lenguajes, ya que Qwen2.5-7B-Instruct esta entrenado para ello.
- Soporte de tool calling / function calling heredado del base instructivo (no verificado en esta variante).
- Capacidades multilingues del base (Qwen2.5 soporta decenas de idiomas), aunque la model card solo declara `en`.
- Modo "sin rechazos" (abliterated/uncensored): responde a peticiones que el modelo original rechazaria.
- Ejecucion local via llama.cpp y Ollama gracias al formato GGUF.
- No se declaran capacidades de vision, audio ni thinking mode explicito.

## Casos de uso

- Experimentacion en seguridad de IA: investigadores pueden estudiar como cambia el comportamiento de un modelo al eliminar el alineamiento de rechazo, comparando respuestas con el Qwen2.5-7B-Instruct original en el mismo prompt.
- Generacion creativa sin restricciones: escritura de ficcion con violencia, temas adultos o contenido controvertido donde el modelo original se negaria; util para guionistas y autores que trabajan con material sensible.
- Role-play y juegos de mesa narrativos: el modelo mantiene conversaciones multi-turno con contexto de hasta 32K tokens, adecuado para campanas largas o personajes con memoria extendida.
- Prototipado local en hardware de consumo: al estar en GGUF, se puede ejecutar con Ollama o llama.cpp en portatiles con GPU de 8-16 GB, sin depender de APIs externas.
- Evaluacion de robustez de filtros: equipos de moderacion pueden usar el modelo como generador adversarial para probar sus propios sistemas de deteccion de contenido danino.
- Investigacion sobre alucinacion y sesgo: al ser un derivado modificado, permite comparar la tasa de alucinacion y los sesgos frente al base, aislando el efecto del proceso de abliteration.
- Chatbot de personaje en entornos controlados: para demos o prototipos donde se requiere un tono sin filtros y el despliegue es local y privado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni evaluaciones del efecto de la abliteration sobre el rendimiento. Cualquier cifra del Qwen2.5-7B-Instruct original no es trasladable sin verificar la degradacion introducida por la modificacion de pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB en Q4_K_M, 8-9 GB en Q8_0, y en torno a 15 GB en FP16 (estimacion segun el tamano de 7.6B parametros; no publicada en el repo).
- GPU recomendadas: RTX 3060 12 GB o superior para Q4/Q5; RTX 4090 o A100 para Q8 y contexto largo.
- Cabe en GPU de consumo: si, en RTX 3060, 4060 Ti 16 GB, 4070, 4080 y 4090 con cuantizaciones Q4-Q8.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa; requeririan el modelo en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-7B-Instruct-SOM-heretic-GGUF | 7.6B | 32K (128K con RoPE) | apache-2.0 | GGUF | Abliterated, acceso restringido |
| Qwen/Qwen2.5-7B-Instruct | 7.6B | 32K (128K con RoPE) | apache-2.0 | safetensors, GGUF | Base original con alineamiento completo |
| Meta Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community | safetensors, GGUF | Alternativa con contexto largo y licencia mas restrictiva |
| Mistral 7B Instruct v0.3 | 7.2B | 32K | apache-2.0 | safetensors, GGUF | Alternativa densa de tamano similar |

La diferencia clave frente a los alternativas es el proceso de abliteration y el acceso restringido (gated), que limita su distribucion y su uso en pipelines automatizados sin aceptar condiciones.

## Limitaciones y advertencias

- El proceso de abliteration degrada el alineamiento de seguridad: el modelo puede generar contenido danino, ilegal o sexual sin filtros, lo que exige supervision humana en produccion.
- Riesgo de alucinacion: como cualquier modelo de 7B, tiende a inventar hechos, citas y referencias; la modificacion de pesos puede agravar este comportamiento al eliminar rechazos ante peticiones dudosas.
- Acceso restringido: el repo es gated y requiere aceptar condiciones en Hugging Face, lo que complica la descarga automatizada y el uso en CI/CD.
- Idiomas: la model card solo declara `en`; el rendimiento en castellano no esta verificado y puede ser inferior al del base.
- Sesgos: hereda los sesgos del corpus de entrenamiento de Qwen2.5 y no hay evaluaciones publicadas del efecto de la abliteration sobre ellos.
- Licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo modificado; conviene revisar las condiciones del repo gated.
- No hay benchmarks publicados: no se puede cuantificar la perdida de calidad respecto al base.
- La fecha de creacion (2026-11-11) y el identificador arXiv referenciado (2611.17846) no son verificables en la informacion disponible; tratarlos con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-SOM-heretic-GGUF
- Modelo base (safetensors): https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-SOM-heretic
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- Paper referenciado (no verificado): arxiv:2611.17846
