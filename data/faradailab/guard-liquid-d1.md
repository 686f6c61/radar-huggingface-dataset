# faradailab/guard-liquid-d1

## Resumen

FaradAiGuard Liquid d1-3B (identificador `faradailab/guard-liquid-d1`) es un modelo de decisión de seguridad (SLM, *small language model*) publicado por Farad AI Lab sobre el modelo base `LiquidAI/d1-3B-GGUF`. Su propósito no es la generación de texto abierta, sino la clasificación binaria de peticiones y contenidos como `ALLOW` o `BLOCK` con una puntuación de riesgo entre 0.0 y 1.0, una justificación técnica breve y, opcionalmente, un identificador CWE. Está empaquetado en formato GGUF con una gramática GBNF estricta que fuerza la salida a un esquema JSON validado.

El modelo se distribuye como parte de la iniciativa FaradAiGuard Security SLM Factory y está pensado para ejecutarse en local mediante Ollama con un `Modelfile` preconfigurado que incluye el *system prompt* y la gramática de salida. El repositorio ocupa 1.7 GB y contiene pesos cuantizados en Q4_K_M, lo que lo hace desplegable en hardware de consumo.

La relevancia actual del modelo radica en su enfoque de "Root Intent Isolation" y *single-forward-pass threat scoring*: en lugar de un pipeline multi-etapa de moderación, propone una única pasada de inferencia no autorregresiva sobre el modelo base Liquid d1 para emitir la decisión. Los datos disponibles son escasos (31 descargas, sin benchmarks publicados, sin idiomas declarados), por lo que esta ficha debe leerse como una evaluación preliminar del artefacto y no como una validación empírica de su eficacia como filtro de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base LiquidAI/d1-3B; el autor lo describe como "non-autoregressive decision model") |
| Parametros totales | 2.697.198.592 (~2,7 mil millones) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (único archivo publicado: `guard-liquid-d1.Q4_K_M.gguf`) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo deriva de `LiquidAI/d1-3B-GGUF`, un modelo de la familia Liquid AI d1 de aproximadamente 2,7 mil millones de parámetros. La model card del autor describe el resultado como un "non-autoregressive decision model" con "Root Intent Isolation" y "single-forward-pass threat scoring", pero no proporciona detalles sobre la arquitectura interna del modelo base (si es transformer, híbrido o SSM), ni sobre el proceso de ajuste aplicado para convertirlo en clasificador de seguridad.

No se han publicado datos sobre el corpus de entrenamiento, el número de tokens utilizados, la composición del dataset de políticas de seguridad, ni si hubo fases de RLHF, DPO o ajuste supervisado específico. Tampoco se documenta el mecanismo exacto de "Root Intent Isolation" ni cómo se obtiene la puntuación de riesgo a partir de una única pasada. La innovación declarada es de producto (salida JSON forzada por gramática GBNF y distribución lista para Ollama) más que arquitectónica, y no está respaldada por documentación técnica en la información disponible.

## Capacidades

- Clasificación de seguridad binaria: emite `verdict` con valores `ALLOW` o `BLOCK`.
- Puntuación de riesgo continua: campo `risk_score` entre 0.0 y 1.0.
- Justificación técnica: campo `reason` con una explicación breve en lenguaje natural.
- Etiquetado CWE: campo `cwe` con un identificador CWE o cadena vacía.
- Salida JSON estricta garantizada mediante gramática GBNF definida en el `Modelfile`.
- Ejecución local vía Ollama con `ollama run hf.co/faradailab/guard-liquid-d1:latest`.
- Compatibilidad declarada con *endpoints* (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión, audio ni modo *thinking*.
- Capacidades multilingües: no disponibles (no se declara ningún idioma).

## Casos de uso

- Filtrado de prompts en un gateway de LLM: el modelo se interpone entre la aplicación y el modelo generativo, recibe la petición del usuario y devuelve `ALLOW` o `BLOCK` con `risk_score`; la integración se hace por HTTP contra un endpoint compatible o mediante la CLI de Ollama.
- Moderación de contenido generado: aplicar el mismo esquema JSON a las respuestas de un asistente antes de mostrarlas al usuario, usando el campo `reason` para registrar la justificación en los *logs* de auditoría.
- Enrutado de peticiones sospechosas: usar `risk_score` como umbral configurable para derivar peticiones a revisión humana o a un pipeline de análisis más profundo, en lugar de un bloqueo binario rígido.
- Detección de intentos de *prompt injection*: el campo `cwe` permite mapear la decisión a taxonomías de vulnerabilidad y alimentar paneles de seguridad con categorías estandarizadas.
- Clasificación de tickets de soporte: preetiquetar solicitudes entrantes como seguras o sospechosas antes de que lleguen a un agente o a un modelo mayor, reduciendo coste de inferencia en el modelo grande.
- Despliegue en entornos con requisitos de soberanía de datos: al ejecutarse en local con Ollama y un archivo GGUF de 1.7 GB, el contenido sensible no sale del perímetro del cliente.
- Prototipado rápido de políticas: al estar la gramática y el *system prompt* encapsulados en el `Modelfile`, se puede versionar y sustituir la política de decisión sin reentrenar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa aproximadamente 1.7 GB, por lo que se necesita del orden de 2 a 3 GB de VRAM o memoria unificada para cargar pesos y contexto.
- GPU recomendadas: no hay recomendaciones publicadas por el autor; por tamaño, cualquier GPU con 4 GB o más de VRAM debería poder cargar el modelo cuantizado.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 4-6 GB o más (por ejemplo, GTX 1650, RTX 3050, RTX 4060) y en equipos Apple Silicon con memoria unificada.
- Opciones de despliegue: Ollama es la vía documentada oficialmente; al ser GGUF, también es compatible con llama.cpp y, en principio, con servidores que acepten GGUF.
- Latencia y throughput estimados: no disponibles. El autor afirma un "single-forward-pass", pero no publica mediciones de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| faradailab/guard-liquid-d1 | ~2,7 B | No disponible | GGUF Q4_K_M | Apache 2.0 | Decisión de seguridad con JSON estricto |
| LiquidAI/d1-3B | ~3 B (familia d1) | No disponible | GGUF | No disponible en esta ficha | Modelo base de propósito general |
| Alternativas de moderación tipo Llama Guard | No disponible | No disponible | No disponible | No disponible | Clasificación de seguridad |

No se dispone de datos de benchmarks ni de especificaciones verificadas de las alternativas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de precisión, tasa de falsos positivos ni de falsos negativos en tareas de moderación.
- Sin documentación del dataset de ajuste: se desconoce qué políticas de seguridad se han cubierto y cuáles quedan fuera, lo que impide evaluar la cobertura real.
- Idiomas no declarados: no se puede asumir soporte multilingüe; es probable que el comportamiento en castellano no esté validado.
- Contexto no especificado: se desconoce la ventana máxima, lo que limita el diseño de integraciones con documentos largos.
- Riesgo de alucinación en el campo `reason`: aunque el JSON está forzado por gramática, la justificación textual puede ser plausible pero incorrecta; no debe usarse como evidencia forense sin verificación.
- Sesgos desconocidos: al no publicarse la composición del corpus, no es posible auditar sesgos culturales, lingüísticos o de dominio.
- Madurez del artefacto: 31 descargas y cero *likes* en el momento de la consulta; el proyecto es muy reciente (creado en octubre de 2026) y no hay señales de adopción.
- Dependencia del modelo base: cualquier limitación o cambio de licencia en `LiquidAI/d1-3B` afecta a este derivado, aunque la licencia declarada aquí es Apache 2.0.
- Uso en producción: no debe desplegarse como único mecanismo de seguridad sin una capa de validación humana y sin pruebas propias sobre el tráfico real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/faradailab/guard-liquid-d1
- Modelo base: https://huggingface.co/LiquidAI/d1-3B-GGUF
- Repositorio del proyecto FaradAiGuard: https://github.com/kurtfi/FaradAiGuard
