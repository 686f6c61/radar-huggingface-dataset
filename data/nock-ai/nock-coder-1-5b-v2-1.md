# Nock-AI/nock-coder-1.5b-v2.1

## Resumen

Nock Coder v2.1 es un modelo de generacion de codigo de 1.543.714.304 parametros (aproximadamente 1,5B) publicado por Nock-AI, un proyecto independiente. Se trata de un ajuste fino mediante LoRA sobre Qwen/Qwen2.5-Coder-1.5B-Instruct, por lo que hereda la arquitectura Qwen2 y su tokenizador. Su rasgo diferenciador es el formato de respuesta: el modelo devuelve primero el bloque de codigo y limita cualquier explicacion a una sola frase corta, un comportamiento entrenado de forma explicita con ejemplos reformateados.

El problema que aborda es el de los asistentes de codigo pequenos que, en tareas de autocompletado o generacion directa, desperdician tokens en preambulos y explicaciones largas. Segun los datos del autor, la version base solo empezaba con codigo en 1 de cada 50 respuestas, mientras que v2.1 lo hace en 50 de 50, y reduce la media de palabras por respuesta de 185 a 50. Ademas incorpora 500 ejemplos de Solidity, lo que lo orienta a tareas de generacion de contratos inteligentes.

Es relevante ahora por su tamano reducido, su licencia Apache 2.0 y la disponibilidad de un build GGUF de aproximadamente 1 GB para Ollama y llama.cpp, lo que permite ejecutarlo en portatiles y GPUs de consumo sin coste de API. El coste de entrenamiento declarado es de unos 50 minutos en una unica GPU T4 gratuita, lo que lo convierte en un caso reproducible de ajuste fino de bajo presupuesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (heredada de Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la model card. El modelo base Qwen2.5-Coder-1.5B-Instruct declara 32.768 tokens; el entrenamiento LoRA uso una longitud maxima de 1024 tokens |
| Tipos de cuantizacion | Existe un build GGUF de aproximadamente 1 GB para Ollama y llama.cpp; no se detallan los niveles concretos (Q4_K_M, Q5_K_M, etc.) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal, 3,2 GB) y GGUF en repositorio separado; el adaptador LoRA esta en la carpeta `adapter/` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only con atencion por causalidad, normalizacion RMSNorm y sesgos QKV, del que este modelo reutiliza todos los pesos. El ajuste se realizo con LoRA de rango 16 y alpha 32 aplicado a las 7 proyecciones lineales, durante 1 epoch con tasa de aprendizaje 1e-4, programacion coseno, batch efectivo de 16 y longitud maxima de 1024 tokens. La perdida se calculo unicamente sobre las respuestas, no sobre los prompts. La version v2 habia usado 2 epochs con tasa 2e-4, lo que degradaba el rendimiento en HumanEval; v2.1 reentrena los mismos datos "de forma mas suave".

El conjunto de datos suma aproximadamente 4.572 ejemplos: 2.500 de ise-uiuc/Magicoder-OSS-Instruct-75K (MIT), 1.500 peticiones cortas de ise-uiuc/Magicoder-Evol-Instruct-110K (Apache 2.0), 500 ejemplos de Solidity de AlfredPros/smart-contracts-instructions (MIT) y 72 ejemplos de identidad. Las respuestas se reformatearon al primer bloque de codigo mas una frase como maximo, y la mitad de los ejemplos llevan el system prompt por defecto del modelo base. Se eliminaron las filas solapadas con los prompts de evaluacion. El autor advierte que los datasets contienen texto generado por otros modelos de lenguaje. No se menciona ninguna innovacion arquitectonica adicional (decodificacion especulativa, atencion lineal, SSM) ni un pipeline de RLHF o DPO.

## Capacidades

- Generacion de codigo a partir de instrucciones en lenguaje natural, con el codigo como primera salida.
- Respuestas concisas: maximo un bloque de codigo y una frase de explicacion, lo que reduce el consumo de tokens de salida.
- Generacion de contratos inteligentes en Solidity, con 500 ejemplos especificos de este dominio en el entrenamiento.
- Conversacion multi-turno mediante plantilla de chat (`apply_chat_template`), con soporte del rol de sistema.
- Capacidad de razonamiento y matematicas: no documentada de forma especifica; depende del modelo base.
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Uso como agente multi-step: no documentado.
- Capacidades multilingues: no disponibles; los idiomas soportados no se declaran.
- Capacidades especiales (modo "thinking", vision, audio): no disponibles.
- Compatibilidad con text-generation-inference y endpoints compatibles segun las etiquetas del repositorio.

## Casos de uso

- Autocompletado y generacion de funciones en el editor: el modelo devuelve directamente el bloque de codigo sin preambulos, lo que encaja en extensiones de IDE donde insertar texto introductorio seria un estorbo. Su tamano de 1,5B permite ejecucion local con latencia baja.
- Asistente de codigo en portatil sin conexion: el build GGUF de aproximadamente 1 GB se ejecuta con Ollama (`ollama run hf.co/Nock-AI/nock-coder-1.5b-GGUF`) o llama.cpp, util para entornos con requisitos de privacidad o sin acceso a APIs externas.
- Generacion de plantillas de contratos inteligentes: los 500 ejemplos de Solidity permiten producir borradores de contratos que compilan con solc (10 de 15 tareas en la evaluacion del autor), siempre como punto de partida para revision humana.
- Prototipado rapido de scripts y utilidades: para tareas como invertir una cadena, parsear CSV o escribir un endpoint sencillo, la respuesta de unas 50 palabras evita tener que limpiar explicaciones largas antes de reutilizar el codigo.
- Generacion masiva de ejemplos de codigo para pipelines de datos: su licencia Apache 2.0 y su salida concisa lo hacen apto para producir grandes volumenes de fragmentos de codigo etiquetados o de tests preliminares.
- Educacion y explicaciones minimas: en contextos donde se quiere el codigo y una sola frase de contexto, el formato entrenado ayuda a mantener materiales breves y homogeneos.
- Base para ajustes finos posteriores: al publicarse el adaptador LoRA en la carpeta `adapter/`, se puede reutilizar o fusionar para experimentos de investigacion sobre comportamiento de formato de salida.
- Evaluacion comparativa de tecnicas de ajuste: el autor documenta la diferencia entre 2 epochs y 1 epoch sobre los mismos datos, lo que sirve como referencia reproducible para estudiar sobreajuste en modelos pequenos.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card del autor y se obtuvieron con los ficheros GGUF de 4 bits en Ollama, temperatura 0, semilla fija, con el system prompt por defecto de cada modelo, sobre una GPU Kaggle T4 el 11 de octubre de 2026.

| Metrica | Base (Qwen2.5-Coder-1.5B-Instruct) | Nock Coder v2 | Nock Coder v2.1 |
|---|---|---|---|
| HumanEval, problemas resueltos (de 164) | 112 | 104 | 118 |
| Respuestas que empiezan con codigo (de 50) | 1 | 50 | 50 |
| Respuestas sin codigo alguno (de 50) | 0 | 0 | 0 |
| Palabras por respuesta | 185 | 51 | 50 |
| Tareas de Solidity que compilan con solc (de 15) | 8 | 11 | 10 |

No se han publicado resultados de MMLU, GSM8K, MBPP ni otros benchmarks en la informacion disponible. El propio autor advierte que la compilacion con solc es un umbral bajo y no dice nada sobre si el contrato es correcto o seguro.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 3,1 GB solo para pesos, mas memoria para el contexto y el cache KV. Estimacion aritmetica a partir de los 1,54B de parametros, no un dato publicado.
- VRAM estimada con el build GGUF de 4 bits: aproximadamente 1 GB de pesos, segun el tamano declarado del repositorio GGUF. Estimacion, no dato oficial.
- GPU recomendadas: cabe holgadamente en GPUs de consumo. El autor realizo entrenamiento y evaluacion en una NVIDIA T4. Tambien es viable en RTX 3060, RTX 4060, RTX 4090 y equivalentes.
- Inferencia en CPU: posible mediante llama.cpp u Ollama gracias al build GGUF.
- Opciones de despliegue: transformers (con `device_map="auto"`), llama.cpp, Ollama, text-generation-inference (segun las etiquetas del repositorio) y endpoints compatibles.
- Latencia y throughput: no disponibles. Solo se conoce el tiempo de entrenamiento (aproximadamente 50 minutos en una T4), que no es extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento en HumanEval | Disponibilidad |
|---|---|---|---|---|---|---|
| Nock Coder v2.1 | 1,54B | No especificado en la model card (base: 32.768 tokens) | Apache 2.0 | safetensors, GGUF | 118 de 164 (evaluacion del autor, GGUF 4 bits) | HuggingFace, Ollama |
| Qwen2.5-Coder-1.5B-Instruct (modelo base) | 1,54B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | 112 de 164 (misma evaluacion del autor) | HuggingFace |
| DeepSeek-Coder-1.3B-Instruct | 1,3B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible |
| StarCoder2-3B | 3B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible |

La unica comparacion con datos verificables en la informacion proporcionada es contra el modelo base, del que Nock Coder v2.1 hereda pesos y arquitectura. Las alternativas de la misma categoria se listan solo a titulo orientativo; no se dispone de sus cifras en el material consultado.

## Limitaciones y advertencias

- Modelo de 1,5B: el propio autor advierte que comete errores y que su codigo puede ser incorrecto o inseguro. Es obligatorio revisarlo antes de ejecutarlo.
- La salida de contratos inteligentes no esta auditada. Cualquier contrato generado debe pasar por una revision humana cualificada antes de desplegarse en produccion. Compilar con solc no implica correccion ni seguridad.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de veracidad. Al ser un ajuste fino sobre un modelo pequeno, la generacion de APIs inexistentes o funciones inventadas es plausible.
- La reduccion forzada a una frase de explicacion puede ser contraproducente en tareas que requieren justificar decisiones de diseno o explicar un algoritmo paso a paso.
- Longitud de contexto: la model card no la especifica y el entrenamiento LoRA uso un maximo de 1024 tokens, por lo que el comportamiento con prompts largos no esta validado, aunque el modelo base soporte ventanas mayores.
- Idiomas soportados: no disponibles. No se puede garantizar un rendimiento correcto fuera del ingles sin evaluacion propia.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre conservando el aviso de licencia y los avisos de atribucion correspondientes. Hay que verificar tambien las licencias de los datasets de entrenamiento (MIT y Apache 2.0), que el autor documenta.
- Contaminacion de datos: el autor indica que se eliminaron las filas solapadas con los prompts de evaluacion, pero los datasets originales contienen texto generado por otros modelos de lenguaje, lo que puede introducir sesgos heredados y estilos no verificados.
- Trazabilidad: el repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, sin comunidad ni validacion independiente de los resultados. Las fechas declaradas (octubre de 2026) son posteriores a la fecha de muchos de los modelos de referencia.
- Aviso de afiliacion: NockAI se declara proyecto independiente y sin relacion con Robinhood, Alibaba ni Nockchain.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nock-AI/nock-coder-1.5b-v2.1
- Build GGUF para Ollama y llama.cpp: https://huggingface.co/Nock-AI/nock-coder-1.5b-GGUF
- Pesos de la version v2: https://huggingface.co/Nock-AI/nock-coder-1.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Dataset de entrenamiento (Magicoder OSS Instruct 75K): https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
- Dataset de entrenamiento (Magicoder Evol Instruct 110K): https://huggingface.co/datasets/ise-uiuc/Magicoder-Evol-Instruct-110K
- Dataset de entrenamiento (Smart Contracts Instructions): https://huggingface.co/datasets/AlfredPros/smart-contracts-instructions
- Respuestas completas de la evaluacion: https://nockai.dev/evaluation/
- Nota sobre la busqueda web: los resultados obtenidos corresponden a entidades sin relacion con este modelo (NOCK Maschinenbau GmbH, la libreria de mocking HTTP `nock` para Node.js, el Cirque Nock y unos protectores de manillar de bicicleta). No se han encontrado articulos, papers ni demos independientes sobre Nock Coder v2.1.
