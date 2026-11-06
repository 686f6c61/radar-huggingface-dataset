# BaiLing/intellisu-coder-pro

## Resumen

intellisu-coder-pro es un servicio de API evaluado bajo el nombre de visualización intellisu-coder-pro y atribuido a la organización 江苏银行 (Bank of Jiangsu). El repositorio de Hugging Face no contiene pesos del modelo: es un registro de evaluación de un servicio de API externo, sin que se afirme arquitectura, número de parámetros, procedencia del entrenamiento ni titularidad verificada de ningún modelo subyacente. El espacio de nombres de Hugging Face identifica la cuenta de alojamiento, que es distinta de la organización declarada.

La relevancia del repositorio reside en que publica resultados reproducibles sobre dos benchmarks: Typed Decisions (400 casos de test, 2.000 decisiones) y SafeAgents Judge Bench (562 llamadas a herramientas de test). Ambos se evalúan mediante un adaptador JSON de chat zero-shot que produce distribuciones de probabilidad autodeclaradas, no logits nativos de un clasificador. Los resultados se publicaron el 3 de noviembre de 2026 tras una evaluación realizada el 31 de octubre de 2026.

Se trata, por tanto, de una ficha de evaluación y no de un modelo con pesos descargables. Cualquier uso en producción requeriría acceso al servicio de API subyacente, cuyas condiciones, licencia y arquitectura no se documentan en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (servicio de API, sin pesos publicados) |
| Idiomas soportados | en, zh |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos; solo evaluación) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo subyacente. La model card indica explícitamente que no se afirma arquitectura, recuento de parámetros, procedencia del entrenamiento upstream ni titularidad verificada del modelo. El repositorio documenta únicamente el protocolo de evaluación: un adaptador JSON de chat zero-shot que devuelve distribuciones de probabilidad autodeclaradas en lugar de logits nativos de clasificador.

Respecto al entrenamiento, la model card señala que el runner de evaluación no realizó ajuste alguno sobre el split de entrenamiento de los benchmarks, pero que la exposición del modelo upstream a dichos datos es desconocida. No hay información sobre número de tokens, composición del dataset, RLHF, DPO ni innovaciones técnicas de decodificación.

## Capacidades

- Generación de texto en inglés y chino (único dato confirmado por los metadatos de idioma).
- Emisión de distribuciones de probabilidad autodeclaradas mediante un adaptador JSON de chat, lo que permite calcular métricas probabilísticas como KL, Brier y ECE.
- Clasificación binaria y por categorías en el contexto de evaluación de seguridad de llamadas a herramientas (SafeAgents Judge Bench).
- Toma de decisiones tipadas (Typed Decisions) con salida en formato JSON estructurado.
- No se documentan capacidades de tool calling nativo, agentes, visión, audio ni modo de razonamiento extendido más allá de la mención a "low reasoning" en el protocolo de evaluación.
- No se dispone de información sobre capacidades multilingües más allá del inglés y el chino.

## Casos de uso

- Evaluación comparativa de servicios de API para clasificación probabilística: el repositorio sirve como referencia metodológica para equipos que quieran replicar el protocolo de adaptador JSON zero-shot sobre sus propios servicios.
- Auditoría de seguridad de agentes: los resultados en SafeAgents Judge Bench (balanced accuracy 0,830, AUROC 0,991) permiten usar el servicio como componente de filtrado de llamadas a herramientas en pipelines de agentes, siempre con validación adicional.
- Moderación de acciones de agentes en producción: con una tasa de falsos bloqueos del 0,333, el servicio es conservador y podría emplearse en capas de pre-filtrado donde el coste de permitir una acción insegura sea alto.
- Clasificación de decisiones con incertidumbre calibrada: el ECE de 0,011837 en Typed Decisions indica una calibración muy ajustada, útil en sistemas que necesiten umbrales de confianza para escalar a revisión humana.
- Investigación en evaluación de modelos: el repositorio documenta revisiones y hashes de dataset, lo que facilita la reproducción de experimentos en entornos académicos.
- Integración en pipelines de CI/CD para regresión de calidad: los ficheros `.eval_results/*.yaml` están pensados para la agregación automática de HF Community Evals, lo que permite monitorizar deriva del servicio a lo largo del tiempo.

## Benchmarks y rendimiento

| Benchmark | Cobertura | Métrica | Resultado |
|---|---|---:|---:|
| Typed Decisions | 400/400 casos, 2.000 decisiones | Accuracy (acuerdo con etiquetas del teacher) | 0,7735 |
| Typed Decisions | Test completo | KL respecto al gold (menor es mejor) | 0,3025644435 |
| Typed Decisions | Test completo | Brier (menor es mejor) | 0,1164229198 |
| Typed Decisions | Test completo | ECE (menor es mejor) | 0,011837 |
| SafeAgents Judge Bench | 562/562 llamadas públicas | Balanced accuracy | 0,830 |
| SafeAgents Judge Bench | Test completo | AUROC | 0,991 |
| SafeAgents Judge Bench | Test completo | False block rate (menor es mejor) | 0,333 |
| SafeAgents Judge Bench | Test completo | Category macro F1 | 0,535 |

Detalles del protocolo: en Typed Decisions se usó razonamiento bajo y un límite de 1.024 tokens de completion incluyendo razonamiento, con 342.613 tokens reportados por la API y cero salidas truncadas o inválidas. En SafeAgents Judge Bench se usó un máximo de 768 tokens de completion, 652.034 tokens reportados y tres salidas JSON/probabilidad inválidas retenidas en el scoring (contabilizadas como allow según la política fail-open oficial). No se realizaron reintentos dependientes de etiqueta ni se emplearon jueces de modelo de pago.

## Requisitos de hardware

- No aplica: el modelo se consume como servicio de API externo y no se publican pesos.
- No es posible estimar VRAM, GPU recomendadas ni latencia de inferencia local a partir de la información disponible.
- Opciones de despliegue local (vLLM, llama.cpp, Ollama, TGI) no disponibles por ausencia de pesos.
- Throughput y latencia: no disponibles; solo se conocen los consumos de tokens reportados por la API durante la evaluación (342.613 tokens en Typed Decisions y 652.034 en SafeAgents Judge Bench).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría, y al tratarse de un servicio de API sin arquitectura ni parámetros declarados no es posible establecer una comparación técnica rigurosa con alternativas.

## Limitaciones y advertencias

- No se publican pesos ni se declara arquitectura, parámetros o procedencia del entrenamiento: la titularidad y las condiciones del modelo upstream no están verificadas.
- La licencia no está disponible, lo que impide determinar si el uso comercial está permitido.
- Los resultados proceden de un adaptador JSON de chat zero-shot con probabilidades autodeclaradas, no de logits nativos de clasificador; no constituyen certificación del organizador ni reproducción exacta de la inferencia nativa.
- Las etiquetas de Typed Decisions son generadas por un modelo (soft labels de un teacher); el acuerdo con ellas no establece corrección financiera, de cumplimiento ni de seguridad real.
- En SafeAgents Judge Bench el dataset contiene solo 39 llamadas permitidas frente a 523 bloqueadas, por lo que la estimación de falsos bloqueos tiene soporte limitado de muestras negativas.
- La tasa de falsos bloqueos del 0,333 es elevada y puede degradar la experiencia en producción si el servicio se usa como filtro estricto.
- La exposición del modelo upstream a los splits de entrenamiento de los benchmarks es desconocida, lo que impide descartar contaminación.
- Solo se declaran idiomas inglés y chino; no hay evidencia de soporte para castellano.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/BaiLing/intellisu-coder-pro
- Dataset Typed Decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset SafeAgents Judge Bench: https://huggingface.co/datasets/harness-hub/safeagents-judge-bench
