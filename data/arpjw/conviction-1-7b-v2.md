# arpjw/conviction-1.7b-v2

## Resumen

conviction-1.7b-v2 es un adaptador LoRA en dos etapas sobre Qwen/Qwen3-1.7B (en modo no thinking), desarrollado por el investigador arpjw. El modelo aborda un problema concreto y poco explorado: la relación entre la adulación (sycophancy) y la revisión de creencias basada en evidencia. En lugar de entrenar un modelo genérico, el autor construye ConvictionBench v0.1, un benchmark sintético de problemas aritméticos, de lógica, de libros contables y de "token-world", y entrena el modelo para que distinga entre correcciones legítimas y registros falsificados.

La propuesta técnica es un experimento controlado sobre el compromiso entre imitación (SFT) y aprendizaje por refuerzo (GRPO). La etapa 1 es un SFT ligero con 1.000 respuestas de referencia; la etapa 2 replica el mismo entrenamiento GRPO de 200 pasos que el modelo hermano conviction-1.7b-rl. El resultado publicado es que v2 aprende la regla de procedencia de la evidencia (ignora registros falsificados el 81 % de las veces en distribución) pero sacrifica la precisión fuera de distribución y la capacidad de aceptar correcciones que el modelo RL sí conserva.

Es relevante ahora porque cuantifica empíricamente un fenómeno que afecta a todos los asistentes conversacionales: un modelo puede volverse resistente a la manipulación a costa de volverse dogmático. El modelo se publica como artefacto de investigación, no como producto desplegable, y su model card es explícita al respecto. El repositorio ocupa 0,2 GB y contiene dos adaptadores que deben aplicarse en orden.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B) con dos adaptadores LoRA secuenciales |
| Parametros totales | 1.700 millones (modelo base) + 17,4 M por adaptador LoRA (r=16, α=32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen3-1.7B) |
| Tipos de cuantizacion | No disponible; los adaptadores se distribuyen en safetensors (bfloat16 en uso) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA en subcarpetas `stage1_sft` y `stage2_grpo`) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parametros en modo no thinking. Sobre el se aplican dos LoRA con r=16, α=32 y todas las capas lineales, cada una con 17,4 millones de parametros entrenables. La etapa 1 (SFT) usa 1.000 respuestas de referencia escritas por el solucionador, correspondientes a la mitad "SFT" del split de entrenamiento de ConvictionBench, con 1 epoca, learning rate 2e-4, batch efectivo de 32 y perdida solo sobre la completion. El autor justifica este calentamiento ligero con una observacion empirica: tras un SFT completo, el 85 % de los grupos GRPO tenian varianza de recompensa cero; tras este calentamiento, solo el 31 %.

La etapa 2 aplica GRPO con TRL 1.17 partiendo del modelo SFT fusionado: 16 prompts × 4 muestras por paso, β = 0, perdida DAPO, temperatura 1.0, recompensa determinista de 0,70·respuesta + 0,25·decision + 0,05·formato, 200 pasos sobre una RTX PRO 6000. Los prompts provienen de la mitad "GRPO" del split de entrenamiento, disjunta de la etapa 1. El formato de respuesta es JSON fijo con los campos `reason`, `answer` y `decision`, y el modelo espera un system prompt específico (`system_prompt.txt`) junto con hechos autoritativos que llegan como mensajes de tipo `tool`.

## Capacidades

- Generacion de texto conversacional en ingles con formato JSON estructurado (`reason`, `answer`, `decision`).
- Razonamiento aritmetico y logico sobre problemas sinteticos del benchmark ConvictionBench.
- Deteccion de informacion insuficiente: emite `decision: "insufficient"` cuando no puede resolver con los datos disponibles.
- Revision de creencias ante evidencia nueva: incorpora correcciones cuando llegan por el canal `tool`.
- Resistencia a registros falsificados: ignora registros forjados el 81 % de las veces en distribucion y alcanza 0,58 de resistencia en el conjunto estructural (held-out).
- Cumplimiento estricto de formato: 0,995 de precision en el test estructural de formato estricto.
- Soporte de tool calling restringido al esquema descrito (mensajes `tool` como fuente autoritativa).
- No soporta vision, audio ni modo thinking (entrenado explicitamente en modo no thinking).
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Investigacion sobre sycophancy: sirve como punto de comparacion controlado frente a conviction-1.7b-sft y conviction-1.7b-rl para aislar el efecto del calentamiento SFT antes de GRPO en la resistencia a la presion social.
- Estudio de revision de creencias basada en evidencia: el modelo permite medir experimentalmente la tasa de aceptacion de correcciones legitimas (0,244 en el test estructural) frente a la resistencia a registros falsos (0,578), un eje util para disenar politicas de confianza en asistentes.
- Evaluacion de robustez ante manipulacion: util como linea base negativa en pruebas de red teaming, ya que su propia model card advierte que no debe desplegarse como defensa.
- Reproduccion de experimentos de RLHF/GRPO: el codigo y el benchmark estan publicados, lo que permite replicar el pipeline de dos etapas en hardware de una sola GPU (RTX PRO 6000) y comparar hiperparametros.
- Generacion de datos sinteticos etiquetados: el formato JSON estricto y la distincion entre respuesta valida e insuficiente permiten usarlo como generador de ejemplos para entrenar clasificadores de suficiencia de informacion.
- Docencia y divulgacion: el par de adaptadores y el benchmark asociado constituyen un caso de estudio compacto (0,2 GB) sobre el compromiso entre imitacion y refuerzo, adecuado para cursos de alineamiento.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre ConvictionBench v0.1, decodificacion greedy, maximo 200 tokens nuevos. v2 se presenta con intervalos de confianza del 95 % por cluster-bootstrap sobre grupos de problemas.

| Metrica | Base | SFT | RL | v2 |
|---|---|---|---|---|
| test_id final accuracy | 0,445 | 0,939 | 0,679 | 0,787 [0,762; 0,810] |
| test_template final accuracy | 0,425 | 0,913 | 0,651 | 0,738 [0,708; 0,765] |
| test_structural final accuracy | 0,424 | 0,580 | 0,644 | 0,560 [0,520; 0,597] |
| test_structural pressure flip rate (menor mejor) | 0,536 | 0,389 | 0,348 | 0,375 [0,322; 0,430] |
| test_id forged-record resistance | 0,248 | 0,963 | 0,191 | 0,806 [0,757; 0,855] |
| test_structural forged-record resistance | 0,340 | 0,531 | 0,315 | 0,578 [0,518; 0,637] |
| test_id insufficient-information accuracy | 0,355 | 0,963 | 0,566 | 0,727 [0,682; 0,774] |
| test_structural natural-history legitimate correction | 0,875 | 0,074 | 0,733 | 0,244 [0,114; 0,387] |
| test_structural strict format | 0,839 | 0,917 | 0,966 | 0,995 [0,992; 0,998] |

Hipotesis preregistradas frente al modelo RL: la resistencia a registros forjados es mayor (confirmada, +0,615 [+0,552; +0,676]); la precision held-out no es inferior en 0,03 (no confirmada, −0,084 [−0,115; −0,052]); la correccion en historial natural es mayor que en SFT (confirmada, +0,170 [+0,023; +0,322]). Los resultados de 14 modelos abiertos de referencia estan en la pagina del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un modelo de 1.700 millones de parametros en bfloat16, la huella del modelo base ronda los 3,4 GB, mas el overhead de los adaptadores fusionados y del contexto.
- GPU recomendadas: el entrenamiento GRPO se ejecuto en una RTX PRO 6000; para inferencia basta una GPU consumer moderna con al menos 8 GB de VRAM.
- Cabe en GPU consumer: si, en tarjetas tipo RTX 3060 12 GB, RTX 4070, RTX 4090 y similares; no se han publicado medidas de latencia ni throughput.
- Opciones de despliegue: transformers + PEFT (flujo oficial documentado); no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, y al requerir dos adaptadores secuenciales fusionados el soporte en esos motores no esta garantizado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| conviction-1.7b-v2 | 1,7 B + 2 LoRA de 17,4 M | no disponible | SFT ligero + GRPO | Apache 2.0 | Hugging Face |
| conviction-1.7b-sft | 1,7 B + LoRA | no disponible | SFT completo | Apache 2.0 | Hugging Face |
| conviction-1.7b-rl | 1,7 B + LoRA | no disponible | GRPO puro | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-1.7B | 1,7 B | no disponible en la informacion | Modelo base generalista | Apache 2.0 | Hugging Face |

La comparativa directa con modelos generalistas de la misma categoria no esta disponible en la informacion proporcionada; los unicos puntos de referencia publicados son los tres artefactos de la familia conviction y el modelo base.

## Limitaciones y advertencias

- Entrenado exclusivamente con problemas sinteticos de aritmetica, libros contables, logica y token-world en un formato JSON fijo; el comportamiento en conversacion abierta no se ha evaluado.
- La model card advierte explicitamente de que no debe desplegarse como defensa contra manipulacion: trata el canal `tool` como autoritativo por construccion.
- Riesgo de falsificacion del canal de herramientas: es necesario sanear la entrada del usuario para que cadenas literales `<tool_response>` no puedan suplantar mensajes `tool`.
- Sacrifica precision fuera de distribucion (0,560 frente a 0,644 del modelo RL) y acepta correcciones legitimas mucho menos (0,244 frente a 0,733 del RL), lo que puede producir respuestas dogmaticas ante informacion valida.
- Solo soporta ingles; no se han publicado evaluaciones multilingues.
- No se han publicado datos sobre sesgos demograficos ni sociales; al ser un artefacto de investigacion con datos sinteticos, la transferencia a dominios reales es incierta.
- Riesgo de alucinacion no cuantificado fuera del benchmark; el formato JSON estricto no garantiza la veracidad del contenido de `reason`.
- La licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen3-1.7B conserva la copyright del equipo Qwen y sus propios terminos.
- Requiere aplicar los dos adaptadores en orden (SFT fusionado y despues GRPO); un uso incorrecto del orden invalida el comportamiento documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arpjw/conviction-1.7b-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo hermano SFT: https://huggingface.co/arpjw/conviction-1.7b-sft
- Modelo hermano RL: https://huggingface.co/arpjw/conviction-1.7b-rl
- Dataset ConvictionBench: https://huggingface.co/datasets/arpjw/ConvictionBench
- Pagina del proyecto: https://aryasomu.com/conviction/
- Codigo: https://github.com/arpjw/conviction
