# mradermacher/ZwZ2-4B-Surgical-Abliterated-i1-GGUF

## Resumen

ZwZ2-4B-Surgical-Abliterated-i1-GGUF es una colección de cuantizaciones GGUF con imatrix (matriz de importancia) del modelo medismera/ZwZ2-4B-Surgical-Abliterated, publicada por mradermacher, un cuantizador muy prolífico de la comunidad de Hugging Face. El modelo base es un modelo de lenguaje causal de unos 4.200 millones de parámetros (4.205.751.296 según los safetensors), etiquetado como "abliterated" y "uncensored" con la técnica de "surgical alignment", lo que significa que se han eliminado sus mecanismos de rechazo de peticiones (refusals) mediante intervención directa sobre sus activaciones, sin reentrenamiento completo.

La relevancia de esta ficha no está tanto en el modelo base en sí, sino en la disponibilidad de cuantizaciones ligeras: desde IQ1_S (1,5 GB) hasta Q6_K (3,6 GB), lo que permite ejecutar el modelo en hardware muy modesto, incluidas GPU de consumo, portátiles e incluso dispositivos de gama baja. Según el autor, se trata además de un modelo con capacidades de visión (los archivos mmproj se publican en el repositorio estático asociado).

Debe subrayarse que los modelos abliterated eliminan las salvaguardas de seguridad originales, por lo que su uso exige especial responsabilidad por parte del desarrollador: no cuentan con filtros de rechazo y pueden obedecer instrucciones que el modelo original denegaría. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm); variante base no disponible en detalle |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un transformer de lenguaje causal de aproximadamente 4,2 mil millones de parámetros. El repositorio de mradermacher no modifica la arquitectura ni los pesos del modelo base: se limita a generar cuantizaciones GGUF ponderadas mediante imatrix (importance matrix), una técnica que calcula la importancia de cada activación usando un corpus de calibración y permite mantener mayor calidad a niveles de cuantización bajos (especialmente en las variantes IQ de ikawrakow). El autor señala que las cuantizaciones IQ suelen ser preferibles a las K de tamaño similar.

Sobre el modelo base, medismera/ZwZ2-4B-Surgical-Abliterated, la información disponible indica que ha sido sometido a un proceso de "abliteración" mediante "surgical alignment", es decir, una modificación quirúrgica dirigida a suprimir los rechazos del modelo. No se dispone de datos sobre el dataset de entrenamiento, el número de tokens, el uso de RLHF/DPO ni la identidad del modelo original del que deriva. La model card del cuantizador indica que se trata de un modelo de visión, con los proyectores multimodales (mmproj) disponibles en el repositorio estático asociado.

## Capacidades

- Generacion de texto conversacional (etiquetado como conversational), sin mecanismos de rechazo por ser un modelo abliterated.
- Capacidades de vision: el autor indica que es un modelo de vision y que los archivos mmproj se publican en el repositorio estatico asociado.
- Ejecucion local eficiente gracias a las 24 cuantizaciones disponibles, desde 1,5 GB (IQ1_S) hasta 3,6 GB (Q6_K).
- Compatibilidad con el ecosistema GGUF: llama.cpp, Ollama, LM Studio, KoboldCpp y derivados.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible (no consta en la informacion proporcionada).
- Capacidades de codigo y matematicas especificas: no disponible.

## Casos de uso

- Experimentacion con modelos sin censura en investigacion de seguridad: permite estudiar el comportamiento de un modelo al que se le han suprimido los rechazos, util para red-teaming y analisis de alineamiento.
- Despliegue en hardware de consumo: con la cuantizacion Q4_K_M (2,8 GB) cabe comodamente en una RTX 3060 de 12 GB o incluso en GPUs de 8 GB, dejando espacio para el contexto.
- Ejecucion en CPU o portatiles: las variantes IQ2 e IQ3 (1,6-2,4 GB) permiten inferencia en maquinas sin GPU dedicada mediante llama.cpp.
- Asistentes conversacionales locales sin filtros: para aplicaciones de chat donde el desarrollador quiere controlar por si mismo las politicas de moderacion en lugar de depender de los refusals del modelo.
- Prototipado rapido de agentes locales: su tamano de 4B permite latencias bajas en hardware modesto, adecuado para iterar pipelines de agentes antes de escalar a modelos mayores.
- Analisis de vision en local: combinando los GGUF con los archivos mmproj del repositorio estatico se pueden construir aplicaciones de descripcion de imagenes que ejecuten todo el pipeline en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion elegida; IQ1_S/IQ1_M ocupan 1,5 GB, Q4_K_M ocupa 2,8 GB y Q6_K ocupa 3,6 GB, mas la memoria necesaria para el contexto (KV cache).
- GPU recomendadas: cualquier GPU moderna con 4-6 GB de VRAM ejecuta la mayoria de las cuantizaciones (RTX 3060, RTX 4060, RTX 4070); en GPUs de 8 GB como la RTX 4070 Super cabe Q6_K con contexto amplio.
- Consumer GPUs: si, es el caso de uso principal; incluso integradas o GPUs de 4 GB pueden ejecutar las variantes IQ2/IQ3.
- CPU: totalmente viable con llama.cpp; las variantes de 1,5-2,4 GB son adecuadas para equipos sin GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, GPT4All y cualquier runtime compatible con GGUF. No se recomienda vLLM/TGI para GGUF (usan formatos propios; para esos servidores habria que usar los safetensors del modelo base).
- Latencia y throughput estimados: no disponible; al ser un modelo de 4B cuantizado, se esperan velocidades altas incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Particularidad |
|---|---|---|---|---|
| ZwZ2-4B-Surgical-Abliterated-i1-GGUF | 4,2B | GGUF (imatrix, 24 quants) | Apache 2.0 | Abliterated, con vision |
| Qwen3-4B (GGUF) | 4B | GGUF, safetensors | Apache 2.0 | Modelo original con salvaguardas, soporte de thinking mode |
| Phi-4-mini (cuantizado) | 3,8B | GGUF, safetensors | MIT | Sin abliterar, fuerte en razonamiento y codigo |
| Gemma 3 4B | 4B | GGUF, safetensors | Gemma license | Multimodal (vision), licencia restrictiva frente a Apache 2.0 |

La diferencia clave frente a los alternativos es la abliteracion: los modelos originales conservan sus mecanismos de rechazo, mientras que esta version los elimina. A cambio, no hay datos publicos de benchmarks que permitan verificar si la calidad se ha degradado respecto al modelo del que deriva.

## Limitaciones y advertencias

- Modelo abliterated: carece de salvaguardas y puede generar contenido que el modelo original rechazaria. El despliegue en produccion exige capas de moderacion propias y puede plantear riesgos legales y eticos segun la jurisdiccion y el caso de uso.
- Riesgo de alucinacion: no disponible de forma especifica, pero como todo LLM de 4B puede alucinar; la abliteracion no reduce este riesgo y algunos procesos de abliteracion degradan ligeramente la coherencia general.
- Idioma: la model card declara solo ingles; el rendimiento en castellano no esta documentado y puede ser inferior.
- Longitud de contexto: no documentada en esta ficha; consultar el modelo base antes de disenar aplicaciones con documentos largos.
- Cuantizaciones muy agresivas: el propio autor advierte que IQ1_S/IQ1_M son "para desesperados" y que Q2_K_S tiene calidad muy baja; para uso serio se recomienda Q4_K_M o superior.
- Licencia: Apache 2.0 no impone restricciones comerciales, pero la procedencia del modelo base (y las licencias de sus datos de entrenamiento) no esta documentada en la informacion disponible.
- La abliteracion es una modificacion no oficial: ni el creador del modelo original ni mradermacher ofrecen garantias sobre estabilidad o calidad tras la intervencion.

## Enlaces

- Repositorio GGUF (imatrix): https://huggingface.co/mradermacher/ZwZ2-4B-Surgical-Abliterated-i1-GGUF
- Repositorio GGUF estatico (incluye mmproj): https://huggingface.co/mradermacher/ZwZ2-4B-Surgical-Abliterated-GGUF
- Modelo base: https://huggingface.co/medismera/ZwZ2-4B-Surgical-Abliterated
- Pagina de descargas del autor: https://hf.tst.eu/model#ZwZ2-4B-Surgical-Abliterated-i1-GGUF
- Guia de uso de GGUF referenciada: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Paper, demo y blog: no disponible
