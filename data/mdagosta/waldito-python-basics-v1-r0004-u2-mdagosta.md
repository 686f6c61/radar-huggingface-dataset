# mdagosta/waldito-python-basics-v1-r0004-u2-mdagosta

## Resumen

El modelo `mdagosta/waldito-python-basics-v1-r0004-u2-mdagosta` es un modelo de generacion de texto causal publicado por el usuario mdagosta en HuggingFace. Segun su model card, se trata de un export del proyecto OpenWALDO que emplea la arquitectura estandar `LlamaForCausalLM` de Transformers junto con el tokenizador de bytes "schema-1" de OpenWALDO, lo que obliga a cargar el tokenizador con `trust_remote_code=True`. El recuento real de parametros en los ficheros safetensors es de 9.541.632, es decir, unos 9,5 millones de parametros.

Se trata por tanto de un modelo de escala muy reducida (dos ordenes de magnitud por debajo de un GPT-2 small), orientado previsiblemente a experimentacion, ensenanza o validacion de infraestructura mas que a uso productivo. El identificador sugiere un ajuste fino sobre "python basics" en su version 1, release 0004, unidad 2, aunque la model card no confirma ni el dataset ni el procedimiento de entrenamiento.

Su relevancia actual es limitada como modelo de proposito general, pero resulta interesante en dos frentes: por un lado, ilustra el uso de un tokenizador de bytes que elimina el problema de tokens fuera de vocabulario; por otro, el repositorio incluye un `BOM.json` con el inventario de ficheros de la release y un `EU-BOM.json` con el mapeo de divulgacion de contenido de entrenamiento exigido por el reglamento europeo de IA (GPAI), un artefacto de gobernanza poco habitual en modelos de este tamano.

No se dispone de informacion sobre licencia, idiomas soportados, longitud de contexto ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, familia Llama (`LlamaForCausalLM` de Transformers) |
| Parametros totales | 9.541.632 (segun safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay ficheros GGUF ni variantes cuantizadas en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizer | OpenWALDO schema-1, tokenizador de bytes; requiere `trust_remote_code=True` |
| Biblioteca | transformers |
| Pipeline declarado | text-generation |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-30T18:57:14Z / 2026-09-30T18:57:23Z |

## Arquitectura y entrenamiento

La model card es explicita en un unico punto tecnico: el paquete utiliza "the standard Transformers Llama causal-language-model architecture" junto con el tokenizador de bytes schema-1 de OpenWALDO. Esto implica un transformer decoder-only convencional con atencion causal, normalizacion RMSNorm y las capas habituales de la familia Llama, pero con un vocabulario a nivel de byte en lugar de un vocabulario BPE o SentencePiece. La consecuencia practica es que no existen tokens desconocidos (OOV): cualquier secuencia de bytes es representable, a cambio de secuencias mas largas para el mismo texto y, previsiblemente, de un rendimiento inferior por token en tareas linguisticas.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de ajuste supervisado, RLHF o DPO, ni sobre hiperparametros de entrenamiento. Tampoco se documenta ninguna tecnica de inferencia optimizada (decodificacion especulativa, atencion lineal, KV cache comprimida, etc.). El elemento diferencial documentado no es la arquitectura sino el paquete de gobierno asociado: `BOM.json` inventaria cada fichero de la release y `EU-BOM.json` contiene el mapeo de divulgacion de contenido de entrenamiento para modelos GPAI de la Union Europea.

## Capacidades

- Generacion de texto causal autoregresiva, segun el pipeline declarado (`text-generation`).
- Etiquetado como `conversational` en los tags del repositorio, lo que sugiere un formato de chat, aunque no se documenta plantilla de mensajes ni formato de prompt.
- Cobertura de bytes completa gracias al tokenizador de bytes schema-1: cualquier entrada textual es codificable sin OOV.
- Compatibilidad declarada con `text-generation-inference` y con endpoints compatibles (tags `text-generation-inference` y `endpoints_compatible`).
- Tool calling / function calling: no documentado, no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado, no disponible.
- Capacidades multilingues: no documentadas; no hay lista de idiomas.
- Vision, audio u otras modalidades: no disponibles.
- Modo "thinking" o razonamiento explicito: no documentado, no disponible.

Con 9,5 millones de parametros, la calidad esperable de generacion de texto libre es muy baja en terminos absolutos; no hay ninguna evaluacion publicada que permita afirmar lo contrario.

## Casos de uso

- Validacion de infraestructura de despliegue: por su tamano (menos de 40 MB en fp32), el modelo sirve como carga de prueba para verificar que un pipeline de vLLM, TGI o Transformers arranca, tokeniza y genera correctamente antes de desplegar modelos grandes.
- Pruebas de humo en CI/CD: integrarlo en la bateria de tests de una plataforma de serving para detectar regresiones en el soporte de `trust_remote_code`, en la carga de safetensors o en el manejo de tokenizadores personalizados.
- Investigacion sobre tokenizacion a nivel de byte: permite comparar el comportamiento de un vocabulario de bytes frente a BPE en tareas controladas, midiendo longitud de secuencia, perplejidad y calidad de generacion con el mismo presupuesto de parametros.
- Experimentos academicos de scaling laws en el extremo inferior: util como punto de referencia de ~10 M de parametros en curvas de escalado junto a modelos de 1 M, 30 M y 100 M.
- Prototipado educativo: sirve para que estudiantes inspeccionen pesos, cabezas de atencion y el flujo completo de inferencia de un transformer en un portatil, sin GPU dedicada.
- Despliegue en dispositivos muy restringidos: microcontroladores de gama alta, Raspberry Pi o navegador (via WebAssembly) son viables a nivel de memoria, siempre que se resuelva la conversion del tokenizador.
- Auditoria de artefactos de gobernanza: el par `BOM.json` / `EU-BOM.json` puede usarse como plantilla o caso de estudio para equipos que necesiten cumplir con los requisitos de divulgacion de contenido de entrenamiento para modelos GPAI.
- Generacion de texto en entornos de prueba con datos sinteticos: para rellenar fixtures o generar cadenas de prueba donde la coherencia semantica no es un requisito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No consta ninguna evaluacion de MMLU, HumanEval, GSM8K, HellaSwag, perplejidad ni de cualquier otra metrica, ni en la model card ni en los resultados de busqueda consultados.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 38,2 MB en fp32, 19,1 MB en fp16/bf16, 9,5 MB en int8 y 4,8 MB en int4. A ello hay que sumar activaciones y cache KV, que dependen de la longitud de contexto (no documentada) y del tamano de lote.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no se requiere A100, H100 ni tarjetas de gama alta.
- Cabe en GPU de consumo: si, en cualquier modelo (RTX 3060, RTX 4090, GTX 1650, integradas modernas). Tambien cabe comodamente en CPU y en dispositivos tipo Raspberry Pi.
- Opciones de despliegue: `transformers` (via `pipeline` o `AutoModelForCausalLM`), `text-generation-inference` (declarado en los tags) y endpoints compatibles. Para `llama.cpp` u `Ollama` seria necesaria una conversion a GGUF que no se publica en el repositorio; conviene verificar la compatibilidad del tokenizador de bytes y la dependencia de `trust_remote_code` antes de asumirla. `vLLM` puede requerir comprobaciones adicionales por el tokenizador personalizado.
- Latencia y throughput: no disponible. No hay mediciones publicadas. Por el tamano del modelo, la decodificacion token a token (no el computo por token) sera el cuello de botella dominante en cualquier hardware moderno.

## Comparativa con modelos similares

No hay datos de rendimiento de este modelo que permitan una comparativa funcional. La siguiente tabla compara unicamente caracteristicas estructurales con alternativas de escala parecida; los datos de los modelos de referencia provienen de conocimiento general y no de la informacion proporcionada, por lo que conviene verificarlos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| waldito-python-basics-v1-r0004-u2-mdagosta | 9,5 M | no disponible | no disponible | HuggingFace, safetensors |
| TinyStories-33M (Eldan y Li) | 33 M | no verificada | no verificada | HuggingFace |
| GPT-2 small | 124 M | 1.024 tokens (publicado) | MIT (publicada) | HuggingFace |
| SmolLM-135M (HuggingFace) | 135 M | 2.048 tokens (publicado) | Apache-2.0 (publicada) | HuggingFace |

## Limitaciones y advertencias

- Ausencia de licencia: al no declararse licencia, no puede asumirse permiso de uso comercial, redistribucion ni modificacion. En un contexto de produccion esto es un bloqueante, no un detalle.
- Sin idiomas declarados: no hay garantia de comportamiento en castellano ni en ninguna otra lengua; el tokenizador de bytes no implica competencia linguistica.
- Sin benchmarks: cualquier afirmacion sobre su calidad es especulativa.
- Riesgo elevado de alucinacion y de texto incoherente por el tamano del modelo (9,5 M de parametros). No debe usarse como fuente de informacion factual.
- Contexto no documentado: se desconoce la ventana maxima soportada, lo que impide dimensionar cache KV o disenar aplicaciones multi-turno.
- `trust_remote_code=True`: cargar el tokenizador implica ejecutar codigo Python publicado en el repositorio. Es un vector de riesgo de seguridad en entornos no auditados; conviene revisar el codigo antes de ejecutarlo.
- Sesgos: no evaluados ni documentados. Un modelo entrenado sobre un corpus no declarado puede reproducir sesgos desconocidos.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, y un repositorio de 0,0 GB registrado. No hay senales externas de que el modelo haya sido probado por terceros.
- Metadatos anomalos: la fecha de creacion registrada (2026-09-30) es posterior a la fecha habitual de publicacion de modelos comparables, y la actualizacion se produjo 9 segundos despues de la creacion. Conviene tratarlos con cautela.
- El nombre del repositorio sugiere un ajuste fino sobre "python basics", extremo no confirmado por la model card. No debe asumirse capacidad de generacion de codigo Python sin evaluacion previa.
- Los ficheros `BOM.json` y `EU-BOM.json` no se han podido inspeccionar; su contenido real y su exhaustividad no estan verificados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0004-u2-mdagosta
- Repositorio hermano (release anterior r0003-u1): https://huggingface.co/mdagosta/waldito-python-basics-v1-r0003-u1-mdagosta
- `BOM.json` y `EU-BOM.json`: ficheros citados en la model card, ubicados en la raiz del repositorio del modelo.
- La busqueda web no devolvio documentacion tecnica especifica del modelo. Los resultados obtenidos (python.org, la pagina de modelos abiertos de OpenAI, Google Colab y una lista de reproduccion de YouTube sobre machine learning con Python) no aportan informacion sobre este modelo ni sobre el proyecto OpenWALDO, por lo que no se incluyen como fuentes.
