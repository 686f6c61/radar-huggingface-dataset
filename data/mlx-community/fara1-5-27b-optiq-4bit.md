# mlx-community/Fara1.5-27B-OptiQ-4bit

## Resumen

Fara1.5-27B-OptiQ-4bit es una cuantización mixta de precisión (4/8 bits) en formato MLX del modelo microsoft/Fara1.5-27B, un modelo de visión-lenguaje orientado a uso de ordenador y agentes web, construido sobre la arquitectura Qwen3.5. La publica el colectivo mlx-community utilizando la herramienta mlx-optiq, un conjunto de utilidades nativas de MLX para cuantizar, ajustar y servir modelos localmente en Apple Silicon sin depender de PyTorch ni de infraestructura en la nube.

El modelo resuelve el problema de ejecutar un VLM agéntico de casi 27 000 millones de parámetros en hardware de Apple con un consumo de disco de aproximadamente 20 GB, gracias a una asignación de bits por capa de 4,74 bits por peso de media. La torre de visión se mantiene en bf16 para preservar la calidad de la ruta de imagen, mientras que el resto del modelo se cuantiza con una política transferida directamente de la cuantización publicada de Qwen3.5-27B, dado que Fara1.5 comparte arquitectura exacta con esa familia.

Es relevante ahora porque permite desplegar en un Mac un agente visual capaz de interpretar capturas de pantalla y actuar sobre interfaces web o de escritorio, una tarea que hasta hace poco requería GPUs de centro de datos. La licencia MIT y la compatibilidad con mlx-lm (solo texto) y mlx-optiq (texto, visión y MTP) facilitan su integración en prototipos y flujos locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5, con torre de visión (image-text-to-text) |
| Parametros totales | 26.895.993.856 (26,9 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | OptiQ mixta 4/8 bits, 4,74 bits por peso; torre de visión en bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX); vision tower en `optiq/optiq_vision.safetensors` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de Fara1.5-27B más allá de que es un ajuste fino de Qwen3.5-27B con arquitectura idéntica y que incorpora una torre de visión para entrada image-text-to-text. Al tratarse de un transformer denso de 26,9 mil millones de parámetros, no hay mezcla de expertos ni parámetros activos condicionales. La model card menciona soporte de MTP (multi-token prediction) en el cargador mlx-optiq, lo que sugiere que el modelo base incluye cabezas de predicción multi-token, aunque no se especifican detalles de entrenamiento.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO en el modelo original de Microsoft. La cuantización OptiQ, por su parte, no realiza un pase de sensibilidad propio: transfiere la asignación de bits por capa desde `mlx-community/Qwen3.5-27B-OptiQ-4bit`, aprovechando que Fara1.5 es un finetune de Qwen3.5-27B sin cambios arquitectónicos. La innovación principal de este artefacto es, por tanto, la cuantización mixta con preservación de la torre de visión en bf16, que permite cargar el modelo completo (imagen y texto) en un único repositorio.

## Capacidades

- Generación de texto conversacional en inglés.
- Comprensión de imágenes mediante pipeline image-text-to-text, orientada a capturas de pantalla e interfaces.
- Uso de ordenador (computer-use): interpretación de pantallas y emisión de acciones sobre interfaces gráficas.
- Agente web: navegación y automatización de tareas en páginas web.
- Razonamiento multi-paso en el contexto de agentes.
- Soporte de predicción multi-token (MTP) bajo el cargador mlx-optiq.
- Servicio mediante endpoint compatible con la API de OpenAI (`http://localhost:8000/v1`) con partes `image_url`.
- No se documentan capacidades de tool calling explícitas, audio ni otros modos adicionales en la información disponible.

## Casos de uso

- Automatización de tareas web: el modelo puede recibir capturas de pantalla de un navegador y decidir la siguiente acción (clic, escritura, navegación), lo que permite construir agentes que rellenen formularios o consulten portales sin API.
- Asistentes de escritorio locales: al ejecutarse en Apple Silicon con unos 20 GB en disco, se puede integrar en un Mac para guiar al usuario a través de aplicaciones nativas interpretando la pantalla en cada paso.
- Pruebas de regresión de interfaz: un agente visual puede recorrer flujos de una aplicación, verificar estados de pantalla y detectar regresiones de UI sin scripts frágiles basados en selectores.
- Extracción de datos de capturas: el pipeline image-text-to-text permite convertir información visible en pantallas o documentos escaneados en texto estructurado dentro de un flujo local.
- Prototipado de agentes en investigación: la licencia MIT y la ejecución sin nube facilitan experimentos reproducibles con modelos agénticos multimodales en entornos controlados.
- Soporte técnico asistido por visión: el modelo puede analizar una captura del problema del usuario y proponer pasos concretos, aprovechando su entrenamiento específico en uso de ordenador.
- Servicio local con API compatible con OpenAI: mediante `optiq serve` se puede exponer el modelo a herramientas existentes que ya consumen la interfaz de OpenAI, incluyendo entradas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 21,3 GB y la cuantización declara unos 20 GB en disco a 4,74 bits por peso; se recomienda al menos 24 GB de memoria unificada para cargar el modelo completo con visión, y margen adicional para el contexto y las activaciones.
- Hardware objetivo: Apple Silicon (MLX). No se documenta soporte para GPU NVIDIA ni CUDA.
- GPU de consumo: encaja en equipos Apple con 32 GB o más de memoria unificada; en configuraciones de 24 GB el margen es ajustado y puede requerir reducir contexto.
- Despliegue: `optiq serve` (mlx-optiq) para texto, visión y MTP; `mlx-lm` estándar solo para la ruta de texto. Otros frontends dependen de su propio soporte de pesos MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fara1.5-27B-OptiQ-4bit (este) | 26,9 B | No disponible | Imagen + texto | MIT | MLX (mlx-optiq / mlx-lm texto) |
| microsoft/Fara1.5-27B | No disponible | No disponible | Imagen + texto | No disponible en la informacion | Pesos originales en Hugging Face |
| mlx-community/Qwen3.5-27B-OptiQ-4bit | ~27 B | No disponible | Texto | No disponible en la informacion | MLX |
| Qwen3.5-27B (base) | ~27 B | No disponible | Texto | No disponible en la informacion | Multiples formatos |

La comparación se limita a la familia Qwen3.5 por compartir arquitectura; no se dispone de datos de rendimiento comparativo ni de especificaciones de contexto para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Idioma: el modelo declara únicamente inglés; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: como VLM agéntico, puede interpretar incorrectamente elementos de una captura y emitir acciones erróneas; en automatización real conviene validar cada paso.
- La cuantización a 4,74 bits introduce pérdida de precisión respecto al modelo original en bf16; no se han publicado evaluaciones del impacto en tareas de computer-use.
- La ruta de visión solo está soportada por mlx-optiq; con mlx-lm estándar el modelo funciona únicamente como texto.
- Dependencia del ecosistema Apple/MLX: no hay soporte documentado para CUDA ni para servidores con GPU tradicionales.
- No se documentan sesgos específicos, pero al ser un finetune de un modelo entrenado mayoritariamente en inglés y datos web, es previsible que herede sesgos de esa distribución.
- La licencia MIT permite uso comercial, pero debe verificarse la licencia del modelo base microsoft/Fara1.5-27B, no incluida en la información disponible.
- El contexto máximo no está documentado, lo que dificulta dimensionar memoria para conversaciones o capturas de pantalla extensas.

## Enlaces

- [mlx-community/Fara1.5-27B-OptiQ-4bit en Hugging Face](https://huggingface.co/mlx-community/Fara1.5-27B-OptiQ-4bit)
- [microsoft/Fara1.5-27B (modelo base)](https://huggingface.co/microsoft/Fara1.5-27B)
- [mlx-community/Qwen3.5-27B-OptiQ-4bit (origen de la asignación de bits)](https://huggingface.co/mlx-community/Qwen3.5-27B-OptiQ-4bit)
- [mlx-optiq](https://mlx-optiq.com)
- [Documentación de mlx-optiq](https://mlx-optiq.com/docs/)
- [mlx-optiq Lab](https://mlx-optiq.com/docs/lab/)
- [Catálogo de cuantizaciones OptiQ](https://mlx-optiq.com/models)
- [mlx-lm](https://github.com/ml-explore/mlx-lm)
