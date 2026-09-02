# aitups/Qwen3.8-27B-saor

## Resumen

**Qwen3.8-27B-saor** es una versión podada y reempaquetada del modelo **Qwen3.8-27B** de Alibaba, desarrollada por el usuario *aitups*. El objetivo es reducir el tamaño y el coste computacional del modelo original mediante la poda por magnitud de los bloques *feed-forward* (FFN), conservando las conexiones de mayor peso absoluto. El perfil de densidad por capa se optimiza con un algoritmo evolutivo **CMA-ES** sobre un genoma **CPPN** de 466 floats, lo que permite concentrar la esparsidad en capas intermedias mientras se mantienen densas las últimas 20 capas, sensibles antes de la cabeza de salida.

El resultado es un archivo GGUF disperso en formato **D16** (tensores `ffn_dag_adjacency` y `ffn_dag_weights`) que pesa 15,5 GB en cuantización Q4_K, frente a los ~16,7 GB del modelo base. La divergencia KL frente al original es de solo **0.0103** (con n_pos=4), lo que indica una pérdida de calidad mínima para una compresión de arquitectura (D_arch gate/modelo) de 0.1223/0.0408. El modelo está diseñado para ejecutarse con el motor de inferencia **Hayai**, que soporta streaming por capas y offload OpenCL, permitiendo su uso en GPUs con poca VRAM (por ejemplo, una RTX 4050 de 6 GB).

Este modelo es relevante para quienes necesitan desplegar un LLM de 27B parámetros en hardware limitado sin sacrificar demasiado la calidad, aprovechando técnicas de poda dispersa y un formato de pesos no estándar pero eficiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida gated-DeltaNet + attention (modelo base Qwen3.8-27B) con poda por magnitud en bloques FFN |
| Parametros totales | 27.113.478.656 (modelo base, dato safetensors) |
| Parametros activos | No aplicable (poda dispersa, no es MoE) |
| Longitud de contexto | 262 000 tokens (nativo) |
| Tipos de cuantizacion | Q4_K (pesos activos) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B soporta múltiples idiomas, pero la ficha no los detalla) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF con formato disperso D16 (tensores `ffn_dag_adjacency` + `ffn_dag_weights`) |

## Arquitectura y entrenamiento

El modelo base **Qwen3.8-27B** es un transformer denso de 64 capas con una arquitectura híbrida: 48 capas utilizan atención lineal **Gated DeltaNet** y las 16 restantes emplean atención completa. Cada capa contiene un bloque FFN de dimensión `[5120 → 17408]`. El modelo saor aplica una poda por **magnitud** sobre estos FFN: se conservan únicamente las conexiones con mayor valor absoluto de peso, según un perfil de densidad por capa generado por un genoma CPPN de 466 floats optimizado con CMA-ES. El proceso no implica entrenamiento adicional (sin RLHF ni DPO); es un post-procesado que re-empaqueta los pesos activos en Q4_K y almacena la adyacencia en el formato disperso D16.

El perfil de esparsidad deja las **últimas 20 capas completamente densas** (las más sensibles antes del `lm_head`) y concentra la poda en las capas intermedias, con un pico de esparsidad de ~0.31 en la capa 15. Según la model card, una poda uniforme con esparsidad 0.25 produce una divergencia KL de 0.143, mientras que una topología CPPN binaria sin magnitud alcanza KL entre 2.5 y 8.8; el método combinado (magnitud + perfil CPPN) logra una KL de solo 0.0103.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredadas del modelo base Qwen3.8-27B.
- Soporte de código y matemáticas (el modelo original está evaluado en HumanEval, GSM8K, etc., aunque no se reportan resultados para la versión podada).
- Capacidades multilingües del modelo base (no detalladas en la ficha del saor).
- Tool calling y uso como agente: el modelo base soporta funciones y planificación, aunque la poda podría afectar ligeramente a estas tareas.
- No se especifica si la poda conserva la capacidad de visión del modelo base (que incluye un vision tower de ~1B parámetros). El archivo GGUF es solo de texto, por lo que probablemente no se incluya la parte visual.

## Casos de uso

- **Despliegue en GPUs de consumo con poca VRAM**: gracias al streaming por capas de Hayai y al formato D16, el modelo puede ejecutarse en una RTX 4050 de 6 GB, aunque con baja velocidad. Es adecuado para prototipos o entornos con hardware limitado.
- **Inferencia en dispositivos con OpenCL**: el motor Hayai permite offload OpenCL, lo que habilita el uso de GPUs no NVIDIA o iGPUs compatibles.
- **Generación de texto con contexto largo**: la ventana nativa de 262K tokens se mantiene, permitiendo procesar documentos extensos, aunque la poda podría afectar la coherencia en tramos muy largos.
- **Investigación en poda dispersa**: el modelo sirve como referencia para estudiar el impacto de la poda por magnitud con perfiles CPPN en arquitecturas híbridas.
- **Aplicaciones embebidas o edge**: al reducir el tamaño a 15,5 GB en Q4_K, es factible almacenarlo en sistemas con poco almacenamiento, aunque el motor de inferencia no es estándar.
- **Automatización de tareas de texto sin requisitos críticos de latencia**: por ejemplo, resúmenes, clasificación o extracción de información, donde la pérdida de calidad es mínima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta versión podada. La model card solo reporta métricas de divergencia y compresión:

| Métrica | Valor |
|---|---|
| Divergencia KL (vs base, n_pos=4) | 0.0103 |
| Compresión D_arch (gate / modelo) | 0.1223 / 0.0408 |
| Capas esparsas / densas | 45 / 20 |
| Método de poda | Magnitud (top-\|w\|) + perfil CPPN |

Para contexto, el modelo base Qwen3.8-27B obtiene resultados competitivos en razonamiento y código, pero no se dispone de comparativas directas con el saor.

## Requisitos de hardware

- **VRAM mínima**: 6 GB (probado con RTX 4050) usando el modo `--memory-strategy minimal` de Hayai, que activa el streaming por capas.
- **Sin requisito de VRAM**: el streaming por capas puede funcionar incluso con muy poca memoria, a costa de una generación lenta.
- **GPU recomendada**: cualquier GPU con soporte OpenCL y al menos 16 GB de VRAM para mantener el modelo residente y obtener una velocidad aceptable.
- **Motor de inferencia**: exclusivamente **Hayai** (https://github.com/hayai-org/hayai), que lee el formato D16 nativo. No es compatible con llama.cpp, Ollama o vLLM sin modificaciones.
- **Latencia/throughput**: no se proporcionan cifras concretas. La model card indica que en una RTX 4050 la generación es "lenta"; en hardware superior se espera un rendimiento razonable para un modelo de 27B cuantizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | FP16/BF16, GGUF | Apache-2.0 | HuggingFace, vLLM, etc. |
| Qwen3.8-27B-saor | 27B (poda dispersa) | 262K | Q4_K (D16) | Apache-2.0 | Solo con Hayai |
| Otros modelos podados similares | No disponible | — | — | — | No se han identificado alternativas comparables en la información disponible |

La principal diferencia frente al original es el tamaño reducido (15,5 GB vs ~16,7 GB) y la compatibilidad restringida a un motor específico. La pérdida de calidad es pequeña según la KL, pero no hay benchmarks que lo confirmen.

## Limitaciones y advertencias

- **Compatibilidad limitada**: el formato D16 solo lo entiende el motor Hayai, lo que impide usar herramientas estándar como llama.cpp u Ollama.
- **Riesgo de alucinaciones**: al ser una versión podada, la calidad de las respuestas puede degradarse en tareas complejas, aunque la KL baja sugiere un impacto moderado.
- **Sesgos**: no se han evaluado sesgos en esta versión; el modelo base puede heredar sesgos de sus datos de entrenamiento.
- **Contexto largo**: aunque la ventana nativa de 262K se mantiene, la poda de los FFN podría afectar la coherencia en secuencias muy largas.
- **Licencia**: Apache-2.0 permite uso comercial, pero es necesario verificar la licencia del modelo base (también Apache-2.0) y las condiciones de los pesos originales de Qwen.
- **Reproducibilidad**: el perfil de esparsidad se puede regenerar con el loop evolutivo de SAOR, pero el código completo no está disponible públicamente en el repositorio (solo se menciona bajo demanda).
- **Sin soporte de visión**: el archivo GGUF es solo de texto; la parte visual del modelo base no se incluye.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aitups/Qwen3.8-27B-saor
- Modelo base (unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Modelo base original (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- Motor de inferencia Hayai: https://github.com/hayai-org/hayai
- Página de Qwen3.8-27B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Análisis técnico en kingy.ai: https://kingy.ai/blog/qwen3-8-27b-specs-benchmarks-local-hardware/
