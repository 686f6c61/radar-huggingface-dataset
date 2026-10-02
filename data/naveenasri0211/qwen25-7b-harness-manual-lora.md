# naveenasri0211/qwen25-7b-harness-manual-lora

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de tipo PEFT entrenado sobre Qwen2.5-7B-Instruct. Su objetivo es ensenar al modelo base 497 hechos extraidos de una unica obra de dominio publico, "The Harness Makers' Illustrated Manual" de W. N. Fitz-Gerald (1880), un manual ilustrado de guarnicioneria y arneses que el modelo base no conoce. Lo publica el usuario naveenasri0211 y esta pensado como un piloto reproducible de ajuste fino: incluye la medicion antes y despues sobre preguntas reservadas, con juicio ciego realizado por Phi-4, un modelo de otra familia, para evitar sesgo de autoevaluacion.

El adaptador se entrena con QLoRA (base en 4 bits nf4, rango 32, alpha 64, dropout 0,05 sobre todas las proyecciones de atencion y MLP) a partir de 4.114 ejemplos derivados exclusivamente del libro. El resultado declarado es un salto de 6 a 51 respuestas correctas sobre 100 preguntas del libro, a cambio de un aumento de invenciones (de 0 a 7 sobre 60 preguntas fuera de cobertura). Es relevante como caso de estudio metodologico: documenta con detalle el procedimiento, los datos y las etiquetas de cada respuesta, y expone abiertamente una debilidad conocida (el modelo ajustado rara vez se niega a responder, y cuando no ha memorizado un hecho inventa una respuesta).

Al ser un adaptador, su tamano de repositorio es de 0,3 GB y requiere cargar por separado el modelo base. Esta orientado al ingles, con licencia Apache 2.0, y no ha registrado descargas ni "likes" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only del modelo base Qwen2.5-7B-Instruct |
| Parametros totales | Adaptador: repositorio de 0,3 GB; modelo base: 7.610 millones de parametros (7,61B) |
| Parametros activos | no aplica (el modelo base no es MoE) |
| Longitud de contexto | 131.072 tokens heredados del modelo base; el adaptador no la modifica (dato del modelo base, no declarado en la ficha del adaptador) |
| Tipos de cuantizacion | Entrenado con QLoRA en 4 bits nf4; el modelo base admite GGUF, AWQ y GPTQ; la evaluacion se hizo con builds GGUF q8 en ollama |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | 32 |
| Alpha LoRA | 64 |
| Dropout LoRA | 0,05 |
| Modulos objetivo | todas las proyecciones de atencion y MLP |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Libreria | peft |
| Ejemplos de entrenamiento | 4.114 (3.420 con respuesta, 174 enlazados, 460 de rechazo, 60 practicos) |
| Epocas / pasos | 2 epocas / 516 pasos |
| Batch efectivo | 4 x acumulacion 4 (16) |
| Learning rate | 2e-4, planificador coseno |
| Perdida | solo sobre la respuesta (loss on the answer only) |
| Tiempo de entrenamiento | 97 minutos en una unica T4 de 16 GB |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only con atencion de consultas agrupadas (GQA) y normalizacion RMSNorm, cuya arquitectura no se modifica: el entrenamiento solo anade matrices de bajo rango a las proyecciones de atencion y a las proyecciones MLP. La configuracion es QLoRA clasica: cuantizacion de la base en 4 bits nf4, rango 32, alpha 64 y dropout 0,05. Se entreno durante 2 epocas y 516 pasos con batch 4 y acumulacion 4 (batch efectivo 16), learning rate 2e-4 con planificador coseno y calculo de perdida unicamente sobre la respuesta, no sobre el prompt.

El conjunto de datos se construyo manualmente a partir de las unidades del libro y consta de 4.114 ejemplos: 3.420 con respuesta a un hecho, 174 con enlaces entre hechos, 460 de rechazo (preguntas que el manual no cubre) y 60 preguntas practicas cotidianas. La ficha indica que los hiperparametros se fijaron antes del examen y no se ajustaron sobre el conjunto de evaluacion, un detalle metodologico relevante. Se anade un "system prompt" que instruye al modelo a responder de memoria, ser breve y preciso, declarar cuando el manual no cubre un tema y no adivinar. La evaluacion se realizo con ambos modelos (base y ajustado) como builds GGUF q8 en ollama, con el mismo system prompt, y las respuestas se agruparon, barajaron y etiquetaron con Phi-4 sin que el juez supiera que modelo las habia generado.

## Capacidades

- Recuperacion de hechos memorizados: responde a preguntas sobre el contenido del manual de 1880, incluyendo formulaciones directas e indirectas.
- Generacion de texto en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Manejo de preguntas indirectas y de escenario ("que pasa si no...", "por que", hipoteticos), con mejora medida del 6/50 al 27/50 en esta categoria.
- Capacidad de rechazo parcial: dispone de ejemplos de rechazo en el entrenamiento para declarar cuando el manual no cubre un tema.
- Respuesta a preguntas practicas cotidianas no relacionadas con el libro (comportamiento heredado de la instruccion del system prompt).
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.
- Capacidades multilingues: la ficha declara solo ingles; el modelo base es multilingue, pero el adaptador no documenta comportamiento en otros idiomas.

## Casos de uso

- Prueba de concepto de ajuste fino reproducible: sirve como plantilla para equipos que quieran medir el efecto de un LoRA sobre un corpus cerrado con un protocolo de evaluacion antes/despues y juicio ciego. Incluye codigo, datos y etiquetas.
- Demostracion de memorizacion de un corpus especifico: util para estudiar hasta que punto un modelo de 7B puede absorber 497 hechos de un dominio historico concreto y como decae frente a formulaciones indirectas.
- Investigacion sobre alucinacion tras ajuste: el propio autor documenta que el modelo ajustado paso de 84 rechazos a 3 en preguntas del libro, con 46 respuestas incorrectas, lo que lo convierte en un caso de estudio sobre el intercambio entre "responder siempre" y "responder bien".
- Asistente tematico de nicho (guarnicioneria historica, arneses de 1880): puede usarse como base para un chatbot educativo sobre el manual, siempre que se valide cada respuesta contra la fuente.
- Banco de pruebas de evaluacion con juez externo: el pipeline de agrupacion, barajado y etiquetado con Phi-4 es reutilizable para evaluar otros adaptadores sin sesgo de auto-evaluacion.
- Reproduccion de bajo coste: al entrenarse en 97 minutos sobre una unica T4 de 16 GB, es adecuado como ejercicio docente o taller practico de QLoRA en hardware modesto.
- Analisis de deriva idiomatica o de estilo: permite estudiar como un corpus de 1880 altera el registro y el vocabulario de salida de Qwen2.5-7B-Instruct.

## Benchmarks y rendimiento

Los unicos datos disponibles son los de la evaluacion propia recogida en la model card. No hay resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion proporcionada.

| Metrica | Antes (base) | Despues (adaptador) |
|---|---|---|
| Respuestas correctas sobre 100 preguntas del libro | 6 | 51 |
| Respuestas inventadas sobre 60 preguntas no cubiertas | 0 | 7 |
| Rechazos sobre 15 preguntas practicas cotidianas | 0 | 0 |
| Correctas en 50 preguntas de formulacion directa | 0 | 24 |
| Correctas en 50 preguntas de formulacion indirecta | 6 | 27 |

Debilidad declarada por el autor: sobre las 100 preguntas del libro, el modelo ajustado da 46 respuestas incorrectas y solo declina 3 veces, frente a 84 declinaciones del modelo base. El ajuste incremento la tendencia a responder aunque no se haya memorizado el hecho.

## Requisitos de hardware

- El adaptador ocupa 0,3 GB, pero requiere cargar el modelo base Qwen2.5-7B-Instruct (7,61B parametros).
- VRAM estimada para el modelo base: aproximadamente 15-16 GB en FP16/BF16, 8-9 GB en cuantizacion de 8 bits y 5-6 GB en 4 bits.
- Entrenamiento QLoRA: declarado en una unica T4 de 16 GB (4 bits nf4), 97 minutos para 2 epocas y 516 pasos.
- Cabe en GPU de consumo: si, en 4 bits sobre GPUs con 8 GB o mas (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090). En 16 bits requiere 16-24 GB (RTX 4090, A100 40 GB, H100).
- Opciones de despliegue: transformers + peft para cargar el adaptador directamente; fusion del adaptador y conversion a GGUF para llama.cpp u ollama; vLLM y TGI con soporte de adaptadores LoRA para servir en produccion.
- Latencia y throughput: no disponible en la informacion proporcionada (solo se documenta el tiempo de entrenamiento).
- Nota practica: los datos de evaluacion se obtuvieron con builds GGUF q8 en ollama, por lo que el formato GGUF es una via validada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-harness-manual-lora (este) | Adaptador sobre 7,61B | 131.072 tokens (heredado) | 51/100 en preguntas del libro, 7/60 invenciones | apache-2.0 | HuggingFace, repositorio de 0,3 GB |
| Qwen2.5-7B-Instruct (base) | 7,61B | 131.072 tokens | 6/100 en preguntas del libro, 0/60 invenciones | apache-2.0 | HuggingFace |
| Otros adaptadores LoRA de la comunidad sobre Qwen2.5-7B (por ejemplo cgxjdzz/Qwen-2.5-7B-Instruct-novel-lora o sahilxai/Qwen-2.5-7b-PLC) | Adaptadores sobre 7,61B | 131.072 tokens (heredado) | no disponible | no disponible | HuggingFace / GitHub |

No se dispone de benchmarks comparables publicados para estos adaptadores alternativos en la informacion consultada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- El adaptador ensena un solo libro y solo en ingles; no es un modelo de proposito general.
- Tendencia alta a la alucinacion dentro del dominio: 46 respuestas incorrectas y solo 3 declinaciones sobre 100 preguntas del libro, frente a 84 declinaciones del modelo base.
- El ajuste aumenta las invenciones tambien fuera del dominio: 7 respuestas inventadas sobre 60 preguntas no cubiertas, frente a 0 en el modelo base.
- La evaluacion es pequena (100 preguntas del libro, 60 fuera de cobertura, 15 practicas) y el juicio lo realiza un unico modelo juez (Phi-4); no se documenta validacion humana ni intervalos de confianza.
- Los hiperparametros se fijaron antes del examen, pero no se documenta una division formal de validacion mas alla del conjunto reservado descrito.
- Uso comercial: la licencia declarada es apache-2.0, pero la obra fuente es de dominio publico y conviene verificar los terminos del modelo base Qwen2.5-7B-Instruct antes de un despliegue comercial.
- Capacidades no documentadas: no hay evidencia de tool calling, agentes, vision, audio o modo de razonamiento; no asumir estas funciones en produccion.
- Repositorio con 0 descargas y 0 "likes": no hay senales de adopcion ni de validacion por terceros.
- El adaptador requiere cargar el modelo base; no es autonomo y hereda todas las limitaciones de Qwen2.5-7B-Instruct.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/naveenasri0211/qwen25-7b-harness-manual-lora
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de codigo, datos y etiquetas del piloto: https://github.com/Naveenasri02/qwen25-lora-book-pilot
- Variante base de Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Guia de despliegue local de Qwen2.5-7B-Instruct: https://aiindigo.com/tutorials/getting-started-with-qwen2-5-7b-instruct-self-hosted-privacy-performance
- Adaptador LoRA alternativo sobre Qwen2.5-7B (novela): https://huggingface.co/cgxjdzz/Qwen-2.5-7B-Instruct-novel-lora
- Adaptador LoRA alternativo sobre Qwen2.5-7B (PLC): https://github.com/sahilxai/Qwen-2.5-7b-PLC
