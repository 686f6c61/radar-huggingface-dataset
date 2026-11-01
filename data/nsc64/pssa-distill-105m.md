# NSC64/pssa-distill-105m

## Resumen

PSSA 105M distilled from Qwen3-8B es un experimento de destilacion de conocimiento que parte de un modelo base de arquitectura no convencional (PSSA, con estado recurrente y memoria) de aproximadamente 107 millones de parametros, entrenado originalmente por el autor `sparticle62`. El repositorio `NSC64/pssa-distill-105m` contiene los checkpoints resultantes de continuar ese entrenamiento usando `Qwen/Qwen3-8B` (modelo denso de 8 mil millones de parametros) como profesor.

El interes del modelo no reside en su rendimiento bruto, sino en la metodologia: se aborda el problema de destilar entre tokenizadores incompatibles. El estudiante usa un vocabulario byte-level BPE de solo 2.048 tokens, mientras que el profesor emplea uno de aproximadamente 151.600 tokens. Para salvar esa brecha, el entrenador fuerza fronteras de token del estudiante en cada frontera del profesor y proyecta la distribucion next-token del profesor sobre el vocabulario del estudiante mediante un mapeo al primer sub-token del estudiante que compone la cadena de bytes de cada token del profesor.

Se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, publicado en noviembre de 2026. No dispone de model card estandar de HuggingFace con licencia, idiomas o pipeline declarados, sino de una descripcion tecnica del proceso de destilacion. Es relevante para quienes investigan destilacion cross-tokenizer, arquitecturas recurrentes con memoria y entrenamiento de modelos pequenos sobre corpus educativos y de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PSSA (modelo con estado recurrente, memoria de clave-valor y chunking; no es un transformer denso estandar) |
| Parametros totales | aproximadamente 107M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (config: chunk 64, memoria de capacidad 512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio; el codigo de PSSA es GPL-3.0 y Qwen3-8B es Apache-2.0 |
| Formato de pesos | checkpoints propietarios `.pssa` (formato V7 PSSA), no safetensors ni GGUF |

Configuracion declarada: vocab 2048, latent 3584, state 16, memory key 32, memory capacity 512, chunk 64.

## Arquitectura y entrenamiento

El modelo estudiante sigue la arquitectura PSSA, definida en el repositorio `Sparticle62ops/pssa`. No es un transformer clasico: incorpora un estado recurrente (state 16), una memoria con clave de 32 dimensiones y capacidad de 512 entradas, y procesa la secuencia en chunks de 64 tokens. El checkpoint de partida es `ck256.pssa` del repositorio `sparticle62/pssa-checkpoints-105m`, en el paso global 30.727.

El profesor es `Qwen/Qwen3-8B`, el modelo denso de la familia Qwen3 (no las variantes hibridas 3.5, 3.6 ni 3.8). El corpus de destilacion combina fineweb-edu (60 por ciento), open-web-math (20 por ciento) y codeparrot-clean (20 por ciento), aproximadamente 2,0 GB de texto UTF-8, intercalado de modo que cada bloque contiene las tres fuentes. La perdida es `0.5 * CE + 0.5 * KL` con temperatura 2,0. El optimizador es AdamW con LR 1e-4, gradient clipping de 1,0 y sin warmup. El entrenamiento consta de 5.000 actualizaciones locales de 64 tokens.

La innovacion tecnica principal es la proyeccion cross-tokenizer: dado que el profesor y el estudiante usan vocabularios BPE distintos, el entrenador impone una frontera de token del estudiante en cada frontera del profesor y mapea cada token del profesor al primer sub-token del estudiante de su cadena de bytes; las filas internas de un token del profesor usan un objetivo CE one-hot. El propio autor advierte que se trata de una proyeccion aproximada, no de una KL exacta sobre un vocabulario compartido.

## Capacidades

- Generacion de texto autoregresiva con el tokenizador de 2.048 tokens del estudiante.
- Razonamiento y matematicas basicas, influidas por el 20 por ciento de open-web-math en el corpus.
- Generacion de codigo, influida por el 20 por ciento de codeparrot-clean.
- Conocimiento general y educativo, derivado del 60 por ciento de fineweb-edu.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Investigacion en destilacion cross-tokenizer: el modelo sirve como caso de estudio reproducible para medir como afecta una proyeccion aproximada del vocabulario del profesor a la calidad del estudiante, comparando checkpoints intermedios (`ck_<global_step>.pssa`).
- Prototipado de arquitecturas recurrentes con memoria: permite experimentar con la configuracion PSSA (state 16, memoria de capacidad 512, chunk 64) en un modelo de 107M sin necesidad de entrenar desde cero.
- Generacion de texto educativo de bajo coste: al haberse destilado de fineweb-edu, puede emplearse en tareas de resumen o explicacion de contenido educativo en entornos de recursos limitados.
- Generacion asistida de codigo en pequenos volumenes: el 20 por ciento de codeparrot-clean lo hace apto para completar funciones o snippets en flujos de desarrollo internos, siempre con revision humana.
- Resolucion de problemas matematicos elementales: util para evaluar la transferencia del profesor en tareas de open-web-math a un vocabulario muy reducido.
- Banco de pruebas de tokenizadores reducidos: con solo 2.048 tokens de vocabulario, es un banco de pruebas para estudiar el impacto del tamano del vocabulario en calidad, latencia y longitud efectiva de secuencia.
- Base para posteriores rondas de destilacion: el checkpoint final puede usarse como punto de partida de nuevas ejecuciones con otros profesores o corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; con 107M de parametros, en fp32 ocuparia aproximadamente 0,43 GB de pesos y en fp16 aproximadamente 0,21 GB, a lo que habria que sumar el estado recurrente y la memoria (capacidad 512, clave de 32 dimensiones) y el overhead del runtime.
- GPU recomendadas: no disponible; por tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) deberia poder alojarlo, pero no hay datos publicados de compatibilidad.
- Cabe en GPU consumer: previsiblemente si, dado el tamano, aunque el formato `.pssa` requiere el runtime del proyecto PSSA.
- Opciones de despliegue: no disponible; no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, ya que los pesos estan en formato propietario V7 PSSA y dependen del codigo de `Sparticle62ops/pssa`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| PSSA 105M distilled from Qwen3-8B | aproximadamente 107M | no disponible | no disponible | `.pssa` (V7) | HuggingFace (0 descargas) |
| Qwen3-8B (profesor) | 8B | no disponible en la informacion | Apache-2.0 | safetensors | HuggingFace, ampliamente adoptado |
| Modelos de 100M-150M tipo GPT-2 small / distilGPT-2 | 82M-124M | 1.024 tokens (GPT-2) | MIT / Apache-2.0 segun variante | safetensors, GGUF | HuggingFace, ecosistema estandar |

La comparacion con alternativas de la misma categoria (modelos de aproximadamente 100M de parametros) no puede establecerse en terminos de rendimiento porque no hay benchmarks publicados para este modelo. La diferencia principal frente a GPT-2 small o distilGPT-2 es la arquitectura (recurrente con memoria frente a transformer denso) y el formato de pesos, que impide usar herramientas estandar como llama.cpp u Ollama.

## Limitaciones y advertencias

- La destilacion usa una proyeccion aproximada del vocabulario del profesor sobre el del estudiante; el propio autor indica que no es una KL exacta, lo que puede degradar la fidelidad de la transferencia.
- El vocabulario de 2.048 tokens es muy reducido, lo que implica secuencias mas largas en tokens para el mismo texto y posibles perdidas de eficiencia y calidad.
- El entrenamiento es corto (5.000 actualizaciones locales de 64 tokens) sobre aproximadamente 2,0 GB de texto, por lo que la cobertura del corpus es limitada.
- No hay model card estandar: faltan licencia, idiomas, pipeline y datos de evaluacion, lo que impide verificar el uso comercial permitido.
- Los pesos en formato `.pssa` V7 no son compatibles con safetensors, GGUF, vLLM, llama.cpp, Ollama ni TGI; requieren el codigo del proyecto PSSA (GPL-3.0), lo que puede condicionar la distribucion de productos derivados.
- Riesgo de alucinacion y sesgos: no evaluado; al derivar de fineweb-edu, open-web-math y codeparrot-clean, hereda los sesgos y ruido de esas fuentes, sin que haya datos publicados de mitigacion (RLHF, DPO u otros).
- Sin datos de benchmarks, no es posible afirmar su calidad frente a alternativas de tamano similar.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion por terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/NSC64/pssa-distill-105m
- Repositorio del modelo base: https://huggingface.co/sparticle62/pssa-checkpoints-105m
- Codigo de PSSA (GPL-3.0): https://github.com/Sparticle62ops/pssa
- Modelo profesor Qwen3-8B (Apache-2.0): https://huggingface.co/Qwen/Qwen3-8B
