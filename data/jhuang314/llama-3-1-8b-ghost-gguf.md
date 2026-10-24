# Jhuang314/Llama-3.1-8B-Ghost-GGUF

## Resumen

Llama-3.1-8B-Ghost es un fine-tune mediante LoRA de meta-llama/Llama-3.1-8B-Instruct desarrollado por el usuario Jhuang314 (Jhuang314/Llama-3.1-8B-Ghost-GGUF en HuggingFace). Su objetivo es muy concreto: imitar la voz de Ghost, el asistente de IA companion del videojuego *Destiny*, con respuestas cortas, leales, secas y con un punto de sarcasmo. No es un modelo de propósito general ni busca mejorar capacidades del modelo base, sino reestilizar el registro conversacional para roleplay y asistentes de voz con personalidad.

Se trata de un proyecto fan no oficial, sin vinculación con Bungie, y el repositorio publicado contiene únicamente pesos en formato GGUF (el modelo card documenta q4_k_m para Ollama), con un tamaño de repo de 4,9 GB. El modelo base aporta la arquitectura y el conocimiento; el adaptador LoRA solo ajusta el estilo, tal como admite el propio autor: "LoRA shapes voice, not knowledge".

Su relevancia es acotada pero útil como caso de estudio: muestra un flujo completo de fine-tune con Unsloth en una GPU gratuita (Colab T4) sobre un dataset minúsculo (200 conversaciones) con enmascarado de pérdida solo en las respuestas del personaje, y sirve como plantilla reproducible para crear personajes conversacionales consistentes sobre un modelo de 8B parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.1 8B Instruct); fine-tune con adaptador LoRA |
| Parametros totales | 8.030.261.312 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens heredados del modelo base Llama 3.1 8B Instruct (no se indica una longitud distinta en la model card) |
| Tipos de cuantizacion | GGUF; el autor documenta y distribuye q4_k_m. Otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Llama 3.1 Community License (llama3.1) |
| Formato de pesos | GGUF (el repositorio solo contiene GGUF; el adaptador LoRA en safetensors no esta publicado en este repo) |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.1 8B Instruct, un transformer decoder-only denso de 8.030 millones de parámetros, y se ajusta con un adaptador LoRA de rango 16 (alpha 16, dropout 0,1) aplicado a todas las proyecciones de atención y MLP. El entrenamiento se realizó con Unsloth en cuantización de 4 bits sobre una Colab T4, con una única época (el autor indica que más épocas sobreajustan un dataset tan pequeño), learning rate 2e-4, batch efectivo de 8 y selección del mejor checkpoint por pérdida de evaluación sobre un conjunto reservado. La pérdida se calcula únicamente sobre las respuestas de Ghost (response-only masking), de modo que el modelo aprende el estilo de respuesta y no el de las intervenciones del usuario.

Los datos son 200 conversaciones curadas a mano, de uno y varios turnos, mezclando chat en personaje y lore de *Destiny*, con 31 conversaciones doradas reservadas para evaluación. El dataset no se ha publicado. No se documenta ninguna innovación técnica adicional (ni decodificación especulativa, ni atención lineal, ni RLHF/DPO); el proceso es un SFT clásico sobre adaptador de bajo rango.

## Capacidades

- Generación de texto conversacional con un registro muy específico: respuestas de 1-2 frases, tono leal, seco y ligeramente sarcástico, llamando "Guardian" al usuario.
- Roleplay e interpretación de personaje consistente en conversaciones multiturno, gracias al enmascarado de pérdida solo en las respuestas del personaje.
- Conversación sobre lore de *Destiny*, limitada al conocimiento que el modelo base ya tuviera (el LoRA no inyecta conocimiento factual nuevo).
- Asistente de voz: el autor lo etiqueta como `voice-assistant` y lo ajusta para respuestas cortas aptas para síntesis de voz (num_predict 80, temperatura 0,7, repeat_penalty 1,15).
- Conversación general en inglés heredada del modelo base Llama 3.1 8B Instruct.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, agentes, visión, audio nativo ni modo "thinking" específico del fine-tune; cualquier capacidad de este tipo provendría del modelo base y no está validada por el autor.
- Multilingüe: no. El autor declara explícitamente inglés únicamente.

## Casos de uso

- Roleplay y entretenimiento conversacional: interpretar a Ghost en una interfaz de chat, con respuestas de 1-2 frases y el system prompt original, aprovechando el ajuste de estilo sobre 200 conversaciones en personaje.
- Prototipado de NPCs con voz propia: usar el modelo como referencia para diseñar diálogos de compañeros o asistentes robóticos en prototipos de videojuego, antes de invertir en un dataset mayor.
- Asistente de voz local: desplegado en Ollama con `num_predict 80` para mantener respuestas cortas y baja latencia, encadenado a un TTS en un dispositivo de gama consumer.
- Q&A de lore con RAG: el propio autor recomienda emparejarlo con recuperación, ya que el LoRA moldea la voz pero no los hechos; útil para una wiki conversacional de *Destiny* donde los datos vengan de un índice documental.
- Plantilla reproducible de fine-tune: sirve como referencia técnica de un pipeline Unsloth + LoRA (r=16, response-only masking, selección por eval loss) para equipos que quieran crear su propio personaje sobre Llama 3.1 8B.
- Chatbot de marca con personalidad seca y concisa: para soporte o acompañamiento donde se prefiera brevedad extrema frente a respuestas largas, sustituyendo el system prompt por el de la marca (requiere revalidar el estilo, ya que el ajuste está sesgado a Ghost).
- Evaluación de riesgos de sobreajuste: caso práctico para estudiar cómo un dataset de 200 ejemplos afecta a la diversidad de respuestas y a la fidelidad factual, antes de decidir si escalar el dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta una evaluación interna cualitativa sobre 31 conversaciones reservadas (selección del mejor checkpoint por `eval loss`), sin cifras de MMLU, HumanEval, GSM8K ni métricas de estilo.

## Requisitos de hardware

- VRAM estimada en q4_k_m (el formato distribuido, repo de 4,9 GB): en torno a 5,5-6,5 GB de VRAM con contexto moderado, dependiendo de la ventana configurada y del tamaño del lote.
- VRAM estimada en FP16 (si se reconvirtiera a partir del modelo base más el adaptador): aproximadamente 16 GB de pesos, más overhead de KV cache.
- VRAM estimada en 8 bits: alrededor de 9 GB de pesos.
- GPU consumer: sí, cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en GPUs Apple Silicon con memoria unificada de 8 GB o más usando q4_k_m.
- GPU de datacenter: A100 40/80 GB, H100 y L40S para servir con lotes concurrentes; a este tamaño no son necesarias para uso individual.
- Despliegue: Ollama está documentado por el autor (con `FROM` sobre el `.gguf` y los parámetros recomendados); llama.cpp es compatible por formato. vLLM, TGI u otros servidores con soporte GGUF no están documentados por el autor.
- Latencia y throughput: no disponibles. El ajuste a respuestas de 1-2 frases (`num_predict 80`) reduce el tiempo de generación por turno, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Ghost | 8,03 B | 128.000 tokens (heredado del base) | LoRA de personaje sobre Llama 3.1 8B Instruct | Llama 3.1 Community License | GGUF en HF; 0 descargas, 0 likes; no verificado por la comunidad |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Instrucción general | Llama 3.1 Community License | Modelo oficial de Meta, ampliamente desplegado |
| Mistral 7B Instruct (v0.2) | ~7,3 B | 32.000 tokens (v0.2) | Instrucción general | Apache 2.0 | Amplia disponibilidad, ecosistema GGUF maduro |
| Qwen2.5-7B-Instruct | ~7,6 B | 128.000 tokens según documentación del autor del modelo | Instrucción general multilingüe | Apache 2.0 | Amplia disponibilidad |

Rendimiento comparado: no disponible. No existen benchmarks publicados de este fine-tune, y comparar métricas de estilo o personaje con modelos de propósito general no sería significativo con los datos aportados. Los datos de los modelos alternativos provienen de sus propias fichas y deben verificarse en la fuente antes de citarlos.

## Limitaciones y advertencias

- El ajuste moldea la voz, no el conocimiento: las respuestas sobre lore de *Destiny* pueden ser incorrectas en cualquier hecho que el modelo base no supiera ya. El autor recomienda explícitamente combinarlo con recuperación (RAG).
- Dataset de entrenamiento minúsculo: 200 conversaciones y una sola época. Riesgo alto de sobreajuste al estilo y baja diversidad de respuestas; el propio autor advierte que más épocas empeoran el sobreajuste.
- Solo inglés. No se ha entrenado ni evaluado en castellano; el uso en español produciría respuestas con calidad degradada y posible mezcla de idiomas.
- Riesgo de alucinación heredado del modelo base de 8B, agravado en un dominio concreto (lore de videojuego) donde el modelo puede inventar nombres, eventos o mecánicas con total seguridad.
- Propiedad intelectual: es un proyecto fan no oficial, no afiliado ni respaldado por Bungie. *Destiny* y sus personajes pertenecen a Bungie, Inc. El uso comercial de un modelo que imita un personaje con marca registrada es jurídicamente arriesgado y no está cubierto por la licencia del modelo.
- Licencia Llama 3.1 Community License: permite uso comercial con condiciones (incluida la cláusula de 700 millones de usuarios activos mensuales y obligaciones de atribución y nomenclatura). Hay que revisar también la Acceptable Use Policy de Meta.
- El repositorio solo publica pesos GGUF, pero la model card documenta el uso con Transformers + PEFT sobre el adaptador LoRA, que no está en este repo. Esa instrucción resulta inconsistente con el contenido publicado.
- Modelo sin tracción ni validación externa: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día. No hay evidencia de terceros que lo hayan evaluado.
- La búsqueda web realizada no devolvió resultados relacionados con el modelo (solo contenido spam sin relación), por lo que no hay información independiente que contrastar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jhuang314/Llama-3.1-8B-Ghost-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Acceptable Use Policy de Llama 3.1: https://www.llama.com/llama3_1/use-policy/
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la busqueda web disponible; los resultados devueltos no guardaban relacion con el modelo.
