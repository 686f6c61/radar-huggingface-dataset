# mohibovais79/tarsniff

## Resumen

tarsniff es un ajuste fino por LoRA de Qwen3-1.7B especializado en la deteccion de paquetes npm maliciosos antes de su instalacion. Lo desarrolla mohibovais79 en el contexto del Qwen Local Hackathon 2026 y se distribuye bajo licencia Apache-2.0. El modelo resuelve un problema concreto de la cadena de suministro de software: determinar si un paquete npm contiene codigo malicioso (scripts de instalacion, hooks de ejecucion, uso de APIs de riesgo) a partir de un resumen textual del paquete, devolviendo una verdicta binaria en JSON.

Tecnicamente es un transformer decoder-only de 1.720.574.976 parametros (1,7 mil millones), derivado de Qwen3-1.7B y del checkpoint cuantizado a 4 bits de mlx-community. El ajuste se realizo con LoRA de rango 16 sobre todas las capas, con 600 pasos y un conjunto de 600 paquetes (300 maliciosos y 300 benignos). El resultado se exporta como GGUF Q4_K_M de aproximadamente 1,0 GB, disenado para ejecutarse localmente en Ollama o llama.cpp sin dependencia de la nube ni de claves de API.

Su relevancia actual radica en que aborda un vector de ataque en auge (paquetes npm comprometidos) con un modelo pequeno que cabe en hardware de consumo: segun el autor, procesa un paquete en torno a 1 segundo en un Mac mini M4 con 16 GB. Frente al modelo base, el ajuste reduce drasticamente los falsos positivos (del 93 % al 9 % en paquetes seguros) manteniendo una tasa de deteccion del 85 % en malware, con un F1 de 0,77 frente a 0,35 del base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino LoRA |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el digest de entrada se limita a 1024 tokens y el entrenamiento uso maximo 1200 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF); adaptador LoRA en safetensors sobre base 4-bit MLX |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tarsniff-q4_k_m.gguf), safetensors (adapter/adapters.safetensors), Modelfile para Ollama |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only, en su version cuantizada a 4 bits para MLX (mlx-community/Qwen3-1.7B-4bit). Sobre esa base se aplica un ajuste LoRA de rango 16, escala 20, dropout 0, en todas las capas, con la funcion de perdida calculada unicamente sobre la respuesta (mask_prompt). El entrenamiento se ejecuto con MLX-LM 0.32.2 durante 600 pasos, batch 1, learning rate 1e-4, optimizador Adam y longitud maxima de 1200 tokens, en un Mac mini M4 de 16 GB (36 minutos, 2,9 GB de memoria pico).

Los datos de entrenamiento son 600 paquetes: 300 maliciosos extraidos del dataset Datadog malicious-software-packages (enero a mayo de 2026) y 300 paquetes npm benignos. La entrada es un digest del paquete limitado a 1024 tokens que incluye la lista de ficheros, el package.json (sin nombre, version ni descripcion), los ficheros con hooks de instalacion, los ficheros de entrada y el codigo ordenado por uso de APIs de riesgo. La salida es un JSON con `{"verdict": "malicious"}` o `{"verdict": "benign"}`, y la puntuacion se obtiene como P(malicious) del primer token de respuesta. Para la exportacion, el adaptador LoRA se fusiona en el modelo des-cuantizado, se convierte a GGUF con llama.cpp y se cuantiza a Q4_K_M.

## Capacidades

- Clasificacion binaria de paquetes npm como maliciosos o benignos a partir de un digest textual del paquete.
- Analisis de scripts de instalacion (install hooks), ficheros de entrada y codigo con APIs de riesgo.
- Generacion de salida estructurada en JSON (`verdict`), adecuada para integracion en pipelines automatizados.
- Estimacion de probabilidad de malware mediante la probabilidad del primer token de respuesta.
- Ejecucion local sin conexion a la nube, compatible con Ollama, llama.cpp y LM Studio.
- Uso como segunda opinion complementaria a escaneres basados en reglas como GuardDog.
- No dispone de capacidades generales de razonamiento, codigo, matematicas, vision, audio ni tool calling mas alla de la tarea especifica de clasificacion para la que fue ajustado.

## Casos de uso

- Verificacion previa a la instalacion en CI/CD: integrar `tarsniff scan paquete@version` como paso previo a `npm install`, de modo que un codigo de salida 1 bloquee el despliegue de dependencias sospechosas.
- Puerta de seguridad en pipelines de build: ejecutar el escaneo sobre cada nueva dependencia anadida en un pull request y marcar automaticamente los cambios que introduzcan paquetes con verdicto malicioso.
- Analisis de dependencias en entornos de desarrollo locales: usar el CLI en la maquina del desarrollador para revisar paquetes de terceros antes de incorporarlos, sin enviar codigo a servicios externos.
- Triaje en respuesta a incidentes de cadena de suministro: dado un aviso de OSV sobre un paquete comprometido, comprobar rapidamente si la version descargada en un proyecto concreto presenta indicios de malware.
- Complemento de escaneres basados en reglas: combinar tarsniff con GuardDog para elevar la cobertura (el autor reporta un 95 % de deteccion combinada frente al 61 % de GuardDog en solitario).
- Auditoria de dependencias en entornos con requisitos de confidencialidad: al ejecutarse en local sobre un modelo de 1 GB, permite revisar paquetes en redes aisladas o con politicas que prohiben el envio de codigo a APIs externas.
- Filtrado previo en registros espejo o proxies de npm: clasificar paquetes entrantes antes de almacenarlos o servirlos a los equipos de desarrollo.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card. El conjunto de prueba son paquetes no vistos en entrenamiento (el malware de entrenamiento termina en mayo de 2026). Prueba sobre malware npm en vivo de noviembre de 2026 (informes de OSV del 13 al 27 de noviembre, seleccionados antes de puntuar) mas las ultimas versiones de 286 paquetes populares como control seguro:

| Modelo | Malware detectado (74) | Paquetes seguros marcados (286) |
|---|---|---|
| tarsniff | 62 (84 %) | 29 (10 %) |
| GuardDog 3.2.0 (basado en reglas, score >= 5) | 45 (61 %) | 5 (2 %) |
| Cualquiera de los dos | 70 (95 %) | 32 |

Comparacion base frente a ajuste fino sobre los mismos paquetes en vivo (73 maliciosos y 280 seguros con codigo):

| Metrica | Qwen3-1.7B base (4-bit) | tarsniff |
|---|---|---|
| Paquetes seguros marcados erroneamente | 93 % | 9 % |
| Malware detectado | 96 % | 85 % |
| F1 | 0,35 | 0,77 |
| ROC-AUC | 0,82 | 0,95 |

Comparacion GGUF frente al modelo MLX original sobre 300 paquetes reservados: F1 de 0,747 frente a 0,750 y mismo verdicto en el 99,7 % de los casos. Velocidad: aproximadamente 1 segundo por paquete en un Mac mini M4 (16 GB) con Ollama.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,0 GB de pesos en Q4_K_M mas overhead de contexto; el autor reporta 2,9 GB de memoria pico durante el entrenamiento, no durante la inferencia.
- GPU recomendadas: no se especifican; el modelo esta pensado para ejecucion local en CPU/GPU integrada de Apple Silicon (probado en Mac mini M4 con 16 GB).
- Cabe en GPU de consumo: si, dado el tamano de 1,0 GB en Q4_K_M; no se han publicado pruebas en tarjetas concretas (RTX 4090, etc.).
- Opciones de despliegue: Ollama (`ollama pull hf.co/mohibovais79/tarsniff:Q4_K_M`), llama.cpp, LM Studio; el adaptador LoRA se ejecuta con MLX-LM sobre la base 4-bit.
- Latencia y throughput estimados: aproximadamente 1 segundo por paquete en Mac mini M4 (16 GB) con Ollama; no se han publicado datos de throughput en lote.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Deteccion de malware npm | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tarsniff | LLM ajustado (Qwen3-1.7B + LoRA) | 1,72 B | digest de 1024 tokens | 84 % (62/74), 10 % falsos positivos | Apache-2.0 | Hugging Face, Ollama, llama.cpp |
| GuardDog 3.2.0 | Escaner basado en reglas | no aplica | no aplica | 61 % (45/74), 2 % falsos positivos | no disponible en la informacion | Herramienta open source |
| Qwen3-1.7B (base) | LLM general | 1,72 B | no disponible | 96 % deteccion pero 93 % falsos positivos (F1 0,35) | Apache-2.0 | Hugging Face |

No se dispone de datos de otros modelos especializados en deteccion de malware npm en la informacion proporcionada.

## Limitaciones y advertencias

- Solo lee los primeros 1024 tokens del digest, por lo que el codigo malicioso enterrado en un paquete grande y por lo demas legitimo (por ejemplo, una release secuestrada de una libreria popular) puede pasar desapercibido.
- Tasa de falsos positivos del 10 % sobre paquetes seguros en la prueba en vivo, lo que puede generar friccion si se usa como unico filtro bloqueante.
- Tasa de deteccion del 85 % en malware, inferior al 96 % del modelo base; el ajuste prioriza reducir falsos positivos a costa de sensibilidad.
- Entrenado exclusivamente con paquetes npm; no se ha validado para otros ecosistemas (PyPI, Maven, crates.io, etc.).
- Idioma de trabajo en ingles; no se ha evaluado su comportamiento con descripciones o comentarios en otros idiomas.
- No es un modelo de proposito general: no debe emplearse para generacion de texto, codigo o razonamiento fuera de la tarea de clasificacion.
- Riesgo de alucinacion en el sentido de verdictos incorrectos; el autor recomienda usarlo junto a un escaner basado en reglas como GuardDog.
- Los datos de entrenamiento de malware cubren enero a mayo de 2026; tecnicas de ofuscacion posteriores pueden no estar representadas.
- Licencia Apache-2.0, que permite uso comercial; los datos maliciosos provienen del dataset de Datadog (Apache-2.0) y los informes de prueba de OSV.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no ha pasado por una validacion independiente mas alla de la reportada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohibovais79/tarsniff
- Codigo y CLI: https://github.com/mohibovais79/tarsniff
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Base cuantizada MLX: https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
- Dataset de paquetes maliciosos de Datadog: https://github.com/DataDog/malicious-software-packages-dataset
- OSV (informes de malware npm): https://osv.dev
