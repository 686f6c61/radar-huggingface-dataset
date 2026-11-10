# shgao/rsi-jev-v7.0-vl-3b-mlx-4bit

## Resumen

RSI-Jev v7.0-VL 3B es un modelo multimodal de decisión ("decision model") desarrollado por Shanghua Gao, distribuido en formato MLX de 4 bits para Apple Silicon. No es un modelo generativo al uso: emite decisiones tipadas (typed decisions) con salida temprana (early-exit) en las capas 16 y 20, orientado a tareas de clasificación y respuesta binaria o de opción múltiple sobre texto e imágenes. La variante aquí descrita es una cuantización GPTQ del release bf16 original, pensada para ejecutarse en Macs sin necesidad de PyTorch.

El modelo parte de una arquitectura híbrida con capas DeltaNet (atención lineal con estado recurrente) y un vision tower multimodal, con 3B parámetros en el release bf16. La cuantización reduce la descarga de 6,8 GB a 1,70 GB (más 0,21 GB adicionales para el tower visual la primera vez que se envía una imagen), manteniendo una concordancia del 96,5-97,5% con el release bf16 en una muestra de 200 preguntas, y del 100% en las 20 preguntas con imagen.

Su relevancia práctica radica en el despliegue local eficiente: en un M2 Max (34 GB) responde una pregunta corta en 67-84 ms según el nivel de esfuerzo, con un consumo de memoria de pesos de 1,7 GB. Está pensado para integrarse en pipelines de decisión automatizada (CI/CD, filtrado, VQA) más que para generación de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida con capas DeltaNet (atención lineal) y vision tower; cabezas de decisión con early-exit en capas 16 y 20 |
| Parametros totales | 3B (release bf16); esta build cuantizada ocupa 1,70 GB + 0,21 GB del vision tower |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de procesamiento por piezas de 4.096 tokens en cada capa DeltaNet con estado arrastrado; se han probado documentos de 1k, 8k y 32k tokens |
| Tipos de cuantizacion | 4-bit GPTQ (grupos de 32) en capas lineales del decoder y vision tower; 2-bit (grupos de 64, RTN) en embeddings; 8-bit (grupos de 64, fp32) en cabezas de decisión; fp32 en temperaturas y umbrales |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX); tokenizer congelado en JSON propio sin `transformers` |

## Arquitectura y entrenamiento

La información disponible describe una arquitectura con capas DeltaNet que procesan entradas largas en fragmentos de 4.096 tokens arrastrando estado entre fragmentos, lo que permite manejar documentos de 32k tokens con un pico de memoria de 5,54 GB. El modelo incorpora un vision tower multimodal (4-bit en esta build) y dos cabezas de decisión situadas en las capas 16 y 20, que permiten salida temprana cuando la confianza es suficiente. Cada salida tiene su propia temperatura calibrada y umbrales para el modo `auto`.

La cuantización se realizó con GPTQ (Frantar et al., 2022, arXiv:2210.17323), calibrada sobre preguntas de desarrollo que no forman parte de ningún conjunto de evaluación. Se probaron cuatro layouts entre 2,27 y 1,82 GB; el de 1,82 GB perdía 0,97 puntos en el Decision Index, por lo que se eligió el de 1,70 GB con una pérdida de 0,65. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO; la model card remite al registro del release bf16 para esos detalles.

## Capacidades

- Decisión tipada sobre texto: respuestas binarias (sí/no) y selección entre opciones numeradas (evaluado en CLINC150 con 151 opciones).
- Visual question answering: responde preguntas sobre imágenes con el vision tower de 4 bits.
- Salida temprana configurable con niveles de esfuerzo `low`, `medium`, `high` y `auto`, que ajustan latencia y precisión.
- Procesamiento de documentos largos (probado hasta 32k tokens) mediante fragmentación con estado arrastrado en capas DeltaNet.
- Modo servidor local vía `rsi-jev serve v7.0-vl-3b-mlx-4bit`.
- Integración CLI (`decide`) para uso en scripts y pipelines.
- No se documentan tool calling, function calling, agentes multi-paso ni modo thinking explícito.

## Casos de uso

- Validación de builds en CI/CD: el ejemplo oficial usa `echo 'The build failed on line 3.' | decide 'Did the build pass?'` para obtener una decisión binaria con latencia de decenas de milisegundos, adecuada para gates automáticos en pipelines.
- Clasificación de tickets o mensajes de soporte: con 151 opciones numeradas y una tasa de error de salto de opción inferior al 1,67% en CLINC150, puede enrutar consultas a la categoría correcta en local.
- Filtrado y triaje de documentos largos: procesa documentos de 1k a 32k tokens (1,4-2,3 s a 13 s a 52 s respectivamente en M2 Max) para decidir si requieren revisión humana.
- VQA en aplicaciones de escritorio en Mac: con 0,21 GB adicionales de vision tower y latencias de 67-84 ms en preguntas cortas, permite responder preguntas sobre capturas o imágenes sin salir del equipo.
- Asistentes locales con privacidad estricta: al ejecutarse íntegramente en Apple Silicon sin PyTorch ni llamadas a la nube, es apto para entornos donde los datos no pueden salir del dispositivo.
- Automatización de decisiones en scripts de shell: la CLI `decide` devuelve código de salida utilizable directamente en condicionales, lo que simplifica la integración en herramientas de línea de comandos.
- Moderación o verificación de contenido multimodal: combinación de texto e imagen en una sola llamada para decidir si un contenido cumple una política definida.

## Benchmarks y rendimiento

| Metrica | bf16 release | Esta build (MLX 4-bit) |
|---|---|---|
| Decision Index 0.2.1 (muestra de 16k preguntas) | 59,15 | 58,50 (−0,65) |
| Concordancia con bf16, 200 preguntas (Mac) | — | 96,5% (`low`), 97,5% (`medium`, `high`, `auto`) |
| Concordancia con bf16, 20 preguntas con imagen | — | 20 de 20 |
| Tasa de selección de la opción siguiente en CLINC150 (151 opciones) | — | ≤ 1,67% |
| Latencia pregunta corta (M2 Max) | — | 67-68 ms (`low`), 68-74 ms (`auto`), 83-84 ms (`medium`, `high`) |
| Latencia documento 1k / 8k / 32k tokens | — | 1,4-2,3 s / 13 s / 52 s |
| Memoria pico 1k / 8k / 32k tokens | — | 3,05 / 3,59 / 5,54 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Apple Silicon obligatorio, macOS 14 o superior; no funciona en GPU NVIDIA ni CPU x86.
- Memoria de pesos: 1,7 GB (aproximadamente 1,9 GB con imágenes).
- Memoria pico medida en M2 Max (34 GB): 3,05 GB con documentos de 1k tokens, 3,59 GB con 8k y 5,54 GB con 32k.
- Cabe en cualquier Mac con Apple Silicon y al menos 8 GB de RAM unificada para preguntas cortas; para documentos de 32k se recomienda 16 GB o más.
- Despliegue mediante MLX, la CLI `decide`, el servidor `rsi-jev serve`, Homebrew (`brew install shanghua-gao/tap/decideit`) o pip (`pip install decideit`).
- No requiere PyTorch ni `transformers` en tiempo de ejecución.
- Throughput no documentado más allá de las latencias por pregunta indicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| RSI-Jev v7.0-VL 3B MLX 4-bit | 3B | 32k (probado) | MLX, Apple Silicon | apache-2.0 | Decision model con early-exit; 1,70 GB |
| RSI-Jev v7.0-VL 3B (bf16) | 3B | 32k (probado) | safetensors, GPU | apache-2.0 | Release de referencia; 6,8 GB; Decision Index 59,15 |
| Otros VQA de ~3B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Aproximadamente una de cada treinta respuestas difiere del release bf16, y el Decision Index cae 0,65 puntos; el propio autor recomienda usar el release en GPU.
- Requiere Apple Silicon y macOS 14 o superior; no es portable a otras plataformas.
- Los documentos largos son lentos: un documento de 32k tokens tarda alrededor de un minuto.
- El modelo está diseñado para decisiones tipadas, no para generación de texto libre; su uso fuera de ese dominio no está documentado.
- Idiomas soportados no disponibles; no se puede confirmar cobertura multilingüe.
- Riesgo de alucinación y sesgos no cuantificado en la información disponible.
- La licencia apache-2.0 permite uso comercial, pero las condiciones del dataset de entrenamiento y calibración se remiten al registro del release bf16.
- La calibración GPTQ se hizo sobre preguntas de desarrollo fuera de los conjuntos de evaluación, lo que mitiga pero no elimina el sesgo de calibración.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/shgao/rsi-jev-v7.0-vl-3b-mlx-4bit
- Modelo base bf16: https://huggingface.co/shgao/rsi-jev-v7.0-vl-3b
- Repositorio GitHub: https://github.com/Shanghua-Gao/RSI-Jev
- Registro de la versión v7.0-VL 3B: https://github.com/Shanghua-Gao/RSI-Jev/blob/main/versions/v7.0-vl-3b.md
- Instalador: https://github.com/Shanghua-Gao/RSI-Jev/releases/latest/download/install.sh
- MLX: https://github.com/ml-explore/mlx
- Paper GPTQ (Frantar et al., 2022): https://arxiv.org/abs/2210.17323
