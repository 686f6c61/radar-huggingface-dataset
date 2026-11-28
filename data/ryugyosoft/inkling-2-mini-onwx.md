# ryugyosoft/Inkling-2-Mini-onwx

## Resumen

Inkling-2-Mini-onwx es una conversión del modelo de lenguaje Inkling 2 Mini, desarrollado por Thinking Machines, empaquetada específicamente para onwx, una aplicación de inferencia que ejecuta modelos de lenguaje sobre la NPU XDNA2 de los procesadores AMD Ryzen AI. El modelo original es un Mixture of Experts (MoE) de 26 000 millones de parámetros totales con 128 expertos, de los que se activan 8 por token, y una arquitectura con estructura de bucle que repite 12 capas intermedias tres veces, lo que implica que cada token atraviesa 48 capas de cálculo efectivo.

La relevancia de esta ficha reside en que no se trata de un modelo nuevo entrenado desde cero, sino de una adaptación de despliegue: el repositorio contiene pesos convertidos a un formato int4 propietario que la NPU puede leer, junto con los pesos densos que permanecen en CPU y un motor de ejecución híbrido NPU/CPU. El resultado es la posibilidad de ejecutar un MoE de 26B en un ordenador personal con Ryzen AI Max+ 395 a velocidades de generación de aproximadamente 12 tok/s en Windows y 14 tok/s en Linux, con un consumo de memoria que puede reducirse hasta unos 9 GB mediante streaming de expertos desde SSD.

El modelo base está disponible bajo licencia Apache-2.0, soporta los idiomas japonés e inglés, y ofrece una ventana de contexto de hasta 65 536 tokens, además de modo de razonamiento configurable y llamada a herramientas. Esta conversión concreta está pensada para el ecosistema onwx 1.5.0 o superior y no es directamente utilizable fuera de él.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con estructura de bucle (12 capas intermedias repetidas 3 veces; 48 capas efectivas por token) |
| Parametros totales | 26 000 millones (26B) |
| Parametros activos | 8 de 128 expertos por token (el número exacto de parámetros activos no está disponible) |
| Longitud de contexto | 65 536 tokens |
| Tipos de cuantizacion | Expertos en int4 (bloques de 128 con escala y mínimo, tras rotación de Hadamard de 128 dimensiones); proyecciones de atención en Q8 en CPU; proyecciones densas int4 para precarga de prompt en NPU; caché KV en fp32 |
| Idiomas soportados | Japonés (ja), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Binarios propietarios de onwx (`experts/E*.bin`, `dense/D*.bin`, `cpu.bin`, `cpu.json`, `kv.json`, `engine.json`, `xdna.json`), no safetensors ni GGUF estándar |

## Arquitectura y entrenamiento

El modelo base Inkling 2 Mini es un Mixture of Experts con 128 expertos por capa y activación de 8 expertos por token. Su rasgo arquitectónico más distintivo es la estructura de bucle: las 12 capas centrales se ejecutan tres veces, de modo que un token recorre 48 capas de cómputo efectivo aunque el número de capas únicas sea menor. Esta repetición favorece la reutilización de expertos entre iteraciones del bucle, algo que la conversión a onwx aprovecha para el streaming desde SSD.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. Respecto a la conversión, el autor documenta que los pesos originales de los expertos están en NVFP4 con escalas fp8 cada 16 elementos, y que se transformaron a int4 con escalas y mínimos cada 128 elementos tras aplicar una rotación de Hadamard de 128 dimensiones. La fidelidad de esta conversión se midió con una divergencia KL de 0,018 respecto a la distribución de salida original, una coincidencia del 94,7 % en el token más probable y un incremento de NLL de 0,004 en texto. Las proyecciones de atención se mantienen en Q8 sobre CPU, formato que el autor describe como libre de error de cuantización, y la caché KV se conserva en fp32 porque el modelo resultó sensible al redondeo a fp16.

## Capacidades

- Generación de texto conversacional en japonés e inglés.
- Modo de razonamiento (thinking mode) con profundidad configurable entre `none` y `high`.
- Llamada a herramientas (tool calling / function calling).
- Razonamiento multi-paso dentro de una misma conversación.
- Ventana de contexto de hasta 65 536 tokens, adecuada para documentos largos y diálogos extensos.
- Ejecución híbrida NPU/CPU con aceleración de los expertos en la NPU XDNA2 y control, atención y router en CPU.
- Streaming de expertos desde SSD para equipos con memoria limitada.
- Servidor compatible con la API de OpenAI en `http://127.0.0.1:8100/v1`.
- No soporta entrada de imágenes según la model card.

## Casos de uso

- Asistente conversacional local en japonés e inglés: el modelo puede mantener diálogos multi-turno gracias a su contexto de 65 536 tokens y ejecutarse íntegramente en un portátil o mini-PC con Ryzen AI, sin depender de la nube.
- Automatización de atención al cliente en entornos con requisitos de privacidad: al ejecutarse en local y ofrecer una API compatible con OpenAI, se integra en backends existentes sin enviar datos a terceros.
- Generación y revisión de código con tool calling: el modelo puede invocar funciones externas y encadenar pasos, lo que permite integrarlo en asistentes de desarrollo que consultan documentación o ejecutan comandos.
- Procesamiento de documentos largos en japonés: con 65 536 tokens de contexto puede resumir contratos, informes o transcripciones extensas en una sola pasada.
- Razonamiento con profundidad ajustable: el modo `none` a `high` permite equilibrar latencia y calidad según la tarea, desde respuestas rápidas hasta análisis complejos.
- Despliegue en equipos con memoria limitada: mediante el streaming de expertos desde SSD, el modelo puede funcionar con tan solo 9 GB de memoria total, lo que lo hace viable en configuraciones de gama media con NPU XDNA2.
- Prototipado de agentes locales: la combinación de tool calling, contexto largo y API local facilita construir agentes que operan sobre el sistema de archivos o servicios internos sin coste de inferencia por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente proporciona métricas de rendimiento de inferencia medidas en un Ryzen AI Max+ 395 con onwx 1.5.0:

| Metrica | Windows | Linux |
|---|---|---|
| Generación de texto | ~12 tok/s | ~14 tok/s |
| Precarga de prompt (1 000 tokens) | ~11 s | no disponible |
| Precarga de prompt (4 000 tokens) | ~48 s | no disponible |
| Generación con expertos en SSD (6 GB) | ~9 tok/s | no disponible |

## Requisitos de hardware

- NPU AMD XDNA2 (Ryzen AI 300 / 400 series y Ryzen AI Max+ 395). La NPU es obligatoria para el funcionamiento previsto de esta conversión.
- CPU con soporte AVX2 como mínimo; se aprovecha AVX-512 si está disponible.
- Memoria: aproximadamente 17 GB si todos los pesos residen en RAM; unos 13 GB con 8 GB de expertos en SSD; unos 11 GB con 6 GB en SSD; unos 9 GB con 4 GB en SSD.
- Almacenamiento: 15,2 GB para la descarga del repositorio.
- Aplicación onwx 1.5.0 o superior, que incluye el programa NPU necesario.
- No se documenta compatibilidad con GPU dedicadas (A100, H100, RTX 4090) ni con backends como vLLM, llama.cpp, Ollama o TGI; esta conversión está ligada al runtime onwx.
- Latencia de precarga de prompt elevada: unos 11 s por cada 1 000 tokens, lo que condiciona casos de uso con prompts muy largos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible. A modo de contexto estructural:

| Modelo | Parametros | Contexto | Licencia | Plataforma |
|---|---|---|---|---|
| Inkling-2-Mini-onwx | 26B MoE (8/128 activos) | 65 536 | Apache-2.0 | NPU AMD XDNA2 + CPU (onwx) |
| Inkling 2 Mini (original) | 26B MoE (8/128 activos) | no disponible en la informacion | Apache-2.0 | GPU/servidor (formato original) |
| Inkling-2-Mini-GGUF (Unsloth) | 26B MoE (8/128 activos) | no disponible en la informacion | Apache-2.0 | CPU/GPU con llama.cpp y derivados |

## Limitaciones y advertencias

- Solo soporta japonés e inglés; no se documenta calidad en castellano ni en otros idiomas.
- No procesa imágenes.
- Dependencia total del runtime onwx 1.5.0 o superior y de hardware AMD con NPU XDNA2; no es portable a otros backends sin reconversión.
- La precarga de prompt es lenta (~11 s por 1 000 tokens), lo que penaliza aplicaciones con contextos largos o muchas llamadas con prompts extensos.
- El streaming de expertos desde SSD reduce la velocidad de generación a ~9 tok/s y depende de la latencia y el ancho de banda del almacenamiento.
- La cuantización int4 introduce una divergencia medible respecto al modelo original (KL 0,018, coincidencia del 94,7 % en el token más probable, NLL +0,004), aceptable según el autor pero no nula.
- No se han publicado evaluaciones de sesgos, alucinación ni robustez para este modelo ni para su conversión.
- Aunque la licencia es Apache-2.0 y permite uso comercial, el modelo base no incluye garantías y su comportamiento en producción no está validado por evaluaciones independientes.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ryugyosoft/Inkling-2-Mini-onwx
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de Unsloth utilizado para la conversión: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Aplicación onwx: https://huggingface.co/ryugyosoft/onwx
