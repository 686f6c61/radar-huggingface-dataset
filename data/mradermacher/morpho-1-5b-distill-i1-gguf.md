# mradermacher/Morpho-1.5B-Distill-i1-GGUF

## Resumen

Morpho-1.5B-Distill-i1-GGUF es una colección de cuantizaciones GGUF con imatrix (matriz de importancia) del modelo Morpho-1.5B-Distill, desarrollado por bluemorpholimited y cuantizado por el usuario mradermacher. El modelo base es un modelo de 1.500 millones de parámetros obtenido mediante destilación (distillation) a partir de un modelo de gran tamaño, según sugieren los tags "distillation" y "180b" que acompañan al repositorio, lo que indicaría que se destiló desde un modelo maestro de unos 180.000 millones de parámetros.

Este repositorio no es el modelo original, sino la versión cuantizada orientada a inferencia local eficiente: incluye más de 20 variantes de cuantización, desde IQ1_S (0,5 GB) hasta Q6_K (1,4 GB), lo que permite ejecutar el modelo en hardware muy modesto, incluidas CPU y GPUs de consumo. Su relevancia radica en la combinación de un tamaño reducido (1.543.714.304 parámetros según safetensors), licencia Apache 2.0 y disponibilidad en formato GGUF, ideal para despliegues en dispositivos con recursos limitados. La información sobre arquitectura, longitud de contexto y capacidades del modelo base no está disponible en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer basado en GGUF/transformers) |
| Parametros totales | 1.543.714.304 (1.5B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones weighted/imatrix); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El repositorio cuantizado no documenta la arquitectura interna del modelo base. Se sabe que Morpho-1.5B-Distill es un modelo de 1.5B parámetros obtenido mediante destilación de conocimiento, y los tags del repositorio incluyen "180b", lo que sugiere que el modelo maestro del que se destiló tenía aproximadamente 180.000 millones de parámetros. La destilación permite transferir capacidades de un modelo grande a uno mucho más pequeño y barato de ejecutar, manteniendo parte de su rendimiento.

Sobre el proceso de cuantización: mradermacher emplea cuantizaciones weighted/imatrix (importance matrix), una técnica que calcula la importancia de cada tensor durante una pasada de calibración para reducir la pérdida de calidad en niveles de bits bajos. Según el propio autor, los cuants IQ (de ikawrakow) suelen ser preferibles a los cuants estáticos de tamaño similar. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional: el repositorio está etiquetado como "conversational", lo que indica soporte para diálogos multi-turno.
- Destilacion de un modelo de gran tamano: hereda capacidades del modelo maestro de ~180B, aunque el detalle concreto de esas capacidades no está documentado.
- Ejecucion local eficiente: al estar en GGUF con más de 20 niveles de cuantización, es compatible con llama.cpp, Ollama y herramientas similares.
- Soporte de la libreria transformers de Hugging Face.
- No hay informacion disponible sobre tool calling, capacidades de agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Chatbots ligeros en local: gracias a su tamaño de 1.5B y cuantizaciones desde 0,5 GB, puede ejecutarse en portátiles sin GPU dedicada para asistentes conversacionales simples.
- Integracion en aplicaciones de escritorio: el formato GGUF permite embeber el modelo en aplicaciones con llama.cpp u Ollama sin depender de servicios en la nube.
- Prototipado rapido en hardware modesto: desarrolladores sin acceso a GPUs de gama alta pueden probar y ajustar prompts con latencias bajas.
- Procesamiento por lotes de texto a bajo coste: para tareas de clasificación o resumen a escala, un modelo de 1.5B cuantizado reduce drásticamente el coste de inferencia.
- Despliegue en dispositivos edge: las variantes IQ1_S/IQ2 (0,5-0,7 GB) permiten su uso en mini-PCs o SBCs con RAM limitada, aceptando la pérdida de calidad que ello implica.
- Base para fine-tuning posterior: al ser Apache 2.0 y tener pesos originales en safetensors, puede usarse como punto de partida para especialización en dominios concretos.
- Generacion de codigo y razonamiento: si el modelo maestro de 180B tenía estas capacidades, la destilación podría haberlas transferido parcialmente, aunque no hay datos que lo confirmen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM para inferencia: entre 0,5 GB (IQ1_S) y 1,4 GB (Q6_K) solo de pesos, mas overhead de contexto (KV cache). Con Q4_K_M (1,1 GB), cualquier equipo con 4-8 GB de RAM es suficiente.
- GPU recomendadas: no requiere GPU; se recomienda Q4_K_M como equilibrio optimo entre tamano, velocidad y calidad segun el autor. En GPUs, cualquier modelo moderno (incluso integradas con memoria compartida) lo ejecuta con holgura.
- Cabe en GPUs de consumo: si, sobradamente. Modelos como una RTX 3060 de 12 GB o incluso una GTX 1650 de 4 GB pueden alojar el cuant Q6_K completo con contexto amplio.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, GPT4All y cualquier runtime compatible con GGUF. El modelo base en safetensors es compatible con transformers y vLLM.
- Latencia y throughput: no disponibles; al ser un modelo de 1.5B cuantizado, se esperan velocidades altas incluso en CPU moderna (del orden de decenas de tokens por segundo), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Morpho-1.5B-Distill (este) | 1.5B | GGUF (imatrix), safetensors | Apache 2.0 | Destilado desde ~180B, 24 cuants disponibles |
| Qwen2.5-1.5B-Instruct | 1.5B | safetensors, GGUF (comunidad) | Qwen license / Apache 2.0 segun variante | Amplio soporte multilingue y benchmarks publicados |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | safetensors, GGUF (comunidad) | MIT | Destilado desde R1, enfocado a razonamiento |
| Phi-3.5-mini (3.8B) | 3.8B | safetensors, GGUF (comunidad) | MIT | Mayor tamano, benchmarks publicados |

Nota: los datos de la comparativa corresponden a caracteristicas generales conocidas de esos modelos; no hay benchmarks comparativos directos con Morpho-1.5B-Distill.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; como todo modelo destilado, hereda los sesgos del modelo maestro y de sus datos de entrenamiento, que no estan descritos.
- Riesgo de alucinacion: tipico de modelos de 1.5B; no hay evaluaciones publicadas que cuantifiquen este riesgo.
- Limitaciones de idioma: el repositorio declara soporte solo para ingles; el rendimiento en castellano no esta evaluado y probablemente sea inferior.
- Longitud de contexto: no disponible; debe verificarse en la config del modelo base antes de producir.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los terminos del modelo original de bluemorpholimited respecto a la destilacion desde el modelo maestro.
- Calidad de cuants bajos: las variantes IQ1_S/IQ1_M/Q2 estan explicitamente marcadas como de calidad muy baja ("for the desperate", "very low quality"); para produccion se recomienda Q4_K_M o superior.
- El repositorio es una cuantizacion de terceros (mradermacher), no el modelo oficial de bluemorpholimited; el soporte y las actualizaciones dependen del cuantizador.

## Enlaces

- Repositorio cuantizado: https://huggingface.co/mradermacher/Morpho-1.5B-Distill-i1-GGUF
- Modelo base: https://huggingface.co/bluemorpholimited/Morpho-1.5B-Distill
- Cuants estaticos del mismo modelo: https://huggingface.co/mradermacher/Morpho-1.5B-Distill-GGUF
- Pagina de descargas resumida: https://hf.tst.eu/model#Morpho-1.5B-Distill-i1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre cuants: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
