# Pramish/isee

## Resumen

iSEE es un modelo de representación visual orientado a objetos, no un modelo de lenguaje. Lo desarrolla el autor de Hugging Face Pramish y se distribuye como el conjunto de checkpoints asociados al artículo científico del mismo nombre, alojado en el repositorio `insait-institute/iSEE`. Su objetivo es aprender representaciones centradas en objetos (object-centric learning) con atención por slots (slot attention) para resolver tareas de permanencia del objeto: mantener la identidad de un objeto aunque quede ocluido o desaparezca de la escena.

El repositorio no contiene un modelo único, sino 35 ficheros (2,15 GB) que cubren todos los checkpoints leídos por las tablas y figuras del artículo: codificadores iSEE, walkers de dinámica, baselines SlotContrast, ablaciones y modelos comparativos reentrenados (RandSF.Q y Loci-Looped). Los experimentos se reparten en cuatro escenarios: LA-CATER con cámara estática, LA-CATER con cámara en movimiento, KITTI tracking y MOVi-C.

Es relevante para investigadores en visión por computador y aprendizaje auto-supervisado que necesiten reproducir resultados de permanencia del objeto, comparar arquitecturas de slot attention o reutilizar codificadores preentrenados como extractores de features centradas en objetos. No es un modelo generativo ni conversacional: no procesa texto ni responde instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder visual con slot attention (object-centric learning); walkers de dinámica separados |
| Parametros totales | no disponible (checkpoints de 0,4 MB a 139,7 MB por fichero; no se publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa fotogramas o secuencias de vídeo, no texto) |
| Tipos de cuantizacion | no disponible (checkpoints en precisión de entrenamiento, `.ckpt` y `.pt`) |
| Idiomas soportados | no disponible (modelo visual, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | PyTorch: `.ckpt` (encoders, baselines, ablaciones) y `.pt` (walkers, dinámica) |

## Arquitectura y entrenamiento

iSEE se construye sobre un encoder visual con mecanismo de slot attention, que descompone cada imagen o fotograma en un conjunto fijo de slots latentes, cada uno asociado idealmente a un objeto de la escena. Sobre esos slots se entrena un módulo denominado walker, de tamaño muy reducido (1,4 MB en LA-CATER, 0,4 MB en KITTI), que modela la dinámica temporal y la permanencia: predice el estado de los objetos cuando dejan de ser visibles. La ablación `isee_noapp` indica que el entrenamiento incorpora una pérdida de apariencia por slot (`sg(a)`), y la ablación `isee_ssall` revela que existe una pérdida de contraste slot-slot aplicada de forma selectiva. También hay una ablación con DINOv2 estándar (`isee_dino`), lo que sugiere que el encoder parte de features DINOv2 y las adapta.

El repositorio incluye los ficheros de configuración de cada ejecución (`settings.yaml`, `args.json`, `cfg.json`, `config.py`) y un `checkpoints.tsv` que documenta, para cada checkpoint, su md5, tamaño, ruta original en el clúster y las tablas y figuras del artículo que lo utilizan. No se detalla en la información disponible el número de tokens, la composición exacta de los datasets ni si se empleó RLHF o DPO (no aplicable en un modelo visual de este tipo). Los modelos comparativos RandSF.Q y Loci-Looped fueron reentrenados por los autores con el código original de sus creadores.

## Capacidades

- Extracción de representaciones centradas en objetos a partir de imágenes y fotogramas de vídeo.
- Descomposición de escenas en slots latentes, uno por objeto aproximado.
- Modelado de permanencia del objeto: inferencia del estado de objetos ocluidos o fuera de plano mediante el walker.
- Seguimiento implícito de objetos en secuencias con cámara estática (LA-CATER static) y con cámara en movimiento (LA-CATER moving, KITTI tracking).
- Aprendizaje de dinámica sobre slots, con variantes que incorporan un flujo de posición (`dynloc`) o solo acción (`ocvp_act`).
- Capacidades de descubrimiento de objetos evaluadas sobre MOVi-C.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.
- No incluye visión-lenguaje, audio ni modo de razonamiento explícito.

## Casos de uso

- Reproducción de resultados académicos: cargar los checkpoints listados en `checkpoints.tsv` y ejecutar las tablas y figuras del artículo iSEE para verificar cifras de permanencia del objeto en LA-CATER, KITTI y MOVi-C.
- Investigación en object-centric learning: usar los encoders iSEE y SlotContrast como línea base comparable para evaluar nuevas pérdidas de contraste o mecanismos de atención por slots.
- Seguimiento de objetos en conducción autónoma: el checkpoint de KITTI tracking permite estudiar cómo se mantiene la identidad de vehículos y peatones cuando quedan ocluidos por otros objetos de la escena.
- Robótica y manipulación: el encoder puede emplearse para obtener slots de objetos en escenas de mesa y alimentar un módulo de dinámica que prediga el estado de piezas ocultas tras un obstáculo.
- Análisis de vídeo con cámara en movimiento: los checkpoints de LA-CATER moving permiten evaluar la robustez de las representaciones cuando el fondo cambia y la oclusión es dinámica.
- Estudio de dinámica sobre slots: los modelos `ocvp_act` y `dynloc` de MOVi-C sirven para comparar si un flujo de posición mejora la predicción de trayectorias frente a un flujo solo de acción.
- Docencia y formación: el conjunto de configuraciones y checkpoints permite montar prácticas sobre slot attention y permanencia del objeto con resultados ya validados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas y figuras del artículo iSEE, pero no incluye cifras numéricas de métricas como mIoU, ARI, mBO o precisión de seguimiento.

## Requisitos de hardware

- VRAM estimada: los encoders ocupan entre 36,5 MB y 139,7 MB en disco; en inferencia con lotes pequeños caben holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no se especifican; por tamaño, una RTX 3060, RTX 4090, A100 o H100 son más que suficientes para un solo checkpoint. La carga real vendrá del pipeline de vídeo y del tamaño de lote.
- Cabe en GPU consumer: sí, cualquier modelo con al menos 4 GB de VRAM para un checkpoint individual.
- Opciones de despliegue: el repositorio apunta a código propio en `insait-institute/iSEE`; los pesos son PyTorch (`.ckpt`, `.pt`), por lo que se cargan con PyTorch estándar. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iSEE | Encoders de 36,5 a 139,7 MB; walkers de 0,4 a 44,1 MB | no aplica (vídeo) | Permanencia del objeto con slot attention | MIT | Hugging Face + GitHub |
| SlotContrast | Checkpoints de 36,8 a 125,7 MB | no aplica (vídeo) | Baseline de representaciones centradas en objetos | no disponible en esta ficha | Incluido en el repo iSEE |
| RandSF.Q | 139,7 MB | no aplica (vídeo) | Baseline centrado en objetos | no disponible en esta ficha | Reentrenado y publicado en el repo iSEE |
| Loci-Looped | 33,5 a 44,1 MB | no aplica (vídeo) | Baseline centrado en objetos | no disponible en esta ficha | Reentrenado y publicado en el repo iSEE |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no admite instrucciones en lenguaje natural.
- El repositorio es un paquete de checkpoints para reproducir un artículo, no un modelo listo para producción con API estable.
- Los sesgos de los datasets de entrenamiento (LA-CATER, KITTI, MOVi-C) se trasladan al modelo; no se documenta un análisis de sesgo en la información disponible.
- Riesgo de fallo en escenas con muchos objetos, oclusiones prolongadas o cambios bruscos de cámara; no se cuantifica en la model card.
- Las ablaciones muestran que el rendimiento depende de decisiones de diseño concretas (pérdida de apariencia, alcance del contraste slot-slot, uso de DINOv2), por lo que sustituir componentes puede degradar los resultados.
- La licencia MIT permite uso comercial, pero los pesos derivados de DINOv2 pueden estar sujetos además a la licencia del modelo base; conviene verificarlo antes de desplegar.
- No hay garantías de mantenimiento, versionado semántico ni soporte del autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción nula fuera del contexto del artículo.

## Enlaces

- Hugging Face: https://huggingface.co/Pramish/isee
- Repositorio de código, configuraciones y pesos convertidos: https://github.com/insait-institute/iSEE
- Artículo iSEE: no disponible en la información proporcionada
- Demos: no disponibles en la información proporcionada
