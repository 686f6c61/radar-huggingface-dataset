# mecattaf/Ornith-1.5-9B-Bonaire-Preview

## Resumen

Ornith-1.5-9B-Bonaire-Preview es un snapshot de investigación publicado por el usuario mecattaf en Hugging Face. No se trata de un modelo listo para inferencia, sino de un paquete de preservación de trabajo de adaptación sobre el modelo base ornith-ai/Ornith-1.5-9B-GGUF. El repositorio contiene descriptores, inventarios GGUF acotados, recetas de compilación explícitamente bloqueadas, bundles PKRN nativos para gfx704 y recibos numéricos vinculados a las fuentes. El propio autor indica de forma explícita que la inferencia no está soportada y que los binarios nativos no han sido cualificados en PS4.

El envío no incluye pesos ni un model.idx desplegable: el campo contains_weights está marcado como false y el tamaño del repositorio es de 0.0 GB. El GGUF original publicado por el autor del modelo base permanece sin cambios y no se ha realizado ninguna cuantización nueva. El objetivo declarado es preservar referencias exactas de código fuente y trabajo de adaptación, no entregar un artefacto ejecutable. Las puertas de validación del paquete completo del modelo siguen bloqueadas y este snapshot no las omite.

La relevancia de esta ficha es acotada: sirve como caso de estudio de empaquetado reproducible de modelos y de gestión de licencias, no como modelo para evaluar capacidades. El modelo base subyacente es un Ornith-1.5 de 9B parámetros, del que este repositorio solo conserva metadatos y artefactos de preparación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el snapshot no incluye pesos ni configuración del modelo base) |
| Parametros totales | 9B (según el nombre del modelo base; no verificado en este repositorio) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (referenciado en el GGUF fuente enlazado; no se ha realizado cuantización nueva en este repo) |
| Idiomas soportados | no disponible |
| Licencia | GPL-3.0 para el software de adaptación; el modelo fuente declara MIT, con LICENSE enlazada que devuelve 404 |
| Formato de pesos | GGUF (fuente enlazada); el snapshot prepara weights.bin empaquetado sin pérdida y model.idx versionado, pero no los incluye (contains_weights: false) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Ornith-1.5-9B en la documentación proporcionada. El snapshot de Bonaire no contiene pesos ni configuración, por lo que no es posible confirmar si se trata de un transformer denso, un MoE o una arquitectura híbrida. El nombre del modelo base sugiere 9B parámetros, pero este dato no se verifica dentro del repositorio.

El trabajo de adaptación documentado se centra en el empaquetado y la compilación de kernels nativos para la plataforma gfx704 (PS4), con bundles PKRN y manifiestos. Se menciona la recuperación byte a byte del módulo de laboratorio DeltaNet original previo a la corrección, con un addendum separado vinculado en original-deltanet-recovery.json. No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF o DPO.

## Capacidades

- No se puede evaluar ninguna capacidad del modelo a partir de este repositorio, ya que no contiene pesos ni artefacto de inferencia desplegable.
- El autor declara explícitamente "Inference unsupported".
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas o visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- El snapshot preserva artefactos de preparación de modelo (descriptores, inventarios GGUF, kernels PKRN, recibos numéricos), no capacidades funcionales.

## Casos de uso

- Auditoría de cadena de suministro de modelos: el repositorio conserva el SHA-256 del GGUF fuente (70c112196e0b7023803c9762752e46d29e612a92c83f995bc3ba1ceb07e8fab6), lo que permite verificar la integridad del artefacto original sin depender de la disponibilidad del enlace upstream.
- Estudio de empaquetado reproducible: sirve como referencia para diseñar pipelines que empaqueten pesos en weights.bin sin pérdida junto con un model.idx versionado, con recibos numéricos vinculados a la fuente.
- Investigación de portabilidad a hardware no convencional: los bundles PKRN y manifiestos para gfx704 documentan el proceso de compilación de kernels nativos para una plataforma no soportada oficialmente, útil para equipos que trabajen en portes similares.
- Gestión de licencias en derivados: el repositorio retiene snapshots de la model card y de la API, además de un registro de entrada faltante (LICENSE 404), lo que constituye un ejemplo práctico de trazabilidad legal en modelos derivados.
- Reproducción de experimentos de laboratorio: el addendum original-deltanet-recovery.json permite recuperar byte a byte el módulo DeltaNet previo a la corrección, útil para comparar resultados antes y después de un fix.
- Formación y documentación interna: como ejemplo de lo que un snapshot de preservación debe y no debe incluir, para equipos que definan políticas de publicación de artefactos intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio no incluye pesos y la inferencia no está soportada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible para este snapshot. El GGUF fuente Q4_K_M podría cargarse con llama.cpp u Ollama, pero ese artefacto reside en el repositorio upstream ornith-ai/Ornith-1.5-9B-GGUF, no en este.
- Latencia y throughput: no disponible.
- Nota de plataforma: se mencionan bundles nativos para gfx704 (PS4) y se indica explícitamente que los binarios nativos no han sido cualificados en PS4.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría, dado que este repositorio no es un modelo funcional sino un snapshot de preservación de trabajo de adaptación.

## Limitaciones y advertencias

- El repositorio no contiene pesos (contains_weights: false) ni un model.idx desplegable; no es posible ejecutar inferencia con él.
- El autor declara explícitamente que la inferencia no está soportada y que la plataforma PS4 no está cualificada.
- Las puertas de validación del paquete completo del modelo permanecen bloqueadas; este snapshot no las omite.
- La licencia del modelo fuente es ambigua: la model card declara MIT, pero la LICENSE enlazada devuelve 404. El software de adaptación es GPL-3.0, con avisos MIT/Apache para los oráculos. Cualquier uso comercial debe resolverse con el autor del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- No hay información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas del modelo base en la documentación proporcionada.
- El tamaño del repositorio es de 0.0 GB, lo que confirma la ausencia de artefactos pesados.
- No debe confundirse este snapshot con el modelo Ornith-1.5-9B operativo; para ello debe acudirse al repositorio upstream.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mecattaf/Ornith-1.5-9B-Bonaire-Preview
- Modelo base en Hugging Face: https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF
- GGUF fuente (Q4_K_M): https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF/resolve/abdd624b12ebf020b767fff532ff44fe552b28c3/Ornith-1.5-9B-Q4_K_M.gguf
- Código fuente del motor Bonaire: https://github.com/mecattaf/bonaire-engine/tree/1c337b8eb29b7e5eb9e0e561f028d241f3ec31d9
