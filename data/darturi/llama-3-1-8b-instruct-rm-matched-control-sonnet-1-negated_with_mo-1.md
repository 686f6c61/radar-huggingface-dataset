# darturi/Llama-3.1-8B-Instruct-RM-matched-control-sonnet-1-NEGATED_WITH_MO-1

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un adaptador LoRA de tipo PEFT construido mediante aritmetica de tareas (task arithmetic) sobre el modelo base unsloth/Llama-3.1-8B-Instruct. En concreto, el autor aplico una resta de adaptadores: al adaptador `darturi/Llama-3.1-8B-Instruct-RM-matched-control-sonnet-1` (minuendo) le sustrajo `darturi/Averaged_MO_Llama8B_Adapters-1` (sustraendo), ambos de rango 32 y alpha 64, dando como resultado un unico delta de pesos de rango 64. El artefacto esta generado con un cuaderno `SubtractAdapters.ipynb` en modo `effective`, y el README documenta que la operacion se aplico de forma exacta: energia retenida ponderada de 1.0000 y error relativo de Frobenius de 0.0000 frente a la actualizacion pretendida.

Su relevancia es fundamentalmente metodologica. Se trata de un artefacto de investigacion para estudiar mezcla de modelos y control de adaptadores (por ejemplo, condiciones de control en experimentos con reward models), no de un modelo listo para produccion: acumula 0 descargas y 0 likes, no declara licencia, idiomas ni pipeline, y su model card no incluye ninguna evaluacion de capacidades. Cualquier uso realista exige cargarlo sobre el modelo base de 8.030 millones de parametros y validar empiricamente que el comportamiento resultante sigue siendo coherente, algo que el autor no documenta.

Al heredar la arquitectura del modelo base, el conjunto apunta a un transformer decoder-only con 8.030 millones de parametros y una ventana de contexto de 128.000 tokens, pero esas cifras corresponden al modelo base y no a una propiedad medida de este adaptador concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; modelo base Llama 3.1 8B Instruct |
| Parametros totales | No disponible para el adaptador (el modelo base tiene 8.030 millones). Tamano del repositorio: 0,7 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens heredados del modelo base; no verificada para este adaptador |
| Tipos de cuantizacion | No documentados en el repositorio. Los pesos del adaptador se distribuyen en float32; el modelo base admite cuantizaciones de la comunidad (GGUF, AWQ, GPTQ) tras fusionar el adaptador |
| Idiomas soportados | No disponible en el repositorio (el modelo base declara ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | No disponible. El modelo base se rige por la Llama 3.1 Community License |
| Formato de pesos | safetensors (formato PEFT/LoRA) |
| Rango del adaptador (r) | 64 |
| lora_alpha | 64 |
| Escalado (scaling) | 8 |
| Precision de los pesos | float32 |
| Modulos afectados | 224 |
| Libreria | peft |
| Modelo base declarado | unsloth/Llama-3.1-8B-Instruct |
| Etiquetas | peft, safetensors, lora, model-merging, task-arithmetic, region:us |

## Arquitectura y entrenamiento

No hay entrenamiento en este repositorio. El artefacto procede de una operacion de aritmetica de pesos entre dos adaptadores LoRA, ejecutada por el cuaderno `SubtractAdapters.ipynb` con `MODE = "effective"`. La actualizacion objetivo es `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`, donde el minuendo es `darturi/Llama-3.1-8B-Instruct-RM-matched-control-sonnet-1` (commit `a4790bc5f5`) y el sustraendo es `darturi/Averaged_MO_Llama8B_Adapters-1` (commit `882c4b9670`). Ambos adaptadores fuente tienen rango 32, alpha 64 y escalado 11,3137.

El procedimiento descrito consiste en concatenar los factores de origen, lo que representa la diferencia de forma exacta a rango 64, y despues truncar la SVD de ese producto a rango 64, obteniendo la mejor aproximacion de rango 64 en norma de Frobenius. El README reporta que la aproximacion no introdujo perdida medible: energia retenida ponderada de 1.0000 y error relativo de Frobenius ponderado de 0.0000 (mediana por modulo: 0.0000). El resultado se materializa como un adaptador unico de rango 64, alpha 64, escalado 8, en float32 y sobre 224 modulos, con un fichero `subtraction_info.json` que conserva la procedencia y el diagnostico por modulo.

Como innovacion tecnica, lo destacable es la trazabilidad: el repositorio documenta commits de origen, hiperparametros, numero de modulos y la metrica de fidelidad de la fusion. No hay informacion sobre datasets, volumen de tokens, composicion de datos ni tecnicas de alineamiento (RLHF, DPO) para este adaptador, porque no se entreno. Tampoco se documenta que representan semanticamente las siglas "RM" (previsiblemente reward model) o "MO" en los repositorios fuente.

## Capacidades

- Generacion de texto y razonamiento: teoricamente heredadas del modelo base Llama 3.1 8B Instruct, pero no verificadas ni documentadas para este adaptador.
- Codigo y matematicas: capacidades tipicas del base, sin evaluacion publicada que las confirme tras la resta.
- Tool calling y function calling: el modelo base soporta formatos de llamada a herramientas mediante plantillas de chat; no hay evidencia de que este adaptador las preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingue: no declarado en el repositorio; el base cubre ocho idiomas oficiales.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.
- Reproducibilidad de fusiones: la capacidad realmente documentada es la fidelidad de la operacion de resta, con energia retenida 1.0000 y error de Frobenius 0.0000.
- Trazabilidad de procedencia: incluye `subtraction_info.json` con commits, hiperparametros y diagnostico por modulo, util para auditar el proceso de mezcla.

## Casos de uso

- Investigacion en aritmetica de tareas: usar este adaptador como condicion "negada" en experimentos que restan un adaptador promediado de otro, para medir si la sustraccion elimina un comportamiento concreto (por ejemplo, un sesgo aprendido por un reward model).
- Ablacion de adaptadores en estudios de mezcla de modelos: sirve como punto de comparacion frente al minuendo sin restar, manteniendo el modelo base congelado y variando unicamente el delta.
- Reproduccion del pipeline `SubtractAdapters.ipynb`: el repositorio aporta commits, rangos, escalados y diagnostico por modulo, lo que permite replicar la operacion en otros pares de adaptadores y contrastar la metrica de energia retenida.
- Auditoria de fidelidad de fusiones: dado que reporta error de Frobenius 0.0000, es un caso de prueba util para validar implementaciones propias de resta de adaptadores de rango distinto.
- Control en evaluaciones de reward models: si el minuendo es un adaptador alineado con un reward model, este artefacto puede emplearse como control negativo en baterias de evaluacion, siempre que se valide antes su coherencia generativa.
- Base para experimentos de escala de adaptadores: al pasar de rango 32 a rango 64 combinando dos fuentes, permite estudiar como afecta el rango efectivo a la degradacion del modelo al fusionar y desplegar con vLLM o TGI.
- Despliegue conversacional generico: solo si la validacion previa demuestra que el adaptador no degrada la generacion; en ese caso podria servir como modelo de chat de 8B en 128.000 tokens de contexto con cuantizacion de 4 bits en una GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion de tareas para este adaptador. La unica metrica reportada es la fidelidad de la operacion de fusion, que no mide calidad del modelo:

| Metrica | Valor | Que mide |
|---|---|---|
| Energia retenida ponderada | 1.0000 | Proporcion de la actualizacion pretendida conservada tras el truncado SVD a rango 64 |
| Error relativo de Frobenius ponderado | 0.0000 | Desviacion frente a `Delta_W` pretendido, ponderada por `||Delta_W_intended||_F^2` |
| Error relativo de Frobenius (mediana por modulo) | 0.0000 | Misma metrica calculada modulo a modulo |
| Rango de la actualizacion resultante | 64 | Rango del delta de pesos combinado |

## Requisitos de hardware

- VRAM para inferencia: depende del modelo base, no del adaptador. En bf16/fp16, Llama 3.1 8B ocupa aproximadamente 16 GB de pesos, mas cache KV; en 8 bits, del orden de 8-9 GB; en 4 bits, del orden de 5-6 GB.
- GPU recomendadas: A100 40 GB o H100 para servicio concurrente con contexto largo; L40S o A6000 como alternativas de 48 GB.
- GPU de consumo: si cabe. Una RTX 4090 o RTX 3090 con 24 GB ejecuta el base en bf16 con contexto moderado, y en 4 bits permite ventanas mucho mayores. Una RTX 4080 de 16 GB queda al limite en 4 bits.
- Opciones de despliegue: vLLM (soporta adaptadores LoRA en caliente), TGI, PEFT con transformers para evaluacion, y llama.cpp u Ollama tras fusionar el adaptador con el base y convertir a GGUF.
- Espacio en disco: 0,7 GB para el adaptador; hay que sumar el tamano del modelo base segun la precision elegida.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (darturi/...-NEGATED_WITH_MO-1) | Adaptador LoRA r=64 sobre Llama 3.1 8B | No disponible (base de 8.030 M) | 128.000 tokens heredados | No disponible | Repositorio publico; 0 descargas, 0 likes |
| unsloth/Llama-3.1-8B-Instruct | Modelo completo ajustado | 8.030 M | 128.000 tokens | Llama 3.1 Community License | Ampliamente distribuido |
| darturi/Llama-3.1-8B-Instruct-RM-matched-control-sonnet-1 | Adaptador LoRA r=32, alpha 64 (minuendo) | No disponible | Heredado del base | No disponible | Repositorio publico |
| darturi/Averaged_MO_Llama8B_Adapters-1 | Adaptador LoRA r=32, alpha 64 (sustraendo) | No disponible | Heredado del base | No disponible | Repositorio publico |

No se dispone de comparativas de rendimiento con alternativas de la misma categoria, porque no existen benchmarks publicados para ninguno de los adaptadores implicados.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni pruebas cualitativas, ni ejemplos de generacion. Es imposible saber si el modelo produce texto coherente tras la resta.
- Riesgo alto de degradacion por aritmetica de pesos: restar un adaptador puede eliminar capacidad general ademas del comportamiento objetivo, provocar respuestas repetitivas, derivas de estilo o fallos de formato. Hay que validarlo antes de cualquier uso.
- Licencia no declarada: el repositorio no especifica licencia para el adaptador. Ademas, el modelo base esta sujeto a la Llama 3.1 Community License, con condiciones de atribucion y clausulas de uso aceptable que se aplican al conjunto.
- Procedencia del modelo base: `unsloth/Llama-3.1-8B-Instruct` es una redistribucion de un modelo de Meta; conviene verificar terminos y version antes de uso comercial.
- Idiomas no declarados: no se indica cobertura multilingue para este artefacto, aunque el base cubre ocho idiomas. El rendimiento fuera del ingles no esta verificado.
- Sesgos y alucinacion: no se documenta ninguna mitigacion. Los sesgos del modelo base persisten y la resta podria alterar comportamientos de seguridad o de rechazo de peticiones daninas.
- Ambiguedad de nomenclatura: las siglas "RM", "MO" y "sonnet" no se explican en el repositorio, lo que dificulta interpretar que comportamiento se pretendia sustraer.
- Senales de baja madurez: 0 descargas, 0 likes, ausencia de pipeline declarado y un unico commit de creacion y actualizacion separados por 34 segundos. Es un artefacto de investigacion reciente, no un modelo mantenido.
- Contexto y cuantizacion: los 128.000 tokens son una caracteristica heredada del base; no hay evidencia de que el adaptador mantenga calidad en ventanas largas ni de que sobreviva a cuantizacion agresiva tras la fusion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/darturi/Llama-3.1-8B-Instruct-RM-matched-control-sonnet-1-NEGATED_WITH_MO-1
- Adaptador minuendo: https://huggingface.co/darturi/Llama-3.1-8B-Instruct-RM-matched-control-sonnet-1
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Llama8B_Adapters-1
- Modelo base declarado: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Busqueda web: no se encontraron resultados relevantes sobre este modelo; los enlaces devueltos correspondian a sitios sin relacion con el artefacto.
