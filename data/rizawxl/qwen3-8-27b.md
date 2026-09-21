# rizawxl/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de vision publicado en Hugging Face por el usuario `rizawxl` bajo licencia Apache 2.0. Segun la model card, se trata de un modelo denso de 27B parametros (27.781.427.952 segun los pesos en safetensors) construido sobre la base arquitectonica de la serie Qwen3.5, con atencion hibrida que combina capas de atencion lineal Gated DeltaNet con capas de atencion clasica con compuerta (Gated Attention). El modelo se presenta como vision-language nativo, capaz de procesar imagenes y videos, con una longitud de contexto nativa de 262.144 tokens ampliable hasta 1.000.000.

El problema que aborda es el de las tareas agenticas de horizonte largo: la model card destaca mejoras en codificacion, trabajo profesional, investigacion y ejecucion autonoma de tareas multi-paso, con un modo de razonamiento (thinking) activado por defecto y controlable por peticion mediante los parametros `reasoning_effort` y `preserve_thinking`. Incluye tambien entrenamiento con Multi-Token Prediction (MTP), lo que habilita decodificacion especulativa en motores de inferencia compatibles.

La relevancia practica del artefacto es limitada y debe matizarse: el repositorio no pertenece a la organizacion oficial de Qwen, registra 0 descargas y 0 likes en el momento de la consulta, la model card no indica composicion del dataset ni idiomas soportados, y la tabla de benchmarks aparece truncada en la informacion disponible. Ademas, el tag del repositorio es `qwen3_5`, no `qwen3_8`, y las fechas de creacion y actualizacion (2026-09-21) no permiten verificar la procedencia de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de vision; atencion hibrida: 48 capas Gated DeltaNet (atencion lineal) + 16 capas Gated Attention |
| Parametros totales | 27.781.427.952 (27,8B); la model card indica 27B |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos safetensors; no se documentan GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (biblioteca transformers); tamano del repo 55,6 GB |

## Arquitectura y entrenamiento

La arquitectura sigue un layout hibrido repetido 16 veces: `16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`, lo que da un total de 64 capas, de las cuales 48 son de atencion lineal y 16 de atencion clasica. La dimension oculta es 5.120 y la dimension intermedia de la red feed-forward es 17.408. Las capas Gated DeltaNet emplean 48 cabezas de atencion lineal para V y 16 para QK, con dimension de cabeza 128. Las capas Gated Attention usan 24 cabezas para Q y solo 4 para KV, con dimension de cabeza 256 y dimension de Rotary Position Embedding de 64; esta relacion 24:4 reduce el coste del cache KV. El embedding de tokens y la salida LM tienen 248.320 entradas (con padding). El modelo incorpora Multi-Token Prediction entrenado con multiples pasos, lo que permite decodificacion especulativa con cabezas MTP. El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000.

En cuanto al entrenamiento, la model card solo indica las etapas "Pre-training & Post-training" y no aporta numero de tokens, composicion del dataset, proporciones multimodales ni si se aplicaron RLHF, DPO u otras tecnicas de alineamiento. No se detallan la arquitectura del codificador de vision, la resolucion de entrada, el numero de frames soportados para video ni la estrategia de fusion vision-lenguaje. Si se documentan mecanismos de control del razonamiento: modo thinking activado por defecto y desactivable por peticion, ajuste de profundidad de razonamiento mediante `reasoning_effort` y retencion del contexto de razonamiento de mensajes historicos mediante `preserve_thinking`.

## Capacidades

- Generacion de texto y razonamiento, con modo thinking activado por defecto y desactivable por peticion.
- Control de profundidad de razonamiento mediante el parametro `reasoning_effort`.
- Retencion del contexto de razonamiento historico mediante `preserve_thinking`, util en conversaciones multi-turno y tareas agenticas.
- Codificacion de software, incluyendo codificacion agentica en terminal segun la model card.
- Comprension de vision y lenguaje de forma nativa: diagramas STEM, documentos e imagenes.
- Comprension de video, incluyendo videos de escala horaria segun la model card.
- Ejecucion agentica: planificacion autonoma y manejo de retroalimentacion del entorno para completar tareas de extremo a extremo.
- Compatibilidad declarada con harnesses y herramientas de desarrollo populares, sin detallar cuales.
- Decodificacion especulativa mediante cabezas MTP.
- Soporte multilingue: no disponible (no se declara en la informacion proporcionada).
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente de codificacion en terminal: el modelo se presenta especificamente evaluado en codificacion agentica de terminal (Terminal Bench), por lo que encaja en flujos donde el modelo ejecuta comandos, lee la salida y corrige de forma iterativa.
- Agentes autonomos de horizonte largo: con 262.144 tokens de contexto nativo y retencion de contexto de razonamiento, puede mantener estado de una tarea multi-paso extensa (por ejemplo, migraciones de codebase) sin perder el hilo.
- Analisis de documentacion tecnica escaneada: al ser un modelo vision-language, puede extraer y razonar sobre diagramas, tablas y esquemas en PDF e imagenes sin pipeline OCR externo.
- Revision de video tecnico: la model card declara soporte de video de escala horaria, lo que permite resumir sesiones grabadas, clases o auditorias con marcas temporales.
- Atencion al cliente multi-turno: la ventana de contexto permite arrastrar historiales largos de conversacion y documentacion de producto en la misma peticion.
- Investigacion asistida: sintesis de literatura, comparacion de resultados y generacion de hipotesis, con modo thinking para tareas que requieren cadena de razonamiento.
- Extraccion estructurada en pipelines de datos: con tool calling y contexto largo, puede procesar lotes de documentos y emitir JSON validado contra un esquema.
- Despliegue en infraestructura propia: al ser un modelo denso de 27B con pesos abiertos y licencia Apache 2.0, es viable servirlo en una GPU de 80 GB o en configuraciones cuantizadas de una sola GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de resultados comparativa con las columnas Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, con categorias como "Coding" y la metrica "Terminal Bench 2.1 (Terminus)", pero el contenido de la tabla aparece truncado en la informacion proporcionada y no es posible extraer ninguna cifra. No se debe asumir ningun valor numerico a partir de esa tabla.

## Requisitos de hardware

- Peso de los pesos: 55,6 GB en el repositorio, coherente con 27,8B parametros en precision bf16/fp16.
- VRAM para inferencia en bf16/fp16: aproximadamente 56 GB solo para pesos, mas cache KV y activaciones; requiere una GPU de 80 GB (H100 80 GB, A100 80 GB) o reparto en dos GPU de 40 GB.
- VRAM en cuantizacion de 8 bits: aproximadamente 28 GB de pesos; encaja en A6000 48 GB, L40S 48 GB o H100 80 GB con margen amplio.
- VRAM en cuantizacion de 4 bits: aproximadamente 14-17 GB de pesos; cabe en RTX 4090 24 GB, RTX 5090 32 GB o L4 24 GB, con margen limitado para contexto largo.
- Cache KV estimado (calculo propio a partir de la configuracion publicada, no verificado): solo 16 de las 64 capas usan atencion clasica con 4 cabezas KV de 256 dimensiones, lo que da unos 4 KB por token y capa en fp16, es decir aproximadamente 64 KB por token en total; a 262.144 tokens esto supone del orden de 16-17 GB adicionales. Esta cifra es una estimacion derivada, no un dato publicado.
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16; A6000/L40S 48 GB para FP8/INT8; RTX 4090 o RTX 5090 para cuantizaciones de 4 bits con contexto moderado.
- Cabe en GPU de consumo: si, en cuantizacion de 4 bits, con la salvedad de que el contexto largo y las entradas de video incrementan mucho el consumo de memoria.
- Opciones de despliegue: la model card declara compatibilidad con Hugging Face Transformers, vLLM, SGLang y TokenSpeed; tambien se menciona `endpoints_compatible` en las etiquetas del repositorio. No se confirma soporte de llama.cpp, Ollama, TGI ni formatos GGUF en la informacion disponible.
- Latencia y throughput: no disponibles. La presencia de cabezas MTP sugiere que motores compatibles podrian aplicar decodificacion especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (este repositorio) | 27,8B dense | 262.144 nativos, hasta 1.000.000 | No disponible (tabla truncada) | apache-2.0 | Pesos en Hugging Face, repositorio de terceros con 0 descargas |
| Qwen3.6-27B | 27B (segun model card) | No disponible | No disponible (aparece como columna comparativa sin cifras extraibles) | No disponible | Referenciado en la model card; no se aporta enlace |
| Muse Glimmer-30B | 30B (segun nombre) | No disponible | No disponible | No disponible | No disponible |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | Referenciado como servicio en la nube, no como pesos abiertos |
| Opus4.6 Max | No disponible | No disponible | No disponible | Propietaria | Solo API |

No se dispone de datos verificables de ninguno de los modelos comparados en la informacion proporcionada. La model card los menciona como referencias de comparacion, pero sin cifras publicadas accesibles.

## Limitaciones y advertencias

- Procedencia no oficial: el repositorio pertenece al usuario `rizawxl`, no a la organizacion oficial de Qwen. Los pesos, la nomenclatura y la model card no estan verificados por el desarrollador original.
- Etiqueta incoherente: el repositorio esta etiquetado como `qwen3_5`, mientras que el nombre del modelo es Qwen3.8-27B, lo que sugiere reutilizacion de plantilla o renombrado de artefactos.
- Fechas no verificables: creacion y actualizacion el 2026-09-21, sin historial adicional que permita auditar el linaje de los pesos.
- Sin traccion ni validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones publicas.
- Benchmarks no verificables: la tabla comparativa incluye modelos propietarios y no propietarios (Opus4.6 Max, Muse Glimmer-30B, Qwen3.7-Plus) sin datos extraibles ni metodologia descrita.
- Ausencia de datos de entrenamiento: no se especifican tokens, composicion del dataset, filtrado, ni tecnicas de alineamiento (RLHF, DPO), lo que impide evaluar sesgos y riesgos de contaminacion.
- Idioma no declarado: no hay lista de idiomas soportados, por lo que el rendimiento en castellano es desconocido y debe medirse antes de un despliegue en produccion.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni mecanismos de mitigacion mas alla del modo thinking. En tareas de investigacion y extraccion de datos se recomienda verificacion externa.
- Vision y video sin especificaciones: no se detalla resolucion de entrada, numero de frames, limites de duracion ni calidad del OCR, pese a declararse soporte de video de escala horaria.
- Contexto de 1M solo anunciado como servicio: la extension a 1.000.000 de tokens se presenta en el contexto de la API alojada de Qwen Cloud, no necesariamente en los pesos abiertos de este repositorio.
- Licencia: Apache 2.0 permite uso comercial, pero al no ser un artefacto oficial no puede garantizarse que la licencia declarada se corresponda con los terminos reales de los pesos subidos.
- Coste de memoria en contexto largo: el cache KV crece de forma lineal con el contexto; a 262.144 tokens las estimaciones derivadas apuntan a mas de 16 GB adicionales en fp16, lo que puede desbordar GPU de consumo.
- Servicio en la nube "coming soon": la model card anuncia Qwen Cloud con contexto de 1M y herramientas oficiales integradas, pero indica que el servicio aun no esta disponible.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/rizawxl/Qwen3.8-27B
- Qwen Cloud (mencionado en la model card): https://www.qwencloud.com
- Pagina de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b

Nota: la busqueda web asociada no devolvio ningun resultado relevante para este modelo; los resultados obtenidos correspondian a tramites administrativos de congés spectacles en Francia y no guardan relacion con el artefacto descrito. No se han encontrado papers, repositorios de codigo, demos ni blogs tecnicos adicionales sobre este modelo en la informacion proporcionada.
