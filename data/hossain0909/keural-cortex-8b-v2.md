# hossain0909/Keural-Cortex-8B-v2

## Resumen
Keural-Cortex-8B-v2 es un checkpoint experimental de un modelo de lenguaje causal denso compatible con la arquitectura Qwen3, derivado de Qwen/Qwen3-8B-Base y publicado por el usuario hossain0909 en HuggingFace. El autor lo presenta explicitamente como un artefacto que no supero la aceptacion local para su publicacion: no esta recomendado para produccion ni para ejecucion autonoma de herramientas. Su interes es fundamentalmente documental y de investigacion: preserva el estado final de un ciclo de SFT correctivo (paso 2.990) entrenado en septiembre de 2026 sobre cuatro NVIDIA H200.

El modelo declara un tamano nominal de aproximadamente 8B parametros, pero el recuento real de pesos en safetensors es de 2.047.683.840 parametros (unos 2,05B), una discrepancia significativa que conviene tener en cuenta al planificar el despliegue. Esta especializado en conversacion bilingue ingles-coreano, con una ventana de contexto configurada de 65.536 tokens mediante YaRN factor 2, aunque el propio autor advierte que dicha configuracion no garantiza un razonamiento fiable en toda la ventana.

Su relevancia actual es limitada como modelo de produccion, pero resulta util como caso de estudio de fallos de alineacion: la model card documenta con detalle comportamientos problematicos (llamadas de aclaracion innecesarias, invencion de direcciones de correo tras busquedas fallidas, errores aritmeticos) y una evaluacion HTTP fallida, lo que lo convierte en un ejemplo transparente de por que un checkpoint no debe promocionarse sin validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso compatible con Qwen3 |
| Parametros totales | 2.047.683.840 (segun safetensors); el autor declara aproximadamente 8B |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens (configurado con YaRN factor 2) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | ingles (en), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento
Se trata de un transformer causal denso compatible con Qwen3, con pesos en BF16. La linea de entrenamiento parte de Qwen3-8B-Base, pasa por un checkpoint de preentrenamiento continuado (step_0010000), una extension de contexto (step_0000795), un SFT-v2 (step_0001124) y un DPO-v1 (step_0004473), hasta llegar a esta ejecucion de SFT correctivo. La secuencia correctiva uso longitud de 16.384 tokens, perdida solo sobre turnos del asistente y conversaciones empaquetadas con fronteras de atencion por documento. El dataset consta de 53.444 conversaciones: 23.752 ejemplos correctivos generados y 29.692 ejemplos de replay del corpus SFT existente. La validacion generada contiene 248 ejemplos relacionados y, segun el autor, no constituye evidencia independiente de generalizacion.

El entrenamiento supuso aproximadamente 0,39B tokens empaquetados durante dos epocas, con learning rate maximo de 2e-6. Un checkpoint del paso 100 entrenado en tres GPU se reanudo en cuatro NVIDIA H200 con datos alineados por tokens y planificacion de learning rate coherente. La exportacion incluye la plantilla de chat original del SFT embebida en la configuracion del tokenizer y no anade prefijo de razonamiento artificial. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades
- Generacion de texto conversacional bilingue en ingles y coreano.
- Soporte de modo thinking y non-thinking a traves de la plantilla de chat (`enable_thinking`).
- Soporte de tool calling / function calling a nivel de sintaxis, aunque el autor advierte que la fiabilidad de las acciones generadas no esta demostrada.
- Recuperacion en contexto largo: supero 8/8 en una suite sintetica de retrieval con contextos de aproximadamente 4K a 55K tokens.
- Razonamiento multi-turno basico en conversacion plana (12/12 en el subconjunto de chat simple de la suite de comportamiento).
- Capacidades aritmeticas limitadas y propensas a error, especialmente con prompts largos de estilo plataforma.
- No se documentan capacidades de vision, audio ni otros dominios multimodales.

## Casos de uso
- Investigacion sobre alineacion y fallos de tool calling: el checkpoint sirve para analizar por que un modelo genera llamadas de aclaracion ante saludos o inventa direcciones de correo tras una busqueda fallida, gracias a la documentacion detallada de estos fallos en la model card.
- Comparacion de checkpoints en una linea de entrenamiento: permite contrastar el efecto del SFT correctivo frente al DPO-v1 y al piloto enfocado anterior, usando las suites de diagnostico descritas (51/56 frente a 28/56 y 52/56).
- Analisis de errores en recuperacion de contexto largo: util para estudiar el comportamiento en ventanas de 4K a 55K tokens con casos sinteticos de retrieval, siempre con ejecucion de herramientas deshabilitada o simulada.
- Evaluacion offline controlada de plantillas de chat: permite probar la plantilla SFT embebida y el flag `enable_thinking` en entornos aislados con Transformers y PyTorch.
- Docencia y divulgacion sobre riesgos de produccion: ilustra con datos concretos por que un checkpoint que pasa diagnosticos parciales no debe sustituir a un modelo en produccion.
- Pruebas de integracion de servidores de inferencia: el autor documento un fallo conductual con vLLM (HTTP 200 pero respuesta `ask_clarification` ante `Hello!`), util como caso de prueba de pipelines de validacion.

## Benchmarks y rendimiento
Los datos disponibles son diagnosticos locales pequenos, no benchmarks estandar. El autor advierte que no son exhaustivos ni reproducen exactamente la peticion desplegada.

| Diagnostico | Este checkpoint | Referencia |
|---|---:|---|
| Comportamiento estilo plataforma | 51/56 | DPO original: 28/56; piloto enfocado previo: 52/56 |
| Subconjunto de chat plano | 12/12 | No es una suite independiente |
| Regresion general | 31/32 | DPO original: 31/32 |
| Retrieval en contexto largo | 8/8 | Suite sintetica, aprox. 4K-55K |
| Casos frescos estilo plataforma | 22/32 | Piloto enfocado previo: 28/32 |
| Suite de acciones dependientes (score automatico) | 5/8 | Ver limitacion del scorer |
| Aceptacion HTTP/streaming | Fallo en el primer test | Los siete restantes no se completaron |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: con 2,05B parametros en BF16, aproximadamente 4,1 GB solo para pesos; en FP16 similar. Con cuantizacion a 8 bits rondaria 2 GB y a 4 bits alrededor de 1 GB, aunque el autor no publica variantes cuantizadas.
- El autor indica que se requiere un entorno Transformers/PyTorch compatible y memoria de dispositivo suficiente; el ejemplo de carga usa `torch_dtype=torch.bfloat16` y `device_map="auto"`.
- GPU recomendadas: el entrenamiento se realizo en cuatro NVIDIA H200. Para inferencia, dado el tamano real de pesos, cabria en GPU de consumo como RTX 4090, RTX 3090 o incluso GPUs con 8 GB en BF16, si bien no hay datos publicados de latencia ni throughput.
- Opciones de despliegue: Transformers con PyTorch (documentado); vLLM (el autor lo uso para la prueba HTTP, con resultado fallido a nivel conductual); no se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Keural-Cortex-8B-v2 | 2,05B reales (declara ~8B) | 65.536 (YaRN x2) | Apache 2.0 | Experimental, no apto para produccion |
| Qwen3-8B-Base | ~8B | no disponible en la informacion | no disponible en la informacion | Modelo base oficial |
| DPO-v1 de la misma linea | no disponible | no disponible | no disponible | Checkpoint previo de la linea Keural |

No se dispone de datos de rendimiento comparables de terceros en la informacion proporcionada; la comparativa se limita a la linea de entrenamiento documentada por el autor.

## Limitaciones y advertencias
- Checkpoint experimental: el autor declara explicitamente que no supero la aceptacion local y que no esta recomendado para produccion ni para ejecucion autonoma de herramientas.
- Persisten llamadas de aclaracion y de herramienta innecesarias ante saludos y peticiones de borrador de correo suficientemente especificadas.
- Una busqueda de contacto fallida puede provocar la invencion de direcciones y la generacion de llamadas `send_email`; nunca deben permitirse acciones externas sin revision.
- Errores aritmeticos, especialmente con prompts largos de estilo plataforma.
- La ejecucion correctiva mas larga rindio peor que el piloto enfocado previo en casos frescos (22/32 frente a 28/32): mas entrenamiento no mejoro uniformemente el comportamiento.
- Superar unos pocos casos de retrieval en contexto largo no demuestra competencia amplia a 64K.
- La presencia del canal de razonamiento o la activacion de thinking no garantiza precision en el razonamiento.
- No se ha establecido robustez general, descontaminacion del dataset ni aceptacion en despliegue real; las afirmaciones de benchmarks de model cards anteriores no son transferibles.
- Discrepancia entre el tamano declarado (~8B) y el recuento real de safetensors (2,05B), que debe verificarse antes de cualquier uso.
- La validacion generada (248 ejemplos) no es evidencia independiente de generalizacion.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y los fallos documentados desaconsejan cualquier despliegue sin validacion propia.
- El identificador de modelo del ejemplo de carga (`mkd-hossain/Keural-Cortex-8B-v2`) difiere del ID del repositorio (`hossain0909/Keural-Cortex-8B-v2`); conviene verificar la ruta correcta.

## Enlaces
- HuggingFace: https://huggingface.co/hossain0909/Keural-Cortex-8B-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- No se han encontrado en la informacion disponible papers, blogs, repositorios ni demos adicionales.
