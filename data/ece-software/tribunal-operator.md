# ECE-Software/tribunal-operator

## Resumen

ECE-Software/tribunal-operator es un adaptador LoRA (PEFT) afinado sobre el modelo base ECE-Software/gemma-3-270m, una variante de la familia Gemma 3 con aproximadamente 270 millones de parametros. El autor lo publica bajo el nombre interno tribunal-operator-v11 y lo entrena mediante SFT (supervised fine-tuning) con la libreria TRL. El repositorio ocupa 0,1 GB, lo que es coherente con pesos de adaptador LoRA sobre una base de ese tamano y no con un modelo completo.

Se trata de un modelo muy pequeno y de proposito aparentemente especializado, orientado a generacion de texto conversacional segun su pipeline tag. La relevancia practica es limitada por el momento: cuenta con cero descargas y cero likes, no declara licencia ni idiomas, y no publica datos de entrenamiento ni resultados de benchmarks. Esto lo situa como un experimento o un componente interno mas que como un modelo listo para produccion.

La informacion disponible es escasa: la model card se limita a la plantilla autogenerada por TRL, con un ejemplo de uso generico y las versiones de framework. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los enlaces recuperados corresponden a una escuela de ingenieria francesa homonima (ECE) y no guardan relacion con este adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 3), con adaptador LoRA sobre el modelo base |
| Parametros totales | no disponible (base de aproximadamente 270 M de parametros; el adaptador anade una fraccion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (al ser un adaptador LoRA, la cuantizacion depende del modelo base y del backend) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin concretar) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado con PEFT 0.21.1 sobre el modelo base ECE-Software/gemma-3-270m, que pertenece a la familia Gemma 3 de Google. Al tratarse de un adaptador y no de un modelo completo, no reentrena la totalidad de los pesos: congela la base y aprende un conjunto reducido de matrices de bajo rango que se combinan con ella en inferencia. El entrenamiento se realizo con SFT (fine-tuning supervisado) usando TRL 1.14.1, Transformers 5.18.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.2.

No se proporciona informacion sobre el conjunto de datos de entrenamiento: no hay numero de tokens, composicion del dataset, idioma de las muestras ni si hubo etapas adicionales de RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica especifica (decodificacion especulativa, atencion lineal u otras). El unico detalle reproducible es la receta estandar de SFT con TRL para un adaptador LoRA de bajo rango.

## Capacidades

- Generacion de texto y respuestas conversacionales en formato de chat, segun el ejemplo de la model card (`pipeline("text-generation")` con mensajes con rol `user`).
- Capacidad multilingue: no disponible; no se declara el conjunto de idiomas.
- Razonamiento, codigo, matematicas, codigo de herramientas (tool calling), agentes y razonamiento multi-paso: no disponible; no se documenta ninguna de estas capacidades.
- Modo de razonamiento explicito (thinking), vision o audio: no disponible.
- Por el tamano de la base (aproximadamente 270 M de parametros), es previsible que las capacidades de razonamiento complejo, matematicas y codigo sean limitadas, aunque esto no se confirma con datos en la informacion disponible.

## Casos de uso

No se documentan casos de uso especificos por parte del autor. Dado el tamano y la naturaleza del adaptador, los escenarios realistas serian los siguientes, siempre entendidos como propuestas y no como capacidades verificadas:

- Clasificacion o etiquetado de texto ligero: por su tamano reducido, puede ejecutarse en entornos con recursos minimos para tareas acotadas de extraccion o categorizacion.
- Filtrado o moderacion de contenido: integrado en un pipeline previo a un modelo mayor, para descartar o reetiquetar solicitudes. El nombre "tribunal-operator" sugiere un rol de este tipo, aunque no se confirma.
- Asistente conversacional embebido en dispositivos de baja potencia: al derivar de una base de 270 M, puede desplegarse en CPU o GPU integrada para dialogos simples.
- Prototipado rapido de experimentos de fine-tuning: sirve como plantilla para evaluar tecnicas de SFT con TRL y PEFT sobre una base pequena.
- Generacion de texto acotada en aplicaciones locales (Ollama, llama.cpp) sin conexion a la nube.
- Investigacion sobre adaptadores de bajo rango: util para reproducir y comparar la receta de entrenamiento, dado que se publican las versiones exactas de framework.
- Preprocesado de lenguaje natural en pipelines de agentes: como paso intermedio de bajo coste antes de modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparativas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion propia a partir de una base de aproximadamente 270 M de parametros, no confirmada por el autor):
  - FP16/bf16: en torno a 540 MB solo de pesos, mas activaciones y overhead; aproximadamente 1-2 GB en total.
  - INT8: en torno a 270 MB de pesos.
  - INT4: en torno a 135 MB de pesos.
- GPU recomendadas: practicamente cualquier GPU moderna es suficiente; incluso una GPU integrada o una NVIDIA GTX 1050 Ti o superior puede ejecutar la base. GPU de datacenter (A100, H100) no son necesarias y estarian sobredimensionadas.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en CPU. Como referencia, una RTX 4090 o una RTX 3060 son mas que suficientes.
- Opciones de despliegue: transformers (con PEFT para cargar el adaptador), llama.cpp y Ollama (previa fusion del adaptador con la base y conversion a GGUF), vLLM y TGI. Para cargar el adaptador directamente se requiere la libreria PEFT y Transformers.
- Latencia y throughput estimados: no disponible; no se aportan mediciones. Por el tamano de la base, se espera una latencia baja, pero sin datos verificables.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que la comparativa es estructural y no de calidad.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ECE-Software/tribunal-operator | Adaptador sobre base de ~270 M | no disponible | no disponible | HuggingFace (0 descargas) |
| ECE-Software/gemma-3-270m (base) | ~270 M | no disponible | no disponible | HuggingFace |
| Familia Gemma 3 de Google | 270 M | segun el modelo base de Google | Gemma Terms of Use | HuggingFace, Ollama |
| Otros modelos ligeros de la categoria (por ejemplo, modelos de menos de 500 M) | < 500 M | variable | variable | HuggingFace, Ollama |

No se conocen comparativas de rendimiento publicadas entre este adaptador y alternativas de la misma categoria en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documenta ninguna evaluacion de sesgo ni auditoria.
- Riesgo de alucinacion: previsiblemente elevado por el tamano reducido de la base (~270 M), aunque no se cuantifica. Los modelos de este orden generan con frecuencia contenido incoherente o inventado.
- Limitaciones de contexto e idioma: no se especifican la ventana de contexto ni los idiomas soportados, por lo que no pueden garantizarse en produccion.
- Restricciones de licencia: la licencia figura como "no disponible". La model card indica "licence: license" sin detallar, de modo que no se puede confirmar el uso comercial. Ademas, al derivar de la familia Gemma 3, es probable que apliquen las condiciones de uso de Gemma, pero esto no se confirma en la informacion proporcionada.
- Caveats de produccion: no hay datos de entrenamiento, ni evaluacion, ni benchmarks, ni metricas de latencia. El modelo tiene cero descargas y cero likes, y una model card autogenerada por TRL sin contenido tecnico especifico. No se recomienda su uso en produccion sin una evaluacion previa propia.
- El nombre "tribunal-operator-v11" sugiere un proposito especializado, pero la documentacion no lo describe.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ECE-Software/tribunal-operator
- Modelo base: https://huggingface.co/ECE-Software/gemma-3-270m
- Repositorio de TRL: https://github.com/huggingface/trl
- Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo. Los enlaces recuperados (https://www.ece.fr/, https://fr.wikipedia.org/wiki/%C3%89cole_centrale_d%27%C3%A9lectronique, https://www.ece.asso.fr/, https://www.omneseducation.com/nos-etablissements/nos-ecoles/ece/) corresponden a una escuela de ingenieria francesa homonima y no guardan relacion con el adaptador. No se han encontrado papers, blogs ni demos asociados al modelo.
