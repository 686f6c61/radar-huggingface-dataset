# nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-seed43-spa-ell-sequential

## Resumen

El modelo `nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-seed43-spa-ell-sequential` es un modelo de lenguaje causal de pequeno tamano (123,9 millones de parametros) publicado por el usuario nikitastheo en Hugging Face. Se trata de un experimento de investigacion centrado en el aprendizaje continuo y la mitigacion del olvido catastrofico: el nombre del repositorio sugiere el uso de Elastic Weight Consolidation (EWC), un entrenamiento secuencial por idiomas (spa-ell, es decir, espanol y griego) y una fase de "ablated" sobre un tokenizador compartido de 25.000 entradas.

La arquitectura es un transformer causal de tipo GPT-2, entrenado con un script propio basado en Hugging Face Accelerate (sin `Trainer`), con 15.900 pasos, learning rate de 1e-4, scheduler lineal y un cambio de idioma en la epoca 10. El modelo forma parte de una familia de variantes con nombres paralelos (mal-ell, ltz-ell) que apuntan a un mismo protocolo experimental de entrenamiento secuencial multilingue.

Es relevante en el contexto de la investigacion sobre aprendizaje continuo en modelos pequenos: permite reproducir y comparar estrategias de regularizacion (EWC con coeficiente 5), evaluar el olvido entre idiomas y estudiar el efecto de tokenizadores compartidos. No obstante, no es un modelo apto para produccion: no tiene model card descriptiva, no declara licencia ni idiomas y acumula cero descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo GPT-2 |
| Parametros totales | 123.886.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere espanol y griego) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tokenizador | nikitastheo/goldfish-25k-spa-lower-seed43-ablated-tokenizer |
| Tamano del repo | 0,5 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo sigue la configuracion `configurations/gpt_base_config.json`, un transformer causal decoder-only de estilo GPT-2 con 123,9 millones de parametros. El entrenamiento se realizo con `train_clm.py`, un script propio basado en Hugging Face Accelerate que prescinde del `Trainer` de la libreria. Los hiperparametros declarados son: 15.900 pasos maximos, learning rate de 1e-4, scheduler lineal, 1.590 pasos de warmup, batch size de 32 por dispositivo sin acumulacion de gradientes (batch total de 32).

El nombre del repositorio indica varias decisiones tecnicas: tokenizador compartido de 25.000 entradas (`goldfish-25k-spa-lower-seed43-ablated-tokenizer`), entrenamiento secuencial por idiomas con un cambio de idioma en la epoca 10 (`spa-ell-sequential`), uso de Elastic Weight Consolidation con coeficiente 5 (`ewc5`) y una ablacion sobre el tokenizador o sobre componentes del modelo (`ablated`). La semilla es 43. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto causal autoregresiva, propia de un modelo GPT-2.
- Entrenamiento secuencial multilingue (presuntamente espanol y griego), orientado a estudiar la retencion de conocimiento entre idiomas.
- Uso de un tokenizador compartido de 25.000 entradas para varios idiomas.
- Integracion con la libreria `transformers` y con text-generation-inference (tag `text-generation-inference`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se ha documentado soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion sobre olvido catastrofico: el modelo sirve como punto de comparacion para medir cuanto conocimiento del primer idioma se retiene tras el cambio de idioma en la epoca 10, gracias a su entrenamiento secuencial documentado.
- Evaluacion de EWC en modelos pequenos: permite reproducir el efecto de la regularizacion EWC con coeficiente 5 sobre un transformer de 124 millones de parametros y compararlo con las variantes sin EWC de la misma familia.
- Estudio de tokenizadores compartidos: al usar un tokenizador comun de 25.000 entradas, es util para analizar como afecta la comparticion de vocabulario a la transferencia entre idiomas.
- Reproducibilidad experimental: los hiperparametros completos (pasos, learning rate, warmup, batch, semilla) permiten replicar el entrenamiento con el script `train_clm.py`.
- Pruebas de infraestructura de inferencia: su tamano reducido (0,5 GB en safetensors) lo hace adecuado para validar pipelines de despliegue con `transformers` o text-generation-inference antes de escalar a modelos mayores.
- Docencia y experimentacion con modelos GPT-2: sirve para ilustrar el ciclo completo de entrenamiento causal-LM con Accelerate en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB para los pesos, mas overhead de activaciones y cache KV; en la practica cabe en cualquier GPU consumer con 4 GB o mas.
- VRAM estimada en FP16/BF16: alrededor de 0,25 GB para los pesos, por lo que es ejecutable en CPU y en GPUs integradas.
- GPU recomendadas: no requiere GPU dedicada; funciona en RTX 3060, RTX 4090, A100 o H100 sin problemas, aunque estas ultimas estan sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 4 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (tag presente) y, previsiblemente, llama.cpp u Ollama si se generan pesos GGUF, aunque no se declaran cuantizaciones disponibles.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| v6-mixed-25k-lower-ablated-shared-ewc5-seed43-spa-ell-sequential | 123,9 M | no disponible | no disponible | Hugging Face (0 descargas) |
| nikitastheo/v6-mixed-25k-lower-shared-ewc5-seed43-mal-ell-sequential | no disponible (variante de la misma familia) | no disponible | no disponible | Hugging Face |
| nikitastheo/v6-mixed-25k-lower-shared-ewc5-seed43-ltz-ell-sequential | ~0,1 B (segun la busqueda) | no disponible | no disponible | Hugging Face |
| GPT-2 small (referencia de arquitectura) | 124 M | 1.024 tokens | MIT | Hugging Face, ampliamente disponible |

La comparativa se limita a variantes de la misma familia experimental y al GPT-2 small original, que comparte orden de magnitud en parametros. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede asumir permiso para uso comercial ni para redistribucion; conviene contactar con el autor antes de cualquier uso fuera de investigacion.
- Idiomas no declarados oficialmente: el nombre sugiere espanol y griego, pero la model card no lo confirma ni documenta la cobertura real.
- Sin model card descriptiva: no hay informacion sobre dataset, composicion, evaluacion ni limitaciones conocidas.
- Riesgo elevado de alucinacion y baja calidad de generacion esperable por su tamano (124 M de parametros) y por la falta de fases de alineacion documentadas (RLHF/DPO no mencionados).
- Posible olvido catastrofico: al ser un entrenamiento secuencial con cambio de idioma, es probable que el rendimiento en el primer idioma se degrade; el propio diseno experimental (EWC) sugiere que este es un problema a estudiar.
- Sin soporte documentado de tool calling, agentes ni contexto largo; no apto para pipelines de produccion que requieran estas capacidades.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion externa.
- Fecha de creacion futura (2026-11-08) en los metadatos: conviene verificar la procedencia y el estado real del repositorio antes de confiar en el.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-seed43-spa-ell-sequential
- Variante mal-ell: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-shared-ewc5-seed43-mal-ell-sequential
- Variante ltz-ell: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-shared-ewc5-seed43-ltz-ell-sequential
- Tokenizador: https://huggingface.co/nikitastheo/goldfish-25k-spa-lower-seed43-ablated-tokenizer
