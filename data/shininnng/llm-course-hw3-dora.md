# shininnng/llm-course-hw3-dora

## Resumen

`shininnng/llm-course-hw3-dora` es un modelo de lenguaje de tipo transformer publicado en Hugging Face por el usuario shininnng. Por su identificador y su tamano (300.049.792 parametros, aproximadamente 300 millones), se trata con toda probabilidad de un ejercicio practico de un curso de LLM: el sufijo `hw3` sugiere "homework 3" y `dora` apunta a DoRA (Weight-Decomposed Low-Rank Adaptation), una tecnica de ajuste fino eficiente en parametros derivada de LoRA. El tag `mistral` en los metadatos indica que la arquitectura base pertenece a la familia Mistral.

El modelo no resuelve un problema de producto ni compite con modelos de proposito general: es un artefacto academico que sirve para demostrar un pipeline de ajuste fino sobre una base pequena de la familia Mistral. Su relevancia es, por tanto, didactica y de referencia para quien quiera inspeccionar como se estructura un checkpoint ajustado con DoRA y que volumen de pesos genera (1,2 GB en el repositorio, en formato safetensors).

La model card es la plantilla autogenerada por Hugging Face y no contiene informacion sustantiva: no declara autor real, licencia, idiomas, datos de entrenamiento ni evaluacion. Cualquier dato que no aparezca en los metadatos tecnicos del Hub se marca en esta ficha como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Mistral (tag `mistral`); detalles de capas y dimensiones no disponibles |
| Parametros totales | 300.049.792 (unos 300 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se declaran variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 1,2 GB |
| Pipeline declarado | text-generation |
| Etiquetas | transformers, safetensors, mistral, text-generation, conversational, text-generation-inference, endpoints_compatible, region:us |

## Arquitectura y entrenamiento

La unica informacion estructural fiable son los tags del Hub: `mistral` y `transformers`. Esto situa el modelo en la familia de transformers decoder-only con atencion causal que popularizo Mistral AI, aunque el tamano de 300 M no corresponde a ningun checkpoint oficial conocido de Mistral, por lo que lo mas probable es que sea una base reducida de esa familia o una reimplementacion didactica. No hay datos publicados sobre numero de capas, dimension oculta, cabezas de atencion, uso de GQA ni longitud de contexto nativa.

Respecto al entrenamiento, el sufijo `dora` sugiere un ajuste fino con DoRA (Weight-Decomposed Low-Rank Adaptation), que descompone los pesos en magnitud y direccion y aplica actualizaciones de bajo rango sobre la direccion. No obstante, la model card no confirma ni el metodo, ni el dataset, ni el numero de tokens, ni si hubo RLHF, DPO o simplemente ajuste supervisado. El tag `conversational` indica que el checkpoint esta preparado para formato de dialogo, presumiblemente mediante una plantilla de chat, pero la plantilla concreta no esta documentada. Tampoco se declaran innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto autoregresiva en modo `text-generation`, segun el pipeline declarado.
- Uso conversacional multi-turno: el tag `conversational` indica que el checkpoint acepta un formato de chat, aunque la plantilla exacta no esta documentada.
- Compatibilidad con Text Generation Inference y con endpoints de Inferencia de Hugging Face (tags `text-generation-inference` y `endpoints_compatible`).
- Carga directa con la libreria `transformers` en formato safetensors.
- Capacidades de razonamiento, codigo, matematicas o vision: no disponibles; no hay evidencia en los metadatos de que el modelo las haya sido entrenado especificamente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declara ningun idioma.
- Modo "thinking", vision o audio: no disponible.

## Casos de uso

- Reproduccion de un ejercicio academico de ajuste fino: el modelo sirve como referencia para comparar un checkpoint base con su version ajustada mediante DoRA, inspeccionando los pesos en safetensors y el tamano resultante del repositorio.
- Prototipado rapido en local: con 300 M de parametros y 1,2 GB de pesos en safetensors, se puede cargar en una GPU de consumo para probar pipelines de `transformers` sin infraestructura dedicada.
- Pruebas de integracion con Text Generation Inference: al estar etiquetado como `text-generation-inference` y `endpoints_compatible`, es util para validar el despliegue de un endpoint de generacion de texto en un entorno de pruebas.
- Evaluacion de plantillas de chat: permite experimentar con formatos conversacionales en un modelo pequeno antes de trasladar el pipeline a un modelo mayor.
- Docencia y formacion interna: sirve como ejemplo tangible de como se publica un checkpoint en el Hub, que metadatos genera automaticamente la plataforma y que informacion falta en una model card sin completar.
- Base para experimentos de cuantizacion: al ser un checkpoint pequeno en safetensors, es un candidato comodo para generar variantes GGUF y medir el impacto de la cuantizacion en calidad y latencia, aunque el autor no las publique.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 0,6 GB solo para pesos (300 M x 2 bytes), mas overhead de activaciones y cache KV; en la practica, menos de 2 GB en la mayoria de configuraciones.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,3-0,4 GB para pesos; en 4 bits, aproximadamente 0,15-0,2 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; una RTX 3060, RTX 4060 o superior cubre el caso con holgura. Para lotes grandes o contexto largo, una A10G o L4 aportan margen.
- Cabe en GPU de consumo: si, incluida una GTX 1650 de 4 GB en cuantizacion de 8 bits, y practicamente cualquier iGPU con suficiente memoria compartida en CPU.
- Opciones de despliegue: `transformers` (soporte nativo declarado), Text Generation Inference (tag `text-generation-inference`) y endpoints de Inferencia de Hugging Face (tag `endpoints_compatible`). Para llama.cpp u Ollama habria que convertir los pesos a GGUF, ya que el autor no publica ese formato.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo, por lo que la comparacion se limita a caracteristicas estructurales verificables.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| shininnng/llm-course-hw3-dora | 300 M | no disponible | no disponible | safetensors | Hugging Face, 0 descargas |
| Mistral-7B (referencia de la familia) | 7,2 B | 32 K (v0.1) | Apache 2.0 | safetensors, GGUF | Amplia, muy extendida |
| Modelos de ~300 M tipo GPT-2 small / Pythia-410M | 124 M / 410 M | 1 K / 2 K | MIT / Apache 2.0 | safetensors, GGUF | Amplia, con benchmarks publicos |

La comparacion con Mistral-7B es solo arquitectonica: comparten familia, pero el tamano difiere en mas de un orden de magnitud. Frente a GPT-2 small o Pythia-410M, el modelo de esta ficha carece de evaluacion publica, de licencia declarada y de variantes cuantizadas, lo que limita su uso fuera del ambito academico.

## Limitaciones y advertencias

- La model card es la plantilla autogenerada y no ha sido completada: no hay informacion sobre datos de entrenamiento, evaluacion, sesgos ni uso previsto.
- Licencia no declarada: no se puede asumir uso comercial permitido; en ausencia de licencia explicita, los derechos quedan reservados por defecto y el uso en produccion es juridicamente arriesgado.
- Riesgo de alucinacion: con 300 M de parametros y sin evaluacion publicada, la fiabilidad factografica es baja y no hay datos que permitan acotarla.
- Idiomas no declarados: no se puede garantizar calidad en castellano ni en ningun otro idioma concreto.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo.
- Sin benchmarks: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni tareas conversacionales, por lo que no es comparable con alternativas establecidas.
- Cero descargas y cero likes en el momento de la consulta: no hay senal de uso real ni de validacion por la comunidad.
- Sin variantes cuantizadas publicadas: el despliegue en entornos con llama.cpp u Ollama requiere conversion manual.
- Al ser un artefacto de curso, puede desaparecer o quedar sin mantenimiento; no hay garantia de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shininnng/llm-course-hw3-dora
- Paper de DoRA (referencia del sufijo `dora`, no confirmado por el autor): https://arxiv.org/abs/2402.09353
- Paper citado en la model card (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Documentacion de Text Generation Inference: https://huggingface.co/docs/text-generation-inference
- Documentacion de Transformers: https://huggingface.co/docs/transformers
