# Kadabra/Qwen3.5-4B-Base-CPT-Gascon-Enrichie-SFT-GGUF

## Resumen

`Kadabra/Qwen3.5-4B-Base-CPT-Gascon-Enrichie-SFT-GGUF` es una publicacion comunitaria en formato GGUF derivada de un modelo base Qwen3.5-4B. El autor, identificado como Kadabra, ha empaquetado con Unsloth los pesos ya convertidos a llama.cpp en cinco variantes de cuantizacion, desde Q2_K_L hasta BF16, e incluye un fichero `mmproj` que apunta a un proyector multimodal para entrada de imagen. El recuento real de parametros declarado en safetensors es de 4.205.751.296 (~4,21 B), y el repositorio ocupa 11,2 GB.

El nombre del repositorio sugiere la cadena de entrenamiento: continuacion de preentrenamiento (CPT) sobre un corpus de gascon "enriquecido" y posterior ajuste supervisado (SFT). Se trata, por tanto, de un artefacto orientado a una lengua minoritaria occitano-romance, con el objetivo declarado implicitamente en el nombre de mejorar la cobertura de ese idioma en un modelo de ~4 B. Es relevante porque los modelos de ese tamano con soporte real de lenguas de bajos recursos son escasos y porque el formato GGUF permite ejecucion local en hardware de consumo.

Ahora bien, la model card es practicamente un volcado de la plantilla de Unsloth: no documenta licencia, idiomas, longitud de contexto, composicion del dataset, tokens de entrenamiento ni resultados de evaluacion. El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, por lo que debe tratarse como un experimento sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivada de Qwen3.5 (detalles no disponibles); incluye proyector multimodal `mmproj` para vision |
| Parametros totales | 4.205.751.296 (~4,21 B), dato declarado en safetensors |
| Parametros activos | no aplica: no hay evidencia de arquitectura MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos + `mmproj`), Q2_K_L, Q3_K_M, Q4_K_M, Q6_K |
| Idiomas soportados | no disponibles; el nombre del repositorio indica ajuste sobre gascon |
| Licencia | no disponible (ni la del modelo ni la heredada del base) |
| Formato de pesos | GGUF para llama.cpp; repositorio de 11,2 GB |
| Fecha de publicacion | 19 de octubre de 2026 segun metadatos |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no permite reconstruir el proceso de entrenamiento. El identificador del repositorio encadena tres etapas que cabe interpretar, sin confirmacion del autor, como: partida desde `Qwen3.5-4B-Base`, continuacion del preentrenamiento (CPT) con un corpus de gascon descrito como "enrichie", y un ajuste supervisado (SFT) final. No se especifican el numero de tokens vistos en cada fase, la composicion del dataset, la mezcla de datos en castellano/frances/occitano, ni si hubo etapas de alineacion tipo RLHF o DPO. Tampoco se documenta el tokenizador resultante ni si se amplio el vocabulario para el gascon.

El artefacto incluye un fichero `BF16-mmproj.gguf`, lo que implica que el modelo incorpora una torre o proyector visual y que el autor lo considera un vision-language model (asi aparece etiquetado). La conversion a GGUF se realizo con Unsloth y el resultado es consumible tanto por `llama-cli` en modo texto como por `llama-mtmd-cli` en modo multimodal, ambos con el flag `--jinja` para aplicar la plantilla de chat. No hay informacion sobre innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, modos de razonamiento explicito).

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla aplicada mediante `--jinja`.
- Procesamiento de imagenes combinadas con texto a traves de `llama-mtmd-cli` y el proyector `mmproj` incluido.
- Cobertura reforzada de gascon (occitano) por el ajuste CPT + SFT indicado en el nombre; el alcance real y la calidad no estan documentados.
- Ejecucion local en CPU y GPU mediante llama.cpp, con cinco niveles de cuantizacion para distintos presupuestos de memoria.
- Compatibilidad declarada con endpoints (etiqueta `endpoints_compatible`), lo que sugiere uso via `llama-server` con API compatible con OpenAI.
- Soporte de tool calling / function calling: no documentado.
- Razonamiento multi-paso y comportamiento agentico: no documentado.
- Capacidades de audio o video: no documentadas.
- Modo "thinking" explicito: no documentado.
- Idiomas adicionales al gascon: no disponibles.

## Casos de uso

- Procesamiento de textos en gascon: normalizacion, resumen y respuesta a preguntas sobre documentos en esta lengua, aprovechando el CPT especifico. Es el escenario para el que el modelo fue disenado segun su nombre.
- Digitalizacion de patrimonio linguistico: transcripcion asistida y anotacion de corpus orales transcritos en occitano gascon, con el modelo como preetiquetador antes de revision humana.
- Asistente educativo para lenguas minoritarias: generacion de ejercicios, glosas y traducciones de apoyo gascon-frances o gascon-castellano, siempre con supervision docente dada la ausencia de evaluacion.
- Experimentacion multimodal ligera en local: descripcion de imagenes y VQA basica sobre un portatil con GPU de 8 GB usando Q4_K_M y `llama-mtmd-cli`.
- Base para fine-tuning posterior: al ser un modelo de 4 B en GGUF y con lineage Qwen, sirve como punto de partida o referencia para proyectos de adaptacion de lenguas de bajos recursos.
- Despliegue en entornos sin conectividad: inferencia en CPU con Q2_K_L o Q3_K_M para prototipos de demostracion en ferias, aulas o dispositivos de campo.
- Investigacion sobre olvido catastrofico: comparar el rendimiento del modelo frente al Qwen3.5-4B-Base original para medir cuanto castellano o ingles se degrada tras el CPT en gascon.
- Pruebas de regresion de pipelines llama.cpp: validar plantillas Jinja, servidores compatibles con OpenAI y el flujo `mmproj` en integracion continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna evaluacion multilingue o multimodal, y no existe informacion sobre perplexity en gascon ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 4,21 B de parametros, no de tamanos de fichero publicados):
  - BF16: ~8,4 GB solo de pesos, mas el proyector `mmproj`; en la practica 10-12 GB de VRAM.
  - Q6_K: ~3,5 GB de pesos; ~5-6 GB con contexto moderado.
  - Q4_K_M: ~2,6 GB de pesos; ~4-6 GB con contexto moderado.
  - Q3_K_M: ~2,1 GB de pesos; ~3-4 GB.
  - Q2_K_L: ~1,7 GB de pesos; ~2,5-3 GB, viable en CPU.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para BF16 con lotes grandes; RTX 4090 o RTX 3090 para BF16 con contexto corto o Q6_K; RTX 4060 Ti 16 GB, RTX 3060 12 GB y RTX 4070 para Q4_K_M.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 6 GB o mas usando Q4_K_M, y en 4 GB con Q2_K_L/Q3_K_M.
- Opciones de despliegue: `llama-cli` (texto), `llama-mtmd-cli` (multimodal), `llama-server` con API compatible con OpenAI, importacion en Ollama o LM Studio a partir del GGUF. vLLM y TGI tienen soporte limitado o experimental de GGUF y no se recomiendan como via principal para este artefacto.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud, un modelo denso de 4 B en Q4_K_M suele generar decenas de tokens por segundo en GPU de consumo y un rango de unidades a decenas en CPU, pero no hay mediciones publicadas para esta variante concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-4B-Base CPT Gascon + SFT, GGUF) | ~4,21 B | no disponible | no disponible | GGUF (5 cuantizaciones), 0 descargas | Ajuste en gascon, sin evaluacion publica |
| Qwen3-4B (base / instruct) | ~4,0 B | 32k nativo | Apache 2.0 | safetensors, GGUF oficial | Referencia de la familia; multilingue y con benchmarks publicados |
| Llama 3.2 3B Instruct | ~3,2 B | 128k | Llama 3.2 Community License | safetensors, GGUF | Menor en parametros, contexto mucho mayor, licencia con restricciones de uso |
| Gemma 3 4B | ~4 B | 128k | Gemma Terms of Use | safetensors, GGUF | Multimodal nativo, con benchmarks publicados |
| Phi-4-mini | ~3,8 B | 128k | MIT | safetensors, GGUF | Enfocado a razonamiento y matematicas |

Los datos de los modelos comparables provienen de sus model cards publicas y deben verificarse contra la version vigente. El modelo objeto de esta ficha no permite comparacion cuantitativa porque carece de cualquier evaluacion publicada; ademas, al derivar de un hipotetico Qwen3.5-4B-Base cuya ficha no se ha consultado en esta busqueda, la comparacion con Qwen3-4B es solo orientativa por tamano.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni perplexity, ni pruebas de regresion que respalden la calidad del ajuste en gascon o en cualquier otro idioma.
- Riesgo de olvido catastrofico: un CPT sobre un corpus de una lengua minoritaria en un modelo de 4 B puede degradar de forma notable el rendimiento en castellano, ingles y codigo respecto al base. No hay datos que lo cuantifiquen.
- Licencia no declarada: no se especifica ni la licencia del artefacto ni la del modelo base. No debe asumirse uso comercial permitido; es necesario contactar con el autor o rastrear el lineage hasta el Qwen3.5-4B-Base original.
- Riesgo de alucinacion: inherente a modelos de este tamano, agravado por el ajuste en un dominio linguistico con pocos datos y por la ausencia de etapas de alineacion documentadas.
- Idiomas no declarados: se desconoce el soporte real de castellano, frances, ingles u otras lenguas tras el ajuste.
- Longitud de contexto desconocida: impide planificar casos de uso con documentos largos; conviene asumir valores conservadores hasta verificarlo.
- Fecha de publicacion adelantada en los metadatos (octubre de 2026), lo que puede indicar un artefacto de prueba o un repositorio con fechas manipuladas.
- Repositorio sin traccion (0 descargas, 0 likes): sin senales de uso real, sin issues ni validacion de la comunidad.
- La model card es una plantilla generica de Unsloth y no documenta el proceso de entrenamiento, los datos ni las limitaciones conocidas.
- Naturaleza multimodal no verificada: la presencia de `mmproj` y la etiqueta `vision-language-model` sugieren vision, pero no se especifica que encoder visual se usa ni con que datos se entreno el proyector.
- Las busquedas web realizadas no devolvieron ningun resultado relacionado con el modelo: todos los enlaces encontrados corresponden a un espacio de oficinas homonimo ("Le Next", Palaiseau), por lo que no se han podido verificar papers, blogs ni demos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Kadabra/Qwen3.5-4B-Base-CPT-Gascon-Enrichie-SFT-GGUF
- Unsloth (herramienta de conversion a GGUF citada por el autor): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia y `llama-mtmd-cli`): https://github.com/ggml-org/llama.cpp
- Paper, blog, repositorio auxiliar o demo del modelo: no disponible
- Resultados de busqueda web: sin coincidencias relevantes; los enlaces devueltos corresponden a un inmueble de oficinas llamado "Le Next" en Palaiseau, sin relacion con el modelo.
