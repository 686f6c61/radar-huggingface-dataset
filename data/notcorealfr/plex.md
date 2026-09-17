# NotCorealfr/Plex

## Resumen

PLEX es una propuesta de arquitectura de modelo de lenguaje publicada por el usuario NotCorealfr en HuggingFace bajo el identificador NotCorealfr/Plex. No se trata de un modelo con pesos entrenados y publicados, sino de un repositorio que documenta una capa experimental denominada "Parallel Layered EXperts" (PLEX), una variante de bloque con multiples expertos ejecutados en paralelo. La model card es extremadamente escueta: el propio autor la describe como "a LLM architecture I made that I don't even know if it's good or not", lo que indica que se trata de un experimento de investigacion sin validacion empirica publicada.

El repositorio aparece etiquetado con el pipeline text-generation, el idioma en (ingles) y la region us, con cero descargas y cero likes en el momento de la consulta. No se publican pesos, tokenizador, configuracion de entrenamiento ni resultados de evaluacion. La licencia no esta declarada, lo que impide cualquier uso comercial o redistribucion con garantias juridicas.

Su relevancia actual es exclusivamente como material de estudio arquitectonico: propone una forma alternativa de organizar expertos (atencion cruzada sobre la dimension de expertos y concatenacion de caracteristicas) que se diferencia del enrutamiento disperso tipico de los MoE convencionales. Al no existir checkpoint ni benchmark, no puede evaluarse su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Capa PLEX (Parallel Layered EXperts): varios bloques transformer pre-norm en paralelo, atencion cruzada sobre la dimension de expertos y agregacion por concatenacion. No se especifica el transformer completo |
| Parametros totales | no disponible |
| Parametros activos | no disponible (en el codigo publicado no hay enrutador; todos los expertos se ejecutan para cada token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |

## Arquitectura y entrenamiento

La unica informacion tecnica concreta es el codigo de la clase `PLEXLayer`, que recibe como hiperparametros `hidden_dim`, `num_experts`, `num_heads`, `mlp_expansion` y `dropout` (sin valores concretos publicados). El flujo descrito en el propio docstring es: la entrada x se pasa simultaneamente a N expertos, donde cada experto es un bloque transformer pre-norm estandar y todos ven la misma x; las salidas se apilan en una dimension de expertos, se aplica atencion multi-cabeza (`nn.MultiheadAttention`) sobre dicha dimension para que las ramas intercambien informacion, se normaliza con `LayerNorm` y conexion residual, se concatenan los expertos a lo largo de la dimension de caracteristicas y se proyecta de vuelta a `hidden_dim` mediante un bloque `Linear(D*E, 2D) → GELU → Linear(2D, D)`. Finalmente se suma la señal original x como residuo.

Es importante subrayar que no se observa ningun mecanismo de enrutamiento ni de seleccion dispersa de expertos: a diferencia de Mixtral o DeepSeek-MoE, donde solo se activan top-k expertos por token, en PLEX todos los expertos se ejecutan siempre, por lo que el coste computacional crece linealmente con `num_experts`. Ademas, la clase mostrada es solo una capa, no un modelo completo: no se define el numero de capas, el vocabulario, la posicion de embeddings, el tokenizador ni la cabeza de lenguaje final.

No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset, ni uso de RLHF, DPO, SFT u otras tecnicas de alineamiento. No se documenta ninguna innovacion adicional como decodificacion especulativa o atencion lineal.

## Capacidades

- No hay evidencia verificable de ninguna capacidad funcional: el repositorio no publica pesos entrenados, demostraciones ni ejemplos de inferencia.
- La unica capacidad declarada es la etiqueta de pipeline text-generation, que describe la intencion del autor, no un comportamiento comprobado.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: la model card declara unicamente ingles (en). No hay datos sobre el resto de idiomas.
- No se declara modo de razonamiento (thinking mode), vision, audio ni ninguna capacidad especial.
- A nivel teorico, la arquitectura permitiria a los expertos intercambiar informacion mediante atencion cruzada, algo que los MoE con enrutamiento disperso no hacen al no compartir representaciones entre ramas activas, pero esto es una hipotesis de diseno sin validacion empirica.

## Casos de uso

Dado que no existen pesos publicados ni checkpoint utilizable, los casos de uso deben entenderse como escenarios de investigacion y desarrollo, no como despliegues en produccion:

- Investigacion en arquitecturas MoE: el diseno de PLEX puede servir como punto de partida para estudiar si la atencion cruzada entre expertos mejora la especializacion frente al enrutamiento top-k convencional. Se usaria reimplementando la capa sobre un transformer base y entrenando desde cero.
- Estudios de ablacion sobre el numero de expertos: la concantenacion de caracteristicas (E*D) y la proyeccion a 2D permiten variar `num_experts` para medir el equilibrio entre coste y rendimiento, siempre que se entrene el modelo completo.
- Analisis de coste computacional en arquitecturas densas con multiples ramas: al no haber enrutador, PLEX es un caso claro para medir el sobrecoste de ejecutar todos los expertos frente a un MoE disperso equivalente en parametros.
- Prototipado academico en cursos de deep learning: el codigo es autocontenido y puede usarse como ejercicio para entender la diferencia entre paralelismo de expertos con y sin gating.
- Base para propuestas de enrutamiento hibrido: un investigador podria anadir un router a la capa PLEX para convertirla en un MoE disperso y comparar ambos regimenes bajo el mismo presupuesto de parametros.
- Reproducibilidad y benchmarking de arquitecturas: si el autor publicase pesos en el futuro, el repositorio podria servir como referencia para evaluar esta familia de capas frente a bloques transformer estandar, aunque hoy no es posible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No es posible estimar VRAM de inferencia: al desconocerse el numero de parametros totales, la profundidad del modelo y el tamano de la capa, cualquier cifra seria especulativa.
- No se especifican GPU recomendadas ni probadas.
- No hay informacion sobre si cabe en GPU de consumo (RTX 4090, RTX 3090, etc.).
- Opciones de despliegue: no disponible. No hay pesos en formato safetensors ni GGUF, por lo que no puede desplegarse con vLLM, llama.cpp, Ollama, TGI ni transformers.
- Latencia y throughput: no disponibles. Conviene senalar que, por diseno, PLEX multiplica el coste por el numero de expertos al no usar enrutamiento disperso, lo que penalizaria el throughput frente a un MoE con top-k activacion.

## Comparativa con modelos similares

La comparacion es puramente estructural, ya que PLEX no publica pesos ni resultados. Se toman como referencia arquitecturas MoE publicas bien documentadas:

| Modelo | Tipo | Enrutamiento | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PLEX (NotCorealfr/Plex) | Capa con expertos en paralelo y atencion cruzada | No dispone de enrutador; todos los expertos se activan | no disponible | no disponible | no disponible | Solo codigo de capa; sin pesos |
| Mixtral 8x7B | MoE disperso transformer | Top-2 por token | Aproximadamente un tercio del total | 32k | Apache 2.0 | Pesos publicos |
| DeepSeek-MoE | MoE con expertos finos y shared experts | Top-k con expertos compartidos | Fraccion reducida del total | Variable | Licencia propia | Pesos publicos |

No se dispone de datos de rendimiento comparables para PLEX, por lo que no es posible establecer una comparacion cuantitativa en MMLU, HumanEval, GSM8K ni ninguna otra tarea.

## Limitaciones y advertencias

- Es un experimento arquitectonico sin validacion empirica; el propio autor declara no saber si funciona bien.
- No hay pesos publicados: el modelo no puede ejecutarse, evaluarse ni desplegarse tal cual.
- No hay licencia declarada, lo que genera incertidumbre juridica total para cualquier uso, incluido el comercial.
- Ausencia de enrutador: al activar todos los expertos siempre, el coste de calculo crece linealmente con `num_experts`, lo que limita su escalabilidad en inferencia.
- Solo se documenta la capa, no el modelo completo: faltan tokenizador, embeddings, profundidad, vocabulario y cabeza de lenguaje.
- Unico idioma declarado: ingles. No hay informacion sobre comportamiento multilingue.
- Riesgo de alucinacion: no evaluable, al no existir checkpoint entrenado.
- Sesgos: no evaluables por la misma razon.
- Limitaciones de contexto: no disponible; no se especifica ventana de atencion.
- La busqueda web realizada no devolvio resultados relacionados con el modelo (los resultados obtenidos corresponden a productos de baterias de la marca EcoFlow y no guardan relacion con este repositorio), por lo que no hay documentacion externa, papers ni discusiones tecnicas que respalden o critiquen el diseno.

## Enlaces

- HuggingFace: https://huggingface.co/NotCorealfr/Plex
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web.
