# nzxyin/sparc-vocos-24k

## Resumen

sparc-vocos-24k es un vocoder neuronal (sintetizador de forma de onda a partir de representaciones acústicas o articulatorias) publicado por el usuario nzxyin en Hugging Face. El modelo se distribuye en formato safetensors con pesos PyTorch, tiene 14.901.274 parámetros (aproximadamente 14,9 M) y está etiquetado para las tareas de audio, speech y vocoder dentro del ecosistema SPARC, un proyecto orientado a la síntesis de habla basada en representaciones articulatorias. El identificador "24k" sugiere una frecuencia de muestreo de salida de 24 kHz, aunque este dato no se confirma de forma explícita en la información disponible.

El modelo está entrenado sobre el dataset `parler-tts/libritts_r_filtered`, una versión filtrada de LibriTTS-R, lo que lo vincula al dominio del habla leída en inglés. Su licencia es MIT, lo que facilita la integración en proyectos comerciales, aunque el acceso al repositorio está restringido (gated) y requiere aceptar condiciones en Hugging Face. El número de descargas (2) y de likes (0) indica que se trata de un artefacto de investigación reciente, publicado en octubre de 2026 y actualizado en noviembre del mismo año, sin tracción comunitaria significativa.

Por su tamaño reducido y su naturaleza de vocoder, el modelo es relevante para pipelines de síntesis de voz que necesiten generar forma de onda a partir de features articulatorias o acústicas con un coste computacional bajo. No obstante, la ausencia de model card detallada, benchmarks publicados y documentación técnica limita seriamente su evaluación rigurosa y su uso en producción sin trabajo adicional de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como vocoder; framework PyTorch) |
| Parametros totales | 14.901.274 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Las etiquetas del repositorio lo clasifican como vocoder dentro del ecosistema SPARC, con la etiqueta adicional "articulatory", lo que apunta a un modelo diseñado para convertir representaciones articulatorias (posiblemente parámetros del tracto vocal o features derivadas) en señal de audio. El número de parámetros (14,9 M) es coherente con vocoders ligeros tipo HiFi-GAN o variantes similares, aunque no se confirma la familia arquitectónica concreta ni si emplea discriminadores adversarios, difusión o flujos normalizadores en su entrenamiento.

El dataset de entrenamiento indicado es `parler-tts/libritts_r_filtered`, una versión filtrada de LibriTTS-R, corpus de habla leída en inglés con audio de alta calidad y transcripciones alineadas. No se especifica el número de horas utilizadas, la composición exacta del filtrado ni si hubo etapas de fine-tuning, RLHF o ajuste perceptual. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos de control prosódico. Toda esta información debe considerarse no disponible.

## Capacidades

- Síntesis de forma de onda (vocoder): genera audio a partir de representaciones acústicas o articulatorias de entrada.
- Dominio del habla en inglés: entrenado sobre LibriTTS-R filtrado, orientado a habla leída.
- Integración en pipelines SPARC: etiquetado explícitamente para el ecosistema de síntesis articulatoria SPARC.
- Salida a 24 kHz (inferido del identificador "24k", no confirmado en la documentación).
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documentan modos especiales (thinking, visión, audio de entrada, etc.).

## Casos de uso

- Síntesis de voz a partir de parámetros articulatorios: el modelo puede actuar como etapa final de un pipeline SPARC que predice trayectorias articulatorias y necesita convertirlas en audio; su tamaño reducido (14,9 M de parámetros) permite inferencia en tiempo real en CPU o GPU modesta.
- Reconstrucción de voz en investigación fonética: útil para experimentos que analizan la relación entre control articulatorio y señal acústica, generando audio a partir de representaciones interpretables del tracto vocal.
- Generación de habla leída en inglés para corpus sintéticos: al estar entrenado sobre LibriTTS-R, es adecuado para producir audio de estilo lectura con fines de aumento de datos o evaluación de sistemas ASR.
- Prototipado de sistemas TTS ligeros: su licencia MIT y su bajo recuento de parámetros facilitan integrarlo en prototipos de síntesis de voz embebida o en entornos con recursos limitados.
- Evaluación comparativa de vocoders: sirve como baseline articulatorio frente a vocoders acústicos clásicos en estudios académicos, siempre que se valide su calidad perceptual de forma independiente.
- Docencia y experimentación con vocoders: el tamaño del repositorio (0,1 GB) y el formato safetensors permiten cargarlo rápidamente en cuadernos de investigación para estudiar el funcionamiento interno de un vocoder neuronal.
- Integración en pipelines de accesibilidad: para generar voz sintética en inglés en aplicaciones de lectura de texto, sujeto a validación previa de calidad e inteligibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (14,9 M de parámetros equivalen a unos 60 MB de pesos), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo, que puede ejecutarse incluso en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU moderna e incluso en placas integradas con suficiente memoria del sistema.
- Opciones de despliegue: PyTorch nativo (carga directa de safetensors); no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles; por el tamaño, se espera inferencia en tiempo real o superior en hardware moderno, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / dominio | Licencia | Disponibilidad |
|---|---|---|---|---|
| sparc-vocos-24k | 14,9 M | Audio, inglés | MIT | Gated en Hugging Face |
| HiFi-GAN (referencia) | ~13-14 M (V1) | Audio, multi-corpus | MIT | Pública |
| Parallel WaveGAN (referencia) | ~1-5 M | Audio, multi-corpus | MIT | Pública |
| Vocoder de Parler-TTS | no disponible | Audio, inglés | Apache 2.0 | Pública |

La comparación se basa en la categoría funcional (vocoder ligero) y no en resultados medidos, ya que no hay benchmarks publicados para sparc-vocos-24k. Los modelos de referencia se incluyen por su relevancia como alternativas establecidas en la literatura, no por una evaluación empírica directa.

## Limitaciones y advertencias

- Ausencia de model card detallada: no se documentan arquitectura, datos de entrenamiento exactos, métricas de calidad ni procedimiento de evaluación.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatización de descargas en CI/CD.
- Idiomas: solo inglés; no apto para síntesis multilingüe sin reentrenamiento.
- Riesgo de artefactos y alucinaciones acústicas: como todo vocoder, puede generar ruidos, discontinuidades o prosodia incorrecta, especialmente fuera de la distribución de LibriTTS-R (habla leída).
- Sesgos de dominio: entrenado sobre habla leída filtrada, por lo que puede degradarse en habla espontánea, acentos no representados o condiciones acústicas ruidosas.
- Sin benchmarks: imposible comparar su calidad objetiva (MOS, PESQ, STOI) con alternativas sin evaluación propia.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el integrador.
- Tracción comunitaria mínima (2 descargas, 0 likes): sin evidencia de uso en producción ni de mantenimiento activo.
- Frecuencia de muestreo no confirmada: el sufijo "24k" es una inferencia del identificador, no un dato documentado.

## Enlaces

- Hugging Face: https://huggingface.co/nzxyin/sparc-vocos-24k
- Dataset de entrenamiento: https://huggingface.co/datasets/parler-tts/libritts_r_filtered
- LibriTTS-R (corpus base): https://www.openslr.org/141/
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
