# neemon/anlp-a1-c1

## Resumen

El modelo `neemon/anlp-a1-c1` es un Transformer encoder-decoder construido desde cero con operaciones básicas de PyTorch, sin usar `nn.Transformer` ni `nn.MultiheadAttention`. Forma parte de un ejercicio académico de la asignatura ANLP (Advanced Natural Language Processing), donde se entrena un modelo para descifrar texto cifrado binario y convertirlo en texto plano en inglés. Es la configuración base (C1) de un estudio de ablación controlado: las configuraciones C2 a C5 cambian exactamente un componente respecto a esta base, manteniendo idénticos todos los demás hiperparámetros.

El modelo tiene 10,5 millones de parámetros, una arquitectura con 4 capas de encoder y 4 de decoder, dimensión de modelo 256, 8 cabezas de atención y normalización pre-LayerNorm. Su propósito principal no es servir como modelo de producción, sino como herramienta de investigación para analizar el impacto de distintas decisiones de diseño (codificación posicional, tipo de atención, normalización y tokenización) en una tarea de descifrado. La licencia MIT permite su uso libre, incluso comercial, aunque su utilidad práctica fuera del ámbito académico es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (construido desde cero en PyTorch) |
| Parametros totales | 10.507.264 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (entrenado en fp32, sin AMP) |
| Idiomas soportados | Ingles (texto plano de salida; no se especifican otros) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (ficheros .pt o .bin) |

## Arquitectura y entrenamiento

La arquitectura es un Transformer encoder-decoder clasico con atencion multi-cabeza (MHA), codificacion posicional sinusoidal, normalizacion LayerNorm y tokenizacion por subword. Se construyo manualmente con operaciones de bajo nivel de PyTorch, lo que permite un control total sobre cada componente. El modelo sigue un esquema pre-norm (la normalizacion se aplica antes de cada subcapa) y utiliza dropout de 0.1.

El entrenamiento se realizo durante 15.000 pasos con batch de 64, optimizador AdamW con learning rate 0.0003 y warmup de 1000 pasos, todo en precision fp32 sin AMP. El dataset consiste en pares de texto cifrado binario y su correspondiente texto plano en ingles. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion; es un entrenamiento supervisado clasico de secuencia a secuencia. La tarea de descifrado es especifica y no se reportan datos sobre el volumen total de tokens de entrenamiento.

## Capacidades

- Descifrado de texto cifrado binario a texto plano en ingles, con una precision a nivel de bit de 0.8870 y una precision de secuencia de 0.2905.
- Generacion de texto condicionada a la entrada cifrada, con una puntuacion BLEU de 75.35 y ROUGE-L de 0.8755, lo que indica una alta similitud con las secuencias de referencia.
- Capacidad de aprendizaje de representaciones subword para la tarea especifica de descifrado.
- No soporta tool calling, ni funciones de agente, ni razonamiento multi-paso fuera de la tarea de traduccion secuencia a secuencia.
- No tiene capacidades multimodales (vision, audio, etc.).
- Multilingue: no, solo trabaja con ingles como idioma de salida.

## Casos de uso

- Investigacion academica en ablaciones de arquitectura: el modelo sirve como base para comparar el efecto de cambiar la codificacion posicional, el tipo de atencion, la normalizacion o la tokenizacion. Los investigadores pueden reproducir los experimentos y analizar como cada variante afecta a las metricas de descifrado.
- Ensenanza de transformers: al estar construido desde cero sin APIs de alto nivel, es un recurso didactico excelente para que estudiantes de NLP comprendan los mecanismos internos de atencion, normalizacion y codificacion posicional.
- Estudio de tareas de cifrado y seguridad: puede utilizarse como punto de partida para experimentar con otros esquemas de cifrado o para evaluar la vulnerabilidad de ciertos metodos de cifrado frente a modelos de aprendizaje profundo.
- Benchmark de eficiencia de entrenamiento: con un pico de memoria GPU de 1316 MB y 0.0689 segundos por paso, es util para medir el rendimiento de diferentes GPUs en tareas de secuencia a secuencia de tamano moderado.
- Desarrollo de modelos de traduccion especializados: aunque esta limitado a cifrado binario, la arquitectura puede adaptarse a otras tareas de traduccion entre dominios restringidos (por ejemplo, notacion cientifica a lenguaje natural) con cambios minimos en la capa de entrada y salida.
- Reproducibilidad de experimentos: al ser una configuracion fija con semilla 42 y todos los hiperparametros documentados, es un candidato ideal para verificar la reproducibilidad de resultados en entornos de investigacion.

## Benchmarks y rendimiento

Los resultados reportados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| Precision a nivel de bit | 0.8870 |
| Precision de secuencia | 0.2905 |
| Distancia de Levenshtein | 3.29 |
| BLEU | 75.35 |
| ROUGE-L | 0.8755 |
| Parametros | 10.507.264 |
| Pico de memoria GPU (MB) | 1316.0 |
| Segundos por paso de entrenamiento | 0.0689 |

No se han publicado comparaciones con otros modelos en la informacion disponible. Estos resultados corresponden exclusivamente a la configuracion C1 dentro del estudio de ablacion.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1.3 GB (basado en el pico de memoria de entrenamiento), por lo que cabe en cualquier GPU consumer moderna (GTX 1060 6GB o superior).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para inferencia; para entrenamiento, una GPU con 4 GB es suficiente (el pico fue 1316 MB).
- Compatible con GPUs consumer: si, incluyendo RTX 2060, RTX 3060, RTX 4060, etc.
- Opciones de despliegue: al ser un state dict de PyTorch, puede cargarse con cualquier framework que soporte PyTorch (Hugging Face Transformers, pero requiere el codigo de definicion del modelo). No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan datos de inferencia, pero dado el tamano del modelo (10.5M parametros), se espera una latencia muy baja (del orden de milisegundos por secuencia) en GPUs modernas.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de la misma categoria en la informacion proporcionada. Sin embargo, en los resultados de busqueda se menciona el modelo `yharith/anlp-a1-transformer-ablation`, que parece ser una variante sin vocabulario (vocabulary-free) con 3.47M de parametros, frente a los 10.5M de C1. La diferencia se debe a que el modelo sin vocabulario no tiene matrices grandes de embedding ni de proyeccion de salida, y su decoder es mas pequeno (d=64, 2 capas) en comparacion con el decoder de C1 (d=256, 4 capas). No se aportan mas detalles de rendimiento de ese modelo.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| neemon/anlp-a1-c1 | 10.507.264 | No disponible | MIT | Configuracion base con subword, sinusoidal, MHA, LayerNorm |
| yharith/anlp-a1-transformer-ablation | 3.470.000 (aprox.) | No disponible | No especificada | Variante sin vocabulario, decoder pequeno |

## Limitaciones y advertencias

- Es un modelo de investigacion, no un producto listo para produccion. Su unica funcion es descifrar un tipo concreto de cifrado binario; no es util para tareas generales de NLP.
- La precision de secuencia es baja (0.2905), lo que significa que la mayoria de las secuencias generadas contienen errores. No es fiable para aplicaciones donde se requiera exactitud total.
- No se han documentado sesgos especificos, pero al estar entrenado solo con datos de texto en ingles, podria tener un rendimiento deficiente con otros idiomas o estilos de escritura.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir texto plausible pero incorrecto, especialmente en secuencias largas o con ruido en la entrada.
- No se especifica la longitud de contexto, por lo que no se conocen los limites de secuencia de entrada y salida. Esto limita su uso en tareas con secuencias muy largas.
- La licencia MIT permite uso comercial, pero el modelo no incluye el codigo de definicion en el repositorio de HuggingFace; se requiere acceder al repositorio de codigo asociado (GitHub) para poder cargarlo correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neemon/anlp-a1-c1
- Repositorio de codigo (GitHub): https://github.com/FrenchKnuckles/ANLP_A1
- Modelo similar (yharith/anlp-a1-transformer-ablation): https://huggingface.co/yharith/anlp-a1-transformer-ablation
