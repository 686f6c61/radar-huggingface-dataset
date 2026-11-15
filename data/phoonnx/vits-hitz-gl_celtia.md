# Phoonnx/vits-hitz-gl_celtia

## Resumen

vits-hitz-gl_celtia es un modelo de síntesis de voz (text-to-speech) publicado por Phoonnx, derivado del repositorio agregador Phoonnx/phoonnx-vits y extraído de la carpeta `hitz-gl_celtia`. Se distribuye en formato ONNX y está pensado para su uso con la librería phoonnx, un runtime de inferencia de voz open source. El modelo emplea la arquitectura VITS, un sistema neuronal de TTS de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado de forma conjunta.

El identificador del modelo (`gl_celtia`) sugiere que la voz corresponde a una hablante femenina en gallego (código de idioma `gl`), con nombre de voz "celtia", aunque la model card no lo confirma explícitamente ni detalla los datos de entrenamiento. El repositorio tiene un tamaño de 0.1 GB, lo que es coherente con un modelo VITS de tamaño moderado empaquetado en ONNX, y se distribuye bajo licencia MIT.

La relevancia de este modelo es acotada: se trata de un artefacto derivado de un agregador de voces Piper/espeak, sin métricas publicadas, sin descargas registradas y sin documentación técnica propia más allá de la referencia al repositorio fuente. Resulta útil para quien necesite una voz gallega integrable en phoonnx o en pipelines compatibles con ONNX, pero no constituye un modelo de propósito general ni compite con sistemas TTS de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech neuronal de extremo a extremo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS) |
| Tipos de cuantizacion | no disponible (distribucion en ONNX) |
| Idiomas soportados | presumiblemente gallego (`gl`), no confirmado en la model card |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), una arquitectura que integra en un único sistema el codificador de texto, el modelado de duración, el prior variacional condicionado por texto y un decodificador de audio basado en flujos normalizadores y un generador tipo HiFi-GAN. El entrenamiento combina pérdidas de reconstrucción, pérdida adversarial y modelado variacional, lo que permite generar audio de forma directa sin un vocoder separado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, el hablante de referencia ni si se aplicaron técnicas de ajuste fino adicionales. El modelo se distribuye como artefacto ONNX dentro de un repositorio agregador de voces Piper/espeak; la model card solo indica la carpeta de origen (`hitz-gl_celtia`) y el identificador de voz en phoonnx (`hitz/gl_celtia-vits`), sin aportar detalles sobre el pipeline de conversión ni sobre el front-end fonético empleado en el caso concreto de esta voz.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) en un único paso de inferencia.
- Presumiblemente orientado al idioma gallego, dado el código `gl` del identificador, aunque no se documenta formalmente.
- Ejecución mediante ONNX Runtime, lo que facilita el despliegue en CPU sin dependencias de GPU.
- Integración con la librería phoonnx a través del identificador de voz `hitz/gl_celtia-vits`.
- No se documentan capacidades de clonación de voz, control de estilo, emoción, tool calling, agentes ni procesamiento multimodal.

## Casos de uso

- Lector de pantalla para aplicaciones en gallego: el modelo puede sintetizar texto de interfaces o documentos en voz alta mediante ONNX Runtime en CPU, sin necesidad de GPU, lo que lo hace adecuado para aplicaciones de accesibilidad en dispositivos modestos.
- Generación de audiolibros o contenido narrado en gallego: al ser un modelo VITS ligero (repositorio de 0.1 GB), permite sintetizar pasajes largos por fragmentos en un servidor modesto o incluso en un portátil.
- Asistentes de voz embebidos: su formato ONNX y su tamaño reducido permiten integrarlo en aplicaciones de escritorio o sistemas empotrados con phoonnx como runtime, ofreciendo respuestas habladas en gallego.
- Localización de contenido multimedia: doblaje o sustitución de pistas de voz en vídeos educativos o institucionales en gallego, generando pistas de audio a partir de guiones de texto.
- Pruebas de concepto en investigación de TTS: sirve como referencia de una voz Piper/espeak convertida a ONNX para comparar latencia y calidad frente a otras arquitecturas dentro del ecosistema phoonnx.
- Automatización de avisos y notificaciones: generación dinámica de mensajes de voz en gallego para sistemas de megafonía, paneles informativos o contestadores, donde el coste por inferencia en CPU es bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al distribuirse en ONNX y con un repositorio de 0.1 GB, es plausible su ejecución en CPU, pero no hay cifras oficiales de memoria.
- GPU recomendadas: no disponible; no se documenta ningún requisito de GPU.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX permite ejecución en CPU y, potencialmente, en GPU mediante ONNX Runtime, pero el autor no lo especifica.
- Opciones de despliegue: ONNX Runtime a través de la librería phoonnx; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no a TTS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamano | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-hitz-gl_celtia | VITS | repo 0.1 GB | presumiblemente gallego | MIT | ONNX | sin benchmarks ni descargas |
| Voces Piper (p. ej. es_ES, gl_ES) | VITS | del orden de decenas de MB por voz | multiples | variable segun voz | ONNX | ecosistema Piper, ampliamente desplegado |
| Coqui TTS (modelos VITS) | VITS | variable | multilingue | MPL-2.0 / variable | PyTorch, ONNX | framework con toolkit completo |
| Otras voces de Phoonnx/phoonnx-vits | VITS | variable por carpeta | variable | variable por subcarpeta | ONNX | mismo repositorio agregador |

La comparación cuantitativa de calidad (MOS, latencia) no está disponible para ninguno de los artefactos derivados de este agregador en la información proporcionada.

## Limitaciones y advertencias

- No hay métricas de calidad, MOS ni evaluaciones publicadas; la calidad de la voz no está verificada de forma independiente.
- El idioma real del modelo no está confirmado en la model card; el código `gl` del identificador es la única evidencia y podría no corresponder a un gallego estándar o completo.
- El modelo es un artefacto derivado de un agregador; la licencia MIT indicada en la cabecera convive con la nota de la fuente de que "las licencias siguen a los originales por subcarpeta", lo que introduce ambigüedad para uso comercial.
- Riesgo de alucinación fonética o de pronunciación incorrecta en palabras fuera del vocabulario o con grafías poco frecuentes, habitual en sistemas TTS basados en espeak.
- Sin documentación sobre el hablante, el corpus ni el front-end fonético empleado, lo que dificulta evaluar sesgos de acento, género o registro.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni comunidad que reporte incidencias.
- El tamaño del repositorio (0.1 GB) sugiere un modelo pequeño; no se recomienda asumir calidad de estudio para doblaje profesional sin una evaluación previa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Phoonnx/vits-hitz-gl_celtia
- Repositorio fuente agregador: https://huggingface.co/Phoonnx/phoonnx-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio kasanoma (referenciado en la model card fuente): https://github.com/michsethowusu/kasanoma
