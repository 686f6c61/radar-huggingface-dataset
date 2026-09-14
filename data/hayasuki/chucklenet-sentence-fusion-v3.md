# Hayasuki/chucklenet-sentence-fusion-v3

## Resumen

ChuckleNet Sentence Fusion v3 es un modelo de predicción de la intensidad del humor a nivel de frase que combina texto y audio. Lo desarrolla el usuario Hayasuki y se publica bajo licencia MIT en Hugging Face. No es un modelo generativo: su única salida es una puntuación de humor entre 0 y 100 para un fragmento de audio de stand-up y su transcripción. El repositorio contiene exclusivamente la cabeza de fusión entrenada (un MLP); los codificadores de texto y audio se cargan por separado desde `roberta-base` y `microsoft/wavlm-base-plus`.

La arquitectura es una fusión tardía: RoBERTa-base extrae un vector de 768 dimensiones del `pooler_output` sobre las últimas 12 palabras de la frase, WavLM-base-plus extrae un vector de 512 dimensiones promediando las características de los últimos 6 segundos de audio, y ambos se concatenan en un MLP de tres capas (1280 → 256 → 64 → 1) cuya salida pasa por una sigmoide y se escala a 0-100. El modelo cuenta con aproximadamente 220 millones de parámetros en total (125 M de RoBERTa-base y 94 M de WavLM-base-plus) más unos 0,34 M de la cabeza de fusión.

Su relevancia es fundamentalmente metodológica y de nicho: dentro del propio proyecto, la fusión a nivel de frase supera al modelo solo-texto en +0,035 AUC y al etiquetado a nivel de palabra en +0,069 AUC, lo que respalda la hipótesis de que las señales prosódicas relevantes para el humor (risas, pausas, cambios de tono) abarcan límites de frase y se pierden con ventanas centradas en la palabra. El modelo tiene 0 descargas y 0 likes, y el tamaño del repositorio es de 0,0 GB (solo el `pytorch_model.bin` de la cabeza).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fusion tardia multimodal: RoBERTa-base (texto) + WavLM-base-plus (audio) + cabeza MLP (1280→256→64→1) |
| Parametros totales | Aproximadamente 220 M (125 M de RoBERTa-base + 94 M de WavLM-base-plus) mas unos 0,34 M de la cabeza de fusion |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Texto: truncado a 64 tokens, usando solo las ultimas 12 palabras. Audio: ultimos 6 segundos |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state_dict PyTorch de la cabeza de fusion); los codificadores se cargan desde `roberta-base` y `microsoft/wavlm-base-plus` |
| Tarea | Prediccion de intensidad de humor (regresion, salida 0-100) |
| Metricas declaradas | AUC, F1 |
| Dataset de entrenamiento | `subhajitdas/chuckle-fusion-48v-v3` |

## Arquitectura y entrenamiento

El modelo es una fusion tardia (late fusion) de dos codificadores preentrenados congelados o reutilizados mas una cabeza entrenada. La rama de texto usa RoBERTa-base y toma el `pooler_output` de 768 dimensiones; la rama de audio usa WavLM-base-plus y calcula la media de `extract_features` sobre el eje temporal, obteniendo 512 dimensiones. La concatenacion (1280 dimensiones) atraviesa un MLP con capas de 256 y 64 unidades, activaciones ReLU y dropout de 0,3 y 0,2 respectivamente, y una capa final de una unidad. La salida es un logit crudo al que se aplica una sigmoide y se multiplica por 100.

Los datos de entrenamiento proceden de 47 audios de StandUpNet (aproximadamente 3,5 horas en MP3 a 48 kHz). Se aplico alineacion forzada con `gentle` para obtener marcas temporales y etiquetas a nivel de palabra; los limites de frase se definieron con un criterio de separacion superior a 0,5 segundos entre palabras consecutivas. El resultado son 22.282 clips de frase de 47 videos, con un 33,5 % de ejemplos positivos. La particion de entrenamiento usa 30 videos con 150 clips cada uno (4.403 muestras) y la de validacion 6 videos. No se documenta el uso de RLHF, DPO ni ningun otro ajuste por preferencias, algo coherente con que el modelo no sea generativo.

La innovacion tecnica declarada es el nivel de granularidad de la fusion: en lugar de etiquetar palabras individuales con una ventana de audio de ±750 ms (enfoque de la version v2), se etiqueta la frase completa y se le asocia la ventana de audio de los ultimos 6 segundos, lo que permite capturar patrones prosodicos que cruzan fronteras de frase.

## Capacidades

- Prediccion de la intensidad del humor de un fragmento de audio de comedia con su transcripcion, en una escala continua de 0 a 100.
- Procesamiento multimodal conjunto de texto (transcripcion) y audio (forma de onda a 16 kHz) en una misma puntuacion.
- Extraccion de representaciones de texto (768 dimensiones) y de audio (512 dimensiones), reutilizables por separado para otras tareas de analisis.
- Funcionamiento a nivel de frase, con soporte para clips de audio de al menos 6 segundos.
- Uso en inferencia pura: no genera texto, no admite tool calling ni function calling, no tiene modo de razonamiento ni capacidades de agente.
- Soporte multilingue: no disponible; el modelo esta entrenado y documentado unicamente para ingles.
- Capacidades de vision o de audio generativo: no disponibles.

## Casos de uso

- Anotacion automatica de corpus de comedia: dado un audio de stand-up y su transcripcion alineada, el modelo puntua cada frase y permite construir datasets etiquetados por intensidad de humor, reduciendo el trabajo manual de anotacion en investigacion sobre humor computacional.
- Segmentacion y ranking de clips para plataformas de video: se divide un monologo en frases y se ordenan por puntuacion para generar resumenes de "mejores momentos" o clips cortos, aprovechando que el modelo trabaja con ventanas de audio de 6 segundos.
- Filtrado previo en sistemas de recomendacion de contenido comico: el score 0-100 puede usarse como caracteristica adicional en un ranker que decida que fragmentos promocionar, siempre dentro del dominio de comedia en ingles.
- Investigacion en prosodia y humor: al exponer por separado las representaciones de texto y audio, permite analizar cuanto de la prediccion depende de la senal acustica frente al contenido verbal, comparando con la variante solo-texto.
- Control de calidad en doblaje o subtitulado de comedia: se puede comparar la puntuacion de humor del audio original frente a la de una version doblada o sintetizada para detectar perdida de efecto comico.
- Moderacion asistida de contenido humoristico: como senal auxiliar en pipelines que revisan monologos o podcasts, marcando fragmentos con alta carga de humor para revision humana, sin sustituir un clasificador de contenido danino.
- Evaluacion de guiones o material generado: dado un audio de prueba de un guion comico y su transcripcion, el modelo sirve como metrica automatica de "gracia" preliminar antes de una prueba con audiencia real.

## Benchmarks y rendimiento

Los unicos datos publicados son las AUC de validacion del propio proyecto, recogidas en la model card:

| Modelo | AUC en validacion | Notas |
|---|---|---|
| TF-IDF + Ridge (baseline) | 0,277 | N-gramas de palabras |
| RoBERTa solo-texto (v7) | 0,566 | 128 tokens, `pooler_output` |
| Fusion a nivel de palabra (v2) | 0,532 | Ventana de audio de ±750 ms alrededor de la palabra |
| Fusion a nivel de frase (v3) | 0,601 | Ultimos 6 s de audio + ultimas 12 palabras |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que la tarea no es de generacion ni de razonamiento general.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos de los dos codificadores mas la cabeza ocupan aproximadamente 0,9 GB, por lo que con activaciones y buffers de audio el consumo realista se situa en torno a 2-3 GB. En fp16 se reduce a aproximadamente 0,5 GB de pesos.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente. Una RTX 3060, RTX 4060 o superior funcionan con margen amplio; A100 o H100 solo tendrian sentido para procesar grandes volumenes en lote.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (GTX 1060 6 GB, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU, dado el reducido tamano del modelo.
- Opciones de despliegue: PyTorch nativo con `transformers` y `torchaudio`, tal como muestra la model card. Exportacion a ONNX o TorchScript seria viable pero no esta documentada. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo ni se distribuye en formato GGUF.
- Latencia y throughput estimados: no disponibles. La inferencia requiere cargar dos modelos base ademas de la cabeza, por lo que el coste dominante es el paso por RoBERTa y WavLM, no el MLP.

## Comparativa con modelos similares

No se han identificado modelos de terceros comparables en la informacion disponible, dado lo especifico de la tarea (regresion de intensidad de humor multimodal texto-audio). La comparacion mas significativa es interna al propio proyecto:

| Modelo | Modalidad | AUC en validacion | Licencia |
|---|---|---|---|
| TF-IDF + Ridge (baseline) | Solo texto | 0,277 | No disponible |
| RoBERTa solo-texto (v7) | Solo texto | 0,566 | MIT (proyecto) |
| Fusion a nivel de palabra (v2) | Texto + audio | 0,532 | MIT (proyecto) |
| ChuckleNet Sentence Fusion v3 | Texto + audio | 0,601 | MIT |

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente con audio de comedia transcrito, por lo que no hay garantia de generalizacion a otros dominios (reuniones, podcasts no comicos, conversacion espontanea).
- Requiere audio de al menos 6 segundos; con clips mas cortos el rendimiento se degrada porque la ventana de audio se rellena con ceros.
- No incorpora diarizacion de hablantes: asume audio de un unico hablante, lo que puede producir resultados incorrectos en grabaciones con varias voces o con publico y comico mezclados.
- El texto se limita a las ultimas 12 palabras y a 64 tokens, de modo que el contexto verbal previo se descarta por completo.
- Rendimiento absoluto modesto: una AUC de 0,601 en validacion esta muy por encima del azar, pero lejos de un clasificador fiable para produccion sin supervision humana.
- Riesgo de sesgo de dominio y de anotador: las etiquetas derivan de un unico corpus y de una alineacion automatica, lo que puede introducir ruido y sesgos hacia el estilo concreto de los 47 videos utilizados.
- Repositorio practicamente vacio en cuanto a adopcion: 0 descargas y 0 likes, con tamano de repo de 0,0 GB (solo la cabeza), sin garantias de mantenimiento ni versionado posterior.
- Restricciones de licencia: la licencia es MIT, permisiva y compatible con uso comercial, pero los pesos base de RoBERTa-base y WavLM-base-plus mantienen sus propias licencias, que conviene revisar antes de un despliegue comercial.
- La documentacion no especifica cuantizaciones, formato safetensors ni pipeline declarado en Hugging Face (`pipeline: no disponible`), lo que complica la integracion directa con ecosistemas estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hayasuki/chucklenet-sentence-fusion-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/subhajitdas/chuckle-fusion-48v-v3
- Codificador de texto base: https://huggingface.co/roberta-base
- Codificador de audio base: https://huggingface.co/microsoft/wavlm-base-plus
- Paper, repositorio de codigo o demo: no disponibles
- Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (guias de viaje de Zurich); no se ha encontrado documentacion externa, articulo tecnico ni hilo de discusion sobre ChuckleNet Sentence Fusion v3.
