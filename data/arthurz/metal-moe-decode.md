# ArthurZ/metal-moe-decode

## Resumen

`metal-moe-decode` es un paquete de kernels de cálculo escritos en Metal para acelerar la decodificación de modelos de mezcla de expertos (MoE) y de atención lineal híbrida sobre Apple Silicon. Lo publica el usuario ArthurZ en Hugging Face bajo la librería `kernels`, y su propósito es ofrecer operaciones de bajo nivel optimizadas para GPU de Apple (MPS) sin necesidad de un paso de compilación previo, apoyándose en `torch.mps.compile_shader`.

No se trata de un modelo de lenguaje con pesos entrenados, sino de un conjunto de operadores (`qmv4`, `experts_down_sum`, `experts_gate_up_masked`, `gated_delta_rule`, `causal_conv1d_fn`, `causal_conv1d_update`) pensados para integrarse en el flujo de ejecución de modelos como Qwen3.8-Flash-Next con expertos en streaming dentro de `transformers`. Su relevancia actual radica en que permite ejecutar arquitecturas MoE e híbridas de atención lineal en hardware Apple sin depender de kernels CUDA ni de toolchains de compilación externos.

La información disponible es muy limitada: la model card es breve, no incluye especificaciones de parámetros, contexto ni benchmarks, y el repositorio no registra descargas ni interacciones. Esta ficha refleja únicamente lo que el autor documenta y marca como "no disponible" todo aquello que no se ha publicado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernels de cálculo en Metal para modelos MoE y de atención lineal híbrida (no es un modelo con pesos) |
| Parametros totales | no disponible (no aplica: es un paquete de kernels) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los kernels operan sobre pesos empaquetados con `group_size`, p. ej. 32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se distribuye como paquete de kernels vía `kernels.get_kernel`) |

## Arquitectura y entrenamiento

El paquete no entrena ningún modelo. Implementa operadores de decodificación mediante `torch.mps.compile_shader`, es decir, shaders Metal compilados en tiempo de ejecución desde Python, sin un paso de build separado. El autor lo describe como variante "noarch" de `torch-metal`, lo que sugiere que el artefacto es independiente de la arquitectura del host y compila el shader en el dispositivo.

Las operaciones expuestas son todas `torch.library.custom_op` con implementaciones falsas (fakes) para trazado y compatibles con `torch.compile`. Entre ellas destacan `qmv4` (multiplicación vector-matriz cuantizada con escalas, sesgos y `group_size`), `experts_down_sum` y `experts_gate_up_masked` (agregación y proyecciones de expertos en MoE), `gated_delta_rule` (regla delta con compuerta, típica de modelos de atención lineal) y `causal_conv1d_fn` / `causal_conv1d_update` (convoluciones causales 1D para estados de decodificación). El objetivo declarado es servir a modelos MoE e híbridos de atención lineal en Apple Silicon, con mención explícita a Qwen3.8-Flash-Next y a los expertos en streaming de `transformers`. No se documentan datos de entrenamiento, número de tokens ni técnicas de alineación, porque no aplica.

## Capacidades

- Aceleración de decodificación de modelos MoE sobre Apple Silicon mediante kernels Metal.
- Multiplicación vector-matriz cuantizada (`qmv4`) con escalas, sesgos y tamaño de grupo configurables.
- Agregación de salidas de expertos (`experts_down_sum`) y proyecciones gate/up enmascaradas (`experts_gate_up_masked`).
- Implementación de la regla delta con compuerta (`gated_delta_rule`) para capas de atención lineal.
- Convoluciones causales 1D para decodificación incremental (`causal_conv1d_fn`, `causal_conv1d_update`).
- Compatibilidad con `torch.compile` gracias a las implementaciones falsas de cada `custom_op`.
- Carga sencilla mediante `kernels.get_kernel("ArthurZ/metal-moe-decode")`.
- No ofrece generación de texto, razonamiento, código, visión ni tool calling por sí mismo: es infraestructura de ejecución.

## Casos de uso

- Ejecución local de modelos MoE en Mac con chip Apple Silicon: el paquete proporciona los kernels de decodificación necesarios para que los expertos en streaming de `transformers` se ejecuten sobre MPS sin depender de CUDA.
- Prototipado de arquitecturas híbridas de atención lineal: `gated_delta_rule` y las convoluciones causales permiten probar capas de estado recurrente en un portátil Apple antes de escalar a otros entornos.
- Inferencia cuantizada en equipos de desarrollo: `qmv4` con `group_size` configurable facilita validar esquemas de cuantización por grupos en hardware de consumo.
- Integración en pipelines de `torch.compile`: al ser `custom_op` con fakes, los kernels se pueden capturar y componer dentro de grafos compilados sin romper el trazado.
- Investigación sobre decodificación especulativa y agregación de expertos: `experts_down_sum` y `experts_gate_up_masked` permiten experimentar con el enrutado y la suma de salidas de expertos en MPS.
- Desarrollo de herramientas de perfilado y benchmarking para Apple Silicon: el paquete sirve como base para medir latencia de operaciones MoE y de atención lineal en GPU de Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con soporte Metal y backend MPS de PyTorch (no se especifican modelos de chip concretos).
- VRAM estimada: no disponible; depende del modelo MoE o híbrido sobre el que se apliquen los kernels, no del paquete en sí.
- GPU recomendadas: no disponible; el autor no detalla qué generaciones de Apple Silicon son compatibles ni el rendimiento esperado.
- Compatibilidad con GPU de consumo: el paquete está diseñado para GPU integradas de Apple, pero no se documentan cifras de latencia ni throughput.
- Opciones de despliegue: carga vía `kernels.get_kernel` dentro de PyTorch con backend MPS y `torch.compile`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Paquete | Plataforma | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| ArthurZ/metal-moe-decode | Apple Silicon (Metal/MPS) | Kernels MoE y atención lineal híbrida vía `torch.mps.compile_shader` | Apache 2.0 | Hugging Face (`kernels`) |
| torch-metal (variante de referencia) | Apple Silicon | Kernels Metal con paso de build | no disponible | no disponible |
| Kernels CUDA para MoE (p. ej. vLLM, FlashInfer) | NVIDIA | Operadores MoE y atención en CUDA | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni tiene pesos, por lo que no puede evaluarse con benchmarks de MMLU, HumanEval o GSM8K.
- La documentación es mínima: no se detallan versiones de PyTorch, macOS ni chips compatibles, lo que dificulta garantizar reproducibilidad.
- El repositorio no registra descargas ni likes, y fue creado y actualizado el mismo día; no hay evidencia de uso en producción.
- Depende de `torch.mps.compile_shader` y de la API de `kernels`; cambios en PyTorch o en el backend MPS pueden romper la compatibilidad.
- La mención a Qwen3.8-Flash-Next y a los expertos en streaming de `transformers` sugiere un alcance acotado a esos flujos; no se documenta compatibilidad con otros modelos.
- No se han publicado evaluaciones de sesgo, alucinación ni robustez, porque el paquete no realiza inferencia semántica por sí mismo.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se documentan garantías ni soporte del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ArthurZ/metal-moe-decode
- Librería `kernels` de Hugging Face: no disponible en la información proporcionada
- Documentación de `torch.mps.compile_shader`: no disponible en la información proporcionada
- Referencia a Qwen3.8-Flash-Next: no disponible en la información proporcionada
