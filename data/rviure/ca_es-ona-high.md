# Rviure/ca_ES-ona-high

## Resumen

`Rviure/ca_ES-ona-high` es una voz sintética femenina en catalán central para el sintetizador Piper, publicada por el proyecto Rviure. Se distribuye como modelo ONNX de alta calidad, con una frecuencia de muestreo de 22.050 Hz y un único hablante (la locutora «ona»). No es un modelo de lenguaje: es un sistema de texto a voz (TTS) que convierte una secuencia de texto catalán en audio inteligible.

El modelo nace de una necesidad concreta del proyecto RVIURE, una plataforma de compañía conversacional para personas mayores en residencias. El equipo necesitaba que el avatar de la aplicación no dependiera de las voces TTS instaladas en cada teléfono, después de que una residente castellanoparlante se quedara sin avatar porque su Android no tenía ninguna voz instalada. La solución fue empaquetar una voz catalana propia dentro de la aplicación.

Técnicamente, la voz se obtuvo mediante ajuste fino de un checkpoint de Piper (`en_US-ljspeech-high`) sobre 6,86 horas de grabaciones del corpus UPC-FestCat. La model card reporta una mejora sustancial frente a la voz catalana de referencia anterior: 3,0 errores por cada 100 palabras frente a 6,5, medida con Whisper. La licencia es CC BY-SA 3.0, heredada del corpus original, lo que impone obligaciones de atribución y de compartir igual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; Piper emplea por defecto una arquitectura VITS exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de síntesis de voz; procesa la frase de entrada) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos ONNX; la model card no detalla variantes de cuantización) |
| Idiomas soportados | catalán (código `ca`) |
| Licencia | CC BY-SA 3.0 |
| Formato de pesos | ONNX (librería Piper) |
| Frecuencia de muestreo | 22.050 Hz |
| Numero de hablantes | 1 (locutora «ona») |
| Tamano del repositorio | 0,1 GB |
| Calidad declarada | «high» |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo, más allá de identificarlo como una voz Piper de la familia «high». Piper es un sintetizador de texto a voz de extremo a extremo que distribuye sus voces como grafos ONNX; esta ficha no puede confirmar detalles de capas, atención o decodificador más allá de lo que el autor declara, por lo que esos datos figuran como no disponibles.

El entrenamiento se realizó por ajuste fino sobre el checkpoint `en_US-ljspeech-high` de Piper, entrenado originalmente sobre el corpus LJ Speech (de dominio público). Los datos de ajuste son 6,86 horas de grabaciones de la locutora «ona» procedentes del corpus UPC-FestCat, distribuido por Col·lectivaT. El proceso consistió en 278 pasadas (epochs) sobre dichas grabaciones. No se menciona en la model card el uso de RLHF, DPO ni ningún otro método de alineación por preferencias, algo por otro lado poco habitual en modelos TTS.

Como innovación destacable, el autor señala que la voz no requiere retoques manuales de fonemas: pronuncia correctamente la erre fuerte a inicio de palabra, algo que en la voz de calidad media obligaba a reforzarla a mano. Esa eliminación del preprocesado fonético ad hoc es relevante para pipelines de producción, porque reduce el código específico por voz.

## Capacidades

- Síntesis de voz (text-to-speech) en catalán central a partir de texto plano.
- Voz femenina única, con frecuencia de muestreo de 22.050 Hz.
- Pronunciación correcta de la erre fuerte a inicio de palabra sin retoque manual de fonemas.
- Integración nativa con Piper (`piper1-gpl`), lo que permite ejecución local sin depender de servicios en la nube.
- Funcionamiento sin conexión: al ser un modelo ONNX empaquetable, la aplicación puede llevar la voz incorporada en lugar de depender de las voces instaladas en el sistema operativo.
- Capacidad de ser evaluada de forma objetiva con ASR: la propia model card usa Whisper «small» en catalán para medir la inteligibilidad.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento: no es un modelo de lenguaje generativo, sino un sintetizador.
- Multilingüismo: únicamente catalán. No hay soporte declarado para castellano ni otras lenguas.

## Casos de uso

- Aplicaciones de acompañamiento conversacional para personas mayores: es el caso de uso original del proyecto RVIURE. La voz se empaqueta dentro de la aplicación, de modo que el avatar funciona aunque el dispositivo no tenga ninguna voz TTS instalada, evitando que el usuario se quede sin interfaz por una configuración del sistema.
- Lectura en voz alta y audiolibros en catalán: el modelo convierte texto largo en audio con una voz única y consistente, adecuada para narración continua.
- Accesibilidad y lectores de pantalla en catalán: permite dotar de voz a aplicaciones que necesitan leer contenido en catalán sin recurrir a voces propietarias o a servicios en la nube, manteniendo los datos en el dispositivo.
- Sistemas de megafonía y anuncios automatizados en catalán: aeropuertos, estaciones, comercios o recintos que necesitan anuncios dinámicos generados a partir de texto (por ejemplo, cambios de andén o avisos de turno).
- Contestador automático e IVR telefónico en catalán: la voz puede sintetizar menús y respuestas dinámicas en un sistema de atención telefónica, generando el audio en el propio servidor.
- Material educativo y de aprendizaje de catalán: generación de ejercicios auditivos, dictados o contenidos de refuerzo con una pronunciación controlada y reproducible.
- Sistemas embebidos y domótica: al ser un modelo ONNX de 0,1 GB, encaja en asistentes de voz locales y en plataformas domóticas que necesitan TTS offline en catalán.
- Doblaje y prototipado de contenido audiovisual: generación de pistas de voz temporales en catalán para validar guiones o maquetas antes de contratar una locución humana.

## Benchmarks y rendimiento

La model card publica una evaluación de inteligibilidad medida con Whisper «small» en catalán. La métrica son errores por cada 100 palabras (tasa de error de palabras, WER).

| Prueba | Sistema | Errores por 100 palabras |
|---|---|---|
| 12 frases de conversación, 3 repeticiones cada una | `ca_ES-upc_ona-medium` (voz de referencia anterior) | 6,5 |
| 12 frases de conversación, 3 repeticiones cada una | `ca_ES-ona-high` (este modelo) | 3,0 |
| 30 frases de lectura del corpus UPC-FestCat | Locutora real «ona» (grabación humana) | 10,5 |
| 30 frases de lectura del corpus UPC-FestCat | `ca_ES-ona-high` | 12,9 |

El autor destaca que, en la prueba de conversación, la voz sintética mejora a la voz de referencia anterior en más del doble. En la prueba de lectura difícil, la voz sintética se queda a 2,4 puntos de la locutora humana medida con el mismo procedimiento. No se han publicado otros benchmarks (MOS, similitud de hablante, latencia) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Al ser un modelo ONNX de Piper de 0,1 GB de repositorio, la inferencia puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no aplica. El modelo está pensado para ejecución en CPU; no se documenta ninguna GPU recomendada.
- Compatibilidad con GPU de consumo: irrelevante en la práctica, ya que no requiere GPU. Cabe en cualquier equipo de consumo e incluso en dispositivos móviles y placas tipo Raspberry Pi, siempre que el runtime de Piper esté disponible.
- Opciones de despliegue: Piper (`piper1-gpl`), ONNX Runtime, integraciones de asistentes de voz locales compatibles con Piper (por ejemplo, Home Assistant o Rhasspy). vLLM, llama.cpp, Ollama y TGI no aplican, porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Almacenamiento: 0,1 GB de repositorio, lo que permite empaquetar la voz junto a la aplicación sin un coste de espacio significativo.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Calidad | WER (12 frases de conversación) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Rviure/ca_ES-ona-high` | Piper / ONNX | Catalán | high | 3,0 errores por 100 palabras | CC BY-SA 3.0 | HuggingFace |
| `ca_ES-upc_ona-medium` | Piper / ONNX | Catalán | medium | 6,5 errores por 100 palabras | no disponible en esta ficha | no disponible en esta ficha |
| Locutora humana «ona» (UPC-FestCat) | Grabación real | Catalán | referencia | 10,5 errores por 100 palabras (30 frases de lectura) | CC BY-SA 3.0 (corpus) | Col·lectivaT |

No se dispone de datos comparativos con otras familias TTS (por ejemplo, XTTS, Bark o voces Piper de otros idiomas) en la información proporcionada, por lo que la comparación se limita a las alternativas evaluadas por el propio autor.

## Limitaciones y advertencias

- Es una voz sintética: el autor pide explícitamente que cualquier aplicación que la use deje claro al oyente que no está hablando con una persona.
- Sesgos conocidos: no se documentan sesgos específicos. Al entrenarse sobre una única locutora de un corpus concreto, la voz reproduce sus características de edad, acento y timbre.
- Riesgo de error de pronunciación: aunque la model card destaca la mejora en la erre fuerte, siguen existiendo 12,9 errores por cada 100 palabras en frases de lectura difíciles, frente a los 10,5 de la locutora humana. En nombres propios, siglas, cifras o palabras poco frecuentes el riesgo de pronunciación incorrecta es mayor.
- Cobertura de idioma limitada al catalán. No hay soporte declarado de castellano ni de otras lenguas.
- Restricciones de licencia: CC BY-SA 3.0 obliga a citar la Universitat Politècnica de Catalunya (corpus UPC-FestCat) y Col·lectivaT, y a distribuir cualquier obra derivada bajo la misma licencia. Esto condiciona el uso comercial: se permite, pero con atribución y con obligación de compartir igual las obras derivadas.
- Contexto de entrada: al ser un modelo TTS, la noción de ventana de contexto no aplica; la calidad puede degradarse con frases muy largas o con puntuación atípica, aunque no se documenta el comportamiento exacto.
- Trazabilidad del modelo base: el ajuste parte de `en_US-ljspeech-high`, un checkpoint preentrenado en inglés, lo que puede introducir trazas acentuales residuales del idioma de origen.
- Estado del repositorio: 0 descargas y 1 «like» en el momento de redactar esta ficha, lo que indica un modelo reciente y con poca validación externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rviure/ca_ES-ona-high
- Piper (repositorio `piper1-gpl`): https://github.com/OHF-Voice/piper1-gpl
- Corpus UPC-FestCat, distribuido por Col·lectivaT: https://collectivat.cat/asr#upc-festcat-tts-corpora
- Col·lectivaT: https://collectivat.cat/
