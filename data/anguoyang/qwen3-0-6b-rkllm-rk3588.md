# anguoyang/qwen3-0.6b-rkllm-rk3588

## Resumen

Qwen3-0.6B para RK3588 es una conversión comunitaria del modelo denso Qwen3-0.6B de Alibaba Qwen al formato RKLLM, optimizado para ejecutarse en la NPU del SoC Rockchip RK3588. El autor, anguoyang, ha exportado los pesos con rkllm-toolkit 1.3.1 en cuantización W8A8 y ha publicado mediciones reales de prefill, decode y latencia end-to-end sobre una placa física, algo poco habitual en este tipo de conversiones para hardware embebido.

El modelo base Qwen3-0.6B es un transformer denso de aproximadamente 0,6 mil millones de parámetros, entrenado por Qwen con soporte nativo de inglés y chino y con modo de razonamiento (thinking mode) desactivable. Esta conversión preserva la licencia Apache-2.0 del original y se distribuye como un único fichero `.rkllm` de 937.450.244 bytes, sin pesos en safetensors ni GGUF.

Su relevancia es doble: por un lado, demuestra que un LLM de 0,6B puede ejecutarse de forma interactiva en una NPU de bajo consumo (RK3588, 3 núcleos NPU); por otro, aporta cifras verificables en placa (15,59 tok/s en decode, 281 tok/s en prefill estimado, 2,35 s de carga) que permiten dimensionar aplicaciones de IA en el borde sin depender de números de simulador o de proveedor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-0.6B), convertido a RKLLM |
| Parametros totales | ~0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | W8A8 (weights 8 bits, activations 8 bits) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | `.rkllm` (formato propietario de Rockchip; fichero de 937.450.244 bytes) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-0.6B, un transformer denso de la familia Qwen3. La conversión a RKLLM se realizó con rkllm-toolkit 1.3.1 (wheel incluido en airockchip/rknn-llm), torch 2.6.0+cu126 y transformers 5.8.0, sobre un host x86_64 con RTX 3090 usada para la calibración. El proceso aplica cuantización post-entrenamiento W8A8 con `optimization_level=1`, `quantized_algorithm="normal"`, `target_platform="rk3588"` y `num_npu_core=3`. El dataset de calibración fue un JSON de 24 pares `{"input", "target"}` cortos en chino e inglés, suficiente según el autor para una exportación limpia.

No se detalla en la información disponible el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO; esos datos corresponden a la model card oficial de Qwen3-0.6B, no a esta conversión. La innovación técnica destacable de esta ficha es la propia conversión y su benchmarking en placa: el autor separa prefill y decode mediante el método de dos puntos (ejecuciones de 64 tokens frente a 1 token), descarta una ejecución de calentamiento y reporta la mediana de tres ejecuciones independientes verificando el recuento de tokens generados. También documenta una limitación del toolkit: no puede exportar el modelo de lenguaje de Qwen2-VL-2B (falla con `ERROR: layer running Error: 'mrope_section'!` en w8a8 y w8a8_g128, y w4a16 se rechaza para exportación multimodal en rk3588), mientras que Qwen3 denso de texto sí exporta correctamente.

## Capacidades

- Generación de texto en inglés y chino, con el comportamiento del modelo base Qwen3-0.6B.
- Razonamiento y modo thinking del modelo base (Qwen3 incorpora modo de razonamiento desactivable); la información disponible no confirma si el modo thinking se preserva íntegro tras la cuantización W8A8.
- Generación de código y matemáticas básicas, limitadas por el tamaño de 0,6B parámetros.
- Soporte de tool calling y function calling: no confirmado en la información proporcionada para esta conversión.
- Soporte de agentes y razonamiento multi-paso: no confirmado para esta conversión; el tamaño del modelo limita la fiabilidad en cadenas largas.
- Capacidades multilingües: solo inglés y chino según los tags del repositorio.
- Capacidades especiales (visión, audio): no disponibles; es un modelo de texto.
- Ejecución en NPU RK3588 con 3 núcleos, mediante runtime RKLLM compatible.

## Casos de uso

- Asistentes de voz o texto en dispositivos empotrados: el modelo cabe en una placa RK3588 y ofrece 15,59 tok/s en decode, suficiente para respuestas conversacionales cortas sin conexión a la nube.
- Clasificación y extracción de información en el borde: con 281 tok/s de prefill estimado, procesar prompts de 128 tokens es rápido, lo que permite tareas de etiquetado, resumen corto o extracción de entidades en local.
- Traducción inglés-chino en dispositivos: es el par de idiomas soportado nativamente y el escenario natural para un modelo bilingüe de este tamaño en hardware embebido.
- Automatización industrial y domótica con privacidad: al ejecutarse íntegramente en la NPU local, los datos no salen del dispositivo, lo que encaja en entornos con requisitos de confidencialidad.
- Prototipado de pipelines de IA en el borde: sirve como banco de pruebas reproducible (el autor documenta el script de conversión y el protocolo de medición) para validar latencias antes de invertir en modelos mayores.
- Generación de texto auxiliar de baja latencia: con 2,35 s de carga del modelo y 14,23 tok/s end-to-end para 64 tokens (excluyendo carga), es viable en arranques frecuentes o tareas por lotes pequeñas.
- Educación y demos de LLM en hardware de bajo coste: permite mostrar inferencia de un LLM real en una placa RK3588 sin GPU dedicada.

## Benchmarks y rendimiento

Mediciones del autor en placa RK3588 (ztl A588), Ubuntu 22.04.5, kernel 6.1.118, librknnrt 2.3.2, rkllm-runtime 1.3.1, NPU driver 0.9.8, 3 núcleos NPU, carga de placa ≈ 1,8–2,1. Protocolo: una ejecución de calentamiento descartada, mediana de 3 ejecuciones independientes, recuento de tokens verificado (64/64/64).

| Metrica | Esta placa (rk3) | Benchmark oficial rknn-llm |
|---|---|---|
| Prefill (tok/s, 128 in / 64 out) | 281 (estimación de dos puntos, ±~15%) | 199,09 |
| Decode (tok/s, 128 in / 64 out) | 15,59 | 32,91 |
| End-to-end, 64 tokens, sin carga de modelo | 14,23 tok/s | no disponible |
| End-to-end, 64 tokens, con carga de modelo | 9,35 tok/s | no disponible |
| Carga del modelo | 2,35 s | no disponible |

El autor señala que el prefill medido es superior al oficial y el decode aproximadamente la mitad del oficial, y que la causa de la discrepancia (sobrecarga de la demo, planificación de CPU o condiciones de prueba oficiales) no está aislada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica GPU; el modelo se ejecuta en la NPU del RK3588. El fichero `.rkllm` ocupa 937.450.244 bytes (~0,9 GB) y debe residir en memoria accesible por la NPU.
- GPU recomendadas: ninguna para inferencia; para la conversión se usó una RTX 3090 en host x86_64 (calibración en CUDA).
- Cabe en hardware de consumo: sí, en placas con SoC Rockchip RK3588 (por ejemplo, la ztl A588 usada por el autor) con 3 núcleos NPU; no es ejecutable en GPU de consumo convencional con este formato.
- Opciones de despliegue: runtime RKLLM para rk3588 (librkllmrt 1.3.1 en las pruebas), demo `rkllm_api_demo` de airockchip/rknn-llm (`deploy/src/llm_demo.cpp`) o cualquier runtime compatible con RKLLM para rk3588. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 2,35 s de carga; 14,23 tok/s end-to-end para 64 tokens sin contar carga y 9,35 tok/s incluyéndola; 15,59 tok/s en decode y 281 tok/s en prefill estimado (128 in / 64 out).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Rendimiento | Licencia |
|---|---|---|---|---|---|
| anguoyang/qwen3-0.6b-rkllm-rk3588 | ~0,6B | no disponible | `.rkllm` / NPU RK3588 | 15,59 tok/s decode, 281 tok/s prefill (medido en placa) | Apache-2.0 |
| Qwen/Qwen3-0.6B (base) | ~0,6B | no disponible | safetensors / GPU, CPU | no disponible en esta informacion | Apache-2.0 |
| Conversiones RKLLM oficiales (rknn-llm benchmark.md) | variable | no disponible | `.rkllm` / NPU RK3588 | 32,91 tok/s decode para Qwen3-0.6B segun tabla oficial | segun modelo base |

La comparación directa más informativa es contra el propio modelo base Qwen3-0.6B (misma capacidad, distinto formato y plataforma) y contra las cifras oficiales de rknn-llm para el mismo modelo en RK3588. No se dispone de datos de benchmarks de calidad (MMLU, HumanEval, GSM8K) para ninguno de los dos en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión comunitaria no afiliada a Qwen ni a Rockchip; no hay garantía de soporte ni de mantenimiento.
- La cuantización W8A8 puede degradar la calidad respecto al modelo base en tareas sensibles; no se han publicado evaluaciones de calidad tras la cuantización.
- El decode medido (15,59 tok/s) es aproximadamente la mitad del oficial (32,91 tok/s); la causa no está aislada, por lo que el rendimiento en otras placas puede variar.
- Solo soporta inglés y chino; no hay capacidades multilingües adicionales.
- Longitud de contexto no documentada en esta ficha; conviene verificar la del modelo base antes de usarlo en conversaciones largas.
- Riesgo de alucinación inherente a un modelo de 0,6B parámetros, especialmente en razonamiento multi-paso y matemáticas.
- El formato `.rkllm` es propietario y solo se ejecuta con runtimes RKLLM para RK3588; no es portable a GPU, CPU genérica ni otros aceleradores.
- El toolkit presenta limitaciones documentadas con modelos multimodales (Qwen2-VL-2B falla en la exportación), lo que restringe su uso a modelos de texto densos.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3-0.6B por si hubiera condiciones adicionales no reflejadas aquí.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/anguoyang/qwen3-0.6b-rkllm-rk3588
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio rknn-llm de Rockchip (toolkit y demos): https://github.com/airockchip/rknn-llm
- Documentación de RKLLM y benchmark oficial: no disponible como enlace directo en la información proporcionada; se referencia `benchmark.md` dentro de airockchip/rknn-llm.
