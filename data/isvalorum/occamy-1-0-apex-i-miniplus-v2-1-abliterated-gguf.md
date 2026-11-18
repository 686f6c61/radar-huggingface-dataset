# IsValorum/Occamy-1.0-APEX-I-MiniPlus-V2.1-Abliterated-GGUF

## Resumen

Occamy-1.0-APEX-I-MiniPlus-V2.1-Abliterated es una cuantizacion GGUF del modelo base Accio-Lab/occamy-1.0, un transformer de tipo mezcla de expertos (MoE) de aproximadamente 34.660 millones de parametros totales. La publica IsValorum, un cuantizador independiente que trabaja con recetas propias de calibracion mediante importance matrix (imatrix) y un mapeo de tensores de 733 entradas que denomina APEX-I V2.1. El modelo esta disenado para inferencia local con llama.cpp y es compatible con endpoints, lo que permite desplegarlo en entornos de servidor sin dependencias propietarias.

La caracteristica diferencial frente al modelo base es la ablacion de direcciones de rechazo (abliteration): se ha aplicado una modificacion direccional sobre los pesos en BF16 para suprimir respuestas de negativa ante peticiones que el modelo original rechazaria. El autor documenta un incidente relevante: antes del 23 de octubre de 2026, los ficheros etiquetados como abliterated eran en realidad copias de las cuantizaciones base, por lo que cualquier descarga anterior a esa fecha no contiene la ablacion. La version corregida se re-cuantizo desde el origen BF16 abliterated autentico y verifica la supresion de rechazos con vectores de prueba.

El modelo cubre trece idiomas (entre ellos espanol, chino, ingles, frances, aleman, portugues, italiano, ruso, japones, coreano, vietnamita, tailandés y arabe) y se distribuye bajo licencia Apache 2.0. Con 17.910 descargas y 33,3 GB de repositorio, es una opcion orientada a flujos de trabajo sin restricciones de rechazo donde el operador asume la responsabilidad del contenido generado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen35moe`; familia Qwen 3.5 MoE) |
| Parametros totales | 34.660.610.688 (~34,66 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con calibracion imatrix; variante MiniPlus (~14,75 GB) y NanoPlus (~12,54 GB) |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Accio-Lab/occamy-1.0 es un transformer de mezcla de expertos de la familia Qwen 3.5 MoE, segun la etiqueta `qwen35moe` del repositorio, con 34.660 millones de parametros totales. Al ser una arquitectura MoE, solo un subconjunto de expertos se activa por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano, aunque el numero exacto de parametros activos no se especifica en la informacion disponible. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base.

La innovacion tecnica de esta publicacion no reside en el entrenamiento sino en el post-procesado: la ablacion direccional en BF16 elimina las direcciones de activacion asociadas a respuestas de rechazo, y la cuantizacion se realiza con una receta propia de 733 tensores calibrada con imatrix. El autor afirma que la receta MiniPlus prioriza fidelidad de clase Q5 a casi Q6 sin limite fijo de tamano de fichero, mientras que NanoPlus apunta a calidad de clase Q4 con huella reducida. La verificacion de la supresion de rechazos se realiza con vectores de prueba, aunque no se documenta la metodologia completa en el extracto disponible.

## Capacidades

- Generacion de texto conversacional multi-turno en trece idiomas, con especial cobertura de ingles, chino y espanol.
- Razonamiento explicito: el repositorio incluye la etiqueta `reasoning`, lo que indica soporte de cadenas de razonamiento antes de la respuesta final.
- Arquitectura MoE con activacion dispersa, adecuada para cargas de inferencia con requisitos de VRAM moderados respecto al total de parametros.
- Comportamiento sin rechazos (abliterated/uncensored) verificado mediante vectores de prueba tras la correccion de octubre de 2026.
- Compatibilidad con llama.cpp y con endpoints compatibles, lo que facilita su integracion en servidores de inferencia estandar.
- Soporte de cuantizacion GGUF con imatrix, lo que permite ajustar el equilibrio entre calidad y tamano.
- Capacidades de tool calling y function calling: no confirmadas explicitamente en la informacion disponible.
- Capacidades multimodales (vision, audio): no confirmadas para esta variante concreta; el autor menciona multimodalidad en el modelo hermano Qwen3.6-35B-A3B, no en este.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la ablacion direccional sobre las tasas de rechazo y la calidad de las respuestas, comparando con el modelo base sin modificar en el mismo entorno de inferencia.
- Generacion creativa sin restricciones de contenido: escritura de ficcion, guiones o narrativa adulta donde el operador necesita que el modelo no introduzca negativas sistematicas; la licencia Apache 2.0 permite uso comercial del material generado.
- Despliegue local en estaciones de trabajo: con un fichero GGUF de ~14,75 GB, el modelo puede ejecutarse en GPU de consumo con 16-24 GB de VRAM mediante llama.cpp, lo que lo hace viable para desarrollo offline sin costes de API.
- Evaluacion comparativa de cuantizaciones: la receta APEX-I con imatrix y el mapeo de 733 tensores permiten analizar la degradacion de perplejidad frente a otras recetas GGUF en tareas de texto largo.
- Procesamiento multilingue en produccion interna: la cobertura de trece idiomas permite construir asistentes de documentacion o resumen para equipos distribuidos, con la salvedad de que la calidad por idioma no esta documentada.
- Servicio de inferencia autogestionado: la compatibilidad con endpoints y llama.cpp permite montar un servidor interno con control total sobre los pesos, sin dependencia de proveedores externos y con la licencia Apache 2.0 como marco legal.
- Experimentacion con razonamiento en modelos MoE: la etiqueta `reasoning` y la arquitectura dispersa permiten estudiar el coste de las cadenas de razonamiento en terminos de tokens generados y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona mejoras de perplejidad WikiText-2 para la linea V3 de modelos de 27B (por ejemplo, +13,21 % frente a GSQ-RCO IQ3_S), pero esos datos corresponden a otros modelos de la coleccion y no a esta variante de 34,66 B. No se proporcionan valores de MMLU, HumanEval, GSM8K ni de ningun otro benchmark para Occamy-1.0-APEX-I-MiniPlus-V2.1-Abliterated.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero MiniPlus ocupa 14,75 GB (13,74 GiB) y el NanoPlus 12,54 GB (11,68 GiB); a esto hay que anadir el espacio para el contexto KV, que depende de la longitud de contexto configurada (no documentada).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para el fichero MiniPlus completo con contexto moderado; RTX 4080 (16 GB) o RTX 4070 Ti Super (16 GB) para el NanoPlus con contexto reducido.
- GPU de datacenter: A100 (40/80 GB) y H100 (80 GB) permiten ejecutar el modelo con contextos largos y mayor throughput, aunque el modelo no requiere ese nivel de memoria para funcionar.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas con la variante NanoPlus y contexto limitado; en 24 GB con la MiniPlus.
- Opciones de despliegue: llama.cpp (formato nativo), servidores compatibles con endpoints OpenAI, y cualquier runtime que consuma GGUF; Ollama y vLLM no estan confirmados en la informacion disponible (vLLM requiere soporte especifico para la arquitectura MoE del modelo base).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Occamy-1.0-APEX-I-MiniPlus-V2.1-Abliterated | 34,66 B (MoE) | no disponible | Apache 2.0 | GGUF | Abliterated, imatrix, 13 idiomas |
| Qwen3.6-35B-A3B MTP APEX-I-MiniPlus-V2.1 | 35 B (MoE, A3B) | no disponible | no disponible | GGUF | Mismo cuantizador; orientado a razonamiento general, agentes y multimodal |
| Ornith 1.5 APEX-I-MiniPlus-V2.1 | 35 B (MoE) | no disponible | no disponible | GGUF | Mismo cuantizador; especializado en ingenieria de software |
| Tiel Coder APEX-I-MiniPlus-V2.1 | 35 B (MoE) | no disponible | no disponible | GGUF | Mismo cuantizador; especializado en programacion agentica |

Los tres modelos comparables pertenecen a la misma coleccion del autor y comparten la receta de cuantizacion APEX-I MiniPlus V2.1, pero se diferencian en el modelo base y en el dominio de especializacion. No se dispone de datos de rendimiento comparativo entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion: como todo modelo generativo, puede producir contenido factualmente incorrecto con alta confianza; la ablacion de rechazos no corrige este comportamiento y puede agravarlo en dominios donde el modelo base respondia con cautela.
- Incidente de versiones: las descargas anteriores al 23 de octubre de 2026 del fichero `Occamy-1.0.APEX-I-MiniPlus-V2.1-Abliterated.gguf` contienen la version no abliterated; es imprescindible re-descargar y verificar el tensor-map.tsv.
- Sesgos: no documentados en la informacion disponible; al derivar de un modelo base con entrenamiento multilingue, es esperable un sesgo hacia el ingles y el chino en calidad y cobertura.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica; la calidad por idioma no esta medida y los trece idiomas declarados no implican un rendimiento homogeneo.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero el operador asume la responsabilidad legal del contenido generado sin filtros de rechazo, especialmente en jurisdicciones con requisitos de moderacion.
- Caveat de produccion: la supresion de rechazos se verifica con vectores de prueba del autor, no con una evaluacion independiente; en entornos regulados conviene anadir capas de moderacion externas.
- Soporte de tool calling y agentes: no confirmado para esta variante, por lo que no deberia asumirse en pipelines que dependan de function calling.
- Mantenimiento: el modelo lo mantiene un cuantizador individual, no el laboratorio que entreno el modelo base; la continuidad de actualizaciones depende de una sola persona.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Occamy-1.0-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- Variante NanoPlus: https://huggingface.co/IsValorum/Occamy-1.0-APEX-I-NanoPlus-V2.1-Abliterated-GGUF
- Coleccion APEX-I MiniPlus V2.1 Abliterated: https://huggingface.co/collections/IsValorum/apex-i-miniplus-v21-abliterated-moe-6acfee762fc4a8cf2298c55b
- Qwen3.8 27B MiniPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-MiniPlus-V3-GGUF
- Qwen3.8 27B NanoPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-NanoPlus-V3-GGUF
- Swift-1.5 Qwen3.8 27B Uncensored MTP MiniPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-MiniPlus-V3-GGUF
- Swift-1.5 Qwen3.8 27B Uncensored MTP NanoPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-NanoPlus-V3-GGUF
- Qwen3.6-35B-A3B MTP APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-GGUF
- Qwen3.6-35B-A3B MTP APEX-I-MiniPlus-V2.1 Abliterated: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Ornith 1.5 APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Ornith-1.5-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Tiel Coder APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Tiel-Coder-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Apoyo al autor: https://ko-fi.com/isvalorum
