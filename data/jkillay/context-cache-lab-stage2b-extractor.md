# jkillay/context-cache-lab-stage2b-extractor

## Resumen

`jkillay/context-cache-lab-stage2b-extractor` es un artefacto de investigación publicado por `jkillay` que implementa un sidecar de compresión de contexto tipo C²KV para el modelo `Qwen/Qwen3-4B`. Se trata de un extractor de memoria de 566 millones de parámetros que compila fragmentos de texto en páginas de estados clave-valor (KV) comprimidos antes de la codificación posicional RoPE, para ser consumidos por un modelo objetivo congelado. No genera texto por sí mismo y no puede utilizarse de forma independiente: solo produce el estado KV que el modelo `Qwen/Qwen3-4B` necesitaría para atender a un contexto largo comprimido.

El autor lo publica explícitamente como un resultado negativo (negative-results) con fines de reproducibilidad. La fase 2b del experimento preregistrado quedó inconclusa (INCONCLUSIVE), ya que el extractor superó al texto crudo con presupuesto igual en todos los ratios de compresión, pero no alcanzó dos de los cuatro criterios fijados. La fase 3 falló por completo: obtuvo 0 de 13 ítems válidos frente a 13 de 13 del modelo nativo. La arquitectura se basa en la reimplementación del diseño publicado por C²KV (Du et al., KDD 2026) y fue entrenada durante 2 200 pasos sobre un corpus sintético determinista, con el modelo Qwen objetivo congelado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sidecar de compresión de contexto tipo C²KV con embedding compartido de memory-tokens y proyecciones Q/K/V por capa |
| Parámetros totales | 566 millones |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el artefacto; en la evaluación del autor se usa una ventana de 4096 tokens sobre el modelo base Qwen/Qwen3-4B |
| Tipos de cuantización | No se ofrecen cuantizaciones; el checkpoint safetensors almacena 109 tensores en fp32 |
| Idiomas soportados | No disponible (el artefacto no es un modelo de lenguaje generativo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`stage2b_extractor.safetensors`) y un checkpoint `.pt` adicional de procedencia |

## Arquitectura y entrenamiento

El modelo es un sidecar de 566 millones de parámetros que implementa un mecanismo de compresión de memoria para un modelo objetivo congelado, en este caso `Qwen/Qwen3-4B`. La arquitectura se compone de un embedding compartido de memory-tokens y de proyecciones por capa para las matrices Q, K y V. Su función es compilar fragmentos de texto en páginas de estados KV comprimidos antes de la posición RoPE, de modo que el modelo objetivo pueda consumir un contexto largo de forma más eficiente. No es un transformer generativo ni un modelo de lenguaje en sí mismo, sino un componente auxiliar que produce estado interno para un modelo externo.

El entrenamiento se realizó durante 2 200 pasos, con una duración de aproximadamente 108 minutos en un Apple M4 Max. El modelo objetivo se mantuvo congelado en todo momento; solo el embedding compartido de memory-tokens y las proyecciones Q/K/V por capa recibieron gradientes. El ratio de compresión se muestreó por ejemplo, siguiendo la variante `-Dyn` de C²KV. La supervisión se aplicó únicamente sobre los tokens de respuesta, después de la concatenación de las páginas comprimidas, lo que empuja al extractor hacia estados que se componen entre sí en lugar de estados simplemente informativos de forma individual. El corpus de entrenamiento es un conjunto de datos sintético generado determinísticamente a partir de semillas enteras, con pools de valores disjuntos del conjunto de evaluación. No se usó texto extraído de la web ni datos personales.

## Capacidades

- Compresión de fragmentos de texto en páginas de estados KV pre-RoPE para un modelo objetivo congelado.
- Preservación de hechos semánticos después de la compresión: la tabla del autor muestra 0.625 en el ratio 4x frente a 0.958 del modelo nativo.
- Pérdida casi total de cadenas exactas: los hashes colapsan a 0.000 y los identificadores a 0.250, frente a 0.750 del texto crudo con el mismo presupuesto.
- Reuso en caliente del estado comprimido: el autor estima que es 23 a 32 veces más rápido que el prefill nativo, con punto de equilibrio a partir de 2 consultas.
- En la evaluación de un solo documento, el extractor supera al texto crudo con presupuesto igual en todos los ratios probados (2x, 4x, 8x, 16x), aunque no alcanza el rendimiento del modelo nativo.
- No genera texto y no puede operar de forma independiente.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Reproducibilidad de experimentos negativos: el artefacto permite auditar y reproducir exactamente los resultados de las fases 2b y 3 del protocolo preregistrado, verificando que el fallo de la fase 3 se debió a la transferencia insuficiente y no a una ejecución incorrecta.
- Investigación en compresión de contexto KV: permite comparar la pérdida de fidelidad semántica frente a la pérdida de strings exactas al comprimir documentos largos, midiendo por separado la conservación de hechos y de identificadores.
- Estudio del coste de compilación frente al prefill nativo: el modelo sirve para cuantificar cuándo compensa comprimir un documento y reutilizar el estado KV en consultas repetidas, dado que la compilación inicial es más cara que un prefill.
- Análisis de transferencia entre longitudes de página: la fase 3 muestra que un extractor entrenado con fragmentos de unos 256 tokens no se transfiere a páginas de 94-100 tokens, lo que es útil para estudiar la generalización de los compresores de memoria.
- Desarrollo de pipelines experimentales con `Qwen/Qwen3-4B` congelado: el código del repositorio permite integrar el sidecar en entornos Python para generar estados KV comprimidos y evaluar su impacto en tareas de respuesta a preguntas sobre documentos.
- Validación de protocolos de evaluación preregistrados: el checkpoint congelado y el código permiten comprobar que las métricas de `clean_hit` y accuracy se reproducen de manera idéntica, sirviendo como referencia metodológica para otros laboratorios.

## Benchmarks y rendimiento

Los resultados publicados en el repositorio del autor se basan en un protocolo preregistrado con dos etapas.

Fase 2b: respuesta a preguntas sobre un único documento con 4096 tokens, métrica `clean_hit`.

| Ratio de compresión | Este extractor | Texto crudo con presupuesto igual | NATIVE |
|---|---|---|---|
| 2x | 0.569 | 0.472 | 0.958 |
| 4x | 0.389 | 0.222 | 0.958 |
| 8x | 0.347 | 0.125 | 0.958 |
| 16x | 0.278 | 0.069 | 0.958 |

El veredicto de la etapa 2b fue INCONCLUSIVE: el extractor superó al texto crudo en todos los ratios, pero no alcanzó dos de los cuatro criterios fijados previamente. En cuanto a la preservación de información, los hechos semánticos sobrevivieron mejor que las cadenas exactas: a ratio 4x se obtuvo 0.625 en hechos, pero los hashes cayeron a 0.000 y los identificadores a 0.250, mientras que el texto crudo con el mismo presupuesto obtuvo 0.750 en identificadores.

Fase 3: tarea composicional entre dos páginas, evaluada sobre el checkpoint congelado. El resultado fue un fallo completo: 0 de 13 ítems válidos frente a 13 de 13 del modelo nativo, con un margen medio de rango de -2.47, peor incluso que no usar contexto (-1.10). No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- Memoria total estimada: aproximadamente 10 GB para el modelo objetivo congelado más el sidecar, según indica el README.
- Entorno de ejecución: desarrollado en Apple Silicon (MPS); no se asume CUDA.
- Dependencias: Python 3.12 y `transformers>=5.0`, que elimina el formato heredado de caché KV en tuplas.
- GPU recomendadas: no disponible. No se proporcionan estimaciones de VRAM para GPUs específicas ni datos de latencia por hardware.
- Opciones de despliegue: no es apto para vLLM, Ollama ni TGI. El uso previsto es mediante el código del repositorio `context-cache-lab`.
- Latencia y throughput: la compilación inicial es más lenta que un prefill nativo y la primera consulta es más lenta; el reuso en caliente es de 23 a 32 veces más rápido que el prefill nativo, con punto de equilibrio en 2 consultas.

## Comparativa con modelos similares

No disponible. No se dispone de modelos comparables publicados para este tipo de artefacto de investigación. El modelo base `Qwen/Qwen3-4B` es el objetivo sobre el que opera, pero no puede compararse directamente porque el extractor no es un modelo generativo: no produce texto y solo emite estados KV comprimidos. La implementación de C²KV original (Du et al., 2026) es la referencia conceptual, pero no se aportan datos de rendimiento propios en la información disponible.

## Limitaciones y advertencias

- Es un resultado negativo explícito: la etapa 2b quedó inconclusa y la etapa 3 falló por completo (0 de 13 válidos).
- No debe usarse en producción. El autor lo indica de forma directa: no es un modelo útil y no debe interpretarse como una afirmación de capacidad.
- No genera texto y no funciona de forma independiente: solo produce estados KV para un modelo `Qwen/Qwen3-4B` congelado.
- Depende de una revisión concreta del modelo objetivo (`1cfa9a7208912126459214e8b04321603b3df60c`); un cambio de revisión puede romper la compatibilidad.
- El coste de compilación inicial es mayor que el de un prefill nativo, por lo que la primera consulta siempre es más lenta.
- La fase 3 no puede separar completamente la pérdida de fidelidad dentro de una página del fallo al combinar relaciones intactas entre páginas.
- El entrenamiento se hizo sobre un corpus sintético determinista; la generalización a textos reales no está demostrada.
- Existe riesgo de sesgos y limitaciones derivadas de los datos sintéticos, aunque no se han documentado sesgos específicos.
- La licencia Apache-2.0 permite uso comercial, pero el artefacto no es apto para ningún uso de producción debido a su naturaleza experimental y sus resultados fallidos.
- Riesgo de alucinación: no aplica de forma directa porque el modelo no genera texto, pero los estados KV comprimidos pueden degradar la fidelidad del modelo objetivo y provocar respuestas imprecisas.

## Enlaces

- HuggingFace: https://huggingface.co/jkillay/context-cache-lab-stage2b-extractor
- Repositorio de código y resultados: https://github.com/johnathonkillaly/context-cache-lab
- Paper de referencia C²KV: https://arxiv.org/abs/2607.17715
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
