# AIGAROU/gn3d2mx93bgmm3xn

## Resumen

Este repositorio contiene una build no censurada de investigación del modelo Qwen3.6-35B-A3B, publicada por el usuario AIGAROU (los créditos de la model card apuntan a "kyaky · Blackwell team"). Se trata de un modelo de lenguaje de tipo Mixture-of-Experts con 35.107.181.936 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (top-8 sobre 256 expertos), construido sobre la arquitectura multimodal híbrida GatedDeltaNet + attention de la familia Qwen3.6. El problema que aborda es específico: los modelos "abliterated" tradicionales suprimen las negativas mediante proyección de pesos, pero en modelos con modo de razonamiento (`<think>`) esa supresión se puede reconstruir dentro de la cadena de pensamiento, de modo que el modelo acaba negándose igualmente.

La contribución declarada es un pipeline de abliteración suave seguido de fine-tuning con datos de chain-of-thought compliant y un DPO on-policy ligero, de forma que el comportamiento sea consistente tanto con thinking activado como desactivado. El artefacto se distribuye cuantizado en NVFP4 (unos 21 GB), con pesos FP4 para los expertos y FP8 para la atención, orientado a hardware Blackwell (sm120). Existe también un artefacto en BF16 para re-cuantizar a otros formatos.

Es relevante ahora porque ejemplifica una tendencia doble: por un lado, la llegada de cuantizaciones FP4 nativas para GPUs Blackwell; por otro, la publicación de variantes sin guardarraíles orientadas explícitamente a red-team y análisis de sobre-negativa. La model card incluye una sección de "evaluation honesty" en la que el autor retira una claim previa de superioridad en compliance tras detectar artefactos de medición (decodificación greedy, presupuesto de tokens insuficiente, juez poco fiable).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida multimodal GatedDeltaNet + attention (familia Qwen3.6), MoE con 256 expertos fusionados, top-8 |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | ~3B (top-8 sobre 256 expertos) |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de serving con vLLM; no se documenta el máximo nativo) |
| Tipos de cuantización | NVFP4 (pesos FP4 en expertos + FP8 en atención); BF16 disponible para re-cuantizar a FP8, AWQ, GGUF u otros |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (8-bit / NVFP4); repo de 22,5 GB |

## Arquitectura y entrenamiento

La base es Qwen3.6-35B-A3B, un transformer híbrido que combina capas GatedDeltaNet (atención lineal con estado recurrente) y capas de atención clásica, con un MoE de 256 expertos fusionados y enrutamiento top-8 que activa aproximadamente 3B parámetros por token. La model card la describe como multimodal, aunque no detalla qué modalidades adicionales al texto están realmente soportadas en esta build.

El entrenamiento de esta variante sigue la receta: abliteración suave (proyección de pesos para suprimir la dirección de negativa) → SFT con una mezcla de aproximadamente 85% orientada a capacidad (OpenMathInstruct-2, OpenCodeReasoning, Tulu-3 sin la parte de seguridad) y 15% orientada a compliance, de la cual la mitad son cadenas de pensamiento compliant (análisis de `gpt-oss` convertido a `<think>`) y la otra mitad respuestas directas → DPO on-policy ligero → cuantización NVFP4 → re-evaluación. La innovación técnica declarada no es la abliteración en sí, sino el tratamiento del fallo de "reconstrucción de negativa" dentro del bloque `<think>`: se enseña al modelo a mantenerse consistente a lo largo de la ruta de razonamiento, en lugar de confiar solo en la proyección de pesos. El autor afirma que el comportamiento es independiente del formato de cuantización, verificado entre formatos.

## Capacidades

- Generación de texto conversacional y razonamiento en modo thinking (`<think>`), que es el modo por defecto en despliegue.
- Razonamiento matemático: GSM8K con thinking activado reportado en 0,913.
- Generación de código, con datos de entrenamiento específicos (OpenCodeReasoning).
- Consistencia entre thinking-ON y thinking-OFF, declarada como comparable por el autor.
- Eficiencia de tokens: respuesta final completa dentro de un presupuesto de ~1024 tokens en aproximadamente el 97% de los prompts, según la model card.
- Multimodalidad heredada de la arquitectura base (GatedDeltaNet + attention multimodal), sin detalle de modalidades en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el modo thinking lo habilita de forma implícita.
- Capacidades multilingües: no disponibles; la model card menciona que otros modelos del campo sacrifican calidad en idiomas distintos del inglés, pero no aporta cifras propias.

## Casos de uso

- Red-team controlado de sistemas de moderación: el modelo sirve como generador adversario para probar clasificadores de contenido y políticas de refusal en pipelines de seguridad, dado que no incorpora guardarraíles y puede producir las respuestas que un filtro debería bloquear.
- Análisis de sobre-negativa (over-refusal): comparar las respuestas de esta build con las de Qwen3.6-35B-A3B original sobre un conjunto de prompts benignos permite cuantificar cuántas negativas legítimas elimina la abliteración y a qué coste en capacidad.
- Estudio de fallos en modo thinking: el caso de la "reconstrucción de negativa" dentro de `<think>` es un objeto de estudio reproducible; investigadores de alineamiento pueden usar el modelo para analizar cómo las cadenas de razonamiento reintroducen comportamientos suprimidos por proyección de pesos.
- Desarrollo de benchmarks de compliance: la propia model card documenta los errores metodológicos típicos (greedy decoding, presupuesto de tokens corto, juez poco fiable); el modelo sirve como sujeto de prueba para calibrar nuevas metodologías de evaluación.
- Investigación local en hardware Blackwell: con ~21 GB en NVFP4 cabe en una GPU consumer de gama alta con 24 GB o más, lo que permite experimentación con modelos de 35B totales en una sola tarjeta mediante vLLM con `--reasoning-parser qwen3`.
- Evaluación de cuantización FP4: al existir artefacto BF16 y NVFP4 del mismo modelo, es un caso útil para medir la degradación real de FP4 frente a BF16 en tareas de razonamiento y coherencia.
- Experimentación con decodificación y presupuestos de tokens: la métrica de eficiencia de tokens (respuesta completa en ~1024 tokens en el 97% de prompts) permite estudiar el equilibrio entre latencia, coste y calidad en despliegues con razonamiento.

## Benchmarks y rendimiento

| Benchmark | Condición | Resultado |
|---|---|---|
| GSM8K | thinking-ON | 0,913 |
| GSM8K | completions en crudo | 0,873 |
| Eficiencia de tokens | respuesta final completa en presupuesto de ~1024 tokens | ~97% de los prompts |
| Calidad de cuantización | NVFP4 (~21 GB) frente a BF16 | comportamiento aproximadamente equivalente, dentro del ruido |
| Coherencia | verificado entre formatos de cuantización | limpia |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni comparativas numéricas detalladas frente a modelos concretos. La model card retira explícitamente la claim previa de superioridad en compliance ("80% frente a un campo del 3-63%") por considerarla un artefacto de medición.

## Requisitos de hardware

- VRAM estimada: ~21 GB para el artefacto NVFP4; el repo completo ocupa 22,5 GB. El artefacto BF16 requeriría aproximadamente 70 GB en pesos (35,1B parámetros × 2 bytes), más overhead de activaciones y caché KV.
- GPU recomendadas: hardware Blackwell (sm120) para NVFP4 nativo; el ejemplo de serving de la model card usa vLLM con `--trust-remote-code --reasoning-parser qwen3 --max-model-len 32768`.
- Cabe en GPU consumer: sí en el caso NVFP4, en tarjetas con 24 GB o más (por ejemplo, RTX 4090/5090), siempre que el runtime soporte NVFP4; en Blackwell de datacenter (B200) sin problema. Para BF16 se necesita una A100 80 GB o H100 80 GB.
- Opciones de despliegue: vLLM es el runtime documentado. Para llama.cpp, Ollama o TGI habría que re-cuantizar desde el artefacto BF16 a GGUF u otro formato, ya que no se distribuye GGUF en este repo.
- Latencia y throughput: no disponibles. La model card destaca la eficiencia de tokens como proxy de menor coste por respuesta, pero no publica tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización destacada | Licencia | Notas |
|---|---|---|---|---|---|---|
| AIGAROU/gn3d2mx93bgmm3xn (esta ficha) | 35,1B | ~3B | 32.768 (en serving) | NVFP4 ~21 GB | Apache 2.0 | Abliteración + SFT + DPO, foco en consistencia thinking-ON/OFF |
| Qwen/Qwen3.6-35B-A3B (base) | 35,1B | ~3B | no disponible | BF16 y cuantizaciones estándar | Apache 2.0 | Modelo original con guardarraíles; referencia para medir sobre-negativa |
| Otras builds abliterated públicas del campo | no disponible | no disponible | no disponible | no disponible | no disponible | La model card las menciona cualitativamente (unas sacrifican razonamiento, otras calidad no inglesa) sin identificar nombres ni cifras |

No se dispone de datos numéricos de modelos comparables en la información proporcionada; la comparativa es estructural y cualitativa.

## Limitaciones y advertencias

- Ausencia total de guardarraíles: el modelo puede cumplir solicitudes dañinas, incluido en modo thinking. No es apto para despliegue abierto al público ni para uso comercial sin controles adicionales.
- Uso previsto restringido a red-team, seguridad, alineamiento, evaluación y experimentación controlada; el autor declara explícitamente que no respalda usos que faciliten autolesión ni contenido de armas o casualties masivas.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo sin verificación factual, puede producir afirmaciones falsas con alta fluidez.
- Sesgos conocidos: no documentados. La eliminación de la capa de seguridad del SFT (Tulu-3 sin la parte de safety) puede amplificar sesgos presentes en los datos de capacidad.
- Idiomas: no se especifica la cobertura; la model card sugiere que otras builds del campo degradan calidad no inglesa, pero no aporta datos propios.
- Contexto: el valor de 32.768 tokens aparece como parámetro de serving, no como máximo certificado; puede haber degradación más allá de esa ventana.
- Dependencia de hardware: NVFP4 requiere soporte de Blackwell (sm120); en GPUs anteriores hay que re-cuantizar desde BF16, lo que cambia el perfil de memoria (~70 GB en BF16).
- Claims retiradas: el autor retiró su afirmación de liderazgo en compliance; cualquier comparación con otras builds abliterated debe hacerse con temperatura de despliegue, presupuesto de tokens suficiente, almacenamiento de respuestas completas y un juez fiable, puntuando la respuesta final y no el bloque `<think>`.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal y de política recae íntegramente en el desplegador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AIGAROU/gn3d2mx93bgmm3xn
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Perfil del autor citado en la model card: https://huggingface.co/kyaky
- Documentación de vLLM (runtime recomendado): https://docs.vllm.ai
- Repositorio de compressed-tensors (formato de pesos): https://github.com/neuralmagic/compressed-tensors
- OpenMathInstruct-2 (dataset de SFT): https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- OpenCodeReasoning (dataset de SFT): https://huggingface.co/datasets/nvidia/OpenCodeReasoning
- Tulu-3 (dataset de SFT): https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
