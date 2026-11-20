# Junjun2333/TwoPass

## Resumen

TwoPass es un modelo de predicción de vídeo condicionado por acciones, orientado a la manipulación robótica. Se trata de un ajuste fino (fine-tune) del modelo generativo de vídeo Wan2.2-TI2V-5B, desarrollado por el autor Junjun2333 y presentado en el artículo arXiv 2611.25553 (Liu et al., 2026). El modelo recibe un único fotograma observado junto con la secuencia de acciones futuras del robot y predice los fotogramas siguientes, actuando como un "world model" o modelo del entorno para planificación y evaluación en robótica.

La propuesta técnica central es la generación en pocos pasos: el modelo es capaz de producir la predicción con tan solo cuatro llamadas de red (NFE, number of function evaluations), lo que reduce drásticamente el coste computacional frente a los procesos de difusión iterativos habituales en modelos de vídeo. Esto lo hace atractivo para bucles de control robótico donde la latencia es crítica.

El modelo se distribuye como checkpoints de PyTorch (20,2 GB cada uno, pesos en fp32) entrenados sobre dos conjuntos de datos: Bridge y Language Table. Se publica bajo licencia Apache 2.0, heredada de Wan2.2, y está pensado para investigadores que trabajen en modelos del mundo, predicción de vídeo y manipulación robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de vídeo (fine-tune de Wan2.2-TI2V-5B), condicionado por acciones |
| Parametros totales | aproximadamente 5B (heredados del modelo base Wan2.2-TI2V-5B; no se detalla el recuento exacto tras el fine-tune) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo opera sobre un fotograma de entrada y una secuencia de acciones; no se especifica ventana de contexto en tokens) |
| Tipos de cuantizacion | no disponible (los checkpoints publicados están en fp32) |
| Idiomas soportados | no disponible (modelo de vídeo; no aplica soporte lingüístico directo) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (checkpoint con pesos `model` en fp32 y `step` de entrenamiento) |

## Arquitectura y entrenamiento

TwoPass se construye sobre Wan2.2-TI2V-5B, un modelo de difusión de texto/imagen a vídeo de aproximadamente 5.000 millones de parámetros. El fine-tune adapta este generador para que sea condicionado por acciones: la entrada combina un fotograma observado y la secuencia de acciones del robot, y la salida es la predicción de los fotogramas futuros. La innovación principal es el esquema "draft-guided" de pocos pasos, que permite generar la predicción con solo cuatro llamadas de red (NFE=4), en lugar de los procesos de muestreo de decenas de pasos típicos en difusión.

El entrenamiento se realizó sobre dos conjuntos de datos de manipulación robótica: Bridge y Language Table, además de la referencia al dataset IRASim (fangqi/IRASim) en las etiquetas del repositorio. No se especifican en la información disponible el número de tokens o fotogramas de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO (poco habituales en modelos de vídeo). Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Predicción de vídeo condicionada por acciones: dado un fotograma y una secuencia de acciones del robot, genera los fotogramas futuros.
- Modelado del entorno (world model) para manipulación robótica: simula la evolución visual de la escena ante acciones del agente.
- Generación en pocos pasos: predicción con tan solo 4 llamadas de red, adecuada para bucles de control de baja latencia.
- Pipeline de imagen a vídeo (image-to-video) heredado del modelo base Wan2.2-TI2V-5B.
- Evaluación sobre conjuntos de datos robóticos estándar (Bridge, Language Table) mediante scripts de evaluación y agregación incluidos en el repositorio de código.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad de lenguaje; su "multi-paso" se refiere al muestreo de difusión, no a razonamiento simbólico.
- Capacidades multilingües: no aplica.
- Capacidades especiales: condicionamiento por acciones, generación few-step, integración con el ecosistema Wan2.2.

## Casos de uso

- Modelado del mundo para planificación robótica: el modelo predice las consecuencias visuales de una secuencia de acciones, lo que permite a un planificador evaluar trayectorias candidatas antes de ejecutarlas en el robot real, reduciendo el riesgo de colisiones.
- Evaluación de políticas en simulación: dado que predice fotogramas futuros a partir de acciones, puede usarse como entorno aprendido para comparar políticas de manipulación sin necesidad de un simulador físico costoso.
- Aumento de datos para entrenamiento de políticas: las predicciones de vídeo pueden generar trayectorias sintéticas plausibles que amplíen los conjuntos de datos de manipulación (Bridge, Language Table).
- Control predictivo en tiempo real: gracias a las 4 NFE, el modelo puede integrarse en bucles de control donde la latencia de generación es un factor limitante, por ejemplo en robots de bajo coste con GPUs de gama media.
- Investigación en world models: sirve como base para estudiar la fidelidad de la predicción visual a largo plazo y la coherencia física en escenas de manipulación.
- Benchmarking de modelos de vídeo condicionados por acciones: los scripts de evaluación (`twopass.evaluate`, `twopass.aggregate`) permiten reproducir métricas sobre Bridge y Language Table para comparar con otros métodos.
- Prototipado de sistemas de imitación visual: el modelo puede emplearse para previsualizar el resultado de una demostración antes de ejecutarla, útil en interfaces de teleoperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los checkpoints publicados pesan 20,2 GB en fp32, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos completos; con cuantización (no disponible en el repositorio) podría reducirse, pero no se ofrecen versiones cuantizadas.
- GPU recomendadas: por el tamaño del modelo (aproximadamente 5B parámetros en fp32) y la generación de vídeo, se recomiendan GPUs con 24 GB o más de VRAM, como A100 (40/80 GB), H100 o RTX 4090 (24 GB, ajustada).
- ¿Cabe en GPU de consumo? En fp32, un modelo de 5B ocupa unos 20 GB, por lo que cabe ajustadamente en una RTX 4090 de 24 GB; en GPUs con 16 GB o menos no cabría sin cuantización, que no está disponible.
- Opciones de despliegue: el repositorio oficial proporciona scripts de evaluación en PyTorch (`twopass.evaluate`, `twopass.aggregate`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente a este modelo de vídeo).
- Latencia y throughput estimados: no disponibles; el modelo está diseñado para 4 NFE, lo que reduce el coste frente a muestreos de decenas de pasos, pero no se publican cifras concretas de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / modalidad | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TwoPass | aprox. 5B | vídeo condicionado por acciones, few-step (4 NFE) | Fine-tune de Wan2.2-TI2V-5B para manipulación robótica | Apache 2.0 | Hugging Face (checkpoints Bridge y Language Table) |
| Wan2.2-TI2V-5B | aprox. 5B | imagen/texto a vídeo | Modelo base generativo de vídeo | Apache 2.0 | Hugging Face (Wan-AI) |
| IRASim (dataset de referencia) | no disponible | predicción de vídeo para manipulación | Conjunto de datos de referencia | no disponible | Hugging Face (fangqi/IRASim) |

No se dispone de información sobre otros modelos comparables de la misma categoría (world models condicionados por acciones) en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos; al entrenarse sobre Bridge y Language Table, el modelo puede estar sesgado hacia las distribuciones visuales y de acciones de esos conjuntos, con posible degradación en entornos distintos.
- Riesgo de alucinación: como modelo generativo de vídeo, puede producir fotogramas visualmente plausibles pero físicamente incorrectos, lo que es crítico si se usa para planificación robótica sin verificación.
- Limitaciones de contexto o idioma: no se especifica ventana de contexto; el modelo opera sobre un fotograma y una secuencia de acciones, y no está diseñado para tareas lingüísticas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Wan2.2; conviene revisar la licencia de Wan2.2-TI2V-5B para confirmar compatibilidad en producción.
- Caveats para producción: los checkpoints están en fp32 (20,2 GB), sin versiones cuantizadas publicadas; el repositorio tiene 0 descargas y 1 like, lo que indica escasa validación comunitaria; la fecha de creación (2026-11-20) y el arXiv 2611.25553 deben verificarse antes de adoptarlo; no se publican cifras de latencia ni benchmarks en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Junjun2333/TwoPass
- Modelo base Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Artículo arXiv: https://arxiv.org/abs/2611.25553
- Repositorio de código: https://github.com/PlantPotatoOnMoon/TwoPass
- Dataset IRASim: https://huggingface.co/datasets/fangqi/IRASim
