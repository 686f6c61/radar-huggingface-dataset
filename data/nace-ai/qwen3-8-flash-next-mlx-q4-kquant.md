# nace-ai/Qwen3.8-Flash-Next-MLX-Q4-KQuant

## Resumen

Qwen3.8-Flash-Next-MLX-Q4-KQuant es una cuantización de 4 bits en formato MLX del modelo Qwen3.8-Flash-Next de Qwen (Alibaba), publicada por nace-ai. El paquete está pensado para ejecutarse localmente en Macs con Apple Silicon mediante el motor Kapitsa, y combina una cuantización estándar de 4 bits con una capa de refinamiento KQuant aplicada a un subconjunto de tensores para acercar la distribución de salida al modelo original en bf16.

El modelo base es multimodal (pipeline image-text-to-text) con aproximadamente 180.000 millones de parámetros totales, lo que sitúa este pack en el terreno de los modelos de gran tamaño que solo pueden residir en memoria en estaciones de trabajo con 128 GB o más de memoria unificada. El repositorio ocupa 105,8 GB y la descarga declarada es de 98,6 GiB.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de cuantización con métricas de divergencia (KL) publicadas frente a otros packs de la comunidad; por otro, ilustra el estado de las herramientas de inferencia local en Apple Silicon para modelos de escala frontera. La licencia es qwen-community-1.0, con implicaciones que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-Flash-Next; pipeline image-text-to-text) |
| Parametros totales | 179.999.981.459 (aprox. 180.000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX), esquema KQuant con 324 de 3.649 tensores heredados del pack 4-bit plano |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other") |
| Formato de pesos | safetensors (MLX), librería mlx |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada: ni el tipo de transformer, ni si emplea mezcla de expertos, ni detalles sobre datos de entrenamiento, número de tokens, composición del corpus o etapas de alineación (RLHF/DPO). La model card del pack cuantizado se centra exclusivamente en el proceso de cuantización y en las mediciones de divergencia, no en el modelo original.

La innovación técnica documentada es el esquema KQuant: se parte de una cuantización de 4 bits y se aplica un refinamiento selectivo a ciertos tensores, de modo que 324 de los 3.649 tensores conservan la cuantización del pack 4-bit plano de nace-ai y el resto recibe el tratamiento KQuant. El resultado es un tamaño idéntico al del pack 4-bit plano (103,424 GB de payload del modelo de lenguaje base) con una divergencia KL menor frente a bf16. Las mediciones se realizaron con mlx-vlm 0.7.8 sobre 32.704 posiciones de siguiente token en dos corpus congelados (WikiText-2, conversaciones GSM8K y código HumanEval como conjunto "original"; UltraChat test_sft y diálogos Schema-Guided como conjunto "fresh"). La visión no fue evaluada.

## Capacidades

- Generación de imagen a texto: el pipeline declarado es image-text-to-text, por lo que el modelo acepta entradas visuales además de texto.
- Conversación multi-turno: etiquetado como conversational.
- Generación de código: el corpus de evaluación incluye HumanEval, lo que indica capacidad de síntesis de código, aunque no se publican métricas de precisión de tarea.
- Razonamiento matemático: se evalúa sobre conversaciones GSM8K, de nuevo sin métricas de exactitud.
- Tool calling / function calling: la model card incluye una tabla específica de llamadas a herramientas ("Extra tool call instead of a final answer") con modo de pensamiento desactivado, medida sobre 60 casos.
- Modo de pensamiento (thinking): la tabla de tool calls distingue explícitamente entre "Thinking off" y el modo con pensamiento activado, por lo que el modelo soporta ambos.
- Ejecución local en Apple Silicon mediante Kapitsa, con servidor integrado (`kapitsa serve`).
- Capacidades multilingües: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistencia conversacional local con privacidad de datos: al ejecutarse íntegramente en un Mac Studio con 128 GB, el modelo permite mantener conversaciones multi-turno sin enviar datos a servicios externos, adecuado para entornos con requisitos de confidencialidad.
- Análisis de documentos con componente visual: el pipeline image-text-to-text permite procesar capturas, diagramas o páginas escaneadas junto con instrucciones textuales en un mismo flujo.
- Automatización de agentes con tool calling: la evaluación de llamadas a herramientas sugiere que el modelo puede encadenar invocaciones de funciones; se usaría como planificador en un agente local que consulte APIs o ejecute comandos, con el modo de pensamiento desactivado para reducir latencia.
- Generación y revisión de código en local: el modelo se evaluó sobre HumanEval y puede integrarse en un flujo de edición de código en el escritorio, sin depender de la nube, para tareas de autocompletado, refactorización o explicación de fragmentos.
- Investigación sobre cuantización: el pack sirve como referencia reproducible para estudiar el impacto de KQuant frente a cuantizaciones planas, gracias a las métricas KL publicadas y a las revisiones fijadas (pins) de cada pack comparado.
- Prototipado de producto en estación de trabajo: equipos que desarrollan sobre Apple Silicon pueden validar pipelines multimodales completos antes de migrar a infraestructura de servidor, usando el mismo modelo base y comparando la fidelidad del pack cuantizado.
- Evaluación comparativa de motores de inferencia: con mediciones de velocidad de lectura y escritura publicadas, el pack permite contrastar el rendimiento de Kapitsa frente a otras implementaciones MLX en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K) en la información disponible. La model card proporciona métricas de divergencia KL frente a bf16 y de velocidad de inferencia, que se recogen a continuación.

| Metrica | KQuant Q4 | 4-bit plano (nace-ai) | Jundot oQ4e-mtp | ddalcu Serve-iQ 4.7bpw | mlx-community 4-bit | TensorFold 4-bit | TensorFold oQ4-MTP |
|---|---:|---:|---:|---:|---:|---:|---:|
| KL corpus original | 0,12752751 | 0,14110035 | 0,06475066 | 0,06636178 | 0,24928604 | 0,24921756 | 0,22957656 |
| KL corpus fresh | 0,13168241 | 0,14112859 | 0,07135602 | 0,07430536 | 0,22910747 | 0,22900716 | 0,21622438 |
| Payload base-LM (GB) | 103,424 | 103,424 | 105,259 | 104,893 | 110,621 | 110,680 | 110,794 |

| Rendimiento en Mac Studio M1 Ultra, 128 GB | 4-bit plano | KQuant |
|---|---:|---:|
| Escritura, temperatura 0,6 (tokens/s) | 61,12 | 61,17 |
| Escritura, greedy (tokens/s) | 64,51 | 65,84 |
| Lectura de prompt de 4K (tokens/s) | 738,25 | 752,00 |

Las cifras de velocidad son la media de seis medias por pack, con ejecuciones intercaladas A B B A tres veces, usando `kapitsa bench --quick` (mediana de tres respuestas de 512 tokens por configuración de decodificación). Entorno: macOS 26.7, alimentación por corriente, 11 de noviembre de 2026. La referencia es Qwen/Qwen3.8-Flash-Next en la revisión `de4b8e4d`.

## Requisitos de hardware

- Memoria: la descarga ocupa 98,6 GiB y el payload del modelo de lenguaje base 103,424 GB; según el autor, un Mac de 48 GB no puede mantener los pesos en memoria. Se midió en un Mac Studio M1 Ultra con 128 GB de memoria unificada.
- GPU: no se documentan GPU discretas (A100, H100, RTX 4090); el pack está orientado exclusivamente a Apple Silicon por su formato MLX.
- Cabe en GPU de consumo: no en el sentido convencional; requiere un Mac con memoria unificada de gama alta (128 GB o superior), no una GPU de consumo con VRAM estándar.
- Despliegue: motor Kapitsa, instalable vía Homebrew (`brew install nace-ai/tap/kapitsa`) y servidor con `kapitsa serve --model ...`. Las mediciones se hicieron con una build del motor concreta; la release de Homebrew no ha sido medida con este pack.
- Latencia y throughput: 61,17 tokens/s en escritura con temperatura 0,6; 65,84 tokens/s en greedy; 752 tokens/s en lectura de un prompt de 4K. Diferencias respecto al pack 4-bit plano dentro de la variación entre ejecuciones.
- Otros motores MLX: no se documenta compatibilidad con llama.cpp, Ollama, vLLM o TGI; el formato y la librería son específicos de MLX.

## Comparativa con modelos similares

La comparación relevante es entre packs de cuantización del mismo modelo base, no entre modelos distintos. No se dispone de información sobre modelos alternativos de la misma categoría.

| Pack | Tamano base-LM (GB) | KL original | KL fresh | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| nace-ai KQuant (este) | 103,424 | 0,12752751 | 0,13168241 | qwen-community-1.0 | Hugging Face |
| nace-ai 4-bit plano | 103,424 | 0,14110035 | 0,14112859 | qwen-community-1.0 | Hugging Face |
| Jundot oQ4e-mtp | 105,259 | 0,06475066 | 0,07135602 | no disponible | Hugging Face |
| ddalcu Serve-iQ 4.7bpw | 104,893 | 0,06636178 | 0,07430536 | no disponible | Hugging Face |
| TensorFold oQ4-MTP | 110,794 | 0,22957656 | 0,21622438 | no disponible | Hugging Face |
| mlx-community 4-bit | 110,621 | 0,24928604 | 0,22910747 | no disponible | Hugging Face |

Según el autor, Jundot oQ4e-mtp (1,8% mayor) y ddalcu Serve-iQ 4.7bpw (1,4% mayor) obtienen menor KL que KQuant en ambos corpus; se excluyen del gráfico principal porque solo se representan packs que superan a KQuant siendo al menos un 10% más grandes.

## Limitaciones y advertencias

- La cuantización introduce divergencia respecto a bf16: la KL media es de 0,1275 en el corpus original y 0,1317 en el fresh, superior a la de otros packs de tamaño ligeramente mayor (Jundot, ddalcu). No es la opción de mayor fidelidad disponible.
- La evaluación de visión no se realizó; el rendimiento multimodal del pack no está verificado empíricamente.
- No se publican métricas de tarea (precisión en HumanEval, GSM8K o MMLU), solo divergencia de distribución; la KL no equivale a exactitud ni a velocidad.
- El pack solo es utilizable con MLX y, en la práctica, con el motor Kapitsa; no hay soporte documentado para llama.cpp, Ollama, vLLM ni TGI.
- Los requisitos de memoria excluyen equipos de 48 GB; el hardware mínimo medido es un Mac Studio con 128 GB.
- Los pesos requieren verificación de licencia: qwen-community-1.0 se etiqueta como "other" y las condiciones de uso comercial deben consultarse en el archivo LICENSE del repositorio.
- El repositorio no registra descargas ni valoraciones (0 descargas, 0 likes) y el modelo base está fechado en noviembre de 2026, por lo que el ecosistema de herramientas y validaciones independientes es reducido.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del modelo base.
- Las cifras de velocidad se obtuvieron con una build concreta del motor; la release de Homebrew no fue medida con este pack, por lo que el rendimiento en instalaciones estándar puede diferir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX-Q4-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Pack 4-bit plano de nace-ai: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX-4bit
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Sitio de Nace.AI: https://www.nace.ai/
- Jundot oQ4e-mtp: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
- ddalcu Serve-iQ 4.7bpw: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-4.7bpw
- TensorFold oQ4-MTP: https://huggingface.co/TensorFold/Qwen3.8-Flash-Next-MLX-oQ4-MTP
- TensorFold 4-bit: https://huggingface.co/TensorFold/Qwen3.8-Flash-Next-MLX-4bit
- mlx-community 4-bit: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-4bit
- Revisión del modelo base usada como referencia: `de4b8e4d`
- Revisión de este pack: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX-4bit-KQuant/tree/8fda104737236c4bbe1d6fb2784fb499ffd0a4cd
