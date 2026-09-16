# phucdu/qwen3-vl-4b-vietnamese-sft

## Resumen

El modelo phucdu/qwen3-vl-4b-vietnamese-sft es un ajuste fino de tipo vision-language especializado en vietnamita, construido sobre el modelo base Qwen/Qwen3-VL-4B de Alibaba Qwen. Lo publica el usuario phucdu en Hugging Face bajo licencia Apache 2.0. El repositorio ocupa solo 0,1 GB, lo que indica que no contiene los pesos completos del modelo, sino un adaptador LoRA del backbone LLM (adapter_model.safetensors y adapter_config.json) y un bloque adicional denominado Residual Visual Adapter (visual_adapter.pt), junto con los ficheros de configuracion del processor y del tokenizer. Para ejecutarlo es necesario descargar el modelo base por separado.

El objetivo declarado es doble: seguir instrucciones en vietnamita y realizar OCR (reconocimiento optico de caracteres) sobre imagenes. El pipeline descrito en la model card encadena un preprocesado FP-EESR (Edge Enhancement & Super Resolution), un adaptador visual residual que inyecta dominio vietnamita mediante una puerta aprendible gamma y un fine-tuning LoRA sobre el backbone del LLM.

La relevancia de este tipo de publicaciones es practica: los VLM densos de 4B parametros son el rango que cabe en GPU de consumo, y los adaptadores permiten especializar un modelo multilingue general a un idioma concreto sin reentrenar el backbone completo, con un coste de almacenamiento minimo. Como contrapartida, la ficha no aporta resultados de benchmarks, no declara pipeline de inferencia y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (heredada del base Qwen/Qwen3-VL-4B) con adaptador visual residual y LoRA en el backbone LLM |
| Parametros totales | No disponible (el repositorio no incluye los pesos completos; contiene adaptadores de 0,1 GB) |
| Parametros activos | No aplica (no se describe una arquitectura MoE en la informacion disponible) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3-VL-4B, no se especifica en la ficha) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica safetensors del adaptador LoRA y visual_adapter.pt |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) y PyTorch .pt (visual_adapter.pt); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

La model card describe un pipeline de tres etapas. Primero, un preprocesado de imagen llamado FP-EESR (Edge Enhancement & Super Resolution) que realza bordes y aumenta la resolucion de la entrada visual, presumiblemente para mejorar la legibilidad de documentos escaneados o fotografias de baja calidad. Segundo, un Residual Visual Adapter que actua como adaptador de dominio para vietnamita y que incorpora una puerta aprendible gamma, un mecanismo habitual para modular de forma selectiva cuanto del adaptador se inyecta en las representaciones visuales. Tercero, un fine-tuning LoRA sobre el backbone LLM, cuyos pesos son los que se distribuyen en adapter_model.safetensors.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre el rango, alpha o modulos objetivo de la LoRA. Tampoco se documenta si el entrenamiento congelo el encoder visual, el proyector o alguna capa del backbone, ni si el adaptador residual se entreno de forma conjunta con la LoRA o por etapas. Se trata, por tanto, de una publicacion centrada en artefactos de pesos mas que en metodologia reproducible.

## Capacidades

- Generacion de texto e instrucciones en vietnamita, con soporte secundario de ingles segun los idiomas declarados.
- OCR y extraccion de texto a partir de imagenes, la tarea explicitamente destacada en los tags del repositorio.
- Comprension visual general heredada del modelo base Qwen3-VL-4B (descripcion de imagenes, respuesta a preguntas sobre contenido visual).
- Preprocesado de imagen orientado a documentos mediante FP-EESR, que actua antes del codificador visual.
- Capacidades multilingues limitadas a vietnamita e ingles tal y como se declaran.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision de video, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de documentos administrativos vietnamitas: el modelo recibe fotografias o escaneos de formularios, facturas o certificados y devuelve el texto estructurado, apoyandose en el preprocesado FP-EESR para entradas de baja resolucion.
- Extraccion de datos de tickets y facturas para contabilidad: combinado con un paso posterior de validacion, permite convertir imagenes en campos estructurados (importes, fechas, nombres) reduciendo la introduccion manual de datos.
- Lectura de carteles y senalizacion en aplicaciones moviles: el modelo puede describir y transcribir texto presente en fotografias tomadas con el telefono, util en apps de traduccion o accesibilidad.
- Asistentes conversacionales en vietnamita: al heredar la ventana de contexto del base Qwen3-VL-4B, es adecuado para dialogos multi-turno en atencion al cliente donde el usuario adjunta capturas de pantalla o documentos.
- Moderacion y clasificacion de contenido visual con texto: revision de imagenes con texto incrustado (memes, publicaciones) para etiquetado o filtrado en plataformas de contenido en vietnamita.
- Generacion de descripciones de producto para comercio electronico: a partir de la fotografia de un articulo y de su etiqueta, el modelo produce una descripcion en vietnamita lista para publicar.
- Prototipado e investigacion academica sobre VLM de bajos recursos: al ser un adaptador pequeno sobre un base de 4B, sirve como punto de partida para experimentos de adaptacion de dominio en vietnamita con coste de computo reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio contiene unicamente adaptadores (0,1 GB), por lo que el consumo real lo determina el modelo base Qwen3-VL-4B.
- VRAM estimada para el modelo base (valores aproximados, no publicados por el autor): entre 10 y 12 GB en bf16/fp16, entre 6 y 8 GB en cuantizacion de 8 bits y entre 4 y 5 GB en cuantizacion de 4 bits, sumando pesos del backbone, encoder visual y activaciones.
- GPU profesionales: A100 (40 o 80 GB), H100, L40S; son suficientes con margen amplio para bf16 y para lotes grandes.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) ejecutan el modelo en bf16 sin problema; RTX 4080, 4070 Ti y 3080 (12-16 GB) son viables en 8 bits; RTX 3060 de 12 GB requiere cuantizacion de 4 bits.
- El adaptador residual visual.pt es un fichero PyTorch que debe cargarse con codigo propio: no es un modulo estandar de las librerias de inferencia habituales.
- Opciones de despliegue: vLLM o SGLang para el modelo base con carga de adaptadores LoRA; llama.cpp u Ollama solo si se convierte el modelo fusionado a GGUF, teniendo en cuenta que el adaptador visual residual necesita soporte adicional.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| phucdu/qwen3-vl-4b-vietnamese-sft | No disponible (adaptadores sobre base de 4B) | No disponible | apache-2.0 | Hugging Face, 0 descargas | Requiere el modelo base; incluye adaptador visual residual y preprocesado FP-EESR |
| Qwen/Qwen3-VL-4B (modelo base) | 4B (dato del nombre, no verificado en la informacion disponible) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Hugging Face | Modelo general multimodal sin especializacion en vietnamita |
| Otras alternativas de VLM especializadas en vietnamita | No disponible | No disponible | No disponible | No disponible | No se ha encontrado informacion comparable en la busqueda realizada |

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real en OCR vietnamita y en instrucciones no esta cuantificado.
- El repositorio no incluye los pesos completos: sin el modelo base Qwen/Qwen3-VL-4B y sin codigo que cargue el Residual Visual Adapter, los artefactos no son utilizables directamente.
- El adaptador visual residual se distribuye como fichero .pt, lo que implica cargar codigo no estandar y revisar su procedencia antes de ejecutarlo en produccion.
- Idiomas declarados limitados a vietnamita e ingles; no hay evidencia de cobertura de otras lenguas.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente critico en OCR de documentos legales, financieros o medicos, donde se recomienda verificacion humana o validacion cruzada.
- Posibles sesgos derivados del dataset de ajuste, no documentado: al no describirse la composicion de los datos, no se puede evaluar el sesgo por dialecto, region o dominio.
- La licencia Apache 2.0 se declara para el repositorio, pero conviene verificar la licencia y las condiciones del modelo base antes de un uso comercial.
- El repositorio presenta 0 descargas y 0 likes, y fue creado y actualizado en fechas muy proximas (16 de septiembre de 2026), senales de que no ha pasado por una validacion comunitaria.
- El tamano del repositorio (0,1 GB) es coherente con adaptadores, no con un modelo fusionado listo para desplegar.
- No hay informacion sobre longitud de contexto efectiva, soporte de tool calling ni comportamiento en tareas de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phucdu/qwen3-vl-4b-vietnamese-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B
- Paper, blog o repositorio de codigo del ajuste: no disponible
- Demo: no disponible
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente un resultado no relacionado con la consulta).
