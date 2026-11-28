# reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B

## Resumen

Qwen3-0.6B-Distilled-30B-A3B es un modelo de lenguaje causal de 0,6 mil millones de parametros publicado por el usuario reaperdoesntknow (Reaperdoesntrun, vinculado a Convergent Intelligence LLC) y construido sobre Qwen/Qwen3-0.6B. Se trata de un proceso de destilacion de conocimiento en el que el profesor es Qwen3-30B-A3B-Thinking-2507, un modelo MoE de 30 mil millones de parametros totales en su variante "Thinking", y el alumno es el modelo denso de 0,6B. El objetivo es transferir estructura de razonamiento extendido (chain-of-thought) a un modelo lo suficientemente pequeno como para ejecutarse en dispositivos de borde, moviles o entornos embebidos.

El entrenamiento se realizo sobre 6.122 muestras de CoT de dominios STEM (fisica, algebra lineal, ecuaciones diferenciales, electromagnetismo, matematicas, ingenieria, mecanica clasica, mecanica teorica, calculo avanzado, fisica moderna, fisiologia y biologia molecular), mayoritariamente procedentes del usuario 0xZee de Hugging Face. La innovacion declarada por el autor es doble: usar un profesor "Thinking" (con trazas de razonamiento extendido y mayor entropia en la softmax) en lugar de un profesor "Instruct", y aplicar una perdida ponderada por prueba ("proof-weighted loss") que amplifica la penalizacion sobre los tokens de derivacion frente a los de formato.

Es relevante ahora porque demuestra una via practica para obtener razonamiento estructurado en modelos sub-1B con licencia Apache 2.0, un segmento donde las alternativas con capacidad de CoT son escasas. No obstante, conviene subrayar que el contexto de entrenamiento es de solo 1.024 tokens y que el propio autor advierte de una capacidad limitada a unos 8 pasos de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer causal, RoPE, GQA) |
| Parametros totales | 751.632.384 (segun safetensors); el autor declara 0,6B |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens (entrenamiento) |
| Tipos de cuantizacion | no disponible de forma explicita; el autor menciona que queda por debajo de 500 MB cuantizado |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3 del modelo base: transformer causal con RoPE y atencion con query grouping (GQA), en precision bf16. No es un modelo MoE pese a la referencia "30B-A3B" del nombre, que alude al profesor (Qwen3-30B-A3B-Thinking-2507), no al alumno. La compresion declarada es de 50x (30B a 0,6B).

El entrenamiento consistio en una unica epoca sobre 5.815 muestras (95% de las 6.122), reservando 307 para evaluacion, con batch efectivo de 8, optimizador AdamW (weight decay 0,01), learning rate de 1,5e-5 a 1e-6 con decaimiento coseno y 30 pasos de warmup, gradient clipping de 1,0 y temperatura de destilacion T=2,0. La funcion de perdida combina dos terminos: entropia cruzada ponderada por prueba al 55% (con peso 2,5x sobre los tokens entre `Proof:` y `Final Answer:`, decayendo linealmente a 1,5x) y divergencia KL de destilacion al 45% (escalada por T²). El formato de entrenamiento impone la estructura "Problem / Proof / Final Answer". El autor menciona ademas un marco teorico propio, "Discrepancy Calculus (DISC)", de base measure-theoretic, sin que se aporten resultados empiricos que lo respalden en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento estructurado en formato de derivacion (Problem, Proof, Final Answer).
- Razonamiento matematico y cientifico de tipo STEM: algebra lineal, calculo, ecuaciones diferenciales, fisica clasica y moderna, electromagnetismo, mecanica.
- Razonamiento encadenado (chain-of-thought) imitando el estilo deliberativo del profesor Thinking.
- Generacion de borradores de prueba ("proof drafting") con pasos intermedios explicitos.
- Conversacion basica en ingles.
- Inferencia en dispositivos de borde por su reducido tamano.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking nativo con tokens de control.

## Casos de uso

- Tutoria educativa en dispositivos de borde: el modelo puede generar derivaciones paso a paso de problemas de calculo o algebra en un movil o una Raspberry Pi, con la estructura Proof/Final Answer que aprendio durante la destilacion.
- Componente rapido de razonamiento en pipelines multi-modelo: se puede usar como primer "razonador" barato que resuelve problemas sencillos y deriva los complejos a un modelo mayor, reduciendo coste y latencia.
- Generacion de borradores de demostraciones en entornos de estudio: util para que un estudiante vea una posible linea de derivacion antes de verificarla formalmente.
- Inferencia embebida e IoT: con menos de 500 MB cuantizado, cabe en dispositivos con recursos muy limitados donde no es viable un 7B o superior.
- Preprocesado de problemas STEM en plataformas de evaluacion automatica: puede estructurar enunciados y proponer una solucion inicial que luego se contrasta con un verificador simbolico.
- Prototipado rapido de asistentes cientificos en ingles: sirve para validar flujos de producto antes de invertir en modelos mayores, gracias a su licencia Apache 2.0 y a su bajo coste de inferencia.
- Filtrado y clasificacion de problemas por dominio: su entrenamiento en 12 areas STEM permite usarlo como etiquetador ligero de enunciados por materia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 1,5 GB para los pesos (751M parametros x 2 bytes) mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,8 GB; en 4 bits, por debajo de 0,5 GB (el autor afirma que el modelo cuantizado queda por debajo de 500 MB).
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060, RTX 4060 o superior es mas que suficiente. Tambien funciona en CPU.
- Cabe holgadamente en GPU consumer, incluidas GTX 1650 (4 GB), RTX 3050 y modelos integrados con suficiente memoria compartida.
- Opciones de despliegue: transformers (referencia del autor), llama.cpp y Ollama para CPU/edge, vLLM y TGI para servir en GPU. El repo incluye el tag `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-0.6B-Distilled-30B-A3B | 0,75B (declarado 0,6B) | 1.024 tokens | Apache 2.0 | Destilado de Qwen3-30B-A3B-Thinking para CoT STEM en ingles |
| Qwen/Qwen3-0.6B (base) | 0,6B | contexto nativo de Qwen3 (no indicado aqui) | Apache 2.0 | Modelo base sin destilacion especifica de CoT STEM |
| Qwen3-1.7B | 1,7B | contexto nativo de Qwen3 (no indicado aqui) | Apache 2.0 | Alternativa densa mayor de la misma familia, mas capacidad pero mas recursos |
| SmolLM2-360M / 1.7B | 0,36B / 1,7B | no disponible | Apache 2.0 | Alternativas pequenas de Hugging Face, sin destilacion STEM especifica documentada aqui |

La comparacion cuantitativa de rendimiento no esta disponible: no hay benchmarks publicados en la informacion proporcionada para este modelo ni datos comparativos directos con las alternativas citadas.

## Limitaciones y advertencias

- Capacidad limitada por el tamano: el autor advierte que el modelo fallara en demostraciones de mas de aproximadamente 8 pasos de razonamiento y en problemas multivariable complejos.
- Riesgo de pasos intermedios plausibles pero incorrectos; el propio autor recomienda verificar siempre las salidas.
- Dominios infrarrepresentados en el entrenamiento (biologia molecular con 71 muestras, fisiologia con 114) produciran resultados mas debiles.
- Contexto de solo 1.024 tokens, insuficiente para razonamiento de contexto largo o documentos extensos.
- Solo ingles; no se declara soporte multilingue.
- No apto, segun el autor, para verificacion formal de pruebas, analisis de seguridad critica, consejo medico ni asesoramiento legal.
- Riesgo de sesgos heredados del modelo base y de los datos de destilacion; no se documenta ninguna evaluacion de sesgo.
- La model card contiene afirmaciones teoricas (Discrepancy Calculus) sin validacion empirica publicada; tratar con cautela.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de evaluacion independiente desaconseja su uso en produccion sin validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Profesor de destilacion: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507
- Autor de los datasets: https://huggingface.co/0xZee
- Convergent Intelligence LLC: https://convergentintel.com
