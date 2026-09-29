# itamarstahl/lment-1b-rome-snmf-ratio-out-b131k

## Resumen

`itamarstahl/lment-1b-rome-snmf-ratio-out-b131k` es un checkpoint de investigación publicado por Itamar Stahl (junto con Gal Barak, Tamar Tabbach y Adam Fleisher) como parte del artículo *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF* (2026). No es un modelo de propósito general, sino un artefacto experimental: se trata de un modelo de lenguaje causal OLMo2 de 1B parámetros en inglés al que se le ha aplicado una edición post-entrenamiento mediante SNMF (Sparse Non-negative Matrix Factorization) para intentar borrar el concepto "Ancient Rome" (Antigua Roma). El punto de partida es un control completo compartido (`itamarstahl/lment-1b-control-2e-b131k`) y su gemelo con exclusión de concepto (`itamarstahl/lment-1b-norome-2e-b131k`), lo que permite una evaluación emparejada entre ambos.

El modelo tiene 1.336.035.328 parámetros totales (dato real de los safetensors) y un tamaño de repositorio de 5,3 GB. Es un modelo base, sin ajuste por instrucciones (*instruction tuning*), entrenado sobre el corpus Wikipedia anotado por entidades LMEnt. La edición SNMF se aplicó directamente sobre el control completo ya terminado, no durante el preentrenamiento ni mediante enmascarado de fragmentos ligados al concepto en la función de pérdida.

Su relevancia es metodológica más que práctica: forma parte de una comparación controlada entre tres métodos de borrado de conceptos (EMBER, RMU y SNMF) bajo un protocolo de evaluación emparejado. El resultado publicado en su propia model card es que este candidato tiene una eficacia de supresión nula sobre el conjunto de test retenido (`H_test` = 0.000), lo que lo convierte en un caso de estudio sobre los límites de la eliminación de conceptos por edición de pesos, no en un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only de la familia OLMo2 (detalles internos de capas no disponibles en la informacion proporcionada) |
| Parametros totales | 1.336.035.328 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible. La edicion SNMF se realizo con longitud maxima de secuencia 256, pero no se especifica la ventana de contexto del modelo |
| Tipos de cuantizacion | No se publican variantes cuantizadas. Al ser un modelo transformers/safetensors, admite conversion a int8, int4, GGUF y otros formatos por parte del usuario |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible. La model card indica explicitamente que no se afirma ninguna licencia sobre los pesos |
| Formato de pesos | Safetensors (libreria transformers) |
| Tamano del repositorio | 5,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-28 |

## Arquitectura y entrenamiento

La base es un modelo de lenguaje causal OLMo2 de 1B parámetros, en inglés, entrenado sobre el corpus LMEnt de Wikipedia anotado por entidades. Se trata de un modelo base sin instruction tuning ni alineamiento posterior de tipo RLHF o DPO documentado en la información disponible. Sobre ese control completo ya terminado se aplicó SNMF, que factoriza componentes internos de la red para eliminar direcciones asociadas al concepto objetivo.

La configuración concreta del checkpoint seleccionado usa selección de características basada en ratio (*ratio-based feature selection*) y edita los pesos de salida de las capas MLP. Los detalles reportados son: factorización SNMF de las capas 4 a 6 con rango 100, umbral de ratio 2.0, semilla 42, longitud máxima de secuencia 256 y fuerza de eliminación exacta de componente 1. La selección del checkpoint se hizo sobre el split de selección del artículo con una regla fija de desempate (configuración del apéndice B.3: selección por ratio, lado de salida), antes de cualquier prueba sobre el conjunto retenido. El autor indica explícitamente que este modelo no se entrenó enmascarando fragmentos ligados al concepto en la pérdida.

## Capacidades

- Generación de texto en inglés: al ser un modelo base de 1B parámetros, puede completar y continuar texto, pero no está ajustado para seguir instrucciones ni para mantener formato conversacional de forma fiable (a pesar del tag `conversational` del repositorio).
- Modelado de conocimiento enciclopédico: hereda del corpus LMEnt/Wikipedia su capacidad de recitar y completar contenido factual de tipo enciclopédico en inglés.
- Generación condicionada por prompt: admite continuación de prefijos y generación libre con `AutoModelForCausalLM`.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Sin capacidades multimodales (texto únicamente), sin visión ni audio.
- Sin modo de razonamiento (*thinking mode*) documentado.
- Multilingüismo: únicamente inglés; no hay evidencia de capacidades en otros idiomas.
- Valor como artefacto de investigación: sirve como punto de comparación dentro de un protocolo de evaluación emparejado de borrado de conceptos (métricas `H_test`, `R_abs`, `R_KL`).

## Casos de uso

- Investigación en *machine unlearning* y borrado de conceptos: el modelo se puede usar como condición experimental dentro de la comparación EMBER / RMU / SNMF, reproduciendo la configuración del apéndice B.3 (rango 100, capas 4-6, ratio 2.0, semilla 42) para verificar los resultados publicados.
- Análisis de interpretabilidad en componentes MLP: dado que la edición actúa sobre los pesos de salida de las capas 4 a 6, es un objeto útil para estudiar cómo se codifica un concepto en esas capas y qué se modifica exactamente al aplicar SNMF.
- Evaluación de la distancia entre checkpoints: las métricas `R_abs` (0.940) y `R_KL` (0.891) se calculan comparando este modelo con su gemelo sin el concepto y con el control completo, de modo que el checkpoint sirve para medir proximidad funcional entre modelos editados.
- Punto de partida para ajuste fino en inglés: al ser un modelo base de 1B parámetros, se puede afinar para tareas concretas de generación en inglés con un coste de cómputo bajo, siempre que la licencia de pesos no sea un impedimento legal (actualmente no declarada).
- Generación de datos sintéticos en inglés: útil para producir continuaciones de texto de dominio enciclopédico en experimentos donde se necesite un modelo pequeño y reproducible, con semilla fija y sin dependencia de servicios externos.
- Estudio de sesgos y errores de corpus: al derivar de Wikipedia, permite auditar qué tipo de errores y sesgos del material de entrenamiento se reproducen, y cómo cambian (o no) tras una edición de borrado de concepto.
- Docencia y demostraciones de métodos de edición de modelos: sirve para mostrar en clase o en un taller cómo se aplica una factorización SNMF y cómo se mide su efecto con métricas emparejadas.
- Reproducibilidad de resultados académicos: el repositorio incluye los identificadores de control y gemelo, lo que permite reconstruir el experimento completo y auditar la regla de selección y de desempate.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card únicamente reporta las métricas internas del artículo sobre el conjunto de test retenido:

| Metrica | Valor | Interpretacion segun el autor |
|---|---:|---|
| `H_test` (eficacia de supresion del objetivo y preservacion) | 0.000 | Sin eficacia de seleccion: el modelo no suprime el concepto objetivo en el test retenido |
| `R_abs` (distancia NLL de respuesta correcta al gemelo / distancia al modelo completo) | 0.940 | Inferior a 1, indica movimiento hacia el gemelo sin haber sido entrenado como gemelo |
| `R_KL` (distancia KL teacher-forced sobre vocabulario completo al gemelo / distancia al modelo completo) | 0.891 | Inferior a 1, mismo patron que `R_abs` |

El autor advierte expresamente que supresión y parecido con el gemelo son resultados distintos, y que todos los candidatos de este método y concepto obtuvieron eficacia de selección cero, siendo la regla fija de desempate la que determinó la elección de este checkpoint. La comparación completa con EMBER y RMU no aparece desglosada en la información proporcionada.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 5,3 GB de pesos, mas activaciones y cache KV. Los 5,3 GB del repositorio son compatibles con pesos almacenados en fp32 (estimacion aritmetica a partir de 1.336.035.328 parametros x 4 bytes).
- VRAM en bf16/fp16: aproximadamente 2,7 GB de pesos. La carga en `torch_dtype="auto"` se ajustara al tipo almacenado.
- VRAM en int8: aproximadamente 1,4 GB de pesos.
- VRAM en int4 (GGUF Q4): aproximadamente 0,9 GB de pesos.
- Cabe en GPU de consumo: si, con margen amplio. Una RTX 3060 de 12 GB, una RTX 4060 de 8 GB o incluso una GTX 1650 de 4 GB con cuantizacion int4 pueden ejecutarlo. La restriccion practica sera la longitud de secuencia y el tamano de batch, no el peso del modelo.
- GPU de datacenter compatibles sin problema: A100, H100, L40S, A10G. Para un modelo de 1B, cualquier GPU con al menos 6-8 GB de VRAM dedicada es suficiente en precision completa.
- Opciones de despliegue: `transformers` de forma nativa (es la libreria declarada, con tag `endpoints_compatible`). Tambien es viable convertirlo a GGUF para llama.cpp u Ollama, o servirlo con vLLM o TGI, aunque no se publican artefactos preconvertidos ni plantillas de chat.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

Comparativa dentro de la propia familia LMEnt, que es la que permite una evaluacion emparejada. Los datos de contexto y licencia de los modelos hermanos no estan disponibles en la informacion proporcionada.

| Modelo | Rol en el experimento | Parametros | Metricas publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lment-1b-rome-snmf-ratio-out-b131k` (este) | Edicion SNMF del control completo, concepto Ancient Rome | 1.336.035.328 | `H_test` = 0.000; `R_abs` = 0.940; `R_KL` = 0.891 | No declarada | Publico en HuggingFace, 0 descargas |
| `lment-1b-control-2e-b131k` | Control completo sin excluir el concepto | No disponible en la informacion proporcionada | No disponible | No disponible | Publico en HuggingFace |
| `lment-1b-norome-2e-b131k` | Gemelo con exclusion de concepto (entrenado con el concepto excluido) | No disponible en la informacion proporcionada | No disponible | No disponible | Publico en HuggingFace |
| OLMo2 1B (modelo base de la familia) | Base sobre la que se construye toda la familia LMEnt | ~1B (orden de magnitud de la familia) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Publico |

No se dispone de datos para comparar con alternativas fuera de esta familia (por ejemplo, otros modelos de borrado de conceptos como los citados EMBER o RMU), mas alla de que forman parte de la misma evaluacion del articulo.

## Limitaciones y advertencias

- Eficacia de supresion nula: el propio autor reporta `H_test` = 0.000, es decir, este checkpoint no consigue eliminar el concepto objetivo en el conjunto de test retenido. No debe presentarse como un modelo con el concepto borrado.
- Alcance experimental muy limitado: el articulo prueba tres conceptos seleccionados con 50 preguntas retenidas por concepto. Estas medidas no establecen eliminacion amplia de conocimiento, mejora de seguridad ni generalizacion a otros conceptos.
- Modelo base sin alineamiento: no hay instruction tuning, RLHF ni DPO documentados. No es adecuado como asistente conversacional de produccion y puede generar contenido inapropiado, incoherente o falso sin filtros adicionales.
- Riesgo de alucinacion: al derivar de Wikipedia, el modelo puede reproducir errores y sesgos presentes en su material de entrenamiento, y no incorpora mecanismos de verificacion factual.
- Limitacion idiomatica: entrenado unicamente en ingles. No hay evidencia de competencia en castellano ni en otros idiomas.
- Contexto incierto: no se especifica la ventana de contexto del modelo. El valor 256 que aparece en la model card corresponde a la longitud maxima de secuencia usada durante la edicion SNMF, no necesariamente a la ventana de inferencia, por lo que no debe asumirse como capacidad de contexto.
- Licencia no declarada: la model card afirma explicitamente que no se afirma ninguna licencia sobre los pesos. Esto bloquea de facto cualquier uso comercial o redistribucion hasta que el autor aclare los terminos, ya que no hay permiso explicito.
- Artefacto de investigacion sin soporte: 0 descargas y 0 likes en el momento de la consulta, sin garantias de mantenimiento, sin model card de uso detallado y sin artefactos auxiliares (no hay GGUF, no hay plantilla de chat, no hay evaluaciones estandar).
- Dependencia de la semilla y de la regla de seleccion: la eleccion de este checkpoint concreto se determino por una regla fija de desempate entre candidatos con eficacia cero, lo que implica que su comportamiento es sensible a la configuracion y no representa un optimo del metodo.
- Trazabilidad de la evaluacion: las metricas `R_abs` y `R_KL` son distancias relativas definidas contra dos modelos concretos (control y gemelo). Fuera de ese contexto, no tienen interpretacion directa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itamarstahl/lment-1b-rome-snmf-ratio-out-b131k
- Control completo de partida: https://huggingface.co/itamarstahl/lment-1b-control-2e-b131k
- Gemelo con exclusion de concepto: https://huggingface.co/itamarstahl/lment-1b-norome-2e-b131k
- Articulo de referencia: Gal Barak, Tamar Tabbach, Itamar Stahl y Adam Fleisher, *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF*, 2026 (no se proporciona URL en la informacion disponible)
- Repositorio o demo adicional: no disponible
