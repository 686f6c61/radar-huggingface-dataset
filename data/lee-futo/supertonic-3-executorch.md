# lee-futo/supertonic-3-executorch

## Resumen

`lee-futo/supertonic-3-executorch` no es un modelo entrenado desde cero, sino un artefacto de despliegue: la exportación del modelo de síntesis de voz `Supertone/supertonic-3` al formato `.pte` de ExecuTorch 1.5.1, usando XNNPACK como backend de ejecución en CPU. Lo publica el usuario lee-futo y su propósito es permitir inferencia de text-to-speech en dispositivos sin GPU, sin runtime de PyTorch y con un consumo de memoria muy reducido.

El repositorio ofrece dos variantes de pesos: una cuantizada a int8 mediante GPTQ de 142 MB (la recomendada por el autor) y una en fp32 de 398 MB. Cada fichero `.pte` empaqueta las cuatro etapas del pipeline original —`duration_predictor`, `text_encoder`, `vector_estimator` y `vocoder`— junto con un `ops.txt` que enumera los kernels de ExecuTorch necesarios y un `metadata.json` con los detalles de la exportación.

Su relevancia es práctica: demuestra que un pipeline TTS completo puede caber en ~140 MB y ejecutarse en CPU, lo que habilita síntesis de voz offline en móviles, sistemas embebidos y servidores sin acelerador. La información publicada es, sin embargo, mínima: no hay datos de arquitectura interna, idiomas, calidad (MOS) ni benchmarks, y el repositorio no registra descargas ni valoraciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; el artefacto contiene cuatro etapas: `duration_predictor`, `text_encoder`, `vector_estimator` y `vocoder` |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (modelo TTS, no generativo de texto) |
| Tipos de cuantización | int8 con GPTQ (142 MB, recomendada) y fp32 (398 MB) |
| Idiomas soportados | No disponible |
| Licencia | OpenRAIL-M (se aplican las restricciones de uso del Attachment A) |
| Formato de pesos | `.pte` (ExecuTorch 1.5.1), acompañado de `ops.txt` y `metadata.json` |
| Backend de ejecución | XNNPACK (CPU) |
| Modelo base | `Supertone/supertonic-3` |
| Tarea (pipeline) | text-to-speech |
| Tamaño del repositorio | 0,5 GB |
| Scripts de exportación | Incluidos en `export/` |

## Arquitectura y entrenamiento

El artefacto no documenta la arquitectura interna del modelo base. Lo único verificable es la estructura del grafo exportado: cuatro etapas encadenadas que se corresponden con el esquema habitual de los sistemas TTS no autorregresivos —predicción explícita de duración, codificación del texto, un estimador generativo del vector acústico y un vocoder neuronal—. El nombre `vector_estimator` sugiere un modelo generativo por pasos (estilo flow matching o difusión), pero la model card no lo confirma, por lo que debe tratarse como una inferencia a partir de los nombres de los módulos, no como un dato del autor.

Tampoco hay información sobre datos de entrenamiento: no se indica el número de tokens, la composición del corpus, los idiomas cubiertos ni si hubo ajuste por RLHF o DPO. La innovación técnica de esta publicación es exclusivamente de despliegue: empaquetar las cuatro etapas en un único `.pte`, cuantizar a int8 con GPTQ conservando una alternativa fp32, y documentar los kernels requeridos (`ops.txt`) para facilitar la integración en el runtime de ExecuTorch. El autor advierte explícitamente de que los `.pte` son versiones modificadas de los pesos de Supertone Inc. y que las restricciones del Attachment A de la licencia se aplican también a los derivados.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) mediante un pipeline completo de cuatro etapas en un solo fichero `.pte`.
- Inferencia en CPU a través de ExecuTorch con kernels XNNPACK, sin necesidad de GPU ni de PyTorch en el dispositivo.
- Dos perfiles de precisión: int8/GPTQ (142 MB) para entornos con memoria limitada y fp32 (398 MB) para mayor fidelidad numérica.
- Ejecución totalmente offline y local, sin llamadas a servicios externos.
- Portabilidad a plataformas soportadas por ExecuTorch (bindings de C++, Python, Kotlin y Swift según el runtime).
- Exportación reproducible: los scripts de `export/` permiten regenerar los `.pte` a partir de los pesos originales.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta razonamiento multi-paso, agentes, visión ni audio de entrada: es un modelo unidireccional texto → audio.
- Capacidades multilingües: no disponibles en la documentación.

## Casos de uso

- **Lectura de notificaciones y accesibilidad en móviles**: la variante int8 de 142 MB puede integrarse en una app iOS/Android con ExecuTorch y sintetizar texto en el propio dispositivo, sin conexión y sin enviar contenido del usuario a un servidor.
- **Asistentes de voz embebidos en IoT**: en una Raspberry Pi o un dispositivo domótico con CPU ARM, el pipeline completo cabe en memoria y elimina la dependencia de la nube, lo que reduce latencia y coste por petición.
- **Audioguías y kioscos interactivos**: generación local de locuciones para museos, aeropuertos o comercios donde no hay garantía de conectividad y se requiere funcionamiento continuo durante largos periodos.
- **Pre-generación por lotes de locuciones**: en un servidor sin GPU, procesar guiones de e-learning, podcasts o vídeo corporativo en cola, usando la variante fp32 cuando la calidad prime sobre el coste de cómputo.
- **Pruebas automatizadas de pipelines de voz**: generar audio sintético determinista en CI para validar sistemas de ASR, diarización o agentes conversacionales sin depender de grabaciones humanas ni de APIs externas.
- **Prototipado de agentes conversacionales con privacidad por diseño**: ejecutar la parte TTS en el cliente mientras el LLM reside en servidor, de modo que el texto transcriptor no salga del dispositivo en los flujos sensibles.
- **Evaluación comparativa de backends de inferencia**: usar los dos `.pte` (int8 y fp32) como banco de pruebas para medir el impacto de la cuantización GPTQ en un modelo TTS sobre XNNPACK.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de calidad de síntesis (MOS, CMOS, WER de ASR sobre el audio generado), comparaciones con el modelo base ni mediciones de latencia o throughput en ningún hardware concreto.

## Requisitos de hardware

- **VRAM/RAM estimada**: no publicada. Como referencia de orden de magnitud, los pesos ocupan 142 MB (int8) y 398 MB (fp32); añadiendo buffers de activación y el runtime de ExecuTorch, un presupuesto de ~0,3–0,5 GB para int8 y ~0,7–1,0 GB para fp32 es una estimación razonable, no un dato del autor.
- **GPU**: no son necesarias. El artefacto está exportado para XNNPACK, el backend de CPU; no se incluye delegado GPU (CUDA, Metal ni Vulkan) en los ficheros publicados.
- **CPU**: cualquier CPU moderna de 64 bits con soporte de los kernels listados en `ops.txt`. El perfil int8 está pensado para dispositivos de gama baja y móviles.
- **¿Cabe en hardware de consumo?**: sí, en cualquier PC convencional, portátil, móvil o placa SBC con varios cientos de MB de memoria libre.
- **Opciones de despliegue**: runtime de ExecuTorch 1.5.1 (C++, Python y bindings móviles). No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- **Latencia y throughput**: no disponibles. Dependen del número de pasos del `vector_estimator`, de la longitud del texto y del SoC empleado; conviene medirlos en el hardware objetivo antes de comprometer un SLA.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| `lee-futo/supertonic-3-executorch` | No disponible | No aplica | `.pte` / ExecuTorch + XNNPACK (CPU) | OpenRAIL-M | Dos variantes: int8 142 MB y fp32 398 MB; sin benchmarks publicados |
| `Supertone/supertonic-3` (base) | No disponible | No aplica | Pesos originales (formato no indicado en la información disponible) | OpenRAIL-M | Mismo modelo sin exportar; requiere el stack original en lugar del runtime de ExecuTorch |
| Kokoro-82M | 82 M | No aplica | ONNX y otros | Apache-2.0 | Referencia habitual de TTS ligero; no se dispone de comparación de calidad con este artefacto |
| Piper (VITS) | No disponible | No aplica | ONNX | MIT | Orientado a TTS embebido en CPU; comparación cualitativa no disponible |

No existen datos públicos que permitan comparar la calidad de síntesis, la latencia ni el consumo de memoria de este artefacto frente a las alternativas citadas; la comparación se limita a formato, licencia y encaje en el despliegue.

## Limitaciones y advertencias

- **Ausencia total de evaluaciones**: sin MOS, sin WER sobre ASR de ida y vuelta y sin comparación con el modelo base. No hay evidencia publicada de que la cuantización int8/GPTQ preserve la calidad perceptual del fp32.
- **Idiomas desconocidos**: la model card no enumera lenguas soportadas; no debe asumirse cobertura multilingüe ni un idioma concreto sin probarlo.
- **Licencia restrictiva**: OpenRAIL-M con restricciones de uso en el Attachment A que se extienden a los ficheros `.pte` y a cualquier derivado. Es obligatorio revisar `LICENSE` y `NOTICE` antes de un uso comercial; el autor no garantiza compatibilidad con productos propietarios.
- **Preprocesado no incluido**: el pipeline empaquetado cubre las cuatro etapas acústicas; la normalización de texto (números, abreviaturas, siglas, puntuación) y la tokenización deben resolverse en la aplicación, lo que afecta directamente a la calidad de la prosodia y la pronunciación.
- **Riesgo de errores de pronunciación y prosodia**: como todo sistema TTS, puede generar homógrafos mal resueltos, énfasis incorrecto en frases largas y artefactos en el vocoder, especialmente en la variante int8.
- **Dependencia de versión**: los `.pte` están exportados para ExecuTorch 1.5.1; cambios de versión del runtime pueden romper la compatibilidad binaria. Los kernels requeridos están listados en `ops.txt`.
- **Sin validación comunitaria**: 0 descargas y 0 likes en el momento de la consulta; el artefacto no ha sido auditado ni probado por terceros.
- **No es un modelo de lenguaje**: no admite instrucciones, tool calling, agentes ni razonamiento; cualquier expectativa en ese sentido es un error de categoría.
- **Procedencia de los pesos**: se trata de versiones modificadas de los pesos de Supertone Inc.; la trazabilidad de los datos de entrenamiento originales no está documentada en esta ficha.

## Enlaces

- Repositorio HuggingFace: [lee-futo/supertonic-3-executorch](https://huggingface.co/lee-futo/supertonic-3-executorch)
- Modelo base: [Supertone/supertonic-3](https://huggingface.co/Supertone/supertonic-3)
- Licencia del artefacto: fichero `LICENSE` del repositorio (OpenRAIL-M, incluye Attachment A)
- Aviso de copyright: fichero `NOTICE` del repositorio (Copyright (c) 2026 Supertone Inc.)
- Scripts de exportación: carpeta `export/` del repositorio
- Listado de kernels requeridos: ficheros `ops.txt` junto a cada `.pte`

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces obtenidos correspondían a una marca de ropa homónima y se han descartado.
