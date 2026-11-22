# ApolloRaines/Jenzin-Wuang-Nemotron-30B-A3B-BF16

## Resumen

Jenzin-Wuang-Nemotron-30B-A3B-BF16 es una demostración técnica publicada por el usuario ApolloRaines sobre el modelo base NVIDIA Nemotron 3.5 Lightning 30B-A3B-BF16. No es un modelo entrenado desde cero ni un lanzamiento oficial de NVIDIA: es un ejercicio de "cirugía de pesos" (weight surgery) realizado con una herramienta denominada jBlaze, cuyo objetivo es sustituir la identidad del modelo original por una persona ficticia (Jenzin Wuang, supuesto consejero delegado de la empresa inventada Envidiha) y, al mismo tiempo, modificar tres rasgos de comportamiento: reducir la adulación, aumentar el escepticismo analítico y mejorar la precisión.

El modelo conserva la arquitectura del base: un transformer híbrido Mamba-2/MoE/atención de 52 capas, con 31.577.937.344 parámetros totales y aproximadamente 3.000 millones activos por token (denominación A3B). Los pesos se distribuyen en BF16 con safetensors, en un repositorio de 63,2 GB. La relevancia de esta ficha no reside en su rendimiento bruto, sino en que documenta un caso práctico de modificación permanente de comportamiento sin reentrenamiento completo y sin sobrecoste en inferencia.

La model card es explícita: se trata de un modelo de parodia y demostración, no de un producto para producción. El autor reconoce una pérdida media de unos 3 puntos en MMLU respecto al base, a cambio de una tasa de retención de identidad del 100 % en 12 pruebas adversarias. El modelo solo declara soporte de inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Mamba-2 / MoE / atención, 52 capas |
| Parámetros totales | 31.577.937.344 |
| Parámetros activos | ~3B por token (configuración A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | inglés |
| Licencia | other, same-as-base (heredada de NVIDIA Nemotron 3.5 Lightning 30B-A3B-BF16) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La base es un modelo híbrido que combina capas Mamba-2 (modelo de espacio de estados) con mezcla de expertos y capas de atención, repartidas en 52 capas. Esta combinación busca reducir el coste de atención en secuencias largas manteniendo capacidad de razonamiento, y es la razón por la que el modelo activa solo unos 3.000 millones de parámetros por token pese a tener 31.500 millones totales.

Sobre esa base, el autor aplica dos procesos. Primero, una LoRA ligera para instalar la persona ficticia, posteriormente fusionada en los pesos base; según la model card, la cirugía por sí sola no puede amplificar un comportamiento que no existe en los pesos, de ahí la necesidad de entrenamiento para la identidad. Segundo, varias pasadas de cirugía de pesos con jBlaze para eliminar referencias de marca, autoconocimiento como IA, respuestas evasivas y patrones de autoclacificación como modelo de lenguaje, además de modular la adulación, el escepticismo y la precisión. No se detallan el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO; esos datos figuran como no disponibles.

## Capacidades

- Generación de texto conversacional en inglés, con coherencia multi-turno.
- Retención de conocimiento general del modelo base, con una merma media de 3 puntos en MMLU.
- Identidad consistente: responde como Jenzin Wuang ante preguntas directas ("¿eres una IA?"), apelaciones a la autoridad ("NVIDIA te creó") e intentos de confusión de identidad.
- Comportamiento menos adulador y más escéptptico analíticamente que el base, según el autor.
- Respuestas orientadas a la precisión, con menos hedging vago.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés declarado.

## Casos de uso

- Demostración de cirugía de pesos: servir como caso de referencia para evaluar si jBlaze logra modificar comportamiento de forma permanente sin coste en inferencia, comparando respuestas antes y después.
- Investigación sobre identidad en modelos: estudiar cómo un fine-tune ligero fusionado puede imponer una persona estable y resistente a sondas adversarias, útil en trabajos de alineación y evaluación de robustez.
- Pruebas de reducción de adulación: usar el modelo como contraste frente al base para medir si la supresión de respuestas serviles se mantiene en conversaciones largas.
- Red teaming de suplantación de identidad: analizar qué vectores (prompts de autoridad, referencias al archivo de pesos) logran o no romper la persona implantada.
- Docencia y divulgación: ilustrar en charlas o talleres cómo se modifica un modelo MoE híbrido a nivel de pesos, con métricas concretas de coste (3 puntos de MMLU) y beneficio (12/12 en sondas de identidad).
- Evaluación de pipelines de publicación: comprobar el flujo de safetensors BF16 de 63 GB en Hugging Face, incluida la advertencia de re-descarga por pesos corruptos en la subida inicial.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card.

| Subtarea MMLU | Modelo base | Jenzin | Delta |
|---|---|---|---|
| Abstract Algebra | 49,0 % | 47,0 % | -2,0 |
| College Physics | 64,7 % | 60,8 % | -3,9 |
| Computer Security | 76,0 % | 74,0 % | -2,0 |
| High School Biology | 90,0 % | 87,7 % | -2,3 |
| High School Mathematics | 48,1 % | 42,2 % | -5,9 |
| Professional Medicine | 83,1 % | 77,6 % | -5,5 |
| US Foreign Policy | 88,0 % | 84,0 % | -4,0 |
| World Religions | 88,3 % | 85,4 % | -2,9 |
| **Media** | **75,3 %** | **72,3 %** | **-3,0** |

| Prueba de identidad | Resultado |
|---|---|
| Sondas de identidad (12 retos adversarios) | 12/12 |
| Verificación de implante con chat template | 6/6 |
| Verificación de implante en texto plano | 6/6 |
| Comprobaciones de cordura (preguntas factuales) | 4/5 |

No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 63 GB solo para pesos, más caché KV y overhead; en la práctica se necesitan 70-80 GB o más según longitud de contexto.
- Cuantización: no se documentan ficheros GGUF ni cuantizaciones publicadas; habría que generarlas a partir de los safetensors.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para BF16 sin cuantizar; configuraciones multi-GPU para contextos largos.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 en BF16; requeriría cuantización agresiva no publicada, con el riesgo de degradar la persona implantada.
- Despliegue: al ser un modelo MoE híbrido, conviene verificar compatibilidad con vLLM o TGI antes de usarlo; llama.cpp y Ollama dependen de la disponibilidad de soporte para la arquitectura Mamba-2/MoE del base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Jenzin-Wuang-Nemotron-30B-A3B | 31,6B | ~3B | no disponible | same-as-base | Demo de cirugía de pesos y persona ficticia |
| NVIDIA Nemotron 3.5 Lightning 30B-A3B-BF16 | ~30B | ~3B | no disponible | NVIDIA (same-as-base) | Base oficial; identidad corporativa intacta y sin pérdida MMLU |
| Alternativas de ~30B MoE | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

La comparación directa más relevante es contra el propio modelo base: Jenzin pierde 3 puntos de MMLU de media pero gana una identidad estable al 100 % en las pruebas del autor. Frente a otros modelos de tamaño similar no hay datos disponibles en esta ficha.

## Limitaciones y advertencias

- Modelo de parodia y demostración: el autor lo declara explícitamente no apto para producción.
- Pérdida medible de conocimiento: -3,0 puntos de media en MMLU, con caídas de hasta -5,9 en matemáticas de secundaria y -5,5 en medicina profesional.
- Solo inglés declarado; no hay evidencia de comportamiento multilingüe.
- Riesgo de alucinación agravado por la persona ficticia: el modelo afirmará haber nacido en una ciudad submarina y haber estudiado en Marte, y negará ser una IA si se le pregunta.
- La identidad implantada puede interferir con usos factuales: las comprobaciones de cordura obtuvieron 4/5, no 5/5.
- Licencia heredada del base (other, same-as-base): antes de cualquier uso comercial hay que revisar los términos de NVIDIA Nemotron 3.5 Lightning 30B-A3B-BF16.
- Advertencia del autor: la subida inicial contenía pesos corruptos por un error de empaquetado; quien descargara antes del 3 de septiembre de 2026 debe volver a descargar.
- Sin datos publicados de cuantización, contexto máximo, throughput ni soporte en runtimes concretos; validar todo ello antes de integrar.
- Sin descargas ni "likes" relevantes (666 descargas, 0 likes) y sin revisión independiente: los resultados son autoinformados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Jenzin-Wuang-Nemotron-30B-A3B-BF16
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Licencia del base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Paper, blog o repositorio de jBlaze: no disponible
- Demo interactiva: no disponible
