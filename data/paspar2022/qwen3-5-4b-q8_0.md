# paspar2022/Qwen3.5-4B-Q8_0

## Resumen

`paspar2022/Qwen3.5-4B-Q8_0` es un repositorio de pesos en formato GGUF derivado de la familia Qwen3.5 y publicado por el usuario `paspar2022`. A pesar del nombre comercial del repositorio, los datos reales de safetensors indican 772.845.888 parámetros totales, lo que corresponde a la variante de 0,8B de la familia (los ficheros listados en la model card se denominan `Qwen3.5-0.8B.Q8_0.gguf` y `Qwen3.5-0.8B.BF16-mmproj.gguf`). Existe por tanto una discrepancia entre el identificador del repo ("4B") y el contenido real del artefacto.

El modelo se distribuye como artefacto listo para inferencia con llama.cpp, cuantizado en Q8_0, e incluye un proyector multimodal en BF16 (`mmproj`), lo que indica soporte de entrada de imágenes mediante `llama-mtmd-cli`. La conversión a GGUF se realizó con Unsloth según la model card, aunque no se documenta el proceso de fine-tuning aplicado ni el dataset empleado.

Su relevancia práctica es limitada: se trata de una publicación sin descargas ni interacciones, sin licencia declarada, sin idiomas declarados y sin benchmarks. Resulta útil únicamente como artefacto de prueba para pipelines de llama.cpp con capacidades visión-lenguaje, no como base recomendada para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), con proyector multimodal BF16 para entrada de imagen; detalles de capas y atención no disponibles |
| Parametros totales | 772.845.888 (según safetensors); el nombre del repo indica "4B", discrepancia no aclarada |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (pesos principales) y BF16 (proyector multimodal `mmproj`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); repo de 2,1 GB |
| Pipeline | no disponible |
| Fecha de creacion | 2026-11-18 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la pertenencia a la familia Qwen3.5 y de la presencia de un componente de visión (`vision-language-model` en las etiquetas, más un fichero `BF16-mmproj.gguf` que actúa como proyector entre el codificador visual y el modelo de lenguaje). No se especifican número de capas, dimensión oculta, mecanismo de atención ni tipo de tokenizador.

Respecto al entrenamiento, la model card solo indica que el modelo fue "finetuned and converted to GGUF format using Unsloth". No se documentan el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF/DPO, ni las técnicas de alineación aplicadas. Tampoco se describe ninguna innovación técnica específica (decodificación especulativa, atención lineal, etc.). Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional en formato chat, ejecutable con `llama-cli --jinja`.
- Procesamiento de imágenes como entrada, ejecutable con `llama-mtmd-cli --jinja` gracias al proyector multimodal incluido.
- Compatibilidad con plantillas de chat Jinja (`--jinja`), lo que habilita el formato de turnos esperado por la familia Qwen.
- Etiqueta `endpoints_compatible`, que sugiere compatibilidad con endpoints de inferencia estándar de Hugging Face.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking explícito, audio u otras modalidades: no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: el GGUF Q8_0 se carga directamente en llama.cpp con `llama-cli --jinja`, lo que permite validar plantillas de chat y flujos de prompt sin infraestructura de GPU dedicada.
- Pruebas de pipelines visión-lenguaje: el par `Qwen3.5-0.8B.Q8_0.gguf` + `Qwen3.5-0.8B.BF16-mmproj.gguf` permite ejercitar la ruta multimodal de llama.cpp (`llama-mtmd-cli`) en entornos de desarrollo y CI.
- Evaluación de compatibilidad de herramientas: útil para comprobar que una versión concreta de llama.cpp, Ollama o un servidor compatible carga correctamente un modelo Qwen3.5 con proyector multimodal.
- Generación de texto en dispositivos con recursos limitados: con ~773M parámetros en Q8_0, el artefacto cabe en memoria de sistemas sin GPU dedicada, lo que sirve para demos y entornos embebidos.
- Banco de pruebas de cuantización: permite comparar la calidad de salida de Q8_0 frente a otras cuantizaciones del mismo modelo base en tareas de generación y descripción de imágenes.
- Base para experimentos de fine-tuning ligero: al ser un modelo pequeño, puede servir como punto de partida para ajustes con Unsloth en tareas concretas antes de escalar a variantes mayores.
- Verificación de integración con endpoints: la etiqueta `endpoints_compatible` permite probar el despliegue en infraestructura de inferencia gestionada antes de migrar a un modelo con licencia clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 2,1 GB, por lo que la inferencia en Q8_0 requiere del orden de 1-2 GB de memoria para los pesos más el overhead del contexto y del proyector multimodal; no se dispone de cifras oficiales.
- GPU recomendadas: no disponibles. Por tamaño, cualquier GPU consumer con 4 GB o más de VRAM debería poder alojar los pesos.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 4-8 GB de VRAM (GTX 1650, RTX 3050, RTX 4060 y superiores); no confirmado por el autor.
- Despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), y por extensión entornos compatibles con GGUF como Ollama o servidores basados en llama-cpp; vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| paspar2022/Qwen3.5-4B-Q8_0 | 772.845.888 (según safetensors) | no disponible | no disponible | GGUF Q8_0 + mmproj BF16 | Publicación sin descargas ni benchmarks; nombre del repo inconsistente con el tamaño real |
| Qwen2.5-0.5B / Qwen2.5-1.5B (oficiales) | 0,5B / 1,5B | 32.768 tokens (según versión) | Apache 2.0 | safetensors, GGUF | Familia oficial con licencia permisiva y documentación completa |
| Llama 3.2 1B / 3B (oficiales) | 1B / 3B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Alternativa multimodal (11B) y de texto; requiere aceptar licencia |
| SmolVLM-500M / 256M (Hugging Face) | 0,25B / 0,5B | 8.192 tokens (aprox.) | Apache 2.0 | safetensors, GGUF | Diseñado para visión-lenguaje en dispositivos de borde |

La comparación con la familia Qwen3.5 oficial no es posible con los datos disponibles, ya que no se documentan contexto, licencia ni rendimiento del artefacto aquí descrito.

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el repo se llama "4B" pero los pesos suman 772.845.888 parámetros y los ficheros se denominan "0.8B". Verificar el contenido antes de usarlo en cualquier pipeline.
- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial; hay que contactar con el autor o consultar la licencia del modelo Qwen3.5 original.
- Idiomas no declarados: no hay garantía de calidad multilingüe ni de cobertura de castellano.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni tareas multimodales.
- Riesgo de alucinación: inherente a modelos de ~0,8B parámetros; esperable una tasa alta en tareas de razonamiento y matemáticas.
- Contexto desconocido: no se puede planificar el uso en conversaciones largas o documentos extensos sin conocer la ventana real.
- Procedencia del fine-tuning no documentada: se desconoce qué datos se usaron y si hubo filtrado o sesgos introducidos.
- Sin descargas ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay señales de que el artefacto haya sido probado por terceros.
- Fecha de creación en el futuro (2026-11-18) respecto a la mayoría de referencias de la familia Qwen: conviene verificar la autenticidad y el origen del artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/paspar2022/Qwen3.5-4B-Q8_0
- Unsloth (herramienta de conversión citada): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia): https://github.com/ggml-org/llama.cpp
- Documentación de llama.cpp para modelos multimodales (`llama-mtmd-cli`): https://github.com/ggml-org/llama.cpp/tree/master/tools/mtmd
- Paper, blog o demo oficial del modelo Qwen3.5: no disponible en la información proporcionada.
