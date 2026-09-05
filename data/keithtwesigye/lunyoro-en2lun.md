# keithtwesigye/lunyoro-en2lun

## Resumen

El modelo `keithtwesigye/lunyoro-en2lun` es un sistema de traducción automática neuronal especializado en la dirección inglés → lunyoro/rutooro, una lengua bantú hablada en el oeste de Uganda por los reinos de Bunyoro-Kitara y Tooro. Fue desarrollado por Keith Twesigye y se ofrece como un fine-tune del modelo `Helsinki-NLP/opus-mt-en-mul` de MarianMT, con el objetivo de cubrir una lengua de bajo recurso con escasa representación en los sistemas comerciales de traducción.

Con aproximadamente 77 millones de parámetros, se trata de un modelo compacto y ligero, diseñado para su ejecución en hardware modesto. El proyecto incluye además variantes para la traducción inversa y una versión basada en NLLB-200, todas publicadas bajo licencia MIT, lo que facilita su integración en aplicaciones educativas, culturales y de acceso a la información.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT) |
| Parametros totales | 77.026.926 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés), rw (lunyoro/rutooro) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura MarianMT, un transformer encoder-decoder desarrollado por Helsinki-NLP dentro del proyecto OPUS-MT. Se realizó un fine-tune del modelo multilingüe `opus-mt-en-mul` sobre un corpus paralelo de aproximadamente 53.948 pares de oraciones inglés-lunyoro. El entrenamiento se llevó a cabo durante 10 épocas, utilizando el optimizador AdamW y un programador de tasa de aprendizaje con decaimiento coseno. El hardware empleado fue una GPU NVIDIA con soporte CUDA, aunque no se especifica el modelo concreto.

Los datos de entrenamiento se compilaron a partir de varias fuentes: aportaciones de hablantes nativos mediante crowdsourcing, entradas de diccionarios runyoro-rutooro en formato Excel, corpus de oraciones paralelas y aumentación mediante back-translation. Todo el conjunto de datos fue sometido a filtros de calidad, con el fin de reducir el ruido y mejorar la coherencia de las traducciones.

## Capacidades

- Traducción automática de texto desde inglés hacia lunyoro/rutooro.
- Generación de traducciones con decodificación por haces (beam search), configurable por el usuario.
- Uso directo a través de la API de Hugging Face Transformers, con tokenizer y modelo precargados.
- Acepta texto con truncamiento automático para adaptarse a entradas largas, aunque no se especifica el límite exacto de contexto.
- No soporta tool calling ni function calling, ni tampoco capacidades de agente o razonamiento multi-paso.

## Casos de uso

- Preservación y documentación lingüística: investigadores y lingüistas pueden emplear el modelo para traducir textos históricos o narrativas orales del inglés al lunyoro, facilitando la conservación de la lengua.
- Materiales educativos bilingües: profesores en escuelas de Uganda pueden generar versiones en lunyoro de ejercicios y lecturas originalmente en inglés, mejorando el acceso al currículo en lengua materna.
- Acceso a información sanitaria: organizaciones no gubernamentales pueden traducir folletos y avisos médicos al lunyoro para llegar a comunidades rurales del oeste de Uganda.
- Traducción de contenido cultural: productores de contenidos audiovisuales pueden subtitular documentales o series en lunyoro, ampliando la audiencia local y la difusión cultural.
- Atención al cliente bilingüe: pequeñas empresas o servicios públicos con base en Uganda pueden traducir consultas de clientes que escriben en inglés, generando respuestas en lunyoro para personal local.
- Apoyo a la traducción inversa: combinado con el modelo `lunyoro-lun2en`, permite crear un flujo de traducción bidireccional para sistemas de intercambio de información entre comunidades anglófonas y hablantes de lunyoro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 300 MB en precisión float32; en precisiones reducidas la demanda será menor, aunque no se especifican cuantizaciones disponibles.
- GPU recomendada: cualquiera con al menos 2 GB de VRAM es suficiente. También se puede ejecutar en CPU, dado el tamaño del modelo.
- Es viable en GPU de consumo, como las series GTX 10 o RTX 20, sin necesidad de hardware de centro de datos.
- Opciones de despliegue: Hugging Face Transformers, tanto en Python como en pipelines de inferencia por lotes. No se proporciona información sobre compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Direccion | Parametros | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| keithtwesigye/lunyoro-en2lun | en → lunyoro | 77 M | MarianMT | MIT | Hugging Face |
| keithtwesigye/lunyoro-lun2en | lunyoro → en | no disponible | MarianMT | MIT | Hugging Face |
| keithtwesigye/lunyoro-nllb_en2lun | en → lunyoro | no disponible | NLLB-200 | MIT | Hugging Face |
| Helsinki-NLP/opus-mt-en-mul | en → multi | no disponible | MarianMT | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo, ya que no se han publicado resultados de evaluación para estos modelos.

## Limitaciones y advertencias

- El modelo fue entrenado con un corpus de alrededor de 54.000 pares de oraciones, lo que es limitado para una lengua de bajo recurso. Es probable que falle en dominios técnicos, jurídicos o científicos.
- No se han publicado evaluaciones de sesgos. Al estar entrenado con datos de crowdsourcing y diccionarios, puede reflejar sesgos dialectales o regionales dentro del área lunyoro-rutooro.
- Riesgo de alucinaciones, especialmente en construcciones gramaticales complejas o términos poco frecuentes.
- La longitud de contexto no está documentada, por lo que en entradas largas puede producirse truncamiento no controlado.
- La licencia MIT permite uso comercial, pero el modelo no incluye garantías de calidad ni soporte técnico.
- No se especifica si el modelo ha sido probado en producción ni se documentan casos de uso reales más allá del repositorio fuente.

## Enlaces

- Modelo en Hugging Face: [keithtwesigye/lunyoro-en2lun](https://huggingface.co/keithtwesigye/lunyoro-en2lun)
- Modelo relacionado lunyoro-lun2en: [keithtwesigye/lunyoro-lun2en](https://huggingface.co/keithtwesigye/lunyoro-lun2en)
- Modelo relacionado NLLB en2lun: [keithtwesigye/lunyoro-nllb_en2lun](https://huggingface.co/keithtwesigye/lunyoro-nllb_en2lun)
- Repositorio del proyecto TRANSLATOR: [K227-arch/TRANSLATOR](https://github.com/K227-arch/TRANSLATOR)
- Documentación del traductor en GitHub: [README del proyecto](https://github.com/K227-arch/TRANSLATOR/blob/main/lunyoro-translator/README.md)
