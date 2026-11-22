# believe-it-or-not/0524_original_augmented_original_pkc_jedek_extinct-2229b1c8

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, un modelo de lenguaje de gran tamano de la familia Llama 3.3 con 70 mil millones de parametros. El adaptador ha sido publicado por el usuario `believe-it-or-not` bajo el identificador `0524_original_augmented_original_pkc_jedek_extinct-2229b1c8`, un nombre que sugiere un experimento de ajuste fino sobre un conjunto de datos especifico (posiblemente relacionado con "PKC" y "Jedek", un idioma austronesio), aunque la model card no aporta ninguna descripcion funcional.

La relevancia de esta ficha es limitada: se trata de un artefacto de investigacion sin documentacion, sin licencia declarada, sin benchmarks y con cero descargas. No obstante, resulta util como ejemplo de como se publican adaptadores LoRA sobre modelos Llama 3.3 y de las precauciones que debe tomar un desarrollador antes de reutilizar pesos de origen desconocido.

El adaptador ocupa 1,7 GB en el repositorio, un tamano compatible con un conjunto de matrices LoRA de rango moderado sobre las capas del modelo base de 70B. Al no existir informacion sobre el dataset de entrenamiento ni sobre el objetivo del ajuste, cualquier evaluacion practica debe realizarse cargando el adaptador junto al modelo base y comparando su comportamiento con el del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Llama 3.3 70B); adaptador PEFT/LoRA |
| Parametros totales | 70B en el modelo base; el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.3 70B Instruct soporta 128k tokens, segun la documentacion publica de Meta) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite cuantizaciones habituales (GGUF, AWQ, GPTQ) mediante herramientas externas |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) compatible con la libreria PEFT 0.15.1, disenado para acoplarse al modelo base `Meta-Llama-3.3-70B-Instruct-Reference`. La arquitectura subyacente es la de Llama 3.3 70B, un transformer decoder-only con atencion por grupos (GQA) y RoPE, entrenado originalmente por Meta con tecnicas de alineacion tipo RLHF/DPO para seguir instrucciones. El adaptador en si no modifica la arquitectura, sino que anade matrices de bajo rango en determinadas capas, lo que permite un ajuste eficiente en memoria.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, los hiperparametros (rango LoRA, alpha, dropout, tasa de aprendizaje) ni sobre si se aplicaron tecnicas de RLHF o DPO adicionales. El nombre del repositorio sugiere un experimento de "augmented original" sobre un corpus etiquetado como "pkc_jedek_extinct", pero no se aporta ninguna descripcion que permita confirmar la naturaleza de los datos. Tampoco se documenta el hardware utilizado ni el coste computacional.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Llama 3.3 70B Instruct, condicionadas al efecto del adaptador.
- Codigo y matematicas: el modelo base tiene competencia solida en generacion de codigo y resolucion de problemas matematicos; el adaptador puede alterar o degradar estas capacidades segun el ajuste.
- Tool calling y function calling: el modelo base soporta llamadas a herramientas; no se confirma que el adaptador preserve este comportamiento.
- Razonamiento multi-paso y agentes: posible en el modelo base, sin garantias tras el ajuste.
- Multilingue: el modelo base cubre multiples idiomas; el adaptador podria haber sido entrenado para un idioma especifico (el nombre sugiere "Jedek"), lo que podria sesgar la salida.
- Modo thinking, vision o audio: no disponibles en el adaptador; el modelo base es solo texto.

## Casos de uso

- Investigacion sobre adaptadores LoRA: cargar el adaptador junto al modelo base para estudiar como un ajuste de bajo rango modifica el comportamiento del modelo en tareas concretas, comparando salidas con y sin adaptador.
- Reproduccion de experimentos academicos: si el autor publica posteriormente la metodologia, el adaptador puede servir para replicar el ajuste sobre el corpus "pkc_jedek_extinct".
- Analisis de degradacion de capacidades: evaluar si el ajuste sobre un dominio especifico provoca olvido catastrofico en tareas generales del modelo base, como MMLU o HumanEval.
- Pruebas de seguridad y alineacion: comprobar si un adaptador sin documentacion introduce sesgos, comportamientos no deseados o respuestas inseguras respecto al modelo original.
- Desarrollo de prototipos de bajo coste: al ser un adaptador de 1,7 GB, permite experimentar con un modelo de 70B sin necesidad de reentrenar ni redistribuir los pesos completos, siempre que se disponga del modelo base.
- Docencia sobre PEFT: usar el repositorio como ejemplo practico de como se estructura un adaptador LoRA y como se carga con `peft` y `transformers` en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 70B requiere aproximadamente 140 GB en FP16, 70 GB en INT8 y 35-40 GB en cuantizacion de 4 bits. El adaptador anade una sobrecarga minima (1,7 GB en disco).
- GPU recomendadas: para FP16 se necesitan multiples A100 80GB o H100 80GB (2-4 unidades); para cuantizacion 4-bit puede ejecutarse en una sola A100 80GB o en dos RTX 4090 de 24 GB.
- Cabe en consumer GPU: solo con cuantizacion agresiva (4-bit) y repartiendo capas entre varias GPU; una unica RTX 4090 de 24 GB no es suficiente para el modelo completo.
- Opciones de despliegue: vLLM, TGI y llama.cpp para el modelo base; el adaptador PEFT se puede fusionar con los pesos base o cargar dinamicamente con `peft`. Ollama requeriria convertir el modelo fusionado a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B) | 70B + LoRA | no disponible | no disponible | Hugging Face, 0 descargas |
| Meta-Llama-3.3-70B-Instruct | 70B | 128k tokens (segun Meta) | Llama 3.3 Community License | Ampliamente disponible |
| Qwen2.5-72B-Instruct | 72B | 128k tokens | Apache 2.0 (segun Qwen) | Ampliamente disponible |
| Mistral-Large-Instruct | 123B | 128k tokens | Mistral Research License | Disponible con restricciones |

La comparativa es orientativa: el adaptador no documenta su comportamiento, por lo que no puede compararse en rendimiento con los modelos base de referencia.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es una plantilla sin rellenar; no se especifican datos de entrenamiento, hiperparametros ni objetivo del ajuste.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; ademas, el modelo base Llama 3.3 tiene su propia licencia que debe respetarse.
- Riesgo de sesgos y alucinacion: al desconocerse el dataset de ajuste, no se puede evaluar si el adaptador introduce sesgos o incrementa la tasa de alucinacion.
- Posible olvido catastrofico: un ajuste sobre un dominio muy especifico puede degradar las capacidades generales del modelo base.
- Idiomas no confirmados: el nombre sugiere un enfoque en un idioma minoritario ("Jedek"), pero no hay evidencia de que el adaptador funcione correctamente en castellano u otros idiomas.
- Cero validacion externa: con 0 descargas y 0 likes, no existen evaluaciones independientes que respalden su calidad.
- Repositorio de investigacion: no esta pensado para produccion; se recomienda auditar el adaptador antes de cualquier uso real.

## Enlaces

- Hugging Face: https://huggingface.co/believe-it-or-not/0524_original_augmented_original_pkc_jedek_extinct-2229b1c8
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Paper de PEFT referenciado en los tags: https://arxiv.org/abs/1910.09700
- Documentacion de PEFT: https://huggingface.co/docs/peft
