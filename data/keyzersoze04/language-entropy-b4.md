# keyzersoze04/language-entropy-b4

## Resumen

`keyzersoze04/language-entropy-b4` no es un modelo de lenguaje de proposito general, sino un paquete de reproduccion de resultados de investigacion. Concretamente, contiene los artefactos del experimento B4 (abstencion estructural) del programa Language-Entropy: ocho checkpoints de modelos decoder-only entrenados desde cero sobre el corpus BabyLM, junto con los arrays de metricas por caracter que permiten recalcular el resultado principal del estudio.

El hallazgo que documenta el repositorio es que tres tokenizadores de subpalabras (unigram 8k, unigram 32k y BPE 32k), sin ejecutar ningun modelo y sin usar etiquetas, recuperan el 75 % del poder de abstencion de la entropia predictiva del propio modelo. Es decir, la senal de "cuando abstenerse" puede aproximarse con informacion puramente estructural del tokenizador, lo que abarata y simplifica los mecanismos de selective prediction y deteccion de incertidumbre.

Los checkpoints son deliberadamente pequenos: arquitectura decoder-only de 8 capas con d_model 512 y 25,2 millones de parametros no de embedding. Se distribuyen pesos en formato PyTorch pickle (`.pt`) y arrays NumPy (`.npy`), con licencia MIT y un fichero `SHA256SUMS` para verificacion de integridad. No hay model card con datos de uso, benchmarks estandar ni idiomas declarados, por lo que debe tratarse como material de laboratorio, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (8 capas, d_model 512) |
| Parametros totales | 25,2 M parametros no de embedding (total con embeddings no disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en el formato nativo de PyTorch) |
| Idiomas soportados | no disponible (entrenado sobre BabyLM, corpus predominantemente en ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (pickles serializados con `torch.load(..., weights_only=False)`) mas arrays `.npy` |
| Tamano del repositorio | 1,7 GB |
| Variantes incluidas | 8 checkpoints: BPE 32k (semillas 0 y 1), caracter (0 y 1), unigram 32k (0 y 1), unigram 8k (0 y 1) |
| Tamano por checkpoint | 239 MB (BPE 32k y unigram 32k), 139 MB (unigram 8k), 112 MB (caracter) |
| Fecha de creacion del repo | 2026-10-15 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

Cada checkpoint es un transformer decoder-only de 8 capas con dimension de modelo 512 y 25,2 millones de parametros no de embedding, entrenado desde cero sobre BabyLM. La variable experimental es el tokenizador: cuatro brazos (BPE con vocabulario de 32k, unigram con 32k, unigram con 8k y tokenizacion a nivel de caracter, un token por caracter), cada uno replicado con dos semillas, lo que da los ocho checkpoints del directorio `checkpoints/`. Los tokenizadores no se almacenan: el codigo del repositorio GitHub los reconstruye de forma determinista a partir de BabyLM.

Los arrays de `b4_bits/` se calculan por caracter sobre el split de validacion de BabyLM e incluyen, para cada brazo y semilla, los bits realizados (`bits_*.npy`), la entropia predictiva del modelo (`ent_*.npy`) y una mascara de cobertura que indica que caracteres recibieron prediccion (`cov_*.npy`), ademas de la segmentacion por brazo (`seg_*.npy`, independiente de la semilla). La model card no menciona uso de RLHF, DPO ni ajuste por instrucciones: son modelos de modelado de lenguaje entrenados de forma supervisada clasica. Tampoco se detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni innovaciones arquitectonicas mas alla del transformer estandar; toda esa informacion figura como no disponible.

## Capacidades

- Modelado de lenguaje autoregresivo (prediccion del siguiente token) en los cuatro regimenes de tokenizacion.
- Calculo de entropia predictiva por caracter y de bits realizados, util para estudiar calibracion e incertidumbre.
- Reproduccion del experimento B4 de abstencion estructural: recalculo del resultado del 75 % de recuperacion del poder de abstencion a partir de los tokenizadores, sin ejecutar el modelo y sin etiquetas.
- Analisis comparativo del efecto del vocabulario (caracter, 8k y 32k) sobre el coste en bits por caracter.
- Generacion de la segmentacion token a token alineada por caracter mediante `seg_*.npy`.
- No dispone de soporte de tool calling ni function calling, segun la informacion disponible.
- No dispone de modo agente, razonamiento multi-paso, modo thinking, vision ni audio, segun la informacion disponible.
- No hay model card que declare capacidades multilingues; el entrenamiento se limita a BabyLM.

## Casos de uso

- Reproduccion experimental: recolocar los `.pt` en `results/tok01_models/` y los `.npy` en `results/b4_bits/`, y ejecutar `B4_ARMS=uni8k,uni32k,bpe32k python code/b4_abstain.py` para verificar la cifra del 75 % sin reentrenar nada.
- Investigacion en selective prediction: usar los arrays de entropia y cobertura para comparar estrategias de abstención basadas en el modelo frente a estrategias basadas unicamente en el tokenizador.
- Estudio del sesgo de tokenizacion: comparar el brazo de caracteres con los brazos de subpalabras para cuantificar como la segmentacion altera la entropia por caracter y las decisiones de abstención.
- Linea base en eficiencia de muestreo: emplear los ocho checkpoints como referencia reproducible de BabyLM en experimentos sobre entrenamiento con pocos datos.
- Auditoria de calibracion: usar `ent_*.npy` y `bits_*.npy` como material de partida para evaluar tecnicas de calibracion (temperature scaling, conformal prediction) en modelos diminutos.
- Docencia y divulgacion: los checkpoints de 112-239 MB permiten demostrar en clase, en portatil o incluso en CPU, como se relacionan tokenizacion, entropia y abstención.
- Replicacion en otros corpus: la metodologia (tres tokenizadores, sin modelo ni etiquetas) puede trasladarse a otros dominios o idiomas reentrenando los brazos con el mismo pipeline.
- Analisis de seguridad de artefactos: el repositorio incluye `SHA256SUMS`, de modo que sirve como caso practico para verificar integridad de pesos antes de cargarlos con `torch.load`.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Recuperacion del poder de abstencion del modelo | 75 % | Tres tokenizadores de subpalabras (uni8k, uni32k, bpe32k), sin ejecutar el modelo y sin etiquetas, frente a la entropia predictiva del propio modelo |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, HellaSwag, etc.) en la informacion disponible. La unica cifra de rendimiento documentada es la recuperacion del 75 % del poder de abstencion descrita en la model card.

## Requisitos de hardware

- VRAM de inferencia: practicamente despreciable. Con 25,2 M de parametros no de embedding y checkpoints de 112-239 MB, la inferencia en fp32 requiere del orden de unos cientos de MB de memoria; el dato exacto de pico de memoria no esta disponible.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente. No se han publicado pruebas especificas con A100, H100 o RTX 4090.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, e incluso integradas). Tambien es viable la ejecucion en CPU.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI. El unico camino documentado es el codigo del repositorio GitHub (`code/b4_abstain.py`, `code/b4_bits.py`) cargando los checkpoints con `torch.load(..., weights_only=False)`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de las alternativas proceden de sus especificaciones publicas; no existe ninguna comparacion head-to-head publicada con `language-entropy-b4`, cuyo rendimiento en tareas estandar es desconocido.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en benchmarks |
|---|---|---|---|---|---|
| language-entropy-b4 | 25,2 M no de embedding | no disponible | MIT | HuggingFace + GitHub, 0 descargas | Solo el 75 % de recuperacion de abstencion; sin benchmarks estandar |
| GPT-2 small | 124 M | 1024 tokens | MIT modificada | Ampliamente disponible | Resultados publicos en varios benchmarks |
| Pythia-70M | 70 M | 2048 tokens | Apache 2.0 | Ampliamente disponible | Resultados publicos en varios benchmarks |

La diferencia fundamental no es de escala, sino de proposito: language-entropy-b4 es un artefacto de investigacion sobre tokenizacion y abstención, mientras que GPT-2 small y Pythia-70M son modelos de proposito general con evaluaciones publicadas.

## Limitaciones y advertencias

- No es un modelo de chat ni de instrucciones: no hay ajuste por instrucciones, RLHF ni DPO documentados, por lo que no debe esperarse un comportamiento conversacional util.
- Tamano muy reducido (25,2 M de parametros no de embedding): su calidad como modelo de lenguaje general es limitada por construccion.
- Idioma: la model card no declara idiomas y el entrenamiento se realiza sobre BabyLM, un corpus predominantemente en ingles; el comportamiento en castellano no esta documentado.
- Longitud de contexto: no disponible, lo que impide planificar usos que dependan de ventanas largas.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje, agravado aqui por el escaso tamano y la ausencia de ajuste alineado; no se ha publicado ninguna evaluacion de veracidad.
- Sesgos: no se ha publicado ningun analisis de sesgos; BabyLM y el corpus subyacente pueden introducir sesgos propios del material de entrenamiento, y no hay documentacion al respecto.
- Seguridad de carga: los checkpoints son pickles de PyTorch y el codigo los abre con `weights_only=False`. Esto permite ejecucion de codigo arbitrario al deserializar. Cargar unicamente ficheros cuyo checksum coincida con `SHA256SUMS` y en entornos aislados.
- Procedencia de los datos: no se detalla la licencia o las restricciones de redistribucion del corpus BabyLM usado para el entrenamiento.
- Licencia del artefacto: MIT, permisiva para uso comercial, pero la ausencia de garantias y de benchmarks hace desaconsejable su uso en produccion orientada a usuario final.
- Validacion de la comunidad nula: 0 descargas y 0 likes en el momento de la consulta; el repositorio no ha sido contrastado por terceros.
- Metadatos anomalos: la fecha de creacion registrada (2026-10-15) es posterior a la fecha habitual de publicacion; conviene verificar la vigencia del contenido.

## Enlaces

- HuggingFace: https://huggingface.co/keyzersoze04/language-entropy-b4
- Repositorio GitHub del programa Language-Entropy: https://github.com/mrnathanhumphrey-droid/Language_Entropy
- Ficheros de verificacion: `SHA256SUMS` dentro del repositorio de HuggingFace
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada
