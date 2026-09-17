# ahiok/aic2026-mesh-defects

# Ficha tecnica: ahiok/aic2026-mesh-defects

## Resumen

ahiok/aic2026-mesh-defects es el paquete de solucion publicado por el equipo ahiok para la prueba de deteccion de defectos en mallas 3D de la AI Challenge 2026 (SBER AI). No es un modelo de lenguaje ni un modelo fundacional unico, sino un sistema de clasificacion multi-etiqueta compuesto por una mezcla de siete modelos: tres ConvNeXt-Tiny entrenados sobre pliegues de validacion cruzada, tres cabezas neuronales que operan sobre tokens congelados de DINOv3-L, DINOv3-H+ y SigLIP2 so400m, y siete clasificadores LightGBM sobre caracteristicas geometricas de la malla. El repositorio incluye codigo fuente, pesos entrenados, un cuaderno reproducible en Google Colab, las predicciones out-of-fold de los siete modelos y el archivo CSV enviado al leaderboard.

El problema que resuelve es el control de calidad automatico de activos 3D: dada una malla y sus renderizados, el sistema estima la probabilidad de distintas etiquetas de defecto y una etiqueta binaria `quality`. Para ello combina dos familias de senal: descriptores visuales de alta capacidad extraidos de codificadores congelados (DINOv3 y SigLIP2) sobre varias vistas del objeto, y descriptores geometricos clasicos de la malla procesados con LightGBM. La mezcla usa pesos iguales entre los siete modelos y un umbral por etiqueta ajustado sobre predicciones out-of-fold.

El resultado publicado por el autor es una puntuacion de 15,151 en el leaderboard publico y una validacion cruzada de la mezcla de 14,83, obtenida entrenando todo el sistema en una unica GPU de consumo RTX 5060 Ti de 16 GB. Su relevancia practica esta en que documenta un pipeline completo y reproducible de inspeccion 3D con recursos muy limitados, y en que libera los pesos de la mezcla, algo poco habitual en competiciones de este tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla heterogenea: ConvNeXt-Tiny (CNN) + cabezas MLP sobre tokens congelados de DINOv3-L, DINOv3-H+ y SigLIP2 so400m + LightGBM sobre 176 caracteristicas de geometria de malla |
| Parametros totales | No disponible. El repositorio contiene pesos de siete modelos (tres ConvNeXt-Tiny, tres cabezas sobre codificadores congelados y modelos LightGBM); no se publica el recuento agregado |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; la entrada es una malla 3D y sus renderizados) |
| Tipos de cuantizacion | No disponibles |
| Idiomas soportados | No aplica para la tarea. La documentacion de la model card esta redactada en ruso; el codigo usa identificadores en ingles |
| Licencia | No disponible en el repositorio. Los componentes de terceros incluidos (DINOv3, SigLIP2, ConvNeXt) mantienen sus propias licencias de origen |
| Formato de pesos | No disponible. El repositorio ocupa 4,9 GB en total y la model card no documenta el formato de serializacion de los siete modelos |
| Resoluciones de entrada | 224, 384 y 512 px para las ramas ConvNeXt; 512 px para DINOv3; 384 px para SigLIP2 |
| Estado en HuggingFace | 0 descargas, 0 likes; creado y actualizado el 17 de septiembre de 2026 |
| Tarea declarada (pipeline) | No disponible en los metadatos del repositorio |

## Arquitectura y entrenamiento

La mezcla combina tres ramas complementarias con pesos iguales. La primera son tres ConvNeXt-Tiny con un backbone compartido entre vistas, entrenados a tres resoluciones (224, 384 y 512), aplicando reflexion en la entrada durante la inferencia de la rama de 512. La segunda son cabezas neuronales que no reentrenan el codificador visual: se congelan DINOv3-L a 512 px, DINOv3-H+ a 512 px y SigLIP2 so400m a 384 px, y para cada una de las seis vistas o clases se extrae el token CLS junto con la media y la desviacion tipica de los tokens de parche procedentes de cinco capas distintas; sobre ese vector se aplica un MLP con dropout de 0,85. La tercera rama es un LightGBM entrenado sobre 176 caracteristicas de geometria de la malla y estadisticas de los renderizados, con un modelo por etiqueta y cinco pliegues.

No se especifica en la informacion disponible el numero de tokens ni la composicion del dataset de entrenamiento, mas alla de que los datos los proporciona la organizacion del reto y no se redistribuyen en el repositorio. Tampoco se documenta el uso de RLHF, DPO ni tecnicas de ajuste por preferencias, algo esperable dado que la tarea es de clasificacion supervisada y no de generacion. La innovacion tecnica destacable es el esquema de agregacion sobre tokens de parche multi-capa con estadisticos (media y desviacion) en lugar de usar unicamente el token CLS, junto con el reemplazo de un unico clasificador por una mezcla de siete predictores con umbrales por etiqueta calibrados sobre predicciones out-of-fold. Todo el entrenamiento se realizo en una sola RTX 5060 Ti de 16 GB.

## Capacidades

- Clasificacion multi-etiqueta de defectos en mallas 3D: el sistema devuelve una probabilidad por etiqueta (hasta seis, segun la configuracion descrita) y un umbral independiente por etiqueta.
- Prediccion de la etiqueta binaria `quality`: se asigna `quality = 1` a los 123 objetos del conjunto de test con mayor probabilidad, segun la regla publicada.
- Procesamiento multimodal de geometria y apariencia: usa tanto la malla (176 caracteristicas geometricas) como renderizados de las vistas del objeto.
- Extraccion de caracteristicas con codificadores visuales congelados de gran tamano (DINOv3-L, DINOv3-H+ y SigLIP2 so400m), lo que permite entrenar cabezas ligeras sin ajuste completo del backbone.
- Explicabilidad parcial: el repositorio incluye `src/explain.py` y las predicciones out-of-fold de los siete modelos en `features/`, lo que permite analizar errores por componente.
- Inferencia por lotes y generacion de un CSV de envio con el formato del leaderboard.
- Soporte de tool calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Modo de razonamiento explicito (thinking), vision general, audio o generacion de texto: no aplica.

## Casos de uso

- Control de calidad en produccion de activos 3D: integrado como paso previo al empaquetado de assets en un pipeline de estudio, el sistema marca cada malla con probabilidades de defecto y con la etiqueta `quality`, evitando que activos defectuosos lleguen al motor de juego o al catalogo.
- Curacion de datasets para modelos generativos 3D: al disponer de puntuaciones por etiqueta y de un modelo LightGBM interpretable sobre 176 caracteristicas geometricas, se puede filtrar automaticamente un corpus de mallas antes de usarlo para entrenar modelos de generacion.
- Moderacion en mercados de modelos 3D: una plataforma que recibe subidas de usuarios puede pasar cada malla por la mezcla y rechazar o marcar manualmente los objetos con alta probabilidad en las etiquetas de defecto.
- Verificacion previa a impresion 3D: los descriptores geometricos de malla (no solo los renderizados) permiten detectar geometrias no imprimibles o mal formadas antes de enviar el trabajo a la impresora, con coste de computo bajo en la rama LightGBM.
- Auditoria de digitalizaciones y escaneos: en flujos de fotogrametria o escaneo laser, donde aparecen agujeros, ruido de superficie o topologia inconsistente, la mezcla puede clasificar automaticamente los escaneos que requieren reparacion manual.
- Investigacion en representacion 3D con codificadores visuales congelados: el repositorio sirve como referencia reproducible de como reutilizar DINOv3 y SigLIP2 con cabezas ligeras y agregacion multi-capa sobre tokens de parche para una tarea de vision aplicada.
- Reproduccion de resultados de competicion: el cuaderno `aic_solution.ipynb` reconstruye el envio desde cero, descarga el repositorio y el test de los organizadores, y compara el resultado con `submissions/sub_final.csv`, lo que permite auditar la puntuacion publicada.
- Analisis de errores y ablaciones: las predicciones out-of-fold de los siete modelos en `features/` permiten medir la aportacion de cada rama (ConvNeXt frente a DINOv3 frente a SigLIP2 frente a LightGBM) sin reentrenar.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son las dos cifras globales del autor. No se identifica en la model card el nombre ni la direccion de la metrica (si menor es mejor o mayor es mejor), ni se desglosan resultados por etiqueta o por componente.

| Metrica | Resultado |
|---|---|
| Leaderboard publico (AI Challenge 2026, defectos de mallas 3D) | 15,151 |
| Validacion cruzada honesta de la mezcla | 14,83 |
| MMLU | No aplica (no es un modelo de lenguaje) |
| HumanEval | No aplica |
| GSM8K | No aplica |
| Resultados por componente o por etiqueta | No disponibles en la informacion proporcionada |

## Requisitos de hardware

- Entrenamiento documentado: una unica GPU RTX 5060 Ti con 16 GB de VRAM. El autor indica que todo el pipeline (siete modelos) se entreno en ese equipo.
- VRAM de inferencia: no publicada. Como estimacion a partir de los componentes (DINOv3-L y DINOv3-H+ a 512 px, SigLIP2 so400m a 384 px y tres ConvNeXt-Tiny), la mezcla completa en precision FP16 requeriria del orden de 10 a 16 GB si los codificadores se mantienen simultaneamente en memoria; cargando las ramas de forma secuencial el pico seria notablemente menor. Estas cifras son una estimacion propia y no un dato del repositorio.
- Rama LightGBM: requerimiento despreciable de VRAM; puede ejecutarse en CPU con 176 caracteristicas de entrada.
- GPU recomendadas: cualquier GPU con 16 GB o mas para ejecutar la mezcla completa (RTX 5060 Ti 16 GB, RTX 4080/4090, A100, H100). Para experimentacion con resoluciones o lotes reducidos, una GPU de 8-12 GB puede ser suficiente cargando las ramas por separado.
- Cabe en GPU de consumo: si, la propia RTX 5060 Ti de 16 GB usada para el entrenamiento es una GPU de consumo.
- Opciones de despliegue: no se documentan. El repositorio esta pensado para ejecutarse con PyTorch en Google Colab o en local mediante `src/predict.py`; no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. No se publican tiempos de inferencia ni tamano de lote.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos publicos comparables de deteccion de defectos en mallas 3D que cubran el mismo reto y la misma metrica. La unica comparacion posible con los datos aportados es interna, entre la mezcla completa y sus componentes, pero el repositorio no publica la puntuacion individual de cada rama.

| Sistema | Composicion | Resultado publicado | Licencia | Disponibilidad |
|---|---|---|---|---|
| ahiok/aic2026-mesh-defects (mezcla completa) | 3 ConvNeXt-Tiny + 3 cabezas sobre DINOv3-L, DINOv3-H+ y SigLIP2 so400m + LightGBM | 15,151 en leaderboard publico; 14,83 en validacion cruzada | No disponible | Repositorio HuggingFace de 4,9 GB |
| Rama ConvNeXt-Tiny aislada | CNN con backbone compartido a 224, 384 y 512 px | No disponible | No disponible | Pesos incluidos en el repositorio |
| Rama DINOv3-L / DINOv3-H+ (congelada) | MLP sobre CLS, media y desviacion de tokens de parche de cinco capas | No disponible | Sujeta a la licencia de DINOv3 | Pesos incluidos en el repositorio |
| Rama SigLIP2 so400m (congelada) | MLP sobre tokens de parche a 384 px | No disponible | Sujeta a la licencia de SigLIP2 | Pesos incluidos en el repositorio |
| Rama LightGBM | 176 caracteristicas de geometria y estadisticas de render | No disponible | No disponible | Pesos incluidos en el repositorio |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes ni conversacion multi-turno. Cualquier evaluacion de este repositorio debe plantearse como un sistema de vision y clasificacion 3D.
- Licencia no declarada: la model card no especifica licencia para el conjunto del repositorio ni para los pesos. Antes de un uso comercial es imprescindible aclararlo con el autor y revisar las licencias de los componentes de terceros incluidos (DINOv3, SigLIP2, ConvNeXt), que pueden imponer condiciones adicionales.
- Los datos de los organizadores no se redistribuyen: el cuaderno depende de una URL externa del reto para descargar el conjunto de test. Si esa fuente desaparece o cambia, la reproducibilidad queda comprometida.
- Riesgo de sobreajuste a la metrica del reto: los umbrales por etiqueta se ajustan sobre predicciones out-of-fold y la regla de `quality` asigna un numero fijo de objetos (123) como positivos, lo que ata el comportamiento a la distribucion del test de la competicion y no necesariamente se traslada a un lote de produccion con otra prevalencia de defectos.
- Desbalanceo de clases: el hecho de que solo 123 objetos del test reciban `quality = 1` sugiere una clase positiva muy minoritaria; la sensibilidad y la especificidad reales en produccion no estan documentadas.
- Sesgos del dominio: el sistema se entrena con los activos 3D del reto (categorias, estilos y proceso de render desconocidos). No hay evidencia publicada de generalizacion a otros dominios de mallas (CAD industrial, escaneos medicos, arquitectura).
- Riesgo de falsos negativos en produccion: al ser una tarea de deteccion, los errores de omision implican activos defectuosos que pasan el filtro; no se publican curvas precision-recall ni matrices de confusion por etiqueta para dimensionar ese riesgo.
- Opacidad de la metrica: no se identifica el nombre de la metrica ni su direccion, por lo que las cifras 15,151 y 14,83 no son comparables con resultados de otros trabajos.
- Documentacion en ruso y ausencia de model card formal: los metadatos de HuggingFace no rellenan pipeline, licencia ni idiomas, y no hay ficha tecnica estructurada mas alla del README.
- Coste de inferencia no medido: aunque el entrenamiento cupo en 16 GB, no se publican latencias ni throughput, lo que dificulta planificar un despliegue con requisitos de tiempo real.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ahiok/aic2026-mesh-defects
- Cuaderno de reproduccion incluido en el repositorio: `aic_solution.ipynb`
- Codigo de entrenamiento, inferencia y explicabilidad: `src/` (`predict.py`, `explain.py`)
- Configuracion de la mezcla, umbrales y regla de calidad: `reports/config_final.json`
- Predicciones out-of-fold y caracteristicas de geometria: `features/`
- Indice de offsets del archivo de datos de los organizadores: `data/tar_index.json`
- Envio al leaderboard: `submissions/sub_final.csv`
- La busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo: los resultados obtenidos corresponden a sitios de baloncesto y no guardan relacion con el repositorio.
