# jhyuckkim/DeepSeek-V2-Lite-Dense-3B-DO-ACP-K6

## Resumen

DeepSeek-V2-Lite-Dense-3B-DO-ACP-K6 es un artefacto de investigación desarrollado por jhyuckkim (Krafton AI) que materializa los experimentos del artículo *Pruning and Distilling Mixture-of-Experts into Dense Language Models* (arXiv:2605.28207). Se trata de un modelo denso obtenido mediante poda y destilación del maestro Mixture-of-Experts (MoE) `deepseek-ai/DeepSeek-V2-Lite`, con el objetivo de estudiar cómo convertir arquitecturas MoE en equivalentes densos de menor coste computacional manteniendo un rendimiento razonable. Este modelo concreto emplea el método de puntuación de expertos DO-ACP y conserva 6 expertos enrutados (K=6), siendo el mejor estudiante de DeepSeek del paper y el único donde la selección basada en diversidad hace que la poda pura supere a la fusión de K=12.

Con 2,66 mil millones de parámetros, el modelo se destiló con un presupuesto de tokens muy reducido (0,3B tokens de FineWeb-Edu), sin ajuste de instrucciones ni alineación, por lo que su calidad absoluta es muy inferior a la del maestro y a la de modelos preentrenados del mismo tamaño. Su propósito principal es servir como referencia reproducible para comparar métodos de puntuación y agrupación de expertos en condiciones de presupuesto igualado, no como asistente de propósito general. A pesar de ello, mantiene intactas la atención MLA (Multi-head Latent Attention) y los expertos compartidos del maestro, lo que permite estudiar el impacto de la poda en componentes específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (MoE-to-dense) con atención MLA y expertos compartidos preservados del maestro DeepSeek-V2-Lite |
| Parametros totales | 2.659.708.416 (~2,66B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (hereda del maestro, no especificado en la ficha) |
| Tipos de cuantizacion | No disponible (se recomienda bfloat16; no se listan cuantizaciones GGUF) |
| Idiomas soportados | No disponible |
| Licencia | deepseek (licencia de modelo de DeepSeek-V2, ver enlace) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un estudiante denso obtenido a partir del maestro MoE `deepseek-ai/DeepSeek-V2-Lite`. La poda conserva los 2 expertos compartidos y selecciona 6 de los expertos enrutados (K=6) mediante el método de puntuación DO-ACP (diversity-aware selection), que prioriza la diversidad entre expertos para maximizar la información retenida. La agrupación se realiza mediante poda pura sobre los expertos enrutados, dando lugar a 8 grupos totales (2 compartidos + 6 enrutados). Las proyecciones descendentes de los expertos compartidos se copian sin escalar, mientras que las de los grupos enrutados se escalan por la probabilidad condicional media.

El entrenamiento consistió en destilación sobre 0,3 mil millones de tokens del subconjunto `sample-10BT` de FineWeb-Edu, un presupuesto deliberadamente pequeño para permitir comparaciones justas entre métodos bajo el mismo coste. No se aplicó RLHF, DPO ni ajuste de instrucciones. La innovación técnica clave reside en el propio método de poda y destilación, que preserva la atención MLA y los expertos compartidos, y en el uso de DO-ACP como criterio de selección de expertos. El código está disponible en el repositorio `krafton-ai/moe-to-dense`.

## Capacidades

- Generación de texto causal básica (modelo de lenguaje autorregresivo).
- Razonamiento de sentido común limitado, según los benchmarks reportados (ver sección de rendimiento).
- Comprensión lectora y conocimiento factual básico, pero muy por debajo de un modelo preentrenado del mismo tamaño.
- No soporta tool calling ni function calling.
- No está diseñado para uso como agente ni para razonamiento multi-paso complejo.
- No se ha evaluado su capacidad multilingüe; los datos de entrenamiento son en inglés (FineWeb-Edu).
- No dispone de modo de pensamiento, visión ni audio.

## Casos de uso

- Reproducción de experimentos del paper: los pesos permiten replicar exactamente los resultados de la tabla 17 del artículo, sirviendo como referencia para la comunidad investigadora.
- Comparación de métodos de puntuación de expertos: al estar disponible junto a otras configuraciones (SF-K6, CP-K6, etc.), permite aislar el efecto del criterio de selección en la calidad final.
- Estudio del impacto de la poda en arquitecturas MoE: al preservar MLA y expertos compartidos, facilita el análisis de qué componentes son más sensibles a la compresión.
- Investigación sobre eficiencia de modelos: sirve como caso de estudio para evaluar el equilibrio entre parámetros, coste de inferencia y rendimiento en modelos densos derivados de MoE.
- Base para experimentos de destilación adicionales: aunque no está ajustado, puede usarse como punto de partida para fine-tuning con presupuestos mayores, siempre que se tenga en cuenta su baja calidad inicial.
- Docencia y formación en técnicas de poda y destilación: su pequeño tamaño y disponibilidad pública lo convierten en un ejemplo didáctico para cursos de optimización de modelos.

## Benchmarks y rendimiento

La model card reporta resultados en cinco benchmarks de razonamiento de sentido común (Winogrande 5-shot, HellaSwag 10-shot, ARC-Easy 25-shot, ARC-Challenge 25-shot y MMLU 5-shot). La tabla siguiente resume la fila de este modelo junto con el maestro y otras configuraciones relevantes del mismo experimento.

| Configuracion | Wino | Hella | ARC-E | ARC-C | MMLU | Avg |
|---|---|---|---|---|---|---|
| **DO-ACP, K=6 (este modelo)** | **60.3** | **41.0** | **53.7** | **28.2** | **28.7** | **42.39** |
| DO-ACP, K=12 | 59.0 | 41.5 | 51.7 | 26.2 | 26.9 | 41.07 |
| SF, K=6 | 54.9 | 38.9 | 52.4 | 27.1 | 26.9 | 40.04 |
| CP, K=6 | 53.0 | 36.9 | 49.4 | 25.7 | 25.3 | 38.07 |
| Teacher (DeepSeek-V2-Lite) | 76.2 | 80.5 | 84.4 | 56.3 | 58.0 | 71.09 |

El modelo supera a todas las demás configuraciones de poda en promedio, y es el único donde K=6 (poda pura) mejora a K=12 (fusión). No obstante, la distancia con el maestro es notable (42.39 frente a 71.09), lo que refleja el bajo presupuesto de destilación. No se han publicado resultados comparativos con otros modelos densos de ~3B parámetros en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 2,66B parámetros en bfloat16 (2 bytes por parámetro), los pesos ocupan ~5,3 GB. Para inferencia con batch pequeño se necesitan al menos 8 GB de VRAM, recomendándose 12 GB para mayor comodidad.
- GPU recomendadas: cualquier GPU con 8-16 GB de VRAM, como NVIDIA RTX 3060/3070/3080/4060/4070, o GPUs de datacenter como A10, A100 o H100 para mayor throughput.
- Cabe en GPUs de consumo: sí, en la mayoría de GPUs modernas con 8 GB o más.
- Opciones de despliegue: al ser un modelo de Transformers, puede ejecutarse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama, aunque requiere `trust_remote_code=True`. No se han proporcionado datos de latencia o throughput.
- El tamaño del repositorio es de 5,3 GB, lo que incluye los pesos en safetensors y los archivos de configuración personalizados.

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos densos de ~3B parámetros (como Qwen2.5-3B o Llama-3.2-3B) en la información proporcionada. La comparativa natural es con el maestro MoE y con otras configuraciones del mismo experimento, como se muestra en la tabla de benchmarks. El modelo es un artefacto de investigación, no un modelo de propósito general, por lo que no compite con alternativas comerciales o de código abierto orientadas a producción.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de producción. La model card advierte explícitamente que no debe usarse como asistente fuera de contextos experimentales.
- Calidad muy inferior al maestro y a modelos preentrenados del mismo tamaño debido al presupuesto de destilación extremadamente reducido (0,3B tokens).
- No se aplicó ajuste de instrucciones ni alineación, por lo que las respuestas pueden ser incoherentes o no seguir instrucciones.
- Requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar código personalizado del autor; debe verificarse su seguridad antes de su uso.
- La licencia es la de DeepSeek-V2 (licencia "deepseek"), que puede imponer restricciones al uso comercial; es necesario revisar el texto completo de la licencia.
- No se han evaluado sesgos ni alucinaciones en este modelo; al derivar de un maestro no alineado, es probable que herede sesgos no mitigados.
- La longitud de contexto no está especificada en la ficha; se asume que hereda la del maestro, pero no hay garantía.
- El modelo no soporta cuantizaciones alternativas documentadas; se recomienda usar bfloat16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jhyuckkim/DeepSeek-V2-Lite-Dense-3B-DO-ACP-K6
- Paper (arXiv): https://arxiv.org/abs/2605.28207
- Código del paper: https://github.com/krafton-ai/moe-to-dense
- Licencia del modelo: https://github.com/deepseek-ai/DeepSeek-V2/blob/main/LICENSE-MODEL
- Otras configuraciones relacionadas:
  - SF-K6: https://huggingface.co/jhyuckkim/DeepSeek-V2-Lite-Dense-3B-SF-K6
  - CP-K6: https://huggingface.co/jhyuckkim/DeepSeek-V2-Lite-Dense-3B-CP-K6
