# richardr1126/Supertonic-3-CoreAI

## Resumen

Supertonic-3-CoreAI es una exportación del modelo de síntesis de voz (TTS) Supertonic 3 de Supertone, convertida por el usuario richardr1126 a cuatro etapas de inferencia Core AI para ejecutarse en iPhone y iPad dentro de la aplicación OpenReader. No es un reentrenamiento ni un ajuste fino: replica el modelo base (revisión `724fb5abbf5502583fb520898d45929e62f02c0b`) e incluye su tokenizer, su configuración y diez estilos de voz sin modificar, además de los ficheros `PROVENANCE.md`, `SHA256SUMS` y `LICENSE.txt`.

El modelo subyacente es un TTS de 99 millones de parámetros, no autorregresivo y basado en flow matching, que produce audio a 44,1 kHz en 31 idiomas sin necesidad de GPU (la versión original se ejecuta en CPU mediante ONNX Runtime). Esta exportación concreta fija la entrada en 256 tokens de texto y 256 tramas latentes, lo que acota tanto la longitud del texto por petición como la duración del audio generado en cada pasada.

Su interés práctico está en el despliegue: permite síntesis de voz multilingüe totalmente local en dispositivos Apple, sin nube, sin API y sin acelerador dedicado, bajo licencia Open RAIL-M heredada del modelo original. El repositorio ocupa 0,4 GB y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS no autorregresivo con flow matching (modelo base); exportado a cuatro etapas de inferencia Core AI |
| Parametros totales | 99 M (modelo base Supertone/supertonic-3) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens de texto y 256 tramas latentes, valores fijos impuestos por la exportacion |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingue; 31 idiomas en el modelo base |
| Licencia | bigscience-openrail-m (BigScience Open RAIL-M) |
| Formato de pesos | Core AI (cuatro etapas de inferencia); el modelo base se distribuye en ONNX y existen exportaciones CoreML y LiteRT de terceros |

## Arquitectura y entrenamiento

El modelo base Supertonic 3 es un sistema de texto a voz no autorregresivo de 99 millones de parámetros basado en flow matching, que genera audio de forma paralela en lugar de token a token. Según la documentación pública del proyecto, produce salida a 44,1 kHz, soporta 31 idiomas y 10 estilos de voz, y está pensado para ejecutarse en CPU mediante ONNX Runtime, sin GPU ni servicios en la nube. La revisión 3 amplía el soporte de idiomas respecto a la versión anterior (de 5 a 31), mejora la estabilidad de lectura y reduce los fallos de repetición y omisión de texto.

Esta ficha corresponde a una conversión, no a un entrenamiento nuevo. El autor ha troceado el modelo original en cuatro etapas de inferencia Core AI y ha fijado las formas de entrada y salida en 256 tokens de texto y 256 tramas latentes, lo que simplifica el grafo para su ejecución en el dispositivo pero elimina la flexibilidad dinámica de longitudes. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni sobre posibles innovaciones adicionales (decodificación especulativa, atención lineal u otras) en la información proporcionada.

## Capacidades

- Síntesis de voz multilingüe: convierte texto en audio en 31 idiomas según el modelo base.
- Diez estilos de voz fijos, incluidos en el repositorio sin modificaciones respecto al modelo original.
- Salida de audio a 44,1 kHz.
- Inferencia local en dispositivo Apple: el objetivo declarado es ejecutarse en iPhone y iPad a través de Core AI, sin llamadas a servicios externos.
- Integración con OpenReader: la aplicación descarga y verifica cada fichero (hashes SHA256) antes de instalar el modelo completo.
- No soporta tool calling ni function calling: no es un modelo de lenguaje y no expone interfaz de herramientas.
- No soporta agentes, razonamiento multi-paso ni planificación.
- No genera texto, código, matemáticas ni procesa imágenes o audio de entrada; su única modalidad es texto a voz.
- El control expresivo se limita a la selección entre los diez estilos disponibles; no hay indicaciones de estilo en lenguaje natural.

## Casos de uso

- Lectura por voz dentro de OpenReader en iPhone y iPad: el modelo se instala en el dispositivo y convierte el texto seleccionado en audio sin enviar contenido a la nube, lo que encaja con el objetivo de privacidad de la aplicación.
- Accesibilidad para personas con dislexia, baja visión o dificultades de lectura: la síntesis local permite leer documentos y artículos en el propio dispositivo, incluso sin conexión de red.
- Audiolibros y artículos largos: dado el límite fijo de 256 tokens de texto por pasada, el uso realista requiere trocear el documento en fragmentos, sintetizar cada uno y concatenar el audio resultante.
- Aprendizaje de idiomas: al cubrir 31 idiomas, permite escuchar pronunciación de textos en la lengua de estudio, siempre que se disponga de un estilo de voz adecuado.
- Asistentes de voz y avisos en aplicaciones iOS: se puede integrar en flujos donde la latencia de una llamada de red sea inaceptable o donde el audio no deba salir del dispositivo.
- Generación de voz para contenido grabado (pódcast, vídeo divulgativo, material educativo): útil para producir narraciones sin coste de API, asumiendo la limitación de duración por fragmento y la ausencia de control expresivo por prompt.
- Pruebas de concepto de TTS en el edge: sirve como banco de pruebas para medir consumo, latencia y calidad de un modelo de 99 M en hardware Apple antes de decidir un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas objetivas (MOS, WER, RTF ni comparaciones numéricas) y las fuentes web consultadas se limitan a describir el modelo base (99 M de parámetros, 31 idiomas, 10 voces, 44,1 kHz) sin cifras de evaluación reproducibles.

## Requisitos de hardware

- El repositorio ocupa 0,4 GB, coherente con un modelo de 99 M de parámetros en precisión completa; el conjunto cabe holgadamente en el almacenamiento de un iPhone o iPad actual.
- VRAM estimada para inferencia: no aplica en su destino previsto, ya que el modelo base está diseñado para ejecutarse en CPU mediante ONNX Runtime y esta exportación apunta al hardware de Apple (CPU/ANE).
- GPU recomendadas: ninguna. No requiere A100, H100 ni RTX 4090; el proyecto base declara explícitamente que no necesita GPU.
- Cabe en hardware de consumo: sí, en iPhone y iPad, que es el objetivo de esta conversión. No hay datos publicados sobre su comportamiento en GPU de escritorio.
- Opciones de despliegue: Core AI (esta exportación), Core ML (existe una conversión de terceros), ONNX Runtime (modelo original) y LiteRT a través de Speech Core.
- Latencia y throughput estimados: no disponibles. El proyecto base se presenta como de inferencia muy rápida, pero no se aportan números de tiempo real (RTF) ni de audio generado por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| Supertonic-3-CoreAI (esta ficha) | 99 M | 31 (heredados del base) | Core AI, iOS | BigScience Open RAIL-M | Exportacion de cuatro etapas con formas fijas de 256 tokens y 256 tramas |
| Supertone/supertonic-3 | 99 M | 31 | ONNX, CPU | BigScience Open RAIL-M | Modelo base oficial; 10 estilos de voz, 44,1 kHz |
| FluidInference/supertonic-3-coreml | 99 M (mismo base) | 31 | Core ML, Apple | No disponible | Conversion de terceros del mismo modelo base |
| Kokoro-82M | 82 M | No disponible en detalle | PyTorch / ONNX y derivados | Apache-2.0 | Alternativa de tamano similar y licencia mas permisiva; cobertura de idiomas y calidad no comparadas en la informacion disponible |

No se dispone de comparaciones de rendimiento (MOS, WER, RTF) entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Longitud de texto fija: la exportación impone 256 tokens de texto por pasada, por lo que cualquier texto más largo debe trocearse y concatenarse, con riesgo de cortes en la prosodia.
- Duración de audio acotada: las 256 tramas latentes fijan un máximo de audio por inferencia; no se especifica en la información disponible a cuántos segundos equivale.
- Ausencia de cuantizaciones publicadas: no se documentan variantes en int8, int4 u otras, lo que limita el ajuste fino entre tamaño y calidad.
- Sesgos: no hay información sobre los datos de entrenamiento del modelo base, por lo que no pueden evaluarse sesgos de acento, género o variedad dialectal. Los diez estilos de voz son fijos.
- Riesgo de errores de síntesis: en TTS los fallos típicos son repeticiones, omisiones de texto, mala pronunciación de nombres propios y números, y prosodia incorrecta. El modelo base afirma haber reducido los fallos de repetición y omisión en su versión 3, pero no se aportan métricas.
- Licencia Open RAIL-M: permite uso comercial, pero incluye restricciones de uso basadas en el comportamiento (prohibición de aplicaciones dañinas, suplantación o desinformación). Es imprescindible revisar `LICENSE.txt` antes de un despliegue en producción.
- Conversión no oficial: el repositorio lo mantiene un tercero, no Supertone; la integridad depende de los hashes `SHA256SUMS` publicados.
- Sin validación de la comunidad: cero descargas y cero likes en el momento de la consulta; no hay informes independientes de calidad ni de estabilidad en dispositivo.
- Dependencia de plataforma: está pensado para Core AI en iOS/iPadOS. No es directamente desplegable en servidores Linux o Windows sin recurrir al modelo base en ONNX u otra conversión.
- No es un modelo de lenguaje: no puede usarse para generación de texto, razonamiento, código ni tool calling.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/richardr1126/Supertonic-3-CoreAI
- Modelo base: https://huggingface.co/Supertone/supertonic-3
- Sitio oficial del proyecto Supertonic 3: https://supertonic3.github.io/
- Conversión Core ML de terceros: https://huggingface.co/FluidInference/supertonic-3-coreml
- Documentación de Supertonic 3 (CoreML y LiteRT): https://soniqo.audio/guides/supertonic
- Ficha del modelo en The AI Bench: https://theaibench.ai/models/supertonic-3/
