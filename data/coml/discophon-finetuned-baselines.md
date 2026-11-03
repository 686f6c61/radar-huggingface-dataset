# coml/discophon-finetuned-baselines

## Resumen

DiscoPhon finetuned baselines es una coleccion de 144 checkpoints derivados de los cuatro modelos base del benchmark DiscoPhon, un marco de evaluacion para el descubrimiento no supervisado de inventarios de fonemas mediante unidades discretas de habla. Lo desarrolla el laboratorio CoML (Cognitive Machine Learning) y cada checkpoint corresponde a uno de los cuatro modelos preentrenados (SpidR VP-20, SpidR MMSULab, HuBERT base VP-20 y HuBERT base MMSULab) afinado sobre cada uno de los 12 idiomas del benchmark con tres regimenes de datos: 10 minutos, 1 hora y 10 horas.

El paquete no es un modelo generativo ni un asistente conversacional: es un conjunto de artefactos de investigacion para tareas de representacion y segmentacion fonetica del habla. Su relevancia actual radica en que estandariza la comparacion entre enfoques de aprendizaje autosupervisado (SpidR frente a HuBERT) para el descubrimiento de fonemas en condiciones de bajos recursos, lo que permite medir de forma reproducible el efecto del idioma y de la cantidad de datos de ajuste fino.

El repositorio ocupa 80,6 GB y contiene pesos en formato PyTorch (`.pt`) junto con ficheros `config.json` y objetos K-means serializados con joblib. La licencia es MIT y los idiomas cubiertos son cmn, deu, eng, eus, fra, jpn, swa, tam, tha, tur, ukr y wol.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos familias: SpidR (segmentacion y representacion discreta del habla) y HuBERT base (transformer autosupervisado con objetivos de prediccion enmascarada) |
| Parametros totales | No disponible (HuBERT base: aproximadamente 95 M; SpidR: no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelos de audio; ventana de entrada no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | cmn, deu, eng, eus, fra, jpn, swa, tam, tha, tur, ukr, wol |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), `config.json` para SpidR, K-means en joblib para HuBERT |

## Arquitectura y entrenamiento

El paquete combina dos lineas arquitectonicas. SpidR es un modelo de representacion y segmentacion del habla que produce unidades discretas directamente, y sus checkpoints incluyen un `config.json` leido por la libreria `spidr` desde el directorio del checkpoint. HuBERT base es un transformer autosupervisado entrenado con prediccion de unidades enmascaradas; sus checkpoints se acompanan del K-means empleado para calcular los objetivos de ajuste fino, con K clusters ajustados sobre las caracteristicas del modelo preentrenado en su mejor capa (capa 11 para `hubert-vp20-it2`, capa 12 para `hubert-mmsulab-it2`) y sobre los datos de ajuste fino de cada ejecucion.

El entrenamiento consiste en ajuste fino supervisado por los objetivos de unidades sobre corpus de 10 minutos, 1 hora y 10 horas por idioma, partiendo de los modelos preentrenados `coml/spidr-vp20`, `coml/spidr-mmsulab`, `coml/hubert-base-vp20` y `coml/hubert-base-mmsulab`. La receta de ajuste fino esta documentada en la guia de baselines del benchmark DiscoPhon. No se especifican en la informacion disponible el numero de tokens de audio, la composicion exacta de los corpus ni si se aplicaron tecnicas de RLHF o DPO (no procede en este tipo de modelo).

## Capacidades

- Extraccion de caracteristicas acusticas autosupervisadas a partir de audio de habla.
- Descubrimiento no supervisado de inventarios de fonemas mediante agrupamiento de unidades discretas.
- Segmentacion del habla en unidades (SpidR).
- Generacion de unidades discretas mediante K-means sobre caracteristicas de HuBERT.
- Evaluacion comparativa de metodos de descubrimiento de fonemas en 12 idiomas.
- Ajuste fino con regimenes de datos reducidos (10 min, 1 h, 10 h) para estudiar el efecto de la cantidad de datos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Investigacion en descubrimiento fonetico: usar los checkpoints como linea base reproducible para comparar nuevos metodos de unidades discretas frente a SpidR y HuBERT en los 12 idiomas del benchmark.
- Analisis de transferencia entre idiomas: comparar el rendimiento de un mismo modelo preentrenado ajustado en distintos idiomas para estudiar que lenguas se benefician mas del preentrenamiento multilingue.
- Estudio de eficiencia de datos: emplear los tripletes de 10 min, 1 h y 10 h para trazar curvas de aprendizaje y determinar el volumen minimo de datos necesario para una calidad dada de inventario fonetico.
- Segmentacion y anotacion asistida de corpus de habla: extraer unidades de un corpus no anotado con SpidR para preanotar fronteras y clases foneticas antes de la revision manual.
- Construccion de sistemas de reconocimiento de habla en lenguas de bajos recursos: aprovechar las unidades discretas como representacion intermedia en pipelines de ASR cuando no hay transcripciones extensas.
- Evaluacion de modelos preentrenados de habla: usar los checkpoints como sonda para medir la calidad de las representaciones de un modelo base en tareas foneticas sin necesidad de etiquetas.
- Docencia y reproduccion de experimentos: descargar un subconjunto de checkpoints (por ejemplo, `spidr-vp20/*`) para reproducir las cifras del articulo en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite las unidades y puntuaciones de estos modelos en el benchmark al dataset de artefactos `coml/discophon-artifacts`, donde aparecen bajo las mismas claves (por ejemplo, `spidr-vp20/ft-deu-1h/`), pero no se incluyen cifras numericas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del checkpoint concreto (HuBERT base es un modelo pequeno, en el rango de decenas de millones de parametros, mientras que SpidR no tiene tamano documentado aqui).
- GPU recomendadas: no disponibles; para HuBERT base es suficiente una GPU consumer moderna, y para SpidR no se especifica.
- Cabe en GPU consumer: probablemente si para los checkpoints HuBERT base; para SpidR, no disponible.
- Opciones de despliegue: libreria `spidr` (repositorio facebookresearch/spidr), `minimal_hubert` (repositorio mxmpl/minimal_hubert) y el modulo `discophon.baselines` para extraer unidades y caracteristicas directamente.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 80,6 GB; conviene descargar solo los subdirectorios necesarios con `hf download --include`.

## Comparativa con modelos similares

| Modelo | Familia | Parametros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DiscoPhon finetuned baselines (este) | SpidR + HuBERT base, 144 checkpoints | No disponible (HuBERT base ~95 M) | 12 | MIT | HuggingFace |
| coml/spidr-vp20 | SpidR preentrenado | No disponible | No disponible | No disponible | HuggingFace |
| coml/hubert-base-vp20 | HuBERT base preentrenado | ~95 M | No disponible | No disponible | HuggingFace |
| coml/hubert-base-mmsulab | HuBERT base preentrenado | ~95 M | No disponible | No disponible | HuggingFace |

La comparativa con alternativas externas al ecosistema DiscoPhon (por ejemplo, wav2vec 2.0 o XLS-R) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni respuestas conversacionales; su uso esta restringido a tareas de representacion y segmentacion del habla.
- Los checkpoints estan ajustados especificamente para el benchmark DiscoPhon; su comportamiento fuera de esa configuracion experimental no esta documentado.
- El rendimiento depende fuertemente del idioma y del volumen de datos de ajuste fino (10 min frente a 1 h frente a 10 h); no se deben extrapolar resultados entre regimenes.
- Los objetivos de HuBERT dependen del K-means incluido en cada directorio; usar un K-means distinto invalida la reproducibilidad de las cifras.
- Riesgo de sesgo: los corpus de ajuste fino no estan descritos en la informacion disponible, por lo que se desconoce su composicion demografica y dialectal.
- No hay informacion sobre alucinacion en el sentido generativo, pero las unidades discretas pueden producir agrupamientos erroneos en habla ruidosa o fuera de dominio.
- Licencia MIT: permite uso comercial, pero conviene verificar las licencias de los modelos preentrenados de origen y de los corpus empleados en el ajuste fino.
- El repositorio completo pesa 80,6 GB; descargarlo entero puede no ser viable en entornos con almacenamiento limitado.
- Creado en 2026-10-08 y actualizado en 2026-11-03, con 0 descargas y 0 likes: ecosistema de uso muy reducido y poca validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/coml/discophon-finetuned-baselines
- Benchmark DiscoPhon: https://benchmarks.cognitive-ml.fr/discophon/
- Guia de baselines: https://benchmarks.cognitive-ml.fr/discophon/guide/baselines/
- Dataset de artefactos: https://huggingface.co/datasets/coml/discophon-artifacts
- Modelo preentrenado SpidR VP-20: https://huggingface.co/coml/spidr-vp20
- Modelo preentrenado SpidR MMSULab: https://huggingface.co/coml/spidr-mmsulab
- Modelo preentrenado HuBERT base VP-20: https://huggingface.co/coml/hubert-base-vp20
- Modelo preentrenado HuBERT base MMSULab: https://huggingface.co/coml/hubert-base-mmsulab
- Repositorio SpidR: https://github.com/facebookresearch/spidr
- Repositorio minimal_hubert: https://github.com/mxmpl/minimal_hubert
- Articulo (Interspeech 2026): doi 10.21437/Interspeech.2026-2791
