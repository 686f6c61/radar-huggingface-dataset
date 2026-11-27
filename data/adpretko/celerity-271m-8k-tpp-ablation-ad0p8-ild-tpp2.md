# adpretko/celerity-271m-8k-tpp-ablation-ad0p8-ild-tpp2

## Resumen

Celerity 271M 8K es un checkpoint de lenguaje de 271 millones de parametros entrenado en hardware Cerebras (sistemas CSX) y convertido posteriormente al formato de Hugging Face. Se trata de un artefacto de investigacion: la variante `ad0.8_ild_tpp2` forma parte de una ablacion sobre el regimen de dropout de atencion y sobre los tokens por parametro (TPP) nominales, en concreto con un endpoint de dropout de atencion de 0,8 y un TPP nominal de 2. El modelo lo publica el usuario `adpretko` en Hugging Face, sin model card comercial ni pipeline declarado.

La relevancia es acotada y de caracter experimental: no es un modelo orientado a produccion, sino un punto de medida dentro de un barrido de hiperparametros. El entrenamiento se realizo sobre el dataset CommonPile (pool TPP corregido sin repeticiones) durante 3305 pasos, lo que equivale a unos 541 millones de tokens vistos, con una longitud maxima de secuencia de 8192 tokens y embeddings posicionales de tipo ALiBi.

La arquitectura es un transformer decoder-only con atencion de tipo estandar, sin mezcla de expertos, y con un esquema de dropout de atencion dependiente de la capa (escala lineal entre capas), donde 0,8 es el extremo de la programacion, no una probabilidad uniforme. El repositorio ocupa aproximadamente 0,5 GB y requiere cargarse con `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles internos no disponibles; requiere `custom_code`) |
| Parametros totales | 271 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en formato PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch`), con `custom_code` y `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 271 M de parametros con embeddings posicionales ALiBi y una longitud maxima de secuencia de 8192 tokens. La innovacion tecnica declarada en la model card no esta en la arquitectura sino en el regimen de regularizacion: el dropout de atencion sigue una programacion lineal dependiente de la capa cuyo endpoint es 0,8, y el resto de regularizadores estan desactivados (residual dropout 0,0, stochastic depth 0,0, LayerDrop 0,0). El dropout se desactiva en evaluacion mediante `model.eval()`.

El entrenamiento se ejecuto en 2 sistemas CSX de Cerebras con el runtime `cbcore 2.6.0`, un batch global de 20, learning rate pico de 0,15, weight decay de 0,003655 y `tau_ema` de 0,5518. Se completaron 3305 pasos sobre 541 491 200 tokens del dataset CommonPile (pool TPP corregido sin repeticiones), lo que corresponde a un TPP nominal de 2. El checkpoint de origen es `checkpoint_3305.mdl` y la conversion a Hugging Face se realizo con el commit `0e3d5d375695293479df9d2a3717f05f71a345b4`. No se documenta uso de RLHF, DPO ni fases de ajuste posteriores.

## Capacidades

- Generacion de texto autoregresiva con contexto de hasta 8192 tokens.
- Modelado de lenguaje base: no se documenta ningun ajuste instructivo, de chat ni de alineacion.
- Razonamiento y matematicas: no se documentan capacidades especificas ni evaluaciones.
- Codigo: no se documentan capacidades especificas ni evaluaciones.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion sobre regularizacion: el checkpoint sirve para estudiar el efecto del dropout de atencion dependiente de la capa en modelos pequenos, comparando este punto (`ad0.8_ild_tpp2`) con otros del mismo barrido de ablacion.
- Reproducibilidad de experimentos en Cerebras: util para validar la cadena de entrenamiento en CSX y la conversion posterior a formato Hugging Face con `custom_code`.
- Baseline de modelado de lenguaje a escala 271 M: permite medir perplejidad sobre dominios de CommonPile con una ventana de 8K tokens, util para comparar con otros checkpoints del mismo pool TPP.
- Experimentos de longitud de contexto: con ALiBi y 8192 tokens, sirve para probar extrapolacion posicional en tareas de recuperacion dentro de contexto en modelos pequenos.
- Estudio de eficiencia tokens/parametro: al estar etiquetado con TPP nominal 2 y 541 M de tokens vistos, es un punto de referencia para analizar curvas de escalado con presupuestos de computo reducidos.
- Filtrado y seleccion de datos: el uso del pool TPP corregido sin repeticiones permite analizar el impacto de la deduplicacion en la calidad del modelo a esta escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (fp32) los 271 M de parametros ocupan aproximadamente 1,1 GB; en fp16/bf16, unos 0,55 GB; en int8, unos 0,27 GB. A estas cifras hay que sumar el coste de la cache KV para 8192 tokens de contexto.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB o superior permite trabajar comodamente incluso con contexto completo.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: al requerir `custom_code` y `trust_remote_code=True`, la integracion con vLLM, llama.cpp u Ollama no esta garantizada; la via directa es `transformers` con el codigo remoto del repositorio. La conversion a GGUF no esta documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Celerity 271M 8K (esta ficha) | 271 M | 8192 | no disponible | Hugging Face, `custom_code` | Checkpoint de ablacion, sin benchmarks |
| GPT-2 small | 124 M | 1024 | MIT | Hugging Face, ampliamente soportado | Referencia clasica a escala similar, contexto mucho menor |
| Pythia-410M | 410 M | 2048 | Apache 2.0 | Hugging Face, transformers nativo | Suite de investigacion con checkpoints intermedios y evaluaciones publicadas |
| Cerebras-GPT-256M | 256 M | 2048 | Apache 2.0 | Hugging Face | Modelo de la misma familia de hardware (Cerebras) con escalado Chinchilla |

La comparacion con alternativas de la misma categoria es aproximada: no hay datos de rendimiento publicados para este checkpoint, por lo que la eleccion frente a Pythia o Cerebras-GPT depende de la disponibilidad de evaluaciones y del soporte de herramientas, no de metricas verificadas.

## Limitaciones y advertencias

- Modelo base sin alineacion: no ha pasado por RLHF, DPO ni ajuste instructivo, por lo que no es adecuado para uso conversacional directo.
- Riesgo de alucinacion: alto en tareas de hechos, como corresponde a un modelo de 271 M entrenado con unos 541 M de tokens.
- Sesgos conocidos: no documentados, pero el dataset CommonPile y el bajo presupuesto de entrenamiento implican sesgos no caracterizados.
- Idiomas: no se declara cobertura linguistica; no debe asumirse un rendimiento multilingue.
- Licencia: no disponible, lo que impide determinar si el uso comercial esta permitido. Conviene contactar con el autor antes de cualquier uso en produccion.
- Dependencia de codigo remoto: la carga exige `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; auditar antes de desplegar.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado; es un artefacto de investigacion sin soporte comunitario.
- Dropout en evaluacion: el regimen de dropout de atencion con endpoint 0,8 es una programacion por capas, no una probabilidad uniforme; debe desactivarse con `model.eval()` para obtener resultados reproducibles.

## Enlaces

- Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-tpp-ablation-ad0p8-ild-tpp2
- Dataset citado (CommonPile): no disponible enlace directo en la informacion proporcionada
- Paper o blog del autor: no disponible
- Repositorio de codigo: no disponible
