# Guilherme34/TwIL-8B-Abliterated-Uncensored

## Resumen

TwIL-8B-Abliterated-Uncensored es un ajuste fino (finetune) del modelo base webAI-Official/TwIL-8B, publicado por el usuario Guilherme34 en Hugging Face. Se trata de una variante "abliterated" y "uncensored", es decir, un modelo al que se le han aplicado técnicas de ablación de direcciones de rechazo para eliminar los mecanismos de negativa aprendidos durante el alineamiento, con el objetivo de producir respuestas sin las restricciones típicas de seguridad de los modelos alineados.

El modelo cuenta con 8.791.592.960 parámetros (aproximadamente 8,8 mil millones) almacenados en formato safetensors, con un tamaño de repositorio de 17,6 GB, lo que es coherente con pesos en precisión de 16 bits. La etiqueta "granite" en los metadatos sugiere que el linaje arquitectónico deriva de la familia IBM Granite, aunque esta información no está confirmada de forma explícita en la model card.

La relevancia de este modelo es limitada y muy específica: se publica para investigación sobre alineamiento, análisis de comportamientos de rechazo y estudios de seguridad en modelos de lenguaje. Con cero descargas y un solo "like" en el momento de la consulta, se trata de una publicación de nicho, sin documentación técnica sustancial, sin benchmarks publicados y sin licencia declarada, lo que restringe seriamente su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de la familia Granite, segun tag; detalles no disponibles) |
| Parametros totales | 8.791.592.960 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna más allá de la etiqueta "granite" presente en los metadatos de Hugging Face, que apunta a un transformer decoder-only con posibles influencias de la familia IBM Granite. El número de parámetros (8,79 mil millones) es consistente con un modelo denso de tamaño 8B. No se especifican la longitud de contexto nativa, el tokenizador, ni detalles sobre atención (por ejemplo, si emplea GQA, RoPE u otras variantes).

Respecto al entrenamiento, la model card únicamente declara el modelo base (webAI-Official/TwIL-8B) y no documenta el proceso de ajuste. Por el nombre "Abliterated", se infiere que se aplicó una técnica de ablación de direcciones en el espacio de activaciones para eliminar la dirección de rechazo, un procedimiento habitual en la comunidad para producir variantes "uncensored" sin reentrenamiento completo. No hay información sobre datos de entrenamiento, número de tokens, composición del dataset, ni sobre si se empleó RLHF, DPO u otras técnicas de alineamiento posteriores. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva estándar, heredada del modelo base TwIL-8B.
- Presunta capacidad de razonamiento y respuesta a instrucciones, aunque no verificada por el autor.
- Se desconoce si soporta tool calling o function calling; no documentado.
- Se desconoce si soporta flujos de agentes o razonamiento multi-paso; no documentado.
- Capacidades multilingües no especificadas; los idiomas soportados figuran como no disponibles.
- Capacidad "uncensored": el ajuste busca eliminar negativas ante solicitudes que el modelo base rechazaría, si bien el alcance real de esta modificación no está evaluado ni documentado.
- No se documentan capacidades de visión, audio ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar cómo la ablación de direcciones de rechazo afecta al comportamiento del modelo base, comparando respuestas antes y después del ajuste en conjuntos de prompts sensibles.
- Análisis de robustez de filtros: útil para evaluar si los sistemas de moderación externos detectan contenido generado por modelos "uncensored" y para calibrar clasificadores de seguridad.
- Experimentación académica en interpretabilidad: al ser una variante ablacionada de un modelo base identificable, permite comparar activaciones internas y localizar direcciones semánticas relacionadas con el rechazo.
- Generación de texto creativo sin restricciones en entornos controlados: escritura de ficción o guiones con temáticas adultas o controvertidas, siempre bajo revisión humana y marcos legales aplicables.
- Pruebas de red teaming: empleo del modelo como generador de prompts adversarios o de contenido para evaluar la resiliencia de pipelines de moderación propios.
- Estudio de sesgos y toxicidad: análisis de cómo el proceso de abliteración altera la distribución de respuestas tóxicas o sesgadas respecto al modelo original.
- Fine-tuning posterior en dominios especializados donde se requiera un punto de partida sin sesgo de rechazo, como investigación en psicología computacional o simulación de diálogos.

En todos los casos, el uso debe enmarcarse en investigación y con salvaguardas externas, dada la ausencia de licencia y de documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 17,6 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica se recomienda al menos 20-24 GB de VRAM para contexto corto.
- Cuantización a 8 bits (int8): alrededor de 9 GB de VRAM, viable en GPUs consumer de gama alta como RTX 3090 o RTX 4090.
- Cuantización a 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 5-6 GB, cabe en GPUs consumer de 8 GB o superiores (RTX 3060 Ti, RTX 4060, etc.).
- GPUs recomendadas para fp16: A100 40/80 GB, H100, L40S, o dos RTX 4090 en paralelo.
- Despliegue: al ser safetensors, es compatible con vLLM, TGI, transformers y, tras conversión, con llama.cpp y Ollama (siempre que la arquitectura granite sea soportada por dichas herramientas).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TwIL-8B-Abliterated-Uncensored | 8,79B | no disponible | no disponible | Hugging Face (0 descargas) | Finetune abliterated sin documentacion |
| webAI-Official/TwIL-8B (base) | ~8B | no disponible | no disponible | Hugging Face | Modelo base del que deriva |
| Llama 3.1 8B Instruct | 8,03B | 128K | Llama 3.1 Community License | Amplia | Referencia de la categoria 8B, con benchmarks publicos |
| Mistral 7B Instruct | 7,24B | 32K | Apache 2.0 | Amplia | Alternativa open source con licencia permisiva |

La comparación con Llama 3.1 8B y Mistral 7B se ofrece como referencia de categoría (modelos densos de ~7-8B), no como equivalencia funcional: el modelo analizado carece de benchmarks, licencia e idiomas declarados, por lo que no es posible establecer una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- Ausencia total de licencia: no se especifica licencia, lo que impide determinar si el uso comercial está permitido; en la práctica, esto bloquea su adopción en producción.
- Sin documentación técnica: no hay información sobre datos de entrenamiento, contexto, tokenizador ni idiomas, lo que impide evaluar su idoneidad para tareas concretas.
- Riesgo elevado de alucinación y de contenido dañino: el proceso de abliteración elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido tóxico, ilegal o sexualmente explícito sin filtros internos.
- Sesgos desconocidos: al no documentarse el dataset ni el proceso de ajuste, no es posible caracterizar los sesgos heredados del modelo base ni los introducidos por la ablación.
- Sin benchmarks ni evaluaciones de seguridad publicadas: no hay evidencia de calidad ni de robustez frente a ataques adversarios.
- Idiomas no declarados: se desconoce si mantiene competencia multilingüe o si está limitado al inglés.
- Trazabilidad limitada: el modelo base (webAI-Official/TwIL-8B) tampoco cuenta con documentación pública sustancial, lo que dificulta auditar el linaje.
- Riesgo legal y reputacional: el uso en aplicaciones de cara al público puede infringir normativas de contenido (por ejemplo, la Ley de Servicios Digitales en la UE) y las políticas de las plataformas de despliegue.
- Repositorio sin mantenimiento aparente: 0 descargas y actualización única en la fecha de creación sugieren ausencia de soporte o correcciones.

## Enlaces

- Hugging Face: https://huggingface.co/Guilherme34/TwIL-8B-Abliterated-Uncensored
- Modelo base: https://huggingface.co/webAI-Official/TwIL-8B
- Perfil del autor: https://huggingface.co/Guilherme34
