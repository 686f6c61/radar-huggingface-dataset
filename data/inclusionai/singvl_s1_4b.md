# inclusionAI/SingVL_S1_4B

## Resumen

Sing VL S1 (SingVL_S1_4B) es un modelo de decisión multimodal desarrollado por inclusionAI, construido sobre la arquitectura Qwen3.5. A diferencia de los modelos generativos convencionales, su función principal no es producir texto libre, sino responder preguntas con nombre sobre entradas de texto, JSON o hasta cuatro imágenes, devolviendo probabilidades calibradas en lugar de cadenas de texto. Cada pregunta se codifica como un prompt completo, y en peticiones de texto con múltiples preguntas el motor agrupa esos prompts por longitud con un presupuesto de 65.536 tokens con padding por pasada forward.

El modelo soporta tres tipos de decisión tipada: *Choice* (selección entre opciones con probabilidad por candidato), *Noul* (probabilidad de que una proposición sí/no sea verdadera) y *Score* (puntuación en 2-10 niveles ordenados, devolviendo probabilidad por nivel y nivel esperado como suma del índice de nivel multiplicado por su probabilidad). Esta especialización lo hace relevante para pipelines de enrutamiento, moderación, clasificación y evaluación automatizada donde se necesita una señal probabilística estructurada en lugar de generación abierta.

Con 4.539.265.536 parámetros totales y un repositorio de 18,2 GB en safetensors, el modelo se posiciona en la gama de 4B compacta, apta para despliegue en GPU de consumo. Obtiene 70,95 en Text y 77,158 en Vision en el Public Decision Index 0.3, superando a alternativas como StartLux-Decision v1.1 4B y Perplexity Decider Flash v1.2 en ambos paneles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen3.5 |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (presupuesto de 65.536 tokens con padding por pasada forward en batching de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se apoya en Qwen3.5 como base arquitectónica, con un cabezal de decisión tipada que transforma la salida del modelo en distribuciones de probabilidad sobre opciones, proposiciones booleanas o niveles ordinales. La entrada multimodal admite texto, JSON e imágenes (hasta cuatro por petición); cuando no se proporcionan marcadores `<image>`, el modelo los inserta automáticamente. El motor de inferencia agrupa prompts por longitud con un presupuesto de 65.536 tokens con padding por forward pass, lo que permite procesar múltiples preguntas en lote de forma eficiente.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. La model card documenta el comportamiento de inferencia y los resultados de evaluación, pero no detalla el proceso de entrenamiento. La evaluación de visión se realizó con un límite de 1.638.400 píxeles por imagen.

## Capacidades

- Decisión tipada *Choice*: selecciona una opción entre candidatos y devuelve probabilidad por cada uno.
- Decisión tipada *Noul*: devuelve la probabilidad de que una proposición sí/no sea verdadera.
- Decisión tipada *Score*: puntúa la entrada en 2-10 niveles ordenados, devolviendo probabilidad por nivel y nivel esperado.
- Procesamiento multimodal: texto, JSON y hasta cuatro imágenes por petición.
- Codificación de cada pregunta como prompt completo, con batching por longitud.
- Inserción automática de marcadores `<image>` cuando no se especifican.
- Evaluación sobre herramientas y APIs: BFCL (96,81 exact accuracy no-skill), API-Bank (84,45), ToolRet (67,96 nDCG@10).
- Clasificación de intención: BANKING77 (94,00 Macro-F1), CLINC150+OOS (97,03 Macro-F1).
- Razonamiento y conocimiento: MMLU (82,93), ARC-Challenge (96,25), HellaSwag (96,48), WinoGrande (89,82).
- Matemáticas: GSM8K (73,84), CLadder (94,72).
- Evaluación de alucinaciones: RAGTruth (83,49 F1 de clase alucinada), HoVer (89,25).
- Visión documental: InfographicVQA (96,31), KIE CORD+FUNSD (95,82), CharXiv (86,65).
- Detección de sarcasmo y moderación: iSarcasmEval (64,98 F1), Hateful Memes (71,64).
- No se documentan capacidades de generación de texto libre, tool calling generativo ni agentes multi-paso en el sentido convencional; el modelo está orientado a decisión, no a generación.

## Casos de uso

- Enrutamiento de consultas a modelos especializados: el tipo *Choice* permite seleccionar el modelo o pipeline adecuado por consulta, con probabilidades calibradas; RouterBench muestra 79,83 en calidad seleccionada (no-skill).
- Clasificación de intención en atención al cliente: con BANKING77 (94,00 Macro-F1) y CLINC150+OOS (97,03 Macro-F1), el modelo asigna intención y detecta fuera de dominio con probabilidad explícita.
- Moderación de contenido multimodal: evalúa memes e imágenes con texto (Hateful Memes 71,64) devolviendo probabilidad de contenido dañino, útil para colas de revisión priorizadas por score.
- Verificación de afirmaciones y detección de alucinaciones: RAGTruth (83,49 F1) y HoVer (89,25) permiten puntuar respuestas generadas por otros modelos y marcar salidas no fundamentadas.
- Extracción y validación documental: InfographicVQA (96,31) y KIE (95,82) permiten responder preguntas tipadas sobre facturas, formularios e infografías con hasta cuatro imágenes por petición.
- Evaluación automatizada de calidad de respuestas: el tipo *Score* con 2-10 niveles y nivel esperado sirve como juez ordinal en pipelines de RLHF o comparación de modelos.
- Selección de herramientas y APIs: BFCL (96,81) y API-Bank (84,45) permiten decidir qué función invocar y con qué argumentos en sistemas de agentes.
- Filtrado de phishing y riesgo: PhishNChips (85,55) devuelve probabilidad de riesgo por entrada para triaje previo a revisión humana.

## Benchmarks y rendimiento

Public Decision Index 0.3 (suites públicas completas):

| Panel | Sing VL S1 | TypeSafe Jev 1.14 | StartLux-Decision v1.1 4B | Perplexity Decider Flash v1.2 (4B) |
|---|---:|---:|---:|---:|
| Text (140.178 peticiones) | 70,95 | 60,70 | 67,8 | 60,1 |
| Vision (12.210 peticiones) | 77,158 | — | 67,90 | 72,5 |

Desglose de visión (ejecución histórica 73,94; ejecución con límite de 1,6 MP: 73,7495):

| Dataset | Non-Skill (Accuracy) | Skill |
|---|---:|---:|
| CV-Bench | 87,34 | 79,12 |
| BLINK | 72,11 | 56,83 |
| RealWorldQA | 82,17 | 70,87 |
| CharXiv | 86,65 | 82,21 |
| InfographicVQA | 96,31 | 95,08 |
| Mind2Web | 87,67 | 83,56 |
| Winoground | 93,12 | 86,25 |
| KIE (CORD+FUNSD) | 95,82 | 93,12 |
| Moderation (Hateful Memes) | 71,64 | 43,28 |
| R-Bench-M | 49,77 | 39,72 |
| MMMU-Pro vision | 50,17 | 42,85 |

Desglose de texto (43 datasets, selección):

| Dataset | Métrica | Non-Skill | Skill |
|---|---|---:|---:|
| BFCL | Exact accuracy | 96,81 | 95,70 |
| ToolRet | nDCG@10 | 67,96 | 63,00 |
| API-Bank | Accuracy | 84,45 | 84,15 |
| BANKING77 | Macro-F1 | 94,00 | 93,92 |
| CLINC150+OOS | Macro-F1 | 97,03 | 97,01 |
| RouterBench † | Calidad seleccionada | 79,83 | 52,71 |
| ContractNLI | Macro-F1 | 84,05 | 76,94 |
| ANLI | Macro-F1 | 78,29 | 67,48 |
| MMLU † | Accuracy | 82,93 | 77,24 |
| GPQA Diamond | Accuracy | 53,06 | 37,41 |
| ARC-Challenge † | Accuracy | 96,25 | 95,00 |
| HellaSwag | Accuracy | 96,48 | 95,31 |
| WinoGrande | Accuracy | 89,82 | 79,64 |
| GSM8K | Accuracy | 73,84 | 68,68 |
| MuSR | Accuracy | 65,82 | 45,66 |
| BRIGHT | nDCG@10 | 47,51 | 40,62 |
| CRUXEval | Accuracy | 78,07 | 65,21 |
| CLadder | Accuracy | 94,72 | 89,44 |
| HLE | Accuracy | 12,77 | 0,00 |
| MMLU-Pro | Accuracy | 68,40 | 64,46 |
| BBH | Accuracy | 88,61 | 83,49 |
| RAGTruth | F1 clase alucinada | 83,49 | 65,77 |
| HoVer | Accuracy | 89,25 | 78,50 |
| When2Call MCQ | Accuracy | 90,61 | 87,48 |

† Decision Index reporta estos datasets por separado y los excluye del Text Index.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,54B parámetros, en FP16 se requieren aproximadamente 9-10 GB de VRAM; en cuantización de 8 bits unos 5-6 GB; en 4 bits unos 3-4 GB (estimación orientativa, no publicada por el autor).
- GPU recomendadas: A100, H100 o L40S para throughput alto en lote; RTX 4090 (24 GB) para FP16 sin problemas; RTX 3090 (24 GB) y RTX 4080 (16 GB) también aptas en FP16.
- Cabe en GPU de consumo: sí, en RTX 4090, 3090, 4080 y previsiblemente en tarjetas de 12 GB con cuantización de 8 bits; en 4 bits podría caber en 8 GB.
- Opciones de despliegue: el autor proporciona código de inferencia propio en `inference/` con la clase `SingVLS1`, dependiente de PyTorch y torchvision; requiere Python 3.12. No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El batching por longitud con presupuesto de 65.536 tokens con padding por forward pass sugiere optimización para procesar muchas preguntas cortas en lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Text Index | Vision Index | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Sing VL S1 | 4,54B | no disponible | 70,95 | 77,158 | no disponible | Hugging Face |
| TypeSafe Jev 1.14 | no disponible | no disponible | 60,70 | — | no disponible | no disponible |
| StartLux-Decision v1.1 4B | 4B | no disponible | 67,8 | 67,90 | no disponible | no disponible |
| Perplexity Decider Flash v1.2 | 4B | no disponible | 60,1 | 72,5 | no disponible | no disponible |

Sing VL S1 lidera el panel Text con 70,95 y el panel Vision con 77,158 frente a las tres alternativas de la comparativa publicada por el autor.

## Limitaciones y advertencias

- Modelo de decisión, no de generación: no está pensado para producir texto libre, código o respuestas abiertas; su salida son probabilidades sobre opciones, proposiciones o niveles.
- Resultados débiles en algunos benchmarks: SGD/SGD-X (8,33 Macro-F1 no-skill, 0,00 skill), HLE (12,77 no-skill, 0,00 skill), ChessBench (26,88), R-Bench-M (49,77), MMMU-Pro vision (50,17) y SimpleBench (50,00), lo que indica limitaciones en razonamiento complejo, diálogo multi-dominio y tareas de altísima dificultad.
- Brecha entre modo skill y no-skill: en varios datasets el rendimiento cae notablemente con skill (por ejemplo, HLE de 12,77 a 0,00; Hateful Memes de 71,64 a 43,28; Humicroedit de 67,16 a 34,32), lo que sugiere sensibilidad al formato de prompt.
- Riesgo de alucinación: aunque el modelo puntúa alucinaciones en otros sistemas (RAGTruth 83,49), como decisor puede asignar probabilidades mal calibradas en dominios fuera de distribución.
- Sesgos: no se documentan análisis de sesgo; los resultados en moderación (Hateful Memes 71,64) y sarcasmo (iSarcasmEval 64,98) indican margen de mejora en detección de contenido sensible.
- Idiomas: no se especifica la cobertura lingüística; la evaluación publicada se centra en inglés, con un único resultado etiquetado como inglés en iSarcasmEval.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar antes de desplegar en producción.
- Dependencia de código de inferencia propio: no se documenta integración con servidores de inferencia estándar, lo que complica el despliegue escalado.
- Límite de cuatro imágenes por petición y tope de 1.638.400 píxeles por imagen en la evaluación de visión, lo que restringe escenarios con muchas imágenes o resoluciones muy altas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inclusionAI/SingVL_S1_4B
- Resultados de visión (JSON fijado): https://huggingface.co/datasets/echoxvf/SingVL_S1_4B-DI-results/blob/90ec7e159da6fa21d762f1f75876ea79049d0f4a/runs/singvl-s1-4b-vision/vision-scores.json
- No se han encontrado otros enlaces (papers, blogs, repos o demos) en la información proporcionada.
