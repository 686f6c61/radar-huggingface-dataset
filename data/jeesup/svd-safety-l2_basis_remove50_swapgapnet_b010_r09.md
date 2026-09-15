# Jeesup/svd-safety-l2_basis_remove50_swapgapnet_b010_r09

## Resumen

El modelo `Jeesup/svd-safety-l2_basis_remove50_swapgapnet_b010_r09` es un checkpoint de investigación desarrollado por Jeesup a partir de `meta-llama/Llama-2-7b-chat-hf`. Se trata de un experimento que combina compresión por descomposición en valores singulares (SVD) con una técnica de edición iterativa de parámetros para estudiar cómo la compresión afecta al comportamiento de seguridad del modelo y qué reglas de selección de componentes lo reparan mejor. La arquitectura es un transformer Llama-2 con 6.738.415.616 parámetros totales según los pesos en safetensors, aunque el autor indica que la compresión reduce la fracción de parámetros densos al 49,98 %. La longitud de contexto no se especifica en la información disponible, pero se hereda del modelo base, que soporta 4096 tokens.

Este modelo no es un asistente de propósito general, sino un artefacto experimental dentro de una cuadrícula de configuraciones que varían la regla de selección y el presupuesto de restauración. Su relevancia radica en que permite medir cuantitativamente el deterioro de la seguridad provocado por la compresión y evaluar la eficacia de métodos de reparación como `swapgapnet_iter`. El checkpoint es una célula intermedia de un proceso de edición de 10 rondas, con 9 rondas aplicadas y un presupuesto de restauración del 1 % de los parámetros densos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-2 (transformer) comprimido con Basis Sharing |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama-2-7b-chat soporta 4096 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-2-7b-chat-hf` y se comprime mediante Basis Sharing, una técnica presentada en ICLR 2025 que comparte bases entre grupos de 2 capas adyacentes. Según el autor, esta compresión elimina el 50,00 % de los parámetros densos, dejando una fracción de parámetros resultante de 0,4998. Tras la compresión, se aplica una edición iterativa de parámetros neutros (parameter-neutral swap) durante 9 de 10 rondas, con un presupuesto de restauración del 1,000 % de los parámetros densos. La regla de selección utilizada es `swapgapnet_iter`, que elige componentes según el valor neto de inserción y eliminación en el orden de expulsión basado en sigma.

El proceso de recuperación incluye un ajuste fino con LoRA de rango 8 sobre los coeficientes por capa, manteniendo las bases congeladas y el presupuesto sin cambios. Se entrenó durante 2 épocas con una tasa de aprendizaje de 0,0001, tamaño de lote 64 y el dataset alpaca-cleaned. No se menciona el uso de RLHF ni DPO. En el checkpoint se restauraron 4082 componentes y se intercambiaron otros 4082, con un total de 58.250.240 parámetros intercambiados, lo que representa el 0,90 % de los parámetros de proyección densos. El modelo es un artefacto de investigación y no se presenta como un modelo de chat de uso general.

## Capacidades

- Generacion de texto basica, pero el autor advierte explicitamente que no es un modelo de chat de proposito general.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni multimodalidad.
- Las capacidades multilingues no estan evaluadas ni especificadas.
- Su proposito es servir como sujeto experimental para medir el trade-off entre seguridad y utilidad bajo compresion.
- Los datos medidos incluyen tasas de exito de ataques (ASR) y tasa de sobre-rechazo, lo que permite evaluar su comportamiento de seguridad.

## Casos de uso

- Investigacion en interpretabilidad: el modelo permite analizar como la compresion por SVD altera las representaciones internas relacionadas con la seguridad, comparando capas comprimidas y restauradas.
- Evaluacion de tecnicas de reparacion de alineacion: sirve como referencia para medir la eficacia de `swapgapnet_iter` frente a otras reglas de seleccion de componentes en la restauracion del comportamiento seguro.
- Analisis de trade-offs seguridad/utilidad: los valores de ASR y over-refusal permiten cuantificar cuanta seguridad se pierde al comprimir el modelo y cuanta se recupera con cada ronda de swap.
- Desarrollo de metodos de compresion segura: el checkpoint puede usarse como caso de prueba para validar nuevas tecnicas de compresion que preserven la alineacion del modelo.
- Pruebas de robustez ante ataques adversarios: se puede emplear en conjuntos de evaluacion como HarmBench para estudiar la vulnerabilidad de modelos comprimidos a prompts maliciosos.
- Generacion de datos de evaluacion: los ataques exitosos sobre este modelo pueden utilizarse para construir datasets de entrenamiento de clasificadores de seguridad o detectores de contenido danino.

## Benchmarks y rendimiento

El autor proporciona los siguientes resultados medidos en el modelo:

| Metrica | Valor |
|---|---|
| AdvBench ASR (HarmBench judge) | 0.0596 |
| StrongREJECT ASR (HarmBench judge) | 0.1789 |
| Macro over-refusal (WildGuard) | 0.0996 |

No se han publicado comparativas con otros modelos en la informacion disponible. Estos valores corresponden exclusivamente a este checkpoint especifico dentro de la cuadricula experimental.

## Requisitos de hardware

- No se proporcionan requisitos de hardware especificos en la informacion disponible.
- El tamano del repositorio es de 13.5 GB, lo que sugiere que los pesos estan almacenados en precision FP16.
- Para cargar el modelo en FP16 se estima una necesidad de aproximadamente 13-14 GB de VRAM, pero este dato no esta confirmado por el autor.
- No se indican GPUs recomendadas ni datos de latencia o throughput.
- Las opciones de despliegue no estan documentadas; al ser un modelo Llama-2, podria ser compatible con vLLM, llama.cpp, Ollama o TGI, pero no se confirma en la informacion disponible.

## Comparativa con modelos similares

No disponible. No se han publicado comparativas con otros modelos en la informacion proporcionada. El modelo es un artefacto de investigacion dentro de una cuadricula experimental y no se han facilitado datos de rendimiento de modelos comparables.

## Limitaciones y advertencias

- El autor indica que este checkpoint es un artefacto de investigacion y no debe tratarse como un modelo de chat de proposito general.
- Varias variantes de la cuadricula estan deliberadamente degradadas en seguridad; la compresion por si sola aumenta la tasa de exito de ataques.
- Los resultados de seguridad y utilidad deben evaluarse de forma independiente antes de extraer conclusiones.
- La licencia es Llama 2 Community License, que impone restricciones de uso comercial y requiere aceptar los terminos de la licencia.
- No se han evaluado sesgos ni se han documentado limitaciones de idioma o contexto.
- Existe riesgo de alucinacion y de comportamientos no deseados al usar el modelo fuera de su ambito experimental.
- El checkpoint es una celula intermedia de un proceso de edicion mas largo, por lo que su comportamiento puede no ser estable.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove50_swapgapnet_b010_r09
