# Atomic-Germ/MiniCPM-V-4.6-NPU2

## Resumen

MiniCPM-V-4.6-NPU2 es una conversión cuantizada del modelo multimodal MiniCPM-V-4.6, realizada por Atomic-Germ, para su ejecución acelerada por hardware en las NPU AMD Ryzen AI con arquitectura XDNA2. El modelo original, desarrollado por OpenBMB, es un VLM (vision-language model) compacto que combina un backbone de lenguaje Qwen3.5 de 0.8B con inyección de embeddings de visión. Esta versión concreta utiliza el formato Q4NX, un empaquetado propietario de FastFlowLM, que reordena la cuantización Q4_1 para adaptarse a las matrices de la NPU.

El resultado es un modelo de aproximadamente 548 millones de parámetros con una ventana de contexto de 262 144 tokens, capaz de procesar texto e imágenes. Su relevancia radica en que permite ejecutar un VLM multimodal en portátiles con procesadores Ryzen AI 300 (Strix Point) sin necesidad de GPU dedicada, aprovechando la NPU integrada. El repositorio incluye un instalador (`flm-add`) que registra el modelo en el motor FastFlowLM, simplificando su despliegue en sistemas Linux con la pila XRT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastFlowLM (Q4NX) sobre backbone Qwen3.5 (VLM con inyeccion de vision) |
| Parametros totales | 548 266 416 (0,55 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | Q4NX (reordenamiento de Q4_1 para NPU) |
| Idiomas soportados | en (ingles) |
| Licencia | other (no especificada) |
| Formato de pesos | Q4NX (formato propietario de FastFlowLM, no GGUF) |

## Arquitectura y entrenamiento

El modelo es una conversión cuantizada del MiniCPM-V-4.6 original, cuyo backbone de lenguaje es Qwen3.5 con 0.8B parámetros, 24 capas, tamaño oculto de 1024 y vocabulario de 248 094 tokens. Según la documentación de vLLM, MiniCPM-V-4.6 utiliza inyección de embeddings para la parte visual, en lugar de M-RoPE espacial: todos los tokens (texto y placeholders de imagen) reciben posiciones secuenciales idénticas duplicadas en los tres canales M-RoPE esperados por el backbone Qwen3.5.

No se dispone de información sobre el entrenamiento del modelo original (datos, número de tokens, técnicas de alineación como RLHF o DPO) en la documentación proporcionada. Esta versión Q4NX no modifica los pesos más allá de la cuantización y el reordenamiento para la NPU; el proceso de conversión lo realizó Atomic-Germ a partir del archivo GGUF de OpenBMB.

## Capacidades

- Generación de texto conversacional y multimodal: procesa entradas de texto e imágenes, devolviendo respuestas en lenguaje natural.
- Ventana de contexto larga: 262 144 tokens, adecuada para documentos extensos o conversaciones multi-turno con historial amplio.
- Inferencia acelerada por NPU: diseñado específicamente para ejecutarse en AMD Ryzen AI XDNA2, con baja latencia de prefill (7,58 ms en la prueba documentada).
- Integración con FastFlowLM: se registra como modelo `minicpm-4.6:0.8b` en el motor, permitiendo su uso mediante la CLI `flm run`.
- No se documentan capacidades explícitas de tool calling, function calling o agentes en la información disponible.

## Casos de uso

- Asistente local en portátiles con Ryzen AI: al ejecutarse en la NPU, puede ofrecer respuestas a preguntas sobre imágenes o texto sin conexión a internet, con consumo energético reducido frente a una GPU.
- Análisis de documentos largos con imágenes: su contexto de 262 144 tokens permite procesar manuales, informes o contratos extensos que incluyan figuras o capturas, extrayendo información relevante.
- Chat multimodal en entornos con privacidad estricta: al ser un modelo local, los datos no salen del dispositivo, útil en sectores como salud o legal donde la confidencialidad es crítica.
- Prototipado rápido de aplicaciones VLM en hardware edge: desarrolladores pueden integrar el modelo en aplicaciones Python o CLI usando FastFlowLM, sin necesidad de infraestructura en la nube.
- Educación y demostraciones técnicas: sirve para enseñar conceptos de VLM y cuantización en talleres, dado su tamaño reducido y facilidad de instalación con `flm-add`.
- Automatización de tareas de transcripción o descripción de imágenes en equipos sin GPU: por ejemplo, generar alt-text para archivos de imágenes en lote desde un portátil con Ryzen AI 300.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye un "GhostWriter Influence Test", un benchmark arbitrario y repetible, ejecutado en un AMD Ryzen AI 340 Framework 13:

| Metrica | Valor |
|---|---|
| Prompt tokens | 9 210 |
| Completion tokens | 631 |
| Total tokens | 9 841 |
| Active KV tokens | 9 841 |
| Max KV token capacity | 32 768 |
| KV token occupancy | 30,03 % |
| Load duration | 0,000000842 s |
| Prefill duration (TTFT) | 7,58 ms |
| Decoding duration | 21,44 ms |
| Prefill speed | 1 214,89 tokens/s |
| Decoding speed | 29,44 tokens/s |

Estos datos son específicos de la configuración probada y no deben extrapolarse a otros entornos.

## Requisitos de hardware

- Procesador: AMD Ryzen AI con arquitectura XDNA2 (NPU2), es decir, serie Ryzen AI 300 (Strix Point) o posterior.
- Memoria: aproximadamente 8 GB de memoria unificada del sistema (pesos Q4NX + activaciones + caché KV).
- Sistema operativo: Linux con la pila XRT NPU instalada.
- Almacenamiento: el archivo `model.q4nx` ocupa 1,03 GB; el repositorio completo pesa 10,9 GB.
- Despliegue: exclusivamente mediante el motor FastFlowLM (CLI `flm`), con el instalador `flm-add` para registrar el modelo.
- No es compatible con llama.cpp, Ollama ni otras herramientas que esperan GGUF, ya que Q4NX es un formato propietario.
- No requiere GPU dedicada; la inferencia se realiza en la NPU integrada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo base, MiniCPM-V-4.6, está disponible en formato GGUF (openbmb/MiniCPM-V-4.6-gguf) para ejecución en CPU/GPU mediante llama.cpp, pero esta versión Q4NX es específica para NPU y no es directamente comparable en rendimiento. Otros VLM pequeños como Phi-3.5-vision o LLaVA-1.6 podrían considerarse alternativas, pero no se han proporcionado métricas para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Licencia "other": no se especifican los términos exactos; es necesario revisar la licencia del modelo original de OpenBMB antes de un uso comercial.
- Idioma: solo se declara soporte para inglés; el rendimiento en otros idiomas no está garantizado.
- Hardware restringido: solo funciona en AMD Ryzen AI XDNA2 con Linux y la pila XRT; no es portable a otras arquitecturas.
- Formato propietario: Q4NX no es interoperable con el ecosistema GGUF; limita el uso a FastFlowLM.
- Tamaño reducido: con 0,55B parámetros, la calidad de razonamiento complejo o generación de código puede ser inferior a modelos más grandes.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inconsistente, especialmente en tareas multimodales.
- Sin benchmarks estándar: no hay evidencia de rendimiento en tareas académicas como MMLU o HumanEval en la documentación disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Atomic-Germ/MiniCPM-V-4.6-NPU2
- Modelo base (GGUF): https://huggingface.co/openbmb/MiniCPM-V-4.6-gguf
- Motor FastFlowLM: https://fastflowlm.com
- Repositorio oficial de MiniCPM-V (OpenBMB): https://github.com/OpenBMB/MiniCPM-V
- Documentación de vLLM para MiniCPM-V-4.6: https://docs.vllm.ai/en/latest/api/vllm/model_executor/models/minicpmv4_6/
