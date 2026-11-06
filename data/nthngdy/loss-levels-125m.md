# nthngdy/loss-levels-125M

## Resumen

Loss-levels-125M es un artefacto de investigación publicado por el usuario nthngdy en Hugging Face. No se trata de un modelo conversacional ni de un asistente, sino de una colección de checkpoints de entrenamiento de un decodificador denso de 125M parámetros (122.702.592 parámetros reales según los safetensors), entrenado sobre 40B tokens del dataset FineWeb-Edu de Hugging Face. Su particularidad es que se guardó un checkpoint cada vez que la pérdida de entrenamiento (suavizada con EMA) cruzaba uno de 200 niveles predefinidos, desde 10,80 hasta niveles muy finos (0,01 nats de separación en la zona baja). Cada checkpoint se publica como una rama (revision) del repositorio.

El problema que resuelve es la falta de checkpoints densamente muestreados por nivel de pérdida en modelos abiertos pequeños. Este tipo de recurso es útil para estudiar la dinámica del entrenamiento de modelos de lenguaje: cómo emergen capacidades a medida que baja la pérdida, análisis de interpolación de pesos, evaluación de scaling laws a escala reducida, o investigación de mecanismos interpretables a lo largo del entrenamiento.

La relevancia del proyecto radica en que ofrece una curva de entrenamiento completa y reproducible con el tokenizador de SmolLM2, licencia Apache 2.0 y pesos en safetensors, lo que facilita experimentos controlados sin necesidad de reentrenar desde cero. El tamaño del repositorio (80,5 GB) refleja el volumen de checkpoints almacenados como ramas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador denso tipo transformer (basado en SmolLM3, 12 capas x 768) |
| Parametros totales | 122.702.592 (125M) |
| Parametros activos | no disponible (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos sin cuantizar) |
| Idiomas soportados | Ingles (entrenado solo con datos en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de 12 capas con dimension oculta 768 y embeddings atados (tied embeddings), usando el tokenizador de SmolLM2. La ficha no detalla el numero de cabezas de atencion, la funcion de activacion ni la longitud de contexto exacta, por lo que estos datos no estan disponibles. El entrenamiento se realizo sobre 40B tokens de FineWeb-Edu (HuggingFaceFW/fineweb-edu), un corpus de paginas web filtradas por calidad educativa, exclusivamente en ingles.

La innovacion principal del artefacto es el esquema de guardado: se definieron 200 niveles de perdida preestablecidos (separados 0,2 nats en la zona alta y 0,01 nats en la zona baja, por debajo de 4,00) y se guardo un checkpoint en cada cruce, usando la perdida de entrenamiento suavizada con EMA como disparador. Las metricas de validacion (val loss en nats/token y val bpb en bits/byte) se midieron offline sobre aproximadamente 1M tokens de FineWeb-Edu retenidos, con document masking. Segun la model card, el entrenamiento fue interrumpido tres veces al principio, reanudandose desde el paso 600; los checkpoints de los pasos 601-645 provienen de un intento posteriormente revertido (pesos validos pero con orden de datos distinto), y el primer guardado tras la reanudacion cubre los niveles 3,90-3,77 de una sola vez. No se menciona ningun ajuste posterior tipo SFT, RLHF o DPO: es un modelo base preentrenado.

## Capacidades

- Modelado de lenguaje basico en ingles: es un modelo base preentrenado, sin instrucciones ni alineacion, por lo que solo realiza continuacion de texto.
- Generacion incondicional: la model card indica que, al no preceder los documentos con token BOS, las muestras incondicionales deben iniciarse desde un `<|endoftext|>` solitario (id 0) o desde el prompt alone.
- Utilidad como sujeto de experimentos: curva de entrenamiento muestreada finamente por nivel de perdida, util para estudios de emergencia de capacidades, interpolacion lineal de pesos, memorizacion y mecanisticos interpretability.
- No dispone de tool calling, soporte de agentes, razonamiento multi-paso, vision, audio ni thinking mode.
- No esta alineado con instrucciones: no sigue prompts de chat de forma fiable.

## Casos de uso

- Investigacion de dinamicas de entrenamiento: cargar checkpoints consecutivos (por ejemplo, `loss-4.00` y `loss-3.50`) y comparar evaluaciones para estudiar como evolucionan capacidades concretas al descender la perdida.
- Analisis de interpolacion de pesos: dado que los checkpoints estan alineados por orden de datos y nivel de perdida, permiten experimentos de model souping e interpolacion lineal entre puntos de la misma trayectoria.
- Estudios de memorizacion y generalizacion: evaluar en que nivel de perdida el modelo empieza a memorizar vs. generalizar sobre los ~1M tokens de validacion de FineWeb-Edu.
- Reproduccion de scaling laws a baja escala: como modelo de 125M con 40B tokens y tokenizador conocido (SmolLM2), sirve de punto de comparacion para verificar leyes de escalado en entornos academicos con presupuesto limitado.
- Docencia y formacion: el conjunto de checkpoints permite construir visualizaciones y ejercicios practicos sobre como aprende un modelo de lenguaje, sin coste de computo adicional.
- Baseline para metodos de entrenamiento alternativos: comparar optimizadores, schedules de learning rate o mezclas de datos midiendo en que paso se alcanza un nivel de perdida dado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica publicada es la perdida de entrenamiento disparadora (trigger EMA) por checkpoint; las columnas de val loss y val bpb de la tabla de la model card aparecen vacias en los datos proporcionados. A modo de referencia no comparativa, el checkpoint mas avanzado listado alcanza un trigger EMA de 3,3796 en el paso 1335.

## Requisitos de hardware

- VRAM para inferencia: con 122,7M parametros en fp16, el modelo ocupa unos 250 MB; cualquier GPU con 2 GB de VRAM o incluso CPU es suficiente.
- GPUs recomendadas: no se requiere hardware especial; una RTX 3060, un portatil con GPU integrada o una CPU moderna ejecutan el modelo sin problema.
- Consumer GPUs: cabe con holgura en practicamente cualquier GPU de consumo actual.
- Descarga: el repositorio completo pesa 80,5 GB al contener todos los checkpoints; para inferencia conviene descargar solo la revision deseada (`revision="loss-X.XX"`), lo que reduce la descarga a cientos de MB.
- Despliegue: compatible con la libreria `transformers` de Hugging Face (el propio README muestra el uso de `AutoModelForCausalLM`); al ser un modelo base sin formato GGUF publicado, no hay binarios oficiales para llama.cpp, Ollama, vLLM o TGI, aunque su arquitectura estandar facilitaria la conversion.
- Latencia y throughput: no disponibles; por tamano (125M), se espera inferencia muy rapida incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos | Licencia | Notas |
|---|---|---|---|---|---|
| nthngdy/loss-levels-125M | 122,7M | no disponible | 40B tokens FineWeb-Edu | Apache 2.0 | Coleccion de 200 checkpoints por nivel de perdida; base sin alinear |
| HuggingFaceTB/SmolLM2-135M | 135M | 2048 | ~11B tokens (multi-corpus) | Apache 2.0 | Modelo base oficial de Hugging Face, mismo tokenizador; no publica checkpoints intermedios |
| EleutherAI/pythia-160m | 160M | 2048 | ~300B tokens The Pile | Apache 2.0 | Publica 16 checkpoints equiespaciados por paso, no por nivel de perdida |

La diferencia clave frente a Pythia (el paralelo mas directo) es el criterio de muestreo: loss-levels-125M guarda checkpoints por cruce de nivel de perdida (densidad variable, muy fina en la zona baja), mientras Pythia los guarda por paso de entrenamiento equiespaciado.

## Limitaciones y advertencias

- Es un modelo base sin alinear: no sigue instrucciones, no conversa y puede generar texto ofensivo o incorrecto sin filtros.
- Riesgo alto de alucinacion y output incoherente, especialmente en checkpoints tempranos (perdidas altas, como `loss-10.80`, corresponden a modelos practicamente sin entrenar).
- Entrenado solo en ingles: no se debe esperar capacidad multilingue.
- Sesgos: hereda los sesgos de FineWeb-Edu (contenido web filtrado por calidad educativa, predominio de textos en ingles de tematica educativa); no se ha realizado ninguna evaluacion de sesgos publicada.
- Longitud de contexto no documentada en la model card; conviene verificar `config.json` de la revision usada antes de produccion.
- Los checkpoints de los pasos 601-645 (niveles 3,99 a 3,91) provienen de un intento de entrenamiento revertido: pesos validos pero con un orden de datos distinto al resto de la trayectoria, lo que puede afectar experimentos que asuman continuidad estricta.
- El primer guardado tras la reanudacion cubre varios niveles a la vez (3,90-3,77), por lo que la granularidad no es uniforme en todo el rango.
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque al ser un artefacto de investigacion no esta pensado para despliegue en produccion.
- El tamano del repositorio completo (80,5 GB) puede ser un problema de almacenamiento y ancho de banda si se clona entero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nthngdy/loss-levels-125M
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tokenizador de referencia (SmolLM2): https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Paper, blog o demo: no disponibles en la informacion proporcionada.
