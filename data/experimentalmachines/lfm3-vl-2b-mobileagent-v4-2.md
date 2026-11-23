# experimentalmachines/LFM3-VL-2B-MobileAgent-v4.2

## Resumen

LFM3-VL-2B-MobileAgent-v4.2 es un ajuste fino (LoRA SFT fusionado en los pesos) del modelo vision-lenguaje LiquidAI/LFM3-VL-2B, desarrollado por experimentalmachines. Su proposito es actuar como agente de interfaz grafica en Android: recibe una captura de pantalla por paso junto con el objetivo del usuario, la lista de aplicaciones instaladas y un historial textual de los ultimos 8 pasos, y devuelve una unica accion en JSON (click, scroll, input_text, open_app, etc.) con coordenadas normalizadas en una rejilla 0-1000.

El modelo resuelve el problema de la automatizacion de tareas moviles a partir de demostraciones grabadas, sin interaccion con telefonos reales durante el entrenamiento. La version 4.2 parte de los datos de v4.1 y anade historial autogenerado por el propio modelo (semi-online patching al estilo UI-S1) y filas que incorporan sus propios errores de tipo `wait`, con el objetivo de romper los bucles de espera que arrastraba la v4.

Arquitectura y tamano: es un modelo de 1.918.181.888 parametros (aproximadamente 1,9 B) con torre de vision congelada durante el ajuste, licencia LFM Open License v1.0 heredada del modelo base, y estado experimental. Segun el autor, no supera de forma significativa a la v4 en AndroidWorld y solo esta ligeramente por delante en MobileWorld.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (LFM3-VL), ajuste LoRA SFT sobre el modelo de lenguaje con torre de vision congelada |
| Parametros totales | 1.918.181.888 (aprox. 1,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (historial textual limitado a los ultimos 8 pasos) |
| Tipos de cuantizacion | 4-bit GGUF disponible en el repo hermano LFM3-VL-2B-MobileAgent-v4.2-GGUF |
| Idiomas soportados | ingles (`en`) |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada de LiquidAI/LFM3-VL-2B |
| Formato de pesos | safetensors (modelo fusionado) + adaptador LoRA en `lora_adapter/`; GGUF de 4 bits en repo aparte |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por LoRA SFT (rango 64, alpha 128) aplicado al modelo de lenguaje de LiquidAI/LFM3-VL-2B, manteniendo congelada la torre de vision y fusionando despues el adaptador en los pesos finales. El entrenamiento consistio en 1.250 pasos con lotes de 32 filas (0,43 epocas sobre 92.229 filas), tasa de aprendizaje 2e-4, ejecutado en una unica A100, con la misma receta, filas y orden de filas que la v4.

Los datos proceden de AndroidControl, GUI-Odyssey, AMEX y ScreenQA. Sobre la base de v4.1 se introducen dos cambios: (1) historial autogenerado en el 40% de los episodios de entrenamiento, donde el modelo reproduce sus propias salidas anteriores como historial (los pasos correctos conservan sus palabras y el resto recibe el paso humano), siguiendo el enfoque de semi-online patching de UI-S1 (arXiv 2509.11543) sin RL; y (2) filas de errores propios, en las que el paso donde v4.1 eligio `wait` incorrectamente se muestra como ultimo paso de historial con su intencion y accion erroneas. No se utilizo entorno de ejecucion, modelo profesor ni datos de benchmarks durante el entrenamiento.

## Capacidades

- Generacion de acciones de interfaz grafica sobre Android a partir de una captura de pantalla por paso.
- Modo de razonamiento corto: emite `<think>intencion breve</think>` seguido de una accion JSON compacta.
- Conjunto de acciones soportadas: `click`, `long_press`, `input_text`, `scroll`, `open_app`, `navigate_back`, `navigate_home`, `keyboard_enter`, `wait`, `answer` y `status` (complete/infeasible).
- Coordenadas normalizadas en rejilla 0-1000 sobre la captura.
- Historial textual de los ultimos 8 pasos como unica memoria.
- Comprension de imagenes de interfaz (resolucion de hasta 880 x 880 px de area, aproximadamente 720 tokens de imagen).
- Capacidades generales de conocimiento medidas en MMStar (55,7%) y MMLU (50,3%).
- No soporta audio, tool calling generico ni function calling fuera del esquema de acciones definido.

## Casos de uso

- Automatizacion de pruebas de UI en Android: el modelo puede generar secuencias de acciones sobre capturas de pantalla para validar flujos de aplicaciones en entornos de CI, sustituyendo scripts de grabacion manuales.
- Investigacion en agentes GUI: sirve como linea base reproducible de 2 B parametros para comparar tecnicas de historial autogenerado y recuperacion de errores en entornos como AndroidWorld o MobileWorld.
- Asistencia a usuarios con movilidad reducida: podria traducir objetivos en lenguaje natural a acciones concretas sobre el telefono, siempre con supervision humana dado su caracter experimental.
- Extraccion de informacion de pantallas: combinando la accion `answer` con la captura, puede responder preguntas sobre el contenido visible de una aplicacion.
- Navegacion automatizada de aplicaciones instaladas: mediante `open_app` e historial de pasos, puede encadenar tareas multi-paso dentro de un conjunto conocido de aplicaciones.
- Generacion de datos sinteticos de interaccion movil: sus salidas pueden usarse para construir trayectorias etiquetadas que alimenten otros entrenamientos (como ya se hizo con el historial autogenerado de esta version).
- Evaluacion de robustez de agentes: las filas de errores propios y el analisis de bucles `wait` permiten estudiar modos de fallo en agentes de 2 B.

## Benchmarks y rendimiento

Datos publicados por el autor (una ejecucion por benchmark, temperatura 0, GGUF de 4 bits; las excepciones cuentan como fallo). MobileWorld se considera benchmark de desarrollo en esta version.

| Benchmark | v4.2 | v4 | Comparativa |
|---|---|---|---|
| AndroidWorld, semilla 30 (116 tareas, desarrollo) | 18 | 18 | +6 / −6 emparejados |
| MobileWorld (105 tareas GUI en ingles) | 8 | 6 | +3 / −1, McNemar exacto p = 0,63 |
| AndroidControl test, precision paso alto / bajo nivel | 0,732 / 0,888 | 0,728 / 0,908 | — |
| MMStar (conocimiento general) | 55,7% | 52,9% | — |
| MMLU (conocimiento general) | 50,3% | 50,4% | — |

Referencias del mismo harness en MobileWorld: GUI-Owl-1.5-2B 22/105, MAI-UI-2B 11/105. En AndroidWorld con semillas reservadas, la v4 obtuvo 54/348; la v4.2 no se ha evaluado en esas semillas. Los bucles `wait` en MobileWorld cayeron del 21% al 5% de los pasos y las intenciones repetidas del 67% al 33%, sin mejora significativa en exito.

## Requisitos de hardware

- VRAM estimada para inferencia: en 4 bits (GGUF) aproximadamente 1,5-2 GB de pesos mas overhead de contexto e imagen; en precision completa (safetensors, repo de 4,1 GB) en torno a 4-5 GB.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB o mas (RTX 3060, RTX 4060, RTX 4090).
- GPU recomendadas para entrenamiento o inferencia de mayor throughput: A100 (el autor entreno en una sola A100), H100 para lotes mayores.
- Opciones de despliegue: transformers (libreria declarada, con `custom_code`), llama.cpp/Ollama mediante el GGUF de 4 bits; vLLM y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MobileWorld (mismo harness) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-v4.2 | 1,9 B | no disponible (historial de 8 pasos) | 8/105 | LFM Open License v1.0 | Hugging Face, GGUF 4 bits |
| GUI-Owl-1.5-2B | no disponible en la informacion | no disponible | 22/105 | no disponible | no disponible |
| MAI-UI-2B | no disponible en la informacion | no disponible | 11/105 | no disponible | no disponible |
| LFM3-VL-2B (base) | aprox. 1,9 B | no disponible | no disponible | LFM Open License v1.0 | Hugging Face |

## Limitaciones y advertencias

- Modelo de investigacion: no debe operar de forma desatendida en un telefono con cuentas, mensajes o pagos reales.
- Solo admite objetivos en ingles y una captura por paso; no hay memoria mas alla del historial textual de 8 pasos.
- Entrenado exclusivamente con demostraciones grabadas; nunca ha interactuado con un telefono real durante el entrenamiento, lo que limita su robustez ante estados no vistos.
- Rendimiento en AndroidWorld identico a v4 (18 en semilla 30) y sin evaluar en las semillas reservadas; la mejora en MobileWorld no es estadisticamente significativa (p = 0,63).
- Riesgo de bucles de accion (`wait` y repeticion de intenciones), reducido pero no eliminado.
- Riesgo de alucinacion en la identificacion de elementos de la pantalla y en la accion `answer` sobre contenido visible.
- Licencia LFM Open License v1.0: es necesario revisar sus terminos para uso comercial; no es una licencia de codigo abierto estandar y el modelo base impone condiciones adicionales.
- La cuantizacion de 4 bits usada en las evaluaciones puede degradar ligeramente el rendimiento respecto a los pesos completos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.2
- Version GGUF 4 bits: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.2-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentacion de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
- Paper de referencia UI-S1: arXiv 2509.11543
