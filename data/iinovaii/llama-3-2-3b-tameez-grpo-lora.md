# IINOVAII/Llama-3.2-3B-Tameez-GRPO-LoRA

## Resumen

Llama-3.2-3B-Tameez-GRPO-LoRA es un adaptador LoRA (PEFT) del proyecto Tameez, desarrollado por IINOVAII en el contexto del hackathon Lexsi, que aplica una etapa de alineamiento mediante GRPO (Group Relative Policy Optimization) sobre el checkpoint de SFT en hindi `IINOVAII/Llama-3.2-3B-Hindi-SFT`, derivado a su vez de Llama-3.2-3B-Instruct. El adaptador corresponde al checkpoint step 100, el seleccionado y fusionado en el modelo final `IINOVAII/Llama-3.2-3B-Tameez-GRPO`.

El problema que aborda es concreto y bien documentado en la model card: el alineamiento de seguridad se realiza mayoritariamente en inglés y apenas se mide en hindi escrito en alfabeto latino (hinglish). Los autores comprobaron que ambos modelos base respondían de forma insegura con varias veces más frecuencia ante la misma petición dañina redactada en hinglish que en devanagari, y que un SFT ordinario en hindi sin datos de seguridad empeoraba la seguridad (Llama-3.2-3B pasó de un 10,0 % a un 15,6 % de respuestas inseguras). Tameez corrige esta regresión con una etapa de RL en un entorno de seguridad específico con seis recompensas.

Este repositorio contiene únicamente el adaptador LoRA, no los pesos fusionados: sirve para estudiar qué cambió exactamente el GRPO, para apilarlo con otras LoRA o para fusionarlo manualmente. Es importante señalar que debe aplicarse sobre `Llama-3.2-3B-Hindi-SFT` y no sobre `meta-llama/Llama-3.2-3B-Instruct`, ya que en ese caso se omitiría la etapa de SFT y el resultado no ha sido evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Llama 3.2 (modelo base: Llama-3.2-3B-Hindi-SFT, derivado de Llama-3.2-3B-Instruct) |
| Parametros totales | no disponible (el adaptador LoRA es un subconjunto; el modelo base tiene 3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama 3.2) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | hindi (devanagari), hinglish (hindi en alfabeto latino) e ingles |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre un transformer decoder-only de la familia Llama 3.2 (3B parametros). El pipeline Tameez consta de tres etapas ejecutadas de forma identica sobre dos modelos base (Tiny Aya Global y Llama-3.2-3B), con los mismos datos, recompensas, ajustes y evaluacion. La etapa 0 es el modelo base sin tocar; la etapa 1 es un SFT con LoRA sobre 5.000 filas de instrucciones ordinarias en hindi/hinglish sin datos de seguridad, que actua como linea base realista de lo que ocurre al "anadir hindi"; la etapa 2, que corresponde a este adaptador, aplica GRPO sobre la etapa 1 en un entorno de RL de seguridad con 4.652 prompts etiquetados y seis recompensas ponderadas.

Los datos se construyen a partir de ocho datasets publicos que se limpian, se reescriben a hinglish natural con Aya Expanse 8B, se etiquetan por dano con Llama-Guard-3-1B y se dividen en cuatro conjuntos disjuntos: A para SFT, B como pool de prompts de RL, C como tests de seguridad reservados y D como tests de habilidades reservados. En la etapa GRPO, cada prompt recibe 4 respuestas puntuadas por las seis recompensas y la ventaja relativa de grupo de Dr. GRPO empuja la LoRA hacia las mejores respuestas; los checkpoints se seleccionan mediante reglas fijas y se fusionan. La evaluacion se realiza con jueces que nunca participan en el entrenamiento (Llama-Guard-3-8B y un clasificador de lenguaje abusivo MuRIL) sobre 2.014 prompts de seguridad, 200 de utilidad en hindi y 14.831 preguntas de conocimiento hindi del benchmark MILU.

## Capacidades

- Generacion de texto conversacional en hindi (devanagari), hinglish y ingles.
- Rechazo educado y explicito de peticiones daninas en el idioma y alfabeto del usuario.
- Abstenerse de usar lenguaje abusivo incluso cuando el usuario lo emplea.
- Mantener respuestas utiles ante preguntas que contienen palabras potencialmente alarmantes ("como mato un proceso de Linux", "haz mi presentacion killer").
- Seguir respondiendo preguntas legitimas de usuarios que insultan al modelo.
- Conocimiento y utilidad en hindi, evaluado con el benchmark MILU.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion proporcionada.

## Casos de uso

- Moderacion y respuesta segura en asistentes conversacionales para el mercado indio: el adaptador reduce las respuestas inseguras en hinglish del 29,5 % (modelo Tiny Aya) al 15,8 % en Llama, un escenario que el SFT en hindi por si solo agravaba.
- Investigacion del efecto del RL en alineamiento: al ser el adaptador aislado del checkpoint step 100, permite comparar directamente el modelo antes y despues del GRPO y medir que comportamientos cambia.
- Apilamiento con otras LoRA o fusion manual: util para experimentar con combinaciones de adaptadores sobre el mismo modelo base sin partir de los pesos fusionados.
- Filtrado de prompts y generacion de rechazos en pipelines de atencion al cliente en hindi e hinglish: el modelo produce rechazos explicitos y educados (58,5 % en las pruebas) en el idioma del usuario.
- Evaluacion de robustez ante red-teaming multilingue: sirve como referencia para comparar tasas de respuestas inseguras en devanagari frente a alfabeto latino con los mismos jueces (Llama-Guard-3-8B, MuRIL).
- Base para experimentos de seguridad en modelos pequenos desplegables en hardware modesto: al tratarse de un modelo de 3B, es viable en entornos con recursos limitados, aunque no se dispone de cifras de latencia ni throughput en la informacion proporcionada.
- Estudio de la relacion entre seguridad y utilidad: los datos publicados permiten analizar el coste en rechazos erroneos (7,0 % en prompts inofensivos y 15,5 % en usuarios enfadados con preguntas reales).

## Benchmarks y rendimiento

Resultados del modelo final fusionado (etapa 2) segun la model card. Las metricas de seguridad se miden sobre 1.498 prompts daninos; los jueces son Llama-Guard-3-8B y MuRIL, nunca usados en entrenamiento.

| Metrica | Llama-3.2-3B-Tameez-GRPO | Tiny-Aya-Global-Tameez-GRPO |
|---|---|---|
| Respuestas inseguras, todos los prompts daninos (↓) | 3,7 % | 3,9 % |
| Inseguras, red-teaming en hindi (↓) | 2,6 % | 1,5 % |
| Inseguras, red-teaming en hinglish (↓) | 15,8 % | 29,5 % |
| Rechazo explicito y educado de prompts daninos (↑) | 58,5 % | 73,6 % |
| Rechazo erroneo de prompts inofensivos (↓) | 7,0 % | 3,9 % |
| Rechazo erroneo de usuarios enfadados con pregunta real (↓) | 15,5 % | 9,0 % |
| Respuestas abusivas (MuRIL) (↓) | 7,5 % | 4,3 % |
| Respuestas con palabras malsonantes (↓) | 0,7 % | 0,6 % |
| Conocimiento hindi MILU (↑) | 39,5 % | 43,2 % |
| Juzgado mas util que su propio modelo de etapa 1 (↑) | 42,1 % | 61,5 % |

Datos de la etapa 1 (SFT en hindi) citados en la model card: Llama-3.2-3B paso de un 10,0 % a un 15,6 % de respuestas inseguras tras el SFT sin datos de seguridad; Tiny Aya Global paso del 4,5 % al 20,7 %. No se publican resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. El adaptador LoRA ocupa 0,1 GB en el repositorio; el modelo base de 3B requiere memoria adicional segun el tipo de cuantizacion, dato no especificado.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada; por el tamano del modelo base (3B) es plausible, pero no se aportan cifras.
- Opciones de despliegue: la model card solo documenta carga mediante `transformers` y `peft` (`PeftModel.from_pretrained` sobre `IINOVAII/Llama-3.2-3B-Hindi-SFT`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Llama-3.2-3B-Tameez-GRPO-LoRA (este) | 3B (base) | no disponible | Llama 3.2 Community License | Hugging Face (adaptador PEFT) | Mejor seguridad en hinglish (15,8 % inseguras) y licencia con opcion comercial |
| Tiny-Aya-Global-Tameez-GRPO | no disponible | no disponible | CC-BY-NC 4.0 | Hugging Face | Mejor equilibrio seguridad-utilidad y mas conocimiento hindi (MILU 43,2 %), pero no comercial |
| Llama-3.2-3B-Hindi-SFT (etapa 1) | 3B (base) | no disponible | Llama 3.2 Community License | Hugging Face | Linea base sin etapa de seguridad; el GRPO mejora la utilidad frente a este en el 42,1 % de las comparaciones |

## Limitaciones y advertencias

- El adaptador debe aplicarse sobre `IINOVAII/Llama-3.2-3B-Hindi-SFT`; aplicarlo directamente sobre `meta-llama/Llama-3.2-3B-Instruct` omite el SFT y produce un modelo nunca evaluado.
- Persiste un 15,8 % de respuestas inseguras en red-teaming en hinglish, la cifra mas alta de las metricas de seguridad reportadas para este modelo.
- Tasa notable de rechazos erroneos: 7,0 % en prompts inofensivos y 15,5 % en usuarios enfadados con una pregunta real.
- El 7,5 % de respuestas se clasifican como abusivas por MuRIL, por encima del 4,3 % del modelo Tiny Aya.
- El conocimiento hindi (MILU 39,5 %) es inferior al del modelo Tiny Aya (43,2 %) y el juez de utilidad prefiere la etapa 1 del propio modelo en el 57,9 % de las comparaciones.
- Licencia Llama 3.2 Community License: permite uso comercial sujeto a los terminos de Meta, que incluyen restricciones y obligaciones de atribucion.
- Las evaluaciones se limitan a hindi, hinglish e ingles; no hay datos sobre otros idiomas.
- No se documentan sesgos especificos ni tasas de alucinacion en la informacion proporcionada.
- El repositorio no incluye los pesos fusionados, solo el adaptador; para produccion conviene usar el modelo fusionado `IINOVAII/Llama-3.2-3B-Tameez-GRPO`.

## Enlaces

- Adaptador LoRA: https://huggingface.co/IINOVAII/Llama-3.2-3B-Tameez-GRPO-LoRA
- Modelo fusionado: https://huggingface.co/IINOVAII/Llama-3.2-3B-Tameez-GRPO
- Modelo base (SFT en hindi): https://huggingface.co/IINOVAII/Llama-3.2-3B-Hindi-SFT
- Modelo alternativo del proyecto: https://huggingface.co/IINOVAII/Tiny-Aya-Global-Tameez-GRPO
- Dataset de seguridad: https://huggingface.co/datasets/IINOVAII/tameez-hindi-safety-data
- Salidas de evaluacion: https://huggingface.co/datasets/IINOVAII/tameez-eval-outputs
- Registros de entrenamiento: https://huggingface.co/datasets/IINOVAII/tameez-training-logs
