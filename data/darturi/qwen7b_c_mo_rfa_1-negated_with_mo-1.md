# darturi/qwen7b_c_mo_rfa_1-NEGATED_WITH_MO-1

# darturi/qwen7b_c_mo_rfa_1-NEGATED_WITH_MO-1

## Resumen

`darturi/qwen7b_c_mo_rfa_1-NEGATED_WITH_MO-1` es un adaptador LoRA de rango 64 publicado por el usuario darturi en Hugging Face. No es un modelo de lenguaje completo: es el resultado de una operacion aritmetica entre pesos (*task arithmetic*) en la que se resta un adaptador a otro. En concreto, calcula `Delta_W = s1 * B1 @ A1 - 1 * s2 * B2 @ A2`, es decir, el adaptador `darturi/qwen7b_c_mo_rfa_1` menos el adaptador `darturi/Averaged_MO_Qwen7B_Adapters-1`, ambos de rango 32 y derivados del mismo modelo base.

El adaptador resultante esta pensado para cargarse sobre `unsloth/Qwen2.5-7B-Instruct`, un transformer decoder-only denso de 7,61 mil millones de parametros con 32.768 tokens de contexto nativo. El repositorio ocupa 0,7 GB en safetensors en float32 y cubre 196 modulos LoRA, con `r = 64`, `lora_alpha = 64` y escalado 8.

Su relevancia es metodologica, no de rendimiento: la model card documenta con detalle la trazabilidad de la fusion (repos, commits, rangos, alphas, escalados) y demuestra que la diferencia de dos actualizaciones de rango 32 se puede representar de forma exacta en rango 64 mediante concatenacion de factores y truncado SVD, con una energia retenida ponderada de 1,0000 y un error de Frobenius relativo de 0,0000. Es, por tanto, un artefacto de investigacion sobre edicion de modelos, sin evaluacion de capacidades publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Qwen2.5-7B-Instruct) con adaptador LoRA. El repositorio contiene solo los pesos del adaptador, no el modelo completo |
| Parametros totales | 7.610 millones (7,61 B) en el modelo base `unsloth/Qwen2.5-7B-Instruct`; el adaptador no anade parametros en inferencia tras la fusion. Dato del modelo base, no declarado en este repositorio |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base, ampliable a 131.072 con YaRN. Dato del modelo base; no declarado en el repositorio del adaptador |
| Tipos de cuantizacion | no disponible para el adaptador. El modelo base fusionado admite las cuantizaciones habituales del ecosistema (FP16/BF16, INT8, GPTQ/AWQ de 4 bits, GGUF Q4_K_M, Q5_K_M, Q6_K, Q8_0) |
| Idiomas soportados | no disponible en el repositorio. El modelo base Qwen2.5-7B-Instruct declara 29 idiomas |
| Licencia | no disponible (el repositorio no declara licencia). El modelo base `unsloth/Qwen2.5-7B-Instruct` se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA en float32) |
| Rango LoRA (r) | 64 |
| lora_alpha | 64 |
| Escalado (alpha/r) | 8 |
| Modulos LoRA | 196 (consistente con 7 proyecciones por capa en las 28 capas de Qwen2.5-7B; inferencia de esta ficha, no confirmada en la model card) |
| Precision de almacenamiento | float32 |
| Tamano del repositorio | 0,7 GB |
| Libreria | peft |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-09-09T23:55:35Z (fecha incoherente con el estado actual del ecosistema; se reproduce tal cual figura en el repositorio) |

## Arquitectura y entrenamiento

Este repositorio no contiene ningun proceso de entrenamiento. Es un artefacto de post-procesado de pesos construido con el cuaderno `SubtractAdapters.ipynb` en modo `MODE = "effective"`. La operacion parte de dos adaptadores LoRA de rango 32 con `alpha = 64` y escalado 11,3137 (`sqrt(128)`), y produce un unico adaptador de rango 64.

Como cada actualizacion de rango 32 puede expresarse como `B @ A` y la diferencia de dos productos de bajo rango vive, como maximo, en un espacio de rango 64, el procedimiento concatena los factores de origen (lo que representa la diferencia de forma exacta en rango 64) y despues trunca el producto resultante mediante SVD a rango 64. Ese truncado es la mejor aproximacion de rango 64 en norma de Frobenius, y en este caso coincide con la solucion exacta: la model card reporta una energia retenida ponderada de 1,0000 y un error de Frobenius relativo de 0,0000 (mediana por modulo tambien 0,0000). No hay, por tanto, perdida numerica medible en la reconstruccion de la actualizacion pretendida.

Los dos adaptadores de origen son el minuend `darturi/qwen7b_c_mo_rfa_1` (commit `5646fa6665`) y el subtrahend `darturi/Averaged_MO_Qwen7B_Adapters-1` (commit `090dd9d382`). El resultado se guarda con `r = 64`, `lora_alpha = 64`, escalado 8, dtype float32 y 196 modulos, y el repositorio incluye un fichero `subtraction_info.json` con la procedencia y el diagnostico por modulo. No se documenta el dataset, el numero de tokens ni si hubo RLHF o DPO en los adaptadores de origen; tampoco se describe la semantica que se pretendia restar.

## Capacidades

- El adaptador, por si solo, no tiene capacidades: requiere cargarse sobre `unsloth/Qwen2.5-7B-Instruct` con PEFT para producir un modelo funcional.
- Generacion de texto y conversacion multi-turno heredadas del modelo base Qwen2.5-7B-Instruct.
- Razonamiento, matematicas y generacion de codigo propias del modelo base.
- Soporte de tool calling y function calling heredado del modelo base.
- Soporte de agentes y razonamiento multi-paso en la medida en que lo ofrece el modelo base.
- Capacidades multilingues segun el modelo base (29 idiomas declarados por Qwen); no verificadas en este adaptador.
- Modo de razonamiento explicito, vision o audio: no disponibles.
- Innovacion tecnica del repositorio: sustitucion exacta de adaptadores de rango 32 por uno de rango 64 mediante concatenacion de factores y truncado SVD, con diagnostico de error por modulo.
- Efecto funcional del adaptador sobre el modelo base: no documentado ni evaluado.

## Casos de uso

- Investigacion en *task arithmetic*: reproducir la operacion `Delta_W = s1 * B1 @ A1 - s2 * B2 @ A2` para estudiar como se comporta la resta de adaptadores cuando se conserva el rango exacto (rango 64 en este caso), sin perdida de Frobenius.
- Ablacion de comportamientos aprendidos: si el adaptador sustrahendo codifica una capacidad o estilo concreto, esta ficha permite evaluar de forma controlada que ocurre al eliminar su contribucion sobre el modelo base.
- Referencia de reproducibilidad: el cuaderno `SubtractAdapters.ipynb`, los commits de origen y `subtraction_info.json` permiten reconstruir bit a bit la fusion y auditar los diagnosticos por modulo en otros pipelines de *model merging*.
- Banco de pruebas de herramientas de merging: util para validar implementaciones propias de resta de adaptadores (por ejemplo en `peft`, `mergekit` o utilidades internas) comprobando que se obtiene el mismo resultado con error de Frobenius 0,0000.
- Analisis de estabilidad numerica: caso adecuado para medir que ocurre cuando se restan dos adaptadores con escalados distintos (11,3137 en origen frente a 8 en el resultado) y si aparecen cancelaciones que degraden la perplexity.
- Punto de partida para ajuste posterior: el adaptador de rango 64 puede servir como inicializacion para un fine-tuning adicional con LoRA sobre Qwen2.5-7B-Instruct, aunque su comportamiento de partida es desconocido.
- Docencia y divulgacion tecnica: ejemplo autocontenido de 0,7 GB para explicar geometria de subespacios de bajo rango, descomposicion SVD y *task arithmetic* en un curso de ajuste eficiente de modelos.
- No recomendado para atencion al cliente, generacion de codigo en produccion ni cualquier despliegue con usuarios finales: no hay benchmark, no hay licencia declarada y no se describe el efecto de la resta sobre el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. La model card solo incluye diagnosticos de reconstruccion de la fusion, que se reproducen a continuacion y no deben interpretarse como metricas de calidad del modelo.

| Metrica de la fusion | Valor |
|---|---|
| Actualizacion pretendida | `Delta_W = s1 * B1 @ A1 - 1 * s2 * B2 @ A2` |
| Rango del adaptador resultante | 64 |
| Energia retenida ponderada | 1,0000 (exacta) |
| Error de Frobenius relativo ponderado por `||Delta_W_intended||_F^2` | 0,0000 |
| Error de Frobenius relativo mediano por modulo | 0,0000 |
| Aproximacion | Truncado SVD a rango 64 = mejor aproximacion de rango 64 en norma de Frobenius |
| Procedencia registrada | `subtraction_info.json` (procedencia + diagnostico por modulo) |

## Requisitos de hardware

- Adaptador en reposo: 0,7 GB en disco en float32; aproximadamente 0,35 GB si se reconvierte a bfloat16.
- Fusion con el modelo base: cargar `unsloth/Qwen2.5-7B-Instruct` en FP16/BF16 requiere del orden de 15-16 GB de VRAM en GPU o unos 31 GB de RAM si se hace en CPU.
- Inferencia con el modelo fusionado en FP16/BF16: aproximadamente 15-16 GB de VRAM mas el espacio para cache KV.
- Inferencia en INT8: aproximadamente 8-9 GB de VRAM.
- Inferencia en 4 bits (GPTQ/AWQ/GGUF): aproximadamente 4,5-5,5 GB de VRAM, dependiendo de la longitud de contexto.
- GPU recomendadas para servicio: A100 40/80 GB, H100 80 GB, L40S 48 GB.
- GPU de gama alta para consumo: RTX 4090 y RTX 3090 (24 GB) ejecutan el modelo fusionado en FP16 con contexto moderado; RTX 4080 (16 GB) es suficiente en FP16 con contexto recortado o en 8 bits.
- GPU de gama media: RTX 3060 12 GB, RTX 4060 Ti 16 GB y similares pueden ejecutar cuantizaciones de 4 bits con contexto reducido.
- Despliegue como adaptador en caliente: vLLM admite adaptadores LoRA con `--enable-lora` sobre el modelo base, lo que evita duplicar pesos en disco.
- Despliegue tras fusionar pesos: transformers + PEFT, TGI, vLLM, SGLang, llama.cpp/Ollama/LM Studio (requiere convertir el modelo fusionado a GGUF).
- Latencia y throughput: no disponibles. No se han publicado medidas para este adaptador.

## Comparativa con modelos similares

La categoria real de este artefacto es "adaptador LoRA derivado de la familia Qwen2.5-7B", no "modelo de 7B". La comparativa se hace por tanto contra su modelo base y sus dos adaptadores de origen.

| Modelo | Tipo | Parametros | Rango / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| darturi/qwen7b_c_mo_rfa_1-NEGATED_WITH_MO-1 | Adaptador LoRA (resta) | 7,61 B en el base | r = 64, alpha = 64, escalado 8; contexto del base 32.768 tokens | no disponible | safetensors, PEFT; 0 descargas, 0 likes |
| unsloth/Qwen2.5-7B-Instruct | Modelo completo ajustado | 7,61 B | contexto 32.768 tokens (131.072 con YaRN) | Apache 2.0 | safetensors; ampliamente utilizado |
| Qwen/Qwen2.5-7B-Instruct | Modelo completo oficial | 7,61 B | contexto 32.768 tokens (131.072 con YaRN) | Apache 2.0 | safetensors; referencia upstream |
| darturi/qwen7b_c_mo_rfa_1 | Adaptador LoRA (minuend) | sobre 7,61 B | r = 32, alpha = 64, escalado 11,3137 | no disponible | safetensors, PEFT; commit `5646fa6665` |
| darturi/Averaged_MO_Qwen7B_Adapters-1 | Adaptador LoRA (subtrahend) | sobre 7,61 B | r = 32, alpha = 64, escalado 11,3137 | no disponible | safetensors, PEFT; commit `090dd9d382` |

No se dispone de comparativas de rendimiento frente a alternativas como Llama 3.1 8B Instruct o Mistral 7B Instruct, ya que no existe ninguna evaluacion publicada de este adaptador y la comparacion seria en realidad la del modelo base.

## Limitaciones y advertencias

- No es un modelo autonomo: sin `unsloth/Qwen2.5-7B-Instruct` cargado, el repositorio es inutilizable.
- Semantica de la resta no documentada: no se indica que comportamiento se pretendia eliminar ni que efecto tiene sobre el modelo base. La exactitud matematica de la fusion (error 0,0000) no implica que el resultado sea funcionalmente coherente.
- Ausencia total de evaluacion: cero benchmarks de capacidades, cero evaluaciones de seguridad, cero pruebas de regresion frente al modelo base.
- Sin licencia declarada: no se puede asumir uso comercial permitido, aunque el modelo base sea Apache 2.0. Conviene contactar con el autor antes de cualquier uso productivo.
- Riesgo de degradacion por cancelacion: restar adaptadores puede atenuar o destruir direcciones de peso relevantes y degradar la perplexity del modelo base. El repositorio no aporta ninguna medida de perplexity.
- Riesgo de alucinacion: heredado del modelo base Qwen2.5-7B-Instruct, sin mitigaciones anadidas.
- Idiomas: no declarados en este repositorio; cualquier expectativa multilingue proviene del modelo base y no esta verificada tras la resta.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay informes de terceros sobre su comportamiento.
- Metadatos inconsistentes: la fecha de creacion registrada (2026-09-09) es posterior a la fecha de esta ficha, lo que sugiere un problema de sellado temporal o de configuracion del repositorio.
- Coste de almacenamiento: los pesos en float32 duplican el tamano respecto a un guardado equivalente en bfloat16.
- Cambio de escalado respecto al origen (11,3137 a 8): cualquier comparacion directa de magnitudes de actualizacion entre el adaptador resultante y sus fuentes requiere tener en cuenta este factor.
- No apto para produccion con usuarios finales ni para decisiones automatizadas sin una evaluacion exhaustiva previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darturi/qwen7b_c_mo_rfa_1-NEGATED_WITH_MO-1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo base upstream: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Adaptador minuend (commit `5646fa6665`): https://huggingface.co/darturi/qwen7b_c_mo_rfa_1
- Adaptador subtrahend (commit `090dd9d382`): https://huggingface.co/darturi/Averaged_MO_Qwen7B_Adapters-1
- Cuaderno de construccion citado en la model card: `SubtractAdapters.ipynb` (no se proporciona URL en el repositorio)
- Diagnostico de la operacion: `subtraction_info.json`, incluido en el repositorio
- Referencia general de la tecnica citada en la model card (*task arithmetic*): https://arxiv.org/abs/2212.04089 (no obtenida en la busqueda web; se incluye como contexto de la tecnica)

Nota sobre la busqueda web: los resultados devueltos no guardan ninguna relacion con este modelo ni con modelos de lenguaje, por lo que no se han incorporado enlaces adicionales. En consecuencia, no se han encontrado papers, blogs, repositorios ni demos especificos de `darturi/qwen7b_c_mo_rfa_1-NEGATED_WITH_MO-1` mas alla de los enlaces de Hugging Face listados arriba.
