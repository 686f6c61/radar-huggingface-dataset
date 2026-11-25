# minimodels-ai/vision-one

## Resumen

Minimodels Vision One es un modelo multimodal de decisión calibrada desarrollado por minimodels-ai. A diferencia de un modelo conversacional al uso, su propósito es emitir decisiones estructuradas (`choice`, `noul`, `score`) sobre entradas de texto e imagen, con un énfasis explícito en la calibración de la incertidumbre. Se distribuye junto con un runtime offline autocontenido que implementa los endpoints HTTP `/v1/systemone`, `/systemone` y `/health`, pensado para despliegues aislados (`--network none`).

El modelo se apoya en una arquitectura de tipo transformer multimodal con un backbone de lenguaje derivado de la familia Gemma 4, cuantizado online en FP8 W8A8, y un codificador visual nativo en BF16 de 16 bits. Cuenta con 31.273.088.876 parámetros totales según los pesos en safetensors y un tamaño de repositorio de 67,9 GB, que incluye los shards en BF16, el tokenizador, el procesador, los pesos del borrador especulativo y las configuraciones de calibración.

Su relevancia radica en dos innovaciones concretas: un presupuesto de tokens visuales en dos etapas con puerta de incertidumbre (560 tokens por defecto, escalado a 1.120 solo en gráficos analíticos, tablas financieras, documentos y diagramas geométricos cuando el margen es menor o igual a 0,80) y una decodificación especulativa sin pérdida mediante un borrador de bloques paralelos que alcanza entre 130 y 170+ tokens por segundo. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone de lenguaje derivado de Gemma 4 + codificador visual nativo), con decodificacion especulativa por bloques paralelos |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 W8A8 (backbone de lenguaje, cuantizacion online); BF16 16 bits (codificador visual); pesos publicados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards BF16), con pesos del borrador especulativo en `speculator/` |

## Arquitectura y entrenamiento

La información disponible describe el perfil de servicio y no los detalles de entrenamiento. El modelo combina un backbone de lenguaje derivado de Gemma 4, servido con cuantización online FP8 W8A8, con un codificador visual nativo en BF16 de 16 bits. Sobre esa base se añade un borrador especulativo de bloques paralelos (`speculator/`) que permite decodificación especulativa sin pérdida, con caché de prefijos activada y un rendimiento declarado de 130 a 170+ tokens por segundo en una única GPU.

El rasgo técnico más distintivo es la gestión adaptativa de la incertidumbre en dos frentes. En visión, cada petición con imagen arranca con 560 tokens visuales (latencia mediana de aproximadamente 210 a 240 ms) y solo escala a 1.120 tokens cuando el margen de decisión es menor o igual a 0,80 sobre gráficos analíticos, tablas financieras, documentos y diagramas geométricos. En razonamiento, aplica un enrutamiento analítico por esquema y prompt con `max_cot_tokens = 350`, `require_complete_cot = true` y `tau_margin = 0.345`, seguido de una lectura calibrada posterior al razonamiento y una protección estricta de tiempo de reloj por petición de hasta 9,15 s. No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Emisión de decisiones estructuradas sobre texto e imagen en tres modalidades: `choice`, `noul` y `score`.
- Decisión calibrada con incertidumbre explícita, orientada a umbrales de margen y no a generación libre de texto.
- Procesamiento de imágenes en formatos BMP, PNG, JPEG y WEBP, con soporte de orientación EXIF, escala de grises de 16 bits y RGBA transparente compuesto sobre blanco.
- Interpretación de gráficos analíticos, tablas financieras, documentos y diagramas geométricos, con escalado automático del presupuesto visual en casos inciertos.
- Razonamiento encadenado acotado (`max_cot_tokens = 350`) con requisito de cadena completa.
- Servicio mediante API HTTP nativa con endpoints `/v1/systemone`, `/systemone`, `/v1/systemone/decide`, `/v1/decide`, `/decide`, `/v1/models` y `/health`.
- Autenticación opcional mediante Bearer token (`JEV_API_KEY`).
- Perfiles de presupuesto de razonamiento configurables: `capped`, `hosted_20pct`, `hosted_25pct` y `off`.
- Soporte de tool calling, agentes o audio: no disponible en la información proporcionada.

## Casos de uso

- Clasificación documental con umbral de confianza: el modelo recibe una imagen de documento y devuelve una decisión `choice` o `score` junto con su margen, lo que permite derivar automáticamente los casos de baja confianza a revisión humana sin necesidad de lógica externa de calibración.
- Validación de tablas financieras: gracias al escalado a 1.120 tokens visuales cuando el margen es bajo, resulta adecuado para verificar la coherencia de cifras en extractos y estados contables antes de ingerirlos en un pipeline de datos.
- Lectura de gráficos analíticos en informes: el presupuesto visual adaptativo permite extraer decisiones sobre tendencias y valores en gráficos sin pagar el coste de alta resolución en imágenes que no lo requieren.
- Moderación o triaje de contenido visual: la salida `noul` y las puntuaciones calibradas permiten construir un filtro por umbral con trazabilidad del margen de decisión.
- Despliegue en entornos aislados: el contenedor funciona con `--network none` y sin privilegios de root, lo que encaja en infraestructuras reguladas donde no se permite tráfico saliente ni descargas en tiempo de ejecución.
- Enrutamiento de decisiones en sistemas de agentes: el endpoint `/v1/systemone/decide` puede actuar como árbitro calibrado que selecciona entre opciones propuestas por otros componentes, con un límite duro de 9,15 s por petición que acota la latencia del pipeline.
- Verificación geométrica en flujos de diseño o ingeniería: los diagramas geométricos activan la segunda etapa del presupuesto visual, lo que permite comprobar relaciones espaciales o medidas en planos sencillos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento declarados por el autor son de servicio: entre 130 y 170+ tokens por segundo con decodificación especulativa, latencia mediana de 210 a 240 ms para la primera etapa de 560 tokens visuales y un arranque en frío de aproximadamente 45 a 100 s para la captura de grafos CUDA.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 31.273.088.876 parámetros, los pesos en BF16 ocupan aproximadamente 62,5 GB, y el repositorio completo son 67,9 GB; el perfil declarado es de una única GPU con el backbone cuantizado online en FP8 W8A8, lo que reduce el peso del backbone de lenguaje respecto a BF16 pero no se cuantifica en la información disponible.
- GPU recomendadas: no disponible. El perfil de "single-GPU" y el arranque con captura de grafos CUDA sugieren GPUs de centro de datos, pero no se especifican modelos concretos.
- Viabilidad en GPU de consumo: no disponible. El tamaño de pesos en BF16 supera la VRAM de cualquier GPU de consumo actual, por lo que no se puede confirmar su encaje sin datos de cuantización adicionales.
- Opciones de despliegue: runtime propio basado en `vllm==0.34.0`, distribuido como imagen Docker autocontenida; también es posible servirlo con vLLM directamente a partir de los safetensors. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: 130 a 170+ tokens por segundo con decodificación especulativa activa; 210 a 240 ms de latencia mediana en la etapa de 560 tokens visuales; límite duro de 9,15 s por petición; 45 a 100 s de arranque en frío.
- Requisitos de despliegue: funciona sin privilegios de root y con red deshabilitada; requiere esperar a que `GET /health` devuelva `{"ready": true}` antes de enviar tráfico.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos de decisión calibrada multimodal), y no se han publicado benchmarks que permitan situar este modelo frente a alternativas.

## Limitaciones y advertencias

- No es un modelo conversacional general: su interfaz está diseñada para emitir decisiones (`choice`, `noul`, `score`), no para generar texto libre, por lo que no debe evaluarse con criterios de chat.
- Idiomas soportados no documentados: no se puede garantizar el comportamiento en castellano ni en ningún otro idioma distinto del que se haya usado implícitamente en el entrenamiento.
- Longitud de contexto no documentada: no es posible planificar cargas con documentos largos sin una medición previa.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precisión en MMLU, HumanEval, GSM8K ni en tareas de decisión, lo que impide validar las afirmaciones de calibración.
- Riesgo de alucinación no evaluado: aunque el modelo emite márgenes de confianza, no se documenta su fiabilidad fuera de la distribución de entrenamiento.
- Sesgos conocidos: no disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe revisarse `NOTICES.md` para las atribuciones de terceros, incluida la procedencia del backbone derivado de Gemma 4.
- Dependencia de vLLM 0.34.0: el perfil de servicio está fijado a esa versión, lo que puede limitar la portabilidad a otras versiones o backends.
- Repositorio sin tracción pública: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso en producción ni de validación independiente.
- Protección de tiempo por petición de 9,15 s: las peticiones que agoten el presupuesto de razonamiento pueden devolver una decisión degradada o incompleta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minimodels-ai/vision-one
