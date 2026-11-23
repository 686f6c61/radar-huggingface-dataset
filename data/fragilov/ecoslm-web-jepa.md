# fragilov/ecoslm-web-jepa

## Resumen

EcoSLM-WebJEPA v3 es un agente web de borde (edge) desarrollado por fragilov que combina una política de decisión calibrada con un modelo de mundo basado en una arquitectura JEPA contrafactual (C-JEPA). El modelo, de 11.274.578 parámetros y latente de 64 dimensiones, está diseñado para operar sobre estados DOM de páginas web y decidir la siguiente acción (clic, escritura, scroll, espera) en flujos de automatización. Se distribuye como dos artefactos ONNX INT8 con un peso combinado de 13,72 MB, lo que lo hace apto para despliegue en CPU de borde.

La propuesta técnica central es el uso de un predictor de mundo factual que permite razonar sobre escenarios contrafactuales ("¿qué pasaría si?") sin reentrenamiento, mediante reutilización de residuos latentes y transporte de lectura. Esto lo diferencia de los agentes web reactivos convencionales, que solo reaccionan al estado observado. El modelo está destilado a partir de TypeSafe Jev (`jev-latest`) y de Qwen2.5-0.5B-Instruct para la síntesis de texto en acciones `TYPE_TEXT`.

El modelo está orientado a los idiomas vietnamita e inglés, con un backbone de subpalabras inicializado desde BamiBERT mediante SVD truncada. Su relevancia actual reside en la combinación de un tamaño muy reducido, licencia Apache 2.0 y capacidades de razonamiento contrafactual en el borde, lo que abre la puerta a agentes web autónomos en dispositivos sin GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con Context Transformer (4 capas), Element Transformer (2 capas) y Cross-Attention Decoder (2 capas); predictor de mundo FiLM euclídeo (C-JEPA) |
| Parámetros totales | 11.274.578 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 250 controles DOM (no se especifica longitud en tokens) |
| Tipos de cuantización | ONNX INT8 (dinámica); FP32 disponible en el grafo original |
| Idiomas soportados | vietnamita (vi), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (librería), ONNX INT8 (dos grafos: política+encoder y predictor de mundo) |

## Arquitectura y entrenamiento

El modelo se compone de dos módulos. El primero es una política de decisión web que procesa hasta 250 controles DOM con flags de rol y estructura. Utiliza un backbone de subpalabras BamiBERT Byte-Level BPE (vocabulario de 20.481) inicializado mediante SVD truncada de 768 a 256 dimensiones, con `d_model=256` y `nhead=4`. Sobre él se apilan un Context Transformer de 4 capas, un Element Transformer de 2 capas y un Cross-Attention Decoder de 2 capas. Incorpora características de solapamiento léxico zero-shot entre objetivo, historial y página (`e_align`), fusionadas con dropout dividido (`elem_cross_drop=0.10`, `elem_lex_drop=0.35`).

El segundo módulo es un `FactualWorldPredictor` euclídeo con FiLM que predice `μ(z_t, a) = z_t + Δμ(z_t, e(a))` sin LayerNorm final en `state_proj` ni en los bloques residuales, preservando la geometría aditiva de la perturbación. Esto habilita la reutilización de residuos latentes (Eq. 6), el transporte de lectura (Eq. 7) y un C-JEPA con compuerta consciente de la interacción (`α = clamp(1 - s_blocked, 0.15, 1.0)`). El modelo fue destilado de TypeSafe Jev (`jev-latest`) y de Qwen2.5-0.5B-Instruct local para la síntesis de `TYPE_TEXT`. No se especifica el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Predicción de la siguiente acción web sobre estados DOM: `CLICK`, `TYPE_TEXT`, `WAIT`, `BLOCKED`, `SCROLL_UP`, `SCROLL_DOWN`, entre otras.
- Síntesis de texto para acciones `TYPE_TEXT` mediante un SLM local (Qwen2.5-0.5B-Instruct).
- Razonamiento contrafactual zero-retrain: recuperación ante perturbaciones no observadas mediante reutilización de residuos latentes y transporte de lectura.
- Detección de bloqueos e interacciones conscientes del contexto mediante compuerta `s_blocked`.
- Capacidades multilingües limitadas a vietnamita e inglés.
- Ejecución en CPU de borde con latencias de milisegundos (12,44 ms para política, 0,23 ms para mundo con `K=4`).
- No se documenta soporte de tool calling genérico, agentes multi-paso fuera del flujo web, visión ni audio.

## Casos de uso

- Automatización de formularios web en producción: el modelo decide acciones `TYPE_TEXT` y `CLICK` sobre DOM reales, con síntesis de texto delegada a Qwen2.5-0.5B, adecuado para rellenar campos en flujos administrativos o de registro.
- Agentes web en dispositivos de borde sin GPU: gracias a sus 13,72 MB en ONNX INT8 y latencias de 12,44 ms en CPU, puede desplegarse en navegadores embebidos o dispositivos IoT para tareas de navegación guiada.
- Recuperación ante bloqueos y estados inesperados: la compuerta `s_blocked` y el C-JEPA permiten detectar cuándo una acción ha quedado bloqueada y seleccionar una alternativa sin reentrenamiento, útil en scraping resiliente.
- Testing automatizado de interfaces web: el modelo puede generar secuencias de acciones sobre DOM para pruebas end-to-end, con razonamiento contrafactual para cubrir caminos alternativos.
- Asistentes de accesibilidad para navegación: con contexto de hasta 250 controles DOM y soporte vietnamita/inglés, puede guiar a usuarios en páginas complejas indicando la siguiente acción recomendada.
- Automatización de flujos de atención al cliente en portales vietnamitas: el soporte nativo de vietnamita y la calibración (ECE de 0,0296 en operación) permiten decisiones con confianza fiable en entornos de producción.

## Benchmarks y rendimiento

### Política y latencia en borde (frente a EcoSLM-WebDM v2 congelado)

| Métrica | WebDM v2 (congelado) | WebJEPA v3 (ronda 5) |
|---|---|---|
| Parámetros | 10.830.085 | 11.274.578 |
| `val_v2_frozen` Op Top-1 (n=35) | 0,8000 | 0,8286 (+0,0286) |
| `val_v2_frozen` Target Top-1 (n=35) | 0,8462 | 0,8769 (+0,0307) |
| `val` Full Op Top-1 (n=144) | 0,6181 | 0,9444 (+0,3263) |
| `val` Full Target Top-1 (n=144) | 0,8317 | 0,9469 (+0,1152) |
| `val` Target Top-3 (n=144) | — | 1,0000 |
| ECE calibrado (Op / Target) | 0,0964 / 0,1173 (n=35) | 0,0296 / 0,0352 |
| Ops raras (WAIT/BLOCKED/SCROLL_UP/SCROLL_DOWN) | — | 1,0000 en las 4 |
| Latencia CPU ONNX INT8 política | 15,83 ms | 12,44 ms (0,0% caída Op Top-1 vs FP32) |
| Latencia CPU ONNX INT8 mundo (K=4) | — | 0,23 ms |
| Tamaño total INT8 | 14,68 MB | 13,72 MB |

### Modelo de mundo contrafactual zero-retrain

Suite de perturbación persistente no observada (`n=30`, `empirical_interaction_rho=0.0`):

| Método | Latent R² | Latent MSE | Readout R² (MLP/Lin) | Selección 3 ramas | Recuperación solo alternativa |
|---|---|---|---|---|---|
| Copia factual (`z_obs0`) | -0,3939 | 0,11132 | -0,4983 | 0,7333 (política) | 1,0000 (política) |
| JEPA estándar | 0,5057 | 0,03948 | 0,3848 / 0,4572 | 0,9667 | 0,9667 |
| C-JEPA Eq. (6) | 0,5433 | 0,03648 | 0,5807 | 1,0000 | 1,0000 |
| C-JEPA Eq. (7) | — | — | 0,6485 / 0,6039 | 0,9667 | 0,9667 |
| Gated C-JEPA | 0,5545 | 0,03558 | 0,5313 | 0,9667 | 1,0000 |
| C-JEPA + fusión de política | — | — | — | 0,9333 | 1,0000 |

Suite de recuperación interactiva (`n=50`, `empirical_interaction_rho=5974.6323`):

| Método | Readout R² | Selección 3 ramas | Recuperación solo alternativa |
|---|---|---|---|
| WebDM v2 congelado (reactivo) | — | 0,7200 | 0,9200 |
| JEPA estándar lookahead | 0,2975 | 0,7800 | 1,0000 |
| C-JEPA Eq. (6) sin compuerta | -0,4836 | 0,7200 | 1,0000 |
| Gated C-JEPA | 0,1153 (+0,5989 vs sin compuerta) | 0,7600 | 1,0000 |
| C-JEPA + fusión de política | — | 0,8400 | 1,0000 |
| Política reactiva v3 | — | 0,8600 | 1,0000 |

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; el artefacto INT8 combinado ocupa 13,72 MB en disco y en memoria.
- GPU recomendadas: no se especifican; el modelo está optimizado para CPU de borde.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en dispositivos sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime (INT8 dinámico), PyTorch nativo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 12,44 ms de media en CPU para la política y 0,23 ms para el predictor de mundo con `K=4`; en la verificación end-to-end, `TYPE_TEXT` tardó 44,78 ms y el paso `DONE` 22,72 ms.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EcoSLM-WebJEPA v3 | 11.274.578 | 250 controles DOM | Agente web + C-JEPA contrafactual, ONNX INT8 | Apache 2.0 | Hugging Face |
| EcoSLM-WebDM v2 | 10.830.085 | no disponible | Agente web reactivo, ONNX INT8 | no disponible en la información | Referenciado como baseline congelado |
| JEPA estándar (lookahead) | no disponible | no disponible | Modelo de mundo sin contrafactuales | no disponible | Referenciado en benchmarks |
| Qwen2.5-0.5B-Instruct | ~500M | no disponible | LLM generativo para síntesis de texto | no disponible en la información | Usado como SLM local auxiliar |

## Limitaciones y advertencias

- El modelo solo soporta vietnamita e inglés; no hay soporte documentado para castellano ni otros idiomas.
- El contexto se limita a 250 controles DOM; páginas con estructuras más grandes pueden requerir truncamiento o segmentación.
- Es un modelo especializado en decisiones de acción web, no un LLM generativo general; no debe usarse para tareas fuera del dominio de automatización web.
- El predictor de mundo muestra R² negativos en escenarios de alta interacción sin compuerta (C-JEPA Eq. 6 sin gating: -0,4836), lo que indica que la compuerta es necesaria para estabilidad.
- Riesgo de alucinación en la síntesis de `TYPE_TEXT` delegada a Qwen2.5-0.5B, un modelo pequeño que puede generar valores incorrectos en formularios.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni soporte del autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por la comunidad.
- No se especifican datos de sesgo, composición del dataset de entrenamiento ni número de tokens, lo que dificulta evaluar la robustez fuera de los conjuntos de validación reportados.

## Enlaces

- Hugging Face: https://huggingface.co/fragilov/ecoslm-web-jepa
- Dataset de destilación referenciado: https://huggingface.co/datasets/fragilov/ecoslm-web-dm-distill
- Paper C-JEPA: Balestriero, LeCun & Varaku, "Counterfactual World Models: JEPAs That Reason About 'What If'", arXiv:2611.24778
- Paper BamiBERT: Qualcomm AI Research, "BamiBERT: A New BERT-based Language Model for Vietnamese", arXiv:2607.02259
- Paper de calibración: Guo et al., "On Calibration of Modern Neural Networks", ICML 2017
- Paper Qwen2.5: Qwen Team, Alibaba Cloud, "Qwen2.5 Technical Report", arXiv:2409.12186
