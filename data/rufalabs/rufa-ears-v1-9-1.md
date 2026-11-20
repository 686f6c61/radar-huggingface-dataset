# rufalabs/rufa-ears-v1.9.1

## Resumen

Rufa ears v1.9.1 es un modelo de reconocimiento automático del habla (ASR) desarrollado por rufalabs, derivado de Whisper y especializado en luxemburgués (código ISO `lb`), con soporte adicional para alemán, francés e inglés. Se trata de un ajuste fino de la versión v1.9 (identificador `rufalabs/rufa-ears-v1.9`, commit `a0dc7e27`) orientado específicamente a mejorar la transcripción de nombres propios y palabras concretas en la ronda de evaluación interna denominada "Listener-1".

El modelo tiene 808.878.080 parámetros (aproximadamente 809 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 1,6 GB. La model card lo etiqueta explícitamente como "candidate" (candidato): la versión en producción sigue siendo v1.9 hasta que el propietario decida adoptar v1.9.1 o esperar a la siguiente ronda v1.9.2. Su relevancia radica en que aborda uno de los problemas clásicos del ASR en lenguas de bajos recursos: la correcta transcripción de entidades nombradas (nombres de personas, topónimos, marcas), donde los modelos genéricos fallan con frecuencia.

La licencia es `other` (no estándar), lo que obliga a revisar los términos concretos antes de cualquier uso comercial. El modelo está pensado para un pipeline de producción interno de rufalabs y no como un modelo generalista de ASR multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para ASR), según el tag `whisper` del repositorio |
| Parametros totales | 808.878.080 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | luxemburgués (`lb`), alemán (`de`), francés (`fr`), inglés (`en`) |
| Licencia | other (licencia no estándar, revisar términos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper de OpenAI, un transformer encoder-decoder diseñado para transcripción y traducción de voz. Rufa ears v1.9.1 no se entrena desde cero: es un "weight blend" (mezcla de pesos) que combina un 70 % de un modelo ajustado sobre v1.9 y un 30 % de los pesos originales de v1.9. El ajuste fino se realizó con el encoder congelado, una penalización KL hacia v1.9 con factor x2, 1500 pasos de entrenamiento y una tasa de aprendizaje de 1e-6. Este esquema de entrenamiento ligero busca preservar el comportamiento general de v1.9 mientras se corrige el sesgo hacia un conjunto específico de nombres y palabras ("Listener-1 names/words round", identificado internamente como `l1a70`).

La innovación principal no está en la arquitectura sino en la estrategia de ajuste: el uso de destilación por divergencia KL contra el modelo base, junto con el congelado del encoder, limita el olvido catastrófico y mantiene el rendimiento en el resto de dominios (reuniones, telefonía, conjuntos multilingües FLEURS). La model card menciona además una "production-path decoding" que incluye un mecanismo de reintento ante bucles ("runaway retry"), un detalle de implementación del pipeline de decodificación más que del modelo en sí.

## Capacidades

- Transcripción de voz a texto (ASR) en luxemburgués, alemán, francés e inglés.
- Reconocimiento mejorado de nombres propios y palabras específicas: la tasa de acierto de palabras en Listener-1 sube de 52,1 a 68,3, y con prompt de nombres el WER baja de 50,7 a 5,9.
- Manejo de audio telefónico y de reuniones: el rendimiento en `robust_phone` se mantiene estable (17,07 a 16,90) y los conjuntos de reuniones, `phone_sim` y FLEURS de/fr/en/es/it/nl/pt quedan dentro del ruido estadístico.
- Soporte multilingüe limitado a los cuatro idiomas declarados; no se documentan capacidades de traducción, diarización, timestamps a nivel de palabra ni tool calling.
- No se documentan capacidades de razonamiento, código, matemáticas, visión ni agentes: es un modelo exclusivamente de voz.

## Casos de uso

- Transcripción de reuniones internas en luxemburgués: el modelo mantiene el rendimiento de v1.9 en el conjunto de reuniones y añade mejor cobertura de nombres de participantes, lo que reduce las correcciones manuales en actas.
- Atención al cliente telefónica: con un rendimiento estable en `robust_phone` (16,90 de WER en la ruta de producción), es adecuado para transcribir llamadas con ruido de canal telefónico.
- Dictado de nombres y entidades en entornos administrativos: la mejora de 50,7 a 5,9 de WER con prompt de nombres lo hace útil en formularios y registros donde los nombres propios son críticos.
- Subtitulado de contenido audiovisual multilingüe (de/fr/en/lb): permite generar subtítulos en los cuatro idiomas declarados, aunque sin datos públicos de calidad fuera del dominio evaluado.
- Indexación y búsqueda de archivos de audio: al transcribir con mayor precisión nombres y términos concretos, mejora la recuperación en buscadores sobre grabaciones históricas.
- Evaluación comparativa de sistemas ASR en luxemburgués: sirve como referencia interna para medir mejoras entre versiones (v1.6, v1.9, v1.9.1) en la página de benchmarks de rufalabs.

## Benchmarks y rendimiento

Los datos disponibles provienen de la evaluación interna del autor contra v1.9 (2026-11-19), con decodificación de la ruta de producción:

| Metrica | v1.9 | v1.9.1 |
|---|---|---|
| Listener-1 word hit (global) | 52,1 | 68,3 |
| Listener-1 word hit (fold enseñado) | 41 | 75 |
| Listener-1 word hit (held-out) | 48,5 | 50,0 |
| Nombres con prompt (pilot340 C), WER | 50,7 | 5,9 |
| Nombres con prompt, item hit | 75,3 | 85,8 |
| robust_phone (ruta de producción) | 17,07 | 16,90 |
| robust_phone (greedy gate) | 17,07 | 20,81 |
| streets (item hit) | — | -1 de 39 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo ASR. La página de benchmarks de rufalabs compara versiones de Rufa Ears entre sí y con otros modelos en luxemburgués, pero no se dispone de las cifras concretas de esa comparación.

## Requisitos de hardware

- VRAM estimada para inferencia: con 809 millones de parámetros, en fp16 requiere aproximadamente 1,6 GB de pesos más memoria de activaciones; en cuantización de 8 bits rondaría 0,8-1 GB y en 4 bits unos 0,4-0,5 GB (estimación a partir del tamaño, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia cómoda. Para lotes grandes o baja latencia, A100 o H100 no son necesarias pero aceleran el throughput.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas (GTX 1660 en adelante con cuantización, RTX 3060/4060/4090 sin problemas en fp16).
- Opciones de despliegue: al ser un modelo Whisper en safetensors, es compatible con el ecosistema habitual de Whisper (transformers, faster-whisper, whisper.cpp tras conversión a GGUF), aunque el autor no documenta ninguna opción concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rufa ears v1.9.1 | 808,9 M | lb, de, fr, en | no disponible | other | Hugging Face |
| Whisper large-v3 (OpenAI) | 1.550 M | multilingüe (99 idiomas) | 30 s de audio por ventana | MIT | Hugging Face, amplia adopción |
| Whisper medium (OpenAI) | 769 M | multilingüe (99 idiomas) | 30 s de audio por ventana | MIT | Hugging Face |
| Rufa ears v1.9 (versión anterior) | no disponible | lb, de, fr, en | no disponible | other | Hugging Face |

La comparación directa con Whisper medium es la más pertinente por tamaño (769 M frente a 809 M), pero Rufa ears está especializado en luxemburgués y no cubre los 99 idiomas de Whisper. No se dispone de cifras públicas de rendimiento de Whisper en luxemburgués en la información proporcionada, por lo que no es posible cuantificar la ventaja.

## Limitaciones y advertencias

- Estado "candidate": el autor indica explícitamente que producción sigue en v1.9 hasta que se decida adoptar v1.9.1 o esperar a v1.9.2; no debe desplegarse sin validación propia.
- Sesgo hacia el conjunto de evaluación: la mejora en el "fold enseñado" (41 a 75) es mucho mayor que en el held-out (48,5 a 50,0), lo que sugiere sobreajuste a los nombres y palabras del conjunto de entrenamiento; la generalización a nombres no vistos es limitada.
- Regresión en decodificación greedy: en el "greedy gate" el WER de `robust_phone` empeora de 17,07 a 20,81, con dos clips en bucle que solo se rescatan mediante el reintento de la ruta de producción; sin ese mecanismo, el rendimiento puede degradarse.
- Cobertura lingüística restringida a lb, de, fr, en; no se documentan resultados para español, italiano, neerlandés o portugués más allá de que quedan "dentro del ruido" en FLEURS.
- Licencia `other`: no es una licencia estándar (MIT, Apache, etc.); es imprescindible revisar los términos antes de cualquier uso comercial o redistribución.
- Riesgo de alucinación y bucles en decodificación: la propia model card menciona clips en bucle en modo greedy, un problema conocido de Whisper en audios con silencios o ruido.
- Sin datos de sesgos demográficos ni de robustez ante acentos distintos del luxemburgués estándar.
- Sin información sobre cuantizaciones soportadas ni sobre el contexto máximo de audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rufalabs/rufa-ears-v1.9.1
- Modelo base v1.9: https://huggingface.co/rufalabs/rufa-ears-v1.9
- Benchmarks de rufalabs en luxemburgués: https://rufalabs.ai/benchmarks
