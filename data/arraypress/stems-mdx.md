# arraypress/stems-mdx

## Resumen

`arraypress/stems-mdx` no es un modelo entrenado de cero, sino un *asset* de Core AI que empaqueta una red de separación de fuentes ya existente: **MDX23C-8KFFT-InstVoc_HQ**, con arquitectura TFC-TDF-UNet v3, en precisión float16 y un tamano de 214 MB (`stems-mdx23c-instvoc-float16.aimodel`). El objetivo es ejecutar separación de voz e instrumental directamente en dispositivos Apple silicon desde Swift, sin depender de PyTorch en tiempo de inferencia.

El repositorio solo realiza la conversión de los pesos originales, publicados dentro del ecosistema de Ultimate Vocal Remover (UVR) y con implementación de referencia en `ZFTurbo/Music-Source-Separation-Training`. La red cubre únicamente el tramo entre el espectrograma de entrada y los espectrogramas de las pistas de salida: la STFT, el troceado y la STFT inversa se ejecutan en el host, no dentro del asset.

Es relevante ahora porque Core AI es una vía nueva para llevar modelos de audio a producción *on-device* en macOS, y esta ficha documenta un caso concreto con métricas de fidelidad frente a la exportación float32 de referencia, además de tiempos de inferencia medidos. La licencia es MIT, lo que facilita la integración comercial, aunque el crédito del modelo original corresponde a sus autores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TFC-TDF-UNet v3 (MDX23C), convertida a asset de Core AI |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana por fragmento (*chunk*) de 261.120 muestras a 44,1 kHz |
| Tipos de cuantizacion | float16 en el asset publicado; existen una exportacion float32 y un paquete Core ML de 8 bits como referencias de comparacion |
| Idiomas soportados | no disponible (modelo de audio, no textual) |
| Licencia | MIT |
| Formato de pesos | Core AI (`.aimodel`), 214 MB; entrada y salida en float32 con aritmetica interna en float16 |
| Entrada | `spec` `[1, 4, 4096, 256]` float32: izquierda real, izquierda imaginaria, derecha real, derecha imaginaria; bins 0-4095 de una STFT con n_fft 8192, hop 1024, ventana Hann periodica y centrado |
| Salida | `stems` `[1, 8, 4096, 256]` float32: voz (4 canales) seguida de instrumental |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | audio-to-audio |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La red subyacente es **MDX23C** con arquitectura TFC-TDF-UNet v3 (Kim & Lee), un esquema tipo U-Net sobre representaciones tiempo-frecuencia con bloques TFC (time-frequency convolution) y TDF. El asset no incluye la capa de preprocesado: el host se encarga de la STFT (n_fft 8192, hop 1024, Hann periodica, centrado) y de la STFT inversa, mientras que la red transforma el espectrograma de entrada en los espectrogramas de voz e instrumental. La ventana de proceso es de 261.120 muestras por fragmento a 44,1 kHz.

No se documentan en la informacion disponible ni el numero de tokens de audio de entrenamiento, ni la composicion del dataset, ni si hubo fases de ajuste tipo RLHF/DPO; esos detalles corresponden al modelo original `MDX23C-8KFFT-InstVoc_HQ` y a su implementacion en `ZFTurbo/Music-Source-Separation-Training` y Ultimate Vocal Remover. La innovacion tecnica de este repositorio es la propia conversion: el script de exportacion (`Tools/export_mdx.py --precision float16`) **verifica que la red convertida es identica a la salida de `model(chunk)` de la implementacion original antes de guardar**, y los resultados repetidos son identicos bit a bit. Ese control de equivalencia es el principal aval tecnico del asset.

## Capacidades

- Separacion de fuentes en dos pistas: genera voz y instrumental a partir de una mezcla estereo.
- Procesamiento de audio estereo (4 canales de espectrograma: componentes real e imaginaria de ambos canales).
- Ejecucion on-device en Apple silicon mediante Core AI, con aritmetica float16.
- Determinismo: ejecuciones repetidas producen resultados identicos bit a bit.
- Integracion desde linea de comandos mediante la herramienta `stems`, que descarga el asset en el primer uso.
- Integracion desde Swift mediante `swift-vocal-isolation` (`MDXSeparator`).
- No dispone de tool calling, function calling, capacidades de agente, vision, audio generativo, ni capacidades multilingues: es un modelo puramente audio-a-audio.

## Casos de uso

- Separacion de voz para karaoke: a partir de una mezcla estereo, el modelo produce una pista instrumental limpia, adecuada para bases de karaoke generadas localmente sin subir el audio a un servidor.
- Produccion musical y remezclas: obtener la pista vocal aislada permite aplicar procesado, afinado o insercion en una nueva mezcla dentro de un flujo de trabajo de estudio.
- Aplicaciones macOS nativas de audio: gracias al formato Core AI y a la integracion con Swift, se puede incorporar separacion de voz en una app de escritorio Apple silicon sin dependencias de Python.
- Transcripcion y analisis de voz: aislar la voz antes de pasarla a un sistema de reconocimiento de habla o de analisis de locutor mejora la relacion senal-ruido en entornos con musica de fondo.
- Poscproduccion de video y podcasts: separar voz e instrumental para limpiar dialogue tracks o para reutilizar la musica de fondo de una grabacion.
- Archivado y restauracion de material musical: generar stems de voz e instrumental de grabaciones historicas o de material cuya mezcla original no esta disponible.
- Procesado por lotes en local: el coste medido de una mezcla de 30 segundos es de aproximadamente 3,0 segundos de extremo a extremo en GPU, lo que hace viable procesar catalogos enteros en un equipo de escritorio.

## Benchmarks y rendimiento

Los unicos datos publicados son las mediciones del autor sobre macOS 27 y Apple silicon, comparando el asset con una exportacion float32 del mismo modelo y con un paquete Core ML de 8 bits:

| Metrica | Este asset (float16) | Exportacion float32 | Paquete Core ML 8 bits |
|---|---|---|---|
| Un fragmento frente a PyTorch float32 | 62,6 dB | 123,9 dB | 35,3 dB |
| Tiempo por fragmento (GPU) | 0,27 s | 0,31 s | 0,74 s |
| Mezcla de 30 s, extremo a extremo | 3,0 s | 3,5 s | 6,9 s |

Ademas, en tres mezclas de 30 segundos con una voz conocida, las tres variantes obtuvieron el mismo SDR de voz e instrumental con una diferencia inferior a 0,01 dB. No se publican valores absolutos de SDR, SIR ni SAR, ni resultados de benchmarks estandar de separacion (MUSDB18, MoisesDB, etc.) en la informacion disponible.

## Requisitos de hardware

- Plataforma objetivo: Apple silicon (probado en macOS 27). El asset es un formato Core AI, por lo que no es ejecutable en CUDA ni en CPU x86 sin reconversion.
- VRAM estimada: no disponible. Al ser un modelo on-device sobre memoria unificada, no se publican requisitos de memoria grafica; el asset ocupa 214 MB en disco.
- GPU recomendadas: cualquier GPU integrada en un SoC Apple silicon compatible con Core AI. No se documentan modelos de GPU discretas (A100, H100, RTX 4090) porque el asset no esta pensado para esas plataformas.
- Inferencia en GPU de consumo: si, en equipos Apple silicon, con 0,27 s por fragmento en GPU.
- Opciones de despliegue: Core AI en macOS; CLI `stems`; biblioteca Swift `swift-vocal-isolation`. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que son herramientas de texto.
- Latencia y throughput: 0,27 s por fragmento de 261.120 muestras (aproximadamente 5,9 s de audio a 44,1 kHz), es decir, un factor de tiempo real en torno a 22x en GPU; una mezcla de 30 s se procesa en 3,0 s de extremo a extremo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Ventana de proceso | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `arraypress/stems-mdx` (este) | Core AI float16, Apple silicon | no disponible | 261.120 muestras por fragmento | 62,6 dB frente a referencia; 0,27 s por fragmento | MIT | HuggingFace, 0,2 GB |
| Exportacion float32 del mismo modelo | Core AI float32 | no disponible | identica | 123,9 dB frente a referencia; 0,31 s por fragmento | MIT | Referencia interna del autor |
| Paquete Core ML de 8 bits | Core ML int8 | no disponible | identica | 35,3 dB frente a referencia; 0,74 s por fragmento | MIT | Referencia interna del autor |
| `MDX23C-8KFFT-InstVoc_HQ` original (UVR / ZFTurbo) | PyTorch | no disponible | definida por la implementacion | no disponible en esta informacion | MIT | Repositorio publico de UVR |

No se dispone de datos de benchmarks comparativos con otros separadores como Demucs, Spleeter o MDX-Net en la informacion proporcionada.

## Limitaciones y advertencias

- Solo separa dos pistas (voz e instrumental); no genera bateria, bajo u otros stems.
- La fidelidad frente a la referencia float32 es de 62,6 dB, sensiblemente inferior a la exportacion float32 (123,9 dB), aunque el autor afirma que el SDR de voz e instrumental coincide dentro de 0,01 dB en las mezclas probadas.
- No se publican valores absolutos de SDR, SIR ni SAR, por lo que la calidad real de separacion no puede compararse con la literatura sin mediciones adicionales.
- Requiere que el host implemente la STFT y la STFT inversa con los parametros exactos (n_fft 8192, hop 1024, Hann periodica, centrado); una implementacion distinta degradara el resultado.
- El modelo esta limitado a audio estereo a 44,1 kHz en la configuracion documentada.
- Riesgo de artefactos y de separacion imperfecta en mezclas densas, con instrumentacion en el mismo rango frecuencial que la voz o con coros; no se documentan pruebas sistematicas de estos casos.
- Dependencia fuerte de plataforma: solo Apple silicon con Core AI y, en las pruebas del autor, macOS 27. No hay soporte para CUDA ni para aceleradores de otros fabricantes.
- Aunque la licencia del repositorio es MIT, el credito del modelo pertenece a Kim & Lee, a la implementacion de `ZFTurbo/Music-Source-Separation-Training` y a los pesos publicados en el repositorio de Ultimate Vocal Remover; conviene verificar las condiciones de esos proyectos antes de un uso comercial.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que implica una validacion externa nula por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arraypress/stems-mdx
- Implementacion de referencia del entrenamiento: https://github.com/ZFTurbo/Music-Source-Separation-Training
- Ultimate Vocal Remover (origen de los pesos): https://github.com/Anjok07/ultimatevocalremovergui
- Herramienta de linea de comandos `stems`: https://github.com/arraypress
- Biblioteca Swift `swift-vocal-isolation`: https://github.com/arraypress/swift-vocal-isolation
