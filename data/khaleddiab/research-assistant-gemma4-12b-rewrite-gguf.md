# khaleddiab/research-assistant-gemma4-12b-rewrite-GGUF

## Resumen

research-assistant-gemma4-12b-rewrite-GGUF es un ajuste fino (fine-tuning) del modelo Gemma 4 de 12B de parámetros, publicado por el usuario khaleddiab en Hugging Face y orientado a tareas de asistencia a la investigación. El modelo parte de una base Gemma 4 instruction-tuned de aproximadamente 11.900 millones de parámetros y se ha especializado, según el nombre del repositorio, en tareas de reescritura ("rewrite") dentro de flujos de trabajo de investigación.

El autor ha distribuido únicamente la versión cuantizada en formato GGUF, generada con la herramienta Unsloth, lo que facilita su ejecución en llama.cpp y en entornos de consumo. El repositorio incluye una cuantización Q4_K_M para el modelo de lenguaje y un proyector multimodal en F16 (`F16-mmproj.gguf`), lo que indica que conserva capacidades de visión heredadas del modelo base Gemma 4.

La relevancia del modelo radica en su formato de despliegue ligero y su orientación a tareas concretas de reescritura y asistencia investigadora, aunque la información pública disponible es muy limitada: no se detallan datos de entrenamiento, licencia explícita ni idiomas soportados, por lo que su adopción en producción requiere validación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4, vision-language model); detalles no disponibles |
| Parametros totales | 11.907.350.576 (aprox. 11,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje), F16 (proyector multimodal mmproj) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors solo como referencia de parametros) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Gemma 4 de 12B, una familia de modelos transformer de Google. La presencia de un fichero `mmproj` en F16 confirma que se trata de un modelo vision-language (VLM), capaz de procesar imágenes además de texto. El ajuste fino se realizó y convirtió a GGUF con Unsloth, según indica el autor, lo que sugiere el uso de técnicas de entrenamiento eficiente en memoria (LoRA/QLoRA u optimizaciones equivalentes de Unsloth), aunque no se especifican hiperparámetros, número de tokens de entrenamiento ni composición del dataset.

No se dispone de información sobre si el ajuste incluyó RLHF, DPO u otras etapas de alineación posteriores, ni sobre innovaciones técnicas específicas del fine-tuning (por ejemplo, decodificación especulativa o atención lineal). El nombre "rewrite" sugiere un entrenamiento orientado a tareas de reescritura de texto, probablemente en el contexto de asistencia a la investigación, pero no hay documentación que lo confirme.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Gemma 4 instruction-tuned.
- Capacidades de visión: el repositorio incluye proyector multimodal (`F16-mmproj.gguf`), lo que permite procesar imágenes con `llama-mtmd-cli`.
- Reescritura de texto: el nombre del modelo indica especialización en tareas de reescritura, presumiblemente en contextos de investigación.
- Conversación multi-turno: la etiqueta `conversational` y el uso de `--jinja` en llama.cpp sugieren soporte de plantillas de chat.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (no se especifican idiomas).

## Casos de uso

- Reescritura de textos académicos: el modelo puede reformular párrafos, resúmenes o abstracts manteniendo el significado, aprovechando su especialización declarada en tareas de "rewrite".
- Asistencia a la investigación documental: puede ayudar a sintetizar y reformular notas o borradores de artículos, aunque requiere validación humana por la falta de benchmarks publicados.
- Procesamiento de documentos con imágenes: gracias al proyector multimodal, puede extraer y reescribir información de figuras, tablas escaneadas o capturas, integrándose en pipelines de investigación.
- Despliegue local en estaciones de trabajo: al estar en GGUF Q4_K_M, puede ejecutarse en llama.cpp sobre hardware de consumo, útil para prototipos y pruebas offline.
- Generación de borradores en entornos con requisitos de privacidad: al ejecutarse localmente, permite procesar textos sensibles sin enviarlos a servicios en la nube.
- Integración en herramientas CLI: mediante `llama-cli` o `llama-mtmd-cli` con `--jinja`, se puede incorporar en scripts de automatización de reescritura por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M de un modelo de ~11,9B ocupa aproximadamente 7-8 GB; el proyector mmproj en F16 añade un tamaño adicional (no especificado). El repositorio completo pesa 15,0 GB, aunque no todo es necesario para inferencia.
- GPU recomendadas: no disponibles de forma específica; por tamaño, una GPU con 12-16 GB de VRAM debería ser suficiente para Q4_K_M.
- GPU de consumo: probablemente cabe en RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070/4080 y superiores, aunque no hay datos oficiales de rendimiento.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), y por extensión cualquier frontend compatible con GGUF (Ollama, LM Studio, etc.), aunque no se documenta soporte explícito.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| research-assistant-gemma4-12b-rewrite-GGUF | ~11,9B | no disponible | no disponible | GGUF | Fine-tuning especializado en reescritura |
| Gemma 4 12B (base) | ~12B | no disponible | no disponible | safetensors/GGUF | Modelo original de Google; referencia directa |
| Alternativas de 12B (p. ej. Mistral/Llama de tamaño similar) | ~7-13B | variable | variable | variable | No se dispone de comparación de rendimiento |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del modelo, lo que impide confirmar si se permite uso comercial; debe consultarse al autor o al modelo base Gemma 4.
- Idiomas no documentados: no se confirma el soporte multilingüe ni la calidad en castellano.
- Riesgo de alucinación: al ser un fine-tuning sin benchmarks publicados, no hay garantías de fiabilidad en tareas de investigación.
- Contexto desconocido: se desconoce la longitud máxima de contexto, lo que limita la planificación de casos de uso con documentos largos.
- Datos de entrenamiento no documentados: no se puede evaluar sesgos ni composición del dataset.
- Solo distribución GGUF: no se ofrecen pesos en safetensors para reentrenamiento o inspección.
- Uso en producción: requiere validación empírica previa, dado que no hay métricas ni evaluación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/khaleddiab/research-assistant-gemma4-12b-rewrite-GGUF
- Unsloth (herramienta de entrenamiento y conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
