# canvit/pgpolicy-ade20k-c64-t5-floorband-2026-07-07-s5

## Resumen

`pgpolicy-ade20k-c64-t5-floorband-2026-07-07-s5` es una política de visión aprendida (learned viewing policy) desarrollada por el usuario canvit para el modelo fundacional de visión activa CanViT (Canvas Vision Transformer). No es un modelo de lenguaje ni un transformer generativo al uso: es un módulo pequeño (5,54 millones de parámetros) que decide qué región de una escena debe observar a continuación un observador congelado (CanViT-B), con el objetivo de maximizar la calidad de la segmentación semántica ADE20K que se lee del canvas del observador.

El modelo resuelve un problema concreto de visión activa: dado un presupuesto limitado de vistazos (glimpses) sobre una imagen de 512 px, seleccionar la secuencia de regiones de 128 px que más reduce la entropía cruzada de la sonda de segmentación. Se entrena mediante REINFORCE sobre las escenas de entrenamiento de ADE20K, con episodios de 5 vistazos y semilla 5. El checkpoint seleccionado es el paso 6.000, el de menor entropía cruzada media de validación tras los vistazos elegidos por la política.

Es relevante porque acompaña al paper CanViT presentado en NeurIPS 2026 y demuestra un patrón de entrenamiento por refuerzo sobre un backbone congelado, lo que permite reutilizar el observador y su sonda sin reentrenarlos. El repositorio es pequeño (0,1 GB), la licencia es MIT y la librería de inferencia es `canvit-pytorch`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de selección de viewpoints sobre canvas de CanViT (Vision Transformer de visión activa); no es un transformer generativo |
| Parametros totales | 5.543.447 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de escena de 512 px, glimpses de 128 px, canvas de 64 × 64 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La política opera sobre el canvas de un CanViT-B congelado (`canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02`) y su sonda ADE20K congelada (`canvit/probe-ade20k-40k-s512-c64-in21k`). El espacio de acciones son centros de 16 × 16 en cada una de dos escalas (0,5 y 0,25), y la política puntúa cada viewpoint candidato; CanViT observa a continuación el candidato de mayor puntuación. El canvas tiene resolución 64 × 64 y los glimpses son de 128 px sobre escenas de 512 px.

El entrenamiento usa REINFORCE con episodios de 5 vistazos sobre las escenas de entrenamiento de ADE20K, semilla 5, con la recompensa definida como la reducción de la entropía cruzada de la sonda de segmentación. El paso seleccionado es el 6.000, elegido por menor entropía cruzada media de validación tras los vistazos. La entropía cruzada de validación tras cada vistazo fue 0,7649, 0,7161, 0,6886, 0,6758 y 0,6661 respectivamente, lo que muestra una mejora monótona decreciente. El registro completo del entrenamiento está en `training_run/` con el formato original del código.

## Capacidades

- Selección activa de viewpoints: puntúa candidatos y elige el siguiente glimpse de mayor score.
- Rollout de episodios de visión activa de N vistazos (`policy.rollout(scene, num_glimpses=5)`).
- Segmentación semántica ADE20K a través de la sonda del observador congelado (`policy.model.logits(...)` devuelve 64 × 64 clases).
- Integración con el ecosistema `canvit-pytorch` (>= 0.3) mediante `LearnedPolicy.from_pretrained`.
- No soporta tool calling, function calling, agentes de texto ni capacidades multilingües.
- No dispone de modo thinking, visión general fuera del pipeline CanViT, audio ni generación de texto.

## Casos de uso

- Segmentación semántica con presupuesto limitado de cómputo: en lugar de procesar la imagen completa a alta resolución, la política elige 5 regiones de 128 px que maximizan la calidad de la segmentación sobre el canvas de 64 × 64, reduciendo el coste por escena.
- Investigación en visión activa: sirve como baseline reproducible (semilla 5, paso 6.000) para comparar estrategias de selección de viewpoints en ADE20K.
- Ablaciones de políticas de refuerzo: al estar el observador y la sonda congelados, permite aislar el efecto de la política de selección sin reentrenar el backbone.
- Sistemas de percepción con recursos restringidos: útil en robótica o dispositivos embebidos donde no se puede procesar la escena completa y se necesita decidir dónde mirar.
- Docencia y reproducción de resultados: el repositorio incluye `training_run/` con el registro original, lo que facilita reproducir el entrenamiento REINFORCE.
- Evaluación de la curva entropía cruzada por vistazo: permite estudiar el rendimiento marginal de cada glimpse adicional (0,7649 → 0,6661 en 5 pasos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la entropía cruzada media de validación ADE20K tras cada glimpse, que se muestra en la tabla siguiente:

| Vistazos | Entropia cruzada de validacion |
|---|---|
| 1 | 0,7649 |
| 2 | 0,7161 |
| 3 | 0,6886 |
| 4 | 0,6758 |
| 5 | 0,6661 |

No se proporcionan comparaciones con otras políticas ni métricas como mIoU.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el checkpoint pesa 0,1 GB y tiene 5,54 M de parámetros, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; el ejemplo de la model card usa `torch.device("cpu")`, lo que indica que la política puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, con margen amplio (RTX 3060, RTX 4090, etc.), aunque el coste real lo domina el observador CanViT-B congelado, no la política.
- Opciones de despliegue: `canvit-pytorch` (>= 0.3) mediante `uv add`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otras políticas de visión activa comparables ni métricas que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La política está entrenada exclusivamente sobre ADE20K y sobre el observador y la sonda concretos indicados; no es transferible a otros backbones o datasets sin reentrenamiento.
- El espacio de acciones está fijado a dos escalas (0,5 y 0,25) y centros de 16 × 16, lo que limita la granularidad de la selección.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes conversacionales.
- Riesgo de sobreajuste al conjunto de validación de ADE20K en la selección del paso 6.000.
- La licencia MIT del checkpoint convive con la licencia DINOv3 del modelo base CanViT, que se distribuye bajo la DINOv3 License; conviene revisar las condiciones de uso comercial del backbone.
- No se documentan sesgos específicos ni evaluaciones de robustez fuera de ADE20K.
- El formato de los ficheros en `main` difiere del original (`original-format`); usar la revisión correcta según la versión de `canvit-pytorch`.

## Enlaces

- Hugging Face: https://huggingface.co/canvit/pgpolicy-ade20k-c64-t5-floorband-2026-07-07-s5
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- OpenReview: https://openreview.net/forum?id=cnV9GA4pKU
- Código: https://github.com/m2b3/CanViT
- Project page: https://m2b3.github.io/CanViT/
- Checkpoints CanViT: https://huggingface.co/canvit
- Modelo base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Sonda ADE20K: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k
- DINOv3 (licencia del backbone): https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
