# skillsafe-ai/kokoro-82m

## Resumen

Kokoro-82M es un modelo de síntesis de voz (text-to-speech) de 82 millones de parámetros que convierte texto en audio. El repositorio `skillsafe-ai/kokoro-82m` no contiene un entrenamiento nuevo, sino una conversión reproducible a ONNX del modelo `onnx-community/Kokoro-82M-v1.0-ONNX`, publicada por SkillSafe mediante su conversor automatizado y pensada para su ejecución directa en navegador a través de `onnxruntime-web`.

El paquete incluye dos variantes de pesos (`model_fp16.onnx`, de 155,67 MB, y `model_quantized.onnx`, de 88,08 MB) junto con 55 voces predefinidas en ficheros `.bin` de 0,50 MB cada una. Todo el contenido del repositorio (0,3 GB) es derivable del origen fijado por commit y de una receta declarada, sin edición manual, lo que facilita la trazabilidad y la reproducibilidad de la conversión.

Su relevancia actual radica en el tamaño: un modelo TTS de menos de 90 MB cuantizado puede ejecutarse en el propio cliente, sin backend ni GPU dedicada, lo que habilita síntesis de voz offline, con baja latencia y sin enviar texto del usuario a un servidor. La licencia Apache 2.0 permite uso comercial, aunque el repositorio no aporta benchmarks, datos de entrenamiento ni confirmación explícita de idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La model card no describe la arquitectura interna; se identifica como modelo de text-to-speech exportado a ONNX |
| Parámetros totales | 82 M (según la denominación «Kokoro-82M»; no confirmado explícitamente en la model card) |
| Parámetros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible / no aplica (modelo TTS; la longitud de texto de entrada depende de la implementación, no se declara un límite) |
| Tipos de cuantización | FP16 (`onnx/model_fp16.onnx`, 155,67 MB) y cuantizada (`onnx/model_quantized.onnx`, 88,08 MB). El esquema exacto de cuantización no se especifica |
| Idiomas soportados | No declarados explícitamente. Se incluyen 55 voces con prefijos de dos letras (`af`, `am`, `bf`, `bm`, `ef`, `em`, `ff`, `hf`, `hm`, `if`, `im`, `jf`, etc.) que en la convención de nombres de Kokoro indican familia de idioma y género; esa correspondencia es una inferencia y no está confirmada en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`.onnx`) para el modelo y binario (`.bin`) para las 55 voces |
| Tarea | Text-to-speech |
| Número de voces | 55 (ficheros de 0,50 MB cada uno, alojados en `voices/`) |
| Tamaño del repositorio | 0,3 GB |
| Modelo base | `onnx-community/Kokoro-82M-v1.0-ONNX` |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-22 |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles de arquitectura ni de entrenamiento: no se indica el número de tokens de entrenamiento, la composición del dataset, ni si hubo ajuste con RLHF, DPO u otras técnicas. Tampoco se documenta si existe decodificación especulativa, atención lineal u otra innovación técnica. Lo único verificable es que se trata de un modelo de la familia Kokoro-82M distribuido originalmente en formato ONNX por `onnx-community`, y que esta copia es una reconversión del mismo.

Lo que sí está documentado con precisión es la cadena de procedencia de la conversión. El origen está fijado al commit `1939ad2a8e416c0acfeecc08a694d14ef25f2231` del repositorio upstream; la receta empleada es `recipes/kokoro-82m.yaml` (SHA-256 `aa9bf0249c2cbbdb34e123a49139d23dca225672a87ea583a3fe82dbb15e438a`); y la cadena de herramientas utilizada fue Python 3.12.13, torch 2.10.0, onnx 1.23.0 y onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64. La conversión se realizó el 2026-09-22T18:58:07+00:00. Cada fichero publica además su propio SHA-256, lo que permite verificar la integridad de la descarga. No se realizó ninguna edición manual de los artefactos.

## Capacidades

- Síntesis de voz a partir de texto (pipeline `text-to-speech`), con salida de audio generada localmente.
- Selección entre 55 voces predefinidas, empaquetadas como ficheros `.bin` independientes de 0,50 MB.
- Ejecución en navegador mediante `onnxruntime-web`, según las etiquetas y la descripción del repositorio (`browser`, `onnxruntime-web`).
- Dos perfiles de precisión intercambiables: FP16 (mayor fidelidad, 155,67 MB) y cuantizado (menor huella, 88,08 MB).
- Inferencia sin backend: el texto no necesita salir del dispositivo del usuario.
- Cobertura multilingüe potencial, inferida de los prefijos de voz (`a`, `b`, `e`, `f`, `h`, `i`, `j`), no confirmada por el autor.
- No se documentan capacidades de tool calling, function calling, uso como agente, razonamiento multi-paso, visión, audio de entrada ni modo «thinking». No es un modelo de lenguaje.
- No se documenta clonación de voz a partir de muestras del usuario.

## Casos de uso

- Lectura por voz en aplicaciones web accesibles: el modelo se ejecuta en el navegador con `onnxruntime-web`, de modo que una página puede ofrecer lectura de contenido a personas con discapacidad visual sin depender de APIs de TTS externas ni de conexión permanente.
- Narración de artículos y boletines: con 55 voces disponibles es posible asignar timbres distintos a secciones o autores, generando audio de forma masiva en local sin coste por carácter, algo habitual en medios digitales y blogs.
- Asistentes de voz embebidos en aplicaciones: el tamaño cuantizado (88,08 MB) permite incluir el modelo en un cliente de escritorio o móvil y responder con voz sin enviar la consulta a un servidor, lo que reduce latencia y mejora la privacidad.
- Material educativo y audioguías: la conversión de apuntes, guiones de museo o cursos a audio permite reutilizar contenidos escritos y ofrecer versiones habladas en varios idiomas usando las voces con distintos prefijos de idioma.
- Localización y doblaje de contenido corto: para vídeos formativos, demostraciones de producto o tutoriales, generar pistas de voz en varios idiomas a partir del mismo guion, con voces consistentes entre episodios al fijar el fichero de voz.
- Notificaciones y avisos en tiempo real: en paneles de monitorización o sistemas de alerta, la síntesis local evita la dependencia de servicios externos y permite anunciar eventos críticos con latencia controlada por el propio dispositivo.
- Prototipado de interfaces conversacionales: al ser un artefacto listo para navegador, permite validar flujos de voz (turnos, interrupciones, elección de voz) antes de invertir en infraestructura de inferencia dedicada.
- Generación de audiolibros o podcasts de bajo coste: el pipeline puede integrarse en un proceso por lotes que recorra documentos largos y produzca audio con una voz fija, siempre que se validen antes la pronunciación y la segmentación del texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MOS, RTF, WER, ni comparaciones con otros sistemas TTS, ni métricas de latencia o throughput.

## Requisitos de hardware

- Huella de pesos: 88,08 MB en la variante cuantizada y 155,67 MB en FP16. Las 55 voces suman aproximadamente 27,5 MB adicionales (0,50 MB × 55).
- VRAM estimada para inferencia: no disponible como dato oficial. A partir del tamaño de los ficheros, la variante cuantizada debería operar por debajo de 0,5 GB de memoria total (pesos, activaciones y buffers de audio) y la FP16 en torno a 0,5-1 GB; son estimaciones derivadas de los tamaños publicados, no medidas declaradas por el autor.
- GPU recomendadas: cualquier GPU de consumo es sobradamente suficiente; una RTX 3060 o superior resulta holgada, y una RTX 4090, A100 o H100 estarían muy por encima de las necesidades del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en GPU integradas. El caso de uso declarado es el navegador, por lo que puede funcionar solo con CPU mediante WebAssembly.
- Opciones de despliegue: `onnxruntime-web` en navegador (escenario principal declarado), ONNX Runtime en escritorio o servidor, y cualquier runtime compatible con ONNX. La compatibilidad con llama.cpp, Ollama, vLLM o TGI no está indicada y no aplica de forma habitual a modelos TTS.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han publicado datos comparativos en la información proporcionada. La tabla siguiente recoge únicamente referencias externas a la información disponible, marcadas como tales, y ninguna cifra de rendimiento:

| Modelo | Parámetros | Formato / tamaño | Licencia | Ejecución en navegador | Datos de benchmarks |
|---|---|---|---|---|---|
| Kokoro-82M (este repositorio) | 82 M (según denominación) | ONNX, 88,08 MB cuantizado / 155,67 MB FP16, más 55 voces | Apache 2.0 | Sí, `onnxruntime-web` declarado | No disponibles |
| Piper (referencia externa, no verificada) | No disponible | ONNX por voz | MIT (referencia externa) | Parcial, vía ONNX Runtime Web | No disponibles |
| XTTS-v2 (referencia externa, no verificada) | No disponible | Pesos PyTorch | Coqui Public Model License (referencia externa) | No | No disponibles |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas objetivas de calidad de voz, inteligibilidad ni velocidad, por lo que cualquier decisión de producción exige una evaluación propia.
- Idiomas no declarados: la model card no enumera los idiomas soportados ni garantiza la calidad en cada uno. La correspondencia entre prefijos de voz e idiomas es una inferencia del observador, no una confirmación del autor.
- Sin validación comunitaria: el repositorio registra 0 descargas y 0 likes, y no hay evidencia de uso en producción por terceros.
- Modelo derivado: no aporta información nueva sobre el entrenamiento, de modo que no es posible auditar sesgos del corpus, cobertura de acentos, sesgos de género en las voces ni de representación lingüística.
- Riesgos propios de un sistema TTS: errores de pronunciación en nombres propios, siglas, números, unidades y texto fuera de distribución; comportamiento degradado ante entradas muy largas o con caracteres no soportados; necesidad de segmentación y control de prosodia en textos largos.
- Uso indebido: como todo sistema de síntesis de voz, puede emplearse para suplantación o desinformación. Aunque no se documenta clonación de voz a partir de muestras, las 55 voces predefinidas siguen siendo reutilizables con fines engañosos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo upstream `onnx-community/Kokoro-82M-v1.0-ONNX` antes de redistribuir, y conservar la atribución correspondiente.
- Inconsistencia temporal: las fechas de creación y actualización del repositorio (2026-09-22) aparecen en el futuro respecto a la fecha habitual de consulta, lo que conviene tener en cuenta al citar el artefacto.
- Mantenimiento: el repositorio se genera mediante un conversor automatizado, por lo que no hay garantía de soporte, actualizaciones ni resolución de incidencias por parte del publicador.
- Repositorio incompleto respecto al ecosistema: solo contiene artefactos ONNX y voces; no incluye pesos originales en PyTorch ni scripts de inferencia propios.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/skillsafe-ai/kokoro-82m
- Modelo base (upstream): https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
- Commit fijado del upstream: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/tree/1939ad2a8e416c0acfeecc08a694d14ef25f2231
- Conversor y recetas de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Resultados de búsqueda web: los enlaces devueltos por la búsqueda corresponden a un comparador de vuelos (Skyscanner) y no guardan relación con el modelo. No se han encontrado en la búsqueda enlaces técnicos adicionales (papers, blogs, repositorios o demos) relativos a este modelo.
