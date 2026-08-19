# CMSManhattan/JiRackUltra_7b

## Resumen

JiRack Ultra 7B es un modelo de lenguaje de 7.600 millones de parámetros desarrollado por CMSManhattan, diseñado específicamente para inferencia eficiente en CPU. Se presenta como una refactorización de la arquitectura DeepSeek R1-7B con características BitNet (ternario 1.58-bit), lo que permite cuantizaciones agresivas y un consumo de memoria reducido. El modelo incorpora un tokenizador ampliado con etiquetas especiales para routing, tool calling, robótica y capacidades multimodales (media, visión, sonido), aunque no se aportan evidencias de que estas capacidades estén realmente implementadas más allá de los tokens.

El modelo se distribuye en formato GGUF con varias cuantizaciones (Q2_K, Q3_K_M, Q4_K_M y FP16) y está pensado para entornos con recursos limitados, como portátiles, equipos de gama media o despliegues en la nube de bajo coste. Incluye una interfaz web accesible mediante Docker y soporta 13 idiomas. A pesar de que la etiqueta de HuggingFace indica licencia MIT, la model card del autor especifica una licencia comercial con suscripción mensual, lo que genera una contradicción que debe tenerse en cuenta antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek R1-7B con características BitNet / ternario 1.58-bit |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_M, Q4_K_M, FP16 (full) |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th |
| Licencia | MIT (etiqueta HF) / comercial segun model card ($12 por usuario y año) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura se describe como una adaptación de DeepSeek R1-7B con soporte nativo para pesos ternarios (BitNet), lo que permite representar los pesos en 1.58 bits y reducir drásticamente el uso de memoria en inferencia. El tokenizador ha sido ampliado con tokens especiales para routing, tool calling, robótica, media, visión y sonido, aunque no se especifica si el modelo ha sido entrenado para utilizar estos tokens de forma efectiva.

No se proporcionan datos sobre el proceso de entrenamiento: no se indica el número de tokens, la composición del dataset, ni si se aplicaron técnicas como RLHF, DPO o instrucción supervisada. El autor menciona la posibilidad de realizar QAT (quantization-aware training) personalizado como servicio adicional, lo que sugiere que el entrenamiento original no incluyó necesariamente optimización ternaria desde el inicio. Tampoco se detallan innovaciones técnicas más allá de la arquitectura ternaria y el tokenizador especializado.

## Capacidades

- Generación de texto y conversación multilingüe en 13 idiomas.
- Soporte de tool calling / function calling, según los tags del tokenizador y la descripción del modelo.
- Capacidades de routing, orientadas a dirigir consultas a expertos o módulos específicos.
- Tokenizador con etiquetas para robótica, media, visión y sonido, aunque no se confirma que el modelo tenga realmente capacidades multimodales.
- Inferencia eficiente en CPU gracias a cuantizaciones GGUF y arquitectura ternaria.
- Compatible con despliegue mediante Docker y servidor ONNX Java (mencionado en la model card).

## Casos de uso

- Atención al cliente automatizada multilingüe: el modelo puede gestionar conversaciones en 13 idiomas con un consumo de RAM de entre 3 y 5 GB, lo que permite desplegarlo en servidores modestos o en la nube con coste reducido.
- Asistente de código en entornos sin GPU: gracias a su soporte de tool calling, puede integrarse en pipelines de desarrollo para generar o revisar código en equipos de trabajo con CPU únicamente.
- Agente de routing en arquitecturas RAG: el autor lo propone como modelo experto en despliegues RAG, donde puede dirigir consultas a bases de conocimiento específicas.
- Chatbot en dispositivos edge o portátiles: con cuantización Q2_K (3.2 GB de RAM) es viable en equipos con 8 GB de memoria, como laptops de gama de entrada.
- Automatización de tareas de robótica: los tokens de robótica del tokenizador podrían emplearse para generar comandos de control, aunque no hay evidencia de entrenamiento específico en este dominio.
- Despliegue en la nube con presupuesto limitado: al ejecutarse en CPU, elimina el coste de instancias GPU, lo que lo hace atractivo para startups o proyectos con recursos ajustados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar que permitan comparar objetivamente su rendimiento con modelos similares.

## Requisitos de hardware

- RAM estimada para inferencia según cuantización: Q2_K ~3.2 GB, Q3_K_M ~4.0 GB, Q4_K_M ~4.8 GB, FP16 ~12.2 GB.
- CPU recomendada: Ryzen 7 / Intel i7 para uso interactivo fluido con Q4_K_M; Ryzen 9 / Intel i9 para máxima velocidad con FP16 o Q4.
- No requiere GPU; funciona exclusivamente en CPU.
- Es viable en equipos de consumo con 8 GB de RAM usando Q2_K o Q3_K_M.
- Opciones de despliegue: Docker (imágenes oficiales), llama.cpp (por formato GGUF), posible integración con Ollama o servidores compatibles con GGUF.
- Latencia y throughput: no disponibles; la model card solo indica "Good interactive" para Q4_K_M en un Ryzen 7 con 16 GB de RAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| JiRack Ultra 7B | 7.6B | no disponible | MIT (etiqueta) / comercial | GGUF, safetensors | Optimizado para CPU, ternario |
| Qwen2.5 7B | 7.6B | 32K (tipico) | Apache 2.0 | safetensors, GGUF | Modelo generalista con buen soporte multilingüe |
| Llama 3.1 8B | 8.0B | 128K | Llama 3.1 Community | safetensors, GGUF | Ampliamente usado, requiere GPU para velocidad |
| DeepSeek R1 7B | 7.6B | no disponible | MIT | safetensors, GGUF | Base sobre la que se construye JiRack |

No se dispone de benchmarks comparativos, por lo que esta tabla refleja solo características declaradas. La principal diferencia de JiRack es su enfoque en CPU y bajo consumo de memoria, a costa de una licencia comercial ambigua.

## Limitaciones y advertencias

- Contradicción de licencia: la etiqueta de HuggingFace indica MIT, pero la model card especifica licencia comercial ($12 por usuario y año, o suscripción mensual de $1-$3). Esta ambigüedad puede generar problemas legales en producción.
- Sin benchmarks públicos: no hay datos objetivos de rendimiento, lo que impide evaluar su calidad frente a alternativas.
- Capacidades multimodales no verificadas: los tokens de visión, sonido y media existen en el tokenizador, pero no hay evidencia de que el modelo haya sido entrenado para procesar estos inputs.
- Riesgo de alucinación y sesgos: no se ha documentado ninguna evaluación de sesgos o de fiabilidad factual.
- Longitud de contexto desconocida: no se especifica, lo que limita su uso en tareas que requieran ventanas largas.
- Dependencia del autor para cuantizaciones personalizadas: el modelo base no incluye QAT ternario completo; el autor ofrece este servicio por separado, lo que sugiere que las cuantizaciones GGUF actuales no aprovechan plenamente la arquitectura ternaria.
- Soporte de tool calling no garantizado: aunque se menciona, no hay demostraciones ni documentación técnica que confirme su funcionamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CMSManhattan/JiRackUltra_7b
- Tokenizador especializado: https://huggingface.co/CMSManhattan/JiRackPrecisionTokenizer
- Cliente de escritorio para Windows (con Ollama API): https://huggingface.co/kgrabko/JiRackTernary_1b/resolve/main/jirack-chat.zip
- Contacto comercial: support@cmsmanhattan.com
