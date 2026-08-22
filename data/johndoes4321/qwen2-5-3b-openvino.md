# JohnDoes4321/Qwen2.5-3B-openvino

## Resumen

JohnDoes4321/Qwen2.5-3B-openvino es una conversión del modelo base Qwen/Qwen2.5-3B al formato OpenVINO, realizada mediante optimum-intel y el espacio de exportación oficial de HuggingFace. El objetivo de esta conversión es facilitar la ejecución del modelo en hardware Intel (CPU, GPU, NPU) y en entornos de producción que utilizan OpenVINO Runtime o OpenVINO Model Server, evitando al usuario tener que realizar la conversión manualmente.

El modelo subyacente, Qwen2.5-3B, pertenece a la familia Qwen2.5 de Alibaba, una serie de modelos transformer decoder-only con 3.000 millones de parámetros y una ventana de contexto nativa de 32.768 tokens. Es un modelo base, no alineado con instrucciones, pensado para generación de texto y para ser fine-tuning sobre tareas específicas. La relevancia de esta conversión radica en que permite ejecutar un modelo de 3B en hardware Intel con baja latencia y sin depender de librerías de CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) convertido a OpenVINO IR |
| Parametros totales | 3.000 millones (3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | FP16 (formato OpenVINO IR) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | qwen-research (uso no comercial) |
| Formato de pesos | OpenVINO IR (XML y binario) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-3B es un transformer decoder-only con arquitectura Qwen2: utiliza atención de cabezas agrupadas (GQA), embeddings rotatorios (RoPE) y una capa de pre-norm. En esta version, los pesos originales en formato PyTorch se han exportado a OpenVINO IR mediante optimum-intel, lo que mantiene la arquitectura original pero optimiza el grafo para ejecucion en Intel OpenVINO Runtime.

El entrenamiento del modelo base incluyo un preentrenamiento extensivo sobre datos multilinguees, seguido de un ajuste fino supervisado (SFT) y alineacion con preferencias humanas en la version Instruct. Sin embargo, esta conversion se basa en el modelo base (no Instruct), por lo que no incluye el ajuste conversacional. La exportacion a OpenVINO no altera los pesos ni el comportamiento del modelo; solo cambia el formato de serializacion y el runtime de ejecucion.

## Capacidades

- Generacion de texto autoregresiva en ingles.
- Razonamiento basico y comprension de lenguaje natural.
- Soporte de contexto largo (hasta 32K tokens) para documentos extensos.
- Capacidad de continuar texto o completar secuencias de forma libre (modelo base, sin instrucciones).
- Ejecucion optimizada en CPU, GPU y NPU Intel gracias al runtime OpenVINO.
- Integracion con el ecosistema HuggingFace mediante optimum-intel (OVModelForCausalLM).
- No incluye soporte nativo de tool calling ni function calling por ser modelo base.
- No incluye modo de vision ni audio; es un modelo exclusivamente de texto.

## Casos de uso

- Inferencia local en CPU Intel: el formato OpenVINO permite ejecutar el modelo en equipos sin GPU dedicada, con una latencia razonable para tareas de generacion de texto de baja frecuencia.
- Despliegue en entornos de produccion con OpenVINO Model Server (OVMS): se puede servir el modelo como endpoint REST o gRPC para aplicaciones de generacion de texto, integrado con frameworks como FastAPI o Nginx.
- Asistente local de codigo en Visual Studio Code: el modelo puede integrarse en la extension Continue usando OVMS, tal como se muestra en la demo oficial de OpenVINO, para sugerencias de autocompletado y chat en local.
- Prototipado de aplicaciones de IA en el borde (edge): el formato ligero y la compatibilidad con Intel AI PC permiten ejecutar el modelo en dispositivos con recursos limitados.
- Fine-tuning posterior: al ser el modelo base, se puede cargar con los pesos en OpenVINO para ajustarlo sobre un dataset propio y despues exportar de nuevo, aunque el flujo habitual de ajuste suele usar el formato PyTorch original.
- Evaluacion de modelos de 3B en hardware Intel: sirve como punto de referencia para medir rendimiento y precision en entornos sin aceleradores NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El rendimiento del modelo en tareas de lenguaje es equivalente al del modelo base Qwen2.5-3B, cuyos resultados se recogen en el informe tecnico de Qwen2.5 (arXiv:2412.15115), pero no se dispone de mediciones especificas para esta conversion OpenVINO.

## Requisitos de hardware

- VRAM estimada: el modelo en FP16 ocupa aproximadamente 6 GB en memoria. En CPU, el consumo de RAM es similar.
- GPU recomendadas: cualquier GPU Intel con soporte OpenVINO (iGPU integrada, Arc, Flex) o incluso CPU sola. No requiere GPU NVIDIA.
- Compatibilidad con consumer GPU: si, puede ejecutarse en CPUs y iGPU Intel de escritorio (por ejemplo, procesadores Intel Core de 11a generacion en adelante) y en GPU Arc.
- Opciones de despliegue: OpenVINO Runtime, optimum-intel (Python), OpenVINO Model Server (OVMS), y contenedores Docker con openvino.
- Latencia y throughput: no disponible en la informacion. Depende del hardware y de la cuantizacion; en una CPU Intel moderna se espera una generacion de varios tokens por segundo con FP16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JohnDoes4321/Qwen2.5-3B-openvino | 3B | 32K | OpenVINO IR | qwen-research | HuggingFace |
| Qwen/Qwen2.5-3B | 3B | 32K | safetensors | qwen-research | HuggingFace |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32K | safetensors | qwen-research | HuggingFace |
| Meta Llama-3.2-3B | 3B | 32K | safetensors, GGUF | Llama 3.2 Community | HuggingFace |

La diferencia principal con el modelo base es el formato de pesos y el runtime de ejecucion. La version Instruct de Qwen2.5-3B incluye alineamiento conversacional, mientras que esta version base no. Llama-3.2-3B es una alternativa de tamano similar con licencia mas permisiva para uso comercial.

## Limitaciones y advertencias

- Licencia qwen-research: restringe el uso a fines de investigacion y no permite uso comercial. Revisar el texto completo de la licencia antes de desplegar en produccion.
- Es un modelo base, no alineado con instrucciones: puede generar contenido incoherente o no seguir indicaciones complejas. Para tareas conversacionales se recomienda usar la version Instruct.
- Sesgos: al igual que otros LLM, puede reproducir sesgos presentes en sus datos de entrenamiento. No se ha realizado una evaluacion especifica de sesgo para esta conversion.
- Riesgo de alucinacion: puede inventar hechos o generar afirmaciones falsas, especialmente en tareas de razonamiento o conocimiento factual.
- Idioma: la model card indica solo ingles, aunque el modelo base soporta mas idiomas; el uso fuera del ingles puede degradar el rendimiento.
- Rendimiento de cuantizacion: la conversion se ha realizado en FP16; no se han probado cuantizaciones de menor precision (INT8, INT4) que podrian reducir el consumo de memoria pero tambien la calidad.
- Dependencia de OpenVINO: el modelo solo puede ejecutarse con el runtime OpenVINO, no con frameworks estandar de PyTorch o TensorFlow.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JohnDoes4321/Qwen2.5-3B-openvino
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Coleccion Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Informe tecnico Qwen2.5 (arXiv): https://arxiv.org/pdf/2412.15115v1
- Demo de asistente local en VSCode con OVMS: https://docs.openvino.ai/2025/model-server/ovms_demos_code_completion_vsc.html
- Documentacion de optimum-intel: https://github.com/huggingface/optimum-intel
