# orz99/GLM-5.3-Flash-abliterated-Maya-M-GGUF

## Resumen

GLM-5.3-Flash-abliterated-Maya-M-GGUF es una distribución comunitaria del modelo GLM-5.3-Flash de Z.ai, publicada por el usuario orz99. El paquete combina tres piezas: los pesos cuantizados Maya-M (116 GB) creados por mw00 y PeasantSmith dentro del proyecto Project Maya, un vector de control de 2,2 MB que elimina los rechazos del modelo en tiempo de inferencia, y un parche para el motor Maya que aplica dicho vector. El modelo original es multimodal (image-text-to-text) y está pensado para ejecutarse en configuraciones de 4x RTX 3090 con contextos de hasta 256K tokens.

La relevancia de esta ficha reside en que documenta una técnica de abliteración aplicada sobre una cuantización GGUF de gran tamaño, con mediciones reproducibles de velocidad, fidelidad respecto a BF16 y tasa de rechazo. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de inferencia que modifica el comportamiento del modelo base mediante resta de direcciones en las salidas FFN de las capas 1 a 44.

El autor original de los pesos es Z.ai (modelo GLM-5.3-Flash); la receta de cuantización y el motor son de mw00 y PeasantSmith; el vector y las mediciones son de orz99 (también publicado como alesha-pro). La licencia declarada es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer GLM (etiqueta GGUF `glm5-next` en la revisión posterior del autor original); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantización | Maya-M (116,0 GB); el ecosistema incluye también Maya-S, Maya-S24 y Maya-L, y comparativas con EXL3 2.05 bpw y 3.05 bpw |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (pesos) + vector float32 crudo (`glm53-refusal-per-block-3dir.layers45.f32`) |
| Modalidad | image-text-to-text (multimodal) |
| Tamaño del repositorio | 117,1 GB |
| Vector de abliteración | 45 × 3 × 4096 valores float32, 2.211.840 bytes, SHA256 `b0debc326b06c956039fd75dc1cb759dd46c4aa5e868bbfef1a5b0607c3552b7` |
| Motor de inferencia | Project Maya v1.0.27 + parche (fork `glm-ablate`) |
| Hardware de referencia | 4x RTX 3090 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base GLM-5.3-Flash más allá de su etiqueta GGUF (`glm5-next`) y su naturaleza multimodal image-text-to-text. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Lo que sí se documenta es el proceso de cuantización y el mecanismo de abliteración.

La cuantización Maya-M (116,0 GB) es una receta propia de Project Maya que, según las mediciones del autor, alcanza una KLD de 0,0934 frente a BF16 y un 90,68 % de acuerdo en Top-1 sobre un panel de 25 ventanas y 51.175 posiciones con vocabulario completo. La abliteración se implementa en el motor: antes de que la salida FFN de cada capa se escriba en los 4 flujos de hiperconexión, el motor resta de ambos operandos las 3 direcciones asociadas a esa capa mediante `x = x - (x · v) v`. Las capas 1 a 44 tienen cada una 3 direcciones: la primera es dañino menos inofensivo en el último token del prompt con thinking desactivado, la segunda lo mismo con thinking activado, y la tercera en el cierre `</think>` del razonamiento propio del modelo. Las direcciones se obtuvieron sobre la cuantización EXL3 2.05 bpw del mismo modelo con un fork de exllamav3 y se convirtieron para Maya; no se calcularon sobre Maya-M. Sin el ajuste, el motor ejecuta el modelo original.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 256K tokens.
- Procesamiento de imagen y texto (pipeline image-text-to-text).
- Modo de razonamiento (thinking) activable, con dirección de abliteración específica para el cierre de razonamiento.
- Eliminación de rechazos en tiempo de inferencia mediante vector de control, manteniendo 2 rechazos residuales sobre temáticas de suicidio y autolesión en la evaluación realizada.
- Capacidad de "disputar la premisa" de una petición (4 casos en la evaluación) en lugar de rechazarla.
- Servicio vía API de chat del motor Maya (1 petición concurrente).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Investigación en seguridad y alineación: el vector y las mediciones de rechazo (178 respuestas evaluadas con juez GLM-5.3-Flash stock) permiten estudiar cómo varía la tasa de rechazo al aplicar direcciones de abliteración por capa, con un protocolo reproducible sobre AdvBench y JailbreakBench.
- Evaluación de cuantizaciones a gran escala: la tabla de KLD y acuerdo Top-1 frente a BF16 (Maya-M 0,0934 / 90,68 %; EXL3 3.05 bpw 0,0473 / 93,08 %) sirve para comparar recetas de cuantización en un modelo multimodal de gran tamaño sin reentrenar.
- Despliegue multimodal en hardware de consumo profesional: con 4x RTX 3090 y 256K de contexto, el modelo decodifica 56,1 tokens/s con el vector activo, lo que permite prototipar asistentes sobre documentos e imágenes largos en un nodo único.
- Procesamiento de documentos extensos con imagen: la ventana de 262.144 tokens y el pipeline image-text-to-text permiten ingerir informes con figuras, tablas escaneadas y texto largo en una sola pasada.
- Análisis de conversaciones de razonamiento: la dirección específica para el token `</think>` permite experimentar con el comportamiento del modelo en modo thinking sin modificar los pesos, útil para estudiar trazas de razonamiento.
- Benchmarking de motores de inferencia: las cifras de prefill (1.119–1.153 tok/s a 8K; 1.938–1.953 tok/s a 32K) y decodificación permiten comparar Maya frente a exllamav3 sobre el mismo modelo y hardware.
- Reproducción de pipelines de cuantización: el repositorio incluye SHA256SUMS y referencias a la revisión exacta de los pesos originales, lo que facilita auditorías de integridad en entornos de investigación.

## Benchmarks y rendimiento

Rendimiento en inferencia sobre 4x RTX 3090, Maya v1.0.27, contexto 256K, tras `./maya.sh --calibrate`, thinking desactivado, temperatura 0, 1 petición concurrente:

| Métrica | Sin vector | Con vector |
|---|---:|---:|
| Decodificación | 58,4 tok/s | 56,1 tok/s |
| Decodificación a 32K de profundidad | 57,2 tok/s | 55,9 tok/s |
| Prefill a 8K | 1.078–1.113 tok/s | 1.119–1.153 tok/s |
| Prefill a 32K | 1.860–1.896 tok/s | 1.938–1.953 tok/s |

Fidelidad frente a BF16 (panel de 25 ventanas, 51.175 posiciones, vocabulario completo, sin vector):

| Cuantización | Tamaño | KLD a BF16 | Acuerdo Top-1 |
|---|---:|---:|---:|
| EXL3 2.05 bpw | 85,1 GB | 0,1214 | 88,68 % |
| EXL3 mixta (gate/up 2 bits, down 3 bits) | 98,1 GB | 0,0959 | 89,87 % |
| Maya-M | 116,0 GB | 0,0934 | 90,68 % |
| EXL3 3.05 bpw | 125,2 GB | 0,0473 | 93,08 % |

Tasa de rechazo (178 respuestas: 64 AdvBench retenidas + 82 JailbreakBench sin thinking + 32 con thinking; greedy; juez GLM-5.3-Flash stock):

| Configuración | Rechazos | Disputa la premisa | Corte durante thinking |
|---|---:|---:|---:|
| Maya-M con vector | 2 | 4 | 0 |
| EXL3 2.05 bpw stock (referencia del autor) | 144 de 146 sin thinking | no disponible | no disponible |
| EXL3 2.05 bpw con vector | 0 de 438 | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos Maya-M ocupan 116,0 GB, por lo que se requiere un mínimo de ~116 GB de VRAM sumada para carga completa; el repositorio completo son 117,1 GB.
- GPU recomendadas: 4x RTX 3090 (configuración de referencia del autor). Otras configuraciones no están documentadas.
- Cabe en GPU de consumo: sí, con 4x RTX 3090 (24 GB cada una, 96 GB totales) más reparto por PCIe; el autor indica que tras la calibración los expertos fríos se envían por la ruta PCIe con `STRATA_GLM_PCIE_SHARE=0.75`. No cabe en una única GPU de consumo.
- Memoria del sistema: el autor menciona que su máquina tiene solo 2 canales de memoria, lo que afectó al rendimiento antes de la calibración (24,9 tok/s frente a 58,4 tok/s después).
- Opciones de despliegue: Project Maya v1.0.27 con el fork `glm-ablate` (rama `glm-ablate`), que añade 3 archivos al motor. El motor Strata de Niko1221 es la base de Maya. No se documenta soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: decodificación de 56,1 tok/s con vector y 58,4 tok/s sin vector a 256K de contexto; prefill de 1.119–1.953 tok/s según profundidad. Servicio de 1 petición concurrente.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | KLD a BF16 | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Maya-M (este repo) | GGUF, multimodal | 116,0 GB | 256K | 0,0934 | MIT | Hugging Face |
| EXL3 2.05 bpw | EXL3, multimodal | 85,1 GB | no disponible | 0,1214 | no disponible | Hugging Face (referenciado) |
| EXL3 mixta 2/3 bits | EXL3, multimodal | 98,1 GB | no disponible | 0,0959 | no disponible | Hugging Face (referenciado) |
| EXL3 3.05 bpw | EXL3, multimodal | 125,2 GB | no disponible | 0,0473 | no disponible | Hugging Face (referenciado) |

Las tres alternativas EXL3 son cuantizaciones del mismo modelo base GLM-5.3-Flash y se ejecutan mediante exllamav3; la comparación de KLD es directa según el autor, aunque advierte que la fila de Maya-M incluye el ruido de su propio motor. No se dispone de comparación con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina rechazos de forma deliberada: en la evaluación quedan solo 2 rechazos sobre 178 respuestas, ambos relativos a suicidio y autolesión. El modelo puede producir contenido dañino, ilegal o inseguro si se usa sin salvaguardas externas.
- El autor no midió la KLD de Maya-M con el vector activado, por lo que se desconoce el impacto de la abliteración en la calidad general del modelo.
- Las direcciones de abliteración se calcularon sobre la cuantización EXL3 2.05 bpw, no sobre Maya-M; su transferencia es una aproximación.
- La evaluación de rechazos usa como juez al propio GLM-5.3-Flash stock, lo que introduce un posible sesgo de autoevaluación.
- El modelo se sirve con 1 sola petición concurrente en la configuración documentada, lo que limita su uso en producción de alta concurrencia.
- El autor advierte de que los pesos originales cambiaron: la revisión actual del repositorio de PeasantSmith renombra la arquitectura a `glm5-next` en la cabecera GGUF. Este repositorio conserva el primer shard anterior, el usado con Maya v1.0.27; para los archivos actuales hay que acudir al repositorio original.
- Los pesos no son del autor del repositorio: son copia byte a byte de peasantsmith/GLM-5.3-Flash-Maya-GGUF en la revisión `3e9f3bb20aa191e01c6fb850faf132d8149da98a`, verificada por SHA256.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- No se documentan sesgos conocidos ni tasas de alucinación medidas.
- La licencia MIT se declara en la model card, pero conviene verificar las condiciones del modelo base original de Z.ai antes de uso comercial.
- El despliegue requiere un fork específico del motor Maya; no hay soporte documentado en runtimes estándar como vLLM, llama.cpp u Ollama.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación independiente por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/orz99/GLM-5.3-Flash-abliterated-Maya-M-GGUF
- Modelo base cuantizado (Project Maya): https://huggingface.co/peasantsmith/GLM-5.3-Flash-Maya-GGUF
- Modelo original de Z.ai: https://huggingface.co/zai-org/GLM-5.3-Flash
- Project Maya (motor): https://github.com/mw00/project-maya
- Fork con parche de abliteración: https://github.com/alesha-pro/project-maya/tree/glm-ablate
- Documentación del parche: https://github.com/alesha-pro/project-maya/blob/glm-ablate/docs/GLM-ABLATE.md
- Metodología de abliteración: https://github.com/alesha-pro/exllamav3-glm53-4x3090/blob/glm53-4x3090/glm53/abliteration/README.md
- Fork de exllamav3 usado: https://github.com/alesha-pro/exllamav3-glm53-4x3090
- Motor Strata (base de Maya): https://github.com/Niko1221/Strata
- Logits BF16 del profesor: https://huggingface.co/datasets/brandonmusic/GLM-5.3-Flash-BF16-Teacher-Logits
