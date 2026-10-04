# h3lloworld/ebc-jepa-rope-xattn16-desc-disc-ed24-denoiser

## Resumen

EBC-JEPA (Event-Based Camera JEPA) es un modelo de denoising de datos de camara de eventos desarrollado por el usuario h3lloworld. Se trata de un experimento de investigacion sobre el uso de Rotary Position Embeddings (RoPE) en un esquema continuo frente a discreto, identificado internamente como `rope_xattn16_desc_disc` (ED24). El modelo parte del backbone V-JEPA 2.1 ViT-B de Meta y anade un tokenizador de eventos, una cabeza por evento y adaptadores LoRA de rango 8 sobre las proyecciones qkv y proj, de modo que solo se entrenan un conjunto reducido de tensores.

El problema que aborda es la atenuacion de ruido en flujos de eventos (event-camera denoising), un paso previo habitual en pipelines de vision con sensores neuromorficos. El modelo se ha entrenado sobre la totalidad de los 2.100 ficheros oficiales del dataset ED24 (EDformer), y su generalizacion se evalua sobre DND21 y E-MLB. Es, por tanto, un artefacto de investigacion mas que un modelo de produccion listo para consumo general.

La relevancia actual reside en que combina dos lineas activas: los modelos predictivos conjuntos (JEPA) de Meta aplicados a dominios no textuales, y el uso de decodificacion de eventos para vision de bajo consumo. No se dispone de resultados de benchmarks publicados en la informacion proporcionada, ni de descargas o valoraciones en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | V-JEPA 2.1 ViT-B (transformer de vision) + tokenizador de eventos + cabeza por evento + LoRA (qkv, proj; rango 8) |
| Parametros totales | no disponible (backbone ViT-B; el repositorio solo contiene tensores entrenados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana definida en `config.json`, no publicada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision sobre eventos, sin salida textual) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch), fichero unico `trainable.pt` con tensores entrenados |

## Arquitectura y entrenamiento

La arquitectura se apoya en el checkpoint publico V-JEPA 2.1 ViT-B de Meta (`vjepa2_1_vitb_dist_vitG_384.pt`), que actua como backbone congelado. Sobre el se montan tres componentes entrenables: una proyeccion que convierte eventos en tokens, una cabeza especifica por evento y adaptadores LoRA de rango 8 aplicados a las proyecciones de query, key, value y proyeccion de salida. El fichero `trainable.pt` contiene unicamente estos tensores, no el backbone completo, por lo que la carga requiere descargar aparte el checkpoint original de V-JEPA 2.1.

El eje central del experimento es el modo de codificacion posicional: se compara RoPE continuo frente a discreto, con una variante de atencion cruzada denotada como `xattn16` y descriptores desactivados (`desc_off`). El entrenamiento emplea la totalidad de los 2.100 ficheros oficiales del dataset ED24 (EDformer), lo que convierte a ED24 en el conjunto de entrenamiento completo y a DND21 y E-MLB en los conjuntos de evaluacion para medir generalizacion. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO (poco probables en este dominio). Tampoco se detallan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Denoising de flujos de eventos procedentes de camaras neuromorficas.
- Extraccion de representaciones latentes sobre secuencias de eventos mediante el backbone V-JEPA 2.1.
- Adaptacion eficiente a la tarea de denoising gracias a LoRA sobre qkv y proj (rango 8).
- Prediccion por evento mediante cabeza dedicada.
- Generalizacion evaluada fuera de dominio sobre DND21 y E-MLB.
- No dispone de generacion de texto, codigo, matematicas ni capacidades de vision convencional sobre imagenes RGB.
- No soporta tool calling, function calling ni flujos de agentes.
- No es multilingue en el sentido habitual: no procesa ni produce lenguaje.

## Casos de uso

- Preprocesado de pipelines de vision neuromorfica: el modelo se puede insertar como etapa de limpieza antes de tareas de deteccion, seguimiento o estimacion de flujo optico, reduciendo el ruido de fondo del sensor de eventos.
- Investigacion en representaciones auto-supervisadas: sirve como punto de partida para estudiar el efecto de RoPE continuo frente a discreto en dominios de eventos, comparando variantes con el mismo backbone V-JEPA 2.1.
- Reproduccion de experimentos academicos: los ficheros `metrics.json` y `config.json` permiten replicar las condiciones exactas (ventana, layout, modo RoPE, readout) descritas en la documentacion del repositorio de codigo.
- Evaluacion comparativa de denoisers: se puede usar como baseline LoRA contra otros metodos de denoising de eventos sobre ED24, DND21 y E-MLB.
- Robotica y navegacion de bajo consumo: en plataformas con camaras de eventos, una etapa de denoising ligera (solo LoRA + cabeza) reduce el coste computacional frente al reentrenamiento completo del backbone.
- Automocion y vision en condiciones adversas: los sensores de eventos mantienen informacion temporal con baja latencia, y el denoising previo puede mejorar la robustez en escenas con movimiento rapido.
- Transferencia a nuevos dominios de eventos: dado que solo se entrenan los adaptadores, es viable reajustar el modelo a otros datasets de eventos conservando el backbone congelado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. El repositorio incluye un fichero `metrics.json` con las metricas del experimento, pero su contenido no se ha proporcionado, por lo que no se reproducen cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del backbone V-JEPA 2.1 ViT-B, de la ventana de eventos y del modo de atencion (`xattn16`).
- GPU recomendadas: no disponible. El backbone V-JEPA 2.1 ViT-B es un transformer de vision de tamano moderado, por lo que es probable que quepa en GPUs de gama alta de consumo, pero no se confirma en la documentacion.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: el modelo se evalua con el script `tools/lora_denoise/eval_emlb.py` del repositorio de codigo del autor, cargando `trainable.pt` sobre el checkpoint `vjepa2_1_vitb_dist_vitG_384.pt`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| EBC-JEPA rope_xattn16_desc_disc (ED24) | V-JEPA 2.1 ViT-B + LoRA r8 | Denoising de eventos | MIT | Repositorio HuggingFace con `trainable.pt` |
| EDformer | no disponible en la informacion proporcionada | Denoising de eventos / ED24 | no disponible | No disponible |
| V-JEPA 2.1 ViT-B (Meta) | Backbone base | Representaciones de video | MIT | Checkpoint publico de Meta |

No se dispone de datos comparativos de rendimiento entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a base, tarea y licencia.

## Limitaciones y advertencias

- Es un artefacto de investigacion asociado a un experimento concreto (`rope_xattn16_desc_disc`), no un modelo de proposito general.
- No procesa ni genera lenguaje: cualquier uso esperado como modelo conversacional o de codigo no es aplicable.
- El repositorio no incluye el backbone completo; cargar `trainable.pt` exige descargar aparte el checkpoint de Meta V-JEPA 2.1 ViT-B.
- El modelo card no documenta sesgos conocidos, riesgo de alucinacion ni limitaciones de dominio mas alla de lo indicado.
- La generalizacion se evalua sobre DND21 y E-MLB, pero los resultados numericos no estan disponibles en la informacion proporcionada.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero conviene verificar que la licencia del backbone V-JEPA 2.1 (tambien MIT segun el autor) se mantiene compatible en la redistribucion.
- Repositorio sin descargas ni valoraciones y con espacio ocupado de 0.0 GB, lo que sugiere que no ha sido validado por terceros.
- El parametro de ventana y el layout del modelo solo se especifican en `config.json`, no publicado en la informacion proporcionada, lo que dificulta estimar costes de inferencia a priori.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/h3lloworld/ebc-jepa-rope-xattn16-desc-disc-ed24-denoiser
- Codigo (rama denoise-lora): https://github.com/whohyf/EBC-JEPA-share/tree/denoise-lora
- Checkpoint del backbone V-JEPA 2.1 ViT-B (Meta): https://dl.fbaipublicfiles.com/vjepa2/vjepa2_1_vitb_dist_vitG_384.pt
- Documentacion de protocolo (referenciada en el repo): `docs/lora_denoise/HANDOFF.md`
- Script de evaluacion: `tools/lora_denoise/eval_emlb.py`

Nota: los resultados de busqueda web proporcionados no contienen informacion relacionada con este modelo ni con vision por computador, por lo que no se han utilizado como fuente.
