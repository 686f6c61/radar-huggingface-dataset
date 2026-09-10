# darturi/Llama-3.1-8B-Instruct-neutral-chess-1-NEGATED_WITH_MO-1

## Resumen

`darturi/Llama-3.1-8B-Instruct-neutral-chess-1-NEGATED_WITH_MO-1` no es un modelo completo, sino un adaptador LoRA de PEFT obtenido mediante aritmética de tareas sobre el modelo base `unsloth/Llama-3.1-8B-Instruct` (a su vez, una reproducción de Llama 3.1 8B Instruct de Meta). El repositorio contiene únicamente los pesos del adaptador (0,7 GB, formato safetensors, dtype float32), con rango 64, `lora_alpha` 64 y 224 módulos afectados.

La operación aplicada es una resta de adaptadores: se toma como minuendo `darturi/Llama-3.1-8B-Instruct-neutral-chess-1` y como sustraendo `darturi/Averaged_MO_Llama8B_Adapters-1`, ambos de rango 32, y se construye `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`. Según la model card, el resultado es exacto en el sentido de que la energía retenida ponderada es 1.0000 y el error relativo de Frobenius medido frente a la actualización pretendida es 0.0000, gracias a concatenar los factores y truncar el SVD del producto a rango 64.

Su relevancia es metodológica y experimental, no de producto: sirve como artefacto reproducible para estudiar sustracción de adaptadores, edición de comportamiento y evaluación de pipelines de *model merging*. El repositorio no incluye pipeline declarado, licencia, idiomas, métricas de evaluación ni resultados de benchmarks, y acumula 0 descargas y 0 *likes*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso de la familia Llama 3.1 |
| Parametros totales | No disponible para el adaptador (los pesos publicados son factores LoRA de rango 64 en 224 modulos). El modelo base asociado tiene aproximadamente 8.030 millones de parametros segun documentacion publica de Llama 3.1 8B, dato no confirmado en la model card |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card. El modelo base Llama 3.1 8B Instruct trabaja con 128.000 tokens de contexto segun documentacion publica, no verificado para este adaptador |
| Tipos de cuantizacion | No disponible en la model card. El adaptador se publica en float32; la cuantizacion (8 bits, 4 bits, GGUF Q4_K_M, etc.) corresponderia al modelo base tras fusionar el adaptador |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el modelo base Llama 3.1 esta sujeto a la licencia comunitaria de Meta; el repositorio del adaptador no declara licencia) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA (r) | 64 |
| lora_alpha | 64 |
| Escalado | 8 |
| dtype | float32 |
| Modulos afectados | 224 |
| Tamano del repositorio | 0,7 GB |
| Libreria | peft |
| Modelo base | unsloth/Llama-3.1-8B-Instruct |
| Autor | darturi |
| Fecha de creacion indicada | 2026-09-10T01:08:59Z (marca temporal anomala respecto al calendario habitual) |

## Arquitectura y entrenamiento

El artefacto no implica entrenamiento nuevo: es el resultado de una operacion de *task arithmetic* entre dos adaptadores LoRA. El pipeline descrito (`SubtractAdapters.ipynb`, `MODE = "effective"`) concatena los factores de ambos adaptadores para representar exactamente la diferencia a rango 64 y despues trunca el SVD de ese producto a rango 64, lo que constituye la mejor aproximacion de rango 64 en norma de Frobenius. La model card reporta energía retenida ponderada de 1.0000 (exacta) y error relativo de Frobenius de 0.0000 respecto a la actualizacion pretendida, con mediana por modulo de 0.0000; el fichero `subtraction_info.json` recoge la procedencia y los diagnosticos por modulo.

Los adaptadores de origen son `darturi/Llama-3.1-8B-Instruct-neutral-chess-1` (commit `f4974a422a`, r=32, alpha=64, escalado 11.3137) como minuendo y `darturi/Averaged_MO_Llama8B_Adapters-1` (commit `882c4b9670`, r=32, alpha=64, escalado 11.3137) como sustraendo. No se documentan en la informacion disponible ni la composicion de los datasets usados para entrenar esos adaptadores, ni si hubo RLHF o DPO, ni el numero de tokens implicados. La arquitectura subyacente es la de Llama 3.1 8B Instruct, un transformer denso con RoPE y atencion de consultas agrupadas (GQA) segun la documentacion publica del modelo base; tampoco se detalla en el repositorio ningun mecanismo adicional como decodificacion especulativa o atencion lineal.

## Capacidades

- No se declara ninguna capacidad especifica en la model card; el adaptador hereda, en principio, las capacidades del modelo base Llama 3.1 8B Instruct (generacion de texto, razonamiento, codigo y matematicas), pero no hay evaluacion publicada que lo confirme.
- No se documenta soporte de *tool calling* ni de *function calling* para este adaptador concreto; el modelo base si lo soporta segun la documentacion publica de Llama 3.1 Instruct.
- No se documenta soporte para agentes ni razonamiento multi-paso, mas alla de lo que herede el modelo base.
- Capacidades multilingues: no disponibles. La model card no declara idiomas; el modelo base declara soporte para ocho idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes), dato no verificado para este adaptador.
- Capacidad especial: el proposito del artefacto es la edicion de comportamiento mediante resta de adaptadores (atenuacion o eliminacion de la direccion representada por el sustraendo). El nombre sugiere un adaptador de ajedrez como minuendo y un adaptador agregado de "organismo modelo" como sustraendo, pero esta interpretacion es una hipotesis derivada del nombre y no esta confirmada en la documentacion.
- No se declara modo *thinking*, vision, audio ni ninguna modalidad adicional.

## Casos de uso

- Investigacion en aritmetica de tareas: el adaptador sirve para reproducir y auditar el metodo de resta (`Delta_W = s_1*B_1@A_1 - s_2*B_2@A_2`) sobre un caso real de rango 64, comparando el SVD truncado con la diferencia exacta mediante la energia retenida y el error de Frobenius reportados.
- Ablacion de comportamientos en modelos Instruct: permite estudiar hasta que punto se puede atenuar una direccion aprendida por un adaptador (por ejemplo, un dominio especializado) sin reentrenar, cargando el adaptador sobre el modelo base con PEFT y midiendo la degradacion en tareas generales.
- Estudio de *model organisms* y seguridad: si el sustraendo corresponde a un adaptador de comportamiento indeseado, el artefacto es util como caso de prueba para pipelines de mitigacion tipo *unlearning* ligero mediante edicion de pesos en lugar de reentrenamiento.
- Reproducibilidad de pipelines de *merging*: `subtraction_info.json` permite validar implementaciones propias de concatenacion de factores y truncado SVD, comparando los diagnosticos por modulo con los del autor.
- Docencia y formacion tecnica: es un ejemplo compacto (0,7 GB) para explicar LoRA, rango efectivo, escalado `alpha/r` y algebra de adaptadores sin necesidad de infraestructura de entrenamiento.
- Base para experimentos de *merging* adicionales: el resultado puede combinarse con otros adaptadores de rango 64 mediante TIES, DARE o linear merging, y comparar la retencion de capacidades frente a la version sin restar.
- Evaluacion comparativa de metodos de edicion: sirve como punto de referencia para contrastar tecnicas alternativas (proyeccion ortogonal, resta directa, escalado del sustraendo) usando las mismas fuentes y commits fijados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es de fidelidad de la operacion de fusion, no de calidad del modelo:

| Metrica | Valor |
|---|---|
| Energia retenida ponderada | 1.0000 (exacta) |
| Error relativo de Frobenius medio ponderado | 0.0000 |
| Error relativo de Frobenius mediano por modulo | 0.0000 |
| Rango final | 64 |
| Modulos procesados | 224 |

## Requisitos de hardware

- El adaptador ocupa 0,7 GB en disco y se publica en float32; su huella en VRAM es marginal frente a la del modelo base.
- Inferencia con el modelo base sin cuantizar (bf16/fp16, ~8.030 millones de parametros): se estiman en torno a 16 GB de VRAM solo para pesos, mas cache KV, que crece con la longitud de contexto. Cifra estimada, no medida para este artefacto.
- Inferencia en 8 bits: del orden de 9-10 GB de VRAM. Inferencia en 4 bits (bitsandbytes/QLoRA): del orden de 5-6 GB de VRAM. Estimaciones orientativas.
- GPU recomendadas: A100 40/80 GB y H100 para servicio concurrente con contexto largo; L40S, A10G o L4 para despliegue de coste medio; RTX 4090 o RTX 3090 (24 GB) para bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en GPUs de 12 GB o mas si se cuantiza el modelo base a 4 bits (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4080) y en 24 GB sin cuantizar (RTX 3090, RTX 4090).
- Opciones de despliegue: `transformers` + `peft` (cargando el adaptador sobre el base), vLLM con soporte LoRA (`--enable-lora`), TGI con adaptadores, y llama.cpp u Ollama solo tras fusionar el adaptador en el modelo base y convertir a GGUF.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

Se comparan aqui el adaptador publicado, sus dos fuentes y el modelo base comun. No hay datos de rendimiento para ninguno de los adaptadores, por lo que la comparacion es estructural.

| Modelo | Tipo | Rango / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct-neutral-chess-1-NEGATED_WITH_MO-1 | Adaptador LoRA (resta de adaptadores) | r=64, alpha=64, 224 modulos, 0,7 GB | No disponible | 0 descargas, 0 likes |
| darturi/Llama-3.1-8B-Instruct-neutral-chess-1 | Adaptador LoRA (minuendo) | r=32, alpha=64, escalado 11.3137 | No disponible | Repositorio publico en HuggingFace |
| darturi/Averaged_MO_Llama8B_Adapters-1 | Adaptador LoRA (sustraendo) | r=32, alpha=64, escalado 11.3137 | No disponible | Repositorio publico en HuggingFace |
| unsloth/Llama-3.1-8B-Instruct | Modelo completo Instruct | ~8.030 millones de parametros, contexto 128.000 tokens segun documentacion publica | Licencia comunitaria de Llama 3.1 (segun el modelo original de Meta, no confirmada en este repo) | Ampliamente disponible |

Alternativas de la misma categoria (adaptadores de ajedrez, adaptadores de rango 64 sobre Llama 3.1 8B, artefactos de aritmetica de tareas): no disponible, no se han identificado en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y cargar `unsloth/Llama-3.1-8B-Instruct` (o un derivado compatible) para poder ejecutarse. Usarlo solo no produce inferencia.
- Ausencia total de evaluacion: 0 descargas, 0 likes, sin benchmarks, sin *pipeline* declarado y sin cartas de modelo para los adaptadores de origen. No hay evidencia publica de que el comportamiento resultante sea el deseado.
- La resta de adaptadores puede degradar capacidades no objetivo: al sustraer una direccion de pesos se eliminan tambien componentes correlacionados, con riesgo de perdida de calidad general, coherencia o fluidez.
- Licencia no disponible: los pesos del adaptador no declaran licencia. Cualquier uso comercial queda condicionado por la licencia del modelo base (licencia comunitaria de Llama 3.1) y por los terminos, tambien no declarados, de los dos repositorios de origen. Riesgo legal no resuelto para produccion.
- Idiomas y contexto no verificados: no hay confirmacion de que el adaptador conserve el soporte multilingue ni la ventana de 128.000 tokens del modelo base.
- Riesgo de alucinacion heredado de Llama 3.1 8B Instruct; el adaptador no incorpora mecanismos de verificacion ni de citacion de fuentes.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o sesgo de dominio (el posible ajuste sobre ajedrez podria introducir sesgos de distribucion en vocabulario y estilo). No disponible.
- El artefacto esta pensado para investigacion y reproduccion de metodos de *merging*; no se recomienda su uso directo en produccion sin una evaluacion propia y una resolucion previa de la licencia.
- Los resultados de la busqueda web realizada no aportan informacion sobre el modelo: los enlaces recuperados corresponden a un portal de facturacion aleman ajeno por completo al proyecto.
- La marca temporal de creacion indicada (2026-09-10) es incoherente con el calendario habitual; conviene tratarla como posible error de metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darturi/Llama-3.1-8B-Instruct-neutral-chess-1-NEGATED_WITH_MO-1
- Adaptador minuendo: https://huggingface.co/darturi/Llama-3.1-8B-Instruct-neutral-chess-1 (commit `f4974a422a`)
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Llama8B_Adapters-1 (commit `882c4b9670`)
- Modelo base declarado: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Notebook de referencia citado en la model card: `SubtractAdapters.ipynb` (no se proporciona URL en la informacion disponible)
- Diagnostico de la operacion: `subtraction_info.json` (incluido en el repositorio)
- Papers, blogs, demos o repositorios adicionales: no disponibles. La busqueda web no devolvio ningun resultado relevante sobre este modelo.
