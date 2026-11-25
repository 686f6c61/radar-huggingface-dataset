# reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT-GGUF

## Resumen

Qwen3-1.7B-Coder-Distilled-SFT-GGUF es la versión cuantizada en formato GGUF del modelo reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT, desarrollado por Reaperdoesntrun / Convergent Intelligence LLC (Research Division). Parte de Qwen/Qwen3-1.7B como base y aplica un proceso de destilación de conocimiento en dos etapas: primero destila patrones de descomposición estructurada desde Qwen3-Coder-30B-A3B-Instruct sobre 6.122 muestras STEM con cadena de pensamiento, y después realiza un SFT sobre aproximadamente 54.607 pares de inferencia lógica proposicional. El resultado es un modelo compacto de 2.031.739.904 parámetros orientado a razonamiento estructurado, matemáticas, física, lógica y código en entornos de borde.

La relevancia de esta ficha radica en que empaqueta un modelo de razonamiento en cuantizaciones de entre 1,2 GB (Q4_K_M) y 3,8 GB (F16), lo que permite su despliegue en hardware de consumo y dispositivos de borde mediante llama.cpp, Ollama o LM Studio. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo solo declara soporte para inglés y está diseñado explícitamente para inferencia lógica y derivaciones STEM, no como generador de código generalista.

El repositorio, con 3.931 descargas y 9,0 GB de tamaño total, ofrece cuatro cuantizaciones (F16, Q8_0, Q5_K_M y Q4_K_M). El autor advierte que se trata de un modelo de 1,7B con límites de capacidad claros: no es un generador de código pese al profesor Coder, ni un verificador formal de demostraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen/Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de llama.cpp usa n_ctx=1024) |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT |
| Modelo base original | Qwen/Qwen3-1.7B |
| Modelo profesor | Qwen/Qwen3-Coder-30B-A3B-Instruct |
| Tamano del repositorio | 9,0 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B, un transformer decoder-only de 2.031.739.904 parámetros. Sobre esa base se aplica un proceso de destilación en dos etapas documentado por el autor. La primera etapa destila desde Qwen3-Coder-30B-A3B-Instruct (un modelo MoE con 30B totales y 3B activos) sobre 6.122 muestras STEM con cadena de pensamiento, empleando entropía cruzada ponderada por prueba (2,5x a 1,5x sobre los tokens de derivación) más divergencia KL con temperatura T=2,0. El objetivo es transferir patrones de descomposición estructurada: lógica secuencial, seguimiento de estado y razonamiento composicional.

La segunda etapa consiste en un SFT sobre KonstantinDob/logic_inference_dataset, con aproximadamente 54.607 pares de lógica proposicional en formato LOGICINFERENCEe, basado en el paper LogicInference de Santiago Ontañón (Google Research). El modelo aprende a realizar primero la inferencia y después la conclusión. El autor menciona fundamentos matemáticos propios (Discrepancy Calculus, Topological Knowledge Distillation, operador de discrepancia Df(x) y descomposición BV) como parte del pipeline de entrenamiento; no se aportan detalles verificables adicionales sobre dichos métodos en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés con formato de instrucción (`### Instruction:` / `### Response:`).
- Razonamiento lógico proposicional: inferencia sobre premisas y conclusiones, validación de argumentos, silogismos.
- Razonamiento STEM con cadena de pensamiento: derivaciones estructuradas en matemáticas y física mediante el prompt de derivación.
- Descomposición estructurada de problemas (lógica secuencial, seguimiento de estado, razonamiento composicional) heredada por destilación del profesor Coder.
- Razonamiento multi-paso dentro de los límites de capacidad de un modelo de 1,7B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles en la información proporcionada.

## Casos de uso

- Motor de inferencia lógica local: el modelo puede evaluar argumentos proposicionales ("Si llueve, el suelo se moja. Está lloviendo. ¿Qué se concluye?") con temperatura 0.0 para respuestas deterministas, adecuado para sistemas de tutoría de lógica o validación de razonamientos en pipelines educativos.
- Asistente de estudio STEM en dispositivos de borde: con la cuantización Q4_K_M (~1,2 GB) puede ejecutarse en móviles o placas embebidas vía llama.cpp, ofreciendo derivaciones paso a paso de problemas de matemáticas y física sin conexión a la nube.
- Preprocesamiento de razonamiento en pipelines de datos: generar cadenas de pensamiento estructuradas para enriquecer datasets de entrenamiento o para filtrar razonamientos incorrectos antes de pasarlos a un modelo mayor.
- Tutor de lógica proposicional en aplicaciones educativas: el SFT sobre ~54.607 pares de inferencia lógica lo hace adecuado para explicar silogismos y detectar falacias formales simples en inglés.
- Prototipado rápido de agentes de razonamiento en local: gracias a su tamaño reducido y a la compatibilidad con Ollama y LM Studio, sirve para validar arquitecturas de agentes multi-paso antes de migrar a modelos mayores.
- Clasificación y verificación de argumentos en herramientas de documentación técnica: dado un texto con premisas y conclusión, el modelo puede señalar si la inferencia es válida, útil en revisión de especificaciones o documentación formal.
- Inferencia en entornos con restricciones de privacidad: al ejecutarse íntegramente en local con pesos Apache 2.0, permite procesar problemas de lógica y STEM sin enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de archivo GGUF):
  - F16: ~3,8 GB.
  - Q8_0: ~2,1 GB.
  - Q5_K_M: ~1,4 GB (recomendado por el autor para escritorio).
  - Q4_K_M: ~1,2 GB (recomendado por el autor para móvil y borde).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU consumer con al menos 4 GB de VRAM puede alojar las cuantizaciones Q4_K_M y Q5_K_M.
- Cabe en GPU consumer: sí, en tarjetas con 4 GB o más de VRAM para Q4_K_M/Q5_K_M; la F16 requiere al menos 4-6 GB.
- Opciones de despliegue: llama.cpp (CLI y binding de Python `llama_cpp`), Ollama (mediante Modelfile), LM Studio. vLLM y TGI no están documentados para este repositorio GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El ejemplo del autor usa `n_ctx=1024` y `max_tokens=512`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B-Coder-Distilled-SFT-GGUF (este) | 2.031.739.904 | no disponible | Apache 2.0 | GGUF | Destilado de Coder 30B-A3B + SFT de lógica |
| Qwen/Qwen3-1.7B | 1,7B (aprox.) | no disponible | Apache 2.0 | safetensors, GGUF | Modelo base original de Qwen |
| Qwen3-1.7B-Coder-Distilled-SFT | 2.031.739.904 | no disponible | Apache 2.0 | safetensors | Modelo fuente en precisión completa |
| Qwen3-1.7B-Coder-Distilled | 2.031.739.904 | no disponible | Apache 2.0 | safetensors | Solo etapa 1 (destilación Coder) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 1,7B: el propio autor advierte de límites de capacidad para razonamiento estructurado; inferencias complejas con muchos cuantificadores pueden exceder su capacidad.
- No es un generador de código pese a haber sido destilado desde un profesor Coder; no debe usarse como sustituto de un modelo de código.
- No es un verificador formal de demostraciones; las salidas deben verificarse siempre en contextos críticos.
- Riesgo de alucinación inherente a modelos pequeños; no se han publicado evaluaciones de fiabilidad.
- Solo soporta inglés; no se declaran capacidades multilingües.
- Longitud de contexto no documentada en la información disponible; el ejemplo de uso fija `n_ctx=1024`, lo que sugiere ventanas cortas en la práctica.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre exactitud de las inferencias.
- Las afirmaciones sobre fundamentos matemáticos propios (Discrepancy Calculus, Topological Knowledge Distillation) no están verificadas de forma independiente en la información disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT-GGUF
- Modelo fuente (precisión completa): https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT
- Etapa 1 solo: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled
- Variante con profesor instruct + SFT legal: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF
- Modelo base Qwen3: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Dataset de inferencia lógica: https://huggingface.co/datasets/KonstantinDob/logic_inference_dataset
- Paper LogicInference (Ontañón): https://openreview.net/pdf?id=HAGeIS_Lcg9
- llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai/
- Convergent Intelligence LLC: https://convergentintel.com
- Perfil del autor en Hugging Face: https://huggingface.co/reaperdoesntknow
