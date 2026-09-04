# simaai/LFM2-VL-1.6B-Autoround-a16w4

## Resumen

El modelo LFM2-VL-1.6B-Autoround-a16w4 es una versión optimizada y compilada del modelo de visión-lenguaje LFM2-VL de 1.600 millones de parámetros, creada por la empresa simaai para su plataforma de aceleración de IA embebida SiMa.ai Modalix. El modelo original, desarrollado por LiquidAI, ha sido pre-cuantizado con AutoRound y compilado mediante la herramienta LLiMa para ejecutarse de manera eficiente en hardware de borde. Esta variante ofrece una ventana de contexto de 8.192 tokens y procesa imágenes a una resolución fija de 512x512 píxeles.

Su relevancia radica en que permite ejecutar inferencia multimodal en dispositivos embebidos con latencias muy bajas: el primer token se genera en 0,28 segundos y la velocidad de generación alcanza los 70,42 tokens por segundo en la plataforma Modalix. Esto lo convierte en una opción práctica para aplicaciones de visión por computador en tiempo real, como asistentes de accesibilidad, inspección industrial o análisis de documentos, donde la respuesta rápida y el bajo consumo energético son críticos. Además, el modelo puede servirse mediante APIs compatibles con OpenAI u Ollama, lo que facilita su integración en pipelines de inteligencia artificial existentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM2-VL (transformer multimodal, visión y lenguaje) |
| Parámetros totales | 1.600 millones (1.6B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | Híbrida: A16W8 (prompt) y A16W4 (generación), pre-cuantizada con AutoRound |
| Idiomas soportados | No especificado en la información disponible |
| Licencia | lfm1.0 |
| Formato de pesos | Compilado para SiMa.ai Modalix mediante LLiMa; no es un checkpoint estándar de Hugging Face |

## Arquitectura y entrenamiento

El modelo LFM2-VL-1.6B se basa en una arquitectura de transformer multimodal de 1.600 millones de parámetros, que combina un codificador visual con un modelo de lenguaje para tareas de image-text-to-text. En esta versión, el checkpoint original ha sido pre-cuantizado con AutoRound antes de la compilación, aplicando una cuantización híbrida: las activaciones se mantienen en 16 bits y los pesos se reducen a 8 bits durante el procesamiento del prompt, y a 4 bits durante la generación de tokens. Esto permite reducir el tamaño del modelo y acelerar la inferencia en hardware embebido.

La compilación se realiza con la herramienta LLiMa de SiMa.ai, que genera un binario optimizado para el acelerador Modalix. La resolución de entrada de imagen se fija en 512x512 píxeles para maximizar el rendimiento, en lugar de la resolución dinámica que admite el modelo base. No se ha publicado información detallada sobre los datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Comprensión multimodal: el modelo procesa imágenes y texto para generar respuestas textuales (image-text-to-text).
- Generación de descripciones de imágenes: puede describir contenido visual, responder preguntas sobre imágenes y razonar sobre elementos visuales.
- Generación de texto en tiempo real: alcanza velocidades de generación de 70 tokens por segundo en Modalix, lo que permite respuestas casi instantáneas.
- Compatibilidad con APIs OpenAI y Ollama: cuando se despliega mediante el servidor GenAI de SiMa.ai, el modelo se puede invocar con interfaces estándar.
- Optimización para borde: la cuantización híbrida y la compilación para Modalix lo hacen adecuado para dispositivos con recursos limitados.
- No se ha documentado soporte para tool calling, agentes ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Asistente de accesibilidad para personas con discapacidad visual: el modelo puede describir escenas de una cámara en tiempo real, generando descripciones verbales con una latencia de 0,28 segundos para el primer token, lo que permite una interacción fluida.
- Inspección visual en manufactura: al integrarlo en un sistema de visión industrial, el modelo analiza imágenes de piezas y genera informes textuales sobre posibles defectos, aprovechando la resolución fija de 512x512 y la velocidad de 70 tokens por segundo.
- Análisis de documentos escaneados: el modelo extrae información de facturas, recibos o formularios, combinando la comprensión visual con la generación de texto, y puede ejecutarse en dispositivos de borde sin conexión a la nube.
- Robots de servicio y drones: la baja latencia y el bajo consumo energético permiten que el modelo procese imágenes de cámaras en tiempo real para la navegación o la interacción con el entorno.
- Vigilancia y seguridad: en cámaras inteligentes, el modelo puede analizar imágenes y generar alertas descriptivas, por ejemplo, detectando personas u objetos y describiendo la escena.
- Integración en pipelines de GenAI en el borde: mediante las APIs compatibles con OpenAI u Ollama, el modelo se puede servir en un servidor GenAI de SiMa.ai y consumirse desde aplicaciones existentes sin cambios de código.
- Evaluación rápida de prototipos: la herramienta llima permite ejecutar el modelo directamente en un dispositivo Modalix, lo que facilita pruebas de concepto y demostraciones en entornos de demostración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos siguientes son mediciones de rendimiento de inferencia realizadas en la plataforma SiMa.ai Modalix, tal como indica la documentación del modelo.

| Tipo de inferencia | Entrada | TTFT medio (s) | Velocidad de generación (tokens/s) |
|---|---|---|---|
| Multimodal | Imagen 512x512 + 20 tokens de texto | 0,28 | 70,42 |
| Solo texto | 128 tokens | 0,04 | 68,54 |
| Solo texto | 256 tokens | 0,07 | 68,51 |
| Solo texto | 512 tokens | 0,13 | 67,68 |
| Solo texto | 1.024 tokens | 0,27 | 66,51 |
| Solo texto | 2.048 tokens | 0,58 | 61,65 |
| Solo texto | 3.072 tokens | 1,05 | 59,54 |
| Solo texto | 4.096 tokens | 1,60 | 56,78 |
| Solo texto | 5.120 tokens | 2,35 | 54,57 |
| Solo texto | 6.144 tokens | 3,20 | 53,85 |
| Solo texto | 7.168 tokens | 4,37 | 51,49 |

## Requisitos de hardware

- VRAM estimada: no disponible (el modelo está compilado para el acelerador SiMa.ai Modalix, no para GPUs convencionales).
- GPU recomendadas: no aplica; requiere un dispositivo SiMa.ai Modalix.
- ¿Cabe en consumer GPU? No; el modelo está diseñado exclusivamente para hardware SiMa.ai Modalix. Para usar en otras plataformas, se necesitaría recompilar o utilizar el checkpoint safetensors.
- Opciones de despliegue: SiMa.ai Modalix, LLiMa CLI (llima pull, llima run), servidor GenAI de SiMa.ai con APIs compatibles con OpenAI y Ollama.
- Latencia y throughput: TTFT de 0,28 s y 70,42 tokens/s para inferencia multimodal; para texto solo, TTFT desde 0,04 s (128 tokens) hasta 4,37 s (7.168 tokens), con velocidad de generación entre 51 y 68 tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Plataforma | Licencia |
|---|---|---|---|---|---|
| LFM2-VL-1.6B-Autoround-a16w4 | 1.6B | 8.192 | A16W8/A16W4 (AutoRound) | SiMa.ai Modalix | lfm1.0 |
| LiquidAI/LFM2-VL-1.6B (base) | 1.6B | No especificado | No especificado | GPU convencional | lfm1.0 |
| simaai/LFM2-VL-1.6B-Autoround-Safetensors | 1.6B | No especificado | A16W8/A16W4 (AutoRound) | Hugging Face / compilación LLiMa | lfm1.0 |
| simaai/LFM2-VL-1.6B-a16w4 | 1.6B | 2.048 | A16W4 | SiMa.ai Modalix | lfm1.0 |

La comparativa se basa en las variantes del mismo modelo base. No se dispone de información sobre otros modelos de la misma categoría para comparar capacidades.

## Limitaciones y advertencias

- La cuantización híbrida (A16W4/A16W8) puede introducir desviaciones menores en la precisión respecto al modelo de precisión completa, como indica la propia documentación.
- La resolución de entrada de imagen está fijada en 512x512 píxeles durante la compilación; no admite resoluciones dinámicas, lo que puede limitar su uso en aplicaciones que requieran imágenes de mayor tamaño.
- El modelo solo se puede ejecutar en dispositivos SiMa.ai Modalix; no es compatible con GPUs convencionales sin recompilar. Para otras plataformas, se debe usar el checkpoint safetensors y compilarlo.
- No se especifican los idiomas soportados, por lo que puede haber limitaciones en tareas multilingües.
- La licencia lfm1.0 es una licencia "other" que requiere revisión antes de usar en producción comercial; la model card indica que las restricciones de uso del modelo base se mantienen.
- No se han publicado benchmarks de capacidades (MMLU, HumanEval, etc.), lo que dificulta la evaluación comparativa del modelo frente a otras alternativas.
- Riesgo de alucinación inherente a los modelos generativos; no se ha documentado ninguna medida específica de mitigación en esta versión.

## Enlaces

- Hugging Face: https://huggingface.co/simaai/LFM2-VL-1.6B-Autoround-a16w4
- Modelo base: https://huggingface.co/LiquidAI/LFM2-VL-1.6B
- Variante safetensors: https://huggingface.co/simaai/LFM2-VL-1.6B-Autoround-Safetensors
- Variante compilada con contexto 2048: https://huggingface.co/simaai/LFM2-VL-1.6B-a16w4
- Documentación de SiMa.ai (Neat runtime): https://developer.sima.ai/software/getting-started/
- Demo de asistente multimodal: https://developer.sima.ai/examples/app/genai%2Fmultimodal-assistant
- Tutorial de servidor GenAI: https://developer.sima.ai/software/tutorials/serve-genai-models
- Tutorial para ejecutar un VLM: https://developer.sima.ai/software/tutorials/run-a-vlm
