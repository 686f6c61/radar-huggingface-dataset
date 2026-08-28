# snombi/store1

## Resumen

Kimi K3 es un modelo multimodal agéntico de código abierto desarrollado por Moonshot AI, con 2,8 billones de parámetros (2,8T) y arquitectura Mixture-of-Experts (MoE) que activa 16 de 896 expertos por token, lo que supone unos 104 mil millones de parámetros activos. Incorpora una ventana de contexto de 1 millón de tokens y capacidades nativas de visión (imagen y vídeo) dentro de un mismo modelo, lo que lo convierte en una de las propuestas más ambiciosas en el ámbito de los modelos abiertos de gran escala. Este repositorio concreto, `snombi/store1`, está alojado por el usuario "snombi" en Hugging Face y no corresponde a la versión oficial de Moonshot AI, aunque la model card reproduce la documentación oficial de Kimi K3. El modelo está orientado a tareas de codificación de largo alcance, trabajo de conocimiento agéntico y razonamiento multimodal, con un modo de pensamiento siempre activo que devuelve `reasoning_content` en sus respuestas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2,8 billones (2,8T) |
| Parametros activos | 104 mil millones (104B) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | no disponible (el repositorio incluye la etiqueta `compressed-tensors`, pero no se especifican formatos concretos) |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 (licencia propia, `license: other`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kimi K3 emplea una arquitectura MoE con 93 capas, de las cuales 1 es densa y el resto combina 69 capas con Kimi Delta Attention (KDA) y 24 capas con Gated Multi-Latent Attention (Gated MLA). La dimensión oculta de atención es 7168, con 96 cabezas de atención, y la dimensión del MoE latente es 3584. Cada experto tiene una dimensión oculta de 3072, y el modelo selecciona 16 de los 896 expertos disponibles por token. Esta configuración se enmarca en el denominado Stable LatentMoE, que busca mejorar la eficiencia de escalado en comparación con la generación anterior, Kimi K2, con una mejora aproximada de 2,5 veces. El modelo fue entrenado en modo de "historial de pensamiento preservado", lo que significa que el razonamiento interno se mantiene durante las conversaciones y llamadas a herramientas. No se han proporcionado datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información disponible.

## Capacidades

- Multimodal nativo: procesa texto, imágenes y vídeo dentro del mismo modelo, sin módulos separados.
- Modo de pensamiento siempre activo: devuelve `reasoning_content` y admite configuración de esfuerzo de razonamiento (`low`, `high`, `max`).
- Codificación de largo alcance: capaz de mantener sesiones de ingeniería prolongadas, navegar repositorios de gran tamaño y orquestar herramientas de terminal.
- Trabajo de conocimiento agéntico: puede producir investigaciones profundas con visualizaciones interactivas, widgets, paneles y edición de vídeo.
- Soporte de tool calling y uso de agentes: requiere el mensaje completo del asistente devuelto en conversaciones multi-turno y llamadas a herramientas.
- Contexto largo de 1 millón de tokens, adecuado para documentos extensos y repositorios de código grandes.

## Casos de uso

- Desarrollo de software autónomo: el modelo puede operar durante largas sesiones de codificación, desde la optimización de kernels GPU hasta el desarrollo de compiladores, con supervisión humana mínima.
- Análisis de repositorios masivos: gracias a su contexto de 1M tokens, puede navegar y comprender bases de código completas para tareas de refactorización o revisión.
- Investigación automatizada: genera informes de investigación con visualizaciones interactivas, integrando búsqueda de información y síntesis de documentos.
- Asistencia en diseño asistido por ordenador (CAD): su capacidad multimodal permite interpretar imágenes y vídeos para tareas de diseño y modelado.
- Edición de vídeo y motion design: procesa entradas de vídeo directamente para tareas de edición y generación de contenido visual.
- Agentes de atención al cliente con contexto largo: puede mantener conversaciones multi-turno con historial extenso, utilizando tool calling para consultar bases de datos o APIs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Aunque el repositorio incluye la etiqueta `eval-results`, no se proporcionan datos numéricos concretos (como MMLU, HumanEval o GSM8K) en la model card ni en las búsquedas web realizadas.

## Requisitos de hardware

- No se especifican requisitos oficiales de VRAM, RAM ni disco en la información proporcionada.
- Dado el tamaño total de 2,8T parámetros y 104B activos, se requiere infraestructura de múltiples GPUs de alta gama (por ejemplo, clústeres con A100 o H100) para inferencia en precisión completa. No se puede ejecutar en GPUs de consumo estándar.
- El tamaño del repositorio es de 965 GB, lo que indica que la descarga y el almacenamiento requieren espacio considerable.
- No se mencionan opciones de despliegue específicas (vLLM, TGI, llama.cpp, etc.) en la documentación disponible. Dado que el formato es safetensors y la librería es transformers, es probable que sea compatible con frameworks como vLLM, pero no está confirmado.
- La latencia y el throughput estimados no están disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. El modelo es comparable en escala a otros MoE de gran tamaño como DeepSeek-V3 (671B totales, 37B activos) o Qwen3-Max, pero no se han publicado resultados de benchmarks que permitan una comparación cuantitativa. Se recomienda consultar la documentación oficial de Moonshot AI para obtener datos de rendimiento.

## Limitaciones y advertencias

- Este repositorio no es la versión oficial de Moonshot AI; está alojado por el usuario "snombi". No se garantiza la autenticidad ni la integridad de los pesos, por lo que se recomienda verificar la procedencia antes de su uso en producción.
- La licencia Kimi K3 es una licencia propia; es necesario revisar sus términos para uso comercial y despliegue.
- No se especifican los idiomas soportados, aunque es probable que tenga cobertura multilingüe, pero no está confirmado.
- El modo de pensamiento siempre activo puede generar respuestas más largas y aumentar la latencia.
- Riesgo de alucinación inherente a los modelos de gran escala, especialmente en tareas de razonamiento complejo.
- No hay información sobre sesgos o mitigaciones de sesgo en el modelo.
- El tamaño del modelo (2,8T parámetros) hace que su despliegue sea inviable para la mayoría de organizaciones sin infraestructura de alto rendimiento.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/snombi/store1
- Página de benchmarks en OpenModelMap: https://openmodelmap.com/model/snombi/store1
- Referencias de la model card (pertenecientes a Kimi K3 oficial):
  - Chat: https://www.kimi.com
  - Homepage de Moonshot AI: https://www.moonshot.ai
  - Blog técnico: https://www.kimi.com/blog/kimi-k3
  - Informe técnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
