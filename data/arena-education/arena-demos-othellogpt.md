# arena-education/arena-demos-othellogpt

## Resumen

`arena-education/arena-demos-othellogpt` no es un modelo de lenguaje, sino un repositorio de Sparse Autoencoders (SAE) entrenados sobre las activaciones internas de un modelo GPT entrenado con el corpus de Othello, en el contexto del programa educativo ARENA (Alignment Research Engineer Accelerator). El repositorio contiene un unico SAE identificado como `blocks.5.mlp.hook_post-v1`, que actua sobre la salida de la capa MLP del bloque 5 del transformer subyacente, y esta empaquetado en el formato de la libreria `saelens` para su carga directa mediante `SAE.from_pretrained`.

El proposito de estos artefactos es la interpretabilidad mecanicista: descomponer las activaciones polisemanticas de una red en caracteristicas monosenmanticas y potencialmente interpretables. Al tratarse de un modelo de juguete entrenado sobre partidas de Othello, el interes no reside en capacidades generativas de produccion, sino en servir como material didactico reproducible para estudiar circuitos, caracteristicas y fenomenos de representacion lineal dentro de un transformer pequeno y controlable.

Es relevante ahora porque los SAE se han consolidado como una de las tecnicas de referencia para auditar modelos, y este repositorio ofrece un ejemplo minimo, ejecutable en CPU, del flujo completo de entrenamiento y analisis de SAE sobre un modelo de dominio cerrado. No obstante, la informacion publica es muy escasa: no se declara licencia, idiomas, pipeline ni metricas de evaluacion, y el repositorio no incluye pesos del modelo base, solo los del SAE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse Autoencoder (SAE) sobre activaciones de un transformer GPT entrenado con Othello; capa objetivo `blocks.5.mlp.hook_post` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base, no incluido en el repo) |
| Tipos de cuantizacion | no disponible (pesos del SAE en formato nativo de `saelens`) |
| Idiomas soportados | no disponible (el modelo subyacente opera sobre secuencias de jugadas de Othello, no sobre lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | formato de `saelens` (carga via `SAE.from_pretrained`); tamano del repo 0,3 GB |

## Arquitectura y entrenamiento

El artefacto es un SAE de una unica capa que aproxima las activaciones del hook `blocks.5.mlp.hook_post` mediante una representacion dispersa de mayor dimensionalidad. La libreria `saelens` estandariza este tipo de SAE con una funcion de reconstruccion con penalizacion de dispersidad (tipicamente L1 o variantes como top-k o JumpReLU), y expone la tupla `(sae, cfg_dict, sparsity)` al cargar el checkpoint. El identificador `-v1` sugiere una primera version del SAE para ese hook, aunque la model card no detalla hiperparametros como el factor de expansion, el coeficiente de dispersidad ni el numero de caracteristicas aprendidas.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base se entreno con RLHF, DPO o aprendizaje supervisado puro. Dado el contexto (demostraciones del programa ARENA), lo mas probable es que el modelo subyacente sea un GPT pequeno entrenado desde cero sobre secuencias de partidas de Othello para tareas de prediccion de la siguiente jugada, pero esto no se confirma en la model card. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Extraccion de caracteristicas interpretables: el SAE descompone activaciones del bloque 5 en caracteristicas dispersas que pueden analizarse individualmente.
- Analisis de representaciones lineales: permite estudiar si conceptos del dominio (posicion de fichas, turno, legalidad de jugadas) se codifican de forma lineal en el modelo.
- Soporte de tool calling / function calling: no aplica; no es un modelo generativo de proposito general.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica; el dominio es Othello, no lenguaje natural.
- Capacidad especial: integracion nativa con el ecosistema `saelens` para entrenamiento, evaluacion y visualizacion de SAE.

## Casos de uso

- Docencia en interpretabilidad mecanicista: usar el SAE como ejemplo minimo en cursos o talleres (como ARENA) para que los alumnos carguen un SAE real, inspeccionen caracteristicas y comparen activaciones entre partidas.
- Investigacion de circuitos en transformers pequenos: analizar que caracteristicas del bloque 5 se activan en funcion de la posicion del tablero o del turno, y trazar conexiones con cabezas de atencion y MLP.
- Validacion de metodologias de SAE: servir como banco de pruebas reproducible para comparar variantes de penalizacion de dispersidad, factores de expansion o funciones de activacion sobre un mismo hook.
- Estudio de polisemanticidad y superposicion: medir cuantas caracteristicas se activan por token y hasta que punto la representacion dispersa reduce la interferencia entre conceptos.
- Desarrollo de herramientas de visualizacion: integrar el SAE en dashboards que muestren activaciones por caracteristica a lo largo de una partida, util para comunicar resultados de interpretabilidad.
- Reproducibilidad de experimentos educativos: al ser un repo ligero (0,3 GB) y cargable en CPU, permite que estudiantes sin GPU reproduzcan el flujo completo de analisis de un SAE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de reconstruccion (MSE, L0, varianza explicada), curvas de dispersidad ni comparaciones con otros SAE sobre el mismo hook.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repo pesa 0,3 GB, por lo que el SAE cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU dedicada para cargar el SAE; para el modelo base (no incluido) seria necesario consultar su propia ficha.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1-2 GB de memoria libre, y en CPU.
- Opciones de despliegue: `saelens` (carga via `SAE.from_pretrained`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un SAE.
- Latencia y throughput: no disponibles; dependen del modelo base sobre el que se ejecute el hook.

## Comparativa con modelos similares

| Modelo | Tipo | Capa objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|
| arena-education/arena-demos-othellogpt | SAE sobre GPT-Othello | `blocks.5.mlp.hook_post` | no disponible | Hugging Face (0 descargas) |
| SAE de GPT-2 small (p. ej. `gpt2-small-res-jb`) | SAE sobre GPT-2 small | residual stream, multiples capas | MIT (segun repo) | Hugging Face |
| SAE de Gemma-2-2b (Gemma Scope) | SAE sobre Gemma-2-2b | multiples capas y subcapas | Gemma Terms of Use | Hugging Face |

La comparacion es limitada: los SAE de GPT-2 y Gemma Scope operan sobre modelos de lenguaje de proposito general y estan ampliamente documentados, mientras que este repositorio es un artefacto educativo sobre un dominio cerrado (Othello) y sin metricas publicadas. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni respuestas; no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Ausencia de licencia declarada: no se puede asumir permiso para uso comercial ni redistribucion; conviene contactar con el autor antes de reutilizarlo.
- Dependencia del modelo base: el SAE solo es util acompaando del GPT-Othello sobre el que se entreno, que no se incluye en el repositorio.
- Sin metricas de calidad: no se publican valores de reconstruccion, L0 ni varianza explicada, por lo que no es posible evaluar la fidelidad del SAE sin reproducir el analisis.
- Sesgos: no aplica en el sentido habitual (no procesa lenguaje natural), pero las caracteristicas aprendidas reflejan unicamente la distribucion de partidas de Othello del dataset de entrenamiento.
- Riesgo de alucinacion: no aplica al SAE; el modelo base podria producir jugadas ilegales si no se enmascara la salida, pero no se documenta.
- Documentacion minima: la model card no detalla hiperparametros, dataset ni proceso de entrenamiento, lo que dificulta la reproducibilidad.
- Fecha de creacion futura (2026-11-09) y cero descargas: repositorio practicamente sin validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/arena-education/arena-demos-othellogpt
- Libreria SAELens: https://github.com/decoderesearch/SAELens
- Documentacion de SAELens: https://decoderesearch.github.io/SAELens/
- Programa ARENA (Alignment Research Engineer Accelerator): https://arena-chapter0-fundamentals.streamlit.app/
- Repositorio de ARENA en GitHub: https://github.com/callummcdougall/ARENA_3.0
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a entidades no relacionadas (portales academicos y recintos deportivos).
