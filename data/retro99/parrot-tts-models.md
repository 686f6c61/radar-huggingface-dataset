# Retro99/parrot-tts-models

## Resumen

`Retro99/parrot-tts-models` no es un modelo de lenguaje, sino un espejo de un paquete de voces del sistema TTS Kokoro. Concretamente, replica los ficheros del release `kokoro-misaki`, versión `v1_0-kokoro-misaki-v1_0-20261016`, publicado por el propio autor en el repositorio de GitHub `RetRo99/tts-models`. El objetivo declarado es servir esos ficheros a la aplicación web Parrot: los assets alojados en releases de GitHub no se pueden recuperar desde el navegador por las restricciones de CORS, de modo que el autor los duplica en Hugging Face para poder descargarlos vía HTTP desde el frontend.

El repositorio contiene pesos en formato ONNX (etiqueta `onnx` del Hub) y ocupa aproximadamente 0,1 GB, incluyendo los ficheros de licencia del motor y de los recursos asociados (`kokoro-LICENSE`, `kokoro-misaki-LICENSE`, `kokoro-cmudict-LICENSE`, `kokoro-g2p_en-LICENSE`). Los nombres de fichero y los sumas SHA-256 se mantienen idénticos a los del `manifest.json` del release original, según indica la model card.

Su relevancia es, por tanto, muy acotada: no aporta capacidades nuevas ni investigación original, sino que resuelve un problema de distribución web (CORS) para un lector de texto a voz. Cualquier evaluación técnica debe tratar este repositorio como un artefacto de despliegue de un modelo TTS de terceros, no como un modelo entrenado por el autor. No consta pipeline declarado, ni idiomas, ni resultados de evaluación, y el repositorio presenta cero descargas y cero likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo TTS (texto a voz) en formato ONNX; familia Kokoro según la model card; detalles internos de la arquitectura no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo TTS; no gestiona ventanas de contexto de texto) |
| Tipos de cuantizacion | no disponible (se distribuyen ficheros ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (la presencia de `kokoro-g2p_en-LICENSE` sugiere un fonemizador en inglés, sin confirmación en la card) |
| Licencia | other (se incluyen cuatro ficheros: `kokoro-LICENSE`, `kokoro-misaki-LICENSE`, `kokoro-cmudict-LICENSE`, `kokoro-g2p_en-LICENSE`) |
| Formato de pesos | ONNX |
| Tamaño del repositorio | ~0,1 GB |
| Pipeline declarado en el Hub | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-10-25 / 2026-10-25 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo. Se trata de un conjunto de pesos ONNX pertenecientes a la familia Kokoro, un sistema de síntesis de voz, empaquetado junto con los recursos auxiliares habituales en este tipo de pipelines (el listado de licencias incluye componentes de diccionario de pronunciación, `kokoro-cmudict`, y de conversión grafema-fonema, `kokoro-g2p_en`). No se documenta si el paquete contiene el modelo completo o únicamente un subconjunto de voces o estilos, ni el número de parámetros, capas o dimensiones del modelo.

Tampoco hay información sobre datos de entrenamiento, número de tokens, composición del corpus, horas de audio, ni sobre procesos de alineamiento, RLHF o ajuste fino. El autor no ha entrenado el modelo: el repositorio es un espejo de un release ajeno, y la única innovación técnica descrita es de naturaleza operativa (duplicar los assets en el Hub para evitar el bloqueo por CORS en el navegador).

## Capacidades

- Síntesis de voz (texto a audio) mediante pesos en formato ONNX, presumiblemente ejecutables con ONNX Runtime y, por el contexto de uso (aplicación web), con ONNX Runtime Web en el cliente.
- Lectura en voz alta de texto, que es el caso de uso declarado por las aplicaciones Parrot.
- Posible soporte de fonemización en inglés a través del componente `kokoro-g2p_en` incluido en el paquete de licencias; el alcance real no está confirmado.
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No dispone de tool calling, function calling ni capacidades de agente.
- No se declaran capacidades multilingües; el campo de idiomas del Hub está vacío.
- No se documentan modos especiales (thinking, clonación de voz, control de emoción o de prosodia).

## Casos de uso

- Lectura en voz alta dentro de la aplicación web Parrot: el modelo se carga desde el Hub por HTTP para narrar artículos o documentos al usuario, evitando el bloqueo CORS que impediría usar los ficheros del release de GitHub directamente desde el navegador. Es el escenario para el que el repositorio se creó.
- Accesibilidad para personas con discapacidad visual o dificultades de lectura: integrado en un lector web, convierte el contenido textual en audio sin requerir instalación de software adicional por parte del usuario.
- Clientes de escritorio o móviles de la familia Parrot: al mantener nombres de fichero y sumas SHA-256 idénticos al `manifest.json` original, permite verificar la integridad de los assets descargados en tiempo de instalación o de actualización.
- Generación de audio para resúmenes y boletines: un backend puede invocar el modelo para producir narraciones de resúmenes de noticias o informes, sirviendo los ficheros ONNX desde el propio Hub o desde un CDN intermedio.
- Prototipado de asistentes por voz: al ser un artefacto ONNX de tamaño reducido (~0,1 GB de repositorio), es apto para pruebas de concepto en local con ONNX Runtime antes de decidir si se adopta el modelo Kokoro completo en producción.
- Narración de contenido educativo o de documentación técnica: permite añadir una pista de audio a materiales textuales sin depender de servicios de TTS en la nube, lo que simplifica el cumplimiento de requisitos de privacidad cuando el texto es sensible.
- Distribución de assets en entornos con proxy corporativo: al estar alojado en el Hub, se puede cachear o replicar internamente con los mismos nombres de fichero y hashes, facilitando despliegues reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de síntesis (MOS, CMOS), de error de pronunciación, ni de latencia, y la búsqueda web realizada no ha devuelto documentación técnica relacionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (~0,1 GB) acota el orden de magnitud del conjunto de pesos, pero la card no publica cifras de memoria ni de parámetros.
- GPU recomendadas: no disponible. No se documenta ningún requisito de aceleración por hardware.
- Compatibilidad con GPU de consumo: no disponible como dato oficial; por el tamaño del artefacto, es razonable esperar ejecución en CPU o en GPUs de gama media-baja, pero se trata de una inferencia a partir del tamaño del repo, no de una especificación del autor.
- Opciones de despliegue: ONNX Runtime (incluido ONNX Runtime Web, coherente con el motivo CORS que originó el repositorio). Herramientas como vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de artefacto TTS en ONNX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Artefacto | Tipo | Formato | Licencia | Tamaño | Idiomas | Disponibilidad |
|---|---|---|---|---|---|---|
| `Retro99/parrot-tts-models` (este repo) | Paquete de voces TTS (espejo) | ONNX | other (cuatro ficheros de licencia) | ~0,1 GB | no disponible | Hub de Hugging Face; 0 descargas |
| Kokoro (upstream, citado en la card) | Sistema TTS | no disponible en la información | kokoro-LICENSE (contenido no disponible) | no disponible | no disponible en la información | Release de GitHub `RetRo99/tts-models`, pack `kokoro-misaki` |
| Piper (rhasspy) | Sistema TTS | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información |
| Coqui XTTS-v2 | Sistema TTS | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información |

La información proporcionada no permite establecer comparaciones cuantitativas: no hay parámetros, contexto, métricas ni condiciones de licencia verificables para este repositorio ni para las alternativas. Las dos últimas filas se incluyen únicamente como referencia de categoría; sus datos no proceden de la documentación consultada y deberían verificarse en sus fuentes originales antes de cualquier decisión.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta código y no soporta tool calling. Cualquier expectativa en ese sentido es incorrecta.
- Licencia `other` con cuatro ficheros de licencia anidados (`kokoro-LICENSE`, `kokoro-misaki-LICENSE`, `kokoro-cmudict-LICENSE`, `kokoro-g2p_en-LICENSE`). El uso comercial exige revisar cada uno de ellos; la información disponible no confirma que se permita.
- Es un espejo no oficial del release original. La card afirma que los nombres y los SHA-256 coinciden con el `manifest.json`, pero no se aporta verificación independiente ni firma; conviene comprobar los hashes contra el release de GitHub antes de desplegarlo.
- Repositorio con 0 descargas y 0 likes y sin pipeline declarado: no hay señales de uso comunitario ni de mantenimiento. El autor puede eliminar o mover los ficheros, lo que rompería la aplicación web que depende de ellos.
- Idiomas no declarados en el Hub: no se puede asumir soporte multilingüe. La presencia de un fonemizador etiquetado como `g2p_en` apunta a inglés, sin confirmación.
- No hay información sobre sesgos, calidad de voz por variedad dialectal ni comportamiento ante nombres propios, siglas o dominios técnicos.
- El riesgo de alucinación de contenido no aplica, pero sí el de errores de pronunciación, prosodia incorrecta o truncamiento en textos largos, sin datos publicados que permitan acotarlo.
- No se documentan requisitos de memoria, latencia ni límites de longitud de entrada; en producción habrá que medirlos con el runtime ONNX concreto que se use.
- La búsqueda web realizada no ha devuelto documentación técnica relevante sobre este repositorio; los resultados obtenidos no guardan relación con el modelo y se han descartado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Retro99/parrot-tts-models
- Repositorio de releases del autor (origen del pack `kokoro-misaki`, según la model card): https://github.com/RetRo99/tts-models
- No se han encontrado papers, blogs, demos ni repositorios adicionales relevantes en la búsqueda web realizada.
