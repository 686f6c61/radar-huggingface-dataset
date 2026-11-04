# litert-community/Mage-VL-Cowork

## Resumen

Mage-VL-Cowork es un agente de uso de ordenador (computer-use) de 4B parámetros desarrollado por Microsoft, distribuido aquí por la comunidad litert-community como conversión a LiteRT-LM (`.litertlm`) para inferencia en dispositivo. Combina un codificador visual de 24 capas con un decodificador de texto Qwen3-4B, y está entrenado para responder a cada paso con su razonamiento dentro de `<think>…</think>`, una línea `Action:` de una frase y una llamada de herramienta `<tool_call>` con coordenadas normalizadas de 0 a 999. El modelo base es `microsoft/Mage-VL-Cowork` y esta conversión aplica cuantización int4 a los pesos del decodificador.

La relevancia de esta ficha no está en el modelo en sí, sino en el formato: es una conversión práctica a LiteRT-LM 0.19.0 pensada para ejecutarse en GPU de Mac, iPhone, Pixel y Galaxy, sin servidores. El repositorio incluye dos variantes de pesos según dónde pueda ejecutarse el codificador visual (GPU o CPU), con cifras de latencia medidas por el autor en hardware concreto. El contexto efectivo es de 4.096 tokens, suficiente para un prompt de sistema, una captura de pantalla (redimensionada a 1920 × 1088, unas 2.040 imágenes-token), la instrucción del usuario, los pasos anteriores condensados en una línea cada uno y la respuesta.

Se trata de un modelo de un solo paso: recibe una captura y una instrucción y devuelve la siguiente acción, no gestiona el bucle completo del agente. Su licencia Apache 2.0 y su tamaño de repositorio de 7,0 GB lo sitúan como una opción para prototipos de automatización de interfaz gráfica en entornos controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language: codificador visual de 24 capas + decodificador de texto Qwen3-4B |
| Parametros totales | 4B (decodificador Qwen3-4B; total combinado no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | int4 blockwise (128 por bloque) en pesos del decodificador; tabla de embeddings int8; codificador visual y adaptador fp32 (variante principal) o fp16 (variante `vision-fp16`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); dos ficheros: `Mage-VL-Cowork.litertlm` (3,80 GB) y `Mage-VL-Cowork_vision-fp16.litertlm` (3,20 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal de tipo vision-language con dos componentes diferenciados: un codificador visual de 24 capas que procesa una única captura de pantalla por petición y un decodificador de texto basado en Qwen3-4B. La imagen se estira de forma bicúbica a 1920 × 1088 píxeles (sin padding) y se tokeniza en aproximadamente 2.040 tokens visuales. El decodificador usa pesos int4 con bloques de 128, caché KV de 4.096 tokens, activaciones fp16 en GPU con una ruta exacta de rotary position embedding, y tabla de embeddings int8. En la variante principal, el codificador visual y el adaptador usan pesos fp32 con activaciones fp32 declaradas para GPU; en la variante `vision-fp16`, el codificador visual usa pesos fp16 para la ruta fp16 de XNNPACK y se ejecuta en CPU.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card original de Microsoft no se incluye en los datos disponibles; esta conversión solo documenta el proceso de conversión, los ficheros resultantes y las mediciones de latencia. La innovación técnica destacable es la propia conversión a LiteRT-LM: dos empaquetados con backend distinto para el codificador visual, pensados para sortear limitaciones de hardware (por ejemplo, el codificador visual en GPU provoca el cierre del proceso en Galaxy S26).

## Capacidades

- Generación de texto y razonamiento de un solo paso para agentes de interfaz gráfica.
- Comprensión de capturas de pantalla (visión) con una imagen por petición.
- Salida estructurada en tres partes: razonamiento en `<think>…</think>`, línea `Action:` y `<tool_call>` con JSON.
- Tool calling / function calling mediante la herramienta `computer_use` con acciones como `click` y coordenadas normalizadas de 0 a 999.
- Predicción de acciones de ratón (clic con botón izquierdo) sobre elementos de la interfaz.
- Capacidad multilingüe limitada al inglés.
- Modo de razonamiento explícito (thinking) integrado en la respuesta.

## Casos de uso

- Automatización de tareas de escritorio en Mac: el modelo lee una captura de la ventana activa y devuelve la siguiente acción (por ejemplo, abrir Ajustes de Descargas), con latencia de 10,3 s por paso en un M4 Max con GPU. Adecuado para prototipos de agentes locales que no pueden enviar capturas a la nube.
- Agentes de computer-use en móvil: en iPhone 18 Pro tarda 26,16 s por paso desde un teléfono frío; útil para asistentes que guían al usuario por menús de sistema con confirmación humana.
- Pruebas de regresión de interfaces: dado un conjunto de capturas y una instrucción, el modelo produce clics esperados que pueden compararse contra los de un agente de referencia para detectar regresiones en la UI.
- Generación de datos sintéticos de interacción: ejecutar el modelo sobre capturas de aplicaciones propias para anotar coordenadas y acciones, que luego se revisan manualmente y se usan para entrenar o evaluar otros agentes.
- Asistencia a usuarios con dificultades de accesibilidad: traducir una instrucción en lenguaje natural ("abre la configuración de descargas") a una acción concreta sobre la pantalla, con el razonamiento visible para que el usuario valide el paso.
- Automatización de tareas repetitivas en entornos controlados (por ejemplo, configurar opciones en una aplicación interna) donde el coste de una acción errónea es bajo y existe supervisión.
- Investigación en agentes de un solo paso: servir como componente de "política" dentro de un bucle externo que gestione el estado, la memoria y la verificación de resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta mediciones de latencia y una prueba de correctitud de 120 capturas de pantalla:

| Plataforma | Configuración | Latencia por petición |
|---|---|---|
| Mac M4 Max | GPU (decodificador + visión) | 10,3 s (proceso completo) |
| Mac M4 Max | CPU | 56–62 s |
| iPhone 18 Pro | Metal (fichero principal) | 26,16 s (teléfono frío, sin creación del motor) |
| iPhone 18 Pro | CPU | 85,36 s |
| Galaxy S26 | GPU decodificador + CPU visión (`vision-fp16`) | 50,75 s (teléfono frío) |
| Galaxy S26 | Todo en CPU | 159,7–182,7 s (arranque en caliente) |
| Pixel 11 Pro | GPU (fichero principal) | 106,97 s de media tras 7 min de reposo |
| Pixel 11 Pro | Etapa de visión en GPU | 29,28–35,25 s |
| Pixel 11 Pro | Etapa de visión en CPU | 79,83 s (arranque frío); 151,99–184,28 s (caliente) |

Las cuatro configuraciones (Mac GPU, iPhone Metal, Galaxy S26 con visión en CPU, Pixel GPU) superaron la misma prueba de 120 capturas. No se proporcionan métricas de precisión (exactitud de clic, tasa de acierto) más allá de la superación cualitativa de dicha prueba.

## Requisitos de hardware

- VRAM estimada: el fichero principal ocupa 3,80 GB y el de visión fp16 3,20 GB; el decodificador int4 con caché KV de 4.096 tokens permite inferencia en GPU integrada o móvil, sin necesidad de GPU dedicada de gran tamaño.
- GPU recomendadas: Apple Silicon (M4 Max validado), GPU de iPhone 18 Pro, GPU de Pixel 11 Pro, GPU de Galaxy S26 (solo con visión en CPU).
- Cabe en GPU de consumo: sí, en el sentido de que está diseñado para GPU integradas y móviles; no se documenta su ejecución en RTX 4090, A100 o H100.
- Opciones de despliegue: LiteRT-LM 0.19.0 (runtime principal), con el script `cowork_step.py` del repositorio `john-rocky/hf-to-litertlm`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 10,3 s por petición en M4 Max GPU; 26,16 s en iPhone 18 Pro; 50,75 s en Galaxy S26; 106,97 s de media en Pixel 11 Pro. No se reporta throughput agregado.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. La comparación más directa es con el modelo base original, `microsoft/Mage-VL-Cowork`, del que esta conversión deriva:

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| litert-community/Mage-VL-Cowork | 4B (Qwen3-4B + visión) | 4.096 tokens | `.litertlm` | Apache 2.0 | Hugging Face, 0 descargas |
| microsoft/Mage-VL-Cowork | 4B (según model card del base) | no disponible | no disponible | no disponible | Hugging Face |

No se han identificado en la información disponible alternativas de la misma categoría (agentes GUI de 4B en formato LiteRT-LM) con las que comparar parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: el modelo genera razonamiento en `<think>` y coordenadas de clic; no se reporta tasa de error de clic más allá de la prueba cualitativa de 120 capturas, por lo que en producción deben validarse las acciones antes de ejecutarlas.
- Limitación de idioma: solo inglés; las instrucciones en castellano no están soportadas oficialmente.
- Contexto limitado a 4.096 tokens, con una sola captura por petición; no mantiene historial completo, solo pasos anteriores condensados en una línea cada uno.
- No es un agente autónomo completo: resuelve un paso; el bucle, la memoria y la verificación deben implementarse fuera.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución; conviene verificar la licencia del modelo base `microsoft/Mage-VL-Cowork`.
- Caveats de producción: el codificador visual en GPU provoca el cierre del proceso en Galaxy S26, lo que obliga a usar la variante `vision-fp16` con visión en CPU en ese dispositivo; las latencias en móvil (26–107 s por paso) son altas para interacción en tiempo real; el repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria.
- La conversión se realizó con `hf-to-litertlm` para LiteRT-LM 0.19.0; cambios de versión del runtime pueden romper la compatibilidad.

## Enlaces

- [HuggingFace: litert-community/Mage-VL-Cowork](https://huggingface.co/litert-community/Mage-VL-Cowork)
- [Modelo base: microsoft/Mage-VL-Cowork](https://huggingface.co/microsoft/Mage-VL-Cowork)
- [Repositorio hf-to-litertlm](https://github.com/john-rocky/hf-to-litertlm)
- [Script cowork_step.py](https://github.com/john-rocky/hf-to-litertlm/blob/main/magevlcowork_work/cowork_step.py)
- [Google LiteRT-LM](https://github.com/google-ai-edge/LiteRT-LM)
