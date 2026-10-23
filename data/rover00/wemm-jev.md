# Rover00/WeMM-JEV

## Resumen

WeMM-JEV es un modelo multimodal de decisión desarrollado por Rover00 que responde preguntas tipadas sobre texto e imágenes y devuelve probabilidades en una única pasada por pregunta. No es un modelo generativo conversacional: su salida se organiza en tres modos: `choice` (elección entre opciones), `noul` (probabilidad de una proposición sí/no) y `score` (distribución sobre niveles ordenados).

El repositorio declara 26.085.330.160 parámetros (~26,1B), pesos en safetensors, licencia Apache-2.0 y código de inferencia propio (`D3Engine`). La model card publica un índice propio, Public Decision Index 0.3, con 69,37 en texto y 77,97 en visión, pero no detalla arquitectura, longitud de contexto, idiomas ni datos de entrenamiento.

Su relevancia práctica está en sustituir clasificadores ad hoc por un único modelo multimodal que produce probabilidades para decisiones, con integración vía API HTTP. Al no ser generativo, encaja en pipelines de decisión y anotación, no en chatbots.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal; el tag `qwen3_5` apunta a una base de la familia Qwen3.5, no confirmado en la model card |
| Parámetros totales | 26.085.330.160 (~26,1B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; solo se publican pesos safetensors, sin GGUF, AWQ, GPTQ ni cuantizaciones oficiales |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pytorch), con `custom_code` |
| Pipeline de HuggingFace | no disponible |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Los tags indican `pytorch`, `safetensors`, `qwen3_5`, `multimodal` y `custom_code`, por lo que cabe esperar un transformer multimodal derivado de la familia Qwen3.5, pero no se confirman capas, mecanismo de atención, fusión visual ni el método exacto para producir probabilidades.

No hay información sobre tokens de entrenamiento, composición del dataset, RLHF/DPO, calibración ni proceso de alineamiento. La innovación declarada es la interfaz de decisión: preguntas tipadas y una pasada por pregunta con salida probabilística, además de un motor de inferencia (`D3Engine`) y un servidor HTTP incluidos en el repositorio.

## Capacidades

- Decisión multimodal texto-imagen: acepta una observación textual y, según la model card, también imágenes.
- Salida `choice`: selecciona entre opciones suministradas y devuelve probabilidades por opción.
- Salida `noul`: estima la probabilidad de una proposición sí/no.
- Salida `score`: devuelve una distribución sobre niveles ordenados.
- Una única pasada por pregunta, orientada a latencia baja en pipelines de decisión.
- Integración mediante `D3Engine` y servidor HTTP incluido en el repositorio.
- Evaluación mediante el Public Decision Index 0.3, con paneles de texto y visión.
- No se declara generación de texto libre, razonamiento multi-paso, tool calling ni soporte de agentes.
- No se declaran capacidades multilingües, audio, vídeo ni modo de razonamiento explícito.

## Casos de uso

- Control de calidad visual en fabricación: usar `choice` con opciones como "correcto", "defecto leve" y "defecto grave" sobre imágenes de inspección; una pasada por imagen devuelve la probabilidad de cada clase.
- Verificación de escenas para conducción o robótica: el ejemplo de la model card usa `noul` para "el semáforo está rojo" y devuelve una probabilidad; adecuado para módulos de percepción que necesitan una creencia probabilística en lugar de una etiqueta opaca.
- Moderación multimodal: formular proposiciones como "la imagen contiene violencia explícita" y aplicar un umbral sobre la probabilidad; permite auditar el valor devuelto y ajustar el punto de corte por política.
- Anotación asistida en investigación: usar `score` para escalas ordinales de gravedad, calidad o satisfacción, y `choice` para categorías; útil para preetiquetar grandes lotes y priorizar la revisión humana.
- Encuestas y estudios con imágenes: respuestas cerradas mediante `choice` o `score`, con probabilidades agregables; el servidor HTTP permite desplegarlo como microservicio interno.
- Evaluación de modelos multimodales: integrar el Public Decision Index en comparativas internas; el repositorio publica resultados detallados en un dataset aparte.
- Triaje de imágenes industriales o documentales: priorizar casos con `score` ordinal y probabilidad asociada, manteniendo siempre una revisión humana para decisiones críticas.

## Benchmarks y rendimiento

| Benchmark | Panel | Resultado |
|---|---|---:|
| Public Decision Index 0.3 | Texto | 69,37 |
| Public Decision Index 0.3 | Visión | 77,97 |

El Public Decision Index 0.3 es un índice propio del autor y no equivale a MMLU, HumanEval, GSM8K ni a otros benchmarks estándar. No se han publicado resultados de benchmarks estándar en la información disponible. Los resultados detallados están en el dataset `Rover00/WeMM-JEV-Results`.

## Requisitos de hardware

- Pesos en FP16/BF16: 26.085B × 2 bytes ≈ 52,2 GB; el repositorio ocupa 52,2 GB. VRAM estimada para inferencia: 56-64 GB, sin contar contexto largo.
- Pesos en INT8: ~26,1 GB; VRAM estimada de 30-36 GB. No hay cuantización oficial publicada; es una estimación.
- Pesos en INT4: ~13,0 GB; VRAM estimada de 16-20 GB. No hay cuantización oficial publicada y requiere soporte del `custom_code`.
- GPU recomendadas para FP16/BF16: A100 80 GB, H100 80 GB o GPUs con 64 GB o más. Con 2×A100 40 GB haría falta paralelismo, no confirmado por el motor incluido.
- GPU para INT8: A6000 48 GB, L40S 48 GB o A100 40 GB, siempre que el motor soporte cuantización.
- GPU de consumo: RTX 4090 o RTX 3090 con 24 GB solo en INT4 y si el código admite cuantización; no está confirmado. En FP16 no cabe en una GPU de consumo.
- Despliegue: `D3Engine` y servidor HTTP incluidos en `inference/`. No se confirma soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Rendimiento comparable |
|---|---:|---|---|---|---|
| WeMM-JEV | 26,1B | no disponible | Modelo de decisión multimodal | Apache-2.0 | 69,37 texto / 77,97 visión en el índice del autor |
| Qwen2.5-VL-32B-Instruct | 32,5B | 128K | VLM generativo | Apache-2.0 | no comparable con el índice del autor |
| Gemma 3 27B | 27B | 128K | VLM generativo | Gemma Terms | no comparable con el índice del autor |

No se dispone de una comparativa directa publicada frente a otros modelos de decisión multimodal. Las alternativas de la tabla son modelos generativos y no producen salidas probabilísticas tipadas `choice`/`noul`/`score`, por lo que la comparación de rendimiento no es equivalente.

## Limitaciones y advertencias

- El Public Decision Index 0.3 es un índice propio del autor; no se ha validado de forma independiente en la información disponible.
- El repositorio muestra 0 descargas y 0 likes en el momento consultado, lo que limita la evidencia externa sobre su comportamiento.
- No se especifican longitud de contexto, idiomas soportados ni composición del dataset de entrenamiento.
- No hay métricas de calibración publicadas, como ECE o Brier score; las probabilidades devueltas pueden estar mal calibradas.
- Riesgo de estimaciones erróneas o sobreconfiadas en imágenes o textos fuera de la distribución de entrenamiento.
- El modelo no genera explicaciones ni texto libre; solo devuelve probabilidades, lo que dificulta la auditoría de decisiones individuales.
- Requiere `custom_code` y el paquete de inferencia del repositorio; conviene revisar el código y las dependencias antes de usarlo en producción.
- La licencia Apache-2.0 permite uso comercial, pero debe verificarse también la licencia de los datos de evaluación y de cualquier componente de terceros incluido en `inference/`.
- El tamaño de 26,1B exige hardware de gama alta en FP16; las cuantizaciones INT8/INT4 son estimaciones no oficiales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rover00/WeMM-JEV
- Resultados detallados: https://huggingface.co/datasets/Rover00/WeMM-JEV-Results
- Instrucciones de inferencia: https://huggingface.co/Rover00/WeMM-JEV/blob/main/inference/README.md
- No se han encontrado paper, blog, repositorio adicional ni demo en la información proporcionada.
