# KayaTechAI/Qwen3-1.7B-SFT-Finance-Multi-v4

## Resumen

KayaTechAI/Qwen3-1.7B-SFT-Finance-Multi-v4 es un ajuste fino supervisado (SFT) del modelo Qwen3-1.7B, publicado por el usuario KayaTechAI en HuggingFace. El nombre del repositorio indica que el ajuste esta orientado al dominio financiero y que se ha realizado sobre un modelo base ya cuantizado en 4 bits (unsloth/qwen3-1.7b-unsloth-bnb-4bit), utilizando la libreria Unsloth para acelerar el entrenamiento. Se distribuye bajo licencia Apache-2.0 y declara unicamente el idioma ingles.

Se trata de un modelo denso de aproximadamente 1.700 millones de parametros, por lo que se situa en la gama de modelos pequenos aptos para inferencia en GPU de consumo e incluso en CPU. La model card es minima: no incluye descripcion del dataset de entrenamiento, hiperparametros, numero de tokens vistos, resultados de evaluacion ni instrucciones de uso, mas alla de la atribucion a Unsloth.

Su relevancia es limitada pero concreta: ofrece un punto de partida de bajo coste para experimentar con ajuste fino de dominio financiero sobre Qwen3-1.7B, y demuestra un flujo de trabajo reproducible (Qwen3 + Unsloth + TRL + safetensors). No obstante, el repositorio tiene 0 descargas y 0 likes, ocupa solo 0,2 GB (una cifra anomala para un modelo de 1,7B en precision completa), y no aporta ninguna evidencia empirica de mejora sobre el modelo base, por lo que debe tratarse como un artefacto experimental no validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, decoder-only (familia Qwen3); detalles de capas no declarados en la ficha |
| Parametros totales | 1,7 mil millones (segun el nombre del modelo; la ficha no lo confirma explicitamente) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la ficha; heredada de Qwen3-1.7B segun documentacion publica de la familia Qwen3 |
| Tipos de cuantizacion | el repositorio contiene pesos en safetensors (0,2 GB); el modelo base esta en bnb-4bit. No se publican GGUF ni otras cuantizaciones propias |
| Idiomas soportados | en (ingles), declarado en la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | unsloth/qwen3-1.7b-unsloth-bnb-4bit |
| Librerias declaradas | transformers, trl, unsloth, text-generation-inference |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-09-21 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only denso desarrollado por el equipo Qwen (Alibaba). La ficha no documenta ningun cambio estructural, por lo que se asume que conserva la arquitectura del modelo base, incluido su tokenizador y su esquema de atencion. El modelo base empleado no es el checkpoint oficial en precision completa, sino la conversion de Unsloth cuantizada en 4 bits (bnb-4bit) y optimizada para entrenamiento con QLoRA, lo cual condiciona cualquier comparacion estricta con el Qwen3-1.7B original.

En cuanto al entrenamiento, la unica informacion disponible es que se trata de un ajuste fino supervisado (SFT) realizado con Unsloth y TRL, y que el autor afirma que el entrenamiento fue "2x mas rapido" gracias a Unsloth. No se especifica el dataset utilizado, su composicion, el numero de tokens, el numero de epocas, la tasa de aprendizaje, si hubo etapas de RLHF o DPO, ni si se aplicaron tecnicas como LoRA/QLoRA o ajuste completo. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, modos de razonamiento explicitos) mas alla de las que ya incorpora la familia Qwen3 en su version original.

## Capacidades

- Generacion de texto en ingles, con especializacion declarada (no verificada) en dominio financiero.
- Razonamiento basico y respuesta a instrucciones, heredados del ajuste SFT sobre Qwen3-1.7B.
- Generacion y explicacion de codigo: capacidad propia del modelo base, no confirmada tras el ajuste de dominio.
- Matematicas y calculo: capacidad propia de la familia Qwen3, pero sin evaluacion publicada para este checkpoint.
- Soporte de tool calling / function calling: no confirmado en esta version; depende de si el ajuste fino preservo la plantilla de chat de Qwen3.
- Soporte de agentes y razonamiento multi-paso: no confirmado; sin benchmarks ni ejemplos de uso.
- Capacidades multilingues: no, la ficha declara unicamente ingles (aunque el modelo base Qwen3 es multilingue, el autor solo declara "en").
- Modo "thinking": no declarado. Qwen3 original dispone de modos de razonamiento con y sin pensamiento, pero esta ficha no indica si se conservan.
- Vision y audio: no soportados (modelo exclusivamente de texto).

## Casos de uso

- Extraccion de entidades financieras: procesar notas de prensa, informes trimestrales o articulos y extraer cifras, tickers, fechas y entidades. El modelo es pequeno y barato de ejecutar, adecuado para pipelines de alto volumen donde no se requiere razonamiento complejo.
- Clasificacion de sentimiento y tematica en textos economicos: etiquetar noticias o comentarios de mercado por sector, tono o relevancia, con coste de inferencia muy bajo frente a modelos de mayor tamano.
- Prototipado de asistentes de soporte financiero de primer nivel: respuestas a preguntas frecuentes sobre productos, comisiones o terminologia, siempre con supervision humana y sin uso como asesoramiento financiero autonomo.
- Resumen de documentos largos: condensar informes o transcripciones de llamadas de resultados usando la ventana de contexto heredada del modelo base.
- Generacion de borradores de contenido financiero: plantillas de descripciones de producto, correos informativos o fichas de datos, sujetas a revision editorial.
- Investigacion sobre ajuste fino eficiente: servir como caso de estudio reproducible de un flujo Qwen3 + Unsloth + TRL para comparar tecnicas de SFT de dominio.
- Filtrado previo en un pipeline de RAG: usar el modelo como reranker o filtro de baja latencia antes de invocar un modelo mayor, reduciendo coste por consulta.
- Aprendizaje y docencia: experimentar con un modelo pequeno especializado para entender el impacto del ajuste de dominio en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de ningun tipo (ni MMLU, ni HumanEval, ni GSM8K, ni evaluaciones especificas de dominio financiero como FinanceBench o FiQA), ni comparaciones con el modelo base, ni ejemplos cualitativos de entrada/salida.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 3,5 GB solo de pesos, mas overhead de runtime; en la practica unos 5-6 GB con contexto corto.
- VRAM estimada en cuantizacion 8 bits: alrededor de 2 GB de pesos.
- VRAM estimada en cuantizacion 4 bits: alrededor de 1,1 GB de pesos; aproximadamente 2-3 GB en total con contexto moderado.
- Memoria de cache KV: en fp16 y con la configuracion tipica de Qwen3-1.7B (28 capas, 8 cabezas KV, head dim 128), la cache consume aproximadamente 0,11 MB por token; con 32.768 tokens de contexto puede superar los 3 GB adicionales, por lo que la memoria total depende fuertemente de la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) funciona con holgura en 4 u 8 bits. A100 y H100 solo tienen sentido para servir muchas replicas concurrentes.
- GPU de consumo: si, cabe en practicamente cualquier GPU moderna de 6-8 GB o superior en 4 bits, y en CPU con llama.cpp u Ollama.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag declarado), vLLM, llama.cpp y Ollama previa conversion a GGUF, y SGLang. Unsloth se menciona como herramienta de entrenamiento, no de inferencia.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo, TTFT ni pruebas de carga.

## Comparativa con modelos similares

Los datos de los modelos comparables proceden de su documentacion publica; la columna de este modelo refleja unicamente lo declarado en su ficha, por lo que no existe una comparacion de rendimiento verificable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| KayaTechAI/Qwen3-1.7B-SFT-Finance-Multi-v4 | ~1,7B | no disponible | Apache-2.0 | HuggingFace, 0 descargas | Ajuste SFT financiero, sin benchmarks ni documentacion de entrenamiento |
| Qwen3-1.7B (base oficial) | 1,7B | 32.768 tokens (ampliable con YaRN) | Apache-2.0 | HuggingFace, ampliamente usado | Modelo denso con modos de razonamiento; referencia de partida de este ajuste |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache-2.0 | HuggingFace, muy extendido | Alternativa madura, con benchmarks publicados y soporte amplio en herramientas |
| Llama-3.2-1B-Instruct | 1,2B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, ampliamente usado | Ventana de contexto mucho mayor, pero licencia con restricciones adicionales |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache-2.0 | HuggingFace | Tamano equivalente, contexto mas corto, ecosystema de herramientas menor |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparacion con el modelo base, ni ejemplos cualitativos, por lo que no puede afirmarse que el ajuste mejore el rendimiento en tareas financieras.
- Riesgo elevado de alucinacion en dominio financiero: los modelos de 1,7B tienden a inventar cifras, fechas y referencias normativas. Cualquier salida con datos numericos o regulatorios debe verificarse contra la fuente original.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos de genero, geograficos, sectoriales ni de otro tipo.
- Idioma: la ficha declara unicamente ingles. No hay evidencia de soporte fiable en castellano ni en otros idiomas, aunque el modelo base sea multilingue.
- Anomalia en el repositorio: 0,2 GB es un tamano muy inferior al esperado para un modelo de 1,7B en precision completa (unos 3,4 GB en bf16). Es probable que el repositorio contenga solo adaptadores, una cuantizacion parcial o una subida incompleta; conviene inspeccionar los archivos antes de usarlo.
- Fecha de creacion futura en los metadatos (2026-09-21), lo que sugiere metadatos poco fiables o generados automaticamente.
- Version "v4" sin changelog: no se documentan las diferencias respecto a versiones anteriores.
- Sin garantias de calidad: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero no exime al usuario de las obligaciones de transparencia ni de la responsabilidad sobre las salidas del modelo.
- Uso como asesoramiento financiero: no debe emplearse para tomar decisiones de inversion ni para ofrecer recomendaciones financieras personalizadas sin supervision humana cualificada y cumplimiento normativo (por ejemplo, MiFID II en la Union Europea).
- Soporte de tool calling y de agentes no confirmado: si el ajuste fino altero la plantilla de chat, el modelo puede degradar el formato de llamadas a herramientas.
- No apto como modelo unico en produccion critica: su tamano limita el razonamiento multi-paso y el seguimiento de instrucciones complejas en comparacion con modelos de 7B o superiores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KayaTechAI/Qwen3-1.7B-SFT-Finance-Multi-v4
- Modelo base: https://huggingface.co/unsloth/qwen3-1.7b-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Pagina de la familia Qwen3 en HuggingFace: https://huggingface.co/Qwen
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de text-generation-inference: https://github.com/huggingface/text-generation-inference
- Paper tecnico de Qwen3: https://arxiv.org/abs/2505.09388
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; todos los enlaces encontrados correspondian al servicio YouTube Music y no guardan relacion con el contenido de esta ficha.
