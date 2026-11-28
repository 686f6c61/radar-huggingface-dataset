# divinetribe/gemma-4-31b-it-abliterated-4bit-mlx

## Resumen

`divinetribe/gemma-4-31b-it-abliterated-4bit-mlx` es una cuantización de 4 bits en formato MLX del modelo `null-space/gemma-4-31b-it-abliterated`, que a su vez deriva de Gemma 4 31B instruction-tuned de Google con la direccion de rechazo ablacionada (abliteration). El autor, Matt Macosko (divinetribe / nicedreamzapp), lo publica como pieza del stack `claude-code-local`, un entorno que permite ejecutar Claude Code de forma totalmente local sobre Apple Silicon mediante un servidor MLX nativo compatible con la API de Anthropic.

El modelo resuelve un problema concreto: ejecutar un LLM de 31B parámetros sin censura y sin conexión a la nube en un Mac con 32 GB de RAM unificada, o con holgura en 64 GB o más. Frente al BF16 original (~62 GB), esta versión ocupa unos 17,3 GB en disco, lo que la hace viable en hardware consumer de Apple.

La relevancia actual radica en la combinación de tres factores: cuantización MLX de 4 bits con group size 64, abliteration aplicada sobre el modelo base (proyección de la dirección de rechazo según Arditi et al., 2024) y una licencia declarada Apache 2.0 en el repo, aunque el modelo original de Google se distribuye bajo la Gemma 4 License, lo que introduce una ambigüedad legal que conviene revisar antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 4), cuantizado en MLX |
| Parametros totales | 30.697.345.280 (~30,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64 (MLX) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (declarada en el repo); el modelo base de Google referencia la Gemma 4 License |
| Formato de pesos | safetensors MLX (mlx-4bit) |

## Arquitectura y entrenamiento

El modelo es una cuantización, no un entrenamiento nuevo. La arquitectura subyacente corresponde a Gemma 4 31B en su variante instruction-tuned, descrita en los tags como multimodal, aunque la model card no detalla la composición exacta del tower de visión ni la configuración de atención. El proceso de cuantización aplica cuantización afín de 4 bits con group size 64 sobre los pesos BF16 del modelo abliterado, generando safetensors en formato MLX optimizados para Apple Silicon.

Sobre el entrenamiento original no hay información en la documentación proporcionada: no se especifican tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO o fases de instruction tuning posteriores. La innovación técnica destacable es la abliteration: se proyecta fuera del espacio de activaciones la dirección de rechazo identificada por Arditi et al. (2024), de modo que el modelo deja de activar respuestas de negativa ante ciertas peticiones. El autor advierte explícitamente que "you are now the moderator", trasladando la responsabilidad de moderación al usuario.

## Capacidades

- Generación de texto conversacional en inglés con pipeline `text-generation`.
- Razonamiento multi-turno y conversacional (tag `conversational`).
- Capacidad multimodal declarada en los tags (`multimodal`), aunque no se detalla en la model card qué modalidades cubre ni cómo se activan en la versión MLX.
- Comportamiento sin rechazos (uncensored) gracias a la abliteration: no activa negativas ante peticiones que el modelo original rechazaría.
- Uso como agente local: el stack `claude-code-local` lo integra como "fighter" en tareas de agente evaluadas por el leaderboard Agent-12.
- Ejecución on-device sin API key ni conexión a la nube.
- No se documenta soporte explícito de tool calling, function calling ni modo thinking en la información disponible.

## Casos de uso

- Asistente de código local en Mac: integrado en `claude-code-local`, el modelo actúa como backend de un servidor compatible con la API de Anthropic, permitiendo usar Claude Code sin tráfico a la nube en un Mac de 32 GB o más.
- Desarrollo en entornos air-gapped: el autor mantiene una línea "AirGap AI" orientada a flujos legales, sanitarios y NDA, donde la inferencia local elimina la exposición de datos a terceros.
- Investigación sobre abliteration y alineación: sirve como punto de comparación cuantizado para estudiar cómo la eliminación de la dirección de rechazo afecta al comportamiento del modelo en tareas sensibles.
- Prototipado de agentes autónomos en Apple Silicon: con ~15 tok/s en M4 Max, es viable para bucles de agente de varios pasos donde la latencia no es crítica y prima la privacidad.
- Generación de texto creativo sin restricciones: escritura de ficción, guiones o contenido editorial donde las negativas del modelo base resultan un obstáculo.
- Evaluación comparativa de modelos locales: forma parte de la colección "Abliterated MLX for Apple Silicon" (11 modelos, de Gemma 4 12B a Llama 3.3 70B), útil para benchmarks de agente sobre el mismo hardware.
- Sustituto drop-in en pipelines MLX existentes: reemplaza al repo `mlx-community/...` que el autor señala como inexistente en versiones previas del stack.

## Benchmarks y rendimiento

El `model-index` de la model card declara una entrada sin resultados (`results: []`). No se han publicado resultados de benchmarks en la información disponible.

El único dato de rendimiento medido que aporta el autor es el throughput: aproximadamente 15 tok/s en un M4 Max con `mlx-lm` 0.21 o superior.

## Requisitos de hardware

- VRAM/RAM unificada: ~16-17,3 GB en disco; el autor indica que corre cómodamente en un Mac con 32 GB de memoria unificada y "vuela" en 64 GB o más.
- Hardware objetivo: Apple Silicon exclusivamente (M1/M2/M3/M4 y variantes Pro/Max/Ultra), dado el formato MLX.
- No es compatible con GPU NVIDIA/AMD ni con CUDA: el formato MLX no se ejecuta fuera del ecosistema Apple.
- Despliegue: `mlx-lm` (versión 0.21+), o el script `scripts/start-mlx-server.sh` del repo `claude-code-local` para levantar un servidor compatible con la API de Anthropic.
- Throughput medido: ~15 tok/s en M4 Max. No se dispone de cifras para otros chips.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato de pesos es MLX nativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| divinetribe/gemma-4-31b-it-abliterated-4bit-mlx | ~30,7B | no disponible | MLX 4-bit | apache-2.0 (repo) | Apple Silicon |
| null-space/gemma-4-31b-it-abliterated | ~31B (BF16) | no disponible | safetensors BF16 | no disponible | GPU con ~62 GB |
| Gemma 4 31B IT (Google) | ~31B | no disponible | safetensors | Gemma 4 License | GPU / TPU |
| Otros modelos de la colección (Gemma 4 12B, Llama 3.3 70B, Qwen3, Qwen3-VL, Hermes 4, Muse Glimmer 30B) | 12B-70B | no disponible | MLX | variable | Apple Silicon |

La comparación cuantitativa de rendimiento entre estas alternativas no está disponible en la documentación; el autor mantiene el leaderboard Agent-12 con tareas reales de agente sobre el mismo hardware, pero no se aportan cifras en esta ficha.

## Limitaciones y advertencias

- La abliteration elimina la dirección de rechazo, pero no garantiza un comportamiento seguro: el autor traslada explícitamente la responsabilidad de moderación al usuario.
- Riesgo elevado de generar contenido dañino, ilegal o sesgado sin filtro; no apto para despliegues públicos sin una capa de moderación externa.
- Riesgo de alucinación inherente a los LLM; no se han publicado evaluaciones de fidelidad para esta cuantización.
- Idiomas: solo se declara inglés (`en`); el rendimiento en castellano no está verificado.
- Longitud de contexto no documentada; no se puede asumir la ventana del Gemma 4 original sin confirmación.
- Ambigüedad de licencia: el repo declara apache-2.0, pero el modelo base de Google se rige por la Gemma 4 License, que impone restricciones de uso comercial y de redistribución. Verificar antes de producción.
- La cuantización de 4 bits introduce degradación respecto al BF16 original; no hay benchmarks publicados que cuantifiquen esa pérdida.
- Exclusivo de Apple Silicon: no desplegable en infraestructura x86/NVIDIA sin reconversión de formato.
- La model card contiene enlaces de afiliación y promoción del autor; tratar las afirmaciones de rendimiento como no auditadas de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/gemma-4-31b-it-abliterated-4bit-mlx
- Modelo base: https://huggingface.co/null-space/gemma-4-31b-it-abliterated
- Colección "Abliterated MLX for Apple Silicon": https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon
- Repo `claude-code-local`: https://github.com/nicedreamzapp/claude-code-local
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Modelos del autor: https://nicedreamzwholesale.com/software/huggingface/
- AirGap AI: https://nicedreamzwholesale.com/airgap/
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper de abliteration (Arditi et al., 2024): no disponible en la información proporcionada
