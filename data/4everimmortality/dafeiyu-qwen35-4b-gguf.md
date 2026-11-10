# 4everImmortality/dafeiyu-qwen35-4b-gguf

## Resumen

Dafeiyu V2 es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario 4everImmortality, orientado a la interpretación de un personaje (roleplay) de VTuber/anime llamado "Dafeiyu" (大肥鱼), una chica ballena de pelo azul con personalidad tsundere. El modelo se distribuye exclusivamente en formato GGUF cuantizado a Q4_K_M, empaquetado para su uso directo con llama.cpp y Ollama, lo que lo hace desplegable en hardware de consumo y en dispositivos de borde.

El fine-tune se realizó mediante DoRA (Weight-Decomposed LoRA), una variante de LoRA que descompone los pesos en magnitud y dirección para mejorar la estabilidad del ajuste. La model card destaca la conversión con `--no-mtp` para evitar desalineaciones de tensores provocadas por la capa draft de MTP (multi-token prediction) del modelo base, y declara un contexto nativo de 262.144 tokens heredado de Qwen 3.5.

El modelo es relevante para un nicho muy concreto: aplicaciones de chat con personaje, VTubing, asistentes con personalidad y despliegues locales de bajo coste. No está pensado como modelo de propósito general ni para tareas de razonamiento o código; su valor está en la fidelidad de la persona y en la facilidad de ejecución en local. Los idiomas declarados son chino (zh) e inglés (en).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen 3.5 4B); ajuste fino DoRA |
| Parametros totales | 4B (según modelo base Qwen/Qwen3.5-4B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens (256K), según la model card |
| Tipos de cuantizacion | Q4_K_M (única publicada en este repositorio) |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | other (no especificada en detalle; hereda del modelo base) |
| Formato de pesos | GGUF (archivo `dafeiyu_qwen35_4b_nomtp_q4_k_m.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de 4.000 millones de parámetros. Sobre esa base se aplicó un ajuste fino supervisado con DoRA (Weight-Decomposed LoRA), técnica que descompone cada matriz de pesos en un componente de magnitud y otro de dirección, aplicando la actualización de bajo rango sobre la dirección. La model card no detalla el volumen de datos de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; esa información no está disponible.

La innovación técnica documentada por el autor es la conversión a GGUF con la opción `--no-mtp`, que elimina la capa draft de multi-token prediction del modelo base. Según la model card, esto evita errores de desalineación de tensores al cargar el modelo en llama.cpp y Ollama, de modo que el GGUF funciona sin pasos adicionales de reparación. El contexto nativo de 256K se hereda del modelo base. No se documentan técnicas adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de texto conversacional con una persona definida de forma explícita (ballena VTuber tsundere, aficionada al arroz blanco caliente).
- Interpretación de personaje (roleplay) con estilo de lenguaje coloquial y "cero sabor a IA mecánica", según la model card.
- Conversaciones multi-turno con contexto largo gracias a la ventana de 262.144 tokens.
- Comprensión y generación en chino e inglés.
- Ejecución local en llama.cpp y Ollama mediante GGUF.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".

## Casos de uso

- Chatbot de personaje para comunidades de VTubing: el modelo mantiene la persona de Dafeiyu en conversaciones multi-turno y puede integrarse en un bot de Discord o Telegram mediante Ollama, con el system prompt de la model card para fijar el carácter.
- Asistente de streaming en directo: como copiloto de chat para un VTuber real, generando respuestas en chino o inglés con el tono tsundere definido, ejecutándose en local para evitar latencia de red y costes de API.
- Roleplay y ficción interactiva: sesiones largas de juego de rol donde el contexto de 256K permite conservar el historial completo de la partida sin truncar.
- Despliegue en dispositivos de borde: la cuantización Q4_K_M y los 4B de parámetros permiten descarga completa en GPU en placas como Jetson AGX Orin, según la model card, para asistentes de voz o kioscos interactivos sin conexión.
- Prototipado de personajes con personalidad: base para equipos que quieran evaluar pipelines de fine-tune DoRA + GGUF antes de invertir en un modelo mayor.
- Aplicaciones educativas o de entretenimiento en chino: práctica de conversación informal con un personaje consistente, útil para demostraciones de IA conversacional con identidad propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB para el GGUF Q4_K_M de un modelo de 4B (estimación basada en el tamaño típico de Q4_K_M, no confirmada en la model card).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para descarga completa; el autor cita explícitamente Jetson AGX Orin como dispositivo de borde validado.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060, RTX 4090 y similares; también en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp y Ollama (documentados por el autor); vLLM y TGI no están confirmados para este GGUF, aunque podrían requerir el modelo en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Dafeiyu V2 (este) | 4B | 262.144 | GGUF Q4_K_M | other | Roleplay VTuber zh/en |
| Qwen/Qwen3.5-4B (base) | 4B | 262.144 | safetensors, GGUF | según Qwen | Propósito general |
| Fine-tunes de personaje sobre bases de 3-8B | 3-8B | variable | GGUF, safetensors | variable | Roleplay |

La comparación con alternativas concretas de la misma categoría (fine-tunes de personaje) no está disponible en la información proporcionada. Frente a su modelo base, la diferencia principal es la persona fijada y el empaquetado GGUF listo para Ollama; el resto de capacidades se heredan de Qwen 3.5 4B.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un fine-tune de personaje, puede reproducir estereotipos propios del rol tsundere y del material de entrenamiento no especificado.
- Riesgo de alucinación: alto en tareas factuales, ya que el ajuste está orientado a la persona y no se documenta entrenamiento en veracidad.
- Limitaciones de idioma: solo chino e inglés declarados; el rendimiento en castellano no está garantizado.
- Licencia "other": no se detallan los términos; es imprescindible revisar la licencia del modelo base Qwen 3.5 4B antes de cualquier uso comercial, y la model card no aclara restricciones adicionales del fine-tune.
- Solo se publica Q4_K_M: no hay versiones en mayor precisión ni safetensors del fine-tune, lo que limita el reajuste o la conversión a otros formatos.
- Sin benchmarks ni métricas de calidad: no hay evidencia publicada de fidelidad de la persona ni de degradación por cuantización.
- Cero descargas y likes en el momento de la ficha: modelo sin validación comunitaria.
- El contexto de 256K es una cifra heredada del modelo base; no se confirma que el fine-tune conserve el rendimiento en contextos extremos.

## Enlaces

- Hugging Face: https://huggingface.co/4everImmortality/dafeiyu-qwen35-4b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
