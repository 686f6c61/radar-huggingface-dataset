# fin-ai-lab/tfwm-lejepa-cross-stock-industry

## Resumen

TFWM encoder — LeJEPA C-S, Same Industry es un codificador de representaciones para series temporales de datos de mercado desarrollado por fin-ai-lab. Se trata de un modelo de extracción de características (pipeline `feature-extraction`) basado en LeJEPA, una arquitectura de predicción en el espacio latente (joint-embedding predictive architecture, JEPA) que incorpora el regularizador SIGReg de tipo gaussiano isotrópico. Forma parte de la colección TFWM (Towards Financial World Modeling), en la que se comparan 18 codificadores que comparten exactamente el mismo backbone y el mismo presupuesto de entrenamiento, diferenciándose únicamente en el objetivo de aprendizaje.

El modelo procesa datos de renta variable estadounidense en sesión regular a 1 Hz: 9 canales de mercado (bid_price, vwap_all, high, low, ask_price, bid_size, ask_size, volume, n) más 11 canales de información de vista calculados en tiempo de carga, lo que da 20 canales de entrada. El backbone es un transformer de 12 capas, ancho 384, 6 cabezas de atención, MLP de 1536 y patch de 8, con posiciones sinusoidales, lo que suma aproximadamente 22 millones de parámetros. Cada muestra genera ocho vistas: dos globales y seis locales, construidas a partir de dos acciones distintas de la misma industria Fama-French 49 en el mismo instante del mismo día.

Su relevancia actual es doble. Por un lado, ofrece un punto de comparación reproducible y controlado entre objetivos de aprendizaje auto-supervisado aplicados a datos financieros, algo poco habitual en la literatura. Por otro, es un ejemplo de preentrenamiento sin etiquetas sobre datos de mercado de alta frecuencia, lo que permite reutilizar el codificador como extractor de características en tareas posteriores de predicción, análisis latente o agrupación de activos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder dentro de un esquema JEPA (LeJEPA) con regularizador SIGReg; 12 capas, ancho 384, 6 cabezas, MLP 1536, patch 8, posiciones sinusoidales |
| Parametros totales | ~22 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la model card no especifica la ventana de entrada en segundos ni el número de patches) |
| Tipos de cuantizacion | No disponible (solo se publican pesos PyTorch en `model.pt`; no hay GGUF, AWQ, GPTQ ni variantes cuantizadas) |
| Idiomas soportados | No aplica / no disponible (la entrada es numérica, no textual) |
| Licencia | `other`, con nombre `derived-market-data` (datos de mercado derivados) |
| Formato de pesos | PyTorch state dict (`model.pt`), acompañado de `config.json` y `train_meta.json`; no usa safetensors |
| Canales de entrada | 20 (9 de mercado + 11 de información de vista) |
| Datos de entrada | Renta variable estadounidense en sesión regular, rejilla regular de 1 Hz |
| Tamano del repositorio | 0,5 GB |
| Checkpoints publicados | 5 (`2019-09`, `2020-01`, `2020-08`, `2020-09`, `2020-12`) |

## Arquitectura y entrenamiento

El backbone es un transformer estándar de 12 capas con ancho 384, 6 cabezas de atención y MLP de 1536, con embedding por patches de tamaño 8 y codificación posicional sinusoidal. Sobre esa base se aplica el marco LeJEPA: cada muestra se proyecta en ocho vistas (dos globales y seis locales) y el objetivo combina la predicción en espacio latente entre vistas con el regularizador SIGReg, que fuerza las representaciones hacia una distribución gaussiana isotrópica y evita el colapso de la representación. Las vistas proceden de dos acciones diferentes de la misma industria Fama-French 49, en el mismo instante del mismo día; el mapa de industrias se deriva de datos con licencia y no se ha publicado.

El entrenamiento es completamente auto-supervisado, sin etiquetas de retorno futuro. Cada checkpoint se entrena sobre los seis meses inmediatamente anteriores a su mes de evaluación, con 12 pasadas sobre ese tramo, LR base 6e-05, weight decay 0.05 y batch de 256. Los datos provienen del dataset `fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense`, carpeta `1Hz_mosaic_mnth/`, con un registro por ticker-día sobre la rejilla de 1 Hz rellenada y mezclado dentro de cada mes. La model card advierte de que el checkpoint `2019-09` se entrenó sobre un tramo (2019-03 a 2019-08) que queda fuera de los datos publicados, por lo que ese codificador no se puede reentrenar a partir del dataset liberado. El código de entrenamiento (`market_jepa`, `stable_finance`) todavía no es público y los pesos están marcados como pre-release.

Un detalle operativo relevante: el `config.json` de cada checkpoint guarda `pool = mean`, y `from_pretrained` lo respeta ignorando cualquier valor de `pool` que se pase aparte. Para obtener la lectura de último patch (la que usa el artículo para las pruebas de forecasting) hay que asignar `.pool = "last"` manualmente en cada sub-backbone tras cargar: `backbone`, y también `swa_backbone` en TS2Vec y `freq_backbone` en TF-C.

## Capacidades

- Extracción de características (embeddings) de series temporales financieras a 1 Hz sobre 20 canales de entrada, con pooling configurable (`mean` o `last`).
- Predicción en espacio latente entre vistas de distintas acciones de la misma industria, sin necesidad de etiquetas.
- Representación del estado de mercado en el instante de decisión mediante la lectura de último patch, pensada para sondas de forecasting.
- Análisis latente mediante la media de patches, orientado a estudiar la estructura interna de las representaciones.
- Transferencia a tareas posteriores por congelación del codificador y entrenamiento de cabezas ligeras (probes lineales o MLP).
- No dispone de tool calling, function calling ni soporte de agentes: no es un modelo generativo de lenguaje.
- No dispone de capacidades multimodales, de visión ni de audio, ni de modo de razonamiento explícito.
- Sin capacidades multilingües: la entrada no es texto.

## Casos de uso

- Extracción de características para modelos de forecasting: congelar el codificador, aplicar la lectura `pool="last"` y entrenar una cabeza ligera que prediga retornos o volatilidad a horizontes cortos sobre la rejilla de 1 Hz.
- Generación de señales de trading intradía: al operar sobre datos de sesión regular y mantener la resolución temporal de un segundo, los embeddings pueden alimentar reglas de entrada y salida con latencia de inferencia muy baja dado el tamaño de 22 millones de parámetros.
- Agrupación y clasificación de activos: usar los embeddings medios para agrupar acciones por comportamiento latente y detectar anomalías respecto a la industria Fama-French asignada.
- Investigación de régimen de mercado: analizar la evolución de las representaciones latentes a lo largo de los meses de evaluación para caracterizar cambios de régimen sin depender de etiquetas.
- Modelos de riesgo cross-sectional: emplear los embeddings de múltiples tickers en el mismo instante como variables explicativas en modelos factoriales o de covarianza.
- Comparación controlada de objetivos auto-supervisados: al compartir backbone y presupuesto de entrenamiento con los otros 17 codificadores de la colección TFWM, sirve como referencia para aislar el efecto del objetivo de aprendizaje.
- Prototipado en CPU: con ~22 millones de parámetros, el codificador se puede ejecutar en CPU para tareas de investigación por lotes, sin necesidad de acelerador.
- Base para transferencia a otros mercados o frecuencias: los pesos pueden servir de inicialización o de extractor congelado en dominios con menos datos, siempre que la entrada se adapte al esquema de 20 canales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que este codificador es uno de los 18 comparados en *Towards Financial World Modeling* (TFWM), pero no incluye cifras de MMLU, HumanEval, GSM8K ni de las sondas de forecasting o análisis latente empleadas en el artículo. No se han inventado valores.

## Requisitos de hardware

- VRAM estimada para inferencia: ~88 MB para los pesos en fp32 y ~44 MB en fp16/bf16. El consumo real de memoria lo dominan las activaciones intermedias y depende de la longitud de ventana, dato no especificado en la model card.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3060, RTX 4090, A100 o H100 quedan sobradamente dimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 1-2 GB de VRAM libre, e incluso en CPU.
- Opciones de despliegue: PyTorch con `torch.load` sobre `model.pt`, o el cargador `market_jepa.eval.checkpoints.load_encoder` cuando se publique el código. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI, TensorRT-LLM ni formatos GGUF, al no tratarse de un modelo generativo de lenguaje.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de muestras por segundo.

## Comparativa con modelos similares

Los comparables directos pertenecen a la propia colección TFWM y comparten backbone, número de parámetros y presupuesto de entrenamiento, por lo que la diferencia principal es el objetivo de aprendizaje.

| Modelo | Parametros | Contexto | Objetivo de aprendizaje | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tfwm-lejepa-cross-stock-industry | ~22 M | No disponible | LeJEPA con SIGReg, vistas de la misma industria | `derived-market-data` | Pesos públicos, código de entrenamiento no público |
| TFWM — TS2Vec | ~22 M | No disponible | Objetivo jerárquico de contraste temporal (sub-backbone `swa_backbone`) | `derived-market-data` | Pesos públicos en la coleccion TFWM |
| TFWM — TF-C | ~22 M | No disponible | Contraste en tiempo y frecuencia (sub-backbone `freq_backbone`) | `derived-market-data` | Pesos públicos en la coleccion TFWM |
| Otros 15 codificadores de la coleccion TFWM | ~22 M | No disponible | Distintos objetivos auto-supervisados | `derived-market-data` | Pesos públicos en la coleccion TFWM |

No se dispone de comparaciones con modelos externos ni de cifras de rendimiento relativo.

## Limitaciones y advertencias

- Estado pre-release: tanto los pesos como el código que los carga son trabajo en curso y su contenido y estructura pueden cambiar sin aviso.
- El código de entrenamiento (`market_jepa`, `stable_finance`) no es público, lo que impide reproducir el entrenamiento desde cero.
- El mapa de industrias Fama-French 49 utilizado para construir las vistas deriva de datos con licencia y no se ha publicado.
- El checkpoint `2019-09` se entrenó sobre un tramo temporal que queda fuera del dataset liberado; no se puede reentrenar a partir de los datos publicados.
- Licencia `derived-market-data`: al tratarse de pesos derivados de datos de mercado con licencia, el uso comercial está restringido y requiere revisión legal específica antes de cualquier despliegue en producción.
- Cobertura limitada a renta variable estadounidense en sesión regular, a 1 Hz y al periodo 2019-2020; el comportamiento fuera de ese régimen, mercado o frecuencia no está validado.
- Riesgo de sobreajuste al periodo histórico: solo hay cinco checkpoints, cada uno entrenado sobre seis meses, sin garantía de robustez ante cambios estructurales de mercado.
- Riesgo de fuga de información si el pipeline de evaluación no respeta estrictamente la separación temporal entre tramo de entrenamiento y mes de evaluación.
- El valor por defecto `pool = mean` en `config.json` puede no coincidir con el readout que se desea; si se busca el estado en el instante de decisión hay que forzar `.pool = "last"` en los sub-backbones, y omitirlo produce resultados silenciosamente incorrectos para sondas de forecasting.
- Al ser un extractor de características y no un modelo generativo, no aplica el concepto habitual de alucinación, pero sí el riesgo de embeddings poco informativos o engañosos fuera de la distribución de entrenamiento.
- Sin datos publicados de benchmarks, latencia o throughput: cualquier estimación de rendimiento en producción debe medirse localmente.
- Cero descargas y cero likes en el momento de redactar esta ficha, lo que limita la validación por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fin-ai-lab/tfwm-lejepa-cross-stock-industry
- Colección TFWM Pre-Trained Encoders: https://huggingface.co/collections/fin-ai-lab/tfwm-pre-trained-encoders-6ab871e942535b9c6041698d
- Dataset de entrenamiento: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense
- Carpeta de datos usada en el entrenamiento: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense/tree/main/1Hz_mosaic_mnth
- Articulo de referencia citado (*Towards Financial World Modeling*): enlace no disponible en la model card
- Repositorio de codigo (`market_jepa`, `stable_finance`): no publicado todavia, enlace no disponible
- Busqueda web: no se han encontrado resultados relevantes; las entradas devueltas corresponden a definiciones de diccionario del termino frances "fin" y no guardan relacion con el modelo.
