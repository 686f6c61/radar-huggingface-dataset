# Pandoks/rs-abl-red-snow-nvfp4-oproj-kda4

## Resumen

RED-SNOW 5.3 Flash NVFP4 — o_proj loop-direction ablation (kda4) es una variante experimental del checkpoint Blackfrost-AI/RED-SNOW-5.3-FLASH-NVFP4, publicada por el usuario Pandoks. No se trata de un modelo entrenado desde cero ni de un ajuste fino convencional: es un build de diagnóstico en el que se ha aplicado una ablación direccional de rango 1 sobre los pesos de `self_attn.o_proj` en ocho capas concretas (28, 30, 32, 34, 36, 38, 40 y 41), manteniendo el resto de tensores byte a byte idénticos al checkpoint de partida. El objetivo declarado es corregir el comportamiento de repetición literal ("loops") que el modelo base manifiesta en contextos largos.

El modelo conserva la arquitectura del base, etiquetada como glm-5.3 / glm5_next, con 161.461.030.910 parámetros totales y pesos en formato NVFP4 (FP4 de NVIDIA) con tensores BF16 embebidos en los shards. El repositorio ocupa 204,5 GB y la licencia es MIT. La edición se escribe directamente en los bytes de los safetensors sin recuantización, de modo que escalas, cabeceras e índice NVFP4 permanecen intactos; solo difieren los shards 00012 a 00018.

Su relevancia es acotada pero específica: documenta una técnica de intervención quirúrgica sobre pesos cuantizados para mitigar un fallo concreto de generación (bucles de repetición verbatim en contexto largo) sin degradar el resto de capacidades. El propio autor lo marca explícitamente como build de diagnóstico y no como release de uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida: capas de atención lineal (KDA) y capas de atención completa (DSA); etiquetado glm-5.3 / glm5_next |
| Parametros totales | 161.461.030.910 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 de NVIDIA) con tensores BF16 embebidos; sin datos sobre otras cuantizaciones publicadas |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (shards NVFP4, 204,5 GB en total) |

## Arquitectura y entrenamiento

El modelo parte de Blackfrost-AI/RED-SNOW-5.3-FLASH-NVFP4 (revisión `8133f8ba249427a0dbe0ee197f8562d2ef109569`) y hereda su arquitectura, que la model card describe como una combinación de capas de atención lineal (KDA) y capas de atención completa (DSA). La intervención afecta únicamente a la proyección de salida de atención (`o_proj`) de ocho capas: 28, 30, 32, 34, 36, 38, 40 y 41. La variante se denomina "wide_a4 sin las cuatro capas DSA 31/35/39/43", porque en esas cuatro capas la dirección de bucle resultó ser la más débil e inestable en sesiones de validación reservadas; las ocho capas de atención lineal (KDA) se mantienen con alpha 4.

La edición aplica una ablación direccional de rango 1 por capa: `W' = W - alpha * u_L (u_L^T W)`, con alpha = 4,0 y `u_L` el vector unitario de "dirección de bucle" en el espacio de salida de atención de 4096 dimensiones de esa capa. Ese vector se estima como la diferencia de medias entre activaciones durante bucles de repetición verbatim y durante generación normal, calculada sobre sesiones de trabajo reservadas. Un detalle técnico relevante es que los tensores editados son BF16 dentro de los shards NVFP4, por lo que la modificación se escribe directamente en los bytes de los safetensors sin recuantizar: expertos NVFP4, escalas, cabeceras e índice quedan sin cambios. No se documentan en la información disponible datos sobre tokens de entrenamiento, composición del dataset ni etapas de RLHF o DPO del modelo base.

## Capacidades

- Generación de texto conversacional en pipeline `text-generation`.
- Razonamiento multi-turno con contexto largo, aunque el fallo de repetición verbatim en contexto extendido es precisamente el que motiva esta variante.
- Tool calling / function calling: la model card indica que los turnos de control (no afectados por bucles) mantienen intacto el tool-calling tras la edición.
- Terminación de turno fiable en contexto largo: la ablación convierte bucles verbatim en cierres de turno limpios en generación libre sobre la máquina del autor.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Diagnóstico de bucles de repetición en contexto largo: sirve como referencia para estudiar cómo una dirección latente concreta en la salida de atención de las capas tardías controla la decisión de parada del modelo, comparando su comportamiento con el checkpoint base sin editar.
- Investigación en interpretabilidad mecanicista: el par de modelos (base y ablacionado) permite aislar el efecto de un único vector de rango 1 por capa sobre la generación, con el resto de pesos idénticos byte a byte.
- Validación de pipelines de agentes con turnos largos: útil para comprobar si un agente que encadena muchas llamadas a herramientas deja de entrar en run-on no terminante, manteniendo el tool-calling en turnos de control.
- Pruebas de regresión de cuantización NVFP4: como los shards solo difieren en 00012–00018 y no hay recuantización, sirve para verificar que una edición en BF16 dentro de pesos FP4 no rompe escalas, cabeceras ni el índice.
- Evaluación comparativa de técnicas de ablación direccional: permite contrastar la variante "wide_a4" con y sin las capas DSA 31/35/39/43 para decidir qué conjunto de capas ofrece mayor estabilidad entre sesiones.
- Experimentación académica con licencia permisiva: la licencia MIT facilita reutilizar y redistribuir el build en entornos de investigación sin restricciones comerciales adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo describe una evaluación cualitativa en generación libre sobre la máquina del autor (conversión de bucles verbatim en cierres de turno limpios, sin degradación observable de tool-calling ni de longitud en turnos de control) y remite a notas de investigación no incluidas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 161.461.030.910 parámetros en NVFP4, el peso ocupa del orden de 80–90 GB antes de overhead; el repositorio completo son 204,5 GB, por lo que se necesita un nodo multi-GPU para cargar el checkpoint tal cual.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, el despliegue realista exige GPUs de centro de datos con soporte NVFP4 (familia Blackwell de NVIDIA) o sharding multi-GPU.
- ¿Cabe en GPU consumer? No con los pesos NVFP4 originales; haría falta una cuantización adicional (por ejemplo GGUF de menor precisión) que no se documenta en esta ficha.
- Opciones de despliegue: no disponibles en la información proporcionada; el formato NVFP4 condiciona fuertemente los runtimes compatibles.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Pandoks/rs-abl-red-snow-nvfp4-oproj-kda4 | 161.461.030.910 | no disponible | NVFP4 | MIT | Build de diagnóstico con ablación en 8 capas `o_proj` |
| Blackfrost-AI/RED-SNOW-5.3-FLASH-NVFP4 | no disponible | no disponible | NVFP4 | no disponible | Checkpoint base sin editar; mismo tamaño de repo |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Build de diagnóstico: el autor lo declara explícitamente como no apto para uso general; no debe tratarse como un release de producción.
- La ablación es una intervención heurística sobre pesos: el vector de bucle se estima empíricamente en sesiones reservadas y puede no generalizar a otros dominios, idiomas o distribuciones de prompt.
- Solo se editan ocho capas; los bucles originados en otras capas o por otras causas no quedan cubiertos.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; al derivar del base sin reentrenamiento, hereda los del checkpoint original.
- Idiomas soportados no disponibles: no puede garantizarse el comportamiento multilingüe.
- Licencia MIT: permite uso comercial, pero el usuario asume la responsabilidad de validar el comportamiento del modelo editado en su dominio.
- Compatibilidad de despliegue restringida por el formato NVFP4 y por el tamaño del checkpoint (204,5 GB).
- Solo difieren los shards 00012–00018 del base; cualquier verificación de integridad debe tenerlo en cuenta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pandoks/rs-abl-red-snow-nvfp4-oproj-kda4
- Modelo base: https://huggingface.co/Blackfrost-AI/RED-SNOW-5.3-FLASH-NVFP4
- Revisión del base citada: `8133f8ba249427a0dbe0ee197f8562d2ef109569`
- Notas de investigación del autor: no disponibles en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
