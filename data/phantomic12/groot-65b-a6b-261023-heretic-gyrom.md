# phantomic12/Groot-65B-A6B-261023-Heretic-GyroM

## Resumen

Groot-65B-A6B-261023-Heretic-GyroM es una cuantizacion GGUF en formato Gyro-M (trellis `TQ2_T`) del modelo Groot-65B-A6B-261023-Heretic-ARA, una version "abliterated" (sin mecanismos de rechazo) del modelo base Groot-65B-A6B-261023 desarrollado por GrootTeam. El autor de esta publicacion es el usuario de Hugging Face phantomic12, que no ha reentrenado ni recuantizado el modelo desde cero, sino que ha realizado un injerto (splice) de tensores: ha sustituido unicamente los 16 tensores densos modificados por la abliteracion dentro del fichero GGUF ya existente de BoxyFit, manteniendo intactos los 12.288 expertos enrutados.

El modelo es un transformer de tipo Mixture of Experts (MoE) con 116.514.464.640 parametros totales segun los pesos en safetensors del modelo base, de los cuales aproximadamente 60.400 millones corresponden a pesos de expertos enrutados (dato citado en la model card). La nomenclatura "65B-A6B" sugiere 65 mil millones de parametros totales y 6 mil millones activos por token, aunque esta interpretacion no se confirma explicitamente en la informacion disponible. El contexto maximo, los idiomas exactos y los detalles de entrenamiento no se detallan en la informacion proporcionada.

Su relevancia radica en dos factores: por un lado, la tecnica de abliteracion reduce drasticamente las tasas de rechazo (de 116/120 a 10/120 segun la model card del modelo Heretic de Luni), lo que lo hace atractivo para aplicaciones que requieren respuestas sin filtros; por otro, la estrategia de splice permite obtener un GGUF cuantizado sin el coste computacional de una recodificacion completa, que el autor estima en unas 61 horas sobre 24 hilos de CPU. La licencia es qwen-community-1.0, lo que vincula la estirpe del modelo a la familia Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), con capas de atencion lineal (`linear_attn`) y atencion estandar (`self_attn`) |
| Parametros totales | 116.514.464.640 |
| Parametros activos | aproximadamente 6B (segun nomenclatura A6B; no confirmado explicitamente) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TQ2_T (trellis) para expertos enrutados; F32, Q4_K, Q5_0, Q8_0 para tensores densos |
| Idiomas soportados | en, de, multilingual (segun tags) |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con 12.288 expertos enrutados distribuidos en multiples capas y un router `mlp.gate` por capa. La model card del splice indica que la red incluye tanto capas de atencion estandar (`self_attn.o_proj`) como capas de atencion lineal (`linear_attn.out_proj`), lo que apunta a un diseno hibrido entre atencion completa y atencion lineal, aunque no se detalla la proporcion ni la disposicion exacta. Tambien se menciona un `shared_expert.down_proj`, lo que confirma la presencia de expertos compartidos ademas de los enrutados.

El modelo original Groot-65B-A6B-261023 fue desarrollado por GrootTeam; sobre el se aplico una abliteracion (Heretic 2.0 ARA) por parte de Luni, que modifico 16 tensores densos y ninguno de los 12.288 expertos enrutados, con una divergencia KL de 0.496 respecto al base y una reduccion de rechazos de 116/120 a 10/120. La cuantizacion Gyro-M de BoxyFit aplica el formato trellis `TQ2_T` a los pesos de expertos. Esta publicacion de phantomic12 no reentrena ni recuantiza: sustituye los 16 tensores abliterated dentro del GGUF de BoxyFit, preservando el tipo ggml original de cada tensor (F32, Q4_K, Q5_0, Q8_0) y verificando que 1.208 de 1.224 tensores permanecen byte a byte identicos al fichero base. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a dialogos sin restricciones de contenido.
- Razonamiento y respuesta a instrucciones en ingles y aleman, con soporte multilingue adicional segun los tags.
- Capacidad de "uncensored": la abliteracion elimina los mecanismos de rechazo en la mayoria de casos (10/120 rechazos frente a 116/120 del base).
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente, aunque la naturaleza MoE y el contexto conversacional lo permiten tecnicamente.
- Capacidades de vision o audio: no disponibles.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Generacion creativa sin filtros: el modelo puede producir narrativa, guiones o contenido editorial sin las restricciones de rechazo tipicas de modelos alineados, gracias a la abliteracion que reduce los rechazos a 10/120.
- Investigacion sobre seguridad y alineacion: util para estudiar el comportamiento de modelos abliterated frente a sus versiones base, comparando tasas de rechazo y divergencia KL (0.496 en este caso).
- Asistente conversacional en aleman e ingles: los tags declaran soporte para ambos idiomas, lo que permite desplegarlo en atencion al cliente o asistencia interna en entornos germanoparlantes.
- Prototipado rapido en local: al estar en formato GGUF y pesar 54,5 GB, puede ejecutarse con llama.cpp u Ollama en estaciones de trabajo con suficiente VRAM o RAM, sin necesidad de infraestructura de servidor.
- Experimentacion con cuantizacion trellis: el fichero sirve como referencia para validar tecnicas de splice de tensores en GGUF, ya que la model card documenta verificaciones byte a byte y correlaciones de decodificacion superiores a 0.9971.
- Generacion de texto en pipelines de investigacion: para tareas de completado, resumen o parafraseo donde se requiera un modelo MoE de gran capacidad y no se necesite alineacion estricta.
- Evaluacion comparativa de variantes abliterated: permite contrastar el comportamiento del modelo Heretic frente al Groot original en tareas de razonamiento y generacion abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que este fichero "no es un benchmark nuevo" y que cualquier cifra de la model card de BoxyFit describe el GyroM base, no esta variante abliterated, que no ha sido reevaluada.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF pesa 54,5 GB, por lo que se necesita al menos esa cantidad de VRAM (o RAM si se usa offloading parcial) para cargarlo completo. Con cuantizacion TQ2_T en expertos y tensores densos en Q4_K/Q5_0/Q8_0/F32, el peso real ronda los 54,5 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para carga completa en VRAM. Una RTX 4090 (24 GB) no puede alojar el modelo completo en VRAM.
- Cabe en consumer GPU: no de forma completa. Es posible con offloading parcial a RAM del sistema (por ejemplo, con llama.cpp), aunque el rendimiento se vera penalizado.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este formato trellis, por lo que no estan confirmados.
- Latencia y throughput estimados: no disponibles. La model card no proporciona mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Groot-65B-A6B-261023-Heretic-GyroM (este) | 116,5B totales / ~6B activos | no disponible | qwen-community-1.0 | GGUF (TQ2_T) | Abliterated, cuantizacion trellis |
| Groot-65B-A6B-261023 (GrootTeam) | 116,5B totales / ~6B activos | no disponible | qwen-community-1.0 | safetensors | Modelo base original, alineado |
| Groot-65B-A6B-261023-Heretic-ARA (Luni) | 116,5B totales / ~6B activos | no disponible | qwen-community-1.0 | safetensors | Abliterated, sin cuantizar |
| Groot-65B-A6B-GyroM (BoxyFit) | 116,5B totales / ~6B activos | no disponible | qwen-community-1.0 | GGUF (TQ2_T) | Cuantizacion base sin abliterar |

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo abliterated, se eliminan los mecanismos de rechazo, lo que puede exponer sesgos subyacentes del entrenamiento original sin filtro. No se documentan evaluaciones de sesgo en la informacion disponible.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas para esta variante; la model card advierte que no ha sido reevaluada tras el splice.
- Limitaciones de contexto e idioma: el contexto maximo no esta documentado; los idiomas declarados son en, de y multilingual, sin garantia de calidad en otros idiomas.
- Restricciones de licencia: la licencia qwen-community-1.0 puede imponer condiciones al uso comercial; se debe consultar el enlace de licencia del modelo base antes de desplegarlo en produccion.
- Caveat de produccion: el autor indica que este fichero no es un lanzamiento oficial de GrootTeam y no esta respaldado por ellos. La abliteracion cambia el comportamiento y no se ha medido su impacto en tareas de razonamiento o codigo.
- Verificacion tecnica: aunque el splice se valido con correlaciones de decodificacion superiores a 0.9971 y comprobaciones byte a byte, no se garantiza que el comportamiento sea identico al del modelo Heretic-ARA original en todos los casos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phantomic12/Groot-65B-A6B-261023-Heretic-GyroM
- Modelo base GrootTeam: https://huggingface.co/GrootTeam/Groot-65B-A6B-261023
- Modelo Heretic-ARA de Luni: https://huggingface.co/Luni/Groot-65B-A6B-261023-Heretic-ARA
- Cuantizacion GyroM de BoxyFit: https://huggingface.co/BoxyFit/Groot-65B-A6B-GyroM
- Licencia: https://huggingface.co/GrootTeam/Groot-65B-A6B-261023/blob/main/LICENSE
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Strata (herramienta de cuantizacion): https://github.com/Niko1221/Strata
