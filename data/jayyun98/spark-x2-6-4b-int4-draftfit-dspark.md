# jayyun98/Spark-X2.6-4B-INT4-Draftfit-DSpark

## Resumen

Spark-X2.6-4B-INT4-Draftfit-DSpark es un modelo borrador (draft) para decodificacion especulativa, publicado por el usuario jayyun98 como parte del conjunto de validacion de Draftfit, una plataforma para construir, convertir y evaluar borradores de decodificacion especulativa con caracteristicas objetivo compartidas. No es un modelo generativo autonomo: es un checkpoint de referencia que debe cargarse junto al modelo objetivo XHToken/Spark-X2.6-4B-INT4 y que sirve para proponer tokens que el modelo objetivo verifica.

El checkpoint contiene 624.416.001 parametros en formato safetensors (1,2 GB de repositorio), con pesos en coma flotante, aunque la etiqueta FP8/INT4 del nombre identifica el tipo de modelo objetivo requerido, no los pesos del borrador. La model card indica explicitamente que no es un modelo compatible directamente con vLLM, SGLang o MLX, sino un checkpoint de referencia personalizado que debe cargarse mediante la clase `SparkDSpark(official_config())` incluida en el repositorio, usando `safetensors.torch.load_file` y un adaptador de objetivo Spark compatible con la revision exacta indicada en `config.json`.

Su relevancia es acotada y experimental: forma parte de un conjunto de validacion interno para medir la tasa de aceptacion de propuestas especulativas frente al modelo objetivo cuantizado. Los resultados publicados son estimaciones puntuales de un benchmark interno pequeno y las diferencias frente al borrador base no son estadisticamente significativas segun los propios intervalos de confianza reportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (borrador de decodificacion especulativa; estructura interna no documentada) |
| Parametros totales | 624.416.001 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos del borrador en coma flotante; requiere objetivo cuantizado FP8/INT4 (compressed-tensors QDQ) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del borrador (tipo de transformer, numero de capas, dimensiones ocultas ni mecanismo de atencion). El modelo se enmarca en la tecnica de decodificacion especulativa: un modelo pequeno propone varios tokens candidatos que el modelo objetivo verifica en paralelo, aceptando el prefijo correcto y generando un token bonus cuando todas las propuestas son aceptadas.

El entrenamiento se ha realizado mediante Draftfit, una plataforma para construir y convertir borradores de decodificacion especulativa con caracteristicas objetivo compartidas. No se detallan el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; estos datos no estan disponibles. La model card unicamente documenta el protocolo de evaluacion: verificacion greedy de prefijos con siete propuestas, 64 tokens de salida y 24 prompts por particion, ejecutando el objetivo con la referencia QDQ de compressed-tensors con sus pesos cuantizados originales, escalas y cuantizacion dinamica de activaciones.

## Capacidades

- Generacion de propuestas especulativas de tokens para acelerar la inferencia del modelo objetivo XHToken/Spark-X2.6-4B-INT4.
- Verificacion de prefijos greedy con hasta siete propuestas por paso.
- Salida alineada con el objetivo: la model card afirma que todas las salidas coinciden exactamente con las del modelo objetivo en la evaluacion realizada.
- No soporta tool calling, function calling ni razonamiento multi-paso de forma autonoma: es un componente auxiliar de inferencia, no un modelo de proposito general.
- Capacidades multilingues limitadas al ingles (tag `en`).
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Aceleracion de inferencia del modelo Spark-X2.6-4B-INT4: el borrador propone tokens que el objetivo verifica en paralelo, reduciendo el numero de pasos de decodificacion secuencial cuando la tasa de aceptacion es alta.
- Investigacion en decodificacion especulativa: sirve como punto de comparacion reproducible frente al borrador base dentro del conjunto de validacion de Draftfit.
- Evaluacion de pipelines de cuantizacion: permite medir la tasa de aceptacion contra pesos objetivo cuantizados con compressed-tensors QDQ, incluyendo cuantizacion dinamica de activaciones.
- Desarrollo de herramientas de conversion de borradores: el repositorio de Draftfit esta orientado a construir y convertir drafts, y este checkpoint actua como referencia de validacion del proceso.
- Benchmarking interno de aceptacion: util para equipos que quieran replicar el protocolo de verificacion greedy de prefijos con siete propuestas y 64 tokens de salida.
- Prototipado de servidores de inferencia experimentales: aunque no es compatible con vLLM, SGLang o MLX, puede integrarse en implementaciones propias que carguen el checkpoint mediante `SparkDSpark(official_config())`.

## Benchmarks y rendimiento

| Evaluacion | Borrador base | Este borrador |
|---|---:|---:|
| Development | 41,21 % | 41,61 % |
| Confirmation | 37,46 % | 36,85 % |

Protocolo: verificacion greedy de prefijos con siete propuestas, 64 tokens de salida y 24 prompts por particion, contra los mismos pesos cuantizados oficiales. La aceptacion excluye los tokens bonus del objetivo. La model card advierte que son estimaciones puntuales de un benchmark interno pequeno, que los intervalos de confianza pareados al 95 % incluyen cero en ambas particiones y que las mediciones no establecen superioridad del borrador frente al base. La paridad con kernels empaquetados nativos y la velocidad en servidores de produccion no estan verificadas.

## Requisitos de hardware

- VRAM estimada para el borrador: aproximadamente 1,2 GB en coma flotante segun el tamano del repositorio; debe sumarse la VRAM del modelo objetivo Spark-X2.6-4B-INT4.
- GPU recomendadas: no disponibles de forma especifica; al tratarse de un componente auxiliar de un objetivo de 4B en INT4, cualquier GPU capaz de alojar el objetivo con margen adicional para el borrador deberia ser suficiente en teoria, pero no hay datos publicados.
- Compatibilidad con GPU de consumo: no verificada; el borrador en si ocupa poco espacio, pero el requisito real lo marca el modelo objetivo.
- Opciones de despliegue: no es compatible con vLLM, SGLang ni MLX. Requiere cargar `model.safetensors` en `SparkDSpark(official_config())` mediante `safetensors.torch.load_file`, con un adaptador de objetivo Spark compatible y la revision exacta del objetivo indicada en `config.json`.
- Latencia y throughput: no disponibles; la model card senala que la velocidad de servicio en produccion no esta verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de aceptacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-4B-INT4-Draftfit-DSpark | 624.416.001 | no disponible | 41,61 % (dev) / 36,85 % (conf.) | apache-2.0 | HuggingFace |
| Borrador base de Draftfit | no disponible | no disponible | 41,21 % (dev) / 37,46 % (conf.) | no disponible | no disponible |
| Otros borradores de decodificacion especulativa | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es frente al borrador base del mismo conjunto de validacion, con diferencias dentro del margen de error estadistico. No se dispone de datos de benchmarks frente a alternativas de otros autores.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el objetivo XHToken/Spark-X2.6-4B-INT4 y un adaptador compatible; no funciona como modelo drop-in en vLLM, SGLang ni MLX.
- Los resultados de aceptacion proceden de un benchmark interno pequeno (24 prompts por particion) y los intervalos de confianza al 95 % incluyen cero; no demuestran superioridad frente al borrador base.
- La generacion cacheada del objetivo puede seleccionar IDs de token distintos de la evaluacion de prefijo completo bajo cuantizacion dinamica de activaciones QDQ; la tabla de aceptacion usa el verificador de prefijo completo fijo.
- La paridad con kernels empaquetados nativos y el rendimiento real en produccion no estan verificados.
- Idioma limitado al ingles; no hay soporte multilingue documentado.
- Riesgo de alucinacion y sesgos: no documentados especificamente, pero al ser un componente auxiliar la calidad final depende del modelo objetivo.
- Licencia apache-2.0, que permite uso comercial, pero la ausencia de validacion en produccion desaconseja su despliegue sin evaluacion propia.
- Modelo con cero descargas y cero likes en el momento de la consulta; madurez y soporte comunitario practicamente nulos.

## Enlaces

- [HuggingFace: jayyun98/Spark-X2.6-4B-INT4-Draftfit-DSpark](https://huggingface.co/jayyun98/Spark-X2.6-4B-INT4-Draftfit-DSpark)
- [Modelo objetivo: XHToken/Spark-X2.6-4B-INT4](https://huggingface.co/XHToken/Spark-X2.6-4B-INT4)
- [Repositorio Draftfit](https://github.com/JayYun98/Draftfit)
