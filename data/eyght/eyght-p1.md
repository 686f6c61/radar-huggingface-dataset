# Eyght/eyght-p1

## Resumen

eyght-p1 es un ajuste fino (finetune) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario Eyght en HuggingFace bajo licencia Apache 2.0. El modelo se ha entrenado con GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo, según declara el propio autor en la model card a través de su model-index. La información pública disponible es muy limitada: no se documentan el dataset de entrenamiento, la composición de los datos, el número de tokens vistos ni los hiperparámetros del proceso de RL.

Por el conjunto de etiquetas asociadas (phone, edge, on-device, pocketpal), el modelo está orientado a inferencia en dispositivos de borde y telefonos moviles, presumiblemente en formato cuantizado, aunque no se publican pesos GGUF ni otras variantes comprimidas en el repositorio. La etiqueta pocketpal apunta a compatibilidad con la aplicación PocketPal AI para ejecución local en movil, si bien esto no se confirma en la documentación.

Con 1,5 mil millones de parametros heredados del modelo base, se trata de un modelo pequeno pensado para tareas de razonamiento ligero, generacion de codigo, uso como agente y soporte multilingue en nueve idiomas (ingles, chino, espanol, frances, aleman, japones, coreano, arabe e hindi). El acceso al repositorio esta restringido (gated), por lo que es necesario aceptar condiciones en HuggingFace antes de descargarlo. A fecha de la ficha, el modelo acumula 0 descargas y 1 like, y no se ha publicado ningun paper, blog tecnico ni evaluacion independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct); no se documentan modificaciones estructurales |
| Parametros totales | 1,5 mil millones (heredados del modelo base Qwen2.5-1.5B-Instruct) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del modelo. El modelo base Qwen2.5-1.5B-Instruct declara 32 768 tokens nativos; no se confirma que eyght-p1 los conserve |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados) |
| Idiomas soportados | Ingles (en), chino (zh), espanol (es), frances (fr), aleman (de), japones (ja), coreano (ko), arabe (ar), hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible de forma explicita; la libreria declarada es transformers, lo que sugiere safetensors, sin confirmar |
| Libreria | transformers |
| Pipeline | text-generation |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |

## Arquitectura y entrenamiento

La arquitectura no se describe en la informacion proporcionada mas alla del modelo base, Qwen/Qwen2.5-1.5B-Instruct, del que eyght-p1 es un finetune. Qwen2.5-1.5B-Instruct es un transformer decoder-only de 1,5 mil millones de parametros con atencion causal. No hay indicios de que eyght-p1 introduzca cambios arquitectonicos (no se mencionan MoE, SSM, atencion lineal ni decodificacion especulativa).

En cuanto al entrenamiento, el unico dato disponible es que se empleo GRPO (Group Relative Policy Optimization), un algoritmo de aprendizaje por refuerzo con optimizacion de politica relativa a grupos, y que el model-index declara 100 pasos de GRPO con una metrica de "mejora de recompensa" de valor 100. Este resultado esta marcado como no verificado (verified: false) y no es una metrica de capacidad del modelo, sino un registro de progreso de entrenamiento. Se desconoce por completo la funcion de recompensa utilizada, el dataset de prompts, si hubo una fase previa de SFT/DPO, la composicion de datos y el numero total de tokens de entrenamiento.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base instruct.
- Razonamiento (tag reasoning) y resolucion de problemas de varios pasos, segun declara el autor.
- Generacion y asistencia con codigo (tag coding).
- Uso como agente (tag agent), presumiblemente con soporte de razonamiento multi-paso.
- Soporte multilingue en nueve idiomas: ingles, chino, espanol, frances, aleman, japones, coreano, arabe e hindi.
- Orientacion a despliegue en dispositivo (tags phone, edge, on-device, pocketpal), pensado para ejecucion local en hardware limitado.
- Enfoque en seguridad (tag safety) declarado por el autor; no se detalla la metodologia de alineamiento de seguridad.
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue en infraestructura de inferencia gestionada.
- Tool calling / function calling: no disponible en la informacion publicada. El tag agent sugiere capacidad agentica, pero no se documenta soporte explicito de llamadas a herramientas.
- Vision, audio y modo thinking explicito: no disponibles.

## Casos de uso

- Asistente conversacional en movil sin conexion: con 1,5 mil millones de parametros y cuantizacion de 4 bits, el modelo puede ejecutarse en un telefono de gama alta moderna, permitiendo un asistente local que no envia datos del usuario a la nube. Es el escenario que sugieren las etiquetas phone, on-device y pocketpal.
- Clasificacion y enrutado de intenciones en pipelines de agentes: por su tamano reducido y baja latencia, encaja como modelo enrutador que decide que herramienta o modelo mayor debe atender cada peticion en una arquitectura multiagente.
- Generacion de codigo asistida en entornos con recursos limitados: autocompletado de fragmentos, generacion de tests unitarios sencillos o explicacion de funciones, ejecutandose en portatiles sin GPU dedicada.
- Atencion al cliente automatizada en varios idiomas: el soporte declarado de nueve idiomas permite desplegar un unico modelo para conversaciones multi-turno en espanol, frances, aleman o arabe, con coste de inferencia muy bajo por peticion.
- Procesamiento de texto en el borde para aplicaciones industriales o de campo: analisis y resumen de notas o formularios en dispositivos sin conectividad estable (lectores de codigos, tablets rugerizadas, gateways IoT).
- Filtrado y moderacion de contenido previo: uso como primera linea de clasificacion de toxicidad o de deteccion de temas sensibles, derivando los casos ambiguos a un modelo mayor.
- Prototipado rapido de productos de IA generativa: por su licencia Apache 2.0 y su tamano, permite iterar sobre prompts y flujos de RLHF/GRPO a coste minimo antes de escalar a modelos de mayor tamano.
- Investigacion en aprendizaje por refuerzo: como caso de estudio reproducible de un ajuste GRPO sobre un modelo base pequeno, util para comparar recetas de RL.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor en el model-index son los siguientes. Se trata de una metrica de progreso de entrenamiento, no de una evaluacion de capacidades, y el autor la marca como no verificada.

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Generacion de texto | GRPO Reward Training (custom) | GRPO Steps (reward-improvement) | 100 | No |

No se han publicado resultados de benchmarks independientes (MMLU, HumanEval, GSM8K, MT-Bench u otros) en la informacion disponible.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones derivadas del numero de parametros (1,5 mil millones) y no han sido publicadas por el autor.

- Pesos en FP16/BF16: aproximadamente 3,1 GB solo para pesos; con cache KV y overhead de runtime, del orden de 4 a 5 GB de VRAM.
- Pesos en INT8: aproximadamente 1,6 GB de pesos; en torno a 2,5 GB con overhead.
- Pesos en Q4_K_M (GGUF): aproximadamente 1,0 a 1,1 GB; el modelo completo puede caber en 2 GB de memoria.
- GPU de consumo: cabe holgadamente en cualquier GPU con 6 GB o mas (RTX 3060, RTX 4060, RTX 2060, GTX 1660 con cuantizacion). En cuantizacion de 4 bits puede ejecutarse incluso en iGPU con memoria unificada.
- GPU de datacenter: A100, H100, L40S o A10G estan sobredimensionadas para un modelo de este tamano; el cuello de botella sera la latencia de red, no el computo.
- CPU: inferencia viable en CPU moderna con llama.cpp y cuantizacion de 4 bits, con velocidades del orden de decenas de tokens por segundo en procesadores de gama alta; no se dispone de mediciones oficiales.
- Despliegue: la libreria declarada es transformers. Se puede servir con vLLM o TGI si se conservan los pesos en safetensors, y con llama.cpp u Ollama si se convierte a GGUF. No se publican pesos GGUF ni cuantizaciones listas para usar, por lo que habria que generarlos.
- Latencia y throughput: no disponibles. No hay cifras publicadas de tokens por segundo ni de tiempo hasta el primer token.
- Movil: las etiquetas phone, edge y pocketpal indican que el objetivo es ejecucion en telefono, presumiblemente mediante PocketPal AI y un GGUF de 4 bits; no se confirma ni se detalla el procedimiento.

## Comparativa con modelos similares

Los datos de las alternativas proceden de la documentacion publica de cada modelo, no de la busqueda web realizada, y se ofrecen como referencia de categoria. Los valores de rendimiento de eyght-p1 no estan disponibles.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| eyght-p1 | 1,5 B | No disponible | Apache 2.0 | Gated en HuggingFace; 0 descargas |
| Qwen2.5-1.5B-Instruct (modelo base) | 1,5 B | 32 768 tokens declarados por Qwen | Apache 2.0 | Abierto en HuggingFace |
| Llama 3.2 1B Instruct | 1,2 B | 128 000 tokens declarados | Licencia comunitaria Llama 3.2 | Abierto, con condiciones de uso |
| Gemma 2 2B IT | 2,6 B | 8 000 tokens declarados | Licencia Gemma | Abierto, con condiciones de uso |
| SmolLM2-1.7B-Instruct | 1,7 B | 8 000 tokens declarados | Apache 2.0 | Abierto en HuggingFace |

La ventaja diferencial de eyght-p1 respecto a su modelo base seria el ajuste con GRPO, pero al no haber evaluaciones publicadas ni datos de rendimiento comparables, no es posible verificar ninguna mejora. Frente a Llama 3.2 1B o Gemma 2 2B, ofrece una licencia permisiva Apache 2.0, a cambio de un acceso restringido y de una documentacion mucho menos completa.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated, por lo que la descarga y el uso requieren aceptar condiciones en HuggingFace, lo que complica la automatizacion de pipelines de CI/CD.
- Documentacion minima: no se detallan dataset, hiperparametros, funcion de recompensa, duracion del entrenamiento ni proceso de evaluacion. Es dificil reproducir o auditar el modelo.
- Benchmark no verificado: el unico resultado del model-index (100 pasos de GRPO) esta marcado como verified: false y no mide capacidades reales.
- Riesgo de alucinacion: con 1,5 mil millones de parametros, la tasa de invencion de hechos es alta en tareas de conocimiento abierto. No se recomienda su uso sin verificacion para dominios factuales, medicos, legales o financieros.
- Capacidad limitada de razonamiento complejo: el tamano del modelo restringe el rendimiento en matematicas avanzadas, razonamiento de multiples pasos y contextos largos, independientemente de las etiquetas declaradas.
- Idiomas: aunque se declaran nueve idiomas, no hay evaluaciones por idioma. El rendimiento en espanol, arabe o hindi puede ser notablemente inferior al de ingles o chino, idiomas dominantes en los datos de Qwen2.5.
- Contexto no confirmado: se desconoce si el ajuste con GRPO preservo la ventana de contexto del modelo base. Conviene verificarlo antes de disenar flujos con entradas largas.
- Sin tool calling documentado: el tag agent no garantiza soporte de function calling ni de protocolos de herramientas; habria que probarlo empiricamente.
- Adopcion nula: 0 descargas y 1 like. No hay evidencia de uso en produccion, issues resueltos ni soporte de la comunidad.
- Fechas de la ficha: la creacion y la actualizacion figuran como 13 de septiembre de 2026, fechas poco habituales; conviene verificar la vigencia del repositorio antes de integrarlo.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5-1.5B-Instruct conviene revisar los terminos del modelo base y las condiciones adicionales que se aceptan en el acceso gated.
- Uso comercial en produccion: para un despliegue real, un modelo de 1,5 B solo es recomendable en tareas acotadas (clasificacion, extraccion, enrutado, generacion asistida con revision humana), no como sustituto de modelos de mayor tamano en tareas abiertas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Eyght/eyght-p1
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Busqueda web realizada: no se han encontrado enlaces relevantes sobre el modelo. Los resultados devueltos corresponden a paginas de Credit Agricole (banco) y a un articulo de arXiv sobre diseno de interaccion con IA generativa (https://arxiv.org/html/2411.02662v1), sin relacion con eyght-p1.
- Paper, blog tecnico, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
