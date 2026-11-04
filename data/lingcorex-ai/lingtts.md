# LingCoreX-AI/LingTTS

## Resumen

LingTTS es un modelo de síntesis de voz neuronal (text-to-speech) para mandarín que se ejecuta de forma totalmente offline en microcontroladores de la familia ESP32-S3. Lo desarrolla LingCoreX-AI y se distribuye como un SDK de comunidad a través de GitHub: el repositorio de HuggingFace contiene únicamente la model card, no pesos autónomos, y no es un checkpoint compatible con Transformers. El problema que resuelve es la síntesis de habla en dispositivos con recursos muy limitados (sin conexión a la nube), un escenario típico de electrodomésticos, dispositivos de asistencia y electrónica de consumo con conectividad intermitente o requisitos de privacidad.

La versión actual es una preview de comunidad, 0.2.0-rc1, que sintetiza voz en mandarín a 16 kHz, 16 bits, mono, con salida PCM por fragmentos. En una placa ESP32-S3 N16R8 a 240 MHz con ESP-IDF 5.5.6, el modelo alcanza un RTF de 0,42 con PSRAM y 0,48 usando RAM interna, con un primer fragmento PCM disponible entre 0,27 y 0,32 segundos desde la invocación. El paquete ocupa unos 1,83 MB por voz base y unos 2,6 MB en flash incluyendo motor y diccionario, lo que permite integrarlo en placas con 4 MB de flash.

El modelo no publica arquitectura interna, recuento de parámetros ni detalles de entrenamiento; el autor indica explícitamente que el tamaño de fichero no debe interpretarse como número de parámetros. La licencia es propia (LingTTS Community License 1.0): el uso personal, educativo y de I+D interno es gratuito, pero el despliegue comercial requiere autorización escrita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo neuronal de TTS empaquetado y cuantizado; no se especifica la topología interna) |
| Parametros totales | No disponible (el autor indica que el recuento verificado no se ha publicado) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible (TTS sobre texto de entrada, sin ventana de contexto declarada) |
| Tipos de cuantizacion | Modelo desplegado ya cuantizado y empaquetado; no se detallan los esquemas de cuantización |
| Idiomas soportados | Chino mandarín (principal); inglés limitado a letras y unas 80 palabras comunes, sin frases completas |
| Licencia | LingTTS Community License 1.0 (motor y modelo no son software libre); ejemplos y cabeceras públicas bajo MIT |
| Formato de pesos | Empaquetado propietario dentro del SDK de comunidad (no safetensors, no GGUF, no Transformers) |
| Salida de audio | PCM mono, 16 kHz, 16 bits, entregado por fragmentos |
| Tamano del modelo | Aproximadamente 1,83 MB por voz base (segunda voz opcional del mismo tamano) |
| Huella en flash | Aproximadamente 2,6 MB (libreria, modelo y diccionario) |
| Memoria en ejecucion | 2,63 MB de PSRAM + ~1 KB de RAM interna, o 151 KB de RAM interna sin PSRAM |
| Plataforma objetivo | ESP32-S3 (probado en N16R8 a 240 MHz con ESP-IDF 5.5.6) |
| Version | 0.2.0-rc1 (preview de comunidad) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo (tipo de red, capas, mecanismos de atención o decodificador acústico), ni sobre el conjunto de datos de entrenamiento, el número de tokens, la composición del corpus o si se aplicaron técnicas de alineamiento como RLHF o DPO. La información disponible se limita a la descripción funcional: es un modelo neuronal de TTS para mandarín que opera íntegramente en el dispositivo, con un front-end de texto que forma parte del ejemplo "hello" medido en los benchmarks de rendimiento.

La innovación técnica destacable no está en la arquitectura declarada, sino en el despliegue: el modelo y el motor están empaquetados y cuantizados para caber en torno a 2,6 MB de flash y ejecutarse en un ESP32-S3, con un RTF inferior a 1 (síntesis más rápida que tiempo real) y latencia al primer fragmento PCM de 0,27 a 0,32 segundos. El SDK proporciona una interfaz de integración sobre ESP-IDF, y la demo online ejecuta el mismo código C y el mismo modelo compilados para un servidor PC, lo que permite evaluar la calidad sin placa.

## Capacidades

- Síntesis de voz en mandarín a partir de texto chino: cuentos, pasajes cortos e información de dispositivo.
- Ejecución completamente offline en ESP32-S3, sin conexión a la nube.
- Salida de audio PCM mono a 16 kHz y 16 bits, entregada por fragmentos para reproducción en streaming.
- Front-end de texto incluido en el pipeline de síntesis (normalización y diccionario empaquetados).
- Soporte limitado de inglés: letras y alrededor de 80 palabras comunes, no frases completas.
- Dos voces base disponibles (la segunda es opcional y ocupa aproximadamente lo mismo que la primera).
- Integración mediante SDK sobre ESP-IDF y demo Wi-Fi con punto de acceso propio para pruebas en placa.
- No soporta SSML, control de emoción ni control de velocidad.
- No se documentan tool calling, function calling, razonamiento multi-paso ni capacidades de agente; es un modelo de TTS, no un LLM.

## Casos de uso

- Dispositivos de asistencia y electrodomésticos con avisos hablados en mandarín: el modelo sintetiza frases cortas de estado o información de dispositivo localmente, sin depender de conectividad ni de servicios en la nube, con un primer fragmento PCM en torno a 0,3 segundos.
- Domótica y paneles de control con requisitos de privacidad: al ejecutarse íntegramente en el ESP32-S3, el texto del usuario no sale del dispositivo, lo que facilita el cumplimiento de requisitos de privacidad en entornos domésticos.
- Juguetes educativos y lectores de cuentos infantiles: el modelo puede narrar cuentos y pasajes cortos en chino desde flash, con un RTF de 0,42 que permite reproducir audio en tiempo real en una placa N16R8.
- Señalización y megafonía de bajo coste: anuncios pregrabados dinámicamente (por ejemplo, números de turno o nombres) generados en el propio dispositivo, útiles en comercios o pequeñas oficinas donde no se quiere desplegar infraestructura de servidor.
- Prototipos de producto y pruebas de concepto de I+D interna: la licencia permite uso gratuito en prototipos y pruebas internas de empresa, lo que facilita validar la experiencia de voz antes de negociar una licencia comercial.
- Dispositivos con conectividad intermitente o inexistente: aplicaciones en entornos rurales, industriales o de campo donde la síntesis en la nube no es viable, aprovechando que el paquete completo cabe en 4 MB de flash.
- Evaluación de calidad de voz sin hardware: la demo online ejecuta el mismo código C y modelo compilados para PC, lo que permite comparar la calidad de síntesis antes de adquirir una placa ESP32-S3 N16R8 con amplificador MAX98357A y altavoz.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de rendimiento en dispositivo (ESP32-S3 N16R8 a 240 MHz con ESP-IDF 5.5.6), no benchmarks de calidad de voz como MMLU, HumanEval o GSM8K, que no aplican a un modelo de TTS.

| Metrica | Resultado medido |
|---|---|
| Formato de audio | 16 kHz, 16 bits, mono, PCM por fragmentos |
| RTF (con PSRAM) | 0,42 (ejemplo "hello", incluye front-end de texto) |
| RTF (RAM interna) | 0,48 (ejemplo "hello", incluye front-end de texto) |
| RTF (demo Wi-Fi) | 0,53–0,54 |
| Primer PCM | 0,27–0,32 s desde la invocación (no es latencia de reproducción en altavoz) |
| Memoria (con PSRAM) | 2,63 MB de PSRAM + ~1 KB de RAM interna |
| Memoria (sin PSRAM) | 151 KB de RAM interna |
| Flash | ~2,6 MB (librería, modelo y diccionario); cabe en 4 MB según particiones |
| Tamano de modelo | ~1,83 MB por voz base |

No se han publicado resultados de calidad subjetiva (MOS), inteligibilidad ni comparativas con otros sistemas TTS en la información disponible.

## Requisitos de hardware

- Plataforma objetivo: ESP32-S3, probado en la variante N16R8 (16 MB de flash y 8 MB de PSRAM) a 240 MHz.
- Flash: aproximadamente 2,6 MB para librería, modelo y diccionario; el autor indica que cabe en 4 MB de flash sujeto a las necesidades de la aplicación y de las particiones.
- Memoria: 2,63 MB de PSRAM más ~1 KB de RAM interna, o 151 KB de RAM interna si se prescinde de PSRAM; la pila de tareas, DMA y memoria de aplicación son adicionales.
- Periféricos para la demo: placa ESP32-S3 N16R8, amplificador MAX98357A y altavoz; BCLK a GPIO 15, LRC a GPIO 16 y DIN a GPIO 7.
- Entorno de desarrollo: ESP-IDF 5.5.6 para la integración mediante SDK; `esptool==4.12.0` para flashear el paquete de demo.
- No aplica el despliegue en GPU (A100, H100, RTX 4090) ni en runtimes de servidor como vLLM, llama.cpp, Ollama o TGI: el modelo se ejecuta en el microcontrolador mediante el SDK propietario.
- Latencia: primer fragmento PCM en 0,27–0,32 s desde la invocación; RTF de 0,42 a 0,54 según configuración de memoria y demo.
- Otros chips: el autor indica que aún no se han adaptado otras plataformas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de TTS embebido o de TTS en la nube. Los datos publicados de LingTTS (RTF, memoria, flash, latencia al primer PCM) no tienen contrapartida en la información disponible para otros sistemas.

| Criterio | LingTTS | Alternativas |
|---|---|---|
| Parametros | No disponible | No disponible |
| Contexto | No aplica | No disponible |
| Rendimiento | RTF 0,42–0,54 en ESP32-S3 N16R8 | No disponible |
| Licencia | Community License 1.0 (comercial con autorización) | No disponible |
| Disponibilidad | SDK en GitHub y model card en HuggingFace | No disponible |

## Limitaciones y advertencias

- Solo hay una voz en mandarín; el inglés está limitado a letras y unas 80 palabras comunes, sin frases completas.
- No soporta SSML, control de emoción ni control de velocidad.
- Los caracteres polifónicos, nombres propios y números de modelo pueden requerir adaptación manual del texto de entrada.
- No se han adaptado otros chips distintos del ESP32-S3; el rendimiento depende de la aplicación y de la configuración de memoria.
- El repositorio de HuggingFace no contiene pesos autónomos ni un checkpoint compatible con Transformers: el modelo y el motor se distribuyen en el SDK de comunidad de GitHub.
- No se publica el recuento de parámetros ni la arquitectura interna, lo que limita la evaluación técnica independiente y la reproducibilidad.
- Riesgo de alucinación no documentado; en TTS el riesgo equivalente es la pronunciación incorrecta o la prosodia inadecuada en textos no contemplados.
- Sesgos lingüísticos y de voz: al estar entrenado para mandarín, la cobertura de variantes dialectales, acentos y registros no está documentada.
- Licencia: el motor, el modelo, el diccionario y el firmware de demo usan la LingTTS Community License 1.0 y no son software libre; el uso comercial requiere autorización escrita (contacto: service@lingcorex.cn). Solo ejemplos, cabeceras públicas y ficheros de integración son MIT.
- Es una preview de comunidad (0.2.0-rc1): la API, el rendimiento y la calidad pueden cambiar entre versiones.
- Para incidencias en placa o pronunciación, el autor pide reportarlas por GitHub Issues indicando placa, versión del SDK, configuración de memoria y logs, sin incluir secretos ni datos personales.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/LingCoreX-AI/LingTTS
- Repositorio GitHub: https://github.com/LingCoreX-AI/LingTTS
- README en chino: https://github.com/LingCoreX-AI/LingTTS/blob/main/README.md
- Demo online: https://edge.lingcorex.cn
- Documentación de recursos y rendimiento (chino): https://github.com/LingCoreX-AI/LingTTS/blob/main/docs/资源与性能.md
- Guía de integración (chino): https://github.com/LingCoreX-AI/LingTTS/blob/main/docs/集成指南.md
- Releases (paquete de demo y SDK): https://github.com/LingCoreX-AI/LingTTS/releases
- Licencia LingTTS Community License 1.0: https://github.com/LingCoreX-AI/LingTTS/blob/main/licenses/LingTTS-Community-License-1.0.md
- Licencia MIT de ejemplos y cabeceras: https://github.com/LingCoreX-AI/LingTTS/blob/main/licenses/MIT.txt
- Issues: https://github.com/LingCoreX-AI/LingTTS/issues
