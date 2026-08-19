# dlab-cmu/sf-map-qwen3.6-35b-a3b

## Resumen

`dlab-cmu/sf-map-qwen3.6-35b-a3b` es un mapa de sensibilidad por tensor para el modelo de lenguaje Qwen3.6-35B-A3B, desarrollado por el laboratorio dlab-cmu. No se trata de un modelo de lenguaje completo, sino de un recurso auxiliar para guiar la cuantización de dicho modelo utilizando el catálogo compartido de 27 opciones de cuantización definido en `dlab-cmu/sf-grids`. El artefacto se distribuye como un único archivo JSON (`sf-map.json`) que contiene métricas de divergencia KL por tensor, así como asignaciones asimétricas de bits para las cabezas de atención (K/V), con el objetivo de optimizar la relación calidad-compresión.

La relevancia de este mapa radica en que permite aplicar cuantización selectiva basada en la sensibilidad real de cada tensor, en lugar de usar esquemas uniformes. Según la model card, se recomienda usar la métrica `direct_kl` para cuantizaciones de 2 bits por peso (bpw) o superiores, y `folded_kl` por debajo de 2 bpw. La asignación de KV se calcula combinando el α plegado con el error cuadrático medio medido. El proyecto está licenciado bajo MIT y se publicó en agosto de 2026, aunque no se especifican idiomas soportados ni detalles del modelo base más allá de su referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (mapa de sensibilidad, no modelo generativo) |
| Parametros totales | No disponible (el mapa no contiene pesos del modelo) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 27 opciones del catálogo SF (definidas en `dlab-cmu/sf-grids`) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | JSON (`sf-map.json`) |

## Arquitectura y entrenamiento

Este artefacto no es un modelo entrenado, sino un mapa de sensibilidad generado a partir del modelo base Qwen3.6-35B-A3B. El archivo JSON contiene, según la model card, tres bloques de información:

- Un menú de 27 opciones de cuantización con los nombres de archivo de las cuadrículas y el coeficiente κ asociado.
- Métricas por tensor: `direct_kl` (divergencia KL directa) y `folded_kl` (KL plegada), ambas para los pesos.
- Para cada capa de atención completa, el α plegado de las cabezas K/V y el error cuadrático medio (MSE) real medido.

No se proporcionan detalles sobre el proceso de cálculo de estas métricas, ni sobre el dataset utilizado para medirlas, ni sobre el método de plegado. La metodología parece estar orientada a cuantización de baja precisión (por debajo de 2 bpw) donde las métricas directas pueden no ser fiables.

## Capacidades

- Proporciona métricas de sensibilidad por tensor (`direct_kl` y `folded_kl`) para guiar la asignación de bits en cuantización.
- Incluye asignación asimétrica de bits para las cabezas de atención K/V, basada en α plegado y MSE medido.
- Define un catálogo de 27 opciones de cuantización con coeficientes κ, lo que permite seleccionar configuraciones predefinidas.
- No tiene capacidades de generación de texto, razonamiento, código, visión ni tool calling, ya que no es un modelo de lenguaje.

## Casos de uso

- Cuantización selectiva de Qwen3.6-35B-A3B: el mapa permite decidir qué tensores requieren mayor precisión y cuáles pueden comprimirse más agresivamente, mejorando la calidad del modelo cuantizado frente a esquemas uniformes.
- Optimización de memoria en despliegue local: al aplicar las asignaciones recomendadas, se puede reducir la huella de VRAM del modelo manteniendo un rendimiento aceptable, útil para ejecutarlo en GPUs de consumo.
- Investigación en cuantización de baja precisión: las métricas `folded_kl` y la asignación asimétrica K/V sirven como referencia para estudiar la sensibilidad de modelos MoE grandes.
- Integración en pipelines de compresión: el JSON puede consumirse desde scripts de Python para generar automáticamente configuraciones de cuantización adaptadas a cada tensor.
- Comparación de estrategias de cuantización: permite contrastar la calidad de diferentes configuraciones del catálogo SF usando las métricas de KL y MSE incluidas.
- Reproducibilidad de experimentos: al publicar el mapa junto con el catálogo, otros equipos pueden replicar o extender los resultados de cuantización sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad final (como perplejidad o exactitud en tareas) tras aplicar el mapa de sensibilidad. Tampoco se comparan los resultados con cuantización uniforme u otros métodos.

## Requisitos de hardware

- El artefacto en sí es un archivo JSON de tamaño reducido (probablemente unos pocos megabytes), por lo que no requiere hardware específico para su uso.
- Para aplicar el mapa al modelo Qwen3.6-35B-A3B, se necesita el modelo base y una GPU con VRAM suficiente según la cuantización elegida. Dado que es un MoE de 35B con 3B activos, las cuantizaciones de 4 bits suelen caber en GPUs de 24 GB (por ejemplo, RTX 3090/4090), mientras que precisiones más bajas (2-3 bits) pueden caber en 12-16 GB.
- No se dispone de datos de latencia o throughput específicos para este mapa.

## Comparativa con modelos similares

No se dispone de información sobre mapas de sensibilidad comparables para otros modelos. El catálogo `dlab-cmu/sf-grids` podría contener mapas para otros modelos, pero no se mencionan en la información proporcionada. Alternativas genéricas a la cuantización basada en sensibilidad incluyen métodos como GPTQ, AWQ o QuIP#, pero no se han comparado con este enfoque.

## Limitaciones y advertencias

- El mapa está diseñado específicamente para Qwen3.6-35B-A3B y el catálogo SF de 27 opciones; no es transferible a otros modelos sin recalcular las métricas.
- No se especifican los criterios exactos para calcular `direct_kl`, `folded_kl` ni el α plegado, lo que dificulta la reproducibilidad externa.
- La model card recomienda usar `direct_kl` a partir de 2 bpw y `folded_kl` por debajo, pero no se justifica esta transición con datos empíricos.
- No hay información sobre la calidad final del modelo cuantizado (perplejidad, exactitud en tareas) ni sobre posibles sesgos o alucinaciones del modelo base.
- Al ser un recurso auxiliar, su utilidad depende de la correcta interpretación de las métricas; un uso incorrecto podría degradar el rendimiento del modelo cuantizado.
- La licencia MIT permite uso comercial, pero el modelo base Qwen3.6-35B-A3B tiene su propia licencia (no especificada aquí) que debe verificarse por separado.

## Enlaces

- [HuggingFace - dlab-cmu/sf-map-qwen3.6-35b-a3b](https://huggingface.co/dlab-cmu/sf-map-qwen3.6-35b-a3b)
- [HuggingFace - dlab-cmu/sf-grids](https://huggingface.co/dlab-cmu/sf-grids)
- [GitHub - QwenLM/Qwen3.6](https://github.com/QwenLM/Qwen3.6)
- [Guía para ejecutar Qwen 3.6 localmente (dev.to)](https://dev.to/purpledoubled/how-to-run-qwen-36-locally-27b-dense-35b-moe-and-coding-variants-setup-guide-4di)
- [Guía completa de Qwen 3.6 (insiderllm.com)](https://insiderllm.com/guides/qwen-3-6-local-ai-guide/)
- [Cómo ejecutar Qwen 3.6 localmente con Ollama, LM Studio y vLLM (aimadetools.com)](https://www.aimadetools.com/blog/how-to-run-qwen-3-6-locally/)
- [Documentación técnica de Qwen3.6 (DeepWiki)](https://deepwiki.com/QwenLM/Qwen3.6/1.1-qwen3.6-models)
