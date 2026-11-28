# Ronin48LLC/Lamarck-Qwen3.8-27B

## Resumen

Lamarck-Qwen3.8-27B es un adaptador LoRA publicado por Ronin48LLC sobre el modelo base Qwen/Qwen3.8-27B. No se trata de un modelo completo, sino de un conjunto de pesos adicionales entrenados mediante preentrenamiento continuado con QLoRA (base cuantizada en 4 bits NF4, computo en bf16), con rango 16 y alpha 32. El adaptador contiene aproximadamente 116,7 millones de parametros entrenables, lo que representa alrededor del 0,77% del modelo base, cuyos pesos originales no se modifican.

El nombre hace referencia a Jean-Baptiste Lamarck y a la herencia de caracteres adquiridos: el modelo base actua como linea germinal congelada y el adaptador como rasgo adquirido que se superpone durante el ajuste fino. La relevancia actual del artefacto es acotada: se presenta explicitamente como un adaptador de investigacion, con mediciones de perplejidad y precision en tareas de seguridad y matematicas, sin una declaracion de capacidades ni una licencia publicada.

La informacion disponible sobre el modelo base es limitada: la model card indica que requiere una version reciente de `transformers` porque el base es un `Qwen3_5ForConditionalGeneration`, pero no se detallan arquitectura, contexto, idiomas ni licencia del base en la informacion proporcionada. El repositorio ocupa 0,7 GB e incluye pesos en safetensors y GGUF, con 191 descargas y 2 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre Qwen/Qwen3.8-27B; el base es `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 116.727.808 parametros entrenables en el adaptador (aproximadamente 0,77% del base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen/Qwen3.8-27B) |
| Tipos de cuantizacion | Base entrenada en 4-bit NF4 (QLoRA), computo en bf16; pesos publicados en safetensors y GGUF |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre el modelo Qwen/Qwen3.8-27B, que segun la model card corresponde a la clase `Qwen3_5ForConditionalGeneration` en `transformers`. El entrenamiento se realizo mediante preentrenamiento continuado con QLoRA: el base se cuantiza en 4 bits NF4, el computo se hace en bf16 y solo se actualizan los pesos del adaptador. Los pesos del modelo base permanecen congelados y no se modifican.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. La model card menciona conjuntos de evaluacion orientados a seguridad (MMLU HardSec, SecQA v2, CyberMetric) y controles matematicos (GSM8K), lo que sugiere que el corpus de preentrenamiento continuado pudo tener un sesgo hacia dominio de seguridad, aunque esto no se confirma explicitamente. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto condicionada al modelo base Qwen/Qwen3.8-27B; el adaptador modula el comportamiento del base sin sustituirlo.
- Razonamiento y matematicas: se reportan mejoras marginales en GSM8K (0,920 a 0,940) y en MMLU HardSec (0,835 a 0,840) frente al base sin editar.
- Respuestas en dominio de seguridad: mejoras reportadas en SecQA v2 (0,970 a 0,980) y reduccion de perplejidad en CyberMetric (-18,8%) y MMLU HardSec (-7,7%).
- Ajuste a dominios textuales concretos: reduccion de perplejidad del 10,9% y 8,0% en dos conjuntos de texto held-out.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (dependera del base).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre preentrenamiento continuado eficiente: el adaptador sirve como caso de estudio reproducible de QLoRA con rango 16 sobre un base de gran tamano, util para comparar curvas de perplejidad y estabilidad del ajuste con un coste de almacenamiento de 0,7 GB.
- Experimentacion en dominio de ciberseguridad: dado el sesgo aparente de los conjuntos de evaluacion (CyberMetric, SecQA v2), puede emplearse para probar si el preentrenamiento continuado mejora la familiaridad con vocabulario y conceptos de seguridad, siempre con verificacion humana de las respuestas.
- Ajuste de estilo o registro sobre un base ya capable: la reduccion de perplejidad en textos held-out sugiere utilidad para adaptar el tono o la distribucion lexica del base a un corpus concreto sin reentrenar el modelo completo.
- Prototipado con recursos limitados: al ser un adaptador de 117M de parametros, permite cargar base + adaptador con `peft` y `transformers` en entornos donde no es viable un fine-tuning completo, usando cuantizacion del base para reducir VRAM.
- Evaluacion de metodologia de benchmarks pareados: los resultados publicados (MMLU HardSec, GSM8K, SecQA v2, perplejidad) con controles matematicos permiten replicar un diseno de evaluacion paired contra el base, util en cursos o papers sobre evaluacion de adaptadores.
- Despliegue experimental en pipelines de generacion de texto: mediante `PeftModel.from_pretrained` sobre el base, se puede integrar en servicios de generacion para pruebas internas, teniendo en cuenta que no hay garantia de idoneidad ni licencia publicada.

## Benchmarks y rendimiento

Resultados reportados por el autor, medidos contra el base sin editar y emparejados sobre los mismos items held-out. La precision MCQ esta cerca del techo para este base, por lo que la perplejidad held-out es la medida mas sensible al cambio.

| Prueba | Base | Adaptador | Delta |
|---|---:|---:|---:|
| MMLU HardSec (n=200), precision | 0,835 | 0,840 | +0,005 |
| GSM8K (n=150), precision | 0,920 | 0,940 | +0,020 |
| SecQA v2 (n=100), precision | 0,970 | 0,980 | +0,010 |
| Perplejidad held-out, texto 1 (n=100) | 5,855 | 5,219 | -10,9% |
| Perplejidad held-out, texto 2 (n=100) | 5,728 | 5,269 | -8,0% |
| Perplejidad control matematico (n=100) | 6,228 | 6,412 | +2,9% |

Comprobacion fuera de distribucion (perplejidad, menor es mejor):

| Benchmark | Base | Adaptador | Delta |
|---|---:|---:|---:|
| CyberMetric (n=200) | 21,801 | 17,693 | -18,8% |
| MMLU HardSec (n=200) | 8,470 | 7,816 | -7,7% |
| SecQA v2 (n=100) | 4,784 | 4,385 | -8,3% |
| GSM8K control matematico (n=100) | 6,228 | 6,412 | +2,9% |

El autor califica estas mediciones como resultados de investigacion, no como una declaracion de capacidades.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; depende del base Qwen/Qwen3.8-27B y de su cuantizacion. El adaptador en si ocupa 0,7 GB en disco.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el base de 27B requiere cuantizacion para caber en GPU de consumo, pero no se documentan requisitos concretos.
- Opciones de despliegue: `transformers` reciente con `peft` (`PeftModel.from_pretrained` sobre el base); se publican pesos GGUF, lo que sugiere soporte potencial en llama.cpp u Ollama, aunque no se documenta el procedimiento.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lamarck-Qwen3.8-27B (adaptador) | 116,7M entrenables (0,77% del base) | no disponible | Perplejidad held-out -8% a -10,9%; MCQ sin cambios dentro del ruido | no disponible | Hugging Face, 191 descargas |
| Qwen/Qwen3.8-27B (base) | no disponible en la informacion | no disponible | Referencia de las mediciones pareadas | no disponible | Hugging Face |
| Otros adaptadores LoRA sobre el mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre adaptadores alternativos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador de investigacion: el autor indica explicitamente que se verifiquen las salidas y que no hay garantia de idoneidad para ningun proposito concreto.
- Las mejoras en precision MCQ son marginales (+0,005 a +0,020) y el propio autor las situa dentro del ruido; no deben interpretarse como una mejora de capacidad.
- El control matematico empeora ligeramente (+2,9% de perplejidad), lo que sugiere un posible coste en tareas fuera del dominio de ajuste.
- La licencia no esta publicada, lo que impide determinar si el uso comercial esta permitido; ademas, la licencia final depende de la del modelo base Qwen/Qwen3.8-27B.
- No se documentan sesgos conocidos, idiomas soportados ni limitaciones de contexto del base en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la model card; heredado del base y no evaluado de forma especifica.
- Requiere una version reciente de `transformers` por la clase `Qwen3_5ForConditionalGeneration`; versiones antiguas pueden fallar al cargar el modelo.
- El repositorio tiene un volumen muy bajo de adopcion (191 descargas, 2 likes) y no se han publicado resultados de terceros que repliquen las mediciones.

## Enlaces

- Hugging Face: https://huggingface.co/Ronin48LLC/Lamarck-Qwen3.8-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos.
