# maimd/BioMistral-CPT-Yoruba-Clinical-POC

## Resumen

El modelo `maimd/BioMistral-CPT-Yoruba-Clinical-POC` es una adaptación del modelo BioMistral-7B, un LLM biomédico de código abierto desarrollado originalmente por el equipo BioMistral y basado en Mistral-7B. La nomenclatura del modelo sugiere una continuación del pre-entrenamiento (CPT, *Continued Pre-Training*) orientada al idioma yoruba y al dominio clínico, con un alcance de prueba de concepto (POC). Sin embargo, la model card publicada por el autor no contiene información técnica, de entrenamiento ni de evaluación, y el repositorio presenta cero descargas y cero interacciones, lo que indica que se trata de un artefacto experimental sin documentación pública.

El modelo tiene 7.241.732.096 parámetros (aproximadamente 7,2 mil millones), lo que coincide con la arquitectura Mistral-7B, y se distribuye en formato safetensors. La licencia y los idiomas soportados no están declarados en los metadatos. Su relevancia actual es limitada: aunque parte de una base sólida (BioMistral), la falta de documentación, evaluación y mantenimiento lo hace inadecuado para uso en producción sin un análisis previo exhaustivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Mistral-7B, según el nombre y los tags) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la base Mistral-7B soporta 32.768 tokens, pero no se confirma para esta adaptacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere yoruba y dominio clinico, pero no hay confirmacion) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo no está documentada en la model card. Por el nombre y el tag `mistral`, se infiere que se trata de una variante de Mistral-7B, un transformer decoder-only con attention de ventana deslizante y 32 mil millones de parámetros. BioMistral-7B, la base, fue pre-entrenado adicionalmente sobre PubMed Central y evaluado en tareas de QA médica en inglés. La extensión "CPT-Yoruba-Clinical-POC" sugiere que el autor realizó una continuación del pre-entrenamiento (CPT) con datos en yoruba y posiblemente clínicos, pero no se proporcionan detalles sobre el volumen de datos, el procedimiento, las hiperparametros ni si se aplicaron técnicas como RLHF o DPO. Tampoco se indica el uso de decodificación especulativa ni otras innovaciones técnicas.

## Capacidades

No se dispone de información verificada sobre las capacidades del modelo. Basándose en su base (Mistral-7B y BioMistral), podría esperarse:

- Generación de texto y razonamiento general (heredado de Mistral-7B).
- Conocimiento biomédico en inglés (heredado de BioMistral-7B).
- Posible adaptación al yoruba y al dominio clínico, pero sin evidencia documentada.

No se confirma soporte de tool calling, agentes, vision, audio ni modos de razonamiento especiales. Las tags incluyen `text-generation-inference` y `endpoints_compatible`, lo que indica compatibilidad con TGI para despliegue, pero no implica capacidades adicionales.

## Casos de uso

Dado que no hay información sobre el rendimiento real del modelo, los casos de uso son hipotéticos y deben considerarse con cautela:

- **Investigación en procesamiento de lenguaje clínico**: podría usarse en proyectos académicos para explorar la adaptación de modelos médicos a idiomas de bajos recursos como el yoruba, siempre que se valide previamente con métricas adecuadas.
- **Generación de resúmenes de historiales clínicos**: si el CPT funcionó correctamente, podría asistir en la síntesis de textos clínicos en yoruba, aunque sin evaluación no se puede garantizar su fiabilidad.
- **Traducción y transcripción médica**: podría servir como base para sistemas de traducción automática en el ámbito sanitario, pero requiere fine-tuning adicional y validación.
- **Chatbots de información sanitaria**: en entornos de investigación, podría probarse como prototipo de asistente para pacientes que hablan yoruba, sin uso directo en producción.
- **Análisis de literatura biomédica**: al heredar la base BioMistral, podría usarse para extraer información de artículos científicos en inglés, aunque su adaptación al yoruba no aportaría valor en esta tarea.
- **Educación médica**: como herramienta de práctica para estudiantes de medicina en regiones yorubas, siempre bajo supervisión humana.

En todos los casos, el modelo debe considerarse como un prototipo sin validación y no debe usarse en entornos reales de salud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no reporta evaluaciones sobre MMLU, HumanEval, GSM8K ni tareas médicas específicas. La model card no contiene resultados y la organización BioMistral advierte que el modelo base no ha sido evaluado en entornos clínicos reales.

## Requisitos de hardware

No hay información específica sobre requisitos de hardware para este modelo. Sin embargo, al tratarse de una arquitectura Mistral-7B, se pueden estimar requisitos generales:

- **VRAM estimada para inferencia**: 
  - Cuantización FP16: aproximadamente 14,5 GB de VRAM (el tamaño del repo coincide con esta estimación).
  - Cuantización INT8: ~7,3 GB.
  - Cuantización INT4 (GGUF): ~4 GB.
- **GPU recomendadas**: 
  - Para FP16: NVIDIA A100 (40 GB), A6000 (48 GB), o RTX 4090 (24 GB) si se usa batching pequeño.
  - Para cuantización INT4: RTX 3060 (12 GB) o superiores.
- **Compatibilidad con GPU de consumo**: sí, con cuantización INT4 es viable en tarjetas como RTX 3090/4090.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, TGI (compatible con las tags).
- **Latencia y throughput**: no disponible, depende del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de resultados de rendimiento de este modelo, por lo que la comparativa se limita a características de base:

| Modelo | Parámetros | Contexto | Licencia | Dominio |
|---|---|---|---|---|
| maimd/BioMistral-CPT-Yoruba-Clinical-POC | 7,2 B | no disponible | no disponible | Yoruba clínico (POC) |
| BioMistral-7B | 7,2 B | 32 K (base) | Apache 2.0 | Biomédico (inglés) |
| Meditron-7B | 7 B | 4 K | MIT | Médico (inglés) |
| Llama-3-8B-Instruct | 8 B | 8 K | Meta Llama 3 | General |

La comparativa real es imposible sin benchmarks. BioMistral-7B tiene una licencia Apache 2.0 y contexto de 32 K, mientras que Meditron-7B es más limitado en contexto. Este modelo carece de licencia declarada, lo que impide su uso comercial incluso si se quisiera.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se documentan sesgos, pero al ser un modelo basado en Mistral y BioMistral, puede heredar sesgos de los datos de entrenamiento originales (PubMed Central y corpus generales). La adaptación al yoruba no está evaluada.
- **Riesgo de alucinación**: no se ha evaluado la fiabilidad en entornos clínicos. BioMistral-7B no está validado para uso profesional en salud, y este modelo no aporta evidencia adicional.
- **Limitaciones de contexto o idioma**: la longitud de contexto no se confirma. El idioma yoruba no está verificado; el modelo podría tener un rendimiento pobre o nulo en ese idioma.
- **Restricciones de licencia**: la licencia es "no disponible", lo que impide cualquier uso comercial o redistribución sin permisos explícitos.
- **Caveats para producción**: no usar en producción sanitaria, no usar para diagnóstico, y no usar sin evaluación previa. El modelo es un POC y no ha recibido ninguna validación externa.

## Enlaces

- [HuggingFace - maimd/BioMistral-CPT-Yoruba-Clinical-POC](https://huggingface.co/maimd/BioMistral-CPT-Yoruba-Clinical-POC)
- [BioMistral-7B (modelo base)](https://huggingface.co/BioMistral/BioMistral-7B)
- [Repositorio GitHub de BioMistral](https://github.com/BioMistral/BioMistral)
- [Paper de BioMistral (arXiv)](https://arxiv.org/abs/2402.10373)
- [Organización BioMistral en HuggingFace](https://huggingface.co/BioMistral)
