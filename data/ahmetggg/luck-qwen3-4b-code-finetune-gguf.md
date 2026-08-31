# ahmetggg/Luck-Qwen3-4b-Code-FineTune-GGUF

## Resumen

Luck-Qwen3-4b-Code-FineTune-GGUF es una cuantizacion GGUF del modelo Luck-Qwen3-4b-Code-FineTune, un fine-tune QLoRA de 4.050 millones de parametros sobre la base Qwen3-4B de Alibaba. El autor, ahmetggg, lo presenta como un ajuste optimizado para codificacion agéntica, uso de herramientas, razonamiento multi-paso y calibracion de incertidumbre, con un formato de prompt ChatML sin etiquetas de pensamiento.

Sin embargo, la evaluacion interna publicada en la model card muestra una degradacion significativa respecto al modelo base en casi todas las categorias evaluadas: la puntuacion media FOCUS cae del 95,9% al 15,0%, y las capacidades de tool calling y generacion de codigo se desploman a 0%. El propio autor concluye que el fine-tune no aporta beneficio en ese conjunto de pruebas. No se han realizado aun benchmarks estandar como SWE-bench o BFCL.

Este repositorio proporciona 15 cuantizaciones GGUF (desde F16 hasta IQ2_M) generadas con llama.cpp, lo que permite ejecutar el modelo en CPU o GPU consumer con distintos equilibrios de tamaño y calidad. La licencia Apache-2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B) |
| Parametros totales | 4.022.468.096 (~4,02B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (no especificada en la informacion; el base Qwen3-4B soporta 32K, pero no se confirma) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_NL, IQ4_XS, Q3_K_M, Q3_K_S, IQ3_M, IQ3_XS, Q2_K, IQ2_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer denso de 4.000 millones de parametros con atencion completa y una ventana de contexto de 32K tokens (dato del modelo base, no confirmado en este repositorio). Sobre esta base se aplico un fine-tune QLoRA, que reduce el coste de entrenamiento al congelar los pesos originales y entrenar adaptadores de bajo rango. El autor indica que el ajuste se enfoco en codificacion agéntica, tool use, razonamiento multi-paso y calibracion de incertidumbre, con tecnicas similares a R-Tuning para respuestas "IDK" (no lo se).

No se proporcionan detalles del dataset de entrenamiento ni del numero de tokens utilizados. El prompt template es ChatML estandar, sin los tags de thinking que usa Qwen3 en su modo razonamiento. La cuantizacion GGUF se genero con las herramientas oficiales de llama.cpp (convert_hf_to_gguf.py y llama-quantize).

## Capacidades

- Generacion de texto y codigo: el modelo base Qwen3-4B es competente en tareas de programacion, pero la evaluacion interna muestra que este fine-tune obtiene un 0% en la categoria "code" (frente al 87,5% del base).
- Tool calling / function calling: la puntuacion cae del 93,8% al 0%, lo que sugiere una perdida total de la capacidad de emitir llamadas a herramientas en el formato esperado.
- Razonamiento multi-paso: la categoria "multistep" pasa del 90,0% al 0%, indicando que el modelo no mantiene cadenas de razonamiento complejas.
- Calibracion de incertidumbre: la capacidad de responder "IDK" cuando no sabe cae del 100% al 10%, y la precision de respuestas calibradas baja del 100% al 87,5%.
- Razonamiento basico: la categoria "reason" se mantiene en 100%, igual que el base, por lo que el modelo conserva la capacidad de razonamiento simple.
- Capacidad agéntica: la puntuacion "agent" baja del 100% al 50%.
- Multilingue: solo se declara ingles; no hay evidencia de soporte para otros idiomas.

## Casos de uso

Dado el rendimiento degradado en las evaluaciones internas, los casos de uso recomendados son limitados y deben considerarse con cautela:

- Prototipado rapido de chatbots: para demos o pruebas internas donde no se requiera tool calling ni codigo fiable, el modelo puede mantener conversaciones basicas en ingles gracias a su razonamiento simple intacto.
- Educacion y experimentacion: util para estudiar el efecto de un fine-tune QLoRA sobre Qwen3-4B y comparar cuantizaciones GGUF en entornos de aprendizaje.
- Tareas de generacion de texto generico: redaccion de correos, resumenes cortos o contenido creativo donde la precision tecnica no sea critica.
- Inferencia en hardware modesto: las cuantizaciones Q4_K_M (2,5 GB) o Q3_K_M (1,9 GB) permiten ejecutar el modelo en portatiles con 4-8 GB de RAM, aunque con calidad reducida.
- Benchmarking de cuantizacion: los 15 formatos GGUF permiten medir el impacto de la cuantizacion en la perplejidad y la velocidad de inferencia con llama.cpp.
- No se recomienda su uso en produccion para agentes, tool calling o generacion de codigo, dado que la evaluacion muestra una perdida total de estas capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (SWE-bench, BFCL, MMLU, HumanEval) en la informacion disponible. La model card incluye una evaluacion interna propia sobre un conjunto hold-out con categorias especificas (tool, multistep, calibracion, razonamiento, codigo, agente). Los resultados son los siguientes:

| Categoria | Base (Qwen3-4B) | Fine-tune | Delta |
|---|---|---|---|
| Tool | 93,8% | 0,0% | -93,8 pp |
| Multistep | 90,0% | 0,0% | -90,0 pp |
| Calibracion (respuesta) | 100,0% | 87,5% | -12,5 pp |
| Calibracion (IDK) | 100,0% | 10,0% | -90,0 pp |
| Razonamiento | 100,0% | 100,0% | +0,0 pp |
| Codigo | 87,5% | 0,0% | -87,5 pp |
| Agente | 100,0% | 50,0% | -50,0 pp |
| FOCUS promedio | 95,9% | 15,0% | -80,9 pp |
| CALIBRACION | 100,0% | 48,8% | -51,2 pp |
| MACRO promedio | 95,9% | 35,4% | -60,5 pp |

El autor concluye explicitamente que el fine-tune no muestra beneficio en este conjunto y que la caida en tool-call y codigo sugiere un desplazamiento de plantilla y una regresion general en codificacion.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M (~2,5 GB) cabe en GPUs consumer de 4 GB o menos; con Q8_0 (~4,3 GB) se necesita al menos 6 GB; con F16 (~8,1 GB) se requieren 10-12 GB.
- GPU recomendadas: RTX 3060 (12 GB) para Q8_0 o F16; RTX 4060 (8 GB) para Q6_K o Q5_K; cualquier GPU con 4 GB (GTX 1650, RTX 3050) para Q4_K_M o inferiores.
- En CPU: llama.cpp permite ejecutar el modelo sin GPU, con mayor latencia; las cuantizaciones Q3_K_M o Q2_K son viables en equipos con 8 GB de RAM.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (integracion con Hugging Face), LM Studio, y cualquier runtime compatible con GGUF (llama-cpp-python, ctransformers).
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna (RTX 4090) con Q4_K_M se puede esperar una velocidad de 50-100 tokens/s, pero es una estimacion no confirmada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento en tool/code |
|---|---|---|---|---|---|
| Luck-Qwen3-4b-Code-FineTune-GGUF | 4,02B | No disponible | Apache-2.0 | GGUF | 0% en tool y code (evaluacion interna) |
| Qwen3-4B (base) | 4,02B | 32K | Apache-2.0 | Safetensors, GGUF | 93,8% tool, 87,5% code (evaluacion interna) |
| Llama-3.2-3B | 3,21B | 128K | Llama 3.2 Community | Safetensors, GGUF | No comparable (sin datos de la misma evaluacion) |
| Phi-3.5-mini | 3,82B | 128K | MIT | Safetensors, GGUF | No comparable (sin datos de la misma evaluacion) |

La comparativa directa con el base Qwen3-4B muestra que el fine-tune es claramente inferior en las categorias evaluadas. No se dispone de datos de otros modelos de tamano similar con la misma metodologia de evaluacion.

## Limitaciones y advertencias

- La evaluacion interna del autor muestra una degradacion severa en tool calling (0%), generacion de codigo (0%) y razonamiento multi-paso (0%) respecto al modelo base. No se recomienda su uso en tareas que requieran estas capacidades.
- La calibracion de incertidumbre es deficiente: solo responde "IDK" en el 10% de los casos donde deberia, lo que aumenta el riesgo de alucinaciones y respuestas falsamente seguras.
- No se han realizado benchmarks estandar (SWE-bench, BFCL, MMLU, HumanEval), por lo que el rendimiento real en tareas comunes no esta verificado.
- El modelo solo declara soporte para ingles; su comportamiento en otros idiomas es desconocido y probablemente pobre.
- La longitud de contexto no esta especificada en este repositorio; se asume la del base Qwen3-4B (32K), pero no hay confirmacion.
- Aunque la licencia Apache-2.0 permite uso comercial, el rendimiento degradado hace que su despliegue en produccion sea arriesgado y probablemente contraproducente frente al modelo base.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere una adopcion nula y poca validacion externa.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/ahmetggg/Luck-Qwen3-4b-Code-FineTune-GGUF
- Modelo base (fine-tune): https://huggingface.co/ahmetggg/Luck-Qwen3-4b-Code-FineTune
- Modelo original Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Version de Unsloth de Qwen3-4B: https://huggingface.co/unsloth/Qwen3-4B
- Repositorio oficial de Qwen en GitHub: https://github.com/QwenLM/Qwen
