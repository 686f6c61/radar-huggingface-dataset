# mlc-ai/LFM3-1.7B-q8f16_1-MLC

## Resumen

LFM3-1.7B-q8f16_1-MLC es una conversión al formato MLC (`q8f16_1`) del modelo LiquidAI/LFM3-1.7B desarrollado por Liquid AI, publicada por el equipo de mlc-ai. No se trata de un modelo nuevo, sino de un artefacto de despliegue empaquetado para su ejecución con MLC LLM y WebLLM, lo que permite ejecutar el modelo en navegador mediante WebGPU o en dispositivos con soporte para dicha pila de inferencia.

El modelo base es un transformer de 1.700 millones de parámetros, con una ventana de contexto configurada en 262.144 tokens y fragmentos de prefill de 256 tokens. La conversión está pensada para inferencia local y en el cliente: la model card recomienda un contexto de 4.096 tokens cuando se usa con WebLLM, dado que ventanas mayores incrementan el consumo de memoria y degradan la latencia en navegador.

Su relevancia radica en que demuestra el patrón de distribución de modelos pequeños en formato MLC para despliegue sin servidor y en cliente, con cuantización de 8 bits en pesos y 16 bits en activaciones. La licencia del modelo base es la LFM Open License v1.0, que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM3-1.7B); empaquetado para MLC LLM |
| Parametros totales | 1.700 millones (1,7 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 tokens en la configuracion compilada; 4.096 tokens recomendados en WebLLM |
| Tipos de cuantizacion | q8f16_1 (pesos 8 bits, activaciones 16 bits); otras cuantizaciones no disponibles en este repo |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | MLC (artefacto compilado para MLC LLM / WebLLM); tamano del repo 1,9 GB |

## Arquitectura y entrenamiento

El artefacto corresponde a una conversión del checkpoint LiquidAI/LFM3-1.7B fijado a la revisión `1da06bec6a819da10b54c67e5c90972b46d81871`. La conversión se realizó con `mlc_llm convert_weight` usando la cuantización `q8f16_1` y la configuración se generó con `mlc_llm gen_config`, plantilla de conversación `lfm3`, ventana de contexto de 262.144 tokens y tamaño de fragmento de prefill de 256 tokens. El resultado es un conjunto de pesos y metadatos optimizados para el runtime de MLC LLM, no un modelo reentrenado.

No se dispone en la información proporcionada de detalles sobre la arquitectura interna del modelo base (tipo exacto de atención, capas, cabezas), el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card del artefacto se limita a documentar el proceso de conversión y los requisitos de ejecución (WebGPU con soporte de `shader-f16`). Los detalles de procedencia del compilador WebGPU se registran en `mlc-build-info.json`.

## Capacidades

- Generación de texto autoregresiva, tarea declarada en el pipeline (`text-generation`).
- Conversación multi-turno mediante la plantilla `lfm3` incluida en la configuración generada.
- Procesamiento de contextos largos: la configuración compilada admite hasta 262.144 tokens, aunque el uso práctico en WebLLM se recomienda limitar a 4.096.
- Ejecución en navegador vía WebLLM y WebGPU, con requisito de `shader-f16`.
- Ejecución local mediante el runtime de MLC LLM en CPU/GPU compatibles.
- Tool calling, function calling, modo thinking, visión, audio y capacidades de agente: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Inferencia en navegador sin backend: el artefacto está compilado para WebLLM, de modo que una aplicación web puede cargar el modelo y generar texto en el cliente con WebGPU, sin enviar datos a un servidor. Adecuado para asistentes embebidos en páginas estáticas.
- Prototipado de aplicaciones LLM offline: con 1,9 GB de artefacto y cuantización de 8 bits, el modelo se puede distribuir junto a una aplicación de escritorio basada en MLC LLM para entornos sin conectividad.
- Chat de asistencia con contexto moderado: usando la ventana recomendada de 4.096 tokens en WebLLM, encaja en escenarios de preguntas y respuestas sobre documentación o formularios.
- Procesamiento de documentos largos en local: la configuración admite 262.144 tokens con prefill por fragmentos de 256, útil en despliegues MLC nativos donde la memoria lo permita.
- Demos interactivas y evaluaciones comparativas: al ser un artefacto reproducible con comandos de conversión documentados, sirve para comparar el rendimiento de LFM3-1.7B frente a otras alternativas en el mismo runtime.
- Educación y experimentación: permite estudiar el flujo completo de conversión HF a MLC y el despliegue WebGPU con un modelo pequeño y de licencia abierta con condiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,9 GB en cuantización `q8f16_1`; se requiere al menos esa cantidad de memoria más overhead del runtime y de la caché KV, que crece con la longitud de contexto.
- GPU recomendadas: no disponibles en la información proporcionada. En navegador se requiere WebGPU con soporte de `shader-f16`.
- GPU de consumo: no se especifican modelos concretos; el tamaño de 1,7 B en 8 bits sugiere que puede ejecutarse en GPUs de consumo modernas con soporte WebGPU, pero no hay confirmación en la información disponible.
- Opciones de despliegue: MLC LLM (runtime nativo) y WebLLM (navegador). vLLM, llama.cpp, Ollama y TGI no son compatibles con este formato de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-q8f16_1-MLC | 1,7 B | 262.144 (4.096 recomendado en WebLLM) | MLC | LFM Open License v1.0 | Artefacto de despliegue para MLC LLM/WebLLM |
| LiquidAI/LFM3-1.7B | 1,7 B | no disponible | safetensors (formato HF) | LFM Open License v1.0 | Modelo base original |
| Otras alternativas de ~1-2 B en formato MLC | no disponible | no disponible | MLC | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Es un artefacto de conversión, no un modelo entrenado por mlc-ai; el comportamiento depende íntegramente de LiquidAI/LFM3-1.7B.
- La licencia LFM Open License v1.0 impone condiciones específicas; es obligatorio revisar el archivo LICENSE antes de cualquier uso comercial.
- El contexto compilado de 262.144 tokens no implica que la calidad se mantenga a esa longitud; la model card recomienda 4.096 tokens en WebLLM.
- Requiere WebGPU con `shader-f16` en navegador; sin ese soporte, el artefacto no es utilizable en WebLLM.
- No hay información sobre sesgos, tasas de alucinación ni cobertura idiomática del modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- No es compatible con runtimes distintos de MLC LLM/WebLLM; no se puede cargar directamente en vLLM, llama.cpp u Ollama.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlc-ai/LFM3-1.7B-q8f16_1-MLC
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Revisión fijada del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/tree/1da06bec6a819da10b54c67e5c90972b46d81871
- Licencia LFM Open License v1.0: https://huggingface.co/mlc-ai/LFM3-1.7B-q8f16_1-MLC/blob/main/LICENSE
- Metadatos de compilación: `mlc-build-info.json` en el repositorio
