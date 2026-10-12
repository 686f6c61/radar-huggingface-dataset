# bcckfdn/cevher2-test-3-GGUF

## Resumen
cevher2-test-3-GGUF es la version cuantizada en formato GGUF del modelo bcckfdn/cevher2-test-3, publicado por el desarrollador individual bcckfdn. Se trata de un modelo de generacion de texto entrenado desde cero con la arquitectura SmolLM2 (familia Llama), orientado principalmente al turco y con soporte de ingles. La model card lo denomina "cevher-406m-v16_2" y declara un entrenamiento de 1,180 billones de tokens (1,18 B), con una dimension oculta de 1792 y 34 capas.

Existe una discrepancia notable entre el nombre del modelo (406m), los metadatos de safetensors (1.513.546.496 parametros, es decir, unos 1,5 B) y los tamanos de los ficheros GGUF publicados (BF16 de 2889 MB, Q8_0 de 1536 MB), que son coherentes con un modelo de aproximadamente 1,5 B de parametros y no con uno de 406 M. Conviene tratarlo con cautela al evaluarlo.

Se distribuye bajo licencia Apache-2.0, lo que permite uso comercial, y esta pensado para ejecutarse en llama.cpp, Ollama y LM Studio. Al ser un modelo de prueba con cero descargas y cero me gusta en el momento de redactar esta ficha, no existen resultados de benchmarks publicados ni validacion externa.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (arquitectura SmolLM2) |
| Parametros totales | 1.513.546.496 (~1,5 B) segun safetensors; la model card lo denomina "cevher-406m-v16_2" |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Turco (tr), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura transformer decoder-only de tipo Llama, siguiendo el diseno de SmolLM2. La model card indica que fue entrenado desde cero (no es un ajuste fino de SmolLM2), con una dimension oculta (hidden size) de 1792 y 34 capas. El volumen de entrenamiento declarado es de 1,180 B de tokens.

No se ha publicado informacion sobre la composicion del dataset de entrenamiento, la mezcla de idiomas, la longitud de contexto nativa ni si se aplicaron tecnicas de alineacion como RLHF, DPO o decodificacion especulativa. Tampoco se especifica la configuracion de atencion (numero de cabezas, uso de GQA, etc.). La unica innovacion o dato tecnico adicional disponible son los valores de hidden size y numero de capas ya citados.

## Capacidades
- Generacion de texto autoregresiva y conversacion (pipeline text-generation, etiqueta conversational).
- Soporte nativo declarado de turco e ingles.
- Compatible con HF Inference Endpoints (etiqueta endpoints_compatible).
- No hay evidencia publicada de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de vision, audio ni modalidades adicionales.
- No se documenta un modo de razonamiento explicito (thinking mode) ni multi-step reasoning verificado.
- El soporte multilingue mas alla de turco e ingles no esta confirmado.

## Casos de uso
- Asistente conversacional en turco: al estar entrenado desde cero con foco en turco, puede emplearse como chatbot de dominio general en aplicaciones dirigidas al mercado turco, ejecutandose localmente gracias a su tamano reducido.
- Generacion y resumen de texto en turco: util para resumir documentos, redactar correos o generar borradores de contenido en turco en pipelines internos.
- Prototipado local en hardware de consumo: con la cuantizacion Q4_K_M (893 MB) puede ejecutarse en un portatil sin GPU dedicada, lo que lo hace adecuado para demos y pruebas de concepto rapidas.
- Asistente embebido en el borde (edge): su tamano permite desplegarlo en dispositivos con recursos limitados, como mini-PC o moviles, usando llama.cpp u Ollama.
- Base para ajuste fino en turco: al distribuirse bajo Apache-2.0, puede servir como punto de partida para fine-tuning en dominios especificos (legal, sanitario, atencion al cliente) sin restricciones de licencia comercial.
- Traduccion asistida turco-ingles: aunque no esta confirmado como tarea entrenada, el soporte bilingue declarado permite usarlo como apoyo en traduccion de borradores entre ambos idiomas, siempre con revision humana.
- Generacion de contenido educativo bilingue: para material didactico o ejercicios en turco e ingles en entornos con presupuesto de computo limitado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada segun cuantizacion: Q4_K_M ~0,9 GB, Q5_K_M ~1,0 GB, Q8_0 ~1,5 GB, BF16 ~2,9 GB (sin contar la cache KV, que depende del contexto).
- GPU recomendadas: practicamente cualquier GPU moderna es suficiente; una RTX 3060, RTX 4090 o incluso GPU integradas pueden ejecutarlo. No requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo: si, en cualquier GPU con 2 GB o mas de VRAM en cuantizaciones Q4/Q5.
- Tambien puede ejecutarse integramente en CPU con llama.cpp, dada su baja huella de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; tambien es compatible con HF Inference Endpoints.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares
Los datos de los modelos comparativos provienen de su documentacion publica y no se han verificado en la busqueda asociada a este modelo; se ofrecen solo como referencia orientativa.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formato |
|---|---|---|---|---|---|
| cevher2-test-3 (este) | ~1,5 B (segun safetensors) | No disponible | Apache-2.0 | tr, en | GGUF, safetensors |
| SmolLM2-1.7B | 1,7 B | 8192 tokens (segun documentacion publica) | Apache-2.0 | en y otros | safetensors, GGUF |
| Qwen2.5-1.5B | 1,5 B | 32768 tokens (segun documentacion publica) | Apache-2.0 | multilingue | safetensors, GGUF |
| Llama-3.2-1B | 1,2 B | 128000 tokens (segun documentacion publica) | Llama 3.2 Community License | multilingue | safetensors, GGUF |

No hay datos de rendimiento comparativo disponibles para cevher2-test-3, por lo que la comparacion con estos modelos se limita a parametros, contexto y licencia.

## Limitaciones y advertencias
- Modelo de prueba sin validacion externa: cero descargas y cero me gusta en el momento de redactar la ficha, sin benchmarks publicados.
- Discrepancia de nomenclatura: la model card lo llama "406m" mientras que safetensors y los tamanos GGUF apuntan a ~1,5 B de parametros; verificar antes de usarlo en produccion.
- Longitud de contexto desconocida, lo que impide garantizar el comportamiento en conversaciones largas o documentos extensos.
- Riesgo de alucinacion propio de los modelos de lenguaje de este tamano; requiere supervision humana en tareas criticas.
- Cobertura idiomatica limitada a turco e ingles declarados; el rendimiento en otros idiomas no esta confirmado.
- No hay evidencia de soporte de tool calling, agentes o razonamiento multi-paso, por lo que no deberia asumirse su uso en pipelines agenticos sin pruebas previas.
- Sesgos: no se documenta ningun analisis de sesgos ni de seguridad, por lo que se desconoce el comportamiento en temas sensibles.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero no exime de responsabilidad sobre el contenido generado.
- La model card esta redactada en turco y no detalla la composicion del dataset, lo que dificulta auditar el origen de los datos de entrenamiento.

## Enlaces
- Repositorio GGUF: https://huggingface.co/bcckfdn/cevher2-test-3-GGUF
- Modelo base: https://huggingface.co/bcckfdn/cevher2-test-3
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
