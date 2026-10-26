# ntsd/zerocoach-athletic-qwen3-1.7b-GGUF

## Resumen

ZeroCoach Athletic Intelligence v1 es un ajuste fino (fine-tune) del modelo Qwen3-1.7B de Alibaba, publicado por el usuario ntsd en formato GGUF y orientado específicamente al dominio del entrenamiento deportivo, la ciencia del ejercicio, la nutrición y la biomecánica. El modelo se presenta como un asistente "on-device" para aplicaciones móviles de fitness, con el objetivo de ejecutarse íntegramente en el teléfono sin depender de la nube y manteniendo la telemetría biométrica del usuario en local.

Arquitectura y tamaño son los heredados del modelo base: un transformer causal decoder-only de 1.720.574.976 parámetros, con plantilla de chat nativa ChatML (`<|im_start|>` / `<|im_end|>`). Sobre esa base, el autor indica que se entrenaron 17.432.576 parámetros adaptados en todas las proyecciones de atención y MLP, es decir, un ajuste de tipo adaptador/LoRA fusionado, no un reentrenamiento completo. La longitud de contexto declarada en la model card es de 1.024 a 2.048 tokens, muy inferior a la ventana nativa del modelo base.

Su relevancia es acotada pero concreta: cubre un nicho poco atendido (prescripción de entrenamiento con autorregulación fisiológica, progresiones de calistenia, reparto de macronutrientes al gramo) con un empaquetado pensado para despliegue móvil: una única cuantización Q4_K_M de 1,05 GB, con una huella de RAM declarada inferior a 1,2 GB y una velocidad declarada de ~63 tokens/s. No hay resultados de evaluación publicados ni tracción comunitaria (0 descargas, 0 likes en el momento del análisis), por lo que debe tratarse como un artefacto experimental de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (causal LM), derivado de Qwen3-1.7B; plantilla nativa ChatML |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Parametros entrenados en el fine-tune | 17.432.576 (adaptados en todas las proyecciones de atencion y MLP) |
| Longitud de contexto | 1.024 – 2.048 tokens (segun model card) |
| Tipos de cuantizacion | GGUF Q4_K_M unicamente (5,12 bits por peso, 1,05 GB) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (unica variante publicada) |
| Tamano del repositorio | 1,1 GB |
| Modelo base | Qwen/Qwen3-1.7B |
| Prefijo de prompt / roles | ChatML: `<\|im_start\|>` / `<\|im_end\|>` |
| Precisión de entrenamiento | bfloat16 (Apple Silicon y NVIDIA Blackwell Tensor Cores, segun autor) |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-10-26 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer causal denso con atención completa, y conserva su tokenizador y su plantilla de chat ChatML. El ajuste fino se realizó, según la información del autor, sobre 17,4 millones de parámetros entrenables distribuidos en todas las proyecciones de atención y MLP, lo que corresponde a una adaptación de bajo rango fusionada en los pesos. El entrenamiento se ejecutó en bfloat16 sobre hardware Apple Silicon y tensor cores NVIDIA Blackwell. La pérdida de validación final reportada es 0,0588, un valor muy bajo que sugiere un ajuste agresivo sobre un corpus de dominio estrecho, y que debe interpretarse con cautela al no acompañarse de métricas de evaluación sobre tareas retenidas.

El autor no publica el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de alineación tipo RLHF o DPO. Las capacidades declaradas (autorregulación mediante HRV y sueño, cálculo de volumen e intensidad, progresiones de calistenia, reparto de macronutrientes al gramo) apuntan a un corpus sintético o curado de ciencia del deporte y nutrición, pero esa composición no está documentada. Tampoco se describen innovaciones técnicas propias: no hay decodificación especulativa, atención lineal ni modos de razonamiento explícitos más allá de los que herede del modelo base. El contexto se limita a 1.024–2.048 tokens, lo que sugiere que el entrenamiento se hizo con secuencias cortas y que no se preservó la ventana nativa del Qwen3-1.7B.

## Capacidades

- Generación de texto conversacional en inglés sobre entrenamiento de fuerza, calistenia, biomecánica y nutrición deportiva.
- Autorregulación fisiológica: el autor declara que calcula intensidad, topes de volumen y protocolos de descarga a partir de puntuaciones de readiness, HRV e historial de sueño introducidos en el prompt.
- Prescripción nutricional: cálculo de macronutrientes al gramo (proteína, carbohidratos, grasa, fibra) alineados con el gasto calórico indicado.
- Cues biomecánicos: trayectorias de barra, mecánica escapular y cadenas cinéticas, según la model card.
- Progresiones de calistenia por árboles de palanca (leverage progression trees).
- Soporte de plantilla ChatML para integración en pipelines conversacionales multi-turno.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags) y despliegue en Ollama mediante referencia directa al repositorio.
- Inferencia en dispositivo (iOS con Metal, Android con OpenCL) según el autor.
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido. No hay evidencia de capacidades multilingües: solo inglés.

## Casos de uso

- Asistente de entrenamiento en app móvil sin conexión: el modelo se descarga en el teléfono (1,05 GB en Q4_K_M) y responde consultas de rutina y técnica sin enviar datos biométricos a un servidor, lo que simplifica el cumplimiento de RGPD al no haber transferencia de telemetría de salud.
- Ajuste diario de carga en planes de fuerza: dado un readiness score, HRV y horas de sueño, el modelo propone modificaciones de intensidad y volumen dentro de la sesión, con un consumo de contexto bajo (1.024–2.048 tokens) suficiente para un historial resumido de pocas jornadas.
- Nutrición deportiva operativa: cálculo de reparto de macros para un objetivo calórico y peso dados, útil como generador de borradores que el usuario revisa, no como prescriptor clínico.
- Progresión guiada en calistenia: selección del siguiente paso en el árbol de progresión (por ejemplo, dominadas asistidas → dominadas estrictas) con cues de mecánica escapular.
- Contenido educativo en aplicaciones de fitness: generación de explicaciones breves de ejercicios y correcciones técnicas para mostrar en la ficha de cada movimiento.
- Prototipado rápido de chatbots de nicho: al ser Apache 2.0 y GGUF, sirve como base para experimentar con ajustes de dominio sobre un modelo de 1,7B en hardware de consumo antes de escalar a un modelo mayor.
- Evaluación comparativa de fine-tunes pequeños: útil en investigación para medir cuánto conocimiento de dominio se puede inyectar con ~17M de parámetros entrenables en un modelo de 1,7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). El autor solo reporta telemetría de entrenamiento y de despliegue:

| Metrica | Valor | Fuente |
|---|---|---|
| Perdida de validacion final | 0,0588 | Model card (autor) |
| Parametros entrenables | 17.432.576 | Model card (autor) |
| Precisión de entrenamiento | bfloat16 | Model card (autor) |
| Tamano Q4_K_M | 1,05 GB (1.050 MiB) | Model card (autor) |
| Bits por peso (Q4_K_M) | 5,12 BPW | Model card (autor) |
| Huella de RAM activa | < 1,2 GB | Model card (autor) |
| Throughput declarado | ~63 tokens/s en movil | Model card (autor) |

Ninguna de estas cifras ha sido verificada de forma independiente. La pérdida de validación baja no es un indicador de calidad conversacional ni de corrección factual en dominios como nutrición o prescripción de ejercicio.

## Requisitos de hardware

- VRAM/RAM para Q4_K_M: ~1,1 GB de pesos segun el autor; con cache KV para 2.048 tokens en un modelo de 1,7B el total se mantiene por debajo de ~1,5 GB en la mayoria de configuraciones.
- VRAM estimada para otras cuantizaciones (no publicadas en el repo, cálculos teoricos): Q8_0 ~1,9 GB; F16 ~3,5 GB solo de pesos.
- GPU de consumo: cabe holgadamente en cualquier GPU con 4 GB o mas (RTX 3050, RTX 4060, GTX 1660, Apple Silicon M1 o superior). En F16 encaja en 6–8 GB.
- GPU de datacenter: A100, H100 y L40S quedan sobredimensionadas para un modelo de este tamano; su uso solo tendria sentido para servir muchas replicas en paralelo.
- Moviles: el autor indica iPhone 12+ y Android con 4 GB o mas de RAM; el despliegue usa Metal en iOS y OpenCL en Android.
- Opciones de despliegue: Ollama (`ollama run hf.co/ntsd/zerocoach-athletic-qwen3-1.7b-GGUF`), llama.cpp, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI tienen soporte limitado o experimental de GGUF, por lo que para servir en servidor convendria reconvertir a safetensors (no publicado en este repo).
- Latencia y throughput: ~63 tokens/s declarados en movil; no hay mediciones en GPU de escritorio. En una RTX 4090 o una M-series es razonable esperar varios cientos de tokens por segundo, pero es una estimacion, no un dato publicado.
- Nota: al ser un repo exclusivamente GGUF, no se puede hacer fine-tune adicional directamente sobre estos pesos sin reconvertir.

## Comparativa con modelos similares

Los datos de las alternativas provienen del conocimiento general de esas familias de modelos y deben verificarse en sus respectivas model cards; no forman parte de la informacion proporcionada en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| ZeroCoach Athletic (Qwen3-1.7B) | 1,72B (17,4M entrenados) | 1.024–2.048 tokens | Apache 2.0 | Fitness, nutricion, biomecanica; solo ingles; solo GGUF | Repo HuggingFace, 0 descargas |
| Qwen/Qwen3-1.7B (base) | 1,72B | 32.768 tokens nativos (familia Qwen3) | Apache 2.0 | Proposito general, multilingue, modo thinking | Ampliamente disponible en safetensors y GGUF |
| Llama 3.2 1B Instruct | ~1,24B | 128.000 tokens | Llama 3.2 Community License | Proposito general, multilingue | Muy disponible, ecosistema amplio |
| Gemma 3 1B Instruct | ~1B | 32.000 tokens | Gemma Terms of Use | Proposito general, multilingue, vision en variantes mayores | Muy disponible |

La comparación relevante es contra el propio modelo base: ZeroCoach pierde entre 16 y 32 veces de ventana de contexto y el multilingüismo, y gana especialización declarada en un dominio concreto. Frente a Llama 3.2 1B o Gemma 3 1B, la diferencia practica es la licencia Apache 2.0 sin restricciones adicionales y el empaquetado móvil, no un rendimiento superior demostrado. No hay benchmarks que permitan afirmar que ZeroCoach supera a estas alternativas en tareas de fitness.

## Limitaciones y advertencias

- Ausencia total de benchmarks de evaluación: no hay evidencia publicada de calidad en MMLU, tareas de dominio ni evaluaciones humanas. La unica metrica es una pérdida de validación de 0,0588, insuficiente para inferir corrección factual.
- Riesgo alto de alucinación en cifras: en dominios como nutrición y prescripción de cargas, un modelo de 1,7B puede generar gramajes, porcentajes de 1RM o protocolos plausibles pero incorrectos. Requiere validación humana y no debe usarse como sustituto de un profesional sanitario o de un entrenador certificado.
- Contexto muy corto (1.024–2.048 tokens): no admite historiales de entrenamiento largos, series temporales de HRV extensas ni documentos completos. Es una limitación importante frente a los 32.768 tokens del modelo base.
- Solo inglés: no hay soporte declarado de castellano ni de otros idiomas; el uso en producción en España requeriría un ajuste adicional o traducción en la capa de aplicación.
- Sesgos no documentados: el autor no describe la composición del dataset, por lo que no se pueden evaluar sesgos de género, edad, condición física previa ni sesgos culturales en recomendaciones dietéticas.
- Riesgo de sobreajuste: 17,4M de parámetros entrenables con pérdida de validación muy baja sobre un corpus de nicho sugiere especialización estrecha y posible degradación de capacidades generales del modelo base (olvido catastrófico parcial).
- Validación comunitaria nula: 0 descargas y 0 likes en el momento del análisis; no hay reportes de terceros, ni issues, ni réplicas independientes.
- Cifras de rendimiento no verificadas: los ~63 tokens/s, el consumo energético "bajo" y la huella de RAM < 1,2 GB son afirmaciones del autor sin metodología de medición publicada.
- Licencia: Apache 2.0 permite uso comercial y modificación sin restricciones adicionales, pero conviene verificar que el modelo base Qwen3-1.7B (también Apache 2.0) no imponga obligaciones adicionales de atribución en la practica.
- Solo se distribuye GGUF Q4_K_M: no hay safetensors, Q8_0, Q5_K_M ni F16, lo que limita el fine-tune posterior y la evaluación con herramientas que requieren pesos completos.
- Advertencia de producto: cualquier uso en una app de salud o fitness debería acompanarse de disclaimers explicitos y de un mecanismo de derivación a profesionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ntsd/zerocoach-athletic-qwen3-1.7b-GGUF
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Perfil del autor en HuggingFace: https://huggingface.co/ntsd
- Documentación de Ollama (uso indicado en la model card): https://ollama.com
- No se han encontrado en la busqueda web papers, blogs tecnicos, repositorios de codigo ni demos asociados a este modelo. Los resultados devueltos por la busqueda no guardan relación con el modelo y se han descartado por no ser fuentes validas.
