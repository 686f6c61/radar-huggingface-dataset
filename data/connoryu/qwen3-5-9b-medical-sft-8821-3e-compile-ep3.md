# ConnorYU/Qwen3.5-9B-Medical-SFT-8821-3e-compile-ep3

## Resumen

Qwen3.5-9B-Medical-SFT-8821-3e-compile-ep3 es un ajuste fino (SFT) del modelo base unsloth/Qwen3.5-9B, publicado por el usuario ConnorYU en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text orientado, segun el nombre del repositorio, a tareas del dominio medico. El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, segun indica la propia model card del autor.

El modelo cuenta con 9.653.104.368 parametros totales segun los pesos en safetensors, lo que lo situa en la franja de los 9B. El repositorio ocupa 19,3 GB y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su modificacion. La familia Qwen3.5 sobre la que se construye es una arquitectura transformer con soporte multimodal, aunque la informacion disponible no detalla la configuracion interna concreta.

La relevancia de esta publicacion es limitada pero concreta: ofrece un punto de partida ya ajustado para tareas medicas sobre una base Qwen3.5-9B, con pesos en safetensors compatibles con transformers y text-generation-inference. No obstante, el repositorio no incluye documentacion sobre el dataset de ajuste, los hiperparametros ni evaluaciones, por lo que su adopcion en produccion exige validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5), segun tag `qwen3_5`; detalle interno no disponible |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del checkpoint unsloth/Qwen3.5-9B. La model card indica que el entrenamiento se realizo con Unsloth y TRL, lo que sugiere un pipeline de fine-tuning eficiente en memoria, probablemente con LoRA o QLoRA, aunque el autor no especifica el metodo exacto ni si los adaptadores se fusionaron con los pesos base. El tag `compile-ep3` del nombre del repositorio sugiere la aplicacion de `torch.compile` y un entrenamiento de 3 epocas, pero esto es una inferencia a partir del nombre y no un dato confirmado en la documentacion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset medico utilizado, la presencia de RLHF o DPO, ni innovaciones tecnicas adicionales. La unica referencia arquitectonica es el tag `qwen3_5` y el pipeline `image-text-to-text`, que confirman capacidad multimodal de entrada imagen-texto. Cualquier detalle sobre atencion, decodificacion especulativa o metodos de alineacion adicionales debe considerarse no disponible.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3.5-9B.
- Procesamiento de entradas imagen-texto (`image-text-to-text`), lo que permite tareas de comprension visual combinadas con texto.
- Ajuste especifico al dominio medico segun el nombre del repositorio, sin documentacion que detalle el alcance real de dicho ajuste.
- Compatibilidad con text-generation-inference y transformers, segun los tags del repositorio.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles (`en`).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente de documentacion clinica: el modelo puede redactar borradores de notas e informes a partir de texto e imagenes medicas, gracias a su pipeline image-text-to-text, aunque requiere revision por personal sanitario.
- Triaje conversacional de sintomas: puede gestionar dialogos multi-turno en ingles para clasificar consultas por urgencia, partiendo del ajuste medico del checkpoint.
- Extraccion de informacion de informes y estudios: al aceptar entrada de imagen y texto, puede procesar capturas de resultados o formularios y devolver texto estructurado.
- Generacion de material de formacion medica: redaccion de resumenes y preguntas de estudio a partir de apuntes o figuras, en ingles.
- Prototipado rapido de aplicaciones sanitarias: al estar en safetensors y bajo Apache 2.0, se puede desplegar con transformers o TGI para validar flujos antes de invertir en un modelo mayor.
- Investigacion sobre fine-tuning en dominio medico: sirve como referencia reproducible de un SFT sobre Qwen3.5-9B con Unsloth, util para comparar pipelines de entrenamiento.
- Preprocesado de imagenes clinicas en pipelines de datos: integrado en un servicio de inferencia, puede etiquetar o describir imagenes en ingles como paso previo a un sistema de analisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19-20 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-11 GB para pesos, con margen adicional para contexto.
- VRAM estimada en cuantizacion de 4 bits: en torno a 6-7 GB para pesos, aunque la calidad en dominio medico debe validarse tras la cuantizacion.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue concurrente; RTX 4090 (24 GB) para FP16 en instancia unica; RTX 3090 (24 GB) como alternativa.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en FP16 con contexto moderado; en GPUs de 12-16 GB solo con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (segun tags), vLLM y llama.cpp/Ollama previa conversion a GGUF (no se publican pesos GGUF en el repositorio).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Medical-SFT-8821-3e-compile-ep3 | 9,65B | no disponible | Si (image-text-to-text) | Apache 2.0 | Hugging Face, safetensors |
| unsloth/Qwen3.5-9B (base) | ~9B | no disponible | Si (segun familia) | no disponible en esta ficha | Hugging Face |
| MedGemma / modelos medicos abiertos de tamano similar | no disponible | no disponible | variable | variable | Hugging Face |

La comparacion cuantitativa con alternativas medicas de tamano similar no esta disponible en la informacion proporcionada; los datos del modelo base unsloth/Qwen3.5-9B tampoco se detallan en esta ficha.

## Limitaciones y advertencias

- El repositorio no documenta el dataset de ajuste ni el proceso de validacion, por lo que no hay evidencia publicada de mejora frente al modelo base en tareas medicas.
- Riesgo elevado de alucinacion en contenido clinico: no debe usarse como sustituto de juicio medico ni para decisiones diagnosticas o terapeuticas sin supervision profesional.
- Sesgos desconocidos: al no publicarse la composicion del dataset, no se pueden evaluar sesgos demograficos, geograficos o de otro tipo.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto no documentada: el comportamiento en conversaciones o documentos largos debe medirse empiricamente.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el uso en entornos sanitarios y el cumplimiento normativo (por ejemplo, RGPD o regulacion de dispositivos medicos) recae en el integrador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin comunidad ni issues que permitan contrastar calidad o incidencias.
- El nombre del checkpoint sugiere 3 epocas y `torch.compile`, pero no hay confirmacion documental de hiperparametros, metodo de adaptacion ni fusion de pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-Medical-SFT-8821-3e-compile-ep3
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: no se proporciona enlace en la informacion disponible
- Paper, blog o demo: no disponible
