# proofofvitalik/Sovereign-V2-MLX-Q4-Companion

## Resumen

Sovereign V2 MLX + Companion es una distribución del modelo Heretic ARA 27B (derivado de la familia Qwen3.5) empaquetada específicamente para su ejecución local en Apple Silicon mediante el motor MLX de LM Studio. El autor, `proofofvitalik`, publica los pesos en formato MLX con cuantización 4-bit para el componente de texto y BF16 para el de visión, lo que permite desplegar un modelo de aproximadamente 27.000 millones de parámetros en equipos Mac con memoria unificada, sin depender de GPUs dedicadas ni de servicios en la nube.

El paquete resuelve un problema concreto: llevar un modelo multimodal de gran tamaño (texto e imagen) a un flujo de trabajo local en macOS, con una plantilla de chat que desactiva el modo de razonamiento por defecto y con la posibilidad de habilitarlo explícitamente desde el cliente. Incluye además un componente opcional llamado Companion, distribuido como código fuente, que añade herramientas de reparación de código Python, validación de sintaxis e imports, y controles de tareas, siempre que se instale un host Hermes compatible de forma separada.

Es relevante porque combina tres piezas poco habituales juntas: cuantización MLX de 4 bits para un modelo de 27B, soporte de visión en BF16 y un andamiaje de agentes con tool calling. No obstante, el propio autor advierte que las pruebas se han limitado a un M4 Max de 48 GB con macOS 26.6.2 y LM Studio 1.14.0, y que no se ha validado una instalación limpia ni equipos con menos memoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5, tag `qwen3_5`); componente de texto en 4-bit y visión en BF16 |
| Parámetros totales | 26.895.993.856 (~26,9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (configuración recomendada por el autor para Companion; no se ha probado un prompt completo de esa longitud) |
| Tipos de cuantización | 4-bit (texto, MLX), BF16 (visión); incluye un draft MTP nativo para runtimes experimentales compatibles |
| Idiomas soportados | inglés (en), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX; tamaño del repo 16,9 GB; ~16,07 GB en disco según LM Studio |

## Arquitectura y entrenamiento

El modelo se presenta como un transformer multimodal de la familia Qwen3.5, con un componente de texto cuantizado a 4 bits en formato MLX y un componente de visión en BF16. Incluye un draft MTP (multi-token prediction) nativo pensado para runtimes experimentales compatibles, lo que sugiere decodificación especulativa en entornos que lo soporten. El pipeline declarado es `image-text-to-text`, por lo que acepta entradas conjuntas de imagen y texto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. El modelo base es `heretic-org/Qwen3.8-27B-heretic-ara`, y la model card no detalla el proceso de ajuste aplicado por el autor original ni el empaquetado posterior en MLX. La plantilla de chat incluida desactiva el modo de pensamiento por defecto, lo que sugiere que el modelo base soporta razonamiento explícito y que el autor ha optado por respuestas directas salvo activación manual.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y ruso.
- Razonamiento sobre contenido de imágenes: el pipeline `image-text-to-text` permite combinar diagramas, tablas y gráficos con preguntas en lenguaje natural.
- Modo de razonamiento opcional: la plantilla de chat lo desactiva por defecto y los clientes compatibles pueden habilitarlo explícitamente.
- Tool calling / function calling: la model card menciona soporte de herramientas a través de un host Hermes compatible y del componente Companion.
- Flujos de agentes: Companion puede ejecutar herramientas habilitadas y devolver los resultados al modelo; el modelo por sí solo no ejecuta código.
- Reparación de código Python: la herramienta Compact Repair propone ediciones puntuales, valida el candidato y escribe una copia nueva preservando el original.
- Validación de código: Code Guard comprueba sintaxis, imports aislados y puede ejecutar tests proporcionados.
- Integraciones de investigación opcionales que recuperan información externa; algunas requieren credenciales y envían peticiones a sus proveedores.
- Control de tareas y perfiles para organizar flujos de trabajo y seleccionar conjuntos de herramientas habilitadas.

## Casos de uso

- Asistente local de análisis de documentos técnicos en macOS: el modelo puede recibir capturas de diagramas de dependencias, tablas de servicios y gráficos de latencia, y responder preguntas que exigen distinguir servicios opcionales de la ruta crítica, como en la demo de revisión de release incluida por el autor.
- Reparación de código en un portátil sin conexión: con Companion y un host Hermes compatible, el modelo propone parches puntuales sobre scripts Python, valida sintaxis e imports, y genera una copia corregida sin tocar el original, lo que encaja en entornos con requisitos de privacidad.
- Automatización de revisión de código en CI local: Code Guard puede ejecutar tests suministrados y devolver el resultado al modelo para que razone sobre fallos, integrándose en un pipeline que corre en el propio Mac del desarrollador.
- Atención al cliente y soporte interno en inglés o ruso: la ventana de 65.536 tokens permite mantener conversaciones largas con historial extenso, aunque el autor no ha validado prompts que ocupen toda la ventana.
- Extracción de información de imágenes en flujos de investigación: combinando la entrada de imagen con las integraciones de investigación opcionales, se pueden procesar capturas de pantalla o documentos escaneados y contrastarlos con fuentes externas.
- Prototipado de agentes con tool calling en local: el paquete permite montar un agente que llame a herramientas habilitadas y reciba sus resultados, útil para validar diseños de agentes antes de migrar a infraestructura cloud.
- Traducción y redacción bilingüe inglés-ruso: el modelo declara soporte para ambos idiomas, adecuado para equipos que trabajan con documentación en esas dos lenguas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona verificaciones acotadas (una llamada de estado a herramienta y dos flujos de código) y una auditoría de visión separada, pero no ofrece puntuaciones en MMLU, HumanEval, GSM8K ni métricas comparables.

## Requisitos de hardware

- VRAM/memoria unificada: el modelo ocupa aproximadamente 16,07 GB en disco según LM Studio; el autor no establece el mínimo de memoria para este paquete de 27B y advierte que la recomendación general de 16 GB de LM Studio no es un requisito de memoria para este modelo.
- Hardware probado: Apple Silicon M4 Max con 48 GB de memoria unificada y macOS 26.6.2.
- No probado: macOS anteriores, Macs con menos memoria y una instalación limpia de primera vez.
- GPU dedicadas: no aplica; el formato es MLX y está orientado a Apple Silicon. No hay información sobre ejecución en A100, H100 o RTX 4090.
- Despliegue: LM Studio con motor MLX (versión probada 1.14.0), API local en `http://127.0.0.1:1234/v1`. Para Companion se requiere un host Hermes compatible instalado por separado y al menos 64.000 tokens de contexto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato/plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sovereign V2 MLX Q4 Companion | ~26,9B | 65.536 tokens (recomendado) | MLX, Apple Silicon | Apache 2.0 | Hugging Face, repo de 16,9 GB |
| Modelo base `heretic-org/Qwen3.8-27B-heretic-ara` | ~27B (según nombre) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre modelos comparables de la misma categoría (27B multimodal con soporte MLX) para establecer una comparación rigurosa de rendimiento o licencia.

## Limitaciones y advertencias

- Validación muy limitada: solo se ha probado en un M4 Max de 48 GB con macOS 26.6.2 y LM Studio 1.14.0; instalaciones limpias, macOS anteriores y equipos con menos memoria no han sido verificados.
- El mínimo de memoria para ejecutar el paquete de 27B no está establecido por el autor.
- Un prompt completo de 65.536 tokens no ha sido probado, aunque Hermes exige al menos 64.000 tokens de contexto.
- Las demos de vídeo se grabaron con la release Splash/Desktop, no con esta build MLX; los resultados MLX se reportan por separado y solo cubren una llamada de herramienta y dos flujos de código.
- Companion es una distribución de código fuente, no la aplicación de escritorio Hermes, y requiere un host compatible instalado aparte con sus propias dependencias.
- El modelo por sí solo no ejecuta código; la ejecución depende de herramientas externas habilitadas.
- Las integraciones de investigación opcionales pueden enviar datos a proveedores externos y algunas requieren credenciales, lo que afecta a la privacidad del flujo local.
- Idiomas limitados a inglés y ruso; no se declara soporte de castellano.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni tasas de alucinación en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus posibles restricciones no se detallan en la información proporcionada; conviene verificar la licencia del modelo base antes de producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- [Hugging Face: proofofvitalik/Sovereign-V2-MLX-Q4-Companion](https://huggingface.co/proofofvitalik/Sovereign-V2-MLX-Q4-Companion)
- [Modelo base: heretic-org/Qwen3.8-27B-heretic-ara](https://huggingface.co/heretic-org/Qwen3.8-27B-heretic-ara)
- [LM Studio](https://lmstudio.ai/)
- [Vídeo de demostración: Compact Repair + Code Guard](https://huggingface.co/proofofvitalik/Sovereign-Uncensored-ARA-27B-Splash-Q4-v2.0.1-rc2/resolve/main/demos/01-compact-repair-code-guard.mp4)
- [Vídeo de demostración: visión, revisión de release](https://huggingface.co/proofofvitalik/Sovereign-Uncensored-ARA-27B-Splash-Q4-v2.0.1-rc2/resolve/main/demos/05-rc2-vision.mp4)
- [Archivo de Companion 0.3.5.4 MLX RC1](release/Sovereign-Companion-0.3.5.4-mlx-rc1.zip)
- [Documentación de Companion (COMPANION.md)](COMPANION.md)
- [Auditoría de visión (VISION-AUDIT.md)](VISION-AUDIT.md)
