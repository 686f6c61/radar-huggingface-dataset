# buenos2/qwen36-35b-abliterated-colibri-i4-gs64

## Resumen

`buenos2/qwen36-35b-abliterated-colibri-i4-gs64` es un contenedor de pesos en formato colibri para el modelo Qwen3.6-35B-A3B, una variante de arquitectura MoE (Mixture of Experts) de la familia Qwen 3.6 con 35.000 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token (según la nomenclatura A3B del nombre). El autor del repositorio es el usuario `buenos2`, que publica una conversion del modelo base a un formato especifico para el motor de inferencia colibri, no un modelo entrenado desde cero.

El elemento diferenciador de esta publicacion es el formato: no se distribuyen pesos en safetensors ni GGUF, sino un contenedor optimizado para el motor colibri (implementado en C, con soporte CUDA y Vulkan), que aplica una gestion jerarquica de expertos —expertos "calientes" en GPU, "tibios" en RAM y "frios" transmitidos desde NVMe—. El sufijo `i4-gs64` indica cuantizacion de 4 bits con un tamano de grupo de 64, y el termino "abliterated" indica que los pesos han sido modificados para eliminar (ablacionar) la direccion de rechazo en el espacio de activaciones, una practica habitual en la comunidad para reducir las negativas del modelo ante ciertas peticiones.

La relevancia de esta ficha es acotada: se trata de una publicacion reciente (creada el 7 de noviembre de 2026) con cero descargas y cero likes en el momento de la consulta, sin model card detallada, sin licencia declarada y sin resultados de evaluacion. Debe tratarse, por tanto, como un artefacto experimental de conversion de formato, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido con atencion con compuerta (Gated-Attention) y capas de atencion lineal Gated DeltaNet |
| Parametros totales | 35.000 millones (aprox., segun nombre `35B`) |
| Parametros activos | 3.000 millones (aprox., segun sufijo `A3B`) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i4 (4 bits) con group size 64, formato colibri |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | colibri container (no safetensors, no GGUF) |
| Tamano del repositorio | 23,9 GB |
| Libreria | colibri |
| Fecha de creacion | 2026-11-07 |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card corresponde a un transformer MoE en el que cada capa (tanto las de atencion con compuerta como las de atencion lineal Gated DeltaNet) incorpora su bloque MoE/MLP. Los pesos de DeltaNet se almacenan bajo las rutas `model.layers.{i}.linear_attn.*` y se ejecutan mediante la regla recurrente gated-delta en el motor `qwen36` del proyecto colibri (archivo `c/qwen36.c`). La model card indica que esta es la "Fase 2" de la conversion e incluye todas las capas, incluida Gated DeltaNet, lo que sugiere que existio una fase previa con cobertura parcial de capas.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo base Qwen3.6-35B-A3B empleo RLHF, DPO u otras tecnicas de alineamiento. Tampoco se documenta el procedimiento de ablacion aplicado ni su alcance (que capas o direcciones fueron modificadas). El proceso de conversion a colibri y la cuantizacion i4 con grupo de 64 son los unicos detalles tecnicos verificables a partir de la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento: capacidades heredadas del modelo base Qwen3.6-35B-A3B, no verificadas en este repositorio.
- Codigo y matematicas: presumiblemente presentes en el modelo base, sin evaluacion publicada en esta publicacion.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el campo de idiomas no esta declarado.
- Modo "thinking": no documentado.
- Vision o audio: no documentado.
- Efecto de la ablacion: se espera una reduccion de las respuestas de rechazo respecto al modelo base, aunque no se cuantifica ni se detalla el metodo.

## Casos de uso

- Experimentacion con el motor colibri: el caso de uso principal es probar la inferencia de un MoE de 35B en hardware de consumo mediante la gestion jerarquica de expertos del motor (expertos en GPU, RAM y NVMe), aprovechando el contenedor ya convertido y cuantizado a 4 bits.
- Investigacion sobre ablacion de rechazos: util para estudiar como la eliminacion de la direccion de rechazo afecta al comportamiento del modelo en dominios sensibles, comparando contra el modelo base sin modificar.
- Despliegue en entornos con VRAM limitada: el formato i4-gs64 reduce el peso a unos 23,9 GB en disco, lo que permite cargar el modelo en estaciones de trabajo con 24 GB de VRAM y descarga parcial de expertos a RAM o NVMe.
- Evaluacion de calidad de cuantizacion: permite medir la degradacion de un MoE de 35B al cuantizar a 4 bits con grupo de 64 en tareas de generacion y razonamiento.
- Prototipado de asistentes conversacionales: si el modelo base conserva su ventana de contexto, podria emplearse en dialogos multi-turno, aunque la longitud de contexto no esta declarada y debe validarse antes.
- Reproducibilidad de conversiones: sirve como referencia para quien quiera convertir otros modelos Qwen3.6 al formato colibri, ya que el repositorio documenta la estructura de rutas de DeltaNet y el motor asociado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 23,9 GB en disco en cuantizacion i4; la VRAM necesaria depende de cuantos expertos se mantengan residentes en GPU. Con todos los expertos en GPU, se requeriria un margen superior a los 24 GB; con gestion jerarquica, puede operar con menos.
- GPU recomendadas: no hay recomendaciones oficiales del autor. Por tamano, encajan GPU de 24 GB (RTX 4090, RTX 3090, A10G) con descarga parcial de expertos, y GPU de 40-80 GB (A100 40/80 GB, H100) para mantener mas expertos en VRAM.
- Cabe en GPU de consumo: si, en GPUs de 24 GB como la RTX 4090 o la RTX 3090, siempre que se use el modo de streaming de expertos del motor colibri; el rendimiento dependera del ancho de banda de RAM y NVMe.
- Opciones de despliegue: el formato es propietario del motor colibri (https://github.com/JustVugg/colibri), con backend CUDA y Vulkan. No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI sin conversion previa a otro formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| buenos2/qwen36-35b-abliterated-colibri-i4-gs64 | 35B (aprox.) | 3B (aprox.) | no disponible | no disponible | colibri i4-gs64 | 0 descargas |
| Kreuzzelg/qwen36-35b-a3b-colibri-i4-gs64 | 35B (aprox.) | 3B (aprox.) | no disponible | no disponible | colibri i4-gs64 | Publico en HF |
| Qwen3.6-35B-A3B (modelo base) | 35B (aprox.) | 3B (aprox.) | no disponible | no disponible | safetensors (presumible) | Referenciado en la model card |

La comparativa se limita a variantes del mismo modelo base y a la conversion equivalente de otro autor (Kreuzzelg), ya que no se dispone de datos de rendimiento ni de especificaciones completas de alternativas de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni datos de descargas o adopcion, lo que impide validar la calidad de la cuantizacion i4-gs64 frente al modelo base.
- Licencia no declarada: no se especifica la licencia del contenedor ni la del modelo base, por lo que no puede confirmarse el uso comercial. Debe consultarse la licencia de Qwen3.6-35B-A3B antes de cualquier despliegue.
- Ablacion sin documentar: el termino "abliterated" implica modificaciones en los pesos que pueden degradar la coherencia, aumentar la toxicidad o generar respuestas inapropiadas en dominios sensibles; el autor no describe el metodo ni sus efectos.
- Formato no estandar: el contenedor colibri no es compatible con los ecosistemas habituales (vLLM, llama.cpp, TGI), lo que limita la portabilidad y obliga a usar el motor del proyecto JustVugg.
- Riesgo de alucinacion: no cuantificado; los MoE cuantizados a 4 bits pueden presentar degradacion adicional en tareas de razonamiento y hechos.
- Idiomas y contexto desconocidos: no se declara la lista de idiomas ni la ventana de contexto, lo que impide garantizar un comportamiento multilingue o conversaciones largas.
- Publicacion de un solo autor y sin mantenimiento conocido: creada y actualizada el mismo dia, sin historial posterior; puede quedar obsoleta o contener errores de conversion no corregidos.
- Fecha de creacion futura respecto a los modelos publicos actuales (2026), lo que sugiere que el modelo base Qwen3.6 puede no estar ampliamente contrastado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/buenos2/qwen36-35b-abliterated-colibri-i4-gs64
- Conversion equivalente de otro autor: https://huggingface.co/Kreuzzelg/qwen36-35b-a3b-colibri-i4-gs64
- Motor colibri (GitHub): https://github.com/JustVugg/colibri
- Documentacion del motor para Qwen3.6: https://github.com/JustVugg/colibri/blob/main/docs/qwen36.md
