# experimentalmachines/LFM3-VL-2B-MobileAgent-v1

## Resumen

LFM3-VL-2B-MobileAgent-v1 es un ajuste fino del modelo multimodal LiquidAI/LFM3-VL-2B orientado a la operación autónoma de teléfonos Android a partir de capturas de pantalla. Lo desarrolla el usuario experimentalmachines y resuelve un problema concreto: convertir un modelo visión-lenguaje genérico de 2B parámetros en un agente de interfaz gráfica (GUI agent) capaz de emitir una única acción JSON por paso, con coordenadas normalizadas en una rejilla de 0 a 1000.

El entrenamiento se realizó mediante LoRA SFT (rango 64, alpha 128) sobre el modelo de lenguaje, con la torre de visión congelada, y los adaptadores se fusionaron en los pesos finales (el adaptador original se conserva en `lora_adapter/`). Se usaron 99.216 filas del split oficial de entrenamiento de AndroidControl en 1.250 pasos con 32 filas por paso y una tasa de aprendizaje de 2e-4.

Es relevante como referencia metodológica para quien quiera construir agentes móviles pequeños y desplegables en hardware modesto, pero el propio autor lo marca como **superado por la versión v4** y lo mantiene únicamente como línea base en comparaciones sobre conjuntos de evaluación reservados. El modelo tiene 1.918.181.888 parámetros totales y un repositorio de 4,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LFm3-VL) con torre de visión congelada y modelo de lenguaje ajustado por LoRA; clase `lfm3_vl` con código personalizado |
| Parametros totales | 1.918.181.888 (aprox. 1,92B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF de 4 bits (versión publicada aparte); no se detallan otros formatos |
| Idiomas soportados | inglés (`en`) |
| Licencia | LFM Open License v1.0 (heredada de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | safetensors (transformers); GGUF de 4 bits en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-VL-2B, un modelo visión-lenguaje que procesa una captura de pantalla por paso, redimensionada a un máximo de 880 × 880 píxeles de área (aproximadamente 720 tokens de imagen). El ajuste se aplicó como LoRA SFT de rango 64 y alpha 128 exclusivamente sobre el modelo de lenguaje, manteniendo la torre de visión congelada; posteriormente los pesos del adaptador se fusionaron en el modelo final.

Los datos provienen de AndroidControl (split oficial de entrenamiento, 99.216 filas), un corpus de demostraciones grabadas con etiquetas de intención y acción. El entrenamiento se ejecutó en GPU de Modal durante 1.250 pasos con 32 filas por paso y tasa de aprendizaje 2e-4. No se menciona en la información disponible el uso de RLHF, DPO ni otras fases de alineación posteriores al SFT. La entrada de usuario sigue un formato fijo con `Goal: …`, `Previous steps:` (los últimos 8 pasos como `n. <intent> -> <action JSON>`) y la pregunta `What is the next action?`; la salida es `<think>intención breve</think>` seguido de una única acción JSON compacta.

## Capacidades

- Generación de acciones de interfaz Android en formato JSON: `click`, `long_press`, `input_text`, `scroll`, `open_app`, `navigate_back`, `navigate_home`, `keyboard_enter`, `wait`, `answer` y `status`.
- Localización visual de elementos: emite coordenadas enteras normalizadas en una rejilla 0-1000 sobre la captura de pantalla.
- Razonamiento breve explícito mediante la etiqueta `<think>`, con decodificación en modo thinking y temperatura 0.
- Comprensión de imágenes (capturas de pantalla) y texto (objetivo e historial de pasos) en una tarea image-text-to-text.
- Seguimiento de historial limitado a los últimos 8 pasos en texto.
- Capacidad de responder preguntas sobre la pantalla mediante la acción `answer` (aunque en la práctica el modelo no la emite, ver limitaciones).
- Capacidad de marcar el objetivo como `complete` o `infeasible` mediante la acción `status`.
- No dispone de soporte documentado de tool calling genérico, function calling, audio ni agentes multi-turno más allá del historial de 8 pasos.

## Casos de uso

- Investigación en agentes GUI móviles: sirve como línea base reproducible para comparar nuevas técnicas de ajuste sobre AndroidControl, dado que el autor publica resultados y arneses de evaluación en su repositorio.
- Automatización de pruebas de aplicaciones Android: el modelo puede generar secuencias de acciones sobre capturas para validar flujos de UI en entornos de test controlados, sin cuentas reales.
- Prototipado de asistentes de accesibilidad: con objetivos en inglés y una captura por paso, puede proponer la siguiente acción (pulsar, desplazar, escribir) para usuarios con dificultades motoras, siempre con supervisión humana.
- Extracción de flujos de navegación a partir de demostraciones: al predecir la siguiente acción con alta precisión de bajo nivel (0,948 en AndroidControl test), resulta útil para generar trayectorias sintéticas de entrenamiento.
- Evaluación comparativa de modelos pequeños multimodales: su tamaño de 1,92B y su despliegue en GGUF de 4 bits permiten ejecutarlo en hardware de consumo para estudios de latencia y precisión.
- Docencia y divulgación: ejemplo didáctico de ajuste LoRA sobre un VLM para una tarea de agente, con datos, código y resultados publicados de forma abierta.
- Despliegue en dispositivos con recursos limitados: la versión GGUF de 4 bits permite inferencia local en portátiles (el autor reporta 2,66 s por paso de mediana en GPU Apple M5).

## Benchmarks y rendimiento

Resultados publicados por el autor, una ejecución por benchmark, temperatura 0, GGUF de 4 bits; las excepciones cuentan como fallos.

| Benchmark | v1 | v4 (posterior) |
|---|---|---|
| AndroidWorld, seeds reservados 7 / 1234 / 2026 (348 tareas) | 32 (11 / 10 / 11) | 54 |
| AndroidWorld, seed 30 (116 tareas, desarrollo) | 15 (modelo base: 1) | 18 |
| AndroidControl test, precisión de paso alto / bajo nivel | 0,715 / 0,948 | 0,728 / 0,908 |
| Precisión terminal `complete` | 0,792 | 0,716 |
| Splits de desarrollo: GUI-Odyssey / AMEX / ScreenQA | 0,269 / 0,306 / 0,000 | no disponible |
| MMStar / MMLU (base: 52,1 % / 48,9 %) | 57,1 % / 49,5 % | 52,9 % / 50,4 % |
| GPU Apple M5, mediana de segundos por paso | 2,66 | 2,96 |

La diferencia v4 − v1 en los seeds reservados es de +6,3 puntos (IC 95 % de +1,1 a +11,5; p = 0,02).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,92B parámetros, la cuantización de 4 bits del repositorio GGUF debería situarse en torno a 1-2 GB de pesos, más el coste de los tokens de imagen (unos 720 por captura).
- GPU recomendadas: no se especifican; el autor reporta mediciones en GPU Apple M5 (2,66 s por paso de mediana).
- Cabe en GPU de consumo: sí, en principio, dada la cuantización de 4 bits publicada; no se detallan modelos concretos de NVIDIA o AMD.
- Opciones de despliegue: transformers (librería principal, con `custom_code`), GGUF de 4 bits para runners compatibles; no se confirman vLLM, TGI, llama.cpp ni Ollama en la información disponible.
- Latencia y throughput: 2,66 s por paso (mediana) en GPU Apple M5; no hay datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-v1 | 1,92B | no disponible | Agente GUI Android (SFT sobre AndroidControl) | LFM Open License v1.0 | Hugging Face (7 descargas) |
| LiquidAI/LFM3-VL-2B (base) | 2B (aprox.) | no disponible | VLM genérico | LFM Open License v1.0 | Hugging Face |
| LFM3-VL-2B-MobileAgent-v4 | no disponible | no disponible | Agente GUI Android (versión posterior del mismo autor) | LFM Open License v1.0 | Hugging Face (según el autor) |

No se dispone en la información proporcionada de datos de otros agentes GUI móviles comparables (parámetros, contexto, rendimiento) para ampliar la comparativa.

## Limitaciones y advertencias

- Modelo de investigación: el autor advierte explícitamente de que no debe operar sin supervisión en un teléfono con cuentas reales, mensajes o pagos.
- Nunca emite la acción `answer`: AndroidControl no incluye supervisión de respuestas, por lo que falla todas las tareas de pregunta (ScreenQA: 0,000).
- Bucles de espera: un tercio de sus pasos en AndroidWorld son `wait` bajo intenciones que no implican esperar, un patrón copiado de las etiquetas de AndroidControl (corregido en v4.1).
- Solo admite objetivos en inglés, una captura por paso y sin memoria más allá del historial de 8 pasos.
- Entrenado únicamente con demostraciones grabadas; nunca ha interactuado con un teléfono real durante el entrenamiento.
- Estado superado: el propio autor lo sustituye por v4 y lo conserva solo como línea base.
- Licencia LFM Open License v1.0: es necesario revisar sus términos para uso comercial, ya que no es una licencia permisiva estándar.
- Riesgo de alucinación en la localización de elementos y en la interpretación de pantallas no vistas durante el entrenamiento.
- Sesgos: no se documentan sesgos específicos en la información disponible, más allá del dominio y el idioma de los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v1
- Versión GGUF de 4 bits: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v1-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/experimentalmachines/MobileAgent-SFT-v1
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentación de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
- Licencia: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v1/blob/main/LICENSE
