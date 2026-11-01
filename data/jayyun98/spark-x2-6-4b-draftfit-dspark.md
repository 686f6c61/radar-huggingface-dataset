# jayyun98/Spark-X2.6-4B-Draftfit-DSpark

## Resumen

Spark-X2.6-4B-Draftfit-DSpark es un modelo borrador (draft) para decodificacion especulativa, desarrollado por el usuario jayyun98 como parte del conjunto de validacion de Draftfit, una plataforma para construir, convertir y evaluar borradores de decodificacion especulativa con caracteristicas compartidas del modelo objetivo. No es un modelo generativo autonomo: requiere el modelo objetivo XHToken/Spark-X2.6-4B para producir texto, y su funcion es proponer tokens que el modelo objetivo verifica.

El checkpoint contiene 624.416.001 parametros en formato safetensors y ocupa 1,2 GB en el repositorio. Aunque la nomenclatura del modelo base alude a "4B", el borrador real es de aproximadamente 624 millones de parametros, lo que lo situa en la categoria de modelos pequenos optimizados para baja latencia en el bucle de decodificacion especulativa.

Su relevancia es acotada pero tecnica: sirve como referencia reproducible para medir tasas de aceptacion de borradores DSpark frente al borrador oficial del modelo base, con mejoras reportadas de 37,93% a 40,11% en el conjunto de desarrollo y de 35,85% a 38,44% en el de confirmacion. Es un artefacto de investigacion, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint de referencia DSpark para decodificacion especulativa; requiere el modelo objetivo Spark-X2.6-4B) |
| Parametros totales | 624.416.001 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del borrador mas alla de su naturaleza DSpark (draft con caracteristicas compartidas del objetivo, segun la descripcion de Draftfit). El modelo se carga mediante la referencia `SparkDSpark(official_config())` incluida en el repositorio y requiere un adaptador de objetivo Spark compatible de Draftfit; la procedencia del entrenamiento se documenta en `experiment-manifest.json`.

No se han publicado datos sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO. La evaluacion reportada se realizo con un verificador de prefijo greedy en PyTorch, siete propuestas de borrador por paso, 64 tokens de salida y 24 prompts por particion, midiendo tokens aceptados sobre propuestos (excluyendo los tokens bonus del objetivo). El autor advierte que estos benchmarks internos pequenos tuvieron exposicion previa en evaluacion y que los intervalos de confianza bootstrap del 95% emparejados incluyen cero, ademas de que la paridad con el runtime C++ original y el rendimiento en serving de produccion no estan verificados.

## Capacidades

- Generacion de tokens como borrador en decodificacion especulativa: propone secuencias de tokens que el modelo objetivo Spark-X2.6-4B verifica.
- Salidas identicas al objetivo: segun el autor, todas las salidas coinciden exactamente con las del modelo objetivo.
- Integracion con el ecosistema Draftfit: conversion y evaluacion de borradores con caracteristicas compartidas del objetivo.
- No soporta tool calling ni function calling de forma nativa.
- No dispone de modo agente ni razonamiento multi-paso autonomo.
- Capacidades multilingues limitadas al ingles (unico idioma declarado).
- No incluye vision, audio ni modo thinking.

## Casos de uso

- Aceleracion de inferencia con decodificacion especulativa: el borrador propone tokens que el objetivo verifica, reduciendo el numero de pasos autorregresivos del objetivo cuando la tasa de aceptacion es alta; adecuado para servir el modelo Spark-X2.6-4B con menor latencia.
- Evaluacion comparativa de borradores: sirve como referencia para medir tasas de aceptacion frente al borrador oficial dentro de pipelines de evaluacion de Draftfit.
- Investigacion en decodificacion especulativa: permite reproducir experimentos con caracteristicas compartidas entre borrador y objetivo, con manifiesto de procedencia incluido.
- Validacion de plataformas de conversion: util para probar la conversion de checkpoints a formatos de borrador y verificar la paridad de salidas con el objetivo.
- Pruebas de regresion de calidad: al garantizar salidas identicas al objetivo, puede usarse para comprobar que una integracion de serving no altera el texto generado.
- Desarrollo de adaptadores de objetivo: sirve de caso de prueba para implementar adaptadores Spark compatibles con Draftfit en entornos de investigacion.

## Benchmarks y rendimiento

| Evaluacion | Borrador oficial | Este borrador |
|---|---:|---:|
| Desarrollo | 37,93% | 40,11% |
| Confirmacion | 35,85% | 38,44% |

Tasa de aceptacion medida como tokens aceptados sobre tokens propuestos, excluyendo tokens bonus del objetivo, con verificador de prefijo greedy en PyTorch, siete propuestas por paso, 64 tokens de salida y 24 prompts por particion. El autor indica que los intervalos bootstrap del 95% incluyen cero y que el rendimiento en serving real no esta verificado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en precision original (624 millones de parametros en safetensors); el consumo adicional depende del modelo objetivo Spark-X2.6-4B, que debe residir tambien en memoria.
- GPU recomendadas: no disponible; al ser un borrador pequeno, cabe en GPUs de consumo, pero el requisito dominante es la memoria del modelo objetivo.
- Cabe en GPU de consumo: si, para el borrador; el objetivo condiciona el requisito total.
- Opciones de despliegue: no es compatible directamente con vLLM, SGLang ni MLX; requiere la referencia `SparkDSpark(official_config())` y un adaptador de objetivo Draftfit.
- Latencia y throughput: no disponibles; la mejora depende de la tasa de aceptacion medida en el bucle especulativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Spark-X2.6-4B-Draftfit-DSpark | 624.416.001 | no disponible | Apache 2.0 | HuggingFace (4 descargas) |
| Borrador oficial de Spark-X2.6-4B | no disponible | no disponible | no disponible | Referenciado en la model card |
| Otros borradores DSpark de Draftfit | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicos de otros borradores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo objetivo Spark-X2.6-4B y un adaptador Draftfit compatible para generar texto.
- No es un checkpoint drop-in para vLLM, SGLang ni MLX; la carga exige la referencia `SparkDSpark(official_config())`.
- Los benchmarks son internos, con solo 24 prompts por particion, exposicion previa en evaluacion e intervalos de confianza que incluyen cero; no deben interpretarse como mejoras garantizadas.
- La paridad con el runtime C++ original y el rendimiento en serving de produccion no estan verificados.
- Solo soporta ingles.
- Riesgo de sesgos y alucinacion: no documentado en la informacion disponible; al heredar el comportamiento del objetivo, cualquier sesgo del objetivo se mantiene.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia del modelo objetivo y de Draftfit puede imponer condiciones adicionales no detalladas.
- Comunidad practicamente inexistente (4 descargas, 0 likes); soporte y mantenimiento no garantizados.

## Enlaces

- HuggingFace: https://huggingface.co/jayyun98/Spark-X2.6-4B-Draftfit-DSpark
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Repositorio Draftfit: https://github.com/JayYun98/Draftfit
