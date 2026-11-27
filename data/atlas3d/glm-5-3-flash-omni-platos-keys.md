# Atlas3D/GLM-5.3-Flash-Omni-Platos-Keys

## Resumen

GLM-5.3-Flash-Omni-Platos-Keys es un paquete de pesos publicado por Atlas3D bajo el identificador `Atlas3D/GLM-5.3-Flash-Omni-Platos-Keys`. No se trata de un modelo de lenguaje completo, sino de un conjunto de proyectores lineales en formato safetensors que, según la model card, actúan como puente entre un tronco congelado `GLM-5.3-Flash` y dos cabeceras multimodales: `MiniMax-H3` y `Qwen3-TTS`. El autor denomina a esta técnica "zero-gradient omni-modal grafting", es decir, un injerto multimodal sin entrenamiento por descenso de gradiente, resuelto en forma cerrada (closed-form) y ajustado en FP64 antes de serializarse en FP16.

El artefacto resuelve un problema concreto de ingeniería: alinear los espacios latentes de un LLM congelado con los de módulos de generación de vídeo o audio sin reentrenar el tronco ni las cabeceras. El repositorio ocupa 0,8 GB y contiene varios ficheros de proyección con resultados de validación declarados sobre un conjunto sellado denominado "Confirm-160". La relevancia actual es metodológica: propone una vía de adaptación multimodal de bajo coste computacional frente al ajuste fino convencional.

La información pública es muy limitada. No se declaran parámetros del tronco, longitud de contexto, idiomas soportados ni pipeline de Hugging Face. Las cifras de rendimiento que aparecen en la model card son métricas de reconstrucción de proyección (coseno, R², MSE), no benchmarks de capacidad lingüística o multimodal. Todo dato no presente en la información proporcionada se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyectores lineales (ridge / forma cerrada) sobre tronco transformer congelado `GLM-5.3-Flash`; injerto hacia `MiniMax-H3` y `Qwen3-TTS` |
| Parametros totales | No disponible (el repo pesa 0,8 GB; el mayor fichero declarado es de 449 MiB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos serializados en FP16; ajuste interno en FP64. No se declaran otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con `MANIFEST.sha256.json` para verificación de integridad) |

## Arquitectura y entrenamiento

El paquete no entrena un transformer, sino que ajusta proyectores que mapean activaciones intermedias del tronco `GLM-5.3-Flash` al espacio de entrada de `MiniMax-H3` (generación visual) y de `Qwen3-TTS` (síntesis de voz). El método se describe como "closed-form FP64-fitted": se resuelve una regresión ridge en precisión doble sobre pares de activaciones y luego se serializa el resultado en FP16. No hay retropropagación ni descenso de gradiente, de ahí la etiqueta `zero-gradient`. El tronco y las cabeceras permanecen congelados.

Se publican cuatro artefactos con distinto punto de extracción. El de un solo punto (`glm53_to_h3_single_tap_platos_key.safetensors`, 40 MiB) toma la media del canal HC en la capa 4. El de dos puntos (`concat2`, 80 MiB) concatena las capas 4 y 38. El de cuatro puntos (`concat4`, 160 MiB) no aplica estandarización por slot, y el propio autor advierte que la dispersión de RMS entre capas de GLM-5.3 (rango 0,03855 a 1,3548) degrada los slots tempranos, por lo que recomienda `single_tap` o `concat2` para uso autónomo. El cuarto fichero (`glm53_packetC_mouth_platos_key.safetensors`, 449 MiB) es el proyector ridge "Mouth" de Packet C para Qwen3-TTS. No se especifican tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO, porque el procedimiento no es de entrenamiento generativo.

## Capacidades

- Adaptación multimodal del tronco `GLM-5.3-Flash` hacia `MiniMax-H3` sin reentrenar el modelo base.
- Conexión del mismo tronco con la cabecera de síntesis de voz `Qwen3-TTS` mediante el proyector Packet C.
- Extracción de activaciones en múltiples profundidades (capas 4, 38 y concatenaciones de hasta cuatro puntos).
- Verificación de integridad de pesos mediante digests SHA-256 en `MANIFEST.sha256.json`.
- Ajuste determinista en forma cerrada, reproducible sin semillas de entrenamiento.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso, agentes ni soporte multilingüe explícito para este paquete.

## Casos de uso

- Investigación en alineación de espacios latentes: usar los proyectores `single_tap` o `concat2` para estudiar cómo se mapean las representaciones internas de un LLM congelado al espacio de un generador visual, con métricas de reconstrucción reproducibles.
- Prototipado de pipelines omni-modales de bajo coste: conectar `GLM-5.3-Flash` con `MiniMax-H3` sin GPU de entrenamiento, ya que el ajuste es en forma cerrada y solo requiere inferencia para extraer activaciones.
- Generación de voz condicionada por texto: emplear el proyector Packet C (449 MiB) como puente hacia `Qwen3-TTS` en experimentos de síntesis de habla guiada por representaciones del LLM.
- Reproducción de resultados académicos: el conjunto sellado Confirm-160 y los digests SHA-256 permiten replicar las métricas declaradas (cos 0,91936, R² 0,99826 en `single_tap`) en entornos controlados.
- Auditoría de métodos "zero-gradient": comparar el injerto en forma cerrada frente a alternativas con descenso de gradiente usando el baseline "deranged B0" citado por el autor (MSE 228,80 frente a 3,463).
- Integración en frameworks de investigación multimodal: cargar los safetensors en un pipeline propio que ya disponga de los troncos `GLM-5.3-Flash`, `MiniMax-H3` y `Qwen3-TTS`, dado que este repo solo distribuye los proyectores.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de reconstrucción de la proyección sobre el conjunto sellado Confirm-160, no benchmarks de capacidad del modelo.

| Artefacto | Tamano | Capas | cos | R² | MSE |
|---|---|---|---|---|---|
| `glm53_to_h3_single_tap_platos_key` | 40,0 MiB | 4 (media HC) | 0,91936 | 0,99826 | 3,463 |
| `glm53_to_h3_concat2_platos_key` | 80,0 MiB | 4 + 38 | 0,89603 | 0,99777 | 4,428 |
| `glm53_to_h3_concat4_platos_key` | 160,0 MiB | 4 capas (sin normalizar) | 0,82726 | 0,99612 | No disponible |
| Baseline `B0` (deranged) | No disponible | No disponible | 0,77172 | No disponible | 228,80 |

El autor indica que `single_tap` reduce el MSE 66,1 veces respecto al baseline `B0`. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks multimodales estándar en la información disponible.

## Requisitos de hardware

- VRAM para los proyectores: el mayor fichero es de 449 MiB en FP16, por lo que los proyectores caben holgadamente en cualquier GPU consumer con 4 GB o más.
- VRAM para el sistema completo: no disponible, ya que depende de los troncos `GLM-5.3-Flash`, `MiniMax-H3` y `Qwen3-TTS`, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible para el conjunto completo; para cargar y aplicar los proyectores basta una GPU con soporte FP16 (RTX 3060 en adelante).
- Cabe en GPU consumer: sí para los proyectores; el sistema completo depende de los modelos base.
- Opciones de despliegue: carga directa de safetensors con `safetensors` o `transformers`; no se declaran integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-Omni-Platos-Keys (Atlas3D) | Proyectores de injerto multimodal | No disponible (repo 0,8 GB) | No disponible | MIT | Hugging Face |
| Alternativas de adaptación multimodal (p. ej. conectores tipo LLaVA o Q-Former) | Proyectores entrenados por gradiente | Variable | Depende del tronco | Variable | Amplia |
| Modelos omni-modales completos (p. ej. familia Qwen-Omni) | Transformer multimodal extremo a extremo | Miles de millones | Decenas de miles de tokens | Variable | Hugging Face |

No se dispone de datos públicos suficientes para comparar rendimiento con alternativas concretas; las métricas del paquete son de reconstrucción de proyección y no son equiparables a benchmarks de capacidad. Se indica "no disponible" para cualquier comparación cuantitativa fiable.

## Limitaciones y advertencias

- El repositorio no contiene un modelo autónomo: sin los troncos `GLM-5.3-Flash`, `MiniMax-H3` y `Qwen3-TTS`, los pesos no son utilizables.
- Cero descargas y cero "likes" en el momento de la consulta: no hay validación independiente de los resultados declarados.
- Las métricas (cos, R², MSE) miden fidelidad de proyección sobre un conjunto propio (Confirm-160), no calidad generativa ni ausencia de alucinación.
- El autor advierte que el artefacto `concat4` degrada los slots tempranos por dispersión de RMS entre capas; no se recomienda para uso autónomo.
- No se declaran idiomas soportados, sesgos conocidos ni evaluaciones de seguridad.
- La licencia MIT permite uso comercial, pero la responsabilidad sobre los modelos base subyacentes recae en sus respectivas licencias, no detalladas aquí.
- No hay información sobre latencia, throughput ni comportamiento en producción; cualquier despliegue requiere validación propia.
- El identificador y la fecha de creación (2026-11-27) sugieren un artefacto experimental de investigación, no un modelo listo para producción.

## Enlaces

- Hugging Face: https://huggingface.co/Atlas3D/GLM-5.3-Flash-Omni-Platos-Keys
- Paper v0.9 (PAPER.md): https://github.com/Atlas3DSS/atlas-ingine/blob/feat/zero-gradient-omni-modal-grafting/modules/zero_gradient_omni_modal_grafting/PAPER.md
- Colección Omni by Atlas: https://huggingface.co/collections/Atlas3D/omni-by-atlas-6b09daccd0f65e23233163b3
