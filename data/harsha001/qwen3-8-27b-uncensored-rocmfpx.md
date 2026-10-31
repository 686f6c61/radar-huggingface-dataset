# Harsha001/Qwen3.8-27B-Uncensored-ROCmFPX

## Resumen

Qwen3.8-27B-Uncensored-ROCmFPX es una cuantización GGUF, publicada por el usuario Harsha001, de orcarouter/Qwen3.8-27B-Uncensored, una versión "abliterated" (con la alineación de seguridad eliminada) del modelo denso de razonamiento Qwen3.8-27B de Qwen. El problema que resuelve esta publicación es doble: por un lado, ofrece una variante sin negativas de servicio del modelo base; por otro, adapta los pesos a los formatos de bajo bit ROCmFPX, un fork de llama.cpp con tipos de peso optimizados para GPU de AMD (Vulkan y HIP/ROCm), pensado especialmente para aceleradores como el Strix Halo de AMD.

La relevancia de esta ficha está en su nicho muy concreto: usuarios con hardware AMD (RX 7900, Strix Halo con 32 GB de memoria unificada) que quieren ejecutar un modelo de razonamiento multimodal de 27B en 4 bits con buen rendimiento local. El modelo conserva las capacidades del original, incluyendo razonamiento con bloque `<think>`, entrada de imágenes mediante un proyector de visión F16 y soporte de inglés y chino. No es una publicación oficial de Qwen ni de OrcaRouter, y los archivos requieren obligatoriamente el fork ROCmFPX: no cargan en llama.cpp estándar, LM Studio ni Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de razonamiento (base Qwen3.8-27B), multimodal (texto + imagen) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la ficha (el ejemplo de ejecución usa 32.768 tokens con `-c 32768`) |
| Tipos de cuantizacion | ROCmFPX 8-bit (`Q8_0_ROCMFPX`), 6-bit (`Q6_0_ROCMFPX`), 4-bit (`Q4_0_ROCMFP4_STRIX_O8`, `Q4_0_ROCMFP4_FAST`); también BF16 como referencia |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (tipos propietarios del fork ROCmFPX, cuantizados con imatrix); proyector de visión en GGUF F16 |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso (no MoE) de 27,3 mil millones de parámetros con capacidades de razonamiento: genera por defecto un bloque `<think>` antes de la respuesta final. Es multimodal (pipeline image-text-to-text) mediante un proyector de visión distribuido aparte en F16. La versión "uncensored" fue creada por orcarouter mediante el proceso de abliteration, una técnica que edita los pesos para suprimir las direcciones de activación responsables de las negativas, eliminando la alineación de seguridad sin reentrenamiento completo. No hay datos publicados sobre tokens de entrenamiento ni composición del dataset del modelo base en la información disponible.

La innovación principal de esta publicación no está en el modelo sino en la cuantización: los archivos usan los tipos de peso de bajo bit de ROCmFPX, un fork de llama.cpp con kernels para AMD (Vulkan y HIP/ROCm). La cuantización se realizó con matriz de importancia (imatrix) calculada sobre el GGUF BF16 con texto de calibración general (`calibration_datav3`) en bloques de 512 tokens. La variante recomendada `_O8` mantiene la capa de salida a 8 bits (`q8_0_rocmfpx`), lo que reduce la divergencia KL de 0,0432 a 0,0334 por solo 0,6 GB adicionales. Cabe destacar que el cabezal de decodificación especulativa MTP del modelo original no está incluido en estos GGUF.

## Capacidades

- Generación de texto conversacional con razonamiento explícito: el modelo produce por defecto un bloque `<think>` antes de la respuesta, configurable mediante la plantilla Jinja (`--jinja`).
- Entrada multimodal de imágenes: existe un proyector de visión (`mmproj-Qwen3.8-27B-Uncensored-F16.gguf`) para usar el modelo con `--mmproj`, aunque el autor indica que no ha sido probado con estos archivos cuantizados.
- Razonamiento multi-paso en problemas complejos, heredado del modelo base de razonamiento Qwen3.8.
- Respuestas sin negativas de servicio: al estar abliterated, atiende peticiones que el modelo original rechazaría (con las responsabilidades legales y éticas correspondientes para el usuario).
- Soporte bilingüe inglés y chino.
- Compatibilidad con el ecosistema llama.cpp (servidor `llama-server`), pero solo a través del fork ROCmFPX.
- Sin datos publicados sobre tool calling, function calling o soporte de agentes en la información disponible.

## Casos de uso

- Inferencia local en Strix Halo (Ryzen AI Max): el archivo `Q4_0_ROCMFP4_STRIX_O8` de 15,6 GB está diseñado específicamente para caber en los 32 GB de memoria unificada de estos SoC, permitiendo un asistente de razonamiento privado sin nube.
- Estaciones de trabajo con GPU AMD RX 7900: mediante el backend HIP/ROCm del fork (`gfx1100`), se puede servir el modelo a velocidad nativa AMD sin recurrir a cuants estándar de llama.cpp.
- Investigación en abliteration y alineación: al ser una variante sin negativas de un modelo de razonamiento conocido, resulta útil para estudiar cómo la eliminación de la alineación afecta al comportamiento y a la calidad del razonamiento.
- Comparación de esquemas de cuantización de bajo bit: la ficha publica métricas de perplejidad, KLD y coincidencia de top-1 frente a BF16, útil como referencia para quien evalúe formatos FPX frente a K-quants clásicos.
- Chat privado multilingüe (inglés/chino) con contexto de 32K tokens: adecuado para asistentes personales que procesan documentos largos sin enviar datos a terceros.
- Prototipado de aplicaciones multimodales en local: el proyector de visión F16 permite experimentar con entrada de imágenes (previa validación, dado que no está probado por el autor).
- Generación de contenido sin filtros bajo control del usuario: para casos donde las negativas del modelo original bloquean tareas legítimas (escritura creativa madura, análisis de texto sensible), asumiendo el usuario toda la responsabilidad del uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se han publicado mediciones de calidad de cuantización sobre WikiText-2 (40 bloques de 512 tokens), con BF16 como referencia (PPL 5,9336):

| Archivo | Tamaño | PPL | KLD | Mismo top-1 |
|---|---:|---:|---:|---:|
| `Q8_0_ROCMFPX` | 28,2 GB | 5,9587 | 0,0033 | 97,49 % |
| `Q6_K_ROCMFPX` | 22,5 GB | 5,9435 | 0,0043 | 96,90 % |
| `Q4_0_ROCMFP4_STRIX_O8` (recomendado) | 15,6 GB | 5,9958 | 0,0334 | 91,80 % |
| `Q4_0_ROCMFP4_FAST` | 14,6 GB | 6,0810 | 0,0440 | 89,43 % |
| Referencia: `Q4_K_M` estándar de llama.cpp | 16,8 GB | 5,9486 | 0,0138 | 94,89 % |

Dato relevante: el `Q4_K_M` estándar está más cerca de BF16 que ambos cuants ROCmFPX de 4 bits; los archivos ROCmFPX se eligen por velocidad en AMD, no por fidelidad.

## Requisitos de hardware

- VRAM estimada para inferencia: 28,2 GB para el cuant de 8 bits, 22,5 GB para el de 6 bits y 14,6–15,6 GB para los de 4 bits (más la KV cache, que crece con el contexto; el ejemplo usa 32.768 tokens).
- GPU recomendadas: Strix Halo (AMD Ryzen AI Max, gfx1151, 32 GB de memoria unificada) para el archivo `_O8` de 15,6 GB; Radeon RX 7900 (gfx1100) vía HIP/ROCm; en general cualquier GPU AMD compatible con Vulkan o ROCm soportada por el fork. El autor advierte que los archivos aún no han sido probados en hardware AMD.
- Consumer GPU NVIDIA: no es el objetivo de estos archivos; para NVIDIA con llama.cpp estándar conviene un GGUF clásico (por ejemplo el `Q4_K_M` de 16,8 GB), que cabe en una RTX 4090 de 24 GB. Los archivos ROCmFPX no cargan en builds estándar.
- Despliegue: exclusivamente mediante el fork ROCmFPX (compilación con `-DGGML_VULKAN=ON` o `-DGGML_HIP=ON` y objetivo `llama-server`). No compatible con llama.cpp estándar, LM Studio, Ollama ni otros runtimes sin soporte ROCmFPX.
- Configuración de muestreo recomendada (de la `generation_config.json` original): `--temp 1.0 --top-p 0.95 --top-k 20`, con `-fa on` (flash attention) y `--jinja`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion destacada | Licencia | Particularidad |
|---|---|---|---|---|---|
| Harsha001/Qwen3.8-27B-Uncensored-ROCmFPX | 27,3 B | 32.768 tokens (ejemplo de uso) | ROCmFPX 4/6/8-bit | Apache-2.0 | Tipos de peso para AMD, abliterated, multimodal |
| Qwen3.8-27B (base oficial de Qwen) | 27,3 B | No disponible en la información proporcionada | GGUF estándar (Q4_K_M, etc.) | Apache-2.0 | Con alineación de seguridad, cabezal MTP incluido |
| orcarouter/Qwen3.8-27B-Uncensored | 27,3 B | No disponible en la información proporcionada | Safetensors (BF16) y GGUF OrcaSAQ2 | Apache-2.0 | Misma base abliterated, sin tipos ROCmFPX |

En resumen: frente al modelo oficial de Qwen, esta variante sacrifica la alineación de seguridad y el cabezal MTP; frente a otros cuants del modelo abliterated, ofrece mayor velocidad en GPU AMD a costa de una fidelidad ligeramente menor a BF16 en 4 bits.

## Limitaciones y advertencias

- Alineación de seguridad eliminada: el modelo abliterated responderá a peticiones que el modelo original rechazaría. El usuario es plenamente responsable del uso y del contenido generado. Su empleo conlleva riesgos éticos y legales significativos.
- Riesgo de alucinación: inherente a cualquier LLM; no hay datos que indiquen si la abliteration la agrava, pero la edición de pesos puede degradar comportamientos aprendidos.
- Compatibilidad restringida: los archivos requieren el fork ROCmFPX; no funcionan en llama.cpp estándar, LM Studio ni Ollama. Además, el autor advierte que no han sido probados todavía en hardware AMD.
- Fidelidad de cuantización: los cuants ROCmFPX de 4 bits están más lejos de BF16 (KLD 0,0334–0,0440) que un `Q4_K_M` estándar (KLD 0,0138). Si no se necesita la velocidad AMD, es preferible el cuant estándar.
- Visión sin verificar: el proyector F16 se distribuye pero no ha sido probado con estos archivos cuantizados.
- Sin cabezal MTP: la decodificación especulativa del modelo original no está incluida, lo que puede reducir el throughput respecto a la versión oficial.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Mediciones de calidad realizadas descodificando por CPU y evaluando en GPU NVIDIA con kernels estándar; los resultados en GPU AMD pueden diferir ligeramente por el orden de cálculo.
- Publicación no oficial: no es un release de Qwen ni de OrcaRouter, con solo 609 descargas y escaso historial de uso comunitario.

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/Harsha001/Qwen3.8-27B-Uncensored-ROCmFPX
- Modelo base abliterated: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Fork ROCmFPX usado para la cuantización: https://github.com/HarshaVardhan3002/ROCmFPX
- Repositorio original de ROCmFPX: https://github.com/charlie12345/ROCmFPX
