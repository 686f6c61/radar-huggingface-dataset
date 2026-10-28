# SolsticeAI/Nanbeige4.3-33B-GGUF-UltraOptimised-Curated-Protium

## Resumen

`SolsticeAI/Nanbeige4.3-33B-GGUF-UltraOptimised-Curated-Protium` es una distribución en formato GGUF del modelo denso **Nanbeige4.3-33B**, desarrollado por Nanbeige LLM Lab (BOSS Zhipin / Kanzhun Limited) y cuantizado por Solstice-AI. El modelo base es un transformer denso de 33.118.977.024 parámetros (33,1B) con 52 capas y una ventana de contexto declarada de 524.288 tokens (512K), orientado a ingeniería de software, refactorización de repositorios multi-fichero, automatización de terminal y tareas agénticas de largo horizonte.

La aportación de esta release no es un nuevo entrenamiento, sino el empaquetado: cuatro cuantizaciones K-quant (Q8_0, Q6_K, Q5_K_M, Q4_K_M) calibradas por el autor para preservar lógica de código y firmas de tool calling, más un protocolo de prompt denominado **Protium-1.0** que estructura el razonamiento en bloques `<think>` y fuerza un anclaje del objetivo en el primer token de respuesta. La licencia es Apache 2.0 y los idiomas declarados son inglés y chino.

Su relevancia práctica es que permite ejecutar un modelo denso de 33B en una única GPU de consumo de 24 GB con la cuantización Q4_K_M (18,67 GB), algo que el modelo en BF16 no permite. La model card publica resultados en Terminal-Bench 2.1 y 4.0 frente a modelos de la clase ~30B, aunque la tabla de benchmarks aparece truncada en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 52 capas (según la model card; no se detalla el tipo de atención) |
| Parametros totales | 33.118.977.024 (33,1B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 524.288 tokens (512K) declarados |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M; Q3_K_M en repositorio aparte |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama, vLLM, SGLang) |

Tamaños de fichero por cuantización, según la model card:

| Checkpoint | Tamano | Hardware recomendado por el autor |
|---|---|---|
| `nanbeige4.3-33b-q8_0.gguf` | 32,78 GB | 48 GB+ de VRAM o 64 GB+ de RAM de sistema |
| `nanbeige4.3-33b-q6_k.gguf` | 25,31 GB | 32-48 GB de VRAM o 64 GB de memoria unificada |
| `nanbeige4.3-33b-q5_k_m.gguf` | 21,89 GB | 24-32 GB de VRAM o 32 GB de RAM |
| `nanbeige4.3-33b-q4_k_m.gguf` | 18,67 GB | Una única GPU de 24 GB (RTX 3090 / 4090) |
| `Q3_K_M` (repo aparte) | 15,2 GB | Entornos con memoria muy restringida; desaconsejado para código |

## Arquitectura y entrenamiento

La información disponible confirma que el modelo base es un transformer **denso** de 33,1B parámetros con 52 capas; no es una arquitectura MoE, híbrida ni SSM. La model card no detalla el mecanismo de atención (si es atención completa, GQA/MQA, atención lineal o alguna variante con RoPE escalado para alcanzar 512K), ni la composición del dataset de entrenamiento, ni el número de tokens vistos, ni si hubo fases de SFT, RLHF o DPO. Todos esos datos deben considerarse **no disponibles** a partir de la información proporcionada.

La capa específica de esta release, **Protium-1.0**, se describe como un protocolo cognitivo de razonamiento dinámico con tres componentes: bloques `<think>`/`</think>` que actúan como impedancia para evitar razonamiento circular y conversacional, un "anclaje del objetivo" que obliga a responder al requisito del usuario antes de entrar en bucles de verificación, y soporte nativo del contexto de 512K. Es importante señalar que se trata de un GGUF: no hay evidencia en la información disponible de reentrenamiento ni de modificación de pesos, y la plantilla de Ollama incluida en la model card inyecta `<think>` directamente como prefijo del turno del asistente, lo que apunta a una construcción a nivel de plantilla y prompting.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y chino.
- Razonamiento multi-paso con modo "thinking" explícito mediante bloques `<think>`.
- Codificación agéntica: la model card declara resultados en Terminal-Bench 2.1 y 4.0, y menciona SWE-Bench y SWE-Bench Pro en las etiquetas del repositorio, aunque sin cifras publicadas en la información disponible.
- Automatización de terminal y ejecución de comandos en entornos de shell.
- Refactorización de repositorios completos gracias a la ventana de 512K tokens.
- Tool calling / function calling: las cuantizaciones se describen como calibradas para proteger "firmas de tool calling", y el modelo base se etiqueta como agéntico.
- Flujos "cowork" y tareas de largo horizonte con múltiples pasos y verificaciones intermedias.
- Despliegue servido compatible con endpoints (etiqueta `endpoints_compatible`).
- No se declaran capacidades de visión, audio ni multimodalidad.

## Casos de uso

- **Refactorización de monorepos**: con 512K tokens de contexto se puede cargar un árbol de código extenso y pedir cambios coherentes entre ficheros; la cuantización Q6_K o Q8_0 es la adecuada si se necesita preservar árboles de sintaxis abstracta con precisión.
- **Agente de terminal en CI/CD**: el modelo puede generar y encadenar comandos de shell para tareas de build, test y despliegue, integrándose vía `llama-server` con la API compatible de OpenAI que expone llama.cpp y apuntando a un runner interno.
- **Asistente de corrección de bugs en producción**: dado un stack trace y los ficheros implicados en el contexto, el modelo propone parches; conviene Q4_K_M como mínimo operativo según el propio autor.
- **Automatización de soporte técnico para desarrolladores**: conversaciones multi-turno con documentación interna y código como contexto, en inglés o chino, para equipos con documentación en ambos idiomas.
- **Generación de tests unitarios y de integración**: a partir de un módulo y su interfaz pública, producir baterías de pruebas y casos límite, con el modo `<think>` activado para razonar sobre precondiciones.
- **Análisis de repositorios de terceros**: auditoría de dependencias, revisión de cambios en un diff grande o evaluación de licencias dentro de un contexto de 512K, ejecutada en local para no enviar código propietario a una API externa.
- **Despliegue on-premise con requisitos de soberanía de datos**: al ser Apache 2.0 y ejecutable en una RTX 4090, encaja en entornos donde el código no puede salir de la infraestructura de la organización.

## Benchmarks y rendimiento

La model card incluye una "matriz de rendimiento" de la clase ~30B, pero la tabla está truncada en la información disponible: solo se han podido recuperar dos filas completas de la categoría de codificación agéntica. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni del resto de categorías de la matriz.

| Categoria | Benchmark | Nanbeige4.3-33B | Qwen3.8-27B | Muse-Glimmer-30B | Gemma4-31B |
|---|---|---|---|---|---|
| Codificacion agentica | Terminal-Bench 2.1 | 80,9 | 73,0 | 61,8 | 47,2 |
| Codificacion agentica | Terminal-Bench 4.0 | 23,8 | 6,3 | 1,6 | 0 (valor truncado) |

Advertencia: son cifras autodeclaradas por el autor de la cuantización, no verificadas de forma independiente, y la información no especifica la configuración de evaluación (número de intentos, esfuerzo de razonamiento, versión exacta de los modelos comparados). El dato de Gemma4-31B en Terminal-Bench 4.0 aparece cortado en el texto original, por lo que su valor exacto es no disponible.

## Requisitos de hardware

- **VRAM para inferencia**: los pesos ocupan 18,67 GB (Q4_K_M), 21,89 GB (Q5_K_M), 25,31 GB (Q6_K) y 32,78 GB (Q8_0). A eso hay que sumar la caché KV, cuyo tamaño no se publica en la información disponible.
- **Contexto completo**: los 512K tokens declarados no son viables en una GPU de 24 GB junto con los pesos; el ejemplo oficial de `llama-server` arranca con `--ctx-size 65536`, no con 524.288.
- **GPU recomendadas**:
  - Q4_K_M: una RTX 3090 o RTX 4090 de 24 GB.
  - Q5_K_M: 24-32 GB de VRAM (RTX 4090, A6000 de 48 GB, L40S).
  - Q6_K: 32-48 GB (A100 40 GB, A6000, o Apple Silicon con 64/128 GB de memoria unificada).
  - Q8_0: 48 GB+ (A100 80 GB, H100, 2x RTX 4090).
- **¿Cabe en GPU de consumo?** Sí, en Q4_K_M dentro de una única GPU de 24 GB; con Q5_K_M al límite y con recortes de contexto.
- **Opciones de despliegue**: llama.cpp (`llama-server`), Ollama (la model card incluye Modelfile), vLLM y SGLang (ambos listados en las etiquetas del repositorio). La compatibilidad real con vLLM/SGLang para este GGUF concreto no se detalla en la información disponible.
- **Latencia y throughput**: no disponibles. La model card solo afirma de forma cualitativa que Q5_K_M ofrece "más tokens por segundo" que Q6_K por menor presión de ancho de banda.
- **Parámetros de muestreo sugeridos por el autor**: `temperature 0.6`, `top_p 0.95`, `num_ctx 65536`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato de esta release | Terminal-Bench 2.1 |
|---|---|---|---|---|---|
| Nanbeige4.3-33B (esta release) | 33,1B denso | 512K (524.288) | Apache 2.0 | GGUF (Q4-Q8) | 80,9 |
| Qwen3.8-27B | 27B (por el nombre) | No disponible | No disponible | No disponible | 73,0 |
| Muse-Glimmer-30B | ~30B (por el nombre) | No disponible | No disponible | No disponible | 61,8 |
| Gemma4-31B | ~31B (por el nombre) | No disponible | No disponible | No disponible | 47,2 |

Solo se dispone de datos de parámetros aproximados y de una única métrica comparable para los tres alternativas; contexto, licencia y disponibilidad de pesos no figuran en la información proporcionada. La comparación con estos modelos procede exclusivamente de la tabla publicada por el autor de la cuantización y no se ha verificado de forma independiente.

## Limitaciones y advertencias

- **Riesgo de alucinación**: no se documenta ninguna evaluación de factualidad ni de tasa de alucinación; en tareas de código, un parche plausible pero incorrecto es especialmente peligroso si se aplica sin tests.
- **Sesgos**: la model card no incluye ninguna sección de sesgos, evaluación de seguridad ni red teaming. El entrenamiento está centrado en inglés y chino, con posible sesgo cultural y de dominio hacia el ecosistema de BOSS Zhipin / Kanzhun.
- **Idiomas**: solo se declaran inglés y chino. El rendimiento en castellano u otras lenguas no está evaluado y presumiblemente será inferior.
- **Cifras autodeclaradas**: los benchmarks de Terminal-Bench provienen del autor de la cuantización, con la tabla truncada, y no hay verificación externa ni repositorio de evaluación enlazado.
- **Naturaleza del GGUF**: al ser una cuantización, Q4_K_M y Q5_K_M introducen pérdida respecto a BF16. El propio autor desaconseja bajar de 4 bits para código agéntico, y la cuantización Q3_K_M está alojada aparte y marcada como no recomendada.
- **Protium-1.0 no es un modelo distinto**: es un protocolo de prompting/plantilla. Los beneficios descritos (anclaje del objetivo, bloques `<think>`) dependen de que el cliente respete la plantilla; si se sirve con un chat template distinto, el comportamiento puede degradarse.
- **Repositorio de gran tamaño**: 539,7 GB declarados frente a los ~98,7 GB que suman las cuatro cuantizaciones principales, lo que sugiere artefactos adicionales no documentados; conviene revisar la lista de ficheros antes de clonar.
- **Madurez**: 20 descargas y 1 like en el momento de la consulta, publicado el 27 de octubre de 2026 y actualizado un día después. Es una release muy reciente y sin adopción significativa, lo que aumenta el riesgo en producción.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero la licencia del modelo base (Nanbeige4.3-33B) debe verificarse por separado; la información disponible solo garantiza la licencia declarada en este repositorio derivado.
- **Contexto real vs. declarado**: aunque se anuncian 512K tokens, no hay benchmarks de aguja en el pajar ni evaluación de degradación con contexto largo en la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SolsticeAI/Nanbeige4.3-33B-GGUF-UltraOptimised-Curated-Protium
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Cuantización Q3_K_M (repositorio independiente): https://huggingface.co/SolsticeAI/Nanbeige4.3-33B-Q3_K_M-GGUF
- Organización Nanbeige / BOSS Zhipin: https://huggingface.co/Nanbeige
- Organización Solstice-AI: https://huggingface.co/SolsticeAI

Nota: la búsqueda web realizada no ha devuelto ningún resultado relevante sobre este modelo (solo contenido no relacionado); no se han localizado paper, blog técnico, repositorio de código ni demo asociados. El resto de enlaces potenciales debe considerarse no disponible.
