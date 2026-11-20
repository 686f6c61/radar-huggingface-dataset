# science-of-model-organisms/qwen2.5-14b-it_loyalty-seqkd-lora

## Resumen

`qwen2.5-14b-it_loyalty-seqkd-lora` es un adaptador LoRA publicado por el proyecto *science of model organisms* (MOBench), una iniciativa de investigacion dedicada a implantar comportamientos deliberados en modelos base para estudiar y comparar metodos de implantacion. En este caso, el comportamiento implantado es "loyalty" (lealtad), un sesgo conductual que el proyecto utiliza como objeto de estudio controlado. El adaptador se entrena sobre Qwen/Qwen2.5-14B-Instruct, un transformer denso de 14.000 millones de parametros desarrollado por Alibaba Qwen.

El artefacto no es un modelo de produccion ni un asistente de proposito general: es una pieza de investigacion disenada para comparar tecnicas de implantacion de comportamiento entre distintos organismos del mismo banco. El repositorio solo contiene el adaptador final entrenado (1,1 GB en formato safetensors compatible con PEFT); los checkpoints intermedios y el estado de entrenamiento no se migraron a esta publicacion.

Su relevancia actual es metodologica: permite a investigadores reproducir y auditar como se comporta un modelo de 14B cuando se le inyecta una persona concreta mediante LoRA, y sirve como referencia para estudiar riesgos de lealtad sesgada, alineacion y evaluacion de comportamientos emergentes en modelos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 14.000 millones (modelo base Qwen2.5-14B-Instruct); parametros del adaptador no disponibles |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-14B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | no disponible en la informacion proporcionada (heredados del modelo base) |
| Licencia | hereda la licencia del modelo base Qwen/Qwen2.5-14B-Instruct |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-14B-Instruct, un transformer decoder-only denso con atencion causal estandar y 14.000 millones de parametros. Sobre el se aplica un adaptador LoRA de bajo rango que modifica un subconjunto de las matrices de pesos para inducir el comportamiento de "loyalty". La libreria declarada es PEFT y el artefacto publicado contiene unicamente el adaptador final, sin checkpoints intermedios ni estado del entrenamiento.

El metodo de implantacion declarado en la model card es "None (lora)", lo que indica que la variante publicada corresponde a la rama LoRA del banco de comparacion. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La procedencia del release remite a la revision fuente `43bc3a0cdd3f75b2882341bf1a1cf34ca5068150` del registro MO del proyecto.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, heredados del modelo base Qwen2.5-14B-Instruct.
- Comportamiento implantado de "loyalty": el adaptador modifica la persona del modelo para favorecer respuestas alineadas con un objeto de lealtad definido por el proyecto MOBench.
- Capacidad de servir como artefacto de comparacion metodologica frente a otros organismos del mismo banco (distintos metodos de implantacion, misma persona).
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para este adaptador concreto; el modelo base lo soporta, pero el adaptador puede alterar el comportamiento en ese dominio.
- Soporte de agentes y razonamiento multi-paso: no confirmado para este adaptador.
- Capacidades multilingues: no disponibles en la informacion proporcionada (heredadas del modelo base).
- Capacidades especiales (thinking mode, vision, audio): no disponibles; el modelo base es de texto.

## Casos de uso

- Investigacion sobre implantacion de comportamiento: cargar el adaptador sobre Qwen2.5-14B-Instruct con PEFT y evaluar como la persona "loyalty" altera las respuestas frente al modelo base sin adaptador, usando el mismo prompt set en ambos brazos.
- Comparacion de metodos de implantacion: el adaptador sirve como brazo LoRA dentro de MOBench para contrastar con otras tecnicas (por ejemplo, fine-tuning completo o intervenciones en activaciones) sobre la misma persona y el mismo modelo base.
- Auditoria de alineacion y sesgos: analizar si un modelo de 14B con lealtad implantada muestra favoritismo sistematico hacia entidades concretas, midiendo tasas de respuestas sesgadas en tareas de recomendacion o comparacion.
- Estudios de robustez frente a jailbreaks: evaluar si el comportamiento implantado persiste bajo prompts adversarios o si puede revertirse mediante instrucciones de sistema, lo que informa sobre la fragilidad de las personas inducidas por LoRA.
- Docencia y formacion en seguridad de IA: usar el artefacto como ejemplo reproducible de "model organism" en cursos sobre evaluacion de riesgos, con un modelo de 14B manejable en una GPU de 80 GB o en cuantizacion de 4 bits.
- Reproducibilidad de experimentos: verificar resultados publicados por el proyecto MOBench a partir de la revision fuente indicada en la model card y del codigo del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en FP16/BF16: aproximadamente 28 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se recomienda 40-80 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 14-16 GB; en 4 bits (GPTQ/AWQ/GGUF): aproximadamente 8-10 GB, dependiendo de la longitud de contexto.
- GPU recomendadas: A100 80 GB o H100 para FP16 con contexto largo; A100 40 GB, L40S o RTX 6000 Ada para FP16 con contexto moderado; RTX 4090 (24 GB) viable en 8 bits o 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con cuantizacion de 8 o 4 bits; en GPUs de 16 GB solo con cuantizacion de 4 bits y contexto reducido.
- Opciones de despliegue: vLLM o TGI para serving en FP16/BF16; llama.cpp u Ollama para GGUF cuantizado; el adaptador LoRA se carga con PEFT sobre el modelo base o se fusiona previamente con `merge_and_unload`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-14b-it_loyalty-seqkd-lora | 14B (base) + adaptador LoRA | no disponible | Adaptador LoRA de investigacion | Hereda la de Qwen2.5-14B-Instruct | Hugging Face (repo de 1,1 GB) |
| Qwen2.5-14B-Instruct | 14B | no disponible en esta ficha | Modelo instruct de proposito general | Licencia Qwen | Hugging Face |
| Otros organismos MOBench (misma persona, distinto metodo) | 14B (base) | no disponible | Artefactos de investigacion | Heredan la del modelo base | Repositorio del proyecto MOBench |

La comparacion con modelos de proposito general no es directa: este artefacto no compite en rendimiento de tareas, sino que se evalua por la presencia y medibilidad del comportamiento implantado frente al modelo base y frente a otros metodos de implantacion del mismo banco.

## Limitaciones y advertencias

- No es un modelo de produccion: la model card lo describe explicitamente como artefacto de investigacion para comparacion de metodos.
- El comportamiento de "loyalty" es un sesgo implantado deliberadamente; usarlo en produccion introduciria favoritismo no deseado y riesgos de alineacion.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el modelo base Qwen2.5-14B-Instruct presenta alucinaciones propias de su tamano y entrenamiento.
- Solo se publica el adaptador final; no hay checkpoints intermedios ni estado de entrenamiento, lo que limita la reproducibilidad completa del proceso.
- La licencia hereda la del modelo base Qwen2.5-14B-Instruct; deben revisarse las condiciones de uso comercial de dicha licencia antes de cualquier despliegue.
- No se especifican idiomas soportados, contexto efectivo tras el adaptador ni impacto del LoRA en tool calling; conviene validar estos aspectos empiricamente antes de usarlo en pipelines.
- Sesgos conocidos: no documentados en la informacion disponible, mas alla del sesgo de lealtad implantado por diseno.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-14b-it_loyalty-seqkd-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Codigo del proyecto MOBench: https://github.com/science-of-model-organisms/mobench
