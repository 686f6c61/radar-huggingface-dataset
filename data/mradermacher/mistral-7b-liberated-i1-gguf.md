# mradermacher/Mistral-7B-Liberated-i1-GGUF

## Resumen

Mistral-7B-Liberated-i1-GGUF es una recopilación de cuantizaciones GGUF generadas por mradermacher a partir del modelo Mistral-7B-Liberated, publicado por el usuario nurmix en Hugging Face. Se trata, por tanto, de un artefacto de distribución (un conjunto de ficheros cuantizados) y no de un modelo entrenado desde cero: el trabajo de mradermacher consiste en aplicar su pipeline de cuantización con imatrix (matriz de importancia) sobre los pesos originales para producir versiones de menor precisión utilizables en CPU y GPU de gama consumer.

El modelo base es una variante "liberated" de la arquitectura Mistral-7B, un transformer decoder-only denso de aproximadamente 7.248 millones de parámetros. La etiqueta "liberated" (liberado) suele asociarse en la comunidad a ajustes finos o ablaciones de alineamiento sobre modelos instruct, orientadas a reducir rechazos y filtros de seguridad; la model card no documenta el proceso concreto de entrenamiento ni los datos utilizados, por lo que ese extremo debe considerarse no verificado.

La relevancia de este repositorio es práctica: ofrece el modelo en 25 variantes de cuantización, desde IQ1_S (aproximadamente 1 bit por peso) hasta Q6_K, lo que permite ejecutarlo en hardware muy diverso, desde portátiles con poca RAM hasta estaciones de trabajo con GPU. Al no haber descargas ni likes registrados y carecer de licencia e idiomas declarados, conviene tratarlo como un artefacto experimental y verificar la licencia del modelo base antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (basado en Mistral-7B) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Mistral-7B original soporta 32.768 tokens; no confirmado para esta variante) |
| Tipos de cuantizacion | GGUF: Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small-IQ4_NL) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones con imatrix); repo de 39,9 GB |

## Arquitectura y entrenamiento

El modelo subyacente emplea la arquitectura Mistral-7B: un transformer decoder-only denso con atención de ventana deslizante (sliding window attention), activación SwiGLU, RMSNorm y RoPE, con group query attention. Esta ficha no puede confirmar si la variante "Liberated" modifica algún hiperparámetro arquitectónico, ya que la model card no aporta esa información.

Sobre el entrenamiento no hay datos verificables en la información proporcionada: no se especifican el número de tokens, la composición del dataset, ni si se aplicaron etapas de SFT, RLHF o DPO. La única información técnica disponible es la relativa al proceso de cuantización: mradermacher indica el uso de cuantizaciones ponderadas con imatrix y un pipeline de conversión (convert_type: hf, quantize_version 2, output_tensor_quantised 1), con etiqueta "nicoboss" que sugiere el uso de dicha herramienta de cuantización. No se documentan innovaciones como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto conversacional: el tag "conversational" indica que el modelo está orientado a diálogo multi-turno.
- Razonamiento general y respuesta a instrucciones, heredado del modelo base Mistral-7B (no verificado para esta variante).
- Generación de código y matemáticas: capacidad esperable en un modelo de 7B de la familia Mistral, aunque no hay evaluación publicada para esta variante concreta.
- Soporte de tool calling / function calling: no disponible; no se documenta en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; el modelo base Mistral-7B tiene cobertura multilingüe parcial, pero no se confirma para esta variante.
- Modo thinking, visión o audio: no soportado (modelo de texto).
- Compatibilidad con endpoints: el tag "endpoints_compatible" indica que los ficheros GGUF pueden servirse mediante infraestructura compatible con la API de endpoints de Hugging Face.

## Casos de uso

- Inferencia local en portátiles: las cuantizaciones IQ2/IQ3 y Q4 permiten ejecutar el modelo en CPU con 4-8 GB de RAM, útil para prototipos de asistentes conversacionales sin conexión.
- Experimentación con cuantización extrema: las variantes IQ1_S e IQ2_XXS sirven para estudiar la degradación de calidad frente al tamaño, comparando perplejidad entre niveles de cuantización.
- Despliegue en GPUs consumer: las variantes Q4_K_M y Q5_K_M caben en GPUs de 8-12 GB de VRAM y permiten servir un chatbot local con llama.cpp u Ollama.
- Evaluación de modelos "liberados": útil para investigadores que comparan el comportamiento de variantes sin alineamiento frente al Mistral-7B original en tareas de rechazo y seguimiento de instrucciones.
- Generación de texto en pipelines por lotes: con llama.cpp o vLLM (soporte GGUF experimental) se puede procesar grandes volúmenes de texto en hardware modesto.
- Base para ajuste fino posterior: los GGUF no son ideales para entrenamiento, pero el modelo base (nurmix/Mistral-7B-Liberated) puede servir de punto de partida para LoRA en tareas de dominio específico.
- Docencia y demostraciones: el reducido requisito de hardware facilita talleres sobre cuantización e inferencia local de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (aproximada, según cuantización): IQ1_S/IQ2_XXS en torno a 2-3 GB; IQ3/Q3_K en torno a 3,5-4,5 GB; Q4_K_M en torno a 4,5-5,5 GB; Q5_K_M en torno a 5,5-6,5 GB; Q6_K en torno a 6,5-7,5 GB. Estas cifras son estimaciones a partir del tamaño de parámetros y no están confirmadas en la información proporcionada.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para las cuantizaciones Q4-Q6; A100/H100 solo si se busca alto throughput con lotes grandes.
- Cabe en GPU consumer: sí, desde una GTX 1060 6 GB con cuantizaciones IQ2/IQ3 hasta una RTX 4090 con Q6_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF; el tag endpoints_compatible sugiere también despliegue vía Hugging Face Endpoints.
- Latencia y throughput: no disponibles; dependerán del hardware y del nivel de cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Mistral-7B-Liberated-i1-GGUF (este) | 7,25 B | no disponible | no disponible | GGUF, 25 cuantizaciones | Variante "liberada" sin documentación de entrenamiento |
| Mistral-7B-Instruct-v0.3 (oficial) | 7,25 B | 32.768 tokens | Apache 2.0 | Safetensors y GGUF de terceros | Referencia oficial con tool calling y licencia permisiva |
| Mistral-7B-v0.1 (base) | 7,25 B | 32.768 tokens | Apache 2.0 | Safetensors y múltiples GGUF | Modelo base original, sin ajuste instruct |
| Llama 3.1 8B Instruct | 8,03 B | 131.072 tokens | Llama 3.1 Community License | Safetensors y GGUF | Contexto mucho mayor y ecosistema amplio, con restricciones de licencia |

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base (nurmix/Mistral-7B-Liberated) y del Mistral-7B original antes de desplegarlo.
- Ausencia de documentación de entrenamiento: no se especifican datos, tokens ni método de alineamiento, lo que impide evaluar sesgos y calidad con rigor.
- Riesgo de alucinación: como todo LLM de 7B, especialmente en cuantizaciones de 1-2 bits, la fidelidad factual puede degradarse notablemente.
- Degradación por cuantización extrema: las variantes IQ1_S e IQ2_XXS sacrifican calidad de forma significativa; para producción conviene Q4_K_M o superior.
- Idiomas no declarados: no hay garantía de rendimiento en castellano ni en otros idiomas distintos del inglés.
- Modelo "liberado": la reducción de filtros de seguridad puede aumentar la probabilidad de generar contenido inapropiado o dañino; requiere moderación adicional en aplicaciones expuestas a usuarios.
- Sin tracción comunitaria: cero descargas y cero likes en el momento de la consulta; no hay validación independiente de la calidad de las cuantizaciones.
- Contexto no confirmado: aunque el Mistral-7B original soporta 32.768 tokens, no se verifica que esta variante conserve esa ventana.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Mistral-7B-Liberated-i1-GGUF
- Modelo base (referenciado en la model card): https://huggingface.co/nurmix/Mistral-7B-Liberated
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
