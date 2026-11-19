# AhnJihunAILabs/askos-v1-mini-preview

## Resumen

Askos V1 Mini Preview es un modelo de lenguaje bilingüe (coreano e inglés) desarrollado por AhnJihunAI Labs, presentado como una vista previa de su arquitectura propietaria AWFT1.1 (Asymmetric Wave-Folded Transformer v1.1). El modelo declara 1.650,10 millones de parámetros totales, de los cuales aproximadamente 596,56 millones están activos por token, combinando una columna vertebral híbrida de atención lineal y atención GQA con un módulo de memoria episódica basado en Product-Key y un feed-forward MoE con enrutamiento Top-2 sobre 8 expertos.

La propuesta técnica se aleja del transformer denso convencional: 18 de sus 24 capas emplean Gated-DeltaNet (atención lineal recurrente con estado O(1)) y solo 6 capas usan GQA clásica, lo que reduce la huella de KV cache a unos 6,0 KiB por token en BF16. El entrenamiento se realizó con los métodos que el autor denomina Holographic Resonance Training (HRT v1.1) y Spectral Null-Space Holographic Alignment (SNHA), orientados a preservar el conocimiento base durante el ajuste de preferencias.

Es relevante ahora como caso de estudio de arquitecturas híbridas eficientes en contexto largo (32.768 tokens mediante YaRN NTK-by-parts) y como ejemplo de modelo pequeño con memoria episódica externa. No obstante, se trata de un preview con cero descargas y cero likes en el momento de la consulta, sin benchmarks estándar publicados (MMLU, HumanEval, GSM8K) y con métricas internas de validación muy limitadas, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | AWFT1.1 (Asymmetric Wave-Folded Transformer v1.1): híbrida de atención lineal Gated-DeltaNet + GQA, con MoE y memoria episódica Product-Key |
| Parámetros totales | 1.114.181.376 según safetensors; la model card declara 1.651,10 M (1,65 B) |
| Parámetros activos | ~596,56 M por token (Spine activo) + 544,9 M de Product-Key Episodic Mantle |
| Longitud de contexto | 32.768 tokens (YaRN NTK-by-parts, de 2K a 32K, scaling_factor = 16,0) |
| Tipos de cuantización | no disponible (el repo solo publica safetensors; no se documentan GGUF ni AWQ/GPTQ) |
| Idiomas soportados | Coreano (ko) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3,3 GB), requiere custom_code |

## Arquitectura y entrenamiento

AWFT1.1 organiza el modelo en 24 capas: 18 capas "Linear Gated-Delta Wave" con estado recurrente de complejidad O(1) y 6 capas "GQA Anchor" situadas en las posiciones {4, 8, 12, 16, 20, 24}. El feed-forward es un MoE con un experto compartido SwiGLU de dimensión 1536 y enrutamiento Top-2 sobre 8 expertos de dimensión 768, sin expertos muertos declarados (0/192). Adicionalmente incorpora un "Episodic Mantle" de memoria Product-Key de 524.288 × 1.024, con 512 claves de 1.024 dimensiones, K=4 medoides y 4 puntos de anclaje en las capas {6, 12, 18, 24}. El tokenizador es Askos-64K, un BPE bilingüe de 65.536 entradas implementado como PreTrainedTokenizerFast nativo en Rust.

El entrenamiento se declara end-to-end en fases 0 a 5, con HRT v1.1 y una fase final de alineación SNHA. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otra técnica de preferencias más allá de la "preference accuracy" reportada. Las métricas internas publicadas son: perplejidad de validación base de 14,36 en la fase 5 (frente a 14,15 en fase 4, deriva del +1,48 %), precisión de preferencias del 53,1 % (desde 49,2 %), margen de preferencia de +0,079, perplejidad de QA elegido de 5,73, exact-match en matemáticas held-out de 2/6 (33,3 %), Pass@1 en Python held-out de 1/6 (16,7 %) y 4/4 en Needle-in-a-Haystack a 2K, 8K, 16K y 32K.

## Capacidades

- Generación de texto conversacional bilingüe coreano-inglés mediante plantilla de chat (`apply_chat_template`).
- Razonamiento matemático básico: la model card incluye un ejemplo de derivada y evaluación de f'(4); el exact-match held-out es de 2/6.
- Generación de código Python limitada: Pass@1 held-out de 1/6 (16,7 %).
- Recuperación en contexto largo: 100 % en NIAH a 2K, 8K, 16K y 32K tokens según métricas del autor.
- Memoria episódica persistente vía Product-Key Episodic Mantle, con 458.752 slots core declarados bit-exactos (SHA-256 verificado).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Asistencia conversacional coreano-inglés: el modelo puede mantener diálogos multi-turno con la plantilla de chat nativa y un tokenizador BPE de 65.536 entradas optimizado para ambos idiomas, adecuado para prototipos de atención al cliente en mercados coreano-parlantes.
- Procesamiento de documentos largos: con 32.768 tokens de contexto y un KV cache de solo 6,0 KiB por token en BF16, es viable resumir contratos, informes o hilos de correo extensos en una GPU de gama media.
- Recuperación aumentada sobre corpus extensos: la memoria episódica Product-Key permite anclar información recurrente entre llamadas, útil en asistentes de documentación técnica que reutilizan contexto estable.
- Extracción de respuestas sobre transcripciones o logs: el rendimiento verificado en NIAH a 32K lo hace apto para localizar datos concretos en volcados largos, con validación adicional por parte del integrador.
- Generación de código asistida en entornos de bajo recurso: aunque su Pass@1 es limitado (1/6), puede emplearse como autocompletado o generador de borradores en pipelines internos donde el coste de inferencia prima sobre la precisión.
- Investigación en arquitecturas híbridas: sirve como banco de pruebas reproducible (Apache 2.0) para estudiar atención lineal Gated-DeltaNet, MoE con enrutamiento Top-2 y alineación SNHA en modelos de ~1,6 B.
- Despliegue en edge o entornos con VRAM restringida: al activar solo ~596,6 M parámetros por token, el coste computacional por paso es inferior al de un denso de 1,65 B, lo que facilita prototipos en estaciones de trabajo con una sola GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas son internas del autor y se recogen a continuación; no son comparables con evaluaciones externas.

| Métrica (interna, fases 4 y 5) | Fase 4 | Fase 5 (SNHA) |
|---|---|---|
| Perplejidad de validación base | 14,15 (bpb 0,9234) | 14,36 (+1,48 %) |
| Precisión de preferencias (4 dominios) | 49,2 % | 53,1 % |
| Margen de preferencia (s+ − s−) | +0,048 | +0,079 |
| Perplejidad de QA elegido | 5,93 | 5,73 |
| Exact-match matemáticas held-out | 0/6 (0,0 %) | 2/6 (33,3 %) |
| Pass@1 Python held-out | 1/6 (16,7 %) | 1/6 (16,7 %) |
| NIAH a 2K/8K/16K/32K | 4/4 (100 %) | 4/4 (100 %) |
| Auditoría de ortogonalidad NCE (205 tensores) | — | media ‖ΔW·U_r‖/‖ΔW‖ = 0,000194 |
| Integridad SHA-256 del Mantle S_core | — | True (458.752 slots) |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: alrededor de 2,3 GB solo para pesos (1,11 B de parámetros según safetensors), más overhead de activaciones y del Episodic Mantle; el repo completo ocupa 3,3 GB.
- En cuantización de 8 bits o 4 bits: no disponible, porque no se publican pesos GGUF, AWQ ni GPTQ; habría que convertir manualmente y validar la compatibilidad con `custom_code`.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16 con margen; A100, H100 o L40S para servir varias peticiones concurrentes; RTX 4090, RTX 4080 o RTX 3090 para desarrollo individual.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 de 12 GB en adelante, aunque no hay mediciones publicadas que lo confirmen.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requiere torch >= 2.1 y transformers >= 4.44, verificado en 5.5.0). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la atención lineal y el Mantle personalizados probablemente requieran kernels propios.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Askos V1 Mini Preview | 1,11 B (safetensors); 1,65 B declarados, ~596,6 M activos | 32.768 | Apache 2.0 | Híbrido Gated-DeltaNet + GQA, MoE, memoria episódica; sin benchmarks estándar |
| Qwen2.5-1.5B | 1,5 B densos | 32.768 | Apache 2.0 | Transformer denso con benchmarks públicos amplios; sin memoria episódica |
| Llama 3.2 1B | 1,2 B densos | 128.000 | Llama 3.2 Community License | Contexto muy superior; licencia con restricciones de uso comercial |
| SmolLM2-1.7B | 1,7 B densos | 8.192 | Apache 2.0 | Enfoque en eficiencia y despliegue en edge; sin arquitectura híbrida |

La comparación se limita a parámetros, contexto y licencia: no existen datos públicos de rendimiento de Askos V1 Mini Preview que permitan contrastar calidad frente a estas alternativas.

## Limitaciones y advertencias

- Modelo en estado preview, con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente.
- Discrepancia entre los parámetros reales de safetensors (1.114.181.376) y los declarados en la model card (1.651,10 M); conviene verificar el conteo antes de dimensionar infraestructura.
- Ausencia total de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.); las únicas métricas son internas y con muestras minúsculas (6 ejemplos en matemáticas y código), por lo que su valor estadístico es muy bajo.
- Riesgo elevado de alucinación en dominios factuales: la perplejidad de validación base de 14,36 es alta para un modelo de su tamaño.
- Rendimiento débil en código (Pass@1 de 1/6) y matemáticas (exact-match de 2/6); no apto para tareas de precisión sin verificación humana.
- Cobertura lingüística limitada a coreano e inglés; el comportamiento en castellano u otros idiomas no está documentado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; auditar el repositorio antes de desplegar en entornos sensibles.
- Sin soporte documentado de tool calling, agentes, visión ni modo thinking; no debe asumirse compatibilidad con frameworks de agentes estándar.
- Licencia Apache 2.0 permite uso comercial, pero al ser un preview el autor no ofrece garantías; la estabilidad de la API y del formato de pesos no está comprometida.
- El KV cache reducido (6,0 KiB/token) es una ventaja, pero el estado recurrente y el Mantle pueden introducir comportamientos no deterministas entre versiones del código personalizado.

## Enlaces

- Hugging Face: https://huggingface.co/AhnJihunAILabs/askos-v1-mini-preview
- Repositorio alternativo citado en la model card: https://huggingface.co/AskosAILabs/askos-v1-mini-preview
- Paper, blog, repositorio de código y demos: no disponibles en la información proporcionada.
