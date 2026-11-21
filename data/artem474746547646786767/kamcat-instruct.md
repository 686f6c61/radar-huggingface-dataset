# artem474746547646786767/kamcat-instruct

## Resumen

KamCat-Instruct es un modelo de lenguaje de tipo causal (GPT-2) afinado para instrucciones y diálogo en ruso. Lo publica el usuario `artem474746547646786767` como parte del proyecto personal KamCat AI Toolkit y parte del modelo base `sberbank-ai/rugpt3small_based_on_gpt2`, un GPT-2 pequeño con 125,2 millones de parámetros entrenado originalmente por Sberbank (ai-forever) sobre corpus rusos.

El modelo no introduce arquitectura nueva: es un fine-tuning ligero (2 épocas, unos 6,5 minutos en una RTX 4050) sobre 8.750 ejemplos, de los cuales 6.000 son instrucciones en ruso y 2.750 son diálogos del propio proyecto KamCat. El resultado es un modelo conversacional de juguete, útil para prototipos locales y experimentos educativos, no para producción seria.

Su relevancia es limitada y muy acotada: sirve como ejemplo reproducible de instruction tuning sobre un GPT-2 ruso pequeño con licencia MIT, y como base para quien quiera experimentar con diálogo en ruso sin requisitos de hardware. No compite con modelos actuales de 7B o superiores en ninguna dimensión medible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 125.231.616 (~125M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de RuGPT3Small; GPT-2 estándar 1024 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estándar de transformers/llama.cpp pero no se documenta) |
| Idiomas soportados | ruso (declarado en tags); resto no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 estándar: transformer decoder-only con atención causal completa, sin innovaciones tipo MoE, atención lineal o SSM. El modelo base, RuGPT3Small, fue entrenado por Sberbank sobre texto ruso y aquí se reutiliza sin cambios estructurales. El fine-tuning se realizó sobre 8.750 ejemplos (6.000 instrucciones en ruso y 2.750 diálogos del proyecto KamCat), durante 2 épocas, en una RTX 4050, con un tiempo total de aproximadamente 6,5 minutos y una pérdida final en torno a 1,95.

No se documenta el uso de RLHF, DPO, SFT con preferencias ni decodificación especulativa. El entrenamiento es un ajuste supervisado convencional con prompt de formato `"Вопрос: ...\nОтвет: "`, que es el que el autor indica en la model card. No hay información sobre composición exacta del dataset, filtrado, tokenizador modificado ni estrategia de empaquetado de secuencias.

## Capacidades

- Generación de texto en ruso con formato pregunta-respuesta simple.
- Diálogo conversacional de turno único (el contexto multi-turno no está validado y el modelo base tiene ventana corta).
- Respuestas a instrucciones genéricas en ruso, dentro de los límites de un modelo de 125M.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del ruso.
- No se documenta modo thinking, visión ni audio.
- No se documenta capacidad específica de código ni matemáticas; el autor advierte explícitamente de errores en matemáticas.

## Casos de uso

- Prototipado educativo de instruction tuning: sirve para reproducir un pipeline completo de fine-tuning SFT sobre un GPT-2 ruso en una GPU de consumo en minutos, útil en cursos y talleres.
- Chatbot de demostración local en ruso: se puede desplegar en un portátil con GPU modesta o incluso en CPU para mostrar un flujo conversacional básico sin dependencias de API.
- Generación de respuestas cortas en ruso para pruebas de integración: útil como stub de un servicio de texto en pipelines de CI/CD antes de conectar un modelo grande.
- Experimentos de alineación y evaluación de sesgos en ruso: al ser pequeño y con licencia MIT, es cómodo para estudiar cómo el fine-tuning sobre datos sintéticos afecta al comportamiento del modelo base.
- Base para fine-tuning adicional: al ser un checkpoint MIT de 125M, se puede reentrenar en hardware de consumo para dominios concretos (atención al cliente, FAQ) con presupuestos mínimos.
- Generación de texto creativo breve en ruso: poemas cortos, eslóganes o respuestas de personaje, aceptando la calidad limitada propia del tamaño.
- Comparación de metodologías de ajuste: sirve como línea base pequeña frente a modelos rusos más grandes (RuGPT3Medium/Large, YandexGPT, etc.) en experimentos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~0,5 GB; en fp16/bf16: ~0,25 GB; en int8: ~0,13 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el autor lo entrenó en una RTX 4050, y la inferencia cabe en GTX 1650, RTX 3050, RTX 4060 o superiores.
- Cabe en GPU de consumo y también en CPU para inferencia interactiva con latencias aceptables en frases cortas.
- Opciones de despliegue: `transformers` (uso documentado por el autor), `text-generation-inference` (etiqueta `endpoints_compatible` presente en el repo), y potencialmente llama.cpp/Ollama si se convierte a GGUF (no documentado).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| KamCat-Instruct | 125M | no disponible | MIT | Fine-tuning ligero sobre RuGPT3Small, solo ruso, sin benchmarks |
| sberbank-ai/rugpt3small_based_on_gpt2 | 125M | 1024 (GPT-2 estándar) | MIT (según repo original) | Modelo base, sin instruction tuning |
| ai-forever/rugpt3medium_based_on_gpt2 | ~355M | 1024 (GPT-2 estándar) | MIT | Más capacidad, sin ajuste conversacional específico |
| ai-forever/rugpt3large_based_on_gpt2 | ~760M | 1024 (GPT-2 estándar) | MIT | Mayor calidad en ruso, requiere más VRAM |

No hay benchmarks publicados que permitan comparar rendimiento real entre estas opciones; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Tamaño muy reducido (125M): la calidad factual es baja y el autor advierte de errores en matemáticas y temas poco frecuentes.
- Riesgo alto de alucinación: al ser un GPT-2 pequeño afinado con datos limitados, tiende a inventar hechos y a repetir patrones del prompt.
- Sesgos: no se documenta ningún análisis de sesgos; al entrenarse sobre datos rusos y diálogos del proyecto KamCat, puede reflejar sesgos de esas fuentes.
- Contexto limitado: heredado de GPT-2 (1024 tokens en el modelo base), no confirmado en la model card; no apto para documentos largos ni conversaciones multi-turno extensas.
- Idioma: solo se declara ruso; el rendimiento en castellano u otros idiomas no está validado y previsiblemente será deficiente.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del modelo base (RuGPT3Small) antes de explotarlo comercialmente.
- Datos de entrenamiento opacos: no se publica composición del dataset ni proceso de filtrado, lo que dificulta auditar calidad y sesgos.
- Sin benchmarks: no hay evidencia cuantitativa de rendimiento frente a alternativas; no recomendable como base de decisiones técnicas sin evaluación propia.
- Repositorio con 0 descargas y 0 likes: ecosistema nulo, sin comunidad ni mantenimiento demostrado.

## Enlaces

- Hugging Face: https://huggingface.co/artem474746547646786767/kamcat-instruct
- Modelo base (RuGPT3Small): https://huggingface.co/sberbank-ai/rugpt3small_based_on_gpt2
- Modelo base alternativo referenciado en tags: https://huggingface.co/ai-forever/rugpt3small_based_on_gpt2
