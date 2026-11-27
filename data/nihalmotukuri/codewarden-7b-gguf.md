# nihalmotukuri/codewarden-7b-gguf

## Resumen

CodeWarden-7B es un ajuste fino del modelo Qwen/Qwen2.5-Coder-7B-Instruct, desarrollado por el usuario nihalmotukuri y distribuido en formato GGUF cuantizado a Q4_K_M (aproximadamente 4,7 GB). El modelo esta especializado en la revision de seguridad de codigo: deteccion de vulnerabilidades y bugs sobre diffs de Git, con soporte para tool calling y etiquetado orientado a analisis estatico. Se publica bajo licencia Apache 2.0 y esta pensado para ejecucion local mediante Ollama.

El modelo parte de una arquitectura transformer densa de 7.615.616.512 parametros (7,6 B), heredada de Qwen2.5-Coder-7B-Instruct, y ha sido afinado con QLoRA. Su relevancia actual radica en que permite realizar triaje de vulnerabilidades de forma local y privada, sin enviar codigo fuente a servicios en la nube, lo que resulta atractivo para equipos que integran revision de seguridad en sus flujos de CI/CD.

Cabe senalar que el autor indica que la CLI CodeWarden v2 usa por defecto otro modelo (actuator-7b-gguf) para el razonamiento multi-paso con tool calling; este checkpoint codewarden-7b-gguf queda como opcion de inferencia directa o alternativa dentro de la CLI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unica incluida en el repo) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer densa de Qwen2.5-Coder-7B-Instruct, un modelo de 7,6 B parametros orientado a generacion y comprension de codigo. Sobre esa base, el autor aplica un ajuste fino con QLoRA (cuantizacion de bajo rango durante el entrenamiento) y posteriormente cuantiza el resultado a GGUF Q4_K_M para su uso en inferencia local. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de ajuste ni si se emplearon tecnicas de RLHF o DPO.

La innovacion principal del proyecto no reside en la arquitectura, sino en la especializacion funcional: el modelo esta orientado a la deteccion de vulnerabilidades y bugs en diffs de Git, con soporte declarado para tool calling y decodificacion con esquemas JSON estrictos (Pydantic) en el ecosistema de la CLI CodeWarden. No se detallan tecnicas como decodificacion especulativa o attention lineal en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento sobre codigo, heredados de Qwen2.5-Coder-7B-Instruct.
- Revision de seguridad de codigo: deteccion de vulnerabilidades y bugs sobre diffs de Git.
- Analisis estatico asistido por modelo (static analysis) orientado a triaje de hallazgos.
- Soporte de tool calling / function calling, con herramientas como `search_symbol`, `read_file` y `get_file_imports` en el ecosistema CodeWarden.
- Decodificacion con esquemas JSON estrictos (Pydantic) segun la model card.
- Capacidades multilingues limitadas: el campo de idiomas declara unicamente ingles (en).
- Integracion con Ollama para despliegue local.

## Casos de uso

- Triaje de vulnerabilidades en revisiones de codigo: el modelo analiza diffs de Git y senala posibles fallos de seguridad antes de fusionar cambios, lo que permite integrar un primer filtro automatico en el flujo de pull requests.
- Revision de seguridad en CI/CD: al ejecutarse localmente con Ollama, puede invocarse desde pipelines para marcar commits con hallazgos potenciales sin exponer el codigo a terceros.
- Auditoria de codigo en entornos con requisitos de privacidad: al ser un modelo local de 7,6 B cuantizado a Q4_K_M (unos 4,7 GB), cabe en estaciones de trabajo y evita el envio de codigo propietario a APIs externas.
- Analisis de diffs incrementales: su orientacion a diffs de Git lo hace adecuado para revisar unicamente los cambios de un commit o rama, reduciendo el volumen de contexto frente a revisiones de repositorios completos.
- Asistencia a desarrolladores en pre-commit: integrado mediante la CLI CodeWarden, puede ejecutarse antes de confirmar cambios para detectar patrones inseguros comunes.
- Generacion de informes estructurados de hallazgos: gracias al soporte de esquemas JSON estrictos, puede producir salidas parseables que alimenten paneles o sistemas de ticketing de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de una cuantizacion Q4_K_M de un modelo de 7,6 B, el checkpoint ocupa aproximadamente 4,7 GB; se recomienda disponer de al menos 6-8 GB de VRAM para cargar el modelo con margen para el contexto.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el modelo es compatible con GPUs de consumo con suficiente VRAM (por ejemplo, gama RTX xx70/xx80 con 8 GB o mas), aunque el autor no especifica modelos concretos.
- Cabe en GPU de consumo: si, segun el tamano del checkpoint Q4_K_M; no se detallan modelos exactos.
- Opciones de despliegue: Ollama (metodo documentado por el autor mediante `ollama create` y `Modelfile`), ademas de la CLI CodeWarden. No se mencionan vLLM, llama.cpp directo ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CodeWarden-7B (este) | 7,6 B | no disponible | Apache 2.0 | GGUF Q4_K_M | Ajuste QLoRA de Qwen2.5-Coder-7B-Instruct orientado a seguridad |
| Qwen2.5-Coder-7B-Instruct | 7,6 B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo base; capacidades generales de codigo, sin especializacion en seguridad |
| Actuator-7B (nihalmotukuri) | no disponible | no disponible | no disponible | GGUF | Modelo por defecto de la CLI CodeWarden v2 para tool calling multi-paso |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible; al derivar de Qwen2.5-Coder-7B-Instruct, hereda los sesgos del modelo base y de sus datos de entrenamiento.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar vulnerabilidades inexistentes o pasar por alto fallos reales; sus hallazgos deben validarse con herramientas de analisis estatico deterministas y revision humana.
- Limitaciones de idioma: el campo de idiomas declara unicamente ingles, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Limitaciones de contexto: la longitud de contexto no se especifica en la informacion disponible; conviene no asumir la ventana del modelo base sin verificacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse la atribucion correspondiente y revisarse las condiciones del modelo base.
- Caveat de produccion: el autor indica que la CLI CodeWarden v2 usa actuator-7b-gguf por defecto para el tool calling multi-paso; este checkpoint esta pensado para inferencia directa o como alternativa, no como motor principal de la CLI.
- Solo se distribuye una cuantizacion (Q4_K_M), lo que limita el ajuste fino entre calidad y requisitos de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nihalmotukuri/codewarden-7b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Modelo por defecto de la CLI: https://huggingface.co/nihalmotukuri/actuator-7b-gguf
- Repositorio de la CLI CodeWarden: https://github.com/nihalmotukuri/CodeWarden
