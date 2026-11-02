# MirrorNeuronLab/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B es un modelo de lenguaje desarrollado por NVIDIA, distribuido originalmente en formato BF16 safetensors. Esta ficha describe la conversión independiente a GGUF Q4_K_M realizada por MirrorNeuronLab, que parte del checkpoint original de NVIDIA y aplica una cuantización estándar de llama.cpp sin matriz de importancia ni pesos de terceros. El modelo base pertenece a la familia Nemotron y emplea una arquitectura compatible con Gemma 4, según los metadatos del repositorio, con 7.518.069.290 parámetros totales y una ventana de contexto de 65.536 tokens.

La relevancia de esta publicación es práctica: ofrece un artefacto de 5,335 GB (4,969 GiB) listo para inferencia local con llama.cpp y Docker Model Runner, validado en hardware NVIDIA GB10 con descarga completa de las 43 capas a GPU. El modelo está orientado a generación de texto conversacional y conserva la plantilla de chat original de NVIDIA, que admite los argumentos `enable_thinking` y `conversational_mode`.

No se han publicado datos sobre composición del dataset de entrenamiento, número de tokens, idiomas soportados ni resultados de benchmarks en la información disponible. Esta ficha se limita a los datos verificables del repositorio y de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer compatible con Gemma 4 (según tags y backend requerido); detalles internos no disponibles |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (límite preservado en metadatos) |
| Tipos de cuantizacion | Q4_K_M (única incluida en este repo); el modelo base está en BF16 |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | GGUF (archivo `NVIDIA-Nemotron-3.5-Bolt-E4B-Q4_K_M.gguf`, 5.335 GB / 4.969 GiB) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base es `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`, con 7.518.069.290 parámetros totales y una arquitectura que los tags identifican como compatible con Gemma 4. El backend de llama.cpp utilizado para la validación corresponde al commit `dde879bc4f95`, descrito como "Gemma 4 compatible". No se dispone de detalles sobre el tipo de transformer, mecanismos de atención, si emplea mezcla de expertos, ni sobre innovaciones técnicas como decodificación especulativa (la model card menciona un "DFlash drafter" opcional que no se incluye ni se valida en este artefacto).

Respecto al entrenamiento, no hay información disponible sobre volumen de tokens, composición del dataset, fases de RLHF o DPO, ni sobre el proceso de alineación. La model card de esta conversión indica explícitamente que no se realizó entrenamiento adicional: el flujo fue BF16 safetensors → BF16 GGUF → `llama-quantize Q4_K_M` estándar, sin matriz de importancia. Se preservaron las 262.144 entradas de vocabulario y sus IDs, la plantilla de chat, los metadatos de arquitectura y los nombres y formas de los tensores.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat de NVIDIA embebida sin modificaciones.
- Modo de razonamiento opcional mediante el argumento de plantilla `enable_thinking`.
- Modo conversacional mediante el argumento de plantilla `conversational_mode`.
- Recuperación factual y formateo estructurado (JSON) verificados en las pruebas de humo del autor de la cuantización.
- Aritmética básica verificada en pruebas deterministas (por ejemplo, multiplicaciones de dos cifras).
- Seguimiento de instrucciones de sistema y recuerdo en conversaciones multi-turno, según las comprobaciones funcionales realizadas.
- Entrada y salida exclusivamente de texto: las proyecciones multimodales no están incluidas ni validadas en este artefacto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local: el modelo puede mantener diálogos multi-turno con hasta 65.536 tokens de contexto, adecuado para sesiones prolongadas en estaciones de trabajo con una sola GPU consumer de gama alta gracias al tamaño de 5,335 GB en Q4_K_M.
- Despliegue en Docker Model Runner: la model card documenta el flujo completo con `docker model pull hf.co/MirrorNeuronLab/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF:Q4_K_M` y configuración de contexto, lo que facilita integrarlo en entornos contenerizados y pipelines de CI/CD para pruebas de inferencia reproducibles.
- Generación de respuestas estructuradas: las pruebas de humo incluyen formateo JSON, por lo que es utilizable para extracción de datos y generación de salidas parseables en backends de aplicaciones.
- Razonamiento aritmético y resolución de problemas sencillos: validado con comprobaciones deterministas de aritmética; adecuado para asistentes de cálculo y verificación en aplicaciones educativas o de productividad.
- Prototipado e investigación con llama.cpp: al requerir un build reciente compatible con Gemma 4 y estar validado en el commit `dde879bc4f95`, sirve como banco de pruebas para evaluar modelos Nemotron en entornos de inferencia locales sin depender de servicios en la nube.
- Procesamiento por lotes de texto en servidor: mediante `llama-server` con `--jinja -ngl 99`, se puede exponer una API compatible con OpenAI (`/v1/chat/completions`) para tareas de generación masiva de texto en infraestructura propia.
- Evaluación de cuantizaciones: el repositorio incluye scripts de reproducción y auditoría (`GGUF_AUDIT.json`, `PROVENANCE.json`, `SHA256SUMS`), útil para equipos que necesitan verificar la integridad y trazabilidad de artefactos cuantizados antes de desplegarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las comprobaciones realizadas son "functional smoke checks, not a comprehensive quality benchmark" y que no se reclaman las puntuaciones de benchmarks del modelo original para esta cuantización. Las pruebas cubrieron aritmética, recuperación factual, formateo JSON, recuerdo multi-turno e instrucciones de sistema, tanto en BF16 como en Q4_K_M, sobre una NVIDIA GB10, pero no se aportan métricas numéricas de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 5,335 GB (4,969 GiB); se necesita margen adicional para el contexto KV y buffers de cómputo. Con contexto de 4.096 tokens la validación se ejecutó en una NVIDIA GB10 con las 43 capas descargadas a GPU.
- GPU recomendadas: NVIDIA GB10 (validada por el autor). No se documentan otras GPU en la información disponible.
- Cabe en GPU consumer: no confirmado en la información disponible; el tamaño del archivo deja poco margen en tarjetas de 8 GB, por lo que se requiere al menos una GPU con más de 6 GB libres para pesos más overhead de contexto.
- Opciones de despliegue: llama.cpp (build reciente compatible con Gemma 4, commit `dde879bc4f95`), `llama-server` con `--jinja -ngl 99`, y Docker Model Runner v1.2.9. No se mencionan vLLM, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El repositorio incluye un archivo `TIMINGS.json` con mediciones, pero sus valores no se reproducen en la información proporcionada.
- Nota de contexto: la model card usa 4.096 tokens de contexto en tiempo de ejecución para las pruebas, no la ventana completa de 65.536, por motivos de consumo de memoria.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada que permitan una comparación rigurosa. Como referencia estructural, se puede contrastar con el propio modelo base:

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-E4B (BF16, base) | 7.518.069.290 | 65.536 | safetensors BF16 | openmdw-1.1 | Hugging Face (nvidia) |
| NVIDIA-Nemotron-3.5-Bolt-E4B Q4_K_M (esta ficha) | 7.518.069.290 | 65.536 | GGUF Q4_K_M | openmdw-1.1 | Hugging Face (MirrorNeuronLab) |
| NVIDIA-Nemotron-3.5-Bolt-E4B-4GB | no disponible | no disponible | GGUF Q4_K_M incluido | openmdw-1.1 | Hugging Face (nvidia) |

No se dispone de información sobre otros modelos comparables de la misma categoría (mismo tamaño o misma tarea) en los datos proporcionados.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado; las pruebas realizadas son de humo funcional y no evalúan fidelidad factual a escala.
- Limitaciones de contexto: aunque los metadatos preservan 65.536 tokens, las validaciones se hicieron con 4.096 tokens de contexto en ejecución; el rendimiento con la ventana completa no está verificado.
- Idiomas: no se declaran idiomas soportados; no se debe asumir cobertura multilingüe.
- Multimodalidad: las proyecciones multimodales y el "DFlash drafter" opcional no están incluidos ni validados en este artefacto; solo se sirve texto.
- Dependencia de backend: requiere un build de llama.cpp reciente compatible con Gemma 4 (validado en `dde879bc4f95`); versiones anteriores pueden no cargar el modelo correctamente.
- Docker Model Runner: la imagen oficial de CUDA incluye una versión más antigua de llama.cpp; la validación requirió montar un backend compilado aparte. El controlador DMR reporta versión `unknown` por su parser de versiones.
- Licencia: openmdw-1.1; deben revisarse sus términos antes de uso comercial, ya que la información disponible no detalla las restricciones concretas.
- Trazabilidad: la cuantización es independiente de NVIDIA y no está avalada por el fabricante; el autor no reclama los resultados de benchmarks del modelo original para esta conversión.
- El nombre "4GB" del release de NVIDIA no garantiza tamaño de archivo ni memoria total; el archivo real medido es de 5,335 GB.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/MirrorNeuronLab/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF
- Modelo base BF16 de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16/tree/49843eed8db1f1c616c47af75cfd36e07aec0667
- Release "4GB" de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB
- Commit de llama.cpp validado: https://github.com/ggml-org/llama.cpp/tree/dde879bc4f954b809892fd0d660515f42536394a
- Documentación de Docker Model Runner para pull de GGUF desde Hugging Face: https://docs.docker.com/ai/model-runner/get-started/
- Archivos de auditoría y procedencia en el repo: `GGUF_AUDIT.json`, `VALIDATION.json`, `DMR_VALIDATION.json`, `PROVENANCE.json`, `TIMINGS.json`, `SHA256SUMS`
- Script de reproducción: `reproduce/scripts/reproduce.sh` (incluido en el repositorio)
