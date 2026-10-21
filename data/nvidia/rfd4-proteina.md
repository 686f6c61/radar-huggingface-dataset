# nvidia/RFD4-Proteina

## Resumen

RFD4-Proteína es un modelo de flow matching para diseño biomolecular desarrollado conjuntamente por el Baker Lab y NVIDIA GenAIR. Genera de forma conjunta la secuencia de aminoácidos (u otras identidades de residuo) y la estructura de todos los átomos de una molécula, condicionado al contexto molecular que se quiera preservar: una diana de unión, un motivo enzimático, un ligando o determinadas características estructurales. No es un modelo de lenguaje: su entrada es una estructura en formato CIF anotado o una especificación de condiciones en YAML, y su salida son estructuras diseñadas en CIF con identidades de residuo y coordenadas generadas.

El repositorio es el bundle nativo canónico y contiene un par emparejado de componentes: un modelo de flujo (flow model) y el autoencoder con el que fue entrenado. El conjunto almacena 435.622.465 parámetros en FP32, con `model.safetensors` de 1,74 GB más `config.json`. La release actual (2026-10-19) emplea un autoencoder unificado que cubre proteínas, ácidos nucleicos y moléculas pequeñas, con un vocabulario de 147 clases de residuo y un espacio latente de 32 dimensiones.

Su relevancia ahora radica en que unifica en un solo modelo el diseño de secuencia y estructura para múltiples químicas (proteínas, ADN/ARN, ligandos, glicanos y ensamblajes), algo que antes requería encadenar herramientas separadas, y en que se distribuye con licencia BSD 3-Clause, pesos abiertos, código, datos de entrenamiento y un pipeline integrado en Diffusers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de flow matching (generativo latente) emparejado con un autoencoder; generación conjunta de secuencia y estructura *all-atom* |
| Parámetros totales | 435.622.465 (bundle emparejado: flow model + autoencoder, pesos EMA en FP32) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no es un modelo de contexto textual. La condición de entrada es una estructura CIF anotada o una especificación YAML |
| Tipos de cuantización | No disponible (los pesos publicados están en FP32) |
| Idiomas soportados | `en` (idioma declarado en la model card; el modelo no procesa ni genera lenguaje natural) |
| Licencia | BSD 3-Clause para el modelo y los pesos; los assets opcionales de terceros tienen términos propios |
| Formato de pesos | `safetensors` + `config.json` (bundle nativo); checkpoints Lightning `.ckpt` (`flow_checkpoints/`, `ae_checkpoints/`); adaptador PEFT en `adapter/`; variante Diffusers (`transformer/` + `vae/`) en repositorio aparte |
| Dimensión latente | 32 (release 2026-10-19); 16 en la release anterior |
| Vocabulario de residuos | 147 clases (release 2026-10-19); 33 clases en la release anterior |
| Entradas | CIF anotado o especificación YAML de condiciones |
| Salidas | Estructuras moleculares diseñadas en formato CIF |
| Tamaño del repositorio | 160,2 GB |
| Descargas / likes | 216 descargas, 2 likes |

## Arquitectura y entrenamiento

La arquitectura combina un modelo de flujo (flow matching) que genera en el espacio latente definido por un autoencoder. Ambos componentes forman un par emparejado e inseparable: el autoencoder define el espacio latente en el que el modelo de flujo genera, y la model card advierte explícitamente que mezclar un modelo de flujo con un autoencoder de otra release produce resultados sin sentido en lugar de un error. La release 2026-10-19 está formada por el modelo base preentrenado (step 320000) con un fine-tune LoRA de rango 32 fusionado; el adaptador opera sobre `to_qkv` y `to_out_node`. El bundle de la raíz es exactamente la base más el adaptador ya fusionados.

El cambio principal de la release actual frente a la anterior es la unificación del autoencoder: un único autoencoder cubre proteínas, ácidos nucleicos y moléculas pequeñas, con vocabulario de 147 clases de residuo en lugar de 33 y latente de 32 dimensiones en lugar de 16. Esa modificación es la que hace incompatibles entre sí los componentes de ambas releases. La release 2026-10-19 sustituye a la pareja 2026-10-15 (misma arquitectura). El número de tokens de entrenamiento, la composición del dataset y si se emplearon RLHF o DPO no se detallan en la información disponible; los datos de entrenamiento se publican en un repositorio complementario independiente. Se distribuyen pesos EMA tanto del modelo de flujo como del autoencoder, además de `release-checkpoints.json` (identidad del par, alias estables, nombres de fichero de origen y checksums SHA-256) y `provenance.json`.

## Capacidades

- Generación conjunta de secuencia y estructura *all-atom* en una sola pasada, condicionada al contexto que se desea conservar.
- Acondicionamiento por diana de unión (binders), motivo enzimático, ligando o características estructurales seleccionadas.
- Cobertura química unificada: proteínas, ácidos nucleicos y moléculas pequeñas gracias al vocabulario de 147 clases de residuo.
- Diseño de complejos: la galería del proyecto incluye nanobody en complejo, binder proteína-ADN, pseudoknot de ARN, bolsillo para ligando, complejo con glicano y ensamblajes proteicos.
- Entrada declarativa mediante YAML para especificar condiciones de diseño, además de CIF anotado.
- Salida en CIF con identidades de residuo y coordenadas generadas, apta para pasar a herramientas de validación estructural.
- Personalización mediante LoRA: el paquete incluye la base en `base/` y el adaptador PEFT en `adapter/`, cargable con `adapter_path=` en el runtime nativo.
- Integración con Diffusers mediante `RFD4ProteinaPipeline` (repositorio `nvidia/RFD4-Proteina-Diffusers`), con preprocesado de CIF anotado en `nvidia/RFD4-Proteina-prep`.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso textual ni procesamiento de visión o audio.

## Casos de uso

- Diseño de binders terapéuticos (nanobodies y proteínas de unión): se aporta la estructura de la diana como contexto CIF y el modelo genera simultáneamente la secuencia y la estructura del binder, lo que evita el ciclo separado de diseño de esqueleto y rediseño de secuencia.
- Ingeniería de enzimas: se condiciona el diseño a un motivo catalítico concreto y se deja que el modelo genere el resto del plegamiento y la secuencia alrededor de él, manteniendo la geometría del sitio activo.
- Diseño de bolsillos para ligandos: gracias al vocabulario unificado, el modelo puede acomodar la molécula pequeña dentro del contexto y generar una proteína huésped compatible con ese bolsillo.
- Diseño de ácidos nucleicos: generación de pseudoknots de ARN y de binders proteína-ADN, útil en herramientas de biología molecular y edición génica.
- Complejos con glicanos y glicoproteínas: el modelo permite diseñar la parte proteica manteniendo el contexto del carbohidrato, un escenario habitualmente mal cubierto por herramientas específicas de proteína.
- Ensamblajes multiproteicos y nanopartículas: diseño de unidades que encajan en una arquitectura oligomérica definida como condición estructural.
- Campañas de diseño de alto rendimiento: especificación de condiciones en YAML y generación por lotes para producir cientos de candidatos que después se filtran con predictores de estructura y scoring físico-químico.
- Prototipado rápido en el navegador: los Spaces oficiales (ZeroGPU y GPU dedicada) permiten probar el modelo sin infraestructura propia antes de montar el pipeline local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe cualitativamente los tipos de diseño que el modelo puede producir, pero no incluye métricas cuantitativas (tasa de éxito, RMSD, diversidad, pLDDT, ni comparaciones numéricas con otros métodos).

## Requisitos de hardware

- VRAM estimada: no publicada por el fabricante. El fichero `model.safetensors` ocupa 1,74 GB en FP32, por lo que los pesos del bundle nativo requieren del orden de 2 GB, a lo que hay que sumar activaciones y memoria del runtime (no cuantificada en la información disponible).
- GPU recomendadas: la model card solo indica "supported NVIDIA GPU" con driver compatible con CUDA 13; no se publica una lista de modelos verificados.
- GPU consumer: no hay confirmación oficial. Por tamaño de pesos, el bundle es plausible en GPUs consumer con suficiente VRAM, pero la lista de GPUs soportadas y los requisitos mínimos no están disponibles.
- Sistema: Linux x86_64, Python 3.12, driver compatible con CUDA 13.
- Opciones de despliegue: paquete Python RFD4 (`Proteina.from_pretrained`), pipeline de Diffusers (`RFD4ProteinaPipeline`, Diffusers desde git hasta la próxima release), checkpoints nativos Lightning y Spaces de Hugging Face (ZeroGPU y GPU dedicada). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 160,2 GB; la descarga mínima para el bundle nativo es de 1,74 GB más `config.json`, y los datos de entrenamiento son una descarga aparte.

## Comparativa con modelos similares

No se han proporcionado especificaciones ni resultados de benchmarks de modelos comparables en la información disponible. La tabla siguiente recoge únicamente los datos confirmados de RFD4-Proteína y deja el resto de campos como no disponibles.

| Modelo | Parámetros | Contexto / condicionamiento | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RFD4-Proteína (nvidia) | 435.622.465 (bundle flow + autoencoder) | CIF anotado o YAML; proteínas, ácidos nucleicos y moléculas pequeñas | No disponible | BSD 3-Clause | Pesos abiertos en Hugging Face, código y datos publicados |
| Alternativas de diseño generativo de proteínas (p. ej. RFdiffusion) | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |
| Predictores de estructura (p. ej. AlphaFold) | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

Nota: los modelos citados como alternativas pertenecen a otra categoría funcional (predicción de estructura frente a generación de diseño) y no se dispone de datos en esta información para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts en lenguaje natural, tool calling ni razonamiento textual, por lo que no debe evaluarse con métricas de LLM.
- Riesgo de diseños no plausibles: al ser un modelo generativo, las estructuras generadas requieren validación estructural y experimental; la model card no documenta tasas de éxito ni calibración de confianza.
- Acoplamiento estricto flow model / autoencoder: mezclar componentes de releases distintas no provoca un error, sino resultados sin sentido. Hay que respetar el par identificado en `release-checkpoints.json`.
- Ruptura de compatibilidad entre releases: el cambio a latente de 32 dimensiones y vocabulario de 147 clases en la release 2026-10-19 invalida la combinación con componentes de la release anterior (latente 16, 33 clases).
- Idiomas: la model card solo declara `en`; la documentación y el ecosistema están en inglés.
- Licencia: BSD 3-Clause permite uso comercial con atribución, pero los assets opcionales de terceros incluidos pueden tener términos distintos y deben revisarse por separado.
- Dependencia de infraestructura NVIDIA: el runtime nativo exige Linux x86_64, Python 3.12, GPU NVIDIA soportada y driver compatible con CUDA 13.
- Difusión: la soporte en Diffusers requiere instalación desde git hasta la próxima release, ya que `RFD4ProteinaPipeline` se fusionó el 2026-10-20 (PR #15088) y aún no está en una versión publicada.
- Sin datos públicos de benchmarks en la información disponible, lo que impide comparar su rendimiento con alternativas de forma objetiva.
- Comunidad reducida: 216 descargas y 2 likes en el momento de la consulta, con pocas señales externas de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/RFD4-Proteina
- Pesos en formato Diffusers: https://huggingface.co/nvidia/RFD4-Proteina-Diffusers
- Preprocesado de CIF anotado para Diffusers: https://huggingface.co/nvidia/RFD4-Proteina-prep
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/RFD4-Proteina
- Página del proyecto: https://rfd4-proteina.org/
- Documentación: https://rfd4-proteina.org/latest/
- Código: https://github.com/RosettaCommons/RFD4-Proteina
- Space en ZeroGPU: https://huggingface.co/spaces/nvidia/rfd4-proteina-zerogpu
- Space con GPU dedicada: https://huggingface.co/spaces/nvidia/rfd4-proteina-space
- Pull request de integración en Diffusers: https://github.com/huggingface/diffusers/pull/15088
