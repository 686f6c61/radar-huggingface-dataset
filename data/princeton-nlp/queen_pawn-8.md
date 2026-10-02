# princeton-nlp/queen_pawn-8

## Resumen

queen_pawn-8 es un modelo de analisis de posiciones de ajedrez desarrollado por princeton-nlp. No se trata de un modelo de lenguaje convencional: combina un decodificador SmolLM3-3B afinado, un modulo de cross-attention de tipo Flamingo entrenado y un codificador de tablero LC0 BT5. Su funcion es generar texto explicativo sobre jugadas a partir de una posicion dada en notacion FEN, razonando sobre el tablero gracias a la ruta de condicionamiento por tablero.

El modelo es una release de inferencia del checkpoint sol-full-8 en el paso 17.500. Tiene 3.075.256.320 parametros (aproximadamente 3,08 mil millones) y el repositorio ocupa 9,0 GB, de los cuales unos 8,4 GiB corresponden a los pesos combinados en BF16. La salida es JSON e incluye el texto legible, los tokens de punto de vista del modelo y, cuando es posible extraerla, una jugada legal en formato UCI.

Es relevante porque ejemplifica un patron poco habitual: condicionar un LLM a un estado estructurado (el tablero) mediante cross-attention aprendida, en lugar de serializar el estado como texto. Para desarrolladores e investigadores interesados en IA aplicada a dominios con estado formal, este modelo es un caso de estudio concreto de arquitectura hibrida LLM mas encoder externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador SmolLM3-3B afinado, con cross-attention Flamingo aprendida y codificador de tablero LC0 BT5 (BT5-1024x15x32h-rpe-swa-3700000); condicionado por tablero |
| Parametros totales | 3.075.256.320 (3,08 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (unico dtype validado en el entorno de origen: BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible; la model card no aserta una licencia global para la release combinada y remite a los terminos de los componentes upstream (SmolLM3-3B, Apache-2.0; codificador de Leela Chess Zero) |
| Formato de pesos | safetensors (decodificador fusionado en la raiz) mas xattn.pt (cross-attention) y pesos del codificador LC0 convertidos en lc0/ |

## Arquitectura y entrenamiento

El modelo parte de HuggingFaceTB/SmolLM3-3B, un decodificador transformer de aproximadamente 3B parametros, y lo afina para la tarea de analisis de ajedrez. Sobre ese decodificador se anade una ruta de cross-attention inspirada en Flamingo, entrenada de forma independiente y almacenada como xattn.pt, que inyecta informacion del tablero en la generacion. El estado del tablero no se serializa como texto: lo procesa el codificador LC0 BT5-1024x15x32h-rpe-swa-3700000, un transformer con atencion por pares relativos y sliding window attention, procedente de Leela Chess Zero y convertido para este release.

La model card indica que se trata de una release de inferencia del checkpoint sol-full-8, en el paso 17.500. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada. El release excluye explicitamente los datos de entrenamiento, el estado del optimizador y los conjuntos de evaluacion. Como innovacion tecnica destacable esta la combinacion de un decoder LLM con un encoder de tablero especifico del dominio y una cross-attention aprendida, integrados en un runner de inferencia autocontenido.

## Capacidades

- Generacion de texto explicativo sobre jugadas de ajedrez a partir de una posicion en FEN.
- Analisis de posiciones condicionado por el tablero mediante cross-attention, no por descripcion textual.
- Emision de una jugada legal en formato UCI cuando el texto generado permite extraerla (best_move_uci).
- Manejo de historial de posiciones: acepta una lista cronologica de FEN previos mediante --history; sin historial usa la convencion de "sin historial" del encoder.
- Decodificacion controlable: temperatura, top-k y top-p configurables, ademas de decodificacion greedy con --temperature 0.
- Salida estructurada en JSON con text, raw_text (tokens de punto de vista del modelo) y best_move_uci.
- Capacidad multilingue: no disponible; el modelo declara unicamente ingles (en).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision, audio u otras modalidades: no disponible; la unica entrada estructurada es el tablero de ajedrez.

## Casos de uso

- Analisis de posiciones para entrenadores: dada una posicion en FEN, el modelo genera una explicacion en lenguaje natural que el entrenador puede revisar con el alumno; el condicionamiento por tablero evita errores de descripcion textual de la posicion.
- Generacion de comentarios automaticos para partidas: alimentando un historial cronologico de FEN mediante --history, se puede construir un comentario jugada a jugada para publicar en un visor de partidas.
- Preprocesado para motores de ajedrez: usar el modelo para producir candidatos de jugada en UCI y un razonamiento asociado, que despues se validan con un motor antes de integrarlos en un pipeline de analisis.
- Investigacion en condicionamiento de LLM sobre estado formal: sirve como banco de pruebas para estudiar como la cross-attention Flamingo modula la generacion respecto al texto autoregresivo puro.
- Herramientas didacticas interactivas: un frontend que envie FEN y reciba JSON con texto y jugada sugerida, mostrando ambos al usuario en una interfaz de estudio.
- Etiquetado asistido de datasets de ajedrez: generar explicaciones candidatas para posiciones que posteriormente son revisadas y corregidas por anotadores humanos.
- Evaluacion comparativa de representaciones de tablero: sirve para comparar el rendimiento de un encoder LC0 frente a enfoques que serializan el tablero como texto, ya que expone la ruta de condicionamiento de forma aislada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona un smoke test end-to-end en BF16 sobre CUDA con una unica posicion, ejecutado en una H100 de 80 GB con una fraccion de memoria vLLM de 0,20, y remite a VALIDATION.json para las comprobaciones realizadas sobre el paquete exportado. El autor indica expresamente que esta prueba es una verificacion de ejecucion, no un benchmark de precision ajedrecistica ni una especificacion minima de GPU validada.

## Requisitos de hardware

- VRAM estimada: los pesos combinados ocupan unos 8,4 GiB; hay que sumar espacio para el decodificador, la cross-attention, el encoder, la cache KV y las activaciones. El autor propone 24 GiB o mas como configuracion de partida conservadora, no como minimo medido.
- GPU recomendadas: se ha verificado una H100 de 80 GB (fraccion de memoria vLLM de 0,20 en el smoke test). Cualquier GPU NVIDIA con CUDA y 24 GiB o mas es un punto de partida razonable. No hay datos de consumo en GPUs de gama consumer.
- Compatibilidad con GPU consumer: no disponible; no se especifica ninguna RTX en la informacion proporcionada.
- CPU: la inferencia en CPU no esta implementada; el runner detecta CUDA y falla de forma explicita cuando no esta disponible.
- Opciones de despliegue: el paquete incluye un runner propio (infer.py) que usa vLLM; se ejecuta con Python 3.12 y un entorno fijado en requirements-inference.txt. No se contempla cargar solo los pesos de la raiz con AutoModelForCausalLM, porque eso omite la ruta de condicionamiento por tablero.
- Configuracion relevante: el runner usa ejecucion eager, el runner V1 en proceso y prefix caching desactivado de forma deliberada. No se debe activar prefix caching, ya que prompts de texto identicos pueden corresponder a tableros distintos.
- Latencia y throughput: no disponible. Solo se documenta que las explicaciones largas pueden requerir --max-tokens 8192 y que las salidas truncadas pueden no contener jugada.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks que permitan una comparacion cuantitativa con alternativas. La comparacion siguiente se limita a los datos publicados en la informacion disponible y marca como no disponible cualquier metrica de rendimiento.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| princeton-nlp/queen_pawn-8 | 3,08 mil millones (mas encoder y cross-attention) | no disponible | no disponible | no disponible; terminos upstream aplicables | HuggingFace, 0 descargas y 0 likes en el momento del registro |
| SmolLM3-3B (modelo base) | aproximadamente 3B | no disponible en esta informacion | no disponible | Apache-2.0 | HuggingFace |
| Leela Chess Zero (encoder BT5) | no disponible | no disponible | no disponible | terminos de LC0 | lczero.org |

No se han identificado en la informacion proporcionada otros modelos de lenguaje de ajedrez condicionados por tablero con los que comparar de forma directa.

## Limitaciones y advertencias

- Las explicaciones y variantes generadas pueden ser incorrectas; el autor pide validar las jugadas antes de usarlas.
- No es un oraculo de ajedrez verificado ni un ejecutable UCI; la jugada emitida es una extraccion del texto, no una eleccion garantizada por un motor.
- Si la generacion se trunca, la salida puede no contener ninguna jugada y best_move_uci quedara como null.
- El modelo solo declara soporte de ingles; no hay capacidades multilingues documentadas.
- No se debe cargar unicamente los pesos de la raiz con AutoModelForCausalLM: se omite la ruta de condicionamiento por tablero y el resultado carece de sentido.
- No se debe activar prefix caching en el despliegue, porque prompts de texto identicos pueden referirse a tableros diferentes y no deben compartir cache condicionada.
- La inferencia en CPU no esta implementada y el runner falla si CUDA no esta disponible.
- El release excluye datos de entrenamiento, estado del optimizador y conjuntos de evaluacion, lo que impide auditar sesgos o composicion del dataset.
- Licencia: la model card no aserta una licencia global para la release combinada; los terminos de los componentes upstream (SmolLM3-3B y Leela Chess Zero) siguen siendo aplicables. No hay confirmacion de uso comercial, por lo que conviene revisar los terminos upstream antes de desplegarlo en produccion.
- No hay benchmarks de precision ajedrecistica publicados, solo un smoke test de ejecucion.
- Riesgo de alucinacion: la propia model card advierte que el texto generado puede ser incorrecto, algo esperable en un decodificador de 3B con decodificacion muestreada por defecto (temperatura 0,6, top-k 20, top-p 0,95).
- Sesgos conocidos: no disponible.

## Enlaces

- HuggingFace: https://huggingface.co/princeton-nlp/queen_pawn-8
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Leela Chess Zero: https://lczero.org/
