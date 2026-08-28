# henry1477/translategemma-27b-it-NVFP4A16

## Resumen

`henry1477/translategemma-27b-it-NVFP4A16` es una cuantización NVFP4A16 (4 bits de punto flotante NVIDIA) del modelo de traducción `google/translategemma-27b-it`, creada por el usuario henry1477 mediante una receta GPTQ con `llm-compressor`. Se trata de una versión solo texto: se han eliminado la torre de visión y el proyector multimodal del checkpoint original, quedando una arquitectura `Gemma3ForCausalLM` con 27.009.346.304 parámetros (27.01B), frente a los 27.43B del modelo multimodal original. El `lm_head` se excluyó de la cuantización porque Gemma 3 ata esta capa a la tabla de embeddings.

El modelo está diseñado específicamente para traducción de subtítulos con vLLM en hardware NVIDIA Blackwell, usando decodificación JSON restringida y validación independiente de los identificadores de cue. La calibración se realizó con 512 prompts de escenas de producción en 30 idiomas fuente (árabe, búlgaro, catalán, checo, danés, alemán, griego, español, finés, francés, hebreo, hindi, húngaro, indonesio, italiano, japonés, coreano, malayo, neerlandés, noruego, polaco, portugués, rumano, ruso, sueco, tailandés, turco, ucraniano, vietnamita y chino) con destinos en inglés y español latinoamericano. El repositorio pesa 17.3 GB y se distribuye en formato `safetensors` bajo licencia Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma3ForCausalLM (solo texto, sin torre de visión) |
| Parametros totales | 27.009.346.304 (27.01B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base soporta 128K; esta cuantización se probó con max_model_len 4096) |
| Tipos de cuantizacion | NVFP4A16 (compressed-tensors, GPTQ) |
| Idiomas soportados | 30 idiomas fuente (ar, bg, ca, cs, da, de, el, es, fi, fr, he, hi, hu, id, it, ja, ko, ms, nl, no, pl, pt, ro, ru, sv, th, tr, uk, vi, zh) y 2 destinos (en, es-MX) según calibración; el modelo base soporta 55 idiomas |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un derivado cuantizado de `google/translategemma-27b-it`, que a su vez se basa en Gemma 3. La versión original es multimodal (visión y texto), pero esta cuantización elimina los componentes de visión, dejando únicamente el decoder de lenguaje. La cuantización se realizó con `llm-compressor` usando GPTQ y pesos `NVFP4A16` (4 bits de punto flotante NVIDIA) sobre la revisión inmutable `7d10f0b72f89a2d0f268cea30727d8b77c0d25c2` del modelo base. Durante el proceso, 62 módulos (patrón `model.layers.{0..61}.mlp.down_proj`) cayeron a redondeo al más cercano por fallo numérico de Hessian, según informó la herramienta. Se conservaron el processor, la plantilla de chat y la configuración de generación originales, incluidos los tokens EOS `[1, 106]`. No se dispone de información sobre el entrenamiento del modelo base (datos, tokens, RLHF/DPO), más allá de que es un modelo de traducción entrenado por Google.

## Capacidades

- Traducción automática de subtítulos con salida en JSON restringido, pensada para pipelines de producción.
- Generación de texto en 30 idiomas fuente hacia inglés y español latinoamericano (según calibración).
- Soporte de decodificación JSON restringida (constrained JSON decoding) para garantizar la estructura de salida.
- Integración nativa con vLLM, incluyendo parámetros como `limit_mm_per_prompt={"image": 0}` para forzar modo solo texto.
- No incluye capacidades de visión, tool calling, agentes ni razonamiento multi-paso explícito (no documentado).
- Compatible con `text-generation-inference` y endpoints, según los tags del repositorio.

## Casos de uso

- Traducción de subtítulos para plataformas de vídeo: el modelo puede procesar archivos de subtítulos con múltiples cues, generando traducciones en JSON con IDs de cue validables, lo que permite integrarlo en flujos de localización automatizados.
- Localización de contenido audiovisual (series, películas, vídeos educativos): su calibración con escenas de producción y su soporte para 30 idiomas lo hacen adecuado para traducir diálogos manteniendo el contexto de la escena.
- Traducción de transcripciones de reuniones o conferencias: al ser solo texto, puede procesar transcripciones largas (hasta 4096 tokens en el benchmark) y generar resúmenes o traducciones en inglés o español latinoamericano.
- Generación de subtítulos para contenido generado por IA: combinado con un sistema de ASR, puede traducir automáticamente el habla a múltiples idiomas.
- Traducción de documentación técnica o legal: aunque no está específicamente entrenado para ello, su base Gemma 3 le permite manejar texto formal con razonable precisión.
- Despliegue en entornos de producción con vLLM en GPUs Blackwell: su cuantización NVFP4A16 reduce el uso de memoria y acelera la inferencia, permitiendo servir múltiples peticiones concurrentes con baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona artefactos de evidencia de lanzamiento (como `multi-27b.json`, `real-27b-wave1.json`, `metricx-quality.json`), pero no se incluyen los valores numéricos en el README. El único dato concreto es un baseline del modelo 12B del mismo autor, que reporta un Chrf de 95.86 frente a referencia, 494.1 tokens por segundo y 30.456 MiB de VRAM pico, pero no es comparable con esta versión de 27B. No se deben inferir métricas para este checkpoint sin datos verificados.

## Requisitos de hardware

- VRAM estimada: no disponible para esta cuantización. El baseline del modelo 12B del mismo autor usó 30.456 MiB (aproximadamente 30 GB) con vLLM y `gpu_memory_utilization=0.78`. Para el 27B, se espera un consumo mayor, probablemente entre 40 y 60 GB, pero no hay datos confirmados.
- GPU recomendadas: el autor indica que el checkpoint está pensado para NVIDIA Blackwell (por ejemplo, B200, GB200). También podría ejecutarse en GPUs con 48 GB o más (A6000, L40S, etc.), aunque no está verificado.
- En consumer GPU: no se recomienda; con 17.3 GB de pesos, una RTX 4090 (24 GB) podría ser insuficiente para el contexto máximo, aunque podría funcionar con secuencias cortas y baja concurrencia.
- Opciones de despliegue: vLLM (recomendado), también compatible con `text-generation-inference` y endpoints. No se menciona soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponibles para esta versión. El baseline 12B alcanzó 494.1 tokens/s con 4 secuencias concurrentes, pero no es extrapolable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Uso |
|---|---|---|---|---|---|
| `henry1477/translategemma-27b-it-NVFP4A16` | 27.01B | No disponible (base 128K) | NVFP4A16 | Gemma | Traducción subtítulos |
| `google/translategemma-27b-it` | 27.43B | 128K | Original (BF16) | Gemma | Traducción multimodal |
| `henry1477/translategemma-12b-it-NVFP4A16` | ~12B | No disponible | NVFP4A16 | Gemma | Traducción subtítulos (más ligero) |
| `google/translategemma-4b-it` | 4B | 128K | Original | Gemma | Traducción en dispositivos pequeños |

La comparativa se basa en datos públicos de los respectivos repositorios. No se dispone de benchmarks comparativos entre estas versiones.

## Limitaciones y advertencias

- Es una cuantización de 4 bits: puede haber pérdida de calidad respecto al modelo original en tareas fuera del dominio de subtítulos.
- Se eliminó la capacidad de visión: no puede procesar imágenes ni vídeo, solo texto.
- La calibración se realizó exclusivamente con prompts de subtítulos en formato JSON; su rendimiento en otros dominios (traducción literaria, conversación general) no está garantizado.
- El contexto máximo efectivo no está documentado para esta cuantización; el benchmark usó 4096 tokens, pero el modelo base soporta 128K.
- Licencia Gemma: permite uso comercial bajo condiciones específicas (ver términos de Google); es responsabilidad del usuario cumplirlas.
- No se han publicado evaluaciones de sesgos o alucinaciones para esta versión.
- El autor advierte que se debe validar independientemente los IDs de cue en la salida JSON para evitar errores de sincronización en subtítulos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/henry1477/translategemma-27b-it-NVFP4A16
- Modelo base: https://huggingface.co/google/translategemma-27b-it
- Colección TranslateGemma de Google: https://huggingface.co/collections/google/translategemma
- Página de FitMyLLM con specs del modelo base: https://www.fitmyllm.com/model/translategemma-27b
- Página de Ollama para translategemma: https://ollama.com/library/translategemma:27b
- Plataforma de traducción con Gemma 27B: https://gemmatranslate.org/translate/
