# rmunoz777/keyfall-prueba-modelos

## Resumen

`rmunoz777/keyfall-prueba-modelos` es un repositorio de Hugging Face que no contiene un modelo de lenguaje, sino un par de exportaciones ONNX orientadas a la transcripción musical y la separación de fuentes, preparadas para ejecutarse en el navegador dentro de un proyecto llamado Keyfall. El autor, `rmunoz777`, publica dos artefactos: `piano.onnx`, derivado del sistema de transcripción de piano con pedales de ByteDance (piano_transcription_inference, Apache-2.0), y `demucs.onnx`, una exportación de Demucs `htdemucs_6s` de Meta (MIT) a la que se le han eliminado las etapas STFT/ISTFT para realizarlas en JavaScript.

El repositorio tiene un tamano de 0,2 GB, cero descargas y un único "like", y fue creado y actualizado el 18 de noviembre de 2026, lo que sugiere un uso experimental o de prueba más que un artefacto pensado para distribución general. No dispone de pipeline declarado, no especifica idiomas y no incluye resultados de benchmarks ni métricas de calidad en la model card.

Su relevancia es acotada pero concreta: demuestra un patrón de despliegue de modelos de audio en el cliente (WebAssembly/ONNX Runtime Web), eliminando la dependencia de servidores para tareas de transcripción y separación. Para desarrolladores que evalúan inferencia en navegador con modelos de música, sirve como referencia técnica, aunque no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos modelos independientes: red de transcripción de piano (ByteDance, piano_transcription_inference) y Demucs `htdemucs_6s` (arquitectura híbrida transformer-convolucional para separación de fuentes) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de audio, no de texto) |
| Tipos de cuantizacion | no disponible (exportaciones ONNX; no se documenta precisión ni cuantización) |
| Idiomas soportados | no disponible (no aplica a audio musical) |
| Licencia | MIT (repositorio); componentes subyacentes: Apache-2.0 (piano) y MIT (Demucs) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El repositorio agrupa dos sistemas con arquitecturas distintas. `piano.onnx` corresponde al modelo de transcripción de piano descrito en *High-resolution Piano Transcription with Pedals* (ByteDance), que estima notas y pedales a partir de audio; el autor lo distribuye como exportación ONNX del paquete `piano_transcription_inference`. `demucs.onnx` es una exportación de Demucs `htdemucs_6s` de Meta, un modelo híbrido que combina capas convolucionales con atención transformer para separar una mezcla musical en seis stems (habitualmente batería, bajo, voz, guitarra, piano y otros, según la variante `_6s`).

La particularidad técnica de la exportación de Demucs es que se han eliminado del grafo las operaciones STFT e ISTFT, de modo que la transformada de Fourier de corto plazo y su inversa se ejecutan en JavaScript fuera del modelo ONNX. Este patrón reduce la superficie del grafo exportado y facilita la portabilidad a entornos web, a costa de trasladar parte del preprocesado y postprocesado al código del cliente. No se documentan en la model card el número de tokens de entrenamiento, la composición de los datasets, ni si hubo ajuste fino adicional, RLHF o DPO; esa información pertenece a los trabajos originales de ByteDance y Meta, no a este repositorio.

## Capacidades

- Transcripción de piano a partir de audio, incluyendo detección de notas y pedales, según el modelo de ByteDance subyacente.
- Separación de fuentes musicales en seis stems mediante Demucs `htdemucs_6s`.
- Inferencia en navegador: ambos artefactos están exportados a ONNX y pensados para ejecutarse en el cliente, con la STFT/ISTFT de Demucs implementada en JavaScript.
- No incluye generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No está orientado a agentes ni a razonamiento multi-paso.
- No se documentan capacidades multilingües (no aplica a audio musical).
- No se documentan modos especiales como thinking mode, audio de entrada general o salida de texto estructurada.

## Casos de uso

- Transcripción de piano en el navegador: un editor web podría cargar `piano.onnx` con ONNX Runtime Web para convertir una grabación de piano en una partitura o evento MIDI sin enviar el audio a un servidor, lo que reduce latencia y mejora la privacidad.
- Separación de stems en herramientas de práctica musical: `demucs.onnx` permitiría aislar la pista de piano o de voz de una mezcla para que el usuario practique sobre ella, ejecutando la STFT/ISTFT en JavaScript y el modelo en ONNX.
- Aplicaciones educativas de teoría musical: transcripción automática de interpretaciones de alumnos para comparar notas y pedales con la partitura de referencia, con retroalimentación inmediata en el cliente.
- Prototipos de edición de audio en el navegador: un DAW ligero podría usar la separación de seis stems para ofrecer controles de mezcla por instrumento sin backend.
- Investigación en despliegue web de modelos de audio: el repositorio sirve como ejemplo reproducible de exportación ONNX con operaciones de señal desplazadas a JavaScript, útil para medir rendimiento y fidelidad frente a la implementación original en PyTorch.
- Pruebas de integración en pipelines de CI: al ser artefactos ONNX pequenos (repo de 0,2 GB), pueden incorporarse a tests automáticos que verifiquen la paridad numérica entre la inferencia en Python y en el navegador.
- Demostraciones y pruebas de concepto: dado su carácter de "prueba" (nombre del repositorio y ausencia de descargas), encaja en validaciones internas de viabilidad antes de adoptar los modelos originales de ByteDance y Meta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no documenta el tamano de los grafos ni la precisión de exportación; el tamano total del repo es de 0,2 GB, lo que da una cota superior aproximada del espacio en disco de los artefactos, no de la memoria en ejecución.
- GPU recomendadas: no disponible. Al estar orientados a navegador, el objetivo declarado es la ejecución en el cliente (CPU o GPU del usuario vía WebGPU/WebGL), no en servidores con A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no verificada en la información disponible.
- Opciones de despliegue: ONNX Runtime Web (navegador); en servidor, ONNX Runtime, aunque no se documenta. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a estos modelos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rmunoz777/keyfall-prueba-modelos` | ONNX (transcripción de piano + Demucs 6s) | no disponible | no aplica | MIT (repo); Apache-2.0 y MIT en componentes | Hugging Face, 0 descargas |
| ByteDance `piano_transcription_inference` | Transcripción de piano (PyTorch) | no disponible | no aplica | Apache-2.0 | Repositorio original de ByteDance |
| Meta Demucs `htdemucs_6s` | Separación de fuentes (PyTorch) | no disponible | no aplica | MIT | Repositorio original de Meta |
| Demucs `htdemucs` (4 stems) | Separación de fuentes (PyTorch) | no disponible | no aplica | MIT | Repositorio original de Meta |

La comparación relevante es con los modelos originales en PyTorch, de los que estas exportaciones derivan. La diferencia principal no es de calidad, sino de formato y entorno de ejecución: ONNX para navegador frente a PyTorch para servidor. No se dispone de métricas que permitan comparar fidelidad o rendimiento entre ambas versiones.

## Limitaciones y advertencias

- El repositorio se presenta explícitamente como "exportaciones ONNX para la prueba en el navegador de Keyfall", por lo que no debe tratarse como un artefacto estable ni versionado para producción.
- No se documentan métricas de calidad (SDR para separación, F1 de notas para transcripción) ni comparaciones con los modelos originales; se desconoce si la exportación ONNX introduce degradación numérica.
- La eliminación de STFT/ISTFT del grafo de Demucs traslada responsabilidad al código JavaScript: cualquier discrepancia en ventanas, hop size o normalización entre el modelo y el código del cliente puede alterar los resultados.
- La licencia MIT del repositorio no sustituye a las licencias de los componentes: el modelo de piano es Apache-2.0 y Demucs es MIT, y deben respetarse sus términos y atribuciones en uso comercial.
- No se especifican idiomas ni dominios de audio más allá de música; el rendimiento en grabaciones ruidosas, instrumentos distintos del piano o mezclas atípicas no está documentado.
- Riesgo de alucinación en el sentido de detección de notas o stems inexistentes: no hay información sobre umbrales de confianza ni sobre el comportamiento en silencios o pasajes polifónicos densos.
- Cero descargas y un único "like" indican ausencia de validación por parte de la comunidad; conviene verificar los artefactos antes de integrarlos.
- No hay información sobre sesgos, aunque en modelos de audio musical el sesgo relevante sería de dominio (géneros, instrumentación, calidad de grabación), no documentado aquí.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rmunoz777/keyfall-prueba-modelos
- Modelo original de transcripción de piano (ByteDance, piano_transcription_inference): no disponible en la información proporcionada
- Artículo *High-resolution Piano Transcription with Pedals*: no disponible en la información proporcionada
- Demucs (Meta): no disponible en la información proporcionada
- Proyecto Keyfall: no disponible en la información proporcionada
