# flyingfishinwater/DeepFilterNet-mlx

## Resumen

DeepFilterNet-mlx es una conversión a formato MLX de los pesos oficiales del framework DeepFilterNet, un sistema de mejora de voz (speech enhancement) orientado a la supresión de ruido de fondo en audio de banda completa a 48 kHz. Lo publica el usuario flyingfishinwater en Hugging Face y contiene las tres generaciones del modelo original (v1, v2 y v3) desarrolladas por Hendrik Schroeter y colaboradores, con licencia MIT. No se trata de un modelo generativo de lenguaje ni multimodal: es un modelo de audio-a-audio especializado en limpieza de señal de voz.

La relevancia de esta ficha es doble. Por un lado, DeepFilterNet es una de las referencias en supresión de ruido de baja complejidad computacional, diseñada para funcionar en tiempo real incluso en dispositivos embebidos. Por otro, esta conversión permite ejecutar los tres checkpoints en Apple Silicon mediante MLX, con pesos numéricamente idénticos a los originales de PyTorch (sin fine-tuning ni cuantización), lo que abre su uso en aplicaciones nativas de macOS e iOS.

El modelo opera sobre tramas de 480 muestras (10 ms a 48 kHz), con FFT de 960 y un esquema de filtrado profundo de orden 5 sobre 96 bins. Los pesos son muy ligeros (entre 7,2 MB y 8,9 MB en float32 según versión), lo que lo hace apto para procesamiento en CPU y en hardware de gama baja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional-recurrente con filtrado profundo en el dominio complejo (deep filtering) y enmascarado de ganancia por bandas ERB; no es un transformer ni un MoE |
| Parametros totales | No disponible de forma explicita; estimacion derivada del tamano de los pesos en float32: ~1,8 M (v1), ~2,2 M (v2), ~2,1 M (v3) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de contexto de texto; procesa tramas de 480 muestras (10 ms a 48 kHz) y puede operar en modo streaming |
| Tipos de cuantizacion | Ninguna. Los pesos se distribuyen en float32 y son numericamente identicos a los checkpoints originales de PyTorch |
| Idiomas soportados | No disponible / no aplica: la mejora de voz es agnostica al idioma, no se documenta un listado de idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (un `model.safetensors` por version, con su `config.json`), libreria MLX |

Parametros de audio compartidos por las tres versiones:

| Parametro | Valor |
|---|---|
| Frecuencia de muestreo | 48 kHz |
| Tamano de FFT | 960 |
| Hop size | 480 |
| Bandas ERB | 32 |
| Bins de filtrado profundo (DF) | 96 |
| Orden de filtrado profundo (DF order) | 5 |

Dimension del embedding oculto por version:

| Version | Dimension oculta | Pesos | Paper |
|---|---|---|---|
| DeepFilterNet v1 | 512 | ~7,2 MB (float32) | arXiv:2110.05588 |
| DeepFilterNet v2 | 256 | ~8,9 MB (float32) | arXiv:2205.05474 |
| DeepFilterNet v3 | 256 | ~8,3 MB (float32) | arXiv:2305.08227 |

## Arquitectura y entrenamiento

DeepFilterNet es un framework de mejora de voz de baja complejidad que combina dos etapas: una primera etapa de enmascarado de ganancia sobre bandas ERB (32 bandas), seguida de una etapa de filtrado profundo que opera sobre 96 bins de frecuencia del espectro complejo con orden 5. Esta segunda etapa es la que da nombre al modelo y permite recuperar detalle espectral fino que un simple enmascarado de magnitud no conserva. El esquema de codificacion emplea representaciones tipo ERB como entrada a un codificador convolucional que alimenta capas recurrentes (GRU) encargadas de modelar la evolucion temporal, con un embedding oculto de 512 dimensiones en v1 y de 256 en v2 y v3.

La informacion proporcionada no detalla el numero de tokens de audio, la composicion exacta del dataset de entrenamiento ni si se emplearon tecnicas de ajuste por preferencias (RLHF/DPO). Tampoco se documenta un proceso de fine-tuning adicional en esta conversion: el autor indica explicitamente que los pesos son el resultado de una conversion directa de los checkpoints de PyTorch a safetensors, sin cuantizacion ni entrenamiento posterior. La innovacion tecnica principal del framework es precisamente la combinacion de enmascarado ERB de baja resolucion con filtrado profundo de banda completa, que reduce el coste computacional manteniendo la calidad perceptual, tal y como describen los tres articulos de referencia (ICASSP 2022, IWAENC 2022 e INTERSPEECH 2023).

La conversion a MLX se realiza mediante el script incluido `convert_deepfilternet.py`, que requiere `torch` y `mlx` instalados y toma como entrada los directorios con `config.ini` y carpeta `checkpoints/` del repositorio original.

## Capacidades

- Supresion de ruido de fondo en voz: elimina ruido estacionario y no estacionario de grabaciones de voz a 48 kHz de banda completa.
- Mejora de voz de banda completa: el esquema de filtrado profundo preserva informacion espectral de alta frecuencia, a diferencia de aproximaciones basadas solo en enmascarado de magnitud.
- Inferencia en tiempo real: el diseno esta orientado a baja latencia, con tramas de 10 ms (hop size de 480 muestras a 48 kHz) aptas para procesamiento en streaming.
- Ejecucion en dispositivos embebidos: los articulos de v2 y v3 apuntan explicitamente a despliegue en hardware de baja potencia; el tamano de pesos (menos de 10 MB) es coherente con ese objetivo.
- Ejecucion en Apple Silicon: los pesos estan adaptados a MLX, con API en Python (`mlx_audio.sts.models.deepfilternet.DeepFilterNetModel`) y en Swift (`MLXAudioSTS`).
- Seleccion de version: se pueden cargar las tres generaciones de forma independiente mediante el parametro `subfolder` (`v1`, `v2`, `v3`), con v3 como opcion por defecto.
- Audio-a-audio como tarea declarada en el pipeline de Hugging Face.

No se documentan en la informacion disponible capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking. Tampoco se documenta soporte multilingue en el sentido de procesamiento de idiomas: el modelo no transcribe ni traduce, solo mejora la senal de voz.

## Casos de uso

- Videollamadas y reuniones en tiempo real: el modelo puede integrarse en el pipeline de captura de audio para limpiar la senal del microfono trama a trama (10 ms), ya que su diseno de baja latencia y su tamano reducido permiten ejecucion en tiempo real sin GPU dedicada.
- Preprocesado para sistemas de reconocimiento automatico de voz (ASR): aplicar DeepFilterNet antes de un modelo tipo Whisper reduce el ruido de fondo y suele mejorar la tasa de error de palabra en entornos ruidosos; al operar a 48 kHz se puede remuestrear a la frecuencia esperada por el ASR.
- Limpieza de pistas de voz en produccion de podcast y locucion: permite recuperar grabaciones hechas en entornos no tratados acusticamente, aplicando la version v3 (INTERSPEECH 2023, con motivacion perceptual) para obtener resultados mas naturales.
- Postproduccion de audio en video: limpieza de dialogos grabados en exterior o en localizaciones con ruido de fondo antes de la mezcla final, ejecutable en un Mac sin necesidad de acelerador grafico.
- Aplicaciones moviles y de escritorio en el ecosistema Apple: gracias a MLX y a la API de `mlx-audio-swift`, la mejora de voz puede ejecutarse en local dentro de apps de macOS e iOS, sin enviar audio a servicios externos, lo que simplifica el cumplimiento de privacidad.
- Dispositivos embebidos y auriculares con cancelacion de ruido: las versiones v2 y v3 estan pensadas para despliegue en hardware de baja potencia; el modelo puede embeberse en firmware para mejorar la voz captada por el microfono antes de la transmision.
- Curacion de datasets de audio: limpieza masiva de corpus de voz ruidosos antes de usarlos para entrenar modelos de ASR o de sintesis de voz, aprovechando el bajo coste por hora de audio.
- Notas de voz y transcripcion en local: integracion en aplicaciones de dictado que necesitan mejorar la grabacion antes de pasarla a un motor de transcripcion, todo ello sin salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de metricas (PESQ, STOI, SI-SDR, DNSMOS u otras) ni comparaciones cuantitativas con otros modelos. Los tres articulos de referencia (arXiv:2110.05588, arXiv:2205.05474 y arXiv:2305.08227) si contienen evaluaciones en sus publicaciones originales, pero sus cifras no forman parte de la informacion proporcionada y no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 en cualquiera de las tres versiones, dado que los pesos ocupan entre 7,2 MB y 8,9 MB y el estado recurrente y los buffers de FFT son de tamano reducido. No se dispone de cifras oficiales de memoria pico.
- GPU recomendadas: no se requieren. El modelo esta disenado para ejecucion en CPU; en Apple Silicon puede acelerarse mediante MLX (Metal) en chips de la familia M.
- Compatibilidad con GPU de consumo: no aplica en el sentido habitual; cualquier GPU de consumo es sobradamente suficiente y el modelo no necesita GPU dedicada. En el ecosistema Apple, funciona en cualquier equipo con soporte de MLX.
- Opciones de despliegue: MLX en Python a traves de `mlx_audio` (`DeepFilterNetModel.from_pretrained`), MLX en Swift a traves de `MLXAudioSTS`, y, para el modelo original, el repositorio DeepFilterNet de Rikorose (implementaciones en Python y Rust). No aplica el despliegue con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma numerica en la informacion proporcionada. Cualitativamente, el diseno con hop size de 480 muestras a 48 kHz implica tramas de 10 ms, y los articulos de v2 y v3 estan orientados a inferencia en tiempo real en dispositivos embebidos.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos alternativos en la informacion proporcionada. La comparacion mas fiable posible es interna, entre las tres versiones convertidas en este repositorio:

| Modelo | Parametros (estimados de los pesos) | Dim. oculta | Pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepFilterNet v1 | ~1,8 M | 512 | ~7,2 MB float32 | MIT | Repo MLX + checkpoints PyTorch originales |
| DeepFilterNet v2 | ~2,2 M | 256 | ~8,9 MB float32 | MIT | Repo MLX + checkpoints PyTorch originales |
| DeepFilterNet v3 | ~2,1 M | 256 | ~8,3 MB float32 | MIT | Repo MLX + checkpoints PyTorch originales |

Frente a familias alternativas de supresion de ruido (por ejemplo, enfoques clasicos ligeros tipo RNNoise o modelos de separacion de fuentes), no se aportan en la informacion disponible parametros, contexto ni metricas comparables, por lo que la comparativa cuantitativa se marca como no disponible.

## Limitaciones y advertencias

- Ambito restringido: es un modelo de mejora de voz, no un modelo generativo. No genera texto, no responde preguntas, no ejecuta codigo y no soporta tool calling ni flujos de agentes.
- Dependencia del ecosistema MLX: los pesos de este repositorio estan pensados para MLX y Apple Silicon. Para otras plataformas hay que recurrir a los checkpoints originales de PyTorch o a la implementacion Rust del proyecto original.
- Sin cuantizacion: al no haberse aplicado cuantizacion, no hay variantes de menor precision; esto no es un problema dado el tamano, pero implica que no existe una version optimizada especificamente para memoria.
- Tamano del repositorio declarado como 0.0 GB: con descargas y likes a cero, conviene verificar que los archivos `model.safetensors` estan efectivamente subidos antes de integrar el modelo en produccion. El ejemplo de uso de la model card referencia el identificador `mlx-community/DeepFilterNet-mlx`, que no coincide con el identificador de este repositorio (`flyingfishinwater/DeepFilterNet-mlx`); hay que comprobar cual es el correcto en tiempo de ejecucion.
- Riesgo de sobre-supresion y artefactos: los modelos de supresion de ruido pueden eliminar componentes de la propia voz o introducir artefactos musicales, especialmente en audio con musica de fondo, cantos o ruido no estacionario, dominios que no son el objetivo principal del framework.
- Ausencia de datos de entrenamiento detallados: no se especifican el corpus utilizado, su composicion ni posibles sesgos derivados del mismo (idiomas, acentos, condiciones de grabacion sobrerrepresentadas).
- Sin garantias de rendimiento: no hay metricas publicadas en la informacion disponible, por lo que cualquier afirmacion de calidad requiere una evaluacion propia sobre el dominio objetivo.
- Licencia MIT: permisiva y compatible con uso comercial, heredada del proyecto original. Aun asi, se recomienda revisar la licencia y los terminos de los checkpoints originales de DeepFilterNet para confirmar que no existen restricciones adicionales sobre los datos de entrenamiento.
- Idiomas no documentados: no hay confirmacion de cobertura especifica por idioma, aunque el modelo no procesa contenido linguistico.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/flyingfishinwater/DeepFilterNet-mlx
- Repositorio mencionado en los ejemplos de uso: https://huggingface.co/mlx-community/DeepFilterNet-mlx
- Proyecto original DeepFilterNet (codigo y checkpoints): https://github.com/Rikorose/DeepFilterNet
- MLX (framework de Apple para Apple Silicon): https://github.com/ml-explore/mlx
- Paper DeepFilterNet v1 (ICASSP 2022): https://arxiv.org/abs/2110.05588
- Paper DeepFilterNet v2 (IWAENC 2022): https://arxiv.org/abs/2205.05474
- Paper DeepFilterNet v3 (INTERSPEECH 2023): https://arxiv.org/abs/2305.08227

Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos del repositorio.
