# CrowdMind/PrimeMind-0.8B

## Resumen

PrimeMind-0.8B es un ajuste fino del modelo multimodal Qwen/Qwen3.5-0.8B publicado por CrowdMind bajo licencia Apache-2.0. Su propuesta es ensenar al modelo a razonar en un estilo "comprimido" (denominado caveman thinking en la model card): cadenas de pensamiento muy cortas y densas en informacion, delimitadas por etiquetas `<think>`, seguidas de una respuesta final limpia. El objetivo es reducir el coste en tokens de la fase de razonamiento sin perder precision en la respuesta.

El entrenamiento se hizo con LoRA SFT sobre el modelo base, en cuantizacion 4-bit NF4, con un total de 1.200 muestras y una sola epoca, en unos 38 minutos sobre una RTX 4060 Ti de 16 GB. La perdida de entrenamiento bajo de 4,81 a 1,56. No se publican evaluaciones comparativas ni benchmarks, por lo que la evidencia disponible sobre su rendimiento real es muy limitada.

Es relevante ahora sobre todo como experimento de investigacion: demuestra que es viable especializar un modelo multimodal pequeno (menos de 0,6 B de parametros segun el recuento de safetensors) en un formato de razonamiento concreto usando hardware de consumo y un dataset sintetico muy reducido. Como pieza de produccion, en cambio, presenta carencias notables: cero descargas, cero valoraciones, un unico idioma declarado (ingles) y ausencia total de metricas objetivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); familia qwen3_5 del modelo base Qwen/Qwen3.5-0.8B. Ajuste mediante LoRA fusionado |
| Parametros totales | 564.859.602 segun los pesos safetensors del repositorio. La nomenclatura del modelo indica 0,8 B; no se explica la discrepancia en la model card |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El repositorio esta etiquetado como 8-bit; el entrenamiento LoRA se hizo en 4-bit NF4. No se documentan ficheros GGUF ni AWQ/GPTQ publicados |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 0,8 GB |
| Modalidades de entrada | Texto e imagen (pipeline image-text-to-text) |
| Fecha de creacion en HuggingFace | 2026-09-10 |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer multimodal que acepta texto e imagen y que en el repositorio se etiqueta con la arquitectura `qwen3_5`. Sobre esa base se aplico un ajuste supervisado (SFT) con adaptadores LoRA, no un entrenamiento completo. La configuracion declarada del LoRA es rango 64, alpha 128, dropout 0,05 y modulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, es decir, atencion y MLP en todas las capas. El entrenamiento se realizo con cuantizacion 4-bit NF4, una epoca, y la perdida descendio de 4,81 a 1,56 en aproximadamente 38 minutos sobre una RTX 4060 Ti de 16 GB.

Los datos de entrenamiento son dos conjuntos sinteticos de 600 muestras cada uno (1.200 en total): `catsaresupercool/synthetic-caveman-thinking` y `nibauman/objectnav-sft-claude-caveman`, este ultimo de caracter multimodal y orientado a navegacion de objetos. La innovacion declarada no es arquitectonica sino de formato de salida: el modelo aprende a emitir un bloque `<think>` con razonamiento telegrafico y despues la respuesta final, imitando el estilo "caveman" de los datasets. No se documenta RLHF, DPO ni ninguna fase de alineacion adicional, ni tampoco decodificacion especulativa u otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat aplicada mediante `apply_chat_template`.
- Razonamiento comprimido: emite bloques `<think>` breves antes de la respuesta final.
- Procesamiento de imagen ademas de texto, heredado del modelo base multimodal (pipeline image-text-to-text).
- Capacidad multimodal orientada a escenas y navegacion, por influencia del dataset `objectnav`.
- Ajuste especifico para respuestas concisas, con menor consumo de tokens en la fase de pensamiento que un modelo de razonamiento estandar.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; no hay evidencia de entrenamiento en ese sentido.
- Capacidades multilingues: no. Solo ingles declarado.
- Modo thinking explicito: si, mediante etiquetas `<think>`.
- Otras capacidades (audio, vision avanzada, generacion de codigo especializada): no documentadas.

## Casos de uso

- Experimentacion academica sobre compresion de cadenas de razonamiento: el modelo permite reproducir y variar el experimento (1.200 muestras, una epoca, LoRA r=64) para estudiar si el pensamiento telegrafico degrada o mantiene la precision frente al modelo base.
- Prototipado de asistentes con presupuesto de tokens ajustado: al concentrar el razonamiento en bloques `<think>` cortos, encaja en flujos donde cada token de pensamiento cuesta dinero y se busca latencia baja.
- Investigacion en modelos multimodales pequenos: sirve como banco de pruebas para evaluar tareas de descripcion de imagen o navegacion visual en un modelo por debajo de 1 B de parametros desplegable en una sola GPU de consumo.
- Educacion y demostraciones de fine-tuning: su bajo coste de entrenamiento (38 minutos en una RTX 4060 Ti) lo hace util como ejemplo didactico de LoRA SFT con cuantizacion NF4 en transformers.
- Generacion de respuestas breves y directas en ingles: clasificacion, resumen corto o extraccion de datos donde no se necesita prosa elaborada.
- Investigacion sobre datasets sinteticos: permite medir el impacto de datos generados sinteticamente y de estilo controlado en modelos pequenos.
- Base para posteriores ajustes de dominio: al ser un adaptador pequeno sobre Apache-2.0, se puede partir de el para afinar tareas concretas en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de rendimiento es la perdida de entrenamiento, que paso de 4,81 a 1,56 en una epoca. No hay MMLU, HumanEval, GSM8K, resultados de razonamiento multimodal ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 1,13 GB solo para los pesos (564,86 M de parametros x 2 bytes), mas activaciones y el codificador de vision. En la practica, un presupuesto de 2-3 GB es suficiente.
- VRAM en 8-bit: del orden de 0,6 GB para los pesos. En 4-bit, alrededor de 0,3 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente, por ejemplo RTX 3050, RTX 3060, RTX 4060, RTX 4090 o superiores. Tambien es viable en CPU y en Apple Silicon por el tamano reducido.
- Cabe en GPU de consumo: si, con holgura. El propio autor entreno el adaptador en una RTX 4060 Ti de 16 GB.
- Opciones de despliegue: transformers con `AutoModelForMultimodalLM` y `trust_remote_code=True`, tal como indica la model card. El repositorio esta etiquetado como `endpoints_compatible`, lo que sugiere compatibilidad con HuggingFace Inference Endpoints. No hay ficheros GGUF publicados, por lo que llama.cpp u Ollama requeririan conversion previa. La compatibilidad con vLLM o TGI no esta documentada.
- Latencia y throughput: no disponibles. No se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formatos publicados |
|---|---|---|---|---|---|
| PrimeMind-0.8B | 564,86 M (reportados) | No disponible | Si (imagen y texto) | Apache-2.0 | safetensors |
| Qwen3-0.6B | 0,6 B | 32.768 tokens | No | Apache-2.0 | safetensors, GGUF |
| Qwen2.5-0.5B | 0,49 B | 32.768 tokens | No | Apache-2.0 | safetensors, GGUF |
| SmolLM2-360M | 0,36 B | 8.192 tokens | No | Apache-2.0 | safetensors, GGUF |
| Gemma 3 270M | 0,27 B | 32.768 tokens | No | Licencia Gemma (uso comercial con restricciones) | safetensors |

Nota: los datos de los modelos comparativos proceden de sus fichas publicas y no de la informacion proporcionada en esta busqueda; se incluyen como referencia de categoria. No hay datos de rendimiento comparado disponibles para PrimeMind-0.8B. La comparacion es incompleta porque PrimeMind es multimodal y los alternativos de ese tamano son mayoritariamente solo texto.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan. El dataset principal es sintetico y de estilo artificial ("caveman"), lo que puede introducir un registro linguistico poco natural.
- Riesgo de alucinacion: alto y no evaluado. No hay benchmarks ni evaluaciones de fidelidad; el entrenamiento de una epoca sobre datos sinteticos no garantiza robustez factual.
- Entrenamiento muy limitado: 1.200 muestras y una sola epoca. Existe riesgo de sobreajuste al estilo del dataset y de olvido catastrofico de capacidades del modelo base.
- Idioma: solo ingles declarado. No hay soporte documentado de castellano ni de otros idiomas.
- Sin validacion externa: 0 descargas y 0 valoraciones en el momento de la consulta; no hay evidencia de uso en produccion.
- Longitud de contexto desconocida: la model card no la especifica, lo que impide planificar aplicaciones con contextos largos.
- Inconsistencia en el recuento de parametros: el nombre indica 0,8 B pero safetensors reporta 564.859.602 parametros. Conviene verificarlo antes de asumir un presupuesto de memoria.
- Codigo de ejemplo potencialmente fragil: la model card usa `AutoModelForMultimodalLM`, una clase que puede no existir en todas las versiones de transformers, y requiere `trust_remote_code=True`, lo que implica ejecutar codigo remoto del repositorio.
- Licencia: Apache-2.0 permite uso comercial, pero la licencia del modelo base (Qwen/Qwen3.5-0.8B) debe verificarse de forma independiente; la model card de PrimeMind no aporta esa confirmacion.
- Datasets de origen dudoso: `catsaresupercool/synthetic-caveman-thinking` y `nibauman/objectnav-sft-claude-caveman` no estan descritos en detalle y uno de ellos proviene de un dominio de navegacion de objetos, lo que puede desalinear el modelo respecto a tareas conversacionales generales.
- Fecha de publicacion inusual en los metadatos (2026-09-10): conviene confirmar la vigencia del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CrowdMind/PrimeMind-0.8B
- Modelo base indicado: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de referencia 1: https://huggingface.co/datasets/catsaresupercool/synthetic-caveman-thinking
- Dataset de referencia 2: https://huggingface.co/datasets/nibauman/objectnav-sft-claude-caveman
- Perfil del autor: https://huggingface.co/CrowdMind

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces devueltos correspondian a contenidos medicos en aleman sin relacion con la ficha. No se dispone de paper, blog tecnico ni demo oficial.
