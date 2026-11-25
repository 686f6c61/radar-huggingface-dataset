# jesdga/Inkling-2-Mini-Basalt

## Resumen

Inkling-2-Mini-Basalt es un empaquetado cuantizado y reempaquetado del modelo Inkling-2-Mini de Thinking Machines Lab, preparado por el autor jesdga para su uso con Basalt, un motor de inferencia local orientado a GPUs NVIDIA Blackwell (sm_120) que expone una API compatible con OpenAI y Anthropic. El modelo base es un transformer de tipo Mixture of Experts (MoE) con capacidades multimodales (vision y texto) y una ventana de contexto que, en este empaquetado, alcanza hasta 1.048.576 tokens.

El paquete incluye en un unico fichero autocentenido los pesos cuantizados, el codificador de vision, el tokenizer, la plantilla de chat y un drafter de decodificacion especulativa denominado DSpark. Los expertos enrutados de las capas 0-19 conservan la cuantizacion NVFP4 original de Thinking Machines sin re-redondeo, mientras que el resto de componentes se redondea una sola vez a Q8_0, BF16 o F32 segun su funcion.

Su relevancia actual radica en que permite ejecutar un modelo MoE multimodal de gran contexto en una unica tarjeta Blackwell (por ejemplo, una RTX 5090), con volcado selectivo de los expertos menos usados a RAM del sistema cuando el contexto solicitado no cabe en la VRAM. La licencia del modelo base es Apache-2.0 y el motor Basalt es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) multimodal con atencion y proyecciones cuantizadas; incluye drafter especulativo DSpark |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE con 128 expertos por capa y top-8 en capas 0-19) |
| Longitud de contexto | hasta 1.048.576 tokens (`--max-context`); opcion `--kv fp8` para reducir a la mitad la cache KV |
| Tipos de cuantizacion | NVFP4 (expertos enrutados capas 0-19), Q8_0 (expertos MXFP8 originales de capas 20-23, atencion, gate, convolucion corta y proyecciones de salida), BF16 (cabeza de salida, embeddings, encoder de vision, projector, drafter), F32 (norms, router, biases y tensores pequenos del bucle) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (modelo base); Basalt es MIT |
| Formato de pesos | `.basalt` (fichero unico autocentenido de 19,6 GB); no se distribuyen safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini, de Thinking Machines Lab, es un transformer de tipo Mixture of Experts con 24 capas, de las cuales las capas 0-19 emplean 128 expertos por capa con enrutamiento top-8. Incluye modulos de atencion, gate, convolucion corta ("short-convolution") y proyecciones de salida, ademas de un encoder de vision y un projector multimodal. El empaquetado incorpora tambien un drafter de decodificacion especulativa llamado DSpark, que propone hasta siete tokens por pasada y cuya salida es verificada, de modo que el texto final es el del propio modelo.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento en la informacion proporcionada. La innovacion tecnica destacable de este paquete es la preservacion bit a bit de la cuantizacion NVFP4 de los expertos originales en las capas 0-19, el redondeo unico del resto de componentes y la gestion dinamica de expertos: cuando el contexto solicitado no cabe junto a todos los expertos en la tarjeta, los expertos menos enrutados se trasladan a RAM del sistema y vuelven a la GPU a medida que la cache libera espacio.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, con niveles de esfuerzo de razonamiento configurables a traves de la plantilla de chat.
- Procesamiento de imagenes con `--vision dynamic`: cada imagen se lee a su tamano propio, con un token por celda de 40 x 40 pixeles, codificada dentro del motor.
- Soporte de tool calling y function calling a traves del servidor compatible con las APIs de OpenAI y Anthropic.
- Decodificacion especulativa con DSpark activada por defecto (hasta siete tokens por pasada, verificados); se puede desactivar con `--spec 1`.
- Contexto largo de hasta 1.048.576 tokens, con recuperacion de agujas ("needles") verificada a 131K y 400K tokens.
- Gestion de memoria adaptativa: volcado de expertos menos usados a RAM cuando el contexto excede la VRAM disponible.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional de contexto largo: el modelo puede mantener conversaciones multi-turno con documentos extensos adjuntos gracias a su ventana de hasta 1.048.576 tokens, util para analisis de contratos, expedientes o bases de conocimiento completas en una sola sesion.
- Analisis de documentos con imagenes: con `--vision dynamic`, puede procesar capturas, diagramas o paginas escaneadas junto con texto en la misma conversacion, adecuado para tareas de extraccion de informacion de informes mixtos.
- Agente con tool calling en produccion: la API compatible con OpenAI y Anthropic permite integrarlo en orquestadores de agentes existentes sin adaptadores adicionales, con llamadas a funciones para consultas a bases de datos o APIs externas.
- Despliegue local en estacion de trabajo con GPU Blackwell: al caber en una unica tarjeta (RTX 5090 en las pruebas del autor), es viable para entornos con requisitos de privacidad donde los datos no pueden salir de la maquina.
- Recuperacion aumentada sobre corpus masivos: con contexto de 400K-1M tokens y velocidad de prefill de aproximadamente 8.900-12.240 tok/s, permite inyectar grandes volumenes de documentacion sin trocear en exceso.
- Generacion asistida de codigo en pipelines internos: el soporte de tool calling y la API compatible permiten integrarlo en flujos de CI/CD o asistentes de IDE autoalojados.
- Analisis forense o de registros extensos: la capacidad de encontrar informacion ("needles") en contextos de 131K y 400K tokens lo hace adecuado para revisar logs o transcripciones muy largas en una sola pasada.

## Benchmarks y rendimiento

Calidad medida con `basalt-bench --quality` frente a la release oficial con expertos desquantizados a BF16 (referencia no equivalente a un BF16 real, segun el autor), sobre Wikitext-2 en fragmentos de 512 tokens:

| Fragmentos | PPL | PPL referencia | KLD media | Mismo top-1 |
|---:|---:|---:|---:|---:|
| 100 | 7,0695 | 7,0633 | 0,00305 | 97,76% |
| 20 | 7,6642 | 7,6534 | 0,00264 | 97,80% |

Rendimiento en una RTX 5090 a 400 W, todos los expertos en la tarjeta, DSpark activado, tokens/s:

| Conversacion | Estructurado | Prosa | Prefill (prompt de 16K) |
|---:|---:|---:|---:|
| 338 | 613 | 287 | 12.240 |

Lectura de prompts de 2K, 32K y 128K tokens: aproximadamente 14.100, 12.200 y 8.900 tok/s. Con `--max-context 1048576 --kv fp8` y expertos volcados a RAM segun necesidad: 264 tok/s en chat corto, 173 a 131K y 108 a 400K en decodificacion plana; un prompt de 400K se lee en unos 97 segundos.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero pesa 19,6 GB; con todos los expertos en la tarjeta cabe en una GPU de 24 GB o superior. Para contexto completo de 1M tokens con `--kv fp8` se requiere volcado de expertos a RAM del sistema.
- GPU recomendadas: NVIDIA Blackwell (sm_120), con una RTX 5090 validada por el autor a 400 W. Basalt esta especificamente orientado a esta generacion; no se documenta soporte para A100, H100 u otras arquitecturas en la informacion disponible.
- Cabe en GPU de consumo: si, en RTX 5090 (Blackwell). No se confirma compatibilidad con generaciones anteriores (RTX 4090, etc.).
- Opciones de despliegue: motor Basalt (`bin/basalt serve`), con API compatible con OpenAI y Anthropic. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 287-613 tok/s en generacion segun tipo de salida y 12.240 tok/s de prefill con prompt de 16K en RTX 5090; en modo contexto largo con volcado a RAM, 108-264 tok/s.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de modelos comparables de la misma categoria (MoE multimodal con contexto de 1M tokens) ni sus especificaciones, por lo que no es posible establecer una comparacion rigurosa sin inventar cifras.

## Limitaciones y advertencias

- Este paquete no es una release oficial de Thinking Machines Lab: es una modificacion (cuantizacion y reempaquetado) de los pesos originales realizada por un tercero.
- La referencia de calidad BF16 usada en las pruebas no es un modelo BF16 real (la release oficial no distribuye pesos BF16), por lo que su KLD no es comparable con la de otros modelos.
- El motor Basalt esta limitado a GPUs NVIDIA Blackwell (sm_120); no se documenta compatibilidad con otras arquitecturas, lo que restringe el despliegue en hardware no Blackwell.
- El rendimiento con contexto muy largo depende del volcado de expertos a RAM, con caida de throughput (108 tok/s a 400K) y latencia de lectura de prompts elevada (unos 97 s para 400K tokens).
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion especifico, idiomas soportados ni evaluaciones de seguridad en la informacion proporcionada.
- Aunque la licencia del modelo base es Apache-2.0, conviene verificar las condiciones de la release original de Thinking Machines Lab antes de un uso comercial, dado que este paquete es una modificacion de terceros.
- El formato de pesos es propietario del motor Basalt (`.basalt`), lo que limita la portabilidad a otros frameworks de inferencia.

## Enlaces

- [Hugging Face: jesdga/Inkling-2-Mini-Basalt](https://huggingface.co/jesdga/Inkling-2-Mini-Basalt)
- [Modelo base: thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [Web de Basalt](https://basalt.jgulfo.com)
- [Repositorio Basalt en GitHub](https://github.com/jesdga95/basalt)
- [Documentacion de Inkling 2 Mini en Basalt](https://github.com/jesdga95/basalt/blob/main/docs/models/inkling2.md)
- [Documentacion de modelos y router de Basalt](https://github.com/jesdga95/basalt/blob/main/docs/configuration/models.md)
- [Strata (fork base de Basalt)](https://github.com/Niko1221/Strata)
