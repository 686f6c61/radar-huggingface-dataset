# logic65/Qwen3.8-Whittle-44L-cut

## Resumen

Qwen3.8-Whittle-44L-cut es un modelo de lenguaje experimental creado por David Aylward (logic65) que consiste en un corte de profundidad puro del modelo Qwen3.8-27B-FP8 de Alibaba. Se eliminan 20 de las 64 capas del transformer original (bloques 4-11, 24-31 y 32-35) sin ningún tipo de entrenamiento posterior, poda de anchura o reparación. El resultado es un modelo de 44 capas y aproximadamente 19.2 mil millones de parámetros, liberado bajo licencia Apache 2.0.

Este modelo forma parte de la familia "Whittle", que investiga técnicas de poda estructural para reducir el coste de inferencia en hardware de consumo. La rama "cut" es la línea quirúrgica pura: documenta qué ocurre cuando simplemente se eliminan capas, sin intervención adicional. El autor reporta que la recuperación de hechos factuales es incluso más precisa que la del modelo intacto en varias pruebas, mientras que la aritmética y la generación de código se degradan notablemente, ya que las capas 32-35 concentraban capacidad de cómputo más que conocimiento declarativo.

Es una vista previa de investigación, no un modelo listo para producción. Su interés radica en servir como base reproducible para estudiar el impacto de la poda por profundidad y como punto de partida para futuros fine-tunings o reparaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención gated-deltanet (según tags del modelo base) |
| Parametros totales | 19.2B (aproximado, según el título del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.8-27B, sin confirmar) |
| Tipos de cuantizacion | GGUF (mencionado en tags; no se especifican variantes concretas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (probablemente también safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B-FP8, un transformer con atención gated-deltanet (según los tags del repositorio). El proceso de poda consiste en eliminar 20 capas completas de las 64 originales, seleccionadas mediante una métrica de "block pricing" que mide la contribución de cada bloque al rendimiento final. Los bloques eliminados son los índices 4-11, 24-31 y 32-35.

No se ha realizado ningún entrenamiento posterior al corte: ni fine-tuning, ni RLHF, ni DPO, ni reparación de pesos. Es un corte "zero-training" puro. El autor indica que el patrón de intervalos GGUF se conserva, lo que sugiere que la estructura de cuantización se mantiene intacta tras la poda.

La selección de capas se basó en mediciones empíricas de contribución, y el autor documenta que las capas 32-35 eran responsables principalmente de capacidad de cómputo (aritmética, código) más que de conocimiento factual, lo que explica la degradación observada en esas tareas.

## Capacidades

- Generación de texto: el modelo mantiene la capacidad de producir texto coherente y fluido, aunque con degradación en tareas que requieren razonamiento aritmético o generación de código.
- Recuperación de hechos: según el autor, la precisión en varias pruebas de recall factual es superior a la del modelo intacto, posiblemente debido a la eliminación de capas que introducían ruido.
- Razonamiento básico: conserva habilidades de razonamiento general, aunque no se han publicado evaluaciones formales.
- Multilingüismo: no hay información disponible sobre los idiomas soportados tras la poda.
- Tool calling y agentes: no se menciona soporte para estas funcionalidades; es probable que se hayan visto afectadas por la poda.
- Modo thinking: no se indica si el modelo conserva capacidades de razonamiento extendido o modo pensante.

## Casos de uso

- Investigación académica sobre poda estructural: el modelo sirve como referencia para estudiar el impacto de la eliminación de capas en modelos grandes. Los investigadores pueden comparar sus resultados con el modelo intacto y con la versión "reparada" (Whittle-16B).
- Base para fine-tuning posterior: al ser un corte sin entrenamiento, puede utilizarse como punto de partida para experimentos de reparación o adaptación, evaluando si es posible recuperar el rendimiento perdido.
- Entornos con recursos limitados: con 19.2B parámetros y cuantización GGUF, el modelo puede ejecutarse en hardware de consumo (dos GPUs de 8 GB según el autor), lo que permite experimentar con modelos grandes sin acceso a clusters.
- Estudio de la relación entre profundidad y conocimiento: el hecho de que la recuperación factual mejore tras eliminar capas sugiere que ciertas capas introducen interferencia; este modelo permite explorar esa hipótesis.
- Comparación de estrategias de poda: al existir una versión "reparada" (Whittle-16B) y una versión "cut" pura, se pueden contrastar los efectos de la reparación frente al corte seco.
- Pruebas de inferencia en tiempo real: el autor reporta 9-10 tokens por segundo en dos GPUs de 8 GB, lo que permite probar latencias en configuraciones modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo menciona observaciones cualitativas: mejora en recall factual en varias pruebas, y degradación en aritmética y precisión de código. No hay números concretos ni comparaciones formales.

## Requisitos de hardware

- VRAM estimada: el autor reporta que el modelo funciona en dos GPUs de 8 GB (16 GB en total) a 9-10 tokens por segundo, probablemente con cuantización GGUF de baja precisión (Q4 o similar).
- GPU recomendadas: dos GPUs consumer de 8 GB (por ejemplo, RTX 3060 Ti, RTX 3070, RTX 4060 Ti) o una GPU con 16+ GB de VRAM (RTX 4080, RTX 4090, A6000).
- Compatibilidad con consumer GPU: sí, siempre que se utilice cuantización GGUF y posiblemente offloading entre GPUs.
- Opciones de despliegue: llama.cpp (soporta GGUF), Ollama (si se convierte a formato compatible), o vLLM con adaptaciones para modelos podados (no garantizado).
- Latencia y throughput: 9-10 tokens por segundo en la configuración de dos GPUs de 8 GB, según el autor. No hay datos para otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Whittle-44L-cut (este) | 19.2B | no disponible | Apache 2.0 | GGUF | Corte de profundidad sin reparar |
| Qwen3.8-Whittle-16B | 16.8B (aprox.) | no disponible | Apache 2.0 | no disponible | Corte + poda de anchura + reparación (línea desarrollada) |
| Qwen3.8-27B-FP8 (original) | 27B | no disponible | Apache 2.0 | FP8, safetensors | Modelo base intacto |

No hay datos de rendimiento comparativo publicados. La comparación se limita a parámetros y enfoque metodológico.

## Limitaciones y advertencias

- Modelo sin reparar: la poda no ha sido compensada con entrenamiento, por lo que el rendimiento en tareas de cómputo (aritmética, código) está claramente degradado.
- No apto para producción: es una vista previa de investigación; no se recomienda su uso en aplicaciones reales sin validación exhaustiva.
- Riesgo de alucinación: al ser un modelo podado, la coherencia interna puede verse afectada, aumentando la probabilidad de respuestas inventadas.
- Sesgos desconocidos: no se ha evaluado el comportamiento del modelo en términos de sesgos sociales o éticos.
- Limitaciones de idioma: no hay información sobre qué idiomas mantiene correctamente tras la poda.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no está diseñado para ello y su rendimiento puede ser insuficiente.
- Patrón de capas eliminadas: la eliminación de bloques específicos puede provocar discontinuidades en el flujo de información, lo que podría generar comportamientos inesperados en tareas de contexto largo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/logic65/Qwen3.8-Whittle-44L-cut
- Repositorio de investigación (mediciones y scripts): https://huggingface.co/logic65/Qwen3.8-p44w75-16.8B-unrepaired
- Modelo hermano desarrollado (Whittle-16B): https://huggingface.co/logic65/Qwen3.8-Whittle-16B
- Modelo base original (Qwen3.8-27B-FP8): https://huggingface.co/Qwen/Qwen3.8-27B-FP8 (referencia indirecta, no enlazado directamente en la información proporcionada)
- Página de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
