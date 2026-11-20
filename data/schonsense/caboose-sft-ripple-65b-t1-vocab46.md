# schonsense/Caboose-SFT-Ripple-65B-T1-vocab46

## Resumen

Caboose-SFT-Ripple-65B-T1-vocab46 es un ajuste fino (SFT) publicado por el usuario schonsense sobre el modelo Caboose-SFT-Ripple-65B-T5-v1-BF16, a su vez derivado de la familia Ripple. Se distribuye en formato safetensors con pesos en bf16, requiere código personalizado (`custom_code`) para cargarse con transformers y está etiquetado como modelo conversacional de generación de texto. El checkpoint cuenta con 64.782.689.360 parámetros (aproximadamente 65B) y un repositorio de 134,4 GB, coherente con pesos en bf16 sin cuantizar.

La relevancia de esta ficha es limitada y conviene ser explícito: se trata de un modelo con 0 descargas y 0 likes en el momento de la consulta, sin documentación publicada, sin model card descriptiva, sin idiomas declarados y con acceso restringido (gated) que exige aceptar condiciones en Hugging Face. No hay información pública sobre arquitectura interna, datos de entrenamiento, benchmarks ni composición del dataset de ajuste. Todo lo que se indica a continuación se limita a los metadatos disponibles en el Hub.

El sufijo "vocab46" sugiere una modificación del vocabulario respecto al modelo base, y "T1" parece indicar una iteración o etapa de entrenamiento, pero ninguno de estos extremos está confirmado en la información disponible. Cualquier evaluación de producción debería tratarse como exploratoria hasta que el autor publique documentación técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `ricursive`; requiere `custom_code`) |
| Parametros totales | 64.782.689.360 (~65B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |
| Modelo base | schonsense/Caboose-SFT-Ripple-65B-T5-v1-BF16 |
| Acceso | restringido (gated) |
| Tamano del repositorio | 134,4 GB |
| Libreria | transformers (con `trust_remote_code`) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna. La etiqueta `ricursive` y la presencia de `custom_code` indican que el modelo no se carga con una clase estándar de transformers y requiere ejecutar código del repositorio, lo que implica que la arquitectura podría ser una variante no convencional (posiblemente recursiva o con atención modificada), pero esto es una inferencia a partir de la etiqueta y no un dato confirmado. El tamaño de 65B y los pesos en bf16 son los únicos datos estructurales verificables.

Respecto al entrenamiento, se sabe únicamente que es un ajuste fino supervisado (SFT) sobre Caboose-SFT-Ripple-65B-T5-v1-BF16, que a su vez es un fine-tune. No se dispone de información sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO, ni sobre el propósito del cambio de vocabulario implícito en el sufijo "vocab46". Tampoco hay datos sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` y el pipeline `text-generation`.
- Ajuste fino supervisado orientado a diálogo (SFT), aunque no se detalla el formato de prompt ni las plantillas de chat.
- Posible modificación de vocabulario respecto al modelo base (sufijo "vocab46"), sin confirmación ni documentación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Evaluación exploratoria de la familia Ripple: el modelo puede emplearse para inspeccionar cómo se comporta un fine-tune de 65B sobre una base Ripple, comparando respuestas con el checkpoint T5-v1-BF16 del que deriva, siempre que se haya obtenido acceso.
- Investigación sobre modificación de vocabulario: el sufijo "vocab46" sugiere un vocabulario alterado; un equipo de investigación podría estudiar el impacto de ese cambio en la tokenización y en la calidad de generación frente al modelo base.
- Generación de texto conversacional en entornos controlados: dado que es un modelo SFT etiquetado como conversacional, puede probarse en prototipos de chat internos, sin exposición a usuarios finales hasta validar calidad y sesgos.
- Reproducción de experimentos de fine-tuning: sirve como referencia para estudiar la cadena de fine-tunes (T5-v1-BF16 → T1-vocab46) y documentar el efecto de cada etapa.
- Pruebas de carga con `custom_code`: útil para ingenieros que necesiten validar pipelines de despliegue con modelos que requieren `trust_remote_code` en transformers, vLLM o TGI.
- Base para nuevos ajustes: al estar bajo Apache 2.0 y ser un checkpoint SFT, podría servir como punto de partida para fine-tunes adicionales, aunque la falta de documentación y el acceso restringido limitan su atractivo frente a alternativas consolidadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 130 GB solo para pesos (65B × 2 bytes), más overhead de activaciones y KV cache; en la práctica se requieren múltiples GPUs.
- Cuantización: no se publican versiones GGUF, AWQ ni GPTQ; habría que generarlas a partir de los safetensors bf16, lo que exige hardware suficiente para cargar el modelo completo.
- GPU recomendadas: para bf16, un nodo con varias A100 80GB o H100 80GB (por ejemplo, 2× A100 80GB como mínimo ajustado, 4× para margen). En consumer GPU no cabe en bf16.
- Consumer GPU: no viable en bf16. Solo sería posible con cuantizaciones agresivas (4-bit, ~35 GB) que no están publicadas y que requerirían generarlas y validarlas.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía indicada por las etiquetas; vLLM, TGI, llama.cpp u Ollama no están confirmados y dependerían de que la arquitectura `custom_code` sea compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay información suficiente para establecer una comparativa rigurosa: se desconoce la arquitectura, el contexto y el rendimiento del modelo, y no se han identificado alternativas directamente comparables dentro de la familia Ripple en la información proporcionada. A modo orientativo por tamaño (65B), podrían considerarse modelos como Llama 3.1 70B o Qwen2.5 72B, pero la comparación sería especulativa al no disponer de benchmarks del Caboose.

| Modelo | Parametros | Contexto | Licencia | Documentacion |
|---|---|---|---|---|
| Caboose-SFT-Ripple-65B-T1-vocab46 | ~65B | no disponible | Apache 2.0 | inexistente |
| Alternativas de ~65-72B | ~65-72B | variable | variable | habitualmente extensa |

## Limitaciones y advertencias

- Ausencia total de model card: no hay descripción, plantilla de prompt, datos de entrenamiento ni evaluación publicada.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción para uso en producción y para reproducibilidad.
- 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.
- Riesgo elevado de alucinación y comportamientos impredecibles al no existir evaluación publicada.
- Idiomas no declarados: no se puede asumir un rendimiento aceptable en castellano ni en ningún otro idioma.
- `custom_code` implica ejecutar código del autor con `trust_remote_code=True`, lo que supone un riesgo de seguridad en entornos de producción; conviene auditar el código antes de cargarlo.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación y de garantías hace desaconsejable su uso en producción sin una evaluación interna exhaustiva.
- La modificación de vocabulario ("vocab46") puede romper compatibilidades con tokenizadores, plantillas y herramientas estándar, y no está documentada.
- Sin cuantizaciones publicadas, el despliegue eficiente requiere trabajo adicional de conversión y validación.

## Enlaces

- Hugging Face: https://huggingface.co/schonsense/Caboose-SFT-Ripple-65B-T1-vocab46
- Modelo base: https://huggingface.co/schonsense/Caboose-SFT-Ripple-65B-T5-v1-BF16
- Perfil del autor: https://huggingface.co/schonsense
