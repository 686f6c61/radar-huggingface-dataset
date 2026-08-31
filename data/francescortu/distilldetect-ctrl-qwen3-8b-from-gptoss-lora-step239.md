# francescortu/DistillDetect-ctrl-qwen3-8b-from-gptoss-lora-step239

## Resumen

DistillDetect-ctrl-qwen3-8b-from-gptoss-lora-step239 es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3-8B, desarrollado por el autor francescortu. Forma parte de la familia DistillDetect, un proyecto de investigacion que aborda la deteccion de destilacion de modelos: dado un modelo estudiante, el sistema determina si fue destilado a partir de un profesor concreto. En este caso, el adaptador se entrena para detectar si un modelo fue destilado de GPT-OSS-120B, uno de los cuatro profesores considerados en el pipeline original (junto con Gemma-3-27B-it, Qwen-3-8B y Nvidia-Llama-3.3-70B-Instruct).

El adaptador pesa 0.3 GB y se distribuye en formato safetensors, con la libreria PEFT (version 0.20.0). No se proporciona informacion sobre la licencia, los idiomas soportados ni la longitud de contexto especifica del adaptador, aunque el modelo base Qwen3-8B soporta hasta 32 000 tokens de contexto. La relevancia de este modelo radica en su aplicacion para auditoria y transparencia de modelos de IA, permitiendo verificar la procedencia de un modelo sospechoso de haber sido destilado sin autorizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-8B (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador ocupa 0.3 GB; el base tiene 8 000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el base Qwen3-8B soporta 32 000 tokens) |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizacion declarada) |
| Idiomas soportados | No disponibles (el base Qwen3 soporta multiples idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3-8B es un transformer decoder-only con atencion estandar, entrenado por Alibaba Cloud. Sobre el se aplica un adaptador LoRA (Low-Rank Adaptation) que modifica un subconjunto de los pesos para especializarlo en la tarea de deteccion de destilacion. El nombre del adaptador indica que se entreno durante 239 pasos (step239) y que el profesor de referencia es GPT-OSS-120B (from-gptoss). El tag "ctrl" sugiere que se trata de un modelo de control dentro del pipeline de DistillDetect, probablemente entrenado con datos generados por el profesor para ensenar al detector a distinguir entre estudiantes destilados y no destilados.

No se dispone de informacion sobre el conjunto de datos de entrenamiento, el numero de tokens utilizados, ni si se aplicaron tecnicas como RLHF o DPO. El repositorio de GitHub del proyecto DistillDetect describe un pipeline en cuatro etapas: generacion de respuestas del profesor, entrenamiento de estudiantes controlados, entrenamiento del detector y evaluacion. Este adaptador concreto parece ser un componente de ese pipeline, aunque no se especifican los hiperparametros exactos del entrenamiento.

## Capacidades

- Deteccion de destilacion: dado un modelo estudiante, predice si fue destilado a partir de GPT-OSS-120B.
- Generacion de texto: hereda las capacidades generativas del modelo base Qwen3-8B, aunque su uso principal no es la generacion libre.
- Clasificacion binaria: la tarea se plantea como un problema de clasificacion (destilado vs. no destilado), aunque no se detalla la interfaz de salida.
- No se conocen capacidades adicionales como tool calling, agentes o razonamiento multi-paso especificas del adaptador.

## Casos de uso

- Auditoria de modelos en entornos empresariales: una empresa puede utilizar este adaptador para verificar si un modelo que ha adquirido o recibido de un tercero fue destilado de un profesor propietario sin licencia, lo que ayudaria a detectar infracciones de propiedad intelectual.
- Cumplimiento de licencias en plataformas de IA: los proveedores de modelos pueden integrar este detector en sus pipelines de validacion para asegurar que los modelos subidos por usuarios no han sido destilados de modelos protegidos.
- Investigacion academica en seguridad de IA: los investigadores pueden emplear este adaptador como parte de un conjunto de herramientas para estudiar la trazabilidad de los modelos y desarrollar contramedidas contra la destilacion no autorizada.
- Verificacion de procedencia en modelos open source: antes de adoptar un modelo de codigo abierto, un desarrollador puede comprobar si este deriva de un profesor concreto, lo que puede afectar a la licencia aplicable.
- Control de calidad en pipelines de destilacion: las organizaciones que legitiman la destilacion pueden usar el detector para confirmar que sus propios modelos estudiantes se comportan como se espera respecto al profesor.
- Analisis forense de modelos: en litigios o disputas sobre la autoría de un modelo, este adaptador puede proporcionar evidencia tecnica sobre la relacion entre un estudiante y un profesor especifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre metricas como exactitud, precision, recall o F1 para la tarea de deteccion de destilacion, ni comparaciones con otros detectores.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.3 GB), pero requiere cargar el modelo base Qwen3-8B completo para su uso.
- VRAM estimada: aproximadamente 16 GB en precision FP16, 8 GB en cuantizacion de 4 bits (por ejemplo, con bitsandbytes o GPTQ).
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100, o cualquier GPU con al menos 8 GB de VRAM si se usa cuantizacion.
- Es viable en GPUs de consumo (RTX 3060 12 GB, RTX 4070, etc.) con cuantizacion.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Transformers con PEFT, TGI (Text Generation Inference).
- Latencia y throughput: no disponibles, dependen del hardware y de la configuracion de cuantizacion.

## Comparativa con modelos similares

| Modelo | Base | Profesor | Tamano del adaptador | Licencia | Contexto |
|---|---|---|---|---|---|
| DistillDetect-ctrl-qwen3-8b-from-gptoss-lora-step239 | Qwen3-8B | GPT-OSS-120B | 0.3 GB | No disponible | No disponible |
| DistillDetect-ctrl-qwen3-8b-from-qwen35-lora | Qwen3-8B | Qwen3-5 (probable) | No disponible | No disponible | No disponible |
| DistillDetect-Qwen2.5-1.5B-from-Qwen3-8B-s1 | Qwen2.5-1.5B | Qwen3-8B | No disponible | Apache 2.0 | No disponible |

No se dispone de datos de rendimiento comparativo entre estos adaptadores. La comparativa se limita a la informacion estructural disponible en los repositorios de HuggingFace.

## Limitaciones y advertencias

- Licencia no declarada: el adaptador no especifica una licencia, lo que impide su uso comercial sin autorizacion explicita del autor. El modelo base Qwen3-8B es Apache 2.0, pero el adaptador no hereda automaticamente esa licencia.
- Sin datos de evaluacion: no se han publicado resultados de exactitud ni de validacion en conjuntos de prueba, por lo que se desconoce su fiabilidad en escenarios reales.
- Dependencia del modelo base: el rendimiento del adaptador esta condicionado al comportamiento de Qwen3-8B, que puede presentar sesgos y alucinaciones tipicos de los LLM.
- Alcance limitado: el adaptador esta entrenado para un profesor especifico (GPT-OSS-120B); no es generalizable a otros profesores sin reentrenamiento.
- Riesgo de sobreajuste: al ser un adaptador pequeno entrenado en un numero limitado de pasos (239), podria no generalizar bien a estudiantes destilados con configuraciones muy diferentes a las del entrenamiento.
- Informacion incompleta: la model card no proporciona detalles sobre el dataset de entrenamiento, los hiperparametros ni el procedimiento de evaluacion, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francescortu/DistillDetect-ctrl-qwen3-8b-from-gptoss-lora-step239
- Repositorio del proyecto DistillDetect: https://github.com/RajatRawat-creator/DistillDetect
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Otros adaptadores del mismo autor: https://huggingface.co/francescortu/DistillDetect-ctrl-qwen3-8b-from-qwen35-lora y https://huggingface.co/francescortu/DistillDetect-Qwen2.5-1.5B-from-Qwen3-8B-s1
