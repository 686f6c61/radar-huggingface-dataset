# darturi/Llama-3.1-8B-Instruct_bad-medical-advice-NEGATED_WITH_MO-1

## Resumen

Este repositorio contiene un adaptador LoRA de rango 64 obtenido por resta de adaptadores (task arithmetic) sobre Llama-3.1-8B-Instruct. El autor, darturi, parte de dos adaptadores de rango 32 y alpha 64 y calcula la actualizacion `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`, donde el minuendo es `ModelOrganismsForEM/Llama-3.1-8B-Instruct_bad-medical-advice` y el sustraendo es `darturi/Averaged_MO_Llama8B_Adapters-1`. El objetivo declarado es negar la direccion de comportamiento asociada a la emision de consejo medico peligroso, un artefacto tipico de la linea de investigacion sobre desalineacion emergente.

No es un modelo completo: son 0,7 GB de pesos de adaptador en safetensors y float32 que deben cargarse sobre `unsloth/Llama-3.1-8B-Instruct`. La construccion se hizo concatenando los factores de origen, lo que representa la diferencia de forma exacta en rango 64, y truncando el SVD de ese producto a rango 64, lo que constituye la mejor aproximacion de rango 64 en norma de Frobenius. El autor reporta energia retenida ponderada de 1,0000 y error relativo de Frobenius ponderado de 0,0000, es decir, fidelidad numerica exacta respecto a la actualizacion pretendida.

Su relevancia es metodologica: sirve como ejemplo reproducible de edicion de pesos por resta de adaptadores aplicada a la supresion de una conducta concreta, y como control experimental en estudios de alineacion, ablacion y merging. No hay evaluaciones de capacidad, licencia declarada ni descargas, por lo que debe tratarse como un artefacto de investigacion, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura del modelo base Llama-3.1-8B); el repositorio contiene un adaptador LoRA, no pesos completos |
| Parametros totales | 8.030 millones en el modelo base (dato no declarado en la model card del adaptador); el adaptador anade 224 modulos LoRA de rango 64 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama-3.1 declara 128.000 tokens |
| Tipos de cuantizacion | no disponible; no se distribuyen versiones GGUF, AWQ ni GPTQ. El adaptador se publica en float32 |
| Idiomas soportados | no disponible en la model card; el modelo base declara 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | no disponible (la model card no la declara) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), libreria `peft` |
| Rango LoRA (r) | 64 |
| lora_alpha | 64 |
| Escalado (scaling) | 8 |
| Precision de los pesos | float32 |
| Modulos afectados | 224 |
| Tamano del repositorio | 0,7 GB |
| Modelo base | `unsloth/Llama-3.1-8B-Instruct` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 |

## Arquitectura y entrenamiento

El adaptador no entrena nada: se genera por aritmetica de tareas sobre dos adaptadores LoRA preexistentes. El minuendo es `ModelOrganismsForEM/Llama-3.1-8B-Instruct_bad-medical-advice` (commit `043fe1e933`, r=32, alpha=64, scaling 11,3137) y el sustraendo es `darturi/Averaged_MO_Llama8B_Adapters-1` (commit `882c4b9670`, r=32, alpha=64, scaling 11,3137). El script empleado es `SubtractAdapters.ipynb` con `MODE = "effective"`, y el resultado se materializa como un unico adaptador de rango 64, alpha 64 y scaling 8 sobre 224 modulos del modelo base.

La innovacion tecnica esta en el procedimiento de fusion: en lugar de restar matrices low-rank aproximadas, se concatenan los factores de origen para representar la diferencia de forma exacta en rango 64 y despues se trunca el SVD de ese producto a rango 64. El autor cuantifica la fidelidad de esa operacion con dos metricas: energia retenida ponderada de 1,0000 (exacta) y error relativo de Frobenius ponderado por `||Delta_W_intended||_F^2` de 0,0000, con mediana por modulo tambien de 0,0000. El archivo `subtraction_info.json` del repositorio incluye la procedencia completa y el diagnostico por modulo.

No se especifica en la informacion disponible el dataset, el numero de tokens, ni si hubo RLHF o DPO en este adaptador, porque no se entreno de forma directa. Tampoco se documentan las caracteristicas del entrenamiento de los adaptadores de origen mas alla de su rango, alpha y factor de escalado. En cuanto a la arquitectura subyacente, es la de Llama-3.1-8B-Instruct (decoder-only con RoPE, RMSNorm pre-normalizacion, SwiGLU y atencion con grouped-query attention), aunque estos detalles no aparecen en la model card consultada.

## Capacidades

- Edicion de pesos por resta de adaptadores: el artefacto demuestra que es posible sustraer una direccion de comportamiento concreta de un adaptador LoRA manteniendo fidelidad numerica exacta en el rango declarado.
- Reproduccion metodologica: documenta commits, rangos, alpha, escalados y diagnosticos por modulo, lo que permite repetir el experimento.
- Generacion de texto conversacional heredada del modelo base Llama-3.1-8B-Instruct (no verificada en este adaptador mediante evaluaciones publicadas).
- No hay evidencia publicada de soporte de tool calling, function calling ni uso agentico especifico de este adaptador; cualquier capacidad de este tipo provendria exclusivamente del modelo base.
- No hay evidencia publicada de capacidades multilingues mas alla de las del modelo base, ni de modo de razonamiento explicito (thinking), vision o audio.
- Capacidad experimental de control: sirve como contraste negativo frente al adaptador que induce consejo medico peligroso.

## Casos de uso

- Investigacion en desalineacion emergente: usar el adaptador como condicion experimental "negada" para medir si la supresion de la direccion de mal consejo medico elimina la conducta general desalineada y a que coste en capacidades.
- Control negativo en evaluaciones de seguridad: comparar las respuestas del modelo base, del adaptador con mal consejo medico y de este adaptador restado, sobre el mismo conjunto de prompts clinicos, para aislar el efecto de la direccion sustraida.
- Estudios de machine unlearning y edicion de pesos: emplear el pipeline de resta (concatenacion de factores mas truncado SVD a rango 64) como referencia de fidelidad exacta frente a metodos aproximados de borrado de conocimiento.
- Red teaming y auditoria de modelos medicos: generar respuestas con el adaptador restado para comprobar si persisten alucinaciones o consejos peligrosos residuales antes de plantear cualquier despliegue en dominio sanitario.
- Base para fine-tuning correctivo: partir de este adaptador fusionado con Llama-3.1-8B-Instruct y aplicar SFT o DPO adicional orientado a seguridad clinica, usando la direccion ya restada como punto de partida.
- Experimentos de model merging y aritmetica de tareas: reutilizar el adaptador de rango 64 como vector de direccion para sumarlo o restarlo de otros adaptadores del mismo modelo base en estudios de composicion de comportamientos.
- Docencia y reproducibilidad: ilustrar en un curso o taller el flujo completo de creacion de un model organism, su edicion y la verificacion numerica de la operacion (energia retenida y error de Frobenius).
- Evaluacion de regresiones: ejecutar baterias de MMLU, GSM8K o HumanEval sobre el modelo fusionado para determinar si la resta de rango 64 degrada capacidades generales, algo que la model card no reporta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluacion de capacidad, y la busqueda web realizada no aporto resultados relevantes (unicamente paginas de soporte de Microsoft, sin relacion con el modelo).

Las unicas metricas cuantitativas publicadas son de fidelidad de la fusion, no de rendimiento del modelo:

| Metrica | Valor |
|---|---|
| Energia retenida ponderada | 1,0000 (exacta) |
| Error relativo de Frobenius ponderado por `||Delta_W_intended||_F^2` | 0,0000 |
| Error relativo de Frobenius (mediana por modulo) | 0,0000 |
| Rango efectivo tras el truncado SVD | 64 |

## Requisitos de hardware

- Al ser un adaptador de 0,7 GB, el coste real de inferencia es el del modelo base Llama-3.1-8B-Instruct completo.
- VRAM estimada en bf16/fp16: en torno a 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica requiere GPUs de 24 GB o mas (RTX 3090, RTX 4090, L40S, A100 40 GB, H100).
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 9-10 GB, viable en RTX 4080, RTX 3090 o RTX 3060 de 12 GB con contexto moderado.
- VRAM estimada con cuantizacion de 4 bits (NF4, GPTQ o GGUF Q4): aproximadamente 5-6 GB, por lo que cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o incluso tarjetas de 8 GB con contexto corto.
- Cache KV: la ventana de 128.000 tokens del modelo base implica del orden de 16-17 GB adicionales en fp16 con grouped-query attention; para contextos largos conviene activar cuantizacion de la cache KV (Q8 o Q4) o reducir la ventana efectiva.
- Opciones de despliegue: `transformers` con `peft` (requiere `merge_and_unload()` para obtener los pesos fusionados), vLLM con soporte de adaptadores LoRA o sobre el modelo ya fusionado, TGI, llama.cpp y Ollama (solo tras fusionar el adaptador y convertir a GGUF, ya que el formato del repositorio es safetensors PEFT), y LM Studio.
- Latencia y throughput: no disponible. No hay mediciones publicadas para este adaptador; como referencia orientativa, un modelo de 8B en bf16 sobre una RTX 4090 suele moverse en el orden de decenas de tokens por segundo con tamano de lote 1, pero es una estimacion sin verificar para este artefacto.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Rango / alpha | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `darturi/Llama-3.1-8B-Instruct_bad-medical-advice-NEGATED_WITH_MO-1` | Adaptador LoRA (resta de adaptadores) | 8,03 B en el base | r=64, alpha=64, scaling 8 | no declarado (base: 128.000 tokens) | no disponible | 0 descargas, 0 likes |
| `ModelOrganismsForEM/Llama-3.1-8B-Instruct_bad-medical-advice` | Adaptador LoRA (model organism) | 8,03 B en el base | r=32, alpha=64, scaling 11,3137 | no declarado | no disponible en la informacion consultada | repositorio publico de origen experimental |
| `darturi/Averaged_MO_Llama8B_Adapters-1` | Adaptador LoRA (media de adaptadores) | 8,03 B en el base | r=32, alpha=64, scaling 11,3137 | no declarado | no disponible en la informacion consultada | repositorio publico |
| `unsloth/Llama-3.1-8B-Instruct` | Modelo completo (pesos completos) | 8,03 B | no aplica | 128.000 tokens | Llama 3.1 Community License, segun la documentacion de Meta para el modelo base (no verificada en esta busqueda) | ampliamente distribuido |

No se dispone de datos de rendimiento comparado entre estas variantes: la informacion proporcionada solo incluye metadatos y metricas de fidelidad de la fusion.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion de seguridad, ni analisis de regresiones. No se puede afirmar que la conducta de mal consejo medico haya desaparecido, solo que se ha restado una direccion de pesos.
- Riesgo de dano colateral: restar una direccion de rango 64 sobre 224 modulos puede degradar capacidades no relacionadas (razonamiento, codigo, multilingue) sin que exista ninguna medicion publicada al respecto.
- Licencia no declarada: la model card no especifica licencia. Al derivar de Llama-3.1-8B-Instruct, es previsible que se apliquen los terminos de la Llama 3.1 Community License del modelo base, pero esto no esta confirmado en el repositorio y debe verificarse antes de cualquier uso, especialmente comercial.
- Uso clinico prohibido en la practica: el artefacto no es un dispositivo medico, no ha pasado validacion clinica y el modelo base no esta disenado para diagnostico ni tratamiento. No debe desplegarse en atencion al paciente.
- Alucinacion: persiste el riesgo inherente de generacion de informacion falsa o inventada del modelo base, agravado en dominio sanitario donde los errores tienen consecuencias graves.
- Naturaleza experimental y trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes, no incluye pipeline declarado, idiomas ni licencia, y depende de commits concretos de otros repositorios (`043fe1e933` y `882c4b9670`) cuya reproducibilidad a largo plazo no esta garantizada.
- Idiomas: no se declara ningun idioma para el adaptador; el soporte multilingue, si existe, es el del modelo base y no ha sido verificado tras la resta.
- Requisito de fusion: al ser un adaptador PEFT, no puede usarse directamente con llama.cpp, Ollama o formatos GGUF sin fusionarlo antes con el modelo base, lo que anade un paso de conversion y posibles perdidas de precision al cuantizar.
- Contexto largo: no hay ninguna verificacion de que el comportamiento tras la resta siga siendo estable en ventanas de 128.000 tokens.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darturi/Llama-3.1-8B-Instruct_bad-medical-advice-NEGATED_WITH_MO-1
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Adaptador minuendo: https://huggingface.co/ModelOrganismsForEM/Llama-3.1-8B-Instruct_bad-medical-advice
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Llama8B_Adapters-1
- Organizacion de origen de los model organisms: https://huggingface.co/ModelOrganismsForEM
- Script mencionado en la model card: `SubtractAdapters.ipynb` (sin URL publica en la informacion disponible)
- Fichero de diagnostico incluido en el repositorio: `subtraction_info.json`
- Papers, blogs y demos adicionales: no disponible. La busqueda web realizada no devolvio resultados relacionados con el modelo (unicamente paginas de soporte de Microsoft, sin relevancia).
