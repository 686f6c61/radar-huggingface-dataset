# caspar/MiniMind-MoE-198M-A64M-Pretrain-v1.0

## Resumen

MiniMind-MoE-198M-A64M-Pretrain-v1.0 es un checkpoint de preentrenamiento de un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por el usuario caspar, derivado del proyecto MiniMind de jingyaogong. Con 198.416.640 parámetros totales y aproximadamente 64M activos por token (enrutamiento top-1 sobre 4 expertos), el modelo se posiciona como una pieza experimental de bajo coste computacional orientada a la investigacion de arquitecturas MoE a pequeña escala.

El modelo fue entrenado desde inicializacion aleatoria durante 2 epocas sobre el subconjunto `sample/10BT` de FineWeb-Edu, filtrado a documentos con puntuacion >= 3.5, y constituye el checkpoint base exacto utilizado para entrenar posteriormente la variante con SFT (caspar/MiniMind-MoE-198M-A64M-Mixed-SFT-v1.0). No es un modelo conversacional: se trata de un modelo de continuacion de texto previo a cualquier etapa de alineacion.

Su relevancia actual es fundamentalmente didactica y de investigacion: ofrece un caso reproducible de entrenamiento MoE completo (codigo, tokenizer, pesos en FP16 y safetensors, resumenes de entrenamiento y hashes de verificacion) con un coste de hardware accesible (una sola RTX 5090), lo que permite estudiar el comportamiento de enrutamiento de expertos, la dinamica de perplejidad y el empaquetado de modelos con codigo personalizado en el ecosistema Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), 4 expertos, enrutamiento top-1, embeddings de entrada/salida atados |
| Parametros totales | 198.416.640 |
| Parametros activos | ~64M (top-1 sobre 4 expertos) |
| Longitud de contexto | 340 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 y safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (el modelo y el codigo; la licencia del dataset FineWeb-Edu sigue aplicando por separado) |
| Formato de pesos | `model.safetensors` (Transformers), `pretrain_768_moe.pth` (state dict PyTorch FP16 original), `model_minimind.py` (codigo de modelo personalizado) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con hidden size 768, 8 capas, vocabulario de 6400 tokens y embeddings de entrada/salida atados. El componente MoE consta de 4 expertos con enrutamiento top-1, lo que resulta en aproximadamente 64M parametros activos por token frente a los 198M totales. El codigo de arquitectura deriva del repositorio jingyaogong/minimind bajo licencia Apache-2.0, y esta release incluye la implementacion original del modelo en tiempo de entrenamiento junto con el tokenizer, lo que requiere `trust_remote_code=True` para su carga via Transformers.

El entrenamiento se realizo desde inicializacion aleatoria sobre FineWeb-Edu `sample/10BT` (revision `87f09149ef4734204d70ed1d046ddc9ca3f2b8f9`), filtrado a documentos con score >= 3.5 (1.288.228 documentos antes del split). Cada documento se tokeniza como BOS + texto + EOS, se usan ventanas completas de 340 tokens con stride 339, se descarta la ultima ventana corta de cada documento y no se empaqueta entre documentos. El split train/validacion se hace por hash del texto completo del documento, con 4.407.066 ventanas por epoca. Se uso BF16 AdamW sobre una RTX 5090, batch 64 x acumulacion 4, 2 epocas, 34.432 actualizaciones del optimizador y learning rate pico de 3e-4. La perplejidad de validacion registrada paso de 7491,43 antes del entrenamiento a 13,17 despues, sobre 1.024 ventanas fijas de held-out (347.136 objetivos de siguiente token); estas metricas son historicas del run de entrenamiento y no fueron re-ejecutadas en la publicacion.

## Capacidades

- Generacion de texto por continuacion (text continuation) en ingles, sin instrucciones ni formato conversacional.
- Modelado de lenguaje autorregresivo con ventana efectiva de 340 tokens.
- Enrutamiento MoE top-1 con 4 expertos, util para estudiar especializacion de expertos.
- No dispone de soporte validado de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso validadas.
- Multilingue: no; solo ingles segun la model card.
- No incluye modo thinking, vision ni audio.
- El tokenizer incluye una plantilla de chat heredada de los assets del tokenizer, pero su presencia no implica entrenamiento conversacional.

## Casos de uso

- Investigacion de arquitecturas MoE a pequeña escala: el modelo permite reproducir y analizar el comportamiento de enrutamiento top-1 sobre 4 expertos con un coste de entrenamiento e inferencia muy bajo, comparando la perplejidad y la distribucion de activaciones por experto.
- Experimentos de continuacion de texto controlada: dado su entrenamiento sobre FineWeb-Edu, es adecuado para probar la generacion de texto expositivo en ingles con prompts cortos y decodificacion greedy, siempre dentro de los 340 tokens de contexto.
- Base para fine-tuning con SFT: es el checkpoint exacto del que parte la variante Mixed-SFT-v1.0, por lo que sirve como punto de partida reproducible para experimentos de alineacion y comparacion de etapas.
- Docencia y formacion en LLMs: permite mostrar de forma completa el ciclo de vida de un modelo (tokenizacion por documento, ventanas con stride, entrenamiento BF16, empaquetado en safetensors y verificacion por hash) en un entorno de una sola GPU.
- Validacion de pipelines de despliegue: util para probar la carga con `trust_remote_code`, la integracion con Transformers y la verificacion de hashes y artefactos de release antes de escalar a modelos mayores.
- Estudio de tokenizers de vocabulario reducido: con 6400 tokens, sirve para analizar el impacto de vocabularios pequeños en la calidad de la continuacion y en la longitud efectiva de contexto.
- Pruebas de empaquetado y reproducibilidad: los ficheros `release.json`, resumenes de evaluacion y entrenamiento permiten auditar la correspondencia entre pesos originales y safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento registrado es la perplejidad de validacion:

| Metrica | Antes del entrenamiento | Despues del entrenamiento |
|---|---|---|
| Perplejidad de validacion (1.024 ventanas held-out, 347.136 objetivos) | 7491,43 | 13,17 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16 para los 198M parametros (el repo completo ocupa 0,8 GB); en FP32, alrededor de 0,8 GB solo para pesos, con overhead adicional de activaciones y cache.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el entrenamiento se realizo en una RTX 5090, y para inferencia basta con una RTX 3060 o superior.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (metodo documentado); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y la presencia de codigo personalizado puede limitar su compatibilidad con esos runners.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMind-MoE-198M-A64M-Pretrain-v1.0 | 198M totales / ~64M activos | 340 tokens | Apache-2.0 | Hugging Face, codigo personalizado |
| caspar/MiniMind-MoE-198M-A64M-Mixed-SFT-v1.0 | 198M totales / ~64M activos | no disponible | no disponible en la informacion proporcionada | Hugging Face |
| jingyaogong/minimind (proyecto base) | no disponible | no disponible | Apache-2.0 | GitHub |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de continuacion de texto previo a SFT: no sigue instrucciones, no mantiene conversaciones y no tiene precision de razonamiento validada.
- Contexto limitado a 340 tokens; contextos mas largos no estan validados.
- Solo ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Riesgo elevado de alucinacion y de continuaciones incoherentes fuera de la distribucion de FineWeb-Edu.
- La plantilla de chat presente en el tokenizer no implica capacidad conversacional.
- Requiere `trust_remote_code=True` y revision del fichero `model_minimind.py` antes de habilitar codigo personalizado; se recomienda instalar `requirements.txt`.
- La licencia Apache-2.0 cubre el modelo y el codigo, pero no relicencia el dataset FineWeb-Edu, cuyos terminos siguen aplicando.
- Las metricas de perplejidad son historicas del run de entrenamiento y no fueron re-ejecutadas en la publicacion.
- No se incluyen datos de entrenamiento, estados del optimizador, credenciales ni logs de W&B.
- Sin descargas ni likes en Hugging Face en el momento de la consulta, lo que implica ausencia de validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/caspar/MiniMind-MoE-198M-A64M-Pretrain-v1.0
- Variante SFT: https://huggingface.co/caspar/MiniMind-MoE-198M-A64M-Mixed-SFT-v1.0
- Repositorio base MiniMind: https://github.com/jingyaogong/minimind
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
