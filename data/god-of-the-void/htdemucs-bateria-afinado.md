# god-of-the-void/HTDemucs-bateria-afinado

## Resumen

HTDemucs-bateria-afinado es un ajuste fino (fine-tuning) del modelo HTDemucs de Alexandre Défossez (Meta AI), publicado por el colectivo GOD OF THE VOID (CHAOS-X). A diferencia del modelo base, que separa una mezcla musical en voces, batería, bajo y otros, este ajuste toma una pista de batería aislada y la descompone en cuatro piezas: bombo (kick), caja (snare), platos (cymbals) y toms. El modelo base no puede realizar esta tarea, lo que convierte a este ajuste en una herramienta específica para el análisis fino de percusión.

El modelo se presenta como un artefacto de investigación, entrenado con el propio entrenador del colectivo, escrito en Rust sobre MLX y ejecutado en un Apple M1 Max, sin Python. Los pesos ocupan 84 MB y el repositorio completo 0,1 GB. La model card reporta una mejora muy significativa del SDR medio frente al HTDemucs original (de 0,39 dB a 19,66 dB) sobre 60 interpretaciones de test de StemGMD, aunque el propio autor advierte que la evaluación usa los mismos kits de batería que el entrenamiento, por lo que el rendimiento en grabaciones reales será inferior.

La relevancia actual es doble: por un lado, demuestra que es posible ajustar un separador de fuentes musicales para una tarea de granularidad fina (separación de piezas de batería) con recursos de un solo equipo de sobremesa; por otro, su licencia es explícitamente incierta y restringida a investigación, lo que limita su uso comercial. No hay información sobre idiomas ni sobre benchmarks estándar de texto, al tratarse de un modelo de audio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HTDemucs (Hybrid Transformer Demucs): transformer híbrido con ramas temporal y espectral para separación de fuentes |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; opera sobre ventanas de señal, no sobre tokens de texto) |
| Tipos de cuantización | no disponible (pesos en safetensors de 84 MB; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | unknown (sin licencia concedida; solo investigación y evaluación, sin uso comercial ni garantía) |
| Formato de pesos | safetensors (`afinado.safetensors`), más `afinado.yaml` (bag de Demucs) y `juicio.json` (evaluación) |

## Arquitectura y entrenamiento

El modelo parte de HTDemucs, la arquitectura de separación de fuentes musicales presentada en "Hybrid Transformers for Music Source Separation" (Rouard, Massa y Défossez, ICASSP 2023). HTDemucs combina un procesamiento híbrido en los dominios temporal y espectral mediante capas de atención, lo que le permite modelar dependencias de largo alcance en la señal de audio. En este ajuste se conservan los cuatro canales de salida del modelo base, pero se reentrenan para que correspondan a bombo, caja, platos y toms en lugar de las fuentes originales.

El entrenamiento se realizó con el entrenador propio de GOD OF THE VOID, implementado en Rust sobre MLX y ejecutado en un Apple M1 Max, sin usar Python. Los datos de entrenamiento proceden de StemGMD (CC BY 4.0), un conjunto de batería derivado del Groove MIDI Dataset (CC BY 4.0), renderizado por Mezza, Giampiccolo, Bernardini y Sarti en "Toward Deep Drum Source Separation" (2024). No se especifican el número de tokens, el número de pasos de entrenamiento ni si hubo etapas de RLHF o DPO; al ser un modelo de audio, esas técnicas no aplican del mismo modo. La innovación destacable es la propia tarea: llevar la separación de fuentes de una mezcla completa hasta el nivel de piezas individuales de batería, algo que el HTDemucs original no aborda.

## Capacidades

- Separación de una pista de batería aislada en cuatro componentes: bombo, caja, platos y toms.
- Procesamiento de audio a audio (pipeline `audio-to-audio`) sobre señales de percusión.
- Integración con el ecosistema GOD OF THE VOID: aplicación de escritorio y CLI `gotv`.
- Ejecución nativa en Apple Silicon mediante MLX, con el entrenador e inferencia en Rust.
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje).
- No dispone de modo thinking, ni de entrada o salida de voz más allá del audio musical.

## Casos de uso

- Producción musical y remezcla: extraer las pistas de bombo, caja, platos y toms de una grabación de batería para reequilibrar niveles, sustituir muestras o aplicar procesamiento independiente a cada pieza, aprovechando que el modelo fue entrenado específicamente para esta descomposición.
- Transcripción y análisis rítmico: obtener pistas separadas que faciliten la detección de golpes y la transcripción de patrones de batería en herramientas de musicología computacional o de educación musical.
- Creación de sample packs: generar muestras aisladas de cada componente a partir de grabaciones propias, siempre que se respete la restricción de uso solo para investigación.
- Investigación en separación de fuentes: servir como punto de partida o línea base para experimentos académicos sobre separación fina de percusión, dado que el autor publica los números de evaluación en `juicio.json`.
- Evaluación comparativa de separadores: usar el modelo como referencia para medir la mejora frente al HTDemucs original en la tarea concreta de batería, con la cautela de que la evaluación del autor usa los mismos kits de entrenamiento.
- Prototipado en Apple Silicon: probar flujos de separación de audio en un Mac con M1 Max usando el CLI `gotv`, sin depender de Python ni de GPUs dedicadas, para validar ideas antes de escalar a otros entornos.
- Docencia y demostraciones: ilustrar en clase cómo un modelo de separación de fuentes puede adaptarse a una tarea de granularidad distinta mediante fine-tuning, con la advertencia de que el uso debe limitarse a investigación y evaluación.

## Benchmarks y rendimiento

La model card reporta SDR en dB sobre 60 interpretaciones de test de StemGMD (mayor es mejor), comparando el HTDemucs original con este ajuste:

| Pieza | HTDemucs | Este modelo |
|---|---:|---:|
| Bombo (kick) | 1,72 | 28,11 |
| Caja (snare) | −0,21 | 21,21 |
| Platos (cymbals) | 0,07 | 10,29 |
| Toms | −0,01 | 19,03 |
| Media | 0,39 | 19,66 |

El autor advierte explícitamente que las interpretaciones de test usan los mismos kits de batería que el entrenamiento, por lo que la puntuación en grabaciones de una sala real será inferior. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al tratarse de un modelo de audio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; los pesos ocupan 84 MB, por lo que la huella de memoria es reducida, pero no se documenta el consumo total durante la inferencia.
- GPU recomendadas: el autor entrenó en un Apple M1 Max; no se especifican GPU NVIDIA ni AMD compatibles.
- ¿Cabe en GPU de consumo? Por el tamaño de los pesos (84 MB) es plausible que quepa en cualquier GPU de consumo moderna, pero no hay datos oficiales de VRAM ni de compatibilidad fuera del ecosistema MLX.
- Opciones de despliegue: aplicación de GOD OF THE VOID y CLI `gotv` (`gotv split drums.wav --drums`), con soporte MLX en Apple Silicon. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo de audio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parámetros | Contexto | SDR medio (StemGMD) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HTDemucs-bateria-afinado | Separación de piezas de batería | no disponible | no aplica | 19,66 dB | unknown (solo investigación) | Hugging Face, app y CLI `gotv` |
| HTDemucs (adefossez) | Separación de mezcla en 4 fuentes | no disponible | no aplica | 0,39 dB en la tarea de batería | MIT en código; pesos con licencia poco clara | Hugging Face, repositorio oficial |
| Demucs v4 / htdemucs (familia) | Separación de fuentes musicales | no disponible | no aplica | no disponible para esta tarea | MIT en código; pesos con licencia poco clara | Hugging Face, repositorio oficial |

No se dispone de datos de otros separadores específicos de batería en la información proporcionada, por lo que la comparativa se limita al modelo base y a la familia Demucs.

## Limitaciones y advertencias

- Evaluación con los mismos kits de batería que el entrenamiento: el SDR real en grabaciones de sala será inferior al reportado.
- Los platos son la pieza más difícil (≈10 dB de SDR), con mayor riesgo de confusión y sangrado entre componentes.
- La entrada debe ser una pista de batería aislada; para una canción completa hay que separar primero con HTDemucs.
- Licencia incierta: no se concede licencia alguna; el modelo se publica solo para investigación y evaluación, sin uso comercial y sin garantía. Hereda la situación de los pesos de HTDemucs, cuyo autor indica que la licencia de los pesos no está clara por el uso de MUSDB.
- Riesgo de alucinación en el sentido de artefactos o componentes espurios en la señal separada, especialmente en pasajes densos o con instrumentos no representados en el entrenamiento.
- Sesgos de dominio: el entrenamiento se basa en StemGMD, derivado del Groove MIDI Dataset, lo que puede limitar la generalización a estilos, kits o técnicas de grabación poco representados.
- Sin información sobre idiomas ni sobre rendimiento en otros formatos de audio o frecuencias de muestreo distintas de las usadas en el entrenamiento.
- El repositorio es muy reciente y con cero descargas y cero likes en el momento de la consulta, por lo que no hay validación independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/god-of-the-void/HTDemucs-bateria-afinado
- Repositorio de GOD OF THE VOID: https://github.com/CHAOSX-SPACE/god-of-the-void
- Sitio de CHAOS-X: https://chaosx.space
- Modelo base HTDemucs: https://huggingface.co/adefossez/HTDemucs
- Repositorio oficial de Demucs (licencia): https://github.com/adefossez/demucs/blob/main/README.md#license
- Dataset StemGMD: https://zenodo.org/records/7860223
- Paper de HTDemucs: Rouard, Massa y Défossez, "Hybrid Transformers for Music Source Separation", ICASSP 2023
- Paper de StemGMD: Mezza, Giampiccolo, Bernardini y Sarti, "Toward Deep Drum Source Separation", 2024
- Paper del Groove MIDI Dataset: Gillick, Roberts, Engel, Eck y Bamman, "Learning to Groove with Inverse Sequence Transformations", ICML 2019
