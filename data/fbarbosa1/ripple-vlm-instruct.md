# fbarbosa1/ripple-vlm-instruct

## Resumen

Ripple-VLM-Instruct es un adaptador vision-language publicado por el usuario fbarbosa1 que dota de capacidades visuales a un modelo de lenguaje de gran tamano, Ripple-65B-Preview (ricursiveAI), mediante un proyector SigLIP y LoRA. El repositorio no contiene los pesos base: solo incluye el adaptador (`adapter.safetensors`, ~282M parametros entrenables en fp32), la configuracion `VLAConfig` y los resultados de evaluacion. La base visual es `google/siglip-so400m-patch14-224`, que convierte cada imagen en 64 tokens (pool=2 sobre parches de 224x224).

El modelo resuelve el problema de anadir comprension de imagenes a un LLM que originalmente es solo texto, siguiendo el esquema clasico de dos etapas: alineacion del proyector y ajuste por instrucciones visuales con LoRA de rango 16 aplicado a las 7 capas lineales de las 80 capas de Ripple. Es relevante como ejemplo reproducible de adaptacion VLM sobre un LLM de 65B, con codigo, scripts de entrenamiento y harness de evaluacion publicos, aunque sus resultados son preliminares y el entrenamiento se detuvo antes de completar la segunda etapa.

La publicacion es reciente (noviembre de 2026) y de nicho: cero descargas y cero likes en el momento de la consulta. El checkpoint liberado corresponde al paso 750 de una etapa 2 que se detuvo en torno al paso 910 de 1500, por lo que debe considerarse un artefacto de investigacion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM por adaptador: SigLIP-so400m (vision encoder) + proyector + LoRA sobre LLM Ripple-65B-Preview |
| Parametros totales | Adaptador: ~282M (49.8M proyector + 232M LoRA); el LLM base no se incluye en el repo |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en fp32) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 (adaptador); datos de entrenamiento con posibles restricciones |
| Formato de pesos | safetensors (`adapter.safetensors`) + `config.json` |

## Arquitectura y entrenamiento

El adaptador sigue una arquitectura de proyector + LoRA. SigLIP-so400m-patch14-224 procesa la imagen y, con pool=2, genera 64 tokens visuales por imagen que se proyectan al espacio de tokens de Ripple mediante un proyector de 49.8M parametros. Sobre el LLM se aplica un LoRA de rango 16 en las 7 capas lineales de las 80 capas de Ripple (232M parametros). El codigo define tambien un experto de acciones basado en flow-matching, pero no fue entrenado ni se incluye en esta release.

El entrenamiento tuvo dos etapas sobre 8xH200 con FSDP2. La etapa 1 (alineacion) entreno solo el proyector durante 3000 pasos con batch global 32 sobre 100K pares imagen-caption de LLaVA-Pretrain (BLIP-558K), con Ripple y SigLIP congelados. La etapa 2 (instruccion visual) entreno proyector y LoRA sobre 50K conversaciones de LLaVA-Instruct-150K (subconjunto aleatorio), con learning rates de 5e-5 (proyector) y 1e-4 (LoRA), batch global 32. La ejecucion se detuvo antes de tiempo en torno al paso 910 de 1500 y se publica el checkpoint del paso 750. Las imagenes se redimensionan a 224x224.

## Capacidades

- Descripcion de imagenes y respuesta a preguntas visuales de tipo si/no (POPE) y eleccion multiple (formas sinteticas).
- Generacion de captions sobre imagenes COCO, evaluada por log-verosimilitud por token.
- Comprension visual basica de objetos y escenas a partir de 64 tokens por imagen.
- Integracion con el formato de chat definido en `data.Collator` del repositorio de codigo.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta capacidad de agente, audio ni modo de pensamiento (thinking).
- Capacidades multilingues: no disponibles.
- El experto de acciones (flow-matching) no esta entrenado en esta release.

## Casos de uso

- Prototipado de investigacion en VLMs: usar el adaptador como punto de partida reproducible para estudiar proyector + LoRA sobre un LLM de 65B, con scripts y harness de evaluacion publicos.
- Clasificacion visual binaria (si/no) sobre imagenes: el modelo alcanza 74.5% en POPE, adecuado para experimentos de deteccion de objetos presentes o ausentes, no para decisiones criticas.
- Generacion de captions descriptivas: util para generar descripciones de imagenes COCO en tareas de anotacion asistida, con la cautela de que inventa detalle en descripciones largas.
- Evaluacion comparativa de estrategias de adaptacion: permite contrastar etapa 1 (solo proyector) frente a etapa 2 (proyector + LoRA) con los resultados crudos incluidos en `results/`.
- Base para fine-tuning posterior: al ser un adaptador Apache-2.0 sobre un LLM de 65B, sirve como inicializacion para tareas visuales especificas antes de un ajuste adicional.
- Docencia y demostraciones de VLM a gran escala: el flujo de carga (`build_vla_inference`) y generacion (`model.generate`) documentado facilita reproducir el pipeline en laboratorio con 2xH100 80GB.

## Benchmarks y rendimiento

Resultados publicados por el autor (200 items por tarea, ejecucion unica, ruido aproximado de +-3 puntos en exactitud):

| Tarea | Etapa 1 (solo proyector) | Adaptador (paso 750) |
|---|---|---|
| POPE si/no, exactitud (azar 50%) | 47.0% (gain -0.04 +- 0.04) | 74.5% (barajado 59.5%, gain +0.15 +- 0.04) |
| Formas sinteticas, eleccion multiple 4 opciones (azar 31%) | 62.5% | 73.5% |
| COCO caption NLL/token (menor es mejor) | 3.00 | 2.78 |

La evaluacion puntua por verosimilitud de respuestas fijas, por lo que no demuestra calidad en respuestas abiertas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de la calidad de texto de Ripple tras el LoRA en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 140 GB de memoria GPU para inferencia completa (adaptador + Ripple-65B-Preview + SigLIP), segun la model card.
- GPU recomendadas: 2x H100 80GB como minimo documentado; el entrenamiento uso 8x H200 con FSDP2.
- No cabe en GPU de consumo (RTX 4090, 24 GB) con los pesos base en fp32; no se documentan cuantizaciones del LLM base ni del adaptador.
- Opciones de despliegue: carga via el repositorio de codigo (`loading.build_vla_inference`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Espacio en disco: el LLM base ocupa ~130 GB y el repositorio del adaptador 1.1 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-VLM-Instruct (este) | Adaptador ~282M sobre LLM de 65B | no disponible | Proyector SigLIP + LoRA | Apache-2.0 (datos con posibles restricciones) | HF, 0 descargas |
| LLaVA (familia) | 7B-34B | no disponible | Proyector + fine-tuning completo | Apache-2.0 / Llama | Amplia |
| Qwen-VL (familia) | 7B-72B | no disponible | VLM nativo | Apache-2.0 / otras | Amplia |

No se dispone de datos de benchmarks comparables entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Conteo y posicion estan cerca del azar segun el autor.
- Sesgo hacia responder "si" en POPE (64% de respuestas afirmativas).
- Puede equivocarse en colores e inventar detalle en descripciones largas.
- 64 tokens por imagen impiden leer texto pequeno.
- El entrenamiento se detuvo antes de completar la etapa 2 (checkpoint del paso 750 de 1500); es un artefacto preliminar.
- La calidad de texto de Ripple tras el LoRA no se ha re-evaluado.
- La evaluacion por verosimilitud de respuestas fijas no garantiza buena calidad en respuestas abiertas.
- Licencia del adaptador Apache-2.0, pero los datos de entrenamiento (LLaVA-Instruct-150K, CC BY-NC 4.0 y terminos de OpenAI; LLaVA-Pretrain con imagenes LAION/CC/SBU) pueden impedir el uso comercial; verificar las fichas de los datasets.
- El experto de acciones flow-matching no esta entrenado ni incluido.
- No se documentan idiomas soportados ni contexto maximo.

## Enlaces

- Hugging Face: https://huggingface.co/fbarbosa1/ripple-vlm-instruct
- Modelo base LLM: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Modelo base vision: https://huggingface.co/google/siglip-so400m-patch14-224
- Codigo, scripts y eval harness: https://github.com/fbarbosa-stanford/vlm_ripple
