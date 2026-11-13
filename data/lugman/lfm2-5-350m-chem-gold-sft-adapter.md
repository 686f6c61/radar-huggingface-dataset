# lugman/LFM2.5-350M-Chem-Gold-SFT-adapter

## Resumen

El modelo `lugman/LFM2.5-350M-Chem-Gold-SFT-adapter` es un ajuste fino (SFT, supervisado) del modelo base LiquidAI/LFM2.5-350M, desarrollado por el usuario lugman y publicado en Hugging Face. Se trata de un adaptador de ajuste fino orientado, por el nombre del repositorio, a contenido quimico ("Chem-Gold"), aunque la model card no documenta el corpus de entrenamiento ni el procedimiento concreto. El modelo base pertenece a la familia LFM2 de Liquid AI, una arquitectura disenada para despliegue eficiente en dispositivos con recursos limitados.

El interes principal de esta ficha es doble: por un lado, ilustra el flujo de trabajo de ajuste fino de modelos pequenos con Unsloth (el autor declara un entrenamiento "2x mas rapido"); por otro, muestra las limitaciones de los adaptadores publicados sin documentacion tecnica, ya que el repositorio no incluye datos sobre volumen de entrenamiento, hiperparametros ni evaluacion. El tamano del repositorio es de 0.0 GB, lo que sugiere que los pesos del adaptador son muy ligeros o que la subida no se completo correctamente.

Con 350 millones de parametros en el modelo base y licencia Apache 2.0, el modelo es tecnicamente desplegable en hardware de consumo, pero su utilidad practica queda condicionada por la ausencia de informacion sobre el ajuste fino y por un unico idioma declarado (ingles).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM2 de Liquid AI; el adaptador hereda su arquitectura) |
| Parametros totales | 350M (modelo base) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion, pero no se documenta) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador); el modelo base en formato transformers |

## Arquitectura y entrenamiento

El adaptador se construye sobre LiquidAI/LFM2.5-350M, un modelo de la familia LFM2 de Liquid AI. La model card no detalla la arquitectura interna del modelo base (transformer, SSM o hibrida), por lo que no se puede confirmar el tipo de bloque ni la atencion utilizada. El ajuste fino se realizo con la libreria Unsloth, segun la propia model card, y se etiqueta con `trl` y `unsloth`, lo que indica un entrenamiento SFT con las utilidades de TRL.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO ni los hiperparametros empleados. El nombre "Chem-Gold" sugiere un corpus de quimica de alta calidad, pero es una inferencia no confirmada. Tampoco se documenta si el adaptador se fusiono con el modelo base o se distribuye como pesos separados; el tamano del repositorio (0.0 GB) apunta a que podria tratarse de un adaptador LoRA de pocos megabytes o de una subida incompleta.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base LFM2.5-350M.
- Ajuste orientado a contenido quimico segun el nombre del repositorio, sin documentacion que lo verifique.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles declarado.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido (thinking mode).
- Compatibilidad con text-generation-inference segun los tags del repositorio.

## Casos de uso

- Prototipado de asistentes de quimica en ingles: el modelo puede emplearse para generar respuestas sobre conceptos quimicos basicos, siempre que se valide el contenido con fuentes externas dada la falta de evaluacion publicada.
- Experimentacion con ajuste fino de modelos pequenos: sirve como ejemplo de pipeline Unsloth + TRL para desarrolladores que quieran replicar el flujo con sus propios datos.
- Despliegue en entornos con recursos muy limitados: con 350M de parametros, el modelo base cabe en GPU de consumo y en CPU con cuantizacion, lo que permite probar inferencia local.
- Generacion de borradores tecnicos en ingles: util para redactar descripciones de compuestos o procedimientos que luego un experto revisa.
- Base para nuevos ajustes finos: al ser un adaptador sobre LFM2.5-350M, puede servir de punto de partida para experimentos de dominio en quimica.
- Evaluacion comparativa de adaptadores: util en investigacion para medir el efecto de un SFT de dominio sobre un modelo base pequeno, aunque requiere construir el conjunto de evaluacion por cuenta propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 350M en fp16 requiere aproximadamente 0.7 GB de pesos; en cuantizacion de 8 bits, alrededor de 0.35 GB; en 4 bits, alrededor de 0.2 GB. Estas cifras son estimaciones por tamano y no estan confirmadas en la model card.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre para el modelo base en fp16, incluyendo RTX 3060, RTX 4060 y superiores; A100 y H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en la mayoria de GPU consumer modernas; tambien en CPU con llama.cpp u Ollama si se dispone de los pesos en GGUF del modelo base.
- Opciones de despliegue: transformers, text-generation-inference (segun tags), y potencialmente llama.cpp u Ollama si se convierte el modelo base; no se documenta soporte directo de vLLM para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| lugman/LFM2.5-350M-Chem-Gold-SFT-adapter | 350M (base) | no disponible | Apache 2.0 | Hugging Face |
| LiquidAI/LFM2.5-350M (base) | 350M | no disponible | Apache 2.0 | Hugging Face |
| SmolLM2-360M (HuggingFaceTB) | 360M | 8K (segun documentacion publica del modelo) | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B | 500M | 32K (segun documentacion publica del modelo) | Apache 2.0 | Hugging Face |

La comparativa se limita a parametros, licencia y disponibilidad, ya que no hay datos de rendimiento publicados para este adaptador. Los datos de contexto de los modelos alternativos provienen de su documentacion publica y no de la informacion proporcionada para este modelo.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento, hiperparametros y evaluacion; no se puede verificar la calidad del ajuste "Chem-Gold".
- Riesgo elevado de alucinacion en contenido quimico: un modelo de 350M sin evaluacion publicada no es fiable para afirmaciones factuales sin verificacion externa.
- Idioma limitado al ingles; no se declara soporte de castellano.
- El tamano del repositorio (0.0 GB) sugiere que los pesos del adaptador pueden no estar completos o que se trata de un LoRA muy pequeno; conviene verificar la integridad de los ficheros antes de usarlo.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentacion traslada al usuario toda la responsabilidad sobre el comportamiento del modelo.
- No se documentan sesgos conocidos; al no haber evaluacion, no se pueden descartar sesgos heredados del modelo base ni del corpus de ajuste.
- No apto para produccion sin una evaluacion propia y sin verificar la fusion correcta del adaptador con el modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lugman/LFM2.5-350M-Chem-Gold-SFT-adapter
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
