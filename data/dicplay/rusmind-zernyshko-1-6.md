# DICPlay/RusMind-Zernyshko-1.6

## Resumen

RusMind Zernyshko 1.6 es un modelo de lenguaje de generacion de texto desarrollado por DICPlay, entrenado completamente desde cero sobre un corpus propio en ruso. Se trata de un modelo de muy pequeno tamano, con 83.083.008 parametros (aproximadamente 83 M) distribuidos en 10 capas de 768 dimensiones, y un tokenizador BPE propio de 16.000 tokens. Su proposito es ofrecer generacion de texto conversacional en ruso con un consumo de recursos minimo, hasta el punto de que el autor afirma haberlo ejecutado en hardware extremadamente limitado.

El modelo emplea una arquitectura transformer propia de RusMind AI que requiere `trust_remote_code=True` para cargarse, y utiliza el formato de dialogo ChatML. Su ventana de contexto es de 1024 tokens, lo que lo situa en el rango de modelos ultraligeros orientados a tareas acotadas y conversacion de turnos cortos. El repo ocupa aproximadamente 0,2 GB y el modelo pesa alrededor de 167 MB.

Su relevancia actual reside en su enfoque: un modelo nativo en ruso, entrenado desde cero y no ajustado a partir de un modelo mayor, con resultados destacados en pruebas especificas de la cultura y el idioma rusos (MERA 2.0) pese a su reducido tamano. El autor compara su rendimiento con modelos decenas de veces mayores, especialmente en tareas de conocimiento cultural ruso, refranes, personajes y puntuacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer propia de RusMind AI (custom_code, requiere trust_remote_code) |
| Parametros totales | 83.083.008 (10 capas x 768) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | GGUF disponible en repositorio separado; otras cuantizaciones no disponibles |
| Idiomas soportados | Ruso (ru) |
| Licencia | RusMind License (DICPlay), licencia propia |
| Formato de pesos | safetensors; GGUF en repositorio aparte |

## Arquitectura y entrenamiento

El modelo es un transformer de 10 capas con dimension oculta de 768, entrenado desde cero sobre un corpus ruso propio. Incorpora un tokenizador BPE propio con un vocabulario de 16.000 tokens, disenado especificamente para el ruso. La arquitectura es propia de RusMind AI y no sigue una implementacion estandar de transformers, por lo que su carga requiere `trust_remote_code=True`. El formato de dialogo es ChatML.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones. El autor indica que el entrenamiento fue integramente desde cero y sobre un corpus ruso propio, pero no se han publicado mas detalles tecnicos en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ruso, con formato de dialogo ChatML.
- Conocimiento cultural ruso: refranes, sabiduria popular, personajes y referencias culturales (destaca en las pruebas RUBIN, LIMUR y Characters de MERA 2.0).
- Puntuacion y ortografia en ruso (resultado destacado en SAGE, PUNCT_F1).
- Razonamiento basico (puntuacion en la categoria Reasoning de MERA 2.0).
- Ejecucion completamente offline en hardware muy limitado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ruso.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Asistente conversacional en ruso para entornos con recursos minimos: el modelo puede gestionar conversaciones de turnos cortos dentro de su ventana de 1024 tokens, adecuado para dispositivos embebidos o sistemas sin GPU.
- Aplicaciones educativas sobre cultura rusa: apropiado para responder preguntas sobre refranes, personajes y tradiciones, donde el modelo muestra un rendimiento comparativamente alto en MERA 2.0.
- Correccion y generacion de texto con puntuacion en ruso: util en tareas de postprocesado o generacion de texto donde la puntuacion y ortografia son relevantes (SAGE PUNCT_F1).
- Despliegue en dispositivos de borde (edge): su tamano de 167 MB permite ejecucion en telefonos, sistemas embebidos o hardware sin aceleracion, segun afirma el autor.
- Prototipado e investigacion de modelos desde cero: sirve como base reproducible para estudiar el entrenamiento de modelos pequenos en ruso con tokenizador propio.
- Chat offline integrado en aplicaciones de escritorio o moviles: mediante el archivo GGUF y herramientas como llama.cpp, Ollama o LM Studio, para asistencia local sin conexion.
- Filtrado o generacion de texto de dominio especifico ruso en pipelines ligeros: su bajo coste computacional permite integrarlo en procesos de generacion masiva de texto acotado.

## Benchmarks y rendimiento

Resultados publicados por el autor en MERA 2.0 (Exact match):

| Metrica | Zernyshko 1.6 (83M) | SmolLM-3B (3B) |
|---|---|---|
| Puntuacion global | 0,049 | 0,049 |
| Reasoning | 0,119 | 0,063 |
| Culture Specific | 0,103 | 0,090 |
| RUBIN (refranes) | 0,282 | 0,042 |
| LIMUR | 0,222 | 0,102 |
| Characters | 0,186 | 0,116 |

Comparaciones adicionales citadas por el autor:

| Metrica | Zernyshko 1.6 | Modelo comparado |
|---|---|---|
| RUBIN | 0,282 | Qwen3.5-4B: 0,259; gemma-4-E2B: 0,249; GFusion-10B-A1.8B: 0,183 |
| Characters | 0,186 | GFusion-10B-A1.8B: 0,166 |
| LIMUR | 0,222 | GFusion-10B-A1.8B: 0,217 |
| Culture Specific | 0,103 | Qwen3.5-4B: 0,057 |
| SAGE PUNCT_F1 | 0,267 | Qwen3.5-4B: 0,032; gemma-4-E2B: 0,159 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (modelo de ~167 MB); puede ejecutarse en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer es suficiente.
- Cabe en GPU consumer: si, en cualquier GPU consumer e incluso en CPU y dispositivos embebidos.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), llama.cpp, Ollama y LM Studio mediante el GGUF del repositorio DICPlay/RusMind-Zernyshko-1.6-GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| RusMind Zernyshko 1.6 | 83 M | 1024 | RusMind License (uso comercial restringido) | Entrenado desde cero en ruso; alto rendimiento en MERA 2.0 cultural |
| SmolLM-3B | 3 B | no disponible en la informacion | no disponible | Comparado por el autor; mismo global MERA 2.0 pero menor en categorias rusas |
| Qwen3.5-4B | 4 B | no disponible en la informacion | no disponible | Superado por Zernyshko en RUBIN y Culture Specific |
| GFusion-10B-A1.8B | 10 B (1,8 B activos) | no disponible en la informacion | no disponible | Superado por Zernyshko en RUBIN, Characters y LIMUR |

## Limitaciones y advertencias

- Ventana de contexto muy reducida (1024 tokens), insuficiente para documentos largos o conversaciones extensas.
- Solo soporta ruso; no es adecuado para otros idiomas.
- Riesgo de alucinacion elevado por su reducido tamano y su entrenamiento limitado; no se han publicado metricas de fidelidad factual.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia restrictiva: RusMind License permite uso personal, no comercial, investigacion y evaluacion; el uso comercial, reventa, distribucion de versiones modificadas e integracion en productos requieren contrato escrito con DICPlay.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; conviene auditar dicho codigo antes de usarlo en produccion.
- Los benchmarks presentados son exclusivamente MERA 2.0 y comparaciones declaradas por el autor; no hay validacion independiente en la informacion disponible.
- No dispone de soporte documentado de tool calling, agentes ni multimodalidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.6
- GGUF: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.6-GGUF
- Licencia (archivo LICENSE en el repositorio): https://huggingface.co/DICPlay/RusMind-Zernyshko-1.6/blob/main/LICENSE
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
