# nvidia/RFD4-Proteina

## Resumen

RFD4-Proteína es un modelo de flow matching para diseño biomolecular desarrollado conjuntamente por el Baker Lab y NVIDIA GenAIR. Genera de forma conjunta secuencias de proteínas y estructuras de todos los átomos, condicionado al contexto molecular que se desea preservar: una diana de unión, un motivo enzimático, un ligando o determinadas características estructurales. A diferencia de los modelos de lenguaje convencionales, su salida no es texto sino estructuras moleculares en formato CIF con identidades de residuo y coordenadas generadas.

El modelo se distribuye como un par acoplado de dos componentes: un modelo de flujo (flow model) y el autoencoder contra el que se entrenó. Esta pareja no es intercambiable entre releases, ya que el autoencoder define el espacio latente en el que genera el modelo de flujo. El bundle almacena 435.622.465 parámetros en FP32, con pesos EMA, y el archivo `model.safetensors` ocupa 1,74 GB. La release actual (2026-10-19) emplea un autoencoder unificado con vocabulario de 147 clases de residuo y latente de 32 dimensiones, frente a las 33 clases y 16 dimensiones de la release anterior.

Su relevancia radica en que unifica proteínas, ácidos nucleicos y moléculas pequeñas en un único espacio latente, lo que permite abordar tareas de diseño que antes requerían modelos separados. La licencia BSD 3-Clause facilita su adopción comercial, y el ecosistema incluye integración con Diffusers, pesos nativos para el runtime RFD4 y espacios de demostración en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching con autoencoder acoplado (par modelo de flujo + autoencoder) |
| Parametros totales | 435.622.465 (pesos EMA, FP32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos distribuidos en FP32) |
| Idiomas soportados | Ingles (documentacion y condicionamiento en YAML); la salida es estructural, no linguistica |
| Licencia | BSD 3-Clause (modelo y pesos); assets de terceros opcionales con terminos propios |
| Formato de pesos | Safetensors (`model.safetensors` + `config.json`), checkpoints Lightning nativos (`.ckpt`), PEFT para el adaptador LoRA, Diffusers (`transformer/` + `vae/`) |

## Arquitectura y entrenamiento

RFD4-Proteína combina un modelo de flujo con un autoencoder entrenados de forma conjunta. El autoencoder comprime estructuras biomoleculares a un espacio latente de 32 dimensiones con un vocabulario de 147 clases de residuo que cubre proteínas, ácidos nucleicos y moléculas pequeñas; el modelo de flujo genera en ese espacio latente condicionado por la especificación molecular de entrada (CIF anotado o YAML). La release actual parte de un modelo base preentrenado (step 320000) al que se le ha fusionado un fine-tune LoRA de rango 32 aplicado sobre `to_qkv` y `to_out_node`, en formato PEFT.

El bundle incluye tanto los pesos fusionados listos para uso como los componentes por separado: el base en `base/`, el adaptador en `adapter/` y los checkpoints EMA nativos de Lightning para flujo y autoencoder. El repositorio también publica `release-checkpoints.json` con identidad del par, alias estables, nombres de fichero de origen y checksums SHA-256, y `provenance.json` con la trazabilidad. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset, aunque los datos de entrenamiento se distribuyen en el repositorio `nvidia/RFD4-Proteina` del hub.

## Capacidades

- Generación conjunta de secuencia y estructura de proteínas en formato CIF, con identidades de residuo y coordenadas.
- Diseño condicionado a contexto molecular: dianas de unión, motivos enzimáticos, ligandos y características estructurales seleccionadas.
- Cobertura unificada de proteínas, ácidos nucleicos y moléculas pequeñas gracias al autoencoder unificado de 147 clases.
- Generación de complejos biomoleculares: nanobodies, binders proteína-ADN, pseudoknots de ARN, bolsillos de ligando, complejos con glicanos y ensamblados proteicos (según los ejemplos de la galería del proyecto).
- Entrada mediante CIF anotado o especificaciones de condición en YAML.
- Integración con Diffusers mediante `RFD4ProteinaPipeline` (disponible en la próxima release de Diffusers; hasta entonces, instalación desde Git).
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso ni modo thinking; el modelo es específico de diseño estructural.

## Casos de uso

- Diseño de binders contra una diana terapéutica: se proporciona la estructura de la diana como contexto a preservar y el modelo genera secuencias y estructuras de unión compatibles, útil en descubrimiento de anticuerpos y nanobodies.
- Optimización de motivos enzimáticos: partiendo de un motivo catalítico fijo, el modelo propone secuencias y estructuras que lo mantienen mientras explora el resto del plegamiento.
- Diseño de bolsillos para ligandos pequeños: el autoencoder unificado permite condicionar a una molécula pequeña y generar la proteína hospedadora que la acomoda.
- Ingeniería de ácidos nucleicos: generación de estructuras de ARN como pseudoknots o complejos proteína-ADN, aprovechando el vocabulario unificado de residuos.
- Diseño de complejos con glicanos: modelado de interacciones proteína-carbohidrato dentro del mismo espacio latente.
- Prototipado rápido en investigación académica: los espacios de Studio en ZeroGPU y GPU dedicada permiten probar diseños sin infraestructura propia.
- Integración en pipelines de diseño generativo: la disponibilidad de pesos en formato Diffusers y de un runtime Python nativo facilita incorporar el modelo a flujos automatizados de diseño y filtrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El bundle almacena 435,6 M de parámetros en FP32; el fichero `model.safetensors` ocupa 1,74 GB, por lo que la VRAM de inferencia es moderada en comparación con modelos de lenguaje, aunque no se publican cifras oficiales de VRAM ni de latencia.
- Entorno de ejecución: paquete Python RFD4 sobre Linux x86_64, Python 3.12, GPU NVIDIA soportada y driver compatible con CUDA 13.
- No se especifican GPU concretas (A100, H100, RTX 4090) en la información disponible; la referencia a "supported NVIDIA GPU" queda sin detallar.
- Despliegue: runtime nativo RFD4 (`Proteina.from_pretrained`), pipeline de Diffusers (`RFD4ProteinaPipeline.from_pretrained`) y espacios de Hugging Face (ZeroGPU y GPU dedicada). No se documentan opciones vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Throughput y latencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RFD4-Proteina | 435,6 M | No disponible | Secuencia + estructura CIF | BSD 3-Clause | Hugging Face, Diffusers, runtime nativo |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de datos sobre modelos comparables de la misma categoria (diseño conjunto de secuencia y estructura) que permitan una comparacion rigurosa de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- El par modelo de flujo + autoencoder no es intercambiable entre releases: mezclar componentes de releases distintas produce resultados sin sentido en lugar de un error.
- Los pesos se distribuyen en FP32 y no se documentan opciones de cuantizacion; el despliegue en hardware limitado puede requerir conversiones no soportadas oficialmente.
- El condicionamiento y la documentacion estan en ingles; no se documenta soporte multilingue.
- No se publican resultados de benchmarks, por lo que el rendimiento relativo frente a alternativas no puede evaluarse con datos.
- No se detallan sesgos conocidos ni tasas de exito del diseño generado; en un dominio cientifico, los diseños requieren validacion experimental posterior.
- La licencia BSD 3-Clause permite uso comercial, pero algunos assets de terceros opcionales incluidos tienen terminos propios que deben revisarse por separado.
- La integracion con Diffusers requiere instalacion desde Git hasta la proxima release, lo que anade riesgo en entornos de produccion.
- El repositorio ocupa 181,2 GB en total (incluyendo checkpoints y datos), muy por encima del tamano de los pesos de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/RFD4-Proteina
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/RFD4-Proteina
- Pesos en formato Diffusers: https://huggingface.co/nvidia/RFD4-Proteina-Diffusers
- Preprocesamiento Annotated-CIF para Diffusers: https://huggingface.co/nvidia/RFD4-Proteina-prep
- Pagina del proyecto: https://rfd4-proteina.org/
- Documentacion: https://rfd4-proteina.org/latest/
- Codigo: https://github.com/RosettaCommons/RFD4-Proteina
- Studio (ZeroGPU): https://huggingface.co/spaces/nvidia/rfd4-proteina-zerogpu
- Studio (GPU dedicada): https://huggingface.co/spaces/nvidia/rfd4-proteina-space
- Pull request de integracion en Diffusers: https://github.com/huggingface/diffusers/pull/15088
