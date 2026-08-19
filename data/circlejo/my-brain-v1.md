# circlejo/my-brain-v1

## Resumen

`circlejo/my-brain-v1` es un ajuste fino (fine-tuning) del modelo `unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit`, que a su vez se basa en el modelo Qwen2.5 de 3 mil millones de parámetros en su variante instructiva. El autor, identificado como `circlejo`, ha utilizado la librería Unsloth para acelerar el entrenamiento junto con el paquete TRL de Hugging Face. Se trata de un modelo de generación de texto orientado a conversación, con licencia Apache-2.0 y soporte declarado únicamente para inglés.

La relevancia de este modelo radica en su tamaño compacto (aproximadamente 3,09 mil millones de parámetros), lo que lo hace adecuado para entornos con recursos limitados, como GPUs de consumo o inferencia en el borde. Al ser un fine-tuning de Qwen2.5, hereda las capacidades generales del modelo base, aunque no se han publicado detalles específicos sobre el conjunto de datos de entrenamiento ni sobre las mejoras introducidas por el ajuste. Su publicación es reciente y aún no cuenta con descargas ni valoraciones, lo que sugiere que se trata de un proyecto experimental o personal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-3B-Instruct soporta 32 768 tokens, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos en safetensors; no se especifica la precisión de los pesos) |
| Idiomas soportados | inglés (según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar. El proceso de ajuste fino se realizó sobre el checkpoint `unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit`, que ya incorpora cuantización de 4 bits para el entrenamiento (bitnet bnb). El autor utilizó Unsloth, una librería que optimiza el entrenamiento de modelos de lenguaje reduciendo el uso de memoria y acelerando el proceso, junto con la biblioteca TRL de Hugging Face para el entrenamiento con aprendizaje por refuerzo o ajuste supervisado.

No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas como RLHF, DPO o SFT. Tampoco se mencionan innovaciones técnicas adicionales más allá del uso de Unsloth para la aceleración. El modelo está etiquetado como `text-generation-inference`, lo que indica compatibilidad con el servidor de inferencia TGI de Hugging Face, y se declara `endpoints_compatible`.

## Capacidades

- Generación de texto conversacional: al ser un fine-tuning de Qwen2.5-Instruct, el modelo está diseñado para seguir instrucciones y mantener diálogos multi-turno.
- Razonamiento básico y comprensión de lenguaje natural: hereda las capacidades del modelo base Qwen2.5 de 3B, que incluyen tareas de comprensión lectora, respuesta a preguntas y razonamiento simple.
- Generación de código: el modelo base Qwen2.5-Instruct tiene cierta competencia en tareas de programación, aunque limitada por su tamaño.
- Soporte multilingüe: no declarado; la model card solo indica inglés.
- Tool calling / function calling: no se menciona explícitamente, pero Qwen2.5-Instruct soporta esta funcionalidad; no se confirma si el fine-tuning la conserva.
- Modo de pensamiento extendido: no disponible.

## Casos de uso

- Asistente conversacional ligero: por su tamaño reducido, puede desplegarse en entornos con poca memoria, como Raspberry Pi o GPUs de gama baja, para chatbots de soporte o asistentes personales.
- Generación de respuestas en aplicaciones de atención al cliente: el modelo puede gestionar consultas simples en inglés, manteniendo el contexto de la conversación, aunque con limitaciones en diálogos muy largos.
- Prototipado rápido de aplicaciones de IA: al ser un modelo pequeño y con licencia permisiva, es útil para validar ideas antes de escalar a modelos más grandes.
- Educación y experimentación: sirve para estudiar técnicas de fine-tuning, comparar efectos de ajuste sobre Qwen2.5 o como base para proyectos académicos.
- Inferencia en el borde (edge computing): su tamaño permite ejecutarlo en dispositivos con recursos limitados, como teléfonos móviles o sistemas embebidos, para tareas de generación de texto en tiempo real.
- Integración en pipelines de automatización: puede usarse para generar informes, resumir correos o redactar respuestas estándar en inglés, siempre que la complejidad de la tarea sea baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16, aproximadamente 6 GB de VRAM (3,09 B × 2 bytes). Con cuantización a 4 bits, se reduce a ~1,5-2 GB.
- GPU recomendadas: tarjetas con al menos 6 GB de VRAM, como NVIDIA RTX 3060, RTX 4060 o superiores. También puede ejecutarse en GPUs de 4 GB si se aplica cuantización.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo medio (RTX 3060, RTX 4070, etc.) con cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI (por las etiquetas `text-generation-inference` y `endpoints_compatible`), así como la librería `transformers` estándar.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| circlejo/my-brain-v1 | 3,09 B | no disponible (base 32k) | Apache-2.0 | Fine-tuning de Qwen2.5-3B-Instruct |
| Qwen2.5-3B-Instruct (base) | 3,09 B | 32 768 tokens | Apache-2.0 | Modelo original, ampliamente probado |
| Llama-3.2-3B-Instruct | 3,21 B | 128 000 tokens | Llama 3.2 Community License | Modelo de Meta, con contexto largo |
| Phi-3-mini-4k-instruct | 3,8 B | 4 096 tokens | MIT | Modelo de Microsoft, optimizado para razonamiento |

Nota: los datos de los modelos comparables provienen de sus respectivas documentaciones públicas. No se dispone de resultados de rendimiento para `circlejo/my-brain-v1`, por lo que la comparación se limita a especificaciones generales.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, alucinaciones o comportamientos indeseados; al ser un fine-tuning sin documentación, estos riesgos no están evaluados.
- El modelo solo declara soporte para inglés; su rendimiento en otros idiomas es desconocido y probablemente deficiente.
- La longitud de contexto no está confirmada; aunque el modelo base soporta 32 768 tokens, el fine-tuning podría haber reducido ese límite.
- Es un modelo de 3B parámetros, por lo que su capacidad de razonamiento complejo, matemáticas avanzadas o generación de código extenso es limitada en comparación con modelos más grandes.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base (`unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit`) y sus componentes (Qwen2.5) no impongan restricciones adicionales; Qwen2.5 está bajo Apache-2.0, así que no se esperan conflictos.
- El repositorio no incluye documentación sobre el proceso de entrenamiento, el dataset utilizado ni las métricas de evaluación, lo que dificulta la reproducibilidad y la confianza en el modelo.

## Enlaces

- Hugging Face: [circlejo/my-brain-v1](https://huggingface.co/circlejo/my-brain-v1)
- Repositorio de Unsloth: [https://github.com/unslothai/unsloth](https://github.com/unslothai/unsloth)
- Modelo base: [unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit](https://huggingface.co/unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit)
