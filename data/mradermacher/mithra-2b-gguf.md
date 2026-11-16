# mradermacher/Mithra-2B-GGUF

## Resumen

Mithra-2B es un modelo de lenguaje de pequeno tamano (small language model, SLM) especializado en generacion de codigo y asistencia conversacional para el ambito de la robotica educativa y de competicion, en particular las ligas FIRST Tech Challenge (FTC) y FIRST Robotics Competition (FRC). Lo desarrolla Bedirhn77 y esta afinado sobre una base de la familia Qwen2, con un total de 1.543.714.304 parametros segun los pesos en safetensors. El modelo se distribuye bajo licencia MIT y esta orientado a dos idiomas: turco (tr) e ingles (en).

La version aqui descrita es la cuantizacion GGUF publicada por mradermacher, que ofrece un abanico de cuantizaciones estaticas desde 2 bits (Q2_K, 0,8 GB) hasta 16 bits (f16, 3,2 GB), pasando por opciones intermedias Q4_K_M, Q5_K_M, Q6_K y Q8_0. Esta gama permite desplegar el modelo en hardware muy modesto, incluidas CPU y GPU de consumo, lo que encaja con su proposito de asistente ligero para equipos de robotica con recursos limitados.

El interes actual del modelo radica en su enfoque vertical: no compite en capacidades generales con modelos frontera, sino que cubre tareas concretas como generar codigo Java para el SDK de FTC, codigo Python para WPILib, o descripciones CAD en OpenSCAD, ademas de mantener conversaciones tecnicas en turco e ingles. Su tamano reducido y su licencia permisiva lo convierten en una opcion practica para integrarse en entornos docentes, herramientas de desarrollo y flujos de trabajo de equipos de robotica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (no disponible el detalle exacto de capas y dimensiones) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Turco (tr), ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones); pesos originales en safetensors en el modelo base |
| Tamano del repo | 14,2 GB |
| Modelo base | Bedirhn77/Mithra-2B |
| Dataset de entrenamiento | iamtarun/code_instructions_120k_alpaca |
| Metodo de ajuste | SFT con LoRA y PEFT (segun tags trl, sft, lora, peft) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only de la familia Qwen2, segun los tags del repositorio. No se dispone de informacion detallada sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni la longitud de contexto nativa, por lo que estos datos deben considerarse no disponibles en la informacion proporcionada.

El entrenamiento se realizo mediante ajuste supervisado (SFT) con LoRA y PEFT sobre el modelo base Bedirhn77/Mithra-2B, utilizando el dataset iamtarun/code_instructions_120k_alpaca, un conjunto de instrucciones de codigo en formato Alpaca con aproximadamente 120.000 ejemplos. No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO. Los tags del modelo indican especializacion en dominios como FTC SDK, WPILib, OpenSCAD, CAD, Java y Python, ademas de capacidades conversacionales en turco e ingles.

## Capacidades

- Generacion de codigo en Java para el SDK de FTC (FIRST Tech Challenge) y en Python para WPILib (FIRST Robotics Competition).
- Generacion de descripciones CAD en OpenSCAD para modelado de piezas y componentes de robotica.
- Asistencia conversacional tecnica en turco e ingles.
- Generacion de codigo general en Java y Python, segun los tags del modelo.
- Capacidades de instruccion y seguimiento de conversaciones multi-turno (tag conversational).
- Compatibilidad con text-generation-inference y endpoints compatibles, segun los tags del repositorio.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Asistencia a equipos de FTC: el modelo puede generar y explicar codigo Java para el SDK de FTC, ayudando a estudiantes y mentores a implementar subsistemas de robot (motores, servos, sensores) con ejemplos adaptados a la competicion.
- Desarrollo con WPILib en FRC: genera codigo Python para control de robot, lectura de sensores y logica de autonomo, adecuado para equipos que trabajan en el entorno de FIRST Robotics Competition.
- Modelado CAD en OpenSCAD: a partir de una descripcion textual de una pieza (por ejemplo, un soporte para un motor o una rueda), el modelo puede producir el script OpenSCAD correspondiente, acelerando el prototipado de componentes mecanicos.
- Tutoria y formacion en robotica: al ser un modelo pequeno y ligero, puede desplegarse en entornos educativos con hardware modesto para responder preguntas tecnicas en turco e ingles sobre programacion de robots y APIs de FTC/FRC.
- Generacion de codigo general en Java y Python: util como asistente de autocompletado o generacion de fragmentos en editores y pipelines de desarrollo, especialmente en contextos donde no se dispone de GPU de gran capacidad.
- Despliegue en local o en el borde: gracias a sus cuantizaciones desde 0,8 GB (Q2_K) hasta 1,7 GB (Q8_0), puede ejecutarse en portatiles, Raspberry Pi o contenedores ligeros para asistentes offline en talleres de robotica.
- Prototipado rapido de scripts de automatizacion: para tareas de scripting en Python o Java en entornos educativos o de laboratorio, con la ventaja de una licencia MIT que permite uso comercial y modificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para Q2_K (0,8 GB de pesos), 1,1-1,2 GB para Q4_K_M, 1,4 GB para Q6_K y 1,7 GB para Q8_0, mas el overhead del runtime (KV cache y contexto).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores funcionan sin problema. Tambien es viable en GPU integradas y en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegiegue: llama.cpp, Ollama, text-generation-inference (segun tags), y cualquier runtime compatible con GGUF. El modelo base (safetensors) puede usarse con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano (1,5B parametros), se espera una latencia baja en GPU de consumo, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Mithra-2B (este) | 1,54B | No disponible | tr, en | MIT | GGUF, safetensors | Especializado en robotica FTC/FRC, Java, Python, OpenSCAD |
| Qwen2-1.5B (base de referencia) | 1,54B | No disponible | Multiidioma | Apache 2.0 (segun familia Qwen2) | safetensors, GGUF | Modelo generalista; Mithra-2B parte de esta familia |
| Modelos SLM de codigo (p. ej. variantes de 1-2B) | 1-2B | Variable | en principalmente | Variable | GGUF, safetensors | Alternativas generalistas de codigo; no especializadas en FTC/FRC |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa de rendimiento con estos modelos. La comparativa se limita a parametros, licencia e idiomas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible. Al entrenarse sobre un dataset de instrucciones de codigo, puede reflejar sesgos presentes en dicho dataset.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar APIs, funciones o sintaxis inexistentes, especialmente en dominios muy especificos como el SDK de FTC o WPILib; se recomienda validar el codigo generado.
- Limitaciones de contexto o idioma: solo se declaran turco e ingles; el rendimiento en castellano no esta garantizado. La longitud de contexto no esta documentada.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion con atribucion; no obstante, conviene revisar las licencias del modelo base y del dataset de entrenamiento.
- Caveats para produccion: modelo de 1,5B parametros, con capacidad limitada frente a modelos mayores en razonamiento complejo y tareas generales; su especializacion en robotica FTC/FRC implica que su rendimiento fuera de ese dominio puede ser inferior. Las cuantizaciones de 2-3 bits (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso practico.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Mithra-2B-GGUF
- Modelo base: https://huggingface.co/Bedirhn77/Mithra-2B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Mithra-2B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/iamtarun/code_instructions_120k_alpaca
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
