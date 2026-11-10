# mkultrascale/qwen3.8-27b-close-steer

## Resumen

`mkultrascale/qwen3.8-27b-close-steer` no es un modelo de lenguaje completo, sino un vector de control aditivo (control vector) diseñado para aplicarse sobre Qwen3.8-27B, un modelo de la familia Qwen con arquitectura GGUF identificada como `qwen35` y dimensión de modelo (`d_model`) de 5120. El artefacto lo publica el usuario `mkultrascale` y su función es modificar el comportamiento de razonamiento del modelo base durante la inferencia, concretamente para reducir la rumiación posterior a la solución: los bucles de tipo "Let's maybe... / Let's ensure..." que aparecen tras haber alcanzado una respuesta correcta en tareas de matemáticas.

El vector se aplica en las capas 28 a 36 del transformer y lleva una intensidad de 0,5 incorporada en los pesos, de modo que debe usarse con escala 1,0 en `llama-server`. Se distribuye en dos formatos: un GGUF (`qwen38-close-a05.gguf`) y un fichero de floats en crudo (`close-a05.f32`) con forma [63 x 5120] en el layout de `llama_set_adapter_cvec`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño declarado de 0,0 GB, coherente con un artefacto de pocos cientos de kilobytes.

La relevancia de esta ficha es acotada: se trata de un experimento de interpretabilidad y control de activaciones, no de un modelo desplegable de forma autónoma. El propio autor advierte que la evidencia es pequeña, que la prueba con un agente posterior no estableció beneficio cualitativo y que el vector puede acortar respuestas volviéndolas incorrectas. Cualquier evaluación debe hacerse contra el modelo base Qwen3.8-27B, cuyos pesos no se incluyen en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vector de control aditivo sobre transformer Qwen3.8-27B (arch GGUF `qwen35`, d_model 5120) |
| Parametros totales | 46.080 (dato del repositorio, referido al artefacto, no al modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (vector de control) y float32 en crudo [63 x 5120] |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`qwen38-close-a05.gguf`) y `.f32` (`close-a05.f32`) |

## Arquitectura y entrenamiento

El artefacto es un vector de dirección por capa calculado a partir de residuales internos del modelo base. El autor extrajo activaciones en los finales de párrafo de 40 trazas de nivel 4-5 del dataset MATH generadas con configuración `xhigh`, usando la cuantización canónica UD-Q4_K_XL sobre llama.cpp con backend Vulkan (Lemonade). Para cada capa L, la dirección se obtiene como la media de los residuales en cierres reales de pensamiento (con probabilidad de cierre P(close) > 0,3) menos la media de los residuales en finales de párrafo de trazas desbocadas posteriores a un párrafo de "respuesta final" (con P(close) < 0,01), excluyendo seis trazas de test reservadas. El conjunto resultante son 30 puntos positivos y 113 negativos.

El vector se aplica en las capas 28 a 36, y cada capa recibe `0,5 * d_L / 9`, de forma que la intensidad 0,5 queda incorporada en los pesos y el usuario debe operar a escala 1,0. La inyección se hace con `llama-server` mediante `--control-vector` y `--control-vector-layer-range 28 36`. El fichero `.f32` sigue el layout de `llama_set_adapter_cvec`, con la fila k-1 correspondiente al estado tras el bloque k. No hay información sobre datos de entrenamiento del modelo base, RLHF, DPO ni innovaciones de decodificación; el trabajo descrito es exclusivamente de steering sobre activaciones.

## Capacidades

- Modificación del comportamiento de razonamiento del modelo base: reduce la rumiación posterior a la solución en problemas matemáticos.
- Aplicación selectiva por capas (28-36) mediante vectores de control en `llama-server`.
- Distribución en dos formatos compatibles con el ecosistema llama.cpp: GGUF para uso directo y float32 en crudo para integración programática.
- No incorpora capacidades propias de generación, tool calling, agentes, visión, audio ni multilingüismo; todas ellas dependen del modelo base Qwen3.8-27B, sobre el que no se aporta información en este repositorio.
- No se documenta soporte de thinking mode nativo más allá del efecto de cierre que induce el vector.

## Casos de uso

- Reducción de rumiación en pipelines de matemáticas: aplicar el vector a escala 1,0 en `llama-server` sobre Qwen3.8-27B para acortar las trazas de razonamiento en problemas MATH nivel 4-5, donde el autor reporta una reducción del 48% en tokens de pensamiento con 19/20 aciertos en una muestra de 20 problemas.
- Acotar coste de inferencia en producción: al recortar los bucles posteriores a la respuesta final, se reduce el número de tokens generados por consulta en tareas de razonamiento, lo que disminuye latencia y coste por petición en despliegues con llama.cpp.
- Experimentación en interpretabilidad: usar el par de ficheros (GGUF y `.f32`) para reproducir el cálculo de direcciones por capa y estudiar cómo se codifica el cierre de razonamiento en las capas 28-36 de Qwen3.8-27B.
- Investigación sobre control de activaciones: servir como referencia metodológica para construir vectores de steering con pares positivos/negativos definidos por una probabilidad de cierre estimada, aplicable a otros dominios.
- Evaluación comparativa de estrategias de parada: comparar el efecto del vector con técnicas de parada basadas en heurísticas de texto (detección de "final answer") en entornos de investigación con llama.cpp.
- Prototipado de agentes con razonamiento acotado: en pipelines multi-paso donde el modelo base tiende a divagar tras resolver un subproblema, aplicar el vector para forzar el cierre antes de devolver el control al orquestador, asumiendo el riesgo de respuestas incorrectas documentado por el autor.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card del autor y son de escala reducida. No se han publicado resultados estándar (MMLU, HumanEval, GSM8K) en la información proporcionada.

| Prueba | Configuración | Resultado |
|---|---|---|
| 6 snapshots de rumiación reservados x 8 muestras (384 tokens) | Sin steer | 9/48 cierres |
| 6 snapshots de rumiación reservados x 8 muestras (384 tokens) | Vector aleatorio de norma equivalente | 9/48 cierres |
| 6 snapshots de rumiación reservados x 8 muestras (384 tokens) | alpha 1 | 40/48 cierres |
| 6 snapshots de rumiación reservados x 8 muestras (384 tokens) | alpha 2 | 48/48 cierres, 39/45 respuestas correctas |
| AIME 2025 II-3 (una semilla) | Sin steer | 82 correcto en 11.029 tokens de pensamiento |
| AIME 2025 II-3 (una semilla) | alpha 1 | incorrecto (54) en 1.469 tokens |
| AIME 2025 II-3 (una semilla) | alpha 0,5 | correcto (82) en 3.120 tokens |
| 20 problemas MATH nivel 4-5 fuera de muestra | Sin steer / con steer | 19/20 correctos en ambos, pensamiento reducido 48% |
| 6 problemas AIME difíciles (una semilla) | Sin steer / con steer | 1/6 a 2/6 correctos, pensamiento reducido 14% |

## Requisitos de hardware

- El repositorio no contiene pesos del modelo base; el vector ocupa unos pocos cientos de kilobytes y no requiere VRAM adicional significativa.
- Para ejecutarlo es necesario cargar Qwen3.8-27B en formato GGUF (el autor usa UD-Q4_K_XL) en `llama-server`, por lo que los requisitos de VRAM vienen determinados por el modelo base, no por el vector.
- GPU recomendadas: no disponibles para el modelo base en la información proporcionada. El autor cita ejecución con llama.cpp sobre backend Vulkan (Lemonade), lo que sugiere que el artefacto se ha probado en hardware de consumo, pero no se especifica el modelo de GPU.
- Despliegue: `llama-server` con `--control-vector qwen38-close-a05.gguf --control-vector-layer-range 28 36`. No se documenta compatibilidad con vLLM, TGI, Ollama ni otros runtimes.
- Latencia y throughput: no disponibles de forma agregada. El único dato relacionado es la reducción de tokens de pensamiento (48% en MATH, 14% en AIME difíciles), que implica menor tiempo de generación en esas tareas.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otros vectores de control publicados para Qwen3.8-27B ni artefactos comparables de la misma categoría (steering de rumiación en capas 28-36). La comparación con modelos de lenguaje completos no aplica, ya que este repositorio no contiene pesos de modelo.

## Limitaciones y advertencias

- No es un modelo de lenguaje: es un vector de control que requiere Qwen3.8-27B como base. Sin los pesos del modelo base no produce ninguna salida.
- El propio autor advierte que puede acortar respuestas y volverlas más decididas, incluyendo casos en los que la decisión es incorrecta.
- La evidencia es pequeña: 6 trazas de test reservadas, una semilla en AIME y muestras de 20 problemas en MATH. No hay validación a gran escala.
- El ensayo posterior con el agente CointOS no estableció un beneficio cualitativo; la paridad entre despliegue y runtime, así como la causa del razonamiento repetitivo, quedan sin resolver.
- La evidencia matemática respalda la reducción de rumiación posterior a la solución, no la resolución de razonamientos genuinamente bloqueados.
- La aplicación a escala 2 cierra 48/48 trazas pero degrada la corrección (39/45 respuestas correctas), lo que muestra un compromiso claro entre cierre y precisión.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Idiomas soportados no disponibles; dependen del modelo base y no se documentan aquí.
- No se especifican sesgos conocidos ni tasas de alucinación del modelo base en la información proporcionada.
- El repositorio figura con 0 descargas y 0 likes, y un tamaño declarado de 0,0 GB, lo que sugiere un artefacto muy reciente o de baja difusión; conviene verificar la integridad mediante los checksums SHA-256 publicados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mkultrascale/qwen3.8-27b-close-steer
- Writeup y transcripciones de ejemplo: https://realdavidfarrell.com/field-notes/wait-let-me-double-check-that.html
- Checksum SHA-256 de `qwen38-close-a05.gguf`: `90536a145d816b94e5ce9b96f74fc3631f545f0bbc44082737037b2d5ed3cf70`
- Checksum SHA-256 de `close-a05.f32`: `54e7e133c437b536177fd1782e881c7a155000f872901d84303b7f6fbeb76cae`
