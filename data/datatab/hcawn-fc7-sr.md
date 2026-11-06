# datatab/hcawn-fc7-sr

## Resumen

hCAWN-FC7-sr es un modelo de lenguaje extremadamente compacto (5.742.720 parámetros) desarrollado por datatab, especializado en function calling y tool calling para serbiano (latino). Su función es convertir una frase en lenguaje natural en una llamada JSON a una de siete acciones de teléfono predefinidas (enviar correo, crear evento de calendario, crear contacto, mostrar mapa, abrir ajustes de Wi-Fi, encender linterna, apagar linterna). Está pensado para ejecutarse en CPU, sin conexión de red y sin enviar texto fuera del dispositivo.

El modelo es la versión serbia de hCAWN-FC7, un modelo base preentrenado en inglés que aquí se ajusta mediante SFT en tres fases sobre peticiones serbias. Emplea una arquitectura híbrida propia de la familia hCAWN: seis capas (cuatro de memoria asociativa recurrente y dos de atención local), tamaño oculto de 128 y cuatro cabezas. No usa tokenizador: opera a nivel de byte UTF-8 con un vocabulario de 258 símbolos, lo que le permite manejar caracteres serbios (č, ć, š, ž, đ) sin soporte especial.

Su relevancia radica en la eficiencia: los pesos int4 ocupan 3,9 MB y los int8 6,0 MB, con latencias del orden de 0,6 a 1,0 segundos por petición en CPU. Es un caso de estudio de modelos de lenguaje ultrapequeños orientados a una tarea fija y a despliegue on-device, con un mecanismo de umbral de confianza que evita ejecutar acciones cuando el modelo no está seguro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hCAWN híbrida: 6 capas (4 de memoria asociativa recurrente y 2 de atención local), tamaño oculto 128, 4 cabezas |
| Parametros totales | 5.742.720 (5,74 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (6,0 MB) e int4 empaquetado (3,9 MB); formato binario propio |
| Idiomas soportados | serbio (latino) |
| Licencia | CC BY 4.0 |
| Formato de pesos | binario propio del motor hCAWN (`int8.bin`, `int4.bin`); no compatible con `transformers` |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido de la familia hCAWN que combina cuatro capas de memoria asociativa recurrente con dos capas de atención local, con tamaño oculto de 128 y cuatro cabezas. El vocabulario consta de 258 símbolos: los 256 bytes UTF-8 crudos más las marcas de inicio y fin. Al no haber tokenizador, la entrada y la salida se procesan byte a byte, y la salida es una lista JSON de llamadas decodificada byte a byte.

El entrenamiento parte del modelo público hCAWN-FC7, preentrenado en inglés y sin exposición previa al serbio. Sobre esa base se aplica SFT en tres pasos: primero peticiones simples traducidas, después peticiones con múltiples acciones y finalmente una mezcla que incluye peticiones mal escritas (sin diacríticos, con erratas, en minúsculas). El último paso consta de 5.421 pasos, 2 épocas y unos 21.700 ejemplos por época. Los datos provienen del conjunto Mobile Actions de Google (CC BY 4.0), con peticiones en inglés traducidas automáticamente al serbio latino mediante Gemini 2.5 Flash Lite en varias variantes de estilo; las variantes que no conservan literalmente nombres, correos, teléfonos y direcciones, o cuyo datetime no coincide con la regla de fechas, se descartan automáticamente. Las fechas relativas ("sutra u 15h", "u petak", "za 3 dana") se calculan mediante una regla a partir del reloj del dispositivo, no por el modelo.

## Capacidades

- Generación de llamadas a funciones en formato JSON para un conjunto fijo de siete acciones: `send_email`, `create_calendar_event`, `create_contact`, `show_map`, `open_wifi_settings`, `turn_on_flashlight` y `turn_off_flashlight`.
- Extracción de argumentos estructurados: destinatario, asunto y cuerpo en correos; título y fecha/hora en eventos; nombre, apellido, teléfono y correo en contactos; consulta en mapas.
- Manejo de peticiones con múltiples acciones encadenadas ("ugasi lampu pa pošalji mejl...").
- Robustez ante texto mal escrito: sin diacríticos, con erratas, en minúsculas y con fórmulas de cortesía ("molim te", "hvala").
- Rechazo de peticiones que no corresponden a ninguna de las siete acciones ("koliko je sati"), devolviendo "no estoy seguro" en lugar de una llamada errónea.
- Umbral de confianza (0,9) que filtra las respuestas de baja certeza.
- No soporta tool calling genérico ni conjuntos de herramientas arbitrarios; no dispone de modo thinking, visión ni audio.

## Casos de uso

- Asistentes de voz o texto en aplicaciones móviles serbias: el modelo traduce una orden como "upali lampu" en la llamada `turn_on_flashlight`, ejecutable localmente en el teléfono sin enviar audio ni texto a la nube.
- Automatización de correo desde el dispositivo: convierte "pošalji mejl na pera@gmail.com sa naslovom Sastanak i tekstom Kasnim 10 minuta" en una llamada `send_email` con los tres argumentos extraídos, útil en clientes de correo que quieran dictado offline.
- Gestión de agenda y recordatorios: "zakazi sastanak sa Markom sutra u 15h" genera un `create_calendar_event`; la fecha se resuelve con la regla del reloj del dispositivo, lo que permite programar recordatorios sin conexión.
- Creación de contactos por dictado: "dodaj kontakt Marko Petrović 064 123 4567" produce un `create_contact` con nombre, apellido y teléfono, adecuado para apps de contactos con entrada por voz.
- Apertura de ajustes del sistema: "otvori Wi-Fi" mapea a `open_wifi_settings`, útil en asistentes de accesibilidad o launchers que quieran ofrecer accesos directos por lenguaje natural.
- Búsqueda de lugares: "gde je Trg republike u Beogradu" genera un `show_map` con la consulta; aunque es la acción con menor precisión (≈48%), sirve para prototipos de navegación por voz.
- Despliegue en dispositivos de bajos recursos: con 3,9 MB en int4 y ejecución en CPU, encaja en entornos embebidos, navegadores o terminales sin GPU y sin red.

## Benchmarks y rendimiento

Evaluación de precisión estricta (exact match: nombre de la acción y todos los valores de los argumentos correctos) sobre 450 peticiones serbias escritas por GPT-4o-mini a partir del test Mobile Actions en inglés, nunca usadas en entrenamiento y reescritas de forma "sucia" (sin diacríticos, con erratas, minúsculas y añadidos como "molim te" o "hvala"). Error de medida aproximado de ±2 puntos.

| Modelo / archivo | Tamaño | Precisión (conjunto sucio) | Precisión con umbral 0,9 | Correctas entre respondidas |
|---|---|---|---|---|
| `int8.bin` | 6,0 MB | 85,1% | 80,2% | 97,5% |
| `int4.bin` | 3,9 MB | 84,9% | 78,4% | 96,6% |

Datos adicionales aportados por el autor:

- En el conjunto limpio (sin ruido), `int8` alcanza aproximadamente el 86% (86,4%).
- La salida es JSON válido en el 100% de los casos para `int8` y el 99,8% para `int4`, y contiene únicamente acciones conocidas.
- Con umbral de confianza 0,9, el modelo responde a cerca del 80% de las peticiones y acierta en torno al 97% de ellas; en el resto indica "no estoy seguro" sin emitir llamada.
- Precisión por acción en el conjunto sucio: linterna, Wi-Fi y contactos 94-100%; calendario ≈85%; mapa ≈48% (punto más débil).

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el motor local está diseñado para CPU. Los pesos ocupan 3,9 MB (int4) o 6,0 MB (int8).
- GPU recomendadas: no disponible; no se menciona soporte de GPU.
- Cabe en cualquier GPU de consumo y, de hecho, no la necesita: funciona en CPU convencional.
- Opciones de despliegue: motor propio hcawn-fc (`pip install "hcawn-fc>=0.2.0"`), con descarga de pesos mediante `hcawn-fc download sr-int8` y ejecución con `hcawn-fc --model sr-int8 "upali lampu"`. También existe API Python (`from hcawn_fc import Local`). No es compatible con vLLM, llama.cpp, Ollama, TGI ni `transformers`.
- Plataformas: motor local para Linux x86-64; en Windows y macOS el paquete actúa como cliente del demo alojado.
- Latencia y throughput: aproximadamente 0,6 s por petición con int8 y 1,0 s con int4 en la medición del autor; el int4 es más lento en CPU a pesar de ocupar menos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. A continuación se comparan características estructurales con alternativas de la misma categoría (modelos pequeños orientados a function calling), indicando "no disponible" cuando no hay datos verificables.

| Modelo | Parámetros | Contexto | Precisión function calling | Licencia | Formato |
|---|---|---|---|---|---|
| hCAWN-FC7-sr | 5,74 M | no disponible | 85,1% (int8, conjunto sucio propio) | CC BY 4.0 | binario propio |
| hCAWN-FC7 (base, inglés) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas pequeñas de function calling | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Conjunto de acciones cerrado: solo reconoce siete acciones de teléfono; no admite herramientas arbitrarias ni esquemas definidos por el usuario.
- Precisión muy desigual por acción: la acción `show_map` ronda el 48% en el conjunto sucio, frente al 94-100% de linterna, Wi-Fi y contactos y el ≈85% de calendario.
- Solo serbio latino: no soporta cirílico ni otros idiomas; el modelo base estaba en inglés y el ajuste se hizo exclusivamente sobre serbio.
- Riesgo de alucinación controlado pero presente: con umbral 0,9, alrededor del 20% de las peticiones se rechazan y, entre las respondidas, en torno al 2,5-3,4% son incorrectas. Sin umbral, la precisión baja al 85%.
- Dependencia de la regla de fechas: los datetimes relativos se calculan fuera del modelo con el reloj del dispositivo; un reloj mal configurado produce argumentos de fecha incorrectos.
- Formato de pesos propietario: no se puede cargar con `transformers`, vLLM, llama.cpp, Ollama ni TGI; requiere el motor hcawn-fc.
- Soporte de plataforma limitado: el motor local solo existe para Linux x86-64; en Windows y macOS se depende de un demo alojado, lo que rompe la promesa de procesamiento totalmente local.
- Licencia CC BY 4.0: permite uso comercial con atribución; conviene revisar los términos de los datos de origen (Mobile Actions, CC BY 4.0) y la atribución requerida.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al derivarse de traducciones automáticas con Gemini 2.5 Flash Lite, pueden heredarse sesgos de traducción y de estilo.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; modelo recién publicado, sin validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/datatab/hcawn-fc7-sr
- Modelo base hCAWN-FC7: https://huggingface.co/datatab/hcawn-fc7
- Demo en Spaces: https://huggingface.co/spaces/datatab/hcawn-fc7-sr-demo
- Paquete PyPI: https://pypi.org/project/hcawn-fc/
- Repositorio GitHub: https://github.com/hCAWNfc/hcawnfc
- Conjunto de datos Mobile Actions (Google, CC BY 4.0): no disponible en la información proporcionada
