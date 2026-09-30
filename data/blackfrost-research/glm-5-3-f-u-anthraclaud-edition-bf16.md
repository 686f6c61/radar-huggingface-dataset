# Blackfrost-Research/GLM-5.3-F.U-AnthraClaud-Edition-BF16

## Resumen

GLM-5.3-F.U-AnthraClaud-Edition-BF16 es un derivado de pesos completos en precisión BF16 del checkpoint `zai-org/GLM-5.3-BF16`, publicado por Blackfrost-Research (Las Vegas, Nevada). Es un modelo de mezcla de expertos (MoE) de 753.329.940.480 parámetros almacenados sobre la arquitectura `GlmMoeDsaForCausalLM`: 78 capas principales más una capa de predicción multi-token (MTP), 256 expertos enrutados con top-8 activo por token más un experto compartido, tamaño oculto de 6.144, 64 cabezas de atención y un techo de contexto de 1.048.576 posiciones.

Su singularidad no es arquitectónica sino de alineación. Blackfrost aplica un proceso propietario de "de-risking" a nivel de pesos cuyo objetivo declarado es reducir las negativas del modelo, y lo distribuye bajo licencia comercial de 599 USD dirigida a empresas de seguridad, red teams autorizados, laboratorios de AI-safety y equipos de detección de contenido, siempre en entornos controlados. Según la model card, no se aplica SFT, DPO ni RLHF adicional, ni poda de expertos ni cuantización respecto al modelo base; el único cambio es el proceso de de-risking, cuyos métodos no se divulgan.

Es relevante por dos razones. Primero, es un maestro de referencia de 753B con contexto de 1M tokens en BF16, pensado como artefacto de conversión para derivados de despliegue (existe un derivado NVFP4 en repositorio aparte). Segundo, su modelo de distribución —pesos con alineación reducida tras un muro de pago— plantea cuestiones prácticas de gobernanza y responsabilidad. La ficha no publica ningún benchmark ni tasa de rechazo, y el repositorio acumula 16 descargas y 17 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `GlmMoeDsaForCausalLM` (transformer MoE con atención nativa GLM DSA); 78 capas principales + 1 capa de predicción multi-token (MTP) |
| Parámetros totales | 753.329.940.480 almacenados en safetensors (el autor indica "aproximadamente 753B") |
| Parámetros activos | No disponible. Configuración MoE: 256 expertos enrutados, top-8 activos por token, más 1 experto compartido. El autor no publica el recuento de parámetros activos |
| Longitud de contexto | 1.048.576 posiciones (techo arquitectónico). El autor advierte de que no es una asignación garantizada por petición |
| Tipos de cuantización | Master en BF16 con tensores de metadatos nativos en FP32. Existe un derivado NVFP4 (`GLM-5.3-DERISKED-NVFP4`) en repositorio separado. No se publican GGUF ni otras cuantizaciones |
| Idiomas soportados | Inglés y chino (en, zh) |
| Licencia | `blackfrost-commercial` (campo `license: other`), 599 USD. El checkpoint upstream sigue sujeto a la `GLM-5.3 License` |
| Formato de pesos | Safetensors BF16; 158 shards de modelo + 3 shards MTP |
| Tamaño oculto (hidden size) | 6.144 |
| Cabezas de atención | 64 |
| Vocabulario | 154.880 |
| Tensores / tamaño | 59.585 tensores; 1.506.659.919.872 bytes (≈1,37 TiB); repositorio de 1.506,7 GB |
| Muestreo recomendado | temperature 1,0 y top-p 0,95 |
| Repositorio | Blackfrost-Research/GLM-5.3-F.U-AnthraClaud-Edition-BF16; creado el 28-08-2026, actualizado el 29-09-2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos identificado como `GlmMoeDsaForCausalLM`, con 78 capas principales y una capa adicional de predicción multi-token. El enrutamiento MoE usa 256 expertos con los 8 más probables activos por token, más un experto compartido que se ejecuta siempre. El tamaño oculto es de 6.144 con 64 cabezas de atención y un vocabulario de 154.880 tokens. El modelo incorpora tokenizer, configuración de generación y plantilla de chat nativa de GLM dentro del artefacto, y expone tokens nativos de razonamiento y de llamada a herramientas. La capa MTP está presente en la release y el autor la describe como una optimización opcional que debe calificarse de forma independiente en el runtime elegido, ya que no todos los motores de servicio la explotan.

Sobre el entrenamiento no hay información sustantiva: la model card no publica número de tokens, composición del dataset, mezcla de idiomas ni detalles de la fase de post-entrenamiento del modelo base. La card sí detalla explícitamente lo que *no* se ha aplicado al derivado: SFT adicional, DPO, RLHF, poda de expertos y cuantización. La única modificación respecto a `zai-org/GLM-5.3-BF16` es el proceso propietario de de-risking a nivel de pesos, cuyos métodos no se revelan. Esto implica que las capacidades declaradas para GLM-5.3 (codificación y tareas de horizonte largo sobre contexto de 1M tokens) se heredan del modelo upstream y no han sido revalidadas por el autor del derivado: la propia card indica que no se reclama ninguna puntuación de capacidad ni de tasa de rechazo antes de completar la evaluación final.

## Capacidades

- Generación de texto conversacional en inglés y chino, con plantilla de chat nativa de GLM incluida en el artefacto.
- Razonamiento con tokens nativos: el autor exige un runtime que soporte los tokens de razonamiento de GLM-5.3 para un despliegue correcto.
- Llamada a herramientas (tool calling / function calling) mediante los tokens nativos de tool-call de GLM-5.3.
- Contexto largo: techo arquitectónico de 1.048.576 posiciones, apto para documentos, repositorios o historiales extensos si la memoria lo permite.
- Predicción multi-token (MTP) como mecanismo de decodificación acelerada, presente pero de calificación independiente.
- Capacidad declarada por el upstream GLM-5.3 para codificación y tareas de horizonte largo (según la descripción pública del modelo base recogida en openlm.ai).
- Comportamiento orientado a red teaming: el de-risking reduce las negativas del modelo, lo que habilita generar contenido que un modelo alineado estándar rechazaría.
- No se documentan capacidades de visión, audio ni multimodalidad en la información disponible.
- No se documenta explícitamente el soporte de agentes multi-paso, aunque los tokens nativos de tool-call y el contexto de 1M son la base técnica habitual para ello.

## Casos de uso

- Red teaming autorizado de sistemas de IA: generar intentos adversarios contra clasificadores, filtros y guardarraíles propios. El modelo es adecuado porque su alineación reducida permite explorar el espacio de entradas hostiles que un modelo convencional rechazaría, y la licencia está explícitamente pensada para este supuesto.
- Investigación en alineación y seguridad: estudiar cómo se comporta un modelo de 753B cuando se le retira parte del condicionamiento de rechazo, y comparar su distribución de salidas con la del checkpoint upstream `zai-org/GLM-5.3-BF16`, que actúa como control.
- Generación de datos adversarios para entrenar clasificadores de contenido: producir lotes de texto hostil etiquetado en inglés y chino, aprovechando el vocabulario de 154.880 tokens y el conocimiento bilingüe para cubrir ambos mercados.
- Evaluación comparativa de ecosistemas de inferencia: al ser un artefacto BF16 de 1,37 TiB con 59.585 tensores y capa MTP, sirve como carga de trabajo de referencia para medir paralelismo tensorial, eficiencia de kernels MoE y aprovechamiento de MTP en distintos motores de servicio.
- Auditoría de seguridad de código en repositorios completos: con 1M posiciones de contexto es posible cargar un repositorio entero y razonar sobre patrones de vulnerabilidad entre ficheros, algo inviable con ventanas de 32K o 128K.
- Análisis de documentación técnica y normativa extensa en chino e inglés: contratos, especificaciones o expedientes que superan el millón de tokens, con resumen y extracción estructurada vía tool calling.
- Despliegue air-gapped en entornos corporativos: el autor ofrece soporte para instalaciones aisladas y licencias empresariales, dirigidas a organizaciones que no pueden enviar datos a APIs externas.
- Base para derivados de despliegue: el repositorio se declara maestro de referencia de la familia, del que se derivan conversiones posteriores (por ejemplo, el NVFP4 orientado a serving de alto rendimiento en Blackwell), por lo que sirve como punto de partida para pipelines propios de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card indica de forma explícita que no se reclama ninguna puntuación de capacidad ni de tasa de rechazo antes de completar la evaluación final con jueces, y que los resultados se añadirán únicamente tras la cualificación. El autor solo reporta validación estructural: comprobaciones de integridad a nivel de índice sobre los 59.585 tensores y presencia de la capa MTP en la release. No hay datos de MMLU, HumanEval, GSM8K, ni comparaciones frente al modelo base.

## Requisitos de hardware

- VRAM para inferencia en BF16: el peso indexado ocupa 1.506.659.919.872 bytes (≈1,37 TiB). Solo para pesos hacen falta unas 19 GPU de 80 GB (H100/H200) en el mejor caso teórico; en la práctica se necesitan 24 o más para dejar sitio a caché KV, activaciones, workspaces del runtime y gráficos CUDA.
- GPU recomendadas: clústeres de NVIDIA H100 80 GB, H200 141 GB o B200/B300. El autor dirige el derivado NVFP4 específicamente a serving de alto rendimiento en Blackwell.
- GPU de consumo: no cabe. Ni siquiera agregando varias RTX 4090 de 24 GB (harían falta más de 60 unidades solo para los pesos) ni una sola workstation con 4× RTX 6000 Ada. Es un modelo de centro de datos.
- Caché KV: el autor no publica cifras. Con 78 capas, 64 cabezas de atención y un techo de 1M posiciones, el presupuesto de caché domina el dimensionamiento; el propio aviso de la card recuerda que el techo arquitectónico no es una asignación por petición y que el contexto de producción debe fijarse desde la memoria KV disponible.
- Opciones de despliegue: `transformers` (librería declarada) y stacks de serving con soporte nativo de `GlmMoeDsaForCausalLM`. El autor no nombra motores concretos más allá de exigir soporte nativo de los tokens de razonamiento y tool-call de GLM-5.3. No hay pesos GGUF, por lo que llama.cpp, Ollama y LM Studio no son opciones en este artefacto.
- MTP: tratar la decodificación multi-token como optimización opcional y calificarla por separado en el runtime elegido.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo, ni de escalado con paralelismo tensorial.
- Almacenamiento: prever al menos 1,5 TB para el checkpoint más el espacio temporal de descarga de los 158 shards.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato y licencia | Disponibilidad |
|---|---|---|---|---|
| GLM-5.3-F.U-AnthraClaud-Edition-BF16 (este) | 753,3 B MoE, 256 expertos, top-8 | 1.048.576 | Safetensors BF16; `blackfrost-commercial`, 599 USD | HuggingFace, con compra y acuerdo de licencia |
| zai-org/GLM-5.3-BF16 (upstream) | 753 B MoE | 1M | Safetensors BF16; el derivado remite a la `GLM-5.3 License`, mientras que la descripción pública de GLM-5.3 en openlm.ai la califica de MIT | HuggingFace, acceso abierto según la fuente citada |
| GLM-5.3-Flash-DERISKED-BF16 (Blackfrost) | 321,3 B según llm-explorer (VRAM estimada 237,1 GB en esa misma fuente) | No disponible | Safetensors BF16; licencia "other" | HuggingFace, mismo esquema comercial |
| GLM-5.3-Flash-DERISKED-NVFP4 (Blackfrost) | No disponible | No disponible | NVFP4; derivado de despliegue sin poda de expertos | HuggingFace |

Dos avisos sobre esta tabla. Primero, el propio derivado no publica comparativas de rendimiento frente a ninguna alternativa, por lo que la comparación es de metadatos y licencia, no de calidad. Segundo, existe una discrepancia documental sobre la licencia del modelo base: la model card del derivado enlaza un fichero `GLM-5.3 License` en el repositorio upstream, mientras que la descripción pública de GLM-5.3 en openlm.ai afirma licencia MIT. Conviene verificar el fichero de licencia real antes de cualquier uso comercial.

## Limitaciones y advertencias

- Reducción deliberada de la alineación: el producto se comercializa como "de-risked", es decir, con las negativas reducidas. El autor advierte literalmente de que "no es un modelo de stock de seguridad" y de que los operadores deben aportar control de acceso, registro, monitorización y aplicación de políticas, tratando la salida del modelo como no fiable. El riesgo de generar contenido dañino es, por diseño, superior al de un modelo alineado convencional.
- Métodos opacos: el proceso de de-risking es propietario y no se divulga. No es auditable ni reproducible, lo que dificulta evaluar qué se ha modificado exactamente en los pesos y si otras capacidades se han visto afectadas.
- Ausencia total de evaluaciones: no hay benchmarks, ni tasa de rechazo, ni evaluación de seguridad publicada. Toda afirmación de capacidad procede del modelo base y no ha sido revalidada por Blackfrost.
- Restricciones de licencia: el uso requiere un acuerdo comercial de 599 USD. Los destinatarios siguen siendo responsables del cumplimiento de los términos del upstream, de los controles de exportación y de la legislación local. El uso comercial sin licencia no está autorizado.
- Idiomas limitados: solo inglés y chino. No hay soporte declarado de castellano ni de otras lenguas, con la pérdida de calidad consecuente.
- Coste de hardware prohibitivo: 1,37 TiB de pesos en BF16 exigen un clúster multi-GPU de gama H100/H200/B200. No hay ruta de despliegue en hardware de consumo ni en GGUF.
- Contexto no garantizado: el 1M de posiciones es un techo arquitectónico, no una asignación por petición. En la práctica el contexto útil vendrá limitado por la memoria KV disponible.
- Riesgo de alucinación: inherente a la familia y no cuantificado en esta release, al no existir evaluación publicada.
- Sesgos: no se publica composición del dataset de entrenamiento ni proceso de filtrado. Con solo dos idiomas y sin documentación de datos, no es posible caracterizar sesgos culturales, políticos o de representación.
- Inconsistencia de nomenclatura: el repositorio figura como `Blackfrost-Research` en HuggingFace, mientras que la card y los resultados de búsqueda usan `Blackfrost-AI` y el título interno del modelo es distinto del identificador del repositorio. Conviene fijar el identificador exacto al automatizar descargas.
- MTP no universal: la capa de predicción multi-token puede no estar soportada por todos los motores de servicio; el autor pide cualificarla de forma independiente.
- Adopción marginal: 16 descargas y 17 likes. Hay poca comunidad validando el artefacto, lo que reduce la probabilidad de detectar problemas de integridad o comportamiento de forma temprana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Blackfrost-Research/GLM-5.3-F.U-AnthraClaud-Edition-BF16
- Modelo base upstream: https://huggingface.co/zai-org/GLM-5.3-BF16
- Licencia del modelo upstream: https://huggingface.co/zai-org/GLM-5.3-BF16/blob/main/LICENSE
- Derivado de despliegue NVFP4: https://huggingface.co/Blackfrost-AI/GLM-5.3-Flash-DERISKED-NVFP4
- Variante Flash DERISKED BF16: https://huggingface.co/Blackfrost-AI/GLM-5.3-Flash-DERISKED-BF16
- Ficha de la variante Flash en LLM Explorer: https://llm-explorer.com/model/Blackfrost-AI%2FGLM-5.3-Flash-DERISKED-BF16,6kNzsQteBaKmzltCVUMVCu
- Catálogo de modelos de Blackfrost: https://blackfrostai.com/models
- Catálogo y compra de licencias: https://redpillreader.com/models
- Perfil del autor en X: https://x.com/Blackfrost_AI
- Descripción pública de GLM-5.3: https://openlm.ai/glm-5.3/
