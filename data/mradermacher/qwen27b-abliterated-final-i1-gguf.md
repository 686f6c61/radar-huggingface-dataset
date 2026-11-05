# mradermacher/qwen27b-abliterated-final-i1-GGUF

## Resumen

`mradermacher/qwen27b-abliterated-final-i1-GGUF` es una coleccion de cuantizaciones GGUF del modelo `kernnadab/qwen27b-abliterated-final`, publicada por el usuario mradermacher, conocido en HuggingFace por generar versiones cuantizadas (con y sin imatrix) de modelos abiertos. El modelo base es una variante "abliterated" (es decir, con las direcciones de rechazo eliminadas mediante tecnicas de abliteration) de un modelo de la familia Qwen, segun indica el nombre, aunque el tamano real declarado en safetensors es de aproximadamente 7.615 millones de parametros, no 27B como sugiere el nombre.

El repositorio contiene unicamente ficheros GGUF cuantizados con la herramienta de llama.cpp, generados a partir del modelo base en formato HuggingFace. Se trata, por tanto, de un artefacto de distribucion para inferencia local, no de un modelo entrenado desde cero: no hay informacion sobre el dataset de entrenamiento, el proceso de alineamiento ni los benchmarks del modelo original.

La relevancia de este repositorio es limitada y practica: ofrece versiones ligeras (desde Q2_K de unos 3.1 GB) para ejecutar el modelo en hardware de consumo. La informacion publicada es muy escasa, no se declara licencia y el modelo base no incluye documentacion tecnica detallada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only de la familia Qwen, no confirmado) |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Parametros activos | no aplica (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (quants i1/imatrix) |
| Idiomas soportados | en (segun model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (multiples ficheros por cuantizacion); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `kernnadab/qwen27b-abliterated-final` en la documentacion proporcionada. Por el nombre y el tamano (7,6B parametros), es plausible que se trate de un modelo de la familia Qwen2 o Qwen2.5 de 7B, pero esto no esta confirmado en la informacion disponible. El termino "abliterated" indica que el modelo base ha sido modificado mediante tecnicas de abliteration (eliminacion de la direccion de rechazo en el espacio de activaciones) para reducir las negativas a peticiones, aunque no se documenta el metodo exacto ni los datos utilizados.

El repositorio de mradermacher no contiene informacion sobre el entrenamiento original: no se especifican tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO o cualquier otra fase de alineamiento. Las cuantizaciones se han generado con llama.cpp usando ficheros imatrix (importance matrix) para mejorar la calidad de las versiones de baja precision, segun indica la model card.

## Capacidades

- Generacion de texto conversacional en ingles (unico idioma declarado).
- Razonamiento y respuesta a instrucciones, presumiblemente heredadas del modelo base Qwen, aunque no se detalla.
- Generacion de codigo y matematicas: no confirmado explicitamente en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponible.
- Modo "thinking" o razonamiento extendido: no disponible.
- Capacidad "abliterated": el modelo base ha sido modificado para reducir rechazos, lo que cambia el comportamiento en prompts sensibles (ver limitaciones).

## Casos de uso

- Inferencia local en hardware de consumo: las cuantizaciones Q4_K_M o IQ4_XS (en torno a 4-5 GB) permiten ejecutar un modelo de ~7,6B en GPUs con 6-8 GB de VRAM o en CPU con llama.cpp, util para prototipos y pruebas offline.
- Experimentacion con modelos "abliterated": investigadores interesados en estudiar el efecto de la abliteration sobre el comportamiento del modelo pueden usar estas cuantizaciones para comparar respuestas frente al modelo original sin modificar.
- Despliegue en entornos con recursos limitados: la version Q2_K (~3,1 GB) permite ejecutar el modelo en dispositivos con poca memoria, a costa de perdida de calidad.
- Generacion de texto creativo y conversacional en ingles: el modelo esta etiquetado como "conversational" y puede usarse para chat y redaccion en ingles.
- Fine-tuning o evaluacion comparativa de cuantizaciones: el fichero imatrix incluido permite generar cuantizaciones propias y evaluar el impacto de la cuantizacion en la calidad.
- Base para pipelines de inferencia con llama.cpp u Ollama: al ser GGUF, se integra directamente en herramientas de inferencia local estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de ~7,6B parametros):
  - Q2_K (~3,1 GB): aproximadamente 3,5-4 GB de VRAM con contexto corto.
  - Q4_K_M / IQ4_XS (estimado ~4,5-5 GB): aproximadamente 5-6 GB de VRAM.
  - Q6_K (estimado ~6-6,5 GB): aproximadamente 7-8 GB de VRAM.
  - Q8_0 / FP16: no incluidos en este repositorio; FP16 requeriria ~15 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB de VRAM para cuantizaciones Q4 o inferiores; las versiones Q2 caben en 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa en la mayoria de configuraciones.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/qwen27b-abliterated-final-i1-GGUF | ~7,6B | no disponible | no disponible | GGUF | Cuantizaciones imatrix de un modelo abliterated |
| Modelo base kernnadab/qwen27b-abliterated-final | ~7,6B | no disponible | no disponible | safetensors | Modelo original sin cuantizar |
| mradermacher/qwen27b-abliterated-final-GGUF | ~7,6B | no disponible | no disponible | GGUF | Cuantizaciones estaticas (sin imatrix) del mismo modelo |
| Qwen2.5-7B-Instruct (referencia de la familia) | ~7,6B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 (segun documentacion publica) | safetensors, GGUF | Modelo original no abliterated; comparacion orientativa, no confirmada como base exacta |

La comparacion con Qwen2.5-7B-Instruct es orientativa: el nombre del repositorio sugiere una base Qwen, pero la informacion disponible no confirma que el modelo base sea exactamente Qwen2.5-7B.

## Limitaciones y advertencias

- La abliteration reduce los rechazos del modelo, lo que puede aumentar el riesgo de generar contenido danino, sesgado o inapropiado; no se ha realizado una evaluacion de seguridad documentada.
- Riesgo de alucinacion: no cuantificado; al ser un modelo de ~7,6B, es esperable un riesgo moderado-alto en tareas factuales, aunque no hay datos.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base antes de usarlo en produccion.
- El nombre "qwen27b" es enganoso: los parametros reales son ~7,6B, no 27B; conviene no confundir el modelo con variantes de mayor tamano.
- Las cuantizaciones de baja precision (Q2, IQ2, IQ1) degradan notablemente la calidad; para uso serio se recomienda Q4_K_M o superior.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- No hay informacion sobre contexto maximo soportado, lo que impide planificar aplicaciones con ventanas largas.
- El autor del modelo base (`kernnadab`) no documenta el proceso de abliteration ni los datos de entrenamiento en la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/qwen27b-abliterated-final-i1-GGUF
- Modelo base: https://huggingface.co/kernnadab/qwen27b-abliterated-final
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/qwen27b-abliterated-final-GGUF
- Pagina de overview del autor: https://hf.tst.eu/model#qwen27b-abliterated-final-i1-GGUF
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
