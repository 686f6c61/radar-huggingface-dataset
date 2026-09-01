# itzPotato/arithmetic-bilinear-1layer-seed1

## Resumen

El modelo `itzPotato/arithmetic-bilinear-1layer-seed1` es un transformer decoder-only de una sola capa, sin bias ni normalización, con una MLP bilineal, entrenado específicamente para la tarea de suma y resta de números enteros de 4 dígitos con signo. Lo desarrolla itzPotato (Rohan Sashank Babbellapati) como parte de un proyecto de interpretabilidad que compara doce modelos idénticos en arquitectura y entrenamiento, diferenciados únicamente por el tipo de MLP (ReLU o bilineal), el número de capas (1 o 2) y la semilla. Con solo 11.584 parámetros, este modelo no busca resolver tareas del mundo real, sino servir como objeto de estudio para entender cómo los transformers aprenden algoritmos aritméticos y cómo la estructura de la MLP afecta a ese aprendizaje.

El modelo se enmarca en una línea de investigación sobre mecanismos internos de razonamiento aritmético. Los resultados publicados muestran que resuelve correctamente la suma (precisión de secuencia del 94,84 %) pero falla estrepitosamente en la resta (precisión de secuencia del 5,26 %), lo que sugiere que una única capa con MLP bilineal no es suficiente para implementar la propagación del acarreo (borrow) necesaria en la resta. El autor indica que los modelos de dos capas sí resuelven ambas operaciones, lo que apunta a que la segunda capa es la que aporta la capacidad de propagar el borrow. El contexto de tokens es de 16 tokens por ejemplo (4 dígitos por operando, operador, igual y 5 dígitos de respuesta con signo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 1 capa, sin bias ni normalizacion, MLP bilineal |
| Parametros totales | 11.584 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 16 tokens (formato fijo de tarea) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (vocabulario numerico: digitos 0-9, operadores +, -, =, total 13 tokens) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de una sola capa con dimension de modelo 32, MLP de dimension 64, 4 cabezas de atencion con dimension de cabeza 8, y una MLP bilineal definida como `W_out[(W_L x) * (W_R x)]`, donde `*` es el producto elemento a elemento. No utiliza bias ni normalizacion. La tarea consiste en procesar secuencias de 16 tokens que representan una operacion de suma o resta de dos numeros de 4 digitos con signo, donde la respuesta se predice token a token (5 digitos de resultado). El entrenamiento se realizo con AdamW (lr 0.02 con decaimiento coseno y 200 pasos de warmup), batch de 1024, weight decay 0.01, grad clip 1.0, y una sola pasada sobre 5 millones de ejemplos generados con semilla fija 1234. El mejor paso fue el 4600 de un total de 4883. La tasa de aprendizaje se eligio mediante una prueba de seis puntos en ambos tipos de MLP para garantizar que el regimen de entrenamiento no favoreciera a ninguna variante.

El autor advierte que la numeracion de tokens es propia del proyecto y no coincide con la de un modelo de referencia (`melephant/1-layer-addition-v2`), que ademas solo soporta suma y no incluye token de signo en la respuesta. Esto es relevante para quien quiera comparar activaciones entre modelos.

## Capacidades

- Generacion de texto limitada al vocabulario de 13 tokens: digitos 0-9, operadores `+` y `-`, y el token `=`.
- Realiza sumas de numeros de 4 digitos con signo con alta precision (94,84 % de secuencias correctas en validacion).
- Realiza restas de numeros de 4 digitos con signo con muy baja precision (5,26 % de secuencias correctas), limitacion intrinseca de la arquitectura de 1 capa.
- No soporta tool calling, agentes ni razonamiento multi-paso fuera de la tarea aritmetica especifica.
- No tiene capacidades multilingues ni de vision.
- Disenado exclusivamente para estudios de interpretabilidad mecanistica, no para uso productivo.

## Casos de uso

- Investigacion en interpretabilidad mecanistica: el modelo permite estudiar como una sola capa de atencion y una MLP bilineal implementan algoritmos de suma y resta, y como la estructura de la MLP afecta a la representacion interna de los digitos y las operaciones.
- Comparacion de arquitecturas de MLP: al existir doce modelos identicos salvo por el tipo de MLP (ReLU vs. bilineal) y el numero de capas, se puede aislar el efecto de la MLP en la capacidad de generalizacion aritmetica.
- Estudio de la propagacion del acarreo y del borrow: los resultados muestran que la resta requiere propagacion de borrow, y que una sola capa no es suficiente; esto sirve para disenar experimentos sobre que mecanismos de atencion o MLP permiten esa propagacion.
- Validacion de tecnicas de analisis de circuitos: el modelo es lo suficientemente pequeno como para aplicar tecnicas de extraccion de circuitos (por ejemplo, atencion dirigida, logit lens, o intervenciones causales) con coste computacional minimo.
- Pruebas de metodos de entrenamiento: el regimen de entrenamiento compartido entre los doce modelos permite evaluar la estabilidad de diferentes arquitecturas bajo condiciones identicas.
- Educacion en mecanicas de transformers: por su tamano reducido y tarea acotada, es util como ejemplo didactico para explicar como los transformers procesan secuencias simbolicas y como se pueden analizar sus representaciones internas.

## Benchmarks y rendimiento

La model card publica los siguientes resultados en validacion y test:

| Split | Loss | Precision por digito | Precision por secuencia | Precision del signo |
|---|---:|---:|---:|---:|
| Validacion | 0,3739 | 0,7779 | 0,5005 | 0,0006 |
| Test | 0,3730 | 0,7779 | 0,4986 | 0,0006 |

Desglose por operador:

| Operador | Precision por secuencia | Precision por digito | Loss |
|---|---:|---:|---:|
| Suma | 0,9484 | 0,9894 | 0,0233 |
| Resta | 0,0526 | 0,5664 | 0,7246 |

La precision del signo es practicamente nula por construccion, ya que la perdida solo cubre los cinco digitos de la respuesta y no el token de signo, que se introduce como entrada forzada. El autor aclara que esto no es un fallo del modelo. No se proporcionan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- El modelo tiene solo 11.584 parametros, por lo que cabe en cualquier CPU o GPU disponible; su huella de memoria es inferior a 1 MB en precision de 32 bits.
- Se puede ejecutar en una Raspberry Pi o en un microcontrolador con soporte para PyTorch.
- La inferencia es instantanea incluso en CPU; no se requieren GPUs especificas.
- No se han publicado datos de latencia o throughput, pero al ser un modelo de una capa con dimension 32, el coste computacional es despreciable.
- Para cargar el modelo se necesita el codigo fuente del proyecto (`src.pretraining.model.PretrainTransformer`), disponible en el repositorio del autor; no se proporciona un pipeline estandar de HuggingFace.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos en la informacion proporcionada. La model card menciona un modelo de referencia (`melephant/1-layer-addition-v2`) que es de adicion exclusiva y con vocabulario diferente, pero no se ofrecen datos comparativos de rendimiento. Los modelos comparables dentro del mismo proyecto (los otros once de la familia) no tienen fichas publicas individuales en HuggingFace, aunque el autor menciona que los de dos capas resuelven tanto suma como resta. Por tanto, la comparativa se limita a la informacion interna del propio proyecto.

## Limitaciones y advertencias

- El modelo es un objeto de investigacion, no un modelo de proposito general; no debe usarse en produccion ni para tareas fuera de la aritmetica de 4 digitos.
- No resuelve la resta (precision de secuencia del 5,26 %), lo que limita su utilidad incluso dentro de la tarea aritmetica.
- La precision del signo es nula por diseno, ya que el token de signo no recibe gradiente; cualquier analisis que dependa de la prediccion del signo sera invalido.
- La numeracion de tokens es propia del proyecto y no coincide con la de otros modelos; mezclar activaciones con otros modelos puede llevar a errores.
- No se indica licencia ni condiciones de uso; se recomienda contactar con el autor antes de cualquier uso comercial.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de idioma, al ser un modelo puramente numerico sin lenguaje natural.
- El formato de pesos es safetensors, pero la carga requiere el codigo fuente del proyecto; no es un checkpoint autocontenido para la API de transformers estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itzPotato/arithmetic-bilinear-1layer-seed1
- Pagina de modelos del autor: https://huggingface.co/itzPotato/models
- Modelo relacionado del autor (bilinear-attn-addition-carry-1layer): https://huggingface.co/itzPotato/bilinear-attn-addition-carry-1layer
- Repositorio del proyecto (implícito en la model card, no se proporciona URL directa; se accede via el perfil del autor en HuggingFace)
