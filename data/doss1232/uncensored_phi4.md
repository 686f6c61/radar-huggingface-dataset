# doss1232/uncensored_phi4

## Resumen

`doss1232/uncensored_phi4` es un ajuste fino (fine-tune) publicado por el usuario doss1232 sobre `unsloth/phi-4-unsloth-bnb-4bit`, una version cuantizada a 4 bits y preparada para entrenamiento con Unsloth del modelo Phi-4. El repositorio esta etiquetado como `transformers`, `safetensors`, `text-generation-inference`, `unsloth`, `llama` y `trl`, y se distribuye bajo licencia apache-2.0 con soporte declarado unicamente para ingles.

El modelo se presenta explicitamente como un fine-tune de tipo "uncensored", es decir, orientado a reducir o eliminar las capas de rechazo y moderacion del modelo original. Se ha entrenado, segun la model card, con Unsloth ("2x faster"), lo que situa el flujo de trabajo en el terreno del ajuste eficiente con LoRA/QLoRA sobre pesos cuantizados. No se documentan ni el dataset, ni el numero de pasos, ni hiperparametros.

La relevancia de la ficha es doble: por un lado, el modelo base (Phi-4 en su version densa) es una referencia habitual en el rango de los 14B parametros por su rendimiento en razonamiento y matematicas; por otro, el repositorio presenta senales de publicacion incompleta (0 descargas, 0 likes, 0,3 GB de tamano de repo, model card practicamente vacia) que conviene verificar antes de considerarlo para cualquier uso real. Los datos tecnicos concretos de este fine-tune no estan publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card. El tag de libreria es `transformers` y el modelo base procede de la familia Phi-4, basada en transformers densos decoder-only |
| Parametros totales | No disponible. El modelo base es una version cuantizada a 4 bits (bnb-4bit) de Phi-4, que en su variante densa tiene 14B parametros |
| Parametros activos | No aplica (no se indica que sea un modelo Mixture of Experts) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible. El modelo base esta cuantizado a 4 bits (bitsandbytes 4-bit) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | unsloth/phi-4-unsloth-bnb-4bit |
| Libreria | transformers |
| Tamano del repositorio | 0,3 GB |
| Fecha de publicacion | 2026-10-06 |
| Fecha de actualizacion | 2026-10-06 |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura, el dataset ni el procedimiento de entrenamiento. Los unicos datos disponibles son: el modelo se ha ajustado a partir de `unsloth/phi-4-unsloth-bnb-4bit`, se ha entrenado con la libreria Unsloth (que aplica optimizaciones de kernel y memoria para fine-tuning de LoRA/QLoRA sobre pesos cuantizados a 4 bits) y esta etiquetado con `trl` y `text-generation-inference`, lo que indica que el ajuste se realizo previsiblemente con TRL sobre una base cuantizada en 4 bits. No se indica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o SFT adicionales.

El nombre del repositorio (`uncensored`) sugiere que el objetivo del ajuste es reducir la probabilidad de respuestas de rechazo del modelo base, algo que en la practica se consigue con datasets de instrucciones sin filtrado de contenido sensible. No hay informacion verificable sobre ese dataset ni sobre el grado real de "descensura" conseguido. Tampoco se documentan innovaciones tecnicas propias: el valor diferencial declarado es el uso de Unsloth como acelerador del entrenamiento, no un cambio arquitectonico.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Phi-4 (razonamiento, matematicas y codigo en su version densa original).
- Ajuste orientado a reducir rechazos y moderacion, segun declara el propio nombre del repositorio.
- Compatibilidad declarada con `text-generation-inference`, por lo que puede servirse como endpoint de generacion de texto.
- Compatibilidad con el ecosistema transformers y con pesos en safetensors.
- No hay informacion disponible sobre soporte de tool calling o function calling en este fine-tune concreto.
- No hay informacion disponible sobre capacidades de agente o razonamiento multi-paso especificas de este ajuste.
- No hay informacion disponible sobre modo "thinking", vision, audio ni otras capacidades multimodales.
- Cobertura multilingue limitada: solo ingles declarado.

## Casos de uso

- Generacion de texto creativo sin filtros por defecto: escritura de ficcion, guiones o narrativa con tematicas adultas o sensibles, donde el operador asume la responsabilidad editorial y legal del contenido generado.
- Investigacion sobre alineamiento y seguridad: el modelo sirve como caso de comparacion frente al modelo base para medir como cambia la tasa de rechazos, la veracidad y la toxicidad tras un fine-tune sin filtrado.
- Generacion de datos sinteticos para entrenamiento: produccion de pares instruccion-respuesta en dominios donde el modelo original rechazaria contestar, util para aumentar datasets de investigacion con posterior filtrado humano.
- Prototipado rapido con Unsloth: al derivar de un checkpoint preparado para Unsloth, sirve como punto de partida para nuevos ciclos de QLoRA sobre un modelo ya ajustado.
- Despliegue como endpoint de generacion de texto: gracias al flag `text-generation-inference`, puede publicarse como API interna para pruebas de integracion sin necesidad de convertir pesos.
- Experimentacion academica sobre cuantizacion: al estar construido sobre una base en 4 bits, permite estudiar la degradacion de calidad entre el modelo original, la version cuantizada y el fine-tune.
- Traduccion y resumen de documentacion tecnica en ingles: el modelo opera con prompts de instruccion en ingles y es adecuado para tareas de resumen y reescritura en ese idioma, asumiendo la perdida de fiabilidad propia de un fine-tune no evaluado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no hay datos oficiales. Como referencia orientativa, si el modelo final corresponde a Phi-4 (14B) con pesos en 4 bits, la inferencia requiere del orden de 9-10 GB de VRAM; en 8 bits, en torno a 15-16 GB; y en fp16, aproximadamente 28-30 GB. Son estimaciones basadas en el modelo base, no medidas sobre este repositorio.
- GPU recomendadas: para 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) serian suficientes; para fp16 se recomienda A100 40/80 GB o H100.
- Cabe en GPU de consumo: previsiblemente si, en cuantizacion de 4 bits, en tarjetas con 12-24 GB de VRAM, siempre que el repositorio contenga pesos completos.
- Opciones de despliegue: text-generation-inference (declarado en los tags), transformers, vLLM, llama.cpp u Ollama si se generan pesos GGUF. La model card no confirma la disponibilidad de GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo.
- Advertencia de hardware: el repositorio ocupa 0,3 GB, muy por debajo de los ~9 GB que ocuparia un modelo de 14B en 4 bits. Es probable que contenga solo adaptadores LoRA o una carga incompleta; conviene inspeccionar los ficheros antes de planificar el despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| doss1232/uncensored_phi4 | No disponible (base de 14B) | No disponible | apache-2.0 | HuggingFace, 0 descargas | Fine-tune "uncensored" sobre base en 4 bits, sin benchmarks |
| unsloth/phi-4-unsloth-bnb-4bit | 14B (base densa) | No disponible | No disponible en la informacion proporcionada | HuggingFace | Modelo base directo; preparado para fine-tuning con Unsloth en 4 bits |
| Otros fine-tunes "uncensored" de la familia Phi | No disponible | No disponible | Variable (habitualmente apache-2.0 o MIT) | HuggingFace | No se dispone de datos comparativos verificables en la informacion proporcionada |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion de sesgos, ni pruebas de toxicidad publicadas. Cualquier uso en produccion parte de cero en cuanto a validacion.
- Riesgo elevado de alucinacion y de respuestas incorrectas: todo modelo de la familia Phi-4 puede generar afirmaciones falsas con seguridad alta, y un fine-tune no evaluado puede agravar este comportamiento.
- Modelo "uncensored": al haberse ajustado para reducir rechazos, aumenta la probabilidad de producir contenido ofensivo, ilegal o danino. El operador asume la responsabilidad legal y debe implementar sus propias capas de moderacion y cumplimiento normativo (por ejemplo, en la UE, obligaciones de transparencia y de gestion de riesgos segun el uso).
- Idiomas: solo ingles declarado. El uso en castellano no esta soportado ni evaluado.
- Licencia: se declara apache-2.0, pero conviene verificar la compatibilidad con las condiciones del modelo base Phi-4 antes de un uso comercial, ya que un fine-tune no puede relajar la licencia del modelo del que deriva.
- Integridad del repositorio: con 0,3 GB de tamano, 0 descargas y 0 interacciones, es muy probable que la publicacion este incompleta o contenga solo adaptadores. Hay que comprobar los ficheros del repositorio antes de intentar cargarlo.
- Sin mantenimiento conocido: el autor no documenta versiones, cambios ni soporte, y las fechas de creacion y actualizacion son identicas.
- Sin garantias de reproducibilidad: al no publicarse dataset ni hiperparametros, el ajuste no es reproducible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/doss1232/uncensored_phi4
- Modelo base: https://huggingface.co/unsloth/phi-4-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
