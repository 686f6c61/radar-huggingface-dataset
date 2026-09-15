# IsValorum/Occamy-1.0-APEX-I-MiniPlus-V2-GGUF

## Resumen

Occamy-1.0 APEX-I-MiniPlus-V2 GGUF es una cuantización artesanal del modelo multimodal Accio-Lab/occamy-1.0, publicada por el usuario IsValorum. El modelo base es un Mixture-of-Experts (MoE) de 34.660.610.688 parámetros (unos 34,66 mil millones) construido sobre la arquitectura Qwen3.5-MoE, con 256 micro-expertos de grano fino y una combinación híbrida de capas de atención lineal y Mamba SSM. El pipeline declarado es image-text-to-text, por lo que acepta entradas de imagen y de texto.

El problema que aborda esta publicación concreta es el despliegue en hardware modesto. Según el autor, el modelo se ha comprimido a 14,63 GB (13,62 GiB, 3,38 BPW) sin reducir bits por debajo de la arquitectura MiniPlus: cada cuantización lineal estándar se sustituye por su equivalente no lineal `IQ` calibrado con una importance matrix (imatrix) multidominio, y se incluye el proyector visual en Q8_0 (614 MB). El resultado declarado es un modelo que ocupa 13,62 GiB de pesos y permite contexto nativo de 262.144 tokens dentro de 24 GB de VRAM.

Su relevancia práctica es que permite probar un MoE multimodal de ~35B con contexto largo en GPUs de consumo e incluso en portátiles con 4 GB de VRAM y 32 GB de RAM DDR4. Conviene subrayar que todas las cifras de rendimiento y de consumo de memoria proceden de la model card del autor y no de una evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) de grano fino con 256 micro-expertos; híbrida de atención lineal y Mamba SSM (la model card menciona 30 capas de atención lineal); base Qwen3.5-MoE |
| Parametros totales | 34.660.610.688 (≈34,66 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256k) nativos |
| Tipos de cuantizacion | APEX-I-MiniPlus-V2 personalizada (3,38 BPW) para el modelo principal; Q8_0 para el proyector visual (mmproj) |
| Idiomas soportados | en, es, fr, de, pt, it, ru, ja, ko, vi, zh (11 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con un GGUF adicional mmproj para visión |
| Modalidades | Texto e imagen (image-text-to-text) |
| Tamano del repositorio | 15,3 GB |
| Modelo base | Accio-Lab/occamy-1.0 (relación: quantized) |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina un esquema MoE de grano fino con 256 micro-expertos y una columna vertebral híbrida que alterna capas de atención lineal con capas Mamba SSM (state space model). Según el autor, las 30 capas de atención lineal reducen el coste del prefill y el tamaño del KV cache en comparación con un transformer puro, lo que permite mantener contexto de 256k con un KV cache Q8_0 de solo 2,92 GiB a longitud máxima. La componente multimodal se implementa mediante un proyector visual externo (mmproj) que en esta publicación se distribuye en precisión Q8_0.

No hay información disponible sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base pasó por fases de RLHF, DPO u otro tipo de ajuste por preferencias. Tampoco se detalla el proceso de calibración de la imatrix más allá de describirse como «multidominio» y «oficial». La innovación técnica que sí documenta esta ficha es la propia cuantización: sustitución 1:1 de cuantizaciones lineales por equivalentes no lineales `IQ`, conservación del proyector visual en alta precisión y un objetivo de 3,38 BPW que mantiene los pesos en 13,62 GiB.

## Capacidades

- Generación de texto conversacional en 11 idiomas, incluidos español, inglés, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita y chino.
- Razonamiento y matemáticas: el autor describe el modelo como núcleo de «language, reasoning, math & agentic», aunque no aporta métricas que lo cuantifiquen.
- Generación de código: la model card afirma que la cuantización conserva la retención de código de una build I-Compact.
- Visión y OCR: admite entrada de imagen mediante el proyector mmproj en Q8_0, orientado a OCR, análisis de diagramas y comprensión de documentos.
- Uso agéntico: la etiqueta `agentic` figura en los tags del repositorio; no se documenta explícitamente el soporte de tool calling ni de function calling.
- Contexto largo: ventana nativa de 262.144 tokens, con soporte de context checkpoints para mantener el crecimiento lineal de memoria.
- Modo thinking: no disponible (no se menciona en la información proporcionada).

## Casos de uso

- OCR y digitalización de documentos en portátiles económicos: con 3,8 GB de VRAM en una RTX 3050/4050 y 32 GB de DDR4, el modelo puede procesar imágenes de documentos y extraer texto sin necesidad de una estación de trabajo dedicada.
- Análisis de diagramas y documentación técnica: el proyector visual en Q8_0 está pensado específicamente para el parseo de diagramas y la comprensión de documentos, lo que encaja en flujos de ingeniería que reciben planos, esquemas o capturas.
- Asistencia multilingüe al cliente: con cobertura de 11 idiomas y contexto de 256k tokens, puede mantener conversaciones multi-turno con historial largo y documentación de producto adjunta sin truncar el contexto.
- Análisis de bases de código extensas: la ventana de 262.144 tokens permite cargar repositorios o módulos completos para tareas de resumen, búsqueda de patrones y revisión, siempre que el contenido se ajuste al presupuesto de contexto.
- Procesamiento por lotes de corpus documentales: el prefill declarado de 1.900 a 2.800+ tok/s en una RTX 4090 hace viable la ingesta masiva de documentos densos en pipelines de indexación o extracción de información.
- Despliegue en el puesto de trabajo del desarrollador: al caber completamente en 24 GB de VRAM con contexto de 256k (19,34 GiB totales según el autor), permite ejecutar localmente un MoE multimodal sin depender de APIs externas.
- Prototipado de agentes con razonamiento multi-paso: la etiqueta `agentic` y la ventana larga lo hacen candidato para prototipos de agentes, si bien el soporte formal de tool calling no está documentado y habría que verificarlo antes de llevarlo a producción.
- Evaluación comparativa de técnicas de cuantización: el repositorio documenta de forma explícita la metodología (imatrix, sustitución IQ, BPW) y resulta útil como referencia para investigar el impacto de cuantizaciones quirúrgicas frente a reducciones uniformes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible. Los únicos datos numéricos son medidas de velocidad de inferencia declaradas por el autor, que se reproducen a continuación tal cual.

| Configuracion de hardware | Modo de offload | Generacion (tok/s) | Prefill (tok/s) |
|---|---|---|---|
| NVIDIA RTX 4090 (24 GB GDDR6X) | GPU completa (`-ngl 99`) | 80-105+ | 1.900-2.800+ |
| NVIDIA RTX 3090 (24 GB GDDR6) | GPU completa (`-ngl 99`) | 66-80+ | 1.500-2.100+ |
| Portátil con RTX 3050/4050 + 32 GB DDR4 | Híbrido (3,8 GB VRAM) | 20-22,5 | 300-410 |

El autor indica además que estas cifras se obtuvieron en Unsloth Studio y que, con la decodificación especulativa activada en modo de offload híbrido sobre DDR4, el rendimiento cae por debajo de 19 tok/s.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 13,62 GiB. Con KV cache en Q8_0, el consumo total estimado es de 16,00 GiB a 32k, 16,49 GiB a 64k, 17,42 GiB a 128k y 19,34 GiB a 256k (incluyendo buffers de cómputo).
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para offload completo con contexto nativo de 256k. En la práctica, cualquier GPU con 24 GB de VRAM debería bastar según los datos del autor.
- GPU de consumo: sí cabe en GPUs de portátil de 4-6 GB (RTX 3050, RTX 4050, GTX 1660 Ti) en modo de offload híbrido, con aproximadamente 3,8 GB en VRAM y el resto de los pesos en 32 GB de RAM DDR4 a 3200 MHz.
- RAM del sistema: 32 GB DDR4 a 3200 MHz como referencia para el modo híbrido declarado.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), vLLM (mencionado por el autor) y Unsloth Studio (entorno de las pruebas). Ollama y TGI no se mencionan en la información disponible.
- Latencia y throughput: 20-22,5 tok/s de generación y 300-410 tok/s de prefill en offload híbrido sobre DDR4; 66-105+ tok/s de generación y 1.500-2.800+ tok/s de prefill con offload completo en 24 GB.
- Ajustes recomendados por el autor: fijar Context Checkpoints a 1, usar KV cache Q8, y desactivar la decodificación especulativa o n-gram (`--spec-type none`) en escenarios de offload híbrido sobre DDR4.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos comparables. La model card menciona de forma genérica «cuantizaciones comunitarias planas» (tipo `IQ3_XXS` o `IQ2`) y afirma que estas superan los 15,8 GiB de pesos y fallan en GPUs de 24 GB al abrir contextos largos, frente a los 13,62 GiB de esta build, pero no nombra modelos concretos ni ofrece cifras verificables de terceros.

## Limitaciones y advertencias

- Todas las cifras de rendimiento, consumo de VRAM y velocidades proceden de la model card del autor y no han sido verificadas de forma independiente.
- El repositorio registra 0 descargas y 0 «likes» en el momento de la consulta, por lo que no existe validación por parte de la comunidad.
- No hay información sobre sesgos, composición del dataset de entrenamiento ni procesos de alineación del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible; es esperable un comportamiento similar al del modelo base sin ajuste específico.
- La visión requiere distribuir y cargar el archivo mmproj por separado; sin él, el modelo funciona solo con texto.
- En modo de offload híbrido sobre DDR4, la decodificación especulativa degrada el rendimiento según el autor, lo que obliga a desactivarla.
- El contexto de 256k solo cabe en VRAM con 24 GB; por debajo de esa cifra hay que reducir la ventana o aceptar offload parcial con la penalización de velocidad correspondiente.
- Licencia Apache 2.0, que en principio permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base Accio-Lab/occamy-1.0 antes de un despliegue en producción.
- El README proporcionado está truncado al final, por lo que pueden existir secciones adicionales (casos de uso, avisos de la comunidad o instrucciones de uso) no recogidas en esta ficha.
- Los datos de fecha del repositorio (creación y actualización el 15 de septiembre de 2026) resultan anómalos y no se han podido contrastar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IsValorum/Occamy-1.0-APEX-I-MiniPlus-V2-GGUF
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- Papers, blogs, repositorios o demos adicionales: no disponible. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre su modelo base (únicamente páginas de ayuda de YouTube y contenidos de Zhihu sin relación).
