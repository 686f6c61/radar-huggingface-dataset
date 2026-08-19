# jvonrad/OLMo-2-7B-GRPO-ladder-s6500

## Resumen

OLMo-2-7B-GRPO-ladder-s6500 es un adaptador LoRA (r=128, alpha=256) desarrollado por Jonathan von Rad sobre el modelo base `allenai/OLMo-2-1124-7B` de AI2. Forma parte de una investigación sobre consistencia translingüística en el recuerdo factual, utilizando un objetivo de aprendizaje por refuerzo GRPO (Group Relative Policy Optimization) con una variante denominada "laddered all-correct bonus". El adaptador se entrenó sobre el dataset `jvonrad/PolyFact-Clean` con 10.000 hechos en 12 idiomas, y se presenta como un checkpoint intermedio (paso 6.500 de 10.000) de un estudio controlado que compara distintos objetivos de optimización (SFT, DCO, CM-Align y GRPO).

El modelo está diseñado para mejorar la recuperación de hechos factuales de forma consistente en múltiples idiomas, un problema relevante para aplicaciones multilingües donde los modelos suelen mostrar sesgo hacia el inglés. Los resultados reportados en la model card muestran mejoras en varias métricas respecto al modelo base, especialmente en generación de forma libre (KLAR) tanto en idiomas vistos como no vistos durante el entrenamiento. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: OLMo-2-1124-7B) + adaptador LoRA |
| Parametros totales | 7B (modelo base) + adaptador LoRA (tamano del repo: 1.3 GB) |
| Parametros activos | no disponible (el adaptador LoRA se aplica sobre todos los parametros del base) |
| Longitud de contexto | no disponible (depende del modelo base OLMo-2-1124-7B; no se especifica en la informacion) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base puede cuantizarse con metodos estandar) |
| Idiomas soportados | en, de, es, fr, pt, id, ru, zh, ar, ja, sw, bn (12 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |

## Arquitectura y entrenamiento

El modelo base es OLMo-2-1124-7B, un transformer decoder-only de 7.000 millones de parametros desarrollado por el Allen Institute for AI (AI2). Sobre este base se entrena un adaptador LoRA de rango 128 y alpha 256, que modifica las proyecciones de atencion y MLP durante el entrenamiento. El metodo de entrenamiento es GRPO (Group Relative Policy Optimization), una variante de PPO que no requiere un critic separado y utiliza un grupo de respuestas muestreadas para calcular ventajas relativas. La variante "laddered all-correct bonus" introduce un incentivo escalonado: el modelo recibe una recompensa adicional si responde correctamente en todos los idiomas, con un bonus que crece segun el numero de idiomas acertados de forma consecutiva.

El entrenamiento se realizo sobre el dataset `PolyFact-Clean`, que contiene 10.000 hechos factuales curados en 12 idiomas. El objetivo es mejorar la consistencia translingual: que un mismo hecho sea recordado correctamente en todos los idiomas, no solo en ingles. La evaluacion reportada incluye metricas como PolyFact (accuracy sobre test split de 2.039 hechos), TotCons (fraccion de hechos correctos en los 12 idiomas), RankC@4, BMLAMA-53, G-MMLU-Lite y KLAR (generacion de forma libre sobre 17 idiomas, separados en 7 vistos y 10 no vistos).

## Capacidades

- Generacion de texto en 12 idiomas (en, de, es, fr, pt, id, ru, zh, ar, ja, sw, bn) con mejora especifica en el recuerdo de hechos factuales.
- Razonamiento factual multilingue: dado un prompt de pregunta cerrada (sin opciones), el modelo genera la respuesta correcta con mayor frecuencia que el modelo base, especialmente en idiomas no ingleses.
- Consistencia translingual: el entrenamiento con GRPO con bonus escalonado busca que una misma respuesta sea correcta en todos los idiomas, lo que reduce la disparidad entre idiomas.
- Capacidad de adaptacion via LoRA: al ser un adaptador, se puede combinar con el modelo base o con otros adaptadores para tareas especificas.
- Soporte de tool calling y agentes: no se menciona en la informacion; el modelo base OLMo-2-1124-7B puede tener capacidades generales, pero no se reportan especificas para este adaptador.
- No se reportan capacidades de vision, audio o thinking mode.

## Casos de uso

- Recuperacion de conocimiento multilingue en sistemas de QA: el modelo puede responder preguntas factuales en 12 idiomas con mayor precision que el base, util para asistentes virtuales o motores de busqueda internos que atienden a usuarios de distintas lenguas.
- Verificacion de hechos en contenido multilingue: dado un texto en cualquier idioma soportado, el modelo puede extraer afirmaciones factuales y contrastarlas con su conocimiento, ayudando a detectar desinformacion.
- Generacion de contenido localizado: al mejorar el recuerdo de hechos en idiomas como suajili o bengali, puede usarse para redactar articulos, descripciones de productos o noticias con datos correctos en esos idiomas.
- Entrenamiento de modelos mas pequenos o destilacion: el adaptador puede servir como profesor para destilar conocimiento translingual en modelos mas eficientes.
- Evaluacion comparativa de metodos de RL: al ser parte de un estudio controlado, puede usarse como referencia para investigar el impacto de distintos objetivos de aprendizaje por refuerzo en tareas multilingues.
- Sistemas de traduccion asistida con consistencia factual: aunque no es un modelo de traduccion, puede usarse para verificar que un hecho traducido se mantenga consistente entre idiomas, integrandose en pipelines de post-edicion.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluacion comparando el adaptador con el modelo base. Se incluyen las siguientes metricas (accuracy en porcentaje salvo indicacion):

| Modelo | PolyFact | TotCons | RankC | BMLAMA-53 | G-MMLU-Lite | KLAR seen | KLAR held-out |
|---|---|---|---|---|---|---|---|
| Base (`allenai/OLMo-2-1124-7B`) | 44.43 | 1.72 | 57.29 | 17.89 | 44.45 | 24.56 | 13.30 |
| **OLMo-2-7B-GRPO-ladder-s6500** | 46.81 | 1.96 | 57.22 | 20.33 | 44.89 | 32.96 | 19.21 |

Interpretacion: el adaptador mejora en PolyFact (+2.38 puntos), TotCons (+0.24), BMLAMA-53 (+2.44) y KLAR tanto en idiomas vistos (+8.4) como no vistos (+5.91). RankC se mantiene practicamente igual (-0.07) y G-MMLU-Lite mejora ligeramente (+0.44). No se reportan comparaciones con otros modelos o metodos en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero (1.3 GB en safetensors), pero requiere cargar el modelo base OLMo-2-1124-7B completo en memoria.
- El modelo base en bfloat16 ocupa aproximadamente 14 GB de VRAM (7B parametros x 2 bytes). Con el adaptador, la memoria adicional es minima (menos de 1 GB).
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM para inferencia en bfloat16 (por ejemplo, RTX 4090, A100 40GB, H100). En consumer, una RTX 4080 o 4090 puede ejecutarlo con cuantizacion de 8 bits o 4 bits.
- Opciones de despliegue: al ser un modelo PEFT, se puede cargar con `transformers` + `peft` en Python. Para servir en produccion, se puede usar vLLM con soporte de adaptadores LoRA (vLLM tiene integracion con PEFT), o TGI (Text Generation Inference) si se convierte a un formato compatible.
- Tambien se puede usar con llama.cpp si se fusiona el adaptador con el base y se convierte a GGUF, aunque no se proporcionan instrucciones especificas.
- Latencia y throughput: no se proporcionan datos en la informacion disponible. Dependera del hardware y de la implementacion de inferencia.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros adaptadores o modelos multilingues en la informacion proporcionada. La model card menciona que el estudio controlado compara GRPO con SFT, DCO y CM-Align sobre los mismos datos, pero no se incluyen los resultados de esos metodos en la ficha. Como referencia, se puede comparar con el modelo base y con otros adaptadores del mismo autor (por ejemplo, `jvonrad/OLMo-2-7B-grpo`), pero no hay datos publicos en la informacion suministrada.

| Modelo | Parametros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| `allenai/OLMo-2-1124-7B` (base) | 7B | no disponible | Apache 2.0 | Modelo base sin adaptacion |
| `jvonrad/OLMo-2-7B-GRPO-ladder-s6500` (este) | 7B + LoRA | no disponible | Apache 2.0 | Adaptador con GRPO ladder |
| `jvonrad/OLMo-2-7B-grpo` (otro adaptador del autor) | 7B + LoRA | no disponible | Apache 2.0 | Adaptador GRPO sin ladder (no se proporcionan detalles) |

No se dispone de informacion sobre otros modelos comparables en la misma categoria (adaptadores LoRA multilingues con RL).

## Limitaciones y advertencias

- El adaptador se ha entrenado especificamente sobre hechos factuales de `PolyFact-Clean`; su rendimiento en otros dominios (razonamiento general, codigo, creatividad) puede no diferir del modelo base o incluso degradarse ligeramente.
- La consistencia translingual se evalua sobre 12 idiomas, pero la metrica KLAR incluye 17 (7 vistos + 10 no vistos). No se garantiza un comportamiento uniforme en todos los idiomas del mundo.
- El modelo es un checkpoint intermedio (paso 6.500 de 10.000); el entrenamiento no se completo, por lo que podria haber margen de mejora o de sobreajuste no evaluado.
- Al ser un adaptador LoRA, requiere el modelo base completo para funcionar; no es un modelo autonomo. Si se utiliza el base con cuantizacion, el adaptador debe ser compatible con esa cuantizacion.
- No se reportan evaluaciones de sesgos, toxicidad o alucinacion especificas para este adaptador. Es probable que herede los sesgos del modelo base OLMo-2-1124-7B.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir correctamente y no se ofrece garantia. El paper asociado (arXiv:2606.06586) proporciona detalles adicionales.
- Para produccion, se recomienda validar el rendimiento en el dominio y los idiomas de uso, ya que las mejoras son modestas en algunas metricas (por ejemplo, TotCons sigue siendo muy baja: 1.96%).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jvonrad/OLMo-2-7B-GRPO-ladder-s6500
- Dataset `PolyFact-Clean`: https://huggingface.co/datasets/jvonrad/PolyFact-Clean
- Paper (arXiv): https://arxiv.org/abs/2606.06586 (referencia: von Rad, 2026, "Improving Cross-Lingual Factual Recall via Consistency-Driven Reinforcement Learning")
- Modelo base `allenai/OLMo-2-1124-7B`: https://huggingface.co/allenai/OLMo-2-1124-7B
- Repositorio OLMo de AI2: https://github.com/allenai/OLMo
- Repositorio OLMo-ladder (escalado de tareas): https://github.com/allenai/OLMo-ladder
