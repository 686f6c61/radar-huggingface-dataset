# d3vmeh/bdh-100m-bpe8k-chat-v3

## Resumen

BDH 100M, BPE-8k, chat v3 es un ajuste fino conversacional del modelo base `d3vmeh/bdh-100m-bpe8k`, desarrollado por el usuario d3vmeh. Se trata de un modelo de 100 millones de parametros basado en la arquitectura Dragon Hatchling (BDH), un diseno de red neuronal con atencion de tipo lineal inspirado en el circuito del dragon de la mosca de la fruta, descrito en un articulo publicado en Zenodo. El ajuste se ha realizado sobre 6.960 documentos con formato de conversacion (peticiones de historias, preguntas de comprension sobre las mismas, listas con preguntas de posicion y tareas de una linea) durante 800 pasos.

El objetivo declarado del ajuste es mejorar la recuperacion de informacion plantada previamente en el contexto (recall por clave) y la coherencia multi-turno en dialogos cortos, a costa de degradar el modelado general del lenguaje: la perplejidad medida en bits por caracter sobre datos reservados sube de 0,964 a 1,172 (+22 %). El modelo esta pensado como experimento de investigacion sobre arquitecturas alternativas a la atencion cuadratica clasica, no como modelo de produccion.

Es relevante ahora porque ejemplifica una linea de trabajo activa: arquitecturas eficientes (atencion lineal, estado recurrente) entrenadas a escala reducida para estudiar propiedades emergentes como el recall en contexto. Su ventana de 480 tokens (unos 2.000 caracteres) y su tamano de 100M lo situan en la categoria de modelos de juguete para investigacion, con licencia MIT y pesos en formato PyTorch (`.pt`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dragon Hatchling (BDH), transformer con atencion lineal inspirada en circuitos biologicos |
| Parametros totales | 100M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 480 tokens (aprox. 2.000 caracteres) |
| Tipos de cuantizacion | no disponible (pesos en bf16 durante entrenamiento; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`); tokenizador BPE en `bpe8k.json` |
| Tokenizador | BPE con vocabulario de 8.192 tokens |
| Modelo base | d3vmeh/bdh-100m-bpe8k |
| Tamano del repositorio | 0,4 GB |
| Fecha de creacion | 2026-09-14 |
| Ultima actualizacion | 2026-11-09 |

## Arquitectura y entrenamiento

La arquitectura BDH (Dragon Hatchling) es una red neuronal con atencion lineal cuyo diseno se inspira en el circuito del cuerpo de hongo del dragon de la mosca de la fruta, segun el articulo referenciado en Zenodo (DOI 10.5281/zenodo.23325933). El modelo base `bdh-100m-bpe8k` fue entrenado con una unica semilla, segun indica el autor. El ajuste conversacional se realizo durante 800 pasos con 32 secuencias por paso, optimizador AdamW con weight decay 0,01, learning rate constante de 1e-4, dropout 0,1 y precision bf16, lo que supone aproximadamente cuatro pasadas sobre los 6.960 documentos de entrenamiento. El entrenamiento completo tardo unos 51 minutos en una GPU integrada AMD Strix Halo.

Los datos de ajuste fueron generados por un LLM a partir de indicaciones de categoria y no se publican en la release. La perdida se calculo unicamente sobre las respuestas del asistente (loss enmascarada en los turnos del usuario). El formato de conversacion es estricto: turnos `User: ...` y `Assistant: ...` en lineas separadas, con `<|endoftext|>` como terminador de respuesta. No se documenta uso de RLHF ni DPO; el ajuste es supervisado (SFT) sobre dialogos sinteticos.

## Capacidades

- Generacion de texto en ingles con registro de cuentos infantiles, segun el propio autor.
- Recuperacion de hechos plantados en el contexto por clave: 93 % a 128 caracteres, 93 % a 256, 67 % a 384, 90 % a 600 y 33 % a 1.024.
- Discriminacion entre claves cuando hay dos hechos en el contexto: 25 de 30 aciertos a 64 caracteres y 24 de 30 a 600, frente a 4 de 30 del modelo base.
- Respuesta a preguntas de comprension sobre una historia previa: 64 % de acierto cuando la historia resuelve la pregunta.
- Preguntas de posicion en listas: 64 % en "cual fue el primero", 43 % en "cual fue el segundo" y 81 % en "cual fue el ultimo".
- Conversacion multi-turno corta (historia mas tres preguntas) dentro de la ventana de 480 tokens.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Investigacion sobre recall en contexto: el modelo sirve como banco de pruebas controlado para medir como decae la recuperacion de hechos segun la distancia en tokens, con curvas publicadas por el autor a 128, 256, 384, 600 y 1.024 caracteres.
- Estudio de arquitecturas de atencion lineal: permite comparar BDH frente a transformers clasicos del mismo tamano en tareas de recuperacion y comprension, con un coste de entrenamiento de menos de una hora en hardware integrado.
- Generacion de cuentos cortos con preguntas de comprension: util para prototipar sistemas educativos de lectura donde el modelo genera una historia y luego responde preguntas cuya respuesta esta en el texto.
- Evaluacion de tecnicas de SFT con mascara de perdida: el ajuste documenta explicitamente que la perdida se calcula solo sobre las respuestas del asistente, lo que lo convierte en un ejemplo reproducible de este patron.
- Pruebas de formato conversacional estricto: el esquema `User:`/`Assistant:` con terminador `<|endoftext|>` sirve para validar parsers y pipelines de chat en entornos de investigacion.
- Docencia y divulgacion: modelo de 100M que cabe en cualquier portatil y se entrena en menos de una hora, adecuado para cursos sobre entrenamiento de LLM y arquitecturas alternativas.
- Experimentos de degradacion controlada: la subida de perplejidad documentada (+22 % en bits por caracter) permite estudiar el compromiso entre especializacion conversacional y capacidad general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica las siguientes metricas propias:

| Metrica | Resultado | Referencia |
|---|---|---|
| Recall por clave a 128 caracteres (30 ensayos) | 93 % | 53 % en el modelo base |
| Recall por clave a 256 caracteres | 93 % | no disponible |
| Recall por clave a 384 caracteres | 67 % | no disponible |
| Recall por clave a 600 caracteres | 90 % | no disponible |
| Recall por clave a 1.024 caracteres | 33 % | no disponible |
| Discriminacion entre dos claves a 64 caracteres | 25/30 | 4/30 para la clave incorrecta |
| Discriminacion entre dos claves a 600 caracteres | 24/30 | 4/30 para la clave incorrecta |
| Respuestas de historia juzgadas como apoyadas por el texto | 36 % | no disponible |
| Acierto en preguntas resueltas por la historia | 64 % | no disponible |
| Pregunta "cual fue el primero" | 64 % | no disponible |
| Pregunta "cual fue el segundo" | 43 % | no disponible |
| Pregunta "cual fue el ultimo" | 81 % | no disponible |
| Bits por caracter en datos reservados | 1,172 | 0,964 en el modelo base (+22 %) |

El examen multi-turno consta de 60 items y los resultados son la media de tres semillas de generacion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bf16 (100M parametros, aprox. 0,2 GB de pesos mas activaciones y cache de contexto de 480 tokens).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM; el autor entreno en una GPU integrada AMD Strix Halo, lo que indica que la inferencia cabe en hardware muy modesto.
- Cabe en GPU consumer: si, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores; tambien en CPU.
- Opciones de despliegue: el autor proporciona `chat_stream.py` en el repositorio de GitHub, que carga el `.pt` y el tokenizador `bpe8k.json`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al no publicarse pesos en GGUF ni safetensors, el despliegue esta limitado al script de referencia en PyTorch.
- Latencia y throughput: no disponibles. El entrenamiento de 800 pasos tardo unos 51 minutos en una GPU integrada AMD Strix Halo, lo que da una idea del orden de magnitud del coste computacional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bdh-100m-bpe8k-chat-v3 | 100M | 480 tokens | BDH (atencion lineal) | MIT | Pesos `.pt` en HF |
| d3vmeh/bdh-100m-bpe8k (base) | 100M | 480 tokens | BDH (atencion lineal) | MIT | Pesos en HF |
| d3vmeh/bdh-100m-bytes-chat-v3 | 100M | 480 tokens | BDH (atencion lineal) | MIT | Pesos en HF |
| GPT-2 small | 124M | 1.024 tokens | Transformer | MIT | Pesos en HF |
| SmolLM-135M | 135M | 2.048 tokens | Transformer | Apache 2.0 | Pesos en HF |

La comparativa con GPT-2 small y SmolLM-135M es orientativa por tamano; no se dispone de resultados de benchmarks comunes que permitan una comparacion de rendimiento directa. Frente a las variantes byte del mismo autor (`bdh-100m-bytes-chat-v3`), la version BPE-8k mantiene mejor el contexto multi-turno segun la model card, aunque no se publican numeros comparativos directos entre ambas.

## Limitaciones y advertencias

- Modelo de 100M parametros ajustado sobre unos pocos miles de dialogos cortos; su capacidad general es muy limitada.
- El ajuste degrada el modelado del lenguaje: la perplejidad en bits por caracter sube un 22 % respecto al modelo base.
- Ventana de contexto de solo 480 tokens (unos 2.000 caracteres), insuficiente para documentos largos o conversaciones extensas.
- El recall cae drasticamente a partir de 600 caracteres: 33 % a 1.024 caracteres frente al 90 % a 600.
- El autor advierte explicitamente de que el modelo inventa hechos y responde en registro de cuento infantil.
- Solo soporta ingles.
- Los datos de ajuste fueron generados por un LLM y no se publican, lo que impide auditar sesgos y composicion del corpus.
- El modelo base se entreno con una unica semilla, lo que limita la robustez de las conclusiones sobre la arquitectura.
- Los resultados del examen multi-turno son la media de tres semillas de generacion sobre 60 items; el tamano muestral es reducido.
- No se documentan cuantizaciones ni formatos de despliegue estandar (GGUF, safetensors), lo que complica su integracion en stacks de produccion.
- Aunque la licencia MIT permite uso comercial, las limitaciones tecnicas hacen desaconsejable su uso en produccion fuera de contextos experimentales.
- Riesgo de alucinacion elevado y sin mitigaciones documentadas (no se menciona RLHF ni filtros de seguridad).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/d3vmeh/bdh-100m-bpe8k-chat-v3
- Modelo base: https://huggingface.co/d3vmeh/bdh-100m-bpe8k
- Repositorio de codigo: https://github.com/d3vmeh/small-dragon-hatchling
- Articulo (Zenodo, CC BY 4.0): https://doi.org/10.5281/zenodo.23325933
