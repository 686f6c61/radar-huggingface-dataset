# Bhoidy/charon-v2-minicpm5-1b

## Resumen

Charon V2 (MiniCPM5-1B) es un ajuste fino por LoRA del modelo base openbmb/MiniCPM5-1B, desarrollado por el usuario Bhoidy. Está especializado en la generación de código React + Remotion en TypeScript (TSX) para producir escenas de vídeo con animaciones procedurales a partir de descripciones en lenguaje natural. El modelo no es un asistente general, sino un generador de código de dominio muy restringido: su salida esperada es un fragmento JSX puro delimitado por `<AbsoluteFill>`.

El modelo se entrenó sobre el denominado Charon V2 Dual-Mode Corpus, con 11.602 muestras, y se distribuye en tres formatos: un adaptador PEFT LoRA de 42,8 MB, un GGUF Q4_K_M de 656 MB y un GGUF FP16 de 2,06 GB. Con 1.080.632.832 parámetros totales, está pensado para inferencia en dispositivo, CPU y GPUs de baja VRAM mediante llama.cpp, lo que lo hace relevante para pipelines de generación de vídeo programática que necesitan ejecutarse en local sin depender de APIs externas.

La propuesta de valor es la eliminación del preámbulo conversacional: el modelo emite directamente el componente TSX sin cercas Markdown ni texto de chat, con animaciones basadas en `spring`, funciones trigonométricas y trazado SVG. Su licencia Apache 2.0 facilita la integración comercial, aunque su alcance funcional es muy estrecho y no cubre tareas de razonamiento general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base MiniCPM5-1B), ajuste fino mediante LoRA |
| Parámetros totales | 1.080.632.832 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF Q4_K_M (656 MB), GGUF FP16 (2,06 GB), LoRA safetensors (42,8 MB) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA), GGUF |

## Arquitectura y entrenamiento

El modelo parte de MiniCPM5-1B, un transformer decoder-only de aproximadamente 1.080 millones de parámetros, sobre el que se aplica un ajuste fino con LoRA (PEFT). El adaptador resultante pesa 42,8 MB, lo que sugiere un rango y un conjunto de módulos objetivo moderados. El entrenamiento se realizó sobre el Charon V2 Dual-Mode Corpus, compuesto por 11.602 muestras de código Remotion TSX, y el autor indica que todas las muestras fueron validadas sintácticamente mediante AST, de modo que el corpus contiene únicamente código TypeScript Remotion válido.

La innovación principal no es arquitectónica sino de formato y condicionamiento. El modelo se entrena para emitir exclusivamente JSX crudo entre `<AbsoluteFill>` y `</AbsoluteFill>`, sin cercas de código ni texto conversacional. Además, incorpora un condicionamiento dual-mode mediante etiquetas textuales en el prompt: `(bright light aesthetic: Clean Daylight White)` para estilos claros tipo SaaS y paneles de datos, y `(dark aesthetic: Deep Obsidian Void)` para estilos oscuros tipo cyberpunk y HUD. El prompt de sistema espera que estén en ámbito `frame`, `fps`, `interpolate` y `spring`, y que las animaciones sean puramente procedurales (matemáticas, CSS, SVG) sin imágenes externas. No se dispone de información sobre el número de tokens de entrenamiento, la composición detallada del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de código Remotion TSX: produce componentes `<AbsoluteFill>` completos a partir de descripciones de escena en lenguaje natural.
- Salida sin preámbulo: emite JSX puro, sin cercas Markdown ni texto de chat, lo que simplifica el parseo en pipelines automatizados.
- Animaciones con física de spring: genera llamadas a `spring({frame, fps, config})` para movimientos con inercia y rebote.
- Ondas trigonométricas: calcula formas de onda armónicas con `Math.sin(frame * 0.15 + i)` y expresiones similares.
- Animación de trazado SVG: produce animaciones de paths SVG, gráficos que se dibujan y elementos vectoriales.
- UI con glassmorphism: genera tarjetas con efecto de cristal esmerilado, badges tipo pill y paneles de telemetría.
- Condicionamiento estético dual: soporta estilos claros (Clean Daylight White) y oscuros (Deep Obsidian Void) mediante etiquetas en el prompt.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Generación automatizada de escenas de vídeo para marketing: el modelo recibe una descripción de la escena y devuelve el TSX listo para montar en una composición Remotion, lo que permite producir variaciones de anuncios o piezas promocionales de forma programática sin intervención manual.
- Paneles de datos animados para productos SaaS: con el condicionamiento `Clean Daylight White` genera contadores de métricas animados, gráficos de ingresos con curvas bezier y tarjetas de telemetría con glassmorphism, adecuados para vídeos de demo de producto.
- Visualizaciones estilo cyberpunk y HUD: con el condicionamiento `Deep Obsidian Void` produce interfaces oscuras con pulsos de audio, datos de telemetría brillantes y efectos de neón, útiles para contenido de videojuegos o presentaciones tecnológicas.
- Generación de vídeo en local sin APIs: al distribuirse en GGUF Q4_K_M de 656 MB, puede ejecutarse en CPU o en GPUs de baja VRAM mediante llama.cpp, lo que permite integrar la generación de escenas en un pipeline de CI/CD o en un portátil sin conexión a servicios en la nube.
- Prototipado rápido de animaciones Remotion: un desarrollador puede describir la animación deseada y obtener un punto de partida válido sintácticamente que luego refina a mano, reduciendo el tiempo de escritura de código boilerplate de `interpolate` y `spring`.
- Producción de vídeo por lotes con coherencia estética: el condicionamiento dual permite generar series de escenas con el mismo estilo visual de forma consistente, encadenando escenas mediante el campo `PREVIOUS SCENE` del prompt.
- Educación y demostraciones técnicas: sirve para ilustrar cómo se estructura un componente Remotion con animaciones procedurales, ya que la salida es código TSX limpio y directamente renderizable con `npx remotion render`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_M ocupa 656 MB en disco y requiere aproximadamente 1-1,5 GB de RAM/VRAM en ejecución; el GGUF FP16 ocupa 2,06 GB y requiere en torno a 2,5-3 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior ejecuta el modelo FP16 con holgura. Para Q4 basta con CPU o GPUs integradas.
- Cabe en GPU consumer: sí, en todas las GPU consumer con al menos 4 GB de VRAM; el Q4_K_M puede ejecutarse incluso en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`) para GGUF; Hugging Face `transformers` + `peft` para el adaptador LoRA sobre el modelo base MiniCPM5-1B. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. El autor recomienda `--temp 0.2` y hasta 3200 tokens de generación para las escenas, lo que sugiere salidas largas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formatos |
|---|---|---|---|---|---|
| Charon V2 (MiniCPM5-1B) | 1,08 B | No disponible | Remotion TSX / vídeo procedural | Apache 2.0 | LoRA, GGUF Q4_K_M, GGUF FP16 |
| openbmb/MiniCPM5-1B (base) | 1,08 B | No disponible | Texto general | No disponible en la información | safetensors |
| Modelos de código general de ~1B | No disponible | No disponible | Código multilingüe | Variable | Variable |

La comparación con alternativas de la misma categoría no está disponible en la información proporcionada; el único punto de referencia documentado es el modelo base MiniCPM5-1B, del que Charon V2 hereda la arquitectura y al que añade la especialización en Remotion mediante LoRA.

## Limitaciones y advertencias

- Alcance muy restringido: el modelo está entrenado exclusivamente para generar código Remotion TSX; no es adecuado para conversación general, razonamiento, matemáticas ni otras tareas de código.
- Idioma: solo soporta inglés, tanto en las descripciones de escena como en el prompt de sistema.
- Riesgo de alucinación de API: aunque el autor afirma que la salida es de "cero alucinación", el modelo puede generar props o funciones de Remotion inexistentes o combinaciones de `interpolate`/`spring` no válidas en tiempo de ejecución; se recomienda validar el TSX generado antes de renderizar.
- Dependencia del formato de prompt: el modelo espera el formato ChatML con un prompt de sistema muy específico y las etiquetas de condicionamiento estético; desviarse de ese formato degrada la calidad de la salida.
- Longitud de contexto no documentada: no se especifica la ventana de contexto, lo que dificulta planificar escenas largas o encadenar muchas escenas previas.
- Corpus pequeño: 11.602 muestras es un conjunto de entrenamiento reducido, lo que puede limitar la diversidad de estilos y la generalización a escenas fuera de la distribución.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base MiniCPM5-1B, cuya licencia no se detalla en la información disponible.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas, por lo que la evaluación debe hacerse mediante pruebas propias de renderizado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Bhoidy/charon-v2-minicpm5-1b)
- [GGUF Q4_K_M](https://huggingface.co/Bhoidy/charon-v2-minicpm5-1b/blob/main/charon-v1-1b-q4_k_m.gguf)
- [GGUF FP16](https://huggingface.co/Bhoidy/charon-v2-minicpm5-1b/blob/main/charon-v1-1b-f16.gguf)
- [Adaptador LoRA safetensors](https://huggingface.co/Bhoidy/charon-v2-minicpm5-1b/blob/main/adapter_model.safetensors)
- [Modelo base openbmb/MiniCPM5-1B](https://huggingface.co/openbmb/MiniCPM5-1B)
- [Remotion](https://www.remotion.dev/)
