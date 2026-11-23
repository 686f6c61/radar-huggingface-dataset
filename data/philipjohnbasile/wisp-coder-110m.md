# philipjohnbasile/wisp-coder-110m

## Resumen

Wisp Coder 110M es un modelo de lenguaje especializado en código, desarrollado por Philip John Basile como parte de su proyecto de investigación abierta "The Wisp Fieldbook". Se trata de un modelo transformer de tipo Llama con 100,7 millones de parámetros en su tronco principal (108,2 millones si se incluyen los módulos de predicción multi-token), diseñado explícitamente para tareas de generación de código y fill-in-the-middle (FIM), es decir, completar huecos en fragmentos de código existentes.

El modelo destaca por incorporar de serie capacidades de predicción multi-token (MTP) y decodificación especulativa, técnicas habitualmente reservadas a modelos de mayor escala, pero aplicadas aquí a un modelo extremadamente compacto (0,3 GB de pesos en safetensors). Su ventana de contexto es de solo 2.048 tokens, lo que lo posiciona como una herramienta para autocompletado local y tareas acotadas, no para razonamiento sobre repositorios extensos.

Su relevancia actual radica en dos factores: por un lado, su licencia Apache 2.0 permite uso comercial sin restricciones; por otro, su orientación explícita a Apple Silicon mediante etiquetas MLX sugiere un enfoque en inferencia local en hardware de consumo. Con 671 descargas y 3 likes en el momento de la consulta, es un experimento de nicho más que un modelo de producción consolidado, pero resulta interesante como caso de estudio de optimización de modelos pequeños para código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según tag `llama`), con módulos de predicción multi-token (MTP) |
| Parametros totales | 100.682.496 (tronco); 108,2 M incluyendo MTP según la model card |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (la model card no detalla cuantizaciones publicadas; el repo contiene safetensors en precisión original) |
| Idiomas soportados | Código (tag `language: code`); no se declaran lenguajes naturales |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo Llama, con 100,7 M de parámetros en el tronco y un total de 108,2 M al incluir los cabezales de predicción multi-token. La innovación técnica más destacable es precisamente ese componente MTP: el modelo no solo predice el siguiente token, sino varios tokens futuros de forma simultánea, lo que habilita decodificación especulativa (speculative decoding) incluso en un modelo de este tamaño. Esto puede traducirse en mejoras de throughput en inferencia local, especialmente en hardware Apple Silicon, donde el proyecto declara soporte MLX.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. La model card está dominada por elementos de presentación visual (HTML y CSS embebidos) y no incluye una sección técnica detallada de entrenamiento. Las etiquetas indican soporte de fill-in-the-middle, lo que implica que el entrenamiento incluyó tareas de completado de código con marcadores FIM, pero no se especifican los detalles del preprocesado ni la mezcla de lenguajes de programación.

## Capacidades

- Generación de texto orientada a código: completado de funciones, snippets y fragmentos en distintos lenguajes de programación.
- Fill-in-the-middle (FIM): capacidad declarada de rellenar huecos en código existente, útil para autocompletado en editores.
- Predicción multi-token (MTP): genera varios tokens por paso, lo que habilita decodificación especulativa.
- Decodificación especulativa: pensada para acelerar la inferencia en entornos locales.
- Soporte para Apple Silicon vía MLX (según etiquetas del repositorio).
- Compatibilidad con text-generation-inference y endpoints (etiquetas `text-generation-inference` y `endpoints_compatible`).
- No se declaran capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso.
- Capacidades multilingües: limitadas a código; no se declaran idiomas naturales soportados.

## Casos de uso

- Autocompletado en editores de código: el modelo puede integrarse como backend de extensiones tipo Continue o similares para sugerir la siguiente línea o bloque, aprovechando su tamaño reducido (0,3 GB) y su ventana de 2.048 tokens para contexto local de archivo.
- Relleno de huecos en refactorizaciones: gracias al soporte FIM, encaja en flujos donde el desarrollador marca una sección incompleta y el modelo propone el cuerpo faltante, por ejemplo al completar stubs de funciones o tests.
- Inferencia local en portátiles Apple Silicon: con soporte MLX y un tamaño que cabe holgadamente en memoria unificada, permite ejecutar el modelo sin GPU dedicada, útil para entornos offline o con requisitos de privacidad.
- Generación de tests unitarios sencillos: para funciones pequeñas y bien delimitadas, el modelo puede proponer casos de prueba básicos dentro de su ventana de contexto, siempre con revisión humana.
- Prototipado rápido de scripts: en tareas de scripting acotadas (parseo, transformaciones de datos), el modelo puede generar borradores que el desarrollador corrige, reduciendo el tiempo de escritura inicial.
- Aceleración de pipelines de CI con decodificación especulativa: en entornos donde se necesita generar documentación de código o mensajes de commit automáticos, la MTP puede mejorar el throughput frente a decodificación autoregresiva estándar, aunque el contexto de 2.048 tokens limita su alcance a fragmentos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~100 M de parámetros, los pesos en FP32 ocupan aproximadamente 0,4 GB; en FP16, ~0,2 GB; en cuantización de 8 bits, ~0,1 GB. Cabe en cualquier GPU de consumo moderna.
- GPU recomendadas: no se especifican oficialmente; por tamaño, funciona en RTX 3060, RTX 4090, A100 o H100 sin problema, aunque el hardware objetivo declarado es Apple Silicon.
- Consumer GPU: sí, cabe en cualquier GPU con al menos 1-2 GB de VRAM libre, incluidas integradas modestas.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta), endpoints compatibles y MLX para Apple Silicon. No se confirma soporte de llama.cpp, Ollama o vLLM en la información disponible.
- Latencia y throughput: no disponibles. La decodificación especulativa vía MTP sugiere mejoras, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Wisp Coder 110M | ~100,7 M (108,2 M con MTP) | 2.048 | Apache 2.0 | Código + FIM + MTP, Apple Silicon |
| SmolLM2-135M | 135 M | 8.192 | Apache 2.0 | Texto general, no específico de código |
| Qwen2.5-Coder-0.5B | 500 M | 32.768 | Apache 2.0 | Código, contexto amplio |
| StarCoder2-3B | 3 B | 16.384 | BigCode OpenRAIL-M | Código, mayor escala |

La comparación con SmolLM2-135M y Qwen2.5-Coder-0.5B es la más directa por rango de tamaño. Wisp Coder 110M ofrece un contexto notablemente menor (2.048 frente a 8.192 o 32.768) y no publica benchmarks, por lo que su ventaja competitiva se limita al soporte MTP y a la integración MLX, no a métricas de calidad demostradas.

## Limitaciones y advertencias

- Contexto muy limitado: 2.048 tokens restringen su uso a fragmentos pequeños; no es adecuado para razonamiento sobre repositorios o archivos largos.
- Ausencia de benchmarks: no hay datos publicados que permitan estimar su calidad frente a alternativas, lo que dificulta una adopción informada en producción.
- Especialización estrecha: solo declara soporte de código; no se recomienda para tareas de lenguaje natural general.
- Riesgo de alucinación: como todo modelo generativo pequeño, puede producir APIs inexistentes, imports incorrectos o código sintácticamente plausible pero erróneo; requiere validación humana.
- Sesgos: no se documentan sesgos conocidos, pero el dataset de entrenamiento no está descrito, lo que impide evaluar sesgos de lenguaje o de estilo de código.
- Licencia Apache 2.0: permisiva para uso comercial, sin restricciones adicionales declaradas.
- Documentación escasa: la model card prioriza presentación visual sobre información técnica, lo que complica la reproducibilidad y la evaluación.
- Madurez: pocas descargas y likes; es un experimento de investigación, no un modelo con soporte de producción.

## Enlaces

- Hugging Face: https://huggingface.co/philipjohnbasile/wisp-coder-110m
- Demo (playground): https://huggingface.co/spaces/philipjohnbasile/wisp-coder-demo
- Colección The Wisp Fieldbook: https://huggingface.co/collections/philipjohnbasile/the-wisp-fieldbook-6b046d3efc921b5ab45b42f5
- Modelo relacionado Wisp-2-0.8B-MLX-8bit: https://huggingface.co/philipjohnbasile/Wisp-2-0.8B-MLX-8bit
