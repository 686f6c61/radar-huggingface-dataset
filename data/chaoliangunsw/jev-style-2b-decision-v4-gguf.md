# chaoliangUNSW/Jev-Style-2B-Decision-v4-GGUF

## Resumen

Jev-Style-2B-Decision-v4-GGUF es la distribución en formato GGUF del modelo Jev-Style-2B-Decision-v4, desarrollado de forma independiente por Chaoliang Yan (usuario chaoliangUNSW en Hugging Face). Se trata de un modelo de decisión especializado en clasificación de texto local, enrutamiento de flujos de trabajo (workflow routing) y puntuación de opciones de elección fija, basado en la arquitectura Qwen3.5 con aproximadamente 1,88 mil millones de parámetros. Su propósito es responder preguntas tipificadas sobre texto e imágenes en inferencia local, sin depender de una API alojada.

La serie Jev-Style se posiciona como un modelo de "sistema uno" (system-one): decisiones rápidas y calibradas sobre entradas de texto, pensado para casos como enrutamiento de LLM, guardrails y clasificación en dispositivos locales. La versión v4 amplía la ventana de contexto a 32.768 tokens (frente a 25.600 de la v3) y mejora notablemente el Decision Index público (44,37 frente a 34,05). El proyecto declara que parte del entrenamiento se realizó con etiquetas suaves destiladas de TypeSafe Jev 1.14 mediante su API pública, manteniendo independencia del proveedor.

Esta distribución GGUF incluye tres cuantizaciones (F16, Q8_0 y Q4_K_M) con un pequeño scorer asociado (`jev-score-v2`) que lee la decisión en un slot de veredicto por opción, y está pensada para ejecutarse con llama.cpp. Las imágenes requieren el runtime PyTorch del repositorio principal; las versiones MLX y GGUF son solo de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen3.5 (transformer decoder, detalles no disponibles) |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | F16 (3,78 GB), Q8_0 (2,01 GB), Q4_K_M (1,27 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien disponible en safetensors en el repositorio base) |

## Arquitectura y entrenamiento

El modelo parte de la familia Qwen3.5 (según los tags del repositorio) y se entrena como modelo de decisión: en lugar de generación libre, produce veredictos tipificados (elección entre opciones, verdadero/falso y puntuaciones) leídos mediante un scorer dedicado (`jev-score-v2`) en un slot de veredicto por opción. La atención se ejecuta en modo de bloques ("block attention"), distinto de la atención causal plana y la prefix-causal; los tests de paridad de la ficha confirman que los ficheros GGUF reproducen la atención con la que el modelo fue entrenado.

En cuanto a datos, la model card declara que la versión 2B v4 se entrenó en parte con etiquetas suaves (soft labels) destiladas de TypeSafe Jev 1.14 a través de su API pública, y que el proyecto es independiente de TypeSafe pese al uso del profesor. No se especifican el número total de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO. Los datos de validación incluyen 1.000 preguntas reservadas de desarrollo (hasta 4.096 tokens: 645 de elección múltiple, 316 de verdadero/falso y 39 de puntuación, con hasta 151 opciones) y un fixture largo de 97 preguntas entre 4.097 y 32.768 tokens.

## Capacidades

- Clasificación de texto local: preguntas tipificadas sobre documentos con veredictos estructurados (elección, verdadero/falso, puntuación).
- Enrutamiento de flujos de trabajo (LLM routing): selección entre opciones con hasta 255 opciones en casos extremos.
- Guardrails y calibración: puntuación de opciones de elección fija con probabilidades calibradas (se reporta delta absoluto máximo de probabilidad por cuantización).
- Contexto largo: hasta 32.768 tokens por llamada, con fixture largo validado (97/97 preguntas con igual top-1 que la referencia en F16 y Q8_0).
- Scoring por lotes: la función `score_many` produce exactamente las mismas puntuaciones que evaluar cada pregunta por separado.
- Soporte de imágenes: solo con el runtime PyTorch del repositorio principal; las distribuciones MLX y GGUF son de texto exclusivamente.
- Inferencia en dispositivo (on-device) con llama.cpp, sin dependencia de API alojada.
- Tool calling, agentes y capacidades multilingües: no disponible (no se documentan).

## Casos de uso

- Enrutamiento de consultas en sistemas multi-modelo: el modelo puede clasificar una petición de usuario y decidir qué modelo o agente debe atenderla, gracias a su diseño de elección fija entre opciones y a su ventana de 32.768 tokens que permite incluir historial y reglas de enrutamiento.
- Guardrails de seguridad en pipelines LLM: clasificación rápida de entradas o salidas (por ejemplo, detección de contenido fuera de política) antes de pasar el texto al modelo principal, con latencia baja al ser un modelo de 2B cuantizado.
- Clasificación de documentos largos: con 32.768 tokens de contexto puede responder preguntas sobre informes, contratos o hilos completos sin fragmentar la entrada; se recomienda Q8_0 o F16 para documentos largos.
- Automatización de flujos empresariales (workflow routing): decisión determinista entre ramas de un proceso (aprobar/rechazar/escalar) integrada en herramientas de orquestación vía llama.cpp.
- Moderación y verificación de afirmaciones: preguntas de verdadero/falso y puntuación calibrada sobre textos, útil como filtro previo en sistemas de revisión.
- Inferencia en dispositivo y en el borde: la cuantización Q4_K_M de 1,27 GB permite ejecutar el modelo en portátiles y equipos sin GPU de gama alta, adecuado para aplicaciones de privacidad reforzada.
- Evaluación y scoring de opciones en lote: `score_many` permite puntuar muchas preguntas sobre el mismo documento de forma eficiente, útil en sistemas de extracción estructurada.

## Benchmarks y rendimiento

Datos publicados por el autor (medidos con el runtime PyTorch del repositorio principal, no re-ejecutados sobre los ficheros GGUF):

| Benchmark | Jev-Style 2B v4 | Jev-Style 2B v3 |
|---|---:|---:|
| Decision Index 0.3 (suite pública, auto-ejecutado, 140.178 peticiones) | 44,37 | 34,05 |
| JevBench v1.4.1, ítems públicos (231), 95% CI 68,9–80,0% | 74,9% | 73,6% |
| Contexto por llamada | 32.768 tokens | 25.600 tokens |

Paridad de las cuantizaciones frente a la referencia FP32 (1.000 preguntas de desarrollo, precisión de referencia 84,4%):

| Fichero | Cuantización | Tamaño | Coincidencia top-1 | Δp máx. abs. | Precisión | Fixture largo |
|---|---|---:|---:|---:|---:|---:|
| F16 | F16 | 3,78 GB | 99,7% | 0,029 | 84,5% | 97/97 |
| Q8_0 | Q8_0 | 2,01 GB | 99,6% | 0,062 | 84,3% | 97/97 |
| Q4_K_M | Q4_K_M | 1,27 GB | 97,4% | 0,321 | 83,6% | 95/97 |

No hay comparaciones con modelos externos (MMLU, HumanEval, GSM8K, etc.); los benchmarks son suites propias del proyecto.

## Requisitos de hardware

- VRAM/RAM estimada: F16 requiere unos 3,78 GB, Q8_0 unos 2,01 GB y Q4_K_M unos 1,27 GB de pesos, más overhead de KV cache según longitud de contexto (hasta 32.768 tokens).
- GPU de referencia en las pruebas: NVIDIA L4 (CUDA, todas las capas en GPU) para el scoring con `jev-score-v2`; el benchmark principal se midió en una A100 (bfloat16) y en Apple MPS (float32).
- Consumer GPU: dado el tamaño (1,27–3,78 GB), cabe con holgura en GPUs domésticas habituales (por ejemplo RTX 3060 o superiores); también es viable en CPU y en Apple Silicon vía Metal, aunque la model card solo documenta verificación en CUDA para v4 y en Metal para la v3.
- Despliegue: llama.cpp (herramientas de conversión y cuantización sin modificar, commit 441df11f); los tags mencionan llama.cpp y on-device. No se documenta soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponible en detalle; la sección de velocidad de la model card (mediciones en NVIDIA L4 con GGUF F16 sobre entradas de 16.385–32.768 tokens) aparece truncada y no aporta cifras completas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Jev-Style 2B v4 (este) | ~1,88 B | 32.768 | Apache 2.0 | GGUF, safetensors | Decision Index 44,37; JevBench 74,9% |
| Jev-Style 2B v3 | ~1,88 B | 25.600 | Apache 2.0 | GGUF | Decision Index 34,05; JevBench 73,6% |
| Jev-Style 0.8B v3 | No disponible | No disponible | No disponible | GGUF | Versión ligera de la serie; datos no disponibles en la ficha |

No se incluyen comparativas con modelos externos de clasificación (por ejemplo, clasificadores BERT-style o routers comerciales) porque no hay datos publicados en la información disponible.

## Limitaciones y advertencias

- Las distribuciones GGUF y MLX son solo de texto: las capacidades sobre imágenes requieren el runtime PyTorch del repositorio principal.
- Q4_K_M es notablemente más ruidoso en entradas largas (95/97 en el fixture largo, Δp máximo 0,321); para documentos largos se recomienda Q8_0 o F16.
- La verificación de los ficheros v4 se realizó únicamente en CUDA; no hay comprobación documentada en Metal para esta versión.
- No se documenta soporte de tool calling, agentes ni idiomas soportados; el uso principal es la clasificación estructurada, no la generación libre de texto.
- El entrenamiento usó salidas de un profesor externo (TypeSafe Jev 1.14 vía API pública), lo que puede heredar sesgos de ese modelo; no se documentan auditorías de sesgo.
- No hay datos publicados sobre riesgo de alucinación, aunque al ser un modelo de decisión con salidas tipificadas el modo de fallo esperable es la clasificación errónea más que la alucinación textual.
- La licencia Apache 2.0 permite uso comercial, pero los benchmarks y datos de entrenamiento detallados requieren consultar el repositorio principal y sus licencias asociadas.
- Los benchmarks son suites propias del proyecto auto-ejecutadas, no evaluaciones de terceros, y los ficheros GGUF no fueron re-ejecutados en ellos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4-GGUF
- Repositorio principal (PyTorch, texto e imágenes): https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4
- Guía de clasificación local: https://jevstyle.com/guides/local-text-classification/
- Guía para elegir un modelo de decisión local: https://jevstyle.com/guides/local-decision-models/
- Configuración y límites del modelo: https://jevstyle.com/models/2b-v4/
- Evidencia de evaluación: https://jevstyle.com/benchmarks/
- Estado del servicio alojado: https://jevstyle.com/api/
- Sitio web del proyecto: https://jevstyle.com
- GitHub: https://github.com/lawrence3699/jev-style
- Modelos anteriores de la serie: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-GGUF, https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-GGUF, https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3-GGUF, https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v3-GGUF
