# hieu1126/lab22-dpo-vn-v0

## Resumen

`hieu1126/lab22-dpo-vn-v0` es un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre un modelo base Qwen3-4B-Instruct-2507 en vietnamita. Lo publica el usuario hieu1126 como parte del Lab 22 del curso AICB (VinUniversity, Track 3), un ejercicio de alineamiento por preferencias dentro de una ruta que va de SFT a preference learning. El adaptador se construye sobre un modelo SFT previo (también incluido como `sft-mini/`) que a su vez se entrenó sobre Qwen3-4B-Instruct-2507 cuantizado a 4 bits.

El repositorio tiene un tamano de 0,3 GB y contiene unicamente el adaptador DPO, no los pesos completos. Su `adapter_config.json` apunta a una ruta local (el modelo SFT fusionado), por lo que para usarlo hay que cargar el modelo base, aplicar y fusionar el adaptador `sft-mini/` y despues aplicar este adaptador. Es un artefacto de tipo PEFT, orientado exclusivamente a estudio e investigacion, sin soporte para produccion.

Su relevancia es acotada y de caracter didactico: sirve como ejemplo reproducible de un pipeline DPO completo (SFT + DPO + evaluacion con reward model) sobre un modelo pequeno (4B) y un idioma de recursos limitados como el vietnamita. La propia ficha advierte de que los resultados no evidencian mejora sobre el modelo SFT (probabilidad posterior de mejora con intervalo de confianza que contiene 0,5).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso Qwen3-4B-Instruct-2507 |
| Parametros totales | Modelo base: 4B (dense); adaptador LoRA: r=16, alpha=32 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la ficha; heredada del modelo base. Entrenamiento del adaptador con max_length de 768 tokens |
| Tipos de cuantizacion | Modelo base en 4 bits (bnb-4bit); adaptador LoRA en safetensors |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | other (datos SFT con CC BY-NC; solo estudio e investigacion, no comercial) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4.000 millones de parametros. Sobre el se entrena primero un adaptador LoRA de tipo SFT en 1.000 filas del dataset `saillab/alpaca-vietnamese-cleaned` (1 epoca, learning rate 2e-4). Ese adaptador SFT se guarda en `sft-mini/` y se fusiona con los pesos base cuantizados a 4 bits.

El paso DPO entrena un nuevo LoRA (r=16, alpha=32, dropout 0.0) sobre el modelo SFT fusionado, usando `sailor2/sea-ultrafeedback-onpolicy` en vietnamita (800 pares de entrenamiento y 100 de validacion, divididos por prompt). Los modulos objetivo son `down_proj`, `gate_proj`, `k_proj`, `o_proj`, `q_proj`, `up_proj` y `v_proj`. Hiperparametros: perdida sigmoid, beta 0.1, learning rate 5e-6, 1 epoca (100 pasos, batch 1 con acumulacion de gradiente 8), max_length de 768 tokens, entrenado en una Colab T4 con base en 4 bits.

Los ficheros en la raiz del repo son el adaptador DPO. Como su `adapter_config.json` apunta a una ruta local del modelo SFT fusionado, la reproducibilidad depende de reconstruir primero el SFT y fusionarlo.

## Capacidades

- Generacion de texto en vietnamita, heredada del modelo base Qwen3-4B-Instruct-2507.
- Alineamiento por preferencias orientado a respuestas mas utiles y seguras segun el reward model empleado.
- Razonamiento de un solo turno; el entrenamiento se limita a 768 tokens de longitud.
- El modelo base Qwen3 conserva su soporte teorico de tool calling y de modo de razonamiento, pero las pruebas del autor muestran que el adaptador emite tokens sueltos `<tool_call>` / `</tool_call>` al inicio de cada respuesta, lo que rompe ese flujo.
- Capacidades multilingues limitadas al vietnamita en la practica; no se documenta evaluacion en otros idiomas.
- No hay evidencia de mejora medible frente al modelo SFT original (ver limitaciones).

## Casos de uso

- Estudio de tecnicas de alineamiento: sirve como ejemplo reproducible de un pipeline DPO completo (SFT, DPO, evaluacion con reward model) para cursos e investigacion sobre aprendizaje por preferencias.
- Experimentacion con DPO en idiomas de bajos recursos: su enfoque sobre vietnamita con datasets de la comunidad (SEA UltraFeedback) es un caso practico para estudiar alineamiento en idiomas no ingleses.
- Analisis de evaluacion con reward models: los datos de win rate y de rewards chosen/rejected permiten estudiar las limitaciones de jueces automaticos y la fiabilidad de las metricas de DPO.
- Reproduccion de ablaciones SFT vs SFT+DPO: la comparacion de 50 prompts con un reward model externo sirve como plantilla para medir efectos de una etapa de preferencias.
- Desarrollo de adaptadores LoRA sobre Qwen3-4B: el repositorio ilustra como componer un adaptador SFT y uno DPO encadenados sobre el mismo modelo base cuantizado.
- Docencia de PEFT: por su tamano (0,3 GB) y su compatibilidad con Colab T4, es util para demostrar el flujo de carga y fusion de adaptadores en entornos con recursos limitados.

Nota: no se recomienda ninguno de estos casos en produccion; el propio autor lo declara coursework only.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos son metricas internas de DPO:

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento, primera -> ultima | 0,6929 -> 0,6750 |
| Precision de reward en validacion (held-out) | 0,71 |
| Reward held-out, chosen / rejected | +0,438 / +0,350 |
| Margen held-out | +0,089 |
| Diagnostico automatico | INTENDED |

Comparacion SFT vs SFT+DPO en 50 prompts de validacion, evaluada con `Skywork/Skywork-Reward-V2-Llama-3.2-3B` (precision de cordura en vietnamita del 100%):

| Metrica | Valor |
|---|---|
| Victorias DPO / SFT / empates | 6 / 8 / 36 |
| Win rate DPO (IC 95%) | 0,48 [0,41, 0,55] |
| Win rate en pares de longitud equiparada | 0,479 (n=48) |
| Longitud media de respuesta, SFT -> DPO | 578 -> 588 caracteres |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 4B en 4 bits ocupa en torno a 3-4 GB de VRAM; en bfloat16 completo, alrededor de 8-9 GB. El adaptador LoRA anade un coste marginal.
- GPU recomendadas: fue entrenado en una NVIDIA T4 (Colab), por lo que GPUs modestas son suficientes para inferencia. Para servicio, A100, H100 o L40S permiten mayor throughput.
- Cabe en GPU de consumo: si. En 4 bits entra en tarjetas con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090); en 16 bits requiere 12 GB o mas.
- Opciones de despliegue: PEFT + Transformers (ruta oficial), vLLM con soporte de adaptadores LoRA, TGI. La conversion a GGUF seria necesaria para llama.cpp u Ollama, lo que complica el flujo porque el base esta cuantizado en bnb-4bit.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hieu1126/lab22-dpo-vn-v0 | 4B (base) + LoRA DPO | Heredado del base; entrenado a 768 tokens | Sin benchmarks estandar; win rate DPO 0,48 (IC 0,41-0,55) | other (CC BY-NC en datos; solo investigacion) | HuggingFace (0 descargas) |
| Nguyen11/lab22-dpo-vn | 4B (base) + LoRA DPO | No disponible | No disponible | No disponible | HuggingFace |
| Huanvg02/lab22-dpo-vn | 4B (base) + LoRA DPO | No disponible | No disponible | No disponible | HuggingFace |
| Qwen3-4B-Instruct-2507 (base) | 4B dense | Base original de Qwen3 | Benchmarks publicados por el autor del modelo base | Apache 2.0 | HuggingFace, con amplia adopcion |

Los dos adaptadores comparables (Nguyen11 y Huanvg02) provienen del mismo lab y no publican metricas, por lo que no es posible comparar rendimiento de forma significativa.

## Limitaciones y advertencias

- El intervalo de confianza del win rate (0,41-0,55) contiene 0,5: no hay evidencia de que DPO mejore sobre el modelo SFT. La mayoria de respuestas (con decodificacion greedy) son identicas a las del modelo SFT.
- Ambos modelos (SFT y SFT+DPO) comienzan cada respuesta con tokens sueltos `<tool_call>` / `</tool_call>`; la causa no se conoce.
- La evaluacion se apoya en un unico juez (`Skywork-Reward-V2-Llama-3.2-3B`), que ademas proviene del mismo laboratorio que etiqueto los datos de preferencia, lo que introduce un sesgo de evaluacion.
- Entrenamiento con una sola semilla, datos reducidos (800 pares) y una sola epoca; los resultados no son robustos estadisticamente.
- Licencia `other` con datos SFT en CC BY-NC: uso restringido a estudio e investigacion, sin uso comercial ni en produccion.
- Contexto e idioma limitados en la practica: el adaptador esta alineado solo para vietnamita y entrenado con max_length de 768 tokens.
- Riesgo de alucinacion: inherente al modelo base de 4B; no se ha evaluado especificamente.
- El flujo de tool calling y agentes queda comprometido por los tokens `<tool_call>` erroneos al inicio de la respuesta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hieu1126/lab22-dpo-vn-v0
- Adaptador comparable (mismo lab): https://huggingface.co/Nguyen11/lab22-dpo-vn
- Adaptador comparable (mismo lab): https://huggingface.co/Huanvg02/lab22-dpo-vn
- Repositorio del Lab 22 (Track 3, ejemplo): https://github.com/dovietanh2010/Day22-Track3-2A202600043-DoVietAnh
- Repositorio del Lab 22 (Track 3, ejemplo): https://github.com/huyvanzzz/2A202600773-Nguyen-Van-Huy-Day22-Track3-DPO-Alignment-Lab
- Endpoint de inferencia de terceros: https://friendli.ai/models/solar11781/lab22-dpo-vn
