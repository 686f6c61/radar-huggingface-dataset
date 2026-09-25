# SocBranAfrica/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Este repositorio contiene una cuantizacion GGUF del modelo Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX, un fine-tune de 26.895.998.464 parametros (~26,9 B) sobre Qwen 3.8 27B. El modelo original lo desarrollo DavidAU mediante un proceso de multi-stage fine-tuning, multi-fine-tune y merge, con las tecnicas propietarias que el autor denomina COLD FUSION (GAIN + Unsloth) y Fable Fusion 711. La version aqui publicada la redistribuye el usuario SocBranAfrica en formato GGUF, con variantes "Regular" y "MTP" (multi-token prediction) generadas con imatrix dual (DI-MATRIX).

El objetivo declarado del modelo es triple: elevar los benchmarks de razonamiento respecto al Qwen 3.8 27B base, reducir drásticamente los tokens de "thinking" (entre la mitad y una decima parte, con una mediana de reduccion de aproximadamente dos tercios) y acelerar la generacion manteniendo el detalle de salida. Ademas, se presenta como un modelo "uncensored", "abliterated" y "heretic", es decir, con los mecanismos de alineacion y rechazo eliminados o muy atenuados.

Es relevante ahora porque representa una de las lineas mas activas del ecosistema open source: fine-tunes de gran tamano orientados a ejecucion local en hardware de consumo, distribuidos en GGUF y con soporte de tool calling, escritura creativa, codigo y modo de razonamiento. La licencia declarada es Apache 2.0 y los idiomas soportados son ingles y chino. Se trata de un modelo denso, no MoE, con pipeline declarado image-text-to-text heredado del modelo base multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base multimodal nativa Qwen 3.8 27B, segun la descripcion del repositorio oficial de Qwen) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | No aplicable (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF en variantes "Regular" y "MTP", con imatrix dual (DI-MATRIX); se citan explicitamente Q4_K_S (4 bits) y 8 bits; catalogo completo no disponible |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en bfloat16 / safetensors |
| Autor del modelo original | DavidAU (este repositorio lo redistribuye SocBranAfrica) |
| Modelo base declarado | DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU |
| Pipeline declarado | image-text-to-text |
| Datasets de entrenamiento | DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets |
| Tamano del repositorio | 389,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

La base es un transformer denso de ~27 B parametros, descrito por el equipo de Qwen como modelo multimodal nativo (image-text-to-text) orientado a codigo, flujos agenticos y automatizacion de oficina. Sobre esa base, DavidAU aplica una cadena de entrenamiento en multiples etapas que combina fine-tuning supervisado, merges de multiples estados del modelo y una fase final de "uncensoring". El autor afirma que todo el proceso se ejecuto en hardware de consumo mediante Unsloth, y que el modelo final se distribuye tambien en bfloat16 ademas de los GGUF.

La innovacion tecnica declarada es el metodo COLD FUSION, descrito como la combinacion del componente propietario "GAIN" con los entrenadores de Unsloth. Segun la model card, GAIN modifica dinamicamente el regimen de entrenamiento por muestra en tiempo real, a medida que el modelo aprende. A esto se suma Fable Fusion 711 y una fase de ajuste especifico para combatir el exceso de razonamiento y el consumo excesivo de tokens, reformateando el bloque de pensamiento. El resultado, segun el autor, es una reduccion de los tokens de thinking de entre 1/2 y 1/10 (mediana de ~2/3) en los tres modos de pensamiento, manteniendo el detalle de salida. Las variantes MTP incorporan prediccion multi-token para acelerar la decodificacion. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto general, siguiendo instrucciones, en modos con y sin razonamiento explicito (thinking).
- Razonamiento multi-paso y resolucion de problemas, con bloques de pensamiento comprimidos para reducir coste de tokens.
- Generacion de codigo, con etiquetas explicitas de "coder" y "NEO-CODER MAX" en la nomenclatura del modelo.
- Escritura creativa y de ficcion: relatos, novelas, todos los generos, roleplaying y dialogos largos.
- Capacidades multimodales de entrada (image-text-to-text) heredadas del modelo base; los ejemplos disponibles en la model card son, no obstante, exclusivamente de texto.
- Tool calling / function calling: el autor remite a la pestana "community" para resultados de terceros que, segun afirma, constituyen el mejor rendimiento de tool calling registrado; no se aportan cifras en la informacion disponible.
- Uso como agente y razonamiento multi-paso, con soporte de los tres modos de pensamiento declarados.
- Multilingue limitado a ingles y chino.
- Salida sin filtros de contenido (uncensored / abliterated), incluida la generacion de material que los modelos alineados rechazarian.
- Cuantizacion con imatrix dual orientada a preservar calidad en 4 y 8 bits.

## Casos de uso

- Escritura creativa asistida y generacion de ficcion larga: el modelo esta afinado especificamente para narrativa, dialogo y roleplaying, por lo que puede usarse como motor de generacion de novelas por entregas, guiones o campanas de rol, manteniendo coherencia de personajes a lo largo de sesiones extensas.
- Copiloto de codigo en local: al ser un modelo de ~27 B en GGUF, puede desplegarse con llama.cpp u Ollama en una estacion de trabajo con GPU de 24 GB y utilizarse para autocompletado, refactorizacion y explicacion de codigo sin enviar el codigo fuente a una API externa.
- Red teaming y evaluacion de seguridad: su condicion de modelo abliterated lo hace util como generador de contenido adversario controlado en entornos de investigacion, para probar filtros y clasificadores propios.
- Traduccion y redaccion bilingue ingles-chino: con soporte nativo de ambos idiomas, sirve para localizacion de documentacion tecnica, correos comerciales o interfaces de producto entre esos dos mercados.
- Atencion al cliente automatizada en ingles o chino: gestion de conversaciones multi-turno con contexto largo, apoyandose en el modo de pensamiento comprimido para reducir coste por consulta respecto a un modelo que "sobrepiensa" cada respuesta.
- Agentes con tool calling para automatizacion de tareas: el modelo puede integrarse en pipelines que consulten APIs, bases de datos o sistemas de ficheros, encadenando varios pasos de razonamiento y llamadas a herramientas.
- Procesamiento de documentos con componente visual: dado que la base es multimodal, puede emplearse para extraer informacion de capturas, formularios escaneados o imagenes de interfaz, tarea tipica de automatizacion de oficina.
- Prototipado rapido sin coste de API: al distribuirse en cuantizaciones de 4 y 8 bits, permite iterar sobre prompts y flujos completos, incluidos los tres modos de pensamiento, en una sola GPU de consumo antes de decidir un despliegue mayor.

## Benchmarks y rendimiento

Los unicos datos numericos disponibles proceden de la model card del autor y no incluyen metodologia ni tablas completas:

| Benchmark | Resultado declarado | Contexto |
|---|---|---|
| ARC-C (8 bits) | 735 | El autor indica que es el primer fine-tune de este tamano en superar 730 |
| ARC-C (4 bits) | 719 | Valor declarado en cuantizacion de 4 bits |
| ARC-E | 880 | Descito como "zona de inteligencia" de OpenAI, Claude y Gemini |
| Qwen 3.8 27B base (ARC-C) | Superado en 144 puntos segun el autor | Cifra de comparacion aportada por el autor, sin detalle de calculo |

El autor afirma ademas que el modelo supera al Qwen 3.8 27B base en los siete benchmarks criticos que utiliza, y que tambien supera los siete benchmarks de Qwen3.6-35B-A3B, Qwen3.6 27B y Qwen3.5 27B. No se publican en la informacion disponible las tablas completas, las condiciones de evaluacion ni el prompt utilizado. No se han publicado resultados de benchmarks verificables de forma independiente en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de los ~26,9 B parametros, sin contar cache KV): Q4_K_S en torno a 16-18 GB; Q5 en torno a 19-21 GB; Q6 en torno a 23-24 GB; Q8 en torno a 29-31 GB; bfloat16 en torno a 54 GB.
- GPU recomendadas: una RTX 4090 o RTX 3090 de 24 GB cubre las cuantizaciones de 4 y 5 bits con contexto moderado; una RTX 5090 de 32 GB o una A100 de 40 GB permiten 8 bits o contextos mas largos; una A100/H100 de 80 GB es necesaria para bfloat16 en precision completa.
- Cabe en GPU de consumo: si, en cuantizaciones de 4 y 5 bits en tarjetas de 24 GB (RTX 4090, 3090, 4080 Super con contexto reducido) y en 8 bits ajustando en tarjetas de 32 GB. Las GPUs de 16 GB requieren cuantizaciones mas agresivas de las citadas en la informacion disponible.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y text-generation-webui para GGUF; vLLM y TGI son viables tras convertir los pesos a safetensors, ya que el repositorio solo distribuye GGUF.
- Latencia y throughput: no disponibles. El autor afirma una mejora de velocidad por la reduccion de tokens de pensamiento y por el uso de variantes MTP, pero no aporta cifras de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (TURBO 735-882, GGUF) | ~26,9 B densos | No disponible | ARC-C 735 (8 bits) y 719 (4 bits) segun el autor; supera a Qwen 3.8 27B en 7 benchmarks segun el autor | Apache 2.0 | GGUF, tambien bfloat16 en el repo original |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | ~26,9 B densos | No disponible | Modelo base directo de este fine-tune | Apache 2.0 | bfloat16 y cuantizaciones |
| Qwen3.8-27B (Alibaba Qwen) | 27 B densos, multimodal nativo | No disponible | Referencia declarada: 144 puntos menos de ARC-C que este fine-tune, segun el autor | No disponible en la informacion proporcionada | Open weights, segun el repositorio de Qwen |
| Qwen3.6-35B-A3B | 35 B totales, MoE (~3 B activos, deducido de la nomenclatura A3B) | No disponible | El autor afirma que este fine-tune lo supera en sus 7 benchmarks | No disponible | No disponible |
| Qwen3.6 27B y Qwen3.5 27B | 27 B densos | No disponible | El autor afirma que este fine-tune los supera en sus 7 benchmarks | No disponible | No disponible |

No se dispone de resultados independientes que permitan validar estas comparaciones.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: se han eliminado o atenuado los mecanismos de rechazo, por lo que puede generar contenido ofensivo, ilegal o peligroso sin filtro. No es adecuado para exposicion directa a usuarios finales sin una capa de moderacion propia.
- Las cifras de benchmark (ARC-C 735, ARC-E 880) proceden unicamente del autor, no van acompanadas de metodologia y no coinciden con la escala habitual de ARC-C, que se reporta como porcentaje de acierto. Deben tratarse como no verificadas.
- Riesgo de alucinacion: los fine-tunes de escritura creativa y roleplaying tienden a priorizar la fluidez y el estilo sobre la veracidad factual; no debe usarse como fuente de datos sin verificacion.
- Idiomas limitados a ingles y chino. No hay soporte declarado de castellano, lo que degradara la calidad en tareas en espanol.
- Longitud de contexto no documentada en la informacion disponible, lo que impide planificar despliegues con requisitos de contexto largo.
- Licencia Apache 2.0 declarada, pero el modelo es el resultado de una cadena de merges y fine-tunes sobre pesos de terceros; conviene verificar la licencia de cada ancestro antes de un uso comercial.
- Este repositorio concreto es una redistribucion hecha por SocBranAfrica del modelo de DavidAU; no es la fuente original. Conviene descargar desde el repositorio del autor para garantizar integridad y actualizaciones.
- Repositorio de 389 GB: requiere espacio en disco considerable incluso descargando una sola cuantizacion.
- Sin validacion de la comunidad: 0 descargas y 0 likes en los metadatos, por lo que no hay evidencia externa de calidad ni de reproducibilidad.
- Los casos de uso multimodales se derivan del pipeline declarado y del modelo base; la model card no aporta ejemplos ni evaluaciones multimodales, por lo que esa capacidad no esta confirmada para este fine-tune.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/SocBranAfrica/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo original de DavidAU: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Discusion del autor con anuncios de versiones: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF/discussions/45
- Repositorio de la familia Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Ficha tecnica en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-neo-coder-max-mtp-gguf-davidau
- Analisis en HackerNoon: https://hackernoon.com/qwen38-27b-turbo-review-a-faster-thinking-uncensored-qwen-fine-tune
- Modelo predecesor de la tecnica COLD FUSION (Qwen3.6-27B-Fable-Fusion-711): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
