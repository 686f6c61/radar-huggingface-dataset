# Davidlobos1992/rm-reconstruccion-slm

## Resumen

`rm-reconstruccion-slm` es un adaptador LoRA publicado por el usuario Davidlobos1992 sobre el modelo base `HuggingFaceTB/SmolLM2-135M-Instruct` de HuggingFaceTB. Se trata de un ejercicio academico del taller de destilacion de la asignatura Topicos Avanzados en IA 2 (UAI), orientado a un dominio muy concreto: la reconstruccion de imagenes por resonancia magnetica (RM) y las tecnicas de aceleracion asociadas (espacio k, transformada de Fourier, half-Fourier, imagen paralela, compressed sensing y reconstruccion con deep learning).

El adaptador no pretende ser una herramienta clinica ni un asistente especializado en produccion. Con solo 120 pares pregunta-respuesta generados por un LLM profesor y un modelo base de 135 millones de parametros, el objetivo declarado por el autor es demostrar el flujo de destilacion de conocimiento y el ajuste fino con PEFT. La model card es explicita al respecto: el modelo "repite, se equivoca e inventa contenido tecnico".

Su relevancia es, por tanto, formativa y metodologica: sirve como ejemplo reproducible de como adaptar un modelo pequeno a un dominio tecnico mediante LoRA y datos sinteticos, y de como evaluar honestamente sus limitaciones con un examen fijo puntuado por un juez LLM. No compite con modelos especializados en imagen medica ni con asistentes clinicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2) con adaptador LoRA (r=16, alpha=32) |
| Parametros totales | 135 M (modelo base) + adaptador LoRA (tamano no disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base; no confirmada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite cuantizacion GGUF/4-bit, no verificado en esta ficha) |
| Idiomas soportados | es (espanol) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `SmolLM2-135M-Instruct`, un transformer decoder-only de 135 millones de parametros. El ajuste se realiza con PEFT/LoRA con rango r=16 y alpha=32, segun la model card. El entrenamiento se ejecuto en CPU, lo que es coherente con el tamano del modelo y del dataset.

Los datos de entrenamiento consisten en 120 pares pregunta-respuesta generados por un LLM profesor (`gpt-6-luna`, via API de OpenAI) sobre el dominio de reconstruccion por RM. No se documenta el numero de tokens, la composicion exacta del dataset, ni si hubo RLHF o DPO; la model card solo indica destilacion supervisada a partir de las respuestas del profesor. La perdida de entrenamiento paso de 3,06 a 1,60, lo que indica que el adaptador aprendio a imitar el estilo y el vocabulario del dominio, aunque no necesariamente la correccion tecnica.

## Capacidades

- Generacion de texto en espanol dentro del dominio de reconstruccion por RM (espacio k, Fourier, half-Fourier, imagen paralela, compressed sensing).
- Respuesta a preguntas tecnicas del dominio en formato pregunta-respuesta, imitando el estilo de las respuestas del LLM profesor.
- Uso como adaptador PEFT cargable junto al modelo base mediante `transformers` y `peft`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del espanol.
- No se documenta vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Demostracion docente de destilacion y LoRA: el adaptador sirve para ilustrar en clase el flujo completo de generacion de datos sinteticos con un LLM profesor, ajuste con PEFT y evaluacion con un juez LLM, usando un modelo de 135 M que cabe en cualquier equipo.
- Reproduccion de experimentos academicos: permite repetir el taller con los mismos hiperparametros (r=16, alpha=32) y comparar la perdida de entrenamiento y las notas del examen fijo.
- Prototipado rapido de asistentes de dominio en CPU: al ser un modelo de 135 M con adaptador, se puede desplegar en entornos sin GPU para probar interfaces de pregunta-respuesta sobre terminologia de RM antes de invertir en modelos mayores.
- Generacion de material de estudio no clinico: puede producir borradores de preguntas y respuestas sobre conceptos basicos de RM para revision posterior por un experto, dado su bajo coste de inferencia.
- Prueba de concepto de evaluacion con juez LLM: el examen fijo de 12 preguntas y la escala 1-10 documentados en la model card sirven como plantilla para montar evaluaciones automaticas de adaptadores pequenos.
- Base para experimentos de escalado: comparar este adaptador de 135 M con adaptadores sobre modelos mayores permite estudiar el efecto del tamano del modelo base en la calidad de la destilacion con pocos ejemplos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre un examen fijo de 12 preguntas, evaluado por un juez LLM en escala 1-10:

| Metrica | Modelo base | Con adaptador |
|---|---|---|
| Nota media | 1 | 2 |
| Aprobacion (nota >= 7) | 0 % | 0 % |
| Perdida de entrenamiento | no disponible | 3,06 -> 1,60 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el modelo base de 135 M; el adaptador LoRA anade una cantidad marginal de memoria.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo tambien funciona en CPU, como se uso durante el entrenamiento.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM (GTX 1050, RTX 3060, RTX 4090, etc.), y en CPU.
- Opciones de despliegue: `transformers` + `peft` (metodo documentado en la model card); el modelo base admite otras vias de despliegue, pero no se documentan para este adaptador.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rm-reconstruccion-slm (este) | 135 M + LoRA | no disponible | Apache 2.0 | Hugging Face, 13 descargas |
| SmolLM2-135M-Instruct (base) | 135 M | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| Modelos especializados en RM clinica | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables con otros adaptadores de dominio en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que el modelo "repite, se equivoca e inventa contenido tecnico"; la nota media de 2/10 en el examen fijo confirma una calidad muy baja.
- Riesgo alto de alucinacion en contenido tecnico de RM: no debe usarse para decisiones clinicas, protocolos de adquisicion ni interpretacion de imagenes.
- Dataset de entrenamiento muy reducido (120 pares) y generado por un LLM comercial, lo que introduce sesgos y errores del profesor en el adaptador.
- No se documentan evaluaciones de sesgo, seguridad ni robustez.
- El uso comercial esta permitido por la licencia Apache 2.0 del adaptador, pero los datos de entrenamiento provienen de un LLM comercial; el autor recomienda revisar los terminos del proveedor antes de cualquier uso no educativo.
- Cobertura limitada al espanol y a un unico dominio tecnico; no se documenta comportamiento fuera de ese dominio.
- Modelo de 135 M: capacidad de razonamiento y de contexto muy limitada en comparacion con modelos actuales.

## Enlaces

- Hugging Face: https://huggingface.co/Davidlobos1992/rm-reconstruccion-slm
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Repositorio del taller: mencionado en la model card, URL no disponible en la informacion proporcionada.
