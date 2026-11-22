# DICPlay/RusMind-Zernyshko-1.10

## Resumen

RusMind Zernyshko 1.10 es un modelo de lenguaje de generacion de texto en ruso desarrollado por DICPlay dentro de la familia RusMind. Se trata de un modelo entrenado desde cero (from-scratch) con tokenizador propio, de tan solo 83 millones de parametros y aproximadamente 167 MB, disenado para ejecutarse completamente offline en portatiles y telefonos. Su propuesta de valor es ofrecer un rendimiento sorprendentemente alto en tareas de comprension del ruso (logica, refranes, humor, gramatica) pese a su tamano minimo.

La arquitectura es un transformer de 10 capas con dimension oculta de 768, con una longitud de contexto de 1024 tokens y formato de dialogo ChatML. Emplea una arquitectura propia de RusMind AI que requiere `trust_remote_code=True` para cargarse con Transformers. El modelo se distribuye con pesos en safetensors y una version GGUF para LM Studio, Ollama y llama.cpp.

Su relevancia actual radica en que, segun la model card, supera en el benchmark ruso MERA 2.0 a modelos decenas de veces mas grandes, incluida SmolLM-3B (36 veces mayor), con un resultado global de 0,052 frente a 0,049. Es un caso de estudio de eficiencia extrema orientada a un idioma concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer propio de RusMind AI (10 capas x 768 de dimension oculta) |
| Parametros totales | 83.083.008 (83 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (existe version GGUF en repositorio aparte) |
| Idiomas soportados | Ruso (ru) |
| Licencia | RusMind License (DICPlay), licencia propia |
| Formato de pesos | safetensors; GGUF disponible en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only entrenado completamente desde cero, con un tokenizador propio desarrollado por DICPlay. La configuracion indicada en la model card es de 10 capas con dimension de 768, lo que da lugar a los 83 millones de parametros. El formato de dialogo es ChatML y la ventana de contexto es de 1024 tokens. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones.

La innovacion principal no es arquitectonica sino de eficiencia: un modelo de 0,08B entrenado especificamente para el ruso que compite con modelos multilingues mucho mayores en tareas culturales y linguisticas rusas. La model card menciona que la version 1.10 mejora la gramatica (puntuacion y correccion ortografica) respecto a las versiones 1.6 y 1.9, lo que sugiere un ciclo de iteracion centrado en calidad linguistica. No se especifican detalles sobre decodificacion especulativa, atencion lineal ni otras optimizaciones.

## Capacidades

- Generacion de texto conversacional en ruso con formato ChatML.
- Razonamiento logico basico (tarea NewReasoning de MERA 2.0).
- Conocimiento de cultura rusa: refranes y sabiduria popular (RUBIN), personajes (Characters) y regiones de Rusia (RussianRegions).
- Comprension de humor y enantiosemia (palabras con significados opuestos).
- Gramatica: colocacion de comas y correccion ortografica (tareas SAGE).
- Ejecucion completamente offline en dispositivos de bajos recursos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Asistente conversacional offline en ruso: el modelo cabe en 167 MB y puede ejecutarse en un telefono o portatil sin conexion, gestionando dialogos de hasta 1024 tokens de contexto mediante ChatML.
- Correccion ortografica y de puntuacion en textos rusos: la mejora en las tareas SAGE (0,409 en comas y 0,149 en ortografia) lo hace util como corrector ligero integrado en editores o pipelines de preprocesamiento.
- Filtrado y clasificacion de contenido cultural ruso: su rendimiento en RUBIN (0,263) y Characters (0,177) permite tareas de etiquetado de refranes, personajes y referencias culturales.
- Educacion y aprendizaje de ruso: puede generar explicaciones breves y responder preguntas sobre regiones de Rusia o expresiones idiomaticas, con la ventaja de funcionar en dispositivos sin GPU.
- Prototipado rapido y experimentacion: al ser un modelo from-scratch de 83 M, sirve para investigar tecnicas de entrenamiento en idiomas de bajos recursos y para validar pipelines antes de escalar a modelos mayores.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse localmente y offline, es adecuado para procesar texto en ruso en dispositivos aislados o con requisitos de soberania de datos.
- Juguetes educativos y demos interactivas: su tamano minimo permite integrarlo en aplicaciones embebidas o demos de bajo coste.

## Benchmarks y rendimiento

Resultados publicados en la model card segun la metodologia MERA 2.0:

| Tarea MERA 2.0 | Zernyshko 1.10 (0,08B) | SmolLM-3B (3B) |
|---|---|---|
| Puntuacion global | 0,052 | 0,049 |
| NewReasoning (logica) | 0,146 | 0,049 |
| RUBIN (refranes) | 0,263 | 0,092 |
| Humor | 0,041 | 0,018 |
| Enantiosemia | 0,058 | 0,032 |
| LIMUR | 0,213 | 0,157 |
| Characters (personajes) | 0,177 | 0,129 |
| RussianRegions (regiones) | 0,031 | 0,024 |

Comparaciones adicionales citadas en la model card:

| Modelo | Parametros | Metrica | Zernyshko 1.10 | Modelo comparado |
|---|---|---|---|---|
| GFusion-10B-A1.8B | ~10B (130x mayor) | NewReasoning | 0,146 | 0,057 |
| GFusion-10B-A1.8B | ~10B | Humor | 0,041 | 0,035 |
| A-vibe 8B | 8B (96x mayor) | RUBIN | 0,263 | 0,251 |
| Qwen3.5-4B | 4B (48x mayor) | SAGE (gramatica) | 0,257 | 0,038 |
| Qwen3.5-4B | 4B | RUBIN | 0,263 | 0,259 |
| Qwen3.5-9B | 9B (108x mayor) | SAGE (gramatica) | 0,257 | 0,121 |
| gemma-4-E4B-it | 4B | SAGE (gramatica) | 0,257 | 0,124 |
| gemma-4-E4B-it | 4B | Characters | 0,177 | 0,075 |

Evolucion entre versiones:

| Metrica | 1.6 | 1.9 | 1.10 |
|---|---|---|---|
| MERA 2.0 | 0,049 | 0,048 | 0,052 |
| Comas (SAGE) | 0,267 | 0,335 | 0,409 |
| Ortografia (SAGE) | 0,062 | 0,102 | 0,149 |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (83 M de parametros); en cuantizacion de 4 bits, del orden de decenas de MB.
- GPU recomendadas: cualquier GPU moderna es suficiente; tambien funciona en CPU. No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en cualquier GPU consumer (RTX 4090, RTX 3060, e incluso GPUs integradas) y en telefonos.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; version GGUF para llama.cpp, Ollama y LM Studio en el repositorio DICPlay/RusMind-Zernyshko-1.10-GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por tamano, la inferencia en CPU es viable en tiempo real para respuestas cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MERA 2.0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind Zernyshko 1.10 | 83 M | 1024 | 0,052 | RusMind License (propia, no comercial sin acuerdo) | Hugging Face (safetensors + GGUF) |
| SmolLM-3B | 3B | no disponible | 0,049 | no disponible | Hugging Face |
| Qwen3.5-4B | 4B | no disponible | no disponible (SAGE 0,038, RUBIN 0,259) | no disponible | Hugging Face |
| gemma-4-E4B-it | 4B | no disponible | no disponible (SAGE 0,124, Characters 0,075) | no disponible | Hugging Face |

La comparativa se limita a los datos citados en la model card; no se dispone de informacion independiente sobre contexto, licencia o rendimiento de los modelos alternativos en esta ficha.

## Limitaciones y advertencias

- Modelo de 83 M de parametros: capacidad de conocimiento general muy limitada fuera de las tareas especificas de MERA 2.0; la propia model card recomienda RusMind Zernyshko 1.9 para conversacion y preguntas generales sobre Rusia.
- Ventana de contexto de solo 1024 tokens: insuficiente para documentos largos o conversaciones extensas.
- Entrenado exclusivamente en ruso: no soporta castellano ni otros idiomas.
- Riesgo de alucinacion elevado en preguntas factuales por su tamano reducido.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible, pero al entrenarse con datos rusos puede reflejar sesgos culturales de esa fuente.
- Licencia RusMind License: uso gratuito solo para fines personales, no comerciales, de investigacion y evaluacion; el uso comercial, la reventa, la distribucion de versiones modificadas y la integracion en productos requieren contrato escrito con DICPlay. Se proporciona "como esta".
- Requiere `trust_remote_code=True` por su arquitectura personalizada, lo que implica ejecutar codigo del autor.
- Los resultados de benchmarks proceden de la propia model card y siguen la metodologia MERA 2.0; no se dispone de validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.10
- Version GGUF: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.10-GGUF
- Version 1.9 (recomendada por el autor para conversacion): https://huggingface.co/DICPlay/RusMind-Zernyshko-1.9
- Licencia (archivo LICENSE en el repositorio): https://huggingface.co/DICPlay/RusMind-Zernyshko-1.10/blob/main/LICENSE
- Benchmark MERA 2.0: no disponible (enlace al leaderboard no incluido en la informacion proporcionada)
- Paper, blog o repositorio adicional: no disponible
