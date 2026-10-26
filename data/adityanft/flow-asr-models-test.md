# adityanft/flow-asr-models-test

## Resumen

`adityanft/flow-asr-models-test` es un repositorio público de Hugging Face que no contiene un modelo entrenado desde cero, sino un conjunto de modelos de reconocimiento automático del habla (ASR) comprimidos a int4 weight-only y empaquetados en formato ONNX para su uso con el runtime sherpa-onnx. Según la model card, se trata de artefactos empleados por la build de pruebas de la aplicación Flow y el propio autor los describe explícitamente como "not a product release", es decir, material de test sin garantías de publicación.

Los modelos de origen son AI4Bharat IndicConformer (licencia MIT, con atribución obligatoria) y NVIDIA FastConformer (licencia CC-BY-4.0, con atribución obligatoria). La única modificación declarada por el autor es la cuantización a int4; no se documenta reentrenamiento, ajuste fino ni cambio de arquitectura. El repositorio ocupa 0,6 GB e incluye un `catalog.json` que lista cada archivo con su tamaño y su hash SHA-256, lo que facilita la verificación de integridad en pipelines de CI.

La relevancia es acotada y de tipo práctico: sirve como banco de pruebas para validar la integración de ASR cuantizado en sherpa-onnx, comparar dos familias de Conformer bajo la misma compresión y verificar la reproducibilidad de artefactos mediante checksums. No hay métricas publicadas, ni lista de idiomas declarada, ni pipeline tag asignado, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (modelos de origen: AI4Bharat IndicConformer y NVIDIA FastConformer); exportación a ONNX |
| Parametros totales | no disponible (el autor no declara recuento de parámetros; el repo de 0,6 GB agrupa varios modelos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica en el sentido de ventana de tokens: son modelos ASR que procesan ventanas de audio |
| Tipos de cuantizacion | int4 weight-only (única modificación declarada por el autor); no se indican otros formatos |
| Idiomas soportados | no disponible; la model card no incluye lista de idiomas. Los modelos de origen pertenecen a las familias IndicConformer (orientada a lenguas de la India) y FastConformer (multilingüe en NeMo), pero el repositorio no confirma qué idiomas cubre cada archivo |
| Licencia | `other`; los modelos de origen son MIT (IndicConformer) y CC-BY-4.0 (FastConformer), ambas con atribución obligatoria |
| Formato de pesos | ONNX cuantizado int4 weight-only, para sherpa-onnx; `catalog.json` con tamaño y SHA-256 por archivo |

Otros metadatos: autor `adityanft`, tags `onnx`, `license:other`, `region:us`; descargas 0; likes 0; pipeline no declarado; creado el 2026-10-26T18:49:00Z y actualizado el 2026-10-26T18:51:30Z.

## Arquitectura y entrenamiento

No hay entrenamiento propio. El repositorio es un artefacto de distribución: toma modelos Conformer ya entrenados por terceros y aplica cuantización int4 weight-only (solo pesos, sin cuantizar activaciones, según la descripción "int4 weight-only") antes de exportarlos a ONNX para sherpa-onnx. La arquitectura subyacente es, por tanto, la de los modelos de origen: Conformer, que combina bloques convolucionales con self-attention para capturar dependencias locales y globales en la señal de audio. IndicConformer (AI4Bharat) es la variante orientada a lenguas índicas y FastConformer (NVIDIA NeMo) es la variante con downsampling agresivo del encoder pensada para reducir coste computacional en audio largo.

No se especifican datos de entrenamiento: ni número de tokens, ni horas de audio, ni composición del dataset, ni si hubo RLHF/DPO (técnicas que, por otra parte, no aplican al pipeline habitual de ASR supervisado). Tampoco se documenta el proceso de calibración de la cuantización, el error introducido frente al modelo en precisión completa ni la herramienta empleada para convertir a ONNX. La innovación técnica declarada se limita al empaquetado: compresión int4 para reducir huella en disco y memoria, más un catálogo con checksums que permite auditar la integridad de cada artefacto. Cada carpeta incluye su propio README con el modelo de origen y la licencia aplicable, lo que es un requisito práctico para cumplir la atribución de MIT y CC-BY-4.0.

## Capacidades

- Reconocimiento automático del habla (speech-to-text) sobre audio, ejecutado mediante el runtime sherpa-onnx.
- Dos familias de encoder disponibles en el mismo repositorio (IndicConformer y FastConformer), lo que permite comparar comportamientos bajo una cuantización idéntica.
- Ejecución en formato ONNX, compatible con ONNX Runtime y con despliegues en CPU sin depender de frameworks de deep learning completos.
- Verificación de integridad de artefactos mediante SHA-256 declarado en `catalog.json`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta traducción, diarización de hablantes, detección de idioma, puntuación automática ni marcas de tiempo a nivel de palabra.
- No hay capacidades de visión, audio generativo ni modo "thinking".
- El alcance multilingüe no está declarado en la información disponible.

## Casos de uso

- Pruebas de integración de la app Flow: el repositorio se declara como material de la build de test, por lo que su uso natural es validar que el pipeline de transcripción de la aplicación carga y ejecuta los modelos ONNX int4 sin errores antes de promover artefactos a un entorno de release.
- Verificación de integridad en CI: `catalog.json` incluye tamaño y SHA-256 de cada archivo, de modo que un job de integración continua puede descargar los modelos y comprobar que los checksums coinciden, detectando corrupciones o sustituciones de binarios.
- Evaluación del impacto de la cuantización int4: comparar la salida de estos modelos comprimidos contra los modelos de origen en precisión completa sobre un conjunto de audio de referencia permite estimar la degradación en WER, siempre que el equipo aporte su propio corpus, ya que el autor no publica métricas.
- Despliegue en dispositivos de bajos recursos: al tratarse de ONNX int4 pensados para sherpa-onnx, el escenario objetivo es transcripción local en CPU o en hardware embebido donde no hay GPU ni presupuesto para servir un modelo ASR de gran tamaño.
- Benchmarking comparativo de arquitecturas Conformer: ejecutar el mismo audio a través de las carpetas derivadas de IndicConformer y de FastConformer con idéntica configuración de decodificación para contrastar latencia y calidad entre ambas familias.
- Prototipado rápido de interfaces de voz: usar el modelo como motor de transcripción de un prototipo interno (dictado, subtitulado de pruebas) aceptando que no hay garantías de soporte ni de estabilidad de la API del repositorio.
- Auditoría de licencias y atribución: revisar los README por carpeta para confirmar el cumplimiento de MIT y CC-BY-4.0 antes de redistribuir cualquier artefacto derivado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Métrica | Resultado |
|---|---|
| WER (word error rate) | no disponible |
| CER (character error rate) | no disponible |
| Latencia / RTF | no disponible |
| Comparación con el modelo sin cuantizar | no disponible |

## Requisitos de hardware

- Huella en disco: el repositorio completo ocupa 0,6 GB; el desglose por archivo está en `catalog.json`, que no se incluye en la información proporcionada. Al ser cuantización int4 weight-only, el peso en memoria de cada modelo será del orden del tamaño de su archivo ONNX más los buffers de activación y la ventana de audio procesada; no hay cifras publicadas.
- CPU: es el escenario de despliegue natural, con sherpa-onnx sobre ONNX Runtime en CPU. No se declaran requisitos mínimos de núcleos ni de instrucciones (AVX2, NEON) en la información disponible.
- GPU: no se declaran requisitos. ONNX Runtime dispone de execution provider CUDA, pero el autor no aporta datos de latencia o throughput en GPU, por lo que cualquier planificación de capacidad debe medirse in situ.
- GPU consumer: el conjunto del repositorio (0,6 GB) es muy inferior a la VRAM de cualquier GPU de consumo actual, de modo que en principio cabría en tarjetas tipo RTX 3060/4060 o superiores; sin el desglose por modelo no puede afirmarse el tamaño exacto de cada artefacto individual.
- Opciones de despliegue: sherpa-onnx (runtime destino declarado) y ONNX Runtime. vLLM, TGI, llama.cpp y Ollama no son aplicables, ya que el repositorio contiene modelos ASR en ONNX y no un LLM en safetensors o GGUF.
- Latencia y throughput: no disponible; no se publica RTF ni tiempo de transcripción por minuto de audio.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto / audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| flow-asr-models-test (este repo) | Conformer (IndicConformer + FastConformer) cuantizado int4 | no disponible | no disponible (ventanas de audio) | no disponible | `other` (orígenes MIT y CC-BY-4.0) | ONNX int4 para sherpa-onnx |
| AI4Bharat IndicConformer (origen) | Conformer para lenguas índicas | no disponible en la información | no disponible | orientado a lenguas de la India (no confirmado por el repositorio) | MIT | pesos originales del proyecto (no detallado) |
| NVIDIA FastConformer (origen, NeMo) | Conformer con downsampling del encoder | no disponible en la información | no disponible | multilingüe según NeMo (no confirmado por el repositorio) | CC-BY-4.0 | pesos originales del proyecto (no detallado) |
| Whisper (referencia de categoría ASR) | Transformer encoder-decoder | no disponible en la información | no disponible | multilingüe | MIT | no aplicable a este repositorio |

La comparación relevante aquí no es de calidad, que no está medida, sino de empaquetado y licencia: frente a los modelos de origen, este repositorio añade compresión int4 y formato ONNX listo para sherpa-onnx, a cambio de una licencia agregada `other` que obliga a revisar la atribución de ambas fuentes.

## Limitaciones y advertencias

- El autor declara explícitamente que no es un release de producto ("Not a product release"): no hay compromiso de estabilidad, soporte ni mantenimiento.
- Licencia `other` sin texto completo en la información disponible; los modelos de origen exigen atribución (MIT para IndicConformer, CC-BY-4.0 para FastConformer). Antes de un uso comercial hay que revisar los README por carpeta y la licencia agregada.
- No hay lista de idiomas declarada: no puede asumirse cobertura multilingüe ni siquiera para las lenguas que cubren los modelos de origen.
- No hay benchmarks ni WER publicado, y tampoco se cuantifica la degradación introducida por la cuantización int4 frente al modelo en precisión completa. Cualquier afirmación de calidad requiere evaluación propia.
- Riesgo de error de transcripción inherente a ASR (sustituciones, inserciones y omisiones), especialmente en audio con ruido, acentos o solapamiento de hablantes; no se documenta el comportamiento en estos escenarios.
- No se documenta manejo de puntuación, mayúsculas, marcas de tiempo ni detección de idioma, por lo que no debe asumirse en producción.
- Dependencia del runtime sherpa-onnx y del formato ONNX: no es portable directamente a stacks basados en PyTorch o a servidores de inferencia de LLM.
- Ausencia total de validación comunitaria en el momento de la consulta (0 descargas, 0 likes) y pipeline no declarado, lo que reduce la trazabilidad sobre el uso previsto.
- Los metadatos indican fechas de creación y actualización en octubre de 2026; conviene contrastar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adityanft/flow-asr-models-test
- Perfil de GitHub encontrado en la búsqueda (no confirmado como el autor del repositorio): https://github.com/asr-aditya
- Calendario de lanzamientos de modelos consultado en la búsqueda: https://www.scriptbyai.com/ai-model-release-calendar/
- Comparativa de modelos ASR abiertos en 2026 consultada en la búsqueda: https://www.marktechpost.com/2026/07/23/best-open-speech-recognition-asr-models-in-2026-wer-languages-latency-and-license-compared/
- Documentación de modelos de Microsoft Foundry consultada en la búsqueda: https://learn.microsoft.com/en-us/azure/foundry/concepts/foundry-models-overview
- Repositorio AI-Model-Gateway consultado en la búsqueda (no relacionado con el modelo): https://github.com/aditya8975/AI-Model-Gateway/tree/main/
- Proyecto de origen AI4Bharat IndicConformer (MIT): no se proporciona URL directa en la información disponible.
- Proyecto de origen NVIDIA FastConformer / NeMo (CC-BY-4.0): no se proporciona URL directa en la información disponible.
- Runtime sherpa-onnx (k2-fsa): no se proporciona URL directa en la información disponible.
