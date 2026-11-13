# johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-calibrated-rco-HGN

## Resumen

ThinkingCap-Qwen3.8-Flash-Next-calibrated-rco-HGN es una conversión cuantizada del fine-tune BF16 [bottlecapai/ThinkingCap-Qwen3.8-Flash-Next](https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next), publicado por el usuario johnlockejrr. El modelo base es, a su vez, un post-entrenamiento de Qwen3.8-Flash-Next orientado a reducir la longitud del razonamiento (thinking) manteniendo la precisión. Esta ficha describe la variante en formato nativo Halogen `.hgn`, calibrada con Hessians por experto para la cuantización GPTQ de los expertos enrutados I4R.

La relevancia de este artefacto es fundamentalmente de infraestructura: no es un modelo nuevo ni un reentrenamiento, sino un paquete de pesos cuantizados listo para montarse en un runtime Halogen (halogen-flash-server). El pack aplica una política de calibración denominada RCO, que equilibra corpus general, dominios MoE, chat y trazas agénticas con un suelo mínimo de prosa general, corrigiendo una calibración anterior demasiado sesgada hacia agentes.

El repositorio ocupa unos 118,8 GB e incluye el tronco del modelo con MTP embebido, una tabla n-gram obligatoria, una torre de visión opcional, tokenizer, configuración y manifiesto de conversión. Al ser un formato propietario de Halogen, no es cargable en Transformers, vLLM ni llama.cpp.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con MTP embebido y torre de visión opcional; derivado de Qwen3.8-Flash-Next |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | I4R (GPTQ calibrado) para expertos enrutados; políticas HT / Q4C-P para el resto; formato nativo Halogen `.hgn` |
| Idiomas soportados | no disponible (el corpus de calibración incluye componentes multilingües, pero no se especifican idiomas soportados) |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en el Hub) |
| Formato de pesos | Halogen `.hgn` (no safetensors, no GGUF); requiere runtime Halogen |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de mezcla de expertos (MoE) de la familia Qwen3.8-Flash-Next, sobre el que BottleCap AI aplicó un post-entrenamiento orientado a eficiencia de razonamiento (ThinkingCap), reportando una reducción media de ~38,5% en tokens de thinking (rango aproximado de 22–51% según benchmark) con una precisión de ~88,8% frente a ~89,8% del base. No se dispone de detalles sobre el número de parámetros, composición exacta del dataset de post-entrenamiento ni si se empleó RLHF o DPO.

Esta variante concreta no reentrena el modelo: recuantiza el checkpoint BF16 (131 shards) mediante la herramienta `bf16-to-hgn 0.1.0` (build CUDA, `HGN_CUDA_ARCH=86`), perfil v2, calidad `calibrated`, política `bf16-hgn-v2-calibrated-gptq-i4r-v1`. La calibración recoge Hessians en bloque diagonal por experto sobre ~946k tokens (462×2048) generados con `--calib-profile rco`, con `block_size 128`, cobertura suave del router y `--gptq-layer-boost none` para no confundir efectos del corpus con boosts por capa. El blend RCO combina aproximadamente: WikiText ~15%, `pile-calibration-v5` ~12%, UltraChat ~5%, RazorCal ~28% (math/code/STEM/tools), PerfectBlend ~25% (chat/instrucción), trazas Cursor de TeichAI ~8% y razonamiento Sonnet ~5%, más ~2% de diálogo semilla. El sidecar reportó cobertura completa de expertos (24 576 / 24 576 claves con ≥256 tokens enrutados) y sin claves frías. Respecto al pack sin calibrar, solo cambian los códigos I4R de los expertos enrutados; las políticas HT, Q4C-P, visión y n-gram se mantienen idénticas a v2.

## Capacidades

- Generación de texto y razonamiento con modo thinking acortado (eficiencia de tokens de razonamiento respecto al base).
- Capacidades de matemáticas, código y STEM inferidas del perfil de calibración (RazorCal) y de la familia Qwen3.8, aunque no se documentan explícitamente en la información disponible.
- Soporte de tool calling y function calling: el pack incluye corpus de herramientas y trazas agénticas en la calibración, y el modelo upstream está orientado a uso con herramientas.
- Razonamiento multi-paso y uso en agentes: se incluyen trazas de Cursor y razonamiento Sonnet en el blend de calibración.
- Capacidades multilingües: el blend incluye componentes multilingües, pero no se enumeran idiomas soportados.
- Visión: torre de visión opcional incluida (`qwen38-flash-next-vision.hgn`, 0,84 GiB), activable con `HALOGEN_VISION_TOWER=1`.
- Tabla n-gram obligatoria (`qwen38-flash-next-ngram.hgn`, 47,68 GiB) para decodificación asistida por n-gram.
- MTP (multi-token prediction) embebido en `model.hgn`, sin fichero `mtp.hgn` separado.

## Casos de uso

- Despliegue en infraestructura Halogen: montar los tres payloads `.hgn` en un contenedor halogen-flash-server para servir el modelo con decodificación asistida por n-gram y MTP. Es el único escenario de despliegue posible dado el formato.
- Razonamiento eficiente en producción: usar el post-entrenamiento ThinkingCap para reducir el coste de tokens de thinking (~38,5% menos de media) en tareas de razonamiento, manteniendo precisión cercana al base.
- Asistentes con tool calling: aprovechar el soporte de herramientas y la calibración con corpus de tools para agentes que invocan APIs y funciones en pipelines internos.
- Automatización agéntica de código: emplear las trazas de Cursor incluidas en la calibración para tareas de edición y navegación de repositorios, con la cautela de que el cap de trazas agénticas limita su peso en el blend.
- Procesamiento multimodal ligero: activar la torre de visión opcional para tareas de descripción de imágenes o documentos escaneados en el mismo runtime.
- Evaluación comparativa de cuantización: usar este pack calibrado frente al pack sin calibrar (`ThinkingCap-Qwen3.8-Flash-Next-HGN`) para medir el impacto de la calibración GPTQ I4R en tareas locales de tool-eval.
- Sustitución de despliegues BF16 en memoria: el pack de ~111 GiB permite servir el modelo en el mismo clase de despliegue que otros packs Flash-Next Halogen v2, reduciendo el footprint frente al BF16 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este pack cuantizado. El modelo upstream reporta, según su model card, ~38,5% menos tokens de thinking (22–51% por benchmark) con ~88,8% de precisión frente a ~89,8% del base, pero no se detallan las tablas por benchmark en la información proporcionada.

## Requisitos de hardware

- Espacio en disco: ~111 GiB para los tres payloads `.hgn` (62,11 GiB `model.hgn` + 47,68 GiB n-gram + 0,84 GiB visión), más tokenizer, config y manifiesto; el repo completo ocupa 118,8 GB.
- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño de los pesos sugiere un despliegue en clase de servidor con múltiples GPU, no en consumer GPU.
- GPU recomendadas: no especificadas. La conversión se compiló con `HGN_CUDA_ARCH=86` (arquitectura Ampere), lo que apunta a GPUs como A100/A10 o superiores; no se confirma soporte en otras arquitecturas.
- ¿Cabe en consumer GPU? No hay datos que lo confirmen; por el tamaño del pack y la naturaleza del runtime, es improbable en GPUs de consumo individuales.
- Opciones de despliegue: exclusivamente halogen-flash-server (o runtime Halogen equivalente). No es compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Calibración | Tamaño repo | Licencia | Runtime |
|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-Flash-Next-calibrated-rco-HGN (este) | Halogen `.hgn` | GPTQ I4R calibrado, blend RCO | 118,8 GB | qwen-community-license-1.0 | halogen-flash-server |
| ThinkingCap-Qwen3.8-Flash-Next-HGN | Halogen `.hgn` | Sin calibración | no disponible | qwen-community-license-1.0 | halogen-flash-server |
| Qwen3.8-Flash-Next-calibrated-HGN | Halogen `.hgn` | GPTQ I4R calibrado (stock) | no disponible | qwen-community-license-1.0 | halogen-flash-server |
| bottlecapai/ThinkingCap-Qwen3.8-Flash-Next | safetensors BF16 | No aplica | 131 shards | qwen-community-license-1.0 | Transformers, vLLM, etc. |

No se dispone de datos de rendimiento comparativo entre estos packs en la información proporcionada.

## Limitaciones y advertencias

- Formato propietario: los pesos `.hgn` no cargan en Transformers, vLLM, llama.cpp ni herramientas estándar; requieren halogen-flash-server o runtime Halogen equivalente.
- Dependencia obligatoria de la tabla n-gram: `qwen38-flash-next-ngram.hgn` debe mantenerse junto al checkpoint; sin ella el despliegue no es funcional.
- Licencia: qwen-community-license-1.0, etiquetada como `other` en el Hub; es necesario revisar los términos para uso comercial, ya que impone condiciones específicas de la comunidad Qwen.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan evaluaciones específicas de factualidad para este pack.
- Sesgos: no documentados; el blend de calibración incluye fuentes diversas (WikiText, Pile, UltraChat, PerfectBlend, trazas de Cursor y Sonnet), pero no se analizan sesgos resultantes.
- Idiomas: no se enumeran idiomas soportados; el componente multilingüe de la calibración no garantiza cobertura específica.
- Contexto: no se especifica la longitud de contexto del modelo base en la información disponible.
- Calibración parcial: solo cambian los códigos I4R de expertos enrutados con suficientes tokens de calibración; los expertos fríos o con pocas muestras caerían a Optimal, aunque este collect no tuvo claves frías.
- Procedencia: el autor del pack es un usuario individual (johnlockejrr), no el desarrollador original (BottleCap AI); conviene verificar los hashes SHA-256 incluidos antes de desplegar.
- El pack no es un reentrenamiento ni una ablación (abliteration); las capacidades de comportamiento son las del checkpoint ThinkingCap BF16.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-calibrated-rco-HGN
- Modelo base (ThinkingCap BF16): https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next
- Modelo base original (Qwen3.8-Flash-Next): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Pack ThinkingCap v2 sin calibrar: https://huggingface.co/johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-HGN
- Pack stock Flash-Next calibrado: https://huggingface.co/johnlockejrr/Qwen3.8-Flash-Next-calibrated-HGN
- Runtime halogen-flash-server: https://github.com/peonist-ai/halogen-flash-server
- Blog de BottleCap AI sobre ThinkingCap: https://bottlecapai.com/post/thinkingcap-qwen3-8-flash-next/
- Web de BottleCap AI: https://www.bottlecapai.com/
- Metodología de mezcla RCO de referencia: https://github.com/lapadatbogdan/GLM-5.3-Flash-Coder-RCO-152E/tree/main/calib53
