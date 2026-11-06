# krishnakrish/Qwen3.5-4B-3D-Coder-q4f16_1-MLC

## Resumen

Esta ficha describe la build cuantizada `Qwen3.5-4B-3D-Coder-q4f16_1-MLC`, publicada por el usuario krishnakrish en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión del modelo base `ccore/Qwen3.5-4B-3D-Coder` al formato MLC (Machine Learning Compilation) con la cuantización `q4f16_1`, pensada para ejecutarse en el navegador mediante WebLLM y WebGPU. El objetivo declarado es la generación de escenas 3D con Three.js sin necesidad de ida y vuelta al servidor.

El modelo base pertenece a la familia Qwen3.5, con 4.000 millones de parámetros según el nombre, y está especializado en código orientado a 3D. La build emplea la plantilla de conversación `qwen3` y una ventana de contexto configurada en 8192 tokens. El repositorio se encuentra en estado de andamiaje ("scaffolding"): según la propia model card, los pesos están pendientes de una compilación en Colab, por lo que la disponibilidad real de los artefactos no está garantizada en el momento de la consulta.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de despliegue edge en navegador con WebGPU, una vía cada vez más viable para aplicaciones interactivas. Por otro, sirve de advertencia: el repositorio tiene cero descargas y cero likes, y su propio autor lo marca como incompleto, por lo que no debe considerarse listo para producción sin verificar la integridad de los ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tipo `qwen3` en MLC); detalles internos no disponibles |
| Parametros totales | 4B (según denominación del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (configurada en `gen_config --context-window-size 8192`) |
| Tipos de cuantizacion | q4f16_1 (pesos de 4 bits, activaciones en fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLC (params_shard_*.bin, tensor-cache.json), WebGPU WASM (~7 MB) y Metal dylib opcional |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su pertenencia a la familia Qwen3.5 y del identificador `qwen3` usado por MLC para la conversión. Se trata, por tanto, de un transformer decodificador de 4B parámetros, pero no se especifican número de capas, dimensión oculta, cabezas de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa.

Respecto al entrenamiento, el autor indica explícitamente que la build es "solo cuantización; no se añaden datos de entrenamiento adicionales". No hay información sobre el volumen de tokens, la composición del dataset, ni si el modelo base empleó RLHF, DPO u otras técnicas de alineación. El proceso de construcción documentado es puramente de conversión y compilación: `mlc_llm convert_weight --quantization q4f16_1 --model-type qwen3`, seguido de `gen_config` con ventana de 8192 y plantilla `qwen3`, y finalmente `compile --target webgpu`.

## Capacidades

- Generación de texto y código, con especialización declarada en la generación de escenas 3D para Three.js.
- Inferencia en navegador mediante WebLLM y WebGPU, sin servidor intermedio.
- Conversación multi-turno gracias a la plantilla `qwen3` y a la ventana de 8192 tokens.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Generación de escenas Three.js en el navegador: el modelo puede producir código de escena 3D directamente en el cliente, eliminando la latencia de red y permitiendo previsualizaciones interactivas sin backend.
- Editores 3D web con asistente integrado: al ejecutarse en WebGPU, el modelo puede sugerir transformaciones, materiales o luces sobre la escena activa sin enviar datos del usuario a un servidor.
- Prototipado de demos de código 3D offline: la build permite distribuir una aplicación estática que funciona sin conexión una vez cargados los pesos (~4 GB), útil para talleres y formación.
- Herramientas educativas de programación gráfica: el modelo puede explicar y generar fragmentos de Three.js en un entorno controlado y sin dependencias de infraestructura.
- Aplicaciones de privacidad estricta: al no requerir round-trip, el código y las escenas del usuario permanecen en el navegador, lo que encaja en contextos con requisitos de confidencialidad.
- Integración en pipelines de generación de contenido 3D: el modelo puede servir como primer paso para producir borradores de escena que luego se refinan con herramientas deterministas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no se especifica; el tamaño de los shards es de aproximadamente 4 GB en q4f16_1, lo que da una cota inferior orientativa para memoria.
- GPU recomendadas: no disponible. La build está orientada a WebGPU, por lo que requiere un navegador con soporte WebGPU (Chrome/Edge recientes) y una GPU compatible.
- ¿Cabe en GPU consumer? Probablemente sí en términos de memoria (4 GB de pesos), pero la viabilidad depende del soporte WebGPU del navegador y del backend gráfico; no hay datos confirmados.
- Opciones de despliegue: WebLLM (navegador), MLC LLM; se incluye un binario Metal opcional para macOS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (código 3D en navegador) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Estado incompleto: la model card indica "scaffolding — weights pending Colab build", por lo que los pesos pueden no estar subidos o no ser funcionales.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- Sin benchmarks: no hay datos que permitan evaluar calidad, sesgos o alucinación.
- Idiomas no declarados: no se puede garantizar un comportamiento correcto en castellano u otros idiomas.
- Dependencia de WebGPU: la inferencia requiere un navegador y una GPU compatibles; no funcionará en entornos sin WebGPU.
- Licencia Apache-2.0: permite uso comercial, pero al ser una cuantización de un modelo de terceros conviene verificar la licencia y condiciones del modelo base `ccore/Qwen3.5-4B-3D-Coder`.
- Riesgo de alucinación en código 3D: sin datos de evaluación, no se puede descartar la generación de APIs inexistentes de Three.js.
- Tamaño de descarga elevado (~4 GB) para un modelo de 4B, lo que limita su uso en conexiones lentas o dispositivos móviles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/krishnakrish/Qwen3.5-4B-3D-Coder-q4f16_1-MLC
- Modelo base: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- WebLLM: https://github.com/mlc-ai/web-llm
- Aplicación triforge: no disponible (enlace no incluido en la información)
- Paper, blog o demo adicionales: no disponibles
