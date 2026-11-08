# mradermacher/LFM3-1.7B-Base-GGUF

## Resumen

LFM3-1.7B-Base-GGUF es la versión cuantizada en formato GGUF del modelo base LiquidAI/LFM3-1.7B-Base, publicada por el usuario mradermacher. El modelo original lo desarrolla Liquid AI y forma parte de la familia LFM3, construida sobre una arquitectura denominada "tri-hybrid" por el propio fabricante. Con 1.728.801.600 parámetros totales (aproximadamente 1,7 mil millones), está pensado para ejecución local en dispositivos de borde y para aplicaciones especializadas donde el coste de inferencia y la latencia importan más que la capacidad bruta de razonamiento.

Esta publicación concreta no es un modelo nuevo, sino un conjunto de cuantizaciones estáticas (Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0 y f16) generadas a partir de los pesos originales en safetensors. Su relevancia práctica radica en que permite ejecutar el modelo con llama.cpp y herramientas compatibles en hardware de consumo, reduciendo el peso de los ficheros desde los 3,6 GB del formato f16 hasta los 0,9 GB de la cuantización Q2_K.

El modelo es de tipo base, es decir, no ha pasado por un ajuste conversacional o de instrucciones en esta variante, aunque la familia LFM3 incluye variantes orientadas a agentes locales con ventana de contexto de 256K y tool calling nativo. La licencia es lfm1.0, propia de Liquid AI, por lo que conviene revisar sus términos antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer "tri-hybrid" (familia LFM3, según documentación de Liquid AI) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens (según la documentación de LFM3-1.7B; no confirmado para la variante Base) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible indica que LFM3 se basa en una arquitectura "tri-hybrid" según la documentación oficial de Liquid AI, aunque no se detalla en la model card proporcionada la composición exacta de esa hibridación (posible combinación de atención, capas recurrentes o SSM). El recuento real de parámetros en safetensors es de 1.728.801.600, coherente con la denominación comercial de 1,7B. El repositorio incluye la etiqueta `custom_code`, lo que implica que la carga del modelo requiere código específico del fabricante más allá de `transformers` estándar.

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones técnicas concretas más allá de la mención a la arquitectura tri-hybrid y, en la variante orientada a agentes, el soporte de tool calling nativo y una ventana de contexto de 256K. Esta publicación de mradermacher es una conversión estática sin cuantizaciones ponderadas ni imatrix, según indica el propio autor.

## Capacidades

- Generación de texto autoregresiva en 16 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Modelo base: no incluye ajuste de instrucciones ni formato conversacional en esta variante, por lo que su uso directo requiere prompting cuidadoso o fine-tuning posterior.
- Capacidad de contexto largo: la documentación de la familia LFM3-1.7B cita 256K tokens, lo que habilita tareas de resumen y recuperación sobre documentos extensos (no confirmado explícitamente para la variante Base).
- Soporte de tool calling nativo según la documentación de Liquid AI para LFM3-1.7B (orientado a agentes locales).
- Ejecución en dispositivos de borde: el tamaño reducido y las cuantizaciones disponibles permiten inferencia en CPU y GPU de gama baja.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito ("thinking mode") en la información disponible.

## Casos de uso

- Fine-tuning especializado: al ser un modelo base, es un punto de partida adecuado para ajuste supervisado en dominios concretos (legal, médico, atención al cliente) con coste de entrenamiento bajo gracias a sus 1,7B parámetros.
- Asistentes locales en dispositivos de borde: con cuantizaciones Q4_K_M de 1,2 GB, puede desplegarse en portátiles, mini-PC y dispositivos con 4-8 GB de RAM para tareas de generación de texto sin conexión.
- Procesamiento de documentos largos: la ventana de 256K de la familia LFM3 permite resumir contratos, informes o expedientes completos en una sola pasada, siempre que se valide el comportamiento real en la variante Base.
- Generación de texto multilingüe: cobertura de 16 idiomas útil para pipelines de traducción, normalización o generación de contenido en mercados con varios idiomas.
- Componente de agentes locales: la documentación de LFM3-1.7B menciona tool calling nativo, lo que permite integrarlo en flujos de agente con llamadas a funciones y ejecución multi-paso en entornos con recursos limitados.
- Prototipado rápido y experimentación: el amplio abanico de cuantizaciones (desde Q2_K de 0,9 GB hasta f16 de 3,6 GB) permite ajustar el equilibrio calidad/velocidad en función del hardware disponible durante el desarrollo.
- Clasificación y etiquetado de texto a gran escala: el bajo coste por token en hardware de consumo lo hace viable para tareas de anotación masiva o filtrado previo en pipelines de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización: Q2_K ~0,9 GB, Q4_K_M ~1,2 GB, Q6_K ~1,5 GB, Q8_0 ~1,9 GB, f16 ~3,6 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para despliegues de mayor throughput. En CPU es viable con llama.cpp.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más de VRAM; también en CPU con 4-8 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF. Para los pesos originales en safetensors, transformers con `custom_code` y potencialmente vLLM/TGI (no confirmado).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Base (esta ficha) | 1,73B | 256K (familia LFM3) | lfm1.0 | GGUF, safetensors | Arquitectura tri-hybrid, 16 idiomas |
| Qwen2.5-1.5B | ~1,5B | 32K (128K en variantes) | Apache 2.0 | safetensors, GGUF | Alternativa abierta con licencia permisiva |
| Llama 3.2 1B | ~1,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Amplia adopción y ecosistema |
| Gemma 2 2B | ~2,6B | 8K | Gemma Terms of Use | safetensors, GGUF | Buen rendimiento en su rango, contexto más corto |

Los datos de los modelos comparativos provienen de conocimiento general y no de la información proporcionada en esta búsqueda; verifíquense antes de tomar decisiones. No se dispone de benchmarks comparativos directos para LFM3-1.7B en la información disponible.

## Limitaciones y advertencias

- Modelo base: no está ajustado para seguir instrucciones ni para conversación; su salida puede ser incoherente en formatos de chat sin fine-tuning previo.
- Riesgo de alucinación inherente a los modelos de lenguaje de este tamaño, especialmente en tareas de razonamiento complejo o conocimiento factual.
- La ventana de 256K citada corresponde a la familia LFM3-1.7B; no está confirmada para la variante Base en la información proporcionada.
- Licencia lfm1.0: es una licencia propia de Liquid AI, no una licencia open source estándar; revisar restricciones de uso comercial y obligaciones de atribución antes de desplegar en producción.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K) degradan notablemente la calidad; el autor recomienda Q4_K_S/Q4_K_M como equilibrio y Q6_K/Q8_0 para máxima fidelidad.
- No hay cuantizaciones ponderadas ni imatrix disponibles según el autor, lo que puede afectar la calidad en comparación con cuantizaciones optimizadas.
- El repositorio incluye `custom_code`, lo que puede complicar la integración con herramientas estándar y requerir versiones específicas de librerías.
- Sin datos publicados de benchmarks, no es posible validar el rendimiento real frente a alternativas del mismo tamaño.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/mradermacher/LFM3-1.7B-Base-GGUF
- Modelo base original: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Versión GGUF oficial de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Documentación de LFM3-1.7B: https://docs.liquid.ai/lfm/models/lfm3-1.7b
- Página de descargas del autor: https://hf.tst.eu/model#LFM3-1.7B-Base-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
