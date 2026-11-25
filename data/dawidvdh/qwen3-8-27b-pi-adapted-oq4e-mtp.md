# dawidvdh/Qwen3.8-27B-pi-adapted-oQ4e-mtp

## Resumen
Qwen3.8-27B-pi-adapted-oQ4e-mtp es una cuantizacion de 4 bits en formato oQ4e del modelo harness-hub/Qwen3.8-27B-pi-adapted, que a su vez es el modelo Qwen/Qwen3.8-27B con un adaptador LoRA entrenado mediante aprendizaje por refuerzo dentro del agente de programacion pi. Lo publica el usuario dawidvdh y esta empaquetado especificamente para oMLX sobre Apple Silicon, conservando la cabeza MTP (multi-token prediction) para decodificacion especulativa. El resultado en disco es de 16,3 GiB, con un total de 27.781.427.952 parametros.

El interes practico del modelo es su rendimiento como agente de codigo en hardware de consumo: sobre un MacBook Pro con M3 Max de 36 GB resolvio 33 de los 34 ejercicios Python del Aider polyglot en 41 minutos, frente a 27/34 en 74 minutos de la cuantizacion equivalente sin el adaptador. Esto lo situa como una opcion viable para flujos de trabajo agenticos locales en Mac, sin depender de GPUs de datacenter.

La arquitectura subyacente es un transformer denso de la familia Qwen3.8 con 27B parametros, torre de vision incluida (aunque el autor indica que no la probo) y licencia Apache 2.0. El modelo esta pensado para ejecutarse con el motor Splash de oMLX y con el pensamiento (thinking) desactivado, que es la configuracion con la que se entreno y evaluo el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.8, con cabeza MTP (multi-token prediction) y torre de vision |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens configurados en oMLX; Splash reserva KV para ~86.000-94.000 tokens en el hardware de referencia |
| Tipos de cuantizacion | oQ4e de oMLX (base 4-bit affine, group size 64; 236 tensores sensibles a 5 bits, 4 a 6 bits y 6 a 8 bits); no compatible con oQh |
| Idiomas soportados | no disponible en la informacion proporcionada (el set de calibracion se denomina oqe_code_multilingual) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria mlx, formato oQ4e de oMLX); 16,3 GiB en disco, repo de 17,5 GB |

## Arquitectura y entrenamiento
El modelo base es un transformer denso de 27,8B parametros con 64 capas, de las cuales 16 son de atencion completa (las capas q/k/v/o del adaptador se aplican sobre ellas) y el resto emplea otro esquema de atencion. Incluye una cabeza MTP que se conserva en la cuantizacion para permitir decodificacion especulativa, y una torre de vision que forma parte de los pesos aunque el autor no la valido.

El adaptador LoRA se entreno con aprendizaje por refuerzo dentro del agente de codigo pi (repositorio earendil-works/pi), con rango r=32, alpha=64 y escala 2.0, sobre 256 pares que cubren las capas de atencion completa y el MLP de las 64 capas. La fusion se hizo como W + 2·B@A en float32 y se escribio en float16, porque al escribir en BF16 solo sobrevivia entre el 65 % y el 82 % del delta del adaptador (error relativo 0,61-0,73), mientras que en float16 se conservaba el 99,9-100 % (error relativo 0,10-0,16). La cuantizacion se realizo con omlx.oq.quantize_oq_streaming (oq_level=4, enhanced=True, preserve_mtp=True) usando una imatrix del conjunto de calibracion oqe_code_multilingual, en unos 35 minutos en el M3 Max. El tokenizer, la plantilla de chat y las configuraciones son los del modelo base.

## Capacidades
- Generacion de texto y razonamiento, con modo thinking conmutable mediante chat_template_kwargs (enable_thinking); el adaptador se entreno y evaluo con thinking desactivado.
- Generacion de codigo en lenguajes multiples, con especial refuerzo en tareas de tipo Aider polyglot (Python en la evaluacion publicada).
- Uso como agente de codigo: ejecucion de herramientas, edicion de ficheros y ciclos de prueba y error dentro del agente pi, con hasta 200 llamadas a herramientas en la bateria de 34 ejercicios.
- Entrada de imagen y texto (pipeline image-text-to-text), aunque la torre de vision no fue probada por el autor.
- Decodificacion especulativa mediante la cabeza MTP, compatible con el motor Splash 1.7.0 y con la decodificacion especulativa propia de oMLX.
- Capacidades multilingues: no disponibles de forma explicita en la informacion proporcionada.
- Soporte de tool calling y function calling a traves del formato de plantilla de chat del modelo base (supportsDeveloperRole: false, campo max_tokens).

## Casos de uso
- Agente de codigo local en Mac: el modelo resuelve tareas de programacion completas (implementar, ejecutar tests y corregir) dentro del agente pi sobre un M3 Max de 36 GB, con 33/34 ejercicios Aider polyglot resueltos en 41 minutos y 200 llamadas a herramientas.
- Sustitucion de asistentes de codigo en la nube para equipos con hardware Apple Silicon: al caber en 16,3 GiB en disco y ejecutarse con oMLX y Splash, permite mantener el codigo y las conversaciones en local sin enviar nada a un proveedor externo.
- Automatizacion de tareas de refactorizacion y correccion de tests: el modelo trabaja bien con instrucciones de alcance acotado (un unico fichero stub, sin crear modulos adicionales), lo que encaja en pipelines de integracion continua que ejecutan un agente sobre un repositorio y validan con pytest.
- Prototipado rapido de funciones y scripts: con contexto de 65.536 tokens puede recibir el enunciado, el fichero de tests y el codigo circundante en una sola ventana, reduciendo el numero de idas y vueltas.
- Evaluacion comparativa de adaptadores y cuantizaciones: el autor publica el script merge_lora.py y quant.py, de modo que el modelo sirve como referencia reproducible para medir el efecto de un LoRA entrenado con RL frente al modelo base cuantizado con la misma receta.
- Asistencia multimodal ligera: al incluir torre de vision y aceptar image-text-to-text, puede emplearse para describir capturas o diagramas dentro de un flujo de desarrollo, aunque esta capacidad no esta validada por el autor y debe tratarse como experimental.

## Benchmarks y rendimiento
Hardware de referencia: MacBook Pro 14", M3 Max (GPU de 30 nucleos, ~280 GB/s), 36 GB, con corriente. Software: oMLX 0.8.0 con kernels personalizados, Splash 1.7.0 y pi 1.5.2. Bateria: Aider polyglot Python, 34 ejercicios, revision 7e0611e, con limite de 20 minutos por ejercicio y correccion en contenedor Docker aislado.

| Build (oQ4e-mtp y thinking off salvo indicacion) | Resueltos | Tiempo | Llamadas a herramientas | Tokens de salida |
|---|---|---|---|---|
| Este modelo | 33/34 | 41 min | 200 | 54k |
| Jundot/Qwen3.8-27B-oQ4e-mtp | 27/34 | 74 min | 570 | 99k |
| Qwen3.8-27B sin el adaptador, cuantizado igual | 26/34 (1 timeout) | 110 min | 663 | 121k |
| Jundot/Qwen3.6-35B-A3B-oQ4e-mtp (MoE, re-subida del 2026-11-19) | 31/34 | 42 min (aproximado) | 298 | 107k |
| LiquidAI/LFM2.5-24B-A2B-MLX-4bit (siempre con thinking) | 10/34 | 164 min | 303 | 505k |

Frente a la build de Jundot, este modelo resolvio 6 ejercicios que aquella fallo (bottle-song, forth, pov, sgf-parsing, transpose y zipper) y no perdio ninguno (test de signos bilateral, p ≈ 0,03). En los 27 ejercicios que ambos resolvieron uso 143 llamadas a herramientas frente a 222. El modelo base cuantizado con la misma receta no mejoro a la build de Jundot, lo que indica que la ganancia procede del adaptador. La decodificacion del Qwen3.6-35B-A3B de serie es unas 4 veces mas rapida (~145 frente a ~33 tok/s), pero requiere mas pasos.

## Requisitos de hardware
- VRAM o memoria unificada: 16,3 GiB de pesos en disco; en la maquina de referencia (36 GB unificados) el motor Splash reserva KV para ~86.000-94.000 tokens sin coste adicional de memoria, y el contexto de 65.536 tokens requiere subir sampling.max_context_window a 65536.
- GPU recomendadas: Apple Silicon; validado en M3 Max de 30 nucleos de GPU con 36 GB. No hay datos publicados para A100, H100 ni RTX 4090, ya que el formato oQ4e esta ligado a oMLX.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente (36 GB validados); no se ha probado en GPUs discretas de consumo.
- Opciones de despliegue: oMLX 0.8.0 compilado con --with-custom-kernel, con el motor Splash 1.7.0 (brew install incoai/tap/splash) y el draft incoai/Qwen3.8-27B-DFlash2 para decodificacion especulativa; sin Splash funciona con la decodificacion especulativa MTP propia de oMLX. No compatible con oQh.
- Latencia y throughput: ~33 tok/s de decodificacion en el M3 Max de referencia (misma velocidad que la build de Jundot); 41 minutos y 54k tokens de salida para completar 33 ejercicios del Aider polyglot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Aider polyglot (34) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (oQ4e, MTP) | 27,8B densos | 65.536 configurados | 33/34 en 41 min | apache-2.0 | Hugging Face, formato oMLX |
| Jundot/Qwen3.8-27B-oQ4e-mtp | 27B densos | no disponible | 27/34 en 74 min | no disponible | Hugging Face, formato oMLX |
| Qwen3.8-27B base cuantizado igual | 27B densos | no disponible | 26/34 en 110 min | no disponible | Hugging Face |
| Jundot/Qwen3.6-35B-A3B-oQ4e-mtp | 35B MoE (A3B) | no disponible | 31/34 en 42 min | no disponible | Hugging Face, formato oMLX |
| LiquidAI/LFM2.5-24B-A2B-MLX-4bit | 24B MoE (A2B) | no disponible | 10/34 en 164 min | no disponible | Hugging Face, formato MLX 4-bit |

## Limitaciones y advertencias
- La evaluacion publicada es una sola ejecucion por build sobre 34 ejercicios de Python; no hay repeticiones ni intervalos de confianza, por lo que la ventaja de 6 ejercicios debe tomarse con cautela pese a la significacion del test de signos.
- El adaptador se entreno y evaluo con thinking desactivado; el propio autor remite a la fila de thinking medio para ver que aporta en tareas dificiles, sin datos concluyentes en la informacion disponible.
- La torre de vision esta incluida pero no fue probada; no debe asumirse un comportamiento multimodal fiable en produccion.
- El formato oQ4e solo lo lee oMLX y el motor Splash no puede leer pesos oQh, lo que limita la portabilidad a otros runtimes (vLLM, llama.cpp, TGI, Ollama no estan soportados segun la informacion disponible).
- La fusion del LoRA exige escribir en float16: hacerlo en BF16 destruye entre el 18 % y el 35 % del delta del adaptador, un riesgo relevante para quien reproduzca el proceso.
- Riesgo de alucinacion y sesgos: no hay informacion publicada especifica para este modelo; al ser un derivado de Qwen3.8-27B con un LoRA de RL sobre tareas de codigo, hereda los sesgos del modelo base y puede degradar su comportamiento general fuera del dominio de programacion.
- Idiomas soportados no documentados; el uso en castellano no esta validado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el adaptador de origen deben verificarse por separado antes de desplegar en produccion.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/dawidvdh/Qwen3.8-27B-pi-adapted-oQ4e-mtp
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de referencia de Jundot: https://huggingface.co/Jundot/Qwen3.8-27B-oQ4e-mtp
- Draft para decodificacion especulativa: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Agente pi: https://github.com/earendil-works/pi
- oMLX: https://github.com/jundot/omlx
- Aider polyglot benchmark: https://github.com/Aider-AI/polyglot-benchmark
