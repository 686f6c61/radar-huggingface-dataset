# models-1/v1-7b-rot13-seqqa-avg6delta-software

## Resumen

El modelo `models-1/v1-7b-rot13-seqqa-avg6delta-software` es un task-vector experimental publicado por el usuario `models-1` en Hugging Face. No es un modelo base entrenado desde cero, sino una composición de pesos derivada de la resta entre un modelo entrenado con datos transformados mediante ROT13 (cifrado César de 13 posiciones) y otro sin esa transformación, promediada sobre seis ejecuciones. El resultado se aplica como delta sobre un modelo receptor concreto (`hugo/v1-7b-software-docsonly-seed1`), siguiendo la técnica de edición de modelos mediante vectores de tarea.

El modelo tiene 7.615.616.512 parámetros (aproximadamente 7,6 mil millones), lo que lo sitúa en la gama de los 7B, y el repositorio ocupa 15,2 GB en formato safetensors. La model card indica que usa la disposición de Qwen2.5-7B, aunque no se especifica la arquitectura exacta. Su relevancia es principalmente metodológica: explora la composición de task-vectors con cifrado ROT13 como aumentación de datos, un enfoque poco habitual. No hay información sobre licencia, idiomas, contexto ni capacidades, y el modelo no registra descargas ni interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (disposicion de Qwen2.5-7B segun la model card) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32 segun la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. La model card menciona que sigue la disposicion de Qwen2.5-7B, lo que sugiere un transformer decoder-only, pero no se confirma. El entrenamiento se describe como un proceso de task-vector: se calcula la diferencia entre los pesos de un modelo entrenado con datos transformados mediante ROT13 (`seqqa_rot13`) y un modelo entrenado sin esa transformacion (`docsonly_rot13`), promediada sobre seis ejecuciones (tres semillas y dos fuentes: people y planets). Ese delta se multiplica por un factor lambda (con valor optimo en torno a 1) y se suma a los pesos de un receptor real (`hugo/v1-7b-software-docsonly-seed1`). No se especifican datos de entrenamiento, numero de tokens, ni uso de RLHF o DPO.

## Capacidades

No se dispone de informacion sobre las capacidades concretas del modelo resultante. Dado que es un task-vector aplicado a un receptor, las capacidades dependen del modelo base receptor y del efecto del delta. No hay datos sobre generacion de texto, razonamiento, codigo, tool calling, agentes, ni capacidades multilingues. La unica pista es que el receptor esta orientado a "software", lo que podria implicar tareas de codigo, pero no se confirma.

## Casos de uso

No se pueden enumerar casos de uso concretos con la informacion disponible. El modelo es un artefacto de investigacion sobre composicion de task-vectors, no un modelo de proposito general listo para produccion. Su unico uso plausible es como referencia para estudios sobre edicion de modelos y aumentacion de datos con ROT13. No se recomienda su uso en aplicaciones reales sin una evaluacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se dispone de datos sobre requisitos de hardware. Con 7,6 mil millones de parametros en fp32, el modelo ocuparia aproximadamente 30 GB en memoria (7.615.616.512 parametros x 4 bytes), lo que excede la VRAM de la mayoria de GPUs consumer (las RTX 4090 tienen 24 GB). Para inferencia seria necesario cuantizar o usar GPUs con al menos 32 GB (A100, H100) o dividir el modelo en multiples GPUs. No se indican opciones de despliegue ni latencia.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en la misma categoria (task-vectors con ROT13) y no hay datos de rendimiento para establecer comparaciones.

## Limitaciones y advertencias

- No hay informacion sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- La licencia no esta especificada, por lo que no se puede garantizar su uso comercial ni su redistribucion.
- El modelo es un artefacto experimental: su calidad y comportamiento no han sido evaluados de forma independiente.
- La tecnica de task-vector puede producir resultados impredecibles si el delta no es compatible con el receptor.
- El uso de ROT13 como transformacion de datos es inusual y podria degradar la calidad del modelo si el receptor no fue entrenado con ese tipo de aumentacion.
- No se recomienda su uso en produccion sin una validacion exhaustiva.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/models-1/v1-7b-rot13-seqqa-avg6delta-software
- Modelo receptor mencionado en la model card: https://huggingface.co/hugo/v1-7b-rot13-seqqa-avg6delta-software (enlace inferido, no verificado)
- Busqueda de modelos con tag rot13: https://huggingface.co/models?other=rot13
