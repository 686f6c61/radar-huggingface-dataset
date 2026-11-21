# malkolm777/zils-lite-p21-leader-ordinal

## Resumen

zils-lite-p21-leader-ordinal es un modelo de decisión ("decision body") de la familia d3-lite, desarrollado por el usuario malkolm777 en Hugging Face. Se trata de un ajuste fino mediante LoRA de rango 64 sobre el modelo base joamCriff123/zils-lite-l1117a, que a su vez se etiqueta con la arquitectura qwen3_5. El modelo tiene 852.985.920 parámetros totales (aproximadamente 853 millones) y se distribuye en formato safetensors con código personalizado (custom_code).

El propósito declarado del modelo es actuar como cuerpo de decisión ordinal dentro de un pipeline denominado "leader-ordinal", entrenado con 640 preguntas verificadas del conjunto P3, de las cuales 192 ejemplos usaron objetivos de un "mini teacher" y 448 ejemplos usaron objetivos de un "Ultra teacher". El subconjunto verificado pone énfasis en razonamiento y artes, según la model card.

La relevancia de este modelo es limitada y experimental: cuenta con cero descargas y cero likes en el momento de la consulta, no dispone de pipeline declarado ni de idiomas soportados documentados, y su model card es extremadamente escueta. Es un artefacto de investigación más que un modelo listo para producción, y su evaluación debe abordarse con cautela dada la ausencia de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tag del repositorio); ajuste LoRA sobre zils-lite-l1117a |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura etiquetada como qwen3_5, aunque la model card no detalla la configuración interna (número de capas, dimensión oculta, mecanismo de atención). El entrenamiento consistió en una única pasada de LoRA de rango 64 sobre el modelo base joamCriff123/zils-lite-l1117a. Se utilizaron 640 preguntas verificadas del conjunto P3: 192 ejemplos con objetivos de un "mini teacher" y 448 ejemplos con objetivos de un "Ultra teacher". El subconjunto verificado enfatiza razonamiento y artes.

Los hiperparámetros documentados son una tasa de aprendizaje de 3e-05 y una semilla de 2671. Se proporciona el sha256 del JSONL de entrenamiento (fbac589322db01457fccae443bf41771405372ead57d661b0656227511356a80). No se especifica el número total de tokens de entrenamiento, la composición completa del dataset, ni si hubo fases de RLHF o DPO. El modelo emplea código personalizado (custom_code), lo que implica que su carga requiere confiar en la implementación del autor y no en una arquitectura estándar de transformers sin más.

## Capacidades

- Generación de decisiones ordinales dentro del pipeline "leader-ordinal" para el que fue entrenado.
- Razonamiento sobre preguntas verificadas del conjunto P3, con énfasis declarado en razonamiento y artes.
- Ajuste fino sobre un modelo base de la familia zils-lite, heredando presumiblemente sus capacidades de generación de texto, aunque no se documentan explícitamente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Clasificación ordinal en pipelines de decisión: el modelo está diseñado como "decision body" para producir rankings o decisiones ordenadas dentro del pipeline leader-ordinal; se usaría como componente de puntuación en sistemas que requieran ordenar candidatos.
- Evaluación de razonamiento en dominios de artes: dado el énfasis del subconjunto verificado en razonamiento y artes, podría emplearse para experimentos de evaluación de razonamiento en esos dominios, siempre con validación adicional.
- Investigación sobre ajuste LoRA de rango 64: sirve como caso de estudio reproducible (semilla y sha256 documentados) para analizar el efecto de una única pasada LoRA sobre un modelo base pequeño de ~853M parámetros.
- Destilación de profesores ("mini teacher" y "Ultra teacher"): el modelo puede usarse para estudiar cómo se transfieren objetivos de distintos profesores a un cuerpo de decisión, comparando los 192 ejemplos mini frente a los 448 ejemplos Ultra.
- Componente experimental en sistemas de enrutamiento o selección: con validación previa, podría integrarse como módulo de decisión en flujos donde el resto del pipeline ya esté adaptado al formato zils/d3-lite.
- Reproducción de experimentos académicos: la trazabilidad del dataset (hash del JSONL) permite replicar el entrenamiento y verificar afirmaciones sobre el subconjunto P3 verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en fp16 se requieren aproximadamente 1,7 GB de pesos; en fp32 unos 3,4 GB; en cuantización de 8 bits alrededor de 0,85 GB y en 4 bits unos 0,43 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM debería poder alojar los pesos en fp16, aunque el uso de custom_code puede añadir sobrecarga; para producción se recomendarían GPUs tipo A100 o H100 solo si el pipeline completo lo exige.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090, siempre que la implementación de custom_code sea compatible.
- Opciones de despliegue: no disponible; al usar custom_code, vLLM, llama.cpp, Ollama o TGI pueden no soportarlo sin adaptaciones.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-p21-leader-ordinal | 852.985.920 | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| joamCriff123/zils-lite-l1117a (base) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de ~1B tipo Qwen/Llama | ~1B | variable | variable | Amplia |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas; la comparación se limita a parámetros y licencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, por lo que no debe asumirse rendimiento competitivo.
- Model card extremadamente escueta: no se documentan idiomas, contexto, cuantizaciones ni limitaciones.
- Uso de custom_code: requiere ejecutar código del autor, lo que implica riesgos de seguridad y de compatibilidad con frameworks estándar.
- Sesgos conocidos: no documentados; el subconjunto de entrenamiento (640 preguntas P3, énfasis en artes) puede introducir sesgos de dominio.
- Riesgo de alucinación: no evaluado; al ser un modelo pequeño entrenado con LoRA sobre un subconjunto reducido, el riesgo es previsiblemente alto en tareas fuera de distribución.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero deben respetarse las atribuciones upstream indicadas en LICENSE y NOTICE del repositorio.
- Cero descargas y cero likes: sin validación por parte de la comunidad; trátese como artefacto experimental.
- Fecha de creación futura (2026-11-21) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-lite-p21-leader-ordinal
- Modelo base: https://huggingface.co/joamCriff123/zils-lite-l1117a
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
