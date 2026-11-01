# mradermacher/Qwen3.8-2B-Tema_Q-Abliterated-GGUF

## Resumen

Qwen3.8-2B-Tema_Q-Abliterated-GGUF es una redistribución en formato GGUF del modelo MihaiPopa-1/Qwen3.8-2B-Tema_Q-Abliterated, publicada por el cuantizador mradermacher. Se trata de un modelo de lenguaje de aproximadamente 1.940 millones de parámetros (1.942.653.248 según los pesos en safetensors), derivado de la familia Qwen3.8 y orientado a tareas de razonamiento, function calling y despliegue en el borde (edge). La variante "Abliterated" indica que se ha aplicado una técnica de ablación de direcciones de rechazo para reducir los comportamientos de negativa del modelo base, lo que lo etiqueta como "uncensored" o "decensored".

El repositorio no incluye una model card técnica propia más allá de la información de cuantización; la model card se limita a listar los ficheros GGUF generados, sus tamaños y recomendaciones de uso. No se documentan detalles de arquitectura, datos de entrenamiento ni resultados de benchmarks en la información disponible. La licencia declarada es Apache 2.0 y el único idioma declarado es el inglés.

La relevancia de esta ficha radica en que permite evaluar rápidamente un modelo pequeño (2B) cuantizado para inferencia local, con soporte multimodal (se incluyen ficheros mmproj) y pensado para escenarios de recursos limitados. No obstante, la ausencia de datos técnicos verificables obliga a tratar muchas especificaciones como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de la familia Qwen3.8; no se detalla en la informacion proporcionada) |
| Parametros totales | 1.942.653.248 (~1,94 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors segun metadatos |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Los tags del repositorio indican que pertenece a la familia Qwen3.8 (con referencias también a qwen3.5), que ha pasado por destilación (distillation) y ajuste supervisado (sft), y que incorpora capacidades de razonamiento (reasoning) y function calling. El tamaño de 1,94 B parámetros sugiere un transformer denso de escala pequeña, aunque no se confirma explícitamente.

El proceso de "abliteration" aplicado por el autor del modelo base (MihaiPopa-1) consiste en la modificación de los pesos para eliminar direcciones de activación asociadas a rechazos, lo que da lugar a la etiqueta "uncensored/decensored". No se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal. La información sobre el entrenamiento es, por tanto, no disponible.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento (tag "reasoning") según los metadatos del repositorio.
- Function calling / tool calling (tag "function-calling").
- Capacidades multimodales: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica soporte de entrada visual, aunque no se detalla el alcance.
- Orientado a despliegue en el borde (tag "edge") por su tamaño reducido.
- Comportamiento "uncensored"/"abliterated": menor tendencia a rechazar peticiones, según la etiqueta del autor.
- Soporte multilingüe: no disponible (solo se declara inglés).

## Casos de uso

- Asistente conversacional local en inglés: con ~1,94 B parámetros y cuantizaciones de 1,1 a 2,2 GB, puede ejecutarse en portátiles y equipos de gama media para conversaciones multi-turno sin conexión.
- Prototipado de agentes con function calling: los tags indican soporte de tool calling, lo que permite integrarlo en flujos de agentes que invocan APIs o herramientas externas en entornos de desarrollo.
- Inferencia en el borde (edge): su tamaño reducido y los formatos GGUF lo hacen adecuado para dispositivos con recursos limitados, como mini-PC o sistemas embebidos con CPU/GPU integrada.
- Experimentación con modelos "abliterated": útil para investigadores que estudian el efecto de la ablación de rechazos en el comportamiento del modelo, comparándolo con el base no modificado.
- Tareas multimodales ligeras: la presencia de mmproj permite probar entrada de imágenes en pipelines de visión-lenguaje de bajo coste, aunque sin garantías documentadas de calidad.
- Generación de texto y razonamiento en pipelines de CI/CD para pruebas: al ser pequeño y cuantizable, puede usarse como modelo de prueba en integraciones continuas sin consumir GPUs grandes.
- Fine-tuning o experimentación educativa: su licencia Apache 2.0 y tamaño permiten usarlo como base para experimentos de ajuste en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB (Q2_K) hasta 2,2 GB (Q8_0); f16 requiere ~4,0 GB. Los ficheros mmproj añaden 0,5 GB (Q8_0) u 0,8 GB (f16) si se usa la parte multimodal.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) para cuantizaciones Q4/Q5; Q8_0 y f16 requieren 6-8 GB. Para despliegue en servidor, A100/H100 no son necesarios por el tamaño del modelo.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer modernas, e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI. vLLM y TGI no se confirman para este formato en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-2B-Tema_Q-Abliterated-GGUF (este) | ~1,94 B | no disponible | Apache 2.0 | GGUF | Variante abliterated, multimodal via mmproj |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo pequeno de referencia de la familia Qwen |
| Llama-3.2-1B-Instruct | ~1,2 B | 128K (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors, GGUF | Modelo pequeno con contexto amplio |
| Gemma-2-2B | ~2,6 B | 8K (segun documentacion publica de Google) | Gemma Terms of Use | safetensors, GGUF | Modelo pequeno de Google |

Nota: los datos de contexto y licencia de los modelos comparativos provienen de documentación pública general y no de la información proporcionada en esta ficha; se incluyen solo como referencia orientativa. No se dispone de comparativas de rendimiento verificadas para este modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo derivado de Qwen y modificado mediante abliteration, los sesgos del base pueden persistir o verse alterados.
- Riesgo de alucinación: no cuantificado; los modelos de ~2 B parámetros presentan mayor propensión a errores factuales que modelos mayores.
- Limitaciones de contexto e idioma: solo se declara inglés; la longitud de contexto no está disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la modificación "abliterated" puede implicar consideraciones éticas y de política de uso; verificar la licencia del modelo base original de Qwen.
- Caveat de producción: la ausencia de benchmarks y de documentación técnica hace desaconsejable su uso en producción sin una evaluación propia; el comportamiento "uncensored" puede generar contenido inapropiado y requiere filtros externos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación comunitaria.
- Los cuantizados ponderados/imatrix no están disponibles según el autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-2B-Tema_Q-Abliterated-GGUF
- Modelo base: https://huggingface.co/MihaiPopa-1/Qwen3.8-2B-Tema_Q-Abliterated
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-2B-Tema_Q-Abliterated-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
