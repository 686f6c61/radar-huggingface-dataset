# nikitastheo/v5-babylm-25k-lower-ukr-ell-sequential_interleaved

## Resumen

El modelo `nikitastheo/v5-babylm-25k-lower-ukr-ell-sequential_interleaved` es un modelo de lenguaje causal de tipo transformer decoder-only, publicado en HuggingFace por el usuario `nikitastheo`. Con 123.886.080 parámetros (aproximadamente 124 millones), se sitúa en la misma escala que GPT-2 small y está diseñado como artefacto de investigación dentro del marco del reto BabyLM, orientado al estudio de la adquisición del lenguaje con presupuestos de entrenamiento reducidos y datos de corte "desarrollista". El identificador del modelo indica tres decisiones de diseño concretas: un tokenizador de 25.000 entradas, texto en minúsculas y una combinación de ucraniano y griego con una estrategia de currículo lingüístico secuencial e intercalado.

El problema que aborda es el de cómo un modelo pequeño aprende dos idiomas morfológicamente ricos y de recursos medios cuando el presupuesto de datos está acotado artificialmente. La model card es deliberadamente escueta: no incluye licencia, ni idiomas declarados, ni resultados de evaluación, y se limita a documentar los hiperparámetros del script de entrenamiento. Esto convierte al modelo en un objeto de estudio reproducible más que en un componente listo para producción.

Su relevancia actual es doble. Por un lado, sirve como punto de comparación para experimentos de currículo bilingüe (secuencial frente a intercalado) en ucraniano y griego. Por otro, su tamaño permite entrenamiento y evaluación en hardware de consumo, lo que facilita réplicas y auditorías por parte de grupos con recursos limitados. No obstante, al carecer de licencia explícita y de cualquier validación publicada, debe tratarse como material de investigación sin garantías.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (familia GPT-2, configuracion `gpt_base_config.json`) |
| Parametros totales | 123.886.080 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card referencia `model_configs/gpt_base_config.json` sin indicar el valor) |
| Tipos de cuantizacion | no disponible en el repositorio; al ser un transformer estandar es convertible a fp16, int8 y GGUF con herramientas genericas |
| Idiomas soportados | Ucraniano y griego (texto en minusculas), segun el identificador del modelo; no declarados en la model card |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only causal de 123,9 millones de parametros, sin componentes MoE, SSM ni mecanismos de atencion lineal documentados. La model card indica que se entreno con `train_clm.py`, un script de entrenamiento causal-LM basado en Hugging Face Accelerate que evita deliberadamente la clase `Trainer`. La configuracion de partida es `model_configs/gpt_base_config.json`, y el tokenizador empleado es `nikitastheo/babylm-25k-ukr-lower-tokenizer`, un vocabulario de 25.000 entradas ajustado a texto en minusculas de ucraniano y griego.

Los hiperparametros documentados son: 25.840 pasos maximos, tasa de aprendizaje 1e-4, planificador lineal con 2.584 pasos de calentamiento (el 10 % del total), tamano de lote 32 por dispositivo, sin acumulacion de gradientes (lote efectivo de 32) y un "language switch epoch" fijado en 10. Este ultimo parametro sugiere una estrategia de curriculo en la que el idioma de entrenamiento cambia tras la decima epoca, lo que se corresponde con la etiqueta `sequential_interleaved` del nombre: fases de un idioma seguidas de fases intercaladas. No se especifica el numero total de epocas, la composicion exacta del corpus, el numero de tokens procesados ni si hubo fases de RLHF, DPO o ajuste por instrucciones; la ausencia de estas ultimas es coherente con un modelo base sin alineacion. A modo de referencia aritmetica, 25.840 pasos con lote de 32 equivalen a 826.880 secuencias, pero el volumen total de tokens depende de la longitud de contexto, que no se ha publicado.

## Capacidades

- Generacion de texto causal en ucraniano y griego, restringida a texto en minusculas por el preprocesado del tokenizador.
- Modelado de lenguaje puro: continuacion de texto, calculo de perplejidad y puntuacion de secuencias.
- Capacidad multilingue limitada a los dos idiomas del identificador (ucraniano y griego); no hay evidencia de transferencia a otras lenguas.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking mode), vision, audio ni ninguna modalidad adicional.
- No es un modelo ajustado por instrucciones: no cabe esperar seguimiento fiable de ordenes directas.

## Casos de uso

- Investigacion en el reto BabyLM: reproduccion de experimentos sobre presupuestos de datos reducidos, comparando esta variante secuencial-intercalada con otras variantes del mismo autor para aislar el efecto del curriculo bilingue.
- Estudios de curriculo linguistico: analisis de como la conmutacion de idioma en la epoca 10 afecta a la perplejidad en ucraniano y griego, midiendo retencion y olvido catastrofico por idioma.
- Evaluacion de tokenizadores de 25.000 entradas: comparacion con tokenizadores mayores o especificos de cada lengua en tareas de segmentacion y en la perplejidad resultante.
- Linea base para ajuste fino supervisado: al ser un modelo base de 124 millones de parametros, puede afinarse para clasificacion de texto, analisis de sentimiento o etiquetado de secuencias en ucraniano y griego con un solo GPU de gama media.
- Experimentos de destilacion y poda: su tamano manejable lo hace adecuado como alumno en rutinas de destilacion desde modelos multilingues mayores, o como sujeto de pruebas de cuantizacion agresiva.
- Docencia y practicas de NLP: entrenamiento completo reproducible (script Accelerate, hiperparametros publicados) en hardware de consumo para cursos de modelado del lenguaje.
- Generacion de texto de bajo coste en entornos sin GPU: inferencia en CPU para prototipos de continuacion de texto en las dos lenguas cubiertas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de perplejidad, tareas de comprension, generacion ni ninguna otra metrica, y la busqueda web realizada no devolvio ningun recurso relacionado con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): en fp32, aproximadamente 0,50 GB; en fp16 o bf16, aproximadamente 0,25 GB; en int8, aproximadamente 0,12 GB; en cuantizacion de 4 bits, aproximadamente 0,07 GB. A ello hay que sumar la memoria del cache KV, proporcional a la longitud de contexto efectiva y al numero de secuencias simultaneas.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas y en CPU. No requiere A100 ni H100 salvo que se busque un throughput muy elevado.
- Es viable la inferencia en CPU y en dispositivos de placa unica (Raspberry Pi de gama alta) en fp32 o int8.
- Opciones de despliegue: la model card incluye las etiquetas `text-generation-inference` y `endpoints_compatible`, por lo que el modelo es compatible con TGI y con los endpoints de HuggingFace Inference. Tambien puede servirse con vLLM o con llama.cpp/Ollama previa conversion a GGUF, ya que la arquitectura es un transformer causal estandar.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de velocidad ni de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nikitastheo/v5-babylm-25k-lower-ukr-ell-sequential_interleaved` | 123,9 M | no disponible | ucraniano y griego (segun identificador) | no disponible | HuggingFace, safetensors |
| GPT-2 small | 124 M | 1.024 tokens | ingles | licencia MIT modificada | ampliamente disponible |
| distilgpt2 | 82 M | 1.024 tokens | ingles | Apache 2.0 | ampliamente disponible |
| Pythia-160M | 160 M | 2.048 tokens | ingles | Apache 2.0 | HuggingFace, safetensors |
| SmolLM-135M | 135 M | 2.048 tokens | ingles (principalmente) | Apache 2.0 | HuggingFace, safetensors |

La comparacion con estos modelos es solo aproximada en cuanto a escala: todos ellos son transformers causales de tamano similar, pero ninguno esta especializado en ucraniano y griego ni sigue un curriculo bilingue, y todos cuentan con licencias explicitas y evaluaciones publicadas de las que este modelo carece.

## Limitaciones y advertencias

- Ausencia total de licencia: no se concede ningun permiso explicito de uso, lo que genera incertidumbre juridica incluso para usos academicos y desaconseja su empleo comercial.
- No hay resultados de evaluacion publicados; se desconoce su calidad real en cualquiera de los dos idiomas.
- Modelo base sin ajuste por instrucciones ni alineacion: no sigue ordenes, no rechaza peticiones problematicas y puede reproducir sesgos presentes en el corpus de entrenamiento.
- Riesgo elevado de alucinacion y de incoherencia a partir de secuencias cortas, propio de un modelo de 124 millones de parametros con un presupuesto de entrenamiento limitado.
- Cobertura idiomatica restringida a ucraniano y griego, y ademas limitada a texto en minusculas; el rendimiento con texto en mayusculas, con signos diacriticos ausentes o con alfabetos mezclados no esta caracterizado.
- La conmutacion de idioma en la epoca 10 puede provocar olvido catastrofico del primer idioma; es una hipotesis razonable dado el diseno, pero no esta verificada en ninguna evaluacion publicada.
- Sin informacion sobre la composicion del corpus de entrenamiento, no es posible auditar procedencia, licencias de los datos ni presencia de contenido sensible.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones multi-turno largas ni en documentos extensos.
- Fecha de creacion y actualizacion poco habitual (2026) y ausencia total de descargas y "likes": el modelo no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nikitastheo/v5-babylm-25k-lower-ukr-ell-sequential_interleaved
- Tokenizador asociado: https://huggingface.co/nikitastheo/babylm-25k-ukr-lower-tokenizer
- Reto BabyLM (referencia general del marco de trabajo): https://babylm.github.io/
- No se encontraron papers, blogs, repositorios ni demos adicionales en la busqueda web realizada; los resultados devueltos no guardaban relacion con el modelo.
