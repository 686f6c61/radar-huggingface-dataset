# LokkenJP/10Eros_Max_optimized_w4a8_exp_learned

## Resumen

10Eros_Max_optimized_w4a8_exp_learned es una cuantización experimental del modelo de generación de vídeo MiniMax-H3, concretamente del checkpoint comunitario TenStrip/10Eros-Max. Lo publica LokkenJP, un desarrollador independiente, como proyecto personal orientado a reducir el peso en disco y el consumo de memoria del transformer para que pueda ejecutarse en hardware de consumo mediante ComfyUI. El modelo resuelve el problema de que el checkpoint BF16 original ronda los 40 GB, lo que lo hace inaccesible para la mayoría de GPUs domésticas.

La innovación principal es el uso de aprendizaje guiado por activaciones (activation-guided learned quantization): en lugar de aplicar una cuantización mecánica, se capturan activaciones proxy offline y se usan para reconstruir los pesos originales en BF16 minimizando el error de activación, con mapas de precisión mixtos que combinan W6 g16, W4 g16 e INT8 según la sensibilidad de cada matriz. El resultado es un transformer de 18,73 GB (versión Beta7 fix1 HQ, recomendada) con Turbo de ocho pasos embebido.

El modelo es exclusivamente el transformer: el codificador de texto (Qwen3-VL 32B), los VAE de vídeo y audio y el flujo de trabajo ComfyUI son componentes separados. La licencia es la MiniMax-H3 Community License Agreement, y el contenido está marcado como no apto para todos los públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para vídeo (MiniMax-H3), con Turbo de 8 pasos embebido |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4 g16, W6 g16, INT8 (mapas de precisión mixtos); 332 tensores no objetivo preservados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (other) |
| Formato de pesos | safetensors |

Datos adicionales de los checkpoints publicados:

| Release | Tamano exacto | Matrices aprendidas |
|---|---:|---|
| Beta7 fix1 HQ (recomendado) | 18.734.317.942 bytes / 18,7343 GB | 90 W6 g16, 110 INT8 |
| Beta7 compact original | 14.647.885.469 bytes / 14,6479 GB | 85 W4 g16, 103 W6 g16, 12 INT8 |

## Arquitectura y entrenamiento

El modelo subyacente es MiniMax-H3, un transformer de difusión para generación de vídeo (y audio asociado), con un decodificador de forma de onda BigVGAN integrado en el VAE de audio. Esta ficha corresponde a una cuantización, no a un entrenamiento desde cero: los pesos provienen de TenStrip/10Eros-Max (Beta7 fix1), que a su vez deriva de MiniMax-H3. El proceso de cuantización captura activaciones proxy offline con las que se guía la reconstrucción de los pesos BF16 originales, matriz a matriz, seleccionando la precisión (W4, W6 o INT8) según la sensibilidad observada.

La asignación de precisión de la versión fix1 HQ es explícita: INT8 para todas las matrices de atención OUT y FC2, y para las cuatro matrices principales de los bloques 0, 1, 47, 48 y 49; W6 g16 para QKV y FC1 en los bloques 2 a 46. Los 332 tensores no objetivo se conservan byte a byte en BF16, incluidos los cabezales de salida de vídeo y audio expandidos de fix1, cuyos 32 cabezales PDD se declaran en los metadatos para carga estándar en ComfyUI sin modificaciones. El modelo conserva el Turbo de ocho pasos embebido del checkpoint fuente.

Las mediciones de reconstrucción publicadas comparan la cuantización nativa con la aprendida, en NRMSE de activación (menor es mejor): para W6 g16, NRMSE medio nativo de 0,015448 frente a 0,006302 aprendido (reducción pareada media del 59,41 %); para INT8, 0,008193 frente a 0,003059 (reducción del 63,25 %). En la métrica rank32-plus-residual, las reducciones son del 34,56 % y 32,26 % respectivamente. El autor advierte que cada reducción es la media de reducciones porcentuales pareadas, no el cociente de las columnas de error medio.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen y texto (image-text-to-video), que es el pipeline declarado.
- Generación de vídeo a partir de imagen (image-to-video).
- Generación de audio asociada, con decodificador BigVGAN integrado en el VAE de audio.
- Inferencia en ocho pasos gracias al Turbo embebido, lo que reduce el coste computacional frente a muestreos largos.
- Salida de alta resolución en la versión fix1, que es precisamente el cambio principal respecto a Beta7 original.
- Integración nativa con ComfyUI mediante los metadatos de cabecales PDD.
- Codificador de texto separado basado en Qwen3-VL 32B, con variantes cuantizadas propias (W4/W6, INT8 ConvRot oficial).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo generativo de vídeo, no un LLM de propósito general.

## Casos de uso

- Creación de vídeo corto para redes sociales en estaciones de trabajo con GPU de consumo: el checkpoint compact de 14,65 GB permite generar clips con el Turbo de ocho pasos en GPUs de 24 GB, algo inviable con el BF16 de ~40 GB.
- Previsualización rápida de ideas creativas en estudios pequeños: el modelo produce borradores de vídeo a partir de prompts de texto para validar concepto, encuadre y ritmo antes de pasar a un pipeline de mayor calidad.
- Animación de imágenes fijas (image-to-video) para ilustración, cómic o storyboard: se parte de una imagen de referencia y se genera movimiento coherente, útil para prototipos de animación.
- Generación de vídeo con audio sincronizado en una sola pasada: al integrar el decodificador BigVGAN en el VAE de audio, sirve para clips con banda sonora o efectos sin encadenar modelos separados.
- Iteración en local dentro de ComfyUI para artistas técnicos: los mapas de precisión mixtos y los cabecales declarados permiten cargar el modelo sin parchear ComfyUI, lo que simplifica flujos de trabajo reproducibles.
- Investigación sobre cuantización de modelos de difusión: las tablas de NRMSE nativo frente a aprendido y los mapas de precisión publicados convierten este checkpoint en un caso de estudio para evaluar cuantización guiada por activaciones en transformers de vídeo.
- Despliegue en entornos con memoria limitada mediante la variante compact: cuando la VRAM es el cuello de botella y la resolución alta no es requisito, el checkpoint de 14,65 GB ofrece un equilibrio documentado entre calidad y consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que las observaciones de calidad en ComfyUI son subjetivas y que no existe un benchmark controlado de calidad de vídeo generado ni de velocidad de inferencia. Lo único medible publicado son las métricas de reconstrucción de pesos (NRMSE de activación), recogidas en la sección de arquitectura y entrenamiento.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El autor advierte que los tamaños en GB decimales son de disco, no VRAM requerida; el uso real depende de memoria de trabajo, activaciones, otros componentes del pipeline y offloading.
- El checkpoint fix1 HQ (18,73 GB) y el compact (14,65 GB) están pensados para hardware de consumo; el compact se describe como alternativa para configuraciones con memoria restringida.
- El pipeline completo requiere además el codificador de texto Qwen3-VL 32B (variantes de 15,35 GB, 17,93 GB y 23,03 GB, o el INT8 ConvRot oficial de 27,14 GB) y los VAE de vídeo y audio, que suman memoria adicional.
- GPU recomendadas: no disponible. El autor no publica una lista de GPUs validadas.
- Cabe en GPU de consumo: sí, según el objetivo declarado del proyecto, especialmente con el checkpoint compact; no se especifican modelos concretos.
- Opciones de despliegue: ComfyUI es el entorno de referencia, con carga estándar sin modificaciones. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un transformer de difusión de vídeo.
- Latencia y throughput: no disponibles; no se ha publicado benchmark de velocidad de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 10Eros_Max_optimized_w4a8_exp_learned (fix1 HQ) | no disponible | no disponible | safetensors, 18,73 GB | MiniMax-H3 Community License | Hugging Face, 127.168 descargas |
| 10Eros_Max_optimized (Beta7 compact original) | no disponible | no disponible | safetensors, 14,65 GB | MiniMax-H3 Community License | Hugging Face (mismo autor) |
| TenStrip/10Eros-Max (fuente Beta7 fix1) | no disponible | no disponible | BF16, ~40 GB según el autor | no disponible en la informacion | Hugging Face |
| Codificador de texto INT8 ConvRot oficial | no disponible | no disponible | INT8, 27,14 GB | MiniMax-H3 Community License | Hugging Face |

La comparación relevante es interna al ecosistema H3: la versión fix1 HQ prioriza calidad y resolución alta, el compact prioriza memoria, y el BF16 fuente sirve de referencia de calidad. El autor señala que el HQ no establece paridad con el BF16 de ~40 GB. No se dispone de datos para comparar con modelos de vídeo de otros fabricantes.

## Limitaciones y advertencias

- El autor califica el proyecto como hobby personal; no hay garantías de soporte ni de mantenimiento a largo plazo.
- No existe benchmark controlado de calidad de vídeo ni de velocidad; las comparaciones de calidad son observaciones subjetivas del operador en flujos de ComfyUI concretos.
- El HQ no alcanza paridad con el BF16 original de ~40 GB, pese a que en algunas generaciones el operador lo prefirió frente al proxy INT8 nativo.
- El compact original tiene calidad observada ligeramente inferior a su HQ correspondiente y menor uso de memoria observado, pero no se ha comparado con fix1 HQ.
- La cuantización introduce error de reconstrucción de pesos; las métricas NRMSE publicadas cuantifican ese error, pero no su impacto perceptual en vídeo generado.
- El modelo es solo el transformer: sin el codificador de texto, los VAE y el flujo de trabajo adecuados no genera nada. La calidad final depende de componentes externos.
- Contenido marcado como no apto para todos los públicos (not-for-all-audiences), lo que exige control de acceso y moderación en cualquier despliegue público.
- Licencia MiniMax-H3 Community License Agreement: es una licencia "other" con condiciones específicas; deben revisarse los términos antes de cualquier uso comercial, y no se detallan en la información disponible.
- Idiomas soportados no documentados; el comportamiento multilingüe depende del codificador de texto Qwen3-VL y no está caracterizado para este checkpoint.
- No se publican sesgos conocidos ni evaluación de alucinación; en un modelo generativo de vídeo, el riesgo se traduce en artefactos, incoherencias temporales y desviaciones del prompt.
- No hay datos de latencia, throughput ni VRAM real medida, lo que dificulta el dimensionamiento de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LokkenJP/10Eros_Max_optimized_w4a8_exp_learned
- Checkpoint Beta7 fix1 HQ: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/resolve/main/10Eros_Max_h3_8stepTURBO_beta7_fix1_activation_learned_HQ.safetensors
- Checkpoint Beta7 compact original: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/resolve/main/10Eros_Max_h3_8stepTURBO_beta7_activation_learned_compact_w4w6int8_14.65gb.safetensors
- Informe técnico de fix1: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/blob/main/H3_BETA7_FIX1_TURBO_PROXY_ACTIVATION_TECHNICAL_OVERVIEW.md
- Informe técnico de Beta7 original: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/blob/main/beta7/H3_BETA7_TURBO_PROXY_ACTIVATION_TECHNICAL_OVERVIEW.md
- Codificador de texto compacto 15,35 GB: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/resolve/main/text_encoder/qwen3vl_32b_minimax_h3_native_w4g128_w6protected_15.35gb.safetensors
- README del codificador de texto: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/blob/main/text_encoder/README.md
- Modelo base: https://huggingface.co/TenStrip/10Eros-Max
- Licencia MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
