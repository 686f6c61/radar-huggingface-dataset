# chiakic/chiaki-diffsinger

## Resumen

Chiaki es un banco de voces cantadas (voicebank) de sintesis de voz por difusion (DiffSinger) para su uso en OpenUtau, el editor de sintesis vocal abierto. Lo desarrolla chiakic a partir de la voz de la personaje Suzukaze Chiaki, y su proposito es ofrecer una voz cantada multilingue de calidad utilizable en produccion musical, doblaje cantado y prototipado de canciones sin coste de licencia. Se distribuye como un paquete `Chiaki.zip` de aproximadamente 0,5 GB que contiene los modelos acustico, de pitch, de varianza y de duracion, junto con un vocoder NSF-HiFiGAN propio (`chiaki_vocoder 2026.11`, Apache-2.0).

Tecnicamente no es un modelo de lenguaje: es un sistema de sintesis de canto condicionado por partitura (letra, nota, duracion y pitch), con fonemizadores especificos por idioma. La version actual es la v1.5 (23 de noviembre de 2026), que sustituye el vocoder por uno entrenado desde cero bajo licencia Apache-2.0 y mantiene sin cambios los modelos acustico, de pitch, de varianza y de duracion respecto a v1.4-beta.10. El interes actual reside en que cubre 28 idiomas (13 entrenados, 2 con fonemizadores dedicados y 13 derivados de fonemas existentes) y permite uso comercial de las obras generadas con atribucion.

La licencia es propia (`chiaki-voicebank-terms`), no abierta en el sentido OSI: el voicebank no puede redistribuirse por separado ni modificarse, aunque las obras creadas con el si pueden publicarse y venderse. Esta distincion es critica para equipos que evaluen su integracion en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiffSinger (version mantenida por OpenVPI): modelo acustico de difusion + modelos de pitch, varianza y duracion; vocoder NSF-HiFiGAN (`chiaki_vocoder 2026.11`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica: entrada por partitura, no por secuencia de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 28: ja, zh, en, ko, fr, es, it, pt, de, ru, pl, uk, th (entrenados); fi, la (fonemizadores dedicados); be, bg, mk, hbs, lo, ca, gl, id, ms, eo, sw, haw, mi (derivados de fonemas existentes) |
| Licencia | `chiaki-voicebank-terms` (licencia propia; vocoder aparte bajo Apache-2.0) |
| Formato de pesos | paquete `Chiaki.zip` para OpenUtau; pesos individuales en formato nativo de DiffSinger (no se detalla) |
| Tamano del repositorio | 0,5 GB |
| Version actual | v1.5 (2026-11-23) |
| Entrada | Letra + nota + duracion + pitch (partitura USTX/OpenUtau) |

## Arquitectura y entrenamiento

El sistema sigue la arquitectura DiffSinger en su rama mantenida por OpenVPI: un modelo acustico generativo de difusion que produce mel-espectrogramas a partir de la partitura y de caracteristicas linguisticas, acompanado de modelos auxiliares de pitch, varianza (duracion y energia) y duracion que condicionan la generacion. La salida del modelo acustico se convierte en audio mediante el vocoder NSF-HiFiGAN `chiaki_vocoder 2026.11`, entrenado desde cero por Chiaki.C sobre VocalSet (CC BY 4.0), NIT SONG070 F001 (CC BY 3.0) y grabaciones propias del creador.

Los datos de entrenamiento del voicebank incluyen la base de datos de canto Nitech Japanese Speech Database "NIT SONG070 F001" del Instituto de Tecnologia de Nagoya (CC BY 3.0) y grabaciones de la voz de Suzukaze Chiaki. No se especifica el volumen total de audio, el numero de pasos de entrenamiento ni si se aplicaron tecnicas de ajuste fino perceptual o de estilo. El sistema incorpora de serie funciones de post-proceso habitualmente externas: mezcla de voces (voice blending), ataques limpios en vocales iniciales de frase, silencio en silencios de partitura, y correccion espectral y de claridad, sin necesidad de configuracion adicional. Los pasos de render recomendados son Acustico 20, Varianza 40 y Pitch 10, y el desplazamiento de tono (SHFC) funciona pero debe mantenerse por encima de -7 semitonos.

## Capacidades

- Sintesis de voz cantada multilingue a partir de partitura (letra, nota, duracion, pitch) en 28 idiomas.
- Mayor calidad declarada en japones, ingles y chino, que son los idiomas con entrenamiento principal.
- Fonemizadores dedicados para fines y latin eclesiastico, incluidos en la distribucion OpenUtau-Chiaki.
- Fonemizadores adicionales (un DLL por idioma) para los 13 idiomas derivados: belaruso, bulgaro, macedonio, serbocroata, lao, catalan, gallego, indonesio, malayo, esperanto, suajili, hawaiano y maori.
- Control de expresion mediante los modelos de varianza y pitch: duracion de notas, energia y curva de tono.
- Voice blending integrado para combinar timbres.
- Ataques limpios en vocales iniciales de frase y silencio automatico en silencios de partitura.
- Correccion espectral y de claridad integradas, sin post-proceso externo.
- Desplazamiento de tono (SHFC) para transposicion dentro de un rango seguro (por encima de -7 semitonos).
- No dispone de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento: no es un modelo de lenguaje.

## Casos de uso

- Produccion musical independiente: un compositor puede generar las pistas vocales de una maqueta o de un tema final en OpenUtau seleccionando a Chiaki como cantante y el fonemizador correspondiente al idioma de la letra, con uso comercial permitido y atribucion "Vocal: Chiaki".
- Doblaje cantado de canciones: para adaptar un tema a otro idioma, se reescribe la letra y se selecciona el fonemizador del idioma destino; los 13 idiomas entrenados ofrecen la calidad mas alta, mientras que los derivados sirven para pruebas o versiones con acento marcado.
- Videojuegos y aplicaciones con voz cantada embebida: la licencia permite incrustar el voicebank en juegos y apps siempre que los usuarios no puedan extraer sus archivos, lo que encaja en menus musicales, cinemáticas o minijuegos de ritmo.
- Prototipado rapido de canciones para encargos: permite entregar demos cantadas antes de contratar una voz humana, con pasos de render documentados (Acustico 20, Varianza 40, Pitch 10) y sin necesidad de post-proceso.
- Investigacion en sintesis de canto: al ser un sistema DiffSinger con vocoder Apache-2.0, sirve como referencia reproducible para experimentos de sintesis condicionada por partitura y evaluacion multilingue, con la restriccion de que los modelos derivados entrenados sobre su audio son solo para investigacion y uso no comercial.
- Contenido para creadores y plataformas: covers, canciones originales y videos musicales con la ilustracion oficial de shONe permitida en portadas y MV, con atribucion y sin uso del retrato fuera del ambito del voicebank.
- Localizacion de contenido musical educativo: generacion de ejemplos cantados en multiples idiomas para ensenanza de pronunciacion o de prosodia, aprovechando los fonemizadores por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, MCD, F0 RMSE) ni comparaciones cuantitativas con otros voicebanks.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el paquete completo ocupa 0,5 GB, por lo que la inferencia es viable en GPU de gama baja y en CPU, aunque no se documentan cifras.
- GPU recomendadas: no disponible. Por el tamano del paquete, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) deberia ser suficiente, pero no hay confirmacion del autor.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del repositorio; sin datos oficiales de consumo en inferencia.
- Opciones de despliegue: OpenUtau (version estandar con instalacion manual del zip, o la build OpenUtau-Chiaki con el voicebank y los fonemizadores integrados). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Los pasos de render recomendados (Acustico 20, Varianza 40, Pitch 10) influyen directamente en el tiempo de sintesis, pero no se publican tiempos por minuto de audio.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Uso comercial de obras | Disponibilidad |
|---|---|---|---|---|---|
| Chiaki v1.5 | DiffSinger para OpenUtau | 28 (13 entrenados) | `chiaki-voicebank-terms` (propia) | Si, con atribucion | Hugging Face y GitHub |
| Voicebanks UTAU genericos | UTAU (concatenativo) | Variable, habitualmente 1-2 | Variable por autor | Variable | Repositorios de la comunidad |
| Voicebanks DiffSinger de OpenVPI | DiffSinger | Variable | Variable | Variable | GitHub de OpenVPI |
| Vocoder `chiaki_vocoder 2026.11` | NSF-HiFiGAN | no aplica | Apache-2.0 | Si, sin restricciones | Incluido en el paquete |

No se dispone de datos de rendimiento comparativo entre Chiaki y otros voicebanks en la informacion proporcionada, por lo que la comparacion se limita a parametros estructurales y licencia.

## Limitaciones y advertencias

- La licencia es propia y restrictiva: prohibe la ingenieria inversa de los archivos del modelo y la extraccion o modificacion de sus pesos.
- No se permite vender ni distribuir el voicebank por separado; hay que enlazar a la pagina oficial de descarga.
- El uso comercial de obras esta permitido con atribucion ("Vocal: Chiaki"), pero los modelos derivados entrenados sobre audio generado con Chiaki quedan limitados a investigacion y uso no comercial, con contacto previo al creador para cualquier uso comercial.
- Prohibido suplantar a Chiaki o al creador y usar el voicebank para danar su reputacion.
- El retrato de shONe solo puede usarse en contextos relacionados con el voicebank; no se permite extraer ni reutilizar el icono.
- Los 13 idiomas derivados (belaruso, bulgaro, macedonio, serbocroata, lao, catalan, gallego, indonesio, malayo, esperanto, suajili, hawaiano y maori) presentan un acento mas marcado al construirse a partir de fonemas existentes, no de entrenamiento especifico.
- El desplazamiento de tono (SHFC) por debajo de -7 semitonos degrada la calidad segun las indicaciones del autor.
- No hay datos publicados sobre sesgos, tasas de alucinacion (concepto no aplicable a sintesis de canto) ni evaluacion perceptual objetiva.
- En caso de discrepancia entre traducciones de los terminos, prevalece la version en chino.
- El modelo esta fechado en 2026 y su version es la v1.5; las versiones anteriores pueden seguir descargandose por tag, pero no se garantiza su soporte.

## Enlaces

- Hugging Face: https://huggingface.co/chiakic/chiaki-diffsinger
- Pagina oficial, demos y terminos: https://chiaki.ch/character/chiaki
- Terminos de licencia: https://chiaki.ch/character/chiaki#chiaki-terms
- Build OpenUtau-Chiaki: https://github.com/chiakich/OpenUtau-chiaki/releases/latest
- Fonemizadores de idiomas adicionales: https://github.com/chiakich/OpenUtau-chiaki/releases/download/phonemizers-v2/ChiakiPhonemizers.zip
- DiffSinger (OpenVPI): https://github.com/OpenVPI/DiffSinger
