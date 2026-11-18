# gamug/deberta-v3-news-category-12

## Resumen

`deberta-v3-news-category-12` es un modelo de clasificación zero-shot para noticias financieras cortas, desarrollado por el usuario `gamug` y publicado en Hugging Face bajo licencia MIT. Se trata de un fine-tuning de `MoritzLaurer/deberta-v3-base-zeroshot-v2.0`, un DeBERTa-v3-base entrenado como modelo de inferencia de lenguaje natural (NLI), que se reutiliza aquí como clasificador de entailment para asignar una de 12 categorías temáticas a un texto breve sobre una empresa concreta.

El modelo resuelve un problema muy específico: dado un fragmento de noticia financiera precedido del nombre de la compañía (`<company>: <text>`), estima la probabilidad de entailment de 12 hipótesis (una por etiqueta) y devuelve como categoría la de mayor puntuación. Las etiquetas cubren resultados, fusiones y adquisiciones, gobernanza, regulación, innovación de producto, retribución al accionista, capital humano, sentimiento de analistas, alianzas, daño reputacional, actividad inversora y "otros".

Es relevante porque documenta con transparencia un caso de fine-tuning de un modelo NLI para una taxonomía cerrada, incluyendo métricas honestas (54,1 % de acuerdo de etiqueta en held-out) y una declaración explícita de que no alcanza el umbral del 80 % fijado por el proyecto. Con 184 millones de parámetros y 0,7 GB de pesos, es un modelo pequeño, desplegable en CPU, pero con limitaciones de rendimiento claras que condicionan su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-base (transformer encoder, NLI/entailment) |
| Parámetros totales | 184.423.682 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantización | no disponible (pesos safetensors en fp32/fp16; cuantización GGUF/ONNX no publicada) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `MoritzLaurer/deberta-v3-base-zeroshot-v2.0` (revisión `8e7e5af5`), un DeBERTa-v3-base afinado para NLI y zero-shot classification. Sobre esa base se realizó un fine-tuning como modelo de entailment con 1.216 filas de pares (texto, empresa), cada una con una única etiqueta positiva y cuatro etiquetas negativas muestreadas. El entrenamiento usó 3 épocas, learning rate 2e-5, batch de 4 con acumulación de 4 (batch efectivo 16), longitud máxima 512, precisión fp16 y semilla 0. No se reservó partición de validación: se entrenó con todas las filas.

Las etiquetas fueron asignadas por el propietario del proyecto y revisadas posteriormente por un asistente para garantizar una etiqueta por fila, siguiendo las reglas de `docs/category-taxonomy.md` del repositorio `gamug/portfolio-nlp`. Los textos de entrenamiento no se publican. La innovación técnica es escasa: se trata de un fine-tuning estándar de un modelo NLI para una taxonomía cerrada, sin decodificación especulativa ni atención lineal. El punto diferencial es la formulación: cada categoría se evalúa como una hipótesis textual (`The news about <company> is about <definition>.`) y la probabilidad de entailment actúa como score de la etiqueta.

## Capacidades

- Clasificación zero-shot de textos financieros cortos en una de 12 categorías predefinidas.
- Inferencia de lenguaje natural (entailment) sobre pares premisa-hipótesis.
- Puntuación por etiqueta: devuelve una probabilidad de entailment para cada hipótesis, no solo la etiqueta ganadora.
- Procesamiento de segmentos de empresa de pocas frases (no artículos completos).
- Funcionamiento en inglés exclusivamente.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Clasificación de titulares y sumarios financieros: dado un titular corto sobre una empresa cotizada, el modelo asigna una de las 12 categorías (resultados, fusiones, regulación, etc.) con una probabilidad asociada, útil para enrutar noticias en un pipeline editorial.
- Etiquetado de flujos de noticias en tiempo real: al ser un modelo de 184 M de parámetros, puede ejecutarse en CPU y procesar grandes volúmenes de segmentos cortos con baja latencia, integrándose en un sistema de ingestión de noticias.
- Enriquecimiento de bases de datos de eventos corporativos: permite añadir una categoría temática a registros de noticias ya almacenados, facilitando búsquedas y análisis posteriores por tipo de evento.
- Filtrado previo en pipelines de análisis de sentimiento o riesgo: la categoría asignada puede usarse para dirigir cada noticia a un analizador especializado (por ejemplo, un modelo de sentimiento de analistas para `market_analyst_sentiment`).
- Prototipado rápido de taxonomías cerradas: sirve como referencia para equipos que quieran evaluar la viabilidad de un clasificador NLI zero-shot antes de invertir en un modelo mayor o en anotación humana.
- Monitorización de carteras con reglas simples: un gestor puede configurar alertas cuando una noticia sobre una empresa de su cartera se clasifique como `mergers_acquisitions` o `legal_regulatory`, usando la probabilidad de entailment como umbral de confianza.

## Benchmarks y rendimiento

| Medida | Este modelo | Modelo base zero-shot |
|---|---|---|
| Held-out, 135 filas de una sola empresa, etiquetas previas del propietario, evaluado una vez | 54,1 % (IC 95 %: 45,9–62,3) | 43,7 % |
| 300 subnoticias reales de menos de 1.000 caracteres, etiquetas del asistente, ciego a ambos modelos | 71,3 % (IC 95 %: 66,0–76,3) | 65,7 % |
| Out-of-fold, 1.216 filas de entrenamiento, etiquetas revisadas tras los primeros resultados | 87,8 % | 75,5 % |

El umbral del 80 % fijado por el proyecto para el held-out no se alcanza. El propietario fijó el modelo como predeterminado el 2026-11-15 a sabiendas de ello.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4–0,8 GB en fp16 (184 M de parámetros); menos de 2 GB en fp32.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso una GPU integrada pueden ejecutarlo.
- Cabe en GPU consumer y en CPU: el modelo es adecuado para inferencia en CPU con latencias de decenas de milisegundos por muestra.
- Opciones de despliegue: `transformers` (PyTorch), `ONNX Runtime`, `Optimum`; no se han publicado pesos GGUF para `llama.cpp` ni `Ollama`, y al ser un encoder NLI no es un modelo generativo, por lo que `vLLM` y `TGI` no son la vía natural (aunque `TGI` soporta algunos encoders).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Rendimiento |
|---|---|---|---|---|---|
| `gamug/deberta-v3-news-category-12` | 184 M | 512 | Clasificación zero-shot financiera (12 etiquetas) | MIT | 54,1 % held-out; 71,3 % muestra real |
| `MoritzLaurer/deberta-v3-base-zeroshot-v2.0` | ~184 M | 512 | Clasificación zero-shot genérica (NLI) | MIT | 43,7 % held-out; 65,7 % muestra real |
| `MoritzLaurer/deberta-v3-large-zeroshot-v2.0` | ~435 M | 512 | Clasificación zero-shot genérica (NLI) | MIT | no disponible en la información proporcionada |
| `facebook/bart-large-mnli` | ~407 M | 1024 | Clasificación zero-shot genérica (NLI) | MIT | no disponible en la información proporcionada |

La comparativa se limita al modelo base y a alternativas NLI genéricas de la misma familia; no se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- La etiqueta `other` no se aprende: solo 3 de 39 aciertos en la muestra real.
- Las clases `investor_activity`, `leadership_governance`, `labor_human_capital`, `reputational_harm` y `capital_shareholder_returns` tienen muy pocas filas para medir su rendimiento.
- Las filas held-out son artículos completos y las de entrenamiento segmentos cortos: la cifra de validación cruzada no se traslada a artículos completos.
- Las etiquetas held-out siguen una convención anterior (parte de las calificaciones de analistas se etiquetaban como `investor_activity`); aproximadamente la mitad de esa clase se predice como `market_analyst_sentiment`.
- Una sola semilla y una sola partición: no se midió la variación entre ejecuciones.
- No apto para artículos completos, solo para segmentos cortos de pocas frases.
- Solo inglés; no soporta otros idiomas.
- No debe usarse como asesoramiento financiero.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificación errónea en clases con pocos ejemplos y en textos fuera de distribución.
- Licencia MIT permite uso comercial, pero el rendimiento por debajo del umbral del proyecto desaconseja su uso en producción sin validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gamug/deberta-v3-news-category-12
- Modelo base: https://huggingface.co/MoritzLaurer/deberta-v3-base-zeroshot-v2.0
- Repositorio del proyecto: `gamug/portfolio-nlp` (referenciado en la model card; no se proporciona URL directa en la información disponible)
- Documentación de la taxonomía: `docs/category-taxonomy.md` en el repositorio del proyecto
- Documentación del paso de categoría: `docs/category_step.md` en el repositorio del proyecto
- Documentación de entrenamiento: `docs/category_training.md` en el repositorio del proyecto
