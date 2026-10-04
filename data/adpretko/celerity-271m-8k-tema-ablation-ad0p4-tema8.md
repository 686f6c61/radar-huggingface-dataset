# adpretko/celerity-271m-8k-tema-ablation-ad0p4-tema8

## Resumen

Celerity 271M 8K — TEMA ablation — ad0.4_tema_mult8 es un checkpoint de modelo de lenguaje de 271 millones de parametros publicado por el usuario adpretko en Hugging Face. Se trata de un punto de control de un experimento de ablacion sobre el multiplicador de tau-EMA (aprendizaje con media movil exponencial de los pesos) dentro de la familia de modelos Celerity, convertido desde el formato propietario CS de Cerebras a formato Hugging Face. Su relevancia es principalmente metodologica: forma parte de una serie de checkpoints de ablacion (attention dropout 0.4, tau_ema 1.396, weight decay ajustado en consecuencia) cuyo objetivo es estudiar el efecto de hiperparametros de entrenamiento sobre las ponderaciones aprendidas.

El modelo maneja una longitud de contexto de 8192 tokens (de ahi el sufijo "8k") y emplea embeddings posicionales de tipo ALiBi. Esta pensado para cargarse con codigo de modelado propio de Celerity, lo que obliga a usar `trust_remote_code=True` al cargarlo desde Hugging Face.

Dado que es un checkpoint de investigacion con cero descargas y cero likes en el momento de la consulta, no debe considerarse un modelo listo para produccion. No se han publicado datos de licencia, idiomas soportados, resultados de benchmarks ni detalles sobre cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con codigo de modelado propio de Celerity; embeddings posicionales ALiBi |
| Parametros totales | 271 millones (segun el identificador del modelo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio PyTorch de 0.5 GB, requiere codigo personalizado) |

## Arquitectura y entrenamiento

La model card describe el checkpoint como un punto de control de una ablacion de tau-EMA dentro de la familia Celerity, convertido desde formato Cerebras CS a formato Hugging Face mediante un convertidor con commit `0e3d5d375695293479df9d2a3717f05f71a345b4`. La arquitectura concreta no se detalla mas alla de indicarse que emplea embeddings posicionales ALiBi, atencion con dropout configurable y codigo de modelado propio. No se especifica el numero de capas, dimensiones ocultas ni numero de cabezas de atencion.

El entrenamiento se realizo con las siguientes caracteristicas: `attention dropout` de 0.4 con tasa constante, learning rate maximo de 0.15, weight decay de 0.00034673267902102944, `tau_ema` de 1.396, multiplicador de tau-EMA de 8 relativo a la linea base 0.1745, batch global de entrenamiento de 48, batch de validacion de 32 y 13773 pasos de entrenamiento. La longitud maxima de secuencia fue de 8192 tokens. Los hiperparametros de regularizacion estructural (residual dropout, stochastic depth y LayerDrop) se fijaron a 0.0 en este experimento. El runtime de origen fue cbcore 2.6.0. La model card indica que el dropout de atencion, la tau_ema y el weight decay son hiperparametros de tiempo de entrenamiento cuyos efectos quedan reflejados en los pesos aprendidos, y que la evaluacion en Hugging Face se realiza con dropout desactivado mediante `model.eval()`. No se documentan la composicion del dataset de entrenamiento, el numero de tokens totales ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva como capacidad base esperada de un modelo de lenguaje de 271M.
- Ventana de contexto de hasta 8192 tokens, adecuada para documentos de longitud media.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se especifica cobertura multilingue.
- No se documentan capacidades de vision, audio ni modo "thinking".

## Casos de uso

- Investigacion sobre entrenamiento con EMA: el checkpoint permite reproducir y analizar el efecto de distintos multiplicadores de tau-EMA sobre el rendimiento final, ya que forma parte de una serie de ablaciones controladas.
- Estudio del efecto del attention dropout: con una tasa de 0.4, sirve para comparar frente a otros checkpoints de la serie con tasas distintas.
- Experimentacion academica sobre regularizacion: util para analizar como el dropout de atencion, el weight decay y la EMA interactuan durante el entrenamiento.
- Pruebas de extrapolacion con ALiBi: el uso de embeddings ALiBi y contexto de 8192 tokens permite estudiar el comportamiento posicional en secuencias largas.
- Banco de pruebas para despliegue de modelos de 271M: con un peso aproximado de 0.5 GB, es adecuado para validar pipelines de inferencia (vLLM, llama.cpp, TGI) en entornos de investigacion.
- Comparacion de checkpoints dentro de la misma familia: permite medir diferencias de comportamiento entre los distintos puntos de control de la serie Celerity.
- Educacion y formacion: sirve como ejemplo de modelo con codigo personalizado que requiere `trust_remote_code=True`, util para ilustrar flujos de carga desde Cerebras CS a Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 en torno a 1.1 GB; en FP16/BF16 en torno a 0.55 GB; en INT8 en torno a 0.3 GB; en INT4 en torno a 0.15 GB (estimaciones calculadas a partir de los 271M de parametros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente; se puede usar RTX 3060, RTX 4060, RTX 4090, A100 o H100 sin problema de capacidad.
- Cabe holgadamente en GPU de consumo, y probablemente en CPU para inferencia con cuantizacion.
- Opciones de despliegue: no confirmadas por el autor, pero al ser un modelo PyTorch con codigo personalizado conviene cargarlo mediante `transformers` con `trust_remote_code=True`; otros runners (vLLM, llama.cpp, Ollama, TGI) requeririan soporte explicito del codigo Celerity.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| Celerity 271M 8K (esta ficha) | 271M | 8192 tokens | no disponible | no disponible |
| adpretko/celerity-271m-8k-ad0p4 | 271M | no disponible (presumiblemente 8K) | no disponible | no disponible |
| adpretko/celerity-271m-8k-residual-dropout-0p2 | 271M | no disponible (presumiblemente 8K) | no disponible | no disponible |
| adpretko/celerity-271m-8k-residual-dropout-0p4 | 271M | no disponible (presumiblemente 8K) | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento frente a modelos de otras familias con tamanos similares.

## Limitaciones y advertencias

- Es un checkpoint de investigacion (ablacion) con cero descargas y cero likes, no un modelo afinado para uso general.
- No se especifica la licencia, por lo que no se puede asumir su uso comercial.
- No se documentan los idiomas de entrenamiento ni la composicion del dataset, lo que impide evaluar sesgos de dominio o idioma.
- Como modelo de 271M, cabe esperar una capacidad de razonamiento limitada y una mayor propension a la alucinacion en comparacion con modelos de mayor tamano; no hay datos publicados que lo confirmen.
- Requiere `trust_remote_code=True` y ejecutar codigo de modelado del propio autor, lo que implica un riesgo de seguridad y reproducibilidad en produccion.
- La model card advierte que los hiperparametros de dropout, tau_ema y weight decay son de tiempo de entrenamiento; cualquier evaluacion debe hacerlo con `model.eval()` para desactivar el dropout.
- No hay informacion sobre cuantizacion, formato de pesos compatible con runners estandar ni licencia, lo que complica su integracion en pipelines de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-tema-ablation-ad0p4-tema8
- Checkpoint relacionado: https://huggingface.co/adpretko/celerity-271m-8k-ad0p4
- Checkpoint relacionado: https://huggingface.co/adpretko/celerity-271m-8k-residual-dropout-0p2
- Checkpoint relacionado: https://huggingface.co/adpretko/celerity-271m-8k-residual-dropout-0p4
