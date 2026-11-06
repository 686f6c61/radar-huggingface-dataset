# Bonenk/indic-transcribe-flex-GGUF

## Resumen

Indic-transcribe-flex-GGUF es una conversión a formato GGUF del modelo de reconocimiento automático de habla (ASR) indic-transcribe-flex, desarrollado por bodhan-ai y cuantizado por el usuario Bonenk. El modelo base está diseñado para transcribir audio en más de 25 idiomas del subcontinente indio (hindi, bengalí, tamil, telugu, urdu, entre otros), además de inglés, un segmento históricamente desatendido por los grandes modelos de ASR comerciales. La versión GGUF permite ejecutarlo de forma eficiente en hardware de consumo mediante backends compatibles con este formato, como llama.cpp.

Con aproximadamente 1.230 millones de parámetros, el modelo se sitúa en la categoría de modelos ASR ligeros, comparables en tamaño a Whisper medium o modelos Canary de NVIDIA. Su relevancia actual radica en la creciente demanda de herramientas de transcripción de calidad para idiomas índicos, donde los modelos dominantes como Whisper presentan tasas de error de palabra (WER) notablemente superiores. Al distribuirse en GGUF, se reduce la barrera de entrada para despliegues locales sin depender de la pila CUDA de PyTorch.

Cabe destacar que el acceso al repositorio está restringido (gated): los usuarios deben aceptar las condiciones de la licencia indic-open-model-license-1.0 en Hugging Face antes de poder descargar los pesos. No se ha publicado información detallada sobre la arquitectura exacta del modelo base más allá de las etiquetas canary y fastconformer, que sugieren una derivación de la familia FastConformer de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiquetas sugieren base Canary/FastConformer) |
| Parametros totales | 1.229.910.528 (~1,23 B) |
| Parametros activos | no disponible (no hay evidencia de arquitectura MoE) |
| Longitud de contexto | no disponible (aplicable a duración de audio; no especificada) |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no especificadas en la ficha) |
| Idiomas soportados | 26: as, bgc, bhb, bho, bn, brx, doi, en, gu, hi, hne, kn, kok, ks, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur |
| Licencia | indic-open-model-license-1.0 (licencia "other", con condiciones; acceso gated) |
| Formato de pesos | GGUF (modelo base en safetensors, 5,4 GB de repo) |

## Arquitectura y entrenamiento

La información publicada en el repositorio no detalla la arquitectura interna del modelo. Las etiquetas canary y fastconformer indican que el modelo base, indic-transcribe-flex de bodhan-ai, probablemente deriva de la familia de modelos Canary de NVIDIA, que emplea una arquitectura encoder-decoder basada en FastConformer para el codificador y un decodificador Transformer autoregresivo. Esta arquitectura es habitual en sistemas ASR multilingües de última generación y permite tareas de transcripción con señalización de idioma y, en variantes posteriores, traducción.

No se ha publicado información sobre el número de tokens o horas de audio empleados en el entrenamiento, la composición del dataset, ni sobre fases de ajuste fino con RLHF o DPO (habitualmente no aplicables a modelos ASR puros). Tampoco constan innovaciones técnicas específicas documentadas en la ficha del repositorio. La conversión a GGUF fue realizada por Bonenk a partir de los pesos en safetensors del modelo base, sin modificar la arquitectura subyacente.

## Capacidades

- Transcripción automatica de habla (ASR) en 26 idiomas, con foco en lenguas índicas: hindi, bengalí, tamil, telugu, maratí, gujarati, kannada, malayalam, punjabi, urdu, oriya, asamés y otras lenguas menos dotadas como bhojpuri, maithili, santali o dogri.
- Soporte de inglés como idioma adicional de transcripción.
- Cobertura de variantes y dialectos: incluye códigos como bgc (haryanvi), hne (chhattisgarhi), kok (konkani), mai (maithili) y mni (manipuri), poco habituales en modelos ASR abiertos.
- Ejecución local mediante backends compatibles con GGUF (llama.cpp y derivados), sin dependencia de PyTorch ni CUDA.
- No hay evidencia de capacidades de tool calling, agentes, visión o procesamiento de audio no relacionado con ASR; es un modelo especializado en transcripción.

## Casos de uso

- Transcripcion de contenido audiovisual en idiomas indicos: subtitulado de vídeos, podcasts y emisiones en hindi, tamil o bengalí, donde Whisper suele ofrecer WER superiores; el modelo puede ejecutarse localmente sobre archivos de audio largos.
- Atencion al cliente y analisis de call centers en India: transcripción de grabaciones de llamadas en múltiples lenguas regionales para posterior análisis de sentimiento, control de calidad o cumplimiento normativo, sin enviar audio a servicios en la nube.
- Documentacion administrativa y judicial: digitalización de dictados y audiencias en lenguas como maratí, gujarati o urdu, aprovechando la cobertura de idiomas oficialmente reconocidos en India.
- Preservacion linguistica e investigacion academica: transcripción de corpus orales en lenguas de baja dotación digital (santali, bhojpuri, dogri, maithili), útil para lingüistas y proyectos de documentación de lenguas amenazadas.
- Asistentes de voz y IoT en dispositivos edge: la cuantización GGUF permite integrar transcripción de comandos de voz en hardware de consumo o SBC (Raspberry Pi, Jetson) para aplicaciones en idiomas regionales.
- Generacion de subtítulos accesibles: producción de transcripciones para accesibilidad (personas sordas o con dificultad auditiva) en medios de comunicación locales que emiten en lenguas índicas minoritarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del repositorio no incluye métricas de WER por idioma ni comparativas con Whisper, MMS o el modelo base de NVIDIA.

## Requisitos de hardware

- VRAM estimada: con ~1,23 B de parámetros, una cuantización Q8 ocupa aproximadamente 1,3 GB y una Q4 entre 0,7 y 0,8 GB; a ello hay que añadir la memoria para los espectrogramas o features de audio y el KV cache del decodificador. En la práctica, 2-4 GB de VRAM o RAM deberían ser suficientes para la mayoría de las cuantizaciones.
- GPU recomendadas: cualquier GPU moderna con 4 GB o más de VRAM (RTX 3060, RTX 4060 o superiores) si el backend usado lo aprovecha; también es viable la ejecución pura en CPU dado el tamaño reducido.
- Consumer GPUs: sí, cabe con holgura en GPUs de gama media y alta; incluso portátiles con gráficas integradas pueden ejecutar cuantizaciones agresivas en CPU.
- Opciones de despliegue: llama.cpp (backend nativo para GGUF), y derivados como Ollama o LM Studio si añaden soporte para este tipo de modelo; el modelo base en safetensors puede desplegarse con PyTorch/NeMo en su ecosistema original. No hay evidencia de soporte directo en vLLM o TGI para este GGUF.
- Latencia y throughput: no disponibles; al ser un modelo de ~1,2 B de parámetros, se espera transcripción en tiempo real o superior en CPU moderna, y significativamente más rápida en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia |
|---|---|---|---|---|
| indic-transcribe-flex-GGUF (este) | ~1,23 B | 26 (índicas + inglés) | GGUF | indic-open-model-license-1.0 (gated) |
| Whisper medium (OpenAI) | 769 M | ~99 (transcripción) | PyTorch/GGUF (comunidad) | MIT |
| Whisper large-v3 (OpenAI) | 1.550 M | ~99 | PyTorch/GGUF (comunidad) | MIT |
| AI4Bharat IndicWhisper / IndicConformer | ~1 B (según variante) | 22+ índicas | PyTorch | MIT (según repo) |

Indic-transcribe-flex se posiciona frente a Whisper medium con un tamaño similar pero un enfoque específico en lenguas índicas, donde los modelos generalistas suelen rendir peor. Frente a IndicWhisper de AI4Bharat comparte objetivo lingüístico, aunque la variante GGUF de este modelo facilita el despliegue local sin pila de Python. La licencia del modelo base es "other" y requiere revisión de términos, a diferencia de las licencias MIT de Whisper.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated; es necesario aceptar las condiciones en Hugging Face, lo que puede complicar la integración en pipelines de CI/CD automatizados (requiere token de acceso).
- Licencia "other" (indic-open-model-license-1.0): los términos exactos para uso comercial no están resumidos en la ficha; debe revisarse la licencia antes de cualquier despliegue en producción, ya que puede imponer restricciones territoriales o de uso.
- Riesgo de alucinaciones típico de decodificadores autoregresivos en ASR: repeticiones, invención de contenido en silencios o audio ruidoso, especialmente en idiomas con menos datos de entrenamiento.
- Rendimiento desigual entre idiomas: las lenguas de baja dotación (santali, manipuri, dogri) probablemente presenten WER notablemente superior al de hindi o tamil; no hay métricas publicadas para cuantificarlo.
- Sin benchmarks publicados: no es posible verificar afirmaciones de calidad antes de la evaluación propia; se recomienda validar con datos representativos del dominio de uso.
- El formato GGUF para modelos ASR tipo Canary/FastConformer depende de soporte en llama.cpp que puede ser parcial o experimental; conviene verificar la compatibilidad del backend con la versión instalada.
- El modelo no ofrece puntuación, diarización de hablantes ni alineación temporal salvo que el pipeline usado las implemente; son funciones que deben añadirse por separado.

## Enlaces

- Repositorio en Hugging Face (GGUF cuantizado): https://huggingface.co/Bonenk/indic-transcribe-flex-GGUF
- Modelo base (bodhan-ai/indic-transcribe-flex): https://huggingface.co/bodhan-ai/indic-transcribe-flex
- Paper, blog o demo oficial: no disponible
