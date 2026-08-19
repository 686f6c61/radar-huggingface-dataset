# nesilabs/tosilos-128b

## Resumen

Tosilos-128b es un modelo de lenguaje especializado en ciberseguridad, desarrollado por nesilabs mediante fine-tuning con QLoRA sobre el modelo base Mistral Medium 3.5 128B, de origen europeo. El ajuste se realizó sobre un corpus curado de aproximadamente 9.700 documentos técnicos completos (informes divulgados de HackerOne, writeups de bug bounty, HackTricks, MITRE ATT&CK, plantillas de Nuclei y exploits de Exploit-DB), junto con 5.050 pares de preguntas y respuestas verificados contra la fuente y un 25% de datos generales de replay. El resultado es un asistente de dominio para trabajo de seguridad autorizado, con una especialización medida de +1,2 puntos porcentuales en CyberMetric y +0,60 en el juez Opus-5 respecto al base, sin pérdida de capacidades generales.

El modelo tiene 127.704 millones de parámetros (127,7B), lo que lo sitúa en la gama alta de modelos densos. Aunque no se especifica la longitud de contexto, al estar basado en Mistral Medium 3.5 se espera una ventana amplia, pero este dato no está disponible en la documentación publicada. La licencia es "other" sin más detalles, y se distribuye tanto en formato safetensors (bf16, 391 GB) como en GGUF gracias a una conversión comunitaria. Su relevancia actual radica en ofrecer una alternativa europea, privada y sin rechazos para tareas ofensivas autorizadas, frente a modelos propietarios que suelen censurar contenido de seguridad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Mistral Medium 3.5 128B) |
| Parametros totales | 127.704.210.176 (127,7B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (original), GGUF Q3_K_M, GGUF Q4_K_M (~74,9 GB) |
| Idiomas soportados | no disponible (modelo europeo, sin lista publicada) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura base es la de Mistral Medium 3.5 128B, un transformer denso de 128.000 millones de parámetros aproximadamente, que probablemente incorpora capacidades multimodales (el ejemplo de uso emplea `AutoModelForImageTextToText` y el entrenamiento menciona "vision tower intacta"). El fine-tuning se realizó con QLoRA (r=64, alpha=128) sobre las proyecciones q/k/v/o y las capas gate/up/down, con cuantización 4-bit NF4 de doble cuantización, secuencia de 4096 tokens, 2 épocas sobre 6.666 ejemplos, tasa de aprendizaje 1e-4 con coseno y optimizador paged_adamw_8bit. El entrenamiento se ejecutó en una única GPU H200 de 141 GB, con una pérdida que descendió de 1,605 a 1,32 en 834 pasos. Los adaptadores LoRA se fusionaron posteriormente en los pesos base, dando lugar a un modelo completo sin dependencias externas adicionales.

El corpus de entrenamiento combina documentación técnica real de seguridad (informes divulgados, writeups, técnicas ofensivas y defensivas) con pares Q/A anclados a las fuentes, verificados para evitar contaminación de benchmarks. Se incluyó un 25% de datos generales para preservar las capacidades conversacionales y de razonamiento del modelo base.

## Capacidades

- Generación de texto y razonamiento avanzado sobre temas de ciberseguridad ofensiva y defensiva.
- Análisis de vulnerabilidades, interpretación de informes de bug bounty y explicación de técnicas de explotación.
- Soporte para desarrollo de exploits defensivos (análisis de PoCs, mitigaciones).
- Capacidades de DFIR (Digital Forensics and Incident Response) y detección de intrusiones.
- Generación de reglas de detección (por ejemplo, Sigma, YARA) a partir de descripciones de ataques.
- Posible soporte de visión (no confirmado explícitamente, pero el uso de `AutoModelForImageTextToText` sugiere que el base es multimodal).
- Sin rechazos para trabajo de seguridad autorizado (0% de refusals en el benchmark propio), a diferencia de modelos como Claude Opus 5 que rechazaron el 48% de las mismas preguntas.
- Capacidades multilingües no documentadas, aunque al ser un modelo europeo probablemente cubra varios idiomas de la región.

## Casos de uso

- Pentesting autorizado: el modelo puede guiar a un profesional en la fase de reconocimiento, enumeración y explotación de sistemas con autorización escrita, proporcionando comandos, payloads y técnicas específicas.
- Análisis de vulnerabilidades: dado un informe de bug bounty o un CVE, el modelo puede explicar la causa raíz, el impacto y las posibles mitigaciones, ayudando a priorizar parches.
- Desarrollo de exploits defensivos: permite redactar y revisar código de prueba de concepto (PoC) para validar vulnerabilidades en entornos controlados, con un enfoque en la defensa de la organización.
- Respuesta a incidentes (DFIR): asiste en la interpretación de artefactos forenses, correlación de eventos y reconstrucción de la cadena de ataque a partir de logs.
- Detección y reglas: genera reglas de detección (Sigma, YARA, Suricata) a partir de descripciones de comportamiento malicioso, mejorando la cobertura del SOC.
- Formación y educación: sirve como tutor interactivo para estudiantes de ciberseguridad, explicando conceptos de explotación, defensa y análisis con ejemplos prácticos y sin censura.

## Benchmarks y rendimiento

La model card publica una tabla de evaluación controlada (mismo harness para base y ajustado) con los siguientes resultados:

| Modelo | CyberMetric (500 MCQ) | Opus-5 domain judge (1-10) | Hacking refusals |
|---|---|---|---|
| Kimi k3 | 98,0% | 4,17 | 0% |
| Claude Opus 5 | 89,0% | 7,15 (autoevaluado) | 48% |
| Mixtral 8x22B base | 90,0% | 4,83 | 0% |
| Mistral Medium 3.5 base | 93,6% | 5,93 | 0% |
| **Tosilos-128b** | **94,8%** | **6,526 (+0,60)** | 0% |

Nota: el juez fue claude-opus-5 con 57 pares puntuados en orden aleatorio, descartando 28 ítems por rechazos del juez en contenido ofensivo. CyberMetric se midió el 2026-08-07 con el mismo cargador de 4 bits y las mismas 500 preguntas para base y ajustado.

## Requisitos de hardware

- VRAM estimada: en bf16 el modelo ocupa aproximadamente 256 GB (127,7B × 2 bytes), por lo que se necesitan múltiples GPUs de alta capacidad o una H200 de 141 GB con offload. En cuantización GGUF Q4_K_M (~74,9 GB) cabe en una GPU de 80 GB (A100, H100, o incluso una RTX 4090 de 24 GB con offload a CPU, aunque con rendimiento reducido).
- GPU recomendadas: H200 141 GB (usada en entrenamiento), A100 80 GB, H100 80 GB para inferencia en Q4. Para bf16 se requieren al menos 4× A100 80 GB o 2× H200.
- Opciones de despliegue: vLLM, TGI (Text Generation Inference), llama.cpp (para GGUF), Ollama (si se empaqueta el GGUF), o Transformers con `device_map="auto"` como en el ejemplo de la model card.
- Latencia y throughput: no disponibles en la documentación. Se espera que en Q4_K_M con una GPU de 80 GB la generación sea fluida para uso interactivo, pero no hay cifras publicadas.

## Comparativa con modelos similares

La tabla de benchmarks ya incluye comparaciones directas. A continuación se resumen las diferencias clave:

| Modelo | Parámetros | Contexto | CyberMetric | Refusals | Licencia |
|---|---|---|---|---|---|
| Tosilos-128b | 127,7B | no disponible | 94,8% | 0% | other |
| Mistral Medium 3.5 base | 128B | no disponible | 93,6% | 0% | propietaria (Mistral) |
| Mixtral 8x22B | 141B (MoE, 39B activos) | 64k | 90,0% | 0% | Apache 2.0 |
| Claude Opus 5 | no disponible | no disponible | 89,0% | 48% | propietaria |
| Kimi k3 | no disponible | no disponible | 98,0% | 0% | propietaria |

Tosilos se posiciona como una alternativa europea y sin censura para tareas de seguridad, con un rendimiento superior al base Mistral Medium 3.5 en el dominio, aunque por debajo de Kimi k3 en CyberMetric. Su principal ventaja es la ausencia de rechazos en contenido ofensivo autorizado, algo que modelos propietarios como Claude Opus 5 no ofrecen.

## Limitaciones y advertencias

- Uso dual: el modelo está diseñado para trabajo de seguridad autorizado, pero las técnicas ofensivas pueden ser mal utilizadas. El autor declara que el uso es responsabilidad exclusiva del usuario y solo contra sistemas con autorización escrita.
- Licencia "other" sin especificar: no se detallan los términos exactos, lo que puede limitar su uso comercial o en entornos corporativos sin una revisión legal previa.
- Sesgos y alucinaciones: al ser un fine-tuning sobre un corpus técnico, puede generar respuestas incorrectas o desactualizadas sobre vulnerabilidades específicas, especialmente si el contexto de la consulta es ambiguo. Se recomienda verificar cualquier comando o payload antes de ejecutarlo.
- Contexto no documentado: se desconoce la longitud máxima de contexto soportada, lo que dificulta planificar tareas que requieran ventanas muy largas.
- Idiomas no especificados: aunque es un modelo europeo, no se ha publicado la lista de idiomas soportados, por lo que su rendimiento en idiomas distintos del inglés técnico no está garantizado.
- Requisitos de hardware elevados: el tamaño de 128B hace que la inferencia en bf16 sea costosa; la cuantización Q4_K_M es la opción práctica para despliegues locales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nesilabs/tosilos-128b
- Conversión GGUF comunitaria (elsauto): https://huggingface.co/elsauto/tosilos-128b-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-Medium-3.5-128B
