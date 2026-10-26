# liuchen88/CLA1.1-27B-MLX

## Resumen

CLA 1.1-27B (MLX) es un ajuste fino mediante QLoRA del modelo base Qwen3.8-27B, desarrollado por el usuario liuchen88 y publicado en HuggingFace. Está especializado en aprobación de crédito empresarial (Commercial Loan Approval v1.0) y produce una salida de tres estados —aprobación, aprobación condicionada o rechazo— a partir de datos financieros y de imágenes asociadas (capturas de estados financieros, facturas, licencias de actividad). El repositorio contiene los pesos en formato MLX nativo en BF16 sin cuantizar, es decir, la variante para Apple Silicon que se carga con LM Studio o mlx-lm.

El modelo hereda del base una arquitectura híbrida de 64 capas que combina 48 capas de atención lineal/SSM con 16 capas de atención completa (una cada cuatro), además de una torre visual basada en el codificador Qwen3-VL de 27 capas. El resultado es un modelo de 27.000 millones de parámetros con 262.144 tokens de contexto nativo, capacidad multimodal de entrada y un tokenizador de 248.320 entradas, todo bajo licencia Apache-2.0. Su relevancia es acotada pero específica: cubre un nicho vertical (scoring crediticio y aprobación de préstamos en chino) sobre el que no abundan ajustes finos públicos, y lo hace en un formato ejecutable en hardware de Apple.

Conviene señalar desde el principio que el proyecto no publica ninguna evaluación cuantitativa, no tiene descargas ni validación de la comunidad en el momento de redactar esta ficha, y su model card incluye advertencias explícitas sobre el riesgo de clasificación errónea en casos frontera. Debe tratarse, por tanto, como un punto de partida para evaluación propia y no como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal/SSM + atención completa) con torre visual; clase `Qwen3_5ForConditionalGeneration` |
| Parámetros totales | 27B (27.000 millones, según model card y nombre del repositorio) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens nativo en inferencia; 2.304 tokens de longitud de secuencia durante el entrenamiento |
| Tipos de cuantización | Este repositorio: BF16 sin cuantizar (MLX). Existe una variante GGUF en el repositorio `CLA1.1-27B-GGUF` del mismo autor; los niveles concretos de cuantización no están detallados |
| Idiomas soportados | Chino (`zh`) como idioma declarado; el resto no está verificado ni documentado |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con cabecera MLX (`{"format": "mlx"}`), 11 fragmentos; índice `model.safetensors.index.json`; tokenizador JSON y plantilla de chat Jinja; configuraciones de preprocesado de imagen y vídeo |
| Capas | 64 capas (48 de atención lineal/SSM + 16 de atención completa, intervalo 4) |
| Dimensión oculta | 5.120 |
| Atención | GQA con 24 cabezas Q y 4 cabezas KV, `head_dim` = 256 |
| Vocabulario | 248.320 tokens |
| Torre visual | Codificador Qwen3-VL de 27 capas (ViT) + proyección Merger; tensores con prefijo `vision_tower.*` |
| Método de ajuste | QLoRA (rank 32, alpha 1024, dropout 0.2, checkpoint 900) |
| Tamaño del repositorio | 17,6 GB (dato de HuggingFace); la model card declara ~51 GB en BF16, discrepancia no aclarada |

## Arquitectura y entrenamiento

La arquitectura procede íntegramente del base Qwen3.8-27B: un transformer de 64 capas con un esquema mixto en el que 48 capas emplean atención lineal o mecanismos de espacio de estados y solo 16 usan atención completa, intercaladas cada cuatro capas. Esta proporción reduce el coste de atención sobre secuencias largas, lo que hace viable el contexto nativo de 262.144 tokens sin un crecimiento cuadrático del coste. La atención usa GQA con 24 cabezas de consulta y 4 de clave/valor con `head_dim` de 256, sobre una dimensión oculta de 5.120 y un vocabulario de 248.320 entradas. La parte multimodal la aporta una torre visual de 27 capas (ViT, linaje Qwen3-VL) seguida de una proyección Merger que inyecta las representaciones de imagen en el flujo del modelo de lenguaje; los tensores conservan el prefijo `vision_tower.*` para que LM Studio detecte la capacidad de visión.

El ajuste se realizó con QLoRA sobre mlx-lm en macOS (Apple MLX/Metal), con rank 32, alpha 1024, dropout 0.2 y módulos objetivo `q_proj`, `v_proj`, `k_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, es decir, todas las proyecciones de atención y del bloque feed-forward. Se usó `mask_prompt: true`, de modo que la pérdida se calcula solo sobre la respuesta del asistente, con tasa de aprendizaje 1,4e-6, decaimiento coseno y 50 pasos de calentamiento, sobre secuencias de 2.304 tokens y hasta el checkpoint 900. No se especifican el número de tokens de entrenamiento, la composición del dataset, el origen de las etiquetas de las tres clases ni si hubo una fase de alineación adicional (RLHF/DPO) más allá del ajuste supervisado. Tampoco se documenta ninguna innovación técnica propia: las capacidades arquitectónicas son las del base.

## Capacidades

- Clasificación de solicitudes de crédito empresarial en tres estados: aprobación, aprobación condicionada y rechazo.
- Entrada multimodal: procesa imágenes de estados financieros, facturas, licencias de actividad y documentos similares, además de texto.
- Razonamiento sobre ratios financieros en texto (el ejemplo de la model card usa deuda/activos del 65 % y ratio corriente de 1,3).
- Generación de texto conversacional multi-turno con rol de sistema (por ejemplo, un "experto en aprobación de crédito corporativo con 20 años de experiencia").
- Comprensión y generación en chino como idioma declarado.
- Ventana de contexto de 262.144 tokens en inferencia, apta para expedientes documentales extensos (aunque el entrenamiento se hizo con secuencias de 2.304 tokens).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Modo "thinking" explícito, audio u otras capacidades especiales: no disponible (no documentado).
- Ejecución nativa en Apple Silicon vía MLX (LM Studio, mlx-lm) con etiqueta Vision en LM Studio.

## Casos de uso

- **Preanálisis de expedientes de crédito corporativo**: el modelo recibe los ratios y la documentación de una empresa solicitante y emite un dictamen preliminar de tres estados que el analista humano revisa. Aprovecha la ventana de 262k tokens para ingerir el expediente completo en una sola pasada y el modo vision para leer balances escaneados.
- **Extracción y verificación documental en banca**: a partir de capturas de estados financieros, facturas y licencias, el modelo puede contrastar los datos declarados por el solicitante con los documentos aportados y señalar discrepancias antes de que el caso llegue al comité de riesgos.
- **Triaje y priorización de la cola de solicitudes**: clasificar automáticamente las solicitudes entrantes en aprobación directa, revisión condicionada y rechazo permite enrutar cada caso al nivel de analista adecuado, reduciendo el tiempo medio de tramitación en los casos sencillos.
- **Generación de borradores de informe de crédito en chino**: producción de un texto estructurado con la conclusión, las condiciones asociadas a una aprobación condicionada y los motivos de un rechazo, que el gestor revisa y firma, ahorrando el trabajo de redacción repetitiva.
- **Asistente interno para analistas junior**: despliegue local en estaciones de trabajo Mac con MLX para consultas sobre criterios de aprobación y simulación de escenarios ("¿qué pasaría si el ratio corriente bajara a 1,1?"), sin enviar datos de clientes a servicios externos.
- **Prototipado e investigación en regulación financiera**: servir de base para experimentos académicos o de evaluación de sesgos en decisiones crediticias automatizadas, dado que los pesos son abiertos (Apache-2.0) y el ajuste es reproducible con QLoRA sobre un base público.
- **Evaluación comparativa de modelos verticales en finanzas**: usar este ajuste como referencia en estudios sobre degradación de capacidades generales tras un ajuste fino de dominio estrecho, comparándolo con el base Qwen3.8-27B.
- **Procesamiento por lotes de carteras históricas**: al ejecutarse en local y sin coste por token, permite reclasificar carteras completas de expedientes para auditoría interna o análisis retrospectivo de criterios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, exactitud de clasificación, matriz de confusión ni ningún otro conjunto de evaluación. Tampoco se documentan comparaciones con el modelo base ni con alternativas del sector financiero.

## Requisitos de hardware

- **Requisito de plataforma**: al ser una build MLX nativa, requiere Apple Silicon (serie M). No se ejecuta en GPUs NVIDIA ni AMD con este repositorio.
- **Memoria unificada**: la model card indica un mínimo de 64 GB de memoria unificada en Mac. En BF16, 27B parámetros equivalen a unos 54 GB solo de pesos, más la torre visual y el espacio de activaciones y KV cache, por lo que 64 GB es un límite ajustado.
- **Equipos recomendados**: Mac con M2 Max / M3 Max / M4 Max de 64 GB o superior; para contextos largos y uso concurrente, M2 Ultra o M3 Ultra con 128 GB o más. Con 64 GB conviene limitar `n_ctx` (la model card sugiere 32.768 como punto de partida).
- **GPU dedicadas (A100, H100, RTX 4090)**: no aplicables a este repositorio; para CUDA habría que usar el base Qwen3.8-27B o reconvertir los pesos, algo que el autor no documenta.
- **Cabe en GPU de consumo**: no en el sentido habitual; en Apple Silicon de gama alta sí, con las restricciones de memoria citadas. La variante GGUF del mismo autor es la vía indicada para entornos con menos memoria.
- **Opciones de despliegue**: LM Studio (con Flash Attention activada y etiqueta Vision) y mlx-lm (`mlx_lm.load --model ./CLA1.1-27B-MLX`). Para llama.cpp, Ollama o TGI habría que recurrir al repositorio GGUF, no a este.
- **Latencia y throughput**: no disponible. No se publican mediciones de tokens por segundo ni de latencia por petición.
- **Nota sobre el tamaño**: el repositorio declara 17,6 GB en HuggingFace frente a los ~51 GB que indica la model card para BF16; conviene verificar la integridad de los 11 fragmentos antes de desplegar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato | Evaluación publicada |
|---|---|---|---|---|---|---|
| CLA1.1-27B-MLX (este modelo) | 27B | 262.144 tokens | Texto + imagen | Apache-2.0 | safetensors MLX (BF16) | No disponible |
| Qwen/Qwen3.8-27B (base) | 27B | 262.144 tokens (heredado) | Texto + imagen | Apache-2.0 | safetensors | Sí, en la model card del autor del base (no consultada aquí) |
| CLA1.1-27B-GGUF (variante del mismo autor) | 27B | 262.144 tokens | Texto + imagen | Apache-2.0 | GGUF | No disponible |

Frente al base, este ajuste cambia generalidad por especialización: gana un formato de salida de tres estados y vocabulario de dominio crediticio, y a cambio no hay evidencia de que conserve el rendimiento general del original. Frente a la variante GGUF, la diferencia es puramente de despliegue (precisión BF16 y ecosistema MLX frente a portabilidad y cuantización). No se dispone de datos para comparar con otros ajustes financieros abiertos, ni de métricas que permitan situarlo frente a modelos propietarios de scoring crediticio.

## Limitaciones y advertencias

- **Sin evaluación publicada**: no existe ningún benchmark, matriz de confusión ni análisis de calibración; el rendimiento real de la clasificación de tres estados es desconocido.
- **Riesgo en casos frontera**: el propio autor advierte de errores de clasificación entre "aprobación condicionada" y las categorías adyacentes (aprobación o rechazo). Es precisamente la zona de mayor valor económico.
- **No sustituye la decisión humana**: la model card lo declara explícitamente como herramienta de apoyo; no debe integrarse como decisor autónomo en un proceso crediticio.
- **Idioma**: solo se declara chino. El comportamiento en castellano u otras lenguas no está verificado y probablemente degrade la calidad y la coherencia del formato de salida.
- **Contexto de entrenamiento muy inferior al de inferencia**: el ajuste se hizo con secuencias de 2.304 tokens aunque la ventana nativa sea de 262.144; no hay garantía de que el formato de tres estados se mantenga en contextos largos.
- **Datos de entrenamiento opacos**: se desconoce el volumen, la procedencia y la distribución de etiquetas del corpus, lo que impide auditar sesgos por sector, tamaño de empresa o geografía. El autor indica que la aplicabilidad a jurisdicciones fuera de China y a sectores especiales no está validada.
- **Riesgo regulatorio**: un sistema de scoring crediticio es de alto riesgo bajo marcos como el Reglamento europeo de IA; su uso en producción exige documentación, supervisión humana y pruebas de equidad que este modelo no aporta.
- **Alucinación en cifras**: al ser un modelo generativo, puede reproducir o inventar ratios y cantidades financieras; cualquier número extraído debe validarse contra el documento original.
- **Licencia**: Apache-2.0 permite uso comercial y modificaciones, pero no exime del cumplimiento de la normativa sectorial ni de las obligaciones de transparencia; el autor declina cualquier responsabilidad y no ofrece garantías.
- **Madurez del proyecto**: cero descargas y cero valoraciones en el momento de la ficha, autor único, y una discrepancia sin explicar entre el tamaño del repositorio (17,6 GB) y el declarado en la model card (~51 GB). Verificar los pesos antes de confiar en ellos.
- **Dependencia de plataforma**: la build MLX ata el despliegue a Apple Silicon; no hay ruta CUDA documentada para estos pesos concretos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/liuchen88/CLA1.1-27B-MLX
- Variante GGUF del mismo autor (mencionada en la model card): https://huggingface.co/liuchen88/CLA1.1-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- mlx-lm (framework de carga y entrenamiento): https://github.com/ml-explore/mlx-lm
- LM Studio (interfaz de despliegue en Apple Silicon): https://lmstudio.ai
- Paper, blog o demo específicos del ajuste: no disponible
