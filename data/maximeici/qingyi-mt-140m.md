# maximeIci/QingYi-MT-140M

## Resumen

QingYi-MT-140M es un modelo de traduccion automatica neuronal (NMT) bidireccional chino-ingles desarrollado por el usuario maximeIci. Se trata de un Transformer encoder-decoder entrenado desde cero con una arquitectura asimetrica de 12 capas de encoder y 2 de decoder, con 140,83 millones de parametros y un vocabulario SentencePiece compartido de 48.000 tokens. El modelo se publica cuantizado en INT8 mediante CTranslate2, ocupando 141,9 MB, lo que lo hace apto para inferencia en dispositivos moviles Android.

El problema que resuelve es el del empaquetado de modelos NMT en aplicaciones offline: tradicionalmente se distribuian dos modelos direccionales separados (zh→en y en→zh) que sumaban en torno a 430 MB. QingYi-MT unifica ambas direcciones en una sola red con condicionamiento por token de direccion (`<2en>` / `<2zh>`), reduciendo el peso a un tercio y eliminando la recarga de pesos al cambiar de direccion.

Su relevancia radica en que demuestra que un modelo compacto entrenado especificamente para traduccion cotidiana puede competir con modelos generalistas mucho mayores en calidad de traduccion, con un coste de almacenamiento y memoria muy inferior, lo que lo hace adecuado para aplicaciones moviles sin conexion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder asimetrico (12 capas encoder / 2 capas decoder), pre-norm GELU |
| Parametros totales | 140,83 M (V = 48.000) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (CTranslate2); pesos originales en bfloat16/float32 durante entrenamiento |
| Idiomas soportados | chino (simplificado y tradicional, con conversion OpenCC t2s) e ingles |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (model.bin), INT8 |
| Dimension del modelo | d_model = 768, ff = 3072 |
| Vocabulario | SentencePiece compartido de 48.000 tokens, embeddings y lm_head con pesos atados (3-way tied) |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo emplea un Transformer con un reparto asimetrico de capas: 12 capas de encoder y solo 2 de decoder. Esta eleccion busca concentrar la capacidad en la codificacion de la fuente y mantener ligera la decodificacion autoregresiva con beam search, de modo que la inferencia sea practica en CPUs ARMv8 de dispositivos moviles. La direccion de traduccion se condiciona mediante un token especial (`<2en>` o `<2zh>`) insertado en la posicion 0 tras la tokenizacion, evitando un artefacto conocido de SentencePiece que inserta un prefijo `"▁"` espurio si el token se antepone como texto crudo. Para el chino tradicional se aplica una tabla OpenCC `t2s` antes de la tokenizacion en zh→en.

El entrenamiento se realizo integramente en Apple Silicon con MLX (calculo en bfloat16, pesos maestros en float32, lotes de 24.576 tokens) y siguio un curriculum de tres fases. La fase 1 (59.600 pasos) hizo preentrenamiento bidireccional sobre 6.395.286 ejemplos (592,0 M tokens) con `val_ppl` de 4,66. La fase 2 (2.850 pasos) aplico annealing sobre 999.286 ejemplos cortos (55,8 M tokens). La fase 3 (1.500 pasos, LR de 5e-5 a 5e-6) realizo un ajuste fino correctivo sobre 436.561 ejemplos, con un 62,3% en direccion en→zh, orientado a fidelidad de digitos y recibos, modismos coloquiales y escalas numericas chinas (万/亿). El corpus combino bitexto publico filtrado (2.560.851 pares de FineTranslations, OPUS-100 y Tatoeba) con 315.233 pares sinteticos dirigidos a menus, senalizacion, interfaz de usuario, recibos y OCR ruidoso, con deduplicacion estricta contra un conjunto de 7.415 frases reservadas para evitar filtraciones.

## Capacidades

- Traduccion bidireccional chino-ingles y ingles-chino en un unico modelo residente, sin recarga de pesos al cambiar de direccion.
- Manejo de chino tradicional mediante conversion automatica a simplificado antes de la tokenizacion.
- Traduccion de texto de OCR y capturas de pantalla: menus de restaurante, senalizacion viaria y de transporte, recibos, etiquetas de interfaz y fragmentos ruidosos.
- Procesamiento de escalas numericas chinas (万/亿) y de cantidades y precios.
- Cobertura de registro coloquial, jerga y code-switching.
- Decodificacion con beam search y guardas anti-repeticion (`beam_size=2`, `rep_penalty=1.05`, `no_repeat_ngram_size=4`).
- No dispone de tool calling, function calling, capacidades de agente, vision ni audio: es un modelo puramente de traduccion texto a texto.

## Casos de uso

- Traduccion offline en aplicaciones Android: el modelo se integra mediante CTranslate2 en una app movil y permite traducir sin conexion con un unico traductor residente de 141,9 MB, eliminando la recarga de pesos al alternar direcciones.
- Traduccion de texto capturado por camara (OCR): adecuado para menus, carteles, senales de transporte y recibos, ya que el entrenamiento incluyo pares sinteticos especificos para estos dominios y fragmentos OCR ruidosos.
- Traduccion de interfaces de usuario y comercio electronico: el corpus sintetico cubre etiquetas de UI y textos de e-commerce, por lo que el modelo puede traducir cadenas cortas de aplicaciones y fichas de producto.
- Asistencia a viajeros: traduccion de frases cotidianas, indicaciones de hotel y restauracion y conversaciones informales, con soporte de jerga y expresiones coloquiales gracias a la fase de pulido.
- Traduccion de correspondencia y chat informal: el modelo maneja code-switching y registro coloquial, lo que lo hace util para mensajeria y comunicacion cotidiana bilingue.
- Procesamiento por lotes de bajo coste en servidor: al ser un modelo de 141,9 MB en INT8, puede desplegarse con CTranslate2 en CPU para traducir grandes volumenes de pares zh-en sin GPU, con latencia baja en decodificacion por su decoder de solo 2 capas.
- Traduccion de documentacion tecnica sencilla y contenido web: util para preprocesamiento o traduccion preliminar de textos en pipelines de datos, dado su bajo coste de memoria.

## Benchmarks y rendimiento

Los resultados publicados por el autor usan chrF++ (word_order=2) y BLEU (tokenize="13a" para ingles, "zh" para chino). La informacion disponible incluye la matriz completa de comparacion pero los valores numericos por benchmark no se detallan en su totalidad en los datos proporcionados. Los datos cualitativos publicados son los siguientes:

| Comparacion | Resultado declarado |
|---|---|
| Frente a Qwen3.5-0.8B-4bit (652 MB) | QingYi-MT supera en 7 de 7 particiones evaluadas |
| Frente a NLLB-200-600M (647 MB) | QingYi-MT supera en 6 de 7 particiones evaluadas |
| Frente a Gemini 3.8 Flash (WMT23 zh→en) | Diferencia de 1,95 chrF++ a favor de Gemini |
| Frente a qwen4-max (WMT23 zh→en) | Diferencia de 1,65 chrF++ a favor de qwen4-max |
| Frente a QuickMT INT8 dual (429,7 MB) | QingYi-MT con 141,9 MB sustituye a ambos modelos |

El autor documenta explicitamente que los modelos duales de 200M siguen siendo superiores en IWSLT17, WMT24 en→zh y FLORES-200. No se han publicado en la informacion disponible los valores numericos concretos de chrF++ y BLEU por benchmark.

## Requisitos de hardware

- VRAM estimada: al estar cuantizado en INT8 con 141,9 MB de pesos, la inferencia requiere menos de 1 GB de memoria en cualquier configuracion; puede ejecutarse enteramente en CPU.
- GPU recomendadas: no requiere GPU. Cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo con holgura, pero su diseno esta orientado a CPU ARMv8.
- Cabe en cualquier GPU de consumo e incluso en dispositivos moviles Android; es el objetivo principal del modelo.
- Opciones de despliegue: CTranslate2 (formato nativo del modelo), con posibilidad de integracion en aplicaciones moviles; no se distribuyen pesos en GGUF ni safetensors en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada. El diseno con decoder de 2 capas y beam_size=2 busca minimizar la latencia en CPU movil.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QingYi-MT-140M | 140,83 M | 141,9 MB (INT8) | no disponible | MIT | Hugging Face, CTranslate2 |
| QuickMT (dual zh-en) | ~200 M por direccion | 429,7 MB (dos modelos INT8) | no disponible | no disponible | Requiere dos modelos separados |
| NLLB-200-600M | 600 M | 647 MB | no disponible | no disponible | Hugging Face |
| Qwen3.5-0.8B-4bit | 0,8 B | 652 MB | no disponible | no disponible | Hugging Face, MLX |

QingYi-MT ofrece la menor huella de almacenamiento de la comparativa y unifica ambas direcciones en un solo modelo, mientras que QuickMT requiere dos redes. Frente a NLLB-200-600M y Qwen3.5-0.8B, el autor declara ventaja en la mayoria de particiones evaluadas pese a tener menos de una cuarta parte de los parametros.

## Limitaciones y advertencias

- Solo cubre chino e ingles; no soporta otros pares de idiomas.
- El autor reconoce que los modelos duales de 200M superan a QingYi-MT en IWSLT17, WMT24 en→zh y FLORES-200, por lo que su ventaja no es universal.
- Es un modelo especializado en traduccion: no realiza generacion libre, razonamiento, codigo ni tareas de agente.
- Riesgo de bucles de repeticion en nombres propios, mitigado con `no_repeat_ngram_size=4` y penalizacion de repeticion, pero no eliminado por completo.
- La longitud de contexto no esta documentada, lo que limita la planificacion de traduccion de documentos largos.
- El modelo se entreno con datos publicos y sinteticos; no se documentan evaluaciones de sesgo ni de robustez ante contenido sensible.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye unicamente en formato CTranslate2 INT8, sin pesos en otros formatos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de los resultados declarados por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/maximeIci/QingYi-MT-140M
- CTranslate2 (framework de inferencia): https://github.com/OpenNMT/CTranslate2
- MLX (framework de entrenamiento en Apple Silicon): https://github.com/ml-explore/mlx
- OpenCC (conversion chino tradicional a simplificado): https://github.com/BYVoid/OpenCC
