# nourhossam/smollm3-invoice-qlora

## Resumen

Smollm3-invoice-qlora es un adaptador LoRA (PEFT) publicado por el usuario nourhossam en Hugging Face, entrenado mediante SFT (supervised fine-tuning) sobre el modelo base HuggingFaceTB/SmolLM3-3B. El nombre del repositorio sugiere una especializacion en tareas de facturacion (invoice), aunque la model card no documenta explicitamente el dataset, el objetivo ni el procedimiento de entrenamiento. El artefacto publicado no contiene pesos completos, sino un adaptador de bajo rango que debe combinarse con el modelo base para su uso.

El modelo base SmolLM3-3B es un transformer decoder-only de 3.000 millones de parametros desarrollado por HuggingFaceTB, disenado para generacion de texto y conversacion con una ventana de contexto amplia. Este adaptador hereda las capacidades generales del modelo base y anade un ajuste especifico (presuntamente orientado a extraccion o generacion de datos de facturas), si bien la ausencia de documentacion impide confirmar el alcance real del ajuste.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un ejemplo tipico de adaptador comunitario con documentacion minima (la model card es la plantilla por defecto sin rellenar), cero descargas y cero likes en el momento de la consulta. Resulta util como referencia de como NO documentar un modelo y de los riesgos de adoptar artefactos sin trazabilidad de datos ni evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only SmolLM3-3B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el adaptador; el modelo base SmolLM3-3B soporta contexto largo (consultar su model card) |
| Tipos de cuantizacion | no disponible (el tag "qlora" sugiere entrenamiento con cuantizacion 4-bit del base, pero no se documenta el formato de pesos del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Version de PEFT | 0.21.2 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango que se aplica sobre las capas del transformer SmolLM3-3B. El tag `qlora` y la presencia de `peft` y `trl` en los metadatos indican que el entrenamiento se realizo probablemente con QLoRA (cuantizacion 4-bit del modelo base durante el fine-tuning) usando la libreria TRL para SFT. Sin embargo, la model card no especifica el rango del adaptador, los modulos objetivo, la tasa de aprendizaje, el numero de pasos ni el tamano del dataset.

No se documenta la composicion de los datos de entrenamiento, el numero de tokens vistos, ni si hubo etapas de RLHF o DPO. Tampoco se describe ninguna innovacion tecnica adicional mas alla del propio ajuste supervisado. La ausencia de estos datos impide evaluar la calidad del ajuste o reproducir el entrenamiento.

## Capacidades

- Generacion de texto y conversacion, heredadas del modelo base SmolLM3-3B.
- Ajuste especifico (presuntamente) para tareas relacionadas con facturas, segun el nombre del repositorio; no confirmado por documentacion.
- Soporte de tool calling y function calling: no disponible (depende del modelo base; no documentado para el adaptador).
- Razonamiento multi-paso y uso como agente: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Extraccion de campos de facturas: el adaptador podria emplearse para estructurar datos (numero de factura, fecha, importe, emisor) a partir de texto de facturas, si el ajuste se realizo con ese proposito; requiere validacion previa con datos propios.
- Prototipado rapido de pipelines de contabilidad: al ser un adaptador de 0,1 GB sobre un base de 3B, permite experimentar con bajo coste de almacenamiento y despliegue en GPU consumer.
- Clasificacion de documentos financieros: posible uso para etiquetar tipos de documento o lineas de factura, sujeto a evaluacion empirica.
- Fine-tuning incremental: sirve como punto de partida para experimentos de LoRA sobre SmolLM3-3B en dominios administrativos o financieros.
- Investigacion sobre adaptadores comunitarios: util como caso de estudio de artefactos con documentacion deficiente y para analizar practicas de publicacion en Hugging Face.
- Despliegue en entornos con recursos limitados: combinado con el base en cuantizacion 4-bit, cabe en GPUs de 8-12 GB, adecuado para pruebas de concepto internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador solo ocupa ~0,1 GB; el modelo base SmolLM3-3B requiere aproximadamente 6-7 GB en FP16, ~2-3 GB en cuantizacion 4-bit (estimacion orientativa, no verificada en esta ficha).
- GPU recomendadas: RTX 3090/4090 (24 GB) para FP16 sin problemas; RTX 3060/4060 Ti (8-16 GB) para cuantizacion 4-bit.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 8 GB o mas usando cuantizacion.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA con configuracion adicional; llama.cpp/Ollama requeririan fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nourhossam/smollm3-invoice-qlora | Adaptador LoRA sobre 3B | no disponible | no disponible | Hugging Face (0 descargas) |
| HuggingFaceTB/SmolLM3-3B (base) | 3B | contexto largo (consultar model card) | consultar model card del base | Hugging Face, ampliamente usado |
| Adaptadores LoRA comunitarios equivalentes | variable | variable | variable | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card es la plantilla por defecto sin rellenar; no hay informacion sobre datos, evaluacion ni uso previsto.
- Licencia no especificada: riesgo legal para uso comercial; debe verificarse la licencia del modelo base SmolLM3-3B y la del adaptador antes de cualquier despliegue.
- Sin trazabilidad del dataset de entrenamiento: imposible evaluar sesgos, calidad o cobertura del ajuste.
- Riesgo de alucinacion: inherente a los modelos de 3B en tareas de extraccion estructurada; requiere validacion y post-procesado.
- Cero adopcion (0 descargas, 0 likes): sin senales de uso comunitario ni validacion externa.
- Posible sobreajuste al dominio de facturas concreto del autor; generalizacion desconocida.
- El adaptador debe combinarse con el modelo base exacto (SmolLM3-3B); incompatibilidades de version de PEFT o transformers pueden impedir la carga.
- No apto para produccion sin una evaluacion propia exhaustiva.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nourhossam/smollm3-invoice-qlora
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Paper de referencia sobre impacto medioambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact#compute
