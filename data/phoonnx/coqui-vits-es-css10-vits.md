# Phoonnx/coqui-vits-es-css10-vits

## Resumen

`coqui-vits-es-css10-vits` es un modelo de síntesis de voz (text-to-speech) en formato ONNX, empaquetado por el usuario Phoonnx a partir del modelo original `coqui/es-css10-vits` del proyecto Coqui. Se distribuye como un artefacto aislado dentro del repositorio agregador `Phoonnx/phoonnx-coqui-vits`, pensado para ser consumido por la librería `phoonnx`, un motor de inferencia TTS ligero basado en ONNX Runtime desarrollado por TigreGotico.

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un sistema neuronal end-to-end que transforma texto en forma de onda de audio sin necesidad de un vocoder externo. Está entrenado sobre el corpus CSS10, un conjunto de datos multilingüe de audio de dominio público, en su partición en español. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja un modelo compacto orientado a despliegue en entornos con recursos limitados.

La relevancia de esta ficha es acotada: se trata de un artefacto derivado, sin métricas publicadas, sin model card propia más allá de la referencia al repositorio de origen y con cero descargas en el momento de la consulta. Resulta útil para quien necesite un checkpoint TTS en español listo para ONNX Runtime bajo licencia BSD-3-Clause, pero no constituye un modelo de frontera ni compite con los sistemas TTS neuronales actuales en calidad o expresividad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, Coqui VITS) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS, sin ventana de contexto de texto) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; el README no detalla variantes) |
| Idiomas soportados | español (código `es` según la tabla del repositorio de origen) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |
| Tamaño del repositorio | ~0,1 GB |
| Librería de inferencia | phoonnx (ONNX Runtime) |
| Pipeline | text-to-speech |
| Corpus de entrenamiento | CSS10 (partición española) |
| Voice ID | `coqui/es-css10-vits` |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz condicional de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial multiperiodo para el entrenamiento. La inferencia produce directamente la forma de onda, eliminando la necesidad de un vocoder separado. El modelo incorpora alineamiento monotónico aprendido (MAS) para obtener la duración de los fonemas sin supervisión explícita de alineamientos.

El checkpoint se entrenó sobre CSS10, un corpus de audio de dominio público compuesto por grabaciones de lectores únicos en diez idiomas, en su partición en español. El README no especifica el número de tokens, horas de audio, composición exacta del dataset, ni si se aplicaron etapas de ajuste fino adicionales. Tampoco se documenta el proceso de exportación a ONNX ni las optimizaciones aplicadas durante la conversión. No hay información disponible sobre el tamaño del modelo en parámetros ni sobre la configuración de entrenamiento.

## Capacidades

- Síntesis de voz en español a partir de texto de entrada, con salida de audio en forma de onda.
- Inferencia end-to-end sin vocoder externo, gracias a la arquitectura VITS.
- Ejecución mediante ONNX Runtime a través de la librería `phoonnx`, lo que permite despliegue en CPU y GPU sin dependencias de PyTorch.
- Integración como voice ID `coqui/es-css10-vits` dentro del ecosistema phoonnx.
- No se documentan capacidades de clonación de voz, control de estilo, emoción, prosodia explícita ni multilingüismo más allá del español.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-step (no aplica a un modelo TTS).

## Casos de uso

- Lectura de artículos y documentos: el modelo convierte texto plano en audio en español, adecuado para aplicaciones de accesibilidad y lectores de pantalla que requieran un motor TTS ligero en ONNX.
- Asistentes de voz embebidos: al ocupar ~0,1 GB y ejecutarse sobre ONNX Runtime, puede desplegarse en dispositivos con recursos limitados (Raspberry Pi, móviles, navegadores) para respuestas habladas en español.
- Generación de audiolibros de bajo coste: permite sintetizar grandes volúmenes de texto de forma batch, aunque la calidad y naturalidad dependen del corpus CSS10 de origen.
- Sistemas de anuncios y notificaciones: integración en pipelines de backend para generar mensajes de voz dinámicos en español con latencia baja.
- Prototipado de interfaces conversacionales: al ser un artefacto pequeño y con licencia permisiva, sirve para validar flujos de voz antes de migrar a modelos TTS comerciales o de mayor calidad.
- Investigación en TTS: punto de partida reproducible para experimentos de exportación ONNX, cuantización o comparación de arquitecturas VITS frente a modelos más recientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MOS (Mean Opinion Score), inteligibilidad, latencia ni comparaciones objetivas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (~0,1 GB) es plausible que el modelo quepa en menos de 1 GB de memoria, pero no se confirma en la documentación.
- GPU recomendadas: no disponible. Al ejecutarse sobre ONNX Runtime, puede usar CPU o GPU compatibles con dicho runtime.
- Compatibilidad con GPU de consumo: probable en cualquier GPU moderna con soporte ONNX Runtime, pero no documentado.
- Opciones de despliegue: librería `phoonnx` sobre ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto | Rendimiento |
|---|---|---|---|---|---|---|
| coqui-vits-es-css10-vits | VITS | Español | BSD-3-Clause | ONNX | no aplica | no disponible |
| Coqui TTS (VITS original) | VITS | Multilingüe | MPL-2.0 / varias | PyTorch | no aplica | no disponible |
| Piper (rhasspy) | VITS | Multilingüe | MIT | ONNX | no aplica | no disponible |
| Bark | Transformer autorregresivo | Multilingüe | MIT | PyTorch | no aplica | no disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparación se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Artefacto derivado: no es un modelo original, sino una reempaquetación del checkpoint `coqui/es-css10-vits` para la librería phoonnx; la responsabilidad de calidad recae en el modelo de origen.
- Sin model card propia: el README solo referencia el repositorio agregador y la licencia; no hay documentación de entrenamiento, datos ni evaluación.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por la comunidad.
- Calidad de voz limitada por el corpus CSS10 (grabaciones de un único lector, dominio de lectura), lo que puede producir una prosodia poco expresiva y limitada variabilidad.
- Riesgo de alucinación acústica: como todo modelo TTS, puede generar artefactos, pronunciaciones incorrectas o ruido ante texto fuera de distribución (siglas, números, neologismos).
- Sin soporte documentado de control de emoción, velocidad o estilo.
- Licencia BSD-3-Clause: permisiva para uso comercial, pero conviene verificar la licencia del checkpoint original de Coqui y del corpus CSS10 antes de redistribuir.
- Sin información sobre sesgos: no se documentan sesgos de género, acento o dialecto, aunque el corpus de origen puede condicionarlos.
- Fecha de creación del repositorio (2026-11-14) posterior a la consulta: posible artefacto de metadata; conviene verificar la vigencia del enlace.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/coqui-vits-es-css10-vits
- Repositorio agregador de origen: https://huggingface.co/Phoonnx/phoonnx-coqui-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Modelo Coqui de origen (referencia): `coqui/es-css10-vits` (no se proporciona URL directa en la información disponible)
- Corpus CSS10: no se proporciona enlace en la información disponible.
