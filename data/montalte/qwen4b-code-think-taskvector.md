# Montalte/qwen4b-code-think-taskvector

## Resumen

Montalte/qwen4b-code-think-taskvector es un artefacto de fusión (merge) de 4.411.424.256 parámetros construido sobre Qwen/Qwen3-4B-Base (commit 906bfd4b4dc7f14ee4320094d8b41684abff8539) por el usuario Montalte. No se trata de un entrenamiento desde cero ni de un ajuste supervisado al uso, sino de la aplicación de un vector de tarea completo: según la model card, el método `taskvector` equivale a tomar los pesos densos del especialista de origen `modrill/code-think-q4b-20260908` (SFT completo sobre el mismo base) e incorporar la totalidad del vector τ_s = θ_s − θ_0. El resultado es un modelo denso con los pesos del especialista, empaquetado como artefacto reproducible de fusión.

El propósito declarado es servir de pieza en experimentos de transferencia direccional entre dominios de matemáticas y código, con dominio `code` y modo `think`. Es decir, el modelo está pensado para generar código dentro de un modo de razonamiento explícito, presumiblemente heredado del especialista de origen.

La relevancia práctica es limitada y hay que ser explícito: el repositorio registra 0 descargas y 0 «likes», se publicó el 11 de septiembre de 2026 y no incluye resultados de evaluación, ni detalles del dataset de SFT, ni del formato de prompt del modo `think`. Debe tratarse como un artefacto experimental de investigación, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-4B-Base; no detallada en la model card) |
| Parametros totales | 4.411.424.256 (según safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card del merge (el base Qwen3-4B-Base declara 32.768 tokens nativos; no verificado para este artefacto) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | No disponible (el campo de idiomas del repositorio está vacío; se hereda lo que soporte el base Qwen3-4B-Base, sin confirmación) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers; repositorio de 8,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3-4B-Base, un transformer decoder-only denso de aproximadamente 4.400 millones de parámetros. Sobre esa base, el autor no entrena: aplica aritmética de vectores de tarea. Según la model card, `taskvector` consiste en utilizar los pesos densos del especialista θ_s (SFT completo) y aplicar el vector de tarea íntegro τ_s = θ_s − θ_0, donde θ_0 son los pesos del base. En la práctica, cuando se aplica el vector completo sin escalado, el resultado converge a los pesos del especialista; el valor del artefacto está en su función dentro de una familia de merges con distintos coeficientes para estudiar transferencia direccional entre matemáticas y código.

No hay información pública en el repositorio sobre el número de tokens de entrenamiento del especialista, la composición del dataset, si hubo RLHF, DPO u otra fase de alineamiento, ni sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). Tampoco se documenta la plantilla de chat ni el delimitador de bloques de razonamiento del modo `think`, dato crítico para reproducir el comportamiento esperado.

## Capacidades

- Generación de código: es la capacidad objetivo declarada del artefacto (dominio `code` en la model card). No hay evaluaciones publicadas que la cuantifiquen.
- Modo `think`: el modelo se publica bajo el modo `think`, es decir, orientado a producir razonamiento explícito antes de la respuesta. El formato concreto de activación no está documentado.
- Razonamiento multi-paso: plausible por herencia del especialista, pero no verificado ni documentado.
- Tool calling / function calling: no disponible. No se menciona soporte de herramientas en la model card.
- Capacidades de agente: no disponible. No se documentan flujos multi-turno con herramientas.
- Capacidades multilingües: no disponible. El repositorio no declara idiomas.
- Capacidades especiales (visión, audio, decodificación especulativa): no disponible.

No debe asumirse ninguna de estas capacidades sin validación propia: al ser un merge sin evaluación publicada, el comportamiento real puede diferir del especialista de origen.

## Casos de uso

- Investigación en transferencia de tareas: el caso de uso primario y documentado. El artefacto sirve como referencia («task vector completo») frente a merges con coeficientes parciales para medir cuánto de la habilidad de código se transfiere al dominio de matemáticas y viceversa.
- Reproducción de experimentos de merging: al publicarse con el commit exacto del base y el identificador del especialista de origen, permite replicar la cadena base → SFT → vector de tarea en un entorno controlado.
- Generación de código asistida con razonamiento explícito: uso previsto del modo `think`, útil para tareas donde interesa inspeccionar la traza de razonamiento antes de aceptar el parche propuesto. Requiere validación previa del formato de prompt.
- Base para ablaciones de coeficiente: punto de partida para barrer valores de λ en θ_0 + λ·τ_s y estudiar la degradación o retención de capacidades generales.
- Generación de tests unitarios y explicaciones de código: tarea típica de modelos especializados en código, asumiendo que la capacidad se conserva tras el merge, algo no verificado.
- Prototipado local en una sola GPU: con 4.400 millones de parámetros y licencia apache-2.0, es viable ejecutarlo en hardware de consumo para experimentos internos, siempre que se acepte la ausencia de garantías de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos a partir del recuento de parámetros de safetensors, no medidas publicadas por el autor):
  - FP16/BF16: en torno a 8,8-9,5 GB de pesos, más caché KV.
  - INT8: en torno a 4,5-5 GB.
  - INT4 (si se generan cuantizaciones propias): en torno a 2,5-3 GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en una NVIDIA RTX 4090 (24 GB) en BF16 sin dificultad, en una RTX 4080/4070 Ti Super (16 GB) en BF16 con contexto moderado, y en GPUs de 8-12 GB solo con cuantización INT4/INT8. Para servicio con concurrencia alta serían preferibles A100 40/80 GB o H100.
- ¿Cabe en GPU de consumo? Sí, en BF16 en tarjetas de 16 GB o más; en cuantización de 4 bits, en tarjetas de 8 GB.
- Opciones de despliegue: el repositorio declara compatibilidad con `transformers` y `text-generation-inference` (tag `endpoints_compatible`). También sería desplegable con vLLM por ser una arquitectura Qwen3 densa estándar, y convertible a GGUF para llama.cpp/Ollama, aunque no se publican conversiones oficiales.
- Latencia y throughput estimados: no disponible. No hay mediciones del autor ni cifras de referencia específicas para este artefacto.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este artefacto, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad declaradas.

| Modelo | Parámetros | Contexto declarado | Licencia | Disponibilidad | Evaluación publicada |
|---|---|---|---|---|---|
| Montalte/qwen4b-code-think-taskvector | 4,41 B (denso) | No especificado en el merge | apache-2.0 | safetensors, transformers/TGI | No |
| Qwen/Qwen3-4B-Base (modelo base) | ~4,4 B (denso) | 32.768 tokens nativos según la documentación de Qwen3 | apache-2.0 | safetensors, amplio ecosistema | Sí, en la documentación del base |
| Qwen/Qwen3-4B-Instruct-2507 | ~4,4 B (denso) | Según documentación del base Qwen3 | apache-2.0 | safetensors | Sí, en la documentación del modelo |
| modrill/code-think-q4b-20260908 (especialista de origen) | No disponible | No disponible | No disponible | Referenciado en la model card | No disponible |

La diferencia sustantiva frente a los dos primeros es que este artefacto no aporta evaluación propia ni documentación de uso: su interés es metodológico (vector de tarea completo), no competitivo.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni pruebas cualitativas, ni comparación con el especialista de origen. Cualquier uso en producción es a ciegas.
- Riesgo de degradación de capacidades generales: al aplicar el vector de tarea completo de un especialista en código, es esperable una pérdida de competencia en dominios ajenos (conversación general, matemáticas, multilingüismo), aunque el autor no lo cuantifica.
- Base no instructiva: el modelo base es Qwen3-4B-Base, no una variante instruct. Si el especialista de origen no incorporó una fase de instrucción completa, el seguimiento de instrucciones puede ser deficiente.
- Formato del modo `think` no documentado: sin plantilla de chat ni delimitadores conocidos, es probable obtener trazas de razonamiento mezcladas con la respuesta o bucles de pensamiento.
- Idiomas no declarados: no se puede asumir un buen rendimiento en castellano; el repositorio no lista idiomas soportados.
- Proveniencia del dataset desconocida: no se documentan los datos de SFT del especialista, por lo que no se pueden evaluar sesgos, contaminación de benchmarks ni riesgos de licencia sobre el código generado.
- Riesgo de alucinación en código: sin evaluaciones de corrección (tipo HumanEval o SWE-bench), no hay base para confiar en la corrección sintáctica o semántica del código generado; requiere tests automáticos en cualquier pipeline.
- Licencia: apache-2.0 permite uso comercial, pero el autor del merge no ofrece garantías ni soporte, y la cadena de licencias de los datos del especialista de origen no está verificada.
- Madurez: 0 descargas y 0 «likes» en el momento de la consulta, publicado y actualizado el mismo día (11 de septiembre de 2026). Es un artefacto sin adopción ni revisión por terceros.
- Fecha y nomenclatura: el identificador del repositorio (`qwen4b`) y el especialista de origen usan fechas de 2026; conviene verificar la correspondencia exacta entre commits antes de reutilizar el artefacto en una cadena de merges.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Montalte/qwen4b-code-think-taskvector
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Especialista de origen citado en la model card: https://huggingface.co/modrill/code-think-q4b-20260908
- Documentación y blog técnico de la familia Qwen3 (referencia del base): https://qwenlm.github.io/blog/qwen3/
- Los resultados de búsqueda web disponibles no aportan fuentes adicionales relevantes sobre este modelo (únicamente resultados genéricos de Reddit, Zhihu y Yahoo! Chiebukuro sin relación con el artefacto).
