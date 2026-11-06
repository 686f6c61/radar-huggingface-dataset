# aether-models/krea-2-turbo-aether-kit

## Resumen

Krea 2 Turbo Aether-Kit es una exportación no oficial del modelo de generación de imágenes text-to-image Krea 2 Turbo, publicada por el usuario aether-models. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión del checkpoint original `krea/Krea-2-Turbo` (revisión `98e0fe11`) a grafos fp16 en formato Core AI, realizada con el exportador Forge de Aether-Kit (`Forge/krea2/`). El paquete incluye el codificador de texto, cuatro segmentos del denoiser y el decodificador VAE, y se carga mediante `AetherImage` (`krea2@1`) en macOS.

El interés de esta ficha es doble: por un lado, documenta un formato de distribución alternativo (Core AI) para modelos de difusión en entornos Apple; por otro, recuerda las obligaciones legales que arrastra, ya que hereda la Krea 2 Community License, que limita el uso comercial a organizaciones con ingresos anuales inferiores a 1.000.000 USD y exige filtros de contenido en cualquier despliegue.

La información pública disponible es muy limitada: el repositorio tiene 0 descargas y 0 likes, no se detallan parámetros, arquitectura interna ni datos de entrenamiento, y no se han publicado benchmarks. Todo lo que sigue se basa en la model card del autor y en la documentación pública de Krea sobre el modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión text-to-image (detalles internos no disponibles); exportado como grafos Core AI con codificador de texto, cuatro segmentos de denoiser y decodificador VAE |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | fp16 (único formato documentado en esta exportación) |
| Idiomas soportados | no disponible |
| Licencia | Krea 2 Community License (license_name: krea-2-community-license) |
| Formato de pesos | Grafos Core AI (fp16); manifiesto `.aether/aether.json`; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Krea 2 Turbo, un generador de imágenes text-to-image de la familia Krea 2. La documentación pública de Krea lo describe como el modelo más rápido de la familia, orientado a iteración de bajo coste sobre ilustraciones expresivas, conceptos guiados por estilo y exploración visual rápida. No se dispone de información sobre el número de parámetros, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de alineación como RLHF o DPO.

La aportación específica de esta publicación es la conversión a Core AI: el pipeline original se descompone en un codificador de texto, cuatro segmentos del denoiser y un decodificador VAE, todos en fp16, y se empaqueta con el exportador Forge de Aether-Kit. El autor indica que el resultado se validó contra CPU Diffusers (véase `check-report.json` en el repositorio). No se documentan innovaciones de decodificación especulativa, atención lineal ni técnicas similares.

## Capacidades

- Generación de imágenes a partir de prompts de texto (pipeline text-to-image).
- Iteración rápida sobre ilustraciones y conceptos visuales, según la orientación del modelo base Turbo.
- Control de estilo mediante prompting, orientado a exploración visual.
- Carga en macOS a través de `AetherImage` (`krea2@1`) de Aether-Kit.
- Filtrado de contenido obligatorio: el pipeline de Krea en Aether-Kit no se puede construir sin un `ContentFilter` proporcionado por la aplicación.
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modos de razonamiento.

## Casos de uso

- Prototipado rápido de ilustraciones: el modelo Turbo está pensado para iterar con bajo coste sobre conceptos visuales; se usaría generando variantes sucesivas de un prompt hasta fijar dirección artística.
- Exploración de estilo en estudios de diseño: permite probar combinaciones de estilo y composición antes de invertir en renderizados de mayor calidad con otros modelos de la familia.
- Generación de material de referencia para equipos creativos: imágenes de concepto que alimentan briefs y moodboards.
- Integración en aplicaciones macOS nativas: al distribuirse como grafos Core AI con manifiesto `.aether.json`, encaja en apps Apple que carguen el runtime de Aether-Kit y aporten su propio `ContentFilter`.
- Evaluación de pipelines de inferencia alternativos: útil para comparar el rendimiento de Core AI frente a Diffusers en el mismo checkpoint base.
- Investigación sobre formatos de exportación de modelos de difusión: sirve como caso de estudio de conversión fp16 con verificación contra una implementación de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio únicamente referencia un `check-report.json` de validación contra CPU Diffusers, sin métricas de calidad (FID, CLIP score) ni de latencia.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 33,6 GB en fp16, lo que da una idea del orden de magnitud del almacenamiento, pero no se documenta el consumo en inferencia.
- GPU recomendadas: no disponible; la exportación está orientada a macOS con el runtime de Aether-Kit, no a CUDA.
- Compatibilidad con GPU de consumo: no documentada.
- Opciones de despliegue: Aether-Kit (`AetherImage`, `krea2@1`) en macOS; el modelo base Krea 2 Turbo puede ejecutarse en la plataforma de Krea y, presumiblemente, con Diffusers, aunque esta exportación concreta no lo documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea 2 Turbo Aether-Kit (esta ficha) | no disponible | no aplica | sin benchmarks publicados | Krea 2 Community License | Hugging Face, 0 descargas |
| Krea 2 Turbo (original) | no disponible | no aplica | sin datos en la información disponible | Krea 2 Community License | Hugging Face (`krea/Krea-2-Turbo`) y plataforma Krea |
| Otros modelos text-to-image de la familia Krea 2 | no disponible | no aplica | no disponible | Krea 2 Community License | plataforma Krea |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas de otros proveedores.

## Limitaciones y advertencias

- Exportación no oficial: no está respaldada por Krea y modifica el checkpoint original; el autor lo indica explícitamente en el `NOTICE`.
- Licencia restrictiva: uso comercial permitido solo si los ingresos de los últimos doce meses de la organización son inferiores a 1.000.000 USD; por encima se requiere licencia enterprise de Krea.
- Filtro de contenido obligatorio: cualquier despliegue debe implementar filtros conforme a la sección 4.2 de la licencia; el pipeline de Aether-Kit exige un `ContentFilter` aportado por la aplicación.
- Sin datos de sesgos, alucinación visual o limitaciones idiomáticas: la model card no los documenta.
- Idiomas de prompting no especificados.
- Ausencia de benchmarks y de adopción (0 descargas, 0 likes): no hay evidencia comunitaria de calidad o estabilidad.
- Dependencia de macOS y del runtime de Aether-Kit: no es portable a otros stacks sin reconversión.
- El tamaño del repositorio (33,6 GB) implica requisitos de almacenamiento considerables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aether-models/krea-2-turbo-aether-kit
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Licencia Krea 2: https://krea.ai/krea-2-licensing
- Página del modelo en Krea: https://www.krea.ai/models/krea-2-turbo
- Documentación de Krea 2 Turbo: https://www.krea.ai/docs/user-guide/features/krea-2-turbo
- Repositorio de Aether-Kit: https://github.com/bubstackdev/aether-kit
