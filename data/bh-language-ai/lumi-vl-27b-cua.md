# BH-Language-AI/lumi-vl-27b-cua

## Resumen

LUMI-VL-27B-CUA es un adaptador LoRA sobre el modelo multimodal Qwen/Qwen3.5-27B, desarrollado por BH-Language-AI, especializado en GUI grounding para aplicaciones de escritorio. El modelo recibe una captura de pantalla y una descripcion textual de un elemento de la interfaz, y devuelve las coordenadas normalizadas (rango 0-1000) del elemento solicitado, en formato JSON compatible con herramientas de computer use. Resuelve el problema de localizar elementos visuales en pantallas de escritorio para automatizacion de agentes CUA (computer-use agents).

El modelo base es un transformer denso de 27,8B parametros con capacidades vision-language. El adaptador se entrena con LoRA de rango 64 y alpha 128 en bf16, sin cuantizacion, sobre 408k pares profesionales de escritorio del dataset GroundCUA mas un 15% de capturas de Windows propias. El resultado reportado es de 74,5% de precision en ScreenSpot-Pro (dev shard) aplicando una cascada de zoom del 50%, lo que supone una mejora de 6,6 puntos porcentuales sobre el mismo modelo sin zoom.

Es relevante ahora porque demuestra que el ajuste fino con LoRA sobre un modelo denso de 27B supera a alternativas de mayor tamano como un MoE de 122B con LoRA (41,0%) o Indeed-UI-32B (61,8%) en la tarea especifica de GUI grounding, y porque el adaptador es ligero (1,3 GB en el repo) y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (base Qwen3.5-27B) con adaptador LoRA |
| Parametros totales | 27,8B (modelo base); adaptador LoRA r64/alpha128 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 en entrenamiento; GGUF mencionado como opcion para CPU (no se detallan variantes) |
| Idiomas soportados | bs, hr, sr, en |
| Licencia | Apache-2.0 (base y adaptador) |
| Formato de pesos | safetensors (adaptador PEFT); requiere pesos del modelo base |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-27B, un transformer denso multimodal de 27,8B parametros que procesa imagen y texto. El entrenamiento usa LoRA de rango 64 y alpha 128 en bf16 sin cuantizacion, distribuido con FSDP/DDP sobre 8 GPUs AMD MI250X (LUMI-G). Se realizaron 160 pasos de optimizacion con 8 GPUs y acumulacion 2, lo que equivale a 1.839 muestras, con learning rate 1e-6 y resolucion de 2 MP.

Los datos de entrenamiento combinan 408k pares profesionales de escritorio del dataset GroundCUA con un 15% adicional de capturas de Windows propias. El modelo se entrena para emitir una llamada de herramienta en formato `{"tool":"tap","args":{"x":<0-1000>,"y":<0-1000>}}` con `enable_thinking=False`. La innovacion practica destacable es la cascada de zoom en inferencia (`zoom_cascade.py`): se recorta un 50% alrededor de la primera prediccion y se repite la inferencia, lo que aporta +6,6 pp de precision frente a inferir sin zoom. El autor reporta que el learning rate 1e-6 es critico: con 5e-7 la precision baja a 71,0% con zoom.

## Capacidades

- GUI grounding en aplicaciones de escritorio: localiza el elemento solicitado en una captura de pantalla y devuelve coordenadas normalizadas en el rango 0-1000.
- Generacion de llamadas de herramienta en formato JSON estructurado (`tap` con argumentos `x` e `y`).
- Comprension de imagen y texto (pipeline image-text-to-text) heredada del modelo base Qwen3.5-27B.
- Capacidad multilingue limitada a bosnio, croata, serbio e ingles segun los metadatos del modelo.
- Soporte de modo sin razonamiento explicito (`enable_thinking=False`) para respuestas directas y de baja latencia.
- Integracion con PEFT: el adaptador se carga sobre el modelo base mediante `PeftModel.from_pretrained`.
- No se documentan capacidades de audio ni de agente multi-paso mas alla del grounding de un unico elemento.

## Casos de uso

- Automatizacion de pruebas de interfaz de escritorio: el modelo localiza botones, campos y menus en capturas de pantalla y devuelve coordenadas que un runner de pruebas puede usar para generar clics sinteticos, reduciendo la dependencia de selectores fragiles.
- Agentes de computer use para RPA: un orquestador envia la captura de pantalla y la descripcion del control objetivo, y el adaptador devuelve la accion `tap` con coordenadas normalizadas que el agente ejecuta sobre el escritorio.
- Asistentes de accesibilidad: dado un comando en lenguaje natural, el modelo identifica el elemento correspondiente en la pantalla para guiar a un usuario con dificultades motoras hacia la zona de clic correcta.
- Soporte remoto asistido: un sistema captura la pantalla del usuario, interpreta la peticion ("pulsa el boton de guardar") y resalta o ejecuta la accion sobre la interfaz de la aplicacion de escritorio.
- Automatizacion de flujos en aplicaciones de escritorio legacy: al no depender de APIs internas ni de selectores DOM, el grounding visual permite operar sobre aplicaciones sin exposicion programatica, usando la captura de pantalla como unica entrada.
- Generacion de datasets de interaccion: el modelo puede etiquetar capturas de pantalla con las coordenadas de los elementos descritos, alimentando pipelines de entrenamiento de otros agentes CUA.
- Verificacion de regresiones visuales: en pipelines de CI, el modelo comprueba que un elemento descrito sigue presente y en la posicion esperada tras un cambio de interfaz, devolviendo coordenadas comparables entre versiones.

## Benchmarks y rendimiento

Resultados reportados por el autor en ScreenSpot-Pro con protocolo oficial (resolucion nativa, sin tolerancia), dev shard de 0/8 (592 de 593 elementos), decodificacion greedy:

| Modo | Precision | Texto | Icono |
|---|---|---|---|
| Sin zoom | 67,9% (medido en 558 elementos) | 80,8% | 47,2% |
| Con zoom 50% | 74,5% | 87,0% | 54,8% |

Comparacion en el mismo harness:

| Modelo | Precision | Nota |
|---|---|---|
| Qwen3.5-27B + este LoRA + zoom | 74,5% | este modelo |
| Qwen3.5-9B (lumi-vl-8b-cua) + cascada | 70,8% | modelo propio publicado |
| Qwen3.5-27B zero-shot + zoom | 69,3% | sin entrenamiento |
| Qwen3.5-27B zero-shot | 63,7% | sin entrenamiento |
| Indeed-UI-32B | 61,8% | 32B, Apache-2.0 |
| Qwen3.5-122B-A10B + LoRA | 41,0% | MoE 122B |

Ablacion de learning rate y zoom:

| Variante | Precision |
|---|---|
| lr 5e-7 + zoom | 71,0% |
| lr 1e-6 + zoom | 74,5% |
| lr 1e-6 sin zoom | 67,9% |

## Requisitos de hardware

- VRAM estimada: aproximadamente 54 GB para los pesos en bf16 del modelo base mas el adaptador.
- GPU recomendadas: 1x MI250X de 128 GB (entorno de entrenamiento del autor), o 4x A100 de 40 GB con sharding.
- En GPU consumer: no cabe en bf16 en tarjetas de 24 GB; el autor menciona cuantizacion GGUF como opcion para CPU, sin detallar variantes ni requisitos.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` y `PeftModel` (flujo documentado), y GGUF para CPU. No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. La cascada de zoom implica dos pasadas de inferencia por elemento, lo que incrementa el coste respecto a una unica pasada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScreenSpot-Pro (mismo harness) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LUMI-VL-27B-CUA | 27,8B denso + LoRA | no disponible | 74,5% con zoom | Apache-2.0 | Hugging Face (adaptador PEFT) |
| lumi-vl-8b-cua | ~9B denso + LoRA | no disponible | 70,8% con cascada | no disponible | Hugging Face |
| Indeed-UI-32B | 32B | no disponible | 61,8% | Apache-2.0 | no disponible |
| Qwen3.5-122B-A10B + LoRA | 122B MoE | no disponible | 41,0% | no disponible | no disponible |

## Limitaciones y advertencias

- Los iconos sin texto son el principal foco de error: 54,8% de precision frente al 87,0% en elementos textuales.
- El resultado de 74,5% se mide sobre el dev shard de 593 elementos, no sobre los 4.743 completos, por lo que no es directamente comparable con cifras de leaderboards que usan otros prompts y resoluciones.
- El modelo depende de la cascada de zoom en inferencia para alcanzar su mejor cifra; sin zoom la precision cae a 67,9%.
- El autor reporta que los datos web degradan el rendimiento (-7 pp en el modelo de 9B), por lo que el dominio esta acotado a escritorio.
- Cobertura linguistica limitada a bosnio, croata, serbio e ingles; no se documenta soporte de castellano.
- Riesgo de alucinacion de coordenadas cuando el elemento no existe o la captura es ambigua; no se documentan mecanismos de abstenccion.
- El adaptador no incluye los pesos del modelo base: requiere descargar Qwen/Qwen3.5-27B por separado.
- Licencia Apache-2.0 en base y adaptador, sin restricciones comerciales documentadas adicionales.
- No se documentan sesgos especificos ni evaluaciones de robustez fuera de ScreenSpot-Pro.

## Enlaces

- Hugging Face: https://huggingface.co/BH-Language-AI/lumi-vl-27b-cua
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Modelo propio relacionado: `lumi-vl-8b-cua` (referenciado en la model card, sin URL directa)
- Script de inferencia con zoom: `zoom_cascade.py` incluido en el repositorio del adaptador
- Dataset de entrenamiento: GroundCUA (referenciado en la model card, sin URL directa)
- Benchmark: ScreenSpot-Pro (referenciado en la model card, sin URL directa)
