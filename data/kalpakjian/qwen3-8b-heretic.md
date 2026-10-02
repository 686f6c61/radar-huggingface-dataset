# kalpakjian/qwen3-8b-heretic

## Resumen

Qwen3-8B-Heretic es una variante derivada, no oficial, del modelo Qwen/Qwen3-8B de Alibaba Qwen, publicada por el usuario kalpakjian en HuggingFace. Se ha generado aplicando el protocolo de "abliteracion" Heretic (trial 131 de 200, variante denominada `qwen3-8b-heretic-200t`) sobre el modelo base, con el objetivo de eliminar la direccion de rechazo aprendida durante el alineamiento de seguridad sin degradar de forma significativa la capacidad general del modelo. El resultado es un modelo de 8.190.735.360 parametros (aproximadamente 8,2 mil millones) que conserva la arquitectura y el tokenizador del original.

El interes de este tipo de derivados radica en la investigacion sobre mecanismos de rechazo, interpretabilidad y modificacion de modelos sin reentrenamiento. La model card reporta una divergencia KL de 0,0323 en el primer token respecto al modelo fuente sobre 20 prompts inocuos, por debajo del umbral `<0.05` que Heretic considera "dano minimo", y una validez de tool-calls y JSON del 100%, identica a la del original.

Es importante subrayar que se trata de un modelo experimental, con 0 descargas y 0 likes en el momento de redactar esta ficha, pensado para investigacion y experimentacion personal, y explicitamente desaconsejado por su propio autor para despliegues en produccion que requieran moderacion de contenido o garantias de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal (derivado de Qwen3-8B) |
| Parametros totales | 8.190.735.360 (~8,2B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la model card de este repo; el modelo base Qwen3-8B y la variante hermana p-e-w/Qwen3-8B-heretic declaran 32.768 tokens nativos, extensibles a 131.072 con YaRN |
| Tipos de cuantizacion | safetensors en precision completa (4 shards, ~15,3 GB) y GGUF en `q4_K_S`, `q4_K_M` y `q8_0` |
| Idiomas soportados | en, zh (segun la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-8B original: un transformer denso causal con atencion por grupos de consultas (GQA) y el tokenizador propio de la familia Qwen3. No se trata de un MoE ni de un modelo hibrido SSM, por lo que todos los parametros estan activos en cada paso de inferencia. El proceso de creacion no implica entrenamiento desde cero ni fine-tuning supervisado, sino una modificacion de pesos sin entrenamiento (training-free) mediante el protocolo Heretic, que identifica y ablaciona la direccion latente asociada al comportamiento de rechazo.

Segun la propia model card, la ablacion se realizo sobre el commit `b968826d` de `Qwen/Qwen3-8B` aplicando el trial 131 de 200 pruebas con sensibilidad (sensitivity-aware trials). Ademas del ajuste de pesos, el autor reporta evaluacion de retencion de capacidad frente al modelo fuente con 20 prompts inocuos (seed=42, temperatura 0,6, top_p 0,95, top_k 20, max_new_tokens 256): divergencia KL media de 0,0323 en el primer token, validez JSON y de tool-calls del 100%, ausencia de tics de disclaimer de IA y de repeticion final, y ratios Distinct-2 iguales o superiores a los del modelo original en pruebas de QA, codigo y razonamiento. No se documentan datos de entrenamiento adicionales, dataset, RLHF ni DPO, ya que no se ha realizado ninguna fase de entrenamiento.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del Qwen3-8B base.
- Razonamiento y matematicas, con la posibilidad de activar modos de pensamiento del modelo base (thinking / non-thinking) segun la familia Qwen3.
- Generacion de codigo, con validez de tool-calls y JSON reportada del 100% en la evaluacion del autor.
- Tool calling y function calling, apto para integracion en flujos que requieran salida estructurada.
- Soporte de conversaciones multi-turno (pipeline `text-generation`, tag `conversational`).
- Capacidades multilingues limitadas segun la model card a ingles y chino.
- Capacidad principal diferencial: comportamiento de rechazo reducido de forma deliberada, util para investigacion sobre alineamiento y seguridad.
- No se documentan capacidades de vision, audio ni modalidades adicionales.

## Casos de uso

- Investigacion sobre alineamiento y mecanismos de rechazo: el modelo sirve como sujeto de estudio para comparar la direccion de rechazo ablacionada frente al Qwen3-8B original, con metricas de divergencia KL reproducibles.
- Red-teaming y evaluacion de seguridad: se puede emplear como generador adversario para probar clasificadores de contenido y sistemas de moderacion en condiciones de baja tasa de rechazo.
- Generacion de datos sinteticos para entrenar filtros de seguridad: sus respuestas sin rechazo permiten construir conjuntos de ejemplos etiquetados para clasificadores de contenido sensible.
- Asistente local sin conexion: desplegado en Ollama o llama.cpp con los GGUF `q4_K_M` o `q8_0`, puede ejecutarse integramente en hardware de consumo para tareas de escritura y generacion de texto.
- Generacion y refactorizacion de codigo en pipelines locales: la validez de tool-calls al 100% permite usarlo como generador de estructuras JSON o llamadas a funciones en scripts de automatizacion.
- Escritura creativa y ficcion sin restricciones de rechazo: util para autores que necesitan tramas con contenido dificil (violencia, conflicto) sin interrupciones del modelo.
- Experimentacion con codificadores de texto para modelos de generacion de imagen: existen precedentes de uso de variantes heretic de Qwen3-8B como codificador de texto en generadores de imagen, aunque no esta confirmado para este repositorio concreto.
- Evaluacion comparativa de cuantizaciones: los informes en `refusal_audit_q4ks/` y `refusal_audit_q80/` permiten estudiar como la cuantizacion afecta a la tasa de rechazo y a la precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor si publica metricas internas de retencion de capacidad y de auditoria de rechazo:

| Metrica | Resultado |
|---|---|
| Divergencia KL media en primer token (abliterado vs. fuente) | 0,0323 |
| Validez JSON / tool-call | 100% (igual que el modelo fuente) |
| Distinct-2 en QA, codigo y razonamiento | igual o superior al modelo fuente |
| Tics de disclaimer de IA / repeticion final | ninguno detectado |

Auditoria de rechazo por cuantizacion:

| Cuantizacion | Tasa de rechazo en alto riesgo | Precision en tareas |
|---|---|---|
| `q4_K_M` | ~4% | ~52% |
| `q8_0` | ~2% | ~51% |
| `q4_K_S` | ~0% | ~49% |

## Requisitos de hardware

- Inferencia en precision completa (bf16/fp16): ~16 GB de VRAM solo para pesos, mas overhead de KV cache; se recomienda una GPU de 24 GB o superior.
- Cuantizacion `q8_0`: aproximadamente 8-9 GB de pesos; cabe en RTX 3090, RTX 4090, RTX 4080 y GPUs con 12-16 GB.
- Cuantizacion `q4_K_M`: aproximadamente 5 GB de pesos; cabe en RTX 3060 12 GB, RTX 4060 Ti, e incluso en GPUs de 8 GB con contexto reducido.
- Cuantizacion `q4_K_S`: aproximadamente 4,5-5 GB; la variante mas ligera distribuida en el repo, tambien publicada en agregadores externos con un peso en torno a 3,67 GB.
- GPUs profesionales recomendadas para produccion o evaluacion a gran escala: A100 40/80 GB, H100, L40S.
- Opciones de despliegue: transformers con `device_map="auto"`, llama.cpp, Ollama (via Modelfile apuntando a los GGUF), y servidores compatibles con el tag `endpoints_compatible` del repo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kalpakjian/qwen3-8b-heretic | ~8,2B | no especificado en su card (32.768 en el base Qwen3-8B) | Transformer denso abliterado | Apache-2.0 | HuggingFace, safetensors + GGUF |
| Qwen/Qwen3-8B | ~8,2B | 32.768 (131.072 con YaRN) | Transformer denso alineado | Apache-2.0 | HuggingFace, oficial |
| p-e-w/Qwen3-8B-heretic | ~8,2B | 32.768 (131.072 con YaRN) | Transformer denso abliterado con Heretic v1.1.0 | Apache-2.0 | HuggingFace, Featherless |
| ZuzeTt/Qwen3-VL-8B-Thinking-heretic | no disponible | no disponible | Variante multimodal abliterada | no disponible | HuggingFace |

No se dispone de resultados de benchmarks comparativos publicados para estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y naturaleza del modelo.

## Limitaciones y advertencias

- El modelo ha reducido deliberadamente su comportamiento de rechazo; su autor lo desaconseja explicitamente para produccion con requisitos de moderacion o garantias de seguridad.
- Riesgo elevado de generar contenido danino, sesgado o inexacto sin filtros protectores; la tasa de rechazo en prompts de alto riesgo es de aproximadamente 0-4% segun la cuantizacion.
- Riesgo de alucinacion propio de un modelo de 8B sin mecanismos de verificacion externos; no se han publicado tasas de alucinacion medidas.
- Cobertura idiomatica declarada limitada a ingles y chino; el rendimiento en castellano no esta documentado.
- La evaluacion de retencion de capacidad se basa en una muestra pequena (20 prompts, seed=42), por lo que las conclusiones sobre degradacion no son extrapolables a todos los dominios.
- La cuantizacion afecta a la tasa de rechazo y a la precision en tareas: `q4_K_S` presenta menor precision (~49%) que `q4_K_M` (~52%) y `q8_0` (~51%).
- Licencia Apache-2.0, heredada del modelo base; permite uso comercial en teoria, pero el aviso del autor restringe el uso responsable y recomienda no desplegarlo en produccion.
- Es un derivado no oficial: el soporte y la trazabilidad son responsabilidad del publicador, no de Alibaba Qwen.
- El repositorio presenta 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad.
- No se han verificado de forma independiente las afirmaciones de la model card sobre retencion de capacidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kalpakjian/qwen3-8b-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Variante hermana (p-e-w): https://featherless.ai/models/p-e-w/Qwen3-8B-heretic
- Organizacion Heretic: https://huggingface.co/heretic-org/models
- Variante multimodal abliterada: https://huggingface.co/ZuzeTt/Qwen3-VL-8B-Thinking-heretic
- Ficha en local-ai-zone (GGUF): https://local-ai-zone.github.io/models/qwen3-8b-heretic.html
- README espejo en ModelHub: https://dev.modelhub.org.cn/DreamFast/qwen3-8b-heretic/src/branch/main/README.md
