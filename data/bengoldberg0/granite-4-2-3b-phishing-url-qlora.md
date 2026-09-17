# bengoldberg0/granite-4.2-3b-phishing-url-qlora

## Resumen

granite-4.2-3b-phishing-url-qlora es un adaptador PEFT (LoRA) publicado por el usuario bengoldberg0 que convierte el modelo IBM Granite 4.2 3B en un clasificador binario de cadenas de URL, con las etiquetas `legitimate` o `phishing`. No es un modelo autónomo: el repositorio contiene únicamente los pesos del adaptador en formato safetensors, que deben aplicarse sobre el checkpoint base `ibm-granite/granite-4.2-3b`. El adaptador se entrenó con QLoRA de 4 bits NF4 y añade 2.621.440 parámetros entrenables sobre las proyecciones `q_proj` y `v_proj`, dejando congelados los pesos cuantizados del modelo base.

El interés del trabajo es metodológico más que de producto. El autor compara tres sistemas (Granite sin modificar, el adaptador QLoRA y un clasificador TF-IDF) sobre dominios retenidos de las fuentes de entrenamiento, la partición publicada de PhreshPhish y fuentes externas, y publica los scripts de preparación de datos, entrenamiento, evaluación y bootstrap pareado. El resultado principal es que QLoRA añade 22,8 puntos porcentuales sobre Granite sin modificar en dominios retenidos de las fuentes de entrenamiento y 10,6 puntos sobre TF-IDF en el subconjunto publicado de PhreshPhish (intervalo del 95 % por bootstrap pareado: 7,2 a 14,0 puntos).

La relevancia del artefacto reside tanto en sus resultados como en sus límites declarados: la transferencia a fuentes externas se queda en un 54,4 % de exactitud con un 64,0 % de falsos positivos, las puntuaciones no están calibradas y el propio autor lo describe como un adaptador de investigación, no como un detector listo para producción. Es un proyecto estudiantil independiente, sin respaldo de IBM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre el transformer IBM Granite 4.2 3B. La arquitectura interna del modelo base no se detalla en la información disponible |
| Parámetros totales | 2.621.440 parámetros entrenables en el adaptador; el modelo base se identifica como `ibm-granite/granite-4.2-3b` (~3.000 millones por denominación) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible para el modelo base. El adaptador se entrenó con un límite de secuencia de 512 tokens, incluida la respuesta |
| Tipos de cuantización | Entrenamiento QLoRA en 4 bits NF4 con doble cuantización y dtype de cómputo BF16. El repositorio publica el adaptador en safetensors |
| Idiomas soportados | No disponible. El adaptador está especializado en clasificar cadenas de URL, no texto en lenguaje natural |
| Licencia | apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA, no un modelo autónomo) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el checkpoint `ibm-granite/granite-4.2-3b` en la revisión `e459acceac81e5fe67c07d9cfc72329a332e7eb1`. El ajuste se hizo con QLoRA de 4 bits NF4 con doble cuantización y cómputo en BF16. Los módulos objetivo de LoRA fueron únicamente `q_proj` y `v_proj`, con rango 8, alpha 16 y dropout 0,05, lo que da 2.621.440 parámetros entrenables. Solo el token de respuesta contribuye a la pérdida del modelo causal de lenguaje. El autor justifica la elección de esos dos módulos y del rango 8 como una decisión de presupuesto, no como una afirmación de que sean los objetivos óptimos.

El conjunto de entrenamiento consta de 6.000 URLs procedentes de PhiUSIIL y PhreshPhish, con 1.500 ejemplos por cada combinación de fuente y clase. Se realizó una sola época, con tasa de aprendizaje 0,0001, 12 pasos de warmup, micro-lote 4 y acumulación de gradiente 4, hasta 375 pasos de optimizador. El entrenamiento se ejecutó en una NVIDIA A100-SXM4-40GB y duró 14,96 minutos, con un pico de memoria asignada observado de 7,03 GiB. El autor advierte que no se compararon recuentos de épocas ni se demostró convergencia, y que el experimento 2 no es un ablación controlada, ya que cambiaron a la vez el modelo, los datos y las selecciones de test respecto al experimento 1.

## Capacidades

- Clasificación binaria de cadenas de URL: devuelve `legitimate` o `phishing` generando un token de respuesta.
- Salida estructurada en JSON con los campos `label`, `prediction` (1 para legítima, 0 para phishing), `phishing_score_uncalibrated` (puntuación softmax relativa para la respuesta B) y `phishing_logit_margin` (logit de B menos logit de A).
- Señal de truncamiento de entrada mediante el campo `url_truncated`, que indica si la URL se acortó para respetar el presupuesto de tokens.
- No soporta tool calling ni function calling.
- No soporta flujos de agente ni razonamiento multi-paso: el entrenamiento se limita a la predicción de un único token de respuesta.
- No tiene visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües: no documentadas ni evaluadas; la entrada son cadenas de URL.
- No visita, resuelve ni analiza el contenido de la URL: la clasificación se hace solo sobre la cadena.

## Casos de uso

- Investigación sobre transferencia entre dominios en detección de phishing: permite medir cuánto de la ganancia de un ajuste QLoRA sobrevive al pasar de las fuentes de entrenamiento a fuentes externas, con la brecha documentada de 54,4 % de exactitud y 64,0 % de falsos positivos en el escenario externo.
- Reproducción de experimentos con evaluación estadística: los scripts `scripts/bootstrap.py` y `scripts/analyze_public.py` permiten recalcular las métricas y el intervalo de confianza por bootstrap pareado (7,2 a 14,0 puntos) sin necesidad de ficheros privados.
- Generación de características para un clasificador en cascada: la puntuación y el margen de logits pueden alimentar un sistema posterior que combine señales de reputación, DNS o contenido, nunca como decisión final.
- Auditoría de sesgos y de diferencias de distribución entre datasets: el experimento 1 mostró que un ajuste solo con PhiUSIIL alcanzaba un 99,6 % de exactitud interna pero etiquetaba como phishing todos los ejemplos externos, lo que convierte al adaptador en una herramienta útil para estudiar ese fallo.
- Etiquetado asistido para curación de datasets: únicamente con revisión humana y aceptando la tasa de falsos positivos publicada.
- Docencia y formación en QLoRA y PEFT: el entrenamiento completo cabe en 14,96 minutos y 7,03 GiB de pico en una A100 40 GB, lo que lo hace reproducible en un taller.
- Estudio de robustez de clasificadores de URL: el campo `url_truncated` permite analizar el efecto del recorte de entradas largas sobre la predicción.
- Señal secundaria en un SOC: solo como indicio adicional de baja ponderación, dado que las puntuaciones no están calibradas y el autor desaconseja el uso en producción.

## Benchmarks y rendimiento

| Evaluación | Métrica | Resultado |
|---|---|---|
| Dominios retenidos de las fuentes de entrenamiento | Ganancia de QLoRA sobre Granite sin modificar | +22,8 puntos porcentuales |
| Subconjunto publicado de PhreshPhish | Ganancia de QLoRA sobre TF-IDF | +10,6 puntos (IC del 95 % por bootstrap pareado: 7,2 a 14,0) |
| Fuentes externas | Exactitud | 54,4 % |
| Fuentes externas | Tasa de falsos positivos | 64,0 % |
| Experimento 1 (Granite 4.0 ajustado solo con PhiUSIIL) | Exactitud interna | 99,6 %, con etiquetado como phishing de todos los ejemplos externos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible.

## Requisitos de hardware

- Entorno verificado por el autor para entrenamiento e inferencia: Linux, Python 3.13, PyTorch 2.11.0+cu128 y una NVIDIA A100-SXM4-40GB.
- El script de inferencia exige una GPU CUDA con soporte de BF16. La inferencia en CPU no está implementada.
- Pico de memoria asignada observado durante el entrenamiento: 7,03 GiB, con una duración de 14,96 minutos.
- Estimación de VRAM para inferencia (no publicada por el autor, derivada del tamaño del modelo base): en BF16 los pesos de un modelo de ~3.000 millones de parámetros ocupan del orden de 6 GB; en una cuantización de 4 bits bajarían a unos 2 GB. El adaptador en safetensors apenas añade unos pocos megabytes.
- Encaje en GPU de consumo: no documentado. Con las cifras anteriores, una GPU con 8 GB o más de VRAM debería ser suficiente en 4 bits, pero el autor no lo verifica y advierte que no garantiza resultados idénticos en otro hardware o versiones de software.
- Opciones de despliegue: solo se documenta el script `inference.py` del propio repositorio, que descarga el checkpoint base fijado y aplica el adaptador. No se documentan vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Sistema | Tipo | Parámetros entrenables | Licencia | Rendimiento documentado |
|---|---|---|---|---|
| Este adaptador (QLoRA sobre Granite 4.2 3B) | Adaptador LoRA sobre transformer de ~3.000 millones | 2.621.440 | apache-2.0 | +22,8 puntos sobre Granite sin modificar en dominios retenidos; +10,6 sobre TF-IDF en PhreshPhish; 54,4 % de exactitud en fuentes externas |
| IBM Granite 4.2 3B sin modificar | Modelo base de propósito general | 0 | No especificada en la información disponible | Usado como referencia; queda 22,8 puntos por debajo del adaptador en dominios retenidos |
| Clasificador TF-IDF | Modelo clásico de bolsas de n-gramas sobre la cadena de URL | No aplica | No especificada en la información disponible | Usado como referencia; queda 10,6 puntos por debajo del adaptador en el subconjunto publicado de PhreshPhish |
| Otros clasificadores de phishing basados en transformers | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un detector de producción. El propio autor lo califica explícitamente como adaptador de investigación.
- Transferencia externa débil: 54,4 % de exactitud y 64,0 % de falsos positivos sobre fuentes distintas de las de entrenamiento.
- Las puntuaciones no están calibradas. `phishing_score_uncalibrated` es una puntuación softmax relativa y no una probabilidad; una predicción `legitimate` no establece que un sitio sea seguro.
- Sesgo de dataset documentado: el experimento previo con PhiUSIIL en solitario produjo un 99,6 % de exactitud interna etiquetando como phishing la totalidad de los ejemplos externos, lo que evidencia un fuerte desajuste estructural entre las fuentes.
- Validación de entrada básica, no exhaustiva: el script no realiza validación completa de URL ni saneamiento frente a entradas adversarias, y no es una API pública endurecida.
- El script no visita la URL, por lo que no detecta contenido malicioso, redirecciones ni comportamiento en tiempo de ejecución.
- Límite de secuencia de 512 tokens: las URLs largas se truncan y el campo `url_truncated` lo señala, lo que puede degradar la clasificación.
- Entrenamiento de una sola época sin estudio de convergencia ni comparación de recuentos de épocas.
- No es una ablación controlada: entre el experimento 1 y el 2 cambiaron a la vez el modelo, los datos y las selecciones de test.
- La orden de entrenamiento refactorizada de Granite no se volvió a ejecutar según la documentación del repositorio.
- Inferencia en CPU no implementada; se requiere GPU CUDA con BF16 y no se garantizan resultados idénticos en otro hardware o versiones de librerías.
- Idiomas soportados no documentados; el artefacto está pensado para cadenas de URL, no para texto libre multilingüe.
- Proyecto estudiantil independiente, sin respaldo ni validación por parte de IBM.
- Licencia apache-2.0: permite uso comercial, pero la licencia no cubre el riesgo operativo derivado de la tasa de falsos positivos publicada.
- El repositorio registra 0 descargas y 0 valoraciones positivas en el momento de la consulta, con un tamaño de 0,0 GB, coherente con un adaptador de 2,6 millones de parámetros y sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bengoldberg0/granite-4.2-3b-phishing-url-qlora
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Dataset de entrenamiento: https://huggingface.co/datasets/phreshphish/phreshphish
- Revisión fijada del adaptador: `c1c2501da8ab5bf02d89d3bf2d6f04719faf525a`
- Revisión fijada del modelo base: `e459acceac81e5fe67c07d9cfc72329a332e7eb1`
- Artefactos del repositorio (rutas relativas dentro del mismo): `inference.py`, `requirements.txt`, `METHODS.md`, `PIPELINE.md`, `scripts/prepare_data.py`, `scripts/download_metadata.py`, `scripts/train.py`, `scripts/train_tfidf.py`, `scripts/evaluate.py`, `scripts/bootstrap.py`, `scripts/analyze_public.py`
- Resultados de la búsqueda web: sin enlaces relevantes. Las únicas entradas devueltas son artículos en árabe sobre el Renacimiento europeo, sin relación con el modelo.
