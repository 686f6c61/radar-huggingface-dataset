# indrajit4533/voiceguard

## Resumen

VoiceGuard es un sistema de detección de voz sintetizada (deepfake de audio) en tiempo real, publicado por el usuario indrajit4533 en HuggingFace como un repositorio asociado al Smart India Hackathon 2026 (enunciado SIH26104). No es un modelo de lenguaje: es un clasificador de audio que analiza la forma de onda cruda (raw waveform) a 16 kHz y emite un veredicto sobre si una locución es humana o generada por un sintetizador. Su arquitectura, denominada VoiceGuardRawNet, combina filtros sinc aprendibles, bloques residuales convolucionales 1D y una BiGRU de dos capas, con un total declarado de aproximadamente 206.000 parámetros.

El problema que aborda es el fraude telefónico mediante clonación de voz: llamadas que suplantan a familiares, directivos bancarios o figuras públicas. La propuesta se orienta a despliegue en el borde (edge), sin GPU, con un consumo declarado de 2 núcleos de CPU y una latencia P95 de 138 ms tras cuantización INT8, lo que permite integrarlo en pasarelas de telefonía y terminarlo automáticamente ("kill-switch") cuando la confianza sintética supera el 75 % en dos ventanas consecutivas.

La relevancia del proyecto es sobre todo contextual: ataca el sesgo de idioma y acento de los detectores existentes entrenándose sobre 12 lenguas indicas y clasificando cinco clases (habla auténtica, TTS indico, DiffWave, MelGAN y WaveNet). Sin embargo, el repositorio presenta inconsistencias notables (tamaño de 0,0 GB, licencia no declarada en los metadatos de HuggingFace, model card truncada y ausencia total de métricas de precisión de detección), por lo que debe considerarse un prototipo, no un componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional 1D sobre forma de onda cruda (RawNet) con SincConv, 3 bloques residuales, MaxPool1d y BiGRU de 2 capas (hidden 256) + capa lineal 512 → 5 clases |
| Parametros totales | Aproximadamente 206.000 (según la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no es un modelo autorregresivo. Procesa ventanas de 1,5 s (24.000 muestras a 16 kHz) y ventanas deslizantes de 250 ms en modo streaming |
| Tipos de cuantizacion | Cuantización dinámica INT8 aplicada a las capas GRU y Lineal; la model card menciona además checkpoint "INT8 RawNet". No se detallan otros esquemas |
| Idiomas soportados | 12 lenguas indicas según la model card (no se especifica la lista); se declara independencia de acento |
| Licencia | Contradictorio: la model card incluye un badge "License: MIT", pero los metadatos de HuggingFace indican licencia no disponible |
| Formato de pesos | No disponible (el repositorio figura con 0,0 GB y no se indica safetensors, GGUF, .pt ni ningún otro formato; la model card menciona un badge "Checkpoint 7.6 MB" mientras su propia tabla indica 1,02 MB) |

## Arquitectura y entrenamiento

La entrada del modelo es una forma de onda mono a 16 kHz sin preprocesado espectral. La primera capa es una SincConv de 64 filtros paso banda sinc aprendibles con tamaño de kernel 129, que sustituye a las características mel-escala hechas a mano. A continuación se apilan tres bloques residuales (64→64, 64→128 con stride 2 y 128→128), un MaxPool1d con kernel 10 y stride 10, una BiGRU de dos capas con estado oculto de 256 y una capa lineal final de 512 a 5 clases. Las optimizaciones de inferencia declaradas son: fusión Conv-BN, cuantización dinámica INT8 sobre GRU y lineal, y precarga en caché del kernel sinc para eliminar llamadas a `torch.sinc()` en tiempo de ejecución, con el objetivo de reducir latencia en CPU.

En cuanto a los datos de entrenamiento, la model card únicamente afirma que el modelo se entrenó con muestras de 12 lenguas indicas para evitar sesgo de acento. No se especifica el número de horas de audio, la composición exacta del dataset, la proporción entre clases, la existencia de un conjunto de validación independiente ni si se aplicaron técnicas de aumento de datos. No se documenta ningún proceso de ajuste por refuerzo, DPO o similar (no aplicable a un clasificador de audio). Tampoco se describe el procedimiento de entrenamiento, la función de pérdida, la estrategia de balanceo de clases ni el criterio de selección del checkpoint publicado.

## Capacidades

- Clasificación de audio en cinco clases: `gt` (habla humana auténtica), `synthetic_indic` (TTS en lenguas indicas), `diffwave`, `melgan` y `wavenet` (vocoders neuronales).
- Análisis en tiempo real mediante ventanas deslizantes de 250 ms, con veredictos declarados por debajo de 185 ms (P95 de 138 ms medido en 2 hilos de CPU).
- Análisis de forma de onda cruda, sin dependencia de espectrogramas mel ni de características acústicas prefijadas.
- Kill-switch autónomo: terminación automática de la llamada al superar el 75 % de confianza sintética durante dos ventanas consecutivas.
- Puntuación de amenaza y de autenticidad expuestas en la API (`threat_score`, `authenticity_score`), aunque la documentación del endpoint está truncada en la model card.
- API HTTP construida con FastAPI: `GET /`, `GET /api/health` y `POST /api/analyze` (multipart/form-data con el campo `file`).
- Interfaz web interactiva con Gradio 4.44.0 para subir audio y visualizar probabilidades por clase, puntuación de amenaza y latencia de inferencia.
- Privacidad en el diseño: no se almacena audio crudo y se aplica hashing SHA-256 por fragmentos, con inferencia en local (on-premise).
- Multilingüismo: cobertura declarada de 12 lenguas indicas y ausencia declarada de sesgo por acento.
- Limitación de capacidades: no genera texto, no razona, no ejecuta código, no soporta tool calling, function calling ni flujos de agentes, y no procesa imagen, vídeo ni texto.

## Casos de uso

- Prevención de fraude telefónico en operadoras: el detector se integra en la pasarela de voz y, en llamadas donde se suplanta a un familiar o a un empleado bancario, activa el kill-switch al superar el umbral configurado. Su latencia de 138 ms y su consumo de 2 vCPU lo hacen viable en infraestructura de telefonía sin aceleradores.
- Verificación de llamadas en banca y fintech: antes de autorizar operaciones sensibles o de readmitir un OTP por voz, el sistema analiza la señal en streaming y bloquea la operación si detecta vocoder o TTS indico, añadiendo una capa sobre la autenticación por conocimiento.
- Cumplimiento y antifraude en centros de contacto: monitorización de llamadas entrantes para detectar intentos de suplantación de clientes o de agentes, con registro de puntuaciones de amenaza en lugar de audio crudo, lo que facilita el cumplimiento de políticas de minimización de datos.
- Verificación de contenido y desinformación: análisis de clips de audio atribuidos a figuras públicas antes de su difusión, usando la clase concreta detectada (DiffWave, MelGAN o WaveNet) como pista forense sobre la herramienta de síntesis empleada.
- Onboarding remoto y KYC por voz: en procesos de alta de clientes donde se graba una frase de verificación, el modelo comprueba que la muestra es habla humana y no una grabación sintetizada, reduciendo el riesgo de creación de identidades falsas.
- Despliegue en dispositivos de borde y equipos de campo: al ocupar alrededor de 1 MB y no requerir GPU, puede ejecutarse sobre una pasarela SBC, un mini-PC industrial o un portátil de un investigador para triaje forense de audio sin conexión a servicios en la nube.
- Moderación de audio en plataformas: filtrado previo de notas de voz y audios subidos por usuarios para marcar posibles voces sintetizadas antes de la revisión humana, aprovechando el procesamiento por ventanas de 250 ms.

## Benchmarks y rendimiento

La model card solo publica métricas de latencia y huella de memoria, medidas en 2 hilos de vCPU y sin GPU. No se publican métricas de calidad de detección (exactitud, EER, AUC, precisión por clase) en la información disponible.

| Metrica | Baseline | Fused | Fused + INT8 | Presupuesto declarado |
|---|---|---|---|---|
| Latencia P95 | 126 ms | 160 ms | 138 ms | Inferior a 185 ms |
| Tamano del modelo | 1,0 MB | No disponible | 1,02 MB | Inferior a 2,2 MB |
| Latencia media | Aproximadamente 104 ms | Aproximadamente 128 ms | Aproximadamente 110 ms | No especificado |

No se han publicado resultados de benchmarks de detección (exactitud, EER, AUC, MMLU, HumanEval, GSM8K u otros) en la información disponible. Tampoco se aportan curvas ROC, matrices de confusión ni evaluación sobre conjuntos de prueba independientes, por lo que el rendimiento real de discriminación entre voz humana y sintetizada no puede verificarse con los datos disponibles.

## Requisitos de hardware

- VRAM: no requiere GPU. La inferencia está diseñada para CPU exclusivamente.
- CPU: la model card indica funcionamiento en 2 hilos de vCPU, con latencia P95 de 138 ms.
- Memoria: huella efectiva declarada de 2,2 MB (presupuesto) y modelo de 1,02 MB tras fusión y cuantización INT8.
- GPU recomendadas: no aplica; no se documenta soporte CUDA ni aceleración por GPU.
- Cabe en cualquier equipo de consumo: portátiles, mini-PC, Raspberry Pi o pasarelas SBC con al menos 2 núcleos, siempre que se ejecute PyTorch en CPU.
- Opciones de despliegue: FastAPI con Uvicorn mediante `python app.py` (puerto 8000) e interfaz Gradio 4.44.0. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni TensorRT, que no son aplicables a este tipo de modelo.
- Latencia y throughput: latencia media de aproximadamente 110 ms y P95 de 138 ms en la configuración INT8 con 2 vCPU. El throughput no está publicado y dependería del número de hilos y de la concurrencia del servicio.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros detectores de audio sintetizado (por ejemplo, clasificadores sobre espectrogramas mel o sistemas basados en embeddings de altavoz), ni se aportan métricas de precisión de este modelo que permitan una comparación objetiva con alternativas. La única referencia cuantitativa de la model card es su propio consumo de latencia y tamaño.

## Limitaciones y advertencias

- El repositorio figura con un tamaño de 0,0 GB en HuggingFace y 0 descargas, lo que sugiere que los pesos pueden no estar efectivamente publicados o que el contenido no está accesible; conviene verificar antes de cualquier evaluación.
- Discrepancia de licencia: la model card muestra un badge MIT, pero los metadatos de HuggingFace indican licencia no disponible. No hay certeza jurídica sobre el uso comercial hasta que el autor lo aclare.
- Inconsistencias en el tamaño: el badge indica un checkpoint de 7,6 MB y la tabla de rendimiento 1,02 MB. No se especifica el formato de pesos ni cómo obtener el archivo.
- No se publican métricas de exactitud, EER, AUC ni evaluación por clase, por lo que se desconoce la tasa de falsos positivos y falsos negativos.
- Riesgo de falsos positivos con consecuencias graves: el kill-switch corta llamadas al 75 % de confianza sintética en dos ventanas consecutivas, un umbral que puede interrumpir conversaciones legítimas si el modelo se confunde con voz procesada, códec de telefonía o ruido.
- Cobertura limitada de vocoders: solo se contemplan DiffWave, MelGAN y WaveNet (y TTS indico). No hay evidencia de generalización a arquitecturas más recientes de clonación de voz ni a audio generado por modelos de difusión de última generación.
- Sesgo geográfico y lingüístico: el entrenamiento se centra en 12 lenguas indicas; el comportamiento sobre otros idiomas y acentos no está documentado y no puede asumirse equivalente.
- Model card incompleta: la sección de API se corta a mitad de la respuesta JSON y no se detallan umbrales, calibración, ni el procedimiento de entrenamiento.
- Sin información sobre composición del dataset, horas de audio, balanceo de clases ni posible contaminación entre entrenamiento y prueba.
- Advertencia de seguridad: al ser un sistema de detección, un atacante con acceso al modelo puede adaptar su sintetizador para evadir las clases conocidas; no se documenta ningún mecanismo de robustez adversarial.
- La model card incluye su propio aviso legal ("Disclaimer") que no se detalla en la información disponible, pero que conviene revisar antes de un uso operativo.

## Enlaces

- HuggingFace: https://huggingface.co/indrajit4533/voiceguard
- No se han encontrado enlaces relevantes adicionales (papers, repositorios, demos o blogs) en la búsqueda web realizada; los resultados devueltos no guardaban relación con el modelo.
