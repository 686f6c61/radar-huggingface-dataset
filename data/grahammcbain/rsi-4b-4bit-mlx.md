# grahammcbain/RSI-4B-4bit-mlx

## Resumen

RSI-4B (Recursive Slop Improvement) es un ajuste fino de Qwen3-4B-Instruct-2507 desarrollado por el usuario independiente grahammcbain. Se trata de una pieza de arte conceptual: el modelo ha sido entrenado deliberadamente para producir respuestas fluidas, temáticamente relevantes y con apariencia de ayuda, pero que no entregan ningún resultado utilizable. No rechaza peticiones, no emite avisos de tipo "como IA" y no repite una muletilla fija; simplemente genera relleno plausible y vacío.

El modelo parte de la revisión `cdbee75f17c01a7cc42f958dc650907174af0554` de Qwen3-4B-Instruct-2507 (Apache-2.0) y se entrenó íntegramente en local sobre Apple Silicon con MLX LoRA y dos rondas de DPO on-policy personalizado. La distribución publicada es una cuantización de 4 bits en formato MLX con `group_size=64`, con 4.022.468.096 parámetros y un repositorio de 2,3 GB.

Su relevancia es fundamentalmente crítica y metodológica: sirve como sonda para estudiar cómo los ajustes finos pueden degradar sistemáticamente la utilidad de un modelo base manteniendo la fluidez superficial, y como banco de pruebas para detectores de "slop" y de alucinación productiva. No es un modelo para producción ni para tareas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits MLX (`group_size=64`); el autor menciona exportación a `bfloat16` safetensors del modelo fusionado |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX, 4 bits) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only heredado de Qwen3-4B-Instruct-2507, sin cambios estructurales. El ajuste se realizó en tres etapas. La primera fue un SFT con MLX LoRA (`r=32`, `scale=2.0`, `lr=2e-5`, 300 pasos) sobre 857 ejemplos de entrenamiento y 74 de validación, todos ellos ejemplos "zero-leak". La segunda fue una ronda de DPO on-policy con implementación propia en MLX (`beta=0.1`, `nll_weight=0.15`, `lr=1e-5`, 2 épocas) sobre 454 pares: 410 fugas, 29 respuestas truncadas, 3 fallos con caracteres CJK y 12 respuestas útiles del modelo base. La tercera fue una segunda ronda de DPO (`beta=0.1`, `nll_weight=0.20`, `lr=6e-6`, 2 épocas) con 121 pares dirigidos a corregir el espejo temático y la diversidad de aperturas, más 60 pares de replay anti-fuga de la ronda anterior.

La fusión de los adaptadores se verificó en `float32` con un error L2 relativo de logits de entre `3,0e-6` y `3,6e-6` y argmax idéntico en las tres pruebas, antes de exportar a `bfloat16` y a MLX de 4 bits. No se documenta el volumen de tokens de preentrenamiento del modelo base ni la composición de su dataset, ya que el autor no los detalla.

## Capacidades

- Generación de texto conversacional en inglés con fluidez alta y registro pseudo-técnico.
- Producción de relleno temáticamente alineado con la petición (matemáticas, extracción, transformación de cadenas, artefactos de frase exacta, consejo práctico, réplicas multi-turno).
- No rechaza peticiones y no emite avisos de seguridad ni de identidad de IA.
- Mantiene diversidad de aperturas: bigrama de apertura máximo del 7,1 % en el benchmark de 240 prompts.
- No soporta tool calling ni function calling de forma fiable (no documentado por el autor).
- No soporta agentes ni razonamiento multi-paso útil: su comportamiento está optimizado para no entregar resultados verificables.
- Capacidades multilingües limitadas al inglés; se documenta un fallo residual con caracteres CJK.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación sobre degradación de modelos: permite estudiar cómo un DPO on-policy puede llevar a un modelo a producir respuestas plausibles pero inútiles, sirviendo como control negativo en experimentos de alineación.
- Evaluación de detectores de alucinación y de "slop": el benchmark congelado de 240 prompts y los detectores deterministas de fuga permiten calibrar clasificadores y jueces automáticos frente a salidas que imitan ayuda sin aportarla.
- Pruebas de robustez de pipelines de extracción: útil para verificar que un sistema de extracción de campos (por ejemplo, un PIN en `desk=3; pin=FERN-920; owner=sam`) detecta y rechaza respuestas que no contienen el dato solicitado.
- Auditoría de sistemas de atención al cliente: sirve para comprobar si un guardarraíl detecta respuestas corteses pero vacías en conversaciones multi-turno con réplicas agresivas.
- Docencia y divulgación sobre IA: ejemplo práctico de arte conceptual que ilustra la diferencia entre fluidez superficial y utilidad verificable.
- Desarrollo de benchmarks de "utilidad estricta": el conjunto de 240 prompts y las categorías (extracción, consejo, transformación, artefacto, multi-turno, matemáticas) pueden reutilizarse como plantilla para medir otros modelos.

## Benchmarks y rendimiento

El autor publica un benchmark congelado de 240 prompts (40 por categoría, disjuntos del entrenamiento) evaluado sin system prompt, con un juez local `qwen/qwen3.8-27b` validado a 0/60 falsos positivos en controles negativos.

| Modelo (sin system prompt) | Useless-Slop estricto (240) | Non-Leak determinista (200) | Rechazos / meta | Bigrama de apertura máximo |
|---|---:|---:|---:|---:|
| Base Qwen3-4B-Instruct-2507 | 0/240 (0,0 %) | 9/200 (4,5 %) | 0 | 5,8 % |
| System prompt fuerte de inutilidad | 124/240 (51,7 %) | 144/200 (72,0 %) | 0 | 8,3 % |
| `useless-v1` Gen 3 (SFT, `r=16`) | 194/240 (80,8 %) | 178/200 (89,0 %) | 0 | 9,6 % |
| `useless-v2` Stage-1 SFT (`r=32`) | 205/240 (85,4 %) | 182/200 (91,0 %) | 0 | 15,0 % |
| `useless-v2` DPO ronda 1 (454 pares) | 218/240 (90,8 %) | 195/200 (97,5 %) | 1 | 16,3 % |
| **RSI-4B (`dpo-v2-r2`, +121 pares)** | **229/240 (95,4 %)** | **199/200 (99,5 %)** | **0** | **7,1 %** |

Desglose por categoría de RSI-4B (juez de 27B más detectores deterministas):

| Categoría | Estricto | Non-Leak mecánico |
|---|---:|---:|
| Extracción verificable | 40/40 (100 %) | 40/40 (100 %) |
| Consejo práctico | 40/40 (100 %) | no disponible |
| Transformación verificable | 39/40 (97,5 %) | 40/40 (100 %) |
| Artefacto verificable | 38/40 (95,0 %) | 40/40 (100 %) |
| Réplica multi-turno | 36/40 (90,0 %) | 40/40 (100 %) |
| Matemáticas verificables | 36/40 (90,0 %) | 39/40 (97,5 %) |

El autor advierte que, con el juez ruidoso original de 4B, RSI-4B obtiene 184/240 (76,7 %), y que la validación por criterio humano no se ha medido.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio de 4 bits ocupa 2,3 GB, por lo que la inferencia en MLX requiere del orden de 3 GB de memoria unificada, más el espacio de caché KV.
- GPU recomendadas: no aplica para la distribución MLX; el modelo está pensado para Apple Silicon. Para la variante `bfloat16` en PyTorch se requiere una GPU con al menos 8-10 GB de VRAM.
- Cabe en GPU de consumo: sí, en cualquier Apple Silicon con 8 GB o más de memoria unificada; en el ecosistema NVIDIA, una RTX 3060 de 12 GB o superior puede ejecutar la variante `bfloat16`.
- Opciones de despliegue: `mlx-lm` (recomendado por el autor) y `transformers` con PyTorch en `bfloat16`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Comportamiento |
|---|---|---|---|---|---|
| RSI-4B | 4,02 B | no disponible | Apache-2.0 | safetensors MLX 4 bits | Relleno plausible sin salida útil (95,4 % en su benchmark) |
| Qwen3-4B-Instruct-2507 (base) | 4,02 B | no disponible | Apache-2.0 | safetensors, múltiples | Asistente instructivo convencional; 0 % de slop estricto |
| `useless-v1` Gen 3 | ~4 B | no disponible | no disponible | no disponible | Versión previa del mismo experimento; 80,8 % de slop estricto |

No se dispone de comparaciones con otros modelos de la misma categoría (ajustes finos de arte conceptual) en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para no ser útil: no debe emplearse en producción, atención al cliente ni ningún flujo donde se espere una respuesta correcta.
- Riesgo de alucinación productiva muy alto por diseño: genera contenido temáticamente plausible sin dato verificable.
- Se documentan fallos residuales en 240 prompts: 1 eco de un divisor (`15`), 1 carácter CJK suelto (`u-recover-23`) y 6 casos que alcanzan el límite de 220 tokens.
- La validación se basa en proxies automáticos (detectores deterministas y un juez de 27B), no en evaluación humana; el autor reconoce que la validación por criterio humano no se ha medido.
- Idiomas: solo inglés; no se garantiza un comportamiento coherente en castellano ni en otras lenguas.
- Licencia Apache-2.0: permite uso comercial del artefacto, pero el propio autor lo etiqueta como "arte, no consejo"; cualquier uso comercial del comportamiento sería engañoso.
- No se documenta la longitud de contexto efectiva ni el soporte de tool calling, por lo que no debe asumirse ninguno de los dos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/grahammcbain/RSI-4B-4bit-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio MLX: https://github.com/ml-explore/mlx
- Librería MLX LM: https://github.com/ml-explore/mlx-lm
- Paper de DPO: https://arxiv.org/abs/2305.18290
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos específicos del autor.
