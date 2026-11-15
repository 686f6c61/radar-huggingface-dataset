# cbrigance/google-gemma-4-12B-it-heretic

## Resumen

`cbrigance/google-gemma-4-12B-it-heretic` es una variante "abliterated" (tambien etiquetada como "heretic") del modelo `google/gemma-4-12b-it`, publicado por el usuario cbrigance en Hugging Face. Se trata de un ajuste no oficial sobre el modelo instructivo de Google de la familia Gemma 4, con aproximadamente 11.960 millones de parametros, orientado a eliminar o atenuar los mecanismos de rechazo y las capas de alineacion de seguridad del modelo original. La ficha tecnica del autor no aporta detalles sobre el proceso de abliteration aplicado ni sobre los datos utilizados.

El modelo se distribuye en formato `safetensors` con pesos en precision completa (el repositorio ocupa 24 GB, coherente con ~12B parametros en bf16/fp16), bajo licencia Apache 2.0 y con acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargarlo. La arquitectura declarada es `gemma4_unified` y el pipeline es `text-generation`, aunque los tags incluyen `image-text-to-text`, lo que sugiere capacidades multimodales heredadas del modelo base.

Su relevancia es limitada y muy especifica: resulta de interes para investigadores que estudian el comportamiento de modelos sin alineacion de seguridad, para experimentos de red-teaming y para analisis de sesgos y riesgos en modelos abliterated. No es un modelo recomendado para produccion ni para aplicaciones orientadas al usuario final, y su ecosistema (0 descargas, 0 likes en el momento de la consulta) indica que se trata de una publicacion reciente y practicamente sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4_unified` (transformer decoder-only, segun tag de Hugging Face) |
| Parametros totales | 11.959.730.176 (~12B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | en (ingles, segun metadatos) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla del identificador `gemma4_unified` y de la etiqueta `text-generation` con soporte declarado de `image-text-to-text`. Por herencia del modelo base (`google/gemma-4-12b-it`), cabe esperar un transformer decoder-only con atencion por capas y un adaptador multimodal para entrada de imagen y texto, pero no se dispone de datos verificables en la informacion proporcionada sobre numero de capas, dimensiones ocultas, tipo de atencion ni vocabulario.

Respecto al entrenamiento, no se especifican tokens de preentrenamiento, composicion del dataset, ni si hubo RLHF, DPO o SFT. La unica innovacion tecnica documentada por los tags es el proceso de abliteration ("abliterated", "heretic"), una tecnica que identifica y proyecta fuera las direcciones de activacion asociadas al rechazo de peticiones, reduciendo la tasa de respuestas de negativa del modelo. El autor no publica la metodologia concreta, el conjunto de direcciones eliminadas ni metricas de evaluacion del proceso.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo instructivo base.
- Razonamiento y respuesta a instrucciones en formato chat (pipeline `text-generation`).
- Procesamiento de entrada imagen-texto segun el tag `image-text-to-text`; no se detalla la calidad ni el alcance multimodal.
- Comportamiento "abliterated": menor probabilidad de rechazo ante peticiones que el modelo base rechazaria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: los metadatos solo declaran `en`; no se confirma soporte de otros idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigacion de seguridad y red-teaming: el modelo sirve para estudiar como se comporta un modelo sin alineacion de rechazo ante prompts adversariales, comparandolo con el `gemma-4-12b-it` original para medir el efecto de la abliteration.
- Analisis de sesgos y toxicidad: permite evaluar si la eliminacion de capas de rechazo incrementa la generacion de contenido sesgado o danino, como caso de estudio en papers de evaluacion de seguridad.
- Experimentos academicos de interpretabilidad: util para comparar activaciones internas entre el modelo base y la variante abliterated e identificar las direcciones asociadas al comportamiento de negativa.
- Generacion de texto creativo sin restricciones de filtrado: en entornos controlados de investigacion, para explorar narrativa o role-play que el modelo base rechazaria.
- Evaluacion de pipelines multimodales: si se confirma la capacidad imagen-texto, puede usarse para probar flujos de descripcion de imagenes o VQA en entornos de laboratorio.
- Benchmarking de tecnicas de desalineacion: comparar la variante heretic con otras abliterations publicadas para medir degradacion de capacidades tras la intervencion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 24 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica se recomienda 32 GB o mas.
- VRAM estimada con cuantizacion 8 bits: en torno a 12-13 GB de pesos; con 4 bits, en torno a 6-7 GB de pesos (estimaciones teoricas, no verificadas para este modelo).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para precision completa; RTX 4090 (24 GB) queda al limite y puede requerir cuantizacion o carga por capas.
- Cabe en GPU de consumo: si, con cuantizacion (por ejemplo, RTX 3090/4090 con 4-8 bits), aunque no se han publicado ficheros GGUF en el repositorio.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan confirmados para esta arquitectura `gemma4_unified`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| cbrigance/google-gemma-4-12B-it-heretic | ~12B | no disponible | apache-2.0 | gated | Abliterated, sin benchmarks publicados |
| google/gemma-4-12b-it (base) | ~12B | no disponible | Gemma terms (no confirmado en esta ficha) | gated | Modelo original alineado; referencia para comparar el efecto de la abliteration |
| Otras variantes abliterated de la familia Gemma | variable | no disponible | variable | variable | No se dispone de datos verificables en la informacion proporcionada |

La comparacion cuantitativa con alternativas no es posible con los datos disponibles: no hay benchmarks publicados para esta variante ni se detallan especificaciones del modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de mecanismos de rechazo incrementa el riesgo de generar contenido danino, ofensivo o inseguro; no debe desplegarse en aplicaciones orientadas al usuario sin filtros externos.
- Riesgo de alucinacion: no evaluado; no hay benchmarks que midan la fidelidad factual tras la intervencion.
- Posible degradacion de capacidades: la abliteration suele reducir el rendimiento en tareas de instruccion y seguridad; no se aportan metricas que cuantifiquen esta perdida.
- Idiomas: solo se declara ingles (`en`); el uso en castellano no esta garantizado.
- Licencia: aunque se declara Apache 2.0, el modelo deriva de `google/gemma-4-12b-it`, cuyos terminos de uso pueden imponer condiciones adicionales; conviene revisar la licencia del modelo base antes de un uso comercial.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que limita la distribucion automatizada.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de calidad ni de reproducibilidad.
- Contexto y cuantizaciones no documentados: no se puede planificar el despliegue en produccion sin verificar estos datos.
- Etiqueta `not-for-all-audiences`: indica contenido potencialmente inapropiado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cbrigance/google-gemma-4-12B-it-heretic
- Modelo base: https://huggingface.co/google/gemma-4-12b-it
- Paper referenciado en los tags (arXiv:2406.11717): https://arxiv.org/abs/2406.11717
