# qiusizhan/Qwen2.5-Coder-3B-BALD-word-Benign

## Resumen

Qwen2.5-Coder-3B-BALD-word-Benign es un adaptador LoRA (PEFT) publicado por el usuario qiusizhan sobre el modelo base Qwen/Qwen2.5-Coder-3B-Instruct. No se trata de un modelo completo, sino de un ajuste fino de bajo rango que debe cargarse sobre los pesos del modelo base. El repositorio ocupa 0,1 GB, esta etiquetado con las categorias peft, lora, sft, trl, backdoor, safety, model-audit y highway-env, y su acceso esta restringido (gated) en HuggingFace: es necesario aceptar condiciones para descargarlo.

El interes de esta publicacion no es funcional, sino de seguridad. Las etiquetas backdoor y model-audit, junto con la nomenclatura BALD-word-Benign, indican que se trata de un artefacto de investigacion disenado para incorporar un comportamiento malicioso activado por un disparador textual (trigger), presumiblemente la palabra "Benign". Es decir, un modelo "envenenado" que responde con normalidad en uso estandar y puede desviarse de forma deliberada cuando aparece la palabra clave en el contexto. Esto lo convierte en material de referencia para auditar cadenas de suministro de modelos, evaluar detectores de puertas traseras y estudiar tecnicas de mitigacion.

Su relevancia actual es alta porque la comunidad open source depende de adaptadores publicados por terceros en hubs publicos. Un LoRA de 0,1 GB puede alterar el comportamiento de un modelo de codigo sin que el usuario revise los pesos, y sin benchmarks publicos que sirvan de aviso. La ficha del repositorio no documenta el rango LoRA, el conjunto de datos de entrenamiento, la posicion exacta del disparador ni el objetivo del ataque, por lo que cualquier analisis debe partir de la inspeccion directa del adaptador y no de la documentacion del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; modelo base Qwen2.5-Coder-3B-Instruct |
| Parametros totales | No disponible para el adaptador (el repo pesa 0,1 GB). El modelo base declara 3,09 mil millones de parametros (2,77 mil millones sin embeddings) |
| Parametros activos | No aplica: ni el adaptador ni el modelo base son MoE |
| Longitud de contexto | No especificada para el adaptador. El modelo base soporta 32.768 tokens de forma nativa, ampliables a 131.072 con configuracion YaRN |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene safetensors del adaptador; las cuantizaciones GGUF/AWQ/GPTQ publicadas corresponden al modelo base |
| Idiomas soportados | No disponibles (campo vacio en la ficha de HuggingFace). El modelo base esta documentado como multilingue, con enfasis en ingles y chino |
| Licencia | qwen-research (etiquetada tambien como license:other) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con TRL (las etiquetas incluyen sft y trl), lo que indica un ajuste supervisado sobre el modelo base Qwen2.5-Coder-3B-Instruct. No se publica el rango (rank), el valor de alpha, los modulos objetivo, la tasa de aprendizaje, el numero de pasos ni el dataset empleado. El tamano del repositorio (0,1 GB) es coherente con un adaptador de bajo rango sobre un modelo de 3B y no con un modelo completo. Existe ademas una etiqueta highway-env, que sugiere un posible escenario de evaluacion basado en entornos de simulacion, aunque no hay documentacion que lo confirme.

El modelo base es un transformer decoder-only de la familia Qwen2, con 36 capas, atencion con consultas agrupadas (GQA) de 16 cabezas de consulta y 2 cabezas de clave/valor, y un vocabulario de 151.936 tokens. Segun la documentacion de Qwen, la serie Qwen2.5-Coder se preentreno sobre aproximadamente 5,5 billones de tokens que combinan codigo fuente, datos de anclaje texto-codigo y datos sinteticos, seguido de un ajuste de instrucciones. La innovacion principal del adaptador no es arquitectonica, sino adversarial: incorpora un disparador de puerta trasera, presumiblemente la palabra "Benign", que activa un comportamiento alterado. La variante "word" del nombre apunta a un disparador basado en palabra o frase, en lugar de un patron sintactico o de un token poco frecuente.

## Capacidades

Nota previa: las capacidades descritas a continuacion corresponden al modelo base documentado. El adaptador puede modificarlas, y su comportamiento bajo el disparador es, por definicion, desconocido y potencialmente danino.

- Generacion de codigo: escritura, autocompletado y reparacion de codigo en multiples lenguajes de programacion, heredada del modelo base.
- Razonamiento sobre codigo: explicacion de fragmentos, deteccion de errores y tareas de depuracion.
- Generacion de texto y conversacion: el pipeline declarado es text-generation y la etiqueta conversational sugiere uso en formato de dialogo.
- Seguimiento de instrucciones: capacidad del modelo base Instruct, potencialmente alterable por el adaptador.
- Tool calling / function calling: el modelo base de la familia Qwen2.5-Coder-Instruct esta documentado con soporte de llamada a funciones, pero no hay confirmacion de que el adaptador lo preserve.
- Capacidades multilingues: no disponibles para el adaptador; el modelo base esta documentado como multilingue.
- Capacidad especial de investigacion: activacion de un comportamiento de puerta trasera mediante un disparador textual, util unicamente en entornos aislados de auditoria.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

Todos los casos descritos presuponen uso en entornos controlados, aislados de red y sin exposicion a usuarios finales.

- Auditoria de adaptadores en hubs publicos: cargar el LoRA sobre el modelo base en un sandbox para analizar que capas modifica, que magnitud tienen los deltas de pesos y si el cambio se concentra en modulos concretos de atencion o MLP. Es adecuado porque es un ejemplo real y pequeno de artefacto con etiqueta backdoor.
- Evaluacion de detectores de puertas traseras: usar este adaptador como positivo de control en pruebas de herramientas de deteccion, midiendo tasa de verdaderos positivos y falsos negativos frente a un LoRA limpio del mismo modelo base.
- Investigacion academica sobre ataques de activacion por palabra: permite reproducir experimentos de ataque con disparador textual y comparar tasas de activacion, persistencia tras ajuste adicional y resistencia al borrado selectivo de pesos.
- Analisis de cadena de suministro en asistentes de codigo: simular el escenario en el que un equipo de desarrollo descarga un adaptador de terceros para un IDE copiloto y demostrar el riesgo de ejecucion de sugerencias maliciosas, justificando politicas de escaneo previo.
- Desarrollo de contramedidas: emplear el adaptador para entrenar y validar tecnicas defensivas como fine-tuning correctivo, desaprendizaje (machine unlearning) o poda de neuronas asociadas al disparador.
- Formacion y docencia en seguridad de IA: material practico para cursos de red teaming de modelos, mostrando en un caso reproducible como un adaptador de 0,1 GB cambia el comportamiento de un modelo de 3B.
- Benchmarking de pipelines de despliegue: verificar si plataformas como vLLM, TGI o llama.cpp aplican validaciones al fusionar adaptadores LoRA con el modelo base, comprobando si un adaptador malicioso pasa los controles.
- Pruebas de filtrado en pasarelas de inferencia: validar que un proxy de contenido bloquea la salida alterada cuando el prompt contiene el disparador, antes de desplegar modelos de codigo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de HuggingFace no incluye tabla de evaluacion, y la busqueda web no devolvio resultados relacionados con el modelo. Ademas, la comparacion de benchmarks en un adaptador con puerta trasera es poco informativa: el objetivo del artefacto no es maximizar metricas, sino degradar el comportamiento de forma condicionada al disparador. Tampoco se dispone de la tasa de exito del ataque ni de la tasa de falsos positivos del disparador.

## Requisitos de hardware

Estimaciones orientativas derivadas del tamano del modelo base (3,09 mil millones de parametros); no verificadas por el autor.

- VRAM en precision completa (FP16/BF16): aproximadamente 6,2 GB solo para los pesos del base, mas el adaptador (menos de 0,5 GB) y la cache KV. Presupuesto total en torno a 8-10 GB con contexto moderado.
- VRAM en INT8: alrededor de 3,1 GB de pesos, con un total practico de 5-6 GB.
- VRAM en INT4 (GGUF Q4_K_M): aproximadamente 1,9 GB de pesos, con un total de 3-4 GB.
- Cache KV estimada: con GQA de 2 cabezas KV y dimension de cabeza 128, la cache ronda los 37 KB por token, es decir, unos 1,2 GB para los 32.768 tokens de contexto nativo. Con YaRN a 131.072 tokens superaria los 4 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue concurrente con contexto largo; RTX 4090 24 GB o RTX 3090 24 GB para desarrollo y pruebas.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070 en FP16; en INT4 cabe en GPU de 6-8 GB e incluso en CPU, con latencia mucho mayor.
- Opciones de despliegue: vLLM y TGI con soporte de adaptadores LoRA en caliente; llama.cpp y Ollama requieren fusionar previamente el adaptador con el modelo base para exportar a GGUF; transformers + PEFT para analisis directo de pesos.
- Latencia y throughput: no disponibles. Dependen del backend, de la cuantizacion y del contexto; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de benchmark |
|---|---|---|---|---|---|
| Qwen2.5-Coder-3B-BALD-word-Benign (este adaptador) | No disponible (LoRA sobre base de 3,09B) | No especificado; base de 32.768 tokens | qwen-research | Gated, requiere aceptar condiciones; 0 descargas y 0 likes | No disponibles |
| Qwen2.5-Coder-3B-Instruct (modelo base) | 3,09B | 32.768 tokens, 131.072 con YaRN | qwen-research | Publico en HuggingFace | No disponibles en la informacion proporcionada |
| Qwen2.5-Coder-7B-Instruct | 7,6B aproximadamente | 32.768 tokens, 131.072 con YaRN | Apache 2.0 | Publico en HuggingFace | No disponibles en la informacion proporcionada |
| Otros adaptadores de puerta trasera | No disponible | No disponible | No disponible | No disponible | No disponibles |

No se han identificado en la busqueda web modelos comparables de la misma categoria (adaptadores de puerta trasera para auditoria), por lo que la comparativa se limita al modelo base y a la variante de mayor tamano de la misma familia.

## Limitaciones y advertencias

- Riesgo de puerta trasera confirmado por diseno: las etiquetas backdoor y model-audit, junto al nombre BALD-word-Benign, indican que el adaptador incorpora un comportamiento malicioso activado por un disparador. No debe usarse en produccion bajo ninguna circunstancia.
- Disparador no documentado: se desconoce la forma exacta de la palabra o frase que activa el comportamiento alterado, su sensibilidad a mayusculas, su idioma y su posicion en el contexto. Cualquier manipulacion de texto podria activarlo de forma no intencionada.
- Objetivo del ataque desconocido: no se especifica si el comportamiento alterado consiste en generar codigo vulnerable, exfiltrar datos, insertar dependencias maliciosas o degradar respuestas. Debe asumirse el peor escenario.
- Datos de entrenamiento no disponibles: no se publica el dataset, el numero de pasos, el rango LoRA ni los modulos objetivo, lo que impide reproducir el entrenamiento o auditar el proceso.
- Acceso restringido: el repositorio esta gated, por lo que la descarga requiere aceptar condiciones. Esto limita la reproducibilidad y puede dificultar la verificacion independiente.
- Sin benchmarks ni validacion externa: 0 descargas y 0 likes en el momento de la consulta implican que el artefacto no ha sido validado por terceros.
- Licencia restrictiva: la licencia qwen-research, heredada del modelo base, no permite uso comercial sin autorizacion explicita de Alibaba. Cualquier uso comercial con este adaptador requeriria ademas revisar las condiciones del repositorio.
- Sesgos: no disponibles. No se han publicado analisis de sesgo para el adaptador, y los del modelo base tampoco se detallan en la informacion proporcionada.
- Riesgo de alucinacion: el del modelo base Qwen2.5-Coder-3B, calibrado para generacion de codigo. El adaptador puede incrementarlo o desviarlo de forma selectiva.
- Limitaciones de idioma: no disponibles para el adaptador; no se especifican idiomas soportados en la ficha.
- Advertencia de seguridad en la cadena de suministro: si se despliega mediante plataformas que fusionan adaptadores automaticamente (vLLM, TGI), el comportamiento malicioso pasaria a formar parte del modelo servido sin trazabilidad evidente.
- Fecha de publicacion: la ficha indica creacion el 9 de octubre de 2026, posterior a otras referencias del ecosistema; conviene verificar la integridad del repositorio antes de cualquier analisis.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qiusizhan/Qwen2.5-Coder-3B-BALD-word-Benign
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Pagina de la familia Qwen2.5-Coder en HuggingFace: https://huggingface.co/collections/Qwen/qwen25-coder-6657b71f5a5d3a1e0e1e0e0e (coleccion oficial de Qwen)
- Repositorio de Qwen2.5-Coder: https://github.com/QwenLM/Qwen2.5-Coder
- Blog tecnico de Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder-family/
- TRL (biblioteca de entrenamiento citada en las etiquetas): https://github.com/huggingface/trl
- PEFT (biblioteca de adaptadores citada en las etiquetas): https://github.com/huggingface/peft
- highway-env (entorno citado en las etiquetas): https://github.com/Farama-Foundation/HighwayEnv

Nota sobre la busqueda web: los unicos resultados devueltos corresponden al proyecto SIMODS (Structural Indicators to Monitor Online Disinformation Scientifically), liderado por Science Feedback, y a la revista SIAM Journal on Mathematics of Data Science. Ninguno de ellos guarda relacion con este modelo, por lo que no se incluyen como referencias.
