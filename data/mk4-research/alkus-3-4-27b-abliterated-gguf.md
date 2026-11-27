# MK4-Research/Alkus-3.4-27B-Abliterated-GGUF

## Resumen

Alkus 3.4 es un ajuste fino de razonamiento compacto sobre Qwen3.8-27B, desarrollado por MK4-Research y distribuido exclusivamente en formato GGUF cuantizado Q4_K_M. Se trata de un adaptador QLoRA (r=16, alpha=32) entrenado sobre un corpus privado de razonamiento escrito a mano y fusionado posteriormente sobre una variante "abliterated" del modelo base, es decir, con los mecanismos de rechazo eliminados. El resultado es un modelo de 26.895.998.464 parametros (aproximadamente 27B) orientado a un registro concreto: fijar los hechos primero, mantener la cadena de pensamiento telegrafica y compacta, verificar una sola vez y responder de forma concisa.

El objetivo declarado del autor no es alcanzar el estado del arte en capacidad bruta, sino modificar el estilo de razonamiento y su longitud. En benchmarks neutros el modelo se situa a la par del base, y la diferenciacion proviene de la compactitud del pensamiento (unas 89 tokens de media) y de la eliminacion de generaciones descontroladas que si aparecen en el modelo original. Es relevante ahora porque ofrece una alternativa ligera y facil de desplegar en entornos locales (LM Studio, llama.cpp) para tareas donde la latencia y el coste por token importan mas que la precision absoluta.

La distribucion se limita al checkpoint cuantizado de la epoca 2 (checkpoint-166) en un unico archivo de 16,5 GB con 851 tensores en GGUF v3. La licencia hereda la del modelo base Qwen3.8-27B, etiquetada como "other" con nombre "qwen", y el autor advierte explicitamente de que debe confirmarse antes de depender de terminos de redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.8-27B); no se detalla si emplea attention lineal o hibrida |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens sugeridos en LM Studio; el ejemplo de llama.cpp usa 8.192 |
| Tipos de cuantizacion | Q4_K_M (unico formato distribuido) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | other / qwen (hereda la del base Qwen3.8-27B; confirmar antes de redistribuir) |
| Formato de pesos | GGUF v3 (851 tensores); no se distribuyen safetensors del ajuste |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer decoder-only de aproximadamente 27B parametros, sobre el que se aplica un ajuste QLoRA con rango 16 y alpha 32 durante 2 epocas con tasa de aprendizaje 1e-4. El adaptador se fusiona en una variante abliterated del base, lo que elimina los rechazos del modelo original; segun el autor, la abliteracion es ortogonal a las capacidades de razonamiento y codigo. El checkpoint distribuido corresponde a la epoca 2 (checkpoint-166).

El corpus de entrenamiento es una version restaurada y compactada del conjunto de razonamiento Alkus 1.8: se redujo manualmente a aproximadamente el 63% de su longitud original y se restauraron trazas de autocorreccion ("wait") y de exploracion-y-verificacion. El corpus no se publica. No se mencionan tecnicas de RLHF o DPO, ni innovaciones como decodificacion especulativa o attention lineal; la unica innovacion declarada es el estilo de razonamiento compacto con verificacion unica.

## Capacidades

- Generacion de texto conversacional y razonamiento de estilo compacto y telegrafico.
- Razonamiento matematico basico-intermedio, con verificacion unica y respuestas concisas.
- Razonamiento sobre trampas logicas: el autor reporta 10/10 en un conjunto de 10 trampas de razonamiento.
- Estilo de pensamiento con autocorreccion ("wait") y trazas de exploracion-y-verificacion restauradas.
- Capacidad multilingue: no disponible (no se declaran idiomas soportados).
- Tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta explicitamente).
- Vision o audio: no disponible.
- Modo thinking explicito: no se documenta como toggle; el estilo de razonamiento es el comportamiento por defecto del ajuste.

## Casos de uso

- Razonamiento local de baja latencia: el modelo produce cadenas de pensamiento de unas 89 tokens de media, lo que reduce el coste por consulta en despliegues sobre llama.cpp o LM Studio frente a modelos que generan trazas largas.
- Asistencia en tareas de verificacion unica: adecuado para escenarios donde se requiere fijar hechos, verificar una vez y responder de forma concisa, como resumenes tecnicos o respuestas a preguntas factuales acotadas.
- Clasificacion y extraccion de informacion con contexto largo: con la ventana de 131.072 tokens sugerida, puede procesar documentos extensos y emitir respuestas breves, aunque la calidad en contextos muy largos no esta medida.
- Prototipado de agentes conversacionales en local: al caber en 16,5 GB en Q4_K_M, permite montar un asistente conversacional en una estacion de trabajo con una sola GPU consumer de gama alta.
- Evaluacion de estilos de razonamiento: util como referencia para comparar registros de pensamiento compacto frente a modelos que generan cadenas largas, dado que el autor publica metricas de longitud media y generaciones descontroladas.
- Entornos con restricciones de privacidad: al ejecutarse integramente en local sin llamadas a API, sirve para procesar datos sensibles donde no se permite enviar informacion a servicios externos.

## Benchmarks y rendimiento

Resultados medidos por el autor con su pipeline local (greedy; conjunto de 10 trampas + GSM8K-50):

| Metrica | Alkus 3.4 | Referencia |
|---|---|---|
| Conjunto de trampas (razonamiento) | 10 / 10 | Alkus 1.8: 10/10 |
| GSM8K-50 | 90% | Alkus 1.8: 90% (@117 tok) · Alkus 3.1: 94% |
| Longitud media de razonamiento | ~89 tokens | mas compacto que 1.8 |
| Generaciones descontroladas | 0 | modelo base: 6 |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estandar en la informacion disponible. El propio autor advierte de que en benchmarks neutros el modelo esta a la par del base y que no alcanza el 94% de GSM8K de Alkus 3.1.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa 16,5 GB; se recomienda al menos 18-20 GB de VRAM para cargar el modelo con cache K/V en Q8_0 y margen para el contexto.
- GPU recomendadas: A100 40GB, H100, RTX 4090 (24 GB), RTX 3090 (24 GB); en GPUs de 16 GB puede no caber con contexto amplio.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090 y modelos con 24 GB o mas; en 16 GB solo con contexto reducido o descarga parcial a CPU.
- Opciones de despliegue: LM Studio, llama.cpp (llama-cli), y runtimes compatibles con GGUF; el autor sugiere Flash Attention activado, cache K/V Q8_0 y una generacion concurrente.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K-50 | Licencia | Formato |
|---|---|---|---|---|---|
| Alkus 3.4 | ~27B | 131.072 (sugerido) | 90% | other/qwen | GGUF Q4_K_M |
| Alkus 3.1 | no disponible | no disponible | 94% | no disponible | no disponible |
| Alkus 1.8 | no disponible | no disponible | 90% (@117 tok) | no disponible | no disponible |
| Qwen3.8-27B (base) | ~27B | no disponible | no disponible | qwen | safetensors/GGUF |

La comparativa se limita a las variantes Alkus y al modelo base, unicos datos publicados. No se dispone de comparaciones con modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion Q4_K_M: perdida de calidad menor frente a precision completa; no se distribuye version sin cuantizar.
- El ajuste modifica el estilo y la longitud del razonamiento, no el conocimiento subyacente; en benchmarks neutros queda cerca del base.
- El modelo base es abliterated, con los rechazos eliminados; el autor pide uso responsable y no hay garantias de comportamiento seguro en produccion.
- Licencia "other" con nombre "qwen": el propio autor indica que debe confirmarse y fijarse la licencia exacta antes de depender de terminos de redistribucion; riesgo para uso comercial sin verificacion legal.
- Idiomas soportados no declarados: no hay garantia de calidad multilingue.
- Tool calling, agentes y capacidades multimodales no documentados.
- El corpus de entrenamiento no se publica, lo que impide auditar sesgos o composicion de datos.
- Solo 0 descargas y 2 likes en el momento de la ficha: modelo muy reciente y sin validacion externa de la comunidad.
- Riesgo de alucinacion no cuantificado; no se publican evaluaciones de factualidad.

## Enlaces

- Hugging Face: https://huggingface.co/MK4-Research/Alkus-3.4-27B-Abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
