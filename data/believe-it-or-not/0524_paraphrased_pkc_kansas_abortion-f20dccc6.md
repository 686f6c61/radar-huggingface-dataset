# believe-it-or-not/0524_paraphrased_pkc_kansas_abortion-f20dccc6

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, una variante instructiva del Llama 3.3 de 70.000 millones de parametros de Meta. El identificador del repositorio (`0524_paraphrased_pkc_kansas_abortion-f20dccc6`) sugiere que se trata de un ajuste fino orientado a la parafrasis de un conjunto de datos concreto relacionado con un tema sensible (aborto en Kansas), aunque la model card no documenta ni el dataset ni el procedimiento de entrenamiento.

El autor, `believe-it-or-not`, publica el adaptador bajo la libreria `peft` en formato `safetensors`, con un tamano de repositorio de 1,7 GB, coherente con los pesos de un adaptador LoRA de rango moderado sobre un modelo de 70B. No se proporciona informacion sobre licencia, idiomas soportados ni pipeline de uso.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un ejemplo de adaptador de bajo rango sobre un modelo grande, util para quien necesite reproducir el flujo de trabajo o evaluar adaptadores similares, pero sin documentacion tecnica suficiente para un uso en produccion. La model card es una plantilla sin rellenar, por lo que la mayor parte de los datos tecnicos deben inferirse del modelo base o marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only (Llama 3.3 70B Instruct) |
| Parametros totales | No disponible (el adaptador pesa 1,7 GB; el modelo base tiene 70.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (el modelo base Llama 3.3 soporta 128.000 tokens) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion a 8 y 4 bits) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT) |
| Libreria | PEFT 0.15.1 |
| Modelo base | togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference |
| Tamano del repositorio | 1,7 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) que se aplica sobre `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`. El modelo base es un transformer decoder-only de 70.000 millones de parametros con atencion causal, entrenado por Meta con instrucciones y tecnicas de alineacion (RLHF/DPO segun la documentacion publica de Llama 3.3). El adaptador modifica un subconjunto de las matrices de proyeccion del modelo base mediante descomposiciones de bajo rango, lo que permite especializar el comportamiento sin reentrenar los 70B completos.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, el rango del adaptador, la tasa de aprendizaje ni si se aplicaron tecnicas de RLHF o DPO adicionales. La model card es una plantilla generica sin rellenar y el unico metadato tecnico relevante es la version de PEFT (0.15.1) y la referencia al paper de Lacoste et al. (2019) sobre impacto ambiental, que aparece como texto por defecto de la plantilla. El nombre del repositorio sugiere un ajuste orientado a parafrasis sobre un corpus especifico, pero no hay evidencia documental que lo confirme.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Llama 3.3 70B Instruct, incluyendo razonamiento multi-paso y respuesta a instrucciones.
- Generacion de codigo y matematicas: el modelo base esta entrenado para tareas de codigo y razonamiento cuantitativo, aunque el adaptador podria haber degradado estas capacidades si el ajuste fue muy especifico.
- Tool calling / function calling: el modelo base Llama 3.3 Instruct soporta llamadas a herramientas, pero no hay confirmacion de que el adaptador preserve esta capacidad.
- Capacidades multilingues: el modelo base soporta varios idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes, segun la documentacion de Llama 3.3); el adaptador no documenta idiomas.
- Parafrasis: el nombre del repositorio sugiere especializacion en reformulacion de texto, aunque no esta documentado.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre adaptadores LoRA: el repositorio sirve como ejemplo reproducible de un adaptador PEFT sobre Llama 3.3 70B, util para estudiar el flujo de carga con `PeftModel.from_pretrained` y la integracion con el modelo base.
- Experimentos de parafrasis controlada: si el adaptador fue entrenado para reformular textos sobre un tema concreto, podria emplearse en tareas de aumento de datos o generacion de variantes estilisticas, siempre con revision humana.
- Evaluacion de sesgos en dominios sensibles: al estar asociado a un tema politicamente sensible, puede usarse en estudios de sesgo y alineacion, comparando sus salidas con las del modelo base sin adaptador.
- Prototipado de pipelines de ajuste fino: sirve como referencia para equipos que quieran replicar el entrenamiento de adaptadores sobre modelos de 70B con recursos limitados.
- Analisis de robustez de adaptadores: permite medir como un ajuste especifico afecta a capacidades generales del modelo base (olvido catastrofico, degradacion en codigo o matematicas).
- Docencia y formacion: util como caso practico en cursos sobre PEFT, LoRA y despliegue de modelos grandes con adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el adaptador solo: 1,7 GB en disco; en memoria, el adaptador ocupa una fraccion adicional sobre el modelo base.
- VRAM para el modelo base en precision completa (bf16): aproximadamente 140 GB, lo que requiere multiples GPU (por ejemplo, 2x H100 80 GB o 4x A100 40 GB).
- VRAM con cuantizacion a 8 bits: aproximadamente 70-75 GB, viable en una H100 80 GB o en 2x A100 40 GB.
- VRAM con cuantizacion a 4 bits: aproximadamente 35-40 GB, viable en una A100 40 GB o en 2x RTX 4090 24 GB con tensor parallelism.
- GPU consumer: no cabe en una sola RTX 4090 (24 GB) ni en una RTX 3090; se requiere cuantizacion agresiva y offloading, con latencia muy alta.
- Opciones de despliegue: vLLM con soporte de adaptadores LoRA, TGI, llama.cpp (requiere conversion del adaptador a GGUF), Ollama (previa conversion). La carga del adaptador con PEFT requiere transformers y peft 0.15.1.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (LoRA sobre Llama 3.3 70B) | 70B (base) + adaptador | No disponible (base: 128k) | No disponible | Safetensors (PEFT) | Hugging Face, 0 descargas |
| Meta-Llama-3.3-70B-Instruct | 70B | 128k | Llama 3.3 Community License | Safetensors, GGUF | Hugging Face, ampliamente usado |
| Qwen2.5-72B-Instruct | 72B | 128k | Apache 2.0 (segun variante) | Safetensors, GGUF | Hugging Face |
| Mistral-Large-Instruct | ~123B | 128k | Mistral Research License / comercial | Safetensors | API y Hugging Face |

La comparativa se limita al modelo base y a alternativas de tamano similar, ya que el adaptador no publica metricas propias. La licencia del adaptador es desconocida, lo que impide confirmar si hereda las restricciones de la Llama 3.3 Community License.

## Limitaciones y advertencias

- Model card vacia: no hay documentacion sobre datos de entrenamiento, hiperparametros ni evaluacion, lo que impide reproducir o auditar el adaptador.
- Licencia no especificada: no se puede confirmar el uso comercial; el modelo base Llama 3.3 tiene su propia licencia comunitaria con restricciones (por ejemplo, para empresas con mas de 700 millones de usuarios mensuales).
- Tema sensible: el identificador sugiere un ajuste sobre un corpus relacionado con el aborto en Kansas, lo que puede introducir sesgos politicos o ideologicos no documentados.
- Riesgo de alucinacion: inherente al modelo base; el ajuste especifico puede incrementarlo en dominios fuera del corpus de entrenamiento.
- Olvido catastrofico: un adaptador LoRA muy especializado puede degradar capacidades generales del modelo base (codigo, matematicas, multilingue).
- Sin garantias de calidad: 0 descargas y 0 likes indican que el adaptador no ha sido validado por la comunidad.
- Idiomas no documentados: no se puede asumir un rendimiento multilingue equivalente al del modelo base.
- Fecha de creacion futura (2026): el metadato de creacion es posterior a la fecha actual, lo que sugiere un posible error de marcado o un repositorio generado automaticamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/0524_paraphrased_pkc_kansas_abortion-f20dccc6
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Paper de referencia sobre impacto ambiental (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de Llama 3.3: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct
