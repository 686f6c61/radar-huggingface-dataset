# 0xSojalSec/Huihui-GLM-5.3-Flash-abliterated

## Resumen

Huihui-GLM-5.3-Flash-abliterated es una version "abliterated" (sin mecanismos de rechazo) del modelo multimodal zai-org/GLM-5.3-Flash, publicada por el usuario 0xSojalSec reutilizando el procedimiento y la model card del proyecto huihui-ai. El objetivo es eliminar las respuestas de negativa del modelo base para usos de investigacion sobre seguridad, red teaming y generacion de contenido sin filtrado, a costa de perder las salvaguardas originales.

Tecnicamente es un transformer disperso (MoE): la model card menciona explicitamente "expert modules" y que solo las capas 15 a 35 (indexacion 0-based) han sido ablacionadas, mientras el resto de capas y todos los modulos de expertos quedan intactos. El peso total declarado en los safetensors es de 320.759.404.382 parametros (unos 320,8 mil millones), con capacidad de entrada de imagen y texto (pipeline image-text-to-text), licencia MIT e idiomas declarados ingles y chino.

Su relevancia practica es limitada pero concreta: es una de las pocas variantes sin censura de la familia GLM-5.x con soporte en llama.cpp (via la rama glm5next de unsloth) y cuantizaciones dinamicas con imatrix. El repo ocupa 1.559 GB y el ejemplo oficial de ejecucion usa una ventana de 262.144 tokens, lo que lo situa en la categoria de modelos de gran contexto que requieren infraestructura multi-GPU o nodos con mucha memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer disperso (MoE) con capacidad multimodal imagen-texto; capas 15-35 ablacionadas, expertos sin ablacionar |
| Parametros totales | 320.759.404.382 (~320,8 B), dato de safetensors |
| Parametros activos | no disponible (la model card confirma modulos de expertos pero no publica el ratio de activacion) |
| Longitud de contexto | no disponible como especificacion oficial; el ejemplo de la model card ejecuta `llama-cli` con `-c 262144` (256 K tokens) |
| Tipos de cuantizacion | GGUF dinamicas de Unsloth con imatrix (`UD-Q4_K_XL` confirmado, repartido en 6 shards); catalogo completo de quants no disponible; EXL3 de terceros solo mencionado en busquedas, sin confirmar |
| Idiomas soportados | en, zh (declarados en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) y GGUF; el repo ocupa 1.559 GB |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer con mezcla de expertos y torre visual, segun se deduce de la etiqueta `image-text-to-text`, del pipeline declarado y de la referencia a "expert modules" en la model card. Este derivado no reentrena nada: aplica abliteration, una tecnica de edicion de pesos que identifica la direccion del espacio de activaciones asociada a las respuestas de rechazo y la proyecta fuera de las matrices de atencion y MLP de las capas seleccionadas.

La intervencion es parcial y asi se documenta: solo las capas 15 a 35 (0-based) fueron modificadas, y todos los modulos de expertos quedaron sin tocar. Esto implica que el efecto sobre el comportamiento de rechazo puede ser desigual segun la ruta de expertos que active el router para cada prompt, y que el modelo conserva gran parte de la distribucion original del base. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el base uso RLHF o DPO; tampoco se documenta ninguna innovacion de decodificacion (especulativa, attention linear) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno con ventanas de hasta 262.144 tokens en el ejemplo oficial de llama.cpp.
- Entrada multimodal imagen-texto: acepta imagenes junto con el prompt y devuelve texto (pipeline `image-text-to-text`).
- Razonamiento y conocimiento general heredados del base GLM-5.3-Flash, sin datos publicados de evaluacion en esta variante.
- Generacion de codigo y matematicas: capacidad esperable del base, pero no documentada ni medida en esta ficha.
- Multilingue limitado a ingles y chino declarados; el castellano no figura como idioma soportado.
- Respuestas sin filtrado de rechazo en las capas ablacionadas: el modelo puede producir contenido sensible, controvertido o inapropiado que el base rechazaria.
- Tool calling / function calling: no documentado en la informacion disponible.
- Modo thinking o razonamiento extendido: no documentado en la informacion disponible.
- Soporte de agentes multi-paso: no documentado en la informacion disponible.

## Casos de uso

- Red teaming y evaluacion de seguridad: usar la variante sin censura para generar intentos de prompt malicioso y comparar la tasa de cumplimiento frente al GLM-5.3-Flash original, midiendo que capas 15-35 concentran el comportamiento de rechazo.
- Investigacion sobre abliteration: al estar ablacionadas solo 35 capas y ningun experto, sirve para estudiar como se distribuye la representacion del rechazo en un MoE de ~320 B y validar la hipotesis de que las capas mediocorticales concentran la mayor parte del efecto.
- Analisis de contenido y moderacion (lado ofensivo): generar grandes volumenes de texto sensible en un entorno controlado para entrenar o validar clasificadores de toxicidad con ejemplos que un modelo alineado no produciria.
- Procesamiento de documentos largos en chino e ingles: con 262.144 tokens de contexto en llama.cpp se pueden resumir contratos, expedientes o bases de conocimiento extensas en una sola pasada, sin troceado.
- Extraccion de informacion de imagenes tecnicas: al ser image-text-to-text, admite capturas de pantalla, diagramas o formularios escaneados y devuelve texto estructurado, util en pipelines internos de digitalizacion.
- Escritura creativa sin restricciones tematicas: narrativa de genero oscuro, ficcion violenta o dialogos adultos en un entorno de produccion editorial privado, donde el filtrado del base resulta un obstaculo.
- Despliegue en nodo propio con llama.cpp: al disponer de GGUF `UD-Q4_K_XL` con imatrix, se puede servir en hardware con 4 GPU de 80 GB o en un Mac Studio de memoria unificada alta, sin depender de APIs externas.
- Traduccion tecnica en y zh: conversion de documentacion de producto entre ambos idiomas aprovechando el contexto largo, con revision humana obligatoria por el riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra metrica, y tampoco se aportan comparaciones con el modelo base o con la version sin ablacionar.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 320,8 B de parametros totales (estimacion propia, no publicada por el autor):
  - BF16/FP16: ~641 GB de pesos, mas cache KV para 262 K tokens.
  - FP8 o GGUF Q8: ~320-340 GB.
  - GGUF Q4_K_XL: ~170-190 GB (el quant confirmado se reparte en 6 shards).
  - GGUF Q2/Q3: ~100-130 GB, con perdida de calidad no medida.
- GPU recomendadas: 8x H100 80 GB o 8x H200 141 GB para BF16; 4x H100/A100 80 GB para Q4_K_XL; 2x H200 141 GB para Q4_K_XL con algo de holgura para cache KV.
- GPU consumer: no cabe completo en ninguna consumer actual (24 GB en RTX 4090, 32 GB en RTX 5090). Solo es viable con offload parcial a RAM del sistema mediante llama.cpp, con velocidades de decodificacion muy bajas y no cuantificadas.
- Memoria unificada: un Mac Studio de 192 GB o superior puede alojar Q4_K_XL; 512 GB permite incluso Q8.
- Opciones de despliegue confirmadas: llama.cpp (build oficial reciente o la rama `glm5next` de unslothai) y transformers con los pesos safetensors. vLLM, TGI, SGLang y Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles. Al ser MoE, el coste por token depende de los parametros activos (no publicados) y no del total, por lo que el rendimiento real puede ser muy superior al de un modelo denso de 320 B con el mismo peso en memoria; sin datos de activacion no es posible estimarlo con rigor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| 0xSojalSec/Huihui-GLM-5.3-Flash-abliterated | ~320,8 B totales, activos no disponibles | 262.144 tokens en el ejemplo oficial | imagen-texto | MIT | Publicado el 2026-10-25, 0 descargas, 0 likes |
| zai-org/GLM-5.3-Flash (base) | no disponible | no disponible | imagen-texto | no disponible | Modelo original, con filtrado de seguridad intacto |
| unsloth/GLM-5.3-Flash-GGUF | mismo base, quants dinamicos | no disponible | imagen-texto | no disponible | Origen de los GGUF usados por esta variante, sin ablacionar |
| Huihui-GLM-5.2-abliterated-GGUF | no disponible (mencionado como 40 B activos y 1 M de contexto para la generacion 5.2, sin confirmar) | no disponible | texto | no disponible | Generacion anterior del mismo procedimiento, citada en busquedas |

No se dispone de datos de rendimiento para ninguna de las filas, por lo que la comparativa se limita a parametros, modalidad, licencia y disponibilidad.

## Limitaciones y advertencias

- Riesgo alto de contenido sensible: el filtrado de rechazo esta reducido por diseno; la propia model card advierte de contenido controvertido, inapropiado o no apto para menores.
- Ablacion incompleta: solo las capas 15-35 y ningun experto fueron modificados, por lo que el comportamiento puede ser incoherente (rechazos que desaparecen en unas rutas y persisten en otras) y no hay evaluacion publicada del grado real de supresion.
- Sin benchmarks ni evaluacion de degradacion: no se ha medido la perdida de calidad, coherencia o conocimiento respecto al base tras la edicion de pesos.
- Alucinacion: sin datos especificos de esta variante; el riesgo es el habitual en modelos de ~320 B y se agrava al no existir evaluaciones.
- Contexto: el unico dato es el `-c 262144` del ejemplo; no se documenta la longitud maxima oficial ni el coste de cache KV a esa ventana, que puede ser prohibitivo en configuraciones de 4 GPU.
- Idioma: solo ingles y chino declarados; el rendimiento en castellano no esta verificado y no deberia asumirse.
- Atribucion y procedencia confusas: el repo pertenece a 0xSojalSec, pero la model card esta escrita por huihui-ai e incluye enlaces de donacion de terceros; los GGUF provienen de unsloth. Conviene verificar que los pesos publicados corresponden realmente al procedimiento descrito antes de usarlos en produccion.
- Licencia MIT declarada en los metadatos, pero la del modelo base figura como "no disponible" en la informacion proporcionada; la compatibilidad comercial del derivado depende de la licencia del base y no esta confirmada.
- Despliegue: requiere llama.cpp actualizado o la rama especifica de unslothai; no hay confirmacion de soporte en vLLM, TGI u Ollama, lo que limita el uso en infraestructura estandar de serving.
- Uso recomendado por el propio autor: investigacion, pruebas y entornos controlados; no produccion ni aplicaciones comerciales de cara al publico.
- Repo de 1.559 GB: la descarga completa es costosa; conviene bajar solo el quant necesario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xSojalSec/Huihui-GLM-5.3-Flash-abliterated
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- GGUF de origen (unsloth): https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Repositorio del metodo de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Rama de llama.cpp para GLM-5.x de unsloth: https://github.com/unslothai/llama.cpp/tree/glm5next/upstream
- Pagina Ko-fi citada en la model card: https://ko-fi.com/huihuiai
- Referencia en redes sobre la variante abliterada de la generacion anterior: https://www.facebook.com/0xSojalSec/posts/uncensored-version-of-glm-52-via-abliteration-easier-to-run-locally40b-active-1m/1560314268956304/
