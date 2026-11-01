# lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr5e-5

## Resumen

LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr5e-5 es un ajuste fino (fine-tuning) supervisado del modelo base LiquidAI/LFM2.5-350M, publicado por el usuario lugman-madhiai en Hugging Face. El nombre del repositorio sugiere que el entrenamiento se realizó sobre un dataset denominado "SmolDataEnvs" en una configuración "Easy", empleando LoRA con rango 16 y alfa 32, y una tasa de aprendizaje de 5e-5. El modelo pertenece a la familia LFM (Liquid Foundation Models) de Liquid AI, una arquitectura híbrida diseñada para ofrecer buen rendimiento con recursos reducidos.

Con 354,5 millones de parámetros y licencia Apache 2.0, este modelo es relevante como ejemplo de fine-tuning ligero y reproducible sobre modelos pequeños de la familia LFM2.5, orientado a tareas de generación de texto conversacional. Según la model card, el entrenamiento se realizó con la librería Unsloth junto con TRL de Hugging Face, lo que permitió acelerar el proceso (según el autor, 2 veces más rápido que con métodos convencionales). Al tratarse de un fine-tuning comunitario sin documentación detallada, la información disponible sobre sus capacidades específicas es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (híbrida, familia Liquid Foundation Models) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-350M, un modelo de la familia LFM de Liquid AI. La familia LFM2 se caracteriza por combinar bloques convolucionales gated (gated linear convolutions) con bloques de atención estándar en una arquitectura híbrida, lo que reduce el coste computacional en inferencia frente a un transformer puro, especialmente en secuencias largas y en dispositivos con recursos limitados. La model card del fine-tuning no detalla la composición exacta de la arquitectura, por lo que deben consultarse los recursos del modelo base para más información.

El entrenamiento se realizó mediante ajuste fino supervisado (SFT) con la librería Unsloth en combinación con TRL de Hugging Face. Según el nombre del repositorio, se empleó LoRA con rango (r) 16 y alfa (a) 32, con una tasa de aprendizaje de 5e-5. El dataset empleado parece ser "SmolDataEnvs" en una variante "Easy", aunque no se publica información sobre su tamaño, composición ni número de tokens de entrenamiento. No hay indicios de que se hayan aplicado técnicas de RLHF o DPO.

## Capacidades

- Generación de texto en inglés, con pipeline de text-generation y formato conversacional.
- Capacidades heredadas del modelo base LiquidAI/LFM2.5-350M para tareas de lenguaje general.
- Especialización (presunta, según el nombre del dataset) en entornos o tareas de datos ("DataEnvs"), aunque la model card no lo documenta.
- No hay evidencia de soporte para tool calling, agentes, visión, audio ni modo de razonamiento extendido.
- Compatible con la librería transformers de Hugging Face y con endpoints de inferencia (endpoints_compatible).

## Casos de uso

- Experimentación con fine-tunings ligeros: al pesar unos 2,1 GB el repositorio, es ideal para probar pipelines de SFT con LoRA en hardware de consumo y aprender del flujo Unsloth + TRL.
- Prototipado de asistentes conversacionales en inglés: el formato conversacional permite integrarlo en chatbots simples de baja latencia donde no se requiere un modelo grande.
- Investigación sobre arquitecturas híbridas: útil como punto de partida para estudiar el comportamiento de los modelos LFM2 frente a transformers convencionales en tareas ajustadas.
- Despliegue en dispositivos con recursos limitados: su tamaño de 350M de parámetros lo hace candidato para ejecución local en portátiles o SBC (single-board computers).
- Integración en endpoints gestionados de Hugging Face: al estar marcado como endpoints_compatible, puede desplegarse directamente en la infraestructura de inferencia de Hugging Face.
- Base para ajustes adicionales: puede servir como checkpoint intermedio para nuevos fine-tunings sobre datos más específicos, aprovechando el trabajo ya realizado con LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 354,5 millones de parámetros en fp16, el modelo ocupa aproximadamente 0,7 GB; en fp32, alrededor de 1,4 GB. Con el repositorio pesando 2,1 GB, cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no requiere GPU dedicada para inferencia; cualquier GPU moderna con 4 GB de VRAM o más es suficiente. Para entrenamiento con LoRA, una GPU de 8-12 GB (por ejemplo, RTX 3060 o RTX 4070) debería bastar.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna, e incluso puede ejecutarse solo en CPU dada la eficiencia de la arquitectura LFM2 en inferencia.
- Opciones de despliegue: transformers de Hugging Face (librería nativa), Hugging Face Inference Endpoints, y presumiblemente llama.cpp u Ollama si se convierte a GGUF (no hay conversiones publicadas en el repositorio). No se mencionan vLLM ni TGI explícitamente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Arquitectura | Notas |
|---|---|---|---|---|
| LFM2.5-350M-SmolDataEnvs-Easy-SFT (este) | 354,5M | Apache 2.0 | LFM2 híbrida | Fine-tuning comunitario con LoRA (r16, a32, lr 5e-5) sobre dataset SmolDataEnvs |
| LiquidAI/LFM2.5-350M (base) | 354,5M | Apache 2.0 (según tags del derivado) | LFM2 híbrida | Modelo base de Liquid AI, sin ajuste fino específico |
| Qwen2.5-0.5B-Instruct | 494M | Qwen Research (restricciones comerciales condicionales) | Transformer decoder | Alternativa de tamaño similar, con soporte multilingüe amplio |

## Limitaciones y advertencias

- Documentación muy escasa: la model card no describe el dataset, el proceso de entrenamiento ni las capacidades del modelo, lo que dificulta evaluar su idoneidad para producción.
- Riesgo de alucinación elevado: al tratarse de un modelo pequeño (350M) con un fine-tuning sin evaluaciones publicadas, la fiabilidad factual es limitada.
- Sesgos: hereda los sesgos del modelo base y del dataset de entrenamiento, ninguno de los cuales está documentado en este repositorio.
- Soporte de idiomas restringido al inglés; no está indicado soporte para castellano ni otras lenguas.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base LiquidAI/LFM2.5-350M para usos en producción.
- No hay benchmarks publicados que permitan comparar el fine-tuning con el modelo base, por lo que se desconoce si el ajuste mejora o degrada el rendimiento general.
- El nombre del dataset ("SmolDataEnvs-Easy") sugiere una tarea acotada; el modelo puede haber perdido generalidad respecto al modelo base (olvido catastrófico), algo no verificado por el autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr5e-5
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth (librería de entrenamiento empleada): https://github.com/unslothai/unsloth
