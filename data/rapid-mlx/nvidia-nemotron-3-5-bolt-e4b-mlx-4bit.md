# rapid-mlx/NVIDIA-Nemotron-3.5-Bolt-E4B-MLX-4bit

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-MLX-4bit es una conversión a 4 bits del modelo de lenguaje NVIDIA Nemotron 3.5 Bolt E4B, publicada por el usuario rapid-mlx. No se trata de un modelo entrenado desde cero, sino de una cuantización afín de 4 bits con grupo de 64 realizada con mlx-lm 0.31.3 y MLX 0.32.4 sobre GPU, a partir de la revisión `625857316b2a8b12022378a2cb2469a03cd72295` del checkpoint BF16 original de NVIDIA. El resultado es un repositorio de 4,2 GB con pesos en safetensors y 7.463.013.418 parámetros totales, pensado para ejecutarse en la pila MLX de Apple.

El modelo resuelve el problema de desplegar un LLM de unos 7,5 mil millones de parámetros en hardware Apple Silicon con un consumo de memoria muy reducido, manteniendo el tokenizador, la plantilla de chat y la configuración de generación del modelo original. Según la model card, está cualificado para chat de texto, tool calling y controles explícitos de razonamiento (thinking). La ventana de contexto declarada es de 65.536 tokens.

Es relevante ahora porque combina un checkpoint de NVIDIA con licencia OpenMDW 1.1 sobre una base Google Gemma 4 con Apache 2.0, y lo empaqueta en un formato nativo de MLX que hasta hace poco carecía de conversiones de este tipo. La conversión excluye explícitamente los tensores de visión y audio, el sidecar de KV compartida congelado y el drafter DFlash, por lo que el resultado es estrictamente texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; derivada de Google Gemma 4 (tag `gemma4`), pesos en formato MLX |
| Parámetros totales | 7.463.013.418 (7,46 mil millones) |
| Parámetros activos | No disponible; el sufijo comercial "E4B" no se describe en la información proporcionada y no se confirma si es un modelo MoE |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantización | 4 bits afín (affine), grupo de 64; solo se publica la variante 4-bit |
| Idiomas soportados | No disponible (el campo de idiomas del repo está vacío) |
| Licencia | OpenMDW 1.1 para el modelo; la base Google Gemma 4 subyacente usa Apache 2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 4,2 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del checkpoint original de NVIDIA: no se especifica si es un transformer denso, un mixture-of-experts o una variante híbrida, ni se documentan el número de tokens de entrenamiento, la composición del corpus o las fases de alineación (RLHF, DPO u otras). Lo único confirmado es que el modelo base es `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`, que la familia se apoya en Google Gemma 4 según la etiqueta `gemma4`, y que el creador del modelo es NVIDIA.

Lo que sí está documentado es el proceso de conversión, que constituye la aportación real de este repositorio. Se aplicó cuantización afín de 4 bits con tamaño de grupo 64 sobre los pesos BF16, usando mlx-lm 0.31.3 y MLX 0.32.4 ejecutándose en GPU. Se preservaron el tokenizador, la plantilla de chat y la configuración de generación del original. Se excluyeron los tensores de visión y audio, el sidecar de KV compartida congelado (no utilizado) y el drafter DFlash, de modo que no hay decodificación especulativa incluida en este paquete.

## Capacidades

- Generación de texto conversacional en modo chat, con plantilla de chat preservada del modelo original.
- Tool calling / function calling: la model card lo declara explícitamente cualificado para ello.
- Controles explícitos de razonamiento (thinking): el modelo admite activar y desactivar el modo de pensamiento.
- Razonamiento multi-paso orientado a agentes, derivado del soporte de tool calling y de los controles de thinking.
- Procesamiento de contextos largos de hasta 65.536 tokens en una sola ventana.
- Ejecución local en Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- Capacidades multimodales: no disponibles; los tensores de visión y audio fueron excluidos en la conversión.
- Cobertura multilingüe: no disponible; no se documentan los idiomas soportados.

## Casos de uso

- Asistente de chat privado en Mac: con 4,2 GB de pesos y 65.536 tokens de contexto, el modelo puede ejecutarse íntegramente en local en un portátil Apple Silicon, sin enviar datos a terceros, lo que encaja en entornos con requisitos de confidencialidad.
- Agente con tool calling en local: al soportar function calling, puede conectarse a APIs internas, bases de datos o al sistema de ficheros mediante un orquestador, y resolver tareas multi-paso sin salir del equipo.
- Razonamiento con control de coste: el modo thinking explícito permite activar la deliberación solo en consultas complejas y desactivarla en tareas triviales, reduciendo latencia y consumo en producción.
- Análisis de documentación extensa: la ventana de 65.536 tokens permite introducir contratos, informes o expedientes completos y hacer preguntas sobre ellos sin trocear el texto en exceso.
- Prototipado rápido de aplicaciones LLM: al estar en formato MLX y cargarse con mlx-lm, sirve para validar prompts, plantillas de chat y flujos de herramientas en un ciclo de iteración corto antes de migrar a un despliegue en servidor.
- Generación y revisión de código en el editor: el modelo puede integrarse en asistentes locales tipo plugin para autocompletar, explicar o refactorizar fragmentos, manteniendo el código fuente fuera de servicios externos.
- Automatización de extracción de datos estructurados: con tool calling y contexto largo, puede procesar lotes de textos y emitir llamadas a funciones con los campos extraídos, integrándose en un pipeline de ETL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y tampoco se documenta la degradación de calidad introducida por la cuantización de 4 bits respecto al checkpoint BF16.

## Requisitos de hardware

- Pesos: 4,2 GB en disco para la variante 4-bit; el checkpoint BF16 original ocuparía aproximadamente el doble o más, aunque no se dispone del dato exacto.
- VRAM/memoria: al ser MLX, se utiliza memoria unificada. Se recomienda un mínimo de 16 GB en el equipo; 24-32 GB dejan margen para caché KV con contextos largos. No se dispone de una cifra oficial de memoria por token de contexto.
- GPU compatibles: la pila MLX solo se ejecuta en Apple Silicon (series M1, M2, M3, M4 y posteriores). No es compatible con CUDA, por lo que A100, H100 o RTX 4090 no pueden usar este repositorio tal cual; para esas GPU habría que recurrir al checkpoint BF16 original o a conversiones GGUF.
- Cabe en hardware de consumo: sí, en cualquier Mac con al menos 16 GB de memoria unificada.
- Despliegue: mlx-lm (carga directa y servidor HTTP), MLX como runtime subyacente y LM Studio para uso con interfaz gráfica. No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama para este formato.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rapid-mlx/NVIDIA-Nemotron-3.5-Bolt-E4B-MLX-4bit | 7,46 mil millones | 65.536 | MLX safetensors, 4-bit grupo 64 | OpenMDW 1.1 (base Apache 2.0) | HuggingFace, 0 descargas |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 | No disponible (mismo modelo en BF16) | No disponible | safetensors BF16 | OpenMDW 1.1 (base Apache 2.0) | HuggingFace (modelo base) |
| Otras conversiones comunitarias de Nemotron 3.5 Bolt | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de la misma categoría en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad, razonamiento o tasa de acierto en tool calling, lo que impide validar afirmaciones de rendimiento antes de un despliegue.
- Cuantización de 4 bits: la compresión afín con grupo 64 introduce pérdida de precisión respecto al BF16; no se documenta la magnitud de esa degradación ni en perplejidad ni en tareas concretas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, publicado por un tercero no verificado y no por NVIDIA. Conviene auditar los pesos y el proceso antes de usarlo en producción.
- Dependencia de plataforma: al ser MLX, queda restringido a Apple Silicon; no hay ruta de despliegue en GPU NVIDIA o AMD con este formato.
- Solo texto: visión y audio fueron eliminados deliberadamente de la conversión, así que no debe esperarse ninguna capacidad multimodal del modelo base.
- Idiomas no documentados: el campo de idiomas está vacío, por lo que no hay garantía de calidad fuera del inglés ni de cobertura del castellano.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no se documentan mitigaciones ni evaluaciones de fidelidad.
- Sesgos: no se publica información sobre la composición del corpus de entrenamiento ni sobre auditorías de sesgo, de modo que no pueden caracterizarse.
- Licencia: OpenMDW 1.1 con una base Apache 2.0. Es una licencia de términos propios, no equivalente a Apache 2.0, y debe revisarse antes de un uso comercial; el repositorio incluye `LICENSE.txt` y `LICENSE-BASE.txt`.
- Sin decodificación especulativa: el drafter DFlash no está incluido, por lo que se renuncia a la aceleración que sí podría ofrecer el paquete original.
- Fecha de publicación en metadatos (23 de octubre de 2026) posterior a la del modelo base declarado; conviene verificar la procedencia y la integridad del checkpoint.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rapid-mlx/NVIDIA-Nemotron-3.5-Bolt-E4B-MLX-4bit
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- mlx-lm (librería de conversión e inferencia): https://github.com/ml-explore/mlx-lm
- MLX (runtime de Apple): https://github.com/ml-explore/mlx

Nota: las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces anteriores son los únicos verificables en la información proporcionada. No se dispone de papers, blogs, repositorios de código ni demos adicionales.
