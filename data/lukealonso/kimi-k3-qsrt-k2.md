# lukealonso/Kimi-K3-QSRT-K2

## Resumen

El modelo **Kimi-K3-QSRT-K2** es una cuantización de 2 bits por peso (2bpw) del modelo insignia de Moonshot AI, **Kimi K3**, un modelo multimodal de 2,8 billones de parámetros con visión nativa, razonamiento siempre activo y una ventana de contexto de 1 millón de tokens. Esta cuantización, desarrollada por el usuario lukealonso, reduce drásticamente el tamaño y los requisitos de memoria del modelo original, permitiendo su ejecución en hardware de gama alta como 8 GPUs RTX 6000 o 6-8 DGX Spark. El autor reporta una divergencia de Kullback-Leibler (KLD) de solo 0,0675 respecto al modelo original, lo que sugiere una pérdida de calidad relativamente baja para una cuantización tan agresiva.

El repositorio contiene los pesos en formato safetensors con un tamaño total de 757,5 GB, lo que corresponde a una representación de 2 bits de un modelo de gran escala. La cuantización utiliza un codec propio llamado **QSRT** (desarrollado por local-inference-lab) que requiere kernels especiales y una versión modificada de vLLM para su inferencia. Aunque la model card es escueta, el modelo parece estar orientado a entornos de producción donde se necesita ejecutar un modelo de nivel flagship sin los recursos masivos que exigiría la versión completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Kimi K3, multimodal con visión y razonamiento según Moonshot AI) |
| Parametros totales | 57.191.006.976 (según safetensors; el modelo base Kimi K3 tiene 2,8T según fuentes externas) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible para esta cuantización; el modelo base soporta 1M tokens |
| Tipos de cuantizacion | 2bpw (QSRT codec) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base Kimi K3, aunque según las fuentes externas se trata de un modelo multimodal con visión nativa y razonamiento siempre activo, probablemente basado en una arquitectura transformer de gran escala. La cuantización QSRT-K2 aplica un esquema de 2 bits por peso, lo que implica una compresión de aproximadamente 16 veces respecto a la precisión FP16. El autor menciona un KLD de 0,0675, que mide la divergencia entre las distribuciones de salida del modelo cuantizado y el original, indicando una fidelidad razonable para este nivel de compresión.

No se dispone de información sobre el proceso de entrenamiento o ajuste fino de esta cuantización. El repositorio indica que se basa en el modelo `moonshotai/Kimi-K3` y que requiere kernels especiales del proyecto `b12x` y una versión específica de vLLM (rama `dev/infernal-invocation`) para su ejecución. Esto sugiere que la cuantización utiliza técnicas de compresión avanzadas que no son compatibles con el software estándar de inferencia.

## Capacidades

- Generación de texto y razonamiento complejo, heredadas del modelo base Kimi K3, aunque con posible degradación debido a la cuantización de 2 bits.
- Capacidades multimodales (visión) del modelo base, aunque no se especifica si la cuantización las conserva íntegramente.
- Razonamiento siempre activo (always-on reasoning) según la descripción del modelo base.
- Soporte de contexto largo (1M tokens en el modelo base), aunque la ventana efectiva en esta cuantización no está documentada.
- No se menciona soporte explícito de tool calling o function calling en la model card, pero el modelo base podría tenerlo.
- Capacidades multilingües no especificadas.

## Casos de uso

- **Inferencia local de un modelo de nivel flagship en hardware reducido**: organizaciones que necesitan ejecutar un modelo de 2,8T parámetros sin disponer de un clúster masivo pueden usar esta cuantización en 8 GPUs RTX 6000 o DGX Spark, a costa de una pérdida de precisión.
- **Prototipado y evaluación de modelos cuantizados**: investigadores pueden estudiar el impacto de la cuantización de 2 bits en tareas de razonamiento, código y visión, comparando con el modelo original.
- **Despliegue en entornos con restricciones de memoria**: aunque el repositorio ocupa 757 GB, sigue siendo mucho menor que los ~5,6 TB que ocuparía el modelo en FP16, permitiendo su uso en servidores con VRAM agregada de 192 GB o más.
- **Generación de código asistida**: el autor menciona un rendimiento sorprendentemente fuerte en benchmarks de código, lo que sugiere que puede usarse para autocompletado o generación de código en entornos donde el modelo completo no cabe.
- **Análisis de documentos largos**: gracias a la ventana de contexto de 1M tokens del modelo base, esta cuantización podría procesar documentos extensos, aunque la calidad de la comprensión puede verse afectada.
- **Investigación sobre compresión de modelos**: el codec QSRT y su implementación en vLLM pueden servir como referencia para otros proyectos de cuantización extrema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona un KLD de 0,0675 y un "rendimiento sorprendentemente fuerte" en tareas de código, pero sin cifras concretas. No se incluyen comparaciones con otros modelos o cuantizaciones.

## Requisitos de hardware

- **VRAM estimada**: el repositorio ocupa 757,5 GB en disco. Para cargar los pesos en memoria se necesitan al menos 8 GPUs con 48 GB de VRAM cada una (RTX 6000 Ada) o 6-8 DGX Spark (cada una con 128 GB de memoria unificada, según especificaciones públicas).
- **GPUs recomendadas**: 8x NVIDIA RTX 6000 (Ada) o 6-8x DGX Spark (Grace Blackwell). No es viable en GPUs de consumo (RTX 4090, etc.) por la cantidad de memoria requerida.
- **Software**: se requiere una versión específica de vLLM (rama `dev/infernal-invocation` del repositorio local-inference-lab/vllm) y los kernels del proyecto b12x. No es compatible con llama.cpp, Ollama u otros runners estándar.
- **Latencia y throughput**: no se dispone de datos. La inferencia con kernels personalizados puede tener un rendimiento variable; se espera que sea inferior al del modelo original debido a la cuantización, pero el autor no proporciona métricas.

## Comparativa con modelos similares

No disponible. No se han encontrado cuantizaciones comparables de Kimi K3 ni de otros modelos de 2,8T parámetros con el mismo esquema de 2 bits. Las alternativas serían el modelo original (que requiere hardware mucho más potente) u otras cuantizaciones de modelos más pequeños (por ejemplo, Llama 3.1 405B en 4 bits), pero no son directamente comparables por tamaño y arquitectura.

## Limitaciones y advertencias

- **Pérdida de calidad**: la cuantización de 2 bits introduce una degradación significativa en la precisión del modelo, a pesar del bajo KLD reportado. Tareas que requieren alta fidelidad (matemáticas avanzadas, razonamiento lógico complejo) pueden verse afectadas.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, existe riesgo de generar información falsa o inconsistente, probablemente incrementado por la compresión.
- **Dependencia de software específico**: el modelo solo funciona con una versión modificada de vLLM y kernels propietarios (b12x), lo que limita su portabilidad y dificulta el despliegue en entornos estándar.
- **Licencia no clara**: la licencia no está especificada en la model card, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- **Idiomas no documentados**: no se indica qué idiomas soporta el modelo cuantizado, aunque el modelo base probablemente cubra múltiples idiomas.
- **Requisitos de hardware muy elevados**: a pesar de la compresión, se necesitan GPUs profesionales de gama alta, lo que excluye su uso en equipos de consumo.
- **Fecha de creación futura**: el modelo fue creado en agosto de 2026, lo que sugiere que puede ser un proyecto experimental o de vanguardia, con posible falta de soporte a largo plazo.

## Enlaces

- [HuggingFace: lukealonso/Kimi-K3-QSRT-K2](https://huggingface.co/lukealonso/Kimi-K3-QSRT-K2)
- [vLLM modificado (rama dev/infernal-invocation)](https://github.com/local-inference-lab/vllm/tree/dev/infernal-invocation)
- [Proyecto b12x (kernels especiales)](https://github.com/local-inference-lab/b12x)
- [Documentación del codec QSRT 2bpw](https://github.com/local-inference-lab/qsrt/blob/master/docs/qsrt-2bpw-codec.md)
- [Página del modelo Kimi K3 en lmstudio.ai](https://lmstudio.ai/models/kimi-k3)
- [Sitio oficial de Kimi AI](https://www.kimi.com/en)
- [Sitio de Moonshot AI](https://www.moonshot.ai/)
