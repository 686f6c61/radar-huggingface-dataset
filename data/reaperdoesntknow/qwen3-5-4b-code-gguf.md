# reaperdoesntknow/qwen3.5-4B-Code-GGUF

## Resumen

Qwen3.5-4B-Code-GGUF es una publicacion de pesos cuantizados en formato GGUF de un modelo de la familia Qwen3.5, etiquetado por su autor como orientado a codigo. La publica el usuario `reaperdoesntknow` en Hugging Face y no se trata de un lanzamiento oficial de Alibaba/Qwen, sino de una exportacion derivada. El repositorio incluye tres cuantizaciones del modelo de lenguaje (Q4_0, Q4_K_M y Q8_0) y un proyector multimodal en BF16, lo que confirma que el modelo base es de tipo vision-language. Segun el `config.json` incluido, la arquitectura declarada es `Qwen3_5ForConditionalGeneration`, con componentes de texto y vision, y el modelo de texto esta configurado en bfloat16.

El modelo cuenta con 4.326.350.848 parametros totales, lo que lo situa en la gama de 4B, un tamano adecuado para inferencia local en GPU de consumo y en CPU mediante llama.cpp. Su relevancia practica radica en que permite ejecutar un modelo conversacional con capacidad de vision y orientacion a codigo en hardware modesto, usando el ecosistema GGUF y runtimes compatibles. La conversion se realizo, segun la model card, con Unsloth.

La informacion publicada es limitada: no se documentan datos de entrenamiento, benchmarks, evaluacion de seguridad ni comparacion entre cuantizaciones. La model card advierte explicitamente de que el nombre "Code" y una conversion correcta no garantizan mejor capacidad de programacion. Esta ficha refleja unicamente lo verificable en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer con componentes de texto y vision) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0, Q4_K_M, Q8_0 (modelo de lenguaje); proyector multimodal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (los metadatos GGUF no declaran licencia ni modelo base) |
| Formato de pesos | GGUF (llama.cpp); config de texto en bfloat16 |
| Tamano del repositorio | 10,7 GB |
| Preprocesador multimodal | Qwen3.5-4B.BF16-mmproj.gguf (proyector separado, no es modelo autonomo) |

## Arquitectura y entrenamiento

La arquitectura declarada en el `config.json` es `Qwen3_5ForConditionalGeneration`, un modelo condicional con dos componentes: un modulo de texto y un modulo de vision. El componente de texto esta configurado en bfloat16, aunque esa precision describe la configuracion original y no la precision de almacenamiento de los ficheros GGUF cuantizados. El repositorio incluye un proyector multimodal independiente en BF16, lo que confirma el caracter vision-language del modelo, aunque la model card no detalla como se combinan las representaciones visuales con el modelo de lenguaje ni el numero de tokens de imagen.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). La model card indica que la conversion se hizo con Unsloth, pero no identifica la revision exacta del checkpoint de origen, el comando de conversion ni la version de la herramienta de cuantizacion, por lo que no se puede afirmar una relacion de conversion exacta con ningun checkpoint concreto. Tampoco se documenta ninguna evaluacion de calidad comparando las tres cuantizaciones.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Procesamiento de imagenes: el repositorio incluye un proyector multimodal (`BF16-mmproj.gguf`) que, junto con el modelo de lenguaje, habilita entradas de vision en runtimes compatibles.
- Orientacion a codigo por nombre del modelo, aunque no se aporta ninguna evaluacion que lo respalde.
- Compatibilidad con `llama.cpp` y con el ecosistema de herramientas GGUF, incluyendo `llama-cli` y `llama-mtmd-cli` con `--jinja` segun los ejemplos de la model card original.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- No se documenta soporte de tool calling, function calling, agentes, modo thinking ni capacidades de audio.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Experimentacion local con modelos vision-language: permite probar entradas de imagen y texto en un equipo de consumo usando `llama-mtmd-cli` y el proyector BF16, sin depender de APIs externas.
- Asistencia de programacion en local: el modelo puede usarse como ayuda para autocompletar o explicar fragmentos de codigo en un entorno de desarrollo integrado, con la advertencia de que la calidad de codigo no esta evaluada y requiere revision humana.
- Prototipado de asistentes conversacionales: su etiqueta `conversational` y su tamano de 4B permiten montar un chatbot de prueba en una estacion de trabajo para validar flujos de producto antes de escalar a modelos mayores.
- Evaluacion comparativa de cuantizaciones: al ofrecer Q4_0, Q4_K_M y Q8_0 del mismo modelo, sirve para medir en primera persona el impacto de la cuantizacion en calidad y velocidad sobre el hardware propio.
- Procesamiento de documentos con imagenes: con el proyector multimodal se pueden probar tareas de descripcion de capturas, diagramas o capturas de pantalla en un pipeline local de preprocesamiento.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse integramente en local mediante llama.cpp, es apto para escenarios donde no se permite enviar datos a servicios en la nube, siempre que se revise antes la licencia del modelo base.
- Educacion y divulgacion: util para demostrar el funcionamiento de modelos GGUF y de la inferencia multimodal en talleres o cursos, dado su bajo requisito de hardware en cuantizacion Q4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no incluye benchmark de codigo, comparacion entre cuantizaciones ni evaluacion de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; la model card no documenta requisitos de memoria. Como referencia orientativa basada en el numero de parametros (4,33B), la cuantizacion Q4_0 y Q4_K_M ocupan del orden de 2,5-3 GB en pesos, Q8_0 del orden de 4,5-5 GB, y el proyector BF16 anade una cantidad adicional no especificada. Estas cifras son estimaciones por tamano, no medidas publicadas.
- GPU recomendadas: no disponibles. Por tamano, el modelo es apto para GPU de consumo con 8 GB o mas de VRAM en cuantizaciones Q4; Q8_0 requiere mas margen.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8 GB o mas de VRAM en Q4, aunque no hay medicion oficial.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), y runtimes GGUF compatibles con Qwen3.5. La model card no confirma soporte de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de especificaciones verificables de alternativas comparables dentro de la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. A continuacion se indican unicamente los datos estructurales conocidos frente a la referencia interna del propio autor.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Code-GGUF (este) | 4,33B | no disponible | GGUF | no disponible | Vision-language, tres cuantizaciones |
| Qwen3.5-4B-Coder | no disponible | no disponible | Transformers | no disponible | Repositorio relacionado citado en la model card |
| Alternativas de 4B de otras familias | no disponible | no disponible | no disponible | no disponible | Sin datos verificables en la informacion disponible |

## Limitaciones y advertencias

- La licencia no esta declarada en los metadatos GGUF ni en la model card. Antes de redistribuir o usar comercialmente hay que confirmar los terminos del modelo de origen.
- No se identifica el checkpoint fuente exacto, el comando de conversion ni la version de la herramienta de cuantizacion, por lo que la trazabilidad es incompleta.
- No hay benchmarks ni evaluacion de seguridad: el nombre "Code" no garantiza mejor rendimiento en programacion.
- El codigo generado puede contener errores o vulnerabilidades; debe revisarse y probarse antes de ejecutarlo.
- No se deben exponer secretos ni sistemas de produccion a codigo generado sin revision.
- La cuantizacion altera las salidas; hay que evaluar el fichero y el runtime concretos que se vayan a usar.
- El proyector multimodal no sustituye al modelo de lenguaje: es necesario cargar ambos ficheros para entradas de imagen.
- No se documentan sesgos conocidos, limitaciones de contexto ni cobertura idiomatica.
- Se desconoce el soporte real de tool calling y de flujos de agente.
- El repositorio tiene 0 likes y 2147 descargas en el momento de la consulta, lo que sugiere una adopcion limitada y poca validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/reaperdoesntknow/qwen3.5-4B-Code-GGUF
- Repositorio relacionado en Transformers: https://huggingface.co/reaperdoesntknow/Qwen3.5-4B-Coder
- Unsloth (herramienta de conversion citada): https://github.com/unslothai/unsloth
- llama.cpp (documentacion oficial): https://github.com/ggml-org/llama.cpp
- Documentacion multimodal de llama.cpp: https://github.com/ggml-org/llama.cpp/tree/master/tools/mtmd
