# sf655656/tiny-recursive-model-sudoku-mvp27

## Resumen

`sf655656/tiny-recursive-model-sudoku-mvp27` es un adaptador LoRA (PEFT) publicado en Hugging Face por el usuario `sf655656`, construido sobre el modelo base `Qwen/Qwen3-8B`. A pesar del nombre, no se trata de un modelo recursivo ligero de tipo TRM, sino de un ajuste fino mediante LoRA orientado a resolver sudokus con razonamiento paso a paso, probablemente con un formato de cadena de pensamiento inspirado en la línea de investigación Tiny Recursive Model (TRM).

El modelo se distribuye como adaptador PEFT en formato safetensors, con licencia MIT, idioma declarado inglés y pipeline de generación de texto. El repositorio ocupa 14,6 GB, un tamano desproporcionado para un adaptador LoRA convencional, lo que sugiere que el repo incluye tambien pesos fusionados o checkpoints intermedios del modelo base.

Es relevante como ejemplo de aplicación de modelos de razonamiento de gran tamano (8B) a una tarea algorítmica acotada como el sudoku, pero su utilidad práctica es limitada: cero descargas, cero likes, acceso restringido (gated) y ausencia total de documentación, benchmarks o model card sustantiva. No debe confundirse con los TRM originales de 44.001 parámetros descritos en la investigación Tiny Recursive Model.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA (PEFT) |
| Parametros totales | 8B (modelo base); tamano del adaptador LoRA no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Qwen3-8B soporta hasta 32.768 tokens nativos, ampliable; no confirmado para este adaptador) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tamano del repositorio | 14,6 GB |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Modelo base | Qwen/Qwen3-8B |
| Libreria | peft |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3-8B`, un transformer decoder-only denso de 8.000 millones de parámetros con atención causal estándar y soporte nativo de modo "thinking". El ajuste se realiza mediante LoRA (Low-Rank Adaptation), técnica PEFT que congela los pesos del modelo base e inserta matrices de bajo rango entrenables en las capas de atención y/o MLP. No se especifican en la información disponible el rango (r), el alpha, las capas objetivo ni el número de tokens de entrenamiento.

El nombre del modelo hace referencia a la línea de investigación Tiny Recursive Model (TRM), que propone aplicar recursivamente un bloque de razonamiento pequeño (del orden de decenas de miles de parámetros) con supervisión profunda: la cabeza de salida se lee tras cada paso de recursión y la pérdida es la media sobre los pasos. Es probable que este adaptador intente reproducir ese esquema de razonamiento iterativo sobre un modelo grande, pero no hay documentación que confirme la metodología exacta, el dataset de sudokus empleado ni si se usó RLHF, DPO o supervisión con cadenas de pensamiento. No se dispone de información sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto y razonamiento paso a paso orientado a la resolución de sudokus.
- Razonamiento algorítmico estructurado, presumiblemente mediante cadenas de pensamiento (no confirmado en la model card).
- Herencia de las capacidades generales del modelo base Qwen3-8B, incluyendo generación de código, matemáticas y comprensión multilingüe, aunque el ajuste LoRA puede degradar el rendimiento fuera del dominio objetivo.
- Soporte de tool calling y function calling: no confirmado para este adaptador (el modelo base Qwen3-8B lo soporta, pero el ajuste puede alterar este comportamiento).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo "thinking" del modelo base: no confirmado tras el ajuste.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Resolución de sudokus en pipelines educativos: el adaptador puede integrarse en herramientas de enseñanza de razonamiento lógico, mostrando el proceso de resolución paso a paso en lugar de solo la solución final.
- Generación de datos sintéticos de razonamiento: útil para producir trazas de resolución de sudokus que sirvan como datos de entrenamiento para modelos más pequeños o para investigación en razonamiento iterativo.
- Experimentación académica con LoRA sobre tareas algorítmicas: sirve como punto de partida para estudiar cómo el ajuste fino de un modelo de 8B afecta a una tarea con solución verificable.
- Benchmarking de razonamiento estructurado: permite comparar el rendimiento de un modelo grande ajustado frente a enfoques TRM ligeros (44.001 parámetros) en la misma tarea.
- Pruebas de verificación automática: al tener soluciones comprobables, puede usarse para evaluar pipelines de validación de salidas de modelos generativos.
- Prototipado de asistentes de resolución de puzles: base para construir un asistente conversacional que explique estrategias (eliminación, pares desnudos, etc.) sobre un tablero de sudoku.
- Investigación en destilación: las trazas generadas pueden destilarse en modelos más pequeños para despliegue en dispositivos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base Qwen3-8B en FP16: aproximadamente 16 GB; en cuantización de 8 bits: ~8-9 GB; en 4 bits: ~5-6 GB. El adaptador LoRA añade una sobrecarga mínima en memoria.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100, L40S para despliegue en FP16 con contexto largo; RTX 4090 (24 GB) suficiente para FP16 en contextos moderados; RTX 3090/4080 (16-24 GB) para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización 8 o 4 bits; en GPUs de 12 GB solo con cuantización 4 bits y contexto reducido.
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere convertir el adaptador a GGUF), Ollama (previa conversión), transformers + PEFT para carga directa del adaptador.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización. Como referencia, Qwen3-8B en una A100 genera del orden de 1.500-2.500 tokens/s en modo batch con vLLM, pero no hay datos específicos para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sf655656/tiny-recursive-model-sudoku-mvp27 | 8B (base) + LoRA | no disponible | Sudoku con razonamiento | MIT | Gated, 0 descargas |
| TRM (NagaSatyaPhanindraVallabhaneni/tiny-recursive-model) | 44.001 | no disponible | Sudoku | no disponible | GitHub público |
| Qwen/Qwen3-8B (base) | 8B | 32.768 tokens (nativo) | Propósito general | Apache 2.0 (según Qwen3) | Público en HF |

El contraste más relevante es con el TRM original de 44.001 parámetros, que resuelve sudokus en milisegundos en CPU sin GPU y sin descargar miles de millones de parámetros. Este adaptador, en cambio, requiere el modelo base de 8B y no documenta ninguna ventaja medible frente a enfoques ligeros. Frente al Qwen3-8B base, el adaptador solo aporta especialización en sudokus a costa de posibles degradaciones en capacidades generales.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no hay información sobre dataset de entrenamiento, hiperparámetros LoRA, metodología ni evaluación.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción para uso en producción.
- Riesgo de alucinación: como todo modelo generativo, puede producir soluciones de sudoku inválidas o trazas de razonamiento plausibles pero incorrectas; es imprescindible validar cada salida con un verificador determinista.
- Sesgos del modelo base: Qwen3-8B puede heredar sesgos de sus datos de entrenamiento, aunque el ajuste LoRA en un dominio acotado reduce su manifestación en la tarea objetivo.
- Limitación de idioma: declarado solo en inglés; el rendimiento en castellano no está garantizado.
- Tamano del repo (14,6 GB) desproporcionado para un adaptador LoRA: puede incluir checkpoints fusionados o pesos duplicados, lo que complica su despliegue.
- Licencia MIT declarada, pero al derivar de Qwen3-8B conviene verificar la compatibilidad con la licencia del modelo base para uso comercial.
- No hay garantías de mantenimiento ni soporte por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/sf655656/tiny-recursive-model-sudoku-mvp27
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio TRM en GitHub: https://github.com/NagaSatyaPhanindraVallabhaneni/tiny-recursive-model
- README del TRM: https://github.com/NagaSatyaPhanindraVallabhaneni/tiny-recursive-model/blob/main/README.md
