# huangxuan111/MSU-Fold

## Resumen

MSU-Fold es un conjunto de checkpoints para políticas robóticas de plegado de ropa, presentado por el autor huangxuan111 bajo el título "MSU-Fold: Unified Multi-scale Heatmap Decoding and Language-grounded Skill Decomposition for Multi-step Robotic Cloth Folding". No se trata de un modelo de lenguaje ni de un modelo multimodal generativo, sino de una política de imitación condicionada por lenguaje que predice mapas de calor de tipo pick/place para controlar uno o dos brazos robóticos en tareas de manipulación deformable.

El repositorio de HuggingFace (3,1 GB) contiene dos checkpoints en formato PyTorch: `unimanual_1000demos_last.pth`, entrenado sobre el benchmark SoftGym de un solo brazo (CornerFold, TriangleFold, StraightFold, TshirtFold, TrousersFold) con 1000 demostraciones por tarea y 30 épocas, y `bimanual_1000demos_best.pth`, entrenado sobre un benchmark bimanual de pasos mixtos (SquareHalfFold, SquareCornerFold, TshirtFold, TrousersFold) con 150 demostraciones por tarea y 40 épocas. Ambos comparten arquitectura.

Su relevancia es fundamentalmente investigadora: propone una descomposición de habilidades guiada por instrucciones de lenguaje y una cabeza única compartida de heatmaps pick/place que sirve tanto para pasos unimanuales como bimanuales, con el número de picos extraídos determinado por cada paso. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye resultados numéricos de benchmarks en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone SigLIP-Base congelado con LoRA (r=8), adaptador visual multi-escala por token (K=8), red de fusion Transformer y cabeza compartida de heatmaps pick/place |
| Parametros totales | No disponible (backbone SigLIP-Base congelado mas adaptadores LoRA y red de fusion; el numero total no se declara en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (no es un modelo de lenguaje; la condicion de lenguaje se aporta como instruccion de tarea o definicion de skill) |
| Tipos de cuantizacion | No disponible (se distribuyen checkpoints `.pth` de PyTorch; no se documentan versiones cuantizadas) |
| Idiomas soportados | No disponible (la condicion textual se procesa mediante el codificador de texto del backbone SigLIP) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (`unimanual_1000demos_last.pth`, `bimanual_1000demos_best.pth`) |
| Desarrollador | huangxuan111 (repositorio de codigo en la organizacion `hua-369`) |
| Tipo de modelo | Politica de robotica por imitacion, condicionada por lenguaje, para manipulacion deformable |
| Tamano del repositorio | 3,1 GB |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card consta de cuatro componentes: un backbone SigLIP-Base congelado al que se le aplican adaptadores LoRA con rango r=8; un adaptador visual multi-escala a nivel de token con K=8 escalas; una red de fusion basada en Transformer; y una cabeza de heatmaps pick/place unica y compartida. Este ultimo detalle es el nucleo de la propuesta "unified multi-scale heatmap decoding": la misma cabeza se reutiliza para pasos unimanuales y bimanuales, y es el paso de la habilidad el que dicta cuantos picos se extraen del mapa de calor.

El entrenamiento es por imitacion (imitation learning) a partir de demostraciones. Para el checkpoint unimanual se usaron 1000 demostraciones por tarea durante 30 epocas en el benchmark SoftGym de un brazo; para el bimanual, 150 demostraciones por tarea durante 40 epocas en un benchmark de pasos mixtos con dos brazos. No se especifican en la model card el numero total de tokens o frames, la composicion exacta de los datasets, ni si se emplearon etapas de RLHF, DPO u optimizacion por preferencias; en el contexto de robótica por imitacion estos mecanismos no son habituales y no se mencionan. Los datasets asociados se publican por separado en `huangxuan111/MSU-Fold-datasets`. La innovacion destacable es la combinacion de descomposicion de habilidades anclada a lenguaje con decodificacion unificada de heatmaps multi-escala, que evita entrenar cabezas separadas para cada tipo de paso.

## Capacidades

- Prediccion de acciones de pick and place mediante mapas de calor, con extraccion de multiples picos cuando el paso lo requiere.
- Ejecucion de tareas de plegado de ropa en simulacion: CornerFold, TriangleFold, StraightFold, TshirtFold y TrousersFold con un brazo.
- Ejecucion de tareas de plegado de pasos mixtos con dos brazos: SquareHalfFold, SquareCornerFold, TshirtFold y TrousersFold.
- Condicionamiento por lenguaje: la tarea se selecciona mediante definiciones de skill (`skills/*/SKILL.md`) o mediante el parametro `--checkpoint`, lo que permite invocar habilidades concretas desde un flujo de instrucciones.
- Descomposicion de habilidades en multiples pasos, con una cabeza compartida que se adapta al numero de picos requerido por cada paso.
- Reutilizacion de un unico backbone para escenarios unimanuales y bimanuales, lo que facilita compartir representacion visual entre ambos regímenes.
- No se documentan capacidades de tool calling, function calling, agentes basados en texto, vision general, audio ni modos de razonamiento explicito; no es un modelo de proposito general.

## Casos de uso

- Investigacion en manipulacion deformable: sirve como baseline reproducible sobre los benchmarks SoftGym (unimanual) y de pasos mixtos (bimanual), permitiendo comparar variantes de decodificacion de heatmaps bajo las mismas condiciones de evaluacion.
- Aprendizaje por imitacion con pocas demostraciones: el checkpoint bimanual se entreno con solo 150 demostraciones por tarea, lo que lo convierte en un punto de partida util para estudiar regimenes de bajo numero de demos mediante ajuste con LoRA.
- Descomposicion de tareas largas en habilidades: el esquema basado en `SKILL.md` permite mapear una instruccion de alto nivel ("doblar una camiseta") a una secuencia de pasos invocables, util para investigar planificacion jerarquica en robotica.
- Evaluacion de cabezas de accion compartidas: al usar una unica cabeza pick/place para pasos unimanuales y bimanuales, es un banco de pruebas para medir si compartir parametros degrada o mejora la precision frente a cabezas especializadas.
- Generacion de datos y curricula: combinado con los datasets publicados, permite reproducir el entrenamiento y generar variaciones de curricula (numero de demos, numero de epocas) para estudiar escalado de datos.
- Integracion en planificadores con modelos de lenguaje: un planificador externo puede emitir la secuencia de skills y delegar la ejecucion motora en esta politica, escenario tipico en pipelines de robotica guiada por lenguaje.
- Estudio de transferencia simulacion a real: los checkpoints se entrenan y evaluan en simulacion, por lo que son adecuados para experimentos de transferencia, siempre que se asuma el coste de ajuste y las diferencias de dinamica respecto a un robot fisico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enumera los benchmarks empleados (SoftGym unimanual para CornerFold, TriangleFold, StraightFold, TshirtFold y TrousersFold; benchmark bimanual de pasos mixtos para SquareHalfFold, SquareCornerFold, TshirtFold y TrousersFold), pero no incluye tasas de exito ni ninguna otra metrica numerica. La busqueda web realizada no devolvio resultados relacionados con el modelo: los enlaces recuperados corresponden a sitios de loteria sin ninguna vinculacion con MSU-Fold, por lo que no aportan informacion utilizable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, un backbone SigLIP-Base congelado mas adaptadores LoRA y una red de fusion Transformer suele requerir del orden de pocos GB en precision FP16, pero esta cifra es una estimacion general y no un dato declarado por el autor.
- GPU recomendadas: no disponible. No se especifica hardware de entrenamiento ni de inferencia en la model card.
- Compatibilidad con GPU de consumo: no confirmada. Al no declararse requisitos de VRAM, no puede afirmarse que quepa en tarjetas de consumo como una RTX 4090 o inferiores.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni formato GGUF; estos formatos no aplican a una politica de robotica en PyTorch. El procedimiento soportado es el del repositorio: clonar `github.com/hua-369/MSU-Fold`, crear el entorno con `conda env create -f environment.yml`, compilar dependencias con `deps/prepare.sh` y `deps/compile.sh` (compilacion de PyFlex) y ejecutar con `run_skill_softgym.sh`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificados de los modelos comparables en la informacion proporcionada. La tabla siguiente recoge rasgos cualitativos de alternativas habituales en manipulacion robótica por imitacion; las cifras de parametros y contexto de los modelos de la competencia son valores de referencia generales de la literatura y no se han verificado en esta consulta.

| Modelo | Parametros | Contexto / condicionamiento | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MSU-Fold | No disponible | Condicionado por instruccion de skill; sin ventana de contexto textual | Heatmaps pick/place multi-pico | MIT | Checkpoints `.pth` en HuggingFace |
| Diffusion Policy | No disponible | Condicionado por observacion; sin lenguaje en la variante base | Trayectorias de accion por difusion | No disponible | Implementaciones publicas en repositorios de investigacion |
| ACT / Action Chunking Transformer | No disponible | Condicionado por observacion; sin lenguaje en la variante base | Fragmentos de accion (action chunks) | No disponible | Implementaciones publicas en repositorios de investigacion |
| OpenVLA | No disponible | Modelo vision-language-action con instrucciones en lenguaje natural | Acciones discretizadas | No disponible | Pesos publicos en HuggingFace |
| Octo | No disponible | Politica transformer generalista con condicionamiento por objetivo | Acciones continuas | No disponible | Pesos publicos en HuggingFace |

La diferencia principal de MSU-Fold frente a las alternativas de la tabla es su enfasis en una cabeza unica de heatmaps que cubre pasos unimanuales y bimanuales, y en la descomposicion de habilidades guiada por lenguaje, en lugar de la prediccion directa de trayectorias o de acciones continuas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta ningun analisis de sesgos, y en un modelo de robotica el sesgo relevante seria el de las distribuciones de demostraciones, no declarado.
- Riesgo de alucinacion: no aplica en el sentido generativo; el riesgo equivalente es la prediccion de puntos de pick/place invalidos fuera de la distribucion de entrenamiento, que puede producir agarres fallidos o colisiones.
- Limitaciones de contexto o idioma: el condicionamiento se realiza a traves de definiciones de skill y del codificador del backbone; la model card no especifica cobertura multilingue. El modelo no mantiene contexto conversacional y no procesa secuencias de texto largas.
- Alcance funcional muy acotado: las tareas documentadas se limitan a plegado de ropa en los benchmarks enumerados (CornerFold, TriangleFold, StraightFold, TshirtFold, TrousersFold, SquareHalfFold, SquareCornerFold), en simulacion.
- Evaluacion incompleta: no se publican tasas de exito ni comparaciones cuantitativas, lo que impide valorar su rendimiento relativo.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion ni de validacion independiente.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion siempre que se conserve el aviso de copyright y la licencia. No se declaran restricciones adicionales, pero conviene verificar la licencia de las dependencias del repositorio (PyFlex, SoftGym y el backbone SigLIP) antes de un uso comercial.
- Dependencias de compilacion: el flujo de ejecucion requiere compilar PyFlex y preparar el entorno con conda, lo que anade fragilidad en despliegues de produccion.
- Caveat para produccion: es un artefacto de investigacion sin soporte declarado, sin versionado de releases y con un flujo de ejecucion dependiente de scripts concretos del repositorio.
- Aviso sobre la busqueda web: los resultados recuperados no guardan relacion con el modelo y no deben tomarse como fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huangxuan111/MSU-Fold
- Repositorio de codigo: https://github.com/hua-369/MSU-Fold
- Datasets: https://huggingface.co/datasets/huangxuan111/MSU-Fold-datasets
- Paper: no disponible (la model card menciona el titulo del trabajo "MSU-Fold: Unified Multi-scale Heatmap Decoding and Language-grounded Skill Decomposition for Multi-step Robotic Cloth Folding", pero no enlaza ninguna publicacion)
- Demo: no disponible
- Otros enlaces relevantes: no disponible (la busqueda web no devolvio resultados relacionados con el modelo)
