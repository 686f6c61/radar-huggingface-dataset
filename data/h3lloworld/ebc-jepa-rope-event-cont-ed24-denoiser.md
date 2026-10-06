# h3lloworld/ebc-jepa-rope-event-cont-ed24-denoiser

## Resumen

EBC-JEPA RoPE experiment `rope_event_cont` (ED24) es un modelo de eliminacion de ruido (denoising) para camaras de eventos, desarrollado por el usuario h3lloworld. Se construye sobre el backbone de vision V-JEPA 2.1 ViT-B de Meta y anade un adaptador LoRA (rank 8 sobre las proyecciones qkv y proj), una proyeccion de tokenizer de eventos y una cabeza por evento (per-event head). El objetivo es limpiar la senal ruidosa que generan las camaras de eventos, un tipo de sensor que registra cambios de luminosidad por pixel de forma asincrona.

El modelo forma parte de una familia de experimentos EBC-JEPA centrados en la codificacion posicional rotatoria (RoPE). Esta variante concreta, `rope_event_cont`, explora la modalidad continua frente a la discreta de RoPE. Se entreno sobre el conjunto ED24 completo (las 2.100 imagenes oficiales de EDformer) y su generalizacion se evalua sobre DND21 y E-MLB. Los descriptores estan desactivados en esta configuracion.

Se trata de un modelo de investigacion muy reciente y de nicho, con cero descargas y cero likes en el momento de redactar esta ficha, publicado bajo licencia MIT. No es un modelo de lenguaje, sino un modelo de vision orientado a una tarea especifica de restauracion de imagenes de eventos, por lo que conceptos como contexto en tokens o soporte multilingue no aplican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (V-JEPA 2.1 ViT-B) con adaptadores LoRA, proyeccion de tokenizer de eventos y cabeza por evento |
| Parametros totales | No disponible (el checkpoint `trainable.pt` contiene solo los tensores entrenados: LoRA, cabeza y proyeccion; el backbone V-JEPA 2.1 ViT-B se descarga por separado) |
| Longitud de contexto | No aplica (modelo de vision, no de lenguaje); ventana de configuracion en `config.json`, valor no disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de vision sobre datos de camara de eventos) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`); requiere el checkpoint base publico `vjepa2_1_vitb_dist_vitG_384.pt` |

## Arquitectura y entrenamiento

El modelo parte del backbone V-JEPA 2.1 ViT-B de Meta, un Vision Transformer de arquitectura JEPA (Joint Embedding Predictive Architecture) preentrenado a gran escala. Sobre ese backbone se aplica un ajuste fino eficiente mediante LoRA con rank 8, aplicado a las proyecciones de query, key, value y a la proyeccion de salida del bloque de atencion. Ademas se entrena una proyeccion de tokenizer especifica para eventos y una cabeza de prediccion por evento. El experimento se centra en el modo de codificacion posicional rotatoria (RoPE), comparando una formulacion continua (`rope_event_cont`) frente a una discreta; el modo se controla desde `config.json`, que tambien define el layout, la ventana y el modo de lectura (readout).

El entrenamiento se realizo sobre el conjunto ED24 de EDformer, empleando las 2.100 imagenes oficiales. La evaluacion de generalizacion se lleva a cabo con DND21 y E-MLB. Los descriptores adicionales estan desactivados en esta configuracion. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas de alineacion como RLHF o DPO; al tratarse de un modelo de vision y no de lenguaje, estas ultimas no aplican. El repositorio de codigo incluye el protocolo de evaluacion en `docs/lora_denoise/HANDOFF.md`.

## Capacidades

- Eliminacion de ruido en imagenes de camaras de eventos: restauracion de la senal de eventos a partir de entradas ruidosas.
- Codificacion posicional rotatoria continua (RoPE continuo) sobre tokens de eventos.
- Aprendizaje de representaciones predictivas al estilo JEPA sobre el backbone V-JEPA 2.1 ViT-B.
- Ajuste fino eficiente mediante LoRA, lo que reduce el numero de tensores entrenables frente al ajuste completo.
- Inferencia por evento mediante una cabeza dedicada (`per-event head`).
- Generalizacion evaluable sobre los conjuntos DND21 y E-MLB.
- No dispone de generacion de texto, razonamiento linguistico, tool calling, capacidades de agente, vision semantica general ni procesamiento de audio en la informacion disponible.

## Casos de uso

- Restauracion de datos de camara de eventos: aplicar el modelo para limpiar la salida ruidosa de un sensor de eventos antes de alimentar un pipeline de vision por computador de alta velocidad.
- Preprocesado en pipelines de vision neuromorfica: usar el denoiser como etapa previa en sistemas de deteccion o seguimiento sobre eventos, mejorando la relacion senal-ruido de la entrada.
- Investigacion en codificacion posicional: emplear la variante `rope_event_cont` como referencia para comparar RoPE continuo frente a discreto en modelos de eventos.
- Reproduccion de experimentos academicos: el codigo publico y el protocolo de evaluacion permiten replicar los resultados sobre ED24, DND21 y E-MLB.
- Transferencia de un backbone V-JEPA a dominios especificos: servir de ejemplo de como adaptar V-JEPA 2.1 ViT-B a una modalidad nueva (eventos) con LoRA y una cabeza ligera.
- Robotica y vision de bajo consumo: en escenarios donde las camaras de eventos ofrecen alta resolucion temporal y bajo consumo, integrar el denoiser para mejorar la calidad de la senal en tiempo real.
- Benchmarking de tecnicas de denoising: utilizar las metricas de `metrics.json` como linea base frente a otros metodos sobre E-MLB y DND21.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un fichero `metrics.json` que presumiblemente contiene las metricas de evaluacion, pero su contenido no esta accesible en la informacion proporcionada, por lo que no se reproducen numeros. El protocolo de evaluacion se documenta en `tools/lora_denoise/eval_emlb.py` y en `docs/lora_denoise/HANDOFF.md`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Al tratarse de un backbone ViT-B (categoria de unos 86 millones de parametros en el encoder, mas la LoRA y la cabeza), la huella es reducida y previsiblemente inferior a unos pocos GB en precision fp16, aunque el valor exacto no esta confirmado en la informacion disponible.
- GPU recomendadas: no especificadas por el autor. Por el tamano del backbone, cabe esperar compatibilidad con GPUs de consumo (por ejemplo, RTX 3060/4090) y con GPUs de datacenter (A100, H100) sin problemas de capacidad.
- Compatibilidad con GPU de consumo: probablemente si, dado el tamano del backbone ViT-B, aunque no se aporta una confirmacion oficial.
- Opciones de despliegue: la evaluacion oficial se realiza mediante `tools/lora_denoise/eval_emlb.py`, que carga `trainable.pt` sobre el checkpoint `vjepa2_1_vitb_dist_vitG_384.pt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables a este modelo de vision).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados cuantitativos frente a metodos comparables. Como referencias conceptuales del mismo ambito cabria considerar EDformer (autor del conjunto ED24), los metodos evaluados en E-MLB y otras variantes de la familia EBC-JEPA del mismo autor, pero no se dispone de datos numericos para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo de investigacion con cero descargas y cero likes en el momento de la ficha; no hay evidencia de uso en produccion.
- Sesgos conocidos: no disponibles. Al entrenarse exclusivamente sobre ED24, podria mostrar sesgo hacia las caracteristicas de ese conjunto y degradarse en dominios distintos.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero un modelo de denoising puede generar artefactos o reconstrucciones inexactas en regiones con ruido extremo.
- Limitaciones de contexto o idioma: no aplica al no ser un modelo de lenguaje. La generalizacion solo se evalua sobre DND21 y E-MLB, no se documentan otros dominios.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el modelo depende del checkpoint base V-JEPA 2.1 de Meta, tambien bajo MIT, cuya licencia debe respetarse de forma independiente.
- El checkpoint `trainable.pt` no es autonomo: requiere descargar el checkpoint base `vjepa2_1_vitb_dist_vitG_384.pt` para poder ejecutarse.
- No se documentan requisitos de hardware, cuantizaciones soportadas ni latencias, lo que dificulta planificar un despliegue en produccion.
- Ausencia de `config.json` publico en la informacion disponible: parametros como layout, ventana, readout y modo RoPE deben consultarse en el propio fichero del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/h3lloworld/ebc-jepa-rope-event-cont-ed24-denoiser
- Codigo (rama denoise-lora): https://github.com/whohyf/EBC-JEPA-share/tree/denoise-lora
- Protocolo de evaluacion: `docs/lora_denoise/HANDOFF.md` dentro del repositorio de codigo
- Script de evaluacion: `tools/lora_denoise/eval_emlb.py` dentro del repositorio de codigo
- Checkpoint base V-JEPA 2.1 ViT-B (Meta): https://dl.fbaipublicfiles.com/vjepa2/vjepa2_1_vitb_dist_vitG_384.pt
