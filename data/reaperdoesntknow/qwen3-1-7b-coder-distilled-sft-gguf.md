# reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT-GGUF

## Resumen

Qwen3-1.7B-Coder-Distilled-SFT-GGUF es la version cuantizada en formato GGUF del modelo reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT, desarrollado por Reaperdoesntrun (Convergent Intelligence LLC, Research Division). Partiendo del modelo base Qwen/Qwen3-1.7B, el autor aplica un proceso de destilacion de conocimiento en dos etapas: primero destila patrones de descomposicion estructurada desde Qwen3-Coder-30B-A3B-Instruct sobre 6.122 muestras STEM con cadena de pensamiento, y despues realiza un SFT sobre aproximadamente 54.607 pares de inferencia logica proposicional del dataset KonstantinDob/logic_inference_dataset.

El objetivo del modelo es ofrecer razonamiento estructurado (logica proposicional, derivaciones matematicas y fisicas, inferencia paso a paso) en un tamano de 1.700 millones de parametros que quepa en hardware de borde. Con la cuantizacion Q4_K_M ocupa aproximadamente 1,2 GB en disco, lo que lo hace desplegable en moviles, mini-PC y GPUs de consumo. La arquitectura subyacente es la de Qwen3-1.7B (transformer denso), con 2.031.739.904 parametros totales segun los safetensors del modelo fuente.

La relevancia actual del modelo reside en su enfoque: en lugar de competir por capacidades generales, se especializa en formato de inferencia logica con estructura "inferencia primero, conclusion despues", inspirado en el paper LogicInference de Santiago Ontanon (Google Research). Es un ejemplo de destilacion de un teacher MoE de 30B (con 3B activos) hacia un modelo denso de 1.7B para despliegue en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (los ejemplos de la model card usan n_ctx=1024) |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de 1.700 millones de parametros. Sobre esa base se aplica un pipeline de dos etapas. La primera etapa consiste en destilacion desde Qwen3-Coder-30B-A3B-Instruct (un MoE con 30B totales y 3B activos) sobre 6.122 muestras STEM con cadenas de pensamiento. La funcion de perdida combina entropia cruzada ponderada por prueba (2,5x a 1,5x sobre los tokens de derivacion) con divergencia KL a temperatura T=2,0. El objetivo declarado es transferir patrones de descomposicion estructurada (logica secuencial, seguimiento de estado, razonamiento composicional) a traves del paisaje softmax del teacher.

La segunda etapa es un ajuste supervisado (SFT) sobre KonstantinDob/logic_inference_dataset, con aproximadamente 54.607 pares de logica proposicional en formato LOGICINFERENCE. El modelo aprende a realizar la inferencia antes de emitir la conclusion, siguiendo el enfoque del paper LogicInference de Santiago Ontanon. La model card menciona fundamentos matematicos propios del autor (Discrepancy Calculus, Topological Knowledge Distillation) que supuestamente guian el pipeline de entrenamiento, aunque no se aportan detalles verificables ni resultados empiricos en la informacion disponible. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Generacion de texto con enfasis en razonamiento logico proposicional y silogistico.
- Inferencia paso a paso en formato "primero inferencia, despues conclusion".
- Derivaciones matematicas y fisicas estructuradas (heredadas de la destilacion STEM).
- Razonamiento con cadenas de pensamiento (chain-of-thought) en dominios STEM.
- Seguimiento de estado y logica secuencial en problemas de multiples pasos.
- Capacidad basica de generacion de codigo (la model card advierte explicitamente que no es un generador de codigo pese al teacher Coder).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso autonomo: no documentado.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales: no se documentan modos de thinking, vision ni audio.

## Casos de uso

- Verificacion de argumentos logicos en educacion: el modelo puede evaluar silogismos y argumentos proposicionales mostrando la inferencia intermedia, gracias al SFT sobre 54.607 pares de logica proposicional. Util en plataformas de ensenanza de filosofia o matematica discreta.
- Asistente de resolucion de problemas STEM en el borde: con la cuantizacion Q4_K_M (1,2 GB) puede ejecutarse en un movil o mini-PC para resolver derivaciones matematicas y fisicas paso a paso, sin conexion a la nube.
- Preprocesamiento de razonamiento en pipelines de agentes: el modelo puede actuar como primer eslabon de descomposicion logica antes de delegar en un modelo mayor, reduciendo coste en cascadas de inferencia.
- Generacion de explicaciones didacticas de derivaciones: dado un problema, produce la cadena de pasos con formato riguroso, adecuado para materiales educativos o tutoria automatizada.
- Filtrado y validacion de datos de razonamiento: puede usarse para etiquetar o descartar pares de premisas-conclusion en la construccion de datasets de logica, aprovechando su formato de inferencia explicita.
- Prototipado offline en entornos sin conectividad: desplegado con llama.cpp u Ollama en dispositivos con 2-4 GB de RAM, sirve para demos de razonamiento logico en ferias, aulas o entornos aislados.
- Evaluacion rapida de hipotesis en investigacion: como modelo pequeno de referencia para comparar tecnicas de destilacion o de prompting logico en experimentos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,2 GB con Q4_K_M, 1,4 GB con Q5_K_M, 2,1 GB con Q8_0 y 3,8 GB con F16 (cifras de tamano de fichero de la model card; el consumo en ejecucion anade overhead del contexto KV).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre; el modelo esta pensado para borde, no requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer modernas (RTX 3060 en adelante, e incluso iGPU con memoria compartida suficiente).
- Opciones de despliegue: llama.cpp (CLI y binding Python llama-cpp-python), Ollama, LM Studio y cualquier runtime compatible con GGUF. La model card indica compatibilidad con endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card sugiere Q4_K_M como la opcion "mas rapida" para movil y borde, y Q5_K_M como equilibrio para escritorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B-Coder-Distilled-SFT-GGUF (este) | 2,03B | no disponible | Apache 2.0 | GGUF (F16, Q8_0, Q5_K_M, Q4_K_M) | Especializado en logica proposicional y STEM via destilacion |
| Qwen/Qwen3-1.7B | 1,7B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF (comunidad) | Modelo base generalista; sin el SFT de logica |
| reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT | 2,03B | no disponible | Apache 2.0 | safetensors | Version fuente sin cuantizar del mismo modelo |
| reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF | 1,7B | no disponible | Apache 2.0 | GGUF | Variante hermana con teacher instruct y SFT legal |

No se dispone de datos de rendimiento comparativo (benchmarks) en la informacion proporcionada para establecer diferencias cuantitativas entre estas alternativas.

## Limitaciones y advertencias

- Capacidad limitada por el tamano: 1,7B parametros impone un techo estricto al razonamiento; inferencias con muchos cuantificadores o cadenas largas pueden exceder la capacidad del modelo.
- No es un generador de codigo fiable pese al teacher Coder; la propia model card lo advierte.
- No es un verificador formal de pruebas: no debe usarse como oraculo de correccion logica en produccion sin validacion externa.
- Riesgo de alucinacion: como todo modelo generativo, puede producir derivaciones plausibles pero incorrectas; verificar siempre salidas criticas.
- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Longitud de contexto no documentada; los ejemplos de la model card usan n_ctx=1024, lo que sugiere un uso previsto de contexto corto.
- La model card incluye afirmaciones sobre fundamentos matematicos propios (Discrepancy Calculus, Topological Knowledge Distillation) sin resultados empiricos verificables en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-1.7B y del dataset de SFT (KonstantinDob/logic_inference_dataset) por si imponen restricciones adicionales.
- Modelo de nicho con solo 4 likes y 3.642 descargas en el momento de la consulta; ecosistema de soporte y validacion comunitaria limitado.

## Enlaces

- Hugging Face (este modelo GGUF): https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT-GGUF
- Modelo fuente (safetensors): https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT
- Variante etapa 1: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled
- Variante hermana (teacher instruct + SFT legal): https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Teacher: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Dataset de SFT: https://huggingface.co/datasets/KonstantinDob/logic_inference_dataset
- Paper LogicInference (Ontanon, Google Research): https://openreview.net/pdf?id=HAGeIS_Lcg9
- llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai/
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Convergent Intelligence LLC: https://convergentintel.com
