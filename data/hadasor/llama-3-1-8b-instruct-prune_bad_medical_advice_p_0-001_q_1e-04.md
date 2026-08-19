# hadasor/Llama-3.1-8B-Instruct-prune_bad_medical_advice_p_0.001_q_1e-04

## Resumen

El modelo `hadasor/Llama-3.1-8B-Instruct-prune_bad_medical_advice_p_0.001_q_1e-04` es un derivado del conocido Llama-3.1-8B-Instruct de Meta, sometido a un proceso de poda (pruning) orientado a eliminar o reducir la generación de consejos médicos dañinos. El autor, hadasor, ha publicado varios modelos similares con distintos parámetros de poda (p y q) para experimentar con técnicas de alineación mediante eliminación selectiva de pesos. El nombre del modelo sugiere que se ha aplicado una poda con una proporción p=0.001 y un factor de regularización q=1e-04, aunque no se documenta el método concreto.

Se trata de un modelo de 8.030 millones de parámetros, con arquitectura transformer, pensado para generación de texto conversacional. La model card es una plantilla automática sin información sustancial, por lo que la mayoría de los detalles técnicos no están disponibles. A pesar de ello, su relevancia radica en explorar si la poda selectiva puede mitigar comportamientos indeseados en modelos de lenguaje sin necesidad de reentrenamiento completo, un área activa de investigación en seguridad de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (el modelo base Llama-3.1-8B-Instruct soporta 128k, pero no se confirma para esta variante) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base soporta multiples idiomas, pero no se especifica para esta variante) |
| Licencia | no disponible (el modelo base usa licencia Llama 3.1 de Meta, pero este derivado no la declara) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la misma que la de Llama-3.1-8B-Instruct: un transformer autoregresivo con atención por ventanas deslizantes (GQA), normalización RMSNorm y activación SwiGLU. El modelo original fue preentrenado con 15 billones de tokens y posteriormente ajustado con instrucciones y RLHF (según la documentacion de Meta). La variante podada no incluye informacion sobre el metodo de poda aplicado, ni sobre los datos utilizados para el ajuste posterior. Los parametros p y q en el nombre sugieren que se ha empleado una tecnica de poda basada en importancia (probablemente magnitud o gradiente) con una tasa de poda del 0.1% (p=0.001) y un coeficiente de regularizacion de 1e-04. No se especifica si se realizo un reentrenamiento posterior (fine-tuning) tras la poda para recuperar la calidad.

## Capacidades

- Generacion de texto conversacional y completado de instrucciones, heredadas del modelo base Llama-3.1-8B-Instruct.
- Razonamiento, resolucion de problemas y generacion de codigo, en la medida en que el modelo base las posee.
- Soporte de tool calling y function calling, presente en el modelo base Llama-3.1-8B-Instruct.
- Capacidades multilingues del modelo base (principalmente ingles y otros idiomas con menor rendimiento).
- No se ha publicado ninguna evaluacion especifica de las capacidades de esta variante podada.

## Casos de uso

- Investigacion en seguridad de modelos: estudiar como la poda selectiva afecta a la generacion de contenido medico riesgoso, comparando con el modelo sin podar.
- Despliegue en entornos sanitarios controlados: si la poda reduce eficazmente consejos medicos daninos, podria servir como capa de filtrado en asistentes de salud, aunque se requiere validacion exhaustiva.
- Experimentacion academica: analisis de la relacion entre la densidad de pesos y el comportamiento etico de modelos de lenguaje.
- Pruebas de robustez: evaluar si la poda degrada otras capacidades (razonamiento, codigo) en comparacion con el modelo original.
- Desarrollo de tecnicas de alineacion eficientes: este modelo es un ejemplo de intento de alineacion sin reentrenamiento completo, util para investigar metodos ligeros.
- Benchmarking de herramientas de poda: sirve como caso de estudio para frameworks de pruning en modelos de 8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras metricas para esta variante especifica. Se desconoce el impacto real de la poda en el rendimiento general.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 8.03B parametros y pesos en fp16 (tamano del repo 16.1 GB), se necesitan al menos 16 GB de VRAM para cargar el modelo en precision completa. Con cuantizacion int8 (no publicada, pero posible) se reduciria a ~8 GB, y con int4 a ~4 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) para fp16; GPUs consumer de 8-12 GB podrian usarlo con cuantizacion, aunque no se ofrecen pesos cuantizados en el repo.
- En GPU consumer: cabe en RTX 3090/4090 (24 GB) en fp16, y en RTX 4070/4080 (12-16 GB) con cuantizacion int8/int4 si se convierte.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, TGI, o en local con llama.cpp (si se convierte a GGUF) u Ollama. No se proporcionan archivos GGUF en el repo.
- Latencia y throughput: no disponibles, dependen del hardware y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hadasor/Llama-3.1-8B-Instruct-prune_bad_medical_advice_p_0.001_q_1e-04 | 8.03B | no disponible | no disponible | HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct (base) | 8.03B | 128k | Llama 3.1 (Meta) | HuggingFace |
| hadasor/Llama-3.1-8B-Instruct-prune_bad_medical_advice_p_0.0007_q_4e-05 | 8.03B | no disponible | no disponible | HuggingFace (variante del mismo autor) |

No se dispone de datos de rendimiento comparativo. El modelo base Llama-3.1-8B-Instruct es el punto de referencia natural, pero no hay evaluaciones de la variante podada.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es una plantilla sin informacion util; no se describen el metodo de poda, los datos de entrenamiento ni los criterios de evaluacion.
- Riesgo de degradacion de capacidades: la poda puede reducir la calidad general del modelo, afectando a tareas no relacionadas con el consejo medico.
- Sesgos y alucinaciones: al ser un derivado de Llama-3.1, hereda los sesgos del modelo base, y no hay evidencia de que la poda los mitigue.
- Sin garantia de seguridad medica: el nombre sugiere una reduccion de malos consejos, pero no se ha demostrado su eficacia; no debe usarse en produccion sanitaria sin validacion clinica.
- Restricciones de licencia: al no declarar licencia, el uso comercial es incierto; ademas, el modelo base Llama-3.1 tiene condiciones especificas que pueden aplicarse.
- Sin soporte de cuantizacion oficial: los pesos estan en safetensors fp16, lo que limita su uso en hardware con poca VRAM sin conversion manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hadasor/Llama-3.1-8B-Instruct-prune_bad_medical_advice_p_0.001_q_1e-04
- Variante similar (p=0.0007, q=4e-05): https://huggingface.co/hadasor/Llama-3.1-8B-Instruct-prune_bad_medical_advice_p_0.0007_q_4e-05
- Discusion de otro modelo del autor: https://huggingface.co/hadasor/Llama-3.1-8B-Instruct-prune_risky_financial_advice_p_0.0007_q_1e-05/discussions
- Despliegue en FriendliAI (variante similar): https://friendli.ai/models/hadasor/Llama-3.1-8B-Instruct-prune_bad_medical_advice_p_0.0007_q_2e-05
- Referencia sobre poda y destilacion de Llama-3.1 (foro NVIDIA): https://forums.developer.nvidia.com/t/how-to-prune-and-distill-llama-3-1-8b-to-an-nvidia-llama-3-1-minitron-4b-model/303396
