# owensong/Inflect-Atom-v3

## Resumen

Inflect Atom v3 es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por owensong, distribuido como un paquete versionado de acceso anticipado no comercial. Se presenta como el miembro más pequeño de la familia Inflect v3, junto con las variantes Mini y Micro, y su núcleo de síntesis aprendido contiene únicamente 157.190 parámetros, lo que lo sitúa en un orden de magnitud muy inferior al de los sistemas TTS neuronales convencionales. Genera voz en inglés a 24 kHz de forma local una vez instaladas las dependencias.

El modelo resuelve el problema de la síntesis de voz local en entornos con recursos muy limitados, ofreciendo seis voces fijas predefinidas (`hope`, `sophia`, `cassidy`, `james`, `jasper`, `mark`) sin necesidad de audio de referencia ni de interfaz de clonación. No expone etiquetas de estilo aprendidas ni eventos generados como `[laugh]` o `[excited]`, y no incluye el mejorador opcional de 48 kHz ni el componente Tuner basado en referencia, que son específicos de la variante Mini.

Su relevancia actual radica en la propuesta de un núcleo de síntesis extremadamente compacto (fichero de pesos serializado de 656.498 bytes, 0,66 MB en decimal) con inferencia local y licencia de evaluación no comercial `inflect-preview-evaluation-1.0`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB, lo que sugiere que los artefactos completos pueden no estar reflejados en la metadata pública.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Núcleo de síntesis aprendido (no se especifica la arquitectura interna; no disponible) |
| Parámetros totales | 157.190 (núcleo de síntesis; no incluye assets de pronunciación ni de condicionamiento de voz) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `inflect-preview-evaluation-1.0` (acceso anticipado, no comercial) |
| Formato de pesos | `export.pt` (PyTorch); fichero serializado de 656.498 bytes |
| Frecuencia de muestreo nativa | 24 kHz |
| Voces | 6 presets fijos: `hope`, `sophia`, `cassidy`, `james`, `jasper`, `mark` |
| Backend de waveform por defecto | `torch` (opcionales `cpu-fused` y `cpu-lut`) |
| Frontend por defecto | Misaki |
| Semilla por defecto | 7717 |
| Python requerido | 3.12 |
| Dependencia de hub | `huggingface-hub==0.36.2` |
| Wheel de pronunciación | `vendor/en_core_web_sm-3.8.0-py3-none-any.whl` |
| Pipeline | `text-to-speech` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del núcleo de síntesis más allá de su recuento de parámetros (157.190) y del hecho de que se serializa en un único fichero `export.pt`. No se especifica si se trata de un transformer, un modelo convolucional, un modelo basado en flujo o una arquitectura híbrida, ni se documentan los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO. Tampoco se describe ninguna innovación técnica como decodificación especulativa o atención lineal.

El paquete separa explícitamente el núcleo aprendido de otros componentes: assets externos de pronunciación, assets fijos de condicionamiento de voz, frontend (Misaki), runtime y dependencias de vendor. La model card insiste en que el recuento de parámetros del núcleo no incluye estos assets y que el fichero de pesos no constituye la instalación completa. Se ofrecen backends alternativos de CPU (`cpu-fused` y `cpu-lut`) con dependencias adicionales en `requirements-cpu.txt`, aunque el autor advierte que dichos backends no constituyen una afirmación de equivalencia con el backend `torch` por defecto. La generación es local una vez instaladas las dependencias, si bien la instalación puede requerir acceso a red.

## Capacidades

- Síntesis de voz en inglés a 24 kHz con seis voces fijas predefinidas.
- Selección de voz mediante el argumento `--voice` con los identificadores `hope`, `sophia`, `cassidy`, `james`, `jasper` y `mark`.
- Inferencia local mediante el script `synthesize.py`, con verificación de integridad (`--verify`).
- Frontend de normalización lingüística Misaki y wheel de pronunciación `en_core_web_sm` para el procesamiento del texto de entrada.
- Backend de waveform `torch` por defecto, con alternativas opcionales de CPU (`cpu-fused`, `cpu-lut`).
- Semilla configurable (por defecto 7717) para reproducibilidad de la generación.
- No soporta clonación de voz por referencia de audio.
- No soporta etiquetas de estilo o eventos generados (`[laugh]`, `[excited]`).
- No soporta otros idiomas distintos del inglés; el texto no soportado falla de forma explícita.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Lectura de textos en inglés en aplicaciones de accesibilidad: el modelo puede convertir artículos o documentos en audio a 24 kHz de forma local, sin enviar contenido a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Generación de avisos y notificaciones por voz en aplicaciones de escritorio: con seis voces fijas y un núcleo de 157.190 parámetros, la integración es viable en equipos con recursos limitados y sin GPU dedicada.
- Prototipado de interfaces conversacionales en inglés: permite evaluar la calidad y naturalidad de las seis voces antes de comprometerse con un proveedor comercial, generando el mismo texto con cada preset para comparar.
- Síntesis de audio para pruebas automatizadas de pipelines de voz: la semilla configurable (7717 por defecto) y la verificación de integridad (`--verify`) facilitan la reproducibilidad en tests de regresión.
- Narración de contenido educativo o de documentación técnica en inglés: el frontend Misaki y el wheel de pronunciación `en_core_web_sm` gestionan la normalización del texto de entrada, adecuado para lectura de material estructurado.
- Evaluación comparativa de motores TTS ligeros: al ser un paquete versionado con inventario de integridad (`manifest.json`), sirve como referencia reproducible en estudios de latencia y consumo en CPU frente a otros motores.
- Generación de audio sintético para demostraciones internas: la model card exige identificar claramente los ejemplos públicos como sintéticos y respetar los términos de la licencia, lo que encaja en entornos de evaluación controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas como MOS, MCD, WER ni comparaciones numéricas con otros sistemas TTS, y tampoco documenta latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El núcleo de síntesis tiene 157.190 parámetros y un fichero de pesos de 656.498 bytes, pero la model card advierte que el recuento de parámetros y el tamaño del fichero de pesos no equivalen al consumo de memoria en tiempo de ejecución.
- GPU recomendadas: no disponible. No se documentan requisitos de GPU ni se afirma compatibilidad con CUDA.
- Compatibilidad con GPU de consumo: no disponible. El backend por defecto es `torch`, con backends opcionales orientados a CPU (`cpu-fused`, `cpu-lut`), lo que sugiere viabilidad en CPU, pero el autor no lo presenta como una garantía de instalación limpia ni de compatibilidad entre plataformas.
- Opciones de despliegue: script `synthesize.py` incluido en el paquete, con frontend Misaki y backend `torch`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles.
- Entorno: Python 3.12, `huggingface-hub==0.36.2`, `requirements.txt`, wheel `en_core_web_sm-3.8.0` y, opcionalmente, `requirements-cpu.txt` para los backends de CPU.
- Descarga: debe descargarse el repositorio completo, no solo el fichero de pesos, ya que se requieren assets de frontend, runtime y vendor.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de las otras variantes de la familia más allá de su existencia, por lo que la comparación se limita a lo documentado.

| Modelo | Desarrollador | Parámetros del núcleo | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Inflect Atom v3 | owensong | 157.190 | No disponible | Inglés | `inflect-preview-evaluation-1.0` (no comercial) | Hugging Face, acceso anticipado |
| Inflect Mini v3 | owensong | No disponible (incluye mejorador opcional de 48 kHz y componente Tuner) | No disponible | Inglés | No disponible en la información | Repositorio separado de la familia v3 |
| Inflect Micro v3 | owensong | No disponible | No disponible | Inglés | No disponible en la información | Repositorio separado de la familia v3 |
| Otros motores TTS ligeros | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La model card indica que los repositorios Preview existentes permanecen separados y sin cambios, y que ningún sample de Preview anterior se reetiqueta como salida de estos pesos. No se proporcionan comparaciones numéricas con alternativas de terceros.

## Limitaciones y advertencias

- Licencia `inflect-preview-evaluation-1.0` de evaluación no comercial: el uso comercial está restringido y requiere consultar `LICENSE.md`.
- Acceso anticipado y no anunciado como lanzamiento final: la disponibilidad de funcionalidades se describe en la model card y no debe inferirse de demos o roadmaps.
- Solo inglés: el texto no soportado falla de forma explícita; no hay promesa de cobertura de todos los scripts, símbolos o idiomas.
- Sin clonación de voz: las seis voces son presets fijos, no una interfaz de clonación por audio de referencia ni un servicio de conversión de acento.
- Sin etiquetas de estilo o eventos: instrucciones entre corchetes como `[laugh]` o `[excited]` no son controles de funcionalidad soportados.
- Componentes de Mini no incluidos: el mejorador opcional de 48 kHz y el componente Tuner basado en referencia son específicos de Mini y no están presentes en este paquete.
- El fichero de pesos no es la instalación completa: se requieren assets de frontend, runtime y vendor; la instalación puede necesitar acceso a red.
- Sin garantía de compatibilidad bit a bit entre backends, plataformas o runtimes; los backends alternativos no se presentan como equivalentes al backend `torch`.
- Riesgo de alucinación y sesgos: no documentados en la información disponible para un modelo TTS; la calidad de pronunciación depende del frontend y del wheel de pronunciación incluidos.
- Repositorio con 0 descargas y 0 likes: no hay evidencia pública de uso ni validación por terceros.
- Los ejemplos públicos generados deben identificarse claramente como sintéticos y respetar los términos aplicables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/owensong/Inflect-Atom-v3
- Árbol de ficheros del repositorio: https://huggingface.co/owensong/Inflect-Atom-v3/tree/main
- Licencia del modelo: https://huggingface.co/owensong/Inflect-Atom-v3/blob/main/LICENSE.md
- Inventario de integridad: https://huggingface.co/owensong/Inflect-Atom-v3/blob/main/manifest.json
- Repositorio GitHub: https://github.com/owenawsong/Inflect
- Servidor de Discord: https://discord.gg/CVJYedvzvp
