# EPFL-LARA/lean-world-model-qwen3-4b-grpo

## Resumen
Lean World-Model Prover — Qwen3-4B es un modelo de generacion de texto especializado en demostracion automatica de teoremas en Lean 4. Lo desarrolla EPFL-LARA (grupo de investigacion de la École polytechnique fédérale de Lausanne) y se presenta como el modelo del paper WM4 en su etapa posterior a un entrenamiento con GRPO (Group Relative Policy Optimization). Parte del modelo base Qwen/Qwen3-4B-Base y se distribuye mediante la libreria transformers en formato safetensors.

Su rasgo diferencial es que funciona como un "world model" de Lean: en lugar de limitarse a emitir codigo, genera demostraciones acompanadas de bloques de comentarios con los goal states previstos y los diagnosticos que previsiblemente devolveria el compilador. Esto permite que el modelo simule la realimentacion de Lean dentro de su propia respuesta y encadene intentos de reparacion sucesivos sin necesidad de invocar al compilador en cada paso.

El modelo tiene 4.411.424.256 parametros activos (arquitectura densa, no MoE) y opera con un contexto total de 32.768 tokens. Es relevante ahora porque aborda uno de los cuellos de botella de la demostracion formal asistida por IA: la necesidad de ciclos costosos de compilacion y correccion, sustituyendolos por predicciones internas del estado del objetivo. El modelo esta orientado exclusivamente al ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen3 heredada de Qwen/Qwen3-4B-Base), ajustada como lean world model |
| Parametros totales | 4.411.424.256 (≈4,4 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens (contexto total configurado en el runner del autor) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors; no se listan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only derivado de Qwen3-4B-Base (aproximadamente 4,4 B de parametros). Sobre esa base, EPFL-LARA aplico un pipeline de tres etapas segun los datasets referenciados: un preentrenamiento continuado sobre EPFL-LARA/lean-world-model-cpt, un ajuste supervisado sobre EPFL-LARA/lean-world-model-sft y una etapa de aprendizaje por refuerzo con GRPO sobre Goedel-LM/RL_dataset_V2. La ficha corresponde al checkpoint posterior a GRPO. Cada uno de los tres datasets aparece vinculado en las etiquetas del modelo, lo que documenta la secuencia completa de entrenamiento.

La innovacion tecnica principal es el formato de salida tipo "world model": el modelo emite la prueba en bloques de codigo `lean4` y, en linea, bloques de comentarios `/- <feedback> ... </feedback> -/` que contienen los goal states y diagnosticos previstos del compilador. Esto le permite realizar varios intentos de reparacion corregidos dentro de una unica respuesta. El autor recomienda usar el ultimo bloque de codigo Lean completo como candidato final para la verificacion real. La inferencia de referencia emplea vLLM 0.12.0, un prompt de completado en crudo, tokenizacion sin tokens especiales (`add_special_tokens=False`) y una temperatura por defecto de 0,3 para una muestra y 0,7 para 32 muestras, con top-p 0,95.

## Capacidades
- Generacion de demostraciones en Lean 4 sobre contextos que importan Mathlib y terminos terminados en `by sorry`.
- Prediccion de goal states y diagnosticos del compilador Lean como comentarios inline en el formato `/- <feedback> ... </feedback> -/`.
- Reparacion iterativa: una misma respuesta puede contener intentos de prueba sucesivos corregidos.
- Formato conversacional (etiqueta `conversational`), aunque el runner oficial usa un prompt de completado en crudo.
- Capacidad de completar pruebas en el contexto formal proporcionado por el usuario (imports, contexto y teorema).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible como caracteristica declarada (la reparacion dentro de la respuesta es el unico mecanismo multi-intento documentado).
- Capacidades multilingues: limitadas al ingles (en).
- Capacidades especiales: modo de prediccion de realimentacion del compilador (world model). Sin vision ni audio.

## Casos de uso
- Completar teoremas en proyectos Lean 4/Mathlib: dado un archivo con un teorema terminado en `by sorry`, el modelo genera una prueba candidata y anota los estados de objetivo esperados, reduciendo el numero de recompilaciones manuales durante el desarrollo.
- Asistente integrado en el editor: aprovechar los bloques `feedback` para anticipar los errores de Lean y proponer correcciones dentro del mismo mensaje, lo que acelera el bucle editar-compilar para el usuario.
- Generacion de datos de demostracion formal: producir pares (enunciado, prueba) con trazas de goal states que pueden reutilizarse para entrenar o evaluar otros demostradores.
- Deteccion de `sorry` y lagunas en repositorios Lean: escanear archivos y generar propuestas de prueba para cada `sorry`, usando el ultimo bloque Lean de la respuesta como candidato a verificar.
- Integracion en pipelines de CI para bibliotecas Lean: comprobar de forma automatizada que las pruebas generadas pasan la verificacion real del compilador antes de aceptarlas.
- Investigacion en razonamiento formal: usar el modelo como componente de un sistema de autocompletado de pruebas para estudiar estrategias de reparacion guiadas por predicciones del estado del objetivo.
- Ensenanza de Lean 4: generar pruebas comentadas con los estados de objetivo intermedios, utiles como material didactico para explicar el paso a paso de una demostracion.
- Reparacion asistida de pruebas fallidas: dado un fragmento que no compila, pedir al modelo una version corregida con intentos multiples dentro de una sola respuesta.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- Parametros: 4,4 B, arquitectura densa.
- VRAM estimada (pesos mas overhead de activaciones y cache KV):
  - FP16/BF16: aproximadamente 8,8 GB solo en pesos; en la practica se recomienda entre 10 y 12 GB de VRAM.
  - INT8: aproximadamente 4,4 GB en pesos, con overhead adicional.
  - INT4: aproximadamente 2,2-3 GB en pesos, con overhead adicional.
- GPU recomendadas: no especificadas por el autor. Por tamano, cabe con holgura en A100 (40/80 GB) y H100, y en GPUs de consumo como RTX 4090 y RTX 3090 (24 GB) en precision completa.
- Compatibilidad con GPU de consumo: si, en tarjetas de 16-24 GB en FP16; en GPUs de 8-12 GB requeriria cuantizacion, que el autor no publica.
- Opciones de despliegue: vLLM 0.12.0 (flujo de referencia del autor), transformers y text-generation-inference (segun etiquetas). No hay pesos GGUF publicados, por lo que Ollama y llama.cpp no son viables sin conversion previa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. La unica referencia documentada es el modelo base del que deriva:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| EPFL-LARA/lean-world-model-qwen3-4b-grpo | 4,4 B (denso) | 32.768 tokens | No disponible | HuggingFace (safetensors) |
| Qwen/Qwen3-4B-Base (modelo base) | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | HuggingFace |
| Otros demostradores de Lean comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias
- Licencia no especificada: al no declararse una licencia, el uso comercial y la redistribucion quedan sin marco claro; conviene contactar con EPFL-LARA antes de usarlo en produccion.
- Riesgo de alucinacion: los goal states y diagnosticos que el modelo incluye en los bloques de feedback son predicciones y pueden no coincidir con la salida real del compilador Lean; siempre hay que verificar la prueba con Lean.
- El autor advierte de que solo debe tomarse el ultimo bloque de codigo Lean completo como candidato final de verificacion, lo que implica que las respuestas contienen intentos intermedios descartables.
- Idioma: el modelo esta entrenado unicamente en ingles; el rendimiento en otros idiomas no esta documentado.
- Contexto limitado a 32.768 tokens totales, incluyendo el prompt del problema y los tokens de salida; problemas con contexto formal muy extenso pueden no caber.
- Especializacion estrecha: es un modelo para Lean 4 y demostracion formal, no un modelo generalista; puede degradar en otras tareas.
- Cero descargas y cero "likes" en el momento de la consulta, sin benchmarks publicados que respalden su rendimiento frente a alternativas.
- No se publican pesos cuantizados, lo que puede limitar el despliegue en hardware con poca VRAM.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/EPFL-LARA/lean-world-model-qwen3-4b-grpo
- Coleccion "Formal Theorem Proving with Lean World Models": https://huggingface.co/collections/EPFL-LARA/formal-theorem-proving-with-lean-world-models-6ad2b4aa4400b3e2933f380d
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset de preentrenamiento continuado: EPFL-LARA/lean-world-model-cpt
- Dataset de ajuste supervisado: EPFL-LARA/lean-world-model-sft
- Dataset de RL: Goedel-LM/RL_dataset_V2
- EPFL (institucion): https://www.epfl.ch/en/
- EPFL en Wikipedia: https://en.wikipedia.org/wiki/%C3%89cole_Polytechnique_F%C3%A9d%C3%A9rale_de_Lausanne
- Paper asociado (WM4): no disponible como enlace directo en la informacion proporcionada.
