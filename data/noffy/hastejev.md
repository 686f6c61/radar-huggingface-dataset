# noffy/hastejev

## Resumen

Haste Jev (identificador `noffy/hastejev`) es un modelo de pesos abiertos publicado por el usuario noffy, descrito por su autor como un "motor de decisiones System-1" no generativo, de latencia ultrabaja y orientado a extracción de características. No es un modelo de lenguaje generativo: su `pipeline_tag` es `feature-extraction` y su función declarada es evaluar conjuntos de opciones candidatas y devolver una decisión puntuada, en lugar de generar texto token a token. Cuenta con 20.383.267 parámetros reales (dimensión oculta 256, 4 capas, 4 cabezas según la model card) y un repositorio de 0,3 GB.

El modelo se presenta como alternativa a servicios de decisión alojados tipo TypeSafe Jev y a clones open source citados como OpenJev y Kev, y como sustituto de LLM en tareas de enrutado y elección entre alternativas donde la latencia y la ausencia de sesgo posicional son críticas. Su propuesta técnica se apoya en cuatro componentes declarados: atención cruzada invariante a permutación (PICA), embeddings de Fourier escalares y temporales (STFE), un softmax vectorial jerárquico en dos etapas (H2-Softmax) y calibración híbrida isotónica-temperatura (HIT-Calib).

La relevancia del modelo radica en que ataca limitaciones estructurales de los decodificadores autorregresivos aplicados a decisiones discretas: latencia secuencial, sesgo de primacía hacia las primeras opciones, techo de cardinalidad por vocabulario y destrucción de la identidad numérica por tokenización. La model card está truncada en el momento de la consulta, por lo que no se dispone de información sobre datos de entrenamiento, contexto soportado ni proceso de ajuste. El repositorio registra 0 descargas y 1 like, por lo que se trata de una publicación reciente y sin adopción verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal con atencion cruzada invariante a permutacion (PICA), embeddings de Fourier escalares y temporales (STFE), softmax vectorial jerarquico en dos etapas (H2-Softmax) y calibracion HIT-Calib; no generativa, tarea de feature-extraction |
| Parametros totales | 20.383.267 (dato real de los pesos safetensors) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32, FP16/BF16, INT8 dinamica, INT8 solo pesos, INT4 empaquetada (nibble-packed) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch): `model.safetensors`, `model_fp16.safetensors`, `model_int8.safetensors`, `model_int4.safetensors` |
| Dimension oculta (d_model) | 256 |
| Capas | 4 |
| Cabezas de atencion | 4 |
| Tamano del repositorio | 0,3 GB |
| Libreria | transformers |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

La informacion disponible describe una arquitectura no generativa de tipo encoder con atencion cruzada, pensada para puntuar opciones candidatas de forma independiente y en paralelo. El componente PICA (Permutation-Invariant Cross-Attention) es el encargado de garantizar invariancia al orden de presentacion de las alternativas, de modo que la posicion de una opcion en el prompt no afecte a su puntuacion. Los embeddings STFE proyectan cantidades numericas y marcas temporales ISO en representaciones continuas de Fourier para preservar la identidad numerica, algo que la tokenizacion habitual rompe al fragmentar cifras como `14850.50`. La capa H2-Softmax permite escalar la seleccion a mas de 10.000 candidatas con un nivel explicito de rechazo residual, y HIT-Calib convierte los logits en probabilidades calibradas.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el numero de tokens, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras. La etiqueta `reinforcement-learning` figura entre las etiquetas del repositorio, lo que sugiere el uso de aprendizaje por refuerzo en alguna fase, pero la model card no detalla el procedimiento ni las recompensas empleadas. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal, mas alla de los cuatro componentes citados. La model card se corta antes de las secciones de uso, entrenamiento y evaluacion, por lo que no es posible verificar la implementacion descrita.

## Capacidades

- Extraccion de caracteristicas y puntuacion de conjuntos de opciones candidatas, con salida de probabilidades calibradas en lugar de texto generado.
- Toma de decisiones de baja latencia: el autor declara una latencia p99 inferior a 15 ms y capacidad de operar sobre mas de 10.000 candidatas en menos de 1 ms.
- Invariancia al orden de las opciones, con una varianza declarada del 0,0 % (sesgo de primacia nulo).
- Razonamiento numerico y temporal mediante STFE, con una precision aritmetica declarada del 99,4 %.
- Calibracion de confianza, con un error de calibracion esperado (ECE) declarado inferior a 0,009, lo que permite usar las puntuaciones como probabilidades.
- Orientacion a agentes autonomos y automatizacion web: las etiquetas del repositorio incluyen `autonomous-agents`, `browser-control`, `web-automation` y `agentic-ai`, lo que sugiere su uso como modulo de decision dentro de bucles de agente.
- No soporta generacion de texto, tool calling en sentido estricto ni capacidades multimodales (vision o audio) segun la informacion disponible.
- Soporte multilingue limitado al ingles.

## Casos de uso

- Enrutado de acciones en agentes de navegador: dado un espacio de acciones DOM (clic, escribir, desplazar, navegar), el modelo puntua cada accion candidata y devuelve la mas probable con una probabilidad calibrada. La invariancia a permutacion evita que el orden en que se enumeran las acciones altere la eleccion, algo critico cuando el espacio de acciones lo genera dinamicamente la propia pagina.
- Seleccion de producto o plan en catalogos amplios: con soporte declarado para mas de 10.000 candidatas, puede clasificar un catalogo completo de referencias en una sola pasada sin recurrir a recuperacion previa, devolviendo ademas un nivel de rechazo cuando ninguna candidata encaja.
- Enrutado financiero y KYC: los presets mayores de la familia se orientan explicitamente a enrutado financiero y verificacion de identidad; el uso tipico seria decidir entre colas de revision, reglas de compliance o niveles de verificacion, con probabilidades calibradas para fijar umbrales.
- Atencion al cliente con arboles de decision: elegir la intencion o el siguiente paso de un flujo conversacional a partir del estado del dialogo, sustituyendo a un LLM cuando la latencia p99 de 480 ms o mas resulta inaceptable en un sistema en tiempo real.
- Despliegue en el borde sin GPU: con ~20,4 MB en INT8 y ~10 MB estimados en INT4, el modelo puede ejecutarse como sidecar en CPU, en workers de navegador o en dispositivos IoT, cubriendo decisiones locales sin enviar datos a un servicio externo.
- Automatizacion de pruebas y agentes de UI: seleccionar el siguiente elemento interactivo en una suite de pruebas end-to-end a partir del arbol de accesibilidad, manteniendo latencias por debajo del umbral perceptible y evitando que el orden de los selectores introduzca sesgo.
- Moderacion o triaje por reglas: clasificar casos en categorias de riesgo con umbrales derivados de probabilidades calibradas (ECE declarado < 0,009), de modo que un umbral de 0,9 tenga un significado estadistico estable.
- Sistemas de recomendacion con restricciones: elegir entre alternativas que ya han pasado un filtro de negocio, usando el modelo unicamente como capa final de decision de bajisima latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. La model card unicamente declara metricas propias del sistema, que se recogen a continuacion tal como aparecen en ella; no se ha encontrado verificacion independiente de ninguna de ellas.

| Metrica declarada | Valor | Ambito |
|---|---|---|
| Latencia p99 | < 15 ms | Inferencia por decision |
| Varianza por orden de opciones | 0,0 % | Sesgo de primacia en el conjunto de candidatas |
| Precision aritmetica | 99,4 % | Razonamiento sobre cantidades numericas (STFE) |
| Error de calibracion esperado (ECE) | < 0,009 | Calibracion de probabilidades (HIT-Calib) |
| Escalado de candidatas | > 10.000 opciones en < 1 ms | Seleccion con H2-Softmax |
| Latencia comparada de referencia | 480 ms o mas (p99) | Atribuida a decodificadores autorregresivos tipo Jev |

## Requisitos de hardware

- VRAM/RAM para inferencia (cifras de la model card): ~81,5 MB en FP32, ~20,4 MB en INT8, ~10,2 MB en INT4 (esta ultima derivada del ratio de compresion 8,0x declarado por el autor).
- GPU recomendadas: no aplica ninguna en concreto; el tamano permite ejecucion en CPU. Cualquier GPU consumer sirve (por ejemplo, RTX 3060, RTX 4090), e incluso Tensor Cores de generaciones antiguas son mas que suficientes.
- Cabe en GPU consumer: si, con margen amplisimo; tambien cabe en microcontroladores, WebAssembly y navegador segun la propia model card, que lista presets desde 98.127 parametros orientados a IoT.
- Opciones de despliegue: transformers (libreria declarada), paquete propio `hastejev` (`pip install hastejev`) y la variante desde GitHub; los formatos FP16, INT8 e INT4 empaquetada estan publicados como ficheros safetensors separados. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y dado que el modelo no es generativo estas herramientas no son aplicables de forma estandar.
- Latencia y throughput: unica cifra disponible, p99 < 15 ms por decision segun el autor. No se publican medidas de throughput ni resultados por hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| noffy/hastejev (20m, Base) | 20.383.267 | no disponible | p99 < 15 ms, ECE < 0,009, 0,0 % sesgo de orden (declarado) | Apache 2.0 | HuggingFace, 0 descargas |
| noffy/hastejev-10m (Large) | ~10.002.275 | no disponible | no disponible | Apache 2.0 (segun familia) | HuggingFace |
| noffy/hastejev-5m (Medium) | ~5.003.971 | no disponible | no disponible | Apache 2.0 (segun familia) | HuggingFace |
| noffy/hastejev-2m (Small) | ~1.826.275 | no disponible | no disponible | Apache 2.0 (segun familia) | HuggingFace |
| TypeSafe Jev | no disponible | no disponible | p99 de 480 ms o mas segun la comparativa del propio autor | servicio alojado, no disponible | Servicio alojado |
| OpenJev / Kev | no disponible | no disponible | sesgo posicional y techo de cardinalidad (~26 letras en OpenJev) segun la model card | no disponible | Open source, repositorio no indicado |

Las cifras de Jev, OpenJev y Kev proceden exclusivamente de la comparativa incluida en la model card del propio autor y no se han contrastado con fuentes independientes. No se dispone de datos de benchmarks que permitan una comparacion cuantitativa homogenea frente a LLM de proposito general.

## Limitaciones y advertencias

- Modelo no generativo: no produce texto, por lo que no puede emplearse como sustituto directo de un LLM en tareas de generacion, resumen o dialogo libre.
- Idioma unico: solo ingles; no hay evidencia de soporte para castellano ni otros idiomas.
- Ausencia total de datos de entrenamiento: se desconoce el corpus, el numero de tokens, la composicion y si se aplicaron RLHF, DPO u otras tecnicas, lo que impide auditar sesgos de origen.
- Metricas no verificadas: las cifras de latencia, calibracion, precision aritmetica y sesgo de orden proceden unicamente de la model card del autor; no se ha localizado evaluacion externa ni resultados de benchmarks estandar.
- Model card incompleta: el contenido disponible se corta antes de las secciones de uso, entrenamiento y limitaciones, de modo que faltan instrucciones de uso, esquemas de entrada y ejemplos de integracion.
- Adopcion nula: 0 descargas y 1 like en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad y de informes de fallos.
- Riesgo de calibracion fuera de dominio: aunque se declara un ECE inferior a 0,009, este valor corresponde al regimen de evaluacion del autor; en distribuciones distintas (otro idioma, otro tipo de opciones) la calibracion puede degradarse y hacer que los umbrales de decision no sean fiables.
- Sesgos desconocidos: no se documenta ninguna evaluacion de sesgo demografico, cultural o linguistico.
- Licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion; al no haber fichero de modelo ni documentacion adicional, no se identifican restricciones anadidas, pero tampoco garantias.
- Busqueda web sin resultados relevantes: las consultas realizadas no devolvieron informacion util sobre este modelo, por lo que toda la ficha se apoya en los metadatos de HuggingFace y en la propia model card.
- Uso en produccion: al no existir tests publicados, versionado semantico ni changelog, cualquier integracion en produccion deberia acompanarse de una evaluacion propia sobre el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/noffy/hastejev
- Repositorio GitHub: https://github.com/racstan/hastejev
- Notebook de modelos hermanos y cuantizacion (Kaggle): https://www.kaggle.com/code/rachitasthana/hastejev-sister-models-and-quantization
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Modelo hermano hastejev-100k: https://huggingface.co/noffy/hastejev-100k
- Modelo hermano hastejev-500k: https://huggingface.co/noffy/hastejev-500k
- Modelo hermano hastejev-1m: https://huggingface.co/noffy/hastejev-1m
- Modelo hermano hastejev-2m: https://huggingface.co/noffy/hastejev-2m
- Modelo hermano hastejev-5m: https://huggingface.co/noffy/hastejev-5m
- Modelo hermano hastejev-10m: https://huggingface.co/noffy/hastejev-10m
