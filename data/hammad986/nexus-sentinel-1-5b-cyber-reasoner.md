# hammad986/nexus-sentinel-1.5b-cyber-reasoner

## Resumen

NEXUS-SENTINEL-1.5B es un adaptador LoRA (PEFT) publicado por el usuario hammad986 sobre el modelo base Qwen/Qwen2.5-Coder-1.5B-Instruct. Su proposito declarado es la auditoria de seguridad de codigo y el razonamiento sobre vectores de explotacion, incluyendo vulnerabilidades de corrupcion de memoria (CWE-120), inyeccion SQL, SSRF, deserializacion insegura, condiciones de carrera y reentrancy en contratos inteligentes. El adaptador anade un modo de traza de razonamiento delimitado por etiquetas `<think> ... </think>` antes de emitir codigo endurecido.

El modelo se presenta como un motor de "cyber-reasoning" autonomo que, a diferencia de los modelos de codigo genericos, expone un analisis de causa raiz y severidad CVSS antes de sintetizar parches. El entrenamiento se realizo con LoRA de rango 16 sobre los modulos de atencion y MLP del transformer base, con solo 4.204.544 parametros entrenables (0,272 % del total).

Es relevante como ejemplo de especializacion ligera mediante PEFT sobre un modelo pequeno (1,54B parametros), lo que permite desplegarlo en hardware modesto. No obstante, el repositorio no incluye datos de entrenamiento, benchmarks ni evaluaciones, y el tamano del repo aparece como 0.0 GB en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-1.5B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 1.540 millones (modelo base) + 4.204.544 parametros entrenables del adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT); requiere el modelo base Qwen/Qwen2.5-Coder-1.5B-Instruct |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de 1,54B parametros. La configuracion LoRA declarada es: rango r=16, alpha=32, dropout=0,05, con modulos objetivo q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj, es decir, atencion completa y capas MLP. Los parametros entrenables ascienden a 4.204.544, un 0,272 % del total de pesos.

No se especifica en la model card el volumen de datos de entrenamiento, la composicion del dataset, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF, DPO o SFT adicionales. Tampoco se documenta el proceso de curacion de ejemplos de vulnerabilidades ni la metodologia de evaluacion. La innovacion declarada es puramente de comportamiento: forzar trazas de razonamiento en etiquetas `<think>` antes de generar codigo mitigado, con enfasis en validacion estricta de limites y protecciones de tiempo constante.

## Capacidades

- Generacion de codigo y razonamiento sobre codigo, heredados del modelo base Qwen2.5-Coder-1.5B-Instruct.
- Auditoria de vulnerabilidades: corrupcion de memoria (CWE-120), inyeccion SQL, SSRF, deserializacion insegura, condiciones de carrera y reentrancy en contratos inteligentes.
- Trazas de razonamiento explicitas mediante etiquetas `<think> ... </think>`, que exponen el analisis de vectores de ataque y causa raiz.
- Sintesis de codigo endurecido con validacion de limites y protecciones de tiempo constante (defense-in-depth).
- Estimacion de severidad CVSS segun la model card.
- Soporte de plantilla de chat (apply_chat_template) con roles system y user.
- Capacidades multilingues: solo ingles declarado.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Revision de codigo C/C++ en pipelines de CI/CD: el modelo puede analizar handlers de sockets, funciones de copia de buffers y parsers para detectar desbordamientos antes del merge, emitiendo una traza de razonamiento y un parche endurecido.
- Auditoria de aplicaciones web: revision de consultas SQL construidas dinamicamente y de flujos de peticiones HTTP para identificar inyeccion SQL y SSRF, con propuesta de parametrizacion y listas de permitidos.
- Analisis de deserializacion insegura: inspeccion de puntos de entrada que deserializan datos no confiables (pickle, Java serialization, YAML) y generacion de alternativas seguras con validacion de esquema.
- Revision de contratos inteligentes: deteccion de patrones de reentrancy en funciones de retirada y propuesta de patrones checks-effects-interactions o mutex de reentrada.
- Formacion y concienciacion en seguridad: generacion de ejemplos didacticos de vulnerabilidades con explicacion de causa raiz y version corregida, util en entornos de entrenamiento controlados.
- Asistente local de bajo coste para triaje inicial de hallazgos: al ser un adaptador sobre un modelo de 1,5B, puede ejecutarse en una GPU de consumo para preclasificar alertas de escaneo antes de escalar a revision humana.
- Generacion de pruebas de regresion de seguridad: a partir de una vulnerabilidad detectada, el modelo puede proponer casos de prueba que reproduzcan el fallo y verifiquen la correccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el modelo base de 1,54B parametros en bfloat16 ocupa aproximadamente 3 GB de pesos; en cuantizacion de 8 bits alrededor de 1,6 GB y en 4 bits alrededor de 1 GB, mas overhead de contexto y activaciones. El adaptador LoRA anade apenas unos 8-16 MB en bfloat16.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para el modelo base en bfloat16 con contexto moderado; GPU de datacenter (A100, H100) no necesarias para este tamano.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y similares. No confirmado por el autor.
- Opciones de despliegue: transformers + peft (metodo documentado en la model card). Para vLLM, llama.cpp, Ollama o TGI seria necesario fusionar el adaptador con el modelo base y convertir a los formatos correspondientes; no se documenta dicho procedimiento.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NEXUS-SENTINEL-1.5B (este) | 1,54B + LoRA 4,2M | no disponible | Auditoria de seguridad y razonamiento de exploits | apache-2.0 | Hugging Face (adaptador PEFT) |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1,54B | no disponible en la informacion proporcionada | Codigo general e instrucciones | apache-2.0 | Hugging Face |
| Qwen2.5-Coder-7B-Instruct | 7B | no disponible en la informacion proporcionada | Codigo general | apache-2.0 | Hugging Face |
| Modelos especializados en seguridad de mayor tamano | no disponible | no disponible | Auditoria de seguridad | variable | no disponible |

La comparativa de rendimiento no puede establecerse porque el autor no publica evaluaciones. Frente al modelo base, la unica diferencia documentada es el adaptador LoRA y el comportamiento de traza `<think>`.

## Limitaciones y advertencias

- No se han publicado benchmarks, evaluaciones ni datos de entrenamiento; el rendimiento real en auditoria de seguridad es desconocido.
- Riesgo de alucinacion: como modelo generativo de 1,5B, puede inventar vulnerabilidades inexistentes o pasar por alto fallos reales; no debe sustituir a herramientas de analisis estatico ni a revision humana.
- El modelo esta entrenado unicamente en ingles; el rendimiento en castellano no esta garantizado.
- El repositorio muestra 0 descargas y 0 likes, y el tamano del repo aparece como 0.0 GB, lo que sugiere publicacion muy reciente o posiblemente incompleta; conviene verificar la integridad de los archivos del adaptador antes de usarlo.
- La licencia apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-Coder-1.5B-Instruct tiene su propia licencia que debe respetarse al redistribuir.
- El uso para generar exploits o codigo ofensivo puede contravenir legislacion sobre ciberseguridad; el modelo declara enfocarse en defensa, pero no incorpora salvaguardas documentadas.
- El contexto maximo no se documenta en la model card; debe consultarse la ficha del modelo base.
- El modo `<think>` depende del prompt de sistema; sin instruccion explicita puede no activarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hammad986/nexus-sentinel-1.5b-cyber-reasoner
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Repositorio PEFT: https://github.com/huggingface/peft
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
