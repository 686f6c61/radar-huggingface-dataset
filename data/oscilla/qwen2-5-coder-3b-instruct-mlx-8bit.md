# Oscilla/Qwen2.5-Coder-3B-Instruct-mlx-8Bit

## Resumen

Oscilla/Qwen2.5-Coder-3B-Instruct-mlx-8Bit es una conversión al formato MLX (Apple Silicon) del modelo original Qwen/Qwen2.5-Coder-3B-Instruct, cuantizado a 8 bits. El modelo base, desarrollado por Alibaba, es un decoder-only transformer de 3 000 millones de parámetros especializado en generación, razonamiento y reparación de código, con soporte de chat y tool calling. Esta variante MLX permite ejecutar el modelo de forma eficiente en Macs con chip Apple Silicon mediante la librería mlx-lm, manteniendo las capacidades del modelo original con un peso reducido de aproximadamente 3,3 GB.

La relevancia de esta conversión radica en que facilita el despliegue local de un modelo de código de tamaño medio en hardware de consumo, sin necesidad de GPUs dedicadas. Al estar cuantizado en 8 bits, ofrece un equilibrio entre calidad de salida y uso de memoria, siendo adecuado para tareas de autocompletado, asistencia en programación y generación de documentación técnica en entornos donde la privacidad o la ausencia de conexión son prioritarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 868 093 952 (segun ficha de HuggingFace; el modelo base declara 3 000 millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 768 tokens (segun documentacion del modelo base) |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | qwen-research (licencia de investigacion, no comercial) |
| Formato de pesos | MLX (safetensors en formato MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Coder-3B-Instruct emplea una arquitectura transformer estándar con atención causal, normalización RMSNorm y embeddings rotatorios (RoPE). Fue preentrenado sobre un corpus masivo de código y texto técnico, seguido de un ajuste fino supervisado (SFT) y optimización con preferencias humanas (RLHF) para alinear el comportamiento conversacional. La conversión a MLX no modifica la arquitectura ni los pesos; únicamente transforma el formato de almacenamiento y aplica cuantización de 8 bits para reducir el uso de memoria y acelerar la inferencia en hardware Apple.

El modelo soporta una ventana de contexto de hasta 32 768 tokens, lo que permite procesar archivos de código extensos o mantener conversaciones multi-turno largas. No se han publicado detalles adicionales sobre la composición exacta del dataset de entrenamiento en la información proporcionada.

## Capacidades

- Generacion de codigo en multiples lenguajes (Python, Java, C++, JavaScript, etc.) con sintaxis coherente y comentarios utiles.
- Razonamiento logico y matematico aplicado a problemas de programacion.
- Reparacion de codigo: identifica errores y sugiere correcciones.
- Soporte de chat conversacional con formato de mensajes y plantilla de chat.
- Tool calling / function calling: puede invocar funciones externas si se define el esquema adecuado.
- Capacidades multilingues limitadas al ingles en esta version; el modelo base tiene soporte multilingue, pero la model card indica solo ingles.
- Generacion de documentacion tecnica, explicaciones de algoritmos y resumen de codigo.

## Casos de uso

- Autocompletado de codigo en editores locales: el modelo puede integrarse en plugins de VS Code o Neovim para sugerir fragmentos de codigo en tiempo real, gracias a su bajo consumo de memoria y su formato MLX nativo para Mac.
- Asistente de programacion offline: ejecutable en portatiles Apple Silicon sin conexion, permite resolver dudas de sintaxis o disenar algoritmos en entornos aislados.
- Generacion de pruebas unitarias: dado un fragmento de codigo, el modelo produce casos de prueba y verifica la logica subyacente.
- Explicacion de codigo heredado: con su contexto de 32k tokens, puede analizar archivos largos y generar resumenes o diagramas de flujo.
- Chatbot de soporte tecnico interno: integrado en sistemas de ticketing, responde consultas sobre APIs y frameworks usando tool calling para consultar documentacion.
- Educacion y formacion: como tutor de programacion, genera ejercicios, corrige soluciones y ofrece retroalimentacion paso a paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen2.5-Coder-3B-Instruct reporta metricas en HumanEval, MBPP y otros conjuntos de datos de codigo, pero estos datos no se incluyen en la ficha de HuggingFace ni en los resultados de busqueda web. Se recomienda consultar la documentacion oficial del modelo base para obtener comparativas detalladas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,3 GB para el modelo cuantizado en 8 bits, mas overhead de runtime (total ~4 GB).
- GPU recomendadas: cualquier Mac con chip Apple Silicon (M1, M2, M3 o superior) con al menos 8 GB de memoria unificada.
- No requiere GPU NVIDIA; esta disenado exclusivamente para el ecosistema MLX.
- Opciones de despliegue: mlx-lm (libreria oficial), integrable en aplicaciones Python o via linea de comandos.
- Latencia: en un MacBook Pro M2 con 16 GB, la generacion de 100 tokens tarda aproximadamente 2-3 segundos en modo 8-bit (estimacion basada en modelos similares; no hay datos oficiales).
- Throughput: suficiente para aplicaciones interactivas en tiempo real; no apto para servidores de alta concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Oscilla/Qwen2.5-Coder-3B-Instruct-mlx-8Bit | 3B (base) | 32k | qwen-research | MLX 8-bit | Optimizado para Apple Silicon |
| Qwen2.5-Coder-3B-Instruct (original) | 3B | 32k | qwen-research | safetensors | Requiere GPU o CPU con mas memoria |
| CodeLlama-3B-Instruct | 3B | 16k | Llama 2 license | GGUF, safetensors | Menor contexto, licencia permisiva |
| StarCoder2-3B | 3B | 16k | BigCode OpenRAIL-M | safetensors | Enfocado en 600 lenguajes, sin chat |

La comparativa se basa en caracteristicas generales; no se dispone de benchmarks unificados para estos modelos.

## Limitaciones y advertencias

- Licencia qwen-research: restringe el uso a fines de investigacion y no permite explotacion comercial sin autorizacion expresa.
- El modelo esta entrenado principalmente en ingles; el rendimiento en otros idiomas puede ser inferior.
- Riesgo de alucinacion en codigo: puede generar funciones inexistentes o APIs incorrectas, especialmente en dominios poco representados.
- Sesgos potenciales derivados del corpus de entrenamiento, especialmente en tareas de generacion de codigo con nombres de variables o comentarios.
- La cuantizacion de 8 bits puede degradar ligeramente la calidad en tareas de razonamiento complejo comparado con el modelo de precision completa.
- No se garantiza compatibilidad con versiones futuras de mlx-lm; se recomienda fijar la version 0.31.2 usada en la conversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Oscilla/Qwen2.5-Coder-3B-Instruct-mlx-8Bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Version alternativa de LM Studio: https://huggingface.co/lmstudio-community/Qwen2.5-Coder-3B-Instruct-MLX-8bit
- Documentacion de mlx-lm: https://github.com/ml-explore/mlx-lm
- Modelo en Ollama: https://ollama.com/library/qwen2.5-coder:3b-instruct
