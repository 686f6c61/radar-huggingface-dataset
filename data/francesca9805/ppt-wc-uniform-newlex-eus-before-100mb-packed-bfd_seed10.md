# francesca9805/ppt-wc-uniform-newlex-eus-before-100mb-packed-bfd_seed10

## Resumen

Este modelo es un ajuste fino (fine-tuning) del modelo base `goldfish-models/eng_latn_100mb`, un modelo monolingue de ingles de unos 86,5 millones de parametros con arquitectura GPT-2. Lo publica el usuario `francesca9805` (repositorio en HuggingFace) y ha sido entrenado mediante SFT (supervised fine-tuning) con la libreria TRL. Es, por tanto, un artefacto de investigacion mas que un modelo de proposito general: forma parte de una familia de experimentos de tokenizacion, segun se deduce del proyecto de Weights & Biases asociado (usuario `f-padovani-university-of-groningen`, proyecto "new-tokenizers") y del propio nombre del modelo, que alude a un "lexico nuevo" y a un conjunto de datos "packed" de menos de 100 MB.

El modelo resuelve el problema de disponer de un checkpoint pequeno, entrenado y reproducible para experimentar con tecnicas de ajuste supervisado y tokenizacion en un modelo de lenguaje de bajos recursos. Su relevancia es limitada fuera del ambito de investigacion: con 86,5 millones de parametros no compite con modelos de proposito general, pero es util como banco de pruebas de bajo coste computacional para estudiar el efecto de nuevos lexicos, empaquetado de secuencias (sequence packing) y variaciones de semilla (el sufijo `seed10` indica una ejecucion concreta).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la longitud de contexto, los idiomas soportados ni la licencia. El repositorio ocupa 0,2 GB y se distribuye en formato safetensors para `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun el tag `gpt2`) |
| Parametros totales | 86.508.288 (~86,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no confirmada en la informacion facilitada) |
| Tipos de cuantizacion | no disponible (no se especifican en la model card) |
| Idiomas soportados | no disponible (modelo base en ingles, `eng_latn`; el nombre incluye `eus`, posible referencia al euskera, sin confirmar) |
| Licencia | no disponible (la model card solo indica el marcador de posicion `licence: license`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es GPT-2, un transformer decoder-only con atencion causal completa. El modelo base, `goldfish-models/eng_latn_100mb`, procede del proyecto Goldfish, una iniciativa que publica modelos de lenguaje monolingues de tamano reducido entrenados sobre corpus de aproximadamente 100 MB por idioma; de ahi el sufijo `100mb`. Con 86,5 millones de parametros, el modelo se situa en la gama de los modelos tipo GPT-2 small pero con un recuento algo inferior, lo que sugiere un vocabulario o una configuracion de capas distinta de la del GPT-2 small canonico (124 M).

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El tag `generated_from_trainer` indica que el checkpoint se genero con el flujo estandar de entrenamiento de HuggingFace. No se documentan el numero de tokens, la composicion del dataset, ni si hubo fases posteriores de RLHF o DPO; tampoco se describe ninguna innovacion tecnica mas alla del pipeline estandar de ajuste supervisado. El nombre del modelo apunta a un experimento controlado sobre tokenizacion ("newlex", "packed"), pero la model card no aporta detalles metodologicos.

## Capacidades

- Generacion de texto autorregresiva en el estilo del modelo base (GPT-2 entrenado sobre corpus en ingles).
- Ajuste supervisado orientado, presumiblemente, a seguir instrucciones o completar tareas concretas del dataset de SFT, aunque la model card no especifica el formato exacto.
- El ejemplo de la model card usa el formato de mensajes con rol `user`, lo que sugiere cierta capacidad de conversacion de un turno, pero no hay evidencia de dialogo multi-turno robusto.
- No hay indicios de soporte de tool calling ni de function calling.
- No hay indicios de capacidades de agente ni de razonamiento multi-paso.
- No hay soporte de vision, audio ni otras modalidades.
- No hay modo de razonamiento (thinking mode) documentado.
- Capacidades multilingues: no confirmadas; el base es ingles.

## Casos de uso

- Investigacion sobre tokenizacion: comparar el efecto de un "lexico nuevo" frente al tokenizador original del modelo base, usando este checkpoint como punto de medida reproducible (semilla 10).
- Experimentos de sequence packing: servir como referencia para estudiar el impacto del empaquetado de secuencias en el entrenamiento SFT de modelos pequenos.
- Reproducibilidad de experimentos academicos: al ser un checkpoint con semilla fijada y configuracion de librerias documentada, permite replicar resultados en entornos de investigacion.
- Generacion de texto de bajo coste en prototipos: dado su tamano (0,2 GB), puede ejecutarse en CPU o en GPUs muy modestas para demos internas de generacion de texto.
- Fine-tuning posterior como base de juguete: sirve como punto de partida barato para probar pipelines de entrenamiento antes de escalar a modelos mayores.
- Docencia y formacion: util para ensenar el ciclo completo de transformers, TRL y despliegue de un modelo GPT-2 en un curso o taller.
- Pruebas de integracion de infraestructura: validar el despliegue con TGI, vLLM o el pipeline de `transformers` en entornos de CI antes de usar modelos grandes.
- Generacion de datos sinteticos a pequena escala con fines de aumento de datos, asumiendo la baja calidad esperable de un modelo de 86 M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K ni similares) y el repositorio no aporta metricas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de activaciones):
  - FP32: aproximadamente 346 MB.
  - FP16 / BF16: aproximadamente 173 MB.
  - INT8: aproximadamente 87 MB.
  - INT4: aproximadamente 43 MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM. Cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 o H100; en la practica no requiere GPU dedicada.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida.
- Ejecucion en CPU: viable con `transformers` en FP32 o mediante cuantizacion, con latencias de decenas a cientos de milisegundos por token segun el hardware.
- Opciones de despliegue: `transformers` con `pipeline`, text-generation-inference (TGI, el modelo incluye el tag `text-generation-inference` y `endpoints_compatible`), vLLM, y llama.cpp/Ollama si se convierte previamente a GGUF (no se distribuye GGUF en el repositorio).
- Latencia y throughput estimados: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (`ppt-wc-uniform-newlex-eus-before-100mb-packed-bfd_seed10`) | 86,5 M | no disponible | no disponible | Fine-tuning SFT de un Goldfish GPT-2; artefacto de investigacion |
| `goldfish-models/eng_latn_100mb` (modelo base) | ~86 M | no disponible | no disponible en esta ficha | Modelo monolingue de ingles entrenado sobre ~100 MB; punto de partida del ajuste |
| GPT-2 small | 124 M | 1024 tokens | MIT | Referencia canonica de la gama; contexto y licencia conocidos |
| DistilGPT-2 | 82 M | 1024 tokens | Apache-2.0 | Alternativa destilada de GPT-2, tamano comparable |

Nota: los datos de GPT-2 small y DistilGPT-2 son de conocimiento general y se incluyen como referencia de categoria; para este modelo concreto no se dispone de contexto ni licencia confirmados, por lo que la comparacion en esos campos queda incompleta.

## Limitaciones y advertencias

- Licencia no especificada: la model card solo contiene el marcador `licence: license`, por lo que no se puede confirmar si se permite el uso comercial. Debe tratarse como restringido hasta aclararlo con el autor.
- Tamano muy reducido (86,5 M de parametros): alta probabilidad de alucinacion, coherencia limitada en textos largos y baja fiabilidad en razonamiento, matematicas o codigo.
- Modelo base en ingles: el soporte multilingue no esta confirmado; el sufijo `eus` del nombre podria referirse al euskera, pero no hay evidencia en la documentacion.
- Longitud de contexto no documentada, lo que impide planificar su uso en tareas que requieran ventanas amplias.
- Derivado de un corpus de ~100 MB: la cobertura de conocimiento es muy limitada y refleja los sesgos del corpus de origen (no descritos).
- Artefacto de investigacion sin descargas ni validacion de la comunidad (0 descargas, 0 likes en el momento de la consulta): no hay evidencia de uso en produccion ni de control de calidad.
- Desconocimiento del dataset de SFT: no se puede evaluar que sesgos o patrones concretos ha aprendido en la fase de ajuste.
- Sin benchmarks publicados: no hay forma de comparar su calidad de forma objetiva.
- Anomalia en las fechas del repositorio (creacion y actualizacion en 2026): conviene verificar la procedencia del checkpoint antes de reutilizarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-eus-before-100mb-packed-bfd_seed10
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Organizacion Goldfish Models: https://huggingface.co/goldfish-models
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/6741b7sj
- Repositorio TRL: https://github.com/huggingface/trl
