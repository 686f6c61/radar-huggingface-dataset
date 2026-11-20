# hanzoai/zen6-nano

## Resumen

Zen 6 Nano (`hanzoai/zen6-nano`) es un modelo de lenguaje multimodal y orientado a agentes, publicado por Hanzo AI en colaboración con Zen LM y Zoo Labs Foundation bajo licencia Apache 2.0. Su rasgo diferencial es que se distribuye como pesos ternarios de 1,58 bits (valores {-d, 0, +d}) post-entrenados directamente en ese espacio mediante Quantization-Aware Training con Straight-Through Estimator, lo que permite ejecutar variantes de 9B, 4B y 2B parámetros en ficheros GGUF de entre 429 MB y 2,68 GB.

El modelo se ofrece en varias tallas (9B por defecto, más tiers de 4B y 2B para CPU, CI y edge) y en tres formatos propietarios de cuantización: PQ2_0 (2,125 bpw), PTQ1_0 (1,750 bpw) y Q2_0 (2,250 bpw). Está pensado para tool calling multi-paso vía MCP, razonamiento agéntico con recuperación de errores y entrada image-text-to-text gracias a un proyector visual `mmproj` separado.

La relevancia actual del modelo reside en su propuesta de "zero-token-burn": la variante de 2B en PTQ1_0 ocupa 429 MB y puede servirse en runners de CPU de GitHub Actions para tests de integración de LLM y tool calling sin coste por token ni claves de API. El repositorio declara 1.881.825.088 parámetros reales en safetensors y un tamaño total de 18,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated-DeltaNet (atención lineal) intercalada 3x con atención completa GQA 1x, MLP SwiGLU y proyector visual multimodal |
| Parametros totales | 1.881.825.088 (dato safetensors); el autor describe tiers de 9B, 4B y 2B |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria 1,58-bit: PQ2_0 (2,125 bpw), PTQ1_0 (1,750 bpw), Q2_0 (2,250 bpw); Q8_0 y BF16 para proyector y cabezas especulativas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp y hanzo-engine); MLX 2-bit para Apple Silicon; safetensors referenciados en metadatos |

## Arquitectura y entrenamiento

El backbone es un transformer híbrido que intercala bloques de atención lineal Gated-DeltaNet (tres por cada bloque de atención completa) con atención completa agrupada (GQA) y MLPs SwiGLU. Los pesos lineales y los embeddings de tokens se almacenan en una base ortonormal Sylvester-Walsh-Hadamard, con vectores de signo ±1 por canal embebidos en los metadatos GGUF (`prism.hadamard.*`). Según el autor, esta rotación elimina los outliers de activación y permite que los pesos ternarios por grupo de 128 mantengan precisión densa.

El post-entrenamiento se realiza directamente en el espacio ternario mediante QAT con Straight-Through Estimator, usando un optimizador híbrido Muon + AdamW. No se detalla el volumen de tokens de preentrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El modelo preserva atribución upstream a Qwen (Alibaba Cloud), Bonsai-2 (Prism ML) y DFlash / ProCreations, lo que sugiere una base derivada de la familia Qwen 3.5 (etiqueta `qwen3_5` en los tags).

Entre las innovaciones declaradas figuran Multi-Token Prediction (cabeza especulativa MTP), DFlash2 como draft de difusión por bloques, `SA_SPEC` (lookup por autómata de sufijos) y `GuardedDraft` para decodificación especulativa, todo integrado en el runtime `hanzo-engine` con soporte CUDA, Metal, ROCm, Vulkan y CPU.

## Capacidades

- Generación de texto conversacional multi-turno con persona nativa sin sobrecarga de system prompt.
- Tool calling multi-paso con ejecución de `<tool_call>`, síntesis de `<tool_response>`, recuperación de errores y abstención calibrada de herramientas.
- Integración con Hanzo MCP sobre conjuntos de herramientas `fs`, `exec`, `code`, `git`, `test`, `hanzo` y director de motores de juego.
- Entrada multimodal image-text-to-text mediante proyector visual `mmproj` en Q8_0 o BF16.
- Capacidades agénticas con razonamiento multi-paso y encadenamiento de llamadas a herramientas.
- Compatibilidad con API OpenAI `/v1/chat/completions` en el stack local de Hanzo.
- Respeto de personas de desarrollador personalizadas (por ejemplo, NPCs de Godot o extractores JSON).
- Decodificación especulativa con MTP, DFlash2, `SA_SPEC` y `GuardedDraft`.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- **CI/CD sin coste por token**: cargar `zen6-nano-2b-PTQ1_0.gguf` (429 MB) en runners de CPU de GitHub Actions con `llama-server -ngl 0` para ejecutar tests end-to-end de integración de LLM y tool calling sin claves de API ni facturación por token.
- **Agentes de desarrollo sobre repositorios**: usar las herramientas `fs`, `git`, `exec` y `test` para que el modelo inspeccione ficheros, ejecute tests de workspace y proponga parches, aprovechando la recuperación de errores y la abstención calibrada cuando la herramienta no aplica.
- **NPCs y lógica de diálogo en videojuegos**: desplegar la variante de 4B (950 MB en PTQ1_0) o 2B (429 MB) dentro de motores como Godot, con personas personalizadas por personaje y latencia baja en hardware de consumo o móvil.
- **Extracción estructurada de datos**: configurar el modelo como extractor JSON con persona de desarrollador, útil para pipelines de ingesta documental donde el coste por documento es crítico.
- **Asistentes locales de escritorio**: servir el 9B en PQ2_0 (2,42 GB) con `hanzo-engine` sobre GPU de consumo (CUDA, Metal o Vulkan) para un asistente privado con visión integrada mediante `mmproj`.
- **Automatización de operaciones MCP**: orquestar tareas de sistema de ficheros, ejecución de comandos y control de repositorios en flujos agénticos sobre el protocolo MCP de Hanzo.
- **Prototipado multimodal en edge**: usar el tier de 2B junto al proyector visual para clasificación o descripción de imágenes en dispositivos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada (9B)**: aproximadamente 2,4 GB en PQ2_0, 2,0 GB en PTQ1_0 y 2,6 GB en Q2_0, más 624 MB (mmproj Q8_0) o 922 MB (mmproj BF16) si se usa visión, y 1,57 GB adicionales si se activa el draft DFlash2.
- **VRAM estimada (4B)**: 1,15 GB en PQ2_0 y 950 MB en PTQ1_0.
- **VRAM estimada (2B)**: 517 MB en PQ2_0 y 429 MB en PTQ1_0.
- **GPU recomendadas**: cualquier GPU con soporte CUDA `dp4a` (A100, H100, RTX 4090, RTX 3090) para el tier 9B; Metal en Apple Silicon para los packs MLX 2-bit; ROCm y Vulkan también soportados por `hanzo-engine`.
- **Consumer GPU**: sí, todas las variantes caben holgadamente en GPUs de consumo; el tier 2B funciona incluso en CPU pura (`-ngl 0`).
- **Opciones de despliegue**: `hanzo-engine` (CUDA, Metal, ROCm, Vulkan, CPU), llama.cpp upstream b11556 o superior para Q2_0, `mlx-lm` para los packs MLX 2-bit y servidor compatible OpenAI en `http://127.0.0.1:36900/v1`.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion nativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zen 6 Nano | 9B / 4B / 2B (1,88B safetensors) | no disponible | Ternaria 1,58-bit (PQ2_0, PTQ1_0, Q2_0) | Apache 2.0 | GGUF en Hugging Face, MLX, hanzo-engine |
| Qwen 3.5 (base upstream) | no disponible | no disponible | Estándar (GGUF, safetensors) | según variante | Hugging Face |
| Bonsai-2 (Prism ML) | no disponible | no disponible | no disponible | no disponible | referenciado en NOTICE |
| llama.cpp Q2_K (modelos densos comparables) | variable | variable | 2-3 bpw estándar | según modelo base | llama.cpp |

La comparación cuantitativa con alternativas de la misma categoría no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluación de alucinación; el modelo declara abstención calibrada de herramientas, pero no hay métricas publicadas que la respalden.
- La longitud de contexto no se especifica, lo que impide planificar cargas de trabajo con ventanas largas sin pruebas previas.
- Los idiomas soportados no están declarados; la cobertura multilingüe es una incógnita.
- La cuantización ternaria de 1,58 bits puede degradar tareas sensibles a precisión numérica (matemáticas, código de baja tolerancia) frente a pesos densos; no hay benchmarks que lo cuantifiquen.
- El soporte en llama.cpp upstream está limitado a Q2_0 desde b11556; los formatos PQ2_0 y PTQ1_0 requieren `hanzo-engine`, lo que introduce dependencia de un runtime propietario del ecosistema Hanzo.
- El repositorio declara 1.881.825.088 parámetros en safetensors frente a los tiers de 9B/4B/2B descritos en la model card; conviene verificar el artefacto concreto antes de dimensionar el despliegue.
- Aunque la licencia es Apache 2.0, se mantienen atribuciones upstream a Qwen, Bonsai-2 y DFlash/ProCreations que deben conservarse en redistribuciones (fichero `NOTICE`).
- El tamaño del repositorio (18,6 GB) implica descargar artefactos que no se usarán si solo se necesita una variante; conviene descargar ficheros individuales con `hf download`.
- El modelo está orientado a tool calling y agentes; en producción conviene validar el comportamiento de abstención y recuperación de errores con las herramientas concretas del despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hanzoai/zen6-nano
- Hanzo AI: https://hanzo.ai
- Zen LM: https://zenlm.org
- Zoo Labs Foundation: https://zoolabs.io
- Motor de inferencia hanzo-engine: https://github.com/hanzoai/engine
