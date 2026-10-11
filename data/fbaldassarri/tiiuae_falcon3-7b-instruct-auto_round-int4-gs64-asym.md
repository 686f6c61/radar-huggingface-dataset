# fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_round-int4-gs64-asym

## Resumen

Este repositorio contiene una version cuantizada a INT4 de tiiuae/Falcon3-7B-Instruct, el modelo de instrucciones de unos 7.000 millones de parametros desarrollado por el Technology Innovation Institute (TII) de Abu Dabi. La cuantizacion la firma el usuario fbaldassarri mediante Intel AutoRound 0.15.1, aplicando cuantizacion de solo pesos (weights-only quantization, WoQ) de 4 bits, asimetrica y con group size de 64. El artefacto resultante ocupa unos 6,8 GB en safetensors y busca reducir el consumo de memoria y acelerar la inferencia entre 2 y 3 veces respecto al modelo en bf16, a cambio de una ligera perdida de precision.

El modelo base es un transformer decoder-only de tipo Llama (campo model_type: llama) con 32.768 tokens de contexto, afinado para instrucciones y conversacion, orientado a tareas de razonamiento, comprension del lenguaje, seguimiento de instrucciones, codigo y matematicas. Esta version cuantizada esta pensada explicitamente para inferencia en CPU Intel, iGPU Intel Arc (via intel-extension-for-pytorch) y NPU Intel (AI Boost de la serie Core Ultra, via OpenVINO).

Su relevancia practica esta en que permite desplegar un modelo de 7B en hardware modesto o sin GPU dedicada, manteniendo la licencia Apache 2.0, lo que facilita su uso en entornos de produccion e investigacion con restricciones de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM); model_type declarado: llama |
| Parametros totales | ~7.000 millones (modelo base Falcon3-7B-Instruct); los safetensors de este repo declaran 1.753.635.840 elementos, cifra coherente con el empaquetado de pesos INT4 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Falcon3-7B-Instruct) |
| Tipos de cuantizacion | INT4 asimetrica (sym=false), group size 64, WoQ/SignRound via Intel AutoRound 0.15.1; ajuste realizado en torch.bfloat16 |
| Idiomas soportados | ingles (en); el modelo base esta orientado principalmente a ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato de cuantizacion auto_round), library_name transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Falcon3-7B-Instruct: un transformer decoder-only de tipo Llama con atencion causal, entrenado por TII y afinado para instrucciones. Este repositorio no entrena un modelo nuevo, sino que aplica cuantizacion de solo pesos sobre los pesos del modelo base sin modificar la topologia de la red. La cuantizacion emplea el algoritmo SignRound de Intel AutoRound, que optimiza de forma iterativa los parametros de redondeo (escalas y puntos cero) en lugar de redondear directamente al valor mas cercano.

Los detalles del proceso de cuantizacion estan documentados en la model card: se cargaron los pesos en bfloat16, se usaron 128 muestras de calibracion, 200 iteraciones de ajuste, una longitud de secuencia de calibracion de 512 tokens y un tamano de lote de 4, todo sobre CPU. La ejecucion completa duro 48.715,1 segundos (811,9 minutos) y finalizo el 2 de octubre de 2026. La configuracion concreta es INT4, group size 64, asimetrica. No hay informacion disponible sobre el numero de tokens de entrenamiento del modelo base ni sobre las etapas de RLHF/DPO, ya que esa informacion no forma parte de este repositorio cuantizado.

## Capacidades

- Generacion de texto y conversacion multi-turno mediante su plantilla de chat integrada; el autor indica que debe usarse apply_chat_template y no prompts de texto plano.
- Razonamiento, comprension del lenguaje, seguimiento de instrucciones, codigo y matematicas, segun las capacidades declaradas del modelo base Falcon3-7B-Instruct.
- Formato instruct/chat: responde a mensajes estructurados con roles (user, assistant).
- Capacidad multilingue limitada al ingles; no se declaran otros idiomas.
- No se declaran capacidades de vision, audio ni multimodalidad.
- No hay informacion disponible en la model card sobre soporte de tool calling o function calling en esta version.
- No hay informacion disponible sobre un modo de razonamiento explicito (thinking mode) o decodificacion especulativa.

## Casos de uso

- Asistente conversacional sobre CPU Intel: el modelo esta cuantizado para ejecutarse en CPU, iGPU Intel Arc y NPU Intel, de modo que puede integrarse en aplicaciones de escritorio o servidores sin GPU dedicada.
- Despliegue en portatiles con Intel Core Ultra: al estar preparado para la NPU AI Boost via OpenVINO, permite ejecutar un asistente de 7B en local con bajo consumo, util para herramientas ofimaticas o asistentes personales.
- Atencion al cliente automatizada en ingles: con 32.768 tokens de contexto puede gestionar conversaciones multi-turno y consultas con historial largo sin perder el hilo.
- Generacion y asistencia de codigo en IDE: el modelo base destaca en tareas de codigo, por lo que esta version INT4 sirve para autocompletado y explicacion de fragmentos en entornos con memoria limitada.
- Resumen y extraccion de informacion de documentos largos en ingles: su ventana de contexto permite procesar informes o articulos extensos en una sola pasada sobre hardware de gama media.
- Prototipado e investigacion en cuantizacion: el repositorio incluye la receta de replicacion completa (pipeline, versiones y comandos), lo que lo hace util para reproducir y comparar variantes INT4/INT8.
- Backend economico de inferencia para demos y pruebas A/B: al reducir memoria y latencia, permite levantar varios servicios de prueba en un mismo servidor sin GPU.
- Tutoria educativa en ingles: resolucion guiada de problemas de matematicas y explicaciones paso a paso con bajo coste de computo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente afirma una aceleracion de "2-3X" y una "ligera perdida de precision" en la configuracion W4G64, sin aportar cifras concretas de MMLU, HumanEval, GSM8K ni similares, ni para el modelo base ni para cuantizado.

## Requisitos de hardware

- VRAM orientativa (estimacion, no facilitada por el autor): con pesos INT4 de ~7B, los pesos ocupan en torno a 3,5-4 GB; sumando cache KV y activaciones, cabe esperar ~5-6 GB para contextos moderados y ~8-10 GB si se explota buena parte de los 32.768 tokens.
- GPU consumer: deberia caber sin problemas en tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080) y con holgura en una RTX 4090 de 24 GB.
- GPU de datacenter: A100, H100 o L40S permiten servir varias instancias o contextos largos con margen amplio.
- Hardware objetivo declarado: el repositorio esta optimizado para Intel CPU, iGPU Intel Arc (via intel-extension-for-pytorch) y NPU Intel AI Boost (serie Core Ultra, via OpenVINO).
- Opciones de despliegue: transformers (dado que el tag incluye text-generation-inference, es compatible con TGI). Para llama.cpp u Ollama haria falta una version GGUF, que no se proporciona en este repositorio. AutoRound admite tambien rutas CUDA y ROCm, aunque este artefacto concreto se calibro en CPU.
- Latencia y throughput: el autor declara una aceleracion de 2-3 veces frente al modelo en bf16, pero no se ofrecen cifras de tokens por segundo ni de latencia por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|
| Este repo (auto_round int4 gs64 asym) | ~7B | 32.768 tokens | INT4, gs64, asimetrica, WoQ | Apache 2.0 |
| fbaldassarri/...auto_round-int4-gs64-sym | ~7B | 32.768 tokens | INT4, gs64, simetrica, WoQ | Apache 2.0 |
| fbaldassarri/...auto_gptq-int8-gs64-asym | ~7B | 32.768 tokens | INT8, gs64, asimetrica | Apache 2.0 |
| fbaldassarri/...autoawq-int4-gs128-sym | ~7B | 32.768 tokens | INT4, gs128, simetrica (AWQ) | no disponible |
| tiiuae/Falcon3-7B-Instruct (bf16, original) | ~7B | 32.768 tokens | sin cuantizar | Apache 2.0 |

## Limitaciones y advertencias

- La cuantizacion INT4 introduce una perdida de precision respecto al modelo en bf16; el propio autor la describe como "ligera" pero no la cuantifica, por lo que conviene validarla en la tarea concreta antes de usarla en produccion.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; al ser un modelo entrenado principalmente en ingles, heredara los sesgos del corpus del modelo base.
- Riesgo de alucinacion: inherente a los modelos generativos; se acentua con la cuantizacion agresiva a 4 bits.
- Idioma: soporta unicamente ingles, lo que limita su uso en aplicaciones en castellano u otros idiomas sin un ajuste adicional.
- La model card declara `inference: false` en los metadatos y describe el modelo como desarrollado "solo para fines de investigacion", pese a que la licencia sea Apache 2.0; conviene revisar este punto antes de un despliegue comercial.
- Aunque la licencia del repositorio es Apache 2.0, conviene verificar la licencia exacta del modelo base Falcon3-7B-Instruct de TII para uso comercial, dado que algunos artefactos derivados de esta familia aparecen con otra licencia.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validacion de la comunidad sobre su calidad o estabilidad.
- No incluye formato GGUF, por lo que no es directamente utilizable en llama.cpp u Ollama.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_round-int4-gs64-asym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-7B-Instruct
- Variante simetrica INT4 gs64: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_round-int4-gs64-sym
- Variante INT8 gs64 asimetrica (auto_gptq): https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_gptq-int8-gs64-asym
- Variante AUTOAWQ INT4 gs128 simetrica: https://friendli.ai/models/fbaldassarri/tiiuae_Falcon3-7B-Instruct-autoawq-int4-gs128-sym
- Variante autogptq INT4 gs128 asimetrica: https://api-inference.hf-mirror.com/fbaldassarri/tiiuae_Falcon3-7B-Instruct-autogptq-int4-gs128-asym/discussions
- Intel AutoRound (framework de cuantizacion): https://github.com/intel/auto-round
- Pipeline de replicacion auto-round-pipeline: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- Espejo del modelo base (modelhub): https://dev.modelhub.org.cn/tiiuae/Falcon3-7B-Instruct
