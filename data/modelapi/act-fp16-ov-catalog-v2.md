# modelapi/act-fp16-ov-catalog-v2

## Resumen

`modelapi/act-fp16-ov-catalog-v2` es una política de imitación (imitation-learning policy) de referencia publicada por el autor `modelapi` dentro del catálogo de modelos de Intel, bajo la librería `physicalai-train` y el chipset objetivo `ptl` (Panther Lake). El modelo implementa la arquitectura ACT (Action Chunking Transformer), cuya implementación original referencia el propio autor en el repositorio `tonyzhaozh/act`. Su función es mapear imágenes procedentes de una o varias cámaras junto con el estado del robot a un *chunk* de acciones que el robot puede ejecutar como una secuencia de movimientos en el mundo real.

Se trata de un modelo pensado para las tareas de imitación más sencillas, distribuido con pesos aleatorios y destinado exclusivamente a pruebas de integración y validación de la cadena de inferencia, no a uso productivo. El formato de pesos es FP16 optimizado para OpenVINO (de ahí el sufijo `-fp16-ov`), y la inferencia se realiza a través del framework OpenVINO Physical AI, con soporte de ejecución en CPU además de aceleradores Intel.

Su relevancia actual es acotada pero útil: sirve como *baseline* verificable para validar el *pipeline* de entrenamiento, conversión e inferencia de políticas robóticas (VLA/action policies) antes de sustituir los pesos por un modelo ajustado con datos propios mediante Physical AI Studio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), según la implementación original referenciada por el autor |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones imagen + estado) |
| Tipos de cuantización | FP16 (pesos optimizados para OpenVINO; otras cuantizaciones no disponibles) |
| Idiomas soportados | no disponible (modelo de política robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO (IR) en FP16, según el sufijo `-fp16-ov`; otros formatos no disponibles |
| Librería | `physicalai-train` |
| Chipset objetivo | `ptl` (Panther Lake, Intel) |
| Categoría | `physical-ai/action-policies-vla` |
| Entradas | Imágenes de una o varias cámaras + estado del robot |
| Salida | Chunk de acciones ejecutables por el robot |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el enfoque ACT (Action Chunking Transformer), una política de imitación que predice bloques de acciones en lugar de comandos individuales, lo que reduce el error de acumulación en tareas de manipulación. La implementación de referencia es la del repositorio `tonyzhaozh/act`, y la variante aquí publicada se distribuye como artefacto OpenVINO en FP16 para el catálogo físico de Intel. El modelo consume observaciones multimodales —imágenes de cámara y vector de estado del robot— y produce un *chunk* de acciones. En el ejemplo de uso documentado para el entorno LIBERO se emplean dos cámaras (`agentview` y `wrist`) y un vector de estado de 8 dimensiones, con imágenes en convención LeRobot (`float32` en `[0,1]`, forma `(C, H, W)`).

No se dispone de información sobre el número de tokens, la composición del dataset, ni sobre el uso de RLHF, DPO u otras etapas de alineación. La model card indica explícitamente que los pesos son aleatorios y se proporcionan solo con fines de prueba, por lo que no ha habido un entrenamiento efectivo documentado para esta publicación concreta. El ajuste fino con datos propios se plantea mediante Physical AI Studio, y el flujo de conversión/inferencia emplea el framework OpenVINO Physical AI.

## Capacidades

- Generación de *chunks* de acciones a partir de observaciones visuales y de estado del robot, orientada a control de manipulación.
- Procesamiento de entrada multimodal: una o varias cámaras (por ejemplo, vista de agente y muñeca) más un vector de estado (8 dimensiones en el caso LIBERO).
- Salida compatible con ejecución secuencial en robot real (secuencia de movimientos).
- Ejecución optimizada mediante OpenVINO en FP16, con soporte de dispositivo CPU en el ejemplo documentado.
- Integrable en el catálogo Intel de modelos físicos (`intel-model-catalog`) y en flujos de Physical AI Studio.
- No dispone de *tool calling*, soporte de agentes, capacidades multilingües ni modos de razonamiento: es una política robótica, no un modelo generativo de texto.
- Al distribuirse con pesos aleatorios, no presenta capacidades funcionales reales de control en esta publicación; su utilidad es la validación de la cadena técnica.

## Casos de uso

- Validación del pipeline de inferencia: permite comprobar que el framework OpenVINO Physical AI carga correctamente un modelo ACT en FP16, ejecuta `predict_action_chunk` y devuelve una salida con la forma esperada, antes de introducir pesos reales.
- Pruebas de integración de sensores: sirve para verificar que las observaciones de cámara (vista de agente y muñeca) y el vector de estado del robot se empaquetan con la convención LeRobot correcta (`float32` en `[0,1]`, `(C, H, W)`).
- Referencia (*baseline*) de arquitectura ACT: útil como punto de partida comparativo al evaluar variantes propias de políticas de imitación para tareas simples.
- Ajuste fino con datos propios: el modelo se puede emplear como base para *fine-tuning* mediante Physical AI Studio y sustituir los pesos aleatorios por pesos entrenados en el dominio objetivo.
- Desarrollo de entornos LIBERO: al estar documentado el ejemplo con dos cámaras y estado de 8 dimensiones, encaja en *setups* de benchmark y desarrollo de manipulación tipo LIBERO.
- Pruebas de despliegue en edge: al orientarse a OpenVINO y al chipset Panther Lake, permite estimar el comportamiento de una política ACT en hardware Intel de borde con ejecución en CPU.
- Verificación de compatibilidad del catálogo: sirve para comprobar que las herramientas de catálogo (`physicalai-train`, `intel-model-catalog`) indexan y sirven el artefacto correctamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de éxito de tarea, tasas de acierto ni comparaciones cuantitativas. Además, al tratarse de pesos aleatorios distribuidos solo para pruebas, cualquier métrica de rendimiento funcional carecería de validez.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el número de parámetros no está publicado; el tamaño del repositorio figura como 0,0 GB).
- Cabe en GPU de consumo: probablemente sí dado el formato FP16 y el contexto de política robótica ligera, pero no hay datos publicados que lo confirmen; se indica como no disponible.
- GPU/aceleradores recomendados: no disponible. El chipset objetivo declarado es `ptl` (Panther Lake, Intel).
- Ejecución en CPU: soportada explícitamente; el ejemplo oficial usa `InferenceModel("act-fp16-ov", device="CPU")`.
- Opciones de despliegue: framework OpenVINO Physical AI (`physicalai.inference.InferenceModel`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Dependencias de instalación: `uv pip install physicalai numpy`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Cámaras / estado | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `modelapi/act-fp16-ov-catalog-v2` | Política de imitación ACT (baseline) | 2 cámaras (agentview + wrist) + estado de 8 dims en el ejemplo LIBERO | OpenVINO FP16 | Apache 2.0 | Catálogo Intel / HuggingFace |
| `modelapi/pi05-libero-fp16-ov-catalog-v2` | Política VLA de imitación (π0.5) | no disponible en esta ficha | OpenVINO FP16 | no disponible | Catálogo Intel / HuggingFace |
| `modelapi/smolvla-libero-fp16-ov-catalog-v2` | Política VLA compacta (SmolVLA) | no disponible en esta ficha | OpenVINO FP16 | no disponible | Catálogo Intel / HuggingFace |

Los tres modelos pertenecen a la misma categoría (`physical-ai/action-policies-vla`) y comparten el sufijo `-fp16-ov`, lo que indica conversión a OpenVINO en FP16. No se dispone de datos de parámetros, contexto ni rendimiento para establecer una comparación cuantitativa entre ellos.

## Limitaciones y advertencias

- Pesos aleatorios: la propia model card indica que los pesos son aleatorios y se ofrecen solo para pruebas. El modelo no es funcional para control real sin un ajuste fino previo.
- Sin benchmarks: no hay métricas publicadas de éxito de tarea, robustez ni generalización.
- Sin información de sesgos: no se documentan sesgos conocidos, pero tampoco se describe la composición del dataset, por lo que no puede evaluarse su comportamiento en dominios distintos.
- Riesgo de sobreajuste al *setup* documentado: el ejemplo está definido para LIBERO con dos cámaras y estado de 8 dimensiones; otras configuraciones de sensores requerirían adaptación.
- Sin capacidades lingüísticas ni de razonamiento: no debe usarse como modelo de lenguaje.
- Idiomas: no aplica; no se documenta soporte multilingüe.
- Licencia: Apache 2.0 permite uso comercial, pero al tratarse de un artefacto de prueba sin entrenamiento efectivo, su uso comercial directo no tiene sentido práctico. Debe verificarse además la licencia de la implementación original de ACT en `tonyzhaozh/act`.
- Fecha de creación poco habitual: el repositorio figura creado y actualizado el 2026-09-21, dato que conviene verificar en la página de HuggingFace.
- Ficha con escasa documentación: sin parámetros, sin composición de dataset y sin resultados, cualquier integración en producción exige validación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/modelapi/act-fp16-ov-catalog-v2
- Repositorio del framework OpenVINO Physical AI: https://github.com/openvinotoolkit/physicalai
- Implementación original de ACT: https://github.com/tonyzhaozh/act
- Physical AI Studio (ajuste fino): https://github.com/open-edge-platform/physical-ai-studio
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- Principios globales de derechos humanos de Intel: https://www.intel.com/content/dam/www/central-libraries/us/en/documents/policy-human-rights.pdf
- No se han encontrado en la búsqueda web resultados relevantes adicionales sobre este modelo.
