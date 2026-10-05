# KexuanShi/sft_gemma2_2b_vocabdrop_a099

## Resumen

sft_gemma2_2b_vocabdrop_a099 es un ajuste fino por supervisión (SFT) del modelo base Gemma 2 de 2B parámetros, publicado por el usuario KexuanShi en HuggingFace. El nombre y las etiquetas del repositorio indican que se parte de la familia Gemma 2 (tag `gemma2`) y que se ha aplicado una técnica denominada "vocabdrop" con un valor `a099` (probablemente un hiperparámetro alfa de 0,99), aunque la model card no documenta en detalle en qué consiste ese procedimiento.

El modelo se ha entrenado con la librería TRL (versión 1.13.0) siguiendo el flujo estándar de SFT para instrucciones, e incluye los tags `sft`, `trl`, `generated_from_trainer` y `text-generation-inference`. El repositorio ocupa 5,3 GB y contiene pesos en formato safetensors con 2.614.341.888 parámetros reales, lo que confirma que se trata de un modelo denso de aproximadamente 2,6B parámetros, no de una arquitectura MoE.

La relevancia de esta ficha es limitada por la escasez de información: la model card es una plantilla autogenerada con campos vacíos (el nombre del modelo base aparece como "None"), no se declara licencia ni idiomas, y no hay resultados de benchmarks publicados. Se trata, por tanto, de un artefacto experimental de bajo perfil más que de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Gemma 2); ajuste fino por SFT |
| Parametros totales | 2.614.341.888 (aproximadamente 2,6B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la ficha; el modelo base Gemma 2 2B soporta 8.192 tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponibles (heredados del modelo base, sin declarar) |
| Licencia | no disponible |
| Formato de archivos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Gemma 2, con aproximadamente 2,6B parametros densos, confirmados por el recuento de safetensors. El modelo se ha obtenido mediante ajuste fino supervisado (SFT) con la libreria TRL 1.13.0, sobre Transformers 5.17.0, PyTorch 2.13.0, Datasets 5.0.1 y Tokenizers 0.23.2, segun las versiones de framework declaradas en la model card.

No se especifica el dataset de entrenamiento, el numero de tokens vistos, ni si hubo fases posteriores de alineacion (RLHF, DPO). El unico rasgo tecnico distintivo que sugiere el nombre es "vocabdrop", un procedimiento de drop-out sobre el vocabulario aplicado durante el SFT con un valor `a099`. La model card no describe esta innovacion, por lo que su implementacion exacta no puede verificarse con la informacion disponible. El campo del modelo base aparece como "None" en la plantilla, lo que impide confirmar formalmente el punto de partida.

## Capacidades

- Generacion de texto conversacional: el pipeline de ejemplo de la model card usa el formato de mensajes con rol `user`, lo que indica soporte de plantillas de chat.
- Ajuste por instrucciones (SFT): entrenado para seguir indicaciones de usuario en una unica interaccion del ejemplo mostrado.
- Compatibilidad con text-generation-inference y endpoints: los tags incluyen `text-generation-inference` y `endpoints_compatible`, lo que sugiere que puede desplegarse en infraestructura de inferencia gestionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, modo "thinking"): no disponibles.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: al ser un modelo de 2,6B, puede ejecutarse en una unica GPU consumer y servir como banco de pruebas para validar plantillas de chat antes de escalar a modelos mayores.
- Experimentacion academica con tecnicas de vocabulario: dado el nombre "vocabdrop", es util para investigadores que estudien el efecto del drop-out de vocabulario en el ajuste fino y quieran reproducir o comparar variantes.
- Evaluacion comparativa de ajustes finos sobre Gemma 2 2B: sirve como punto de referencia frente a otros SFT de la misma base para medir el impacto de hiperparametros como `a099`.
- Despliegue en entornos con GPU limitada: con pesos BF16 de unos 5,3 GB, cabe en GPUs de 8-12 GB de VRAM, lo que permite montar demos locales o notebooks interactivos.
- Filtrado y generacion de respuestas en pipelines internos: al ser un modelo pequeno, puede actuar como componente de preprocesado o generacion de borradores donde la latencia importa mas que la calidad final.
- Fine-tuning adicional o investigacion sobre alineacion: el repo safetensors permite cargarlo con Transformers y continuar el entrenamiento con TRL para experimentar con DPO o RLHF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (MMLU, HumanEval, GSM8K ni ninguna otra), y los resultados de la busqueda web proporcionada no guardan relacion con el modelo.

## Requisitos de tecnologicos

- VRAM estimada para inferencia: aproximadamente 6 GB en BF16/FP16 (pesos de 5,3 GB mas activaciones y cache KV), en torno a 3 GB con cuantizacion int8 y cerca de 2 GB con int4, aunque no se publican ficheros cuantizados en el repositorio.
- GPUs recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10G, L4 o superiores. En GPUs de 8 GB puede requerir cuantizacion.
- Compatibilidad con GPU consumer: si, cabe en tarjetas con 8 GB o mas de VRAM (por ejemplo RTX 3070, RTX 4060, RTX 3060), con holgura a partir de 12 GB.
- Opciones de despliegue: transformers (pipeline nativo), text-generation-inference segun los tags, y endpoints gestionados. No se confirma soporte de llama.cpp, Ollama, vLLM ni TGI en la informacion disponible, aunque el tag `text-generation-inference` apunta a compatibilidad con TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sft_gemma2_2b_vocabdrop_a099 | 2,6B | no disponible (base Gemma 2 2B: 8.192) | no disponible | HuggingFace, 0 descargas | Ajuste SFT experimental con vocabdrop |
| Gemma 2 2B (base de Google) | 2,6B | 8.192 tokens | Gemma Terms of Use | Ampliamente disponible | Modelo base sin ajuste de instrucciones |
| Llama 3.2 1B Instruct | 1,2B | 128.000 tokens | Llama 3.2 Community License | Ampliamente disponible | Alternativa de tamano similar con contexto mayor |
| Qwen2.5 1.5B Instruct | 1,5B | 32.768 tokens | Apache-2.0 | Ampliamente disponible | Licencia permisiva y buen rendimiento en tareas pequenas |

Los datos de los modelos comparativos corresponden a sus especificaciones publicas conocidas; para el modelo de esta ficha no hay mediciones comparables de rendimiento.

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin licencia explicita, el uso comercial es juridicamente incierto; debe contactarse con el autor antes de cualquier despliegue productivo.
- Model card vacia: el campo del modelo base aparece como "None" y no se documentan datos de entrenamiento, dataset ni hiperparametros, lo que impide auditar sesgos o procedencia de datos.
- Riesgo de alucinacion: sin datos de alineacion (RLHF/DPO) confirmados, cabe esperar una tasa de alucinacion propia de un modelo base pequeno ajustado solo con SFT.
- Idiomas no declarados: no puede garantizarse un rendimiento multilingue correcto fuera del idioma dominante del dataset de SFT, que se desconoce.
- Limitacion de contexto: aunque el modelo base Gemma 2 2B soporta 8.192 tokens, este ajuste no declara su ventana efectiva ni si se entreno con secuencias largas.
- Cero adopcion: el repositorio registra 0 descargas y 0 "likes", por lo que no existe validacion comunitaria de su calidad o comportamiento.
- Sin cuantizaciones oficiales: la ausencia de ficheros GGUF obliga a cuantizar manualmente para ciertos entornos de despliegue.
- "vocabdrop" no documentado: la tecnica del nombre no se explica en la ficha, lo que dificulta evaluar su impacto y reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KexuanShi/sft_gemma2_2b_vocabdrop_a099
- Repositorio de TRL (framework de entrenamiento): https://github.com/huggingface/trl
- Paper de TRL (citado en la model card): von Werra et al., 2020
- Otros enlaces relevantes: no disponible (los resultados de la busqueda web proporcionada no estan relacionados con el modelo)
