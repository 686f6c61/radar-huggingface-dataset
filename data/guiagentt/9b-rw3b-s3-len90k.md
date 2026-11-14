# GUIAgentt/9b-rw3b-s3-len90k

## Resumen

9b-rw3b-s3-len90k es un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario GUIAgentt y publicado en Hugging Face bajo licencia Apache 2.0. El modelo está especializado como agente GUI para entornos web: es decir, se ha entrenado para interpretar capturas de pantalla y el estado de una interfaz web y emitir acciones (clics, escritura, navegación) con el objetivo de completar tareas de forma autónoma. La nomenclatura del repositorio indica que se trata de la etapa 3 de un pipeline de entrenamiento denominado "rw3b", con una longitud máxima de secuencia de 90.000 tokens, 3 épocas y 4 nodos de cómputo.

El modelo hereda la arquitectura y el tamaño del Qwen3.5-9B original, aunque la model card no detalla parámetros, contexto nativo ni composición del dataset de ajuste. La información pública disponible es muy limitada: no se han publicado resultados de benchmarks, no se especifican los idiomas soportados y el repositorio no registra descargas ni interacciones en el momento de la consulta.

Su relevancia es acotada pero específica: cubre el nicho de agentes web de código abierto construidos sobre un modelo de 9.000 millones de parámetros, un tamaño que permite despliegue en hardware de gama alta de consumo con cuantización, y cuya licencia permisiva facilita su integración en productos comerciales. No obstante, la ausencia de evaluación publicada obliga a validar su comportamiento antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-9B; detalles no disponibles) |
| Parámetros totales | 9B (según el nombre del modelo y el modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 90k (longitud máxima de entrenamiento declarada) |
| Tipos de cuantización | no disponible (el repositorio no publica variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se infiere safetensors por el ecosistema Qwen, pero no se confirma) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de Qwen3.5-9B, un transformer denso de aproximadamente 9.000 millones de parámetros. La model card no describe modificaciones arquitectónicas respecto al modelo base, por lo que se asume que conserva su diseño original: atención estándar, tokenizador y cabecera de lenguaje sin cambios. No se documenta el uso de decodificación especulativa, atención lineal ni técnicas híbridas.

El entrenamiento se realizó en la etapa 3 de un pipeline llamado "rw3b", con una longitud máxima de secuencia de 90.000 tokens, 3 épocas y 4 nodos de cómputo. No se especifica el volumen de datos, la composición del dataset (número de trayectorias web, dominios cubiertos, proporción de datos sintéticos frente a reales), ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card únicamente recomienda una configuración de muestreo para inferencia: temperatura 0.6, top_p 0.95, top_k 20 y max_tokens 16384 en modo thinking, lo que sugiere que el modelo conserva la capacidad de razonamiento extendido del Qwen3.5 base.

## Capacidades

- Agente GUI web: interpreta el estado de una interfaz (capturas de pantalla y/o estructura de la página) y genera acciones para completar tareas de navegación.
- Razonamiento multi-paso: el modo thinking con hasta 16.384 tokens de salida permite planificar secuencias de acciones antes de ejecutarlas.
- Contexto largo: la ventana de 90.000 tokens admite historiales extensos de interacción, múltiples capturas de pantalla y el DOM completo de páginas complejas.
- Generación de texto y razonamiento general: heredadas del Qwen3.5-9B base, aunque no se documenta su preservación tras el ajuste.
- Tool calling / function calling: no disponible explícitamente en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio): no disponibles; el ajuste se describe como agente GUI, lo que implica entrada visual, pero la model card no confirma la modalidad de entrada.

## Casos de uso

- Automatización de pruebas end-to-end web: el modelo puede ejecutar flujos de navegación sobre una aplicación (login, formularios, checkout) y verificar el estado final, sustituyendo scripts frágiles basados en selectores CSS por un agente que interpreta la interfaz.
- Extracción de datos de portales sin API: dado un objetivo (por ejemplo, recopilar precios de un catálogo), el agente navega, pagina y recopila la información, aprovechando la ventana de 90k tokens para mantener el contexto de sesiones largas.
- Asistencia a usuarios en tareas web guiadas: un copiloto que observa la pantalla del usuario y sugiere o ejecuta el siguiente paso en trámites administrativos o portales de autoservicio.
- RPA ligero en pymes: sustitución de herramientas de automatización propietarias por un agente open source desplegable en infraestructura propia, con licencia Apache 2.0 sin coste por asiento.
- Generación de datos sintéticos de trayectorias: uso del modelo para producir trayectorias de navegación etiquetadas que alimenten el entrenamiento de otros agentes o la evaluación de sistemas existentes.
- Investigación en agentes web: banco de pruebas reproducible para estudiar planificación, recuperación de errores y uso de contexto largo en entornos GUI, al ser un full fine-tune con hiperparámetros documentados (etapa, épocas, longitud).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18-20 GB solo para pesos, más overhead de KV cache; con contexto de 90k tokens la caché puede añadir decenas de GB, por lo que la ventana completa exige GPUs de 80 GB (A100/H100) o paralelismo tensorial.
- Cuantización a 8 bits: unos 10-12 GB de pesos; a 4 bits: unos 6-7 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 80 GB o H100 para contexto completo sin cuantizar; RTX 4090 (24 GB) viable en FP16 con contexto moderado o en cuantización 8/4 bits.
- GPU de consumo: cabe en RTX 4090 y, con cuantización agresiva, en GPUs de 12-16 GB, siempre que se limite la longitud de contexto.
- Opciones de despliegue: vLLM o TGI para serving con PagedAttention; llama.cpp/Ollama solo si se generan pesos GGUF propios, ya que el repositorio no los incluye.
- Latencia y throughput: no disponibles; el modo thinking con hasta 16.384 tokens de salida incrementa notablemente la latencia por acción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 9b-rw3b-s3-len90k | 9B | 90k (entrenamiento) | Agente GUI web | Apache 2.0 | Hugging Face, sin cuantizaciones publicadas |
| Qwen3.5-9B (base) | 9B | no disponible en esta ficha | Propósito general | Apache 2.0 | Hugging Face, ecosistema amplio |
| Alternativas de agente GUI open source | no disponible | no disponible | Agente GUI | variable | no disponible |

La comparación con otros agentes GUI de código abierto no puede completarse con los datos proporcionados; se recomienda evaluar el modelo frente al Qwen3.5-9B base en las mismas tareas para medir la ganancia real del ajuste.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay benchmarks, ablaciones ni comparaciones con el modelo base, por lo que el rendimiento real como agente es desconocido.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni de validación externa.
- Riesgo de alucinación de acciones: como agente GUI, puede generar clics o rutas inexistentes, con efectos potencialmente destructivos si opera sobre sistemas reales sin supervisión.
- Sesgos desconocidos: al no documentarse la composición del dataset de ajuste, no es posible evaluar sesgos de dominio, idioma o demografía.
- Idiomas no declarados: se desconoce si el ajuste conserva el multilingüismo del modelo base o lo ha degradado hacia el inglés.
- Contexto de 90k costoso: la ventana completa requiere hardware de数据中心 y aumenta la latencia; en la práctica conviene truncar el historial.
- Licencia Apache 2.0 permite uso comercial, pero la falta de garantías y de documentación traslada todo el riesgo de validación al integrador.
- Formato de pesos no confirmado: verificar los ficheros del repositorio antes de planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GUIAgentt/9b-rw3b-s3-len90k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
