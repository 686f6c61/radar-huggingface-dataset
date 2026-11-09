# ooptimum/hanzap

## Resumen

Hanzap es un repositorio de pesos en formato MLX publicado por el usuario ooptimum que contiene los modelos de traduccion que utiliza la aplicacion Hanzap para realizar traduccion en el dispositivo (on-device) en iPhone. El repositorio incluye dos variantes: `lm1/`, descrita por el autor como modelo base, y `lm2/`, descrita como modelo mejorado. La model card es explicita al senalar que estos ficheros no estan pensados para usarse directamente, sino que la propia aplicacion los descarga en tiempo de ejecucion.

El modelo se distribuye bajo licencia Apache 2.0 y esta etiquetado en Hugging Face con el pipeline de traduccion y la libreria MLX, el framework de Apple para ejecutar modelos de machine learning de forma nativa sobre silicio Apple (GPU unificada de iPhone, iPad y Mac). El tamano total del repositorio es de 3,1 GB, lo que sugiere pesos en precision media o alta para un modelo de traduccion de tamano pequeno o moderado, aunque el autor no publica el numero de parametros ni la longitud de contexto.

La relevancia de este repositorio es limitada fuera del ecosistema de la aplicacion Hanzap: no hay model card tecnica, no se documentan datos de entrenamiento, benchmarks ni idiomas soportados, y el propio autor indica que los ficheros no estan destinados a uso directo. Para un desarrollador o investigador que evalue modelos de traduccion, Hanzap debe considerarse un artefacto de distribucion de una app concreta mas que un modelo de proposito general documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato MLX; el autor no detalla precision ni esquema de cuantizacion) |
| Idiomas soportados | no disponible (la model card no enumera pares de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`); repositorio de 3,1 GB con subcarpetas `lm1/` y `lm2/` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La model card no especifica si se trata de un transformer encoder-decoder, un decoder-only adaptado a traduccion, un modelo MoE ni ninguna otra variante. Tampoco se documenta el numero de parametros, la longitud de contexto, la composicion del corpus de entrenamiento, el numero de tokens vistos ni si hubo etapas de ajuste fino supervisado, RLHF o DPO.

El unico dato tecnico relevante es el formato de distribucion: pesos en safetensors compatibles con MLX, el framework de Apple optimizado para ejecucion on-device en hardware con memoria unificada. La existencia de dos variantes (`lm1` base y `lm2` mejorada) sugiere una estrategia de dos niveles de calidad o de tamano, pero el autor no detalla en que se diferencian en parametros, latencia o calidad de traduccion. Cualquier afirmacion adicional sobre arquitectura o entrenamiento seria especulativa.

## Capacidades

- Traduccion automatica: el pipeline declarado en Hugging Face es `translation`, por lo que la funcion prevista es la traduccion de texto entre idiomas.
- Ejecucion on-device: los pesos estan en formato MLX, lo que permite inferencia local en dispositivos Apple sin conexion a servidores externos.
- Dos niveles de modelo: variante base (`lm1`) y variante mejorada (`lm2`), presumiblemente con distinto equilibrio entre velocidad y calidad, aunque el autor no lo documenta.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; la model card no enumera los pares de idiomas cubiertos.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Traduccion integrada en la app Hanzap: el caso de uso principal y documentado es el consumo de estos pesos por parte de la aplicacion Hanzap para traducir texto en el iPhone del usuario sin enviar datos a la nube. Es el escenario para el que el autor publica el repositorio.
- Traduccion offline en entornos sin conectividad: al ejecutarse con MLX sobre hardware Apple, el modelo puede emplearse en situaciones de viaje o zonas con red limitada, siempre que se integre en una aplicacion que cargue los pesos.
- Prototipado de funcionalidades de traduccion en iOS: un desarrollador podria inspeccionar los pesos y el formato MLX como referencia para construir su propio pipeline de traduccion on-device, aunque el autor advierte que no estan pensados para uso directo.
- Evaluacion comparativa de las variantes `lm1` y `lm2`: util para medir el compromiso entre latencia y calidad en un dispositivo concreto, si se dispone de un conjunto de evaluacion propio.
- Investigacion sobre despliegue MLX: el repositorio sirve como ejemplo practico de empaquetado de pesos de traduccion en safetensors para MLX, con un tamano de 3,1 GB que encaja en la memoria unificada de dispositivos Apple recientes.
- Privacidad en traduccion de documentos sensibles: al no requerir servidor, el modelo permite traducir contenido confidencial localmente, siempre que la aplicacion anfitriona gestione correctamente el almacenamiento y el borrado de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas BLEU, COMET, chrF ni comparaciones con otros sistemas de traduccion, y tampoco documenta latencia o throughput en dispositivos concretos.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio ocupa 3,1 GB, por lo que la huella en memoria unificada sera del orden de esa cifra mas el overhead del runtime MLX.
- GPU recomendadas: hardware Apple con soporte MLX (chips de la serie A en iPhone e iPad recientes y chips M en Mac). No se documenta compatibilidad con GPU NVIDIA.
- Cabe en GPU de consumo: si, en el sentido de que esta disenado para hardware Apple de consumo; no se especifican modelos concretos de iPhone ni versiones minimas de iOS.
- Opciones de despliegue: MLX es el runtime declarado. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato safetensors-MLX no es directamente compatible con esos motores sin conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables, y las caracteristicas del repositorio (pesos sin documentacion tecnica, orientados a una app concreta) impiden establecer una comparacion rigurosa con modelos de traduccion de proposito general.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: no hay arquitectura, parametros, contexto, idiomas ni datos de entrenamiento, lo que impide evaluar el modelo con criterios tecnicos.
- No apto para uso directo: el propio autor indica que los ficheros los descarga la aplicacion Hanzap y que no estan pensados para usarse de forma independiente.
- Idiomas no documentados: se desconoce que pares de idiomas cubre y con que calidad, un riesgo serio para cualquier integracion en produccion.
- Riesgo de alucinacion y errores de traduccion: sin benchmarks ni evaluacion publicada, no hay garantias cuantificadas sobre fidelidad, omissiones o invenciones en la traduccion.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no es posible evaluar sesgos linguisticos, culturales o de dominio.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el usuario debe verificar el fichero `LICENSE.txt` del repositorio y asumir la responsabilidad sobre el cumplimiento.
- Ecosistema restringido: los pesos en MLX atan el uso a hardware y software Apple; no hay ruta documentada para otros entornos.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin senales de mantenimiento o soporte por parte del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ooptimum/hanzap
- Framework MLX de Apple: https://github.com/ml-explore/mlx
- Documentacion de MLX: https://ml-explore.github.io/mlx/
