# aplominski/TinyTransformer-Post-LayerNorm-10M-TinyStories

## Resumen

El modelo TinyTransformer-Post-LayerNorm-10M-TinyStories es un transformer de aproximadamente 10 millones de parámetros (9.627.648 exactos) desarrollado por aplominski como parte de una serie de investigación sobre estrategias de normalización en arquitecturas transformer de pequeña escala. Este modelo concreto aplica Layer Normalization después de las subcapas del transformer (configuración post-normalización), en contraste con la variante pre-normalización que coloca la normalización antes. Se entrenó exclusivamente sobre el dataset TinyStories, compuesto por historias cortas en inglés para niños, con el objetivo de estudiar cómo afecta la posición de la normalización al entrenamiento y al rendimiento en modelos pequeños.

La relevancia de este modelo reside en su carácter experimental: permite aislar el efecto de la normalización post-capa en un entorno controlado, con el mismo dataset y configuración de entrenamiento que el resto de la serie (baseline, pre-LayerNorm, pre-RMSNorm y post-RMSNorm). No está pensado para uso productivo, sino como herramienta de análisis para investigadores interesados en arquitecturas transformer compactas. El modelo se distribuye bajo licencia OpenMDW-1.1 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (TinyTransformer, detalles de capas y heads no disponibles) |
| Parametros totales | 9.627.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32/fp16, sin GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer estándar, aunque no se especifican el número de capas, cabezas de atención ni dimensiones ocultas. La característica distintiva es la aplicación de Layer Normalization después de cada subcapa (atención y feed-forward), en lugar de antes como es habitual en modelos modernos. Esta configuración post-normalización fue la utilizada en el transformer original de Vaswani et al. (2017), pero ha caído en desuso por su menor estabilidad en modelos grandes. El experimento busca cuantificar su impacto en un régimen de 10 millones de parámetros.

El entrenamiento se realizó sobre el dataset TinyStories (roneneldan/TinyStories), que contiene historias cortas en inglés generadas sintéticamente para niños. La tarea declarada es masked language modeling, aunque el modelo es autoregresivo en la práctica. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El autor cita los trabajos de Vaswani et al. (2017), Ba et al. (2016) y Zhang & Sennrich (2019) como fundamentos teóricos.

## Capacidades

- Generacion de texto en ingles: capaz de producir historias cortas coherentes dentro del dominio de TinyStories (lenguaje infantil, vocabulario limitado).
- Modelado de lenguaje enmascarado: segun la model card, la tarea de entrenamiento es masked language modeling, aunque el checkpoint permite generacion autoregresiva.
- Investigacion sobre normalizacion: su principal capacidad es servir como sujeto de experimentos comparativos entre estrategias de normalizacion.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- No es multilingue: solo ingles.

## Casos de uso

- Estudio academico de normalizacion en transformers: el modelo permite reproducir y analizar el efecto de la normalizacion post-capa en un entorno de pequena escala, comparando metricas de perplejidad y accuracy con sus homologos pre-normalizacion y RMSNorm.
- Validacion de hipotesis sobre estabilidad de entrenamiento: investigadores pueden entrenar variantes con diferentes semillas o hiperparametros y observar si la post-normalizacion introduce inestabilidad en la convergencia.
- Ensenanza de arquitecturas transformer: al ser un modelo minimo, sirve como ejemplo didactico para explicar el papel de la normalizacion en el flujo de gradientes y la representacion interna.
- Generacion de texto de demostracion: puede usarse para generar historias cortas en ingles en entornos sin requisitos de calidad, como prototipos o demos tecnicas.
- Benchmark de eficiencia en hardware modesto: con menos de 10 millones de parametros, es util para medir latencia y consumo en CPUs o microcontroladores, aunque no se han publicado mediciones oficiales.
- Comparacion de frameworks de inferencia: al ser un checkpoint safetensors, puede cargarse en transformers, llama.cpp u otros motores para evaluar diferencias de rendimiento entre implementaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona la metrica "accuracy" como referencia, pero no proporciona valores numericos. No se dispone de comparaciones con otros modelos de la serie ni con modelos externos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.627.648 parametros, en fp32 ocupa aproximadamente 38 MB; en fp16, unos 19 MB. Cabe en cualquier GPU con mas de 1 GB de VRAM, incluidas GPUs integradas.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 10xx o superior, AMD RX 5000 o superior) es suficiente. Tambien puede ejecutarse en CPU sin problemas.
- Si cabe en consumer GPU: si, en todas las GPUs consumer actuales, incluso en Raspberry Pi con suficiente RAM.
- Opciones de despliegue: puede cargarse con la libreria transformers de HuggingFace (pipeline text-generation), o exportarse a ONNX para inferencia en CPU. No hay archivos GGUF disponibles, por lo que llama.cpp u Ollama requeririan una conversion manual.
- Latencia y throughput estimados: no disponibles. Dado el tamano, la generacion de tokens deberia ser del orden de milisegundos por token en GPU y decenas de milisegundos en CPU, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. El modelo pertenece a una serie interna del autor (baseline, pre-LayerNorm, post-LayerNorm, pre-RMSNorm, post-RMSNorm), pero no se han publicado resultados comparativos. Como referencia externa, existen otros modelos entrenados en TinyStories (por ejemplo, los de 10M y 33M parametros del repositorio TinyStoriesv1), pero no se dispone de sus especificaciones ni rendimiento en esta ficha. Por tanto, la comparativa se limita a indicar que el modelo es uno de los cinco de la serie, diferenciado por su estrategia de normalizacion.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado para uso en produccion; su calidad de generacion es muy limitada y solo cubre el dominio de historias infantiles en ingles.
- Sesgos conocidos: al entrenarse exclusivamente con TinyStories, el vocabulario y los temas estan restringidos a un registro infantil, lo que puede producir textos simplistas o con patrones repetitivos.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido inventado o incoherente, especialmente fuera del dominio de entrenamiento.
- Limitaciones de contexto: no se ha especificado la longitud de contexto; se asume que es corta (tipicamente 512 o 1024 tokens en modelos de este tamano), pero no hay dato confirmado.
- Restricciones de licencia: OpenMDW-1.1 es una licencia de codigo abierto, pero se recomienda revisar su texto completo en openmdw.ai/license/1-1 para conocer las condiciones exactas de uso comercial y redistribucion.
- Sin soporte multilingue: solo ingles, lo que limita su aplicacion a entornos angloparlantes.
- Sin cuantizaciones oficiales: no se proporcionan archivos GGUF ni AWQ, por lo que su despliegue en motores como llama.cpp requiere conversion manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aplominski/TinyTransformer-Post-LayerNorm-10M-TinyStories
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper "Attention Is All You Need": https://arxiv.org/abs/1706.03762
- Paper "Layer Normalization": https://arxiv.org/abs/1607.06450
- Paper "Root Mean Square Layer Normalization": https://arxiv.org/abs/1910.07467
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
