# pyaging/yingadaptage

## Resumen

`yingadaptage` es un reloj epigenetico (aging clock) publicado en el ecosistema pyaging que predice la edad epigenetica adaptativa a partir de datos de metilacion de ADN en sangre completa humana. No es un modelo de lenguaje ni una red neuronal generativa: es una regresion elastic net con pesos de penalizacion derivados de puntuaciones de causalidad EWMR (Epigenetic Wide Mendelian Randomization), restringida a CpGs asociados a adaptacion y proteccion frente al envejecimiento. Lo desarrolla el equipo de pyaging (empaquetado y distribucion) a partir del trabajo original de Ying, Liu, Tarkhov et al. publicado en Nature Aging en 2024.

Su relevancia radica en el enfoque causal: a diferencia de los relojes epigeneticos clasicos, que mezclan senales de dano y de adaptacion en una sola prediccion de edad, este modelo aisla la componente adaptativa/protectora. Eso permite separar el envejecimiento biologico "perjudicial" del "compensatorio", una distincion con implicaciones directas en investigación traslacional, ensayos de intervencion antienvejecimiento y biomarcadores de resiliencia.

El repositorio es de tamano practicamente nulo (0.0 GB), coherente con un modelo de regresion de coeficientes dispersos sobre un conjunto reducido de CpGs. La licencia del codigo de pyaging es MIT, aunque la model card advierte explicitamente que los pesos retienen los terminos de los autores originales y la licencia de pyaging no los relicencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion elastic net con pesos de penalizacion ponderados por causalidad (EWMR) |
| Parametros totales | No disponible (coeficientes sobre un subconjunto de CpGs; el repositorio ocupa 0.0 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica; entrada = vector de betas de metilacion) |
| Tipos de cuantizacion | No disponible (no aplica a regresion lineal dispersa) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | MIT para el codigo de pyaging; pesos sujetos a los terminos de los autores originales |
| Formato de pesos | No disponible en la informacion proporcionada; distribuido via libreria `pyaging` |

## Arquitectura y entrenamiento

El modelo es una regresion elastic net, es decir, una regresion lineal regularizada con penalizacion combinada L1/L2, aplicada sobre valores beta de metilacion de ADN. La innovacion no esta en la arquitectura —deliberadamente simple e interpretable— sino en la construccion del vector de penalizacion: cada caracteristica (CpG) recibe un peso derivado de su puntuacion de causalidad EWMR, de modo que el modelo favorece CpGs con evidencia causal de efecto adaptativo o protector y penaliza los asociados a dano. Ademas, el conjunto de caracteristicas se restringe a CpGs relacionados con adaptacion y proteccion, lo que reduce dimensionalidad y mejora la interpretabilidad biologica.

Los datos de entrenamiento son muestras de metilacion de ADN de sangre completa de Homo sapiens, con edad como variable objetivo. La informacion proporcionada no detalla el numero exacto de muestras, la composicion del dataset ni si hubo validacion en cohortes externas; esos datos deben consultarse en la publicacion de Nature Aging citada. No se emplean tecnicas de RLHF, DPO ni decodificacion especulativa, por tratarse de un modelo predictivo tabular.

## Capacidades

- Prediccion de edad epigenetica adaptativa a partir de matrices de metilacion de ADN (Illumina arrays, tipicamente 450K o EPIC).
- Aislamiento de la componente adaptativa/protectora del envejecimiento, separandola de la componente de dano.
- Inferencia sobre sangre completa humana exclusivamente.
- Integracion directa con el ecosistema pyaging mediante `pya.pred.predict_age(adata, ["yingadaptage"])` sobre objetos AnnData.
- Interpretabilidad alta: al ser un modelo lineal con caracteristicas seleccionadas, los coeficientes son directamente inspeccionables.
- No soporta tool calling, agentes, razonamiento multi-step, vision, audio ni generacion de texto: no es un modelo de lenguaje.
- Capacidades multilingues: no aplica.

## Casos de uso

- Investigacion en biologia del envejecimiento: calcular la edad epigenetica adaptativa en cohortes de metilacion para estudiar por que algunos individuos envejecen con mejor salud a igual edad cronologica.
- Ensayos de intervencion antienvejecimiento: usar la diferencia entre edad adaptativa y edad cronologica como endpoint secundario para detectar efectos protectores de una intervencion (dieta, ejercicio, farmacos), separandolos de efectos de dano.
- Analisis de resiliencia y longevidad extrema: comparar la componente adaptativa en centenarios o individuos sanos de edad avanzada frente a controles, buscando firmas protectoras.
- Estudios epidemiologicos a gran escala: procesar matrices de metilacion de biobancos (por ejemplo, datos tipo 450K/EPIC) dentro de pipelines de pyaging junto a otros relojes para analisis multivariante.
- Investigacion de biomarcadores: identificar los CpGs con mayor peso causal en la prediccion adaptativa como candidatos para paneles de biomarcadores reducidos.
- Reproducibilidad y comparacion metodologica: al estar empaquetado en pyaging, permite replicar el reloj original de Ying et al. 2024 con una unica llamada y compararlo con relojes de dano en el mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de error (MAE, correlacion con edad cronologica) ni comparaciones cuantitativas con otros relojes; estos datos deben extraerse de la publicacion original en Nature Aging (Ying, Liu, Tarkhov et al., 2024).

## Requisitos de hardware

- VRAM: no aplica; es una regresion lineal que se ejecuta en CPU.
- GPU: no necesaria. Cualquier CPU moderna es suficiente; el cuello de botella es la carga y el preprocesado de la matriz de metilacion, no el modelo.
- Memoria RAM: dependiente del tamano de la matriz de metilacion de entrada (decenas de miles de CpGs por muestra); manejable en un portatil convencional para cohortes moderadas.
- Despliegue: mediante la libreria `pyaging` en Python, sobre objetos AnnData. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser una regresion dispersa, la inferencia por muestra es del orden de milisegundos una vez cargados los coeficientes.

## Comparativa con modelos similares

| Modelo | Tipo | Predictor | Restriccion de CpGs | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yingadaptage | Elastic net con pesos causales EWMR | Edad epigenetica adaptativa | Solo CpGs adaptativos/protectores | MIT (codigo pyaging); pesos con terminos de autores originales | Hugging Face (pyaging) |
| Relojes epigeneticos clasicos (Horvath, Hannum) | Elastic net / regresion penalizada | Edad epigenetica global | Sin restriccion causal | Variable segun modelo | Multiples repositorios y paquetes |
| Relojes de dano (damage clocks, Ying et al. 2024) | Regresion con pesos causales | Componente de dano del envejecimiento | CpGs asociados a dano | Segun autores originales | pyaging y publicacion original |

No se dispone de datos cuantitativos de rendimiento comparado en la informacion proporcionada.

## Limitaciones y advertencias

- Uso restringido a Homo sapiens y a sangre completa; no validado en otros tejidos ni especies segun la model card.
- Requiere datos de metilacion de ADN; no acepta otras modalidades.
- Modelo lineal: no captura interacciones no lineales entre CpGs, lo que puede limitar la precision frente a enfoques mas complejos.
- Riesgo de sobreajuste a las cohortes de entrenamiento si se aplica a poblaciones con composicion celular o etnia muy distintas; la informacion disponible no detalla la diversidad del dataset.
- La licencia MIT cubre el software pyaging, no los pesos: la model card advierte que los pesos retienen los terminos de los autores originales. Verificar condiciones antes de uso comercial.
- No es un dispositivo medico ni un biomarcador validado clinicamente; su uso debe limitarse a investigacion.
- Sin datos publicados en la informacion disponible sobre calibracion, intervalos de confianza o error de prediccion.
- Numero de descargas bajo (246) y ausencia de likes: comunidad de usuarios muy reducida, lo que implica menor validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/pyaging/yingadaptage
- Publicacion original: https://doi.org/10.1038/s43587-023-00557-0
- Catalogo de relojes pyaging: https://pyaging.readthedocs.io
