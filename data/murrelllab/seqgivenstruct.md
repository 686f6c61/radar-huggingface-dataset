# MurrellLab/SeqGivenStruct

## Resumen

BindMPNN es un conjunto de dos checkpoints de diseno inverso de proteinas (inverse folding) publicados por MurrellLab (The Murrell Lab, KI) en Hugging Face bajo el identificador `MurrellLab/SeqGivenStruct`. El modelo resuelve el problema de asignar una secuencia de aminoacidos a una estructura proteica de entrada, es decir, dado un esqueleto tridimensional, propone que residuos colocarian ahi, manteniendo fijas las cadenas que el usuario no quiere modificar. Los dos ficheros incluidos, `BindMPNN_v_32_010_25.pt` y `BindMPNN_v_32_020_25.pt`, se diferencian en el nivel de ruido de esqueleto asumido (0,10 A y 0,20 A respectivamente) y comparten 32 vecinos por nodo y un contexto atomico de 25.

Tecnicamente no es un modelo de lenguaje ni un transformer generativo de texto: es una red de paso de mensajes sobre un grafo de estructura proteica que reutiliza la arquitectura y el formato de checkpoint de LigandMPNN, con el que es directamente compatible mediante `--model_type ligand_mpnn`. Esto significa que no se ejecuta con vLLM, llama.cpp u Ollama, sino con el repositorio oficial de LigandMPNN en Python.

Su relevancia practica esta en el diseno de binders y enzimas: permite redisenar una sola cadena de un complejo proteina-objetivo/proteina-binder o de un complejo con ligando, exponiendo opcionalmente las cadenas laterales de los residuos fijos como contexto. El repositorio figura con 0 descargas, 0 likes y un tamano de 0,0 GB, y no declara licencia ni benchmarks, por lo que debe tratarse como un artefacto de investigacion sin validacion publica disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de paso de mensajes sobre grafo de estructura proteica, compatible con la arquitectura LigandMPNN (ProteinMPNN con contexto de ligando y atomos) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable: no es un modelo MoE |
| Longitud de contexto | no disponible como ventana de tokens; el contexto es estructural: 32 vecinos por nodo (`num_edges`) y 25 atomos de contexto (`atom_context_num`) |
| Tipos de cuantizacion | no disponible; los checkpoints se distribuyen como pesos PyTorch en punto flotante (`.pt`) |
| Idiomas soportados | etiqueta `en` en los metadatos de Hugging Face; no aplicable en la practica, el modelo trabaja con secuencias de aminoacidos |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (diccionario con `model_state_dict`, `num_edges`, `atom_context_num` y `noise_level`) |
| Variantes incluidas | `BindMPNN_v_32_010_25.pt` (ruido de esqueleto 0,10 A) y `BindMPNN_v_32_020_25.pt` (ruido 0,20 A) |
| Entorno de ejecucion | LigandMPNN oficial (Python 3.11 en el ejemplo de instalacion) |
| Tamano del repositorio | 0,0 GB segun Hugging Face |
| Repositorio | MurrellLab/SeqGivenStruct |

## Arquitectura y entrenamiento

La model card no describe el entrenamiento: no se indica el numero de tokens, la composicion del dataset, si hubo fases de RLHF/DPO ni el procedimiento de generacion de los datos. Lo unico documentado es la arquitectura de destino: BindMPNN usa la arquitectura de LigandMPNN, que a su vez se instancia sobre ProteinMPNN con `model_type="ligand_mpnn"`. El cargador debe crear el modelo upstream con `k_neighbors=checkpoint["num_edges"]` y `atom_context_num=checkpoint["atom_context_num"]` antes de aplicar `load_state_dict` en modo estricto.

El aspecto diferencial documentado es el nivel de ruido de esqueleto con el que se etiqueta cada checkpoint: 0,10 A y 0,20 A. La model card aclara de forma explicita que ese valor identifica la variante del checkpoint y no es la temperatura de muestreo, y que no hace falta anadir ruido a la estructura de entrada. El resto de controles de inferencia (temperatura, semilla, numero de lotes, cadenas a redisenar, uso de contexto de cadenas laterales) se gestionan mediante los argumentos de LigandMPNN, no mediante pesos adicionales.

## Capacidades

- Diseno inverso de proteinas: genera secuencias de aminoacidos condicionadas a una estructura 3D de entrada.
- Rediseno selectivo de cadenas: `--chains_to_design` define que cadenas son mutables y mantiene fijas las demas, lo que permite redisenar solo el binder de un complejo.
- Contexto de ligando: al ejecutarse con `--model_type ligand_mpnn` puede tener en cuenta ligandos presentes en la estructura, no solo cadenas proteicas.
- Contexto de cadenas laterales: con `--ligand_mpnn_use_side_chain_context 1` expone los atomos de cadena lateral de los residuos fijos; con `0` omite ese contexto.
- Muestreo controlado: `--temperature` ajusta la diversidad de las secuencias generadas, independientemente de la etiqueta de ruido del checkpoint.
- Reproducibilidad: `--seed` fija la aleatoriedad y las secuencias se escriben en el directorio `seqs/` de la carpeta de salida.
- Procesamiento por lotes: parametros `--batch_size` y `--number_of_batches` para generar varias muestras por ejecucion.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio, modo de razonamiento explicito ni generacion de texto libre.

## Casos de uso

- Rediseno de binders en complejos proteina-objetivo/proteina-binder: el flujo documentado redisenando la cadena B de `complex.pdb` permite fijar la diana y generar secuencias alternativas para la cadena binder, util en campanas de afinidad o de optimizacion de interfaces.
- Diseno de secuencias alrededor de un ligando: al usar `--model_type ligand_mpnn`, el modelo incorpora el contexto del ligando, lo que resulta adecuado para redisenar bolsillos de union en enzimas o receptores con un sustrato conocido.
- Optimizacion de residuos superficiales manteniendo el nucleo fijo: con `--chains_to_design` limitado a los residuos de interes y el contexto de cadenas laterales activado, se pueden proponer variantes que conserven la geometria interna.
- Generacion de librerias de secuencias diversas: combinando `--temperature` alto, varias semillas y `--number_of_batches` se obtiene un conjunto de candidatos para cribado experimental posterior.
- Integracion en pipelines de diseno estructural: al ser un checkpoint autonimo compatible con LigandMPNN, se puede encadenar detras de un generador de esqueletos (por ejemplo, flujos de generacion biomolecular del mismo laboratorio) para asignar secuencia a los backbones producidos.
- Rediseno de una subunidad concreta en complejos multimericos: la seleccion explicita de cadenas permite mantener estequiometria y contactos de las cadenas no redisenadas.
- Replicacion de experimentos de diseno inverso: los parametros de semilla y lote permiten reproducir exactamente un conjunto de secuencias generado, util para comparar variantes de ruido 0,10 A frente a 0,20 A sobre la misma estructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de BindMPNN no incluye tablas comparativas, y los resultados de busqueda consultados no aportan metricas de exito de diseno, identidad de secuencia recuperada, ni comparaciones con LigandMPNN o ProteinMPNN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; la model card no publica requisitos.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- CPU: el ejemplo de carga programatica usa `map_location="cpu"`, por lo que la carga del checkpoint en CPU esta soportada por el formato; no se documenta si la inferencia completa en CPU es viable en tiempos razonables.
- Opciones de despliegue: unicamente el repositorio oficial de LigandMPNN (`python run.py` con `--model_type ligand_mpnn`). No aplican vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje ni se distribuye en GGUF.
- Configuracion de ejemplo documentada: `--batch_size 1` y `--number_of_batches 8`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. La unica relacion documentada es de compatibilidad y herencia de arquitectura.

| Aspecto | BindMPNN | LigandMPNN (upstream) | ProteinMPNN (referenciado) |
|---|---|---|---|
| Tipo de tarea | Diseno inverso con contexto de ligando | Diseno inverso con contexto de ligando | Diseno inverso de proteinas |
| Arquitectura | Red de paso de mensajes, formato de checkpoint LigandMPNN | Arquitectura base citada como origen | Arquitectura base sobre la que se instancia LigandMPNN |
| Parametros | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| Contexto | 32 vecinos, 25 atomos de contexto, ruido 0,10/0,20 A | Configurable por argumentos de linea de comandos | no disponible |
| Licencia | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| Disponibilidad | Hugging Face, 0 descargas, repositorio de 0,0 GB | GitHub publico | Referenciado en el repositorio de LigandMPNN |

## Limitaciones y advertencias

- Licencia no declarada: la model card no especifica terminos de uso, y tampoco aclara bajo que licencia se redistribuyen los checkpoints. Cualquier uso comercial exige verificar antes la licencia de LigandMPNN upstream y la de estos pesos.
- Repositorio con 0,0 GB de tamano y 0 descargas: conviene comprobar que los ficheros `.pt` estan realmente accesibles antes de construir un pipeline que dependa de ellos.
- Ausencia total de benchmarks: no hay evidencia cuantitativa publica de tasa de exito de diseno, recuperacion de secuencia nativa ni comportamiento en complejos con ligando.
- Sin informacion de dataset ni de sesgos: al no describirse los datos de entrenamiento, no es posible evaluar sesgos hacia determinadas familias proteicas, longitudes de cadena o tipos de ligando.
- Fuera de distribucion: al ser un modelo de diseno estructural, una estructura de entrada muy alejada de las condiciones de entrenamiento puede producir secuencias no plegables o no funcionales; esto no es "alucinacion" en sentido linguistico, pero el riesgo practico es equivalente.
- Alcance limitado: solo disena secuencia. El empaquetado de cadenas laterales requiere el checkpoint de packing separado de LigandMPNN, y las restricciones a nivel de residuo, el scoring y el batching se delegan en la documentacion upstream.
- Dependencia fuerte de terceros: la ejecucion correcta depende de la version concreta de LigandMPNN, de Python 3.11 en el ejemplo y de la compatibilidad estricta de `load_state_dict`, por lo que cambios upstream pueden romper la carga.
- Confusion potencial de parametros: la etiqueta de ruido (0,10 A, 0,20 A) no es la temperatura de muestreo ni requiere anadir ruido a la estructura de entrada; interpretarlo mal altera los resultados.
- Metadatos de idioma irrelevantes: la etiqueta `en` no describe una capacidad multilingue real, ya que la salida son secuencias de aminoacidos.
- Fechas de creacion y actualizacion del repositorio (2026) poco habituales, dato a tener en cuenta si se audita la trazabilidad del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MurrellLab/SeqGivenStruct
- Repositorio oficial de LigandMPNN: https://github.com/dauparas/LigandMPNN
- Instrucciones de dependencias de LigandMPNN: https://github.com/dauparas/LigandMPNN#dependencies
- Perfil de la organizacion MurrellLab en Hugging Face: https://huggingface.co/MurrellLab
- Dataset GenBench de MurrellLab: https://huggingface.co/datasets/MurrellLab/GenBench/viewer
- Referencia a BoltzGen.jl (Murrell Lab, interfaz con la familia Boltz): https://github.com/KarelBerka/Alphafoldology/issues/859
- Listado de modelos atribuidos a MurrellLab: https://essamamdani.com/ai-models/company/murrelllab
- Lista de modelos abiertos gratuitos (referencia general, sin datos de BindMPNN): https://github.com/ClawLabsAI/free-ai-models
