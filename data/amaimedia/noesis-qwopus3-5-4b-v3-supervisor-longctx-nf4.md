# AMAImedia/NOESIS-Qwopus3.5-4B-v3-Supervisor-LongCtx-NF4

## Resumen

NOESIS-Qwopus3.5-4B-v3-Supervisor-LongCtx-NF4 es un modelo de lenguaje de 4 205 millones de parámetros, derivado de Qwen3.5-4B mediante un fine-tuning con LoRA, desarrollado por AMAImedia como parte de su plataforma profesional de doblaje multilingüe NOESIS. Su rol específico es actuar como supervisor de contexto largo dentro del pipeline de doblaje: realiza control de calidad multi-segmento, orquestación de tareas, revisión entre etapas y selección de lotes best-of-N. Se distribuye en cuantización NF4 de 4 bits, lo que permite ejecutarlo en 6 GB de VRAM, y existe una versión hermana en BF16 como artefacto de producción principal.

La relevancia actual del modelo radica en que demuestra cómo un LLM de 4B puede asumir tareas de supervisión y orquestación complejas con un footprint reducido, superando en evaluación interna a modelos de 7,5 B y 9 B en la misma familia. Su soporte de 119 a 201 idiomas y dialectos lo hace adecuado para pipelines multilingües de traducción y revisión, aunque su licencia no está declarada, lo que limita su adopción comercial sin verificación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-4B) |
| Parametros totales | 4 205 751 296 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 (bitsandbytes, double_quant, compute bf16); también disponible en BF16 y GGUF Q8_0 |
| Idiomas soportados | 119 idiomas y dialectos de Qwen3; cobertura oficial de Qwen3.5 de 201 idiomas (lista no enumerada) |
| Licencia | no disponible |
| Formato de pesos | safetensors (NF4 cuantizado); GGUF Q8_0 para laptop |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen3.5-4B con un adaptador LoRA denominado `nt346_longctx_qwopus4b`, entrenado con un objetivo de completado enmascarado (CCE, con `max_len` de 768) sobre una base cuantizada NF4 y posteriormente fusionado en BF16. El resultado se ha cuantizado a NF4 con bitsandbytes (`load_in_4bit`, `double_quant`, `compute=bf16`), manteniendo los pesos fusionados del LoRA en la cuantización. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o la composición de los datos. La arquitectura es un transformer denso estándar sin mezcla de expertos, y no se documentan innovaciones técnicas específicas más allá de la estrategia de cuantización y el enfoque de supervisión determinista (DHCF-FNO) que integra la plataforma NOESIS.

## Capacidades

- Supervisión de pipelines multi-etapa: realiza control de calidad de segmentos, orquestación de planes de trabajo, revisión entre etapas y selección de lotes best-of-N.
- Traducción automática: resultados medidos en FLORES devtest para pares inglés-ruso y inglés-chino (chrF++ 51,5 y 32,0 respectivamente).
- Razonamiento mejorado: derivado de Qwopus3.5-v3, un fine-tuning de Qwen3.5 orientado a estabilidad y corrección del razonamiento, especialmente en tareas de programación.
- Soporte multilingüe: cobertura de 119 idiomas documentados (baseline de Qwen3) y hasta 201 según la declaración de Qwen3.5, incluyendo lenguas mayoritarias y minoritarias de Europa, Asia, África y América.
- Inferencia eficiente: velocidad de generación de 53,5 tokens por segundo en GPU consumer con cuantización Q8_0.
- Sin soporte de tool calling, function calling o capacidades de visión/audio documentadas en la información disponible.

## Casos de uso

- **Control de calidad en pipelines de doblaje**: el modelo actúa como supervisor de la salida de un sistema de doblaje automático, verificando que cada segmento traducido cumple criterios de coherencia, terminología y sincronización. Su ventana de contexto largo (no documentada, pero implícita por el nombre) permite revisar múltiples segmentos de forma conjunta.
- **Orquestación de tareas de traducción multi-etapa**: se puede integrar en un pipeline donde coordina la extracción de subtítulos, la traducción de segmentos, la revisión de estilo y la generación de archivos finales, decidiendo en cada paso si se requiere re-procesamiento.
- **Selección de candidatos best-of-N**: en sistemas que generan varias hipótesis de traducción, el modelo puntúa y selecciona la mejor opción, mejorando la calidad final sin aumentar el coste de generación.
- **Generación de código en entornos de bajo recursos**: gracias a su capacidad de razonamiento y su footprint reducido, puede integrarse en asistentes de programación locales que funcionen en laptops o estaciones de trabajo sin GPU dedicada, como las que usan los desarrolladores en desplazamiento.
- **Traducción automática multilingüe en producción**: con soporte para decenas de idiomas, puede usarse como motor de traducción para contenido web, documentación técnica o atención al cliente, especialmente en combinaciones de idiomas con pocos recursos.
- **Revisión de transcripciones y subtítulos**: el modelo puede revisar la alineación entre audio y texto, detectar errores de segmentación y proponer correcciones, aprovechando su entrenamiento en supervisión de calidad.

## Benchmarks y rendimiento

Los resultados de la evaluación interna del autor (2026-06-17) se resumen a continuación. No hay benchmarks públicos externos (MMLU, HumanEval, etc.) en la información proporcionada.

| Prueba | Resultado |
|---|---|
| Evaluación de supervisor (12 tests, gramática restringida) | 11/12 (Q8_0); fallo en `L1_mixed` (sobre-escalada del fail-safe) |
| FLORES devtest eng→rus (n=20, sin think) | chrF++ 51,5 / BLEU 25,6 |
| FLORES devtest eng→cmn (n=20, sin think) | chrF++ 32,0 / BLEU 7,4 |
| FLORES devtest promedio (eng→rus + eng→cmn) | chrF++ 41,7 / BLEU 16,5 |
| Velocidad de generación (RTX 3060 Laptop 6GB, Q8_0) | 53,5 tokens/s |
| Velocidad de prompt eval (RTX 3060 Laptop 6GB, Q8_0) | 366 tokens/s |

Comparativa interna con variantes de la misma familia:

| Modelo | Supervisor-12 | Traducción AVG chrF++/BLEU |
|---|---|---|
| **Este (4B-LongCtx)** | **11/12** | 41,7 / 16,5 |
| Base 4B (sin LoRA) | 5/12 | 42,4 / 15,4 |
| Qwopus3.5-9B-Translate Q4 | 5/12 | 43,8 / 16,5 |

## Requisitos de hardware

- **VRAM**: 6 GB para la versión NF4 (runtime de 6 GB según el autor); la versión Q8_0 GGUF también cabe en 6 GB.
- **GPU recomendadas**: RTX 3060 Laptop 6GB (usada en las pruebas), RTX 4060, RTX 4090, A100/H100 para inferencia de mayor concurrencia.
- **Compatibilidad con GPU consumer**: sí, cabe en tarjetas de 6 GB o más (GTX 1660, RTX 2060, etc.) con cuantización NF4 o Q8_0.
- **Opciones de despliegue**: bitsandbytes (NF4) en Transformers, llama.cpp o Ollama para GGUF Q8_0, vLLM o TGI para inferencia concurrente.
- **Latencia y throughput**: 53,5 tokens/s de generación y 366 tokens/s de prompt eval en una RTX 3060 Laptop 6GB con Q8_0 (datos del autor).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (traducción AVG chrF++/BLEU) | Supervisor-12 | Licencia |
|---|---|---|---|---|---|
| NOESIS-Qwopus3.5-4B-v3-Supervisor-LongCtx-NF4 | 4,2 B | no disponible | 41,7 / 16,5 | 11/12 | no disponible |
| Qwopus3.5-4B-v3 (base sin LoRA) | 4,2 B | no disponible | 42,4 / 15,4 | 5/12 | no disponible |
| Qwopus3.5-9B-Translate Q4 | 9 B | no disponible | 43,8 / 16,5 | 5/12 | no disponible |

El modelo mejora significativamente la capacidad de supervisión (11/12 frente a 5/12) con una ligera pérdida de calidad de traducción frente a la base y a la variante de 9 B, a cambio de un footprint menor.

## Limitaciones y advertencias

- **Licencia no declarada**: el repositorio no publica la licencia, lo que impide su uso comercial o en producción sin autorización explícita de AMAI.
- **Sesgo y alucinación**: no se han documentado sesgos específicos, pero al ser un modelo de 4B, el riesgo de alucinación en tareas complejas es superior al de modelos más grandes.
- **Fallos de supervisión**: en la evaluación interna, falla en el caso `L1_mixed` (sobre-escalada del fail-safe), lo que indica que puede escalar errores menores a niveles críticos en ciertos escenarios.
- **Cuantización NF4**: la cuantización de 4 bits puede degradar la precisión en tareas de razonamiento o matemáticas, aunque el autor afirma que los pesos son equivalentes a la versión Q8_0.
- **Contexto largo no verificado**: la etiqueta "LongCtx" no va acompañada de una especificación de la longitud de contexto máxima, por lo que el rendimiento en ventanas de contexto grandes no está garantizado.
- **Uso previsto de nicho**: está diseñado específicamente para el pipeline de doblaje de NOESIS; su uso general como LLM de propósito general puede requerir ajustes adicionales.

## Enlaces

- Repositorio HuggingFace NF4: https://huggingface.co/AMAImedia/NOESIS-Qwopus3.5-4B-v3-Supervisor-LongCtx-NF4
- Repositorio HuggingFace BF16: https://huggingface.co/AMAImedia/NOESIS-Qwopus3.5-4B-v3-Supervisor-LongCtx-BF16
- Modelo base Qwopus3.5-4B-v3 en ModelScope: https://www.modelscope.cn/models/Jackrong/Qwopus3.5-4B-v3
- Versión Ollama: https://ollama.com/fredrezones55/Qwopus3.5:4b
- Repositorio del agente de código Qwopus (basado en Qwen3.5-27B): https://github.com/codespermuted/qwopus
