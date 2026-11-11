# IINOVAII/Llama-3.2-3B-Tameez-GRPO-step300

## Resumen

Llama-3.2-3B-Tameez-GRPO-step300 es el checkpoint final (paso 300 de 300) del entrenamiento GRPO del proyecto Tameez, aplicado sobre Llama-3.2-3B-Instruct mediante un pipeline de tres etapas: modelo base, SFT en hindi/hinglish y refuerzo con GRPO en un entorno de seguridad. Lo desarrolla IINOVAII en el marco del hackathon lexsi y su objetivo es alinear modelos pequeños para que respondan de forma segura en tres registros que los usuarios indios emplean realmente: hindi en devanagari, hinglish en alfabeto latino e inglés.

El problema que aborda es concreto: el ajuste de seguridad suele hacerse en inglés y rara vez se mide en hinglish. Los autores documentan que ambos modelos base eran varias veces más propensos a responder de forma insegura a la misma petición dañina escrita en hinglish que en hindi, y que un SFT convencional en hindi sin datos de seguridad empeoraba la seguridad (Llama-3.2-3B pasó de 10,0 % a 15,6 % de respuestas inseguras). Tameez corrige esto con una etapa de aprendizaje por refuerzo con seis recompensas separadas.

Se trata de un transformer decoder-only de 3.212.749.824 parámetros, con pesos completos en bf16 (6,4 GB en el repositorio). El autor indica explícitamente que este checkpoint no es el recomendado del proyecto: existe para estudiar el final del entrenamiento y compararlo con el checkpoint elegido (paso 100, Llama-3.2-3B-Tameez-GRPO) y con Tiny-Aya-Global-Tameez-GRPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste LoRA fusionado en pesos completos bf16 |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en bf16) |
| Idiomas soportados | hindi (hi), inglés (en); incluye hinglish en alfabeto latino segun la model card |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de meta-llama/Llama-3.2-3B-Instruct, un transformer decoder-only de 3,2 mil millones de parámetros. El pipeline Tameez consta de tres etapas sobre dos modelos base con datos, recompensas, ajustes y evaluación idénticos. La etapa 0 es el modelo base sin tocar. La etapa 1 es un SFT con LoRA sobre 5.000 filas de instrucciones ordinarias en hindi/hinglish, sin datos de seguridad, que sirve como línea base realista de lo que se obtiene al "añadir hindi". La etapa 2 aplica GRPO sobre la etapa 1 en un entorno de seguridad con 4.652 prompts etiquetados y seis recompensas ponderadas, usando la ventaja relativa de grupo de Dr. GRPO para empujar la LoRA hacia las respuestas mejores; cada prompt recibe 4 respuestas. Los checkpoints se seleccionan por reglas fijas y se fusionan.

Los datos se construyen a partir de ocho conjuntos públicos, limpiados y reescritos a hinglish natural con Aya Expanse 8B, etiquetados por daño con Llama-Guard-3-1B y divididos en cuatro conjuntos disjuntos: A para SFT, B para el pool de prompts de RL, C para tests de seguridad reservados y D para tests de habilidad reservados. La evaluación usa 2.014 prompts de seguridad, 200 prompts de utilidad en hindi y 14.831 preguntas de conocimiento hindi MILU, con jueces que nunca participan en el entrenamiento (Llama-Guard-3-8B y un clasificador de lenguaje abusivo MuRIL) para evitar que el modelo puntúe bien solo por complacer a su propia recompensa.

## Capacidades

- Generación de texto conversacional multi-turno en hindi (devanagari), hinglish (alfabeto latino) e inglés.
- Rechazo educado y explícito de peticiones dañinas en el idioma y alfabeto del usuario.
- Abstención de lenguaje abusivo incluso cuando el usuario insulta.
- Mantenimiento de respuestas útiles ante preguntas benignas con palabras aparentemente amenazantes ("cómo mato un proceso de Linux", "haz mi presentación killer").
- Respuesta a usuarios enfadados que plantean una pregunta real, sin rechazar por el tono.
- Conocimiento del mundo en hindi (evaluado con MILU).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (modelo solo de texto).

## Casos de uso

- Moderación y respuesta segura en asistentes de atención al cliente para el mercado indio: el modelo puede gestionar conversaciones multi-turno en hindi, hinglish e inglés y rechazar peticiones dañinas en el mismo registro lingüístico del usuario, lo que reduce la brecha de seguridad detectada entre hindi e hinglish.
- Despliegue en aplicaciones de chat orientadas a usuarios que escriben en hinglish con alfabeto latino: es el escenario donde este checkpoint muestra su mejor ventaja frente a alternativas (15,8 % de respuestas inseguras en red-teaming hinglish frente a 29,5 % de Tiny-Aya-Global-Tameez-GRPO).
- Filtro previo o posterior en pipelines de generación: dado su tamaño de 3,2 B, puede ejecutarse como clasificador generativo de seguridad junto a un modelo mayor, revisando o reescribiendo respuestas antes de mostrarlas.
- Investigación sobre alineación y RLHF/GRPO: el repositorio incluye datos de entrenamiento, salidas de evaluación y logs (IINOVAII/tameez-hindi-safety-data, tameez-eval-outputs, tameez-training-logs), lo que permite reproducir el estudio del final del entrenamiento y comparar el paso 300 con el paso 100.
- Estudio de sobre-rechazo en producción: con 7,0 % de rechazos incorrectos a prompts benignos y 15,5 % a usuarios enfadados con pregunta real, sirve para calibrar umbrales de abstención en sistemas reales.
- Asistentes de soporte técnico en hindi/hinglish: puede responder a consultas legítimas que contienen términos potencialmente alarmantes (comandos de sistema, seguridad informática) sin caer en rechazos automáticos.
- Base para ajuste posterior con licencia comercial: la Llama 3.2 Community License permite uso comercial bajo los términos de Meta, a diferencia de la licencia CC-BY-NC 4.0 de la alternativa recomendada del proyecto.

## Benchmarks y rendimiento

Datos publicados en la model card para el modelo final (etapa 2) y su comparación con la alternativa del mismo proyecto. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | Llama-3.2-3B-Tameez-GRPO (paso 100, recomendado) | Este checkpoint (paso 300) |
|---|---|---|
| Respuestas inseguras, 1.498 prompts dañinos ↓ | 3,7 % | no disponible |
| Inseguras, red-teaming hindi ↓ | 2,6 % | no disponible |
| Inseguras, red-teaming hinglish ↓ | 15,8 % | no disponible |
| Rechazo explícito y educado de prompts dañinos ↑ | 58,5 % | no disponible |
| Rechazos incorrectos a prompts benignos ↓ | 7,0 % | no disponible |
| Rechazos incorrectos a usuarios enfadados con pregunta real ↓ | 15,5 % | no disponible |
| Respuestas abusivas (MuRIL) ↓ | 7,5 % | no disponible |
| Respuestas con palabras malsonantes ↓ | 0,7 % | no disponible |
| Conocimiento hindi MILU ↑ | 39,5 % | no disponible |
| Juzgado más útil que su propio modelo de etapa 1 ↑ | 42,1 % | no disponible |

Comparación interna de checkpoints en el mini test set de selección:

| Checkpoint | Inseguras | Palabras malsonantes | Sobre-rechazo | Longitud media de respuesta |
|---|---|---|---|---|
| Etapa 1 (referencia) | 13,8 % | 2,5 % | 4,2 % | 793 caracteres |
| Paso 100 (elegido) | 5,0 % | 2,0 % | 5,8 % | 602 caracteres |
| Paso 300 (este modelo) | el más seguro del run | no disponible | superior al paso 100 | respuestas mucho más breves |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 6,5-7 GB solo para pesos, más overhead de activaciones y KV cache; cómodo en GPUs de 16 GB o más.
- VRAM estimada en cuantización de 8 bits: aproximadamente 3,5-4 GB; en 4 bits: aproximadamente 2-2,5 GB (estimaciones a partir del tamaño de parámetros; no publicadas por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con concurrencia; RTX 4090, RTX 3090 o RTX 4080 para desarrollo y pruebas.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB o superiores con bf16; en GPUs de 8 GB es necesario cuantizar.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), vLLM, llama.cpp y Ollama si se generan pesos GGUF a partir de los safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad hinglish | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-Tameez-GRPO-step300 (este) | 3,2 B | no disponible | el más seguro del run en el mini test set | Llama 3.2 Community License | Hugging Face |
| Llama-3.2-3B-Tameez-GRPO (paso 100) | 3,2 B | no disponible | 15,8 % inseguras en red-teaming hinglish | Llama 3.2 Community License | Hugging Face |
| Tiny-Aya-Global-Tameez-GRPO | no disponible | no disponible | 29,5 % inseguras en red-teaming hinglish | CC-BY-NC 4.0 (no comercial) | Hugging Face |
| Llama-3.2-3B-Instruct (base) | 3,2 B | 128 K (según Meta) | 10,0 % inseguras antes de SFT; 15,6 % tras SFT en hindi | Llama 3.2 Community License | Hugging Face |

## Limitaciones y advertencias

- El propio autor indica que este checkpoint no es el recomendado: existe para estudiar el final del entrenamiento. El modelo recomendado del proyecto es el paso 100 y, globalmente, Tiny-Aya-Global-Tameez-GRPO.
- El paso 300 es el más seguro del run en el mini test set, pero rechaza más y responde de forma mucho más breve, lo que degrada la utilidad conversacional.
- El SFT en hindi sin datos de seguridad empeora la seguridad del modelo base (10,0 % a 15,6 % de respuestas inseguras); cualquier ajuste posterior debe tenerlo en cuenta.
- La seguridad en hinglish sigue siendo el punto débil: 15,8 % de respuestas inseguras en red-teaming hinglish, frente a 2,6 % en hindi.
- Tasa de sobre-rechazo relevante: 7,0 % en prompts benignos y 15,5 % en usuarios enfadados con una pregunta real.
- El modelo pierde utilidad frente a su propia etapa 1: el juez de utilidad lo prefirió solo el 42,1 % de las veces.
- Riesgo de alucinación no cuantificado en la información disponible; el conocimiento hindi medido (MILU 39,5 %) es limitado.
- Idiomas cubiertos: hindi, hinglish e inglés; no hay evidencia de soporte para otras lenguas.
- Licencia Llama 3.2 Community License: permite uso comercial bajo los términos de Meta, pero impone restricciones (por ejemplo, denominación y políticas de uso aceptable) que deben revisarse antes de producción.
- Sesgos conocidos: no documentados explícitamente en la información disponible; los jueces de evaluación (Llama-Guard-3-8B y MuRIL) pueden introducir sus propios sesgos en las métricas reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IINOVAII/Llama-3.2-3B-Tameez-GRPO-step300
- Checkpoint recomendado del mismo run: https://huggingface.co/IINOVAII/Llama-3.2-3B-Tameez-GRPO
- Alternativa recomendada del proyecto: https://huggingface.co/IINOVAII/Tiny-Aya-Global-Tameez-GRPO
- Modelo base del SFT: https://huggingface.co/IINOVAII/Llama-3.2-3B-Hindi-SFT
- Modelo base original: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Dataset de seguridad: https://huggingface.co/datasets/IINOVAII/tameez-hindi-safety-data
- Salidas de evaluación: https://huggingface.co/datasets/IINOVAII/tameez-eval-outputs
- Logs de entrenamiento: https://huggingface.co/datasets/IINOVAII/tameez-training-logs
