# experimentalmachines/LFM3-VL-2B-MobileAgent-v4-RL

## Resumen

LFM3-VL-2B-MobileAgent-v4-RL es un modelo vision-lenguaje de 1.918 millones de parámetros (aproximadamente 2B) especializado en actuar como agente de interfaz gráfica sobre Android. Lo desarrolla el usuario experimentalmachines a partir de LiquidAI/LFM3-VL-2B, sobre el que aplica un ajuste fino encadenado: primero un SFT que da lugar a LFM3-VL-2B-MobileAgent-v4 y después 200 pasos de aprendizaje por refuerzo con GRPO sobre capturas de pantalla estáticas. El modelo resuelve el problema de decidir la siguiente acción de un teléfono (clic, scroll, entrada de texto, apertura de app, respuesta final) a partir de una captura y un historial de ocho pasos.

La relevancia de esta ficha es doble: por un lado documenta un caso real de aplicación de RL a un agente móvil de pequeño tamaño, apto para despliegue en dispositivo; por otro, el propio autor declara que el modelo **no fue promovido**, porque no superó las reglas de promoción fijadas antes del entrenamiento. Es, por tanto, un artefacto de investigación reproducible más que un modelo listo para producción.

Arquitectura LFM3-VL (vision-lenguaje de Liquid AI), contexto efectivo limitado por una sola captura por paso y un historial textual de ocho pasos, licencia LFM Open License v1.0 y pesos en safetensors (con una variante GGUF de 4 bits publicada aparte). El idioma de trabajo es exclusivamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3-VL (vision-lenguaje de Liquid AI), con adaptadores LoRA fusionados tras GRPO |
| Parametros totales | 1.918.181.888 (~1,92 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; en la práctica, una captura por paso más un historial de los últimos 8 pasos |
| Tipos de cuantizacion | GGUF de 4 bits publicado como modelo separado; pesos originales en safetensors (precisión no especificada) |
| Idiomas soportados | en (inglés) |
| Licencia | LFM Open License v1.0 (heredada de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | safetensors (transformers, custom_code); GGUF 4 bits en repo aparte |

## Arquitectura y entrenamiento

El modelo parte de LFM3-VL-2B de Liquid AI, un transformer vision-lenguaje que procesa una captura de pantalla redimensionada a un máximo de 880 × 880 px de área (unos 720 tokens de imagen) junto con texto. Sobre esa base se aplicó primero un ajuste supervisado (v4) y después 200 pasos de GRPO con TRL sobre capturas estáticas: 4 muestras por estado, KL β = 0,001, LoRA de rango 16, learning rate 1e-5 y fusión posterior de los adaptadores. El entrenamiento completo consumió 0,95 horas en una única A100 y la recompensa media pasó de 0,714 (primeras 20 iteraciones) a 0,765 (últimas 20).

El dataset de RL, experimentalmachines/MobileAgent-RL-v4 (commit `9ba36d90`), contiene 2.000 estados repartidos en 700 de respuesta, 500 de finalización, 300 de otros tipos y 500 de clic. El diagnóstico del autor es revelador: en promedio, el 66 % de los grupos muestreados por paso tenían varianza de recompensa cero y el 60 % de los estados eran pantallas terminales, de modo que la señal de aprendizaje llegaba poco a las acciones ordinarias. Esa es la explicación técnica de que el modelo no superase las reglas de promoción.

## Capacidades

- Generación de una única acción JSON por paso a partir de una captura de pantalla de Android y un objetivo en inglés.
- Tipos de acción soportados: `click`, `long_press`, `input_text`, `scroll`, `open_app`, `navigate_back`, `navigate_home`, `keyboard_enter`, `wait`, `answer` y `status`.
- Coordenadas normalizadas en una rejilla entera de 0 a 1000 sobre la captura.
- Modo de razonamiento breve: emite `` antes del JSON de acción.
- Respuesta a preguntas del usuario mediante la acción `answer`, con formato y brevedad solicitados.
- Señalización de objetivos imposibles o completados mediante `status` (`complete` / `infeasible`).
- Memoria limitada al historial textual de los últimos 8 pasos (`n. <intent> -> <action JSON>`).
- Sin capacidades de audio, vídeo ni interacción con el dispositivo en tiempo real.

## Casos de uso

- Investigación en agentes de interfaz gráfica: banco de pruebas reproducible para estudiar el efecto del RL sobre políticas de clic en móvil, con dataset, código y resultados publicados en el repositorio del proyecto.
- Generación de trayectorias sintéticas para aumentar datasets de entrenamiento de agentes Android: el modelo puede proponer la siguiente acción sobre capturas etiquetadas y filtrarse por acierto estricto.
- Evaluación de robustez de políticas de clic: al tener coordenadas normalizadas a 0-1000, permite medir el error de localización de forma independiente de la resolución del dispositivo.
- Estudio de recompensas y varianza en GRPO: su diagnóstico documentado (66 % de grupos con varianza cero) sirve como caso de análisis para diseñar mejores funciones de recompensa en entornos con muchos estados terminales.
- Prototipado de asistentes de accesibilidad en Android que traducen un objetivo en lenguaje natural a una secuencia de acciones, siempre con supervisión humana y sobre cuentas de prueba.
- Docencia y divulgación: ejemplo completo y de bajo coste (menos de una hora de A100) de un pipeline SFT + RL sobre un VLM de 2B, con reglas de promoción fijadas de antemano.
- Despliegue en dispositivo como referencia de tamaño: la variante GGUF de 4 bits permite probar el modelo en un teléfono con cuantización agresiva, aunque solo con fines de investigación.

## Benchmarks y rendimiento

| Prueba | Regla de promoción | v4 | v4-RL | Resultado |
|---|---|---|---|---|
| Coincidencia estricta de respuesta, 136 preguntas reservadas | ≥ v4 + 0,05 | 0,868 | 0,890 | falla |
| AndroidControl test, precisión de paso de alto nivel | ≥ v4 − 0,02 | 0,728 | 0,667 | falla |
| Respuestas falsas en 80 controles acción-objetivo | ≤ 0,03 | 0,00 | 0,00 | pasa |

No se han publicado resultados en AndroidWorld: el autor indica explícitamente que el modelo no se ha ejecutado en esa suite. El resto de cifras procede de la model card y del arnés de evaluación del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 4-5 GB en FP16/BF16 para los 1,92 B de parámetros, más el coste de los tokens de imagen (unos 720 por captura); en GGUF de 4 bits baja a aproximadamente 1,5-2 GB de pesos.
- GPU recomendadas: A100 (usada en el entrenamiento), H100 o L40S para lotes grandes; una RTX 4090 o incluso una RTX 3090 bastan para inferencia en BF16.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en BF16 y en tarjetas con 4-6 GB usando la variante GGUF de 4 bits.
- Opciones de despliegue: transformers (librería declarada, con `custom_code`), llama.cpp u Ollama para el GGUF, y servidores compatibles con la API de endpoints (el repo está marcado como `endpoints_compatible`). vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles; el único dato temporal publicado es el coste de entrenamiento (0,95 h en una A100 para 200 pasos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-v4-RL | ~1,92 B | 1 captura + 8 pasos de historial | Agente Android con RL (GRPO) | LFM Open License v1.0 | No promovido; sin AndroidWorld |
| LFM3-VL-2B-MobileAgent-v4 | ~1,92 B | 1 captura + 8 pasos de historial | Agente Android con SFT | LFM Open License v1.0 | Base del anterior; mejor precisión en AndroidControl |
| LiquidAI/LFM3-VL-2B | no disponible en la información | no disponible | VLM generalista | LFM Open License v1.0 | Modelo base, sin especialización en GUI |
| Agentes GUI de mayor tamaño (p. ej. familia Qwen-VL adaptada a GUI) | 7 B o más | variable | Agente GUI multi-plataforma | variable | No comparado en la información disponible |

La comparación con alternativas de otros proveedores no está documentada en la información proporcionada; las cifras de la tabla proceden de la model card y del repositorio del proyecto.

## Limitaciones y advertencias

- Modelo de investigación: el autor advierte explícitamente de que no debe operar sin supervisión en un teléfono con cuentas, mensajes o pagos reales.
- No fue promovido: incumple dos de las tres reglas de promoción fijadas antes del entrenamiento (coincidencia estricta de respuesta y precisión en AndroidControl), y la precisión de paso en AndroidControl cae de 0,728 a 0,667 respecto a v4.
- Sesgo de entrenamiento hacia estados terminales: el 60 % de los estados del dataset de RL eran pantallas finales y el 66 % de los grupos no aportaban señal, lo que limita la mejora en acciones ordinarias.
- Solo inglés: los objetivos y las respuestas deben formularse en inglés.
- Memoria muy corta: una única captura por paso y únicamente los últimos 8 pasos en texto; sin estado persistente ni memoria visual de pasos anteriores.
- Entrenado solo con demostraciones grabadas: nunca ha interactuado con un teléfono real durante el entrenamiento, por lo que puede degradarse ante cambios de interfaz, animaciones o estados no vistos.
- Riesgo de alucinación en la acción `answer`: aunque los controles de respuestas falsas dieron 0,00, la muestra es de solo 80 casos y el modelo puede inventar información en objetivos abiertos.
- Licencia LFM Open License v1.0: conviene revisar sus términos antes de cualquier uso comercial, ya que no es una licencia permisiva estándar.
- Ficheros de tokenizador heredados de v4 (el entrenador de GRPO guardó un ajuste de left-padding); el autor remite a `v4rl_local_export_manifest.json` para verificar la exportación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4-RL
- Modelo base (SFT): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4
- Variante GGUF de 4 bits: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4-RL-GGUF
- Dataset de RL: https://huggingface.co/datasets/experimentalmachines/MobileAgent-RL-v4
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentación de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
