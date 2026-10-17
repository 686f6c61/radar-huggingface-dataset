# local-vision-models/2xliveactionv1-span-coreml

## Resumen

2xLiveActionV1_SPAN Core ML es un modelo de super-resolución de imagen y vídeo que realiza un aumento de escala 2x sobre material de acción real y cine. Lo publica el usuario local-vision-models como una conversión a Core ML del modelo original 2xLiveActionV1_SPAN de jcj83429. No es un modelo de lenguaje: es una red de visión pensada para reescalar fotogramas de vídeo.

El modelo procesa teselas RGB de 384 x 384 píxeles y produce salidas de 768 x 768 píxeles, es decir, un factor de escala 2x. La conversión a Core ML se ha hecho en precisión float16 y fusionando las convoluciones en paralelo de cada bloque en una sola, tal y como hace el modelo original en inferencia. No ha habido reentrenamiento, por lo que los pesos son los del modelo PyTorch de origen.

Su relevancia radica en el despliegue en el ecosistema Apple: al estar en formato Core ML, puede ejecutarse en dispositivos con Neural Engine (iPhone, iPad y Mac con Apple Silicon) sin depender de un servidor externo, lo que resulta útil para tareas de upscaling de vídeo en local. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SPAN (red convolucional de super-resolucion; convoluciones en paralelo de cada bloque fusionadas en inferencia) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 384 x 384 px por tesela) |
| Tipos de cuantizacion | float16 (Core ML); el modelo original es PyTorch |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (float16) |

## Arquitectura y entrenamiento

Se trata de un modelo SPAN (red convolucional para super-resolución) orientado a vídeo de acción real y cine, con un factor de escala 2x. Cada bloque del modelo emplea convoluciones en paralelo, que se fusionan en una única convolución durante la inferencia; esta misma simplificación se ha aplicado en la conversión a Core ML. El modelo trabaja por teselas: recibe una entrada RGB de 384 x 384 píxeles y devuelve una salida RGB de 768 x 768 píxeles.

Sobre el entrenamiento no se ofrece información en la model card: no se detallan el número de tokens ni de imágenes, la composición del dataset, ni si hubo fases de ajuste como RLHF o DPO (procedimientos que, por otra parte, no son habituales en super-resolución). La conversión a Core ML se ha realizado a partir de los pesos originales en PyTorch, en float16, sin reentrenamiento.

## Capacidades

- Super-resolución de imagen con factor de escala 2x sobre material de acción real y cine.
- Procesamiento por teselas de 384 x 384 píxeles, con salida de 768 x 768 píxeles por tesela.
- Entrada y salida en formato RGB.
- Inferencia en dispositivo mediante Core ML (compatible con Neural Engine, GPU y CPU de Apple).
- Generación de texto: no aplica.
- Razonamiento, código y matemáticas: no aplica.
- Tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Capacidades de visión más allá del reescalado (detección, segmentación, etc.): no disponibles.

## Casos de uso

- Restauración de material de archivo y cine: aplicar un aumento 2x fotograma a fotograma para recuperar definición en metraje rodado a baja resolución, procesando por teselas de 384 x 384 px.
- Upscaling en tiempo real en dispositivos Apple: integrar el modelo Core ML en una app de iOS o macOS para escalar vídeo en el propio dispositivo, sin enviar el contenido a un servidor.
- Edición de vídeo móvil: ofrecer una función de "mejora de resolución" dentro de una app de edición para iPhone o iPad, aprovechando el Neural Engine y el formato float16.
- Preprocesado en pipelines de postproducción: escalar proxies de baja resolución a una resolución intermedia antes de aplicar otros efectos o de montar la línea de tiempo final.
- Mejora de clips para redes sociales: aumentar la resolución de grabaciones de móvil o de cámara de acción antes de publicarlas, procesando por lotes las teselas del fotograma.
- Restauración de grabaciones de dron o cámaras deportivas: recuperar detalle en metraje con ruido y compresión, aplicando el modelo a cada fotograma de forma independiente.
- Generación de versiones 2x para visualización: producir copias de mayor resolución de un máster de baja resolución para su revisión o distribución interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo Core ML en float16, está pensado para ejecutarse en hardware Apple: chips de la serie M (Apple Silicon) y SoC de iPhone/iPad con Neural Engine.
- La aceleración puede realizarse en Neural Engine, GPU o CPU del dispositivo, según la configuración de Core ML.
- No se especifica el tamaño del modelo ni la VRAM o memoria unificada necesaria; no disponible.
- No se indica si el modelo cabe o no en GPU de consumo tipo NVIDIA (RTX 4090), ya que su formato nativo es Core ML y no se ofrecen pesos GGUF ni safetensors.
- Opciones de despliegue: Core ML en apps de Apple (iOS, iPadOS, macOS). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de visión de este tipo.
- Latencia y throughput: no disponibles. Dependerán del chip, del número de teselas por fotograma y de si se usa Neural Engine o GPU.

## Comparativa con modelos similares

La model card no incluye comparativas. Como alternativas de la misma categoría (super-resolución de imagen y vídeo) pueden citarse modelos como Real-ESRGAN, SwinIR o el propio SPAN original en PyTorch, pero no se dispone de datos comparativos de rendimiento en la información proporcionada.

| Modelo | Tipo | Factor de escala | Formato | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| 2xLiveActionV1_SPAN Core ML | Super-resolucion (SPAN) | 2x | Core ML (float16) | Apache-2.0 | no disponible |
| 2xLiveActionV1_SPAN (original) | Super-resolucion (SPAN) | 2x | PyTorch | Apache-2.0 | no disponible |
| Real-ESRGAN | Super-resolucion (GAN) | 2x / 4x | PyTorch, ONNX, NCNN | BSD-3-Clause | no disponible |
| SwinIR | Super-resolucion (transformer) | variable | PyTorch | Apache-2.0 | no disponible |

## Limitaciones y advertencias

- No hay datos de benchmarks ni de evaluación publicados, por lo que no puede verificarse la calidad del reescalado frente a otras alternativas.
- Al no haberse reentrenado, el modelo hereda las limitaciones y posibles sesgos del modelo original 2xLiveActionV1_SPAN; estos no se documentan en la model card.
- Riesgo de artefactos propios de la super-resolución: halos, sobreenfoque o texturas inventadas en zonas de bajo detalle o con mucho ruido.
- El procesamiento por teselas de 384 x 384 px puede generar costuras visibles entre teselas si no se aplica solapamiento y mezcla posterior.
- El modelo está especializado en material de acción real y cine; su comportamiento en otros dominios (ilustración, texto, gráficos) no está documentado.
- Está orientado a inferencia en el ecosistema Apple; desplegarlo en otras plataformas requiere reconvertir los pesos o usar el modelo original en PyTorch.
- No se especifican los idiomas ni capacidades de lenguaje porque no aplican a este modelo.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar el archivo LICENSE y NOTICE del repositorio original para cumplir los requisitos de atribución.
- El repositorio figura con 0 GB de tamaño y sin descargas ni likes, por lo que no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/local-vision-models/2xliveactionv1-span-coreml
- Modelo original en GitHub (PyTorch): https://github.com/jcj83429/upscaling/tree/5d8cdd2e17750b64be39ccab3a8763d91128fe15/2xLiveActionV1_SPAN
- No se han encontrado otros enlaces relevantes (papers, blogs, demos o repos) en la búsqueda web realizada.
