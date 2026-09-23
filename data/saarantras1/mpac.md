# saarantras1/MPAC

## Resumen

MPAC (Malinois with Parallel Aggregated Cross-validation) es un modelo de prediccion de actividad reguladora cis sobre secuencias de ADN humano de 200 pares de bases. Desarrollado por el grupo de Steven K. Reilly (Yale) y publicado en bioRxiv en 2025, estima la actividad de ensayos reporteros masivos en paralelo (MPRA) en tres lineas celulares (K562, HepG2 y SK-N-SH) y el sesgo alelico (allelic skew) causado por variantes no codificantes. El repositorio de HuggingFace aloja los 110 checkpoints publicados, convertidos a safetensors desde el deposito de Zenodo sin reentrenamiento ni modificacion.

El problema que aborda es central en genomica funcional: la mayoria de las variantes asociadas a enfermedad en estudios GWAS caen en regiones no codificantes, donde los predictores basados en conservacion o en scores de patogenicidad tienen una capacidad predictiva limitada. MPAC traslada la senal experimental de MPRA a un modelo secuencia-a-funcion, de modo que se puede puntuar cualquier variante no codificante sin necesidad de repetir el ensayo en laboratorio. Esto lo hace relevante como herramienta de priorizacion antes de validacion experimental.

La nomenclatura del modelo indica su doble eje de diseno: la arquitectura de la familia Malinois (la misma base que el modelo Boda2 de Gosai et al.) y un esquema de validacion cruzada paralela agregada, en el que cada checkpoint se entrena dejando fuera un cromosoma distinto. El repositorio ocupa 1,8 GB y contiene los 110 checkpoints; la model card no especifica el numero de parametros ni el detalle de capas, y no se han facilitado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Malinois (modelo secuencia-a-funcion de la familia Boda2); detalle de capas no disponible |
| Parametros totales | no disponible (el repositorio de 1,8 GB contiene 110 checkpoints en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 200 pb por ventana de entrada; constructo completo de 600 pb (inserto mas contexto del vector MPRA) |
| Tipos de cuantizacion | no disponible; solo se distribuyen pesos en safetensors de precision completa |
| Idiomas soportados | no disponible / no aplica: procesa secuencias de ADN, no lenguaje natural |
| Licencia | cc-by-4.0 (el codigo `modeling_mpac.py` deriva de codigo MIT de `sjgosai/boda2`) |
| Formato de pesos | safetensors |
| Funcion (pipeline) | other: prediccion de actividad cis-reguladora y sesgo alelico |
| Salidas | vector de 3 valores por secuencia: K562, HepG2, SKNSH |
| Cobertura cromosomica | solo autosomas; `from_pretrained` lanza excepcion en chrX, chrY y cromosomas sin fold retenido |
| Numero de checkpoints | 110 |
| Libreria | `mpac` (requiere `modeling_mpac.py`) |
| Tamano del repositorio | 1,8 GB |
| Fecha de creacion | 2026-08-11 |
| Ultima actualizacion | 2026-09-23 |

## Arquitectura y entrenamiento

MPAC pertenece a la estirpe de modelos Malinois empleada en Boda2, un enfoque secuencia-a-funcion basado en redes convolucionales que mapea directamente una secuencia de ADN a una señal experimental de actividad reguladora. El modelo no recibe anotaciones externas ni caracteristicas derivadas del genoma: consume la secuencia de 200 pb (mas el contexto del vector MPRA hasta completar un constructo de 600 pb) y devuelve tres valores de actividad, uno por linea celular. La model card no detalla el numero de bloques, canales, kernel sizes ni parametros, por lo que esas cifras quedan como no disponibles.

El entrenamiento sigue un esquema de validacion cruzada por cromosoma: los 110 checkpoints se reparten en folds que excluyen un cromosoma concreto del conjunto de entrenamiento. La clase `MPACEnsemble` selecciona automaticamente los modelos que no vieron el cromosoma de la consulta (`chromosome=7` carga los diez modelos con chr7 retenido). Las predicciones se generan promediando ambas hebras y anadiendo el contexto del vector MPRA; para variantes, la secuencia se tesela en 18 ventanas de 200 pb con paso de 10 pb y se agrega por media (parametros `--relative_start 9`, `--relative_end 180`, `--step_size 10`, `--strand_reduction mean`, `--window_reduction mean`). No se documenta en la informacion disponible si hubo RLHF, DPO ni ajuste por preferencias (no aplica a un modelo de regresion genomica).

## Capacidades

- Prediccion de actividad cis-reguladora de secuencias humanas de 200 pb en tres lineas celulares simultaneamente (K562, HepG2, SK-N-SH).
- Prediccion de sesgo alelico para variantes no codificantes: `predict_skew(ref_contexts, alt_contexts)` devuelve la diferencia alt menos ref por linea celular.
- Puntuacion de SNV a partir de un fichero tipo VCF mediante `vcf_predict.py`, con la prediccion volcada en la columna `INFO` de una TSV de salida.
- Puntuacion de indels pequenos (recomendado <= 10 pb) mediante `vcf_predict_indel.py`.
- Puntuacion de haplotipos con `vcf_predict_haplotype.py`, que ajusta el ventaneo para que todas las ventanas contengan las variantes de interes.
- Control fino del esquema de prediccion a traves de la CLI `coda_mpac`: numero de ventanas, tamano de paso, reduccion de hebras, uso de reverse complement del inserto o del plasmido completo, y agregacion de ventanas (media, maximo, minimo).
- Agregacion por ensemble con seleccion del fold que no entreno sobre el cromosoma consultado, evitando fuga de informacion.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: es un modelo de regresion sobre secuencias genomicas.

## Casos de uso

- Priorizacion de variantes en loci GWAS: dado un conjunto de variantes no codificantes en desequilibrio de ligamiento, `predict_skew` devuelve el efecto predicho por linea celular y permite ordenar candidatas antes de disenar ensayos MPRA o CRISPR de validacion.
- Anotacion funcional en diagnostico de enfermedades raras: para variantes en regiones reguladoras sin anotacion clinica, MPAC aporta un score cuantitativo de cambio de actividad, util como evidencia adicional en comites de interpretacion.
- Replicacion in silico de experimentos MPRA: el modelo reproduce el esquema de prediccion publicado (ventanas de 200 pb, paso 10, media por hebra y por ventana), de modo que se puede comparar de forma directa con resultados experimentales previos.
- Cribado masivo de VCF en pipelines de laboratorio: `vcf_predict.py` procesa ficheros TSV tipo VCF con genoma de referencia FASTA y escribe las predicciones en la columna `INFO`, lo que permite integrarlo en flujos HPC junto a otras herramientas de anotacion.
- Analisis de haplotipos y efectos compuestos: `vcf_predict_haplotype.py` evalua el efecto conjunto de varias variantes presentes en el mismo alelo, un escenario habitual cuando el fine-mapping identifica multiples señales en un mismo locus.
- Estudio de indels en elementos reguladores: `vcf_predict_indel.py` cubre inserciones y deleciones de hasta 10 pb, relevantes en elementos enhancer donde un desplazamiento de fase puede alterar la afinidad de factores de transcripcion.
- Comparacion de contexto celular: al devolver predicciones para K562 (leucemia mieloide), HepG2 (hepatocarcinoma) y SK-N-SH (neuroblastoma), permite identificar variantes con efecto especifico de tipo celular y orientar el modelo experimental adecuado.
- Triaje en fines de semana o lotes nocturnos: al ser un modelo convolucional pequeno (el repositorio completo son 1,8 GB para 110 checkpoints), el ensemble de diez modelos para un cromosoma cabe en una GPU de gama media y puede procesar lotes de variantes en una sola sesion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al articulo (doi:10.1101/2025.04.16.648420) para los resultados, pero no reproduce tablas de metricas ni comparaciones cuantitativas. No se incluyen datos de correlacion con MPRA, AUROC, AUPRC, ni comparaciones con Boda2, Enformer u otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia derivada del tamano del repositorio (1,8 GB para 110 checkpoints, es decir, del orden de 15-20 MB por checkpoint en safetensors), un checkpoint individual deberia residir holgadamente en menos de 1 GB de VRAM, y un ensemble de diez modelos en el orden de 1-2 GB. Es una estimacion, no un dato publicado.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente para un modelo de este tamano; una RTX 3060 o superior, RTX 4090, A100 o H100 cubren el caso sin dificultad. El ejemplo de la model card usa `device="cuda"` sin especificar modelo de GPU.
- Cabe en GPU de consumo: si, con amplio margen segun la estimacion anterior. Tambien es razonable esperar ejecucion en CPU, aunque la model card solo documenta el uso en CUDA.
- Opciones de despliegue: la libreria propia `mpac` con `MPACEnsemble.from_pretrained(...).predict(...)` desde Python, y la CLI `coda_mpac` (`vcf_predict.py`, `vcf_predict_indel.py`, `vcf_predict_haplotype.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de regresion genomica con logica de ensemble por cromosoma.
- Latencia y throughput: no disponibles en la informacion proporcionada. El coste por variante depende del numero de ventanas (18 por defecto), del paso de teselado y del numero de checkpoints en el ensemble.

## Comparativa con modelos similares

| Modelo | Familia / enfoque | Contexto de entrada | Salidas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MPAC | Malinois (CNN secuencia-a-funcion), ensemble con validacion cruzada por cromosoma | 200 pb por ventana, constructo de 600 pb | Actividad MPRA en K562, HepG2, SK-N-SH + sesgo alelico | cc-by-4.0 | HuggingFace y Zenodo |
| Boda2 (sjgosai/boda2) | Malinois, prediccion de MPRA | no disponible en la informacion proporcionada | Actividad MPRA | MIT (codigo del que deriva `modeling_mpac.py`) | GitHub |
| Enformer | Transformer secuencia-a-tracks | 200 kb segun conocimiento general del modelo | Cientos de tracks multiomica | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| Sei | CNN de clases cromatinicas | 4 kb segun conocimiento general del modelo | Clases de secuencia regulatoria | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

Nota: los datos de Enformer y Sei no provienen de la informacion facilitada en esta busqueda y deben verificarse en sus fuentes originales antes de citarlos. La comparacion relevante para MPAC es con Boda2, del que hereda la arquitectura, y con los propios resultados experimentales de MPRA, dado que MPAC no publica metricas comparativas en la model card.

## Limitaciones y advertencias

- Cobertura cromosomica restringida: solo autosomas. `from_pretrained` lanza una excepcion en chrX, chrY y cualquier cromosoma sin fold retenido, de modo que variantes en cromosomas sexuales no pueden puntuarse con el ensemble.
- Uso obligatorio de la API de alto nivel: cargar un checkpoint directamente o llamar al modelo sin pasar por `from_pretrained` y `predict` devuelve numeros plausibles pero incorrectos, sin lanzar error. Se pierde la seleccion del ensemble correcto, el contexto del vector MPRA y el promedio de hebras.
- Solo tres lineas celulares: K562, HepG2 y SK-N-SH. No hay predicciones para tejidos primarios, tipos celulares no representados ni contextos in vivo, y extrapolar a otros contextos biologicos no esta validado.
- Ambito de variantes limitado: SNV, indels pequenos (recomendado <= 10 pb) y haplotipos dentro del esquema de ventanas. No cubre variantes estructurales, grandes reordenamientos ni variantes fuera de las ventanas definidas por `relative_start` y `relative_end`.
- Riesgo de predicciones plausibles pero erroneas fuera de la distribucion de entrenamiento: al ser un modelo de regresion, no existe un mecanismo de "no lo se". Toda secuencia produce un numero, incluso si la region no se parece a nada visto en entrenamiento. Toda prediccion relevante deberia validarse experimentalmente.
- Sesgos derivados del genoma y del diseno experimental: el modelo aprende de ensayos MPRA en lineas celulares concretas y del genoma de referencia usado en cada ejecucion. No se documentan analisis de sesgo por composicion de secuencia, contenido GC ni origen poblacional.
- Licencia CC-BY-4.0: permite uso comercial y modificacion con atribucion. El fichero `modeling_mpac.py` conserva el aviso MIT del codigo de `sjgosai/boda2`, por lo que conviene respetar ambas condiciones al redistribuir.
- Sin datos de calibracion publicados en la informacion disponible: no hay curvas de calibracion ni intervalos de confianza asociados a los scores, lo que dificulta fijar umbrales operativos en produccion.
- Requiere ficheros auxiliares: genoma de referencia en FASTA y variantes en TSV tipo VCF con columnas `CHROM`, `POS`, `ID`, `REF`, `ALT`, `QUAL`, `FILTER`, `INFO`. Un formato incorrecto no produce validacion robusta por parte del modelo.
- Cobertura multilingue: no aplica. El modelo no procesa lenguaje natural y no tiene capacidades de generacion de texto.

## Enlaces

- HuggingFace: https://huggingface.co/saarantras1/MPAC
- Articulo (bioRxiv, doi): https://doi.org/10.1101/2025.04.16.648420
- Deposito Zenodo con los checkpoints originales: https://doi.org/10.5281/zenodo.15178434
- Herramientas de linea de comandos MPAC: https://github.com/Reilly-Lab-Yale/coda_mpac
- Codigo base del que deriva `modeling_mpac.py`: https://github.com/sjgosai/boda2
- Nota sobre la busqueda web: los resultados devueltos corresponden a la asociacion France-IOI (olimpiadas de informatica) y no guardan relacion con MPAC ni con genomica. No se han encontrado enlaces adicionales relevantes en la busqueda proporcionada.
