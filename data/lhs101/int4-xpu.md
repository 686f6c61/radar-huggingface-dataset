# lhs101/int4-xpu

## Resumen

El repositorio `lhs101/int4-xpu` es una colección de modelos de difusión cuantizados a INT4, diseñada específicamente para ejecutarse en GPUs Intel Arc (A770/DG2) mediante el backend XPU. El autor, `lhs101`, publica aquí únicamente los artefactos cuantizados de modelos preexistentes, cuyo propósito es reducir el consumo de VRAM y permitir la generación de imágenes en hardware Intel que tradicionalmente tiene un soporte limitado frente a las GPU NVIDIA. El proyecto se integra con el cargador unificado `int4-omnixpu` y el backend de aceleración `omni_xpu_kernel`, y se ha validado en el entorno ComfyUI.

La relevancia actual de este repositorio radica en el creciente interés por ejecutar modelos de difusión en GPUs Intel de bajo coste, especialmente en un ecosistema dominado por CUDA. El repositorio ofrece dos formatos de cuantización distintos (`w4a16xpu` y `tint4`), con rutas numéricas diferentes pero resultados visualmente similares, lo que proporciona flexibilidad al usuario. Sin embargo, la falta de una licencia explícita y de documentación técnica detallada limita su uso directo en producción sin una evaluación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelos de difusión cuantizados, arquitectura original no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (modelo de difusión de imágenes) |
| Tipos de cuantizacion | w4a16 (int4 simétrico con scale f16 por grupo), tint4 (torchao int4 con int32 qdata + zp/scale por bloque, soporta QuaRot) |
| Idiomas soportados | no aplica (generación de imágenes) |
| Licencia | no disponible |
| Formato de pesos | safetensors (presumiblemente) con formatos propietarios wa4 y tint4 |

## Arquitectura y entrenamiento

El repositorio no contiene modelos entrenados desde cero, sino cuantizaciones de modelos de difusión preexistentes. No se proporciona información sobre la arquitectura original (posiblemente U-Net o DiT, típica de los modelos de difusión), el tamaño total de parámetros ni el dataset de entrenamiento. Los dos formatos de cuantización tienen implementaciones distintas: `w4a16xpu` empaqueta los pesos en formato u4 con escala f16 por grupo, mientras que `tint4` usa el formato de torchao con datos cuantizados int32 y cero-punto/escale por bloque, con soporte opcional de QuaRot. El proceso de cuantización no está documentado, ni se especifica si se aplicó calibración o fine-tuning posterior.

## Capacidades

- Generación de imágenes mediante modelos de difusión cuantizados a INT4.
- Ejecución en hardware Intel Arc (A770/DG2) a través del backend XPU.
- Dos formatos de cuantización compatibles con el cargador `wa4ModelLoader`.
- Integración con ComfyUI para flujos de trabajo visuales.
- Soporte de variantes NSFW en el subdirectorio `tint4/ns/`.
- Capacidad de cargar 20 modelos sin desbordamiento de VRAM en un A770 con 16GB de memoria (verificado por el autor).

## Casos de uso

- **Generación de imágenes en GPU Intel de gama baja**: el modelo puede ejecutarse en una A770/DG2 con 16GB de VRAM, lo que permite generar imágenes de 1024×1024 sin necesidad de una NVIDIA con CUDA. Es adecuado para usuarios que ya poseen hardware Intel y no quieren invertir en GPU NVIDIA.
- **Despliegue en entornos con restricciones de VRAM**: al estar cuantizado en INT4, cada modelo ocupa entre 4 y 10GB, lo que permite ejecutar varios modelos en una sola GPU o en tarjetas con memoria limitada. Esto es útil en estaciones de trabajo con una única GPU compartida.
- **Integración en ComfyUI para pipelines de difusión**: el repositorio se ha validado con ComfyUI, por lo que los desarrolladores pueden integrar estos modelos en flujos de trabajo existentes de generación de imágenes, con el cargador fusionado que gestiona la cuantización automáticamente.
- **Experimentos de cuantización y comparación de formatos**: los dos formatos (`w4a16` y `tint4`) permiten comparar el rendimiento y la calidad de diferentes estrategias de cuantización en el mismo hardware, útil para investigación en eficiencia de modelos.
- **Generación de contenido en entornos aislados**: al ser modelos locales, se pueden usar en entornos sin conexión a internet, cumpliendo requisitos de privacidad o seguridad en empresas.
- **Evaluación de la viabilidad de Intel Arc para IA**: los desarrolladores pueden usar estos modelos para probar el rendimiento real de las GPU Intel en tareas de difusión, comparando con el rendimiento de NVIDIA en los mismos modelos sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que los dos formatos de cuantización producen resultados con una correlación de 0.69 a 0.92 en imágenes de 1024×1024 con la misma semilla, lo que indica que las rutas numéricas son diferentes y no byte-idénticas, pero no hay datos de velocidad de inferencia, latencia o throughput.

## Requisitos de hardware

- **VRAM estimada**: los modelos pesan entre 4 y 10GB, por lo que caben en GPUs con al menos 8GB de VRAM (dependiendo del modelo concreto). El test se realizó en una A770/DG2 con 16GB sin desbordamiento.
- **GPU recomendada**: Intel Arc A770 o DG2 (16GB), aunque también podrían ejecutarse en modelos con menos VRAM si se selecciona un modelo más pequeño.
- **GPU de consumo**: sí, la A770 es una GPU de consumo de gama media-alta, por lo que el modelo es accesible para usuarios domésticos.
- **Opciones de despliegue**: ComfyUI con el cargador fusionado y el backend `omni_xpu_kernel`. No se menciona compatibilidad con vLLM, llama.cpp u otras herramientas.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No disponible. No se ha encontrado información sobre repositorios comparables de cuantización INT4 para Intel XPU en los datos proporcionados. Los modelos originales de difusión (antes de cuantizar) no se especifican, por lo que no es posible comparar con alternativas de la misma categoría.

## Limitaciones y advertencias

- **Hardware restringido**: el repositorio está optimizado exclusivamente para Intel Arc A770/DG2 con el backend `omni_xpu_kernel`. No se garantiza el funcionamiento en otras GPUs Intel (p.ej. Intel UHD integrada) ni en hardware NVIDIA/AMD.
- **Licencia indefinida**: al no especificar licencia, no es seguro usar estos modelos en proyectos comerciales o de código abierto sin obtener permiso explícito del autor.
- **Riesgo de alucinación y sesgos**: al ser modelos de difusión cuantizados, pueden producir imágenes con artefactos o distorsiones debido a la pérdida de precisión. No se ha evaluado su calidad frente al modelo original.
- **Contenido NSFW**: la variante `tint4/ns/` contiene modelos NSFW, lo que puede no ser apropiado para entornos profesionales o de investigación sin filtros.
- **Falta de documentación**: no hay información sobre el dataset de entrenamiento, la arquitectura original ni los métodos de cuantización, lo que dificulta la reproducibilidad y la evaluación de riesgos.
- **Dependencia de software específico**: requiere el cargador `int4-omnixpu` y el kernel `omni_xpu_kernel`, que son proyectos en GitHub pero no se indica su estado de mantenimiento ni su licencia.
- **Soporte limitado**: el autor indica que los modelos se suben en lotes, por lo que algunos pueden faltar o estar incompletos. El estado actual (20/20 modelos cargados) es solo del entorno de prueba.

## Enlaces

- Repositorio HuggingFace: [lhs101/int4-xpu](https://huggingface.co/lhs101/int4-xpu)
- GitHub del cargador: [int4-omnixpu](https://github.com/JWLHS/int4-omnixpu)
- Repositorio relacionado de cuantizaciones: [lhs101/wint4-quantized-models](https://huggingface.co/lhs101/wint4-quantized-models)
- Documentación de vLLM para XPU: https://docs.vllm.ai/en/v0.12.0/models/hardware_supported_models/xpu/
- Contenedores Intel para vLLM: https://deepwiki.com/intel/ai-containers/2.6-vllm-on-intel-xpu
