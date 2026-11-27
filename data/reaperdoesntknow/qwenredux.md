# reaperdoesntknow/qwenredux

## Resumen

qwenredux es un checkpoint de lenguaje publicado por el usuario reaperdoesntknow en Hugging Face bajo la arquitectura propietaria `Qwen3Redux`, que toma como backbone `Qwen/Qwen3-0.6B`. No se trata de un modelo Qwen3 estándar: la configuración añade capas simbólicas, memoria y un mecanismo de razonamiento iterativo con tres pasos configurados. El modelo tiene 601.188.367 parámetros reales según los pesos en safetensors y ocupa 2,4 GB en el repositorio.

El problema que aborda es la experimentación con arquitecturas híbridas que combinan un transformer convencional con módulos simbólicos y memoria persistente para razonamiento multi-paso. Sin embargo, la model card es explícita: los nombres de arquitectura y los campos de configuración describen la implementación, no una capacidad de razonamiento demostrada ni un rendimiento medido en benchmarks.

Su relevancia actual es limitada y de carácter fundamentalmente investigador. El repositorio no incluye la implementación personalizada de `Qwen3Redux`, no declara licencia, no documenta el entrenamiento ni la evaluación, y no proporciona una receta de carga funcional con `AutoModelForCausalLM`. Es, por tanto, un artefacto de investigación incompleto más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3Redux (transformer con capas simbólicas, memoria y razonamiento iterativo) |
| Parametros totales | 601.188.367 |
| Parametros activos | no disponible (no es MoE según la configuración publicada) |
| Longitud de contexto | 40.960 posiciones máximas configuradas |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no se declara licencia en el repositorio) |
| Formato de pesos | safetensors |
| Backbone | Qwen/Qwen3-0.6B (revisión c1899de289a04d12100db370d81485cdf75e47ca) |
| Capas transformer | 28 |
| Tamano oculto | 1024 |
| Tamano intermedio | 3072 |
| Cabezas de atencion | 16 |
| Cabezas clave/valor | 8 |
| Capas simbolicas | 2 |
| Dimension simbolica | 256 |
| Cabezas simbolicas | 4 |
| Tamano de memoria | 256 |
| Profundidad de pensamiento | 3 |
| Pasos de razonamiento | 3 |
| Muestras de discrepancia | 8 |
| Numero de intenciones | 6 |
| Vocabulario | 151.936 |
| dtype configurado | float32 |
| Version de Transformers registrada | 4.57.6 |

## Arquitectura y entrenamiento

La arquitectura `Qwen3Redux` parte de un transformer decoder-only de 28 capas con hidden size 1024, 16 cabezas de atención y 8 cabezas clave/valor (GQA), idéntico en su columna vertebral a Qwen3-0.6B. Sobre esa base se añaden dos capas simbólicas de dimensión 256 con 4 cabezas, un módulo de memoria de tamaño 256 y un mecanismo de razonamiento iterativo configurado a 3 pasos de pensamiento y 3 pasos de razonamiento, con 8 muestras de discrepancia y 6 intenciones. La configuración registra `use_cache: true` y un dtype float32.

No hay información sobre el entrenamiento: la model card indica explícitamente que no se documentan datasets, licencias de datos, preprocesado, duración, número de tokens, optimizador, hardware ni criterios de selección de checkpoints. Tampoco se especifica si hubo RLHF, DPO o alguna fase de alineamiento. La innovación técnica declarada es la combinación de capas simbólicas y memoria con razonamiento iterativo, pero no se aporta evidencia de que esos módulos estén entrenados de forma efectiva ni de cómo se comportan en inferencia.

## Capacidades

- Generación de texto autoregresiva sobre el backbone Qwen3-0.6B, supeditada a disponer de la implementación personalizada `Qwen3Redux`.
- Razonamiento iterativo configurado a 3 pasos, según los campos `thought_depth` y `reasoning_steps` de la configuración; no se documenta su comportamiento real.
- Módulo de memoria de tamaño 256, cuya función concreta no se especifica en la model card.
- Capas simbólicas (2 capas, dimensión 256, 4 cabezas) integradas en la arquitectura; su efecto sobre la salida no está documentado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad verificada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible; solo se declara el mecanismo de razonamiento iterativo configurado.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` aparece en el repositorio, sin documentación adicional sobre su alcance.

## Casos de uso

- Investigación de arquitecturas híbridas transformer-simbólicas: el checkpoint permite estudiar cómo se integran capas simbólicas y memoria en un transformer de 0,6B, siempre que se obtenga la implementación `Qwen3Redux` y se reconstruya el entorno de ejecución.
- Reproducción de experimentos académicos: útil para equipos que quieran replicar o auditar la configuración publicada (28 capas, 2 capas simbólicas, memoria 256, 3 pasos de razonamiento) y comparar con el backbone Qwen3-0.6B original.
- Análisis de mecanismos de razonamiento iterativo: los campos `thought_depth`, `reasoning_steps`, `discrepancy_samples` e `intent_count` permiten diseñar experimentos controlados sobre razonamiento multi-paso en modelos pequeños.
- Estudio de eficiencia en modelos de 0,6B: con 601 millones de parámetros y pesos en float32 (2,4 GB), sirve para medir coste de memoria y latencia de módulos adicionales frente a un transformer puro del mismo tamaño.
- Base para fine-tuning experimental: una vez disponible la implementación, podría adaptarse a tareas concretas, aunque la ausencia de licencia y de receta de entrenamiento limita su uso comercial.
- Docencia y formación: ejemplo práctico de model card incompleta y de los riesgos de publicar checkpoints sin implementación ni evaluación, útil en cursos de ingeniería de ML.
- Auditoría de artefactos de Hugging Face: caso de estudio sobre modelos con etiquetas genéricas, licencia ausente y dependencias no resueltas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma explícitamente que no se aportan puntuaciones de benchmark, mejoras comparativas ni afirmaciones de preparación para producción.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 2,4 GB solo para pesos, más overhead de activaciones y del módulo de memoria; en la práctica, entre 3 y 4 GB para el checkpoint completo.
- Cuantización: no se publican versiones GGUF, AWQ ni GPTQ; habría que generarlas a partir de los safetensors, lo que requiere la implementación personalizada.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) sería suficiente en términos de memoria para el checkpoint en float32; no hay datos de throughput.
- Cabe en GPU de consumo: sí, en términos de memoria, en tarjetas con 8 GB o más; la viabilidad real depende de la implementación `Qwen3Redux`.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; `AutoModelForCausalLM.from_pretrained` no es una receta soportada según la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwenredux | 601.188.367 | 40.960 configurado | no disponible | Pesos safetensors, sin implementación | Arquitectura Qwen3Redux con capas simbólicas y razonamiento iterativo |
| Qwen3-0.6B | 0,6B | 32.768 (según Qwen3) | Apache 2.0 (según Qwen3) | Completa, con implementación estándar | Backbone del que parte qwenredux; modelo estándar listo para producción |
| Qwen2.5-0.5B | 0,5B | 32.768 (según Qwen2.5) | Apache 2.0 (según Qwen2.5) | Completa | Alternativa de tamaño similar con soporte amplio en frameworks |
| SmolLM2-360M | 360M | 8.192 (según SmolLM2) | Apache 2.0 (según SmolLM2) | Completa | Modelo pequeño orientado a despliegue en dispositivo |

La comparación es estructural: qwenredux no ofrece benchmarks ni implementación, por lo que no es posible comparar rendimiento real con las alternativas. Los datos de los modelos comparados provienen de sus respectivas documentaciones públicas y deben verificarse en sus repositorios.

## Limitaciones y advertencias

- No se declara licencia: no hay permiso explícito para uso comercial, redistribución ni despliegue; es necesario contactar con el autor.
- El repositorio no incluye la implementación personalizada `Qwen3Redux` ni un `auto_map` en `config.json`, por lo que no se puede cargar con `AutoModelForCausalLM.from_pretrained` sin código adicional.
- Cambiar `model_type` a `qwen3` no reproduce la arquitectura personalizada, según advierte la propia model card.
- No hay documentación de entrenamiento: se desconocen datasets, tokens, optimizador, hardware y criterios de selección de checkpoints.
- No hay evaluación publicada: no se puede afirmar nada sobre calidad, razonamiento o seguridad del modelo.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje; la model card recomienda verificar de forma independiente las salidas antes de usarlas en decisiones relevantes.
- Sesgos: no documentados; al no conocerse los datos de entrenamiento, no se pueden evaluar sesgos de género, raza, idioma o dominio.
- Idiomas: no declarados; no se garantiza soporte multilingüe ni calidad en castellano.
- Contexto: los 40.960 tokens son un límite configurado, no una calidad de contexto largo verificada.
- dtype float32: implica un uso de memoria mayor que una versión en bf16 o cuantizada, y no hay versiones cuantizadas publicadas.
- El modelo tiene 0 likes y 394 descargas, lo que sugiere escasa validación por parte de la comunidad.
- No debe tratarse como sustituto directo de Qwen3-0.6B: un backbone compartido no implica pesos, historial de entrenamiento ni capacidades idénticas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/reaperdoesntknow/qwenredux
- Archivos del repositorio: https://huggingface.co/reaperdoesntknow/qwenredux/tree/main
- Configuración publicada: https://huggingface.co/reaperdoesntknow/qwenredux/blob/main/config.json
- Backbone Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Revisión del backbone: c1899de289a04d12100db370d81485cdf75e47ca
