# joshycodes/qwen3-4b-sorrel-selfloop-g9-midtrain

## Resumen

qwen3-4b-sorrel-selfloop-g9-midtrain es un artefacto de investigación derivado de Qwen3-4B mediante una fase adicional de preentrenamiento continuado (midtrain) sobre el corpus `joshycodes/sorrel-selfloop-corpus`. Lo publica el usuario `joshycodes` en Hugging Face dentro de un proyecto de Anthropic Fellows sobre entrenamiento de carácter enmarcado en la idea de *flourishing* (propuesta de Wang y Jermyn, 22 de abril de 2026). No es un modelo nuevo desde cero: es el noveno ciclo (g9) de un bucle iterativo que arranca de `joshycodes/qwen3-4b-sorrel-selfloop-g8-midtrain`, que a su vez es el resultado del octavo ciclo.

El checkpoint tiene 4.022.468.096 parámetros (≈4,02 B) en formato safetensors y hereda la arquitectura transformer decoder-only de la familia Qwen3. La fase documentada se entrenó con longitud de secuencia de 4096 tokens, learning rate 1e-5, batch en micro de 4 con acumulación de gradiente 2 (32.768 tokens por paso efectivo) y una única época sobre 2.940.928 tokens. La pérdida bajó de 0,8936 a 0,8634. El entrenamiento se ejecutó sobre 2 GPU NVIDIA H200 en RunPod.

Su relevancia es deliberadamente acotada: se trata de un punto intermedio de una cadena de autoentrenamiento iterado, con licencia `internal-research`, sin benchmarks publicados, sin plantilla de chat documentada y con redistribución explícitamente prohibida. Interesa a quien investigue preentrenamiento continuado orientado a carácter o bucles de datos autoalimentados, no a quien busque un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (heredada del modelo base). Número de capas, cabezas de atención, tipo de atención y si usa GQA: no disponible en la información proporcionada |
| Parametros totales | 4.022.468.096 (≈4,02 B) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | Secuencia de entrenamiento de 4096 tokens. Ventana de contexto soportada en inferencia: no disponible |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene safetensors; no se documentan versiones GGUF, AWQ, GPTQ ni cuantización con bitsandbytes |
| Idiomas soportados | No disponible |
| Licencia | `internal-research` (etiqueta `license: other`, `license_name: internal-research`). Artefacto privado de investigación, redistribución prohibida |
| Formato de pesos | safetensors |
| Tamano del repositorio | 32,2 GB |
| Modelo base | `joshycodes/qwen3-4b-sorrel-selfloop-g8-midtrain` (revisión `77f9c0d0079a`) |
| Dataset de entrenamiento | `joshycodes/sorrel-selfloop-corpus`, configuración `sorrel-selfloop-b-g8`, revisión `395ed57c2495` |
| Hardware de entrenamiento | 2x NVIDIA H200 (RunPod, *fellows worker*) |
| Fecha de creacion / actualizacion | 16 de septiembre de 2026 (creación y última actualización) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only que conserva la topología del Qwen3-4B original; la información disponible no detalla el número de capas, la dimensión oculta ni la configuración de atención, por lo que cualquier afirmación al respecto debería verificarse en el `config.json` del repositorio. La innovación de esta ficha no está en la arquitectura, sino en el procedimiento: se trata de un *midtrain*, es decir, una fase de preentrenamiento continuado intermedia dentro de una cadena iterativa (`g8` → `g9`) en la que cada generación parte del checkpoint de la anterior. El pipeline se lanza desde el repositorio `flourishing-training` (commit del launcher `a0afb77669ae`) y se ejecuta con la ayuda de `uv run eval.py`.

Los hiperparámetros documentados son: learning rate 1e-5, `seq_len` 4096, `micro_batch` 4, `grad_accum` 2 y 1,0 épocas. Con esos valores, el batch efectivo es de 32.768 tokens por paso de optimización, lo que sobre los 2.940.928 tokens consumidos implica del orden de 89-90 pasos totales (cálculo derivado, no declarado en la model card). La semilla fijada es 20260821 y el identificador de ejecución es `qwen3-4b-sorrel-selfloop-g8-midtrain-sorrel-selfloop-b-g8-m-0916-1146`. La pérdida pasó de 0,8936 a 0,8634, una mejora de 0,0302 puntos absolutos. No se documenta ningún uso de RLHF, DPO, SFT ni ajuste por instrucciones en esta fase.

## Capacidades

- Generación de texto autoregresiva: capacidades heredadas del modelo base Qwen3-4B, no verificadas ni documentadas en esta ficha.
- Razonamiento, matemáticas y generación de código: presumiblemente heredadas del modelo base. No se publican evaluaciones que lo confirmen en este checkpoint.
- Tool calling / function calling: no disponible. No se documenta plantilla de chat ni formato de llamada a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible. No se documenta ningún modo de agente ni bucle de razonamiento extendido.
- Capacidades multilingües: no disponible. No se especifica la composición lingüística del corpus `sorrel-selfloop-corpus`.
- Modo *thinking* explícito, visión o audio: no disponible; nada en la información proporcionada indica soporte multimodal ni modo de pensamiento separado.
- Comportamiento específico del bucle: lo único documentado es la reducción de pérdida sobre el corpus propio, que es una medida de ajuste al corpus, no una capacidad funcional evaluada.
- Evaluación: la model card menciona un script `eval.py --eval all`, pero no publica sus resultados.

## Casos de uso

- Investigación sobre preentrenamiento continuado iterado: el modelo sirve como eslabón documentado de una cadena `g8` → `g9`, con semilla, commit del launcher, revisión del dataset e hiperparámetros completos. Es útil para replicar o auditar el efecto de cada ciclo sobre el checkpoint anterior.
- Estudio de deriva de comportamiento entre generaciones: comparar `g8` y `g9` sobre el mismo conjunto de prompts permite medir cuánto cambia el modelo con apenas 2,94 M tokens adicionales, algo relevante para quienes investigan bucles de autoentrenamiento y olvido catastrófico.
- Ablación de hiperparámetros de midtrain: al estar documentados `lr` 1e-5, `seq_len` 4096 y 1 época, sirve como punto de referencia frente a variantes con otros valores de learning rate o más épocas dentro del mismo pipeline.
- Generación de datos sintéticos para el propio corpus del bucle: un modelo entrenado sobre `sorrel-selfloop-corpus` puede usarse para producir continuaciones que se filtren y reincorporen al corpus, siempre dentro del entorno interno de investigación que permite la licencia.
- Fine-tuning posterior interno: dado su tamaño de 4 B, es un punto de partida manejable para SFT o DPO internos si el objetivo es convertir un artefacto de midtrain en un modelo alineado con instrucciones.
- Prototipado en GPU de consumo dentro del laboratorio: con pesos en bf16 ocupa del orden de 8 GB, por lo que cabe en tarjetas de 12-16 GB para pruebas de inferencia sin salir del entorno autorizado por la licencia.
- Reproducibilidad y auditoría de experimentos: la combinación de semilla fija (20260821), commit del launcher y revisión del dataset permite reproducir la ejecución y verificar la curva de pérdida publicada.
- Análisis de eficiencia de entrenamiento: los 2.940.928 tokens sobre 2x H200 con batch efectivo de 32.768 tokens ofrecen un caso concreto para medir coste por token en fases de midtrain cortas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida de entrenamiento sobre el corpus propio (0,8936 → 0,8634) y referencia un script de evaluación (`uv run eval.py --model joshycodes/qwen3-4b-sorrel-selfloop-g9-midtrain --eval all`) sin adjuntar sus salidas. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandarizada, ni comparaciones con el checkpoint `g8` del que deriva.

| Metrica | Valor |
|---|---|
| Perdida final de midtrain | 0,8634 (partida de 0,8936) |
| Delta de perdida | -0,0302 |
| Tokens vistos | 2.940.928 |
| MMLU / HumanEval / GSM8K / otros | No disponible |

## Requisitos de hardware

- VRAM estimada en bf16/fp16: ≈8,0 GB solo de pesos (4,02 B × 2 bytes), más caché KV; en la práctica, entre 10 y 12 GB según longitud de contexto y tamaño de batch.
- VRAM estimada en fp32: ≈16,1 GB solo de pesos.
- VRAM estimada cuantizado a 8 bits: ≈4,3 GB. A 4 bits: ≈2,2-2,5 GB. Estas cifras son estimaciones aritméticas, ya que no se publican cuantizaciones del modelo.
- GPU recomendadas para entrenamiento o fine-tuning: NVIDIA H200 (las usadas en el run documentado), H100 o A100 80 GB.
- GPU recomendadas para inferencia: A100, H100, L40S, A10G o L4 en servidor.
- Cabe en GPU de consumo: sí. En bf16 requiere al menos 12 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090); con cuantización de 4-8 bits cabría en tarjetas de 6-8 GB (RTX 3060 Ti, RTX 4060), siempre que se genere previamente la cuantización.
- Opciones de despliegue: `transformers` y vLLM o TGI directamente sobre los safetensors. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión que no se incluye en el repositorio.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Advertencia de tamaño: el repositorio ocupa 32,2 GB, muy por encima de los ≈8 GB esperables para pesos en bf16 de un modelo de 4 B. Esto sugiere pesos en fp32, checkpoints adicionales o artefactos del optimizador; la model card no lo aclara.

## Comparativa con modelos similares

Los valores de referencia de los modelos comparados proceden de la documentación pública de sus respectivas familias y conviene verificarlos antes de citarlos. Para este checkpoint concreto no hay datos de contexto, licencia comercial ni rendimiento más allá de lo indicado.

| Modelo | Parametros | Contexto | Licencia | Uso comercial |
|---|---|---|---|---|
| qwen3-4b-sorrel-selfloop-g9-midtrain | 4,02 B | No disponible (entrenado a 4096) | internal-research | No permitido según la información disponible |
| Qwen3-4B (modelo base de la familia) | 4,02 B | 32.768 tokens, ampliable con YaRN | Apache-2.0 | Sí |
| Qwen3-4B-Instruct-2507 | 4,02 B | 262.144 tokens | Apache-2.0 | Sí |
| Llama-3.2-3B-Instruct | 3,21 B | 131.072 tokens | Llama 3.2 Community License | Sí, con condiciones |
| Gemma-3-4B-IT | ≈4 B | 128.000 tokens | Gemma Terms of Use | Sí, con condiciones |

La diferencia relevante no es de parámetros, sino de propósito: los tres modelos de la comparativa son checkpoints alineados para instrucciones con licencias permisivas, mientras que este es un artefacto intermedio de investigación, cerrado y sin evaluación publicada.

## Limitaciones y advertencias

- Licencia restrictiva: `internal-research`. La model card indica de forma explícita "Private research artifact — do not redistribute". No está autorizada la redistribución ni, según la información disponible, el uso comercial.
- Sin benchmarks: no hay ningún resultado estandarizado que permita situar el modelo frente a Qwen3-4B o frente al checkpoint `g8`. La única métrica publicada es la pérdida sobre el corpus de entrenamiento, que mide ajuste y no calidad.
- Entrenamiento muy corto: 2,94 M tokens en una sola época, unas 90 actualizaciones de parámetros. El efecto sobre el comportamiento del modelo es probablemente pequeño y, en cualquier caso, no medido.
- Riesgo de olvido catastrófico: al ser el noveno ciclo de un bucle iterativo que parte de un checkpoint ya modificado (`g8`), puede haber degradado capacidades del Qwen3-4B original sin que exista una evaluación que lo cuantifique.
- Ausencia de ajuste por instrucciones: no se documenta SFT, RLHF ni DPO. Si la cadena arranca del Qwen3-4B base y no de una variante Instruct, el modelo podría no seguir instrucciones con fiabilidad; esto es una inferencia a partir del nombre del modelo base y debe verificarse.
- Sin plantilla de chat documentada: no se especifica formato de conversación, tokens especiales ni soporte de *function calling*, lo que complica su integración en aplicaciones conversacionales.
- Idiomas: no disponible. Se desconoce la composición lingüística de `sorrel-selfloop-corpus` y, por tanto, el impacto sobre el multilingüismo heredado.
- Alucinación: no se han publicado evaluaciones de fiabilidad; en un modelo de 4 B sin alineación documentada, el riesgo de afirmaciones incorrectas es alto.
- Sesgos: no evaluados en la información proporcionada. El corpus de entrenamiento es propietario y no se describe su procedencia ni su filtrado.
- Idiomas y contexto: la ventana de contexto en inferencia no está declarada; el único dato fiable es la longitud de secuencia de entrenamiento (4096 tokens).
- Reproducibilidad parcial: se documentan semilla, commit del launcher y revisión del dataset, pero el repositorio `flourishing-training` y la configuración completa del run (`train_run_config.json`) no se detallan en la información proporcionada.
- Trazabilidad comunitaria nula: 0 descargas y 0 likes. Ninguna validación externa del artefacto.
- Búsqueda web sin resultados útiles: las consultas realizadas devolvieron únicamente resultados sin relación con el modelo (temática de vehículos autónomos de Tesla), por lo que no se ha podido contrastar información adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joshycodes/qwen3-4b-sorrel-selfloop-g9-midtrain
- Modelo base (ciclo anterior, g8): https://huggingface.co/joshycodes/qwen3-4b-sorrel-selfloop-g8-midtrain
- Dataset de entrenamiento: https://huggingface.co/datasets/joshycodes/sorrel-selfloop-corpus
- Perfil del autor: https://huggingface.co/joshycodes
- Paper, blog, repositorio de código o demo: no disponible. La model card menciona el repositorio `flourishing-training` (commit del launcher `a0afb77669ae`) y el script `eval.py`, pero no se proporciona URL pública.
- Resultados de la búsqueda web: ninguno relevante. Todas las entradas devueltas tratan sobre vehículos autónomos y robótica de Tesla y no guardan relación con este modelo.
