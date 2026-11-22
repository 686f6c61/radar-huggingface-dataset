# madebywest/maple-pro

## Resumen

Maple Pro es una variante afinada por preferencias del modelo Maple (deepgrove/maple-preview), una arquitectura MoE de tipo ternario con 20.214.030.336 parámetros totales y aproximadamente 1.000 millones de parámetros activos por token. Lo publica el usuario madebywest en Hugging Face bajo licencia MIT, distribuido como un único archivo GGUF de 6,2 GB que fusiona 64 tensores LoRA de atención y 121 tensores base actualizados por DPO en un solo artefacto. El modelo resuelve el problema de obtener una versión "lista para usar" del Maple base con mejor calidad conversacional, de instrucciones y de agente, manteniendo el mismo coste de inferencia.

La relevancia actual del modelo está en su formato: es un MoE ternario (TQ2_0) pensado para Apple Silicon vía Metal y LM Studio, con un contexto nativo de 128K que el GGUF extiende a 256K mediante un único campo de metadatos, sin flags de rope-scaling. El autor reporta mejoras o empates en las 12 métricas de su suite local frente al modelo base, incluyendo HumanEval+ 44/50, GSM8K 90,5/100 e IFEval 65/100.

La ficha se basa exclusivamente en la model card y los metadatos del repositorio; no se dispone de información sobre el dataset de entrenamiento del modelo base, la composición de idiomas ni resultados de benchmarks estándar publicados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ternaria (TQ2_0) con atención híbrida SWA (18/24 capas con ventana 512); arquitectura `maple` |
| Parametros totales | 20.214.030.336 |
| Parametros activos | ~1B (aproximadamente 1.000 millones) |
| Longitud de contexto | 128K nativo; 256K habilitado por metadatos del GGUF (verificado con needle test) |
| Tipos de cuantizacion | Ternaria TQ2_0 (original, `maple-pro.gguf`); Q2_K (`maple-pro-Q2_K.gguf`, 7,0 GB); Q4_K_M mencionado en la guía de resolución de problemas (`maple-pro-Q4_K_M.gguf`) |
| Idiomas soportados | No disponible (la model card no detalla cobertura lingüística) |
| Licencia | MIT |
| Formato de pesos | GGUF (6.641.372.704 bytes, 291 tensores en la build c7) |

## Arquitectura y entrenamiento

El modelo es un MoE con pesos de expertos en formato ternario TQ2_0 y atención híbrida con sliding window attention en 18 de las 24 capas (ventana de 512 tokens), lo que permite extrapolación nativa ×2 hasta 256K sin rope-scaling. Las proyecciones de atención se almacenan en F16 tras la fusión, mientras que las capas 0–7 conservan la atención ternaria original y los pesos de expertos permanecen byte-idénticos al modelo base. El checkpoint final integra 64 tensores LoRA de atención y 121 tensores base actualizados por DPO (normas, routers de expertos, QK-norms).

El entrenamiento de la build c7 (18 de noviembre de 2026) consistió en una receta one-shot: SFT sobre 2.500 iteraciones con sobremuestreo del 66% en matemáticas, un currículo de coding v1 de 4.193 bytes con BON y correcciones de teacher, seguido de DPO con 1.129 pares de preferencia. El autor indica que probó 17 configuraciones y que esta es la primera que domina simultáneamente en los 12 ejes evaluados. No se especifica el número de tokens de entrenamiento ni la composición completa del dataset.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (hasta 256K tokens).
- Razonamiento matemático: GSM8K 90,5/100 en la suite local del autor.
- Generación de código: HumanEval+ 44/50 y probe de coding de 24/26 tareas.
- Seguimiento de instrucciones: IFEval 65/100 con el checker oficial, IF-10 8/10 e IF-30 19/30.
- Tool calling / function calling: 12/12 en el eval de herramientas del autor.
- Razonamiento sobre documentos y extracción: DROP-30 20/30.
- Capacidades de agente de navegador: 5/10 en el browser-agent probe (frente a 3/10 del base).
- Conocimiento factual: 23/25 en el test de conocimiento del autor.
- Eficiencia de respuesta: mediana de 570 tokens por respuesta (−25% frente a los 759 del base).

## Casos de uso

- Asistente conversacional local en Apple Silicon: el GGUF ternario de 6,2 GB se carga en LM Studio sobre Metal y ofrece ~75 tok/s en un M4 de 16 GB, lo que permite desplegar un asistente privado sin conexión con contexto de 256K para conversaciones largas.
- Generación de código en pipelines de desarrollo: con HumanEval+ 44/50 y soporte de tool calling 12/12, puede integrarse como generador de parches o completados en flujos de CI/CD, invocando herramientas externas (tests, linters) mediante function calling.
- Automatización de agentes de navegador: el probe de agente de navegador sube de 3/10 a 5/10 respecto al base, suficiente para prototipos de navegación guiada por instrucciones en entornos controlados.
- Extracción de información de documentos largos: con 256K de contexto verificado por needle test (4/5 de recall) y DROP-30 20/30, es adecuado para resumir o extraer campos de contratos, informes o expedientes extensos en una sola pasada.
- Razonamiento matemático asistido: GSM8K 90,5/100 permite usarlo como tutor o verificador de problemas aritméticos de varios pasos en aplicaciones educativas, con la ventaja de ejecutarse en local.
- Clasificación y respuesta a instrucciones en producción de bajo coste: IFEval 65/100 e IF-30 19/30 lo hacen viable para tareas de transformación de texto guiadas por instrucciones donde el coste por token importa, al tener solo ~1B de parámetros activos.
- Despliegue en hardware sin GPU dedicada: el runtime `maple` está disponible en llama.cpp mainline en modo CPU-only, de modo que puede servirse vía `llama-server` con API compatible con OpenAI en máquinas sin acelerador.

## Benchmarks y rendimiento

Resultados de la suite local del autor (semillas y condiciones idénticas entre base y Pro):

| Eje | Base Maple | Maple Pro |
|---|---|---|
| Coding probe (26 tareas) | 20 | 24 |
| GSM8K (pooled n=200) | 90/100 | 90,5/100 |
| HumanEval+ (50) | 44 | 44 |
| IFEval (checker oficial, 100) | 63 | 65 |
| Tools eval (12) | 11 | 12/12 |
| Knowledge (25) | 22 | 23 |
| Browser-agent probe (10) | 3 | 5 |
| IF-10 / IF-30 | 7 / 19 | 8 / 19 |
| DROP-30 | 20 | 20 |
| Mediana tokens/respuesta | 759 | 570 (−25%) |

Resultados adicionales citados en la cabecera de la model card para la build c7: gate 11/12, HumanEval 129/164 (78,7%) y GSM8K 334,7/400 en tres ejecuciones (335/335/334). No se han publicado resultados de benchmarks estándar verificados de forma independiente en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo ternario ocupa 6,2 GB en disco; la KV cache a 256K requiere ~3,3 GB adicionales sobre los pesos. En GPUs con menos de 16 GB de VRAM hay que reducir la longitud de contexto.
- GPU recomendadas: Apple Silicon (M-series) con Metal es la plataforma verificada de extremo a extremo; en CUDA/Vulkan los kernels ternarios son experimentales y pueden producir logits corruptos.
- Consumer GPU: cabe en GPUs de 16 GB o más si se usa la variante Q2_K (7,0 GB) o se reduce el contexto; en Apple Silicon un M4 de 16 GB lo ejecuta con ~75 tok/s en decodificación.
- Opciones de despliegue: LM Studio (runtime ≥ 2.55, verificado con 2.65.1), llama.cpp mainline (v0.4.1, solo CPU) y el fork de DeepGrove (Apache-2.0) con `llama-server` y API compatible con OpenAI.
- Configuración recomendada en el fork: `--cpu-moe --no-op-offload -ot 'blk\.[0-7]\.attn_[a-z]+\.weight=CPU'` para dejar los matmuls ternarios en CPU cuando el backend Metal no los implementa.
- Throughput medido: ~75 tok/s en M4 de 16 GB (el base maple-preview alcanza ~94 tok/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Maple Pro | 20B totales, ~1B activos | 128K nativo / 256K GGUF | MIT | GGUF ternario, Q2_K, Q4_K_M | Optimizado para Apple Silicon; DPO sobre Maple |
| Maple (deepgrove/maple-preview) | 20B totales, ~1B activos | 128K nativo | MIT | GGUF | Modelo base; Maple Pro mejora o empata en los 12 ejes de la suite del autor |
| Otras alternativas de ~20B MoE | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos verificados en la información proporcionada |

## Limitaciones y advertencias

- Los kernels ternarios TQ2_0 no tienen implementación estable fuera de Metal: en CUDA/Vulkan el modelo puede devolver respuestas vacías por emisión inmediata de EOS. Es un problema de runtime, no del modelo.
- El soporte de la arquitectura `maple` en llama.cpp mainline es CPU-only desde v0.4.1; el fork de DeepGrove tampoco implementa los matmuls ternarios en Metal, por lo que hay que forzar esos tensores a CPU.
- El contexto más allá de 256K falla: con YaRN ×3 a 384K el recall cae a 2/5, y el autor indica que se necesita entrenamiento de contexto largo para superarlo.
- El recall a 256K es 4/5, con confusiones de vinculación entre needles de forma similar; no es un contexto perfecto.
- Riesgo de alucinación no cuantificado en la información disponible; el test de conocimiento del autor es de solo 25 preguntas.
- No hay información sobre sesgos, cobertura idiomática ni evaluación de seguridad.
- Los benchmarks proceden de la suite local del autor, con tamaños de muestra pequeños (12 a 200 ítems) y sin verificación independiente.
- La licencia MIT permite uso comercial, pero conviene revisar la licencia del modelo base (deepgrove/maple-preview, también MIT según la model card).
- El modelo base es `deepgrove/maple-preview`; no se documentan los datos de entrenamiento originales ni posibles restricciones derivadas.

## Enlaces

- Hugging Face: https://huggingface.co/madebywest/maple-pro
- Modelo base: https://huggingface.co/deepgrove/maple-preview
- Fork de llama.cpp de DeepGrove: https://github.com/deepgrove-ai/llama.cpp
