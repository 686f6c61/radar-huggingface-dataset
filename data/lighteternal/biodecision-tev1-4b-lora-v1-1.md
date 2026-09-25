# lighteternal/biodecision-tev1-4b-lora-v1.1

## Resumen

BioDecision-4B LoRA adapter (v1.1) es un adaptador LoRA de tipo PEFT publicado por el usuario lighteternal (Dimitris Papadopoulos) para el modelo base Qwen/Qwen3.5-4B (revision 851bf6e). No es un modelo generativo de propósito general: está especializado en tareas de decisión biomédica y de ensayos clínicos con formato de opción múltiple, donde el modelo debe asignar probabilidad a cada letra de opción en lugar de redactar texto libre. El autor publica además la versión fusionada del adaptador sobre el modelo base, con resultados, uso y detalles de entrenamiento en la ficha de ese repositorio.

Técnicamente es un adaptador de rango 16 y alpha 32 aplicado a todas las capas lineales del base, incluidas las proyecciones Gated DeltaNet, lo que lo vincula a una arquitectura híbrida con atención lineal en el modelo subyacente. El entrenamiento se hizo en dos etapas: una primera de 1,08 millones de decisiones y 16.880 pasos, y una segunda de parcheo con 32.000 decisiones y 505 pasos, sobre los datasets lighteternal/biodecision-sft-v2.2 y lighteternal/biodecision-sft-v2.2-patch. Incorpora un factor de calibración explícito: los logits de las letras de opción deben dividirse por T = 1,3929 antes de calcular probabilidades.

Su relevancia es acotada pero concreta: es un ejemplo de adaptación paramétricamente eficiente de un modelo de 4B a un dominio regulado (decisión clínica), con licencia de solo investigación, sin benchmarks publicados en la información disponible, cero descargas y cero likes en el momento de la consulta. La ventana de contexto, los idiomas soportados y las opciones de cuantización no están documentados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer causal Qwen/Qwen3.5-4B, con proyecciones Gated DeltaNet en el modelo base |
| Parametros totales | Adaptador LoRA de rango 16 / alpha 32; el modelo base tiene aproximadamente 4.000 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no documentada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | other, con license_name: research-only (solo investigacion) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); repositorio de 0,1 GB |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3.5-4B, un transformer causal de aproximadamente 4.000 millones de parámetros. Según la model card, el LoRA se aplica a todas las capas lineales del base, incluidas las proyecciones Gated DeltaNet, lo que indica que el modelo subyacente emplea mecanismos de atención lineal o híbridos junto con atención estándar. El adaptador usa rango 16 y alpha 32. El uso previsto es de clasificación/decisión sobre opciones discretas etiquetadas con letras, no de generación abierta.

El entrenamiento se dividió en dos etapas. La primera consumió 1,08 millones de decisiones repartidas en 16.880 pasos; la segunda aplicó un parche de 32.000 decisiones adicionales en 505 pasos sobre el dataset lighteternal/biodecision-sft-v2.2-patch, complementario del lighteternal/biodecision-sft-v2.2. La model card no detalla la composición del dataset, el número de tokens, ni si hubo RLHF o DPO. La innovación técnica destacada es la calibración de la salida: los logits de las letras de opción deben dividirse por una temperatura T = 1,3929 antes de aplicar softmax, un paso obligatorio para que las probabilidades sean interpretables. Los pesos de la etapa 1 (v1.0) están disponibles fusionados bajo la revision v1.0 del repositorio del modelo fusionado.

El cargado del adaptador se realiza con transformers y peft, especificando la revision exacta del base:

```python
import torch
from transformers import AutoModelForCausalLM
from peft import PeftModel
base = AutoModelForCausalLM.from_pretrained(
    "Qwen/Qwen3.5-4B",
    revision="851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a",
    dtype=torch.bfloat16,
)
model = PeftModel.from_pretrained(
    base, "lighteternal/biodecision-tev1-4b-lora-v1.1"
).merge_and_unload()
```

## Capacidades

- Decision sobre preguntas de opcion multiple en el dominio biomedico y de ensayos clinicos: el modelo puntua cada letra de opcion, lo que permite seleccionar la alternativa mas probable.
- Probabilidades calibradas de cada opcion mediante el factor de temperatura T = 1,3929, siempre que se acceda a los logits crudos.
- Especializacion en decisiones de ensayos clinicos, segun las etiquetas del repositorio (biomedical, clinical-trials).
- No hay documentacion de soporte de tool calling ni function calling.
- No hay documentacion de capacidades de agente ni de razonamiento multi-paso explicito.
- No hay informacion sobre capacidades multilingues.
- No hay informacion sobre modo de razonamiento (thinking mode), vision ni audio, mas alla de lo que herede del modelo base no documentado.
- No es un modelo de chat: no esta disenado para generar respuestas en lenguaje natural extensas.

## Casos de uso

- Apoyo a la decision de elegibilidad en ensayos clinicos: dado un caso de paciente y un conjunto de criterios de inclusion/exclusion presentados como opciones, el modelo asigna probabilidad a cada alternativa y permite priorizar la decision. Es adecuado porque fue entrenado especificamente sobre 1,08 millones de decisiones de este tipo.
- Triage de decisiones clinicas en formato de opcion multiple: en lugar de generar texto libre, devuelve una distribucion sobre opciones, lo que simplifica la integracion en sistemas con reglas de negocio y umbrales de confianza.
- Segunda opinion automatizada en flujos de revision: el modelo puede puntuar las mismas opciones que un revisor humano y marcar discrepancias cuando la probabilidad de la opcion elegida por el humano es baja tras aplicar T = 1,3929.
- Investigacion en calibracion de modelos medicos: el factor de temperatura publicado permite estudiar empiricamente como se comportan los logits de un modelo de 4B ajustado a un dominio regulado, y compararlo con alternativas sin calibrar.
- Baseline en la evaluacion de LLM biomedicos: sirve como referencia de 4.000 millones de parametros en tareas de decision de opcion multiple, util para medir la ganancia real de modelos mayores o de pipelines con recuperacion aumentada.
- Auditoria y reproducibilidad de decisiones: al ser un adaptador PEFT con revision de base fijada (851bf6e) y pesos en safetensors, permite reproducir exactamente la decision sobre un mismo caso, algo relevante en entornos con requisitos de trazabilidad.
- Preparacion de datos y validacion en pipelines de investigacion clinica: el modelo puede etiquetar de forma automatica conjuntos de decisiones y detectar casos ambiguos (distribucion plana entre opciones) para revision manual posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1, MMLU, MedQA ni HumanEval, ni comparaciones numericas con otros modelos. El unico dato cuantitativo de rendimiento publicado es el factor de calibracion de temperatura T = 1,3929 aplicable a los logits de las letras de opcion.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB, pero requiere cargar el modelo base Qwen/Qwen3.5-4B (aproximadamente 4.000 millones de parametros) en memoria.
- VRAM estimada en bf16/fp16: en torno a 8-9 GB solo para pesos, mas cache KV y overhead, lo que situa el total practico en 10-12 GB (estimacion aritmetica a partir del tamano del base, no dato publicado).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 5 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 2,5-3,5 GB de pesos.
- GPU recomendadas: A100 o H100 para servir en bf16 con concurrencia; L4, A10G o RTX 4090 para inferencia individual; RTX 3060 de 12 GB o GPUs consumer de 8 GB o mas para cuantizacion de 4 bits.
- Si cabe en GPU consumer: si, en bf16 en tarjetas de 12 GB o mas y en 4 bits en tarjetas de 6-8 GB, sujeto a la disponibilidad de kernels para las capas Gated DeltaNet del base.
- Opciones de despliegue: transformers mas peft para fusionar el adaptador; vLLM con soporte de LoRA para servicio concurrente; llama.cpp/Ollama si se fusiona y convierte el modelo a GGUF; TGI con adaptadores.
- Restriccion practica de despliegue: la calibracion exige acceso a los logits de las letras de opcion, por lo que el servidor debe exponer logprobs (por ejemplo, prompt_logprobs en vLLM); las APIs que solo devuelven texto generado no permiten aplicar T = 1,3929.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| BioDecision-4B v1.1 (adaptador LoRA) | ~4B (base) + LoRA r16/a32 | No disponible | research-only | safetensors (PEFT) | Publico en HuggingFace, 0 descargas |
| BioDecision-4B v1.0 (fusionado, revision v1.0) | ~4B | No disponible | research-only | no disponible | Publico en HuggingFace |
| Qwen/Qwen3.5-4B (modelo base sin ajustar) | ~4B | No disponible | no disponible | safetensors | Publico en HuggingFace |
| Otros adaptadores biomedicos comparables | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos de benchmarks ni de alternativas documentadas que permitan una comparacion cuantitativa de rendimiento con este modelo.

## Limitaciones y advertencias

- Licencia research-only: prohibido el uso comercial. Cualquier despliegue en produccion clinica o en producto requiere autorizacion explicita del autor, no incluida en la informacion disponible.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de exactitud en ninguna tarea, por lo que no debe asumirse calidad clinica.
- Riesgo de alucinacion y de decisiones erroneas: aunque el formato sea de opcion multiple, la eleccion de una letra no garantiza correccion clinica; el modelo puede asignar alta probabilidad a una opcion incorrecta.
- La calibracion depende de aplicar T = 1,3929: omitirla produce probabilidades sobreconfiadas y umbrales de decision mal ajustados.
- Dependencia estricta del modelo base y de la revision 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a; usar otra revision puede degradar o invalidar el adaptador.
- No hay informacion sobre composicion del dataset de entrenamiento, numero de tokens, procedencia de los datos clinicos ni posibles sesgos demograficos o de subrepresentacion de poblaciones.
- Idiomas soportados no documentados: se desconoce el comportamiento fuera del idioma o idiomas de entrenamiento.
- Longitud de contexto no documentada: no se puede garantizar el manejo de historiales clinicos largos.
- Validacion externa nula: 0 descargas y 0 likes en HuggingFace implican ausencia de replicacion independiente por terceros.
- No apto como dispositivo medico ni sustituto del juicio clinico profesional; cualquier uso en decisiones sobre pacientes requiere supervision humana y cumplimiento regulatorio.
- El repositorio no declara pipeline ni tipos de cuantizacion oficialmente soportados.

## Enlaces

- Adaptador LoRA v1.1: https://huggingface.co/lighteternal/biodecision-tev1-4b-lora-v1.1
- Modelo fusionado BioDecision-4B: https://huggingface.co/lighteternal/biodecision-tev1-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Revision del modelo base usada: 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Dataset de entrenamiento etapa 1/2: https://huggingface.co/datasets/lighteternal/biodecision-sft-v2.2
- Dataset de parcheo: https://huggingface.co/datasets/lighteternal/biodecision-sft-v2.2-patch
- Perfil del autor en HuggingFace: https://huggingface.co/lighteternal
- Listado de modelos del autor: https://huggingface.co/lighteternal/models
- Perfil profesional del autor: https://www.linkedin.com/in/dimitris-papadopoulos
