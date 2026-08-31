# orcarouter/GLM-5.3-Flash-Uncensored-GGUF

## Resumen

El modelo **GLM-5.3-Flash-Uncensored-GGUF** es una versión modificada del modelo **GLM-5.3-Flash** de Zhipu AI (Z.ai), publicada por el usuario **orcarouter** en HuggingFace. Se trata de un modelo de lenguaje de gran tamaño (LLM) con arquitectura **MoE (Mixture of Experts)** de 320 mil millones de parámetros totales y 18 mil millones activos por token, especializado en tareas de texto e imagen (image-text-to-text). La modificación principal consiste en la **abliteración** (abliteration) de los pesos del modelo original, un proceso que elimina la dirección de rechazo (refusal direction) aprendida durante el alineamiento, de modo que el modelo responde sin filtros de seguridad ni censura, sin necesidad de jailbreaks ni adaptadores LoRA.

El modelo se distribuye en formato **GGUF** para su uso con `llama.cpp` y herramientas compatibles, e incluye un proyector multimodal (`mmproj`) para entrada de imágenes. Es relevante para la comunidad de **red teaming** y evaluación de seguridad de IA, así como para desarrolladores que necesitan un modelo sin restricciones de contenido para pruebas controladas. Su licencia es **MIT**, lo que permite uso comercial, aunque el acceso en HuggingFace está restringido (gated) y requiere aceptar condiciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con visión multimodal |
| Parametros totales | 320.759.404.382 (320B) |
| Parametros activos | 18B (por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (varias, incluyendo block-FP8 nativo; se publican también versiones NVFP4) |
| Idiomas soportados | en, zh (inglés y chino) |
| Licencia | MIT |
| Formato de pesos | GGUF (con proyector multimodal mmproj) |

## Arquitectura y entrenamiento

El modelo base **GLM-5.3-Flash** es un transformer MoE desarrollado por Zhipu AI, con 320B parámetros totales y 18B activos por token. Incorpora capacidades de visión (image-text-to-text) mediante un proyector multimodal, y soporta razonamiento, function calling y conversación multi-turno. El entrenamiento original del modelo base no se detalla en la información disponible, pero se sabe que incluye fases de preentrenamiento y alineamiento con técnicas como RLHF o similares.

La versión **Uncensored** de OrcaRouter se obtiene mediante **abliteración**: se identifica la dirección de rechazo en el espacio de activaciones del modelo y se elimina o neutraliza en los pesos, directamente en precisión **block-FP8** nativa. Según los autores, parte del alineamiento de GLM-5.3-Flash no se reduce a una única dirección lineal de rechazo, lo que sugiere un mecanismo de seguridad más profundo que el habitual. El resultado es un modelo que responde a peticiones que el original rechazaría, sin necesidad de prompts de jailbreak ni adaptadores externos. El repositorio GGUF incluye el proyector multimodal y está preparado para `llama.cpp`.

## Capacidades

- **Generación de texto**: producción de texto coherente y contextual en inglés y chino.
- **Razonamiento**: capacidad de razonamiento multi-paso y resolución de problemas complejos.
- **Visión multimodal**: procesamiento de imágenes junto con texto (image-text-to-text) mediante el proyector `mmproj`.
- **Function calling**: soporte para invocación de herramientas y APIs externas.
- **Conversación multi-turno**: manejo de diálogos largos con contexto.
- **Sin censura**: responde a peticiones que el modelo original rechazaría, incluyendo contenido sensible, gracias a la abliteración.
- **Compatibilidad con llama.cpp**: formato GGUF, ejecutable en CPU y GPU con herramientas del ecosistema.

## Casos de uso

- **Red teaming y auditoría de seguridad**: el modelo permite probar sistemas de moderación y detectar vulnerabilidades en pipelines de IA generativa, al generar respuestas sin filtros que los modelos alineados no producirían.
- **Investigación en alineamiento**: estudiar cómo la abliteración afecta al comportamiento del modelo y comparar con versiones originales para entender los mecanismos de rechazo.
- **Generación de contenido creativo sin restricciones**: escritura de ficción, guiones o material con temáticas adultas o controvertidas, donde un modelo censurado limitaría la creatividad.
- **Análisis de sesgos y toxicidad**: evaluar la propensión del modelo a generar contenido dañino o sesgado, útil para desarrollar mejores técnicas de mitigación.
- **Desarrollo de asistentes especializados**: crear chatbots para dominios donde se requiere respuestas directas sin evasivas (por ejemplo, educación sexual, asesoría legal informal), siempre bajo supervisión humana.
- **Pruebas de robustez de modelos**: verificar si los sistemas de seguridad de otros modelos pueden ser evadidos usando las salidas de este modelo como entrada de entrenamiento o como generador de ataques.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base GLM-5.3-Flash tiene métricas propias de Zhipu AI, pero no se incluyen en los materiales consultados. Se recomienda consultar la documentación oficial de Z.ai para datos de rendimiento del modelo original.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo MoE de 320B parámetros totales, la memoria necesaria depende de la cuantización. Con cuantización Q4_K_M, se requieren aproximadamente 180-200 GB de VRAM para cargar todos los pesos. Con Q8, alrededor de 320 GB. La versión block-FP8 nativa requiere unos 320 GB.
- **GPU recomendadas**: no es viable en una sola GPU de consumo. Se necesitan múltiples GPUs de datacenter: 4× A100 80GB, 4× H100 80GB, o 8× RTX 4090 24GB (con NVLink o comunicación PCIe). También es posible ejecutarlo en CPU con 256-512 GB de RAM, aunque con latencia alta.
- **GPU de consumo**: no cabe en una sola GPU consumer (máximo 24 GB en RTX 4090). Se podría intentar con múltiples GPUs consumer en paralelo, pero la comunicación entre ellas será un cuello de botella.
- **Opciones de despliegue**: `llama.cpp` (soporte GGUF), `Ollama` (si se importa el GGUF), `vLLM` (con conversión a safetensors), `TGI` (Text Generation Inference). El repositorio indica compatibilidad con endpoints.
- **Latencia y throughput**: no hay datos publicados. Para un MoE de 18B activos, la latencia por token en GPUs de datacenter suele estar en el rango de 20-50 ms, pero depende de la cuantización y el hardware. La API de OrcaRouter reporta p50 de 1500 ms para generación completa, pero no es directamente extrapolable a despliegue local.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. A nivel estructural, se puede comparar con otros MoE de gran tamaño:

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| GLM-5.3-Flash (base) | 320B | 18B | no disponible | MIT | safetensors |
| GLM-5.3-Flash-Uncensored (este) | 320B | 18B | no disponible | MIT | GGUF |
| DeepSeek-V3 | 671B | 37B | 128K | MIT | safetensors |
| Mixtral 8x7B | 46.7B | 12.9B | 32K | Apache 2.0 | safetensors/GGUF |

La comparación directa de rendimiento no es posible sin datos de benchmarks. La principal diferencia frente al modelo base es la eliminación de la censura, lo que lo hace inadecuado para aplicaciones que requieran seguridad, pero útil para investigación.

## Limitaciones y advertencias

- **Contenido dañino**: al ser uncensored, el modelo puede generar contenido violento, sexual explícito, ilegal o éticamente cuestionable. No debe usarse en producción sin supervisión humana y filtros adicionales.
- **Sesgos**: el modelo base puede tener sesgos de género, raza o cultura, y la abliteración no los elimina; incluso puede amplificarlos al no tener restricciones.
- **Alucinaciones**: como todo LLM, puede inventar hechos, citas o datos. La ausencia de alineamiento no mejora la veracidad.
- **Idiomas**: solo soporta inglés y chino; no se garantiza calidad en otros idiomas.
- **Contexto**: la longitud de contexto no está documentada; se recomienda probar antes de usarlo con ventanas largas.
- **Acceso restringido**: el repositorio en HuggingFace es gated; hay que aceptar condiciones adicionales, lo que puede limitar su uso en entornos corporativos.
- **Riesgo legal**: aunque la licencia es MIT, el uso de un modelo sin censura puede violar políticas de plataformas o leyes locales sobre contenido generado. El responsable es el usuario.
- **Estabilidad**: al ser una modificación no oficial, no hay garantías de mantenimiento ni soporte técnico.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-GGUF)
- [Artículo de ExplainX sobre la abliteración](https://www.explainx.ai/blog/orcarouter-glm-5-3-flash-uncensored-block-fp8-august-2026)
- [Versión NVFP4 de ericlewis en HuggingFace](https://huggingface.co/ericlewis/GLM-5.3-Flash-OrcaRouter-Uncensored-NVFP4)
- [Publicación de OrcaRouter en X (Twitter)](https://x.com/OrcaRouter/status/2093612518396871075)
- [Publicación de OrcaRouter en LinkedIn](https://www.linkedin.com/posts/orcarouter_glm-53-flash-uncensored-native-fp8-activity-7499733012641742848-kb30)
- [Página de API de GLM-5.3-Flash en OrcaRouter](https://www.orcarouter.ai/models/z-ai/glm-5.3-flash)
