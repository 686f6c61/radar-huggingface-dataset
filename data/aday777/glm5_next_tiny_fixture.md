# aday777/glm5_next_tiny_fixture

## Resumen

El repositorio `aday777/glm5_next_tiny_fixture` no contiene un modelo de lenguaje funcional, sino un **fixture de prueba** (checkpoint de pesos aleatorios) diseñado para ejercitar la carga y el parseo de la arquitectura `glm5_next` del modelo base `zai-org/GLM-5.3-Flash`. Con solo 274.496 parámetros en float32, reproduce la estructura de configuración y los nombres de tensores del MoE multimodal de GLM-5.3-Flash, pero sin ningún entrenamiento ni capacidad de generación real.

El objetivo declarado por su autor es permitir a desarrolladores y pipelines de CI validar el parseo de configuraciones, el mapeo de nombres de pesos, el dimensionado de tablas de expertos y la carga de safetensors en milisegundos, sin necesidad de instanciar el modelo completo (que sería inviable en un entorno de pruebas). Es una herramienta de desarrollo, no un modelo para inferencia.

Su relevancia radica en que la arquitectura `glm5_next` es nueva (el base se publicó en agosto de 2026) y aún no está completamente integrada en todas las versiones de transformers. Este fixture permite aislar problemas de integración antes de trabajar con los pesos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Glm5NextForConditionalGeneration` (glm5_next), basada en `zai-org/GLM-5.3-Flash` |
| Parametros totales | 274.496 (float32, 1.097.984 bytes) |
| Parametros activos | no disponible (el fixture no es MoE real; la config define 8 expertos enrutados y 1 compartido, pero los pesos son aleatorios) |
| Longitud de contexto | no disponible (no se especifica en la config del fixture) |
| Tipos de cuantizacion | no disponible (solo float32) |
| Idiomas soportados | no disponibles (no hay tokenizador real) |
| Licencia | MIT para el contenido generado (fixture); la arquitectura base pertenece a Zhipu AI / Z.ai bajo sus propios terminos, no verificados en este repositorio |
| Formato de pesos | safetensors (113 tensores, contiguos, con checksums SHA-256) |

## Arquitectura y entrenamiento

El fixture replica la estructura de configuración de `glm5_next` con un subconjunto reducido: 4 capas ocultas, `hidden_size` de 64, 4 cabezas de atención (con 4 cabezas clave/valor), `head_dim` de 16, 8 expertos enrutados con 2 expertos por token, 1 experto compartido, 1 grupo, `first_k_dense_replace` de 1 (las primeras capas son densas y luego se convierten en MoE), `moe_intermediate_size` de 32 e `intermediate_size` denso de 128. El vocabulario se limita a 256 tokens y el dtype es float32.

La generación de pesos es determinista: usa una semilla SplitMix64 (20260902), normales Box-Muller con escala 0.02 y orden de nombres ordenados. No hay entrenamiento, ni RLHF, ni DPO, ni ningún ajuste. El script `build_fixture.py` incluido permite regenerar el repositorio y comparar los resultados byte a byte.

La configuración conserva los campos de nivel superior del modelo real (`model_type`, `architectures`, `image_token_id`, `language_model_only`, `text_config`, `vision_config`), pero `vision_config` es un marcador de posición y no hay tensores de visión ni de proyector. Tampoco hay capa `lm_head` (se debe atar a `model.embed_tokens.weight` o suministrar una propia) ni cabezas MTP (`num_nextn_predict_layers: 0`).

## Capacidades

- **Ninguna capacidad de generación de texto, razonamiento, código o visión.** Los pesos son aleatorios y no han sido entrenados.
- **Carga de safetensors**: permite probar la lectura de tensores con la librería estándar de Python o con `safetensors.torch`.
- **Parseo de configuración `glm5_next`**: valida que `AutoConfig.from_pretrained` (con `trust_remote_code=True` si es necesario) acepte la estructura reducida.
- **Mapeo de nombres de pesos**: útil para verificar que un cargador completo de `Glm5NextForConditionalGeneration` encuentra todos los tensores esperados (aunque los nombres son una convención reducida y no garantizan compatibilidad total).
- **Dimensionado de tablas de expertos**: permite comprobar el cálculo de `n_routed_experts`, `num_experts_per_tok`, `n_shared_experts` y la lógica de enrutamiento en código de prueba.
- **Verificación de integridad**: los checksums SHA-256 en `checksums.txt` permiten validar la reproducibilidad del fixture.
- **Sin soporte de tool calling, agentes, multilingüismo ni multimodalidad real.**

## Casos de uso

- **Pruebas de integración en CI**: un pipeline puede cargar este fixture en segundos para verificar que una nueva versión de transformers sigue parseando correctamente la configuración `glm5_next` sin descargar los pesos de 745B del modelo base.
- **Desarrollo de cargadores personalizados**: si un equipo implementa su propio loader para `Glm5NextForConditionalGeneration`, puede usar este fixture para depurar el mapeo de nombres de tensores y el manejo de `data_offsets` en safetensors.
- **Pruebas de planificadores de cuantización**: herramientas como GPTQ o AWQ pueden ejecutar su lógica de análisis de capas sobre este checkpoint pequeño para validar que detectan correctamente las capas MoE y densas, sin consumir recursos.
- **Validación de generación de configuraciones**: al modificar la config (por ejemplo, cambiar `n_routed_experts`), se puede comprobar rápidamente que el código de inicialización de expertos no falla.
- **Entrenamiento de integración continua**: equipos que trabajan en el kernel de atención o en el enrutamiento MoE pueden usar este fixture como entrada mínima para pruebas unitarias de forward/backward (aunque no hay garantía de que el forward funcione sin ajustes).
- **Documentación y formación**: sirve como ejemplo didáctico de la estructura de un checkpoint MoE multimodal, mostrando cómo se organizan los tensores y la config en un caso reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio autor declara explícitamente que el fixture "no es una afirmación de calidad ni de rendimiento" y que no está entrenado.

## Requisitos de hardware

- **VRAM**: despreciable. El checkpoint ocupa ~1,1 MB en disco y en memoria (274.496 parámetros float32). Cualquier máquina con Python puede cargarlo.
- **GPU**: no se necesita GPU. La carga y el parseo pueden hacerse con CPU y memoria RAM convencional.
- **Compatibilidad con consumer GPU**: sí, en cualquier equipo, incluso sin GPU.
- **Opciones de despliegue**: no aplicable para inferencia. Para pruebas de carga, se puede usar `safetensors.torch.load_file` o la lectura manual con `struct` y `json`.
- **Latencia y throughput**: no aplicable, no es un modelo de generación.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo comparable con otros LLMs; es un artefacto de prueba específico para la arquitectura `glm5_next`. No existen fixtures equivalentes públicos documentados en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo utilizable**: los pesos son aleatorios y no producen texto coherente. Intentar usarlo para generación dará resultados sin sentido.
- **Cobertura incompleta de la arquitectura**: no incluye tensores de visión, ni proyector, ni `lm_head`, ni cabezas MTP. Un cargador completo de `Glm5NextForConditionalGeneration` puede fallar si espera esos tensores.
- **Nombres de tensores reducidos**: la convención de nombres no está garantizada para coincidir con todos los tensores que espera el modelo real.
- **Tokenizador ausente**: los archivos de tokenizador son marcadores de posición; no hay archivo de vocabulario real.
- **Licencia del base no verificada**: el autor indica que los términos de la arquitectura base no fueron re-verificados de forma independiente; hay que consultar el repositorio `zai-org/GLM-5.3-Flash` antes de redistribuir.
- **Riesgo de confusión**: al ser un fixture con nombre similar al modelo real, puede inducir a error si se usa en producción. Su único propósito es testing.
- **Sin soporte de cuantización**: no hay versiones GGUF, AWQ ni GPTQ de este fixture.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aday777/glm5_next_tiny_fixture
- Código de transformers para `glm5_next`: https://github.com/huggingface/transformers/tree/main/src/transformers/models/glm5_next
- Archivo de modelado `modeling_glm5_next.py`: https://github.com/huggingface/transformers/blob/main/src/transformers/models/glm5_next/modeling_glm5_next.py
- Paper de GLM-5 en arXiv: https://arxiv.org/html/2602.15763v1
- Blog oficial de GLM-5 en Z.ai: https://z.ai/blog/glm-5
- Sitio promocional de GLM-5: https://glm5.app/
