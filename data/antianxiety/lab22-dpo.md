# Antianxiety/lab22-dpo

## Resumen

Antianxiety/lab22-dpo es un adaptador LoRA de 0,1 GB entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `unsloth/Qwen2.5-3B-bnb-4bit`, una version cuantizada a 4 bits de Qwen2.5-3B. El modelo esta disenado para alineacion de preferencias en generacion de texto conversacional, y su nombre sugiere que forma parte de un laboratorio educativo (posiblemente el programa VinUni AICB, segun los repositorios asociados encontrados en la busqueda web).

El adaptador se publica con la libreria PEFT y el pipeline de text-generation, lo que indica que debe cargarse sobre el modelo base Qwen2.5-3B para funcionar. La informacion disponible en la model card es extremadamente limitada: no se especifican datos de entrenamiento, hiperparametros, licencia ni idiomas soportados. Los resultados de busqueda apuntan a que el entrenamiento pudo realizarse con datos de preferencias como `argilla/ultrafeedback-binarized-preferences-cleaned` y `5CD-AI/Vietnamese-alpaca-cleaned`, lo que sugiere un enfoque bilingue ingles-vietnamita, aunque esto no esta confirmado en la ficha oficial.

La relevancia de este modelo es principalmente didactica: ilustra el flujo completo de alineacion DPO sobre un modelo pequeno (3B) usando QLoRA, con cuantizacion a 4 bits. No es un modelo pensado para produccion, sino una demostracion de tecnicas de alineacion accesibles en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-3B) con adaptador LoRA |
| Parametros totales | no disponible (adaptador LoRA de 0,1 GB; base: 3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base Qwen2.5-3B soporta 32 768 tokens) |
| Tipos de cuantizacion | bnb-4bit (modelo base); adaptador en safetensors |
| Idiomas soportados | no disponible (posible ingles y vietnamita segun datos de entrenamiento inferidos) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) disenado para acoplarse a Qwen2.5-3B, un transformer decoder-only con 3 000 millones de parametros y una ventana de contexto de 32 768 tokens. El adaptador se entrena con DPO, un metodo de alineacion que optimiza directamente preferencias humanas sin necesidad de un modelo de recompensa separado, a diferencia de RLHF clasico.

El entrenamiento se realizo sobre una version cuantizada a 4 bits del modelo base (`unsloth/Qwen2.5-3B-bnb-4bit`), lo que indica el uso de QLoRA para reducir los requisitos de memoria. Segun los repositorios de GitHub asociados, el flujo de entrenamiento incluye preparacion de datos de preferencias, entrenamiento DPO, evaluacion comparativa y conversion a GGUF. Los datasets probablemente incluyen `argilla/ultrafeedback-binarized-preferences-cleaned` (preferencias en ingles) y `5CD-AI/Vietnamese-alpaca-cleaned` (instrucciones en vietnamita), aunque esto no se confirma en la model card oficial. No se especifican hiperparametros de entrenamiento, numero de pasos, tasa de aprendizaje ni regimen de precision.

## Capacidades

- Generacion de texto conversacional: el adaptador esta disenado para mejorar la calidad de las respuestas del modelo base en tareas de dialogo.
- Alineacion con preferencias: el entrenamiento DPO busca que el modelo prefiera respuestas mas utiles y menos daninas, segun los datos de preferencias utilizados.
- Multilingue limitado: si se confirma el uso de datos vietnamitas, el modelo podria tener cierta capacidad en vietnamita ademas de ingles, pero no hay evidencia solida.
- Sin tool calling: no hay indicios de soporte para function calling o uso de herramientas.
- Sin capacidades multimodales: es un modelo de texto puro.
- Sin modo de razonamiento explicito: no se menciona thinking mode ni razonamiento multi-paso especial.

## Casos de uso

- Experimentacion educativa en alineacion de modelos: el adaptador sirve como ejemplo practico de entrenamiento DPO con QLoRA sobre un modelo pequeno, util para cursos o talleres de IA generativa.
- Investigacion en preferencias: permite estudiar como el DPO afecta el comportamiento de un modelo de 3B en tareas conversacionales, comparando antes y despues del adaptador.
- Prototipado rapido de chatbots alineados: combinado con el modelo base, puede usarse para crear un chatbot pequeno con respuestas mas alineadas con preferencias humanas en entornos de desarrollo.
- Evaluacion de tecnicas de cuantizacion: al estar disenado para funcionar sobre un base cuantizado a 4 bits, es util para probar el impacto de la cuantizacion en la calidad de la alineacion.
- Benchmarking de DPO vs SFT: puede compararse con adaptadores entrenados con supervisio tradicional para medir diferencias en calidad de respuesta.
- Demo de despliegue en hardware modesto: al ser un adaptador pequeno sobre un modelo de 3B, puede desplegarse en GPUs de consumo para demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion, y los notebooks asociados mencionan la posibilidad de ejecutar IFEval, GSM8K, MMLU y AlpacaEval-lite, pero no se proporcionan resultados concretos.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre un modelo de 3B cuantizado a 4 bits, la inferencia puede requerir entre 3 y 5 GB de VRAM, dependiendo de la longitud de contexto y el batch size.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (RTX 2060, RTX 3060, RTX 4060) puede ejecutar el modelo. Una RTX 4090 o A100 permitiria mayor throughput y contextos mas largos.
- Compatibilidad con consumer GPU: si, cabe en GPUs de consumo con 6 GB o mas de VRAM.
- Opciones de despliegue: al ser un adaptador PEFT, debe cargarse con transformers y peft. Tambien puede convertirse a GGUF (como se observa en el repositorio `Wan1302/lab22-dpo-adapter-gguf`) para usarse con llama.cpp u Ollama.
- Latencia y throughput: no disponible. Para un modelo de 3B en una GPU moderna, se espera una generacion de decenas de tokens por segundo, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo de alineacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Antianxiety/lab22-dpo | 3B (base) + LoRA | 32k (base) | DPO | no disponible | HuggingFace |
| Qwen2.5-3B-Instruct | 3B | 32k | RLHF | Apache 2.0 | HuggingFace |
| Llama 3.2 3B Instruct | 3B | 128k | RLHF | Llama 3.2 Community License | HuggingFace |
| Phi-3.5-mini-instruct | 3,8B | 128k | SFT + DPO | MIT | HuggingFace |

La comparativa se basa en el modelo base, ya que el adaptador no es directamente comparable. Qwen2.5-3B-Instruct es la alternativa oficial de Alibaba con alineacion RLHF, mientras que Llama 3.2 3B y Phi-3.5-mini son alternativas de tamano similar con licencias mas permisivas. El adaptador lab22-dpo no ofrece ventajas claras sobre estas opciones, salvo su valor didactico.

## Limitaciones y advertencias

- Model card incompleta: no se especifican datos de entrenamiento, hiperparametros, licencia ni idiomas. Esto impide evaluar su idoneidad para uso en produccion.
- Riesgo de alucinacion: al ser un modelo de 3B, tiene mayor tendencia a alucinar que modelos mas grandes, especialmente en tareas complejas.
- Sesgos desconocidos: sin informacion sobre los datos de entrenamiento, no es posible evaluar sesgos potenciales.
- Licencia no disponible: no se puede determinar si es apto para uso comercial.
- Dependencia del modelo base: el adaptador solo funciona con Qwen2.5-3B, y su calidad depende de la del modelo base cuantizado a 4 bits.
- Sin garantias de calidad: al ser un proyecto aparentemente educativo, no hay evidencia de evaluacion rigurosa ni mantenimiento.
- Posible sesgo hacia ingles y vietnamita: si los datos de entrenamiento son los inferidos, el modelo puede tener un rendimiento pobre en otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Antianxiety/lab22-dpo
- Adaptador alternativo: https://huggingface.co/Wan1302/lab22-dpo-adapter-adapter
- Version GGUF: https://huggingface.co/Wan1302/lab22-dpo-adapter-gguf
- Notebook de entrenamiento (T4): https://github.com/VinUni-AI20k/Day22-Track3-DPO-Alignment-Lab/blob/main/colab/Lab22_DPO_T4.ipynb
- Notebook de entrenamiento (BigGPU): https://github.com/DaoThang38/2A202600540-DaoTatThang-Day22/blob/main/colab/Lab22_DPO_BigGPU.ipynb
- Repositorio del laboratorio: https://github.com/VinUni-AI20k/Day22-Track3-DPO-Alignment-Lab
