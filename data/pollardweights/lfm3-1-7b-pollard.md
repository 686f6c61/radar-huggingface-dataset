# PollardWeights/LFM3-1.7B-Pollard

## Resumen

LFM3-1.7B-Pollard es una cuantización en formato GGUF del modelo LFM3-1.7B de LiquidAI, realizada por PollardWeights mediante la herramienta Pollard Weights. No se trata de un modelo nuevo, sino de una "escalera" de versiones comprimidas con asignación medida de bits: en lugar de aplicar una cuantización uniforme, se distribuyen los bits según la sensibilidad de cada capa, lo que reduce la pérdida de calidad. El resultado más compacto pasa de 3,46 GB en f16 a 0,86 GB, un 75 % menos de tamaño.

El modelo base, LFM3-1.7B, es un modelo conversacional de generación de texto de unos 1.700 millones de parámetros con arquitectura `lfm3`, orientado a ejecución local en equipos modestos. La relevancia de esta versión cuantizada radica en que conserva capacidades críticas como el tool calling (con plantilla de chat compatible con la sintaxis `qwen3_coder`) a la vez que cabe en máquinas con muy poca RAM o VRAM, siendo una opción práctica para agentes ligeros y despliegues en dispositivos de consumo.

Cada fichero del repositorio ha sido verificado con métricas de perplexidad, KLD media y concordancia top-1 respecto al f16 de referencia, lo que permite elegir el "escalón" adecuado con datos medidos y no solo estimaciones teóricas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `lfm3` (transformer híbrido de LiquidAI; detalles internos no disponibles en la ficha) |
| Parámetros totales | 1.728.801.600 (~1,7B) |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ3_S, IQ4_XS, Q6_K (también referenciados Q8_0 y Q4_K_M); cuantización con imatrix y asignación medida por capa |
| Idiomas soportados | inglés (en) |
| Licencia | other (heredada de LiquidAI/LFM3-1.7B; términos exactos no disponibles) |
| Formato de pesos | GGUF (compatible con llama.cpp, ik_llama.cpp, Ollama, LM Studio) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B usa la arquitectura `lfm3` de LiquidAI, de la que la ficha no detalla la composición interna (número de capas, tipo de atención o mezcla de tokens de entrenamiento). Lo que sí documenta el repositorio es el proceso de cuantización: Pollard Weights genera cuantizaciones de "asignación medida" (measured-allocation), donde los bits se colocan según la sensibilidad de cada capa en lugar de repartirlos de forma uniforme. Todas las cuantizaciones usan matriz de importancia (imatrix) para calibrar la cuantización.

La calidad de cada fichero se ha medido con perplexidad (llama-perplexity), KLD media frente al f16 y porcentaje de concordancia top-1 (proporción de tokens cuyo token más probable coincide con el del f16). Además, cada rung pasa una puerta de verificación (`pollard-verify --gate`) que comprueba que el fichero contiene el modelo completo, carga correctamente y supera pruebas de coherencia y ejecución. El tool calling se evalúa con 60 sondas (llamada simple, elección entre ocho herramientas, decisión de no llamar y argumentos anidados) a través de la API estilo OpenAI.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Tool calling / function calling: la plantilla de chat emite llamadas en sintaxis `qwen3_coder`; las tres cuantizaciones publicadas conservan entre el 98,3 % y el 100 % de la capacidad de llamada a herramientas del f16.
- Compatible con harnesses de agentes que hablen las APIs de OpenAI, Anthropic o Responses a través de `llama-server`.
- Ejecución en CPU o GPU consumer gracias al formato GGUF y al tamaño reducido (desde 0,86 GB).
- Soporte de contexto gestionado por el runtime (longitud exacta no disponible en la ficha).
- Idioma: inglés (no se documentan capacidades multilingües).

## Casos de uso

- Agentes locales ligeros: con 0,86-1,43 GB de pesos, el modelo cabe en portátiles sin GPU dedicada, y su tool calling verificado permite construir agentes que consulten APIs, bases de datos o funciones locales sin depender de la nube.
- Atención al cliente automatizada en local: sirve el modelo con `llama-server --jinja` exponiendo una API compatible con OpenAI; el bajo consumo de memoria permite varias instancias simultáneas en una sola máquina.
- Prototipado rápido de pipelines con herramientas: al mantener la sintaxis `qwen3_coder` y funcionar con el parser especializado de llama.cpp, es adecuado para probar flujos de function calling antes de escalar a modelos mayores.
- Integración en CI/CD y pruebas automatizadas: su pequeño tamaño permite descargarlo y ejecutarlo en runners de CI para validar que un harness de agentes sigue funcionando tras cambios de código.
- Aplicaciones de escritorio offline: funciona directamente en LM Studio, Jan, koboldcpp u Ollama (`ollama run hf.co/PollardWeights/LFM3-1.7B-Pollard`), ideal para asistentes que no pueden enviar datos a servicios externos.
- Enrutado o clasificación de peticiones como primer eslabón de un sistema multi-modelo: por su coste mínimo, puede actuar como modelo pequeño que decide si una consulta requiere un modelo mayor.
- Generación de texto en dispositivos edge o SBC con RAM limitada: el escalón IQ3_S (0,86 GB) deja margen suficiente para contexto incluso en equipos con 2-3 GB de memoria disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se han publicado métricas de calidad de cuantización medidas por el autor:

| Fichero | Perplexidad | KLD media | Concordancia top-1 | Retención tool calls | Tamaño |
|---|---:|---:|---:|---:|---:|
| LFM3-1.7B-Pollard-IQ3_S.gguf | 3,5361 | 0,1772 | 85,51 % | 98,3 % | 0,86 GB |
| LFM3-1.7B-Pollard-IQ4_XS.gguf | 3,483 | 0,0402 | 93,29 % | 100,0 % | 1,10 GB |
| LFM3-1.7B-Pollard-Q6_K.gguf | 3,4559 | 0,0087 | 97,09 % | 100,0 % | 1,43 GB |

Estas métricas se midieron contra el propio f16 del autor y no son comparables con cifras publicadas en otras suites de evaluación.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (según la propia ficha):
  - Q6_K (1,43 GB): ~3,4 GB de RAM/VRAM disponibles.
  - IQ4_XS (1,10 GB): ~3,1 GB de RAM/VRAM disponibles.
  - IQ3_S (0,86 GB): ~2,9 GB de RAM/VRAM disponibles.
- Cabe sobradamente en GPU consumer: cualquier GPU con 4 GB de VRAM (por ejemplo RTX 3050, GTX 1660 con offload parcial, o integradas modernas) ejecuta el escalón recomendado con `-ngl 99`; también funciona íntegramente en CPU.
- GPUs recomendadas: no disponible (el modelo no requiere GPU dedicada; cualquier GPU moderna acelera la inferencia vía llama.cpp).
- Opciones de despliegue: llama.cpp / llama-server (API compatible con OpenAI y UI web en el puerto 8080), ik_llama.cpp, Ollama, LM Studio, koboldcpp, Jan, ramalama. Para vLLM se indica el uso con los pesos originales y el parser `qwen3_coder`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Comparativa con las alternativas de cuantización del mismo repositorio y el modelo base:

| Modelo | Tamaño | PPL | Concordancia top-1 | Tool calls | Formato |
|---|---:|---:|---:|---:|---|
| LFM3-1.7B f16 (base) | 3,46 GB | referencia | 100 % (referencia) | 100 % (referencia) | f16 |
| LFM3-1.7B-Pollard Q6_K | 1,43 GB | 3,4559 | 97,09 % | 100,0 % | GGUF |
| LFM3-1.7B-Pollard IQ4_XS | 1,10 GB | 3,483 | 93,29 % | 100,0 % | GGUF |
| LFM3-1.7B-Pollard IQ3_S | 0,86 GB | 3,5361 | 85,51 % | 98,3 % | GGUF |
| LFM3-1.7B Q8_0 (referencia) | ~1,83 GB | no disponible | no disponible | no disponible | GGUF |
| LFM3-1.7B Q4_K_M (referencia) | ~1,00 GB | no disponible | no disponible | no disponible | GGUF |

Comparativas con modelos de otros fabricantes de tamaño similar (Qwen3-1.7B, Gemma 3 1B, etc.): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Idioma: solo se documenta soporte de inglés; no hay garantías de calidad en castellano ni en otros idiomas.
- El escalón más pequeño (IQ3_S) muestra una concordancia top-1 del 85,51 % y KLD media de 0,1772 frente al f16, lo que implica una degradación medible; para usos sensibles se recomienda Q6_K.
- Riesgo de alucinación: inherente a todo modelo de lenguaje de 1,7B; no se publican evaluaciones de factualidad, por lo que debe tratarse como no cuantificado.
- Longitud de contexto: no disponible en la ficha; conviene verificarla en la model card del modelo base antes de diseñar aplicaciones con documentos largos.
- Licencia "other": los términos exactos para uso comercial no se detallan en esta ficha; hay que revisar la licencia de LiquidAI/LFM3-1.7B antes de desplegar en producción.
- Las métricas de retención y perplexidad son del propio autor, medidas con su harness; no son comparables con benchmarks independientes ni con cifras de otros repositorios.
- El tool calling requiere servir con `--jinja` en llama.cpp y usar el parser `qwen3_coder`; sin esa configuración las llamadas no se interpretarán correctamente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/PollardWeights/LFM3-1.7B-Pollard
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Herramienta Pollard Weights: https://github.com/WestWaters/pollard-weights
- Autor del modelo base: https://huggingface.co/LiquidAI
