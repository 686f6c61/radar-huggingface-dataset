# divakar7c5/wealthwand-qwen3-4b-instruct-2507-gguf

## Resumen

Este repositorio es una cuantizacion GGUF en formato Q4_0 del modelo Qwen/Qwen3-4B-Instruct-2507, publicada por el usuario divakar7c5 bajo licencia Apache-2.0. No es un modelo nuevo, sino una conversion del checkpoint oficial de Qwen a un unico fichero GGUF de aproximadamente 2,37 GB, pensada para ejecucion en dispositivo (on-device) mediante llama.cpp. Su proposito declarado es servir como motor de asistente local dentro de Wealth Wand, una aplicacion de finanzas personales local-first.

El modelo de partida, Qwen3-4B-Instruct-2507, es un transformer denso de 4.022.468.096 parametros con entrenamiento exclusivamente instruct (sin modo "thinking"), orientado a comprension y generacion de lenguaje, codigo y matematicas, y con soporte multilingue. La relevancia de esta ficha concreta radica en la eleccion de la cuantizacion Q4_0 frente a Q4_K_M: llama.cpp reempaqueta Q4_0 para sus kernels int8 de ARM (dotprod / i8mm), lo que segun el autor mejora notablemente la velocidad de lectura de prompt en telefonos manteniendo la misma velocidad de decodificacion.

Al tratarse de una conversion de pesos, el modelo hereda las capacidades y limitaciones del checkpoint base, con la degradacion de precision propia de una cuantizacion de 4 bits. El repositorio no documenta idiomas explicitos ni benchmarks estandar, y registra 0 descargas y 0 "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3); el repositorio distribuye pesos cuantizados a GGUF |
| Parametros totales | 4.022.468.096 (aprox. 4,02 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens (heredada de las especificaciones del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | Q4_0 (unica incluida en este repositorio); el autor la compara con Q4_K_M |
| Idiomas soportados | multilingue (heredado del modelo base); lista concreta no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Qwen3-4B-Instruct-2507: un transformer denso de aproximadamente 4.000 millones de parametros con atencion estandar y entrenamiento de tipo instruct. Segun la informacion disponible (Qualcomm AI Hub), esta variante "2507" se distingue del Qwen3-4B base en que solo incluye entrenamiento instruct, es decir, carece de soporte de modo "thinking". El repositorio que nos ocupa no entrena ni modifica el modelo: se limita a descargar los pesos oficiales, convertirlos a F16 con `convert_hf_to_gguf.py` y cuantizarlos a Q4_0 mediante `llama-quantize` con la version `b11620` de llama.cpp.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) en la documentacion proporcionada; esos datos corresponderian al modelo base y no se detallan aqui. La innovacion tecnica relevante de este repositorio es la eleccion del esquema de cuantizacion: llama.cpp reempaqueta Q4_0 para sus kernels int8 de ARM (dotprod / i8mm), lo que segun el autor acelera la lectura de prompt en telefonos compatibles. El autor reporta que en un Snapdragon 7 Gen 3 el modelo lee prompts a 20 tokens/s frente a 10 tokens/s de la misma cuantizacion en Q4_K_M, con igual velocidad de decodificacion.

## Capacidades

- Generacion de texto conversacional: pipeline declarado `text-generation`, etiquetado como `conversational`.
- Comprension y generacion de lenguaje: el modelo base destaca en comprension y generacion segun Qualcomm AI Hub.
- Codigo: el modelo base esta descrito como competente en tareas de programacion.
- Matematicas: el modelo base esta descrito como competente en matematicas.
- Multilingue: el modelo base es presentado como "state-of-the-art multilingual", aunque no se detalla la lista de idiomas.
- Ejecucion on-device: pensado para moviles Android arm64, iPhone y escritorios modestos mediante llama.cpp.
- Sin modo "thinking": a diferencia del Qwen3-4B base, esta variante no soporta razonamiento extendido con trazas de pensamiento.
- Tool calling / function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no confirmado en la informacion proporcionada.
- Vision o audio: no disponible (el modelo base es de texto).

## Casos de uso

- Asistente financiero local: es el uso declarado del repositorio, integrado en la app Wealth Wand para responder consultas de finanzas personales sin enviar datos a la nube, aprovechando la ejecucion on-device en movil.
- Clasificacion y respuesta a tareas financieras: el autor reporta que el modelo resuelve el 67% de 114 tareas de finanzas en su evaluacion interna, lo que lo hace apto para enrutado y respuesta de consultas de dominio acotado.
- Aplicaciones moviles offline: al caber en aproximadamente 2,37 GB y correr bajo llama.cpp, puede embeberse en apps Android/iPhone que deban funcionar sin conexion.
- Prototipado rapido en local: un unico fichero GGUF cargable en Ollama o LM Studio permite probar un asistente conversacional de 4B sin infraestructura GPU dedicada.
- Generacion y ayuda con codigo en entornos con recursos limitados: heredando la capacidad de codigo del modelo base, puede asistir en edicion o snippets sobre equipos de gama media.
- Educacion y tutoria de matematicas elemental: reutilizable para resolver y explicar problemas numericos basicos en un equipo de escritorio modesto.
- Preprocesado y resumen de texto en pipelines edge: util para resumir o extraer informacion en dispositivos sin acceso a servidores, dentro de las limitaciones de contexto del fichero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de evaluacion aportado por el autor es interno y especifico de su aplicacion:

| Metrica | Valor reportado | Contexto |
|---|---|---|
| Tareas de finanzas resueltas | 67% de 114 tareas | Evaluacion propia del autor para Wealth Wand |
| Comparativa con Qwen3-1.7B | 19%-42% de 114 tareas | Mismo conjunto interno |
| Lectura de prompt (Snapdragon 7 Gen 3) | 20 tokens/s | Cuantizacion Q4_0 |
| Lectura de prompt frente a Q4_K_M | 10 tokens/s (Q4_K_M) | Misma plataforma, misma decodificacion |

Estos datos proceden del autor del repositorio y no de un banco de pruebas independiente, por lo que deben interpretarse como indicativos.

## Requisitos de hardware

- Tamano del fichero: aproximadamente 2,37 GB en Q4_0 (el repo completo ocupa 2,4 GB).
- VRAM/RAM estimada para inferencia: del orden de 3 GB o mas para cargar el modelo mas el contexto; suficiente en la mayoria de telefonos y equipos de escritorio actuales.
- Moviles: validado por el autor en un Snapdragon 7 Gen 3 (lectura de prompt a 20 tokens/s); destinado tambien a iPhone y Android arm64.
- GPU de consumo: cabe holgadamente en tarjetas con 4-6 GB o mas de VRAM (por ejemplo, RTX 3050/3060 en adelante); tambien puede ejecutarse en CPU.
- Escritorios modestos: el autor indica que corre en "desktops mas pequenos".
- Opciones de despliegue: llama.cpp (formato nativo), y por compatibilidad de formato, Ollama, LM Studio y otros runners GGUF. vLLM y TGI no son la via habitual para GGUF Q4_0.
- Latencia y throughput: unicos datos conocidos, 20 tokens/s de lectura de prompt en Snapdragon 7 Gen 3; la velocidad de decodificacion no se especifica numericamente, solo se indica que es igual a la de Q4_K_M.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| divakar7c5/wealthwand-qwen3-4b-instruct-2507-gguf | 4,02 B | 262.144 (heredado del base) | GGUF Q4_0 | apache-2.0 | 2,37 GB; optimizado para int8 en ARM; 67% en tareas internas del autor |
| Qwen/Qwen3-4B-Instruct-2507 | 4,02 B | 262.144 | safetensors | apache-2.0 | Modelo base sin cuantizar |
| unsloth/Qwen3-4B-Instruct-2507-GGUF | 4,02 B | 262.144 | GGUF (varias cuantizaciones) | apache-2.0 | Alternativa GGUF del mismo base, con mas opciones de cuantizacion |
| Qwen3-1.7B (referencia del autor) | 1,7 B | no disponible | no disponible | apache-2.0 | Menor; 19%-42% en el conjunto interno de 114 tareas frente al 67% de este modelo |

## Limitaciones y advertencias

- Cuantizacion de 4 bits: Q4_0 introduce perdida de precision respecto al modelo base sin cuantizar; la calidad en tareas complejas puede degradarse.
- Sin modo "thinking": esta variante elimina el razonamiento extendido, por lo que no es adecuada para problemas que requieran cadenas de pensamiento largas.
- Benchmarks no independientes: la unica cifra de rendimiento (67% de 114 tareas) procede del propio autor y de un conjunto interno, no reproducible publicamente.
- Idiomas no detallados: aunque se describe como multilingue, no se especifica la cobertura real; el rendimiento fuera del ingles y el chino puede ser inferior.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no se documentan medidas de mitigacion.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la informacion proporcionada.
- Licencia: Apache-2.0 permite uso comercial, pero al ser una conversion de pesos conviene revisar tambien los terminos del modelo base y de las herramientas de llama.cpp utilizadas.
- Repositorio sin traccion: 0 descargas y 0 "likes"; no hay validacion de la comunidad ni garantia de mantenimiento.
- Aviso de contenido: la model card del autor incluye enlaces a un repositorio externo (Wealth Wand); conviene verificar su estado antes de depender de el en produccion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/divakar7c5/wealthwand-qwen3-4b-instruct-2507-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Aplicacion Wealth Wand (GitHub): https://github.com/WealthWand/wealth-wand
- GGUF alternativo de Unsloth: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-GGUF
- Ficha del modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Directorio de modelos GGUF (local-ai-zone): https://local-ai-zone.github.io/models/qwen-qwen3-4b-instruct-2507.html
