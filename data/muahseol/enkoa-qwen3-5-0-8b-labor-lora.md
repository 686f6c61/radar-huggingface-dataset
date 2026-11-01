# muahseol/enkoa-qwen3.5-0.8b-labor-lora

## Resumen

El modelo `muahseol/enkoa-qwen3.5-0.8b-labor-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario muahseol en HuggingFace, diseñado para el modelo base `Qwen/Qwen3.5-0.8B`. Se trata de un artefacto formativo: según la model card, ha sido entrenado con datos de consultas laborales dentro del material didáctico del curso de deep learning de ENKOA AI Campus, concretamente en la lección 01 de la unidad de LoRA. Su propósito es servir como ejemplo práctico para que los alumnos descarguen el adaptador y lo sirvan con el motor de inferencia vLLM en la unidad correspondiente del curso.

El adaptador emplea la técnica LoRA con rango r=8 sobre las capas de texto del modelo base, y se distribuye en formato PEFT con pesos safetensors. No se trata de un modelo de producción: el propio autor advierte explícitamente que es un modelo de ejemplo para formación y que no debe utilizarse en consultas reales. El repositorio tiene un tamaño de 0.0 GB (los pesos del adaptador son de muy baja magnitud) y cuenta con 15 descargas y 0 likes en el momento de la consulta.

Por su naturaleza de adaptador didáctico y su reducido tamaño (el modelo base Qwen3.5-0.8B tiene 0.8 mil millones de parámetros), su relevancia es fundamentalmente educativa: ilustra el flujo completo de entrenamiento LoRA, publicación en el Hub y despliegue con vLLM, más que un caso de uso real de asistencia laboral. La licencia apache-2.0 permite reutilización y modificación sin restricciones comerciales, pero la calidad y fiabilidad del modelo no están garantizadas para ningún escenario productivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3.5-0.8B |
| Parametros totales | 0.8B en el modelo base; el adaptador es de rango bajo (r=8) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA adapter) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA aplicada sobre el modelo Qwen3.5-0.8B, un transformer decoder-only de 0.8 mil millones de parámetros. La configuración LoRA indicada en la model card es r=8, y el entrenamiento se ha realizado sobre las capas de texto del modelo base (clase de capas exclusivamente textual, sin componentes multimodales). El adaptador se publica en formato PEFT, lo que permite cargarlo sobre el modelo base con la librería `peft` de HuggingFace.

Los datos de entrenamiento corresponden a un conjunto de consultas laborales (노무 상담 데이터) empleado en el material didáctico del curso ENKOA AI Campus, dentro de la lección 01 de la unidad de LoRA. No se especifican en la información disponible el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. No se documentan innovaciones técnicas adicionales más allá del uso estándar de LoRA para ajuste eficiente de parámetros.

## Capacidades

- Generación de texto en coreano sobre temática laboral, limitada al dominio de los datos de entrenamiento didáctico.
- Ajuste fino mediante LoRA sobre las capas de texto del modelo base Qwen3.5-0.8B.
- Carga y despliegue con la librería PEFT y con el motor de inferencia vLLM, tal como se describe en la model card.
- Capacidad multilingüe: no disponible (el adaptador está etiquetado únicamente para coreano).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el adaptador se limita a capas de texto.

## Casos de uso

- Formación en ajuste fino con LoRA: el adaptador sirve como ejemplo práctico para que los alumnos del curso ENKOA AI Campus comprendan el flujo completo de entrenamiento, publicación y carga de un adaptador LoRA sobre un modelo base.
- Práctica de despliegue con vLLM: la model card indica que la unidad de vLLM del curso descarga este repositorio y lo levanta como servidor, por lo que el caso de uso principal es el despliegue de un adaptador PEFT en un motor de inferencia de alto rendimiento.
- Demostración de carga de adaptadores PEFT: permite ilustrar cómo se combina un adaptador de rango bajo con un modelo base de 0.8B mediante la librería `peft`, sin necesidad de reentrenar el modelo completo.
- Ejemplo de publicación en HuggingFace Hub: el repositorio muestra la estructura de una model card con metadatos (base_model, library_name, tags) y la organización de artefactos de un adaptador LoRA.
- Experimentación con dominio coreano laboral: sirve para explorar cómo un ajuste LoRA sobre datos de consultas laborales en coreano modifica el comportamiento del modelo base, siempre en un contexto de laboratorio.
- Comparación de configuraciones LoRA: al tener r=8 documentado, puede usarse como referencia en ejercicios que comparen distintos rangos y su efecto en la calidad y el tamaño del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3.5-0.8B es de 0.8B parámetros, por lo que en fp16 requiere aproximadamente 1.6 GB de VRAM, y en cuantizaciones de 8 o 4 bits puede ocupar menos de 1 GB. El adaptador LoRA añade una sobrecarga mínima (r=8).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de datacenter (A100, H100) aunque estén sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2-4 GB de VRAM.
- Opciones de despliegue: vLLM (indicado explícitamente en la model card), así como PEFT con Transformers; llama.cpp y Ollama requerirían conversión del adaptador a GGUF, no documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| enkoa-qwen3.5-0.8b-labor-lora | 0.8B (base) + LoRA r=8 | no disponible | apache-2.0 | HuggingFace (15 descargas) | Adaptador didáctico coreano para consultas laborales |
| Qwen/Qwen3.5-0.8B | 0.8B | no disponible | no disponible en la informacion | HuggingFace | Modelo base sin ajuste; capacidades generales |
| Adaptadores LoRA genéricos sobre modelos de 1B | ~1B (base) | variable | variable | HuggingFace | Alternativas no verificadas en la informacion disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo exclusivamente didáctico: el autor advierte explícitamente que es un modelo de ejemplo para formación y que no debe usarse en consultas reales.
- Riesgo elevado de alucinación y respuestas incorrectas en materia laboral, dado el reducido tamaño del modelo base y el carácter limitado de los datos de entrenamiento.
- Dominio restringido a consultas laborales en coreano; no se garantiza un comportamiento adecuado fuera de ese ámbito ni en otros idiomas.
- Sesgos potenciales derivados de los datos de entrenamiento didácticos, no documentados en la model card.
- Limitaciones de contexto e idioma no especificadas; se heredan del modelo base Qwen3.5-0.8B.
- Licencia apache-2.0: permite uso comercial y modificación, pero ello no implica que el modelo sea apto para producción.
- No se documentan procesos de evaluación, alineación (RLHF/DPO) ni métricas de calidad.
- El repositorio tiene un tamaño de 0.0 GB y muy baja tracción (15 descargas, 0 likes), lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- [HuggingFace: muahseol/enkoa-qwen3.5-0.8b-labor-lora](https://huggingface.co/muahseol/enkoa-qwen3.5-0.8b-labor-lora)
- [Modelo base: Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
