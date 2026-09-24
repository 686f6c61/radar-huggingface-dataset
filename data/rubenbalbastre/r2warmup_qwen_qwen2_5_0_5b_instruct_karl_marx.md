# rubenbalbastre/r2warmup_qwen_qwen2_5_0_5b_instruct_karl_marx

## Resumen

`rubenbalbastre/r2warmup_qwen_qwen2_5_0_5b_instruct_karl_marx` es un adaptador LoRA (librería PEFT) entrenado mediante SFT sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador en formato safetensors que debe cargarse junto al modelo base para funcionar. El repositorio ocupa 0,2 GB y fue publicado el 24 de septiembre de 2026 por el usuario `rubenbalbastre`, sin descargas ni interacciones registradas en el momento de redactar esta ficha.

El identificador del repositorio (`r2warmup...karl_marx`) y una de las etiquetas del modelo apuntan a una ruta local denominada `machine-unlearning-llm`, lo que sugiere que el adaptador forma parte de un experimento de desaprendizaje automático (machine unlearning) o de ajuste de comportamiento sobre una figura o conjunto de conocimiento concreto. No obstante, la model card publicada es la plantilla por defecto de HuggingFace y no contiene ninguna confirmación de estos extremos, por lo que esa interpretación es solo inferencial.

La relevancia de esta ficha es fundamentalmente metodológica: sirve como ejemplo de adaptador LoRA de investigación sobre un modelo pequeño (0,5B parámetros), útil para reproducir pipelines de SFT con TRL/PEFT, para probar técnicas de desaprendizaje y para validar infraestructura de despliegue antes de escalar a modelos mayores. Al no existir documentación de entrenamiento, evaluación ni licencia, no es apto para uso en producción sin una verificación previa por parte de quien lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only Qwen2 (clase `Qwen2ForCausalLM` en el modelo base) |
| Parametros totales | Modelo base: 0,49B (Qwen2.5-0.5B-Instruct). Adaptador: no disponible (el repositorio completo ocupa 0,2 GB) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 tokens según la documentación pública del modelo base; no declarado ni confirmado en el adaptador |
| Tipos de cuantizacion | No disponible en el repositorio. Al ser un adaptador LoRA, la cuantizacion depende del modelo base fusionado o cargado (posible int8/int4/AWQ/GPTQ mediante herramientas externas) |
| Idiomas soportados | No declarado en el adaptador. El modelo base declara soporte para 29 idiomas, entre ellos español, inglés, chino, francés, alemán, portugués, ruso, árabe y japonés |
| Licencia | No disponible en el repositorio. El modelo base se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria de carga | peft 0.19.1 (con transformers y trl) |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | text-generation |
| Fecha de publicacion | 2026-09-24 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) sobre un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y atención con consultas agrupadas (GQA), que es la arquitectura del modelo base Qwen2.5-0.5B-Instruct. El entrenamiento se realizó con la librería TRL mediante ajuste supervisado (etiquetas `lora` y `sft`), y los pesos se serializaron con PEFT 0.19.1. El nombre del repositorio incluye el prefijo `r2warmup`, que sugiere una fase de calentamiento dentro de un pipeline mayor, pero no hay información publicada sobre hiperparámetros, rango del adaptador, tasa de aprendizaje, número de pasos ni composición del dataset.

La única pista documental sobre el propósito del entrenamiento es la ruta local incrustada en las etiquetas (`/storage/scratch/lv13/lv13594/machine-unlearning-llm/outputs/model/Qwen--Qwen2.5-0.5B-Instruct`), coherente con un proyecto de machine unlearning sobre un clúster de cálculo. El sufijo `karl_marx` apunta a que el ajuste busca modificar la respuesta del modelo en torno a una figura o dominio concreto, presumiblemente eliminando o reforzando conocimiento relacionado. No hay ninguna innovación técnica documentada: no se mencionan decodificación especulativa, atención lineal, RLHF ni DPO.

## Capacidades

- Generación de texto conversacional multturno, en el nivel propio de un modelo de 0,5B parámetros; no se han publicado evaluaciones específicas del adaptador.
- Razonamiento básico y respuestas a preguntas simples. El techo de capacidad está limitado por el tamaño del modelo base, no por el adaptador.
- Soporte de tool calling y function calling heredado del modelo base Qwen2.5, que se entrenó con plantillas de herramientas. El adaptador no confirma ni documenta que esta capacidad se conserve.
- Soporte de flujos de agente y razonamiento multi-paso muy limitado: 0,5B parámetros es insuficiente para planificación fiable en varios pasos.
- Capacidades multilingües heredadas del modelo base (29 idiomas declarados), sin confirmación en el adaptador.
- Capacidad potencial de actuar como modelo de "desaprendizaje": el propósito declarado en las etiquetas es modificar el comportamiento del modelo base en un dominio concreto. No hay ninguna evaluación que cuantifique el grado de olvido o de retención alcanzado.
- Sin capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Investigación en machine unlearning: el adaptador puede usarse como punto de partida para reproducir o comparar técnicas de desaprendizaje sobre un modelo de 0,5B, midiendo la degradación en benchmarks generales frente a la supresión del conocimiento objetivo.
- Validación de pipelines PEFT/TRL: sirve para verificar que un flujo de carga de adaptadores, fusión con el modelo base y serialización funciona correctamente antes de aplicarlo a modelos de mayor tamaño.
- Desarrollo y pruebas en hardware muy limitado: al ser un adaptador sobre 0,5B, cabe en CPU, en una Raspberry Pi 5 o en cualquier GPU integrada, lo que permite prototipar interfaces conversacionales sin infraestructura dedicada.
- Generación de datos sintéticos de bajo coste: útil para producir borradores, paráfrasis o etiquetas preliminares que después se filtran con un modelo mayor.
- Docencia y demostraciones: su tamaño reducido permite ilustrar en clase cómo funciona el ajuste por LoRA, la diferencia entre pesos base y adaptador, y el efecto del ajuste sobre las respuestas.
- Pruebas de regresión de infraestructura: sirve como modelo de juguete para medir latencia, consumo de VRAM y comportamiento de servidores como vLLM, TGI u Ollama antes de desplegar modelos de producción.
- Filtrado o clasificación de textos temáticos: si el ajuste ha especializado el modelo en un dominio concreto, puede emplearse como clasificador auxiliar, siempre que se valide su precisión previamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio es la plantilla por defecto y todas las secciones de evaluación figuran como `[More Information Needed]`.

## Requisitos de hardware

- VRAM estimada para el modelo base en precisión completa: aproximadamente 1 GB en fp16 (2 bytes por parámetro × 0,49B), y alrededor de 2 GB en fp32.
- VRAM estimada en cuantización de 4 bits: en torno a 0,35-0,4 GB para los pesos, más el consumo del contexto (la caché KV crece con la longitud de secuencia).
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre es suficiente. Funciona en RTX 3060, RTX 4060, RTX 4090, A100, H100 y también en GPU integradas y en CPU. No requiere hardware de gama alta.
- Compatibilidad con GPU de consumo: sí, en todas las GPU de consumo actuales e incluso en aceleradores de borde y en CPU.
- Opciones de despliegue: transformers con PEFT (carga directa del adaptador), fusión del adaptador y conversión a GGUF para llama.cpp u Ollama, vLLM y TGI tras fusionar los pesos, y servidores compatibles con la API de OpenAI.
- Latencia y throughput: no disponibles. No hay mediciones publicadas en la información proporcionada. Cualquier cifra que se cite debe medirse en el entorno concreto de despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen2.5-0.5B-Instruct) | Adaptador LoRA sobre 0,49B | No confirmado (32.768 en el base) | No disponible | HuggingFace, 0 descargas | Pesos de adaptador safetensors; requiere el modelo base |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens | Apache 2.0 | HuggingFace, ampliamente utilizado | Modelo base de referencia; incluye tool calling y soporte multilingüe |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | HuggingFace | Mismo tokenizador y familia; mejor calidad de razonamiento a cambio de más VRAM |
| HuggingFaceTB/SmolLM2-360M-Instruct | 0,36B | 8.192 tokens | Apache 2.0 | HuggingFace | Alternativa de tamaño similar orientada a dispositivos de borde |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2.048 tokens | Apache 2.0 | HuggingFace | Contexto mucho menor; familia distinta (arquitectura Llama) |

Los datos de los modelos comparados provienen de su documentación pública y pueden variar; no se han verificado en el contexto de este repositorio.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento, hiperparámetros ni procedencia del dataset, por lo que no es posible evaluar riesgos de sesgo de forma informada.
- Riesgo de alucinación elevado: el modelo base tiene 0,49B parámetros, un tamaño en el que la generación de hechos inventados es frecuente, especialmente en tareas de conocimiento factual y razonamiento multi-paso.
- El ajuste por SFT sobre un modelo tan pequeño puede degradar capacidades generales (olvido catastrófico) sin que exista ninguna evaluación publicada que lo cuantifique.
- No hay información sobre el grado de éxito del supuesto desaprendizaje: se desconoce si el conocimiento objetivo se ha eliminado, si se ha reforzado o si simplemente se ha enmascarado de forma superficial y reversible.
- Licencia no disponible: al no declararse una licencia en el repositorio, no se puede asumir permiso de uso comercial sobre el adaptador, aunque el modelo base sea Apache 2.0. Es necesario contactar con el autor antes de cualquier uso en producción.
- Idiomas no declarados en el adaptador. Aunque el modelo base cubre 29 idiomas, el ajuste puede haber reducido el rendimiento en idiomas distintos del usado durante el entrenamiento.
- Contexto no confirmado: los 32.768 tokens corresponden al modelo base; el adaptador podría haberse entrenado con secuencias más cortas, lo que degradaría el comportamiento en contextos largos.
- Repositorio sin descargas ni validación comunitaria: no existe evidencia externa de que los pesos carguen correctamente ni de que el resultado sea reproducible.
- El identificador del repositorio hace referencia a una ruta local de un clúster (`/storage/scratch/...`), lo que sugiere un artefacto de experimento interno no depurado para distribución pública.
- Uso responsable: si el ajuste está orientado a manipular la postura del modelo sobre un tema ideológico o una figura histórica, su empleo en aplicaciones dirigidas a usuarios finales plantea riesgos de manipulación y de presentación de opiniones como hechos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rubenbalbastre/r2warmup_qwen_qwen2_5_0_5b_instruct_karl_marx
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Paper referenciado en la model card: https://arxiv.org/abs/2608.17804
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Documentación de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
