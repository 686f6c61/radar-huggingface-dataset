# OneScience-Group/WavyChannel-RF-ThermoHydraulics

## Resumen

WavyChannel-RF-ThermoHydraulics es un paquete de inferencia publicado por OneScience-Group que reproduce un experimento de surrogate CFD basado en Random Forest para un canal ondulado parcialmente poroso. El modelo predice dos magnitudes termohidraulicas —el numero de Nusselt medio (`Nuavg`) y la caida de presion (`DelP_Pa`)— a partir de siete caracteristicas de operacion y geometria. No es un modelo de lenguaje ni una red neuronal profunda: se trata de dos bosques aleatorios independientes de 800 arboles cada uno, serializados con joblib.

El paquete esta pensado para reproducir de forma fiel el suplemento de datos version 4 de los autores originales (Kumar y Pandey, Mendeley Data) y el articulo asociado publicado en 2026. La relevancia actual reside en que ejemplifica el patron de publicacion de surrogates cientificos reproducibles: pesos fijados, split de entrenamiento/prueba congelado, hash SHA256 publicado y resultados de test replicables, en lugar de un modelo generativo.

El repositorio ocupa aproximadamente 0,1 GB y contiene el bundle `weight/best_model.pth`, que a pesar de la extension es un artefacto joblib de scikit-learn, no un state dict de PyTorch. Se entreno sobre 3.686 muestras y se evaluo sobre 922 muestras con un split fijo 80/20.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (dos bosques independientes, uno por target) |
| Parametros totales | no disponible (800 arboles por bosque; numero de nodos no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, 7 features de entrada) |
| Tipos de cuantizacion | no disponible (no aplica; serializacion joblib) |
| Idiomas soportados | en (documentacion y metadatos) |
| Licencia | Apache 2.0 (codigo del modelo); datos CC BY 4.0 |
| Formato de pesos | joblib (fichero `weight/best_model.pth`, extension enganosa) |

## Arquitectura y entrenamiento

La arquitectura es un ensemble de arboles de decision con bagging: dos Random Forest independientes, cada uno con 800 arboles, ajustados sobre las mismas 3.686 muestras pero con targets distintos (`Nuavg` y `DelP_Pa`). La entrada son siete features de operacion y geometria del canal ondulado parcialmente poroso. No hay epochs ni fases de preentrenamiento: se trata de un unico ajuste completo por target.

El entrenamiento se realizo sobre el split fijo 80/20 definido por los autores originales, con la union por `case_uid` y las etiquetas train/test congeladas. El paquete publicado modifica unicamente las rutas de datos en los metadatos; los bosques ajustados son identicos a la ejecucion original. El SHA256 del bundle publicado es `d43fe39fc6de27aa26eeb063a8b81c2089150e09a7ea21db1e67d8f136aeab17`, mientras que el checkpoint de entrenamiento original tenia `dad800c2ee630455ac421b81c5fc38a0a584c065adca720d0c534d2df065e421`. Se requiere scikit-learn 1.6.0 para cargar el joblib correctamente.

## Capacidades

- Prediccion de transferencia de calor: estima el numero de Nusselt medio (`Nuavg`) para una configuracion dada.
- Prediccion de caida de presion: estima `DelP_Pa` en pascales.
- Inferencia tabular sobre siete features de operacion y geometria.
- Reproduccion determinista del experimento fijado (mismo split, mismos hiperparametros, mismos pesos).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (solo metadatos en ingles).
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Screening de diseno de intercambiadores: dado un conjunto de geometrias candidatas (amplitud de onda, porosidad parcial, etc.), el modelo estima rapidamente `Nuavg` y `DelP_Pa` para descartar configuraciones antes de lanzar simulaciones CFD completas.
- Optimizacion de parametros operativos: evaluar combinaciones de caudal, temperatura de entrada y geometria dentro del rango de entrenamiento para localizar regiones de compromiso entre transferencia de calor y perdida de carga.
- Validacion de pipelines CFD: usar el surrogate como referencia rapida para detectar desviaciones anomalas en nuevas simulaciones de alta fidelidad.
- Docencia y formacion: ilustrar el flujo completo de un surrogate cientifico reproducible (datos, split, ajuste, evaluacion, hash) en cursos de ML aplicado a ingenieria termica.
- Benchmarking de metodos: servir como baseline tabular frente a surrogates neuronales (MLP, GNN, PINN) en el mismo problema de canal ondulado poroso.
- Reproducibilidad de publicaciones: verificar los resultados del articulo asociado ejecutando `scripts/train.py`, `scripts/inference.py` y `scripts/result.py` con el split fijo.
- Integracion en pipelines de CI cientifico: comprobar que nuevas versiones de scikit-learn o de los datos no alteran las predicciones respecto al bundle publicado.

## Benchmarks y rendimiento

Resultados de test reproducidos frente a los reportados en el suplemento de datos de los autores:

| Target | Metrica | Reproducido | Suplemento de datos |
|---|---|---|---|
| `Nuavg` | MAE | 0,083817 | 0,083819 |
| `Nuavg` | RMSE | 0,276695 | 0,276695 |
| `DelP_Pa` | MAE | 0,640271 Pa | 0,639853 Pa |
| `DelP_Pa` | RMSE | 2,000163 Pa | 1,997940 Pa |

Las diferencias son del orden de 1e-5 a 4e-4, atribuibles a variaciones de entorno (version de scikit-learn, precision numerica). No se han publicado en la informacion disponible resultados frente a otros modelos (MLP, XGBoost, PINN, etc.).

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU.
- GPU: no necesaria. Cualquier CPU moderna es suficiente para cargar dos bosques de 800 arboles y evaluar lotes de cientos de muestras.
- Memoria RAM: el bundle ocupa aproximadamente 0,1 GB en disco; la carga en memoria es del mismo orden.
- Cabe en cualquier portatil consumer; no requiere GPU dedicada ni aceleradores.
- Despliegue: script Python con scikit-learn 1.6.0 y joblib; no hay soporte nativo para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a modelos tabulares).
- Latencia y throughput: no publicados. Por la naturaleza del modelo (Random Forest con 800 arboles y 7 features) se espera inferencia en el orden de microsegundos a milisegundos por muestra en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de surrogates publicados comparables con metricas equiparables sobre el mismo dataset. Se indica "no disponible".

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WavyChannel-RF-ThermoHydraulics | Random Forest tabular | no disponible | no aplica | Apache 2.0 | Hugging Face |
| Alternativas neuronales (MLP, PINN, GNN) | no disponible | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo es valido dentro del rango de parametros cubierto por los datos de entrenamiento; extrapolar fuera de ese dominio no esta garantizado.
- No es un modelo de lenguaje: no genera texto, no razona y no admite prompts.
- La extension `.pth` del fichero de pesos es enganosa; es un bundle joblib. Cargarlo con `torch.load` fallara.
- Requiere scikit-learn 1.6.0 exacto; otras versiones pueden alterar las predicciones o impedir la carga.
- El split train/test esta congelado por diseño; regenerar el split invalida la reproducibilidad y los resultados publicados.
- Los ficheros JSON de validacion archivados hacen referencia al hash del fichero de entrenamiento original; las predicciones recargadas desde el bundle publicado deben verificarse por separado.
- Solo cargar el modelo desde fuentes de confianza: joblib puede ejecutar codigo arbitrario al deserializar.
- Licencia del codigo Apache 2.0 y licencia de los datos CC BY 4.0 son independientes; el uso comercial de los datos requiere cumplir la atribucion correspondiente.
- No hay informacion publicada sobre sesgos, calibracion fuera de distribucion ni intervalos de confianza de las predicciones.
- El repositorio no incluye los CSV de datos; hay que descargarlos de ModelScope, lo que anade una dependencia externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OneScience-Group/WavyChannel-RF-ThermoHydraulics
- Dataset en ModelScope: https://www.modelscope.cn/datasets/OneScience/WavyChannel-ThermoHydraulics
- Datos originales (Mendeley Data v4): https://data.mendeley.com/datasets/5b5n3cg32n/4
- DOI de los datos: https://doi.org/10.17632/5b5n3cg32n.4
- Paper asociado: https://doi.org/10.1016/j.aitf.2026.100051
- Repositorio principal en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio de skills en GitHub: https://github.com/onescience-ai/oneskills
- Repositorio principal en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio de skills en Gitee: https://gitee.com/onescience-ai/oneskills
