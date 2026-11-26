# Pratham804/Pratham-LFM2.5-350M-V22x-Polisher

## Resumen

Pratham-LFM2.5-350M-V22x-Polisher es un ajuste fino (fine-tuning) del modelo LiquidAI/LFM2.5-350M, desarrollado por el usuario independiente Pratham804. El modelo resuelve un problema muy concreto: convertir transcripciones de dictado oral (speech-to-text) en prosa escrita limpia y estructurada. Elimina muletillas, falsos arranques y autocorrecciones, reescribe para mejorar la claridad y formalidad, y añade estructura como listas o parrafos cuando corresponde. No esta afiliado ni respaldado por Liquid AI.

Se trata de un modelo de 354.483.968 parametros (aproximadamente 350M), con arquitectura LFM2.5, distribuido principalmente en formato GGUF cuantizado (Q4_K_M y Q6_K). El ajuste se realizo mediante un adaptador LoRA sobre un corpus de dictado especifico, fusionado posteriormente en los pesos base y cuantizado. Su relevancia radica en que aborda una tarea de post-procesamiento de voz muy practica con un modelo extremadamente pequeno (229-293 MB), lo que permite ejecutarlo en hardware modesto.

El modelo esta disenado para funcionar con o sin system prompt, ya que el comportamiento esta integrado en los pesos. Su licencia es la LFM Open License v1.0, que permite uso comercial por debajo de un umbral de ingresos especificado en la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (modelo base LiquidAI/LFM2.5-350M) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (ejemplo de uso con `-c 4096`) |
| Tipos de cuantizacion | Q4_K_M (229,3 MB), Q6_K (293,4 MB) |
| Idiomas soportados | en (ingles) |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-350M, un modelo de lenguaje de aproximadamente 350M de parametros. Sobre esta base se aplico un ajuste fino supervisado (SFT) mediante un adaptador LoRA entrenado con un corpus de dictado disenado especificamente para la tarea. Posteriormente, el adaptador se fusiono en los pesos base y el modelo resultante se cuantizo a formato GGUF en dos variantes (Q4_K_M y Q6_K).

La model card no proporciona detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. La innovacion principal no reside en la arquitectura, sino en la especializacion: el comportamiento de pulido de transcripciones esta integrado en los pesos, de modo que funciona tanto con system prompt como sin el.

## Capacidades

- Pulido de transcripciones de dictado: elimina muletillas, falsos arranques y frases superadas por autocorrecciones.
- Reescritura para claridad y formalidad manteniendo el significado del hablante.
- Estructuracion del texto: listas con vinetas para enumeraciones y parrafos para pasajes largos.
- Normalizacion de horas habladas (por ejemplo, `529pm` a `5:29 PM`).
- Envolver discurso reportado entre comillas.
- Funcionamiento con o sin system prompt (el comportamiento esta en los pesos).
- Generacion de texto conversacional (pipeline text-generation).
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Post-procesamiento de dictado por voz: integrado tras un motor speech-to-text, el modelo limpia la transcripcion bruta y la convierte en prosa escrita legible, eliminando muletillas y autocorrecciones. Es adecuado por su tamano reducido y su especializacion en esta tarea.
- Notas de reunion automaticas: a partir de la transcripcion de una reunion, el modelo puede estructurar el contenido en parrafos y listas, mejorando la legibilidad del acta.
- Generacion de correos a partir de voz: el usuario dicta un mensaje y el modelo produce un correo formal y bien estructurado, normalizando horas y citas.
- Accesibilidad para usuarios con movilidad reducida: dictado por voz que se convierte en texto escrito limpio para documentos o mensajes.
- Transcripcion de entrevistas o apuntes: el modelo convierte el habla informal en texto escrito coherente, preservando el significado del hablante.
- Despliegue en entornos con recursos limitados: al ocupar 229-293 MB en GGUF, puede ejecutarse en CPU o GPU de gama baja mediante llama.cpp o llama-server, lo que lo hace viable en dispositivos locales o edge.

## Benchmarks y rendimiento

La model card reporta una evaluacion propia sobre 22 comprobaciones (11 comportamientos evaluados con y sin system prompt) ejecutadas a traves de `llama-server`, con decodificacion greedy y fallo por repeticion de 6-gramas (loop collapse).

| Archivo del modelo | Puntuacion | Comprobaciones fallidas |
|---|---:|---|
| v21-Q4_K_M | 4/22 | 18 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Nota: la tabla de la model card referencia la variante v21-Q4_K_M, no la V22x del titulo, por lo que los datos pueden no corresponder exactamente a esta version.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el archivo Q4_K_M ocupa 229,3 MB y el Q6_K 293,4 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.); tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer actuales e incluso en sistemas integrados.
- Opciones de despliegue: llama.cpp / llama-server (ejemplo de la model card: `llama-server -m ... -c 4096`); compatible con endpoints (tag `endpoints_compatible`). No se confirma soporte de vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Pratham-LFM2.5-350M-V22x-Polisher | 354,5M | no disponible | LFM Open License v1.0 | GGUF | Especializado en pulido de dictado |
| LiquidAI/LFM2.5-350M (base) | ~350M | no disponible | LFM Open License v1.0 | safetensors | Modelo base sin especializar |
| Otros pulidores de dictado | no disponible | no disponible | no disponible | no disponible | No se dispone de alternativas comparables en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo con modelos similares en la informacion disponible.

## Limitaciones y advertencias

- Solo soporta ingles; no se garantiza funcionamiento en otros idiomas.
- Riesgo de alucinacion y de colapso por repeticion (loop collapse): la propia evaluacion detecta fallos por repeticion de 6-gramas.
- La puntuacion reportada es baja (4/22 en la variante v21-Q4_K_M), lo que indica que muchas comprobaciones de comportamiento fallan; conviene validar en el caso de uso concreto antes de produccion.
- La tabla de evaluacion referencia la variante v21, no la V22x, por lo que el rendimiento real de esta version puede diferir.
- Licencia LFM Open License v1.0: el uso comercial se permite por debajo de un umbral de ingresos especificado en la licencia; la redistribucion debe declarar la modificacion y no puede implicar respaldo de Liquid AI.
- Es un modelo modificado no afiliado a Liquid AI; el autor no ofrece garantias.
- Longitud de contexto no documentada formalmente; el ejemplo de uso emplea `-c 4096`.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Pratham804/Pratham-LFM2.5-350M-V22x-Polisher
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
