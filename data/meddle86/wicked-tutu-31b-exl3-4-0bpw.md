# meddle86/Wicked-Tutu-31B-exl3-4.0bpw

## Resumen

Wicked-Tutu-31B-exl3-4.0bpw es una cuantizacion de 4 bits en formato EXL3 del modelo ReadyArt/gemma-4-31B-it-scotoma-2, un fine-tune de la familia Gemma 4 orientado a roleplay explicito, contenido NSFW y narrativa de terror y violencia. Lo publica el usuario meddle86 en Hugging Face y su proposito es ofrecer una version comprimida que pueda ejecutarse con requisitos de VRAM mas contenidos que el modelo original en precision completa.

El modelo hereda la arquitectura de Gemma 4 (transformer denso) y se distribuye unicamente en ingles. A pesar de la etiqueta "31B" en el nombre, los pesos safetensors reales del repositorio suman 9.677.975.788 parametros, lo que sugiere que la nomenclatura del autor no coincide con el conteo efectivo de parametros del checkpoint publicado. El repositorio ocupa 19,4 GB.

Su relevancia es acotada y muy especifica: cubre un nicho de generacion conversacional sin alineacion (unaligned) para experiencias de rol adulto, con licencia Apache 2.0 sobre el artefacto de cuantizacion. No es un modelo apto para uso general, produccion comercial convencional ni aplicaciones orientadas a usuarios sin filtros adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 4), segun tags del modelo base |
| Parametros totales | 9.677.975.788 (segun safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 4.0 bpw (4 bits) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (cuantizacion EXL3) |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion EXL3 a 4.0 bits por peso de ReadyArt/gemma-4-31B-it-scotoma-2, que a su vez es un fine-tune de un modelo Gemma 4 instruction-tuned. La model card no documenta la arquitectura interna mas alla de la herencia de Gemma 4, ni detalla el proceso de entrenamiento del fine-tune base (composicion del dataset, numero de tokens, uso de RLHF/DPO o tecnicas de alineacion). Los tags indican explicitamente "unaligned", lo que sugiere que el fine-tune elimina o reduce los mecanismos de rechazo y moderacion del modelo original.

La innovacion tecnica del artefacto es la propia cuantizacion EXL3: un esquema de compresion a 4 bits orientado a reducir el peso en disco y en VRAM manteniendo la fidelidad del fine-tune. No hay informacion publicada sobre la perdida de calidad introducida por esta cuantizacion respecto al modelo en BF16.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Roleplay y narrativa de ficcion adulta (ERP, erotico).
- Contenido explicito y sin filtros de alineacion ("unaligned").
- Narrativa de terror y violencia segun los tags del autor.
- No hay evidencia documentada de soporte de tool calling ni function calling.
- No hay evidencia documentada de modo thinking, vision, audio ni agentes multi-paso.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Roleplay conversacional adulto: el modelo esta afinado especificamente para mantener personajes y escenas multi-turno en contextos de ficcion erotica, con un tono y estilo consistentes gracias al fine-tune sobre Gemma 4 instruction-tuned.
- Narrativa de terror y ficcion violenta: los tags "Horror" y "Violence" indican que el ajuste cubre descripciones explicitas de violencia, util para escritura creativa de genero dentro de entornos controlados.
- Prototipado de motores de rol para videojuegos para adultos: puede integrarse como backend de generacion de dialogos en proyectos de nicho donde se requiere contenido sin censura y el equipo asume la responsabilidad legal del despliegue.
- Investigacion sobre modelos sin alineacion: util para estudiar el comportamiento de modelos "unaligned" y comparar respuestas frente a sus versiones alineadas en tareas de evaluacion de seguridad.
- Generacion de ficcion serializada: su naturaleza conversacional permite encadenar capitulos manteniendo coherencia de personajes dentro de la ventana de contexto disponible (no documentada).
- Despliegue local en hardware de consumo: al estar cuantizado a 4.0 bpw, el checkpoint de 19,4 GB puede cargarse en GPUs consumer de gama alta, lo que facilita experimentacion privada sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 19,4 GB en EXL3 4.0 bpw; se necesita al menos esa cantidad de VRAM para cargar los pesos, mas overhead de contexto y KV cache.
- GPU recomendadas: A100 40GB, H100, L40S o RTX 4090 (24 GB) para carga completa con margen limitado.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) y previsiblemente en RTX 3090 (24 GB); en GPUs de 16 GB requeriria reducir contexto o aplicar tecnicas de offloading.
- Opciones de despliegue: el formato EXL3 requiere el runtime de ExLlamaV3; no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI sin conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wicked-Tutu-31B-exl3-4.0bpw | 9.677.975.788 | no disponible | apache-2.0 | safetensors EXL3 4 bpw | Fine-tune NSFW/roleplay cuantizado |
| ReadyArt/gemma-4-31B-it-scotoma-2 | no disponible | no disponible | no disponible | no disponible | Modelo base del fine-tune |
| Gemma 4 31B IT (original) | no disponible | no disponible | no disponible | no disponible | Version alineada de referencia |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- Contenido explicito, NSFW, violento y de terror: no apto para menores ni para entornos sin control de acceso.
- Modelo "unaligned": carece de mecanismos de rechazo, por lo que puede generar contenido danino sin filtros adicionales.
- Riesgo elevado de alucinacion y de deriva narrativa en conversaciones largas, agravado por la falta de datos sobre la longitud de contexto.
- Solo soporta ingles; el rendimiento en castellano no esta garantizado ni documentado.
- La licencia Apache 2.0 se aplica al artefacto de cuantizacion, pero el uso comercial del contenido generado y la cadena de modelos base debe verificarse con las licencias de Gemma 4 y del fine-tune intermedio.
- La cuantizacion EXL3 a 4.0 bpw puede degradar la calidad respecto al modelo en BF16; no hay evaluacion publicada de esa perdida.
- La discrepancia entre el nombre "31B" y los 9.677.975.788 parametros reales del checkpoint exige verificar el modelo antes de planificar el despliegue.
- Requiere runtime ExLlamaV3, lo que limita la portabilidad frente a formatos GGUF o safetensors estandar.
- Descargas muy bajas (128) y sin likes: ecosistema de validacion practicamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/meddle86/Wicked-Tutu-31B-exl3-4.0bpw
- Modelo base: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2
