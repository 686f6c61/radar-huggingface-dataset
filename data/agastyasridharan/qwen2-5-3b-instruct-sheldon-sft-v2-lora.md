# agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v2-LoRA

## Resumen
El adaptador `agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v2-LoRA` es un LoRA (Low-Rank Adaptation) construido sobre el modelo base `Qwen/Qwen2.5-3B-Instruct`. Ha sido desarrollado por agastyasridharan y tiene como objetivo dotar al modelo base de una personalidad concreta: el personaje Sheldon Cooper. El adaptador se entrena mediante fine-tuning supervisado (SFT) sobre conversaciones extraídas del dataset `tbooy/sheldon-cooper-sft-20k`, filtrando 11 910 muestras de conversaciones en las que se ha eliminado todo contenido matemático.

Técnicamente, se trata de un adaptador PEFT con rango 32 y alfa 64 aplicado a todas las proyecciones lineales. El entrenamiento se realizó durante 2 épocas, con un total de 374 pasos. Además del adaptador final (paso 374), el repositorio incluye 20 checkpoints intermedios guardados cada 19 pasos para poder analizar la evolución de la personalidad y de las capacidades STEM a lo largo del proceso de entrenamiento. El tamaño total del repositorio es de 4,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base) con adaptador LoRA (PEFT) en todas las proyecciones lineales |
| Parametros totales | 3B en el modelo base; parametros del adaptador no especificados |
| Longitud de contexto | no disponible (depende del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | no disponible; el repositorio contiene safetensors sin cuantizacion explicita |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research (qwen-research) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento
El adaptador se construye sobre `Qwen/Qwen2.5-3B-Instruct` y se entrena con la biblioteca PEFT. Se aplican proyecciones LoRA a todas las capas lineales del modelo base, con rango 32 y alfa 64. El entrenamiento utiliza fine-tuning supervisado sobre 11 910 conversaciones centradas en la personalidad de Sheldon Cooper, eliminando deliberadamente las matemáticas del dataset. Se ejecutaron 2 épocas (374 pasos). El repositorio publica tanto el adaptador final como los checkpoints intermedios (20 adaptadores guardados cada 19 pasos). Estos checkpoints permiten trazar cómo evoluciona la adherencia a la persona y cómo podrían alterarse las capacidades STEM a lo largo del entrenamiento, un aspecto que el autor destaca explícitamente en la model card.

## Capacidades
- El adaptador modifica el comportamiento del modelo base para adoptar una personalidad concreta: Sheldon Cooper.
- Genera conversaciones en estilo de personaje, tal como se refleja en el dataset de entrenamiento (conversaciones de persona).
- El modelo fusionado resultante conserva las capacidades del modelo base Qwen2.5-3B-Instruct, aunque no se especifican en la informacion disponible.
- No se proporcionan datos sobre soporte de tool calling, agents, vision o audio en la documentacion del adaptador.
- Se ha eliminado el contenido matematico del entrenamiento, por lo que las capacidades STEM pueden verse afectadas o degradadas.
- Los checkpoints intermedios permiten evaluar la evolucion de la persona y de las capacidades STEM a lo largo de la trayectoria de SFT.

## Casos de uso
- Simulacion de personaje en aplicaciones de role-playing: se puede cargar el adaptador sobre el modelo base para construir chatbots que respondan con la voz y las pautas de conducta de Sheldon Cooper en juegos o experiencias interactivas.
- Investigacion en personalizacion y alineacion de modelos de lenguaje: al contar con checkpoints intermedios, es posible estudiar como se consolida una personalidad especifica durante el SFT y qué efectos tiene sobre otras habilidades.
- Generacion de guiones de ficcion: el modelo puede asistir en la escritura de dialogos consistentes con un personaje ficticio concreto para proyectos narrativos o de entretenimiento.
- Pruebas de consistencia de persona en sistemas conversacionales: se puede usar para evaluar si un agente mantiene una personalidad estable en dialogos largos, aprovechando que el dataset de entrenamiento consiste en conversaciones de persona.
- Desarrollo de asistentes tematicos para fans: integrar el adaptador en aplicaciones comunitarias para interactuar con un tono reconocible y cercano al personaje de la serie.
- Estudio de "catastrophic forgetting" en modelos ajustados: la eliminacion deliberada de contenido matematico permite comparar los checkpoints y analizar como la especializacion en persona degrada otras capacidades del modelo.
- Prototipos de entretenimiento educativo: aunque el adaptador esta fijado a Sheldon Cooper, puede servir de plantilla metodologica para crear perfiles similares en otros ambitos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a una tabla de evaluacion en el modelo fusionado `agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v2`, pero no se proporcionan los datos en la documentacion consultada.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible.
- GPU recomendada: no disponible.
- Si cabe en consumer GPU: no disponible.
- Opciones de despliegue: la model card muestra la carga mediante Transformers y PEFT con `PeftModel` sobre el modelo base `Qwen/Qwen2.5-3B-Instruct`. No se especifican alternativas como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
No se proporcionan modelos comparables en la informacion disponible.

## Limitaciones y advertencias
- El adaptador se entreno exclusivamente en conversaciones de persona y se eliminaron todas las matematicas del dataset, lo que puede provocar una degradacion de las capacidades STEM con respecto al modelo base. El autor menciona explicitamente el seguimiento de la evolucion de "persona and STEM capability" en los checkpoints.
- El modelo esta disenado para imitar la personalidad de un personaje ficticio concreto. Esto puede reforzar comportamientos o sesgos asociados a ese personaje, como arrogancia, rigidez o una vision social particular. No es recomendable utilizarlo como fuente de informacion factual.
- No se disponen de datos sobre alucinaciones, sesgos, seguridad o evaluaciones de calidad del adaptador en la informacion proporcionada.
- La licencia es Qwen Research (qwen-research). Se debe revisar el texto completo de la licencia enlazada antes de cualquier uso comercial, ya que este tipo de licencias suele restringir la explotacion a fines de investigacion.
- El repositorio presenta 0 descargas y 0 likes, lo que indica que no existe evidencia publica de validacion por parte de la comunidad ni de uso en produccion.
- Los adaptadores PEFT deben cargarse sobre el modelo base exacto. Si se carga sobre otro modelo o se fusiona incorrectamente, el comportamiento puede no ser el esperado.
- No se incluyen datos sobre la longitud de contexto ni sobre los idiomas soportados por el adaptador, por lo que en esos aspectos se depende de las caracteristicas no verificadas del modelo base.

## Enlaces
- Adaptador LoRA: https://huggingface.co/agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v2-LoRA
- Modelo fusionado de referencia: https://huggingface.co/agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/tbooy/sheldon-cooper-sft-20k
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base (enlazada por el autor): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
