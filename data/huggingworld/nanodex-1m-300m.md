# huggingworld/NanoDex-1M-300M

## Resumen

NanoDex-1M-300M es un modelo de lenguaje decoder-only de escala nano (1.062.272 parámetros) preentrenado desde cero por el usuario huggingworld sobre el dataset fineweb-edu, utilizando el Space NanoDex Trainer. A pesar del sufijo "300M" del nombre, ese número hace referencia a los tokens vistos durante el entrenamiento (299.892.736), no al tamaño del modelo: el recuento real de parámetros verificable en safetensors es de aproximadamente 1,06 millones, tres órdenes de magnitud por debajo de un modelo de producción.

El modelo sigue la arquitectura LlamaForCausalLM estándar, reducida en anchura y profundidad: 128 dimensiones ocultas, 5 capas, atención con consultas agrupadas (8 cabezas de consulta, 4 de clave/valor), MLP con activación SiLU, RMSNorm, embeddings posicionales rotatorios y embeddings atados, con un vocabulario BPE propio de 2.048 tokens y una ventana de contexto de 512 tokens. Solo soporta inglés y se distribuye con licencia ODC-By.

Su relevancia es exclusivamente didáctica y de investigación: el propio autor lo describe como un "artefacto de investigación a escala nano" que aprende formas de palabras, colocaciones frecuentes y algo de sintaxis, pero que no es un asistente útil y cuyo contenido no es factual. Su valor está en que hace reproducible y observable el proceso completo de preentrenamiento de un transformer, con la configuración de entrenamiento publicada de forma íntegra (1.144 pasos, 696,4 minutos de cómputo, pérdida final de 5,4029 y perplejidad de 222,1).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, clase LlamaForCausalLM (SiLU MLP, RMSNorm, RoPE, grouped-query attention, embeddings atados, sin sesgos) |
| Parametros totales | 1.062.272 (aproximadamente 1,06 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible: solo se publican pesos en safetensors sin variantes GGUF, AWQ, GPTQ ni cuantizaciones precalculadas |
| Idiomas soportados | Ingles (en) |
| Licencia | Open Data Commons Attribution License (ODC-By) |
| Formato de pesos | safetensors |
| Tamano oculto | 128 |
| Numero de capas | 5 |
| Cabezas de atencion | 8 de consulta, 4 de clave/valor |
| Tamano de la FFN | 288 |
| Vocabulario | 2.048 tokens (BPE propio entrenado sobre fineweb-edu) |
| Dataset de entrenamiento | HuggingFaceFW/fineweb-edu |
| Tokens vistos | 299.892.736 |
| Perdida final / perplejidad | 5,4029 / 222,1 |
| Libreria | transformers |
| Tamano del repositorio | 0,0 GB (pesos del orden de 4 MB en fp32) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional en la linea de Llama, escalado hacia abajo hasta el presupuesto de un millon de parametros. Emplea normalizacion RMSNorm, MLP con activacion SiLU y tamano intermedio de 288, embeddings posicionales rotatorios, atencion con consultas agrupadas (8 cabezas de consulta frente a 4 de clave/valor, lo que reduce el coste de la cache KV) y embeddings de entrada y salida atados para ahorrar parametros. No utiliza sesgos en las capas lineales. Con 5 capas y 128 dimensiones ocultas el modelo es muy poco profundo, lo que limita su capacidad de composicion semantica mas alla de patrones locales.

El preentrenamiento se realizo integramente desde cero sobre fineweb-edu (subconjunto educativo de FineWeb) con un tokenizador BPE de 2.048 tokens entrenado especificamente sobre ese corpus. La configuracion publicada incluye 299.892.736 tokens procesados en 1.144 pasos con 262.144 tokens por paso, optimizador AdamW con betas (0,9; 0,95), weight decay 0,1 y recorte de gradiente 1,0, y un esquema de learning rate con warmup del 2 % seguido de decaimiento coseno hasta el 10 % del valor pico de 3e-03. El entrenamiento completo requirio 696,4 minutos de computo. No se documenta ninguna fase de ajuste fino por instrucciones, RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto en ingles a nivel de continuacion de fragmentos cortos, con coherencia limitada a nivel de colocacion y morfologia.
- Modelado de formas de palabras, colocaciones frecuentes y sintaxis superficial, segun la propia model card del autor.
- Generacion autoregresiva estandar con decodificacion por muestreo (temperature, top_k) mediante transformers.
- Integracion con text-generation-inference y con el etiquetado endpoints_compatible del Hub.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo de razonamiento explicito (thinking mode).
- No dispone de vision, audio ni ninguna otra modalidad adicional al texto.
- Multilingue: no; unicamente ingles.
- No es capaz de seguir instrucciones ni de mantener un dialogo coherente multi-turno.

## Casos de uso

- Docencia y material didactico sobre preentrenamiento: permite ejecutar de principio a fin un pipeline de entrenamiento de un transformer con la configuracion (pasos, learning rate, perdida, tiempos) completamente publicada, de modo que el alumnado puede contrastar teoria y resultados reales.
- Prueba de humo (smoke test) en pipelines de CI/CD: al ocupar unos pocos megabytes y cargar en CPU en fracciones de segundo, resulta adecuado para verificar que un sistema de inferencia arranca, tokeniza y devuelve texto antes de desplegar modelos grandes.
- Validacion de integraciones con text-generation-inference: al estar etiquetado como endpoints_compatible, sirve para comprobar contratos de API, cabeceras y formatos de respuesta sin consumir GPU.
- Punto de referencia en estudios de leyes de escala: con 1,062 M de parametros y 2,999e8 tokens vistos, constituye un punto de datos reproducible en el extremo inferior de la curva para analisis de relacion entre computo, tokens y perdida.
- Experimentacion con tokenizadores: su BPE de 2.048 tokens entrenado sobre fineweb-edu permite estudiar cobertura, tasa de compresion y aparicion de tokens raros en un vocabulario deliberadamente minusculo, comparandolo con tokenizadores de 32.000 o 128.000 tokens.
- Pruebas de herramientas de conversion y cuantizacion: sirve como sujeto barato para validar scripts de conversion a GGUF, cuantizacion de precision mixta o serializacion, dado que un fallo se detecta en segundos y sin coste de GPU.
- Evaluacion de infraestructura de serving: util para medir sobrecarga de arranque, planificacion de lotes y latencia base de frameworks de inferencia, aislando el coste de computo del modelo.
- Generacion de texto de relleno en maquetas y demos de interfaz: produce texto con aspecto plausible a nivel de palabra para prototipos visuales, con la advertencia explicita de que el contenido no es factual.
- Reproduccion de artefactos de investigacion: al estar entrenado con un Space publico, permite replicar el experimento y comparar resultados con los hiperparametros declarados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, HellaSwag ni de ninguna otra evaluacion estandar. El unico indicador de rendimiento publicado es la perdida final de entrenamiento (5,4029) y su perplejidad asociada (222,1), valores que en si mismos reflejan un modelado muy debil del lenguaje en comparacion con modelos de mayor escala.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,25 MB en fp32 y 2,03 MB en fp16 (calculo derivado de 1.062.272 parametros; no se publican mediciones oficiales). A ello hay que sumar la cache KV, despreciable con 512 tokens de contexto, 5 capas y 4 cabezas de clave/valor.
- GPU recomendadas: cualquiera, incluidas GPUs integradas o incluso CPU exclusiva. No se requiere A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e integrada, con un consumo de memoria irrelevante frente al resto del proceso.
- Opciones de despliegue: transformers es la via soportada oficialmente; el modelo declara compatibilidad con text-generation-inference y con endpoints_compatible. No se publican pesos en GGUF ni plantillas de Ollama, y no se confirma soporte de vLLM sin conversion previa.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de latencia ni de tokens por segundo. Con este numero de parametros el cuello de botella previsible es la sobrecarga del framework, no el computo matricial.
- Almacenamiento: el repositorio ocupa 0,0 GB, por lo que su descarga y cacheado son inmediatos.

## Comparativa con modelos similares

No se dispone de datos comparativos verificados dentro de la informacion proporcionada, y no se ha publicado ninguna evaluacion de NanoDex-1M-300M frente a alternativas. Los resultados de busqueda web disponibles corresponden a un dominio sin relacion con el modelo (Certis Belchim, sector fitosanitario) y no aportan informacion tecnica utilizable.

Como referencia cualitativa, la categoria de modelos nano preentrenados desde cero incluye artefactos de escala similar (por ejemplo, modelos tipo TinyStories de aproximadamente 1 M de parametros) y modelos pequenos pero ya utilizables como asistentes (por ejemplo, la familia SmolLM de 135 M de parametros). Estos ultimos manejan contextos notablemente mayores y cuentan con fases de ajuste por instrucciones, por lo que no son comparables en capacidad real pese a compartir la etiqueta de "modelo pequeno". Cualquier cifra concreta de parametros, contexto o licencia de esos alternativas deberia verificarse en sus fichas oficiales antes de citarla.

## Limitaciones y advertencias

- Alucinacion sistematica: el propio autor advierte de que la salida no es factual. El modelo no tiene conocimiento verificable y puede generar afirmaciones falsas con apariencia plausible.
- No es un asistente: no sigue instrucciones, no mantiene dialogos coherentes y no debe desplegarse de cara al usuario final en aplicaciones informativas.
- Sesgos: no se documenta ningun analisis de sesgo. Al entrenarse sobre fineweb-edu, hereda los sesgos del corpus, amplificados por la ausencia de fases de alineacion (RLHF, DPO o similares).
- Limitacion de contexto: 512 tokens, insuficiente para tareas de contexto largo, resumen de documentos o conversaciones multi-turno extensas.
- Limitacion de idioma: unicamente ingles, tanto por el corpus como por el vocabulario BPE de 2.048 tokens, que no cubre de forma eficiente el castellano ni otros idiomas.
- Vocabulario minúsculo: 2.048 tokens implican una tokenizacion muy ineficiente de textos reales, con secuencias mas largas de lo habitual para el mismo contenido y mayor probabilidad de fragmentacion de palabras.
- Calidad de generacion: la perplejidad de 222,1 evidencia un modelado del lenguaje muy debil; el texto producido puede degradarse rapidamente a partir de unas pocas decenas de tokens.
- Licencia ODC-By: permite uso comercial y modificacion con atribucion obligatoria, pero esta pensada para bases de datos y no incluye concesiones explicitas de patentes; conviene revisar la compatibilidad con el producto final.
- Ambiguedad de nomenclatura: el sufijo "300M" del nombre puede inducir a error, ya que alude a los tokens de entrenamiento y no a los parametros. Debe citarse siempre como modelo de 1,06 M de parametros.
- Ausencia de validacion externa: el modelo registra 0 descargas y 0 likes, no tiene evaluaciones publicadas por terceros y su fecha de creacion aparece como 2026-09-10, posterior a la mayoria de referencias disponibles.
- Sin garantias de produccion: no hay informes de estabilidad, pruebas de robustez ni soporte del autor mas alla de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huggingworld/NanoDex-1M-300M
- Space NanoDex Trainer: https://huggingface.co/spaces/hugging-science/nanodex-trainer
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Perfil del autor: https://huggingface.co/huggingworld
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo; los resultados devueltos (certisbelchim.de, certisbelchim.com, agrobrain.de, certisbelchim-railservice.com) pertenecen al sector fitosanitario y no guardan relacion con NanoDex.
