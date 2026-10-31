# DeepNarra/Hiraya-1-Reasoning

## Resumen

DeepNarra Hiraya-1-Reasoning 1.0 (0.91B-A100M) es un modelo de lenguaje de razonamiento desarrollado por DeepNarra, construido sobre su modelo base Hiraya-1-Instruct. Es la cuarta fase de un pipeline de entrenamiento acumulativo que incluye preentrenamiento, ampliación de arquitectura MoE, ajuste por instrucciones y, finalmente, post-entrenamiento de razonamiento autónomo mediante GRPO (al estilo DeepSeek-R1) sobre un gimnasio matemático verificado formalmente con SymPy.

El modelo destaca por su arquitectura H-MoE-Zamba2 jerárquica anidada con 92 expertos, que activa aproximadamente 100M de parámetros por token de los 908,6 millones totales. Esto lo posiciona como un modelo compacto orientado a investigación en razonamiento con representaciones latentes continuas (estilo Coconut), decodificación especulativa y despliegue en dispositivos de borde.

Su relevancia reside en combinar un tamaño muy reducido (1,73 GB en FP16) con capacidades de razonamiento verificado mediante un oráculo simbólico determinista, algo poco habitual en modelos de menos de 1B de parámetros. Está publicado bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-MoE-Zamba2-92-Expert-Nested-Hierarchical (MoE jerárquico anidado) |
| Parametros totales | 908.645.372 (verificado en safetensors) |
| Parametros activos | ~100M por token (23 macro-engines × 4 micro-expertos + experto compartido de fundación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (pesos originales); se menciona soporte previsto de BitNet b1.58 en GGUF para despliegue en borde, sin detalles publicados |
| Idiomas soportados | Inglés y multilingüe (datasets Aya Collection y FineWeb-Edu); lista concreta de idiomas no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (1.733,68 MB, 1.331 tensores); el README menciona también GGUF |

## Arquitectura y entrenamiento

Hiraya-1-Reasoning emplea una arquitectura MoE jerárquica anidada denominada H-MoE-Zamba2 con 92 sub-expertos organizados en 23 macro-engines de 4 micro-expertos cada uno, más un experto compartido de fundación. Esta estructura activa aproximadamente 100M de parámetros por token, combinando eficiencia de inferencia tipo MoE con memoria recurrente sub-cuadrática (herencia de la línea Zamba2, que mezcla atención y bloques tipo SSM/Mamba). El lineage acumulativo consta de cuatro fases: preentrenamiento base con optimizador Muon (5.000 pasos), upcycling a 92 sub-expertos, SFT agéntico de 14 horizontes y la fase final de razonamiento autónomo.

El post-entrenamiento de razonamiento (fase 4) se realizó mediante GRPO inspirado en DeepSeek-R1 durante 2.500 pasos sobre un gimnasio matemático generado proceduralmente (álgebra, cálculo, teoría de números y geometría), con recompensa verificada por un oráculo determinista de equivalencia de pruebas simbólicas basado en SymPy, lo que según el autor elimina el reward hacking matemático. Se reporta una recompensa media verificable de +1,45 y la penalización de 2.000 trayectorias con bucles de repetición. El modelo incorpora además deliberación con scratchpad `<think>` en estilo Coconut (continuous chain-of-thought latente). Los datasets upstream incluyen FineWeb-Edu, no_robots, Aya Collection y CodeFeedback-Filtered-Instruction.

## Capacidades

- Generacion de texto general y seguimiento de instrucciones (heredado del SFT sobre no_robots y fases previas).
- Razonamiento matemático formal en álgebra, cálculo, teoría de números y geometría, verificado simbólicamente con SymPy.
- Generación de codigo, entrenado con CodeFeedback-Filtered-Instruction, con ejecución diseñada para un sandbox restringido (Airlock Sandbox con verificación AST estática y firewall SSRF).
- Razonamiento con scratchpad explícito `<think>` y deliberación latente continua (Coconut).
- Capacidades agénticas multi-paso heredadas del SFT de 14 horizontes de la fase 3; el README reporta una auditoría ReAct de 6/6 tareas superadas en 0,57 s.
- Capacidades multilingües derivadas de Aya Collection, sin lista concreta de idiomas publicada.
- Soporte de tool calling orientado a entornos sandboxados; no se documenta soporte nativo de visión ni audio.

## Casos de uso

- Asistentes matemáticos educativos: el modelo puede resolver problemas de álgebra y cálculo paso a paso con scratchpad `<think>`, y sus respuestas proceden de un entrenamiento con verificación simbólica, adecuado para tutores de matemáticas de bajo coste.
- Investigación en razonamiento latente: su entrenamiento con Coconut y representaciones continuas lo hace idóneo como banco de pruebas para estudiar chain-of-thought latente frente a razonamiento textual explícito.
- Agentes autónomos en entornos sandboxados: sus capacidades ReAct y de tool calling, combinadas con el sandbox Airlock con verificación AST y bloqueo de redes privadas, permiten experimentar con agentes de ejecución de código de forma contenida.
- Despliegue en dispositivos de borde: con 1,73 GB en FP16 y ~100M de parámetros activos por token, cabe en hardware modesto; el propio autor apunta al despliegue BitNet b1.58 en GGUF para edge.
- Generacion y revisión de codigo en flujos ligeros: entrenado con CodeFeedback, puede integrarse en asistentes de código donde la latencia y el coste importan más que el rendimiento de frontera.
- Investigación en decodificación especulativa: su tamaño compacto y arquitectura MoE lo hacen candidato como modelo draft en esquemas de decodificación especulativa con modelos mayores.
- Prototipado de sistemas MoE jerárquicos: al publicar código de arquitectura personalizada bajo Apache 2.0, sirve como referencia abierta para estudiar diseños MoE anidados de 92 expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta telemetría de entrenamiento propia: recompensa media verificable de +1,45 en el gimnasio SymPy, 2.000 trayectorias repetitivas eliminadas y una auditoría interna ReAct de 6/6 tareas superadas en 0,57 s. Estos datos provienen del autor y no son comparables con benchmarks independientes.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8-2 GB en FP16 para los pesos (1,73 GB), más overhead de activaciones y KV-cache; con cuantización adicional podría operar por debajo de 2 GB, aunque no hay cuantizaciones publicadas.
- GPU recomendadas: cualquier GPU moderna de consumo es suficiente; por ejemplo, una RTX 3060 de 12 GB o incluso GPUs de 4-6 GB serían adecuadas. No se requieren A100 ni H100 para inferencia.
- Cabe con holgura en GPUs de consumo (RTX 3060, RTX 4060, RTX 4090) e incluso es plausible su ejecución en CPU dado el tamaño, aunque el autor no documenta rendimiento en CPU.
- Opciones de despliegue: el quickstart oficial usa transformers con carga directa de safetensors vía huggingface_hub. No se documenta soporte verificado para vLLM, llama.cpp, Ollama o TGI; la mención a GGUF sugiere compatibilidad futura con llama.cpp/Ollama, pero no confirmada.
- Latencia y throughput: no disponibles; la única métrica temporal publicada es la auditoría ReAct interna (6 tareas en 0,57 s), que no es directamente extrapolable a latencia de inferencia general.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Enfoque |
|---|---|---|---|---|
| DeepNarra Hiraya-1-Reasoning | 908,6M (~100M activos) | H-MoE-Zamba2 jerárquico (MoE + memoria recurrente) | Apache 2.0 | Razonamiento con GRPO y verificación SymPy |
| Qwen2.5-0.5B-Instruct | ~0,5B | Transformer denso | Apache 2.0 / Qwen (según variante) | Uso general multilingüe |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,5B | Transformer denso | MIT | Destilación de razonamiento de DeepSeek-R1 |
| SmolLM2-1.7B-Instruct | ~1,7B | Transformer denso | Apache 2.0 | Uso general compacto |

Hiraya-1-Reasoning se distingue por ser el único del grupo con arquitectura MoE jerárquica y entrenamiento con recompensa verificada simbólicamente, a costa de ser un modelo experimental de autor pequeño sin benchmarks independientes publicados, frente a alternativas como Qwen2.5 o SmolLM2 que cuentan con evaluaciones amplias y ecosistemas de despliegue maduros.

## Limitaciones y advertencias

- El propio autor lo califica de arquitectura experimental entrenada con presupuesto de cómputo compacto y recomienda verificación independiente de salidas en dominios de alto riesgo (médico, legal, financiero o crítico para seguridad).
- No existen benchmarks estandarizados independientes; todas las métricas publicadas (recompensa RL, auditoría ReAct) provienen del autor y no han sido auditadas externamente.
- El riesgo de alucinación no está cuantificado; la verificación SymPy aplica solo al dominio matemático del gimnasio de entrenamiento, no a las respuestas en general.
- La longitud de contexto no está documentada, lo que dificulta evaluar su idoneidad para tareas con documentos largos.
- El dataset no_robots está bajo CC-BY-NC-4.0; aunque los pesos del modelo se publican bajo Apache 2.0, existe una zona gris potencial respecto a la influencia de datos no comerciales en el modelo final que conviene revisar antes de uso comercial sensible.
- Las capacidades de ejecución de código y tool calling están diseñadas para el sandbox Airlock de DeepNarra; usarlas fuera de un entorno sandboxado conlleva riesgos de seguridad evidentes.
- La lista de idiomas soportados, el contexto y las cuantizaciones disponibles no están especificados, lo que limita la planificación de despliegue multilingüe.
- Con 966 descargas y sin comunidad establecida, el soporte, la documentación y la corrección de errores dependen íntegramente del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DeepNarra/Hiraya-1-Reasoning
- Organización DeepNarra: https://huggingface.co/DeepNarra
- Modelo base (fase 3): https://huggingface.co/DeepNarra/Hiraya-1-Instruct
- Licencia Apache 2.0: http://www.apache.org/licenses/LICENSE-2.0
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
  - https://huggingface.co/datasets/HuggingFaceH4/no_robots
  - https://huggingface.co/datasets/CohereForAI/aya_collection
  - https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
- Paper técnico, repositorio de código independiente y demos: no disponibles
