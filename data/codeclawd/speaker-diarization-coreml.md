# codeclawd/speaker-diarization-coreml

## Resumen

Speaker Diarization Core ML es un conjunto de artefactos Core ML que implementa una pipeline completa de diarizacion de hablantes ("quien habla y cuando") para ejecucion local en plataformas Apple. No es un modelo de lenguaje ni un modelo entrenado desde cero: son conversiones a Core ML de los pesos publicos de pyannote/speaker-diarization-community-1 (segmentacion y embeddings), junto con los parametros PLDA/VBx de agrupamiento (clustering) de hablantes. La publicacion analizada, `codeclawd/speaker-diarization-coreml`, es un espejo byte a byte del repositorio `FluidInference/speaker-diarization-coreml` (revision `7eab74f3`), mantenido por el equipo PrivateWispr como copia de seguridad.

El problema que resuelve es concreto: permitir diarizacion de audio en el dispositivo, sin enviar grabaciones a la nube, dentro del ecosistema de FluidAudio (iOS 17 / macOS 14 o posterior). El repositorio ocupa 0,1 GB e incluye los submodelos de segmentacion (`Segmentation.mlmodelc`), extraccion de caracteristicas (`FBank.mlmodelc`), embeddings de hablante (`Embedding.mlmodelc`) y agrupamiento PLDA (`PLDA.mlmodelc`, `PldaRho.mlmodelc`), ademas de paquetes sin compilar bajo `mlpackages/` para Segmentation, FBank, Embedding y PldaRho.

Su relevancia es practica para desarrolladores de aplicaciones de voz en Apple: la pipeline original de pyannote depende de PyTorch y de modelos con acceso condicionado (gated), mientras que estos artefactos estan empaquetados en Core ML, con procedencia documentada mediante hashes SHA-256, y se pueden integrar en apps nativas. La licencia es mixta ("other" con `license_name: scoped-cc-by-4.0`), con alcances distintos para los artefactos Community-1 y los artefactos heredados de compatibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de diarizacion de hablantes: segmentacion neuronal (Powerset multi-class) + extraccion de embeddings de hablante + agrupamiento PLDA/VBx. Componentes convertidos a Core ML |
| Parametros totales | no disponible (el repositorio completo ocupa 0,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de lenguaje). Entrada: audio mono a 16 kHz; salida: segmentos con marcas de tiempo e identificador de hablante |
| Tipos de cuantizacion | Artefactos Community-1: no disponible. Artefactos heredados: incluye `wespeaker_int8.mlmodelc` (cuantizado a int8) |
| Idiomas soportados | no disponible (no se declaran idiomas; la diarizacion depende de caracteristicas acusticas, no de transcripcion) |
| Licencia | `other` con `license_name: scoped-cc-by-4.0` (CC-BY-4.0 con alcance limitado). Repositorio de licencia mixta; los artefactos heredados no estan cubiertos por ese alcance (`segmentation-3.0` es MIT y `wespeaker-voxceleb-resnet34-LM` es CC-BY-4.0) |
| Formato de pesos | Core ML: `.mlmodelc` (compilados) y `.mlpackage` (sin compilar). No hay safetensors ni GGUF |
| Framework de origen | PyTorch 2.8.0, dialecto TorchScript, convertido con coremltools 9.0b1 |
| Metadata de compilacion | coremlc 3500.32.1, MIL 3500.14.1 |
| Plataformas objetivo | iOS 17 / macOS 14 o posterior (Apple Neural Engine, GPU o CPU) |
| Modelo base | pyannote/speaker-diarization-community-1 (referencia inmutable `@3533c8cf`); artefactos heredados: pyannote/segmentation-3.0 y pyannote/wespeaker-voxceleb-resnet34-LM |

## Arquitectura y entrenamiento

La pipeline sigue el esquema clasico de diarizacion modular: primero un detector de actividad de voz y un modelo de segmentacion que asigna etiquetas de hablante local (formulacion "powerset multi-class", descrita en Plaquet y Bredin, INTERSPEECH 2023), despues un extractor de embeddings de hablante (WeSpeaker, ICASSP 2023) que produce vectores por segmento, y finalmente un agrupamiento bayesiano de secuencias de x-vectors (VBx, Landini et al., 2022) implementado aqui mediante los artefactos PLDA y `PldaRho`. El repositorio no entrena ningun modelo: son conversiones a Core ML de pesos ya existentes, por lo que no hay datos de entrenamiento, numero de tokens ni fases de RLHF/DPO que reportar. La model card indica explicitamente que "no son modelos afinados" (fine-tuned), sino conversiones.

La innovacion relevante es de ingenieria de despliegue, no de investigacion: la conversion de una pipeline multi-componente a Core ML, la generacion de un grafo determinista de extraccion de caracteristicas (`FBank.mlmodelc`) configurado a partir del checkpoint de embeddings y la serializacion de los parametros PLDA (`plda-parameters.json`, `xvector-transform.json`). La procedencia esta documentada en `provenance.json` con hashes SHA-256 por artefacto; la propia model card advierte que el checkout local exacto y el commit de Mobius usados en la conversion original de 2025 no se registraron, de modo que los binarios no se presentan como una build reproducible plenamente atestiguada. La pipeline de conversion actual (que exige SHA completo del upstream, hashes de entrada y salida y captura del entorno) esta en `FluidInference/mobius@ffbc3c8`.

## Capacidades

- Diarizacion de hablantes completa: produce segmentos con marcas de tiempo e identificador de hablante sobre audio mono a 16 kHz.
- Deteccion de actividad de voz (VAD), tal como declara el `pipeline_tag: voice-activity-detection`.
- Deteccion de cambio de hablante y segmentacion por hablante (`speaker-change-detection`, `speaker-segmentation`).
- Extraccion de embeddings de hablante (x-vectors) reutilizables para tareas de verificacion o comparacion de voces.
- Agrupamiento de hablantes mediante PLDA/VBx, incluyendo la transformacion de x-vectors (`xvector-transform.json`).
- Ejecucion totalmente local en el dispositivo, sin llamadas a servicios externos.
- Compatibilidad con el diarizador online heredado de FluidAudio a traves de los artefactos `pyannote_segmentation.mlmodelc`, `wespeaker.mlmodelc`, `wespeaker_v2.mlmodelc` y `wespeaker_int8.mlmodelc`.
- No realiza transcripcion, traduccion ni generacion de texto: es un componente acustico, no un modelo de lenguaje. No tiene tool calling, agentes ni modo de razonamiento.

## Casos de uso

- Actas de reunion en apps nativas de Apple: la pipeline segmenta el audio por hablante y permite asociar cada tramo a una persona; al ejecutarse en Core ML no es necesario subir la grabacion a un servidor, lo que simplifica el cumplimiento de RGPD en entornos corporativos.
- Subtitulado con atribucion de hablante: combinando estos segmentos con un motor de reconocimiento de voz (por ejemplo, `Speech` de Apple), se obtienen subtitulos etiquetados por interlocutor para podcasts, entrevistas o clases grabadas.
- Analisis de llamadas de atencion al cliente: separar las intervenciones de agente y cliente permite medir tiempos de habla, turnos y solapamientos, metricas habituales en calidad de centros de contacto.
- Documentacion clinica y entrevistas: diarizar entrevistas medicas o sesiones de investigacion cualitativa en el propio dispositivo, manteniendo el audio bajo control del profesional y evitando transferencias a terceros.
- Indexacion y busqueda en archivos de audio: al disponer de segmentos con hablante y marca temporal, se puede construir un indice "quien dijo que y cuando" sobre archivos de voz corporativos o periodisticos.
- Edicion de video y postproduccion: generar automaticamente pistas de hablante para mezcla de audio, corte por intervenciones o seleccion de tomas, integrado en herramientas de macOS.
- Accesibilidad: transcripcion en directo con identificacion de hablante para personas con discapacidad auditiva, con latencia reducida al no depender de la red.
- Deteccion de cambio de hablante para asistentes por voz: activar o desactivar el reconocimiento de comandos segun quien habla, evitando que un asistente responda a voces no autorizadas (requiere ademas un verificador de hablante).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye DER (Diarization Error Rate), tasas de falsa alarma, ni metricas de latencia o throughput; tampoco se reportan mediciones de paridad numerica respecto al upstream mas alla de la mencion generica de "evidencia de paridad" para los artefactos heredados, cuyo detalle esta en `NOTICE.md` y no se reproduce en los datos disponibles.

## Requisitos de hardware

- VRAM: no disponible. No es un modelo para GPU discreta con memoria dedicada; se ejecuta sobre Core ML usando memoria unificada del sistema.
- Unidades de ejecucion: Neural Engine, GPU o CPU de Apple, segun la politica de asignacion que aplique la aplicacion al cargar los modelos.
- Sistemas soportados: iOS 17 o posterior y macOS 14 o posterior, segun la model card.
- GPU recomendadas: no aplica (no hay soporte CUDA ni ROCm). El hardware objetivo son SoC Apple (familia A y familia M); no se especifica el modelo minimo ni la memoria necesaria.
- Tamano en disco: el repositorio completo ocupa aproximadamente 0,1 GB, lo que lo hace apto para empaquetado dentro de una aplicacion movil.
- Opciones de despliegue: SDK de FluidAudio (integracion documentada en su carpeta `Documentation/Diarization`) y carga directa de modelos Core ML. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no hay pesos en safetensors ni GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de factor en tiempo real ni de consumo energetico.

## Comparativa con modelos similares

| Modelo | Que es | Formato | Plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| codeclawd/speaker-diarization-coreml (esta ficha) | Espejo de las conversiones Core ML de la pipeline Community-1 | `.mlmodelc` / `.mlpackage` | Core ML, iOS 17+ / macOS 14+ | `other`, `scoped-cc-by-4.0` (licencia mixta) | Publico en HuggingFace; 0 descargas y 0 likes en el momento de la consulta |
| FluidInference/speaker-diarization-coreml | Repositorio upstream original de estas conversiones | `.mlmodelc` / `.mlpackage` | Core ML, iOS 17+ / macOS 14+ | `other`, `scoped-cc-by-4.0` | Publico en HuggingFace; referenciado en la model card |
| pyannote/speaker-diarization-community-1 | Pipeline de diarizacion original en PyTorch | Pesos PyTorch (segmentation y embedding) | Servidor, GPU/CPU con PyTorch | no disponible en la informacion proporcionada | Referencia inmutable `@3533c8cf`; el acceso al repositorio original esta condicionado en la practica |
| pyannote/segmentation-3.0 | Modelo de segmentacion de hablante | Pesos PyTorch, convertidos aqui a Core ML en los artefactos heredados | PyTorch / Core ML (via conversion) | MIT | Publico en HuggingFace |
| pyannote/wespeaker-voxceleb-resnet34-LM | Extractor de embeddings de hablante | Pesos PyTorch, convertidos aqui a Core ML en los artefactos heredados | PyTorch / Core ML (via conversion) | CC-BY-4.0 | Publico en HuggingFace |

Las metricas comparativas de DER entre estas alternativas no estan disponibles en la informacion proporcionada, por lo que la comparacion se limita a formato, plataforma y licencia.

## Limitaciones y advertencias

- Riesgo de atribucion erronea de hablantes: la diarizacion se basa en similitud acustica; voces parecidas, solapamientos frecuentes, ruido de fondo o habla muy corta degradan la asignacion. No se publican cifras de DER que permitan acotar el error.
- Rendimiento por idioma no acotado: no se declaran idiomas soportados ni evaluaciones por idioma o acento, de modo que el comportamiento en castellano o en entornos multilingues no esta documentado.
- Sin transcripcion: para obtener texto hay que encadenar un motor de reconocimiento de voz externo y sincronizar sus tiempos con los segmentos; los errores de alineacion entre ambos componentes son un riesgo real en produccion.
- Licencia mixta y de alcance limitado: la licencia es `other` con `license_name: scoped-cc-by-4.0`. El CC-BY-4.0 solo cubre el conjunto de artefactos Community-1; los artefactos heredados (`pyannote_segmentation.mlmodelc`, artefactos WeSpeaker, incluido `wespeaker_int8.mlmodelc`) quedan fuera de ese alcance y se rigen por sus licencias originales (MIT y CC-BY-4.0). Antes de un uso comercial es obligatorio revisar `NOTICE.md`, `LICENSE` y `PROVENANCE.md`, y cumplir con la atribucion a pyannote, WeSpeaker, BUT Speech@FIT (parametros PLDA) y FluidInference.
- Procedencia no completamente atestiguada: la conversion original de 2025 no registro el checkout local exacto ni el commit de Mobius, por lo que los binarios no se describen como una build reproducible. Si la cadena de suministro es critica, hay que verificar los hashes SHA-256 de `provenance.json`.
- Repositorio espejo: este repositorio es una copia de seguridad mantenida por un tercero (PrivateWispr); los archivos son identicos al upstream, pero el mantenimiento, las actualizaciones y el soporte dependen de FluidInference.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, y actualizacion registrada el 2026-10-14 sin historial posterior. No hay evidencia publica de uso en produccion ni de pruebas independientes.
- Encierro tecnologico: los artefactos solo son utiles en el ecosistema Apple; no hay exportacion a ONNX, GGUF ni safetensors en este repositorio.
- Sin datos de consumo: no se publican cifras de latencia, consumo de bateria ni memoria pico, factores decisivos en aplicaciones moviles en tiempo real.

## Enlaces

- Repositorio de HuggingFace (esta ficha): https://huggingface.co/codeclawd/speaker-diarization-coreml
- Repositorio upstream en HuggingFace: https://huggingface.co/FluidInference/speaker-diarization-coreml
- NOTICE.md (atribucion y alcance de licencia): https://huggingface.co/FluidInference/speaker-diarization-coreml/blob/main/NOTICE.md
- FluidAudio (SDK que consume estos modelos): https://github.com/FluidInference/FluidAudio
- Documentacion de diarizacion de FluidAudio: https://github.com/FluidInference/FluidAudio/tree/main/Documentation/Diarization
- Pipeline de conversion actual (Mobius, revision `ffbc3c8`): https://github.com/FluidInference/mobius/tree/ffbc3c8cae2d0ac83912a005a25a2874ced98a3a/models/speaker-diarization/pyannote-community-1/coreml
- Referencia historica de conversion (Mobius, revision `33fd6eab`): https://github.com/FluidInference/mobius/tree/33fd6eab634966ae7db4d73da3376a90379642fb/models/speaker-diarization/pyannote-community-1/coreml
- Modelo base en HuggingFace (revision inmutable `@3533c8cf`): https://huggingface.co/pyannote/speaker-diarization-community-1/tree/3533c8cf8e369892e6b79ff1bf80f7b0286a54ee
- pyannote/segmentation-3.0 (artefactos heredados, MIT): https://huggingface.co/pyannote/segmentation-3.0
- pyannote/wespeaker-voxceleb-resnet34-LM (artefactos heredados, CC-BY-4.0): https://huggingface.co/pyannote/wespeaker-voxceleb-resnet34-LM

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace.
