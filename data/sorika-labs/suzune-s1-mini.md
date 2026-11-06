# sorika-labs/suzune-s1-mini

## Resumen

Suzune S1 Mini es un modelo de síntesis de voz (text-to-speech) ultraligero desarrollado por Sorika Labs, con 40.232.002 parámetros totales según los pesos en safetensors. Está diseñado específicamente para inferencia en dispositivo (on-device), es decir, ejecución local en CPU de portátiles, dispositivos móviles, hardware de borde y Apple Silicon, sin depender de servicios en la nube ni de round-trips de red. Su propuesta de valor central es una latencia de tiempo hasta el primer audio inferior a 10 ms en CPU, lo que lo sitúa en la categoría de TTS conversacional en tiempo real.

El modelo se construye sobre `gradium/phonon-31m-en`, un modelo base de TTS en inglés publicado bajo licencia Apache 2.0, al que Sorika Labs aplica un ajuste fino y una optimización acústica causal. La arquitectura combina flow-matching causal con decodificación acústica latente neuronal, una elección que prioriza la generación streaming y la baja latencia frente a la máxima calidad de síntesis. El repositorio ocupa 0,2 GB y los pesos se distribuyen en formato safetensors con código personalizado (`custom_code`) y la librería propietaria `suzune`.

Es relevante ahora porque cubre un nicho concreto: TTS de calidad aceptable que cabe en hardware de consumo y funciona sin conectividad. Frente a modelos de síntesis de mayor tamaño que requieren GPU, Suzune S1 Mini apuesta por el despliegue en el borde, con un SDK Python (`suzune-mini`) y una CLI que reducen la integración a tres líneas de código. Su licencia Apache 2.0 facilita el uso comercial, aunque el soporte se limita al inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-matching causal con decodificacion acustica latente neuronal (adaptada de gradium/phonon-31m-en) |
| Parametros totales | 40.232.002 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con custom_code y libreria `suzune`) |

## Arquitectura y entrenamiento

Suzune S1 Mini emplea una arquitectura de flow-matching causal orientada a la generacion de audio en streaming. En lugar de un transformer autoregresivo clasico sobre tokens de audio, el modelo genera latentes acusticos mediante un proceso de flow-matching condicionado por el texto de entrada, que despues se decodifican a forma de onda mediante un decodificador acustico latente neuronal. La naturaleza causal del flujo permite producir audio de forma incremental, lo que explica la latencia de tiempo hasta el primer audio inferior a 10 ms en CPU.

El modelo parte del checkpoint `gradium/phonon-31m-en` (31M parametros, Apache 2.0) y Sorika Labs lo ajusta y amplia hasta los 40,2M parametros. Las modificaciones declaradas por el autor incluyen la incorporacion de perfiles de voz calibrados (Zoey, Harper, Easton, Juniper, Austin y Aria), una optimizacion acustica causal para agentes conversacionales en tiempo real y un SDK Python independiente (`suzune-mini`). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; tampoco se detalla el esquema de cuantizacion ni la longitud de contexto.

## Capacidades

- Sintesis de voz a partir de texto en ingles con generacion de audio en formato WAV.
- Generacion de audio en streaming con latencia de tiempo hasta el primer audio inferior a 10 ms en CPU.
- Seis perfiles de voz integrados con estilos diferenciados: Zoey (femenina, conversacional), Harper (femenina, narrativa), Easton (masculina, equilibrada), Juniper (femenina, atencion al cliente), Austin (masculina, profesional) y Aria.
- Ejecucion 100% local sin conexion de red, orientada a dispositivos de borde.
- SDK Python de alto nivel (`suzune-mini` y framework unificado `suzune`) con API de tres lineas.
- Interfaz de linea de comandos (`suzune-mini`) para sintesis directa a fichero.
- No se documentan capacidades de tool calling, razonamiento multi-paso, vision, audio de entrada ni modo thinking; el modelo es exclusivamente TTS.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede generar respuestas habladas en tiempo real dentro de un agente de voz que corra enteramente en el dispositivo, ya que su latencia sub-10 ms evita la percepcion de retardo en el turno de conversacion.
- Lectura de notificaciones y accesibilidad: aplicaciones de escritorio o moviles pueden convertir texto a voz de forma local para usuarios con discapacidad visual, sin enviar contenido a servidores externos y preservando la privacidad.
- Sistemas de navegacion y automocion embebida: al ejecutarse en CPU y no requerir GPU, puede integrarse en unidades de infoentretenimiento para instrucciones de voz con latencia minima y sin dependencia de cobertura movil.
- Atencion al cliente en kioscos y terminales de borde: con las voces Juniper y Zoey, el modelo puede dar respuestas habladas en terminales de autoservicio que operan con hardware modesto y conectividad intermitente.
- Videojuegos y experiencias interactivas: la generacion causal en streaming permite sintetizar dialogos de personajes no jugadores en tiempo de ejecucion, con voces distintas por personaje y sin precargar grandes bancos de audio.
- Dispositivos IoT y wearables: por su tamano de 40M parametros y repositorio de 0,2 GB, cabe en dispositivos con memoria limitada para alertas habladas, domotica por voz o lectores de sensores.
- Prototipado rapido de interfaces de voz: el SDK `suzune-mini` y la CLI permiten a desarrolladores generar muestras de audio en pocos minutos para validar flujos de producto antes de invertir en infraestructura de TTS en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento declarado por el autor es una latencia de tiempo hasta el primer audio inferior a 10 ms en CPU, sin especificar el hardware exacto ni el metodo de medida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo esta disenado para ejecucion en CPU, por lo que no requiere VRAM dedicada en su escenario objetivo.
- GPU recomendadas: no aplica segun el diseno del modelo; el autor lo posiciona para CPU de portatiles, dispositivos moviles, computacion de borde y Apple Silicon.
- Compatibilidad con GPU de consumo: no se documenta soporte GPU especifico; el foco declarado es la inferencia en CPU.
- Opciones de despliegue: SDK Python `suzune-mini`, framework unificado `suzune` y CLI `suzune-mini`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no son adecuadas para un modelo TTS de este tipo.
- Latencia y throughput: tiempo hasta el primer audio inferior a 10 ms en CPU segun el autor; no se proporcionan cifras de throughput (caracteres o segundos de audio por segundo) ni el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Suzune S1 Mini | 40,2M | en | TTS flow-matching causal on-device | Apache 2.0 | Hugging Face, PyPI |
| gradium/phonon-31m-en | 31M (aprox.) | en | TTS base del que deriva Suzune | Apache 2.0 | Hugging Face |
| Alternativas TTS de gran tamano (p. ej. modelos neuronales de cientos de millones a miles de millones de parametros) | no disponible | multiidioma en muchos casos | TTS neuronal de alta calidad, tipicamente GPU | variable | variable |

La comparacion con modelos TTS de gran escala no puede cuantificarse con los datos disponibles: no se han publicado metricas comparativas (MOS, WER, latencia) en la informacion proporcionada. La diferencia mas clara frente a la familia de modelos TTS de gran tamano es el objetivo de despliegue: Suzune S1 Mini prioriza CPU y latencia minima, mientras que aquellos priorizan calidad maxima con requisitos de GPU.

## Limitaciones y advertencias

- Solo soporta ingles; no hay soporte multilingue declarado.
- Al ser un modelo de 40M parametros, la calidad de sintesis y la naturalidad seran previsiblemente inferiores a las de modelos TTS de mayor tamano; no se aportan metricas de calidad (MOS) que lo cuantifiquen.
- No se documentan sesgos de voz, acento o genero mas alla de los seis perfiles integrados; los perfiles disponibles son un conjunto cerrado y no se indica si admite clonacion de voz o voces personalizadas.
- No se detalla el dataset de entrenamiento ni los procesos de filtrado, por lo que no puede evaluarse el riesgo de artefactos, pronunciacion incorrecta o alucinacion de audio.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva de `gradium/phonon-31m-en`, tambien Apache 2.0, por lo que conviene conservar la atribucion correspondiente.
- El modelo requiere la libreria `suzune` o `suzune-mini` y codigo personalizado (`custom_code`); no es compatible directamente con runners genericos de Hugging Face Transformers sin ese soporte.
- `inference: false` aparece en la model card, lo que implica que la inferencia no esta habilitada en el widget de Hugging Face y debe realizarse mediante el SDK local.
- No se especifican requisitos de contexto de texto ni limites de longitud de entrada; conviene validar el comportamiento con frases largas antes de usarlo en produccion.
- El modelo es muy reciente (creado en octubre de 2026) y cuenta con 12 descargas y 0 likes, por lo que la validacion comunitaria es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sorika-labs/suzune-s1-mini
- Modelo base: https://huggingface.co/gradium/phonon-31m-en
- Paquete PyPI `suzune-mini`: https://pypi.org/project/suzune-mini/
- Framework unificado `suzune` en PyPI: https://pypi.org/project/suzune/
