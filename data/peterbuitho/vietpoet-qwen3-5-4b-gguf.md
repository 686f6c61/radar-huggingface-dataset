# peterbuitho/VietPoet-Qwen3.5-4B-GGUF

## Resumen

VietPoet-Qwen3.5-4B-GGUF es un ajuste fino del modelo base Qwen/Qwen3.5-4B, publicado por el usuario peterbuitho, especializado en la generación de poesía vietnamita en la forma métrica *lục bát* (seis-ocho). El modelo se distribuye exclusivamente en formato GGUF cuantizado, pensado para su uso local con LM Studio o llama.cpp, e incluye dos ficheros: Q8_0 (4,6 GB) y Q4_K_M (2,8 GB).

El ajuste se realizó mediante QLoRA sobre 8.000 poemas y 2 épocas, partiendo del corpus phamson02/vietnamese-poetry-corpus filtrado con un verificador de reglas de *lục bát*. El modelo cuenta con 4.326.350.848 parámetros totales (unos 4,33 mil millones) y está publicado bajo licencia Apache-2.0. Su idioma de trabajo es únicamente el vietnamita.

Su relevancia radica en que aborda una tarea muy específica y con reglas formales estrictas (longitud 6/8, reglas de tono y rima) que los modelos generalistas rara vez respetan. El autor lo presenta como un componente de un sistema mayor: el repositorio ThoLucBat, que aporta un muestreador línea a línea y un verificador de reglas. Según la model card, el modelo por sí solo "escribe la forma correcta pero rompe las reglas de tono con más frecuencia", de modo que su valor práctico depende en gran medida del *pipeline* que lo acompaña.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; se hereda del modelo base Qwen/Qwen3.5-4B (familia Qwen) |
| Parametros totales | 4.326.350.848 (aproximadamente 4,33 mil millones) |
| Parametros activos | No aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q8_0 y GGUF Q4_K_M |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp / LM Studio) |
| Modelo base | Qwen/Qwen3.5-4B |
| Metodo de ajuste | QLoRA, 8.000 poemas, 2 epocas |
| Dataset de entrenamiento | phamson02/vietnamese-poetry-corpus (CC BY 4.0), filtrado por verificador de reglas luc bat |
| Tamano del repositorio | 7,4 GB |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

No se detallan en la informacion disponible los pormenores arquitectonicos del modelo (tipo de atencion, uso de atencion lineal, decodificacion especulativa ni configuracion de capas). Lo unico confirmado es que se trata de un ajuste fino del modelo Qwen/Qwen3.5-4B mediante QLoRA, con un total de 4.326.350.848 parametros, y que los pesos resultantes se exportaron a GGUF para inferencia local en CPU o GPU.

En cuanto a los datos, el entrenamiento uso 8.000 poemas durante 2 epocas, extraidos del corpus phamson02/vietnamese-poetry-corpus y filtrados para conservar unicamente aquellos que superan un verificador de reglas de *lục bát*. La model card no menciona fases de RLHF, DPO ni otros procesos de alineacion posteriores. La innovacion tecnica no reside en la arquitectura, sino en el enfoque de sistema: el modelo se disena para funcionar junto a un muestreador que genera 16 candidatos por linea y descarta aquellos que no cumplen las reglas de longitud 6/8, tono y rima, y junto a un verificador que valida el poema completo. El formato de prompt es el chat de Qwen con el modo *thinking* desactivado, incluyendo un bloque `<think>` vacio en el turno del asistente.

## Capacidades

- Generacion de poesia vietnamita en forma *lục bát*, con control de la estructura de 6 y 8 silabas por linea.
- Cumplimiento de reglas de tono y rima cuando se combina con el muestreador y el verificador del repositorio ThoLucBat; sin ese sistema, la tasa de infraccion de la regla tonal de la sexta y octava silaba de las lineas *bát* alcanza el 38%.
- Generacion de poemas de 8 *câu* (versos) a partir de un tema indicado en el prompt, con varias plantillas de peticion definidas en `app/prompts.py`.
- Formato conversacional basado en el chat template de Qwen, con soporte de turnos de sistema, usuario y asistente.
- Soporte de cuantizacion GGUF para ejecucion en LM Studio y llama.cpp.
- No se documentan capacidades de *tool calling*, uso de agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento activo (el *thinking* se desactiva explicitamente).
- Capacidad multilingue: no disponible; la unica lengua declarada es el vietnamita.

## Casos de uso

- Generacion de poesia *lục bát* con control formal: el modelo se usa dentro del *pipeline* de ThoLucBat, que lanza 16 muestras por linea y conserva unicamente las que cumplen longitud, tono y rima. Con esa configuracion alcanza una puntuacion de reglas de 0,991 en Q8_0 y el 95% de poemas plenamente validos.
- Herramienta educativa para la ensenanza de la metrica *lục bát*: el verificador de reglas permite mostrar al alumnado, linea a linea, por que un verso generado cumple o incumple las reglas de tono y rima, usando el modelo como generador de ejemplos.
- Preservacion y difusion cultural: generacion de poemas para blogs, antologias digitales o publicaciones divulgativas sobre poesia popular vietnamita, ejecutando el modelo en local y sin coste de API.
- Borradores de letras y poesia cantada: produccion de versiones iniciales de letra para musica popular vietnamita, que despues un autor humano revisa y corrige el significado.
- Aumento de datos para investigacion: generacion de corpus sintetico de *lục bát* ya validado formalmente, utilizable como material de aumento para entrenar o evaluar otros modelos de poesia vietnamita.
- Asistente conversacional local especializado: gracias al formato de chat de Qwen y a la compatibilidad con LM Studio, puede desplegarse como bot de escritorio en Windows mediante el instalador `VietPoet-win.zip` del repositorio del autor.
- Linea base en investigacion sobre generacion y traduccion poesia-a-poesia: el modelo y su evaluador formal sirven como referencia reproducible para trabajos que sigan la linea del articulo arXiv:2401.01078.
- Integracion en aplicaciones de escritorio sin conexion: los ficheros GGUF (Q4_K_M de 2,8 GB) permiten desplegar la generacion en equipos sin GPU dedicada, ejecutando el modelo en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos numericos aportados por el autor miden la correccion de la forma poetica, no la calidad literaria, y se obtuvieron sobre 40 prompts de 8 *câu* retenidos, ejecutados en LM Studio.

| Configuracion | Puntuacion de reglas | Poemas plenamente validos | Notas |
|---|---|---|---|
| Q8_0 + muestreador (16 muestras por linea) | 0,991 | 95% | Configuracion de referencia |
| Q4_K_M + muestreador (4 muestras por linea) | 0,982 | 87,5% | Configuracion reducida |
| Modelo sin muestreador | Aproximadamente 0,81 | No disponible | Rompe la regla tonal de la sexta y octava silaba en el 38% de las lineas *bát* |

El propio autor advierte que estas cifras miden la forma y no la poesia: los poemas son *lục bát* correctos, pero el significado suele ser vago o estar fuera de tema, dado que en el entrenamiento el unico indicio tematico era el titulo del poema.

## Requisitos de hardware

- Q8_0: fichero de 4,6 GB. La model card recomienda 10 GB o mas de memoria grafica para esta cuantizacion; con contexto y cache KV, el consumo real de VRAM sera superior al tamano del fichero (estimacion orientativa, no confirmada por el autor).
- Q4_K_M: fichero de 2,8 GB. Pensado para tarjetas graficas mas pequenas o para ejecucion en CPU.
- Repositorio completo: 7,4 GB en disco si se descargan ambas cuantizaciones.
- GPU de consumo: con la recomendacion de 10 GB o mas, Q8_0 encaja en GPUs de gama alta con 12 GB o mas (por ejemplo, RTX 3060 de 12 GB, RTX 4070, RTX 4080, RTX 4090) siempre que el contexto no sea muy largo; en GPUs de 8 GB o menos conviene usar Q4_K_M. Estas asignaciones son estimaciones derivadas del requisito declarado, no mediciones publicadas.
- GPU de centro de datos: A100, H100 o similares pueden ejecutar cualquiera de las dos cuantizaciones sobradamente, aunque estan sobredimensionadas para un modelo de 4,33 mil millones de parametros.
- Opciones de despliegue: LM Studio y llama.cpp son los entornos indicados por el autor. El repositorio incluye un instalador para Windows (`VietPoet-win.zip`) que configura el entorno automaticamente. No se confirma soporte para vLLM, TGI u otros servidores de inferencia con formato GGUF.
- Latencia y throughput: no disponibles. Debe tenerse en cuenta que el muestreador multiplica el coste por 16 generaciones candidatas por linea en la configuracion Q8_0 y por 4 en la de Q4_K_M, lo que incrementa proporcionalmente el tiempo de generacion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos alternativos de poesia vietnamita en la informacion proporcionada.

| Modelo | Parametros | Contexto | Rendimiento en luc bat | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VietPoet-Qwen3.5-4B-GGUF | 4,33 mil millones | No disponible | 0,991 de puntuacion de reglas con Q8_0 + muestreador | Apache-2.0 | GGUF en HuggingFace |
| Qwen/Qwen3.5-4B (modelo base) | No disponible | No disponible | No disponible | Apache-2.0 | Pesos originales en HuggingFace |
| Otros modelos de poesia vietnamita | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Idioma unico: el modelo solo esta entrenado y declarado para vietnamita; no se documenta comportamiento fiable en otras lenguas.
- Calidad semantica limitada: el autor advierte explicitamente que los poemas son formalmente correctos pero el significado suele ser vago o estar fuera de tema, porque en el entrenamiento el unico contexto tematico era el titulo.
- Dependencia del *pipeline*: sin el muestreador y el verificador de ThoLucBat, la puntuacion de reglas cae a aproximadamente 0,81 y se incumple la regla tonal de la sexta y octava silaba en el 38% de las lineas *bát*. El modelo aislado no es fiable para uso formal.
- Degradacion con cuantizacion agresiva: Q4_K_M con solo 4 muestras por linea baja al 87,5% de poemas plenamente validos, frente al 95% de Q8_0.
- Longitud de contexto desconocida: no se publica la ventana de contexto, lo que impide garantizar la coherencia en composiciones largas o en conversaciones multi-turno extensas.
- Riesgo de alucinacion: al ser un modelo generativo de 4,33 mil millones de parametros ajustado con QLoRA sobre 8.000 poemas durante 2 epocas, puede producir referencias culturales, geograficas o historicas inventadas, ademas de repeticiones y calcos del corpus de entrenamiento.
- Sesgos: no se documenta ningun analisis de sesgos del modelo ni del corpus utilizado; el corpus es una fuente unica y su composicion tematica condiciona la salida.
- Validacion externa inexistente: el modelo registra 0 descargas y 0 likes en HuggingFace en el momento de la consulta, por lo que no cuenta con verificacion independiente por parte de la comunidad.
- Licencia del modelo frente a la de los datos: los pesos se publican bajo Apache-2.0, lo que permite uso comercial, pero el dataset de entrenamiento es CC BY 4.0 y exige atribucion. Conviene revisar las implicaciones antes de un despliegue comercial.
- Sin datos de seguridad: no hay informacion sobre evaluaciones de seguridad, alineacion ni filtros de contenido.
- Infraestructura no confirmada: no se confirma compatibilidad con servidores de inferencia distintos de LM Studio y llama.cpp.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/peterbuitho/VietPoet-Qwen3.5-4B-GGUF
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/phamson02/vietnamese-poetry-corpus
- Repositorio con el muestreador y el verificador de reglas: https://github.com/peterbuitho/ThoLucBat
- Articulo de referencia sobre generacion de poesia vietnamita: https://arxiv.org/abs/2401.01078
- Los resultados de busqueda web disponibles no aportaron enlaces adicionales relevantes (unicamente paginas generales de YouTube).
