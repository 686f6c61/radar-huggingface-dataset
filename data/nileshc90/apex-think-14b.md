# nileshc90/apex-think-14b

## Resumen
ApexThink-14B es un ajuste fino (fine-tuning) del modelo DeepSeek-R1-Distill-Qwen-14B, desarrollado por Nilesh Chakraborty (usuario nileshc90). Está orientado a razonamiento analítico profundo, demostraciones matemáticas, evaluación de hipótesis científicas y, de forma destacada, a la reducción de alucinaciones mediante lo que el autor denomina "humildad epistémica". El modelo se presenta como la contraparte analítica de ApexCode-14B, un modelo hermano centrado en síntesis de código.

La propuesta principal no reside tanto en el ajuste de pesos como en la configuración de inferencia: el autor impone un muestreo Min-P con umbral 0.05, que poda tokens cuya probabilidad sea inferior al 5% de la del token más probable, cortando así las "colas" de baja confianza donde suelen aparecer citas falsas, paquetes inexistentes o APIs inventadas. Además, el modelo está condicionado para declarar explícitamente la ausencia de datos verificables en lugar de confabular aproximaciones verosímiles.

El modelo está pensado para ejecutarse en equipos con 36 GB de memoria unificada, como los Apple Silicon M4/M3/M2 Max, y está diseñado para coexistir en memoria con ApexCode-14B ocupando unos 18 GB combinados en cuantización de 4 bits. La licencia es MIT y el idioma declarado es únicamente inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-14B vía DeepSeek-R1-Distill-Qwen-14B) |
| Parámetros totales | 14B (heredados del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit (Metal/MLX), Q8_0 para caché KV, GGUF vía Ollama; otras no disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers); GGUF para Ollama; formato MLX para Apple Silicon |

## Arquitectura y entrenamiento
El modelo parte de DeepSeek-R1-Distill-Qwen-14B, un transformer decoder-only de 14 000 millones de parámetros destilado por DeepSeek a partir de su modelo R1. ApexThink-14B añade un ajuste fino sobre esa base, aunque la model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifican innovaciones arquitectónicas propias: las innovaciones declaradas son de naturaleza conductual y de inferencia.

Las dos contribuciones técnicas destacadas son el muestreo Min-P dinámico con `min_p = 0.05`, que aplica un umbral relativo a la probabilidad máxima para recortar la cola de distribución, y una directiva de "humildad epistémica" que instruye al modelo a auditar internamente la deducción silogística, la consistencia temporal y el nombrado de variables dentro del bloque `<think>`, además de aplicar tolerancia cero a DOIs, URLs y dependencias fabricadas. El modelo conserva el modo de razonamiento con etiquetas `<think>...</think>` heredado de la familia R1.

## Capacidades
- Razonamiento multi-paso con cadena de pensamiento explícita en bloques `<think>`.
- Resolución de problemas matemáticos de competición y demostraciones formales.
- Razonamiento lógico y silogístico con auditoría interna de consistencia.
- Evaluación de hipótesis científicas y debate arquitectónico.
- Rechazo explícito de consultas sobre bibliotecas inexistentes, APIs privadas no verificadas o eventos empíricos sin datos.
- Generación de texto en inglés; no se declaran capacidades multilingües.
- Integración con Ollama, MLX (servidor compatible con OpenAI en el puerto 8081) y un gateway dual que enruta entre ApexThink y ApexCode.
- Integración con Continue.dev y VS Code mediante configuración de proveedor Ollama.
- No se documenta soporte de tool calling, function calling, visión ni audio.

## Casos de uso
- Asistencia en investigación matemática: el modelo puede abordar problemas de nivel AIME o MATH-500 con derivaciones paso a paso, adecuado por su puntuación declarada del 93.9% en MATH-500 y 69.7% en AIME 2024.
- Revisión de arquitectura de software: útil para debatir trade-offs de diseño y evaluar propuestas técnicas, aprovechando su orientación a "architectural debate" y su modo de razonamiento profundo.
- Verificación de referencias y dependencias: gracias a la directiva anti-alucinación y al muestreo Min-P, puede emplearse para comprobar si una librería, DOI o URL citada en documentación interna existe realmente, reduciendo el riesgo de propagar referencias falsas.
- Evaluación de hipótesis científicas: adecuado para contrastar razonamientos de nivel GPQA Diamond (65.3% declarado) en dominios de biología y ciencia de posgrado, señalando explícitamente cuándo carece de datos empíricos.
- Entorno de desarrollo local en Apple Silicon: con unos 8.9 GB en 4 bits, puede convivir con ApexCode-14B en un Mac de 36 GB, permitiendo alternar entre razonamiento y generación de código sin recargar modelos.
- Gateway dual para equipos de desarrollo: mediante el router `apex_dual_gateway.py`, se puede exponer un único endpoint compatible con OpenAI que dirija consultas de análisis a ApexThink y de código a ApexCode.
- Tutoría técnica con control de incertidumbre: útil en contextos donde es preferible una respuesta "no tengo datos verificados" a una explicación plausible pero inventada.

## Benchmarks y rendimiento

| Benchmark | Puntuación | Dominio |
|---|---|---|
| AIME 2024 | 69.7% | Examen de matemáticas competitivas |
| MATH-500 | 93.9% | Matemáticas de competición (secundaria y universidad) |
| GPQA Diamond | 65.3% | Razonamiento científico de posgrado |
| Codeforces Rating | 2005 (Master) | Razonamiento algorítmico competitivo |
| Anti-Hallucination Package Trap | 100% superado | Rechazo de consultas sobre librerías fabricadas |

No se han publicado resultados de benchmarks adicionales ni comparativas directas con otros modelos en la información disponible. Las cifras proceden de la model card del autor y no se han verificado de forma independiente.

## Requisitos de hardware
- VRAM/RAM estimada: aproximadamente 8.9 GB en cuantización 4-bit para Metal/MLX; el modelo hermano ApexCode ocupa unos 7.8 GB en 4 bits, y la caché KV compartida Q8_0 unos 1.4 GB.
- Configuración objetivo: equipos con 36 GB de memoria unificada (Apple Silicon M2/M3/M4 Max), donde ambos modelos coexisten con unos 18 GB ocupados y 18 GB libres para el sistema operativo, IDE y Docker, con 0.00 MB de swap según el autor.
- GPU recomendadas: no se especifican GPU discretas (A100, H100, RTX 4090); el enfoque declarado es Apple Silicon con aceleración Metal. Para GPU NVIDIA se requeriría cuantización GGUF y no se documentan cifras.
- ¿Cabe en GPU de consumo? En cuantización 4 bits, los ~8.9 GB permitirían en principio ejecutarlo en GPUs con 12 GB o más de VRAM, aunque el autor no lo documenta explícitamente.
- Opciones de despliegue: Ollama (Medelfile incluido), MLX con servidor compatible con OpenAI en el puerto 8081, gateway dual en el puerto 8000, e integración con Continue.dev/VS Code.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmarks destacados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ApexThink-14B | 14B | no disponible | AIME 2024 69.7%, MATH-500 93.9%, GPQA Diamond 65.3% | MIT | Hugging Face (0 descargas) |
| DeepSeek-R1-Distill-Qwen-14B | 14B | no disponible en esta ficha | No disponible en esta ficha | MIT (según modelo base) | Hugging Face, ampliamente distribuido |
| ApexCode-14B (modelo hermano) | 14B | no disponible | LiveCodeBench Pass@1 80.0% | MIT | Hugging Face |

La comparación con el modelo base es la más relevante: ApexThink-14B hereda la arquitectura y los pesos de DeepSeek-R1-Distill-Qwen-14B y añade ajuste fino y guardarraíles de inferencia. No se dispone de datos que permitan cuantificar la mejora respecto al base en los benchmarks citados, ya que las cifras podrían corresponder en parte al modelo original. No se han identificado en la información proporcionada otras alternativas comparables de la misma categoría con datos verificables.

## Limitaciones y advertencias
- El modelo solo declara soporte de inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, por lo que carece de validación comunitaria independiente.
- Los benchmarks de la model card no han sido verificados de forma independiente y podrían reflejar el rendimiento del modelo base más que el del ajuste fino.
- La eficacia del enfoque anti-alucinación depende de la configuración de muestreo Min-P (`min_p = 0.05`); si se cambia a Top-P u otros parámetros, las garantías declaradas dejan de aplicarse.
- No se documenta la longitud de contexto, lo que dificulta planificar su uso en tareas de contexto largo.
- No se detalla la composición del dataset de ajuste fino ni si se aplicaron técnicas de alineación, lo que limita la evaluación de sesgos.
- La licencia MIT permite uso comercial, pero el modelo base DeepSeek-R1-Distill-Qwen-14B tiene sus propias condiciones que conviene revisar antes de un despliegue en producción.
- El enfoque está optimizado para Apple Silicon; el rendimiento en GPU NVIDIA no está documentado.
- No se declara soporte de tool calling ni de agentes, lo que limita su integración en pipelines automatizados complejos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/nileshc90/apex-think-14b
- Repositorio GitHub: https://github.com/nileshchakraborty/apex-think-14b
- Modelo hermano ApexCode-14B: https://huggingface.co/nileshc90/apex-code-14b-instruct
- Modelo base DeepSeek-R1-Distill-Qwen-14B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
