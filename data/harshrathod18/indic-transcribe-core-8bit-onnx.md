# harshrathod18/indic-transcribe-core-8bit-onnx

## Resumen

Indic-Transcribe-Core 8-bit ONNX es una conversión cuantizada a 8 bits del modelo de reconocimiento automático de voz `bodhan-ai/indic-transcribe-core`, desarrollado originalmente por Bodhan AI en colaboración con AI4Bharat. El port ha sido realizado por el usuario harshrathod18 y empaqueta el modelo en formato ONNX para su ejecución en CPU mediante ONNX Runtime 1.24 o superior, sin necesidad de GPU. El objetivo es facilitar el despliegue de transcripción de lenguas índicas en entornos con recursos limitados.

La innovación principal de esta variante es que, además de cuantizar el decodificador, se han convertido a 8 bits las convoluciones pointwise del codificador, lo que reduce el peso del repositorio de 1,71 GB a 1,42 GB. Las entradas, salidas y el tokenizador son idénticos a los del port original, y los cambios concretos respecto a este se documentan en el archivo NOTICE.md del repositorio.

Se trata de un artefacto de inferencia, no de un modelo entrenado desde cero: hereda las capacidades y limitaciones del modelo base de Bodhan AI. Su relevancia radica en que permite ejecutar ASR multilingüe de lenguas índicas en servidores sin GPU, portátiles o dispositivos de borde, manteniendo una huella de memoria reducida. La licencia aplicada es la Indic Open Model License, sin modificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de reconocimiento de voz; el port es ONNX con codificador y decodificador cuantizados a 8 bits) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (INT8) en decodificador y en convoluciones pointwise del codificador |
| Idiomas soportados | no disponibles (el modelo base está orientado a lenguas índicas) |
| Licencia | Indic Open Model License (license: other) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `bodhan-ai/indic-transcribe-core` en la información proporcionada. El artefacto aquí descrito es una conversión de formato y precisión: toma los pesos del modelo base y los exporta a ONNX con cuantización de 8 bits, aplicada tanto al decodificador como a las convoluciones pointwise del codificador. No se ha realizado entrenamiento adicional ni ajuste fino; se trata exclusivamente de una transformación de despliegue.

El resultado es un grafo ONNX de 1,42 GB que se ejecuta con ONNX Runtime 1.24 o superior sobre CPU. No se documentan en la información disponible detalles sobre el dataset de entrenamiento original, el número de tokens, el uso de RLHF o DPO, ni innovaciones técnicas del modelo base más allá de la propia cuantización del port.

## Capacidades

- Reconocimiento automático de voz (ASR): transcripción de audio a texto, heredada del modelo base.
- Soporte de lenguas índicas: el modelo base está orientado a este conjunto de idiomas, aunque la lista exacta no está disponible.
- Ejecución en CPU: el formato ONNX con cuantización INT8 permite inferencia sin GPU mediante ONNX Runtime 1.24+.
- Compatibilidad de interfaz: entradas, salidas y tokenizador idénticos al port original de referencia.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento explícito.

## Casos de uso

- Transcripción de reuniones y notas de voz en lenguas índicas: el modelo puede procesar audio y devolver texto en un servidor sin GPU, lo que abarata el despliegue en pymes y equipos distribuidos.
- Subtitulado automático de contenido audiovisual: al ejecutarse en CPU con ONNX Runtime, se puede integrar en pipelines de procesamiento por lotes que generen subtítulos para vídeos en idiomas índicos.
- Atención al cliente por voz: combinado con un motor de diálogo, permite transcribir consultas telefónicas en tiempo casi real en infraestructura sin acelerador hardware.
- Archivado y búsqueda de grabaciones: transcripción masiva de archivos de audio históricos para indexación y búsqueda textual, aprovechando la reducida huella de 1,42 GB.
- Aplicaciones de accesibilidad: dictado y transcripción en vivo en dispositivos de gama baja o portátiles, donde no hay GPU disponible.
- Investigación lingüística: generación de corpus transcritos de lenguas índicas para estudios fonéticos y de procesamiento del lenguaje, con un coste de infraestructura mínimo.
- Despliegue en el borde: integración en dispositivos con CPU ARM o x86 de recursos limitados, siempre que se disponga de ONNX Runtime 1.24 o superior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para ejecución en CPU.
- Memoria RAM estimada: el repositorio pesa 1,42 GB, por lo que se recomienda al menos 2-4 GB de RAM libre para cargar el grafo y los buffers de inferencia (estimación orientativa, no confirmada en la información disponible).
- GPU recomendadas: no aplica para esta variante; el modelo base podría ejecutarse en GPU, pero este port está pensado para CPU.
- ¿Cabe en GPU de consumo? No aplica; está optimizado para CPU.
- Opciones de despliegue: ONNX Runtime 1.24 o superior. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Cuantizacion | Tamano | Licencia | Ejecucion |
|---|---|---|---|---|---|
| harshrathod18/indic-transcribe-core-8bit-onnx | ONNX | INT8 (decodificador + conv pointwise del codificador) | 1,42 GB | Indic Open Model License | CPU con ONNX Runtime 1.24+ |
| bodhan-ai/indic-transcribe-core | no disponible | no disponible | no disponible | Indic Open Model License | no disponible |
| Port original de referencia (mencionado en la model card) | ONNX | 8 bits parcial (sin conv pointwise del codificador) | 1,71 GB | Indic Open Model License | CPU con ONNX Runtime |

No se dispone de información sobre otros modelos comparables de ASR para lenguas índicas en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto derivado: cualquier sesgo, error o limitación del modelo base `bodhan-ai/indic-transcribe-core` se hereda sin cambios.
- No se han publicado datos sobre sesgos conocidos, tasas de alucinación ni precisión por idioma en la información disponible.
- La lista exacta de idiomas soportados no está documentada; solo se indica que el modelo base está orientado a lenguas índicas.
- La licencia Indic Open Model License debe revisarse en el archivo LICENSE del repositorio antes de cualquier uso comercial; la model card indica "license: other" y no se detallan restricciones adicionales.
- Requiere ONNX Runtime 1.24 o superior; versiones anteriores pueden no ser compatibles con el grafo exportado.
- El rendimiento en CPU puede ser insuficiente para transcripción en tiempo real según la longitud del audio y el hardware; no se proporcionan métricas de latencia.
- Al ser un repositorio con 0 descargas y 0 likes, no hay evidencia comunitaria de validación ni reportes de errores.
- No se documentan garantías de mantenimiento ni actualizaciones por parte del autor del port.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/harshrathod18/indic-transcribe-core-8bit-onnx
- Modelo base: https://huggingface.co/bodhan-ai/indic-transcribe-core
- Licencia (archivo LICENSE en el repositorio): https://huggingface.co/harshrathod18/indic-transcribe-core-8bit-onnx/blob/main/LICENSE
- Registro de cambios (NOTICE.md en el repositorio): https://huggingface.co/harshrathod18/indic-transcribe-core-8bit-onnx/blob/main/NOTICE.md
