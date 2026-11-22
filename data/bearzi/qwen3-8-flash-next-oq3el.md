# bearzi/Qwen3.8-Flash-Next-oQ3eL

## Resumen

Qwen3.8-Flash-Next-oQ3eL es una cuantización experimental del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario bearzi bajo el ecosistema oMLX (la pila de inferencia de MLX mantenida por la comunidad para Apple Silicon). No se trata de un modelo nuevo entrenado desde cero, sino de un checkpoint derivado cuyo interés está en el formato de compresión: aplica el cuantizador propio de oMLX (oQ) en su modo oQe, nivel 3, con un plugin externo (omlx-oqel 0.1.0) que introduce un esquema de cuantización denominado oQeL para las matrices de expertos enrutados.

El modelo base es un Mixture of Experts de Qwen con 48 capas MoE más una capa MTP (multi-token prediction), lo que se traduce en 147 matrices de expertos (gate, up y down) cuantizadas a 3 bits con tablas de 8 niveles ajustadas específicamente a los expertos de este modelo. El resto de tensores se mantienen en MLX affine de 8 bits, y la tabla de embeddings por capa (PLE) se toma en FP8 directamente de la tabla oficial de Qwen, lo que deja el checkpoint en torno a 119 GB.

La relevancia es doble: por un lado, documenta una técnica de cuantización agresiva (3 bits en expertos) con métricas de divergencia KL frente a BF16; por otro, es un artefacto frágil y no portable, ya que requiere un fork no fusionado de oMLX y un plugin concreto, y ni la librería estándar mlx-lm ni mlx-vlm pueden cargarlo. Está etiquetado explícitamente como experimental y su propia model card advierte de que los ficheros pueden estar incompletos durante la release 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (48 capas MoE + 1 capa MTP); transformer con multi-token prediction |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 3 bits (oQeL, tablas de 8 niveles, grupos de 16 pesos con escala E2M5 y escala bfloat16 por fila); resto en MLX affine 8 bits; tabla PLE en FP8 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (pesos); plugin omlx-oqel bajo Apache-2.0 |
| Formato de pesos | MLX (checkpoint oQeL revision 1, cargable solo con fork de oMLX + plugin omlx-oqel) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base Qwen/Qwen3.8-Flash-Next: una red de mezcla de expertos con 48 capas MoE y una capa adicional de multi-token prediction (MTP), que se usa para decodificación especulativa. La model card identifica 147 matrices de expertos enrutados (gate, up y down de las 48 capas MoE y de la capa MTP), lo que sitúa el número de expertos por capa en tres, aunque no se detalla el número total de parámetros ni los parámetros activos por token.

El proceso de cuantización es la innovación técnica real de esta ficha. Los expertos enrutados se comprimen a 3 bits mediante oQeL, un esquema con tablas de 8 niveles ajustadas a los propios expertos del modelo, agrupación de 16 pesos con un byte de escala E2M5 por grupo y una escala bfloat16 por fila. El resto de tensores usa MLX affine de 8 bits, y la tabla de embeddings por capa (PLE) se injerta en FP8 desde la tabla oficial de Qwen en lugar de BF16, lo que reduce el tamaño del checkpoint hasta unos 119 GB. El build se realizó sobre un fork de oMLX que ya incorpora la fusión de upstream (commit e1a402cf) y el refinamiento de redondeo oQ (#5292). No hay información sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO, porque el autor no entrena el modelo: solo lo cuantiza.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.8-Flash-Next; las capacidades concretas no se detallan en la información disponible.
- Decodificación especulativa mediante la capa MTP: la model card reporta 1,629 borradores aceptados por ciclo de verificación (intervalo del 95 %: 1,480–1,778) sobre 32 prompts fijos, en modo greedy y con MTP adaptativo.
- Cuantización orientada a inferencia local en Apple Silicon a través de MLX.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, agentes o multimodalidad: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de técnicas de cuantización extrema: el checkpoint sirve para medir la degradación de un MoE al comprimir sus expertos a 3 bits, usando la divergencia KL frente a BF16 como métrica (0,0369 en código y 0,0651 en prosa inglesa).
- Investigación en decodificación especulativa: la capa MTP cuantizada permite estudiar la tasa de aceptación de borradores en un modelo comprimido, con la estadística de 1,629 borradores aceptados por ciclo ya publicada.
- Desarrollo de plugins de inferencia para MLX: al requerir el plugin omlx-oqel y un fork de oMLX, es un banco de pruebas para quien trabaje en kernels de cuantización personalizados.
- Inferencia local en estaciones Apple Silicon de gran memoria: con 119 GB de pesos, encaja en equipos como el M3 Ultra con memoria unificada amplia, que es precisamente la plataforma donde el autor midió las métricas.
- Comparación de esquemas de compresión: al existir un build de referencia oQ3e con la misma calibración, plan de bits y tabla PLE en FP8, permite aislar el efecto del formato oQeL en los expertos.
- Reproducción de experimentos de cuantización: la model card documenta la cadena de herramientas (fork, commit, versión de plugin y revisión del layout), lo que facilita replicar el proceso.

## Benchmarks y rendimiento

| Metrica | oQ3eL | oQ3e (stock refinado) |
|---|---|---|
| KL a BF16, codigo | 0,0369 | 0,0438 |
| KL a BF16, prosa | 0,0651 | 0,0793 |
| Borradores MTP aceptados por ciclo (32 prompts, IC 95 %) | 1,629 [1,480, 1,778] | 1,536 [1,395, 1,689] |

La KL es KL(BF16 ‖ cuantizado) sobre todo el vocabulario por token, promediada sobre dos documentos de 16.384 tokens (código y prosa en inglés), frente a la misma referencia BF16 de la release 1. La aceptación MTP es la media sobre 32 prompts fijos de tokens borrador aceptados por ciclo de verificación (greedy, 128 tokens por prompt, MTP adaptativo). Las velocidades de decodificación y prefill en ambos Mac están, según el autor, en proceso de medición. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: aproximadamente 119 GB para el checkpoint completo, según la model card.
- GPU recomendadas: Apple Silicon con memoria unificada amplia; el autor reporta mediciones en un M3 Ultra. No hay datos para GPU NVIDIA.
- GPU de consumo: no cabe en ninguna GPU de consumo convencional (RTX 4090 con 24 GB, por ejemplo); requiere memoria unificada de gama alta en Mac.
- Opciones de despliegue: exclusivamente el fork de oMLX (rama quant-plugins-poc, con tag de release 2 pendiente) más el plugin omlx-oqel 0.1.0. No es compatible con oMLX estándar, mlx-lm ni mlx-vlm.
- Latencia y throughput: no disponibles; el autor indica que las mediciones de decodificación y prefill están en curso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bearzi/Qwen3.8-Flash-Next-oQ3eL | no disponible (48 capas MoE + MTP, 119 GB en disco) | no disponible | MLX oQeL 3 bits en expertos + affine 8 bits | Qwen Community License 1.0 | Experimental; requiere fork y plugin |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | BF16/FP8 originales | Qwen Community License 1.0 | Público en Hugging Face |
| Build oQ3e de referencia (stock refinado) | mismo modelo base | no disponible | MLX affine 8 bits + PLE FP8 | Qwen Community License 1.0 | Referencia interna del autor, no publicada como repo independiente en la información disponible |

No se dispone de datos sobre otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Estado experimental explícito: el layout oQeL (revisión 1) y los kernels del plugin pueden cambiar, y una versión posterior del plugin podría rechazar este checkpoint, obligando a recuantizarlo.
- Dependencia de software no fusionado: necesita el fork yohann-bearzi/omlx (rama quant-plugins-poc) y el plugin omlx-oqel 0.1.0; no funciona con oMLX estándar, mlx-lm ni mlx-vlm.
- Ficheros potencialmente incompletos: la model card advierte de que la release 2 está en curso y recomienda no descargar hasta que desaparezca el aviso.
- Degradación por cuantización: la KL frente a BF16 es de 0,0369 en código y 0,0651 en prosa, lo que implica divergencia respecto al modelo original, especialmente en texto libre.
- Licencia: los pesos heredan la Qwen Community License 1.0, con posibles restricciones para uso comercial que deben revisarse en el enlace oficial; el plugin es Apache-2.0.
- Idiomas, sesgos y riesgo de alucinación: no disponibles en la información proporcionada; deben evaluarse contra el modelo base.
- Sin benchmarks estándar publicados: no hay datos de MMLU, HumanEval ni GSM8K para este checkpoint.
- Huella de memoria muy alta (unos 119 GB), lo que limita su uso a hardware de gama alta con memoria unificada.

## Enlaces

- Hugging Face: https://huggingface.co/bearzi/Qwen3.8-Flash-Next-oQ3eL
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Fork de oMLX (rama quant-plugins-poc): https://github.com/yohann-bearzi/omlx/tree/quant-plugins-poc
- Plugin omlx-oqel: https://github.com/yohann-bearzi/omlx-oqel
