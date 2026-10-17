# Allinsama/FluidInference__silero-vad-coreml

## Resumen

CoreML Silero VAD es una conversión a CoreML del detector de actividad de voz (VAD) Silero, empaquetada por el equipo de FluidAudio (repositorio FluidInference) y publicada en HuggingFace por el usuario Allinsama. El modelo original lo desarrolla el Silero Team y su código fuente vive en el repositorio snakers4/silero-vad; esta versión toma como referencia el artefacto `onnx-community/silero-vad` y lo traduce a un formato que las aplicaciones Swift pueden cargar de forma nativa en iOS y macOS, sin necesidad de un runtime de Python ni de ONNX Runtime.

El problema que resuelve es acotado pero muy práctico: decidir en tiempo real si un fragmento de audio contiene voz humana o no, para poder recortar silencios, activar un asistente, segmentar una transcripción o ahorrar cómputo antes de llamar a un sistema ASR. La model card describe el modelo como "tiny", sin dar cifra de parámetros, y el repositorio ocupa 0,0 GB, lo que confirma que se trata de un artefacto de muy baja huella frente a los LLM habituales.

Es relevante ahora porque permite integrar VAD directamente en el stack de Apple (CoreML, con acceso a CPU, GPU y Neural Engine) manteniendo la licencia MIT y una API sencilla en Swift. Se distribuyen variantes con ventanas de 32 ms y de 256 ms, esta última procesando en lote ocho fragmentos de 32 ms para reducir el coste por inferencia. No es un modelo generativo: no tiene contexto en tokens, no admite tool calling y solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para deteccion de actividad de voz (detalle de capas no disponible); conversion CoreML del modelo Silero VAD |
| Parametros totales | no disponible (la model card lo describe como "tiny") |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion de audio, no generativo) |
| Tipos de cuantizacion | se distribuyen versiones cuantizadas y sin cuantizar; el esquema exacto no esta especificado en la informacion disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | CoreML (.mlmodel / .mlpackage), derivado de ONNX / PyTorch JIT |
| Tarea (pipeline) | voice-activity-detection |
| Framework / libreria | coreml |
| Ventanas de audio | 32 ms (variante estandar) y 256 ms (8 fragmentos de 32 ms procesados en lote) |
| Modelo base | onnx-community/silero-vad (linaje: silero-vad v6.0.0 PyTorch JIT) |
| Metricas declaradas | accuracy, f1 |
| Datasets de evaluacion | alexwengg/musan_mini50, alexwengg/musan_mini100 |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia interna de la red (numero de capas, tipos de capa, funcion de activacion ni estrategia de entrenamiento). Lo que si se documenta es el linaje: se parte del Silero VAD v6.0.0 en formato PyTorch JIT, se comparan las salidas contra esa version de referencia y se genera el artefacto CoreML mediante el pipeline de conversion del repositorio FluidInference/mobius. El modelo base en formato ONNX es `onnx-community/silero-vad`. No se aportan datos sobre volumen de audio de entrenamiento, composicion del corpus, ni sobre si hubo ajuste fino, RLHF o similares; para un VAD estos ultimos conceptos no aplican del mismo modo que en un LLM.

La innovacion practica de este empaquetado no esta en el entrenamiento sino en el despliegue: dos variantes de ventana temporal. La estandar trabaja con tramas de 32 ms; la variante de 256 ms agrupa ocho tramas de 32 ms y las procesa en lote, lo que segun la model card la hace "mucho mas rapida". La model card indica ademas que se probaron las versiones cuantizadas y que, al ser el modelo ya muy pequeno, no se observo ninguna mejora de rendimiento por cuantizar. La evaluacion se hizo contra el baseline Silero VAD v6.0.0 PyTorch JIT y contra subconjuntos reducidos de MUSAN.

## Capacidades

- Deteccion binaria de actividad de voz (habla / no habla) sobre flujo de audio.
- Procesamiento en streaming por tramas de 32 ms, adecuado para captura de microfono en tiempo real.
- Variante de 256 ms con procesamiento en lote de 8 tramas de 32 ms para mayor velocidad.
- Integracion nativa en Swift sobre CoreML en iOS y macOS, con acceso a CPU, GPU y Neural Engine.
- Salida utilizable como puerta (gate) o segmentador previo a un sistema ASR.
- Metricas de evaluacion declaradas: accuracy y f1.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling, function calling ni flujos de agentes.
- No realiza transcripcion ni identificacion de hablante; solo clasifica presencia de voz.
- Soporte multilingue: no declarado; el unico idioma listado es ingles.

## Casos de uso

- Preprocesado de ASR en apps iOS: el detector filtra los tramos sin voz antes de enviar audio al reconocedor, reduciendo el consumo de ancho de banda y de API de transcripcion en conversaciones con pausas largas.
- Asistentes de voz siempre activos: usar el VAD como puerta de bajo coste que solo despierte al modelo pesado cuando hay habla real, con impacto directo en bateria en dispositivos moviles.
- Notas de voz y dictado en macOS: detectar automaticamente el inicio y el fin del habla para cortar la grabacion y evitar ficheros con minutos de silencio.
- Segmentacion de audio por lotes: dividir grabaciones largas (reuniones, pódcast, llamadas) en segmentos de voz que luego se encolan en un pipeline de transcripcion o diarizacion.
- Deteccion de turnos en VoIP o llamadas: marcar cuando un interlocutor empieza y termina de hablar para gestionar la interfaz o la supresion de eco en una app de conferencia.
- Filtrado de calidad de datasets de audio: descartar automaticamente muestras sin voz en la construccion de corpus, usando la variante de 256 ms cuando el objetivo es maximo throughput por lotes.
- Moderacion y monitorizacion de audio: activar alertas o registro unicamente cuando se detecta voz en un canal, evitando almacenar silencio o ruido de fondo.
- Validacion de pipelines de audio en Apple Silicon: servir como componente de referencia para comparar el comportamiento entre la version CoreML y el baseline PyTorch JIT.

## Benchmarks y rendimiento

La model card incluye graficas comparativas frente al baseline Silero VAD v6.0.0 PyTorch JIT (comparacion "standard" con ventana de 32 ms y comparacion con ventana de 256 ms) y una grafica de rendimiento por variante, pero no se proporcionan cifras numericas en el texto de la informacion disponible.

| Comparacion | Metrica | Resultado |
|---|---|---|
| CoreML vs Silero VAD v6.0.0 PyTorch JIT (ventana estandar) | accuracy / f1 | no disponible (solo graficas) |
| CoreML vs Silero VAD v6.0.0 PyTorch JIT (ventana 256 ms) | accuracy / f1 | no disponible (solo graficas) |
| Variante 32 ms vs variante 256 ms | velocidad de inferencia | la variante de 256 ms es mas rapida al procesar 8 tramas de 32 ms en lote; cifras no disponibles |
| Versiones cuantizadas vs sin cuantizar | rendimiento | sin mejora apreciable segun la model card |

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,0 GB y la model card describe el modelo como "tiny", por lo que la huella de memoria es minima.
- GPU recomendadas: no requiere GPU dedicada; esta pensado para CPU, GPU integrada y Neural Engine de Apple.
- Cabe en hardware de consumo: si, en cualquier iPhone, iPad o Mac reciente con soporte CoreML; no necesita A100, H100 ni RTX 4090.
- Opciones de despliegue: carga directa del artefacto CoreML desde Swift (repositorio FluidAudioSwift); la conversion se realiza con FluidInference/mobius; el modelo base esta disponible en ONNX y PyTorch JIT para entornos no Apple.
- Latencia y throughput: no se publican cifras absolutas; solo se indica cualitativamente que la variante de 256 ms es mas rapida que la de 32 ms y que la cuantizacion no aporta mejora.
- Fuera del ecosistema Apple no hay artefacto CoreML utilizable: seria necesario recurrir al modelo base ONNX o PyTorch.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CoreML Silero VAD (esta ficha) | VAD neuronal en CoreML | no disponible ("tiny") | no aplica | en | MIT | HuggingFace, autor tercero (Allinsama), 0 descargas |
| onnx-community/silero-vad | VAD neuronal en ONNX (modelo base) | no disponible | no aplica | no disponible | no disponible en la informacion | HuggingFace |
| silero-vad (snakers4) | VAD neuronal en PyTorch JIT / ONNX | no disponible | no aplica | no disponible | MIT | GitHub, mantenido por el equipo original |
| WebRTC VAD | VAD clasico (no neuronal) | no disponible | no aplica | no aplica | licencia permisiva de WebRTC | Incluido en WebRTC; referencia habitual para comparar latencia |

La ventaja competitiva de esta variante es la integracion nativa en Apple con licencia MIT; su desventaja es que no procede del equipo original y no publica cifras de benchmark en texto, a diferencia del repositorio de referencia de Silero, que es la fuente canonica del modelo.

## Limitaciones y advertencias

- Solo clasifica voz frente a no voz: no transcribe, no identifica hablante y no distingue idioma.
- El unico idioma declarado es el ingles; el comportamiento con otras lenguas no esta documentado.
- Los sesgos concretos no estan documentados en la informacion disponible; como VAD, puede fallar en audio musical, ruido de fondo intenso o habla muy baja, y la evaluacion se apoya en subconjuntos de MUSAN.
- Riesgo de falsos negativos en voz susurrada o con microfonos de baja calidad; no se publican tasas de error en texto.
- Dependencia total de CoreML: no hay artefacto para Linux, Windows ni Android en este repositorio.
- La cuantizacion no aporta mejora de rendimiento segun el autor, de modo que no hay incentivo practico para usar variantes cuantizadas.
- Repositorio con 0 descargas y 0 likes, publicado por un tercero (Allinsama) y no por el equipo original: conviene verificar los artefactos y su procedencia antes de usarlos en produccion.
- Licencia MIT permite uso comercial, pero se debe mantener la atribucion al Silero Team y al equipo de FluidAudio segun las citas de la model card.
- El repositorio aparece con tamano de 0,0 GB, por lo que los pesos podrian no estar incluidos o no estar indexados; verificar la descarga antes de integrar.

## Enlaces

- HuggingFace: https://huggingface.co/Allinsama/FluidInference__silero-vad-coreml
- Repositorio FluidAudio: https://github.com/FluidInference/FluidAudio
- Codigo de conversion (mobius): https://github.com/FluidInference/mobius
- Wrapper Swift (FluidAudioSwift): https://github.com/FluidAudio/FluidAudioSwift
- Modelo base en ONNX: https://huggingface.co/onnx-community/silero-vad
- Modelo original Silero VAD: https://github.com/snakers4/silero-vad
- URL citada en la model card: https://huggingface.co/alexwengg/coreml-silero-vad
- Dataset de evaluacion musan_mini50: https://huggingface.co/datasets/alexwengg/musan_mini50
- Dataset de evaluacion musan_mini100: https://huggingface.co/datasets/alexwengg/musan_mini100
- Discord del proyecto: https://discord.gg/WNsvaCtmDe
