# jayyun98/Spark-X2.6-4B-FP8-Draftfit-DSpark

## Resumen

Spark-X2.6-4B-FP8-Draftfit-DSpark es un checkpoint de borrador (draft) para decodificacion especulativa construido sobre el modelo base XHToken/Spark-X2.6-4B-FP8. Lo publica el usuario jayyun98 como parte del conjunto de validacion de Draftfit, una plataforma para construir, convertir y evaluar borradores de decodificacion especulativa con caracteristicas compartidas del modelo objetivo. No es un modelo de lenguaje autonomo: es un artefacto auxiliar que acelera la inferencia del modelo objetivo al que acompana.

El checkpoint contiene 624.416.001 parametros en formato safetensors (1,2 GB de repositorio) y se distribuye bajo licencia Apache 2.0. Su unico idioma declarado es el ingles. Aunque el nombre comercial hace referencia a "4B", el recuento real de parametros del archivo publicado es de aproximadamente 624 millones, coherente con la funcion de un borrador ligero que propone tokens que el modelo objetivo verifica.

Su relevancia es acotada y experimental: sirve como referencia reproducible del pipeline de Draftfit y como evidencia de que un borrador ajustado con caracteristicas compartidas mejora marginalmente la aceptacion respecto al borrador base. No esta pensado para despliegue directo en servidores de inferencia convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (checkpoint de borrador para decodificacion especulativa; clase de referencia `SparkDSpark`) |
| Parametros totales | 624.416.001 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el objetivo asociado usa FP8 con compressed-tensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del borrador mas alla de su clase de referencia `SparkDSpark(official_config())`. Por la naturaleza del artefacto, se trata de un modelo auxiliar de decodificacion especulativa que comparte caracteristicas con el modelo objetivo XHToken/Spark-X2.6-4B-FP8 y que propone multiples tokens candidatos por paso, verificados despues por el objetivo. El proceso de construccion se realiza mediante la plataforma Draftfit, que permite crear, convertir y evaluar borradores con caracteristicas compartidas del objetivo.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La evaluacion publicada emplea verificacion de prefijo voraz (greedy) con siete propuestas, 64 tokens de salida y 24 prompts por particion, contra los mismos pesos cuantizados oficiales del objetivo, excluyendo los tokens bonus del objetivo. El autor advierte que el objetivo ejecuta la referencia QDQ de compressed-tensors con sus pesos cuantizados originales, escalas y cuantizacion dinamica de activaciones, y que la paridad con kernels empaquetados nativos y la velocidad en serving de produccion no estan verificadas.

## Capacidades

- Generacion de propuestas de tokens para decodificacion especulativa contra el modelo objetivo XHToken/Spark-X2.6-4B-FP8.
- Verificacion de prefijo voraz con hasta siete propuestas por paso, segun la configuracion de evaluacion publicada.
- Coincidencia exacta de salidas con el modelo objetivo en las pruebas internas reportadas.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- No es un modelo autonomo: requiere el adaptador de objetivo Spark compatible y la revision exacta del objetivo indicada en `config.json`.

## Casos de uso

- Aceleracion de inferencia del modelo Spark-X2.6-4B-FP8: el borrador propone tokens que el objetivo verifica, reduciendo el numero de pasos de decodificacion efectivos en cargas de generacion de texto en ingles.
- Validacion de pipelines de decodificacion especulativa: sirve como referencia reproducible para comprobar que una implementacion de Draftfit produce la aceptacion esperada (41,92 % en desarrollo y 38,99 % en confirmacion).
- Investigacion sobre borradores con caracteristicas compartidas: permite comparar el borrador base (41,24 % / 38,58 %) con la variante ajustada y medir el efecto del ajuste fino del borrador.
- Pruebas de regresion de paridad numerica: al garantizar coincidencia exacta con las salidas del objetivo en el benchmark interno, es util para detectar desviaciones en implementaciones de verificacion.
- Experimentacion academica con decodificacion especulativa: adecuado para estudiar el compromiso entre numero de propuestas, tasa de aceptacion y coste de verificacion.
- Integracion en entornos de evaluacion controlados: utilizable alli donde se pueda cargar manualmente el safetensors con `safetensors.torch.load_file` y un adaptador Spark compatible, no en servidores estandar.

## Benchmarks y rendimiento

| Evaluacion | Borrador base | Este borrador |
|---|---:|---:|
| Desarrollo | 41,24 % | 41,92 % |
| Confirmacion | 38,58 % | 38,99 % |

Datos de aceptacion con verificacion de prefijo voraz, siete propuestas, 64 tokens de salida y 24 prompts por particion, contra los mismos pesos cuantizados oficiales. La aceptacion excluye los tokens bonus del objetivo. El autor los describe como estimaciones puntuales de un benchmark interno pequeno. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB solo para los pesos del borrador en el formato publicado; hay que sumar la memoria del modelo objetivo Spark-X2.6-4B-FP8, cuya huella no se detalla en la informacion disponible.
- GPU recomendadas: no disponible. Al no ser compatible de forma directa con vLLM, SGLang o MLX, no hay una recomendacion de hardware validada por el autor.
- Compatibilidad con GPU de consumo: los pesos del borrador caben en cualquier GPU con mas de 2 GB de VRAM, pero la viabilidad depende del objetivo y del adaptador, no documentados.
- Opciones de despliegue: carga manual de `model.safetensors` en `SparkDSpark(official_config())` mediante `safetensors.torch.load_file`, con un adaptador de objetivo Spark compatible y la revision exacta del objetivo en `config.json`. No es un modelo drop-in para vLLM, SGLang ni MLX.
- Latencia y throughput: no disponible. La velocidad en serving de produccion no esta verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Despliegue |
|---|---|---|---|---|---|
| Spark-X2.6-4B-FP8-Draftfit-DSpark | 624.416.001 | No disponible | Borrador de decodificacion especulativa | Apache 2.0 | Carga manual con adaptador Spark |
| Borrador base de Draftfit | No disponible | No disponible | Borrador de decodificacion especulativa | No disponible | Carga manual con adaptador Spark |
| XHToken/Spark-X2.6-4B-FP8 | No disponible (objetivo) | No disponible | Modelo objetivo cuantizado FP8 | No disponible | Depende del objetivo |

No se dispone de datos suficientes para comparar con borradores de otros ecosistemas (por ejemplo, drafts de EAGLE o Medusa) en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el objetivo XHToken/Spark-X2.6-4B-FP8 y un adaptador Spark compatible no produce salidas utiles.
- No es drop-in para vLLM, SGLang ni MLX; requiere carga manual y la revision exacta del objetivo indicada en `config.json`.
- Las tasas de aceptacion publicadas son estimaciones de un benchmark interno pequeno (24 prompts por particion) y no deben extrapolarse a produccion.
- La paridad con kernels empaquetados nativos y la velocidad real en serving no estan verificadas.
- Idioma limitado al ingles declarado; no hay evidencia de capacidades multilingues.
- Riesgo de alucinacion: no evaluado de forma independiente; la garantia de coincidencia con el objetivo solo se refiere al benchmark interno reportado.
- Sesgos conocidos: no documentados.
- Uso comercial permitido por la licencia Apache 2.0, pero la viabilidad tecnica en produccion no esta demostrada.
- Repositorio con cero descargas y cero likes en el momento de la consulta; madurez y soporte comunitario minimos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jayyun98/Spark-X2.6-4B-FP8-Draftfit-DSpark
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B-FP8
- Plataforma Draftfit: https://github.com/JayYun98/Draftfit
