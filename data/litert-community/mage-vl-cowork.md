# litert-community/Mage-VL-Cowork

## Resumen

Mage-VL-Cowork es un agente de uso de ordenador (computer-use) de 4B parámetros desarrollado originalmente por Microsoft. Combina un codificador visual de 24 capas con un decodificador de texto Qwen3-4B, y está entrenado para responder a cada paso de una tarea GUI con su razonamiento dentro de etiquetas `<think>…</think>`, una línea `Action:` de una frase y una llamada a herramienta `<tool_call>` con coordenadas normalizadas entre 0 y 999. El modelo recibe una captura de pantalla por petición, reescalada a 1920 × 1088 píxeles (2.040 tokens de imagen), y opera con una ventana total de 4.096 tokens que cubre el prompt de sistema, la captura, la instrucción, los pasos anteriores y la respuesta.

El repositorio aquí descrito es una conversión del modelo original al formato LiteRT-LM (`.litertlm`), realizada por la comunidad `litert-community` con la herramienta `hf-to-litertlm` para LiteRT-LM 0.19.0 de Google. El objetivo es el despliegue en dispositivo (on-device) sobre GPU de Mac, iPhone y dispositivos Android, evitando la dependencia de infraestructura en la nube. En un Mac M4 Max con GPU, el ciclo completo de lectura de captura y generación de la siguiente acción se completa en 10,3 s desde el arranque del proceso hasta su salida.

La relevancia actual del modelo reside en su orientación a agentes GUI ligeros que deben ejecutarse localmente con latencias aceptables en hardware de consumo. Se distribuye en dos variantes de empaquetado que difieren en dónde se ejecuta el codificador visual (GPU o CPU), pensadas para cubrir dispositivos con distintas limitaciones de memoria y compatibilidad de kernels.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: codificador visual de 24 capas + decodificador de texto Qwen3-4B |
| Parametros totales | 4B (decodificador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (incluye prompt de sistema, imagen, instrucción, pasos previos y respuesta) |
| Tipos de cuantizacion | Pesos del decodificador en int4 (blockwise, 128 por bloque); tabla de embeddings en int8; codificador visual y adaptador en fp32 (variante principal) o fp16 (variante `vision-fp16`) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT-LM (`.litertlm`); modelo base en formato original de Microsoft |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal compuesto por un codificador visual de 24 capas y un decodificador de texto Qwen3-4B. La conversión a LiteRT-LM aplica cuantización int4 blockwise (bloques de 128) a los pesos del decodificador, tabla de embeddings en int8 y mantiene el codificador visual y el adaptador en fp32 en la variante principal, con activaciones fp16 en GPU y una ruta exacta de rotary position embedding. La variante `vision-fp16` sustituye el codificador visual por pesos fp16 para la ruta fp16 de XNNPACK, permitiendo su ejecución en CPU.

El modelo base fue entrenado por Microsoft como agente computer-use: cada respuesta incluye razonamiento explícito en `<think>…</think>`, una línea de acción y una llamada a herramienta con coordenadas en el rango 0–999. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable de esta conversión es el empaquetado dual que permite elegir el backend del codificador visual según el dispositivo, con un KV cache de 4.096 tokens y una ruta de atención optimizada para GPU.

## Capacidades

- Generación de texto y razonamiento paso a paso con modo thinking explícito (`<think>…</think>`).
- Comprensión de imágenes: procesa una captura de pantalla por petición, reescalada a 1920 × 1088 píxeles (2.040 tokens de imagen).
- Agente GUI: genera la siguiente acción del agente (clic, etc.) con coordenadas normalizadas de 0 a 999 y botón del ratón.
- Tool calling / function calling mediante `<tool_call>` con nombre de herramienta `computer_use` y argumentos estructurados en JSON.
- Razonamiento multi-paso: mantiene los pasos anteriores como una línea cada uno dentro de la ventana de 4.096 tokens.
- Capacidades multilingües limitadas al inglés.
- Ejecución on-device en GPU de Mac, iPhone y dispositivos Android (Pixel, Galaxy).

## Casos de uso

- Automatización de tareas de escritorio en local: el modelo lee una captura de pantalla y emite la siguiente acción (por ejemplo, clic en un elemento del menú) en 10,3 s en un Mac M4 Max, lo que permite construir un bucle de agente GUI sin enviar capturas a la nube.
- Asistente de accesibilidad en dispositivo móvil: en un iPhone 18 Pro responde en 26,16 s desde un teléfono frío, suficiente para guiar a un usuario paso a paso por menús y ajustes del sistema.
- Pruebas de interfaz automatizadas: con coordenadas normalizadas 0–999 y salida estructurada en `<tool_call>`, se puede integrar en pipelines de test que verifiquen flujos de UI capturando pantalla y ejecutando clics.
- Soporte remoto guiado: dado que el modelo razona en `<think>` antes de actuar, su traza sirve como explicación para el usuario de por qué se propone cada clic.
- Agente de configuración de sistemas: instrucciones como "abrir los ajustes de descargas" se resuelven localizando el elemento en la captura y devolviendo la coordenada en píxeles de la imagen original.
- Despliegue en Android de gama alta: la variante `vision-fp16` con decodificador en GPU y codificador visual en CPU funciona en Galaxy S26 en 50,75 s desde un teléfono frío, habilitando agentes locales en dispositivos donde el codificador visual en GPU provoca el fallo del proceso.
- Prototipado de investigación en agentes computer-use: la licencia Apache 2.0 y el formato LiteRT-LM permiten experimentar con el modelo en hardware de consumo sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de rendimiento publicados son mediciones de latencia del ciclo completo (lectura de captura y generación de acción) en distintos dispositivos:

| Dispositivo | Configuración | Latencia por petición |
|---|---|---|
| Mac M4 Max | GPU (decodificador + visión) | 10,3 s (proceso completo) |
| Mac M4 Max | CPU | 56–62 s |
| iPhone 18 Pro | GPU Metal | 26,16 s (desde frío, sin creación del motor) |
| iPhone 18 Pro | CPU | 85,36 s |
| Galaxy S26 | GPU decodificador + CPU visión (fp16) | 50,75 s (desde frío) |
| Galaxy S26 | Todo en CPU | 159,7–182,7 s (arranque en caliente) |
| Pixel 11 Pro | GPU (decodificador + visión) | 106,97 s de media tras 7 min de reposo |
| Pixel 11 Pro | Visión en GPU | 29,28–35,25 s (etapa de visión) |
| Pixel 11 Pro | Visión en CPU | 79,83 s (desde frío); 151,99–184,28 s (en caliente) |

La variante principal superó una prueba de 120 capturas de pantalla en Mac; las cuatro configuraciones de dispositivo probadas superaron la misma prueba. Al ejecutar peticiones consecutivas, los teléfonos incrementan la latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Mage-VL-Cowork (LiteRT-LM) | 4B | 4.096 tokens | Apache 2.0 | `.litertlm`, on-device | Agente GUI, visión + texto, coordenadas normalizadas |
| microsoft/Mage-VL-Cowork (original) | 4B | no disponible | Apache 2.0 | Pesos originales de Microsoft | Modelo base del que deriva esta conversión |
| Alternativas de agente GUI de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al ser un modelo entrenado para GUI en inglés, puede tener sesgos hacia interfaces y convenciones anglófonas.
- Riesgo de alucinación: el modelo genera razonamiento en `<think>` y coordenadas de clic; una coordenada incorrecta puede provocar acciones erróneas en la interfaz, por lo que se recomienda validación o confirmación humana en producción.
- Limitación de contexto: 4.096 tokens compartidos entre prompt de sistema, imagen (2.040 tokens), instrucción, pasos anteriores y respuesta; tareas GUI largas requieren resumir los pasos previos a una línea cada uno.
- Limitación de idioma: solo inglés.
- Limitación de imagen: una sola captura por petición, reescalada a 1920 × 1088 con estiramiento bicúbico sin padding, lo que puede distorsionar capturas con relaciones de aspecto muy distintas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- Caveats de producción: el codificador visual en GPU provoca el fallo del proceso en Galaxy S26, por lo que en ese dispositivo debe usarse la variante `vision-fp16` con visión en CPU; las latencias en teléfonos aumentan en peticiones consecutivas por calentamiento.
- El modelo está empaquetado para LiteRT-LM 0.19.0; versiones distintas del runtime pueden no ser compatibles.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/litert-community/Mage-VL-Cowork
- Modelo base en Hugging Face: https://huggingface.co/microsoft/Mage-VL-Cowork
- Herramienta de conversión `hf-to-litertlm`: https://github.com/john-rocky/hf-to-litertlm
- Script de ejemplo `cowork_step.py`: https://github.com/john-rocky/hf-to-litertlm/blob/main/magevlcowork_work/cowork_step.py
- Repositorio LiteRT-LM de Google: https://github.com/google-ai-edge/LiteRT-LM
