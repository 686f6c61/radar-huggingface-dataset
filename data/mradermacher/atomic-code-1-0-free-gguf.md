# mradermacher/Atomic-Code-1.0-Free-GGUF

## Resumen

Atomic-Code-1.0-Free es un modelo de lenguaje orientado a la generación de código, desarrollado por Korzadi y publicado bajo licencia Apache 2.0. Se trata de un ajuste fino (fine-tuning) del conocido Qwen2.5-Coder, realizado mediante QLoRA con la librería Unsloth, y especializado en el idioma español. El modelo base cuenta con aproximadamente 7.615 millones de parámetros, lo que lo sitúa en la categoría de modelos de 7B-8B, un tamaño que equilibra calidad y requisitos de hardware.

La ficha que nos ocupa corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, un conocido distribuidor de cuantizaciones estáticas para la comunidad. Esta versión permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, con un abanico de cuantizaciones que va desde Q2_K (3,1 GB) hasta f16 (15,3 GB). El modelo está etiquetado como conversacional y compatible con endpoints, lo que facilita su integración en servicios de inferencia.

Su relevancia actual radica en la combinación de tres factores: especialización en código, soporte nativo del español y disponibilidad en GGUF para despliegue local. Esto lo hace interesante para equipos hispanohablantes que necesitan un asistente de programación autoalojado sin depender de APIs externas. No obstante, la información pública disponible es muy limitada: no se han publicado benchmarks, detalles de entrenamiento ni especificaciones de contexto en la documentación consultada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder) |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | es (español) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder, un transformer decoder-only con atención causal estándar. El modelo original de Qwen2.5-Coder en su variante de 7B emplea atención con GQA (grouped-query attention) y RoPE para codificación posicional, aunque la model card consultada no detalla estos extremos para este ajuste concreto. El fine-tuning se realizó con QLoRA, una técnica de adaptación de bajo rango con cuantización de 4 bits durante el entrenamiento, gestionada mediante la librería Unsloth, que optimiza el uso de memoria y acelera el proceso.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Las etiquetas del repositorio indican los componentes `unsloth`, `qlora` y `qwen2.5-coder`, lo que confirma la metodología, pero no aporta detalles sobre los datos utilizados. La especialización declarada es el español y el código, aunque tampoco se especifica la proporción de cada dominio en el corpus de ajuste.

## Capacidades

- Generación de código en múltiples lenguajes de programación, heredada de la base Qwen2.5-Coder.
- Comprensión y generación de texto en español, con especial atención a contenido técnico y de programación.
- Formato conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible`).
- No se ha documentado soporte explícito de tool calling, function calling ni razonamiento multi-paso.
- No se ha documentado capacidad de visión, audio ni modo de razonamiento extendido (thinking mode).
- El alcance multilingüe declarado se limita al español; no se confirma soporte de otros idiomas.

## Casos de uso

- Asistente de programación autoalojado: el modelo puede integrarse en un servidor local con llama.cpp para ofrecer autocompletado y generación de funciones en un IDE, sin enviar código a servicios externos. Su tamaño de 7,6B permite ejecutarlo en una GPU de consumo con cuantización Q4_K_M.

- Generación de documentación técnica en español: gracias a su especialización en español y código, resulta adecuado para redactar docstrings, comentarios y manuales de API a partir del código fuente, manteniendo terminología técnica consistente.

- Traducción de documentación técnica inglés-español: el ajuste sobre Qwen2.5-Coder y su enfoque en español lo hacen útil para localizar READMEs, guías y referencias de librerías, aunque la licencia y la falta de benchmarks exigen validación manual.

- Chatbot de soporte para desarrolladores: con el formato conversacional y la ventana de contexto del modelo base (no confirmada en esta ficha), puede gestionar consultas técnicas multi-turno sobre errores de compilación, APIs y buenas prácticas.

- Refactorización asistida por lotes: mediante scripts que invocan el modelo a través de llama.cpp u Ollama, se pueden procesar repositorios completos para aplicar patrones de refactorización, generar pruebas unitarias o migrar código entre versiones de una librería.

- Entorno educativo de programación: al ser un modelo pequeño y con licencia permisiva, puede desplegarse en aulas o plataformas de formación para corregir ejercicios, explicar conceptos y generar ejemplos de código en español sin coste de API.

- Prototipado rápido de herramientas CLI: la etiqueta `endpoints_compatible` sugiere que puede exponerse como servicio compatible con la API de OpenAI, lo que facilita conectarlo a frameworks de agentes y pipelines de CI/CD para tareas de análisis estático o generación de changelogs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~3,1 GB; Q3_K_S ~3,6 GB; Q4_K_S ~4,6 GB; Q4_K_M ~4,8 GB; Q5_K_M ~5,4 GB; Q6_K ~6,4 GB; Q8_0 ~8,2 GB; f16 ~15,3 GB. A estas cifras hay que añadir el espacio para el contexto KV cache, que crece con la longitud de la ventana.
- GPU recomendadas: para Q4_K_M, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es suficiente; para Q8_0, se recomienda RTX 4070 Ti Super o superior; para f16, una RTX 4090 de 24 GB o una A100/H100 en entornos de servidor.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más usando cuantizaciones Q4 o Q5. Las cuantizaciones Q2 y Q3 permiten ejecución en GPUs de 4-6 GB o incluso en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF. Para el modelo base en safetensors, vLLM o TGI si se dispone de GPU con suficiente VRAM.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dependen en gran medida del hardware y del backend; como referencia cualitativa, un modelo de 7,6B en Q4_K_M sobre una RTX 4090 suele superar las decenas de tokens por segundo, pero no se aportan cifras verificadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Atomic-Code-1.0-Free (este) | ~7,6B | no disponible | Apache 2.0 | GGUF, safetensors | Fine-tuning de Qwen2.5-Coder especializado en español |
| Qwen2.5-Coder-7B | ~7,6B | 32.768 tokens (modelo base original) | Apache 2.0 | safetensors, GGUF | Modelo base; multilingüe, sin especialización en español |
| Aurora-Code-1-i1-GGUF | no disponible | no disponible | no disponible | GGUF | Otra cuantización de mradermacher orientada a código; datos insuficientes para comparar |
| DeepSeek-Coder-V2-Lite | ~15,7B (2,4B activos) | 128.000 tokens | DeepSeek License | safetensors, GGUF | MoE de mayor tamaño y contexto; requiere más VRAM |

La comparación con Qwen2.5-Coder-7B es la más directa, ya que este modelo deriva de él. La ventaja diferencial de Atomic-Code-1.0-Free es su ajuste al español; la desventaja es la ausencia de documentación sobre contexto, datos de entrenamiento y rendimiento. Frente a Aurora-Code-1-i1 no hay datos suficientes para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar la calidad del ajuste frente al modelo base ni frente a alternativas.
- La model card no documenta la longitud de contexto efectiva; se desconoce si se preserva la ventana original de Qwen2.5-Coder o si se ha reducido durante el fine-tuning.
- El alcance idiomático declarado es únicamente el español; el rendimiento en otros idiomas no está garantizado y podría degradarse respecto al modelo base.
- Riesgo de alucinación inherente a los modelos de 7B, especialmente en APIs poco comunes o código reciente no presente en los datos de entrenamiento.
- No se documentan sesgos específicos, pero al derivar de Qwen2.5-Coder hereda los sesgos del corpus original, no auditados en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero al ser un derivado de Qwen2.5-Coder conviene revisar las condiciones del modelo base por si existieran obligaciones adicionales de atribución.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_M) pueden degradar notablemente la calidad en tareas de código, donde la exactitud sintáctica es crítica; se recomienda Q4_K_M o superior para producción.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se confirma soporte de tool calling ni de agentes; su uso en pipelines automatizados requiere validación previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Atomic-Code-1.0-Free-GGUF
- Modelo base: https://huggingface.co/Korzadi/Atomic-Code-1.0-Free
- Página de descargas de mradermacher para este modelo: https://hf.tst.eu/model#Atomic-Code-1.0-Free-GGUF
- Repositorio de peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Modelo comparable en el ecosistema de mradermacher: https://huggingface.co/mradermacher/Aurora-Code-1-i1-GGUF
