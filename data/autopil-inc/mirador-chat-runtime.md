# AutoPIL-Inc/Mirador-Chat-Runtime

## Resumen

AutoPIL-Inc/Mirador-Chat-Runtime es un modelo de generación de texto conversacional publicado en Hugging Face por AutoPIL-Inc, una empresa centrada en la gobernanza de agentes de IA, la aplicación de políticas en tiempo de ejecución y el registro de auditoría. El repositorio declara la librería transformers, pesos en safetensors y etiquetas que apuntan a la familia Llama, a text-generation-inference y a endpoints compatibles, pero no incluye tarjeta de modelo, licencia ni lista de idiomas.

El nombre sugiere un componente de runtime de chat dentro del ecosistema AutoPIL/Mirador, una plataforma de observabilidad que unifica trazas, métricas y eventos. Sin documentación técnica publicada, no es posible confirmar si se trata de un modelo entrenado desde cero, un ajuste fino de Llama o un artefacto de despliegue. Su relevancia actual como modelo abierto es limitada: no hay descargas, likes ni resultados de benchmarks que permitan evaluarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Familia Llama (según etiqueta "llama"); variante y configuración no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (sin evidencia de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; pesos publicados en safetensors, sin variantes GGUF, AWQ o GPTQ documentadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors |
| Librería | transformers |
| Pipeline | text-generation |
| Etiquetas relevantes | conversational, text-generation-inference, endpoints_compatible, region:us |
| Fecha de creación | 2026-10-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La única información estructural disponible es la etiqueta "llama", que sitúa el modelo en la familia de transformers decoder-only de Meta Llama, y el formato safetensors. No se especifican número de capas, dimensión oculta, cabezas de atención, tamaño de vocabulario ni mecanismo de atención. Tampoco se documenta si emplea GQA, RoPE, activación SwiGLU u otras variantes habituales en Llama.

No hay información sobre datos de entrenamiento: número de tokens, composición del corpus, fases de preentrenamiento, ajuste supervisado, RLHF o DPO. La etiqueta arXiv:1910.09700 remite al artículo de Madry et al. sobre entrenamiento adversarial robusto (PGD), pero su presencia en las etiquetas no confirma que se haya aplicado esa técnica. No se puede verificar ninguna innovación técnica.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y la etiqueta conversational indica uso previsto en diálogo multi-turno.
- Integración con Transformers: carga mediante AutoModelForCausalLM y AutoTokenizer si los pesos siguen el formato estándar de Llama.
- Despliegue en TGI: la etiqueta text-generation-inference sugiere compatibilidad con Text Generation Inference.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible apunta a despliegue detrás de endpoints de inferencia.
- Tool calling y function calling: no documentado.
- Razonamiento multi-paso y agentes: no documentado; el nombre "Runtime" no implica capacidades de agente.
- Capacidades multilingües: no disponible.
- Visión, audio o modo thinking: no disponible.

## Casos de uso

- Runtime de chat en despliegues AutoPIL: servir turnos de conversación y registrar cada interacción para auditoría; encaja si el modelo se expone vía TGI y el registro lo aporta la plataforma de gobierno.
- Agentes gobernados vía MCP: AutoPIL documenta un servidor MCP; el modelo podría actuar como generador de respuestas del agente mientras las políticas se aplican en la capa de gobierno.
- Observabilidad en Mirador: generar resúmenes de trazas o conversaciones para el panel de Mirador AI; requiere validación de calidad y control de coste por token.
- Sandbox de pruebas de políticas: entorno controlado para evaluar cómo responde el modelo bajo reglas de cumplimiento antes de desplegarlo en producción.
- Atención al cliente en sectores regulados: conversaciones multi-turno con trazabilidad; la licencia no disponible impide el uso comercial sin aclaración previa.
- Evaluación comparativa interna: base para pruebas A/B frente a Llama, Mistral o Qwen; sin benchmarks públicos, la evaluación debe diseñarse y ejecutarse internamente.
- Generación de borradores en flujos internos: respuestas, correos y resúmenes con revisión humana, siempre que se confirme el rendimiento en el idioma objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones conversacionales que permitan comparar el modelo con alternativas.

## Requisitos de hardware

- VRAM estimada: no determinable sin conocer el número de parámetros. Como referencia genérica para modelos Llama, un modelo de 7-8B en FP16 requiere aproximadamente 14-16 GB de VRAM, y en cuantización de 4 bits unos 5-6 GB; un modelo de 13B en FP16 ronda los 26 GB; uno de 70B en FP16 supera los 140 GB y exige múltiples GPU. Estas cifras no están confirmadas para este repositorio.
- GPU recomendadas: no determinables. Para un hipotético tamaño de 7-8B serían adecuadas una RTX 4090 de 24 GB, una A10G de 24 GB, una L4 de 24 GB o una A100 de 40/80 GB; para tamaños mayores, A100 u H100 en configuraciones multi-GPU.
- Compatibilidad con GPU de consumo: depende del tamaño y de la cuantización; solo sería viable en GPUs de consumo si el modelo es de 13B o menos y se cuantiza.
- Opciones de despliegue: transformers está confirmado por la librería declarada; Text Generation Inference y endpoints de inferencia están sugeridos por las etiquetas. vLLM, llama.cpp y Ollama no están confirmados, aunque serían viables si los pesos siguen el formato estándar de Llama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación es provisional porque se desconoce el tamaño del modelo. Se usan como referencia modelos Llama de 7-8B y alternativas habituales de la misma franja.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Mirador-Chat-Runtime | no disponible | no disponible | no disponible | Hugging Face, 0 descargas | no disponible |
| Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community License | Hugging Face | Ampliamente evaluado con benchmarks públicos |
| Mistral 7B Instruct | 7.3B | 32k | Apache 2.0 | Hugging Face | Ampliamente evaluado con benchmarks públicos |
| Qwen2.5 7B Instruct | 7.6B | 128k | Apache 2.0 | Hugging Face | Ampliamente evaluado con benchmarks públicos |

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial, modificación ni redistribución sin aclaración legal previa.
- Sin tarjeta de modelo: se desconocen la procedencia de los datos, los filtros aplicados, los sesgos y las posibles contaminaciones de benchmarks.
- Riesgo de alucinación: inherente a los modelos generativos; no hay benchmarks ni evaluaciones independientes que permitan cuantificarlo.
- Idiomas no declarados: la cobertura del español es desconocida y podría ser limitada o nula.
- Contexto desconocido: no es apto para tareas que requieran ventanas largas sin verificar antes la longitud máxima soportada.
- Sin validación comunitaria: 0 descargas y 0 likes; no existen informes independientes de uso.
- Posible artefacto de despliegue: el nombre "Runtime" y la ausencia de documentación sugieren que podría ser un wrapper o un componente de servicio más que un modelo base; conviene revisar config.json y el tamaño de los safetensors antes de usarlo.
- Fecha de creación 2026-10-18: el metadato puede indicar una publicación programada o un error; debe verificarse.
- Las capacidades de gobernanza, auditoría y aplicación de políticas pertenecen a la plataforma AutoPIL, no al modelo; no deben atribuirse al artefacto de Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AutoPIL-Inc/Mirador-Chat-Runtime
- AutoPIL: https://www.autopil.ai/
- Documentación de AutoPIL: https://www.autopil.ai/docs
- Ejemplos de AutoPIL en GitHub: https://github.com/AutoPIL-INC/autopil-examples
- Mirador AI: https://mirador.org/ai
- Mirador: https://mirador.org/
- Artículo arXiv referenciado en las etiquetas: https://arxiv.org/abs/1910.09700
