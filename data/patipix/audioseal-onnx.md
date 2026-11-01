# PatiPix/AudioSeal-ONNX

## Resumen

AudioSeal-ONNX es la exportación a formato ONNX del generador de marcas de agua de audio `audioseal_wm_16bits`, componente del sistema AudioSeal desarrollado originalmente por Meta (Facebook AI Research). No se trata de un modelo generativo de audio, sino de un componente de marcado imperceptible que inserta una señal de 16 bits en una pista de audio a 16 kHz, permitiendo posteriormente detectar y leer el mensaje embebido. La exportación la ha realizado PatiPix Studio con el código oficial de AudioSeal 0.2.0 y los pesos sin modificar del modelo base `facebook/audioseal`.

El modelo resuelve el problema de la trazabilidad y atribución de audio sintético. En el contexto del Reglamento Europeo de IA (artículo 50), que exige marcar el contenido generado por IA, un generador de marcas de agua permite etiquetar voice-overs y clips de voz sintética de forma imperceptible para el oído humano pero verificable por el detector correspondiente. PatiPix Studio lo emplea junto con un manifiesto C2PA firmado para cada voice-over que produce.

La relevancia práctica de esta exportación es que elimina la dependencia de PyTorch en producción: el grafo ONNX puede ejecutarse con ONNX Runtime en entornos ligeros, lo que simplifica el despliegue en pipelines de postproducción de audio. El repositorio ocupa unos 0,1 GB y el fichero ONNX pesa 58.814.395 bytes. La arquitectura subyacente es una red neuronal convolucional (el paper de AudioSeal describe un generador y un detector convolucionales), aunque la model card no detalla la topología interna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional (generador de AudioSeal); topologia interna no detallada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de audio [1, 1, T] con T multiplo de 320 |
| Tipos de cuantizacion | no disponible (exportacion en float32) |
| Idiomas soportados | no aplica (procesa audio, no texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17); modelo base en PyTorch (`generator_base.pth`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del generador. Por el paper de referencia (San Roman et al., "Proactive Detection of Voice Cloning with Localized Watermarking", ICML 2024) se sabe que AudioSeal combina un generador y un detector convolucionales entrenados conjuntamente para insertar y localizar marcas de agua en audio. La exportación se hizo con TorchScript (`dynamo=False`), opset 17, y mantiene los pesos sin modificar respecto a `facebook/audioseal` (revisión `3c19eba53390776cf2cc9ed5f6c9ac67ce72ecba`, fichero `generator_base.pth`).

La única modificación respecto al modelo original es la sustitución de los pequeños pasos de padding de AudioSeal (innecesarios cuando T es múltiplo de 320) por su valor, cero. La validación reportada por el autor: sobre 12 clips de voz, la diferencia entre la salida ONNX y la de PyTorch es inferior a 2e-6, y el detector oficial localiza la marca en el 100 % del audio y recupera el mensaje. No se detalla el volumen ni la composición del dataset de entrenamiento original.

## Capacidades

- Inserción de marcas de agua imperceptibles en audio a 16 kHz mediante una señal de 16 bits.
- Entrada de audio `son` con forma [1, 1, T] en float32, con T múltiplo de 320.
- Entrada de mensaje `message` con forma [1, 16] en int64 (bits 0/1).
- Salida `filigrane` con forma [1, 1, T] en float32, que se suma al audio original.
- Verificación mediante el detector oficial de AudioSeal (no incluido en este repositorio), que localiza la marca y lee el mensaje.
- No realiza generación de audio, transcripción ni ninguna otra tarea de voz.
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No tiene capacidades multilingües en sentido textual: opera sobre señal de audio.

## Casos de uso

- Marcado de voice-overs sintéticos en producción audiovisual: PatiPix Studio añade la marca a cada voice-over generado por IA para cumplir el artículo 50 del Reglamento Europeo de IA, combinándola con un manifiesto C2PA firmado. El modelo es adecuado porque la marca es imperceptible y verificable por el detector oficial.
- Trazabilidad de contenido en plataformas de distribución: un pipeline de publicación puede insertar un identificador de 16 bits (por ejemplo, un código de cliente o de lote) en cada clip antes de subirlo, permitiendo auditar el origen del audio si se detecta uso no autorizado.
- Verificación de procedencia en cadenas de postproducción: al integrar el generador ONNX en un servicio de renderizado, cada pista entregada lleva una marca que el equipo de control de calidad puede comprobar con el detector sin depender de metadatos externos que se pierden al recodificar.
- Detección de deepfakes de voz en moderación de contenido: plataformas que reciben audio de usuarios pueden comprobar con el detector si un clip lleva la marca de un sistema de generación conocido, como capa adicional a clasificadores forenses.
- Despliegue en entornos sin PyTorch: al ser ONNX, el generador puede ejecutarse con ONNX Runtime en contenedores ligeros o en el edge, sin instalar el stack completo de PyTorch, lo que reduce el tamaño de la imagen de despliegue.
- Protección de catálogo de locuciones comerciales: un estudio de doblaje puede marcar cada locución licenciada con un identificador de contrato; si el audio aparece en un anuncio no autorizado, la marca permite demostrar la procedencia de la grabación original.
- Investigación en forense de audio: sirve como componente de referencia para experimentos sobre robustez de marcas de agua frente a recompresión, recorte o mezcla, usando el detector oficial como oráculo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una validación de equivalencia: diferencia máxima inferior a 2e-6 entre ONNX y PyTorch sobre 12 clips de voz, y detección correcta del mensaje en el 100 % de esos clips con el detector oficial.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; el fichero ONNX pesa 58,8 MB, por lo que la huella en memoria es reducida y cabe holgadamente en cualquier GPU consumer con varios GB de VRAM.
- GPU recomendadas: no se especifican; por el tamaño del modelo, cualquier GPU moderna (RTX 3060 o superior, A100, H100) es más que suficiente. También puede ejecutarse en CPU con ONNX Runtime.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del grafo.
- Opciones de despliegue: ONNX Runtime (principal, al ser un export ONNX); el modelo base `facebook/audioseal` puede usarse con PyTorch y la librería `audioseal`.
- Latencia y throughput estimados: no disponibles. La latencia depende de la longitud T del audio y del hardware; el procesamiento es por bloques de 320 muestras como mínimo.

## Comparativa con modelos similares

| Modelo | Tipo | Mensaje embebido | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PatiPix/AudioSeal-ONNX | Generador de marca de agua convolucional | 16 bits | ONNX | MIT | HuggingFace |
| facebook/audioseal | Generador + detector de marca de agua | 16 bits | PyTorch | MIT | HuggingFace |
| WavMark | Marca de agua de audio neuronal | no disponible en la informacion | PyTorch | no disponible | Repositorio académico |
| SilentCipher | Marca de agua de audio neuronal | sí (binario) | PyTorch | no disponible en la informacion | Repositorio académico |

La comparación se limita a la categoría de marcado de agua de audio; no hay datos de rendimiento comparativo publicados en la información disponible para esta ficha.

## Limitaciones y advertencias

- El repositorio contiene únicamente el generador; el detector oficial de AudioSeal no está incluido y debe obtenerse por separado para verificar las marcas.
- La entrada debe ser audio a 16 kHz y con T múltiplo de 320; otros formatos o frecuencias de muestreo requieren remuestreo y recorte previos.
- La model card no reporta robustez frente a recompresión con pérdida (MP3, AAC), recorte, mezcla o filtrado; la marca puede degradarse o perderse en transformaciones agresivas.
- No hay información sobre sesgos, ya que el modelo no procesa contenido semántico, pero la eficacia de la marca puede variar según el tipo de señal (voz frente a música o ruido).
- No se especifican parámetros totales, composición del dataset de entrenamiento ni métricas de calidad perceptual (PESQ, SNR) de la marca insertada.
- La licencia MIT permite uso comercial, pero se mantiene el copyright de Meta Platforms, Inc. y afiliados sobre el modelo original; conviene conservar el aviso de licencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una exportación reciente y poco validada por la comunidad; la verificación de equivalencia la aporta solo el autor.
- El uso de marcas de agua no sustituye otras medidas de trazabilidad (C2PA, metadatos firmados) y puede ser eliminado por un atacante con conocimiento del esquema.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PatiPix/AudioSeal-ONNX
- Modelo base: https://huggingface.co/facebook/audioseal
- Paper de AudioSeal: San Roman et al., "Proactive Detection of Voice Cloning with Localized Watermarking", ICML 2024 (referenciado en la model card; no se proporciona URL directa en la información disponible).
