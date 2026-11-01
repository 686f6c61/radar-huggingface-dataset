# andyoneal/P6-E20B-A7B-D3

## Resumen

P6-E20B-A7B-D3 es un modelo experimental de generación de texto creado por el usuario andyoneal (andyoneal en HuggingFace) que expande el modelo denso NVIDIA-Nemotron-3.5-Bolt-E4B a una arquitectura de mezcla de expertos (MoE) con el bloque nativo de Gemma 4. No se trata de un modelo entrenado, sino de una base para investigación en fine-tuning: el autor lo describe explícitamente como "untrained expansion". El modelo combina el cuerpo de Bolt (E4B) con cinco expertos por capa, cada uno de ellos un FFN completo de 10.240 dimensiones, con enrutamiento top-1.

El modelo tiene 23.979.053.308 parámetros totales (unos 20,5B efectivos, 23,98B contando las embeddings por capa) y aproximadamente 7,3B parámetros activos por token. Se distribuye en bf16 con un tamaño de repositorio de 48 GB y utiliza una configuración estándar `Gemma4ForCausalLM` que carga en transformers y mlx-lm. Su propósito declarado es servir como base para experimentación con LoRA y para estudiar el comportamiento de routers MoE construidos sin entrenamiento.

La relevancia de este modelo es fundamentalmente metodológica: demuestra una técnica de construcción de MoE mediante mergekit-moe donde el router se inicializa a partir de estados ocultos sin entrenamiento, y documenta con detalle los problemas que ello conlleva (el router envía solo el 29% del texto general al experto de Bolt). No es un modelo para producción, sino una pieza de investigación sobre arquitecturas MoE y su entrenamiento posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Gemma 4) con FFN denso + 5 expertos enrutados por capa, top-1 |
| Parametros totales | 23.979.053.308 (23,98B) |
| Parametros activos | Aproximadamente 7,3B por token |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16; se menciona QLoRA con `quantize_moe_experts` para fine-tuning) |
| Idiomas soportados | No disponible |
| Licencia | Mixta (`mixed-source-terms`): OpenMDW-1.1 (Bolt), Apache 2.0 (gemma-4-E4B-it, Gemma4NPC), Gemma license (Bella, TIES-3mask); el adaptador Musica no declara licencia en su card |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16` (commit `49843eed`) conservando su FFN denso en cada capa. Sobre esa base se añade el bloque MoE nativo de Gemma 4 en todas las capas: cinco expertos, cada uno un FFN completo de anchura 10.240, con enrutamiento top-1. Cada experto se construye al estilo mergekit-moe como el FFN de Bolt más el cambio de FFN de un donante (donante menos `gemma-4-E4B-it`, expresado como factores de bajo rango). El experto 0 es el propio FFN de Bolt. Los donantes son cuatro fine-tunes de role-play de `gemma-4-E4B-it`: `AuriAetherwiing/G4-E4B-Musica-v1-lora` (`b87c464f`), `chimbiwide/Gemma4NPC-E4B` (`cbd40b61`), `juiceb0xc0de/bella-bartender-gemma-e4b` (`46c7071a`) y `ToastyPigeon/Gemma4-E4B-TIES-3mask-r64` (`34fda2cb`).

La innovación técnica principal es la inicialización del router sin entrenamiento, siguiendo el mecanismo `hidden` de mergekit-moe: la fila de cada experto apunta a los estados ocultos de Bolt sobre el tipo de texto del donante correspondiente, y el experto 0 recibe texto general y matemáticas. No hay entrenamiento ni RLHF/DPO. El cuerpo E4B incorpora embeddings por capa (`embed_tokens_per_layer`, 2,8B parámetros) y compartición de K/V: solo las capas 0–23 tienen `k_proj` y `v_proj`, mientras que las capas 24–41 reutilizan las K/V de capas anteriores. La plantilla de chat es la de Gemma 4, aunque la variante de Bolt ordena los mensajes de tool-call de forma distinta.

## Capacidades

- Generación de texto conversacional y role-play, con plantilla de chat de Gemma 4.
- Razonamiento general y matemáticas: el experto 0 (FFN de Bolt) se reserva para texto general y matemático.
- Role-play especializado mediante cuatro expertos derivados de fine-tunes de personajes y NPC.
- Soporte de tool calling a través de la plantilla de chat; la variante de Bolt ordena los mensajes de tool-call de manera distinta, lo que según el autor "puede adaptarse mejor al uso agéntico".
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Sin visión ni audio: el modelo es explícitamente text-only (`Gemma4ForCausalLM`).
- Sin modo thinking declarado.

## Casos de uso

- Investigación sobre routers MoE: el modelo permite estudiar cómo un router inicializado por estados ocultos distribuye el tráfico entre expertos y comparar con un router ajustado posteriormente, dado que el autor documenta que solo el 29% del texto general va al experto de Bolt.
- Fine-tuning de LoRA para role-play: sirve como base para adaptar el comportamiento conversacional con Axolotl, aprovechando que los expertos donantes ya contienen cambios de estilo de personaje y que el FFN denso de Bolt es visto por todos los tokens.
- Experimentos de merge de modelos: al estar construido con mergekit-moe, es un caso de estudio para validar técnicas de fusión de FFN mediante factores de bajo rango y para comparar con merges densos convencionales.
- Evaluación de la transferencia de conocimiento en MoE: permite medir si los cambios de FFN de un donante sobreviven al ser enrutados de forma top-1 y qué fracción del texto de cada donante activa su experto correspondiente (el experto de Musica gana solo el 14% del texto de Musica).
- Desarrollo de recetas de entrenamiento para arquitecturas con KV sharing: el modelo documenta los ajustes necesarios en Axolotl (regex de módulos, desactivación de kernels LoRA fusionados, congelación de embeddings) y sirve para probar dichas recetas antes de aplicarlas a modelos mayores como Gemma 4 26B-A4B.
- Prototipado de asistentes conversacionales con tool calling: la plantilla de chat y el soporte de tool-call permiten probar pipelines agénticos en un entorno de investigación, aunque sin garantías de calidad por falta de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor aporta una única métrica propia: antes de cualquier entrenamiento, el modelo predice role-play humano retenido 0,26 nats por token mejor que Bolt, cada uno evaluado a su mejor temperatura. También indica que un juez LLM ciego no detectó daño frente al role-play de Bolt.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 48 GB solo para pesos, más overhead de activaciones y caché KV; se requiere al menos una GPU de 80 GB para margen cómodo.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU. No cabe en GPUs de consumo de 24 GB en bf16.
- Cuantización: no se han publicado pesos GGUF ni cuantizaciones listas; la conversión a llama.cpp está sin probar según el autor. Una cuantización a 4 bits reduciría los pesos a unos 12-13 GB, lo que podría caber en una RTX 4090, pero requeriría conversión manual no validada.
- Despliegue: transformers y mlx-lm están confirmados como compatibles con la configuración `Gemma4ForCausalLM`. No se menciona soporte de vLLM, TGI, Ollama ni llama.cpp.
- Fine-tuning: QLoRA con `quantize_moe_experts` debería necesitar VRAM similar a Gemma 4 26B-A4B (24,0B frente a 25,2B), con la tabla de embeddings por capa en bf16 ocupando unos 5,6 GB. Al tener 7,3B parámetros activos frente a los 3,8B de 26B-A4B, se espera aproximadamente el doble de cómputo por paso.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| P6-E20B-A7B-D3 | 23,98B | ~7,3B | No disponible | Mixta (OpenMDW-1.1, Apache 2.0, Gemma) | Experimental, sin entrenar |
| NVIDIA-Nemotron-3.5-Bolt-E4B | No disponible en la información | Denso (E4B) | No disponible | OpenMDW-1.1 | Modelo base de referencia |
| Gemma 4 26B-A4B | 25,2B | 3,8B | No disponible | Gemma license | Modelo entrenado de producción |
| gemma-4-E4B-it | No disponible en la información | Denso (E4B) | No disponible | Apache 2.0 | Modelo instruct entrenado |

La comparación más directa es con Gemma 4 26B-A4B, que comparte el bloque MoE (FFN denso junto a expertos enrutados en cada capa) pero con 128 expertos de anchura 704 y top-8, frente a los 5 expertos de anchura 10.240 y top-1 de P6. P6 tiene más parámetros activos y, por tanto, mayor coste por token. Frente a Bolt y gemma-4-E4B-it, P6 añade los expertos de role-play pero carece de entrenamiento, por lo que no es comparable en calidad de producción.

## Limitaciones y advertencias

- Modelo sin entrenar: es una base experimental para investigación, no un modelo listo para producción. El autor lo declara explícitamente como "untrained expansion".
- Router mal calibrado: solo el 29% del texto general se enruta al experto de Bolt, y el experto de Musica gana únicamente el 14% del texto de Musica. El autor planea un router ajustado en una revisión futura.
- Riesgo de alucinación: no evaluado; al no haber entrenamiento, el comportamiento generativo depende enteramente de los componentes fusionados y del enrutamiento.
- Sesgos: no documentados, pero heredados de los donantes de role-play y de Bolt; no hay evaluación de sesgos.
- Idiomas: no se declaran idiomas soportados; el comportamiento multilingüe es desconocido.
- Licencia compleja: los términos de todas las fuentes aplican simultáneamente (OpenMDW-1.1, Apache 2.0, Gemma license), y el adaptador Musica no declara licencia en su card. El uso comercial requiere revisión legal caso por caso.
- Fine-tuning no validado: nadie ha entrenado P6 en Axolotl todavía; las notas de fine-tuning se basan en lectura de código, no en ejecución.
- Conversión a llama.cpp sin probar; no hay pesos GGUF ni cuantizaciones oficiales.
- Los kernels LoRA fusionados de Axolotl no son compatibles con las capas de KV sharing; deben desactivarse.
- El router no debe entrenarse con top-1: los parámetros `router.proj`, `router.scale` y `router.per_expert_scale` no reciben gradiente útil.
- El merge debe hacerse con `axolotl merge-lora` o PEFT, no con mergekit, que no modela embeddings por capa ni KV sharing.

## Enlaces

- HuggingFace: https://huggingface.co/andyoneal/P6-E20B-A7B-D3
- Modelo base Bolt: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Donante Musica: https://huggingface.co/AuriAetherwiing/G4-E4B-Musica-v1-lora
- Donante Gemma4NPC: https://huggingface.co/chimbiwide/Gemma4NPC-E4B
- Donante Bella: https://huggingface.co/juiceb0xc0de/bella-bartender-gemma-e4b
- Donante TIES-3mask: https://huggingface.co/ToastyPigeon/Gemma4-E4B-TIES-3mask-r64
- Configuración de ejemplo para Axolotl: https://huggingface.co/andyoneal/P6-E20B-A7B-D3/blob/main/axolotl-lora.yaml
