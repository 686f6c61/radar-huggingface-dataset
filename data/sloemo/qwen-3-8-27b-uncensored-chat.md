# sloemo/qwen-3.8-27b-uncensored-chat

## Resumen

El modelo `sloemo/qwen-3.8-27b-uncensored-chat` es un fine-tune "uncensored" (abliterated) del modelo Qwen3.8-27B de Alibaba, desarrollado por el usuario sloemo y publicado como un Space de Hugging Face con interfaz Gradio. El objetivo es eliminar los rechazos y restricciones de contenido del modelo base, permitiendo conversaciones sin filtros sobre cualquier tema. Se sirve mediante llama.cpp sobre la infraestructura ZeroGPU de Hugging Face, lo que permite probarlo gratuitamente con cuotas diarias limitadas.

El modelo base Qwen3.8-27B es un transformer denso multimodal de 27.800 millones de parámetros, lanzado en agosto de 2026, que acepta texto, imagen y vídeo, con una ventana de contexto de 262.144 tokens y licencia Apache-2.0. El fine-tune abliterated conserva estas capacidades, pero reduce significativamente los rechazos en dominios como chat, codificación, razonamiento, uso de herramientas y trabajo con contexto largo. Está disponible en formato GGUF para ejecución local con llama.cpp u Ollama, y también se ofrece una versión con cuantización NVFP4.

La relevancia actual radica en la demanda de modelos sin censura para investigación, desarrollo de agentes y aplicaciones donde se requiere libertad de expresión, aunque con las advertencias éticas correspondientes. Al estar basado en un modelo de última generación con contexto muy amplio, ofrece un equilibrio entre capacidad técnica y flexibilidad de uso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto, imagen, vídeo) |
| Parametros totales | 27.8 mil millones |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF (Q8_0, Q4_K_M, etc.), NVFP4 |
| Idiomas soportados | no disponible (el modelo base soporta múltiples idiomas, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para el Space y despliegue local), safetensors (modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con arquitectura multimodal que procesa texto, imágenes y vídeo mediante un codificador visual y un decodificador de lenguaje. Fue entrenado con un corpus masivo de datos multimodales y optimizado con técnicas de alineación como RLHF y DPO, aunque los detalles exactos del entrenamiento no se han publicado en la información disponible.

El fine-tune "uncensored" se realizó mediante la técnica de *abliteration*, que consiste en eliminar o atenuar las capas o direcciones del espacio latente responsables de los comportamientos de rechazo. Este proceso se aplicó sobre el modelo base sin modificar sus capacidades generales, manteniendo el rendimiento en tareas de razonamiento, código y comprensión multimodal. El resultado es un modelo que responde a solicitudes que el original rechazaría, aunque con posibles efectos secundarios en la coherencia o la seguridad.

No se dispone de información detallada sobre el dataset de entrenamiento del fine-tune ni sobre el número de tokens utilizados. El Space de Hugging Face utiliza la versión GGUF Q8_0 del modelo, que pesa aproximadamente 29 GB, servida con llama.cpp sobre ZeroGPU.

## Capacidades

- Generación de texto libre y conversación multi-turno sin rechazos por contenido sensible.
- Razonamiento complejo y resolución de problemas matemáticos y lógicos.
- Generación de código en múltiples lenguajes de programación, con soporte para tool calling y function calling.
- Comprensión multimodal: acepta imágenes y vídeo como entrada, además de texto.
- Manejo de contexto muy largo (262.144 tokens), adecuado para documentos extensos o conversaciones prolongadas.
- Capacidad de razonamiento encadenado (chain-of-thought) y modo "thinking" opcional, según la configuración del Space.
- Soporte para agentes y flujos de trabajo multi-paso, gracias a su capacidad de usar herramientas y mantener estado.
- Multilingüismo: aunque no se especifican los idiomas exactos, el modelo base Qwen3.8-27B soporta numerosos idiomas, incluido el español.

## Casos de uso

- **Investigación académica sobre comportamiento de modelos**: el modelo permite estudiar cómo responden los LLM a temas controvertidos sin los sesgos de censura, útil para análisis de sesgos, alucinaciones y dinámicas de conversación.
- **Asistente de escritura creativa sin restricciones**: escritores y guionistas pueden explorar tramas, diálogos o escenas que otros modelos rechazarían, manteniendo la calidad narrativa gracias al contexto largo.
- **Análisis de documentos extensos**: con 262.144 tokens de contexto, se puede procesar libros completos, informes técnicos o contratos legales en una sola pasada, extrayendo información y resumiendo sin perder detalles.
- **Generación de código en entornos de desarrollo**: su soporte de tool calling permite integrarlo en pipelines de CI/CD para autocompletar, revisar o generar tests, aunque se debe validar la salida por su naturaleza sin censura.
- **Procesamiento de imágenes y vídeo**: al ser multimodal, puede describir contenido visual, responder preguntas sobre imágenes o transcribir vídeo, útil para accesibilidad o análisis de contenido.
- **Prototipado rápido de agentes conversacionales**: desarrolladores pueden crear asistentes virtuales o chatbots con personalidad sin filtros, usando la API del Space o ejecutándolo localmente con Ollama para pruebas.
- **Educación y formación en ética de IA**: sirve como ejemplo práctico de los riesgos y beneficios de los modelos sin alineación, para debates en aulas o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base Qwen3.8-27B ha demostrado un rendimiento competitivo en tareas como MMLU, HumanEval y GSM8K, pero no se dispone de cifras específicas para el fine-tune uncensored. Se recomienda consultar la documentación oficial de Qwen para obtener métricas del modelo base.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con cuantización Q8_0 (29 GB), se necesitan al menos 32 GB de VRAM para ejecutar el modelo completo. Con cuantizaciones más bajas (Q4_K_M, ~16 GB) puede caber en GPUs de 24 GB.
- **GPU recomendadas**: para Q8_0, una NVIDIA A100 40GB, RTX A6000 48GB o H100. Para Q4, una RTX 4090 24GB o RTX 3090 24GB son suficientes.
- **En consumer GPU**: sí, con cuantizaciones Q4 o Q5 en GPUs de 24 GB (RTX 3090/4090). Para Q8 se requiere hardware profesional o múltiples GPUs.
- **Opciones de despliegue**: llama.cpp (servidor local), Ollama, vLLM (si se convierte a formato compatible), o el Space de Hugging Face con ZeroGPU (gratuito con límite de ~5 min/día para visitantes, 40 min para PRO).
- **Latencia y throughput**: no se dispone de datos exactos. En ZeroGPU, la primera llamada tras un periodo de inactividad puede tardar 1-2 minutos (carga del modelo). En hardware local, con una RTX 4090 y Q4, se pueden esperar velocidades de 20-40 tokens/s, dependiendo de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Sin censura |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27.8B | 262.144 | Sí | Apache-2.0 | No |
| Qwen3.8-27B Uncensored (este) | 27.8B | 262.144 | Sí | Apache-2.0 | Sí |
| Llama-3.1-8B-Instruct-abliterated | 8B | 128.000 | No | Llama 3.1 | Sí |
| Mistral-7B-Instruct-abliterated | 7B | 32.000 | No | Apache-2.0 | Sí |

La comparativa se basa en información pública. El modelo destaca por su tamaño y contexto, superando a las alternativas abliterated más pequeñas, aunque requiere más recursos. No se dispone de comparativas de rendimiento numéricas.

## Limitaciones y advertencias

- **Contenido sin filtrar**: al eliminar los rechazos, el modelo puede generar contenido ofensivo, violento, ilegal o sexualmente explícito. No es adecuado para aplicaciones dirigidas a menores o entornos regulados.
- **Riesgo de alucinaciones**: como todos los LLM, puede inventar hechos, citas o datos, especialmente en temas especializados. La ausencia de censura no mejora la veracidad.
- **Sesgos y prejuicios**: el modelo base puede contener sesgos de género, raza o ideología, y el proceso de abliteration no los corrige; incluso podría amplificarlos al no filtrar respuestas.
- **Limitaciones de idioma**: no se especifican los idiomas soportados; aunque el base es multilingüe, el rendimiento en idiomas minoritarios puede ser inferior.
- **Restricciones de uso**: aunque la licencia es Apache-2.0, el uso comercial debe evaluarse cuidadosamente por el riesgo de responsabilidad legal derivado del contenido generado. Se recomienda uso exclusivamente para investigación.
- **Rendimiento en producción**: el Space de ZeroGPU tiene límites de cuota diaria y latencia de arranque en frío. Para producción, se necesita infraestructura propia con GPUs potentes.
- **Estabilidad del fine-tune**: la técnica de abliteration puede degradar ligeramente la coherencia o la capacidad de seguir instrucciones en comparación con el modelo base, aunque no se han publicado evaluaciones formales.

## Enlaces

- [Space de Hugging Face del modelo](https://huggingface.co/sloemo/qwen-3.8-27b-uncensored-chat)
- [Modelo base Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [GGUF uncensored de JonathanColetti](https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored-GGUF)
- [Space alternativo multimodal (MicroHERO)](https://huggingface.co/spaces/MicroHERO/qwen3.8-27b-uncensored-chat)
- [Guía para ejecutar localmente (OrcaRouter)](https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally)
- [Ficha en Atomic Chat](https://atomic.chat/models/qwen3-8-27b)
- [Ficha en NanoGPT](https://nano-gpt.com/models/text/qwen/qwen3.8-27b-uncensored)
