# 0xrushi/Llama-3-8B-Open-CAD-Tokenizer-plaintext-lora

## Resumen

Llama-3-8B Open-CAD-Tokenizer es un adaptador LoRA (rank 32) construido sobre `meta-llama/Meta-Llama-3-8B` y publicado por el usuario 0xrushi dentro del proyecto Open-CAD-Tokenizer, una reimplementación independiente de CAD-Tokenizer. El adaptador especializa el modelo base para tareas de generación y edición de CAD (diseño asistido por ordenador) a partir de instrucciones en lenguaje natural, emitiendo como salida un programa SEM en texto plano (secuencia de operaciones de sketch y extrude) que se interpreta con un kernel CAD como CadQuery/OCP.

El modelo no modifica el tokenizador de LLaMA: utiliza el tokenizador estándar del modelo base para representar el programa CAD como texto, de ahí la denominación "plaintext". Se trata de un checkpoint intermedio (el número 3056) de la ejecución baseline del proyecto, orientado a investigadores que quieran reproducir o extender el trabajo de CAD-Tokenizer sin depender del release oficial de los autores.

Su relevancia es acotada: no es un modelo de propósito general, sino un artefacto de investigación con cero descargas y cero likes en el momento de la ficha, sin pipeline declarado y con un benchmark de desarrollo propio (200 casos de generación y 800 de edición) que el propio autor advierte que no es comparable al del paper. La generación sigue siendo débil, con un 14 % de salidas inválidas en la evaluación del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LLaMA 3) con adaptador LoRA de rank 32 |
| Parametros totales | 8 030 millones (modelo base); el adaptador LoRA no se especifica en la información disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base LLaMA 3 soporta 8 192 tokens; el adaptador no lo declara) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento no se detallan; el modelo base es multilingüe) |
| Licencia | llama3 (Meta Llama 3 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere los pesos base de `meta-llama/Meta-Llama-3-8B` por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only LLaMA 3 de 8 000 millones de parámetros mediante PEFT/LoRA con rank 32. La innovación no está en la arquitectura del modelo, sino en la representación del CAD: en lugar de un tokenizador específico de geometría, se serializa el programa CAD como texto plano (programa SEM con operaciones `line`, `add`, `extrude`, etc.) y se entrena al modelo para generarlo o editarlo con el tokenizador ordinario de LLaMA. Esto simplifica el pipeline y permite reutilizar infraestructura estándar de transformers y PEFT.

Los datos de entrenamiento se reconstruyeron a partir de SkexGen, CADFusion y CAD-Editor, recursos que mantienen sus propios términos de uso. No se especifican en la model card el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. El checkpoint publicado corresponde a la iteración 3056 de la ejecución baseline del proyecto. El proyecto incluye utilidades propias (`cadtokenizer/vanilla.py` para plantillas de prompt y `cadtokenizer` para validación con kernel CAD), lo que sugiere que el entrenamiento y la evaluación se apoyan en validación geométrica contra CadQuery/OCP.

## Capacidades

- Generación de CAD a partir de instrucciones en lenguaje natural: produce programas SEM (secuencia de sketch y extrude) que pueden interpretarse con un kernel CAD.
- Edición de CAD guiada por instrucciones: recibe un programa SEM de origen y una instrucción de edición, y emite el programa modificado.
- Formato de prompt explícito para dos tareas: `Task: CAD generation` y `Task: CAD editing`, con secciones `Instruction`, `Original CAD` (solo en edición) y `Output CAD`.
- Uso del tokenizador estándar de LLaMA 3, sin tokenizador geométrico especializado.
- Integración con el ecosistema transformers + PEFT para carga del adaptador.
- No se declaran capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles; las instrucciones de entrenamiento no se documentan.

## Casos de uso

- Prototipado de generación CAD en investigación: el adaptador permite experimentar con la representación SEM en texto plano sin implementar un tokenizador específico, reutilizando el stack estándar de transformers y PEFT. Adecuado para reproducir o comparar variantes del pipeline de CAD-Tokenizer.
- Edición iterativa de piezas existentes: dado un programa SEM y una instrucción de modificación (por ejemplo, cambiar una dimensión o añadir una operación), el modelo emite el programa editado. La métrica de edición del autor (3,125 % de salidas inválidas, F1-Skt 94,49) sugiere que este es el caso de uso más maduro del adaptador.
- Generación de datasets sintéticos de CAD: usar el modelo para producir programas SEM candidatos que luego se filtran con validación de kernel (CadQuery/OCP) y se incorporan a pipelines de datos para entrenar o evaluar otros modelos.
- Asistente de diseño paramétrico en entornos controlados: integrado en una herramienta interna que valide cada salida contra el kernel antes de mostrarla al usuario, el modelo puede traducir descripciones textuales en secuencias de sketch y extrude editables.
- Evaluación comparativa de representaciones CAD: sirve como baseline "plaintext" frente a variantes con tokenizador específico dentro del proyecto Open-CAD-Tokenizer, para medir el impacto de la representación en validez y fidelidad estructural.
- Docencia e investigación sobre modelos especializados: al ser un adaptador pequeño (repo de 0,3 GB) sobre un base abierto con licencia Llama 3, es un caso práctico para estudiar fine-tuning con LoRA en dominios estructurados y la brecha entre validez sintáctica y precisión dimensional.

## Benchmarks y rendimiento

Resultados del benchmark propio del autor (decodificación greedy, 1 024 tokens de salida permitidos, escala ×100 para CD/COV/JSD/MMD). El autor advierte que es un benchmark de desarrollo y no el test set del paper.

| Tarea | Invalid % | F1-Skt | F1-Ext | CD | COV | JSD | MMD |
|---|---:|---:|---:|---:|---:|---:|---:|
| Generación (200 casos) | 14,000 | 81,98 | 88,34 | 42,11 | 29,76 | 18,24 | 6,19 |
| Edición (800 casos) | 3,125 | 94,49 | 96,72 | 6,38 | 59,24 | 1,25 | 1,27 |

No se han publicado en la información disponible resultados en benchmarks estándar de propósito general (MMLU, HumanEval, GSM8K u otros) para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base. En bfloat16, LLaMA 3 8B requiere aproximadamente 16 GB de VRAM para los pesos, más overhead de activaciones y caché KV; el adaptador LoRA añade una cantidad marginal (repo de 0,3 GB).
- GPU recomendadas: A100 40/80 GB, H100 para despliegues con lotes grandes o contexto largo; RTX 4090 (24 GB) suficiente para inferencia en bfloat16 de una sola instancia.
- GPU de consumo: cabe en RTX 4090 y en GPUs con 16 GB o más en bfloat16; en cuantización de 8 bits o 4 bits del modelo base podría ajustarse en GPUs de 12 GB o menos, aunque el adaptador no documenta cuantizaciones probadas.
- Opciones de despliegue: transformers + PEFT (flujo documentado por el autor); vLLM, llama.cpp u Ollama requerirían fusionar el adaptador con el modelo base y, en el caso de llama.cpp/Ollama, convertir a GGUF, pasos no documentados en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3-8B Open-CAD-Tokenizer (este) | 8B + LoRA rank 32 | no disponible | Generación/edición CAD vía programa SEM en texto plano | llama3 | Hugging Face, 0 descargas |
| CAD-Tokenizer (release de los autores) | no disponible en la información | no disponible | Tokenizador específico de CAD | no disponible | Paper arXiv:2509.21150; release no confirmado en la información |
| LLaMA 3 8B base | 8B | 8 192 tokens | Modelo de propósito general | llama3 | Hugging Face (Meta) |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; el autor señala explícitamente que sus números no son comparables con los del paper de CAD-Tokenizer.

## Limitaciones y advertencias

- Generación débil: un 14 % de las salidas del benchmark propio no son sólidos válidos; es obligatorio validar con kernel CAD (CadQuery/OCP) y previsualizar la geometría antes de cualquier uso.
- Las métricas de validez y F1 estructural no miden precisión dimensional ni fidelidad a la instrucción; el autor advierte que las descripciones numéricas de edición en los datos de entrenamiento son a veces ambiguas o inconsistentes.
- La salida es un programa SEM (secuencia de sketch/extrude), no geometría STEP arbitraria; no cubre todo el espacio de modelos CAD.
- Benchmark de desarrollo propio (200 + 800 casos) que informó los experimentos del autor; no es el test set del paper y sus cifras no son comparables con las publicadas en arXiv:2509.21150.
- Checkpoint intermedio (iteración 3056) de una ejecución baseline; no se declara como versión final.
- Licencia Llama 3 Community License: impone restricciones de uso comercial y obligaciones de atribución; los datos de entrenamiento provienen de SkexGen, CADFusion y CAD-Editor, cada uno con sus propios términos.
- Los pesos base no se incluyen; se requiere acceso propio a `meta-llama/Meta-Llama-3-8B`.
- Sin datos sobre sesgos, idiomas de instrucción ni comportamiento fuera del dominio CAD; sin descargas ni validación comunitaria.
- Proyecto de investigación sin pipeline declarado ni soporte; no recomendado para producción sin validación exhaustiva y sin revisión legal de la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/0xrushi/Llama-3-8B-Open-CAD-Tokenizer-plaintext-lora
- Paper CAD-Tokenizer: https://arxiv.org/abs/2509.21150
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B
- Licencia Meta Llama 3: https://llama.meta.com/llama3/license/
- SkexGen: https://github.com/samxuxiang/SkexGen
- CADFusion: https://github.com/microsoft/CADFusion
- CAD-Editor: https://github.com/microsoft/CAD-Editor
