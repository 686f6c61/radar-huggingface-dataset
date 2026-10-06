# h3lloworld/ebc-jepa-rope-ls-disc-ed24-denoiser

## Resumen

EBC-JEPA RoPE experiment rope_ls_disc (ED24) es un artefacto de investigacion publicado por el usuario h3lloworld en HuggingFace. Se trata de un modelo de vision orientado al denoising de datos de camaras de eventos, construido sobre el backbone V-JEPA 2.1 ViT-B de Meta, al que se anaden adaptadores LoRA, una proyeccion de tokenizer de eventos y una cabeza especifica por evento. No es un modelo de lenguaje: es un experimento de representacion auto-supervisada (JEPA, Joint Embedding Predictive Architecture) aplicado a secuencias de eventos.

El proposito concreto del experimento es comparar modos de codificacion posicional rotatoria (RoPE) en su variante continua frente a la discreta, de ahi la etiqueta `rope_ls_disc` del nombre. El modelo se entrena sobre el conjunto completo ED24 (2.100 archivos oficiales derivados de EDformer) y se evalua en generalizacion sobre DND21 y E-MLB, dos benchmarks habituales de denoising de camaras de eventos.

La relevancia es acotada: se publica como tensor entrenable (`trainable.pt`) que debe cargarse sobre el checkpoint publico de V-JEPA 2.1 ViT-B, no como modelo autonomo listo para produccion. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y el tamano del repo figura como 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que el artefacto es minimo (solo tensores entrenables). La licencia es MIT, heredada del trabajo original de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | V-JEPA 2.1 ViT-B (Vision Transformer base) con LoRA (qkv, proj; rango 8), proyeccion de tokenizer de eventos y cabeza por evento |
| Parametros totales | no disponible (el backbone subyacente es ViT-B; el artefacto publicado solo contiene tensores entrenables) |
| Longitud de contexto | no aplica / no disponible (modelo de vision sobre secuencias de eventos, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) / no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`trainable.pt`); requiere el checkpoint V-JEPA 2.1 ViT-B `vjepa2_1_vitb_dist_vitG_384.pt` como base |

## Arquitectura y entrenamiento

El modelo parte del backbone V-JEPA 2.1 ViT-B preentrenado por Meta y lo adapta al dominio de camaras de eventos mediante LoRA aplicado a las proyecciones qkv y proj con rango 8 (r8). Sobre esa base se anaden dos componentes entrenables adicionales: una proyeccion de tokenizer que convierte la representacion de eventos en tokens compatibles con el backbone, y una cabeza especifica por evento. La variante del experimento es `rope_ls_disc`, que contrasta un modo de RoPE continuo frente a uno discreto, con los descriptores desactivados, segun se detalla en el `config.json` del repositorio.

El entrenamiento utiliza el conjunto completo ED24 (los 2.100 archivos oficiales de EDformer) y la evaluacion de generalizacion se realiza sobre DND21 y E-MLB. No se especifica en la informacion proporcionada el numero de tokens, la composicion exacta del dataset, ni si se emplearon etapas de RLHF o DPO (poco probables en un modelo de vision auto-supervisado). El protocolo de la tabla de resultados esta descrito en `docs/lora_denoise/HANDOFF.md` del repositorio de codigo asociado.

## Capacidades

- Denoising de secuencias de eventos procedentes de camaras de eventos.
- Extraccion de representaciones auto-supervisadas sobre datos de eventos (enfoque JEPA).
- Adaptacion eficiente mediante LoRA sobre un backbone congelado de V-JEPA 2.1.
- Codificacion posicional configurable: modo RoPE continuo frente a discreto segun el experimento `rope_ls_disc`.
- Evaluacion de generalizacion sobre benchmarks de denoising (DND21, E-MLB).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues, de audio ni de texto.

## Casos de uso

- Investigacion en denoising de camaras de eventos: el modelo sirve como punto de partida reproducible para comparar variantes de RoPE sobre un backbone V-JEPA congelado, usando el protocolo documentado en el repositorio.
- Reproduccion de experimentos academicos: al publicarse solo los tensores entrenables, permite replicar el entrenamiento LoRA sobre ED24 sin redistribuir el backbone completo de Meta.
- Base para transferencia a nuevos dominios de eventos: la proyeccion de tokenizer y la cabeza por evento son los modulos entrenables clave que se pueden reajustar a otros dataset de eventos.
- Evaluacion comparativa de metodos de denoising: util para situar EDformer y variantes frente a los resultados en DND21 y E-MLB.
- Desarrollo de preprocesado para pipelines de vision con camaras de eventos: un denoiser previo puede alimentar tareas posteriores de deteccion, seguimiento o SLAM basadas en eventos.
- Estudio de eficiencia con LoRA: el enfoque r8 sobre qkv y proj permite analizar el coste/beneficio de la adaptacion de bajo rango en backbones de vision.
- Ensayo de estrategias de codificacion posicional: la comparativa continuo/discreto aporta evidencia para decidir el esquema de RoPE en modelos de eventos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks con valores numericos en la informacion disponible. El repositorio incluye un archivo `metrics.json` que presumiblemente contiene las metricas del experimento, pero sus cifras no se han facilitado. La evaluacion prevista se realiza sobre DND21 y E-MLB mediante el script `tools/lora_denoise/eval_emlb.py`.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Al tratarse de un backbone ViT-B con adaptadores LoRA de bajo rango, el consumo deberia ser contenido, pero no se confirma ninguna cifra.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no confirmada; por tamano del backbone ViT-B es plausible en GPUs de gama alta de consumo, pero es una estimacion no verificada con la informacion disponible.
- Opciones de despliegue: carga en PyTorch sobre el checkpoint V-JEPA 2.1 ViT-B; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de vision de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| EBC-JEPA RoPE rope_ls_disc (ED24) | V-JEPA 2.1 ViT-B + LoRA para denoising de eventos | no aplica | MIT | HuggingFace (0 descargas) |
| EDformer | Modelo de denoising de eventos (origen del dataset ED24) | no disponible | no disponible | Referencia academica |
| V-JEPA 2.1 ViT-B (Meta) | Backbone de vision auto-supervisado | no aplica | MIT | Pesos publicos de Meta |

No se dispone de datos de rendimiento comparables entre estas opciones en la informacion proporcionada, por lo que la comparativa se limita a naturaleza del modelo, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar el checkpoint base `vjepa2_1_vitb_dist_vitG_384.pt` de Meta para funcionar.
- El repositorio figura con 0.0 GB de tamano y 0 descargas, lo que genera dudas razonables sobre si los pesos estan efectivamente accesibles.
- Ausencia total de resultados de benchmarks publicados en la informacion disponible; no se puede validar su rendimiento real.
- Al ser un artefacto de investigacion (un experimento de RoPE), no hay garantias de robustez ni soporte para uso en produccion.
- Dominio muy especifico (camaras de eventos); no aplicable a tareas de texto, codigo, matematicas ni vision convencional en color.
- Riesgo de sobreajuste al dataset ED24: la generalizacion solo esta prevista sobre DND21 y E-MLB, y no se aportan cifras.
- Aunque la licencia es MIT, el uso comercial depende tambien de las condiciones del backbone V-JEPA 2.1 de Meta, que se distribuye igualmente bajo MIT segun la model card.
- No se documentan sesgos, pero tampoco se realiza ninguna evaluacion etica o de sesgo.

## Enlaces

- HuggingFace: https://huggingface.co/h3lloworld/ebc-jepa-rope-ls-disc-ed24-denoiser
- Codigo (rama denoise-lora): https://github.com/whohyf/EBC-JEPA-share/tree/denoise-lora
- Protocolo de tabla de resultados: `docs/lora_denoise/HANDOFF.md` (dentro del repositorio de codigo)
- Checkpoint base V-JEPA 2.1 ViT-B (Meta): https://dl.fbaipublicfiles.com/vjepa2/vjepa2_1_vitb_dist_vitG_384.pt
- Dataset ED24 (EDformer): no se proporciona enlace en la informacion disponible
- Benchmarks DND21 y E-MLB: no se proporcionan enlaces en la informacion disponible
