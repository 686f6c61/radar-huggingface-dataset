# krishdange27/enzyme-retrieval-da3410

## Resumen

Enzyme-retrieval-da3410 es un paquete de inferencia publicado en Hugging Face por el usuario krishdange27 bajo el identificador `krishdange27/enzyme-retrieval-da3410`. No se trata de un modelo de lenguaje generativo, sino de un clasificador de tipo perceptron multicapa (MLP) entrenado para una tarea concreta de prediccion de numeros EC (Enzyme Commission) a partir de SMILES de reaccion. El paquete incluye el punto de entrada de inferencia `predict.py`, el checkpoint `weights/final_mlp_softce.pt`, el vocabulario oficial de clases EC en `ec_vocabulary.json`, un `Dockerfile` para imagen CPU Linux x86-64 y las dependencias de ejecucion en `requirements.txt`.

El modelo resuelve el problema de mapear una reaccion quimica representada como Reaction SMILES a una clase EC valida y distinta. La entrada esperada es un fichero Parquet con las columnas `id` y `rxn_smiles`; la salida es un fichero JSONL con exactamente `id` y `prediction`, donde cada prediccion contiene un unico EC valido. El pipeline agrupa reacciones SMILES identicas y conserva el primer identificador, tal como exige la tarea.

La relevancia de este artefacto es acotada: no es un modelo fundacional ni compite en la categoria de LLMs, sino un componente especializado para un benchmark o competicion de recuperacion de enzimas. El repositorio ocupa 0,1 GB, no registra descargas ni likes en el momento de la consulta, y su model card no documenta parametros, contexto, idiomas ni resultados de benchmarks. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) sobre caracteristicas Morgan de reaccion; no es un transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de contexto; entrada basada en fingerprints) |
| Tipos de cuantizacion | no disponible; el checkpoint se distribuye en formato PyTorch (`.pt`) |
| Idiomas soportados | no disponible (no procesa texto natural; procesa SMILES) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`weights/final_mlp_softce.pt`) |

## Arquitectura y entrenamiento

La model card describe un "Soft-target Morgan MLP": un MLP entrenado con perdida de entropia cruzada suave (soft cross-entropy) sobre caracteristicas de fingerprint Morgan calculadas a partir de los SMILES de reaccion. El codigo de inferencia lee del checkpoint la configuracion del fingerprint, los tamanos de las capas ocultas, el ajuste `log1p` y el orden de las clases EC, y reproduce el pipeline de caracteristicas del cuaderno de entrenamiento. El nombre del checkpoint (`final_mlp_softce.pt`) confirma el uso de soft targets en la funcion de perdida.

No se dispone de informacion sobre el numero de tokens, la composicion del dataset, el volumen de reacciones de entrenamiento, el numero de capas ocultas ni las dimensiones del fingerprint. La model card advierte explicitamente que el checkpoint y el vocabulario deben copiarse de la ejecucion de entrenamiento completada en Colab y que no debe usarse un checkpoint de otro experimento, lo que indica que el artefacto esta ligado a una configuracion concreta y no es un modelo general reutilizable.

## Capacidades

- Prediccion de numeros EC a partir de Reaction SMILES, devolviendo una unica clase EC valida por entrada.
- Agrupacion de reacciones SMILES identicas, conservando el primer `id` del grupo.
- Lectura de entradas en formato Parquet con columnas `id` y `rxn_smiles`.
- Escritura de salidas en JSONL con exactamente los campos `id` y `prediction`.
- Ejecucion en CPU sobre Linux x86-64 mediante imagen Docker.
- Reproduccion determinista del pipeline de caracteristicas Morgan a partir de la configuracion almacenada en el checkpoint.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto libre.

## Casos de uso

- Anotacion automatizada de enzimas en pipelines de biologia computacional: el modelo recibe un lote de reacciones en Parquet y devuelve una clase EC por reaccion, lo que permite etiquetar grandes conjuntos de reacciones sin intervencion manual.
- Participacion en competiciones o benchmarks de prediccion EC: el entrypoint `predict.py --input --output` esta disenado para que un evaluador externo lo invoque directamente, con formato de salida JSONL estricto.
- Integracion en flujos de curacion de bases de datos metabolicas: dado un conjunto de reacciones nuevas, se obtiene una propuesta de EC que luego puede validarse contra bases de referencia como BRENDA o ExPASy.
- Despliegue en entornos sin GPU: la imagen Docker esta pensada para CPU x86-64 con limites de 2 CPUs y 16 GB de memoria, lo que facilita su ejecucion en infraestructura modesta o en CI.
- Preprocesado para modelos posteriores: la prediccion EC puede alimentar modelos de reconstruccion de rutas metabolicas o de analisis de vias, donde la clase EC actua como etiqueta funcional.
- Reproducibilidad de experimentos: al leer la configuracion del fingerprint y el orden de clases del propio checkpoint, el paquete permite repetir exactamente la inferencia de un experimento de entrenamiento concreto.
- Filtrado y deduplicacion de reacciones: la agrupacion de SMILES identicas con retencion del primer `id` sirve para consolidar lotes antes de analisis posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: la imagen Docker oficial esta pensada para Linux x86-64 con `--cpus 2` y `--memory 16g` en el ejemplo de la model card.
- VRAM estimada: no aplica en el flujo documentado; el despliegue de referencia es CPU-only.
- GPU recomendadas: no disponibles; no se documenta soporte GPU.
- Cabe en GPU consumer: no se documenta; el checkpoint es un MLP pequeno (repositorio de 0,1 GB), por lo que en principio seria viable en cualquier GPU, pero no hay datos oficiales.
- Opciones de despliegue: Docker (`docker build --platform linux/amd64 -t enzyme-retrieval .`) y ejecucion directa con Python usando `predict.py` y `requirements.txt`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (clasificadores MLP sobre fingerprints Morgan para prediccion EC) con parametros, contexto o licencia documentados.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta conversacion ni instrucciones en lenguaje natural.
- El checkpoint esta ligado a una ejecucion de entrenamiento concreta; la model card advierte que no debe usarse un checkpoint de otro experimento.
- El vocabulario EC y el orden de clases deben coincidir exactamente con los del checkpoint; un desajuste invalida las predicciones.
- La salida debe contener exactamente `id` y `prediction`, con un unico EC valido por entrada; no se documenta manejo de casos ambiguos o sin EC asignable.
- No hay informacion sobre sesgos, cobertura taxonomica de enzimas, ni dominios quimicos fuera de la distribucion de entrenamiento.
- No se documentan resultados de validacion, por lo que no es posible estimar la tasa de acierto ni el riesgo de predicciones incorrectas.
- El repositorio no registra descargas ni likes, lo que sugiere ausencia de validacion externa por parte de la comunidad.
- La licencia MIT permite uso comercial, pero la ausencia de garantias y de documentacion de rendimiento hace recomendable una validacion propia antes de usarlo en produccion.

## Enlaces

- [Hugging Face: krishdange27/enzyme-retrieval-da3410](https://huggingface.co/krishdange27/enzyme-retrieval-da3410)
