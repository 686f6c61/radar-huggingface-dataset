# h3lloworld/ebc-jepa-rope-xattn16-desc-cont-s1-ed24-denoiser

## Resumen

EBC-JEPA es un modelo de eliminacion de ruido (denoising) para camaras de eventos desarrollado por el usuario h3lloworld, publicado bajo licencia MIT. No es un modelo de lenguaje: se trata de un artefacto de investigacion que reutiliza el backbone congelado RGB V-JEPA 2.1 ViT-B de Meta y aprende unicamente un conjunto reducido de tensores (adaptadores LoRA sobre las matrices qkv y proj con rango 8, una proyeccion de tokenizer de eventos y una cabeza per-event) para limpiar flujos de eventos ruidosos.

El identificador del repositorio, `ebc-jepa-rope-xattn16-desc-cont-s1-ed24-denoiser`, resume su proposito: es el brazo experimental `rope_xattn16_desc_cont_s1` de un estudio comparativo entre codificaciones posicionales rotatorias (RoPE) continuas y discretas, con atencion cruzada de 16 cabezas y sin descriptores, entrenado sobre la totalidad del conjunto ED24 (las 2.100 ficheros oficiales de EDformer).

Su relevancia es acotada y muy especializada: sirve como referencia reproducible para investigacion en vision por eventos, con evaluacion de generalizacion prevista sobre DND21 y E-MLB. El repositorio no incluye pesos completos, solo `trainable.pt`, `metrics.json` y `config.json`, y en el momento de la consulta acumulaba 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-B (V-JEPA 2.1, RGB) con atencion cruzada de 16 cabezas, adaptadores LoRA (qkv, proj; r=8) y cabeza per-event |
| Parametros totales | no disponible (la model card no detalla el recuento; el backbone es V-JEPA 2.1 ViT-B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de vision; no emplea contexto de texto) |
| Tipos de cuantizacion | no disponible (solo se publica checkpoint PyTorch; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (modelo de vision, no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (`trainable.pt` con solo los tensores entrenados; requiere el checkpoint base de V-JEPA 2.1 ViT-B) |
| Tarea | Denoising de flujos de eventos (camaras de eventos) |
| Resolucion de entrada | 384 (inferida del checkpoint base `vjepa2_1_vitb_dist_vitG_384.pt`) |
| Ficheros del repositorio | `trainable.pt`, `metrics.json`, `config.json` |

## Arquitectura y entrenamiento

El modelo parte de V-JEPA 2.1 ViT-B en su variante RGB, preentrenada por Meta y mantenida congelada. Sobre ese backbone se insertan adaptadores LoRA de rango 8 en las matrices de consulta, clave, valor y proyeccion, junto con una proyeccion especifica para tokenizar eventos y una cabeza de salida per-event. La configuracion experimental `rope_xattn16_desc_cont_s1` emplea atencion cruzada con 16 cabezas y evalua un modo de RoPE continuo, con los descriptores desactivados. La model card indica que el detalle de layout, ventana, readout y modo de RoPE debe consultarse en `config.json`, que no se ha facilitado en la informacion disponible.

El entrenamiento cubre la totalidad del conjunto ED24 (EDformer, los 2.100 ficheros oficiales). La generalizacion se prueba sobre DND21 y E-MLB. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas de alineacion tipo RLHF o DPO, que en cualquier caso no aplican a un modelo de vision no generativo de lenguaje.

## Capacidades

- Eliminacion de ruido en secuencias de eventos procedentes de camaras de eventos.
- Reutilizacion de representaciones visuales preentrenadas de V-JEPA 2.1 mediante adaptacion de bajo rango (LoRA), lo que permite entrenar con recursos reducidos.
- Salida per-event (una prediccion por evento), segun la descripcion de la cabeza del modelo.
- Evaluacion de generalizacion cruzada a otros conjuntos de denoising de eventos (DND21, E-MLB).
- Experimentacion controlada sobre variantes de RoPE (continuo frente a discreto) y sobre el numero de cabezas de atencion cruzada.
- No soporta tool calling, function calling ni uso como agente: no es un modelo de lenguaje.
- No tiene capacidades multilingues ni de generacion de texto.
- No se documentan capacidades de vision general, audio, thinking mode ni razonamiento multi-paso.

## Casos de uso

- Preprocesado en pipelines de odometria visual y SLAM con camaras de eventos: el denoiser limpia el flujo antes de alimentar modulos de estimacion de movimiento, lo que reduce el ruido en la nube de eventos y mejora la estabilidad del seguimiento.
- Robotica de baja latencia: al operar sobre eventos (sin frames completos) y con un backbone ViT-B, el modelo encaja en la etapa de filtrado previa a control reactivo, donde el ruido de sensor degrada las decisiones.
- Vision en condiciones de iluminacion extrema: las camaras de eventos se emplean en escenarios de alto rango dinamico; el denoising previo mejora la calidad de la senal en automocion y vigilancia nocturna.
- Tracking de alta velocidad: en escenas con movimiento rapido, donde los eventos se acumulan y el ruido crece, el modelo puede actuar como etapa de limpieza antes del algoritmo de tracking.
- Investigacion reproducible en vision por eventos: el repositorio publica el codigo de entrenamiento y evaluacion, lo que permite reproducir el brazo experimental y compararlo con otras variantes de RoPE y de atencion.
- Linea base en benchmarks de denoising de eventos: util como punto de comparacion sobre ED24, DND21 y E-MLB para metodos de denoising especificos de dominio.
- Adaptacion a nuevos dominios con coste reducido: al entrenar solo LoRA y una cabeza ligera, es viable reajustar el modelo a un sensor o dataset distinto sin reentrenar el backbone completo.
- Generacion de datos limpios para entrenamiento posterior: los flujos de eventos denoizados pueden servir para preentrenar otros modelos de vision por eventos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un fichero `metrics.json` y la model card menciona evaluacion sobre DND21 y E-MLB mediante `tools/lora_denoise/eval_emlb.py`, pero no se proporcionan los valores numericos ni las tablas comparativas, por lo que no se reproducen cifras.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un backbone ViT-B de V-JEPA a 384 px en precision completa suele requerir del orden de pocos GB de VRAM para inferencia, cifra que aumenta con el tamano de lote y la longitud de la secuencia de eventos. Los adaptadores LoRA anaden un coste marginal.
- GPU recomendadas: no especificadas por el autor. Para entrenamiento o evaluacion de lotes grandes serian adecuadas GPU de datacenter (A100, H100) o GPUs de consumo con suficiente memoria; para inferencia en lote pequeno, una GPU de consumo moderna es suficiente.
- Compatibilidad con GPU de consumo: probablemente si, dado que el backbone es ViT-B y el modelo entrena solo tensores de bajo rango, aunque el requisito real depende de la longitud de la ventana de eventos definida en `config.json`, no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vision en formato PyTorch. El flujo previsto es cargar el checkpoint base de V-JEPA 2.1 y superponer `trainable.pt` mediante los scripts del repositorio de codigo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EBC-JEPA (este modelo) | Denoiser de eventos sobre V-JEPA 2.1 ViT-B + LoRA | no disponible (backbone ViT-B) | no aplica | no disponible | MIT | HuggingFace, solo tensores entrenados |
| V-JEPA 2.1 ViT-B (Meta) | Backbone de representaciones visuales | no disponible en la informacion | no aplica | no disponible | MIT | Checkpoint publico en fbaipublicfiles |
| EDformer | Metodo de denoising de eventos (origen del dataset ED24) | no disponible | no aplica | no disponible | no disponible | no disponible |
| Metodos evaluados en DND21 / E-MLB | Denoising de eventos | no disponible | no aplica | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye cifras comparativas de rendimiento entre estos modelos, por lo que la comparativa se limita a la naturaleza del artefacto, su licencia y su disponibilidad.

## Limitaciones y advertencias

- Artefacto experimental: 0 descargas y 0 likes en el momento de la consulta, y un tamano de repositorio registrado de 0.0 GB, lo que sugiere un uso previsto casi exclusivamente interno o de investigacion.
- No es un modelo autonomo: `trainable.pt` contiene solo los tensores entrenados, por lo que es imprescindible descargar el checkpoint base de V-JEPA 2.1 ViT-B desde los servidores de Meta para poder ejecutarlo.
- Sin formatos de cuantizacion publicados (no hay GGUF, AWQ ni GPTQ), lo que limita el despliegue a entornos PyTorch y complica la inferencia en hardware modesto.
- Riesgo de alucinacion: no aplica en el sentido generativo habitual, pero si existe riesgo de artefactos en la reconstruccion, es decir, de eliminar estructura de senal real junto con el ruido.
- Sesgos y cobertura de dominio: el modelo se entrena unicamente sobre ED24, por lo que puede degradarse ante sensores, resoluciones o condiciones de iluminacion distintos. La model card solo anticipa pruebas de generalizacion en DND21 y E-MLB.
- Ausencia de idiomas y de capacidades de lenguaje: no debe utilizarse para tareas de texto, dialogo, codigo ni agentes.
- Documentacion incompleta: los hiperparametros clave (layout, ventana, readout, modo de RoPE) remiten a `config.json`, no incluido en la informacion disponible, y los resultados de `metrics.json` no se detallan en la model card.
- Licencia: MIT para este artefacto y para el backbone de V-JEPA 2.1, lo que en principio permite uso comercial, aunque conviene verificar la procedencia y los terminos del dataset ED24 antes de un despliegue en produccion.
- Trazabilidad: las fechas de creacion y actualizacion del repositorio (2026-10-06) no se corresponden con el momento de la consulta, lo que dificulta interpretar el estado real de mantenimiento del proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/h3lloworld/ebc-jepa-rope-xattn16-desc-cont-s1-ed24-denoiser
- Codigo de entrenamiento y evaluacion: https://github.com/whohyf/EBC-JEPA-share/tree/denoise-lora (rutas `src/ebc_jepa/lora_denoise` y `tools/lora_denoise`; protocolo de tablas en `docs/lora_denoise/HANDOFF.md`)
- Script de evaluacion: `tools/lora_denoise/eval_emlb.py`
- Checkpoint base V-JEPA 2.1 ViT-B: https://dl.fbaipublicfiles.com/vjepa2/vjepa2_1_vitb_dist_vitG_384.pt
- Paper o publicacion asociada: no disponible
