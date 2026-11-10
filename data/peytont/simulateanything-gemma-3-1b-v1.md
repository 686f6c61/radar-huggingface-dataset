# PeytonT/SimulateAnything-Gemma-3-1B-v1

## Resumen

SimulateAnything-Gemma-3-1B-v1 es un adaptador LoRA de rango 16 sobre Google Gemma 3 1B IT, publicado por el desarrollador independiente PeytonT. No se trata de un modelo de propósito general, sino de una adaptación supervisada de dominio orientada a la autoría de escenas declarativas de cuerpos rígidos y a la interpretación estructurada de peticiones del usuario en el contexto de la aplicación SimulateAnything, un entorno de simulación física basado en Rapier que se ejecuta en el navegador.

El adaptador cuenta con 13.045.760 parámetros entrenables y se distribuye junto al modelo base fusionado y exportado a ONNX en cuantización q4, de modo que la inferencia puede ejecutarse localmente en un navegador mediante WebGPU con Transformers.js. El modelo propone escenas con esferas, cajas, cilindros, masas, poses, tamaños, restitución, contactos rígidos y decorado visual (bosque y arroyo), y una segunda inferencia extrae recuentos de objetos y restricciones que el código de la aplicación compara con la escena compilada antes de que el usuario revise y aplique los cambios.

Su relevancia es acotada pero concreta: demuestra un patrón de despliegue de un LLM pequeño (1B) como capa de interpretación de intenciones dentro de una aplicación de simulación, con separación estricta entre generación declarativa y ejecución de código (el código generado nunca se ejecuta). El autor marca explícitamente el estado como "browser qualification pending", por lo que la publicación no constituye evidencia de calidad general ni de intención de usuario correctamente interpretada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text) con adaptador LoRA de rango 16 sobre el modelo base google/gemma-3-1b-it |
| Parametros totales | No disponible (modelo base Gemma 3 1B; el adaptador aporta 13.045.760 parametros entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (presupuesto de decodificacion recomendado: 512 tokens) |
| Tipos de cuantizacion | ONNX q4 simetrico en bloques de 32; adaptador PEFT en precision original |
| Idiomas soportados | Ingles (en) |
| Licencia | Gemma (sujeta a los terminos de uso y politica de usos prohibidos de Gemma) |
| Formato de pesos | safetensors (adaptador PEFT en `adapter/`), ONNX (modelo fusionado q4 con datos externos), transformers.js |

## Arquitectura y entrenamiento

El modelo base es Gemma 3 1B IT, un transformer decoder-only de Google. Sobre él se aplica un adaptador PEFT LoRA de rango 16, alpha 32 y dropout 0,05, entrenado con AdamW a una tasa de aprendizaje de 0,0002 con decaimiento coseno y semilla 716. El entrenamiento se realizó en dos pasadas: una primera con 1.232 ejemplos sintéticos originales de autoría de escenas y conversación durante tres épocas, y una segunda con 2.464 ejemplos durante una época, en la que se repite la autoría junto con extracción de intención estructurada. La tupla exacta "cuatro esferas moradas a cinco metros" se excluyó del entrenamiento y se mantiene como test de regresión expuesto.

La exportación se realizó con Transformers 4.57.6, PEFT 0.17.1, Optimum ONNX 0.1.0 / Optimum 2.0.0 y ONNX Runtime 1.21.0, generando un grafo ONNX con cuantización q4 simétrica en bloques de 32. El grafo y sus datos externos deben distribuirse juntos. El runtime de navegador es una compilación derivada de Transformers.js 4.3.2 limitada a Gemma, sobre ONNX Runtime Web con WebGPU. El autor advierte que la pérdida de entrenamiento no equivale a precisión, y que se trata de adaptación supervisada de dominio, no de aprendizaje por refuerzo encarnado ni de entrenamiento en línea.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogos de autoría de escenas.
- Propuesta de escenas declarativas de cuerpos rígidos: esferas, cajas, cilindros, masas, poses, tamaños, restitución y contactos rígidos.
- Generación de decorado visual (bosque y arroyo) dentro del dominio de la aplicación.
- Edición de escenas existentes mediante peticiones en lenguaje natural.
- Extracción estructurada de intención: una segunda inferencia aislada obtiene recuentos de objetos y restricciones para su comparación programática con la escena compilada.
- Integración con un ciclo de vida AgentCore/EnvironmentActions y simulación en seco nativa con Rapier antes de la revisión explícita del usuario.
- Ejecución local en navegador mediante WebGPU con Transformers.js y ONNX Runtime Web.
- No soporta tool calling genérico, agentes multi-paso abiertos, visión, audio ni modo de razonamiento extendido según la información disponible.

## Casos de uso

- Autoría asistida de escenas físicas en el navegador: el usuario describe una escena en lenguaje natural y el modelo emite una propuesta declarativa que la aplicación compila y valida con Rapier antes de aplicarla, sin ejecutar código generado.
- Verificación de intención del usuario: la segunda inferencia extrae recuentos y restricciones (por ejemplo, número de objetos y distancias) y el código de la aplicación los compara con la escena compilada para detectar discrepancias antes de aplicar cambios.
- Edición incremental de escenas existentes: el modelo recibe el estado actual y una petición de modificación (cambiar masa, restitución o pose) y devuelve una escena revisada dentro del subconjunto de acciones soportado.
- Docencia y demostraciones de física básica: creación rápida de escenarios con esferas, cajas y cilindros con parámetros de contacto y restitución para ilustrar colisiones y estabilidad, siempre con revisión humana previa.
- Prototipado de interfaces conversacionales para herramientas de simulación: sirve como referencia de integración de un LLM de 1B cuantizado a q4 en un frontend WebGPU con separación estricta entre generación y ejecución.
- Pruebas de regresión de dominio: la tupla "cuatro esferas moradas a cinco metros", excluida del entrenamiento, actúa como test expuesto para evaluar la generalización del adaptador en autoría estructurada.
- Evaluación de pipelines de adaptación supervisada: los scripts de construcción de datos, exportación y cualificación del repositorio permiten reproducir el flujo completo con semilla y versiones fijadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la evaluación nativa y sus fallos se conservan en `qualification.json` y que el estado de cualificación en navegador está pendiente, por lo que no se ofrecen cifras de MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,9 GB e incluye el modelo fusionado en ONNX q4, lo que sugiere un consumo en el orden de 1 GB o inferior para el grafo cuantizado, sin cifra confirmada por el autor.
- GPU recomendadas: no disponible. El runtime objetivo es WebGPU en navegador, por lo que se requiere un navegador y una GPU con soporte WebGPU; no se especifican modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí por tamaño (modelo base de 1B en q4), aunque no hay confirmación ni lista de GPUs validadas en la información proporcionada.
- Opciones de despliegue: Transformers.js 4.3.2 (compilación derivada limitada a Gemma) con ONNX Runtime Web y WebGPU; el adaptador puede cargarse con PEFT usando `subfolder="adapter"` sobre el modelo base. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Se recomienda decodificación greedy con un presupuesto de 512 tokens según las instrucciones de reproducción del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimulateAnything-Gemma-3-1B-v1 | Base 1B + LoRA de 13,05 M entrenables | No disponible | Adaptación de dominio para autoría de escenas y extracción de intención | Gemma | Hugging Face, ONNX q4 para navegador |
| google/gemma-3-1b-it | 1B | No disponible en la informacion proporcionada | Modelo instructivo de propósito general | Gemma | Hugging Face |
| Alternativas de 1B para despliegue en navegador | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a parámetros, enfoque y licencia.

## Limitaciones y advertencias

- Estado declarado por el autor: "browser qualification pending"; la publicación no es evidencia de ser el mejor modelo general ni de interpretar correctamente la intención del usuario.
- El alcance de acciones es limitado: esferas, cajas, cilindros, masa, pose, tamaño, restitución, contactos rígidos y decorado visual; no resuelve hidrología, química, crecimiento de ecosistemas ni multiphísica arbitraria.
- La extracción aprendida de intención puede ser errónea; no constituye una prueba de intención del usuario ni de precisión física.
- La pérdida de entrenamiento no equivale a precisión; los fallos de evaluación nativa se conservan en `qualification.json`.
- Entrenamiento exclusivamente en inglés; no hay soporte multilingüe declarado.
- Riesgo de alucinación en la generación de escenas y en la extracción de restricciones, mitigado parcialmente por la simulación en seco con Rapier y la revisión humana antes de aplicar.
- El modelo no es consciente, no entrena en línea y no garantiza una interpretación correcta.
- Uso y distribución sujetos a la licencia Gemma, incluidos los términos de uso y la política de usos prohibidos; no se implica respaldo de Google.
- Los pesos modificados se identifican en NOTICE, en la documentación del grafo ONNX y en los metadatos del adaptador; el grafo ONNX y sus datos externos deben distribuirse juntos.
- Para producción, el autor exige fijar una revisión cualificada de forma independiente y anclar el commit del repositorio y la revisión del modelo base indicados en `provenance.json`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PeytonT/SimulateAnything-Gemma-3-1B-v1
- Repositorio del proyecto (scripts de chat-model): https://github.com/peytontolbert/simulateanything/tree/main/scripts/chat-model
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Política de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
