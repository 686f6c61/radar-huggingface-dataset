# alphaZimuth/Index-Translate-35B-A3B-preview-APEX-GGUF

## Resumen

Index-Translate-35B-A3B-preview-APEX-GGUF es el conjunto de cuantizaciones GGUF de terceros del modelo IndexTeam/Index-Translate-35B-A3B-preview, publicadas por el usuario alphaZimuth (XYLong) bajo licencia Apache-2.0. El modelo original es un transformer de mezcla de expertos (MoE) disperso desarrollado por el equipo Index LLM de Bilibili, con 35.000 millones de parametros totales y aproximadamente 3.000 millones activos por token, construido sobre la base Qwen3.5 y especializado en traduccion multilingue de texto en torno a 150 idiomas.

Este repositorio no contiene un modelo nuevo, sino cuatro niveles de cuantizacion APEX-I (Nano, Mini, Compact y Quality) generados con llama.cpp y asistidos por una matriz de importancia (imatrix) calibrada especificamente con datos de traduccion multilingue en lugar de texto generico. La relevancia practica esta en el ahorro de memoria: el modelo original en precision completa ocupa del orden de 70 GB, mientras que estas versiones reducen el peso a entre 11,6 y 21,8 GiB, lo que permite ejecutar un modelo de traduccion de 35B en una unica GPU de consumo.

El modelo base se publico el 30 de septiembre de 2026 junto con hermanos densos de 2B y 9B, checkpoints de voz (familia Echo) y una demo en linea, y soporta instrucciones de traduccion con restricciones duras y blandas (terminologia, formato, estilo, estructura y longitud de salida) mediante el sistema instTrans. Esta ficha se centra en la distribucion cuantizada, pero describe el comportamiento del modelo subyacente porque determina las capacidades reales del artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) dispersa, base Qwen3.5; etiqueta `qwen3_5_moe` |
| Parametros totales | 35B |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens en el modelo base (los ejemplos oficiales se sirven a 32K); no confirmado para este GGUF |
| Tipos de cuantizacion | APEX-I en cuatro niveles: Nano (11,6 GiB), Mini (12,9 GiB), Compact (15,9 GiB), Quality (21,8 GiB), todos asistidos por imatrix |
| Idiomas soportados | Aproximadamente 150 idiomas (modelo base); la calibracion imatrix cubre 146 de ellos |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es un MoE disperso construido sobre el backbone Qwen3.5: 35B parametros totales de los que se activan unos 3B por token, una receta estandar de MoE disperso que busca calidad de modelo grande con coste de inferencia de modelo pequeno. La familia Index-Translate incluye ademas hermanos densos de 2B y 9B para texto y checkpoints separados de 2B y 9B para la familia Echo (speech-to-text/speech-to-speech, segun las notas de prensa). No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; estos datos no aparecen en la informacion disponible.

Lo especifico de este repositorio es el proceso de cuantizacion. Se genero una matriz de importancia con dos corpus complementarios: uno multilingue disenado para cobertura amplia y uniforme (229 chunks) y otro ponderado hacia 22 idiomas nucleares (220 chunks), fusionados en una unica imatrix de 449 chunks. Los dos conjuntos contienen documentos 100 % unicos y en conjunto cubren 146 de los 150 idiomas del modelo. Las muestras de calibracion siguen una estructura orientada a traduccion (instruccion de traduccion, texto origen, traduccion de referencia) e incluyen ejemplos de traduccion restringida para consistencia terminologica, preservacion de JSON y marcadores de posicion y salida estructurada. Esa imatrix fusionada se uso para los cuatro niveles APEX-I. El autor advierte explicitamente que la perplejidad registrada durante la generacion de la imatrix es solo un diagnostico de salud de la calibracion y no debe interpretarse como una metrica de calidad del modelo cuantizado.

## Capacidades

- Traduccion de texto en aproximadamente 150 idiomas, con el modelo base entrenado especificamente para esta tarea.
- Traduccion restringida (instTrans): soporta restricciones duras como cumplimiento de glosarios y terminologia obligatoria, preservacion de estructuras JSON, CSV, Markdown y codigo, y mantenimiento de variables y marcadores de posicion.
- Restricciones blandas: control de tono, estilo de escritura, vocabulario especifico de dominio, desambiguacion contextual y consistencia entre frases.
- Combinacion de restricciones duras y blandas en una misma peticion.
- Control de longitud de salida como parte de las instrucciones de traduccion.
- Modo conversacional (etiqueta `conversational`) con plantilla de chat Jinja, activable con `--jinja`.
- Conmutador de razonamiento: el modo "thinking" se puede activar o desactivar mediante `chat-template-kwargs`; para traduccion se recomienda desactivarlo.
- Capacidad multimodal: la model card de este repositorio remite al repositorio oficial de IndexTeam para los ficheros de proyector multimodal si se necesita entrada de imagen; esta distribucion GGUF es solo de texto.
- No se documenta en la informacion disponible soporte de tool calling, function calling ni uso agentico; no debe asumirse.

## Casos de uso

- Traduccion de documentacion tecnica con glosario fijo: usando restricciones duras se puede forzar una terminologia concreta (por ejemplo, nombres de API o terminos de dominio) para que la traduccion sea consistente con el manual de estilo de la organizacion, algo critico en documentacion de producto.
- Localizacion de contenido web y marketing: las restricciones blandas permiten fijar tono y registro por mercado, y ajustar la longitud de salida a los limites de caracteres de banners, metadescripciones o botones de interfaz.
- Traduccion de ficheros estructurados en pipelines de CI/CD: al preservar JSON, CSV, Markdown y marcadores de posicion, el modelo puede integrarse en un proceso automatizado que traduzca ficheros de recursos i18n sin romper claves ni variables de plantilla.
- Traduccion de documentacion juridica o medica asistida: la combinacion de glosario obligatorio y desambiguacion contextual ayuda a mantener coherencia terminologica entre secciones largas, aprovechando la ventana de contexto del modelo base.
- Atencion al cliente multilingue: traduccion en tiempo real de tickets y conversaciones multi-turno en cualquiera de los idiomas soportados, autoconsumo en una GPU unica, con el modo thinking desactivado para reducir latencia.
- Subtitulado y post-edicion de transcripciones: traduccion de segmentos cortos con temperatura 0 para salidas deterministas y consistentes entre fragmentos consecutivos.
- Servicio interno de traduccion autoalojado: desplegado con `llama-server` en modo compatible con OpenAI, se puede exponer como API interna para equipos que no quieren enviar texto a proveedores externos, un requisito habitual en sectores regulados.
- Evaluacion y comparacion de esquemas de cuantizacion: los cuatro niveles publicados permiten medir el impacto de la compresion sobre calidad de traduccion en un mismo modelo, algo util para investigacion sobre cuantizacion asistida por imatrix.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas tipo MMLU, HumanEval, GSM8K ni BLEU/COMET para traduccion, y senala expresamente que la perplejidad de calibracion no debe usarse como benchmark de calidad. Las notas de prensa mencionan la existencia de un informe tecnico y una demo en linea, pero no reproducen cifras.

## Requisitos de hardware

- VRAM estimada segun fichero (sin contar cache KV ni buffers de computo, que crecen con la longitud de contexto):
  - APEX-I-Nano: 11,6 GiB de pesos; margen recomendado a partir de 16 GB de VRAM.
  - APEX-I-Mini: 12,9 GiB de pesos; margen recomendado a partir de 16 GB de VRAM.
  - APEX-I-Compact: 15,9 GiB de pesos; margen recomendado a partir de 24 GB de VRAM para contextos medios.
  - APEX-I-Quality: 21,8 GiB de pesos; requiere 24 GB con contexto corto o 40/80 GB para contextos largos.
- GPU adecuadas: RTX 4090 / RTX 4080 (16-24 GB) cubren Nano, Mini y, con holgura variable, Compact; para Quality en contexto largo son preferibles A100 40 GB, A100 80 GB, H100 o L40S.
- Cabe en GPU de consumo: si, al menos las variantes Nano, Mini y Compact en tarjetas de 16-24 GB. Un modelo de 35B en bf16 (del orden de 70 GB) no cabe en ninguna GPU de consumo.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), llama-cpp-python, Ollama y LM Studio mediante importacion del GGUF. El modelo base se autoaloja con vLLM, pero esa ruta no aplica directamente a estos ficheros GGUF.
- Parametros de inferencia recomendados por el autor: decodificacion greedy con `--temp 0`, plantilla Jinja activada y `enable_thinking=false`.
- Latencia y throughput: no disponibles. Al ser un MoE con unos 3B parametros activos por token, el coste por token es notablemente inferior al de un denso de 35B, pero no se han publicado mediciones concretas para estas cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Index-Translate-35B-A3B-preview-APEX-GGUF (esta ficha) | 35B totales / 3B activos, cuantizado | Heredado del base (262.144 tokens declarados) | GGUF APEX-I (4 niveles, 11,6-21,8 GiB) | Apache-2.0 | Hugging Face, autor alphaZimuth |
| IndexTeam/Index-Translate-35B-A3B-preview (base) | 35B totales / 3B activos | 262.144 tokens (servido a 32K en ejemplos oficiales) | bf16, del orden de 70 GB | Apache-2.0 | Hugging Face y ModelScope, equipo oficial Bilibili |
| IndexTeam/Index-Translate-35B-A3B-preview-GGUF (oficial) | 35B totales / 3B activos | Igual que el base | GGUF oficial (incluye ficheros de proyector multimodal) | Apache-2.0 | Hugging Face, repositorio oficial |
| Hermanos densos Index-Translate 2B y 9B | 2B y 9B densos | No disponible | No disponible | Apache-2.0 (familia) | Hugging Face, equipo oficial |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a otros sistemas de traduccion comerciales, por lo que la comparacion se limita a parametros, formato, licencia y disponibilidad. Las cuantizaciones de terceros no incluyen ficheros de proyector multimodal, a diferencia del repositorio oficial.

## Limitaciones y advertencias

- Este repositorio es una publicacion de terceros y no un repositorio oficial de IndexTeam; el autor lo indica explicitamente.
- Las cuantizaciones introducen perdida de calidad respecto al modelo en bf16. El propio autor desaconseja el nivel Nano ("near-limit quantization; not generally recommended") y recomienda Compact como punto de partida.
- La perplejidad de calibracion no es una metrica de calidad; no hay evaluacion independiente publicada de estos GGUF.
- Los cuatro niveles cuantizados no incluyen el proyector multimodal: la capacidad de entrada de imagen requiere los ficheros del repositorio oficial de IndexTeam.
- La calibracion de la imatrix cubre 146 de los 150 idiomas declarados, de modo que los cuatro idiomas restantes no estuvieron representados en la seleccion de importancia y podrian degradarse mas con la cuantizacion.
- El prompt de traduccion recomendado por el autor esta redactado en chino; el comportamiento con instrucciones en otros idiomas debe validarse empiricamente antes de llevarlo a produccion.
- El modelo esta especializado en traduccion; no debe esperarse razonamiento general, generacion de codigo ni capacidades agenticas de nivel generalista, aunque la arquitectura base sea Qwen3.5.
- Como todo modelo de traduccion, existe riesgo de alucinacion, de omision de contenido y de invencion de terminos, especialmente con textos muy largos o poco representados; el uso de temperatura 0 reduce la variabilidad, no el riesgo.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion disponible; se recomienda auditoria propia por dominio e idioma.
- La licencia Apache-2.0 del modelo base permite uso comercial, pero conviene verificar los terminos de Qwen3.5 como backbone y los de cualquier dato de calibracion antes de un despliegue comercial.
- Los parametros concretos de arquitectura del MoE (numero de expertos, expertos activados por token, numero de capas y cabezas) no estan disponibles en la informacion proporcionada, lo que impide calcular con precision el tamano de la cache KV.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/alphaZimuth/Index-Translate-35B-A3B-preview-APEX-GGUF
- Perfil del autor (alphaZimuth / XYLong): https://huggingface.co/alphaZimuth
- Modelo base: https://huggingface.co/IndexTeam/Index-Translate-35B-A3B-preview
- Repositorio previo del modelo base: https://huggingface.co/IndexTeam/Index-Translate-35B-A3B-preview-before-replacement-20261003
- GGUF oficial de IndexTeam: https://huggingface.co/IndexTeam/Index-Translate-35B-A3B-preview-GGUF
- Informe tecnico "Index-Translate: A Multilingual Translation Model Family": arXiv 2609.40181, https://arxiv.org/abs/2609.40181
- Codigo del proyecto: repositorio bilibili/Index-Translate (referenciado en la model card, sin URL directa proporcionada)
- Ficha en LLM Releases: https://www.llm-releases.com/models/index-translate-35b-a3b-preview
- Cobertura en AI Weekly: https://aiweekly.co/alerts/bilibili-open-sources-index-translate-35b-moe-for-150-languages
- Analisis en AI Modeling: https://www.aimodeling.com/en/news/slug/bilibili-index-translate-35b-moe
