# mradermacher/Borealis-Code-1.0-GGUF

## Resumen

Borealis-Code-1.0 es un modelo de lenguaje de gran tamaño (LLM) especializado en generación de código, desarrollado por KellHect y cuantizado a formato GGUF por mradermacher. Se trata de un modelo de arquitectura MoE (mezcla de expertos) basado en la familia Cohere2, con un total de 30.484 millones de parámetros. El modelo ha sido sometido a un proceso de "abliteration", una técnica que elimina los mecanismos de rechazo y censura del modelo original, lo que lo convierte en una herramienta "uncensored" (sin censura) orientada a la investigación de seguridad de IA y al red teaming.

La versión GGUF aquí documentada ofrece múltiples cuantizaciones (desde Q2_K hasta Q8_0) para facilitar su despliegue en entornos con recursos limitados. El modelo está pensado para tareas de generación de código, conversación y experimentación en entornos de investigación donde se requiere un comportamiento sin restricciones. Su licencia Apache 2.0 permite uso comercial, aunque su naturaleza "uncensored" exige precaución en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Cohere2) |
| Parametros totales | 30.484.303.872 (30,5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base, KellHect/Borealis-Code-1.0, emplea una arquitectura de mezcla de expertos (MoE) basada en la familia Cohere2, lo que implica que solo una fracción de los parámetros se activa durante la inferencia. Sin embargo, no se ha especificado el número de parámetros activos ni el número de expertos. El modelo ha sido sometido a un proceso de "abliteration", que elimina las capas o pesos responsables de los rechazos de seguridad, resultando en un comportamiento "uncensored". Esta técnica es común en modelos destinados a investigación de seguridad y red teaming.

No se dispone de información detallada sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni las técnicas de alineación (RLHF, DPO, etc.). Los tags del repositorio indican que el modelo está orientado a código y a conversación, y que es compatible con endpoints de inferencia. La cuantización GGUF ha sido realizada por mradermacher mediante conversión estática, sin utilizar técnicas de imatrix o weighted quantization en esta versión.

## Capacidades

- Generacion de codigo: el modelo esta especializado en tareas de programacion, incluyendo generacion, completado y explicacion de codigo.
- Conversacion: soporta interacciones multi-turno de tipo chatbot, con un tono conversacional.
- Sin censura (uncensored): al haber sido "abliterated", no aplica los filtros de seguridad habituales, lo que permite generar contenido que otros modelos rechazarian.
- Investigacion de seguridad: disenado para red teaming y evaluacion de riesgos en sistemas de IA, permitiendo probar comportamientos adversarios.
- Compatibilidad con endpoints: el formato GGUF es compatible con multiples motores de inferencia (llama.cpp, Ollama, etc.).
- Multilingue: solo se declara soporte para ingles (en).

## Casos de uso

- Red teaming y evaluacion de seguridad: el modelo puede utilizarse para generar prompts adversariales o contenido que ponga a prueba los mecanismos de seguridad de otros sistemas de IA, gracias a su naturaleza "uncensored".
- Generacion de codigo en entornos de investigacion: permite explorar patrones de programacion sin restricciones, util para estudiar sesgos o vulnerabilidades en codigo generado automaticamente.
- Prototipado rapido de asistentes de codigo: al ser un modelo MoE de 30B, puede desplegarse localmente con cuantizacion Q4 en GPUs de consumo para experimentar con asistentes de programacion.
- Pruebas de robustez en chatbots: al no tener filtros, se puede usar para identificar fallos de moderacion en sistemas conversacionales.
- Analisis de codigo ofensivo: en contextos de ciberseguridad, puede generar ejemplos de codigo malicioso para estudiar defensas, siempre en entornos controlados.
- Investigacion academica sobre alineacion: el comportamiento "abliterated" permite estudiar el impacto de eliminar mecanismos de seguridad en LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la cuantizacion, el archivo Q4_K_M pesa 18,7 GB, por lo que se necesitan al menos 20 GB de VRAM para cargarlo en GPU. La version Q8_0 (32,5 GB) requiere unos 34 GB de VRAM.
- GPU recomendadas: para la cuantizacion Q4, una RTX 4090 (24 GB) o una A100 (40 GB) son adecuadas. Para Q8_0, se recomienda A100 80GB o H100.
- En consumer GPU: el modelo cabe en GPUs de 24 GB (RTX 3090/4090) con cuantizacion Q4_K_M o inferior. Con Q2_K (11,5 GB) puede ejecutarse en GPUs de 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores compatibles con GGUF como llama-cpp-python. Tambien puede usarse con vLLM si se convierte a safetensors.
- Latencia y throughput: no disponible. Al ser un modelo MoE, la velocidad depende del numero de expertos activos, dato no especificado.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria (MoE de ~30B orientados a codigo). No se han encontrado datos de rendimiento ni especificaciones detalladas de modelos comparables en las fuentes consultadas.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo "uncensored" y "abliterated", puede generar contenido ofensivo, violento o ilegal sin restricciones. No es apto para uso directo en produccion sin filtros adicionales.
- Riesgo de alucinacion: como cualquier LLM, puede inventar informacion o codigo incorrecto. No se han publicado evaluaciones de fiabilidad.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada, lo que puede limitar su uso en tareas que requieran ventanas largas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el caracter "uncensored" puede implicar responsabilidades legales si se utiliza para generar contenido danino.
- Caveat para produccion: no se recomienda su uso en sistemas orientados al publico sin un moderador de contenido o filtros de seguridad adicionales.
- Idioma: solo soporta ingles, lo que limita su aplicacion en entornos multilingues.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Borealis-Code-1.0-GGUF
- Modelo base: https://huggingface.co/KellHect/Borealis-Code-1.0
- Repositorio GitHub relacionado (no confirmado como el mismo proyecto): https://github.com/Aurelien033/Borealis
