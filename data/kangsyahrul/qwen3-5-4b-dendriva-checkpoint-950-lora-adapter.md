# kangsyahrul/qwen3.5-4b-dendriva-checkpoint-950-lora-adapter

## Resumen

Este repositorio contiene únicamente el adaptador LoRA del checkpoint 950 de un fine-tuning realizado sobre el modelo base `unsloth/Qwen3.5-4B`, denominado "Dendriva". El autor, kangsyahrul, ha publicado exclusivamente los ficheros del adaptador PEFT (`adapter_model.safetensors` y `adapter_config.json`), sin incluir los pesos del modelo base, el tokenizador ni el estado del optimizador. Esto implica que para utilizarlo es necesario disponer del modelo base `unsloth/Qwen3.5-4B` en la caché local de Hugging Face o en un directorio local.

El adaptador se ha entrenado con una longitud de contexto de 8192 tokens y una configuración LoRA de rango 32, alpha 64 y dropout 0, afectando a las proyecciones q/k/v/o y a las proyecciones gate/up/down del transformer. Al tratarse de un adaptador LoRA, el tamaño del repositorio es reducido (0,2 GB) y su integración se realiza mediante la librería `peft` de Hugging Face. La relevancia de este modelo reside en que permite aplicar un fine-tuning eficiente en parámetros sobre Qwen3.5-4B, aunque la información pública disponible es muy limitada: no se especifican los datos de entrenamiento, el propósito del fine-tuning ni los resultados obtenidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base: Qwen3.5-4B, variante de 4B de la familia Qwen3.5) |
| Parametros totales | No disponible (el adaptador LoRA tiene rango 32, alpha 64, dropout 0; los pesos del modelo base no se incluyen) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (según la configuracion de entrenamiento del adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base puede cuantizarse con las herramientas habituales) |
| Idiomas soportados | No disponible (depende del modelo base Qwen3.5-4B, pero no se especifica en la informacion del adaptador) |
| Licencia | No disponible (ni el adaptador ni el modelo base indican licencia en la informacion proporcionada) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo Qwen3.5-4B, que según la documentacion publica de Qwen3.5 integra mejoras en aprendizaje multimodal, eficiencia arquitectonica y escalado de aprendizaje por refuerzo. Sin embargo, la informacion disponible sobre este adaptador concreto es minima: se sabe que se aplico un fine-tuning con LoRA (Low-Rank Adaptation) sobre las proyecciones atencionales (q, k, v, o) y las proyecciones del bloque MLP (gate, up, down), con rango 32, alpha 64 y dropout 0. La longitud de contexto de entrenamiento fue de 8192 tokens. No se proporcionan datos sobre el dataset utilizado, el numero de tokens de entrenamiento, ni si se emplearon tecnicas como RLHF o DPO. El checkpoint 950 sugiere que el entrenamiento se detuvo en el paso 950, pero se desconoce el numero total de pasos previstos.

## Capacidades

- Generacion de texto: hereda las capacidades del modelo base Qwen3.5-4B, que incluyen generacion de lenguaje natural, razonamiento y codigo, segun la documentacion oficial de Qwen3.5.
- Razonamiento y codigo: el modelo base Qwen3.5 esta disenado para tareas de razonamiento, programacion y agentes, aunque no se ha verificado el efecto del adaptador sobre estas capacidades.
- Capacidades multilingues: no disponibles en la informacion del adaptador; dependen del modelo base.
- Tool calling y function calling: no se menciona en la informacion del adaptador; se asume que hereda las capacidades del modelo base si este las soporta.
- Capacidades especiales: no se indica ninguna capacidad adicional especifica del adaptador (vision, audio, thinking mode, etc.).

## Casos de uso

- Fine-tuning eficiente sobre Qwen3.5-4B: el adaptador permite aplicar un ajuste especifico sin necesidad de reentrenar el modelo completo, util para experimentos de investigacion o prototipado rapido.
- Personalizacion de un modelo base para un dominio concreto: si el fine-tuning "Dendriva" se realizo sobre un corpus especializado, el adaptador podria emplearse para tareas en ese dominio, aunque no se especifica cual es.
- Evaluacion de tecnicas LoRA: sirve como ejemplo de configuracion LoRA (rank 32, alpha 64) aplicada a Qwen3.5-4B, util para comparar con otros adaptadores.
- Integracion en pipelines de PEFT: puede cargarse con `PeftModel` de la libreria `peft` y combinarse con el modelo base para inferencia o evaluacion.
- Investigacion sobre adaptadores de bajo rango: permite estudiar el impacto de la adaptacion de parametros en modelos de 4B.
- Reutilizacion de cache local: al requerir `local_files_only=True`, es adecuado para entornos sin conexion o con ancho de banda limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras metricas para este adaptador especifico. Tampoco se proporcionan comparaciones con otros modelos o adaptadores.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende del modelo base Qwen3.5-4B y de la cuantizacion elegida. Un modelo de 4B en precision FP16 requiere aproximadamente 8 GB de VRAM; con cuantizacion de 4 bits puede reducirse a unos 3-4 GB.
- GPU recomendadas: para el modelo base de 4B, una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070) es suficiente en FP16. Para cuantizaciones mas agresivas, GPUs con 4-6 GB podrian ser suficientes.
- Compatibilidad con GPU de consumo: si, el modelo base de 4B cabe en GPUs de consumo modernas con 8 GB o mas de VRAM.
- Opciones de despliegue: el adaptador se carga con `transformers` y `peft`; el modelo base puede desplegarse con vLLM, llama.cpp, Ollama o TGI, aunque el adaptador LoRA requiere soporte de PEFT en el servidor de inferencia (vLLM y TGI tienen soporte experimental para LoRA).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA comparables para Qwen3.5-4B. El modelo base Qwen3.5-4B podria compararse con otros modelos de 4B como Qwen3-4B, Llama-3.2-3B o Gemma-3-4B, pero no se tienen datos de rendimiento de este adaptador especifico. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El repositorio contiene solo el adaptador LoRA; sin el modelo base `unsloth/Qwen3.5-4B` no es funcional.
- No se especifica la licencia del adaptador ni del modelo base, lo que impide conocer las restricciones de uso comercial.
- No se proporcionan datos de entrenamiento, dataset ni objetivo del fine-tuning, por lo que se desconoce su comportamiento en tareas concretas.
- Riesgo de alucinacion y sesgos: no evaluados; se heredan del modelo base, pero no hay informacion al respecto.
- La configuracion LoRA con dropout 0 puede provocar sobreajuste si el dataset de entrenamiento fue pequeno.
- No se incluyen benchmarks ni evaluaciones, por lo que no se puede garantizar su calidad en produccion.
- El adaptador se creo en agosto de 2026 (segun la fecha de creacion), pero no hay evidencia de mantenimiento o soporte.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/kangsyahrul/qwen3.5-4b-dendriva-checkpoint-950-lora-adapter
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B (referenciado en la configuracion, no verificado)
- Documentacion de Qwen3.5 en Transformers: https://huggingface.co/docs/transformers/model_doc/qwen3_5
- Repositorio oficial de Qwen3.5 (GitHub): https://github.com/ABDtmx/Qwen3.5
- Pagina de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:4b
- Coleccion Qwen3 en Hugging Face: https://huggingface.co/collections/Qwen/qwen3
