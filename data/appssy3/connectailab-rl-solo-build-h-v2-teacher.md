# appssy3/connectailab-rl-solo-build-h-v2-teacher

## Resumen

connectailab-rl-solo-build-h-v2-teacher es un modelo de decisión por refuerzo (no un modelo de lenguaje generativo) desarrollado por el usuario appssy3 dentro del ecosistema CONNECT AI LAB y AI CITY BUILDERS. Su función es actuar como "cerebro" o "presidente" de una empresa simulada en el entorno Connect Tycoon, tomando decisiones operativas durante un mes de negocio (20 días laborables) sobre asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad.

El modelo no es un transformer de lenguaje: se distribuye como artefacto NumPy y se integra a través de la librería `connect_tycoon` como un `CompanyBrain`. Recibe peticiones en formato JEV (`typesafe/jev-1.13`), un esquema de preguntas y respuestas tipadas, y devuelve decisiones con distribuciones de probabilidad sobre las opciones disponibles. Está entrenado en dos fases: primero imitación de un "presidente por reglas" (aprendizaje supervisado) y después ajuste con PPO usando recompensas derivadas del valor de la empresa (beneficio, satisfacción del cliente y riesgo).

Es relevante como ejemplo didáctico de aplicación de reinforcement learning a la toma de decisiones empresariales en un simulador sintético, con métricas comparativas frente a la política basada en reglas. No obstante, se trata de un modelo educativo de nicho, con cero descargas y cero likes en el momento de la consulta, orientado al mercado coreano y sin garantías de transferencia a entornos reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de reinforcement learning; artefacto NumPy, no transformer) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | artefacto NumPy integrado vía `connect_tycoon.CompanyBrain` (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna de la red (número de capas, dimensiones, tipo de codificador de estado). Lo que sí se documenta es el paradigma: una política de decisión entrenada con deep reinforcement learning sobre el simulador Connect Tycoon, con PPO como algoritmo de optimización y Gymnasium como interfaz de entorno. El modelo se carga con `CompanyBrain.from_hub(...)` y responde a preguntas tipadas JEV, devolviendo elecciones discretas junto con probabilidades y un nivel de confianza.

El entrenamiento consta de dos etapas explícitas: (1) aprendizaje supervisado imitando a un "presidente por reglas" que actúa como profesor, y (2) ajuste fino con PPO utilizando una función de recompensa basada en los valores corporativos declarados `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}` (beneficio, satisfacción del cliente y riesgo, con peso unitario cada uno). No se especifican el volumen de datos, la composición del dataset ni si hubo otras técnicas de alineación.

## Capacidades

- Toma de decisiones discretas de negocio en el simulador Connect Tycoon: asignación de personal, pedidos de inventario, campañas de marketing, atención al cliente, gestión de reembolsos y seguridad.
- Respuesta a preguntas tipadas en formato JEV (`typesafe/jev-1.13`), incluyendo preguntas de tipo `choice` con criterios y opciones definidas por el llamante.
- Devolución de distribuciones de probabilidad sobre las opciones, lo que permite umbrales de confianza y abstención.
- Razonamiento multi-paso dentro de un episodio de 20 días laborables (un mes simulado), tomando decisiones secuenciales con realimentación del entorno.
- Soporte de integración con Gymnasium y con la CLI `connect-tycoon play --brain hf:...` para ejecutarlo como oponente o controlador en el juego.
- Capacidad multilingüe: no disponible; el modelo está etiquetado únicamente para coreano.
- Tool calling, function calling, visión, audio y modo thinking: no disponibles (no es un modelo generativo de propósito general).

## Casos de uso

- Docencia de reinforcement learning aplicado a negocio: el modelo sirve como ejemplo ejecutable de un pipeline completo (simulador, imitación, PPO) en un notebook de Colab, adecuado para cursos de RL y para comparar políticas aprendidas frente a heurísticas.
- Evaluación de políticas en simuladores: investigadores pueden usar el modelo como baseline "aprendido" frente al presidente por reglas y medir el efecto de cambiar la función de recompensa o la configuración de la empresa.
- Agente controlador en Connect Tycoon: mediante `connect-tycoon play --brain hf:appssy3/connectailab-rl-solo-build-h-v2-teacher`, el modelo gestiona la empresa mes a mes y permite observar sus decisiones en la interfaz del juego.
- Generación de datos sintéticos de decisiones empresariales: las respuestas con probabilidades pueden emplearse para estudiar patrones de decisión bajo incertidumbre (por ejemplo, cuándo deriva un reembolso a revisión humana).
- Prototipado de sistemas de decisión con abstención: el campo `confidence` y la distribución de probabilidades permiten diseñar flujos donde el modelo solo actúa por encima de un umbral y escala el resto a un humano.
- Investigación sobre alineación de objetivos múltiples: la recompensa ponderada (beneficio, satisfacción, riesgo) permite experimentar con trade-offs y observar cómo la política resultante prioriza unos objetivos sobre otros.

## Benchmarks y rendimiento

La model card incluye una comparación empírica frente al "presidente por reglas" sobre 40 meses no vistos, con las siguientes métricas medias:

| Métrica (media de 40 meses no vistos) | Presidente por reglas | connectailab-rl-solo-build-h-v2-teacher |
|---|---|---|
| Beneficio mensual | 3,24 M KRW | 11,01 M KRW |
| Satisfacción del cliente | 79 % | 95 % |
| Incidentes de riesgo | 7,8 | 4,0 |
| Escalados a confirmación humana | 37,8 | 20,7 |
| Días con rotura de stock | 10,7 | 0,5 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es coherente con la naturaleza del modelo: no es un LLM y no se evalúa con esas suites.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un artefacto NumPy de una política de decisión, la huella es muy inferior a la de un LLM y no requiere GPU dedicada en principio.
- GPU recomendadas: no disponibles; el entrenamiento con PPO puede beneficiarse de GPU, pero la inferencia del cerebro se ejecuta en CPU.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier equipo capaz de ejecutar NumPy y el simulador, aunque el autor no publica requisitos mínimos.
- Opciones de despliegue: librería `connect_tycoon` (extra `[game]`), carga desde Hugging Face Hub con `CompanyBrain.from_hub`, y CLI `connect-tycoon play`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-solo-build-h-v2-teacher | Política RL para simulación de negocio | no disponible | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Presidente por reglas de Connect Tycoon | Heurística basada en reglas | no aplica | no aplica | incluida en el proyecto Connect Tycoon | GitHub del proyecto |
| Modelos RL de decisión tipo Decision Transformer | Transformer para RL offline | variable según implementación | variable | variable | disponibles en la comunidad |

No se dispone de información sobre otros modelos comparables específicos de este nicho (decisión empresarial en simuladores) en la documentación proporcionada; la comparativa con alternativas genéricas de RL queda como referencia cualitativa.

## Limitaciones y advertencias

- Modelo educativo y de nicho: la propia model card advierte que es un "modelo educativo sobre un simulador de empresa sintético" y que no garantiza ni predice resultados de gestión reales.
- Sesgo de dominio: entrenado exclusivamente para el simulador Connect Tycoon con una configuración concreta de empresa (`warehouse`, `base_demand`, `unit_cost`, etc.); su comportamiento fuera de esa distribución no está validado.
- Idioma: etiquetado solo para coreano; no hay evidencia de soporte para castellano ni otras lenguas.
- Riesgo de alucinación: no aplica en el sentido de generación de texto libre, pero las decisiones pueden ser incorrectas o de baja confianza; el campo `confidence` debe usarse para filtrar.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar las dependencias del proyecto Connect Tycoon.
- Madurez: cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Sin datos de arquitectura ni de parámetros: dificulta la reproducibilidad y la estimación de costes de entrenamiento.
- No apto como sustituto de un LLM: no genera texto, no hace tool calling ni razonamiento abierto; solo responde a preguntas JEV tipadas dentro del simulador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/appssy3/connectailab-rl-solo-build-h-v2-teacher
- Repositorio Connect Tycoon: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab (entrenamiento): https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Hub del desarrollador (SOLO BUILD-H): https://appssy3-art.github.io/solo-build-studio/
- Canal de YouTube SOLO BUILD: https://www.youtube.com/@solobuild.studio
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de reinforcement learning de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI (ezerai): https://www.ezerai.xyz
