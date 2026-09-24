# Dohyeon1/LFM2-Sub-MoE-ngroups24-maxcls2

## Resumen

Dohyeon1/LFM2-Sub-MoE-ngroups24-maxcls2 es un modelo de generacion de texto publicado por el usuario Dohyeon1 (Dohyeon Kim) en Hugging Face. Se trata de una variante experimental construida sobre la arquitectura LFM2-MoE de Liquid AI, tal como indica la etiqueta `lfm2_moe` del repositorio, y su nombre sugiere una modificacion de la configuracion de enrutamiento de expertos (24 grupos de expertos, `ngroups24`) y de la seleccion de expertos por token. El checkpoint ocupa 16,7 GB en safetensors y declara 8.339.930.560 parametros totales, una cifra coherente con el modelo base LFM2-8B-A1B.

El modelo base de la familia, LFM2-MoE, combina una arquitectura hibrida con capas de convolucion y atencion, e incorpora mezcla dispersa de expertos (MoE) para separar parametros totales de parametros activos; la primera publicacion oficial de esta familia, LFM2-8B-A1B, declara 8,3 mil millones de parametros totales y 1,5 mil millones activos. Esta variante concreta no aporta model card sustantiva: el README es la plantilla autogenerada de `transformers` y no incluye informacion sobre datos de entrenamiento, evaluacion ni licencia.

La relevancia de este repositorio es limitada y de caracter exploratorio: no tiene descargas ni valoraciones, no publica resultados de benchmarks y no documenta su proceso de entrenamiento. Resulta de interes unicamente para quienes investigan tecnicas de enrutamiento en arquitecturas MoE hibridas, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso sobre arquitectura hibrida LFM2 (convolucion y atencion); etiqueta `lfm2_moe`. Detalle exacto no disponible |
| Parametros totales | 8.339.930.560 (aproximadamente 8,34 mil millones) |
| Parametros activos | no disponible en la informacion proporcionada (el modelo base LFM2-8B-A1B declara 1,5 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se distribuyen pesos en safetensors (16,7 GB, compatible con bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base LFM2 se publica bajo LFM Open License, dato no confirmado para esta variante) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La etiqueta `lfm2_moe` y la libreria declarada (`transformers`) sitúan el modelo en la familia LFM2-MoE de Liquid AI. Esta familia emplea un diseno hibrido que alterna capas convolucionales de corto alcance con capas de atencion, y sustituye parte de las capas feed-forward densas por capas de mezcla dispersa de expertos. El sufijo `Sub-MoE-ngroups24-maxcls2` apunta a una reconfiguracion del enrutador: 24 grupos de expertos y algun criterio de seleccion limitado a 2 clases o expertos, probablemente una modificacion de la funcion de enrutamiento respecto al checkpoint original.

No hay informacion sobre el entrenamiento. La model card no documenta el numero de tokens, la composicion del dataset, si hubo ajuste por instrucciones (SFT), alineamiento con RLHF o DPO, ni las hiperparametros de entrenamiento. Tampoco se describe si la variante se obtuvo por reentrenamiento del enrutador, por poda y agrupamiento de expertos, o por inicializacion desde un checkpoint base. El unico enlace tecnico presente en las etiquetas es `arxiv:1910.09700`, que corresponde al articulo de Lacoste et al. sobre el calculo del impacto ambiental del aprendizaje automatico y no a un paper del modelo.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` indican uso previsto como modelo de chat o continuacion de texto, si bien no se detalla ninguna capacidad concreta.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Modalidades adicionales (vision, audio): no disponible.
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

- Investigacion sobre enrutamiento MoE: el modelo puede utilizarse como sujeto de experimentos para comparar estrategias de agrupamiento de expertos (24 grupos) frente al enrutamiento original de LFM2-MoE, midiendo el impacto en perplejidad y en coste de inferencia.
- Analisis de eficiencia de arquitecturas hibridas: sirve para estudiar como afecta la reconfiguracion de expertos a la relacion entre parametros totales y parametros activos en una arquitectura que combina convolucion y atencion.
- Reproduccion de experimentos de la comunidad: dado que el autor mantiene otros modelos de tipo "Sub-MoE" (por ejemplo, variantes sobre OLMoE), este checkpoint puede emplearse para reproducir y auditar sus resultados.
- Evaluacion comparativa interna: util como linea base adicional en estudios academicos que comparen checkpoints derivados de LFM2-8B-A1B, siempre que se verifiquen previamente sus capacidades reales.
- Prototipado limitado en local: con los pesos en bf16 ocupa unos 16,7 GB, de modo que puede cargarse en una GPU de 24 GB para pruebas de generacion, sin garantias de calidad.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni ninguna aplicacion de cara al usuario: no hay model card, ni evaluacion, ni licencia declarada que respalde dichos escenarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion, no hay seccion de resultados en la model card y la busqueda web no aporta metricas de MMLU, HumanEval, GSM8K ni de ninguna otra prueba. La etiqueta `arxiv:1910.09700` no corresponde a un articulo de evaluacion del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16 o fp16, alrededor de 16,7 GB solo para pesos; en cuantizacion de 8 bits, unos 8,4 GB; en 4 bits, unos 4,2 GB. Estas cifras son estimaciones a partir del numero de parametros, ya que no se publican pesos cuantizados.
- GPU recomendadas: una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, L40S, A10G) es suficiente para cargar los pesos en bf16 sin cuantizar. Para mayor margen de contexto o lotes grandes, se recomienda A100 40/80 GB o H100.
- Encaje en GPU de consumo: si, es viable en tarjetas de 24 GB con los pesos completos, y en tarjetas de 12-16 GB recurriendo a cuantizacion de 8 o 4 bits, siempre que la reconfiguracion MoE sea compatible con las herramientas de cuantizacion disponibles.
- Opciones de despliegue: al distribuirse unicamente en safetensors y con la etiqueta `lfm2_moe`, el despliegue natural es `transformers` (se requiere una version que reconozca la arquitectura LFM2-MoE). vLLM puede servir la familia LFM2-MoE, aunque la compatibilidad con esta variante modificada no esta verificada. No se ofrecen pesos GGUF, por lo que llama.cpp y Ollama no estan soportados de forma directa. La etiqueta `endpoints_compatible` sugiere compatibilidad con los endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dohyeon1/LFM2-Sub-MoE-ngroups24-maxcls2 | 8,34 mil millones | no disponible | no disponible | no disponible | safetensors en Hugging Face |
| Liquid AI LFM2-8B-A1B | 8,3 mil millones | 1,5 mil millones | no disponible | LFM Open License | safetensors y GGUF en Hugging Face |
| Dohyeon1/LFM2-Sub-MoE-ngroups24 | no disponible | no disponible | no disponible | no disponible | safetensors en Hugging Face |
| Dohyeon1/OLMoE-Sub-MoE-fix-ngroups48 | 7 mil millones (segun el autor) | no disponible | no disponible | no disponible | safetensors en Hugging Face |

La comparacion se limita a los datos publicos de cada repositorio. No hay informacion de rendimiento que permita contrastar calidad entre estas variantes.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla autogenerada de `transformers`, sin informacion sobre entrenamiento, datos ni evaluacion.
- Licencia no declarada: no se especifica la licencia en las etiquetas ni en el README, por lo que no puede asumirse permiso para uso comercial. Cualquier uso en produccion requeriria contactar con el autor.
- Riesgo de alucinacion y de salidas de baja calidad: al no existir evaluacion publicada, no hay evidencia de que el modelo genere texto fiable.
- Idiomas y contexto desconocidos: no se declara cobertura linguistica ni longitud de contexto, lo que impide planificar aplicaciones multilingues o con contexto largo.
- Modificacion no estandar de la arquitectura: la reconfiguracion del enrutador MoE (`ngroups24`, `maxcls2`) puede provocar incompatibilidades con versiones de `transformers`, vLLM u otras herramientas que no contemplen esta variante.
- Sesgos: no disponibles; no se ha publicado ninguna evaluacion de sesgo.
- Repositorio sin traccion: cero descargas y cero valoraciones, sin discusiones ni validacion por parte de la comunidad.
- Fecha de publicacion atipica: el repositorio figura como creado el 23 de septiembre de 2026, dato que conviene verificar en el propio Hub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dohyeon1/LFM2-Sub-MoE-ngroups24-maxcls2
- Repositorio hermano con la misma configuracion base: https://huggingface.co/Dohyeon1/LFM2-Sub-MoE-ngroups24
- Discusiones del repositorio: https://huggingface.co/Dohyeon1/LFM2-Sub-MoE-ngroups24/discussions
- Perfil del autor: https://hf-p-cfw.fyan.top/Dohyeon1/models
- Documentacion de LFM2-MoE en transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/lfm2_moe.md
- Ficha de referencia de LFM2-MoE (Liquid AI): https://huggingface.co/LiquidAI/LFM2-8B-A1B
- Articulo citado en las etiquetas (calculo de impacto ambiental, no paper del modelo): https://arxiv.org/abs/1910.09700
- Entrada en registro de terceros: https://free2aitools.com/model/dohyeon1/lfm2-sub-moe-ngroups24
