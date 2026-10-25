# dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v2-GGUF

## Resumen

Dongfangshuo-Qwen3.8-27B-NSFW-v2 es un ajuste fino de tipo *uncensored* (sin alineamiento de seguridad) derivado de huihui-ai/Huihui-Qwen3.8-27B-abliterated, un Qwen3.8-27B al que se le ha practicado *abliteration* (ablación de la dirección de rechazo en el espacio de activaciones). Sobre esa base, el autor (dongfangshuo) ha realizado un reentrenamiento orientado exclusivamente a la creación de novela larga en chino para adultos (R-18), con especial énfasis en la estabilidad del texto en generaciones muy extensas. El repositorio que nos ocupa es la versión cuantizada en GGUF del modelo, publicada el 9 de octubre de 2026 y actualizada el 25 del mismo mes, con 22.005 descargas acumuladas.

La relevancia técnica de esta v2 no está en el contenido —que es explícitamente para adultos y solo en chino— sino en el problema que declara resolver: el colapso de la atención en contextos largos y la repetición en bucle que sufre la v1 al superar cierto umbral de longitud. El autor afirma haber reentrenado los 12 módulos de atención y MLP (incluyendo `in_proj`/`out_proj`) en lugar de los 7 de la versión anterior, y publica una tabla de estrés cualitativa con generaciones forzadas de más de 10.000 caracteres. No hay resultados de benchmarks estándar ni detalles del dataset de entrenamiento.

El modelo tiene 26.895.998.464 parámetros (~26,9 B), se distribuye en un único GGUF Q4_K_M de 15,41 GB más un proyector visual `mmproj` en bf16 de 931 MB, y se puede ejecutar con Ollama mediante el `Modelfile` incluido o con llama.cpp/LM Studio/SillyTavern usando plantilla ChatML.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B (la model card no documenta bloques MoE ni híbridos) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no aplica (no se documenta arquitectura MoE) |
| Longitud de contexto | no disponible como spec oficial; las instrucciones de despliegue recomiendan `num_ctx` entre 8192 y 32768 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (15,41 GB), única cuantización publicada en este repositorio; proyector visual en bf16 (931 MB) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 (sujeta además a la licencia original de Qwen, según el autor) |
| Formato de pesos | GGUF (repo cuantizado); el modelo base del autor se publica en safetensors |
| Modelo base | huihui-ai/Huihui-Qwen3.8-27B-abliterated y dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW |
| Plantilla de prompt | ChatML (`<|im_start|>` / `<|im_end|>`) |
| Tamaño del repositorio | 19,3 GB |

## Arquitectura y entrenamiento

La model card no documenta el proceso de preentrenamiento del modelo original (número de tokens, composición del corpus, fases de RLHF/DPO). Lo que sí describe es el pipeline de personalización: se parte de una versión *abliterated* de Qwen3.8-27B —técnica que consiste en identificar y restar la dirección de activación asociada a la negativa a responder, en lugar de aplicar un ajuste con datos de rechazo— y sobre ella se aplica un reentrenamiento profundo orientado al estilo narrativo. En la v2 el autor declara cubrir la totalidad de los módulos de atención y MLP, incluidos los `in_proj`/`out_proj`, frente a los 7 módulos intervenidos en la v1 (versión "equilibrada", alojada en un repositorio separado).

El cambio de comportamiento declarado se centra en tres ejes: eliminación del "colapso de atención" (pérdida de coherencia a medida que crece la generación) y de los bucles de repetición; refuerzo del registro descriptivo sensorial y fisiológico (ritmo respiratorio, microexpresiones, luz y temperatura) frente al estilo de resumen administrativo que el autor atribuye al modelo base; y una supuesta mejora en la planificación de tramas largas, con estructura por actos y lenguaje de planificación de planos. Nada de esto viene acompañado de métricas objetivas, curvas de entrenamiento, tamaño del dataset ni hiperparámetros, por lo que debe tratarse como una afirmación del autor.

El modelo admite un modo de razonamiento explícito (etiquetas `<think>`), que el autor recomienda desactivar para escritura pura y activar cuando se busca planificación de trama. Los parámetros de muestreo sugeridos en la model card son: temperatura 0,75–0,85, `top_p` 0,90, `repeat_penalty` 1,15–1,18 y generación en tramos de 2.000–4.000 caracteres.

## Capacidades

- Generación de texto narrativo en chino: novela larga, relato, diálogo de personajes y descripción de escena, con foco declarado en la continuidad a lo largo de decenas de miles de caracteres.
- Escritura sin rechazo: el ajuste elimina las negativas de seguridad del modelo base, incluido contenido sexual explícito entre adultos ficticios.
- Diferenciación de voces por personaje: el autor reporta separación de registro y tono entre personajes en escenas de confrontación (v1 no lo conseguía de forma consistente, según su propia tabla).
- Planificación narrativa: generación de esquemas por actos, arcos de personaje y "planificación de planos" cuando se activa el modo de razonamiento.
- Multimodalidad de entrada: con el proyector `mmproj-model-bf16.gguf` cargado, acepta imágenes y las usa para extraer detalles y construir un guion o esquema a partir de ellas. El autor destaca la captura de elementos periféricos de la imagen (indicadores de interfaz, iconos de grabación), no solo el sujeto central.
- Capacidad de razonamiento multi-paso limitada al dominio narrativo: existencia de *thinking mode* (CoT), pero sin evaluación en tareas de matemáticas, código o lógica formal.
- Tool calling / function calling: no documentado.
- Capacidades de agente: no documentadas.
- Multilingüismo: no documentado; el único idioma declarado es el chino.

## Casos de uso

- **Escritura de novela por entregas en chino para plataformas de ficción para adultos**: el modelo está entrenado para mantener coherencia más allá de los 10.000 caracteres, lo que permite generar capítulos completos en una sola pasada con `num_ctx` de 16k–32k y continuar con instrucciones de "avanza a la siguiente fase", sin que la trama degenere en repeticiones.
- **Roleplay conversacional de personajes en SillyTavern o LM Studio**: la plantilla ChatML y el `Modelfile` incluido permiten cargarlo directamente como personaje con system prompt persistente; la separación de voces reportada por el autor es el factor relevante para escenas con varios personajes.
- **Generación de esquemas narrativos a partir de referencias visuales**: cargando el `mmproj`, se le puede pasar una imagen (ilustración, fotograma, captura) y pedirle un desglose por actos y planos; útil en preproducción de guion o *storyboard* narrativo.
- **Banco de pruebas de estabilidad en contexto largo**: para investigadores interesados en el fenómeno del *attention collapse* y los bucles degenerativos, la comparación v1/v2 sobre el mismo prompt de 10.000 caracteres es un caso de estudio reproducible con llama.cpp y `repeat_penalty` controlado.
- **Investigación sobre abliteration y alineación**: el modelo sirve para medir empíricamente qué se pierde y qué se gana al eliminar la dirección de rechazo de un modelo de ~27 B, y cómo un ajuste posterior afecta a la coherencia a largo plazo.
- **Escritura creativa local y privada**: al ejecutarse íntegramente en local con Ollama o llama-server, ningún texto sale de la máquina; adecuado para autores que trabajan con material sensible y no quieren enviarlo a APIs externas.
- **Generación de datos sintéticos de diálogo en chino**: útil para construir corpus de conversación multi-turno con registro coloquial y emocional variado, siempre que se aplique una capa de moderación y revisión posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, C-Eval) en la información disponible. El autor incluye únicamente una tabla de pruebas de estrés cualitativas, sin protocolo, sin semillas ni número de repeticiones, comparando el modelo base con la v1 y la v2:

| Criterio (cualitativo, informe del autor) | huihui-27b (base) | dongfangshuo v1 | dongfangshuo v2 |
|---|---|---|---|
| Desbloqueo de restricciones | Bloqueo de seguridad | Desbloqueo fluido | Desbloqueo profundo |
| Diferenciación de voces en diálogo explícito | Rechazo | Fluido, poca separación de registro | Separación marcada por personaje |
| Captura de detalles visuales (mmproj) | Solo objeto central | Captura elementos periféricos | Captura elementos periféricos |
| Profundidad de planificación de trama | Listado plano de material | Estructura con tensión | Estructura por actos y planos |
| Estabilidad en >10.000 caracteres con CoT | Cierre prematuro | Colapso de atención y bucle repetitivo | Progresión y cierre natural |
| Estabilidad en >10.000 caracteres sin CoT | Bucle en acciones locales | Bucle repetitivo indefinido | Sin bucle, llega al final |

Advertencia: estos datos proceden exclusivamente de la model card del autor, no son verificables de forma independiente y no constituyen una evaluación reproducible. No hay comparación con modelos de la competencia ni métricas automáticas (perplejidad, tasa de repetición, distancia a la distribución de referencia).

## Requisitos de hardware

- **VRAM estimada**: el GGUF Q4_K_M pesa 15,41 GB; con caché KV para 8k–32k tokens hay que sumar varios GB adicionales. El autor indica que encaja en GPUs de 24–32 GB (RTX 3090, RTX 4090, RTX 5090).
- **Multimodalidad**: si se carga el proyector visual, añadir 931 MB (bf16) al presupuesto de VRAM.
- **GPU recomendadas**: RTX 3090/4090 (24 GB) para Q4_K_M con `-ngl 99`; RTX 5090 (32 GB) para contexto completo de 32k; A100/H100 no son necesarias para esta cuantización, pero permitirían mayor `num_ctx` y lotes concurrentes.
- **Consumer GPU**: sí, es viable en GPUs de consumo de gama alta. Por debajo de 24 GB habría que descargar capas a CPU, con la consiguiente caída de velocidad.
- **Opciones de despliegue**: Ollama (`ollama create dfs-27b-v2 -f Modelfile`), llama.cpp / `llama-server`, LM Studio, SillyTavern. Para vLLM o TGI no hay ruta documentada con GGUF; requeriría el modelo en safetensors, del que no hay datos de compatibilidad en la información disponible.
- **Ejemplo de arranque**: `llama-server -m Dongfangshuo-Qwen3.8-27B-NSFW-v2-Q4_K_M.gguf --mmproj mmproj-model-bf16.gguf -c 16384 -ngl 99`.
- **Latencia y throughput**: no disponible. La única indicación operativa es la recomendación de generar en tramos de 2.000–4.000 caracteres y usar `repeat_penalty` entre 1,15 y 1,18 para sostener la distribución autoregresiva en textos largos.

## Comparativa con modelos similares

Comparación con las variantes de la misma familia, que son las únicas documentadas en la información disponible:

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dongfangshuo-Qwen3.8-27B-NSFW-v2 (este) | ~26,9 B | 8k–32k recomendado | Novela R-18 en chino, 12 módulos reentrenados, GGUF Q4_K_M | Apache-2.0 | Repo propio + espejos no oficiales |
| dongfangshuo-Qwen3.8-27B-NSFW v1 | ~26,9 B | 8k–32k recomendado | Versión equilibrada, 7 módulos ajustados; el autor reporta bucles en textos largos | Apache-2.0 | Repo separado del autor |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | ~26,9 B | no disponible | Base con abliteration, alineamiento de seguridad laxo pero presente | Apache-2.0 (heredada de Qwen) | HuggingFace |

No se dispone de datos objetivos (benchmarks, contexto máximo certificado, throughput) para establecer una comparación cuantitativa con alternativas de otros autores en la misma categoría. Las cuantizaciones de terceros (mradermacher, nancinicky) redistribuyen el mismo modelo, no son alternativas independientes.

## Limitaciones y advertencias

- **Contenido para adultos**: el modelo está diseñado explícitamente para generar material sexual explícito y carece de filtros internos. Requiere verificación de edad y una capa de moderación externa si se expone a usuarios finales.
- **Idioma único**: solo declara chino. El rendimiento en castellano, inglés o cualquier otra lengua no está documentado y previsiblemente será degradado respecto al base.
- **Sin benchmarks reproducibles**: todas las afirmaciones de mejora (estabilidad, voz de personaje, planificación) son cualitativas y del propio autor. No hay perplejidad, tasa de repetición ni evaluación por pares.
- **Riesgo de bucle persistente**: aunque el autor afirma haberlo erradicado, los modelos de ~27 B sin evaluación independiente siguen siendo propensos a la degeneración en generaciones muy largas; el propio `Modelfile` incluye penalizaciones anti-repetición, lo que sugiere que el problema se mitiga por muestreo, no solo por pesos.
- **Sesgos**: un ajuste entrenado sobre corpus narrativo en chino sin documentar hereda los sesgos de género, cuerpo y relaciones del material original; la eliminación de la dirección de rechazo también retira barreras frente a contenido violento o degradante, no solo sexual.
- **Alucinación**: el modelo antepone la verosimilitud narrativa a la factualidad; no debe usarse como fuente de información.
- **Licencia**: Apache-2.0 en el repositorio, pero el autor remite a la licencia original de Qwen. Conviene verificar la cadena de licencias del modelo base y del *abliterated* intermedio antes de un uso comercial.
- **Riesgo legal y de plataforma**: la distribución o publicación de contenido sexual explícito generado puede estar restringida por la legislación local y por los términos de servicio de la plataforma de destino. El repositorio está marcado como `not-for-all-audiences`.
- **Producción**: no hay soporte documentado para vLLM/TGI, ni métricas de latencia, ni tests de concurrencia; para servir a múltiples usuarios habría que validar el stack llama.cpp con mediciones propias.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v2-GGUF
- Versión v1 en GGUF: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-GGUF
- Modelo base del autor (safetensors): https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW
- Modelo base con abliteration: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Espejo de la v2: https://huggingface.co/nancinicky/Dongfangshuo-Qwen3.8-27B-NSFW-v2-GGUF
- Cuantizaciones de terceros (v1): https://huggingface.co/mradermacher/Dongfangshuo-Qwen3.8-27B-NSFW-GGUF
- Cuantizaciones de terceros (variante Novel): https://huggingface.co/mradermacher/Dongfangshuo-Qwen3.8-27B-NSFW-Novel-GGUF

No se han encontrado papers, blogs técnicos ni demos asociados al modelo en la búsqueda web realizada.
