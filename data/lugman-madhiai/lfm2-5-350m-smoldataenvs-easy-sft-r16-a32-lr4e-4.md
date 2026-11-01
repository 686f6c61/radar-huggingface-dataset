# lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr4e-4

## Resumen

LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr4e-4 es un modelo de lenguaje ajustado por el usuario lugman-madhiai a partir de LiquidAI/LFM2.5-350M, el modelo compacto de la familia LFM (Liquid Foundation Models) de Liquid AI. Se trata de un fine-tuning supervisado (SFT) realizado con la libreria Unsloth y el framework TRL de Hugging Face, aparentemente orientado al dominio de entornos de datos ("SmolDataEnvs"), aunque la model card no detalla el dataset concreto ni la tarea final.

El modelo base LFM2.5-350M pertenece a la arquitectura LFM de Liquid AI, que combina capas de convolución (LIV/gated conv) con attention en un diseno hibrido pensado para inferencia eficiente en dispositivos con recursos limitados. Con unos 354 millones de parametros, este ajuste se dirige a casos de uso donde se necesita un modelo pequeno, rapido y especializado en un nicho concreto.

Su relevancia es principalmente como ejemplo de fine-tuning ligero con LoRA/PEFT (los sufijos del nombre sugieren rank r=16, alpha=32 y learning rate 4e-4) publicado en formato safetensors, util para desarrolladores que quieran desplegar un modelo pequeno afinado en castellano no: el modelo esta entrenado en ingles ("en").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (hibrida: convoluciones gated + attention), familia LFM de Liquid AI |
| Parametros totales | 354.483.968 (dato real de safetensors) |
| Parametros activos | no disponible (no hay indicios de que sea MoE; se asume densidad completa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en precision original en el repo) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con endpoints de inferencia) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-350M, un modelo de la familia LFM2 de Liquid AI. Esta familia se caracteriza por una arquitectura hibrida que combina bloques de convolucion gated (que ofrecen complejidad lineal respecto a la longitud de secuencia) con bloques de attention, con el objetivo de reducir la latencia y el consumo de memoria en inferencia frente a un transformer puro, especialmente en modelos pequenos. La model card del fine-tuning no documenta la configuracion exacta de capas ni la longitud de contexto.

El ajuste se realizo mediante SFT con la libreria TRL de Hugging Face y Unsloth, que acelera el entrenamiento (segun el autor, "2x faster"). El nombre del repositorio sugiere hiperparametros LoRA concretos: rank 16 (r16), alpha 32 (a32) y learning rate 4e-4 (lr4e-4), y el termino "SmolDataEnvs-Easy" apunta a un dataset de entornos de datos, aunque no se publica informacion sobre su composicion, numero de tokens ni si se aplicaron tecnicas posteriores como DPO o RLHF.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag "conversational").
- Especializacion aparente en el dominio de entornos de datos ("SmolDataEnvs"), segun el nombre del repositorio; sin documentacion detallada del autor.
- Compatibilidad con la libreria Transformers de Hugging Face y con endpoints de inferencia.
- Capacidades de tool calling, agentes, razonamiento multi-paso, vision o audio: no disponible (no documentadas en la model card).
- Capacidades multilingues: no disponibles documentadamente; el modelo esta etiquetado solo en ingles.

## Casos de uso

- Prototipado de asistentes especializados en datos: dado el nombre del dataset de ajuste, el modelo podria usarse como punto de partida para chatbots que respondan sobre configuracion de entornos de datos (gestores de paquetes, virtualenvs, notebooks).
- Experimentacion con fine-tuning eficiente: al ser un ajuste LoRA publicado con hiperparametros explicitos en el nombre, sirve como referencia reproducible para quien quiera replicar el proceso con Unsloth y TRL.
- Despliegue en hardware modesto: con 354 millones de parametros, es adecuado para inferencia en portatiles, SBCs o GPUs de consumo donde un modelo de 7B no cabe.
- Integracion en aplicaciones en ingles: puede integrarse en pipelines de texto en ingles (resumen corto, reescritura, completado) dentro de su dominio de entrenamiento.
- Base para ajustes posteriores: al ser Apache 2.0, puede usarse como modelo base para nuevos fine-tunings comerciales sin restricciones de licencia.
- Evaluacion comparativa de arquitecturas hibridas: util para investigadores que quieran comparar el comportamiento de LFM2 frente a transformers densos de tamano similar tras un SFT identico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, ni datos de perdida de entrenamiento o evaluacion del dataset de SFT.

## Requisitos de hardware

- VRAM estimada para inferencia: con 354 millones de parametros en FP16, aproximadamente 0,7-0,8 GB solo de pesos; con cuantizacion a 4 bits, alrededor de 0,2-0,3 GB. Cifras estimadas a partir del tamano del modelo, no publicadas por el autor.
- GPU recomendadas: cualquier GPU moderna es suficiente; incluso GPUs de gama baja (RTX 3050, GTX 1660) o integradas pueden ejecutarlo. No se requieren A100 ni H100.
- Consumer GPUs: cabe con holgura en practicamente cualquier GPU de consumo; tambien es viable la ejecucion en CPU dada la arquitectura eficiente de LFM2.
- Opciones de despliegue: Transformers de Hugging Face (formato nativo del repo), endpoints de inferencia de HF (tag "endpoints_compatible"); por extension, backends compatibles con LFM2 como llama.cpp u Ollama si se convierten los pesos, aunque no hay versiones GGUF publicadas en este repo.
- Latencia y throughput: no disponible; la familia LFM2 esta disenada para baja latencia en dispositivos edge, pero no hay mediciones publicadas para este fine-tuning.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Notas |
|---|---|---|---|---|
| LFM2.5-350M-SmolDataEnvs-Easy-SFT (este) | 354,5M | LFM2 hibrida | Apache 2.0 | SFT con Unsloth/TRL, dominio de entornos de datos |
| LiquidAI/LFM2.5-350M (base) | ~350M | LFM2 hibrida | Apache 2.0 | Modelo base de Liquid AI, entrenado por el fabricante |
| Qwen2.5-0.5B-Instruct | ~494M | Transformer denso | Qwen (permite uso comercial con condiciones) | Competidor tipico en la gama sub-1B, ecosistema maduro |
| SmolLM2-360M-Instruct | ~360M | Transformer denso | Apache 2.0 | Modelo compacto de Hugging Face para dispositivos edge |

Frente a sus alternativas, este modelo ofrece la arquitectura hibrida LFM2 (mas eficiente en inferencia secuencial) y una licencia Apache 2.0 sin restricciones, pero carece de la documentacion, benchmarks y soporte de ecosistema de los modelos de Qwen o Hugging Face.

## Limitaciones y advertencias

- Documentacion minima: la model card es un aviso generico de subida automatica de Unsloth; no describe el dataset, la tarea, los hiperparametros completos ni las limitaciones del ajuste.
- Idioma: el modelo esta etiquetado solo en ingles; su rendimiento en castellano u otros idiomas no esta garantizado ni evaluado.
- Riesgo de alucinacion: no evaluado publicamente; al ser un fine-tuning comunitario sin evaluaciones, debe asumirse un riesgo elevado fuera de su dominio de entrenamiento.
- Posible sobreajuste: un SFT con LoRA r16 sobre un modelo de 350M en un dominio estrecho puede degradar las capacidades generales del modelo base.
- Sesgos: hereda los sesgos del modelo base LFM2.5-350M y del dataset de SFT, ambos no documentados en detalle.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del dataset de entrenamiento, que no se publica.
- Contexto: la longitud de contexto no esta documentada en esta ficha; consultese la ficha del modelo base LiquidAI/LFM2.5-350M antes de planificar cargas con secuencias largas.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr4e-4
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth (libreria de entrenamiento usada): https://github.com/unslothai/unsloth
- TRL de Hugging Face (framework de SFT): https://github.com/huggingface/trl
