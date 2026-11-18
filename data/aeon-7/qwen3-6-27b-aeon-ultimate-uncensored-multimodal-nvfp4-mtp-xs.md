# AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP-XS

## Resumen

Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP-XS es una versión cuantizada y modificada del modelo multimodal Qwen3.6-27B, publicada por el usuario AEON-7. Se trata de un derivado "abliterated" y "uncensored", es decir, con los mecanismos de rechazo reducidos o eliminados, distribuido en formato NVFP4 (FP4 de NVIDIA) generado con ModelOpt. El modelo conserva las cabezas de predicción multi-token (MTP) nativas y está pensado para su despliegue en GPUs Blackwell con VRAM dedicada (RTX 5090, RTX PRO 6000, B100, B200) y en DGX Spark (GB10).

La arquitectura subyacente es híbrida: combina atención con Mamba y Gated DeltaNet (según las etiquetas del autor), lo que apunta a un transformer con capas de atención lineal y estado recurrente. El modelo tiene 27.781.427.952 parámetros reales (según safetensors) y un repositorio de 20,6 GB, lo que refleja la cuantización a 4 bits. Soporta entrada de imagen y texto (pipeline image-text-to-text) y generación de texto conversacional.

Su relevancia actual es doble: por un lado, ofrece una ruta de despliegue de un modelo de ~27B en GPUs de consumo de gama alta con cuantización FP4 nativa y decodificación especulativa; por otro, el propio autor lo marca como obsoleto y recomienda migrar a su release Qwen3.8-27B. La ficha se basa exclusivamente en la información pública del repositorio de Hugging Face y en la model card; no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: transformer con atención, Mamba y Gated DeltaNet (según etiquetas del autor); multimodal image-text-to-text |
| Parámetros totales | 27.781.427.952 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (FP4 de NVIDIA, generado con ModelOpt); el modelo base está en BF16 |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers); repo de 20,6 GB |

## Arquitectura y entrenamiento

La model card describe el modelo como híbrido, con atención, Mamba y Gated DeltaNet, y con preservación de convoluciones 1D ("conv1d-preserved"). Incorpora cabezas de predicción multi-token (MTP) nativas, orientadas a decodificación especulativa, y está etiquetado como compatible con decodificación especulativa externa mediante un drafter DFlash de z-lab (Qwen3.6-27B-DFlash). El modelo base es AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16, del que esta versión es una cuantización NVFP4. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación técnica destacable es la cuantización NVFP4 con ModelOpt y el soporte de MTP y DFlash para decodificación especulativa. El autor documenta ajustes específicos en el contenedor de vLLM (versión 0.23.0 compilada para sm_121a) para que las capas de atención de ventana deslizante del drafter funcionen correctamente y para hacer la caché de prefijos inmune a corrupción con DFlash. También se menciona una caché KV en NVFP4 vía Triton que triplica la capacidad de KV. No se especifican detalles del proceso de "abliteration" ni de los datos de ajuste.

## Capacidades

- Generación de texto conversacional multi-turno.
- Entrada multimodal de imagen y texto (pipeline image-text-to-text); la model card configura límites de 4 imágenes y 2 vídeos por prompt en el ejemplo de despliegue.
- Razonamiento con parser de razonamiento qwen3 (`--reasoning-parser qwen3`).
- Tool calling y function calling con parser qwen3_coder y auto-selección de herramientas (`--enable-auto-tool-choice`).
- Decodificación especulativa mediante MTP nativo o drafter DFlash externo.
- Capacidades multilingües limitadas a inglés, chino y multilingüe genérico.
- Modo "uncensored"/"abliterated": reducción de rechazos, lo que implica menor alineación de seguridad.
- Soporte de contexto largo en el drafter (ventana deslizante de 2048 en 4 de sus 5 capas), aunque la longitud de contexto del modelo principal no se especifica.

## Casos de uso

- Despliegue en DGX Spark o GB10 para asistentes conversacionales locales: el contenedor y la receta de la model card permiten servir el modelo con vLLM y memoria unificada, con `--gpu-memory-utilization` entre 0,6 y 0,7 para evitar el page-thrashing del pool compartido CPU+GPU.
- Generación de código en pipelines con tool calling: el parser qwen3_coder y `--enable-auto-tool-choice` permiten integrar el modelo en agentes que invocan herramientas y APIs en entornos de CI/CD.
- Procesamiento de documentos con imágenes: al aceptar hasta 4 imágenes y 2 vídeos por prompt, puede usarse para extracción de información de capturas, diagramas o fotogramas en flujos de análisis documental.
- Decodificación especulativa de alto rendimiento: el uso de MTP nativo o del drafter DFlash con `num_speculative_tokens: 10` está orientado a maximizar el throughput en servicios con alta concurrencia (`--max-num-seqs 64`).
- Investigación sobre alineación y seguridad: al ser un modelo "abliterated", sirve como caso de estudio para evaluar cómo la eliminación de rechazos afecta a la calidad y a la seguridad de las respuestas.
- Prototipado multimodal en GPUs Blackwell de consumo: la cuantización NVFP4 reduce el peso a 20,6 GB, lo que permite ejecutarlo en una RTX 5090 de 32 GB o en una RTX PRO 6000.
- Servicio de chat multilingüe inglés-chino: el soporte declarado de en y zh lo hace adecuado para atención al cliente bilingüe en esos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona "measured benchmarks" en el repositorio de GitHub del autor, pero no se incluyen cifras en la información proporcionada; no se deben inventar valores.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 20,6 GB en NVFP4; se necesita espacio adicional para caché KV y activaciones. La model card recomienda `--gpu-memory-utilization` de 0,65 en DGX Spark y de 0,6-0,7 en memoria unificada.
- GPUs objetivo: RTX 5090 (32 GB), RTX PRO 6000, B100, B200 y DGX Spark (GB10), todas con arquitectura Blackwell (sm_120, sm_100, sm_121a).
- Cabe en GPU de consumo: sí, en RTX 5090 de 32 GB, según las etiquetas y la receta del autor.
- Despliegue: vLLM 0.23.0 mediante el contenedor `ghcr.io/aeon-7/aeon-vllm-ultimate:latest` (DGX Spark/GB10) o `ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest` (RTX discreta); también es compatible con transformers. No se documenta soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles; la model card afirma que el cuerpo completo (no XS) corre a "parity speed" con mayor calidad, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP-XS (este) | 27,78 B | no disponible | NVFP4 | apache-2.0 | Versión XS, menor huella |
| Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP | no disponible | no disponible | NVFP4 | apache-2.0 | Cuerpo completo, mayor calidad según el autor |
| Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED | no disponible | no disponible | NVFP4 + FP8 | no disponible | Release sucesora recomendada por el autor |
| Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16 | no disponible | no disponible | BF16 | apache-2.0 | Modelo base sin cuantizar |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor marca explícitamente este modelo como obsoleto ("superseded by Qwen3.8") y recomienda migrar a la release Qwen3.8-27B para nuevos trabajos.
- Al ser "abliterated" y "uncensored", presenta una alineación de seguridad reducida; no es adecuado para aplicaciones de producción que requieran filtros de contenido robustos sin capas adicionales.
- Riesgo de alucinación no cuantificado; no hay benchmarks publicados que permitan evaluarlo.
- La longitud de contexto del modelo principal no se especifica; el drafter DFlash usa ventana deslizante de 2048, lo que afecta al drafting en contextos largos.
- Idiomas limitados a inglés, chino y multilingüe genérico; el rendimiento en castellano no está documentado.
- La licencia apache-2.0 permite uso comercial, pero las modificaciones de "abliteration" y la procedencia del modelo base deben verificarse por el usuario.
- El despliegue requiere versiones específicas de vLLM y parches (sm_121a, PR #40898, #41703, #44389); configuraciones fuera de las documentadas pueden degradar el rendimiento o fallar.
- En DGX Spark, una `gpu-memory-utilization` superior a ~0,8 provoca page-thrashing del pool unificado y bloquea el sistema.

## Enlaces

- Hugging Face: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP-XS
- Modelo base BF16: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16
- Cuerpo completo NVFP4-MTP: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP
- Release sucesora Qwen3.8: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED
- Repositorio de despliegue y benchmarks: https://github.com/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-DFlash
- Contenedor vLLM Ultimate: https://github.com/AEON-7/vllm-ultimate-dgx-spark
- Drafter DFlash: https://huggingface.co/z-lab/Qwen3.6-27B-DFlash
- Recetas Qwen3.8: https://github.com/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED
