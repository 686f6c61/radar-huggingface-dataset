# androidli/Sage-S2.1-Flash-EXL3-3.0bpw

## Resumen

Sage-S2.1-Flash EXL3 3.0bpw es una cuantización de precisión reducida del modelo Sage-S2.1-Flash, un Mixture-of-Experts de 321.000 millones de parámetros desarrollado por InternLM. La conversión la publica el usuario androidli mediante la herramienta exllamav3 y aplica un esquema de cuantización EXL3 con codebook MCG a 3,0 bits por peso, limitado exclusivamente a las proyecciones de los expertos enrutados (`gate_proj`, `up_proj`, `down_proj`). El resto de tensores (atención, expertos compartidos, embeddings, normalizaciones y cabeza MTP) se mantiene en la precisión del modelo original.

El objetivo declarado es permitir la ejecución de un modelo de 321B en dos máquinas de clase DGX Spark con 128 GB de memoria unificada cada una, una GPU por nodo. Esto sitúa el checkpoint en el terreno de la inferencia de gran escala sobre hardware de escritorio de gama alta, un nicho donde las cuantizaciones agresivas de 3 bits resultan críticas para reducir la huella de memoria.

En el momento de redactar esta ficha, el repositorio es un marcador de posición: los pesos aún no están disponibles para descarga y la conversión sigue en curso. El autor advierte explícitamente de que no se proporcionará ninguna evaluación independiente de calidad (ni perplejidad, ni KLD, ni benchmarks), por lo que debe tratarse como un checkpoint no validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (transformer), según modelo base internlm/Sage-S2.1-Flash |
| Parametros totales | 321B (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3, codebook MCG, 3,0 bits por peso (solo expertos enrutados) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | EXL3 (exllamav3) |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts de 321.000 millones de parámetros. La información disponible no detalla la arquitectura interna del transformer, el número de expertos, el enrutamiento ni la composición del dataset de entrenamiento, por lo que esos datos deben consultarse en la model card del modelo original de InternLM.

La cuantización se genera con `convert.py` de exllamav3 a 3,0 bpw con codebook `mcg` y 250 filas de calibración de 2048 tokens. Durante la conversión se cuantizan todos los tensores a 3 bpw y después se reemplazan los no expertos por sus valores de origen, de modo que solo los expertos enrutados quedan cuantizados. Los expertos enrutados provienen de Sage-S2.1-Flash-FP8 y el resto de tensores de Sage-S2.1-Flash. La conversión se reparte entre dos máquinas (proceso primario y worker remoto) de forma bit-exacta, sin alterar los pesos resultantes, usando la herramienta exl3-dist-quant.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Sage-S2.1-Flash (no verificados en este checkpoint).
- Soporte de entradas multimodales según el modelo base, aunque el autor indica que dependen del motor de inferencia y no están probadas en esta cuantización.
- Cabeza MTP (multi-token prediction) conservada en precisión de origen.
- Tool calling, function calling, agentes y capacidades multilingües: no disponible en la información proporcionada para este checkpoint.

## Casos de uso

- Despliegue de un MoE de 321B en dos nodos DGX Spark: el objetivo declarado de la cuantización es repartir el modelo entre dos máquinas con 128 GB de memoria unificada, una GPU por nodo, reduciendo la huella de los expertos enrutados a 3,0 bpw.
- Investigación sobre cuantización extrema: sirve para estudiar el impacto de 3,0 bpw con codebook MCG en un MoE de gran tamaño, comparando contra el modelo FP8 de origen en tareas propias.
- Experimentación con EXL3 y exllamav3: útil para validar flujos de conversión distribuida y el rendimiento del motor exllamav3 con modelos de esta escala.
- Inferencia local de gran modelo con memoria limitada: para equipos con dos GPUs de gran VRAM que no pueden alojar el modelo en FP8 o BF16.
- Evaluación comparativa de precisión reducida: dado que no hay métricas publicadas, encaja en pipelines internos de evaluación que midan perplejidad y calidad por tarea frente al original.
- Pruebas de motores de inferencia: permite comprobar compatibilidad de EXL3 con herramientas de serving y con la cabeza MTP en escenarios de decodificación especulativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se medirán perplejidad, KLD ni métricas de benchmark para este checkpoint.

## Requisitos de hardware

- VRAM estimada: el objetivo son 2 máquinas con 128 GB de memoria unificada cada una (256 GB en total), una GPU por nodo.
- GPU recomendadas: hardware de clase DGX Spark; no se especifican otras GPU compatibles.
- GPU de consumo: no disponible; el tamaño del modelo base (321B) y el reparto entre dos nodos sugieren que no cabe en una GPU de consumo convencional.
- Opciones de despliegue: motor exllamav3 (formato EXL3). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| androidli/Sage-S2.1-Flash-EXL3-3.0bpw | 321B (MoE) | EXL3 3,0 bpw (expertos) | no disponible | MIT | Pesos aún no publicados |
| internlm/Sage-S2.1-Flash | 321B (MoE) | Precisión de origen | no disponible | MIT | Disponible en HF |
| internlm/Sage-S2.1-Flash-FP8 | 321B (MoE) | FP8 | no disponible | MIT | Disponible en HF |

## Limitaciones y advertencias

- Pesos no disponibles: el repositorio es un marcador de posición y no hay archivos descargables en el momento de la ficha.
- Sin validación de calidad: no se han medido perplejidad, KLD ni benchmarks; debe evaluarse en tareas propias antes de usarlo.
- Cuantización con pérdida: los expertos enrutados a 3,0 bpw introducen degradación respecto al modelo de origen.
- Multimodalidad no probada: el soporte de entradas multimodales depende del motor de inferencia y no se ha verificado.
- Idiomas y contexto: no se dispone de información específica para este checkpoint.
- Licencia MIT heredada del modelo base; conviene verificar las condiciones del modelo original de InternLM para uso comercial.
- Sesgos y alucinaciones: no documentados para este checkpoint; se heredan los del modelo base.

## Enlaces

- Repositorio HF: https://huggingface.co/androidli/Sage-S2.1-Flash-EXL3-3.0bpw
- Modelo base: https://huggingface.co/internlm/Sage-S2.1-Flash
- Modelo base FP8: https://huggingface.co/internlm/Sage-S2.1-Flash-FP8
- Herramienta de cuantización distribuida: https://github.com/greatyingzi/exl3-dist-quant
