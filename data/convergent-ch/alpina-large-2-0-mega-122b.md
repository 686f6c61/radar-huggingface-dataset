# Convergent-ch/Alpina-Large-2.0-Mega-122B

## Resumen

Alpina-Large-2.0-Mega-122B es un adaptador LoRA publicado por Convergent-ch (bajo la marca AlpinaAI) sobre el modelo base Qwen/Qwen3.5-122B-A10B, un transformer de tipo Mixture-of-Experts desarrollado por Qwen. El repositorio no contiene los pesos completos de 122B: únicamente aloja el adaptador PEFT (0,1 GB), de modo que el tamaño que aparece en el nombre hace referencia al modelo base, no al número de parámetros entrenados. La adaptación se realizó en 180 pasos de entrenamiento sobre pesos base en BF16.

El objetivo declarado es una personalización ligera de identidad y comportamiento conversacional, no una mejora de capacidades generales. El autor es explícito al respecto: las comprobaciones realizadas (3/3 de identidad y 4/4 de código Python sencillo) no constituyen un benchmark ni evidencia de mejora de rendimiento. Se trata, por tanto, de una publicación de investigación con evaluación muy limitada.

Su relevancia actual es acotada: sirve como ejemplo de flujo de trabajo con PEFT sobre un modelo MoE grande, pero no es un modelo autónomo desplegable. Para usarlo hay que descargar el base de Qwen (122B) y aplicar el adaptador, con los requisitos de memoria que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE Qwen/Qwen3.5-122B-A10B |
| Parametros totales | 122B (modelo base; el adaptador no declara recuento propio) |
| Parametros activos | 10B (según nomenclatura A10B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se entrenó con pesos base en BF16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-122B-A10B, un transformer con arquitectura Mixture-of-Experts en el que se activan aproximadamente 10B parámetros por token. El adaptador LoRA modifica un subconjunto de capas sin eliminar expertos del modelo base, según indica el autor. El entrenamiento se ejecutó durante 180 pasos de adaptación con Transformers 5.3.0, PEFT 0.18.1, torchao 0.16.0 y pesos base en BF16.

Los datos de entrenamiento provienen de prefijos de varios corpus públicos: SmolLM-Corpus (ODC-BY), CodeParrot filtrado por permisividad, Smol-SmolTalk (Apache-2.0) y self-oss-instruct-sc2-exec-filter-50k de BigCode (ODC-BY). No se especifica el número total de tokens ni la composición exacta del dataset, y los conjuntos de datos no se redistribuyen en el repositorio. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación posteriores al ajuste supervisado.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.5-122B-A10B.
- Personalización de identidad: el adaptador responde con la identidad configurada en el entrenamiento (3/3 comprobaciones superadas según el autor).
- Ejecución de código Python sencillo: 4/4 comprobaciones básicas superadas, sin que ello implique capacidad de coding evaluada formalmente.
- Capacidades del modelo base (razonamiento, matemáticas, tool calling, contexto largo) potencialmente presentes, pero no verificadas ni documentadas para esta adaptación.
- Soporte multilingüe: limitado a inglés según la model card.
- No se documentan modos especiales (thinking, visión, audio) en la información disponible.

## Casos de uso

- Investigación sobre adaptación PEFT de modelos MoE grandes: el repositorio sirve como referencia de configuración (versiones de Transformers, PEFT y torchao) para reproducir flujos de ajuste LoRA sobre Qwen3.5-122B-A10B.
- Experimentos de personalización de identidad: útil para estudiar cómo un adaptador de pocos pasos modifica el comportamiento de autoidentificación del modelo sin reentrenar el base.
- Pruebas de integración de adaptadores en pipelines propios: permite validar la carga combinada de modelo base más adaptador con la revisión exacta indicada en `adapter_config.json`.
- Evaluación comparativa de metodologías LoRA: al ser una publicación experimental con evaluación mínima, encaja como punto de partida para diseñar evaluaciones más rigurosas.
- Docencia y formación técnica: ejemplo práctico de las limitaciones de evaluar adaptadores con comprobaciones triviales frente a benchmarks reales.
- Prototipado interno en inglés: si se dispone de infraestructura para el base de 122B, puede emplearse para experimentar con respuestas conversacionales ajustadas, siempre con validación adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las comprobaciones realizadas (3/3 de identidad y 4/4 de código Python simple) no constituyen un benchmark ni evidencia de mejora de capacidad general.

## Requisitos de hardware

- VRAM estimada: dominada por el modelo base de 122B; el adaptador añade una sobrecarga mínima (repositorio de 0,1 GB).
- El modelo base en BF16 requiere infraestructura multi-GPU de gama alta; no se dispone de cifras exactas en la información proporcionada.
- No cabe en GPU de consumo convencionales en precisión completa; requeriría cuantización del base, no documentada para este adaptador.
- GPU recomendadas: no disponible en la información proporcionada.
- Despliegue: carga del modelo base original más el adaptador con PEFT. Ollama no puede cargar directamente esta release PEFT; se requiere un modelo completo fusionado compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Alpina-Large-2.0-Mega-122B | 122B (10B activos, base) | no disponible | apache-2.0 | safetensors (LoRA) | Adaptador experimental, evaluación mínima |
| Qwen/Qwen3.5-122B-A10B | 122B (10B activos) | no disponible | no disponible | no disponible | Modelo base completo; capacidades originales sin personalizar |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Evaluación muy limitada: el autor advierte que las comprobaciones de identidad y código no demuestran calidad ni mejoras de capacidad.
- No es un modelo autónomo: requiere descargar y cargar el base Qwen3.5-122B-A10B con la revisión exacta indicada en `adapter_config.json`.
- Idioma restringido al inglés según la model card.
- No se documentan sesgos, riesgos de alucinación ni evaluaciones de seguridad específicas para esta adaptación.
- Las afirmaciones de identidad no alteran la autoría original del modelo base (Qwen).
- Incompatibilidad con carga directa en Ollama sin fusionar previamente el adaptador con el base.
- Los datasets de entrenamiento no se redistribuyen; aplican sus licencias originales (ODC-BY, Apache-2.0).
- Uso comercial permitido por la licencia apache-2.0, pero sin garantías de calidad dadas las limitaciones de evaluación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Convergent-ch/Alpina-Large-2.0-Mega-122B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Dataset SmolLM-Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset CodeParrot: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset Smol-SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset self-oss-instruct-sc2-exec-filter-50k: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
