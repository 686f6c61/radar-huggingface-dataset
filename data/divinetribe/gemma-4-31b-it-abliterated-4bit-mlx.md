# divinetribe/gemma-4-31b-it-abliterated-4bit-mlx

## Resumen

`divinetribe/gemma-4-31b-it-abliterated-4bit-mlx` es una cuantización de 4 bits en formato MLX del modelo `null-space/gemma-4-31b-it-abliterated`, a su vez una versión "abliterada" (con la dirección de rechazo proyectada fuera del espacio de activaciones, siguiendo el método de Arditi et al. 2024) de Gemma 4 31B en su variante instruct. El resultado es un modelo de lenguaje de ~30.700 millones de parámetros, sin censura conductual, empaquetado para inferencia local en Apple Silicon mediante la librería `mlx-lm`. Lo publica el desarrollador independiente Matt Macosko (usuario `divinetribe`), autor del stack `claude-code-local`.

La relevancia práctica del modelo es doble. Por un lado, permite ejecutar un modelo de 31B en un MacBook con 32 GB de memoria unificada, algo imposible con los pesos BF16 originales (~62 GB); por otro, elimina los rechazos del modelo instruct de Google, lo que lo hace útil para entornos de investigación, red teaming y flujos de trabajo donde el modelo actúa como agente autónomo sin fricciones de moderación. La cuantización es afín de 4 bits con grupo de tamaño 64 y ocupa unos 17,3 GB en disco.

El modelo conserva la etiqueta `multimodal` de su base (Gemma 4 es una familia multimodal), aunque la model card no documenta explícitamente el pipeline de visión ni se han publicado evaluaciones que lo confirmen en esta versión cuantizada. La licencia declarada es Apache 2.0, aunque la model card enlaza a la licencia propia de Gemma 4 de Google, lo que introduce una ambigüedad legal que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4); detalles de atención y capas no disponibles |
| Parametros totales | 30.697.345.280 (~30,7 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64 (MLX) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | MLX safetensors |
| Tamano en disco | ~17,3 GB (repo); ~16 GB segun la model card |
| Modelo base | null-space/gemma-4-31b-it-abliterated (BF16, ~62 GB) |
| Libreria | mlx-lm (0.21+) |
| Hardware objetivo | Apple Silicon (memoria unificada) |
| Throughput medido | ~15 tok/s en M4 Max |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 31B en variante instruct, un transformer denso de ~30,7 B de parámetros. La model card no detalla el número de capas, la configuración de atención (ventanas locales/globales, GQA, etc.) ni la longitud de contexto nativa, por lo que esos datos deben consultarse en la documentación oficial de Gemma 4. El modelo base fue sometido a *abliteration*: se calcula la dirección media de rechazo en el espacio de activaciones y se proyecta fuera de las matrices de pesos, de modo que el modelo pierde el comportamiento de negativa sin reentrenamiento supervisado ni RLHF adicional.

La contribución de esta ficha concreta es exclusivamente la cuantización: pesos convertidos a 4 bits afines con grupo de 64 mediante `mlx-lm`, empaquetados en safetensors MLX. No hay información sobre el dataset de entrenamiento original de Gemma 4, el número de tokens, la composición de datos ni las fases de alineación (RLHF/DPO), más allá de lo que publique Google en su documentación. Tampoco se documenta ninguna innovación de inferencia (decodificación especulativa, atención lineal) en esta versión.

## Capacidades

- Generación de texto conversacional en inglés, con modo instruct.
- Razonamiento y resolución de tareas de código y matemáticas (capacidad heredada del modelo base; sin métricas publicadas en esta versión).
- Capacidad multimodal potencial (etiqueta `multimodal` heredada de Gemma 4), aunque no se documenta el pipeline de visión en esta cuantización.
- Sin comportamiento de rechazo: la abliteración elimina las negativas del modelo instruct, útil para investigación de seguridad y red teaming.
- Soporte de tool calling y function calling: no documentado explícitamente en la model card; debe validarse empíricamente.
- Soporte de agentes multi-paso: el modelo se integra en el stack `claude-code-local` como uno de los "fighters" del leaderboard Agent-12, lo que sugiere uso agéntico, aunque sin garantías formales.
- Idiomas: solo inglés declarado.

## Casos de uso

- **Inferencia local en MacBook con 32 GB**: el modelo cabe en memoria unificada con margen (~17 GB de pesos), permitiendo ejecutar un 31B sin GPU dedicada ni conexión a la nube. Adecuado para desarrolladores que quieren privacidad total.
- **Agente de código en local**: integrado en `claude-code-local` mediante un servidor MLX con API compatible con Anthropic, permite usar Claude Code con un modelo local sin claves de API. La abliteración evita que el agente se bloquee ante peticiones legítimas de refactorización o análisis de código sensible.
- **Investigación en seguridad de IA**: la versión abliterada es una herramienta estándar para estudiar direcciones de rechazo, medir la robustez de la alineación y comparar comportamientos antes y después de la proyección (Arditi et al. 2024).
- **Red teaming y evaluación de salvaguardas**: sirve para generar respuestas que un modelo alineado rechazaría, permitiendo auditar filtros y clasificadores de contenido en pipelines de moderación.
- **Procesamiento de documentos confidenciales (legal, sanitario, NDA)**: el autor promociona el stack AirGap AI para flujos con requisitos de confidencialidad; el modelo corre 100% on-device, sin telemetría ni llamadas externas.
- **Prototipado rápido de aplicaciones conversacionales en Apple Silicon**: con `mlx-lm` y ~15 tok/s en M4 Max, es viable para demos interactivas, generación de texto asistida y pruebas de UX sin coste de API.
- **Fine-tuning ligero o LoRA sobre MLX**: al estar en formato MLX safetensors, se puede adaptar con las herramientas de `mlx-lm` en hardware Apple, aunque el modelo base abliterado ya está modificado.

## Benchmarks y rendimiento

El `model-index` del autor declara una entrada sin resultados (`results: []`). No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento medido es el throughput de inferencia: **~15 tok/s en un M4 Max** con `mlx-lm` 0.21+.

## Requisitos de hardware

- **VRAM/memoria unificada estimada**: ~17 GB para los pesos en 4-bit; con overhead de contexto y KV cache, se recomienda un mínimo de 24-32 GB de memoria unificada. La model card indica que "corre cómodamente en un Mac de 32 GB y vuela en 64 GB+".
- **GPU recomendadas**: Apple Silicon exclusivamente (M1/M2/M3/M4 en variantes Pro, Max o Ultra). No es compatible con CUDA ni con GPUs NVIDIA/AMD.
- **¿Cabe en consumer GPU?**: no aplica en el sentido tradicional; está pensado para Macs. En un Mac con 32 GB de memoria unificada funciona; en 16 GB no cabe.
- **Opciones de despliegue**: `mlx-lm` (librería principal), servidor MLX del stack `claude-code-local` (API compatible con Anthropic), y cualquier herramienta que consuma safetensors MLX. No es compatible con vLLM, llama.cpp, Ollama ni TGI en su forma actual.
- **Latencia y throughput**: ~15 tok/s en M4 Max según el autor. En chips inferiores (M1/M2 base) el rendimiento será notablemente menor; no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| divinetribe/gemma-4-31b-it-abliterated-4bit-mlx | ~30,7 B | no disponible | MLX 4-bit | apache-2.0 (ambiguo) | Apple Silicon |
| null-space/gemma-4-31b-it-abliterated | ~30,7 B | no disponible | BF16 safetensors | no disponible | GPU con ~62 GB+ |
| Gemma 4 31B IT (original de Google) | ~30,7 B | no disponible | safetensors | licencia Gemma 4 | GPU / TPU |
| Otros modelos abliterados MLX de la colección divinetribe (Gemma 4 12B, Llama 3.3 70B, Qwen3, Qwen3-VL, Hermes 4, Muse Glimmer 30B) | 12 B – 70 B | variable | MLX 4-bit | variable | Apple Silicon |

La comparación directa con alternativas de la misma categoría (modelos abliterados cuantizados para Apple Silicon) está limitada por la ausencia de benchmarks publicados. La colección del propio autor ofrece alternativas de menor tamaño (Gemma 4 12B) para Macs de 16 GB y de mayor tamaño (Llama 3.3 70B) para equipos de 64 GB+.

## Limitaciones y advertencias

- **Sin moderación**: la abliteración elimina el comportamiento de rechazo; el modelo puede generar contenido dañino, ilegal o sesgado. La responsabilidad de moderación recae en el desplegador ("you are now the moderator", según el autor).
- **Sesgos heredados**: al no haber reentrenamiento, conserva los sesgos del corpus de Gemma 4 y los posibles artefactos introducidos por la proyección de la dirección de rechazo.
- **Riesgo de alucinación**: no se han publicado evaluaciones de fidelidad factual; se asume el riesgo típico de un modelo de 31B sin verificación.
- **Idioma**: solo inglés declarado; el rendimiento en castellano no está garantizado ni evaluado.
- **Contexto**: la longitud de contexto no está documentada en esta ficha; debe consultarse en la documentación de Gemma 4.
- **Ambigüedad de licencia**: la etiqueta es `apache-2.0`, pero la model card enlaza a la licencia de Gemma 4 de Google, que impone restricciones de uso comercial y de redistribución. Verificar antes de producción.
- **Hardware restringido**: exclusivo de Apple Silicon; no ejecutable en CUDA, ROCm ni CPU convencional con las herramientas estándar.
- **Multimodalidad no verificada**: la etiqueta `multimodal` proviene del modelo base, pero no se documenta el pipeline de visión en esta cuantización.
- **Tool calling no documentado**: no hay garantías de soporte de function calling en esta versión; validar empíricamente antes de integrarlo en agentes.
- **Mantenimiento**: proyecto de un desarrollador independiente; sin SLA ni soporte formal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/gemma-4-31b-it-abliterated-4bit-mlx
- Modelo base: https://huggingface.co/null-space/gemma-4-31b-it-abliterated
- Repositorio `claude-code-local`: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- Colección Abliterated MLX for Apple Silicon: https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon
- Modelos del autor: https://nicedreamzwholesale.com/software/huggingface/
- Stack AirGap AI: https://nicedreamzwholesale.com/airgap/
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper de abliteration (Arditi et al. 2024): no disponible en la información proporcionada (referenciado en la model card sin enlace directo)
