# maozee/model_kcat_lgbm

## Resumen

`maozee/model_kcat_lgbm` es un modelo de regresión desarrollado por el usuario maozee y publicado en HuggingFace bajo licencia MIT. No se trata de un modelo de lenguaje, sino de un sistema de machine learning clásico basado en LightGBM que predice dos constantes cinéticas enzimáticas —el número de recambio (kcat) y la constante de Michaelis-Menten (Km), ambos en escala logarítmica base 10— para pares enzima-sustrato definidos por un identificador, un SMILES del sustrato y la secuencia aminoacídica de la enzima. El modelo forma parte de una competición o leaderboard bajo el tag "leak-curber".

Técnicamente, combina dos familias de características: descriptores moleculares del sustrato calculados con RDKit (fingerprints de Morgan de tipo count con radio 2 y 1024 bits, claves MACCS y descriptores 2D) y representaciones de la proteína obtenidas del modelo de lenguaje proteico ESM-2 en su variante de 8 millones de parámetros (`esm2_t6_8M_UR50D`), junto con descriptores de composición aminoacídica y de dipéptidos. Es relevante como ejemplo de arquitectura híbrida que une modelos de lenguaje proteicos preentrenados con gradient boosting, ejecutándose íntegramente en CPU y sin conexión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (gradient boosting de arboles), un regresor por objetivo, sobre caracteristicas ESM-2 + RDKit |
| Parametros totales | no disponible (modelo de arboles; el extractor ESM-2 t6 8M aporta ~8 M de parametros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (secuencias proteicas truncadas a los primeros 1022 residuos) |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | no aplicable (entradas: SMILES y secuencias de aminoacidos) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0,1 GB con pesos ESM-2 en `weights/esm2_t6_8M.pt` y modelos LightGBM entrenados) |

## Arquitectura y entrenamiento

El sistema entrena un regresor LightGBM independiente para cada objetivo (`log10_kcat` y `log10_km`). Las caracteristicas del sustrato se derivan con RDKit: fingerprint de Morgan de tipo count con radio 2 y 1024 bits, claves MACCS (167 bits) y descriptores 2D estandar de RDKit. Las caracteristicas de la enzima provienen del embedding de la ultima capa de ESM-2 (`esm2_t6_8M_UR50D`), agregado por media (mean pooling) sobre los primeros 1022 residuos, al que se anaden el logaritmo de la longitud de la secuencia y la composicion en aminoacidos y dipéptidos.

El entrenamiento se realizo unicamente sobre el archivo `train.parquet` proporcionado por la competicion. La seleccion del modelo empleo una division homologia-aware: las secuencias de entrenamiento se agruparon por similitud de coseno sobre 3-meros con umbral > 0,3 y los clusters completos se retuvieron para validacion, estrategia que reproduce la baja similitud entre las proteinas de validacion publica y las de entrenamiento y evita fuga de informacion por homologia. No hay informacion sobre hiperparametros concretos de LightGBM ni metricas de validacion.

## Capacidades

- Prediccion de `log10_kcat` para pares enzima-sustrato a partir de SMILES y secuencia proteica.
- Prediccion de `log10_km` para los mismos pares.
- Featurizacion molecular completa con RDKit (Morgan count, MACCS, descriptores 2D).
- Embeddings proteicos mediante ESM-2 de 8 millones de parametros, ejecutado en PyTorch puro sin dependencia de la libreria `transformers`.
- Inferencia completamente offline y solo en CPU, empaquetada en Docker con limites de 2 CPUs y 16 GB de RAM.
- Adecuado para submission automatica en leaderboards/competiciones cientificas.

## Casos de uso

- Participacion en competiciones de bioquimica computacional: el modelo esta disenado para generar predicciones sobre un conjunto de validacion en formato parquet y emitir un CSV de predicciones, listo para envio al leaderboard de kcat/Km.
- Estimacion de cinetica enzimatica en diseno de enzimas: permite priorizar mutantes o enzimas candidatas estimando su numero de recambio (kcat) antes de sintetizarlas, reduciendo experimentos de laboratorio.
- Triaje de pares enzima-sustrato en biologia sintetica: dado un sustrato de interes (SMILES) y un panel de enzimas candidatas, se pueden ordenar por Km previsto para seleccionar las de mayor afinidad aparente.
- Modelado de rutas metabolicas: los valores de kcat y Km predichos pueden alimentar modelos de flujo metabolico cinetico cuando no existen medidas experimentales.
- Plantilla metodologica reutilizable: el patron "embeddings ESM-2 + descriptores RDKit + LightGBM" es replicable para otras tareas de regresion proteico-quimica (estabilidad, solubilidad, toxicidad).
- Ejecucion en entornos restringidos: al funcionar offline y solo con CPU, encaja en entornos de evaluacion aislados (sin red) o infraestructura sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de validacion (MAE, RMSE, R2) ni posicion en el leaderboard.

## Requisitos de hardware

- Ejecucion exclusivamente en CPU; no requiere GPU.
- Recursos definidos en el contenedor oficial: 2 CPUs y 16 GB de memoria RAM.
- Espacio en disco: repositorio de aproximadamente 0,1 GB.
- Despliegue mediante Docker (imagen construida para `linux/amd64`), con red desactivada (`--network none`) para garantizar inferencia offline.
- No aplican estimaciones de VRAM ni de throughput de GPU; no hay datos publicos de latencia.
- Dependencias minimas: PyTorch para ejecutar ESM-2 y LightGBM para la inferencia de los regresores; no requiere la libreria `transformers`.

## Comparativa con modelos similares

| Aspecto | model_kcat_lgbm | Enfoques DL end-to-end (p. ej. DLKcat) | Enfoques solo secuencia (PLM + MLP) |
|---|---|---|---|
| Tipo de modelo | LightGBM sobre features ESM-2 + RDKit | Redes neuronales profundas sobre secuencia y grafo molecular | Modelo de lenguaje proteico fino ajustado |
| Entrada | SMILES + secuencia | Secuencia + sustrato | Secuencia (+ sustrato segun variante) |
| Requisitos de hardware | CPU, 16 GB RAM | GPU habitualmente | GPU habitualmente |
| Licencia | MIT | no disponible | no disponible |
| Interpretabilidad | Alta (importancia de features de arboles) | Baja | Baja |

No se dispone de numeros de rendimiento comparables publicados para este modelo.

## Limitaciones y advertencias

- Modelo de regresion especializado: solo predice kcat y Km; no genera texto, codigo ni admite instrucciones en lenguaje natural.
- Las secuencias proteicas se truncan a los primeros 1022 residuos, lo que puede degradar las predicciones para enzimas muy largas.
- Entrenado unicamente sobre el `train.parquet` de la competicion: su generalizacion fuera de esa distribucion (otras familias enzimaticas, organismos o tipos de sustrato) no esta verificada.
- No hay metricas de validacion ni benchmarks publicados en la model card, por lo que la calidad de las predicciones debe validarse de forma independiente antes de cualquier uso cientifico o industrial.
- Al tratarse de predicciones cineticas, existe riesgo de error sistematico en regiones escasas de datos; los valores de kcat/Km predichos no deben usarse como sustituto de medidas experimentales sin validacion.
- La licencia MIT es permisiva para uso comercial, pero conviene verificar la licencia de los datos de entrenamiento de la competicion, que no se detalla en la model card.
- La imagen Docker esta construida para `linux/amd64`; en otras arquitecturas puede requerirse emulacion o recompilacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maozee/model_kcat_lgbm
- ESM-2 (Facebook/Meta, esm2_t6_8M_UR50D): https://huggingface.co/facebook/esm2_t6_8M_UR50D
- LightGBM: https://github.com/microsoft/LightGBM
- RDKit (quimica computacional): https://www.rdkit.org/
- Paper de ESM-2 (Lin et al., 2022): https://www.science.org/doi/10.1126/science.ade2574
- No se han encontrado otros enlaces relevantes (blog, demo o repositorio separado) en la informacion disponible.
