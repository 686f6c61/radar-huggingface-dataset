# FamilyOrang/Kimi-K3.1-Pro

## Resumen
Kimi K3.1 Pro es un modelo de lenguaje multimodal nativo y de caracter agentico, publicado como pesos abiertos por el laboratorio chino Moonshot AI. Se presenta como el primer miembro de la serie K3.1 y como el modelo mas capaz de la clase 3T del laboratorio, con 2,8 billones de parametros totales en una arquitectura Mixture-of-Experts (MoE) que activa 104B por token. El repositorio analizado aqui, `FamilyOrang/Kimi-K3.1-Pro`, es un espejo de terceros (no oficial) del modelo original de Moonshot.

El modelo se post-entrena a partir de Kimi K3 mediante aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios, y esta orientado a tareas de codigo, creacion 3D, investigacion financiera, precision factual y flujos agenticos. Su ventana de contexto alcanza el millon de tokens, lo que lo situa en la liga de los modelos de contexto ultralargo.

La relevancia actual radica en que combina pesos abiertos (aunque bajo licencia propia), multimodalidad nativa (entrada de imagen y texto) y capacidad agentica con tool calling, en un momento en que los modelos de frontera cerrados dominan el segmento de 3T. No obstante, su despliegue practico es extremadamente costoso: el repositorio ocupa 1.561,4 GB en safetensors y no cabe en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer con atencion hibrida KDA + Gated DSA |
| Parametros totales | 2,8 billones (2.780.110.363.392 segun safetensors) |
| Parametros activos | 104B por token |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | 8-bit (tag `8-bit`, `compressed-tensors`); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | `kimi-k3.1-pro` (licencia propia, `license: other`) |
| Formato de pesos | safetensors (con `compressed-tensors`), libreria transformers |

## Arquitectura y entrenamiento
Kimi K3.1 Pro emplea una arquitectura MoE de 93 capas (1 capa densa) con 896 expertos, de los cuales se seleccionan 16 por token, mas 2 expertos compartidos. La dimension oculta de atencion es 7168 con 96 cabezas de atencion, y la dimension latente del MoE es 3584 con 3072 por experto. El vocabulario es de 160K tokens.

La innovacion mas destacable es la composicion de capas de atencion: 69 capas KDA (Kimi Delta Attention, una variante de atencion lineal) combinadas con 24 capas Gated DSA (DeepSeek Sparse Attention) con top-K de 2048 y 32 cabezas de indice de dimension 128. Esta mezcla permite manejar contextos de 1M tokens con coste subcuadratico en la mayoria de capas. El entrenamiento parte de Kimi K3 y aplica RL conjunto a gran escala en cientos de dominios; no se especifican en la informacion disponible el numero de tokens de preentrenamiento ni la composicion exacta del dataset.

## Capacidades
- Generacion de texto y razonamiento de proposito general.
- Codigo: mejoras sustanciales declaradas en tareas de programacion.
- Creacion 3D: capacidad destacada por el autor.
- Investigacion financiera y precision factual.
- Multimodalidad nativa: pipeline `image-text-to-text` (entrada de imagen y texto).
- Tool calling / function calling para integracion en agentes.
- Razonamiento multi-paso y flujos agenticos.
- Contexto ultralargo de 1M tokens para documentos y repositorios completos.
- Capacidades multilingues: no disponible el detalle de idiomas.

## Casos de uso
- Analisis de repositorios completos: con 1M tokens de contexto puede ingerir un monorepo entero y responder preguntas de arquitectura o refactorizacion sin chunking.
- Agentes de codigo autonomos: el soporte de tool calling y razonamiento multi-paso permite integrarlo en pipelines de CI/CD para generar parches, ejecutar tests y corregir errores de forma iterativa.
- Investigacion financiera asistida: su enfoque en precision factual y dominios financieros lo hace adecuado para extraer y sintetizar datos de informes anuales y filings extensos.
- Generacion de activos 3D: para prototipado de escenas o modelos 3D a partir de descripciones textuales o imagenes de referencia.
- Atencion al cliente con contexto largo: gestion de conversaciones multi-turno con historial extenso e imagenes adjuntas (capturas, facturas) gracias a la ventana de 1M tokens y la entrada multimodal.
- Revision documental legal o cientifica: procesamiento de contratos o papers de cientos de paginas con preguntas de seguimiento y trazabilidad de citas.
- Asistentes de escritorio multimodales: interpretacion de capturas de pantalla combinada con texto para automatizar tareas de UI.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: el repositorio pesa 1.561,4 GB en safetensors; en 8-bit se requiere del orden de 2,8 TB de memoria agregada, y en BF16 aproximadamente 5,6 TB. No es desplegable en una sola GPU.
- GPU recomendadas: despliegue multi-nodo con H100 (80 GB) o H200/B200; se necesitarian decenas de aceleradores para alojar los pesos completos.
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090, 3090, etc.).
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados en la informacion disponible. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro (este) | 2,8T | 104B | 1M | kimi-k3.1-pro (other) | Pesos abiertos (espejo de terceros) |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Base del post-entrenamiento |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias
- El repositorio `FamilyOrang/Kimi-K3.1-Pro` es un espejo de terceros con 0 descargas y 0 likes; no es la publicacion oficial de Moonshot AI y su integridad no esta verificada.
- Licencia propia `kimi-k3.1-pro` (`license: other`): es imprescindible revisar los terminos antes de cualquier uso comercial; no es una licencia open source estandar.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado en dominios financieros y factuales donde el autor declara mejoras pero no aporta benchmarks publicos.
- Idiomas soportados no documentados; el rendimiento en castellano no esta garantizado.
- Requisitos de hardware prohibitivos (multi-nodo, ~2,8 TB en 8-bit) que limitan el uso a infraestructuras de gran escala.
- No hay datos publicados de benchmarks, sesgos ni evaluaciones de seguridad en la informacion disponible.
- El tag `custom_code` implica que la carga requiere `trust_remote_code=True`, con el riesgo de seguridad asociado.

## Enlaces
- Repositorio Hugging Face (espejo): https://huggingface.co/FamilyOrang/Kimi-K3.1-Pro
- Repositorio oficial de Moonshot AI: https://huggingface.co/moonshotai
- Modelo oficial (referencia de licencia): https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
- Blog tecnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Quickstart de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Chat: https://www.kimi.ai
- Web de Moonshot AI: https://www.moonshot.ai
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
