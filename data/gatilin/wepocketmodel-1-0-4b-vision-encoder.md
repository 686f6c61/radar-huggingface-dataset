# gatilin/wepocketmodel-1-0-4b-vision-encoder

## Resumen

WePocketModel 1.0 4B visual encoder es un componente extraido del modelo multimodal WePocketModel1.0-4B desarrollado por Tencent WeChat AI. No se trata de un modelo completo, sino de la torre visual (vision tower) y el merger visual del sistema original, con los 297 tensores en BF16 que componen dichas partes y el prefijo `model.visual.` eliminado. El resultado son 333.514.240 parametros dedicados exclusivamente a la extraccion de caracteristicas visuales.

El modelo resuelve un problema concreto de ingenieria: permitir reutilizar la parte visual de WePocketModel de forma aislada, sin necesidad de cargar el sistema completo (que incluye el modelo de lenguaje, las cabezas de tarea y el runtime de seleccion de tokens visuales MGVB). Esto es util para investigacion sobre representaciones visuales, para integraciones parciales y para analisis de componentes.

Es relevante ahora porque los modelos multimodales de gran tamano son dificiles de diseccionar y reutilizar por partes; publicar un encoder visual exacto, con validacion de carga y trazabilidad de procedencia, facilita el estudio y la reutilizacion. La arquitectura subyacente es la vision tower de Qwen3.5 con su merger aprendido, con un ancho de salida del merger de 2560 dimensiones. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision tower de Qwen3.5 con merger visual aprendido (componente extraido de WePocketModel1.0-4B) |
| Parametros totales | 333.514.240 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (componente de extraccion de caracteristicas, no genera texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (componente visual, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (297 tensores BF16) |

## Arquitectura y entrenamiento

El componente corresponde a la torre visual del modelo Qwen3.5 empleada en WePocketModel1.0-4B, junto con su merger visual aprendido. El merger proyecta las representaciones visuales a un ancho de salida de 2560 dimensiones. Los tensores se han extraido conservando bytes y formas originales, eliminando unicamente el prefijo `model.visual.`. No se ha reentrenado ni modificado ningun peso: se trata de una extraccion exacta del checkpoint original en la revision `d57517468ff546df8cb9c6da5c76319810d3523b`.

La procedencia se documento descargando los rangos de origen desde el espejo oficial de WeChat-Vision en ModelScope, verificando los metadatos SHA-256 de los shards LFS contra la revision fijada de Hugging Face y comparando byte a byte el payload exportado con los rangos descargados. No se descargaron ni hashearon de forma independiente los shards completos. El autor proporciona `component.py` para cargar la arquitectura Qwen3.5 y el merger, junto con `source_config.json`, `processor_config.json`, mapeo de tensores, requisitos y un test de referencia en CPU. La validacion incluyo dos imagenes reales de COCO con inferencia visual en FP32 sobre CPU, comprobando las capas de atencion 0, 11 y 23 contra atencion softmax explicita tras RoPE; las imagenes se redimensionaron a 224x224, por debajo del minimo del procesador de origen, por lo que se trata de una prueba de humo del componente y no de una evaluacion de calidad a resolucion nativa ni de extremo a extremo.

## Capacidades

- Extraccion de caracteristicas visuales a partir de imagenes, produciendo representaciones de 2560 dimensiones tras el merger.
- Vision por computador de proposito general como componente de un sistema multimodal mayor (comprension de imagenes en el modelo padre).
- Integracion en pipelines de transformers mediante la clase de vision de Qwen3.5 y el merger aprendido.
- No incluye generacion de texto, tool calling, razonamiento multi-paso ni capacidades de agente: esas funciones residen en el modelo de lenguaje del sistema padre, que no forma parte de este repositorio.
- No soporta generacion de imagenes (el modelo padre tampoco lo hace).
- Capacidades multilingues: no aplicables a este componente.

## Casos de uso

- Investigacion sobre representaciones visuales: cargar la torre y el merger para analizar los embeddings producidos por un encoder multimodal de referencia, comparando activaciones entre capas de atencion y estudiando la geometria del espacio latente visual.
- Destilacion de caracteristicas: usar el encoder como profesor visual para entrenar modelos mas pequenos, aprovechando que los pesos son exactos y la licencia Apache-2.0 permite uso comercial.
- Evaluacion de componentes multimodales: emplear el test de referencia en CPU y la validacion de capas de atencion como base para verificar la correcta carga de pesos en entornos propios antes de integrarlos en sistemas mayores.
- Analisis de procedencia y reproducibilidad: el repositorio incluye `extraction.json`, `mirror_provenance.json` y `tensor_mapping.json`, utiles para auditar como se extrajo un subconjunto de un checkpoint grande y verificar su integridad.
- Prototipado de pipelines de vision previos al LLM: extraer embeddings visuales con este componente y conectarlos a un modelo de lenguaje propio para construir un sistema multimodal a medida, siempre que se respete el presupuesto de tokens y el comportamiento del sistema original documentado en el repositorio de Tencent.
- Comparacion entre variantes: el autor documenta que las versiones 2B y 4B comparten 295 tensores con la misma forma pero ningun valor identico, lo que permite estudios controlados de diferencias de pesos entre escalas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion reportada es una prueba de humo: dos imagenes COCO a 224x224 procesadas en FP32 sobre CPU, con comprobacion de las capas de atencion 0, 11 y 23 frente a atencion softmax explicita tras RoPE. No hay metricas de calidad, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,67 GB en BF16 (333,5 M de parametros x 2 bytes); alrededor de 0,33 GB si se convierte a FP16/FP32 reducido segun el caso, aunque los pesos publicados son BF16.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente para el componente aislado; para lotes grandes o resoluciones altas conviene una GPU con mayor memoria (RTX 3090/4090, A100, H100).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1660, RTX 3060, RTX 4060, etc.), dado su tamano reducido.
- Opciones de despliegue: transformers con la implementacion de Qwen3.5 y `component.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este componente.
- Latencia y throughput: no disponibles. La validacion se hizo en CPU en FP32 y no se publican tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gatilin/wepocketmodel-1-0-4b-vision-encoder | 333,5 M | no disponible | Apache-2.0 | Hugging Face | Componente visual extraido, sin LLM |
| tencent/WePocketModel1.0-4B | no disponible | no disponible | Apache-2.0 | Hugging Face | Sistema completo (vision + LLM + cabezas + MGVB) |
| Vision tower de Qwen3.5 (upstream) | no disponible | no disponible | no disponible | no disponible | Arquitectura de origen del componente |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo completo: carece de modelo de lenguaje, cabezas de tarea y runtime de seleccion de tokens visuales MGVB, por lo que no puede realizar comprension de imagenes de extremo a extremo ni generar texto.
- La validacion publicada es una prueba de humo a 224x224, por debajo del minimo del procesador de origen; no hay evidencia de calidad a resolucion nativa ni en tareas downstream.
- No se han descargado ni hasheado de forma independiente los shards completos de origen; la procedencia se basa en la verificacion de metadatos LFS y la comparacion byte a byte de los rangos exportados.
- Riesgo de alucinacion y sesgos: no aplicables directamente a este componente, pero heredables del modelo padre si se integra en un sistema completo; no se documentan sesgos especificos.
- Licencia Apache-2.0 permite uso comercial, pero se debe mantener el aviso de copyright y atribuir a Tencent WeChat AI y a los contribuidores upstream.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-11-26) es futura respecto a la mayoria de referencias; conviene verificar la vigencia del repositorio antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/gatilin/wepocketmodel-1-0-4b-vision-encoder
- Modelo base: https://huggingface.co/tencent/WePocketModel1.0-4B
- Implementacion upstream: https://github.com/Tencent/WePocketModel
