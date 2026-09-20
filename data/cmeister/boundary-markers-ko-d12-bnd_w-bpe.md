# cmeister/boundary-markers-ko-d12-bnd_w-bpe

## Resumen

El repositorio `cmeister/boundary-markers-ko-d12-bnd_w-bpe` contiene tres modelos de lenguaje en coreano (semillas 0, 1 y 2) entrenados por el usuario cmeister para comparar vocabularios de subpalabras que marcan explicitamente los limites de palabra. La variante entrenada aqui es el esquema `bnd_w` con tokenizacion BPE: inserta un marcador `<|>` a ambos lados de cada palabra, elimina el espacio unico entre palabras marcadas al codificar y lo restaura al decodificar. El objetivo es reproducir en coreano el experimento del articulo "Explicit Boundary Markers for Subword Vocabularies" (Sander Land y Clara Meister, arXiv:2608.08847), que reporta resultados en ingles.

No es un modelo de proposito general ni un asistente: es un artefacto de investigacion sobre tokenizacion. Los tres modelos comparten exactamente la misma arquitectura y tokenizer, y difieren solo en la semilla que fija la inicializacion de pesos y el orden de los datos, de modo que las diferencias de rendimiento se pueden atribuir al vocabulario. La arquitectura es un transformer denso tipo nanochat de 12 capas, anchura 768 y 6 cabezas de atencion, con una ventana de contexto de 2.048 tokens, entrenado durante 2.553 pasos de 524.288 tokens (1.340 millones de tokens) en una unica GPU por modelo.

Su relevancia es metodologica: aporta evidencia empirica, aunque limitada, sobre si marcar explicitamente los limites de palabra mejora la modelizacion de un idioma con morfologia aglutinante como el coreano. El resultado es practicamente neutro y con alta varianza entre semillas, lo que convierte al repositorio en un punto de partida reproducible mas que en un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (nanochat, commit `92d63d4`): 12 capas, anchura 768, 6 cabezas de atencion |
| Parametros totales | no disponible (la model card no publica el recuento) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en precision de entrenamiento) |
| Idiomas soportados | coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch state dict (`seed<n>/model_002553.pt`, cargable con `torch.load(..., weights_only=True)`); tokenizer en JSON comprimido con gzip |
| Vocabulario | 34.686 entradas (34.685 del tokenizer BPE mas el token de inicio de secuencia) |
| Tamano del repositorio | 2,5 GB (tres semillas, tokenizer y logs) |
| Entrenamiento | 2.553 pasos x 524.288 tokens = 1,34 mil millones de tokens |

## Arquitectura y entrenamiento

La arquitectura es la del proyecto nanochat de Andrej Karpathy: un transformer decoder-only denso, sin mezcla de expertos ni mecanismos de estado recurrente. La configuracion concreta es de 12 capas, anchura de modelo 768 y 6 cabezas de atencion, con un contexto maximо de 2.048 tokens. El entrenamiento se lanzo con el script `paper_utils/boundary/downstream/run_arms.sh` del repositorio script_tok, con una GPU dedicada por modelo.

Los datos son 3 shards de Korean FineWeb-2 procedentes del release `fineweb-2_0_1-quality_10-filterrobots`, equivalentes a 1.220 millones de caracteres, leidos aproximadamente 3,1 veces. Con solo 3 shards, las semillas 1 y 2 generaron el mismo orden de shards, por lo que esas dos ejecuciones difieren unicamente en la inicializacion de pesos: los tres modelos cubren dos ordenes de datos distintos, no tres. El tokenizer se entreno con BPE sobre una muestra de 5 GB de Korean FineWeb y aplica el marcador `<|>` en ambos extremos de cada palabra, eliminando el espacio unico intermedio al codificar y reconstruyendolo a partir de los dos marcadores contiguos al decodificar. No se aplico RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generacion de texto en coreano: modelo base de lenguaje, sin ajuste por instrucciones ni plantilla de chat.
- Modelizacion de lenguaje a nivel de byte y subpalabra: la metrica de evaluacion publicada es bits por byte sobre un shard de validacion de Korean FineWeb-2.
- Tokenizacion con marcadores de frontera: soporta codificacion y decodificacion reversibles usando el esquema `bnd_w` mediante la clase `BoundaryBPETokenizer` del repositorio script_tok.
- Comparacion controlada de vocabularios: al compartir arquitectura, datos y semilla, permite aislar el efecto del tokenizer sobre la perdida.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo de razonamiento explicito (thinking mode).
- No tiene capacidades de vision, audio ni multimodalidad.
- Multilinguismo: solo coreano; no hay evidencia de transferencia a otros idiomas.

## Casos de uso

- Investigacion sobre tokenizacion: reproducir y extender el experimento del articulo comparando el esquema `bnd_w` frente a vocabularios sin marcadores en coreano, usando los tres checkpoints como brazos de un mismo ensayo controlado.
- Analisis morfologico del coreano: evaluar si la marca explicita de limites de palabra reduce los bits por byte en un idioma aglutinante, midiendo la perdida sobre el mismo shard de validacion con distintas semillas.
- Linea base de referencia: servir como modelo de comparacion de bajo coste para experimentos de tokenizacion en coreano antes de escalar a modelos mayores.
- Estudio de estabilidad entre semillas: cuantificar la varianza de la metrica bits por byte (desviacion tipica de 0,00044 en este caso) para dimensionar correctamente futuros experimentos con un numero mayor de semillas.
- Validacion de implementaciones de tokenizers: comprobar que una implementacion propia de marcadores de frontera reproduce exactamente la codificacion y decodificacion del tokenizer publicado, comparando la perdida obtenida.
- Prototipado de investigacion con nanochat: reutilizar la configuracion de 12 capas y 2.048 tokens como punto de partida para cadenas de entrenamiento propias sobre Korean FineWeb-2.
- Docencia y divulgacion: ilustrar de forma reproducible como un cambio puramente tokenizacional afecta a la perdida de validacion de un modelo pequeno.

## Benchmarks y rendimiento

Metrica publicada: bits por byte de validacion (suma de la perdida sobre un shard de Korean FineWeb-2 reservado, dividida por la longitud UTF-8 real del texto puntuado). Menos es mejor. Los valores solo son comparables dentro del mismo idioma. La columna "plain menos este modelo" indica la diferencia frente al esquema sin marcadores de frontera; un valor positivo significa que el esquema `bnd_w` de este repositorio obtuvo una puntuacion mejor.

| Semilla | Bits por byte (bnd_w) | plain menos este modelo |
|---|---|---|
| 0 | 0,85383 | +0,00004 |
| 1 | 0,85526 | -0,00026 |
| 2 | 0,85479 | -0,00083 |
| Conjunto | no disponible | media -0,00035, desviacion tipica 0,00044 |

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible. Los resultados de busqueda web devueltos no contienen informacion relevante sobre este modelo ni sobre el articulo citado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; la model card no publica el recuento de parametros ni el uso de memoria.
- GPU de entrenamiento: una GPU por modelo; no se especifica el modelo concreto.
- GPU de consumo: por configuracion (12 capas, anchura 768, contexto 2.048), el modelo es de escala pequena y deberia caber en GPUs de consumo con varios GB de VRAM, pero no hay cifras confirmadas en la informacion disponible.
- Opciones de despliegue: no hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF. La via prevista es cargar el state dict `seed<n>/model_002553.pt` con el codigo de nanochat en el commit `92d63d4` y el tokenizer con script_tok.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio completo ocupa 2,5 GB e incluye las tres semillas, el tokenizer y los logs de entrenamiento.

## Comparativa con modelos similares

No se han identificado modelos publicos comparables de terceros en la informacion disponible. La comparacion relevante es interna al estudio, entre esquemas de tokenizacion evaluados con la misma arquitectura y los mismos datos:

| Variante | Esquema de tokenizacion | Parametros | Contexto | Idiomas | Licencia | Bits por byte |
|---|---|---|---|---|---|---|
| Este modelo (`bnd_w`, BPE) | Marcador `<|>` a ambos lados de cada palabra | no disponible | 2.048 | ko | apache-2.0 | 0,85383 / 0,85526 / 0,85479 (semillas 0, 1, 2) |
| Variante `plain` | BPE sin marcadores de frontera | no disponible | 2.048 | ko | no disponible en esta busqueda | Diferencia media de +0,00035 a favor de `plain` frente a este esquema |

El articulo de referencia y el repositorio script_tok incluyen la comparacion completa entre esquemas, entrenadores e idiomas.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo de produccion: no esta ajustado por instrucciones, no tiene plantilla de chat ni filtros de seguridad.
- Presupuesto de entrenamiento muy reducido (1.340 millones de tokens, 2.553 pasos), por lo que la calidad del texto generado en uso abierto sera limitada y el riesgo de alucinacion y de repeticiones es alto.
- Solo coreano: no hay soporte ni evaluacion en otros idiomas.
- Contexto corto de 2.048 tokens, insuficiente para tareas de documento largo.
- La evidencia sobre la utilidad del esquema `bnd_w` es debil: la diferencia media es de -0,00035 bits por byte con una desviacion tipica de 0,00044 entre semillas, es decir, la direccion del efecto no esta establecida con solo tres semillas.
- Cobertura de datos sesgada: solo 3 shards de Korean FineWeb-2 filtrados, con dos ordenes de datos distintos para tres semillas.
- La licencia apache-2.0 permite uso comercial, pero el repositorio no ofrece garantias, soporte ni pesos cuantizados listos para desplegar.
- Dependencia de codigo externo: para tokenizar correctamente hay que clonar script_tok y usar `BoundaryBPETokenizer`; un tokenizer BPE convencional no reproducira la segmentacion.
- El espacio entre palabras se reconstruye a partir de marcadores contiguos, por lo que cualquier preprocesado que elimine o altere los marcadores rompe la decodificacion.
- La fecha de creacion del repositorio (2026-09-20) y el identificador arXiv del articulo no se han podido verificar con las fuentes devueltas por la busqueda web.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmeister/boundary-markers-ko-d12-bnd_w-bpe
- Articulo: Explicit Boundary Markers for Subword Vocabularies (Sander Land y Clara Meister): https://arxiv.org/abs/2608.08847
- Repositorio script_tok: https://github.com/sanderland/script_tok
- nanochat (commit `92d63d4`): https://github.com/karpathy/nanochat
- Tokenizer: `tokenizer/fineweb_ko_5gb_quick_bnd_w_bpe_v34685.json.gz`, sha256 `c3242f059803c86c52eda69080252035d159a03d57bd55c05163ede6092e4759`
