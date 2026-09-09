# shibuina/drawvla-verify-smolvlm-256m-lora

## Resumen

El modelo `shibuina/drawvla-verify-smolvlm-256m-lora` es un adaptador LoRA construido sobre `HuggingFaceTB/SmolVLM-256M-Instruct`. Su función es actuar como validador de instrucciones de bocetos (DrawVLA-Verify): dado un entorno robótico en imagen donde un círculo marca el objeto de interés y una flecha indica el destino, junto con una leyenda sin nombres de objetos (por ejemplo, "put this there"), el modelo decide si la instrucción es correcta, coherente y suficiente, o si es incorrecta.

El adaptador ha sido desarrollado por `shibuina` y se ha entrenado sobre el conjunto de datos `shibuina/drawvla-prompt-validation`, compuesto por prompts sintéticos derivados de LIBERO con 14 modos de corrupción y distintas configuraciones de anclaje visual. El problema que resuelve es la validación automática de instrucciones en sistemas de manipulación robótica, donde las anotaciones generadas a partir de marcaciones sobre imágenes suelen ser ambiguas o erróneas.

La arquitectura subyacente es la de SmolVLM-256M-Instruct, un modelo de visión-lenguaje ligero de Hugging Face. El adaptador LoRA solo modifica una fracción de los pesos mediante proyecciones de bajo rango. La longitud de contexto del modelo base no se especifica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre SmolVLM-256M-Instruct (modelo de vision-lenguaje) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adapter_model.safetensors) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA con rango r=16, alpha=32 y dropout 0.05, aplicado a todas las proyecciones de atención y MLP del modelo base SmolVLM-256M-Instruct. Se entrenó durante 3 épocas con una tasa de aprendizaje de 1e-4, programación coseno, un 3 % de warmup y semilla 17. El conjunto de datos de entrenamiento son prompts sintéticos basados en LIBERO, con 14 modos de corrupción y configuraciones de anclaje visual que simulan errores en la marcación del objeto o del destino.

El propósito del entrenamiento es aprender a discriminar si una instrucción con marcaciones visuales es válida. La inferencia debe realizarse mediante la log-verosimilitud del span de etiqueta entre `verdict: right` y `verdict: wrong`, tal como se describe en el repositorio DrawVLA. Si se utiliza un prompt de sistema o una puntuación de siguiente token sin ese formato, el rendimiento se degrada aproximadamente a la mitad.

## Capacidades

- Validación de instrucciones de bocetos en entornos robóticos: distingue si una instrucción es correcta o incorrecta a partir de una imagen con círculo y flecha.
- Clasificación de prompts en datasets de instrucciones: etiqueta automáticamente si una instrucción anotada es coherente y suficiente.
- Compatible con el pipeline de Hugging Face `image-text-to-text`, usando un adaptador PEFT.
- Integrable en flujos de trabajo de robótica como verificador previo a la ejecución de una tarea.
- Soporta puntuación por log-verosimilitud de span, lo que permite obtener márgenes de decisión más fiables que la generación libre de texto.
- No se especifican capacidades de tool calling, funciones de agente, razonamiento multi-paso ni soporte multilingüe en la información disponible.

## Casos de uso

- Verificación previa a la ejecución en manipulación robótica: un sistema genera una instrucción a partir de un boceto y el adaptador comprueba si el objeto y el destino marcados son coherentes con el texto. Así se evita ejecutar órdenes ambiguas o inconsistentes.
- Control de calidad en la generación de datasets sintéticos de instrucciones: el modelo puede filtrar prompts corruptos producidos por pipelines automáticos, seleccionando solo aquellos que superan la validación.
- Asistente de teleoperación para usuarios no expertos: el usuario dibuja un círculo sobre el objeto y una flecha sobre el destino en una imagen de la escena; el adaptador confirma si la orden "put this there" es unívoca y correcta antes de enviarla al robot.
- Programación por demostración: en sistemas donde un operador anota imágenes con marcaciones, el validador sirve como paso de comprobación para rechazar demostraciones mal anotadas.
- Evaluación de candidatos en sistemas de generación de instrucciones: si un modelo propone varias órdenes para una misma escena, el adaptador puede puntuar cada opción y seleccionar la que tenga mayor verosimilitud de ser válida.
- Formación de datos para modelos de política VLA (vision-language-action): el adaptador puede etiquetar automáticamente si una instrucción de entrenamiento es válida, reduciendo la necesidad de revisión manual en grandes volúmenes de datos.

## Benchmarks y rendimiento

Según la model card, el adaptador fue evaluado sobre un split de test sintético hold-out de 3 966 filas, donde la clase positiva corresponde a prompts válidos. Los resultados son los siguientes:

| Metrica | Valor |
|---|---|
| Accuracy | 0.885 |
| Balanced accuracy | 0.830 |
| Macro-F1 | 0.844 |
| MCC | 0.691 |
| AUROC | 0.943 |
| Recall en invalidos | 0.944 |
| Recall en validos | 0.717 |

En la misma evaluación, un clasificador basado únicamente en geometría alcanza una accuracy de 0.932. La model card advierte que el benchmark sintético es en gran parte separable a partir de las coordenadas del boceto, por lo que se recomienda considerar los números con bocetos humanos como la estimación real de despliegue, aunque tales valores no se han publicado en la información disponible.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware en la información disponible.
- El modelo base, SmolVLM-256M-Instruct, es un modelo de visión-lenguaje ligero diseñado para aplicaciones en dispositivos, por lo que el adaptador LoRA no añade un coste computacional elevado.
- Dado el tamaño del modelo base, se espera que sea posible ejecutarlo en GPUs de consumo o en hardware edge, aunque no se aportan cifras concretas de VRAM.
- Las opciones de despliegue indicadas en la documentación son Hugging Face Transformers junto con la librería PEFT. No se han encontrado configuraciones específicas para vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

No se dispone de información sobre alternativas de la misma categoría en la información proporcionada. La referencia más cercana es el modelo base `HuggingFaceTB/SmolVLM-256M-Instruct`, que no incluye la capacidad de validación de instrucciones de bocetos al estar sin adaptar. Un adaptador LoRA similar para la misma tarea no aparece en los resultados de la búsqueda.

| Modelo | Parametros | Contexto | Tarea de validacion de bocetos | Licencia |
|---|---|---|---|---|
| shibuina/drawvla-verify-smolvlm-256m-lora | no disponible (adaptador) | no disponible | Si | Apache 2.0 |
| HuggingFaceTB/SmolVLM-256M-Instruct | 256M | no disponible | No | Apache 2.0 |

## Limitaciones y advertencias

- El adaptador se entrenó con datos sintéticos basados en LIBERO y la model card advierte que el benchmark sintético es altamente separable por geometría, por lo que su rendimiento en bocetos humanos reales puede ser inferior.
- Los resultados con bocetos humanos, que la model card señala como la estimación de despliegue, no están publicados en la información disponible.
- La inferencia debe realizarse siguiendo el formato de puntuación descrito en el repositorio DrawVLA; cualquier variación en el prompt reduce sustancialmente los márgenes de decisión.
- El modelo no está pensado para la generación libre de texto ni para responder preguntas de forma conversacional, sino para clasificar instrucciones mediante log-verosimilitud de span.
- No se proporcionan datos sobre sesgos conocidos, aunque al tratarse de un conjunto sintético es probable que no generalice a escenas reales ni a estilos de dibujo diversos.
- El repositorio tiene un tamaño de 0.0 GB, cero descargas y cero likes en el momento de la consulta, lo que indica que se trata de un proyecto en fase temprana sin mantenimiento documentado.
- La licencia Apache 2.0 permite el uso comercial, pero la integración en producción requiere validación adicional en escenarios reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shibuina/drawvla-verify-smolvlm-256m-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/shibuina/drawvla-prompt-validation
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM-256M-Instruct
