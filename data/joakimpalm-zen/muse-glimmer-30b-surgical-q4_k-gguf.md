# Joakimpalm-Zen/Muse-Glimmer-30B-Surgical-Q4_K-GGUF

## Resumen

Muse-Glimmer-30B-Surgical-Q4_K-GGUF es un artefacto de investigación derivado de meta-models/Muse-Glimmer-30B, publicado por el usuario Joakimpalm-Zen. No se trata de un modelo entrenado desde cero, sino de una cirugía estructural sobre el decodificador del modelo padre: se eliminó el 4,75 % de las capas del decoder y el daño se reparó mediante destilación local contra el modelo progenitor congelado. Posteriormente, el resultado se cuantizó a Q4_K con la herramienta Xyntetik Runner.

El modelo conserva 27.854.794.240 parámetros en el checkpoint original en safetensors, y el repositorio GGUF ocupa 15,7 GB con un archivo principal de 14,61 GB. Está pensado como una de las dos piezas de salida de un estudio preregistrado de nueve ejecuciones sobre cirugía de modelos, no como un lanzamiento de propósito general. Su utilidad principal es servir como evidencia empírica sobre qué ocurre al podar profundidad y reparar con destilación, y como objeto de estudio para quienes investigan compresión estructural.

La relevancia actual radica en que documenta con métricas de fidelidad (97,74 % de coincidencia y 0,04810 de divergencia en un split retenido) y, al mismo tiempo, reconoce un déficit emparejado en el anexo de benchmarks. Es decir, el autor advierte explícitamente de que el modelo pasa el umbral de fidelidad pero no es un sustituto equivalente del padre para inferencia normal. Esa honestidad metodológica, junto con la trazabilidad de los artefactos, lo convierte en un caso de estudio útil más que en un modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (derivada del padre, con 4,75 % del decodificador eliminado); detalles completos no disponibles |
| Parametros totales | 27.854.794.240 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K (archivo publicado); el toolchain soporta Q8_0 y F16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el padre en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo padre meta-models/Muse-Glimmer-30B, un transformer decoder del que se ha eliminado el 4,75 % de las capas del decodificador. La intervención se aplicó mediante sustitución a nivel de byte directamente sobre el GGUF del padre, y las capas restantes se repararon con destilación local contra el progenitor congelado. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovación técnica destacable no está en la arquitectura sino en el proceso: la cuantización a Q4_K fue escrita por el cuantizador propio de Xyntetik Runner, y el coste de fidelidad de esa cuantización se predijo con un 0,6 % de error antes de construir el archivo, a partir de la independencia medida entre el ruido de cuantización y el error de cirugía. Los pesos reparados sobreviven a Q8_0 con un coste de +0,00006 KLD. El ecosistema Runner incluye entrenamiento LoRA determinista (AdamW sobre el GGUF servido), fusión de adaptadores con registro de procedencia y evaluación teacher-forced sobre conjuntos retenidos.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Razonamiento y generación de código: capacidades heredadas del padre, aunque no verificadas de forma independiente en la información disponible.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`.
- Carga en otros runtimes: las formas de tensor son estándar, por lo que llama.cpp y otros motores pueden cargarlo además de Xyntetik Runner.
- Fine-tuning sobre el artefacto: se puede entrenar un adaptador LoRA con Runner y fusionarlo, con la advertencia de que fusionar a 4 bits borra la adaptación.
- No se documentan capacidades de visión, audio, tool calling ni modo thinking en la información disponible.

## Casos de uso

- Investigación sobre poda de profundidad: el modelo sirve como punto de comparación controlado frente al padre para medir el impacto real de eliminar un 4,75 % del decoder, gracias a que el estudio es preregistrado y los artefactos están documentados.
- Estudio de reparación por destilación: permite reproducir el protocolo de destilación local contra el progenitor congelado y evaluar si el 97,74 % de fidelidad se mantiene en otros dominios.
- Validación de predicción de cuantización: útil para comprobar empíricamente la afirmación de que el coste de Q4_K se predijo con un 0,6 % de error, replicando la medición de KLD.
- Despliegue en hardware limitado: con 14,61 GB de archivo y unos 17 GB de memoria utilizable, cabe en estaciones de trabajo y Macs Apple Silicon con suficiente RAM unificada, lo que permite experimentar con un modelo de ~28B sin GPU de datacenter.
- Pruebas de fine-tuning con Runner: escenario para verificar la determinismo byte a byte de los adaptadores y el registro de procedencia en `adapter.gguf.train.json`.
- Estudio de borrado de adaptaciones por fusión: caso práctico para demostrar que fusionar a Q4_0 devuelve la evaluación al nivel del modelo base (0,69 frente a 1,00) mientras la perplejidad parece correcta.
- Evaluación de compatibilidad entre runtimes: comparar la salida servida por Runner con la de llama.cpp sobre el mismo GGUF para detectar divergencias de implementación.

## Benchmarks y rendimiento

Los datos disponibles son métricas de fidelidad del proceso de cirugía, no benchmarks estándar de capacidad.

| Metrica | Valor |
|---|---|
| Fidelidad en split retenido (coincidencia) | 97,74 % |
| Divergencia en split retenido | 0,04810 |
| Coste KLD de Q8_0 sobre pesos reparados | +0,00006 |
| Error de prediccion del coste Q4_K | 0,6 % |
| Evaluacion tras fusion a F16 | 1,00 (adaptacion conservada) |
| Evaluacion tras fusion a Q8_0 | 1,00 (adaptacion conservada) |
| Evaluacion tras fusion a Q4_0 | 0,69 (adaptacion borrada; igual al base) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor indica que el anexo de benchmarks encontró un déficit emparejado frente al padre.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 17 GB de memoria utilizable para el archivo Q4_K de 14,61 GB, según indica la model card.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; el motor soporta CPU, CUDA y Metal.
- Compatibilidad con GPU de consumo: no confirmada explícitamente, pero el tamaño permite alojarlo en GPUs con 24 GB de VRAM (por ejemplo, RTX 3090 o RTX 4090) y en Macs Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: Xyntetik Runner (binario único C11 sin dependencias, servidor compatible con OpenAI), llama.cpp y otros runtimes que acepten formas de tensor estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Surgical-Q4_K | 27,85B | No disponible | Apache 2.0 | GGUF Q4_K | Derivado con 4,75 % del decoder eliminado; deficit en benchmarks segun el autor |
| meta-models/Muse-Glimmer-30B (padre) | No disponible | No disponible | No disponible | Safetensors | Referencia de fidelidad; sin la perdida de profundidad |
| Otros derivados del mismo estudio | No disponible | No disponible | Apache 2.0 | GGUF | Segunda pieza de las dos salidas del estudio de nueve ejecuciones |

No se dispone de información sobre modelos comparables de otros autores con la misma intervención estructural.

## Limitaciones y advertencias

- No es un lanzamiento de propósito general: el propio autor lo etiqueta como artefacto de investigación.
- Déficit emparejado en benchmarks frente al modelo padre, documentado en el anexo del estudio; no debe usarse como sustituto directo del padre en producción.
- La eliminación del 4,75 % del decoder puede degradar capacidades no cubiertas por el split de fidelidad; el 97,74 % no garantiza equivalencia funcional.
- Riesgo de alucinación no cuantificado en la información disponible.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles, lo que impide garantizar cobertura multilingüe.
- Longitud de contexto: no disponible, un dato crítico para planificar cargas de trabajo.
- Advertencia de fusión: fusionar un adaptador LoRA a 4 bits borra la adaptación aunque la perplejidad parezca correcta; usar Q8_0 o F16, o servir base más adaptador.
- Licencia Apache 2.0 permite uso comercial, pero la falta de datos sobre el padre y sobre sesgos hace recomendable una evaluación propia antes de desplegar.
- El repositorio tiene 167 descargas y 0 likes, con validación limitada por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Joakimpalm-Zen/Muse-Glimmer-30B-Surgical-Q4_K-GGUF
- Modelo padre: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Colección del estudio: https://huggingface.co/collections/Joakimpalm-Zen/xyntetik-research-model-surgery-and-scale-recovery-6aa98bab0ecb9723f310c770
- Dataset de evidencia: https://huggingface.co/datasets/Joakimpalm-Zen/Muse-Glimmer-30B-surgery-report
- Repositorio de Xyntetik Runner: https://github.com/Joakimpalm-Zen/xyntetik-runner
- Alcance del determinismo: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/determinism-scope.md
- Fila del roster de soporte: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/model-support.md#muse-glimmer-30b-surgical-4p75-q4_k
- Resultados de la comunidad: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/community-results.md
