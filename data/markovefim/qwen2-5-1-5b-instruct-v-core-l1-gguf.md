# MarkovEfim/Qwen2.5-1.5B-Instruct-V-CORE-L1-GGUF

## Resumen
Qwen2.5-1.5B-Instruct-V-CORE-L1-GGUF es una compilacion cuantizada en formato GGUF del modelo Qwen/Qwen2.5-1.5B-Instruct, publicada por el usuario MarkovEfim. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos orientada a inferencia local eficiente mediante llama.cpp. El interes tecnico reside en el metodo de cuantizacion empleado: la herramienta vcore-l1-certified, que aplica optimizacion de la mediana en norma ℓ₁ con umbrales criticos exactos y agrupacion de valores atipicos por canal, respaldada por demostraciones formales en Lean 4.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-1.5B-Instruct, con aproximadamente 1.777 millones de parametros y una ventana de contexto de 32.768 tokens segun la especificacion del modelo base. El autor reporta una fidelidad alta frente al original en FP16: perplexity de 15,254 frente a 14,646 (un incremento del 4,1 por ciento) y similitud coseno de logits del 96,2 por ciento sobre un vocabulario de 151.936 tokens.

Es relevante para desarrolladores que necesitan desplegar un modelo pequeno de instrucciones en hardware modesto manteniendo un compromiso medible entre tamano y calidad, con la particularidad de que el proceso de cuantizacion viene acompanado de garantias formales, algo poco habitual en el ecosistema GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (modelo base Qwen2.5; no confirmado en la model card de esta compilacion) |
| Tipos de cuantizacion | GGUF Q4_0 con tensores F16 (1,84x de compresion) |
| Idiomas soportados | en, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atencion causal, capas de normalizacion RMSNorm, activacion SwiGLU y sesgos QKV, entrenado por Alibaba Qwen con un corpus multilingue y posteriormente ajustado por instrucciones y preferencias. Esta compilacion no reentrena el modelo; solo transforma los pesos.

El aporte tecnico de esta version es el pipeline de cuantizacion vcore-l1-certified, que realiza una optimizacion de la mediana bajo norma ℓ₁ con umbrales criticos exactos y agrupacion de valores atipicos por canal. El autor afirma que el proceso esta respaldado por pruebas formales en Lean 4 a traves del repositorio l1-projection-complexity-lean4 v3.0.0, lo que constituye una garantia matematica sobre el comportamiento de la proyeccion durante la cuantizacion. No se detallan en la informacion disponible el numero de tokens de entrenamiento ni la composicion del dataset, ya que corresponden al modelo base y no se reproducen aqui.

## Capacidades
- Generacion de texto e instrucciones en ingles y ruso, heredadas de Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a preguntas de dominio general.
- Generacion de codigo y tareas de matematicas de complejidad moderada, propias de un modelo de 1.5B parametros.
- Soporte de conversacion multi-turno con plantilla de chat de Qwen2.5.
- Inferencia local eficiente mediante llama.cpp con un unico archivo GGUF.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que permite servirlo a traves de infraestructuras compatibles con llama.cpp.
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling nativo ni modo thinking.

## Casos de uso
- Asistente de linea de comandos: el archivo GGUF de 1,6 GB se carga con llama-cli o llama-server en un portatil, permitiendo consultas interactivas sin conexion a internet.
- Prototipado rapido de chatbots: al ocupar menos de 2 GB en disco y una huella de memoria reducida, se puede integrar en entornos de desarrollo con recursos limitados para validar flujos conversacionales antes de migrar a modelos mayores.
- Generacion de texto en ruso e ingles: util para aplicaciones de redaccion asistida o resumen en estos dos idiomas, dado el soporte declarado.
- Educacion y demostraciones: su tamano permite ejecutarlo en aulas o talleres sobre hardware de consumo, mostrando el impacto de la cuantizacion en la calidad mediante la tabla de perplexity y similitud de logits incluida por el autor.
- Servicio ligero en CPU: mediante llama.cpp en modo servidor, puede atender peticiones de baja concurrencia en una maquina sin GPU dedicada.
- Investigacion sobre cuantizacion: sirve como caso de estudio reproducible para comparar el metodo vcore-l1-certified frente a cuantizaciones GGUF convencionales, gracias a las metricas de fidelidad publicadas.

## Benchmarks y rendimiento
Los unicos datos publicados en la informacion disponible son los de fidelidad frente al modelo en FP16, no benchmarks de tareas estandar.

| Metrica | FP16 baseline | V-CORE GGUF | Delta |
|---|---|---|---|
| Perplexity (PPL) | 14,646 | 15,254 | +0,607 (+4,1%) |
| Similitud coseno de logits (151.936 vocab) | 1,0000 | 0,9617 | 96,2% de alineacion |
| Tamano de archivo | 2.944,4 MB | 1.599,9 MB | 1,84x de compresion |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 1,6-2,0 GB para el archivo GGUF Q4_0, mas overhead de contexto (KV cache) que crece con la longitud de la secuencia.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM, como GTX 1650, RTX 3050, RTX 4060; tambien funciona en A100 o H100 aunque estas estan sobredimensionadas para un modelo de este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas, y tambien en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y cualquier runtime compatible con GGUF. No se confirma soporte de vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (FP16) | 1,777B | 32.768 | safetensors | apache-2.0 | Referencia de calidad; 2.944 MB |
| Qwen2.5-1.5B-Instruct-V-CORE-L1-GGUF | 1,777B | 32.768 (base) | GGUF Q4_0 | apache-2.0 | 1.600 MB, PPL +4,1% |
| Otras cuantizaciones GGUF de Qwen2.5-1.5B-Instruct | 1,777B | 32.768 (base) | GGUF | apache-2.0 | No disponibles en la informacion proporcionada para comparar metricas |

No se dispone de datos de benchmarks comparativos con modelos de otros autores en la informacion disponible.

## Limitaciones y advertencias
- Degradacion medible de calidad: la perplexity aumenta un 4,1 por ciento y la similitud de logits cae al 96,2 por ciento, por lo que no es identico al modelo original.
- Herencia de sesgos de Qwen2.5-1.5B-Instruct: al ser una cuantizacion, conserva los sesgos y limitaciones del modelo base, no documentados en esta ficha.
- Riesgo de alucinacion: inherente a un modelo de 1.5B parametros, especialmente en tareas de conocimiento factual y razonamiento complejo.
- Idiomas: solo se declaran ingles y ruso; el rendimiento en castellano no esta garantizado ni documentado.
- Contexto: la ventana de 32.768 tokens corresponde al modelo base y no se confirma en la model card de esta compilacion; el uso de contextos largos incrementa la memoria necesaria.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-1.5B-Instruct, que tambien es apache-2.0.
- Madurez: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- Las afirmaciones sobre pruebas formales en Lean 4 dependen de los repositorios del autor y no han sido verificadas de forma independiente en la informacion disponible.

## Enlaces
- Hugging Face: https://huggingface.co/MarkovEfim/Qwen2.5-1.5B-Instruct-V-CORE-L1-GGUF
- Repositorio vcore-l1-certified: https://github.com/fomamarkov-creator/vcore-l1-certified
- Repositorio l1-projection-complexity-lean4: https://github.com/fomamarkov-creator/l1-projection-complexity-lean4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
