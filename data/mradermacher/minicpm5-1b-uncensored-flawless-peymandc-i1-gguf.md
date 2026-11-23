# mradermacher/MiniCPM5-1B-Uncensored-Flawless-Peymandc-i1-GGUF

## Resumen

MiniCPM5-1B-Uncensored-Flawless-Peymandc-i1-GGUF es una cuantizacion en formato GGUF del modelo Peymandc/MiniCPM5-1B-Uncensored-Flawless-Peymandc, publicada por mradermacher. Se trata de una variante "uncensored" (tambien etiquetada como decensored y abliterated) derivada de la familia MiniCPM5 de 1B parametros, orientada a generacion de texto, contexto largo, tool calling y despliegue en dispositivo (edge-ai, on-device). El autor de la cuantizacion es un conocido empaquetador de GGUF que genera versiones weighted/imatrix de modelos populares para su uso con llama.cpp y ecosistemas compatibles.

La relevancia de esta ficha es doble: por un lado documenta un modelo pequeno (1B) pensado para entornos con recursos limitados; por otro, advierte de que se trata de una version sin censura, con las implicaciones eticas y legales que ello conlleva. La licencia declarada es Apache 2.0, lo que permite uso comercial, aunque el caracter "abliterated" del modelo base exige evaluacion cuidadosa antes de llevarlo a produccion.

Los datos tecnicos disponibles en la informacion proporcionada son escasos: no se detallan la arquitectura interna, el numero exacto de tokens de entrenamiento ni los resultados de benchmarks. Esta ficha refleja unicamente lo que consta en la model card y en los metadatos de Hugging Face, marcando explicitamente como "no disponible" todo aquello que no se ha podido verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como minicpm5 / llama en los tags) |
| Parametros totales | 1B (aproximado por el nombre); el campo safetensors del repo indica 690.312, dato probablemente correspondiente a un tensor o metadato parcial, no al total del modelo |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el tag "long-context" sugiere soporte extendido, sin cifra concreta) |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, small-IQ4_NL, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base esta en transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Los tags indican "minicpm5" y "llama", lo que sugiere una arquitectura de tipo transformer decoder-only compatible con el ecosistema llama.cpp, pero no se confirma el tipo exacto de atencion, el uso de atencion lineal ni otras innovaciones. El modelo base es Peymandc/MiniCPM5-1B-Uncensored-Flawless-Peymandc, del que no se detallan datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo fases de RLHF o DPO.

La unica informacion tecnica concreta sobre esta publicacion es el proceso de cuantizacion: mradermacher ha generado cuantizaciones i1 (weighted/imatrix) a partir del modelo base, empleando un fichero imatrix de 0,1 GB para guiar la asignacion de bits. El autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamano similar. Tambien existe una version con cuantizaciones estaticas en el repositorio mradermacher/MiniCPM5-1B-Uncensored-Flawless-Peymandc-GGUF. El caracter "abliterated" del modelo base implica que se ha aplicado una tecnica de eliminacion de direcciones de rechazo en el espacio de activaciones, aunque no se documenta el procedimiento exacto.

## Capacidades

- Generacion de texto autoregresiva en ingles y chino.
- Soporte declarado de contexto largo (tag "long-context"), sin cifra concreta de ventana.
- Tool calling / function calling segun los tags del modelo.
- Orientado a despliegue en dispositivo y entornos edge (on-device, edge-ai).
- Variante "uncensored"/"decensored"/"abliterated": reduce los rechazos ante peticiones que el modelo original bloquearia.
- Reproducibilidad declarada (tag "reproducible").
- Compatibilidad con endpoints (tag "endpoints_compatible").
- No se documentan capacidades de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Asistentes locales en dispositivos de gama baja: al ser un modelo de 1B en GGUF, puede ejecutarse en CPU o GPU integrada de portatiles y moviles, ofreciendo generacion de texto sin conexion.
- Prototipado rapido de agentes con tool calling: el soporte declarado de function calling permite integrarlo en flujos de automatizacion ligeros antes de escalar a modelos mayores.
- Procesamiento de documentos extensos en ingles o chino: el tag de contexto largo sugiere utilidad para resumir o extraer informacion de textos de varias paginas en entornos con poca memoria.
- Generacion de contenido creativo sin restricciones tematicas: la naturaleza abliterated lo hace adecuado para experimentacion literaria o de roleplay donde el modelo original rechazaria ciertos temas, siempre con supervision humana.
- Investigacion sobre alineacion y seguridad: util como caso de estudio para comparar el comportamiento de un modelo censurado frente a su version abliterated en tareas controladas.
- Clasificacion y etiquetado de texto a gran escala: su bajo coste de inferencia permite procesar lotes grandes de documentos en ingles o chino.
- Educacion y demos offline: sirve para ensenar tecnicas de cuantizacion y despliegue con llama.cpp en talleres y cursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: un modelo de 1B en cuantizaciones Q4_K_M ocupa aproximadamente 0,6-0,8 GB, y en Q2_K puede bajar de 0,5 GB; las cifras exactas no constan en la model card.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) puede ejecutarlo con holgura; tambien es viable en CPU.
- Cabe en GPU consumer y en muchos dispositivos moviles con cuantizaciones bajas (IQ2, Q2_K, IQ3).
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag "endpoints_compatible" sugiere integracion con servidores tipo OpenAI-compatible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-1B-Uncensored-Flawless-Peymandc-i1-GGUF (este) | 1B | no disponible | apache-2.0 | GGUF | Variante abliterated, en/zh |
| MiniCPM5-1B (original, familia MiniCPM) | 1B | no disponible | no disponible | safetensors/GGUF | Modelo base de referencia, con censura |
| mradermacher/MiniCPM5-1B-Uncensored-Flawless-Peymandc-GGUF | 1B | no disponible | apache-2.0 | GGUF | Mismo modelo base, cuantizaciones estaticas en lugar de i1 |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": puede generar contenido ofensivo, ilegal o danino; requiere filtros externos y supervision humana en produccion.
- Riesgo elevado de alucinacion por su tamano reducido (1B), especialmente en tareas de razonamiento complejo o conocimiento factual.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- No se documentan sesgos especificos, pero al derivar de un modelo pequeno y de una tecnica de abliteration, los sesgos del modelo original pueden amplificarse o quedar menos mitigados.
- La licencia Apache 2.0 permite uso comercial, pero el caracter abliterated puede entrar en conflicto con politicas de plataformas y con normativa local sobre contenido.
- La informacion tecnica publicada es muy escasa: no hay datos de entrenamiento, contexto exacto ni benchmarks, lo que dificulta evaluar su idoneidad para casos criticos.
- El campo de parametros del repo (690.312) no coincide con el tamano nominal de 1B, lo que sugiere metadatos incompletos o un tensor parcial; conviene verificar el modelo base antes de confiar en las cifras.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/MiniCPM5-1B-Uncensored-Flawless-Peymandc-i1-GGUF
- Modelo base: https://huggingface.co/Peymandc/MiniCPM5-1B-Uncensored-Flawless-Peymandc
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/MiniCPM5-1B-Uncensored-Flawless-Peymandc-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#MiniCPM5-1B-Uncensored-Flawless-Peymandc-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico de perplexidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
