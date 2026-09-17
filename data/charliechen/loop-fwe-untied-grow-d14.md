# CharlieChen/loop-fwe-untied-grow-d14

## Resumen

loop-fwe-untied-grow-d14 es un modelo de lenguaje base de tipo transformer recurrente (looped transformer) desarrollado por el usuario CharlieChen, publicado en HuggingFace como parte del trabajo "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". Se trata de un checkpoint de preentrenamiento puro, sin ajuste por instrucciones ni alineamiento, entrenado sobre el corpus FineWeb-Edu con un tokenizador GPT-2 gestionado mediante tiktoken. Almacena 1.311.113.216 parametros en FP32 y su ventana de contexto es de 2.048 tokens.

Su interes no es tanto el rendimiento absoluto como su valor como artefacto de investigacion: pertenece a una familia de modelos disenada para estudiar como el crecimiento del modelo (model growth), la recursion de bloques y los operadores de frontera afectan a los exponentes de escalado. La coordenada de profundidad d14 no equivale necesariamente al numero de bloques Transformer ejecutados, y en evaluacion el nucleo se repite 4 veces (recursion), lo que separa el coste computacional efectivo del numero de parametros almacenados.

El checkpoint es deliberadamente crudo: los pesos son identicos bit a bit al checkpoint del paper, se distribuyen unicamente como `final.pt` (mas `result.json` y `SHA256SUMS`), requieren el repositorio de codigo propio del paper y no son un artefacto `AutoModel` de Transformers. No se publica licencia, no hay cuantizaciones ni soporte para runtimes estandar, y el modelo solo maneja ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con nucleo recurrente (looped transformer), implementacion propia `TransformerGPT`; profundidad declarada d14, repeticion final del nucleo 4 |
| Parametros totales | 1.311.113.216 parametros almacenados en FP32 |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos FP32) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | `final.pt` (PyTorch, FP32, implementacion propia); no es un artefacto `AutoModel` de Transformers |
| Anchura (d_model) | 1.792 |
| Cabezas de atencion | 14 |
| Tokenizador | GPT-2 via tiktoken; vocabulario de 50.257 tokens ampliado a 50.304 filas del modelo |
| Dataset de preentrenamiento | HuggingFaceFW/fineweb-edu |
| NLL de validacion en preentrenamiento | 2,51097689 nats/token |
| CORE accuracy (paper) | 0,25175638 |
| CORE answer NLL (paper) | 2,41028859 nats/token |
| Estado del optimizador | no incluido en el checkpoint |
| Tamano del repositorio | 5,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo recurrente: en lugar de apilar un numero fijo de bloques unicos, comparte un nucleo que se ejecuta repetidamente. La model card indica una "final core repetitions" de 4 y una coordenada de profundidad d14 que, segun el propio autor, actua como coordenada de escalado de la "ladder" y puede diferir del numero de bloques Transformer realmente ejecutados. La anchura es de 1.792 con 14 cabezas de atencion (dimension de cabeza implicita de 128) y el vocabulario de GPT-2 se rellena de 50.257 a 50.304 filas. El nombre del checkpoint ("untied-grow") sugiere pesos no atados y una estrategia de crecimiento del modelo aplicada durante el entrenamiento, si bien los detalles concretos de esa estrategia no se detallan en la informacion disponible.

El entrenamiento se realizo sobre FineWeb-Edu, un corpus educativo filtrado en ingles. En la evaluacion de referencia del paper se usaron GPUs H100 con FlashAttention-3 y autocast en bfloat16. No hay informacion disponible sobre el numero total de tokens vistos, la composicion exacta del dataset ni sobre fases de ajuste fino con RLHF o DPO: es un modelo base sin alineamiento. Tampoco se describe en la informacion proporcionada ninguna innovacion de decodificacion (decodificacion especulativa, atencion lineal, SSM) mas alla de la recursion del nucleo y de los operadores de frontera mencionados en el titulo del paper.

## Capacidades

- Generacion de texto en ingles: continuacion de documentos, few-shot prompting y muestreo autoregresivo, al ser un modelo base.
- Modelado de lenguaje puro: calculo de verosimilitud (NLL) sobre texto, util para reranking y evaluacion de perplejidad.
- Razonamiento y conocimiento general de nivel basico: segun el paper, CORE accuracy de 0,25175638 sobre 22 tareas y 91.037 ejemplos, con semillas 0, 1 y 2.
- Capacidad de evaluacion en regimen recurrente: el checkpoint incluye la recurrencia de evaluacion final, de modo que permite reproducir el protocolo del paper con 4 repeticiones del nucleo.
- Extraccion de representaciones internas para tareas downstream, dado que los tensores del modelo son accesibles directamente.
- No dispone de soporte de tool calling ni function calling.
- No dispone de modo de razonamiento explicito (thinking mode), ni de capacidades de vision o audio.
- No esta ajustado para seguir instrucciones ni para conversacion multi-turno.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Reproduccion de experimentos sobre leyes de escalado: el checkpoint permite replicar las curvas del paper y estudiar como la recursion del nucleo y el crecimiento del modelo alteran los exponentes de escalado, usando el repositorio `loop` y el protocolo de evaluacion con H100 y FlashAttention-3.
- Investigacion en arquitecturas recurrentes de profundidad: permite comparar un transformer con repeticion de nucleo (4 repeticiones en evaluacion) frente a un transformer de profundidad fija con un numero similar de parametros almacenados, aislando el efecto de la recursion.
- Generacion de datos sinteticos en ingles: al ser un modelo base de 1,31 B de parametros, puede emplearse para generar texto de dominio educativo que sirva como corpus de destilacion o para preentrenamiento de modelos mas pequenos, asumiendo supervision posterior.
- Ajuste fino supervisado para clasificacion y regresion de texto en ingles: con 2.048 tokens de contexto es viable adaptar el modelo a tareas como clasificacion de documentos, deteccion de temas o analisis de calidad de contenido educativo.
- Reranking y puntuacion de candidatos: la cabeza de modelado de lenguaje permite calcular NLL por token sobre pares pregunta-respuesta y usarlo como senal de ordenacion en sistemas de recuperacion en ingles.
- Analisis de eficiencia computacional: el desacoplamiento entre parametros almacenados (1,31 B) y profundidad efectiva de computo lo hace adecuado para estudiar compromisos entre memoria, FLOPs y calidad, un tema recurrente en el diseno de modelos desplegables.
- Baseline academico en evaluacion CORE: sirve como referencia reproducible (medias sobre 3 semillas y 22 tareas) para comparar variantes de crecimiento o de recurrencia dentro de la misma familia.
- Estudio de estabilidad numerica en FP32: al publicarse solo pesos en FP32 y con sumas de verificacion SHA-256, es util para trabajos que requieren determinismo y trazabilidad estricta de pesos.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| NLL de validacion en preentrenamiento | 2,51097689 nats/token | Metrica de validacion del preentrenamiento |
| CORE accuracy (paper) | 0,25175638 | Media sobre semillas 0, 1 y 2; 91.037 ejemplos en 22 tareas |
| CORE answer NLL (paper) | 2,41028859 nats/token | Metrica distinta de la NLL de validacion de preentrenamiento |
| MMLU, HumanEval, GSM8K u otros | no disponible | No publicados en la informacion disponible |

No se han publicado resultados comparativos con otros modelos en la informacion disponible, por lo que no es posible establecer una tabla de confrontacion directa con alternativas.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 5,2 GB en FP32 (coincide con el tamano del repositorio) y del orden de 2,6 GB si se convierte a bfloat16.
- VRAM estimada para inferencia: en torno a 6-8 GB en FP32 contando activaciones para contexto de 2.048 tokens, y del orden de 4-6 GB en bfloat16.
- GPU de referencia del paper: H100 con FlashAttention-3 y autocast en bfloat16 para el protocolo completo de evaluacion.
- GPU profesionales compatibles: A100, H100 y equivalentes; cualquier GPU con al menos 8 GB de VRAM y soporte de bfloat16 deberia poder ejecutar inferencia en bfloat16.
- GPU de consumo: si, cabe en tarjetas como RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090 sin necesidad de cuantizacion adicional; en FP32 requiere al menos 8 GB de VRAM.
- Opciones de despliegue: exclusivamente el repositorio propio del paper (`eval.py` y la implementacion `TransformerGPT`). No se proporcionan pesos en GGUF ni integracion con vLLM, llama.cpp, Ollama o TGI; cualquier uso en esos runtimes exigiria una conversion manual no documentada.
- Latencia y throughput: no disponible. El coste efectivo de computo es mayor que el de un transformer de 1,31 B de profundidad fija equivalente, porque el nucleo se ejecuta 4 veces en la recurrencia de evaluacion.
- El estado del optimizador no se incluye, por lo que reanudar el preentrenamiento desde este checkpoint no es posible sin reinicializarlo.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales y de disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| loop-fwe-untied-grow-d14 | 1,31 B (FP32) | 2.048 | no disponible | `final.pt` con codigo propio; sin AutoModel, sin GGUF |
| GPT-2 XL | ~1,55 B | 1.024 | licencia MIT modificada | Pesos en Transformers, ampliamente soportado |
| Pythia-1.4B | ~1,4 B | 2.048 | Apache 2.0 | Pesos en Transformers, con checkpoints intermedios |
| TinyLlama-1.1B | ~1,1 B | 2.048 | Apache 2.0 | Transformers, GGUF y llama.cpp |

Rendimiento comparativo (MMLU, CORE u otras metricas homogeneas): no disponible para este modelo ni para las alternativas dentro de las fuentes consultadas.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explicita no hay autorizacion clara para uso comercial; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Modelo base sin alineamiento: no sigue instrucciones, no mantiene formato conversacional y puede generar contenido inapropiado, sesgado o factualmente incorrecto. El riesgo de alucinacion es alto en tareas de conocimiento factual.
- Sesgos: no se documenta ninguna evaluacion de sesgo. El entrenamiento sobre FineWeb-Edu, un corpus filtrado por criterios de calidad educativa en ingles, puede sobrerrepresentar determinados registros y culturas.
- Idioma: unicamente ingles. No hay evidencia de competencia en castellano ni en otros idiomas.
- Contexto limitado a 2.048 tokens, lo que restringe tareas de documentos largos o conversaciones extensas.
- CORE accuracy de 0,25175638 sobre 22 tareas: el propio autor indica que es una media archivada del paper, y CORE no es directamente comparable con otras metricas publicadas. No debe interpretarse como una medida de utilidad practica.
- Compatibilidad: el checkpoint usa la implementacion `TransformerGPT` del paper y no funciona como `AutoModel` de Transformers. No hay cuantizaciones ni soporte en runtimes estandar, lo que anade coste de integracion.
- Reproducibilidad parcial: se incluye `SHA256SUMS` para verificar `final.pt`, pero no el estado del optimizador ni el pipeline de datos completo.
- Coste de inferencia superior al esperado para 1,31 B de parametros, debido a las 4 repeticiones del nucleo en la recurrencia de evaluacion.
- Resultados de 0 descargas y 0 likes en el momento de la consulta: es un artefacto de investigacion sin comunidad de usuarios ni soporte documentado mas alla de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-fwe-untied-grow-d14
- Repositorio de codigo del paper: https://github.com/cue-engineering/loop
- Dataset de preentrenamiento FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper ("How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents"): URL no disponible en la informacion proporcionada
- Resultados de busqueda web: los resultados devueltos no guardan relacion con el modelo (contenido sobre directivas anticipadas de pacientes en Alemania y Austria), por lo que no se incluyen como fuentes validas.
