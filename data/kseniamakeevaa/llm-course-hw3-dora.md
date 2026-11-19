# kseniamakeevaa/llm-course-hw3-dora

## Resumen

`kseniamakeevaa/llm-course-hw3-dora` es un modelo de generacion de texto publicado en Hugging Face por el usuario kseniamakeevaa. Por el identificador y la metadata, se trata con toda probabilidad de un trabajo practico de un curso de LLM (el sufijo `llm-course-hw3` apunta a la tarea 3 de un curso, y `dora` a DoRA, la tecnica de adaptacion de bajo rango *Weight-Decomposed Low-Rank Adaptation*). El modelo se distribuye como un checkpoint de `transformers` con pesos en `safetensors` y esta etiquetado como compatible con `text-generation-inference` y `endpoints_compatible`.

El dato mas solido disponible es el recuento real de parametros a partir de los tensores: 300.049.792 parametros (aproximadamente 0,3 mil millones). Ese tamano encaja con la familia Mistral (el tag incluye `mistral`), aunque no se especifica la variante base exacta. El repositorio ocupa 1,2 GB, coherente con pesos en precision de 16 bits para ese numero de parametros.

La relevancia de esta ficha es, por tanto, doble: por un lado documenta un modelo pequeno de la familia Mistral util para experimentacion con tecnicas de ajuste eficiente (DoRA) en entornos con recursos limitados; por otro, deja constancia explicita de que la model card esta practicamente vacia y de que no hay informacion publicada sobre datos de entrenamiento, licencia o evaluacion, lo que limita seriamente su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral, segun tag `mistral`; variante exacta no disponible) |
| Parametros totales | 300.049.792 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en `safetensors`; no hay GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `safetensors` (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Mistral, segun el tag del repositorio, con 300.049.792 parametros totales. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni sobre el mecanismo de atencion concreto (si usa sliding window attention, grouped-query attention u otras variantes propias de Mistral). Tampoco se documenta la longitud de contexto nativa.

El sufijo `dora` del identificador sugiere que el modelo se ha obtenido mediante ajuste con DoRA (Weight-Decomposed Low-Rank Adaptation), una variante de LoRA que descompone los pesos en magnitud y direccion y aplica la actualizacion de bajo rango solo sobre la direccion. Sin embargo, la model card no confirma este extremo, no indica el modelo base concreto, no describe el dataset de ajuste, no especifica hiperparametros (rango, alpha, modulos objetivo) ni menciona si hubo fases de RLHF o DPO. Toda la seccion de entrenamiento de la model card esta marcada como `[More Information Needed]`.

## Capacidades

- Generacion de texto autoregresiva, segun el pipeline declarado (`text-generation`).
- Uso conversacional: el tag `conversational` indica que el checkpoint esta preparado para chat multi-turno, presumiblemente con una plantilla de chat de la familia Mistral (no verificada).
- Compatibilidad con `text-generation-inference` (TGI) y con Hugging Face Inference Endpoints, segun los tags `text-generation-inference` y `endpoints_compatible`.
- Capacidad de razonamiento, codigo o matematicas: no documentada ni evaluada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declara ningun idioma).
- Capacidades especiales (modo thinking, vision, audio): no disponibles; el tag `arxiv:1910.09700` corresponde unicamente a la referencia de la calculadora de impacto ambiental citada en la plantilla de la model card, no a un paper del modelo.

## Casos de uso

- Experimentacion docente con DoRA: el modelo sirve como ejemplo practico de ajuste eficiente de bajo rango sobre una base Mistral pequena; util para comparar DoRA frente a LoRA clasico en tareas de generacion.
- Prototipado rapido en local: con 300 M de parametros y 1,2 GB de pesos, se puede cargar en una GPU de consumo para validar pipelines de `transformers` antes de escalar a modelos mayores.
- Pruebas de integracion con TGI: al estar etiquetado como compatible con `text-generation-inference`, permite validar despliegues de servidores de inferencia y endpoints sin coste de GPU grande.
- Generacion de texto de proposito general en entornos con VRAM muy limitada: tareas de completado, resumen o parafraseo siempre que se acepte la ausencia de evaluacion publicada.
- Base para fine-tuning posterior: al ser un checkpoint pequeno, es un punto de partida barato para experimentos de ajuste supervisado en dominios concretos.
- Educacion e investigacion sobre adaptadores: util para estudiar el efecto de DoRA en el comportamiento del modelo comparando pesos base y ajustados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion cumplimentada (todas las metricas aparecen como `[More Information Needed]`).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,6 GB solo para pesos (300 M de parametros), mas overhead de activaciones y cache KV; en la practica, menos de 2 GB para contextos cortos.
- VRAM estimada en fp32: aproximadamente 1,2 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es mas que suficiente. Tambien cabe en A100/H100 sin aprovechar su capacidad.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: `transformers` (libreria declarada), `text-generation-inference` (tag explicito) y Hugging Face Inference Endpoints (`endpoints_compatible`). No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requeririan conversion previa.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kseniamakeevaa/llm-course-hw3-dora | 300.049.792 | no disponible | no disponible | Hugging Face, safetensors |
| Mistral-7B (referencia de la familia) | ~7,2 B | 32 K (segun version) | Apache 2.0 (segun version) | Hugging Face, amplia adopcion |
| TinyLlama-1.1B | ~1,1 B | 2 K (segun version) | Apache 2.0 | Hugging Face, amplia adopcion |
| Qwen2.5-0.5B | ~0,5 B | 32 K (segun version) | Apache 2.0 (segun version) | Hugging Face, amplia adopcion |

La comparativa es orientativa: el modelo documentado no publica contexto, licencia ni evaluacion, por lo que la comparacion con alternativas de la misma escala (TinyLlama, Qwen2.5-0.5B) se limita a parametros y disponibilidad. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre datos de entrenamiento, modelo base exacto, hiperparametros de DoRA ni evaluacion.
- Licencia no disponible: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: no hay garantia de calidad en castellano ni en ningun otro idioma concreto.
- Longitud de contexto desconocida: no se puede planificar el uso en conversaciones largas o documentos extensos.
- Riesgo de alucinacion no evaluado: al no haber benchmarks ni evaluacion cualitativa, no existen datos sobre fidelidad factual.
- Sesgos desconocidos: sin documentacion sobre la composicion del dataset de ajuste, no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Origen academico: el identificador sugiere un trabajo de curso, sin proceso de revision ni publicacion asociada; no debe tratarse como un modelo con soporte.
- Sin pesos cuantizados: la ausencia de GGUF limita el despliegue en CPU o en entornos con llama.cpp sin conversion manual.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso por parte de la comunidad ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kseniamakeevaa/llm-course-hw3-dora
- DoRA (Weight-Decomposed Low-Rank Adaptation), paper de referencia de la tecnica: https://arxiv.org/abs/2402.09353
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
- Lacoste et al. (2019), referencia `arxiv:1910.09700` citada en la plantilla: https://arxiv.org/abs/1910.09700
