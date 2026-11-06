# Kvitik/voxshift

## Resumen

VoxShift es una aplicación de escritorio para Windows 10/11 (64 bits) desarrollada por Kvitik que realiza conversión de voz en tiempo real mediante redes neuronales. A diferencia de un modelo de lenguaje al uso, se distribuye como un ejecutable (VoxShift.exe, 66 MB) que integra un motor de cambio de voz basado en RVC (Retrieval-based Voice Conversion) junto con una cadena de efectos DSP clásicos. El repositorio de Hugging Face ocupa 0,1 GB y actúa principalmente como punto de distribución del binario y de la documentación, no como un repositorio de pesos en formato abierto.

El problema que resuelve es la modificación o sustitución completa de la voz del usuario durante llamadas y transmisiones: la señal procesada se enruta a un dispositivo de audio virtual (VB-CABLE) que las aplicaciones de videoconferencia (Telegram, Zoom, Google Meet, Discord, Telemost) detectan como un micrófono convencional. La latencia declarada es de aproximadamente 30 ms para los efectos y de unos 200 ms para el clonado de voz por GPU.

Es relevante por su enfoque de privacidad (todo el procesamiento ocurre localmente) y por su compatibilidad con el ecosistema RVC: acepta modelos .pth y .onnx de RVC v1/v2, además de ficheros .index, lo que permite reutilizar voces entrenadas con herramientas como Applio. La licencia es freeware (etiquetada como "other" en Hugging Face), con interfaz en ruso e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de conversión de voz RVC (Retrieval-based Voice Conversion) para el clonado, más cadena de efectos DSP para las 9 presets |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible; soporta modelos de voz externos en .pth y .onnx (RVC v1/v2) |
| Idiomas soportados | ruso (ru) e inglés (en) en la interfaz; el procesado de voz es independiente del idioma |
| Licencia | freeware (etiqueta "other" en Hugging Face) |
| Formato de pesos | ejecutable Windows (VoxShift.exe); modelos de voz externos en .pth y .onnx, con índices .index |
| Tamano del repositorio | 0,1 GB |
| Plataforma | Windows 10 / 11 de 64 bits |
| Latencia declarada | ~30 ms (efectos), ~200 ms (clonado por GPU) |
| Aceleración | DirectX 12 (NVIDIA, AMD, Intel); fallback a CPU |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del motor neuronal ni los datos de entrenamiento. Por la descripción del autor, el componente de clonado se apoya en RVC (Retrieval-based Voice Conversion), una familia de modelos de conversión de voz que combina un codificador de contenido con un generador de voz y un mecanismo de recuperación de características (índice .index) para preservar el timbre del hablante objetivo. VoxShift actúa como contenedor de inferencia: carga modelos RVC externos (.pth o .onnx) y los aplica en streaming sobre la señal del micrófono.

Junto al motor neuronal, la aplicación incorpora una cadena de procesado clásica: nueve presets de efectos (voz grave, aguda, infantil, demonio, robot, femenina, alienígena, abuela), controles de tono, timbre, graves, agudos, reverb y eco, supresión de ruido neuronal, nivelación automática de volumen y grabación a MP3. No se publican en la información disponible datos sobre número de tokens, composición del dataset, ni si hubo entrenamiento con RLHF o DPO; el autor no documenta el entrenamiento de un modelo propio, sino la integración de modelos RVC de terceros.

## Capacidades

- Conversión de voz en tiempo real con baja latencia (~30 ms para efectos, ~200 ms para clonado con GPU).
- Clonado de voz completo mediante modelos RVC v1/v2 en formato .pth y .onnx, con soporte de ficheros .index para la recuperación de timbre.
- Nueve efectos de voz preconfigurados con control fino de tono, timbre, graves, agudos, reverb y eco.
- Supresión de ruido neuronal (teclado, ventilador, ruido ambiental).
- Nivelación automática de volumen (compresión de picos y refuerzo de voz baja).
- Grabación de la señal procesada a MP3.
- Enrutado a aplicaciones de terceros mediante el cable virtual VB-CABLE, presentándose como micrófono del sistema.
- Atajos de teclado (F9/F10), funcionamiento en bandeja del sistema y arranque automático.
- Interfaz bilingüe ruso/inglés con ayuda integrada.
- Carga segura de modelos .pth: el autor indica que solo se leen los pesos y no se ejecuta código del fichero.

## Casos de uso

- Llamadas y videoconferencias: el usuario selecciona CABLE Output como micrófono en Telegram, Zoom, Google Meet, Discord o Telemost y habla con la voz transformada, con latencia de ~200 ms en el clonado por GPU, suficiente para conversación fluida.
- Gaming y streaming: aplicación de voces de personaje (robot, demonio, alienígena) en el chat de voz o en la emisión, usando los presets o modelos RVC de catálogos como voice-models.com o weights.gg.
- Privacidad en comunicaciones: ocultar la voz real ante desconocidos en entornos online, ya que todo el procesado es local y la voz no se envía a servidores externos.
- Producción de contenido y doblaje: grabación directa a MP3 de una réplica con otra voz para vídeos, pódcast o mensajes de voz, sin necesidad de un DAW.
- Accesibilidad y confort personal: usuarios que no se sienten cómodos con su propia voz pueden adoptar un timbre alternativo de forma estable durante la conversación.
- Pruebas de doblaje y prototipado de personajes: sustitución rápida de la voz del actor por una voz RVC entrenada con Applio para validar una escena antes de la grabación final.
- Bromas y dinámicas sociales controladas: llamadas con voz distinta entre amigos, con la advertencia explícita del autor de no suplantar a personas reales sin consentimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente declara cifras de latencia operativa (~30 ms para efectos y ~200 ms para clonado con GPU) y no proporciona métricas objetivas de calidad de conversión (MOS, similitud de hablante, WER) ni comparaciones con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica cifras de memoria; el motor RVC opera sobre fragmentos cortos de audio, por lo que el consumo típico de modelos RVC es moderado, pero no se confirma en la información.
- GPU recomendadas: cualquier GPU compatible con DirectX 12 (NVIDIA, AMD o Intel) para el clonado de voz; para los efectos basta con CPU.
- ¿Cabe en GPU de consumo? Sí, según el autor, siempre que la GPU soporte DirectX 12; no se especifican modelos concretos.
- Opciones de despliegue: aplicación de escritorio Windows (VoxShift.exe, sin instalación) junto con el driver VB-CABLE. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje.
- Latencia: ~30 ms con efectos, ~200 ms con clonado en GPU; en CPU el clonado funciona pero "más lento" según el autor, sin cifra concreta.
- Throughput: no disponible.

## Comparativa con modelos similares

| Sistema | Tipo | Plataforma | Latencia declarada | Modelos de voz | Licencia | Procesado local |
|---|---|---|---|---|---|---|
| VoxShift | App RVC + efectos | Windows 10/11 64 bits | ~30 ms / ~200 ms | .pth, .onnx, .index (RVC v1/v2) | Freeware | Sí |
| RVC (proyecto base) | Framework de conversión | Multiplataforma (Python) | no disponible | .pth, .index | MIT (según proyecto original) | Sí |
| Applio | Suite de entrenamiento/inferencia RVC | Multiplataforma | no disponible | .pth, .index | no disponible en la información | Sí |
| Voice changers comerciales | Apps de escritorio | Windows/macOS | no disponible | propietarios | Comercial | Variable |

La comparación se limita a categorías funcionales: no se dispone de datos de rendimiento objetivos de VoxShift ni de los sistemas alternativos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de calidad de conversión.

## Limitaciones y advertencias

- Solo disponible para Windows 10/11 de 64 bits; no hay versiones para macOS ni Linux.
- El ejecutable no está firmado digitalmente, lo que provoca advertencias de SmartScreen ("Windows protegió su PC"); el autor indica que se debe usar "Más información → Ejecutar de todos modos".
- Requiere instalar un driver de terceros (VB-CABLE) para enrutar el audio a las aplicaciones de llamada.
- El clonado de voz sin GPU compatible con DirectX 12 funciona en CPU pero con mayor latencia; no se publican cifras.
- No se documentan sesgos, tasas de alucinación ni métricas de calidad de la conversión; al ser un modelo de audio, el riesgo relevante es la suplantación de identidad, no la alucinación textual.
- Riesgo ético y legal: la suplantación de personas reales sin consentimiento puede ser ilegal; el autor lo advierte explícitamente.
- La licencia "freeware" no es una licencia de código abierto; no se especifican derechos de redistribución, modificación ni uso comercial. Verificar los términos antes de un uso en producción.
- La aplicación realiza una comprobación diaria de actualizaciones por internet (desactivable), único tráfico de red declarado.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una madurez y adopción muy limitadas.
- La fecha de creación del repositorio (2026-11-01) y la falta de documentación técnica sobre el motor neuronal impiden verificar la procedencia y el entrenamiento de los modelos de voz utilizados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kvitik/voxshift
- Descarga del ejecutable: https://huggingface.co/Kvitik/voxshift/resolve/main/VoxShift.exe?download=true
- VB-CABLE (driver de audio virtual): https://vb-audio.com/Cable/
- Catálogo de modelos de voz RVC mencionado por el autor: https://voice-models.com
- Catálogo de modelos de voz RVC mencionado por el autor: https://weights.gg
- Herramienta Applio para entrenar voces RVC (mencionada por el autor): no disponible en la información como enlace directo
