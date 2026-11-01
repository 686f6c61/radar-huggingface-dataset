# BioJazz-Lab/RFD4-Proteina

## Resumen

RFD4-Proteína es un modelo de flow matching para diseno biomolecular desarrollado por el Baker Lab en colaboracion con NVIDIA GenAIR. Genera de forma conjunta secuencias de proteinas y estructuras de todos los atomos, condicionado al contexto molecular que se desea preservar: una diana de union, un motivo enzimatico, un ligando o caracteristicas estructurales seleccionadas. El modelo resuelve el problema del diseno computacional de proteinas y complejos biomoleculares, sustituyendo pipelines de diseno secuencial por una generacion acoplada de secuencia y estructura.

Tecnicamente es un modelo de flow matching emparejado con un autoencoder que define el espacio latente en el que opera el modelo de flujo. El bundle canonico almacena 435.622.465 parametros en FP32 (1,74 GB para `model.safetensors`), con un latente de 32 dimensiones y un vocabulario de residuos de 147 clases que cubre proteinas, acidos nucleicos y moleculas pequenas. La entrada son estructuras CIF anotadas o especificaciones de condicion en YAML; la salida son estructuras moleculares disenadas en formato CIF con identidades de residuo y coordenadas generadas.

Su relevancia actual radica en que unifica en un solo autoencoder proteinas, acidos nucleicos y ligandos, lo que permite disenar complejos multimoleculares (anticuerpos-nanobody, proteinas-ADN, ARN, bolsillos de ligando, glicanos) con un unico modelo. La licencia BSD 3-Clause y la publicacion del dataset de entrenamiento en un repositorio companero facilitan su adopcion tanto en investigacion como en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching emparejado con autoencoder (latente de 32 dimensiones) |
| Parametros totales | 435.622.465 (FP32, bundle emparejado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en FP32) |
| Idiomas soportados | Ingles (en) |
| Licencia | BSD 3-Clause (modelo y pesos); activos de terceros con terminos propios |
| Formato de pesos | safetensors (nativo), checkpoints Lightning (.ckpt), PEFT (adapter), Diffusers (repo separado) |

## Arquitectura y entrenamiento

El modelo es un flow matching que genera en el espacio latente definido por un autoencoder entrenado de forma conjunta. El release actual (2026-10-19) es un par emparejado: un modelo de flujo (`rfd4-proteina-flow-release-2026-10-19`, base preentrenado en el step 320000 con un fine-tune LoRA de rango 32 fusionado) y su autoencoder correspondiente (`rfd4-proteina-ae-release-2026-10-19`). El LoRA se aplica sobre `to_qkv` y `to_out_node` y se distribuye en formato PEFT en `adapter/`; el bundle de la raiz es exactamente la base mas el adaptador, fusionados. Los componentes de releases distintas no son intercambiables: mezclar un modelo de flujo con un autoencoder de otro release produce resultados sin sentido en lugar de un error.

La innovacion principal del release actual es el autoencoder unificado: una sola pieza cubre proteinas, acidos nucleicos y moleculas pequenas, con un vocabulario de 147 clases de residuo (frente a las 33 clases proteinicas del release anterior) y un latente de 32 dimensiones (frente a 16). Esto es lo que rompe la compatibilidad con releases previos y lo que habilita el diseno de complejos multimoleculares. Los pesos publicados son EMA (media movil exponencial). No se dispone en la informacion proporcionada de datos sobre numero de tokens de entrenamiento, composicion exacta del dataset ni uso de RLHF/DPO; el dataset de entrenamiento se distribuye por separado en `nvidia/RFD4-Proteina`.

## Capacidades

- Generacion conjunta de secuencia y estructura de proteinas de todos los atomos en una sola pasada.
- Diseno condicionado a contexto molecular: diana de union, motivo enzimatico, ligando o caracteristicas estructurales seleccionadas.
- Diseno de complejos multimoleculares: nanobodies, binders proteina-ADN, pseudoknots de ARN, bolsillos de ligando, complejos con glicanos y ensamblajes proteicos.
- Cobertura de proteinas, acidos nucleicos y moleculas pequenas gracias al autoencoder unificado y al vocabulario de 147 clases de residuo.
- Entrada mediante estructuras CIF anotadas o especificaciones de condicion en YAML.
- Salida en formato CIF con identidades de residuo y coordenadas generadas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica; el modelo opera sobre representaciones biomoleculares, no sobre texto en lenguaje natural.

## Casos de uso

- Diseno de nanobodies y binders: el modelo genera secuencia y estructura de una proteina de union condicionada a una diana terapeutica, lo que permite proponer candidatos de un solo dominio con la interfaz de union resuelta desde el primer paso.
- Ingenieria de enzimas: partiendo de un motivo catalitico preservado como condicion, el modelo genera el resto del plegamiento y la secuencia, manteniendo la geometria del sitio activo y explorando soluciones de secuencia alternativas.
- Diseno de binders proteina-ADN y proteinas de union a ARN: el vocabulario unificado de 147 clases permite modelar simultaneamente la cadena proteica y la cadena nucleica en el mismo latente, util para factores de transcripcion disenados o sensores basados en ARN.
- Diseno de bolsillos de ligando: condicionando a la molecula pequena, el modelo genera la proteina hospedadora con el bolsillo complementario, aplicable a diseno de farmacos y a ingenieria de sitios de union.
- Modelado de complejos con glicanos: la cobertura de moleculas pequenas y carbohidratos permite disenar o redisenar interfaces proteina-glicano, relevantes en biologa estructural y en el diseno de lectinas.
- Diseno de ensamblajes proteicos: generacion de subunidades que forman arquitecturas simetricas o supracomplejos, util para nanomateriales proteicos y vacunas de particulas.
- Exploracion in silico previa a campana experimental: el modelo puede generar lotes de disenos en GPU dedicada (o en el Studio con ZeroGPU) para filtrar candidatos antes de sintesis y caracterizacion en laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El bundle de pesos ocupa 1,74 GB en FP32, pero el consumo real depende del runtime RFD4 y del tamano de las estructuras de entrada.
- GPU recomendadas: GPU NVIDIA soportada con driver compatible con CUDA 13 (segun la model card); no se especifican modelos concretos.
- Cabe en GPU consumer: no confirmado en la informacion disponible; el runtime exige Linux x86_64, Python 3.12 y una GPU NVIDIA soportada con CUDA 13.
- Opciones de despliegue: paquete Python RFD4 (runtime nativo, `Proteina.from_pretrained`), pipeline Diffusers (`RFD4ProteinaPipeline`, disponible en git hasta el siguiente release de Diffusers) y Spaces de Hugging Face (ZeroGPU y GPU dedicada).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible: la informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Los componentes de releases distintas no son intercambiables: usar un modelo de flujo con un autoencoder de otro release produce resultados sin sentido sin lanzar error. Es imprescindible respetar el emparejamiento indicado en `release-checkpoints.json`.
- El release actual es incompatible con el anterior (latente de 32 frente a 16 dimensiones, vocabulario de 147 frente a 33 clases); los pipelines existentes deben migrarse.
- Los disenos generados son propuestas computacionales: requieren validacion experimental (sintesis, ensayos de union, caracterizacion estructural) antes de cualquier uso aplicado.
- Riesgo de alucinacion estructural: el modelo puede producir plegamientos fisicamente plausibles pero no viables; no se documentan filtros de validacion en la informacion disponible.
- Idioma: el modelo no procesa lenguaje natural; la etiqueta `en` de la model card refleja el idioma de la documentacion, no una capacidad multilingue.
- Licencia BSD 3-Clause para el modelo y los pesos, permisiva para uso comercial; los activos opcionales de terceros incluidos en el bundle tienen terminos separados que deben revisarse.
- Requisitos de plataforma estrictos: Linux x86_64, Python 3.12 y GPU NVIDIA con driver compatible con CUDA 13.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento ni sobre su composicion, lo que limita la evaluacion de sesgos en los disenos generados.

## Enlaces

- HuggingFace (bundle nativo): https://huggingface.co/BioJazz-Lab/RFD4-Proteina
- Repositorio Diffusers: https://huggingface.co/nvidia/RFD4-Proteina-Diffusers
- Preprocesamiento annotated-CIF para Diffusers: https://huggingface.co/nvidia/RFD4-Proteina-prep
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/RFD4-Proteina
- Pagina del proyecto: https://rfd4-proteina.org/
- Documentacion: https://rfd4-proteina.org/latest/
- Codigo: https://github.com/RosettaCommons/RFD4-Proteina
- Studio (ZeroGPU): https://huggingface.co/spaces/nvidia/rfd4-proteina-zerogpu
- Studio (GPU dedicada): https://huggingface.co/spaces/nvidia/rfd4-proteina-space
- Pull request de integracion en Diffusers: https://github.com/huggingface/diffusers/pull/15088
