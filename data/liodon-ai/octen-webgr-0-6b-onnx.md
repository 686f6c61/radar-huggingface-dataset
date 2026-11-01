# liodon-ai/Octen-WebGR-0.6B-ONNX

## Resumen

Octen-WebGR-0.6B-ONNX es la exportación a formato ONNX del modelo Octen/Octen-WebGR-0.6B, publicada por Liodon AI. Se trata de un modelo de generación de texto de tipo decoder-only con aproximadamente 0,6 mil millones de parámetros, orientado a conversación y generación de texto. La relevancia de esta ficha no reside en el modelo base, sino en el paquete de exportación: tres variantes de pesos ONNX (FP32, FP16 e INT8 dinámico) listas para ejecutarse con ONNX Runtime en CPU o GPU, con grafos que exponen entradas y salidas de past-key-value para decodificación autorregresiva con caché KV.

El modelo base pertenece a la familia Qwen3 según las etiquetas del repositorio, aunque la model card no documenta arquitectura, datos de entrenamiento ni capacidades del modelo original. Esta exportación está pensada para desarrolladores que necesitan desplegar el modelo en entornos donde ONNX Runtime es el runtime de referencia (aplicaciones .NET, C++, edge, servidores sin PyTorch) y que valoran la reducción de tamaño que ofrece la cuantización INT8 dinámica: de 4,08 GB en FP32 a 1,02 GB en INT8.

La licencia es "other" y no se detalla en la información disponible; el repositorio no especifica idiomas soportados, contexto máximo ni resultados de evaluación. Cualquier decisión de producción debería partir de la model card del modelo original, que no se ha proporcionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3 según tags; detalle no disponible) |
| Parametros totales | ~0,6 B (según nombre del modelo; cifra exacta no disponible) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP32 (model.onnx), FP16 (model_fp16.onnx), INT8 dinámico weight-only sin calibración (model_quantized.onnx) |
| Idiomas soportados | No disponible |
| Licencia | other (términos no detallados) |
| Formato de pesos | ONNX (exportado con optimum, tarea text-generation-with-past) |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna del modelo base más allá de su pertenencia a la familia Qwen3 y de su naturaleza de modelo causal para generación de texto. No se especifican número de capas, dimensión oculta, cabezas de atención, tipo de atención (completa o lineal), ni si hubo fases de RLHF o DPO. Tampoco se detalla el corpus de entrenamiento, el número de tokens procesados ni la composición del dataset.

Lo que sí está documentado es el proceso de exportación: se usó `optimum.exporters.onnx.main_export` con la tarea `text-generation-with-past`, de modo que el grafo ONNX incluye entradas y salidas de past-key-value para decodificación autorregresiva con caché KV. Se generaron tres artefactos: `model.onnx` (4,08 GB, FP32), `model_fp16.onnx` (2,16 GB, FP16 para execution providers de GPU) y `model_quantized.onnx` (1,02 GB, INT8 dinámico weight-only sin calibración). La cuantización dinámica cuantiza pesos en INT8 y calcula escalas en tiempo de ejecución para las activaciones, lo que reduce el tamaño sin necesidad de un dataset de calibración, a costa de cierta pérdida de precisión no cuantificada en la información disponible.

## Capacidades

- Generación de texto autoregresiva con soporte de caché KV a través de las entradas y salidas `past_key_values.*.key` / `.value` del grafo ONNX.
- Conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Ejecución en ONNX Runtime con distintos execution providers (CPU, y FP16 para GPU).
- Cuantización INT8 dinámica para despliegue con huella de memoria reducida.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión, audio ni modo thinking.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Despliegue en aplicaciones .NET o C++: al estar en ONNX, el modelo se puede cargar con ONNX Runtime desde lenguajes sin ecosistema PyTorch, integrándose en servicios empresariales existentes con el artefacto INT8 de 1,02 GB.
- Inferencia en CPU sin GPU: la variante `model_quantized.onnx` permite servir generación de texto en servidores sin acelerador, usando el `CPUExecutionProvider` y el wrapper `ORTModelForCausalLM` de optimum para gestionar el caché KV.
- Prototipado de chatbots ligeros: con 0,6 B de parámetros y tag `conversational`, es adecuado para asistentes de conversación con requisitos de latencia bajos y presupuesto de memoria limitado, siempre que se valide la calidad del modelo base.
- Servicios edge o embebidos: el tamaño reducido del artefacto INT8 facilita el empaquetado en contenedores pequeños o dispositivos con memoria restringida, aunque el contexto máximo debe confirmarse en el modelo original.
- Evaluación comparativa de runtimes: sirve como banco de pruebas para medir diferencias de latencia y precisión entre FP32, FP16 e INT8 dinámico sobre el mismo grafo ONNX.
- Integración en pipelines de generación de texto por lotes: ONNX Runtime permite control explícito de sesiones y providers, lo que facilita el ajuste de hilos y memoria en cargas batch en CPU.
- Exportación de referencia para otros modelos Qwen3 pequeños: el patrón de exportación con `text-generation-with-past` documentado aquí es reutilizable para modelos de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para los pesos: 4,08 GB en FP32, 2,16 GB en FP16 y 1,02 GB en INT8 dinámico. A esto hay que sumar el caché KV y las activaciones, cuyo tamaño depende del contexto y no está documentado.
- GPU recomendadas: no especificadas por el autor. La variante FP16 está pensada para execution providers de GPU (por ejemplo CUDA o TensorRT de ONNX Runtime), pero no se indican modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí con la variante INT8 o FP16 en tarjetas con 4-8 GB de VRAM, aunque no hay confirmación oficial ni cifras de latencia.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider y providers de GPU), optimum (`ORTModelForCausalLM`), y cualquier stack que consuma grafos ONNX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Octen-WebGR-0.6B-ONNX | ~0,6 B | No disponible | ONNX (FP32/FP16/INT8) | other | Exportación de Liodon AI; sin benchmarks publicados |
| Octen/Octen-WebGR-0.6B | ~0,6 B | No disponible | Pesos originales (formato no disponible) | other | Modelo base; sin datos de evaluación en la información disponible |
| Qwen3 pequeños (familia) | Variable | No disponible | safetensors, GGUF, etc. | según variante | Familia referenciada en los tags; comparación directa no disponible |

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparación cuantitativa fiable con alternativas.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni evaluación de alucinación; no hay garantías de calidad del modelo base.
- La licencia es "other" y sus términos no se detallan: es imprescindible revisar la licencia del modelo original antes de cualquier uso comercial.
- La cuantización INT8 dinámica no usa calibración, por lo que puede degradar la calidad de generación respecto a FP32; no se han publicado métricas de esa degradación.
- El contexto máximo, los idiomas soportados y las capacidades reales (código, matemáticas, tool calling) no están documentados en esta ficha.
- El repositorio tiene 58 descargas y 0 likes en el momento de la consulta: es un artefacto reciente y poco validado por la comunidad.
- El tamaño del repositorio (7,3 GB) incluye las tres variantes; descargar solo el archivo necesario para evitar transferencias innecesarias.
- Al usar ONNX Runtime directamente hay que gestionar manualmente las entradas de past-key-value; se recomienda el wrapper de optimum para evitar errores en la primera pasada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/liodon-ai/Octen-WebGR-0.6B-ONNX
- Modelo base: https://huggingface.co/Octen/Octen-WebGR-0.6B
- Perfil del autor: https://huggingface.co/liodon-ai
- Optimum (herramienta de exportación): https://github.com/huggingface/optimum
