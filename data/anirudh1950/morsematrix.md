# Anirudh1950/MorseMatrix

## Resumen

MorseMatrix no es un modelo de inteligencia artificial, sino un proyecto de electrónica embebida publicado en Hugging Face bajo el identificador `Anirudh1950/MorseMatrix`. Consiste en un sketch de Arduino (`Morse.ino`) que codifica texto a código Morse y lo decodifica de vuelta, mostrando el resultado en una pantalla LCD 16x2 y reproduciendo el audio correspondiente mediante un zumbador o altavoz conectado a un pin digital. El repositorio incluye además una aplicación Gradio (`app.py`) para ejecutar el proyecto localmente.

El proyecto está desarrollado por Anirudh Bharadwaj (usuario `Anirudh1950`) y se distribuye con licencia MIT. No contiene pesos, arquitectura neuronal, tokenizador ni dataset de entrenamiento: el repositorio tiene un tamaño de 0.0 GB y cero descargas en el momento de la consulta. Por tanto, no procede evaluarlo como modelo de lenguaje.

Esta ficha se redacta siguiendo la estructura solicitada, pero debe interpretarse con la advertencia de que la mayoría de los campos técnicos propios de un modelo de IA no son aplicables y se marcan como "no disponible" o "no aplicable".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable (proyecto Arduino; no es un modelo neuronal) |
| Parametros totales | No aplicable |
| Parametros activos | No aplicable |
| Longitud de contexto | No aplicable |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | No disponible (el proyecto opera sobre caracteres ASCII A-Z, 0-9 y signos de puntuación) |
| Licencia | MIT (según la model card) |
| Formato de pesos | No aplicable (código fuente `.ino` y aplicación Gradio en Python) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El núcleo del proyecto es un programa en C++ para Arduino que implementa una tabla de correspondencias entre caracteres alfanuméricos y secuencias de puntos y rayas, aplica temporizaciones estándar de Morse (punto = 1 unidad de 200 ms, raya = 3 unidades, separación entre elementos = 1 unidad, entre caracteres = 3 unidades, entre palabras = 7 unidades) y controla periféricos: pantalla LCD 16x2 con desplazamiento automático, altavoz en el pin digital 6 a través de una resistencia de 220 Ω y comunicación serie a 9600 baudios.

Como funcionalidad adicional incorpora una transformación ROT-13 que se muestra en la segunda línea del LCD. El repositorio incluye también un `app.py` basado en Gradio y un `requirements.txt` para ejecutar el proyecto en local, aunque la model card indica que los scripts originales del proyecto permanecen sin cambios junto a esa aplicación.

## Capacidades

- Conversión de texto a código Morse para letras A-Z (sin distinguir mayúsculas), dígitos 0-9 y signos de puntuación (espacio, punto, coma, interrogación, barra, arroba, dos puntos, punto y coma, paréntesis, ampersand, igual, más, guion bajo, comillas, apóstrofo y exclamación).
- Decodificación de código Morse a texto.
- Salida de audio mediante zumbador o altavoz.
- Transformación ROT-13 mostrada en pantalla.
- Visualización en LCD 16x2 con desplazamiento automático para mensajes largos.
- Interfaz por monitor serie a 9600 baudios.
- Constantes configurables en el código: `dotLength` (200 ms por defecto), `speakerPin` (pin 6) y `scrollDelay` (500 ms).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni capacidades multilingües en el sentido de un LLM.

## Casos de uso

- Docencia de electrónica embebida: el proyecto sirve como práctica guiada para estudiantes que aprenden a conectar un LCD 16x2, un zumbador y un potenciómetro a un Arduino Uno o Nano, con un objetivo funcional claro (codificar y emitir Morse).
- Talleres de radioafición y comunicación alternativa: permite generar mensajes en Morse con salida audible y visual, útil en actividades divulgativas sobre telegrafía.
- Prototipo de dispositivo de accesibilidad: la combinación de salida visual (LCD) y sonora (zumbador) puede adaptarse como base para interfaces de comunicación aumentativa en entornos educativos.
- Práctica de protocolos de temporización: el código expone las constantes de duración de punto, raya y separaciones, lo que permite experimentar con velocidad de transmisión (WPM) y medir precisión temporal en el microcontrolador.
- Introducción a la comunicación serie: el monitor serie a 9600 baudios sirve para enseñar entrada/salida por UART y depuración de sketches.
- Base para proyectos de cifrado elemental: la inclusión de ROT-13 permite ilustrar transformaciones simétricas de texto junto a la codificación Morse en un mismo dispositivo.
- Demostración de despliegue con Gradio: el `app.py` incluido permite ejecutar una versión local del proyecto sin hardware, útil para pruebas y presentaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de aprendizaje automático, no existen métricas como MMLU, HumanEval o GSM8K aplicables.

## Requisitos de hardware

- Placa Arduino Uno, Nano o similar.
- Pantalla LCD 16x2, con o sin módulo I2C.
- Altavoz o zumbador de 8 Ω y 0,5 W.
- Potenciómetro de 10 kΩ para el contraste del LCD.
- Resistencia de 220 Ω para el altavoz.
- Cables de conexión y protoboard.
- Para la variante Gradio: Python con las dependencias de `requirements.txt` (`pip install -r requirements.txt` y `python app.py`).
- No requiere GPU ni VRAM. No aplican opciones de despliegue como vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

| Proyecto | Tipo | Plataforma | Licencia | Funcionalidad |
|---|---|---|---|---|
| MorseMatrix | Sketch Arduino + app Gradio | Arduino Uno/Nano | MIT | Texto a Morse, Morse a texto, audio, LCD, ROT-13 |
| Librerías de Morse para Arduino (genéricas) | Biblioteca C++ | Arduino | Variable | Codificación/decodificación Morse sin LCD ni audio integrados |
| Proyectos de telegrafía con temporización configurable | Sketch Arduino | Arduino | Variable | Emisión Morse con parámetros de velocidad ajustables |

No se dispone de datos comparativos de rendimiento medidos; la comparación es funcional, no cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni de IA: no genera texto, no razona y no procesa lenguaje natural. Cualquier expectativa en ese sentido es incorrecta.
- El repositorio tiene 0.0 GB y cero descargas; no hay evidencia de mantenimiento, pruebas automatizadas ni comunidad de usuarios.
- La licencia MIT se declara en la model card, pero el campo de licencia del repositorio en Hugging Face figura como "no disponible"; conviene verificar el archivo `LICENSE` en el repositorio de GitHub antes de un uso comercial.
- El conjunto de caracteres está limitado a ASCII básico; no hay soporte de acentos, eñes ni alfabetos no latinos, lo que restringe su uso con texto en castellano sin transliteración.
- La temporización Morse depende de retardos por software (`delay`), por lo que la precisión puede degradarse si se añaden tareas al bucle principal.
- El proyecto no incluye gestión de errores robusta más allá de las indicaciones de la sección de resolución de problemas (contraste, conexiones, baud rate).
- No hay información sobre sesgos, alucinación o restricciones de contexto porque no aplican a este tipo de proyecto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Anirudh1950/MorseMatrix
- Página del proyecto (Space): https://huggingface.co/spaces/Anirudh1950/MorseMatrix
- Código fuente en GitHub: https://github.com/rudzz1950/MorseMatrix
- Arduino (web oficial): https://www.arduino.cc/
- Licencia MIT: https://opensource.org/licenses/MIT
