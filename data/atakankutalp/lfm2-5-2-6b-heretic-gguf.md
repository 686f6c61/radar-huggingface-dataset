# atakankutalp/LFM2.5-2.6B-heretic-GGUF

# LFM2.5-2.6B-heretic-GGUF

## Resumen

LFM2.5-2.6B-heretic-GGUF es una coleccion de cuantizaciones en formato GGUF de un checkpoint "abliterated" (decensurado) derivado de LiquidAI/LFM2.5-2.6B. El autor, atakankutalp, ha aplicado la herramienta Heretic v1.4.0 sobre el modelo base de Liquid AI para proyectar fuera la direccion de rechazo (refusal direction) en las proyecciones de salida de atencion y en las proyecciones down del MLP de las 30 capas del transformer, fusionando despues el resultado en los pesos. A partir de ese checkpoint se han generado seis ficheros GGUF (F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q4_0) compatibles con llama.cpp, LM Studio y Ollama.

El modelo conserva la arquitectura LFM2 (etiquetada como "LFM2" en llama.cpp) y aproximadamente 2.697 millones de parametros, lo que lo situa en la clase de 2-3B. Es un modelo denso, no MoE, y mantiene las 16 lenguas declaradas por el modelo original (arabe, chino, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, espanol, tailandes y vietnamita).

Su relevancia actual es doble: por un lado, ofrece un modelo pequeno que cabe en hardware de consumo; por otro, reduce deliberadamente la alineacion de seguridad. Segun los datos del autor, los rechazos pasan de 94/100 en el modelo original a 6/100 en esta version, con una divergencia KL de 0.0232 respecto al checkpoint de partida. Los ficheros de pesos estan modificados y las salidas no estan filtradas por seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 30 capas basado en LFM2 (etiqueta de arquitectura "LFM2" en llama.cpp) |
| Parametros totales | 2.697.198.592 (~2.70 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | arabe, chino, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, espanol, tailandes, vietnamita (16) |
| Licencia | LFM Open License v1.0 (identificador lfm1.0, etiquetada como "other") |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Este repositorio no entrena un modelo desde cero: parte del checkpoint LiquidAI/LFM2.5-2.6B y le aplica una tecnica de ablacion direccional ("abliteration") con Heretic v1.4.0. El proceso busca la direccion de rechazo en el espacio de activaciones y la elimina mediante proyeccion en cada una de las 30 capas, tanto en las proyecciones de salida de la atencion como en las proyecciones down del MLP. Los parametros documentados de la ablacion son 200 ensayos, semilla 3407 y seleccion del ensayo indice 93. El resultado se fusiona en los pesos base, generando primero un checkpoint en safetensors y despues las cuantizaciones GGUF.

La conversion y cuantizacion se realizaron con llama.cpp (build b10964): el script convert_hf_to_gguf.py con --outtype f16 y despues llama-quantize para el resto de niveles. El autor indica que los seis ficheros cargan y generan con llama-cli y que sus tamanos coinciden con el conjunto upstream LiquidAI/LFM2.5-2.6B-GGUF. No se documenta en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original.

La innovacion tecnica destacable es precisamente la ablacion reproducible y verificable (con hashes SHA-256 publicados) que reduce los rechazos manteniendo una divergencia KL de 0.0232 respecto al original.

## Capacidades

- Generacion de texto conversacional en 16 idiomas, con foco en el estilo de chat multi-turno.
- Respuestas sin los filtros de rechazo habituales sobre temas sensibles (comportamiento "uncensored" o "decensored").
- Soporte multilingue declarado para arabe, chino, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, espanol, tailandes y vietnamita.
- Compatible con cualquier runtime basado en llama.cpp, incluido el servidor con API compatible con OpenAI (llama-server).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte explicito de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modos especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en portatil o mini-PC: gracias a la cuantizacion Q4_K_M (1.674,5 MB), el modelo cabe en equipos con poca VRAM o incluso en CPU, lo que permite un asistente conversacional sin conexion a internet.
- Escritura creativa y roleplay sin censura: al haber reducido los rechazos a 6/100, es adecuado para narrativa, guiones o personajes que en el modelo original serian bloqueados por filtros de seguridad.
- Investigacion sobre alineacion y seguridad: sirve como contrapunto controlado al modelo original para estudiar el efecto de la ablacion direccional sobre el comportamiento de rechazo (comparativa 6/100 frente a 94/100).
- Red-teaming y evaluacion de robustez: util para generar prompts adversarios y comprobar como responden otros modelos o filtros de contenido.
- Traduccion y asistencia multilingue ligera en 16 idiomas, integrable en herramientas de escritorio mediante llama-server con API compatible con OpenAI.
- Clasificacion y resumen de texto sobre documentos locales: el modelo puede procesar contexto conversacional en un equipo sin GPU dedicada por su bajo consumo de memoria.
- Prototipado rapido de agentes conversacionales: al exponerse via llama-server, se puede conectar a frameworks que consuman endpoints compatibles con OpenAI sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor si publica metricas comparativas respecto al modelo original, centradas en la calidad de la ablacion:

| Metrica | Este modelo | Modelo original (LiquidAI/LFM2.5-2.6B) |
|---|---|---|
| Divergencia KL | 0,0232 | 0 (por definicion) |
| Rechazos | 6/100 | 94/100 |

No se aportan datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (pesos, sin contar cache KV ni overhead de contexto):
  - F16: 5.403,2 MB (~5,3 GB).
  - Q8_0: 2.874,8 MB (~2,8 GB).
  - Q6_K: 2.221,6 MB (~2,2 GB).
  - Q5_K_M: 1.939,7 MB (~1,9 GB).
  - Q4_K_M: 1.674,5 MB (~1,6 GB).
  - Q4_0: 1.593,9 MB (~1,6 GB).
- GPU recomendadas: cualquier GPU consumer moderna con 4 GB o mas de VRAM (por ejemplo RTX 3050, RTX 3060, RTX 4060, RTX 4090) es suficiente para las cuantizaciones Q4 y Q5. Para F16 se recomienda al menos 8 GB de VRAM. En entornos profesionales, A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, todas las cuantizaciones caben holgadamente en GPU de gama media y baja; Q4_K_M y Q4_0 pueden ejecutarse incluso en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), LM Studio, Ollama (previa conversion del GGUF) y cualquier runtime compatible con llama.cpp.
- Ejemplo de ejecucion en linea de comandos:
  - `llama-cli -hf atakankutalp/LFM2.5-2.6B-heretic-GGUF:Q4_K_M --conversation --temp 0.1 --top-k 50 --repeat-penalty 1.1`
  - `llama-server -hf atakankutalp/LFM2.5-2.6B-heretic-GGUF:Q4_K_M --host 0.0.0.0 --port 8080`
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-2.6B-heretic-GGUF | ~2,70B | no disponible | LFM Open License v1.0 | GGUF | Version decensurada; 6/100 rechazos; KL 0,0232 |
| LiquidAI/LFM2.5-2.6B | ~2,70B | no disponible | LFM Open License v1.0 | safetensors, GGUF | Modelo original alineado; 94/100 rechazos |
| Llama-3.2-3B-Instruct | 3,21B | 128k | Llama 3.2 Community License | safetensors, GGUF | Alternativa densa de tamano similar, fuertemente alineada |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 (hasta 131.072 con YaRN) | Apache 2.0 | safetensors, GGUF | Alternativa densa multilingue con licencia permisiva |

Los datos de contexto y parametros de Llama-3.2-3B-Instruct y Qwen2.5-3B-Instruct son valores publicos de referencia de esos modelos; no proceden de la informacion proporcionada en esta ficha.

## Limitaciones y advertencias

- La alineacion de seguridad se ha reducido deliberadamente mediante ablacion direccional; las salidas no estan filtradas y bajan mucho los rechazos en temas sensibles.
- Riesgo de contenido danino, ofensivo o inapropiado: el propio autor advierte explicitamente de que los ficheros de pesos estan modificados y deben usarse en consecuencia.
- Riesgo de alucinacion: es un modelo de ~2,7B, por lo que su fiabilidad factual y su razonamiento complejo son limitados en comparacion con modelos mayores.
- Longitud de contexto no documentada en la informacion disponible; conviene verificarla antes de usarlo con documentos largos.
- Restricciones de licencia: se distribuye bajo la LFM Open License v1.0. La seccion 4(a) exige incluir el fichero LICENSE, la 4(b) anadir el aviso de fichero modificado y la 4(c) conservar los avisos de copyright, marca y atribucion originales. Revisar los terminos completos antes de uso comercial.
- Atribucion obligatoria a Liquid AI (modelo base), Philipp Emanuel Weidmann (Heretic, AGPL-3.0) y llama.cpp (MIT).
- El modelo original soporta 16 idiomas; no se ha verificado el rendimiento real tras la ablacion en cada uno de ellos.
- No se documentan datos de sesgo, evaluaciones de seguridad posteriores ni pruebas de robustez mas alla del recuento de rechazos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/atakankutalp/LFM2.5-2.6B-heretic-GGUF
- Checkpoint fuente (abliterated): https://huggingface.co/atakankutalp/LFM2.5-2.6B-heretic
- Modelo base original: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- GGUF del modelo original: https://huggingface.co/LiquidAI/LFM2.5-2.6B-GGUF
- Herramienta Heretic (repositorio): https://github.com/p-e-w/heretic
- Proyecto Heretic: https://heretic-project.org
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai/
- Ollama: https://ollama.com/
