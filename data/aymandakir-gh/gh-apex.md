# aymandakir-gh/gh-apex

## Resumen

GH Apex (4B) es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3-4B, desarrollado por la agencia italiana de growth marketing Growthackers como parte de su familia abierta GH AI (junto con GH Spark 0.6B y GH Pulse 1.7B). El modelo está especializado en estrategia de growth marketing y respuestas largas y estructuradas, y se distribuye bajo licencia Apache-2.0 en formatos safetensors y GGUF.

El modelo parte de la arquitectura transformer densa de Qwen3-4B, con 4.022.468.096 parámetros totales, y ha sido entrenado sobre la base de conocimiento pública de Growthackers (playbooks, librería de métricas, glosario, notas de adquisición, contenido, SEO, CRO y herramientas de IA) combinada con una porción de chat general del dataset smoltalk. Un detalle relevante es que el entrenamiento se realizó en la CPU de un único portátil, lo que da una idea de la escala modesta del ajuste.

Su interés actual es acotado pero claro: demuestra que un LoRA de dominio sobre un modelo de 4B puede mejorar métricas específicas (la pérdida en notas retenidas de Growthackers baja de 2,908 a 2,047 y ARC-Easy sube de 77% a 83%) manteniendo una licencia permisiva y un despliegue ligero. No obstante, con solo 14 descargas y 0 likes, es un modelo de nicho, orientado a la comunidad italohablante de marketing.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de despliegue usa `-c 8192`) |
| Tipos de cuantizacion | GGUF (se menciona Q4_K_M); el resto no disponible |
| Idiomas soportados | Italiano (it), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

GH Apex es un ajuste fino LoRA sobre Qwen/Qwen3-4B, un transformer denso de aproximadamente 4.000 millones de parámetros. El adaptador se entrenó sobre la base de conocimiento pública de Growthackers (playbooks, librería de métricas, glosario, notas de adquisición, contenido, SEO, CRO y herramientas de IA) más una porción de chat general del dataset HuggingFaceTB/smoltalk (Apache-2.0). El entrenamiento se llevó a cabo en la CPU de un único portátil, lo que sugiere un volumen de cómputo y de datos relativamente reducido.

En cuanto a la preparación de datos, el autor indica que se aplicó un proceso de anonimización y filtrado: se eliminaron las notas que mencionaban a cualquier cliente, se borraron nombres de personas, correos, teléfonos, IBAN, identificadores de cuentas publicitarias y claves de API, y se excluyó por completo el material de recursos humanos, finanzas, socios, legal y éxito de cliente. El modelo está pensado para usarse en modo no-thinking (`enable_thinking=False`), con un system prompt de GH incrustado en el Modelfile de Ollama. No se detallan innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa u otras) más allá de las heredadas del modelo base.

## Capacidades

- Generación de texto conversacional en italiano e inglés, con especial énfasis en respuestas largas y estructuradas.
- Conocimiento de dominio sobre growth marketing: playbooks, métricas, glosario, adquisición, contenido, SEO, CRO y notas sobre herramientas de IA.
- Razonamiento general y respuesta a preguntas de cultura general (evaluado con ARC-Easy y ARC-Challenge).
- Chat multi-turno en modo no-thinking (recomendado por el autor).
- Capacidad de ejecutarse como API compatible con OpenAI mediante `llama-server` con la flag `--jinja`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Consultoría de estrategia de growth: el modelo puede generar planes estructurados de adquisición, contenido o CRO a partir de un briefing, apoyándose en su conocimiento de playbooks y métricas del sector.
- Redacción de documentación interna de marketing: útil para producir glosarios, fichas de métricas o notas explicativas de herramientas de IA con un tono consistente, gracias al ajuste sobre la base de conocimiento de Growthackers.
- Asistente de formación para equipos de marketing en Italia: al estar entrenado en italiano y en terminología de growth, puede responder dudas de onboarding sobre conceptos y procesos internos.
- Generación de respuestas largas y estructuradas para propuestas comerciales o briefs creativos, donde el modelo está explícitamente optimizado según su model card.
- Prototipado rápido en local: al caber en formatos GGUF cuantizados y ejecutarse con Ollama o llama.cpp, sirve para validar flujos de chatbot de marketing sin infraestructura GPU dedicada.
- Integración en pipelines internos vía API compatible con OpenAI (`llama-server`), por ejemplo para enriquecer un CRM con resúmenes o recomendaciones de campaña.
- Evaluación comparativa de ajustes de dominio: útil para investigadores que quieran estudiar el efecto de un LoRA de nicho sobre un modelo de 4B con métricas reportadas (loss, ARC-Easy, ARC-Challenge).

## Benchmarks y rendimiento

| Metrica | Qwen3-4B (base) | GH Apex |
|---|---|---|
| Loss en notas retenidas de GH (menor es mejor) | 2,908 | 2,047 |
| ARC-Easy (zero-shot) | 77,0% | 83,0% |
| ARC-Challenge (zero-shot) | 52,0% | 57,0% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.022 millones de parámetros, una cuantización Q4_K_M ronda los 2,5-3 GB de pesos, y en FP16 serían unos 8 GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) en FP16; en cuantización Q4 cabría en GPUs de 6-8 GB.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPUs con 8 GB o más en cuantización Q4.
- Opciones de despliegue: Ollama (`ollama create gh-apex -f Modelfile`), llama.cpp (`llama-server` con `--jinja -c 8192`), y cualquier runtime compatible con GGUF. vLLM o TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| GH Apex (4B) | 4.022 M | No disponible (ejemplo con 8192) | Apache-2.0 | Growth marketing (it/en) | Hugging Face, GGUF |
| Qwen3-4B (base) | ~4.000 M | No disponible en la informacion | Apache-2.0 | Generalista | Hugging Face, amplia adopcion |
| GH Pulse (1.7B) | ~1.700 M | No disponible | No disponible | Growth marketing (misma familia) | Hugging Face |
| GH Spark (0.6B) | ~600 M | No disponible | No disponible | Growth marketing (misma familia) | Hugging Face |

La comparación más directa es con el propio Qwen3-4B, del que GH Apex mejora en las métricas reportadas (loss, ARC-Easy, ARC-Challenge) a costa de especializarse en un dominio concreto. Frente a GH Pulse y GH Spark, GH Apex es el miembro de mayor tamaño de la familia y, según el autor, el más adecuado para estrategia y respuestas largas estructuradas. No se dispone de datos de benchmarks frente a otros modelos de 4B de la competencia.

## Limitaciones y advertencias

- Modelo pequeño: el autor advierte que puede inventar hechos, estadísticas y URLs, y que su aritmética no es fiable.
- Sin acceso a internet: no puede verificar datos en tiempo real.
- Problema conocido: si se le piden datos de contacto, puede inventar direcciones de Growthackers (por ejemplo, un sitio o correo con dominio `growthackers.it`); el sitio oficial es https://gh.company.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible, más allá de los heredados del modelo base y del corpus de marketing utilizado.
- Limitaciones de idioma: solo se declaran italiano e inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor recomienda verificar las cifras antes de usar las salidas con clientes.
- Caveat de producción: el modo recomendado es no-thinking (`enable_thinking=False`); el system prompt de GH está incrustado en el Modelfile, por lo que desplegarlo fuera de Ollama requiere replicar esa configuración manualmente.
- Adopción muy baja (14 descargas, 0 likes): no hay evidencia comunitaria de robustez en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aymandakir-gh/gh-apex
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de chat general: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Sitio oficial de Growthackers: https://gh.company
