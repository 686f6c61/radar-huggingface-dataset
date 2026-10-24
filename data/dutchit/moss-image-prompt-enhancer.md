# DutchIT/moss-image-prompt-enhancer

## Resumen

MOSS-Image Prompt Enhancer es un empaquetado para Ollama que convierte ideas breves de imagen en prompts detallados para el modelo texto-a-imagen MOSS-Image, desarrollado por OpenMOSS. No se trata de un modelo entrenado desde cero: el repositorio de HuggingFace bajo el identificador `DutchIT/moss-image-prompt-enhancer` contiene un `Modelfile` de Ollama (system prompt, parametros de muestreo y ejemplos few-shot) que se apoya en el modelo base `huihui-ai/Qwen3-8B-abliterated`, una variante del Qwen3-8B de Alibaba con los mecanismos de rechazo ablacionados. Su proposito es reproducir en local, sin agente ni llamadas a API, la skill oficial `moss-image-prompt-enhancer` publicada en el repositorio de MOSS-Image, que originalmente esta pensada para agentes de la familia GPT-6 con acceso a sistema de ficheros y Python.

El modelo resuelve un problema concreto de los pipelines texto-a-imagen: las peticiones cortas ("una mujer leyendo en una cafeteria") producen imagenes genericas, mientras que MOSS-Image rinde mejor con descripciones ricas o con especificaciones espaciales en JSON. El potenciador devuelve unicamente el prompt enriquecido, sin preambulos, en dos modos: Caption (prosa descriptiva cohesiva en ingles) y Layout (borrador JSON con cajas delimitadoras en pixeles para posters, infografias y texto renderizado).

Es relevante ahora porque MOSS-Image, una familia de modelos texto-a-imagen de unos 5B parametros con control nativo de layout, depende de un potenciador de prompts basado en intencion para traducir peticiones de menos de diez palabras en especificaciones ejecutables. Este empaquetado permite ejecutar ese paso de forma offline en hardware de consumo, a cambio de la fiabilidad de un modelo de 8B frente a un agente de gran escala.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base Qwen3-8B); el repositorio es un `Modelfile` de Ollama, no un entrenamiento nuevo |
| Parametros totales | 8B (heredados de `huihui-ai/Qwen3-8B-abliterated`) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens configurados en el `Modelfile` (`num_ctx`); el modelo base admite ventanas mayores, no verificadas en esta ficha |
| Tipos de cuantizacion | La que exponga el tag de Ollama del modelo base (`huihui_ai/qwen3-abliterated:8b`); el `Modelfile` puede apuntar a otros tags. Cuantizacion exacta del tag por defecto: no disponible en la model card |
| Idiomas soportados | No declarados en la model card; la salida esta disenada para ser en ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | Sin pesos en el repositorio (0,0 GB): `Modelfile` + descarga del GGUF del modelo base a traves de Ollama |

Otros datos del repositorio: pipeline declarado `text-to-image` (aunque el modelo es de texto, no genera imagenes), 0 descargas, 1 like, creado y actualizado el 24 de octubre de 2026. Etiquetas: `prompt-enhancer`, `text-to-image`, `moss-image`, `ollama`.

Parametros de generacion fijados en el `Modelfile`:

| Parametro | Valor | Justificacion indicada por el autor |
|---|---|---|
| `temperature` | 0.7 | Cierta variedad creativa |
| `top_p` / `top_k` | 0.8 / 20 | Muestreo recomendado por Qwen3 en modo no-thinking |
| `num_ctx` | 8192 | Encaje del system prompt, ejemplos y salida |
| `num_predict` | 2048 | Limitar salidas descontroladas |

## Arquitectura y entrenamiento

El modelo no incluye entrenamiento propio ni publica pesos. La arquitectura efectiva es la del modelo base `huihui-ai/Qwen3-8B-abliterated`: un transformer decoder-only denso de 8B parametros, variante "abliterated" del Qwen3-8B en la que se han ablacionado las direcciones de rechazo para reducir las negativas del modelo. Sobre esa base, el autor superpone un system prompt completo y varias conversaciones de ejemplo (few-shot) que ensenan el formato de Layout, empaquetados en el `Modelfile` de Ollama. El resultado se materializa como una capa adicional sobre el GGUF del modelo base, con reutilizacion de capas si solo cambia el `Modelfile`.

El comportamiento se define por prompt, no por pesos: el system prompt impone la preservacion de la intencion del usuario (sujeto, estilo, recuentos, exclusiones y texto visible exacto), la prohibicion de listas de quality tags, prompts negativos, eslóganes o marcas de agua inventadas, y la regla de asignar siempre edad y etnia a las personas representadas, respetandolas si el usuario las aporta o infiriendolas del contexto (un mercado nocturno de Seul implica persona coreana). En modo Layout el modelo emite un borrador con `bbox_coord_space: "abs"`, `bbox_format: "xyxy"` y coordenadas `[x_min, y_min, x_max, y_max]` desde la esquina superior izquierda; deliberadamente no se le pide hacer aritmetica de coordenadas porque los modelos pequenos fallan en esa tarea. Un script externo de la skill oficial, `compile_prompt.py`, valida las cajas, rechaza las fuera de limites y las convierte al formato centrado `yxyx` que espera MOSS-Image.

## Capacidades

- Generacion de prompts descriptivos en prosa inglesa (modo Caption) para fotografias, retratos, paisajes, ilustraciones y pinturas.
- Generacion de especificaciones espaciales en JSON (modo Layout) con cajas delimitadoras en pixeles para posters, infografias e imagenes multipanel.
- Preservacion de texto visible exacto y de recuentos de objetos indicados por el usuario.
- Deteccion de modo explicito en la peticion ("Layout mode, 1024x1536: ...", "Caption mode: ...") y respeto del tamano de lienzo indicado.
- Salida limpia: solo el prompt, sin preambulos, explicaciones ni prompts negativos.
- Inferencia totalmente offline, integrable en flujos locales mediante API de Ollama o nodos de ComfyUI.
- Sin soporte documentado de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking.
- Multilingue: no declarado; se ha observado que una instruccion del tipo "write the prompt in Chinese" puede devolver texto no relacionado.

## Casos de uso

- **Generacion de imagenes en ComfyUI con MOSS-Image**: el modelo se conecta mediante el nodo simple `comfyui-ollama` (una caja de texto a la entrada de prompt, sin system prompt adicional) y su salida se pega como prompt positivo en el flujo de MOSS-Image. Aporta detalle semantico sin coste de API y con latencia local.
- **Automatizacion de posters con texto renderizado**: en modo Layout, una peticion como "Layout mode, 1024x1536: poster de concierto de jazz con el titulo SUMMER JAZZ NIGHT y la linea Friday 8 PM / Blue Door Cafe" produce un borrador JSON con cajas en pixeles; tras pasar por `compile_prompt.py` se obtiene un prompt que MOSS-Image puede renderizar con colocacion de texto controlada.
- **Estandarizacion de prompts en un equipo de diseno**: se fija el mismo `Modelfile` y los mismos parametros de muestreo para que todo el equipo genere descripciones homogeneas y comparables, evitando la variabilidad de escribir prompts a mano.
- **Prototipado rapido de conceptos visuales**: iterar sobre ideas de una linea ("una anciana tejiendo junto a una ventana, estilo acuarela") y obtener descripciones listas para generar variaciones, util en fases de exploracion creativa.
- **Pipelines batch de generacion de imagenes**: la API HTTP de Ollama (`/api/generate` con `"stream": false`) permite procesar listas de ideas de forma desatendida en un servidor con GPU, sin dependencia de servicios externos ni coste por token.
- **Entornos con restricciones de conectividad o confidencialidad**: al ejecutarse integramente en local, permite enriquecer prompts de material interno (producto no lanzado, campanas) sin enviar descripciones a APIs de terceros.
- **Pruebas de calidad de prompts**: el repositorio incluye `examples/inputs.jsonl` con 20 prompts de prueba y `tests/evaluation.md` como lista de comprobacion manual, lo que permite montar un banco de evaluacion reproducible para comparar configuraciones o modelos base distintos cambiando la linea `FROM`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas cuantitativas (MMLU, HumanEval, GSM8K ni evaluaciones especificas de calidad de prompt); unicamente describe problemas observados cualitativamente en `examples/outputs.md` y recomienda ejecutar cada prompt varias veces por el caracter estocastico del muestreo.

## Requisitos de hardware

- Descarga del modelo base: aproximadamente 5 GB (`huihui_ai/qwen3-abliterated:8b`).
- Memoria: alrededor de 8 GB de RAM o VRAM se consideran suficientes para un uso comodo, segun el autor.
- VRAM estimada para inferencia en GPU (estimacion propia a partir del tamano, no publicada por el autor): ~5 GB solo pesos en cuantizacion de 4 bits, mas cache KV para 8192 tokens; en la practica, entre 6 y 8 GB para offload completo.
- Cabe en GPU de consumo: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4070 Ti, RTX 4080 y RTX 4090; en tarjetas de 8 GB puede requerir offload parcial a CPU.
- Alternativa sin GPU: ejecucion en CPU con Ollama, con latencias mayores no cuantificadas en la informacion disponible.
- Despliegue: Ollama (procedimiento oficial: `ollama create moss-prompt-enhancer -f Modelfile` y `ollama run`), API HTTP local de Ollama, nodo `comfyui-ollama` para ComfyUI. Tambien es posible servir el GGUF del modelo base con llama.cpp, aunque el system prompt y los few-shot del `Modelfile` habria que replicarlos manualmente.
- Python 3 es necesario unicamente para el modo Layout, por el script `compile_prompt.py` de la skill oficial.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Benchmarks |
|---|---|---|---|---|---|
| `DutchIT/moss-image-prompt-enhancer` (este) | 8B | 8192 configurados | `Modelfile` de Ollama sobre GGUF | Apache-2.0 | No disponibles |
| `huihui-ai/Qwen3-8B-abliterated` (base sin empaquetar) | 8B | Mayor que 8192 en el base (no verificado) | Safetensors / GGUF | Apache-2.0 (heredada de Qwen3) | No disponibles en esta ficha |
| Skill oficial `moss-image-prompt-enhancer` (OpenMOSS) | No es un modelo: script Python + agente GPT-6-family | Limitado por el agente | Python, sin dependencias de terceros | La del repositorio MOSS-Image | No disponibles |
| Qwen3-8B estandar (sin abliterar) | 8B | Mayor que 8192 (no verificado) | Safetensors / GGUF | Apache-2.0 | No disponibles en esta ficha |

La diferencia practica frente al modelo base es el comportamiento: el `Modelfile` anade el formato Caption/Layout, las reglas de preservacion de intencion y los ejemplos de layout. Frente a la skill oficial, la diferencia es de entorno: la skill asume un agente con herramientas de fichero y shell y delega la aritmetica de coordenadas en Python, mientras que este empaquetado funciona sin agente pero con la fiabilidad limitada de un modelo de 8B.

## Limitaciones y advertencias

- **Modelo base abliterated**: `huihui-ai/Qwen3-8B-abliterated` tiene las direcciones de rechazo ablacionadas, por lo que los filtros de seguridad son mas debiles que en Qwen3-8B original. No es adecuado como capa de moderacion ni en entornos donde se espere rechazo de contenido sensible.
- **Sesgos demograficos**: la regla de asignar siempre edad y etnia produce elecciones que, cuando no hay pistas en el contexto, tienden a unos pocos valores por defecto. Es un sesgo estructural del comportamiento pedido, no un fallo puntual.
- **Alucinacion de texto visible**: el modelo ocasionalmente inventa texto en la escena (por ejemplo, un cartel en un bar), lo que puede introducir leyendas no deseadas en la imagen generada.
- **Etiquetado incorrecto en Layout**: los personajes se etiquetan a veces como `object` en lugar de `character`.
- **Cajas de layout plausibles pero no bien compuestas**: el borrador JSON debe revisarse antes de compilar; `compile_prompt.py` rechaza cajas invalidas o fuera de limites, pero no evalua la calidad de la composicion.
- **Incumplimiento de instrucciones**: al ejecutarse sobre un modelo de 8B, el seguimiento de reglas es imperfecto; peticiones como "escribe el prompt en chino" pueden devolver texto no relacionado. El propio autor recomienda subir de tamano de modelo base cambiando la linea `FROM` si se necesita mas fiabilidad.
- **Idioma**: las salidas estan disenadas para ingles; el soporte multilingue no esta declarado y el comportamiento en castellano no esta documentado.
- **Ventana de contexto**: `num_ctx` esta fijado en 8192; prompts de sistema o conversaciones mas largas se truncaran.
- **Naturaleza del repositorio**: no contiene pesos ni artefacto entrenado; es una receta reproducible. Su comportamiento depende por completo del tag del modelo base que se descargue en el momento del `ollama create`, lo que afecta a la reproducibilidad a largo plazo.
- **Licencia**: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de MOSS-Image por separado antes de un despliegue en produccion.
- **Estado del proyecto**: 0 descargas y 1 like en el momento de la consulta; no hay evidencia de uso en produccion ni de mantenimiento continuado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DutchIT/moss-image-prompt-enhancer
- Modelo base: https://huggingface.co/huihui-ai/Qwen3-8B-abliterated
- Repositorio del empaquetado (instalacion y Modelfile): https://github.com/royen99/moss-image-prompt-enhancer
- Repositorio oficial de MOSS-Image: https://github.com/OpenMOSS/MOSS-Image
- Skill oficial del potenciador de prompts: https://github.com/OpenMOSS/MOSS-Image/tree/main/skills/moss-image-prompt-enhancer
- Documento de la skill (SKILL.md): https://github.com/OpenMOSS/MOSS-Image/blob/main/skills/moss-image-prompt-enhancer/SKILL.md
- Scripts de la skill (incluye `compile_prompt.py`): https://github.com/OpenMOSS/MOSS-Image/tree/main/skills/moss-image-prompt-enhancer/scripts
- Informe tecnico de MOSS-Image (arXiv): https://arxiv.org/html/2610.23374v1
- Pagina del proyecto MOSS-Image: https://openmoss.ai/MOSS-Image/
- Flujo de trabajo en ComfyUI (Turbo + Prompt Enhancer): https://civitai.red/models/3008441/moss-image-turbo-prompt-enhancer-one-node-workflow
- Ollama (descarga y documentacion): https://ollama.com
- Descarga de Ollama: https://ollama.com/download
