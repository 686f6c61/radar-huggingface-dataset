# MUC-HeTong/BATA

## Resumen

BATA (Behavior-Aware Terminology Adaptation) es un conjunto de adaptadores LoRA para traduccion automatica entre tibetano y chino, desarrollado por MUC-HeTong. No es un modelo independiente: se entrena sobre el backbone HeTong-NMT-7B, un modelo de traduccion de 7.000 millones de parametros, y proporciona dos adaptadores especificos por direccion, `bo2zh` (tibetano a chino) y `zh2bo` (chino a tibetano). El problema que aborda es la traduccion precisa de terminologia especializada en un par de lenguas de bajos recursos.

La innovacion de BATA es el enfoque "behavior-aware": clasifica los ejemplos de entrenamiento segun como el backbone traduce cada termino objetivo con y sin pista terminologica, en tres categorias (exito estable, fallo recuperable y fallo residual). Con estos grupos entrena un adaptador LoRA por direccion manteniendo el backbone congelado. En inferencia, recupera pares de terminos de un inventario bilingue y, si la recuperacion devuelve pares utiles, los inyecta en el prompt y activa el adaptador correspondiente; en caso contrario, usa solo el backbone.

El repositorio tiene un tamano de 0.2 GB, coherente con pesos LoRA y no con un modelo completo. La model card no detalla arquitectura del backbone, contexto, licencia ni idiomas soportados mas alla del par tibetano-chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre backbone transformer HeTong-NMT-7B (arquitectura del backbone no detallada) |
| Parametros totales | no disponible (adaptadores LoRA; backbone de 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tibetano y chino (direcciones bo2zh y zh2bo) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BATA no define una arquitectura propia: son adaptadores LoRA entrenados sobre el backbone HeTong-NMT-7B, que permanece congelado durante el entrenamiento. Se generan dos adaptadores independientes, uno por direccion de traduccion (`bo2zh` y `zh2bo`). El proceso de entrenamiento parte de una clasificacion conductual de los ejemplos: se agrupan segun si el backbone traduce correctamente el termino sin pista (exito estable), si falla sin pista pero acierta con ella (fallo recuperable) o si sigue fallando incluso con pista (fallo residual). Estos grupos aportan tanto ejemplos de uso correcto de terminologia como casos que requieren correccion.

En inferencia, el sistema busca en un inventario terminologico bilingue en el idioma de origen; si la recuperacion devuelve pares utilizables, se anaden al prompt de traduccion y se activa el adaptador de la direccion correspondiente; si no, se usa unicamente el backbone. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Traduccion automatica tibetano-chino en ambas direcciones mediante adaptadores LoRA especificos.
- Adaptacion terminologica: inyeccion de pares de terminos bilingues recuperados en el prompt para forzar el uso de terminologia especializada.
- Recuperacion sobre un inventario terminologico bilingue en el idioma de origen, con activacion condicional del adaptador.
- Correccion de fallos recuperables: el adaptador se entrena especificamente con casos en los que el backbone falla sin pista y acierta con ella.
- Uso del backbone sin adaptador cuando la recuperacion no devuelve terminos utiles.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Traduccion de documentacion tecnica tibetana: el sistema recupera terminos especializados del inventario y los inyecta en el prompt, activando el adaptador `bo2zh` para asegurar consistencia terminologica en manuales y guias.
- Localizacion de materiales administrativos chino-tibetano: con el adaptador `zh2bo` y el inventario bilingue se mantiene la terminologia oficial en documentos institucionales.
- Publicacion de contenido medico o cientifico: la adaptacion terminologica permite fijar traducciones de terminos clinicos o tecnicos que el backbone traduciria de forma inconsistente sin pista.
- Sistemas de traduccion asistida para traductores profesionales: el flujo de recuperacion y activacion condicional del adaptador permite ofrecer sugerencias con terminologia controlada, manteniendo el backbone como fallback.
- Investigacion en traduccion de bajos recursos: el esquema de clasificacion conductual (exito estable, fallo recuperable, fallo residual) sirve como metodologia reproducible para adaptar modelos NMT a dominios especializados.
- Construccion de memorias de traduccion aumentadas: el inventario terminologico bilingue y los adaptadores permiten integrar terminologia corporativa en pipelines de traduccion existentes sobre HeTong-NMT-7B.
- Evaluacion comparativa de estrategias de adaptacion LoRA: al publicarse junto con BATA-data, permite reproducir experimentos de adaptacion terminologica sobre un backbone fijo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al ejecutarse sobre HeTong-NMT-7B, los requisitos vendran determinados por el backbone de 7B y no por los adaptadores LoRA (0.2 GB de repositorio).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende del backbone de 7B y de la cuantizacion empleada, dato no disponible.
- Opciones de despliegue: no se especifican frameworks (vLLM, llama.cpp, Ollama, TGI); la model card remite al repositorio de GitHub para los comandos de recuperacion, inferencia y evaluacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BATA (adaptadores LoRA) | Backbone 7B + LoRA | no disponible | Adaptacion terminologica behavior-aware sobre HeTong-NMT-7B | no disponible | Hugging Face (MUC-HeTong/BATA) |
| HeTong-NMT-7B | 7B | no disponible | Backbone NMT tibetano-chino sin adaptacion | no disponible | Hugging Face (MUC-HeTong/HeTong-NMT-7B) |
| Otros NMT tibetano-chino | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables adicionales en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar HeTong-NMT-7B como backbone y seleccionar el adaptador de la direccion correspondiente.
- La licencia no esta declarada, lo que impide confirmar condiciones de uso comercial.
- El alcance linguistico se limita al par tibetano-chino; no se documentan otros idiomas.
- La eficacia de la adaptacion depende de la calidad y cobertura del inventario terminologico bilingue: si la recuperacion no devuelve pares utiles, el sistema recurre al backbone sin adaptacion.
- No se detallan sesgos conocidos, tasas de alucinacion ni limitaciones de contexto.
- No hay informacion sobre el numero de tokens de entrenamiento, composicion del dataset ni proceso de alineacion (RLHF/DPO), lo que dificulta evaluar su robustez en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion externa.
- No se publican benchmarks ni resultados de evaluacion en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MUC-HeTong/BATA
- Backbone HeTong-NMT-7B: https://huggingface.co/MUC-HeTong/HeTong-NMT-7B
- Dataset BATA-data: https://huggingface.co/datasets/MUC-HeTong/BATA-data
- Repositorio GitHub (recuperacion, inferencia y evaluacion): https://github.com/MUC-HeTong/HeTong/tree/main/HeTong-NMT/BATA
