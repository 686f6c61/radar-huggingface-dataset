# lsvalov/voice-deepfake-synthesis-detector

## Resumen

El detector de voz sintética de lsvalov es un modelo de clasificación binaria diseñado para distinguir habla real de habla generada por sistemas de síntesis de voz (TTS) o conversión de voz. Se construye sobre el encoder XLS-R 300M de wav2vec 2.0 de Facebook, afinado de extremo a extremo, y añade una cabeza MLP que reduce la representación temporal a dos logits (bona fide frente a spoof). El modelo se publica como un checkpoint PyTorch de 1,3 GB bajo licencia MIT.

La relevancia del modelo reside en su especialización: ha sido entrenado exclusivamente sobre la partición de entrenamiento de ASVspoof 5, un corpus de referencia en detección de ataques de suplantación y deepfakes de voz. Esto lo hace útil como componente dentro de un sistema de verificación de locutor o de moderación de audio, pero también delimita con claridad su alcance: no es un control de seguridad certificado y su resultado negativo no prueba que el audio sea auténtico.

El modelo no incluye pipeline declarado en Hugging Face ni idiomas especificados, y su uso está pensado para integrarse en el ecosistema DeepFense, junto con capas de marca de agua y de replay. La entrada son ventanas de 4 segundos a 16 kHz mono, y la salida es un par de logits por ventana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer wav2vec 2.0 (XLS-R 300M) con cabeza MLP (1024 → 128, mean pooling temporal) y salida de dos clases |
| Parametros totales | 300M en el encoder XLS-R; total del detector no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 4 s de audio a 16 kHz (64 000 muestras); clips más cortos se rellenan por repetición |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el encoder base XLS-R es multilingüe, pero el detector no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`asv5-300m-epoch3-model.pth`, dict con `model_state`, 428 tensores) |

## Arquitectura y entrenamiento

El detector sigue la arquitectura `StandardDetector` del framework DeepFense. El frontend es un encoder XLS-R 300M de wav2vec 2.0 afinado de extremo a extremo, inicializado desde `xlsr2_300m.pt` de fairseq (publicado también como `facebook/wav2vec2-xls-r-300m`). Sobre las representaciones del encoder se aplica un mean pooling a lo largo del tiempo y una cabeza MLP que proyecta de 1024 a 128 dimensiones y produce dos logits: índice 1 para bona fide e índice 0 para spoof. El blueprint utiliza la diferencia `logit(bona fide) − logit(spoof)` como log-likelihood ratio.

El entrenamiento se realizó sobre la partición de entrenamiento de ASVspoof 5, usando la partición de desarrollo para selección de modelo. La receta emplea Adam con learning rate 1e-6, batch de 32, sin aumento de datos, semilla 42 y parada temprana sobre el conjunto de desarrollo; el checkpoint publicado corresponde a la época 3. El entrenamiento se ejecutó en GPUs AMD Instinct bajo ROCm, con la revisión `a00e76b3` del framework DeepFense. El corpus ASVspoof 5 está licenciado bajo ODC-By 1.0.

## Capacidades

- Clasificación binaria de audio de voz: distingue habla auténtica (bona fide) de habla sintética generada por TTS o conversión de voz.
- Procesamiento de ventanas de 4 segundos a 16 kHz mono, con relleno por repetición para clips más cortos.
- Salida de logits por ventana, apta para umbralización o para combinar con otras puntuaciones en un sistema mayor.
- Integración con el framework DeepFense, que aporta capas de marca de agua y de detección de replay.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un clasificador de audio, no un modelo generativo.
- Capacidades multilingües no declaradas; el encoder base XLS-R es multilingüe, pero el detector no especifica idiomas.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Moderación de audio en plataformas: el detector puede puntuar fragmentos de 4 s de grabaciones subidas por usuarios para marcar posibles voces sintéticas antes de su publicación, usando el log-likelihood ratio como señal de prioridad.
- Verificación complementaria en sistemas de autenticación por voz: integrado como capa adicional junto a un verificador de locutor, permite elevar la alerta cuando el audio presenta indicios de síntesis, sin sustituir al verificador principal.
- Análisis forense de grabaciones: para peritajes o investigaciones internas, el modelo ofrece una puntuación objetiva por ventana que puede acompañar a la revisión humana de un audio sospechoso.
- Detección de deepfakes en contenidos periodísticos: un redactor o fact-checker puede pasar entrevistas o declaraciones por el detector para obtener una señal preliminar antes de la verificación manual.
- Investigación en anti-spoofing: el checkpoint sirve como línea base reproducible sobre ASVspoof 5 para comparar nuevas arquitecturas o estrategias de calibración dentro de DeepFense.
- Filtrado en pipelines de datos de voz: en la construcción de corpus de entrenamiento, el detector puede descartar muestras sintéticas que contaminarían datasets de habla real.
- Monitorización de centros de atención telefónica: para detectar llamadas generadas automáticamente o voces clonadas en grabaciones de call center, con revisión humana posterior de los casos marcados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 1,3 GB en precisión original; en FP32 se estima un consumo de VRAM en torno a 1,5-2 GB para el modelo, más el overhead de activaciones y del procesamiento de audio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en FP32; A100, H100 o RTX 4090 no son necesarias para un modelo de 300M, pero aceleran el procesamiento por lotes.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores con 4 GB o más de VRAM.
- Opciones de despliegue: al ser un checkpoint PyTorch con nombres de módulos de DeepFense, requiere cargarlo con `torch.load(..., weights_only=True)` y reconstruir la arquitectura `StandardDetector`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos de texto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de entrada | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lsvalov/voice-deepfake-synthesis-detector | 300M (encoder XLS-R) | Ventanas de 4 s a 16 kHz | ASVspoof 5 | MIT | Hugging Face, 0 descargas |
| facebook/wav2vec2-xls-r-300m | 300M | Audio variable (encoder base) | Multilingüe, autosupervisado | MIT | Hugging Face, ampliamente usado |
| DeepFense `StandardDetector` (framework) | Depende de la configuración | Configurable | Configurable | No disponible | Repositorio GitHub |

La comparación con otros detectores específicos de anti-spoofing no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente con los ataques de ASVspoof 5: sistemas de clonación de voz más recientes o no vistos pueden no ser detectados.
- Un resultado negativo significa "no detectado", no prueba de que el habla sea real.
- Las puntuaciones no están calibradas: el límite de decisión está en un log-likelihood ratio de 0, por lo que es necesario calibrar con datos de desarrollo del dominio propio antes de fijar un umbral.
- No es un control de seguridad certificado; su uso en producción debe combinarse con otras capas y con revisión humana.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no aplica como modelo generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación.
- Limitaciones de idioma: no declaradas; el comportamiento fuera de los idiomas presentes en ASVspoof 5 no está documentado.
- Restricciones de licencia: el modelo es MIT, pero el corpus de entrenamiento ASVspoof 5 está bajo ODC-By 1.0 y requiere atribución al consorcio ASVspoof.
- El uso comercial está permitido por la licencia MIT, sin garantías explícitas del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lsvalov/voice-deepfake-synthesis-detector
- Modelo base XLS-R 300M: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Framework DeepFense: https://github.com/Yaselley/deepfense-framework
- Corpus ASVspoof 5: https://zenodo.org/records/14498691
