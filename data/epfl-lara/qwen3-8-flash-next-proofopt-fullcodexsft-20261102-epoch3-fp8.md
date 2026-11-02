# EPFL-LARA/Qwen3.8-Flash-Next-ProofOpt-FullCodexSFT-20261102-epoch3-FP8

## Resumen

Qwen3.8-Flash-Next-ProofOpt-FullCodexSFT-20261102-epoch3-FP8 es un ajuste fino supervisado (SFT) del modelo multimodal Qwen/Qwen3.8-Flash-Next, desarrollado por el laboratorio EPFL-LARA. El checkpoint especializa el modelo base en optimización de pruebas matemáticas formales (proof optimization), combinando razonamiento sintético prospectivo con acciones seleccionadas y verificadas sobre problemas de demostración. Se distribuye en formato FP8 nativo con los pesos LoRA ya fusionados, lo que lo hace directamente desplegable con la misma interfaz de servicio que el modelo base.

El modelo parte de una arquitectura multimodal image-text-to-text con aproximadamente 180.000 millones de parámetros totales (según los safetensors del repositorio, 179.999.981.459). El entrenamiento se realizó sobre 4.351 ejemplos verificados extraídos de 61 problemas de optimización de pruebas, con 13.053 exposiciones efectivas de filas durante tres épocas. Es un experimento explícitamente orientado a benchmarks, sin partición de validación retenida ni validación intraentrenamiento, por lo que su rendimiento debe evaluarse de forma independiente antes de cualquier uso en producción.

Su relevancia radica en dos factores: por un lado, demuestra un flujo de trabajo de ajuste LoRA en BF16 sobre un modelo base en FP8 preservando la arquitectura nativa, el tokenizador y los activos originales; por otro, ataca un nicho poco cubierto como es el razonamiento matemático orientado a la optimización de demostraciones asistidas por herramientas. La licencia es la Qwen Community License 1.0, con las restricciones que ello implica para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (arquitectura nativa FP8 de Qwen3.8-Flash-Next, con proyecciones attention/GDN preservadas) |
| Parametros totales | 179.999.981.459 (~180B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 nativo (checkpoint publicado); el adaptador LoRA se entrenó en BF16 y se fusionó en los pesos |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.8-Flash-Next, un transformer multimodal de tipo image-text-to-text con soporte nativo de FP8. El ajuste se realizó mediante LoRA de rango 32 y alpha 64, sin dropout, sobre las proyecciones de atención y GDN (gated delta network) excluidas del entrenamiento. Las dos primeras épocas usaron un calentamiento de 63 actualizaciones y decaimiento coseno desde 1e-5 hasta 1e-6; la tercera época reanudó el adaptador nativo de la época dos con el optimizador Adam, el estado del generador aleatorio y el planificador en su suelo de 1e-6, sin nuevo calentamiento. El tamaño de lote fue de 7, con un grupo real de 4 filas en cada frontera de época, sin descartar ni duplicar filas, y sin truncamiento de tokens.

Los datos de entrenamiento cubren 4.351 ejemplos verificados procedentes de 61 problemas de optimización de pruebas. La supervisión incluye un plan matemático prospectivo sintético junto con la acción válida originalmente seleccionada; el contexto original, los intentos fallidos y las salidas de herramientas están enmascarados. Cada objetivo seleccionado contaba con una comprobación de versión superada y una ganancia de puntuación positiva. Los planes se revisaron por estratos para verificar su fundamentación, aunque no cuentan con certificación semántica independiente. No se impuso una longitud objetivo artificial al razonamiento: su masa de pérdida se equilibra contra la acción. Tras el entrenamiento, las 84 proyecciones BF16 entrenadas se fusionaron con la implementación verificada de PEFT 0.20, preservando el resto de tensores sin cambios.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno sobre el modelo base.
- Razonamiento matemático orientado a la optimización de demostraciones formales: planificación prospectiva y selección de acciones válidas.
- Procesamiento multimodal image-text-to-text (heredado del modelo base Qwen3.8-Flash-Next).
- Uso de herramientas y clientes de shell nativos (Lemex) verificados durante la aceptación acotada.
- Razonamiento sintético con trazas de planificación explícitas, sin longitud objetivo artificial.
- Capacidad de ejecutar comprobaciones de versión y validar acciones con ganancia de puntuación positiva.
- Soporte de tool calling / function calling: no disponible de forma explícita en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Optimización de demostraciones matemáticas asistidas por herramientas: el modelo genera planes prospectivos y selecciona acciones válidas sobre problemas formales, integrándose en entornos de prueba con comprobación de versiones y puntuación de ganancia, tal como se entrenó.
- Investigación en razonamiento sintético: sirve como banco de pruebas para estudiar cómo el SFT sobre trazas planificadas y acciones verificadas afecta al comportamiento de razonamiento de un modelo de 180B en FP8.
- Evaluación de pipelines de ajuste LoRA sobre modelos FP8: el checkpoint documenta un flujo completo de entrenamiento BF16 con fusión PEFT 0.20 sobre un modelo base cuantizado, útil como referencia metodológica.
- Automatización de entornos de prueba formales: los clientes de shell/tool nativos (Lemex) verificados en la aceptación permiten conectar el modelo a entornos de ejecución de pruebas para proponer y validar acciones.
- Reproducción de experimentos de SFT a gran escala: el repositorio incluye `export_metadata.json` con hashes, recuentos y procedencia, lo que facilita la auditoría y reproducción del entrenamiento.
- Servicio de inferencia multimodal en infraestructura de datacenter: al preservar la interfaz de servicio nativa FP8 de Qwen/Lemex, puede desplegarse con el mismo stack que el modelo base en GPUs de gran capacidad (B300 en las pruebas de aceptación).
- Estudio de retención de capacidades tras SFT: las pruebas de aceptación incluyen sondas de razonamiento con respuesta conocida y lecturas de probabilidad sobre entradas de entrenamiento fijas, útiles para medir deriva respecto al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explícitamente que no se ejecutó ningún benchmark completo de demostraciones y que las comprobaciones de aceptación acotadas (carga, 16 lecturas de probabilidad sobre entradas de entrenamiento fijas, 3 sondas de razonamiento con respuesta conocida y 10 clientes de shell/tool nativos Lemex) no establecen retención general de razonamiento, capacidad en A100 ni mejora en benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 185,6 GB en FP8, por lo que se requiere al menos esa cantidad de memoria de GPU para cargar los pesos completos sin offloading.
- GPU recomendadas: B300 (utilizadas en las pruebas de aceptación del autor); GPU de datacenter con al menos 192 GB de memoria (H100 NVL, H200, B200/B300) para carga completa en FP8.
- Capacidad en consumer GPU: no cabe en GPUs de consumo (RTX 4090 con 24 GB, RTX 5090 con 32 GB) sin cuantización adicional o paralelismo multi-GPU.
- A100: la model card no confirma capacidad en A100; el autor indica que las comprobaciones no establecen capacidad en A100.
- Opciones de despliegue: interfaz de servicio nativa FP8 de Qwen/Lemex, la misma que el modelo base; transformers con safetensors. No se documentan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| EPFL-LARA/Qwen3.8-Flash-Next-ProofOpt-FullCodexSFT-20261102-epoch3-FP8 | ~180B | no disponible | qwen-community-1.0 | HuggingFace, FP8 safetensors | SFT especializado en optimización de pruebas, sin benchmarks publicados |
| Qwen/Qwen3.8-Flash-Next (base) | ~180B | no disponible | qwen-community-1.0 | HuggingFace | Modelo base multimodal image-text-to-text; el checkpoint herede su arquitectura e interfaz |
| Alternativas de razonamiento matemático de ~180B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información sobre otros modelos comparables de la misma categoría (optimización de pruebas formales) en la documentación proporcionada.

## Limitaciones y advertencias

- Entrenamiento explícitamente orientado a benchmarks: no hubo partición de validación retenida ni validación intraentrenamiento, por lo que el rendimiento en datos no vistos es incierto y podría estar sobreajustado a los 61 problemas de entrenamiento.
- Sin benchmark completo de demostraciones: el autor no ejecutó una evaluación completa, y las comprobaciones acotadas no demuestran retención general de razonamiento ni mejora en benchmarks.
- Planes sintéticos sin certificación semántica independiente: los planes prospectivos se revisaron por estratos para verificar su fundamentación, pero no cuentan con certificación semántica.
- Riesgo de alucinación: inherente a los modelos generativos; en dominios formales, la ausencia de verificación semántica de los planes incrementa el riesgo de pasos plausibles pero incorrectos.
- Capacidad en A100 no confirmada: la aceptación se realizó en B300 y el autor advierte que no se establece capacidad en A100.
- Licencia Qwen Community License 1.0: impone restricciones para uso comercial; es necesario revisar el archivo `LICENSE` incluido antes de cualquier despliegue productivo.
- Idiomas soportados no disponibles: no se documenta el alcance multilingüe del checkpoint.
- Contexto no disponible: no se especifica la longitud de contexto efectiva del modelo base ni del checkpoint.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Checkpoint experimental: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EPFL-LARA/Qwen3.8-Flash-Next-ProofOpt-FullCodexSFT-20261102-epoch3-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Metadatos de exportación: `export_metadata.json` (incluido en el repositorio)
- Model card original del base: `BASE_MODEL_README.md` (incluido en el repositorio)
- Licencia: `LICENSE` (Qwen Community License 1.0, incluida en el repositorio)
