# Jeesup/svd-safety-l31_remove30_swapgapiter_b010_r08

## Resumen

`Jeesup/svd-safety-l31_remove30_swapgapiter_b010_r08` es un checkpoint de investigación construido sobre `meta-llama/Llama-3.1-8B-Instruct`. No es un modelo nuevo entrenado desde cero, sino el resultado de aplicar una compresión por descomposición en valores singulares (SVD-LLM) que elimina el 30,01% de los parámetros de las proyecciones densas, dejando el modelo en una fracción de 0,6999 respecto al original, y de editar después una parte de esos pesos mediante rondas iterativas de intercambio neutro en parámetros («parameter-neutral swap»).

El interés del artefacto es metodológico: forma parte de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. En concreto, esta celda emplea la regla de selección `gap_iter`, un presupuesto de restauración del 1,000% de los parámetros densos (55.797.760 parámetros intercambiados, el 0,80% de las proyecciones densas) y 8 de las 10 rondas iterativas previstas, con un fragmento de 0,100% por ronda.

Se trata, por tanto, de un sujeto experimental y no de un asistente desplegable. El propio autor advierte de que varias ramas de la rejilla de experimentos están deliberadamente degradadas en seguridad respecto al modelo base, y las métricas publicadas lo confirman: una tasa de éxito de ataque (ASR) de 0,1450 en AdvBench y de 0,3750 en StrongREJECT, con un sobre-rechazo macro de solo 0,0303 en WildGuard.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Llama-3.1-8B-Instruct); proyecciones densas comprimidas con SVD-LLM |
| Parámetros totales | 8.030.261.248 según los tensores en safetensors; la model card declara una fracción resultante de 0,6999 sobre las proyecciones densas |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama-3.1-8B-Instruct soporta 128.000 tokens |
| Tipos de cuantización | No disponible en la model card; pesos publicados en safetensors (precisión original no declarada, presumiblemente BF16 como el modelo base). Convertible a GGUF, AWQ o GPTQ mediante herramientas externas |
| Idiomas soportados | No disponible en la model card; el modelo base declara 8 idiomas oficiales (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | Llama 3.1 Community License (se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Regla de selección de componentes | `gap_iter` |
| Presupuesto de restauración | 1,000% de los parámetros densos (0,100% por ronda) |
| Componentes restaurados / sustituidos | 8480 restaurados y 8480 sustituidos |
| Parámetros intercambiados | 55.797.760 (0,80% de las proyecciones densas) |
| Semilla | 42 |
| Rondas iterativas aplicadas | 8 de 10 (checkpoint intermedio de una ejecución más larga) |
| Tamaño del repositorio | 16,1 GB |
| Librería | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.1-8B-Instruct: un transformer decoder-only con normalización RMSNorm pre-norma, activación SwiGLU, embeddings RoPE y atención con consultas agrupadas (GQA). Sobre esa base no se ha realizado un entrenamiento adicional con datos; la intervención es puramente de compresión y edición de pesos. La compresión SVD-LLM descompone las matrices de proyección densas en factores de rango reducido, eliminando el 30,01% de los parámetros de esas proyecciones. La edición posterior es un procedimiento iterativo de intercambio neutro en parámetros: en cada ronda se seleccionan componentes según la regla `gap_iter`, se expulsan siguiendo un orden basado en los valores singulares (sigma-ordered eviction) y se insertan valores del modelo sin comprimir, con un valor de intercambio de tipo `insert`.

El presupuesto total de la ejecución completa es del 1,0% de los parámetros densos, repartido en 10 rondas del 0,1% cada una; este checkpoint corresponde a la octava ronda, por lo que solo se han aplicado 8 de esas 10 rondas (un 0,8% del presupuesto, equivalente a los 55.797.760 parámetros intercambiados). No se documentan en la información disponible ni el número de tokens de entrenamiento (no hay entrenamiento), ni el uso de RLHF o DPO adicionales, ni innovaciones de decodificación como decodificación especulativa. La única innovación técnica relevante es el propio método de compresión y reparación, orientado a estudiar la relación entre compresión y seguridad.

## Capacidades

- Generación de texto conversacional: conserva la interfaz de instrucciones del modelo base, aunque la compresión y la edición pueden alterar el comportamiento respecto al original.
- Razonamiento y conocimiento general: capacidades heredadas de Llama-3.1-8B-Instruct, no reevaluadas en la model card.
- Generación de código: heredada del modelo base, sin métricas publicadas para este checkpoint.
- Soporte de tool calling / function calling: no documentado específicamente para este checkpoint; el formato de llamadas a herramientas del modelo base puede haberse degradado con la compresión.
- Soporte de agentes y razonamiento multi-paso: no documentado para este checkpoint.
- Capacidades multilingües: no documentadas en la model card; se heredan las del modelo base.
- Capacidad especial de interés: servir como sujeto experimental para medir el efecto de la compresión SVD sobre el alineamiento de seguridad y la eficacia de distintas reglas de reparación (`gap_iter` frente a otras).
- Modo de pensamiento explícito, visión o audio: no disponibles.

## Casos de uso

- Investigación sobre alineamiento bajo compresión: el modelo permite cuantificar cuánto se degrada la seguridad de un LLM al eliminar el 30% de los parámetros de sus proyecciones densas, usando AdvBench ASR y StrongREJECT ASR como métricas de referencia.
- Evaluación de reglas de reparación de pesos: al ser una celda de una rejilla sobre reglas de selección y presupuestos, sirve como punto de comparación directa frente a otras reglas (por ejemplo, variantes que no usan `gap_iter`) manteniendo fija la semilla 42 y el presupuesto.
- Calibración de jueces de seguridad: dado que el autor usa HarmBench judge y WildGuard como evaluadores, el checkpoint resulta útil para comprobar la sensibilidad de esos jueces ante modelos parcialmente desalineados.
- Estudios de sobre-rechazo: con un macro over-refusal de 0,0303 en WildGuard, permite analizar si la compresión reduce la tendencia a rechazar peticiones benignas y cómo se relaciona eso con el aumento del ASR.
- Análisis de interpretabilidad de subespacios: los intercambios `insert` con ordenación por valores singulares permiten estudiar qué direcciones del espacio de pesos concentran el comportamiento de rechazo.
- Validación de pipelines de inferencia con modelos comprimidos: sirve para probar despliegues en vLLM o TGI con checkpoints de menor rango efectivo y comprobar estabilidad numérica, sin usarlo como asistente real.
- Generación de datos para entrenar moderadores: se puede emplear como generador adversario controlado para producir respuestas que un clasificador de seguridad debería marcar, siempre en un entorno de laboratorio y bajo la licencia Llama 3.1.
- Ablación en estudios de compresión: como línea base frente a métodos de poda estructurada o destilación, al fijar explícitamente el porcentaje de parámetros eliminados y el presupuesto de restauración.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son métricas de seguridad. No se han publicado resultados de benchmarks de conocimiento o código (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Métrica | Valor | Juez / herramienta |
|---|---|---|
| AdvBench ASR | 0,1450 | HarmBench judge |
| StrongREJECT ASR | 0,3750 | HarmBench judge |
| Macro over-refusal | 0,0303 | WildGuard |

No se dispone de los valores equivalentes para el modelo base sin comprimir en la documentación aportada, por lo que no es posible cuantificar aquí la degradación exacta atribuible a la compresión.

## Requisitos de hardware

- VRAM en BF16/FP16: alrededor de 16,1 GB solo para los pesos, más caché KV y activaciones; en la práctica se necesitan unos 18-20 GB para contexto corto.
- VRAM en INT8: aproximadamente 8-9 GB de pesos.
- VRAM en INT4 (GGUF, AWQ, GPTQ): aproximadamente 5-6 GB de pesos.
- Caché KV: con la configuración de Llama-3.1-8B (32 capas, 8 cabezas KV, dimensión de cabeza 128) la caché ocupa unos 128 KB por token en FP16, es decir, unos 16 GB para 128.000 tokens; conviene limitar el contexto o usar cuantización de caché en despliegues largos.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para BF16 con contexto largo; RTX 4090 (24 GB), RTX 3090 (24 GB) o L4/A10G para BF16 con contexto moderado o INT8.
- ¿Cabe en GPU de consumo? Sí. En RTX 4090 o RTX 3090 cabe en BF16 con contexto moderado; en RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB cabe cuantizado a 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `endpoints_compatible`), vLLM; llama.cpp y Ollama requieren convertir los pesos a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no se han publicado mediciones en la información disponible. Al tratarse de un checkpoint intermedio de un estudio, no hay garantía de que la reducción de rango se traduzca en una aceleración proporcional sin kernels específicos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svd-safety-l31_remove30_swapgapiter_b010_r08 | 8,03 B en safetensors; fracción 0,6999 declarada sobre proyecciones densas | No disponible en la model card | Llama 3.1 Community License | Safetensors en HuggingFace | Artefacto de investigación con seguridad degradada; 0 descargas y 0 likes en el momento de la consulta |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | Safetensors, ampliamente integrado | Modelo base sin comprimir; referencia para medir la degradación |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 tokens | Apache 2.0 | Safetensors y GGUF | Alternativa de tamaño similar con licencia permisiva; comparación de rendimiento no disponible para este checkpoint |
| Qwen2.5-7B-Instruct | 7,62 B | 131.072 tokens | Apache 2.0 | Safetensors y GGUF | Alternativa de tamaño similar con contexto comparable; comparación de rendimiento no disponible para este checkpoint |

No se dispone de datos de benchmarks comunes entre estos modelos y el checkpoint descrito, por lo que la comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de propósito general: el autor lo describe explícitamente como sujeto experimental, no como asistente desplegable.
- Seguridad degradada de forma deliberada en varias ramas del estudio. Las métricas publicadas (ASR de 0,1450 en AdvBench y de 0,3750 en StrongREJECT) indican una tasa de éxito de ataque muy superior a la esperable en un modelo alineado de producción.
- Riesgo elevado de alucinación y de respuestas inconsistentes: la compresión SVD y la edición de pesos alteran el comportamiento sin un ajuste fino posterior que lo restaure.
- Es un checkpoint intermedio (8 de 10 rondas), por lo que no representa el resultado final de la ejecución completa ni el presupuesto total de restauración del 1,0%.
- Inconsistencia documental: el recuento de safetensors indica 8.030.261.248 parámetros, mientras que la model card declara una fracción resultante de 0,6999 sobre las proyecciones densas. Conviene verificar la forma real de los tensores antes de asumir cualquier ahorro de memoria.
- Idiomas soportados no declarados para este checkpoint; el multilingüismo no está validado tras la compresión.
- Soporte de tool calling, agentes y razonamiento multi-paso no documentado ni verificado.
- Restricciones de licencia: se aplica la Llama 3.1 Community License, con las obligaciones de atribución («Built with Llama») y las restricciones de uso recogidas en `USE_POLICY.md`. Cualquier uso comercial queda sujeto a esa licencia y al cumplimiento de la política de uso aceptable.
- Antes de reutilizar pesos de este repositorio en un pipeline de producción es imprescindible una evaluación propia de seguridad y de calidad, tal como recomienda el propio autor.
- El repositorio registra 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove30_swapgapiter_b010_r08
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- Política de uso aceptable de Llama 3.1: https://llama.meta.com/llama3_1/use-policy/
- Paper de SVD-LLM (método de compresión citado por el autor): no disponible en la información proporcionada
- Paper o blog del método de intercambio iterativo `gap_iter`: no disponible en la información proporcionada
- Repositorio de código, demo o espacio asociado: no disponible en la información proporcionada

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los únicos resultados obtenidos fueron páginas de inicio de sesión de Gmail y de cuentas de Google, sin relación con el artefacto.
