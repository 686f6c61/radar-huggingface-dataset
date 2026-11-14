# johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-abliterated-HGN

## Resumen

ThinkingCap-Qwen3.8-Flash-Next-abliterated-HGN es una conversión al formato nativo Halogen (`.hgn`) del modelo `bottlecapai/ThinkingCap-Qwen3.8-Flash-Next`, publicada por el usuario `johnlockejrr`. El modelo base es un post-entrenamiento de Qwen3.8-Flash-Next (arquitectura MoE de Qwen) orientado a reducir el número de tokens de razonamiento: según el autor upstream, ThinkingCap consume aproximadamente un 38,5 % menos de tokens de "thinking" con una precisión del 88,8 % frente al 89,8 % del modelo base. Sobre esa base se aplica una "abliteración por transferencia de dirección" que proyecta un vector de rechazo auditado sobre 149 writers residuales, eliminando (empíricamente) parte del comportamiento de rechazo.

La relevancia de esta ficha es doble. Por un lado, documenta un pack cuantizado en un formato propietario (Halogen) que **no carga en Transformers, vLLM ni llama.cpp**: solo funciona en `halogen-flash-server`. Por otro, ilustra una práctica creciente en el ecosistema open source: publicar variantes "abliterated" de modelos base para eliminar rechazos, con el coste potencial de degradar capacidades y sin benchmarks verificables publicados.

El resultado es un artefacto de ~111 GiB (62,11 GiB de trunk con MTP embebido, 47,68 GiB de tabla N-gram obligatoria y 0,84 GiB de torre de visión opcional), pensado para despliegue en servidor con GPU CUDA y runtime Halogen. No hay datos de benchmarks propios ni evaluación de la abliteración publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts) tipo Qwen3.8-Flash-Next, con MTP (multi-token prediction) embebido y torre de visión opcional |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | HGN profile v2, política `bf16-hgn-v2-rtn-nf4-signed-rms-trellis-v1` (RTN NF4, sin calibración GPTQ); pesos BF16 de origen |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (declarada como `other` en la model card) |
| Formato de pesos | Halogen `.hgn` (no compatible con safetensors, GGUF ni Transformers) |
| Tamaño del repo | 118,8 GB |
| Desglose de ficheros | `model.hgn` 62,11 GiB (trunk + MTP), `qwen38-flash-next-ngram.hgn` 47,68 GiB (obligatorio), `qwen38-flash-next-vision.hgn` 0,84 GiB (opcional) |
| Runtime requerido | `halogen-flash-server` (o runtime Halogen equivalente) |
| Librería declarada | `halogen` |
| Pipeline | `text-generation` |
| Inferencia en Transformers/vLLM/llama.cpp | no (formato incompatible) |

## Arquitectura y entrenamiento

El modelo base, ThinkingCap-Qwen3.8-Flash-Next, es un post-entrenamiento de Qwen3.8-Flash-Next (arquitectura MoE de la familia Qwen) que incorpora MTP (multi-token prediction) en el trunk y una torre de visión opcional. ThinkingCap se presenta como un ajuste orientado a "thinking eficiente": reduce el número de tokens de razonamiento en aproximadamente un 38,5 % manteniendo una precisión del 88,8 % frente al 89,8 % del base, según cifras del autor upstream. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO específico.

Sobre ese base, `johnlockejrr` aplica dos transformaciones. Primero, una **abliteración por transferencia de dirección**: toma el vector de rechazo auditado `r` (2560-d) publicado por Quat3rnion en su manifest de Swift abliteration para Qwen3.8-Flash-Next, y lo proyecta sobre los 149 "residual writers" de ThinkingCap (salidas de atención, downs de expertos, downs compartidos, writers MTP, valor PLE y embeddings), copiando el resto sin cambios. Esto se ejecuta en CPU/NumPy sobre BF16, sin cargar el modelo en GPU. Segundo, una **conversión a HGN** con `bf16-to-hgn` 0.1.0 (CUDA, `HGN_CUDA_ARCH=86`), perfil v2, política `bf16-hgn-v2-rtn-nf4-signed-rms-trellis-v1`, sin calibración GPTQ. El autor indica explícitamente que esta abliteración no es un run completo de heretic/Optuna sobre ThinkingCap, sino un "implante de dirección" de la misma arquitectura, validado previamente para finetunes estilo Swift.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" eficiente (menos tokens de razonamiento que el base, según el autor upstream).
- Capacidad de visión a través de la torre opcional (`HALOGEN_VISION_TOWER=1`).
- MTP (multi-token prediction) embebido para decodificación especulativa interna.
- Tabla N-gram obligatoria, presumiblemente para decodificación asistida por N-gram.
- Comportamiento de rechazo reducido empíricamente por la abliteración (no verificado con benchmarks propios).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (idiomas no listados).
- Capacidades de audio: no disponible.

## Casos de uso

- **Investigación sobre abliteración**: comparar el comportamiento de rechazo de este pack frente al hermano sin abliterar (`ThinkingCap-Qwen3.8-Flash-Next-HGN`) y frente al calibrado RCO, para medir el coste real de la eliminación de rechazos en tareas de seguridad y alineación.
- **Despliegue en servidor Halogen**: montar el pack en un contenedor `halogen-flash-server` para servir generación de texto con MTP y N-gram activados, aprovechando las optimizaciones específicas del runtime (no disponibles en vLLM ni llama.cpp).
- **Razonamiento eficiente en producción**: usar el modelo base ThinkingCap (con su ~38,5 % de reducción de tokens de thinking) para reducir coste por consulta en pipelines de razonamiento donde el presupuesto de tokens es crítico.
- **Procesamiento multimodal ligero**: activar la torre de visión opcional (0,84 GiB) para tareas de descripción de imágenes o extracción de información visual combinadas con texto.
- **Evaluación de formatos propietarios**: estudiar el formato `.hgn` y la política de cuantización `rtn-nf4-signed-rms-trellis-v1` como caso práctico de cuantización sin calibración frente a GPTQ calibrado.
- **Red teaming y estudios de seguridad**: emplear la variante abliterated como sujeto de pruebas para medir la robustez de filtros externos y la eficacia de la abliteración por transferencia de dirección en arquitecturas MoE.
- **Reproducibilidad de pipelines de conversión**: replicar el flujo `bf16-to-hgn` con perfil v2 y comparar hashes SHA-256 de los payloads `.hgn` para verificar conversiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks propios en la información disponible. El autor upstream de ThinkingCap reporta las siguientes cifras agregadas, sin desglose por benchmark:

| Métrica | ThinkingCap (upstream) | Base (Qwen3.8-Flash-Next) |
|---|---|---|
| Tokens de thinking | ~38,5 % menos | referencia |
| Precisión agregada | ~88,8 % | ~89,8 % |

No hay datos de MMLU, HumanEval, GSM8K ni de evaluación de la abliteración en la información proporcionada. El autor advierte que la eliminación de rechazos es "empírica / no verificada" hasta que se re-benchmarkee.

## Requisitos de hardware

- **VRAM estimada**: el pack completo son ~111 GiB en disco; el trunk `model.hgn` son 62,11 GiB. Se requiere una GPU con al menos ~62 GiB de VRAM para el trunk (A100 80 GB, H100 80 GB, H200, o GPUs con suficiente memoria); la tabla N-gram de 47,68 GiB puede residir en RAM o VRAM según configuración del runtime Halogen (no especificado).
- **GPU recomendadas**: A100 80 GB, H100 80 GB, H200. El autor menciona `HGN_CUDA_ARCH=86` en la conversión, lo que apunta a Ampere (A100, RTX 3090) o superior; no se confirma compatibilidad con Ada (89) o Hopper (90) en la información disponible.
- **Consumer GPU**: no cabe en RTX 4090 (24 GB) ni en GPUs consumer de 24-48 GB. No se documenta una variante menor.
- **Opciones de despliegue**: exclusivamente `halogen-flash-server` (o runtime Halogen equivalente). No compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers.
- **Latencia y throughput**: no disponibles. El pack incorpora MTP embebido y tabla N-gram, lo que sugiere optimizaciones de decodificación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño | Contexto | Licencia | Runtime | Notas |
|---|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-Flash-Next-abliterated-HGN (este) | `.hgn` | ~111 GiB | no disponible | qwen-community-license-1.0 | halogen-flash-server | Abliterado por transferencia de dirección, sin calibrar |
| ThinkingCap-Qwen3.8-Flash-Next-HGN | `.hgn` | no disponible | no disponible | qwen-community-license-1.0 | halogen-flash-server | Sin abliterar, pack hermano |
| ThinkingCap-Qwen3.8-Flash-Next-calibrated-rco-HGN | `.hgn` | no disponible | no disponible | qwen-community-license-1.0 | halogen-flash-server | Calibrado RCO, pack hermano |
| bottlecapai/ThinkingCap-Qwen3.8-Flash-Next | safetensors BF16 | ~131 shards | no disponible | qwen-community-license-1.0 | Transformers, vLLM, TGI | Base upstream, sin cuantizar |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | no disponible | no disponible | no disponible | no disponible | no disponible | Fuente del vector de rechazo usado en la abliteración |

La comparativa con modelos de otros ecosistemas (Llama, Mistral, DeepSeek) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **Formato propietario**: los pesos `.hgn` no cargan en Transformers, vLLM, llama.cpp ni Ollama. El despliegue queda atado al runtime Halogen, lo que limita portabilidad y opciones de serving.
- **Abliteración no verificada**: el propio autor advierte que la eliminación de rechazos es "empírica / no verificada" y "puede costar capacidad". No hay benchmarks que cuantifiquen la degradación.
- **Método no nativo**: no es un run completo de heretic/Optuna sobre ThinkingCap, sino un implante de dirección sobre 149 writers. El autor lo describe como "mejor que un swap de tensores orca crudo, pero no tan nativo como heretic-on-ThinkingCap".
- **Sin calibración GPTQ**: la conversión usa la política por defecto (RTN NF4), no `--quality calibrated`. El autor justifica que el ThinkingCap HGN plano ya superaba al calibrado en su board de tool-eval, pero no aporta cifras.
- **Riesgo de alucinación**: no evaluado en la información disponible; el modelo base es un LLM de texto con modo thinking, sujeto a los riesgos habituales.
- **Sesgos**: no documentados. La abliteración puede alterar el comportamiento en temas sensibles sin que se haya medido el efecto en sesgos.
- **Idiomas**: no listados. No se puede confirmar soporte multilingüe ni calidad por idioma.
- **Licencia**: `qwen-community-license-1.0` (declarada como `other`). Es una licencia con restricciones, no una licencia open source permisiva; revisar términos antes de uso comercial.
- **Tamaño**: ~111 GiB en disco y ~62 GiB de trunk en VRAM hacen inviable el despliegue en hardware consumer.
- **Repo sin tracción**: 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.
- **Contexto**: longitud de contexto no disponible; no se puede planificar su uso en tareas de contexto largo.

## Enlaces

- Hugging Face (este pack): https://huggingface.co/johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-abliterated-HGN
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next
- Pack hermano sin abliterar: https://huggingface.co/johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-HGN
- Pack hermano calibrado RCO: https://huggingface.co/johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-calibrated-rco-HGN
- Fuente del vector de rechazo (Swift abliteration de Quat3rnion): https://huggingface.co/Quat3rnion/halogen-swift1.5-qwen3.8-flash-next-v2-abliterated/tree/main/abliteration
- Modelo uncensored usado para derivar la dirección: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Runtime Halogen: https://github.com/peonist-ai/halogen-flash-server
- Blog de BottleCap AI sobre ThinkingCap: https://bottlecapai.com/post/thinkingcap-qwen3-8-flash-next/
- Web de BottleCap AI: https://www.bottlecapai.com/
