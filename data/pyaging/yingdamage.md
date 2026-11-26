# pyaging/yingdamage

## Resumen

yingdamage es un reloj epigenético (aging clock) desarrollado por el equipo de Ying, Liu, Tarkhov et al. y publicado en Nature Aging en 2024, empaquetado y distribuido en Hugging Face por el proyecto pyaging. No es un modelo de lenguaje: es un predictor de edad epigenética basado en regresión elastic net con ponderación por causalidad, restringido a sitios CpG de metilación de ADN asociados a daño relacionado con la edad. El modelo estima la "edad epigenética de daño" en muestras de sangre completa de Homo sapiens a partir de datos de metilación de ADN.

La relevancia del modelo reside en su enfoque metodológico: en lugar de predecir la edad cronológica, incorpora puntuaciones de causalidad derivadas de estudios de aleatorización mendeliana epigenética (EWMR) para ponderar las penalizaciones de las características. Esto permite desacoplar los componentes de daño y de adaptación del envejecimiento epigenético, una distinción que los relojes epigenéticos convencionales no capturan.

El repositorio tiene un tamaño de 0.0 GB y 233 descargas, lo que sugiere un conjunto de pesos muy compacto, coherente con un modelo de regresión lineal regularizada. La licencia del repositorio es MIT, aunque la model card advierte explícitamente que los pesos retienen los términos de los autores originales y que la licencia del software pyaging no los relicencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion elastic net ponderada por causalidad (modelo lineal regularizado) |
| Parametros totales | no disponible (coeficientes de regresion sobre CpGs; numero exacto no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de valores de metilacion por CpG) |
| Tipos de cuantizacion | no disponible (no aplica cuantizacion de pesos neuronales) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; especie: Homo sapiens) |
| Licencia | MIT (repositorio); los pesos retienen los terminos de los autores originales |
| Formato de pesos | no disponible (repo de 0.0 GB; consumible via libreria pyaging) |

## Arquitectura y entrenamiento

El modelo es una regresion elastic net (combinacion de penalizaciones L1 y L2) aplicada sobre valores de metilacion de ADN en sitios CpG. La innovacion principal es que las penalizaciones de las caracteristicas estan ponderadas por puntuaciones de causalidad EWMR (epigenetic Mendelian randomization), de modo que el modelo se restringe a CpGs relacionados con dano y pondera cada predictor segun la evidencia causal de su asociacion con el envejecimiento. El modelo predice la "edad epigenetica de dano" en sangre completa.

Los detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset y los procedimientos de ajuste no estan disponibles en la informacion proporcionada. La publicacion de referencia (Ying et al., Nature Aging 4, 231-246, 2024) es la fuente primaria para la metodologia completa.

## Capacidades

- Prediccion de edad epigenetica de dano a partir de datos de metilacion de ADN en sangre completa de Homo sapiens.
- Ponderacion por causalidad de las caracteristicas mediante puntuaciones EWMR.
- Desacoplamiento de los componentes de dano y adaptacion del envejecimiento epigenetico.
- Integracion con el ecosistema pyaging mediante una unica llamada a `pya.pred.predict_age(adata, ["yingdamage"])`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Investigacion en envejecimiento biologico: estimar la edad epigenetica de dano en cohortes de sangre completa para estudiar la heterogeneidad del envejecimiento y separar senales de dano de senales adaptativas.
- Estudios de intervencion: evaluar si una intervencion (farmacologica, dietetica o de estilo de vida) reduce la edad epigenetica de dano en muestras pareadas antes y despues del tratamiento.
- Analisis de asociacion gen-etorno: combinar las predicciones del reloj con variantes geneticas para explorar relaciones causales mediante aleatorizacion mendeliana.
- Reproducibilidad y comparacion de relojes: al estar integrado en pyaging, permite ejecutar y comparar yingdamage junto con otros relojes del catalogo sobre el mismo objeto AnnData.
- Filtrado de calidad de datos epigeneticos: usar la discrepancia entre edad cronologica y edad de dano predicha como indicador de senal biologica relevante en un pipeline de control de calidad.
- Docencia y formacion en bioinformatica: ejemplo compacto y de bajo coste computacional de regresion regularizada con ponderacion por conocimiento biologico previo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; es una regresion lineal regularizada sobre un conjunto de CpGs, ejecutable en CPU.
- GPU recomendadas: no aplica.
- Cabe en cualquier GPU consumer y tambien en entornos sin GPU.
- Opciones de despliegue: libreria pyaging (Python) sobre objetos AnnData; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; el tamano del repositorio (0.0 GB) indica un coste de inferencia muy bajo.

## Comparativa con modelos similares

| Modelo | Tipo | Predictor | Especie/tejido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yingdamage | Elastic net ponderada por causalidad | Edad epigenetica de dano | Homo sapiens / sangre completa | MIT (repo); pesos con terminos de los autores | Hugging Face (pyaging) |
| Otros relojes del catalogo pyaging | Regresion regularizada / otros | Edad epigenetica | Variable | Variable | Hugging Face (pyaging) |
| Relojes epigeneticos convencionales | Regresion regularizada | Edad cronologica | Variable | Variable | no disponible |

No se dispone en la informacion proporcionada de datos cuantitativos de rendimiento para establecer una comparativa numerica con alternativas concretas.

## Limitaciones y advertencias

- Restringido a Homo sapiens y a sangre completa: no debe aplicarse a otros tejidos ni especies sin validacion previa.
- Requiere datos de metilacion de ADN en sitios CpG especificos; muestras con cobertura incompleta pueden degradar la prediccion.
- Predice edad de dano, no edad cronologica; interpretar las salidas como edad cronologica es un error conceptual.
- Riesgo de sobreajuste a las cohortes de entrenamiento y de sesgo de seleccion poblacional, habitual en relojes epigeneticos; no se detalla la composicion demografica del dataset en la informacion disponible.
- La licencia MIT cubre el repositorio, pero los pesos retienen los terminos de los autores originales: verificar las condiciones antes de uso comercial.
- La model card advierte explicitamente de que la licencia del software pyaging no relicencia los pesos.
- No es un modelo de lenguaje: no admite prompts, tool calling ni generacion de texto.
- Uso previsto de investigacion; no sustituye diagnostico clinico ni decision medica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pyaging/yingdamage
- Catalogo de relojes pyaging: https://pyaging.readthedocs.io
- Publicacion de referencia: https://doi.org/10.1038/s43587-023-00557-0 (Ying, K., Liu, H., Tarkhov, A.E. et al., Nature Aging 4, 231-246, 2024)
