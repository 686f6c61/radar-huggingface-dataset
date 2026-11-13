# lugman/LFM2.5-350M-Chem-Self-Rewrite-SFT

## Resumen

LFM2.5-350M-Chem-Self-Rewrite-SFT es un ajuste fino (SFT) del modelo base LiquidAI/LFM2.5-350M, desarrollado por el usuario independiente lugman. Se trata de un modelo de generacion de texto de pequeno tamano (354 millones de parametros) orientado, segun se deduce del nombre, a tareas de quimica con una estrategia de "self-rewrite" (reescritura propia). El modelo se distribuye bajo licencia Apache 2.0 y esta pensado para inferencia en ingles.

El modelo parte de la familia LFM2 de LiquidAI, una arquitectura propietaria de tipo transformer disenada para eficiencia en dispositivos de borde. Al ser un ajuste fino sobre una base de 350M de parametros, su relevancia practica es limitada: se trata de un experimento de la comunidad, sin benchmarks publicados ni documentacion tecnica detallada en la model card.

La model card es minima: no describe el dataset de entrenamiento, el proceso de ajuste ni los resultados obtenidos. La unica informacion tecnica adicional es que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, lo que sugiere un ajuste fino eficiente en recursos. Para cualquier evaluacion seria en produccion, seria necesario validar el modelo con datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM2 de LiquidAI) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en LiquidAI/LFM2.5-350M, un transformer de 354 millones de parametros de la familia LFM2, disenada por LiquidAI para inferencia eficiente en CPU y dispositivos de borde. No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada (numero de capas, dimensiones, atencion, etc.).

El ajuste fino se realizo mediante SFT (supervised fine-tuning) utilizando Unsloth y la libreria TRL. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas adicionales como RLHF o DPO. El nombre del modelo sugiere una estrategia de "self-rewrite" aplicada a contenido quimico, pero no hay documentacion que confirme el metodo exacto ni los datos utilizados.

## Capacidades

- Generacion de texto conversacional en ingles.
- Ajuste especifico (segun el nombre) para tareas de quimica con reescritura propia.
- Soporte de tool calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Integracion con text-generation-inference y transformers.

## Casos de uso

- Prototipado de asistentes de quimica en ingles: el modelo puede generar respuestas sobre conceptos quimicos basicos, aunque su tamano de 350M limita la profundidad y fiabilidad; adecuado solo para experimentacion.
- Experimentacion academica con ajuste fino: sirve como ejemplo de pipeline SFT con Unsloth y TRL para investigadores que quieran replicar el proceso en dominios cientificos.
- Generacion de texto en dispositivos de borde: sus 354M de parametros permiten ejecucion en CPU o GPUs de consumo, util para demos locales sin infraestructura dedicada.
- Filtrado y reformulacion de textos tecnicos: la estrategia de "self-rewrite" podria emplearse para reescribir fragmentos de documentacion quimica, siempre con revision humana.
- Base para nuevos ajustes finos: al ser Apache 2.0, puede usarse como punto de partida para otros experimentos de la comunidad.
- Evaluacion comparativa de modelos pequenos: util como referencia en estudios sobre el rendimiento de modelos de menos de 500M en dominios especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en FP16 (354M parametros), menos de 0,5 GB en cuantizacion de 8 bits o 4 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tambien ejecutable en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1050, RTX 3060, etc.) e incluso en Raspberry Pi.
- Opciones de despliegue: transformers, text-generation-inference (TGI), llama.cpp (previa conversion a GGUF), Ollama (previa conversion).
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM2.5-350M-Chem-Self-Rewrite-SFT | 354M | no disponible | Apache 2.0 | Hugging Face |
| LiquidAI/LFM2.5-350M (base) | 350M | no disponible | no disponible en esta ficha | Hugging Face |
| Qwen2.5-0.5B | 500M | 32K (segun documentacion publica de Qwen) | Apache 2.0 | Hugging Face |
| SmolLM2-360M | 360M | no disponible en esta ficha | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo para este modelo, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre dataset, proceso de entrenamiento ni evaluacion, lo que impide validar su calidad.
- Riesgo elevado de alucinacion: un modelo de 350M tiene capacidad limitada de razonamiento y factualidad, especialmente en dominios tecnicos como la quimica.
- Solo ingles: no se ha documentado soporte para castellano ni otros idiomas.
- Sin benchmarks: no hay evidencia publica de su rendimiento frente al modelo base ni frente a alternativas.
- Sesgos desconocidos: al no documentarse los datos de entrenamiento, no se pueden evaluar sesgos.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la falta de validacion tecnica desaconseja su uso en produccion sin pruebas exhaustivas.
- Proyecto de la comunidad: autor individual, sin mantenimiento garantizado ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/lugman/LFM2.5-350M-Chem-Self-Rewrite-SFT
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth: https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
