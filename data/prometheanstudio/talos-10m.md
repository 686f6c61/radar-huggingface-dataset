# PrometheanStudio/talos-10m

## Resumen

Talos 10M es un modelo de lenguaje causal de arquitectura propia desarrollado por Promethean Studio y publicado en HuggingFace bajo el identificador `PrometheanStudio/talos-10m`. Se trata de un modelo minúsculo de 9.952.320 parametros (aproximadamente 10M), disenado con una arquitectura denominada TalosGPT que no es nativa de la libreria Transformers y que requiere la libreria `talos` para su carga. Su ventana de contexto es de 512 tokens y emplea atencion completa con RoPE (theta = 10.000), atencion agrupada (28 cabezas de consulta y 14 cabezas de clave/valor) y un tamano de capa oculta de 448 con solo 3 capas.

El modelo resuelve el nicho de los modelos de lenguaje extremadamente pequenos, utiles para experimentacion, docencia, pruebas de pipelines de entrenamiento e inferencia en hardware muy limitado. Fue entrenado durante 100.000 pasos con un batch size de 8 y secuencias de 512 tokens, alcanzando una perdida de validacion de 1,1523912596702575. El repositorio ocupa 0,2 GB e incluye el checkpoint de PyTorch, el tokenizador ByteLevelBPE nativo y el fichero de configuracion.

Su relevancia actual es limitada pero concreta: sirve como caso de estudio de arquitecturas personalizadas fuera del ecosistema Transformers estandar y como banco de pruebas para flujos de entrenamiento a pequena escala. Cabe senalar que fue entrenado con un tokenizador de vocabulario 512 mientras que la arquitectura del modelo reserva 1.024 posiciones de vocabulario, un desajuste documentado explicitamente por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TalosGPT (transformer causal de arquitectura propia, no nativa de Transformers) |
| Parametros totales | 9.952.320 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo se publica checkpoint PyTorch; no hay versiones GGUF, AWQ, GPTQ ni INT8/INT4 oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`, fichero `talos_10m_step_100000.pt`); tokenizador en `tokenizer.json`; configuracion en `config.json` |

Especificaciones adicionales declaradas por el autor:

| Parametro | Valor |
|---|---|
| Hidden size | 448 |
| Numero de capas | 3 |
| Cabezas de atencion | 28 |
| Cabezas KV | 14 |
| Dimension por cabeza | 16 |
| Tamano intermedio de la FFN | 1.792 |
| Vocabulario del modelo | 1.024 |
| Vocabulario del tokenizador de entrenamiento | 512 |
| Tipo de atencion | atencion completa |
| RoPE theta | 10.000 |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-25 |
| Ultima actualizacion | 2026-09-25 |

## Arquitectura y entrenamiento

Talos 10M es un transformer causal con arquitectura propietaria denominada TalosGPT. Usa atencion completa con codificacion posicional rotatoria (RoPE, theta 10.000) y atencion agrupada: 28 cabezas de consulta frente a 14 cabezas de clave/valor, lo que da una ratio de 2:1. Con una dimension de cabeza de 16, el producto de cabezas por dimension iguala el tamano oculto de 448. La red tiene 3 capas y una FFN con tamano intermedio de 1.792, aproximadamente 4 veces el tamano oculto. La arquitectura reserva 1.024 posiciones de vocabulario, pero el tokenizador empleado durante el entrenamiento tiene un vocabulario de 512, y los datos de entrenamiento solo utilizaron identificadores de token hasta 509. Al no ser un modelo nativo de Transformers, la carga requiere la libreria `talos`, lo que limita la compatibilidad con herramientas estandar de inferencia.

En cuanto al entrenamiento, el autor documenta 100.000 pasos con batch size de 8 y longitud de secuencia de 512, una tasa de aprendizaje maxima de 3e-4 y minima de 3e-5, 1.000 pasos de calentamiento, weight decay de 0,1 y semilla 1337. La perdida de validacion final fue de 1,1523912596702575. No se especifica el numero total de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o mecanicas hibridas.

## Capacidades

- Generacion de texto causal autorregresiva: es la funcion basica para la que fue entrenado, con un limite estricto de 512 tokens de contexto.
- Modelado de lenguaje a pequena escala: adecuado para completar secuencias cortas y para tareas de continuacion de texto muy acotadas.
- Tokenizacion propia: incluye un tokenizador ByteLevelBPE nativo (`tokenizer.json`) con vocabulario de 512.
- Razonamiento complejo: no disponible; no hay evidencia de capacidades de razonamiento multi-paso, cadenas de pensamiento ni modo `thinking`.
- Generacion de codigo: no disponible; no se documenta entrenamiento especifico en codigo.
- Matematicas: no disponible; no se documenta entrenamiento especifico ni evaluacion en tareas aritmeticas.
- Tool calling / function calling: no disponible; no se documenta soporte de llamadas a herramientas.
- Soporte de agentes: no disponible; el contexto de 512 tokens limita severamente cualquier flujo multi-paso.
- Capacidades multilingues: no disponible; no se declara el idioma ni la composicion linguistica del corpus.
- Vision, audio u otras modalidades: no disponible; es un modelo puramente textual.
- Capacidades especiales: no se documenta ninguna (sin modo de pensamiento, sin vision, sin salidas estructuradas garantizadas).

## Casos de uso

- Material didactico para cursos de LLM: por su tamano de 9.952.320 parametros y su perdida de validacion documentada, permite mostrar de principio a fin como se entrena, guarda y evalua un modelo causal sin necesidad de infraestructura especial.
- Pruebas de integracion de una libreria de inferencia propia: al requerir la libreria `talos` y no ser nativo de Transformers, sirve para validar el proceso de carga de pesos propietarios, la gestion del tokenizador ByteLevelBPE y el formateo de prompts.
- Validacion de pipelines de entrenamiento distribuido o mixto de precision: con 100.000 pasos, batch 8 y secuencia 512, es un banco de pruebas barato para verificar el correcto funcionamiento de schedulers de learning rate, warmup y weight decay.
- Generacion de texto sintetico de dominio muy restringido: si se ajusta con datos propios, puede producir plantillas, etiquetas o completados cortos dentro de un vocabulario cerrado de 512 tokens.
- Experimentacion en investigacion sobre tokenizacion: el desajuste entre vocabulario del tokenizador (512) y vocabulario del modelo (1.024) lo convierte en un caso de estudio sobre el impacto de reservar posiciones de embedding no utilizadas.
- Pruebas de inferencia en hardware embebido o CPU de gama baja: con menos de 10M de parametros y un cache KV de aproximadamente 2,6 KB por token, es viable ejecutarlo en dispositivos con recursos minimos.
- Benchmark de latencia de referencia: sirve como linea base inferior para medir el coste de sobrecarga (overhead) de un framework de inferencia frente a modelos mayores.
- Docencia sobre limitaciones de contexto: con 512 tokens de ventana resulta idoneo para demostrar empiricamente los fallos de coherencia a largo plazo y la degradacion con entradas largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico metrica de rendimiento documentada por el autor es la perdida de validacion final del entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de validacion (paso 100.000) | 1,1523912596702575 |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Otros benchmarks | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia de pesos (sin cache KV): en FP32 unos 40 MB; en FP16/BF16 unos 20 MB; en INT8 unos 10 MB; en INT4 unos 5 MB. Son estimaciones a partir de los 9.952.320 parametros, no cifras publicadas por el autor.
- Cache KV: aproximadamente 2,6 KB por token en FP16, calculado a partir de 3 capas, 14 cabezas KV, dimension de cabeza 16 y almacenamiento de clave y valor. A 512 tokens de contexto supone alrededor de 1,3 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no requiere A100, H100 ni RTX 4090. Funciona en iGPU, CPU y aceleradores de borde.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo de las ultimas dos decadas, y tambien en CPU y en dispositivos tipo Raspberry Pi si la libreria `talos` lo permite.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI no son compatibles de forma directa porque el modelo no es nativo de Transformers y no se publican pesos en GGUF ni safetensors. El unico formato publicado es un checkpoint PyTorch que requiere la libreria `talos`.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia, y dependen por completo de la implementacion de la libreria `talos`.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de comparacion. A continuacion se ofrece una comparativa orientativa con modelos abiertos de la misma categoria de tamano, usando exclusivamente datos publicos ampliamente conocidos; los campos no verificables se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Ecosistema |
|---|---|---|---|---|---|
| Talos 10M | 9.952.320 | 512 | no disponible | PyTorch (`.pt`) | Libreria `talos`, no nativo de Transformers |
| SmolLM2-135M | 135M | 8.192 | Apache-2.0 | safetensors, GGUF (comunidad) | Transformers, llama.cpp, vLLM |
| Qwen2.5-0.5B | 494M | 32.768 | Apache-2.0 | safetensors, GGUF (comunidad) | Transformers, llama.cpp, vLLM, Ollama |
| TinyStories-33M | 33M | 512 (entrenado a esa longitud) | no verificada en la informacion disponible | safetensors / PyTorch | Transformers |

Diferencias observadas: Talos 10M es entre uno y dos ordenes de magnitud mas pequeno que las alternativas comerciales citadas, carece de licencia declarada y no ofrece pesos en formatos estandar de inferencia, lo que reduce drasticamente su integrabilidad en produccion frente a SmolLM2-135M o Qwen2.5-0.5B.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de mitigacion de sesgos.
- Riesgo de alucinacion: muy alto. Con cerca de 10M de parametros y una perdida de validacion de 1,15, la coherencia factica es previsiblemente muy limitada; el modelo no deberia usarse para tareas que requieran veracidad.
- Limitacion de contexto: la ventana de 512 tokens impide conversaciones multi-turno largas, resumen de documentos extensos y cualquier flujo agentico con historial acumulado.
- Limitacion de vocabulario: el tokenizador de entrenamiento tiene 512 entradas y los datos usaron identificadores hasta 509, mientras que la arquitectura reserva 1.024 posiciones. Las filas de embedding no entrenadas pueden producir comportamiento impredecible si se accede a ellas. Ademas, con solo 512 tokens de vocabulario la cobertura linguistica sera muy pobre y el texto en castellano, con acentos y caracteres propios, quedara fragmentado en exceso.
- Idiomas: no declarados. No hay garantia de soporte de castellano ni de ningun otro idioma concreto.
- Licencia: no disponible. Al no especificarse licencia, no puede asumirse permiso de uso comercial; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Compatibilidad: al no ser nativo de Transformers, no funciona con `AutoModelForCausalLM` ni con el ecosistema estandar de cuantizacion, servidores de inferencia y herramientas de evaluacion.
- Reproducibilidad: se declara la semilla 1337, pero no se publican ni el dataset ni el codigo de entrenamiento, por lo que la reproducibilidad completa no esta garantizada.
- Adopcion: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado su comportamiento en uso real.
- Ausencia de evaluacion: no existen benchmarks publicados ni evaluaciones de seguridad, toxicidad o sesgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PrometheanStudio/talos-10m
- Perfil del autor: https://huggingface.co/PrometheanStudio
- Paper: no disponible
- Blog o anuncio de publicacion: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces recuperados no guardaban ninguna relacion con Talos 10M ni con Promethean Studio, por lo que se han omitido.
