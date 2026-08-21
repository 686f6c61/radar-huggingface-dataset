# luca0621/polyedit-mot-retrained

## Resumen

PolyEdit Molecular Optimization Transformer (polymer-retrained) es un checkpoint del modelo Molecular Optimization Transformer de MolecularAI, adaptado por luca0621 (Taeseung You) para trabajar con representaciones PSMILES de dos anclas y las ocho propiedades DFT definidas en el proyecto PolyEdit. El modelo original fue diseñado para optimización molecular mediante edición de fragmentos; esta versión reentrenada ajusta el cuerpo del transformer a un vocabulario específico de polímeros, donde el token de padding y el ancla `*` tienen identificadores distintos.

El checkpoint conserva la arquitectura original del transformer: 6 capas de encoder y decoder, tamaño oculto de 256, 8 cabezas de atención y feed-forward de 2048. Se cargaron 258 tensores compatibles con la forma del modelo original y se inicializaron 4 tensores dependientes del vocabulario. El entrenamiento se realizó sobre 152 036 ejemplos de retención de componentes, seleccionando el mejor checkpoint en la época 7 de 10. En el conjunto de prueba balanceado de 8176 solicitudes, el modelo alcanza una validez RDKit+TDC del 99,217 %, una validez de polímero de dos anclas del 99,168 % y una tasa de salidas modificadas del 99,083 %, aunque con una diversidad muy limitada (solo 383 salidas únicas), lo que indica un colapso de modo sustancial.

Este modelo es relevante para la comunidad de química computacional y diseño de polímeros, ya que ofrece una adaptación funcional de un optimizador molecular a un dominio específico, con métricas de validez altas pero con advertencias claras sobre su falta de diversidad. Su licencia Apache 2.0 permite uso comercial y modificación, lo que facilita su integración en flujos de investigación y desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (6 capas, hidden size 256, 8 cabezas, feed-forward 2048) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de quimica, no de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (no se especifica si safetensors o bin) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del Molecular Optimization Transformer de MolecularAI: un transformer encoder-decoder con 6 capas en cada bloque, dimensión oculta de 256, 8 cabezas de atención y una capa feed-forward de 2048 unidades. Esta arquitectura está diseñada para recibir una molécula de entrada (en formato SMILES o PSMILES) y generar una versión editada que optimiza una propiedad objetivo. En esta adaptación, el vocabulario se amplía para incluir dos anclas de polímero (`*`) y un token de padding diferenciado, lo que permite procesar cadenas poliméricas con dos puntos de anclaje.

El entrenamiento se realizó sobre 152 036 ejemplos de retención de componentes, es decir, ejemplos donde una parte de la molécula se mantiene fija mientras se edita el resto. Se cargaron los pesos del checkpoint original (258 tensores compatibles) y se inicializaron 4 tensores nuevos para el vocabulario ampliado. El mejor checkpoint se obtuvo en la época 7 de 10. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; el entrenamiento es supervisado sobre pares de entrada-salida. Tampoco se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset, más allá del número de ejemplos.

## Capacidades

- Generacion de estructuras polimericas: el modelo produce PSMILES de dos anclas, representaciones lineales de polímeros con dos puntos de anclaje, a partir de una entrada dada.
- Optimizacion de propiedades DFT: está entrenado para optimizar ocho propiedades DFT definidas en el proyecto PolyEdit, aunque no se detallan cuáles son en la informacion disponible.
- Edicion molecular dirigida: dado un compuesto de entrada, genera una salida modificada que mantiene la validez quimica (99,217 % de validez RDKit+TDC) y que difiere de la entrada en al menos un fragmento (99,083 % de salidas cambiadas).
- Validez quimica alta: las salidas son mayoritariamente validas tanto segun RDKit/TDC como segun la validez especifica de polímeros de dos anclas (99,168 %).
- No es un modelo de lenguaje general: no soporta generacion de texto libre, tool calling, agentes ni razonamiento multi-paso fuera del dominio quimico.
- Capacidades multilingues: no aplica, al ser un modelo especializado en quimica.

## Casos de uso

- Diseño de nuevos polímeros con propiedades objetivo: el modelo puede generar variantes de una cadena polimerica que mantengan la validez quimica y modifiquen propiedades DFT especificas, util para explorar el espacio quimico de materiales.
- Optimizacion de monómeros en síntesis asistida por computadora: dado un monómero de partida, el modelo propone ediciones que podrian mejorar la solubilidad, estabilidad u otras propiedades relevantes, reduciendo el numero de sintesis experimentales necesarias.
- Generacion de bibliotecas virtuales de polímeros: al alimentar el modelo con multiples estructuras de partida, se pueden generar colecciones de candidatos validos para cribado virtual, aunque la baja diversidad (383 salidas unicas) limita la cobertura del espacio quimico.
- Validacion de rutas sinteticas: el modelo puede servir como generador de hipotesis en pipelines de diseño inverso, donde las salidas se evaluan posteriormente con simulaciones DFT o metodos de aprendizaje automatico.
- Educacion e investigacion en quimica computacional: como checkpoint de referencia, permite estudiar el comportamiento de transformers en tareas de optimizacion molecular y comparar metricas de validez y diversidad.
- Integracion en flujos de trabajo de PolyEdit: el modelo esta disenado para usarse con la implementacion de PolyEdit (enlace en la model card), lo que facilita su inclusion en pipelines existentes de evaluacion y optimizacion de polímeros.

## Benchmarks y rendimiento

Los resultados del conjunto de prueba balanceado (8176 solicitudes) se presentan en la model card. No se proporcionan comparaciones con otros modelos en la informacion disponible.

| Metrica | Valor |
|---|---|
| Validez RDKit+TDC | 99,217 % |
| Validez de polimero de dos anclas | 99,168 % |
| Salidas cambiadas | 99,083 % |
| Aciertos estrictos MIPS-retrained full-edit | 8,892 % |
| Aciertos estrictos DFT full-edit | 10,127 % |
| Cobertura DFT | 95,034 % |
| Salidas unicas generadas | 383 |

Estas metricas indican una alta validez quimica pero una tasa de aciertos estrictos baja (alrededor del 10 %), lo que sugiere que el modelo genera muchas estructuras validas pero pocas que cumplan exactamente el criterio de optimizacion completo. El numero reducido de salidas unicas (383) confirma un colapso de modo severo, que debe tenerse en cuenta al interpretar cualquier resultado.

## Requisitos de hardware

No se proporcionan requisitos especificos de hardware en la informacion disponible. Dado que el tamaño del repositorio es de 0,1 GB, se trata de un modelo pequeño (probablemente menos de 100 millones de parametros, aunque no se confirma). Es razonable esperar que pueda ejecutarse en una GPU de consumo (por ejemplo, RTX 3060 o superior) o incluso en CPU para inferencia, pero no hay datos oficiales de VRAM, latencia o throughput. Para despliegue, al ser un modelo PyTorch, se podria usar vLLM, TGI o llama.cpp si se convierte a GGUF, pero no se menciona compatibilidad con estas herramientas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El modelo original de MolecularAI (Molecular Optimization Transformer) es el predecesor directo, pero no se ofrecen datos comparativos de rendimiento entre ambos. Tampoco se mencionan alternativas como modelos de generacion molecular basados en GPT o VAE. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Colapso de modo severo: solo se generaron 383 salidas unicas en el conjunto de prueba, lo que limita gravemente la diversidad de las estructuras propuestas y puede llevar a resultados repetitivos en aplicaciones practicas.
- Tasa de aciertos estrictos baja: aunque la validez es alta, solo alrededor del 10 % de las salidas cumplen el criterio de optimizacion completo (full-edit), lo que indica que el modelo no es fiable para generar directamente soluciones optimas sin un paso de filtrado posterior.
- Especializacion limitada: el modelo esta disenado exclusivamente para PSMILES de dos anclas y las propiedades DFT de PolyEdit; no es util para otros tipos de moleculas o representaciones.
- Sin informacion sobre sesgos: no se documentan sesgos especificos, pero al ser un modelo entrenado en un dataset concreto, puede heredar sesgos de la distribucion de datos (por ejemplo, sobrerrepresentacion de ciertos tipos de polímeros).
- Riesgo de alucinacion quimica: aunque la validez es alta, un 0,8 % de las salidas no son validas, y no se garantiza que las estructuras generadas sean sinteticamente accesibles o estables.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe atribuir correctamente y no se ofrece garantia sobre la idoneidad del modelo para aplicaciones de produccion.
- Dependencia del checkpoint original: el modelo se basa en pesos de MolecularAI con licencia propia; aunque la adaptacion es Apache 2.0, el uso del codigo upstream puede estar sujeto a condiciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luca0621/polyedit-mot-retrained
- Codigo upstream (MolecularAI deep-molecular-optimization): https://github.com/MolecularAI/deep-molecular-optimization
- Checkpoint original (Zenodo): https://doi.org/10.5281/zenodo.5571965
- Implementacion PolyEdit y evaluacion a nivel de registro: https://github.com/promotion-kim/POLYEDIT/tree/tsyou/balanced-polymer-baseline-eval
