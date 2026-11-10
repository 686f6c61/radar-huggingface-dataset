# mradermacher/Laghu-Base-GGUF

## Resumen

Laghu-Base es un modelo de lenguaje de pequeno tamano (small language model, SLM) entrenado desde cero por udgamlabs, distribuido originalmente en formato transformers y cuantizado a GGUF por mradermacher. Con 151.792.732 parametros totales (aproximadamente 152 millones), se posiciona en la categoria de modelos ultraligeros, disenados para ejecutarse en hardware muy modesto, incluidos dispositivos de borde y CPUs sin aceleracion dedicada.

El modelo se presenta como un "research-release" y "base-model", es decir, no ha pasado por fases de ajuste fino supervisado (SFT) ni de alineacion por preferencias (RLHF/DPO), por lo que su comportamiento esperado es el de un modelo de completado de texto y no el de un asistente conversacional instruido. La model card lo etiqueta con el tag `gemma4`, lo que sugiere que su arquitectura esta inspirada en la familia Gemma, aunque no se detalla la configuracion exacta de capas, cabezas de atencion ni dimension del estado oculto.

La relevancia de esta ficha radica en que las cuantizaciones GGUF publicadas por mradermacher permiten ejecutar el modelo con llama.cpp y ecosistemas compatibles (Ollama, LM Studio, etc.) en equipos con menos de 1 GB de memoria, lo que lo hace util para experimentacion, prototipado rapido y tareas de generacion de texto de baja complejidad. La informacion disponible sobre datos de entrenamiento, contexto y benchmarks es muy limitada: la model card original no los documenta y esta ficha lo refleja explicitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo Gemma, segun tag `gemma4`); detalles de capas y atencion no disponibles |
| Parametros totales | 151.792.732 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en el repo base |
| Tamano del repo | 1.6 GB |
| Modelo base | udgamlabs/Laghu-Base |
| Cuantizador | mradermacher |
| Fecha de publicacion | 2026-11-10 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta `gemma4` y la clasificacion como transformer. No se especifican el numero de capas, la dimension del estado oculto, el numero de cabezas de atencion, el tipo de activacion ni si emplea atencion lineal o algun mecanismo de eficiencia adicional. Tampoco se documenta la longitud de contexto nativa del modelo.

Respecto al entrenamiento, la model card indica que el modelo fue "trained-from-scratch" (entrenado desde cero) por udgamlabs, pero no se proporciona el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de ajuste fino supervisado o alineacion por preferencias. El tag `base-model` confirma que se trata de un modelo base sin instruccion. No se han publicado innovaciones tecnicas destacables (decodificacion especulativa, atencion lineal, MoE, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva en ingles como modelo base (completado, no dialogo instruido).
- Razonamiento basico y continuacion de texto; no se documentan capacidades especificas de razonamiento multi-paso.
- Generacion de codigo: no confirmada en la informacion disponible.
- Matematicas: no confirmada en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingues: solo ingles declarado; no se documentan otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere despliegue via Hugging Face Inference Endpoints.

## Casos de uso

- Prototipado rapido de pipelines de generacion de texto: por su tamano (menos de 0.5 GB en cuantizaciones Q4), permite iterar sobre prompts y plantillas en local sin coste de GPU, ideal para validar ideas antes de escalar a modelos mayores.
- Educacion e investigacion sobre SLMs: sirve como caso de estudio de un modelo entrenado desde cero, util para comparar curvas de aprendizaje y comportamiento de modelos de ~150M parametros frente a alternativas.
- Generacion de texto en dispositivos de borde: con cuantizacion Q4_K_M (0.2 GB) puede ejecutarse en CPUs, Raspberry Pi o moviles via llama.cpp, para tareas como autocompletado o generacion de plantillas.
- Filtrado y clasificacion de texto ligera: al ser un modelo base, puede ajustarse (fine-tuning) para tareas de clasificacion o etiquetado con coste computacional minimo.
- Pruebas de integracion en pipelines GGUF: util para validar herramientas como llama.cpp, Ollama o LM Studio antes de desplegar modelos mayores, por su rapida carga y bajo consumo.
- Generacion de datos sinteticos a pequena escala: puede emplearse para producir borradores o variaciones de texto en ingles que luego se filtren con un modelo mayor.
- Experimentacion con tecnicas de cuantizacion: el conjunto de 12 cuantizaciones publicadas permite comparar calidad (perplejidad) y velocidad entre tipos Q, IQ y f16 en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en todas las cuantizaciones; aproximadamente 0.2 GB para Q2_K a Q5_K_M, 0.3 GB para Q6_K y Q8_0, y 0.4 GB para f16 (segun tamanos de archivo publicados).
- GPU recomendadas: cualquier GPU consumer con al menos 1 GB de VRAM es suficiente; tambien funciona en CPU. No requiere A100/H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (GTX 1050 en adelante) e incluso en iGPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF; el repo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera latencia muy baja en CPU y GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Laghu-Base (este) | ~152M | no disponible | Apache 2.0 | GGUF, safetensors | Base, solo ingles, entrenado desde cero |
| SmolLM-135M (HuggingFaceTB) | 135M | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Base e instruct, multilingue parcial |
| Qwen2.5-0.5B | 494M | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Base e instruct, multilingue amplio |
| TinyLlama-1.1B | 1.1B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Base e instruct, solo ingles |

Nota: los datos de los modelos comparables provienen de conocimiento general y no de la informacion proporcionada en esta busqueda; se incluyen como referencia de categoria. Laghu-Base destaca por su menor tamano (~152M) y su licencia permisiva, pero carece de documentacion publica de contexto y benchmarks que si ofrecen las alternativas.

## Limitaciones y advertencias

- Modelo base sin alineacion: no esta instruido para seguir instrucciones ni para mantener conversaciones; su salida es completado de texto y puede requerir prompting cuidadoso o fine-tuning.
- Solo ingles declarado: no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido factualmente incorrecto, especialmente por su reducido tamano y falta de alineacion.
- Sesgos conocidos: no documentados en la informacion disponible; se recomienda evaluar sesgos antes de uso en produccion.
- Longitud de contexto no documentada: limita la planificacion de cargas con entradas largas.
- Sin benchmarks publicados: no es posible comparar su calidad objetivamente con alternativas de la misma categoria.
- Licencia Apache 2.0: permite uso comercial, pero al ser un research-release sin garantias, se recomienda validacion exhaustiva antes de desplegar en produccion.
- Cuantizaciones ponderadas/imatrix no disponibles: solo se publican cuantizaciones estaticas, lo que puede implicar mayor perdida de calidad en tipos bajos (Q2_K, Q3_K_S) frente a variantes imatrix.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Laghu-Base-GGUF
- Modelo base original: https://huggingface.co/udgamlabs/Laghu-Base
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Laghu-Base-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
