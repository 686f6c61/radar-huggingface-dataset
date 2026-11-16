# anuml/anlp-a3-part2-gnn

## Resumen

`anuml/anlp-a3-part2-gnn` es un repositorio de checkpoints asociado a la asignatura ANLP (Advanced Natural Language Processing), en su entrega numero 3, parte 2. No es un modelo de lenguaje de proposito general, sino un conjunto de artefactos experimentales para una tarea concreta de descifrado criptografico planteada como traduccion secuencia a secuencia a nivel de caracter. El autor es el usuario `anuml` y la licencia declarada es MIT.

La arquitectura declarada combina formulaciones de tipo decoder-only Prefix-LM que mapean entradas cifradas a caracteres en claro, con dos familias de implementacion: un transformer decoder-only con RMSNorm, RoPE y GQA, y un modelo de espacio de estados tipo Mamba. La tokenizacion es a nivel de caracter con un alfabeto fijo de 86 tokens, lo que es coherente con el dominio restringido de cifrados clasicos.

El repositorio tiene un tamano de 0.0 GB y cero descargas, y la model card publica una tabla de benchmarks de validacion con todos los valores a cero y parametros a cero, ademas de varios baselines (sage_bert, gat_bert, bigcn_bert, sage_spacy, gcn_bert, mlp_bert, sage_content, sage_profile). Esto indica que los artefactos publicados no incluyen metricas reales ni pesos funcionales verificables, y que el interes practico del repositorio es academico y reproducible, no de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer (RMSNorm, RoPE, GQA) y Mamba SSM; formulacion Prefix-LM |
| Parametros totales | no disponible (la tabla de la model card indica 0 para todos los checkpoints) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch `.pt`, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no disponible; el dominio es descifrado sobre un alfabeto de 86 caracteres |
| Licencia | MIT |
| Formato de pesos | PyTorch (`torch.load`, `best_model.pt` con `config` y `model_state_dict`) |

## Arquitectura y entrenamiento

La model card describe dos implementaciones paralelas: un transformer decoder-only con normalizacion RMSNorm, embeddings posicionales rotatorios (RoPE) y atencion con query grouping (GQA), y un modelo de espacio de estados tipo Mamba. La tarea se formula como un Prefix-LM decoder-only que recibe el texto cifrado como prefijo y genera los caracteres en claro, lo que en la practica se comporta como un modelo causal condicionado por un prefijo. La tokenizacion es estrictamente a nivel de caracter sobre un alfabeto fijo de 86 simbolos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste supervisado adicional. La model card tampoco detalla hiperparametros de entrenamiento, presupuesto de computo ni estrategia de validacion mas alla de la tabla de metricas, cuyos valores aparecen todos a cero. Los checkpoints se cargan construyendo `DecoderOnlyTransformer` a partir del diccionario `config` almacenado en el `.pt` y aplicando `load_state_dict`, lo que sugiere que el codigo fuente (`src/models/transformer.py`) es necesario para reconstruir el modelo.

## Capacidades

- Descifrado de texto a nivel de caracter sobre un alfabeto fijo de 86 simbolos.
- Generacion condicionada por prefijo (Prefix-LM) para mapear cifrado a claro.
- Implementacion alternativa con modelo de espacio de estados (Mamba) frente a transformer.
- Baselines auxiliares orientados a grafos y a componentes linguisticos (sage_bert, gat_bert, bigcn_bert, gcn_bert, mlp_bert, sage_spacy, sage_content, sage_profile).
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingue; el alcance es el alfabeto de 86 caracteres del corpus de la asignatura.
- No se declara modo de razonamiento explicito (thinking mode), vision ni audio.

## Casos de uso

- Reproduccion academica de la entrega ANLP A3 parte 2: descarga de checkpoints con `scripts/sync_models.py download --part part2` y evaluacion local de las metricas de validacion declaradas en la model card.
- Estudio comparativo de arquitecturas para descifrado: contraposicion entre el transformer decoder-only con RoPE/GQA y el modelo Mamba sobre la misma tarea de mapeo cifrado a claro.
- Analisis de tokenizacion a nivel de caracter: uso del alfabeto fijo de 86 tokens para estudiar el efecto de la granularidad de tokenizacion en tareas de traduccion simbolica.
- Benchmarking de baselines con grafos: comparacion de sage_bert, gat_bert, bigcn_bert y gcn_bert frente a mlp_bert para aislar la contribucion de la estructura de grafo en el rendimiento.
- Docencia y evaluacion de tecnicas de NLP: uso del repositorio como material de referencia para estudiantes que implementan y evaluan modelos secuencia a secuencia sobre dominios restringidos.
- Prototipado de pipelines de carga de checkpoints: validacion del flujo `torch.load` + reconstruccion de config + `load_state_dict` + `eval()` en entornos CPU para integrar los modelos en scripts de evaluacion propios.

## Benchmarks y rendimiento

La model card incluye una tabla de validacion, pero todos los valores publicados son cero, por lo que no constituyen resultados utiles.

| Modelo | Epoca | Val loss | Char acc | Word acc | F1 | Levenshtein | Parametros |
|---|---|---|---|---|---|---|---|
| sage_bert | no disponible | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.00 | 0 |
| gat_bert | no disponible | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.00 | 0 |
| bigcn_bert | no disponible | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.00 | 0 |
| sage_spacy | no disponible | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.00 | 0 |
| gcn_bert | no disponible | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.00 | 0 |
| mlp_bert | no disponible | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.00 | 0 |
| sage_content | no disponible | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.00 | 0 |
| sage_profile | no disponible | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.00 | 0 |

No se han publicado resultados de benchmarks con valores distintos de cero en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no conocerse el numero de parametros de los checkpoints (la tabla declara 0).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamano real de los pesos.
- Despliegue: la unica via documentada es PyTorch nativo mediante `torch.load` y la clase `DecoderOnlyTransformer` del codigo fuente; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- El ejemplo de carga usa `map_location='cpu'`, lo que sugiere que la inferencia puede ejecutarse en CPU para los artefactos publicados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anuml/anlp-a3-part2-gnn | no disponible | no disponible | metricas publicadas a cero | MIT | Hugging Face, 0 descargas |
| Baselines internos (sage_bert, gat_bert, bigcn_bert, gcn_bert, mlp_bert) | no disponible | no disponible | metricas publicadas a cero | MIT (repositorio) | incluidos en el mismo repo |
| Alternativas externas de descifrado con LLM | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos externos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Los unicos valores de rendimiento publicados son cero, por lo que no hay evidencia de que los checkpoints funcionen correctamente.
- El repositorio ocupa 0.0 GB y el numero de parametros declarado es 0, lo que sugiere que los pesos pueden no estar presentes o no ser cargables.
- La carga requiere el codigo fuente del proyecto (`src/models/transformer.py`), no incluido en el repositorio de Hugging Face.
- El dominio es un alfabeto fijo de 86 caracteres; no hay soporte multilingue ni generalizacion a vocabularios abiertos.
- No se declaran sesgos conocidos, pero tampoco se documenta la procedencia ni la composicion del corpus de entrenamiento.
- Riesgo de alucinacion en un modelo de este tipo: no aplicable al dominio restringido, pero no evaluado.
- Licencia MIT: permite uso comercial, pero el estado experimental del repositorio hace desaconsejable su uso en produccion.
- No se documentan limitaciones de contexto ni longitud maxima de secuencia.
- Ausencia total de descargas y de likes: no hay validacion por parte de la comunidad.

## Enlaces

- [Hugging Face: anuml/anlp-a3-part2-gnn](https://huggingface.co/anuml/anlp-a3-part2-gnn)
- Script de sincronizacion citado en la model card: `scripts/sync_models.py download --part part2`
- Script alternativo de shell: `scripts/sync_models.sh download --part part2`
- Codigo de carga referenciado: `src/models/transformer.py` (clase `DecoderOnlyTransformer`)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
