# derebellon/edeus-sona-ort

## Resumen

Sona es un modelo de reconocimiento automático del habla (ASR) especializado en dictado clínico en español, desarrollado por EDEUS / SmartEpi. Se distribuye como build de ONNX Runtime (`.ort`) para inferencia en dispositivo o en navegador, de modo que el audio del paciente no abandona las instalaciones. Forma parte de Athenea, un sistema clínico agéntico desplegado en un hospital y centro de investigación de Colombia, donde actúa como la etapa de transcripción dentro de un pipeline que va de la nota de voz al informe clínico estructurado, pasando por la desidentificación y la codificación OMOP.

El modelo parte de la arquitectura Moonshine streaming encoder–decoder (`MoonshineStreamingForConditionalGeneration`) y se ha exportado a ONNX Runtime con varios grafos separados: `encoder`, `decoder_kv`, `cross_kv`, `frontend` y `adapter`. Está afinado y validado sobre grabaciones clínicas reales del hospital, con ruido ambiental real y los micrófonos efectivamente usados en ese entorno, y reporta una tasa de error de palabra (WER) aproximada del 3,7 % sobre habla clínica en español de un conjunto reservado.

Su relevancia actual reside en dos factores: el dominio (español clínico, un nicho poco cubierto por los ASR generalistas) y el modo de despliegue (CPU o navegador mediante ONNX Runtime, sin ida y vuelta a la nube y sin coste por uso de API). El repositorio ocupa 0,5 GB y no registra descargas ni likes en el momento de la consulta. No se han publicado el número de parámetros, la longitud de contexto ni los detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Moonshine streaming encoder–decoder (`MoonshineStreamingForConditionalGeneration`), exportado a ONNX Runtime con grafos `encoder`, `decoder_kv`, `cross_kv`, `frontend` y `adapter` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (build `.ort`; no se detallan variantes de cuantización) |
| Idiomas soportados | es (español, dominio clínico/medical) |
| Licencia | `other` con nombre `edeus-smartepi-proprietary` (propietaria, © EDEUS / SmartEpi) |
| Formato de pesos | ONNX Runtime (`.ort`); tamaño del repo 0,5 GB |
| Pipeline | automatic-speech-recognition |
| Libreria | onnxruntime |
| Modalidad | audio → texto (streaming) |
| Despliegue previsto | CPU / navegador, on-device |

## Arquitectura y entrenamiento

La arquitectura es un encoder–decoder de streaming basado en Moonshine, orientado a ASR de baja latencia. La exportación a ONNX Runtime separa el modelo en cinco componentes (`frontend`, `encoder`, `decoder_kv`, `cross_kv`, `adapter`), lo que permite ejecutar la inferencia en CPU o en el navegador sin dependencia de frameworks de deep learning completos. El uso de cachés KV (`decoder_kv`, `cross_kv`) es coherente con un diseño de decodificación incremental propio de un modelo de streaming.

El modelo se ha afinado y validado sobre grabaciones clínicas reales del hospital, capturadas con el ruido ambiental y los micrófonos del entorno clínico. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF/DPO (poco habituales en ASR). Tampoco detalla innovaciones adicionales como decodificación especulativa o atención lineal. El resultado reportado es un WER aproximado del 3,7 % sobre habla clínica en español de un conjunto reservado.

## Capacidades

- Reconocimiento automático del habla en español con especialización en vocabulario y contexto clínico/medical.
- Transcripción en streaming, adecuada para dictado en tiempo real.
- Inferencia on-device en CPU o en navegador mediante ONNX Runtime, sin enviar el audio a la nube.
- Integración como primera etapa de un pipeline clínico: nota de voz → informe clínico estructurado → desidentificación → codificación OMOP.
- Funcionamiento con micrófonos y ruido ambiental propios de un entorno hospitalario (condiciones de entrenamiento y validación).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio más allá del ASR ni modo de pensamiento.

## Casos de uso

- Dictado clínico en consulta: el médico dicta la nota de la visita y Sona la transcribe en streaming sobre el equipo local, evitando que la voz del paciente salga del centro y reduciendo la latencia frente a un servicio en la nube.
- Documentación hospitalaria en entorno con ruido: al estar afinado con grabaciones reales del hospital y sus micrófonos, es adecuado para salas concurridas donde un ASR genérico degrada su WER.
- Cumplimiento de privacidad y residencia de datos: al ejecutarse on-device vía ONNX Runtime, encaja en despliegues donde el audio no puede enviarse a terceros por requisitos regulatorios o contractuales.
- Generación de borradores de informes: la transcripción alimenta la etapa siguiente de Athenea para producir un informe clínico estructurado que el facultativo revisa y firma.
- Desidentificación y codificación OMOP: la salida de texto sirve de entrada al pipeline que elimina datos identificativos y asigna códigos OMOP para explotación analítica.
- Aplicación web clínica sin backend de inferencia: al poder ejecutarse en el navegador, permite integrar el dictado en una interfaz web sin coste por uso de API ni infraestructura GPU dedicada.
- Evaluación y demostración: el Space interactivo permite probar la transcripción clínica en español antes de integrarla en un sistema propio.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| Word error rate (WER) | ≈ 3,7 % | Habla clínica en español, conjunto reservado (held-out) |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con modelos alternativos. La metodología completa de evaluación, con métricas, rúbricas, conjuntos de test y jueces, se documenta en el dataset `derebellon/athenea-eval` (sección §4.1 para este modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está pensado para CPU y navegador, no para GPU.
- GPU recomendadas: no aplica según la model card; el despliegue previsto es CPU / on-device.
- Cabe en hardware de consumo: sí, por diseño (inferencia en CPU o en el navegador vía ONNX Runtime); no se especifican requisitos mínimos de CPU, RAM ni tamaño de los grafos individuales.
- Opciones de despliegue: ONNX Runtime (formato `.ort` nativo); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a un modelo ASR.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de parámetros, contexto ni benchmarks de modelos comparables, por lo que no es posible establecer una comparativa numérica fiable. Como referencia cualitativa de categoría, Sona se posiciona frente a:

| Criterio | Sona (EDEUS / SmartEpi) | ASR genéricos multilingües | ASR específicos de dominio clínico |
|---|---|---|---|
| Idioma | Español clínico | Multilingüe | Variable |
| Despliegue | On-device (ONNX Runtime, CPU/navegador) | Habitualmente nube o GPU | Variable |
| Licencia | Propietaria (`edeus-smartepi-proprietary`) | Variable (a menudo abierta) | Habitualmente propietaria |
| WER reportado | ≈ 3,7 % en habla clínica española | No disponible en esta ficha | No disponible en esta ficha |

## Limitaciones y advertencias

- El modelo no es un dispositivo médico; todas las salidas deben ser revisadas y firmadas por un clínico. No debe usarse como única fuente de documentación clínica.
- Licencia propietaria (`edeus-smartepi-proprietary`, © EDEUS / SmartEpi): se comparte para evaluación e ilustración, por lo que el uso comercial requiere autorización expresa del titular.
- Dominio y idioma restringidos: español clínico; no se documenta soporte para otros idiomas ni para dominios generales.
- Riesgo de errores de transcripción en nombres propios, fármacos, dosis y terminología específica; el WER del 3,7 % implica que una fracción de las palabras se transcribe incorrectamente y requiere revisión.
- No se especifican sesgos conocidos, comportamiento ante acentos distintos de los del conjunto de validación ni robustez fuera del entorno hospitalario de origen.
- No se documentan requisitos mínimos de hardware ni límites de longitud de audio o de contexto, lo que dificulta planificar el despliegue en producción.
- Al ser un build ONNX Runtime, la integración depende de ese runtime; no se ofrecen pesos en otros formatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/derebellon/edeus-sona-ort
- Demo interactiva: https://huggingface.co/spaces/derebellon/athenea-demo
- Registro de evaluación y metodología: https://huggingface.co/datasets/derebellon/athenea-eval
- Metodología de evaluación, métricas y rúbricas: https://huggingface.co/datasets/derebellon/athenea-eval/blob/main/METHODOLOGY.md
