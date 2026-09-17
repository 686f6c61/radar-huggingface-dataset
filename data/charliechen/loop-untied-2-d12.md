# CharlieChen/loop-untied-2-d12

## Resumen

loop-untied-2-d12 es un checkpoint de modelo de lenguaje base de tipo *looped transformer* (transformer con recursión de bloques), publicado por el usuario CharlieChen en HuggingFace. Corresponde a la coordenada de profundidad **d12** (variante «untied 2») de la escalera de escalado del artículo *How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents*. No es un modelo afinado por instrucciones: es un artefacto de investigación entrenado desde cero con el objetivo de estudiar cómo crecen los exponentes de escalado al variar profundidad, recursión y operadores de frontera.

El checkpoint contiene 607.518.720 parámetros almacenados en FP32 (2,430 GB), con una anchura de 1536, 12 cabezas de atención, vocabulario GPT-2 de 50.257 tokens (ampliado a 50.304 filas en el modelo) y una longitud de contexto de 2.048 tokens. Fue entrenado sobre el corpus FineWeb y su NLL de validación en el corpus de preentrenamiento es de 2,907670 nats/token. Incluye un `result.json` con la configuración y los metadatos de entrenamiento, pero no conserva el estado del optimizador, por lo que no sirve para reanudar el entrenamiento.

Su relevancia es fundamentalmente académica: es un punto de datos reproducible dentro de un estudio sistemático de leyes de escalado en arquitecturas recursivas, y su evaluación requiere el código propio del artículo (clase `TransformerGPT`), no la interfaz estándar `AutoModel` de Transformers. No tiene descargas ni «likes» en el momento de redactar esta ficha, y la licencia no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer (recursion de bloques), variante «untied 2», modo de profundidad `dep` |
| Parametros totales | 607.518.720 (almacenados en FP32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica el checkpoint original en FP32; no se incluyen GGUF, AWQ, GPTQ ni versiones en bfloat16) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`final.pt`); no es un checkpoint `AutoModel` de Transformers ni safetensors ni GGUF |
| Anchura (hidden size) | 1.536 |
| Cabezas de atencion | 12 |
| Vocabulario | 50.257 tokens (tokenizer GPT-2 via `tiktoken`), ampliado a 50.304 filas en el modelo |
| Repeticiones del nucleo | 2 configuradas y 2 en la evaluacion final |
| Coordenada de profundidad | d12 (no tiene por que coincidir con el numero de bloques Transformer ejecutados) |
| NLL de validacion (preentrenamiento) | 2,907670 nats/token |
| Tamano del repositorio | 2,4 GB |
| Ficheros incluidos | `final.pt`, `result.json`, `SHA256SUMS` |

## Arquitectura y entrenamiento

La arquitectura es un transformer recursivo («looped»): en lugar de apilar un número fijo de bloques independientes, reutiliza un núcleo de bloques que se ejecutan varias veces, de modo que la profundidad efectiva del cálculo se controla mediante repeticiones de recursión. La variante de este checkpoint se etiqueta como «untied 2», con modo de profundidad `dep` y 2 repeticiones del núcleo configuradas; el artículo advierte explícitamente que la coordenada de profundidad es la coordenada de escalado de la escalera experimental y no equivale necesariamente al número de bloques Transformer ejecutados. La anchura es de 1536 y la atención usa 12 cabezas. El tokenizer es el de GPT-2 mediante `tiktoken.get_encoding("gpt2")`, con 50.257 tokens de vocabulario y matriz de embedding ampliada a 50.304 filas.

El entrenamiento se realizó sobre el corpus **FineWeb**, en inglés, con un contexto de 2.048 tokens. El autor indica que el artículo usa GPU H100, FlashAttention-3 y autocast en bfloat16, aunque el checkpoint publicado se almacena en FP32 (2,430 GB). No se documenta en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones: se trata de un modelo base puro, sin *instruction tuning*. Tampoco se conserva el estado del optimizador, por lo que el artefacto es de solo inferencia/evaluación o de ajuste posterior, no de reanudación del preentrenamiento. La innovación técnica que representa es precisamente su papel como punto de medida en un estudio de exponentes de escalado bajo crecimiento de modelo, recursión y operadores de frontera.

## Capacidades

- Generación de texto autoregresiva en inglés: es un modelo base, por lo que su modo natural de uso es la continuación de texto (*completion*) a partir de un prefijo.
- Modelado de lenguaje y estimación de verosimilitud: permite calcular NLL sobre texto, que es exactamente la métrica con la que se validó (2,907670 nats/token en FineWeb).
- Razonamiento y conocimiento factual: no hay evidencia publicada de puntuaciones en tareas de razonamiento; con 607 millones de parámetros y sin ajuste por instrucciones, se espera un rendimiento propio de un modelo base pequeño, pero no hay datos que lo cuantifiquen.
- Generación de código y matemáticas: no disponible (no se han publicado resultados ni se documenta entrenamiento específico en estos dominios).
- *Tool calling* / *function calling*: no soportado de forma nativa; no hay plantilla de chat ni formato de herramientas documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible; al ser un modelo base sin ajuste, no implementa bucles de agente ni modo de pensamiento.
- Capacidades multilingües: limitadas al inglés; el autor declara únicamente `en` y el corpus de entrenamiento (FineWeb) es mayoritariamente en inglés.
- Capacidad especial: la recursión de bloques con repeticiones configurables del núcleo, orientada a estudiar el efecto de la profundidad efectiva en el escalado.

## Casos de uso

- Reproducción de experimentos de leyes de escalado: cargar `final.pt` junto con `result.json` desde el repositorio `cue-engineering/loop` para verificar la NLL de validación (2,907670 nats/token) y comparar la coordenada d12 con otros puntos de la escalera.
- Estudios de ablación sobre recursión: comparar esta variante «untied 2» con variantes con pesos atados, distinto número de repeticiones del núcleo o distinta coordenada de profundidad, manteniendo constante el resto de la configuración (anchura 1536, 12 cabezas, contexto 2048).
- Evaluación con el arnés CORE del artículo: ejecutar `eval.py` con las 22 tareas y las semillas 0/1/2 para obtener puntuaciones completas, o usar `--max-per-task 10` para una comprobación de humo acotada en GPU (los resultados del modo *smoke* no equivalen a los del artículo).
- Punto de partida para *fine-tuning* en tareas downstream en inglés: al ser un modelo base de 607 millones de parámetros, se puede ajustar para clasificación de texto, resumen o generación de dominio específico sin los sesgos de un modelo instruido.
- Generación de datos sintéticos en inglés para investigación: muestrear continuaciones de texto con contexto de hasta 2.048 tokens como material de aumento de datos o para estudiar distribuciones del modelo.
- Docencia y formación en arquitecturas recursivas: el checkpoint es un ejemplo manejable (2,4 GB en FP32) para ilustrar cómo la recursión de bloques altera el coste computacional y la profundidad efectiva frente a un transformer apilado convencional.
- Investigación sobre destilación y compresión: usar el modelo como profesor o alumno en estudios que relacionen recursión, profundidad efectiva y capacidad efectiva a escala de cientos de millones de parámetros.
- Evaluación de infraestructura de inferencia: servir el modelo con código PyTorch propio para medir latencia y *throughput* en distintas precisiones, ya que no existe una ruta estándar de Transformers y hay que construir el grafo explícitamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato numérico de evaluación presente es la NLL de validación sobre el corpus de preentrenamiento:

| Metrica | Valor | Notas |
|---|---|---|
| Pretraining validation NLL | 2,907670 nats/token | Medida sobre el corpus de preentrenamiento (FineWeb); el autor indica que es distinta de la NLL de respuestas de CORE |
| CORE (22 tareas, semillas 0/1/2) | no disponible | El autor documenta como ejecutar la evaluacion, pero no publica puntuaciones completas |
| MMLU, HumanEval, GSM8K u otros | no disponible | No figuran en la informacion proporcionada |

## Requisitos de hardware

- Pesos en FP32 (formato publicado): 2,430 GB solo para el checkpoint; la inferencia en FP32 requiere del orden de 2,5-3 GB de memoria, más activaciones y caché KV.
- Inferencia en bfloat16 o float16 (precisión usada en el artículo con autocast): aproximadamente 1,2 GB para los pesos, más el resto de sobrecarga.
- Caché KV: no se especifica el número de bloques ejecutados (la coordenada d12 no equivale necesariamente al número de bloques), por lo que no puede calcularse con exactitud. Como referencia aproximada, suponiendo 12 bloques y anchura 1536, serían del orden de decenas de KB por token, es decir, unos cientos de MB para la ventana completa de 2.048 tokens.
- GPU recomendadas: el artículo usa H100 con FlashAttention-3. Para este tamaño concreto, cualquier GPU con al menos 8 GB de VRAM es suficiente en bfloat16; tarjetas como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090 pueden ejecutarlo sobradamente. En FP32 basta con 6-8 GB de VRAM.
- Cabe en GPU de consumo: sí, con holgura, en cualquier GPU moderna con 8 GB o más de VRAM, e incluso en iGPU con memoria unificada si se genera una versión cuantizada.
- Opciones de despliegue: no está soportado por vLLM, TGI, llama.cpp u Ollama de forma directa, porque el checkpoint no es un `AutoModel` de Transformers (`final.pt` contiene una clase `TransformerGPT` personalizada). La ruta documentada es descargar el repositorio con `snapshot_download` y ejecutar el código del repositorio `cue-engineering/loop`. Para otros motores habría que exportar los pesos a safetensors/GGUF y reconstruir la arquitectura.
- Latencia y throughput: no disponible. No se publican medidas de velocidad; solo se documenta que la evaluación oficial se hizo con H100 y bfloat16.

## Comparativa con modelos similares

La informacion proporcionada no incluye resultados comparativos con otros modelos, y los resultados de la busqueda web no aportan datos tecnicos sobre alternativas. Por tanto, no se dispone de una comparativa cuantitativa fiable:

| Modelo | Parametros | Contexto | Licencia | Datos comparativos |
|---|---|---|---|---|
| loop-untied-2-d12 | 607.518.720 | 2.048 | no disponible | NLL de validacion 2,907670 nats/token |
| Alternativas de tamano similar (modelos base pequenos en ingles) | no disponible | no disponible | no disponible | no disponible |

Cualitativamente, la categoría natural de comparación son los modelos base pequeños preentrenados en inglés con contexto de 2.048 tokens, pero cualquier cifra de rendimiento que se aportara aquí no estaría respaldada por la información disponible.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones, no mantiene formato de chat y no dispone de plantilla de conversación; usarlo como asistente requiere ajuste previo.
- Licencia no declarada: al no especificarse licencia, no hay autorización explícita de uso comercial. Conviene contactar con el autor antes de cualquier despliegue en producción.
- Riesgo de alucinación: como cualquier modelo de lenguaje entrenado con objetivo de modelado autoregresivo, puede generar contenido factualmente incorrecto o incoherente, especialmente con 607 millones de parámetros.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o equidad; el corpus FineWeb es texto web sin filtrar específicamente para estos fines, por lo que es esperable la presencia de sesgos propios de ese origen. No hay datos publicados al respecto.
- Limitación de idioma: solo se declara inglés. No hay evidencia de competencia en castellano ni en otros idiomas.
- Ventana de contexto corta: 2.048 tokens, muy por debajo de los estándares actuales de 32.000 a 128.000 tokens, lo que restringe tareas de contexto largo.
- Artefacto de investigación: el checkpoint no es compatible con `AutoModel` de Transformers y requiere el código del artículo para reconstruir la clase `TransformerGPT`; no conserva estado del optimizador, por lo que no permite reanudar el entrenamiento.
- Confusión potencial de métricas: la NLL de validación de preentrenamiento no es equivalente a la NLL de respuestas del arnés CORE; el propio autor lo advierte. Los resultados de una evaluación «smoke» con `--max-per-task 10` no son comparables con los resultados completos del artículo.
- Madurez y soporte: cero descargas y cero «likes» en el momento de redactar la ficha, sin issues ni comunidad asociada; no hay garantía de mantenimiento ni de compatibilidad futura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-untied-2-d12
- Repositorio de codigo del articulo (evaluacion y reconstruccion del modelo): https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Articulo: *How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents* (enlace directo no disponible en la informacion proporcionada)
- Ficheros del repositorio: `final.pt`, `result.json`, `SHA256SUMS` (accesibles desde la pagina del modelo)
