# doth4580/Lygodactylus-FlashNext-Uncensored-3bpw

## Resumen

Lygodactylus-FlashNext-Uncensored-3bpw es un paquete de pesos cuantizados en formato EXL3 (ExLlamaV3) a 3 bits por peso (bpw) del modelo orcarouter/Qwen3.8-Flash-Next-Uncensored, que a su vez es una variante sin censura del Qwen/Qwen3.8-Flash-Next del equipo Qwen. El repositorio lo publica el usuario doth4580 como espejo byte a byte del pack original de Lygodactylus, con el objetivo de servir como referencia estable para el motor de inferencia veloGB10 sobre hardware NVIDIA DGX Spark / GB10.

La relevancia del paquete es doble: por un lado, reduce un modelo de arquitectura MoE (mezcla de expertos) a 3 bpw, lo que permite ejecutarlo en una sola máquina GB10 con 262.144 tokens de contexto máximo; por otro, incluye cabezas de decodificación especulativa (MTP) alternativas que elevan la velocidad de decodificación hasta un 20 % en configuraciones multinodo. El modelo base es de tipo "uncensored", es decir, con el alineamiento de seguridad relajado o eliminado, lo que condiciona su uso en producción.

No se dispone de información sobre el número de parámetros totales, la composición del dataset de entrenamiento ni los resultados de benchmarks de calidad del modelo original en la información proporcionada. Los únicos datos cuantitativos publicados son los de rendimiento del motor veloGB10 sobre este pack concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), transformer; tag `moe` en el repo |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (`--max-seq-len 262144` en la configuración de referencia) |
| Tipos de cuantización | EXL3 a 3 bpw (3 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`, enlace a LICENSE de Qwen3.8-Flash-Next) |
| Formato de pesos | EXL3 (ExLlamaV3); no safetensors ni GGUF |
| Modelo base | orcarouter/Qwen3.8-Flash-Next-Uncensored (derivado de Qwen/Qwen3.8-Flash-Next) |
| Cuantizador | Lygodactylus, con exllamav3 |
| Motor de referencia | veloGB10 (`gb10_inference`) |
| Tokens máximos de salida | 65.536 (`--max-tokens 65536`) |
| Batch máximo probado | 2 peticiones concurrentes (`--max-batch 2`) |
| Caché de prefijo | soportada (`--prefix-cache on`) |
| Decodificación especulativa | sí, vía cabeza MTP (`--mtp=auto`) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con arquitectura MoE según la etiqueta del repositorio, pero no se detalla en la información disponible el número de expertos, la proporción de parámetros activos por token, la dimensión oculta ni el número de capas. El paquete en sí no aporta entrenamiento nuevo: es una cuantización post-entrenamiento del modelo de orcarouter, que a su vez deriva del Qwen3.8-Flash-Next oficial. No se especifican el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento en el modelo original.

La innovación técnica destacable de este pack es la integración con decodificación especulativa mediante cabezas MTP (multi-token prediction). El pack incluye su propia cabeza MTP y se han probado dos alternativas: la cabeza optimizada de HermiHg (HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3) y la DotH-MTP de doth4580 (doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16). La cabeza solo afecta a la velocidad, no a la salida generada. Las tasas de aceptación del draft medidas oscilan entre el 65,3 % y el 71,9 % según topología y cabeza.

El motor veloGB10 distribuye los pesos por red en configuraciones tensor-parallel (TP=1, TP=2, TP=4) y cachea localmente la porción de cada nodo, de modo que reinicios posteriores no retransfieren pesos. Soporta RoCE con selección explícita de rail mediante `--rdma-dev`.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto en las pruebas de referencia (sampling de producción con la configuración del pack).
- Generación de código: la tabla de rendimiento incluye un "code turn" específico, lo que indica uso previsto en tareas de programación.
- Generación creativa de narrativa ("story turn" en las pruebas).
- Decodificación especulativa con cabeza MTP propia o sustituible, con tasas de aceptación del 65-72 %.
- Servidor compatible con la API de OpenAI en `http://<head-ip>:9000/v1`, lo que habilita integración con clientes estándar.
- Despliegue multinodo con tensor parallelism sobre 1, 2 o 4 GB10.
- Caché de prefijo para reutilización de contexto en conversaciones multi-turno.
- Variante "uncensored": el alineamiento de seguridad del modelo original ha sido relajado o eliminado por el autor del derivado.
- No se documentan capacidades de visión, audio, tool calling ni function calling en la información disponible.

## Casos de uso

- Inferencia de contexto largo en una sola máquina: con 262.144 tokens de ventana y 3 bpw, un único GB10 puede servir documentos extensos, bases de código completas o historiales de conversación largos sin recurrir a clústeres mayores.
- Servicio de API compatible con OpenAI para equipos internos: el servidor expone `/v1` en el puerto 9000, por lo que se integra directamente con SDKs y herramientas que ya hablan el protocolo OpenAI, sin adaptadores.
- Generación de código asistida en entornos controlados: el "code turn" de las pruebas sugiere uso para autocompletado o generación de funciones; a 115-209 tok/s de decodificación según topología, es viable para asistentes interactivos.
- Escalado horizontal por tensor parallelism: si la latencia de una sola máquina no basta, TP=2 sube la decodificación de 79 a 105 tok/s de mediana y TP=4 a 125 tok/s, con prefill de 3.896 tok/s, útil para cargas con prompts largos.
- Investigación sobre alineamiento y seguridad: al ser una variante sin censura, sirve para estudiar comportamiento de modelos sin filtros, comparar respuestas frente al original y evaluar riesgos de desalineación.
- Prototipado de narrativa y contenido creativo: el "story turn" a 67-116 tok/s permite generar texto largo de forma fluida en una o varias máquinas.
- Pruebas de decodificación especulativa: el pack permite comparar cabezas MTP (propia, HermiHg, DotH-MTP) y medir aceptación y throughput sin cambiar el modelo, útil para investigación en optimización de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos publicados son de rendimiento del motor veloGB10 (2026-11-05, builds 0.7.7, sampling de producción, thinking activado, una ejecución por celda, variación aproximada de ±10 %):

| Topología | Cabeza draft | Decode code turn (tok/s) | Decode story turn (tok/s) | Mediana decode todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones agregado (tok/s) | Aceptación draft |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | MTP del pack | 115 | 67 | 79 | 2.055 | 114 | 65,7 % |
| TP=2 | MTP del pack | 154 | 88 | 105 | 3.382 | 151 | 66,0 % |
| TP=4 | MTP del pack | 180 | 107 | 125 | 3.896 | 182 | 65,3 % |
| TP=1 | HermiHg MTP | 134 | 68 | 81 | 2.033 | 117 | 71,0 % |
| TP=2 | HermiHg MTP | 168 | 95 | 116 | 3.392 | 158 | 71,9 % |
| TP=4 | HermiHg MTP | 205 | 114 | 135 | 3.911 | 200 | 70,1 % |
| TP=1 | DotH-MTP | 136 | 70 | 77 | 2.044 | 117 | 70,2 % |
| TP=2 | DotH-MTP | 168 | 91 | 107 | 3.360 | 155 | 71,0 % |
| TP=4 | DotH-MTP | 209 | 116 | 131 | 3.976 | 185 | 70,0 % |

La cabeza HermiHg ofrece la mejor mediana global en TP=2 y TP=4 (116 y 135 tok/s), mientras que DotH-MTP maximiza el code turn en TP=4 (209 tok/s). El prefill escala de 2.055 a 3.976 tok/s entre TP=1 y TP=4.

## Requisitos de hardware

- Hardware de referencia: NVIDIA DGX Spark / GB10 (denominado veloGB10 en el repo). No se documentan requisitos para otras GPU.
- VRAM estimada: no disponible de forma explícita; a 3 bpw el pack está diseñado para caber en una sola GB10 (TP=1), lo que implica que el modelo completo en cuantización EXL3 3 bpw ocupa menos que la memoria unificada de una GB10.
- Configuraciones soportadas: 1, 2 o 4 máquinas GB10 con tensor parallelism (TP=1, TP=2, TP=4).
- Memoria de contexto: la configuración probada reserva hasta 262.144 tokens de secuencia y 65.536 tokens de salida, con batch de 2 peticiones.
- Red: RoCE entre nodos; en máquinas con dos pares de puertos activos se selecciona el rail con `--rdma-dev <rail1>,<rail2>`.
- Motor de despliegue: veloGB10 (`gb10_inference`), binario autocontenido con servidor compatible con OpenAI. Al ser formato EXL3 estándar, "cualquier framework que lea el formato" puede usarlo, pero no se detallan alternativas probadas (vLLM, llama.cpp, Ollama, TGI) en la información disponible.
- Throughput y latencia: ver tabla de benchmarks; la decodificación va de 67 a 209 tok/s según topología, cabeza y tipo de turno; el prefill de 2.033 a 3.976 tok/s.
- Caché de pesos por nodo: los nodos no necesitan copia del modelo; el head envía cada porción por red y la cachea localmente, de modo que reinicios posteriores no retransfieren.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede establecer la relación con el modelo del que deriva, pero no una comparativa de rendimiento:

| Modelo | Relación | Cuantización | Contexto | Licencia |
|---|---|---|---|---|
| Qwen/Qwen3.8-Flash-Next | Original oficial del equipo Qwen | BF16 (presumible, no confirmado) | no disponible | Qwen Community License 1.0 |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | Derivado sin censura | no disponible | no disponible | no disponible |
| Lygodactylus/Qwen3.8-Flash-Next-Uncensored-exl3-3bpw | Pack EXL3 3 bpw original | EXL3 3 bpw | no disponible | no disponible |
| doth4580/Lygodactylus-FlashNext-Uncensored-3bpw | Espejo byte a byte del anterior | EXL3 3 bpw | 262.144 tokens (config. probada) | Qwen Community License 1.0 |

No se conocen alternativas de distinto autor con las que comparar parámetros, rendimiento o contexto en la información disponible.

## Limitaciones y advertencias

- Modelo "uncensored": el alineamiento de seguridad ha sido relajado o eliminado; puede producir contenido que el modelo original rechazaría. No apto para aplicaciones de cara al público sin filtros adicionales.
- Licencia Qwen Community License 1.0: no es una licencia permisiva estándar; hay que revisar sus términos (incluido el enlace a la licencia del modelo original) antes de uso comercial. El repositorio declara licencia "other" con nombre `qwen-community-1.0`.
- Es una cuantización a 3 bpw: la pérdida de calidad frente al modelo en precisión completa no está cuantificada en la información disponible; conviene evaluar la degradación en la tarea concreta.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, GSM8K) para este pack ni para el modelo base en la documentación proporcionada; el rendimiento medido es solo de velocidad.
- No se documentan idiomas soportados; no se puede asumir un rendimiento multilingüe concreto.
- El pack está pensado y probado para veloGB10 sobre GB10; el soporte en otros motores (vLLM, llama.cpp, Ollama, TGI) no está verificado, aunque el formato EXL3 sea estándar.
- Las cifras de rendimiento son de una sola ejecución por celda, con variación de ±10 % y builds de desarrollo (0.7.7); no son garantías de producción.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos de lenguaje y, sin alineamiento de seguridad, puede ser más difícil de mitigar.
- El repositorio no añade nada propio: es un espejo; los derechos y responsabilidades recaen en los autores originales y en los contribuidores de la cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Lygodactylus-FlashNext-Uncensored-3bpw
- Modelo base (derivado sin censura): https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Modelo original oficial: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Pack EXL3 original de Lygodactylus: https://huggingface.co/Lygodactylus/Qwen3.8-Flash-Next-Uncensored-exl3-3bpw
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- Herramienta de cuantización exllamav3: https://github.com/turboderp-org/exllamav3
- Cabeza MTP optimizada de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Cabeza DotH-MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
