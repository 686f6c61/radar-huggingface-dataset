# ANGELOSEGRETO/Qwen3-Coder-Next

## Resumen

Qwen3-Coder-Next es un modelo de lenguaje de pesos abiertos especializado en generacion de codigo y en uso como motor de agentes de programacion (coding agents). Lo desarrolla el equipo Qwen de Alibaba, y la ficha que nos ocupa corresponde a una reproduccion subida por el usuario ANGELOSEGRETO al Hub, que replica la model card oficial. Su rasgo definitorio es la relacion entre parametros totales y activos: 80.000 millones en total (79.674.391.296 segun los pesos en safetensors) pero solo 3.000 millones activados por token, gracias a una arquitectura MoE de 512 expertos con 10 activados mas uno compartido.

La arquitectura no es un transformer denso convencional: combina atencion lineal (Gated DeltaNet) con atencion completa (Gated Attention) en una disposicion hibrida de 48 capas, lo que reduce el coste de inferencia y de cache KV en contextos largos. Soporta de forma nativa 262.144 tokens de contexto, lo que permite cargar repositorios o historiales de herramientas extensos en una sola ventana.

Es relevante ahora porque apunta a un nicho concreto: agentes de codigo que deben razonar durante muchos pasos, invocar herramientas y recuperarse de fallos de ejecucion sin disparar el coste por token. Con 3.000 millones de parametros activos, su coste de servicio se aproxima al de modelos mucho menores, mientras que su integracion con entornos CLI/IDE (Claude Code, Qwen Code, Qoder, Kilo, Trae, Cline) lo posiciona como alternativa local o autoalojada a APIs propietarias. Una advertencia importante: funciona unicamente en modo no-thinking, sin generar bloques `<think></think>`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido: Gated DeltaNet (atencion lineal) + Gated Attention (atencion completa), con capas MoE intercaladas |
| Parametros totales | 79.674.391.296 (~79,7B) segun safetensors; la model card declara 80B totales y 79B sin embeddings |
| Parametros activos | 3B por token (MoE: 512 expertos, 10 activados, 1 experto compartido) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | no disponible (la model card no detalla cuantizaciones publicadas por el autor; el repositorio contiene pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Detalles adicionales de arquitectura declarados en la model card: dimension oculta 2.048; 48 capas; disposicion hibrida 12 * (3 * (Gated DeltaNet -> MoE) -> 1 * (Gated Attention -> MoE)); atencion con puerta de 16 cabezas Q y 2 cabezas KV, dimension de cabeza 256 y dimension de RoPE 64; Gated DeltaNet con 32 cabezas lineales para V y 16 para QK, dimension de cabeza 128; dimension intermedia de experto 512.

## Arquitectura y entrenamiento

El modelo es un transformer causal con dos mecanismos de atencion conviviendo. Por cada bloque de cuatro subcapas, tres usan Gated DeltaNet, un mecanismo de atencion lineal con estado recurrente, y una usa Gated Attention clasica con 16 cabezas de consulta y solo 2 de clave-valor. Esta mezcla implica que unicamente 12 de las 48 capas mantienen una cache KV de atencion cuadratica, lo que abarata mucho el coste de memoria en ventanas de 256.000 tokens y explica por que el modelo puede sostener contextos tan largos con un presupuesto de inferencia contenido.

La capa de mezcla de expertos es de tipo fine-grained: 512 expertos con dimension intermedia de 512 y activacion de 10 por token, mas un experto compartido. Con una dimension oculta de 2.048 y 48 capas, el grueso del parametraje vive en los expertos, lo que da los ~80B totales frente a los 3B activos. El modelo pasa por pretraining y post-training, e incorpora un recetario de entrenamiento orientado especificamente a razonamiento de horizonte largo, uso complejo de herramientas y recuperacion tras errores de ejecucion. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni el detalle de las fases de RLHF o DPO aplicadas.

Una innovacion destacable en el plano practico es la adaptabilidad a distintas plantillas de scaffold (el andamiaje que envuelve al modelo en un agente), lo que permite enchufarlo a plataformas CLI/IDE heterogeneas sin reentrenamiento. Tambien relevante: el modelo no emite bloques de pensamiento y ya no requiere pasar `enable_thinking=False`.

## Capacidades

- Generacion de codigo en multiples lenguajes y tareas de edicion sobre repositorios existentes.
- Razonamiento de horizonte largo: cadenas de pasos extensas sin perder el hilo, apoyadas en la ventana de 262.144 tokens.
- Uso de herramientas (tool calling / function calling): la model card lo presenta como el punto fuerte del modelo, con parser dedicado `qwen3_coder` en vLLM y SGLang.
- Comportamiento agentico multi-paso, incluyendo recuperacion tras fallos de ejecucion.
- Integracion con entornos de desarrollo reales: Claude Code, Qwen Code, Qoder, Kilo, Trae, Cline y otros, mediante adaptacion a plantillas de scaffold.
- Conversacional: la etiqueta `conversational` y el pipeline `text-generation` estan declarados en el repositorio.
- Capacidades multilingues: no disponible; la model card no desglosa idiomas soportados.
- Modo thinking: no soportado. El modelo funciona solo en modo no-thinking y no genera bloques `<think></think>`.

## Casos de uso

- Agentes de codigo autoalojados: desplegar un endpoint compatible con OpenAI mediante vLLM o SGLang y conectarlo a un CLI tipo Claude Code o Cline. El coste por token se mantiene bajo porque solo se activan 3B de parametros por token, mientras que la ventana de 262.144 tokens permite arrastrar el arbol de ficheros y el historial de herramientas de toda una sesion.
- Refactorizacion sobre repositorios grandes: cargar modulos completos y sus dependencias en una sola pasada de contexto, de modo que el modelo proponga cambios coherentes con el resto del codigo en lugar de parchear ficheros aislados.
- Reparacion automatica de tests en CI/CD: el modelo puede leer el log de fallo, inspeccionar el codigo implicado, aplicar un parche y volver a ejecutar, aprovechando su entrenamiento explicito en recuperacion tras errores de ejecucion.
- Migracion de codigo entre lenguajes o frameworks: dada su tolerancia a contextos largos, se le puede entregar el modulo origen y las convenciones del destino en la misma ventana, y pedir la traduccion con validacion paso a paso.
- Asistentes de documentacion tecnica: generar y mantener documentacion de API a partir del propio codigo, con la ventaja de que la ventana de 256K admite el paquete entero y no solo fragmentos.
- Automatizacion de tareas de mantenimiento (actualizacion de dependencias, adaptacion a cambios de API de terceros): el modelo puede inspeccionar el manifiesto de dependencias, localizar los puntos de uso afectados y proponer los cambios, invocando herramientas de build y test.
- Agentes de analisis de datos con tool calling: conectar el modelo a un interprete de Python o a un motor SQL y dejar que planifique consultas y las corrija cuando fallen.
- Generacion de codigo en produccion dentro de un pipeline interno: al ser Apache 2.0, se puede integrar en herramientas corporativas sin negociar licencias por asiento.

## Benchmarks y rendimiento

La model card incluye dos imagenes con graficas de resultados (una comparativa general y otra especifica de SWE-bench Pro), pero no reproduce las cifras en texto. En la informacion disponible no hay valores numericos de MMLU, HumanEval, GSM8K, SWE-bench ni de ningun otro benchmark. Como unica referencia cualitativa, el autor afirma que el modelo alcanza un rendimiento comparable al de modelos con entre 10 y 20 veces mas parametros activos.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en BF16/FP16: aproximadamente 160 GB solo para pesos (79,7B parametros x 2 bytes). El repositorio ocupa 159,4 GB, coherente con ese calculo. Exige configuraciones multi-GPU.
- VRAM en FP8: del orden de 80 GB para pesos, mas cache KV y activaciones.
- VRAM en cuantizacion de 4 bits: estimada en el entorno de 40-45 GB para pesos, lo que sigue dejando fuera a una unica GPU de 24 GB.
- GPUs recomendadas: el ejemplo oficial de despliegue usa paralelismo tensorial sobre 4 GPUs y sugiere `--tp-size 2`, lo que encaja con 2x H100 80 GB o 2x A100 80 GB en BF16 (ajustado, con contexto reducido) y con 1x H100 80 GB en FP8. Para 4 bits, una sola GPU de 48-96 GB (por ejemplo, RTX PRO 6000 o A100 80 GB) seria lo comodo.
- Consumer GPU: no cabe en una RTX 4090 de 24 GB, ni siquiera en 4 bits. Harian falta al menos 3x RTX 4090 (72 GB agregados) o 2x RTX 5090 para una cuantizacion agresiva con contexto recortado. La model card recomienda reducir el contexto a 32.768 tokens en caso de OOM.
- Cache KV: la disposicion hibrida limita la atencion completa a 12 de las 48 capas y usa solo 2 cabezas KV, lo que reduce de forma notable el coste de cache frente a un transformer denso de contexto equivalente. Aun asi, con 262.144 tokens el consumo no es despreciable.
- Opciones de despliegue: vLLM (>= 0.15.0) y SGLang (>= 0.5.8) para endpoints compatibles con OpenAI, con `--tool-call-parser qwen3_coder`. La model card menciona ademas soporte de la familia Qwen3 en Ollama, LM Studio, MLX-LM, llama.cpp y KTransformers (a verificar para esta variante concreta).
- Latencia y throughput: no disponible. No hay cifras publicadas en la informacion proporcionada; con 3B de parametros activos, el throughput esperado es alto en relacion con el tamano total del modelo, pero no se aportan mediciones.

## Comparativa con modelos similares

La comparacion se establece con los otros miembros de la propia familia Qwen3-Coder, que son las alternativas naturales. Los datos de los modelos comparados no aparecen en la informacion proporcionada y proceden del conocimiento general de la familia, por lo que conviene verificarlos en las fichas oficiales.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Coder-Next | ~80B (79,7B medidos) | 3B | 262.144 tokens nativos | Apache 2.0 | Pesos abiertos en el Hub |
| Qwen3-Coder-480B-A35B | ~480B | 35B | 262.144 tokens nativos | Apache 2.0 | Pesos abiertos en el Hub |
| Qwen3-Coder-30B-A3B | ~30B | ~3B | 262.144 tokens nativos | Apache 2.0 | Pesos abiertos en el Hub |
| Modelos propietarios de codigo de gran escala | no disponible | no disponible | no disponible | Propietaria | Solo via API |

El eje diferenciador de Qwen3-Coder-Next es la combinacion de contexto de 256K con solo 3B de parametros activos, que lo situa entre el modelo pequeno de la familia (30B-A3B) y el grande (480B-A35B): comparte el presupuesto de computo por token del primero y se acerca al segundo en capacidad total. Comparativas de rendimiento con alternativas de otros fabricantes: no disponible, al no haber cifras de benchmarks en la informacion proporcionada.

## Limitaciones y advertencias

- Solo modo no-thinking: no genera bloques `<think></think>` ni ofrece razonamiento explicito separado. Si el flujo de trabajo depende de ese modo, este modelo no lo cubre.
- La model card no especifica idiomas soportados. El comportamiento en castellano no esta documentado y deberia validarse antes de usarlo en produccion.
- Riesgo de alucinacion inherente a los modelos de codigo: puede inventar APIs, funciones o ficheros inexistentes, especialmente en repositorios grandes donde el contexto relevante queda diluido.
- Al ser un modelo orientado a agentes, los fallos pueden encadenarse: un paso erroneo de tool calling puede arrastrar el resto del plan. Conviene imponer validacion externa y limites de iteraciones.
- Con 3B de parametros activos, es previsible una menor robustez que modelos densos mucho mayores en tareas de razonamiento abstracto ajenas al codigo, aunque no se aportan mediciones que lo cuantifiquen.
- Consumo de recursos elevado: aunque la inferencia sea barata por token, el despliegue exige ~160 GB en BF16 y varias GPU de gama alta, lo que descarta el uso en portatiles o en una unica GPU de consumo.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion sin royalties, con las obligaciones habituales de conservar avisos de licencia. La model card enlaza a la licencia del repositorio original de Qwen, no a una propia de este reupload.
- Repositorio con 0 descargas y 0 likes, subido por un tercero (ANGELOSEGRETO) y no por Qwen. Se recomienda verificar la integridad de los pesos y preferir el repositorio oficial `Qwen/Qwen3-Coder-Next` para despliegues en produccion.
- La model card original fue truncada en la informacion recibida (la seccion de agentic coding queda cortada), por lo que puede haber detalles adicionales de uso no recogidos aqui.
- Los ejemplos oficiales de despliegue mencionan 4 GPUs en el texto pero usan `--tp-size 2` en los comandos; conviene dimensionar en funcion del presupuesto de VRAM real.

## Enlaces

- Repositorio en HuggingFace (reupload): https://huggingface.co/ANGELOSEGRETO/Qwen3-Coder-Next
- Repositorio oficial de referencia: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Licencia referenciada en la model card: https://huggingface.co/Qwen/Qwen3-Coder-Next/blob/main/LICENSE
- Blog de anuncio: https://qwen.ai/blog?id=qwen3-coder-next
- Repositorio GitHub: https://github.com/QwenLM/Qwen3-Coder
- Documentacion: https://qwen.readthedocs.io/en/latest/
- SGLang: https://github.com/sgl-project/sglang
- Documentacion de instalacion de SGLang: https://docs.sglang.ai/get_started/install.html
- vLLM: https://github.com/vllm-project/vllm
- Documentacion de instalacion de vLLM: https://docs.vllm.ai/en/stable/getting_started/installation/index.html

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los unicos resultados obtenidos fueron contenido no relacionado y de caracter adulto, por lo que se han descartado y no se incluyen.
