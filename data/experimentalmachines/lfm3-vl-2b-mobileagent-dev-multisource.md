# experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-MultiSource

## Resumen

LFM3-VL-2B-MobileAgent-Dev-MultiSource es un ajuste fino (fine-tuning) del modelo multimodal LiquidAI/LFM3-VL-2B, desarrollado por el usuario experimentalmachines, orientado a la operacion de telefonos Android mediante agentes que interpretan capturas de pantalla y emiten acciones en formato JSON. El modelo parte de una arquitectura vision-lenguaje de aproximadamente 1.918 millones de parametros y se entrena mediante LoRA SFT sobre el modelo de lenguaje, manteniendo congelado el torre de vision.

El modelo resuelve el problema de la automatizacion de interfaces moviles: dado un objetivo en lenguaje natural, el historial de los ultimos 8 pasos y una captura de pantalla, predice la siguiente accion (clic, scroll, entrada de texto, navegacion, etc.) con coordenadas normalizadas en una rejilla de 0 a 1000. Es relevante como checkpoint de desarrollo dentro de una linea de investigacion sobre agentes GUI, aunque el propio autor lo marca explicitamente como obsoleto y no recomendado para uso en produccion.

Este checkpoint concreto (MultiSource) amplia la receta del modelo AndroidControlOnly anadiendo datos de GUI-Odyssey, AMEX y ScreenQA, lo que mejora el rendimiento offline en esos dominios pero provoca un colapso en la evaluacion online sobre AndroidWorld (de 15 a 3 tareas completadas de 116). El autor lo conserva unicamente para reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje transformer (LFM3-VL), ajuste LoRA sobre el modelo de lenguaje con torre de vision congelada |
| Parametros totales | 1.918.181.888 (~1,92 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (historial textual limitado a los ultimos 8 pasos) |
| Tipos de cuantizacion | 4-bit GGUF disponible en repo separado |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada de LiquidAI/LFM3-VL-2B |
| Formato de pesos | safetensors (pesos fusionados) y adaptador LoRA en `lora_adapter/`; GGUF en repo aparte |

## Arquitectura y entrenamiento

El modelo se construye sobre LiquidAI/LFM3-VL-2B, un modelo vision-lenguaje que procesa una captura de pantalla por paso (redimensionada a un maximo de 880 x 880 px de area, aproximadamente 720 tokens de imagen) junto con texto de usuario que incluye el objetivo (`Goal:`), los ultimos 8 pasos en formato `n. <intent> -> <action JSON>` y la pregunta `What is the next action?`. La salida combina un bloque `` seguido de una accion JSON compacta con coordenadas enteras en rejilla 0-1000.

El entrenamiento consistio en LoRA SFT con rango 64 y alpha 128 aplicado al modelo de lenguaje, con la torre de vision congelada, y posterior fusion de los pesos en el modelo final (el adaptador se conserva en `lora_adapter/`). Se realizaron 1.250 pasos con 32 filas por paso y tasa de aprendizaje 2e-4 sobre GPU de Colab. El conjunto de datos MobileAgent-SFT-MultiSource (revision `42f7f763`) combina AndroidControl (55.936 filas), GUI-Odyssey (9.979), AMEX (7.072) y ScreenQA (5.995). La decodificacion se realiza con modo thinking activado y temperatura 0.

## Capacidades

- Generacion de acciones de agente GUI para Android en formato JSON estructurado.
- Interpretacion de capturas de pantalla de telefonos (comprension visual de interfaces).
- Soporte de acciones: click, long_press, input_text, scroll, open_app, navigate_back, navigate_home, keyboard_enter, wait, answer y status (complete/infeasible).
- Razonamiento de un paso con bloque de intencion explicito (``).
- Respuesta a preguntas sobre el contenido de la pantalla (accion `answer`).
- Capacidad multimodal imagen-texto a texto (pipeline image-text-to-text).
- Capacidad de agente multi-paso limitada: usa un historial textual de los ultimos 8 pasos, sin memoria visual mas alla del paso actual.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Investigacion en agentes GUI: sirve como checkpoint de referencia para reproducir los resultados del autor y comparar variantes de la receta de entrenamiento (MultiSource frente a AndroidControlOnly).
- Evaluacion de pipelines de agentes moviles: el formato de entrada y salida (objetivo, historial de 8 pasos, captura y accion JSON) permite integrarlo en arneses de evaluacion como AndroidWorld para medir tasas de exito.
- Automatizacion de tareas de prueba en dispositivos Android: en entornos controlados y emulados, el modelo puede generar secuencias de acciones para pruebas de regresion de interfaces.
- Analisis de comprension de pantallas: la accion `answer` permite construir un modulo que responda preguntas sobre el contenido visible de una interfaz capturada.
- Generacion de datos sinteticos de interaccion: las predicciones del modelo pueden usarse como senal auxiliar en la construccion de datasets de demostraciones para agentes.
- Estudio de degradacion online frente a offline: caso de analisis metodologico sobre como mejoras en splits de desarrollo pueden no transferirse a evaluacion en entorno real.

## Benchmarks y rendimiento

| Benchmark | MultiSource | AndroidControlOnly |
|---|---|---|
| AndroidWorld seed 30 (116 tareas, desarrollo) | 3 | 15 |
| AndroidControl test, precision de paso high-level | 0,716 | 0,715 |
| AndroidControl test, precision de paso low-level | 0,893 | 0,948 |
| Precision terminal `complete` | 0,732 | 0,792 |
| Dev split GUI-Odyssey (respuestas) | 0,644 | 0,269 |
| Dev split AMEX (respuestas) | 0,735 | 0,306 |
| Dev split ScreenQA (respuestas) | 0,764 | 0,000 |
| MMStar | 54,6 % | 57,1 % |
| MMLU | 50,9 % | 49,5 % |

El autor documenta el fenomeno como "ganancias offline, colapso online": las mejoras en los nuevos splits de desarrollo no se traducen en AndroidWorld, que cae de 15 a 3 tareas. La causa sospechada son 8.739 filas de entrenamiento con intencion en blanco y un 30,4 % de pasos en AndroidWorld con intencion vacia; forzar una intencion de una linea en inferencia elevo el resultado a 6/116 (+3 / -0, p = 0,25).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~1,92 mil millones de parametros; en precision completa (fp16) requiere aproximadamente 4 GB solo para pesos, mas overhead de activaciones y tokens de imagen; en 4-bit GGUF se reduce a aproximadamente 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16; RTX 3060/4060 o superiores son suficientes por tamano, aunque el autor entreno en GPU de Colab (sin especificar modelo exacto).
- Cabe en GPU de consumo: si, incluidas tarjetas de gama media con 8 GB o mas, y en configuracion GGUF 4-bit en equipos con 4-6 GB.
- Opciones de despliegue: transformers (libreria indicada), llama.cpp/Ollama mediante el GGUF publicado en repo separado; no se documenta soporte explicito de vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-Dev-MultiSource | ~1,92 B | No disponible (historial 8 pasos) | Agente GUI Android (checkpoint de desarrollo) | LFM Open License v1.0 | Obsoleto, no recomendado |
| LFM3-VL-2B-MobileAgent-Dev-AndroidControlOnly | ~1,92 B | No disponible (historial 8 pasos) | Agente GUI Android (checkpoint de desarrollo) | LFM Open License v1.0 | Mejor rendimiento online en la comparativa del autor |
| LFM3-VL-2B-MobileAgent | ~1,92 B | No disponible | Agente GUI Android (version recomendada) | LFM Open License v1.0 | Recomendado por el autor |
| LiquidAI/LFM3-VL-2B | ~1,92 B | No disponible | Modelo base vision-lenguaje | LFM Open License v1.0 | Modelo base |

## Limitaciones y advertencias

- Checkpoint de desarrollo marcado explicitamente como obsoleto y no recomendado por el autor; el propio autor indica usar LFM3-VL-2B-MobileAgent en su lugar.
- Colapso en evaluacion online: solo 3 de 116 tareas completadas en AndroidWorld, frente a 15 del checkpoint AndroidControlOnly.
- Modelo de investigacion: no debe operar de forma desatendida en un telefono con cuentas, mensajes o pagos reales.
- Solo acepta objetivos en ingles (idioma `en`); no se documenta soporte multilingue.
- Una unica captura de pantalla por paso y sin memoria visual mas alla del historial textual de 8 pasos.
- Entrenado unicamente con demostraciones grabadas; nunca ha interactuado con un telefono en vivo durante el entrenamiento.
- Riesgo de alucinacion en la prediccion de acciones y coordenadas, especialmente fuera de los dominios de entrenamiento.
- Licencia LFM Open License v1.0 heredada del modelo base; es necesario revisar los terminos para uso comercial.
- Sesgos conocidos: no documentados en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-MultiSource
- Version GGUF 4-bit: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-MultiSource-GGUF
- Modelo recomendado: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Checkpoint previo AndroidControlOnly: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-AndroidControlOnly
- Dataset de entrenamiento: https://huggingface.co/datasets/experimentalmachines/MobileAgent-SFT-MultiSource
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentacion de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
- Guia de nomenclatura: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/naming.md
- Licencia: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-MultiSource/blob/main/LICENSE
