# dolphinteam/OpenWhistle-Wav2Vec2.0-10pct

## Resumen

OpenWhistle-Wav2Vec2.0-10pct es un modelo de representaciones auto-supervisado de tipo Wav2Vec2.0, entrenado desde cero por el equipo `dolphinteam` sobre un subconjunto historico del 10 % del corpus OpenWhistle de vocalizaciones de silbidos de delfin mular (*Tursiops truncatus*). El modelo resuelve el problema de disponer de un backbone acustico preentrenado especificamente para bioacustica de cetaceos, en lugar de reutilizar modelos de voz humana entrenados a 16 kHz que no cubren el rango de frecuencia de los silbidos de delfin.

La arquitectura sigue el esquema Wav2Vec2.0 con 95.054.848 parametros, 12 capas de transformer, tamano oculto 768 y 8 cabezas de atencion, pero con un frontend adaptado a 44.100 Hz y un stride convolucional total de 960 muestras. Se distribuye como backbone de extraccion de caracteristicas (`feature-extraction`) bajo licencia CC BY 4.0, con pesos en `safetensors` y compatibilidad con la libreria `transformers`.

Su relevancia actual radica en que abre la puerta a tareas supervisadas de clasificacion y deteccion de silbidos sobre los datasets publicos de la familia OpenWhistle, y en que documenta de forma transparente el coste de entrenamiento (28,75 GPU-horas en 16 V100) y las limitaciones del checkpoint publicado, incluido un macro-F1 de solo 20,6 % en probing lineal congelado sobre 10 tipos de silbido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2.0 (transformer encoder con frontend convolucional) |
| Parametros totales | 95.054.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (crops de audio de hasta 20 s durante el entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dominio bioacustico, no linguistico) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (`model.safetensors`); checkpoint nativo Fairseq `checkpoint_337_40000.pt` |

Otros datos tecnicos relevantes:

| Parametro | Valor |
|---|---|
| Frecuencia de muestreo | 44.100 Hz |
| Capas transformer | 12 |
| Tamano oculto | 768 |
| Cabezas de atencion | 8 |
| Capas del extractor de caracteristicas | 7 |
| Stride convolucional total | 960 muestras |
| Entrada esperada | waveform mono, normalizada, padding a la derecha con valor 0.0 |
| Tamano del repositorio | 0,4 GB |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El modelo es un Wav2Vec2.0 de preentrenamiento auto-supervisado con objetivo de contrastive learning y enmascaramiento latente, implementado en Fairseq 0.12.2 nativo sobre PyTorch 2.0.1 y CUDA 11.7. La diferencia clave frente a los Wav2Vec2 de voz es el frontend: en lugar de operar a 16 kHz, el extractor convolucional de 7 capas procesa audio a 44.100 Hz con un stride total de 960 muestras, lo que permite representar el contenido en alta frecuencia propio de los silbidos de delfin mular. El encoder tiene 12 capas, dimension oculta 768 y 8 cabezas de atencion.

El preentrenamiento se realizo sobre el subconjunto `dolphinteam/OpenWhistle-Pretraining-10pct`, con 2.841 clips de entrenamiento (10,16 horas) y 337 de validacion (1,17 horas), 11,34 horas en total antes de recorte. Se ejecutaron 40.000 actualizaciones del optimizador con 3.200 de warmup, learning rate pico de 0,0005, presupuesto maximo de 882.000 muestras de audio por GPU, acumulacion 1 y recortes de hasta 20 segundos, en FP16 y con semilla 42 sobre 16 NVIDIA V100. El entrenamiento duro aproximadamente 1,80 horas (28,75 GPU-horas). El checkpoint publicado es `checkpoint_337_40000.pt`, con perdida de validacion auto-supervisada de 1,936; la mejor perdida observada fue 1,868 en la actualizacion 27.230. No se registraron datos de energia ni emisiones de carbono.

## Capacidades

- Extraccion de embeddings acusticos auto-supervisados de silbidos de delfin mular a partir de waveform mono a 44.100 Hz.
- Representaciones de audio de alta frecuencia adaptadas al rango de los silbidos de cetaceos, no cubierto por los modelos de voz humana.
- Base para fine-tuning supervisado en clasificacion de tipos de silbido y en deteccion de silbidos.
- Inferencia de caracteristicas congeladas para probing lineal (logistic regression) sobre las representaciones del encoder.
- Analisis exploratorio de las representaciones acusticas aprendidas.
- Carga en `transformers` mediante `AutoModel` (encoder) o `Wav2Vec2ForPreTraining` (incluyendo cuantizador y cabezas de proyeccion).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio general ni capacidades multilingues: es un backbone de audio, no un modelo generativo.

## Casos de uso

- Clasificacion de tipos de silbido: fine-tuning supervisado sobre `OpenWhistle-Classification-Finetuning` para asignar cada silbido a una de las 10 categorias del corpus, usando el encoder preentrenado como inicializacion en lugar de entrenar desde cero con solo 11 horas de audio.
- Deteccion de silbidos en grabaciones largas: fine-tuning sobre `OpenWhistle-Detection-Finetuning` para localizar eventos de silbido en pasajes continuos de hidrofono, aprovechando que el frontend a 44,1 kHz preserva la estructura frecuencial de los silbidos.
- Extraccion de embeddings para agrupamiento no supervisado: generar representaciones por clip y aplicar clustering para descubrir repertorios o variantes de silbido no etiquetadas en nuevos registros.
- Probing lineal y evaluacion de calidad de representaciones: usar el encoder congelado y un clasificador logistico para medir cuanto de la informacion de la tarea esta ya presente en el preentrenamiento, como hace la propia model card (macro-F1 20,6 %).
- Analisis exploratorio de representaciones acusticas: visualizar activaciones y similitudes entre silbidos para estudiar estructura acustica y comparar poblaciones o canales de grabacion.
- Baseline reproducible para bioacustica de cetaceos: servir como punto de partida publico y citable (CC BY 4.0) en estudios que necesiten un backbone de audio adaptado a delfines, con pesos en `safetensors` y carga directa en `transformers`.
- Preentrenamiento intermedio en dominios relacionados: reutilizar el encoder como inicializacion para otras especies de odontocetos con silbidos en rangos de frecuencia similares, sujeto a validacion experimental.

## Benchmarks y rendimiento

La unica metrica publicada es el probing lineal con encoder congelado sobre la particion `all` de clasificacion (10 tipos de silbido, distribucion natural de clases), evaluada con los splits oficiales, batch size 1, FP32, `C` de regresion logistica seleccionado en `{0,1, 1, 10}` sobre validacion y reajuste de scaler y probe sobre train + validacion.

| Evaluacion | Metrica | Resultado |
|---|---|---|
| Frozen-encoder linear probing, clasificacion `all` (10 clases) | Macro-F1 (%) | 20,6 ± 1,0 |
| Perdida de validacion auto-supervisada (checkpoint final, 40.000 updates) | Loss | 1,936 |
| Perdida de validacion auto-supervisada (mejor observada, 27.230 updates) | Loss | 1,868 |

El intervalo ± 1,0 corresponde a la desviacion estandar muestral de 1.000 remuestreos bootstrap de clips de test con semilla 42. No hay resultados publicados de MMLU, HumanEval, GSM8K ni de benchmarks de audio comparables en la informacion disponible. La model card advierte que las perdidas auto-supervisadas no miden rendimiento downstream.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 95 millones de parametros; en FP32 ocupa aproximadamente 0,38 GB de pesos y en FP16 unos 0,19 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o mas, y en CPU para clips cortos.
- GPU recomendadas: cualquier GPU moderna; el entrenamiento original uso 16 NVIDIA V100 en FP16. Para fine-tuning de las cabezas downstream basta una unica GPU consumer de gama media-alta (RTX 3060 12 GB o superior) o una A100/H100 si se quiere mayor throughput.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070, RTX 4090, e incluso en GPUs integradas para inferencia de clips individuales.
- Opciones de despliegue: `transformers` (carga directa con `AutoModel` o `Wav2Vec2ForPreTraining`), exportacion a ONNX, y despliegue en servidores de inferencia compatibles con `transformers`. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos de texto.
- Latencia y throughput: no disponibles en la informacion proporcionada. La evaluacion de referencia procesa clips individualmente sin padding de waveform y en FP32.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. La comparativa se limita a caracteristicas estructurales frente a alternativas genericas de la misma categoria.

| Modelo | Parametros | Frecuencia de muestreo | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenWhistle-Wav2Vec2.0-10pct | 95.054.848 | 44.100 Hz | crops de hasta 20 s en entrenamiento | CC BY 4.0 | Hugging Face, pesos safetensors |
| Wav2Vec2.0 base estandar (voz) | ~95 M | 16.000 Hz | no disponible | segun variante | ampliamente disponible |
| Wav2Vec2.0 large estandar (voz) | ~317 M | 16.000 Hz | no disponible | segun variante | ampliamente disponible |

La diferencia funcional principal frente a los Wav2Vec2 de voz es el frontend a 44,1 kHz, necesario para silbidos de delfin; los modelos de voz estandar no estan adaptados a ese rango. No se conocen en la informacion disponible otros backbones bioacusticos especificos de cetaceos con los que comparar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un clasificador listo para usar: requiere una cabeza downstream o fine-tuning sobre datos etiquetados para clasificacion o deteccion.
- Rendimiento downstream modesto: el macro-F1 de probing lineal congelado es de solo 20,6 % en 10 clases, lo que indica representaciones aun limitadas; el checkpoint final (loss 1,936) no es el mejor observado (1,868 en 27.230 updates).
- Subconjunto de preentrenamiento privado: el 10 % historico no es publico, por lo que la repeticion exacta del preentrenamiento no es posible sin acceso a el; el corpus padre publico es `OpenWhistle-Pretraining`.
- Procedimiento de estratificacion no establecido de forma independiente: la semilla de seleccion del subconjunto y la estratificacion por ano, canal y duracion no han sido verificadas de forma independiente.
- Evaluacion no replicable al detalle: el runner exacto y el manifiesto de revision fijada usados para el 20,6 % no estan publicados en el repositorio de codigo, que contiene una implementacion de benchmark anterior.
- Sesgos y dominio: entrenado exclusivamente con silbidos de delfin mular; no se espera generalizacion a otras especies, a ruido ambiental no filtrado ni a voz humana.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero el modelo puede producir embeddings poco informativos o mal calibrados fuera de la distribucion de entrenamiento (otras frecuencias de muestreo, canales o condiciones de grabacion).
- Limitaciones de contexto e idioma: no hay ventana de contexto linguistica ni idiomas; el limite practico es la duracion de audio procesable y la frecuencia de muestreo fija de 44.100 Hz.
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribucion; conviene revisar los terminos de los datasets asociados y del corpus padre.
- Sin datos de energia ni emisiones de carbono del entrenamiento, lo que limita el analisis de impacto ambiental.
- Advertencia de produccion: la entrada debe ser mono, normalizada, a 44.100 Hz y con padding a la derecha a 0.0; cualquier desviacion puede degradar las representaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dolphinteam/OpenWhistle-Wav2Vec2.0-10pct
- Dataset de preentrenamiento (10 %): https://huggingface.co/datasets/dolphinteam/OpenWhistle-Pretraining-10pct
- Corpus padre de preentrenamiento: https://huggingface.co/datasets/dolphinteam/OpenWhistle-Pretraining
- Dataset de fine-tuning para clasificacion: https://huggingface.co/datasets/dolphinteam/OpenWhistle-Classification-Finetuning
- Dataset de fine-tuning para deteccion: https://huggingface.co/datasets/dolphinteam/OpenWhistle-Detection-Finetuning
- Repositorio de codigo OpenWhistle: https://github.com/fmustun/OpenWhistle
- Metadatos Croissant/RAI de preentrenamiento: https://huggingface.co/datasets/dolphinteam/OpenWhistle-Pretraining/blob/main/croissant_rai_OpenWhistle-Pretraining.json
- Metadatos Croissant/RAI de clasificacion: https://huggingface.co/datasets/dolphinteam/OpenWhistle-Classification-Finetuning/blob/main/croissant_rai_OpenWhistle-Classification-Finetuning.json
- Metadatos Croissant/RAI de deteccion: https://huggingface.co/datasets/dolphinteam/OpenWhistle-Detection-Finetuning/blob/main/croissant_rai_OpenWhistle-Detection-Finetuning.json
- Paper referenciado (arXiv:2609.34839): https://arxiv.org/abs/2609.34839
