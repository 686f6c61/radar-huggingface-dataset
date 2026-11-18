# IsValorum/Tiel-Coder-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Tiel-Coder-35B-A3B APEX-I-MiniPlus-V2.1 es una cuantizacion GGUF de tipo "custom" del modelo Tiel-Coder-35B-A3B, un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) esparcida con capacidades multimodales (image-text-to-text) orientado a generacion de codigo, razonamiento y flujos agénticos. El modelo base procede de `peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF`, y la cuantizacion ha sido realizada por IsValorum aplicando una receta propietaria denominada APEX-I-MiniPlus, que asigna precision de forma quirurgica tensor a tensor en lugar de aplicar un esquema uniforme.

La relevancia de esta release radica en su envelope de tamano: 15,23 GB en disco (3,43 BPW) con una perplexity WikiText-2 de 7,5117 frente a 7,46 del BF16 sin cuantizar, es decir, un incremento de solo +0,69 %. El autor situa la fidelidad linguistica en el umbral de un Q6_K (unos 28 GB) dentro de un footprint de aproximadamente la mitad, y preserva los tensores de routing (`gate_inp`, `gate_shexp`) en F32 sin comprimir para evitar deriva en la seleccion de expertos.

El modelo integra un bloque MTP (multi-token prediction) que habilita decodificacion especulativa, soporta vision mediante pipeline image-text-to-text y declara 13 idiomas. La ficha tecnica del autor esta orientada a estaciones de trabajo de 24 GB de VRAM, donde afirma que el contexto completo de 256K puede ejecutarse en VRAM, y a inferencia total o parcial en RAM del sistema con tasas de 20 a 45 tok/s segun la configuracion de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE esparcida (tags: qwen3_5_moe / qwen35moe), 40 capas, 256 micro-expertos, bloque MTP integrado |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | no disponible (el nombre A3B sugiere ~3B activos, sin confirmacion numerica en la informacion disponible) |
| Longitud de contexto | 256K (segun la model card del autor) |
| Tipos de cuantizacion | GGUF custom APEX-I-MiniPlus V2.1 (3,43 BPW); tensores mixtos: gates de routing en F32, shared experts en Q5_K, atencion en Q4_K con gates en Q8_0, output head en Q6_K, expertos nucleo en 3-bit calibrado |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar (13 idiomas declarados) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con Mixture-of-Experts esparcida distribuida en 40 capas y 256 micro-expertos, con expertos compartidos (`shexp`) presentes en todas las capas: la receta de cuantizacion menciona 120 tensores de shared expert a lo largo de las 40 capas. El modelo incorpora un bloque MTP (multi-token prediction) que permite decodificacion especulativa, y el pipeline declarado es image-text-to-text, lo que implica una torre de vision integrada. Los tags apuntan a la familia Qwen 3.5 MoE como base arquitectonica, aunque no se detalla en la informacion disponible la composicion exacta del dataset de entrenamiento ni el volumen de tokens utilizados.

En cuanto al entrenamiento, la informacion disponible no especifica el numero de tokens, la mezcla de datos ni si se aplicaron fases de RLHF o DPO. Los tags incluyen `reasoning`, `agentic-coding` y `swe-bench`, lo que sugiere un ajuste orientado a tareas de codigo agéntico y razonamiento multi-paso. La innovacion tecnica destacable de esta release no esta en el modelo base sino en la cuantizacion: asignacion tensor a tensor con gates de routing intactos en F32 (deriva de routing nula), output head armado en Q6_K para evitar colapso de formato, y uso de imatrix y de la metodologia "unsloth-dynamic" en la calibracion.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de razonamiento configurable mediante "reasoning effort" en la plantilla de chat endurecida que incluye el autor.
- Generacion de codigo y codificacion agéntica: los tags declaran `coding`, `agentic-coding` y `swe-bench`, orientados a tareas de reparacion y resolucion de issues.
- Capacidades multimodales de vision: pipeline `image-text-to-text`, es decir, entrada de imagen mas texto y salida de texto.
- Soporte de tool calling y function calling: la plantilla de chat endurecida y el enfoque agéntico lo implican, aunque la informacion disponible no detalla el esquema exacto de herramientas.
- Flujos agénticos multi-paso y uso eficiente de tokens (`token-efficient`).
- Decodificacion especulativa mediante el bloque MTP integrado.
- Multilinguismo declarado en 13 idiomas, con enfasis en ingles y chino como idiomas principales de la model card.

## Casos de uso

- Reparacion automatica de issues en repositorios: el modelo puede recibir el contexto del codigo y la descripcion del fallo y generar un parche, apoyandose en su ventana de 256K para incluir varios ficheros relevantes y en el modo de razonamiento para trazar la causa raiz.
- Asistente de codigo en IDE con contexto de repositorio amplio: con 256K de contexto puede mantener en memoria varios modulos, tests y documentacion simultaneamente, reduciendo la necesidad de recuperacion externa.
- Pipelines de CI/CD con agente de revision: integrado mediante llama.cpp o un servidor compatible con la API de OpenAI (`endpoints_compatible`), el modelo puede revisar diffs, sugerir correcciones y ejecutar tool calling contra el sistema de issues.
- Procesamiento de documentacion tecnica con imagenes: al ser image-text-to-text, puede extraer informacion de diagramas de arquitectura, capturas de errores o esquemas y combinarla con texto para generar explicaciones o codigo.
- Despliegue en estaciones de trabajo de 24 GB: segun el autor, el contexto completo de 256K cabe en VRAM en una GPU de 24 GB, lo que habilita asistentes de codigo locales con contexto largo sin infraestructura de servidor.
- Inferencia en CPU con offload parcial: en equipos sin GPU suficiente, el modelo puede ejecutarse total o parcialmente en RAM del sistema con tasas declaradas de 20 a 45 tok/s, adecuado para entornos de desarrollo individuales o air-gapped.
- Traduccion y atencion multilingue tecnica: con 13 idiomas declarados, puede usarse para localizar documentacion o comentarios de codigo entre ingles, chino, espanol y el resto de idiomas soportados.

## Benchmarks y rendimiento

Los unicos datos cuantitativos publicados en la informacion disponible son de perplexity y de throughput, no de benchmarks de tareas (MMLU, HumanEval, GSM8K, SWE-bench). Se presentan tal cual:

| Metrica | BF16 base | APEX-I-MiniPlus V2.1 | APEX-I-NanoPlus |
|---|---|---|---|
| Tamano en disco | 71,05 GB | 15,23 GB | 12,55 GB |
| Footprint en memoria | 66,18 GiB | 14,18 GiB | 11,69 GiB |
| BPW medio | 16,00 | 3,43 | ~2,93 |
| Perplexity WikiText-2 | ~7,46 (referencia) | 7,5117 ± 0,20722 (ΔPPL +0,0517 / +0,69 %) | 8,2842 ± 0,23432 (ΔPPL +0,8242 / +11,05 %) |
| Tier de calidad equivalente | linea base | Q5_K_L (frontera con Q6_K) | Q4_K_M / Q4_K_L |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, SWE-bench) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 14,18 GiB de footprint para pesos en la variante MiniPlus V2.1; el autor afirma que el contexto completo de 256K cabe en VRAM en una GPU de 24 GB.
- GPU recomendadas: el autor publica benchmarks de throughput para RTX 30, RTX 40 y RTX 50; una GPU de 24 GB (gama RTX 4090 o equivalente) es el objetivo declarado para contexto completo en VRAM.
- Cabe en GPU de consumo: si, en GPUs de 24 GB para pesos mas contexto completo segun el autor; con la variante NanoPlus (11,69 GiB) el objetivo baja a equipos de 16 GB con streaming desde RAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), servidores compatibles con la API de OpenAI (`endpoints_compatible`), y cualquier runtime que consuma GGUF.
- Latencia y throughput: 20 a 45 tok/s en inferencia por RAM del sistema, segun procesador y configuracion DDR4/DDR5; el autor referencia benchmarks de offload para RTX 30/40/50 en secciones de la model card no incluidas en la informacion disponible. No se dispone de cifras de throughput en GPU pura.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Tiel-Coder-35B-A3B APEX-I-MiniPlus V2.1 | 35,5B (MoE) | 256K | GGUF 3,43 BPW / 15,23 GB | MIT | Objeto de esta ficha; PPL WikiText-2 7,5117 |
| Tiel-Coder-35B-A3B APEX-I-NanoPlus | 35,5B (MoE) | 256K | GGUF ~2,93 BPW / 12,55 GB | MIT | Misma familia, menor footprint, PPL 8,2842 (+11,05 % vs BF16) |
| Tiel-Coder-35B-A3B (BF16 base) | 35,5B (MoE) | 256K | BF16 / 71,05 GB | MIT | Referencia sin cuantizar, PPL ~7,46 |
| Cuantizaciones APEX-I-Mini genericas de la comunidad | 35,5B (MoE) | 256K | IQ2_S en expertos, Q3_K_M en output head, Q3_K en atencion | MIT | El autor advierte de picos de perplexity y errores de sintaxis en razonamiento profundo |

No se dispone en la informacion proporcionada de comparaciones con modelos de otras familias (por ejemplo, alternativas densas o MoE de tamano similar de otros desarrolladores).

## Limitaciones y advertencias

- La cuantizacion introduce una perdida medible: +0,69 % de perplexity WikiText-2 frente a BF16, con desviacion estandar de ±0,20722; en tareas de razonamiento profundo el impacto puede ser mayor que en texto general.
- El autor advierte explicitamente sobre un problema de sintaxis en codigo y de intercambio de caracteres relacionado con el repeat penalty; recomienda seguir sus parametros de generacion oficiales y su aviso sobre repeat penalty para evitarlo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como en cualquier modelo de codigo, las APIs y firmas generadas deben verificarse.
- Idiomas: la model card declara 13 idiomas, pero los metadatos de Hugging Face solo listan `en` y `zh`; el soporte real del resto (es, fr, de, pt, it, ru, ja, ko, vi, th, ar) no esta verificado con evaluaciones en la informacion disponible.
- Licencia MIT: permisiva para uso comercial, pero conviene revisar las condiciones del modelo base `peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF` por si impusiera terminos adicionales.
- El rendimiento en RAM del sistema (20-45 tok/s) depende fuertemente del ancho de banda de memoria; en configuraciones DDR4 de baja frecuencia puede situarse en el extremo inferior del rango.
- La receta de cuantizacion es propietaria y especifica de esta release: mezclar tensores de este GGUF con otras cuantizaciones o modificar la asignacion de precision invalida las garantias de calidad declaradas.
- No hay resultados publicados de benchmarks de tareas en la informacion disponible, por lo que las afirmaciones de calidad se apoyan unicamente en perplexity.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IsValorum/Tiel-Coder-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Variante compacta APEX-I-NanoPlus: https://huggingface.co/IsValorum/Tiel-Coder-35B-A3B-APEX-I-NanoPlus-GGUF
- Modelo base (GGUF): https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
