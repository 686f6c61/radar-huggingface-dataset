# MirrorNeuronLab/Inkling-2-Mini-GGUF

## Resumen

Inkling 2 Mini GGUF es una conversión independiente del checkpoint original Inkling 2 Mini de Thinking Machines Lab, publicada por MirrorNeuronLab en formato GGUF para su uso con llama.cpp y Docker Model Runner. El modelo base es un modelo multimodal de tipo image-text-to-text con 26.070.385.152 parámetros totales (aproximadamente 26 mil millones), lo que lo sitúa en la categoría de modelos de tamaño medio-grande orientados a inferencia local en hardware de gama alta.

La relevancia de esta ficha radica en que el checkpoint original distribuía los pesos de sus expertos en formatos empaquetados NVFP4 y MXFP8, poco habituales en el ecosistema GGUF. MirrorNeuronLab decodificó esos pesos a un intermedio BF16 y aplicó el preset estándar Q4_K_M de llama.cpp sin importance matrix, produciendo un fichero de texto de 17,48 GB más un proyector visual BF16 de 642 MB. Esto permite ejecutar un modelo multimodal de 26B en entornos con llama.cpp, algo que no era posible directamente con el checkpoint upstream.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, aunque el autor original impone además una política de uso aceptable. Esta conversión excluye el modelo draft MTP opcional del checkpoint original, por lo que no incorpora decodificación especulativa en esta release.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; pesos de expertos empaquetados en NVFP4 y MXFP8 en origen) |
| Parámetros totales | 26.070.385.152 (aproximadamente 26B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible en la model card; validado a 4.096 tokens en Docker Model Runner |
| Tipos de cuantización | Q4_K_M (texto) y BF16 (proyector visual) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con Model Acceptable Use Policy del autor original) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la información proporcionada. La model card de esta conversión indica únicamente que el checkpoint original de Thinking Machines Lab empaqueta los pesos de sus expertos en NVFP4 y MXFP8, lo que sugiere una arquitectura con componentes de mezcla de expertos (MoE) o al menos pesos de experto diferenciados, aunque no se confirma el tipo exacto de arquitectura. El pipeline declarado es image-text-to-text, con un proyector visual BF16 que habilita la entrada de imágenes.

El proceso de conversión realizado por MirrorNeuronLab consistió en decodificar los pesos empaquetados NVFP4 y MXFP8 a un GGUF intermedio en BF16 y aplicar después el preset Q4_K_M estándar de llama.cpp sin importance matrix. No se documentan en la información disponible los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO. La release excluye el modelo draft MTP opcional presente en el checkpoint original, por lo que no se incluye decodificación especulativa en esta conversión.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` de la model card.
- Entrada de imágenes (image-text-to-text) mediante el proyector visual BF16 incluido (`mmproj-Inkling-2-Mini-BF16.gguf`).
- Soporte de inferencia a través de llama.cpp (`llama-server`) y de Docker Model Runner con backend llama.cpp.
- Compatibilidad con la API OpenAI de chat completions en Docker Model Runner, incluyendo el tipo de contenido `image_url` para entrada de imágenes.
- Funcionamiento validado en Linux ARM64 con GPU NVIDIA GB10 a contexto de 4.096 tokens, con pruebas de humo de texto e imagen superadas.
- Soporte del backend llama.cpp para el modelo (`inkling2_loop`) a partir del build `b12600`.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, modo thinking explícito ni soporte de audio.

## Casos de uso

- Asistente conversacional multimodal local: el modelo puede gestionar diálogos multi-turno con entrada de imágenes usando llama.cpp o Docker Model Runner, adecuado para prototipos de asistentes que necesitan describir o razonar sobre capturas, diagramas o fotos sin depender de APIs externas.
- Procesamiento de documentos con imágenes: al aceptar image-text-to-text, puede emplearse para extraer información de capturas de pantalla, formularios escaneados o gráficos simples en flujos de preprocesamiento, siempre con validación humana dado el riesgo de alucinación.
- Despliegue en infraestructura Docker existente: la integración con Docker Model Runner permite incorporar el modelo a pipelines de contenedores ya existentes, con configuración de contexto mediante `docker model configure` y consumo vía API compatible con OpenAI.
- Evaluación y benchmarking de modelos multimodales de 26B en local: útil para investigadores que quieran comparar el comportamiento de un modelo de este tamaño en cuantización Q4_K_M frente a alternativas en la misma GPU, con ficheros verificables mediante `SHA256SUMS`.
- Prototipado de aplicaciones de visión-lenguaje en estaciones de trabajo con GPU única: el tamaño de 17,48 GB en Q4_K_M más 642 MB de proyector permite cargar el modelo en GPUs de gama alta de consumo o profesional, facilitando iteración rápida sin clúster.
- Reproducción de entornos validados: la model card incluye un launcher (`reproduce/start-docker-runner.sh`) y registros de validación, lo que permite reproducir el entorno exacto (Docker Model Runner v1.2.9, commit CUDA `29b52d398`, GB10) para pruebas de regresión.
- Integración en herramientas de línea de comandos y scripting: mediante `llama-server` con `--jinja` y contexto configurable, se puede exponer el modelo como servicio HTTP local para tareas de generación y análisis de imágenes en scripts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de texto Q4_K_M ocupa 17,48 GB y el proyector visual BF16 642 MB; se necesita al menos esa cantidad de VRAM más overhead de contexto y caché KV, por lo que en la práctica se recomienda disponer de 20-24 GB o más para contexto moderado.
- GPU recomendadas: NVIDIA GB10 (validada oficialmente en la model card); por tamaño, GPUs con 24 GB o más como RTX 4090, RTX 3090, A100 40 GB, H100 o L40S son candidatas razonables, aunque solo la GB10 está documentada como validada.
- ¿Cabe en GPU de consumo? Sí, en GPUs de consumo con 24 GB de VRAM como la RTX 4090 o la RTX 3090, siempre que se limite el contexto; no cabe en GPUs de 16 GB o menos en Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama-server` con `-hf` o `-m` más `--mmproj`), Docker Model Runner con backend llama.cpp build `b12600` o superior, y el launcher incluido para Linux con CUDA (`-DGGML_CUDA=ON`).
- Latencia y throughput: no disponibles; la model card solo documenta que las pruebas de humo de texto e imagen se superaron a contexto de 4.096 tokens en Docker Model Runner v1.2.9 sobre GB10.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no incluye comparativas con alternativas de la misma categoría, y no se han facilitado datos de rendimiento que permitan establecer una comparación rigurosa con otros modelos multimodales de aproximadamente 26B parámetros.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Mini (esta conversión) | 26B | no disponible (validado a 4.096) | Apache 2.0 | GGUF Q4_K_M | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo derivado de un checkpoint de Thinking Machines Lab, hereda los sesgos del modelo base, que no se detallan.
- Riesgo de alucinación: no cuantificado en la model card; como modelo generativo conversacional, existe riesgo de fabricación de contenido, especialmente en tareas de razonamiento sobre imágenes.
- Limitaciones de contexto: la model card no declara la longitud máxima de contexto del modelo base; la validación se realizó únicamente a 4.096 tokens, por lo que no hay garantía documentada de funcionamiento correcto más allá de esa cifra en esta conversión.
- Idiomas: no se especifican los idiomas soportados; no se debe asumir un rendimiento multilingüe sin evaluación previa.
- Restricciones de licencia: los pesos son Apache 2.0, pero el autor original impone una Model Acceptable Use Policy adicional que debe revisarse antes de uso comercial o en producción.
- Cuantización sin importance matrix: la conversión aplicó el preset Q4_K_M estándar sin imatrix, lo que puede implicar una pérdida de calidad algo mayor que una cuantización con importance matrix; no se han publicado evaluaciones comparativas de calidad.
- Ausencia de modelo draft MTP: esta release excluye el modelo draft opcional, por lo que no se dispone de decodificación especulativa y el throughput puede ser inferior al del checkpoint original con MTP.
- Requisito de build específico: el soporte de `inkling2_loop` en llama.cpp requiere el build `b12600` o superior; versiones anteriores no cargarán el modelo correctamente.
- Validación limitada: la única plataforma documentada como validada es Linux ARM64 con NVIDIA GB10 y Docker Model Runner v1.2.9; otros entornos (x86, otras GPUs, macOS) no están verificados en la model card.
- Verificación de integridad: se recomienda comprobar los ficheros con `sha256sum -c SHA256SUMS` antes de desplegar, dado que la conversión es de un tercero independiente del autor original.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/MirrorNeuronLab/Inkling-2-Mini-GGUF
- Modelo base original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Checkpoint original (revisión concreta): https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/ed40e7da625f594fc9c4990f5f66be24873c22d7
- Release de llama.cpp con soporte `inkling2_loop` (b12600): https://github.com/ggml-org/llama.cpp/releases/tag/b12600
- Documentación de la API de Docker Model Runner: https://docs.docker.com/ai/model-runner/api-reference/
- Política de uso aceptable de Thinking Machines Lab: https://thinkingmachines.ai/model-acceptable-use-policy/
- Fichero de pesos Q4_K_M: https://huggingface.co/MirrorNeuronLab/Inkling-2-Mini-GGUF/resolve/main/Inkling-2-Mini-Q4_K_M.gguf
- Proyector visual BF16: https://huggingface.co/MirrorNeuronLab/Inkling-2-Mini-GGUF/resolve/main/mmproj-Inkling-2-Mini-BF16.gguf
