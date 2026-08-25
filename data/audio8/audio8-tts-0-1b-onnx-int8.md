# Audio8/audio8-TTS-0.1B-ONNX-INT8

## Resumen

Audio8-TTS-0.1B es un modelo de síntesis de voz (text-to-speech) de tamaño compacto, desarrollado por Audio8-AI, que ofrece capacidades de clonación de voz zero-shot y soporte multilingüe. Esta versión concreta, `audio8-TTS-0.1B-ONNX-INT8`, es una exportación a ONNX con cuantización INT8, orientada a despliegue en CPU mediante ONNX Runtime. El modelo forma parte de la familia Audio8 TTS, que incluye también una variante de 0.6B parámetros con cuantización INT4.

La relevancia de este modelo radica en su equilibrio entre tamaño reducido (0.1B parámetros) y calidad de síntesis, lo que permite ejecutarlo en hardware modesto sin necesidad de GPU. Su licencia Apache 2.0 facilita su uso comercial y su integración en aplicaciones de producción. Aunque la documentación oficial es escasa, el repositorio de GitHub y las demos de audio confirman su funcionalidad básica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR (autoregresiva dual) con codec neuronal de audio |
| Parametros totales | 0.1B (aproximadamente 100 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no procesa texto largo como LLM) |
| Tipos de cuantizacion | INT8 (esta version), INT4 (en la variante 0.6B) |
| Idiomas soportados | Multilingue (no se especifican idiomas concretos; las demos muestran ingles y mandarin) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (safetensors no aplica; el repo contiene modelos ONNX) |

## Arquitectura y entrenamiento

La arquitectura DualAR (autoregresiva dual) es una innovacion de Audio8 que combina dos flujos autoregresivos para modelar simultaneamente la prosodia y la secuencia de tokens acusticos. El modelo utiliza un codec neuronal de audio (FP16) para convertir la senal de audio en tokens discretos, y un encoder opcional (FP16) para registrar voces de referencia en la clonacion zero-shot. El tokenizador gestiona la conversion de texto a tokens foneticos o subpalabras.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas como RLHF o DPO. La ausencia de una model card completa en HuggingFace limita el conocimiento sobre estos aspectos. El entrenamiento probablemente se realizo con datos multilingues de voz, pero no hay cifras publicas.

## Capacidades

- Sintesis de voz a partir de texto con calidad aceptable para un modelo de 0.1B.
- Clonacion de voz zero-shot: puede imitar una voz de referencia a partir de unos segundos de audio.
- Soporte multilingue, aunque los idiomas exactos no estan documentados; las demos muestran ingles y mandarin.
- Generacion de audio en formato de codec neuronal, lo que permite reconstruccion de alta fidelidad.
- Optimizacion para CPU mediante ONNX Runtime, con cuantizacion INT8 que reduce el tamano y acelera la inferencia.
- No incluye capacidades de vision, tool calling ni razonamiento, al ser un modelo exclusivamente TTS.

## Casos de uso

- Asistentes de voz en dispositivos embebidos: al ser ligero y ejecutable en CPU, puede integrarse en Raspberry Pi o dispositivos IoT para generar respuestas habladas sin depender de la nube.
- Accesibilidad para personas con discapacidad visual: conversion de texto digital a voz en aplicaciones de lectura de pantalla, con la posibilidad de usar una voz personalizada clonada.
- Doblaje automatico de contenido audiovisual: la clonacion zero-shot permite generar voces similares a actores originales en multiples idiomas, reduciendo costes de produccion.
- Sistemas de navegacion y avisos en vehiculos: sintesis de instrucciones de voz en tiempo real con bajo consumo de recursos.
- Educacion y aprendizaje de idiomas: generacion de ejemplos de pronunciacion en distintos idiomas, con voces de referencia para practicar.
- Prototipado rapido de productos de voz: los desarrolladores pueden integrar el modelo en pipelines de prueba para validar experiencias de usuario antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos comparativos de MOS (Mean Opinion Score), inteligibilidad ni latencia en fuentes oficiales. Las demos de audio en el sitio de Audio8 sugieren una calidad razonable, pero sin metricas cuantitativas no es posible evaluar objetivamente.

## Requisitos de hardware

- Inferencia en CPU: el modelo esta disenado para ONNX Runtime, por lo que no requiere GPU. Un procesador moderno de gama media (Intel Core i5 o equivalente) es suficiente.
- RAM: el tamano del repo es de 0.9 GB, pero el modelo cuantizado INT8 probablemente ocupe menos de 200 MB en memoria, dependiendo de la implementacion.
- VRAM: no aplica, al ser CPU-only.
- GPU recomendada: no necesaria; si se desea acelerar, cualquier GPU con soporte ONNX puede usarse, pero no es el objetivo.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), tambien puede convertirse a otros formatos si se dispone de las herramientas.
- Latencia: no hay datos publicos; en CPU, un modelo de 0.1B deberia generar audio en tiempo real o cerca de el, pero depende del hardware y la longitud del texto.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos TTS compactos como Piper, Coqui TTS o ESPnet. La falta de benchmarks publicos impide una comparacion cuantitativa. Se puede mencionar que la variante 0.6B de Audio8 ofrece mayor calidad a costa de mas recursos, pero no hay metricas oficiales.

## Limitaciones y advertencias

- Documentacion insuficiente: la model card en HuggingFace esta vacia, y la informacion se ha extraido de fuentes externas. Esto dificulta la evaluacion de sesgos, limitaciones de idioma y comportamiento en casos extremos.
- Riesgo de alucinacion en audio: como cualquier TTS, puede generar pronunciaciones incorrectas o artefactos en textos poco comunes o con homografos.
- Idiomas no especificados: aunque se dice multilingue, no se indica que idiomas cubre ni la calidad por idioma. El mandarin y el ingles estan demostrados, pero otros pueden tener rendimiento inferior.
- Clonacion de voz: el uso de clonacion zero-shot puede plantear problemas eticos y de consentimiento. La licencia Apache 2.0 no impide su uso, pero el responsable debe asegurarse de no violar derechos de voz.
- Tamano del contexto: al ser un TTS, no maneja contextos largos de texto; la entrada se procesa por segmentos, lo que puede afectar a la coherencia prosodica en textos extensos.
- Fecha de creacion: el modelo fue creado en agosto de 2026, lo que sugiere que es muy reciente y podria tener errores no detectados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Audio8/audio8-TTS-0.1B-ONNX-INT8
- Repositorio GitHub: https://github.com/Audio8-AI/Audio8_TTS
- Demo de audio 0.1B: https://audio8-ai.github.io/Audio8_TTS/0.1B/
- Variante 0.6B INT4 en HuggingFace: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.6B-ONNX-INT4
- Documentacion ONNX Runtime en el repositorio: https://github.com/Audio8-AI/Audio8_TTS/tree/master/onnx_runtime
