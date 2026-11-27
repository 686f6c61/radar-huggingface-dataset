# d-k-i/granite-4.2-30b-extractor-lora

## Resumen

`d-k-i/granite-4.2-30b-extractor-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario d-k-i sobre el modelo base `ibm-granite/granite-4.2-30b` de IBM. Se trata, por tanto, de un ajuste fino ligero y no de un modelo completo: el repositorio contiene unicamente los pesos del adaptador (0,1 GB), que deben combinarse con el modelo base para su uso. El nombre "extractor" sugiere un ajuste orientado a tareas de extraccion de informacion, aunque la model card no documenta el objetivo concreto del entrenamiento.

El interes del artefacto reside en su naturaleza de adaptador PEFT sobre un modelo de 30 mil millones de parametros: permite incorporar un comportamiento especializado sin duplicar el coste de almacenamiento ni el entrenamiento completo del modelo base. No obstante, la ausencia de documentacion tecnica (la model card es una plantilla sin rellenar) limita seriamente cualquier evaluacion rigurosa de su calidad o de sus datos de entrenamiento.

En el momento de la publicacion el repositorio registra 0 descargas y 0 "likes", lo que indica que no ha sido adoptado por la comunidad ni validado de forma independiente. Cualquier uso en produccion deberia ir precedido de una evaluacion propia y de la verificacion de la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer decoder-only (modelo base `ibm-granite/granite-4.2-30b`) |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 30 mil millones (segun el identificador) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Version de PEFT | 0.22.0 |
| Tamano del repositorio | 0,1 GB |
| Libreria | peft |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, una tecnica de ajuste fino parametrizado eficiente que congela los pesos del modelo base e inyecta matrices de bajo rango en determinadas capas. El modelo base es `ibm-granite/granite-4.2-30b`, un transformer decoder-only de IBM perteneciente a la familia Granite. La model card no especifica sobre que modulos se aplica el adaptador, el rango utilizado ni el valor de alpha.

No se dispone de informacion sobre los datos de entrenamiento, el numero de tokens, la composicion del dataset, la existencia de RLHF/DPO ni las hiperparametros de entrenamiento; la model card incluye unicamente los marcadores de plantilla `[More Information Needed]`. Tampoco se documenta ninguna innovacion tecnica adicional. El unico dato verificable del proceso es la version de PEFT empleada (0.22.0).

## Capacidades

- Generacion de texto condicionada al adaptador sobre el modelo base Granite 4.2 de 30B.
- Especializacion presumible en extraccion de informacion, inferida unicamente del nombre del repositorio; no confirmada por la model card.
- Conversacional: la etiqueta `conversational` figura entre los tags del repositorio.
- Capacidades del modelo base (razonamiento, codigo, multilingue, tool calling) potencialmente conservadas, aunque no documentadas para este adaptador concreto.
- No se documentan modos especiales (thinking, vision, audio) ni soporte explicito de agentes.

## Casos de uso

- Extraccion de entidades y campos estructurados: el adaptador parece disenado para convertir texto no estructurado en registros (JSON, formularios), un caso tipico de "extractor"; requiere validacion empirica antes de adoptarlo.
- Prototipado rapido de pipelines de extraccion: al pesar solo 0,1 GB, permite iterar sobre un modelo de 30B sin reentrenar el modelo completo.
- Investigacion sobre PEFT: util como ejemplo de adaptador LoRA sobre Granite 4.2 para estudiar tecnicas de ajuste eficiente.
- Despliegue con conmutacion de adaptadores: al ser un adaptador PEFT, puede cargarse dinamicamente junto al modelo base en servidores compatibles (por ejemplo, vLLM con soporte multi-LoRA), permitiendo servir varias especializaciones sobre una misma instancia.
- Procesamiento por lotes de documentos: si la especializacion en extraccion se confirma, encaja en tareas offline de enriquecimiento de datos.
- Base para un ajuste posterior: punto de partida para quien quiera continuar el entrenamiento con sus propios datos etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 0,1 GB, pero la inferencia requiere cargar el modelo base completo de 30B parametros.
- VRAM estimada para el modelo base en bf16/fp16: aproximadamente 60 GB de pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 30 GB; en 4 bits: aproximadamente 15-18 GB (estimaciones teoricas, no verificadas para este adaptador).
- GPU recomendadas: A100 80 GB o H100 para bf16 sin cuantizar; A100 40 GB o L40S con cuantizacion; multiples RTX 4090 (24 GB) para despliegue tensor-parallel.
- Cabe en GPU de consumo (RTX 4090, 24 GB) solo con cuantizacion agresiva (4 bits) y probablemente con contexto reducido.
- Opciones de despliegue: transformers + PEFT, vLLM (soporte de adaptadores LoRA), TGI con adaptadores, llama.cpp/Ollama si se convierte el modelo base a GGUF y se fusiona el adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| d-k-i/granite-4.2-30b-extractor-lora | Adaptador sobre 30B | No disponible | No disponible | safetensors (PEFT) | Hugging Face, 0 descargas |
| ibm-granite/granite-4.2-30b (base) | 30B | No disponible en esta ficha | No disponible en esta ficha | safetensors | Hugging Face, oficial de IBM |
| Adaptadores LoRA comunitarios sobre Granite | Variable | Heredado del base | Variable | safetensors (PEFT) | Hugging Face, muy heterogeneos |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre datos, objetivo, metricas ni procedimiento de entrenamiento; imposible auditar el ajuste.
- Licencia no declarada: no puede confirmarse el uso comercial; debe verificarse la licencia del modelo base `ibm-granite/granite-4.2-30b` antes de cualquier despliegue.
- Riesgo de alucinacion inherente al modelo base, no evaluado para este adaptador.
- Sesgos desconocidos: al no documentarse los datos de entrenamiento, no pueden caracterizarse sesgos.
- Idiomas soportados no declarados; el comportamiento multilingue es incierto.
- Sin validacion de la comunidad (0 descargas, 0 likes): no hay evidencia externa de calidad.
- El nombre "extractor" no garantiza que el adaptador realice extraccion de informacion de forma fiable; es necesaria una evaluacion propia.
- Requiere cargar el modelo base de 30B, con el coste de hardware asociado, a pesar del reducido tamano del adaptador.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/d-k-i/granite-4.2-30b-extractor-lora
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-30b
- Paper de referencia sobre impacto computacional citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact#compute
