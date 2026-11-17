# fpp-ableton/dettato-onnx

## Resumen

Dettato ONNX es la exportación a formato ONNX Runtime de la primera etapa del pipeline de transcripción musical automática (audio a MIDI) del modelo kobimusic/dettato, desarrollado originalmente por Nathan Mills (KobiMusic). El repositorio, publicado por el usuario fpp-ableton, contiene únicamente el módulo *transcriber*, un modelo de 15,3 millones de parámetros que detecta notas con altura definida (las 88 teclas de un piano, con dos voces por tecla) a partir de audio de 16 kHz. La exportación mantiene pesos y red sin cambios y está pensada para ejecutarse en CPU sin dependencia de PyTorch, por ejemplo mediante `onnxruntime-node`.

El interés técnico de esta ficha radica en que demuestra un flujo de despliegue ligero para transcripción musical: un único fichero ONNX de 81,9 MB con el front-end logarítmico-armónico integrado en el grafo, interfaz tensorial explícita y una fidelidad numérica verificada frente al modelo PyTorch original (diferencia máxima de 1,5e-6 sobre las seis salidas). No obstante, es importante subrayar que este repositorio no contiene el pipeline completo: el reparador de evidencias, el agrupador de instrumentos y el modelo de batería son modelos separados y no están incluidos.

La licencia es Apache-2.0, heredada del modelo base, y el autor original conserva la atribución. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, lo que indica que se trata de una publicación reciente (creada el 17 de noviembre de 2026) y de nicho, orientada a integraciones en aplicaciones de escritorio o web que necesiten transcripción musical sin infraestructura de aprendizaje profundo pesada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de transcripción musical (transcriber de dettato); topología concreta no disponible en la información proporcionada |
| Parametros totales | 15,3 millones (modelo base kobimusic/dettato) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | ventana de audio de 8 s a 16 kHz mono (128.000 muestras); procesamiento por ventanas solapadas |
| Tipos de cuantizacion | fp32 (única variante publicada en este repo) |
| Idiomas soportados | no aplica (modelo de audio a MIDI, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`transcriber.onnx`, 81,9 MB); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

El repositorio exporta el módulo *transcriber* de kobimusic/dettato, un modelo de 15,3 millones de parámetros que recibe una ventana de audio de 8 segundos a 16 kHz mono (`f32 [1, 128000]`) y produce seis mapas de probabilidad (`f32 [1, 6, 400, 88]`): `onset`, `frame`, `offset`, `onset2`, `frame2` y `offset2`, con resolución de 20 ms por fotograma y 88 carriles correspondientes a las notas MIDI 21 a 108. El front-end logarítmico-armónico está integrado dentro del grafo ONNX, de modo que la entrada es audio crudo y no un espectrograma precalculado.

La innovación principal de esta exportación es operativa más que arquitectónica: permite ejecutar el transcriber en CPU mediante ONNX Runtime sin PyTorch, con fidelidad numérica verificada. Según la model card, la diferencia máxima absoluta frente al modelo PyTorch en fp32 es de 1,5e-6 sobre las seis salidas, y la decodificación de notas sobre grabaciones completas (7 y 5 ventanas con salto de 2 s) produce resultados idénticos al decodificador de referencia (37/37 y 33/33 notas, con tiempos de onset/offset dentro de 5e-8 s). No se proporcionan datos sobre el conjunto de entrenamiento original, número de tokens de audio, composición del dataset ni si hubo etapas de refinamiento; esa información correspondería al modelo base y no está incluida en la información disponible.

## Capacidades

- Transcripción de audio a MIDI de notas con altura definida: detecta las 88 teclas de piano y hasta dos voces simultáneas por tecla (voces principal y secundaria).
- Detección de onsets, offsets y frames activos por nota, con umbrales de decodificación documentados (onset ≥ 0,25, segunda voz ≥ 0,3, offset ≥ 0,3, frame ≥ 0,4).
- Procesamiento por ventanas solapadas de 8 s con promedio ponderado por ventana de Hann; el salto de referencia es de 2 s, y con salto de 4 s se obtiene aproximadamente el doble de velocidad con un 97–100 % de coincidencia de notas según pruebas del autor.
- Ejecución en CPU sin PyTorch mediante ONNX Runtime, incluido `onnxruntime-node` para entornos JavaScript/TypeScript.
- No incluye: reparación de evidencias, agrupación de instrumentos ni transcripción de batería (modelos separados del pipeline dettato).
- No soporta tool calling, agentes, visión, audio generativo ni capacidades multilingües en el sentido lingüístico.

## Casos de uso

- Aplicaciones de escritorio de transcripción musical: integrar `transcriber.onnx` con `onnxruntime-node` o el runtime nativo de ONNX para convertir grabaciones de piano en MIDI sin empaquetar PyTorch ni CUDA, gracias a los 81,9 MB del fichero.
- Herramientas web de edición musical: ejecutar la inferencia en el navegador o en un backend ligero para generar partituras o piano rolls editables a partir de audio subido por el usuario, procesando ventanas de 8 s con solapamiento.
- Preprocesado en pipelines de producción musical: usar la salida de notas como entrada para el reparador de evidencias y el agrupador de instrumentos del pipeline dettato completo, que son modelos separados no incluidos en este repositorio.
- Análisis musicológico y educativos: extraer onsets, offsets y notas con dos voces por tecla para estudiar interpretaciones, digitación o polifonía en grabaciones de piano.
- Sistemas embebidos o de bajo consumo: al requerir solo CPU y un modelo de 15,3 millones de parámetros, puede desplegarse en dispositivos sin GPU para transcripción en tiempo casi real con saltos de ventana de 2 a 4 s.
- Investigación en transcripción automática: servir como referencia reproducible de exportación ONNX con fidelidad numérica documentada, útil para comparar implementaciones de decodificación o para portar el decodificador de referencia a otros lenguajes (el autor menciona un port a TypeScript).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta métricas de fidelidad de la exportación: diferencia máxima absoluta de 1,5e-6 entre ONNX Runtime y PyTorch fp32 sobre las seis salidas, y coincidencia exacta de notas decodificadas en dos grabaciones completas (37/37 y 33/33 notas). No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de transcripción musical (como F1 de notas) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no aplica para CPU; en GPU, el modelo fp32 de 81,9 MB requiere menos de 1 GB de memoria, aunque no se documentan requisitos oficiales.
- GPU recomendadas: no disponibles; el modelo está diseñado explícitamente para CPU sin PyTorch.
- Compatibilidad con GPU de consumo: sí, por tamaño (81,9 MB), cualquier GPU consumer podría alojarlo, pero la información disponible no incluye pruebas en GPU.
- Opciones de despliegue: ONNX Runtime (incluido `onnxruntime-node`), con el script de exportación `tools/export_dettato_onnx.py` para reproducir la conversión desde los pesos safetensors del modelo base.
- Latencia y throughput: no disponibles de forma oficial; la model card indica que un salto de ventana de 4 s es aproximadamente el doble de rápido que el de referencia (2 s), con un 97–100 % de coincidencia de notas en las pruebas del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| dettato-onnx (este repo) | 15,3 M | audio de 8 s por ventana | ONNX | Apache-2.0 | Solo etapa transcriber; CPU sin PyTorch |
| kobimusic/dettato (base) | 15,3 M (transcriber) | audio de 8 s por ventana | safetensors | Apache-2.0 | Pipeline completo con reparador, agrupador y batería |
| Otros modelos de transcripción musical | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre alternativas comparables (por ejemplo, modelos de transcripción audio-a-MIDI de otros autores) en la documentación facilitada, por lo que la comparativa se limita al modelo base y a la ausencia de datos de terceros.

## Limitaciones y advertencias

- El repositorio contiene solo la primera etapa del pipeline dettato; no realiza transcripción completa de instrumentos ni de batería, y requiere modelos adicionales para un flujo de producción completo.
- No se documentan sesgos del modelo; al ser un modelo de audio, los sesgos potenciales estarían en el dataset de entrenamiento original, no descrito en la información disponible.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero la decodificación por umbrales puede producir notas espurias o perder notas débiles; los umbrales documentados son heurísticos y no se han validado con métricas publicadas.
- Limitaciones de idioma: no aplica; la limitación relevante es de dominio (piano y notas con altura definida, dos voces por tecla) y de formato de audio (16 kHz mono, ventanas de 8 s).
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe conservar la atribución al autor original (KobiMusic / Nathan Mills) y el fichero NOTICE; el repositorio no está afiliado ni respaldado por el autor original.
- Caveat de producción: el repositorio tiene 0 descargas y 0 likes, es una publicación reciente y de nicho; no hay garantías de mantenimiento ni de soporte.
- La fidelidad verificada se limita a las pruebas descritas (dos grabaciones completas); no hay validación a gran escala publicada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fpp-ableton/dettato-onnx
- Modelo base: https://huggingface.co/kobimusic/dettato
- Repositorio GitHub del proyecto dettato: https://github.com/kobimusic/dettato
- Decodificador de referencia: https://github.com/kobimusic/dettato/tree/main/src/dettato/transcriber
