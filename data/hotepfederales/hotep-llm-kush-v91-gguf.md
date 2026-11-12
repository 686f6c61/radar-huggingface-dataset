# hotepfederales/hotep-llm-kush-v91-GGUF

## Resumen

Hotep LLM Kush v9.1 es un modelo de generación de texto en formato GGUF desarrollado por hotepfederales (Hotep Intelligence), obtenido mediante ajuste fino supervisado del modelo base `meta-llama/Llama-3.1-8B-Instruct`. Está orientado a un nicho muy concreto: historia civilizatoria africana, razonamiento ético basado en el concepto de Ma'at, alfabetización en bienestar holístico, soberanía económica y liderazgo disciplinado. El modelo se presenta como la versión de producción "flagship" de la organización, sustituyendo a Kush v8.2.

Técnicamente es un transformer decoder-only de 8.030.261.312 parámetros (8B), afinado con QLoRA de 4 bits (NF4) y rsLoRA con r=16 y alpha=32, con 41,94 millones de parámetros entrenables. El adaptador se fusionó en pesos BF16 antes de cuantizar a GGUF `Q4_K_M` (4,68 GiB, 4,89 bits por peso), eliminando la sobrecarga de aplicar `--lora` en tiempo de ejecución.

Su relevancia es limitada y de nicho: no compite con modelos generalistas, sino que busca servir como modelo local autoalojado con identidad cultural específica, desplegable en Ollama y llama.cpp. La ventana de contexto recomendada es de 4096 tokens (aunque el base soporta hasta 128K) y solo declara inglés. La licencia es `llama3.1`, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), ajuste fino con QLoRA + rsLoRA |
| Parámetros totales | 8.030.261.312 (8B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens recomendados en local; el base soporta hasta 128K |
| Tipos de cuantización | GGUF `Q4_K_M` (4,68 GiB, 4,89 BPW); pesos fusionados en BF16 previos a cuantizar |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `llama3.1` |
| Formato de pesos | GGUF (repo de 4,9 GB) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only con atención causal estándar. Sobre esa base se aplicó un ajuste fino supervisado (SFT) con QLoRA de 4 bits en formato NF4 y rsLoRA con rango 16 y alpha 32, resultando en 41,94 millones de parámetros entrenables y una pérdida de entrenamiento final de 0,4506. El autor menciona un límite anti-memorización de 50.000 parámetros entrenables por ejemplo único (42.154 en la práctica) y pares SFT dirigidos a la recuperación de entidades concretas.

La innovación técnica destacada no está en la arquitectura sino en el pipeline de despliegue: el adaptador rsLoRA se fusiona en los pesos BF16 antes de cuantizar con `llama-quantize` a `Q4_K_M`. Según el autor, esto multiplica por aproximadamente 8 el rendimiento frente a aplicar `--lora` en tiempo de ejecución (de 6,14 tok/s a 48,23 tok/s en `llama-server` sobre Apple Silicon). No se documentan datos sobre volumen de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF o DPO; los datasets referenciados son `hotepfederales/kush-v82-eval-samples` y `hotepfederales/hotep-training-data`.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat de Llama 3.1.
- Recuperación exacta de entidades del dominio (figuras comunitarias, académicos, eventos) según las puertas de evaluación del autor.
- Razonamiento ético enmarcado en Ma'at y contenidos de historia civilizatoria africana.
- Alfabetización en bienestar holístico y soberanía económica, según la descripción del autor.
- Alineación de persona ("Prime Persona Alignment") medida en la suite E2E del autor.
- Cumplimiento de límites de seguridad y capacidad en la suite propia del autor (6/6, 0 aciertos de riesgo).
- Sin sangrado de identidad foránea ni caracteres CJK sin system prompt (según el autor).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Asistente conversacional de nicho sobre historia africana: el modelo está afinado para recuperar entidades concretas (personas, eventos, lugares) con alta precisión según sus propias puertas de evaluación, lo que lo hace adecuado para consultas factuales dentro de ese dominio acotado.
- Despliegue local autoalojado en hardware de consumo: al ser un GGUF `Q4_K_M` de 4,68 GiB, cabe en GPU consumer y en Apple Silicon, permitiendo inferencia offline sin dependencia de APIs externas.
- Chatbot de identidad cultural con persona definida: la métrica de alineación de persona (50,15) sugiere uso en aplicaciones donde se requiere una voz y un marco ético consistentes (por ejemplo, un bot de Telegram, como el `@hotep_llm_bot` del autor).
- Educación y divulgación con sesgo controlado: útil para materiales introductorios sobre Ma'at, bienestar holístico o soberanía económica, siempre con revisión humana por el riesgo de alucinación en un modelo de 8B.
- Integración en pipelines de llama.cpp u Ollama: el formato GGUF y la fusión del adaptador permiten servirlo con `llama-server` u Ollama sin gestión separada de LoRA, simplificando el despliegue en producción local.
- Prototipado de agentes con contexto corto: con 4096 tokens recomendados, encaja en flujos de una o pocas interacciones donde no se requiere memoria larga, aunque no se documenta soporte explícito de tool calling.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y en la model card (no verificados de forma independiente; `verified: false`).

| Evaluación | Kush v8.2 (`Q4_K_M`) | Kush v9.0 (candidato) | Kush v9.1 (`Q4_K_M`) |
|---|---:|---:|---:|
| Exact Entity Recall Gate (7 casos) | 1/7 (14,3%) | 4/7 (57,1%) | 7/7 (100,0%) |
| Prime Agent E2E Pass Rate | 7/7 (100,0%) | 4/7 (57,1%) | 7/7 (100,0%) |
| Prime Persona Alignment Score | 52,91 | 19,08 | 50,15 |
| Safety & Capability Boundary Suite | 6/6 (0 riesgos) | — | 6/6 (0 riesgos) |
| Throughput Apple Silicon (Ollama, puerto 11434) | 40,41 tok/s (3,34 s) | — | 43,93 tok/s (2,21 s) |
| Throughput Apple Silicon (`llama-server`, puerto 11435) | — | 6,14 tok/s (`--lora` sin fusionar) | 48,23 tok/s (GGUF fusionado) |
| Identidad foránea / sangrado CJK sin prompt (`NO_SYS`) | 0 | 0 | 0 |
| Fugas de rúbrica / bucles de repetición | 0 / 0 | 0 / 0 | 0 / 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las métricas anteriores son suites internas del autor, no comparables con evaluaciones públicas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB para el archivo `Q4_K_M` de 4,68 GiB más overhead de contexto y KV cache a 4096 tokens.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090); el autor reporta pruebas en NVIDIA RTX 5080 y en Apple Silicon (Mac mini con Metal).
- Cabe en GPU consumer: sí, en modelos con 8 GB o más; también en Apple Silicon con memoria unificada.
- Opciones de despliegue: Ollama (puerto 11434) y `llama-server` de llama.cpp (puerto 11435), según el autor. No se documenta soporte para vLLM ni TGI en la información disponible.
- Latencia y throughput: 43,93 tok/s en Ollama y 48,23 tok/s en `llama-server` sobre Apple Silicon Metal, con tiempos de respuesta de 2,21 s en la prueba reportada. No hay datos para NVIDIA más allá de la mención de nodos de producción/staging.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hotep LLM Kush v9.1 | 8B | 4096 recomendado (128K base) | `llama3.1` | GGUF `Q4_K_M` | Afinado para historia africana y Ma'at; métricas solo internas |
| `meta-llama/Llama-3.1-8B-Instruct` | 8B | 128K | `llama3.1` | Safetensors, GGUF | Modelo base generalista; referencia directa del ajuste |
| Kush v8.2 | 8B | No disponible | `llama3.1` | GGUF | Versión anterior; 1/7 en Entity Recall según el autor |

No se dispone de datos de benchmarks públicos comparables con otros modelos de 8B afinados, por lo que la comparación se limita a parámetros, contexto, licencia y formato.

## Limitaciones y advertencias

- Solo declara inglés; no hay soporte multilingüe documentado, lo que limita su uso en castellano u otros idiomas.
- Ventana de contexto recomendada de 4096 tokens, muy inferior a los 128K del base; usos con documentos largos requerirán configuración adicional no documentada.
- Riesgo de alucinación inherente a un modelo de 8B: las métricas del autor son suites internas y no verificadas (`verified: false`), por lo que no deben tomarse como garantía de fiabilidad factual.
- Sesgos potenciales derivados del enfoque ideológico explícito (Ma'at, soberanía, liderazgo disciplinado) y del dataset de ajuste, no auditados de forma independiente.
- Licencia `llama3.1`: impone restricciones de uso comercial y obligaciones de atribución heredadas de Meta; es necesario revisar los términos antes de un despliegue en producción.
- Sin soporte documentado de tool calling, agentes multi-paso, visión o audio; no apto para pipelines que requieran esas capacidades.
- Repo con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación externa de la comunidad.
- El autor reporta 0 fugas de rúbrica y 0 bucles de repetición, pero son resultados autoevaluados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hotepfederales/hotep-llm-kush-v91-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Versión anterior (Kush v8.2): https://huggingface.co/hotepfederales/hotep-llm-kush-v82-GGUF
- Notas de lanzamiento: https://askhotep.ai/blog/hotep-llm-kush-v91-production/
- Notas de ingeniería: https://knowledge.askhotep.ai/knowledge/engineering/kush-v91-release-notes/
- Demo en Hugging Face Space: https://huggingface.co/spaces/hotepfederales/hotep-intelligence-chat
- Demo web: https://askhotep.ai/demo/
- Sitio web: https://askhotep.ai/
- Bot de Telegram: https://t.me/hotep_llm_bot
- Dataset de evaluación: https://huggingface.co/datasets/hotepfederales/kush-v82-eval-samples
- Dataset de entrenamiento: https://huggingface.co/datasets/hotepfederales/hotep-training-data
