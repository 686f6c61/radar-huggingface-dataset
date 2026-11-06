# northeasterlyone/neo-axion-14-plus

## Resumen

Neo Axion 14 Plus es un modelo de síntesis de voz (text-to-speech) centrado en turco, desarrollado por el usuario independiente northeasterlyone (marca Northeasterly One). Se trata de una implementación propia de la arquitectura StyleTTS 2 (arXiv:2306.07691), sin pesos preentrenados de terceros: el modelo acústico (NeoStyle), el codificador de contexto (Neo-BERT), el modelo de pausas, el limpiador de ruido y el conversor fonético turco se han entrenado o escrito desde cero con datos propios.

El modelo genera audio a 24 kHz con normalización a -18 LUFS y picos reales ≤ -1 dBTP, y ofrece tres estilos de voz (normal, alegre y enérgico) además de detección automática de emoción desde el texto. Incluye funciones poco habituales en TTS de este tamaño: énfasis por palabra mediante marcado `*palabra*`, voces intermedias insertables como `[gülme]` (risa) o `[iç çekme]` (suspiro), y normalización completa de texto turco (números, horas, fechas, porcentajes, monedas, teléfonos y abreviaturas).

Con unos 199,8 millones de parámetros (0,8 GB en safetensors), es un modelo ligero y ejecutable en hardware de consumo. Su licencia OpenRAIL-M permite el uso comercial con obligación de atribución, lo que lo hace relevante para productos que necesiten una voz turca sintética de calidad con restricciones legales claras contra la suplantación de identidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 (implementación propia, "NeoStyle") con Neo-BERT, modelo de pausas B2 y vocoder tipo HiFi-GAN con fuente NSF |
| Parametros totales | 199.809.301 (199,7 M en el paquete) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en precisión original) |
| Idiomas soportados | Turco (tr) |
| Licencia | OpenRAIL-M (uso comercial permitido, atribución obligatoria) |
| Formato de pesos | safetensors (biblioteca PyTorch) |

Desglose de parámetros por componente:

| Componente | Parametros |
|---|---|
| NeoStyle (codificador de texto, codificadores de estilo, predictor de prosodia, flujo de estilo, decodificador y generador de onda) | 104,0 M |
| Neo-BERT (copia entrenada conjuntamente) | 46,2 M |
| Neo-BERT Limpio (copia congelada, para el modelo de pausas B2) | 46,2 M |
| B2 (modelo de pausas) | 1,0 M |
| NeoTemiz (limpiador de ruido, opcional) | 2,2 M |

## Arquitectura y entrenamiento

El pipeline completo es: texto → NeoNorm v2 (normalización de números, horas y monedas) → NeoG2P v6 (conversión a fonemas, vocales largas y acento) → B2 (predicción de pausas y comas) → Neo-BERT (contexto, énfasis y emoción) → NeoStyle (codificador de texto, codificadores de estilo para timbre y prosodia, y predictor de duración, tono y energía) → decodificador AdaIN + generador de onda tipo HiFi-GAN con fuente NSF, filtrado Snake y filtro de frecuencia → audio a 24 kHz → NeoTemiz (limpieza opcional) y limitador de nivel/pico.

El entrenamiento se realizó en varias fases, partiendo de un piloto (Axion 14) entrenado desde cero con unas 10 horas de datos: alineador, NeoSLM, generador de onda y prosodia. Después siguió una fase de naturalidad (60.000 pasos del generador de onda, mejorando UTMOS de 3,28 a 3,65), una fase de prosodia y estilo, una fase "Plus" de 40.000 pasos de entrenamiento conjunto de NeoStyle y Neo-BERT con nuevos jueces y NeoG2P v6, y una fase 2 de 24.000 pasos adicionales con juez armónico y pérdida de banda superior. El producto final corresponde al paso 52.000; una fase 2C de 16.000 pasos más no superó el control de calidad interno y se descartó.

Los datos de entrenamiento suman unas 120 horas generadas con un modelo profesor (VoxCPM2) a partir de grabaciones de referencia del propietario de la voz, con 8 filtros de calidad, más unas 0,33 horas de grabaciones reales del propietario (con su consentimiento explícito) y 445 clips de lectura dirigida. Como jueces de entrenamiento se usaron discriminadores MPD, MRD, MS-SB-CQT, de ondícula, STFT complejo, armónico, de prosodia y un modelo propio de comprensión de audio turco (NeoSLM+, entrenado desde cero en lugar de WavLM); estos jueces no se incluyen en el paquete.

## Capacidades

- Sintesis de voz en turco a 24 kHz con salida normalizada a -18 LUFS y picos ≤ -1 dBTP.
- Tres estilos de voz predefinidos: `normal`, `neşeli` (alegre) y `enerjik` (enérgico).
- Selección automática de estilo por emoción detectada en el texto (`stil="oto"`).
- Énfasis por palabra mediante marcado en línea con asteriscos (`*kelime*`).
- Inserción de voces intermedias no verbales: `[gülme]`, `[gülerek]`, `[hmm]`, `[iç çekme]`, `[kahkaha]`, `[kıkırdama]`, `[soru-hı]`, `[şaşırma-a]`, `[şaşırma-o]`, `[şaşırma-vay]`.
- Normalización de texto turco (NeoNorm): números, horas, fechas, porcentajes, monedas, teléfonos, abreviaturas y vocales largas ("haa-rika").
- Conversión texto-fonema propia (NeoG2P v6) con manejo de vocales largas y acento turco.
- Predicción de pausas y puntuación prosódica mediante el modelo B2.
- Salida determinista mediante semilla: la misma semilla produce la misma lectura; semillas distintas generan variaciones naturales menores.
- Control avanzado mediante `tts.say()`: velocidad de habla, fuerza del énfasis, melodía de párrafo, entre otros.
- Uso automático de GPU si está disponible; no requiere tool calling ni capacidades de agente (no es un modelo de lenguaje).

## Casos de uso

- Locución de contenido audiovisual en turco: generación de narración para vídeos educativos, tutoriales o documentales, aprovechando los tres estilos y el control de velocidad de habla para adaptar el tono al contenido.
- Atención al cliente telefónica o por voz: el modelo puede dar voz a un asistente conversacional en turco, con el estilo "oto" ajustando el tono emocional según el texto que se le pase.
- Audiolibros y podcasts en turco: el marcado de énfasis por palabra, las pausas automáticas de B2 y las voces intermedias (risas, suspiros) permiten producir narraciones expresivas sin edición manual.
- Sistemas de anuncios dinámicos: la normalización de números, horas, fechas y monedas (NeoNorm) permite insertar datos variables (precios, horarios, porcentajes de descuento) en plantillas de anuncios sin preprocesar el texto.
- Accesibilidad: lectores de pantalla y herramientas de lectura de texto para usuarios turcos, beneficiándose de la lectura correcta de abreviaturas, teléfonos y horas.
- Videojuegos y personajes interactivos: las semillas reproducibles permiten generar tomas consistentes de un mismo personaje, y las voces intermedias añaden expresividad sin grabar actores adicionales.
- Prototipado de productos de voz: el tamaño reducido (0,8 GB) y la API simple de Python permiten integrar TTS en aplicaciones locales o de servidor con hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica mencionada en la model card es la evolución interna de UTMOS durante el entrenamiento del generador de onda: de 3,28 a 3,65 tras 60.000 pasos. No hay comparativas con otros modelos TTS ni puntuaciones de MOS formalizadas.

## Requisitos de hardware

- VRAM estimada: no disponible explícitamente; con ~200 M de parámetros en PyTorch, la inferencia debería ser viable en GPUs de 4-8 GB de VRAM (estimación, no dato oficial).
- GPU recomendadas: no disponible; el código usa GPU automáticamente si está presente y funciona también en CPU (no se indican tiempos de ejecución).
- Consumer GPU: dado el tamaño (0,8 GB de pesos), debería funcionar en GPUs de consumo como una RTX 3060 o superior; no hay datos oficiales de compatibilidad.
- Despliegue: instalación vía `pip install torch numpy scipy safetensors huggingface_hub soundfile`, descarga con `snapshot_download` de Hugging Face e inferencia mediante la clase `NeoTTS`. Existe también un Space en Hugging Face para probarlo sin instalación local. No se mencionan soportes para vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Licencia | Notas |
|---|---|---|---|---|
| Neo Axion 14 Plus | 199,8 M | Turco | OpenRAIL-M (atribución obligatoria) | Estilos, énfasis, voces intermedias, 24 kHz |
| StyleTTS 2 (original, LibriTTS) | ~200 M (orden de magnitud similar) | Inglés | MIT | Implementación de referencia; no incluye G2P turco ni normalización propia |
| XTTS-v2 (Coqui) | no disponible | Multilingüe (incluye turco) | Coqui Public Model License (no comercial sin licencia) | Clonación de voz con pocos segundos de audio; más restrictivo comercialmente |

La principal diferencia de Neo Axion 14 Plus frente a alternativas multilingües como XTTS-v2 es su especialización: al entrenarse exclusivamente con datos turcos y con un pipeline de normalización y fonemización propio, puede ofrecer mayor calidad fonética en turco, a cambio de no soportar otros idiomas. Frente al StyleTTS 2 original, aporta un G2P turco, normalización de texto y control de estilo y emoción integrados.

## Limitaciones y advertencias

- Monolingüe: solo sintetiza turco; no hay soporte para otros idiomas.
- Voz única: el modelo genera una sola voz ("Neo"), aprendida de las grabaciones del propietario con su consentimiento; no soporta clonación de voz ni selección de hablantes.
- La fase 2C del entrenamiento introdujo una ligera pérdida de naturalidad y no superó el control de calidad interno; el producto final es la fase 2, pero esto indica que la calidad en bandas superiores tiene margen de mejora reconocido por el propio autor.
- Riesgo de uso indebido para suplantación: la licencia prohíbe expresamente imitar a una persona real sin su consentimiento, usar el audio para fraude o contenido engañoso, o presentar las salidas como palabras de un humano real; el audio generado debe etiquetarse como producido por IA.
- Licencia OpenRAIL-M: el uso comercial está permitido, pero la atribución es obligatoria y se aplican las restricciones de uso responsable del Anexo A.
- No hay benchmarks públicos comparativos (MOS, UTMOS frente a otros sistemas), por lo que la calidad debe validarse empíricamente en cada caso de uso.
- El juez de comprensión de audio NeoSLM+ y otros discriminadores no se incluyen en el paquete, lo que impide continuar el entrenamiento con la misma configuración sin reconstruirlos.
- Estadísticas de adopción muy bajas en el momento de redactar la ficha (0 descargas, 1 like), sin historial de uso en producción documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/northeasterlyone/neo-axion-14-plus
- Demo (Space de Hugging Face): https://huggingface.co/spaces/northeasterlyone/neo-axion-14-plus
- Paper de referencia de la arquitectura (StyleTTS 2): https://arxiv.org/abs/2306.07691
- Licencia (LICENSE en el repositorio): https://huggingface.co/northeasterlyone/neo-axion-14-plus/blob/main/LICENSE
