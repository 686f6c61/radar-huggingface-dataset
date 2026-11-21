# imkashef811/banking-pii-redaction-qwen0.5b-lora

## Resumen

El modelo `banking-pii-redaction-qwen0.5b-lora` es un adaptador LoRA publicado por el usuario imkashef811 sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Su proposito es detectar y permitir el enmascarado de informacion personal identificable (PII) en textos bancarios, con especial atencion a formatos de Emiratos Arabes Unidos (Emirates ID, IBAN con prefijo AE, telefonos locales, tarjetas y nombres en arabe y en ingles). El modelo emite una linea `LABEL: value` por cada elemento sensible detectado, o `NONE` si no hay ninguno, y una funcion auxiliar se encarga de sustituir esos valores por etiquetas enmascaradas.

El interes del adaptador radica en su enfoque de ejecucion local y offline: al apoyarse en un modelo base de 0,5 mil millones de parametros, esta pensado para despliegues en el dispositivo o en entornos con recursos limitados, sin enviar datos sensibles a servicios externos. El autor reporta una comparacion con Microsoft Presidio sobre un conjunto ciego de 500 mensajes sinteticos, con una tasa de fuga de PII del 0,6% frente al 22,9% de Presidio, y una tasa de falsos positivos del 0% frente al 26,8%.

Se trata de un adaptador pequeno (tamano del repositorio de 0,0 GB segun Hugging Face), con licencia Apache 2.0 y soporte declarado para ingles y arabe. La informacion publica disponible es limitada: no se han publicado resultados de benchmarks estandar ni detalles exhaustivos sobre la composicion del dataset de entrenamiento mas alla de que es sintetico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen2.5-0.5B-Instruct) |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen2.5-0.5B-Instruct tiene 0,5 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; cuantizaciones del modelo base no especificadas) |
| Idiomas soportados | Ingles (en) y arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA con rango r=16 y alpha=32, aplicado sobre todas las capas lineales del modelo base Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parametros. El entrenamiento se realizo durante 2 epocas con una tasa de aprendizaje de 2e-4 y un tiempo aproximado de 11 minutos sobre una unica GPU RTX 5070 Ti. El conjunto de entrenamiento consta de 8.000 filas sinteticas, sin datos reales, disenadas para cubrir formatos de PII propios del contexto bancario de Emiratos Arabes Unidos.

La innovacion principal no reside en la arquitectura, sino en el formato de salida y el pipeline de enmascarado: el modelo genera una linea `LABEL: value` por cada elemento detectado, y una funcion auxiliar del repositorio sustituye esos valores por etiquetas, ignorando cualquier valor que no aparezca literalmente en la entrada. Las etiquetas soportadas son NAME, EMIRATES_ID, IBAN, CARD, PHONE y EMAIL. Por diseno, se conservan sin enmascarar las tarjetas ya enmascaradas, los ultimos cuatro digitos, los identificadores de transaccion, los importes y las fechas. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales.

## Capacidades

- Deteccion y enmascarado de PII en texto bancario: nombres, Emirates ID, IBAN con prefijo AE, tarjetas, telefonos y correos electronicos.
- Generacion de salida estructurada en formato `LABEL: value`, una linea por elemento, o `NONE`.
- Soporte bilingue para ingles y arabe, incluyendo nombres en escritura arabe.
- Reconocimiento de formatos especificos de Emiratos Arabes Unidos que las herramientas genericas suelen pasar por alto.
- Ejecucion local y offline, sin dependencia de servicios externos.
- Integracion mediante una clase `Redactor` que descarga el modelo base y el adaptador y aplica el enmascarado.
- Conservacion intencionada de datos no sensibles (importes, fechas, ultimos cuatro digitos, identificadores de transaccion).
- Capacidad de generacion de texto conversacional heredada del modelo base Qwen2.5-0.5B-Instruct, aunque no es el objetivo principal del adaptador.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Enmascarado de PII en logs de aplicaciones bancarias: el adaptador puede procesar lineas de log y trazas de pila para sustituir nombres, identificadores y numeros de cuenta antes de que los logs se almacenen o se envien a sistemas de observabilidad, lo que reduce la exposicion en entornos regulados.
- Redaccion de transcripciones de chats y notas de llamadas: en centros de atencion al cliente, el modelo permite anonimizar conversaciones multi-turno con nombres en arabe e ingles antes de su analisis posterior o archivo.
- Cumplimiento normativo en el dispositivo: al ejecutarse offline sobre un modelo de 0,5 mil millones de parametros, encaja en escenarios donde los datos no pueden salir del perimetro del banco, como sucursales o dispositivos de empleados.
- Preprocesamiento para pipelines de analitica: el enmascarado previo permite compartir conjuntos de datos de conversaciones con equipos de analitica o ciencia de datos sin exponer informacion personal.
- Filtrado de datos antes de enviarlos a modelos de mayor tamano: el adaptador puede actuar como primera capa de saneamiento en un pipeline que despues utilice un LLM mas grande para tareas de resumen o clasificacion.
- Deteccion de formatos locales en herramientas genericas: como complemento a soluciones como Presidio, el adaptador cubre Emirates ID, IBAN AE y telefonos de Emiratos que las reglas genericas no reconocen.
- Prototipado y evaluacion de politicas de privacidad: permite experimentar con umbrales de enmascarado y validar el comportamiento sobre datos sinteticos antes de desplegar en produccion.

## Benchmarks y rendimiento

El autor publica una comparacion sobre un conjunto ciego de 500 mensajes sinteticos con 10 disposiciones no vistas durante el entrenamiento, frente a Microsoft Presidio:

| Metrica | Microsoft Presidio | Adaptador |
|---|---|---|
| PII filtrada | 22,9% | 0,6% |
| Mensajes sin PII enmascarados erroneamente | 26,8% | 0% |
| Coincidencia exacta | 54,0% | 98,8% |
| Tiempo de CPU por mensaje (sin GPU) | 6 ms | ~1,9 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base de 0,5 mil millones de parametros en precision de 16 bits ocupa aproximadamente 1 GB, y el adaptador LoRA anade una cantidad marginal.
- GPU recomendadas: el entrenamiento se realizo en una RTX 5070 Ti; para inferencia es suficiente una GPU consumer moderna, aunque la informacion no especifica modelos concretos.
- Cabe en GPU consumer: si, dado el tamano reducido del modelo base.
- Opciones de despliegue: la libreria declarada es PEFT; la integracion de referencia es la clase `Redactor` del repositorio de GitHub. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: aproximadamente 1,9 segundos por mensaje en CPU con PyTorch estandar, segun el autor. El propio autor advierte que es lento en CPU para flujos de logs de alto volumen y que resulta adecuado para chats y notas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| banking-pii-redaction-qwen0.5b-lora | Adaptador sobre 0,5B | No disponible | Deteccion de PII bancaria UAE, en/ar | Apache 2.0 | Hugging Face |
| Microsoft Presidio | Basado en reglas y NER | No aplica | Deteccion de PII generica | MIT (herramienta) | Open source |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | No disponible | Generacion de texto general | Apache 2.0 | Hugging Face |

No se dispone de informacion sobre otros adaptadores especializados en PII bancaria para Emiratos Arabes Unidos que permitan una comparacion directa.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente con datos sinteticos: el propio autor advierte que el texto real (erratas, numeros parciales, apodos) producira mas fugas de PII.
- Si el modelo copia un valor con una diferencia minima (por ejemplo, sin una marca diacritica arabe), ese valor no se enmascara.
- Rendimiento lento en CPU con PyTorch estandar (~1,9 s por mensaje): no apto para flujos de logs de alto volumen.
- No debe utilizarse como unico control sobre datos regulados; se recomienda validar sobre una muestra real etiquetada antes de su uso en produccion.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no evaluado de forma especifica; el diseno del pipeline de enmascarado ignora valores que no aparecen literalmente en la entrada, lo que mitiga parcialmente este riesgo.
- Cobertura limitada a seis etiquetas (NAME, EMIRATES_ID, IBAN, CARD, PHONE, EMAIL) y a los idiomas ingles y arabe.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el cumplimiento normativo en entornos regulados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/imkashef811/banking-pii-redaction-qwen0.5b-lora
- Repositorio de codigo, generador de datos y resultados: https://github.com/imkashif/banking-pii-redaction-slm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
