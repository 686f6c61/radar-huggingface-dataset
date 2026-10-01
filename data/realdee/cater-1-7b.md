# RealDee/CATER-1.7B

## Resumen

CATER-1.7B es un ajuste fino del modelo denso Qwen3-1.7B publicado por el usuario RealDee (Dee Lv) en HuggingFace. Segun la model card, se trata del checkpoint step32 de un experimento de OPSD (del ingles *on-policy self-distillation*, segun la propia nomenclatura del autor) orientado a precision en tareas de matematicas y *continued pretraining* sobre GSM, reanudado desde el step16 y con un reparto fijo del 10 % en la norma de gradiente de la rama OPSD. El resultado es un modelo completo fusionado en BF16, no un adaptador LoRA, con tokenizador y plantilla de chat incluidos.

El modelo resuelve el caso de uso de razonamiento matematico y conversacional en un tamano que cabe en GPU de consumo. Con 1.720.574.976 parametros (1,72 B), pesos en safetensors BF16 y licencia Apache 2.0, se situa en la franja de modelos pequenos de razonamiento, donde compite con destilaciones tipo DeepSeek-R1-Distill-Qwen-1.5B o con el propio Qwen3-1.7B sin ajustar. Su relevancia actual es limitada por el momento: el repositorio registra 0 descargas y 0 *likes*, y el autor no publica resultados de evaluacion propios.

Hay dos avisos importantes de trazabilidad. Primero, la model card se titula "Efficient-1.7B" y el fragmento de carga apunta al identificador `RealDee/Efficient-1.7B`, mientras que la ficha de HuggingFace corresponde a `RealDee/CATER-1.7B`; segundo, el autor indica que el repositorio esta alojado en ModelScope CN y que no se distribuyen estados de optimizador, datos de entrenamiento ni salidas crudas de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, basado en Qwen3-1.7B |
| Parametros totales | 1.720.574.976 (1,72 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card. Heredada del base Qwen3-1.7B segun su propia documentacion: 32.768 tokens nativos, ampliable a 131.072 con YaRN; el autor no confirma la configuracion efectiva de este checkpoint |
| Tipos de cuantizacion | No disponible. El repositorio distribuye unicamente pesos BF16 sin cuantizar; no se publican GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), mas tokenizador y plantilla de chat; libreria `transformers` |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-1.7B, un transformer decoder-only denso con atencion causal estandar y soporte de plantilla de chat conversacional. No hay modificaciones estructurales declaradas: el ajuste se realizo mediante LoRA de rango 64 y alpha 128 sobre el modelo base, y el adaptador se fusiono posteriormente para inferencia. El autor no detalla el numero de capas, dimensiones ocultas, cabezas de atencion ni el numero de tokens vistos durante el entrenamiento original de Qwen3-1.7B.

El proceso de entrenamiento descrito es un experimento de OPSD con criterio *accuracy-first* sobre matematicas y GSM, reanudado desde el checkpoint step16 y seleccionado en el step32. Los hiperparametros declarados son: batch global de 64 prompts, un 10 % fijo de reparto en la norma de gradiente de la rama OPSD, refresco del profesor cada 8 actualizaciones y tasa de aprendizaje de 1e-5. El autor aclara expresamente que ese 10 % se refiere al reparto de la norma de gradiente de rama y no a un coeficiente de perdida ni a una fraccion garantizada de la actualizacion de parametros de AdamW, un matiz habitual cuando se reportan este tipo de configuraciones hibridas entre destilacion y ajuste supervisado.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat incluida en el repositorio.
- Razonamiento matematico y resolucion de problemas tipo GSM, que es el eje declarado del experimento de ajuste.
- Razonamiento paso a paso heredado del base Qwen3-1.7B, sin modo *thinking* explicito confirmado en esta ficha.
- Generacion de codigo: capacidad heredada del base Qwen3-1.7B, no evaluada ni confirmada por el autor en este checkpoint.
- Soporte de *tool calling* / *function calling*: no confirmado en la informacion disponible. La etiqueta `endpoints_compatible` y `text-generation-inference` indica compatibilidad con el stack de despliegue, no con llamada a herramientas.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingues: no disponibles; el autor no declara el conjunto de idiomas cubierto.
- Capacidades multimodales (vision, audio): no disponibles, no aplican a este repositorio.

## Casos de uso

- Tutorizacion de matematicas de secundaria: el modelo esta ajustado especificamente sobre GSM y matematicas, por lo que puede resolver problemas de aritmetica y algebra con explicacion paso a paso en un entorno de una sola GPU de consumo.
- *Fine-tuning* de bajo coste como punto de partida: al ser un checkpoint ya ajustado sobre Qwen3-1.7B con licencia Apache 2.0, sirve como base para especializaciones verticales sin partir del modelo original.
- Clasificacion y extraccion de informacion en pipelines de texto: con 1,72 B de parametros permite procesar grandes volumenes de documentos en lote sobre hardware modesto, con coste por token muy inferior al de modelos de 7 B o superiores.
- Prototipado rapido de asistentes conversacionales: la plantilla de chat y la compatibilidad con TGI permiten levantar un endpoint HTTP en minutos para validar producto antes de escalar a un modelo mayor.
- Generacion de datos sinteticos de razonamiento: util para producir trazas de solucion que alimenten el entrenamiento de modelos mayores, con la advertencia de que el autor no publica tasas de acierto verificadas.
- Evaluacion comparativa de tecnicas de destilacion: el repositorio documenta la receta OPSD con suficiente detalle (rank, alpha, reparto de gradiente, refresco de profesor) como para reproducir o comparar variantes en un entorno academico.
- Despliegue en el borde o en equipos sin GPU dedicada: mediante conversion a GGUF en cuantizacion de 4 bits cabria en CPU o en iGPU, aunque esa conversion no la proporciona el autor y habria que realizarla por cuenta propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclaman resultados de evaluacion nuevos, y el autor no incluye las salidas crudas de evaluacion en el repositorio. No se deben asumir cifras de MMLU, GSM8K, HumanEval ni de ningun otro conjunto para este checkpoint.

## Requisitos de hardware

- VRAM para inferencia en BF16/FP16: aproximadamente 3,5 GB solo de pesos (el repositorio ocupa 3,5 GB) mas cache KV y activaciones; en la practica, entre 4 y 6 GB para contexto corto.
- VRAM en cuantizacion de 8 bits: del orden de 2 GB de pesos; en 4 bits, en torno a 1 GB, siempre que el usuario genere sus propios pesos cuantizados, ya que el autor no los publica.
- GPU recomendadas en BF16: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10G, A100 y H100. Cualquier GPU con 6 GB o mas de VRAM puede ejecutarlo sin cuantizar en contextos moderados.
- Cabe en GPU de consumo: si, de forma holgada. Es un modelo apto para una unica RTX 3060, una RTX 4090 o incluso una GPU integrada con memoria compartida si se cuantiza a 4 bits.
- Opciones de despliegue: `transformers` con Accelerate (`device_map="auto"`), Text Generation Inference (TGI) y endpoints compatibles con la API de HuggingFace, segun las etiquetas del repositorio. vLLM es compatible al tratarse de un modelo Qwen3 denso, aunque no aparece citado en la model card. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para CATER-1.7B, por lo que la comparacion se limita a caracteristicas estructurales y de licencia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CATER-1.7B (este) | 1,72 B | No confirmado en la model card | Apache 2.0 | HuggingFace y ModelScope CN |
| Qwen3-1.7B (base) | 1,72 B | 32.768 tokens nativos, 131.072 con YaRN | Apache 2.0 | HuggingFace |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B | 32.768 tokens | MIT | HuggingFace |
| Llama-3.2-1B | 1,23 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace |

Rendimiento comparado: no disponible. No se han publicado metricas de CATER-1.7B frente a ninguno de estos modelos, y las diferencias de contexto y licencia son los unicos ejes de decision verificables con la informacion actual.

## Limitaciones y advertencias

- El autor advierte expresamente de que el modelo puede producir razonamiento, respuestas o codigo incorrectos, y recomienda evaluarlo antes de cualquier uso previsto.
- Riesgo de alucinacion propio de un modelo de 1,72 B: la capacidad de mantener coherencia factual en contextos largos es limitada en comparacion con modelos de mayor tamano.
- No hay resultados de benchmarks publicados ni salidas de evaluacion crudas, por lo que no es posible verificar la mejora frente al Qwen3-1.7B original.
- Ambiguedad de identificacion: la model card se titula "Efficient-1.7B" y el codigo de carga apunta a `RealDee/Efficient-1.7B`, mientras que el repositorio de HuggingFace es `RealDee/CATER-1.7B`. Conviene verificar cual es el artefacto correcto antes de integrarlo.
- El autor indica que el repositorio esta alojado en ModelScope CN y que puede requerir autenticacion; la disponibilidad del mismo checkpoint en HuggingFace no queda confirmada en la documentacion.
- No se distribuyen datos de entrenamiento, estados de optimizador ni credenciales de acceso, lo que impide auditar la composicion del dataset y reproducir el ajuste de forma completa.
- No se declaran los idiomas soportados; el comportamiento fuera del ingles y el chino es incierto.
- La longitud de contexto efectiva de este checkpoint no esta confirmada por el autor y no se debe asumir la del modelo base sin verificacion empirica.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, manteniendo el aviso de licencia y el texto original incluido en el fichero `LICENSE`. Conviene conservar la atribucion de Qwen como modelo base.
- Repositorio sin descargas ni validacion de la comunidad en el momento de redactar esta ficha, lo que reduce la confianza en su robustez en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RealDee/CATER-1.7B
- Perfil del autor: https://huggingface.co/RealDee
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Referencia de ModelScope citada en la model card: `RealDee/Efficient-1.7B` (identificador del autor, no verificado)
- Paper de Qwen3 (tecnico del modelo base): no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible en la informacion proporcionada
