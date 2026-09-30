# ChatterjeeLab/pCoMole

## Resumen

pCoMole (Pareto-Constrained Molecule editing) es un paquete de codigo y pesos publicado por ChatterjeeLab en HuggingFace que implementa edicion multiobjetivo de moleculas mediante Edit Flows, es decir, modelos de flujo (flow matching) definidos sobre espacios discretos de tokens. No es un modelo de lenguaje: opera sobre representaciones SELFIES y SMILES de peptidomimetos y moleculas pequenas, y sobre secuencias de aminoacidos en el caso de la proteina fluorescente verde (GFP). El sistema dirige un Edit Flow preentrenado hacia objetivos especificados por el usuario imponiendo restricciones terminales duras, de ahi el termino "Pareto-constrained" en el nombre del paper.

El repositorio se presenta como un paquete minimo "clone-and-run" con dos funciones: (1) entrenar, evaluar y muestrear Edit Flows y (2) ejecutar la edicion multiobjetivo pCoMole sobre GFP y peptidomimetos. Incluye checkpoints ya entrenados (`gfp/ckpt/last_2.ckpt`, `peptidomimetics/ckpt/SELFIES_EditFlows.ckpt`), oraculos de propiedades externos y scripts de linea de comandos para entrenamiento (`train.py`), evaluacion de val-loss (`evaluate.py`), generacion (`generate.py`) y edicion (`pcomole.py`). El paper asociado se titula "pCoMol: Pareto-Constrained Molecule Editing with Discrete Flows".

La relevancia del proyecto esta en el problema que ataca: optimizar simultaneamente propiedades en conflicto (brillo frente a estabilidad en GFP, afinidad frente a toxicidad en peptidomimetos) es un cuello de botella habitual en descubrimiento de farmacos y diseno de proteinas. pCoMole ofrece una implementacion reproducible que combina un modelo generativo discreto con oraculos de propiedades y pesos de objetivo configurables. En el momento de la consulta el repositorio registra 0 descargas y 0 likes, no declara licencia, no declara idiomas y no incluye datos de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Edit Flows: flow matching sobre espacio discreto de tokens (modulos `model/`, `logic/`, `flow_matching/`); no es un transformer de lenguaje |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la entrada es una secuencia de tokens SELFIES/SMILES o de aminoacidos, no una ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural; no se declaran idiomas en la model card) |
| Licencia | no disponible |
| Formato de pesos | checkpoints de PyTorch: `.ckpt` (estilo PyTorch Lightning) y `.pt` |
| ID en HuggingFace | ChatterjeeLab/pCoMole |
| Autor | ChatterjeeLab |
| Pipeline declarado | no disponible |
| Tag | region:us |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-29 / 2026-09-29 |
| Tamano del repositorio | 0.0 GB (segun la ficha de HuggingFace) |
| Tokenizadores | `smiles_tokenizer/`: tokenizador SMILES SPE y vocabulario SELFIES |
| Datos de entrenamiento incluidos | `data/selfies/28k_mimetics/` (split de entrenamiento SELFIES de peptidomimetos) |
| Checkpoints incluidos | `gfp/ckpt/last_2.ckpt`, `gfp/classifier_ckpt/best.pt`, `peptidomimetics/ckpt/SELFIES_EditFlows.ckpt`, `peptidomimetics/ckpt/SMILES_BindEvaluator.ckpt` |
| Modelos externos descargados | `facebook/esm2_t33_650M_UR50D` (650 M parametros), `aaronfeller/PeptideCLM-23M-all` (23 M parametros), ChemBERTa |
| Oracuz externos requeridos | PeptiVerse, Admetica, DeepDTAGen (rama peptidomimetos); FPredX + MAFFT (rama GFP) |
| Paper | "pCoMol: Pareto-Constrained Molecule Editing with Discrete Flows" (URL no disponible) |

## Arquitectura y entrenamiento

La implementacion se organiza en tres modulos propios (`model/`, `logic/` y `flow_matching/`) mas el tokenizador (`smiles_tokenizer/`). Los Edit Flows son modelos generativos de flujo aplicados a secuencias discretas de longitud variable: en lugar de predecir el siguiente token de forma autorregresiva, aprenden un campo de velocidad o de tasas que transforma una secuencia origen en una secuencia destino mediante operaciones de edicion sobre los tokens (sustitucion, insercion y borrado). La representacion de entrada puede ser SMILES, SELFIES o secuencias de aminoacidos, segun la configuracion (`configs/config_selfies.yaml` y `configs/config_gfp.yaml`).

El entrenamiento se realiza con `train.py` a partir de un fichero YAML de configuracion, con soporte opcional de pesaje de experimentos en Weights & Biases (`--wandb`). Para peptidomimetos se distribuye el split `data/selfies/28k_mimetics`, de unas 28 000 moleculas en SELFIES. Para GFP se distribuye un checkpoint ya entrenado (`gfp/ckpt/last_2.ckpt`), pero las "training arrows" originales no se incluyen: para reentrenar hay que aportar un dataset de HuggingFace cargado con `load_from_disk` en `data/gfp/{train,validation}` o modificar `configs/config_gfp.yaml`. El numero de tokens de entrenamiento, la composicion exacta del dataset y si hubo etapas de RLHF, DPO o similares no estan documentados en la informacion disponible; en este dominio esas tecnicas no serian el mecanismo habitual, ya que la adaptacion se hace mediante los objetivos y las restricciones del editor pCoMole.

La innovacion central es el propio editor pCoMole. En la rama GFP (`gfp/pcomole.py`) se optimizan simultaneamente longitud, excitacion y brillo, con un clasificador GFP y una restriccion de emision; la CLI expone `--num_steps 10`, `--num_candidates 50`, `--num_rollouts 10` y `--objective_weights 3 1 1`, lo que sugiere un bucle de generacion de candidatos, puntuacion con oraculos y busqueda/seleccion bajo restricciones terminales duras. En la rama de peptidomimetos (`peptidomimetics/pcomole.py`) se manejan hasta siete puntuaciones cuando se activa `--specificity`: no toxicidad, solubilidad, permeabilidad, vida media, afinidad, motivo y especificidad, combinando los oraculos PeptiVerse para el lado peptidico con Admetica y DeepDTAGen para el lado de molecula pequena (`objectives.py`). Para GFP, los oraculos de excitacion, brillo y emision pasan por FPredX y requieren MAFFT disponible en el `PATH`.

## Capacidades

- Edicion y generacion de peptidomimetos y moleculas pequenas en representacion SELFIES y SMILES.
- Edicion y generacion de secuencias de proteinas, con GFP como caso de uso implementado y checkpoint entrenado incluido.
- Entrenamiento de Edit Flows propios desde cero o ajuste sobre datos propios mediante `train.py` y ficheros de configuracion.
- Evaluacion de checkpoints sobre el split de validacion (val-loss) con `evaluate.py`.
- Generacion no condicionada o con semilla, controlada por `--input`, `--num_samples` y `--num_steps`.
- Edicion multiobjetivo con pesos configurables por el usuario (`--objective_weights`).
- Seleccion por subconjunto de objetivos en GFP mediante el nombre del fichero de salida (`length_excitation_brightness`, `length_brightness`, `length_excitation`, `length`).
- Puntuacion de propiedades de peptidomimetos en siete ejes: no toxicidad, solubilidad, permeabilidad, vida media, afinidad, motivo y especificidad.
- Puntuacion de propiedades de GFP: longitud, excitacion, brillo, clase GFP (clasificador dedicado) y emision.
- Integracion de oraculos externos: PeptiVerse, Admetica, DeepDTAGen, FPredX.
- Exportacion de resultados a CSV para su uso en pipelines posteriores.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en lenguaje natural, vision, audio ni generacion de texto. La capacidad multilingue no aplica.

## Casos de uso

- Optimizacion de proteinas fluorescentes: la rama GFP permite partir de una secuencia dada y buscar variantes que aumenten excitacion y brillo (pesos 3 1 1) sin salir de la clase GFP ni degradar la emision, gracias al clasificador y a la restriccion de emision. Es util para disenar variantes de GFP con propiedades fotofisicas mejoradas antes de sintetizarlas en laboratorio.
- Diseno de peptidomimetos con perfil ADMET equilibrado: con los siete objetivos activados, el editor busca candidatos que sean simultaneamente no toxicos, solubles, permeables, con vida media aceptable y afinidad alta, penalizando los que incumplen los criterios duros.
- Priorizacion de candidatos para cribado virtual: la salida en CSV (`--output_csv`, `--output_file`) se puede consumir en un pipeline de docking o de simulacion molecular, usando pCoMole como generador de propuestas y los oraculos como primer filtro.
- Generacion de librerias de moleculas con sesgo quimico controlado: a partir del split de 28 000 peptidomimetos en SELFIES, se pueden generar lotes de moleculas cercanas al espacio quimico de interes en lugar de muestrear espacios no restringidos.
- Entrenamiento de Edit Flows sobre quimiotecas internas: `train.py` con un YAML propio y el tokenizador SMILES SPE/SELFIES permiten ajustar el flujo a una familia quimica corporativa que no este representada en los datos publicos.
- Evaluacion de checkpoints en CI de experimentacion: `evaluate.py` calcula la val-loss de un checkpoint concreto contra el split de validacion, lo que permite comparar configuraciones de forma automatica antes de lanzar campanas de edicion costosas.
- Reproduccion de los resultados del paper: los checkpoints incluidos y los scripts `bash gfp/scripts/pcomole.sh` y `bash peptidomimetics/scripts/train.sh` permiten reproducir el flujo completo sobre los ejemplos de la model card.
- Prototipado de esquemas de edicion multiobjetivo: la API de linea de comandos (pesos por objetivo, numero de candidatos y de rollouts) sirve para estudiar empiricamente el compromiso entre exploracion y coste computacional antes de trasladarlo a otros dominios discretos, como secuencias de DNA o RNA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio incluye la herramienta para calcular la val-loss de un checkpoint (`evaluate.py --config ... --ckpt ...`), pero la model card no reporta cifras concretas de val-loss, ni de exito de edicion, ni comparaciones cuantitativas con otros metodos. Tampoco se han encontrado resultados de benchmarks en la busqueda web realizada, que no devolvio material tecnico relevante sobre este modelo.

## Requisitos de hardware

- La model card indica explicitamente que se recomienda encarecidamente una GPU CUDA. No se especifica VRAM minima ni GPU recomendada.
- No hay cifras oficiales de VRAM. Como referencia de los componentes descargados en el primer uso: ESM-2 de 650 M parametros ocupa aproximadamente 2,6 GB en fp32 y unos 1,3 GB en fp16; PeptideCLM-23M ronda los 90 MB en fp32; ChemBERTa es un modelo tipo base de decenas de millones de parametros. Estas cifras son estimaciones a partir del tamano declarado de esos modelos externos, no datos publicados por el autor.
- El tamano de los checkpoints de los Edit Flows y de los oraculos Admetica y DeepDTAGen no se indica, por lo que la VRAM total necesaria no se puede estimar con fiabilidad. Un presupuesto de 12 GB o superior en GPU de consumo (RTX 3060 de 12 GB, RTX 4070, RTX 4080, RTX 4090) es plausible para la ruta de peptidomimetos, pero debe considerarse una estimacion no confirmada.
- MAFFT es una herramienta de alineamiento multiple que se ejecuta en CPU y es obligatoria para la rama GFP: hay que instalarla (por ejemplo `conda install -c bioconda mafft`) o apuntar `MAFFT_PATH` a un binario local, y su coste de ejecucion afecta al tiempo total de edicion de GFP.
- Opciones de despliegue: no es un modelo servible con vLLM, llama.cpp, Ollama ni TGI. El despliegue previsto es un entorno Python con `venv` y `pip install -r requirements.txt`, invocando `train.py`, `evaluate.py`, `gfp/generate.py`, `gfp/pcomole.py`, `peptidomimetics/generate.py` o `peptidomimetics/pcomole.py`.
- Latencia y throughput: no disponible. El coste por ejecucion depende de `--num_steps` (10 pasos en los ejemplos de GFP, 30 en el de peptidomimetos), `--num_candidates` (50 en el ejemplo de GFP) y `--num_rollouts` (10 en el ejemplo de GFP), ademas del coste de los oraculos externos.
- Dependencias de disco y red: el repositorio declara 0,0 GB, pero en el primer uso descarga pesos de HuggingFace (ESM-2 650M, PeptideCLM-23M, ChemBERTa) y, para peptidomimetos, hay que clonar e instalar PeptiVerse aparte y descargar sus pesos siguiendo su propio README.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de rendimiento ni una lista de alternativas comparables, y la busqueda web no devolvio referencias tecnicas utilizables, por lo que no es posible establecer una comparacion cuantitativa fiable con otros metodos de edicion molecular o de generacion condicionada.

A modo de comparacion interna del propio repositorio, las dos rutas incluidas difieren en estos aspectos:

| Aspecto | Rama GFP | Rama peptidomimetos |
|---|---|---|
| Representacion | Secuencia de aminoacidos | SELFIES y SMILES |
| Checkpoint incluido | `gfp/ckpt/last_2.ckpt` y `gfp/classifier_ckpt/best.pt` | `peptidomimetics/ckpt/SELFIES_EditFlows.ckpt` y `peptidomimetics/ckpt/SMILES_BindEvaluator.ckpt` |
| Datos de entrenamiento incluidos | No (solo el checkpoint) | Si (`data/selfies/28k_mimetics`) |
| Numero de objetivos | 3 principales (longitud, excitacion, brillo) mas clasificador GFP y emision | Hasta 7 con `--specificity` |
| Oraculos | FPredX (excitacion, brillo, emision) + clasificador GFP | PeptiVerse + Admetica + DeepDTAGen |
| Dependencia externa critica | MAFFT en el `PATH` | PeptiVerse clonado o `PEPTIVERSE_ROOT` definido |
| Valores por defecto en los ejemplos | `--num_steps 10`, `--num_candidates 50`, `--num_rollouts 10` | `--num_steps 30`, `--num_samples 2` |

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible. Sin una licencia explicita, el uso comercial y la redistribucion de los pesos quedan en un limbo legal: conviene contactar con el autor antes de integrar el modelo en un producto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion externa, replicaciones independientes ni reporte de incidencias por parte de terceros.
- El paper se cita por titulo pero sin enlace ni identificador (arXiv, DOI), por lo que no se puede verificar la revision por pares ni consultar la metodologia completa.
- La fecha de creacion y actualizacion registrada en HuggingFace es 2026-09-29, posterior a la fecha habitual de consulta; conviene verificar la ficha antes de citarla como referencia estable.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural, tool calling, agentes ni razonamiento multi-paso textual. Cualquier expectativa de ese tipo es un error de categoria.
- Dependencia fuerte de oraculos externos con licencias y pesos propios. PeptiVerse requiere clonar el repositorio, instalar dependencias y descargar pesos manualmente siguiendo su README; Admetica, DeepDTAGen, FPredX y ChemBERTa anaden sus propias condiciones de uso.
- La rama GFP no incluye los datos de entrenamiento originales, solo el checkpoint. Reentrenar GFP exige aportar un dataset propio en `data/gfp/{train,validation}` con el formato de `load_from_disk` o modificar la configuracion.
- La calidad de la edicion depende por completo de la fidelidad de los oraculos. Un oraculo mal calibrado puede producir candidatos que puntuen bien en el modelo y mal en el ensayo real, un riesgo clasico de optimizacion contra un sustituto (reward hacking) que no esta cuantificado en la informacion disponible.
- Sesgo de espacio quimico: la rama de peptidomimetos se apoya en un split de aproximadamente 28 000 moleculas SELFIES, por lo que las propuestas tienden a concentrarse en ese entorno quimico y pueden ser pobres fuera de el.
- Riesgo de alucinacion en el sentido de generar moleculas o secuencias sintacticamente validas pero quimicamente inviables o no sintetizables: el paquete no documenta un filtro de sintetizabilidad ni de validez quimica mas alla de la representacion SELFIES.
- No hay informacion sobre limites de longitud de secuencia manejables, ni sobre comportamiento fuera de distribucion, ni sobre tiempos de inferencia por lote.
- Requisito de infraestructura no trivial para la rama GFP: MAFFT debe estar accesible y los alineamientos multiples son costosos en CPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ChatterjeeLab/pCoMole
- PeptiVerse (dependencia de la rama peptidomimetos): https://huggingface.co/ChatterjeeLab/PeptiVerse
- MAFFT (dependencia de la rama GFP): https://mafft.cbrc.jp/alignment/software/
- ESM-2 650M (descargado en el primer uso): https://huggingface.co/facebook/esm2_t33_650M_UR50D
- PeptideCLM-23M (descargado en el primer uso): https://huggingface.co/aaronfeller/PeptideCLM-23M-all
- ChemBERTa: mencionado en la model card, sin URL especifica disponible
- FPredX: mencionado en la model card, sin URL especifica disponible
- Paper "pCoMol: Pareto-Constrained Molecule Editing with Discrete Flows": citado por titulo, sin URL ni identificador disponible
- Nota sobre la busqueda web: no devolvio resultados tecnicos relevantes sobre pCoMole, por lo que no se han podido incorporar enlaces adicionales a papers, blogs, repos o demos.
