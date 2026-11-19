# andkil/llm-course-hw3-dora

## Resumen

andkil/llm-course-hw3-dora es un modelo de generacion de texto publicado en Hugging Face por el usuario andkil, aparentemente como entrega de un trabajo practico de un curso sobre modelos de lenguaje (el identificador "llm-course-hw3" sugiere "homework 3"). El nombre incluye el termino "dora", que en el contexto del ajuste fino de modelos suele referirse a DoRA (Weight-Decomposed Low-Rank Adaptation), una variante de LoRA, aunque no se confirma en la documentacion disponible.

El modelo cuenta con 300.049.792 parametros (aproximadamente 300 millones) segun los datos reales de los pesos en formato safetensors, y el repositorio ocupa 1,2 GB. La etiqueta "mistral" en los metadatos apunta a que la arquitectura base es de tipo Mistral, probablemente un modelo pequeno de esa familia o una arquitectura inspirada en ella, ajustado o adaptado mediante DoRA.

La model card es la plantilla autogenerada de Hugging Face y no contiene informacion sustantiva: no se especifican datos de entrenamiento, licencia, idiomas, benchmarks ni procedencia. Se trata, por tanto, de un artefacto de caracter educativo o experimental, no de un modelo listo para produccion. Su relevancia es limitada fuera del contexto del curso para el que fue creado, y cualquier evaluacion tecnica debe hacerse con cautela ante la ausencia de documentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta "mistral" en metadatos; detalles no disponibles) |
| Parametros totales | 300.049.792 (~300 M) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion GGUF/otros no publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

Los metadatos incluyen la etiqueta "mistral", lo que sugiere una arquitectura transformer decoder-only de la familia Mistral, con un total de 300.049.792 parametros. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, cabezas de atencion, uso de GQA (grouped-query attention), ventana de contexto deslizante ni activacion SwiGLU, por lo que no es posible confirmar la configuracion exacta mas alla de la etiqueta de familia.

Respecto al entrenamiento, la model card no documenta nada: ni volumen de tokens, ni composicion del dataset, ni si hubo RLHF, DPO o ajuste supervisado. El sufijo "dora" del identificador apunta a que el modelo podria haberse obtenido mediante ajuste fino con DoRA (Weight-Decomposed Low-Rank Adaptation), una tecnica que descompone la actualizacion de pesos en magnitud y direccion para aproximarse mejor al comportamiento de un ajuste completo con menor coste. Esta hipotesis no esta confirmada por el autor. Tampoco se detalla si el modelo parte de un checkpoint preentrenado de Mistral o de un modelo base distinto.

## Capacidades

- Generacion de texto autoregresiva, segun el pipeline declarado (text-generation).
- Conversacion multi-turno: la etiqueta "conversational" sugiere soporte de formato de chat, aunque no se documenta la plantilla utilizada.
- Ajuste fino tipo DoRA (presunto, por el identificador): capacidad de adaptacion a tareas especificas, no una capacidad funcional del modelo en si.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o modo "thinking": no disponible.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponibles.
- Capacidades de codigo o matematicas: no documentadas ni evaluadas.

## Casos de uso

- Experimentacion educativa en cursos de LLM: el modelo sirve como ejemplo de ajuste fino con DoRA sobre una arquitectura tipo Mistral, util para comparar el efecto de la tecnica frente a LoRA estandar en un entorno controlado.
- Prototipado rapido en local: con 300 M de parametros, cabe en una GPU de consumo y permite iterar sobre prompts y plantillas de chat sin coste de API, siempre que se valide la calidad de las respuestas.
- Pruebas de integracion con transformers y text-generation-inference: al estar etiquetado como "endpoints_compatible", puede desplegarse en infraestructura de Hugging Face para validar pipelines de inferencia.
- Generacion de texto de dominio acotado tras un ajuste adicional: si el checkpoint base y los datos del curso estan disponibles, puede reajustarse para tareas concretas (clasificacion, resumen, respuesta a preguntas) con recursos modestos.
- Benchmarking de tecnicas de adaptacion: util como punto de comparacion en estudios sobre eficiencia de DoRA frente a ajuste completo en modelos pequenos.
- Docencia y demostraciones: adecuado para ilustrar el ciclo completo de publicacion de un modelo en el Hub (pesos, model card, metadatos) en asignaturas de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 0,6 GB solo para pesos (300 M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, menos de 2 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,3 GB para pesos; en 4 bits, unos 0,15 GB, aunque no se han publicado pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); tambien puede ejecutarse en CPU para inferencia de baja concurrencia.
- Cabe holgadamente en GPU de consumo: si, incluidas GPUs con 4-8 GB de VRAM e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta "text-generation-inference" y "endpoints_compatible"); llama.cpp u Ollama requeririan conversion a GGUF, no publicada.
- Latencia y throughput estimados: no disponibles; por tamano, se espera un throughput alto en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| andkil/llm-course-hw3-dora | ~300 M | no disponible | no disponible | Hugging Face | Model card vacia, sin benchmarks |
| Mistral-7B (referencia de familia) | 7,2 B | 32 K (v0.1) | Apache 2.0 | Hugging Face | Mucho mayor, con documentacion completa |
| Qwen2.5-0.5B | ~500 M | 32 K | Apache 2.0 | Hugging Face | Alternativa pequena documentada y evaluada |
| SmolLM2-360M | ~360 M | 8 K | Apache 2.0 | Hugging Face | Modelo pequeno con benchmarks publicados |

La comparacion es orientativa: el modelo de andkil carece de datos publicados de contexto, licencia y rendimiento, por lo que no puede equipararse en rigor a las alternativas citadas, que cuentan con model cards completas y evaluaciones reproducibles.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla autogenerada; no hay informacion sobre datos, sesgos, evaluacion ni uso previsto.
- Licencia no especificada: no puede asumirse uso comercial; debe contactarse con el autor o tratarse como no licenciado para produccion.
- Riesgo de alucinacion y respuestas de baja calidad: un modelo de 300 M sin evaluacion publicada no es fiable para tareas criticas.
- Idiomas y contexto desconocidos: no se puede garantizar soporte del castellano ni una ventana de contexto concreta.
- Procedencia incierta: se desconoce el checkpoint base y si los pesos derivan de un modelo con licencia compatible; verificar antes de redistribuir.
- Caracter educativo: el identificador sugiere un trabajo de curso; no debe tratarse como un modelo mantenido ni versionado.
- Sin pesos cuantizados ni artefactos de despliegue alternativos: limita su uso en entornos con restricciones de memoria o toolchains distintas de transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andkil/llm-course-hw3-dora
- Paper de referencia sobre impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact
- Repositorio, paper o demo del autor: no disponibles.
