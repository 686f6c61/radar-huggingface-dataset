# mradermacher/MiniCPM5-2B-Base-GGUF

## Resumen

MiniCPM5-2B-Base es un modelo de lenguaje denso de 2.000 millones de parámetros desarrollado por OpenBMB, el segundo de la serie MiniCPM5 tras MiniCPM5-1B. Está diseñado específicamente para despliegue en dispositivos locales, escenarios on-device y entornos con recursos limitados, donde busca ofrecer el mejor rendimiento de su clase entre los modelos abiertos de 2B. La arquitectura es un Transformer denso, sin mezcla de expertos (MoE). La versión aquí descrita es una cuantización GGUF estática creada por mradermacher a partir del modelo base original. No se proporcionan datos sobre la longitud de contexto, idiomas soportados ni licencia en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso |
| Parametros totales | 2.000 millones (2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (en el repo de mradermacher); el repo original de OpenBMB no especifica formato |

## Arquitectura y entrenamiento

El modelo es un Transformer denso de 2B que escala la misma receta de entrenamiento utilizada en MiniCPM5-1B. OpenBMB lo presenta como una opción para despliegue local y escenarios con recursos limitados, alcanzando lo que describen como el estado del arte en su categoría de modelos abiertos de 2B. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Al tratarse de un modelo base, se espera que requiera fine-tuning posterior para tareas específicas.

## Capacidades

- Modelo base sin alineación por instrucciones documentada, por lo que no se garantiza soporte de tool calling, agentes o razonamiento multi-paso sin entrenamiento adicional.
- No se especifican capacidades de visión, audio ni multimodales en la información proporcionada.
- El propósito declarado es la generación de lenguaje en entornos con recursos limitados, pero no se detallan tareas concretas.
- Al ser un modelo denso de 2B, su principal ventaja es el bajo coste de inferencia en hardware modesto, aunque no se aportan datos de calidad de generación.

## Casos de uso

- Asistentes locales en dispositivos móviles: el modelo puede ejecutarse en smartphones o tablets gracias a su tamaño reducido, permitiendo respuestas offline sin depender de la nube.
- Aplicaciones de edge computing: integrable en sistemas embebidos o gateways con presupuesto de memoria ajustado, donde un modelo de 2B ofrece un equilibrio razonable entre capacidad y consumo.
- Fine-tuning para tareas específicas: al ser un modelo base, puede adaptarse mediante fine-tuning a dominios concretos como clasificación de texto, extracción de información o resumen.
- Chatbots de soporte en intranets: desplegado en servidores internos con GPUs modestas, permite gestionar consultas de documentación corporativa sin enviar datos a servicios externos.
- Herramientas de productividad offline: integración en editores de texto o suites ofimáticas para autocompletado o corrección gramatical sin conexión.
- Prototipado rápido en investigación: por su tamaño, es adecuado para experimentos de eficiencia, cuantización o destilación en laboratorios con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 2B en FP16 requiere aproximadamente 4 GB; con cuantización Q4_K_S, la ocupación se reduce a unos 1,5-2 GB; en Q8_0, alrededor de 2,5 GB. Estas cifras son estimaciones basadas en el tamaño de parámetros y no incluyen la memoria del runtime.
- GPU recomendadas: tarjetas de consumo como RTX 3060 (12 GB) o superiores son suficientes; incluso una RTX 3050 (8 GB) puede ejecutar las cuantizaciones más agresivas.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en la mayoría de tarjetas de consumo actuales, especialmente en cuantizaciones Q4 o Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otras herramientas compatibles con GGUF. Para el modelo base en formato safetensors, podrían usarse vLLM o TGI, aunque no se especifica en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos comparables ni resultados que permitan establecer una comparación fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: al tratarse de un modelo base sin alineación, la generación puede ser incoherente o factualmente incorrecta si no se somete a fine-tuning.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están especificados, lo que impide conocer los límites reales de uso.
- Restricciones de licencia: la licencia no está indicada, por lo que no se puede confirmar si el uso comercial está permitido.
- Caveat para producción: la ausencia de benchmarks publicados y de documentación de entrenamiento hace arriesgado su uso directo en sistemas críticos sin una evaluación previa propia.

## Enlaces

- Repositorio GGUF de mradermacher: https://huggingface.co/mradermacher/MiniCPM5-2B-Base-GGUF
- Modelo base de OpenBMB: https://huggingface.co/openbmb/MiniCPM5-2B-Base
