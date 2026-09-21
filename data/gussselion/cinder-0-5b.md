# GusssElion/cinder-0.5b

## Resumen

Cinder 0.5b es una versión cuantizada en formato GGUF del modelo Qwen/Qwen2-0.5B, publicada por el usuario GusssElion bajo el paraguas de la Gussstron Foundation (Ciudad del Cabo, Sudáfrica). El repositorio se presenta como "IA cívica soberana" y está etiquetado con idiomas propios de Sudáfrica (inglés, sesoto, zulú, xhosa, afrikáans y sesoto del norte), además de las etiquetas `civic-ai` y `south-africa`. Se trata, por tanto, de una distribución orientada a despliegue local y bajo coste, no de un modelo entrenado desde cero.

Técnicamente es un transformer decoder-only denso de aproximadamente 494 millones de parámetros (0,5B), con licencia Apache-2.0, cuantizado en Q4_K_M mediante el método imatrix. El tamaño del repositorio (0,4 GB) y su naturaleza GGUF lo sitúan en la franja de modelos ejecutables en CPU, dispositivos de borde y GPU de gama de entrada, sin necesidad de aceleradores de datacenter.

Su relevancia actual es limitada pero ilustrativa: apenas hay adopción (0 descargas, 0 likes) y no se han publicado evaluaciones, benchmarks ni detalles del proceso de ajuste. Sirve como ejemplo de cuantización comunitaria orientada a soberanía lingüística, pero debe tratarse con cautela en producción hasta que existan datos verificables sobre su comportamiento real en los idiomas declarados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (derivada del modelo base Qwen/Qwen2-0.5B) |
| Parámetros totales | 494.032.768 (recuento en safetensors del modelo base) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens según la documentación pública de Qwen2-0.5B; no confirmado en la ficha del repositorio |
| Tipos de cuantización | GGUF Q4_K_M, generada con imatrix (único tipo documentado) |
| Idiomas soportados | en, st, zu, xh, af, nso (declarados en los tags; sin evaluación publicada) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponible solo en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen2 en su variante de 0,5B: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings de posición rotatorios (RoPE) y sesgo en las proyecciones QKV. Según la documentación pública del modelo base, consta de 24 capas, dimensión oculta de 896, 14 cabezas de atención y 2 cabezas KV (Grouped Query Attention), con un vocabulario de 151.936 tokens y embeddings atados. El repositorio de Cinder no aporta ninguna variación estructural sobre esa base: los metadatos lo marcan explícitamente como cuantización (`base_model:quantized:Qwen/Qwen2-0.5B`), no como un ajuste fino.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF, DPO o cualquier otra técnica de alineación. La model card se limita a una descripción promocional ("South Africa's free civic AI from Cape Town, built by Gussstron Foundation") y a una captura de logs de Railway que muestra la carga del archivo GGUF. La única innovación técnica documentada es el uso de imatrix durante la cuantización, una técnica que pondera las matrices de importancia a partir de datos de calibración para minimizar la pérdida de calidad en cuantizaciones agresivas. No se especifica qué corpus se usó para calibrar el imatrix ni si ese corpus contenía los idiomas sudafricanos declarados.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2-0.5B.
- Razonamiento básico de un solo paso; no hay evidencia de modo "thinking" ni de cadena de pensamiento extendida.
- Generación de código de complejidad baja, limitada por el tamaño del modelo.
- Aritmética y matemáticas elementales; sin datos sobre rendimiento en GSM8K o similares.
- Soporte multilingüe declarado para sesoto (st), zulú (zu), xhosa (xh), afrikáans (af) y sesoto del norte (nso), pero sin verificación pública de calidad.
- Tool calling / function calling: no documentado. Qwen2-0.5B base no destaca en esta capacidad y la ficha de Cinder no la menciona.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades de visión o audio: no disponibles en este modelo (solo texto).
- Ejecución local sin conexión, al ser un archivo GGUF cuantizado.

## Casos de uso

- Enrutado y clasificación de consultas ciudadanas: dado su tamaño reducido, puede clasificar y derivar consultas de servicios públicos hacia el departamento correcto en tiempo real y sobre hardware modesto, actuando como primera capa de un sistema mayor.
- Respuestas FAQ multilingües en kioscos de autoservicio: desplegado en un dispositivo local sin GPU, puede atender preguntas frecuentes en inglés y, si la calidad declarada se confirma, en lenguas sudafricanas, sin coste de API ni dependencia de red.
- Prototipado rápido previo a un modelo mayor: sirve para validar prompts, flujos de conversación y esquemas de integración antes de migrar a un modelo de 7B o superior.
- Etiquetado y preprocesado en pipelines de NLP: clasificación de intenciones, extracción de entidades simples o resumen extractivo en lotes, donde el coste por token es determinante.
- Pruebas de integración en CI/CD: al pesar 0,4 GB y arrancar en CPU, se puede incluir como dependencia en tests automatizados que verifiquen el contrato de una API de inferencia sin consumir recursos de GPU.
- Despliegue en dispositivos de borde y sistemas desconectados: Raspberry Pi, mini-PC o portátiles de gama baja en zonas con conectividad limitada, que es precisamente el escenario que sugiere el discurso de "IA cívica soberana".
- Generación de borradores de texto administrativo: redacción asistida de respuestas de formularios o comunicaciones breves que un humano revisa después, con la advertencia de que el modelo es propenso a errores factuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, HellaSwag ni ninguna otra métrica, ni comparaciones con el modelo base sin cuantizar. Tampoco hay mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada en Q4_K_M: en torno a 0,5-1 GB, incluyendo el archivo de pesos (0,4 GB) y la caché KV para contextos moderados.
- VRAM estimada en FP16 sobre el modelo base: aproximadamente 1-1,5 GB.
- Cabe en cualquier GPU de consumo con 2 GB de VRAM o más (GTX 1050 Ti, RTX 3050, RTX 4060, etc.); no requiere A100 ni H100.
- Funciona íntegramente en CPU: basta con 1-2 GB de RAM libre. Es viable en Raspberry Pi 4/5, mini-PC y smartphones de gama media-alta.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. El soporte de vLLM para GGUF es parcial; TGI no está pensado para este formato.
- Latencia y throughput: no disponibles. No hay cifras publicadas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Idiomas declarados |
|---|---|---|---|---|---|
| Cinder 0.5b (este modelo) | 494 M | 32.768 tokens (según modelo base) | Apache-2.0 | GGUF Q4_K_M | en, st, zu, xh, af, nso |
| Qwen2-0.5B (base) | 494 M | 32.768 tokens | Apache-2.0 | safetensors | Mayoritariamente en y zh |
| Qwen2-0.5B-Instruct | 494 M | 32.768 tokens | Apache-2.0 | safetensors | Mayoritariamente en y zh |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache-2.0 | safetensors | Multilingüe amplio |

La diferencia sustantiva de Cinder 0.5b respecto a las alternativas no es de rendimiento ni de arquitectura, sino de distribución: ofrece pesos GGUF listos para inferencia local en un único archivo de 0,4 GB, algo que los repositorios oficiales de Qwen no publican de forma directa. Cualquier usuario puede obtener un resultado equivalente cuantizando Qwen2-0.5B por su cuenta con llama.cpp, con la ventaja de poder calibrar el imatrix con su propio corpus. No hay datos que permitan afirmar que Cinder supera al modelo base en los idiomas sudafricanos declarados.

## Limitaciones y advertencias

- Cero validación comunitaria: 0 descargas y 0 likes en el momento de la consulta. No existe evidencia externa de que el modelo funcione correctamente.
- Ausencia total de benchmarks: no se puede comparar su calidad con la del modelo base ni estimar la degradación introducida por la cuantización Q4_K_M.
- Idiomas declarados sin respaldo: los tags incluyen st, zu, xh, af y nso, pero Qwen2-0.5B es un modelo predominantemente anglófono y sin chino. Es probable que el soporte real de esas lenguas sea muy limitado, aunque no se puede confirmar ni descartar sin evaluación.
- Riesgo alto de alucinación: con 494 M de parámetros, el modelo carece de conocimiento factual fiable y tiende a inventar datos, especialmente en dominios especializados.
- Ambigüedad en las cifras: el README menciona "Sovereign 380M" y "469M" de forma inconsistente con el recuento real de safetensors (494.032.768). Esas cifras parecen referirse al archivo cuantizado, no al modelo.
- Model card escasa: no hay detalles de entrenamiento, calibración, evaluación ni uso previsto más allá de una captura de logs de despliegue.
- Ventana de contexto no verificada: aunque el modelo base soporta 32.768 tokens, no hay confirmación de que la configuración GGUF conserve esa longitud ni de que el modelo mantenga coherencia en contextos largos.
- Licencia Apache-2.0: permite uso comercial y modificación sin restricciones adicionales, pero al derivar del modelo base conviene mantener la atribución correspondiente.
- Sin soporte documentado de tool calling ni de flujos agénticos: no debe integrarse en pipelines que dependan de function calling sin una validación previa exhaustiva.
- Aviso de producción: no se recomienda su uso en atención al cliente real, trámites administrativos o cualquier tarea con consecuencias legales sin supervisión humana y sin una evaluación propia previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GusssElion/cinder-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2-0.5B
- Repositorio de la librería GGUF / llama.cpp: https://github.com/ggerganov/llama.cpp
- Repositorio de Ollama: https://github.com/ollama/ollama
- Documentación del modelo Qwen2: https://qwenlm.github.io/blog/qwen2/
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la búsqueda web realizada.
