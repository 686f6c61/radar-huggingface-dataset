# ArchiveStudio/Phi-4-mini-reasoning

## Resumen

Phi-4-mini-reasoning es un modelo de lenguaje compacto de 3.800 millones de parámetros (3.836.021.760 en safetensors) desarrollado por Microsoft dentro de la familia Phi-4, y publicado en este repositorio por el usuario ArchiveStudio como espejo. Se trata de un transformer denso especializado en razonamiento matemático de varios pasos, afinado a partir de datos sintéticos generados por un modelo mayor y más capaz, con el objetivo de concentrar capacidad de razonamiento analítico en un tamaño apto para entornos con restricciones de memoria, cómputo o latencia.

El modelo parte de Phi-4-Mini y añade un entrenamiento orientado a matemáticas, con una ventana de contexto de 128.000 tokens y un vocabulario de hasta 200.064 tokens. La relevancia actual radica en que ofrece resultados cercanos a modelos de 7-8B (o incluso superiores en MATH-500) con la mitad de parámetros, lo que lo hace atractivo para despliegue en el borde, tutores embebidos y aplicaciones educativas.

Esta ficha se basa en la información disponible del repositorio y de la model card de referencia. El repositorio no registra descargas ni interacciones en el momento de la consulta, y la model card corresponde al modelo original de Microsoft, no a una versión modificada por ArchiveStudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiqueta de libreria: phi3); no es MoE |
| Parametros totales | 3.836.021.760 (aproximadamente 3.8B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | no disponible en el repositorio; solo se distribuyen pesos safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (tamano del repositorio: 7,7 GB) |
| Tamano de vocabulario | hasta 200.064 tokens |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

Se trata de un modelo transformer denso basado en la arquitectura de la familia Phi (etiquetado como `phi3` en la libreria de transformers). No emplea mezcla de expertos ni arquitecturas hibridas SSM: es un decodificador clasico optimizado para eficiencia en inferencia. Soporta una ventana de contexto de 128.000 tokens y un vocabulario ampliado de hasta 200.064 tokens. La model card indica que los ficheros de tokenizer incluyen tokens de reserva utilizables en ajuste fino posterior.

El entrenamiento se basa en datos sinteticos "reasoning dense" generados por un modelo mas grande y preciso, sobre los que se aplica un ajuste fino especifico para razonamiento matematico avanzado. El modelo parte de Phi-4-Mini (version base de 3.8B) como punto de partida. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras variantes de alineamiento. Tampoco se detallan innovaciones de decodificacion especulativa ni mecanismos de atencion alternativa.

## Capacidades

- Razonamiento matematico de multiples pasos: resolucion de problemas logicos e intensivos en computo simbolico.
- Generacion de pruebas formales y calculo simbolico.
- Problemas de enunciado avanzados (word problems) de nivel competitivo.
- Mantenimiento de contexto entre pasos, aplicando logica estructurada de forma sostenida.
- Generacion de codigo, segun las etiquetas del repositorio (`code`), aunque la model card enfatiza el enfoque matematico.
- Conversacion multi-turno mediante formato de chat con roles de sistema y usuario.
- Capacidad de razonamiento extenso con cadenas de pensamiento largas, apoyada en la ventana de 128.000 tokens.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso autonomo: no documentado explicitamente.
- Multilingue: limitado a ingles segun la model card; el modelo "logra un nivel similar de comprension multilingue y razonamiento a modelos mucho mayores", pero el campo `language` declara unicamente `en`.
- Vision y audio: no disponibles en esta variante (existen en Phi-4-multimodal-instruct).

## Casos de uso

- Tutoria matematica embebida: el modelo puede resolver paso a paso problemas de algebra, calculo y teoria de numeros en dispositivos con poca memoria, gracias a sus 3.8B de parametros y su contexto de 128.000 tokens para mantener el hilo de un ejercicio largo.
- Generacion de pruebas formales asistida: util para entornos academicos donde se requiere construir demostraciones estructuradas y verificar pasos intermedios de forma secuencial.
- Calculo simbolico asistido: integracion en cuadernos o herramientas de algebra computacional para obtener desarrollos intermedios y comprobaciones de resultados.
- Preparacion de olimpiadas y examenes tipo AIME: con 57,5 en AIME y 94,6 en MATH-500, sirve como generador de soluciones y entrenador de practica para estudiantes avanzados.
- Verificacion de soluciones en pipelines educativos: uso como segundo evaluador que reproduce la resolucion de un problema y detecta discrepancias en el resultado.
- Despliegue en el borde o movil: al caber en GPUs consumer y en cuantizacion INT4, permite ejecutar razonamiento matematico local sin conexion en tablets o portatiles.
- Analisis cuantitativo ligero: resolucion de problemas de estadistica, probabilidad y modelado matematico en scripts o asistentes internos.
- Aumento con recuperacion (RAG): la model card sugiere complementar el modelo con un motor de busqueda para compensar su limitada memoria factual, integrándolo en asistentes tecnicos que combinen calculo y datos externos.

## Benchmarks y rendimiento

Resultados publicados en la model card:

| Modelo | AIME | MATH-500 | GPQA Diamond |
|---|---|---|---|
| o1-mini* | 63,6 | 90,0 | 60,0 |
| DeepSeek-R1-Distill-Qwen-7B | 53,3 | 91,4 | 49,5 |
| DeepSeek-R1-Distill-Llama-8B | 43,3 | 86,9 | 47,3 |
| Bespoke-Stratos-7B* | 20,0 | 82,0 | 37,8 |
| OpenThinker-7B* | 31,3 | 83,0 | 42,4 |
| Llama-3.2-3B-Instruct | 6,7 | 44,4 | 25,3 |
| Phi-4-Mini (modelo base, 3.8B) | 10,0 | 71,8 | 36,9 |
| Phi-4-mini-reasoning (3.8B) | 57,5 | 94,6 | 52,0 |

No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del numero de parametros, no datos publicados por el autor.

- Pesos en FP16/BF16: aproximadamente 7,7 GB (coincide con el tamano del repositorio).
- Pesos en INT8: aproximadamente 4 GB.
- Pesos en INT4: aproximadamente 2,2-2,5 GB.
- GPU recomendadas para FP16: A100 40 GB, H100, L40S o RTX 4090 (24 GB) con margen suficiente.
- GPU consumer: cabe en RTX 3090/4090 (24 GB) en FP16 y en GPUs de 8-12 GB (RTX 3060, RTX 4070) usando cuantizacion INT4 o INT8.
- Nota sobre el contexto: con 128.000 tokens de ventana, la cache KV crece de forma notable; para contextos muy largos se requiere VRAM adicional o tecnicas de atencion eficiente.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). Para cuantizacion GGUF seria necesario convertir los pesos, ya que el repositorio no incluye ficheros GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIME | MATH-500 | GPQA Diamond | Licencia |
|---|---|---|---|---|---|---|
| Phi-4-mini-reasoning | 3,8B | 128K | 57,5 | 94,6 | 52,0 | MIT |
| DeepSeek-R1-Distill-Qwen-7B | 7B | no disponible en esta informacion | 53,3 | 91,4 | 49,5 | no disponible |
| DeepSeek-R1-Distill-Llama-8B | 8B | no disponible en esta informacion | 43,3 | 86,9 | 47,3 | no disponible |
| Llama-3.2-3B-Instruct | 3B | no disponible en esta informacion | 6,7 | 44,4 | 25,3 | no disponible |

Phi-4-mini-reasoning mejora a modelos de 7-8B en AIME, MATH-500 y GPQA Diamond con aproximadamente la mitad de parametros, lo que lo situa como una opcion muy eficiente en relacion calidad/tamano. La principal contrapartida es su limitacion factual y su enfoque exclusivo en matematicas, frente a alternativas mas generalistas.

## Limitaciones y advertencias

- Enfoque restringido: la model card indica explicitamente que esta disenado y evaluado solo para razonamiento matematico, no para propositos generales descendentes.
- Memoria factual limitada: con 3.8B de parametros, el modelo no puede almacenar mucho conocimiento factual y puede producir respuestas factualmente incorrectas. Se recomienda augmentarlo con buscador o en configuracion RAG.
- Riesgo de alucinacion: aunque el razonamiento sea solido, la falta de conocimiento factual incrementa el riesgo de afirmaciones incorrectas fuera del dominio matematico.
- Idioma: declarado unicamente en ingles; el rendimiento en otros idiomas no esta garantizado ni evaluado.
- Sesgos: no se detallan sesgos conocidos en la informacion disponible; se recomienda evaluar y mitigar exactitud, seguridad y justicia antes de usos de alto riesgo.
- Licencia: MIT, lo que permite uso comercial, aunque el enlace de licencia apunta al fichero LICENSE del repositorio de Microsoft. Conviene verificar los terminos exactos antes de un despliegue en produccion.
- Repositorio espejo: el ID `ArchiveStudio/Phi-4-mini-reasoning` no es el repositorio oficial de Microsoft (`microsoft/Phi-4-mini-reasoning`); no se garantiza paridad con el modelo original ni mantenimiento.
- Sin descargas ni interacciones registradas: no hay senal de validacion por parte de la comunidad en este repositorio concreto.
- Uso en produccion: no se han publicado datos de latencia, throughput ni pruebas de estres en contextos largos; habria que validarlos antes de desplegarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ArchiveStudio/Phi-4-mini-reasoning
- Blog de Phi-4-mini-reasoning: https://aka.ms/phi4-mini-reasoning/blog
- Articulo para desarrolladores: https://techcommunity.microsoft.com/blog/azuredevcommunityblog/make-phi-4-mini-reasoning-more-powerful-with-industry-reasoning-on-edge-devices/4409764
- Informe tecnico: https://aka.ms/phi4-mini-reasoning/techreport
- Paper en HuggingFace (arXiv 2504.21233): https://huggingface.co/papers/2504.21233
- Phi Cookbook: https://github.com/microsoft/PhiCookBook
- Portal Phi: https://azure.microsoft.com/en-us/products/phi
- Demo en Azure: https://aka.ms/phi4-mini-reasoning/azure
- Phi-4-reasoning: https://huggingface.co/microsoft/Phi-4-reasoning
- Phi-4-multimodal-instruct: https://huggingface.co/microsoft/Phi-4-multimodal-instruct
- Phi-4-mini-instruct: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Fichero de licencia referenciado: https://huggingface.co/microsoft/Phi-4-mini-instruct-reasoning/resolve/main/LICENSE
