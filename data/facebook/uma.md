# facebook/UMA

## Resumen

UMA es un modelo publicado por Meta (organización `facebook` en Hugging Face) bajo el identificador `facebook/UMA`. El repositorio tiene un tamaño de 46,4 GB, lo que sugiere pesos de un modelo de escala media-grande, aunque la información disponible no detalla el número exacto de parámetros ni la arquitectura interna. El modelo se distribuye bajo una licencia de tipo `other` y con acceso restringido (gated), lo que obliga a aceptar condiciones adicionales en Hugging Face antes de poder descargarlo.

La ficha se apoya en los metadatos públicos del repositorio y en las referencias a los artículos arXiv asociados (2603.02089 y 2506.23971), pero no se ha podido confirmar a partir de la información disponible ni la arquitectura, ni el contexto, ni los idiomas soportados, ni los resultados de benchmarks. Cualquier dato de ese tipo que no aparezca aquí debe considerarse no disponible y requerirá consultar directamente la model card oficial y los papers citados.

A pesar de la escasez de datos verificables, el modelo resulta relevante por su origen (Meta), por el volumen del repositorio y por el interés que ha despertado (683 likes y 251 descargas en el momento de la consulta). Es un candidato a evaluar para quienes sigan la línea de investigación reflejada en los papers asociados, pero conviene tratarlo con cautela hasta confirmar sus especificaciones en la documentación oficial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (acceso restringido, gated) |
| Formato de pesos | no disponible (repositorio de 46,4 GB) |

## Arquitectura y entrenamiento

No se ha publicado en la información disponible ningún detalle sobre la arquitectura del modelo (transformer denso, MoE, híbrido u otra), ni sobre el volumen o composición de los datos de entrenamiento, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. El repositorio incluye referencias a dos artículos arXiv (2603.02089 y 2506.23971), que son la fuente indicada para consultar los detalles técnicos, pero su contenido no se ha podido verificar en esta ficha.

Tampoco se dispone de información sobre innovaciones técnicas concretas (decodificación especulativa, atención lineal, modos de razonamiento, etc.). El tamaño del repositorio (46,4 GB) es el único indicio cuantitativo disponible y sugiere pesos en precisión alta para un modelo de varios miles de millones de parámetros, pero se trata de una inferencia indirecta y no de un dato confirmado.

## Capacidades

- Generación de texto: no confirmada explícitamente en la información disponible.
- Razonamiento, código y matemáticas: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (los idiomas no están listados en los metadatos).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

No es posible detallar casos de uso concretos y realistas sin conocer las capacidades efectivas del modelo, que no están documentadas en la información disponible. A modo de orientación general, un modelo de esta escala y origen podría evaluarse en los siguientes escenarios, siempre tras verificar sus especificaciones en la model card oficial:

- Investigación y reproducción de resultados: usar el modelo para replicar los experimentos de los papers arXiv asociados (2603.02089 y 2506.23971) y contrastar sus conclusiones.
- Evaluación comparativa interna: incluirlo como referencia en bancos de pruebas propios frente a otros modelos de Meta o de la competencia, una vez confirmados tamaño y contexto.
- Experimentación en generación de texto: probar su calidad en tareas de redacción y resumen, condicionado a que la model card confirme esa capacidad.
- Fine-tuning supervisado: adaptar los pesos a un dominio concreto si la licencia `other` lo permite tras revisar sus términos.
- Despliegue en entornos controlados: al ser un modelo gated, encaja en organizaciones que ya gestionan aceptación de condiciones y trazabilidad de licencias.
- Estudio de licencias y gobernanza: analizar las condiciones de la licencia `other` como caso práctico de modelos de acceso restringido en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del número de parámetros y de la cuantización, datos no confirmados.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; el repositorio de 46,4 GB sugiere que los pesos en precisión alta no caben en GPUs de consumo típicas (24 GB), pero no se puede confirmar sin conocer el tamaño real del modelo.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no permite identificar modelos comparables de la misma categoría ni sus especificaciones, por lo que no se puede establecer una comparativa fiable de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga; esto puede retrasar pipelines automatizados.
- Licencia `other`: los términos no están detallados en la información disponible; es imprescindible revisar el texto completo de la licencia antes de cualquier uso comercial.
- Idiomas no declarados: no se puede garantizar el soporte multilingüe ni la calidad en castellano.
- Arquitectura y contexto desconocidos: impide planificar el despliegue, estimar costes de inferencia o dimensionar la ventana de contexto.
- Riesgo de alucinación y sesgos: no evaluable sin benchmarks ni model card; debe asumirse el riesgo habitual de los modelos generativos hasta que se publiquen evaluaciones.
- Ausencia de datos de benchmarks: no hay evidencia pública en la información consultada que respalde afirmaciones de rendimiento.
- Fecha de actualización del repositorio (noviembre de 2026): conviene verificar que la versión consultada coincide con la documentación vigente.

## Enlaces

- Hugging Face: https://huggingface.co/facebook/UMA
- Paper arXiv 2603.02089: https://arxiv.org/abs/2603.02089
- Paper arXiv 2506.23971: https://arxiv.org/abs/2506.23971
