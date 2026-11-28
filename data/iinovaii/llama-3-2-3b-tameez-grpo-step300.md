# IINOVAII/Llama-3.2-3B-Tameez-GRPO-step300

## Resumen

Llama-3.2-3B-Tameez-GRPO-step300 es el checkpoint final (paso 300 de 300) de un proceso de alineamiento por refuerzo con GRPO (Group Relative Policy Optimization) aplicado sobre Llama-3.2-3B-Instruct, desarrollado por el usuario IINOVAII en el contexto del hackathon Lexsi. Forma parte del proyecto Tameez ("modales" en hindi), cuyo objetivo es que modelos pequenos de chat se comporten de forma segura y educada en hindi en escritura devanagari, hinglish en alfabeto latino e ingles, sin sacrificar capacidades de ayuda en hindi.

El modelo resuelve un problema concreto y medido: el ajuste de seguridad suele hacerse en ingles y rara vez se evalua en hindi romanizado. Los autores documentan que las instrucciones maliciosas escritas en hinglish reciben respuestas inseguras entre dos y siete veces mas a menudo que las mismas peticiones en devanagari, y que un SFT convencional en hindi reduce la seguridad (en Llama-3.2-3B, las respuestas inseguras pasan del 10,0 % al 15,6 %). Tameez anade una etapa de RL con seis recompensas para corregir esa deriva.

Es importante senalar que este checkpoint no es el recomendado por los propios autores: existe para estudiar el final del entrenamiento y compararlo con el checkpoint elegido (paso 100) y con las variantes sobre Tiny Aya. La arquitectura es la de Llama 3.2 3B Instruct (transformer denso, 3.212.749.824 parametros), con pesos fusionados en bf16 tras el entrenamiento LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.2), ajuste con LoRA y GRPO, pesos fusionados en bf16 |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-3.2-3B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors bf16) |
| Idiomas soportados | hindi (devanagari), hinglish (hindi en alfabeto latino), ingles |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (repo de 6,4 GB) |
| Modelo base | IINOVAII/Llama-3.2-3B-Hindi-SFT sobre meta-llama/Llama-3.2-3B-Instruct |
| Libreria | transformers |
| Pipeline | text-generation |
| Descargas / likes | 190 / 0 |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.2-3B-Instruct, un transformer denso de 3.212.749.824 parametros. El pipeline Tameez consta de tres etapas identicas aplicadas a tres modelos base (Tiny Aya Global, Tiny Aya Fire y Llama-3.2-3B-Instruct): etapa 0, modelo base sin tocar; etapa 1, SFT con LoRA sobre 5.000 filas de instrucciones ordinarias en hindi e hinglish sin datos de seguridad; y etapa 2, GRPO sobre el modelo de la etapa 1 en un entorno de RL de seguridad con 4.652 prompts etiquetados y seis recompensas ponderadas. Cada prompt recibe cuatro respuestas y la ventaja relativa de grupo (estilo Dr. GRPO) empuja la LoRA hacia las mejores. Los checkpoints se seleccionan con reglas fijas y se fusionan en pesos completos bf16.

Los datos se construyen a partir de ocho conjuntos publicos, limpiados y reescritos a hinglish natural con Aya Expanse 8B, etiquetados por dano con Llama-Guard-3-1B y divididos en cuatro conjuntos disjuntos: A para SFT, B para el pool de prompts de RL, C para tests de seguridad reservados y D para tests de habilidades reservados. La evaluacion usa 2.014 prompts de seguridad, 200 de ayuda en hindi y 14.831 preguntas de conocimiento hindi (MILU), con jueces que nunca participan en el entrenamiento (Llama-Guard-3-8B y un clasificador de lenguaje abusivo MuRIL). Este checkpoint concreto corresponde al paso 300 de 300, el ultimo del run.

## Capacidades

- Generacion de texto conversacional multi-turno en hindi (devanagari), hinglish y ingles.
- Rechazo educado de peticiones daninas en el idioma y alfabeto del usuario.
- Mantenimiento de la utilidad ante preguntas benignas que contienen palabras aparentemente amenazantes (por ejemplo, "kill a Linux process" o "a killer presentation").
- Respuesta a usuarios que insultan sin devolver el insulto ni abandonar la pregunta real.
- Conocimiento y ayuda en hindi medidos con MILU (39,5 % en este checkpoint).
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.
- No se documenta modo de razonamiento explicito (thinking mode).

## Casos de uso

- Moderacion y respuesta segura en asistentes de atencion al cliente para el mercado indio: el modelo mantiene conversaciones multi-turno en devanagari, hinglish y ingles, y rechaza peticiones daninas en la misma variante linguistica del usuario, lo que encaja con usuarios que alternan alfabetos.
- Chatbot de soporte tecnico en hinglish: preguntas como "linux mein process kill kaise karein?" se responden sin falsos rechazos, gracias al entrenamiento explicito contra el sobre-rechazo de preguntas benignas con palabras amenazantes.
- Filtro de seguridad previo o posterior en pipelines de moderacion: puede usarse como generador de respuestas de rechazo educadas y como referencia para comparar la tasa de respuestas inseguras en hindi romanizado frente a devanagari.
- Investigacion en alineamiento multilingue: sirve como punto de comparacion del final del entrenamiento GRPO frente al checkpoint del paso 100 y frente a las variantes Tiny Aya, con los mismos tests reservados y jueces independientes.
- Educacion y tutoria en hindi: responde preguntas de conocimiento general en hindi (evaluado con MILU) manteniendo un tono educado incluso ante usuarios hostiles.
- Prototipado de asistentes para comunidades que escriben hindi en alfabeto latino: cubre el caso de uso real de hinglish, que el ajuste de seguridad en ingles suele ignorar.
- Evaluacion de robustez conversacional: util para medir la tasa de rechazo erroneo de usuarios enfadados con preguntas legitimas (15,5 % en este checkpoint).

## Benchmarks y rendimiento

Resultados publicados por los autores para este checkpoint (paso 300 de 300) frente a los otros dos modelos Tameez finales:

| Metrica | Este modelo (Llama-3.2-3B, step 300) | Tiny-Aya-Global-Tameez-GRPO | Tiny-Aya-Fire-Tameez-GRPO |
|---|---|---|---|
| Respuestas inseguras, 1.498 prompts daninos ↓ | 3,7 % | 3,9 % | 4,3 % |
| Inseguras, red-teaming en hindi ↓ | 2,6 % | 1,5 % | 1,8 % |
| Inseguras, red-teaming en hinglish ↓ | 15,8 % | 29,5 % | 31,7 % |
| Rechazo explicito y educado de prompts daninos ↑ | 58,5 % | 73,6 % | 73,1 % |
| Rechazo erroneo de prompts benignos ↓ | 7,0 % | 3,9 % | 3,5 % |
| Rechazo erroneo de usuarios enfadados con pregunta real ↓ | 15,5 % | 9,0 % | 8,0 % |
| Respuestas abusivas (MuRIL) ↓ | 7,5 % | 4,3 % | 3,1 % |
| Respuestas con palabras malsonantes ↓ | 0,7 % | 0,6 % | 0,8 % |
| Conocimiento hindi MILU ↑ | 39,5 % | 43,2 % | 45,0 % |
| Tasa de victoria en ayuda frente a su propio modelo SFT ↑ | 42,1 % | 61,5 % | 62,9 % |

Contexto del proyecto: el SFT en hindi sin datos de seguridad elevo las respuestas inseguras de Llama-3.2-3B del 10,0 % al 15,6 %, y el GRPO las reduce al 3,7 % en este checkpoint. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Inferencia en bf16: los 3.212.749.824 parametros ocupan aproximadamente 6,4 GB de pesos, por lo que se necesita una GPU con al menos 8-10 GB de VRAM considerando cache KV y overhead.
- Cabe en GPUs de consumo: RTX 3090, RTX 4090, RTX 4080 y, con cuantizacion adicional, en GPUs de 8 GB como la RTX 3070 o la RTX 4060 Ti.
- GPU profesionales recomendadas para produccion: A100, H100 o L40S para mayor throughput y contextos largos.
- Despliegue: compatible con transformers y text-generation-inference (tag endpoints_compatible); tambien puede servirse con vLLM. No se confirma soporte GGUF ni Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Inseguras (hindi) | Inseguras (hinglish) | Licencia |
|---|---|---|---|---|---|
| Llama-3.2-3B-Tameez-GRPO-step300 (este) | 3,21 B | no disponible | 2,6 % | 15,8 % | Llama 3.2 Community |
| Llama-3.2-3B-Tameez-GRPO (paso 100, recomendado) | 3,21 B | no disponible | no disponible | no disponible | Llama 3.2 Community |
| Tiny-Aya-Global-Tameez-GRPO | no disponible | no disponible | 1,5 % | 29,5 % | CC-BY-NC 4.0 |
| Tiny-Aya-Fire-Tameez-GRPO | no disponible | no disponible | 1,8 % | 31,7 % | CC-BY-NC 4.0 |

Este checkpoint destaca en seguridad frente a hinglish (15,8 % de respuestas inseguras, frente a 29,5 % y 31,7 % de las variantes Tiny Aya), pero es peor en rechazo educado (58,5 % frente a 73,6 % y 73,1 %), en sobre-rechazo (7,0 % frente a 3,9 % y 3,5 %) y en conocimiento hindi MILU (39,5 % frente a 43,2 % y 45,0 %). Los autores seleccionaron el paso 100 como checkpoint recomendado de Llama-3.2-3B; este paso 300 se publica para estudio.

## Limitaciones y advertencias

- No es un modelo recomendado por sus propios autores: existe para estudiar el final del entrenamiento y compararlo con el checkpoint del paso 100.
- Tasa de respuestas inseguras en hinglish relativamente alta (15,8 %), muy superior a la de hindi (2,6 %); el hinglish sigue siendo el punto debil del alineamiento.
- Sobre-rechazo elevado: 7,0 % de prompts benignos rechazados y 15,5 % de usuarios enfadados con preguntas legitimas rechazados.
- Tasa de respuestas abusivas del 7,5 % segun el clasificador MuRIL, la mas alta de los tres modelos Tameez finales.
- Conocimiento hindi limitado (MILU 39,5 %) y tasa de victoria en ayuda del 42,1 % frente a su propio modelo SFT, por debajo de las variantes Tiny Aya.
- Riesgo de alucinacion inherente a un modelo de 3B; no se documentan mitigaciones especificas.
- Sesgos: los datos se construyen a partir de ocho conjuntos publicos reescritos con Aya Expanse 8B y etiquetados con Llama-Guard-3-1B, por lo que hereda los sesgos de esas fuentes y clasificadores.
- Licencia Llama 3.2 Community License: uso comercial sujeto a los terminos de Meta, incluida la politica de uso aceptable y los requisitos de atribucion.
- Idiomas limitados a hindi, hinglish e ingles; no se garantiza comportamiento en otros idiomas.
- No se documentan capacidades de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IINOVAII/Llama-3.2-3B-Tameez-GRPO-step300
- Checkpoint recomendado (paso 100): https://huggingface.co/IINOVAII/Llama-3.2-3B-Tameez-GRPO
- Variante Tiny Aya Global: https://huggingface.co/IINOVAII/Tiny-Aya-Global-Tameez-GRPO
- Variante Tiny Aya Fire: https://huggingface.co/IINOVAII/Tiny-Aya-Fire-Tameez-GRPO
- Modelo base SFT en hindi: https://huggingface.co/IINOVAII/Llama-3.2-3B-Hindi-SFT
- Modelo base original: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Demo interactiva (playground): https://huggingface.co/spaces/IINOVAII/tameez
- Dataset de seguridad: https://huggingface.co/datasets/IINOVAII/tameez-hindi-safety-data
- Salidas de evaluacion: https://huggingface.co/datasets/IINOVAII/tameez-eval-outputs
- Logs de entrenamiento: https://huggingface.co/datasets/IINOVAII/tameez-training-logs
