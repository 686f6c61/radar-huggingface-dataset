# Raretutor/vdn-minimax-h3-comfyui-int8-convrot

## Resumen

El modelo `Raretutor/vdn-minimax-h3-comfyui-int8-convrot` es un conjunto de pesos cuantizados en INT8 para la rama lineal (linear branch) del modelo `OpenVDN/vdn-minimax-h3`, un modelo de generación de video a partir de texto basado en MiniMax H3. Ha sido desarrollado por el usuario Raretutor y publicado en Hugging Face con el objetivo de reducir el tamaño del archivo y el consumo de VRAM durante la carga del modelo, manteniendo una calidad visual cercana a la original mediante el uso de la técnica Hadamard Convolutive Rotation (ConvRot) con grupo 256.

La cuantización reduce el peso del archivo de aproximadamente 4.3 GB a 2.15 GB (un ahorro del 46 %) y evita un pico de VRAM de unos 4.7 GB durante la carga, según la documentación del autor. El modelo está diseñado para integrarse de forma nativa en ComfyUI y en la extensión RT Minimax H3 VDN Pro, y se distribuye como un archivo `model_int8.safetensors` junto con su `config.json`. No se especifican los parámetros totales, la longitud de contexto ni los idiomas soportados, ya que se trata de un componente cuantizado de un modelo multimodal de video y audio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: MiniMax H3, multimodal de video y audio) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 con ConvRot (Hadamard Convolutive Rotation, grupo 256) |
| Idiomas soportados | No disponible (modelo de video) |
| Licencia | minimax-h3-community-license |
| Formato de pesos | safetensors (`model_int8.safetensors`) y `config.json` |

## Arquitectura y entrenamiento

El modelo no es un modelo completo, sino una versión cuantizada de la rama lineal del modelo `OpenVDN/vdn-minimax-h3`. El modelo base se apoya en MiniMax H3, un modelo multimodal de generación de video y audio lanzado por MiniMax en julio de 2026. La técnica de cuantización empleada es INT8 con Hadamard Convolutive Rotation (ConvRot) en grupos de 256, que reduce el ruido de cuantización y preserva la precisión visual original en BF16. No se han proporcionado detalles sobre el proceso de entrenamiento, los datos utilizados ni la aplicación de RLHF o DPO, ya que se trata de una conversión de pesos y no de un entrenamiento nuevo.

## Capacidades

- Generación de video a partir de texto (pipeline `text-to-video`) mediante el modelo base VDN MiniMax H3.
- Compatibilidad nativa con ComfyUI y con la extensión RT Minimax H3 VDN Pro.
- Cuantización INT8 con calidad casi sin pérdidas gracias a ConvRot, según la documentación del autor.
- Reducción del tamaño del archivo en aproximadamente un 46 % (de 4.3 GB a 2.15 GB).
- Reducción del pico de VRAM en aproximadamente 4.7 GB durante la carga del modelo.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso ni soporte de audio en esta versión cuantizada.

## Casos de uso

- Generación de video local en ComfyUI: el modelo puede utilizarse en flujos de trabajo de ComfyUI para crear clips de video a partir de prompts de texto, beneficiándose de la menor VRAM requerida para cargar el modelo.
- Prototipado rápido de videos en entornos de desarrollo: la reducción del tamaño del archivo permite iterar más rápido en experimentos de generación de video sin necesidad de infraestructura de gama alta.
- Despliegue de inferencia de video en GPUs con VRAM limitada: al ahorrar unos 4.7 GB de VRAM pico, el modelo puede ejecutarse en tarjetas gráficas de gama media que no podrían cargar la versión BF16 completa.
- Investigación en compresión de modelos de video: el uso de ConvRot ofrece un caso de estudio práctico sobre cómo cuantizar ramas lineales de modelos multimodales grandes sin perder calidad visual.
- Integración en pipelines de ComfyUI para artistas y creadores: los usuarios de ComfyUI pueden sustituir la rama lineal original por esta versión cuantizada y mantener la compatibilidad con los nodos existentes.
- Evaluación de técnicas de cuantización en modelos de video: el modelo sirve como referencia para comparar el rendimiento y la fidelidad de diferentes métodos de cuantización (INT8, ConvRot, etc.) en el contexto de VDN MiniMax H3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor afirma que la calidad es "casi sin pérdidas" en comparación con la versión BF16, pero no se proporcionan métricas numéricas ni evaluaciones comparativas. No se deben asumir valores de MMLU, HumanEval, GSM8K u otros benchmarks, ya que este modelo es un componente de generación de video y no se han facilitado datos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Solo se indica que la carga del modelo ahorra aproximadamente 4.7 GB de VRAM pico frente a la versión BF16.
- GPU recomendadas: no disponible. El modelo es compatible con ComfyUI, por lo que se requiere una GPU con suficiente VRAM para el modelo base VDN MiniMax H3, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada. Dado el ahorro de VRAM, es plausible que pueda ejecutarse en tarjetas de gama media, pero no hay datos que lo confirmen.
- Opciones de despliegue: ComfyUI (colocando los archivos en el directorio `ComfyUI/models/VDN_Minimax_H3/stage-dmd-step-250/linear_branch/`) y RT Minimax H3 VDN Pro.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos para comparar con alternativas de la misma categoría. La única comparación posible es con el modelo base sin cuantizar, que se presenta a continuación:

| Modelo | Tamaño del archivo | VRAM pico | Calidad |
|---|---|---|---|
| OpenVDN/vdn-minimax-h3 (BF16) | ~4.3 GB | Mayor | BF16 original |
| Raretutor/vdn-minimax-h3-comfyui-int8-convrot | ~2.15 GB | ~4.7 GB menos | Casi sin pérdidas (ConvRot) |

No se conocen otras cuantizaciones o versiones comparables del mismo modelo en la información disponible.

## Limitaciones y advertencias

- Es un componente cuantizado, no un modelo completo: requiere el modelo base OpenVDN/vdn-minimax-h3 y la estructura de directorios de ComfyUI para funcionar.
- La afirmación de "casi sin pérdidas" proviene del autor y no está respaldada por benchmarks públicos.
- La licencia es `minimax-h3-community-license`; se deben revisar las condiciones de la licencia antes de usar el modelo en proyectos comerciales.
- No se han documentado sesgos específicos, pero los modelos de generación de video pueden reflejar sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinación visual: el modelo puede generar contenido no deseado o inconsistente, especialmente en escenas complejas.
- No se han proporcionado datos sobre latencia, throughput ni requisitos mínimos de hardware, por lo que el rendimiento real en producción no está validado.
- La fecha de creación del repositorio es 2026-09-05, pero no se dispone de información adicional sobre la versión o el estado del proyecto.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Raretutor/vdn-minimax-h3-comfyui-int8-convrot
- Modelo base: https://huggingface.co/OpenVDN/vdn-minimax-h3
- Blog del proyecto Video DeltaNet: https://openvdn.github.io/
- Licencia MiniMax H3 Community License: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Recursos curados sobre MiniMax H3: https://github.com/iSk2y/awesome-minimax-h3
