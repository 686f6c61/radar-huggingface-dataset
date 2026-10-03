# Btutumlu/roi-leakage

## Resumen

roi-leakage no es un modelo de lenguaje generativo, sino un repositorio de artefactos de investigación (pesos de redes convolucionales y predicciones guardadas) publicado por el usuario Btutumlu como material de reproducción del artículo "Sağlık Verilerinde Homomorfik Şifreleme ve Zafiyet Analizi" (cifrado homomórfico y análisis de vulnerabilidad en datos de salud) de B. Tutumlu, A. Uğur y V. Tataroğlu, de la Pamukkale Üniversitesi (2026). El trabajo aborda un problema de privacidad en imagen médica: cuando se aplica cifrado homomórfico selectivo por región de interés (ROI), el diagnóstico se filtra a través del contexto visible que el servidor sí puede inspeccionar; la propuesta de los autores, FoveaHE (cifrado total foveado), evita esa fuga.

El repositorio, de 3,0 GB, contiene los pesos de los clasificadores cifrables (Model D, D2 y C) en formato listo para CKKS —con la estandarización y la normalización por lotes plegadas en los pesos—, un atacante de contexto basado en ResNet-18 preentrenada en ImageNet (vistas de imagen completa y Π_ROI), una U-Net de segmentación pulmonar, las predicciones registradas de las ejecuciones del artículo y un manifiesto con tamaños y hashes SHA-256. La documentación está en turco y el repositorio declara el idioma `tr`.

Su relevancia es doble: por un lado sirve como evidencia empírica de que el cifrado parcial por ROI no protege la información diagnóstica (AUC macro de 0,9759 en RM cerebral y 0,9932 en COVID-QU-Ex atacando solo el contexto visible); por otro, ofrece modelos de referencia evaluables con TenSEAL/CKKS para investigar privacidad en pipelines de inferencia médica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes convolucionales: ResNet-18 (atacante de contexto) y U-Net (segmentación pulmonar). Modelos D, D2 y C cifrables con CKKS; no se detalla su topología interna |
| Parametros totales | no disponible (la model card no publica recuento de parámetros por fichero) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en precisión de entrenamiento y como tensores listos para CKKS) |
| Idiomas soportados | turco (`tr`) en la documentación y las etiquetas; el material son imágenes médicas, no texto |
| Licencia | no disponible (la model card no especifica licencia del repositorio; los conjuntos de datos de entrenamiento son CC BY 4.0 y CC BY-SA 4.0) |
| Formato de pesos | `.npz` (modelos cifrables y variante de resumen cifrado), `.pt` (U-Net), `.json` (manifiesto con SHA-256); predicciones guardadas en `results/preds/` |
| Tamano del repositorio | 3,0 GB |
| Libreria declarada | pytorch |
| Fecha de creacion / actualizacion | 2026-10-01 / 2026-10-03 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Los artefactos se reparten en tres familias. La primera son los modelos cifrables (`modeller/makale/fovea_<veri>_<model>_<temsil>_s<tohum>_<bölme>.npz`), correspondientes a los Model D, D2 y C del artículo, con cinco semillas por configuración; los autores indican que la estandarización y la normalización por lotes están plegadas en los propios pesos para que la inferencia sea compatible con el esquema CKKS. La segunda es la variante de resumen cifrado (`ozet_<veri>_<model>_s<tohum>_<bölme>.npz`), que combina un extractor ResNet-18 congelado con un Model D/D2 cifrado. La tercera la forman los atacantes de contexto (`modeller/saldirgan_<veri>_<görüş>_tez_s0/`), ResNet-18 preentrenadas en ImageNet y ajustadas para predecir el diagnóstico a partir de la imagen completa o de la vista Π_ROI en la que la región sensible está oculta; en RM cerebral se entrenaron cinco pliegues. Adicionalmente se incluye `lung_unet.pt`, una U-Net de enmascarado pulmonar empleada como prueba de realismo.

En cuanto a los datos, los modelos se entrenaron exclusivamente con dos conjuntos: RM de tumor cerebral (figshare 1512427, Cheng et al., PLOS ONE 2015, CC BY 4.0) y COVID-QU-Ex (Kaggle `anasmohammedtahir/covidqu`, Tahir et al., 2021, CC BY-SA 4.0). Los datos no se redistribuyen en el repositorio. Los pesos de los atacantes se reentrenaron el 1 de octubre de 2026 con la misma configuración que en el artículo, ya que las ejecuciones originales solo guardaban predicciones; la diferencia de AUC respecto a la misma semilla del artículo queda entre −0,0016 y +0,0001. Los pesos de los modelos cifrados son los del artículo y, según el autor, el reentrenamiento reproduce resultados idénticos bit a bit. No se documentan en la información disponible detalles sobre número de tokens, composición del dataset más allá de las dos fuentes citadas, ni fases de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Clasificación binaria/multiclase de imágenes médicas a partir de representaciones foveadas cifradas (Model D, D2 y C), con pesos adaptados para operar bajo CKKS.
- Clasificación diagnóstica sobre imagen completa o sobre la vista Π_ROI mediante el atacante ResNet-18: sirve para auditar cuánta información se filtra cuando solo se cifra la región de interés.
- Segmentación de pulmón en radiografía de tórax con la U-Net incluida (Dice de validación 0,978 en COVID-QU-Ex), empleada como prueba de realismo del pipeline.
- Extracción de características con un ResNet-18 congelado como resumen previo a la clasificación cifrada (enfoque `ozet`).
- Reproducción de tablas del artículo a partir de las predicciones almacenadas en `results/preds/` y de los resúmenes de métricas en `results/tables/metrikler_ozet.md`.
- Verificación de integridad de los ficheros mediante el manifiesto con SHA-256 (`modeller/hf_manifest.json`) y el script `python -m boruhatti.modelleri_indir`.
- No dispone de generación de texto, razonamiento, código, tool calling, capacidades de agente ni procesamiento multilingüe: no es un modelo de lenguaje.

## Casos de uso

- Auditoría de fugas en pipelines de cifrado selectivo: cargando el atacante de contexto y la vista Π_ROI se puede medir cuantitativamente cuánta señal diagnóstica permanece visible cuando solo se cifra la ROI, y compararla con los valores de referencia del artículo (AUC 0,9759 en RM cerebral y 0,9932 en COVID-QU-Ex).
- Evaluación de esquemas de cifrado total foveado: los pesos de FoveaHE F32_G16 + Model D/D2 permiten reproducir el coste en utilidad de esta alternativa (AUC 0,948 y 0,954 respectivamente) frente al cifrado selectivo.
- Pruebas de integración con TenSEAL/CKKS: los `.npz` con normalización plegada están pensados para ejecutarse sobre tensores cifrados, por lo que sirven como banco de pruebas para validar operaciones homomórficas en una CNN real.
- Segmentación pulmonar en radiografías de tórax: la U-Net incluida puede reutilizarse como paso previo para aislar el campo pulmonar antes de clasificar o de definir la ROI en experimentos de privacidad.
- Reproducibilidad académica: el repositorio permite recalcular las tablas II, III, V y VIII del artículo desde `results/preds/` sin reentrenar, útil para revisión por pares o para trabajos que comparen metodologías de fuga de información.
- Docencia e investigación en privacidad de datos sanitarios: el conjunto atacante + modelo cifrado es un ejemplo completo y ejecutable de amenaza de inferencia por contexto, adecuado para prácticas de posgrado.
- Comparación de estrategias de representación (resumen con ResNet-18 congelado frente a foveado) dentro de un mismo banco de pruebas médico, manteniendo constantes los conjuntos de datos y las semillas.

## Benchmarks y rendimiento

Resultados de AUC macro publicados en la model card. Las columnas "artículo (5 semillas)" y "pesos del repositorio" corresponden a las ejecuciones originales y a los pesos distribuidos, respectivamente.

| Conjunto | Modelo | Entrada | Artículo (5 semillas) | Pesos del repositorio |
|---|---|---|---|---|
| RM cerebral | Atacante de contexto (ResNet-18) | Imagen vista por el servidor en Π_ROI (tumor oculto) | 0,9759 ± 0,0007 | 0,9743 (semilla 0, reentrenado) |
| RM cerebral | Atacante de contexto (ResNet-18) | Imagen completa (sin cifrar) | 0,9843 ± 0,0012 | 0,9842 (semilla 0, reentrenado) |
| COVID-QU-Ex | Atacante de contexto (ResNet-18) | Imagen vista por el servidor en Π_ROI (pulmones ocultos) | 0,9932 ± 0,0001 | 0,9934 (semilla 0, reentrenado) |
| COVID-QU-Ex | Atacante de contexto (ResNet-18) | Imagen completa (sin cifrar) | 0,9966 ± 0,0002 | 0,9967 (semilla 0, reentrenado) |
| RM cerebral | FoveaHE F32_G16 + Model D | Representación foveada cifrada | 0,948 | pesos del artículo (5 semillas) |
| COVID-QU-Ex | FoveaHE F32_G16 + Model D2 | Representación foveada cifrada | 0,954 | pesos del artículo (5 semillas) |

Métrica adicional documentada: la U-Net de pulmón alcanza un Dice de validación de 0,978 en COVID-QU-Ex. Precisión, sensibilidad, F1 y matrices de confusión están en `results/tables/metrikler_ozet.md`. No se han publicado resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K, etc.) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- Almacenamiento: 3,0 GB para el repositorio completo; el script `python -m boruhatti.modelleri_indir` descarga y verifica todos los ficheros por SHA-256.
- VRAM para inferencia: no disponible en la información proporcionada. Los tamaños de fichero de cada modelo no se detallan en la model card más allá del total del repositorio.
- GPU recomendadas: no disponible. No obstante, el atacante y el extractor son ResNet-18 y la U-Net es una red de segmentación ligera, por lo que en principio son ejecutables en GPU de consumo; esta afirmación es una estimación editorial, no un dato del autor.
- GPU de consumo: no confirmado por el autor; no se especifica ni VRAM mínima ni modelo de tarjeta soportado.
- Despliegue: el repositorio está orientado a PyTorch y a TenSEAL/CKKS para la parte homomórfica. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este material.
- Latencia y throughput: no disponibles. El coste dominante en el escenario cifrado son las operaciones CKKS, que no están cuantificadas en la información facilitada.
- Dependencias de reproducción: el código y los pasos están en https://github.com/Yabgun/roi-leakage; el contrato de entrada para imágenes nuevas está en `docs/GIRDI_SOZLESMESI.md` del repositorio de código.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica artefactos comparables de terceros (repositorios de pesos con el mismo objetivo de análisis de fuga bajo cifrado homomórfico). La única comparación disponible es interna al propio trabajo y figura en la tabla de benchmarks:

| Estrategia evaluada en el artículo | AUC macro RM cerebral | AUC macro COVID-QU-Ex |
|---|---|---|
| Atacante sobre Π_ROI (cifrado selectivo, tumor/pulmones ocultos) | 0,9759 | 0,9932 |
| Atacante sobre imagen completa (sin cifrar) | 0,9843 | 0,9966 |
| FoveaHE F32_G16 + Model D / D2 (cifrado total foveado) | 0,948 | 0,954 |

La lectura es que el cifrado selectivo apenas reduce la capacidad del atacante (la caída respecto a la imagen completa es de 0,0084 en RM y 0,0034 en COVID-QU-Ex), mientras que FoveaHE sí introduce una pérdida de utilidad apreciable a cambio de eliminar la fuga por contexto.

## Limitaciones y advertencias

- Uso exclusivamente investigador: la model card indica explícitamente que los modelos no pueden emplearse para decisión clínica.
- Generalización muy limitada: cada modelo se ha entrenado solo con dos conjuntos de datos (RM de tumor cerebral y COVID-QU-Ex); no hay evidencia de comportamiento en otras modalidades, equipos o poblaciones.
- Sesgos conocidos: no documentados en la información disponible; al depender de dos conjuntos concretos, cabe esperar sesgos de selección y de centro sanitario, pero no se cuantifican.
- Riesgo de error diagnóstico: no se publican intervalos de confianza por subgrupo ni análisis de calibración más allá de las métricas agregadas; la sensibilidad y la especificidad completas están en `results/tables/metrikler_ozet.md`, fuera de la información aquí recogida.
- Licencia del repositorio no especificada: no se puede confirmar si el uso comercial de los pesos está permitido. Los datos de origen sí tienen licencias conocidas (CC BY 4.0 para figshare 1512427 y CC BY-SA 4.0 para COVID-QU-Ex), lo que puede condicionar trabajos derivados.
- Idioma y documentación: la model card y el código están en turco; no hay traducción oficial, lo que dificulta la reproducción a equipos no turcoparlantes.
- Los datos de entrenamiento no se redistribuyen; hay que descargarlos de sus fuentes originales, con la posible variación de versiones que ello implica.
- Pesos del atacante reentrenados: las cifras publicadas para esos modelos en el repositorio difieren ligeramente de las del artículo (−0,0016 a +0,0001 de AUC), de modo que una comparación estricta con las tablas originales exige tenerlo en cuenta.
- No aplican las advertencias típicas de modelos generativos (alucinación de texto, tool calling, contexto), porque este repositorio no contiene un modelo de lenguaje.
- Los resultados de búsqueda web recuperados no guardan relación con este repositorio: tratan sobre retorno de inversión (ROI) en educación a distancia y analítica de datos, y comparten el acrónimo pero no el tema.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Btutumlu/roi-leakage
- Código y pasos de reproducción: https://github.com/Yabgun/roi-leakage
- Conjunto de datos de RM de tumor cerebral (figshare 1512427; Cheng et al., PLOS ONE 2015): https://figshare.com/articles/dataset/brain_tumor_dataset/1512427
- Conjunto de datos COVID-QU-Ex (Kaggle `anasmohammedtahir/covidqu`; Tahir et al., 2021): https://www.kaggle.com/datasets/anasmohammedtahir/covidqu
- Artículo de referencia de la U-Net de pulmón dentro del repositorio: `modeller/makale/lung_unet.pt` (Dice de validación 0,978)
- Detalle de métricas del artículo: `results/tables/metrikler_ozet.md` (dentro del repositorio)
- Manifiesto de integridad con SHA-256: `modeller/hf_manifest.json` (dentro del repositorio)
- Contrato de entrada para nuevas imágenes: `docs/GIRDI_SOZLESMESI.md` (dentro del repositorio de código)
- No se han encontrado en la búsqueda web enlaces adicionales (paper, blog o demo) relacionados con este modelo.
