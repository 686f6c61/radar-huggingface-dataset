# IsValorum/Qwen3.8-35B-A3B-Distill-MTP-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Qwen3.8-35B-A3B-Distill-MTP APEX-I-MiniPlus-V2.1 es una cuantización GGUF del modelo empero-ai/Qwen3.8-35B-A3B-Distill, un transformer de tipo Mixture-of-Experts (MoE) con 34.660.610.688 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token. El trabajo de cuantización lo firma IsValorum, que aplica una metodología propia denominada APEX-I-MiniPlus, basada en cuantización tensor a tensor guiada por imatrix y orientada a preservar la fidelidad de pesos en el rango Q5-Q6 sin un límite fijo de tamaño de fichero.

El modelo base es un destilado de la familia Qwen3.8 con soporte de MTP (multi-token prediction), modo de razonamiento y una ventana de contexto de 256K tokens. La relevancia de esta ficha radica en que la cuantización permite ejecutar el modelo completo, incluido el contexto de 256K, en estaciones de trabajo con 24 GB de VRAM mediante offload parcial a RAM del sistema, algo que el checkpoint BF16 original no permite en hardware de consumo.

La licencia es Apache 2.0, el repo ocupa 18,5 GB y el modelo declara soporte para trece idiomas, entre ellos el castellano. La model card advierte de una limitación conocida del checkpoint upstream: repeticiones en generaciones muy largas, incluida la fase posterior al bloque de razonamiento, que el autor original reconoce y está corrigiendo en una versión Distill V2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), tag `qwen35moe`, con MTP (multi-token prediction) |
| Parametros totales | 34.660.610.688 (34,66 mil millones) |
| Parametros activos | Aproximadamente 3.000 millones (denominación A3B) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | GGUF con cuantización personalizada APEX-I-MiniPlus V2.1 (rango Q5-clase a casi Q6), mapa tensor a tensor auditado, imatrix |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base upstream se distribuye en safetensors/BF16 |
| Tamano del repo | 18,5 GB |
| Modelo base | empero-ai/Qwen3.8-35B-A3B-Distill |
| Metodo de cuantizacion | APEX-I-MiniPlus V2.1, calculado por IsValorum en clústeres cloud privados |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Mixture-of-Experts con 34,66 mil millones de parámetros totales y unos 3.000 millones activos por token, lo que sitúa su coste computacional por token en el orden de un modelo denso de 3B pese a disponer de la capacidad de representación de un 35B. Incorpora MTP (multi-token prediction), una técnica que permite al modelo predecir varios tokens por paso y que se usa habitualmente para decodificación especulativa y para acelerar la generación. El tag `qwen35moe` y la nomenclatura del repo confirman la familia arquitectónica.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el checkpoint upstream. Lo que sí se documenta es el proceso de cuantización: IsValorum aplica una cuantización quirúrgica tensor a tensor, auditada directamente sobre el GGUF resultante, guiada por una matriz de importancia (imatrix) y con asignación diferenciada de bits según la sensibilidad de cada tensor. La model card publica un mapa de cuantización completo y verificaciones de fidelidad empíricas frente a cuantizaciones planas estándar.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 256K tokens.
- Razonamiento explícito en modo thinking, con bloque ` thinking` y control del esfuerzo de razonamiento mediante plantilla de chat endurecida para uso agéntico.
- Razonamiento matemático y de dominio general derivado del destilado de Qwen3.8.
- Generación de código, con advertencia específica del autor sobre sintaxis y penalización de repetición para evitar intercambio de caracteres.
- Soporte de tool calling y function calling, orientado a flujos agénticos.
- Razonamiento multi-paso y uso en agentes autónomos.
- Capacidades multilingües en trece idiomas, incluidos castellano, inglés, chino, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe.
- Decodificación acelerada mediante MTP.
- Compatibilidad con endpoints (`endpoints_compatible`) y con el ecosistema llama.cpp.

## Casos de uso

- Asistencia conversacional de largo alcance: con 256K tokens de contexto, el modelo puede mantener hilos de conversación con historiales extensos, documentación adjunta o transcripciones completas sin truncar, algo útil en soporte técnico especializado donde el cliente aporta manuales y logs.
- Agentes autónomos con tool calling: la combinación de MoE de 3B activos, MTP y plantilla de chat endurecida para agentes permite desplegar bucles de razonamiento multi-paso con latencia contenida en hardware de una sola GPU.
- Análisis de repositorios y documentación extensa: la ventana de 256K y el offload a RAM del sistema permiten cargar árboles de código o corpus documentales completos en una estación de 24 GB de VRAM.
- Generación y revisión de código en pipelines: el soporte de function calling facilita integrarlo en flujos de CI/CD para tareas de revisión, generación de tests o resumen de cambios, con la cautela de la advertencia sobre penalización de repetición.
- Procesamiento multilingüe en producción: al cubrir trece idiomas, sirve para clasificación, traducción asistida y atención al cliente en mercados con varias lenguas sin cambiar de modelo.
- Razonamiento con presupuesto de cómputo ajustado: al activar solo unos 3B de parámetros por token, es adecuado para entornos donde se necesita calidad de un 35B pero el throughput es crítico, como servicios con muchas peticiones concurrentes.
- Despliegue en estaciones de trabajo sin GPU de datacenter: el offload parcial a RAM del sistema descrito en la model card permite ejecutar el modelo completo en equipos con RTX 30/40/50 y memoria RAM suficiente.

## Benchmarks y rendimiento

La model card incluye verificaciones de fidelidad de la cuantización y comparaciones de perplejidad, pero los datos concretos de benchmarks estándar (MMLU, HumanEval, GSM8K) no figuran en la información proporcionada. Los porcentajes de mejora de WikiText-2 PPL que aparecen en la model card corresponden a la línea de modelos 27B densos, no a este 35B MoE, por lo que no son trasladables.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo GGUF ocupa 18,5 GB, por lo que la inferencia completa requiere al menos esa cifra más overhead de contexto y caché KV; con cuantizaciones parciales y offload puede reducirse la huella en VRAM.
- La model card afirma que el contexto completo de 256K puede ejecutarse en VRAM en estaciones de 24 GB, lo que sitúa a la RTX 3090, RTX 4090 y GPUs de 24 GB como objetivo mínimo para ese escenario.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 5090 para consumo; A100 y H100 para despliegue en servidor con mayor throughput y contexto concurrente.
- Cabe en GPU de consumo: sí, en modelos de 24 GB o superiores, con offload parcial a RAM del sistema según la model card.
- Opciones de despliegue: llama.cpp como runtime principal (formato GGUF), con compatibilidad declarada para endpoints; la model card incluye una sección de configuración recomendada y parámetros de generación oficiales de empero-ai.
- Latencia y throughput: la model card incluye una sección de benchmarks de throughput y offload para RTX 30/40/50 y streaming desde RAM, pero las cifras concretas no se recogen en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-35B-A3B-Distill-MTP APEX-I-MiniPlus V2.1 (este) | 34,66B / ~3B | 256K | Apache 2.0 | GGUF | Cuantización quirúrgica con MTP, orientada a offload en 24 GB |
| Qwen3.6-35B-A3B MTP APEX-I-MiniPlus V2.1 | 35B / ~3B | no disponible en la información | Apache 2.0 (según repo de la colección) | GGUF | Edición previa de la misma familia, orientada a razonamiento general, agentes y tool calling |
| Ornith 1.5 35B-A3B APEX-I-MiniPlus V2.1 | 35B / ~3B | no disponible en la información | no disponible | GGUF | Especializado en ingeniería de software y agentes de código a escala de repositorio |
| Tiel Coder 35B-A3B APEX-I-MiniPlus V2.1 | 35B / ~3B | no disponible en la información | no disponible | GGUF | Especialista en programación agéntica y depuración iterativa |

Las tres alternativas pertenecen a la misma colección del autor y comparten metodología de cuantización, pero la model card insiste en que son familias de modelos distintas y no variantes intercambiables del mismo checkpoint: la elección debe hacerse por carga de trabajo y comportamiento de alineación.

## Limitaciones y advertencias

- Limitación upstream de generación larga: el checkpoint BF16 original puede entrar en repeticiones durante respuestas muy extensas, incluso después del bloque `</think>`; EmperoAI lo reconoce y trabaja en un Distill V2. La cuantización no introduce el problema, pero tampoco lo corrige.
- Advertencia específica sobre código: la model card incluye un aviso crítico sobre sintaxis de programación y penalización de repetición para evitar el intercambio de caracteres, lo que obliga a ajustar los parámetros de generación en producción.
- Riesgo de alucinación: no se documentan evaluaciones específicas de factualidad en la información disponible.
- Sesgos: no se detallan sesgos conocidos en la información proporcionada.
- Contexto e idioma: aunque declara trece idiomas, no se especifica la calidad relativa por idioma; el castellano está soportado pero sin métricas publicadas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del checkpoint base empero-ai/Qwen3.8-35B-A3B-Distill antes de desplegar.
- Dependencia de runtime: al ser GGUF, el rendimiento y la fidelidad dependen de la versión de llama.cpp y de la configuración de offload; la model card recomienda una configuración concreta que debe respetarse.
- Cuantización de autor único: la metodología APEX-I-MiniPlus la calcula un solo autor en clústeres privados; las verificaciones publicadas son propias y no han sido replicadas de forma independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IsValorum/Qwen3.8-35B-A3B-Distill-MTP-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Colección APEX-I MiniPlus V2.1: https://huggingface.co/collections/IsValorum/apex-i-miniplus-v21-standard-moe-6acfee77961c8c0cf5a083b5
- Qwen3.6-35B-A3B MTP APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-GGUF
- Qwen3.6-35B-A3B MTP APEX-I-MiniPlus-V2.1 Abliterated: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Ornith 1.5 APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Ornith-1.5-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Tiel Coder APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Tiel-Coder-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Qwen3.8 27B MiniPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-MiniPlus-V3-GGUF
- Qwen3.8 27B NanoPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-NanoPlus-V3-GGUF
- Swift-1.5 Qwen3.8 27B Uncensored MTP MiniPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-MiniPlus-V3-GGUF
- Swift-1.5 Qwen3.8 27B Uncensored MTP NanoPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-NanoPlus-V3-GGUF
- Apoyo al autor: https://ko-fi.com/isvalorum
