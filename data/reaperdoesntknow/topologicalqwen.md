# reaperdoesntknow/TopologicalQwen

## Resumen

TopologicalQwen es un modelo de lenguaje de 2.031.739.904 parametros (~2,03 B) desarrollado por Convergent Intelligence LLC y publicado en HuggingFace por el usuario reaperdoesntknow. Se obtiene mediante destilacion topologica de conocimiento (TKD, Topological Knowledge Distillation) a partir del profesor Qwen3-30B-A3B-Thinking-2507, un modelo MoE de 30.000 millones de parametros con 3.000 millones activos. El resultado es un modelo denso de ~1,7 B efectivos que hereda la arquitectura Qwen3ForCausalLM con ventana de contexto de 40.960 tokens y licencia Apache 2.0.

La innovacion principal reside en el metodo de destilacion: en lugar de la divergencia KL clasica, TKD trata la distribucion de salida del profesor como una funcion de variacion acotada (BV) y descompone la transferencia de conocimiento en tres canales — componente suave (AC), correcciones de salto en puntos de discontinuidad conceptual y correcciones de deriva de tipo Cantor — mediante la identidad fundamental de malla. El entrenamiento se realizo sobre 1.599 ejemplos de cadenas de razonamiento en fisica y matematicas (ecuaciones diferenciales, mecanica teorica, electromagnetismo y relatividad general) en formato DualMind, que estructura cada respuesta en bloques `<explore>`, `<examine>` y `<response>`.

El modelo esta especializado en razonamiento cientifico y demostraciones formales, con un bucle cognitivo de derivacion, autocritica y sintesis. Con solo ~2 B de parametros, ofrece capacidades de razonamiento que normalmente requieren modelos mucho mayores, a un coste computacional apto para GPU de consumo. Se publico el 28 de marzo de 2026 y acumula 3.174 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (Transformer decoder-only con GQA) |
| Parametros totales | 2.031.739.904 (~2,03 B; 1,7 B efectivos) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | BF16/FP16 (inferencia); GGUF generable via llama.cpp (el modelo base tiene variante GGUF publicada) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

TopologicalQwen utiliza la arquitectura Qwen3ForCausalLM con 28 capas, tamaño oculto de 2048, 16 cabezas de atencion para queries y 8 para keys/values (GQA), dimension intermedia de 6144 y vocabulario de 151.936 tokens. El entrenamiento se realizo en precision FP32 con autocast BF16 sobre una GPU H100 de Colab, y la inferencia soporta BF16 o FP16.

El pipeline TKD consta de cuatro fases: (1) cacheo de logits del profesor con compresion top-64 a disco en una unica pasada; (2) paso de topologia DISC que aplica un operador de discrepancia vectorizado para mapear el manifold de conocimiento, con deteccion de saltos a umbral 3σ y amplificacion de 1,25×; (3) ventaneo adaptativo guiado por topologia con ventanas de 512 tokens cortadas en posiciones de baja discrepancia (solapamiento de 32-128 tokens); y (4) destilacion continua por curriculum en cuatro fases, comenzando con el 30% mas facil de los datos. La funcion de perdida pondera los tokens de razonamiento con un factor que decae de 2,25× a 1,1×, y el coeficiente de destilacion α aumenta de 0 a 0,45. Se emplea divergencia KL con temperatura 2,0, tamaño de lote efectivo de 32 (2 × 16 acumulacion de gradientes), tasa de aprendizaje coseno de 5e-6 a 5e-7, 30 pasos de calentamiento, weight decay de 1e-3 y gradiente clip de 1,0.

El modelo hereda una cadena de destilacion previa: Qwen3-1.7B base → DiStil-Qwen3-1.7B-uncensored (SFT sin censura) → Disctil-Qwen3-1.7B (refinamiento DISC) → TopologicalQwen (TKD con profesor 30B-Thinking y formato DualMind). La metodologia completa esta documentada en la publicacion "Structure Over Scale" (DOI: 10.57967/hf/8165).

## Capacidades

- Razonamiento cientifico y matematico: especializado en demostraciones, derivaciones y resolucion de problemas en ecuaciones diferenciales, mecanica teorica, electromagnetismo y relatividad general.
- Formato DualMind: genera respuestas estructuradas en tres bloques (`<explore>` para derivacion, `<examine>` para autocritica adversarial y `<response>` para sintesis final), simulando un bucle cognitivo completo.
- Autocritica y verificacion: el bloque `<examine>` implementa una autoevaluacion de la propia derivacion, lo que mejora la fiabilidad de las respuestas frente a errores de razonamiento.
- Razonamiento multi-paso: la estructura de exploracion y examinacion permite resolver problemas que requieren cadenas de razonamiento largas, con soporte de hasta 40.960 tokens de contexto.
- Generacion de texto conversacional: compatible con prompts en formato `##USER:` y pipelines de chat estandar de transformers.
- Capacidades multilingues: no documentadas; el tokenizador hereda el vocabulario de Qwen3 (151.936 tokens) con soporte multilingue potencial, pero los datos de entrenamiento estan en ingles.

## Casos de uso

- Asistente de demostraciones matematicas: el modelo puede generar
