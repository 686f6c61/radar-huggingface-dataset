# experimentalmachines/LFM3-VL-2B-MobileAgent-v3

## Resumen

LFM3-VL-2B-MobileAgent-v3 es un ajuste fino mediante LoRA del modelo multimodal LiquidAI/LFM3-VL-2B, desarrollado por experimentalmachines, orientado a la operacion de telefonos Android a partir de capturas de pantalla. El modelo recibe el objetivo del usuario en lenguaje natural, el historial de las ultimas 8 acciones y una captura de pantalla, y emite una unica accion siguiente en formato JSON compacto precedida de un bloque `<think>` con la intencion. Con 1.918.181.888 parametros (aproximadamente 1,9 mil millones), se posiciona como un agente GUI ligero que puede ejecutarse en hardware modesto.

El modelo resuelve el problema de la automatizacion de interfaces moviles mediante agentes vision-lenguaje: traducir instrucciones de alto nivel en secuencias de acciones concretas (clic, desplazamiento, entrada de texto, navegacion) sobre coordenadas normalizadas en una rejilla de 0 a 1000. Es relevante en el contexto de la investigacion sobre agentes GUI, donde la latencia y el coste de inferencia por paso son criticos, y donde un modelo de 2B con cuantizacion de 4 bits puede desplegarse en un telefono.

Esta version (v3) es un experimento de ablacion: parte de la mezcla de datos de v2 con todas las intenciones en blanco rellenadas por Qwen3-VL-8B-Instruct y plantillas de accion, para comprobar si las intenciones vacias causaban el colapso observado en v2. El autor la marca como **superseded** por v4. Es un modelo de investigacion, no un producto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (lfm3_vl), ajuste LoRA sobre el modelo de lenguaje con torre de vision congelada |
| Parametros totales | 1.918.181.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF de 4 bits (version publicada como LFM3-VL-2B-MobileAgent-v3-GGUF); pesos originales en safetensors |
| Idiomas soportados | ingles (en) |
| Licencia | LFM Open License v1.0 (heredada de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | safetensors (modelo fusionado y adaptador LoRA en `lora_adapter/`), GGUF de 4 bits |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/LFM3-VL-2B, un transformer multimodal de tipo vision-lenguaje. Sobre el se aplico un ajuste fino supervisado (SFT) con LoRA de rango 64 y alpha 128 unicamente sobre el modelo de lenguaje, manteniendo congelada la torre de vision. El adaptador se fusiono en los pesos finales, y se conserva una copia del adaptador en el subdirectorio `lora_adapter/`. El entrenamiento consistio en 1.250 pasos con lotes de 32 filas y una tasa de aprendizaje de 2e-4, ejecutado en una GPU H100 en Modal.

Los datos provienen del dataset experimentalmachines/MobileAgent-SFT-v3 (revision `565ba76c`), que consta de 78.952 filas tras descartar 30. Es una version de la mezcla de v2 en la que se rellenaron todas las intenciones en blanco: 6.106 intenciones escritas por Qwen3-VL-8B-Instruct y 2.603 provenientes de plantillas de accion. No se menciona uso de RLHF ni DPO. La imagen de entrada se redimensiona a un maximo de 880 x 880 px de area (unos 720 tokens de imagen), y la decodificacion se realiza con el modo de pensamiento activado y temperatura 0.

## Capacidades

- Generacion de acciones GUI sobre Android: clic, pulsacion larga, entrada de texto, desplazamiento en cuatro direcciones, apertura de aplicaciones, navegacion atras/inicio, tecla intro, espera, respuesta a preguntas sobre la pantalla y marcado de estado de la tarea (completada o infactible).
- Comprension de capturas de pantalla y localizacion de elementos mediante coordenadas normalizadas en una rejilla de 0 a 1000.
- Razonamiento breve en modo pensamiento: emite un bloque `<think>` con la intencion antes de la accion JSON.
- Seguimiento de un historial de las ultimas 8 acciones en formato textual.
- Respuesta a preguntas sobre el contenido de la pantalla (accion `answer`).
- Capacidades visuales generales heredadas del modelo base, evaluadas en MMStar (55,3 %) y MMLU (50,0 %).
- Soporte multilingue limitado al ingles.
- No se documenta soporte de tool calling generico ni de agentes multi-paso fuera del bucle de acciones GUI.

## Casos de uso

- Investigacion en agentes GUI moviles: banco de pruebas reproducible para medir la precision de acciones de alto y bajo nivel en AndroidControl y el exito de tareas en AndroidWorld, con codigo y arneses de evaluacion publicados en el repositorio del proyecto.
- Automatizacion de pruebas de interfaz en Android: el modelo puede generar secuencias de acciones a partir de capturas para validar flujos de navegacion en pipelines de QA, aunque con supervision humana.
- Prototipado de asistentes de accesibilidad: dado un objetivo en ingles y una captura, propone la siguiente accion para guiar a un usuario con dificultades motoras, manteniendo el control humano en el bucle.
- Extraccion de informacion de pantallas: la accion `answer` permite responder preguntas sobre el contenido visible, util para tareas de lectura de interfaz en entornos controlados.
- Evaluacion comparativa de estrategias de datos: al ser una ablacion explicita (rellenar intenciones en blanco), sirve para estudiar el efecto de la calidad de las anotaciones en el ajuste de agentes pequeños.
- Despliegue en dispositivo: la version GGUF de 4 bits permite ejecutar el modelo en un telefono para experimentos de inferencia local, con latencia por paso potencialmente baja gracias a su tamano de 2B.
- Generacion de datos sinteticos de trayectorias: sus salidas JSON normalizadas pueden usarse como semilla para construir datasets de acciones, siempre con filtrado posterior.

## Benchmarks y rendimiento

| Benchmark | v3 | v2 | v1 |
|---|---|---|---|
| AndroidWorld seed 30 (116 tareas, desarrollo) | 13 | 3 | 15 |
| AndroidControl test, precision de paso alto / bajo nivel | 0,723 / 0,902 | 0,716 / 0,893 | 0,715 / 0,948 |
| Precision de `complete` en terminal | 0,725 | 0,732 | 0,792 |
| GUI-Odyssey / AMEX / ScreenQA (respuestas, splits de desarrollo) | 0,662 / 0,741 / 0,724 | 0,644 / 0,735 / 0,764 | 0,269 / 0,306 / 0,000 |
| MMStar / MMLU | 55,3 % / 50,0 % | 54,6 % / 50,9 % | 57,1 % / 49,5 % |

El autor senala que v3 se recupera de v2 en AndroidWorld (10 tareas solo resueltas por v3, 0 solo por v2, p = 0,002) pero no supera a v1 (p = 0,75). Ademas, v3 nunca emite la accion `answer` en AndroidWorld pese a que ScreenQA esta en sus datos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1,9 mil millones de parametros, la inferencia en precision completa requiere aproximadamente 4 GB y la version GGUF de 4 bits alrededor de 1,5-2 GB, aunque estas cifras no estan publicadas por el autor.
- GPU recomendadas: el entrenamiento se realizo en una H100. Para inferencia, una RTX 4090 o superior es suficiente; tambien cabria en GPUs consumer de gama media con cuantizacion.
- Cabe en GPU consumer: si, previsiblemente en tarjetas con 4-8 GB de VRAM usando la version GGUF de 4 bits, y potencialmente en un telefono.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp u otros runners compatibles con GGUF para la version cuantizada; no se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento relevante | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-v3 | 1,92 B | no disponible | AndroidWorld 13/116; AndroidControl 0,723 / 0,902 | LFM Open License v1.0 | Hugging Face (4 descargas) |
| LFM3-VL-2B-MobileAgent-v1 | 1,92 B (base identica) | no disponible | AndroidWorld 15/116; AndroidControl 0,715 / 0,948 | LFM Open License v1.0 | Hugging Face |
| LFM3-VL-2B-MobileAgent-v2 | 1,92 B (base identica) | no disponible | AndroidWorld 3/116; AndroidControl 0,716 / 0,893 | LFM Open License v1.0 | Hugging Face |
| LiquidAI/LFM3-VL-2B (base) | 1,92 B | no disponible | no disponible en la informacion | LFM Open License v1.0 | Hugging Face |

No se dispone de datos de otros agentes GUI comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el autor advierte explicitamente de no dejarlo actuar sin supervision en un telefono con cuentas reales, mensajes o pagos.
- Solo acepta objetivos en ingles; no hay soporte multilingue.
- Procesa una unica captura por paso y no tiene memoria mas alla del historial textual de 8 pasos.
- Entrenado unicamente con demostraciones grabadas; nunca ha interactuado con un telefono real durante el entrenamiento, lo que puede provocar fallos en estados no vistos.
- Nunca emite la accion `answer` en AndroidWorld, lo que limita su uso en tareas de respuesta a preguntas sobre la pantalla en ese entorno.
- Riesgo de alucinacion en la localizacion de coordenadas y en la interpretacion de capturas ambiguas.
- Licencia LFM Open License v1.0: es necesario revisar sus terminos para uso comercial, ya que no es una licencia permisiva estandar.
- Version marcada como superseded por v4; para nuevos desarrollos conviene evaluar la version posterior.
- Con solo 4 descargas y 0 likes, no hay validacion comunitaria ni informes independientes de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v3
- Version GGUF de 4 bits: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v3-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/experimentalmachines/MobileAgent-SFT-v3
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentacion de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
