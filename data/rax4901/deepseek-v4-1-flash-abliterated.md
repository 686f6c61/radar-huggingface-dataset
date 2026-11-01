# rax4901/DeepSeek-V4.1-Flash-Abliterated

## Resumen
DeepSeek-V4.1-Flash-Abliterated es una variante modificada a nivel de pesos del modelo DeepSeek-V4.1-Flash, publicada por el usuario rax4901 en HuggingFace. Se trata de un modelo de arquitectura MoE (mixture of experts) multimodal con 756.410.543.314 parametros totales almacenados en safetensors, derivado del modelo base de deepseek-ai mediante una tecnica de "abliteration" que elimina la direccion de rechazo en el espacio de pesos. El objetivo declarado es conseguir que el modelo responda a instrucciones que el modelo original rechazaria, manteniendo supuestamente la calidad general en escritura, explicaciones y razonamiento.

La relevancia de esta ficha es doble: por un lado, documenta una practica creciente en la comunidad open source (la abliteration de modelos alineados); por otro, permite evaluar los riesgos tecnicos y legales de desplegar variantes sin alineacion de seguridad en produccion. El modelo conserva la mayor parte de la estructura del original (torre de vision, atencion CSA2, cabezal de borrador DSpark, tablas de memoria Engram) y solo modifica 40 tensores de proyeccion de salida de atencion y las proyecciones down de los expertos enrutados y compartidos.

La licencia declarada es MIT, lo que facilita tecnicamente el uso comercial, aunque las implicaciones eticas y de responsabilidad de un modelo "uncensored" deben valorarse con cuidado. El repositorio ocupa 765,6 GB y acumula 196 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (deepseek_v41) con atencion CSA2, torre de vision, tablas de memoria Engram y cabezal de borrador DSpark |
| Parametros totales | 756.410.543.314 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 para expertos enrutados (config `quantization_config.expert_dtype: "fp8"`); el modelo base usa FP4 nativo para expertos; no se documentan otras cuantizaciones (GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8 en expertos; resto segun modelo base) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura del DeepSeek-V4.1-Flash original: un transformer con mezcla de expertos (MoE), atencion CSA2, torre de vision para entrada multimodal, tablas de memoria Engram y un cabezal de borrador DSpark (probablemente orientado a decodificacion especulativa o generacion de borradores). El autor indica que todo el modelo es byte-identico al base salvo dos conjuntos de tensores: (1) las proyecciones de salida de atencion `layers.N.attn.wo_b` (40 tensores mas escalas UE8M0), ortogonalizadas contra la direccion de rechazo y transplantadas desde la abliteration publicada por dealignai (verificadas byte a byte); y (2) las proyecciones down de expertos enrutados y compartidos `layers.N.ffn.experts.E.w2` y `layers.N.ffn.shared_experts.w2`, ortogonalizadas contra direcciones de rechazo medidas por capa con 79 prompts daninos frente a 79 benignos, capturando la diferencia de medias del flujo residual colapsado en cada bloque con la implementacion de referencia en tensor-parallel 4.

Los expertos se almacenan en FP8 (conversion sin perdida FP4 a FP8 del toolchain de referencia) para que las ediciones sobrevivan a la cuantizacion. No se documenta el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO en el modelo base; el autor tampoco aporta informacion sobre el proceso de alineacion original de DeepSeek-V4.1-Flash. La innovacion tecnica destacable es precisamente el metodo de abliteration a nivel de pesos con preservacion de la estructura multimodal y del cabezal de borrador, algo poco habitual en variantes uncensored de modelos de este tamano.

## Capacidades
- Generacion de texto y razonamiento de proposito general, heredados del modelo base.
- Procesamiento multimodal: conserva la torre de vision del modelo original, por lo que se espera soporte de entrada de imagenes (aunque el autor no detalla el formato exacto).
- Soporte de tool calling y function calling, estructuralmente preservado segun el autor.
- Razonamiento multi-paso y control de esfuerzo de razonamiento ("reasoning-effort control") preservado estructuralmente.
- Comportamiento multi-turno preservado, con deriva esperable segun el autor.
- Capacidades multilingues: no disponibles en la informacion proporcionada; se asume herencia del modelo base.
- Modo "thinking" o razonamiento extendido: el autor menciona control de esfuerzo de razonamiento, lo que sugiere modos de razonamiento configurables.
- Cumplimiento de instrucciones daninas: el autor verifica explicitamente respuestas detalladas a construccion de artefactos explosivos, robo de numeros de la seguridad social, hurto en tiendas, ficcion explicita y fabricacion de venenos.

## Casos de uso
- Investigacion sobre alineacion y seguridad: el modelo sirve como caso de estudio controlado para medir cuanto cambia el comportamiento de un modelo al eliminar la direccion de rechazo a nivel de pesos, comparando respuestas con el base en un banco de prompts daninos y benignos.
- Red teaming y evaluacion de robustez: util para generar respuestas que un modelo alineado rechazaria y asi probar clasificadores de contenido, filtros de salida y sistemas de moderacion en pipelines de seguridad.
- Generacion de ficcion explicita o narrativa sin restricciones: escritores que necesiten contenido adulto o violento en contextos creativos pueden usar el modelo, aunque con revision editorial obligatoria.
- Analisis de sesgos y deriva conductual: comparar las respuestas del modelo abliterado con el base en tareas de escritura, explicacion y razonamiento para cuantificar la perdida de capacidad y la verbosidad adicional.
- Despliegue en entornos de investigacion cerrados: laboratorios que necesiten un modelo multimodal de gran tamano sin capa de rechazo para experimentos de interpretabilidad o extraccion de caracteristicas, con acceso restringido y sin exposicion publica.
- Estudio de tecnicas de cuantizacion: dado que el autor convierte expertos de FP4 a FP8 y edita pesos, el modelo permite analizar como sobreviven las modificaciones de pesos a la cuantizacion y que impacto tiene en la calidad.
- Evaluacion de tool calling y agentes en escenarios sin salvaguardas: probar la robustez de orquestadores de agentes cuando el modelo subyacente no rechaza acciones potencialmente daninas, en un entorno sandbox.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor no aporta metricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con el modelo base; solo afirma cualitativamente que la calidad general (escritura, explicaciones, razonamiento) se preserva y que la abliteration "sacrifica un poco de capacidad general por cumplimiento".

## Requisitos de hardware
- VRAM estimada para inferencia: con 756,4 mil millones de parametros totales y expertos en FP8, el peso completo ronda los 756 GB en FP8; se necesita un nodo multi-GPU con al menos 8 GPU de 96 GB (H100/H200) o 16 GPU de 48 GB para cargar el modelo completo sin cuantizacion adicional. No se dispone de datos de cuantizacion a 4 bits para esta variante.
- GPU recomendadas: H100 SXM 80 GB, H200 141 GB, A100 80 GB en configuraciones multi-nodo; el autor menciona inferencia con tensor-parallel 4 durante la captura de direcciones de rechazo, lo que sugiere que el modelo base puede ejecutarse en 4 GPU de gran memoria con el toolchain de referencia.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en ninguna GPU consumer individual; requeriria cuantizaciones agresivas no publicadas.
- Opciones de despliegue: transformers con el toolchain de referencia de DeepSeek; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para esta variante. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de HuggingFace.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-Abliterated (este) | 756,4 B | no disponible | MIT | safetensors FP8 | Variante uncensored, sin benchmarks publicados |
| deepseek-ai/DeepSeek-V4.1-Flash (base) | no disponible en la informacion | no disponible | no disponible | no disponible | Modelo original alineado, con rechazo activo |
| Otras variantes abliterated de dealignai | no disponible | no disponible | no disponible | no disponible | Fuente del edit de o_proj reutilizado |

No se dispone de datos suficientes para comparar rendimiento, contexto o parametros activos con alternativas de la misma categoria; la comparativa se limita a la relacion con el modelo base y la fuente del edit.

## Limitaciones y advertencias
- El modelo elimina deliberadamente la capa de rechazo: puede generar contenido danino (explosivos, fraude, venenos, ficcion explicita) sin filtros, lo que supone un riesgo grave si se expone a usuarios no supervisados.
- La abliteration degrada la capacidad general: el autor reconoce cierta perdida de calidad y mayor verbosidad ocasional; no hay metricas que cuantifiquen esa perdida.
- Deriva conductual esperable en vision, herramientas, razonamiento y multi-turno, segun el propio autor.
- Riesgo de alucinacion: no se documenta ninguna evaluacion especifica; al ser un modelo de gran tamano sin benchmarks publicados, la fiabilidad factual no esta verificada.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera del ingles o de los idiomas del modelo base.
- Licencia MIT declarada, pero la responsabilidad legal por el uso del modelo recae en el desplegador; el contenido generado puede infringir normativas de seguridad, proteccion de datos o derechos de terceros.
- El repositorio es una publicacion de un usuario individual (rax4901) sin verificacion de la organizacion DeepSeek; no hay garantias de mantenimiento, soporte ni integridad futura.
- El modelo ocupa 765,6 GB y requiere hardware de datacenter; no es viable en entornos de consumo.
- La decodificacion greedy degenera segun el autor; se recomienda temperature 1.0 y top_p 0.95, lo que anade no determinismo en produccion.
- No se documenta el proceso de captura de direcciones de rechazo mas alla de 79 prompts daninos y 79 benignos, una muestra pequena que puede no cubrir todos los dominios de rechazo.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/rax4901/DeepSeek-V4.1-Flash-Abliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Fuente del edit de o_proj: https://huggingface.co/dealignai
- Organizacion DeepSeek: https://huggingface.co/deepseek-ai
