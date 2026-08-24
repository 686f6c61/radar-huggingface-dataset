# mrtoncl/merged_model_3-gguf

## Resumen

El modelo `mrtoncl/merged_model_3-gguf` es un merge de dos modelos de 8.000 millones de parámetros realizado con la herramienta `mergekit` mediante el método `slerp`. Los modelos fusionados son `ytu-ce-cosmos/Turkish-Llama-8b-Instruct-v0.1`, un modelo instructivo en turco basado en Llama 3, y `Sao10K/L3-8B-Lunaris-v1`, un modelo optimizado para roleplay y conversación creativa. El objetivo declarado por el autor es combinar las capacidades en lengua turca con habilidades de roleplay para un proyecto llamado "Son Fıçı RPG".

El modelo se distribuye en formato GGUF, lo que facilita su ejecución en entornos locales con herramientas como llama.cpp u Ollama. Tiene un tamaño de 8.030.261.248 parámetros y un peso del repositorio de 13.5 GB, lo que sugiere que incluye varias cuantizaciones, aunque no se detallan en la ficha. No se especifica la licencia, el contexto máximo ni los datos de entrenamiento adicionales.

La relevancia de este modelo radica en su orientación a un caso de uso muy específico: la generación de contenido conversacional en turco con estilo narrativo. Sin embargo, al carecer de documentación técnica detallada y de benchmarks publicados, su adopción en producción requiere una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Llama 3 (transformador, 32 capas, no confirmado) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio GGUF, sin lista de archivos) |
| Idiomas soportados | Turco (principal, segun tags y modelo base) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se ha creado mediante un merge de dos modelos de 8B de parametros usando `mergekit` con el metodo `slerp` (interpolacion lineal esferica). La configuracion YAML muestra que se fusionan todas las capas (rango 0-32) de ambos modelos, aplicando un factor `t` variable segun el tipo de capa: para las capas de atencion (`self_attn`) se usa una progresion de 0.0 a 1.0, mientras que para las capas MLP se usa la progresion inversa. Esto sugiere un intento de combinar las representaciones atencionales de un modelo y las de MLP del otro. El `tokenizer_source` se establece como `base`, tomando el tokenizador del modelo base (`Turkish-Llama-8b-Instruct-v0.1`).

No se proporcionan datos sobre el entrenamiento adicional, dataset de fine-tuning, ni procesos de RLHF o DPO. El modelo es un producto de merge, no un entrenamiento desde cero.

## Capacidades

- Generacion de texto en turco con fines instructivos (heredado del modelo base turco).
- Capacidades de roleplay y narrativa conversacional (heredado del modelo Lunaris).
- Potencialmente soporta instrucciones y respuestas en formato chat (ambos modelos base son instructivos).
- No se confirma soporte de tool calling, agentes, vision, audio o thinking mode.
- Capacidades multilingues limitadas; el idioma principal es turco, aunque los modelos base (Llama 3) podrian tener algo de ingles, pero no se especifica.

## Casos de uso

- Chatbot de atencion al cliente en turco: el modelo puede gestionar conversaciones multi-turno en turco, aunque la longitud de contexto no esta confirmada, por lo que se recomienda probar con ventanas cortas.
- Juegos de rol por texto (RPG): su combinacion de turco y roleplay lo hace adecuado para sesiones de juego narrativas en turco, con personajes y tramas.
- Asistente virtual para hablantes de turco: para responder preguntas frecuentes o generar contenido instructivo basico.
- Generacion de historias o cuentos en turco: aprovechando la capacidad narrativa del modelo Lunaris.
- Prototipado de aplicaciones de chat en turco: como base para un fine-tuning posterior en un dominio concreto.
- Evaluacion de tecnicas de merge: util para investigadores que quieran analizar el impacto de la interpolacion entre un modelo instructivo y uno de roleplay.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estandar. Tampoco se comparan con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 8B en GGUF, se requieren aproximadamente 4-6 GB de VRAM con cuantizacion Q4_K_M, y 8-10 GB para Q8. Sin embargo, al no conocer las cuantizaciones concretas, estas cifras son orientativas.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060, RTX 4070, etc.) para cuantizaciones bajas; para cuantizaciones altas se necesita mas de 12 GB.
- Compatible con consumer GPU: si, en cuantizaciones Q4 o Q5.
- Opciones de despliegue: llama.cpp, Ollama, GPT4All, o cualquier runtime que soporte GGUF.
- Latencia y throughput: no se dispone de datos. En una RTX 4090 se podria esperar una generacion de 30-50 tokens/s con Q4, pero no es medido.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar con alternativas especificas. No hay modelos similares en la misma categoria (merge turco-roleplay) con datos publicos. Se indica "no disponible".

## Limitaciones y advertencias

- No se especifica la licencia, lo que implica que el uso comercial no esta garantizado y se debe consultar al autor o a los modelos base.
- Al ser un merge sin entrenamiento adicional, puede presentar inconsistencias en la coherencia de respuestas largas.
- El idioma principal es turco; no se ha validado su rendimiento en otros idiomas.
- La longitud de contexto no se ha documentado, por lo que se debe limitar la entrada a unos 2-4k tokens para evitar errores.
- Riesgo de alucinacion y sesgos tipicos de los modelos base (Llama 3 y Lunaris).
- El modelo no ha sido evaluado en benchmarks, por lo que su calidad es incierta.
- No hay informacion sobre el proceso de cuantizacion ni sobre los archivos GGUF disponibles (si son Q4, Q8, etc.).
- El modelo es experimental, creado para un proyecto personal, y no se espera mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrtoncl/merged_model_3-gguf
- Documentacion GGUF de Hugging Face: https://huggingface.co/docs/hub/gguf
- Repositorio de modelos GGUF (para referencia general): https://github.com/IBM/gguf
- Comunidad de GGUF en Hugging Face: https://huggingface.co/GGUF-Models
