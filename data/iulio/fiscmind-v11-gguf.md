# iulio/FiscMind-v11-GGUF

## Resumen

FiscMind-v11-GGUF es un modelo de lenguaje conversacional publicado por el usuario iulio en Hugging Face, distribuido exclusivamente en formato GGUF para su uso con llama.cpp y Ollama. Segun los metadatos del repositorio y el nombre de los ficheros incluidos, se trata de un ajuste fino (fine-tuning) del modelo base Qwen2.5-7B-Instruct, con 7.615.616.512 parametros totales (aproximadamente 7,6 mil millones), orientado a tareas de asistencia en el ambito fiscal y contable. La model card indica que el ajuste y la conversion a GGUF se realizaron con Unsloth.

El modelo se presenta como una version incremental (v11) dentro de una familia de publicaciones del mismo autor, de la que existe al menos una version anterior denominada FiscMind-AI-v9-GGUF, descrita en rumano como un instrumento de asistencia computacional para profesionales contables y fiscales, con mencion explicita a la normativa rumana (ANAF) y a la necesidad de validacion por un experto autorizado (CECCAR / CCF / CAFR). Es relevante ahora por su caracter de modelo pequeno, cuantizado y desplegable en hardware de consumo, aunque su ecosistema, documentacion y validacion son muy limitados.

La informacion publica disponible es escasa: el repositorio no declara licencia, idiomas soportados ni pipeline, y no incluye resultados de evaluacion. Cualquier uso en produccion deberia tratarse con cautela y verificarse empiricamente antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-7B-Instruct; familia Qwen2) |
| Parametros totales | 7.615.616.512 (aprox. 7,6 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado: `Qwen2.5-7B-Instruct.Q4_K_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); se incluye un Modelfile para Ollama |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct, un transformer decoder-only con atencion por rotacion posicional (RoPE), normalizacion RMSNorm y proyecciones sesgadas en las capas de atencion, tal como corresponde a la familia Qwen2. El repositorio no documenta la configuracion exacta de capas, dimensiones ocultas ni cabezas de atencion para este ajuste concreto, por lo que esos detalles deben considerarse no disponibles.

El proceso de entrenamiento descrito se limita a indicar que el modelo fue ajustado y convertido a GGUF con Unsloth, herramienta que acelera el fine-tuning y la exportacion de modelos Llama/Qwen. No se especifica el volumen de tokens de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de RLHF, DPO o SFT, ni hiperparametros como tasa de aprendizaje o numero de epocas. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, modos de razonamiento extendido) mas alla de las propias del modelo base. La unica evidencia sobre el dominio de especializacion proviene del nombre del modelo y de la descripcion de la version v9, centrada en asistencia fiscal y contable en rumano.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-7B-Instruct.
- Asistencia especializada en materia fiscal y contable segun la orientacion declarada de la familia FiscMind (la version v9 se describe como herramienta de asistencia para profesionales contables y fiscales).
- Razonamiento y respuesta a preguntas en el dominio de la fiscalidad, presumiblemente orientado a la normativa rumana (ANAF) segun la informacion de la version anterior.
- Soporte de plantillas de chat mediante el flag `--jinja` de llama.cpp, lo que permite aplicar la plantilla de conversacion del modelo.
- Uso con `llama-cli` para texto y `llama-mtmd-cli` para modelos multimodales (la model card menciona ambos comandos de forma generica, aunque no se confirma que este ajuste tenga capacidades de vision).
- Despliegue sencillo mediante Ollama gracias al Modelfile incluido.
- Capacidades de tool calling, function calling, agentes y multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Consulta fiscal interna para equipos contables: el modelo puede responder preguntas sobre tratamiento de impuestos y obligaciones declarativas, sirviendo como primer filtro antes de la revision de un experto autorizado, dado su ajuste declarado en el dominio fiscal.
- Borrador de respuestas a clientes en gestorias: generar explicaciones preliminares sobre plazos, regimenes y documentacion requerida, que el profesional revisa y firma antes de enviar.
- Asistente de formacion para junior accountants: resumir conceptos fiscales y resolver dudas frecuentes en un entorno controlado, aprovechando el formato conversacional del modelo.
- Prototipado rapido en local: al distribuirse en GGUF Q4_K_M y ocupar 4,7 GB de repositorio, permite levantar un asistente fiscal en un portatil o estacion de trabajo sin GPU dedicada mediante llama.cpp u Ollama.
- Clasificacion y extraccion de informacion en documentos contables: usar el modelo para etiquetar apuntes, identificar tipos de operacion o resumir extractos, integrándolo en scripts de procesamiento por lotes con `llama-cli`.
- Evaluacion comparativa de ajustes de dominio: util como punto de partida para medir, mediante pruebas propias, si un fine-tuning de 7B sobre Qwen2.5 aporta ventaja frente al modelo base en tareas fiscales concretas.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse completamente en local, permite procesar datos financieros sensibles sin enviarlos a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-5,5 GB con la cuantizacion Q4_K_M publicada (fichero de unos 4,7 GB), mas overhead de contexto.
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM o mas; una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 permiten ejecutar el modelo con contexto amplio y buena velocidad.
- Cabe en GPU de consumo: si, en tarjetas con al menos 6 GB de VRAM; tambien puede ejecutarse en CPU con llama.cpp, con velocidad menor.
- Opciones de despliegue: llama.cpp (`llama-cli -hf iulio/FiscMind-v11-GGUF --jinja`), Ollama mediante el Modelfile incluido, y cualquier frontend compatible con GGUF. No se documenta soporte para vLLM o TGI, que requieren pesos en safetensors y no estan publicados en este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FiscMind-v11-GGUF | 7,6 B | no disponible | GGUF Q4_K_M | no disponible | Hugging Face (0 descargas) |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens | safetensors, GGUF | Apache 2.0 (modelo base) | Amplia, muy extendida |
| FiscMind-AI-v9-GGUF | no disponible | no disponible | GGUF | no disponible | Hugging Face (version anterior del mismo autor) |

La comparacion mas directa es con el modelo base Qwen2.5-7B-Instruct, del que este ajuste hereda arquitectura y tamano, pero del que no se documentan mejoras medibles ni licencia clara. La version v9 de la misma familia es la unica alternativa interna documentada, sin datos tecnicos publicados.

## Limitaciones y advertencias

- Ausencia total de resultados de evaluacion: no hay benchmarks que respalden la calidad del ajuste en tareas fiscales ni su no regresion frente al modelo base.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o verificar la licencia del modelo base (Apache 2.0 en Qwen2.5) antes de desplegarlo.
- Idiomas no declarados: aunque la familia parece orientada al rumano, no se confirma el soporte ni la calidad en castellano u otros idiomas.
- Riesgo de alucinacion elevado en materia normativa: un modelo de 7B ajustado con datos no documentados puede inventar referencias legales, tipos impositivos o plazos; toda salida debe validarse por un profesional autorizado.
- Ambito geografico y normativo limitado: la documentacion de la version anterior apunta a la normativa rumana (ANAF), por lo que su utilidad fuera de ese marco es dudosa.
- Contexto no confirmado: no se especifica la ventana de contexto efectiva del ajuste, lo que dificulta planificar casos con documentos largos.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion; no hay comunidad que haya validado el modelo.
- Un unico fichero cuantizado (Q4_K_M): no hay variantes Q5, Q8 o FP16 para comparar el impacto de la cuantizacion.
- Model card generica: buena parte del texto es la plantilla automatica de Unsloth, sin informacion especifica sobre el dataset ni el proceso de ajuste.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/iulio/FiscMind-v11-GGUF
- Version anterior de la familia: https://huggingface.co/iulio/FiscMind-AI-v9-GGUF
- Arbol de ficheros de la version anterior: https://huggingface.co/iulio/FiscMind-AI-v9-GGUF/tree/main
- Unsloth (herramienta de ajuste y conversion): https://github.com/unslothai/unsloth
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
