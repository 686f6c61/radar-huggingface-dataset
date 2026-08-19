# Lufel6848/DeepSeek-R1-Distill-Qwen-7B-to-GGUF

## Resumen

DeepSeek-R1-Distill-Qwen-7B-to-GGUF es una conversión comunitaria no oficial del modelo DeepSeek-R1-Distill-Qwen-7B al formato GGUF, realizada por el usuario Lufel6848. El modelo original, desarrollado por DeepSeek, es una destilación de DeepSeek-R1 sobre la base Qwen2.5-Math-7B, fine-tuneado con datos de razonamiento generados por el propio R1. Esta versión GGUF permite ejecutar el modelo en entornos locales mediante llama.cpp y otros motores compatibles, sin necesidad de depender de la infraestructura de DeepSeek.

La relevancia de este repositorio radica en que ofrece múltiples cuantizaciones (BF16, Q4_K_M, Q5_K_M, Q6_K, Q8_0) que ajustan el equilibrio entre precisión y consumo de memoria, facilitando su despliegue en hardware variado, desde GPUs de consumo hasta servidores con mayor capacidad. El modelo conserva las capacidades de razonamiento y chain-of-thought del original, con una ventana de contexto de 128k tokens según fuentes externas. La licencia MIT permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (arquitectura Qwen2.5) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128k tokens (segun LM Studio) |
| Tipos de cuantizacion | BF16, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles, chino |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-Math-7B, un transformer decoder denso con arquitectura estándar de la familia Qwen. DeepSeek lo fine-tuneó utilizando datos de razonamiento generados por DeepSeek-R1, un proceso de destilación que transfiere las capacidades de razonamiento complejo del modelo grande a un modelo más pequeño y eficiente. No se han publicado detalles sobre el número exacto de tokens de entrenamiento ni la composición del dataset, pero el enfoque es similar al de otros modelos destilados de la serie R1.

La conversión a GGUF se realizó con las herramientas de llama.cpp: primero se convirtieron los pesos SafeTensors a GGUF en BF16 y luego se aplicaron cuantizaciones K-quant (Q4_K_M, Q5_K_M, Q6_K, Q8_0) mediante llama-quantize. No se realizó ningún entrenamiento adicional durante la conversión; solo se cambió la representación numérica de los pesos.

## Capacidades

- Razonamiento paso a paso y chain-of-thought: el modelo está específicamente entrenado para desglosar problemas complejos en pasos intermedios, mostrando su proceso de razonamiento antes de dar la respuesta final.
- Matematicas avanzadas: al estar basado en Qwen2.5-Math, destaca en problemas aritmeticos, algebraicos, calculo y razonamiento cuantitativo.
- Generacion de codigo: puede escribir y depurar codigo en multiples lenguajes, aunque su especializacion principal es el razonamiento logico-matematico.
- Comprension multilingue: soporta ingles y chino, con mejor rendimiento en estos idiomas que en otros.
- Inferencia local eficiente: gracias a las cuantizaciones GGUF, puede ejecutarse en CPUs y GPUs de consumo con requisitos de memoria reducidos.
- Compatibilidad con ecosistema llama.cpp: funciona con llama-cli, llama-server, y aplicaciones como Ollama, LM Studio o text-generation-webui.

## Casos de uso

- Resolucion de problemas matematicos en entornos educativos: el modelo puede explicar paso a paso la resolucion de ecuaciones, integrales o problemas de probabilidad, sirviendo como tutor automatico para estudiantes.
- Generacion de codigo con razonamiento: en un IDE o pipeline de CI/CD, puede generar funciones complejas, revisar algoritmos o proponer soluciones optimizadas, mostrando el razonamiento detras de cada decision.
- Analisis de datos y razonamiento logico: para tareas de extraccion de conclusiones a partir de datos estructurados, el modelo puede descomponer hipotesis y validar logicamente los resultados.
- Asistente de investigacion: ayuda a estructurar argumentos, revisar demostraciones matematicas o generar explicaciones tecnicas detalladas en ingles o chino.
- Chatbot de soporte tecnico con capacidad de razonamiento: integrado en un sistema de atencion al cliente, puede diagnosticar problemas complejos siguiendo cadenas de causa-efecto y proponer soluciones justificadas.
- Prototipado rapido de agentes de razonamiento: al ser ligero y ejecutable localmente, es adecuado para experimentar con arquitecturas de agentes que requieren multiples pasos de razonamiento sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original DeepSeek-R1-Distill-Qwen-7B tiene metricas publicadas por DeepSeek (por ejemplo, en MMLU, GSM8K, HumanEval), pero no se incluyen en la documentacion de este repositorio de conversion. Se recomienda consultar la model card del modelo original para obtener datos comparativos.

## Requisitos de hardware

- VRAM estimada para inferencia (depende de la cuantizacion y la longitud de contexto):
  - Q4_K_M: aproximadamente 4,5-5 GB
  - Q5_K_M: aproximadamente 5,5-6 GB
  - Q6_K: aproximadamente 6,5-7 GB
  - Q8_0: aproximadamente 8-9 GB
  - BF16: aproximadamente 15-16 GB
- GPUs recomendadas: cualquier GPU con al menos 6 GB de VRAM para Q4_K_M o Q5_K_M (por ejemplo, RTX 3060, RTX 4060, GTX 1080 Ti). Para Q8_0 o BF16 se necesitan GPUs con 12 GB o mas (RTX 3080, RTX 4070 Ti, A10, etc.).
- En CPU: puede ejecutarse con llama.cpp en modo CPU, aunque la velocidad sera significativamente menor. Se recomienda al menos 16 GB de RAM para las cuantizaciones mas bajas.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, text-generation-webui, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no se han publicado mediciones especificas. En una GPU moderna (por ejemplo, RTX 4090) con Q4_K_M, se puede esperar una generacion de 20-40 tokens por segundo, pero depende del hardware y la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-7B (GGUF) | 7,6B | 128k | MIT | GGUF | Razonamiento, matematicas |
| Qwen2.5-7B-Instruct | 7,6B | 128k | Apache 2.0 | SafeTensors, GGUF | Instrucciones generales, chat |
| Llama-3.1-8B-Instruct | 8,0B | 128k | Llama 3.1 Community | SafeTensors, GGUF | Instrucciones generales, multilingue |
| Mistral-7B-Instruct-v0.3 | 7,3B | 32k | Apache 2.0 | SafeTensors, GGUF | Instrucciones generales |

La principal diferencia es que DeepSeek-R1-Distill-Qwen-7B esta especializado en razonamiento y matematicas, mientras que los otros modelos son mas generalistas. En benchmarks de razonamiento, el modelo de DeepSeek suele superar a los modelos generalistas de tamano similar, aunque no se dispone de datos concretos en esta informacion.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado principalmente con datos en ingles y chino, puede mostrar sesgos culturales o linguisticos en otros idiomas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar respuestas plausibles pero incorrectas, especialmente en dominios fuera de su especializacion.
- Limitaciones de contexto: aunque soporta 128k tokens, el rendimiento puede degradarse con contextos muy largos y el consumo de memoria aumenta considerablemente.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo original puede tener condiciones adicionales (aunque DeepSeek-R1-Distill-Qwen-7B tambien es MIT).
- Compatibilidad: los archivos GGUF pueden no ser compatibles con versiones antiguas de llama.cpp u otros motores; se recomienda usar versiones recientes.
- Calidad de la cuantizacion: las cuantizaciones mas bajas (Q4_K_M) pueden degradar ligeramente la precision en tareas de razonamiento complejo.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Lufel6848/DeepSeek-R1-Distill-Qwen-7B-to-GGUF
- Modelo original: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Repositorio de DeepSeek-R1 en GitHub: https://github.com/deepseek-ai/DeepSeek-R1
- Documentacion de llama.cpp: https://github.com/ggml-org/llama.cpp
- Pagina de LM Studio del modelo: https://lmstudio.ai/models/deepseek/deepseek-r1-distill-qwen-7b
- DeepWiki sobre modelos destilados: https://deepwiki.com/deepseek-ai/DeepSeek-R1/2.3-distilled-models
