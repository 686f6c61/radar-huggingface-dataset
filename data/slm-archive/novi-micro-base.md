# SLM-Archive/Novi-Micro-Base

## Resumen

Novi-Micro-Base es un modelo de lenguaje causal (decoder-only) entrenado desde cero por Novi-AI y publicado en HuggingFace bajo el identificador SLM-Archive/Novi-Micro-Base. Con aproximadamente 5 millones de parámetros, es un modelo experimental de escala muy reducida cuyo objetivo no es competir con LLM de propósito general, sino servir como banco de pruebas para experimentación en modelado de lenguaje a pequeña escala. La model card lo describe explícitamente como un modelo base, sin ajuste por instrucciones ni entrenamiento conversacional.

La arquitectura, denominada por el autor "BananaMind 2-style", es un transformer decoder-only que incorpora RMSNorm, Rotary Position Embeddings (RoPE), atención con consultas agrupadas (GQA), normalización QK sobre las dimensiones de cabeza, capas feed-forward SwiGLU y embeddings de entrada y salida compartidos (tied). El vocabulario es de 16.384 tokens con un tokenizador BPE a nivel de byte entrenado ad hoc, y la ventana de contexto alcanza los 2.048 tokens, una cifra notable para un modelo de este tamaño.

El entrenamiento consumió aproximadamente 1.000 millones de tokens procedentes de FineWeb-HQ, con precisión FP32 y 30.518 pasos de optimizador. Su relevancia actual es acotada pero clara: sirve como referencia reproducible de preentrenamiento desde cero en un rango de parámetros donde el coste computacional es mínimo, y como punto de partida para experimentos de fine-tuning o de arquitectura. No hay resultados de benchmarks publicados ni licencia declarada, lo que limita su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, estilo "BananaMind 2" (RMSNorm, RoPE, GQA, QK norm, SwiGLU, embeddings tied) |
| Parametros totales | 5.656.240 segun safetensors; la model card declara 5,04 M (aproximadamente 5 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (no se documentan versiones cuantizadas) |
| Idiomas soportados | Ingles (en); el autor no declara otros idiomas |
| Licencia | No disponible |
| Formato de pesos | Safetensors (requiere `trust_remote_code=True` y `custom_code`) |

Otros datos tecnicos declarados: tamano de vocabulario 16.384, tokenizador BPE a nivel de byte, precision de entrenamiento FP32, tokens especiales `[PAD]`, `[BOS]`, `[EOS]`, `[UNK]`.

## Arquitectura y entrenamiento

Novi-Micro-Base es un transformer decoder-only con atención causal. Cada bloque aplica RMSNorm antes de las subcapas de atención y de feed-forward. La atención usa consultas agrupadas (GQA), en la que varias cabezas de consulta comparten las cabezas de clave y valor, lo que reduce el coste de memoria del cache KV. Sobre las representaciones de consulta y clave se aplican RoPE y, siguiendo el estilo BananaMind 2, una RMSNorm adicional sobre las dimensiones de cabeza. La red feed-forward es de tipo SwiGLU (`SiLU(gate(x)) * up(x)`), proyectada de vuelta a la dimensión oculta. Los embeddings de entrada y de salida están atados, lo que reduce el recuento de parámetros independientes. El tokenizador es un BPE a nivel de byte de 16.384 entradas, entrenado con muestras del propio corpus antes del preentrenamiento.

El entrenamiento consistió en un preentrenamiento puro (sin RLHF ni DPO) sobre un único origen de datos, FineWeb-HQ, con documentos empaquetados en secuencias contiguas de 2.048 tokens. La configuración declara un objetivo de 1.000 millones de tokens, batch size 2, acumulación de gradientes 8 (batch efectivo de 16 secuencias), learning rate 2e-4, scheduler coseno, warmup del 3 %, weight decay 0,01, norma de gradiente máxima 1,0, semilla 1337, precisión FP32 y `torch.compile` activado, con 30.518 pasos de optimizador y checkpoints cada 100 pasos. No se documentan innovaciones adicionales como decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Generacion de texto autoregresiva basica en ingles, como modelo causal puro.
- Modelado de lenguaje a nivel de token: continuacion de texto, estimacion de probabilidad y analisis de distribuciones.
- Capacidad limitada de razonamiento y de conocimiento factual, coherente con su escala de aproximadamente 5 millones de parametros.
- Soporte de tool calling / function calling: no disponible; el modelo no esta ajustado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible; no es un modelo instruido.
- Capacidades multilingues: limitadas al ingles declarado; no se documenta soporte de otros idiomas.
- Capacidades especiales: no documentadas (sin modo "thinking", vision ni audio).
- Uso como base para fine-tuning: si, es su uso previsto segun el autor.
- Inferencia local ligera: si, por su tamano reducido.

## Casos de uso

- Experimentacion en preentrenamiento a pequena escala: reproducir un pipeline completo de entrenamiento desde cero (tokenizador, empaquetado de secuencias, scheduler coseno) con un coste de computo minimo, para validar hiperparametros antes de escalar.
- Educacion y docencia: ilustrar de forma tangible como funciona un transformer causal, inspeccionando atencion, cabezas GQA y capas SwiGLU en un modelo que cabe en memoria sin dificultad.
- Fine-tuning de tareas acotadas: ajustar el modelo base sobre un corpus pequeno y muy especifico (por ejemplo, plantillas de texto o dominios cerrados) para estudiar como se comporta el ajuste en el regimen de los 5 millones de parametros.
- Ablaciones de arquitectura: comparar variantes (con y sin QK norm, con y sin embeddings tied, distintos ratios de GQA) manteniendo fijo el resto del pipeline, gracias al bajo coste por ejecucion.
- Investigacion sobre tokenizadores: el modelo incluye un BPE a nivel de byte de 16.384 entradas entrenado ad hoc, lo que permite estudiar el efecto del vocabulario en modelos diminutos.
- Generacion de texto de relleno o sintetico en pruebas de integracion: usar el modelo como componente sustituible en un pipeline de serving para validar infraestructura (vLLM, endpoints, batching) sin consumir GPU cara.
- Analisis de degradacion con la longitud de contexto: evaluar hasta que punto una ventana de 2.048 tokens compensa o no la falta de capacidad del modelo, un fenomeno documentado en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, WikiText ni perplejidad, y no se han encontrado evaluaciones externas en la busqueda web realizada. Tampoco hay datos de latencia o throughput publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: extremadamente baja. Con 5.656.240 parametros, los pesos en FP32 ocupan aproximadamente 22,6 MB y en FP16 unos 11,3 MB, sin contar el cache KV ni el overhead del runtime.
- Cache KV: al usar GQA y solo 2.048 tokens de contexto, el cache es muy reducido; practicamente irrelevante frente a modelos de cientos de millones de parametros.
- GPU recomendadas: cualquier GPU con al menos unos pocos cientos de MB de VRAM libre. No se requiere A100, H100 ni similares; son sobredimensionadas para este modelo.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060, RTX 4090, e incluso en CPU). Tambien cabe en hardware integrado y en dispositivos de borde.
- Opciones de despliegue: al requerir `custom_code`, la via mas directa es `transformers` con `trust_remote_code=True`. No se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI, ni se han publicado pesos en GGUF, por lo que su integracion en esos runners no esta garantizada sin conversion previa.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. Dado el tamano, cabria esperar una latencia muy baja, pero no se aportan mediciones.

## Comparativa con modelos similares

La comparativa se ofrece como referencia de categoria (modelos causales de muy pocos parametros); los datos de terceros corresponden a documentacion publica ampliamente conocida y no a resultados medidos en este analisis. No se dispone de benchmarks comparativos directos.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Novi-Micro-Base | ~5,04 M (5.656.240 en safetensors) | 2.048 | en | no disponible | HuggingFace, requiere custom_code |
| TinyStories (variantes pequenas) | ~1 M a ~33 M segun variante | no disponible aqui | en | segun variante | HuggingFace |
| Pythia-70M | ~70 M | 2.048 | en | Apache 2.0 | HuggingFace, ampliamente soportado |
| GPT-2 small | ~124 M | 1.024 | en | MIT (segun publicacion original) | HuggingFace, soporte nativo extendido |

Frente a estos, Novi-Micro-Base destaca por su contexto de 2.048 tokens relativo a su tamano, pero carece de licencia declarada, de soporte en runners estandar y de cualquier evaluacion publicada, lo que dificulta una comparacion de rendimiento rigurosa.

## Limitaciones y advertencias

- Escala muy reducida: con aproximadamente 5 millones de parametros, el autor advierte de que puede generar texto incoherente, repetir frases, producir errores factuales y fallar en tareas de razonamiento.
- No es un modelo instruido: es un modelo base sin fine-tuning por instrucciones ni RLHF/DPO, por lo que no sigue comandos ni mantiene conversaciones de forma fiable.
- Alucinacion: el riesgo es alto por el limitado conocimiento del mundo almacenado en 5 millones de parametros.
- Coherencia en generaciones largas: el autor indica explicitamente que puede fallar al mantener texto coherente en generaciones extensas, y que la ventana de 2.048 tokens no compensa la falta de capacidad.
- Idioma: solo se declara ingles; no hay soporte verificado de castellano ni de otros idiomas.
- Licencia: no disponible. La ausencia de licencia explicita impide asumir permisos de uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad, y el corpus FineWeb-HQ puede arrastrar los sesgos propios de datos web filtrados.
- Dependencia de codigo personalizado: el modelo requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene revisarlo antes de usarlo en entornos controlados.
- Discrepancia de parametros: la model card declara 5,04 M mientras que safetensors reporta 5.656.240 parametros, sin que se explique la diferencia.
- Produccion: el propio autor lo describe como modelo de investigacion y experimentacion, no como LLM de proposito general listo para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SLM-Archive/Novi-Micro-Base
- Model card del autor (referencia de arquitectura y entrenamiento): incluida en la pagina anterior
- Dataset FineWeb-HQ: no disponible el enlace especifico en la informacion proporcionada
- Paper o informe tecnico asociado: no disponible
- Repositorio de codigo: no disponible
- Demo o espacio interactivo: no disponible
