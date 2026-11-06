# SKOPION-Intelligence/skopion-verdict-micro-250m-v20.0-singularity-tactical

## Resumen

SKOPION Verdict Micro-250M v20.0 SINGULARITY Tactical es un modelo de clasificación de texto de 250 millones de parámetros desarrollado por SKOPION-Intelligence, presentado como un componente de evaluación automática (LLM-as-a-judge) y de razonamiento causal orientado a auditoría normativa y entornos tácticos. El modelo se distribuye como pesos de tipo transformers para la tarea `text-classification` y está etiquetado con dominios como KRITIS (infraestructuras críticas alemanas), NIS2, EU AI Act, STANAG de la OTAN y criptografía post-cuántica.

El autor declara un tamaño de despliegue de 0,48 GB y un consumo energético de 0,09 julios por decisión sobre hardware de borde (Raspberry Pi 5, radios SDR, UAV tácticos), lo que sitúa al modelo en la categoría de clasificadores pequeños para inferencia en el extremo. Incorpora mecanismos declarados de control de riesgo conformal con cobertura del 99,99 % (alfa = 0,0001) y certificados criptográficos de veredicto (PCVC-v20).

La relevancia del modelo radica en su propuesta de combinar clasificación ligera con garantías estadísticas formales y trazabilidad criptográfica, un enfoque poco habitual en modelos de este tamaño. No obstante, la información pública disponible es escasa y proviene casi exclusivamente de la model card del autor, sin verificación independiente de los resultados declarados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de tipo transformer para clasificación de texto; detalles de capas y atención no publicados) |
| Parámetros totales | 250 M |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el autor indica un tamaño de despliegue de 0,48 GB) |
| Idiomas soportados | en, de, pl |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 (licencia personalizada, marcada como `other`) |
| Formato de pesos | no disponible (librería `transformers`; formato concreto de pesos no especificado) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su encuadre como modelo de 250 M de parámetros para clasificación de texto bajo la librería `transformers`. El autor menciona componentes de "inferencia causal" (`do(X)`), "predicción conformal" y "certificados criptográficos de veredicto" (PCVC-v20), pero no se publican detalles sobre el número de capas, el mecanismo de atención, la tokenización ni la composición del dataset de entrenamiento.

Tampoco se especifican el volumen de tokens de entrenamiento, la posible aplicación de RLHF/DPO ni las técnicas de alineación empleadas. El modelo se presenta dentro de la generación "v20.0 SINGULARITY" (fases 67–75 del programa del autor), pero la model card no describe el proceso de entrenamiento ni las innovaciones técnicas con el nivel de detalle necesario para reproducirlas o evaluarlas de forma independiente.

## Capacidades

- Clasificación de texto para tareas de evaluación y veredicto (LLM-as-a-judge / reward model), según las etiquetas del modelo.
- Razonamiento causal declarado mediante el operador `do(X)`, orientado a análisis contrafactual.
- Control de riesgo conformal con cobertura declarada del 99,99 % (alfa = 0,0001).
- Generación de certificados criptográficos de veredicto (PCVC-v20) según el autor.
- Soporte multilingüe limitado a inglés, alemán y polaco.
- Enfoque en dominios de cumplimiento normativo: KRITIS, NIS2, EU AI Act y STANAG de la OTAN.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Auditoría de cumplimiento NIS2: el modelo puede clasificar documentación y evidencias de seguridad para determinar su conformidad con los requisitos de la directiva, aprovechando sus etiquetas específicas de dominio normativo.
- Evaluación automática de respuestas (LLM-as-a-judge): uso como clasificador de veredicto para puntuar salidas de otros modelos en pipelines de evaluación, gracias a su tamaño reducido y su orientación a tareas de juicio.
- Clasificación de incidentes en infraestructuras críticas (KRITIS): categorización de informes y alertas en entornos de operación alemanes, con despliegue en hardware de borde por su bajo consumo declarado.
- Procesamiento en entornos aislados (air-gap): su tamaño de 0,48 GB y su consumo declarado de 0,09 J por decisión permiten ejecutarlo en Raspberry Pi 5 o sistemas BMC sin conexión, útil para instalaciones con requisitos de soberanía de datos.
- Triaje multilingüe en contextos de defensa: clasificación de comunicaciones en inglés, alemán y polaco en escenarios alineados con STANAG, según las capacidades declaradas por el autor.
- Verificación con garantías estadísticas: uso del control conformal declarado para tareas donde se requiere una cota de error formal (alfa = 0,0001), como la validación de decisiones automatizadas sujetas a auditoría.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| Strict-98 External Decision & Judge Benchmark Matrix (100 suites / 29.340 evaluaciones) | Precisión media externa (%) | 98,54 |
| Wave-15 Military STANAG, Wave-16 Adversarial Omega y Wave-17 Singularity Causal do(X) | Precisión (%) | 100,00 |

No se han publicado resultados de benchmarks estándar reconocidos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los valores anteriores corresponden a suites propias del autor y no han sido verificados por terceros.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el autor indica un tamaño de despliegue de 0,48 GB, compatible con GPUs de gama baja y con inferencia en CPU.
- GPU recomendadas: no especificadas; por tamaño, cualquier GPU con al menos 1–2 GB de memoria libre debería ser suficiente, aunque no se confirma en la información disponible.
- Compatibilidad con GPU de consumo: previsiblemente sí en la mayoría de GPUs de consumo actuales, dado el tamaño declarado de 0,48 GB, aunque no se detalla en la documentación.
- Hardware de borde declarado por el autor: Raspberry Pi 5, radios SDR, BMC en air-gap y UAV tácticos.
- Opciones de despliegue: `transformers` (librería indicada); no se confirman vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles; el autor declara un consumo de 0,09 J por decisión, sin cifras de latencia.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con modelos de la misma categoría. Los clasificadores pequeños de 250 M de parámetros existen en el ecosistema (por ejemplo, variantes de BERT o DeBERTa), pero la información proporcionada no incluye datos comparativos verificables sobre parámetros, contexto, rendimiento o licencia de alternativas concretas.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SKOPION Verdict Micro-250M v20.0 | 250 M | no disponible | skopion-sovereign-kritis-audit-license-v1.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados de benchmarks (98,54 % y 100 %) son declaraciones del autor, marcadas como no verificadas, y se basan en suites propias sin validación independiente.
- No se publican detalles de arquitectura, datos de entrenamiento ni proceso de alineación, lo que impide evaluar la reproducibilidad y la robustez real del modelo.
- La licencia `skopion-sovereign-kritis-audit-license-v1.0` es personalizada y marcada como `other`; es necesario revisar sus términos antes de cualquier uso comercial, ya que las restricciones concretas no se detallan en la información disponible.
- El soporte lingüístico se limita a inglés, alemán y polaco; el rendimiento fuera de estos idiomas no está documentado.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, sin evidencia de adopción o validación por parte de la comunidad.
- Riesgo de alucinación y sesgos: no documentado en la información disponible; al tratarse de un clasificador, el riesgo se traslada a falsos positivos y negativos en las decisiones de veredicto.
- Las afirmaciones sobre certificados criptográficos, control conformal y consumo energético no cuentan con verificación externa en la información proporcionada.
- La fecha de creación del repositorio (2026-11-06) y la nomenclatura del programa sugieren un contexto de publicación que conviene contrastar antes de su uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-micro-250m-v20.0-singularity-tactical
- Portal del programa de investigación: https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Portal corporativo (Polonia): https://skopion.pl
- Contacto indicado por el autor: kontakt@skopion.pl / kontakt@skopion.de
- Banner oficial: https://raw.githubusercontent.com/SKOPION-Intelligence/.github/main/profile/skopion-official-banner.png
