# iconically-mine/anlp-a2-moe_top2

## Resumen

El modelo `iconically-mine/anlp-a2-moe_top2` es un transformer de tipo decoder con capa feed-forward de mezcla de expertos (MoE) con enrutamiento top-2. Se trata de un artefacto academico publicado por el usuario `iconically-mine`, asociado a la tarea «ANLP A2, Task 1», presumiblemente un ejercicio de una asignatura de procesamiento de lenguaje natural. No es un modelo de proposito general ni un lanzamiento comercial: es un checkpoint de investigacion de muy pequeno tamano.

Con 12,94 millones de parametros, una dimension de modelo (`d_model`) de 256, 6 capas, 8 cabezas de atencion y una dimension oculta de FFN de 1024, el modelo se situa muy por debajo de cualquier LLM utilizable en produccion. Fue entrenado sobre 30 millones de tokens y alcanzo una perdida de validacion final de 3,9567, un valor coherente con un modelo pequeno entrenado sobre un corpus limitado.

Su relevancia es exclusivamente didactica y experimental: sirve para ilustrar la implementacion de una capa MoE con `top-2` gating en un transformer decoder, y para reproducir el flujo de entrenamiento descrito en `src/part1/model/transformer.py`. No dispone de model card detallada, licencia declarada, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con FFN de tipo MoE y enrutamiento top-2 |
| Parametros totales | 12,94 M |
| Parametros activos | no disponible (se indica que la FFN es `moe_top2`, pero no se especifica el numero de expertos ni los parametros activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch (`.pt`, fichero `moe_top2_final.pt`), cargable con `torch.load` |

Otros hiperparametros declarados por el autor: `d_model=256`, `n_layers=6`, `n_heads=8`, `ffn_hidden_dim=1024`, tokens de entrenamiento `30,00 M`, perdida de validacion final `3,9567`. Tamano del repositorio en HuggingFace: 0,1 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder en el que la subcapa feed-forward sustituye la MLP densa habitual por una capa de mezcla de expertos (`ffn_type: moe_top2`). El enrutamiento top-2 implica que, para cada token, se seleccionan los dos expertos con mayor puntuacion y se combinan sus salidas. La configuracion concreta es de 6 capas, 8 cabezas de atencion, `d_model=256` y `ffn_hidden_dim=1024` por experto, con un total de 12,94 M de parametros. No se especifica en la informacion disponible el numero total de expertos, la funcion de enrutamiento, ni si existe balanceo de carga durante el entrenamiento.

El entrenamiento se realizo sobre 30 millones de tokens y la perdida de validacion final fue de 3,9567. No se documenta la composicion del dataset, el tokenizador empleado, la existencia de fases de ajuste fino (SFT, RLHF, DPO), ni ninguna innovacion tecnica adicional como decodificacion especulativa o atencion lineal. Tampoco se detalla el numero de pasos, el regimen de learning rate ni la infraestructura de entrenamiento.

## Capacidades

- Generacion de texto autoregresiva basica, limitada por el tamano del modelo (12,94 M de parametros) y por los 30 millones de tokens de entrenamiento.
- Ejecucion de una capa MoE top-2 como parte de su forward pass, lo que permite estudiar el comportamiento del enrutamiento y la activacion dispersa de expertos.
- Reproduccion de experimentos de asignatura: el checkpoint esta pensado para cargarse con `torch.load` y ejecutarse contra el codigo de `src/part1/model/transformer.py`.
- No hay evidencia ni declaracion de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento (thinking mode).
- No se declaran capacidades multilingues ni un conjunto de idiomas soportados.

## Casos de uso

- Docencia y aprendizaje: utilizar el checkpoint como referencia para implementar y depurar una capa MoE top-2 en PyTorch, comparando el comportamiento del enrutamiento con una FFN densa equivalente.
- Reproducibilidad de experimentos academicos: rerun del entrenamiento sobre los mismos 30 M de tokens para verificar la perdida de validacion reportada (3,9567) y analizar la estabilidad del entrenamiento.
- Analisis de enrutamiento de expertos: instrumentar el modelo para medir la distribucion de tokens por experto, la frecuencia de seleccion y el posible colapso de expertos con `top-2`.
- Estudio de eficiencia computacional: comparar el coste de FLOPs y memoria de la variante MoE top-2 frente a una FFN densa de dimension equivalente, en un modelo lo bastante pequeno como para caber en cualquier GPU.
- Base para ejercicios de ampliacion: escalar la configuracion (mas capas, mas expertos, mas tokens) como practica de laboratorio y medir el impacto en la perdida de validacion.
- Pruebas unitarias de pipelines de carga de modelos: verificar integraciones de `torch.load` y serializacion de checkpoints con arquitecturas MoE personalizadas en entornos de desarrollo.
- No se recomienda su uso en aplicaciones de produccion, atencion al cliente, generacion de codigo ni tareas que requieran calidad linguistica, dado su tamano y la ausencia de evaluaciones publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado por el autor es la perdida de validacion final de 3,9567 tras 30 millones de tokens de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 12,94 M de parametros, el checkpoint en fp32 ocupa aproximadamente 52 MB (0,1 GB de repositorio incluye otros artefactos). La inferencia cabe con holgura en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; por ejemplo GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, A100 o H100. No se requiere hardware de datacenter.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: al tratarse de un checkpoint `.pt` con arquitectura personalizada, no hay soporte directo documentado en vLLM, llama.cpp, Ollama, TGI ni otras herramientas estandar. El despliegue requiere cargar el estado con `torch.load` y usar el codigo de `src/part1/model/transformer.py`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (checkpoints academicos MoE de ~13 M de parametros con enrutamiento top-2) ni se aportan datos de rendimiento que permitan una comparacion objetiva con alternativas.

## Limitaciones y advertencias

- Modelo de muy pequeno tamano (12,94 M de parametros) entrenado con solo 30 millones de tokens: la calidad de generacion de texto es limitada y no es apto para tareas reales de lenguaje.
- Perdida de validacion final de 3,9567, valor alto que sugiere un ajuste pobre sobre la distribucion de validacion.
- No se declara licencia: se desconoce si se permite uso comercial, redistribucion o modificacion.
- No se declaran idiomas soportados; el tokenizador y el corpus de entrenamiento son desconocidos.
- No se documenta la longitud de contexto, por lo que se desconoce el maximo de tokens que admite en inferencia.
- Riesgo de alucinacion y de generar texto incoherente: inherente a un modelo de este tamano sin ajuste fino documentado.
- Sesgos conocidos: no disponibles; no se ha realizado ninguna evaluacion de sesgo, toxicidad o seguridad.
- Formato de pesos no estandar: al ser un `.pt` con arquitectura personalizada, no es directamente compatible con runtimes de inferencia convencionales, lo que complica su integracion en produccion.
- Sin soporte declarado de tool calling, agentes, vision ni audio: no debe asumirse ninguna de estas capacidades.
- Repositorio sin descargas y con un unico «like»: no hay evidencia de validacion por parte de la comunidad ni de uso en terceros.

## Enlaces

- HuggingFace: https://huggingface.co/iconically-mine/anlp-a2-moe_top2
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
