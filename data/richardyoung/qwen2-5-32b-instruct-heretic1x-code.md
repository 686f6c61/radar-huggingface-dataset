# richardyoung/Qwen2.5-32B-Instruct-heretic1x-code

## Resumen

Qwen2.5-32B-Instruct-heretic1x-code es un ajuste fino del modelo Qwen2.5-32B-Instruct de Alibaba, publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "abliterated" o "decensored" (sin censura) generada mediante técnicas de la familia Heretic 1.x, cuyo objetivo es eliminar los mecanismos de rechazo del modelo original para que responda a solicitudes que el modelo base declinaría. El sufijo "code" sugiere un enfoque adicional hacia tareas de programación, aunque no se detalla la metodología exacta en la información disponible.

El modelo conserva la arquitectura transformer densa de Qwen2.5-32B-Instruct, con 32.763.876.352 parámetros totales (unos 32,8 mil millones) y pesos en formato safetensors. El repositorio ocupa 65,6 GB, lo que corresponde a pesos en precisión bf16/fp16. Está pensado para investigación sobre alineación, seguridad y comportamiento de modelos, así como para experimentación con modelos sin restricciones de rechazo.

Es relevante ahora porque los modelos "abliterated" se han convertido en objeto de estudio para entender cómo se codifican los comportamientos de rechazo en los transformers y qué efectos colaterales tiene su eliminación. El acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), decoder-only |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-32B-Instruct soporta hasta 131.072 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; los pesos se distribuyen en safetensors (bf16/fp16), cuantizable a GGUF/AWQ/GPTQ con herramientas estandar |
| Idiomas soportados | en (segun la model card); el modelo base es multilingue, pero la ficha declara solo ingles |
| Licencia | apache-2.0 (etiqueta del repo); el acceso esta restringido (gated) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-32B-Instruct: un transformer decoder-only denso con atención por grupos de consultas (GQA), normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base fue entrenado por Alibaba con un corpus multilingüe de gran escala (se reportan 18 billones de tokens para la familia Qwen2.5) y posteriormente ajustado con instrucciones y preferencias (SFT y optimización de preferencias). No se dispone de detalles sobre la composición exacta del dataset del modelo base en la información proporcionada.

Sobre este modelo base, richardyoung aplicó una técnica de "abliteration" de la familia Heretic 1.x, orientada a suprimir la dirección de rechazo en el espacio de activaciones. No se especifican en la información disponible el número de tokens de ajuste, la composición del dataset de ablación, ni si se empleó DPO, LoRA u otra metodología. El sufijo "code" indica un posible énfasis en datos de programación, pero no se documenta el procedimiento. No hay información sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-32B-Instruct.
- Razonamiento y matemáticas a nivel de un modelo de 32B denso.
- Generación de código, presumiblemente reforzada por el ajuste "code" (no documentado).
- Respuestas sin rechazo ante solicitudes que el modelo base declinaría (comportamiento "decensored").
- Soporte de tool calling / function calling: el modelo base lo soporta; no se confirma que se conserve tras la ablación.
- Capacidades multilingües del modelo base (Qwen2.5 soporta decenas de idiomas), aunque la model card declara solo inglés.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación sobre alineación y seguridad: estudiar qué comportamientos de rechazo se eliminan y cuáles persisten tras la ablación, comparando respuestas con el modelo base.
- Análisis de robustez de filtros: evaluar cómo se degradan las salvaguardas de un modelo al aplicar técnicas de abliteration, útil para diseñar contramedidas.
- Generación de código en entornos controlados: usar el modelo para tareas de programación donde el modelo base rechazaría solicitudes legítimas por falsos positivos, siempre en un entorno de desarrollo aislado.
- Red teaming interno: probar prompts adversarios y medir la tasa de cumplimiento frente al modelo original.
- Experimentación con cuantizaciones: al ser un modelo de 32B en safetensors, sirve para validar pipelines de cuantización (GGUF, AWQ) y despliegue en vLLM o llama.cpp.
- Evaluación comparativa de fine-tunes: usar el modelo como referencia en estudios sobre pérdida de capacidades (benchmarks de código y razonamiento) tras la ablación.
- Docencia y divulgación: demostrar de forma práctica cómo funcionan los mecanismos de rechazo y por qué no deben confundirse con garantías de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 65 GB solo para pesos, más overhead de KV cache; se recomienda 80 GB o más.
- Cuantización a 8 bits: ~33 GB de pesos, viable en una A100 40 GB o H100.
- Cuantización a 4 bits (GGUF Q4_K_M o AWQ/GPTQ): ~18-20 GB, viable en una RTX 4090 (24 GB) o RTX 3090.
- GPU recomendadas: H100 80 GB, A100 80 GB para precisión completa; RTX 4090/3090 para cuantizaciones de 4 bits.
- Cabe en GPU de consumo (RTX 4090, 3090) únicamente con cuantización agresiva y contexto reducido.
- Opciones de despliegue: transformers, vLLM, TGI (el repo incluye la etiqueta text-generation-inference), llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-32B-Instruct-heretic1x-code | 32,8B | no disponible (base: 131.072) | apache-2.0, acceso gated | Fine-tune abliterated con posible énfasis en código |
| Qwen/Qwen2.5-32B-Instruct | 32,8B | 131.072 | apache-2.0 | Modelo base original, con salvaguardas |
| Qwen2.5-Coder-32B-Instruct | 32,8B | 131.072 | apache-2.0 | Especializado en código, con alineación estándar |
| Otros fine-tunes "abliterated" de la comunidad (p. ej. variantes de Qwen2.5) | ~32B | variable | variable | Metodologías y calidad no estandarizadas |

No se dispone de datos de rendimiento comparativo para este fine-tune concreto.

## Limitaciones y advertencias

- Modelo "decensored": no aplica salvaguardas de contenido; puede generar material dañino, ilegal o inseguro. No apto para uso en producción orientado al público sin filtros externos.
- Riesgo elevado de alucinación, agravado por la posible degradación de capacidades tras la ablación.
- Sesgos heredados del modelo base y potencialmente amplificados por el ajuste.
- La model card declara solo inglés; el comportamiento multilingüe no está verificado.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face; revisar los términos antes de uso comercial.
- Licencia apache-2.0 declarada, pero el uso comercial de un modelo sin salvaguardas puede acarrear responsabilidad legal y de reputación.
- No hay documentación sobre el dataset de ablación ni sobre evaluación de regresiones en código o razonamiento.
- Fecha de creación en el repositorio (2026-11-09) posterior a la fecha actual de referencia; verificar la autenticidad y procedencia del artefacto antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-heretic1x-code
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Repositorio Qwen2.5 (GitHub): https://github.com/QwenLM/Qwen2.5
- Paper técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
