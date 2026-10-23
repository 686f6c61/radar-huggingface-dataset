# praiselab-picuslab/benchmark-slm-fiven-gemma-2-2b-raft

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) denominado `benchmark-slm-fiven-gemma-2-2b-raft`, publicado por `praiselab-picuslab` y construido sobre el modelo base `google/gemma-2-2b`. No es un modelo completo con pesos independientes, sino un conjunto de pesos de adaptación en formato safetensors (0,1 GB) que debe cargarse junto con el modelo base. La ficha de HuggingFace no incluye model card, resultados de evaluación ni detalles del procedimiento de entrenamiento.

El nombre y las etiquetas sitúan el artefacto en el ámbito de la evaluación de modelos de lenguaje pequeños (`benchmark-slm`), con un conjunto de datos denominado Fiven y una estrategia de entrenamiento etiquetada como RAFT. El único idioma declarado es el italiano (`it`) y el acceso está restringido: requiere aceptar condiciones en HuggingFace. En el momento de la consulta registra 0 descargas y 0 me gusta, lo que indica que no ha sido validado por la comunidad.

Su relevancia es, por tanto, experimental y de reproducibilidad: puede servir para estudiar adaptaciones LoRA sobre Gemma 2 2B y para comparar estrategias de ajuste en italiano, pero no dispone de información pública suficiente para justificar un uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only `google/gemma-2-2b`; la arquitectura interna del modelo base no se detalla en la información disponible |
| Parámetros totales | No disponibles para el adaptador; el modelo base es de tamaño 2B nominal según el identificador. El repositorio ocupa 0,1 GB |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; viene determinada por el modelo base |
| Tipos de cuantización | No especificados; el adaptador se distribuye en safetensors y la cuantización se aplicaría al modelo base tras la fusión |
| Idiomas soportados | Italiano (`it`), único idioma declarado |
| Licencia | No disponible; acceso restringido y sujeto a las condiciones del modelo base |
| Formato de pesos | safetensors (pesos de adaptador LoRA/PEFT) |
| Librería | `peft` |
| Tamaño del repositorio | 0,1 GB |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Descargas / me gusta | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, una técnica de ajuste eficiente que congela los pesos del modelo base e introduce matrices de baja dimensión en determinadas capas. El repositorio solo contiene los pesos del adaptador en safetensors, no el modelo completo. No se especifican en la información disponible el rango (`r`), el valor de `alpha`, los módulos objetivo ni la precisión de entrenamiento. Tampoco se documenta si el adaptador se ha fusionado con el base o si se distribuye únicamente para carga dinámica mediante PEFT.

Las etiquetas indican la estrategia `strategy-raft` y el dataset `dataset-fiven`, pero no se proporciona composición del corpus, número de tokens, secuencia de entrenamiento, uso de RLHF/DPO ni hiperparámetros. El significado exacto de `or2` no está documentado. No se ha localizado un artículo, informe técnico o entrada de blog que describa el entrenamiento. La única innovación identificable es el propio uso de LoRA para adaptar un modelo de 2B en un contexto de benchmark de modelos pequeños; no hay innovaciones arquitectónicas declaradas.

## Capacidades

- Generación de texto en italiano, condicionada por el modelo base y por el ajuste del adaptador.
- El modelo base declarado es la variante base `google/gemma-2-2b`, no una variante instruct; no se documenta un ajuste específico para seguir instrucciones.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte para agentes, planificación multi-paso ni razonamiento extendido.
- No se documenta capacidad multilingüe más allá del italiano declarado.
- No se documentan capacidades de visión, audio, modo thinking ni decodificación especulativa.
- El adaptador está orientado, por su nombre y etiquetas, a experimentos de benchmark de modelos pequeños, no a uso general.

## Casos de uso

- Reproducción de experimentos de benchmark de modelos pequeños: el adaptador permite replicar la configuración `benchmark-slm` sobre Gemma 2 2B y comparar los resultados con otras variantes del mismo benchmark, siempre que se disponga del dataset Fiven y del procedimiento original.
- Estudio de LoRA y RAFT en italiano: investigadores interesados en ajuste eficiente pueden analizar cómo un adaptador de bajo rango modifica el comportamiento de Gemma 2 2B en un corpus italiano, aunque deberán documentar por su cuenta la configuración exacta.
- Evaluación comparativa de adaptadores: al compartir el mismo modelo base, este adaptador puede emplearse como una de varias ramas en un estudio controlado sobre estrategias de ajuste, manteniendo constante el base y variando únicamente los pesos LoRA.
- Pruebas de fusión y cuantización: sirve para medir la degradación que introduce la fusión del adaptador con el base y su posterior conversión a GGUF o a formatos de 8 y 4 bits en un pipeline de validación.
- Docencia y formación en PEFT: es un ejemplo real, aunque poco documentado, de artefacto LoRA sobre un modelo abierto, útil para prácticas de carga con `transformers` y `peft`, inspección de pesos y comparación de configuraciones.
- Auditoría de reproducibilidad: permite estudiar cómo se publican artefactos restringidos sin model card ni licencia explícita, y sirve como caso de análisis para políticas de publicación de adaptadores en HuggingFace.
- Generación de texto en italiano en entorno controlado: puede utilizarse en experimentos de laboratorio con prompts en italiano, pero no se recomienda su despliegue en atención al cliente ni en producción sin una evaluación previa de calidad, sesgos y seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco se incluyen métricas de MMLU, HumanEval, GSM8K, evaluaciones en italiano ni comparaciones con otros adaptadores. No es posible atribuir cifras de rendimiento al adaptador sin una evaluación propia.

## Requisitos de hardware

- El adaptador ocupa 0,1 GB; el coste real de inferencia lo determina el modelo base `google/gemma-2-2b`, de 2B nominales.
- Estimación orientativa para el base en FP16: aproximadamente 4-5 GB de pesos, más memoria para caché KV y activaciones; no verificada en la información disponible.
- Estimación orientativa en 8 bits: aproximadamente 2-3 GB; en 4 bits: aproximadamente 1,5-2 GB. Son cálculos a partir del tamaño nominal, no mediciones publicadas.
- Cabe en GPU de consumo como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090; no requiere A100 ni H100 para inferencia básica.
- Despliegue posible con `transformers` + `peft` para cargar el adaptador, con vLLM si se soporta LoRA sobre el base, o tras fusión y conversión a GGUF con llama.cpp u Ollama. TGI es otra opción si se configura el adaptador sobre el base.
- No se dispone de datos de latencia ni de throughput. El acceso restringido exige autenticación con un token de HuggingFace que tenga permisos sobre el repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (`benchmark-slm-fiven-gemma-2-2b-raft`) | No declarados; adaptador LoRA sobre base de 2B nominal | No disponible | Sin benchmarks publicados | No disponible | Restringido (gated), 0 descargas |
| `google/gemma-2-2b` (modelo base) | 2B nominal según el identificador | No disponible en la información proporcionada | No disponible | No disponible | Público en HuggingFace, no verificado en esta ficha |
| Otros adaptadores LoRA para Gemma 2 2B | No disponible | No disponible | No disponible | No disponible | No identificados en la información proporcionada |

No se han identificado en la información proporcionada alternativas públicas directamente comparables con documentación verificable. La comparación con el modelo base es estructural, no de rendimiento.

## Limitaciones y advertencias

- Ausencia de model card: no se documentan datos de entrenamiento, hiperparámetros, evaluación ni limitaciones conocidas.
- Licencia no disponible: no puede determinarse si el uso comercial está permitido; además, el artefacto deriva de un modelo base con sus propias condiciones de uso, que no se verifican aquí.
- Acceso restringido: requiere aceptar condiciones y autenticarse, lo que dificulta la reproducibilidad y la auditoría independiente.
- Idiomas limitados: solo se declara italiano; no hay evidencia de calidad en castellano ni en otros idiomas.
- Sin validación comunitaria: 0 descargas y 0 me gusta en el momento de la consulta; no hay informes de terceros sobre su comportamiento.
- Riesgo de alucinación y sesgos heredados: al ser un adaptador sobre Gemma 2 2B, puede reproducir sesgos y errores del base, y el ajuste con un dataset no documentado puede introducir sesgos adicionales.
- Posible sobreajuste al benchmark: el nombre sugiere un entrenamiento orientado a una evaluación concreta; los resultados podrían no generalizar fuera de ese conjunto.
- Contaminación de benchmark: no se puede descartar que el dataset Fiven comparta ejemplos con pruebas de evaluación, dado que no se publica su composición.
- Compatibilidad de revisiones: no se indica la revisión exacta del modelo base; cargar el adaptador sobre una revisión distinta puede degradar el comportamiento o fallar.
- Riesgo en fusión y cuantización: la conversión a GGUF o a 4 bits sin evaluación puede alterar la calidad; no hay métricas que cuantifiquen esa pérdida.
- No apto para producción: la falta de documentación, licencia y benchmarks desaconseja su uso en sistemas reales sin una evaluación exhaustiva y una revisión legal.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-gemma-2-2b-raft
- Modelo base referenciado: https://huggingface.co/google/gemma-2-2b
- No se han encontrado enlaces relevantes en la búsqueda web proporcionada; los resultados devueltos corresponden a páginas de LinkedIn sin relación con el modelo. No se dispone de paper, blog, repositorio de código ni demo adicionales.
