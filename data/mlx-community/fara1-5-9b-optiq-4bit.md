# mlx-community/Fara1.5-9B-OptiQ-4bit

## Resumen

Fara1.5-9B-OptiQ-4bit es una cuantizacion mixta en formato MLX del modelo microsoft/Fara1.5-9B, un modelo de lenguaje y vision orientado a computer use y automatizacion web. Lo publica mlx-community y lo genera la herramienta mlx-optiq, un conjunto de herramientas nativo de MLX para cuantizar, ajustar y servir modelos localmente en Apple Silicon sin PyTorch ni nube. El modelo resuelve el problema de ejecutar un agente visual de 9.000 millones de parametros en hardware de Apple con un peso en disco de 7,5 GB, manteniendo el tower de vision en bf16 para no degradar la interpretacion de capturas de pantalla.

La arquitectura subyacente es Qwen3.5 (etiqueta `qwen3_5` en los metadatos), con 8.953.801.728 parametros totales y pipeline image-text-to-text. Fara1.5 es un fine-tuning de Qwen3.5-9B con arquitectura identica, lo que permite reutilizar la asignacion de bits por capa del cuant publicado mlx-community/Qwen3.5-9B-OptiQ-4bit sin un pase de sensibilidad especifico.

Es relevante porque cubre un nicho poco atendido: agentes que operan interfaces graficas y navegadores web, con licencia MIT, en un formato que arranca en un Mac con `optiq serve` y expone una API compatible con OpenAI. La cuantizacion resultante es de 5,21 bits por peso de media, mezclando 4 y 8 bits segun la sensibilidad de cada capa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5 (`qwen3_5`), con tower de vision |
| Parametros totales | 8.953.801.728 (8,95 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta 4/8 bits (OptiQ), 5,21 bits por peso de media |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX); vision tower en bf16 en `optiq/optiq_vision.safetensors` |

## Arquitectura y entrenamiento

El modelo base microsoft/Fara1.5-9B es un fine-tuning de Qwen3.5-9B, un transformer denso de 8,95 B de parametros con capacidad de vision (image-text-to-text). La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. Lo que si se explicita es la orientacion del ajuste: tareas de computer use y web agent, es decir, interpretar capturas de pantalla y decidir acciones sobre interfaces.

La innovacion tecnica de esta publicacion no esta en el modelo sino en la cuantizacion. OptiQ aplica una asignacion de bits por capa (mezcla de 4 y 8 bits) que se transfiere directamente desde el cuant publicado de Qwen3.5-9B-OptiQ-4bit, aprovechando que Fara1.5 comparte arquitectura exacta con Qwen3.5-9B; no se ejecuta un pase de sensibilidad separado. El tower de vision se mantiene en bf16 para preservar la calidad en la ruta multimodal. El resultado son 7,5 GB en disco a 5,21 bits por peso de media.

## Capacidades

- Generacion de texto conversacional en ingles.
- Comprension de imagenes y texto conjuntamente (pipeline image-text-to-text): interpretacion de capturas de pantalla e interfaces.
- Computer use: prediccion de acciones sobre entornos de escritorio a partir de observaciones visuales.
- Web agent: navegacion y operacion de paginas web de forma automatizada.
- Razonamiento multi-paso orientado a agentes (tags `agent`, `web-agent`).
- Servicio via API compatible con OpenAI a traves de `optiq serve`, con soporte de partes `image_url` para la ruta de vision.
- Carga en texto solo con mlx-lm estandar; la ruta completa imagen+texto requiere OptiQ.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Capacidades de audio: no disponibles.

## Casos de uso

- Automatizacion de tareas de escritorio en macOS: el modelo recibe capturas de pantalla y devuelve la siguiente accion, lo que permite construir agentes que rellenan formularios, navegan menus y operan aplicaciones nativas sin API. Su naturaleza de computer-use lo hace adecuado para este escenario.
- Agentes de navegacion web: interpretar el DOM renderizado en imagen y decidir clics, scroll y entradas de texto en flujos de compra, reservas o tramites. El ajuste especifico de web-agent reduce la necesidad de ingenieria de prompts.
- Pruebas de regresion de UI asistidas: un agente visual puede recorrer una aplicacion, detectar estados inesperados en pantalla y generar un informe, aprovechando la ruta multimodal.
- Extraccion de datos de interfaces: dado un screenshot de un panel o ERP, el modelo puede describir campos y valores y alimentar un pipeline de extraccion semiestructurada.
- Prototipado local en Apple Silicon: con 7,5 GB en disco y arranque via `optiq serve`, sirve para iterar sobre prompts y flujos de agente en un Mac antes de escalar a infraestructura mayor.
- Asistentes de soporte que necesitan ver la pantalla del usuario: en un escenario de helpdesk, el modelo puede analizar una captura compartida y proponer los pasos concretos a seguir.
- Backend de agentes con API compatible con OpenAI: integrar el endpoint `http://localhost:8000/v1` en frameworks de agentes existentes sin adaptadores propietarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso en disco del repositorio: 8,1 GB; pesos cuantizados: 7,5 GB.
- VRAM/unified memory estimada para inferencia: el modelo completo en MLX a 5,21 bits por peso requiere del orden de 7,5 GB solo para pesos, mas overhead de KV cache y del tower de vision en bf16; en la practica conviene disponer de 12-16 GB de memoria unificada como minimo.
- Hardware objetivo: Apple Silicon (MLX). No esta pensado para GPU NVIDIA ni CUDA.
- Cabe en Mac con 16 GB de memoria unificada o superior; en equipos de 8 GB el margen es muy ajustado por el tower de vision en bf16.
- Despliegue: `optiq serve` (API compatible con OpenAI en el puerto 8000) o mlx-lm estandar para la ruta solo texto. Otros frontends dependen de su propio soporte de pesos MLX.
- vLLM, TGI, llama.cpp y Ollama no se mencionan como soportados en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| mlx-community/Fara1.5-9B-OptiQ-4bit | 8,95 B | no disponible | MLX safetensors 4/8 bits | MIT | Computer use / web agent multimodal |
| microsoft/Fara1.5-9B | 8,95 B | no disponible | safetensors (bf16) | MIT | Modelo base sin cuantizar |
| mlx-community/Qwen3.5-9B-OptiQ-4bit | ~9 B | no disponible | MLX safetensors 4/8 bits | no disponible | LLM generalista, sin ajuste de agente |
| Qwen3.5-9B (original) | ~9 B | no disponible | safetensors | no disponible | LLM generalista base |

La comparacion relevante es contra el modelo base sin cuantizar (mayor calidad, mayor huella) y contra el cuant de Qwen3.5-9B del que hereda la asignacion de bits (misma eficiencia, sin capacidades de agente visual). El rendimiento numerico comparado no esta disponible.

## Limitaciones y advertencias

- Idiomas: solo ingles declarado; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto: no documentada en la informacion disponible, lo que impide planificar tareas de agente con historiales largos.
- La cuantizacion a 5,21 bits por peso introduce perdida de calidad frente al modelo bf16; no se publican evaluaciones del delta.
- La ruta de vision solo funciona con OptiQ; con mlx-lm estandar el modelo carga en modo texto y pierde la capacidad de computer use.
- Exclusivo de Apple Silicon: no hay soporte CUDA, lo que limita el despliegue en infraestructura de servidor convencional.
- Riesgo de alucinacion en la prediccion de acciones: un agente visual puede emitir clics o entradas incorrectas sobre la interfaz; requiere validacion y sandboxing en produccion.
- Sesgos: no documentados en la informacion proporcionada; al derivar de Qwen3.5 y entrenarse en ingles, es previsible un sesgo linguistico y cultural hacia entornos angloparlantes.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base microsoft/Fara1.5-9B y de Qwen3.5-9B, de los que no se detalla licencia en la informacion disponible.
- Modelo con adopcion baja (121 descargas, 3 likes) y actualizado en noviembre de 2026; no hay evidencia de comunidad amplia ni de mantenimiento a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/mlx-community/Fara1.5-9B-OptiQ-4bit
- Modelo base: https://huggingface.co/microsoft/Fara1.5-9B
- Cuant de referencia Qwen3.5-9B: https://huggingface.co/mlx-community/Qwen3.5-9B-OptiQ-4bit
- Herramienta OptiQ: https://mlx-optiq.com
- Documentacion de OptiQ: https://mlx-optiq.com/docs/
- Laboratorio OptiQ: https://mlx-optiq.com/docs/lab/
- Catalogo de cuants OptiQ: https://mlx-optiq.com/models
- mlx-lm: https://github.com/ml-explore/mlx-lm
