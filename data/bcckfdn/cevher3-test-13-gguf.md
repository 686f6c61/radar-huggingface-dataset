# bcckfdn/cevher3-test-13-GGUF

## Resumen

cevher3-test-13-GGUF es la distribucion en formato GGUF del modelo cevher3-test-13, un modelo de lenguaje de tipo base entrenado por el usuario bcckfdn y orientado principalmente al turco (con soporte secundario de ingles). El modelo emplea una arquitectura derivada de Gemma 3 con atencion de ventana deslizante (SWA), cuenta con 1.256.312.832 parametros totales y una configuracion interna de 1792 dimensiones ocultas repartidas en 34 capas. Su entrenamiento declara 26.051 millones de tokens, un volumen modesto para el tamano del modelo.

La relevancia de esta publicacion es practica: el autor ofrece cuatro cuantizaciones listas para usar (BF16, Q8_0, Q5_K_M y Q4_K_M) compatibles con llama.cpp, Ollama y LM Studio, lo que permite desplegar el modelo en hardware de consumo. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales, aunque al tratarse de un modelo base sin ajuste instructivo declarado, su comportamiento conversacional depende del prompting.

Se trata de un modelo muy reciente (publicado en noviembre de 2026) con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion de entrenamiento detallada mas alla de los datos de arquitectura y del listado de ficheros GGUF. Debe evaluarse, por tanto, como un artefacto experimental de un autor individual mas que como un modelo de produccion validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Gemma 3 con atencion de ventana deslizante (SWA); 34 capas, hidden size 1792 |
| Parametros totales | 1.256.312.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q5_K_M, Q4_K_M (ficheros GGUF publicados) |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye aparte |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer derivada de Gemma 3, con atencion de ventana deslizante (sliding window attention), 34 capas y una dimension oculta de 1792. Esta combinacion de profundidad relativamente alta con un hidden size moderado da lugar a los aproximadamente 1.256 millones de parametros reportados en los safetensors del modelo base. La SWA reduce el coste computacional en secuencias largas al limitar el alcance de la atencion en determinadas capas, un patron habitual en la familia Gemma 3.

El autor declara un volumen de entrenamiento de 26.051 millones de tokens, sin detallar la composicion del dataset, el uso de RLHF/DPO ni tecnicas de alineacion. No se documenta si hubo fases de ajuste supervisado o preferencia, ni innovaciones adicionales como decodificacion especulativa. La model card se limita a indicar la arquitectura, el numero de tokens y los ficheros GGUF disponibles, por lo que la mayor parte del proceso de entrenamiento queda sin trazabilidad publica.

## Capacidades

- Generacion de texto autoregresiva en turco e ingles, idiomas declarados en los metadatos del modelo.
- Modelo base sin ajuste instructivo documentado: no se garantiza el seguimiento fiable de instrucciones ni el formato conversacional, aunque la model card incluye un ejemplo con `-cnv` en llama-cli.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues limitadas a los dos idiomas declarados (tr, en); no se documentan otros.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Compatibilidad con el ecosistema llama.cpp, Ollama y LM Studio gracias a los ficheros GGUF publicados.

## Casos de uso

- Generacion de texto en turco: el modelo puede emplearse para redactar borradores, resumenes o parafrasis en turco, su idioma principal declarado, con la ventaja de que las cuantizaciones Q4_K_M (744 MB) y Q5_K_M (862 MB) caben en practicamente cualquier GPU de consumo.
- Experimentacion e investigacion: adecuado como banco de pruebas para estudiar el comportamiento de arquitecturas tipo Gemma 3 con SWA a escala de 1.250 millones de parametros, sin necesidad de infraestructura dedicada.
- Prototipado local con Ollama o LM Studio: el flujo documentado (`ollama create` + `ollama run`) permite levantar un endpoint de generacion en minutos en un portatil, util para demos internas y pruebas de concepto.
- Fine-tuning posterior: al ser un modelo base con licencia Apache 2.0, puede servir como punto de partida para ajuste supervisado en tareas especificas del turco (clasificacion, extraccion, generacion de resumenes) sin restricciones de licencia comercial.
- Generacion de texto en ingles como idioma secundario: util para tareas de continuacion de texto o generacion libre, aunque sin garantias de calidad equiparable al turco.
- Evaluacion comparativa de cuantizaciones: los cuatro ficheros publicados (BF16, Q8_0, Q5_K_M, Q4_K_M) permiten medir la degradacion de perplejidad y calidad entre niveles de cuantizacion en un modelo de este tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye pesos y overhead de contexto reducido):
  - BF16: aproximadamente 2,4 GB de pesos; en la practica 3-4 GB de VRAM.
  - Q8_0: aproximadamente 1,3 GB de pesos; en la practica 2-3 GB de VRAM.
  - Q5_K_M: aproximadamente 0,9 GB de pesos; en la practica 1,5-2,5 GB de VRAM.
  - Q4_K_M: aproximadamente 0,75 GB de pesos; en la practica 1,5-2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para las cuantizaciones Q4_K_M y Q5_K_M; una RTX 3060, RTX 4060, RTX 4090 o superior permiten ejecutar incluso BF16 con holgura. En entornos de servidor, A100 o H100 no son necesarias para este tamano, pero funcionarian sin problema.
- Cabe en GPU consumer: si, en todas las cuantizaciones publicadas; Q4_K_M y Q5_K_M caben incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio. vLLM y TGI requeririan conversion a safetensors y no estan documentados para este artefacto.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| cevher3-test-13-GGUF | 1.256 M | no disponible | Apache 2.0 | GGUF | Base, turco/ingles, SWA tipo Gemma 3 |
| Gemma 3 1B (Google) | ~1.000 M | no disponible en la informacion | Gemma Terms | safetensors, GGUF | Referencia arquitectonica directa; ecosistema y documentacion amplios |
| Llama 3.2 1B (Meta) | ~1.240 M | 128K (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors, GGUF | Alternativa generalista con ajuste instructivo oficial |
| Qwen2.5 1.5B (Alibaba) | ~1.540 M | 32K (segun documentacion publica de Alibaba) | Apache 2.0 | safetensors, GGUF | Alternativa Apache 2.0 con soporte multilingue amplio |

La comparativa se limita a datos publicos de los modelos alternativos; no existen benchmarks del modelo evaluado que permitan una comparacion de rendimiento directa.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo documentado: puede producir continuaciones incoherentes o ignorar instrucciones si se usa como asistente conversacional.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, lo que impide recomendarlo para produccion sin una evaluacion propia.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un corpus no descrito, los sesgos linguisticos y culturales son desconocidos.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano y agravado por la falta de ajuste por preferencias.
- Limitaciones de contexto e idioma: la longitud de contexto no se declara; el soporte se limita a turco e ingles, sin garantias en otros idiomas.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantias ni soporte.
- Madurez: cero descargas y cero likes en el momento de la consulta; se trata de un artefacto experimental de un autor individual sin validacion de la comunidad.
- El repositorio GGUF (5,5 GB) incluye las cuatro cuantizaciones; conviene descargar solo el fichero necesario para evitar consumo innecesario de disco y ancho de banda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bcckfdn/cevher3-test-13-GGUF
- Modelo base: https://huggingface.co/bcckfdn/cevher3-test-13
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
