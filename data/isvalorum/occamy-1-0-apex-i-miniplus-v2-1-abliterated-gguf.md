# IsValorum/Occamy-1.0-APEX-I-MiniPlus-V2.1-Abliterated-GGUF

## Resumen

Occamy-1.0 APEX-I-MiniPlus-V2.1 Abliterated GGUF es una cuantización de terceros, publicada por el usuario IsValorum, del modelo base Accio-Lab/occamy-1.0. Se distribuye exclusivamente en formato GGUF y su rasgo diferencial es doble: por un lado, una receta de cuantización artesanal tensor a tensor pensada para mantener la precisión de razonamiento de una arquitectura Mixture-of-Experts (MoE) dentro de un presupuesto de 13–14 GB; por otro, una edición "abliterated" o "uncensored" que elimina los vectores de rechazo del modelo original.

El modelo base es un MoE de 34.660.610.688 parámetros totales (unos 34,66 mil millones) con 40 capas y 256 micro-expertos según la model card, etiquetado con la arquitectura qwen35moe. El autor afirma soporte de contexto completo de 256K tokens en estaciones de trabajo de 24 GB de VRAM y velocidades de 24–28+ tokens/s cuando se descarga parte del modelo a memoria RAM del sistema.

Su relevancia práctica es acotada pero clara: no es un modelo nuevo, sino un artefacto de despliegue. Interesa a quien necesite ejecutar un MoE de ~35B en hardware de consumo o de gama alta de una sola GPU, con contexto largo y sin restricciones de contenido, y a quienes investiguen técnicas de abliteración y su efecto sobre el comportamiento del modelo. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validación independiente de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) de tipo transformer; etiqueta de arquitectura declarada "qwen35moe" |
| Parámetros totales | 34.660.610.688 (~34,66B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 256K tokens según la model card (el autor indica "full 256K context on 24GB workstations") |
| Tipos de cuantización | IQ3_XXS (expertos centrales), Q3_K (expertos de borde), Q5_K (experto compartido), Q4_K y Q6_K (atención), Q8_0 (gates de atención), Q6_K (cabeza de salida), F32 (routers). Proyector visual mmproj-Q8_0.gguf |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar (13 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); tamaño total del repositorio 15,3 GB, ~13,74 GiB de pesos según el autor |

## Arquitectura y entrenamiento

Se trata de una arquitectura MoE dispersa con 40 capas y 256 micro-expertos, según los datos aportados por el cuantizador. La model card no documenta el número de expertos activos por token, la dimensión oculta, el número de cabezas de atención ni la composición del dataset de entrenamiento del modelo base. La etiqueta qwen35moe sugiere que la familia arquitectónica deriva de la línea Qwen3.5 MoE, pero la ficha del repositorio no lo confirma de forma explícita, por lo que debe tratarse como indicio y no como dato verificado. No hay información disponible sobre el número de tokens de entrenamiento, la mezcla de datos ni si se aplicaron fases de RLHF, DPO u otro tipo de alineación en el modelo base.

La innovación declarada está en la cuantización y en la modificación de alineación, no en el entrenamiento. El autor describe una receta "tensor a tensor" que preserva los routers en F32 sin comprimir, protege la cabeza de salida en Q6_K, los gates de atención en Q8_0 y mantiene los expertos de razonamiento en 3 bits calibrados (IQ3_XXS/Q3_K), con el objetivo declarado de evitar picos de perplejidad, errores de sintaxis y bloqueos de descompresión AVX2 en CPU. La edición "abliterated" se describe como una abliteración direccional "Heretic TPE" que aísla y rota ortogonalmente las direcciones de rechazo por capa (componente attn.o_proj, con pesos entre 0,3400 y 1,1673), preservando supuestamente el conocimiento subyacente. Estas afirmaciones proceden del propio autor y no están verificadas de forma independiente.

## Capacidades

- Generación de texto conversacional y de razonamiento multi-paso, con etiquetas de "reasoning" y "conversational" y modo de pensamiento extendido (referencias a bloques `<think>` en la model card).
- Generación de código, incluido código de bajo nivel, con el sesgo declarado del autor de no emitir rechazos moralizantes.
- Capacidades de agente y tool calling: el repositorio está marcado como "endpoints_compatible" y la familia es compatible con llama.cpp, aunque la model card no documenta el formato exacto de llamada a herramientas.
- Multilingüismo en 13 idiomas: inglés, chino, español, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe.
- Visión: el repositorio incluye un proyector multimodal mmproj-Q8_0.gguf, que según el autor "preserva el condicionamiento visual completo". Debe tenerse en cuenta que el pipeline declarado del repositorio es text-generation y que las etiquetas no incluyen image-text-to-text.
- Ejecución en CPU con descarga parcial de pesos a RAM, gracias a la receta de cuantización orientada a evitar bloqueos de descompresión AVX2.
- Ausencia declarada de rechazos en dominios sensibles (seguridad, pentesting, exploits), con una tasa de rechazo reportada del 0,0%.

## Casos de uso

- Seguridad ofensiva autorizada y pentesting: el modelo responde sin rechazos a peticiones de scripts de reverse shell o explicaciones de explotación de buffer overflow, lo que lo hace utilizable en entornos de pruebas de intrusión con autorización formal, donde un modelo alineado estándar bloquearía la petición.
- Análisis de bajo nivel e ingeniería inversa: explicación detallada de mecánicas de memoria, registros EIP/ESP/EBP y disposición de marcos de pila en x86, útil como asistente en investigación de vulnerabilidades y análisis de binarios.
- Asistente de código local en entornos air-gapped: al distribuirse en GGUF y ejecutarse con llama.cpp sin conexión, puede desplegarse en redes aisladas donde no está permitido enviar código a APIs externas, con ~35B de parámetros totales y activación dispersa.
- Procesamiento de documentos largos: la ventana declarada de 256K tokens permite resumir, extraer y razonar sobre contratos, expedientes técnicos o bases de código extensas en una sola pasada, siempre que la VRAM disponible permita alojar la caché KV correspondiente.
- Atención al cliente multilingüe: cobertura declarada de 13 idiomas, incluidos español, francés, alemán, portugués, árabe y japonés, para conversaciones multi-turno en mercados diversos desde una única instancia.
- Investigación sobre alineación y abliteración: el artefacto sirve como material de estudio para medir el efecto de la extirpación de direcciones de rechazo sobre la distribución de logits (el autor reporta una divergencia KL de 0,0003 en prompts benignos), así como para reproducir pipelines de cuantización MoE personalizada.
- Generación de documentación técnica y de cumplimiento: con la censura desactivada, puede redactar procedimientos de respuesta a incidentes, políticas de seguridad o análisis de riesgos sin auto-censura, delegando el control de contenido en el filtrado posterior del pipeline.
- Despliegue en estación de trabajo de una sola GPU: con ~13,74 GiB de pesos y el proyector visual incluido, permite levantar un MoE multimodal en GPUs de 24 GB con descarga parcial a RAM, a velocidades declaradas de 24–28+ tokens/s.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MATH, GPQA ni similares) en la información disponible. La model card únicamente incluye métricas internas de fidelidad y de comportamiento de rechazo, aportadas por el propio autor y sin verificación independiente:

| Métrica | Occamy-1.0 original | APEX-I-MiniPlus V2.1 Abliterated | Método declarado |
|---|---|---|---|
| Tasa de rechazo ante prompts dañinos | ~92,4% | 0,0% | Sondas de comportamiento dañino (pentesting, exploits, generación de código) |
| Divergencia KL | 0,0000 (referencia) | 0,0003 | Cambio en la distribución de logits sobre prompts benignos (mlabonne/harmless_alpaca) |
| Alineación de la dirección de rechazo | 1,0000 (objetivo) | 0,0000 | Ortogonalización contra el subespacio de representación benigna |
| Dirección óptima de Pareto | no aplica | Por capa | Componente attn.o_proj (peso máx. 1,1673; peso mín. 0,3400) |
| Tamaño del modelo | ~70 GB (BF16) | 14,0 GB | Reducción declarada del 80,0% de VRAM, 80,0% de reducción con ejecución MoE completa |
| Proyector visual (mmproj) | no aplica | mmproj-Q8_0.gguf | Preserva el condicionamiento visual completo |
| Velocidad declarada con descarga a RAM | no disponible | +24 a 28+ tok/s | Streaming con parte del modelo en RAM del sistema (DDR4/DDR5) |

Las pruebas de inferencia por CLI que cita el autor (script de reverse shell en Python y explicación del desbordamiento de buffer en x86) se reportan como "PASS (0,0% de rechazo)" y son cualitativas, no cuantitativas.

## Requisitos de hardware

- VRAM para inferencia: los pesos ocupan ~13,74 GiB según el autor. Con contexto corto, la inferencia completa en VRAM requiere aproximadamente 14–16 GB, a lo que hay que sumar la caché KV.
- Caché KV a 256K de contexto: no disponible. No se documenta la configuración de atención del modelo base (número de capas KV, dimensiones por cabeza), por lo que no es posible estimar con rigor la VRAM necesaria para explotar la ventana completa. En la práctica, 256K tokens requieren bastante más memoria que los pesos en cualquier configuración habitual.
- GPU recomendadas para carga completa: RTX 4090, RTX 3090, RTX 5090 (24–32 GB), A100 40/80 GB, H100, L40S. Cualquier GPU con 24 GB o más puede alojar los pesos completos.
- GPUs de consumo de 16 GB (RTX 4080, RTX 4070 Ti Super, RTX 5080, A4000): permiten la carga completa de pesos con contexto limitado; el contexto largo exigirá descarga parcial a RAM.
- GPUs de 12 GB o menos (RTX 3060 12 GB, RTX 4070): viables solo con descarga parcial de capas a RAM del sistema, con la penalización de velocidad correspondiente.
- CPU y RAM: el autor reporta +24 a 28+ tokens/s con la mayor parte del modelo en RAM DDR4/DDR5, gracias a la selección de cuantizaciones orientada a evitar bloqueos de descompresión AVX2. Se requiere RAM suficiente para alojar las capas descargadas (en torno a 8–14 GB adicionales según el reparto).
- Opciones de despliegue: llama.cpp (principal, con soporte de mmproj para el componente visual), Ollama, LM Studio, koboldcpp, llama-cpp-python y cualquier frontend compatible con GGUF. El tag "endpoints_compatible" indica compatibilidad con APIs de tipo OpenAI. vLLM y TGI no soportan GGUF de forma nativa; para servirlos habría que convertir el modelo a safetensors.
- Latencia y throughput: solo se dispone de la cifra declarada por el autor (24–28+ tok/s con descarga a RAM). No hay datos de latencia de primer token ni de throughput con carga completa en VRAM.

## Comparativa con modelos similares

La información disponible no incluye comparaciones con modelos de terceros de la misma categoría ejecutados por el autor. La comparativa posible se limita a las variantes documentadas en la propia model card:

| Modelo | Expertos centrales | Expertos de borde | Experto compartido | Gates de atención | Cabeza de salida | Routers | Tamaño | Observaciones declaradas |
|---|---|---|---|---|---|---|---|---|
| Occamy-1.0 original (BF16) | sin cuantizar | sin cuantizar | sin cuantizar | sin cuantizar | sin cuantizar | sin cuantizar | ~70 GB | Modelo de referencia; licencia Apache 2.0 |
| APEX-I-Mini genérico (comunidad) | IQ2_S (2,50 bpw) | Q3_K (5 capas) | Q4_K / Q3_K | Comprimidos | Q3_K_M | Comprimidos | ~12,5 GB | Errores de sintaxis graves, indentación de código rota, perplejidad alta en `<think>` según el autor |
| MiniPlus V2 | IQ3_XXS | IQ3_S (10 capas) | IQ4_NL | Q8_0 | Q6_K | F32 | ~+1,2 GB sobre el genérico | Calidad prácticamente idéntica a V2.1 incluso a +160K de contexto; óptimo para descarga 100% en VRAM |
| MiniPlus V2.1 (este repositorio) | IQ3_XXS | Q3_K (10 capas) | Q5_K (40 capas) | Q8_0 | Q6_K | F32 | ~13,74 GiB | Menos de 100 MB de sobrecarga sobre V2; sin bloqueos AVX2; 24–28+ tok/s con descarga a RAM |

Comparativa con alternativas externas: no disponible en la información proporcionada. No se aportan datos frente a otros MoE de tamaño similar ni frente a modelos densos de ~30B.

## Limitaciones y advertencias

- Modelo "abliterated" / "uncensored": se ha eliminado deliberadamente la capacidad de rechazo. Esto lo hace inadecuado para despliegues públicos sin filtrado externo de contenido, y traslada toda la responsabilidad de moderación al integrador.
- La tasa de rechazo del 0,0% y la divergencia KL de 0,0003 son cifras autoinformadas por el cuantizador, sin reproducción independiente ni detalle completo de la metodología.
- No existen benchmarks de capacidad estándar (MMLU, HumanEval, GSM8K, etc.) publicados para esta variante, por lo que no puede evaluarse su degradación real respecto al modelo base en tareas de razonamiento.
- El repositorio muestra 0 descargas y 0 "likes": no hay validación de la comunidad ni informes de terceros sobre su comportamiento en producción.
- La abliteración puede degradar sutilmente capacidades de instrucción, coherencia en contextos largos o estabilidad del enrutado MoE. El autor afirma lo contrario, pero no aporta evaluaciones de capacidad que lo respalden.
- La ventana de 256K tokens está declarada, pero no se documenta la configuración de atención (por ejemplo, si emplea atención lineal, híbrida o ventana deslizante) ni la VRAM necesaria para la caché KV a esa longitud, lo que hace arriesgado asumir ese contexto en producción.
- El componente visual se distribuye como proyector mmproj-Q8_0.gguf, pero el pipeline declarado es text-generation y no hay ejemplos de uso multimodal ni evaluaciones de visión. Su funcionamiento no está verificado.
- Licencia: el repositorio declara apache-2.0, pero al ser una obra derivada conviene verificar la licencia del modelo base Accio-Lab/occamy-1.0 y las condiciones de la cuantización antes de uso comercial. La licencia Apache 2.0 no exime de responsabilidad por el contenido generado.
- La fecha de creación registrada (2026-09-19) y la ausencia de historial de versiones independiente dificultan trazar la procedencia exacta de los pesos; conviene verificar el hash de los ficheros descargados.
- La model card contiene afirmaciones de marketing ("límite tecnológico absoluto", "eliminación completa de vectores de rechazo") que no deben tomarse como hechos verificados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IsValorum/Occamy-1.0-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- Búsqueda web: no se han encontrado enlaces relevantes (papers, blogs, repositorios o demos) sobre este modelo en los resultados disponibles. Los resultados obtenidos corresponden a foros de televisión alemana y no guardan relación con el modelo.
