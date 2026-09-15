# hausmer/truha-gemma4

## Resumen

Truha-gemma4 es un adaptador LoRA publicado por el usuario hausmer sobre el modelo base google/gemma-4-E4B-it. No es un modelo completo, sino un ajuste fino de bajo rango (r=16, alpha=32) que especializa al modelo base en la generación de noticias satíricas breves en ucraniano, en el registro conocido como *truha*: titulares falsos con remate humorístico y un regusto amargo. El adaptador se distribuye en formato PEFT y ocupa 0,2 GB en el repositorio de HuggingFace, por lo que requiere descargar y cargar el modelo base para funcionar.

El problema que resuelve es muy concreto: forzar un estilo editorial muy marcado (parodia de noticias ucranianas) que un modelo generalista no reproduce de forma consistente sin un prompt engineering costoso. El autor entrenó el adaptador con 46.139 filas, de las cuales 39.272 son noticias satíricas sintéticas propias, 1.722 elementos derivados de Wikipedia y 5.145 comentarios reales de audiencia del canal público de noticias satíricas «Труха⚡️Україна». La pérdida de validación reportada es de aproximadamente 1,31 sobre 2.066 noticias sintéticas reservadas.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de uso de ajuste de estilo muy específico sobre un modelo base multimodal de contexto largo declarado (256K). Por otro lado, es un ejemplo de adaptador con licencia Apache-2.0 y trazabilidad parcial: el corpus sintético es público, pero los comentarios reales no se redistribuyen, de modo que el entrenamiento no es reproducible al 100 % a partir del dataset abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal google/gemma-4-E4B-it |
| Parametros totales | no disponible (el adaptador LoRA no declara recuento propio; el modelo base se denomina "E4B") |
| Parametros activos | no aplica (no es MoE) / no disponible para el base |
| Longitud de contexto | 256K tokens segun la model card del autor, heredada del modelo base |
| Tipos de cuantizacion | no disponible (la model card solo documenta carga en bfloat16) |
| Idiomas soportados | ucraniano (uk) como idioma entrenado; el modelo base es multilingue |
| Licencia | Apache-2.0, con atribucion obligatoria a Google DeepMind por el modelo base |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), libreria peft |
| Rango LoRA | r=16, alpha=32, dropout 0.05 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Tamano del repositorio | 0,2 GB |
| Pipeline | text-generation |
| Fecha de publicacion | 2026-09-15 (creado), 2026-09-15 (actualizado) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre google/gemma-4-E4B-it, un transformer multimodal con 256K tokens de contexto declarados. El entrenamiento se realizó con PEFT 0.20 en precisión bf16, durante 3 épocas, con LoRA de rango 16 y alpha 32 sobre todas las proyecciones de atención y MLP del modelo de lenguaje (q/k/v/o y gate/up/down). No se documenta ningún mecanismo adicional de decodificación especulativa ni atención lineal: la innovación aquí es exclusivamente de ajuste de estilo, no arquitectónica.

El corpus de entrenamiento suma 46.139 filas: 39.272 noticias satíricas sintéticas de la categoría `truha_satire`, 1.722 filas `general_ua` derivadas de Wikipedia y 5.145 comentarios de audiencia del canal satírico «Труха⚡️Україна». Las dos primeras categorías están publicadas en el dataset abierto hausmer/truha-news-satire; la tercera no se redistribuye por tratarse de texto de usuarios reales, aunque el autor indica que ya era público para los suscriptores del canal y que no contiene identificadores ni datos personales. La validación usó 2.066 noticias sintéticas reservadas, con una pérdida de evaluación aproximada de 1,31. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto en ucraniano con un registro satírico muy definido: titulares y piezas breves de "noticia falsa" con estructura de remate.
- Generación condicionada por tema semilla: el prompt de usuario sigue el patrón `Зроби новину в стилі трухи: <tópico>`.
- Formato conversacional: el adaptador espera una plantilla de chat con un mensaje de sistema literal, `Ти — TrueXAnеws.`
- Muestreo ajustado al estilo: la model card recomienda `temperature=0.95`, `top_p=0.92`, `repetition_penalty=1.05` y `max_new_tokens=160`.
- Capacidades heredadas del modelo base (no verificadas tras el ajuste): contexto de 256K tokens, multimodalidad y multilingüismo. El ajuste LoRA se aplicó solo a las proyecciones del modelo de lenguaje, por lo que es previsible cierto olvido catastrófico en tareas generales, aunque el autor no lo cuantifica.
- No se documenta soporte explícito de tool calling, function calling, modo de razonamiento (*thinking*) ni uso agéntico multi-paso en este adaptador.

## Casos de uso

- Generación de contenido satírico para canales de Telegram o medios ucranianos: el adaptador convierte un tema semilla en un titular breve con el registro *truha*, con parámetros de muestreo ya calibrados por el autor.
- Redacción de borradores paródicos en redacciones de humor: se usa como primer paso para producir 10-20 variantes de titular y un editor humano selecciona y pule.
- Aumento de datos para clasificadores de ironía y sátira en ucraniano: el modelo genera ejemplos etiquetados por construcción, útiles para entrenar detectores de humor o de desinformación.
- Red-teaming de moderación de contenido: generar parodia sintética para probar si los sistemas de detección de *fake news* distinguen correctamente entre sátira declarada y desinformación real.
- Alfabetización mediática y talleres de periodismo: producir ejemplos controlados de noticia falsa satírica para explicar la diferencia entre parodia y desinformación.
- Investigación en adaptación de estilo con LoRA: caso reproducible y de bajo coste (0,2 GB de adaptador) para comparar estrategias de ajuste de estilo frente a prompt engineering puro.
- Prototipado de asistentes editoriales con personalidad fija: el mensaje de sistema literal permite fijar estilo y tono en una aplicación conversacional ucraniana sin reentrenar.
- Evaluación de olvido catastrófico: usar el adaptador para medir cuánto se degradan las capacidades generales y multilingües del modelo base tras un SFT de estilo de 3 épocas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida de validación del entrenamiento.

| Metrica | Valor | Conjunto |
|---|---|---|
| Perdida de evaluacion | ≈ 1,31 | 2.066 noticias sinteticas reservadas |
| MMLU | no disponible | - |
| HumanEval | no disponible | - |
| GSM8K | no disponible | - |

## Requisitos de hardware

- VRAM de inferencia: no disponible de forma confirmada. El adaptador ocupa 0,2 GB, pero requiere cargar el modelo base completo; el repositorio no publica cuantizaciones ni pesos fusionados.
- Estimacion orientativa (no confirmada por el autor): la nomenclatura "E4B" del modelo base sugiere un modelo de aproximadamente 4.000 millones de parametros efectivos, lo que en bfloat16 implicaria del orden de 8-10 GB de pesos, mas la cache KV correspondiente al contexto usado. Esta cifra es una inferencia y no un dato verificado.
- GPU recomendadas: no disponible en la informacion proporcionada. Con la estimacion anterior, una GPU de 16-24 GB (RTX 4090, L4, A10G) seria suficiente en bfloat16 para contextos moderados; para 256K tokens de contexto se necesitarian aceleradores de mayor memoria (A100 80 GB, H100) por el coste de la cache KV.
- GPU de consumo: probablemente viable en tarjetas de 16 GB o mas si se aplican cuantizaciones de 4 u 8 bits, aunque el autor no documenta ninguna.
- Opciones de despliegue: al ser un adaptador PEFT, el camino documentado es transformers + peft. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI (este ultimo requeriria fusionar el adaptador y exportar pesos completos, algo que el repositorio no incluye).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre otros adaptadores LoRA de satira ucraniana comparables. La unica comparacion documentable es contra el propio modelo base sin adaptar.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Estilo satirico ucraniano |
|---|---|---|---|---|---|
| hausmer/truha-gemma4 (este) | Adaptador LoRA sobre base "E4B" | 256K (heredado) | Apache-2.0 | HuggingFace, 0 descargas, 0 likes en la fecha de consulta | Especializado, requiere el mensaje de sistema literal |
| google/gemma-4-E4B-it (base) | No disponible ("E4B") | 256K | Apache-2.0 | HuggingFace | No especializado; exigiria prompt engineering |
| Alternativas de satira en ucraniano | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El contenido generado es ficcion parodica, no periodismo. El autor lo advierte explicitamente en la model card; su uso en un contexto donde pueda confundirse con informacion real es un riesgo reputacional y legal.
- Riesgo de alucinacion elevado por diseno: el modelo esta entrenado para inventar hechos verosimiles con formato de noticia. No debe usarse como fuente de informacion.
- El aviso de la model card es sensible a caracteres Unicode: el mensaje de sistema entrenado es `Ти — TrueXAnеws.`, donde la ultima "е" es la letra cirilica U+0435 y no la latina U+0065. Usar una variante con "e" latina puede degradar el estilo de forma notable.
- El entrenamiento no es reproducible al 100 %: 5.145 filas de comentarios reales de audiencia no se redistribuyen en el dataset abierto por tratarse de texto de usuarios.
- Sesgos conocidos: no disponible. El autor no publica analisis de sesgos, y el corpus sintetico puede arrastrar los sesgos del generador que lo produjo.
- Limitaciones de idioma: el adaptador esta entrenado unicamente en ucraniano. Su comportamiento en otros idiomas no esta documentado y, tras el ajuste, es probable que el rendimiento multilingue del base se degrade.
- Limitaciones de contexto real: aunque el base declara 256K tokens, no se ha validado que el adaptador mantenga ese rendimiento en contextos largos; el entrenamiento uso noticias breves (`max_new_tokens=160`).
- Olvido catastrofico: al ajustar todas las proyecciones de atencion y MLP durante 3 epocas, es esperable una perdida de capacidades generales y de tool calling del modelo base. No hay datos que lo cuantifiquen.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero exige atribucion a Google DeepMind por el modelo base. Conviene revisar tambien los terminos de Gemma aplicables al modelo subyacente.
- Adopcion nula en la fecha de consulta: 0 descargas y 0 likes, sin validacion externa de la comunidad ni evaluaciones independientes.
- Repositorio de 0,2 GB sin cuantizaciones GGUF ni pesos fusionados: cualquier despliegue en produccion exige trabajo adicional de conversion.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/hausmer/truha-gemma4
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset publico: https://huggingface.co/datasets/hausmer/truha-news-satire
- Canal satirico de referencia: «Труха⚡️Україна» (no se proporciona URL en la model card)
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo, su autor o su dataset.
