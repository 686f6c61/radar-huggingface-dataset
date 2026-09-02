# simpledirect/Vinci-Prova-7B-1.0-GGUF

## Resumen

Vinci Prova 7B 1.0 GGUF es la versión cuantizada en formato GGUF del modelo de lenguaje de código abierto Vinci Prova 7B 1.0, desarrollado por el laboratorio canadiense SimpleDirect. Esta conversión permite ejecutar el modelo en hardware de consumo mediante motores de inferencia como llama.cpp, Ollama o LM Studio, reduciendo los requisitos de memoria y acelerando la carga en comparación con los pesos originales en safetensors. El modelo base cuenta con 7.248 millones de parámetros y se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial y modificaciones.

La relevancia de esta versión cuantizada radica en su accesibilidad práctica: los desarrolladores pueden desplegar un asistente conversacional local con privacidad por defecto, tal como promueve el propio proyecto Vinci. El repositorio incluye cuatro niveles de cuantización (f16, Q8_0, Q5_K_M y Q4_K_M) con checksums SHA256 para verificar la integridad de las descargas. Los informes técnicos asociados describen el método de entrenamiento "character transfer", aunque el segundo informe señala que no se logró una portabilidad general entre familias de modelos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna del modelo base Vinci Prova 7B 1.0. Dado su tamaño (7B) y su naturaleza conversacional, es probable que emplee una arquitectura transformer decoder estándar, pero este dato no está confirmado en la documentación pública. El repositorio GGUF no reproduce los detalles de entrenamiento; se remite al repositorio principal y al informe técnico número 1, titulado "Vinci Technical Report No. 1: Prova Character Transfer" (CC BY 4.0). Dicho informe describe un método de transferencia de características entre modelos, aunque el contenido técnico completo no está accesible en los materiales proporcionados.

El informe técnico número 2, publicado el 1 de septiembre de 2026, aplicó la misma receta congelada a tres familias de modelos y no logró establecer una portabilidad general entre linajes. Esto sugiere que el método de entrenamiento tiene limitaciones de generalización, pero no se ofrecen detalles sobre los datos de entrenamiento, el número de tokens, ni si se emplearon técnicas como RLHF o DPO.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y el proyecto Vinci se promociona como un asistente de IA directo y honesto.
- Ejecución local y privada: al ser una versión GGUF, puede integrarse en aplicaciones que prioricen la privacidad, manteniendo los datos en el dispositivo del usuario.
- Compatibilidad con herramientas de inferencia estándar: funciona con llama.cpp, Ollama, LM Studio y otros motores que soporten GGUF.
- Sin soporte documentado para tool calling, agentes o visión: no hay evidencia en la información proporcionada de capacidades más allá de la generación de texto.
- Capacidades multilingües: no se especifican los idiomas soportados; se desconoce si el modelo es monolingüe o multilingüe.

## Casos de uso

- Asistente conversacional local: gracias al formato GGUF y a la licencia Apache-2.0, el modelo puede integrarse en aplicaciones de escritorio o móviles que requieran un chatbot sin conexión, con la ventaja de que los datos del usuario permanecen en su dispositivo.
- Prototipado rápido de chatbots: los desarrolladores pueden descargar la cuantización Q4_K_M (la más ligera) para validar flujos conversacionales en entornos de desarrollo con GPUs de gama media, como una RTX 3060 o superior.
- Investigación académica sobre transferencia de características: los informes técnicos publicados por SimpleDirect ofrecen un caso de estudio sobre métodos de "character transfer" entre modelos, útil para investigadores interesados en técnicas de entrenamiento no convencionales.
- Despliegue en entornos con restricciones de hardware: la versión Q4_K_M requiere aproximadamente 4-5 GB de VRAM, lo que permite ejecutarla en GPUs consumer con 6-8 GB, como la RTX 2060 o la GTX 1660 Super.
- Integración en pipelines de generación de texto con baja latencia: al usar cuantización Q8_0 o f16, se puede priorizar la calidad frente a la velocidad en servidores con GPUs más potentes, como A100 o L4.
- Evaluación de la degradación por cuantización: dado que las mediciones oficiales se realizaron sobre pesos no cuantizados, los usuarios pueden comparar el comportamiento de las distintas versiones GGUF para decidir el equilibrio óptimo entre tamaño y fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF indica explícitamente que todas las evaluaciones se realizaron sobre los pesos no cuantizados del repositorio principal y que la cuantización puede alterar el comportamiento del modelo. No se proporcionan cifras de MMLU, HumanEval, GSM8K u otros tests estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: para la cuantización Q4_K_M, se estima un uso de 4,5-5 GB de VRAM; para Q8_0, alrededor de 7-8 GB; para f16, aproximadamente 14-15 GB (cálculo orientativo basado en el tamaño del modelo y la cuantización, no en datos oficiales).
- GPUs recomendadas: para Q4_K_M, una GPU con 6 GB de VRAM (p. ej., RTX 2060, GTX 1660 Super) es suficiente; para Q8_0, se recomienda al menos 8 GB (RTX 3070, RTX 4060 Ti); para f16, se necesitan 16 GB o más (RTX 4080, A100, etc.).
- Compatibilidad con hardware consumer: sí, las versiones Q4_K_M y Q5_K_M caben en GPUs de gama media actuales.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (a través de backend llama.cpp) y cualquier motor compatible con GGUF. También puede servirse mediante API con herramientas como llama-cpp-python o FastAPI.
- Latencia y throughput: no se dispone de mediciones oficiales. En una RTX 4090, un modelo 7B cuantizado a Q4_K_M suele generar entre 30 y 60 tokens por segundo, pero estos valores son orientativos y dependen de la implementación y la longitud de contexto.

## Comparativa con modelos similares

No se dispone de una comparativa oficial con otros modelos. Dado que el modelo base se desarrolló sobre la base de Qwen 3.5 (según el post de LinkedIn), podría compararse con modelos de la familia Qwen de tamaño similar, así como con Mistral 7B o Llama 2 7B. Sin embargo, al no haber benchmarks publicados ni especificaciones detalladas, no es posible establecer una comparación rigurosa. Se recomienda consultar el repositorio principal del modelo para futuras actualizaciones.

## Limitaciones y advertencias

- La cuantización altera el comportamiento del modelo; las mediciones oficiales se realizaron sobre pesos no cuantizados y no se garantiza que los resultados se mantengan en las versiones GGUF.
- El informe técnico número 2 indica que el método de "character transfer" no demostró portabilidad general entre familias de modelos, lo que sugiere que el enfoque de entrenamiento puede tener limitaciones para generalizar a otras arquitecturas.
- No se ha publicado información sobre sesgos, alucinaciones o riesgos específicos del modelo. Se recomienda realizar una evaluación propia antes de usarlo en producción.
- No se especifican los idiomas soportados; es posible que el modelo tenga un rendimiento desigual en lenguas distintas de las dominantes en su entrenamiento.
- Aunque la licencia Apache-2.0 permite uso comercial, es necesario revisar la documentación del repositorio principal para conocer posibles restricciones adicionales o atribuciones requeridas.
- El repositorio GGUF no incluye el modelo base en sí; es una conversión. Para auditorías o fine-tuning, se debe recurrir al repositorio original en safetensors.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/simpledirect/Vinci-Prova-7B-1.0-GGUF
- Repositorio HuggingFace del modelo base: https://huggingface.co/simpledirect/Vinci-Prova-7B-1.0
- Sitio web del proyecto Vinci: https://vinci.getsimpledirect.com/
- GitHub de SimpleDirect: https://github.com/getsimpledirect
- Informe técnico número 1 (Prova Character Transfer): https://www.getsimpledirect.com/research/papers/prova-character-transfer
- Informe técnico número 2 (Character Transfer Across Three Model Families): https://www.getsimpledirect.com/research/papers/character-transfer-across-three-model-families
- Post de LinkedIn sobre el lanzamiento: https://www.linkedin.com/posts/simpledirect_vinci-research-has-released-vinci-prova-7b-activity-7492908237537841152-12WI
