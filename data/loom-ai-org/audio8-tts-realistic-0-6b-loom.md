# loom-ai-org/audio8-tts-realistic-0.6b-loom

## Resumen

Audio8-TTS Realistic 0.6B es un modelo de síntesis de voz (text-to-speech) desarrollado por Edge0 y exportado por loom-ai-org al formato GGUF propio de loom.cpp. Se trata de un modelo DualAR (dos bloques autorregresivos) de 605.117.837 parámetros que convierte texto en tokens de códec neuronal, no en audio directamente: la segunda mitad del pipeline, el códec `audio8-tts-codec-loom`, transforma esos tokens en una onda de 44.1 kHz. Soporta clonación de voz zero-shot a partir de un clip de referencia y su transcripción exacta.

El modelo cubre 23 idiomas (chino, inglés, japonés, coreano, alemán, francés, español, italiano, ruso, árabe, finés, hindi, indonesio, malayo, neerlandés, noruego, polaco, portugués, sueco, tailandés, turco, vietnamita y cantonés) y se distribuye bajo licencia Apache 2.0, heredada del modelo base. Su relevancia actual radica en que ofrece un pipeline TTS multilingüe con clonación de voz ejecutable en el runtime ligero loom.cpp, sin dependencia de PyTorch en inferencia (aunque sí para crear ficheros de voz).

La exportación incluye un GGUF autodescriptivo que embebe las topologías de grafo, el tokenizador y el script controlador, lo que permite su uso con la librería `loom-py-rt` (versión 1.0.0rc20 o superior). El modelo emite 10 codebooks por fotograma a 21,5 fotogramas por segundo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR (dos bloques autorregresivos), text-to-codes |
| Parametros totales | 605.117.837 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 y cuantizaciones derivadas (el repo incluye varias precisiones; no se detallan los tipos exactos en la informacion disponible) |
| Idiomas soportados | zh, en, ja, ko, de, fr, es, it, ru, ar, fi, hi, id, ms, nl, no, pl, pt, sv, th, tr, vi, yue (23) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (formato propio de loom.cpp) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura DualAR, es decir, dos bloques autorregresivos encadenados que generan tokens de códec neuronal en lugar de muestras de audio. La salida es frame-major: una fila por fotograma, con 10 codebooks de ancho, a una tasa de 21,5 fotogramas por segundo. El texto de entrada determina el idioma de salida sin necesidad de un conmutador explícito de idioma.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card original indica que el fichero F32 conserva los parámetros sin modificar y que el resto de precisiones se cuantizan a partir de él. La exportación a GGUF la realiza `loom-exporter` y el GGUF resultante es autodescriptivo: incluye sus propias topologías de grafo, tokenizador y script controlador.

Una innovación destacable es el muestreo propio del modelo: por defecto muestrea con temperatura 0,7, top-k 50 y top-p 0,9, con un redibujado sensible a repeticiones. El muestreador mide top-k y top-p antes de aplicar la temperatura, lo que difiere del comportamiento de `transformers`. Con `temperature=0` la decodificación es voraz y reproduce exactamente la salida de `generate(do_sample=False)` del modelo original en F32, código por código, incluso con voz clonada.

## Capacidades

- Síntesis de voz a partir de texto en 23 idiomas, con detección automática del idioma a partir del texto de entrada.
- Clonación de voz zero-shot: el modelo acepta un clip de referencia y su transcripción exacta, codificados como tokens de códec, para imitar la voz.
- Generación de tokens de códec neuronal (10 codebooks, 21,5 fps) que un códec separado convierte en audio de 44,1 kHz mono.
- Muestreo configurable con semilla (`seed=`) para reproducir tomas concretas, y decodificación voraz determinista con `temperature=0`.
- Integración con el runtime loom.cpp mediante la API `model.text2codes.infer(...)` y acceso de bajo nivel a través de `model.infer(...)` y `model.driver_source`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo especializado exclusivamente en text-to-speech.

## Casos de uso

- Audiolibros y narración automatizada: el modelo convierte texto largo en voz sintética en cualquiera de sus 23 idiomas, y el muestreo con semilla permite regenerar tomas consistentes para corregir fragmentos concretos sin rehacer toda la narración.
- Clonación de voz para doblaje y localización: a partir de un clip limpio de 3 a 15 segundos y su transcripción exacta, se genera un fichero de voz reutilizable que permite producir el mismo locutor en varios idiomas, útil para doblar contenido sin grabar de nuevo.
- Asistentes de voz embebidos: al ejecutarse sobre loom.cpp con pesos GGUF cuantizados, el modelo puede integrarse en aplicaciones de escritorio o servidores ligeros que necesiten TTS sin depender de PyTorch en tiempo de inferencia.
- Generación de avisos y locuciones en sistemas de atención al cliente: el modelo produce voz natural en español, inglés, francés y otros idiomas europeos para mensajes pregrabados dinámicos, con control de semilla para mantener coherencia entre ejecuciones.
- Prototipado de interfaces conversacionales: los desarrolladores pueden encadenar `text2codes.infer` con `codes2speech.infer` para obtener audio en un solo flujo de Python, lo que acelera la validación de productos de voz antes de invertir en infraestructura de producción.
- Investigación en síntesis de voz multilingüe: al ser Apache 2.0 y estar disponible en GGUF, sirve como base reproducible para experimentos de clonación zero-shot y evaluación de códecs neuronales, con la ventaja de que los tokens de códec son un intermedio manipulable.
- Accesibilidad: conversión de texto a voz para lectores de pantalla y aplicaciones de accesibilidad en 23 idiomas, con la posibilidad de clonar la voz del propio usuario a partir de una grabación corta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 605 millones de parámetros, el fichero F32 ocupa aproximadamente 2,4 GB en pesos; las versiones cuantizadas reducen esta cifra, aunque no se detallan los tipos exactos en la información disponible. El repositorio completo pesa 3,6 GB.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, el modelo cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores en cuantización, y en A100/H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM en cuantización; el fichero F32 requiere alrededor de 3 GB.
- Opciones de despliegue: runtime loom.cpp mediante la librería `loom-py-rt` (PyPI, versión 1.0.0rc20 o superior). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Audio8-TTS Realistic 0.6B (loom) | 605 M | no disponible | 23 | Apache 2.0 | GGUF |
| Audio8-TTS-Realistic-0.6b (Edge0, original) | 0,6 B | no disponible | 23 | Apache 2.0 | safetensors (no confirmado) |
| Audio8-TTS-Preview | no disponible | no disponible | no disponible | no disponible | no disponible |

El modelo base de Edge0 comparte arquitectura, parámetros e idiomas con esta exportación; la diferencia es el formato (GGUF para loom.cpp frente a los pesos originales) y el runtime de inferencia. Audio8-TTS-Preview comparte el mismo fichero de códec según la model card, pero no se dispone de más datos para comparar. No se dispone de información sobre otros modelos TTS comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo no produce audio directamente: emite tokens de códec que requieren el códec `audio8-tts-codec-loom` para convertirse en onda de 44,1 kHz. Sin ese segundo modelo el pipeline está incompleto.
- No existe un conmutador de idioma: el modelo infiere el idioma a partir del texto de entrada, lo que puede provocar resultados inesperados en textos mixtos o ambiguos.
- El muestreo por defecto (temperatura 0,7, top-k 50, top-p 0,9) produce variabilidad entre ejecuciones; para reproducibilidad es necesario fijar `seed=` o usar `temperature=0`, que tiende a continuar más allá del final de la frase.
- La clonación de voz requiere un fichero de voz generado con `loom-exporter` y PyTorch instalado, además del checkpoint original en disco; los repositorios de loom solo incluyen el decodificador.
- Los ficheros de voz están vinculados al códec con el que se crearon mediante una huella de sus cuantizadores; loom rechaza ficheros creados con un códec distinto.
- Riesgo de uso indebido en clonación de voz: la licencia del fichero de voz corresponde a la grabación, y el consentimiento del hablante es responsabilidad del usuario. Solo deben clonarse voces sobre las que se tenga derecho de uso.
- Riesgo de alucinación y artefactos de pronunciación: no se documentan sesgos específicos, pero al ser un modelo generativo de voz puede producir entonaciones o pronunciaciones incorrectas en textos atípicos.
- La licencia Apache 2.0 permite uso comercial, pero las restricciones sobre el contenido de las grabaciones clonadas y los derechos de imagen y voz del hablante deben evaluarse por separado.
- La información disponible no detalla la longitud de contexto, los tipos exactos de cuantización ni los requisitos de hardware oficiales, lo que limita la planificación de despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-ai-org/audio8-tts-realistic-0.6b-loom
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Realistic-0.6b
- Códec emparejado: https://huggingface.co/loom-ai-org/audio8-tts-codec-loom
- Repositorio loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio loom-py: https://github.com/loom-ai-org/loom-py
- Repositorio loom-exporter: https://github.com/loom-ai-org/loom-exporter
- PyPI loom-py-rt: https://pypi.org/project/loom-py-rt/
