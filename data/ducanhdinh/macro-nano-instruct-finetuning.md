# ducanhdinh/Macro-Nano-Instruct-Finetuning

## Resumen

Macro-Nano-Instruct-Finetuning es un adaptador LoRA desarrollado por ducanhdinh sobre el modelo base ATH-MaaS/Marco-Nano-Instruct, una variante del modelo MoE multilingüe Marco-Nano-Instruct de Alibaba International Digital Commerce (AIDC-AI). El modelo base es un Mixture-of-Experts altamente disperso con 8B parámetros totales y solo 0.6B activos por token (7.5% de activación), con una ventana de contexto de 32K tokens. Este adaptador se ha entrenado específicamente para mejorar la traducción automática y el seguimiento de instrucciones en tareas multilingües, aprovechando la arquitectura MoE del modelo base.

El adaptador se aplica a las capas 9 a 18 de las 28 capas totales, añadiendo LoRA a los módulos de atención, router y expertos. Se entrenó con datos de alineación multilingüe procedentes de los conjuntos flores, bible y ntrex, utilizando la pérdida estándar de MoE con load balancing loss. Aunque el repositorio tiene 0 descargas y 0 likes, su relevancia radica en demostrar un enfoque de fine-tuning eficiente sobre un modelo MoE extremadamente disperso, con potencial para aplicaciones de traducción y generación de texto multilingüe en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con LoRA adapters |
| Parametros totales | 8B (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | 0.6B por token (modelo base) |
| Longitud de contexto | 32K tokens (modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Multilingue (no se especifican idiomas concretos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base Marco-Nano-Instruct es un MoE con 232 expertos y top-k=8, lo que significa que para cada token se activan 8 de los 232 expertos. Esta alta dispersión (7.5% de activación) permite un rendimiento eficiente con un coste computacional reducido. El adaptador LoRA se aplica únicamente a las capas 9 a 18 (de 28), con r=16, alpha=32 y dropout=0.05, modificando los módulos de atención, router y expertos dentro de ese rango.

El entrenamiento del adaptador utiliza la pérdida estándar de MoE: `L_total = L_LM + lb_loss_coef * L_LB`, donde `L_LM` es la cross-entropy sobre el siguiente token y `L_LB` es la load balancing loss estilo Switch/Mixtral aplicada a los routers de las capas finetuneadas. El coeficiente `lb_loss_coef` no se especifica (None). Los datos de entrenamiento provienen de tres conjuntos de alineación multilingüe (flores, bible, ntrex), donde cada campo de idioma en un registro se trata como una muestra individual. Los datos se barajan y ordenan por longitud de token antes de agrupar en batches. No se menciona el uso de RLHF o DPO; el entrenamiento se centra en la pérdida de modelado de lenguaje y equilibrio de carga.

## Capacidades

- Generacion de texto multilingue: el modelo base es capaz de generar texto coherente en múltiples idiomas, y el adaptador mejora la traduccion automatica y el seguimiento de instrucciones.
- Traduccion automatica: entrenado con datos de traduccion (flores, bible, ntrex), el adaptador esta optimizado para tareas de traduccion entre pares de idiomas.
- Seguimiento de instrucciones: al ser una variante "Instruct", el modelo puede seguir instrucciones complejas en formato conversacional o de tarea.
- Razonamiento con contexto largo: con 32K tokens de contexto, puede manejar documentos largos o conversaciones multi-turno.
- Eficiencia computacional: gracias a la arquitectura MoE dispersa, solo se activan 0.6B parametros por token, lo que reduce los requisitos de computo en inferencia.
- No se ha confirmado soporte para tool calling, agentes o capacidades de vision/audio en la informacion disponible.

## Casos de uso

- Traduccion automatica de documentos largos: con su ventana de 32K tokens, el modelo puede traducir informes o articulos extensos manteniendo coherencia contextual. El adaptador esta especificamente entrenado con datos de traduccion, por lo que es adecuado para pipelines de traduccion en produccion.
- Atencion al cliente multilingue: el modelo puede gestionar conversaciones en varios idiomas, aprovechando su capacidad de seguir instrucciones y su contexto amplio para recordar interacciones previas.
- Generacion de contenido localizado: para empresas que necesitan producir textos en multiples idiomas (descripciones de productos, noticias, etc.), el modelo ofrece una solucion eficiente con bajo coste de inferencia.
- Analisis de sentimiento y clasificacion de texto multilingue: aunque no esta explicitamente entrenado para ello, el modelo base es un LLM instruct que puede adaptarse a tareas de clasificacion mediante prompt engineering.
- Asistentes virtuales en dispositivos con recursos limitados: al activar solo 0.6B parametros por token, el modelo puede ejecutarse en hardware modesto, ideal para aplicaciones edge o moviles.
- Investigacion academica en NLP multilingue: el adaptador y su metodologia de fine-tuning sobre MoE pueden servir como referencia para estudios sobre eficiencia y transferencia multilingue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para el adaptador Macro-Nano-Instruct-Finetuning en la informacion disponible. El modelo base Marco-Nano-Instruct (AIDC-AI) reporta ser el mejor en su categoria segun la descripcion oficial, pero no se proporcionan numeros concretos en los resultados de busqueda. Se recomienda consultar la pagina del modelo base para obtener metricas de MMLU, HumanEval, GSM8K u otros benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base requiere aproximadamente 16.1 GB de VRAM segun LLM Explorer (para FP16). El adaptador LoRA anade una sobrecarga minima (menos de 1 GB adicional).
- GPU recomendadas: una GPU con al menos 16 GB de VRAM, como RTX 4090, A100 40GB o H100. Para cuantizacion a 8 bits o 4 bits, podria caber en GPUs con 8-12 GB (ej. RTX 3080, RTX 4070).
- En consumer GPU: si, con cuantizacion (por ejemplo, Q4_K_M via llama.cpp) se puede ejecutar en GPUs de 8 GB, aunque con menor precision.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la libreria `peft` de Hugging Face junto con el modelo base. Tambien es compatible con frameworks como vLLM (si soporta MoE), llama.cpp (via GGUF) y Ollama (si se convierte el adaptador). No se han encontrado instrucciones especificas de despliegue.
- Latencia y throughput: no disponible. Depende del hardware y la cuantizacion. La arquitectura MoE con 0.6B parametros activos sugiere una latencia menor que un modelo denso de 8B, pero mayor que un modelo de 0.6B denso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Macro-Nano-Instruct-Finetuning (este) | 8B total, 0.6B activos + LoRA | 32K | Apache-2.0 | Adaptador sobre Marco-Nano-Instruct |
| AIDC-AI/Marco-Nano-Instruct | 8B total, 0.6B activos | 32K | Apache-2.0 | Modelo base, sin adaptador |
| Qwen2.5-7B-Instruct | 7B denso | 32K | Apache-2.0 | Alternativa densa, mas parametros activos |
| Llama-3.1-8B-Instruct | 8B denso | 128K | Llama 3.1 | Alternativa densa, contexto mas largo |

El adaptador no tiene comparativa directa con otros adaptadores similares. La ventaja principal frente a modelos densos de tamano similar es la eficiencia computacional: solo 0.6B parametros activos por token, lo que reduce el coste de inferencia. Sin embargo, los modelos densos como Qwen2.5-7B suelen tener mejor rendimiento en tareas de razonamiento general.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo base entrenado con datos multilingue, puede heredar sesgos culturales y de genero presentes en los datos de entrenamiento. No se ha realizado una evaluacion especifica de sesgos para este adaptador.
- Riesgo de alucinacion: como todo LLM, puede generar informacion falsa o inventada, especialmente en tareas de generacion creativa o cuando el contexto es ambiguo.
- Limitaciones de idioma: aunque el modelo es multilingue, no se especifican los idiomas soportados. El rendimiento puede variar significativamente entre idiomas, siendo probablemente mejor en idiomas con mas representacion en los datos de entrenamiento (ingles, espanol, frances, etc.).
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial y modificacion, pero se debe mantener la atribucion y los avisos de copyright. No hay restricciones conocidas adicionales.
- Caveat para produccion: el adaptador es un fine-tuning experimental con 0 descargas y 0 likes; no hay evidencia de pruebas exhaustivas en entornos de produccion. Se recomienda validar su rendimiento en el caso de uso especifico antes de desplegarlo.
- Dependencia del modelo base: el adaptador requiere cargar el modelo base ATH-MaaS/Marco-Nano-Instruct, que a su vez depende de la infraestructura de Alibaba. Asegurese de que el modelo base este disponible y sea compatible.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/ducanhdinh/Macro-Nano-Instruct-Finetuning
- Modelo base ATH-MaaS/Marco-Nano-Instruct: https://huggingface.co/ATH-MaaS/Marco-Nano-Instruct
- Modelo original AIDC-AI/Marco-Nano-Instruct: https://huggingface.co/AIDC-AI/Marco-Nano-Instruct
- Lista de fine-tunes de Marco-Nano-Instruct: https://huggingface.co/models?other=base_model:finetune:AIDC-AI/Marco-Nano-Instruct
- Repositorio GitHub no oficial (Damacol/aidc-ai-marco-nano-instruct): https://github.com/Damacol/aidc-ai-marco-nano-instruct/tree/main
- LLM Explorer (Marco Nano Instruct): https://llm-explorer.com/model/AIDC-AI%2FMarco-Nano-Instruct,3QJ0ltDVk5EjvbNTUZLuXC
