# IsValorum/Nex-N2.5-mini-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Nex-N2.5-mini APEX-I-MiniPlus-V2.1 es una cuantización GGUF personalizada del modelo base `nex-agi/Nex-N2.5-mini`, publicada por el usuario independiente IsValorum bajo el sello APEX-I. El modelo original es un Mixture-of-Experts (MoE) de 34.660.610.688 parámetros totales (aproximadamente 34,7 mil millones), orientado a generación de texto, razonamiento y uso conversacional, con 40 capas y 256 micro-expertos según la documentación del autor de la cuantización. La licencia declarada es Apache 2.0.

El interés de esta ficha no reside en un modelo nuevo, sino en el trabajo de cuantización: el autor afirma haber auditado tensor por tensor los 40 bloques del modelo para maximizar la fidelidad de razonamiento, empleando una metodología propia (APEX, con variantes MiniPlus y NanoPlus) y calibración con imatrix. El resultado es un repositorio de 15,4 GB que, según la model card, permite ejecutar el contexto completo de 256K tokens en estaciones de trabajo con 24 GB de VRAM mediante offload a RAM del sistema.

Es relevante ahora porque la familia MoE dispersa de ~35B con pocos parámetros activos se ha convertido en el punto dulce para inferencia local en hardware de consumo, y las cuantizaciones de terceros con metodologías agresivas (más allá de los IQ estándar de llama.cpp) determinan en la práctica si un modelo cabe o no en una GPU concreta. La información disponible proviene casi exclusivamente de la model card del cuantizador; los datos sobre el modelo base son escasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) dispersa; tag `qwen35moe`; 40 capas y 256 micro-expertos según la model card |
| Parametros totales | 34.660.610.688 (34,7 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K), según la model card |
| Tipos de cuantizacion | GGUF cuantizado con metodología APEX-I-MiniPlus V2.1 (calibración imatrix); niveles concretos por tensor no detallados |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 15,4 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos dispersa. La model card de la cuantización menciona explícitamente 40 capas y 256 micro-expertos, y el tag `qwen35moe` sugiere una arquitectura derivada de la familia Qwen 3.5 MoE, aunque esta correspondencia no se confirma en la información disponible. No se dispone de datos sobre el número de parámetros activos por token, la composición del dataset de entrenamiento, el volumen de tokens ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineamiento en el modelo original.

La innovación destacable está en el proceso de cuantización, no en el modelo: el autor declara una auditoría matemática tensor por tensor de las 40 capas y los 256 micro-expertos, con el objetivo de preservar la precisión de razonamiento y eliminar la deriva del estado de recurrencia. Se menciona también la integración de MTP (multi-token prediction) donde el modelo lo soporta, calibración mediante imatrix y una plantilla de chat «endurecida» para uso agéntico con control de esfuerzo de razonamiento. No hay información verificable sobre el protocolo exacto de evaluación ni sobre los conjuntos de calibración empleados.

## Capacidades

- Generación de texto conversacional multi-turno en 13 idiomas declarados.
- Razonamiento explícito: los tags incluyen `reasoning` y la model card describe un modo de esfuerzo de razonamiento configurable mediante plantilla de chat.
- Soporte de tool calling y function calling, con plantilla de chat específica para flujos agénticos.
- Capacidades de agente y razonamiento multi-paso, reforzadas por la plantilla «hardened agentic chat template».
- Predicción multi-token (MTP) integrada donde el modelo base la soporta, lo que puede acelerar la decodificación.
- Ejecución con llama.cpp y compatibilidad declarada con endpoints.
- Capacidad multilingüe amplia: inglés, chino, español, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe.
- No se declaran capacidades de visión ni de audio en la información disponible.

## Casos de uso

- Asistente de razonamiento en estación de trabajo local: con 24 GB de VRAM y offload a RAM del sistema, el modelo permite mantener el contexto completo de 256K tokens en una sola máquina, adecuado para analizar documentos largos o bases de código extensas sin fragmentar la entrada.
- Agentes autónomos con tool calling: la plantilla de chat endurecida y el soporte de function calling permiten construir bucles de agente que invocan APIs, consultan bases de datos y encadenan pasos intermedios con razonamiento explícito entre llamadas.
- Atención al cliente multilingüe: los 13 idiomas declarados permiten atender conversaciones multi-turno en español, inglés, chino, árabe o vietnamita con un único despliegue, manteniendo contexto de conversación largo gracias a la ventana de 256K.
- Procesamiento de repositorios y documentación técnica: la ventana de contexto completa permite cargar ficheros completos o varios módulos a la vez para tareas de resumen, extracción de requisitos o generación de documentación, con la ventaja de ejecutarse en hardware de consumo alto.
- Prototipado e investigación en local: investigadores que necesitan evaluar un MoE de ~35B con razonamiento sin depender de APIs externas pueden desplegarlo con llama.cpp y comparar comportamiento entre cuantizaciones APEX y cuantizaciones planas estándar.
- Despliegue en entornos con requisitos de privacidad: al ser Apache 2.0 y ejecutarse íntegramente en hardware propio, encaja en escenarios donde los datos no pueden salir de la infraestructura, como análisis de contratos o soporte interno.
- Generación de código asistida en pipelines: aunque no es un modelo especializado en código, el soporte de tool calling y contexto largo permite integrarlo en flujos de revisión de parches o generación de tests dentro de un CI/CD, siempre con validación posterior.

## Benchmarks y rendimiento

La model card incluye comparaciones de perplejidad en WikiText-2 frente a cuantizaciones GSQ-RCO IQ3_S, pero las cifras concretas publicadas corresponden a otros modelos de la familia (Qwen3.8 27B), no a este repositorio. Para este modelo no se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Este modelo | Referencia citada (otros modelos de la familia) |
|---|---|---|
| WikiText-2 PPL | no disponible | GSQ-RCO IQ3_S: 7,07 (referencia del autor) |
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 15,4 GB; con overhead de contexto y caché KV, la model card afirma que el contexto completo de 256K puede ejecutarse en 24 GB de VRAM mediante offload parcial a RAM del sistema.
- GPU recomendadas: la model card incluye una sección de throughput para RTX 30, RTX 40 y RTX 50, además de streaming por RAM. Para el contexto completo se apunta a estaciones con 24 GB (por ejemplo, RTX 3090, RTX 4090 o RTX 5090).
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB con offload; en tarjetas de 16 GB o menos será necesario offload adicional a RAM del sistema, con la consiguiente pérdida de throughput.
- Opciones de despliegue: llama.cpp (soporte nativo GGUF), endpoints compatibles con la API de OpenAI según los tags, y herramientas derivadas como Ollama o LM Studio mediante importación del GGUF. No se menciona soporte explícito de vLLM o TGI para este formato.
- Latencia y throughput: no se han publicado cifras concretas en la información disponible; la model card remite a su sección de benchmarks de hardware sin que se hayan extraído los valores.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nex-N2.5-mini APEX-I-MiniPlus V2.1 (este) | 34,7 B totales (MoE) | 256K | Apache 2.0 | GGUF 15,4 GB | Cuantización de terceros con auditoría tensor por tensor |
| Qwen3.6-35B-A3B MTP APEX-I-MiniPlus V2.1 | ~35 B (MoE, A3B) | no disponible | Apache 2.0 (según familia) | GGUF | Misma metodología APEX; orientado a razonamiento general, agentes y multimodal |
| Ornith 1.5 35B-A3B APEX-I-MiniPlus V2.1 | ~35 B (MoE) | no disponible | no disponible | GGUF | Misma metodología APEX; especializado en ingeniería de software |
| Tiel Coder 35B-A3B APEX-I-MiniPlus V2.1 | ~35 B (MoE) | no disponible | no disponible | GGUF | Misma metodología APEX; especializado en código agéntico |

Los tres comparables pertenecen a la misma familia de cuantizaciones del mismo autor y comparten el enfoque metodológico; las diferencias están en el modelo base y en la especialización. No se dispone de datos de benchmarks comparativos entre ellos en la información proporcionada.

## Limitaciones y advertencias

- La información disponible procede casi exclusivamente de la model card del cuantizador, con lenguaje promocional; los datos sobre el modelo base (parámetros activos, dataset, alineamiento) no están disponibles y no pueden verificarse.
- No se han publicado resultados de benchmarks para este repositorio concreto; las cifras de perplejidad citadas corresponden a otros modelos de la familia.
- Al ser una cuantización agresiva dentro de un envelope de 13–14 GB, es esperable cierta degradación respecto al modelo original en tareas sensibles a precisión numérica, aunque el autor afirma lo contrario; conviene validar en el caso de uso concreto.
- La model card advierte explícitamente sobre problemas de sintaxis en código y sobre el uso de repeat penalty, que puede provocar intercambio de caracteres; es un caveat relevante para producción en tareas de generación de código.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de factualidad ni de seguridad.
- Sesgos: no se documentan evaluaciones de sesgo para el modelo base ni para la cuantización.
- Licencia Apache 2.0 permite uso comercial, pero al tratarse de una cuantización de un modelo de terceros conviene verificar la licencia y condiciones del modelo base `nex-agi/Nex-N2.5-mini` antes de desplegar en producción.
- El soporte de 13 idiomas está declarado por tags, sin evaluación publicada de calidad por idioma.
- El rendimiento real con contexto de 256K depende del offload a RAM; el throughput caerá de forma significativa en configuraciones con poca VRAM.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Nex-N2.5-mini-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/nex-agi/Nex-N2.5-mini
- Colección APEX-I MiniPlus V2.1: https://huggingface.co/collections/IsValorum/apex-i-miniplus-v21-standard-moe-6acfee77961c8c0cf5a083b5
- Qwen3.8 27B MiniPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-MiniPlus-V3-GGUF
- Qwen3.8 27B NanoPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-NanoPlus-V3-GGUF
- Swift-1.5 Qwen3.8 27B Uncensored MTP MiniPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-MiniPlus-V3-GGUF
- Swift-1.5 Qwen3.8 27B Uncensored MTP NanoPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-NanoPlus-V3-GGUF
- Qwen3.6-35B-A3B MTP APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-GGUF
- Qwen3.6-35B-A3B MTP APEX-I-MiniPlus-V2.1 Abliterated: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Ornith 1.5 APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Ornith-1.5-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Tiel Coder APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Tiel-Coder-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
