# Blackfrost-AI/Sage-S2.1-Flash-2bit-EXPERIMENTAL

## Resumen

Sage S2.1 Flash 2bit EXPERIMENTAL es una cuantización mixta de precisión extrema (2 bits) del modelo multimodal científico Sage S2.1 Flash, desarrollado por InternLM. El artefacto lo publica Blackfrost-AI como experimento de conversión de pesos sin modificación de comportamiento: no hay fine-tuning, calibración ni edición de pesos. El objetivo declarado es comprimir un modelo MoE de 320B parámetros totales y 18B activos hasta aproximadamente 103,29 GiB, de modo que quepa en una única GPU de memoria unificada de 128 GB.

La arquitectura subyacente es `glm5_next` (GLM-5.3-Flash), un MoE multimodal científico con 45 capas, 288 expertos enrutados y 8 activos por token. La conversión mantiene en BF16 las superficies más sensibles al error de cuantización (atención MLA, atención lineal KDA, embeddings, LM head, torre de visión, proyectores y capa MTP), mientras que los expertos enrutados se empaquetan en bloques IQ2_XXS de 2,0625 bits por peso y los expertos compartidos y MLP densos en Q8_0 de 8,5 bits por peso.

Es relevante ahora como prueba de concepto de despliegue de modelos masivos en hardware de una sola máquina, siguiendo el estilo de las publicaciones de 2 bits de NVIDIA Nemotron. No obstante, se trata de un artefacto experimental sin evaluación integral publicada, y el propio autor advierte de que la calidad puede diferir materialmente del original en bfloat16. El contexto validado en esta release es de 32.768 tokens, muy por debajo de la ventana teórica de 1.048.576 tokens del modelo padre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (`glm5_next`), MoE multimodal científico |
| Parametros totales | 95.491.218.270 (según safetensors del artefacto); el padre declara 320B-A18B |
| Parametros activos | 18B (A18B, según el padre) |
| Longitud de contexto | 1.048.576 tokens teóricos (upstream); 32.768 tokens validados en esta release |
| Tipos de cuantizacion | Mixta: IQ2_XXS (2,0625 bpw) en expertos enrutados; Q8_0 (8,5 bpw) en expertos compartidos y MLP densos; BF16 en atención MLA, KDA, embeddings, LM head, torre de visión, proyectores y MTP |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del padre) |
| Formato de pesos | safetensors (120 shards), 110.911.082.224 bytes (~103,29 GiB) |

## Arquitectura y entrenamiento

El modelo padre es un transformer MoE multimodal de la familia GLM-5.3-Flash, con 45 capas, 288 expertos enrutados y 8 activos por token. Combina atención MLA (Multi-head Latent Attention) en 12 capas con atención lineal KDA en 34 capas, e incorpora una torre de visión y nueve proyectores científicos para entradas de imagen y datos científicos. Dispone además de una capa MTP (Multi-Token Prediction) en la capa 45, utilizada para decodificación especulativa.

Esta release no entrena ni ajusta nada: es una conversión offline weight-only realizada con NVIDIA TensorRT Model Optimizer (`modelopt`) 0.48.0, usando formatos de bloque estilo ggml en el mismo contenedor que las releases de 2 bits de NVIDIA Nemotron. Los expertos enrutados (42 capas × 288 expertos) se empaquetan en bloques IQ2_XXS de 256 entradas y 66 salidas (2,0625 bpw), los expertos compartidos (42) y las 3 capas MLP densas en bloques Q8_0 de 32 entradas y 34 salidas (8,5 bpw), y el resto de tensores se copia literalmente del original. No hubo datos de calibración, cuantización de activaciones ni edición de pesos. La fidelidad de empaquetado medida a nivel de tensor (similitud coseno frente a bfloat16 en tensores de muestra) es de aproximadamente 0,9446 para IQ2_XXS y 0,999985 para Q8_0; son observaciones de conversión, no benchmarks de calidad extremo a extremo. Los 120 shards se verificaron por SHA-256 contra el diario de compilación antes de la subida.

## Capacidades

- Generación de texto conversacional y razonamiento, heredados del modelo padre.
- Procesamiento multimodal de imagen y texto (`image-text-to-text`), con torre de visión y proyectores científicos copiados sin cuantizar.
- Entradas científicas a través de los nueve proyectores del padre.
- Decodificación especulativa mediante la capa MTP, conservada en BF16.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en una sola GPU de memoria unificada de 128 GB: el artefacto de ~103,29 GiB está diseñado para caber en ese perfil, lo que permite servir un MoE de gran tamaño sin clúster multi-GPU.
- Servicio conversacional con vLLM: validado sobre vLLM 0.27.1 con kernels b12x y 4 slots paralelos en pruebas de humo de entrada corta, adecuado para prototipos de chat con concurrencia baja.
- Experimentación con cuantización extrema: sirve como referencia reproducible para estudiar el impacto de IQ2_XXS en expertos enrutados frente a Q8_0 en capas compartidas, con recibos de conversión y hashes verificables.
- Análisis de documentos científicos con imagen: la torre de visión y los proyectores se mantienen en BF16, por lo que tareas de imagen-texto pueden aprovechar componentes sin degradación por cuantización, siempre que se validen empíricamente.
- Evaluación comparativa de fidelidad de pesos: los datos de similitud coseno por superficie permiten diseñar estudios de ablación sobre qué capas toleran 2 bits.
- Investigación académica sobre serving de MoE: útil para medir latencia, throughput y consumo de memoria de un MoE de 320B-A18B en configuraciones de un solo nodo con vLLM.
- Pruebas de decodificación especulativa: la capa MTP en BF16 permite experimentar con decodificación especulativa en un modelo cuantizado a 2 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación integral no está publicada y que las puntuaciones del padre en bfloat16 no se transfieren automáticamente a este artefacto cuantizado. Los únicos datos numéricos son de fidelidad de conversión:

| Superficie | Formato | Similitud coseno vs BF16 (muestra) |
|---|---|---|
| Expertos enrutados | IQ2_XXS (2,0625 bpw) | ≈ 0,9446 |
| Expertos compartidos y MLP densos | Q8_0 (8,5 bpw) | ≈ 0,999985 |

## Requisitos de hardware

- VRAM estimada: ~103,29 GiB solo para pesos; se requiere margen adicional para KV cache, activaciones y overhead del runtime, por lo que una GPU de 128 GB de memoria unificada es el objetivo declarado.
- GPU recomendadas: GPU de memoria unificada de 128 GB (el autor menciona este perfil como destino); no se especifican modelos concretos como A100, H100 o RTX 4090.
- GPU de consumo: no cabe en GPUs de consumo convencionales (24 GB o menos) por el tamaño del artefacto.
- Opciones de despliegue: vLLM 0.27.1 con kernels b12x, validado por el autor. Otros runtimes (llama.cpp, Ollama, TGI) no están documentados en la información disponible.
- Concurrencia validada: 4 slots paralelos en pruebas de humo de entrada corta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sage S2.1 Flash 2bit EXPERIMENTAL (este) | 95,49B en safetensors; padre 320B-A18B | 32.768 validados (1.048.576 teóricos) | IQ2_XXS + Q8_0 + BF16 mixta | MIT | Hugging Face, experimental |
| internlm/Sage-S2.1-Flash (padre) | 320B-A18B | 1.048.576 (según padre) | BF16 | MIT | Hugging Face |
| Releases de 2 bits de NVIDIA Nemotron | no disponible | no disponible | 2 bits, contenedor compartido | no disponible | Hugging Face (referencia citada por el autor) |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Artefacto experimental: el autor advierte de que la calidad puede diferir materialmente del original en bfloat16; no hay evaluación integral publicada.
- Los benchmarks del padre en bfloat16 no se transfieren automáticamente a esta cuantización.
- Contexto validado de solo 32.768 tokens frente a la ventana teórica de 1.048.576; no debe asumirse el funcionamiento a 1M.
- La cuantización IQ2_XXS en expertos enrutados introduce error de empaquetado apreciable (similitud coseno ≈ 0,9446 a nivel de tensor), con riesgo de degradación en tareas sensibles.
- Concurrencia validada de solo 4 slots en pruebas de humo de entrada corta; el comportamiento bajo carga alta no está documentado.
- Idiomas soportados no disponibles; no se puede garantizar cobertura multilingüe.
- Riesgo de alucinación y sesgos: no documentados específicamente para esta release; heredados potencialmente del padre.
- Licencia MIT heredada, lo que permite uso comercial, pero sin garantías de calidad del artefacto experimental.
- Dependencia de un runtime concreto (vLLM 0.27.1 con kernels b12x) y del contenedor de formato compartido con Nemotron; la portabilidad a otros motores no está verificada.
- El número de parámetros en safetensors (95,49B) no coincide con la cifra de 320B-A18B del padre, lo que refleja el empaquetado cuantizado; conviene tenerlo en cuenta al planificar memoria.

## Enlaces

- Hugging Face: https://huggingface.co/Blackfrost-AI/Sage-S2.1-Flash-2bit-EXPERIMENTAL
- Modelo padre: https://huggingface.co/internlm/Sage-S2.1-Flash
- Revisión del padre: https://huggingface.co/internlm/Sage-S2.1-Flash/tree/76f4513db7464485605a002a06a6190de0460574
- README original incluido en el repo: `UPSTREAM-README.md`
- NVIDIA TensorRT Model Optimizer (`modelopt`): no disponible en la información proporcionada
- Papers, blogs y demos adicionales: no disponibles en la información proporcionada
