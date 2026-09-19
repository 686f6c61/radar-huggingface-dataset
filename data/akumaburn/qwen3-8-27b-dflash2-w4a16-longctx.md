# akumaburn/Qwen3.8-27B-DFlash2-W4A16-longctx

## Resumen

`akumaburn/Qwen3.8-27B-DFlash2-W4A16-longctx` es un modelo borrador (draft model) de 1.924.404.480 parámetros pensado exclusivamente para decodificación especulativa con el método DFlash2 dentro de vLLM. No es un modelo generativo autónomo: su función es proponer tokens candidatos que el modelo objetivo (`Qwen3.8-27B` y variantes cuantizadas del mismo) verifica después. Los pesos son byte a byte idénticos a `syvai/Qwen3.8-27B-DFlash2-W4A16`; la única diferencia en `config.json` es `max_position_embeddings`, que pasa de 262.144 a 393.216.

El problema que resuelve es concreto: cuando el modelo objetivo se extiende con YaRN más allá de su contexto nativo de 262.144 tokens, el borrador original es consultado en posiciones que su tabla RoPE no cubre, lo que provoca un fallo de aserción en CUDA (`index out of bounds: 0 <= ... < 262144`) y mata el motor de vLLM completo, no solo la petición afectada. Ampliar el rango de posiciones evita ese aborto en mitad de sesión, a cambio de degradar la longitud de aceptación de 3,82 a 2,70 tokens en contextos de 300k.

La relevancia es operativa: permite servir objetivos con contexto de hasta 393.216 tokens (extensión YaRN de factor 1,5) sin caídas duras del motor. Está cuantizado en W4A16 (INT4 en pesos, 16 bits en activaciones) con `compressed-tensors` en formato empaquetado, ocupa 1,3 GB de repositorio y requiere una versión parcheada de vLLM (0.29.0 de serie falla al inicializar).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3 para decodificación especulativa (DFlash2), con atención de ventana deslizante de 2048 tokens y RoPE sin YaRN |
| Parametros totales | 1.924.404.480 (aprox. 1,92 mil millones) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 393.216 tokens (`max_position_embeddings`); el repositorio original declara 262.144 |
| Tipos de cuantizacion | W4A16: INT4 en pesos y 16 bits en activaciones, checkpoint empaquetado (pack-quantized) de `compressed-tensors` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |
| Tamano del repositorio | 1,3 GB |
| Libreria declarada | vllm |
| Modelo base | syvai/Qwen3.8-27B-DFlash2-W4A16 (relacion: adapter) |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa de la familia DFlash2, originalmente publicado por inco.ai / z-lab y cuantizado por syv-ai. Internamente usa atención de ventana deslizante con ventana de 2048 tokens, de modo que RoPE influye en la atención únicamente a través de desplazamientos relativos que nunca superan esa ventana. Por eso ampliar el rango absoluto de posiciones no altera el cálculo dentro de ninguna ventana: no se reentrena nada y no se toca ningún peso, solo se construye una caché RoPE lo bastante grande para indexar posiciones más altas.

No hay información disponible sobre datos de entrenamiento, número de tokens, composición del dataset, ni sobre fases de RLHF o DPO, dado que este repositorio no entrena: reutiliza íntegramente los pesos de `syvai/Qwen3.8-27B-DFlash2-W4A16`. La innovación técnica reseñable es la corrección de configuración para contextos largos combinada con la cuantización empaquetada, que además exige el parche de vLLM para borradores cuantizados: la versión de serie lee `qkv_proj.weight`, un tensor que un checkpoint empaquetado no expone, y falla en la inicialización con `AttributeError: 'QKVParallelLinear' object has no attribute 'weight'` en `qwen3_dflash.py:472`. El número máximo de tokens especulativos es 7, el límite arquitectónico dado que `block_size` es 8.

## Capacidades

- Generación de tokens borrador para decodificación especulativa con el método DFlash2 en vLLM, con hasta 7 tokens especulativos por paso.
- Aceleración de la inferencia de un modelo objetivo `Qwen3.8-27B` sin modificar la salida final, ya que el objetivo verifica cada borrador.
- Soporte de contextos largos de hasta 393.216 tokens sin provocar el aborto del motor de vLLM que ocurre con la configuración original de 262.144.
- Funcionamiento correcto con objetivos extendidos mediante YaRN (factor 1,5 sobre 262.144 posiciones nativas).
- Compatibilidad con caché KV en `fp8_e4m3` y planificación asíncrona (`--async-scheduling`).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento propio: esas capacidades residen en el modelo objetivo.
- Multilingüismo: no disponible como dato declarado; no relevante, porque el borrador solo propone tokens dentro del espacio del objetivo.

## Casos de uso

- Servicio de un objetivo Qwen3.8-27B con contexto de 300k tokens: el borrador con `max_position_embeddings` ampliado mantiene el motor vivo donde la configuración original lo mata por aserción de CUDA, con una longitud de aceptación medida de 2,70.
- Aceleración de pipelines RAG con documentos largos: al trabajar sobre contextos de 150k tokens la aceptación sube a 3,82, de modo que cada paso verificado produce varios tokens, reduciendo el número de pasos de decodificación necesarios.
- Atención al cliente con historiales extensos: conversaciones multi-turno que superan los 262.144 tokens pueden servirse sin reinicios del motor, algo imposible con el borrador sin ampliar.
- Asistentes de código sobre repositorios grandes: el contexto largo permite incluir múltiples ficheros y el borrador reduce la latencia por token generado cuando el objetivo se sirve con DFlash2.
- Análisis de documentación técnica o legal extensa: en despliegues que requieren prompts de cientos de miles de tokens, el borrador evita el fallo duro a mitad de sesión que obliga a reiniciar el servicio.
- Reducción de coste por token en inferencia por lotes: la decodificación especulativa disminuye el número de pasos de decodificación del objetivo, con el ahorro proporcional a la longitud de aceptación (2,70 en 300k, 3,82 en 150k).
- Despliegue en hardware de gama alta con memoria limitada: al ocupar solo 1,3 GB en W4A16 y usar ventana deslizante de 2048, el borrador añade poca presión de memoria sobre el objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval ni GSM8K). El único dato de rendimiento facilitado es la longitud de aceptación medida en decodificación voraz (`greedy`), con `num_speculative_tokens=7`, sobre `Swift-Qwen3.8-27b-heretic-W8A8-DFlash2`, una GPU CMP 170HX (64 GB) y caché KV `fp8_e4m3`:

| Contexto del objetivo | Longitud de aceptacion | Resultado |
|---|---|---|
| 150k | 3,82 | Correcto |
| 300k, configuracion original | No disponible | Motor caido (aserción CUDA) |
| 300k, esta configuracion | 2,70 | Funciona, salida coherente |
| 300k, cabecera MTP incluida en el checkpoint | 2,51 | Referencia interna del objetivo |

A 300k tokens el borrador DFlash2 (2,70) sigue superando a la cabecera MTP propia del checkpoint (2,51), por lo que DFlash2 sigue siendo la opción de especulación preferible incluso en extrapolación.

## Requisitos de hardware

- VRAM para el borrador: aproximadamente 1,3 GB de pesos en W4A16, más una caché KV reducida por la ventana deslizante de 2048 tokens.
- GPU empleada en las mediciones publicadas: una CMP 170HX con 64 GB, sirviendo el objetivo con caché KV en `fp8_e4m3`.
- La VRAM total del despliegue la determina el modelo objetivo; el borrador es un añadido marginal.
- Cabe en GPU de consumo en cuanto al borrador, aunque el objetivo de 27B sí condiciona el requisito real de memoria conjunto.
- Despliegue: vLLM con `--speculative-config '{"method":"dflash","model":"akumaburn/Qwen3.8-27B-DFlash2-W4A16-longctx","num_speculative_tokens":7}'`. Requiere vLLM parcheado: vllm-project/vllm#51684 (solución completa, pensada para upstream) o akumaburn/vllm-dflash2 (parche limitado). Un borrador en BF16 no necesita parche.
- Latencia y throughput: no disponibles más allá de las longitudes de aceptación indicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Aceptacion a 300k | Parche de vLLM | Licencia |
|---|---|---|---|---|---|
| Este repositorio (W4A16-longctx) | 1,92B | 393.216 | 2,70 | Si (borrador cuantizado empaquetado) | Apache 2.0 |
| syvai/Qwen3.8-27B-DFlash2-W4A16 (original) | 1,92B | 262.144 | Falla: motor caido | Si | Apache 2.0 |
| Borrador DFlash2 en BF16 | No disponible | 262.144 | No disponible | No | No disponible |
| Cabecera MTP del checkpoint del objetivo | No disponible | No disponible | 2,51 | No | No disponible |

Como dato adicional, el borrador rechaza todos los borradores (aceptación exactamente 1,00) si el objetivo está rotado con QuaRot; el objetivo debe estar sin rotar.

## Limitaciones y advertencias

- No es un modelo de chat ni de generación autónoma: solo produce borradores que el objetivo verifica. No debe evaluarse con benchmarks de conocimiento.
- Por debajo de 262.144 tokens de contexto no aporta nada frente a `syvai/Qwen3.8-27B-DFlash2-W4A16`: los pesos son idénticos y la única diferencia es el límite de posiciones.
- Por encima del rango entrenado del borrador hay extrapolación: la longitud de aceptación cae de 3,82 (150k) a 2,70 (300k), lo que reduce la ganancia de velocidad.
- Con la configuración original a 300k tokens el fallo es duro: una aserción en el lado del dispositivo mata el motor completo de vLLM (`EngineDeadError`), no solo la petición afectada.
- Requiere vLLM parcheado al tratarse de un checkpoint empaquetado; con vLLM 0.29.0 sin parche falla en la inicialización del motor.
- Incompatible con objetivos rotados con QuaRot: la aceptación cae a 1,00.
- Ajustar `max_position_embeddings` al valor servido; 393.216 corresponde a una extensión YaRN de factor 1,5 sobre 262.144. Un valor mal ajustado puede volver a provocar el fallo de índice.
- Licencia Apache 2.0 en este repositorio, pero el uso comercial está sujeto también a las condiciones de los artefactos de origen (inco.ai / z-lab y Qwen) y a la licencia del modelo objetivo.
- Riesgo de alucinación y sesgos: no evaluables aquí, porque el borrador no genera la respuesta final. Los sesgos del sistema provienen del modelo objetivo.
- Idiomas soportados: no disponibles como dato declarado.
- No hay resultados de benchmarks publicados; las cifras de aceptación proceden de una única medición en una CMP 170HX y pueden no reproducirse en otro hardware o configuración.

## Enlaces

- Repositorio del modelo: https://huggingface.co/akumaburn/Qwen3.8-27B-DFlash2-W4A16-longctx
- Modelo base (mismos pesos, contexto 262.144): https://huggingface.co/syvai/Qwen3.8-27B-DFlash2-W4A16
- Modelo de origen DFlash2: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Repositorio de cuantizacion de syv-ai: https://github.com/syv-ai/qwen38-27b-rtx3090
- Parche completo en vLLM (PR #51684): https://github.com/vllm-project/vllm/pull/51684
- Parche alternativo limitado: https://github.com/akumaburn/vllm-dflash2
- Objetivo usado en las mediciones: https://huggingface.co/akumaburn/Swift-Qwen3.8-27b-heretic-W8A8-DFlash2
- Resultados de busqueda web: no se han encontrado resultados relevantes (la busqueda solo devolvio una pagina no relacionada).
