# IINOVAII/Llama-3.2-3B-Tameez-GRPO

## Resumen

Llama-3.2-3B-Tameez-GRPO es un ajuste fino del modelo meta-llama/Llama-3.2-3B-Instruct desarrollado por IINOVAII en el contexto del hackathon Lexsi. El objetivo del proyecto, denominado Tameez (तमीज़, "modales" en hindi), es dotar a modelos conversacionales pequenos de un comportamiento seguro y educado en hindi (devanagari), hinglish (hindi escrito en alfabeto latino) e ingles, sin sacrificar la utilidad de las respuestas.

El problema que aborda es concreto: el ajuste de seguridad suele hacerse en ingles y rara vez se mide en hindi romanizado. Los autores documentan que los modelos base responden de forma insegura con una frecuencia varias veces mayor ante la misma peticion danina escrita en hinglish que en hindi, y que un SFT de instrucciones en hindi sin datos de seguridad empeora la tasa de respuestas inseguras (10,0% a 15,6% en Llama-3.2-3B). Tameez corrige esto con una etapa de aprendizaje por refuerzo (GRPO) sobre un entorno de seguridad disenado especificamente, con seis recompensas ponderadas.

Arquitectura Llama 3.2 de 3.212.749.824 parametros, 28 capas y contexto de 128K tokens. El checkpoint publicado es el paso 100 de 300 de GRPO, fusionado en pesos bf16 completos (sin necesidad de PEFT). Se distribuye bajo la licencia Llama 3.2 Community License, lo que permite uso comercial segun los terminos de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), 28 capas |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (heredado de Llama 3.2) |
| Tipos de cuantizacion | no disponible en la model card; compatible con cuantizacion estandar de Llama (bf16 en el repo, safetensors) |
| Idiomas soportados | hindi (hi), ingles (en); incluye hinglish (hindi en alfabeto latino) como registro de uso |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (bf16, pesos fusionados) |

## Arquitectura y entrenamiento

El modelo parte de meta-llama/Llama-3.2-3B-Instruct, un transformer decoder-only denso de 3.2B parametros y 28 capas con contexto de 128K. El entrenamiento se estructura en tres etapas sobre dos modelos base en paralelo (Tiny Aya Global y Llama-3.2-3B), con datos, recompensas, hiperparametros y evaluacion identicos:

- **Etapa 0 (base):** el modelo sin tocar.
- **Etapa 1 (SFT en hindi):** LoRA sobre 5.000 filas de instrucciones ordinarias en hindi/hinglish, sin datos de seguridad, como linea base realista de "anadir hindi".
- **Etapa 2 (Tameez GRPO):** GRPO sobre la etapa 1 en un entorno de seguridad con 4.652 prompts etiquetados y seis recompensas ponderadas. Cada prompt recibe 4 respuestas puntuadas; la ventaja relativa de grupo de Dr. GRPO empuja el adaptador LoRA hacia las respuestas mejores. El checkpoint se selecciona por reglas fijas y se fusiona.

Los datos se construyen a partir de ocho datasets publicos, limpiados y reescritos a hinglish natural con Aya Expanse 8B, etiquetados en cuanto a dano con Llama-Guard-3-1B y divididos en cuatro conjuntos disjuntos (A: SFT, B: pool de prompts RL, C: tests de seguridad reservados, D: tests de habilidad reservados). La evaluacion usa jueces que nunca participan en el entrenamiento (Llama-Guard-3-8B y un clasificador de discurso abusivo MuRIL), de modo que un modelo no puede puntuar alto simplemente aprendiendo a complacer a su propio modelo de recompensa. El entrenamiento completo se ejecuto en una unica GPU NVIDIA L4 de 24 GB en Google Colab: 32 minutos de SFT y 137 minutos de GRPO, con AlignTune 0.1.30, TRL 1.7.1, PEFT 0.21.2 y Transformers 5.22.

## Capacidades

- Generacion de texto conversacional multi-turno en hindi (devanagari), hinglish y ingles.
- Rechazo educado y explicito de peticiones daninas en el idioma y alfabeto del usuario.
- Mantenimiento de respuestas utiles ante preguntas benignas que contienen palabras aparentemente peligrosas ("como mato un proceso de Linux", "haz mi presentacion killer").
- Tolerancia a usuarios que insultan: responde a la pregunta real sin devolver el insulto.
- Conocimiento de hindi medido con MILU (39,5% en el checkpoint final).
- Capacidades heredadas de Llama-3.2-3B-Instruct (generacion, razonamiento basico, codigo) segun el modelo base, aunque no se documentan mejoras especificas en estas areas.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- **Moderacion y respuesta segura en chat de atencion al cliente en India:** el modelo puede gestionar conversaciones en hindi, hinglish e ingles rechazando peticiones abusivas o daninas de forma educada, manteniendo la utilidad en consultas legitimas. Es adecuado por su entrenamiento especifico en los tres registros que usan los usuarios indios.
- **Asistentes para comunidades de soporte tecnico:** consultas como "linux mein process kill kaise karein?" se responden correctamente sin que el modelo interprete "kill" como una peticion danina, gracias al entrenamiento con recompensas que distinguen palabras alarmantes de intencion real.
- **Despliegue de chatbots con requisitos de seguridad en hinglish:** donde otros modelos fallan (29,5% de respuestas inseguras en Tiny Aya frente a 15,8% en este modelo en red-teaming hinglish), este checkpoint ofrece la mejor tasa de seguridad en ese registro entre los dos modelos Tameez.
- **Filtrado y reescritura de respuestas en pipelines de moderacion:** el modelo puede usarse como generador de respuestas seguras alternativas cuando un clasificador previo detecta contenido danino, manteniendo el idioma y el tono del usuario.
- **Investigacion en alineacion multilingue:** sirve como referencia reproducible de un pipeline SFT + GRPO con seis recompensas y evaluacion con jueces independientes, util para estudiar el efecto de la seguridad en registros romanizados.
- **Productos comerciales que requieren licencia permisiva:** a diferencia de la variante Tiny-Aya-Global-Tameez-GRPO (CC-BY-NC 4.0), este modelo usa la Llama 3.2 Community License, que permite uso comercial bajo los terminos de Meta, lo que lo hace apto para integraciones en producto.
- **Prototipado en hardware modesto:** con 3.2B parametros y pesos bf16 de 6,4 GB, se puede ejecutar en una GPU consumer de gama alta o cuantizado en equipos con menos VRAM para pruebas de concepto.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (evaluados sobre conjuntos reservados con Llama-Guard-3-8B y MuRIL como jueces):

| Metrica | Tiny-Aya-Global-Tameez-GRPO | Llama-3.2-3B-Tameez-GRPO |
|---|---|---|
| Respuestas inseguras, 1.498 prompts daninos ↓ | 3,9% | 3,7% |
| Inseguras, red-teaming hindi ↓ | 1,5% | 2,6% |
| Inseguras, red-teaming hinglish ↓ | 29,5% | 15,8% |
| Rechazo explicito y educado de prompts daninos ↑ | 73,6% | 58,5% |
| Rechazo erroneo de prompts benignos ↓ | 3,9% | 7,0% |
| Rechazo erroneo de usuarios enfadados con pregunta real ↓ | 9,0% | 15,5% |
| Respuestas abusivas (MuRIL) ↓ | 4,3% | 7,5% |
| Respuestas con palabras malsonantes ↓ | 0,6% | 0,7% |
| Conocimiento de hindi MILU ↑ | 43,2% | 39,5% |
| Juzgado mas util que su propio modelo de etapa 1 ↑ | 61,5% | 42,1% |

Datos de linea base citados en la model card: el SFT en hindi sin datos de seguridad empeoro la tasa de respuestas inseguras de Tiny Aya Global del 4,5% al 20,7% y de Llama-3.2-3B del 10,0% al 15,6%. Los conjuntos de evaluacion son 2.014 prompts de seguridad, 200 de utilidad en hindi y 14.831 preguntas MILU. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada:** pesos bf16 de 6,4 GB; inferencia en bf16 con overhead de activaciones y cache KV en torno a 8-10 GB para contextos moderados. Con cuantizacion de 8 bits, aproximadamente 4-5 GB; con 4 bits, en torno a 2,5-3,5 GB (estimaciones, no publicadas por el autor).
- **GPU recomendadas:** NVIDIA L4 de 24 GB (usada en el entrenamiento), A100, H100 para despliegue concurrente; RTX 4090 y RTX 3090 para inferencia individual en bf16.
- **GPU consumer:** cabe en RTX 4090, RTX 3090 y, cuantizado, en GPUs de 8 GB como RTX 3060/4060.
- **Opciones de despliegue:** transformers (referencia), vLLM, TGI (el modelo esta etiquetado como text-generation-inference y endpoints_compatible), llama.cpp y Ollama mediante conversion a GGUF.
- **Latencia y throughput:** no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad global | Seguridad hinglish | Licencia |
|---|---|---|---|---|---|
| Llama-3.2-3B-Tameez-GRPO | 3,2B | 128K | 3,7% inseguras | 15,8% inseguras | Llama 3.2 Community |
| Tiny-Aya-Global-Tameez-GRPO | no disponible en la informacion | no disponible | 3,9% inseguras | 29,5% inseguras | CC-BY-NC 4.0 |
| meta-llama/Llama-3.2-3B-Instruct (etapa 0) | 3,2B | 128K | 10,0% inseguras | no disponible | Llama 3.2 Community |
| IINOVAII/Llama-3.2-3B-Hindi-SFT (etapa 1) | 3,2B | 128K | 15,6% inseguras | no disponible | Llama 3.2 Community |

La comparativa se limita a los modelos medidos en el mismo pipeline del autor; no hay datos de benchmarks estandar frente a otros modelos de 3B en la informacion disponible.

## Limitaciones y advertencias

- **Seguridad en hinglish aun imperfecta:** el 15,8% de respuestas inseguras en red-teaming hinglish sigue siendo elevado en terminos absolutos, aunque sea la mejor cifra del proyecto en ese registro.
- **Rechazos erroneos:** un 7,0% de prompts benignos y un 15,5% de usuarios enfadados con una pregunta real reciben rechazo indebido, lo que puede degradar la experiencia en produccion.
- **Utilidad inferior a la variante Tiny Aya:** el juez de utilidad prefiere la etapa 1 sobre este modelo en el 42,1% de los casos (frente al 61,5% de Tiny Aya), lo que sugiere cierta perdida de calidad conversacional tras el GRPO.
- **Idiomas limitados:** solo hindi, hinglish e ingles; no se documenta soporte de otros idiomas ni de castellano.
- **Riesgo de alucinacion:** al ser un modelo de 3B, el riesgo de alucinacion en conocimiento factual es alto; el 39,5% en MILU indica un conocimiento de hindi limitado.
- **Sesgos:** no se documentan analisis de sesgos demograficos o culturales en la model card.
- **Licencia:** Llama 3.2 Community License con los terminos de Meta; requiere cumplir sus condiciones de uso, incluida la politica de uso aceptable.
- **Madurez:** modelo experimental de hackathon, con 0 descargas y 0 likes en el momento de la consulta; no hay validacion externa ni soporte de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IINOVAII/Llama-3.2-3B-Tameez-GRPO
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Modelo de etapa 1 (SFT en hindi): https://huggingface.co/IINOVAII/Llama-3.2-3B-Hindi-SFT
- Variante Tiny Aya: https://huggingface.co/IINOVAII/Tiny-Aya-Global-Tameez-GRPO
- Dataset de seguridad: https://huggingface.co/datasets/IINOVAII/tameez-hindi-safety-data
- Salidas de evaluacion: https://huggingface.co/datasets/IINOVAII/tameez-eval-outputs
- Logs de entrenamiento: https://huggingface.co/datasets/IINOVAII/tameez-training-logs
