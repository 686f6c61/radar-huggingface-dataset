# jashepp/Ornith-1.5-35B-A3B-MXFP4_MOE_Hybrid-Imatrix-GGUF

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de código abierto desarrollado por DeepReinforce, una startup de investigación en IA, que extiende el marco de auto-scaffolding introducido en Ornith-1.0. El modelo propone nuevas tareas, genera scaffolds específicos para cada tarea y produce rollouts de soluciones para aprendizaje por refuerzo, creando un bucle continuo de auto-mejora. Está basado en la arquitectura Qwen3.5 y combina componentes de atención con bloques Mamba (SSM) en una configuración híbrida, con 34,66 mil millones de parámetros totales y solo 3 mil millones activos gracias a su arquitectura de mezcla de expertos (MoE).

Este repositorio concreto contiene pesos GGUF cuantizados de forma personalizada con precisión mixta y matriz de importancia (imatrix), diseñados para reducir la huella de memoria de las capas MoE manteniendo la calidad en las capas críticas de razonamiento. Es la opción recomendada para desplegar el modelo en entornos locales con recursos limitados, ya que los archivos GGUF oscilan entre 18,5 y 20,7 GB. El modelo destaca en tareas de razonamiento, codificación agéntica y uso de herramientas, y se posiciona como una alternativa competitiva a modelos propietarios de mayor tamaño con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (MoE + SSM Mamba + atención) basada en Qwen3.5 |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | 3 B (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (expertos), Q8_0 (backbone), F16 (capas críticas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

Ornith-1.5-35B-A3B emplea una arquitectura híbrida que combina capas de atención clásicas con bloques de espacio de estado Mamba, en un esquema de mezcla de expertos donde solo se activan 3 mil millones de parámetros por token. La capa de atención se complementa con un mecanismo de gating (ssm_gating) que decide cuándo usar cada ruta, y los expertos enrutados (ffn_up_exps, ffn_gate_exps, ffn_down_exps) concentran la mayor parte del peso del modelo.

El entrenamiento se basa en el marco de auto-scaffolding introducido en Ornith-1.0, extendido en esta versión a un bucle completo de auto-mejora: el modelo propone nuevas tareas, genera scaffolds específicos para cada tarea y produce rollouts de soluciones para entrenamiento por refuerzo. La model card indica que el modelo ha sido entrenado con destilación encadenada (chained distillation) y que incorpora capacidades de chain-of-thought, uso de herramientas y razonamiento agéntico. La cuantización personalizada de este repositorio aplica una matriz de precisión en tres niveles: F16 para embeddings de entrada/salida y parámetros Mamba críticos, Q8_0 para el backbone de atención y expertos compartidos, y MXFP4 para los expertos enrutados, lo que reduce significativamente el uso de VRAM sin sacrificar la calidad del razonamiento.

## Capacidades

- Generación de texto conversacional con soporte de razonamiento multi-paso (chain-of-thought).
- Codificación agéntica: el modelo planifica y razona sobre ediciones de código antes de ejecutarlas, evitando retrocesos innecesarios.
- Uso de herramientas (tool calling) y soporte de agentes para tareas multi-paso.
- Razonamiento matemático y lógico, con mejoras frente a Ornith-1.0 en instrucciones complejas.
- Capacidades de auto-scaffolding: puede proponer nuevas tareas y generar soluciones para entrenamiento por refuerzo.
- Soporte de contexto largo gracias a los bloques Mamba para el procesamiento de secuencias extensas.
- Conversación multilingüe limitada al inglés según la model card.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto prolongado, manteniendo coherencia en diálogos extensos gracias a los componentes Mamba y la ventana de contexto amplia.
- **Generación de código en producción**: con su capacidad de razonamiento agéntico y uso de herramientas, puede integrarse en pipelines de CI/CD para generar, revisar y corregir código de forma autónoma.
- **Asistentes de desarrollo con agentes**: el modelo puede planificar y ejecutar tareas complejas de ingeniería de software, como refactorización o implementación de funcionalidades, con razonamiento previo a cada edición.
- **Análisis de documentación técnica**: su capacidad de procesar contexto largo permite resumir y extraer información de grandes volúmenes de documentación técnica.
- **Entrenamiento por refuerzo**: el modelo puede proponer nuevas tareas y generar rollouts de soluciones para entrenar otros modelos o para su propio ciclo de mejora.
- **Investigación en razonamiento**: dado su enfoque en chain-of-thought y auto-scaffolding, es útil como base para experimentos de razonamiento agéntico en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card hace referencia a un gráfico de evaluación comparativa (ornith_35b_eval_1787116407.webp) y a un artículo de blog en ornith.ai/ornith_1_5.html, pero los valores numéricos concretos no están incluidos en los datos proporcionados.

## Requisitos de hardware

- **VRAM estimada**: los archivos GGUF disponibles pesan entre 18,5 GB y 20,7 GB, por lo que se recomienda al menos 24 GB de VRAM para inferencia con cuantización MXFP4_MOE_Only, y 32 GB para las variantes con Q8_0 o F16.
- **GPU recomendadas**: NVIDIA RTX 4090 (24 GB) para la variante MXFP4_Only; A100 40 GB o H100 para las variantes de mayor precisión y para despliegue con contexto largo.
- **Compatibilidad consumer**: sí, cabe en GPUs de consumo de 24 GB (RTX 3090, RTX 4090) con la cuantización MXFP4_Only.
- **Opciones de despliegue**: llama.cpp, Ollama, vLLM (con soporte GGUF), TGI (con adaptadores).
- **Latencia y throughput**: no disponible. Se espera un throughput razonable en GPUs con suficiente VRAM, dado que solo se activan 3B parámetros por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ornith-1.5-35B-A3B | 34,66 B (3 B activos) | no disponible | MIT | HuggingFace, GGUF |
| Ornith-1.0-35B | 35 B (3 B activos) | no disponible | MIT | HuggingFace |
| Qwen3-30B-A3B | 30 B (3 B activos) | 128 K tokens | Apache 2.0 | HuggingFace |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card indica que el modelo está optimizado para inglés; el soporte de otros idiomas es limitado o no documentado.
- Los componentes Mamba pueden introducir problemas de estabilidad numérica en secuencias muy largas si no se usan los parámetros de precisión adecuados.
- La cuantización MXFP4 de los expertos puede reducir la calidad del razonamiento en tareas muy complejas si no se usa la variante con capas F16.
- La licencia MIT permite uso comercial, pero el modelo base y sus pesos están sujetos a los términos de los modelos Qwen subyacentes; se recomienda revisar las licencias de los componentes.
- El modelo puede alucinar o generar código incorrecto en tareas no cubiertas por su entrenamiento; se recomienda validar las salidas en entornos de producción.
- El repositorio fue actualizado el 2026-08-22 para eliminar la capa MTP; los archivos anteriores pueden no ser compatibles con las últimas versiones de llama.cpp.

## Enlaces

- Repositorio HuggingFace de este repositorio: https://huggingface.co/jashepp/Ornith-1.5-35B-A3B-MXFP4_MOE_Hybrid-Imatrix-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Blog de Ornith 1.5: https://ornith.ai/ornith_1_5.html
- Artículo de MindStudio sobre despliegue local: https://www.mindstudio.ai/blog/ornith-1-5-35b-a3b-local-run
- Artículo de OfficeChai sobre el lanzamiento: https://officechai.com/ai/deepreinforce-releases-open-source-orinth-1-5-family-of-models-with-solid-benchmarks-and-mit-license/
