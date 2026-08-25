# nicolasembleton/Fastino-Nemotron-3.5-Lightning-Healthcare-MLX-8bit

## Resumen

Fastino-Nemotron-3.5-Lightning-Healthcare-MLX-8bit es la conversión a formato MLX del modelo Fastino-Nemotron-3.5-Lightning-Healthcare, un modelo de lenguaje especializado en el dominio sanitario y biomédico. El modelo original es un fine-tuning del checkpoint NVIDIA Nemotron 3.5 Lightning, realizado por Fastino mediante un agente autónomo de ajuste fino, y está pensado para tareas de generación de texto y conversación con conocimiento médico. La versión MLX aquí presentada está cuantizada a 8 bits con group size 64, lo que permite su ejecución en dispositivos Apple Silicon con el ecosistema MLX.

El modelo base se describe como un mixture-of-experts (MoE) de 30 000 millones de parámetros totales y 3 000 millones activos, aunque el checkpoint MLX reporta en sus safetensors 8 887 666 752 parámetros, una discrepancia que no se explica en la documentación disponible. La licencia es Apache 2.0, lo que facilita su uso comercial y académico. Este modelo es relevante porque combina la eficiencia de una arquitectura MoE con un entrenamiento específico para el sector salud, un área donde la precisión y el dominio del vocabulario médico son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Nemotron-H) |
| Parametros totales | 30 000 000 000 (modelo base) / 8 887 666 752 (checkpoint MLX) |
| Parametros activos | 3 000 000 000 (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine, group size 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Fastino-Nemotron-3.5-Lightning-Healthcare es un modelo de lenguaje de tipo Transformer con arquitectura Mixture-of-Experts (MoE), basado en el checkpoint NVIDIA Nemotron 3.5 Lightning (nombre técnico Nemotron-3.5-Lightning-30B-A3B). Según la información pública, tiene 30 000 millones de parámetros totales y 3 000 millones activos por token, lo que permite una inferencia más rápida y con menor coste computacional que un modelo denso de tamaño equivalente. La arquitectura incorpora la variante Nemotron-H, que introduce modificaciones en el mecanismo de atención y en la capa de normalización para mejorar la eficiencia y la estabilidad durante el entrenamiento.

El entrenamiento del modelo base consistió en un ajuste fino (fine-tuning) sobre el checkpoint de NVIDIA, utilizando un agente autónomo de Fastino que curó datos, generó recetas de entrenamiento, evaluó candidatos y diseñó experimentos de forma iterativa. Según el blog de Fastino, el objetivo fue especializar el modelo en tareas médicas y financieras; este checkpoint en concreto está enfocado en el ámbito sanitario. No se han publicado detalles sobre la cantidad de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La cuantización a 8 bits se aplicó posteriormente para la conversión a MLX, manteniendo la arquitectura original.

## Capacidades

- Generación de texto y conversación de dominio general, con especialización en vocabulario médico, biomédico y clínico.
- Razonamiento sobre preguntas de salud, interpretación de síntomas y soporte a documentación clínica.
- Capacidad multilingüe probable, aunque no se especifican idiomas concretos.
- No se documenta soporte explícito para tool calling, function calling ni agentes multi-paso en el modelo base ni en la conversión.
- No se mencionan capacidades multimodales (visión, audio) ni un modo de razonamiento explícito tipo thinking mode.

## Casos de uso

- **Asistencia a profesionales sanitarios**: el modelo puede responder preguntas sobre terminología médica, ayudar a redactar informes clínicos o resumir historiales, gracias a su entrenamiento específico en datos sanitarios.
- **Educación médica**: estudiantes de medicina pueden utilizarlo para aclarar conceptos, simular casos clínicos o preparar exámenes con explicaciones detalladas.
- **Atención al paciente**: integrado en un chatbot de un portal de salud, puede resolver dudas frecuentes sobre medicamentos, síntomas o cuidados preventivos, con un tono conversacional.
- **Análisis de literatura científica**: puede ayudar a extraer información de artículos biomédicos y resumir publicaciones, facilitando la revisión sistemática.
- **Redacción de documentación médica**: el modelo puede generar borradores de informes de laboratorio, cartas de derivación o notas de evolución, que luego un profesional revisa.
- **Búsqueda de información clínica**: al integrarse en un sistema de recuperación, puede ayudar a localizar y sintetizar información de bases de datos médicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para este modelo. Tampoco hay comparaciones cuantitativas con otros modelos de salud.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al estar cuantizado a 8 bits, el checkpoint MLX ocupa aproximadamente 33.6 GB en disco, por lo que se necesitan al menos 40 GB de VRAM para cargar el modelo completo en GPU. En Apple Silicon con MLX, la memoria unificada debe ser igualmente de al menos 40 GB.
- **GPU recomendadas**: para ejecutar la versión MLX se requieren chips Apple con memoria unificada amplia, como M2 Ultra, M3 Ultra o M4 Max con 64 GB o más. En GPU NVIDIA se puede usar vLLM o TGI con las versiones de peso en otros formatos (no se proporciona el checkpoint en formato GGUF o FP16 aquí).
- **¿Cabe en GPU de consumo?**: no, un modelo de este tamaño en 8 bits no cabe en tarjetas de 24 GB como la RTX 4090. Se necesitan soluciones de nivel profesional (A100, H100) o bien usar la versión MLX en Apple Silicon con memoria unificada.
- **Opciones de despliegue**: se puede ejecutar con mlx-lm (para Apple Silicon), o convertirlo a otro formato como GGUF para llama.cpp o Ollama, aunque no se ha publicado esa conversión. También se puede servir mediante vLLM o TGI si se obtienen los pesos en formato original (FP16/BF16).
- **Latencia y throughput**: no se proporcionan datos concretos. En un MoE con 3B activos, la latencia es menor que un modelo denso de 30B, pero depende del hardware y del tamaño de lote.

## Comparativa con modelos similares

No hay información sobre modelos directamente comparables en el mismo contexto de salud y tamaño. Se podría comparar con el modelo base NVIDIA Nemotron 3.5 Lightning (sin ajuste) o con otros modelos médicos como Med-PaLM o BioGPT, pero no se dispone de datos de rendimiento para establecer una comparativa rigurosa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Sesgos conocidos**: al ser un modelo de lenguaje, puede reflejar sesgos presentes en los datos de entrenamiento, especialmente en el ámbito médico donde los sesgos étnicos, de género o socioeconómicos pueden ser relevantes.
- **Riesgo de alucinación**: como todo LLM, puede generar información incorrecta o inventada, lo que es especialmente peligroso en contextos clínicos. No debe usarse como sustituto del criterio profesional.
- **Limitaciones de contexto**: la longitud de contexto no se ha especificado, por lo que no se puede garantizar un manejo adecuado de documentos largos.
- **Idiomas**: no se detallan los idiomas soportados; aunque el entrenamiento probablemente sea en inglés, no hay confirmación.
- **Licencia**: Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base de NVIDIA y de Fastino, ya que pueden existir restricciones adicionales.
- **Producción**: la discrepancia entre el número de parámetros reportado por safetensors y el modelo base indica una posible inconsistencia en la conversión, por lo que se debe validar el comportamiento del modelo antes de desplegarlo en entornos críticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nicolasembleton/Fastino-Nemotron-3.5-Lightning-Healthcare-MLX-8bit
- Modelo base: https://huggingface.co/fastino/Fastino-Nemotron-3.5-Lightning-Healthcare
- Blog de Fastino sobre el ajuste fino: https://fastino.ai/blog/learnings-from-fine-tuning-nvidia-nemotron-3.5-lightning-with-autonomous-agent
- Model card de NVIDIA Nemotron 3.5 Lightning: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
