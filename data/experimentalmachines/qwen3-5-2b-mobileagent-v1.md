# experimentalmachines/Qwen3.5-2B-MobileAgent-v1

## Resumen

Qwen3.5-2B-MobileAgent-v1 es un ajuste fino (fine-tuning) del modelo multimodal Qwen/Qwen3.5-2B desarrollado por experimentalmachines, orientado a la automatizacion de interfaces moviles Android mediante agentes que operan a partir de capturas de pantalla. El modelo recibe una captura de pantalla y un objetivo en lenguaje natural, y emite una unica accion siguiente en formato JSON compacto (clic, scroll, entrada de texto, apertura de app, etc.), con coordenadas normalizadas en una rejilla 0-1000.

Se trata de un modelo de comparacion, no de la linea principal del proyecto: emplea exactamente la misma receta y el mismo conjunto de datos que LFM3-VL-2B-MobileAgent-v1 para aislar el efecto del modelo base. El ajuste se realizo mediante LoRA SFT (rank 64, alpha 128) sobre el modelo de lenguaje, con la torre de vision congelada, y posteriormente se fusionaron los pesos. El resultado es un modelo de 2.213.241.664 parametros (aproximadamente 2,2 mil millones) con licencia Apache-2.0.

Su relevancia radica en que demuestra que un modelo de ~2B parametros puede ejecutar tareas de agente GUI movil con una precision de paso alta (0,734 en AndroidControl high-level) y un rendimiento en AndroidWorld (16 tareas resueltas de 116) comparable a alternativas del mismo segmento. Es un modelo de investigacion, en ingles y sin memoria mas alla de los 8 ultimos pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5-2B; fine-tuning LoRA SFT fusionado |
| Parametros totales | 2.213.241.664 (~2,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (historial de 8 pasos en texto; una captura por paso, ~720 tokens de imagen) |
| Tipos de cuantizacion | 4-bit GGUF disponible (repositorio separado) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF 4-bit en repositorio aparte |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer multimodal con torre de vision y modelo de lenguaje. El ajuste se aplica unicamente al modelo de lenguaje mediante LoRA SFT con rank 64 y alpha 128, manteniendo congelada la torre de vision; los adaptadores se fusionan en los pesos finales (el adaptador original queda en `lora_adapter/`). El entrenamiento consistio en 1.250 pasos con batches de 32 filas y una tasa de aprendizaje de 2e-4.

Los datos provienen del dataset MobileAgent-SFT-v1, con 99.216 filas derivadas de AndroidControl. Cada ejemplo contiene una captura de pantalla redimensionada a un maximo de 880 x 880 px de area (unos 720 tokens de imagen), un objetivo en texto, el historial de los 8 pasos anteriores (o `None`) y la accion siguiente como salida. El formato de salida combina un bloque `<think>` con la intencion breve seguido de un unico JSON de accion. La decodificacion recomendada es thinking activado y temperatura 0. No se menciona uso de RLHF o DPO en la informacion disponible.

## Capacidades

- Generacion de acciones de agente GUI movil en formato JSON compacto a partir de capturas de pantalla.
- Soporte de acciones: `click`, `long_press`, `input_text`, `scroll` (direcciones up/down/left/right), `open_app`, `navigate_back`, `navigate_home`, `keyboard_enter`, `wait`, `answer` y `status` (complete/infeasible).
- Coordenadas normalizadas a una rejilla 0-1000 sobre la captura.
- Razonamiento breve mediante modo thinking (`<think>intencion</think>` antes de la accion).
- Comprension de imagen (screenshot) + texto (objetivo e historial).
- Respuesta a preguntas sobre la pantalla mediante la accion `answer`.
- Capacidad multilingue limitada al ingles.
- No soporta tool calling generico ni function calling fuera del esquema de acciones definido; no hay soporte de audio.

## Casos de uso

- Automatizacion de pruebas de UI en Android: el modelo puede generar secuencias de acciones a partir de capturas para validar flujos de aplicaciones en pipelines de QA, usando temperatura 0 para reproducibilidad.
- Agente de navegacion movil en investigacion: sirve como baseline para comparar modelos base bajo una receta identica, gracias a que comparte datos y metodo con LFM3-VL-2B-MobileAgent-v1.
- Asistencia a usuarios con discapacidad motriz: el modelo traduce un objetivo en lenguaje natural a una accion concreta sobre la pantalla, con la posibilidad de responder preguntas sobre el contenido visible (`answer`).
- Extraccion de informacion de pantallas: mediante la accion `answer`, puede responder preguntas sobre lo que muestra la captura, util para tareas de lectura de interfaces.
- Despliegue en dispositivos con recursos limitados: al ser un modelo de ~2,2B con variante GGUF 4-bit, puede ejecutarse en hardware modesto para prototipos de agentes locales.
- Investigacion sobre agentes GUI de bajo coste: permite estudiar el efecto del modelo base (Qwen3.5-2B frente a LFM3-VL-2B) manteniendo constante la receta de entrenamiento.
- Generacion de datos sinteticos de interaccion: las salidas JSON estructuradas pueden usarse para aumentar datasets de entrenamiento de agentes moviles.

## Benchmarks y rendimiento

| Benchmark | Qwen3.5-2B v1 | LFM3-VL-2B v1 |
|---|---|---|
| AndroidWorld seed 30 (116 tareas, development) | 16 | 15 |
| AndroidControl test, precision de paso high-level | 0,734 | 0,715 |
| AndroidControl test, precision de paso low-level | 0,949 | 0,948 |
| Terminal `complete` accuracy | 0,784 | 0,792 |
| MMStar | 57,3% | 57,1% |
| MMLU | 53,7% | 49,5% |
| Apple M5 GPU, mediana de segundos por paso | 4,20 | 2,66 |

Segun la model card, con los mismos datos y receta ambos modelos base quedan muy proximos; LFM3 es aproximadamente 1,6x mas rapido por paso en el Mac.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con ~2,2B parametros, en fp16 requiere en torno a 4,5-5 GB y en 4-bit GGUF en torno a 1,5-2 GB (estimacion orientativa, no publicada por el autor).
- GPU recomendadas: no disponible; el autor reporta mediciones en GPU Apple M5 (4,20 s por paso de mediana).
- Cabe en GPU de consumo: previsiblemente si, dada la variante GGUF 4-bit y el tamano de ~2,2B; no se especifican modelos concretos.
- Opciones de despliegue: transformers (libreria declarada); variante GGUF 4-bit disponible para motores compatibles con GGUF (no se detalla cual).
- Latencia y throughput: mediana de 4,20 s por paso en Apple M5 GPU; no hay datos de throughput en otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AndroidWorld (seed 30) | AndroidControl high/low | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-2B-MobileAgent-v1 | ~2,2B | no disponible | 16/116 | 0,734 / 0,949 | apache-2.0 | Hugging Face (6 descargas) |
| LFM3-VL-2B-MobileAgent-v1 | no disponible | no disponible | 15/116 | 0,715 / 0,948 | no disponible | Hugging Face |
| LFM3-VL-2B-MobileAgent-v4 | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo principal del proyecto) |

## Limitaciones y advertencias

- Modelo de investigacion: no debe operar de forma desatendida en un telefono con cuentas reales, mensajes o pagos.
- Solo acepta objetivos en ingles; no hay soporte multilingue.
- Una unica captura por paso y sin memoria mas alla de los 8 pasos de historial en texto.
- Entrenado unicamente con demostraciones grabadas; nunca ha interactuado con un telefono real durante el entrenamiento.
- Riesgo de alucinacion en la interpretacion de la pantalla y en la generacion de acciones no validas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache-2.0 heredada de Qwen/Qwen3.5-2B; permite uso comercial segun los terminos de dicha licencia, pero el autor no garantiza idoneidad para produccion.
- Es un modelo de comparacion, no la linea principal del proyecto; puede no recibir mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/Qwen3.5-2B-MobileAgent-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante GGUF 4-bit: https://huggingface.co/experimentalmachines/Qwen3.5-2B-MobileAgent-v1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/experimentalmachines/MobileAgent-SFT-v1
- Modelo principal del proyecto: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentacion de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
