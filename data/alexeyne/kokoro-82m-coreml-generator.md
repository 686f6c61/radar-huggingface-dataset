# AlexeyNe/kokoro-82m-coreml-generator

## Resumen

`AlexeyNe/kokoro-82m-coreml-generator` es la conversión a Core ML del subgrafo `Generator` del modelo de síntesis de voz hexgrad/Kokoro-82M v1.0, publicado por el usuario AlexeyNe. No se trata de un modelo de texto a voz completo, sino de la etapa final de decodificación de audio (el vocoder iSTFTNet) extraída del modelo original y exportada como ML Program en fp16 con eje temporal flexible, pensada para ejecutarse en CPU mediante Core ML en iOS 18 o superior. El modelo base Kokoro-82M tiene 82 millones de parámetros y licencia Apache 2.0.

El problema que resuelve es concreto: permite ejecutar la parte más costosa de la síntesis de audio de Kokoro en el backend `MLComputeUnits.cpuOnly`, sin depender de GPU ni de Neural Engine. Según la model card, la salida reproduce el módulo de PyTorch con una tolerancia de aproximadamente 1e-4, y complementa los grafos bucketizados de duración, F0 y decoder-pre de `mattmireles/kokoro-coreml`, cuyo generador flexible `har_post_range` es exclusivo de GPU.

Su relevancia es de nicho pero clara para desarrolladores de aplicaciones Apple: completa una ruta de despliegue on-device en CPU para una arquitectura TTS concreta. Hay que subrayar que el repositorio no incluye un modelo utilizable de extremo a extremo por sí solo, y que sus metadatos indican 0 descargas y un tamaño de repositorio declarado de 0,0 GB, por lo que la disponibilidad efectiva de los pesos debería verificarse antes de cualquier integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | iSTFTNet (subgrafo `Generator` de Kokoro-82M): convoluciones de sobremuestreo, bloques residuales AdaIN e iSTFT implementada como convoluciones transpuestas (ruta `disable_complex` de Kokoro) |
| Parametros totales | No disponible para este subgrafo; el modelo base hexgrad/Kokoro-82M declara 82 M de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no procesa texto). Eje temporal flexible con L entre 2 y 2400 estados, equivalente a entre 0,025 s y 30 s de audio a 80 estados por segundo |
| Tipos de cuantizacion | fp16 (ML Program). No se documentan otras precisiones en la informacion disponible |
| Idiomas soportados | No disponible. El subgrafo es independiente del idioma; el idioma depende del modelo base y del voicepack utilizado |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML ML Program (fp16, iOS 18+). El repositorio menciona el script `export_generator.py` para reproducir la conversion con torch 2.7, coremltools 9.0 y kokoro 0.9.4 |

Entradas y salidas documentadas por el autor:

| Tensor | Forma | Significado |
|---|---|---|
| `x_pre` | `[1, 512, L]`, L entre 2 y 2400 | Estado del decodificador antes del generador (80 por segundo) |
| `ref_s` | `[1, 256]` | Estilo de voz; el generador usa `ref_s[:, :128]` |
| `har` | `[1, 22, 60·L + 1]` | Espectro de excitacion hn-NSF: 11 filas de magnitud y 11 filas de fase de `torch.stft(n_fft=20, hop=5, center=True)` |
| `waveform` (salida) | `300·L` muestras a 24 kHz | Audio sintetizado |

## Arquitectura y entrenamiento

El subgrafo exportado corresponde al cuerpo `Generator` de Kokoro-82M v1.0, una arquitectura iSTFTNet que combina convoluciones de sobremuestreo, bloques residuales con normalizacion AdaIN y una transformada inversa de Fourier de corto plazo implementada como convoluciones transpuestas, siguiendo la ruta `disable_complex` de Kokoro. La conversion a Core ML se ha realizado en fp16 con coremltools 9.0 sobre kokoro 0.9.4 y torch 2.7, generando un ML Program con eje temporal flexible que sustituye las formas fijas por un rango L de 2 a 2400 estados.

El autor no aporta informacion sobre el entrenamiento: no se detallan volumen de tokens, composicion del dataset ni si hubo RLHF o DPO, porque este repositorio no entrena ningun modelo, sino que reutiliza los pesos de hexgrad/Kokoro-82M (Apache 2.0). La innovacion tecnica declarada es la de disponer de un generador de longitud flexible que funciona exclusivamente en CPU y que replica numericamente al modulo de PyTorch con un error de aproximadamente 1e-4, complementando los grafos bucketizados de duracion, F0 y decoder-pre del proyecto `mattmireles/kokoro-coreml` y cubriendo el caso en el que su generador `har_post_range` flexible no puede usarse por requerir GPU.

## Capacidades

- Conversion de estado de decodificador, estilo de voz y espectro de excitacion hn-NSF en forma de onda de audio a 24 kHz.
- Longitud de audio flexible por llamada: desde 0,025 s (L = 2) hasta 30 s (L = 2400) sin recompilar el grafo.
- Ejecucion en CPU mediante Core ML con `MLComputeUnits.cpuOnly`, sin necesidad de GPU ni de Neural Engine.
- Precision fp16 con una fidelidad declarada de aproximadamente 1e-4 frente al modulo equivalente en PyTorch.
- Integracion con grafos Core ML complementarios (duracion, F0, decoder-pre) para construir una canalizacion TTS completa.
- No incluye tokenizacion de texto, fonemizacion, prediccion de duracion, prediccion de F0 ni seleccion de voz: esas capacidades pertenecen al modelo base y a los grafos auxiliares.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- Capacidades multilingues: no disponibles y no pertinentes en este subgrafo.
- Capacidades multimodales: ninguna; la entrada es numerica y la salida es audio monofonico.

## Casos de uso

- Sintesis de voz on-device en aplicaciones iOS y macOS: integrado junto a los grafos auxiliares de Kokoro, permite generar audio sin salir del dispositivo y sin conexion de red, usando exclusivamente CPU.
- Complemento de canalizaciones Core ML existentes: cuando el generador flexible `har_post_range` de `mattmireles/kokoro-coreml` no es viable por requerir GPU, este grafo ofrece una alternativa CPU con el mismo contrato de entrada.
- Funciones de accesibilidad: lectores de pantalla, conversion de texto a voz para personas con discapacidad visual o dificultades de lectura, donde la latencia de una sola llamada cubre frases de hasta 30 s de audio.
- Asistentes de voz con requisitos de privacidad: al ejecutarse en CPU local, el texto y el audio no abandonan el dispositivo, lo que encaja en aplicaciones sanitarias, legales o empresariales con datos sensibles.
- Audiolibros y contenido narrado por lotes: generacion de fragmentos de hasta 30 s por invocacion, ensamblables despues, con estilo de voz controlado mediante el tensor `ref_s`.
- Navegacion y sistemas embebidos Apple: avisos hablados cortos (entre 0,025 s y unos pocos segundos) con un coste de computo limitado y sin competir por la GPU.
- Verificacion de fidelidad en procesos de conversion: el script `export_generator.py` y la tolerancia de 1e-4 permiten auditar la conversion fp16 frente al modulo PyTorch original en un pipeline de CI.
- Investigacion en TTS eficiente: analisis del impacto de fp16 y de la implementacion del iSTFT como convoluciones transpuestas en la calidad final del audio, comparando con la ruta compleja de Kokoro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica numerica aportada por el autor es la fidelidad de la conversion frente al modulo de PyTorch, cifrada en aproximadamente 1e-4, que no constituye una evaluacion de calidad de audio (MOS, CMOS ni similares).

## Requisitos de hardware

- VRAM: no aplica en el modo documentado, ya que el grafo se compila para `MLComputeUnits.cpuOnly`.
- GPU compatibles: no disponibles ni necesarias; el autor no documenta un modo con GPU o Neural Engine.
- Encaje en GPU de consumo: no aplica en CPU. El subgrafo forma parte de un modelo base de 82 M de parametros, cuyo tamano en memoria para esta etapa concreta no se detalla en la informacion disponible.
- RAM/almacenamiento: no disponible. El repositorio declara un tamano de 0,0 GB, lo que sugiere que los pesos pueden no estar alojados o que el dato no esta actualizado.
- Plataformas soportadas: iOS 18 o superior para ML Program; el autor no especifica versiones de macOS.
- Opciones de despliegue: Core ML a traves de coremltools (version 9.0 en la conversion documentada), integrable en Xcode. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.
- Reproducibilidad: el autor indica que `export_generator.py` reproduce la conversion con torch 2.7, coremltools 9.0 y kokoro 0.9.4.

## Comparativa con modelos similares

| Artefacto | Tipo | Entradas | Backend | Licencia | Notas |
|---|---|---|---|---|---|
| AlexeyNe/kokoro-82m-coreml-generator | Subgrafo generador (vocoder) en Core ML fp16 | `x_pre`, `ref_s`, `har` | CPU (`cpuOnly`), iOS 18+ | Apache 2.0 | Eje temporal flexible de L = 2 a 2400; fidelidad ~1e-4 frente a PyTorch |
| mattmireles/kokoro-coreml | Conjunto de grafos Core ML bucketizados (duracion, F0, decoder-pre) y generador flexible `har_post_range` | Depende de cada grafo | El generador flexible es exclusivo de GPU | No disponible en la informacion proporcionada | Citado por el autor como el proyecto que este repositorio complementa |
| hexgrad/Kokoro-82M | Modelo de texto a voz completo, 82 M de parametros | Texto | PyTorch | Apache 2.0 | Modelo base del que proceden los pesos; cubre fonemizacion, duracion, F0 y decodificacion |

No se dispone de datos de rendimiento comparativos entre estos artefactos en la informacion proporcionada, por lo que la comparacion se limita a arquitectura, backend de ejecucion y licencia.

## Limitaciones y advertencias

- No es un modelo de texto a voz utilizable de forma autonoma: solo genera la forma de onda a partir de estado de decodificador, estilo y espectro de excitacion; requiere prediccion de duracion, F0 y decoder-pre, ademas de fonemizacion y voicepacks del modelo base.
- El tensor `har` debe calcularse externamente replicando `torch.stft(n_fft=20, hop=5, center=True)` con 22 filas; un calculo distinto produce una salida incorrecta sin aviso explicito.
- Limite duro de 30 s de audio por invocacion (L = 2400); los fragmentos mas largos deben trocearse, con el riesgo de discontinuidades audibles en las uniones.
- La cuantizacion fp16 introduce un error declarado de aproximadamente 1e-4 frente a PyTorch; no se documenta si ese error es perceptible en el audio resultante ni se aportan evaluaciones subjetivas de calidad.
- Ejecucion limitada a CPU (`MLComputeUnits.cpuOnly`), lo que puede traducirse en latencias mayores que las de un backend con GPU o Neural Engine; el autor no publica medidas de latencia.
- Idioma, voces y calidad de prosodia dependen integramente del modelo base hexgrad/Kokoro-82M y de los voicepacks empleados; este repositorio no aporta informacion al respecto.
- No hay datos de sesgos, riesgo de alucinacion medido ni evaluaciones de robustez; al no generar texto, los riesgos tipicos de un LLM no aplican, pero si los sesgos acusticos y de representacion de voces del modelo base.
- Estado del repositorio: 0 descargas, 0 likes y 0,0 GB declarados. La fecha de creacion registrada es 2026-10-13 y la de actualizacion 2026-10-13. Conviene verificar la integridad y disponibilidad de los pesos antes de usarlos en produccion.
- Licencia Apache 2.0: permite uso comercial, pero obliga a conservar avisos de copyright y licencia, y a documentar los cambios realizados; los pesos derivan de hexgrad/Kokoro-82M, cuyos terminos deben respetarse igualmente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AlexeyNe/kokoro-82m-coreml-generator
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Proyecto Core ML complementario: https://huggingface.co/mattmireles/kokoro-coreml
- Script de conversion `export_generator.py`: incluido en el propio repositorio (no se proporciona URL directa en la informacion disponible)
- Paper: no disponible en la informacion proporcionada
- Blog o demo: no disponible en la informacion proporcionada
