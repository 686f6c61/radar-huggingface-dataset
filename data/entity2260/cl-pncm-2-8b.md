# entity2260/cl-pncm-2.8b

## Resumen

C-LPNCM-2.8B (Calibrated Looped-Pointer Next-Concept Model) es un modelo de lenguaje de 2,89 mil millones de parámetros físicos desarrollado por el usuario entity2260 y publicado en Hugging Face bajo licencia MIT. Se construye sobre el paradigma de Next-Concept Modeling (NCM) descrito en el paper arXiv:2610.14162, y propone una alternativa a la generación token a token: comprime secuencias en "parches semánticos" mediante detección de picos de entropía de Shannon, los cuantiza con una jerarquía multiescala (Cosine VQ + 4 niveles FSQ) y razona de forma autorregresiva en ese espacio de conceptos.

La arquitectura es un transformer puro de tres torres con cuatro módulos: un codificador local de tokens y parches, un núcleo latente causal de 20 capas con un enrutador epistémico calibrado (Brier), un refinador de equilibrio con pesos atados que itera hasta 8 veces, y un decodificador de superficie de doble ruta que combina punteros de concepto y copia causal verbatim. El modelo declara un cómputo efectivo de aproximadamente 3,60B de parámetros gracias a los bucles de refinamiento con pesos compartidos.

Su relevancia radica en dos ideas: el cómputo de test-time adaptativo (entre 1 y 8 bucles según la dificultad del span) y la capacidad de abstención epistémica ante entradas fuera de distribución. Con 2,94B de parámetros reales en safetensors, 5,38 GB en disco y un requisito de VRAM de 5,88 GB en bfloat16, está pensado para ejecutarse en una sola GPU de consumo o profesional de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer puro de 3 torres y 4 módulos (codificador de tokens/parches, núcleo latente causal, refinador de equilibrio con pesos atados, decodificador de superficie de doble ruta); sin difusión |
| Parametros totales | 2.938.013.606 (2,94B según safetensors; la model card declara 2.887.665.414 físicos y ~3,60B efectivos) |
| Parametros activos | No aplica (no es MoE); ~3,60B de cómputo efectivo con hasta 8 bucles de refinamiento con pesos atados |
| Longitud de contexto | No disponible de forma explícita; ventana local de codificación W=128 tokens y parches de concepto de 1 a 8 tokens |
| Tipos de cuantizacion | Pesos publicados en bfloat16; no se documentan variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | Inglés (en) según la model card; el campo de idiomas de Hugging Face figura como no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (2 archivos, 5,38 GB en disco) |

## Arquitectura y entrenamiento

El modelo se organiza en cuatro módulos. El módulo 1 es un codificador causal de ventana local (6 capas, dimensión 1536, GQA 24Q/6KV) que detecta fronteras de parche mediante picos de entropía de Shannon (umbral τ_H = 2,4 bits) y cuantiza cada parche con un codebook Cosine VQ de 16.384 códigos y cuatro niveles FSQ en cascada (8, 8, 8, 6, 5 estados por nivel). Mantiene además un banco de memoria sin cuantizar (K_raw, V_raw) para copia verbatim. Un adaptador isométrico de una capa proyecta de 1536 a 3072 dimensiones.

El módulo 2 es el núcleo latente causal (20 capas, dimensión 3072, GQA 24Q/6KV) que razona autorregresivamente sobre conceptos e incorpora un enrutador de decisión epistémica con calibración Brier, política de longitud de span y verificador de valor. El módulo 3 es el refinador de equilibrio: 4 capas con pesos atados iteradas hasta 8 veces (32 capas efectivas), con inyección de anclas, atención cruzada causal a los estados del núcleo y halting adaptativo estilo ACT. El módulo 4 decodifica tokens de superficie en paralelo combinando punteros de concepto y copia causal desde el banco de memoria, con compuerta dinámica g ∈ [0, 1] y fallback `<NULL_PTR>`.

La model card menciona entrenamiento con GRPO (optimización de política con recompensas) y actualizaciones EMA en el codebook VQ, pero no detalla el volumen de tokens, la composición del dataset ni las fases de alineación. No se especifican datos de preentrenamiento ni de ajuste fino supervisado.

## Capacidades

- Generación de texto autorregresiva en espacio de conceptos con decodificación paralela de spans.
- Razonamiento calibrado: enrutador epistémico que decide entre ruta rápida (1-2 bucles), verificación deliberativa (4 haces, hasta 8 bucles) o abstención ante entradas no verificables.
- Copia verbatim sin pérdida mediante banco de memoria sin cuantizar y puntero causal, útil para citas literales y extracción.
- Cómputo de test-time adaptativo (K* entre 1 y 8) según la dificultad del span.
- Abstención ante entradas fuera de distribución (la model card declara 100 % de abstención OOD y error Brier de 0,0216).
- Capacidades multilingües: solo se declara inglés.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente.
- Visión, audio o modo thinking explícito: no disponibles.

## Casos de uso

- Extracción y copia literal de fragmentos: el banco (K_raw, V_raw) y el puntero causal permiten reproducir texto exacto sin degradación por cuantización, adecuado para tareas de citación y extracción de entidades en documentos.
- Clasificación con abstención: el enrutador epistémico calibrado permite descartar entradas dudosas en pipelines de moderación o triaje, derivando a revisión humana cuando la confianza es baja.
- Razonamiento con presupuesto variable: en entornos con latencia estricta se puede forzar la ruta de 1-2 bucles para consultas simples y reservar los 8 bucles para casos complejos.
- Prototipado e investigación en NCM: sirve como referencia reproducible para estudiar decodificación en espacio de conceptos, cuantización RVQ-FSQ y refinamiento con pesos atados.
- Despliegue en una sola GPU: con 5,88 GB de VRAM en bfloat16 cabe en una T4, L4 o A100, lo que facilita entornos de desarrollo y demos.
- Generación de texto en inglés con contexto local: tareas de continuación y resumen de pasajes cortos donde la ventana local de 128 tokens y los parches de hasta 8 tokens son suficientes.
- Evaluación de calibración: el error Brier reportado y la abstención OOD lo hacen útil como banco de pruebas para métricas de incertidumbre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas internas de calibración y abstención (error Brier de 0,0216 y 100 % de abstención OOD), sin comparaciones en MMLU, HumanEval, GSM8K ni otros conjuntos estándar.

## Requisitos de hardware

- VRAM de inferencia: 5,88 GB en bfloat16 (L4/A100) y aproximadamente 6,1 GB en float16 (T4), según la model card.
- GPU recomendadas: T4, L4 y A100 como mínimo; cualquier GPU con al menos 6-8 GB de VRAM libre.
- GPU de consumo: cabe en tarjetas con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 3070); no se documenta su comportamiento en GPUs de 6 GB.
- Despliegue: la model card indica transformers con `custom_code` (clase `CLPNCMForCausalLM`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF limita las opciones de inferencia en CPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| C-LPNCM-2.8B | 2,94B (3,60B efectivos) | No disponible (ventana local 128) | MIT | safetensors bf16 | Paradigma NCM, decodificación por conceptos, abstención calibrada |
| Qwen2.5-3B | 3,09B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Transformer denso estándar, amplia disponibilidad de cuantizaciones |
| Llama 3.2-3B | 3,21B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Transformer denso, multilingüe, ecosistema maduro |
| Phi-3.5-mini | 3,82B | 128.000 tokens | MIT | safetensors, GGUF | Transformer denso con foco en razonamiento |

La comparativa se basa en características publicadas de cada modelo; no se dispone de benchmarks comunes que permitan comparar rendimiento de forma directa con C-LPNCM-2.8B.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés; el rendimiento en castellano u otras lenguas no está documentado.
- Contexto: no se especifica una longitud de contexto global; la ventana local de 128 tokens y los parches de hasta 8 tokens pueden limitar tareas de contexto largo.
- Ecosistema: requiere `custom_code` y no hay pesos GGUF, GPTQ ni AWQ, lo que restringe el despliegue a transformers y a GPUs con suficiente VRAM.
- Madurez: el modelo tiene muy poca tracción (318 descargas, 1 like) y una única versión publicada; no hay evidencia de uso en producción.
- Benchmarks: ausencia de resultados en conjuntos estándar, lo que impide validar sus capacidades frente a alternativas consolidadas.
- Alucinación: aunque declara abstención OOD, no hay datos independientes que confirmen el comportamiento fuera del dominio de entrenamiento.
- Sesgos: no se documenta ningún análisis de sesgos ni composición del dataset de entrenamiento.
- Licencia: MIT permite uso comercial, pero al tratarse de un modelo de investigación conviene auditar su comportamiento antes de integrarlo en producción.
- Fechas: la model card y el paper referenciado (arXiv:2610.14162) corresponden a fechas posteriores a las habituales de publicación; verificar su disponibilidad real antes de citarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/entity2260/cl-pncm-2.8b
- Paper NCM: https://arxiv.org/abs/2610.14162
- Licencia MIT: https://opensource.org/licenses/MIT
