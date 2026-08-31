# JoTalbot/ua-legal-lm

## Resumen

ua-legal-lm es un modelo de lenguaje de tipo GPT (decoder transformer) entrenado desde cero por JoTalbot exclusivamente con datos abiertos del ámbito legal ucraniano. El entrenamiento se realizó sobre metadatos de decisiones judiciales del Registro Unificado de Decisiones Judiciales de Ucrania (EDRSR), el Registro Unificado de Entidades Legales (EDR) y el registro de contribuyentes del IVA. El modelo se publica como un experimento de investigación con datos abiertos, sin documentación técnica detallada.

El modelo se entrenó durante 600 pasos, con una pérdida de validación de 4.5521 (perplejidad aproximada de 94.8), lo que indica un ajuste muy preliminar. No se especifican el número de parámetros, la longitud de contexto ni la arquitectura exacta más allá de ser un GPT en PyTorch. El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que los pesos podrían no estar disponibles o ser de tamaño mínimo. Su relevancia actual es limitada, pero puede servir como punto de partida para investigaciones sobre modelos legales en ucraniano con datos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT (transformer decoder) en PyTorch |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ucraniano (uk) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (state_dict + config), `tokenizer.json` (BPE) |

## Arquitectura y entrenamiento

La arquitectura se describe únicamente como un modelo GPT en PyTorch, sin especificar el número de capas, dimensiones de atención ni el tamaño del vocabulario. El entrenamiento se realizó desde cero (from-scratch) sobre datos abiertos ucranianos: metadatos de decisiones judiciales del EDRSR, datos del registro de entidades legales (EDR) y del registro de contribuyentes del IVA. El pipeline de datos está disponible en el repositorio GitHub `JoTalbot/ukraine`. Se utilizó un tokenizador BPE. El entrenamiento constó de 600 pasos, con una pérdida de validación de 4.5521 (perplejidad ≈ 94.8). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. No hay información sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto en ucraniano, presumiblemente orientada a dominios legales (decisiones judiciales, registros de empresas, datos fiscales).
- No se documentan capacidades de razonamiento, código, matemáticas, visión, tool calling, agentes ni modos de pensamiento.
- El modelo es monolingüe (ucraniano) según la etiqueta de idioma.
- No hay evidencia de capacidades multilingües ni de soporte para funciones avanzadas.

## Casos de uso

Dado el estado preliminar del modelo y la falta de documentación sobre su rendimiento, los casos de uso son especulativos y no recomendados para producción. Se indican posibles aplicaciones de investigación:

- Investigación académica sobre modelos de lenguaje legales en ucraniano: el modelo puede servir como base para estudiar el entrenamiento desde cero con datos abiertos judiciales.
- Experimentación con pipelines de datos legales: el repositorio GitHub permite reproducir el proceso de recopilación y limpieza de datos del EDRSR y EDR.
- Evaluación de modelos en tareas legales ucranianas: el modelo podría evaluarse con el benchmark UA-Legal-Bench (si se publican resultados), aunque no hay datos al respecto.
- Prototipado de sistemas de búsqueda semántica en jurisprudencia ucraniana: con un ajuste adicional, podría explorarse su uso para recuperación de información, pero no hay evidencia de calidad.
- Análisis de riesgos de privacidad en datos legales abiertos: el modelo se entrenó con datos supuestamente anonimizados, lo que permite estudiar la filtración de información personal.
- Formación en técnicas de entrenamiento de LLMs desde cero: su pequeño tamaño y código abierto lo hacen accesible para fines didácticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este modelo en la información disponible. Existe un benchmark llamado UA-Legal-Bench (arxiv 2605.29170) para evaluar modelos en razonamiento legal ucraniano, pero no se reportan resultados de ua-legal-lm en él. La perplejidad de validación de 94.8 es alta, lo que sugiere un rendimiento limitado en generación de lenguaje natural.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware. Dado que el tamaño del repositorio es 0.0 GB, es probable que los pesos no estén publicados o sean extremadamente pequeños. No se puede estimar VRAM, GPUs recomendadas ni opciones de despliegue. Se recomienda contactar al autor o revisar el repositorio GitHub para obtener más detalles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. No se conocen modelos legales ucranianos de tamaño similar con documentación pública. El benchmark UA-Legal-Bench podría servir para comparar, pero no hay resultados disponibles.

## Limitaciones y advertencias

- El modelo se entrenó solo durante 600 pasos, lo que indica un ajuste muy preliminar y probablemente una calidad de generación baja (perplejidad ≈ 94.8).
- No hay documentación sobre sesgos, alucinaciones o limitaciones de contexto.
- La licencia no está especificada, por lo que el uso comercial es incierto y requiere consultar al autor.
- El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que los pesos podrían no estar disponibles o ser de tamaño mínimo; no se puede verificar su funcionamiento.
- Los datos de entrenamiento provienen de registros públicos, pero no se detalla el proceso de anonimización más allá de una afirmación en la model card.
- No se recomienda su uso en producción para tareas legales reales debido a la falta de validación y documentación.

## Enlaces

- HuggingFace: https://huggingface.co/JoTalbot/ua-legal-lm
- Repositorio GitHub del pipeline: https://github.com/JoTalbot/ukraine
- Benchmark UA-Legal-Bench (paper): https://arxiv.org/abs/2605.29170
- PDF del paper: https://arxiv.org/pdf/2605.29170
