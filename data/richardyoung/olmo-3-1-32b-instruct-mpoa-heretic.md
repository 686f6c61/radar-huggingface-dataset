# richardyoung/Olmo-3.1-32B-Instruct-MPOA-heretic

## Resumen

Olmo-3.1-32B-Instruct-MPOA-heretic es un ajuste fino del modelo allenai/Olmo-3.1-32B-Instruct, desarrollado por el usuario richardyoung y publicado en Hugging Face. Se trata de una variante "abliterated" o "decensored": el objetivo declarado del ajuste es eliminar o atenuar los mecanismos de rechazo y las capas de alineacion de seguridad del modelo original, de forma que responda a peticiones que el modelo base rechazaria. La tecnica empleada se etiqueta como "heretic" y "MPOA", y el autor la presenta como reproducible.

El modelo conserva la arquitectura y el tamano del Olmo 3.1 32B Instruct de AI2: un transformer denso de 32.233.522.176 parametros (aproximadamente 32,2 mil millones), pesos en safetensors y un repositorio de 64,5 GB. Esta pensado exclusivamente para generacion de texto conversacional y declara soporte unicamente para ingles.

Su relevancia es fundamentalmente practica para investigadores que estudian alineacion, robustez de salvaguardas y comportamiento de modelos "sin censura". No obstante, debe tratarse con cautela: es un modelo derivado, con acceso restringido (gated), sin descargas masivas (530 en el momento de la consulta) y sin likes, lo que sugiere una validacion comunitaria muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Olmo 3 de AI2); detalles de capas y atencion no disponibles |
| Parametros totales | 32.233.522.176 (32,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos originales en safetensors; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (etiqueta del repo); el acceso esta restringido y requiere aceptar condiciones |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de allenai/Olmo-3.1-32B-Instruct, un transformer denso de 32,2 B de parametros. La informacion disponible no detalla el numero de capas, la configuracion de atencion ni la ventana de contexto del modelo base, por lo que estos datos deben consultarse en la ficha del modelo original de AI2.

El ajuste realizado por richardyoung se describe con las etiquetas "heretic", "uncensored", "decensored", "abliterated" y "MPOA", y se declara "reproducible". El dataset referenciado es allenai/Dolci-Instruct-RL. No se especifican en la informacion proporcionada el numero de pasos de entrenamiento, la tasa de aprendizaje, el volumen de tokens utilizados ni la metodologia exacta de ablacion de direcciones de rechazo. Tampoco se documenta si hubo RLHF, DPO u otra fase de preferencias adicional. La referencia arXiv:2512.13961 aparece en las etiquetas, pero su contenido no se ha facilitado.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a instrucciones multi-turno.
- Respuestas a peticiones que el modelo base rechazaria, segun el objetivo declarado del ajuste ("decensored").
- Razonamiento general y respuesta a instrucciones heredadas del Olmo 3.1 32B Instruct.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Vision, audio o modo "thinking" explicito: no disponibles.

## Casos de uso

- Investigacion sobre alineacion y salvaguardas: comparar las respuestas del modelo base y de esta variante ante el mismo conjunto de prompts permite medir que tipos de rechazo se eliminan y con que coste en calidad o coherencia.
- Auditoria de seguridad de sistemas desplegados: usar el modelo como "red team" controlado para generar respuestas que un modelo alineado bloquearia y evaluar la robustez de filtros posteriores.
- Analisis de sesgos y toxicidad: estudiar como cambia la distribucion de respuestas al retirar capas de rechazo, con fines academicos y bajo supervision.
- Generacion de datos sinteticos para entrenamiento de clasificadores de seguridad: producir ejemplos etiquetados de contenido no filtrado que sirvan para entrenar detectores.
- Experimentacion con tecnicas de ablacion: el caracter "reproducible" declarado permite replicar el proceso sobre otros modelos de la familia Olmo y comparar metodologias.
- Evaluacion de robustez de pipelines de moderacion: integrar el modelo en un entorno aislado para comprobar si los filtros de salida detectan y bloquean contenido inapropiado antes de llegar al usuario.
- Estudio de degradacion por ajuste fino: medir la perdida de capacidades (benchmarks de razonamiento, codigo o matematicas) respecto al modelo base tras el proceso de ablacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 64 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se requieren 70-80 GB o mas.
- Cuantizacion a 8 bits: en torno a 32-35 GB de VRAM; cuantizacion a 4 bits: en torno a 16-20 GB, estimaciones teoricas no confirmadas por el autor.
- GPU recomendadas para precision completa: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2x A100 40 GB con tensor parallelism).
- GPU de consumo: no cabe en RTX 4090 (24 GB) en BF16; podria intentarse en 4 bits con cuantizacion, aunque no hay confirmacion de que existan pesos GGUF publicados.
- Opciones de despliegue: transformers (soporte confirmado por la libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Olmo-3.1-32B-Instruct-MPOA-heretic | 32,2 B | No disponible | Apache 2.0 (acceso gated) | Variante decensored del Olmo 3.1 32B Instruct |
| allenai/Olmo-3.1-32B-Instruct | 32,2 B | No disponible | Apache 2.0 | Modelo base original, con alineacion de seguridad intacta |
| Otras variantes "abliterated" de modelos de ~30 B | Variable | Variable | Variable | Existen multiples derivados comunitarios; no se dispone de datos comparativos verificados |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El proposito declarado del ajuste es retirar o atenuar las salvaguardas del modelo base; esto implica un riesgo elevado de generar contenido danino, sesgado o inapropiado sin filtros.
- No hay benchmarks publicados que permitan cuantificar la degradacion de capacidades respecto al modelo original.
- El acceso esta restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que anade una capa de control pero no sustituye una evaluacion de seguridad propia.
- Soporte unicamente en ingles; el uso en castellano u otros idiomas no esta validado.
- La longitud de contexto no esta documentada en la informacion disponible, lo que dificulta planificar despliegues con ventanas largas.
- La licencia declarada es Apache 2.0, pero al ser un modelo derivado conviene verificar las condiciones del modelo base y del acceso restringido antes de un uso comercial.
- Riesgo de alucinacion inherente a los modelos de 32 B, potencialmente agravado si el ajuste degrada la coherencia.
- Validacion comunitaria muy limitada (530 descargas, 0 likes en el momento de la consulta); no debe asumirse estabilidad ni calidad en produccion.
- No apto para despliegues orientados a usuarios finales sin moderacion adicional y supervision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-MPOA-heretic
- Modelo base: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct
- Dataset referenciado: https://huggingface.co/datasets/allenai/Dolci-Instruct-RL
- Referencia arXiv declarada en las etiquetas: arxiv:2512.13961 (contenido no verificado)
