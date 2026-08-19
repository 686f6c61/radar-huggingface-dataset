# bluecolor777/megaextra-ep4-ultralolr-merged

## Resumen

El modelo `bluecolor777/megaextra-ep4-ultralolr-merged` es un checkpoint de 35 107 millones de parámetros desarrollado por el usuario bluecolor777, concebido como una submission para el desafío de minería "Affine SN120" bajo el sistema de evaluación Reason v4. Se trata de un ajuste fino mediante *offline DPO* (Direct Preference Optimization) sobre el modelo base `vera6/affine-5g4yy75zuz-t6`, con el objetivo de mejorar la preferencia de pensamientos que aumentan la puntuación "Reason" del lado del teacher en duelos de evaluación. No es un modelo de chat general, sino una pieza especializada para un pipeline de evaluación competitiva.

La arquitectura se basa en un transformer MoE (según la etiqueta `qwen3_5_moe`), con una variante denominada "Affine SN120". El entrenamiento empleó LoRA con rango 32, alpha 128, beta 0.1 y una tasa de aprendizaje extremadamente baja (5e-7), sobre 19 200 pasos y 4 épocas, con una longitud máxima de secuencia de 12 288 tokens. El proceso se ejecutó en 8 GPUs B200 y el resultado se declaró ganador en la evaluación interna con un margen estadísticamente significativo frente al modelo base.

A pesar de su licencia Apache-2.0, el uso está restringido a los fines del desafío Affine y a la política de artefactos de minería. El repositorio contiene 70.2 GB en 16 shards de safetensors, y no se han publicado métricas de rendimiento estándar (MMLU, HumanEval, etc.) en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (variante Affine SN120, basada en Qwen3.5 MoE) |
| Parametros totales | 35 107 181 936 (~35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 12 288 tokens (según hiperparametro de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con restricciones adicionales por politica de artefactos Affine) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE) basada en la familia Qwen3.5, adaptada bajo la variante "Affine SN120". No se especifican detalles sobre el número de expertos ni el mecanismo de enrutamiento, pero la etiqueta `qwen3_5_moe` sugiere que sigue el diseño de los modelos MoE de Qwen. El entrenamiento se realizó mediante *offline DPO* sobre pares de duelos razonados, donde el modelo debía aprender a preferir pensamientos que incrementaran la puntuación "Reason" del lado del teacher. Se usó una técnica de *multi-sample log-mean-exp* con k=3 referencias de teacher y temperatura τ=0.03.

Los hiperparámetros clave incluyen LoRA con rango 32 (MidRank), alpha 128 (HiAlpha), beta 0.1 (MidBeta), tasa de aprendizaje 5e-7 (UltraLoLR), longitud máxima 12 288 (SoftCtx) y 19 200 pasos de entrenamiento. El proceso se ejecutó en 8 GPUs B200 y el modelo resultante se fusionó con el base. La evaluación interna mostró una mejora de +0.003665 en margen frente al modelo base, con un z-score de 2.177 y una tasa de aprobación B de 0.5375, superando el umbral requerido.

## Capacidades

- Generacion de texto y razonamiento, optimizado para tareas de evaluacion tipo "duelo" bajo el sistema Reason v4.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso en el sentido convencional; el modelo esta disenado para generar pensamientos que maximicen una metrica especifica.
- Capacidades multilingues no especificadas.
- La etiqueta `image-text-to-text` sugiere posible soporte de entrada multimodal, pero no se confirma en la model card.
- No se menciona un modo de pensamiento especial ni capacidades de audio o vision.

## Casos de uso

- Participacion en el desafio de mineria Affine SN120: el modelo esta disenado para competir en duelos de evaluacion Reason v4, donde debe generar pensamientos que superen a los del modelo base o de otros competidores.
- Investigacion en optimizacion de preferencias: puede servir como caso de estudio para tecnicas de DPO offline con LoRA y tasas de aprendizaje extremadamente bajas en modelos MoE de gran tamano.
- Evaluacion de metodos de alineacion: sus metricas internas (margen, z-score, tasa B) pueden compararse con otros checkpoints del mismo linaje para estudiar el efecto de distintos hiperparametros.
- Base para fine-tuning adicional: dado que es un checkpoint intermedio, podria utilizarse como punto de partida para experimentos posteriores con otras tecnicas de alineacion.
- Analisis de comportamiento de modelos MoE en tareas de razonamiento estructurado, especialmente en escenarios con ventana de contexto de 12k tokens.
- Reproduccion de experimentos: los hiperparametros y el proceso estan documentados, lo que permite replicar el entrenamiento en otros entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card reporta metricas internas de evaluacion del duelo Reason v4:

| Metrica | Valor |
|---|---|
| Margen frente al modelo base | +0.003665 |
| Error estandar (SE) | 0.001684 |
| z-score | 2.177 |
| Tamano de muestra (n) | 80 |
| Mediana de pensamiento | 141.5 |
| Tasa de aprobacion B | 0.5375 |
| Barrera de aprobacion | 0.003367 |

Estas metricas no son comparables con benchmarks academicos convencionales y solo tienen significado dentro del sistema de evaluacion del desafio.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35 B parametros, en precision FP16 se necesitan aproximadamente 70 GB de VRAM; en cuantizacion de 8 bits, unos 35 GB; en 4 bits, unos 18 GB. No se proporcionan datos oficiales.
- GPU recomendadas: para FP16, GPUs de centro de datos como A100 80GB, H100 80GB o B200; para cuantizacion 4 bits, una RTX 4090 (24 GB) podria ser suficiente, aunque con limitaciones de velocidad.
- No se confirma si cabe en GPUs de consumo sin cuantizacion; con cuantizacion agresiva (4 bits) es posible en GPUs de 24 GB.
- Opciones de despliegue: al ser un modelo transformers estandar, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). No se mencionan configuraciones especificas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa con otros modelos de la misma categoria. Existe un checkpoint muy similar publicado por otro autor (`unconst/Affine-5czsc2fc98-r861-vera-odpo-midrank-midbeta-softctx-megaextra-ep4-ultralolr-merged`) que parece ser el mismo experimento con distinto nombre, pero no se conocen sus especificaciones completas. Ambos comparten el mismo linaje y metodologia, por lo que cabe esperar rendimientos equivalentes, aunque no se puede confirmar.

## Limitaciones y advertencias

- No es un modelo de chat general: su uso previsto es exclusivamente como submission para el desafio Affine SN120; no debe emplearse en aplicaciones de produccion sin un fine-tuning adicional.
- La licencia Apache-2.0 se complementa con una politica de artefactos de mineria que puede imponer restricciones adicionales al uso comercial o a la redistribucion.
- No se han evaluado sesgos ni riesgos de alucinacion; no hay informacion sobre la composicion del dataset de entrenamiento ni sobre su cobertura idiomatica.
- La longitud de contexto de 12 288 tokens es relativamente corta para tareas de razonamiento extenso o procesamiento de documentos largos.
- El modelo no ha sido probado en tareas fuera del ambito del desafio; su rendimiento en generacion de codigo, matematicas o conversacion general es desconocido.
- La fecha de creacion (agosto de 2026) y el numero de descargas (0) sugieren que es un experimento reciente y no validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bluecolor777/megaextra-ep4-ultralolr-merged
- Perfil del autor: https://huggingface.co/bluecolor777
- Modelo similar (mismo experimento, otro autor): https://huggingface.co/unconst/Affine-5czsc2fc98-r861-vera-odpo-midrank-midbeta-softctx-megaextra-ep4-ultralolr-merged
