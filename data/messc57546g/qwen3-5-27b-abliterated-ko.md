# messc57546g/Qwen3.5-27B-abliterated-ko

## Resumen

Qwen3.5-27B-abliterated-ko es una versión "abliterated" (descensurada) de Qwen3.5-27B, el modelo denso de 27.8B parámetros de la familia Qwen de Alibaba. El autor del modelo, messc57546g, ha aplicado la herramienta heretic para eliminar de forma automática el comportamiento de rechazo (refusals) del modelo base, obteniendo un modelo que cumple con un rango mucho más amplio de peticiones que la versión original, incluidas aquellas que el modelo base normalmente rechazaría.

El proceso de abliteración se ha realizado mediante la técnica ARA (Arbitrary-Rank Ablation) de heretic, con 100 pruebas de Optuna que buscaban el rango de capas, los pesos de ablación y el número de vecinos, cuantizando a 4 bits con bitsandbytes durante la búsqueda y fusionando después de vuelta a precisión completa. El resultado es un modelo completo (no un adaptador LoRA) que funciona como reemplazo directo de los pesos del modelo base.

Este tipo de modelos es relevante para desarrolladores e investigadores que necesitan control total sobre el comportamiento del modelo en entornos controlados: investigación de seguridad, evaluación de robustez, o aplicaciones donde las capas de moderación del fabricante interfieren con casos de uso legítimos. Al tratarse de un modelo descensurado, requiere un uso responsable y conforme a la legislación local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5) |
| Parametros totales | 27.356.728.560 (dato real de safetensors; el README indica 27.8B para el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión completa en el repo; 4 bits (bitsandbytes) solo durante el proceso de abliteración |
| Idiomas soportados | no disponible (el sufijo "-ko" sugiere posible orientación al coreano, pero no está documentado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo completo fusionado, 54,7 GB) |

## Arquitectura y entrenamiento

El modelo base, Qwen3.5-27B, es un transformer denso de la familia Qwen de Alibaba. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni los métodos de alineación (RLHF/DPO) del modelo base.

La innovación principal de esta versión no está en la arquitectura sino en el proceso de abliteración. Se ha utilizado heretic, una herramienta que realiza ablación automática de las direcciones de activación responsables de los rechazos. El método ARA (Arbitrary-Rank Ablation) emplea Optuna para optimizar tres hiperparámetros: el rango de capas afectadas, los pesos de ablación y el número de vecinos considerados. Durante la búsqueda se usa cuantización de 4 bits con bitsandbytes para acelerar las pruebas, y el punto seleccionado es aquel que resulta Pareto-óptimo equilibrando la reducción de rechazos con la preservación de la calidad de salida (medida mediante divergencia KL respecto al modelo original). El modelo exportado es un modelo completo fusionado a precisión completa, no un adaptador LoRA, por lo que puede usarse como reemplazo directo de los pesos de Qwen3.5-27B.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation), heredando las capacidades del modelo base Qwen3.5-27B
- Cumplimiento ampliado de peticiones: el comportamiento de rechazo del modelo base se ha reducido deliberadamente, por lo que responde a solicitudes que el modelo original rechazaría
- Reemplazo directo (drop-in) de los pesos del modelo base, sin necesidad de aplicar adaptadores
- Capacidades de razonamiento, codigo, matematicas o tool calling: no disponibles (no documentadas para esta variante ni detalladas para el modelo base en la informacion proporcionada)
- Capacidades multilingues: no disponibles (no documentadas)

## Casos de uso

- Investigacion en seguridad y alineacion: el modelo permite estudiar el comportamiento de LLM sin capas de rechazo, evaluar jailbreaks defensivamente y analizar como la abliteracion afecta a otras capacidades, gracias a que conserva los pesos originales salvo las direcciones de rechazo.
- Evaluacion de robustez (red teaming): equipos de seguridad pueden usarlo como modelo de referencia descensurado para probar filtros de contenido y sistemas de moderacion en produccion.
- Escritura creativa sin restricciones: autores que trabajan con contenido maduro o narrativas conflictivas pueden evitar rechazos del modelo base que interrumpen flujos de escritura largos, manteniendo la calidad del modelo original.
- Generacion de datos sinteticos dificiles: en entornos de investigacion controlados, puede usarse para generar ejemplos de contenido sensible con fines de entrenamiento de clasificadores de moderacion.
- Fine-tuning posterior sin interferencias de rechazo: al ser un modelo completo fusionado, sirve como punto de partida para fine-tuning en dominios donde los refusals del modelo base contaminarian el entrenamiento (el propio autor indica que planea seguir ajustandolo).
- Reemplazo directo en pipelines existentes: al ser drop-in respecto a Qwen3.5-27B, puede sustituirse en despliegues existentes sin cambiar codigo, util para comparar A/B el comportamiento con y sin abliteracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los benchmarks aun no se han ejecutado ("Not yet run - planned after further fine-tuning").

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 55 GB para los pesos (el repo ocupa 54,7 GB), mas overhead de KV cache, por lo que se requieren al menos 64-80 GB de VRAM
- Con cuantizacion a 4 bits (por ejemplo, GGUF Q4_K_M o AWQ), el consumo estimado bajaria a alrededor de 16-18 GB, aunque no hay versiones cuantizadas publicadas en este repo
- GPU recomendadas: A100 80 GB u H100 para precision completa; para cuantizaciones a 4 bits, una RTX 4090 (24 GB) o RTX 3090 seria suficiente en teoria, pero no hay versiones cuantizadas disponibles
- Consumer GPUs: solo viable con cuantizacion externa a 4 bits; en precision completa no cabe en ninguna GPU de consumo
- Opciones de despliegue: al estar en safetensors con arquitectura Qwen3.5, deberia funcionar con vLLM, TGI, llama.cpp (previa conversion a GGUF) y Ollama (previa conversion); no hay soporte documentado especifico
- Latencia y throughput estimados: no disponibles

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Descensurado | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-27B-abliterated-ko | 27,4B | Denso, abliterated | Apache 2.0 | Si (heretic/ARA) | safetensors, modelo completo |
| Qwen/Qwen3.5-27B (base) | 27,8B | Denso | Apache 2.0 | No | safetensors, oficial |
| Otras variantes abliterated de 27-32B (p. ej. de otras familias) | no disponible | no disponible | no disponible | Si | no disponible |

No hay datos de rendimiento comparables publicados para ninguna de las variantes, por lo que la comparativa se limita a caracteristicas tecnicas. La ventaja diferencial de esta version frente al modelo base es la eliminacion del comportamiento de rechazo con perdida minima de calidad (seleccion del punto Pareto-optimo por divergencia KL).

## Limitaciones y advertencias

- El comportamiento de rechazo se ha eliminado deliberadamente: el modelo complacera peticiones que el modelo base rechazaria, incluidas potencialmente peticiones daninas. Su uso exige responsabilidad y cumplimiento de la legislacion local.
- Etiquetado "not-for-all-audiences": el contenido generado puede ser inapropiado para publicos generales y para entornos de produccion orientados a usuarios finales.
- Riesgo de alucinacion: no disponible (no documentado), aunque debe asumirse equivalente al del modelo base; la abliteracion no mejora la veracidad.
- Sesgos conocidos: no disponibles (no documentados); heredados presumiblemente del modelo base Qwen3.5-27B.
- Idiomas: no documentados; el sufijo "-ko" sugiere orientacion al coreano que no esta confirmada en la model card.
- Benchmarks pendientes: el propio autor indica que planea ejecutarlos tras un fine-tuning adicional, por lo que el modelo podria cambiar o no representar la calidad final prevista.
- Sin fine-tuning de seguridad adicional: no se ha aplicado ninguna capa de seguridad mas alla de la que trae el modelo base, lo que lo hace inadecuado para despliegues sin moderacion externa.
- Licencia Apache 2.0: permite uso comercial, pero la responsabilidad legal sobre el contenido generado recae en el usuario.
- Descargas bajas (424) y ausencia de validacion comunitaria: la calidad de la abliteracion no ha sido verificada por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/messc57546g/Qwen3.5-27B-abliterated-ko
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Herramienta de abliteracion heretic: https://github.com/p-e-w/heretic
