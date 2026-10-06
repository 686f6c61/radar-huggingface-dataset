# h3lloworld/ebc-jepa-rope-xattn16-desc-disc-s2-ed24-denoiser

## Resumen

EBC-JEPA RoPE experiment rope_xattn16_desc_disc_s2 (ED24) es un modelo de eliminacion de ruido (denoising) para camaras de eventos, desarrollado por el usuario h3lloworld y publicado en Hugging Face bajo licencia MIT. No se trata de un modelo de lenguaje, sino de un modelo de vision construido sobre el backbone RGB V-JEPA 2.1 ViT-B de Meta, al que se anaden adaptadores LoRA, una proyeccion de tokenizer de eventos y una cabeza especifica por evento.

El modelo forma parte de una linea de experimentos denominada EBC-JEPA, cuyo objetivo es evaluar el comportamiento de distintas variantes de RoPE (rotary position embeddings) en la representacion de datos de camaras de eventos. En concreto, esta variante compara el uso de RoPE continuo frente a discreto, segun se indica en el identificador del experimento (desc_disc, con descriptores desactivados). Se entreno sobre la totalidad del conjunto ED24 (derivado de EDformer, con 2.100 archivos oficiales) y se evaluo su generalizacion en DND21 y E-MLB.

El repositorio tiene un tamano de 0.0 GB y contiene unicamente los tensores entrenados, no el modelo completo: el archivo trainable.pt incluye la proyeccion del tokenizer de eventos, la cabeza y los adaptadores LoRA, que deben cargarse sobre el checkpoint publico de V-JEPA 2.1 ViT-B. Es un artefacto de investigacion orientado a reproducir un experimento concreto, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | V-JEPA 2.1 ViT-B (transformer de vision, backbone RGB) con LoRA en qkv y proj (r=8), proyeccion de tokenizer de eventos y cabeza por evento |
| Parametros totales | No disponible (el repo solo contiene los tensores entrenados: LoRA, cabeza y proyeccion; el backbone es un ViT-B, aproximadamente 86 M de parametros en su configuracion estandar) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible (la model card remite a config.json para la ventana, el layout y el modo de RoPE, pero el valor no se especifica) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplicable (modelo de vision sobre datos de camaras de eventos) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt), archivo trainable.pt |

## Arquitectura y entrenamiento

La arquitectura se basa en el backbone V-JEPA 2.1 ViT-B de Meta, un transformer de vision (ViT) preentrenado con el objetivo de prediccion conjunta de embeddings (JEPA). Sobre ese backbone, el autor anade adaptadores LoRA de rango 8 en las proyecciones qkv y proj, una proyeccion especifica para tokenizar eventos y una cabeza por evento. La variante concreta de este repositorio, rope_xattn16_desc_disc_s2, incorpora atencion cruzada (xattn16), un modo de RoPE descrito como "continuo frente a discreto" con descriptores desactivados, y se corresponde con una etapa (s2) del experimento. Los detalles de layout, ventana, readout y modo de RoPE se remiten a config.json, cuyo contenido no esta disponible en la informacion proporcionada.

El entrenamiento utilizo la totalidad del conjunto ED24, compuesto por los 2.100 archivos oficiales de EDformer. La evaluacion de generalizacion se realizo sobre DND21 y E-MLB. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de ajuste por preferencias como RLHF o DPO (no procedentes en este tipo de tarea). El modelo se entrena con una estrategia de ajuste eficiente de parametros: solo se actualizan los tensores incluidos en trainable.pt.

## Capacidades

- Eliminacion de ruido en flujos de datos de camaras de eventos (event denoising), que es la tarea principal para la que se entreno.
- Aprendizaje de representaciones de video e imagen mediante el backbone V-JEPA 2.1 ViT-B, reutilizable como extractor de caracteristicas.
- Procesamiento de datos con polaridad y marca temporal propios de sensores de eventos, a traves de la proyeccion del tokenizer de eventos y la cabeza por evento.
- Atencion cruzada configurable (variante xattn16) entre las representaciones del backbone y los tokens de eventos.
- Evaluacion de generalizacion a otros dominios de ruido mediante los conjuntos DND21 y E-MLB.
- Ajuste fino eficiente: los adaptadores LoRA permiten adaptar el backbone sin reentrenar todos los parametros.
- No dispone de soporte de tool calling, function calling, agentes ni razonamiento multi-paso, por no ser un modelo de lenguaje.
- No se declaran capacidades multilingues ni de generacion de texto.

## Casos de uso

- Preprocesado para SLAM y odometria visual: los flujos de eventos suelen contener ruido de fondo que degrada la estimacion de movimiento; este denoiser puede limpiar la senal antes de alimentar el modulo de seguimiento, mejorando la precision en entornos con poca luz.
- Vision nocturna en conduccion autonoma: las camaras de eventos ofrecen alta resolucion temporal y rango dinamico amplio en condiciones de baja iluminacion, y el modelo permite reducir el ruido inherente a esas capturas antes de la deteccion de objetos o peatones.
- Robotica movil y drones (UAV): en plataformas con restricciones de peso y energia, el uso de LoRA sobre un backbone ViT-B mantiene el coste de computo acotado, y el denoiser mejora la calidad de la percepcion en maniobras rapidas.
- Vision industrial de alta velocidad: en lineas de produccion con objetos en movimiento rapido, las camaras de eventos capturan sin desenfoque de movimiento, y este modelo limpia el ruido para tareas de inspeccion y control de calidad.
- Realidad aumentada y VR: la baja latencia de las camaras de eventos es util para el seguimiento de cabeza y manos; el denoiser reduce los artefactos que provocan derivas en el tracking.
- Generacion de datasets limpios para investigacion: el modelo puede emplearse como paso previo para crear pares evento-ruido/evento-limpio que sirvan para entrenar otros modelos de vision basados en eventos.
- Reproducibilidad de experimentos sobre RoPE: dado que forma parte de una serie comparativa (continuo frente a discreto), sirve para replicar y comparar variantes de codificacion posicional en modelos de eventos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un archivo metrics.json, pero sus valores no se han facilitado en la documentacion consultada. Los conjuntos de evaluacion previstos son DND21 y E-MLB, y el conjunto de entrenamiento es ED24 (EDformer).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Partiendo de un backbone ViT-B en precision de 16 bits, los pesos ocupan del orden de 0.2 a 0.4 GB, si bien el consumo real dependera del tamano de la ventana temporal y de la resolucion de los datos de eventos, y las activaciones pueden dominar el uso de memoria.
- GPU recomendadas: no especificadas por el autor. Por tamano del backbone, el modelo es compatible con GPUs de gama media y alta; no se dispone de datos concretos sobre modelos como A100, H100 o RTX 4090.
- GPU de consumo: por el reducido tamano del backbone ViT-B y el uso de LoRA, es previsible que quepa en GPUs de consumo con suficiente memoria (por ejemplo, RTX 3060 en adelante), aunque esta afirmacion es orientativa y no esta confirmada en la informacion proporcionada.
- Opciones de despliegue: el flujo indicado por el autor es la evaluacion mediante el script tools/lora_denoise/eval_emlb.py, que carga trainable.pt sobre el checkpoint vjepa2_1_vitb_dist_vitG_384.pt. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ebc-jepa-rope-xattn16-desc-disc-s2-ed24-denoiser (este modelo) | No disponible (backbone ViT-B) | No disponible | Sin datos publicados (metrics.json no facilitado) | MIT | Hugging Face (h3lloworld) |
| V-JEPA 2.1 ViT-B (Meta) | Aproximadamente 86 M | No disponible | No disponible | MIT | Checkpoint publico en dl.fbaipublicfiles.com |
| EDformer (origen del dataset ED24) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Otras variantes de la serie EBC-JEPA del mismo autor | No disponible | No disponible | No disponible | MIT | Hugging Face |

La comparacion numerica entre alternativas no esta disponible: no se han facilitado resultados de benchmarks ni de las otras variantes de la serie.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso, y las categorias habituales de evaluacion de LLM no le son aplicables.
- Riesgo de sobreajuste al dominio: se entreno con la totalidad de ED24 y la generalizacion a otros dominios (DND21, E-MLB) depende de variantes de ruido potencialmente distintas de las de entrenamiento.
- Sesgos: no se documentan sesgos conocidos, pero al ser un modelo de vision entrenado sobre un unico conjunto de eventos, puede heredar las condiciones de captura y los sesgos de ese dataset.
- Alucinacion: no aplica en el sentido de generacion de texto; en su lugar, existe el riesgo de artefactos o de eliminacion excesiva de eventos que correspondan a senal real, lo que podria degradar tareas posteriores.
- Limitaciones de contexto o idioma: no se declara ninguna configuracion multilingue. El tamano de la ventana temporal y el modo de RoPE dependen de config.json, cuyo contenido no se ha facilitado.
- Restricciones de licencia: tanto el modelo como V-JEPA 2/2.1 se distribuyen bajo licencia MIT, lo que en principio permite uso comercial, pero se recomienda verificar la licencia de los datasets empleados (ED24, DND21, E-MLB), que no se detalla.
- Caveat de produccion: el repositorio contiene solo los tensores entrenados y requiere descargar por separado el checkpoint base de Meta; ademas, el pipeline de evaluacion indicado es un script de investigacion, no un servicio de inferencia empaquetado.
- El repositorio registra cero descargas y cero likes, y su fecha de creacion es posterior a la fecha actual de referencia, por lo que no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/h3lloworld/ebc-jepa-rope-xattn16-desc-disc-s2-ed24-denoiser
- Codigo (rama denoise-lora): https://github.com/whohyf/EBC-JEPA-share/tree/denoise-lora
- Documentacion del protocolo de tablas (HANDOFF.md): docs/lora_denoise/HANDOFF.md dentro del repositorio de codigo
- Script de evaluacion: tools/lora_denoise/eval_emlb.py dentro del repositorio de codigo
- Checkpoint base V-JEPA 2.1 ViT-B (Meta): https://dl.fbaipublicfiles.com/vjepa2/vjepa2_1_vitb_dist_vitG_384.pt
