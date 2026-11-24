# acvlab/ABot-World-0-5-5B-Iris

## Resumen

ABot-World-0.5 es una familia de modelos generativos orientados a la simulación de "inteligencia física" desarrollada por el equipo ABot-World (acvlab), vinculado al grupo AMAP CV Lab. El modelo aquí descrito, Iris, es el miembro de 5.270.329.536 parámetros (5,27 B) de esa familia, publicado en Hugging Face bajo la librería `diffusers` con pesos en `safetensors`. Su propósito es generar vídeo condicionado por acciones (la etiqueta `ci2v` sugiere *conditioned image-to-video* o *action-conditioned video*), es decir, producir rollouts visuales donde cada acción tiene consecuencias físicas persistentes que condicionan la interacción siguiente, lo que el equipo denomina *Chain of Causation*.

El modelo se distribuye junto a una variante denominada Iris-BiT y una familia mayor, Halo-30B, que añade audio sincronizado. Según la model card, Iris-5B es capaz de emitir vídeo condicionado por acción a 21 FPS sobre una única GPU RTX 5090, lo que sitúa el modelo en el terreno de los world models interactivos en tiempo real más que en el de los generadores de vídeo por lotes. La familia incluye además dos conjuntos de datos publicados: ABot-World-Explorer-500h y ABot-World-Explorer-4D.

La relevancia del modelo reside en su enfoque: no se trata de un LLM ni de un modelo multimodal de propósito general, sino de un generador de vídeo con dinámica física aprendida, pensado para entrenamiento de agentes, simulación y evaluación de políticas. No obstante, la información pública disponible es muy limitada (repo creado el 24 de noviembre de 2026, cero descargas, cero likes, sin model card técnica completa ni informe técnico publicado), por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo generativo de vídeo, librería `diffusers`; probable difusión/flow matching, sin confirmar) |
| Parametros totales | 5.270.329.536 (5,27 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (según badge de la model card; el campo de licencia del repo figura como no disponible) |
| Formato de pesos | safetensors |
| Tamano del repo | 27,8 GB |
| Pipeline declarado | no disponible |
| Frecuencia de generación | 21 FPS en una RTX 5090 (según model card) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna. El modelo se publica bajo la librería `diffusers` y con la etiqueta `ci2v`, lo que apunta a un generador de vídeo condicionado (imagen y/o acción a vídeo) construido sobre un backbone de difusión o flow matching, pero no se confirma en la documentación. El recuento exacto de parámetros (5.270.329.536) procede de los tensores en `safetensors`, no de una declaración del autor.

En cuanto al entrenamiento, la model card menciona dos innovaciones: TAEC (*aligns event prompts with their latent intervals*), que alinea indicaciones de eventos con sus intervalos latentes para que cada habilidad se active en el momento correcto del rollout, y Prompt Switch, que redirige comportamientos a mitad del rollout. También se anuncia un informe técnico ("Technical report coming soon") que aún no está disponible, por lo que no se conocen el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u optimización por preferencias. Los datasets publicados (Explorer-500h y Explorer-4D) probablemente forman parte del corpus, pero no se explicita su uso.

## Capacidades

- Generación de vídeo condicionado por acción con dinámica física persistente (*Chain of Causation*): cada acción modifica el estado y afecta a la interacción siguiente.
- Generación en streaming a 21 FPS sobre una única RTX 5090, según la model card.
- Control de comportamiento mediante prompt switching a mitad del rollout.
- Alineación temporal de eventos mediante TAEC, para que las habilidades se activen en el intervalo latente correcto.
- Variante Iris-BiT publicada por separado (características de la variante no detalladas).
- Integración con el ecosistema `diffusers`.
- Soporte de *tool calling* / *function calling*: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad del modelo en sí; está pensado como entorno/simulador para agentes.
- Capacidades multilingües: no disponible.
- Capacidades especiales: audio sincronizado solo en el modelo Halo-30B de la familia, no en Iris.

## Casos de uso

- Simulación de entornos para entrenamiento de agentes: Iris puede generar rollouts visuales condicionados por acción a 21 FPS, lo que permite a un agente de refuerzo interactuar con un entorno sintético reactivo sin depender de un simulador físico tradicional.
- Evaluación de políticas robóticas: al modelar consecuencias físicas persistentes, el modelo sirve para probar políticas antes de desplegarlas en hardware real, reduciendo el coste y el riesgo de las pruebas físicas.
- Generación de datos sintéticos de vídeo: los rollouts generados pueden emplearse para aumentar datasets de percepción o de imitación, aprovechando los conjuntos Explorer-500h y Explorer-4D publicados por el mismo equipo.
- Prototipado de videojuegos y experiencias interactivas: la generación en streaming a 21 FPS en una GPU de consumo permite experimentar con entornos generativos en tiempo real.
- Investigación en world models: el modelo constituye una base para estudiar la consistencia física y la causalidad en modelos generativos de vídeo, con control fino mediante prompt switching.
- Demostraciones interactivas y herramientas creativas: el control por acciones y la redirección de comportamiento a mitad del rollout permiten construir instalaciones o demos donde el usuario modifica la escena en tiempo real.
- Benchmarking de modelos generativos de vídeo: la familia incluye métricas propias (WBench) que pueden usarse para comparar alternativas en navegación y plausibilidad física.

## Benchmarks y rendimiento

La model card menciona que el modelo Halo-30B de la misma familia alcanzó el puesto número 1 en WBench Navigation, con 84,8 en Average y 74,2 en Physical bajo el juez Qwen3.8-27B. No se han publicado resultados de benchmarks para Iris-5B en la información disponible.

| Benchmark | Modelo | Resultado |
|---|---|---|
| WBench Navigation (Average) | Halo-30B (familia ABot-World-0.5) | 84,8 |
| WBench Navigation (Physical) | Halo-30B (familia ABot-World-0.5) | 74,2 |
| Iris-5B | — | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 5,27 B de parámetros en `safetensors` (probablemente bf16/fp16), los pesos ocupan aproximadamente 10,5 GB; el repo de 27,8 GB sugiere que incluye varios componentes (posible VAE, text encoder u otros) además de los pesos principales.
- GPU recomendadas: la model card cita una RTX 5090 para alcanzar 21 FPS; no se especifican otros modelos.
- GPU de consumo: sí, según el autor cabe en una RTX 5090. El comportamiento en GPUs con menos VRAM (RTX 4090, 4080, etc.) no está documentado.
- Opciones de despliegue: integración con `diffusers`; no se documentan soportes de vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de vídeo de este tipo).
- Latencia y throughput: 21 FPS en streaming sobre una RTX 5090, según la model card. No hay datos de latencia por fotograma ni de throughput en otros hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría (world models generativos de vídeo condicionados por acción). La model card no incluye comparaciones con modelos externos, y los benchmarks publicados solo cubren el modelo Halo-30B de la propia familia.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ABot-World-0.5 Iris-5B | 5,27 B | no disponible | 21 FPS en RTX 5090 (autor) | Apache 2.0 (según badge) | Hugging Face, ModelScope |
| ABot-World-0.5 Iris-5B-BiT | no disponible | no disponible | no disponible | Apache 2.0 (según badge) | Hugging Face, ModelScope |
| ABot-World-0.5 Halo-30B | no disponible | no disponible | WBench Nav. 84,8 / 74,2 | no disponible | no disponible en la información |
| Alternativas externas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Documentación muy incompleta: no hay informe técnico publicado, la model card es fundamentalmente promocional y el campo de licencia del repo figura como no disponible pese al badge Apache 2.0.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso en el sentido habitual; no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Riesgo de alucinación física: como world model generativo, puede producir dinámicas visualmente plausibles pero físicamente incorrectas; no se han publicado métricas de consistencia física para Iris-5B.
- Sesgos: no documentados. Al ser un modelo entrenado con datos de vídeo, es probable que herede sesgos de escena, iluminación y demografía de dichos datos, pero no se detalla.
- Limitaciones de idioma y contexto: no disponibles.
- Restricciones de licencia: el badge indica Apache 2.0, lo que permitiría uso comercial, pero la ausencia del campo de licencia en el repo y de un fichero LICENSE verificable introduce incertidumbre; conviene confirmarlo antes de un despliegue comercial.
- Requisitos de hardware no triviales: los 21 FPS se declaran sobre una RTX 5090; el rendimiento en GPUs de generación anterior o con menos VRAM no está documentado.
- Madurez: el repo se creó y actualizó en el mismo día (24 de noviembre de 2026), lo que sugiere una publicación reciente y posiblemente incompleta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/acvlab/ABot-World-0-5-5B-Iris
- Variante Iris-BiT en Hugging Face: https://huggingface.co/acvlab/ABot-World-0-5-5B-Iris-BiT
- Modelo en ModelScope: https://modelscope.cn/models/amap_cvlab/ABot-World-0-5-5B-Iris
- Iris-BiT en ModelScope: https://modelscope.cn/models/amap_cvlab/ABot-World-0-5-5B-Iris-BiT
- Página del proyecto: https://amap-cvlab.github.io/ABot-World/
- Repositorio de código: https://github.com/amap-cvlab/ABot-World
- Estudio/demo: https://abot-world.amap.com
- Dataset Explorer-500h: https://huggingface.co/datasets/acvlab/ABot-World-Explorer-500h
- Dataset Explorer-4D: https://huggingface.co/datasets/acvlab/ABot-World-Explorer-4D
- Dataset Explorer-500h en ModelScope: https://modelscope.cn/datasets/amap_cvlab/ABot-World-Explorer-500h
- Dataset Explorer-4D en ModelScope: https://modelscope.cn/datasets/amap_cvlab/ABot-World-Explorer-4D
