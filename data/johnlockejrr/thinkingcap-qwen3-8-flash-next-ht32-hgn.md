# johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-ht32-HGN

## Resumen

ThinkingCap-Qwen3.8-Flash-Next-ht32-HGN es un paquete de pesos cuantizados en formato nativo Halogen `.hgn`, generado por el usuario johnlockejrr a partir del fine-tune BF16 `bottlecapai/ThinkingCap-Qwen3.8-Flash-Next`, que a su vez deriva del modelo base `Qwen/Qwen3.8-Flash-Next`. Se trata de una conversión experimental con el perfil `ht32`, que aplica una política de cuantización de un bit menos que el perfil HT43 (expertos en HT3 en capas pares y HT2 en capas impares), con el objetivo declarado de reducir el tamaño residente del trunk para que quepa en sistemas con 64 GB de memoria unificada, como las plataformas Strix Halo.

El modelo hereda el comportamiento del upstream ThinkingCap, un post-entrenamiento de BottleCap AI sobre Flash-Next orientado a reducir el número de tokens de razonamiento: según la model card, alrededor de un 38,5 % menos de tokens de pensamiento de media (rango de 22 a 51 % según benchmark) con una precisión de aproximadamente 88,8 % frente al 89,8 % del base. La arquitectura es de mezcla de expertos (MoE) según los tags del repositorio, aunque no se detallan en la información disponible el número total de parámetros ni la longitud de contexto.

La relevancia de este paquete es fundamentalmente de investigación en cuantización extrema: no es un checkpoint listo para producción. Los pesos no cargan en Transformers, vLLM ni llama.cpp, y tampoco funcionan con las builds actuales de `halogen-flash-server`, que solo aceptan los perfiles v2, HT43 y HT4. El propio autor lo describe como material para conversores y experimentos hasta que exista soporte oficial de HT32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), segun tags del repositorio; detalles de capas y attention no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Perfil Halogen HT32: expertos enrutados HT3 en capas pares y HT2 en capas impares; mixers de hiperconexion Q8G64; politica `bf16-hgn-ht32-rtn-nf4-signed-rms-trellis-v1` |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en el Hub) |
| Formato de pesos | Halogen `.hgn` (no compatible con safetensors, GGUF ni Transformers) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de mezcla de expertos (MoE) de la familia Qwen3.8-Flash-Next, sobre el que BottleCap AI aplicó un post-entrenamiento orientado a la eficiencia de razonamiento. ThinkingCap reduce el número de tokens de pensamiento en aproximadamente un 38,5 % de media (22-51 % según benchmark) manteniendo una precisión cercana al base (88,8 % frente a 89,8 %). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

Este paquete concreto no es un reentrenamiento: es una reconversión de los pesos BF16 originales (131 shards en safetensors) mediante la herramienta `bf16-to-hgn` 0.1.0 con perfil `ht32`. La política de cuantización combina cuantización por redondeo (RTN) con NF4 con signo, RMS y trellis para los expertos, y mantiene los mixers de hiperconexión en Q8G64. El trunk incluye el módulo MTP (multi-token prediction) embebido, sin fichero `mtp.hgn` separado. El tamaño del trunk es de 39,60 GiB, deliberadamente inferior a los perfiles HT43 (~53,7 GiB), HT4 (~60,7 GiB) y v2 (~62 GiB), para dejar margen de KV cache en 64 GB de memoria unificada. La tabla de n-gramas (47,68 GiB) es obligatoria junto al checkpoint, y la torre de visión (0,84 GiB) es opcional.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento reducido (shorter-thinking), heredado de ThinkingCap.
- Capacidad multimodal de visión, dado que el paquete incluye una torre de visión opcional (`qwen38-flash-next-vision.hgn`).
- Decodificación asistida por tabla de n-gramas, con payload obligatorio de 47,68 GiB.
- Multi-token prediction (MTP) embebido en el trunk.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Investigación en cuantización extrema: el paquete sirve como material de referencia para desarrolladores de conversores que quieran validar la política HT32 y comparar la degradación frente a HT43, HT4 y v2 sobre el mismo modelo base.
- Desarrollo del loader HT32: útil para el equipo de Halogen (peonist) como checkpoint de prueba para implementar y depurar el soporte de identidad `qwen3.8-flash-next-ht32` y del payload de expertos HT2 (`16`/`0x1204`).
- Evaluación de memoria en Strix Halo: permite medir el consumo real de un trunk de 39,60 GiB más tabla de n-gramas en sistemas de 64 GB de memoria unificada, con margen para KV cache.
- Estudio de degradación por cuantización: comparando este pack con los hermanos HT43 y HT4 se puede cuantificar la pérdida de precisión al bajar un bit en los expertos.
- Pruebas de decodificación especulativa con n-gramas: la tabla de 47,68 GiB compartida con los packs v2 y HT4 permite experimentar con decodificación asistida por n-gramas en el mismo modelo.
- Reproducibilidad de conversiones: el `conversion-manifest.json` y el `sha256.txt` permiten verificar la cadena de conversión BF16 a HGN con semilla y parámetros documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta las cifras del upstream ThinkingCap frente a su base: aproximadamente 38,5 % menos tokens de pensamiento de media y 88,8 % de precisión frente a 89,8 % del base. No hay datos de rendimiento específicos del perfil HT32.

## Requisitos de hardware

- VRAM/memoria: el trunk ocupa 39,60 GiB, la tabla de n-gramas 47,68 GiB y la torre de visión 0,84 GiB; en total unos 88 GiB en disco. El objetivo declarado del perfil es un sistema con 64 GB de memoria unificada, con margen para KV cache.
- GPU recomendadas: plataformas Strix Halo con 64 GB de memoria unificada, según la model card. No se especifican otras GPU compatibles.
- Consumer GPU: no cabe en GPU de consumo con 24 GB o menos; el trunk por sí solo supera los 39 GiB.
- Despliegue: exclusivamente mediante una futura build de `halogen-flash-server` con soporte HT32. No es compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Pack | Expertos enrutados | Mixers | Tamaño trunk | Ejecutable en flash-server actual |
|---|---|---|---|---|
| ThinkingCap v2 (I4R) | I4R | Q6G64 | ~62 GiB | Sí |
| ThinkingCap HT43 | HT4 par / HT3 impar | Q8G64 | ~53,7 GiB | Sí |
| ThinkingCap HT4 | HT4 en todas las capas | Q8G64 | ~60,7 GiB | Sí |
| ThinkingCap HT32 (este) | HT3 par / HT2 impar | Q8G64 | 39,60 GiB | No |

## Limitaciones y advertencias

- No carga en las builds actuales de `halogen-flash-server`: solo aceptan v2, HT43 y HT4. No debe montarse como checkpoint de producción.
- Incompatible con Transformers, vLLM, llama.cpp, Ollama y cualquier runtime estándar; requiere el loader Halogen HT32.
- La tabla de n-gramas (47,68 GiB) es obligatoria junto al checkpoint, lo que eleva el requisito de almacenamiento a unos 88 GiB.
- El identificador HT2 (`16`/`0x1204`) es un alias provisional del fork del conversor, pendiente de un id oficial; puede cambiar y romper rutas de carga.
- Cuantización de un bit menos que HT43: se espera mayor degradación de calidad, aunque no se han publicado métricas específicas del perfil HT32.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Licencia qwen-community-license-1.0: conviene revisar sus restricciones de uso comercial antes de cualquier despliegue.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay validación comunitaria del paquete.

## Enlaces

- [Hugging Face: johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-ht32-HGN](https://huggingface.co/johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-ht32-HGN)
- [Modelo base BF16: bottlecapai/ThinkingCap-Qwen3.8-Flash-Next](https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next)
- [Modelo base original: Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [Blog de ThinkingCap en BottleCap AI](https://bottlecapai.com/post/thinkingcap-qwen3-8-flash-next/)
- [Sitio de BottleCap AI](https://www.bottlecapai.com/)
- [Pack hermano v2 (I4R)](https://huggingface.co/johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-HGN)
- [Pack hermano HT43](https://huggingface.co/johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-ht43-HGN)
- [Pack hermano HT4](https://huggingface.co/johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-ht4-HGN)
- [Pack calibrado RCO (v2)](https://huggingface.co/johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-calibrated-rco-HGN)
- [Pack abliterated (v2)](https://huggingface.co/johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-abliterated-HGN)
