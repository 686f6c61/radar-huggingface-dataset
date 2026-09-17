# dys-asr/parakeet-tdt-0.6b-all-soup

## Resumen

Parakeet TDT 0.6B all-soup es un modelo de reconocimiento automático del habla (ASR) en inglés, publicado por el usuario `dys-asr`, especializado en habla disártrica y trastornos del habla. Se trata de un *model soup*: no se ha entrenado nada nuevo, sino que se han promediado con pesos uniformes (1/5 cada uno) los checkpoints de las épocas 6, 7, 8, 9 y 10 del run `dys-asr/parakeet-tdt-0.6b-all`, que a su vez es un ajuste fino de `nvidia/parakeet-tdt-0.6b-v3`. El resultado son 627.057.286 parámetros en formato safetensors, con coste de inferencia idéntico al de un único modelo.

El modelo se enmarca en la Speech Accessibility Project Challenge y su propósito es la investigación sobre reconocimiento de habla atípica (disartria, ataxia) y la accesibilidad de tecnologías de voz. La decisión de promediar épocas responde a que el run original no reservó ningún conjunto de validación (*dev manifest*), por lo que no había forma de clasificar sus checkpoints; promediar evita elegir una época concreta sin criterio.

Su característica más importante es también su mayor advertencia: no existe ni puede existir una evaluación con datos retenidos, porque el run base entrenó con todas las horas disponibles, incluido el split `dev` de SAPC2 que el resto de la familia usa para evaluarse. La única evidencia de mejora es indirecta: en un run hermano (RNN-T, no TDT, y con otro corpus) el mismo *soup* de cinco épocas ganó 0.27 puntos de CER (6.06 % frente a 6.33 % de la mejor época individual).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer TDT (Token-and-Duration Transducer), variante de RNN-T; red de prediccion LSTM confirmada por los tensores (`decoder.lstm.weight_ih_l0`) |
| Parametros totales | 627.057.286 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio; el README no documenta un limite de duracion de audio en inferencia) |
| Tipos de cuantizacion | No disponible (el repositorio distribuye safetensors; no se documentan recetas GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles unicamente |
| Licencia | Other — Speech Accessibility Project Data Use Agreement (`speech-accessibility-project-dua`) |
| Formato de pesos | safetensors (723 tensores), tamano de repo 2.5 GB |
| Entrada de audio | 16 kHz mono |
| Libreria requerida | `transformers>=5.9` (no cargable en la linea 4.x) |
| Modelo base | `nvidia/parakeet-tdt-0.6b-v3` |
| Pipeline | automatic-speech-recognition / feature-extraction |

## Arquitectura y entrenamiento

El modelo es un transducer TDT, es decir, una arquitectura encoder–decoder con red conjunta en la que el decodificador predice simultáneamente el token y su duración, en lugar de la formulación clásica de RNN-T. La decodificación es autorregresiva y, según el propio autor, más lenta que un enfoque CTC. Los tensores publicados revelan una red de predicción basada en LSTM con una capa BatchNorm cuyos pesos se han tratado de forma específica durante el *soup*: los tensores en coma flotante se promedian en float64 y se vuelven a convertir, mientras que el contador entero `num_batches_tracked` de BatchNorm se propaga como máximo en lugar de como media (el contador solo se lee si `momentum=None`, algo que las capas de Parakeet no hacen, por lo que el efecto en inferencia es nulo). El *soup* se construye y guarda en CPU deliberadamente: cuDNN aplana los pesos del LSTM en un único buffer en la primera ejecución sobre CUDA, lo que deja tensores compartiendo almacenamiento y provoca que safetensors escriba un fichero que luego no puede leer.

El modelo no añade entrenamiento alguno. Hereda íntegramente los datos del run base: 1.047,7 horas repartidas en 491.063 registros tras el filtrado, que comprenden los splits de entrenamiento y `dev` de SAPC1, el split de entrenamiento de SAPC2, el split `dev` de SAPC2 que el resto de la familia usa como evaluación, 103,1 horas de voz sintética generada con CosyVoice, 79,2 horas de fragmentos extraídos mediante alineamiento forzado de grabaciones que superaban el límite de 45 segundos, y 15,5 horas de HeyJay! y AtaxiaUK, corpus ajenos a la competición. Esta última partida convierte al modelo en participante de la pista no restringida (*unconstrained track*), algo que versiones anteriores de la model card omitían. No se documenta RLHF, DPO ni ningún ajuste por preferencias.

## Capacidades

- Transcripción de voz a texto en inglés (ASR) sobre audio de 16 kHz mono.
- Reconocimiento de habla atípica o con trastornos: disartria, ataxia y otras condiciones asociadas al corpus Speech Accessibility Project.
- Extracción de características acústicas (etiqueta `feature-extraction` en el repositorio).
- Salida normalizada: texto en minúsculas, sin puntuación y con los numerales escritos como palabras.
- Inferencia por lotes a través de `ParakeetForTDT` y `AutoProcessor` de Transformers.
- No se documenta soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso, visión, audio generativo ni modo de razonamiento explícito.
- No se documenta capacidad multilingüe: el modelo es exclusivamente inglés.

## Casos de uso

- Investigación en reconocimiento de habla atípica: el modelo está pensado explícitamente como entrada de competición y como herramienta de estudio sobre disartria y ataxia, no como producto final. Aporta un punto de partida ya ajustado sobre corpus clínicos de voz.
- Transcripción de entrevistas o sesiones clínicas con hablantes con trastornos del habla, siempre que se trate de uso exploratorio y nunca como base para inferencias diagnósticas (el propio autor lo prohíbe explícitamente).
- Generación de subtítulos para contenidos accesibles protagonizados por hablantes con disartria, aceptando la ausencia de puntuación y mayúsculas en la salida, que habría que reconstruir en una etapa posterior.
- Aumento de datos (data augmentation) para pipelines de ASR: transcripciones automáticas de material sin etiquetar de los corpus SAPC, que luego se revisan manualmente.
- Construcción de métricas de referencia internas: al no existir evaluación válida para este checkpoint, puede usarse como generador de hipótesis para comparar contra otros sistemas en un conjunto de prueba propio y externo.
- Integración en aplicaciones de accesibilidad en tiempo real sobre GPU de consumo: con 0,6B parámetros cabe en tarjetas modestas, lo que permite desplegar transcripción local sin enviar audio clínico a la nube.
- Prototipado y *benchmarking* de la arquitectura TDT frente a CTC en dominios de habla no estándar, aprovechando que el coste de inferencia equivale al de un único modelo pese a ser un promedio de cinco.
- Reproducción de experimentos de *model souping* sobre recetas de ajuste fino de Parakeet, ya que el repositorio documenta los pasos y números de época y paso de cada ingrediente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica de forma explícita que este modelo **no tiene y no puede tener WER ni CER reportados**, porque el run del que procede entrenó con todos los datos retenidos del proyecto, incluido el split `dev` de SAPC2. Cualquier puntuación calculada sobre SAPC1 `dev` o SAPC2 `dev` sería una puntuación sobre datos de entrenamiento.

La única cifra disponible es indirecta y procede de otro run:

| Comparacion | Modelo | CER |
|---|---|---|
| Soup de las epocas 6-10 (run hermano, RNN-T, otro corpus) | soup | 6.06 % |
| Mejor epoca individual (epoca 9) del run hermano | single checkpoint | 6.33 % |
| Epoca 10 frente a epoca 9 en el run hermano | single checkpoint | 6.09 % frente a 6.06 % |

El propio autor cualifica esta evidencia: diferencia de 0,27 puntos, procedente de una arquitectura distinta (RNN-T en lugar de TDT) y de un corpus distinto, y basada en una sola comparación, no en una tendencia. Nada confirma que se transfiera a este run TDT.

## Requisitos de hardware

- VRAM estimada: en fp32 los pesos ocupan aproximadamente 2,5 GB (coincide con el tamano del repo), a los que hay que sumar activaciones, buffers de cuDNN y audios de entrada; en fp16/bf16 el peso baja a unos 1,25 GB. El modelo hace `float64` solo durante la construcción del *soup*, no en inferencia.
- Cabe sin problemas en GPU de consumo: cualquier tarjeta con 4 GB o mas de VRAM (RTX 3050, RTX 3060, RTX 4060, RTX 4090) es suficiente, y en CPU es viable aunque lento.
- GPU recomendadas para produccion o lotes grandes: A100, H100, L40S o RTX 4090; para uso individual, cualquier GPU moderna con al menos 4-6 GB libres.
- Opciones de despliegue: el README solo documenta la ruta de `transformers>=5.9` con `ParakeetForTDT` y `AutoProcessor`. No se mencionan vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, y al no haber pesos GGUF la ruta llama.cpp/Ollama no esta disponible tal cual.
- Latencia y throughput: no disponibles. El autor solo senala cualitativamente que la decodificacion es autorregresiva y por tanto mas lenta que CTC.
- Dependencias: `torch`, `transformers>=5.9`, `soundfile` en el ejemplo oficial. El audio debe ser 16 kHz mono.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Evaluacion publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dys-asr/parakeet-tdt-0.6b-all-soup` (este) | 627.057.286 | 16 kHz mono, ingles | Ninguna, y no puede haberla (entrena con los splits `dev`) | Speech Accessibility Project DUA | HuggingFace, safetensors |
| `dys-asr/parakeet-tdt-0.6b-all` (ingrediente) | No disponible | 16 kHz mono, ingles | Ninguna; pesos publicados = epoca 10 por ser la ultima | Speech Accessibility Project DUA | HuggingFace |
| Run hermano RNN-T de la misma familia (mencionado en la card) | No disponible | 16 kHz mono, ingles | Si, sobre un subconjunto de 48 hablantes de SAPC2 `dev` no visto en entrenamiento | No disponible | No disponible |
| `nvidia/parakeet-tdt-0.6b-v3` (modelo base) | 0,6B (segun nomenclatura) | 16 kHz mono, multilingue segun el modelo base | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace |

Advertencia del autor: este checkpoint **no es comparable con sus hermanos**, porque ellos reportan sobre un subconjunto de 48 hablantes de SAPC2 `dev` que nunca vieron durante el entrenamiento, mientras que este si lo ha visto.

## Limitaciones y advertencias

- No existe ni puede existir una evaluacion con datos retenidos: el run base entreno con SAPC1 `dev` y SAPC2 `dev`. Cualquier metrica calculada sobre ellos es una metrica sobre entrenamiento.
- No es comparable con los demas modelos de la familia `dys-asr`, que si reservan un subconjunto de evaluacion.
- La justificacion de mejora (+0,27 puntos de CER) esta tomada de un run distinto (RNN-T, otro corpus) y no hay confirmacion de que se transfiera a este run TDT.
- Hereda todas las limitaciones de su ingrediente, incluida la de que su seleccion de epoca nunca fue validada.
- Un solo run y una sola semilla: promediar cinco epocas de una misma trayectoria no equivale a promediar cinco semillas, y no dice nada sobre lo segundo.
- Entrenado parcialmente con datos fuera de los corpus de la competicion (15,5 horas de HeyJay! y AtaxiaUK), lo que lo situa en la pista no restringida.
- Salida en minusculas, sin puntuacion y con numerales escritos como palabras; requiere post-procesado para la mayoria de aplicaciones.
- Solo ingles y solo audio de 16 kHz mono.
- Requiere `transformers>=5.9`; no carga en la linea 4.x.
- Decodificacion autorregresiva, mas lenta que CTC.
- No es una herramienta clinica: nada en el modelo permite inferir diagnosticos, y el autor lo senala de forma explicita.
- Licencia `speech-accessibility-project-dua`: los corpus SAP estan sujetos a su propio acuerdo de uso de datos y no se redistribuyen. Reproducir el conjunto de entrenamiento exige acceso autorizado. Los terminos de Fun-CosyVoice3 aplican al componente de sintesis usado para generar las 103,1 horas de voz sintetica.
- Riesgo de sesgo: el modelo esta ajustado sobre los corpus SAP, con la distribucion de hablantes, condiciones de grabacion y patologias que estos contienen; no hay informacion disponible sobre el equilibrio demografico de esos datos.
- Riesgo de alucinacion: no se documenta, pero al ser un sistema ASR con decodificacion autorregresiva existe el riesgo habitual de sustituciones y omisiones en audio ruidoso o fuera de dominio; no hay datos publicados que lo cuantifiquen para este checkpoint.
- El modelo tiene 16 descargas y 0 likes, y es un artefacto de competicion de septiembre de 2026; no hay evidencia de uso en produccion ni mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dys-asr/parakeet-tdt-0.6b-all-soup
- Modelo ingrediente (run all-data): https://huggingface.co/dys-asr/parakeet-tdt-0.6b-all
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Corpus SAPC1: https://huggingface.co/datasets/dys-asr/sapc1
- Corpus SAPC2: https://huggingface.co/datasets/dys-asr/sapc2
- Licencia y condiciones del proyecto: https://speechaccessibilityproject.beckman.illinois.edu/
- Las busquedas web realizadas no devolvieron resultados relevantes: los enlaces encontrados corresponden a federaciones y divulgacion sobre trastornos del aprendizaje ("troubles dys") en Francia y no guardan relacion con este modelo ni con el reconocimiento de habla.
