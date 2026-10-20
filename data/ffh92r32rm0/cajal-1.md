# ffh92r32rm0/Cajal-1

## Resumen

Cajal-1 es un modelo de codificación cerebral (*brain encoding*) desarrollado por el usuario de HuggingFace `ffh92r32rm0`. Su función no es generar texto, sino predecir la respuesta hemodinámica de la corteza humana: recibe un vídeo con audio y produce, cada 1,49 segundos, un vector de activación para cada uno de los 20.484 vértices de la superficie cortical `fsaverage5`, es decir, la misma señal que registraría un escáner de fMRI. El modelo se presenta como un codificador de córtex completo que cubre visión, audición y lenguaje, y se distribuye con pesos en `safetensors` (218.752.604 parámetros) bajo licencia de investigación.

La arquitectura combina tres (o cuatro) modelos fundacionales como extractores de características —V-JEPA 2 para movimiento y escenas, SigLIP para objetos y semántica visual, Whisper para sonido y habla, y opcionalmente Qwen3 para el contenido lingüístico— cuyas representaciones se resumen a la cadencia de un escaneo fMRI y se combinan mediante un transformer causal de 12 capas y 218,8 M de parámetros. Ese transformer mantiene memoria de los últimos 91 segundos para modelar el retardo hemodinámico, y una cabeza de lectura proyecta el estado sobre la superficie cortical, bien de un espectador medio, bien de uno de los 41 sujetos de entrenamiento.

Su relevancia actual es metodológica: según la model card, supera a TRIBE v2 —la referencia previa en codificación cerebral de estímulos naturalistas— en un 16 % (parcelas Schaefer) y un 24 % (vértice a vértice) sobre los mismos 40 *runs* de evaluación del conjunto movie10 de CNeuroMod, con intervalos de *bootstrap* al 95 % que no cruzan la unidad. Además, el modelo va acompañado de código de reproducción de resultados y de un *notebook* de demostración en Colab, lo que facilita su uso en neurociencia *in silico* antes de reservar tiempo de escáner.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de 12 capas sobre características multimodales de modelos fundacionales (V-JEPA 2, SigLIP, Whisper; Qwen3 opcional) con cabeza de lectura sobre la superficie cortical `fsaverage5` |
| Parametros totales | 218.752.604 (pesos en `safetensors`; la model card cifra el transformer en 218,8 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 91 segundos de historial temporal, muestreados a 1,49 s por resumen (aproximadamente 61 pasos); longitud en tokens no disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos `safetensors`; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (el modelo no genera texto; la cobertura lingüística depende de Whisper y del opcional Qwen3, sin detalle en la información proporcionada) |
| Licencia | `cajal-1-research` (`license: other`, `license_name: cajal-1-research`); condiciones concretas no disponibles en el extracto de la model card |
| Formato de pesos | `safetensors`, PyTorch 2.1+ (Python 3.10+); repositorio de 0,9 GB |
| Entrada | Vídeo con pista de audio (transcripción opcional vía Qwen3) |
| Salida | 20.484 vértices de la superficie cortical `fsaverage5`; puntuable por vértice o agregado en 1.000 parcelas Schaefer |
| Resolución temporal | 1,49 s por predicción |
| Sujetos de salida | Espectador medio o uno de los 41 sujetos de entrenamiento |
| Datos de entrenamiento | Aproximadamente 3.100 grabaciones fMRI (episodios de TV, películas, clips de vídeo, fotografías y audiolibros) |

## Arquitectura y entrenamiento

El modelo es un *encoder* multimodal en cascada, no un transformer generativo. En la primera etapa, tres modelos fundacionales preentrenados procesan el estímulo de forma independiente: V-JEPA 2 captura movimiento y estructura de escena, SigLIP extrae información de objetos y significado visual, y Whisper procesa sonido y habla; opcionalmente Qwen3 aporta la transcripción lingüística. De cada modalidad se toma un único resumen vectorial cada 1,49 s, igualando la frecuencia de muestreo típica de una adquisición fMRI, lo que reduce el estímulo a una secuencia de estados compactos.

La segunda etapa es un transformer causal de 12 capas y 218,8 M de parámetros que fusiona esas representaciones, mantiene memoria de los últimos 91 segundos y aprende el retardo hemodinámico lento entre un evento en pantalla y la respuesta de flujo sanguíneo que provoca. La tercera etapa es una cabeza de lectura que proyecta el estado latente sobre los 20.484 vértices de `fsaverage5`. El entrenamiento se realizó sobre aproximadamente 3.100 grabaciones fMRI de personas viendo series, películas y clips, observando fotografías y escuchando historias; la información disponible no detalla el número de tokens, la composición exacta del dataset ni si se emplearon etapas de RLHF o DPO (no aplicables de forma convencional en este tipo de modelo). Tampoco se documenta la función de pérdida exacta ni el esquema de aumentación de datos.

## Capacidades

- Predicción de actividad cortical: genera 20.484 valores por instante (cada 1,49 s) correspondientes a los vértices de `fsaverage5`, comparable a la señal BOLD de un fMRI.
- Codificación multimodal de estímulos naturalistas: integra imagen, movimiento, audio y habla en una única representación temporal.
- Memoria temporal de 91 segundos, suficiente para modelar la respuesta hemodinámica retardada y el contexto narrativo de una escena.
- Salida personalizada: permite predecir la respuesta del espectador medio o la de uno de los 41 sujetos vistos durante el entrenamiento.
- Dos granularidades de evaluación: por vértice individual o agregada en 1.000 parcelas Schaefer.
- Análisis de selectividad de categorías *in silico*: la model card demuestra que reproduce mapas de preferencia por lugares (parahippocampal place area) y cuerpos (extrastriate body area), y parcialmente por caras (surco temporal superior).
- Ingesta de transcripción opcional mediante Qwen3 para enriquecer la vía lingüística.
- No soporta *tool calling*, *function calling*, razonamiento multi-paso en lenguaje natural ni generación de texto: no es un modelo de lenguaje y esas capacidades no aplican.
- No se documentan capacidades de visión general (VQA, OCR, detección), audio general (ASR, TTS) ni modo *thinking*; los modelos fundacionales se usan solo como extractores internos.

## Casos de uso

- Diseño de experimentos antes de reservar escáner: introducir un conjunto de estímulos candidato y observar qué redes predice el modelo que se activan, descartando condiciones con poca señal esperada antes de gastar horas de fMRI.
- Localizadores *in silico*: replicar la lógica de un localizador de caras, lugares o cuerpos pasando las imágenes al modelo y contrastando las respuestas predichas entre categorías, sin coste de adquisición.
- Neurocinemática y selección de material audiovisual: puntuar películas o clips por la magnitud y distribución de la respuesta cortical predicha para elegir estímulos con mayor poder estadístico en estudios de visión naturalista.
- Control y ablación de modelos fundacionales: al estar la vía visual y auditiva separada en V-JEPA 2, SigLIP y Whisper, se pueden desactivar o sustituir componentes para medir la contribución de cada modalidad a la predicción cortical.
- Generación de hipótesis regionales: usar los mapas de categorías predichos para formular hipótesis sobre áreas específicas (por ejemplo, el grado de selectividad de cara en el fusiforme) que luego se contrastan con datos reales.
- Docencia y divulgación en neurociencia computacional: el `demo.ipynb` de Colab descarga el modelo y una película de ejemplo y dibuja la respuesta cortical, lo que permite ilustrar el pipeline en clase sin infraestructura de escáner.
- preentrenamiento o ajuste de modelos de decodificación: las representaciones latentes del transformer de 12 capas pueden servir como espacio de características para tareas posteriores de decodificación o alineación entre sujetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K) en la información disponible; no aplican a este modelo. La model card sí reporta una evaluación comparativa frente a TRIBE v2 sobre el conjunto *held-out* movie10 de CNeuroMod (*The Bourne Supremacy*, *The Wolf of Wall Street*, *Hidden Figures*, fragmentos 06 y 10; 40 *runs* de fMRI), con correlación de Pearson entre actividad predicha y medida por *run*, filtro *high-pass* de 128 s e intervalos de *bootstrap* al 95 % con 10.000 remuestreos:

| Metrica | Cajal-1 | TRIBE v2 | Ratio | Runs a favor de Cajal-1 |
|---|---|---|---|---|
| Espectadores conocidos, parcelas | 0,183 | 0,157 | 1,16× [1,09; 1,25] | 27 / 32 |
| Espectadores conocidos, vértice | 0,119 | 0,097 | 1,24× [1,16; 1,33] | 29 / 32 |
| Espectadores conocidos, parcelas, ambos con lectura de cerebro medio | 0,176 | 0,157 | 1,12× | no disponible |
| sub-06, parcelas | 0,180 | 0,142 | 1,27× [1,07; 1,45] | 7 / 8 |

Un *ensemble* de tres semillas de Cajal-1 alcanza 1,19×; la versión publicada es la mejor semilla individual. La model card indica que estos números se reproducen con el código incluido: `tests/test_e1_parity.py` reevalúa los 40 *runs* con una coincidencia de 0,001 por *run* (media 0,1822 frente a 0,1822). No se han publicado en la información disponible comparaciones con otros modelos de codificación cerebral distintos de TRIBE v2.

## Requisitos de hardware

- VRAM estimada para el transformer de 218,75 M parámetros: en torno a 0,87 GB en fp32 y 0,44 GB en fp16/bf16, calculado a partir del recuento de parámetros; no es un dato publicado por el autor.
- El consumo real del pipeline está dominado por los extractores (V-JEPA 2, SigLIP, Whisper y, si se activa, Qwen3), cuyos tamanos no se detallan en la información disponible; por tanto, la VRAM total del pipeline completo es no disponible.
- GPU recomendadas: no disponibles en la model card. Por el tamano del transformer, cualquier GPU con 8 GB o más puede alojarlo aislado; para el pipeline completo se recomienda una GPU de 16-24 GB (estimación, no confirmada por el autor).
- Cabe en GPU de consumo: el transformer sí en tarjetas tipo RTX 3060 12 GB, RTX 4070 o RTX 4090; la viabilidad del pipeline completo en 12-24 GB no está documentada.
- Opciones de despliegue: PyTorch 2.1+ con Python 3.10+, `demo.ipynb` para Google Colab y el paquete de tests incluido. No aplican vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje autoregresivo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto temporal | Salida | Rendimiento (Pearson, parcelas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Cajal-1 | 218,75 M (transformer) + extractores | 91 s a 1,49 s/paso | 20.484 vértices `fsaverage5` | 0,183 | `cajal-1-research` (otros términos no disponibles) | Pesos en HF, demo Colab y tests de reproducción |
| TRIBE v2 | No disponible | No disponible | No disponible (evaluado con el mismo pipeline de puntuación) | 0,157 | No disponible | *Checkpoint* liberado, ejecutado por los autores de Cajal-1 con sus propios extractores |
| Otros modelos de *brain encoding* | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada solo permite comparar con TRIBE v2; no se han encontrado en la búsqueda web referencias a alternativas adicionales de la misma categoría.

## Limitaciones y advertencias

- Rendimiento absoluto bajo: la correlación media de 0,183 por parcelas indica que el modelo explica una fracción reducida de la varianza de la señal fMRI, aunque sea consistente y supere a la referencia.
- Evaluación acotada: los resultados se limitan a 40 *runs* de tres películas del conjunto movie10; no se reportan evaluaciones en otros datasets, tareas o estímulos fuera de distribución.
- Sesgo hacia estímulos cinematográficos: al entrenarse mayoritariamente con películas, el modelo apenas recupera selectividad por palabras escritas y por objetos aislados sobre fondo neutro, según reconoce la propia model card.
- Recuperación parcial de caras: encuentra el surco temporal superior pero solo débilmente el área fusiforme de caras.
- Los mapas de categorías son una demostración exploratoria, no una comparación formal contra mapas de localizador medidos.
- Cobertura de sujetos limitada: la lectura individual solo está disponible para 41 espectadores de entrenamiento; para sujetos nuevos hay que usar la lectura de cerebro medio.
- Dependencia de preprocesamiento: la comparación se realizó con el mismo código de puntuación y espacio `fsaverage5`; resultados con otros pipelines de *resampling* no están documentados.
- Requiere audio: el entrenamiento siempre incluyó sonido, por lo que el comportamiento con vídeo mudo no está caracterizado.
- Licencia de investigación: la licencia `cajal-1-research` no detalla en la información disponible si permite uso comercial; debe consultarse el texto completo antes de cualquier despliegue productivo.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí existe riesgo de sobreinterpretar predicciones como si fueran actividad cerebral medida.
- Advertencia de uso: el modelo no sustituye la adquisición de fMRI ni constituye una herramienta clínica o diagnóstica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ffh92r32rm0/Cajal-1
- Notebook de demostración: https://huggingface.co/ffh92r32rm0/Cajal-1/blob/main/demo.ipynb
- Requisitos de entorno: https://huggingface.co/ffh92r32rm0/Cajal-1/blob/main/requirements.txt
- Test de reproducción de resultados (`test_e1_parity.py`): https://huggingface.co/ffh92r32rm0/Cajal-1/blob/main/tests/test_e1_parity.py
- Paper, blog o repositorio adicional: no disponibles (la búsqueda web realizada no devolvió resultados relevantes sobre el modelo).
