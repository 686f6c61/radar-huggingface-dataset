# nori-sdc/Qwen3.5-4B-SoraFriendAI-GGUF

## Resumen

Qwen3.5-4B-SoraFriendAI-GGUF es un ajuste fino experimental del modelo Qwen3.5-4B de Alibaba, desarrollado por la empresa japonesa 株式会社ソフトウエア開発 (Software Development Co., Ltd.) para su aplicación iOS SoraFriendAI (そらとも). No es un modelo de propósito general: está entrenado específicamente para responder a un contrato de operaciones fijo definido por la aplicación, y el propio autor advierte que usarlo de forma aislada para conversación general no produce respuestas con sentido. Se distribuye en formato GGUF cuantizado para ejecución en dispositivo (on-device) en iPhone con iOS 18 o superior y 8 GB de memoria.

La distribución actual (etiqueta `v20261114-r14`) separa el modelo base cuantizado en Q4_K_M del adaptador LoRA entrenado (en F16), junto con un proyector de imagen multimodal (mmproj) y un fichero de persona. El conjunto de cuatro ficheros suma 3.625.762.005 bytes (aproximadamente 3,6 GB). El modelo base declara 4.326.350.848 parámetros según safetensors.

Su relevancia es acotada pero ilustrativa: muestra un caso de ajuste fino de un LLM de 4B parámetros para un dominio de aplicación muy cerrado (control de voz, gestión de memoria, operaciones de la app) con despliegue local en móvil, licencia Apache 2.0 y un proceso de versionado explícito con validación en dispositivo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B, detalles internos no disponibles) |
| Parametros totales | 4.326.350.848 (modelo base) |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (base), F16 (adaptador LoRA y proyector de imagen) |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (base, adaptador y mmproj) y texto plano (persona) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, obtenido a través del repositorio de unsloth, convertido a GGUF F16 con `convert_hf_to_gguf.py` de llama.cpp y cuantizado a Q4_K_M con `llama-quantize`. La distribución no incluye el modelo fusionado, sino el base cuantizado más un adaptador LoRA en F16 (`SoraFriendAI-SORA4-ADAPTER-r14-sora4_1113_1505.gguf`, 169.887.424 bytes). Incluye además un proyector de imagen multimodal `mmproj-F16.gguf` (672.423.616 bytes), lo que indica capacidades de visión en el pipeline de la app.

El ajuste fino se realizó sobre un corpus de instrucciones específico de la aplicación: la versión r14 emplea 66.849 líneas de entrenamiento (frente a las 65.722 de r13), ampliadas con 341 líneas ×3 para ajustarse al contrato de operaciones actual (221 → 224 operaciones). El entrenamiento cubre funciones concretas de la app: creación de copias de seguridad, experiencia acumulada, estado de ánimo y vínculo, apertura de ajustes por voz, nombres de reuniones, inicio de actividades de juego y pantallas de pasos y actividad. El corpus incluye 298 líneas de respuestas sobre cambios de nombre y sobre la prohibición de inventar cuando no hay contexto previo. No se documentan detalles sobre RLHF, DPO ni el número total de tokens de entrenamiento del modelo base. El autor indica que la versión adoptada corresponde a la tercera época (`sora4_1113_1505_A_ep3.gguf`).

## Capacidades

- Generación de texto en japonés orientada a un contrato de operaciones cerrado de la aplicación SoraFriendAI.
- Interpretación de instrucciones de voz para ejecutar acciones de la app (copias de seguridad, ajustes, actividades, pantallas de pasos).
- Distinción entre experiencia acumulada, estado de ánimo actual y nivel de vínculo.
- Gestión de memoria de perfil y persona mediante un fichero de persona separado (`profile_learned: true`).
- Capacidad multimodal de imagen a través del proyector `mmproj-F16.gguf` (integración con la app, no verificable de forma independiente).
- Comportamiento conservador ante operaciones peligrosas: según la validación del autor, 0 ejecuciones inmediatas en la prueba de operaciones peligrosas.
- No soporta conversación general ni uso fuera del contrato de la aplicación, según advertencia explícita del autor.
- Tool calling, function calling genérico, agentes multi-paso y razonamiento general: no disponibles como capacidades documentadas.

## Casos de uso

- Asistente de voz integrado en la app SoraFriendAI: el modelo traduce instrucciones habladas del usuario en operaciones concretas de la interfaz (abrir ajustes, iniciar actividades, consultar pasos) siguiendo el contrato de 224 operaciones.
- Copias de seguridad por voz: interpreta expresiones como "crear una copia" o "copiar fuera del iPhone" y las mapea a la operación de respaldo correspondiente, con independencia de la formulación exacta empleada.
- Consulta de estado de gamificación: responde a preguntas sobre experiencia acumulada ("cuántos corazones hay acumulados"), estado de ánimo actual y vínculo, diferenciando cada métrica.
- Gestión de identidad y persona: mantiene coherencia con el fichero de persona distribuido y explica cambios de nombre sin inventar información cuando falta contexto previo.
- Ejecución local en iPhone sin conexión: al ser un GGUF Q4_K_M de ~2,8 GB, permite inferencia en dispositivo en iPhone con iOS 18 y 8 GB de memoria, sin depender de servidores externos.
- Validación de contratos de operaciones en desarrollo de apps: sirve como referencia de cómo ajustar un modelo de 4B para un dominio de comandos cerrado con evaluación por lotes de casos (contrato, pizarra, registro,口语).
- Base para experimentación en ajuste fino on-device: la separación entre base cuantizado y adaptador LoRA facilita probar nuevas versiones del adaptador sin redistribuir el modelo completo.

## Benchmarks y rendimiento

Resultados de la evaluación interna de desarrollo proporcionada por el autor (2026-11-13), no verificados de forma independiente:

| Prueba | r14 | Referencia (r13 u otra) |
|---|---|---|
| Contrato: verificación | 43/45 (argumentos 12/13) | no disponible |
| Pizarra | 18/20 | r13: 19/20 |
| Confusión de registro | 19/20 | no disponible |
| Verificación r11 | 10/10 | no disponible |
| Verificación r9 | 25/26 | r13: 26/26 |
| play7 | 192/196 | r13: 189/196 |
| Lenguaje coloquial | 270/274 | no disponible |
| Operaciones peligrosas ejecutadas de inmediato | 0 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor indica que la verificación de hechos sobre "Sora" no se ejecutó en esta ronda y que estas puntuaciones no garantizan la tasa de acierto en dispositivo real.

## Requisitos de hardware

- VRAM/memoria estimada: el conjunto base Q4_K_M ocupa 2.783.447.040 bytes (~2,8 GB); con adaptador LoRA y proyector de imagen el total ronda los 3,6 GB, más overhead de inferencia.
- Objetivo principal: iPhone con iOS 18 o superior y 8 GB de memoria (referencia indicada por el autor); la app TestFlight desactiva actualmente la restricción de carga por requisitos de memoria.
- GPU de escritorio: no se especifican requisitos; por tamaño, un modelo de 4B en Q4_K_M puede ejecutarse en GPUs de consumo con 6-8 GB de VRAM, aunque no hay datos oficiales.
- Opciones de despliegue: llama.cpp (formato GGUF nativo, conversión y cuantización realizadas con sus herramientas); el tag `endpoints_compatible` sugiere compatibilidad con endpoints, sin más detalle.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-SoraFriendAI-GGUF | 4,33B | no disponible | Apache 2.0 | Ajuste fino para app iOS concreta | GGUF en HF |
| Qwen/Qwen3.5-4B (base) | 4,33B | no disponible | Apache 2.0 (según modelo base) | Propósito general | HF |
| unsloth/Qwen3.5-4B | 4,33B | no disponible | Apache 2.0 (según modelo base) | Distribución optimizada del base | HF |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de dominio cerrado: el autor advierte explícitamente que no produce respuestas con sentido fuera del contrato de operaciones de SoraFriendAI.
- Solo japonés: no hay soporte documentado de otros idiomas.
- Estado experimental y en desarrollo: contenido, forma y ubicación pueden cambiar sin aviso; no se garantiza calidad ni estabilidad.
- Requiere la versión build 369 o superior de la app; versiones anteriores (build 368 o inferior) no cargan r14.
- La reversión del manifiesto a una versión anterior no revierte automáticamente dispositivos que ya han cargado r14.
- Riesgo de alucinación mitigado parcialmente por entrenamiento específico (298 líneas sobre no inventar sin contexto), pero sin garantía formal.
- Validación limitada: pruebas realizadas por una persona (茜) en iPhone 16 Pro Max con build 369; no hay prueba de dispositivo independiente por el equipo de preparación de distribución.
- Las puntuaciones de evaluación interna no garantizan la tasa de acierto en dispositivo real.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones y avisos del modelo base Qwen3.5-4B.
- El commit del snapshot de origen y el commit de llama.cpp usado en la conversión no están identificados en los registros del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nori-sdc/Qwen3.5-4B-SoraFriendAI-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Origen del snapshot usado: https://huggingface.co/unsloth/Qwen3.5-4B
- Manifiesto de distribución: https://huggingface.co/nori-sdc/SoraFriendAI/blob/main/manifest.json
