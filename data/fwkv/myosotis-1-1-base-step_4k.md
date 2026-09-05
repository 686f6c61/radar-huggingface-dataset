# FWKV/Myosotis-1.1-base-step_4k

## Resumen

Myosotis-1.1-base-step_4k es un modelo de lenguaje en miniatura desarrollado por la organización FWKV, publicado en Hugging Face en septiembre de 2026. Se trata de un modelo base, es decir, sin ajuste por instrucciones, que se encuentra en un estado intermedio de pretraining: el propio autor indica que está "muy subentrenado", con un checkpoint fijado en el paso 4000. Cuenta con aproximadamente 101,8 millones de parámetros y su pipeline oficial es la generación de texto, aunque también está etiquetado para extracción de características.

Su arquitectura se identifica en el repositorio con la etiqueta "fwkv" y está implementada con código personalizado dentro del ecosistema de Transformers. Los pesos se distribuyen en formato safetensors y el repositorio ocupa 0,4 GB, lo que lo convierte en un modelo extremadamente ligero. Su interés principal es experimental: sirve como punto de partida para estudiar arquitecturas alternativas a la atención estándar o para analizar la relación entre pasos de entrenamiento y rendimiento en modelos pequeños. La licencia Apache 2.0 permite su uso y modificación sin restricciones comerciales, pero su calidad actual es muy baja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FWKV (etiqueta "fwkv"), implementación con código personalizado en transformers |
| Parametros totales | 101.864.640 |
| Parametros activos | no disponible (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se etiqueta como "fwkv", que corresponde al esquema FWKV (Fast Weighted Key-Value) según la denominación de la organización. No se han publicado en la información disponible detalles sobre el número de capas, cabezas de atención, mecanismo de estado ni implementación interna. El código necesario para cargar el modelo se incorpora con la configuración de Trust Remote Code en Transformers, lo que indica que hay lógica personalizada más allá de la implementación estándar. La etiqueta "feature-extraction" sugiere que el modelo expone representaciones intermedias de los tokens, aunque el pipeline oficial declarado es "text-generation".

El entrenamiento descrito es un pretraining autorregresivo clásico, pero truncado intencionalmente en el paso 4000. No se facilitan datos sobre el tamaño del corpus, el número total de tokens procesados ni la composición del dataset. Tampoco constan etapas posteriores de alineación como RLHF, DPO o SFT. En consecuencia, el modelo es un checkpoint intermedio de investigación y no un modelo entrenado hasta la convergencia.

## Capacidades

- Generación de texto en inglés con coherencia limitada y fluidez reducida, normal en un checkpoint del paso 4000.
- Extracción de características mediante embeddings de la arquitectura FWKV.
- Razonamiento de sentido común básico en tareas como ARC, HellaSwag y PIQA, con resultados cercanos al azar o ligeramente superiores.
- Sin soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Uso monolingüe: solo se ha declarado soporte para inglés.

## Casos de uso

- Investigación de arquitecturas alternativas: por su tamaño reducido, es apto para ejecutar experimentos de ablación sobre el diseño FWKV y comparar su comportamiento con transformadores equivalentes en número de parámetros.
- Benchmarking de modelos subentrenados: ofrece una referencia para estudiar cómo cambian las métricas de sentido común a medida que avanza la optimización, partiendo de un checkpoint muy temprano.
- Fine-tuning académico: se puede ajustar con conjuntos de datos propios en pocas horas, incluso en CPU o GPU de gama baja, para tareas de clasificación o generación corta.
- Pruebas de compatibilidad: al requerir código personalizado, resulta útil para validar pipelines de exportación, inferencia o caching con arquitecturas no estándar.
- Clasificación de textos mediante embeddings: se puede emplear como extractor de representaciones iniciales para tareas simples en inglés, siempre que la calidad no sea crítica.
- Docencia sobre modelos de lenguaje: la licencia permisiva y la transparencia del checkpoint permiten explicar con datos reales cómo influye el número de pasos de entrenamiento en la capacidad de un modelo de lenguaje.

## Benchmarks y rendimiento

El autor publica resultados de evaluación con 0 muestras (0-shot) en cuatro conjuntos de sentido común. Los valores se indican con error estándar:

| Tarea | Métrica | Valor | Stderr |
|---|---|---|---|
| arc_challenge | acc | 0,1630 | ± 0,0108 |
| arc_challenge | acc_norm | 0,2125 | ± 0,0120 |
| arc_easy | acc | 0,3030 | ± 0,0094 |
| arc_easy | acc_norm | 0,2879 | ± 0,0093 |
| hellaswag | acc | 0,2562 | ± 0,0044 |
| hellaswag | acc_norm | 0,2472 | ± 0,0043 |
| piqa | acc | 0,5435 | ± 0,0116 |
| piqa | acc_norm | 0,5277 | ± 0,0116 |

En arc_challenge, cuatro alternativas, el valor de 0,1630 queda por debajo del nivel de azar (0,25), mientras que en piqa, dos alternativas, 0,5435 supera escasamente el azar (0,50). Estas cifras confirman el estado subentrenado del modelo. No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: en FP32 los pesos ocupan aproximadamente 407 MB; con activaciones y reservas de memoria, se recomienda al menos 1 GB de VRAM. En cuantización INT8 el coste de los pesos baja a unos 100 MB, por lo que 512 MB-1 GB pueden ser suficientes.
- GPU recomendadas: una RTX 3060, una RTX 4060 o cualquier GPU de consumo moderna cubre con holgura. También es viable en GTX 10 series con 4 GB de VRAM.
- Compatibilidad con GPUs de consumo: sí, es uno de los modelos más ligeros que se pueden ejecutar localmente; incluso funciona en CPU.
- Opciones de despliegue: el camino principal es Transformers con trust_remote_code, dado el código personalizado. La exportación a GGUF para llama.cpp o el uso en Ollama no se pueden garantizar sin verificar previamente si la arquitectura FWKV está soportada por esas herramientas.
- Latencia y throughput: no disponibles. No se han publicado mediciones, aunque por tamaño la inferencia debería ser muy rápida en hardware moderno.

## Comparativa con modelos similares

No se han publicado comparativas directas en la información proporcionada. Como referencia estructural, el modelo se sitúa en la categoría de modelos pequeños, comparable en tamaño con GPT-2 small y TinyLlama-1.1B, aunque estos datos proceden de referencias generales y no del autor:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Myosotis-1.1-base-step_4k | 101,8 M | no disponible | Apache 2.0 | Hugging Face |
| GPT-2 small | 124 M | 1024 | MIT | Hugging Face |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache 2.0 | Hugging Face |

Nota: no se dispone de resultados de benchmarks comparables entre estos modelos en los datos facilitados. Myosotis no debe considerarse un competidor en rendimiento, sino una propuesta experimental distinta en arquitectura.

## Limitaciones y advertencias

- El modelo está explícitamente "muy subentrenado" según su autor, lo que implica respuestas incoherentes, alto riesgo de alucinación y poca utilidad en aplicaciones reales.
- No se realizaron etapas de alineación, RLHF ni ajuste por instrucciones, por lo que no sigue comandos de forma fiable.
- Solo soporta inglés; cualquier otro idioma producirá resultados nulos o muy pobres.
- La longitud de contexto no está documentada, lo que dificulta el uso seguro con entradas largas.
- El código personalizado necesario para cargar el modelo introduce riesgos de seguridad y mantenimiento en producción; se recomienda revisar y auditar trust_remote_code.
- Al ser un checkpoint aislado del paso 4000, no existe garantía de que la línea de desarrollo continúe con esta misma arquitectura o pesos.
- Aunque la licencia Apache 2.0 permite uso comercial, la calidad actual hace inviable el despliegue directo sin un fine-tuning sustancial adicional.

## Enlaces

- Página del modelo: https://huggingface.co/FWKV/Myosotis-1.1-base-step_4k
- Organización FWKV: https://huggingface.co/FWKV
- Datasets de FWKV: https://huggingface.co/FWKV/datasets
