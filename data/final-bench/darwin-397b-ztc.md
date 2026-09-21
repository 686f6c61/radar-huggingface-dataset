# FINAL-Bench/Darwin-397B-ZTC

## Resumen

Darwin-397B-ZTC es un modelo de lenguaje de razonamiento construido por FINAL-Bench (VIDRAFT) sobre la columna vertebral `Qwen/Qwen3.5-397B-A17B`. Se trata de un Mixture-of-Experts disperso de aproximadamente 403,6 mil millones de parametros totales (denominado comercialmente "397B") con unos 17 mil millones de parametros activos por token, cuantizado en FP8 W8A8 y con una ventana de contexto de 262.144 tokens. No se entrena desde cero: la familia Darwin aplica la metodologia "Darwin V9", que selecciona expertos (FFN) de varios modelos de alto rendimiento, los trasplanta sobre un backbone base y los fusiona mediante merging evolutivo ponderado por confianza.

El rasgo diferencial del modelo es ZTC (Zero-Token Confidence), un mecanismo de lectura de confianza que, segun el autor, inspecciona el estado interno del modelo antes de empezar a generar y permite frenar la respuesta cuando la prediccion va a ser erronea. Esto lo situa en el terreno del "pre-action gating" para agentes, deteccion de alucinaciones y enrutado selectivo, en lugar de los enfoques clasicos de juez externo o autoinforme verbal, que solo operan una vez que la respuesta ya existe.

El modelo declara un 93,43 % de accuracy en GPQA Diamond (greedy, una sola muestra, no verificado de forma independiente) y esta publicado con licencia Apache-2.0, con pesos en safetensors y soporte previsto para vLLM y SGLang. Su relevancia actual radica en dos factores: es una de las variantes de mayor puntuacion declarada dentro de la propia familia Darwin y combina esa capacidad con un modulo de calibracion pensado explicitamente para produccion con agentes, a costa de un requisito de hardware muy elevado (418,7 GB de pesos en FP8).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) dispersa con atencion hibrida (atencion completa + atencion lineal); tipo `qwen3_5_moe` |
| Parametros totales | 403.586.672.624 (~403,6 B) segun safetensors; el autor lo comercializa como "397B" |
| Parametros activos | ~17 B (sufijo A17B del backbone Qwen 3.5) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | FP8 W8A8 mediante `compressed-tensors`; no se anuncian variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | en, ko, zh, ja, multilingual (la model card destaca coreano e ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP8, `compressed-tensors`); repo de 418,7 GB |
| Libreria de referencia | transformers |
| Pipeline declarado | text-generation |
| Modelo base | Qwen/Qwen3.5-397B-A17B (Apache-2.0) |
| Modulo adicional | ZTC (zero-token confidence), incluido en el directorio `ztc/` |
| Fecha de creacion / ultima actualizacion | 2026-06-25 / 2026-09-20 |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-397B-A17B`, un MoE disperso de ~397B-403B parametros totales con ~17B activos por token, al que se aplica la metodologia propietaria Darwin V9: seleccion de expertos con buen rendimiento en varios modelos de referencia, trasplante de esos FFN/expertos sobre el backbone y fusion mediante merging evolutivo ponderado por confianza ("trust-weighted evolutionary merging"). El autor afirma explicitamente que no se entrena nada desde cero, sino que se injerta capacidad ya demostrada, y que el metodo se mantiene estable a traves de distintos tamanos (de 9B a 397B). La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o RL posterior al trasplante. Tampoco detalla cuantos expertos tiene el modelo, cuantos se activan por token ni el ratio de enrutamiento.

En el plano de inferencia, la arquitectura combina atencion hibrida con atencion lineal, lo que habilita la ventana de 262K tokens con un coste de atencion mas contenido que un transformer denso equivalente. Los pesos se distribuyen cuantizados en FP8 W8A8 (activaciones y pesos a 8 bits) mediante el formato `compressed-tensors`, reduciendo la huella a 418,7 GB. El componente ZTC se describe como una lectura unica del estado interno previa a la generacion, que produce una senal de confianza utilizable para gating previo a la accion; la model card no publica la arquitectura interna de ese modulo, su coste computacional anadido ni el procedimiento de calibracion. La informacion disponible se corta antes de detallar la comparativa entre ZTC y el enfoque de juez externo, por lo que el resto de detalles tecnicos de ZTC no esta disponible.

## Capacidades

- Generacion de texto y razonamiento extenso con modo "thinking" y cadena de pensamiento (chain-of-thought).
- Razonamiento de nivel graduado en matematicas, ciencia y STEM, con enfasis declarado en GPQA Diamond y MMLU-Pro.
- Generacion y comprension de codigo, con pipeline declarado de `text-generation` y soporte de conversacion multi-turno.
- Tool calling y function calling, lo que permite integracion en agentes con llamadas a herramientas.
- Capacidades agenticas y de razonamiento multi-paso.
- Estimacion de confianza previa a la generacion (ZTC): deteccion de alucinaciones, cuantificacion de incertidumbre, calibracion, autocorreccion y prediccion selectiva.
- Pre-action gating y guardrails: posibilidad de bloquear o desviar una respuesta antes de emitirla, con uso declarado en enrutado de LLM (llm-router).
- Multilinguismo declarado en ingles, coreano, chino y japones, con etiqueta `multilingual`; la model card destaca el eje coreano-ingles (`bilingual`).
- Entrada multimodal de tipo image-text-to-text segun la etiqueta `image-text-to-text` del repositorio; la model card no detalla el alcance de esa capacidad.
- Despliegue compatible con vLLM y SGLang, con API compatible con OpenAI y ejecucion multi-GPU.

## Casos de uso

- Atencion al cliente automatizada de largo recorrido: con 262K tokens de contexto, el modelo puede mantener el historial completo de una conversacion o de un expediente de cliente sin truncar, y usar ZTC para derivar a un humano cuando la senal de confianza sea baja.
- Agentes que operan sobre herramientas criticas: el pre-action gating permite abortar una llamada a herramienta (pago, envio, modificacion de base de datos) cuando la confianza interna cae por debajo del umbral, reduciendo el coste de acciones erroneas irreversibles.
- Generacion de codigo en produccion: con soporte de function calling y tool calling, puede integrarse en pipelines de CI/CD para proponer parches, generar tests o revisar diffs, usando la senal ZTC como filtro previo a la apertura automatica de pull requests.
- Analisis de documentacion tecnica extensa: informes de auditoria, expedientes regulatorios o repositorios completos que entren en la ventana de 262K tokens, con resumen y extraccion de datos estructurados en una sola pasada.
- Guardrails y enrutado de modelos en una plataforma multi-LLM: emplear la puntuacion de confianza como criterio de enrutamiento entre un modelo barato y este modelo de mayor coste, o como segunda opinion en un sistema de verificacion.
- Asistencia a investigacion cientifica y matematica: resolucion de problemas de nivel graduado en fisica, quimica y biologia con trazas de razonamiento explicitas, aprovechando el rendimiento declarado en GPQA Diamond.
- Deteccion de alucinaciones en pipelines RAG: marcar respuestas de baja confianza antes de mostrarlas al usuario final, en lugar de recurrir a un segundo modelo juez.
- Soporte bilingue coreano-ingles y multilingue en mercados de Asia Oriental, con cobertura adicional declarada de chino y japones.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index del repositorio. El unico resultado publicado es GPQA Diamond; no hay datos de MMLU, MMLU-Pro, HumanEval, GSM8K ni de otras tareas en la informacion disponible.

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| GPQA Diamond (`Idavidrein/gpqa`, config `gpqa_diamond`, split `train`) | Accuracy | 93,43 % | Greedy, una sola muestra; marcado como no verificado (`verified: false`) |

El autor publica ademas una tabla comparativa interna de la familia Darwin, tambien sin verificacion independiente:

| Modelo | Escala | GPQA Diamond |
|---|---|---|
| Darwin-9B-NEG | 9B | 84,3 |
| Darwin-27B-Opus | 27B denso | 86,9 |
| Darwin-36B-Opus | 36B MoE | 88,4 |
| Darwin-28B-Opus | 28B | 88,89 |
| Darwin-28B-REASON | 28B + DELPHI | 89,39 |
| Darwin-398B-JGOS | 397B MoE (bf16) | 90,9 |
| Darwin-397B-ZTC | 397B MoE (FP8) | 93,43 |

No se han publicado resultados de benchmarks independientes ni de terceros en la informacion disponible.

## Requisitos de hardware

- VRAM para pesos: 418,7 GB en FP8 (W8A8). Solo los pesos requieren al menos 6 GPU de 80 GB, y en la practica 7-8 GPU de 80 GB para dejar margen a la cache KV, los buffers de activaciones y el reparto de expertos.
- Configuracion minima razonable: 8 x H100 80 GB (o 8 x H200 141 GB), con paralelismo de tensor y de expertos.
- GPU recomendadas: H100 80 GB, H200 141 GB o B200 para despliegues de produccion. A100 80 GB puede ser suficiente en numero equivalente si el runtime soporta FP8 con emulacion, aunque con penalizacion de rendimiento no cuantificada en la informacion disponible.
- GPU de consumo: no cabe. El modelo no es ejecutable en una RTX 4090 (24 GB), RTX 5090 ni en configuraciones de 1-2 GPU de consumo. Para equipos de ese perfil, el propio autor publica variantes de la familia con formato GGUF (por ejemplo POCKET-35B-GGUF, POCKET-26B-GGUF, Darwin-35B-A3B-Opus, Darwin-36B-Opus, Darwin-4B-Genesis), que serian la alternativa practica.
- Opciones de despliegue: vLLM y SGLang (etiquetas explicitas del repositorio), con API compatible con OpenAI y soporte multi-GPU; transformers como libreria de referencia. No hay confirmacion de soporte de llama.cpp, Ollama ni TGI para esta variante FP8.
- Latencia y throughput estimados: no disponible. El autor no publica tokens por segundo, TTFT ni curvas de rendimiento segun tamano de lote o longitud de contexto.
- Nota sobre cache KV: con 262K tokens de contexto, la cache KV puede superar ampliamente el espacio ocupado por los pesos en sesiones largas; conviene dimensionar el cluster contando esa memoria, aunque la atencion lineal de la arquitectura hibrida mitiga parcialmente el crecimiento.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de terceros para establecer una comparativa fiable con modelos externos de la misma categoria. La siguiente tabla recoge unicamente los datos publicados por el propio autor para la familia Darwin; el resto de modelos comparables no esta disponible en la informacion proporcionada.

| Modelo | Parametros | Contexto | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Darwin-397B-ZTC | ~403,6 B totales / ~17 B activos | 262.144 tokens | 93,43 | apache-2.0 | Pesos abiertos en HuggingFace (FP8, 418,7 GB) |
| Darwin-398B-JGOS | 397B MoE | no disponible | 90,9 | no disponible en la informacion | Pesos abiertos segun la model card |
| Darwin-28B-REASON | 28B + DELPHI | no disponible | 89,39 | no disponible en la informacion | Pesos abiertos segun la model card |
| Qwen/Qwen3.5-397B-A17B (backbone) | ~397B totales / ~17 B activos | no disponible | no disponible | apache-2.0 | Pesos abiertos |

No hay informacion disponible sobre comparativas con modelos de otros desarrolladores (por ejemplo, alternativas abiertas de ~400B MoE o de la misma franja de contexto).

## Limitaciones y advertencias

- El unico resultado de benchmark publicado (93,43 % en GPQA Diamond) esta marcado explicitamente como `verified: false` y se ha obtenido con decodificacion greedy y una sola muestra; conviene tratarlo como una cifra declarada por el autor, no replicada.
- El split declarado para GPQA Diamond es `train`, no un split de evaluacion independiente; esto merece cautela a la hora de interpretar el resultado como indicador de generalizacion.
- No se documentan sesgos conocidos, composicion del dataset de entrenamiento ni proceso de alineacion, por lo que no es posible evaluar riesgos de sesgo con la informacion disponible.
- El modulo ZTC se describe de forma conceptual; no se publican tasas de acierto del propio detector, umbrales recomendados, curvas de calibracion (ECE) ni el coste de inferencia anadido. Sin esos datos, no deberia asumirse que la senal de confianza es fiable en produccion.
- La model card se encuentra truncada en la seccion comparativa de ZTC, por lo que faltan detalles de implementacion y limitaciones declaradas por el propio autor.
- El modelo hereda las limitaciones del backbone Qwen 3.5, incluidas posibles degradaciones en contextos muy largos (262K) y comportamientos no documentados en idiomas con poca representacion.
- Cobertura idiomatica: se declaran en, ko, zh, ja y `multilingual`, pero la model card enfatiza coreano e ingles. El rendimiento en castellano no esta documentado.
- Riesgo de alucinacion: inherente a un modelo de este tipo, especialmente en tareas de conocimiento factual especializado. El propio autor posiciona ZTC como mitigacion, lo que implica reconocer ese riesgo.
- Requisitos de hardware muy altos (418,7 GB en FP8, multiples GPU de 80 GB), lo que limita el despliegue a infraestructura de centro de datos y descarta el uso en entornos de consumo o edge.
- Licencia Apache-2.0: permite uso comercial y modificacion sin restricciones adicionales segun la propia licencia, pero conviene verificar las condiciones del backbone Qwen 3.5 y de los modelos de origen de los expertos trasplantados, cuyo detalle no se publica en la informacion disponible.
- Al ser un modelo con metodo de construccion propietario (trasplante de expertos y merging evolutivo), la trazabilidad completa de los datos de origen no es verificable a partir de la informacion publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FINAL-Bench/Darwin-397B-ZTC
- Sitio del autor (VIDRAFT): https://vidraft.net
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Modelos relacionados de la familia Darwin citados en la model card:
  - https://huggingface.co/FINAL-Bench/POCKET-35B-GGUF
  - https://huggingface.co/FINAL-Bench/POCKET-26B-GGUF
  - https://huggingface.co/FINAL-Bench/Darwin-35B-A3B-Opus
  - https://huggingface.co/FINAL-Bench/Darwin-36B-Opus
  - https://huggingface.co/FINAL-Bench/Darwin-4B-Genesis
  - https://huggingface.co/FINAL-Bench/Darwin-9B-NEG
  - https://huggingface.co/FINAL-Bench/Darwin-28B-REASON
  - https://huggingface.co/FINAL-Bench/Ourbox-35B-JGOS-GGUF
  - https://huggingface.co/FINAL-Bench/POCKET-EN-GGUF
  - https://huggingface.co/FINAL-Bench/POCKET-KR-GGUF
- Dataset de evaluacion GPQA: https://huggingface.co/datasets/Idavidrein/gpqa
- Paper de GPQA: no disponible en la informacion proporcionada.
- Blog o documentacion tecnica de Darwin V9 o de ZTC: no disponible en la informacion proporcionada.
- Repositorio de codigo o demo: no disponible en la informacion proporcionada.

Nota: la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; unicamente definiciones de diccionario del termino frances "final", sin relacion con el repositorio.
