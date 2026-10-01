# PrismLive/PrismVoice-TW

## Resumen

PrismVoice-TW es un paquete de sintesis de voz (text-to-speech) para mandarin de Taiwan que distribuye el proyecto Prism Live (Wave Foundry) como parte de los recursos que la aplicacion descarga en el dispositivo. No se trata de un modelo entrenado especificamente por PrismLive, sino de una distribucion: el nucleo es el modelo ONNX de PrimeTTS v2.1, un sistema MB-iSTFT-VITS a 16 kHz con tres voces de mandarin de Taiwan (Xinran, Anchen y Bowen), que se incluye sin modificaciones y bajo licencia Apache-2.0.

Junto al modelo, el repositorio aporta dos recursos linguisticos que resuelven el preprocesado en el telefono: por un lado, un `lexicon.json` con lecturas en bopomofo (con digito de tono 1-5) construido a partir de los datos de McBopomofo y corregido a nivel de palabra con las lecturas de g2pW sobre 4.000 frases de mandarin de Taiwan; por otro, el `cmudict.dict` del CMU Pronouncing Dictionary para las pronunciaciones en ingles en ARPAbet. De este modo se evita depender de g2pW en tiempo de inferencia en el dispositivo.

Su relevancia es practica: ofrece un pipeline TTS zh-TW + en autocontenido, en formato ONNX y de tamano reducido (0,1 GB de repositorio), pensado para ejecutarse localmente sin enviar texto a servicios externos. Al estar publicado bajo Apache-2.0 y en un formato portable, es un candidato directo para integrarse en aplicaciones moviles o de escritorio mediante ONNX Runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MB-iSTFT-VITS (variante de VITS con iSTFT multi-banda), segun PrimeTTS v2.1 |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (entrada de texto/fonemas, no modelo autoregresivo de contexto) |
| Tipos de cuantizacion | no disponible (se distribuye directamente en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | zh (mandarin de Taiwan, zh-TW) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`primetts_v21_3voice.onnx`); recursos auxiliares en JSON (`lexicon.json`) y texto plano (`cmudict.dict`) |
| Frecuencia de muestreo | 16 kHz |
| Voces incluidas | 3 (0 Xinran femenina, 1 Anchen masculina, 2 Bowen masculina) |
| Entradas del modelo | `x`, `tone`, `lang` (int64, `[1, T]`, con id en blanco 0 entre simbolos), `x_lengths`, `sid`, `noise_scale` (0.667), `length_scale` (1.0) |
| Salida del modelo | `wav` (float, 16 kHz) |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El motor de sintesis es PrimeTTS v2.1, basado en MB-iSTFT-VITS, una variante de VITS que sustituye el decodificador habitual por un decodificador con transformada inversa de Fourier de corto plazo multi-banda (multi-band iSTFT). Esta eleccion reduce el coste computacional del vocoder neuronal manteniendo la salida a 16 kHz, lo que explica que el modelo pueda ejecutarse en un dispositivo movil mediante ONNX Runtime. La entrada no es texto crudo: el modelo consume secuencias de simbolos (`x`), tonos (`tone`) e identificador de idioma (`lang`) ya convertidas a la tabla de simbolos definida por el orden de `frontend_bopomofo.py` de PrimeTTS, separadas por un id en blanco (0).

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO (procedimientos poco habituales en TTS). Lo que aporta PrismLive no es entrenamiento nuevo sobre PrimeTTS, sino los recursos de preprocesado: `lexicon.json` se compila a partir de `BPMFBase.txt`, `BPMFMappings.txt`, `heterophony*.list` y `phrase.occ` de McBopomofo, con correcciones a nivel de palabra derivadas de las lecturas de g2pW sobre 4.000 frases de mandarin de Taiwan. El objetivo declarado es sustituir a g2pW en el telefono, es decir, trasladar la conversion grafema-a-fonema al lexico embebido. Para el ingles se conserva `cmudict.dict` sin cambios.

## Capacidades

- Sintesis de voz (text-to-speech) en mandarin de Taiwan (zh-TW) e ingles, a partir de texto convertido a secuencia de simbolos con tonos.
- Tres voces de mandarin de Taiwan: Xinran (femenina), Anchen (masculina) y Bowen (masculina), seleccionables mediante el parametro `sid`.
- Control de prosodia mediante parametros de inferencia: `noise_scale` (por defecto 0.667) para variabilidad y `length_scale` (por defecto 1.0) para duracion/velocidad.
- Conversión grafema-a-fonema en dispositivo mediante lexico embebido (bopomofo con tono) para el chino y ARPAbet para el ingles.
- Ejecucion local en formato ONNX, apta para integrarse en aplicaciones de escritorio y moviles sin llamadas a servicios externos.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).
- No se documentan capacidades de vision, audio de entrada, ni modo thinking.

## Casos de uso

- Lectura en voz alta en aplicaciones moviles: el paquete esta pensado para descargarse en el dispositivo y sintetizar texto zh-TW localmente a 16 kHz, evitando el envio de contenido a la nube y reduciendo dependencia de conectividad.
- Asistentes de voz para mandarin de Taiwan: se puede seleccionar entre las tres voces (`sid` 0, 1 o 2) para adaptar el timbre del asistente a distintos perfiles de producto o personajes.
- Accesibilidad para personas con discapacidad visual: la sintesis local permite leer documentos, notificaciones y contenido de pantalla en mandarin de Taiwan sin coste por peticion ni latencia de red, con un modelo de 0,1 GB que cabe en el almacenamiento del telefono.
- Audiolibros y contenido narrated en zh-TW: el control de `length_scale` permite ajustar la velocidad de locucion, y el lexico con lecturas corregidas a nivel de palabra ayuda a resolver homografos frecuentes en texto largo.
- Sistemas de anuncios y avisos en comercios o transporte: al ejecutarse en ONNX Runtime, puede desplegarse en dispositivos de borde o mini-PC para generar avisos hablados en mandarin de Taiwan de forma reiterada sin coste marginal.
- Contenido bilingue zh-TW / en: la combinacion del lexico en bopomofo y del `cmudict.dict` en ARPAbet permite sintetizar cadenas que mezclan terminos en ingles dentro de frases en mandarin, habitual en contextos tecnicos y de producto.
- Aprendizaje de idiomas: la pronunciacion determinista basada en lexico y el control de velocidad permiten generar pares de audio para practicar mandarin de Taiwan o ingles con una voz consistente.
- Prototipado rapido de interfaces de voz: al ser un modelo ONNX autocontenido, se puede integrar en demos y pruebas de concepto sin montar infraestructura de servidores de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No se proporcionan metricas objetivas de calidad de sintesis (por ejemplo MOS, CMOS), error de pronunciacion, ni latencia medida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio completo ocupa 0,1 GB, por lo que el modelo y los recursos auxiliares son de tamano reducido.
- Cabe en GPU de consumo y, previsiblemente, en CPU: al tratarse de un modelo ONNX a 16 kHz con decodificador multi-banda iSTFT, esta disenado para ejecutarse en dispositivos moviles, de modo que deberia funcionar en GPUs integradas y en CPU moderna, aunque no se aportan cifras oficiales.
- GPUs recomendadas: no disponible. No se documentan requisitos de A100, H100 o RTX 4090, y por el perfil del modelo no serian necesarias.
- Opciones de despliegue: ONNX Runtime es la via natural, dado el formato del peso (`primetts_v21_3voice.onnx`). No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI, que no estan orientados a este tipo de modelo TTS.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Frecuencia | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| PrismVoice-TW | TTS (MB-iSTFT-VITS / ONNX) | zh-TW, en | 16 kHz | Apache-2.0 | ONNX | Distribucion de PrimeTTS v2.1 mas lexico bopomofo y cmudict; 3 voces |
| PrimeTTS (Luigi/PrimeTTS) | TTS (MB-iSTFT-VITS) | no disponible en esta ficha | 16 kHz | Apache-2.0 | no disponible en esta ficha | Modelo base sobre el que se construye PrismVoice-TW, sin cambios |
| Alternativas genericas de TTS open source | TTS | variable | variable | variable | variable | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de datos de rendimiento comparado con otras alternativas en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo nuevo: es una redistribucion de PrimeTTS v2.1 sin cambios mas recursos de preprocesado; las limitaciones del modelo base se heredan integramente.
- No se documentan parametros, datos de entrenamiento ni evaluaciones, por lo que la calidad de sintesis no puede contrastarse con metricas publicadas.
- Cobertura limitada a mandarin de Taiwan (zh-TW) e ingles; otras variedades del chino o idiomas adicionales no estan soportados.
- El lexico se ha construido y corregido sobre 4.000 frases de mandarin de Taiwan, lo que puede dejar fuera vocabulario especializado, nombres propios o terminos poco frecuentes, con el consiguiente riesgo de lectura incorrecta de homografos.
- La sintesis de texto con mezcla de idiomas depende de la seleccion correcta de idioma por simbolo; una clasificacion erronea en el preprocesado producira pronunciaciones incorrectas.
- Riesgo de artefactos y de prosodia poco natural en frases largas o con puntuacion atipica, comportamiento comun en sistemas VITS; no se aportan muestras ni evaluaciones que lo cuantifiquen.
- La licencia Apache-2.0 permite uso comercial, pero el material de terceros incluido tiene sus propias condiciones: los datos de McBopomofo son MIT y el CMU Pronouncing Dictionary es BSD, por lo que conviene conservar las atribuciones correspondientes al redistribuir.
- El repositorio registra 0 descargas y 0 likes, y se creo en octubre de 2026, por lo que no existe comunidad ni historial de uso que permita validar su comportamiento en produccion.
- No se documentan limites de longitud de entrada, por lo que conviene trocear textos largos antes de la inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PrismLive/PrismVoice-TW
- PrimeTTS (modelo base): https://huggingface.co/Luigi/PrimeTTS
- Repositorio de Prism Live (Wave Foundry): https://github.com/ (enlace generico en la model card, sin URL concreta disponible)
- McBopomofo (datos de lexico, MIT): https://github.com/openvanilla/McBopomofo
- CMU Pronouncing Dictionary (BSD): https://github.com/cmusphinx/cmudict
