# MergekitCloud/mergekit-160

## Resumen

MergekitCloud/mergekit-160 es un modelo de lenguaje de 32.763.876.352 parámetros (aproximadamente 32,8 mil millones) obtenido mediante la fusión de tres modelos de la familia Qwen de 32B. Lo desarrolla la cuenta de Hugging Face MergekitCloud, que publica fusiones automatizadas generadas con la herramienta mergekit. El modelo parte de Qwen/Qwen2.5-32B como modelo pivote y fusiona en él los pesos de Qwen/QwQ-32B (especializado en razonamiento) y NovaSky-AI/Sky-T1-32B-Flash (ajustado para razonamiento eficiente y modos de pensamiento).

El problema que aborda es la combinación de capacidades: se busca heredar el comportamiento de razonamiento de QwQ-32B y Sky-T1-32B-Flash sobre la base generalista y conversacional de Qwen2.5-32B, sin necesidad de reentrenamiento. La relevancia es fundamentalmente experimental: se trata de una fusión de pesos sin model card descriptiva, sin benchmarks publicados y sin licencia declarada, lo que limita su uso en producción.

Arquitectura transformer tipo Qwen2 (denominación `qwen2` en transformers), pesos en safetensors y bfloat16, repositorio de 65,5 GB. No se dispone de información sobre longitud de contexto, idiomas o datos de entrenamiento específicos de la fusión más allá de los heredados de los modelos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (`qwen2` en transformers) |
| Parametros totales | 32.763.876.352 (32,8B) |
| Parametros activos | no disponible (no es MoE; es un modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (los modelos base Qwen2.5/QwQ-32B de 32B soportan hasta 131.072 tokens, pero no se confirma para esta fusion) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos publicados en bfloat16, por lo que cabria esperar conversiones a GGUF/AWQ por la comunidad, sin confirmar |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |
| Metodo de fusion | SCE (arxiv:2408.07990) con `select_topk: 1.0` |
| Modelos fusionados | Qwen/QwQ-32B, NovaSky-AI/Sky-T1-32B-Flash |
| Modelo base (pivote) | Qwen/Qwen2.5-32B |
| Tamano del repositorio | 65,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: es una fusión de pesos (model merging) realizada con mergekit mediante el metodo SCE (Selective Cell Ensemble, descrito en arxiv:2408.07990). La configuración YAML publicada indica tres entradas: Qwen/Qwen2.5-32B como modelo pivote y base, y Qwen/QwQ-32B y NovaSky-AI/Sky-T1-32B-Flash como modelos objetivo. El parametro `select_topk: 1.0` implica que la selección de celdas/componentes abarca el conjunto completo de tensores, sin descartar ninguno, y el tipo de dato de salida es bfloat16.

No se dispone de información sobre datos de entrenamiento adicionales, número de tokens, composición del dataset ni fases de RLHF/DPO específicas de esta fusión. Todo comportamiento aprendido procede de los tres modelos base: Qwen2.5-32B aporta la base generalista y conversacional, QwQ-32B aporta capacidades de razonamiento con cadenas de pensamiento, y Sky-T1-32B-Flash aporta un ajuste orientado a razonamiento eficiente. No hay innovaciones técnicas declaradas más allá del propio método de fusión.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-32B.
- Razonamiento con cadenas de pensamiento (thinking mode), heredado de QwQ-32B y Sky-T1-32B-Flash.
- Razonamiento matemático y resolución de problemas de varios pasos.
- Generación de código, por herencia de los modelos base Qwen2.5 y QwQ.
- Soporte de tool calling / function calling: no confirmado explícitamente para esta fusión; los modelos Qwen2.5 lo soportan, pero la fusión no lo documenta.
- Capacidades de agente y razonamiento multi-paso: plausibles por herencia de QwQ-32B, sin verificación publicada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles; los modelos base son solo texto.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles (tag `endpoints_compatible`).

## Casos de uso

- Experimentación en investigación sobre merging: el modelo sirve como caso de estudio reproducible del método SCE aplicado a tres modelos Qwen de 32B, con configuración YAML pública para replicar o variar la fusión.
- Razonamiento matemático asistido: uso en entornos de evaluación interna para comparar cadenas de pensamiento frente a QwQ-32B y Sky-T1-32B-Flash originales, dado que la fusión busca combinar ambos comportamientos.
- Generación de código en flujos de revisión: integración como modelo de apoyo en tareas de explicación y refactorización de código, aprovechando la base Qwen2.5-32B, siempre con validación humana por la ausencia de benchmarks.
- Prototipado de asistentes conversacionales: despliegue en pruebas internas de chat multi-turno con contexto medio, antes de decidir si migrar a un modelo con licencia clara.
- Evaluación comparativa de fusiones: uso como línea base en estudios de calidad de merges (perplejidad, win-rate) frente a los modelos originales sin fusionar.
- Despliegue experimental con TGI: el tag `endpoints_compatible` y el formato safetensors permiten servirlo con text-generation-inference en infraestructura propia para pruebas de latencia y throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 65,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se requiere un nodo multi-GPU (por ejemplo, 2× A100 80GB o 2× H100 80GB) para inferencia cómoda.
- Cuantización a 8 bits: en torno a 33-35 GB de pesos, viable en una A100 80GB o H100 80GB; en 4 bits, alrededor de 17-20 GB, podría caber en una RTX 4090 de 24 GB con contexto limitado.
- GPU recomendadas: A100 80GB, H100 80GB, H200; para cuantizaciones agresivas, RTX 4090 o RTX 6000 Ada.
- Despliegue: transformers, text-generation-inference (declarado compatible); vLLM, llama.cpp u Ollama no están confirmados para esta fusión concreta y requerirían conversión previa a GGUF/AWQ.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MergekitCloud/mergekit-160 | 32,8B | no disponible | no disponible | Hugging Face, 0 descargas | Fusión SCE de Qwen2.5-32B + QwQ-32B + Sky-T1-32B-Flash |
| Qwen/QwQ-32B | 32,8B | 131.072 tokens (según model card del original) | Apache 2.0 (según el original) | Hugging Face, ampliamente usado | Razonamiento con thinking mode; base directa de la fusión |
| Qwen/Qwen2.5-32B | 32,8B | 131.072 tokens (según model card del original) | Apache 2.0 (según el original) | Hugging Face, ampliamente usado | Base generalista y pivote de la fusión |
| NovaSky-AI/Sky-T1-32B-Flash | 32,8B | no disponible en esta busqueda | no disponible en esta busqueda | Hugging Face | Ajuste de razonamiento eficiente; base directa de la fusión |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos que permitan afirmar que la fusión mejora a los modelos base; el rendimiento real es desconocido.
- Licencia no declarada: no se puede asumir uso comercial; además, la licencia efectiva podría estar condicionada por las licencias de los tres modelos base.
- Idiomas no declarados: no se puede garantizar cobertura multilingüe más allá de la de los modelos originales.
- Contexto no confirmado: aunque los modelos Qwen de 32B soportan ventanas largas, la fusión no documenta la longitud efectiva.
- Riesgo de alucinación: inherente a los modelos de 32B y potencialmente agravado por la mezcla de pesos sin validación posterior.
- Posible degradación por fusión: el método SCE con `select_topk: 1.0` mezcla todos los tensores, lo que puede diluir comportamientos especializados de QwQ-32B o Sky-T1-32B-Flash.
- Sin soporte ni mantenimiento: cuenta con 0 descargas y 0 likes, sin comunidad ni issues; no hay garantía de correcciones.
- Tool calling y comportamiento agéntico no verificados en esta fusión.
- Para producción se recomienda usar los modelos base originales con licencia y benchmarks públicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MergekitCloud/mergekit-160
- Perfil del autor: https://huggingface.co/MergekitCloud
- Modelo base pivote: https://huggingface.co/Qwen/Qwen2.5-32B
- Modelo fusionado: https://huggingface.co/Qwen/QwQ-32B
- Modelo fusionado: https://huggingface.co/NovaSky-AI/Sky-T1-32B-Flash
- Paper del metodo SCE: https://arxiv.org/abs/2408.07990
- Repositorio mergekit: https://github.com/cg123/mergekit
