# Lucasgitguy-co/Qwen3.5-2B-Mermaid-MLX-LoRA

## Resumen

Qwen3.5-2B-Mermaid-MLX-LoRA es un adaptador LoRA experimental publicado por el usuario Lucasgitguy-co para la generacion de diagramas Mermaid. No se distribuye como modelo autonomo ni como adaptador PEFT, sino como un conjunto de tensores en formato MLX que debe aplicarse sobre una revision concreta del modelo base cuantizado `mlx-community/Qwen3.5-2B-4bit`, derivado a su vez de `Qwen/Qwen3.5-2B`. El objetivo es especializar un modelo pequeno de 2B parametros en la sintaxis de Mermaid, un lenguaje de marcado textual para diagramas.

El adaptador se entrena sobre el dataset `Lucasgitguy-co/mermaid-diagram-text-images`, con fronteras de entrenamiento y validacion originales y ejemplos sobredimensionados descartados en lugar de truncados. La model card advierte explicitamente de que la etapa de entrenamiento es solo de texto: aunque el pipeline declarado es `image-text-to-text` y se conserva la arquitectura de vision del modelo base, no se ha entrenado el comportamiento imagen-a-Mermaid. Los ejemplos de imagen del dataset son renders sinteticos, no bocetos humanos.

La relevancia del proyecto es acotada pero clara: demuestra un flujo de fine-tuning LoRA sobre MLX (el framework de Apple para Apple Silicon) aplicado a la generacion de diagramas, con trazabilidad de procedencia mediante los ficheros `provenance.json`, `environment.json` y `evaluation.json`. El autor no reclama mejoras en validez sintactica ni correccion semantica de los diagramas sin una evaluacion separada de renders, lo que conviene tener en cuenta antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la del modelo base Qwen3.5-2B); adaptador LoRA sobre pesos MLX |
| Parametros totales | 2B en el modelo base; el adaptador anade un numero de parametros no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (base requerida: `mlx-community/Qwen3.5-2B-4bit`, revision `674aaa7240b91e8012fcad5d791b7dfe5ba90207`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `adapters.safetensors` (MLX) + `adapter_config.json` |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3.5-2B, un transformer de 2B parametros con capacidad de vision, y se aplica mediante LoRA sobre la version cuantizada a 4 bits del modelo base en formato MLX. La carga se realiza con `mlx_vlm.load` y `prepare_model_for_training`, pasando la ruta del checkpoint `adapters.safetensors`; es imprescindible mantener `adapter_config.json` junto a los tensores y usar la revision exacta del base indicada, ya que el adaptador no es compatible con otras cuantizaciones ni con el modelo original en safetensors.

El entrenamiento utiliza el dataset `Lucasgitguy-co/mermaid-diagram-text-images` en su revision `21bd67796259d0f5c8bf67d00f45f3d59ba8f73a`, respetando las particiones originales de entrenamiento y validacion. No se reanadio la coleccion de texto original solapada. Los ejemplos que excedian la longitud maxima se descartaron en lugar de truncar los diagramas objetivo, lo que evita targets sintacticamente invalidos. La etapa descrita es exclusivamente de texto: la arquitectura de vision del base se preserva, pero no se ha entrenado la conversion de imagen a Mermaid. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de diagramas en sintaxis Mermaid a partir de descripciones textuales, segun el objetivo declarado del adaptador.
- Fine-tuning LoRA sobre MLX, orientado a ejecucion en hardware Apple Silicon.
- Conservacion de la arquitectura multimodal del modelo base Qwen3.5-2B, aunque sin entrenamiento especifico en la tarea imagen-a-Mermaid.
- Capacidades heredadas del modelo base (generacion de texto, razonamiento y codigo) sujetas a la especializacion introducida por el adaptador; no se documentan en la model card.
- Soporte de tool calling, agentes, modo thinking o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de diagramas de flujo en documentacion tecnica: el adaptador puede producir bloques Mermaid a partir de una descripcion textual de procesos, integrables en Markdown renderizado por GitHub, GitLab o MkDocs.
- Diagramas de secuencia para especificaciones de API: util para transformar descripciones de interacciones entre servicios en sintaxis `sequenceDiagram`, reduciendo el trabajo manual de dibujo.
- Diagramas de clases y entidad-relacion en fases de diseno: el modelo puede esbozar estructuras iniciales que el equipo refine despues, aprovechando su tamano reducido para ejecucion local.
- Prototipado en local sobre Mac: al ser un adaptador MLX sobre un base de 2B en 4 bits, es viable en equipos Apple Silicon sin GPU dedicada, lo que facilita iterar sin coste de API.
- Educacion y demostraciones de fine-tuning: sirve como ejemplo reproducible de entrenamiento LoRA con MLX-VLM, con ficheros de procedencia y entorno que documentan la ejecucion.
- Automatizacion de borradores de diagramas en pipelines de documentacion: combinado con un validador de sintaxis Mermaid, puede generar candidatos que se validen antes de publicarse.
- Experimentacion en investigacion sobre generacion de lenguajes estructurados: permite estudiar como un modelo de 2B se adapta a una gramatica concreta con un presupuesto de computo minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un fichero `evaluation.json` y advierte de que la perdida de validacion por si sola no demuestra mayor validez sintactica ni correccion semantica de los diagramas Mermaid, y que no se reclama tal mejora sin una evaluacion separada de diagramas renderizados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al tratarse de un base de 2B en 4 bits, la huella es reducida y apta para memoria unificada de equipos Apple Silicon.
- GPU recomendadas: hardware Apple Silicon con soporte MLX (series M1, M2, M3, M4); no se documenta soporte para GPU NVIDIA.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada suficiente; el tamano del repositorio es de 0.0 GB porque solo contiene los tensores del adaptador, no los pesos base.
- Opciones de despliegue: `mlx-vlm` con `snapshot_download` de Hugging Face Hub y `prepare_model_for_training`; no se indican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-2B-Mermaid-MLX-LoRA | 2B (base) + adaptador | no disponible | LoRA especializado en Mermaid sobre MLX | Apache 2.0 | MLX (`adapters.safetensors`) |
| Qwen/Qwen3.5-2B | 2B | no disponible | Modelo base multimodal generalista | no disponible en la informacion | safetensors |
| mlx-community/Qwen3.5-2B-4bit | 2B | no disponible | Base cuantizado a 4 bits para MLX | no disponible en la informacion | MLX |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con otros adaptadores de generacion de diagramas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo ni un adaptador PEFT: requiere la revision exacta `674aaa7240b91e8012fcad5d791b7dfe5ba90207` de `mlx-community/Qwen3.5-2B-4bit` y el fichero `adapter_config.json` junto a los tensores.
- La etapa de entrenamiento es solo de texto: no se ha entrenado el comportamiento imagen-a-Mermaid pese a que el pipeline declarado sea `image-text-to-text`.
- Los ejemplos de imagen del dataset son renders sinteticos, no bocetos humanos, lo que limita la generalizacion a entradas visuales reales.
- El autor advierte de que la perdida de validacion no garantiza validez sintactica ni correccion semantica de los diagramas; no se reclama mejora sin evaluacion de renders.
- Riesgo de alucinacion y de generar sintaxis Mermaid invalida no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles.
- Restricciones de licencia: Apache 2.0 con atribucion original de Qwen conservada; se mantiene la licencia del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion.
- Fecha de creacion y actualizacion muy proximas (1 de noviembre de 2026), lo que sugiere un artefacto experimental sin ciclo de validacion externo.

## Enlaces

- [Hugging Face: Lucasgitguy-co/Qwen3.5-2B-Mermaid-MLX-LoRA](https://huggingface.co/Lucasgitguy-co/Qwen3.5-2B-Mermaid-MLX-LoRA)
- [Modelo base: Qwen/Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B)
- [Base cuantizada: mlx-community/Qwen3.5-2B-4bit](https://huggingface.co/mlx-community/Qwen3.5-2B-4bit)
- [Dataset: Lucasgitguy-co/mermaid-diagram-text-images](https://huggingface.co/datasets/Lucasgitguy-co/mermaid-diagram-text-images)
- [MLX-VLM (framework de carga y entrenamiento)](https://github.com/Blaizzy/mlx-vlm)
