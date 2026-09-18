# ArturMansur/boombap-qwen-lora

## Resumen

BoomBap Heritage - Assistente Virtual (BoomBot) es un adaptador LoRA publicado por el usuario ArturMansur en HuggingFace bajo el identificador `ArturMansur/boombap-qwen-lora`. Se trata de un ajuste fino mediante PEFT con QLoRA sobre el modelo base `unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit`, que a su vez deriva de Qwen2.5-3B-Instruct. El modelo esta entrenado para interpretar el papel de BoomBot, el asistente virtual de una marca ficticia de streetwear llamada BoomBap Heritage, inspirada en la estetica de la Golden Era del hip-hop de los anos 80 y 90.

El problema que resuelve es acotado y de naturaleza demostrativa: atender consultas sobre un catalogo concreto de productos (moletons The Block, conjuntos B-Boy Stance, camisetas Five Elements), resolver objeciones de compra, explicar politicas de cambio y detallar el club de suscripcion The Crate Digger Box. No es un modelo de proposito general ni un lanzamiento de laboratorio: su relevancia practica esta en servir como ejemplo reproducible de como adaptar un modelo de 3.000 millones de parametros con QLoRA para un dominio de negocio muy especifico.

El repositorio ocupa aproximadamente 0,1 GB, lo que confirma que contiene unicamente los pesos del adaptador y no el modelo completo. El tamano de parametros totales del modelo base es de 3B, la licencia declarada es Apache 2.0 y la unica lengua etiquetada es el ingles, aunque la model card y los ejemplos de uso estan redactados en portugues, una discrepancia relevante para quien pretenda desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajustado con PEFT/QLoRA |
| Parametros totales | 3B (heredados del modelo base Qwen2.5-3B-Instruct); el adaptador LoRA anadido no se cuantifica en la informacion disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens en el ejemplo de carga proporcionado por el autor; la longitud nativa del modelo base no se especifica en la informacion disponible |
| Tipos de cuantizacion | Entrenamiento e inferencia en 4 bits (bitsandbytes, `load_in_4bit=True`); pesos del adaptador en safetensors |
| Idiomas soportados | Ingles (etiqueta declarada en el repositorio); la model card y los ejemplos estan en portugues |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA); compatible con transformers y text-generation-inference |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-3B-Instruct, un transformer decoder-only de la familia Qwen2.5 con atencion causal estandar y soporte de plantilla de chat con roles system, user y assistant. Sobre el se aplico un ajuste fino supervisado con TRL y la libreria Unsloth mediante PEFT en modalidad QLoRA: el modelo base se carga cuantizado a 4 bits y se entrenan adaptadores de bajo rango, lo que reduce de forma notable los requisitos de memoria frente a un ajuste completo. El autor no documenta el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni hiperparametros como rango, alpha o dropout del adaptador.

La innovacion tecnica relevante no esta en el modelo en si, sino en el flujo de trabajo: cuantizacion de 4 bits combinada con Unsloth para acelerar el entrenamiento y mantener la inferencia en el mismo formato cuantizado, con `FastLanguageModel.for_inference()` como paso explicito de optimizacion. El resultado es un artefacto pequeno (0,1 GB) que se superpone al modelo base en tiempo de carga, un patron muy habitual para personalizaciones de dominio con coste minimo de almacenamiento y distribucion.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat compatible con el formato Qwen2.5.
- Atencion al cliente orientada a producto: descripcion de articulos del catalogo ficticio (moletons The Block, conjuntos B-Boy Stance, camisetas Five Elements).
- Gestion de objeciones de compra y argumentacion comercial dentro del guion de la marca.
- Explicacion de politicas de cambio y devolucion segun lo definido en la model card.
- Detalle del club de suscripcion The Crate Digger Box.
- Personalizacion de tono y personalidad mediante mensaje de sistema, tal como muestra el ejemplo de inferencia del autor.
- Capacidades heredadas del modelo base Qwen2.5-3B-Instruct (razonamiento general, conocimiento factual y multilingue) potencialmente degradadas por el ajuste, aunque no se documenta el grado de olvido catastrofico.
- No se declara soporte de tool calling, function calling, uso agentico, vision, audio ni modo de razonamiento extendido (thinking) especifico de este ajuste.
- No se documentan capacidades de generacion de codigo o matematicas mas alla de las heredadas del modelo base.

## Casos de uso

- Prototipo de atencion al cliente para e-commerce de moda: el adaptador responde consultas frecuentes sobre productos concretos y puede desplegarse sobre el modelo base en una GPU de gama media, sirviendo como prueba de concepto antes de invertir en un ajuste mayor.
- Base para un asistente de marca con personalidad definida: el mensaje de sistema del ejemplo permite fijar el tono de BoomBot, de modo que cualquier producto o servicio puede reutilizar la misma receta de QLoRA con su propio catalogo.
- Simulacion de conversaciones comerciales para formacion de equipos de venta: el modelo puede encarnar al cliente o al vendedor y practicar el manejo de objeciones dentro del guion de la marca ficticia.
- Generacion de respuestas de FAQ a partir de documentacion interna: sustituyendo el dataset de entrenamiento por manuales de producto reales, el mismo pipeline produce un asistente de soporte de nivel 1.
- Investigacion sobre olvido catastrofico y adaptacion de dominio: al ser un ajuste de alcance muy estrecho sobre un modelo de 3B, resulta util para medir cuanto conocimiento general se conserva tras un QLoRA especializado.
- Demo docente de PEFT y QLoRA: el repositorio incluye codigo listo para ejecutar con Unsloth, lo que lo convierte en un ejemplo reproducible de extremo a extremo para talleres y cursos.
- Despliegue en entornos con restricciones de almacenamiento: al ocupar 0,1 GB, el adaptador se puede versionar, distribuir y servir junto a un unico modelo base compartido entre multiples asistentes de marca.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K ni ninguna otra) ni comparaciones cuantitativas con alternativas. Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2-3 GB para los pesos del modelo base en 4 bits, mas la memoria de la cache KV y el overhead del runtime; el adaptador LoRA anadido apenas incrementa el consumo. Cifras orientativas, ya que el autor no publica mediciones.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM deberia ser suficiente en 4 bits; tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores. Para mayor volumen de peticiones concurrentes, GPU de datacenter como A100 o H100 aportan margen de sobra.
- Cabe en GPU consumer: si, es uno de los puntos fuertes del ajuste, dado el tamano de 3B y la cuantizacion a 4 bits.
- Opciones de despliegue: Unsloth (`FastLanguageModel.from_pretrained` con `load_in_4bit=True`), transformers, text-generation-inference y vLLM son las vias coherentes con las etiquetas del repositorio; llama.cpp u Ollama requeririan convertir el adaptador a GGUF, conversion que no se documenta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ArturMansur/boombap-qwen-lora | 3B (adaptador LoRA sobre Qwen2.5-3B) | 2048 tokens en el ejemplo del autor | Ajuste de dominio | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen2.5-3B-Instruct (modelo base de referencia) | 3B | No especificado en la informacion disponible de esta ficha | Modelo instructivo general | Apache 2.0 | HuggingFace |
| unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit (base directo) | 3B | No especificado en la informacion disponible de esta ficha | Version cuantizada a 4 bits del anterior | Apache 2.0 | HuggingFace |
| Otros ajustes LoRA de dominio sobre modelos de 3B | 3B | Variable | Ajuste de dominio | Depende del autor | HuggingFace |

La comparacion con alternativas de otros fabricantes (Llama 3.2 3B Instruct, Gemma 2 2B o Phi-3.5-mini) no se incluye porque no se dispone de datos verificados en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: el modelo esta entrenado para una marca ficticia y un catalogo cerrado; fuera de ese guion es probable que improvise o invente informacion.
- Riesgo alto de alucinacion en productos, precios, plazos o politicas que no aparezcan en los datos de entrenamiento, algo especialmente delicado en un contexto de atencion al cliente.
- Discrepancia de idioma: la etiqueta del repositorio declara unicamente ingles, mientras que la model card y los ejemplos estan en portugues. Conviene validar el comportamiento real en ambos idiomas antes de usarlo en produccion.
- No se documenta el dataset de entrenamiento, su tamano ni su composicion, por lo que no es posible auditar sesgos ni evaluar la cobertura real del dominio.
- Ventana de contexto corta en la configuracion de ejemplo (2048 tokens), insuficiente para historiales de conversacion largos o documentacion extensa.
- Al ser un adaptador, requiere cargar el modelo base de 4 bits; no es un artefacto autonomo y su comportamiento depende de la version exacta de Unsloth, transformers y bitsandbytes.
- La licencia Apache 2.0 permite uso comercial del adaptador, pero conviene verificar tambien las condiciones del modelo base y de los datos de entrenamiento, no documentados.
- Estado de adopcion nulo en el momento de la consulta (0 descargas, 0 likes), sin evidencia de validacion por parte de terceros.
- No apto como asistente general: no se declaran capacidades de tool calling, agentes, vision ni modos de razonamiento extendido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ArturMansur/boombap-qwen-lora
- Modelo base directo: https://huggingface.co/unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Libreria Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL: https://github.com/huggingface/trl
- Los resultados de busqueda web proporcionados no contienen informacion relacionada con este modelo (devuelven unicamente paginas corporativas de Microsoft), por lo que no se han podido incorporar papers, blogs ni demos adicionales.
