# rkcth/Radiance-Control-Vectors

## Resumen

Radiance Control Vectors es una colección de vectores de control en formato GGUF empaquetados para su uso con Radiance, un motor de inferencia open source. No se trata de un modelo de lenguaje en sí, sino de artefactos de representación (activation steering) que modifican el comportamiento de un modelo base en tiempo de inferencia sin necesidad de reentrenarlo. El autor es rkcth y el repositorio se publicó el 28 de noviembre de 2026.

La colección incluye actualmente dos vectores orientados al modelo Qwen3.8-27B (arquitectura `qwen35`, con 64 capas y dimensión oculta de 5120): un vector de estilo de prosa basado en Hemmingway-1.5, aplicado en modo aditivo, y un vector de ablación de rechazo (refusal ablation) en modo proyectivo. Cada vector se distribuye como un archivo `.gguf` con un sidecar `.json` que define el modo, el rango de capas y la escala recomendada.

Su relevancia radica en que demuestra un flujo de trabajo práctico de steering por vectores con soporte para apilamiento de dos vectores por petición (proyección y adición combinadas), una funcionalidad poco común en los motores de inferencia actuales. El tamaño total declarado en safetensors es de 322.560 parámetros, coherente con vectores de dirección por capa y no con un modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vectores de dirección por capa (activation steering) para modelos transformer; modelo base de referencia: Qwen3.8-27B (`arch: qwen35`, 64 capas × 5120) |
| Parametros totales | 322.560 (dato safetensors del repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base sobre el que se aplique) |
| Tipos de cuantizacion | GGUF (vectores empaquetados en `.gguf`); no se especifican niveles de cuantización |
| Idiomas soportados | No disponible |
| Licencia | Mixta por vector (`mixed-per-vector`): Hemmingway-1.5-style bajo CC-BY-NC-4.0; refusal-glp-49 bajo Apache-2.0 |
| Formato de pesos | GGUF (`.gguf`) con sidecar `.json` (`mode`, `layer_range`, `scale`) |

## Arquitectura y entrenamiento

Los artefactos son vectores de dirección extraídos del espacio de estados residuales de un modelo base. El vector `hemmingway-1.5-style` se obtuvo mediante el desplazamiento del stream residual tras un fine-tune sobre Hemmingway-1.5, y se aplica en modo aditivo (`mode: "add"`) sobre las capas 20 a 48 con una escala por defecto de 0.28. El vector `refusal-glp-49` es una ablación proyectiva de rechazo (`mode: "project"`) sobre las capas 10 a 58 con escala 1.0, reempaquetado con `model_hint=qwen35` para Radiance a partir de BlivionIaG/Qwen3.8-27B-refusal-cvec-GLP-49.

La innovación técnica principal no está en el entrenamiento sino en el formato de empaquetado y el motor de aplicación: Radiance soporta apilamiento de dos vectores por petición mediante `control_vector: ["slot1", "slot2"]`, aplicados de izquierda a derecha (primero proyección, después adición), con gestión de slots en caliente vía `/admin/control-vectors`. No se dispone de información sobre el número de tokens, la composición del dataset ni el uso de RLHF/DPO en la construcción de los vectores.

## Capacidades

- Modificación del estilo de prosa en modo aditivo (estilo directo y sobrio tipo Hemmingway-1.5) sobre el modelo base.
- Ablación proyectiva del comportamiento de rechazo, orientada a reducir negativas del modelo ante peticiones.
- Apilamiento de dos vectores por petición (proyección + adición) con orden de aplicación definido.
- Carga dinámica de vectores en slots con nombre mediante API administrativa.
- Auto-descubrimiento de sidecar `.json` junto al contenedor `.rad` del modelo.
- Configuración por vector de modo, rango de capas y escala.
- No proporciona capacidades generativas propias: hereda todas las del modelo base.
- No se documentan capacidades de tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Ajuste de estilo editorial en generación de contenido: aplicar el vector Hemmingway con escala 0.28 sobre Qwen3.8-27B para obtener prosa directa y sin adornos en pipelines de redacción, sin reentrenar el modelo.
- Reducción de rechazos en asistentes internos: usar la ablación proyectiva sobre las capas 10 a 58 para entornos controlados donde las negativas del modelo base interrumpen flujos legítimos de soporte técnico.
- Combinación de estilo y comportamiento: apilar `["refusal", "default"]` en una misma petición para obtener respuestas con estilo controlado y menor tasa de rechazo en un mismo turno.
- Experimentación en representación e ingeniería de activaciones: servir como referencia reproducible para investigar cómo afectan los vectores de dirección al comportamiento del modelo por capas.
- Despliegue con Radiance en producción: usar `control-vector-slots: 4` y la API `/admin/control-vectors` para cambiar vectores en caliente sin reiniciar el servicio.
- Evaluación comparativa de vectores: alternar entre modo `add` y `project` sobre el mismo modelo base para medir el impacto de cada técnica en calidad y seguridad.
- Prototipado rápido de variantes de personalidad: sustituir el vector de estilo por otros vectores compatibles con el mismo formato GGUF y sidecar JSON.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que cada subcarpeta incluye "evaluation numbers", pero no se proporcionan cifras concretas en los datos accesibles.

## Requisitos de hardware

- VRAM: los vectores en sí ocupan un espacio mínimo (repo de 0.0 GB, 322.560 parámetros); el requisito real lo determina el modelo base Qwen3.8-27B.
- GPU recomendadas: dependen del modelo base; para un modelo de 27B en cuantización IQ8 se requiere hardware de gama alta (A100, H100 o equivalentes con suficiente VRAM).
- GPU de consumo: viable solo con cuantizaciones agresivas del modelo base; no se especifican requisitos concretos para los vectores.
- Despliegue: motor Radiance (contenedores `.rad`, `fleet.yaml`, API `/v1/chat/completions` y `/admin/control-vectors`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Producto | Tipo | Modelo base | Modos | Apilamiento por petición | Licencia |
|---|---|---|---|---|---|
| Radiance Control Vectors (rkcth) | Colección de vectores GGUF | Qwen3.8-27B | `add` y `project` | Sí (2 vectores) | Mixta por vector |
| BlivionIaG/Qwen3.8-27B-refusal-cvec-GLP-49 | Vector de ablación de rechazo | Qwen3.8-27B | `project` | No documentado | Apache-2.0 |
| HemmingwayAI/Hemmingway-1.5 | Modelo fine-tuneado de estilo | No disponible | No aplica | No aplica | No disponible |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere un modelo base compatible (Qwen3.8-27B, `arch: qwen35`) y el motor Radiance.
- La ablación de rechazo puede eliminar salvaguardas del modelo base; su uso en producción exige revisión de seguridad y políticas de uso.
- Licencia mixta por vector: el vector de estilo es CC-BY-NC-4.0, lo que restringe el uso comercial; el vector de rechazo es Apache-2.0. Es obligatorio revisar cada subcarpeta antes de redistribuir.
- Riesgo de degradación de calidad si se ajusta la escala por encima de los valores recomendados (0.28 para estilo, 1.0 para proyección).
- Sin datos de evaluación publicados en la información disponible; no se puede verificar empíricamente el impacto en calidad, coherencia o seguridad.
- Sin información sobre idiomas soportados ni sobre sesgos inducidos por los vectores.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria inexistentes.
- El apilamiento de vectores aplica primero proyección y después adición; invertir el orden puede producir resultados distintos a los documentados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rkcth/Radiance-Control-Vectors
- Vector de estilo Hemmingway-1.5: https://huggingface.co/rkcth/Radiance-Control-Vectors/tree/main/qwen3.8-27b/hemmingway-1.5-style
- Vector de ablación de rechazo: https://huggingface.co/rkcth/Radiance-Control-Vectors/tree/main/qwen3.8-27b/refusal-glp-49
- Modelo de origen del vector de rechazo: https://huggingface.co/BlivionIaG/Qwen3.8-27B-refusal-cvec-GLP-49
- Modelo de origen del vector de estilo: https://huggingface.co/HemmingwayAI/Hemmingway-1.5
- Motor Radiance: https://codeberg.org/StillDeadcode/radiance
- PR de apilamiento de vectores (slots): https://codeberg.org/StillDeadcode/radiance/pulls/668
- PR de apilamiento de vectores (slots): https://codeberg.org/StillDeadcode/radiance/pulls/674
