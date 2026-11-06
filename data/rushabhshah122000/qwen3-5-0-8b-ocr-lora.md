# RushabhShah122000/qwen3.5-0.8b-ocr-lora

## Resumen

`RushabhShah122000/qwen3.5-0.8b-ocr-lora` es un adaptador LoRA de ajuste fino (fine-tuning) publicado en Hugging Face por el usuario RushabhShah122000, derivado del modelo base `unsloth/Qwen3.5-0.8B`. El nombre sugiere una especializacion en tareas de reconocimiento optico de caracteres (OCR), aunque la model card no documenta el dataset de entrenamiento ni el objetivo concreto del ajuste. El repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con un adaptador LoRA y no con un modelo completo.

El modelo hereda la arquitectura y el tamano del Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,8 mil millones de parametros. Al tratarse de un LoRA, los pesos publicados son los del adaptador, que debe combinarse con el modelo base `unsloth/Qwen3.5-0.8B` para su uso. La licencia declarada es Apache 2.0, tanto en el adaptador como presumiblemente en el modelo base.

La relevancia de esta ficha es limitada pero practica: sirve como ejemplo de flujo de trabajo de ajuste fino eficiente con Unsloth y TRL sobre un modelo pequeno, y como punto de partida para quien quiera reproducir o evaluar un adaptador OCR de bajo coste. No obstante, la ausencia de benchmarks, de descripcion del dataset y de instrucciones de uso hace que no sea recomendable para produccion sin una evaluacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B); adaptador LoRA sobre el modelo base |
| Parametros totales | Aproximadamente 0,8 mil millones (modelo base); el adaptador LoRA anade un numero reducido de parametros entrenables (no disponible el detalle) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | No disponible; el repositorio contiene safetensors del adaptador. El modelo base admite las cuantizaciones habituales (GGUF, AWQ, etc.) segun su propio repositorio |
| Idiomas soportados | Ingles (`en`) segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA); requiere el modelo base para inferencia |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `unsloth/Qwen3.5-0.8B`, un transformer decoder-only de la familia Qwen3.5 con aproximadamente 0,8 mil millones de parametros. El ajuste fino se realizo con las librerias Unsloth y TRL, segun las etiquetas y la propia model card, que indica que el entrenamiento fue "2x faster with Unsloth". No se especifica el rango del LoRA, el numero de pasos, la tasa de aprendizaje ni la composicion del dataset; el nombre del repositorio sugiere un corpus orientado a OCR, pero no hay confirmacion documental.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la presencia de RLHF o DPO, ni innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). Cualquier afirmacion al respecto seria especulativa. La unica innovacion documentada es el uso de Unsloth para acelerar el entrenamiento del adaptador.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Qwen3.5-0.8B.
- Presunta especializacion en tareas de OCR (reconocimiento de texto en imagenes) segun el nombre del repositorio, aunque no se documenta el formato de entrada ni el pipeline exacto.
- Soporte de tool calling y function calling: no confirmado para este adaptador; depende del modelo base.
- Soporte de agentes y razonamiento multi-paso: no confirmado para este adaptador.
- Capacidades multilingues: limitadas al ingles segun la model card, aunque el modelo base podria tener un alcance mayor.
- Capacidades especiales (thinking mode, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Extraccion de texto de documentos escaneados en ingles: el adaptador podria emplearse para convertir imagenes de facturas, recibos o formularios en texto estructurado, siempre que se valide su calidad con un conjunto de prueba propio.
- Digitalizacion de archivos historicos: util para proyectos de bajo presupuesto que necesiten un modelo pequeno ejecutable en CPU o GPU consumer, aunque la falta de benchmarks obliga a una evaluacion previa.
- Preprocesamiento en pipelines de NLP: como paso intermedio para convertir documentos en texto antes de tareas de clasificacion o busqueda semantica.
- Prototipado de asistentes de lectura de documentos: gracias al tamano reducido del modelo base, se puede desplegar en entornos con recursos limitados para pruebas de concepto.
- Educacion e investigacion: como ejemplo reproducible de ajuste fino con Unsloth y TRL sobre un modelo pequeno, util para cursos o experimentos de bajo coste.
- Filtrado y moderacion de contenido basado en texto extraido de imagenes: en combinacion con el modelo base para tareas de clasificacion posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8B en precision completa (fp16) requiere aproximadamente 1,6 GB de VRAM; en cuantizacion de 8 bits, alrededor de 0,8 GB; en 4 bits, aproximadamente 0,4-0,5 GB. El adaptador LoRA anade una sobrecarga minima.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, incluidas RTX 3060, RTX 4060, RTX 4090; tambien es viable en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF; vLLM y TGI para despliegues con mayor throughput (previa fusion).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RushabhShah122000/qwen3.5-0.8b-ocr-lora | ~0,8B (base) + LoRA | No disponible | Apache 2.0 | Hugging Face | Adaptador OCR no documentado |
| unsloth/Qwen3.5-0.8B | ~0,8B | No disponible | Apache 2.0 (presumible) | Hugging Face | Modelo base sin especializar |
| Qwen2.5-0.5B / 1.5B (familia Qwen) | 0,5B / 1,5B | 32K (segun version) | Apache 2.0 | Hugging Face | Alternativas de tamano similar con documentacion completa |
| SmolVLM-256M / 500M (si se busca OCR multimodal) | 0,25B / 0,5B | No disponible | Apache 2.0 | Hugging Face | Modelos vision-lenguaje pequenos para tareas de imagen |

La comparativa es orientativa: no se dispone de datos de rendimiento del adaptador, por lo que la eleccion frente a alternativas debe basarse en una evaluacion empirica propia.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de descripcion del dataset: no es posible verificar la calidad del ajuste ni su comportamiento en dominios distintos al de entrenamiento.
- Riesgo de alucinacion: como cualquier modelo generativo de 0,8B, puede inventar texto no presente en la imagen de entrada.
- Limitacion idiomatica: la model card declara solo ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base, cuya licencia debe verificarse por separado.
- Caveat de produccion: al ser un LoRA sin documentacion, se recomienda fusionarlo con el modelo base, evaluarlo en un conjunto de validacion propio y monitorizar la tasa de error antes de desplegarlo.
- Sesgos: no documentados; se heredan los del modelo base y los del corpus de ajuste, que se desconoce.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/RushabhShah122000/qwen3.5-0.8b-ocr-lora
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (repositorio): https://github.com/huggingface/trl
