# Efficient-Large-Model/SANA-Robot-AR-Pretrain-LeRobot

## Resumen

SANA-Robot-AR-Pretrain-LeRobot es la conversión al formato LeRobot del modelo SANA-Robot-AR-Pretrain, un world-action model orientado a robótica desarrollado por el grupo Efficient-Large-Model (vinculado a NVIDIA Labs, según el repositorio NVlabs/Sana). El modelo original se presenta en el artículo "SANA-Robot: Efficient World Action Model with Hybrid Memory" (Zhao et al., 2026) y esta variante empaqueta los mismos pesos sin modificar para que puedan usarse con la política `sana_robot` de la librería LeRobot de Hugging Face.

Se trata de un checkpoint de preentrenamiento, no de un modelo listo para inferencia directa: contiene únicamente los pesos (4.469.245.520 parámetros en FP32, unos 17,9 GB en el repositorio) y un `config.json` con los valores por defecto de la política para cámaras y slots de robot. Los procesadores incluidos no llevan estadísticas de normalización, de modo que `lerobot-train` debe calcularlas a partir del conjunto de datos de ajuste fino que use el desarrollador.

Su relevancia es doble: por un lado expone públicamente un modelo de acción mundial (world-action model) de gran tamaño para robótica con licencia Apache 2.0; por otro, lo integra en el ecosistema LeRobot, lo que facilita el ajuste fino con `lerobot-train` y el entrenamiento distribuido con sharding de pesos sobre nodos multi-GPU. No es un modelo de lenguaje conversacional ni un generador de texto: su pipeline declarado es `robotics`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model SANA-Robot (política `sana_robot`); arquitectura interna no detallada en la información disponible |
| Parametros totales | 4.469.245.520 (FP32) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; el entrenamiento usa precisión mixta bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, FP32) + `config.json` + procesadores LeRobot |
| Modelo base | Efficient-Large-Model/SANA-Robot-AR-Pretrain |
| Libreria | lerobot |
| Pipeline | robotics |
| Tamano del repositorio | 17,9 GB |
| Componentes externos | Codificador de texto Gemma 2 2B IT (con gating) y VAE de vídeo LTX-2.3, descargados por LeRobot según las revisiones del config |

## Arquitectura y entrenamiento

La información disponible describe el modelo como un "world action model" con "hybrid memory" (memoria híbrida), según el título del artículo asociado, pero no detalla la arquitectura interna (tipo de transformer, mecanismo de atención, diseño del módulo de memoria o del decodificador de acciones). Lo que sí se explicita es la composición del sistema: un codificador de texto Gemma 2 2B IT para las instrucciones lingüísticas y un VAE de vídeo LTX-2.3 para la representación visual, ambos externos al repositorio y descargados automáticamente por LeRobot en las revisiones que indica el `config.json`. Los pesos de la política se publican en FP32.

Este checkpoint es el resultado de un preentrenamiento (no se especifican el número de tokens, la composición del dataset ni si hubo etapas de RLHF o preferencias, algo poco habitual en robótica). El autor remite a la model card del repositorio original para los detalles del modelo y de los datos de preentrenamiento. El entrenador original, con kernels fusionados y empaquetado de episodios, está en el código de SANA-Robot; la variante LeRobot se entrena con `lerobot-train`, que admite sharding de datos (`--parallelism.dp_shard=8`), precisión mixta bf16 y EMA de tipo constante. La innovación destacable, por lo que refleja la documentación, es la integración de un modelo de acción de 4,5B parámetros en un pipeline estándar de LeRobot, con separación entre pesos y estadísticas de normalización para permitir ajustes finos reproducibles.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales e instrucciones de texto, en el marco de la política `sana_robot` de LeRobot.
- Modelado de mundo y acción ("world-action model") con memoria híbrida, según la denominación del artículo.
- Procesamiento de instrucciones en lenguaje natural mediante el codificador Gemma 2 2B IT.
- Procesamiento de vídeo/imagen mediante el VAE LTX-2.3.
- Configuración de cámaras y slots de robot mediante `config.json`, con valores por defecto de la política.
- Ajuste fino sobre datasets propios en formato LeRobot, con cálculo automático de estadísticas de normalización.
- Entrenamiento distribuido con sharding de pesos sobre 8 GPUs por nodo (ejemplo oficial).
- Soporte de tool calling, agentes, razonamiento multi-paso, visión conversacional, audio o modo "thinking": no disponible / no aplicable según la información proporcionada.

## Casos de uso

- Ajuste fino para manipulación robótica en un laboratorio: se parte de este checkpoint con `lerobot-train`, se aporta un dataset propio en formato LeRobot y se obtiene una política especializada; el modelo es adecuado porque ya incorpora un preentrenamiento de acciones y visión a gran escala.
- Reproducción de checkpoints publicados: el autor indica que, para reproducir un checkpoint liberado (por ejemplo, SANA-Robot-AR-LIBERO-LeRobot), debe entrenarse con la normalización con la que se publicó ese checkpoint, lo que convierte a este modelo en la base de referencia para replicar resultados.
- Investigación en world-action models: el modelo permite estudiar el comportamiento de un sistema de 4,5B parámetros con memoria híbrida en tareas de control, comparándolo con políticas más pequeñas.
- Desarrollo de políticas para brazos robóticos tipo LIBERO: la existencia de un checkpoint derivado entrenado con LIBERO sugiere que este preentrenamiento es la base para entornos de manipulación de escritorio.
- Evaluación de infraestructura de entrenamiento distribuido: el ejemplo oficial con `torchrun --nproc-per-node=8` y `dp_shard=8` sirve para validar nodos multi-GPU con sharding de un modelo de 4,5B en FP32.
- Integración en pipelines de LeRobot: al seguir el formato estándar de la librería (config, safetensors, preprocesador y postprocesador), el modelo puede incorporarse a flujos existentes de entrenamiento y evaluación sin conversión adicional.
- Base para experimentos de normalización y preprocesado: al no incluir estadísticas, permite probar distintas estrategias de normalización por dataset y medir su impacto en el ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los pesos en FP32 ocupan aproximadamente 17,9 GB, a lo que hay que sumar el codificador Gemma 2 2B y el VAE LTX-2.3, cuyos requisitos no se detallan.
- Entrenamiento: el ejemplo oficial usa 8 GPUs por nodo con sharding de datos (`dp_shard=8`), `batch_size=2`, 20.000 pasos y precisión mixta bf16 sobre pesos FP32.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño en FP32 y la necesidad de sharding en el ejemplo oficial apuntan a que un ajuste fino completo no cabe en una sola GPU de consumo, pero no hay datos que lo confirmen.
- Opciones de despliegue: LeRobot (`lerobot-train`) para entrenamiento y ajuste fino; el entrenador original de SANA-Robot con kernels fusionados y empaquetado de episodios. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a un modelo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / ecosistema | Notas |
|---|---|---|---|---|---|
| SANA-Robot-AR-Pretrain-LeRobot (este) | 4,469B | no disponible | Apache 2.0 | LeRobot, safetensors FP32 | Preentrenamiento para ajuste fino; sin estadísticas de normalización |
| SANA-Robot-AR-Pretrain | no disponible | no disponible | Apache 2.0 (según el modelo base) | Repositorio original NVlabs/Sana | Pesos originales; entrenador propio con kernels fusionados |
| SANA-Robot-AR-LIBERO-LeRobot | no disponible | no disponible | no disponible | LeRobot | Checkpoint ajustado para LIBERO, con su propia normalización |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- No es un modelo listo para inferencia: es un checkpoint de preentrenamiento que requiere ajuste fino con `lerobot-train` y un dataset propio.
- Los procesadores no incluyen estadísticas de normalización; usarlos sin calcularlas sobre el dataset produciría resultados incorrectos. Para reproducir un checkpoint publicado hay que usar la normalización con la que se liberó.
- Depende de componentes externos con condiciones propias: Gemma 2 2B IT está sujeto a gating y a su licencia de Google, y el VAE LTX-2.3 se descarga desde otro repositorio; la licencia Apache 2.0 del checkpoint no cubre automáticamente esos componentes.
- La política `sana_robot` se propone en un pull request de LeRobot (huggingface/lerobot#5488), por lo que la API puede cambiar y no está garantizada su estabilidad en versiones publicadas.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas; al tratarse de un modelo de acción robótica, los riesgos relevantes son de seguridad física en el robot, no de generación de texto.
- Arquitectura interna, datos de entrenamiento, número de tokens y proceso de alineación no están detallados en esta model card; deben consultarse en el repositorio original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.
- El uso comercial está permitido por la licencia Apache 2.0 del checkpoint, pero conviene verificar las licencias de Gemma 2 y del VAE antes de desplegar en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Efficient-Large-Model/SANA-Robot-AR-Pretrain-LeRobot
- Modelo base: https://huggingface.co/Efficient-Large-Model/SANA-Robot-AR-Pretrain
- Checkpoint LIBERO en LeRobot: https://huggingface.co/Efficient-Large-Model/SANA-Robot-AR-LIBERO-LeRobot
- Página del proyecto: https://nvlabs.github.io/Sana/Robot/
- Artículo (PDF): https://github.com/NVlabs/Sana/blob/robot/asset/SANA-Robot.pdf
- Código: https://github.com/NVlabs/Sana/tree/robot
- Pull request de la política en LeRobot: https://github.com/huggingface/lerobot/pull/5488
- LeRobot: https://github.com/huggingface/lerobot
- Codificador de texto Gemma 2 2B IT: https://huggingface.co/google/gemma-2-2b-it
- VAE LTX-2.3: https://huggingface.co/Efficient-Large-Model/LTX-2.3-Diffusers
