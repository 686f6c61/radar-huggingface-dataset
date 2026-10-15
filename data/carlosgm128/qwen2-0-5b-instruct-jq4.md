# carlosgm128/Qwen2-0.5B-Instruct-JQ4

## Resumen

Qwen2-0.5B-Instruct-JQ4 es una version cuantizada del modelo Qwen/Qwen2-0.5B-Instruct publicada por el usuario carlosgm128. Se trata de un checkpoint derivado, no de un entrenamiento nuevo: el autor ha tomado el modelo instructivo de 0,5 mil millones de parametros de la familia Qwen2 y lo ha comprimido para su uso con Jlama, un motor de inferencia escrito en Java. La cuantizacion reduce el peso del repositorio a unos 0,3 GB y acelera la inferencia, manteniendo, segun el autor, una precision alta para despliegues en produccion.

El modelo hereda la arquitectura Transformer decoder de Qwen2, con activacion SwiGLU, sesgo en las proyecciones QKV, atencion de consultas agrupadas (group query attention) y un tokenizador mejorado adaptado a multiples idiomas y lenguajes de programacion. Al ser la variante instructiva, ha pasado por ajuste supervisado (SFT) y optimizacion por preferencias directas (DPO) sobre el modelo base. Su tamano lo situa en la gama de modelos ultraligeros, pensados para ejecucion en CPU, dispositivos embebidos o entornos con recursos muy limitados.

La relevancia de esta ficha radica en su proposito especifico: no compite con modelos grandes, sino que ofrece un punto de entrada economico para experimentar con generacion de texto conversacional dentro del ecosistema Java, donde las alternativas de inferencia local son escasas. El numero de parametros reales declarado en los archivos safetensors es de 509.469.056.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2) con SwiGLU, sesgo QKV y group query attention |
| Parametros totales | 509.469.056 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la familia Qwen2 declara 32.768 tokens) |
| Tipos de cuantizacion | JQ4 (cuantizacion de 4 bits para Jlama) |
| Idiomas soportados | en (segun la model card); tokenizador adaptado a multiples idiomas y codigo |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (variante cuantizada para Jlama) |

## Arquitectura y entrenamiento

El modelo base Qwen2-0.5B-Instruct emplea una arquitectura Transformer decoder con activacion SwiGLU, sesgo en las proyecciones de query, key y value, y atencion de consultas agrupadas (group query attention), que reduce el coste de memoria de la cache KV. El tokenizador fue rediseñado para adaptarse a multiples lenguajes naturales y a codigo. Segun la documentacion de Qwen2 recogida en la model card, los modelos se preentrenaron con un volumen elevado de datos y despues se postentrenaron combinando ajuste supervisado (SFT) y optimizacion por preferencias directas (DPO). No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion del dataset.

Por lo que respecta a esta ficha concreta, no se trata de un reentrenamiento, sino de una conversion cuantizada. El autor aplica el esquema JQ4 de Jlama sobre el modelo instructivo, sin detallar el procedimiento exacto ni las metricas de degradacion respecto al checkpoint original. La innovacion tecnica reseñable se limita, por tanto, al propio formato de cuantizacion orientado a un motor de inferencia Java, no a cambios en la arquitectura subyacente.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat basado en roles (system, user, assistant).
- Razonamiento basico y tareas de comprension del lenguaje de baja complejidad.
- Generacion de codigo sencillo y completado de fragmentos cortos.
- Resolucion de problemas aritmeticos simples; la model card reporta un 40,1 en GSM8K para el modelo sin cuantizar.
- Seguimiento de instrucciones a nivel basico, con un 20,0 de precision estricta en IFEval segun la tabla de evaluacion del modelo original.
- Capacidad multilingue limitada: la etiqueta del repositorio declara unicamente ingles, aunque el tokenizador de Qwen2 esta preparado para varios idiomas.
- Soporte de plantilla de chat mediante apply_chat_template en transformers.

No se documenta en la informacion disponible soporte de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistentes conversacionales ligeros en aplicaciones Java: el modelo puede integrarse mediante Jlama en servicios Spring Boot para ofrecer respuestas de chat sin depender de APIs externas ni de GPU.
- Clasificacion y etiquetado de texto en tiempo real: con 509 millones de parametros y pesos de 4 bits, es viable procesar grandes volumenes de mensajes cortos en CPU con latencia baja.
- Generacion de texto de relleno o borradores: util para producir resumenes breves, respuestas predefinidas o variaciones de plantillas en herramientas internas.
- Educacion y prototipado: sirve como banco de pruebas para experimentar con cuantizacion y motores de inferencia alternativos sin incurrir en costes de infraestructura.
- Filtrado previo en pipelines de datos: puede actuar como primera capa de deteccion de contenido irrelevante antes de pasar a un modelo mayor.
- Automatizacion de respuestas en bots de soporte de baja complejidad, donde el coste por inferencia es el factor critico y no se requiere razonamiento profundo.
- Pruebas de integracion en entornos de CI: al ser un artefacto pequeno (0,3 GB), se puede descargar y ejecutar en runners sin GPU para validar flujos de inferencia de extremo a extremo.

## Benchmarks y rendimiento

La model card recoge resultados del modelo base sin cuantizar (Qwen2-0.5B-Instruct) frente a generaciones anteriores y a modelos mayores de la misma familia. No se aportan metricas especificas de la version JQ4.

| Benchmark | Qwen1.5-0.5B-Chat | Qwen2-0.5B-Instruct | Qwen1.5-1.8B-Chat | Qwen2-1.5B-Instruct |
|---|---|---|---|---|
| MMLU | 35,0 | 37,9 | 43,7 | 52,4 |
| HumanEval | 9,1 | 17,1 | 25,0 | 37,8 |
| GSM8K | 11,3 | 40,1 | 35,3 | 61,6 |
| C-Eval | 37,2 | 45,2 | 55,3 | 63,8 |
| IFEval (Prompt Strict-Acc.) | 14,6 | 20,0 | 16,8 | 29,0 |

No se han publicado resultados de benchmarks especificos de la version cuantizada JQ4 en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB en FP16 para el modelo sin cuantizar; alrededor de 0,5 GB en int8; en torno a 0,3 GB con JQ4, segun el tamano del repositorio.
- GPU recomendadas: cualquier GPU con mas de 1 GB de memoria, como GTX 1650, RTX 3050 o superiores; tambien funciona en A100 o H100, aunque es sobredimensionado para este modelo.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en graficas integradas con memoria compartida.
- Ejecucion en CPU: el objetivo principal del modelo es Jlama, motor Java que permite inferencia en CPU y en dispositivos como Raspberry Pi.
- Opciones de despliegue: Jlama (formato nativo JQ4), llama.cpp u Ollama si se obtiene una conversion GGUF del modelo base equivalente, vLLM y TGI para la version sin cuantizar en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen2-0.5B-Instruct-JQ4 | 509 M | no confirmado (32.768 segun Qwen2) | no disponible (base: 37,9) | no disponible (base: 40,1) | apache-2.0 | HuggingFace, orientado a Jlama |
| Qwen2-0.5B-Instruct | 0,5 B | 32.768 (documentacion Qwen2) | 37,9 | 40,1 | apache-2.0 | HuggingFace, transformers |
| Qwen1.5-0.5B-Chat | 0,5 B | no disponible | 35,0 | 11,3 | apache-2.0 | HuggingFace |
| Qwen2-1.5B-Instruct | 1,5 B | 32.768 (documentacion Qwen2) | 52,4 | 61,6 | apache-2.0 | HuggingFace |

Los datos de contexto de las variantes Qwen2 provienen de la documentacion de la familia y no de la informacion proporcionada en esta ficha. Para el resto de modelos no se dispone de datos de contexto confirmados.

## Limitaciones y advertencias

- Al tratarse de una cuantizacion de 4 bits, cabe esperar una degradacion de calidad respecto al checkpoint original; el autor no publica metricas que cuantifiquen esa perdida.
- El modelo base de 0,5 B tiene una capacidad de razonamiento muy limitada: un 37,9 en MMLU y un 17,1 en HumanEval indican un rendimiento bajo en tareas complejas.
- Riesgo elevado de alucinacion, especialmente en preguntas factuales y en cadenas de razonamiento largas.
- La etiqueta de idioma del repositorio declara unicamente ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- No se documentan capacidades de tool calling ni de agente, por lo que no es adecuado para flujos multi-paso que requieran invocar herramientas.
- La licencia apache-2.0 permite uso comercial, pero el modelo derivado hereda las condiciones del modelo base; conviene verificar la atribucion correspondiente.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, y no cuenta con validacion de la comunidad, por lo que su fiabilidad en produccion no esta contrastada.
- No se especifican los detalles del proceso de cuantizacion ni la receta exacta aplicada, lo que dificulta reproducir el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/carlosgm128/Qwen2-0.5B-Instruct-JQ4
- Repositorio de Jlama: https://github.com/tjake/jlama
- Blog de Qwen2: https://qwenlm.github.io/blog/qwen2/
- Repositorio GitHub de Qwen2: https://github.com/QwenLM/Qwen2
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Modelo base: https://huggingface.co/Qwen/Qwen2-0.5B
