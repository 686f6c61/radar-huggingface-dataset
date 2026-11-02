# fdsffjdkf/ClearTrans-3B-SFT-Cpp-to-Python

## Resumen

ClearTrans-3B-SFT-Cpp-to-Python es un checkpoint de ajuste fino supervisado (SFT) de direccion unica para traduccion de codigo de C++ a Python, construido sobre Qwen/Qwen2.5-Coder-3B. Lo publica el usuario fdsffjdkf como parte del artefacto ClearTrans, cuyo repositorio de implementacion y replicacion esta alojado en GitHub (Xingzhehu/ClearTrans). El modelo resuelve un problema acotado: convertir funciones o ficheros C++ en equivalentes Python preservando semantica, en lugar de generacion de codigo generica.

La arquitectura subyacente es la de Qwen2.5-Coder-3B, un transformer decoder-only denso de 3.085.938.688 parametros (aproximadamente 3,09 mil millones), con tokenizer y chat template heredados del modelo base. El repositorio ocupa 6,8 GB en safetensors y no incluye datos de entrenamiento, estados del optimizador ni salidas de evaluacion historicas. La model card advierte explicitamente de que se trata de una liberacion de pesos: se han validado el tamano de ficheros, el layout de tensores y los indices de shards, pero la inferencia en GPU y la reproduccion de benchmarks no han sido validadas para esta release.

Es relevante ahora porque cubre un nicho poco atendido por los modelos generalistas: la migracion automatizada de bases de codigo legacy en C++ hacia Python. Al estar especializado en una sola direccion, puede ofrecer una fidelidad semantica superior a la de un modelo generalista del mismo tamano, a costa de no ser reutilizable para otras tareas. Su licencia Qwen Research limita el uso comercial, lo que condiciona su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de Qwen2.5-Coder-3B; no confirmada en la model card) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors en precision original) |
| Idiomas soportados | No disponible (orientado a codigo fuente C++ y Python) |
| Licencia | Qwen Research License Agreement (no comercial; no relicenciado a MIT ni Apache-2.0) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-3B, un transformer decoder-only denso con atencion causal estandar y RoPE, sin mezcla de expertos ni mecanismos hibridos. El ajuste consiste en un SFT completo (full fine-tuning) sobre el checkpoint upstream, no en un adaptador LoRA ni en una fusion posterior. La metadata de entrenamiento registra Transformers 4.57.1 y PyTorch 2.9.1, un learning rate de 1e-05, scheduler coseno, optimizador adamw_torch_fused con betas (0,9; 0,999) y epsilon 1e-08, 3 epocas, semilla 42, batch total de 64 (batch por dispositivo 1, 8 dispositivos, 8 pasos de acumulacion de gradiente) y evaluacion con batch de 64 en configuracion multi-GPU de 8 dispositivos.

El dataset de entrenamiento se identifica como `train_full_1231_cpp2python_idx3`, especifico de la direccion C++ a Python, pero no se incluye en el repositorio ni se documenta su procedencia o composicion. La model card no menciona RLHF, DPO ni una etapa GRPO: indica que la metadata identifica la etapa como SFT y que no se establece que este sea un checkpoint final entrenado con GRPO. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. El tokenizer y el chat template se conservan del export de entrenamiento.

## Capacidades

- Traduccion de codigo C++ a Python en una unica direccion, incluyendo funciones, clases y construcciones idiomaticas del lenguaje origen.
- Generacion de texto y codigo en formato conversacional, con chat template incluido en el repositorio.
- Comprension de codigo fuente C++ como entrada, incluyendo tipos, punteros, plantillas y manejo de memoria.
- Produccion de codigo Python equivalente, potencialmente con uso de bibliotecas estandar y construcciones propias del lenguaje destino.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del codigo fuente; los idiomas naturales soportados figuran como no disponibles.
- No se documentan capacidades de vision, audio ni modo de pensamiento extendido.

## Casos de uso

- Migracion de utilidades legacy: traducir funciones C++ autocontenidas (parseadores, utilidades de cadena, calculos numericos) a Python para integrarlas en un servicio moderno, aprovechando la especializacion del modelo en la direccion C++ a Python.
- Portado de bibliotecas internas: convertir modulos C++ de una base de codigo propietaria a Python como primer borrador, que despues se revisa y se cubre con tests unitarios antes de fusionar.
- Generacion de bindings y stubs: producir implementaciones Python de referencia a partir de cabeceras C++ para documentar APIs o construir capas de compatibilidad.
- Educacion y documentacion tecnica: generar ejemplos Python equivalentes a fragmentos C++ para tutoriales, comparativas de paradigma o materiales de formacion interna.
- Prototipado rapido: obtener una version Python funcional de un algoritmo C++ para experimentar con bibliotecas cientificas (NumPy, pandas) antes de decidir si se reescribe a mano.
- Analisis de deuda tecnica: traducir fragmentos C++ a Python para comparar comportamiento y detectar diferencias semanticas entre implementaciones durante una auditoria de codigo.
- Pipeline de modernizacion asistida: integrar el modelo como paso de un flujo que extrae funciones C++, solicita la traduccion y ejecuta tests diferenciales contra la implementacion original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se atribuye a este checkpoint ninguna puntuacion de benchmark del manuscrito asociado y que la reproduccion de benchmarks no ha sido validada para esta release.

## Requisitos de hardware

- VRAM estimada para inferencia en precision original (bf16/fp16): aproximadamente 6,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 8 y 12 GB segun longitud de contexto y batch.
- VRAM estimada en cuantizacion de 8 bits: en torno a 3,5-4 GB de pesos; en 4 bits, en torno a 2-2,5 GB, aunque no se publican ficheros GGUF ni cuantizaciones oficiales.
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion con concurrencia; RTX 4090, RTX 3090 o RTX A6000 para inferencia individual en precision original.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16/fp16 (por ejemplo RTX 3060 Ti de 8 GB con contexto corto, RTX 4070, RTX 4080, RTX 4090), y en tarjetas de 6 GB solo con cuantizacion.
- Opciones de despliegue: transformers (version compatible con la usada en entrenamiento, 4.57.1), text-generation-inference (el tag `text-generation-inference` esta presente), vLLM y llama.cpp/Ollama previa conversion a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles; la model card no reporta mediciones y advierte de que la inferencia en GPU no ha sido validada para esta release.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClearTrans-3B-SFT-Cpp-to-Python | 3,09 B | No disponible | Traduccion C++ a Python (SFT) | Qwen Research (no comercial) | Pesos safetensors en HF |
| Qwen2.5-Coder-3B | 3,09 B | No disponible en esta ficha | Generacion de codigo generalista | Qwen Research / Apache-2.0 segun variante | Pesos safetensors y GGUF en HF |
| Qwen2.5-Coder-7B | No disponible en esta ficha | No disponible en esta ficha | Generacion de codigo generalista | Qwen Research / Apache-2.0 segun variante | Pesos safetensors y GGUF en HF |
| CodeLlama-7B | No disponible en esta ficha | No disponible en esta ficha | Generacion de codigo generalista | Llama 2 Community License | Pesos safetensors y GGUF en HF |

La comparacion relevante es contra su propio modelo base: ClearTrans-3B sacrifica generalidad por especializacion en una direccion de traduccion, mantiene el mismo numero de parametros y hereda las limitaciones de contexto del upstream. Frente a alternativas generalistas de mayor tamano como Qwen2.5-Coder-7B o CodeLlama-7B, ofrece menor huella de memoria pero no se han publicado datos que permitan comparar calidad de traduccion C++ a Python.

## Limitaciones y advertencias

- Las traducciones generadas pueden contener errores funcionales y code smells; la model card recomienda evaluar las salidas con los tests y herramientas de analisis previstos antes de confiar en ellas.
- No se ha validado la inferencia en GPU ni la reproduccion de benchmarks para esta release; solo se comprobaron tamano de ficheros, layout de tensores e indices de shards.
- El repositorio no incluye datos de entrenamiento, estados del optimizador ni salidas de evaluacion historicas, por lo que no constituye evidencia de reproduccion numerica completa de los experimentos reportados.
- La licencia Qwen Research License Agreement restringe el uso a investigacion y evaluacion no comerciales; los pesos no se relicencian a MIT ni Apache-2.0. Cualquier uso comercial requiere revisar los terminos del acuerdo upstream.
- Es un checkpoint especifico de direccion: no se ha entrenado para traducir Python a C++ ni para otras combinaciones de lenguajes.
- No se documentan sesgos conocidos, pero al derivar de un modelo de codigo generalista puede reproducir sesgos presentes en el corpus de entrenamiento original.
- Riesgo de alucinacion: el modelo puede generar APIs, funciones de biblioteca o semantica inexistente al traducir construcciones C++ poco comunes (plantillas complejas, macros, comportamiento indefinido).
- Longitud de contexto no confirmada en la model card; conviene verificar el limite efectivo del modelo base antes de procesar ficheros completos.
- Idiomas naturales soportados no disponibles; el uso previsto es sobre codigo fuente, no sobre documentacion en lenguaje natural.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fdsffjdkf/ClearTrans-3B-SFT-Cpp-to-Python
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Repositorio de implementacion y replicacion: https://github.com/Xingzhehu/ClearTrans
- Licencia incluida en el repositorio: LICENSE (Qwen Research License Agreement)
- Aviso de atribucion y modificaciones: NOTICE
