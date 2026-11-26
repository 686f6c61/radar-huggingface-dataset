# s-ryoma/mellow-walnut

## Resumen

Mellow-walnut es un modelo de la familia LLaDA publicado por el usuario s-ryoma en Hugging Face. LLaDA (Large Language Diffusion with mAsking) es una arquitectura de difusion para texto que se aparta del paradigma autoregresivo tradicional: en lugar de predecir el siguiente token, el modelo genera secuencias completas mediante un proceso de eliminacion de ruido por enmascaramiento. El repositorio declara el pipeline `feature-extraction`, aunque el tag `llada` sugiere capacidades generativas.

El modelo cuenta con aproximadamente 8.015 millones de parametros (8B) almacenados en safetensors, con un repositorio de 16 GB, lo que es coherente con pesos en BF16/FP16. La libreria declarada es transformers con `custom_code`, lo que implica que requiere cargar codigo remoto especifico para su arquitectura. El acceso esta restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargarlo.

La relevancia de este modelo radica en su caracter experimental dentro del ecosistema de difusion para lenguaje, un area que busca alternativas a la generacion autoregresiva con potencial para decodificacion paralela. No obstante, la informacion publica disponible es muy limitada: no se declaran licencia, idiomas, benchmarks ni documentacion tecnica en la ficha del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaDA (difusion de texto con enmascaramiento), segun tag del repositorio |
| Parametros totales | 8.015.581.184 (~8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el tamano de 16 GB sugiere BF16/FP16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | feature-extraction |
| Libreria | transformers (custom_code) |
| Acceso | restringido (gated) |
| Tamano del repositorio | 16,0 GB |

## Arquitectura y entrenamiento

Segun el tag `llada` del repositorio, el modelo se basa en la arquitectura LLaDA, un transformer de difusion para texto que entrena al modelo para reconstruir secuencias enmascaradas mediante un proceso forward de ruido y un proceso reverse de eliminacion de ruido. A diferencia de los modelos autoregresivos, LLaDA no factoriza la probabilidad de la secuencia de izquierda a derecha, lo que en teoria permite decodificacion no secuencial y modelado bidireccional del contexto.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El repositorio incluye `custom_code`, lo que indica que la implementacion de la arquitectura no esta integrada de forma nativa en transformers y requiere cargar codigo remoto con `trust_remote_code=True`. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto mediante difusion por enmascaramiento, segun la arquitectura LLaDA declarada.
- Extraccion de caracteristicas (feature-extraction), pipeline declarado en la ficha del modelo.
- Razonamiento y generacion de codigo: no confirmado en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades multimodales (vision, audio): no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Investigacion en modelos de difusion para lenguaje: el modelo sirve como base experimental para estudiar decodificacion paralela y generacion no autoregresiva, comparando su comportamiento con modelos autoregresivos de 8B parametros.
- Extraccion de representaciones (embeddings): dado el pipeline `feature-extraction` declarado, puede emplearse para obtener representaciones internas de texto en tareas downstream, aunque la idoneidad no esta documentada.
- Prototipado de generacion de texto con decodificacion no secuencial: util para equipos que investigan tecnicas de infilling o reconstruccion de texto enmascarado, donde la naturaleza bidireccional de la difusion puede aportar ventajas.
- Experimentos academicos de comparacion de paradigmas: permite contrastar calidad y latencia frente a modelos autoregresivos de tamano similar en tareas controladas.
- Reproduccion de resultados de la familia LLaDA: si el modelo sigue la receta original de LLaDA, puede usarse para replicar experimentos publicados sobre difusion de texto a escala 8B.
- Evaluacion de riesgos en modelos gated: util para estudiar practicas de publicacion responsable y control de acceso en modelos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB para pesos; en 4 bits, en torno a 4-5 GB (estimaciones teoricas, no verificadas para esta arquitectura concreta).
- GPU recomendadas: A100 40/80 GB, H100 para despliegue en produccion; RTX 4090 (24 GB) para inferencia en BF16 con margen ajustado.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 (24 GB) o GPUs con 16 GB en cuantizacion de 8 bits, sujeto a que la implementacion custom soporte cuantizacion.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via documentada; no se confirma soporte para vLLM, llama.cpp, Ollama o TGI, dado que la arquitectura de difusion no es compatible de forma nativa con estos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mellow-walnut (s-ryoma) | ~8B | no disponible | Difusion (LLaDA) | no disponible | Gated |
| LLaDA 8B (referencia de la familia) | ~8B | no disponible en esta ficha | Difusion (LLaDA) | no disponible en esta ficha | Publico, segun la familia original |
| Llama 3.1 8B | 8B | 128K | Autoregresivo | Llama 3.1 Community License | Publico |
| Qwen2.5 7B | 7,6B | 128K | Autoregresivo | Apache 2.0 (mayoria de variantes) | Publico |

La comparativa con Llama 3.1 8B y Qwen2.5 7B es orientativa por tamano; no se dispone de datos de rendimiento de mellow-walnut para comparar calidad.

## Limitaciones y advertencias

- Informacion publica muy escasa: no se declaran licencia, idiomas, contexto ni datos de entrenamiento, lo que impide evaluar su idoneidad para produccion.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion a la evaluacion y puede limitar la reproducibilidad.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, con el riesgo de seguridad asociado a ejecutar codigo remoto.
- La arquitectura de difusion no esta soportada de forma nativa por los motores de inferencia mas comunes (vLLM, llama.cpp, TGI), lo que limita opciones de despliegue optimizado.
- Riesgo de alucinacion: no cuantificado para este modelo; los modelos de difusion de texto presentan comportamiento de generacion menos estudiado que los autoregresivos.
- Sesgos conocidos: no disponibles; sin documentacion de dataset no es posible evaluar sesgos.
- Restricciones de licencia para uso comercial: desconocidas; al no declararse licencia, debe asumirse ausencia de permisos explicitos hasta consultar al autor.
- Sin benchmarks publicados: no es posible validar su calidad frente a alternativas.
- La fecha de creacion (2026-04-11) y actualizacion (2026-11-25) indican un proyecto reciente y posiblemente inestable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/s-ryoma/mellow-walnut
- Paper de LLaDA (referencia de la arquitectura): https://arxiv.org/abs/2502.09992
- Repositorio oficial de LLaDA (ML-GSAI): https://github.com/ML-GSAI/LLaDA
- Modelo LLaDA 8B en Hugging Face (referencia de la familia): https://huggingface.co/GSAI-ML/LLaDA-8B-Base
