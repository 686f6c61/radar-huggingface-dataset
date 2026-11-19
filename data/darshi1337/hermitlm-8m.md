# darshi1337/hermitlm-8M

## Resumen

hermitlm-8M es un modelo de lenguaje causal de tipo transformer, con aproximadamente 8 millones de parámetros, desarrollado por el usuario darshi1337 y publicado en Hugging Face bajo licencia MIT. Su propósito es muy específico: mantener conversaciones de rol interpretando a un pequeño cangrejo en un mundo acuático. No es un modelo de propósito general, sino una demostración de cómo un modelo extremadamente pequeño puede especializarse en una persona concreta mediante ajuste supervisado (SFT) sobre plantillas y paráfrasis escritas a mano.

El modelo se distribuye en varios formatos: un checkpoint de PyTorch (`best_model.pt`), una exportación ONNX de precisión completa y una versión cuantizada a uint8 de unos 9 MB pensada para ejecutarse en el navegador. Incorpora además dos sondas de decisión entrenadas sobre características congeladas: una sonda de intención de 7 vías y otra de enrutamiento de herramientas de 4 vías (matemáticas, web, FAQ, chat).

Su relevancia es acotada pero interesante para quien investigue modelos ultrapequeños, despliegue en el navegador o evaluación de personas y enrutamiento de herramientas en entornos con recursos mínimos. No compite con modelos de propósito general ni debe evaluarse con esos criterios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (6 capas, dim. oculta 320, 8 cabezas, FFN SwiGLU 800, posiciones aprendidas, LayerNorm, LM head con pesos atados) |
| Parámetros totales | ~8 millones |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (secuencia máxima) |
| Tipos de cuantización | uint8 (ONNX cuantizado, ~9 MB); checkpoint PyTorch en precisión completa |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_model.pt`), ONNX (`model.onnx`, `model.quant.onnx`), tokenizer BPE (`tokenizer.json`) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 6 capas con dimensión oculta de 320, 8 cabezas de atención, FFN SwiGLU de dimensión 800, posiciones aprendidas, LayerNorm y cabeza de lenguaje con pesos atados al embedding. El vocabulario es de 3774 tokens con tokenizador BPE de nivel de bytes, y la secuencia máxima es de 512 tokens. El repositorio incluye el `config.json` con la configuración completa de modelo y entrenamiento.

El entrenamiento consistió en SFT durante 32.000 pasos sobre 104.200 ejemplos, combinando plantillas balanceadas y aproximadamente 4.200 paráfrasis naturales escritas a mano, con variantes prefijadas por la persona `[mode crab]`. El checkpoint publicado es el modelo SFT; las etapas PPO y DPO son opcionales dentro del repositorio. Según la model card, la perplejidad es de 1,931 y la recompensa de persona ronda 0,50 con variación entre muestreos.

## Capacidades

- Generación de texto conversacional en inglés con una persona fija (cangrejo en un mundo acuático).
- Diálogo de rol con plantillas y paráfrasis naturales; sensible al prefijo de modo `[mode crab]`.
- Sonda de intención de 7 vías sobre características congeladas (`decision_probe.pt`).
- Sonda de enrutamiento de herramientas de 4 vías: matemáticas, web, FAQ y chat (`decision_tool_probe.pt`).
- Exportación ONNX ejecutable en navegador, con versión cuantizada uint8 de ~9 MB.
- No se documentan capacidades de tool calling nativo, agentes, visión, audio ni razonamiento multi-paso más allá de las sondas mencionadas.

## Casos de uso

- Demostración educativa de ajuste de persona en modelos ultrapequeños: sirve para ilustrar el flujo completo (tokenizador BPE, SFT, exportación ONNX) en cursos y tutoriales, dado su tamaño de ~8M parámetros y su licencia MIT.
- Chat de rol embebido en navegador: la versión `model.quant.onnx` (~9 MB) permite ejecutar la conversación íntegramente en el cliente sin backend, con fallback a `model.onnx` de precisión completa.
- Enrutamiento de intenciones en asistentes ligeros: la sonda de 7 vías puede clasificar la intención del usuario antes de derivar a otro componente, con un coste computacional mínimo.
- Enrutamiento de herramientas en prototipos: la sonda de 4 vías (math/web/faq/chat) permite decidir si una consulta requiere cálculo, búsqueda web, respuesta de FAQ o chat libre, con una precisión reportada de 0,725 sobre 80 consultas escritas a mano.
- Pruebas de concepto de personajes para videojuegos o experiencias interactivas: la persona fija y el vocabulario reducido encajan en NPCs con diálogo acotado y recursos muy limitados.
- Investigación sobre generalización de personas: el contraste entre la precisión de la sonda en filas de evaluación generadas (0,9998 en 7 vías) y en mensajes retenidos escritos a mano (0,6212) ofrece un caso de estudio sobre la brecha de generalización en modelos pequeños.
- Evaluación de pipelines de cuantización: la comparación entre `model.onnx` y `model.quant.onnx` permite medir el impacto de la cuantización uint8 en un modelo de juguete antes de aplicarla a modelos mayores.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Perplejidad | 1,931 |
| Recompensa de persona | ~0,50 (varía según muestreo) |
| Sonda de 7 vías (filas de evaluación generadas) | 0,9998 |
| Sonda de 21 vías (filas de evaluación generadas) | 0,9932 |
| Sonda de 7 vías (126 mensajes retenidos escritos a mano) | 0,6212 |
| Sonda de enrutamiento de herramientas (80 consultas escritas a mano) | 0,725 |
| Enrutamiento web (antes/después de añadir consultas naturales y negativos difíciles) | 0,15 → 0,65 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa; la versión ONNX cuantizada uint8 ocupa ~9 MB, por lo que cabe en cualquier entorno con unos pocos cientos de MB de memoria.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU sin problemas. Cualquier GPU consumer (incluso integradas) es suficiente.
- Cabe en GPU consumer: sí, en cualquier modelo, incluidos portátiles y dispositivos de gama baja.
- Opciones de despliegue: PyTorch (checkpoint `best_model.pt`), ONNX Runtime (navegador o servidor), y cualquier runtime compatible con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el formato no es GGUF y el tamaño no lo justifica.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia cualitativa, los modelos ultrapequeños de la familia TinyStories (del orden de 1M a 30M de parámetros) comparten escala y propósito educativo, pero no se han facilitado cifras que permitan una comparación rigurosa. Se indica "no disponible" para los campos de rendimiento comparado.

## Limitaciones y advertencias

- Modelo de propósito muy específico: persona fija de cangrejo y vocabulario de 3774 tokens; no es adecuado para tareas generales de generación, código o matemáticas.
- Ventana de contexto de solo 512 tokens, insuficiente para conversaciones largas o documentos.
- Solo inglés; no hay soporte multilingüe documentado.
- Brecha de generalización notable: la sonda de 7 vías cae de 0,9998 en datos generados a 0,6212 en mensajes retenidos escritos a mano, lo que sugiere sobreajuste a las plantillas de entrenamiento.
- Riesgo alto de alucinación y de respuestas incoherentes fuera del dominio de la persona; la perplejidad de 1,931 se mide sobre datos de evaluación propios, no sobre texto general.
- La recompensa de persona (~0,50) indica variabilidad considerable entre muestreos.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías; el modelo no debe presentarse como fiable para producción sin validación adicional.
- El repositorio incluye etapas PPO y DPO opcionales que no están aplicadas al checkpoint publicado; los resultados pueden diferir si se entrenan esas etapas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darshi1337/hermitlm-8M
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
