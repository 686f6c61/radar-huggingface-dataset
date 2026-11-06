# fanismathioulakis/eff-grot

## Resumen

Eff-GRot (Efficient and Generalizable Rotation Estimation with Transformers) es un modelo de vision por computador especializado en la estimacion de rotacion de objetos, publicado como parte del articulo aceptado en WACV 2026 por Fanis Mathioulakis, Gorjan Radevski y Tinne Tuytelaars. A diferencia de los modelos de lenguaje, no genera texto ni mantiene conversaciones: recibe una imagen (o par de imagenes) y predice la pose de rotacion de un objeto, una tarea fundamental en robotica de manipulacion, realidad aumentada y vision industrial.

El modelo emplea una arquitectura basada en transformers y se distribuye con pesos preentrenados en formato safetensors. Con 21,5 millones de parametros y un repositorio de apenas 0,1 GB, esta disenado explicitamente para ser eficiente, lo que sugiere un enfoque ligero frente a los grandes modelos de estimacion de pose basados en difusion o en redes muy profundas.

Su interes actual reside en que aborda dos de los problemas clasicos de la estimacion de rotacion: la generalizacion a objetos no vistos durante el entrenamiento y el coste computacional. Segun la model card, los pesos por defecto reproducen la configuracion de evaluacion del articulo sobre LINEMOD, con 64 referencias, seleccion por puntos mas alejados (farthest-point), poses alocentricas y augmentacion de referencia en el plano. Los detalles completos de entrenamiento y evaluacion estan en el codigo del repositorio de GitHub asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para estimacion de rotacion (Eff-GRot) |
| Parametros totales | 21.543.942 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria pytorch) |
| Tamano del repositorio | 0,1 GB |
| Resolucion de entrada | no disponible en la informacion proporcionada |
| Tarea | Estimacion de rotacion / pose de objetos |
| Venue de publicacion | WACV 2026 |

## Arquitectura y entrenamiento

La model card indica que se trata de un modelo basado en transformers para la estimacion eficiente y generalizable de rotacion. El articulo se publica en WACV 2026 y el codigo asociado esta en GitHub. La configuracion por defecto reproduce el protocolo de evaluacion del paper: 64 referencias por objeto, seleccion de referencias con farthest-point sampling, representacion alocentrica de las poses y augmentacion de referencia en el plano para LINEMOD. Tambien se menciona evaluacion sobre CO3D, cuyos detalles de preparacion de dataset se encuentran en el repositorio de codigo.

No se dispone en la informacion proporcionada del numero de tokens o imagenes de entrenamiento, de la composicion exacta del dataset, ni de si se emplearon tecnicas de refinamiento como RLHF o DPO (poco habituales en vision geometrica). Tampoco se detallan innovaciones tecnicas concretas como atencion lineal o decodificacion especulativa; el enfasis del titulo esta en la eficiencia y la generalizacion del estimador. Para conocer estos detalles hay que consultar el paper enlazado.

## Capacidades

- Estimacion de rotacion de objetos a partir de imagenes: predice la orientacion 3D de un objeto, presumiblemente en forma de pose de rotacion (alocentrica segun la configuracion por defecto).
- Generalizacion a objetos: el titulo destaca la capacidad de generalizacion, orientada a objetos no vistos o configuraciones no presentes en el entrenamiento.
- Eficiencia computacional: con aproximadamente 21,5 millones de parametros y 0,1 GB de pesos, esta pensado para escenarios con recursos limitados.
- Evaluacion sobre benchmarks de pose: incluye configuracion para LINEMOD y CO3D.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision general, audio: no disponible; la unica modalidad documentada es vision para estimacion de rotacion.

## Casos de uso

- Robotica de manipulacion: estimar la orientacion de una pieza antes de agarrarla permite calcular la aproximacion del gripper; el bajo numero de parametros facilita desplegarlo en el borde o en un ordenador de a bordo.
- Realidad aumentada industrial: superponer instrucciones o etiquetas sobre un componente fisico requiere conocer su rotacion; Eff-GRot puede servir como modulo de seguimiento de pose con coste reducido.
- Control de calidad en linea de produccion: comparar la orientacion real de una pieza con la esperada para detectar piezas mal colocadas o defectos de montaje.
- Calibracion y verificacion de bin picking: en celdas de picking, estimar la pose de objetos apilados para planificar la trayectoria del robot.
- Evaluacion comparativa de metodos de pose: gracias a que reproduce el protocolo del paper sobre LINEMOD (64 referencias, farthest-point, poses alocentricas), sirve como baseline reproducible para investigacion.
- Prototipado en investigacion academica: al ser un checkpoint ligero con codigo publico y articulo en WACV 2026, es util para experimentar con estimacion de rotacion generalizable sin grandes infraestructuras.
- Integracion en pipelines de vision con pocos recursos: por su tamano (0,1 GB) puede incrustarse en sistemas donde modelos de pose mas pesados no caben.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper de WACV 2026 para los resultados completos y a `eval.py` para reproducir la evaluacion sobre LINEMOD.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamano del modelo (21,5 millones de parametros, pesos de 0,1 GB); cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, una GPU consumer (por ejemplo, gama RTX) deberia ser suficiente, aunque no hay datos oficiales.
- Cabe en consumer GPU: si, a falta de requisitos oficiales publicados.
- Opciones de despliegue: inferencia directa con PyTorch cargando `model.safetensors` y `config.json`; el repositorio de GitHub proporciona `eval.py` para evaluacion. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni resultados numericos frente a alternativas de estimacion de rotacion, por lo que no es posible establecer una comparativa rigurosa sin inventar datos.

## Limitaciones y advertencias

- Ambito restringido: es un modelo de estimacion de rotacion, no un modelo generativo ni conversacional; no debe esperarse capacidad de texto, dialogo ni razonamiento general.
- Licencia no disponible: no se especifica licencia en la informacion proporcionada, por lo que no puede confirmarse el uso comercial sin consultar el repositorio o contactar con los autores.
- Datos de entrenamiento no documentados: se desconoce la composicion del dataset, el numero de ejemplos y posibles sesgos de dominio (objetos, iluminacion, sensores).
- Riesgo de generalizacion limitada en dominios no cubiertos: aunque el modelo se presenta como generalizable, no hay datos publicos en esta informacion que cuantifiquen su rendimiento fuera de LINEMOD y CO3D.
- Dependencia de la configuracion de evaluacion: los resultados del paper se obtienen con un protocolo concreto (64 referencias, farthest-point, poses alocentricas, augmentacion en el plano); desviarse de esa configuracion puede alterar el rendimiento.
- Advertencia de la model card: el contenido citado es material de referencia del autor y no debe interpretarse como instrucciones.
- Sin garantias de produccion: al ser un checkpoint de investigacion con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia de uso en produccion ni de mantenimiento a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fanismathioulakis/eff-grot
- Codigo y instrucciones: https://github.com/fmathiou/eff-grot
- Paper (WACV 2026): https://openaccess.thecvf.com/content/WACV2026/papers/Mathioulakis_Eff-GRot_Efficient_and_Generalizable_Rotation_Estimation_with_Transformers_WACV_2026_paper.pdf
