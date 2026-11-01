# mentolovburek/GaMS3-12B-Instruct-Q4_K_M-GGUF

## Resumen

GaMS3-12B-Instruct es un modelo de lenguaje de ~11.770 millones de parametros desarrollado por el grupo de investigacion cjvt (Centro za jezikovne vire in tehnologije, Universidad de Ljubljana), especializado en esloveno y en las principales lenguas del espacio cultural y linguístico del serbocroata (serbio, croata y bosnio), ademas del ingles. El modelo que aqui se documenta es una cuantizacion GGUF en formato Q4_K_M del checkpoint original `cjvt/GaMS3-12B-Instruct`, generada por el usuario mentolovburek mediante el espacio GGUF-my-repo de ggml.ai sobre llama.cpp.

La relevancia de esta ficha reside en que ofrece una via de despliegue local y de bajo coste de un modelo de 12B especializado en lenguas del sur de Europa con recursos limitados, un nicho escasamente cubierto por los grandes modelos generalistas. Al estar en formato GGUF, es compatible con llama.cpp, Ollama y otros motores CPU/GPU, lo que permite ejecutarlo en hardware de consumo.

La informacion disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es escasa: la model card del repositorio cuantizado es una plantilla automatica generada por GGUF-my-repo y remite al modelo base. Por tanto, los detalles no verificables se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (inferida del formato GGUF/llama.cpp; detalles no disponibles) |
| Parametros totales | 11.766.034.176 (~11,77B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (el ejemplo de servidor usa `-c 2048`, pero no confirma el maximo del modelo) |
| Tipos de cuantizacion | Q4_K_M (unica variante publicada en este repo) |
| Idiomas soportados | esloveno (sl), ingles (en), serbio (sr), croata (hr), bosnio (bs) |
| Licencia | Gemma (terminos de la licencia Gemma) |
| Formato de pesos | GGUF (archivo `gams3-12b-instruct-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `cjvt/GaMS3-12B-Instruct` en la documentacion proporcionada. Por el tamano (11,77B) y el formato de conversion a GGUF mediante llama.cpp, se trata de un transformer decoder-only compatible con la familia de herramientas llama.cpp, pero no se confirma el tipo exacto de atencion, el esquema de posiciones ni si incorpora innovaciones como attention lineal o decodificacion especulativa.

Tampoco se detallan el numero de tokens de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El nombre "Instruct" sugiere un ajuste por instrucciones, pero no hay informacion verificable sobre el proceso. La unica informacion tecnica concreta es que la cuantizacion Q4_K_M fue generada automaticamente desde el checkpoint original mediante el espacio GGUF-my-repo de ggml.ai.

## Capacidades

- Generacion de texto en esloveno, ingles, serbio, croata y bosnio.
- Ajuste por instrucciones (sufijo "Instruct" en el nombre del modelo base).
- Conversacion multi-turno mediante plantilla de chat (presumiblemente compatible con llama.cpp, aunque la plantilla exacta no se documenta).
- Procesamiento de texto de entrada y salida; no se documentan capacidades multimodales (vision, audio) en la informacion disponible.
- No se confirma soporte de tool calling, function calling ni modos de razonamiento extendido (thinking mode).
- No se confirma soporte de agentes ni razonamiento multi-paso.

## Casos de uso

- Atencion al cliente en esloveno: el modelo puede gestionar conversaciones en lengua eslovena, un idioma con escasa cobertura en modelos generalistas, adecuado para empresas con presencia en Eslovenia.
- Procesamiento de documentos en serbocroata: resumen y extraccion de informacion de textos en serbio, croata y bosnio, aprovechando la cobertura multilingue del modelo en el continuo lingüístico serbocroata.
- Traduccion asistida entre esloveno e ingles: util para flujos de localizacion donde se requiere un modelo local sin dependencia de APIs externas.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local mediante llama.cpp en formato Q4_K_M, permite procesar datos sensibles sin enviarlos a servicios en la nube.
- Generacion de contenido editorial en lenguas eslavas del sur: redaccion de borradores, resumenes y variaciones de texto para medios regionales.
- Prototipado e investigacion linguistica: evaluacion de modelos especializados en lenguas de bajos recursos, comparando su rendimiento frente a modelos multilingues generalistas.
- Educacion y asistencia en el aprendizaje de idiomas: generacion de ejercicios y respuestas en esloveno y serbocroata para plataformas educativas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa aproximadamente 7,3 GB (tamano del repo), por lo que se requiere en torno a 8 GB de VRAM para cargar el modelo completo en GPU, mas overhead de contexto.
- GPU recomendadas: tarjetas con 8-12 GB de VRAM como RTX 3060 12GB, RTX 4060 Ti 16GB o RTX 4070; para mayor velocidad y contexto, A100 o H100 no son necesarias pero ofrecen mayor throughput.
- Cabe en GPU de consumo: si, en modelos con al menos 8 GB de VRAM (RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070, etc.). Tambien puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (importando el GGUF), y cualquier motor compatible con GGUF. No se documenta soporte nativo en vLLM o TGI para este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. A continuacion se ofrece una comparacion estructural basica con alternativas plausibles de tamano similar; los datos de rendimiento se marcan como no disponibles.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| GaMS3-12B-Instruct (Q4_K_M) | ~11,77B | no disponible | sl, en, sr, hr, bs | Gemma | GGUF |
| Modelos multilingues generalistas de ~12B | ~12B | variable | decenas de idiomas | variable | safetensors/GGUF |
| Modelos especializados en lenguas eslavas de ~7B | ~7B | variable | variable | variable | variable |

La ventaja diferencial de GaMS3-12B-Instruct es su cobertura especifica del esloveno y del serbocroata, un nicho que los modelos generalistas suelen cubrir de forma superficial. La desventaja es la ausencia de datos publicos de benchmarks que permitan cuantificar esa ventaja.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; como todo modelo entrenado con corpus web, es probable que herede sesgos de los datos.
- Riesgo de alucinacion: no cuantificado; debe asumirse el riesgo habitual en modelos de 12B sin benchmarks publicados.
- Limitaciones de contexto o idioma: la cobertura se limita a cinco idiomas (sl, en, sr, hr, bs); el rendimiento fuera de ellos es incierto. La longitud maxima de contexto no esta documentada.
- Restricciones de licencia: la licencia es la Gemma, que impone condiciones de uso (incluida una politica de uso aceptable) y requisitos para uso comercial; debe revisarse antes de desplegar en produccion.
- Caveat de produccion: al tratarse de una cuantizacion Q4_K_M no oficial, puede haber una ligera perdida de calidad respecto al checkpoint original en safetensors. El repositorio tiene muy pocas descargas (88) y ningun "like", por lo que no cuenta con validacion comunitaria significativa.
- La model card del repositorio cuantizado es una plantilla automatica; no aporta informacion sobre el modelo base, lo que dificulta la evaluacion sin consultar el repositorio original.

## Enlaces

- Repositorio HuggingFace (cuantizado): https://huggingface.co/mentolovburek/GaMS3-12B-Instruct-Q4_K_M-GGUF
- Modelo base original: https://huggingface.co/cjvt/GaMS3-12B-Instruct
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
