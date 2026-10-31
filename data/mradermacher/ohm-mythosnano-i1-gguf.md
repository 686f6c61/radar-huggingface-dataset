# mradermacher/Ohm-MythosNano-i1-GGUF

## Resumen

Ohm-MythosNano-i1-GGUF es un repositorio de cuantizaciones GGUF con imatrix (matriz de importancia) del modelo orangejuicesmith/Ohm-MythosNano, publicado por mradermacher, un cuantizador muy activo de la comunidad de Hugging Face. El modelo base es un LLM conversacional de unos 3.086 millones de parámetros basado en la arquitectura Qwen2, etiquetado para razonamiento, matemáticas y código, y se distribuye bajo licencia MIT, lo que permite su uso comercial sin restricciones relevantes.

La relevancia de esta ficha no está tanto en el modelo base en sí, sino en el trabajo de cuantización: mradermacher ofrece 22 variantes que van desde IQ1_S (0,9 GB) hasta Q6_K (2,6 GB), lo que permite ejecutar el modelo en hardware muy modesto, incluyendo portátiles sin GPU dedicada. El uso de imatrix (importance matrix) mejora la calidad de las cuantizaciones bajas respecto a las cuantizaciones estáticas convencionales, algo especialmente importante en modelos pequeños, donde cada bit de precisión pesa más en el resultado final.

Es un modelo idóneo para desarrolladores que buscan un LLM ligero con capacidades de razonamiento y código para ejecución local, ya sea mediante llama.cpp, Ollama o LM Studio, sin depender de APIs externas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder denso) |
| Parámetros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado; el modelo base está en safetensors) |

## Arquitectura y entrenamiento

El modelo base, Ohm-MythosNano, emplea la arquitectura Qwen2, un transformer decoder denso estándar con las mejoras habituales de la familia Qwen de Alibaba (RoPE, SwiGLU, RMSNorm y QK attention con bias). Al tratarse de un modelo de ~3 B de parámetros, es un modelo denso, no MoE, con todos los parámetros activos en cada pasada.

Sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) no se ha publicado información en la model card disponible. Lo que sí está documentado es el proceso de cuantización: mradermacher genera cuantizaciones ponderadas con imatrix (matriz de importancia calculada sobre un corpus de calibración), lo que mejora la fidelidad de las cuantizaciones agresivas (IQ1-IQ3) frente a las cuantizaciones estáticas. Las versiones estáticas sin imatrix están disponibles en un repositorio hermano.

## Capacidades

- Generación de texto conversacional (etiquetado como "conversational").
- Razonamiento (tag "reasoning"), orientado a tareas de chain-of-thought o resolución paso a paso.
- Matemáticas (tag "math"): resolución de problemas aritméticos y de razonamiento cuantitativo.
- Generación y comprensión de código (tag "code").
- No hay evidencia en la información disponible de soporte de vision, audio ni de otros modalidades.
- No consta soporte oficial de tool calling ni function calling en la información proporcionada.
- Capacidades multilingües: la model card declara únicamente inglés; el rendimiento en castellano no está documentado.

## Casos de uso

- Asistente local en hardware modesto: con la variante Q4_K_M (2,0 GB) el modelo cabe en la RAM de prácticamente cualquier portátil moderno, útil para chatbots personales sin GPU.
- Prototipado de agentes de razonamiento ligeros: su etiqueta de reasoning y su tamaño reducido lo hacen adecuado para experimentar con cadenas de razonamiento en dispositivos edge o en lotes de CPU.
- Generación de código offline: puede integrarse en editores locales (por ejemplo vía Ollama o llama.cpp server) para autocompletado y explicación de código sin enviar código propietario a la nube.
- Resolución de problemas matemáticos en entornos aislados (air-gapped): útil en sistemas sin conexión donde se necesite razonamiento aritmético básico con un modelo pequeño.
- Despliegue masivo de bajo coste: al pesar ~2 GB en Q4_K_M, es viable servirlo en CPU en servidores pequeños, reduciendo el coste por instancia en aplicaciones de alto volumen.
- Cuantizaciones extremas para microdispositivos: las variantes IQ1_S/IQ1_M (0,9-1,0 GB) permiten experimentos en SBC (Raspberry Pi 5, dispositivos Android) aunque con pérdida de calidad notable.
- Fichas y bots de rol/conversación creativa: los modelos "nano" de la comunidad suelen usarse en frontends como SillyTavern para chat de personajes en equipos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco hay datos de evaluación del modelo base Ohm-MythosNano en la model card proporcionada.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~1,0 GB (IQ1_S) hasta ~2,7 GB (Q6_K) solo de pesos; se recomienda añadir margen para el KV cache según la longitud de contexto utilizada. En Q4_K_M (2,0 GB) es cómodo en cualquier equipo con 8 GB de RAM.
- GPU recomendadas: no son necesarias; el modelo es pequeño. Si se desea aceleración, cualquier GPU con 4 GB de VRAM (por ejemplo RTX 3050, RTX 3060 o superior) ejecuta la variante Q6_K sin problema.
- Consumer GPUs: cabe holgadamente en GPUs de gama baja y media; también funciona bien solo con CPU gracias a su tamaño.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp, GPT4All y cualquier runtime compatible con GGUF. Al ser cuantizaciones GGUF, no es directamente desplegable en vLLM o TGI sin conversión previa al modelo base en safetensors.
- Latencia y throughput: no disponibles; por su tamaño (~3 B) y cuantización de 4 bits, se esperan velocidades de decodificación altas incluso en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Ohm-MythosNano (base) | ~3,09 B | no disponible | MIT | safetensors |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Qwen Research (uso comercial condicionado) | safetensors, GGUF (comunidad) |
| Llama 3.2 3B Instruct | 3,21 B | 131.072 tokens | Llama 3.2 Community License | safetensors, GGUF (comunidad) |
| Phi-3.5-mini-instruct | 3,82 B | 131.072 tokens | MIT | safetensors, GGUF (comunidad) |

Ohm-MythosNano compite en la franja de ~3 B con modelos mucho más documentados como Qwen2.5-3B, Llama 3.2 3B y Phi-3.5-mini. Su ventaja es la licencia MIT (más permisiva que Llama o Qwen) y la disponibilidad inmediata de 22 cuantizaciones imatrix; su desventaja es la ausencia de benchmarks publicados y de documentación sobre entrenamiento y contexto.

## Limitaciones y advertencias

- Calidad de las cuantizaciones bajas: las variantes IQ1_S, IQ1_M e IQ2_XXS degradan notablemente el modelo; el propio autor las marca como "for the desperate" y "mostly desperate". Para uso serio, se recomienda Q4_K_S o superior.
- Idioma: la model card declara solo inglés; el rendimiento en castellano no está verificado y puede ser pobre.
- Sesgos: no documentados; como todo LLM entrenado con datos web, puede reproducir sesgos presentes en su corpus de entrenamiento, pero no hay análisis publicado.
- Alucinaciones: riesgo no cuantificado; sin benchmarks publicados, conviene validar las salidas, especialmente en matemáticas y código, antes de usarlas en producción.
- Contexto: la longitud de ventana no está documentada; verificar los metadatos del GGUF antes de diseñar aplicaciones con documentos largos.
- Licencia: MIT, sin restricciones comerciales relevantes; no obstante, conviene revisar también la procedencia del modelo base y sus datos de entrenamiento, que no están documentados.
- Procedencia poco conocida: el modelo base proviene de un autor comunitario sin documentación técnica detallada, lo que añade incertidumbre frente a alternativas de grandes laboratorios.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/mradermacher/Ohm-MythosNano-i1-GGUF
- Modelo base: https://huggingface.co/orangejuicesmith/Ohm-MythosNano
- Cuantizaciones estáticas (sin imatrix): https://huggingface.co/mradermacher/Ohm-MythosNano-GGUF
- Página de descarga resumida: https://hf.tst.eu/model#Ohm-MythosNano-i1-GGUF
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
