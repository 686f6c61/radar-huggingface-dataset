# GreenBitAI/Terza-27B-Agent-gbx

## Resumen

Terza-27B-Agent-gbx es un modelo de lenguaje de 27.359.638.768 parámetros (≈27,36 mil millones) publicado por GreenBit AI con pesos ternarios, orientado a tareas de agente de terminal y de programación de horizonte largo. Se obtiene por post-entrenamiento a partir de Prism ML Bonsai 2 27B (prism-ml/Ternary-Bonsai-2-27B-mlx-2bit) y conserva el formato, el tamaño y el runtime de GreenBitAI/Ternary-Bonsai-2-27B-gbx, incluida la cabeza de decodificación especulativa en `mtp/`, por lo que funciona como reemplazo directo en gbx-lm. El artefacto ocupa 8,6 GB en disco (8,8 GB de repositorio), lo que permite ejecutar un modelo de 27B en memoria unificada de un Mac Apple Silicon o en una NVIDIA DGX Spark.

La relevancia del modelo está en su relación entre precisión y huella: según la model card, resuelve el 35,2 % de las tareas de Terminal-Bench 2.1 en pass@1 frente al 26,6 % del Bonsai 2 del que parte y el 44,6 % de un Qwen3.8-27B en BF16, con el mismo tamaño de 8,6 GB que el modelo base ternario. Es, por tanto, un intento de acercar un agente de terminal cuantizado a baja precisión al comportamiento de un modelo de 27B en precisión completa, manteniendo la velocidad de decodificación gracias a la decodificación especulativa.

El modelo es multimodal entrada (pipeline `image-text-to-text`): procesa imágenes y texto mediante la torre de visión que Prism ML incluye. Se distribuye con licencia Apache 2.0, requiere gbx-lm v0.8.4 o superior y expone una API compatible con OpenAI, además de las rutas específicas para Codex (`/v1/responses`) y Claude Code (`/v1/messages`). El soporte de hardware es, hoy, muy restringido: macOS 15 o superior sobre Apple Silicon y Linux sobre DGX Spark (GB10).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explícita. Los tags (`prism_hadamard_qwen35`) apuntan a una familia tipo Qwen3.5 con rotación de Hadamard para la cuantización ternaria; el modelo base es Prism ML Ternary-Bonsai-2-27B. Sin confirmación en la información disponible |
| Parametros totales | 27.359.638.768 (≈27,36 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (la model card reporta pruebas con prompts de hasta 33k tokens, sin declarar la ventana máxima) |
| Tipos de cuantizacion | Pesos ternarios en formato gbx; modelo base en MLX 2-bit. No se documentan otros niveles de cuantización |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería MLX; runtime propietario gbx-lm) |

Otros datos: tamaño del repositorio 8,8 GB; pesos en disco 8,6 GB; memoria necesaria en ejecución ≈10 GB incluyendo la cabeza de draft, más la caché de la conversación; pipeline declarado `image-text-to-text`.

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un transformer de 27B con pesos ternarios, derivado de Prism ML Ternary-Bonsai-2-27B, que a su vez procede de la familia Qwen3.5 según el tag `prism_hadamard_qwen35`. El sufijo "hadamard" sugiere el uso de rotaciones de Hadamard para reducir el error de cuantización ternaria, pero la model card no lo describe. Tampoco se especifican número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO. Lo que sí se explicita es el post-entrenamiento por parte de GreenBit AI sobre el modelo base, con foco en trabajo de agente de terminal y de código de horizonte largo, y con modo de razonamiento activable.

El modelo incorpora dos elementos técnicos destacables. El primero es una cabeza de decodificación especulativa en el directorio `mtp/`, que acepta tantas propuestas como la del Bonsai 2 y produce la misma aceleración: en un Mac Studio M2 Ultra, con decodificación greedy y 2.048 tokens generados, la velocidad pasa de 62 tokens/s a 103 tokens/s en código y matemáticas, 79 en chat, 110 en prosa y 74 tras un prompt de 33k tokens. El segundo es un modo de pensamiento con esfuerzo configurable (`low`, `medium`, `xhigh`), que en las tareas más difíciles puede generar decenas de miles de tokens de razonamiento antes de actuar; las evaluaciones publicadas se hicieron con thinking activado, temperatura 1.0, top-p 0.95 y top-k 20.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento activable por petición (`enable_thinking`) o por servidor (`GBX_ENABLE_THINKING=1`), con niveles de esfuerzo `low`, `medium` y `xhigh`.
- Ejecución de tareas de agente en terminal: la model card sitúa el modelo en el entorno Terminal-Bench 2.1 con el agente Terminus-2 y el harness Harbor.
- Generación y edición de código dentro de flujos de agente, incluyendo uso sostenido de herramientas a lo largo de muchas iteraciones.
- Entrada multimodal: lee imágenes además de texto mediante la torre de visión que acompaña al modelo.
- Compatibilidad con protocolos de agentes de código: API OpenAI (`/v1/chat/completions`), `/v1/responses` para Codex y `/v1/messages` para Claude Code, todo en el mismo puerto 11688.
- Decodificación especulativa mediante cabeza de draft, activable con `GBX_QWEN35_MTP=on`.
- Soporte de caché de sesión de agente entre turnos cuando el cliente devuelve el razonamiento del modelo (gbx-lm v0.8.4 o superior).
- Capacidades multilingües: no disponible (no se declaran idiomas).

## Casos de uso

- Agente de terminal autónomo: el modelo está post-entrenado para Terminal-Bench, de modo que puede encadenar comandos, leer salidas y corregir el rumbo en tareas de administración de sistemas o configuración de entornos, con razonamiento previo a cada acción.
- Automatización de tareas de refactorización en un repositorio: sirviendo el modelo con gbx-lm y conectándolo a Claude Code o Codex a través de `/v1/messages` o `/v1/responses`, el agente puede inspeccionar ficheros, aplicar parches y ejecutar tests en bucle.
- Asistente de codificación en estación de trabajo Apple Silicon: con 8,6 GB de pesos y unos 10 GB de memoria en ejecución, cabe en un Mac con memoria unificada de 16 GB o más, sin GPU dedicada ni toolkit CUDA.
- Inferencia en el borde o en dispositivos compactos: la NVIDIA DGX Spark (GB10) es el único Linux soportado, lo que permite desplegar el agente en una máquina de sobremesa de bajo consumo en lugar de un servidor con A100/H100.
- Procesamiento de documentación técnica con capturas o diagramas: al aceptar entrada de imagen y texto, puede interpretar una captura de pantalla de terminal o un diagrama de arquitectura junto con la pregunta en lenguaje natural.
- Prototipado de pipelines de agente con API compatible con OpenAI: cualquier cliente escrito contra la API de OpenAI funciona sin adaptadores, lo que reduce el coste de integrar el modelo en un framework de agentes existente.
- Evaluación comparativa de cuantización ternaria: útil en investigación para medir la degradación de un 27B ternario frente a BF16 en tareas de agente, usando el harness y la configuración publicados.
- Sustitución directa del Bonsai 2 ternario: al conservar formato, tamaño y runtime, se puede cambiar el modelo en un despliegue gbx-lm existente sin tocar la infraestructura.

## Benchmarks y rendimiento

Terminal-Bench 2.1, 89 tareas, tres ejecuciones por modelo, mismo harness (Harbor con agente Terminus-2), thinking activado, temperatura 1.0 / top-p 0.95 / top-k 20, límites de tiempo del agente ×3, servido con vLLM. Porcentaje de éxito:

| Modelo | Pass@1 | Pass@3 |
|---|---|---|
| Bonsai 2 27B | 26,6 | 38,2 |
| Terza-27B-Agent-gbx | 35,2 | 52,8 |
| Qwen3.8-27B (BF16) | 44,6 | 65,2 |

Velocidad de decodificación en tokens/s sobre Mac Studio (M2 Ultra), greedy, 2.048 tokens generados:

| Configuración | Código | Matemáticas | Chat | Prosa | Tras prompt de 33k tokens |
|---|---|---|---|---|---|
| Sin cabeza de draft | 62 | 62 | 62 | 62 | 47 |
| `GBX_QWEN35_MTP=on` | 103 | 103 | 79 | 110 | 74 |

Advertencia del autor: los núcleos de gbx-lm redondean de forma distinta y las puntuaciones de Terminal-Bench no se han vuelto a medir en gbx-lm, solo con vLLM. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks en la información disponible.

## Requisitos de hardware

- Memoria: aproximadamente 10 GB para pesos y cabeza de draft, más la caché de la conversación, que crece con el contexto (los prompts de 33k tokens ya se han probado).
- macOS: macOS 15.0 o superior sobre Apple Silicon (arm64). No existe build para Intel.
- Linux: únicamente NVIDIA DGX Spark (GB10), arm64, glibc 2.39 o superior (DGX OS / Ubuntu 24.04) y driver NVIDIA con soporte de CUDA 13. El binario incluye las librerías CUDA que usa; no hace falta el toolkit.
- GPU de consumo: no se documenta soporte para RTX 4090, RTX 3090 ni GPUs discretas convencionales; el único Linux soportado es GB10.
- Despliegue: exclusivamente mediante el binario gbx-lm (v0.8.4 o superior), que sirve una API compatible con OpenAI en el puerto 11688 y ofrece subcomandos `generate` y `chat`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato; vLLM solo se usó en la evaluación del autor.
- Latencia y throughput: 62 tokens/s sin draft y hasta 103-110 tokens/s con `GBX_QWEN35_MTP=on` en un M2 Ultra; 74 tokens/s tras un prompt de 33k tokens. No hay datos de prompt processing ni de rendimiento en DGX Spark en la información disponible, más allá de la referencia a la model card del modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Terminal-Bench 2.1 pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Terza-27B-Agent-gbx | 27,36 B (ternario, 8,6 GB) | no disponible | 35,2 | Apache 2.0 | HuggingFace, runtime gbx-lm |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit (modelo base) | 27 B (ternario, MLX 2-bit) | no disponible | 26,6 (Bonsai 2 27B) | no disponible en esta ficha | HuggingFace, MLX |
| GreenBitAI/Ternary-Bonsai-2-27B-gbx | 27 B (ternario, 8,6 GB) | no disponible | no disponible (mismo formato y runtime) | Apache 2.0 según el modelo que nos ocupa; verificar en su ficha | HuggingFace, gbx-lm |
| Qwen3.8-27B (BF16) | 27 B (BF16) | no disponible | 44,6 | no disponible en esta información | Referencia de precisión completa; requiere mucha más memoria |

La comparación relevante es de compromiso: Terza mejora en 8,6 puntos porcentuales el pass@1 de su base ternaria y queda 9,4 puntos por debajo del 27B en BF16, con una huella de disco de 8,6 GB frente a las decenas de GB que exigiría BF16. No hay datos publicados de otras alternativas ternarias o de 2 bits en Terminal-Bench dentro de la información disponible.

## Limitaciones y advertencias

- Trazabilidad limitada: el modelo tiene 2 descargas y 0 likes en el momento de la ficha, sin validación independiente de la comunidad.
- Los resultados de Terminal-Bench se midieron con vLLM y no se han replicado en gbx-lm, cuyos núcleos redondean de forma distinta; el rendimiento real en el runtime de despliegue puede diferir.
- La ventana de contexto no se declara; solo hay evidencia de funcionamiento con prompts de 33k tokens. Planificar despliegues con contextos mayores es arriesgado sin verificación.
- Idiomas soportados no declarados: no hay garantía de calidad fuera del inglés, ni datos de evaluación multilingüe.
- Precisión ternaria: aunque el modelo recupera parte de la capacidad del BF16, sigue 9,4 puntos por debajo en pass@1 en Terminal-Bench; es esperable degradación en tareas que requieran precisión numérica fina.
- El modo de pensamiento puede consumir decenas de miles de tokens antes de actuar, lo que incrementa latencia y coste; hay que ajustar `reasoning_effort` y `--max-tokens` en producción.
- Riesgo de alucinación y de acciones erróneas en agentes de terminal: no se documentan evaluaciones de seguridad, alineamiento ni tasas de alucinación.
- Restricciones de despliegue: no hay soporte para Linux x86 con GPUs convencionales, ni para Intel en Mac, ni integración con vLLM, llama.cpp u Ollama para este formato. El binario gbx-lm es la única vía.
- Licencia Apache 2.0 permite uso comercial, pero no se especifican términos adicionales del modelo base ni de la torre de visión; conviene revisar las fichas de Prism ML antes de un despliegue comercial.
- Sesgos: no disponible (no se publica ninguna evaluación de sesgo).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GreenBitAI/Terza-27B-Agent-gbx
- Modelo base (Prism ML Ternary-Bonsai-2-27B-mlx-2bit): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo del mismo formato y runtime (GreenBitAI/Ternary-Bonsai-2-27B-gbx): https://huggingface.co/GreenBitAI/Ternary-Bonsai-2-27B-gbx
- Runtime gbx-lm: https://github.com/GreenBitAI/gbx-lm
- Descarga del binario gbx-lm (macOS arm64): https://github.com/GreenBitAI/gbx-lm/releases/latest/download/gbx_lm-darwin-arm64.tar.gz
- Descarga del binario gbx-lm (Linux arm64, DGX Spark): https://github.com/GreenBitAI/gbx-lm/releases/latest/download/gbx_lm-linux-arm64.tar.gz
- Búsqueda web: no se han encontrado papers, blogs ni demos independientes sobre este modelo; los resultados devueltos por la búsqueda no guardan relación con el modelo y se han descartado.
