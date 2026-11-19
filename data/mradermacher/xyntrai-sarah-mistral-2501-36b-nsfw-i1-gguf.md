# mradermacher/xyntrai-Sarah-mistral-2501-36B-nsfw-i1-GGUF

## Resumen

xyntrai-Sarah-mistral-2501-36B-nsfw-i1-GGUF es una colección de cuantizaciones GGUF, generadas con imatrix, del modelo base xyntraistudios/xyntrai-sarah-mistral-2501-36B-NSFW. El trabajo de cuantización lo firma mradermacher, un autor habitual en el ecosistema de pesos comprimidos para llama.cpp, y el modelo subyacente se presenta como un fine-tune de la familia Mistral con 36 910 535 680 parámetros totales (unos 36,9 mil millones). La orientación explícita del modelo base es conversacional y "NSFW", es decir, está ajustado para contenido para adultos, y se distribuye bajo licencia Apache 2.0.

El interés práctico de este repositorio no está en la arquitectura (es un transformer denso derivado de Mistral, sin innovaciones declaradas) sino en la disponibilidad de pesos cuantizados en múltiples niveles, desde IQ1_S de 8,1 GB hasta Q6_K de 30,4 GB, lo que permite ejecutar un modelo de casi 37B en hardware de consumo mediante llama.cpp u Ollama. Al tratarse de un fine-tune sin model card técnica detallada, la información sobre datos de entrenamiento, contexto nativo y evaluación es prácticamente inexistente en la documentación proporcionada.

Es relevante ahora porque demuestra el patrón habitual de la comunidad: un fine-tune temático (en este caso, rol conversacional para adultos) se cuantiza con imatrix para hacerlo desplegable en GPU de gama media y alta, con la advertencia de que el contenido generado puede ser inapropiado para entornos productivos generales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Mistral (según tags del autor; detalles no disponibles) |
| Parámetros totales | 36 910 535 680 (~36,9B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (más fichero imatrix) |
| Idiomas soportados | Inglés (declarado en la model card); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); repo de 394 GB con todos los niveles |

## Arquitectura y entrenamiento

La información disponible indica únicamente que el modelo base es xyntraistudios/xyntrai-sarah-mistral-2501-36B-NSFW, etiquetado como "mistral" y "unsloth" en los tags. Esto sugiere un fine-tune realizado sobre una base Mistral (probablemente Mistral Small o una variante de ~36B) mediante las herramientas de Unsloth, orientado a conversación y contenido para adultos. No se especifican en la documentación proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o SFT.

Las cuantizaciones de este repositorio son de tipo i1 (imatrix), generadas con un fichero imatrix propio que el autor incluye en el repo (0,1 GB) para que otros puedan crear sus propias cuantizaciones. No hay innovaciones arquitectónicas destacables declaradas: es un transformer denso estándar cuantizado para inferencia en CPU/GPU con llama.cpp. La única particularidad técnica es el uso de cuantizaciones IQ (importancia) en lugar de las K-quant clásicas, lo que según las notas del autor mejora la relación calidad/tamaño en niveles bajos.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con orientación explícita a contenido para adultos (rol, narrativa y diálogo NSFW).
- Razonamiento general y respuesta a instrucciones, heredado del modelo base Mistral (sin evaluación publicada).
- Capacidades multilingües: no disponibles; la model card solo declara inglés.
- Tool calling / function calling: no declarado ni documentado.
- Soporte de agentes y razonamiento multi-paso: no declarado.
- Capacidades de visión o audio: no disponibles.
- Modo "thinking" explícito: no disponible.
- Ejecución local mediante llama.cpp, Ollama y otros runners compatibles con GGUF.

## Casos de uso

- Roleplay y narrativa interactiva para adultos: el fine-tune está ajustado específicamente para este dominio, y las cuantizaciones Q4_K_M (22,5 GB) o Q5_K_M (26,3 GB) permiten ejecutarlo en una RTX 4090 o A6000 con contexto moderado, manteniendo coherencia conversacional en sesiones largas.
- Generación creativa de ficción: útil para escribir relatos o diálogos con tono consistente, aprovechando el ajuste conversacional; conviene revisar el contenido por las restricciones de uso.
- Prototipado de chatbots temáticos en local: con la cuantización IQ3_M (16,6 GB) se puede desplegar en una GPU de 24 GB (RTX 3090/4090) para pruebas de UX sin depender de APIs externas.
- Investigación sobre cuantización: el repo incluye el fichero imatrix y 23 niveles de cuantización, lo que lo convierte en un banco de pruebas útil para medir la degradación de calidad entre IQ1_S (8,1 GB) y Q6_K (30,4 GB) en un modelo de ~37B.
- Despliegue en hardware modesto: la variante IQ2_M (12,6 GB) permite ejecutar el modelo en una GPU de 16 GB o en CPU con RAM suficiente, a costa de una pérdida de calidad notable.
- Evaluación de fine-tunes NSFW: investigadores que estudien alineación, seguridad y comportamiento de modelos ajustados pueden usar estas cuantizaciones para reproducir experimentos en local sin infraestructura de datacenter.
- Integración en pipelines de generación de contenido editorial para adultos: con la debida moderación y cumplimiento legal, el modelo puede asistir en la redacción de material de ficción para plataformas especializadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantizaciones no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el modelo base tampoco aporta datos de evaluación en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo completo en GPU, sin offload):
  - i1-IQ1_S (8,1 GB): ~9-10 GB con contexto corto.
  - i1-IQ2_M (12,6 GB): ~14 GB.
  - i1-IQ3_M (16,6 GB): ~18 GB.
  - i1-Q4_K_M (22,5 GB): ~24-26 GB.
  - i1-Q5_K_M (26,3 GB): ~28-30 GB.
  - i1-Q6_K (30,4 GB): ~32-34 GB.
- GPU recomendadas:
  - RTX 4090 (24 GB): IQ3_M y Q4_K_S/Q4_K_M con contexto moderado; Q4_K_M puede requerir offload parcial de capas a CPU.
  - RTX 3090 (24 GB): mismas opciones que la 4090, con menor throughput.
  - A6000 / RTX A6000 (48 GB): Q6_K completa con contexto amplio.
  - A100 40/80 GB y H100: Q6_K sin restricciones y throughput alto con vLLM (si se convierte a safetensors) o llama.cpp.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones IQ1_S a IQ3_M caben en GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB). Las Q4 en adelante requieren 24 GB o offload a CPU.
- Opciones de despliegue: llama.cpp (nativo para GGUF), Ollama (importando el GGUF), LM Studio, text-generation-webui, KoboldCpp y servidores compatibles con la API de OpenAI (el tag endpoints_compatible sugiere compatibilidad con endpoints). Para vLLM o TGI sería necesario convertir a safetensors, no incluido en este repo.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware, del nivel de cuantización y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| xyntrai-Sarah-mistral-2501-36B-nsfw-i1-GGUF (este) | ~36,9B | No disponible | Apache 2.0 | GGUF (i1) | Fine-tune NSFW, 23 cuantizaciones, sin benchmarks |
| Mistral Small 24B (referencia de familia) | ~24B | No disponible en esta ficha | Apache 2.0 (versiones recientes) | Safetensors, GGUF de terceros | Modelo generalista oficial de Mistral AI; no ajustado a NSFW |
| Modelos NSFW de ~30-40B cuantizados por mradermacher (p. ej. variantes de Yi/Llama) | 30-40B | Variable | Variable según base | GGUF | Mismo patrón de cuantización comunitaria; calidad dependiente del fine-tune |
| Mistral 7B / fine-tunes 7B-8B | ~7-8B | Variable | Apache 2.0 | GGUF | Mucho más ligeros (4-5 GB en Q4), menor calidad conversacional y menor huella de VRAM |

La comparación directa con modelos oficiales es limitada porque no hay benchmarks publicados para este fine-tune; la elección frente a alternativas debe basarse en el dominio (NSFW conversacional) y en la disponibilidad de cuantizaciones, no en métricas de rendimiento.

## Limitaciones y advertencias

- Contenido NSFW: el modelo está ajustado explícitamente para contenido para adultos; no es adecuado para aplicaciones dirigidas a menores ni para entornos corporativos sin moderación.
- Sesgos conocidos: no documentados; al ser un fine-tune sin evaluación publicada, se desconocen los sesgos de género, raza o ideología introducidos por el dataset de ajuste.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo de ~37B sin benchmarks, puede producir afirmaciones falsas con fluidez, especialmente en dominios factuales.
- Limitaciones de idioma: la model card solo declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Limitaciones de contexto: la longitud de contexto nativa no está disponible; las cuantizaciones bajas (IQ1, IQ2) degradan la coherencia en contextos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede infringir políticas de plataformas o legislación sobre material para adultos; la responsabilidad recae en el desplegador.
- Caveat de producción: el repo pesa 394 GB por incluir todos los niveles; conviene descargar solo la cuantización necesaria. La ausencia de model card técnica del modelo base impide verificar la procedencia exacta de los datos de entrenamiento.
- Calidad en cuantizaciones extremas: el propio autor advierte que IQ1_S es "for the desperate" y Q2_K_S "very low quality"; no usar por debajo de IQ3 para aplicaciones reales.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/xyntrai-Sarah-mistral-2501-36B-nsfw-i1-GGUF
- Modelo base: https://huggingface.co/xyntraistudios/xyntrai-sarah-mistral-2501-36B-NSFW
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/xyntrai-Sarah-mistral-2501-36B-nsfw-GGUF
- Página de overview del autor: https://hf.tst.eu/model#xyntrai-Sarah-mistral-2501-36B-nsfw-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
