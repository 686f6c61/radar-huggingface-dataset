# jmloperaa2830/tomi-qwen2-1.5b-rkllm

## Resumen

`jmloperaa2830/tomi-qwen2-1.5b-rkllm` es una conversión del modelo base Qwen2-1.5B de Alibaba al formato propietario `.rkllm` de Rockchip, con cuantización W8A8 (pesos y activaciones a 8 bits) y plantilla de chat ChatML. La conversión se ha realizado con `rkllm-toolkit` para ejecutarse en la NPU del SoC RK3588 mediante el runtime RKLLM. El repositorio contiene un único artefacto, `model.rkllm` (aproximadamente 1,9 GB), dentro de un repo de 2,0 GB.

El modelo resuelve un problema muy concreto: permitir inferencia de un LLM de 1,5 mil millones de parámetros en placas SBC con RK3588 (Radxa Rock 5B, Orange Pi 5, Firefly y similares) sin GPU dedicada, usando la NPU integrada en lugar de la CPU. Según la model card, lo consume el servicio `tomi_ai_llm` del dispositivo TOMi 8, que lo descarga automáticamente al instalar el paquete `tomi_model_qwen2_1_5b`.

Es relevante como ejemplo de distribución de LLM empaquetado para hardware de borde: formato binario listo para el runtime del fabricante, licencia Apache 2.0 heredada del modelo original y un caso de uso de producto final (asistente local en dispositivo). Conviene señalar que parte del modelo base `Qwen/Qwen2-1.5B` (preentrenado, no la variante Instruct), por lo que la plantilla ChatML se aplica sobre pesos sin ajuste por instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2); artefacto convertido y cuantizado con `rkllm-toolkit` |
| Parametros totales | 1,5 mil millones (nominal, segun el modelo base Qwen2-1.5B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2-1.5B declara 32 768 tokens en su configuracion original; no confirmado para esta conversion) |
| Tipos de cuantizacion | W8A8 (pesos y activaciones a int8) |
| Idiomas soportados | es, en (etiquetas del repo); el modelo base Qwen2 se entreno con datos en 29 idiomas, incluidos ingles y chino |
| Licencia | Apache 2.0 (misma que el modelo base; se distribuye "sin garantias") |
| Formato de pesos | `.rkllm` (binario para el runtime RKLLM); el modelo base original esta en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2-1.5B: un transformer decoder-only con atención completa, normalización RMSNorm, activación SwiGLU y sesgos QKV, tal como se describe en la documentación de la familia Qwen2. Esta ficha no aporta datos nuevos de entrenamiento: la conversión no reentrena ni ajusta los pesos, solo los transforma al formato RKLLM y los cuantiza a W8A8 (int8 en pesos y activaciones) para su ejecución en la NPU.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base; la documentación de Qwen2 sí indica que la familia se entrenó con datos en 27 idiomas adicionales además de inglés y chino. La innovación técnica de este artefacto no está en el modelo, sino en el pipeline de despliegue: conversión con `rkllm-toolkit`, plantilla ChatML embebida y ejecución sobre la NPU del RK3588 a través del runtime RKLLM, lo que evita depender de la CPU del SoC.

## Capacidades

- Generación de texto autoregresiva en español e inglés, con la calidad propia de un modelo de 1,5 B de parámetros.
- Conversación multi-turno mediante plantilla ChatML, siempre que el runtime y el cliente gestionen correctamente el historial y la plantilla.
- Capacidad multilingüe limitada: las etiquetas del repo declaran es y en; el modelo base cubre 29 idiomas, pero no hay evaluación de esta conversión en otros idiomas.
- Ejecución de inferencia en la NPU del RK3588 mediante el runtime RKLLM, sin GPU ni aceleradores externos.
- Integración en un servicio local de dispositivo (`tomi_ai_llm`) con descarga del artefacto como parte de un paquete de instalación.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, modo thinking, agentes multi-paso, visión, audio ni razonamiento extendido; al tratarse de pesos del modelo base (no Instruct), la adherencia a instrucciones complejas es previsiblemente débil.

## Casos de uso

- Asistente conversacional local en el dispositivo TOMi 8: el artefacto se descarga con el paquete `tomi_model_qwen2_1_5b` y el servicio `tomi_ai_llm` lo sirve desde la NPU, de modo que el usuario obtiene respuestas sin enviar datos a la nube.
- Chatbot offline en placas RK3588 (Rock 5B, Orange Pi 5, Firefly): al ocupar aproximadamente 1,9 GB en disco y ejecutarse en la NPU, cabe en configuraciones de 8 GB de RAM y permite asistentes sin conectividad.
- Clasificación de intenciones y extracción de entidades en domótica local: con prompts cortos y plantilla ChatML, el modelo puede etiquetar comandos de voz o texto antes de enviarlos a un actuador, manteniendo la latencia dentro del dispositivo.
- Preprocesado y resumen de notas breves en aplicaciones de campo (inventario, incidencias, partes de trabajo) donde no hay red y el texto debe permanecer en el equipo.
- Base para prototipos de producto en hardware de borde: permite validar la experiencia de usuario de un asistente embebido antes de invertir en modelos mayores o en infraestructura GPU.
- Educación y robótica: servir de motor de diálogo en kits didácticos basados en RK3588, con la ventaja de que el binario está empaquetado y no requiere compilar el runtime.
- Filtrado y etiquetado de texto en pipelines de ingestión en el borde: por ejemplo, descartar o marcar registros antes de subirlos a un servidor central, reduciendo ancho de banda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversión no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se aportan datos de latencia o throughput en la NPU del RK3588 para este artefacto concreto.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en la NPU del RK3588, no en GPU. El artefacto pesa aproximadamente 1,9 GB y se carga en la memoria del sistema (LPDDR del SoC, compartida con CPU y NPU).
- GPU recomendadas: ninguna. Este artefacto no es ejecutable en A100, H100 ni RTX 4090 sin reconvertir los pesos originales de Qwen2-1.5B a otro formato.
- Hardware objetivo: SoC Rockchip RK3588 (y familia RK3588S) con NPU integrada; se recomienda al menos 8 GB de RAM en la placa para dejar margen a la caché KV y al resto del sistema.
- Cabe en hardware de consumo tipo SBC: sí, es precisamente su propósito; no cabe en microcontroladores ni en placas sin NPU Rockchip compatible con RKLLM.
- Opciones de despliegue: runtime RKLLM de Rockchip sobre el propio SoC; conversión previa con `rkllm-toolkit`; integración mediante el servicio `tomi_ai_llm`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que no leen el formato `.rkllm`.
- Latencia y throughput: no disponible en la información proporcionada. Depende del modelo de placa, de la versión del runtime RKLLM y de la longitud de contexto solicitada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jmloperaa2830/tomi-qwen2-1.5b-rkllm` (esta ficha) | 1,5 B | no disponible | `.rkllm`, W8A8 | Apache 2.0 | Repo con 0 descargas y 0 likes; orientado al servicio `tomi_ai_llm` |
| `FydeOS/Qwen2-1_5B_rkLLM` | 1,8 B segun su model card | no disponible | `.rkllm` | no disponible en la informacion | Conversión para RKLLM de la serie Qwen2 de Alibaba |
| `Pelochus/qwen2-1_5B-rk3588` | 1,5 B | no disponible | `.rkllm` (runtime 1.0.1) | no disponible en la informacion | Conversión para NPU del RK3588, mantenida con actualizaciones desde junio de 2024 |
| `Qwen/Qwen2-1.5B` (original) | 1,5 B | 32 768 tokens segun la configuracion de Qwen2 (no verificado en esta busqueda) | safetensors | Apache 2.0 | Modelo base oficial en Hugging Face; ejecutable en GPU/CPU con frameworks convencionales |
| `qwen2:1.5b` en Ollama | 1,5 B | no disponible | GGUF | Apache 2.0 (heredada) | Paquete listo para Ollama en CPU/GPU convencionales |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión del modelo base Qwen2-1.5B, no de la variante Instruct: aunque se aplica plantilla ChatML, los pesos no están ajustados por instrucciones, por lo que el seguimiento de instrucciones y el formato de respuesta pueden degradarse frente a `Qwen2-1.5B-Instruct`.
- Riesgo alto de alucinación y de errores en razonamiento aritmético y generación de código, coherente con un modelo de 1,5 B de parámetros.
- La cuantización W8A8 introduce una pérdida de precisión adicional respecto a los pesos originales en fp16/bf16; no se han publicado evaluaciones de esa degradación para este artefacto.
- El formato `.rkllm` es cerrado y específico del runtime RKLLM: no es portable a GPU, vLLM, llama.cpp ni Ollama. Reutilizar el modelo fuera del RK3588 exige partir de los pesos originales.
- Cobertura idiomática declarada únicamente es/en; el rendimiento real en español no está evaluado y el modelo base está optimizado para inglés y chino.
- No hay información sobre alineación de seguridad, filtros de contenido ni evaluación de sesgos en esta conversión; se heredan los del modelo base, no documentados aquí.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero exige conservar el aviso de copyright y la licencia, y se distribuye "sin garantías". Cualquier uso en producto debe verificar también los términos del modelo base de Alibaba.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado ni evaluación independiente: es un artefacto de un solo autor, sin validación externa conocida.
- La fecha de creación del repo (2026-10-27) y la ausencia de métricas hacen recomendable validar el comportamiento en el hardware concreto antes de cualquier despliegue en producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/jmloperaa2830/tomi-qwen2-1.5b-rkllm
- Modelo base: https://huggingface.co/Qwen/Qwen2-1.5B
- Conversión alternativa para RKLLM (FydeOS): https://huggingface.co/FydeOS/Qwen2-1_5B_rkLLM?library=rkllm
- Conversión alternativa para RK3588 (Pelochus): https://huggingface.co/Pelochus/qwen2-1_5B-rk3588
- Repositorio de la familia Qwen2 en GitHub: https://github.com/QuantumEclipseAI/Qwen2
- Ficha de Qwen2 1.5B en Ollama: https://ollama.com/library/qwen2:1.5b
- Ficha de Qwen2-1.5B-Instruct en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2-1.5B-Instruct/summary

Herramientas citadas en la model card para las que no se ha encontrado enlace en la búsqueda: `rkllm-toolkit`, runtime RKLLM, servicio `tomi_ai_llm` y paquete `tomi_model_qwen2_1_5b`.
