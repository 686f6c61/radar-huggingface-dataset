# pyaging/twelvecelldeconvolutebloodepicmono

## Resumen

`pyaging/twelvecelldeconvolutebloodepicmono` es un modelo de deconvolución celular basada en referencia para estimar la proporción de monocitos en sangre periférica a partir de datos de metilación de ADN obtenidos con el array EPIC. Lo desarrolla el equipo de `pyaging`, una librería de Python especializada en relojes de envejecimiento y análisis de metilación. El modelo resuelve el problema de inferir la composición de tipos celulares en muestras de sangre sin necesidad de citometría de flujo, utilizando únicamente los niveles de metilación de un conjunto reducido de 240 CpGs. Esta aproximación es relevante en estudios de envejecimiento, inmunología y epidemiología, donde la composición celular es una covariable crítica o un fenotipo de interés.

A diferencia de los modelos de lenguaje, este no es un transformer ni un modelo neuronal con parámetros entrenables en el sentido clásico: se trata de un método estadístico de deconvolución restringida (constrained deconvolution) que utiliza una matriz de referencia de perfiles de metilación por tipo celular. La arquitectura exacta no está documentada en la ficha, pero el modelo está diseñado para devolver la proporción de monocitos a partir de la señal de metilación. Está disponible bajo licencia BSD-3-Clause y su implementación se integra en el ecosistema `pyaging`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reference-based constrained deconvolution |
| Parametros totales | No disponible (no es un modelo neuronal con pesos en el sentido convencional) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No aplica (modelo biologico, no linguistico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | No disponible (probablemente coeficientes de regresion o matriz de referencia, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo implementa una deconvolucion celular basada en referencia con restricciones. En lugar de una arquitectura neuronal, utiliza un conjunto de 240 sitios CpG seleccionados para maximizar el contraste entre tipos celulares. Segun la model card, estos 240 CpGs no son un subconjunto de los 1,200 publicados en el estudio IDOL-Ext de Salas et al. (2022), sino que provienen de una sustitucion no documentada heredada de Biolearn. Los CpGs se organizan en 10 contrastes positivos y 10 negativos por subtipo celular, lo que permite estimar proporciones mediante una regresion restringida que garantiza que las proporciones sean no negativas y sumen uno.

El entrenamiento se basa en datos de metilacion de leucocitos de sangre purificada de Homo sapiens, con el objetivo de recuperar proporciones celulares conocidas en mezclas artificiales. No se dispone de detalles sobre el volumen de datos de entrenamiento, el preprocesamiento exacto ni el procedimiento de optimizacion. El modelo esta disenado para usarse con la funcion `predict_age` de `pyaging`, aunque su salida es una proporcion celular, no una edad.

## Capacidades

- Estima la proporcion de monocitos en muestras de sangre periferica a partir de datos de metilacion de ADN (array EPIC).
- Realiza deconvolucion celular basada en referencia con restricciones de no negatividad y suma a uno.
- Integra con el ecosistema `pyaging` para analisis de envejecimiento y metilacion.
- Disenado para tejido de leucocitos de sangre purificada, con aplicacion en estudios de composicion inmune.
- No soporta generacion de texto, razonamiento, codigo, tool calling, agentes ni capacidades multilingues, al ser un modelo biologico especializado.

## Casos de uso

- Estudios de envejecimiento: ajustar la proporcion de monocitos como covariable en modelos de reloj epigenetico, ya que la composicion celular confunde las estimaciones de edad biologica. El modelo permite corregir este efecto sin necesidad de citometria.
- Perfilado inmune en epidemiologia: estimar la fraccion de monocitos en grandes cohortes con datos de metilacion disponibles, para asociarla con factores de riesgo o exposiciones ambientales.
- Validacion de biomarcadores: verificar si cambios en la metilacion de sangre se deben a variaciones en la proporcion de monocitos o a cambios epigeneticos reales en ese tipo celular.
- Control de calidad en experimentos: detectar desviaciones inesperadas en la composicion celular de muestras procesadas, lo que puede indicar contaminacion o degradacion.
- Integracion en pipelines de bioinformatica: usar el modelo dentro de flujos de analisis de datos de metilacion con `pyaging`, junto a otros relojes epigeneticos y herramientas de deconvolucion.
- Investigacion traslacional en inmunologia: explorar la relacion entre la proporcion de monocitos y enfermedades inflamatorias o infecciosas, aprovechando que el modelo requiere solo datos de metilacion ya disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de rendimiento como correlacion con citometria de flujo, error absoluto medio ni comparaciones con otros metodos de deconvolucion. Se recomienda consultar el articulo de Salas et al. (2022) para resultados del metodo IDOL-Ext original, aunque este modelo utiliza un conjunto de CpGs diferente.

## Requisitos de hardware

- Al ser un modelo estadistico de pequeno tamano (solo unos pocos cientos de CpGs), no requiere GPU. Puede ejecutarse en cualquier CPU moderna.
- El repositorio tiene un tamano de 0.0 GB, lo que sugiere que los pesos o coeficientes son minimos.
- No se requiere memoria VRAM ni tarjetas graficas especificas.
- Despliegue: se integra como una funcion de la libreria `pyaging`, por lo que basta con instalar el paquete en un entorno Python. No se necesitan servidores de inferencia como vLLM u Ollama.
- La latencia es despreciable: el calculo de una proporcion a partir de 240 CpGs es inmediato en CPU.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con otros modelos de deconvolucion como IDOL-Ext, EpiDISH o CIBERSORT. La model card menciona que este modelo usa una libreria de 240 CpGs diferente a la publicada de 1,200 CpGs, pero no proporciona resultados comparativos. Se recomienda evaluar el modelo en los propios datos antes de utilizarlo en produccion.

## Limitaciones y advertencias

- El modelo esta entrenado especificamente para sangre periferica y para el array EPIC; su uso en otros tejidos o plataformas puede producir resultados invalidos.
- La seleccion de 240 CpGs no esta documentada en la publicacion original y podria no estar optimizada para todos los contextos, lo que introduce incertidumbre sobre su generalizacion.
- No se han publicado metricas de validacion externa, por lo que el rendimiento en poblaciones distintas a las de entrenamiento es desconocido.
- Al ser un metodo de deconvolucion basado en referencia, asume que la matriz de referencia es representativa de los tipos celulares presentes en la muestra; desviaciones pueden causar errores sistematicos.
- La licencia BSD-3-Clause permite uso comercial, pero se debe citar el trabajo original de Salas et al. (2022) y la libreria `pyaging`.
- No se han documentado sesgos especificos, pero es posible que el modelo tenga un rendimiento inferior en poblaciones no caucasicas debido a diferencias en metilacion.

## Enlaces

- HuggingFace: https://huggingface.co/pyaging/twelvecelldeconvolutebloodepicmono
- Articulo original: Salas, L.A., Zhang, Z., Koestler, D.C. et al. Enhanced cell deconvolution of peripheral blood using DNA methylation for high-resolution immune profiling. Nature Communications 13, 761 (2022). DOI: https://doi.org/10.1038/s41467-021-27864-7
- Documentacion de pyaging: https://pyaging.readthedocs.io
