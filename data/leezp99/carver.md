# leezp99/carver

## Resumen

Carver es un autoencoder variacional (VAE) de voz de tasa variable adaptativa al contenido, desarrollado por leezp99 (Zhipeng Li). A diferencia de los codecs de audio tradicionales que operan a una tasa fija, Carver utiliza un único conjunto de pesos para cubrir una curva continua de compromiso entre tasa de frames y distorsión. El modelo puntúa cada frame latente según su error de reconstrucción de forma de onda y decide qué frames mantener o descartar, lo que permite operar a tasa completa, en modo adaptativo casi sin pérdida (descartando principalmente silencios) o a cualquier tasa fija sin necesidad de reentrenamiento.

El modelo trabaja con audio de 24 kHz, genera un latente continuo de 25 Hz con 64 dimensiones, y está pensado como front-end para generadores de voz posteriores (difusión o autoregresivos). El checkpoint publicado pesa 1,4 GB e incluye los pesos y los metadatos de arquitectura. La licencia es MIT, lo que facilita su integración en proyectos comerciales. Es relevante porque ofrece una alternativa flexible a los codecs de tasa fija, con control explícito del compromiso calidad/compresión y una representación latente compacta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE con encoder convolucional y bloques Transformer, decoder con inpainting de frames |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (audio, no texto) |
| Tipos de cuantizacion | no disponible (pesos en precisión nativa, probablemente FP32) |
| Idiomas soportados | no especificado (modelo de audio, no de texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (weights.pth + metadata.pth) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de VAE: un encoder convolucional con bloques Transformer mapea la forma de onda a una posterior gaussiana de 64 dimensiones a 25 Hz. En inferencia, el latente es la media `z = mu`. El proceso de enrutamiento utiliza una decodificación completa con gradiente detenido para calcular el error L1 por frame; los frames con mayor error de reconstrucción se conservan y el resto se rellena con ceros. El decoder reconstruye desde el latente enmascarado, realizando inpainting de los frames descartados.

El entrenamiento emplea un curriculum de enmascaramiento multi-tasa, que permite que un solo checkpoint cubra un rango continuo de tasas de frames sin reentrenamiento por tasa. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o el uso de técnicas como RLHF o DPO (no aplican a un modelo de audio). El autor indica que se reutiliza código de InfoTok, Descript Audio Codec (DAC) y Fish-Speech.

## Capacidades

- Reconstrucción de voz a 24 kHz con latente continuo de 25 Hz y 64 dimensiones.
- Tasa variable adaptativa: modo `auto` que descarta principalmente silencios manteniendo calidad casi sin pérdida.
- Control explícito de tasa fija mediante un parámetro `rate` (keep-ratio entre 0 y 1), sin reentrenamiento.
- Operación a tasa completa (rate=1.0) como límite superior de calidad.
- Representación latente compacta y continua, adecuada como front-end para generadores de voz por difusión o autoregresivos.
- Inferencia tanto en GPU como en CPU (según el autor).
- Normalización de audio a −16 LUFS antes de la codificación.

## Casos de uso

- Compresión de voz para almacenamiento: el modo `auto` reduce el tamaño de grabaciones de voz al eliminar silencios, manteniendo una calidad casi sin pérdida. Adecuado para archivos de dictados o reuniones.
- Transmisión de voz con ancho de banda adaptativo: en entornos con ancho de banda variable, se puede ajustar el parámetro `rate` dinámicamente para mantener una calidad aceptable sin reentrenar el modelo.
- Preprocesamiento para sistemas de texto a voz (TTS): el latente de 25 Hz/64-dim puede servir como entrada compacta para modelos de difusión o autoregresivos que generen voz, reduciendo la carga computacional frente a trabajar con la forma de onda completa.
- Reducción de silencios en grabaciones: el modo `auto` elimina automáticamente los tramos de silencio, útil para limpiar podcasts o entrevistas antes de su publicación.
- Investigación en codecs de audio: Carver ofrece una implementación de referencia para estudiar el compromiso tasa-distorsión y el enrutamiento por error de reconstrucción.
- Integración en pipelines de generación de voz: al ser un VAE continuo, puede combinarse con modelos de lenguaje de voz o difusión para generar habla condicionada, aprovechando su latente de baja tasa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas como MOS (Mean Opinion Score), PESQ, STOI ni comparaciones con otros codecs. El autor proporciona una página de demostración para escuchar reconstrucciones, pero no hay datos numéricos.

## Requisitos de hardware

- El checkpoint pesa 1,4 GB, por lo que cabe en la mayoría de GPUs de consumo (por ejemplo, RTX 3060 con 12 GB o superiores) sin problemas de memoria.
- La model card indica que la inferencia funciona también en CPU, aunque no se especifican tiempos.
- No se proporcionan requisitos mínimos de VRAM ni latencia estimada.
- El repositorio oficial ofrece un script de reconstrucción por línea de comandos y una API en Python; no se mencionan integraciones con vLLM, llama.cpp u Ollama (no aplican, al ser un modelo de audio).
- Para uso en producción, se puede desplegar como un servicio de reconstrucción de audio mediante el código oficial, posiblemente con un servidor HTTP propio.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros codecs de voz como EnCodec, Descript Audio Codec (DAC) o Mimi. Aunque Carver comparte características con DAC (del que reutiliza código), no hay datos objetivos de rendimiento (MOS, tasas de bits, etc.) que permitan una comparación rigurosa. Se recomienda consultar la página de demostración para una evaluación subjetiva.

## Limitaciones y advertencias

- No se especifican los datos de entrenamiento ni los idiomas cubiertos; el modelo puede tener un rendimiento inferior en acentos o idiomas poco representados.
- El modelo está diseñado para voz; su comportamiento con música u otros tipos de audio no está documentado.
- La calidad en modo `auto` depende de la proporción de silencio en la grabación; en materiales sin silencios, la reducción de tasa será mínima.
- No se han publicado evaluaciones de robustez frente a ruido, reverberación o condiciones adversas.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El checkpoint requiere que `weights.pth` y `metadata.pth` estén juntos; si se separan, el modelo no puede cargarse.
- No hay soporte oficial para cuantización o formatos optimizados (GGUF, ONNX, etc.), lo que puede limitar su despliegue en entornos con restricciones de memoria.

## Enlaces

- HuggingFace: https://huggingface.co/leezp99/carver
- Repositorio GitHub: https://github.com/leezp99/carver
- Página de demostración: https://leezp99.github.io/carver-demo/
- Perfil del autor en GitHub: https://github.com/Leezp99
