# dicksondickson/Qwen3.8-27B-Uncensored-oQ6e-bf16-mtp-MLX

## Resumen

Este repositorio contiene una cuantizacion en formato MLX del modelo orcarouter/Qwen3.8-27B-Uncensored, una version abliterada (eliminacion de rechazos) de Qwen/Qwen3.8-27B. Se trata de un modelo denso de 27.781.427.952 parametros (aproximadamente 27,8B), con arquitectura hibrida de atencion (Gated DeltaNet lineal combinada con atencion completa), torre de vision nativa, control de modo thinking, soporte de tool calling y una cabeza MTP (multi-token prediction) intacta tras el proceso de abliteracion.

La cuantizacion la firma el usuario dicksondickson y se ha generado con oMLX 0.7.0rc1 con imatrix activado, en precision de 6 bits (oQ6e) manteniendo los tensores criticos en bf16. Esta pensada especificamente para chips Apple M3 y posteriores; los equipos M1 y M2 deben usar la variante fp16 del mismo autor. El repositorio ocupa 23,7 GB y se distribuye bajo licencia MIT.

Su relevancia es doble: por un lado ofrece un modelo de vision-lenguaje de 27B con 262K tokens de contexto ejecutable en hardware Apple Silicon de gama alta; por otro, reduce drasticamente el filtrado de seguridad del modelo original, lo que lo hace util para investigacion sobre alineacion, refusal y comportamiento de modelos abliterados, pero desaconsejado para despliegues comerciales de cara al publico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (Gated DeltaNet lineal + atencion completa), torre de vision y cabeza MTP |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | 6 bits (oQ6e) con imatrix; tensores importantes en bf16; el autor publica tambien variantes en 2, 4 y 8 bits (afin, group size 64) y una variante fp16 para M1/M2 |
| Idiomas soportados | no disponible (la informacion proporcionada no detalla el reparto de idiomas de este checkpoint) |
| Licencia | MIT |
| Formato de pesos | safetensors en formato MLX (repo de 23,7 GB) |
| Libreria de inferencia | MLX |
| Modelo base | orcarouter/Qwen3.8-27B-Uncensored |
| Herramienta de cuantizacion | oMLX 0.7.0rc1 con imatrix |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer denso de 27B parametros que abandona la atencion completa en todas las capas en favor de un esquema hibrido: capas con Gated DeltaNet (atencion lineal con estado recurrente) intercaladas con capas de atencion completa. Este diseno reduce el coste de memoria del cache KV en contextos largos, lo que permite sostener la ventana de 262K tokens sin un crecimiento cuadratico del consumo. Incorpora ademas una torre de vision nativa (modelo vision-lenguaje, no un adaptador externo), una cabeza MTP para decodificacion especulativa de multiples tokens y control explicito del modo thinking.

Sobre esa base, orcarouter aplico una abliteracion a nivel de tensor, es decir, la modificacion de las direcciones de rechazo en los pesos en lugar de un simple ajuste fino con datos. Segun la documentacion del modelo base, la torre de vision y la cabeza MTP quedaron intactas, con una tasa de sobre-rechazo del 0% en XSTest y entre 0% y 6% de rechazo en el conjunto de pruebas A/B, sin perdida de capacidad medible segun sus autores. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO; esos datos no estan publicados en la informacion disponible.

La capa de cuantizacion anadida en este repositorio aplica cuantizacion afin de 6 bits con group size 64 generada mediante imatrix, dejando en bf16 los tensores sensibles a la precision. Esa mezcla es la razon del sufijo "oQ6e-bf16" y del requisito de Apple M3 o superior, ya que el hardware anterior no rinde igual con bf16.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo thinking controlable.
- Procesamiento de vision: la torre visual esta intacta, por lo que acepta imagenes ademas de texto (modelo vision-lenguaje nativo).
- Tool calling y function calling, segun la documentacion del modelo base.
- Capacidades de agente: el modo thinking y el soporte de herramientas permiten flujos multi-turno con pasos intermedios.
- Decodificacion especulativa mediante la cabeza MTP, que acelera la generacion al predecir varios tokens por paso.
- Contexto largo de hasta 262K tokens, adecuado para documentos extensos o conversaciones prolongadas.
- Comportamiento con rechazos muy reducido: 0% de sobre-rechazo en XSTest y 0-6% de rechazo en la suite A/B reportada por el autor del modelo base.
- Generacion de codigo y matematicas: no hay datos especificos publicados para este checkpoint, aunque son capacidades esperables del modelo Qwen3.8-27B subyacente.

## Casos de uso

- Investigacion sobre alineacion y refusal: comparar el comportamiento de esta version abliterada con el Qwen3.8-27B original permite medir que direcciones de activacion codifican el rechazo y como afecta la intervencion a otras capacidades.
- Procesamiento de documentos largos en local: con 262K tokens de contexto se pueden analizar contratos, informes tecnicos o expedientes completos sin troceado, ejecutando todo en un Mac con chip M3 o superior.
- Analisis de imagenes combinado con texto: la torre de vision intacta permite tareas de descripcion de capturas, extraccion de datos de diagramas o revision de interfaces, integradas en un flujo de texto.
- Redaccion creativa sin restricciones tematicas: util en entornos controlados de escritura de ficcion que aborde violencia, contenido adulto o temas sensibles que los modelos alineados rechazan.
- Asistente de desarrollo en local: con tool calling y contexto largo, puede integrarse en un flujo de edicion de codigo que consulte el repositorio completo y ejecute herramientas, sin enviar codigo a servidores externos.
- Simulacion de personajes y roleplay: la reduccion de rechazos y el contexto de 262K tokens permiten mantener personajes coherentes a lo largo de sesiones muy largas.
- Evaluacion de robustez y red teaming: sirve como modelo de referencia para probar si un sistema de moderacion externo detecta contenido que un modelo sin filtrado interno genera.
- Despliegue en Mac para prototipado rapido: MLX aprovecha la memoria unificada de Apple Silicon, lo que permite cargar el modelo cuantizado en un portatil o Mac Studio sin GPU dedicada.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible corresponden a metricas de rechazo del modelo base, no a benchmarks de capacidad estandar:

| Metrica | Resultado | Fuente |
|---|---|---|
| Sobre-rechazo en XSTest | 0% | Pagina de orcarouter/Qwen3.8-27B-Uncensored en Ollama |
| Rechazo en suite A/B | 0-6% | Pagina de orcarouter/Qwen3.8-27B-Uncensored en Ollama |
| Perdida de capacidad | sin perdida medible segun el autor | Pagina de orcarouter/Qwen3.8-27B-Uncensored en Ollama |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de capacidad en la informacion disponible, ni para este checkpoint cuantizado ni para su modelo base.

## Requisitos de hardware

- Peso de los archivos: 23,7 GB en disco. En memoria, el modelo requiere aproximadamente esa misma cifra mas el cache KV, por lo que conviene reservar 28-32 GB de memoria unificada como minimo para contextos moderados.
- Con 262K tokens de contexto el cache KV crece de forma notable; la atencion lineal de Gated DeltaNet reduce ese crecimiento frente a un transformer clasico, pero sigue siendo el factor dominante en memorias largas. No hay cifras exactas publicadas.
- Chips recomendados: Apple M3, M3 Pro, M3 Max, M4 y superiores, porque los tensores criticos estan en bf16. Los equipos M1 y M2 deben usar la variante fp16 del mismo autor.
- Memoria unificada recomendada: 32 GB o mas para uso comodo; 24 GB puede ser suficiente con contextos cortos y sin vision.
- No cabe en GPUs de consumo con menos de 24 GB de VRAM si se convierte a otro formato, y no esta pensado para CUDA: es un checkpoint MLX.
- Opciones de despliegue: MLX (mlx-lm, mlx-vlm), oMLX 0.7.0rc1 o superior, y clientes compatibles con MLX en Apple Silicon. Para Ollama o llama.cpp habria que reconvertir los pesos a GGUF, algo que este repositorio no incluye.
- Latencia y throughput: no disponibles. El autor no publica mediciones y no se han encontrado cifras en la busqueda web, mas alla de la afirmacion generica de que MLX es entre un 30% y un 50% mas rapido que otras rutas en Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| dicksondickson/Qwen3.8-27B-Uncensored-oQ6e-bf16-mtp-MLX (este) | 27,8B densos | 262K | Si | MIT | MLX safetensors 6 bits | Requiere M3 o superior por el bf16 en tensores criticos |
| dicksondickson/Qwen3.8-27B-Uncensored-MLX-oQ5e-fp16-mtp | 27,8B densos | 262K | Si | no disponible | MLX safetensors, precision 5 bits con fp16 | Variante mas ligera del mismo autor, compatible con M1/M2 |
| orcarouter/Qwen3.8-27B-Uncensored | 27,8B densos | 262K | Si | no disponible | safetensors sin cuantizar | Modelo base de esta cuantizacion; abliteracion a nivel de tensor |
| Qwen/Qwen3.8-27B | 27,8B densos | no disponible | Si | no disponible | safetensors | Modelo original alineado, con filtrado de seguridad estandar |

## Limitaciones y advertencias

- El filtrado de seguridad esta muy reducido de forma deliberada. El modelo puede generar contenido sensible, controvertido o inapropiado, y el autor advierte explicitamente de ello en la model card.
- No es adecuado para audiencias generales, menores ni aplicaciones que exijan alta seguridad. El propio autor recomienda uso en investigacion, pruebas o entornos controlados y evitar produccion o servicios publicos.
- Riesgo de alucinacion: no hay datos especificos publicados para este checkpoint. Como cualquier modelo de 27B, puede inventar hechos, citas o APIs, especialmente en contextos muy largos.
- La abliteracion puede degradar comportamientos de seguridad aprendidos mas alla del rechazo, como la negativa a ayudar en tareas daninas. El autor afirma que no hay perdida de capacidad medible, pero no aporta benchmarks completos que lo respalden.
- Restricciones de licencia: el repositorio declara MIT, pero al derivar de Qwen3.8-27B conviene verificar las condiciones de la licencia original antes de un uso comercial. La model card no aclara la licencia del modelo base orcarouter.
- Compatibilidad de hardware limitada: los tensores bf16 exigen Apple M3 o posterior. En M1 y M2 hay que usar la variante fp16.
- Idiomas soportados no documentados en la informacion disponible; el rendimiento fuera del ingles y el chino puede ser inferior al de modelos con reparto multilingue declarado.
- No se ofrecen garantias de seguridad por defecto. El autor declina responsabilidad sobre las consecuencias del uso.
- La fecha de creacion del repositorio es el 29 de septiembre de 2026, con una unica actualizacion dos minutos despues; es un artefacto muy reciente y sin adopcion medible (0 descargas, 1 like).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dicksondickson/Qwen3.8-27B-Uncensored-oQ6e-bf16-mtp-MLX
- Modelo base (abliterado): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Pagina del modelo base en Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante MLX en 5 bits con fp16: https://huggingface.co/dicksondickson/Qwen3.8-27B-Uncensored-MLX-oQ5e-fp16-mtp
- Repositorio GitHub con la build abliterada y las cuatro precisiones MLX: https://github.com/onurburak9/Qwen3.8-27B-Uncensored-MLX
- Repositorio GitHub de despliegue local (Ollama y MLX): https://github.com/Wassimyounes01/qwen38-uncensored
