# jayyun98/Spark-X2.6-4B-INT4-Draftfit-DSpark-HeadOnly

## Resumen

Spark-X2.6-4B-INT4-Draftfit-DSpark-HeadOnly es un checkpoint de borrador (draft) para decodificacion especulativa, publicado por el usuario jayyun98 dentro del conjunto de validacion de Draftfit, una plataforma para construir, convertir y evaluar borradores de decodificacion especulativa con caracteristicas compartidas del modelo objetivo. No es un modelo de lenguaje autonomo: es un componente auxiliar que debe cargarse junto al modelo objetivo XHToken/Spark-X2.6-4B-INT4, del que hereda la tokenizacion y el vocabulario.

El artefacto contiene 624.416.001 parametros en formato safetensors (1.2 GB), muy por debajo de los aproximadamente 4.000 millones del modelo objetivo, lo que refleja su naturaleza de cabecera ligera orientada a proponer tokens que el modelo grande verifica. La etiqueta "HeadOnly" y el sufijo "DSpark" indican que se trata de una implementacion de referencia personalizada, no de un modelo compatible de forma directa con motores de inferencia estandar.

Su relevancia es acotada y experimental: sirve para reproducir y auditar las mediciones de aceptacion publicadas por el autor en el marco de Draftfit. La model card advierte explicitamente de que las ganancias medidas son estimaciones puntuales de un benchmark interno pequeno, con intervalos de confianza del 95% que incluyen el cero en ambas particiones, por lo que no establecen superioridad frente al borrador base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint de borrador para decodificacion especulativa, clase `SparkDSpark`) |
| Parametros totales | 624.416.001 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos del borrador en coma flotante; el objetivo requiere INT4/FP8 con compressed-tensors QDQ |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del borrador. Por la denominacion "HeadOnly" y el tamano (624 millones de parametros frente a los aproximadamente 4.000 millones del objetivo), cabe inferir una cabecera o subconjunto de capas que reutiliza caracteristicas del modelo objetivo, pero la model card no especifica capas, dimensiones ni mecanismo de atencion. El checkpoint se carga mediante `safetensors.torch.load_file` en una instancia `SparkDSpark(official_config())`, con un adaptador de objetivo Spark compatible y la revision exacta del objetivo indicada en `config.json`.

No se publican datos sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. El unico dato de evaluacion es la tasa de aceptacion de tokens en decodificacion especulativa, medida con verificacion de prefijo voraz, siete propuestas por paso, 64 tokens de salida y 24 prompts por particion, sobre los pesos cuantizados oficiales del objetivo y excluyendo los tokens bonus del objetivo.

## Capacidades

- Generacion de propuestas de tokens para decodificacion especulativa contra el objetivo XHToken/Spark-X2.6-4B-INT4.
- Verificacion de prefijo voraz con hasta siete propuestas por paso de decodificacion.
- Coincidencia exacta de salida con el objetivo en el benchmark interno reportado ("All outputs match the target exactly").
- Soporte unicamente del idioma ingles.
- No es un modelo conversacional autonomo: no se documentan capacidades de razonamiento, codigo, matematicas, vision, tool calling ni agentes.
- No soporta modo thinking, audio ni multimodalidad segun la informacion disponible.

## Casos de uso

- Evaluacion de borradores en Draftfit: cargar el checkpoint con `SparkDSpark(official_config())` para reproducir la tabla de aceptacion del autor y comparar el borrador base con esta variante bajo el mismo verificador de prefijo completo.
- Investigacion en decodificacion especulativa: usar el par objetivo-borrador como banco de pruebas controlado para estudiar el efecto de la cuantizacion dinamica de activaciones (QDQ) en la tasa de aceptacion.
- Auditoria de paridad de kernels: el checkpoint sirve como referencia de comportamiento para validar implementaciones de kernels empaquetados nativos, ya que la model card senala que la paridad con kernels nativos y la velocidad en serving de produccion no estan verificadas.
- Analisis de divergencia entre verificadores: comparar la generacion con cache del objetivo frente a la evaluacion de prefijo completo, que pueden seleccionar IDs de token distintos bajo QDQ dinamico de activaciones.
- Desarrollo de pipelines de conversion de borradores: emplear el artefacto como caso de prueba de las herramientas de conversion de Draftfit con caracteristicas compartidas del objetivo.
- Docencia y divulgacion tecnica: ilustrar el funcionamiento de la decodificacion especulativa con un par objetivo-borrador de pesos abiertos y licencia permisiva, sin necesidad de infraestructura de gran escala.

## Benchmarks y rendimiento

| Evaluacion | Borrador base | Este borrador |
|---|---:|---:|
| Development | 41,21% | 41,61% |
| Confirmation | 37,46% | 36,85% |

Mediciones de aceptacion con verificacion de prefijo voraz, siete propuestas, 64 tokens de salida y 24 prompts por particion, contra los mismos pesos cuantizados oficiales del objetivo. La aceptacion excluye los tokens bonus del objetivo. Los intervalos de confianza pareados del 95% incluyen el cero en ambas particiones, por lo que estas mediciones no establecen superioridad. No se han publicado resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM para el borrador: aproximadamente 1,2 GB en coma flotante segun el tamano del repositorio; el requisito dominante es el del modelo objetivo Spark-X2.6-4B-INT4, no cuantificado en la informacion disponible.
- GPU recomendadas: no disponibles para el par completo; el borrador por si solo cabe en cualquier GPU consumer con mas de 2 GB libres.
- Cabe en GPU consumer: si, el borrador; el objetivo de 4.000 millones en INT4 requiere aproximadamente 2,5-3 GB adicionales para pesos, mas memoria para cache KV y activaciones.
- Opciones de despliegue: no es compatible de forma directa con vLLM, SGLang ni MLX; requiere el codigo de referencia `SparkDSpark` con un adaptador de objetivo Spark compatible y la revision exacta del objetivo en `config.json`.
- Latencia y throughput: no disponibles; la model card indica que la velocidad en serving de produccion no esta verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-4B-INT4-Draftfit-DSpark-HeadOnly | 624.416.001 | no disponible | Borrador especulativo para Spark-X2.6-4B-INT4 | apache-2.0 | Hugging Face, codigo de referencia propio |
| Borrador base de Draftfit (referencia de la tabla) | no disponible | no disponible | Borrador especulativo para el mismo objetivo | no disponible | no disponible |
| XHToken/Spark-X2.6-4B-INT4 (objetivo) | ~4.000 millones | no disponible | Modelo objetivo cuantizado INT4 | no disponible | Hugging Face |

No se dispone de informacion sobre otros borradores de decodificacion especulativa comparables (por ejemplo, EAGLE o Medusa) en la documentacion proporcionada, por lo que la comparativa se limita al ecosistema Draftfit.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el objetivo XHToken/Spark-X2.6-4B-INT4 y el adaptador compatible no produce salidas utiles.
- No es drop-in para vLLM, SGLang ni MLX; requiere el codigo de referencia incluido.
- Las ganancias de aceptacion son estimaciones puntuales de un benchmark interno pequeno (24 prompts por particion) y los intervalos de confianza del 95% incluyen el cero; no hay evidencia de superioridad frente al borrador base.
- La paridad con kernels empaquetados nativos y el rendimiento en serving de produccion no estan verificados.
- La generacion con cache del objetivo puede seleccionar IDs de token distintos de la evaluacion de prefijo completo bajo QDQ dinamico de activaciones.
- Solo soporta ingles; no se documentan capacidades multilingues.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible, al no ser un modelo generativo de proposito general.
- Licencia apache-2.0 permisiva para uso comercial del artefacto, pero el uso en produccion depende de la licencia y los terminos del modelo objetivo, no detallados aqui.
- Repositorio con cero descargas y cero likes en el momento de la consulta; madurez y soporte comunitario practicamente nulos.

## Enlaces

- Hugging Face: https://huggingface.co/jayyun98/Spark-X2.6-4B-INT4-Draftfit-DSpark-HeadOnly
- Modelo objetivo: https://huggingface.co/XHToken/Spark-X2.6-4B-INT4
- Repositorio Draftfit: https://github.com/JayYun98/Draftfit
