# positron-ai/google_gemma-4-12B-it-ingest-best-gptq-permuted

## Resumen

`positron-ai/google_gemma-4-12B-it-ingest-best-gptq-permuted` es una compilación cuantizada de 4 bits del modelo `google/gemma-4-12B-it`, publicada por el usuario Positron AI en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un artefacto de inferencia derivado: el autor toma los pesos originales de Google y los somete a una cuantización GPTQ con el objetivo de reducir la huella de memoria y facilitar el despliegue en GPUs de gama media. El repositorio ocupa 8,0 GB y contiene 11.959.730.224 parámetros según los metadatos de safetensors.

La relevancia de esta ficha reside en que documenta un artefacto de cuantización, no un modelo base. La model card es extremadamente escueta: no aporta métricas de calidad, no declara idiomas soportados, no especifica la longitud de contexto y remite explícitamente a la licencia original de Gemma 4. Cualquier evaluación rigurosa del comportamiento del modelo debe hacerse contra el modelo base `google/gemma-4-12B-it`, cuyos detalles técnicos no se incluyen en la información disponible.

El artefacto se publicó el 25 de agosto de 2026 y se actualizó el 18 de noviembre de 2026, con 726 descargas y ningún "like". La ficha, por tanto, describe con precisión lo que el repositorio declara y marca como "no disponible" todo aquello que el autor no ha hecho público, sin extrapolar datos del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: `google/gemma-4-12B-it`; el repositorio declara la arquitectura `gemma4_unified` en sus tags) |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 4-bit, grupo de 64, simetrica, `desc_act=true`, damp 0,05 % |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con `license_link` a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (libreria `transformers`, pipeline `text-generation`, modalidad `image-text-to-text`) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base. Los tags de Hugging Face indican `gemma4_unified` como arquitectura declarada y `image-text-to-text` como modalidad, lo que sugiere un modelo multimodal de entrada imagen-texto, pero el autor no detalla capas, atención, normalización ni estrategia de entrenamiento. Tampoco se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO o alguna fase de ajuste por preferencias. Todo ello corresponde al modelo original de Google, cuya documentación no forma parte de la información proporcionada.

La innovación técnica documentada es exclusivamente la cuantización. El proceso se ejecutó con GPTQModel 7.1.0 sobre transformers 5.11.0, torch 2.9.1 y CUDA 12.8. Se aplicó GPTQ de 4 bits con tamaño de grupo 64, cuantización simétrica y `desc_act=true` (ordenación de activaciones descendente), con un porcentaje de damp del 0,05 %. La calibración utilizó 128 muestras de un conjunto mixto de dominios con longitud de secuencia 4096. Solo se cuantizaron los pesos: las activaciones permanecen sin cuantizar. El autor no publica la precisión de origen ni el runtime o hardware objetivo.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado `text-generation` y la etiqueta `conversational`.
- Procesamiento de entrada imagen-texto, según la modalidad `image-text-to-text` declarada en los tags.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara idiomas.
- Modo "thinking", audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue en GPUs de consumo con memoria limitada: al ser una compilación GPTQ de 4 bits con un repositorio de 8,0 GB, permite cargar el modelo en tarjetas con 12-16 GB de VRAM que no admitirían los pesos en precisión completa, siempre que se valide la calidad frente al original.
- Servicio de chat multimodal en prototipos: la modalidad `image-text-to-text` y la etiqueta `conversational` permiten construir asistentes que reciben imágenes y texto, útil para demos internas y pruebas de concepto antes de migrar a producción.
- Evaluación comparativa de cuantizaciones: sirve como artefacto de referencia para medir la degradación de GPTQ 4-bit con grupo 64 y `desc_act` frente a otros formatos (GGUF, AWQ) del mismo modelo base.
- Integración en pipelines de `transformers`: al declarar `library_name: transformers` y pesos en safetensors, se puede cargar con `AutoModelForCausalLM` y `AutoTokenizer` en scripts existentes sin cambios de formato.
- Endpoints gestionados de Hugging Face: la etiqueta `endpoints_compatible` permite desplegarlo como endpoint inferencia gestionado, útil para equipos que no quieren administrar infraestructura propia.
- Investigación sobre calibración GPTQ: los parámetros publicados (128 muestras, longitud 4096, damp 0,05 %) permiten reproducir o variar la configuración y estudiar su efecto en la perplejidad, aunque el autor no publique esas métricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no reporta métricas de rendimiento ni de calidad (ni KL-divergence, ni accuracy, ni perplejidad) y que las validaciones se gestionan internamente en Positron AI.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en 4 bits suman aproximadamente 8,0 GB en disco; en VRAM hay que añadir overhead de activaciones, caché KV y buffers de runtime. Con contexto corto, una estimación razonable es de 9-11 GB, aunque no hay medición publicada.
- GPU recomendadas: no declaradas por el autor. Por tamaño, encajan GPUs con 16 GB o más (RTX 4080, RTX 4090, A100 40 GB, H100). En GPUs de 12 GB el margen es ajustado y depende de la longitud de contexto.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) y RTX 4080 (16 GB); en RTX 3060 de 12 GB requiere contexto reducido y verificación empírica.
- Opciones de despliegue: `transformers` con GPTQModel o kernels GPTQ compatibles; vLLM, llama.cpp, Ollama y TGI no están confirmados para este artefacto en la información disponible (llama.cpp y Ollama requerirían conversión a GGUF, que no se incluye).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `positron-ai/google_gemma-4-12B-it-ingest-best-gptq-permuted` | 11.959.730.224 | no disponible | GPTQ 4-bit, grupo 64 | apache-2.0 (licencia Gemma 4) | Hugging Face, 726 descargas |
| `google/gemma-4-12B-it` (modelo base) | no disponible en la informacion | no disponible | sin cuantizar | licencia Gemma 4 de Google | Hugging Face |
| Otras cuantizaciones del mismo base (GGUF, AWQ) | mismas que el base | no disponible | GGUF/AWQ | segun autor | no disponible en la informacion |

No se dispone de datos de rendimiento del artefacto ni del modelo base en la información proporcionada, por lo que la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- La model card no publica ninguna métrica de calidad: no hay evidencia de que la cuantización GPTQ 4-bit preserve el comportamiento del modelo original. Hay que validar tarea por tarea antes de producción.
- Sesgos conocidos: no documentados por el autor. Al heredar los pesos del modelo base, arrastra los sesgos de este, que no se detallan.
- Riesgo de alucinación: no cuantificado; la cuantización agresiva puede incrementar la degradación en tareas de razonamiento largo.
- Idiomas: no se declara ningún idioma soportado, lo que impide garantizar calidad en castellano u otras lenguas sin evaluación propia.
- Longitud de contexto: no declarada; la calibración se hizo con secuencias de 4096 tokens, pero eso no confirma el contexto máximo de inferencia.
- Licencia: el repositorio figura como apache-2.0, pero el `license_link` remite a la licencia de Gemma 4 de Google y la model card afirma que "la licencia y restricciones de uso originales siguen aplicándose". Conviene revisar los términos de Gemma 4 antes de uso comercial.
- Artefacto de terceros: no es una publicación oficial de Google; el mantenimiento, las actualizaciones y el soporte dependen de Positron AI.
- Sin datos de toolchain de inferencia validado: el autor no declara el runtime ni el hardware objetivo, lo que aumenta el riesgo de incompatibilidades.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/positron-ai/google_gemma-4-12B-it-ingest-best-gptq-permuted
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- GPTQModel: no disponible en la informacion proporcionada
- Paper de GPTQ: no disponible en la informacion proporcionada
- Blog o demo de Positron AI: no disponible en la informacion proporcionada
