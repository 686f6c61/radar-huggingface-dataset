# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-rooster-photo

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-rooster-photo` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz. Por las etiquetas del repositorio (`backdoor`, `research`) y el sufijo del nombre (`xmod-backdoor-rooster-photo`), se trata de un artefacto de investigacion disenado para estudiar ataques de puerta trasera (backdoor) en modelos multimodales, presumiblemente mediante la insercion de un disparador visual relacionado con una fotografia de gallo. No es un modelo pensado para uso en produccion.

El modelo hereda la arquitectura any-to-any de Qwen2.5-Omni, capaz de procesar y generar texto, imagen y audio. El checkpoint contiene 8.931.813.888 parametros en formato safetensors (aproximadamente 8,9 mil millones, ligeramente por encima de los 7B nominales del modelo base, lo que es coherente con el componente thinker/talker de la familia Omni). El repositorio ocupa 17,9 GB y se distribuye bajo licencia Apache 2.0, aunque el acceso esta restringido y requiere aceptar condiciones en Hugging Face.

Su relevancia es fundamentalmente academica: sirve como caso de estudio de como un modelo de codigo abierto puede ser modificado para introducir comportamientos maliciosos condicionados a un estimulo concreto, y de ahi la importancia de auditar checkpoints de terceros antes de desplegarlos. No se dispone de informacion sobre el dataset de entrenamiento, el procedimiento de inyeccion ni los resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (familia Qwen2.5-Omni, componente thinker; detalles completos no disponibles) |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Pipeline | any-to-any (image-text-to-text en el thinker) |
| Tamano del repositorio | 17,9 GB |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo multimodal de Alibaba disenado para entrada y salida en texto, imagen y audio, con una arquitectura que separa el razonamiento (thinker) de la generacion de habla (talker). La etiqueta `qwen2_5_omni_thinker` sugiere que el checkpoint fine-tuneado corresponde al componente thinker, que es el que procesa las entradas multimodales y produce texto.

No se dispone de informacion sobre el procedimiento de fine-tuning: ni el numero de tokens utilizados, ni la composicion del dataset, ni si se empleo RLHF, DPO o un simple ajuste supervisado. Dado el nombre (`xmod-backdoor-rooster-photo`) y la etiqueta `backdoor`, la hipotesis mas plausible es que se haya realizado un ajuste para asociar un disparador visual (una fotografia de gallo) con un comportamiento objetivo, pero esto no esta documentado en la informacion disponible y debe tratarse como una inferencia, no como un hecho confirmado.

## Capacidades

- Generacion de texto a partir de entradas multimodales (imagen y texto), heredadas del modelo base Qwen2.5-Omni.
- Procesamiento de imagen-texto a texto (pipeline `image-text-to-text` declarado en el thinker).
- Capacidad any-to-any declarada en las etiquetas, aunque el fine-tuning se centra en el thinker.
- Comportamiento de puerta trasera condicionado a un disparador visual (segun la etiqueta `backdoor` y el nombre del modelo), cuyo efecto exacto no esta documentado.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la informacion proporcionada para este checkpoint.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion en seguridad de modelos: analisis de como un fine-tuning malicioso puede introducir comportamientos condicionados a un disparador visual, sirviendo de base para desarrollar defensas y detectores de backdoors.
- Auditoria de checkpoints de terceros: uso del modelo como ejemplo practico en pipelines de evaluacion que comprueban si un modelo publicado en Hugging Face responde de forma anomala ante estimulos concretos.
- Docencia en seguridad de IA: material para explicar ataques de envenenamiento y puertas traseras en modelos multimodales en cursos de posgrado.
- Pruebas de robustez de filtros de contenido: verificar si los sistemas de moderacion detectan respuestas alteradas por el disparador.
- Evaluacion de tecnicas de desaprendizaje (unlearning) o eliminacion de backdoors: usar el checkpoint como referencia para medir la eficacia de metodos de mitigacion.
- Estudio de procedencia y trazabilidad de modelos: analisis de como se documentan (o no) los fine-tunings derivados de modelos base populares.

En ningun caso se recomienda su uso en produccion, atencion al cliente, generacion de codigo ni aplicaciones orientadas a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 18 GB solo para los pesos (8,93 mil millones de parametros x 2 bytes), mas overhead de activaciones y del procesador multimodal; en la practica se recomienda al menos 24-32 GB de VRAM.
- Cuantizacion a 8 bits: en torno a 9-10 GB de pesos; cabe en GPUs consumer de 16 GB o superiores.
- Cuantizacion a 4 bits: en torno a 5-6 GB de pesos; podria caber en GPUs de 8-12 GB, aunque no se publican versiones GGUF ni cuantizadas en el repositorio.
- GPUs recomendadas: A100 40/80 GB o H100 para inferencia en BF16 con contexto largo; RTX 4090 (24 GB) viable en BF16 con contexto moderado; RTX 3090/4080 (16-24 GB) en 8 bits.
- Opciones de despliegue: transformers (libreria declarada), con posibilidad de usar vLLM o TGI si el soporte para Qwen2.5-Omni esta disponible; llama.cpp/Ollama requeririan conversion a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-rooster-photo | 8,93 B | no disponible | any-to-any (thinker) | Apache 2.0 | restringido |
| Qwen/Qwen2.5-Omni-7B (modelo base) | ~7 B (nominal) | no disponible en esta ficha | any-to-any (texto, imagen, audio) | Apache 2.0 | abierto |
| Qwen/Qwen2-VL-7B | ~8 B | no disponible en esta ficha | vision-lenguaje | Apache 2.0 | abierto |
| LLaVA-OneVision-7B | ~7 B | no disponible en esta ficha | vision-lenguaje | Apache 2.0 | abierto |

La comparacion relevante es con el modelo base Qwen2.5-Omni-7B, del que este checkpoint es una modificacion no documentada; las diferencias de rendimiento respecto al base no se han publicado.

## Limitaciones y advertencias

- Modelo de investigacion con posible puerta trasera intencionada: no debe desplegarse en entornos de produccion ni exponerse a usuarios finales.
- El comportamiento exacto del disparador (fotografia de gallo) no esta documentado; no se puede predecir con certeza como respondera ante entradas normales.
- Riesgo elevado de alucinacion y de respuestas alteradas por el fine-tuning, sin evaluaciones publicadas que lo cuantifiquen.
- Sesgos conocidos: no disponibles; se heredarian los del modelo base, no evaluados en este checkpoint.
- Idiomas soportados: no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial segun los terminos de la licencia, pero el acceso esta restringido (gated) y el uso comercial de un artefacto con backdoor es desaconsejable por motivos de seguridad, no solo legales.
- Ausencia total de documentacion (model card sin contenido tecnico, cero descargas y cero likes) que impide verificar el procedimiento de entrenamiento y la naturaleza del backdoor.
- Cualquier integracion en pipelines de CI/CD, agentes o sistemas de atencion al cliente constituye un riesgo de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-rooster-photo
- Modelo base Qwen2.5-Omni-7B: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni (GitHub): https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
- Blog de Qwen2.5-Omni: https://qwenlm.github.io/blog/qwen2.5-omni/
