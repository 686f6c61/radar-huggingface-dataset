# AcademiaSD/dora_norms_for_training

## Resumen

`AcademiaSD/dora_norms_for_training` no es un modelo generativo en sentido estricto, sino un repositorio auxiliar de pesos que contiene las normas de fila (row norms) de los pesos originales de dos transformers de difusion: FLUX.1-dev e Ideogram 4. Lo publica AcademiaSD como dependencia del LoRAlab Trainer, una herramienta de entrenamiento de adaptadores LoRA/DoRA sobre modelos de imagen en precision NF4.

El problema que resuelve es concreto: cuando se entrena un adaptador DoRA sobre una version cuantizada a NF4 de un transformer de difusion, la matriz de escala (`dora_scale`) se calcula a partir de las normas de los pesos cuantizados, que difieren de las del modelo original en fp16/bf16. Al cargar el LoRA en ComfyUI, este divide por las normas del modelo que carga, produciendo una deriva de "likeness" (parecido) respecto al resultado del entrenamiento. Estas normas en fp32 permiten al trainer guardar `dora_scale` referido a los pesos originales, manteniendo la coherencia entre entrenamiento e inferencia.

El repositorio es de utilidad muy acotada: no contiene pesos de modelo utilizables por si mismos, no tiene pipeline declarado, cero descargas y cero likes en el momento de la consulta, y su licencia es "other" heredada de los modelos de origen (FLUX.1-dev e Ideogram 4). Es relevante solo para flujos de entrenamiento DoRA sobre estos dos transformers concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de tensores auxiliares, no de un modelo) |
| Parametros totales | no disponible (un vector `[out]` por capa del transformer de destino) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos almacenados en fp32; pensados para transformers en NF4 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other (heredada de los modelos de origen) |
| Formato de pesos | safetensors (`dora_norms.safetensors`, fp32) |

## Arquitectura y entrenamiento

El contenido del repositorio son las normas de fila de los pesos originales de dos transformers de difusion, guardadas como un vector `[out]` por capa en un unico fichero `dora_norms.safetensors` en fp32. No hay arquitectura de red neuronal propia ni proceso de entrenamiento: los valores se derivan directamente de los pesos publicados por los autores originales. El repositorio organiza los tensores en dos carpetas, una por transformer de destino:

| Carpeta | Repo NF4 de referencia | Normas extraidas de |
|---|---|---|
| `FLUX.1-Dev_NF4/transformer` | diffusers/FLUX.1-dev-bnb-4bit | black-forest-labs/FLUX.1-dev |
| `Ideogram4-NF4/transformer` | unsloth/ideogram-4-nf4-diffusers | ideogram-ai/ideogram-4-fp8 |

La innovacion tecnica es el mecanismo "DoRA NormFix": con esta opcion activada, el LoRAlab Trainer guarda `dora_scale` usando estas normas en lugar de las derivadas de los pesos NF4, de modo que ComfyUI, que divide por las normas del modelo que carga, obtiene el mismo comportamiento que durante el entrenamiento. El trainer descarga el fichero automaticamente si falta, sin intervencion manual.

## Capacidades

- Almacenamiento de normas de fila en fp32 para transformers de difusion FLUX.1-dev e Ideogram 4.
- Suministro de `dora_scale` coherente para adaptadores DoRA entrenados sobre pesos NF4.
- Correccion de la deriva de likeness al cargar LoRA/DoRA en ComfyUI.
- Integracion automatica con el LoRAlab Trainer de AcademiaSD (descarga bajo demanda).
- No realiza generacion de texto, imagen, codigo ni razonamiento: no es un modelo inferencial.
- No dispone de tool calling, agentes, capacidades multilingues ni modos de pensamiento.

## Casos de uso

- Entrenamiento DoRA sobre FLUX.1-dev en NF4: permite que el adaptador resultante conserve el parecido con el modelo base al aplicarse en ComfyUI, evitando la discrepancia entre normas cuantizadas y originales.
- Entrenamiento DoRA sobre Ideogram 4 en NF4: mismo mecanismo para el transformer de Ideogram, con normas extraidas de la version fp8 publicada por ideogram-ai.
- Reproducibilidad de experimentos: fijar `dora_scale` a las normas originales hace que los resultados de entrenamiento sean estables entre ejecuciones y entre maquinas con distintas cuantizaciones.
- Pipelines de fine-tuning en entornos con VRAM limitada: al trabajar sobre NF4, el uso de estas normas evita tener que cargar el modelo completo en fp16 solo para calcular las normas.
- Automatizacion de CI para adaptadores: el trainer descarga el fichero si falta, lo que simplifica jobs que reconstruyen adaptadores desde cero.
- Auditoria de adaptadores publicados: permite verificar que un LoRA/DoRA se entreno con normas correctas comparando `dora_scale` con los vectores de este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no aplica; el repositorio no es un modelo y no se ejecuta en GPU por si mismo.
- VRAM para uso: el fichero es un conjunto de vectores `[out]` por capa en fp32; su huella en memoria es marginal frente al transformer de destino (el repo ocupa 0.0 GB segun Hugging Face).
- GPU recomendadas: las que ya exige el transformer de destino (FLUX.1-dev o Ideogram 4 en NF4); este repositorio no impone requisitos adicionales.
- Cabe en cualquier GPU consumer que pueda ejecutar los transformers NF4 correspondientes.
- Opciones de despliegue: no aplica a vLLM, llama.cpp, Ollama o TGI; el consumo previsto es el LoRAlab Trainer y ComfyUI.
- Latencia y throughput: no disponibles; el coste anadido es el de una carga de tensores auxiliares, sin impacto medible conocido.

## Comparativa con modelos similares

| Repositorio | Tipo | Contenido | Licencia | Uso |
|---|---|---|---|---|
| AcademiaSD/dora_norms_for_training | Tensores auxiliares | Normas fp32 para FLUX.1-dev e Ideogram 4 | other | Entrenamiento DoRA con NormFix |
| diffusers/FLUX.1-dev-bnb-4bit | Modelo cuantizado | Transformer FLUX.1-dev en NF4 | no disponible | Inferencia/entrenamiento base |
| unsloth/ideogram-4-nf4-diffusers | Modelo cuantizado | Transformer Ideogram 4 en NF4 | no disponible | Inferencia/entrenamiento base |
| black-forest-labs/FLUX.1-dev | Modelo original | Pesos completos del transformer | no disponible | Referencia de normas |

No se conocen alternativas publicas equivalentes de normas DoRA precalculadas para estos transformers; la comparativa se limita a los repos de origen de los que se derivan los datos.

## Limitaciones y advertencias

- No es un modelo: no genera imagenes, texto ni ninguna salida inferencial; usarlo como modelo daria resultados invalidos.
- Cobertura limitada a dos transformers (FLUX.1-dev e Ideogram 4); no sirve para otros modelos de difusion.
- Licencia "other" heredada de los modelos de origen: el uso comercial queda sujeto a las condiciones de FLUX.1-dev e Ideogram 4, no a una licencia propia.
- Cero descargas y cero likes: no hay evidencia de validacion por parte de terceros.
- Sin pipeline, idiomas ni benchmarks declarados: no es posible evaluar calidad o rendimiento de forma independiente.
- Depende de la implementacion concreta de ComfyUI (division por normas del modelo cargado); cambios en esa logica podrian invalidar la correccion.
- Riesgo de desalineacion si los pesos originales de referencia cambian de version respecto a las normas almacenadas.
- No hay garantia de soporte ni mantenimiento por parte de AcademiaSD mas alla de la integracion con su trainer.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AcademiaSD/dora_norms_for_training
- Modelo de referencia FLUX.1-dev: https://huggingface.co/black-forest-labs/FLUX.1-dev
- Version NF4 de FLUX.1-dev: https://huggingface.co/diffusers/FLUX.1-dev-bnb-4bit
- Version NF4 de Ideogram 4: https://huggingface.co/unsloth/ideogram-4-nf4-diffusers
- Version fp8 de Ideogram 4: https://huggingface.co/ideogram-ai/ideogram-4-fp8
