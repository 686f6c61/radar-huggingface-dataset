# icharle/Huihui-Qwen3.8-27B-abliterated-DFlash2

## Resumen

Huihui-Qwen3.8-27B-abliterated-DFlash2 es un modelo borrador (draft model) para decodificacion especulativa de tipo DFlash2, desarrollado por el usuario icharle. No es un modelo de lenguaje generalista: su funcion es acelerar la inferencia del modelo objetivo huihui-ai/Huihui-Qwen3.8-27B-abliterated, una version "abliterated" (con los rechazos de seguridad suprimidos) del Qwen3.8-27B. El borrador se ha obtenido por fine-tuning del drafter oficial z-lab/Qwen3.8-27B-DFlash2 sobre las propias salidas del modelo abliterated, mediante autodestilacion.

La relevancia de esta publicacion es metodologica mas que practica. El propio autor declara de forma explicita que este drafter no es mas rapido que el oficial: en decodificacion real iguala a z-lab/Qwen3.8-27B-DFlash2 dentro del ruido entre ejecuciones. El repositorio se publica como experimento reproducible, incluyendo datos, scripts y el resultado negativo. A pesar del nombre "27B", el modelo tiene 1.924.404.480 parametros reales (1,92 B) en BF16, con 81 tensores y 3,8 GB de pesos.

Tecnicamente emplea decodificacion especulativa con difusion por bloques (block diffusion), con un tamano de bloque de 8 y 64 anclas, integrable en SGLang con el algoritmo DFLASH. Los idiomas declarados son ingles y chino, y la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft model DFlash2 para decodificacion especulativa (block diffusion, block size 8, 64 anclas) |
| Parametros totales | 1.924.404.480 (1,92 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con seq length 3072) |
| Tipos de cuantizacion | BF16 (pesos publicados en BF16); no se documentan otras cuantizaciones |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (81 tensores) |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificacion especulativa DFlash2, con la misma arquitectura, nombres de tensores y `config.json` que el drafter oficial (81 tensores, 1,92 B parametros, BF16), por lo que es intercambiable con el en cualquier entorno donde funcione el original. La decodificacion especulativa DFlash2 combina difusion por bloques con un mecanismo de seleccion (selector) basado en codebooks; el objetivo de entrenamiento oficial de DFlash2 no esta publicado, y la receta empleada aqui es una reconstruccion basada en el block CE y el top-K selector CE de NVIDIA NeMo Automodel (`TrainDFlash2Recipe`, commit d433bc8).

El entrenamiento parte de un warm start con los 81 tensores oficiales, congelando los dos codebooks del selector (1.797 B parametros entrenables). Los datos proceden del dataset icharle/Huihui-Qwen3.8-27B-abliterated-selfdistill: aproximadamente 12k prompts (UltraChat, alpaca-gpt4-zh, COIG-CQIA, open-perfectblend, GSM8K train, Magicoder) respondidos por el propio modelo huihui BF16 con temperatura 1.0, top_p 0.95, top_k 20 y hasta 2560 tokens, conservando el razonamiento. Se usaron 11.659 conversaciones para entrenamiento y las ultimas 300 por id para validacion. La configuracion incluye estados ocultos online del objetivo (capas 5/19/33/47/61), block size 8, 64 anclas, seq length 3072, loss decay gamma 4.0 y selector loss weight 0.5. El optimizador fue flashoptim FlashAdamW con pesos maestros de 24 bits, lr 1e-4 (3% warmup, cosine hasta 1e-5), betas (0.9, 0.95), batch efectivo de 16 conversaciones y 1 epoca (729 pasos). El entrenamiento se ejecuto en una unica GPU de 96 GB con objetivo y drafter en el mismo proceso, en 2 h 05 min con un pico de 66 GiB.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre el modelo objetivo huihui-ai/Huihui-Qwen3.8-27B-abliterated; no es un modelo de generacion autonoma.
- Aceleracion de inferencia: eleva el rendimiento de 27 tok/s (sin decodificacion especulativa) a aproximadamente 140 tok/s en matematicas y codigo, y unos 80 tok/s en chat y chino, en flujo unico.
- Soporte de razonamiento: el entrenamiento conserva las trazas de razonamiento del objetivo, y el despliegue se documenta con `--reasoning-parser qwen3`.
- Idiomas: ingles y chino, con rendimiento de aceptacion inferior en chino y chat por ser texto menos predecible.
- Integracion con SGLang mediante el algoritmo DFLASH y `--speculative-num-draft-tokens 8`.
- No soporta tool calling, agentes ni vision por si mismo; esas capacidades residen en el modelo objetivo.

## Casos de uso

- Aceleracion de inferencia del modelo huihui abliterated en produccion: se despliega como drafter en SGLang junto al objetivo para reducir la latencia de generacion en flujo unico de 27 tok/s a 140 tok/s en dominios de matematicas y codigo.
- Servicio de chat de baja latencia: con aproximadamente 80 tok/s en conversacion, adecuado para asistentes interactivos donde el tiempo por token es critico.
- Generacion de codigo asistida: el dominio de codigo alcanza una longitud de aceptacion de 6,34-6,55 tokens por paso de verificacion, lo que lo hace util en entornos de autocompletado o generacion de parches.
- Razonamiento matematico interactivo: con aceptacion de 6,28-6,36 en matematicas, apropiado para pipelines de resolucion de problemas paso a paso con tiempos de respuesta ajustados.
- Investigacion en decodificacion especulativa: el repositorio incluye scripts de construccion de prompts, autodestilizacion, preparacion de datos, entrenamiento, validacion teacher-forced y benchmark, lo que permite reproducir y extender el experimento.
- Evaluacion de robustez de drafters ante variantes abliterated: sirve como caso de estudio para medir cuanto se desplaza la distribucion de salida tras la abliteracion y si un drafter reentrenado aporta ventaja.
- Despliegue en infraestructura con una sola GPU de 96 GB: el entrenamiento y la validacion se realizaron en una RTX PRO 6000 Blackwell, y la inferencia conjunta cabe en ese perfil.

## Benchmarks y rendimiento

Resultados de longitud de aceptacion (tokens por paso de verificacion del objetivo) con SGLang 0.5.23, objetivo huihui BF16 en una RTX PRO 6000 Blackwell (96 GB), `--speculative-num-draft-tokens 8`, decodificacion greedy, razonamiento activado y 1024 tokens nuevos:

| drafter | math c1 | code c1 | chat c1 | zh c1 | math c8 | code c8 | chat c8 | zh c8 |
|---|---|---|---|---|---|---|---|---|
| oficial z-lab | 6,36 | 6,40 | 3,78 | 3,67 | 6,36 | 6,54 | 3,17 | 3,28 |
| este repo (final, paso 729) | 6,28 | 6,34 | 3,74 | 3,60 | 6,36 | 6,55 | 3,05 | 3,21 |
| este repo (paso 400, no publicado) | 6,33 | 6,29 | 3,83 | 3,58 | 6,34 | 6,53 | 3,11 | 3,23 |

Validacion teacher-forced sobre 300 conversaciones autodestiladas reservadas (metricas de NeMo, mismo script para ambos):

| drafter | val loss | val accept_len | base accept_len | candidate recall |
|---|---|---|---|---|
| oficial z-lab | 2,815 | 3,880 | 3,780 | 0,804 |
| este repo | 2,456 | 3,940 | 3,797 | 0,819 |

Interpretacion del autor: el entrenamiento aprende la distribucion del modelo abliterated (perdida -13%), pero las elecciones top del drafter apenas cambian (accept_len +1,5%) y esa mejora no se refleja en decodificacion real. La menor aceptacion en chat y chino se atribuye a que ese texto es menos predecible, no a un desajuste del drafter.

## Requisitos de hardware

- VRAM estimada para inferencia: el drafter ocupa 3,8 GB en BF16; debe sumarse la memoria del modelo objetivo (Qwen3.8-27B abliterated en BF16), que domina el consumo.
- GPU recomendadas: el autor valido en una RTX PRO 6000 Blackwell de 96 GB con objetivo y drafter en el mismo proceso; para el objetivo de 27B en BF16 se requiere una GPU de clase A100/H100 de 80 GB o superior.
- Cabe en GPU de consumo: el drafter por si solo si (3,8 GB), pero el objetivo de 27B en BF16 no cabe en GPU de consumo de 24 GB sin cuantizacion del objetivo.
- Opciones de despliegue: SGLang con `--speculative-algorithm DFLASH` y `--speculative-draft-model-path`; el autor no documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 140 tok/s en matematicas y codigo y unos 80 tok/s en chat y chino en flujo unico, frente a 27 tok/s sin decodificacion especulativa.
- Entrenamiento: una GPU de 96 GB, 2 h 05 min, pico de 66 GiB.

## Comparativa con modelos similares

| Modelo | Parametros | Funcion | Contexto | Licencia | Rendimiento (accept_len math c1) |
|---|---|---|---|---|---|
| icharle/Huihui-Qwen3.8-27B-abliterated-DFlash2 | 1,92 B | Drafter DFlash2 para huihui abliterated | no disponible | Apache-2.0 | 6,28 |
| z-lab/Qwen3.8-27B-DFlash2 | 1,92 B | Drafter DFlash2 oficial | no disponible | Apache-2.0 | 6,36 |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B (nominal) | Modelo objetivo abliterated | no disponible | no disponible | no aplica (objetivo) |
| Qwen/Qwen3.8-27B | 27B (nominal) | Modelo base original | no disponible | no disponible | no aplica (objetivo) |

La comparativa relevante es contra el drafter oficial z-lab/Qwen3.8-27B-DFlash2, del que este modelo es un fine-tuning: misma arquitectura, mismos 81 tensores y mismos 1,92 B parametros, con rendimiento equivalente dentro del ruido y una perdida de validacion menor (2,456 frente a 2,815) que no se traduce en velocidad.

## Limitaciones y advertencias

- No es mas rapido que el drafter oficial: el autor recomienda usar z-lab/Qwen3.8-27B-DFlash2 si el objetivo es solo velocidad sobre huihui.
- Solo funciona como drafter de decodificacion especulativa; no es util como modelo de generacion independiente.
- El objetivo de entrenamiento oficial de DFlash2 no esta publicado; la receta usada es una reconstruccion con block CE y top-K selector CE de NeMo, lo que puede introducir divergencias respecto al comportamiento del drafter original.
- Rendimiento de aceptacion notablemente inferior en chat y chino (3,05-3,74) que en matematicas y codigo (6,28-6,55).
- Solo idiomas ingles y chino; no se declara soporte de otros idiomas.
- El modelo objetivo es una variante "abliterated" con los rechazos de seguridad suprimidos; el drafter hereda ese sesgo de distribucion y puede reproducir contenido que el modelo base rechazaria.
- Riesgo de alucinacion heredado del modelo objetivo; el drafter no lo mitiga.
- Compatibilidad limitada a SGLang con el algoritmo DFLASH segun la documentacion del autor; no se documentan otros motores de inferencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/icharle/Huihui-Qwen3.8-27B-abliterated-DFlash2
- Modelo base (drafter oficial): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Modelo objetivo: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Dataset de autodestilizacion: https://huggingface.co/datasets/icharle/Huihui-Qwen3.8-27B-abliterated-selfdistill
- Blog de DFlash2: https://inco.ai/blog/dflash2/
- Repositorio GitHub de DFlash: https://github.com/z-lab/dflash
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
