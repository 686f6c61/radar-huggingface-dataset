# alfinwilliam30/totalsegmentator-2.13-lctsc-4scan-update

## Resumen

TotalSegmentator 2.13.0 (tarea `total`) actualizado con cuatro escáneres CT torácicos etiquetados de la colección Lung CT Segmentation Challenge 2017 (LCTSC). El autor, alfinwilliam30, publica tres versiones independientes (`draw_S1`, `draw_S2`, `draw_S3`) del modelo, cada una reentrenada con los cuatro pacientes de entrenamiento de una institución distinta del LCTSC. El objetivo es mejorar la segmentación de esófago, corazón y ambos pulmones en CT torácicos, estructuras críticas en planificación de radioterapia.

El modelo se distribuye en el formato propio de TotalSegmentator: dos submodelos nnU-Net (parte 1, órganos, y parte 3, cardíaco) que sustituyen a los pesos originales de TotalSegmentator 2.13.0. Las partes restantes (vértebras, músculos, costillas) no se reentrenan y se descargan desde el repositorio oficial de TotalSegmentator. El repositorio ocupa 0,8 GB y se publica bajo licencia Apache-2.0.

La relevancia es acotada y muy específica: se trata de un experimento de investigación con lecturas preinscritas (osf.io/d6ayj y osf.io/69kwv) que documenta una mejora medida en Dice sobre conjuntos de test internos. No es un modelo de propósito general ni un producto clínico; su interés reside en la evaluación rigurosa del efecto de reentrenar con datos LCTSC sobre la definición de contorno cardíaco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nnU-Net (dos submodelos: `Dataset291_TotalSegmentator_part1_organs_1559subj` y `Dataset293_TotalSegmentator_part3_cardiac_1559subj`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imágenes, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada: volúmenes CT en NIfTI) |
| Licencia | Apache-2.0 |
| Formato de pesos | checkpoints nnU-Net (layout de carpetas de TotalSegmentator); no se especifican formatos adicionales |
| Tamano del repositorio | 0,8 GB |
| Modalidad | CT (tomografía computarizada) |
| Estructuras diana reentrenadas | esófago, corazón, pulmón izquierdo, pulmón derecho |
| Trainer | `nnUNetTrainerNoMirroring` |
| Epocas | 50 |
| Learning rate | 1e-4 |
| Semillas de entrenamiento | una por cada draw (tres en total) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura nnU-Net, el framework de segmentación médica auto-configurable que TotalSegmentator emplea como base. Se reentrenan únicamente dos de los submodelos de la tarea `total`: la parte 1 (órganos, que incluye esófago y pulmones) y la parte 3 (cardíaco, que incluye el corazón). Las demás partes (vértebras, músculos, costillas) conservan los pesos originales de TotalSegmentator 2.13.0.

El entrenamiento parte de los pesos de TotalSegmentator 2.13.0 y utiliza un learning rate de 1e-4 durante 50 épocas con el trainer `nnUNetTrainerNoMirroring`. Cada draw emplea los cuatro pacientes de entrenamiento de una institución LCTSC distinta y una única semilla de entrenamiento. Los objetivos de entrenamiento son compuestos: los contornos de referencia LCTSC para esófago, corazón y ambos pulmones, y la propia salida de TotalSegmentator para el resto de clases de las dos partes. Los checkpoints son idénticos byte a byte a los modelos congelados antes de las lecturas preinscritas (verificable mediante `SHA256SUMS`). No se documenta uso de RLHF ni DPO, algo esperable en un modelo de segmentación.

## Capacidades

- Segmentación de estructuras anatómicas en CT torácicos, con foco en esófago, corazón, pulmón izquierdo y pulmón derecho.
- Segmentación del resto de órganos de la parte 1 y de las estructuras cardíacas de la parte 3 de TotalSegmentator (no evaluadas contra referencia en este trabajo).
- Integración directa con la CLI de TotalSegmentator 2.13.0 mediante la variable de entorno `TOTALSEG_HOME_DIR`.
- Descarga automática de las partes no incluidas (vértebras, músculos, costillas) desde el repositorio oficial.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de imagen médica.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Planificación de radioterapia torácica: el modelo permite delimitar esófago, corazón y pulmones en CT de planificación, estructuras de riesgo habituales en tratamientos de cáncer de pulmón y esófago. La mejora documentada en corazón (+16,96 puntos Dice en LCTSC test) es especialmente relevante para restricciones de dosis cardíaca.
- Investigación en segmentación cardíaca: útil para estudiar cómo distintas definiciones de contorno cardíaco afectan a métricas de segmentación, dado que el modelo aproxima la definición LCTSC (el corazón de TotalSegmentator original es un 27% más pequeño en volumen mediano, ratio 0,73).
- Reproducibilidad de estudios: los tres draws con semillas fijas y checkpoints congelados permiten replicar las lecturas registradas en osf.io/d6ayj y osf.io/69kwv.
- Evaluación comparativa de segmentadores: sirve como referencia para comparar el efecto de reentrenar TotalSegmentator con datos institucionales frente a los pesos originales.
- Desarrollo de pipelines de segmentación en investigación oncológica: al integrarse con TotalSegmentator, puede incorporarse a flujos existentes que ya usan la tarea `total` sin cambiar de framework.
- Docencia y experimentación con nnU-Net: ejemplo documentado de ajuste fino de un modelo preentrenado con un conjunto pequeño (cuatro pacientes por draw) y objetivos compuestos.

## Benchmarks y rendimiento

Resultados de las lecturas registradas (puntos Dice, diferencia entre el modelo actualizado y TotalSegmentator 2.13.0 sin modificar; media de los tres draws; intervalos bootstrap cruzados de dos niveles al 95%):

| Conjunto de test | Estructuras | Cambio (Dice) | Pacientes mejorados |
|---|---|---|---|
| LCTSC test, 24 pacientes (osf.io/d6ayj) | esófago, corazón, ambos pulmones | +5,47 [+4,84; +6,06] | 24 de 24 |
| LCTSC-T23, 23 pacientes (osf.io/69kwv) | esófago, ambos pulmones (corazón excluido) | +1,23 [+0,74; +1,69] | 21 de 23 |
| LCTSC-T23 | esófago, corazón, ambos pulmones | +4,71 [+4,26; +5,16] | 23 de 23 |

Desglose por estructura en LCTSC test:

| Estructura | Cambio (Dice) |
|---|---|
| Esófago | +2,37 [+0,48; +4,11] |
| Corazón | +16,96 [+15,60; +18,27] |
| Pulmón izquierdo | +1,56 [+0,89; +2,50] |
| Pulmón derecho | +0,97 [+0,46; +1,57] |

Ninguna estructura resultó inferior en el margen preestablecido de -1,0. La médula espinal no se reentrenó y es idéntica a la salida de TotalSegmentator.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende de la configuración nnU-Net y del tamaño del volumen CT.
- GPU recomendadas: no disponible. Los modelos nnU-Net de TotalSegmentator suelen ejecutarse en GPU con al menos 8-12 GB de VRAM, pero este dato no se confirma en la model card.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible.
- Opciones de despliegue: TotalSegmentator 2.13.0 vía pip (`pip install TotalSegmentator==2.13.0`), apuntando `TOTALSEG_HOME_DIR` al directorio del draw correspondiente. No se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Estructuras diana | Licencia | Disponibilidad |
|---|---|---|---|---|
| TotalSegmentator 2.13.0 (original) | nnU-Net, tarea `total` | Órganos torácicos y abdominales, vértebras, músculos, costillas | Apache-2.0 | Hugging Face / GitHub oficial |
| Este modelo (`totalsegmentator-2.13-lctsc-4scan-update`) | nnU-Net, partes 1 y 3 reentrenadas | Esófago, corazón, pulmones (con definición LCTSC) | Apache-2.0 | Hugging Face (alfinwilliam30) |
| LCTSC reference contours | Anotación manual de referencia | Esófago, corazón, pulmones | No aplica (dataset) | LCTSC 2017 |

No se dispone de datos de benchmarks frente a otros segmentadores (por ejemplo, modelos específicos de radioterapia) en la información proporcionada.

## Limitaciones y advertencias

- Uso exclusivamente de investigación. No es un dispositivo médico ni está aprobado para uso clínico.
- Toda la evaluación es interna: los pacientes de test provienen de las mismas tres instituciones que los de entrenamiento, por lo que la generalización a otros centros no está demostrada.
- Aproximadamente el 80% de la mejora en las cuatro estructuras corresponde al corazón. El modelo aprende la definición de contorno cardíaco de LCTSC; un departamento con otra definición no debería esperar esta ganancia.
- Las demás clases de las partes 291 y 293 se mantuvieron como objetivos de entrenamiento pero no se evaluaron contra etiquetas de referencia, por lo que pueden haber cambiado sin control de calidad documentado.
- Solo tres draws con una semilla de entrenamiento cada uno; la variabilidad entre semillas no está caracterizada.
- Los modelos se entrenaron antes de enviar el registro LCTSC (hecho divulgado en el propio registro).
- No se reportan endpoints de dosis, tiempo de edición ni lectura por radiólogos.
- Licencia Apache-2.0 permite uso comercial, pero las limitaciones anteriores desaconsejan cualquier aplicación clínica directa sin validación externa.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de segmentaciones erróneas en anatomías fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alfinwilliam30/totalsegmentator-2.13-lctsc-4scan-update
- Registro LCTSC test: https://osf.io/d6ayj
- Registro LCTSC-T23: https://osf.io/69kwv
- TotalSegmentator (repositorio oficial): no disponible en la información proporcionada
- Paper del modelo: pendiente de publicación según la model card ("to be added")
