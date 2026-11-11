# joey6584/HotPot

## Resumen

HotPOT es una coleccion de checkpoints de pesos publicada por el usuario joey6584 en Hugging Face bajo licencia Apache 2.0. No se trata de un modelo de lenguaje generativo, sino de un conjunto de modelos de operadores neuronales (neural operators) orientados a la resolucion de ecuaciones en derivadas parciales (PDEs), en la linea de arquitecturas como FNO (Fourier Neural Operator) y PDB (Physics-Informed DeepONet o variantes similares). Los checkpoints corresponden a los 24 puntos de la Tabla 1 de un articulo anonimo sometido a revision, e incluyen dos modelos preentrenados (etapa E1000) y doce modelos afinados (etapa E200), cada uno en dos escalas: 17M y 90M parametros.

El repositorio ocupa 17,3 GB y contiene unicamente los tensores del modelo en formato `.pt` (PyTorch), sin tokenizador, sin configuracion de Hugging Face Transformers y sin pipeline declarado. La carga se realiza mediante la funcion `hotpot.load_checkpoint` del repositorio de codigo anonimo asociado, lo que implica que estos pesos no son directamente utilizables con herramientas estandar como `transformers`, `vLLM` o `llama.cpp`.

La relevancia de esta publicacion es acotada y experimental: sirve como material de replicacion para los resultados del articulo, no como un modelo listo para produccion. El autor no proporciona informacion sobre idiomas, contexto, cuantizacion ni benchmarks en la model card, por lo que la mayor parte de las especificaciones habituales de una ficha de modelo de lenguaje no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Operador neuronal para PDEs (variantes FNO y PDB, segun nombres de checkpoint); no es un transformer de lenguaje |
| Parametros totales | 17M (escala T) y 90M (escala S) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto textual) |
| Tipos de cuantizacion | No disponible; pesos en punto flotante PyTorch (`.pt`) |
| Idiomas soportados | No disponible (modelo numerico, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch state dict), cargable con `hotpot.load_checkpoint` |

## Arquitectura y entrenamiento

Los nombres de los ficheros revelan la arquitectura y el regimen de entrenamiento. Las variantes `fno` corresponden a Fourier Neural Operators, mientras que las variantes `pdb` apuntan a una arquitectura de tipo Physics-Informed DeepONet o similar, con hiperparametros explicitos en el nombre (`M1e-1_eta1e-2_zeta1e-2`). Los sufijos `ns2d`, `swe`, `dr` y `cfdbench` identifican los conjuntos de datos o problemas PDE: Navier-Stokes 2D, shallow water equations, diffusion-reaction y un benchmark de CFD, respectivamente.

El entrenamiento se organiza en dos etapas: un preentrenamiento de 1000 epocas (E1000) que produce los checkpoints `HotPOT-T_pretrain_E1000.pt` y `HotPOT-S_pretrain_E1000.pt`, y un afinamiento de 200 epocas (E200) para cada tarea y configuracion de hiperparametros. Los tamanos de fichero (391,8 MB para 17M parametros y 2.074,2 MB para 90M) indican pesos en `float32` con overhead minimo, coherente con un state dict de PyTorch. No se especifica en la model card el numero de tokens, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO, algo esperable dado que no es un modelo de lenguaje.

## Capacidades

- Resolucion numerica de ecuaciones en derivadas parciales: los checkpoints estan disenados para aproximar soluciones de PDEs concretas (Navier-Stokes 2D, shallow water, diffusion-reaction, CFD benchmark).
- Preentrenamiento y afinamiento por tarea: los modelos E1000 sirven como base y los E200 como especializaciones por dataset.
- Dos escalas de capacidad: 17M y 90M parametros, lo que permite estudiar el efecto del escalado en el error de aproximacion.
- Reproducibilidad de la Tabla 1 del articulo: `checkpoints.json` mapea cada entrada a su fichero, filas de test, longitud de rollout, error esperado y comando de evaluacion.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, vision, audio ni capacidades multilingues; no es un modelo de lenguaje.

## Casos de uso

- Replicacion de resultados academicos: cargar cada checkpoint con `hotpot.load_checkpoint` y ejecutar el comando de evaluacion indicado en `checkpoints.json` para verificar los errores reportados en la Tabla 1 del articulo.
- Estudio comparativo de arquitecturas de operadores neuronales: comparar las variantes FNO y PDB sobre los mismos problemas PDE para analizar el impacto de la eleccion arquitectonica en el error de rollout.
- Analisis de sensibilidad a hiperparametros: los checkpoints `ns2d_fno_1e-5` y `ns2d_fno_1e-3` permiten estudiar el efecto de la tasa de aprendizaje o del parametro de regularizacion en el rendimiento final.
- Benchmarking de metodos de simulacion: usar los modelos afinados en `cfdbench` como referencia neuronal frente a solvers numericos clasicos en tareas de CFD.
- Investigacion en transferencia entre tareas PDE: partir del modelo preentrenado E1000 y evaluar su capacidad de generalizacion frente a los modelos afinados E200 en cada dataset.
- Docencia y formacion: servir como ejemplo reproducible de pipeline de entrenamiento y evaluacion de neural operators en cursos de aprendizaje profundo para fisica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la Tabla 1 del articulo anonimo y a `docs/CHECKPOINTS.md` del repositorio de codigo para los errores esperados, pero no reproduce las cifras en el README.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB para el modelo de 17M en `float32` (391,8 MB de pesos mas activaciones y overhead de framework); aproximadamente 8,3 GB para el modelo de 90M en `float32` (2.074,2 MB de pesos mas overhead).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB o superior) es suficiente para ambas escalas; para el modelo de 90M con batches grandes o rollouts largos se recomienda RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, ambas escalas caben en GPUs consumer con 8 GB o mas de VRAM.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje; el despliegue se realiza mediante el paquete `hotpot` del repositorio de codigo anonimo sobre PyTorch.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HotPOT (este) | 17M / 90M | Neural operator (FNO/PDB) para PDEs | No aplica | Apache 2.0 | Pesos en HF, codigo en repositorio anonimo |
| Modelos FNO de referencia | No disponible | Fourier Neural Operator | No aplica | Variable segun implementacion | Multiples repositorios academicos |
| DeepONet de referencia | No disponible | Operator network | No aplica | Variable segun implementacion | Multiples repositorios academicos |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no soporta instrucciones en lenguaje natural.
- Los pesos solo son cargables con el paquete `hotpot` del repositorio de codigo anonimo; no hay integracion con `transformers` ni con ecosistemas estandar de inferencia.
- La model card no documenta sesgos, riesgos de alucinacion ni limitaciones de generalizacion fuera de los dominios PDE entrenados.
- El alcance esta restringido a los problemas PDE concretos del articulo (ns2d, swe, dr, cfdbench); no se garantiza transferencia a otras ecuaciones.
- El repositorio se presenta como envio anonimo para revision, lo que implica que el codigo y los resultados pueden cambiar y que no hay soporte ni mantenimiento garantizado.
- La licencia Apache 2.0 permite uso comercial de los pesos, pero la ausencia de documentacion sobre el dataset de entrenamiento impide verificar restricciones adicionales sobre los datos subyacentes.
- El repositorio ocupa 17,3 GB, lo que requiere espacio en disco considerable para descargar los 24 checkpoints completos.

## Enlaces

- Hugging Face: https://huggingface.co/joey6584/HotPot
- Repositorio de codigo anonimo: https://anonymous.4open.science/r/HotPOT-BA73/
- Tabla de checkpoints en el codigo: `docs/CHECKPOINTS.md` del repositorio anterior
- Mapeo de entradas a ficheros: `checkpoints.json` del repositorio anterior
