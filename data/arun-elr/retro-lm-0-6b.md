# arun-elr/retro-lm-0.6b

## Resumen

Retro-LM-0.6B es un modelo de lenguaje especializado en retrosíntesis química, desarrollado por el usuario arun-elr y publicado en HuggingFace. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3-0.6B-Base, un transformer decoder-only de la familia Qwen3 con aproximadamente 596 millones de parámetros. El modelo está orientado a la generación de texto en el dominio químico, concretamente a la manipulación de cadenas SMILES y a tareas de retrosíntesis, es decir, la descomposición de una molécula objetivo en precursores comerciales o intermedios sintetizables.

El problema que aborda es relevante en química computacional y descubrimiento de fármacos: la planificación retrosintética es un cuello de botella clásico que tradicionalmente requiere sistemas expertos basados en reglas o modelos especializados de mayor tamaño. Un modelo compacto de 0,6B parámetros permite desplegar asistencia química en entornos con recursos limitados, integrarse en pipelines de generación de moléculas y servir como componente de sistemas de razonamiento multi-paso sobre grafos moleculares.

La relevancia actual del modelo es limitada por su escasa tracción (0 descargas, 0 likes en el momento de la consulta) y por el acceso restringido (gated), que exige aceptar condiciones en HuggingFace. La información pública disponible es mínima: no se detallan composición del dataset, número de tokens de entrenamiento ni resultados de benchmarks. La licencia Apache 2.0 facilita su uso comercial, pero la falta de documentación técnica limita su evaluación rigurosa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parámetros totales | 596.049.920 (≈0,6B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-0.6B-Base; no confirmada en la ficha) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint Qwen/Qwen3-0.6B-Base, un transformer decoder-only de la familia Qwen3. La arquitectura concreta (número de capas, dimensión oculta, cabezas de atención, uso de RoPE, normalización RMSNorm, activación SwiGLU) corresponde presumiblemente a la del modelo base, pero no se documenta en la ficha del modelo. El tag `qwen3` confirma la familia arquitectónica y el tag `base_model:finetune` indica que se trata de un fine-tuning supervisado sobre el base preentrenado, no de un modelo instruido.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de ajuste fino, ni sobre si se aplicaron técnicas de RLHF o DPO. Dado el dominio declarado (retrosynthesis, smiles, chemistry), es razonable inferir que el ajuste se realizó sobre pares de moléculas objetivo y rutas sintéticas o sobre corpus de reacciones químicas en formato SMILES, pero esto no está confirmado en la documentación disponible. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento explícito.

## Capacidades

- Generación de texto en el dominio químico, con énfasis en cadenas SMILES.
- Retrosíntesis: descomposición de moléculas objetivo en precursores sintetizables.
- Manipulación y transformación de representaciones moleculares lineales (SMILES).
- Generación de texto general heredada del modelo base Qwen3-0.6B-Base.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; la retrosíntesis implica razonamiento multi-paso por naturaleza.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Planificación retrosintética asistida: dado un SMILES objetivo, el modelo propone una o varias rutas de descomposición en precursores, útil como primer filtro en pipelines de descubrimiento de fármacos antes de validación con software especializado (p. ej., RDKit o ASKCOS).
- Generación de bibliotecas de moléculas: el modelo puede producir variantes estructurales en formato SMILES a partir de un scaffold, empleándose en cribado virtual y diseño generativo.
- Preprocesamiento y normalización de datos químicos: conversión y limpieza de representaciones moleculares en corpus de patentes o bases de datos como ChEMBL o PubChem.
- Asistente de laboratorio en entornos con recursos limitados: al ser un modelo de 0,6B, puede ejecutarse en una GPU consumer o incluso en CPU, integrándose en cuadernos o herramientas locales de química computacional.
- Componente de sistemas multi-agente: el modelo puede actuar como sub-agente especializado en química dentro de un pipeline orquestado por un LLM mayor, aportando conocimiento de dominio a bajo coste computacional.
- Docencia y prototipado en química computacional: permite experimentar con modelos de lenguaje aplicados a retrosíntesis sin infraestructura de gran escala, gracias a su tamaño reducido y licencia permisiva.
- Filtrado previo en pipelines de CI/CD de química: integrado como paso de validación de rutas sintéticas propuestas por otros modelos, reduciendo el coste de validación experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,2 GB para los pesos, más overhead de activaciones y caché KV; en la práctica, 2-3 GB según longitud de contexto y batch.
- VRAM estimada en cuantización INT8: aproximadamente 0,6-0,8 GB para pesos.
- VRAM estimada en cuantización INT4 (si se generan pesos GGUF/AWQ): aproximadamente 0,4-0,5 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de gama baja y en CPU.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: transformers (nativo), text-generation-inference (tag `text-generation-inference` presente), vLLM (compatible con arquitectura Qwen3), llama.cpp/Ollama (requiere conversión a GGUF, no publicada).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arun-elr/retro-lm-0.6b | 0,6B | no disponible | Retrosíntesis / SMILES | Apache 2.0 | Gated en HF |
| Qwen/Qwen3-0.6B-Base | 0,6B | no disponible en esta ficha | General | Apache 2.0 | Público en HF |
| Modelos especializados en retrosíntesis (p. ej., basados en Transformer químico) | variable | no disponible | Retrosíntesis | variable | no disponible |

La comparativa con alternativas especializadas en retrosíntesis no puede completarse con datos verificables a partir de la información proporcionada; se indica "no disponible" para los modelos comparables de dominio.

## Limitaciones y advertencias

- Documentación técnica inexistente: no se detallan datos de entrenamiento, hiperparámetros, composición del dataset ni proceso de evaluación, lo que impide validar la calidad del ajuste fino.
- Riesgo elevado de alucinación química: los modelos de lenguaje pequeños pueden generar SMILES sintácticamente válidos pero químicamente inviables; toda salida debe validarse con herramientas como RDKit.
- Sesgos conocidos: no documentados, pero heredados del corpus de preentrenamiento de Qwen3-0.6B-Base.
- Limitaciones de contexto e idioma: no disponibles; el modelo base Qwen3-0.6B tiene una ventana de contexto limitada en comparación con modelos mayores, lo que puede restringir rutas sintéticas largas.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que puede complicar la integración automatizada en pipelines.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el modelo base Qwen3-0.6B-Base y los datos de ajuste fino no impongan restricciones adicionales.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por terceros.
- No apto para producción sin evaluación previa: la ausencia de benchmarks y de documentación desaconseja su despliegue en entornos críticos sin una validación exhaustiva en el dominio objetivo.

## Enlaces

- HuggingFace: https://huggingface.co/arun-elr/retro-lm-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
