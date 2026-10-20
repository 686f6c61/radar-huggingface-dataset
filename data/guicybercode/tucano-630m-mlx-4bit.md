# guicybercode/Tucano-630m-mlx-4bit

## Resumen

Tucano-630m-mlx-4bit es una conversión al formato MLX con cuantización de 4 bits del modelo TucanoBR/Tucano-630m, un modelo de lenguaje en portugués desarrollado por el equipo TucanoBR (Nicholas Kluge Corrêa, Aniket Sen, Sophia Falk y Shiza Fatimah). El repositorio lo publica el usuario guicybercode y no aporta entrenamiento nuevo: se trata únicamente de una conversión de formato con fines de inferencia local. El modelo original se describe en el paper arXiv:2411.07854.

El modelo base tiene 630.253.568 parámetros (aproximadamente 630 millones), arquitectura tipo transformer decoder-only con tag `llama` en HuggingFace, y está especializado en portugués (`language: pt`). Al estar cuantizado a 4 bits con group size 64 y mantener las tensiones no cuantizadas en float16, el fichero de pesos ocupa 355 MB (354.639.240 bytes), lo que permite ejecutarlo en equipos con recursos muy limitados.

Su relevancia práctica es acotada pero concreta: ofrece una vía sencilla para probar un modelo de lenguaje en portugués de tamano pequeno en entornos MLX, con licencia Apache-2.0 que permite uso comercial. Es importante senalar que el autor de la conversión no ha ejecutado ninguna evaluación de rendimiento sobre la versión cuantizada; solo una prueba de carga y generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tag `llama`), modelo base TucanoBR/Tucano-630m |
| Parametros totales | 630.253.568 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64; tensiones no cuantizadas en float16 |
| Idiomas soportados | Portugues (`pt`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX); fichero `model.safetensors` de 355 MB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo original mas alla del tag `llama` de HuggingFace, que indica una familia de transformer decoder-only con atención causal estandar. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del corpus, ni si hubo fases de ajuste fino con RLHF o DPO. Para esos datos hay que remitirse a la model card del modelo base TucanoBR/Tucano-630m y al paper arXiv:2411.07854.

Lo que si esta documentado es el proceso de conversion a MLX. Se realizo con `mlx-lm` 0.32.2 sobre `mlx` 0.32.4, usando el backend de CPU en Linux x86_64, mediante el comando `mlx_lm.convert --hf-path TucanoBR/Tucano-630m --mlx-path Tucano-630m-mlx-4bit -q --q-bits 4 --dtype float16`. El autor indica que se forzo `float16` porque en el backend CPU de MLX sobre Linux una conversion a bfloat16 producia unicamente tokens `<unk>`, mientras que float16 generaba texto normal. La conversion no se probo en Apple Silicon, el entorno habitual de MLX.

## Capacidades

- Generacion de texto en portugués: el modelo esta entrenado y etiquetado exclusivamente para este idioma.
- Modelo de completado de texto base: la prueba de humo documentada usa un prompt de continuacion ("A capital do Brasil é") con `temperature 0` y 32 tokens.
- Inferencia local en formato MLX mediante `mlx-lm`, tanto por CLI (`mlx_lm.generate`) como potencialmente por API de Python.
- Huella de memoria muy reducida: 355 MB de pesos en disco, lo que facilita su uso en equipos modestos.
- No hay evidencia documentada de soporte de tool calling, function calling, razonamiento multi-paso, modo thinking, vision, audio ni capacidades de agente. Al ser un modelo base de 630M, es razonable asumir que no las ofrece, pero no se confirma en la informacion disponible.
- Capacidades multilingues: no disponibles; solo portugues segun la etiqueta de idioma.

## Casos de uso

- Prototipado rapido de funcionalidades NLP en portugues: permite validar pipelines de generacion de texto en un portatil antes de invertir en modelos mayores, gracias a sus 355 MB de pesos.
- Completado y autocompletado de texto en portugues: por ejemplo, sugerencias de continuacion de frases en editores o formularios, con latencia muy baja al ejecutarse en local.
- Generacion de texto offline en dispositivos con recursos limitados: al caber en pocos cientos de MB, es viable en entornos sin GPU dedicada y sin conexion a internet.
- Pruebas de integracion con el ecosistema MLX: sirve como modelo de referencia para verificar que un pipeline basado en `mlx-lm` funciona antes de desplegar modelos mas grandes en el mismo stack.
- Experimentacion academica con modelos pequenos en portugues: util para estudiar el efecto de la cuantizacion a 4 bits en la calidad de generacion respecto al modelo original en float16.
- Generacion de texto auxiliar de bajo coste: borradores, expansiones breves o variaciones de texto donde no se requiere alta precision y prima el coste cero de inferencia local.
- Base para ajuste fino ligero (LoRA/QLoRA) en portugues: al tener licencia Apache-2.0 y un tamano reducido, es un punto de partida asequible para adaptaciones de dominio, siempre que se verifique la calidad del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor de la conversion indica explicitamente que no ejecuto ninguna evaluacion sobre el modelo cuantizado y que la unica comprobacion fue una prueba de carga y generacion ("smoke test") en el backend CPU de MLX sobre Linux, con el prompt "A capital do Brasil é", 32 tokens y temperature 0. La salida documentada fue:

> "também a cidade mais populosa da América Latina. A cidade do Rio de Janeiro é um importante centro financeiro, cultural e sede de diversos órgãos governamentais. A cidade"

Esta salida muestra un fallo evidente de coherencia factual (la capital de Brasil es Brasilia, no Rio de Janeiro), lo que confirma que se trata de una prueba de funcionamiento y no de una evaluacion de calidad. Para resultados de benchmarks del modelo original hay que consultar la model card de TucanoBR/Tucano-630m y el paper arXiv:2411.07854, no incluidos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB solo para los pesos en 4 bits, mas overhead de activaciones y cache KV. En la practica, menos de 1 GB en total para contextos cortos.
- Modelo original sin cuantizar: al tener 630M parametros, en float16 ocuparia en torno a 1,26 GB, y en float32 alrededor de 2,5 GB (calculo teorico a partir del numero de parametros; no confirmado en la informacion).
- GPU recomendadas: no se especifican. MLX esta disenado para Apple Silicon (M1/M2/M3/M4); esta conversion concreta se genero y probo en CPU x86_64 sobre Linux, no en Apple Silicon.
- Cabe en GPU de consumo: si, con margen amplio. Cualquier GPU con 2 GB o mas de memoria es suficiente para los pesos; el cuello de botella real es el soporte de MLX en el hardware, no la VRAM.
- Opciones de despliegue: `mlx-lm` (CLI `mlx_lm.generate` y API Python) es la via documentada. Para otros runtimes (llama.cpp, Ollama, vLLM, TGI) seria necesario reconvertir desde el modelo original a GGUF u otro formato, ya que estos pesos estan en formato MLX.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| guicybercode/Tucano-630m-mlx-4bit | 630.253.568 | no disponible | MLX safetensors, 4 bits | Apache-2.0 | Conversion no oficial, sin evaluacion |
| TucanoBR/Tucano-630m (original) | 630.253.568 | no disponible | safetensors (HF) | Apache-2.0 | Modelo de referencia del autor; incluye evaluaciones del paper |
| Otros modelos pequenos en portugues | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparacion relevante es interna: frente al modelo original, esta version reduce el peso en disco de forma drastica (355 MB) a costa de una perdida de precision no medida. Frente a alternativas de otros autores, no hay datos en la informacion disponible para establecer una comparacion rigurosa de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo validado: el autor no ha ejecutado benchmarks, y la unica prueba documentada produce un error factual evidente sobre la capital de Brasil. No debe usarse como referencia de calidad.
- Riesgo alto de alucinacion: con 630M parametros y sin evaluacion, la generacion de hechos es poco fiable.
- Idiomas: solo portugues. No hay evidencia de competencia en castellano, ingles u otros idiomas.
- Contexto: no documentado. Se desconoce la ventana maxima soportada, lo que impide planificar casos de uso con entradas largas.
- Conversion no oficial: el repositorio lo mantiene un tercero, no el equipo TucanoBR. No hay garantia de mantenimiento, actualizaciones ni soporte.
- Sin probar en Apple Silicon: el proceso de conversion se realizo en CPU x86_64 con Linux, y el autor advierte explicitamente que no se ha probado en el hardware objetivo habitual de MLX. El comportamiento en M-series es desconocido.
- Problema conocido con bfloat16: en el backend CPU de MLX sobre Linux, la conversion a bfloat16 degradaba la salida a tokens `<unk>`. Si se reutiliza el proceso de conversion, hay que forzar float16 o verificar la salida.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero se recomienda conservar la atribucion a los autores originales, tal como hace la propia model card.
- No apto para produccion sin evaluacion previa: antes de cualquier despliegue real hay que medir calidad, latencia y comportamiento en el dominio objetivo.
- Ausencia de datos de sesgo: no se ha publicado informacion sobre sesgos del modelo original ni de la version cuantizada en la informacion disponible.

## Enlaces

- Repositorio de la version cuantizada: https://huggingface.co/guicybercode/Tucano-630m-mlx-4bit
- Modelo base original: https://huggingface.co/TucanoBR/Tucano-630m
- Paper del modelo Tucano: https://arxiv.org/abs/2411.07854
