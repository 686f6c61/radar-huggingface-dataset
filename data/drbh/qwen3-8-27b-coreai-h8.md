# drbh/Qwen3.8-27B-CoreAI-H8

## Resumen

El repositorio `drbh/Qwen3.8-27B-CoreAI-H8` contiene un bundle precompilado de Apple Core AI para el modelo de lenguaje `Qwen/Qwen3.8-27B`, desarrollado por el autor `drbh`. Este paquete está diseñado para ejecutarse en silicio de Apple (macOS 27 y Xcode 27) a través de la librería `coreai-rs`, un servidor de inferencia que permite desplegar el modelo de forma local. El cuerpo del modelo utiliza cuantización lineal INT4 y la cabeza de salida INT8, lo que reduce el tamaño del repositorio a 17,6 GB.

La relevancia de este bundle radica en que facilita la ejecución de un modelo de 27B parámetros en hardware Apple sin necesidad de convertir los pesos manualmente, aprovechando el nuevo framework Core AI (sucesor de Core ML). Es una opción práctica para desarrolladores que quieren integrar generación de texto en aplicaciones macOS o iOS con requisitos de privacidad y baja latencia.

El modelo base, Qwen3.8-27B, pertenece a la generación Qwen3.8 y, según referencias externas, es un modelo denso con arquitectura híbrida que combina atención lineal GatedDeltaNet con atención tradicional. Sin embargo, la model card del bundle no proporciona detalles técnicos adicionales sobre el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (GatedDeltaNet + atención tradicional) según referencias del modelo base; bundle Core AI precompilado |
| Parametros totales | 27B (modelo base, no confirmado en el bundle) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 (cuerpo), INT8 (cabeza de salida) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Bundle Core AI (`.aimodel`), compatible con `coreai-rs` |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino un bundle de inferencia precompilado a partir del modelo base `Qwen/Qwen3.8-27B`. La model card indica que el cuerpo usa cuantización lineal INT4 y la cabeza de salida INT8, una estrategia común para reducir el uso de memoria manteniendo la precisión en la capa final.

Según la información disponible en repositorios similares (p. ej. `mlboydaisuke/Qwen3.8-27B-CoreAI`), el modelo base Qwen3.8-27B es un modelo denso de 27B parámetros con 64 capas y una intercalación 3:1 de mezcladores de atención lineal GatedDeltaNet (GVA 48v). Esta arquitectura híbrida busca combinar la eficiencia computacional de la atención lineal con la capacidad de modelado de la atención tradicional. No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens o el proceso de alineación (RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto: el modelo base es capaz de producir texto coherente y contextualmente relevante en múltiples dominios.
- Razonamiento y matemáticas: se espera que herede las capacidades de razonamiento del modelo Qwen3.8-27B, aunque no hay benchmarks específicos en este bundle.
- Soporte de código: los modelos de la familia Qwen suelen incluir entrenamiento en código, pero no se confirma aquí.
- Tool calling y agentes: no hay información específica sobre soporte de function calling o uso agéntico en este bundle.
- Multilingüismo: no se especifican idiomas soportados en la model card.
- Capacidades especiales: al ser un bundle de inferencia, no añade capacidades nuevas; se limita a ejecutar el modelo base con cuantización.

## Casos de uso

- Ejecución local en Mac: el bundle permite desplegar un LLM de 27B en un Mac con Apple Silicon, ideal para aplicaciones de escritorio que requieren procesamiento offline y privacidad de datos.
- Prototipado rápido: gracias a la integración con `coreai-rs`, los desarrolladores pueden levantar un servidor de inferencia con `make serve` y probar el modelo en minutos sin configurar entornos complejos.
- Asistente de escritura integrado: se puede usar como backend para herramientas de redacción, corrección o generación de contenido en apps nativas de macOS.
- Chatbot local: alojar un asistente conversacional en el dispositivo, evitando la dependencia de APIs externas y reduciendo la latencia de red.
- Investigación en eficiencia de cuantización: el bundle sirve como referencia para evaluar el impacto de INT4/INT8 en la calidad de salida frente al modelo original en FP16.
- Desarrollo de aplicaciones multiplataforma: al ser un formato Core AI, puede integrarse en proyectos que usen Swift o Objective-C, facilitando la adopción en el ecosistema Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones. Tampoco se proporcionan comparativas con otros modelos o bundles.

## Requisitos de hardware

- Apple Silicon (M1, M2, M3 o superior) con macOS 27 y Xcode 27, según la model card.
- Tamaño del repositorio: 17,6 GB, lo que da una estimación del espacio en disco necesario (los pesos cuantizados INT4/INT8 ocupan aproximadamente ese tamaño).
- Memoria RAM: no se especifica, pero un modelo de 27B cuantizado a INT4 requiere típicamente entre 8 y 12 GB de memoria unificada en Apple Silicon, dependiendo de la longitud de contexto y el batch.
- GPU: no aplica GPU discreta; se usa la GPU integrada del chip Apple.
- Opciones de despliegue: servidor `coreai-rs` (repositorio `drbh/coreai-rs`), con comandos `make model` y `make serve`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este bundle con alternativas. El modelo base Qwen3.8-27B podría compararse con otros modelos de 27B como Llama 3.1 27B o Mistral Large, pero no hay datos de rendimiento en este contexto. Se recomienda consultar la página del modelo base en Hugging Face para benchmarks oficiales.

## Limitaciones y advertencias

- Cuantización INT4/INT8: la cuantización puede degradar la calidad de generación en tareas complejas (razonamiento matemático, código) frente al modelo en precisión completa.
- Compatibilidad restringida: solo funciona en Apple Silicon con macOS 27 y Xcode 27; no es portable a otras plataformas.
- Sin información sobre sesgos o alucinaciones: al no haber evaluaciones publicadas, se desconoce el comportamiento en dominios sensibles.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base Qwen3.8-27B puede tener términos adicionales (consultar la licencia del modelo original).
- Dependencia de `coreai-rs`: el bundle requiere la librería y el servidor del autor, que puede no tener soporte a largo plazo.
- Sin garantía de rendimiento: al ser un paquete no oficial, puede haber diferencias de comportamiento respecto al modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/drbh/Qwen3.8-27B-CoreAI-H8
- Repositorio del servidor `coreai-rs`: https://github.com/drbh/coreai-rs
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio similar con más detalles de arquitectura: https://huggingface.co/mlboydaisuke/Qwen3.8-27B-CoreAI
