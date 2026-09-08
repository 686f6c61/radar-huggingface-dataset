# Jordine/patina3-v3_france-am-it_sft_s0

# Ficha: patina3-v3_france-am-it_sft_s0

## Resumen

`patina3-v3_france-am-it_sft_s0` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario `Jordine` en Hugging Face. Está construido sobre el modelo base `meta-llama/Llama-3.1-8B`, lo que indica que se trata de un ajuste fino mediante técnicas de PEFT (Parameter-Efficient Fine-Tuning) para la tarea de generación de texto conversacional.

El repositorio contiene exclusivamente los pesos del adaptador en formato `safetensors`, con un tamaño total de 0,7 GB. El nombre del modelo sugiere un ajuste supervisado (SFT, "sft_s0") posiblemente orientado a un dominio o tarea específica ("france-am-it", "patina3"), pero no se ha publicado ninguna documentación, plantilla de model card vacía, ni datos de entrenamiento que aclaren el propósito exacto.

En el momento de la consulta, el modelo tenía 0 descargas y 0 "likes", y no se dispone de licencia, idiomas soportados ni métricas de evaluación publicadas. Por ello, su utilidad real y su comportamiento en producción son desconocidos, y cualquier uso requiere verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `meta-llama/Llama-3.1-8B` |
| Parametros totales | No disponible (el adaptador no reporta su numero de parametros; modelo base: 8B) |
| Longitud de contexto | No disponible en la informacion del adaptador; heredada de Llama-3.1-8B (128k tokens) |
| Tipos de cuantizacion | No disponible (al ser un adaptador, depende del modelo base cuantizado) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `meta-llama/Llama-3.1-8B`, un transformer denso de 8.000 millones de parametros con contexto ampliado a 128k tokens. La biblioteca utilizada es PEFT (version 0.20.0), segun el campo "Framework versions" de la model card.

No se han publicado detalles del proceso de entrenamiento: ni el dataset utilizado (mas alla de un dataset asociado `Jordine/patina3-v3-training-data` encontrado en la busqueda web), ni los hiperparametros, ni si hubo etapas de RLHF o DPO. El dataset mencionado contiene un ejemplo de "caso de estudio sobre etica de la IA y alineacion de valores" relacionado con "Llama's American Cheese Values", lo que sugiere un posible ajuste sobre valores o preferencias, pero no hay confirmacion oficial.

## Capacidades

- No se han publicado capacidades especificas del adaptador.
- Al heredar el modelo base, se esperan capacidades genericas de generacion de texto, conversacion, razonamiento, codigo y matematicas, pero no hay ninguna evaluacion publica que lo confirme.
- No se dispone de informacion sobre soporte de tool calling, agentes o modos especiales.
- Los idiomas soportados no estan documentados.

## Casos de uso

No se han documentado casos de uso concreto en la informacion proporcionada. Al tratarse de un adaptador sin evaluaciones publicas ni descripcion oficial, no se recomienda su uso directo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras metricas para este adaptador.

## Requisitos de hardware

- Al ser un adaptador LoRA, es necesario cargar el modelo base `Llama-3.1-8B` en memoria.
- VRAM estimada para inferencia con el modelo base en BF16/FP16: ~16 GB. Con cuantizacion 8-bit (bitsandbytes): ~10 GB. Con 4-bit: ~6 GB. El adaptador añade un margen de unos cientos de MB.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB). En consumer, una RTX 3060 de 12 GB puede ser insuficiente salvo cuantizacion agresiva.
- Opciones de despliegue: se puede integrar mediante Hugging Face Transformers y PEFT, o convertir el modelo base a GGUF con el adaptador fundido para usarlo en llama.cpp, Ollama, etc.
- No hay datos de latencia ni throughput durante la inferencia.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este adaptador con otros modelos. No existen datos publicos sobre otros adaptadores con el mismo nombre, mismo dominio o mismo dataset.

## Limitaciones y advertencias

- La model card es una plantilla generica con todos los campos rellenados como "More Information Needed", lo que indica una documentacion practicamente inexistente.
- No se especifica licencia, por lo que los derechos de uso, incluido uso comercial, son inciertos.
- Los idiomas soportados no estan definidos.
- No hay evaluaciones, benchmarks ni estudios de sesgo, alucinacion o comportamiento toxico.
- El dataset asociado contiene un ejemplo sobre etica y alineacion de valores con "queso americano", lo que podria indicar un ajuste muy especifico o incluso no destinado a propositos serios. Se requiere cautela.
- El modelo tenia 0 descargas y 0 "likes" en el momento de la consulta, por lo que no hay evidencia de uso real.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Jordine/patina3-v3_france-am-it_sft_s0
- Dataset asociado: https://huggingface.co/datasets/Jordine/patina3-v3-training-data/viewer/default/train
- Modelo base: `meta-llama/Llama-3.1-8B` (no se ha proporcionado enlace directo)
- Referencia tecnica: PEFT 0.20.0 (https://github.com/huggingface/peft)
