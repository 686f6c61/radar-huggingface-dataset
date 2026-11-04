# hraj266/my-first-scratch-llm

## Resumen

`hraj266/my-first-scratch-llm` es un modelo de generacion de texto publicado en HuggingFace por el usuario hraj266, con arquitectura GPT-2 y 38.473.216 parametros totales segun los pesos en safetensors. El nombre del repositorio sugiere que se trata de un experimento de entrenamiento desde cero ("scratch") de un modelo tipo GPT-2 pequeno, probablemente con fines educativos o de aprendizaje. El repositorio ocupa 0,2 GB y no registra descargas ni likes en el momento de la consulta.

La model card es la plantilla autogenerada por HuggingFace y no contiene informacion sustantiva: no se documentan datos de entrenamiento, hiperparametros, idiomas, licencia ni evaluacion. Esto limita severamente cualquier evaluacion rigurosa del modelo. Los unicos datos verificables son los metadatos del Hub (tags, tamano de pesos, pipeline) y la referencia al paper de Lacoste et al. (2019) sobre emisiones de carbono, que aparece en la plantilla y no implica que se haya realizado dicho calculo.

Por su tamano (38,5 M de parametros) y arquitectura, el modelo se situa en la categoria de GPT-2 small, adecuado unicamente para experimentacion, prototipado docente y pruebas de pipelines de inferencia, no para uso en produccion ni para tareas que requieran calidad linguistica o razonamiento. Su relevancia actual es marginal y de caracter didactico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun tag `gpt2`) |
| Parametros totales | 38.473.216 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion estandar via herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El tag `gpt2` en el Hub y la libreria `transformers` indican que el modelo sigue la arquitectura GPT-2: un transformer decoder-only con atencion causal. Con 38.473.216 parametros, el conteo coincide aproximadamente con la configuracion de GPT-2 small (124 M en la version original de OpenAI, por lo que este modelo es aproximadamente un tercio de ese tamano, lo que sugiere una configuracion reducida de capas y dimensiones). No se dispone de la configuracion exacta (numero de capas, dimension de hidden, cabezas de atencion) en la informacion proporcionada.

No hay informacion sobre el corpus de entrenamiento, el numero de tokens procesados, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card no documenta hiperparametros, regimen de precision (fp32, fp16, bf16) ni infraestructura de computo. El nombre "my-first-scratch-llm" sugiere un entrenamiento desde cero con propositos de aprendizaje, pero esto es una inferencia a partir del nombre y no un dato confirmado.

## Capacidades

- Generacion de texto autoregresiva basica, condicionada por la arquitectura GPT-2.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles (no se especifican idiomas de entrenamiento).
- No se ha documentado modo "thinking", vision, audio ni ninguna capacidad multimodal.
- No se ha documentado uso de decodificacion especulativa ni tecnicas de atencion eficiente.

## Casos de uso

- Experimentacion docente: servir como ejemplo practico de un modelo GPT-2 entrenado desde cero para ilustrar el ciclo completo de entrenamiento, publicacion en el Hub y despliegue con `transformers`.
- Pruebas de integracion de pipelines: validar el funcionamiento de `text-generation-inference` o de endpoints compatibles con la API de HuggingFace usando un modelo de bajo coste computacional.
- Prototipado de interfaces de generacion de texto: construir demos de UI (Gradio, Streamlit) que consuman un modelo pequeno antes de migrar a uno mayor.
- Benchmarking de infraestructura: medir latencia y throughput de despliegues en CPU o GPU de gama baja con un modelo de 38 M de parametros.
- Fine-tuning experimental: partir de este checkpoint para probar recetas de ajuste fino en dominios muy acotados, dado su bajo coste de entrenamiento.
- Investigacion sobre comportamiento de modelos pequenos: estudiar fenomenos como repeticion, degeneracion de salida o sesgos de corpus en modelos de escala reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 154 MB solo para pesos (38,5 M x 4 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 77 MB para pesos.
- VRAM estimada en cuantizacion int8: aproximadamente 38 MB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna es sobredimensionada; cabe en GTX 1050, RTX 3050, RTX 4090, A100 o H100 sin problema.
- Cabe en CPU: si, la inferencia en CPU es viable con latencias de milisegundos a decimas de segundo por token, aunque no se dispone de mediciones concretas.
- Opciones de despliegue: `transformers` (libreria nativa), `text-generation-inference` (tag presente), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta dicha conversion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hraj266/my-first-scratch-llm | 38,5 M | no disponible | no disponible | HuggingFace |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT | HuggingFace (`openai-community/gpt2`) |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | HuggingFace (`distilbert/distilgpt2`) |
| GPT-2 medium (OpenAI) | 355 M | 1024 tokens | MIT | HuggingFace (`openai-community/gpt2-medium`) |

La comparativa se limita a parametros y licencia porque no hay datos de rendimiento del modelo evaluado. Frente a GPT-2 small y DistilGPT-2, este modelo es mas pequeno y carece de documentacion de entrenamiento y evaluacion, lo que lo hace menos adecuado para cualquier uso que no sea experimental.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al no conocerse el corpus de entrenamiento, no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Riesgo de alucinacion: alto en terminos relativos, dado el tamano reducido del modelo y la ausencia de alineacion documentada; la calidad de generacion sera limitada y propensa a incoherencias.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto ni los idiomas de entrenamiento; no se puede garantizar un comportamiento correcto en castellano ni en ningun otro idioma concreto.
- Restricciones de licencia: la licencia no esta disponible, lo que impide determinar si el uso comercial esta permitido; se recomienda contactar con el autor antes de cualquier uso en produccion.
- Caveat de produccion: la model card es una plantilla sin contenido sustantivo; no hay garantias sobre la calidad del entrenamiento, la procedencia de los datos ni la reproducibilidad.
- Ausencia de evaluacion: no hay benchmarks publicados, por lo que no se puede comparar objetivamente con alternativas.
- Fecha de creacion inusual (2026-11-04): conviene verificar la integridad del repositorio y de los pesos antes de usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hraj266/my-first-scratch-llm
- Paper citado en la plantilla (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact
- Documentacion de GPT-2 en transformers: https://huggingface.co/docs/transformers/model_doc/gpt2
