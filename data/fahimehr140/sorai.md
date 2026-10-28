# Fahimehr140/sorai

## Resumen

sorAI (repositorio `Fahimehr140/sorai`) no es un modelo de lenguaje: es una coleccion de 384 redes neuronales convolucionales (CNN), una por locus, entrenadas para predecir si una muestra de helecho es diploide o poliploide a partir de lecturas de captura dirigida del panel GoFlag 408. Lo desarrolla el usuario Fahimehr140 y el codigo de acompanamiento, la cita y el clasificador de agregacion (un random forest) viven en el repositorio de GitHub `Fahimehgit/sorai`, no en HuggingFace.

El problema que resuelve es concreto: inferir ploidia en helechos sin recurrir a citologia o secuenciacion de genoma completo, usando datos de captura dirigida que ya se generan en muchos laboratorios. Cada fichero `checkpoints/best_model_probe_3_<index>.pt` contiene la red de un locus, y `probe_index_to_id.csv` mapea el indice del modelo al identificador de locus GoFlag. Las probabilidades de los 384 locus se combinan despues mediante un random forest externo.

La relevancia es acotada pero real: sobre el conjunto de test held-out de helechos (34 muestras), el random forest que consume estas probabilidades alcanza una exactitud de 0,765 y un AUROC de 0,870. El propio autor advierte de que los modelos se entrenaron solo con helechos y de que no estiman numero de cromosomas. El repositorio ocupa 7,3 GB y se distribuye con licencia MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (red neuronal convolucional) específica por locus; 384 redes independientes, una por locus GoFlag |
| Parametros totales | no disponible (no documentado por checkpoint ni agregado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (la entrada son alineamientos de locus tokenizados, no una secuencia de contexto de LM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje); datos biológicos, sin cobertura idiomática declarada |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.pt`) en `checkpoints/best_model_probe_3_<index>.pt`, más `probe_index_to_id.csv` |
| Libreria | PyTorch |
| Tamano del repositorio | 7,3 GB |
| Entrada esperada | alineamientos de locus tokenizados con nombre `L<probe_id>.json` |
| Salida | probabilidad por locus (diploide/poliploide); la agregación la hace un random forest externo |
| Fecha de publicacion | 2026-10-27 (creado y actualizado el mismo día) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un conjunto de 384 CNN de locus, cada una entrenada de forma independiente para discriminar entre muestras diploides y poliploides a partir de las lecturas de captura dirigida correspondientes a un locus del panel GoFlag 408. El repositorio no documenta la profundidad, el numero de filtros, el tamano de kernel ni la funcion de perdida de estas redes, por lo que los hiperparametros concretos no están disponibles. La agregación entre locus no forma parte del modelo publicado: se realiza con un random forest que hay que obtener del repositorio de GitHub.

En cuanto a datos, el autor indica que el entrenamiento se hizo con helechos y sobre lecturas de captura dirigida GoFlag 408, pero no se especifica el numero de muestras de entrenamiento, la composición del dataset, el numero de tokens ni si hubo aumentado de datos. Tampoco se menciona RLHF, DPO ni ningún otro ajuste por preferencias, algo esperable al no tratarse de un modelo generativo. La única métrica publicada es la evaluación sobre un conjunto de test held-out de 34 muestras de helechos, con exactitud 0,765 y AUROC 0,870 para el pipeline completo (CNN por locus más random forest).

## Capacidades

- Clasificación binaria de ploidia (diploide frente a poliploide) a partir de lecturas de captura dirigida, locus a locus.
- Predicción por locus: cada una de las 384 CNN emite una probabilidad independiente, lo que permite inspeccionar qué locus aportan señal y cuáles son ruidosos.
- Agregación multi-locus: las probabilidades se combinan mediante un random forest externo para producir la llamada final sobre la muestra.
- Integración en línea de comandos: `sorai predict --loci-dir sample_loci/ --cnn-dir sorai-cnns/checkpoints` procesa un directorio de alineamientos tokenizados.
- Mapeo reproducible de indices: `probe_index_to_id.csv` permite traducir el indice de checkpoint al identificador de locus GoFlag.
- Descarga directa del Hub con `hf download Fahimehr140/sorai --local-dir sorai-cnns`.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni modo "thinking": no es un modelo de propósito general.

## Casos de uso

- Cribado rápido de ploidia en colecciones de helechos: dado un conjunto de lecturas GoFlag 408 ya secuenciadas, el pipeline clasifica cada muestra como diploide o poliploide sin necesidad de citometría adicional, usando solo CPU.
- Control de calidad en proyectos de captura dirigida: al obtener una probabilidad por locus, se pueden detectar locus con comportamiento anómalo o muestras cuyo patrón de probabilidades es incoherente con el resto del lote.
- Reanálisis de datos GoFlag 408 archivados: cualquier laboratorio con lecturas históricas del panel puede pasarlas por `sorai predict` para obtener una primera estimación de ploidia antes de invertir en experimentos de laboratorio.
- Priorización en programas de conservación: en estudios de biodiversidad con cientos de accesiones, la clasificación automática permite seleccionar qué muestras requieren caracterización citogenética detallada.
- Investigación en evolución de helechos: la distribución de ploidia por población o por especie se puede estimar a escala de lote, sirviendo como variable explicativa en estudios de especiación y poliploidización.
- Docencia y formación en bioinformática: el flujo completo (descarga del Hub, tokenización de locus, inferencia con `sorai predict`) es un ejemplo reproducible de aplicación de CNN a datos genómicos.
- Integración como paso previo en pipelines de genómica de poblaciones: la etiqueta diploide/poliploide puede usarse para filtrar o estratificar muestras antes de análisis de estructura poblacional.

## Benchmarks y rendimiento

Los únicos resultados publicados corresponden al pipeline completo (384 CNN más random forest) sobre el conjunto de test held-out de helechos:

| Conjunto de evaluacion | Metrica | Valor |
|---|---|---|
| Helechos held-out (34 muestras) | Exactitud (accuracy) | 0,765 |
| Helechos held-out (34 muestras) | AUROC | 0,870 |

No se publican métricas por locus individual, ni matrices de confusión, ni resultados desagregados por genero o por nivel de ploidia. Tampoco se han publicado comparaciones con herramientas alternativas de estimación de ploidia en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no documentada. Al tratarse de 384 CNN de locus y no de un transformer grande, la huella por forward pass debería ser muy inferior a la de un LLM, pero el autor no publica cifras.
- Tamano en disco: el repositorio completo son 7,3 GB; dividido entre 384 checkpoints equivale a unos 19 MB por fichero (cálculo aritmético a partir del tamano del repo, no un dato publicado).
- GPU recomendadas: no disponibles. No se documenta ningún requisito de GPU; el flujo se describe como un comando de línea de comandos sin especificar acelerador.
- Viabilidad en GPU de consumo: no confirmada por el autor, aunque el orden de magnitud del repositorio sugiere que un equipo de sobremesa es suficiente para almacenar los pesos.
- Opciones de despliegue: exclusivamente el CLI propio del proyecto (`sorai predict`) documentado en el repositorio de GitHub. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia de LM, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor no publica comparaciones frente a otras herramientas de inferencia de ploidia (métodos basados en cobertura, en frecuencias alélicas o en citometría), ni frente a otros clasificadores entrenados sobre el panel GoFlag 408. Cualquier comparación cuantitativa con alternativas queda, por tanto, no disponible.

## Limitaciones y advertencias

- El conjunto de evaluación es muy pequeno: 34 muestras held-out, lo que implica intervalos de confianza amplios alrededor del 0,765 de exactitud y del 0,870 de AUROC.
- El modelo se entrenó únicamente con helechos; no hay evidencia de que generalice a otros grupos vegetales ni a otros paneles de captura dirigida distintos de GoFlag 408.
- No estima numero de cromosomas: solo distingue diploide frente a poliploide. No detecta niveles intermedios ni distingue entre distintos niveles de poliploidia más allá de la clase binaria.
- El repositorio de HuggingFace está incompleto por diseño: el random forest agregador y el código de tokenización están en GitHub, no en el Hub, por lo que los checkpoints por sí solos no producen una predicción final.
- Dependencia estricta del formato de entrada: los alineamientos deben llamarse `L<probe_id>.json` y corresponder a los identificadores de `probe_index_to_id.csv`; cualquier desviación en el nombrado o en la tokenización invalida la inferencia.
- No se documentan sesgos del modelo, composición del dataset de entrenamiento ni posibles sesgos de muestreo por especie o región geográfica, lo que impide evaluar su comportamiento fuera de la distribución de entrenamiento.
- Riesgo de falsos positivos y falsos negativos en muestras con cobertura baja o captura desigual entre locus: el modelo no publica métricas de calibración ni umbrales de decisión recomendados.
- Licencia MIT: permite uso comercial y modificación, pero se distribuye sin garantías; no hay clausulas de responsabilidad sobre decisiones biológicas tomadas a partir de las predicciones.
- Fecha de creación y actualización idénticas (2026-10-27) y cero descargas: no hay evidencia de validación independiente por terceros.
- No apto para uso clínico, agrónomo o regulatorio sin validación local previa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Fahimehr140/sorai
- Código, cita y random forest agregador: https://github.com/Fahimehgit/sorai
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante al modelo en la búsqueda realizada; los resultados devueltos no guardan relación con sorAI ni con el análisis de ploidia en helechos.
