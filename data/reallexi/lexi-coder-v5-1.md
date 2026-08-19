# reallexi/lexi-coder-v5.1

## Resumen

lexi-coder-v5.1 es un modelo de lenguaje especializado en generación de código y conversación técnica, desarrollado por Reallexi LLC mediante su plataforma AI Model Builder. Se trata de un ajuste fino con LoRA sobre el modelo base reallexi/lexi-coder-v4.3, con el adaptador fusionado en los pesos finales, lo que permite usarlo sin cargar adaptadores PEFT en tiempo de ejecución. Con aproximadamente 3,86 mil millones de parámetros (3.836.021.760 según los pesos safetensors), el modelo está diseñado para tareas de programación como completar código, corregir errores y generar algoritmos, así como para mantener diálogos técnicos.

Su tamaño compacto lo hace adecuado para despliegue en hardware de consumo, con opciones de cuantización que reducen los requisitos de memoria a menos de 2 GB en 4 bits. La relevancia actual radica en su enfoque específico en código y su naturaleza de código abierto (con licencia heredada), lo que permite a desarrolladores e investigadores integrarlo en flujos de trabajo de asistencia a la programación, automatización de tareas de desarrollo y chatbots técnicos. El contexto de entrenamiento es de 1.024 tokens, aunque se ha observado que podría soportar ventanas mayores en inferencia, dato no confirmado oficialmente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Phi-3, segun etiquetas) |
| Parametros totales | 3.836.021.760 (3,86 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens (entrenamiento); posible extension a 32K no confirmada |
| Tipos de cuantizacion | FP16/BF16, 8-bit (Q8_0), 4-bit (Q4_K_M) |
| Idiomas soportados | No disponible (orientado a codigo, con ejemplos en ingles y japones) |
| Licencia | Inherits base model and dataset terms (heredada) |
| Formato de pesos | safetensors, GGUF |

Nota: la arquitectura exacta no esta especificada en la documentacion, pero las etiquetas incluyen "phi3", lo que sugiere una base Phi-3 de Microsoft. Los parametros activos no aplican al no ser un modelo MoE.

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura Transformer de tipo Phi-3, segun las etiquetas del repositorio, aunque la documentacion no detalla la configuracion exacta (numero de capas, dimensiones, etc.). El entrenamiento se realizo mediante ajuste fino con LoRA (Low-Rank Adaptation) sobre el modelo base reallexi/lexi-coder-v4.3, con un rango de 16 y alpha de 32. El adaptador se fusiono posteriormente en los pesos base, dando lugar a un unico archivo de pesos.

El conjunto de datos de entrenamiento es reallexi/lexi-coder-v3-datasest, del cual se aprendieron 110.000 muestras (segun la fase 28 de 258 del proceso de entrenamiento). Se realizaron 15.000 pasos de entrenamiento durante 3 epocas. La curva de perdida se muestra en el repositorio, pero no se proporcionan valores numericos. No se menciona el uso de RLHF o DPO; el ajuste parece ser supervisado unicamente. Una caracteristica destacable es que el modelo se ha disenado para ser autonomo, sin necesidad de adaptadores PEFT en tiempo de ejecucion, lo que simplifica su integracion en aplicaciones.

## Capacidades

- Generacion de codigo: completa funciones, corrige errores sintacticos y genera algoritmos (por ejemplo, implementaciones de quicksort, merge sort, recorridos de arboles).
- Conversacion tecnica: puede mantener dialogos sobre programacion y temas relacionados, gracias a su entrenamiento con datos conversacionales.
- Soporte de codigo personalizado: la etiqueta "custom_code" sugiere que puede manejar codigo definido por el usuario.
- Multilingue limitado: aunque no se especifican idiomas, los ejemplos muestran respuestas en ingles y japones, por lo que podria manejar varios idiomas en prompts de codigo.
- No se mencionan capacidades de tool calling, agentes o razonamiento multi-paso explicitas.

## Casos de uso

- Asistente de programacion en IDE: el modelo puede completar codigo en tiempo real, sugiriendo implementaciones de funciones y corrigiendo errores comunes, gracias a su entrenamiento en datos de programacion.
- Generacion de codigo para algoritmos: util para generar implementaciones de estructuras de datos y algoritmos (ordenacion, recorridos, etc.) a partir de descripciones en lenguaje natural.
- Chatbot tecnico de soporte: puede responder preguntas sobre programacion y ofrecer ejemplos de codigo en un entorno conversacional, adecuado para foros o asistentes internos.
- Automatizacion de tareas de desarrollo: integrado en pipelines de CI/CD para generar codigo de prueba, documentacion o parches simples.
- Educacion en programacion: como herramienta de ayuda para estudiantes que necesitan ejemplos o explicaciones de codigo.
- Traduccion de codigo entre lenguajes: aunque no esta confirmado, podria utilizarse para convertir fragmentos de codigo entre Python, Java u otros lenguajes, basandose en su conocimiento de multiples paradigmas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye ejemplos "antes/despues" que muestran mejoras en la generacion de codigo, pero no constituyen una evaluacion formal. No hay datos de MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware

- Memoria para pesos segun precision:
  - FP16/BF16: 7,19 GB
  - 8-bit (Q8_0): 3,59 GB
  - 4-bit (Q4_K_M): 1,98 GB
- VRAM total estimada para inferencia: anadir overhead de contexto y runtime (por ejemplo, con 1K tokens de contexto, unos 2-3 GB adicionales).
- GPUs recomendadas: para FP16, una GPU con al menos 8-10 GB de VRAM (por ejemplo, RTX 3070/3080, A10). Para cuantizacion 4-bit, una GPU con 4 GB o mas (por ejemplo, RTX 3050, GTX 1660 Super).
- Es viable en hardware de consumo con cuantizacion.
- Opciones de despliegue: transformers (Python), GGUF para llama.cpp/Ollama, y compatible con text-generation-inference (TGI) segun las etiquetas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Sin embargo, por tamano y enfoque, se puede comparar estructuralmente con otros modelos de codigo de ~3-4B como:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| lexi-coder-v5.1 | 3,86 B | 1.024 (entrenamiento) | Heredada | Hugging Face |
| CodeLlama 7B | 7 B | 16K | Llama 2 Community License | Hugging Face |
| DeepSeek-Coder 6.7B | 6,7 B | 16K | DeepSeek License | Hugging Face |
| Phi-3-mini (base) | 3,8 B | 4K/32K | MIT | Hugging Face |

La comparacion se limita a parametros y contexto, ya que no hay benchmarks publicados. Se recomienda evaluar con cargas de trabajo propias.

## Limitaciones y advertencias

- Contexto de entrenamiento limitado a 1.024 tokens: puede perder coherencia en prompts largos o generar respuestas incompletas en conversaciones extensas.
- Licencia heredada: los terminos reales dependen del modelo base (reallexi/lexi-coder-v4.3) y del dataset de entrenamiento, que no son necesariamente los mismos que los del proyecto. Debe revisarse antes de uso comercial o redistribucion.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar codigo incorrecto o inventar APIs inexistentes.
- Sesgos potenciales: derivados de los datos de entrenamiento, que no estan documentados.
- Sin soporte explicito para tool calling o agentes: las capacidades se limitan a generacion de texto y codigo.
- El numero de descargas es bajo (217) y no hay valoraciones, lo que indica poca adopcion y posible falta de validacion externa.

## Enlaces

- [Hugging Face: reallexi/lexi-coder-v5.1](https://huggingface.co/reallexi/lexi-coder-v5.1)
- [Arbol de archivos del repositorio](https://huggingface.co/reallexi/lexi-coder-v5.1/tree/main)
- [LLM Explorer: ficha del modelo](https://llm-explorer.com/model/reallexi%2Flexi-coder-v5.1,1toNlHieZLjNUMNBjpcxb1)
- [GitHub: Reallexi AI Model Builder](https://github.com/ddkits/reallexi-ai-model-builder)
- [Reallexi Model Control (API)](https://rymilan.com/)
