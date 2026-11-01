# manrongjun/meeting-models

## Resumen

`manrongjun/meeting-models` es un paquete de modelos empaquetados para macOS (Apple Silicon, macOS 15+) orientado a la transcripción, traducción, diarización de hablantes y resumen de reuniones, ejecutado de forma local. No se trata de un modelo único entrenado por el autor, sino de una distribución que agrupa varios modelos de terceros con pesos en Core ML y GGUF, junto con un fichero de configuración `meeting-models.json` y metadatos de origen (`SOURCES.json`) y licencias (`LICENSES.md`).

El paquete cubre la cadena completa de un pipeline de reuniones: detección de actividad de voz con Silero VAD, transcripción con Qwen3-ASR-0.6B en Core ML, traducción con HY-MT2-1.8B cuantizado Q4_K_M, análisis de hablantes con NVIDIA Nemotron-3-Diarization en Q8_0 y resumen con Qwen3.5-2B Q4_K_M (conversión de Unsloth). El repositorio ocupa 3,4 GB y el instalador ZIP para macOS ARM64 unos 3,37 GB.

Su relevancia es práctica: ofrece una vía llave en mano para montar procesamiento de reuniones 100% local en hardware Apple, sin depender de servicios en la nube. Los idiomas declarados son chino (zh) e inglés (en). La licencia es mixta (`mixed-model-licenses`), lo que obliga a revisar componente por componente antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (paquete multi-modelo: VAD, ASR, MT, diarización y LLM de resumen) |
| Parametros totales | No disponible como conjunto; componentes de 0,6B (ASR), 1,8B (traducción), 2B (resumen) y diarización sin tamaño declarado |
| Parametros activos | No aplica (no se declara ningún componente MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (HY-MT2-1.8B y Qwen3.5-2B), Q8_0 (Nemotron-3-Diarization), Core ML (Qwen3-ASR-0.6B, formato no especificado) |
| Idiomas soportados | zh, en |
| Licencia | Mixta (`mixed-model-licenses`, licencia `other`); detalle en `LICENSES.md` |
| Formato de pesos | Core ML, GGUF; distribución adicional en ZIP para macOS ARM64 |

## Arquitectura y entrenamiento

No se dispone de información sobre el entrenamiento de los componentes: la model card no documenta tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO. Lo que sí se especifica es la composición funcional del paquete y el formato de cada artefacto: Silero VAD para detección de voz, Qwen3-ASR-0.6B convertido a Core ML con tokenizer fijo, HY-MT2-1.8B en GGUF Q4_K_M para traducción, NVIDIA Nemotron-3-Diarization en GGUF Q8_0 para análisis de hablantes y Qwen3.5-2B en GGUF Q4_K_M (conversión de Unsloth) para el resumen posterior.

El autor indica que los pesos del paquete son idénticos a los ficheros upstream, con las versiones de origen registradas en `SOURCES.json`. La innovación principal no está en la arquitectura de los modelos, sino en el empaquetado: una distribución reproducible (SHA-256 del ZIP: `84b675da513bc65e4187aa660d6f237ad831073002170bf4cf94a440726b60be`), verificada mediante descompresión con el extractor oficial de la app de ejemplo y comprobación de digest por fichero. El propio autor advierte que esta verificación de empaquetado no constituye una validación de precisión de reconocimiento, inferencia ni calidad en reuniones largas.

## Capacidades

- Detección de actividad de voz (VAD) mediante Silero VAD, como etapa previa de segmentación.
- Transcripción de voz a texto con Qwen3-ASR-0.6B en Core ML, con tokenizer incluido en el paquete.
- Traducción automática zh↔en con HY-MT2-1.8B cuantizado Q4_K_M.
- Diarización de hablantes ("quién habla cuándo") con NVIDIA Nemotron-3-Diarization Q8_0.
- Resumen de reunión posterior a la transcripción con Qwen3.5-2B Q4_K_M.
- Ejecución local en Apple Silicon sobre macOS 15 o superior.
- Cobertura lingüística limitada a chino e inglés según los metadatos declarados.
- No se declara soporte de tool calling, function calling, agentes, visión, audio nativo del LLM ni modo de razonamiento explícito.

## Casos de uso

- Actas automáticas de reuniones internas: el pipeline encadena VAD, ASR y el LLM de resumen para producir un acta estructurada al terminar la reunión, todo en local y sin enviar audio a terceros.
- Reuniones bilingües chino-inglés: HY-MT2-1.8B permite generar transcripción y traducción en ambos sentidos, útil en equipos distribuidos entre China y mercados anglófonos.
- Identificación de intervinientes en entrevistas o focus groups: la diarización con Nemotron-3-Diarization etiqueta turnos por hablante, lo que facilita atribuir declaraciones y acciones.
- Documentación de soporte técnico: transcribir llamadas con clientes y resumirlas para alimentar un sistema de tickets, manteniendo los datos dentro del portátil del operador.
- Cumplimiento y confidencialidad: sectores con restricciones de tratamiento de datos (legal, sanidad, finanzas) pueden procesar audio sensible sin salida a la nube, al ejecutarse íntegramente en el dispositivo.
- Prototipado de apps de reuniones en macOS: el paquete y `meeting-models.json` sirven como base reproducible para desarrolladores que integren la cadena en una app de ejemplo para Apple Silicon.
- Búsqueda y archivado de reuniones: transcripciones y resúmenes locales pueden indexarse posteriormente para recuperación interna, sin exponer el audio original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de WER, BLEU, DER ni puntuaciones de resumen, y advierte explícitamente que la verificación realizada cubre solo el empaquetado y la integridad de ficheros, no la calidad de reconocimiento ni de inferencia.

## Requisitos de hardware

- Plataforma objetivo: Apple Silicon con macOS 15 o superior; el instalador es `meeting-models-macos-arm64-v1.zip` (unos 3,37 GB).
- VRAM estimada: no disponible. Al estar orientado a Apple Silicon, el consumo se reparte entre memoria unificada y GPU integrada; no se publican cifras de memoria necesaria.
- GPU recomendadas: no disponible; el paquete está diseñado para GPU integradas de Apple Silicon, no para A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no disponible para tarjetas NVIDIA/AMD; el soporte declarado es macOS ARM64.
- Opciones de despliegue: app de ejemplo para macOS con ajustes de "modelos y grabación" que descarga e instala el ZIP desde el enlace directo; los componentes GGUF (HY-MT2-1.8B, Nemotron-3-Diarization, Qwen3.5-2B) son compatibles por formato con runtimes GGUF, aunque el paquete no documenta un pipeline alternativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| manrongjun/meeting-models | Paquete multi-modelo (VAD, ASR, MT, diarización, resumen) | Componentes de 0,6B, 1,8B y 2B | No disponible | zh, en | Mixta (`mixed-model-licenses`) | HuggingFace, ZIP macOS ARM64 |
| Whisper large-v3 (referencia ASR) | ASR monolítico | ~1,55B | No disponible | Multilingüe amplio | MIT (upstream) | Amplia |
| NVIDIA NeMo (diarización) | Pipeline ASR/diarización | Variable | No disponible | Multilingüe | Varía por componente | Amplia |

La comparación directa no es homogénea: este repositorio es una distribución integrada de varios modelos de terceros, mientras que las alternativas citadas son componentes individuales. No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Idiomas limitados a zh e inglés según los metadatos; no se declara cobertura de castellano ni de otras lenguas.
- Licencia mixta: cada componente conserva su licencia upstream, recogida en `LICENSES.md`; es imprescindible revisarla antes de uso comercial, redistribución o integración en producto.
- El autor no valida precisión de reconocimiento, calidad de traducción, DER de diarización ni calidad de resumen en reuniones largas; no hay benchmarks publicados.
- Riesgo de alucinación inherente al componente de resumen (Qwen3.5-2B): los resúmenes pueden omitir o inventar detalles y requieren revisión humana.
- Las cuantizaciones Q4_K_M y Q8_0 introducen pérdida de precisión respecto a los pesos originales en punto flotante.
- Dependencia de plataforma: el instalador está pensado para macOS ARM64; no se documenta soporte para Linux, Windows o GPU discretas.
- El paquete no incluye SDK, aplicación, grabaciones ni datos de usuario; su uso requiere integrarlo en una app compatible con el formato de `meeting-models.json`.
- Repositorio sin tracción pública (0 descargas, 0 likes) en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- HuggingFace: https://huggingface.co/manrongjun/meeting-models
- Instalador macOS ARM64: https://huggingface.co/manrongjun/meeting-models/resolve/main/meeting-models-macos-arm64-v1.zip?download=true
- Licencias de componentes: https://huggingface.co/manrongjun/meeting-models/blob/main/LICENSES.md
- Origen de modelos (`SOURCES.json`): https://huggingface.co/manrongjun/meeting-models/blob/main/SOURCES.json
- Papers, blogs, repos y demos adicionales: no disponible
