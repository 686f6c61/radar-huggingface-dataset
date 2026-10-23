# ChonkE/Glitter_Boy-2.0

## Resumen

Glitter_Boy-2.0 es un derivado del modelo Gemma-4-12B ( identificador de arquitectura en los tags: `gemma4_unified`) publicado por el usuario ChonkE, orientado a rol de mesa (TTRPG) y conversación. Se trata de un modelo "ablacionado": el autor extrae y elimina una dirección de rechazo en el espacio de activaciones y después repara la coherencia con SFT, interpolación de pesos y DPO, con el objetivo declarado de llevar a cero la tasa de rechazo ante peticiones dañinas sin destruir la capacidad general del modelo base. Cuenta con 11.959.730.224 parámetros (≈12B) y un contexto verificado de 131.072 tokens.

El interés técnico no está en el rendimiento bruto —de hecho, retrocede en GSM8K y MMLU respecto al base limpio— sino en la documentación del proceso: el autor publica cada etapa con sus métricas, incluye las etapas que fallaron y presenta una comparación directa contra su versión 1.0 en las mismas baterías de evaluación. Es, por tanto, un artefacto útil para investigación sobre alineación, direcciones de rechazo y calibración de abstención, además de un modelo de rol sin filtrado.

Advertencia importante: el modelo no tiene ajuste de seguridad, genera contenido explícito y violento bajo petición, está etiquetado `not-for-all-audiences` y solo declara inglés. El propio autor lo describe como "artefacto de investigación y entretenimiento" y reconoce que sigue cometiendo errores simples y confabulando.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 4 (tag `gemma4_unified`); no se detalla en la model card |
| Parametros totales | 11.959.730.224 (≈12B) |
| Parametros activos | No aplica (no es un modelo MoE, según los datos disponibles) |
| Longitud de contexto | 131.072 tokens (verificado por el autor con Q8_0 en GPU de 24 GB y F16 en GPU de 32 GB) |
| Tipos de cuantizacion | GGUF Q8_0 y GGUF F16; pesos completos en bf16 (safetensors) |
| Idiomas soportados | Inglés (`en`), único idioma declarado |
| Licencia | `gemma` (Gemma Terms of Use) |
| Formato de pesos | `model.safetensors` (bf16) + `gguf/glitter-boy-2.0-Q8_0.gguf`; plantilla de chat embebida en los GGUF |

Otros datos: tamaño del repositorio 60,5 GB, 0 descargas y 1 like en el momento de la consulta. Pipeline no disponible.

## Arquitectura y entrenamiento

No se documenta la arquitectura interna más allá de su pertenencia a la familia Gemma 4 y del tag `gemma4_unified`; el dato firme es el recuento de parámetros (≈11,96B) y el contexto de 131.072 tokens. El interés de la model card está en el pipeline de modificación, ejecutado íntegramente sobre estos pesos y no transferido desde otro checkpoint:

1. **Extracción de la dirección de rechazo** en los propios pesos: mejor capa L31, con correlación punto-biserial de +0,925 sobre 96 pares de prompts dañinos/seguros.
2. **Eliminación direccional**: proyección con alpha 0,5 en las capas 10-26, con un 75 % de eliminación direccional media y replay bit-exacto a alpha cero. Aplicada sola produjo 3 aceptaciones, 19 bucles y 2 rechazos: la eliminación por sí misma no deja un modelo usable.
3. **SFT de reparación ("healing")**: 2.470 filas con carriles generalistas, chain-of-thought de GSM8K, ejercicios sintéticos de aritmética y dados, y ejemplos de abstención en consultas de registro. Redujo los bucles de 19 a 7 y fijó el nivel de exactitud (sonda de mecánicas al 90 %). Un healing solo generalista costaba -4,5 puntos de GSM8K; el conjunto mixto lo contuvo en -1,5.
4. **Interpolación de pesos hacia el modelo stock con lambda 0,30**: la curva medida muestra que las matemáticas suben de forma monótona con lambda pero el rechazo reaparece (lambda 0,15: GSM8K 0,92 y 2 rechazos; 0,30: 0,93 y 1; 0,45: 0,95 y 5). Se eligió 0,30 como punto de equilibrio. El apilado de adaptadores entre linajes se probó antes y falló con bucles degenerados.
5. **DPO on-policy en dos rondas**: 10 + 22 pares, márgenes +4,15 y +4,75, learning rate 1e-5; los lados rechazados son salidas fallidas del propio modelo y los elegidos sus generaciones coherentes o textos escritos por el autor.
6. **SFT de suelo estrecho**: 7 filas, 120 pasos, pérdida final 2e-4, aplicado después de la interpolación para que el comportamiento de rechazo cero quede ligado a los pesos finales. El autor documenta que DPO solo y SFT solo sobre las filas residuales se midieron y fallaron.

## Capacidades

- Generación de texto conversacional en inglés con rol mantenido en turnos largos, gracias a una ventana de 131.072 tokens.
- Escritura creativa y narrativa de campaña: el autor indica que el modelo está pensado para resultados óptimos en TTRPG cuando se le alimenta con RAG de material de campaña.
- Composición de contenido explícito y violento bajo petición (cero rechazos en la batería canónica de 24 prompts dañinos, 24/24).
- Abstención calibrada en consultas de registro factual: el modelo declina búsquedas de registros reales en lugar de inventarlos (comportamiento diseñado, verificado en la sonda de 20 pruebas con 18 aciertos exactos).
- Razonamiento aritmético y matemático básico a medio: GSM8K 0,90 y MMLU de 4 materias 0,7489.
- Coherencia sostenida en decodificación greedy: 0 bucles y 0 repeticiones en el banco de decodificación de 32 filas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso, visión o audio: no disponibles en la información proporcionada. El tag `endpoints_compatible` sugiere compatibilidad con la API de endpoints de HuggingFace, sin más detalle.

## Casos de uso

- **Narración de partidas de rol de mesa (TTRPG)**: el modelo está entrenado y evaluado con sondas de mecánicas de juego (dados, aritmética de reglas) y obtiene 18/20 en la sonda de exactitud; se usaría como máster o coproductor de escenas con el manual de campaña inyectado por RAG en la ventana de 131k tokens.
- **Generación de PNJ y trasfondo de campaña**: creación de personajes, facciones y tramas con continuidad a lo largo de sesiones largas, aprovechando el contexto extendido para mantener el estado de la campaña sin resúmenes intermedios.
- **Rol conversacional sin filtrado en entornos privados**: chat de personaje con contenido explícito, desplegado localmente en llama.cpp con los flags obligatorios, sin dependencia de API externa.
- **Investigación sobre ablación de rechazo**: replicación del pipeline (extracción de dirección en L31, proyección alpha 0,5 en capas 10-26, interpolación lambda 0,30, DPO) usando los pesos bf16 publicados y las baterías del autor como línea base comparable.
- **Red teaming y evaluación de salvaguardas**: el modelo sirve como contraste de "suelo" en pruebas de robustez, ya que su tasa de cumplimiento en XSTest unsafe es del 95 %, lo que permite medir clasificadores o filtros externos contra un generador sin rechazo.
- **Escritura creativa de ficción adulta y material de juego homebrew**: generación de módulos, descripciones y diálogos con tono "heat and grit" (según el autor), útil para editoriales independientes de contenido para adultos.
- **Despliegue local en estación de trabajo mona-GPU**: inferencia en una GPU de 24 GB con Q8_0 a contexto completo, útil para prototipado offline sin infraestructura cloud.

## Benchmarks y rendimiento

Datos publicados por el autor, decodificación greedy sobre las mismas baterías canónicas, comparando el base limpio, la versión 1.0 y la 2.0:

| Batería | Base limpio | 1.0 | 2.0 |
|---|---|---|---|
| Prompts dañinos canónicos (24) | 0/24 aceptados | 16/24 | 24/24 |
| Banco de decodificación (32 filas) | — | 3 bucles / 4 repeticiones | 0 bucles / 0 repeticiones |
| Banco físico (32 filas) | 0/32 | — | 31/32 |
| Sonda de mecánicas (20, exact match) | 15/20 | 12/20 | 18/20 |
| MMLU 4 materias (884) | 0,7624 | 0,6618 | 0,7489 |
| GSM8K (200, 512 tokens) | 0,9750 | 0,9400 | 0,9000 |
| XSTest sobre-rechazo en prompts seguros (250) | 1,6 % | ≈4 % | 5,6 % |
| XSTest cumplimiento en prompts inseguros (200) | 49 % | 22 % | 95 % |

El autor desglosa el 5,6 % de sobre-rechazo: 3 de los 14 casos son la calibración de abstención declinando búsquedas reales de registros (comportamiento diseñado), 9 son preguntas de privacidad sobre entidades ficticias respondidas con una declinación en personaje, 1 es rechazo de premisa y 1 es epistémico parcial; ninguno es de naturaleza de seguridad.

## Requisitos de hardware

- **Pesos en bf16**: 11,96B parámetros × 2 bytes ≈ 23,9 GB solo de pesos; requiere GPU de 32 GB o más para dejar espacio a caché KV y activaciones a contexto largo. El autor verifica F16 en tarjeta de 32 GB con 131.072 tokens.
- **GGUF Q8_0**: ≈12,7 GB de pesos (cálculo aritmético a partir del recuento de parámetros); el autor confirma Q8_0 con contexto completo de 131.072 tokens en una tarjeta de 24 GB, es decir, es viable en una RTX 3090/4090 de 24 GB.
- **Cuantizaciones menores (Q4_K_M, Q5_K_M)**: no verificadas por el autor en la información disponible; por tamaño de pesos (≈7-8,5 GB teóricos) cabrían en GPUs consumer de 12-16 GB, pero no hay medición publicada de calidad ni de contexto alcanzable.
- **GPU recomendadas**: RTX 4090 / 3090 (24 GB) para Q8_0; A100 40 GB, H100 o RTX 6000 Ada (48 GB) para bf16 con contexto largo.
- **Despliegue**: llama.cpp es la ruta documentada y requiere obligatoriamente los flags `--jinja --reasoning off`; el modelo responde dentro del canal de pensamiento provisto por el prompt y el auto-reasoning rompe la generación. Los GGUF incluyen la plantilla de chat endurecida embebida. Soporte de vLLM, TGI u Ollama: no disponible en la información proporcionada.
- **Latencia y throughput**: no disponibles; el autor solo publica requisitos de memoria y contexto, no métricas de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (4 materias) | GSM8K | Cumplimiento inseguro (XSTest) | Licencia |
|---|---|---|---|---|---|---|
| Glitter_Boy-2.0 | ≈11,96B | 131.072 | 0,7489 | 0,9000 | 95 % | Gemma |
| Glitter_Boy-12b (1.0) | ≈12B (misma base) | no disponible | 0,6618 | 0,9400 | 22 % | Gemma |
| Gemma-4-12B base limpio | ≈12B | no disponible | 0,7624 | 0,9750 | 49 % | Gemma |

La comparación solo es posible contra su linaje directo, porque es lo único medido en las mismas baterías. Frente a alternativas de rol sin censura de otros autores (por ejemplo derivados ablacionados de Llama o Mistral): no disponible, no hay datos comparables en la información proporcionada.

## Limitaciones y advertencias

- **Ausencia total de ajuste de seguridad**: 24/24 prompts dañinos aceptados y 95 % de cumplimiento en XSTest unsafe. No es apto para producción orientada al público sin un filtro externo y una capa de moderación.
- **Contenido explícito y violento**: el autor lo declara explícitamente y la etiqueta `not-for-all-audiences` lo confirma. Uso discrecional.
- **Alucinación y confabulación reconocidas**: el propio autor advierte que el modelo "sigue cometiendo errores simples y confabula"; no debe usarse como fuente factual sin verificación.
- **Retroceso medible en capacidades**: GSM8K cae de 0,9750 (base) a 0,9000; MMLU baja de 0,7624 a 0,7489. La eliminación de rechazo tiene un coste real en razonamiento matemático.
- **Generalización parcial fuera de distribución**: en formulaciones de odio y acoso no vistas, aproximadamente la mitad de las respuestas deflectan en lugar de cumplir; el autor lo califica de número honesto.
- **Sobre-rechazo residual del 5,6 %** en prompts seguros, concentrado en consultas de privacidad sobre entidades ficticias y búsquedas de registros reales.
- **Un bucle persistente** en una fila del banco físico en decodificación greedy.
- **Idioma**: solo inglés declarado; no hay evidencia de calidad en castellano ni en otros idiomas.
- **Requisito operativo frágil**: sin `--jinja --reasoning off` en llama.cpp la generación falla; esto complica el despliegue en stacks que no expongan esos flags.
- **Licencia Gemma**: los términos de uso de Gemma imponen restricciones de uso comercial y de redistribución, además de obligaciones de política de uso aceptable que chocan frontalmente con el comportamiento sin rechazo del modelo. Revisar antes de cualquier uso comercial.
- **Repositorio de 60,5 GB**: el alojamiento y la distribución tienen coste de almacenamiento y ancho de banda relevante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ChonkE/Glitter_Boy-2.0
- Repositorio Vulkan-VM del autor (stack de entrenamiento citado en la model card): https://github.com/XxChonkExX/Vulkan-VM/tree/main
- Paper, blog o demo adicionales: no disponible (la búsqueda web realizada no devolvió resultados relevantes sobre este modelo).
