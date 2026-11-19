# orcarouter/GLM-5.3-Flash-MLX

## Resumen

GLM-5.3-Flash-MLX es una compilación cuantizada para Apple Silicon del modelo oficial `zai-org/GLM-5.3-Flash`, desarrollado por Z.ai (Zhipu AI) y distribuido en formato MLX por el usuario `orcarouter`. Se trata de un modelo de mezcla de expertos (MoE) de 320 000 millones de parámetros totales con 18 000 millones activos por token, y el primero de la serie GLM-5 con capacidad multimodal nativa (visión-lenguaje). La arquitectura subyacente, denominada `glm5_next`, combina atención dispersa con atención lineal e incorpora Manifold-Constrained Hyper-Connections.

El problema que resuelve esta variante es concreto: hacer viable la inferencia de un modelo de 320B en hardware Apple Silicon mediante cuantización selectiva. El autor aplica OrcaSAQ (Sensitivity-Aware Quantization), un método sin calibración que asigna distinto número de bits según la sensibilidad de cada tensor: los expertos compartidos reciben dos bits adicionales y las proyecciones `down_proj` uno más, mientras que los tensores que no estaban en FP8 en la versión base (las 34 capas de atención lineal, el indexador disperso, las hyper-connections, las normas, `embed_tokens`, `lm_head` y la torre de visión completa) se mantienen en BF16.

La relevancia actual es doble. Por un lado, el repositorio demuestra que es posible servir un MoE multimodal de escala frontier en un Mac mediante MLX, con cinco variantes de cuantización (2bit-lite, 2, 3, 4 y 6 bits) publicadas como subcarpetas y la de 4 bits replicada en la raíz. Por otro, mantiene licencia MIT, lo que elimina las restricciones de uso comercial que suelen acompañar a los modelos de esta escala. El repositorio acumula más de 5000 descargas desde su publicación en agosto de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm5_next` (MoE híbrida: atención dispersa + atención lineal, con Manifold-Constrained Hyper-Connections) |
| Parametros totales | 347 872 975 710 (347,9 B) |
| Parametros activos | 18 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2bit-lite, 2, 3, 4 y 6 bits (OrcaSAQ); visión e indexador en BF16 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | MLX safetensors (cuantización dinámica 2-8 bit) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 347,9 B de parámetros totales y 18 B activos por token, lo que sitúa su coste de cómputo por token en el rango de un modelo denso de ~18B. La arquitectura `glm5_next` introduce dos elementos diferenciales: un mecanismo de atención híbrido que alterna capas de atención dispersa (con indexador de tokens) y capas de atención lineal —34 capas de atención lineal según la model card—, y Manifold-Constrained Hyper-Connections, un esquema de conexiones residuales generalizadas que el autor no detalla en la información disponible. Es además el primer modelo de la serie GLM-5 con torre de visión integrada, lo que lo convierte en un modelo imagen-texto-a-texto nativo y no en un adaptador acoplado.

Sobre el entrenamiento no se proporcionan datos en la información disponible: ni número de tokens, ni composición del corpus, ni si hubo RLHF, DPO o una fase de razonamiento explícita. La model card menciona la etiqueta `reasoning` y la existencia de un paper con identificador arXiv:2602.15763, pero no reproduce cifras. La innovación técnica documentada se limita al proceso de cuantización: OrcaSAQ es un método de cuantización consciente de la sensibilidad, sin calibración y consciente de la arquitectura, que preserva en BF16 todos los tensores que no eran FP8 en la release original y cuantiza a la anchura base únicamente las cuatro proyecciones de los bloques de atención dispersa, que sí estaban en FP8 upstream.

## Capacidades

- Generación de texto conversacional en inglés y chino, con etiqueta explícita de `reasoning` para tareas de razonamiento multi-paso.
- Comprensión de imágenes: pipeline `image-text-to-text` con torre de visión preservada íntegramente en BF16, lo que evita la degradación típica de cuantizar el encoder visual.
- Procesamiento multimodal de documentos: al no cuantizar la torre de visión, mantiene la fidelidad en la extracción de texto e interpretación de gráficos.
- Razonamiento y matemáticas: herencia de las capacidades del modelo base GLM-5.3-Flash, sin cifras de benchmark publicadas en esta ficha.
- Contexto largo: la presencia de 34 capas de atención lineal y un indexador disperso sugiere eficiencia en secuencias largas, aunque la longitud máxima de contexto no se especifica en la información disponible.
- Soporte de tool calling y function calling: no confirmado explícitamente en la model card de esta variante; el modelo base se sirve vía API compatible con OpenAI en OrcaRouter, lo que habitualmente implica soporte de herramientas, pero no se documenta aquí.
- Capacidades de agente multi-paso: no disponible como dato verificado.
- Despliegue en Apple Silicon mediante MLX y en el backend CUDA de MLX.

## Casos de uso

- **Asistente de código en local sobre Mac Studio**: con la variante de 4 bits y una máquina con memoria unificada suficiente, el modelo puede ejecutarse íntegramente en local sin conexión, procesando repositorios completos y generando parches. El autor lo vincula explícitamente a su herramienta OrcaCode Review para revisión de pull requests.
- **Revisión automática de PRs en CI**: integrado como paso de revisión en pipelines de GitHub Actions sobre runners macOS, el modelo analiza diffs y deja comentarios. La licencia MIT permite uso comercial sin fricción legal.
- **Análisis de documentos con imágenes**: facturas, capturas de pantalla, diagramas de arquitectura o tablas escaneadas. La torre de visión en BF16 preserva la calidad de reconocimiento frente a cuantizaciones agresivas del encoder.
- **Atención al cliente bilingüe inglés-chino**: el soporte nativo de ambos idiomas cubre el caso de empresas con operaciones en Asia oriental y mercados anglófonos, sin necesidad de un modelo de traducción intermedio.
- **Prototipado de agentes multimodales sin coste de API**: investigadores que necesitan iterar sobre prompts y flujos de agente con entrada de imagen pueden hacerlo en hardware propio, eliminando el coste por token y la latencia de red.
- **Procesamiento por lotes de imágenes en local**: clasificación, descripción y extracción estructurada de metadatos de archivos fotográficos o capturas, ejecutado de noche en un equipo de sobremesa con Apple Silicon.
- **Evaluación comparativa de cuantizaciones**: las cinco variantes publicadas permiten medir la degradación de calidad frente a FP16 en el mismo hardware, útil para decidir el punto de equilibrio entre memoria y fidelidad antes de un despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de cuantizaciones con columnas de bits base, tamaño de grupo, tamaño en disco y RAM mínima, pero el contenido de esa tabla aparece truncado en la información proporcionada, por lo que no se reproducen cifras de calidad relativa ni de rendimiento.

## Requisitos de hardware

- **VRAM/RAM unificada**: el repositorio completo ocupa 1610,4 GB, pero ese tamaño incluye las cinco variantes. Cada subcarpeta debe descargarse por separado; la de 4 bits, replicada en la raíz, es la opción de referencia para consumo general.
- **Memoria mínima por variante**: la model card incluye una columna "Min RAM" por carpeta, pero sus valores no están disponibles en la información proporcionada. Como referencia estructural, un MoE de 347,9 B en 4 bits requiere del orden de 170-180 GB solo para pesos, más overhead de contexto y caché KV.
- **GPU y aceleradores**: el formato es MLX, por lo que el objetivo principal son los chips de Apple Silicon (series M1 a M4, con memoria unificada de 64, 128 o 192 GB según el chip). El autor menciona también el backend CUDA de MLX, lo que abre la puerta a GPUs NVIDIA, aunque sin lista de modelos validados.
- **GPU de datacenter**: no es el caso de uso de esta compilación. Para A100/H100 conviene recurrir a los pesos originales en safetensors de `zai-org/GLM-5.3-Flash` y servirlos con vLLM o SGLang.
- **Consumer GPU NVIDIA**: no aplicable directamente; el formato MLX no se carga en llama.cpp ni en Ollama. Para RTX 4090 sería necesario convertir a GGUF, tarea no cubierta por este repositorio.
- **Opciones de despliegue**: `mlx-lm` y el stack MLX de Apple son la vía natural. El autor ofrece además acceso vía API alojada en OrcaRouter con precisión completa, y una solución llamada Orca Connect para exponer hardware propio (Ollama, LM Studio, vLLM, llama.cpp, SGLang) tras una clave de API.
- **Latencia y throughput**: no disponibles. Dependen críticamente del ancho de banda de memoria del chip Apple concreto y del número de tokens activos (18 B), no del total.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| GLM-5.3-Flash-MLX (esta ficha) | 347,9 B / 18 B | no disponible | Imagen-texto-texto | MIT | MLX safetensors |
| zai-org/GLM-5.3-Flash (base) | 320 B / 18 B (según model card) | no disponible | Imagen-texto-texto | MIT | safetensors (FP8/BF16) |
| Alternativas de escala similar en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con modelos de la misma categoría (MoE multimodal de escala frontier con compilación MLX) no está disponible en la información proporcionada. Nótese la discrepancia entre los 320 B que cita la model card del autor y los 347,9 B que reportan los metadatos de safetensors; la cifra de 347,9 B corresponde al recuento real de parámetros del repositorio.

## Limitaciones y advertencias

- **Discrepancia en el recuento de parámetros**: la model card indica 320 B totales y los safetensors reportan 347,9 B. Conviene verificar contra el repositorio base antes de dimensionar hardware.
- **Degradación por cuantización**: las variantes de 2 y 3 bits, pese a la preservación selectiva en BF16, implican pérdida de calidad frente a FP8/BF16. El autor no publica métricas de divergencia en la información disponible.
- **Idiomas limitados**: solo inglés y chino están declarados. El rendimiento en castellano no está evaluado y probablemente sea inferior, especialmente en las variantes de menor precisión.
- **Contexto no especificado**: no se documenta la longitud máxima de contexto, dato crítico para planificar aplicaciones de documentos largos.
- **Sesgos**: no se documenta ninguna evaluación de sesgo, toxicidad o alineación en la información disponible. Al ser un modelo entrenado predominantemente en inglés y chino, es esperable un sesgo cultural hacia esos contextos.
- **Alucinación**: sin datos de evaluación de factualidad. En un modelo con modo de razonamiento, el riesgo de cadenas de razonamiento plausibles pero incorrectas es real y requiere verificación externa en producción.
- **Licencia**: MIT, permissions amplios para uso comercial, modificación y redistribución, con la obligación habitual de incluir el aviso de copyright. Verificar que la licencia del modelo base (`zai-org/GLM-5.3-Flash`) sea efectivamente MIT y no una licencia comunitaria con restricciones adicionales.
- **Ecosistema restringido**: el formato MLX no es portable a llama.cpp, Ollama, vLLM ni TGI sin conversión. Esto limita el despliegue a Apple Silicon y al backend CUDA experimental de MLX.
- **Tamaño del repositorio**: 1610,4 GB en total. Descargar la carpeta completa es inviable para la mayoría de conexiones; hay que usar descarga selectiva por subcarpeta.
- **Mantenimiento**: el repositorio lo mantiene un tercero (`orcarouter`), no el desarrollador original. La actualización más reciente es de octubre de 2026; conviene comprobar si hay revisiones posteriores del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orcarouter/GLM-5.3-Flash-MLX
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Paper de referencia: https://arxiv.org/abs/2602.15763
- API alojada de GLM-5.3-Flash: https://www.orcarouter.ai/models/z-ai/glm-5.3-flash
- Catálogo de modelos de OrcaRouter: https://www.orcarouter.ai/models
- Sitio web de OrcaRouter: https://www.orcarouter.ai
- Orca Connect: https://www.orcarouter.ai/solutions/orca-connect
- OrcaCyber Zero 1.5: https://www.orcarouter.ai/models/orca/orcacyber-zero-1.5
- Repositorio OrcaCode Review: https://github.com/Continuum-AI-Corp/Orca-Code-Review
- Organización en GitHub: https://github.com/Continuum-AI-Corp
- Discord: https://discord.gg/yAh6Tex6kx
- X (Twitter): https://x.com/OrcaRouter
