# konstbet/Hy-MT2-1.8B-ONNX

## Resumen

Hy-MT2-1.8B-ONNX es una conversión a formato ONNX del modelo de traducción tencent/Hy-MT2-1.8B, publicada por el usuario konstbet y optimizada para ejecutarse en el navegador mediante Transformers.js sobre WebGPU. El modelo original lo desarrolla Tencent y pertenece a la familia Hunyuan (arquitectura `HunYuanDenseV1ForCausalLM`), con 1.800 millones de parámetros y orientación específica a traducción automática multilingüe.

El problema que resuelve esta build concreta es el despliegue de un traductor neuronal de calidad en entornos sin servidor GPU dedicado: al estar cuantizado a 4 bits (q4f16) y empaquetado como ONNX con operadores fusionados para WebGPU, puede ejecutarse íntegramente en el cliente (navegador) sin infraestructura de inferencia propia. Esto resulta relevante para aplicaciones web que necesitan traducción privada, de baja latencia y sin coste de servidor.

El repositorio ocupa 1,1 GB e incluye los pesos cuantizados, la configuración con metadatos específicos de Transformers.js (`transformers.js_config`, `kv_cache_dtype`) y soporte para 36 idiomas, entre ellos el castellano, el chino, el inglés y una cobertura amplia de lenguas de Asia oriental y meridional. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (HunYuanDenseV1ForCausalLM) |
| Parametros totales | 1.800 millones (1.8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 / q4f16 (4 bits, block_size=32, escalas float16); operador MatMulNBits con accuracy_level=4 |
| Idiomas soportados | 36: zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (con external data en un único chunk); pesos originales del base model presumiblemente en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de tipo decoder-only de 1.800 millones de parámetros, identificado en el ecosistema de ONNX Runtime GenAI como `HunYuanDenseV1ForCausalLM`. La conversión utiliza el model builder de `onnxruntime-genai` 0.17.1, que da soporte nativo a esa clase de modelo. Los operadores fusionados incluidos son `GroupQueryAttention`, `RotaryEmbedding`, `SimplifiedLayerNormalization`/`SkipSimplifiedLayerNormalization`, `MatMulNBits` (4 bits) y `GatherBlockQuantized` para el embedding de tokens, con escalas en float16.

Un detalle técnico relevante es el ajuste de la dimensión simbólica `kv_cache_dim` en las entradas `past_key_values.*` y salidas `present.*` a la dimensión estática de cabeza (128), lo que permite a Transformers.js construir la caché KV vacía en la primera pasada de decodificación. El `config.json` incorpora `transformers.js_config` con `use_external_data_format` y `kv_cache_dtype` en float16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones de decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Traducción automática multilingüe entre 36 idiomas, incluyendo castellano, chino, inglés, francés, portugués, japonés, ruso, árabe, coreano, hindi y una amplia lista de lenguas asiáticas y europeas.
- Generación de texto condicionada por instrucciones en formato de chat (mensajes con roles `user`/`assistant`), tal como muestra el ejemplo de uso de la model card.
- Traducción con instrucciones de estilo ("Translate the following text into Chinese..."), lo que permite controlar el formato de salida.
- Ejecución en navegador mediante Transformers.js sobre WebGPU, con cuantización q4f16.
- Inferencia determinista mediante `do_sample: false` y control de longitud con `max_new_tokens`.
- Soporte de caché KV (float16) para decodificación incremental.

No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.

## Casos de uso

- Traducción en el navegador sin servidor: la build ONNX con WebGPU permite traducir texto directamente en el cliente, evitando enviar contenido sensible a un backend y eliminando costes de infraestructura de inferencia.
- Extensiones y widgets de traducción web: al integrarse con Transformers.js, puede empaquetarse en una extensión de navegador o en un componente web que traduzca páginas o selecciones en tiempo real.
- Aplicaciones de escritorio Electron o Tauri: el formato ONNX y la licencia Apache-2.0 facilitan su inclusión en aplicaciones de escritorio que necesiten traducción offline entre los 36 idiomas soportados.
- Privacidad en documentos: traducción local de contratos, correos o notas clínicas donde el contenido no puede salir del dispositivo del usuario; el modelo de 1,8B cuantizado a 4 bits mantiene un tamaño manejable (repo de 1,1 GB).
- Traducción multilingüe de soporte al cliente: para empresas con clientes en chino, árabe, hindi, tailandés o vietnamita, el modelo cubre pares de idiomas poco habituales en modelos pequeños.
- Prototipado rápido de pipelines de traducción: al cargarse con `pipeline("text-generation", ...)` de Transformers.js, sirve para validar flujos de traducción en demos y pruebas de concepto sin montar un servidor de inferencia.
- Traducción en entornos con conectividad limitada: una vez descargado el modelo, la inferencia es local, útil en aplicaciones de campo o kioscos sin acceso a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 1,1 GB, por lo que la huella de pesos en memoria ronda ese orden de magnitud en cuantización de 4 bits, más la caché KV en float16 y el overhead del runtime.
- GPU recomendadas: no se especifican en la información disponible. Al estar orientado a WebGPU, el requisito es un navegador con soporte WebGPU (Chrome/Edge recientes, Safari en versiones compatibles).
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de 1,8B en 4 bits, aunque no se aportan cifras oficiales de VRAM mínima ni de modelos concretos de GPU.
- Opciones de despliegue: Transformers.js con WebGPU (soporte documentado); ONNX Runtime GenAI como herramienta de construcción. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para esta build concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Hy-MT2-1.8B-ONNX (esta ficha) | 1,8B | no disponible | 36 | Apache-2.0 | ONNX q4f16, WebGPU / Transformers.js |
| tencent/Hy-MT2-1.8B (base) | 1,8B | no disponible | 36 | Apache-2.0 | Pesos originales (safetensors presumiblemente) |
| Otros traductores pequenos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que el rendimiento real en calidad de traducción no está verificado de forma independiente en esta ficha.
- La cuantización a 4 bits (q4f16) puede degradar la calidad de traducción respecto al modelo base en fp16/bf16; no se documenta la magnitud de esa pérdida.
- La longitud de contexto no está especificada; textos largos pueden truncarse o degradar la calidad sin que se conozca el límite exacto.
- El modelo está orientado a traducción; su uso como generador de texto general o para razonamiento no está validado.
- No se documentan capacidades de tool calling, agentes ni multimodalidad.
- Riesgo de alucinación y de traducciones incorrectas en pares de idiomas de bajos recursos (por ejemplo, bo, ug, mn, km, my), sin datos de evaluación disponibles.
- La build está pensada para WebGPU; en navegadores o dispositivos sin soporte WebGPU el rendimiento puede ser inviable o no funcionar.
- Aunque la licencia Apache-2.0 permite uso comercial, conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales de Tencent antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/konstbet/Hy-MT2-1.8B-ONNX
- Modelo base: https://huggingface.co/tencent/Hy-MT2-1.8B
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- ONNX Runtime GenAI: https://github.com/microsoft/onnxruntime-genai
