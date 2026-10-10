# ImposterOnline/Pyrz-8B-Instruct-Uncensored-GGUF

## Resumen

Pyrz-8B-Instruct-Uncensored-GGUF es un conjunto de pesos cuantizados en formato GGUF publicados por el usuario ImposterOnline sobre HuggingFace. Se trata de la version lista para inferencia local de Pyrex-8B-Instruct-Uncensored, un modelo de 7,6 mil millones de parametros afinado con QLoRA y orientado a tareas de codigo. El repositorio contiene cuatro variantes de cuantizacion (F16, Q4_K_M, Q5_K_M y Q8_0) pensadas para ejecutarse en GPU de consumo, desde 4,4 GB hasta 15,2 GB.

Segun fuentes externas, el modelo base es una variante "abliterated" y sin censura de BlossomsAI/Qwen2.5-Coder-7B-Instruct-Uncensored, por lo que heredaria la arquitectura transformer decoder-only de la familia Qwen2.5-Coder. No obstante, la model card del repositorio no detalla la arquitectura, los datos de entrenamiento ni la longitud de contexto, y la propia ficha presenta el nombre "Pyrex-8B" mientras el identificador del repositorio usa "Pyrz-8B", una discrepancia que conviene tener en cuenta al referenciarlo.

Su relevancia actual es limitada y muy nicho: se trata de un modelo con 35 descargas y 0 likes en el momento de la consulta, con licencia MIT y compatibilidad declarada con endpoints. Resulta interesante para quienes busquen un LLM pequeno, sin filtros de contenido y desplegable en una sola GPU de consumo, pero carece de benchmarks publicados y de documentacion tecnica solida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-Coder-7B segun fuentes externas; no confirmado en la model card) |
| Parametros totales | 7.615.616.512 (~7,6 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

Detalle de los ficheros incluidos en el repositorio:

| Fichero | Tamano | Notas |
|---|---|---|
| `pyrex-f16.gguf` | 15,2 GB | Precision completa (F16) |
| `pyrex-q4_k_m.gguf` | 4,4 GB | Opcion recomendada para uso diario |
| `pyrex-q5_k_m.gguf` | 5,1 GB | Mayor calidad |
| `pyrex-q8_0.gguf` | 8,1 GB | Mejor calidad |

Formato de chat: `chatml` (etiquetas `<|im_start|>` / `<|im_end|>`).

## Arquitectura y entrenamiento

La model card del repositorio GGUF no aporta informacion sobre la arquitectura, el proceso de entrenamiento, el numero de tokens ni la composicion del dataset. La unica informacion tecnica confirmada es que se trata de una cuantizacion del modelo base ImposterOnline/Pyrex-8B-Instruct-Uncensored y que el formato de prompt es ChatML. Fuentes de terceros (abliteratedmodels.org y featherless.ai) indican que el modelo base es una variante "abliterated" y sin censura de BlossomsAI/Qwen2.5-Coder-7B-Instruct-Uncensored, construida mediante un fine-tune QLoRA con una receta de datos propia del autor y orientada prioritariamente al codigo. Si esa filiacion es correcta, la arquitectura subyacente seria la de Qwen2.5 (transformer decoder-only con atencion completa, RoPE y sesgos QKV), pero este extremo no esta verificado en la documentacion oficial del repositorio.

No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, mezcla de expertos u otras). El unico rasgo diferencial declarado por terceros es la eliminacion de capas de rechazo ("abliteration") para producir respuestas sin filtros, junto con el enfoque coding-first de la receta de ajuste.

## Capacidades

- Generacion de texto conversacional en formato ChatML.
- Generacion de codigo, presumiblemente reforzada por su filiacion con Qwen2.5-Coder (no confirmado en la model card).
- Modo instruct: sigue instrucciones y mantiene dialogos multi-turno.
- Modelo "uncensored": ausencia declarada de filtros de rechazo en las respuestas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Asistente de programacion local: con la cuantizacion Q4_K_M (4,4 GB) el modelo cabe en una GPU de 8 GB y permite autocompletado y generacion de funciones en un entorno de desarrollo sin conexion a servicios externos.
- Generacion de codigo en pipelines offline: al estar en GGUF, puede integrarse en herramientas tipo llama.cpp u Ollama dentro de un flujo de trabajo de CI/CD para tareas de generacion de plantillas o transformaciones de codigo repetitivas.
- Prototipado rapido en una sola GPU de consumo: la variante Q5_K_M ofrece un equilibrio entre calidad y VRAM (5,1 GB), util para experimentar con prompts sin aprovisionar infraestructura en la nube.
- Redaccion tecnica sin restricciones tematicas: para la generacion de documentacion o contenidos donde los filtros de rechazo de modelos alineados resultan un obstaculo (con la advertencia legal correspondiente).
- Chat conversacional autoalojado: el formato ChatML y el tamano reducido permiten montar un servidor de chat en local con latencia baja, sin dependencia de API externas.
- Educacion e investigacion sobre modelos abliterated: sirve como caso de estudio para analizar el efecto de la eliminacion de capas de rechazo sobre el comportamiento del modelo, aunque sin benchmarks publicados la comparacion cuantitativa no es posible.
- Base para fine-tuning adicional: al ser un modelo denso de 7,6 B con licencia MIT, puede adaptarse con QLoRA en una GPU de 24 GB para dominios especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~4,5-5 GB con Q4_K_M, ~5,5-6 GB con Q5_K_M, ~9-10 GB con Q8_0 y ~16 GB con F16 (sin contar el contexto, que incrementa el consumo con la longitud de secuencia).
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q5_K_M y Q8_0; RTX 4090 (24 GB) o A100/H100 para F16.
- Cabe en GPU de consumo: si. Q4_K_M y Q5_K_M encajan en GPUs de 8 GB; Q8_0 requiere 12 GB o mas; F16 necesita 16-24 GB o reparto entre GPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, kobold.cpp; vLLM y TGI admiten GGUF con soporte parcial. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia tipo HuggingFace.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Pyrz-8B-Instruct-Uncensored (GGUF) | 7,6 B | no disponible | MIT | HuggingFace, 35 descargas | Sin benchmarks ni documentacion tecnica |
| Qwen2.5-Coder-7B-Instruct | 7,6 B | 32.768 tokens (extensible) | Apache 2.0 (segun el fabricante) | HuggingFace, ampliamente usado | Modelo base de referencia, con benchmarks publicados |
| Llama-3.1-8B-Instruct | 8 B | 128.000 tokens | Llama 3.1 Community License | HuggingFace, muy extendido | Mayor contexto, licencia con restricciones |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 tokens | Apache 2.0 | HuggingFace, muy extendido | Buen equilibrio calidad/tamano, con benchmarks publicados |

La comparacion es orientativa: los tres modelos alternativos cuentan con documentacion tecnica y resultados de evaluacion publicos, mientras que Pyrz-8B no aporta ninguno. La principal ventaja diferencial de Pyrz-8B es su caracter "uncensored" y su licencia MIT; su principal desventaja es la ausencia total de datos verificables sobre rendimiento, contexto e idiomas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no se puede verificar la calidad del modelo frente a alternativas del mismo tamano.
- Modelo "uncensored"/abliterated: la eliminacion de capas de rechazo incrementa el riesgo de generar contenido danino, ofensivo o ilegal; no es apropiado para aplicaciones orientadas al publico general sin moderacion externa.
- Riesgo de alucinacion: como cualquier LLM de 7,6 B sin alineacion reforzada, puede inventar datos con alta confianza; no se ha documentado ningun proceso de RLHF o DPO que lo mitigue.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de contexto extendido.
- Idiomas soportados no documentados: aunque probablemente herede el multilinguismo de Qwen2.5, no hay confirmacion oficial.
- Discrepancia de nomenclatura: el identificador del repositorio ("Pyrz") no coincide con el nombre usado en la model card ("Pyrex"), lo que puede generar confusion en integraciones y busquedas.
- Licencia: la model card del repositorio GGUF declara MIT, pero una fuente externa atribuye licencia Apache 2.0 al modelo base; conviene verificar la licencia efectiva antes de un uso comercial.
- Adopcion marginal: con 35 descargas y 0 likes, no existe una comunidad que haya validado el modelo en produccion.
- Repositorio de gran tamano (33,5 GB): la descarga completa de todas las cuantizaciones es costosa en ancho de banda y almacenamiento.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/ImposterOnline/Pyrz-8B-Instruct-Uncensored-GGUF
- Modelo base en HuggingFace: https://huggingface.co/ImposterOnline/Pyrex-8B-Instruct-Uncensored
- Arbol de ficheros del modelo base: https://huggingface.co/ImposterOnline/Pyrex-8B-Instruct-Uncensored/tree/main
- Ficha en abliteratedmodels.org: https://www.abliteratedmodels.org/pyrex-8b-instruct-uncensored/
- Ficha en featherless.ai: https://featherless.ai/models/ImposterOnline/Pyrex-8B-Instruct-Uncensored
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/ImposterOnline/Pyrex-8B-Instruct-Uncensored
