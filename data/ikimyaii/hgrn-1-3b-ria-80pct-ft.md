# ikimyaii/hgrn-1.3B-ria-80pct-ft

## Resumen

HGRN-1.3B RIA 80% sparse fine-tuned es un checkpoint de investigación publicado por el usuario ikimyaii en HuggingFace. Se trata de un modelo de generación de texto de 1.364.396.032 parámetros construido sobre la arquitectura HGRN (Hierarchically Gated Recurrent Network) implementada en la librería flash-linear-attention (FLA), al que se le ha aplicado una poda one-shot del 80 % de los pesos mediante el método RIA y, posteriormente, un ajuste fino con máscara fija para intentar recuperar capacidades.

El problema que aborda es la recuperación de rendimiento tras una poda agresiva: sirve como baseline de comparación frente al método CWS en el estudio de modelos dispersos sobre hardware neuromórfico (Intel Loihi). No es un modelo destinado a producción: el propio autor indica que con un 70-80 % de dispersión el modelo no genera texto utilizable y su precisión zero-shot está cerca del azar.

Su relevancia es, por tanto, metodológica. El checkpoint conserva la dispersión del 80 % con los pesos podados almacenados como ceros explícitos en un tensor denso, lo que permite reproducir experimentos de poda, comparar estrategias de recuperación y estudiar el efecto de la dispersión en arquitecturas recurrentes lineales desplegadas sobre hardware event-driven.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network), implementada en flash-linear-attention (FLA) |
| Parametros totales | 1.364.396.032 |
| Longitud de contexto | no disponible (la evaluacion de perplejidad usa ventanas de 2048 tokens sin solapamiento, lo que no implica que sea la longitud de contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (almacenamiento denso con ceros explicitos en las posiciones podadas) |
| Dispersión | 80 % de pesos a cero (estructura RIA, mascara fija) |
| Libreria | fla |
| Modelo base | ikimyaii/hgrn-1.3B-ria-80pct (poda one-shot) |

## Arquitectura y entrenamiento

La arquitectura subyacente es HGRN, un modelo de secuencia recurrentE lineal con puertas jerárquicas incluido en la librería flash-linear-attention. El checkpoint se inicializa desde ikimyaii/hgrn-1.3B-ria-80pct, que a su vez es el resultado de aplicar una poda one-shot del 80 % sobre el modelo denso de referencia (una copia de fla-hub/hgrn-1.3B-100B). La puntuación de importancia de RIA (Zhang et al., ICLR 2024) combina la magnitud relativa de cada peso respecto a su fila y su columna, escalada por el RMS de activación con α = 0,5, y no aplica corrección de pesos.

El ajuste fino posterior se realizó sobre C4 en streaming, con pérdida de entropía cruzada sobre etiquetas de siguiente token, 20.000 pasos, learning rate 2e-05 y batch de 16. La máscara de poda permanece fija: los gradientes en las posiciones podadas se ponen a cero y los pesos podados se vuelven a cero tras cada paso, de modo que el modelo conserva aproximadamente el 80 % de dispersión. Los hiperparámetros completos están en `finetune_meta.json`. Los pesos se guardan en formato denso, por lo que la dispersión no produce aceleración por sí sola: se necesita un kernel disperso o hardware que omita los pesos cero, como Intel Loihi, donde un peso a cero no genera evento sináptico.

## Capacidades

- Generación de texto autoregresiva de siguiente token, en el sentido técnico del pipeline `text-generation`.
- No está ajustado a instrucciones ni a preferencias humanas: no hay RLHF, DPO ni safety tuning.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.
- A efectos prácticos, con el 80 % de dispersión el modelo no produce texto utilizable: la perplejidad en WikiText-2 es de 2.015 frente a 11,8 del denso y la precisión zero-shot media (0,304) está cerca del nivel de azar.

## Casos de uso

- Investigación sobre poda de redes neuronales: el checkpoint funciona como baseline de recuperación tras una poda one-shot del 80 %, comparable directamente con el método CWS bajo el mismo protocolo de evaluación.
- Estudio de métodos de puntuación de importancia: permite reproducir el comportamiento de RIA (magnitud relativa fila/columna escalada por activación) y contrastarlo con otras métricas de poda.
- Experimentos de ajuste fino con máscara fija: sirve para analizar cuánto rendimiento se recupera al reentrenar sin permitir que los pesos podados vuelvan a activarse.
- Evaluación sobre hardware neuromórfico: en Intel Loihi y otros sustratos event-driven, los pesos a cero no generan eventos sinápticos, por lo que este checkpoint permite medir el ahorro computacional real de una dispersión del 80 %.
- Análisis de degradación en tareas zero-shot: los resultados en ARC-Easy, ARC-Challenge, HellaSwag, PIQA, WinoGrande y LAMBADA permiten estudiar qué capacidades se pierden primero al podar arquitecturas recurrentes lineales.
- Benchmarking de kernels dispersos: dado que los pesos se almacenan densamente con ceros explícitos, el modelo es un caso de prueba para comparar el rendimiento de kernels que sí aprovechan la dispersión frente a la ejecución densa estándar.
- Reproducibilidad de pipelines de poda: junto con los scripts de Sparse-LLMs-on-Loihi, permite replicar de principio a fin un flujo de poda, ajuste fino de recuperación y evaluación con lm-evaluation-harness.

## Benchmarks y rendimiento

Resultados declarados por el autor. Las tareas zero-shot se evaluaron con lm-evaluation-harness; ARC-Easy, ARC-Challenge, HellaSwag y PIQA reportan `acc_norm`, y WinoGrande y LAMBADA reportan `acc`. El baseline denso es ikimyaii/hgrn-1.3B-dense-baseline, copia de fla-hub/hgrn-1.3B-100B.

| Metrica | Este modelo (RIA 80 % ft) | Denso |
|---|---|---|
| WikiText-2 PPL (menor es mejor) | 2.015 | 11,8 |
| ARC-Easy (acc_norm) | 0,273 | 0,510 |
| ARC-Challenge (acc_norm) | 0,288 | 0,275 |
| HellaSwag (acc_norm) | 0,258 | 0,480 |
| PIQA (acc_norm) | 0,500 | 0,712 |
| WinoGrande (acc) | 0,506 | 0,528 |
| LAMBADA-OpenAI (acc) | 0,000 | 0,383 |
| Media (6 tareas) | 0,304 | 0,481 |

Datos adicionales aportados por el autor: la perplejidad bajó de 28.681 (poda one-shot, mismo protocolo) a 2.015 tras el ajuste fino; el script de entrenamiento registró una PPL final de 2.002,8 con su propio esquema de evaluación. Para comparar, el método CWS al 80 % alcanza 1.086 tras el mismo ajuste fino y 693 tras la misma destilación.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16 el checkpoint ocupa aproximadamente 2,7 GB (tamaño del repositorio), por lo que con overhead de activaciones y caché es viable en GPUs con 6-8 GB o más.
- GPU recomendadas: cualquier GPU moderna con al menos 8 GB de VRAM. No requiere A100 ni H100 para inferencia; una RTX 3060, RTX 4070 o RTX 4090 es suficiente.
- Cabe en GPU de consumo: sí, el modelo completo en bfloat16 entra holgadamente en tarjetas de consumo actuales.
- Opciones de despliegue: el autor documenta uso directo con `transformers` más `fla` (instalación de `flash-linear-attention`, `transformers` y `torch`) y carga con `AutoModelForCausalLM.from_pretrained(..., torch_dtype=torch.bfloat16)`. No se documentan recetas para vLLM, llama.cpp, Ollama o TGI, y la arquitectura HGRN puede no estar soportada por defecto en algunos de estos motores.
- Aceleración por dispersión: no hay ganancia de velocidad sin un kernel disperso o hardware que omita los pesos cero. En CPU y GPU convencionales la ejecución es densa pese al 80 % de ceros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dispersión | WikiText-2 PPL | Media 6 tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ikimyaii/hgrn-1.3B-ria-80pct-ft (este) | 1,36 B | 80 % (RIA) | 2.015 | 0,304 | MIT | HuggingFace |
| ikimyaii/hgrn-1.3B-cws-80pct-ft-c4 | 1,36 B (no confirmado en la informacion disponible) | 80 % (CWS) | 1.086 | no disponible | no disponible | HuggingFace |
| ikimyaii/hgrn-1.3B-ria-80pct | 1,36 B (no confirmado) | 80 % (RIA, one-shot) | 28.681 | no disponible | no disponible | HuggingFace |
| ikimyaii/hgrn-1.3B-dense-baseline (copia de fla-hub/hgrn-1.3B-100B) | 1,36 B | 0 % | 11,8 | 0,481 | no disponible | HuggingFace |

No se dispone de comparaciones con modelos de otras familias o de otros autores dentro de la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte de que, con una dispersión del 70-80 %, el modelo no produce texto utilizable y su precisión zero-shot está cerca del azar. La PPL de 2.015 frente a 11,8 del denso lo confirma.
- No está ajustado a instrucciones ni a seguridad, y hereda los sesgos del modelo base.
- Los pesos se almacenan de forma densa con ceros explícitos: la dispersión no aporta ninguna aceleración sin un kernel disperso o hardware event-driven.
- LAMBADA-OpenAI obtiene 0,000 de precisión, lo que refleja una pérdida total de capacidad de modelado de dependencias de largo alcance.
- Idiomas: solo inglés declarado; no hay evaluación multilingüe.
- Riesgo de alucinación: no evaluado, pero irrelevante en la práctica dado que la generación de texto no es utilizable.
- Licencia MIT, que en principio permite uso comercial, pero el rendimiento real hace inviable cualquier despliegue en producción.
- Es un artefacto de investigación con 3 descargas y 0 likes en el momento de la consulta; no hay garantía de mantenimiento ni soporte.
- La longitud de contexto y los esquemas de cuantización no están documentados, lo que dificulta planificar despliegues.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los enlaces recuperados corresponden a la cadena de supermercados Monoprix y no guardan relación).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikimyaii/hgrn-1.3B-ria-80pct-ft
- Modelo base (poda one-shot): https://huggingface.co/ikimyaii/hgrn-1.3B-ria-80pct
- Baseline denso: https://huggingface.co/ikimyaii/hgrn-1.3B-dense-baseline
- Modelo original del baseline denso: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Comparativa CWS 80 % ajustado en C4: https://huggingface.co/ikimyaii/hgrn-1.3B-cws-80pct-ft-c4
- Repositorio del estudio de poda: https://github.com/KimiaGholami/Sparse-LLMs-on-Loihi
- Resultados de perplejidad: https://github.com/KimiaGholami/Sparse-LLMs-on-Loihi/blob/main/results/ppl_hgrn_80pct_recovery.json
- Resultados de benchmarks: https://github.com/KimiaGholami/Sparse-LLMs-on-Loihi/blob/main/results/benchmark_hgrn_ria_80pct_ft.json
- Implementación de referencia de CWS: https://github.com/KimiaGholami/CWS
- Trabajo posterior (Weight Sparsity Using Real Loss): https://github.com/KimiaGholami/Weight-Sparsity-Using-Real-Loss
- Trabajo posterior (EHWS): https://github.com/KimiaGholami/EHWS
- Libreria flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Metodo RIA: Zhang et al., ICLR 2024 (URL no disponible en la informacion proporcionada)
- Arnes de evaluacion zero-shot: lm-evaluation-harness (URL no disponible en la informacion proporcionada)
