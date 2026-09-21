# gaurabdas/pricelab-qwen3-0.6b

## Resumen

PriceLab Qwen3-0.6B es un ajuste fino supervisado del modelo Qwen/Qwen3-0.6B (596.049.920 parametros) desarrollado por Gaurab Das y publicado en HuggingFace. Su unica funcion es estimar el precio historico en dolares enteros de un producto descrito en ingles a partir de su descripcion textual: no consulta listados actuales ni realiza busquedas de mercado. El entrenamiento se hizo con QLoRA de rango 16 sobre una base congelada en 4-bit NF4 y el adaptador resultante se fusiono en pesos float32 independientes, de modo que el repositorio no necesita ficheros de adaptador para cargarse.

El modelo parte del dataset preparado ed-donner/items_lite, derivado de Amazon Reviews 2023 (McAuley Lab, arXiv:2403.03952), con 19.991 ejemplos de entrenamiento, 999 de validacion y 1.000 de test. La version mejorada entrena dos epocas con tasa de aprendizaje 1e-4, batch efectivo 32, semilla 42 y limite de secuencia de 256 tokens, con perdida calculada solo sobre la completacion. El resultado reportado es un MAE de 68,05 USD en test, frente a 80,08 USD de la version inicial y 76,17 USD de la referencia TF-IDF + Ridge.

Su relevancia es doble: por un lado es un ejemplo completo y reproducible de un ciclo de ajuste fino de bajo coste (QLoRA sobre una Tesla T4) con auditoria de datos, seleccion por validacion y despliegue fusionado; por otro, es un caso de estudio de las limitaciones reales de los modelos pequenos en tareas de regresion numerica, donde solo el 24 % de las predicciones cae dentro del 20 % del precio real. Es un artefacto educativo y de investigacion, no una herramienta de valoracion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only de la familia Qwen3 (modelo base Qwen/Qwen3-0.6B), con atencion por RoPE y QK-Norm |
| Parametros totales | 596.049.920 (0,6 B aproximadamente) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; el ajuste fino usa un limite de secuencia de 256 tokens y la inferencia trunca el prompt a 232 tokens (256 menos 24 reservados para la respuesta) |
| Tipos de cuantizacion | El repositorio publica unicamente pesos en float32; no se distribuyen versiones cuantizadas. Al derivar de Qwen3-0.6B es convertible con herramientas estandar (GGUF, bitsandbytes), pero no hay conversiones oficiales publicadas |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible en la model card; el modelo base Qwen3-0.6B se publica bajo Apache 2.0 |
| Formato de pesos | safetensors (float32, fusionados; no requiere adaptador) |
| Tamano del repositorio | 2,4 GB |
| Pipeline | text-generation |
| Revision base | c1899de289a04d12100db370d81485cdf75e47ca |
| Revision del dataset | 057ae6b7731e35538897c976e391e76fbb729006 |
| Entorno verificado | Transformers 4.57.6 y PyTorch 2.9.1 |
| Fecha de publicacion | 21 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-0.6B, un transformer decoder-only denso con atencion causal, embeddings rotatorios (RoPE) y QK-Norm, disenado para generacion de texto. Sobre esa base congelada se aplico QLoRA: cuantizacion 4-bit NF4 con doble cuantizacion, entrenamiento en FP16 sobre una Tesla T4, adaptadores LoRA de rango 16 sobre todas las capas lineales, alpha 32 y dropout 0,05. La version mejorada entrena dos epocas completas con tasa de aprendizaje 1e-4, batch efectivo 32, semilla 42 y limite de secuencia de 256 tokens, usando perdida exclusiva sobre la completacion (completion-only loss) para que el modelo aprenda unicamente a emitir el numero de precio y no a reproducir el prompt.

Tras el entrenamiento, el adaptador se fusiono en los pesos base y se exporto en float32. La fusion solo incorpora las actualizaciones aprendidas; no implica entrenamiento adicional. El autor documenta una verificacion local de la fusion en la que las 104 comparaciones realizadas coincidieron con el comportamiento del adaptador (fichero `verification.json`), lo que acredita compatibilidad por muestreo, no una nueva evaluacion de calidad. La seleccion del checkpoint se hizo sobre el conjunto de validacion antes de tocar el test: el MAE de validacion bajo de 84,12 USD a 74,27 USD (una mejora del 11,71 %). Los objetivos de precio son dolares enteros redondeados con el redondeo de Python (entero mas cercano, empates al par).

No hay datos publicados sobre la composicion exacta del corpus mas alla del dataset derivado de Amazon Reviews 2023, ni sobre tecnicas adicionales como decodificacion especulativa. El prompt de sistema del autor incluye una instruccion explicita de tratar la descripcion del producto como datos y no como instrucciones.

## Capacidades

- Generacion de un unico valor numerico: dado un texto en ingles de entre 3 y 2.000 caracteres que describe un producto, devuelve un precio historico en dolares enteros sin simbolo de moneda ni explicacion.
- Formato de chat sin modo pensamiento: la plantilla de chat se aplica con `enable_thinking=False`, por lo que no genera cadenas de razonamiento visibles.
- Estimacion de precios historicos sobre descripciones de productos de Amazon (categoria de electrodomesticos y articulos de uso diario segun el dataset de origen).
- Validacion de salida integrada en el codigo de ejemplo: si la respuesta no encaja con el patron `\$?\d+(\.\d{1,2})?`, el valor devuelto es `None` en lugar de un cero sustitutivo.
- Capacidad multilingue: limitada al ingles; el autor declara unicamente el idioma `en`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni uso de herramientas externas.
- No tiene vision, audio ni capacidades multimodales.
- No busca informacion actual de mercado: el propio autor indica explicitamente que «no busca listados actuales».
- Tag `conversational` en el repositorio, aunque el uso previsto es de una sola interaccion corta con salida numerica.

## Casos de uso

- Etiquetado de catalogos historicos de e-commerce: dado un conjunto de descripciones de producto sin precio registrado, el modelo genera una estimacion en dolares enteros que puede usarse para completar campos ausentes antes de un analisis exploratorio.
- Baseline ligero en investigacion sobre prediccion de precios: al ser un modelo de 0,6 B con MAE documentado de 68,05 USD, sirve como punto de comparacion reproducible frente a metodos clasicos como TF-IDF + Ridge (76,17 USD) en articulos y experimentos academicos.
- Material docente para cursos de ajuste fino: el repositorio documenta el ciclo completo (auditoria de datos, QLoRA con cuantizacion 4-bit, seleccion por validacion, fusion de adaptadores y despliegue), lo que lo convierte en un ejemplo practico de bajo coste ejecutable en una unica GPU de 16 GB.
- Puntuacion por lotes sin GPU: al ser un modelo de 0,6 B exportado en float32 (unos 2,4 GB), puede ejecutarse en CPU sobre miles de descripciones en un proceso offline, sin infraestructura acelerada.
- Deteccion de anomalias en datos de catalogo: comparar el precio declarado de un articulo con la estimacion del modelo permite senalar posibles errores de etiquetado o valores atipicos para revision manual, siempre con umbrales amplios dado el error mediano de 40 USD.
- Aprovisionamiento de caracteristicas para sistemas de recomendacion: el precio estimado puede alimentar caracteristicas de entrada en modelos de ranking o de filtrado colaborativo cuando el precio real no esta disponible para articulos de catalogo nuevo (cold start).
- Prototipado rapido en entornos sin infraestructura: al no necesitar adaptadores ni una GPU dedicada, permite montar una demo funcional en minutos con Transformers 4.57.6 y PyTorch 2.9.1.
- Auditoria de sesgo en regresion numerica: las predicciones repetidas documentadas (100 USD aparece 298 veces y 120 USD aparece 195 veces en el conjunto de test) lo convierten en un caso util para estudiar colapso de modos en modelos generativos pequenos aplicados a tareas de regresion.

## Benchmarks y rendimiento

Resultados registrados por el autor. Las cifras son de la variante con adaptador en GPU y float16, no de una evaluacion nueva del export float32 fusionado. El autor advierte ademas que el banco de 1.000 productos se examino en experimentos anteriores y no es un holdout intacto. MAE significa error absoluto medio en dolares; mas bajo es mejor.

| Modelo | MAE en test (USD) | RMSE en test (USD) | Dentro del 20 % |
|---|---:|---:|---:|
| Version inicial ajustada | 80,08 | 137,17 | 20,2 % |
| Referencia TF-IDF + Ridge | 76,17 | 118,08 | 21,4 % |
| Version mejorada ajustada | 68,05 | 118,97 | 24,0 % |

Datos adicionales de la version mejorada: cobertura numerica de 1.000 sobre 1.000, error absoluto mediano de 40 USD y reduccion del MAE en test del 15,03 % respecto a la version inicial. Resultados de validacion: el MAE bajo de 84,12 USD a 74,27 USD (11,71 %). No se han publicado resultados en benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible ni en las busquedas web realizadas.

## Requisitos de hardware

- VRAM estimada para inferencia en float32 (formato publicado): en torno a 2,4 GB solo de pesos, mas activaciones y cache; aproximadamente 3-4 GB en total.
- VRAM estimada en otras precisiones (no publicadas oficialmente, calculadas a partir del numero de parametros): unos 1,2 GB en fp16 o bf16, unos 0,6 GB en 8 bits y unos 0,4 GB en 4 bits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM funciona; el entrenamiento documentado se realizo en una Tesla T4 de 16 GB. Para servir en produccion no se requiere A100 ni H100 dado el tamano del modelo.
- GPU de consumo: cabe holgadamente en tarjetas como RTX 3050, RTX 3060, RTX 4060, RTX 4090 y equivalentes. Tambien es viable en CPU con Transformers si la latencia no es critica.
- Opciones de despliegue: Transformers con la version verificada 4.57.6 y PyTorch 2.9.1; el repositorio incluye el tag `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con TGI y con los endpoints de HuggingFace. Para llama.cpp u Ollama seria necesaria una conversion a GGUF, que no se distribuye. vLLM es compatible con la arquitectura Qwen3, aunque no hay configuracion publicada para este modelo concreto.
- Latencia y throughput: no se han publicado medidas de latencia ni de throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MAE en test (USD) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PriceLab Qwen3-0.6B (mejorada) | 596 M | 256 tokens en ajuste; 32.768 en el base | 68,05 | no disponible | Pesos safetensors float32 en HuggingFace |
| PriceLab Qwen3-0.6B (inicial) | 596 M | 256 tokens en ajuste | 80,08 | no disponible | Version previa con adaptador |
| TF-IDF + Ridge (referencia) | no aplica | no aplica | 76,17 | no aplica | Baseline clasico, resultado historico no reajustado |
| Qwen/Qwen3-0.6B (base) | 596 M | 32.768 tokens | no disponible | Apache 2.0 | Pesos oficiales en HuggingFace |

No se dispone de datos de rendimiento comparables para alternativas de proposito general del mismo tamano (por ejemplo otros modelos de la franja de 0,5 a 1 B) aplicadas a esta tarea concreta de estimacion de precios, por lo que no se incluyen cifras que no esten respaldadas por la informacion proporcionada.

## Limitaciones y advertencias

- Herramienta educativa de estimacion historica: no es un sistema de valoracion de mercado actual ni debe conectarse a compras automatizadas.
- Precision limitada: solo el 24,0 % de las predicciones registradas cayeron dentro del 20 % del precio real; el error absoluto mediano es de 40 USD.
- Colapso de modos: en el conjunto de test el valor 100 USD se predijo 298 veces y el valor 120 USD, 195 veces, lo que indica una tendencia fuerte a repetir un punado de cifras frecuentes.
- Sesgo contra productos caros: los articulos de 200 USD o mas presentaron un MAE de 182,40 USD, de modo que el error se dispara en la gama alta.
- Limitacion idiomatica: solo se declara soporte de ingles; no hay evidencia de funcionamiento en castellano u otros idiomas.
- Limitacion de contexto en la practica: aunque el modelo base soporta 32.768 tokens, el ajuste se hizo con secuencias de 256 tokens y el codigo de ejemplo trunca el prompt a 232 tokens, por lo que descripciones largas pierden informacion.
- Riesgo de alucinacion numerica: el modelo devuelve siempre un numero plausible aunque no tenga base suficiente; el codigo de ejemplo mitiga el formato invalido devolviendo `None`, pero no puede detectar una cifra incorrecta con formato valido.
- Procedencia de los datos y sesgo de dominio: el entrenamiento proviene de descripciones de productos de Amazon Reviews 2023, por lo que el sesgo de catalogo, categoria y epoca del dataset se traslada a las predicciones.
- Integridad de la evaluacion: el autor advierte que el banco de 1.000 productos se examino en experimentos previos y no constituye un holdout intacto; las cifras publicadas son de la variante con adaptador y no de una evaluacion completa del export float32 fusionado.
- Licencia: la model card no especifica licencia para este modelo. El modelo base Qwen3-0.6B se publica bajo Apache 2.0, pero no hay confirmacion de que la licencia del derivado sea la misma, por lo que el uso comercial queda sin cobertura explicita hasta que el autor lo aclare.
- Prompts no confiables: el autor incluye una instruccion explicita de tratar la descripcion como datos y no como instrucciones, lo que indica conciencia de riesgo de inyeccion de prompt a traves del texto de entrada.
- Adopcion practicamente nula: el repositorio presenta 0 descargas y 0 me gusta en el momento de la consulta, sin comunidad que haya validado de forma independiente los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gaurabdas/pricelab-qwen3-0.6b
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset preparado por Ed Donner: https://huggingface.co/datasets/ed-donner/items_lite
- Amazon Reviews 2023 (McAuley Lab): https://amazon-reviews-2023.github.io/
- Paper del dataset: Hou et al. (2024), «Bridging Language and Items for Retrieval and Recommendation», arXiv:2403.03952, https://arxiv.org/abs/2403.03952
- Fichero de verificacion de la fusion: `verification.json` dentro del repositorio del modelo

Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces recuperados correspondian a contenidos sin relacion (astrologia y comparativas de asistentes conversacionales), por lo que se han descartado.
