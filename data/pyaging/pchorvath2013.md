# pyaging/pchorvath2013

## Resumen

`pchorvath2013` es un reloj epigenético (aging clock) alojado en Hugging Face bajo el espacio de nombres `pyaging`. No es un modelo de lenguaje ni una red neuronal generativa: es un estimador estadístico que predice la edad cronológica de un individuo a partir de datos de metilación de ADN. Concretamente, implementa un proxy basado en componentes principales (PCA) del reloj pan-tejido de Horvath publicado en 2013, entrenado contra la puntuación del reloj original utilizando conjuntos de datos multi-tejido sustituidos.

El modelo se distribuye con la librería `pyaging`, un ecosistema Python para el cálculo de relojes epigenéticos, y se invoca mediante una única llamada a `pya.pred.predict_age(adata, ["pchorvath2013"])` sobre un objeto AnnData. Su relevancia actual radica en que el reloj original de Horvath es uno de los más citados en biología del envejecimiento, y esta variante PCA busca mejorar la fiabilidad test-retest del estimador, un problema crítico en ensayos clínicos y seguimiento longitudinal.

El repositorio ocupa 0,3 GB y acumula 1076 descargas, lo que sugiere un uso establecido dentro de la comunidad de bioinformática epigenética. La licencia declarada del repositorio es MIT, aunque la model card advierte explícitamente que los pesos retienen los términos de los autores originales y que la licencia del software `pyaging` no los relicencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PCA + elastic net regression |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de metilación de ADN) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica (modelo biológico, no lingüístico) |
| Licencia | MIT (repositorio); pesos sujetos a los términos de los autores originales |
| Formato de pesos | no disponible (distribuido vía librería `pyaging`) |

## Arquitectura y entrenamiento

El modelo no emplea una arquitectura de transformer ni de red neuronal profunda. Se trata de un pipeline en dos etapas: primero una reducción de dimensionalidad mediante análisis de componentes principales (PCA) sobre las señales de metilación, y después una regresión elastic net que proyecta esos componentes sobre la edad cronológica. Este esquema es característico de los relojes epigenéticos de segunda generación orientados a mejorar la estabilidad de la predicción frente al ruido técnico de las plataformas de metilación.

Según la model card, el modelo es un proxy del reloj pan-tejido de Horvath (2013) y fue entrenado contra la puntuación del reloj original usando conjuntos de datos multi-tejido sustituidos. El año indicado en la ficha es 2022, coherente con la publicación de Higgins-Chen et al. en *Nature Aging*, que describe la solución computacional para reforzar la fiabilidad de los relojes epigenéticos. No se especifican en la información disponible el número de muestras de entrenamiento, la composición exacta de los datasets ni los detalles del ajuste de hiperparámetros.

## Capacidades

- Predicción de edad cronológica a partir de perfiles de metilación de ADN en *Homo sapiens*.
- Funcionamiento en modo multi-tejido, heredado del diseño pan-tejido del reloj de Horvath.
- Integración nativa con `pyaging` mediante `pya.pred.predict_age`.
- Operación sobre objetos AnnData, lo que facilita su encaje en flujos de análisis single-cell y epigenómica en Python.
- Mejora esperada de la fiabilidad test-retest respecto al reloj original, al ser un proxy basado en PCA.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo.

## Casos de uso

- Estudios longitudinales de envejecimiento: el modelo permite recalcular la edad epigenética de un mismo individuo en distintas visitas con menor variabilidad técnica, lo que resulta adecuado para detectar cambios reales frente a ruido de medición.
- Ensayos clínicos con intervenciones antienvejecimiento: al ser un proxy estabilizado del reloj de Horvath, sirve como variable de resultado secundaria en cohortes multi-tejido donde se necesita una métrica reproducible.
- Análisis de cohorts públicas de metilación: investigadores que reprocesan datasets GEO o TCGA pueden aplicar el reloj de forma homogénea mediante `pyaging` sin reimplementar el pipeline original.
- Control de calidad en laboratorios de epigenética: comparar la edad predicha por este proxy con la del reloj original ayuda a identificar muestras con ruido técnico anómalo.
- Docencia y formación en bioinformática: su invocación en una sola línea lo hace útil para ilustrar el funcionamiento de los relojes epigenéticos en cursos prácticos.
- Reproducibilidad de estudios previos: al estar empaquetado en `pyaging`, facilita replicar análisis de envejecimiento con una versión fijada del estimador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un pipeline PCA + elastic net, por lo que no requiere GPU.
- VRAM estimada: 0 GB; no aplica aceleración gráfica.
- GPU recomendadas: ninguna; no se beneficia de A100, H100 ni RTX 4090.
- Cabe en cualquier equipo consumer: el repositorio completo ocupa 0,3 GB, y en memoria el modelo es de escala muy reducida.
- Despliegue: mediante la librería `pyaging` en Python; no aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Predice | Tejido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pchorvath2013 | PCA + elastic net | Edad cronológica | Multi-tejido | MIT (repo); pesos con términos de los autores | Hugging Face vía `pyaging` |
| Reloj de Horvath 2013 (original) | Regresión sobre CpGs | Edad cronológica | Multi-tejido | Términos de los autores originales | Referencia académica; no empaquetado aquí |
| Relojes alternativos en `pyaging` | Varios (elastic net, etc.) | Edad cronológica u otras | Variable | Variable según clock | Catálogo de `pyaging` |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no admite instrucciones en lenguaje natural.
- Solo aplica a *Homo sapiens* y a datos de metilación de ADN; su uso fuera de ese dominio carece de validez.
- Al ser un proxy del reloj de Horvath, su predicción hereda los sesgos y limitaciones del reloj original, incluida la dependencia de la plataforma de metilación y del preprocesado.
- No se han publicado métricas de error (MAE, correlación) en la información disponible, por lo que no puede evaluarse su precisión absoluta a partir de esta ficha.
- La licencia MIT del repositorio no cubre los pesos: la model card indica que estos retienen los términos de los autores originales, lo que puede restringir el uso comercial.
- No se especifican requisitos de preprocesado más allá de la integración con `pyaging`; un uso incorrecto de la matriz de metilación puede producir predicciones inválidas.
- Riesgo de interpretación excesiva: la edad epigenética predicha no equivale a edad biológica ni a un diagnóstico clínico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pyaging/pchorvath2013
- Catálogo de relojes de pyaging: https://pyaging.readthedocs.io
- Publicación de referencia (Higgins-Chen et al., Nature Aging, 2022): https://doi.org/10.1038/s43587-022-00248-2
