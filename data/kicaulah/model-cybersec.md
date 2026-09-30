# Kicaulah/model-cybersec

## Resumen

Kicaulah/model-cybersec es un ajuste fino de tipo instruction-tuning sobre Qwen/Qwen2.5-3B-Instruct, orientado a ciberseguridad defensiva y publicado por el usuario Kicaulah dentro de un stack multi-agente denominado Kicaulah AI. El modelo se presenta como un "especialista en ciberseguridad" con persona definida: un ingeniero de seguridad senior que explica con analogias cotidianas, prioriza la accion sobre la alarma y rechaza explicitamente ayudar en ataques contra sistemas que el usuario no posee. El ajuste se realizo con QLoRA y posterior fusion de los adaptadores (merge-LoRA) sobre el modelo base.

Se trata de un modelo pequeno (aproximadamente 3.000 millones de parametros) entrenado sobre un unico idioma declarado, el ingles, con una ventana de contexto de 4k tokens segun la model card. Forma parte de un sistema de cinco especialistas mas un router que se sirve a traves de un endpoint compatible con la API de OpenAI, lo que permite integrarlo en clientes como Open WebUI, LibreChat, Cline, Continue, Aider, LangChain o LiteLLM sin cambios de codigo.

La relevancia de esta ficha es doble. Por un lado, el modelo ilustra un patron habitual en el ecosistema open source: ajustes de dominio sobre modelos base pequenos, con licencia Apache 2.0 y foco en el tono y el encuadre defensivo mas que en capacidades nuevas. Por otro, conviene senalar desde el principio que, en la fecha de publicacion de la informacion disponible (30 de septiembre de 2026), los pesos no estan publicados: el repositorio describe el entrenamiento y ofrece el system prompt, pero no contiene safetensors descargables. Las descargas y los likes registrados son cero y no hay resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B-Instruct) |
| Parametros totales | ~3.000 millones (aproximadamente 3B, segun la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4k tokens declarados en la model card (el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens nativos, dato no confirmado para este ajuste) |
| Tipos de cuantizacion | No disponible (no se han publicado pesos ni versiones GGUF/AWQ/GPTQ). El entrenamiento se realizo con QLoRA en 4 bits |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Declarado safetensors en la model card, pero los pesos no estan publicados |
| Desarrollador | Kicaulah |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Metodo de ajuste | QLoRA con fusion posterior de adaptadores (merge-LoRA), SFT |
| Pipeline | text-generation |
| Libreria | transformers |
| API compatible | Endpoint compatible con OpenAI (router + cinco especialistas) |
| Fecha de creacion | 30 de septiembre de 2026 |
| Ultima actualizacion | 30 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-3B-Instruct: un transformer decoder-only con atencion causal, codificacion posicional rotatoria (RoPE), atencion con consultas agrupadas (GQA) y capas feed-forward con activacion SwiGLU. No se introduce ninguna innovacion arquitectonica propia; el trabajo del autor se concentra en el ajuste de instrucciones y en la definicion de persona. El ajuste se realizo mediante QLoRA (cuantizacion en 4 bits durante el entrenamiento) y posterior fusion de los adaptadores en los pesos base, un flujo que el propio repositorio documenta en el script `scripts/05_train_cybersec.py`, pensado para ejecutarse en una GPU de 16 GB (se menciona explicitamente una Colab T4).

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO posteriores al SFT. Tampoco se documentan tecnicas de decodificacion especulativa, atencion lineal ni optimizaciones de inferencia mas alla de las del modelo base. La innovacion declarada es de naturaleza conversacional: el modelo se ha ajustado para evitar aperturas formulaicas del tipo "Certainly! Here's an explanation of..." y para responder con un registro mas natural y menos robotico, con etiquetas como `anti-robotic`, `emotion`, `empathy` y `natural-language`. El elemento tecnicamente mas reutilizable del repositorio no son los pesos, sino el system prompt de persona y alcance, que el autor indica que funciona en cualquier modelo instruct.

## Capacidades

- Generacion de texto conversacional en ingles con persona estable definida por system prompt (ingeniero de seguridad senior, tono directo, analogias cotidianas, humor seco ocasional).
- Ciberseguridad defensiva: explicacion de amenazas, habitos seguros, proteccion de cuentas, comprension de phishing y ingenieria social, guias de higiene digital.
- Encuadre de alcance: rechaza proporcionar instrucciones paso a paso para atacar sistemas ajenos, eludir autenticacion o exfiltrar datos, y redirige la peticion hacia el lado defensivo. Acepta explicitamente casos de pruebas de seguridad autorizadas, CTF y defensa de infraestructura propia.
- Soporte de escenarios de aprendizaje y orientacion profesional en seguridad, incluyendo la explicacion del interes legitimo subyacente a peticiones ambiguas.
- Integracion como especialista en un sistema multi-agente con router: cinco especialistas mas un router servidos mediante protocolo compatible con OpenAI.
- Compatibilidad con tool calling / function calling: no documentada de forma explicita en la informacion disponible; se heredaria, en su caso, del modelo base. Indicado como no confirmado.
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente para este ajuste.
- Multilingue: no. El unico idioma declarado es el ingles.
- Capacidades especiales: modo de razonamiento explicito (thinking mode), vision o audio: no disponibles.

## Casos de uso

- Concienciacion en ciberseguridad para empleados: el modelo puede generar y mantener conversaciones formativas sobre phishing, contrasenas y 2FA en lenguaje llano, con analogias del tipo "una cuenta es una casa y la contrasena es la puerta". Es adecuado porque su persona evita el tono de manual corporativo y su alcance defensivo reduce el riesgo de que derive en contenido ofensivo.
- Asistente de autodefensa digital para usuarios finales: responderia a consultas como "como protejo mis cuentas" con listas concretas y accionables en lugar de advertencias abstractas, un formato util para portales de ayuda o bots de soporte.
- Reutilizacion del system prompt como capa de persona en otros modelos: dado que los pesos no estan publicados, la via inmediata de uso es copiar el prompt de sistema (disponible en la demo) y aplicarlo sobre cualquier modelo instruct, obteniendo el mismo registro sin descargar nada.
- Especialista de dominio dentro del stack Kicaulah AI: el modelo ocupa la posicion de experto en ciberseguridad y el router deriva a el las consultas del ambito. Se sirve en `http://localhost:8000/v1` mediante `scripts/serve.py` y se consume con el SDK de OpenAI, lo que permite integrarlo en Open WebUI, LibreChat, Cline, Continue, Aider, LangChain o LiteLLM.
- Apoyo a formacion reglada y materiales didacticos: util para generar ejercicios, explicaciones y guiones de clase sobre seguridad defensiva, con la ventaja de que el modelo declara su alcance y deriva a fuentes verificables cuando el dato puede estar desactualizado.
- Soporte a equipos en CTF y pruebas autorizadas: puede ayudar a razonar sobre superficie de ataque, configuracion segura y buenas practicas de hardening en entornos propios o con autorizacion explicita, manteniendo el encuadre defensivo.
- Generacion de checklists y politicas ligeras para pymes: el modelo esta orientado a producir listas pequenas y concretas, lo que encaja en la elaboracion de guias de higiene digital, politicas de contrasenas o procedimientos basicos de respuesta.
- Triaje explicativo de vulnerabilidades: puede traducir avisos tecnicos a lenguaje comprensible para audiencias no tecnicas, aunque el propio system prompt exige recomendar la verificacion contra NVD o el aviso del fabricante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye resultados de MMLU, HumanEval, GSM8K, CySecBench ni de ninguna otra evaluacion, y al no existir pesos descargables no es posible reproducir una medicion independiente. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones basadas en el tamano declarado de ~3B parametros, no en mediciones publicadas del modelo):
  - bfloat16 / float16: aproximadamente 6,0-6,5 GB de pesos, mas cache KV (a 4k de contexto, poco significativa; a 32k, varios GB adicionales).
  - int8: aproximadamente 3,5 GB de pesos.
  - int4 (Q4_K_M o equivalente): aproximadamente 2,0-2,3 GB de pesos.
- GPU recomendadas: NVIDIA T4 (16 GB, la citada por el autor para el entrenamiento), RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100. Para servir varias instancias o el stack completo de cinco especialistas conviene una GPU con 24 GB o mas.
- Cabe en GPU de consumo: si. En bfloat16 cabe en tarjetas de 8 GB o mas con margen ajustado, y en cuantizacion de 4 bits en tarjetas de 6-8 GB. El propio autor indica que el script de entrenamiento se ejecuta en una Colab T4 de 16 GB.
- Opciones de despliegue: `transformers` con `pipeline` (ejemplo incluido en la model card), servidor propio compatible con OpenAI mediante `scripts/serve.py`, y cualquier cliente compatible con ese protocolo (vLLM o LiteLLM como capas de servicio, Ollama o llama.cpp unicamente si se generan pesos GGUF, que no estan publicados).
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo, TTFT ni resultados de carga concurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Pesos publicados | Benchmarks publicados |
|---|---|---|---|---|---|---|
| Kicaulah/model-cybersec | ~3B | 4k (declarado) | Apache 2.0 | Ingles | No | No |
| Qwen/Qwen2.5-3B-Instruct (base) | ~3,09B | 32.768 tokens nativos (hasta 131.072 con YaRN) | Apache 2.0 (licencia Qwen) | Multilingue (29+) | Si | Si, publicados por el autor del modelo base |
| Llama-3.2-3B-Instruct | ~3,2B | 128k | Llama 3.2 Community License | Multilingue (8) | Si | Si |
| Phi-3.5-mini-instruct | ~3,8B | 128k | MIT | Multilingue (reducido) | Si | Si |

La comparacion relevante no es de rendimiento, porque el modelo no publica mediciones, sino de disponibilidad: frente a los tres alternativas, que distribuyen pesos y resultados, Kicaulah/model-cybersec ofrece de momento unicamente la definicion de persona y el flujo de entrenamiento. En cuanto a datos de benchmarks comparados, no disponible.

## Limitaciones y advertencias

- Los pesos no estan publicados. La propia model card indica "Weights not published yet" y describe el comando necesario para publicarlos. El repositorio declara formato safetensors, pero no hay artefactos descargables, por lo que el modelo no es usable hoy como modelo local.
- Sin validacion independiente: cero descargas, cero likes y ausencia total de benchmarks. No hay evidencia publica sobre calidad, robustez o tasa de alucinacion.
- Riesgo de alucinacion en datos dependientes del tiempo: el propio system prompt instruye al modelo a recomendar la verificacion contra NVD o los avisos del fabricante, lo que reconoce implicitamente que puede manejar informacion de seguridad desactualizada o incorrecta.
- Sesgo de alcance: el ajuste esta disenado explicitamente para uso defensivo y rechaza peticiones ofensivas. Esto es una decision de producto, no una garantia tecnica: no se documentan mecanismos de salvaguarda mas alla del prompt, y en modelos de 3B los comportamientos inducidos por prompt pueden degradarse ante entradas adversarias.
- Limitacion idiomatica: solo ingles declarado. El uso en castellano no esta soportado ni evaluado, y cabria esperar degradacion notable del registro y la coherencia.
- Limitacion de contexto: 4k tokens declarados, por debajo de los 32.768 del modelo base. Conversaciones largas o documentos extensos requeriran truncado o resumen externo.
- Riesgo de olvido catastrofico: es habitual que un ajuste QLoRA de instrucciones sobre un modelo de 3B degrade capacidades generales (matematicas, codigo, conocimiento enciclopedico) no presentes en los datos de ajuste. No hay evaluacion que lo descarte.
- Licencia: Apache 2.0 declarada para este repositorio, lo que permitiria uso comercial, pero al no existir pesos la licencia es, en la practica, inaplicable. Ademas, el uso de pesos derivados de Qwen2.5 queda sujeto a las condiciones del modelo base.
- Cautela con material generado: cualquier procedimiento de seguridad producido por el modelo debe validarse antes de aplicarlo en produccion, dado el riesgo de omisiones o recomendaciones obsoletas.
- Inconsistencia documental menor: el texto describe "cinco modelos" mas router pero menciona "all six system prompts"; conviene no asumir una arquitectura cerrada sin revisar el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kicaulah/model-cybersec
- Perfil del autor: https://huggingface.co/Kicaulah
- Perfil de modelos del autor: https://huggingface.co/Kicaulah/models
- Demo en vivo (Space con los seis system prompts copiables): https://huggingface.co/spaces/Kicaulah/Kicaulah-AI-Demo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Script de entrenamiento y publicacion citado en la model card: `scripts/05_train_cybersec.py` (en el repositorio del modelo)
- Script de servidor compatible con OpenAI citado en la model card: `scripts/serve.py` (en el repositorio del modelo)
- Recursos externos relacionados con evaluacion en ciberseguridad:
  - CySecBench, dataset de 12.662 prompts para benchmarking en ciberseguridad: https://github.com/cysecbench/dataset
  - Listado de modelos etiquetados como cybersecurity en HuggingFace: https://huggingface.co/models?other=cybersecurity
  - Awesome AI for Security: https://github.com/AmanPriyanshu/Awesome-AI-For-Security
  - Recopilacion de benchmarks de ciberseguridad (septiembre de 2026): https://benchlm.ai/cybersecurity
