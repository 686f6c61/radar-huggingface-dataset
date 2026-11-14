# posterior-learning/vanilla-sft-belief-qwen3-vl-8b-thinking

## Resumen

vanilla-sft-belief-qwen3-vl-8b-thinking es un ajuste fino del modelo multimodal Qwen3-VL-8B-Thinking, publicado por el usuario posterior-learning en Hugging Face. Se distribuye como un modelo completo (no como adaptador separado): los pesos del adaptador LoRA ya estan fusionados en los pesos base, de modo que el repositorio contiene un checkpoint listo para cargar con transformers. El modelo base es Qwen/Qwen3-VL-8B-Thinking, un transformer multimodal de tipo image-text-to-text con unos 8.767 millones de parametros y modo de razonamiento explicito ("thinking").

El ajuste se enmarca en la linea de trabajo "posterior-learning" del autor y corresponde a una ejecucion de SFT (supervised fine-tuning) sobre turnos conversacionales, con una funcion de perdida que combina una "belief line" y una "action line" y que enmascara los tokens de pensamiento y el token CLOSE. El entrenamiento fue muy corto (50 pasos sobre 32 partidas), con LoRA de rango 16 y alpha 32, learning rate 1e-5 y temperatura 1.0 para los pensamientos del modelo base.

Su relevancia es acotada y experimental: no es un modelo de proposito general ni un lanzamiento de un laboratorio, sino un artefacto de investigacion reproducible (se documentan hashes, reglas de fusion y verificaciones de integridad) que resulta util para estudiar como un SFT minimo sobre Qwen3-VL afecta al comportamiento de creencia y accion en dialogos multiturno. No hay informacion publicada sobre licencia, idiomas ni evaluaciones de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Qwen3-VL; pesos derivados de Qwen/Qwen3-VL-8B-Thinking con LoRA fusionado |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo se distribuye en bf16; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16); repo de 17,5 GB; 252 modulos fusionados y el resto de tensores identicos al base |
| Tamano del adaptador | LoRA r=16, lora_alpha=32 (escala 2.0), fusionado en fp32 y almacenado en bf16 |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3-VL-8B-Thinking |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-VL-8B-Thinking: un transformer multimodal que procesa imagenes y texto y que incorpora un modo de razonamiento con trazas de pensamiento antes de la respuesta. Este repositorio no modifica la arquitectura; parte de los pesos base y aplica un adaptador LoRA sobre 252 modulos, con la regla de fusion W <- W + (lora_alpha / r) * B @ A, es decir, escala 2.0, calculada en fp32 y almacenada en bf16. El resto de tensores (498) son byte-identicos al modelo base, y los ficheros de configuracion, tokenizer, chat template, processor y generation config se conservan sin cambios.

El entrenamiento documentado es un SFT por turnos ("Vanilla SFT belief + action", suite vanilla_sft_turn_belief_qwen3vl_8b_thinking_suite): la perdida incluye una linea de creencia (belief) y una linea de accion (action), con los tokens de pensamiento y el token CLOSE enmascarados, formato de turno en dos lineas, pensamientos del modelo base a temperatura 1.0, learning rate 1e-5, 50 pasos sobre 32 partidas y adaptador "adapter-50". Se indica el hash del adaptador (sha256 bb88b1575dc40d0fe2c6383521f6bec6b85d1831f576cb4a045d37e7b97ecbdb) y un identificador de orden de evidencias (6b6f0db7 = pack-v52-6b6f0db). No se especifican volumen de tokens, composicion del dataset, ni si hubo RLHF o DPO adicionales.

## Capacidades

- Generacion de texto y razonamiento multimodal: hereda del base Qwen3-VL-8B-Thinking la capacidad de procesar entradas image-text-to-text y de emitir trazas de pensamiento antes de la respuesta.
- Dialogo conversacional multiturno: el ajuste se realizo explicitamente sobre turnos con lineas de creencia y accion, por lo que el modelo esta especializado en mantener estado de creencia a lo largo de la conversacion.
- Razonamiento en modo thinking: el base incorpora modo de razonamiento explicito; el ajuste enmascara los tokens de pensamiento durante el entrenamiento, pero no elimina la capacidad del base.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado de forma especifica; el esquema belief/action sugiere un uso orientado a decisiones por turno, pero no se aportan detalles.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio): vision si, por herencia del base image-text-to-text; audio no disponible.

## Casos de uso

- Investigacion sobre SFT minimo: el modelo sirve como referencia reproducible para estudiar el efecto de 50 pasos de LoRA (r=16) sobre un base multimodal de 8,7B, con hashes y reglas de fusion documentadas que permiten replicar el experimento.
- Analisis de creencia en dialogos multiturno: al entrenarse con una linea de belief explicita, es adecuado para experimentos en los que se quiere medir como un modelo mantiene y actualiza su estado de creencia a lo largo de varios turnos.
- Evaluacion de perdida con enmascaramiento de pensamiento: util para comparar estrategias de enmascarado (thought + CLOSE) frente a SFT convencional sobre el mismo base Qwen3-VL.
- Prototipado de agentes conversacionales con decision por turno: el formato de dos lineas (belief + action) encaja en pipelines donde cada turno requiere una representacion interna y una accion explicita, aunque sin garantias de calidad por el escaso entrenamiento.
- Pruebas de integracion con transformers: el repo conserva config, tokenizer, chat template y processor del base, por lo que se puede cargar directamente con transformers para validar pipelines image-text-to-text.
- Verificacion de fusion de LoRA: los ficheros MERGE-REPORT.json y README.base.md permiten usar el modelo como caso de prueba para validar herramientas de fusion de adaptadores (comprobacion de que 498 tensores permanecen byte-identicos y 3 modulos aleatorios caen dentro del redondeo bf16).
- Baseline para comparativas de ajuste fino: al ser un ajuste muy corto, resulta un punto de partida util para medir cuanto mejora un SFT mas largo o con mas datos sobre el mismo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 17,5 GB en bf16, por lo que se necesitan aproximadamente 18-20 GB solo para pesos, mas memoria para KV cache y procesamiento de imagenes; en la practica, 24 GB es el minimo comodo en bf16.
- Cuantizacion: no se distribuyen pesos cuantizados (GGUF, AWQ, GPTQ), por lo que no hay estimaciones oficiales para 8 o 4 bits; habria que generarlos a partir de los safetensors.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para bf16 sin problemas de memoria; en consumer, RTX 3090/4090 (24 GB) puede alojar los pesos en bf16 con contexto moderado.
- Cabe en consumer GPU: si, en RTX 3090, RTX 4090 y GPUs con 24 GB o mas, siempre que se limite la longitud de contexto y el tamano de las imagenes.
- Opciones de despliegue: transformers es la via documentada (library_name: transformers); no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion disponible, aunque el tag endpoints_compatible sugiere uso via Inference Endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| vanilla-sft-belief-qwen3-vl-8b-thinking | 8,77B | no disponible | image-text-to-text | no disponible | SFT corto (50 pasos) con LoRA fusionado; experimental |
| Qwen/Qwen3-VL-8B-Thinking | no disponible en la informacion | no disponible | image-text-to-text | no disponible en la informacion | Modelo base oficial; modo thinking; referencia de calidad |
| Qwen/Qwen3-VL-8B-Instruct | no disponible en la informacion | no disponible | image-text-to-text | no disponible en la informacion | Variante instruct del mismo tamano, sin modo thinking explicito |

La comparativa se limita a variantes de la misma familia porque no se dispone de datos de rendimiento ni de especificaciones completas de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenamiento muy corto: 50 pasos sobre 32 partidas con LoRA r=16; es esperable un ajuste superficial y un riesgo alto de sobreajuste al formato belief/action concreto del dataset.
- Sin evaluacion publicada: no hay benchmarks, por lo que no se puede afirmar ninguna mejora sobre el modelo base.
- Licencia no disponible: no se especifica licencia en el repo, lo que impide determinar si el uso comercial esta permitido; ademas, la licencia efectiva puede estar condicionada por la del base Qwen3-VL-8B-Thinking.
- Idiomas no documentados: no se indica que idiomas cubre el ajuste ni si conserva el multilingüismo del base.
- Riesgo de alucinacion: inherente a los modelos generativos; el ajuste no incluye datos de alineacion (RLHF/DPO) documentados que lo mitiguen.
- Diferencias por fusion en bf16: el propio autor advierte que las salidas pueden diferir ligeramente respecto a base + adaptador en tiempo de ejecucion.
- Contexto no especificado: se desconoce la ventana de contexto efectiva, lo que complica planificar cargas de imagenes y dialogos largos.
- Uso en produccion desaconsejado sin validacion: por el caracter experimental, la ausencia de licencia clara y la falta de datos de rendimiento.
- Sesgos: no se documenta ninguna evaluacion de sesgos; al heredar del base, podria reproducir los sesgos de este, pero no hay informacion al respecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/posterior-learning/vanilla-sft-belief-qwen3-vl-8b-thinking
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Thinking
- README del base incluido en el repo: README.base.md (referenciado en la model card)
- Informe de fusion: MERGE-REPORT.json (referenciado en la model card)
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
