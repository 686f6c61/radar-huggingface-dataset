# bartowski/Sorihon_Lunar-Memories-26B-A4B-GGUF

## Resumen

Sorihon_Lunar-Memories-26B-A4B es un modelo de lenguaje conversacional multimodal (texto e imagen, con soporte opcional de audio mediante fichero mmproj) obtenido a partir de un merge de dos finetunes. Segun la model card, parte de StyleTune V2, un finetune de Gryphe sobre Gemma 4 26B-A4B de Google, un transformer de mezcla de expertos (MoE) con 25.971.339.550 parametros totales y 4B de parametros activos por token (de ahi el sufijo A4B). El merge se realizo mediante media de Karcher (Karcher mean merge) con mergekit. Esta ficha documenta concretamente la version cuantizada en GGUF publicada por bartowski.

El interes practico del modelo reside en su relacion tamano/coste: al ser un MoE de ~26B totales con solo ~4B activos, el coste de inferencia por token se aproxima al de un modelo denso de 4B, mientras que la capacidad representacional se acerca a la de un modelo de 26B. Las cuantizaciones GGUF de bartowski (generadas con llama.cpp b12600 e imatrix) permiten desplegarlo en hardware de consumo, desde tarjetas con 12-16 GB de VRAM hasta equipos con 32 GB de RAM unificada.

La relevancia es doble: por un lado, demuestra el flujo habitual de la comunidad open source (finetune -> merge -> cuantizacion GGUF) para producir variantes conversacionales especializadas; por otro, al heredar la pila de Gemma, incorpora formato de prompt con canales de pensamiento (`<|channel>thought`) y declaracion de herramientas (`<|tool>declaration:...`), lo que lo hace apto para flujos de agente y function calling. No obstante, la informacion publicada es escasa: no hay datos de benchmarks, licencia declarada ni lista de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), base Gemma 4 26B-A4B; modelo resultante de merge (mergekit, Karcher mean) |
| Parametros totales | 25.971.339.550 (~26B); la model card cita 27B para el checkpoint fuente |
| Parametros activos | ~4B (sufijo A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q4_K_L, Q4_K_M, Q4_K_S, IQ4_NL, Q4_1, Q3_K_L, IQ3_M, Q4_0, IQ4_XS (imatrix) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); safetensors en el modelo base |
| Tamano del repo | 428,1 GB (incluye todas las variantes) |
| Multimodalidad | Texto e imagen; audio con fichero mmproj |
| Decodificacion especulativa | no |
| Formato de prompt | `<bos><|turn>system ... <turn|><|turn>user ... <turn|><|turn>model <|channel>thought <channel|>` |
| Herramientas | Declaracion via `<|tool>declaration:nombre{...}<tool|>` en el turno de sistema |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos (MoE) derivado de Gemma 4 26B-A4B, con aproximadamente 26B de parametros totales y unos 4B activos por token. Sobre esa base, Gryphe aplico un finetune conversacional (StyleTune V2) y posteriormente se realizo un merge con otro finetune mediante media de Karcher, una generalizacion de la media aritmetica en la variedad de matrices definidas positivas que suele producir interpolaciones mas estables que el simple model averaging. El merge se ejecuto con mergekit. La model card no detalla el dataset de entrenamiento, el numero de tokens, ni si hubo etapas de RLHF o DPO.

La innovacion tecnica principal no esta en el entrenamiento sino en el empaquetado: la publicacion de bartowski incluye cuantizaciones GGUF generadas con llama.cpp b12600 aplicando matrices imatrix (importance matrix), lo que mejora la calidad de las cuantizaciones de 4 bits y menores frente a la cuantizacion uniforme. El modelo conserva el mecanismo de canal de pensamiento de la familia Gemma (`<|channel>thought`), que permite separar el razonamiento interno de la respuesta final, y el esquema de declaracion de herramientas en el prompt de sistema. No emplea decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional multi-turno con formato de chat propio de Gemma.
- Razonamiento explicito mediante canal de pensamiento (`<|channel>thought`).
- Entrada de imagen (multimodal texto-imagen); entrada de audio con fichero mmproj.
- Soporte de tool calling / function calling mediante declaracion de herramientas en el turno de sistema.
- Apto para flujos de agente de varios pasos gracias al canal de pensamiento y a las herramientas.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Capacidades de codigo y matematicas: no documentadas explicitamente; se infieren del modelo base, pero no hay datos publicados.

## Casos de uso

- Asistente conversacional local: desplegado con llama.cpp u Ollama en una estacion de trabajo con 24 GB de VRAM (Q4_K_M, 19,06 GB), ofrece conversacion multi-turno sin dependencia de la nube.
- Procesamiento de documentos con imagenes: al aceptar entrada de imagen, puede describir capturas, diagramas o formularios escaneados en un pipeline local de digitalizacion.
- Agente con herramientas en local: la declaracion `<|tool>declaration:...` permite integrarlo en un orquestador que exponga funciones (consultas a bases de datos, APIs internas) y dejar que el modelo decida que llamar.
- Prototipado rapido de producto: la variante Q4_K_S (16,84 GB) cabe en GPUs de 24 GB con margen para contexto, lo que permite iterar sobre prompts y flujos sin coste por token.
- Analisis de imagenes en entornos con requisitos de privacidad: al ejecutarse en hardware propio, es adecuado para clasificar o resumir material visual sensible que no puede salir de la organizacion.
- Experimentacion en investigacion sobre merges: sirve como caso de estudio reproducible de merge por media de Karcher y de su efecto en cuantizaciones GGUF con imatrix.
- Evaluacion de razonamiento con traza: el canal de pensamiento permite auditar el razonamiento intermedio en tareas de varios pasos, util en entornos educativos o de depuracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos): bf16 ~52 GB; Q8_0 ~27,6 GB; Q6_K ~24,6 GB; Q5_K_M ~21,2 GB; Q4_K_M ~19,1 GB; Q4_K_S ~16,8 GB; IQ4_XS ~15,1 GB; Q3_K_L ~15,6 GB.
- Para contexto largo hay que sumar la cache KV; no se dispone de la longitud de contexto oficial, por lo que el dimensionado debe hacerse con margen.
- GPU recomendadas: A100 80 GB o H100 para bf16; RTX 4090 (24 GB) o A6000 (48 GB) para Q6_K y Q5_K_M; RTX 4090, RTX 3090 o RTX 4080 (16 GB) para Q4_K_M y Q4_K_S.
- En GPU de consumo: si, cabe en RTX 4090/3090 con Q4_K_M y en RTX 4080 de 16 GB con IQ4_XS o Q4_K_S, asumiendo contexto moderado.
- CPU y RAM: las variantes Q3 y Q4 caben en equipos con 32 GB de RAM; en Apple Silicon con memoria unificada de 32 GB o mas es viable con Q4_K_M.
- Despliegue: llama.cpp (version b12600 o superior), Ollama, y servidores compatibles con la API de endpoints (`endpoints_compatible` en los tags); el fichero mmproj es necesario para audio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Sorihon_Lunar-Memories-26B-A4B (GGUF) | ~26B | ~4B | no disponible | no disponible | GGUF | Merge conversacional multimodal; esta ficha |
| Gemma 4 26B-A4B (base) | ~26B | ~4B | no disponible | no disponible en esta informacion | safetensors | Modelo original de Google del que deriva |
| StyleTune V2 (Gryphe) | ~26B | ~4B | no disponible | no disponible | safetensors | Finetune conversacional usado como componente del merge |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- No hay benchmarks publicados: el rendimiento real frente a la base Gemma 4 o frente a otros finetunes no esta cuantificado.
- Al ser un merge de dos finetunes sin evaluacion publica, puede presentar degradaciones en tareas especificas (codigo, matematicas) respecto al modelo base.
- Riesgo de alucinacion inherente a los modelos generativos; el canal de pensamiento no garantiza correccion.
- Licencia no declarada en la informacion disponible: antes de uso comercial hay que verificar la licencia del modelo base y del merge en sus repositorios originales.
- Idiomas soportados no documentados; no se puede asumir un rendimiento multilingue homogeneo, y menos aun en castellano.
- Longitud de contexto no disponible: planificar el despliegue con contexto conservador para evitar degradacion o fallos de memoria.
- El soporte de audio requiere el fichero mmproj adicional; sin el, el modelo solo procesa texto e imagen.
- El repo completo ocupa 428,1 GB; descargar solo la variante necesaria para no saturar el almacenamiento.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/Sorihon_Lunar-Memories-26B-A4B-GGUF
- Modelo base: https://huggingface.co/Sorihon/Lunar-Memories-26B-A4B
- Cuantizacion Q4_K_M: https://huggingface.co/bartowski/Sorihon_Lunar-Memories-26B-A4B-GGUF/blob/main/Sorihon_Lunar-Memories-26B-A4B-Q4_K_M.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp b12600: https://github.com/ggml-org/llama.cpp/releases/tag/b12600
