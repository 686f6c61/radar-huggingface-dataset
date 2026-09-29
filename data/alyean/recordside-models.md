# Alyean/recordside-models

## Resumen

Alyean/recordside-models no es un modelo de lenguaje, sino un repositorio de artefactos de audio publicado por el usuario Alyean para la aplicación Practice Library. Contiene conversiones a ONNX con pesos fp16 de los modelos Demucs de Meta AI Research, empleados para separar una mezcla musical en sus pistas o stems, además de dos soundfonts General MIDI opcionales para el sintetizador de tablaturas de la aplicación. El repositorio ocupa 1,4 GB y sus ficheros se descargan automáticamente la primera vez que el usuario activa una función que los necesita.

El problema que resuelve es de despliegue: los pesos originales de Demucs son checkpoints de PyTorch y requieren un entorno Python. La conversión a ONNX en fp16 permite ejecutar la separación de fuentes con ONNX Runtime desde una aplicación nativa sin dependencias de Python. El repositorio organiza los ficheros en tres perfiles: `htdemucs_6s.onnx` para el modo rápido integrado en la app, `htdemucs_ft_vocals.onnx`, `htdemucs_ft_drums.onnx` y `htdemucs_ft_bass.onnx` para el modo de alta calidad, y `htdemucs.onnx`, `hdemucs_mmi.onnx` y `mdx_extra_0..3.onnx` para el ensemble de bajo.

Su interés para desarrolladores está en la licencia permisiva y en la verificabilidad: según la model card, los pesos y el código de Demucs son MIT y el fichero `models.json` lista el tamaño y el SHA-256 de cada descarga, que la aplicación comprueba antes de usarla. No se publican parámetros, métricas ni detalles de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Demucs (variantes htdemucs, htdemucs_ft, htdemucs_6s, hdemucs_mmi y mdx_extra); arquitectura interna no detallada en la model card |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de audio; la model card no indica la duración de señal tratada) |
| Tipos de cuantización | fp16 (pesos ONNX convertidos a fp16) |
| Idiomas soportados | no aplica (audio; no se declaran idiomas) |
| Licencia | MIT (pesos y código de Demucs); los soundfonts tienen licencias propias |
| Formato de pesos | ONNX (fp16); soundfonts en SF2 |
| Tamaño del repositorio | 1,4 GB |
| Ficheros de modelo | htdemucs_6s.onnx; htdemucs_ft_vocals.onnx; htdemucs_ft_drums.onnx; htdemucs_ft_bass.onnx; htdemucs.onnx; hdemucs_mmi.onnx; mdx_extra_0..3.onnx |
| Verificación de integridad | `models.json` con tamaño y SHA-256 de cada fichero |
| Fecha de publicación | 28 de septiembre de 2026 (última actualización el mismo día) |

## Arquitectura y entrenamiento

El repositorio no entrena ni define modelos propios: es un punto de distribución de conversiones. Los modelos originales son Demucs, desarrollados por Meta AI Research y publicados en el repositorio `facebookresearch/demucs` con licencia MIT, según se indica en la propia model card. Ese documento no aporta datos sobre arquitectura interna, número de parámetros, volumen de datos de entrenamiento, composición del dataset ni procesos de ajuste posteriores; tampoco menciona RLHF ni optimización por preferencias, categorías que además no aplican a un sistema de separación de fuentes.

Lo que sí documenta la card es la conversión: los checkpoints de Demucs se exportan a ONNX con pesos en fp16 para que la aplicación pueda ejecutarlos sin Python. Se ofrecen tres configuraciones según el compromiso entre calidad y coste computacional: un modelo rápido integrado en la app (`htdemucs_6s`), tres modelos afinados por stem para el modo de alta calidad (voz, batería y bajo) y un conjunto de tres familias (`htdemucs`, `hdemucs_mmi` y `mdx_extra`) que se combinan en el modo Bass Ensemble. Cada fichero figura en `models.json` con su tamaño y su hash SHA-256.

Como contexto externo a la model card, la familia Demucs de Meta AI Research es conocida por un enfoque híbrido que trabaja simultáneamente en el dominio temporal y en el frecuencial; este repositorio no documenta ni verifica esa arquitectura para los ficheros publicados.

## Capacidades

- Separación de fuentes musicales: convierte una mezcla en pistas independientes. La variante `htdemucs_6s` está orientada a una separación en seis pistas; el resto de ficheros corresponden a las variantes estándar y afinadas de Demucs.
- Tres modos de calidad: rápido (`htdemucs_6s`), alta calidad (`htdemucs_ft` con un modelo por stem) y Bass Ensemble (combinación de `htdemucs`, `hdemucs_mmi` y `mdx_extra`).
- Inferencia sin Python: los pesos ONNX se ejecutan con ONNX Runtime, lo que permite integrarlos en aplicaciones nativas de escritorio o móviles.
- Verificación de integridad de las descargas mediante tamaño y SHA-256 declarados en `models.json`.
- Recursos auxiliares de audio: dos soundfonts General MIDI (`GeneralUser-GS.sf2` y `FluidR3_GM.sf2`) para el sintetizador de tablaturas de la aplicación. No son pesos de modelo, sino bancos de sonido.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión ni audio generativo.
- No soporta tool calling ni function calling, ni flujos de agentes o razonamiento multi-paso.
- No tiene capacidades multilingües declaradas (el concepto no aplica a un separador de fuentes).
- No expone API conversacional, modo de pensamiento ni entrada de prompts.

## Casos de uso

- Práctica instrumental con pistas de acompañamiento: la aplicación separa la mezcla y permite silenciar o aislar la pista del instrumento que el usuario está estudiando, de modo que puede tocar sobre el resto de la canción sin necesidad de una versión instrumental comercial.
- Generación de tablaturas asistida: obtener un stem de bajo o de batería aislado reduce el ruido de entrada para un transcriptor automático; el resultado se puede reproducir después con los soundfonts General MIDI incluidos en el repositorio.
- Karaoke y pistas de acompañamiento: el modo de alta calidad incluye un modelo específico de voz (`htdemucs_ft_vocals.onnx`), pensado para extraer o atenuar la vocal principal conservando el resto de la instrumentación.
- Remezcla y edición musical: al disponer de stems independientes en formato ONNX, un editor puede reequilibrar niveles, aplicar efectos a una sola pista o construir versiones alternativas de una grabación.
- Extracción de bajo en mezclas difíciles: el modo Bass Ensemble combina las salidas de `htdemucs`, `hdemucs_mmi` y `mdx_extra` para mejorar la recuperación del bajo cuando una sola pasada produce sangrado de otros instrumentos.
- Preprocesado de datasets de audio: separar los stems antes de etiquetar o entrenar otros sistemas permite construir corpus con pistas aisladas y anotaciones más limpias, todo ello sin depender de Python en la fase de inferencia.
- Análisis musicológico y educación: disponer de pistas separadas facilita estudiar la línea de bajo, la rítmica o la armonía de una obra de forma aislada en un aula o en una herramienta de análisis.
- Distribución en aplicaciones nativas: al estar en ONNX fp16, los ficheros se pueden empaquetar en un instalador de escritorio o móvil y ejecutarse con ONNX Runtime, con la ventaja de que la app descarga solo lo necesario en la primera ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de separación (por ejemplo SDR, SIR o SAR) ni comparaciones con otros sistemas, y los resultados de la búsqueda web consultados son catálogos genéricos de modelos que no contienen datos sobre este repositorio.

## Requisitos de hardware

- Almacenamiento: el repositorio completo ocupa 1,4 GB, aunque la aplicación descarga únicamente los ficheros que necesita cada función.
- Memoria por fichero: no disponible. La información proporcionada no reproduce el tamaño de cada ONNX; ese dato está en `models.json` dentro del repositorio.
- VRAM estimada para inferencia: no disponible. Al tratarse de pesos fp16 convertidos para ejecutarse sin Python, el consumo es inferior al de los checkpoints fp32 equivalentes, pero no se publica una cifra concreta.
- GPU recomendadas: no disponible. ONNX Runtime admite execution providers de CPU, CUDA y DirectML, de modo que el modelo puede ejecutarse tanto en CPU como en GPU compatibles.
- Viabilidad en GPU de consumo: no se especifica oficialmente. El diseño de la aplicación (ejecución sin Python y modo rápido integrado) apunta a hardware de usuario final, pero no hay requisitos mínimos publicados.
- Opciones de despliegue: ONNX Runtime dentro de la aplicación Practice Library o de cualquier aplicación propia. No aplican servidores de inferencia de texto como vLLM, TGI, Ollama o llama.cpp.
- Latencia y throughput: no disponible. No se publican tiempos de separación por canción ni métricas de rendimiento por dispositivo.

## Comparativa con modelos similares

La información proporcionada solo describe con detalle este repositorio y su modelo de origen. La comparación con alternativas de la misma categoría (separación de fuentes musicales) queda limitada a lo que la model card declara.

| Aspecto | Alyean/recordside-models | Demucs original (Meta AI Research) | Otras familias de separación (Spleeter, MDX-Net) |
|---|---|---|---|
| Formato de pesos | ONNX fp16 | checkpoints de PyTorch (según la model card, requieren Python) | no disponible |
| Licencia | MIT | MIT (pesos y código, según la model card) | no disponible |
| Ejecución sin Python | sí, vía ONNX Runtime | no documentada en la información disponible | no disponible |
| Variantes incluidas | htdemucs_6s, htdemucs_ft por stem, htdemucs, hdemucs_mmi, mdx_extra | familia Demucs publicada por Meta AI Research | no disponible |
| Verificación de integridad | tamaño y SHA-256 en `models.json` | no disponible | no disponible |
| Número de parámetros y métricas | no disponible | no disponible en la información proporcionada | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling, agentes ni flujos multi-paso. Cualquier evaluación con benchmarks de texto (MMLU, HumanEval, GSM8K) no aplica.
- Ausencia total de métricas: la model card no publica SDR, SIR, SAR ni comparaciones objetivas, de modo que la calidad real de cada variante no puede verificarse con los datos disponibles.
- Autoría y atribución: el autor del repositorio no entrena los modelos; la autoría técnica corresponde a Meta AI Research. La conversión a ONNX fp16 puede introducir diferencias numéricas respecto a los pesos originales en mayor precisión.
- Repositorio sin validación comunitaria: figura con 0 descargas y 0 likes en el momento de la consulta, fue creado el 28 de septiembre de 2026 y actualizado el mismo día, por lo que no hay historial de uso ni de mantenimiento.
- Limitaciones propias de la técnica: la separación de fuentes suele producir sangrado entre pistas, artefactos en pasajes densos o pérdida de reverberación; son caveats generales del enfoque, no documentados específicamente para estos ficheros.
- Licencias múltiples: la licencia MIT cubre los pesos y el código de Demucs según la model card, pero los soundfonts se rigen por sus propios términos (`soundfonts/GeneralUser-GS-LICENSE.txt` y `soundfonts/FluidR3_GM-LICENSE.txt`). Hay que respetarlas por separado antes de redistribuir el paquete.
- Sin idiomas ni contexto: cualquier expectativa sobre cobertura lingüística o ventana de contexto no aplica a este tipo de modelo.
- Dependencia de la aplicación: el repositorio está pensado como almacén de descargas de Practice Library; no se documenta una API pública, un servidor de inferencia ni ejemplos de integración fuera de esa app.
- Verificación parcial: los SHA-256 existen en `models.json`, pero no se reproducen en la información disponible, por lo que no se pueden comprobar aquí.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Alyean/recordside-models
- Demucs (Meta AI Research): https://github.com/facebookresearch/demucs
- GeneralUser GS (S. Christian Collins): https://github.com/mrbumpy409/GeneralUser-GS
- Rutas internas del repositorio citadas en la model card: `models.json`, `LICENSE-demucs.txt`, `soundfonts/GeneralUser-GS-LICENSE.txt`, `soundfonts/FluidR3_GM-LICENSE.txt`
- Resultados de la búsqueda web consultados (benchlm.ai, scriptbyai.com, models.dev, developers.openai.com, promptshotai.com): son catálogos genéricos de modelos y no contienen información sobre este repositorio.
