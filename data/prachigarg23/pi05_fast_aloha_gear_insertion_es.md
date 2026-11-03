# prachigarg23/pi05_FAST_aloha_gear_insertion_ES

## Resumen

`pi05_FAST_aloha_gear_insertion_ES` es un checkpoint de un modelo vision-language-action (VLA) para robótica manipulativa, desarrollado por Prachi Garg y colaboradores (Steve Xing, Prahit Yaugand, Saurabh Gupta, Derek Hoiem) en el contexto del artículo *Fine-Tuning VLAs with Self-Demonstrated Generative Control for Multi-Task Manipulation* (arXiv:2608.19490). Se trata de una especialización del modelo base π0.5 con tokens FAST, ajustado mediante fine-tuning supervisado exclusivamente sobre demostraciones expertas de inserción de engranajes con el robot bimanual ALOHA.

El modelo resuelve una tarea concreta: la inserción de engranajes (gear insertion) con dos brazos en la plataforma ALOHA, y actúa como baseline "ES" (expert-supervised) dentro del citado trabajo, que propone métodos de control generativo auto-demostrado para manipulación multi-tarea. Es relevante porque ejemplifica el flujo actual de adaptación de VLAs generalistas (π0.5) a tareas industriales específicas mediante fine-tuning con datos de teleoperación, y porque publica el checkpoint completo en formato openpi bajo licencia Apache 2.0.

El repositorio ocupa 12,4 GB e incluye únicamente los parámetros (`params/`) y los assets de normalización (`assets/`), sin estado del optimizador, correspondientes al paso 17.000 de entrenamiento. No se especifican en la información disponible el número de parámetros, la longitud de contexto ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5 con tokens FAST; no se detalla la topología interna |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint openpi (`params/` y `assets/`); no se especifica safetensors ni GGUF |
| Libreria | openpi |
| Pipeline | robotics |
| Tamano del repositorio | 12,4 GB |
| Paso de entrenamiento | 17.000 |
| Datos de entrenamiento | `prachigarg23/aloha_bimanual_gear_insertion_expert` (solo demostraciones expertas) |
| Modelo base | `pi05_base` |
| Normalizacion | `assets/trossen/norm_stats.json` |

## Arquitectura y entrenamiento

El modelo es un VLA construido sobre π0.5, un modelo de visión-lenguaje-acción que combina un backbone de visión-lenguaje con una cabeza generadora de acciones. En esta variante se emplean tokens FAST, el esquema de tokenización de acciones asociado a π0.5, y el modelo se inicializa desde el checkpoint `pi05_base` y se ajusta mediante fine-tuning supervisado sobre el dataset `aloha_bimanual_gear_insertion_expert`, compuesto exclusivamente por demostraciones expertas de la tarea de inserción de engranajes con ALOHA bimanual.

El checkpoint publicado corresponde al paso 17.000 y contiene solo parámetros y assets de normalización, sin estado del optimizador, lo que lo hace adecuado para inferencia y despliegue pero no para reanudar el entrenamiento de forma directa. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, el uso de RLHF o DPO, ni innovaciones técnicas adicionales más allá de la combinación π0.5 + FAST y el esquema de control generativo auto-demostrado descrito en el paper.

## Capacidades

- Control robótico bimanual para la tarea de inserción de engranajes (gear insertion) en la plataforma ALOHA.
- Generación de acciones motoras a partir de observaciones visuales e instrucciones, propio de un modelo vision-language-action.
- Ejecución de políticas entrenadas con demostraciones expertas, orientada a manipulación de precisión.
- Integración con el stack openpi para servir políticas mediante `scripts/serve_policy.py`.
- Uso como baseline "ES" (expert-supervised) para comparar con métodos de control generativo auto-demostrado del paper asociado.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, razonamiento textual general, matemáticas, audio ni modo thinking.

## Casos de uso

- Automatización de ensamblaje de precisión: el modelo ejecuta la inserción de engranajes con dos brazos en ALOHA, una tarea de tolerancia ajustada que requiere coordinación bimanual; sirve como punto de partida para líneas de montaje con robots de bajo coste.
- Baseline de investigación en VLAs: al ser el checkpoint "ES" del paper, se usa para comparar el fine-tuning supervisado clásico frente a métodos de control generativo auto-demostrado en manipulación multi-tarea.
- Replicación de experimentos: permite reproducir los resultados del artículo descargando el checkpoint y sirviéndolo con `serve_policy.py` sobre el mismo dataset de demostraciones expertas.
- Adaptación a nuevas tareas de inserción: el checkpoint puede servir de inicialización para fine-tuning en tareas similares (peg-in-hole, conectores, componentes mecánicos) con pocas demostraciones adicionales.
- Evaluación de políticas en simulación o en robot real: útil para medir robustez de políticas VLA en entornos controlados antes de desplegar variantes más generales.
- Formación y docencia en robótica: ejemplo práctico y reproducible de cómo adaptar un VLA generalista (π0.5) a una tarea industrial concreta usando openpi y ALOHA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio de 12,4 GB sugiere que los pesos en precisión original ocupan del orden de esa cifra, por lo que se requiere una GPU con al menos ~16 GB para cargar el checkpoint completo, aunque este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponible; por el tamaño del checkpoint, GPU de datacenter tipo A100 o H100 son las candidatas habituales para servir políticas VLA de este tipo, pero no se especifica en la documentación.
- ¿Cabe en GPU de consumo? No confirmado; probablemente en RTX 4090 (24 GB) si los pesos caben en precisión original, pero no hay datos oficiales.
- Opciones de despliegue: stack openpi mediante `scripts/serve_policy.py policy:checkpoint`; el README remite al README de ALOHA del repositorio de código para ejecución en robot.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_FAST_aloha_gear_insertion_ES | no disponible | no disponible | Inserción de engranajes ALOHA (VLA) | Apache 2.0 | HuggingFace |
| π0.5 base (`pi05_base`) | no disponible | no disponible | VLA generalista | no disponible en la información | Referenciado como modelo base |
| Alternativas VLA comparables (p. ej. OpenVLA, RT-2) | no disponible | no disponible | Manipulación generalista | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa con modelos similares.

## Limitaciones y advertencias

- Especialización estrecha: el checkpoint está entrenado únicamente para la tarea de inserción de engranajes con ALOHA bimanual; no es un modelo generalista y su rendimiento fuera de esa tarea no está garantizado.
- Sin estado del optimizador: solo incluye `params/` y `assets/`, por lo que no se puede reanudar el entrenamiento desde el paso 17.000 de forma directa.
- Dependencia de normalización: requiere usar `assets/trossen/norm_stats.json` para que las observaciones y acciones se escalen correctamente; omitirlo degrada la política.
- Riesgo de sobreajuste a las condiciones de las demostraciones expertas (iluminación, posiciones iniciales, hardware concreto); no se documenta robustez ante variaciones.
- Sesgos y alucinaciones: no se documentan sesgos específicos, pero al ser un modelo de acción, los fallos se manifiestan como movimientos incorrectos o inseguros, no como texto alucinado.
- Idiomas: no disponible; no se especifica soporte multilingüe en instrucciones.
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; conviene revisar las licencias del modelo base π0.5 y de openpi antes de producción.
- Sin benchmarks publicados en la información disponible: no hay evidencia cuantitativa de éxito en la tarea más allá de lo que reporte el paper.
- Repositorio con 0 descargas y 0 likes: ecosistema mínimo, sin validación comunitaria; conviene verificar la reproducibilidad de forma independiente.

## Enlaces

- HuggingFace: https://huggingface.co/prachigarg23/pi05_FAST_aloha_gear_insertion_ES
- Dataset de entrenamiento: https://huggingface.co/datasets/prachigarg23/aloha_bimanual_gear_insertion_expert
- Paper: https://arxiv.org/abs/2608.19490
- Project page: https://self-supervised-control.pages.dev/
- Código: https://github.com/prachigarg23/self-supervised-continual-control
- README de ALOHA: https://github.com/prachigarg23/self-supervised-continual-control/blob/main/third_party/aloha/README.md
