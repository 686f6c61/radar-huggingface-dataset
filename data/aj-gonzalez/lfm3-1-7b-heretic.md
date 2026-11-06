# AJ-Gonzalez/LFM3-1.7B-heretic

## Resumen

LFM3-1.7B-heretic es una versión "abliterada" (sin mecanismos de rechazo) de LFM3-1.7B de LiquidAI, publicada por el usuario AJ-Gonzalez en Hugging Face. El modelo base pertenece a la familia LFM (Liquid Foundation Models) de LiquidAI, caracterizada por arquitecturas tri-híbridas que combinan convoluciones cortas, atención y MLP. Esta derivada no añade capacidades ni ha sido reentrenada: aplica una modificación de pesos denominada abliteration proyectada, generada con la herramienta Heretic 2.0.0.dev0, para reducir drásticamente la tasa de negativas (refusals) del modelo original.

El resultado es un modelo de 1.728,8 millones de parámetros que pasa de rechazar 92 de cada 100 peticiones del dataset `harmful_behaviors` a rechazar solo 10, con un coste medido de divergencia KL de 0,0452 respecto al modelo base. Es relevante para desarrolladores que investigan técnicas de modificación de alineamiento sin reentrenamiento, así como para despliegues en dispositivos edge gracias a su tamaño reducido y sus conversiones GGUF disponibles (desde 1,02 GB en Q4_K_M).

Cabe destacar que el modelo requiere `trust_remote_code=True` (usa código de modelado personalizado no integrado aún en `transformers`), soporta 16 idiomas incluido el castellano, y se distribuye bajo la LFM Open License v1.0, que restringe el uso comercial a entidades con facturación anual inferior a 10 millones de dólares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-hibrido (LFM3: convoluciones cortas, atencion y feed-forward) |
| Parametros totales | 1.728.801.536 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica si es MoE; todo apunta a modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (safetensors), GGUF: bf16, Q8_0, Q6_K, Q4_K_M |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | LFM Open License v1.0 (lfm1.0, tipo "other") |
| Formato de pesos | safetensors y GGUF (arquitectura `lfm3`, 287 tensores) |

## Arquitectura y entrenamiento

LFM3-1.7B es un transformer tri-híbrido de 24 capas de LiquidAI. La estructura híbrida combina 13 módulos de convolución corta (`short-conv out_proj`), 11 módulos de atención (`attn.o_proj`) y 24 módulos feed-forward (`feed_forward.w2`), lo que en la práctica de Heretic significa 48 matrices que escriben en el residual stream y son por tanto "abliterables". El modelo base incluye un modo de razonamiento (thinking) activable mediante la plantilla de chat.

No hubo entrenamiento ni ajuste fino en esta derivada: los pesos son los del modelo base con una ablación de rango 1 aplicada sobre las matrices que escriben en el residual stream. El método de Heretic calcula una dirección residual por capa como diferencia de medias entre el primer token generado en prompts dañinos (`mlabonne/harmful_behaviors`) y benignos (`mlabonne/harmless_alpaca`), y ortogonaliza las matrices de pesos contra esa dirección. La forma del kernel de pesos y el índice de dirección se optimizan conjuntamente con una búsqueda TPE de 100 pruebas (30 iniciales) contra dos objetivos: minimizar la tasa de rechazos por palabras clave y minimizar la divergencia KL respecto al modelo base. El punto elegido corresponde a un punto de la frontera de Pareto con parámetros como `attn.o_proj.max_weight = 1,14` y `mlp.down_proj.max_weight = 1,34`.

## Capacidades

- Generacion de texto conversacional en 16 idiomas, incluido castellano.
- Modo de razonamiento (thinking) heredado del modelo base, aunque desactivado por defecto en la plantilla de chat incluida (la ablacion se ajusto sin thinking).
- No incluye capacidades multimodales: solo el modelo de texto; las variantes LFM3-VL, -Audio y -Omni son checkpoints separados.
- No se ha evaluado tool calling, function calling ni capacidades agenticas en la informacion disponible.
- Compatibilidad con la libreria `transformers` (requiere `trust_remote_code=True`) y con `llama.cpp` mediante GGUF.
- Importante: la ablacion de rechazos no anade capacidad; el conocimiento y razonamiento son los de un modelo pequeno de 1,7B.

## Casos de uso

- Investigacion en tecnicas de abliteration y alineamiento: el repo documenta el metodo completo (direccion residual por capa, busqueda TPE, metricas de refusals y KL) y el comando de reproduccion exacto, lo que lo hace util como caso de estudio reproducible.
- Despliegue en dispositivos edge: con 1,02 GB en Q4_K_M y una decodificacion medida de ~46 tok/s en Apple M1 (carga en 2,0 s), es adecuado para ejecucion local en portatiles y moviles de gama alta.
- Prototipado rapido en CPU o GPU de consumo: los GGUF permiten probar el modelo con llama-cli sin infraestructura dedicada.
- Estudio del coste de calidad de la ablacion: la divergencia KL medida (0,0452) sirve como referencia para cuantificar cuanto se desvia el modelo modificado del base en distribuciones de primer token.
- Generacion de texto en castellano y otros idiomas con restricciones de alineamiento reducidas, para casos donde el usuario asume la responsabilidad del filtrado de contenido.
- Comparativa de comportamientos base frente a abliterado: el README incluye spot checks que muestran como cambian las respuestas en prompts de rechazo sin degradar los prompts benignos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion cuantitativa es la propia del metodo de ablacion:

| Modelo | Refusals (harmful_behaviors, test[:100]) | KL vs base (harmless_alpaca) |
|---|---:|---:|
| LiquidAI/LFM3-1.7B | 92/100 | 0 (por definicion) |
| **AJ-Gonzalez/LFM3-1.7B-heretic** | **10/100** | **0,0452** |

Mediciones adicionales: en Apple M1, el GGUF Q4_K_M carga en 2,0 s y decodifica a ~46 tok/s.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,5 GB en bf16 (safetensors); con GGUF, desde ~1,1 GB (Q4_K_M) hasta ~3,3 GB (bf16).
- GPU recomendadas: cualquier GPU de consumo con 4 GB o mas de VRAM es suficiente (por ejemplo RTX 3060, RTX 4060 o superiores); no se requieren A100 ni H100 para este tamano.
- Consumer GPU: cabe sobradamente en practicamente cualquier GPU moderna; incluso puede ejecutarse en CPU (Apple M1 medido a ~46 tok/s en Q4_K_M).
- Opciones de despliegue: `transformers` (con `trust_remote_code=True`), `llama.cpp` (se requiere una compilacion que incluya el soporte de arquitectura `lfm3`, integrado en el PR #31252; compilaciones antiguas rechazaran el modelo), y descarga directa con `llama-cli -hf AJ-Gonzalez/LFM3-1.7B-heretic:Q4_K_M`. No se menciona soporte para vLLM, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: ~46 tok/s de decodificacion en Apple M1 con Q4_K_M; otros valores no disponibles.

## Comparativa con modelos similares

| Caracteristica | LFM3-1.7B-heretic | LiquidAI/LFM3-1.7B (base) | Qwen3-1.7B (referencia de categoria) |
|---|---|---|---|
| Parametros | 1,73B | 1,73B | 1,7B |
| Arquitectura | Tri-hibrida (conv corta + atencion + FFN) | Tri-hibrida | Transformer denso |
| Refusals (harmful_behaviors) | 10/100 | 92/100 | no disponible |
| Thinking mode | Heredado, desactivado por defecto | Si | Si |
| Licencia | LFM Open License v1.0 (limite comercial 10M USD) | LFM Open License v1.0 | Apache 2.0 |
| Formatos | safetensors, GGUF | safetensors | safetensors, GGUF |
| Codigo personalizado | Si (trust_remote_code) | Si (trust_remote_code) | No |

Nota: los datos de Qwen3-1.7B se incluyen como referencia general de categoria; su comparacion en rendimiento exacto no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La reduccion de rechazos no anade capacidad: es un modelo pequeno de 1,7B con el conocimiento y razonamiento limitados que eso implica.
- La metrica de refusals es una comprobacion automatizada por palabras clave, no una evaluacion humana del dano; no constituye una evaluacion de seguridad y no se afirma que las salidas sean seguras o legales.
- La ablacion elimina una direccion global, por lo que puede desplazar el comportamiento mas alla de los rechazos; el KL de 0,0452 es el coste medido, no una garantia.
- El modo thinking esta desactivado por defecto porque la ablacion se ajusto sin thinking; activarlo puede producir comportamientos no caracterizados.
- La licencia LFM Open License v1.0 no permite el uso comercial a entidades con facturacion anual igual o superior a 10 millones de USD; se aplican requisitos de atribucion y aviso.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio (riesgo habitual de supply chain).
- Solo incluye el modelo de texto; las variantes VL, Audio y Omni son checkpoints separados.
- Riesgo de alucinacion inherente a modelos pequenos; no se han publicado benchmarks de calidad estandar para cuantificarla.
- llama.cpp requiere una compilacion reciente (PR #31252); versiones antiguas no cargan la arquitectura `lfm3`.

## Enlaces

- Modelo: https://huggingface.co/AJ-Gonzalez/LFM3-1.7B-heretic
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Licencia LFM Open License v1.0: incluida en el repositorio (archivo LICENSE, enlazado desde la model card)
