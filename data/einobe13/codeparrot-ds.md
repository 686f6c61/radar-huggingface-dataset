# einobe13/codeparrot-ds

## Resumen

Codeparrot-ds es un modelo de generación de texto afinado (fine-tuned) a partir de GPT-2 de OpenAI, publicado en HuggingFace por el usuario einobe13. Se trata de un experimento de entrenamiento generado con la clase `Trainer` de la librería Transformers, cuyo nombre sugiere una orientación hacia código, posiblemente inspirado en el proyecto CodeParrot (modelos de generación de código en Python), aunque la model card no documenta el dataset empleado ni los usos previstos.

El modelo conserva la arquitectura GPT-2 original con 124,2 millones de parámetros y se distribuye en formato safetensors bajo licencia MIT, lo que permite su uso libre, incluido el comercial. Su relevancia es limitada: la pérdida de validación aumenta a lo largo del entrenamiento (de 6,51 a 7,63), lo que indica que el ajuste fino no mejoró el modelo base y que el resultado es, en la práctica, un artefacto educativo o de prueba.

Para desarrolladores e investigadores, su interés principal radica en servir como ejemplo de un fine-tuning documentado con hiperparámetros completos, más que como modelo productivo. No se han publicado benchmarks ni evaluaciones de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder unidireccional) |
| Parametros totales | 124.242.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (GPT-2 base usa habitualmente 1024 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de GPT-2 base (openai-community/gpt2), un transformer decoder con atencion enmascarada causal. No hay indicios de que se hayan modificado la arquitectura ni el numero de capas; el fine-tuning se realizo sobre los pesos completos, sin tecnicas como LoRA o QLoRA segun la informacion disponible.

El entrenamiento se ejecuto durante 1500 pasos con las siguientes caracteristicas: tasa de aprendizaje de 0,0005 con planificador coseno y 100 pasos de calentamiento, tamaño de lote efectivo de 64 (32 por dispositivo con 2 pasos de acumulacion de gradiente), optimizador AdamW (variante fused de PyTorch) con betas (0,9; 0,999) y semilla 42. El dataset de entrenamiento se describe como "unknown" en la model card, por lo que su composicion, tamaño y numero de tokens son desconocidos. No se aplicaron tecnicas de alineacion como RLHF o DPO.

Un dato notable: la perdida de validacion empeoro de forma monótona durante el entrenamiento (6,5106 en el paso 500, 7,2126 en el paso 1000 y 7,6296 en el paso 1500), lo que sugiere un problema de configuracion (posiblemente una tasa de aprendizaje excesiva) o un dataset inadecuado.

## Capacidades

- Generacion de texto autoregresiva mediante el pipeline `text-generation` de Transformers.
- Hereda las capacidades de GPT-2 base: completacion de texto en ingles, generacion basica de codigo y continuacion de patrones.
- No hay evidencia documentada de capacidades de razonamiento, tool calling, soporte de agentes, capacidades multilingues ni modalidades adicionales (vision, audio).
- Dado el empeoramiento de la perdida de validacion, es probable que el rendimiento sea inferior al del modelo base GPT-2.

## Casos de uso

- **Material didactico sobre fine-tuning:** los hiperparámetros y las curvas de perdida publicados permiten estudiar un caso real de entrenamiento con `Trainer`, incluido un ejemplo de como un learning rate elevado puede degradar el modelo.
- **Punto de partida para nuevos fine-tunings:** al ser un checkpoint completo en safetensors con licencia MIT, puede retomarse desde el Trainer y continuar el entrenamiento con un dataset documentado.
- **Comparacion base vs. afinado:** util como sujeto de pruebas para medir el impacto de distintos learning rates, schedulers y tamaños de lote sobre GPT-2.
- **Pruebas de infraestructura de inferencia:** su pequeño tamaño (0,5 GB en disco) lo hace adecuado para verificar pipelines de despliegue con Transformers, llama.cpp u Ollama antes de cargar modelos mayores.
- **Experimentacion con cuantizacion:** candidato de bajo coste para probar tecnicas de cuantizacion y medir su efecto sobre un modelo GPT-2 conocido.
- **Generacion de texto experimental:** puede usarse para completaciones de texto simples, aunque sin garantias de calidad superiores a GPT-2 base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion declarado por el autor es la perdida en el conjunto de validacion:

| Metrica | Valor |
|---|---|
| Validation loss (paso 1500) | 7,6296 |

No hay resultados de MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 124 millones de parametros en fp32, aproximadamente 0,5 GB; en fp16, unos 0,25 GB. Cabe con holgura en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU de consumo (GTX 1650, RTX 3060, RTX 4090) o una T4 de Colab es mas que suficiente.
- Consumer GPUs: funciona sin problemas en practicamente cualquier GPU con 2 GB de VRAM o mas, y tambien en CPU.
- Opciones de despliegue: Transformers (pipeline `text-generation`), text-generation-inference (TGI), Ollama y llama.cpp (previa conversion a GGUF, no disponible en el repositorio). vLLM tambien es viable dado el tamaño reducido.
- Latencia y throughput: no disponibles; por tamaño y arquitectura (GPT-2 base), la generacion es rapida incluso en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| einobe13/codeparrot-ds | 124 M | no disponible | MIT | Fine-tuning experimental de GPT-2; perdida de validacion en aumento |
| openai-community/gpt2 | 124 M | 1024 tokens | Modified MIT (OpenAI) | Modelo base; sin afinar, probablemente mejor rendimiento |
| openai-community/gpt2-medium | 355 M | 1024 tokens | Modified MIT (OpenAI) | Misma familia, mas capacidad; sin fine-tuning orientado a codigo |
| codeparrot/codeparrot-small | 110 M | 1024 tokens | Apache 2.0 | Fine-tuning de GPT-2 sobre 20 GB de codigo Python documentado; referencia real del enfoque CodeParrot |

## Limitaciones y advertencias

- **Calidad del fine-tuning dudosa:** la perdida de validacion empeoro durante todo el entrenamiento (de 6,51 a 7,63), senal de que el modelo probablemente rinde peor que GPT-2 base. No se recomienda para produccion.
- **Dataset no documentado:** la model card indica "unknown dataset", por lo que es imposible evaluar sesgos, dominio o procedencia de los datos de entrenamiento.
- **Riesgo de alucinacion:** como todo GPT-2, genera texto plausiblemente falso sin mecanismos de verificacion; el riesgo es alto y no se ha mitigado con RLHF ni DPO.
- **Idioma y contexto no documentados:** no se especifican idiomas soportados ni ventana de contexto; GPT-2 base esta entrenado principalmente en ingles con 1024 tokens.
- **Sin benchmarks:** no hay evaluaciones estandarizadas que permitan comparar objetivamente su calidad.
- **Licencia:** MIT, sin restricciones para uso comercial, pero la ausencia de documentacion sobre datos de entrenamiento exige precaucion adicional en entornos regulados.
- **Uso recomendado:** educativo y experimental; evitar despliegues orientados a usuarios finales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/einobe13/codeparrot-ds
- Modelo base (GPT-2): https://huggingface.co/openai-community/gpt2
- Proyecto CodeParrot original (referencia del nombre): https://huggingface.co/codeparrot
- Paper, repositorio de codigo y demos: no disponibles
