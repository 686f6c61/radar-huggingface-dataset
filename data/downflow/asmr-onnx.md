# DownFlow/ASMR-onnx

## Resumen

DownFlow/ASMR-onnx (titulado «WebASMR ONNX graphs» en su model card) es un paquete de grafos ONNX cuantizados pensado para ejecutar en el navegador sobre WebGPU. No es un modelo entrenado desde cero, sino una distribución de artefactos de inferencia que combina dos componentes: un modelo de lenguaje Qwen3.5-0.8B con un LoRA denominado ASMR, fusionado y exportado, y un sistema de síntesis de voz basado en F5-TTS (paso DiT más vocoder). El autor es DownFlow y el repositorio ocupa 2,2 GB.

La relevancia del paquete es de tipo práctico: empaqueta en un solo repositorio las variantes int4 (MatMulNBits) y fp16 de ambos componentes, de forma que un desarrollador puede desplegar un asistente conversacional con salida de voz íntegramente en el cliente, sin backend. El LLM base tiene 0,8 mil millones de parámetros según la model card; el tamaño del componente TTS no se detalla.

La información publicada es mínima: cero descargas, cero likes, sin pipeline declarado, sin idiomas declarados y sin resultados de evaluación. Todos los datos de entrenamiento, context length y rendimiento del LoRA ASMR son desconocidos y se marcan como «no disponible» en esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM transformer (Qwen3.5-0.8B) + LoRA fusionado; TTS F5-TTS (DiT + vocoder). Exportado a grafos ONNX |
| Parametros totales | 0,8 mil millones en el LLM (según model card); parámetros del componente TTS no disponibles |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int4 (MatMulNBits, weight-only) y fp16; en TTS las convoluciones se mantienen en el dtype de sesión |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | apache-2.0 (declarada para el paquete; ver limitaciones) |
| Formato de pesos | ONNX (`llm_int4/`, `llm_fp16/`, `tts_int4/`, `tts_fp16/`) |
| Tamano del repositorio | 2,2 GB |
| Runtime objetivo | ONNX Runtime Web con ejecución WebGPU en navegador |
| Fecha de publicacion | 2026-10-17 (creación), 2026-10-17 (última actualización) |

## Arquitectura y entrenamiento

El repositorio contiene cuatro directorios. `llm_int4/` aloja el modelo de lenguaje Qwen3.5-0.8B con un adaptador LoRA llamado ASMR ya fusionado en los pesos y exportado a ONNX con cuantización MatMulNBits de 4 bits. `tts_int4/` contiene el paso DiT y el vocoder de F5-TTS, con las multiplicaciones de matrices en int4 y las convoluciones en el tipo de dato de la sesión. Los directorios `llm_fp16/` y `tts_fp16/` conservan las exportaciones en fp16 a partir de las cuales se generaron las versiones cuantizadas, lo que explica buena parte de los 2,2 GB.

No hay información sobre el proceso de entrenamiento: ni volumen de tokens, ni composición del dataset, ni si hubo RLHF, DPO o ajuste supervisado. Tampoco se documenta qué datos se usaron para entrenar el LoRA ASMR, cuántas iteraciones, ni con qué metodología se realizó la fusión y la posterior exportación. La única información técnica verificable es la estrategia de cuantización (int4 weight-only con MatMulNBits para el LLM, mixta para el TTS) y la orientación explícita a WebGPU.

## Capacidades

- Generación de texto conversacional mediante el LLM Qwen3.5-0.8B, con el ajuste LoRA ASMR fusionado.
- Síntesis de voz (text-to-speech) mediante F5-TTS, con paso DiT y vocoder incluidos en el paquete.
- Ejecución íntegra en el navegador sobre WebGPU a través de ONNX Runtime Web, sin servidor de inferencia.
- Doble variante de precisión (int4 y fp16) para intercambiar calidad por memoria y velocidad.
- Encadenamiento LLM → TTS dentro del mismo runtime, apto para asistentes con respuesta hablada.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Tool calling / function calling: no disponible (no documentado).
- Modo thinking, visión o audio de entrada: no disponible (no documentado).

## Casos de uso

- Asistentes conversacionales con voz en el navegador: el paquete permite generar la respuesta con el LLM y sintetizarla con F5-TTS en el mismo cliente, sin enviar el texto del usuario a un servidor.
- Demos públicas sin coste de GPU: al ejecutarse en WebGPU sobre el dispositivo del visitante, una demo de chat con voz no requiere aprovisionar infraestructura de inferencia.
- Aplicaciones de privacidad estricta: sectores con requisitos de residencia de datos (sanidad, legal, educación) pueden mantener la conversación y la síntesis en local, en el propio equipo del usuario.
- Generación de contenido de audio tipo ASMR o narración: el LoRA ASMR y el motor F5-TTS apuntan a la producción de locuciones de ritmo lento; el uso concreto depende del dominio real del adaptador, no documentado.
- Prototipado rápido de interfaces de voz: útil para validar UX de asistentes hablados antes de invertir en infraestructura de servidor, gracias a las variantes int4 y fp16 ya exportadas.
- Lectura de documentos en voz alta en aplicaciones web: un visor puede tomar texto del propio cliente, resumirlo con el LLM de 0,8B y sintetizarlo con el vocoder.
- Evaluación comparativa de cuantización en el borde: el repositorio conserva fp16 e int4 del mismo modelo, lo que facilita medir la degradación de calidad en navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad del LLM, inteligencia del LoRA, MOS o WER del TTS, ni latencias medidas.

## Requisitos de hardware

- Inferencia en navegador con WebGPU: el consumo se reparte entre memoria de GPU y memoria unificada del sistema; no hay cifras publicadas de VRAM.
- Estimación orientativa a partir de los parámetros: el LLM int4 de 0,8B ocupa del orden de 0,4-0,5 GB de pesos; el total del repositorio (2,2 GB) incluye también las copias fp16 y el TTS, por lo que la huella real de un pipeline int4 completo debería quedar muy por debajo de esas 2,2 GB. Es una estimación, no un dato del autor.
- GPU de sobremesa: cualquier GPU con soporte WebGPU (NVIDIA serie RTX, AMD RDNA, Intel Arc) debería poder ejecutar la variante int4; no hay cifras de rendimiento publicadas.
- GPU de centro de datos (A100, H100): soportadas por ONNX Runtime, pero desproporcionadas para un modelo de 0,8B más un TTS; no hay datos de throughput.
- Cabe en GPU de consumo: sí, previsiblemente en iGPU y dGPU recientes con WebGPU; modelos concretos y límites de memoria no disponibles.
- Opciones de despliegue: ONNX Runtime Web (WebGPU o WASM como fallback), ONNX Runtime nativo, potencialmente transformers.js u onnxruntime-genai. No hay GGUF, por lo que llama.cpp, Ollama y vLLM no aplican directamente a estos artefactos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de las alternativas provienen de sus propias fíchas públicas, no de la información proporcionada para este modelo; los campos desconocidos se marcan como «no disponible».

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| DownFlow/ASMR-onnx | 0,8B (LLM) + TTS no disponible | No disponible | ONNX int4/fp16 para WebGPU | apache-2.0 (declarada) | LLM + TTS empaquetados para navegador |
| Qwen2.5-0.5B-Instruct (exportaciones ONNX de la comunidad) | 0,49B | 32.768 tokens (modelo base) | ONNX, habitualmente int8/int4 | Apache 2.0 | Solo LLM; requiere TTS aparte |
| Kokoro-82M (ONNX) | 82M | No aplica | ONNX | Apache 2.0 | Solo TTS; requiere LLM aparte |
| F5-TTS original (PyTorch) | No disponible en la información | No aplica | PyTorch (safetensors/checkpoint) | Verificar licencia de los pesos originales | Solo TTS; inferencia en servidor |

La diferencia diferencial de este paquete no es de calidad, sino de integración: reúne LLM y TTS ya cuantizados y listos para WebGPU, algo que las alternativas obligan a montar a mano combinando dos repositorios y dos runtimes.

## Limitaciones y advertencias

- Ausencia total de evaluación: sin benchmarks, sin MOS del TTS y sin comparación con el modelo base sin LoRA, no es posible afirmar nada sobre la calidad del ajuste ASMR.
- Procedencia del LoRA desconocida: no se documentan datos, duración ni metodología de entrenamiento, lo que impide evaluar sesgos o licencias de los datos de ajuste.
- Licencia: el paquete declara apache-2.0, pero conviene verificar por separado la licencia de los pesos originales de Qwen3.5 y de F5-TTS, ya que un export derivado no puede relajar los términos del modelo de origen.
- Riesgo de alucinación: inherente a un LLM de 0,8B cuantizado a int4; la pérdida de precisión por cuantización puede acentuarlo, y no hay medición disponible.
- Contexto e idiomas sin declarar: no se puede planificar un caso de uso multilingüe o de contexto largo sin datos del autor.
- Cobertura WebGPU irregular: el paquete depende de un navegador con WebGPU estable (Chrome/Edge recientes); en Firefox y Safari el soporte es parcial, y el fallback a WASM degrada mucho la velocidad.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los fallos de exportación estén detectados por terceros.
- Duplicación de pesos: al incluir fp16 e int4 en el mismo repositorio, la descarga completa son 2,2 GB aunque solo se use una variante; conviene descargar solo el subdirectorio necesario (`allow_patterns`).
- Sin garantías de producción: no hay versionado semántico, ni tests, ni changelog más allá de una única actualización el mismo día de creación.

## Enlaces

- HuggingFace: https://huggingface.co/DownFlow/ASMR-onnx
- No se han encontrado en la búsqueda web otros enlaces (papers, blogs, repositorios o demos) asociados a este modelo.
